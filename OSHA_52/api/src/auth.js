const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const BCRYPT_ROUNDS = 10;
const TRAINEE_MAX_FAILS = 5;   // then locked for LOCK_MINUTES
const STAFF_MAX_FAILS = 10;
const LOCK_MINUTES = 15;
const MIN_PASSWORD_LENGTH = 10;
const RESET_CODE_HOURS = 24;   // trainee PIN reset code lifetime
const TEST_TOKEN_TTL = '24h';  // a served (shuffled) test must be submitted within this time

const hashSecret = s => bcrypt.hash(s, BCRYPT_ROUNDS);
const checkSecret = (s, hash) => (hash ? bcrypt.compare(s, hash) : Promise.resolve(false));
const sha256 = s => crypto.createHash('sha256').update(s).digest('hex');
const newToken = () => crypto.randomBytes(32).toString('base64url');

function normalizeName(raw) {
  const name = String(raw || '').trim().replace(/\s+/g, ' ');
  return { name, key: name.toLowerCase() };
}
const validPin = p => typeof p === 'string' && /^\d{4}$/.test(p);
const validResetCode = c => typeof c === 'string' && /^\d{6}$/.test(c);
const newResetCode = () => String(crypto.randomInt(0, 1_000_000)).padStart(6, '0');
const validEmail = e => typeof e === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());
const validPassword = p => typeof p === 'string' && p.length >= MIN_PASSWORD_LENGTH && p.length <= 200;

// Names that may belong to the same person as `name` (for reviewing sign-ups). Compares lower-case words.
function similarNames(name, others) {
  const words = n => normalizeName(n).key.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/-/g, ' ').replace(/[^a-z0-9 ]/g, '').split(' ').filter(Boolean);
  const lev = (x, y) => {
    const d = Array.from({ length: x.length + 1 }, (_, i) => [i]);
    for (let j = 1; j <= y.length; j++) d[0][j] = j;
    for (let i = 1; i <= x.length; i++) for (let j = 1; j <= y.length; j++) {
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (x[i - 1] === y[j - 1] ? 0 : 1));
    }
    return d[x.length][y.length];
  };
  const a = words(name);
  const out = [];
  for (const o of others) {
    const b = words(o.name);
    if (!a.length || !b.length) continue;
    const [af, al, bf, bl] = [a[0], a[a.length - 1], b[0], b[b.length - 1]];
    let reason = null;
    if (a.join(' ') === b.join(' ')) reason = 'same name';
    else if (af === bf && al === bl) reason = 'same first and last name';
    else if (lev(a.join(' '), b.join(' ')) <= (Math.min(a.join(' ').length, b.join(' ').length) < 10 ? 1 : 2)) reason = 'spelling differs by 1-2 letters';
    else if (a.length > 1 && b.length > 1 && af === bl && al === bf) reason = 'same names in reverse order';
    else if (al === bl && af[0] === bf[0]) reason = 'same last name and first initial';
    else if (al === bl && lev(af, bf) <= 2) reason = 'same last name, similar first name';
    if (reason) out.push({ id: o.id, name: o.name, reason });
  }
  return out;
}

function signToken(cfg, payload, ttl) {
  return jwt.sign(payload, cfg.jwtSecret, { expiresIn: ttl, algorithm: 'HS256' });
}

// Returns the claims, or null if the token is invalid or expired.
function verifyToken(cfg, token) {
  try { return jwt.verify(String(token || ''), cfg.jwtSecret, { algorithms: ['HS256'] }); } catch { return null; }
}

class HttpError extends Error {
  constructor(status, code, message, extra) { super(message || code); this.status = status; this.code = code; this.extra = extra; }
}

// Verifies the bearer token and re-checks the account on every request, so deactivation, revocation,
// PIN resets and password changes take effect immediately (token_version).
function authenticate(cfg, db) {
  return async (req, _res, next) => {
    try {
      const h = req.get('authorization') || '';
      const m = h.match(/^Bearer (.+)$/);
      if (!m) throw new HttpError(401, 'unauthenticated');
      let claims;
      try { claims = jwt.verify(m[1], cfg.jwtSecret, { algorithms: ['HS256'] }); } catch { throw new HttpError(401, 'invalid_token'); }
      if (claims.typ === 'trainee') {
        const { rows } = await db.query('SELECT id, name, active, approval, token_version FROM trainees WHERE id = $1', [claims.sub]);
        const t = rows[0];
        if (!t || t.token_version !== claims.ver || t.approval !== 'approved') throw new HttpError(401, 'invalid_token');
        if (!t.active) throw new HttpError(403, 'account_deactivated');
        req.user = { type: 'trainee', id: t.id, name: t.name, role: 'trainee' };
      } else if (claims.typ === 'staff') {
        const { rows } = await db.query('SELECT id, name, email, role, status, must_change_password, token_version FROM staff_users WHERE id = $1', [claims.sub]);
        const s = rows[0];
        if (!s || s.token_version !== claims.ver) throw new HttpError(401, 'invalid_token');
        if (s.status !== 'active') throw new HttpError(403, 'account_inactive');
        req.user = { type: 'staff', id: s.id, name: s.name, email: s.email, role: s.role, mustChangePassword: s.must_change_password };
      } else {
        throw new HttpError(401, 'invalid_token');
      }
      next();
    } catch (err) { next(err); }
  };
}

// Role gate. Staff with a pending forced password change can only reach the routes that allow it.
function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user) return next(new HttpError(401, 'unauthenticated'));
    if (req.user.mustChangePassword && !req.allowPendingPasswordChange) return next(new HttpError(403, 'password_change_required'));
    if (!roles.includes(req.user.role)) return next(new HttpError(403, 'forbidden'));
    next();
  };
}

const allowPendingPasswordChange = (req, _res, next) => { req.allowPendingPasswordChange = true; next(); };

module.exports = {
  hashSecret, checkSecret, sha256, newToken, normalizeName, similarNames, validPin, validResetCode, newResetCode, validEmail, validPassword,
  signToken, verifyToken, authenticate, requireRole, allowPendingPasswordChange, HttpError,
  TRAINEE_MAX_FAILS, STAFF_MAX_FAILS, LOCK_MINUTES, MIN_PASSWORD_LENGTH, RESET_CODE_HOURS, TEST_TOKEN_TTL,
};
