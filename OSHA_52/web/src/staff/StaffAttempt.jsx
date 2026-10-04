import { Link, useParams } from 'react-router-dom';
import { useApi, Loading, ErrorBox, TRACK_NAMES, formatDateTime } from '../util.jsx';

const letter = k => String.fromCharCode(65 + k);

// A reviewer sees the whole attempt: the trainee's picks, the correct answers, explanations and citations.
export default function StaffAttempt() {
  const { id } = useParams();
  const { data, error, loading, reload } = useApi([`/staff/attempts/${id}`]);
  if (loading && !data) return <Loading />;
  if (error) return <ErrorBox error={error} onRetry={reload} />;
  const [a] = data;
  return (
    <>
      <p className="crumbs"><Link to={`/staff/trainees/${a.traineeId}`}>{a.traineeName}</Link> › <Link to={`/staff/results?traineeId=${a.traineeId}`}>Results</Link></p>
      <h1>{TRACK_NAMES[a.track]} week {a.week}: {a.weekTitle}</h1>
      <section className={`card score ${a.passed ? 'score-pass' : 'score-fail'}`}>
        <p className="score-label">{a.traineeName} · {a.passed ? 'Passed' : 'Not passed'}{a.practice ? ' · practice' : ''}</p>
        <p className="score-big">{Math.round(a.scorePct)}%</p>
        <p>{a.correct} of {a.total} correct · pass mark {a.passMark}% · {formatDateTime(a.submittedAt)}</p>
      </section>
      {a.contentChanged && <p className="notice">This week's test was edited after this attempt. Only right/wrong per question is shown.</p>}
      <ol className="questions">
        {a.results.map(r => (
          <li key={r.index} className={`card result ${r.isCorrect ? 'result-right' : 'result-wrong'}`}>
            <p className="result-mark">{r.isCorrect ? '✓ Correct' : '✗ Missed'}</p>
            {r.question && <p className="result-q"><span className="qnum">{r.index + 1}.</span> {r.question}</p>}
            {r.options && (
              <ul className="result-options">
                {r.options.map((o, k) => (
                  <li key={k} className={`${k === r.correctIndex ? 'opt-right' : ''} ${k === r.selectedIndex && !r.isCorrect ? 'opt-wrong' : ''}`}>
                    <span className="opt-letter">{letter(k)}.</span> {o}
                    {k === r.selectedIndex && <span className="tag">Trainee's answer</span>}
                    {k === r.correctIndex && k !== r.selectedIndex && <span className="tag">Correct answer</span>}
                  </li>
                ))}
              </ul>
            )}
            {r.explanation && <p className="explain">{r.explanation}</p>}
            {r.citation && <p className="cite">Citation: <strong>29 CFR {r.citation}</strong></p>}
          </li>
        ))}
      </ol>
    </>
  );
}
