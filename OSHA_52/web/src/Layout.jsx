import { useEffect, useRef } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useSession } from './session.jsx';

// Header on every signed-in screen: app name, who is signed in, history, and a Log out button.
export default function Layout() {
  const { session, logout, unsavedWork } = useSession();
  const location = useLocation();
  const main = useRef(null);
  // Move focus to the new page's heading when the page changes (screen readers announce it).
  useEffect(() => {
    const t = setTimeout(() => { const h = main.current?.querySelector('h1'); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); } }, 0);
    return () => clearTimeout(t);
  }, [location.pathname]);
  const onLogout = () => {
    if (unsavedWork.current && !window.confirm('Log out now? Your answers on this test have not been submitted and will be lost.')) return;
    logout();
  };
  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <Link to="/" className="brand">OSHA 52</Link>
          <span className="who" title="Signed in">{session.trainee.name}</span>
          <nav className="topnav">
            <Link to="/history" className="navlink">My results</Link>
            <button type="button" className="logout" onClick={onLogout}>Log out</button>
          </nav>
        </div>
      </header>
      <main className="page" ref={main}>
        <Outlet />
      </main>
    </>
  );
}
