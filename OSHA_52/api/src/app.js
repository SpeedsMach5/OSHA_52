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

  // Guess budget for PINs, reset codes and staff passwords. Each check first claims one of max slots in a
  // single statement, so parallel requests can't run more than max guesses before the lock applies.
  // A correct guess frees the slots; the max-th wrong guess locks the account for LOCK_MINUTES.
  const LOCKED_MSG = { trainees: 'Too many wrong attempts. Try again later or ask a reviewer to reset your PIN.', staff_users: 'Too many failed logins. Try again later.' };
  async function claimGuess(table, id, max) {
    const { rows } = await db.query(
      `UPDATE ${table} SET failed_logins = failed_logins + 1
       WHERE id = $1 AND (locked_until IS NULL OR locked_until <= now()) AND failed_logins < $2 RETURNING id`, [id, max]);
    if (!rows[0]) throw new HttpError(423, 'locked', LOCKED_MSG[table]);
  }
  // extraOnLock: more SET clauses applied only when this wrong guess triggers the lock.
  async function wrongGuess(table, id, max, auditAction, extraOnLock = '') {
    const { rows } = await db.query(
      `UPDATE ${table} SET
         locked_until = CASE WHEN failed_logins >= $2 THEN now() + interval '${A.LOCK_MINUTES} minutes' ELSE locked_until END,
         ${extraOnLock}
         failed_logins = CASE WHEN failed_logins >= $2 THEN 0 ELSE failed_logins END
       WHERE id = $1 RETURNING (failed_logins = 0 AND locked_until > now()) AS locked`, [id, max]);
    if (rows[0]?.locked) await audit('system', null, auditAction, table === 'trainees' ? 'trainee' : 'staff', id);
  }
  const rightGuess = (table, id) => db.query(`UPDATE ${table} SET failed_logins = 0, locked_until = NULL WHERE id = $1`, [id]);

  async function findTraineeForLogin(rawName) {
    const { key } = A.normalizeName(rawName);
    const { rows } = await db.query('SELECT * FROM trainees WHERE name_key = $1', [key]);
    const t = rows[0];
    if (!t) throw new HttpError(401, 'invalid_credentials');
    if (!t.active) throw new HttpError(403, 'account_deactivated');
    if (t.locked_until && new Date(t.locked_until) > new Date()) {
      throw new HttpError(423, 'locked', 'Too many wrong attempts. Try again later or ask a reviewer to reset your PIN.', { retryAfter: t.locked_until });
    }
    return t;
  }

  // Login: name + PIN. After a PIN reset the trainee must use the reset code instead (POST /auth/trainee/reset-pin).
  app.post('/auth/trainee/login', loginLimiter, wrap(async (req, res) => {
    const pin = req.body?.pin;
    if (!A.normalizeName(req.body?.name).key || !A.validPin(pin)) throw new HttpError(400, 'invalid_credentials_format');
    const t = await findTraineeForLogin(req.body.name);
    if (!t.pin_hash) throw new HttpError(409, 'pin_reset_required', 'Your PIN was reset. Enter the 6-digit code from your reviewer, then choose a new PIN.');
    await claimGuess('trainees', t.id, A.TRAINEE_MAX_FAILS);
    if (!(await A.checkSecret(pin, t.pin_hash))) {
      await wrongGuess('trainees', t.id, A.TRAINEE_MAX_FAILS, 'trainee_locked');
      throw new HttpError(401, 'invalid_credentials');
    }
    await rightGuess('trainees', t.id);
    res.json({ token: traineeToken(t), trainee: { id: t.id, name: t.name } });
  }));

  // Set a new PIN with the one-time 6-digit code a reviewer/admin gave the trainee in person.
  app.post('/auth/trainee/reset-pin', loginLimiter, wrap(async (req, res) => {
    const { code, pin } = req.body || {};
    if (!A.normalizeName(req.body?.name).key || !A.validResetCode(code)) throw new HttpError(400, 'invalid_code_format', 'The reset code is 6 digits.');
    if (!A.validPin(pin)) throw new HttpError(400, 'invalid_pin', 'PIN must be exactly 4 digits');
    const t = await findTraineeForLogin(req.body.name);
    if (!t.reset_code_hash) throw new HttpError(401, 'invalid_code');
    if (new Date(t.reset_code_expires_at) <= new Date()) throw new HttpError(410, 'reset_code_expired', 'This code has expired. Ask a reviewer for a new one.');
    await claimGuess('trainees', t.id, A.TRAINEE_MAX_FAILS);
    if (!(await A.checkSecret(code, t.reset_code_hash))) {
      // Locking on wrong codes also cancels the code, so each code allows at most TRAINEE_MAX_FAILS guesses.
      await wrongGuess('trainees', t.id, A.TRAINEE_MAX_FAILS, 'trainee_locked',
        'reset_code_hash = CASE WHEN failed_logins >= $2 THEN NULL ELSE reset_code_hash END, reset_code_expires_at = CASE WHEN failed_logins >= $2 THEN NULL ELSE reset_code_expires_at END,');
      throw new HttpError(401, 'invalid_code');
    }
    // reset_code_hash guard: the code works once, even if two requests race.
    const { rows } = await db.query(
      `UPDATE trainees SET pin_hash = $1, pin_set_at = now(), reset_code_hash = NULL, reset_code_expires_at = NULL,
              failed_logins = 0, locked_until = NULL
       WHERE id = $2 AND reset_code_hash = $3 AND reset_code_expires_at > now() RETURNING *`, [await A.hashSecret(pin), t.id, t.reset_code_hash]);
    if (!rows[0]) throw new HttpError(401, 'invalid_code');
    await audit('trainee', t.id, 'trainee_pin_set_with_code', 'trainee', t.id);
    res.json({ token: traineeToken(rows[0]), trainee: { id: t.id, name: t.name }, pinSet: true });
  }));

  // Logout: ends every session for this account (token_version), so a shared device is safe to hand over.
  app.post('/auth/logout', auth, wrap(async (req, res) => {
    const table = req.user.type === 'trainee' ? 'trainees' : 'staff_users';
    await db.query(`UPDATE ${table} SET token_version = token_version + 1 WHERE id = $1`, [req.user.id]);
    res.json({ ok: true });
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
    await claimGuess('staff_users', s.id, A.STAFF_MAX_FAILS);
    if (!(await A.checkSecret(password, s.password_hash))) {
      await wrongGuess('staff_users', s.id, A.STAFF_MAX_FAILS, 'staff_locked');
      throw new HttpError(401, 'invalid_credentials');
    }
    await rightGuess('staff_users', s.id);
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

  // kind: 'invite' (new reviewer) or 'password_reset' (admin-triggered reset for an active reviewer).
  app.get('/auth/invite/:token', loginLimiter, wrap(async (req, res) => {
    const inv = await findInvite(req.params.token);
    res.json({ kind: inv.kind, name: inv.name, email: inv.email, expiresAt: inv.expires_at });
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
      // An invite activates an invited reviewer; a password-reset link only works for an account that is still active.
      const { rows } = await q.query(
        `UPDATE staff_users SET password_hash = $1, status = 'active', must_change_password = FALSE, token_version = token_version + 1
         WHERE id = $2 AND status = $3 RETURNING *`, [hash, inv.staff_user_id, inv.kind === 'password_reset' ? 'active' : 'invited']);
      if (!rows[0]) throw new HttpError(404, 'invite_invalid');
      return rows[0];
    });
    await audit('staff', staff.id, inv.kind === 'password_reset' ? 'password_reset_completed' : 'invite_accepted', 'staff', staff.id);
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

  // ---------------------------------------------------------------- retake rules
  // One attempt per week per calendar day (cfg.appTimezone). After a second fail on the same week, the week locks
  // until a reviewer/admin unlocks it; fails are counted from the latest unlock, and an unlock allows one attempt
  // that same day.
  const MAX_FAILS_BEFORE_LOCK = 2;
  const LOCKED_WEEK_MSG = 'This week is locked after two failed attempts. Talk to your trainer to unlock it.';
  const DAILY_LIMIT_MSG = 'You can take this week\'s test once per day. Try again tomorrow.';
  async function weekStats(q, traineeId, track, week) {
    const params = [traineeId, track, cfg.appTimezone];
    if (week !== undefined) params.push(Number(week));
    const { rows } = await q.query(
      `WITH bounds AS (SELECT (date_trunc('day', now() AT TIME ZONE $3) AT TIME ZONE $3) AS day_start,
                              ((date_trunc('day', now() AT TIME ZONE $3) + interval '1 day') AT TIME ZONE $3) AS next_day),
            u AS (SELECT week, MAX(unlocked_at) AS at FROM week_unlocks WHERE trainee_id = $1 AND track = $2 GROUP BY week)
       SELECT a.week, COUNT(*)::int AS attempts, MAX(a.score_pct)::float AS best_score, BOOL_OR(a.passed) AS passed,
              MAX(a.submitted_at) AS last_attempt_at,
              COUNT(*) FILTER (WHERE NOT a.passed)::int AS total_fails,
              COUNT(*) FILTER (WHERE NOT a.passed AND (u.at IS NULL OR a.submitted_at > u.at))::int AS fails_since_unlock,
              COUNT(*) FILTER (WHERE a.submitted_at >= GREATEST(b.day_start, COALESCE(u.at, '-infinity'::timestamptz)))::int AS attempts_today,
              MAX(b.next_day) AS next_day
       FROM attempts a CROSS JOIN bounds b LEFT JOIN u ON u.week = a.week
       WHERE a.trainee_id = $1 AND a.track = $2 ${week !== undefined ? 'AND a.week = $4' : ''}
       GROUP BY a.week`, params);
    return new Map(rows.map(r => [r.week, {
      attempts: r.attempts, bestScore: r.best_score, passed: r.passed, lastAttemptAt: r.last_attempt_at, totalFails: r.total_fails,
      locked: r.fails_since_unlock >= MAX_FAILS_BEFORE_LOCK,
      availableAt: r.fails_since_unlock < MAX_FAILS_BEFORE_LOCK && r.attempts_today >= 1 ? r.next_day : null,
    }]));
  }
  const emptyProgress = () => ({ attempts: 0, bestScore: null, passed: false, lastAttemptAt: null, totalFails: 0, locked: false, availableAt: null });
  function assertCanAttempt(stat) {
    if (stat?.locked) throw new HttpError(423, 'week_locked', LOCKED_WEEK_MSG);
    if (stat?.availableAt) throw new HttpError(429, 'daily_limit', DAILY_LIMIT_MSG, { availableAt: stat.availableAt });
  }

  // Week list. For trainees, includes their progress per week (attempts, best score, passed, locked, availableAt).
  app.get('/tracks/:track/weeks', auth, anyone, wrap(async (req, res) => {
    const { track } = req.params;
    checkTrack(track);
    const weeks = content.listWeeks(track);
    if (req.user.type === 'trainee') {
      const byWeek = await weekStats(db, req.user.id, track);
      for (const w of weeks) w.progress = byWeek.get(w.week) || emptyProgress();
    }
    res.json({ track, passMark: cfg.passMark, weeks });
  }));

  app.get('/tracks/:track/weeks/:week', auth, anyone, (req, res) => {
    checkWeek(req.params.track, req.params.week);
    res.json(content.weekDetail(req.params.track, req.params.week));
  });

  // What a trainee sees per question after submitting. Pass: everything. Fail: which questions were
  // missed and the citation for each, but not the correct option or the explanation.
  const visibleResult = (r, passed) => (passed ? r : {
    index: r.index, question: r.question, options: r.options, selectedIndex: r.selectedIndex, isCorrect: r.isCorrect,
    ...(r.isCorrect ? {} : { citation: r.citation }),
  });

  // Test questions WITHOUT correct answers, explanations, or citations, in a fresh random question and
  // option order every time. attemptToken carries that order (signed) and is required to submit, once.
  app.get('/tracks/:track/weeks/:week/test', auth, anyone, wrap(async (req, res) => {
    const { track, week } = req.params;
    checkWeek(track, week);
    if (req.user.type === 'trainee') assertCanAttempt((await weekStats(db, req.user.id, track, week)).get(Number(week)));
    const layout = content.newLayout(track, week);
    const test = content.publicTest(track, week, layout);
    const attemptToken = req.user.type === 'trainee'
      ? A.signToken(cfg, { typ: 'layout', sub: req.user.id, t: track, w: Number(week), v: test.version, lid: A.newToken(), q: layout.q, o: layout.o }, A.TEST_TOKEN_TTL)
      : undefined;
    res.json({ ...test, passMark: cfg.passMark, attemptToken });
  }));

  // Submit a test: answers[i] is the chosen option's position as displayed for the i-th displayed question.
  // Graded on the server against the answer key; every attempt kept. Trainees only.
  app.post('/tracks/:track/weeks/:week/attempts', auth, A.requireRole('trainee'), wrap(async (req, res) => {
    const { track, week } = req.params;
    checkWeek(track, week);
    const lay = A.verifyToken(cfg, req.body?.attemptToken);
    if (!lay || lay.typ !== 'layout' || lay.sub !== req.user.id || lay.t !== track || lay.w !== Number(week)) {
      throw new HttpError(400, 'invalid_attempt_token', 'This test session is not valid or has expired. Reload the test and try again.');
    }
    if (lay.v !== content.getWeek(track, week).version) throw new HttpError(409, 'test_changed', 'This test was updated. Reload the test and try again.');
    const test = content.publicTest(track, week, lay);
    const answers = req.body?.answers;
    if (!Array.isArray(answers) || answers.length !== test.questions.length) {
      throw new HttpError(400, 'invalid_answers', `Expected an answer for each of the ${test.questions.length} questions`);
    }
    if (!answers.every((a, i) => Number.isInteger(a) && a >= 0 && a < test.questions[i].options.length)) {
      throw new HttpError(400, 'invalid_answers', 'Each answer must be the index of one of the options');
    }
    // Map displayed positions back to original question and option indexes, then grade.
    const original = [];
    lay.q.forEach((qi, i) => { original[qi] = lay.o[i][answers[i]]; });
    const g = content.grade(track, week, original, cfg.passMark);
    let attempt;
    try {
      attempt = await db.tx(async q => {
        await q.query('SELECT pg_advisory_xact_lock(52, $1)', [req.user.id]);
        if ((await q.query('SELECT 1 FROM attempts WHERE layout_id = $1', [lay.lid])).rows[0]) {
          throw new HttpError(409, 'already_submitted', 'This test was already submitted. Start a new attempt to retake it.');
        }
        assertCanAttempt((await weekStats(q, req.user.id, track, week)).get(Number(week)));
        const { rows } = await q.query(
          `INSERT INTO attempts (trainee_id, track, week, question_count, correct_count, score_pct, passed, pass_mark, content_version, layout_id, submitted_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10, clock_timestamp()) RETURNING id, submitted_at`,
          [req.user.id, track, Number(week), g.total, g.correct, g.scorePct, g.passed, cfg.passMark, g.version, lay.lid]);
        for (const [i, qi] of lay.q.entries()) {
          const r = g.results[qi];
          await q.query(
            `INSERT INTO attempt_answers (attempt_id, question_index, question_key, selected_index, correct_index, is_correct, display_position, option_order)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`, [rows[0].id, r.index, r.key, r.selectedIndex, r.correctIndex, r.isCorrect, i, lay.o[i]]);
        }
        return rows[0];
      });
    } catch (err) {
      if (err.code === '23505') throw new HttpError(409, 'already_submitted', 'This test was already submitted. Start a new attempt to retake it.');
      throw err;
    }
    res.status(201).json({
      attemptId: attempt.id, submittedAt: attempt.submitted_at, track, week: Number(week),
      correct: g.correct, total: g.total, scorePct: g.scorePct, passed: g.passed, passMark: cfg.passMark,
      results: lay.q.map((qi, i) => {
        const r = g.results[qi];
        return visibleResult({
          index: i, question: r.question, options: lay.o[i].map(k => r.options[k]),
          selectedIndex: answers[i], correctIndex: lay.o[i].indexOf(r.correctIndex), isCorrect: r.isCorrect,
          explanation: r.explanation, citation: r.citation,
        }, g.passed);
      }),
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
    const { rows: ans } = await db.query(
      'SELECT * FROM attempt_answers WHERE attempt_id = $1 ORDER BY COALESCE(display_position, question_index)', [id]);
    const contentChanged = a.content_version !== content.getWeek(a.track, a.week)?.version;
    res.json({
      id: a.id, track: a.track, week: a.week, correct: a.correct_count, total: a.question_count,
      scorePct: Number(a.score_pct), passed: a.passed, passMark: Number(a.pass_mark), submittedAt: a.submitted_at,
      contentChanged,
      // Shown in the order the trainee saw, with the same pass/fail rule as at submission. If the week's
      // test has been edited since, stored option indexes may no longer match the current text, so only
      // the right/wrong result is shown (plus the current question text when it still exists).
      results: ans.map((r, i) => {
        const q = content.reviewQuestion(a.track, a.week, r.question_index);
        if (contentChanged || !q) return { index: i, isCorrect: r.is_correct, question: q?.question ?? null, contentChanged: true };
        const ord = r.option_order || q.options.map((_o, k) => k);
        return visibleResult({
          index: i, question: q.question, options: ord.map(k => q.options[k]),
          selectedIndex: ord.indexOf(r.selected_index), correctIndex: ord.indexOf(r.correct_index), isCorrect: r.is_correct,
          explanation: q.explanation, citation: q.citation,
        }, a.passed);
      }),
    });
  }));

  // ---------------------------------------------------------------- staff: trainees (reviewers and admin)
  const staff = A.requireRole('reviewer', 'admin');
  const admin = A.requireRole('admin');

  app.get('/staff/trainees', auth, staff, wrap(async (_req, res) => {
    const { rows } = await db.query(
      `SELECT t.id, t.name, t.active, t.created_at, (t.pin_hash IS NULL) AS pin_reset_pending, t.reset_code_expires_at,
              (t.locked_until IS NOT NULL AND t.locked_until > now()) AS locked,
              COUNT(a.id)::int AS attempts, MAX(a.submitted_at) AS last_attempt_at
       FROM trainees t LEFT JOIN attempts a ON a.trainee_id = t.id
       GROUP BY t.id ORDER BY t.name`);
    // Weeks with 2 or more fails in total (flagged on the reviewer dashboard), and whether each is locked now.
    const { rows: flags } = await db.query(
      `SELECT a.trainee_id, a.track, a.week, COUNT(*)::int AS fails,
              COUNT(*) FILTER (WHERE u.at IS NULL OR a.submitted_at > u.at)::int AS fails_since_unlock
       FROM attempts a
       LEFT JOIN (SELECT trainee_id, track, week, MAX(unlocked_at) AS at FROM week_unlocks GROUP BY trainee_id, track, week) u
         ON u.trainee_id = a.trainee_id AND u.track = a.track AND u.week = a.week
       WHERE NOT a.passed GROUP BY a.trainee_id, a.track, a.week HAVING COUNT(*) >= $1
       ORDER BY a.track, a.week`, [MAX_FAILS_BEFORE_LOCK]);
    const flagged = new Map();
    for (const f of flags) {
      if (!flagged.has(f.trainee_id)) flagged.set(f.trainee_id, []);
      flagged.get(f.trainee_id).push({ track: f.track, week: f.week, fails: f.fails, locked: f.fails_since_unlock >= MAX_FAILS_BEFORE_LOCK });
    }
    res.json({ trainees: rows.map(r => ({
      id: r.id, name: r.name, active: r.active, createdAt: r.created_at, pinResetPending: r.pin_reset_pending, resetCodeExpiresAt: r.reset_code_expires_at,
      locked: r.locked, attempts: r.attempts, lastAttemptAt: r.last_attempt_at,
      flaggedWeeks: flagged.get(r.id) || [], flagged: flagged.has(r.id),
    })) });
  }));

  // Unlock a week that locked after two fails. The fail count starts over and one attempt is allowed today.
  app.post('/staff/trainees/:id/unlock-week', auth, staff, wrap(async (req, res) => {
    const id = idParam(req.params.id);
    const track = String(req.body?.track || '');
    const week = String(req.body?.week ?? '');
    checkWeek(track, week);
    const { rows: t } = await db.query('SELECT id, name FROM trainees WHERE id = $1', [id]);
    if (!t[0]) throw new HttpError(404, 'trainee_not_found');
    // Same per-trainee lock as submissions, so an unlock can't interleave with a submit in progress.
    await db.tx(async q => {
      await q.query('SELECT pg_advisory_xact_lock(52, $1)', [id]);
      if (!(await weekStats(q, id, track, week)).get(Number(week))?.locked) throw new HttpError(409, 'week_not_locked', 'This week is not locked.');
      await q.query('INSERT INTO week_unlocks (trainee_id, track, week, unlocked_by) VALUES ($1, $2, $3, $4)', [id, track, Number(week), req.user.id]);
    });
    await audit('staff', req.user.id, 'week_unlocked', 'trainee', id, { track, week: Number(week) });
    res.json({ ok: true, trainee: t[0], track, week: Number(week) });
  }));

  // Reset a trainee's PIN: the old PIN and sessions stop working now, and the reviewer/admin gets a one-time
  // 6-digit code (shown once, expires in 24 h) to give the trainee in person. The trainee enters it and sets a new PIN.
  app.post('/staff/trainees/:id/reset-pin', auth, staff, wrap(async (req, res) => {
    const code = A.newResetCode();
    const { rows } = await db.query(
      `UPDATE trainees SET pin_hash = NULL, pin_set_at = NULL, reset_code_hash = $2,
              reset_code_expires_at = now() + interval '${A.RESET_CODE_HOURS} hours',
              failed_logins = 0, locked_until = NULL, token_version = token_version + 1
       WHERE id = $1 RETURNING id, name, reset_code_expires_at`, [idParam(req.params.id), await A.hashSecret(code)]);
    if (!rows[0]) throw new HttpError(404, 'trainee_not_found');
    await audit('staff', req.user.id, 'trainee_pin_reset', 'trainee', rows[0].id);
    res.json({ ok: true, trainee: { id: rows[0].id, name: rows[0].name }, code, expiresAt: rows[0].reset_code_expires_at });
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

  async function issueInvite(q, staffUserId, createdBy, kind = 'invite') {
    const token = A.newToken();
    const { rows } = await q.query(
      `INSERT INTO invites (staff_user_id, token_hash, expires_at, created_by, kind)
       VALUES ($1, $2, now() + ($3 || ' hours')::interval, $4, $5) RETURNING expires_at`,
      [staffUserId, A.sha256(token), String(cfg.inviteTtlHours), createdBy, kind]);
    const page = kind === 'password_reset' ? 'reset-password' : 'invite';
    return { inviteUrl: `${cfg.appBaseUrl}/${page}/${token}`, token, expiresAt: rows[0].expires_at };
  }

  app.get('/admin/reviewers', auth, admin, wrap(async (_req, res) => {
    const { rows } = await db.query(
      `SELECT s.id, s.name, s.email, s.status, s.created_at,
              p.expires_at AS pending_link_expires_at, p.kind AS pending_link_kind
       FROM staff_users s
       LEFT JOIN LATERAL (SELECT expires_at, kind FROM invites i WHERE i.staff_user_id = s.id AND i.used_at IS NULL AND i.revoked_at IS NULL
                          ORDER BY i.expires_at DESC LIMIT 1) p ON TRUE
       WHERE s.role = 'reviewer' ORDER BY s.name`);
    res.json({ reviewers: rows.map(r => ({ id: r.id, name: r.name, email: r.email, status: r.status, createdAt: r.created_at, pendingLinkExpiresAt: r.pending_link_expires_at, pendingLinkKind: r.pending_link_kind })) });
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

  // Password reset for an active reviewer: the old password and sessions stop working now, and the
  // admin gets a one-time link (same rules as invites) for the reviewer to set a new password.
  app.post('/admin/reviewers/:id/reset-password', auth, admin, wrap(async (req, res) => {
    const id = idParam(req.params.id);
    const out = await db.tx(async q => {
      const r = (await q.query(`SELECT * FROM staff_users WHERE id = $1 AND role = 'reviewer'`, [id])).rows[0];
      if (!r) throw new HttpError(404, 'reviewer_not_found');
      if (r.status !== 'active') throw new HttpError(409, 'reviewer_not_active', 'Use re-invite for invited or revoked reviewers.');
      await q.query(`UPDATE staff_users SET password_hash = NULL, failed_logins = 0, locked_until = NULL, token_version = token_version + 1 WHERE id = $1`, [id]);
      await q.query('UPDATE invites SET revoked_at = now() WHERE staff_user_id = $1 AND used_at IS NULL AND revoked_at IS NULL', [id]);
      return issueInvite(q, id, req.user.id, 'password_reset');
    });
    await audit('staff', req.user.id, 'reviewer_password_reset', 'staff', id);
    res.status(201).json({ reviewerId: id, resetUrl: out.inviteUrl, resetToken: out.token, expiresAt: out.expiresAt });
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
