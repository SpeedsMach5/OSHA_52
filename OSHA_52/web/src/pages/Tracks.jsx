import { Link } from 'react-router-dom';
import { useApi, Loading, ErrorBox, minutes } from '../util.jsx';

export default function Tracks() {
  const { data, error, loading, reload } = useApi(['/tracks', '/tracks/1926/weeks', '/tracks/1910/weeks']);
  if (loading) return <Loading />;
  if (error) return <ErrorBox error={error} onRetry={reload} />;
  const [{ tracks }, w1926, w1910] = data;
  const weeksBy = { 1926: w1926.weeks, 1910: w1910.weeks };
  const order = ['1926', '1910'];

  return (
    <>
      <h1>Choose your training</h1>
      <div className="stack">
        {order.map(id => tracks.find(t => t.id === id)).filter(Boolean).map(t => {
          const weeks = weeksBy[t.id];
          const passed = weeks.filter(w => w.progress?.passed).length;
          const pct = Math.round((passed / weeks.length) * 100);
          return (
            <Link key={t.id} to={`/track/${t.id}`} className="card card-link">
              <div className="card-head">
                <h2>{t.name}</h2>
                <span className="muted">{t.standard}</span>
              </div>
              <p className="muted">{t.weekCount} weeks · {t.questionCount} questions · about {minutes(t.totalMinutes)} total</p>
              <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={weeks.length} aria-valuenow={passed} aria-label={`${passed} of ${weeks.length} weeks passed`}>
                <div className="progress-bar" style={{ width: `${pct}%` }} />
              </div>
              <p className="small">{passed} of {weeks.length} weeks passed</p>
            </Link>
          );
        })}
      </div>
    </>
  );
}
