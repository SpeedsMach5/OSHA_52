// End-to-end check through the real UI (trainee and staff), against a running site.
//   APP_URL=https://… E2E_ADMIN_EMAIL=… E2E_ADMIN_PASSWORD=… E2E_BACKDATE=railway|local node web/scripts/e2e.mjs [outDir]
// Steps: trainee sign-up → approval → pass → fail → second fail (on a "later day") → lock → unlock → PIN reset →
// reviewer invite → reviewer password reset → CSV export → PDF export. Prints one line per step and exits 1 on failure.
// "Later day": the first fail is moved back a day (E2E_BACKDATE=railway runs SQL inside the Railway API container;
// =local uses the dev server's test hook), because the app allows one attempt per week per day.
import { chromium } from 'playwright-core';
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const APP = (process.env.APP_URL || 'http://localhost:4173').replace(/\/+$/, '');
const ADMIN = { email: process.env.E2E_ADMIN_EMAIL, password: process.env.E2E_ADMIN_PASSWORD };
const OUT = resolve(process.argv[2] || 'e2e-out');
const CHROME = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const stamp = Date.now().toString(36);
const TRAINEE = { name: `E2E Trainee ${stamp}`, pin: '2580', newPin: '3690' };
const REVIEWER = { name: `E2E Reviewer ${stamp}`, email: `e2e-reviewer-${stamp}@example.invalid`, pw1: 'e2e-reviewer-pass-1', pw2: 'e2e-reviewer-pass-2' };
const content = JSON.parse(readFileSync(resolve(here, '../../data/osha1926.json'), 'utf8'));
mkdirSync(OUT, { recursive: true });
if (!ADMIN.email || !ADMIN.password) throw new Error('Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD');

const log = [];
const step = async (label, fn) => {
  const t = Date.now();
  try { const note = await fn(); log.push(`PASS  ${label}${note ? ` — ${note}` : ''} (${Date.now() - t} ms)`); console.log(log.at(-1)); }
  catch (err) { log.push(`FAIL  ${label} — ${err.message}`); console.log(log.at(-1)); throw err; }
};
const expect = (cond, msg) => { if (!cond) throw new Error(msg); };

async function backdate(name) {
  if (process.env.E2E_BACKDATE === 'railway') {
    const js = `const {Client}=require('/app/node_modules/pg');(async()=>{const c=new Client({connectionString:process.env.DATABASE_URL});await c.connect();const r=await c.query("UPDATE attempts SET submitted_at=submitted_at-interval '1 day' WHERE trainee_id=(SELECT id FROM trainees WHERE name=$1)",[${JSON.stringify(name)}]);console.log('updated',r.rowCount);await c.end();})()`;
    const b64 = Buffer.from(js).toString('base64');
    return execFileSync('railway', ['ssh', '-s', 'OSHA 52 API', '--', 'sh', '-c', `'echo ${b64} | base64 -d > /tmp/e2e-backdate.js && node /tmp/e2e-backdate.js'`], { cwd: resolve(here, '../..'), encoding: 'utf8', shell: true }).trim();
  }
  const r = await fetch('http://127.0.0.1:8788/', { method: 'POST', body: JSON.stringify({ name, days: 1 }) });
  return r.text();
}

const browser = await chromium.launch({ executablePath: CHROME });
const traineeCtx = await browser.newContext({ acceptDownloads: true });
const staffCtx = await browser.newContext({ acceptDownloads: true });
const reviewerCtx = await browser.newContext({ acceptDownloads: true });
const tp = await traineeCtx.newPage();
const sp = await staffCtx.newPage();
const rp = await reviewerCtx.newPage();
for (const p of [tp, sp, rp]) p.on('dialog', d => d.accept());
const settle = p => p.waitForLoadState('networkidle');
const shot = (p, name) => p.screenshot({ path: `${OUT}/${name}.png`, fullPage: true });

// Answer the open test: every question right (pass) or every question wrong (fail), using the cited content.
async function answerTest(page, week, right) {
  await page.locator('.question').first().waitFor();
  const qs = content.find(w => w.week === week).test;
  const cards = page.locator('.question');
  const n = await cards.count();
  for (let i = 0; i < n; i++) {
    const card = cards.nth(i);
    const legend = (await card.locator('legend').innerText()).replace(/^\d+\.\s*/, '').trim();
    const q = qs.find(x => x.question.trim() === legend);
    expect(q, `question not found in content: ${legend.slice(0, 60)}`);
    const want = right ? q.options[q.correctAnswer] : q.options.find((_o, k) => k !== q.correctAnswer);
    await card.locator('label.option', { hasText: want }).first().click();
  }
  await page.getByRole('button', { name: 'Submit test' }).click();
  await page.locator('.score').waitFor();
  return (await page.locator('.score').innerText()).replace(/\s+/g, ' ');
}
const traineeLogin = async pin => {
  await tp.goto(`${APP}/login`); await settle(tp);
  await tp.getByLabel('Full name').fill(TRAINEE.name);
  await tp.getByLabel('4-digit PIN').fill(pin);
  await tp.getByRole('button', { name: 'Sign in' }).click();
};

try {
  await step('Site and API reachable (CORS allows the site)', async () => {
    await tp.goto(`${APP}/login`); await settle(tp);
    expect(await tp.getByRole('heading', { name: 'OSHA 52 Training' }).isVisible(), 'sign-in page did not render');
    return APP;
  });

  await step('Trainee sign-up shows "waiting for approval"', async () => {
    await tp.getByRole('tab', { name: 'New trainee' }).click();
    await tp.getByLabel('Full name').fill(TRAINEE.name);
    await tp.getByLabel('Choose a 4-digit PIN').fill(TRAINEE.pin);
    await tp.getByLabel('Enter the PIN again').fill(TRAINEE.pin);
    await tp.getByRole('button', { name: 'Create account' }).click();
    await tp.getByText('Your account is waiting for approval.').waitFor();
    await traineeLogin(TRAINEE.pin);
    await tp.getByText('Your account is waiting for approval.').waitFor();
    return 'pending account cannot sign in';
  });

  await step('Staff sign-in; approval of the sign-up on the dashboard', async () => {
    await sp.goto(`${APP}/staff/login`); await settle(sp);
    await sp.getByLabel('Email').fill(ADMIN.email);
    await sp.getByLabel('Password').fill(ADMIN.password);
    await sp.getByRole('button', { name: 'Sign in' }).click();
    await sp.getByRole('heading', { name: 'Dashboard' }).waitFor();
    const card = sp.locator('.signup').filter({ hasText: TRAINEE.name });
    await card.getByRole('button', { name: 'Approve' }).click();
    await card.waitFor({ state: 'detached' });
  });

  await step('Trainee passes week 1', async () => {
    await traineeLogin(TRAINEE.pin);
    await tp.getByRole('heading', { name: 'Choose your training' }).waitFor();
    await tp.goto(`${APP}/track/1926/week/1/test`); await settle(tp);
    const score = await answerTest(tp, 1, true);
    expect(/PASSED/i.test(score) && /100%/.test(score), `unexpected score card: ${score}`);
    expect(await tp.locator('.explain').count() > 0, 'pass should show explanations');
    await shot(tp, 'trainee-pass');
    return score;
  });

  await step('Trainee fails week 2 (no answers or explanations shown)', async () => {
    await tp.goto(`${APP}/track/1926/week/2/test`); await settle(tp);
    const score = await answerTest(tp, 2, false);
    expect(/NOT PASSED/i.test(score), `unexpected score card: ${score}`);
    expect(await tp.locator('.explain').count() === 0 && await tp.locator('.opt-right').count() === 0, 'fail must not reveal answers');
    expect(await tp.locator('.cite').count() > 0, 'fail should show citations');
    await tp.goto(`${APP}/track/1926/week/2`); await settle(tp);
    await tp.getByText("You can take this week's test once per day").waitFor();
    return score;
  });

  await step('Second fail on a later day locks the week', async () => {
    const r = await backdate(TRAINEE.name);
    await tp.goto(`${APP}/track/1926/week/2/test`); await settle(tp);
    const score = await answerTest(tp, 2, false);
    await tp.getByText('This week is now locked after two failed attempts').waitFor();
    await tp.goto(`${APP}/track/1926/week/2`); await settle(tp);
    await tp.getByText('Talk to your trainer to unlock it.').waitFor();
    await shot(tp, 'trainee-locked');
    return `${score}; backdate: ${r}`;
  });

  await step('Dashboard flags the trainee; reviewer unlocks the week', async () => {
    await sp.goto(`${APP}/staff`); await settle(sp);
    const flag = sp.locator('.flag').filter({ hasText: TRAINEE.name });
    await flag.getByText('Locked').waitFor();
    await flag.getByRole('button', { name: 'Unlock' }).click();
    await flag.getByRole('button', { name: 'Unlock' }).waitFor({ state: 'detached' }); // still flagged (2 fails) until passed, but no longer locked
    await tp.goto(`${APP}/track/1926/week/2`); await settle(tp);
    await tp.getByRole('link', { name: 'Retake the test' }).waitFor();
    return 'trainee can retake';
  });

  await step('PIN reset with a one-time code', async () => {
    await sp.goto(`${APP}/staff/trainees`); await settle(sp);
    await sp.getByRole('link', { name: TRAINEE.name }).click();
    await sp.getByRole('heading', { name: TRAINEE.name }).waitFor();
    await sp.getByRole('button', { name: 'Reset PIN' }).click();
    const code = await sp.locator('.secret input').inputValue();
    expect(/^\d{6}$/.test(code), `bad code ${code}`);
    await tp.goto(`${APP}/`); await settle(tp);
    await tp.getByText('Your session ended').waitFor({ timeout: 10_000 }).catch(() => {});
    await tp.goto(`${APP}/login`); await settle(tp);
    await traineeLogin(TRAINEE.pin);
    await tp.getByText('Your PIN was reset').waitFor();
    await tp.getByLabel('6-digit reset code from your trainer').fill(code);
    await tp.getByLabel('New 4-digit PIN').fill(TRAINEE.newPin);
    await tp.getByLabel('Enter the PIN again').fill(TRAINEE.newPin);
    await tp.getByRole('button', { name: 'Set new PIN' }).click();
    await tp.getByRole('heading', { name: 'Choose your training' }).waitFor();
    await tp.getByRole('button', { name: 'Log out' }).click();
    await traineeLogin(TRAINEE.newPin);
    await tp.getByRole('heading', { name: 'Choose your training' }).waitFor();
    return 'old PIN refused, code accepted, new PIN works';
  });

  let inviteUrl;
  await step('Reviewer invite: one-time link, set password, reviewer signed in', async () => {
    await sp.goto(`${APP}/staff/reviewers`); await settle(sp);
    await sp.getByLabel('Full name').fill(REVIEWER.name);
    await sp.getByLabel('Email').fill(REVIEWER.email);
    await sp.getByRole('button', { name: 'Create invite link' }).click();
    inviteUrl = await sp.locator('.secret input').inputValue();
    expect(inviteUrl.startsWith(`${APP}/invite/`), `invite link uses APP_BASE_URL: ${inviteUrl}`);
    await rp.goto(inviteUrl); await settle(rp);
    await rp.getByText(REVIEWER.email).waitFor();
    await rp.getByLabel(/^Password \(at least/).fill(REVIEWER.pw1);
    await rp.getByLabel('Password again').fill(REVIEWER.pw1);
    await rp.getByRole('button', { name: 'Create my account' }).click();
    await rp.getByRole('heading', { name: 'Dashboard' }).waitFor();
    expect(!(await rp.getByRole('link', { name: 'Reviewers' }).isVisible()), 'reviewer must not see admin pages');
    await rp.goto(inviteUrl); await settle(rp);
    await rp.getByText(/not valid|already/i).waitFor();
    return 'link refused on second use';
  });

  await step('Reviewer password reset: one-time link, old password stops working', async () => {
    await sp.goto(`${APP}/staff/reviewers`); await settle(sp);
    await sp.locator('tr', { hasText: REVIEWER.email }).getByRole('button', { name: 'Reset password' }).click();
    const resetUrl = await sp.locator('.secret input').inputValue();
    expect(resetUrl.startsWith(`${APP}/reset-password/`), `reset link: ${resetUrl}`);
    await rp.goto(`${APP}/staff`); await settle(rp);
    await rp.getByRole('heading', { name: 'OSHA 52 Reviewer' }).waitFor(); // signed out by the reset
    await rp.getByLabel('Email').fill(REVIEWER.email);
    await rp.getByLabel('Password').fill(REVIEWER.pw1);
    await rp.getByRole('button', { name: 'Sign in' }).click();
    await rp.getByRole('alert').waitFor();
    await rp.goto(resetUrl); await settle(rp);
    await rp.getByRole('heading', { name: 'Reset your password' }).waitFor();
    await rp.getByLabel(/^Password \(at least/).fill(REVIEWER.pw2);
    await rp.getByLabel('Password again').fill(REVIEWER.pw2);
    await rp.getByRole('button', { name: 'Set new password' }).click();
    await rp.getByRole('heading', { name: 'Dashboard' }).waitFor();
    return 'old password refused, new password works';
  });

  await step('CSV export (results filtered to the test trainee)', async () => {
    await sp.goto(`${APP}/staff/trainees`); await settle(sp);
    await sp.getByRole('link', { name: TRAINEE.name }).click();
    await sp.getByRole('link', { name: 'See all results' }).click();
    await sp.getByRole('heading', { name: new RegExp(`Results: ${TRAINEE.name}`) }).waitFor();
    const [dl] = await Promise.all([sp.waitForEvent('download'), sp.getByRole('button', { name: 'Export CSV' }).click()]);
    const file = `${OUT}/${dl.suggestedFilename()}`;
    await dl.saveAs(file);
    const lines = readFileSync(file, 'utf8').replace(/^\uFEFF/, '').trim().split('\r\n');
    expect(lines.length === 4, `expected header + 3 attempts, got ${lines.length - 1}`);
    expect(lines.slice(1).every(l => l.includes(TRAINEE.name)), 'rows should be the test trainee');
    expect(lines.filter(l => l.includes('"Pass"')).length === 1 && lines.filter(l => l.includes('"Fail"')).length === 2, 'expected 1 pass and 2 fails');
    return dl.suggestedFilename();
  });

  await step('PDF training record export', async () => {
    await sp.goto(`${APP}/staff/trainees`); await settle(sp);
    await sp.getByRole('link', { name: TRAINEE.name }).click();
    const [dl] = await Promise.all([sp.waitForEvent('download'), sp.getByRole('button', { name: /Download training record/ }).click()]);
    const file = `${OUT}/${dl.suggestedFilename()}`;
    await dl.saveAs(file);
    const pdf = readFileSync(file);
    expect(pdf.subarray(0, 5).toString() === '%PDF-' && pdf.length > 5000, 'not a PDF');
    return `${dl.suggestedFilename()} (${pdf.length} bytes)`;
  });
} finally {
  writeFileSync(`${OUT}/e2e-log.txt`, `${APP}\n${new Date().toISOString()}\n${log.join('\n')}\n`);
  await browser.close();
}
console.log(`All steps passed. Trainee: "${TRAINEE.name}", reviewer: ${REVIEWER.email}`);
