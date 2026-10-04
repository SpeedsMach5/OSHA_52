// Small client for the OSHA 52 API. The session lives in sessionStorage so it ends when the browser tab
// closes (shared devices); Log out also ends it on the server.
const BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8787').replace(/\/+$/, '');
const KEY = 'osha52.session';

export function getSession() {
  try { return JSON.parse(sessionStorage.getItem(KEY)); } catch { return null; }
}

export function setSession(session) {
  try {
    if (session) sessionStorage.setItem(KEY, JSON.stringify(session));
    else sessionStorage.removeItem(KEY);
  } catch { /* storage unavailable: the session just won't survive a reload */ }
}

export class ApiError extends Error {
  constructor(status, body) {
    super(body?.message || friendlyMessage(body?.error) || `Something went wrong (${status}). Please try again.`);
    this.status = status;
    this.code = body?.error;
    this.body = body || {};
  }
}

// Messages for error codes the server sends without a message of its own.
const MESSAGES = {
  network: 'Cannot reach the training server. Check your connection and try again.',
  invalid_credentials: 'That name and PIN did not match. Check both and try again.',
  invalid_credentials_format: 'Enter your full name and your 4-digit PIN.',
  account_deactivated: 'This account has been deactivated. Talk to your trainer.',
  invalid_code: 'That reset code is not right. Check it with your trainer.',
  invalid_name: 'Enter your full name (at least 2 characters).',
  too_many_requests: 'Too many tries. Wait a minute and try again.',
  invalid_token: 'Your session ended. Please sign in again.',
  unauthenticated: 'Please sign in.',
};
function friendlyMessage(code) { return MESSAGES[code]; }

let onSessionEnded = () => {};
export function setSessionEndedHandler(fn) { onSessionEnded = fn; }

export async function api(path, { method = 'GET', body } = {}) {
  const session = getSession();
  const headers = {};
  if (body !== undefined) headers['content-type'] = 'application/json';
  if (session?.token) headers.authorization = `Bearer ${session.token}`;
  let res;
  try {
    res = await fetch(BASE + path, { method, headers, body: body !== undefined ? JSON.stringify(body) : undefined });
  } catch {
    throw new ApiError(0, { error: 'network' });
  }
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { /* non-JSON error page */ }
  if (!res.ok) {
    const err = new ApiError(res.status, data);
    // Session over: token no longer valid, or the account was deactivated while signed in.
    const ended = res.status === 401 || (res.status === 403 && err.code === 'account_deactivated');
    if (ended && session?.token && !path.startsWith('/auth/')) onSessionEnded(err);
    throw err;
  }
  return data;
}
