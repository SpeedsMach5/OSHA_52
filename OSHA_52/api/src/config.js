// All configuration comes from environment variables (set in Railway; never committed).
function list(v) {
  return (v || '').split(',').map(s => s.trim()).filter(Boolean);
}

function loadConfig(env = process.env) {
  const cfg = {
    port: Number(env.PORT) || 3000,
    databaseUrl: env.DATABASE_URL,
    databaseSsl: env.DATABASE_SSL === 'true',
    jwtSecret: env.JWT_SECRET,
    corsOrigins: list(env.CORS_ORIGINS),
    appBaseUrl: (env.APP_BASE_URL || '').replace(/\/+$/, ''),
    passMark: env.PASS_MARK ? Number(env.PASS_MARK) : 80,
    traineeTokenTtl: env.TRAINEE_TOKEN_TTL || '14d',
    staffTokenTtl: env.STAFF_TOKEN_TTL || '12h',
    inviteTtlHours: env.INVITE_TTL_HOURS ? Number(env.INVITE_TTL_HOURS) : 168,
    trustProxy: env.TRUST_PROXY !== 'false',
    loginRateLimitPerMinute: env.LOGIN_RATE_LIMIT_PER_MINUTE ? Number(env.LOGIN_RATE_LIMIT_PER_MINUTE) : 20,
  };
  return cfg;
}

function assertRuntimeConfig(cfg) {
  const missing = [];
  if (!cfg.databaseUrl) missing.push('DATABASE_URL');
  if (!cfg.jwtSecret || cfg.jwtSecret.length < 32) missing.push('JWT_SECRET (at least 32 characters)');
  if (!(cfg.passMark > 0 && cfg.passMark <= 100)) missing.push('PASS_MARK (number 1-100)');
  if (!(cfg.inviteTtlHours > 0)) missing.push('INVITE_TTL_HOURS (positive number)');
  if (!(cfg.loginRateLimitPerMinute > 0)) missing.push('LOGIN_RATE_LIMIT_PER_MINUTE (positive number)');
  if (missing.length) throw new Error(`Missing or invalid configuration: ${missing.join(', ')}`);
}

module.exports = { loadConfig, assertRuntimeConfig };
