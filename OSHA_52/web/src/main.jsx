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
import StaffLayout from './staff/StaffLayout.jsx';
import StaffLogin from './staff/StaffLogin.jsx';
import ChangePassword from './staff/ChangePassword.jsx';
import SetPassword from './staff/SetPassword.jsx';
import Dashboard from './staff/Dashboard.jsx';
import Trainees from './staff/Trainees.jsx';
import Trainee from './staff/Trainee.jsx';
import Results from './staff/Results.jsx';
import StaffAttempt from './staff/StaffAttempt.jsx';
import Missed from './staff/Missed.jsx';
import Reviewers from './staff/Reviewers.jsx';
import './styles.css';

// Trainee pages share the header (with Log out). Without a session, go to sign-in and come back afterwards.
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

const TraineeRealm = () => <SessionProvider realm="trainee"><Outlet /></SessionProvider>;
const StaffRealm = () => <SessionProvider realm="staff"><Outlet /></SessionProvider>;

// A data router, so the test page can block navigation away from unsubmitted answers.
const router = createBrowserRouter([
  {
    element: <TraineeRealm />,
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
    ],
  },
  {
    element: <StaffRealm />,
    children: [
      { path: '/staff/login', element: <StaffLogin /> },
      { path: '/staff/change-password', element: <ChangePassword /> },
      { path: '/invite/:token', element: <SetPassword /> },
      { path: '/reset-password/:token', element: <SetPassword /> },
      {
        path: '/staff',
        element: <StaffLayout />,
        children: [
          { index: true, element: <Dashboard /> },
          { path: 'trainees', element: <Trainees /> },
          { path: 'trainees/:id', element: <Trainee /> },
          { path: 'results', element: <Results /> },
          { path: 'attempts/:id', element: <StaffAttempt /> },
          { path: 'missed', element: <Missed /> },
          { path: 'reviewers', element: <Reviewers /> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
