// Loads the verified Phase 1 content (data/osha1926.json, data/osha1910.json) — the only content source.
// Answer keys never leave this module except through grade().
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DEFAULT_DIR = path.join(__dirname, '..', '..', 'data');
const TRACKS = {
  1926: { file: 'osha1926.json', name: 'Construction', standard: '29 CFR 1926' },
  1910: { file: 'osha1910.json', name: 'General Industry', standard: '29 CFR 1910' },
};

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = crypto.randomInt(i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function loadContent(dir = DEFAULT_DIR) {
  const tracks = {};
  for (const [id, meta] of Object.entries(TRACKS)) {
    const weeks = JSON.parse(fs.readFileSync(path.join(dir, meta.file), 'utf8'));
    const byWeek = new Map();
    for (const w of weeks) {
      const version = crypto.createHash('sha256').update(JSON.stringify(w.test)).digest('hex').slice(0, 12);
      byWeek.set(w.week, { ...w, version });
    }
    tracks[id] = { id, ...meta, weeks: byWeek };
  }

  return {
    trackIds: Object.keys(tracks),
    hasTrack: t => Object.prototype.hasOwnProperty.call(tracks, t),
    getWeek: (t, w) => tracks[t]?.weeks.get(Number(w)) || null,

    listTracks() {
      return Object.values(tracks).map(t => {
        const weeks = [...t.weeks.values()];
        return {
          id: t.id, name: t.name, standard: t.standard, weekCount: weeks.length,
          questionCount: weeks.reduce((s, w) => s + w.test.length, 0),
          totalMinutes: weeks.reduce((s, w) => s + w.duration, 0),
        };
      });
    },

    listWeeks(t) {
      return [...tracks[t].weeks.values()].map(w => ({
        week: w.week, title: w.title, duration: w.duration,
        topicCount: w.topics.length, questionCount: w.test.length,
      }));
    },

    weekDetail(t, n) {
      const w = tracks[t].weeks.get(Number(n));
      if (!w) return null;
      return { track: t, standard: w.standard, week: w.week, title: w.title, duration: w.duration, topics: w.topics, resources: w.resources };
    },

    // Test as served to trainees: no correct answers, explanations, or citations.
    // With a layout, questions and options appear in the layout's shuffled order.
    publicTest(t, n, layout) {
      const w = tracks[t].weeks.get(Number(n));
      if (!w) return null;
      const order = layout ? layout.q : w.test.map((_q, i) => i);
      return {
        track: t, week: w.week, title: w.title, version: w.version,
        questions: order.map((qi, i) => {
          const q = w.test[qi];
          return { index: i, question: q.question, options: layout ? layout.o[i].map(k => q.options[k]) : q.options };
        }),
      };
    },

    // A fresh random order for one attempt: q = original question indexes in display order,
    // o[i] = original option indexes in display order for the i-th displayed question.
    newLayout(t, n) {
      const w = tracks[t].weeks.get(Number(n));
      const q = shuffle(w.test.map((_q, i) => i));
      return { q, o: q.map(qi => shuffle(w.test[qi].options.map((_o, k) => k))) };
    },

    questionKey: (t, n, i) => `${t}-w${n}-q${i + 1}`,

    // Server-side grading against the answer key.
    grade(t, n, answers, passMark) {
      const w = tracks[t].weeks.get(Number(n));
      const results = w.test.map((q, i) => {
        const selectedIndex = answers[i];
        const isCorrect = selectedIndex === q.correctAnswer;
        return {
          index: i, key: `${t}-w${n}-q${i + 1}`, question: q.question, options: q.options,
          selectedIndex, correctIndex: q.correctAnswer, isCorrect,
          explanation: q.explanation, citation: q.citation,
        };
      });
      const correct = results.filter(r => r.isCorrect).length;
      const scorePct = Math.round((correct / results.length) * 10000) / 100;
      return { results, correct, total: results.length, scorePct, passed: scorePct >= passMark, version: w.version };
    },

    // Question detail for reviewing a stored attempt (the caller decides what a trainee may see).
    reviewQuestion(t, n, i) {
      const q = tracks[t].weeks.get(Number(n))?.test[i];
      return q ? { question: q.question, options: q.options, correctIndex: q.correctAnswer, explanation: q.explanation, citation: q.citation } : null;
    },
  };
}

module.exports = { loadContent, TRACKS };
