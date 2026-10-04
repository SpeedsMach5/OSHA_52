// Runs inside the Railway API container (private network to Postgres). Two modes:
//   setup <email> <password>   create a temporary admin for the end-to-end run; print the baseline
//   cleanup <startIso> <maxAuditId>   delete everything the run created; refuse if anything else appeared
const { Client } = require('/app/node_modules/pg');
const bcrypt = require('/app/node_modules/bcryptjs');
const [mode, a, b] = process.argv.slice(2);

(async () => {
  const c = new Client({ connectionString: process.env.DATABASE_URL });
  await c.connect();
  const counts = async () => {
    const o = {};
    for (const t of ['staff_users', 'invites', 'trainees', 'attempts', 'attempt_answers', 'week_unlocks', 'audit_log']) {
      o[t] = (await c.query(`SELECT COUNT(*)::int AS n FROM ${t}`)).rows[0].n;
    }
    return o;
  };

  if (mode === 'setup') {
    const before = await counts();
    const maxAudit = (await c.query('SELECT COALESCE(MAX(id), 0)::int AS m FROM audit_log')).rows[0].m;
    const start = (await c.query('SELECT now() AS t')).rows[0].t.toISOString();
    await c.query(
      `INSERT INTO staff_users (name, email, role, status, password_hash, must_change_password)
       VALUES ('E2E Temporary Admin', $1, 'admin', 'active', $2, FALSE)`, [a, await bcrypt.hash(b, 10)]);
    console.log(JSON.stringify({ start, maxAudit, before }));
  } else if (mode === 'cleanup') {
    const start = a, maxAudit = Number(b);
    await c.query('BEGIN');
    // Everything created during the run must look like test data; otherwise stop and report.
    const trainees = (await c.query('SELECT id, name FROM trainees WHERE created_at >= $1', [start])).rows;
    const staff = (await c.query('SELECT id, email FROM staff_users WHERE created_at >= $1', [start])).rows;
    const odd = [...trainees.filter(t => !t.name.startsWith('E2E Trainee ')), ...staff.filter(s => !s.email.endsWith('@example.invalid'))];
    if (odd.length) { await c.query('ROLLBACK'); console.log(JSON.stringify({ refused: 'rows that are not test data', odd })); process.exit(2); }
    const tIds = trainees.map(t => t.id), sIds = staff.map(s => s.id);
    const del = {};
    del.attempt_answers = (await c.query('DELETE FROM attempt_answers WHERE attempt_id IN (SELECT id FROM attempts WHERE trainee_id = ANY($1))', [tIds])).rowCount;
    del.attempts = (await c.query('DELETE FROM attempts WHERE trainee_id = ANY($1)', [tIds])).rowCount;
    del.week_unlocks = (await c.query('DELETE FROM week_unlocks WHERE trainee_id = ANY($1)', [tIds])).rowCount;
    del.trainees = (await c.query('DELETE FROM trainees WHERE id = ANY($1)', [tIds])).rowCount;
    del.invites = (await c.query('DELETE FROM invites WHERE staff_user_id = ANY($1) OR created_by = ANY($1)', [sIds])).rowCount;
    del.staff_created_by_links = (await c.query('UPDATE staff_users SET created_by = NULL WHERE created_by = ANY($1) AND NOT (id = ANY($1))', [sIds])).rowCount;
    del.staff_users = (await c.query('DELETE FROM staff_users WHERE id = ANY($1)', [sIds])).rowCount;
    del.audit_log = (await c.query('DELETE FROM audit_log WHERE id > $1', [maxAudit])).rowCount;
    await c.query('COMMIT');
    const after = await counts();
    const remainingStaff = (await c.query('SELECT id, name, email, role, status FROM staff_users ORDER BY id')).rows;
    const remainingAudit = (await c.query('SELECT id, action FROM audit_log ORDER BY id')).rows;
    console.log(JSON.stringify({ deleted: del, after, remainingStaff, remainingAudit }));
  } else {
    console.log('usage: setup <email> <password> | cleanup <startIso> <maxAuditId>');
  }
  await c.end();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
