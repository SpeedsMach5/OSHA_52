import { Link, useParams } from 'react-router-dom';
import { useApi, Loading, ErrorBox, TRACK_NAMES, weekStatus, StatusChip, formatDateTime, minutes } from '../util.jsx';

export default function Week() {
  const { track, week } = useParams();
  const { data, error, loading, reload } = useApi([`/tracks/${track}/weeks/${week}`, `/tracks/${track}/weeks`, `/me/attempts?track=${track}`]);
  if (loading) return <Loading />;
  if (error) return <ErrorBox error={error} onRetry={reload} />;
  const [detail, list, hist] = data;
  const progress = list.weeks.find(w => w.week === Number(week))?.progress;
  const status = weekStatus(progress);
  const attempts = hist.attempts.filter(a => a.week === Number(week));

  return (
    <>
      <p className="crumbs"><Link to="/">All training</Link> › <Link to={`/track/${track}`}>{TRACK_NAMES[track]}</Link></p>
      <h1><span className="muted h-pre">Week {detail.week}</span> {detail.title}</h1>
      <p className="muted">About {minutes(detail.duration)} · {list.weeks.find(w => w.week === Number(week))?.questionCount} questions · pass mark {list.passMark}%</p>

      <section className="card test-card">
        <div className="card-head">
          <h2>Weekly test</h2>
          <StatusChip status={status} />
        </div>
        {status.key === 'locked' ? (
          <div className="notice notice-error" role="status">This week is locked after two failed attempts. Talk to your trainer to unlock it.</div>
        ) : progress?.availableAt ? (
          <div className="notice" role="status">
            {status.key === 'passed' ? 'You passed this week. ' : ''}You can take this week's test once per day. Next attempt: {formatDateTime(progress.availableAt)}.
          </div>
        ) : (
          <>
            {status.key === 'passed' && <p className="small muted">You passed this week. Another attempt counts as practice and won't change your result.</p>}
            {status.key === 'retry' && <p className="small muted">You can try once per day. A second fail locks the week until your trainer unlocks it.</p>}
            <Link to={`/track/${track}/week/${week}/test`} className="btn btn-primary btn-block">
              {status.key === 'passed' ? 'Practice the test' : status.key === 'retry' ? 'Retake the test' : 'Start the test'}
            </Link>
          </>
        )}
      </section>

      <section>
        <h2>What this week covers</h2>
        <ul className="topics">
          {detail.topics.map((t, i) => <li key={i}>{t}</li>)}
        </ul>
      </section>

      <section>
        <h2>Resources</h2>
        <ul className="resources">
          {detail.resources.map((r, i) => (
            <li key={i}>
              <a href={r.url} target="_blank" rel="noopener noreferrer">{r.title}</a>
              {r.description && <span className="small muted"> — {r.description}</span>}
            </li>
          ))}
        </ul>
      </section>

      {attempts.length > 0 && (
        <section>
          <h2>Your attempts</h2>
          <ul className="attempt-list">
            {attempts.map(a => (
              <li key={a.id}>
                <Link to={`/attempt/${a.id}`} className="attempt-row">
                  <span>{formatDateTime(a.submittedAt)}</span>
                  <span className={a.passed ? 'pass' : 'fail'}>{Math.round(a.scorePct)}% {a.passed ? 'Pass' : 'Fail'}</span>
                  {a.practice && <span className="chip chip-new">Practice</span>}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
