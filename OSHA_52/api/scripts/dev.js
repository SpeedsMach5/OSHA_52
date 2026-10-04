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
  console.log('Demo trainees: Alex Rivera / 1234, Sam Patel / 5678 (approved); Jordan Lee / 2468 (pending approval)');
}

main().catch(err => { console.error(err); process.exit(1); });
