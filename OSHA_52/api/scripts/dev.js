// Local development API: the real app on an in-memory Postgres (PGlite), so the web app can run without Railway.
//   node api/scripts/dev.js           API on http://localhost:8787, admin seeded
//   node api/scripts/dev.js --demo    also creates demo trainees in every week state (for screenshots and UI work)
// Never used in production (PGlite is a dev dependency).
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { PGlite } = require('@electric-sql/pglite');
const { loadConfig } = require('../src/config');
const { loadContent } = require('../src/content');
const { createApp } = require('../src/app');
const { migrate } = require('../src/migrate');
const { seedAdmin } = require('../src/seed-admin');
const A = require('../src/auth');

const PORT = Number(process.env.PORT) || 8787;
const ADMIN = { ADMIN_NAME: 'Dev Admin', ADMIN_EMAIL: 'admin@example.com', ADMIN_INITIAL_PASSWORD: 'dev-admin-pass-1' };

function pgliteDb(pg) {
  const run = (exec, t, p) => (p === undefined && /;\s*\S/.test(t) ? exec.exec(t).then(r => r[r.length - 1]) : exec.query(t, p || []));
  return {
    query: (t, p) => run(pg, t, p),
    tx: fn => pg.transaction(tx => fn({ query: (t, p) => run(tx, t, p) })),
    close: () => pg.close(),
  };
}

async function main() {
  const pg = new PGlite();
  await pg.waitReady;
  const db = pgliteDb(pg);
  await migrate(db, { log: () => {} });
  await seedAdmin(db, ADMIN, { log: () => {} });
  const cfg = loadConfig({
    ...process.env,
    JWT_SECRET: crypto.randomBytes(32).toString('hex'),
    CORS_ORIGINS: process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:4173',
    APP_BASE_URL: process.env.APP_BASE_URL || 'http://localhost:5173',
    LOGIN_RATE_LIMIT_PER_MINUTE: '1000',
    TRUST_PROXY: 'false',
  });
  const content = loadContent();
  const server = createApp({ cfg, db, content }).listen(PORT);
  await new Promise(r => server.once('listening', r));
  const base = `http://localhost:${PORT}`;
  console.log(`Dev API on ${base} (in-memory; data is lost on exit). Admin: ${ADMIN.ADMIN_EMAIL} / ${ADMIN.ADMIN_INITIAL_PASSWORD}`);
  if (process.argv.includes('--demo')) await seedDemo(base, db, content);
}

// Demo trainees, each with the same week states in the 1926 track:
//   W1 passed 3 days ago; W2 failed once today (next attempt tomorrow); W3 locked (two fails);
//   W4 passed, then a practice attempt; W5 failed yesterday (can retake today); later weeks not started.
async function seedDemo(base, db, content) {
  const call = async (method, path, { token, body } = {}) => {
    const res = await fetch(base + path, { method, headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) }, body: body ? JSON.stringify(body) : undefined });
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error(`${method} ${path}: ${res.status} ${JSON.stringify(data)}`);
    return data;
  };
  const take = async (token, track, week, nCorrect) => {
    const t = await call('GET', `/tracks/${track}/weeks/${week}/test`, { token });
    const lay = jwt.decode(t.attemptToken);
    const w = content.getWeek(track, week);
    const answers = lay.q.map((qi, i) => {
      const right = lay.o[i].indexOf(w.test[qi].correctAnswer);
      return i < nCorrect ? right : (right + 1) % lay.o[i].length;
    });
    const r = await call('POST', `/tracks/${track}/weeks/${week}/attempts`, { token, body: { answers, attemptToken: t.attemptToken } });
    return r.attemptId;
  };
  const daysAgo = (id, days) => db.query(`UPDATE attempts SET submitted_at = submitted_at - ($2 || ' days')::interval WHERE id = $1`, [id, String(days)]);

  for (const [name, pin] of [['Alex Rivera', '1234'], ['Sam Patel', '5678']]) {
    const reg = await call('POST', '/auth/trainee/register', { body: { name, pin } });
    await db.query(`UPDATE trainees SET approval = 'approved' WHERE id = $1`, [reg.trainee.id]);
    const { token } = await call('POST', '/auth/trainee/login', { body: { name, pin } });
    await daysAgo(await take(token, '1926', 1, 9), 3);
    await daysAgo(await take(token, '1926', 3, 4), 2);
    await take(token, '1926', 3, 5);
    await take(token, '1926', 2, 6);
    await daysAgo(await take(token, '1926', 4, 10), 2);
    await take(token, '1926', 4, 7);
    await daysAgo(await take(token, '1926', 5, 7), 1);
    await daysAgo(await take(token, '1910', 1, 10), 5);
  }
  await call('POST', '/auth/trainee/register', { body: { name: 'Jordan Lee', pin: '2468' } }); // left pending

  // More trainees with weeks of history, for the reviewer dashboard. Each step: [track, week, correct answers, days ago].
  const at = async (id, days) => db.query(`UPDATE attempts SET submitted_at = now() - ($2 || ' days')::interval - (random() * interval '6 hours') WHERE id = $1`, [id, String(days)]);
  const people = {
    'Maria Gonzalez': [...[1, 2, 3, 4, 5, 6, 7, 8].map((w, i) => ['1926', w, 9 + (i % 2), 40 - i * 5]), ['1926', 9, 7, 2]],
    'Dwayne Brooks': [['1926', 1, 8, 20], ['1926', 2, 9, 15], ['1926', 3, 8, 10], ['1926', 4, 4, 6], ['1926', 4, 6, 3]],
    'Priya Shah': [...[1, 2, 3, 4, 5, 6].map((w, i) => ['1910', w, 9 + (i % 3 === 0 ? 1 : 0), 30 - i * 5]), ['1910', 7, 6, 1]],
    'Tom Nguyen': [['1926', 1, 10, 12], ['1926', 2, 5, 9], ['1926', 2, 8, 8], ['1926', 1, 9, 2]],
    'Lena Fischer': [['1910', 1, 7, 6], ['1910', 1, 9, 5], ['1910', 2, 10, 1]],
    "Kevin O'Brien": [['1926', 1, 8, 60]],
  };
  for (const [name, steps] of Object.entries(people)) {
    const reg = await call('POST', '/auth/trainee/register', { body: { name, pin: '1111' } });
    await db.query(`UPDATE trainees SET approval = 'approved', created_at = now() - interval '70 days' WHERE id = $1`, [reg.trainee.id]);
    const { token } = await call('POST', '/auth/trainee/login', { body: { name, pin: '1111' } });
    for (const [track, week, n, days] of steps) await at(await take(token, track, week, n), days);
  }
  await db.query(`UPDATE trainees SET active = FALSE WHERE name = $1`, ["Kevin O'Brien"]);
  for (const name of ['Alex Riviera', 'Chris Ortega']) await call('POST', '/auth/trainee/register', { body: { name, pin: '3333' } });

  // Reviewers: one active, one invited (link outstanding), one revoked.
  const admin = (await db.query('SELECT id FROM staff_users WHERE role = $1', ['admin'])).rows[0].id;
  await db.query(`INSERT INTO staff_users (name, email, role, status, password_hash, must_change_password, created_by, created_at)
                  VALUES ('Rita Alvarez', 'rita@example.com', 'reviewer', 'active', $1, FALSE, $2, now() - interval '45 days'),
                         ('Pat Morgan', 'pat@example.com', 'reviewer', 'invited', NULL, FALSE, $2, now() - interval '2 days'),
                         ('Former Reviewer', 'former@example.com', 'reviewer', 'revoked', NULL, FALSE, $2, now() - interval '200 days')`,
    [await A.hashSecret('reviewer-pass-1'), admin]);
  const pat = (await db.query(`SELECT id FROM staff_users WHERE email = 'pat@example.com'`)).rows[0].id;
  await db.query(`INSERT INTO invites (staff_user_id, token_hash, expires_at, created_by) VALUES ($1, $2, now() + interval '5 days', $3)`, [pat, A.sha256('demo-invite-token-for-pat-morgan-0001'), admin]);
  console.log('Demo trainees: Alex Rivera / 1234, Sam Patel / 5678 (approved); Jordan Lee / 2468 (pending approval); 6 more with history (PIN 1111); 2 more pending.');
  console.log('Demo reviewer: rita@example.com / reviewer-pass-1. Demo invite link: /invite/demo-invite-token-for-pat-morgan-0001');
}

main().catch(err => { console.error(err); process.exit(1); });
