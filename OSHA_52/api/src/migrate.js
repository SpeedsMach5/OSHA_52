// Applies migrations/*.sql in filename order, once each, inside a transaction per file.
// Runs as Railway's pre-deploy command, so the schema is current before the new API starts.
const fs = require('fs');
const path = require('path');

const MIGRATIONS_DIR = path.join(__dirname, '..', 'migrations');

async function migrate(db, { log = console.log } = {}) {
  await db.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
    name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())`);
  const files = fs.readdirSync(MIGRATIONS_DIR).filter(f => f.endsWith('.sql')).sort();
  const { rows } = await db.query('SELECT name FROM schema_migrations');
  const applied = new Set(rows.map(r => r.name));
  for (const file of files) {
    if (applied.has(file)) continue;
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
    await db.tx(async q => {
      await q.query(sql);
      await q.query('INSERT INTO schema_migrations (name) VALUES ($1)', [file]);
    });
    log(`migrated: ${file}`);
  }
  log('migrations up to date');
}

if (require.main === module) {
  const { loadConfig } = require('./config');
  const { createPgDb } = require('./db');
  const cfg = loadConfig();
  if (!cfg.databaseUrl) { console.error('DATABASE_URL is not set'); process.exit(1); }
  const db = createPgDb(cfg);
  // Advisory lock so two deploys can't migrate at the same time. Held on its own connection
  // for the whole run (a pool would lock and unlock on whichever connection is free).
  const { Client } = require('pg');
  const lock = new Client({ connectionString: cfg.databaseUrl, ssl: cfg.databaseSsl ? { rejectUnauthorized: false } : undefined });
  lock.connect()
    .then(() => lock.query('SELECT pg_advisory_lock(52052)'))
    .then(() => migrate(db))
    .then(() => lock.query('SELECT pg_advisory_unlock(52052)'))
    .then(() => Promise.all([lock.end(), db.close()]))
    .catch(err => { console.error(err); process.exit(1); });
}

module.exports = { migrate };
