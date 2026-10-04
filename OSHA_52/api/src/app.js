const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { rateLimit } = require('express-rate-limit');
const A = require('./auth');

const { HttpError } = A;
const wrap = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const idParam = v => { const n = Number(v); if (!Number.isInteger(n) || n < 1) throw new HttpError(404, 'not_found'); return n; };

function createApp({ cfg, db, content }) {
  const app = express();
  if (cfg.trustProxy) app.set('trust proxy', 1);
  app.disable('x-powered-by');
  app.use(helmet());
  // CORS: only the configured frontend origin(s). Requests without an Origin header (curl, server-to-server) are unaffected.
  app.use(cors({ origin: (origin, cb) => cb(null, !origin || cfg.corsOrigins.includes(origin)), maxAge: 600 }));
  app.use(express.json({ limit: '50kb' }));

  const loginLimiter = rateLimit({ windowMs: 60_000, limit: cfg.loginRateLimitPerMinute, standardHeaders: 'draft-7', legacyHeaders: false, message: { error: 'too_many_requests' } });
  const auth = A.authenticate(cfg, db);
  const audit = (actorType, actorId, action, targetType, targetId, detail) =>
    db.query('INSERT INTO audit_log (actor_type, actor_id, action, target_type, target_id, detail) VALUES ($1,$2,$3,$4,$5,$6)',
      [actorType, actorId, action, targetType, targetId, detail ? JSON.stringify(detail) : null]);

  const traineeToken = t => A.signToken(cfg, { typ: 'trainee', sub: t.id, ver: t.token_version }, cfg.traineeTokenTtl);
  const staffToken = s => A.signToken(cfg, { typ: 'staff', sub: s.id, ver: s.token_version, role: s.role }, cfg.staffTokenTtl);
  const staffView = s => ({ id: s.id, name: s.name, email: s.email, role: s.role, mustChangePassword: s.must_change_password });

  app.get('/health', wrap(async (_req, res) => {
    await db.query('SELECT 1');
    res.json({ ok: true });
  }));

  // ---------------------------------------------------------------- trainee auth
  // Register: first-time trainees choose their name and set a 4-digit PIN.
  app.post('/auth/trainee/register', loginLimiter, wrap(async (req, res) => {
    const { name, key } = A.normalizeName(req.body?.name);
    const pin = req.body?.pin;
    if (name.length < 2 || name.length > 80) throw new HttpError(400, 'invalid_name');
    if (!A.validPin(pin)) throw new HttpError(400, 'invalid_pin', 'PIN must be exactly 4 digits');
    const pinHash = await A.hashSecret(pin);
    const { rows } = await db.query(
      `INSERT INTO trainees (name, name_key, pin_hash, pin_set_at) VALUES ($1, $2, $3, now())
       ON CONFLICT (name_key) DO NOTHING RETURNING id, name, token_version`, [name, key, pinHash]);
    if (!rows[0]) throw new HttpError(409, 'name_taken', 'A trainee with this name already exists. Log in instead, or add a middle initial.');
    await audit('trainee', rows[0].id, 'trainee_registered', 'trainee', rows[0].id);
    res.status(201).json({ token: traineeToken(rows[0]), trainee: { id: rows[0].id, name: rows[0].name } });
  }));

  // Login: name + PIN. If the PIN was reset by a reviewer/admin (pin_hash NULL), the PIN entered here becomes the new PIN.
  app.post('/auth/trainee/login', loginLimiter, wrap(async (req, res) => {
    const { key } = A.normalizeName(req.body?.name);
    const pin = req.body?.pin;
    if (!key || !A.validPin(pin)) throw new HttpError(400, 'invalid_credentials_format');
    const { rows } = await db.query('SELECT * FROM trainees WHERE name_key = $1', [key]);
    const t = rows[0];
    if (!t) throw new HttpError(401, 'invalid_credentials');
    if (!t.active) throw new HttpError(403, 'account_deactivated');
    if (t.locked_until && new Date(t.locked_until) > new Date()) {
      throw new HttpError(423, 'locked', 'Too many wrong PINs. Try again later or ask a reviewer to reset your PIN.', { retryAfter: t.locked_until });
    }
    if (!t.pin_hash) {
      const pinHash = await A.hashSecret(pin);
      // pin_hash IS NULL guard: if two logins race after a reset, only one sets the PIN.
      const { rows: set } = await db.query(
        'UPDATE trainees SET pin_hash = $1, pin_set_at = now(), failed_logins = 0, locked_until = NULL WHERE id = $2 AND pin_hash IS NULL RETURNING *',
        [pinHash, t.id]);
      if (!set[0]) throw new HttpError(401, 'invalid_credentials');
      await audit('trainee', t.id, 'trainee_pin_set_after_reset', 'trainee', t.id);
      return res.json({ token: traineeToken(set[0]), trainee: { id: t.id, name: t.name }, pinSet: true });
    }
    if (!(await A.checkSecret(pin, t.pin_hash))) {
      // Counted in one statement so parallel wrong guesses can't all read the same count.
      const { rows: f } = await db.query(
        `UPDATE trainees SET
           locked_until = CASE WHEN failed_logins + 1 >= $2 THEN now() + interval '${A.LOCK_MINUTES} minutes' ELSE locked_until END,
           failed_logins = CASE WHEN failed_logins + 1 >= $2 THEN 0 ELSE failed_logins + 1 END
         WHERE id = $1 RETURNING failed_logins, locked_until`, [t.id, A.TRAINEE_MAX_FAILS]);
      if (f[0]?.failed_logins === 0 && f[0].locked_until) await audit('system', null, 'trainee_locked', 'trainee', t.id);
      throw new HttpError(401, 'invalid_credentials');
    }
    await db.query('UPDATE trainees SET failed_logins = 0, locked_until = NULL WHERE id = $1', [t.id]);
    res.json({ token: traineeToken(t), trainee: { id: t.id, name: t.name } });
  }));

  // ---------------------------------------------------------------- staff auth
  app.post('/auth/staff/login', loginLimiter, wrap(async (req, res) => {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = req.body?.password;
    if (!email || typeof password !== 'string') throw new HttpError(400, 'invalid_credentials_format');
    const { rows } = await db.query('SELECT * FROM staff_users WHERE email = $1', [email]);
    const s = rows[0];
    if (!s || s.status !== 'active' || !s.password_hash) throw new HttpError(401, 'invalid_credentials');
    if (s.locked_until && new Date(s.locked_until) > new Date()) throw new HttpError(423, 'locked', 'Too many failed logins. Try again later.', { retryAfter: s.locked_until });
    if (!(await A.checkSecret(password, s.password_hash))) {
      const { rows: f } = await db.query(
        `UPDATE staff_users SET
           locked_until = CASE WHEN failed_logins + 1 >= $2 THEN now() + interval '${A.LOCK_MINUTES} minutes' ELSE locked_until END,
           failed_logins = CASE WHEN failed_logins + 1 >= $2 THEN 0 ELSE failed_logins + 1 END
         WHERE id = $1 RETURNING failed_logins, locked_until`, [s.id, A.STAFF_MAX_FAILS]);
      if (f[0]?.failed_logins === 0 && f[0].locked_until) await audit('system', null, 'staff_locked', 'staff', s.id);
      throw new HttpError(401, 'invalid_credentials');
    }
    await db.query('UPDATE staff_users SET failed_logins = 0, locked_until = NULL WHERE id = $1', [s.id]);
    res.json({ token: staffToken(s), user: staffView(s) });
  }));

  app.post('/auth/staff/change-password', auth, A.allowPendingPasswordChange, A.requireRole('admin', 'reviewer'), wrap(async (req, res) => {
    const { currentPassword, newPassword } = req.body || {};
    if (!A.validPassword(newPassword)) throw new HttpError(400, 'weak_password', `Password must be at least ${A.MIN_PASSWORD_LENGTH} characters`);
    if (newPassword === currentPassword) throw new HttpError(400, 'password_unchanged');
    const { rows } = await db.query('SELECT * FROM staff_users WHERE id = $1', [req.user.id]);
    if (!(await A.checkSecret(String(currentPassword || ''), rows[0].password_hash))) throw new HttpError(401, 'invalid_credentials');
    const { rows: upd } = await db.query(
      `UPDATE staff_users SET password_hash = $1, must_change_password = FALSE, token_version = token_version + 1
       WHERE id = $2 RETURNING *`, [await A.hashSecret(newPassword), req.user.id]);
    await audit('staff', req.user.id, 'password_changed', 'staff', req.user.id);
    res.json({ token: staffToken(upd[0]), user: staffView(upd[0]) });
  }));

  // Invite links: GET shows who the invite is for; POST sets the password and consumes the link.
  async function findInvite(token) {
    if (typeof token !== 'string' || token.length < 20) throw new HttpError(404, 'invite_invalid');
    const { rows } = await db.query(
      `SELECT i.*, s.name, s.email, s.status FROM invites i JOIN staff_users s ON s.id = i.staff_user_id WHERE i.token_hash = $1`,
      [A.sha256(token)]);
    const inv = rows[0];
    if (!inv || inv.used_at || inv.revoked_at || inv.status === 'revoked') throw new HttpError(404, 'invite_invalid');
    if (new Date(inv.expires_at) <= new Date()) throw new HttpError(410, 'invite_expired');
    return inv;
  }

  app.get('/auth/invite/:token', loginLimiter, wrap(async (req, res) => {
    const inv = await findInvite(req.params.token);
    res.json({ name: inv.name, email: inv.email, expiresAt: inv.expires_at });
  }));

  app.post('/auth/invite/accept', loginLimiter, wrap(async (req, res) => {
    const { token, password } = req.body || {};
    if (!A.validPassword(password)) throw new HttpError(400, 'weak_password', `Password must be at least ${A.MIN_PASSWORD_LENGTH} characters`);
    const hash = await A.hashSecret(password);
    const inv = await findInvite(token);
    const staff = await db.tx(async q => {
      // Consume the link atomically so it cannot be used twice (used_at IS NULL check).
      // Re-checks revoke/expiry/status here too, so a revoke or re-invite made after findInvite still wins.
      const used = await q.query(
        'UPDATE invites SET used_at = now() WHERE id = $1 AND used_at IS NULL AND revoked_at IS NULL AND expires_at > now() RETURNING id', [inv.id]);
      if (!used.rows[0]) throw new HttpError(404, 'invite_invalid');
      const { rows } = await q.query(
        `UPDATE staff_users SET password_hash = $1, status = 'active', must_change_password = FALSE, token_version = token_version + 1
         WHERE id = $2 AND status = 'invited' RETURNING *`, [hash, inv.staff_user_id]);
      if (!rows[0]) throw new HttpError(404, 'invite_invalid');
      return rows[0];
    });
    await audit('staff', staff.id, 'invite_accepted', 'staff', staff.id);
    res.json({ token: staffToken(staff), user: staffView(staff) });
  }));

  app.get('/me', auth, A.allowPendingPasswordChange, wrap(async (req, res) => {
    res.json({ user: req.user });
  }));

  // ---------------------------------------------------------------- content (any signed-in user)
  const anyone = A.requireRole('trainee', 'reviewer', 'admin');
  const checkTrack = t => { if (!content.hasTrack(t)) throw new HttpError(404, 'track_not_found'); };
  // Only canonical week numbers ("7", not "07" or "7.0") so stored question keys stay consistent.
  const checkWeek = (t, w) => { checkTrack(t); if (!/^[1-9]\d*$/.test(w) || !content.getWeek(t, w)) throw new HttpError(404, 'week_not_found'); };

  app.get('/tracks', auth, anyone, (_req, res) => res.json({ tracks: content.listTracks(), passMark: cfg.passMark }));

  // Week list. For trainees, includes their progress per week (attempts, best score, passed).
  app.get('/tracks/:track/weeks', auth, anyone, wrap(async (req, res) => {
    const { track } = req.params;
    checkTrack(track);
    const weeks = content.listWeeks(track);
    if (req.user.type === 'trainee') {
      const { rows } = await db.query(
        `SELECT week, COUNT(*)::int AS attempts, MAX(score_pct)::float AS best_score, BOOL_OR(passed) AS passed,
                MAX(submitted_at) AS last_attempt_at
         FROM attempts WHERE trainee_id = $1 AND track = $2 GROUP BY week`, [req.user.id, track]);
      const byWeek = new Map(rows.map(r => [r.week, r]));
      for (const w of weeks) {
        const p = byWeek.get(w.week);
        w.progress = p ? { attempts: p.attempts, bestScore: p.best_score, passed: p.passed, lastAttemptAt: p.last_attempt_at } : { attempts: 0, bestScore: null, passed: false, lastAttemptAt: null };
      }
    }
    res.json({ track, passMark: cfg.passMark, weeks });
  }));

  app.get('/tracks/:track/weeks/:week', auth, anyone, (req, res) => {
    checkWeek(req.params.track, req.params.week);
    res.json(content.weekDetail(req.params.track, req.params.week));
  });

  // Test questions WITHOUT correct answers, explanations, or citations.
  app.get('/tracks/:track/weeks/:week/test', auth, anyone, (req, res) => {
    checkWeek(req.params.track, req.params.week);
    res.json({ ...content.publicTest(req.params.track, req.params.week), passMark: cfg.passMark });
  });

  // Submit a test: graded on the server, every attempt kept. Trainees only.
  app.post('/tracks/:track/weeks/:week/attempts', auth, A.requireRole('trainee'), wrap(async (req, res) => {
    const { track, week } = req.params;
    checkWeek(track, week);
    const test = content.publicTest(track, week);
    const answers = req.body?.answers;
    if (!Array.isArray(answers) || answers.length !== test.questions.length) {
      throw new HttpError(400, 'invalid_answers', `Expected an answer for each of the ${test.questions.length} questions`);
    }
    if (!answers.every((a, i) => Number.isInteger(a) && a >= 0 && a < test.questions[i].options.length)) {
      throw new HttpError(400, 'invalid_answers', 'Each answer must be the index of one of the options');
    }
    const g = content.grade(track, week, answers, cfg.passMark);
    const attempt = await db.tx(async q => {
      const { rows } = await q.query(
        `INSERT INTO attempts (trainee_id, track, week, question_count, correct_count, score_pct, passed, pass_mark, content_version)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id, submitted_at`,
        [req.user.id, track, Number(week), g.total, g.correct, g.scorePct, g.passed, cfg.passMark, g.version]);
      for (const r of g.results) {
        await q.query(
          `INSERT INTO attempt_answers (attempt_id, question_index, question_key, selected_index, correct_index, is_correct)
           VALUES ($1,$2,$3,$4,$5,$6)`, [rows[0].id, r.index, r.key, r.selectedIndex, r.correctIndex, r.isCorrect]);
      }
      return rows[0];
    });
    res.status(201).json({
      attemptId: attempt.id, submittedAt: attempt.submitted_at, track, week: Number(week),
      correct: g.correct, total: g.total, scorePct: g.scorePct, passed: g.passed, passMark: cfg.passMark,
      results: g.results.map(({ key, ...r }) => r),
    });
  }));

  // Trainee's own attempt history (summary) and a single attempt with full review.
  app.get('/me/attempts', auth, A.requireRole('trainee'), wrap(async (req, res) => {
    const params = [req.user.id];
    let where = 'trainee_id = $1';
    if (req.query.track) { checkTrack(String(req.query.track)); params.push(String(req.query.track)); where += ` AND track = $${params.length}`; }
    const { rows } = await db.query(
      `SELECT id, track, week, correct_count, question_count, score_pct::float AS score_pct, passed, submitted_at
       FROM attempts WHERE ${where} ORDER BY submitted_at DESC, id DESC`, params);
    res.json({ attempts: rows.map(r => ({ id: r.id, track: r.track, week: r.week, correct: r.correct_count, total: r.question_count, scorePct: r.score_pct, passed: r.passed, submittedAt: r.submitted_at })) });
  }));

  app.get('/me/attempts/:id', auth, A.requireRole('trainee'), wrap(async (req, res) => {
    const id = idParam(req.params.id);
    const { rows } = await db.query('SELECT * FROM attempts WHERE id = $1 AND trainee_id = $2', [id, req.user.id]);
    const a = rows[0];
    if (!a) throw new HttpError(404, 'attempt_not_found');
    const { rows: ans } = await db.query('SELECT * FROM attempt_answers WHERE attempt_id = $1 ORDER BY question_index', [id]);
    res.json({
      id: a.id, track: a.track, week: a.week, correct: a.correct_count, total: a.question_count,
      scorePct: Number(a.score_pct), passed: a.passed, passMark: Number(a.pass_mark), submittedAt: a.submitted_at,
      contentChanged: a.content_version !== content.getWeek(a.track, a.week)?.version,
      results: ans.map(r => ({ index: r.question_index, selectedIndex: r.selected_index, correctIndex: r.correct_index, isCorrect: r.is_correct, ...content.reviewQuestion(a.track, a.week, r.question_index) })),
    });
  }));

  // ---------------------------------------------------------------- staff: trainees (reviewers and admin)
  const staff = A.requireRole('reviewer', 'admin');
  const admin = A.requireRole('admin');

  app.get('/staff/trainees', auth, staff, wrap(async (_req, res) => {
    const { rows } = await db.query(
      `SELECT t.id, t.name, t.active, t.created_at, (t.pin_hash IS NULL) AS pin_reset_pending,
              (t.locked_until IS NOT NULL AND t.locked_until > now()) AS locked,
              COUNT(a.id)::int AS attempts, MAX(a.submitted_at) AS last_attempt_at
       FROM trainees t LEFT JOIN attempts a ON a.trainee_id = t.id
       GROUP BY t.id ORDER BY t.name`);
    res.json({ trainees: rows.map(r => ({ id: r.id, name: r.name, active: r.active, createdAt: r.created_at, pinResetPending: r.pin_reset_pending, locked: r.locked, attempts: r.attempts, lastAttemptAt: r.last_attempt_at })) });
  }));

  // Reset a trainee's PIN: clears it so the trainee sets a new one at next login; signs out existing sessions.
  app.post('/staff/trainees/:id/reset-pin', auth, staff, wrap(async (req, res) => {
    const { rows } = await db.query(
      `UPDATE trainees SET pin_hash = NULL, pin_set_at = NULL, failed_logins = 0, locked_until = NULL, token_version = token_version + 1
       WHERE id = $1 RETURNING id, name`, [idParam(req.params.id)]);
    if (!rows[0]) throw new HttpError(404, 'trainee_not_found');
    await audit('staff', req.user.id, 'trainee_pin_reset', 'trainee', rows[0].id);
    res.json({ ok: true, trainee: rows[0] });
  }));

  // ---------------------------------------------------------------- admin
  app.post('/admin/trainees/:id/deactivate', auth, admin, wrap(async (req, res) => {
    const { rows } = await db.query('UPDATE trainees SET active = FALSE, token_version = token_version + 1 WHERE id = $1 RETURNING id, name, active', [idParam(req.params.id)]);
    if (!rows[0]) throw new HttpError(404, 'trainee_not_found');
    await audit('staff', req.user.id, 'trainee_deactivated', 'trainee', rows[0].id);
    res.json({ ok: true, trainee: rows[0] });
  }));

  app.post('/admin/trainees/:id/reactivate', auth, admin, wrap(async (req, res) => {
    const { rows } = await db.query('UPDATE trainees SET active = TRUE WHERE id = $1 RETURNING id, name, active', [idParam(req.params.id)]);
    if (!rows[0]) throw new HttpError(404, 'trainee_not_found');
    await audit('staff', req.user.id, 'trainee_reactivated', 'trainee', rows[0].id);
    res.json({ ok: true, trainee: rows[0] });
  }));

  async function issueInvite(q, staffUserId, createdBy) {
    const token = A.newToken();
    const { rows } = await q.query(
      `INSERT INTO invites (staff_user_id, token_hash, expires_at, created_by)
       VALUES ($1, $2, now() + ($3 || ' hours')::interval, $4) RETURNING expires_at`,
      [staffUserId, A.sha256(token), String(cfg.inviteTtlHours), createdBy]);
    return { inviteUrl: `${cfg.appBaseUrl}/invite/${token}`, token, expiresAt: rows[0].expires_at };
  }

  app.get('/admin/reviewers', auth, admin, wrap(async (_req, res) => {
    const { rows } = await db.query(
      `SELECT s.id, s.name, s.email, s.status, s.created_at,
              (SELECT MAX(expires_at) FROM invites i WHERE i.staff_user_id = s.id AND i.used_at IS NULL AND i.revoked_at IS NULL) AS pending_invite_expires_at
       FROM staff_users s WHERE s.role = 'reviewer' ORDER BY s.name`);
    res.json({ reviewers: rows.map(r => ({ id: r.id, name: r.name, email: r.email, status: r.status, createdAt: r.created_at, pendingInviteExpiresAt: r.pending_invite_expires_at })) });
  }));

  // Invite a reviewer: returns a one-time link (shown once) for the admin to send.
  app.post('/admin/reviewers/invite', auth, admin, wrap(async (req, res) => {
    const name = A.normalizeName(req.body?.name).name;
    const email = String(req.body?.email || '').trim().toLowerCase();
    if (name.length < 2) throw new HttpError(400, 'invalid_name');
    if (!A.validEmail(email)) throw new HttpError(400, 'invalid_email');
    const out = await db.tx(async q => {
      const existing = (await q.query('SELECT * FROM staff_users WHERE email = $1', [email])).rows[0];
      if (existing && existing.status !== 'invited') throw new HttpError(409, 'email_in_use', 'This email already has an active or revoked account. Use re-invite for revoked reviewers.');
      let id = existing?.id;
      if (!existing) {
        id = (await q.query(`INSERT INTO staff_users (name, email, role, status, created_by) VALUES ($1,$2,'reviewer','invited',$3) RETURNING id`, [name, email, req.user.id])).rows[0].id;
      } else {
        await q.query('UPDATE invites SET revoked_at = now() WHERE staff_user_id = $1 AND used_at IS NULL AND revoked_at IS NULL', [id]);
      }
      return { id, ...(await issueInvite(q, id, req.user.id)) };
    });
    await audit('staff', req.user.id, 'reviewer_invited', 'staff', out.id, { email });
    res.status(201).json({ reviewerId: out.id, inviteUrl: out.inviteUrl, inviteToken: out.token, expiresAt: out.expiresAt });
  }));

  // Revoke: blocks login immediately and cancels any pending invite.
  app.post('/admin/reviewers/:id/revoke', auth, admin, wrap(async (req, res) => {
    const id = idParam(req.params.id);
    const { rows } = await db.query(
      `UPDATE staff_users SET status = 'revoked', token_version = token_version + 1 WHERE id = $1 AND role = 'reviewer' RETURNING id, name, email, status`, [id]);
    if (!rows[0]) throw new HttpError(404, 'reviewer_not_found');
    await db.query('UPDATE invites SET revoked_at = now() WHERE staff_user_id = $1 AND used_at IS NULL AND revoked_at IS NULL', [id]);
    await audit('staff', req.user.id, 'reviewer_revoked', 'staff', id);
    res.json({ ok: true, reviewer: rows[0] });
  }));

  // Re-invite: new one-time link (old pending links cancelled). Works for invited or revoked reviewers.
  app.post('/admin/reviewers/:id/reinvite', auth, admin, wrap(async (req, res) => {
    const id = idParam(req.params.id);
    const out = await db.tx(async q => {
      const r = (await q.query(`SELECT * FROM staff_users WHERE id = $1 AND role = 'reviewer'`, [id])).rows[0];
      if (!r) throw new HttpError(404, 'reviewer_not_found');
      if (r.status === 'active') throw new HttpError(409, 'reviewer_active', 'Reviewer is already active');
      await q.query(`UPDATE staff_users SET status = 'invited', password_hash = NULL, token_version = token_version + 1 WHERE id = $1`, [id]);
      await q.query('UPDATE invites SET revoked_at = now() WHERE staff_user_id = $1 AND used_at IS NULL AND revoked_at IS NULL', [id]);
      return issueInvite(q, id, req.user.id);
    });
    await audit('staff', req.user.id, 'reviewer_reinvited', 'staff', id);
    res.status(201).json({ reviewerId: id, inviteUrl: out.inviteUrl, inviteToken: out.token, expiresAt: out.expiresAt });
  }));

  // ---------------------------------------------------------------- errors
  app.use((_req, _res, next) => next(new HttpError(404, 'not_found')));
  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    if (err instanceof HttpError) return res.status(err.status).json({ error: err.code, message: err.message !== err.code ? err.message : undefined, ...err.extra });
    if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'invalid_json' });
    console.error(err);
    res.status(500).json({ error: 'server_error' });
  });

  return app;
}

module.exports = { createApp };
