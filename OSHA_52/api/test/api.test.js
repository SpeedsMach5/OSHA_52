// End-to-end API tests against a real Postgres engine running in-process (PGlite), using the real migrations
// and the real Phase 1 content files. No external database is touched.
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { PGlite } = require('@electric-sql/pglite');
const { loadConfig, assertRuntimeConfig } = require('../src/config');
const { loadContent } = require('../src/content');
const { createApp } = require('../src/app');
const { migrate } = require('../src/migrate');
const { seedAdmin } = require('../src/seed-admin');

const ORIGIN = 'https://osha52.example.pages.dev';
let pg, db, server, base, content;

function pgliteDb(pg) {
  const run = (exec, t, p) => (p === undefined && /;\s*\S/.test(t) ? exec.exec(t).then(r => r[r.length - 1]) : exec.query(t, p || []));
  return {
    query: (t, p) => run(pg, t, p),
    tx: fn => pg.transaction(tx => fn({ query: (t, p) => run(tx, t, p) })),
    close: () => pg.close(),
  };
}

async function call(method, path, { token, body, origin } = {}) {
  const headers = { 'content-type': 'application/json' };
  if (token) headers.authorization = `Bearer ${token}`;
  if (origin) headers.origin = origin;
  const res = await fetch(base + path, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const text = await res.text();
  return { status: res.status, headers: res.headers, body: text ? JSON.parse(text) : null };
}

const answersFor = (track, week, nCorrect) => {
  const w = content.getWeek(track, week);
  return w.test.map((q, i) => (i < nCorrect ? q.correctAnswer : (q.correctAnswer + 1) % q.options.length));
};

before(async () => {
  pg = new PGlite();
  await pg.waitReady;
  db = pgliteDb(pg);
  await migrate(db, { log: () => {} });
  await seedAdmin(db, { ADMIN_NAME: 'Quentin Reynolds', ADMIN_EMAIL: 'Admin@Example.com', ADMIN_INITIAL_PASSWORD: 'initial-pass-123' }, { log: () => {} });
  const cfg = loadConfig({ JWT_SECRET: 'x'.repeat(40), CORS_ORIGINS: ORIGIN, APP_BASE_URL: ORIGIN, LOGIN_RATE_LIMIT_PER_MINUTE: '1000' });
  content = loadContent();
  server = createApp({ cfg, db, content }).listen(0);
  await new Promise(r => server.once('listening', r));
  base = `http://127.0.0.1:${server.address().port}`;
});

after(async () => { server?.close(); await db?.close(); });

test('migrations are idempotent and seed does not overwrite', async () => {
  await migrate(db, { log: () => {} });
  const again = await seedAdmin(db, { ADMIN_NAME: 'X', ADMIN_EMAIL: 'admin@example.com', ADMIN_INITIAL_PASSWORD: 'something-else-1' }, { log: () => {} });
  assert.equal(again.created, false);
});

test('health check', async () => {
  const r = await call('GET', '/health');
  assert.equal(r.status, 200);
});

test('content endpoints require authentication', async () => {
  assert.equal((await call('GET', '/tracks')).status, 401);
  assert.equal((await call('GET', '/tracks/1926/weeks/1/test')).status, 401);
});

test('CORS allows only the configured origin', async () => {
  const ok = await call('GET', '/health', { origin: ORIGIN });
  assert.equal(ok.headers.get('access-control-allow-origin'), ORIGIN);
  const bad = await call('GET', '/health', { origin: 'https://evil.example' });
  assert.equal(bad.headers.get('access-control-allow-origin'), null);
});

let trainee;
test('trainee registers with name + PIN; PIN is stored hashed', async () => {
  assert.equal((await call('POST', '/auth/trainee/register', { body: { name: 'Jo Smith', pin: '12a4' } })).status, 400);
  const r = await call('POST', '/auth/trainee/register', { body: { name: '  Jo   Smith ', pin: '4821' } });
  assert.equal(r.status, 201);
  trainee = r.body;
  assert.equal(trainee.trainee.name, 'Jo Smith');
  const { rows } = await db.query('SELECT pin_hash FROM trainees WHERE id = $1', [trainee.trainee.id]);
  assert.notEqual(rows[0].pin_hash, '4821');
  assert.match(rows[0].pin_hash, /^\$2[aby]\$/);
  assert.equal((await call('POST', '/auth/trainee/register', { body: { name: 'jo smith', pin: '1111' } })).status, 409);
});

test('trainee login (case-insensitive name), wrong PIN rejected', async () => {
  assert.equal((await call('POST', '/auth/trainee/login', { body: { name: 'JO SMITH', pin: '4821' } })).status, 200);
  assert.equal((await call('POST', '/auth/trainee/login', { body: { name: 'Jo Smith', pin: '0000' } })).status, 401);
  assert.equal((await call('POST', '/auth/trainee/login', { body: { name: 'Nobody Here', pin: '0000' } })).status, 401);
});

test('trainee locks after 5 wrong PINs', async () => {
  await call('POST', '/auth/trainee/register', { body: { name: 'Lock Test', pin: '1234' } });
  for (let i = 0; i < 5; i++) await call('POST', '/auth/trainee/login', { body: { name: 'Lock Test', pin: '9999' } });
  const r = await call('POST', '/auth/trainee/login', { body: { name: 'Lock Test', pin: '1234' } });
  assert.equal(r.status, 423);
});

test('parallel wrong PINs are all counted (no lost updates)', async () => {
  await call('POST', '/auth/trainee/register', { body: { name: 'Burst Test', pin: '1234' } });
  await Promise.all([1, 2, 3, 4].map(() => call('POST', '/auth/trainee/login', { body: { name: 'Burst Test', pin: '9999' } })));
  const { rows } = await db.query(`SELECT failed_logins FROM trainees WHERE name_key = 'burst test'`);
  assert.equal(rows[0].failed_logins, 4);
  await call('POST', '/auth/trainee/login', { body: { name: 'Burst Test', pin: '9999' } });
  assert.equal((await call('POST', '/auth/trainee/login', { body: { name: 'Burst Test', pin: '1234' } })).status, 423);
});

test('tracks and week list with progress', async () => {
  const t = await call('GET', '/tracks', { token: trainee.token });
  assert.equal(t.status, 200);
  const ids = t.body.tracks.map(x => x.id).sort();
  assert.deepEqual(ids, ['1910', '1926']);
  assert.equal(t.body.tracks.find(x => x.id === '1926').weekCount, 52);
  assert.equal(t.body.tracks.find(x => x.id === '1910').weekCount, 26);
  const w = await call('GET', '/tracks/1926/weeks', { token: trainee.token });
  assert.equal(w.body.weeks.length, 52);
  assert.deepEqual(w.body.weeks[0].progress, { attempts: 0, bestScore: null, passed: false, lastAttemptAt: null });
  assert.equal((await call('GET', '/tracks/9999/weeks', { token: trainee.token })).status, 404);
  for (const bad of ['01', '1.0', '0x1', '0']) {
    assert.equal((await call('GET', `/tracks/1926/weeks/${bad}/test`, { token: trainee.token })).status, 404, `week "${bad}" rejected`);
  }
});

test('week detail has topics and resources', async () => {
  const r = await call('GET', '/tracks/1910/weeks/2', { token: trainee.token });
  assert.equal(r.status, 200);
  assert.ok(r.body.topics.length > 0);
  assert.ok(r.body.resources.every(x => x.url && x.title));
});

test('test endpoint never exposes answers, explanations, or citations', async () => {
  for (const [track, week] of [['1926', 1], ['1926', 39], ['1910', 26]]) {
    const r = await call('GET', `/tracks/${track}/weeks/${week}/test`, { token: trainee.token });
    assert.equal(r.status, 200);
    const raw = JSON.stringify(r.body);
    assert.ok(!/"(correctAnswer|correctIndex|explanation|citation)"\s*:/.test(raw), `leaked fields in ${track} W${week}`);
    for (const q of r.body.questions) assert.deepEqual(Object.keys(q).sort(), ['index', 'options', 'question']);
  }
});

test('server-side grading: pass at 80%, fail below, every attempt kept', async () => {
  const total = content.getWeek('1926', 3).test.length; // 10 questions
  const fail = await call('POST', '/tracks/1926/weeks/3/attempts', { token: trainee.token, body: { answers: answersFor('1926', 3, 7) } });
  assert.equal(fail.status, 201);
  assert.equal(fail.body.correct, 7);
  assert.equal(fail.body.scorePct, 70);
  assert.equal(fail.body.passed, false);
  assert.equal(fail.body.results.length, total);
  assert.ok(fail.body.results.every(r => r.explanation && r.citation && Number.isInteger(r.correctIndex)));

  const pass = await call('POST', '/tracks/1926/weeks/3/attempts', { token: trainee.token, body: { answers: answersFor('1926', 3, 8) } });
  assert.equal(pass.body.scorePct, 80);
  assert.equal(pass.body.passed, true);

  const hist = await call('GET', '/me/attempts?track=1926', { token: trainee.token });
  assert.equal(hist.body.attempts.length, 2);
  const weeks = await call('GET', '/tracks/1926/weeks', { token: trainee.token });
  assert.deepEqual({ ...weeks.body.weeks[2].progress, lastAttemptAt: null }, { attempts: 2, bestScore: 80, passed: true, lastAttemptAt: null });

  const detail = await call('GET', `/me/attempts/${fail.body.attemptId}`, { token: trainee.token });
  assert.equal(detail.body.results.filter(r => r.isCorrect).length, 7);
  assert.equal(detail.body.contentChanged, false);
  const { rows } = await db.query('SELECT COUNT(*)::int AS n FROM attempt_answers WHERE attempt_id = $1', [fail.body.attemptId]);
  assert.equal(rows[0].n, total);
});

test('grading rejects incomplete or out-of-range answers; client cannot set the score', async () => {
  const n = content.getWeek('1910', 1).test.length;
  assert.equal((await call('POST', '/tracks/1910/weeks/1/attempts', { token: trainee.token, body: { answers: [0, 1] } })).status, 400);
  assert.equal((await call('POST', '/tracks/1910/weeks/1/attempts', { token: trainee.token, body: { answers: Array(n).fill(7) } })).status, 400);
  const r = await call('POST', '/tracks/1910/weeks/1/attempts', { token: trainee.token, body: { answers: answersFor('1910', 1, 0), scorePct: 100, passed: true } });
  assert.equal(r.body.passed, false);
  assert.equal(r.body.correct, 0);
});

let adminToken;
test('admin first login must change password before doing anything else', async () => {
  assert.equal((await call('POST', '/auth/staff/login', { body: { email: 'admin@example.com', password: 'wrong-password' } })).status, 401);
  const r = await call('POST', '/auth/staff/login', { body: { email: 'ADMIN@example.com', password: 'initial-pass-123' } });
  assert.equal(r.status, 200);
  assert.equal(r.body.user.mustChangePassword, true);
  assert.equal(r.body.user.role, 'admin');
  const blocked = await call('GET', '/admin/reviewers', { token: r.body.token });
  assert.equal(blocked.status, 403);
  assert.equal(blocked.body.error, 'password_change_required');
  assert.equal((await call('GET', '/tracks', { token: r.body.token })).status, 403);
  assert.equal((await call('POST', '/auth/staff/change-password', { token: r.body.token, body: { currentPassword: 'initial-pass-123', newPassword: 'short' } })).status, 400);
  const ch = await call('POST', '/auth/staff/change-password', { token: r.body.token, body: { currentPassword: 'initial-pass-123', newPassword: 'a-much-better-pass-456' } });
  assert.equal(ch.status, 200);
  assert.equal(ch.body.user.mustChangePassword, false);
  assert.equal((await call('GET', '/admin/reviewers', { token: r.body.token })).status, 401, 'old token invalid after password change');
  adminToken = ch.body.token;
  assert.equal((await call('GET', '/admin/reviewers', { token: adminToken })).status, 200);
});

test('trainee cannot reach staff or admin routes', async () => {
  assert.equal((await call('GET', '/staff/trainees', { token: trainee.token })).status, 403);
  assert.equal((await call('POST', '/admin/reviewers/invite', { token: trainee.token, body: { name: 'X Y', email: 'x@y.com' } })).status, 403);
});

let reviewerToken, reviewerId;
test('reviewer invite: one-time link, sets password, cannot be reused', async () => {
  const inv = await call('POST', '/admin/reviewers/invite', { token: adminToken, body: { name: 'Rita Reviewer', email: 'Rita@Example.com' } });
  assert.equal(inv.status, 201);
  assert.ok(inv.body.inviteUrl.startsWith(`${ORIGIN}/invite/`));
  reviewerId = inv.body.reviewerId;
  const token = inv.body.inviteToken;
  assert.equal((await call('POST', '/auth/staff/login', { body: { email: 'rita@example.com', password: 'anything-123' } })).status, 401, 'cannot log in before accepting');
  const info = await call('GET', `/auth/invite/${token}`);
  assert.equal(info.body.email, 'rita@example.com');
  const acc = await call('POST', '/auth/invite/accept', { body: { token, password: 'reviewer-pass-789' } });
  assert.equal(acc.status, 200);
  assert.equal(acc.body.user.role, 'reviewer');
  assert.equal((await call('POST', '/auth/invite/accept', { body: { token, password: 'another-pass-000' } })).status, 404, 'link expires after use');
  const login = await call('POST', '/auth/staff/login', { body: { email: 'rita@example.com', password: 'reviewer-pass-789' } });
  assert.equal(login.status, 200);
  reviewerToken = login.body.token;
  assert.equal((await call('GET', '/admin/reviewers', { token: reviewerToken })).status, 403, 'reviewer is not admin');
  assert.equal((await call('POST', '/admin/reviewers/invite', { token: adminToken, body: { name: 'Rita Again', email: 'rita@example.com' } })).status, 409);
});

test('expired invite links are rejected', async () => {
  const inv = await call('POST', '/admin/reviewers/invite', { token: adminToken, body: { name: 'Late Larry', email: 'larry@example.com' } });
  await db.query(`UPDATE invites SET expires_at = now() - interval '1 minute' WHERE staff_user_id = $1`, [inv.body.reviewerId]);
  assert.equal((await call('POST', '/auth/invite/accept', { body: { token: inv.body.inviteToken, password: 'larry-pass-1234' } })).status, 410);
  const re = await call('POST', `/admin/reviewers/${inv.body.reviewerId}/reinvite`, { token: adminToken });
  assert.equal(re.status, 201);
  assert.equal((await call('POST', '/auth/invite/accept', { body: { token: re.body.inviteToken, password: 'larry-pass-1234' } })).status, 200);
});

test('reviewer resets a trainee PIN: old sessions end, trainee sets a new PIN at next login', async () => {
  const list = await call('GET', '/staff/trainees', { token: reviewerToken });
  const jo = list.body.trainees.find(t => t.name === 'Jo Smith');
  assert.equal(jo.attempts, 3);
  const r = await call('POST', `/staff/trainees/${jo.id}/reset-pin`, { token: reviewerToken });
  assert.equal(r.status, 200);
  assert.equal((await call('GET', '/tracks', { token: trainee.token })).status, 401, 'old trainee token invalidated');
  const login = await call('POST', '/auth/trainee/login', { body: { name: 'Jo Smith', pin: '7777' } });
  assert.equal(login.status, 200);
  assert.equal(login.body.pinSet, true);
  assert.equal((await call('POST', '/auth/trainee/login', { body: { name: 'Jo Smith', pin: '4821' } })).status, 401, 'old PIN no longer works');
  trainee = login.body;
  const { rows } = await db.query(`SELECT COUNT(*)::int AS n FROM audit_log WHERE action = 'trainee_pin_reset'`);
  assert.equal(rows[0].n, 1);
});

test('admin can reset PINs; reviewer cannot deactivate; admin deactivates and reactivates', async () => {
  const jo = (await call('GET', '/staff/trainees', { token: adminToken })).body.trainees.find(t => t.name === 'Jo Smith');
  assert.equal((await call('POST', `/admin/trainees/${jo.id}/deactivate`, { token: reviewerToken })).status, 403);
  assert.equal((await call('POST', `/admin/trainees/${jo.id}/deactivate`, { token: adminToken })).status, 200);
  assert.equal((await call('POST', '/auth/trainee/login', { body: { name: 'Jo Smith', pin: '7777' } })).status, 403);
  assert.equal((await call('POST', `/admin/trainees/${jo.id}/reactivate`, { token: adminToken })).status, 200);
  assert.equal((await call('POST', '/auth/trainee/login', { body: { name: 'Jo Smith', pin: '7777' } })).status, 200);
  assert.equal((await call('POST', `/staff/trainees/${jo.id}/reset-pin`, { token: adminToken })).status, 200);
});

test('revoked reviewer is locked out immediately', async () => {
  assert.equal((await call('POST', `/admin/reviewers/${reviewerId}/revoke`, { token: adminToken })).status, 200);
  assert.equal((await call('GET', '/staff/trainees', { token: reviewerToken })).status, 401);
  assert.equal((await call('POST', '/auth/staff/login', { body: { email: 'rita@example.com', password: 'reviewer-pass-789' } })).status, 401);
});

test('unknown routes and bad ids return 404', async () => {
  assert.equal((await call('GET', '/nope')).status, 404);
  assert.equal((await call('POST', '/staff/trainees/abc/reset-pin', { token: adminToken })).status, 404);
});

test('invalid numeric configuration is rejected at startup', () => {
  const ok = { DATABASE_URL: 'postgres://x', JWT_SECRET: 'x'.repeat(40) };
  assert.doesNotThrow(() => assertRuntimeConfig(loadConfig(ok)));
  assert.throws(() => assertRuntimeConfig(loadConfig({ ...ok, PASS_MARK: 'abc' })), /PASS_MARK/);
  assert.throws(() => assertRuntimeConfig(loadConfig({ ...ok, INVITE_TTL_HOURS: 'x' })), /INVITE_TTL_HOURS/);
});
