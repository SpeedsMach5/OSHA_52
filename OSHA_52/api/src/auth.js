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
        const { rows } = await db.query('SELECT id, name, active, token_version FROM trainees WHERE id = $1', [claims.sub]);
        const t = rows[0];
        if (!t || t.token_version !== claims.ver) throw new HttpError(401, 'invalid_token');
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
  hashSecret, checkSecret, sha256, newToken, normalizeName, validPin, validResetCode, newResetCode, validEmail, validPassword,
  signToken, verifyToken, authenticate, requireRole, allowPendingPasswordChange, HttpError,
  TRAINEE_MAX_FAILS, STAFF_MAX_FAILS, LOCK_MINUTES, MIN_PASSWORD_LENGTH, RESET_CODE_HOURS, TEST_TOKEN_TTL,
};
