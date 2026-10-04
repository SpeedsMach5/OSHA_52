// Creates the admin account from ADMIN_NAME, ADMIN_EMAIL and ADMIN_INITIAL_PASSWORD (Railway variables).
// Idempotent: if an account with that email already exists it is left untouched (never resets a changed password).
// The admin must change the initial password at first login.
const { hashSecret, validEmail, validPassword, MIN_PASSWORD_LENGTH } = require('./auth');

async function seedAdmin(db, env = process.env, { log = console.log } = {}) {
  const name = (env.ADMIN_NAME || '').trim();
  const email = (env.ADMIN_EMAIL || '').trim().toLowerCase();
  const password = env.ADMIN_INITIAL_PASSWORD || '';
  if (!name || !validEmail(email)) throw new Error('ADMIN_NAME and a valid ADMIN_EMAIL are required');
  const existing = await db.query('SELECT id FROM staff_users WHERE email = $1', [email]);
  if (existing.rows[0]) { log(`admin seed: ${email} already exists, left unchanged`); return { created: false }; }
  if (!validPassword(password)) throw new Error(`ADMIN_INITIAL_PASSWORD must be at least ${MIN_PASSWORD_LENGTH} characters`);
  const { rows } = await db.query(
    `INSERT INTO staff_users (name, email, role, password_hash, must_change_password, status)
     VALUES ($1, $2, 'admin', $3, TRUE, 'active') RETURNING id`, [name, email, await hashSecret(password)]);
  await db.query(`INSERT INTO audit_log (actor_type, action, target_type, target_id) VALUES ('system', 'admin_seeded', 'staff', $1)`, [rows[0].id]);
  log(`admin seed: created ${email} (must change password at first login)`);
  return { created: true, id: rows[0].id };
}

if (require.main === module) {
  const { loadConfig } = require('./config');
  const { createPgDb } = require('./db');
  const cfg = loadConfig();
  if (!cfg.databaseUrl) { console.error('DATABASE_URL is not set'); process.exit(1); }
  const db = createPgDb(cfg);
  seedAdmin(db).then(() => db.close()).catch(err => { console.error(err.message); process.exit(1); });
}

module.exports = { seedAdmin };
