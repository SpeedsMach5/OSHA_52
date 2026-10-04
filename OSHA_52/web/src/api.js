// Small client for the OSHA 52 API. Trainee and staff (reviewer/admin) sessions are kept separately, in
// sessionStorage, so they end when the browser tab closes (shared devices); Log out also ends them on the server.
const BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8787').replace(/\/+$/, '');
const KEYS = { trainee: 'osha52.session', staff: 'osha52.staff' };

// Pages under /staff use the staff session; everything else uses the trainee session.
export const currentRealm = () => (window.location.pathname.startsWith('/staff') ? 'staff' : 'trainee');

export function getSession(realm = currentRealm()) {
  try { return JSON.parse(sessionStorage.getItem(KEYS[realm])); } catch { return null; }
}

export function setSession(realm, session) {
  try {
    if (session) sessionStorage.setItem(KEYS[realm], JSON.stringify(session));
    else sessionStorage.removeItem(KEYS[realm]);
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
  invalid_credentials: 'Those sign-in details did not match. Check them and try again.',
  invalid_credentials_format: 'Fill in both fields.',
  account_deactivated: 'This account has been deactivated. Talk to your trainer.',
  account_inactive: 'This account is no longer active. Contact your administrator.',
  invalid_code: 'That reset code is not right. Check it with your trainer.',
  invalid_name: 'Enter a full name (at least 2 characters).',
  invalid_email: 'Enter a valid email address.',
  too_many_requests: 'Too many tries. Wait a minute and try again.',
  invalid_token: 'Your session ended. Please sign in again.',
  unauthenticated: 'Please sign in.',
  forbidden: 'Your account does not have access to this.',
  password_change_required: 'Change your password to continue.',
  invite_invalid: 'This link is not valid. It may have been used already or cancelled. Ask your administrator for a new one.',
  invite_expired: 'This link has expired. Ask your administrator for a new one.',
  password_unchanged: 'Choose a new password that is different from the current one.',
  trainee_not_found: 'That trainee was not found.',
};
function friendlyMessage(code) { return MESSAGES[code]; }

const sessionEnded = {};
export function setSessionEndedHandler(realm, fn) { sessionEnded[realm] = fn; }

async function request(path, { method = 'GET', body, realm = currentRealm() } = {}) {
  const session = getSession(realm);
  const headers = {};
  if (body !== undefined) headers['content-type'] = 'application/json';
  if (session?.token) headers.authorization = `Bearer ${session.token}`;
  let res;
  try {
    res = await fetch(BASE + path, { method, headers, body: body !== undefined ? JSON.stringify(body) : undefined });
  } catch {
    throw new ApiError(0, { error: 'network' });
  }
  if (!res.ok) {
    const text = await res.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch { /* non-JSON error page */ }
    const err = new ApiError(res.status, data);
    // Session over: token no longer valid, or the account was deactivated/revoked while signed in.
    const ended = res.status === 401 || (res.status === 403 && (err.code === 'account_deactivated' || err.code === 'account_inactive'));
    if (ended && session?.token && !path.startsWith('/auth/')) sessionEnded[realm]?.(err);
    throw err;
  }
  return res;
}

export async function api(path, opts) {
  const res = await request(path, opts);
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

// Downloads a file (CSV export, PDF record) with the session's token and saves it under the server's file name.
export async function download(path, fallbackName) {
  const res = await request(path);
  const blob = await res.blob();
  const name = /filename="([^"]+)"/.exec(res.headers.get('content-disposition') || '')?.[1] || fallbackName;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
