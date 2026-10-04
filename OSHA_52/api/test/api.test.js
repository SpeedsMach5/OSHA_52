// End-to-end API tests against a real Postgres engine running in-process (PGlite), using the real migrations
// and the real Phase 1 content files. No external database is touched.
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { PGlite } = require('@electric-sql/pglite');
const jwt = require('jsonwebtoken');
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

// Fetches a (shuffled) test and builds answers in displayed order: the first nCorrect displayed questions right, the rest wrong.
async function takeTest(token, track, week, nCorrect) {
  const t = await call('GET', `/tracks/${track}/weeks/${week}/test`, { token });
  const lay = jwt.decode(t.body.attemptToken);
  const w = content.getWeek(track, week);
  const answers = lay.q.map((qi, i) => {
    const right = lay.o[i].indexOf(w.test[qi].correctAnswer);
    return i < nCorrect ? right : (right + 1) % lay.o[i].length;
  });
  return { answers, attemptToken: t.body.attemptToken, test: t.body, lay };
}
const submit = (token, track, week, body) => call('POST', `/tracks/${track}/weeks/${week}/attempts`, { token, body });

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
    // The attempt token only carries the shuffled order, never the answer key.
    assert.deepEqual(Object.keys(jwt.decode(r.body.attemptToken)).sort(), ['exp', 'iat', 'lid', 'o', 'q', 'sub', 't', 'typ', 'v', 'w']);
  }
});

test('question and option order is shuffled on every attempt', async () => {
  const a = await call('GET', '/tracks/1926/weeks/5/test', { token: trainee.token });
  const b = await call('GET', '/tracks/1926/weeks/5/test', { token: trainee.token });
  const sig = r => r.body.questions.map(q => q.question + '|' + q.options.join('|')).join('||');
  assert.notEqual(sig(a), sig(b), 'two fetches give different orders');
  const w = content.getWeek('1926', 5);
  const sorted = qs => qs.map(q => q.question + '|' + [...q.options].sort().join('|')).sort();
  assert.deepEqual(sorted(a.body.questions), sorted(w.test), 'same questions and options, only reordered');
});

test('server-side grading: pass at 80%, fail below, every attempt kept', async () => {
  const total = content.getWeek('1926', 3).test.length; // 10 questions
  const f = await takeTest(trainee.token, '1926', 3, 7);
  const fail = await submit(trainee.token, '1926', 3, { answers: f.answers, attemptToken: f.attemptToken });
  assert.equal(fail.status, 201);
  assert.equal(fail.body.correct, 7);
  assert.equal(fail.body.scorePct, 70);
  assert.equal(fail.body.passed, false);
  assert.equal(fail.body.results.length, total);
  // Fail: missed questions get their citation; no correct option or explanation anywhere.
  assert.ok(fail.body.results.every(r => r.correctIndex === undefined && r.explanation === undefined));
  assert.ok(fail.body.results.every(r => (r.isCorrect ? r.citation === undefined : !!r.citation)));
  assert.equal(fail.body.results.filter(r => !r.isCorrect).length, 3);
  assert.deepEqual(fail.body.results.map(r => r.question), f.test.questions.map(q => q.question), 'results in displayed order');

  const p = await takeTest(trainee.token, '1926', 3, 8);
  const pass = await submit(trainee.token, '1926', 3, { answers: p.answers, attemptToken: p.attemptToken });
  assert.equal(pass.body.scorePct, 80);
  assert.equal(pass.body.passed, true);
  // Pass: everything shown, in displayed positions.
  const w3 = content.getWeek('1926', 3);
  for (const r of pass.body.results) {
    assert.ok(r.explanation && r.citation && Number.isInteger(r.correctIndex));
    const orig = w3.test.find(q => q.question === r.question);
    assert.equal(r.options[r.correctIndex], orig.options[orig.correctAnswer]);
    assert.equal(r.isCorrect, r.selectedIndex === r.correctIndex);
  }

  const hist = await call('GET', '/me/attempts?track=1926', { token: trainee.token });
  assert.equal(hist.body.attempts.length, 2);
  const weeks = await call('GET', '/tracks/1926/weeks', { token: trainee.token });
  assert.deepEqual({ ...weeks.body.weeks[2].progress, lastAttemptAt: null }, { attempts: 2, bestScore: 80, passed: true, lastAttemptAt: null });

  const detail = await call('GET', `/me/attempts/${fail.body.attemptId}`, { token: trainee.token });
  assert.equal(detail.body.results.filter(r => r.isCorrect).length, 7);
  assert.equal(detail.body.contentChanged, false);
  assert.ok(detail.body.results.every(r => r.correctIndex === undefined && r.explanation === undefined), 'failed attempt review hides answers');
  assert.deepEqual(detail.body.results.map(r => r.options), fail.body.results.map(r => r.options), 'review keeps the order the trainee saw');
  const passDetail = await call('GET', `/me/attempts/${pass.body.attemptId}`, { token: trainee.token });
  assert.deepEqual(passDetail.body.results, pass.body.results, 'passed attempt review matches the submission result');
  const { rows } = await db.query('SELECT COUNT(*)::int AS n FROM attempt_answers WHERE attempt_id = $1', [fail.body.attemptId]);
  assert.equal(rows[0].n, total);
});

test('grading rejects incomplete or out-of-range answers; client cannot set the score', async () => {
  const n = content.getWeek('1910', 1).test.length;
  const t = await takeTest(trainee.token, '1910', 1, 0);
  assert.equal((await submit(trainee.token, '1910', 1, { answers: [0, 1], attemptToken: t.attemptToken })).status, 400);
  assert.equal((await submit(trainee.token, '1910', 1, { answers: Array(n).fill(7), attemptToken: t.attemptToken })).status, 400);
  assert.equal((await submit(trainee.token, '1910', 1, { answers: t.answers })).status, 400, 'attempt token required');
  assert.equal((await submit(trainee.token, '1910', 1, { answers: t.answers, attemptToken: t.attemptToken + 'x' })).status, 400, 'tampered token rejected');
  assert.equal((await submit(trainee.token, '1910', 2, { answers: t.answers, attemptToken: t.attemptToken })).status, 400, 'token is for another week');
  const r = await submit(trainee.token, '1910', 1, { answers: t.answers, attemptToken: t.attemptToken, scorePct: 100, passed: true });
  assert.equal(r.body.passed, false);
  assert.equal(r.body.correct, 0);
  const again = await submit(trainee.token, '1910', 1, { answers: t.answers, attemptToken: t.attemptToken });
  assert.equal(again.status, 409, 'a served test can be submitted only once');
  assert.equal(again.body.error, 'already_submitted');
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

test('reviewer resets a trainee PIN with a one-time code; trainee enters the code and sets a new PIN', async () => {
  const list = await call('GET', '/staff/trainees', { token: reviewerToken });
  const jo = list.body.trainees.find(t => t.name === 'Jo Smith');
  assert.equal(jo.attempts, 3);
  const r = await call('POST', `/staff/trainees/${jo.id}/reset-pin`, { token: reviewerToken });
  assert.equal(r.status, 200);
  assert.match(r.body.code, /^\d{6}$/);
  const hours = (new Date(r.body.expiresAt) - Date.now()) / 3600e3;
  assert.ok(hours > 23.9 && hours <= 24, 'code expires in 24 hours');
  const { rows: stored } = await db.query('SELECT reset_code_hash FROM trainees WHERE id = $1', [jo.id]);
  assert.ok(stored[0].reset_code_hash.startsWith('$2') && !stored[0].reset_code_hash.includes(r.body.code), 'code stored hashed');
  assert.equal((await call('GET', '/tracks', { token: trainee.token })).status, 401, 'old trainee token invalidated');
  const oldPin = await call('POST', '/auth/trainee/login', { body: { name: 'Jo Smith', pin: '4821' } });
  assert.equal(oldPin.status, 409, 'old PIN no longer works; the trainee is sent to the code step');
  assert.equal(oldPin.body.error, 'pin_reset_required');
  assert.equal((await call('POST', '/auth/trainee/login', { body: { name: 'Jo Smith', pin: '7777' } })).status, 409, 'a new PIN cannot be set without the code');
  const wrong = r.body.code === '000000' ? '111111' : '000000';
  assert.equal((await call('POST', '/auth/trainee/reset-pin', { body: { name: 'Jo Smith', code: wrong, pin: '7777' } })).status, 401);
  const set = await call('POST', '/auth/trainee/reset-pin', { body: { name: 'jo smith', code: r.body.code, pin: '7777' } });
  assert.equal(set.status, 200);
  assert.equal(set.body.pinSet, true);
  assert.equal((await call('POST', '/auth/trainee/reset-pin', { body: { name: 'Jo Smith', code: r.body.code, pin: '1212' } })).status, 401, 'code works once');
  assert.equal((await call('POST', '/auth/trainee/login', { body: { name: 'Jo Smith', pin: '4821' } })).status, 401, 'old PIN no longer works');
  const login = await call('POST', '/auth/trainee/login', { body: { name: 'Jo Smith', pin: '7777' } });
  assert.equal(login.status, 200);
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

test('expired PIN reset codes are rejected', async () => {
  await call('POST', '/auth/trainee/register', { body: { name: 'Exp Code', pin: '1234' } });
  const id = (await call('GET', '/staff/trainees', { token: adminToken })).body.trainees.find(t => t.name === 'Exp Code').id;
  const r = await call('POST', `/staff/trainees/${id}/reset-pin`, { token: adminToken });
  await db.query(`UPDATE trainees SET reset_code_expires_at = now() - interval '1 minute' WHERE id = $1`, [id]);
  const x = await call('POST', '/auth/trainee/reset-pin', { body: { name: 'Exp Code', code: r.body.code, pin: '5678' } });
  assert.equal(x.status, 410);
  assert.equal(x.body.error, 'reset_code_expired');
});

test('admin resets a reviewer password with a one-time link', async () => {
  const inv = await call('POST', '/admin/reviewers/invite', { token: adminToken, body: { name: 'Pat Reviewer', email: 'pat@example.com' } });
  const patId = inv.body.reviewerId;
  assert.equal((await call('POST', `/admin/reviewers/${patId}/reset-password`, { token: adminToken })).status, 409, 'not for invited reviewers');
  await call('POST', '/auth/invite/accept', { body: { token: inv.body.inviteToken, password: 'pat-first-pass-1' } });
  const patToken = (await call('POST', '/auth/staff/login', { body: { email: 'pat@example.com', password: 'pat-first-pass-1' } })).body.token;
  assert.equal((await call('POST', `/admin/reviewers/${patId}/reset-password`, { token: patToken })).status, 403, 'reviewers cannot trigger resets');
  const rs = await call('POST', `/admin/reviewers/${patId}/reset-password`, { token: adminToken });
  assert.equal(rs.status, 201);
  assert.ok(rs.body.resetUrl.startsWith(`${ORIGIN}/reset-password/`));
  assert.equal((await call('GET', '/staff/trainees', { token: patToken })).status, 401, 'sessions end at reset');
  assert.equal((await call('POST', '/auth/staff/login', { body: { email: 'pat@example.com', password: 'pat-first-pass-1' } })).status, 401, 'old password stops working');
  const listed = (await call('GET', '/admin/reviewers', { token: adminToken })).body.reviewers.find(r => r.id === patId);
  assert.equal(listed.status, 'active');
  assert.equal(listed.pendingLinkKind, 'password_reset');
  const info = await call('GET', `/auth/invite/${rs.body.resetToken}`);
  assert.equal(info.body.kind, 'password_reset');
  const done = await call('POST', '/auth/invite/accept', { body: { token: rs.body.resetToken, password: 'pat-second-pass-2' } });
  assert.equal(done.status, 200);
  assert.equal((await call('POST', '/auth/invite/accept', { body: { token: rs.body.resetToken, password: 'pat-third-pass-3' } })).status, 404, 'link works once');
  assert.equal((await call('POST', '/auth/staff/login', { body: { email: 'pat@example.com', password: 'pat-second-pass-2' } })).status, 200);
  const rs2 = await call('POST', `/admin/reviewers/${patId}/reset-password`, { token: adminToken });
  await call('POST', `/admin/reviewers/${patId}/revoke`, { token: adminToken });
  assert.equal((await call('POST', '/auth/invite/accept', { body: { token: rs2.body.resetToken, password: 'pat-fourth-pass-4' } })).status, 404, 'revoke cancels a pending reset link');
});

test('logout ends the session on the server', async () => {
  await call('POST', '/auth/trainee/register', { body: { name: 'Shared Tablet', pin: '2468' } });
  const a = (await call('POST', '/auth/trainee/login', { body: { name: 'Shared Tablet', pin: '2468' } })).body.token;
  assert.equal((await call('POST', '/auth/logout', { token: a })).status, 200);
  assert.equal((await call('GET', '/tracks', { token: a })).status, 401, 'token no longer works after logout');
  const b = (await call('POST', '/auth/trainee/login', { body: { name: 'Shared Tablet', pin: '2468' } })).body.token;
  assert.equal((await call('GET', '/tracks', { token: b })).status, 200);
});

test('parallel guesses cannot exceed the 5-guess budget; wrong codes cancel the reset code at lockout', async () => {
  await call('POST', '/auth/trainee/register', { body: { name: 'Code Burst', pin: '1234' } });
  const id = (await call('GET', '/staff/trainees', { token: adminToken })).body.trainees.find(t => t.name === 'Code Burst').id;
  const r = await call('POST', `/staff/trainees/${id}/reset-pin`, { token: adminToken });
  const wrong = r.body.code === '000000' ? '111111' : '000000';
  const results = await Promise.all(Array.from({ length: 9 }, () => call('POST', '/auth/trainee/reset-pin', { body: { name: 'Code Burst', code: wrong, pin: '5678' } })));
  assert.ok(results.filter(x => x.status === 401).length <= 5, 'at most 5 codes actually checked');
  const { rows } = await db.query('SELECT reset_code_hash, locked_until FROM trainees WHERE id = $1', [id]);
  assert.equal(rows[0].reset_code_hash, null, 'code cancelled when the lock triggers');
  assert.ok(rows[0].locked_until, 'account locked');
  assert.equal((await call('POST', '/auth/trainee/reset-pin', { body: { name: 'Code Burst', code: r.body.code, pin: '5678' } })).status, 423);
});

test('attempt review after the week was edited shows only right/wrong', async () => {
  await call('POST', '/auth/trainee/register', { body: { name: 'Edit Later', pin: '1357' } });
  const tok = (await call('POST', '/auth/trainee/login', { body: { name: 'Edit Later', pin: '1357' } })).body.token;
  const t = await takeTest(tok, '1926', 7, 10);
  const sub = await submit(tok, '1926', 7, { answers: t.answers, attemptToken: t.attemptToken });
  await db.query(`UPDATE attempts SET content_version = 'older' WHERE id = $1`, [sub.body.attemptId]);
  const d = await call('GET', `/me/attempts/${sub.body.attemptId}`, { token: tok });
  assert.equal(d.status, 200);
  assert.equal(d.body.contentChanged, true);
  assert.ok(d.body.results.every(r => r.options === undefined && r.correctIndex === undefined && r.isCorrect === true));
});
