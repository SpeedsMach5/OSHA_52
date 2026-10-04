import { Link } from 'react-router-dom';
import { useApi, Loading, ErrorBox, TRACK_NAMES, formatDateTime } from '../util.jsx';

export default function History() {
  const { data, error, loading, reload } = useApi(['/me/attempts']);
  if (loading) return <Loading />;
  if (error) return <ErrorBox error={error} onRetry={reload} />;
  const [{ attempts }] = data;

  return (
    <>
      <p className="crumbs"><Link to="/">All training</Link></p>
      <h1>My results</h1>
      {attempts.length === 0 ? (
        <p className="muted">No tests taken yet. Pick a week and start its test.</p>
      ) : (
        <ul className="attempt-list">
          {attempts.map(a => (
            <li key={a.id}>
              <Link to={`/attempt/${a.id}`} className="attempt-row">
                <span><strong>{TRACK_NAMES[a.track]} · Week {a.week}</strong><br /><span className="small muted">{formatDateTime(a.submittedAt)}</span></span>
                <span className={a.passed ? 'pass' : 'fail'}>{Math.round(a.scorePct)}% {a.passed ? 'Pass' : 'Fail'}</span>
                {a.practice && <span className="chip chip-new">Practice</span>}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
