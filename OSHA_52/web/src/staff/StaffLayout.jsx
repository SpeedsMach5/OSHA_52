import { useEffect, useRef } from 'react';
import { Navigate, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useSession } from '../session.jsx';

// Reviewer/admin area: header with navigation and Log out on every screen.
export default function StaffLayout() {
  const { session, logout } = useSession();
  const location = useLocation();
  const main = useRef(null);
  useEffect(() => {
    const t = setTimeout(() => { const h = main.current?.querySelector('h1'); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); } }, 0);
    return () => clearTimeout(t);
  }, [location.pathname]);

  if (!session) return <Navigate to="/staff/login" replace state={{ from: location.pathname + location.search }} />;
  if (session.user.mustChangePassword) return <Navigate to="/staff/change-password" replace />;
  const isAdmin = session.user.role === 'admin';
  const link = ({ isActive }) => `staff-nav-link${isActive ? ' active' : ''}`;

  return (
    <>
      <header className="topbar topbar-staff">
        <div className="topbar-inner">
          <NavLink to="/staff" end className="brand">OSHA 52 <span className="brand-sub">Reviewer</span></NavLink>
          <span className="who" title={session.user.email}>{session.user.name}{isAdmin ? ' · Admin' : ''}</span>
          <NavLink to="/staff/change-password" className="navlink">Password</NavLink>
          <button type="button" className="logout" onClick={() => logout()}>Log out</button>
        </div>
        <nav className="staff-nav" aria-label="Reviewer sections">
          <NavLink to="/staff" end className={link}>Dashboard</NavLink>
          <NavLink to="/staff/trainees" className={link}>Trainees</NavLink>
          <NavLink to="/staff/results" className={link}>Results</NavLink>
          <NavLink to="/staff/missed" className={link}>Most missed</NavLink>
          {isAdmin && <NavLink to="/staff/reviewers" className={link}>Reviewers</NavLink>}
        </nav>
      </header>
      <main className="page page-wide" ref={main}>
        <Outlet />
      </main>
    </>
  );
}
