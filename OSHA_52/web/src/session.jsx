import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { api, getSession, setSession, setSessionEndedHandler } from './api.js';

const SessionContext = createContext(null);

// Shared phones and tablets: sign out automatically after this long with no taps, typing or scrolling.
const IDLE_MINUTES = 30;

// One provider per realm: 'trainee' (name + PIN) or 'staff' (reviewers and admins).
export function SessionProvider({ realm, children }) {
  const [session, setState] = useState(() => getSession(realm));
  const [notice, setNotice] = useState('');
  // Set by the test page while it has unsubmitted answers, so Log out can ask first.
  const unsavedWork = useRef(false);

  const signIn = useCallback(s => { setSession(realm, s); setState(s); setNotice(''); }, [realm]);
  const update = useCallback(s => { setSession(realm, s); setState(s); }, [realm]);
  const clear = useCallback(message => { unsavedWork.current = false; setSession(realm, null); setState(null); setNotice(message || ''); }, [realm]);

  // Log out ends every session for this account on the server, then clears this device.
  const logout = useCallback(async (message = 'You have logged out.') => {
    try { await api('/auth/logout', { method: 'POST', realm }); } catch { /* already ended: clear locally anyway */ }
    clear(message);
  }, [clear, realm]);

  useEffect(() => { setSessionEndedHandler(realm, err => clear(err.message)); }, [clear, realm]);

  useEffect(() => {
    if (!session) return undefined;
    let timer;
    const reset = () => {
      clearTimeout(timer);
      timer = setTimeout(() => logout(`You were logged out after ${IDLE_MINUTES} minutes without activity.`), IDLE_MINUTES * 60_000);
    };
    const events = ['pointerdown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(e => window.addEventListener(e, reset, { passive: true }));
    reset();
    return () => { clearTimeout(timer); events.forEach(e => window.removeEventListener(e, reset)); };
  }, [session, logout]);

  return (
    <SessionContext.Provider value={{ realm, session, signIn, update, logout, notice, setNotice, unsavedWork }}>
      {children}
    </SessionContext.Provider>
  );
}

export const useSession = () => useContext(SessionContext);
