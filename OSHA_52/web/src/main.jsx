import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, Navigate, Outlet, RouterProvider, useLocation } from 'react-router-dom';
import { SessionProvider, useSession } from './session.jsx';
import Layout from './Layout.jsx';
import Login from './pages/Login.jsx';
import Tracks from './pages/Tracks.jsx';
import Weeks from './pages/Weeks.jsx';
import Week from './pages/Week.jsx';
import Test from './pages/Test.jsx';
import Attempt from './pages/Attempt.jsx';
import History from './pages/History.jsx';
import './styles.css';

// Signed-in pages share the header (with Log out). Without a session, go to sign-in and come back afterwards.
function RequireSession() {
  const { session } = useSession();
  const location = useLocation();
  return session ? <Layout /> : <Navigate to="/login" replace state={{ from: location.pathname }} />;
}

function LoginRoute() {
  const { session } = useSession();
  const location = useLocation();
  return session ? <Navigate to={location.state?.from || '/'} replace /> : <Login />;
}

function Root() {
  return (
    <SessionProvider>
      <Outlet />
    </SessionProvider>
  );
}

// A data router, so the test page can block navigation away from unsubmitted answers.
const router = createBrowserRouter([
  {
    element: <Root />,
    children: [
      { path: '/login', element: <LoginRoute /> },
      {
        element: <RequireSession />,
        children: [
          { index: true, element: <Tracks /> },
          { path: 'track/:track', element: <Weeks /> },
          { path: 'track/:track/week/:week', element: <Week /> },
          { path: 'track/:track/week/:week/test', element: <Test /> },
          { path: 'attempt/:id', element: <Attempt /> },
          { path: 'history', element: <History /> },
        ],
      },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
