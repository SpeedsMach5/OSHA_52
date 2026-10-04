// Reviewer dashboard reports (Stage C): summary, trainee detail, filtered results with CSV export, full attempt
// detail, per-week stats, most-missed questions, and the per-trainee PDF training record. Reviewers and admins only.
const PDFDocument = require('pdfkit');

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const RESULTS = ['pass', 'fail', 'practice', 'graded'];
// A YYYY-MM-DD string naming a real calendar day (rejects 2026-02-31).
const realDate = s => {
  if (!DATE_RE.test(s)) return false;
  const [y, m, d] = s.split('-').map(Number);
  const t = new Date(Date.UTC(y, m - 1, d));
  return t.getUTCFullYear() === y && t.getUTCMonth() === m - 1 && t.getUTCDate() === d;
};
// Whole-number query parameter within [min, max]; anything else falls back to the default.
const intParam = (v, dflt, min, max) => { const n = Number(v); return Number.isSafeInteger(n) ? Math.min(Math.max(n, min), max) : dflt; };

function registerStaffReports(app, { db, content, cfg, auth, staff, wrap, HttpError, idParam, weekStats, checkTrack, checkWeek }) {
  const tz = cfg.appTimezone;
  const fmt = (d, opts) => (d ? new Intl.DateTimeFormat('en-US', { timeZone: tz, ...opts }).format(new Date(d)) : '');
  const fmtDateTime = d => fmt(d, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false });
  const fmtDate = d => fmt(d, { year: 'numeric', month: 'short', day: 'numeric' });
  const weekTitle = (t, w) => content.getWeek(t, w)?.title || '';

  // Filters shared by the results list, CSV export, and stats. Dates are calendar days in the app timezone.
  function parseFilters(q) {
    const f = {};
    if (q.track) { checkTrack(String(q.track)); f.track = String(q.track); }
    if (q.week) {
      if (!f.track) throw new HttpError(400, 'invalid_filter', 'Choose a track before a week.');
      checkWeek(f.track, String(q.week));
      f.week = Number(q.week);
    }
    if (q.traineeId) f.traineeId = idParam(q.traineeId);
    for (const k of ['from', 'to']) {
      if (q[k]) {
        if (!realDate(String(q[k]))) throw new HttpError(400, 'invalid_filter', `${k} must be a real date (YYYY-MM-DD).`);
        f[k] = String(q[k]);
      }
    }
    if (q.result) {
      if (!RESULTS.includes(String(q.result))) throw new HttpError(400, 'invalid_filter', `result must be one of ${RESULTS.join(', ')}.`);
      f.result = String(q.result);
    }
    return f;
  }

  function where(f, params) {
    const c = [];
    const p = v => { params.push(v); return `$${params.length}`; };
    if (f.track) c.push(`a.track = ${p(f.track)}`);
    if (f.week) c.push(`a.week = ${p(f.week)}`);
    if (f.traineeId) c.push(`a.trainee_id = ${p(f.traineeId)}`);
    if (f.from) c.push(`a.submitted_at >= (${p(f.from)}::date::timestamp AT TIME ZONE ${p(tz)})`);
    if (f.to) c.push(`a.submitted_at < ((${p(f.to)}::date + 1)::timestamp AT TIME ZONE ${p(tz)})`);
    if (f.result === 'pass') c.push('a.passed AND NOT a.practice');
    if (f.result === 'fail') c.push('NOT a.passed AND NOT a.practice');
    if (f.result === 'practice') c.push('a.practice');
    if (f.result === 'graded') c.push('NOT a.practice');
    return c.length ? `WHERE ${c.join(' AND ')}` : '';
  }

  async function listAttempts(f, { limit, offset } = {}) {
    const params = [];
    const w = where(f, params);
    const page = limit ? ` LIMIT ${limit} OFFSET ${offset || 0}` : '';
    const { rows } = await db.query(
      `SELECT a.id, a.trainee_id, t.name AS trainee_name, a.track, a.week, a.correct_count, a.question_count,
              a.score_pct::float AS score_pct, a.passed, a.practice, a.submitted_at, a.content_version
       FROM attempts a JOIN trainees t ON t.id = a.trainee_id ${w}
       ORDER BY a.submitted_at DESC, a.id DESC${page}`, params);
    const { rows: n } = await db.query(`SELECT COUNT(*)::int AS n FROM attempts a ${w}`, params);
    return { total: n[0].n, rows };
  }

  const attemptView = r => ({
    id: r.id, traineeId: r.trainee_id, traineeName: r.trainee_name, track: r.track, week: r.week, weekTitle: weekTitle(r.track, r.week),
    correct: r.correct_count, total: r.question_count, scorePct: r.score_pct, passed: r.passed, practice: r.practice, submittedAt: r.submitted_at,
  });

  // Dashboard numbers.
  app.get('/staff/summary', auth, staff, wrap(async (_req, res) => {
    const { rows } = await db.query(
      `SELECT (SELECT COUNT(*) FROM trainees WHERE approval = 'approved' AND active)::int AS active_trainees,
              (SELECT COUNT(*) FROM trainees WHERE approval = 'pending')::int AS pending_signups,
              (SELECT COUNT(*) FROM attempts WHERE NOT practice AND submitted_at > now() - interval '7 days')::int AS attempts_7d,
              (SELECT COUNT(*) FROM attempts WHERE NOT practice AND passed AND submitted_at > now() - interval '7 days')::int AS passes_7d`);
    const r = rows[0];
    res.json({ activeTrainees: r.active_trainees, pendingSignups: r.pending_signups, attempts7d: r.attempts_7d, passes7d: r.passes_7d, timezone: tz });
  }));

  // One trainee: account, week-by-week progress in both tracks, and every attempt.
  async function traineeDetail(id) {
    const { rows } = await db.query(
      `SELECT id, name, active, approval, created_at, (pin_hash IS NULL) AS pin_reset_pending,
              (locked_until IS NOT NULL AND locked_until > now()) AS login_locked
       FROM trainees WHERE id = $1 AND approval <> 'rejected'`, [id]);
    const t = rows[0];
    if (!t) throw new HttpError(404, 'trainee_not_found');
    const tracks = {};
    for (const track of content.trackIds) {
      const stats = await weekStats(db, id, track);
      tracks[track] = content.listWeeks(track).map(w => ({ ...w, progress: stats.get(w.week) || null }));
    }
    const { rows: attempts } = await listAttempts({ traineeId: id }).then(r => ({ rows: r.rows }));
    return {
      trainee: { id: t.id, name: t.name, active: t.active, approval: t.approval, createdAt: t.created_at, pinResetPending: t.pin_reset_pending, loginLocked: t.login_locked },
      tracks, attempts: attempts.map(attemptView),
    };
  }

  app.get('/staff/trainees/:id', auth, staff, wrap(async (req, res) => {
    res.json(await traineeDetail(idParam(req.params.id)));
  }));

  // Results: every attempt, filtered (track, week, trainee, date range, pass/fail/practice), newest first.
  app.get('/staff/attempts', auth, staff, wrap(async (req, res) => {
    const f = parseFilters(req.query);
    const limit = intParam(req.query.limit, 100, 1, 500);
    const offset = intParam(req.query.offset, 0, 0, 1_000_000);
    const { total, rows } = await listAttempts(f, { limit, offset });
    res.json({ total, limit, offset, attempts: rows.map(attemptView) });
  }));

  // CSV exports of each filtered view. Cells that could run as spreadsheet formulas are neutralized.
  const CSV_MAX_ROWS = 50000;
  const csvCell = v => {
    let s = v == null ? '' : String(v);
    if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
    return `"${s.replace(/"/g, '""')}"`;
  };
  function sendCsv(res, name, head, rows, { truncated = false } = {}) {
    const lines = [head, ...rows].map(cols => cols.map(csvCell).join(','));
    if (truncated) lines.push(csvCell(`Only the first ${CSV_MAX_ROWS} rows are included. Narrow the filters to export the rest.`));
    res.set('Content-Type', 'text/csv; charset=utf-8');
    res.set('Content-Disposition', `attachment; filename="osha52-${name}-${new Date().toISOString().slice(0, 10)}.csv"`);
    if (truncated) res.set('X-Truncated', 'true');
    res.send(String.fromCharCode(0xfeff) + lines.join('\r\n') + '\r\n'); // BOM so Excel reads UTF-8
  }

  app.get('/staff/attempts.csv', auth, staff, wrap(async (req, res) => {
    const f = parseFilters(req.query);
    const { total, rows } = await listAttempts(f, { limit: CSV_MAX_ROWS });
    sendCsv(res, 'results',
      ['Attempt ID', 'Trainee', 'Track', 'Week', 'Week title', `Submitted (${tz})`, 'Score %', 'Correct', 'Questions', 'Result', 'Practice', 'Content version'],
      rows.map(r => [
        r.id, r.trainee_name, `29 CFR ${r.track}`, r.week, weekTitle(r.track, r.week), fmtDateTime(r.submitted_at),
        r.score_pct, r.correct_count, r.question_count, r.passed ? 'Pass' : 'Fail', r.practice ? 'Yes' : 'No', r.content_version,
      ]),
      { truncated: total > rows.length });
  }));

  // One attempt with everything a reviewer needs: the trainee's picks, the correct answers, explanations, citations.
  app.get('/staff/attempts/:id', auth, staff, wrap(async (req, res) => {
    const id = idParam(req.params.id);
    const { rows } = await db.query(`SELECT a.*, t.name AS trainee_name FROM attempts a JOIN trainees t ON t.id = a.trainee_id WHERE a.id = $1`, [id]);
    const a = rows[0];
    if (!a) throw new HttpError(404, 'attempt_not_found');
    const { rows: ans } = await db.query('SELECT * FROM attempt_answers WHERE attempt_id = $1 ORDER BY COALESCE(display_position, question_index)', [id]);
    const contentChanged = a.content_version !== content.getWeek(a.track, a.week)?.version;
    res.json({
      ...attemptView({ ...a, score_pct: Number(a.score_pct) }), passMark: Number(a.pass_mark), contentChanged,
      results: ans.map((r, i) => {
        const q = content.reviewQuestion(a.track, a.week, r.question_index);
        if (contentChanged || !q) return { index: i, isCorrect: r.is_correct, question: q?.question ?? null, contentChanged: true };
        const ord = r.option_order || q.options.map((_o, k) => k);
        return {
          index: i, question: q.question, options: ord.map(k => q.options[k]), selectedIndex: ord.indexOf(r.selected_index),
          correctIndex: ord.indexOf(r.correct_index), isCorrect: r.is_correct, explanation: q.explanation, citation: q.citation,
        };
      }),
    });
  }));

  // Results by week for one track: trainees who attempted, trainees who passed (graded attempts only), graded
  // attempts, fails, average score. Practice attempts are left out of everything except "trainees tested".
  async function weekStatsReport(f) {
    if (!f.track) throw new HttpError(400, 'invalid_filter', 'Choose a track.');
    const params = [];
    const { rows } = await db.query(
      `SELECT a.week, COUNT(DISTINCT a.trainee_id)::int AS trainees,
              COUNT(DISTINCT a.trainee_id) FILTER (WHERE a.passed AND NOT a.practice)::int AS trainees_passed,
              COUNT(*) FILTER (WHERE NOT a.practice)::int AS attempts,
              COUNT(*) FILTER (WHERE NOT a.passed AND NOT a.practice)::int AS fails,
              (AVG(a.score_pct) FILTER (WHERE NOT a.practice))::float AS avg_score
       FROM attempts a ${where({ ...f, result: undefined }, params)} GROUP BY a.week`, params);
    const by = new Map(rows.map(r => [r.week, r]));
    return content.listWeeks(f.track).filter(w => !f.week || w.week === f.week).map(w => {
      const r = by.get(w.week);
      return {
        week: w.week, title: w.title, trainees: r?.trainees || 0, traineesPassed: r?.trainees_passed || 0, attempts: r?.attempts || 0,
        fails: r?.fails || 0, avgScore: r?.avg_score != null ? Math.round(r.avg_score * 10) / 10 : null,
      };
    });
  }
  app.get('/staff/stats/weeks', auth, staff, wrap(async (req, res) => {
    const f = parseFilters(req.query);
    res.json({ track: f.track, weeks: await weekStatsReport(f) });
  }));
  app.get('/staff/stats/weeks.csv', auth, staff, wrap(async (req, res) => {
    const f = parseFilters(req.query);
    const weeks = await weekStatsReport(f);
    sendCsv(res, `results-by-week-${f.track}`,
      ['Track', 'Week', 'Week title', 'Trainees tested', 'Trainees passed', 'Graded attempts', 'Fails', 'Average score %'],
      weeks.map(w => [`29 CFR ${f.track}`, w.week, w.title, w.trainees, w.traineesPassed, w.attempts, w.fails, w.avgScore ?? '']));
  }));

  // Most-missed questions in graded attempts. Only attempts on the current version of each week's test count,
  // so the question text always matches what was answered.
  async function missedReport(f, limit) {
    const params = [];
    const { rows } = await db.query(
      `SELECT a.track, a.week, a.content_version, aa.question_index, aa.selected_index, aa.is_correct, COUNT(*)::int AS n
       FROM attempt_answers aa JOIN attempts a ON a.id = aa.attempt_id
       ${where({ ...f, result: 'graded' }, params)}
       GROUP BY a.track, a.week, a.content_version, aa.question_index, aa.selected_index, aa.is_correct`, params);
    const agg = new Map();
    let olderVersions = 0;
    for (const r of rows) {
      if (r.content_version !== content.getWeek(r.track, r.week)?.version) { olderVersions += r.n; continue; }
      const key = `${r.track}-${r.week}-${r.question_index}`;
      const g = agg.get(key) || { track: r.track, week: r.week, questionIndex: r.question_index, answered: 0, missed: 0, wrongPicks: {} };
      g.answered += r.n;
      if (!r.is_correct) { g.missed += r.n; g.wrongPicks[r.selected_index] = (g.wrongPicks[r.selected_index] || 0) + r.n; }
      agg.set(key, g);
    }
    const questions = [...agg.values()].filter(g => g.missed > 0)
      .sort((x, y) => y.missed - x.missed || y.missed / y.answered - x.missed / x.answered)
      .slice(0, limit)
      .map(g => {
        const q = content.reviewQuestion(g.track, g.week, g.questionIndex);
        const [topWrong] = Object.entries(g.wrongPicks).sort((x, y) => y[1] - x[1]);
        return {
          track: g.track, week: g.week, weekTitle: weekTitle(g.track, g.week), questionNumber: g.questionIndex + 1,
          question: q.question, correctAnswer: q.options[q.correctIndex], citation: q.citation,
          answered: g.answered, missed: g.missed, missRate: Math.round((g.missed / g.answered) * 1000) / 10,
          commonWrongAnswer: topWrong ? { text: q.options[Number(topWrong[0])], count: topWrong[1] } : null,
        };
      });
    return { questions, answersOnOlderVersions: olderVersions };
  }
  app.get('/staff/stats/missed', auth, staff, wrap(async (req, res) => {
    res.json(await missedReport(parseFilters(req.query), intParam(req.query.limit, 20, 1, 100)));
  }));
  app.get('/staff/stats/missed.csv', auth, staff, wrap(async (req, res) => {
    const { questions } = await missedReport(parseFilters(req.query), intParam(req.query.limit, 25, 1, 1000));
    sendCsv(res, 'most-missed',
      ['Rank', 'Track', 'Week', 'Week title', 'Question #', 'Question', 'Times answered', 'Times missed', 'Miss rate %', 'Correct answer', 'Most common wrong answer', 'Times chosen', 'Citation'],
      questions.map((m, i) => [i + 1, `29 CFR ${m.track}`, m.week, m.weekTitle, m.questionNumber, m.question, m.answered, m.missed, m.missRate,
        m.correctAnswer, m.commonWrongAnswer?.text ?? '', m.commonWrongAnswer?.count ?? '', `29 CFR ${m.citation}`]));
  }));

  // Per-trainee PDF training record.
  app.get('/staff/trainees/:id/record.pdf', auth, staff, wrap(async (req, res) => {
    const detail = await traineeDetail(idParam(req.params.id));
    const pdf = await buildRecordPdf(detail, { generatedBy: req.user.name, tz, fmtDate, fmtDateTime, passMark: cfg.passMark });
    const safe = detail.trainee.name.replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'trainee';
    res.set('Content-Type', 'application/pdf');
    res.set('Content-Disposition', `attachment; filename="osha52-training-record-${safe}.pdf"`);
    res.send(pdf);
  }));
}

const TRACK_NAMES = { 1926: 'Construction (29 CFR 1926)', 1910: 'General Industry (29 CFR 1910)' };

function buildRecordPdf({ trainee, tracks, attempts }, { generatedBy, tz, fmtDate, fmtDateTime, passMark }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'LETTER', margin: 54, bufferPages: true, info: { Title: `OSHA 52 Training Record: ${trainee.name}`, Author: 'OSHA 52' } });
    const chunks = [];
    doc.on('data', c => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const L = doc.page.margins.left;
    const W = doc.page.width - L - doc.page.margins.right;
    const bottom = () => doc.page.height - doc.page.margins.bottom - 24;
    let onNewPage = null; // redraws a table's header row when a table continues on a new page
    const ensure = h => { if (doc.y + h > bottom()) { doc.addPage(); if (onNewPage) onNewPage(); } };
    const ink = '#111827', muted = '#4b5563', line = '#c7ccd4';

    // Title block
    doc.font('Helvetica-Bold').fontSize(18).fillColor(ink).text('OSHA 52 Training Record', L, doc.y);
    doc.moveDown(0.2).font('Helvetica').fontSize(10).fillColor(muted)
      .text(`Generated ${fmtDateTime(new Date())} (${tz}) by ${generatedBy}. Pass mark ${passMark}%.`);
    doc.moveDown(0.8);
    doc.font('Helvetica-Bold').fontSize(13).fillColor(ink).text(trainee.name);
    const status = trainee.approval !== 'approved' ? 'Pending approval' : trainee.active ? 'Active' : 'Deactivated';
    doc.font('Helvetica').fontSize(10).fillColor(muted).text(`Account created ${fmtDate(trainee.createdAt)} · Status: ${status}`);
    doc.moveDown(0.6);

    // Columns: widths add up to W.
    const cols = [
      { h: 'Week', w: 40 }, { h: 'Topic', w: W - 40 - 92 - 74 - 56 - 52 }, { h: 'Result', w: 92 },
      { h: 'Date passed', w: 74 }, { h: 'Best', w: 56 }, { h: 'Tests*', w: 52 },
    ];
    const row = (cells, { bold = false, fill = null } = {}) => {
      doc.font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(9);
      const h = Math.max(...cells.map((c, i) => doc.heightOfString(String(c), { width: cols[i].w - 8 }))) + 8;
      ensure(h);
      const y = doc.y;
      if (fill) doc.save().rect(L, y, W, h).fill(fill).restore();
      let x = L;
      cells.forEach((c, i) => { doc.fillColor(ink).text(String(c), x + 4, y + 4, { width: cols[i].w - 8 }); x += cols[i].w; });
      doc.moveTo(L, y + h).lineTo(L + W, y + h).lineWidth(0.5).strokeColor(line).stroke();
      doc.x = L; doc.y = y + h;
    };

    for (const [track, weeks] of Object.entries(tracks).sort((a, b) => b[0].localeCompare(a[0]))) {
      const passed = weeks.filter(w => w.progress?.passed);
      const minutes = passed.reduce((s, w) => s + w.duration, 0);
      ensure(80);
      doc.moveDown(0.6).font('Helvetica-Bold').fontSize(12).fillColor(ink).text(TRACK_NAMES[track] || track, L);
      doc.font('Helvetica').fontSize(10).fillColor(muted)
        .text(`${passed.length} of ${weeks.length} weeks passed · ${Math.floor(minutes / 60)} h ${minutes % 60} min of training completed`);
      doc.moveDown(0.3);
      const started = weeks.filter(w => w.progress);
      if (!started.length) { doc.fillColor(muted).text('No tests taken in this track.'); continue; }
      const header = () => row(cols.map(c => c.h), { bold: true, fill: '#eef0f3' });
      header();
      onNewPage = header;
      for (const w of weeks) {
        const p = w.progress;
        const passAttempt = p?.passed ? attempts.filter(a => a.track === track && a.week === w.week && a.passed && !a.practice).at(-1) : null;
        const result = !p ? 'Not started' : p.passed ? 'Passed' : p.locked ? 'Locked (2 fails)' : 'Not passed';
        row([w.week, w.title, result, passAttempt ? fmtDate(passAttempt.submittedAt) : '', p?.bestScore != null ? `${Math.round(p.bestScore)}%` : '', p?.attempts || 0]);
      }
    }

    onNewPage = null;
    ensure(14);
    doc.font('Helvetica').fontSize(8).fillColor(muted).text('* Tests taken on the week, including practice attempts after it was passed.', L);
    // Attempt history
    ensure(60);
    doc.moveDown(1).font('Helvetica-Bold').fontSize(12).fillColor(ink).text('Attempt history', L);
    doc.font('Helvetica').fontSize(10).fillColor(muted).text(attempts.length ? `${attempts.length} attempts, newest first. Practice attempts were taken after the week was passed.` : 'No attempts.');
    doc.moveDown(0.3);
    if (attempts.length) {
      const hcols = [{ w: 104 }, { w: 58 }, { w: W - 104 - 58 - 84 - 96 }, { w: 84 }, { w: 96 }];
      const hrow = (cells, opts = {}) => { const saved = cols.splice(0, cols.length, ...hcols); row(cells, opts); cols.splice(0, cols.length, ...saved); };
      const hheader = () => hrow([`Submitted (${tz.split('/').pop().replace('_', ' ')})`, 'Week', 'Topic', 'Score', 'Result'], { bold: true, fill: '#eef0f3' });
      hheader();
      onNewPage = hheader;
      for (const a of attempts) {
        hrow([fmtDateTime(a.submittedAt), `${a.track} W${a.week}`, a.weekTitle, `${Math.round(a.scorePct)}% (${a.correct}/${a.total})`, `${a.passed ? 'Pass' : 'Fail'}${a.practice ? ' (practice)' : ''}`]);
      }
    }

    onNewPage = null;
    // Sign-off
    ensure(110);
    doc.moveDown(2).font('Helvetica').fontSize(10).fillColor(ink);
    const sig = label => {
      const y = doc.y + 18;
      doc.moveTo(L, y).lineTo(L + 260, y).moveTo(L + 300, y).lineTo(L + W, y).lineWidth(0.7).strokeColor(ink).stroke();
      doc.fontSize(9).fillColor(muted).text(label, L, y + 4).text('Date', L + 300, y + 4);
      doc.x = L; doc.y = y + 22;
    };
    sig('Trainee signature');
    sig('Reviewer signature');

    // Footer on every page
    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);
      doc.page.margins.bottom = 0; // write in the margin without starting a new page
      doc.font('Helvetica').fontSize(8).fillColor(muted)
        .text(`OSHA 52 training record · ${trainee.name} · Page ${i + 1} of ${range.count}`, L, doc.page.height - 40, { width: W, align: 'center', lineBreak: false });
    }
    doc.end();
  });
}

module.exports = { registerStaffReports };
