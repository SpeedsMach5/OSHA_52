import { Link, useParams } from 'react-router-dom';
import { useApi, Loading, ErrorBox, TRACK_NAMES, weekStatus, StatusChip, minutes } from '../util.jsx';

export default function Weeks() {
  const { track } = useParams();
  const { data, error, loading, reload } = useApi([`/tracks/${track}/weeks`]);
  if (loading) return <Loading />;
  if (error) return <ErrorBox error={error} onRetry={reload} />;
  const [{ weeks, passMark }] = data;
  const passed = weeks.filter(w => w.progress?.passed).length;

  return (
    <>
      <p className="crumbs"><Link to="/">All training</Link></p>
      <h1>{TRACK_NAMES[track]} <span className="muted h-sub">29 CFR {track}</span></h1>
      <p className="muted">{passed} of {weeks.length} weeks passed · pass mark {passMark}%</p>
      <ol className="week-list">
        {weeks.map(w => {
          const s = weekStatus(w.progress);
          return (
            <li key={w.week}>
              <Link to={`/track/${track}/week/${w.week}`} className={`week-row week-${s.key}`}>
                <span className="week-num">Week {w.week}</span>
                <span className="week-title">{w.title}</span>
                <span className="week-meta">
                  <StatusChip status={s} />
                  {s.detail && <span className="small muted">{s.detail}</span>}
                  <span className="small muted">{minutes(w.duration)}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </>
  );
}
