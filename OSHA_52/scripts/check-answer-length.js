// Build check: in each week, how often is the correct option the longest one?
// A question counts when the correct option is at least as long as every other option (ties count).
// Fails (exit 1) if any week is over MAX_PCT, so tests can't be passed by always picking the longest option.
const path = require('path');

const MAX_PCT = 40;
const TRACKS = ['1926', '1910'];
const quiet = process.argv.includes('--quiet');

function correctIsLongest(q) {
  const len = q.options[q.correctAnswer].length;
  return q.options.every(o => o.length <= len);
}

function weekStats(file) {
  const weeks = require(path.join(__dirname, '..', 'data', file));
  return weeks.map(w => {
    const n = w.test.length;
    const longest = w.test.filter(correctIsLongest).length;
    return { week: w.week, n, longest, pct: Math.round((longest / n) * 1000) / 10 };
  });
}

let failed = 0;
for (const t of TRACKS) {
  const stats = weekStats(`osha${t}.json`);
  const total = stats.reduce((s, w) => s + w.n, 0);
  const longest = stats.reduce((s, w) => s + w.longest, 0);
  const over = stats.filter(w => w.pct > MAX_PCT);
  failed += over.length;
  console.log(`${t}: correct option is longest in ${longest}/${total} questions (${(longest / total * 100).toFixed(1)}%); ` +
    `max week ${Math.max(...stats.map(w => w.pct))}%; weeks over ${MAX_PCT}%: ${over.length}`);
  // Informational: where the correct option ranks by length (1 = longest; ties count as longer), so a
  // "pick the second-longest" pattern would show up too.
  const ranks = [0, 0, 0, 0, 0];
  for (const w of require(path.join(__dirname, '..', 'data', `osha${t}.json`))) {
    for (const q of w.test) ranks[1 + q.options.filter(o => o.length > q.options[q.correctAnswer].length).length]++;
  }
  console.log(`  length rank of the correct option: ${[1, 2, 3, 4].map(r => `#${r} ${(ranks[r] / total * 100).toFixed(1)}%`).join(', ')}`);
  if (!quiet) for (const w of stats) console.log(`  week ${String(w.week).padStart(2)}: ${w.longest}/${w.n} (${w.pct}%)${w.pct > MAX_PCT ? '  OVER LIMIT' : ''}`);
}
if (failed) {
  console.error(`FAIL: ${failed} week(s) over ${MAX_PCT}% correct-is-longest`);
  process.exit(1);
}
console.log(`OK: every week at or under ${MAX_PCT}%`);
