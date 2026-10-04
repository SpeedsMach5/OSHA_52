// Screenshots of every trainee screen at phone and desktop width, for review.
// Needs the dev API with demo data (npm run dev:api) and the app built against it and served:
//   VITE_API_URL=http://localhost:8787 npm run build:web && npm run preview -w web
//   node web/scripts/screenshots.mjs [outDir]
// Uses the locally installed Chrome (playwright-core downloads no browser).
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const APP = process.env.APP_URL || 'http://localhost:4173';
const API = process.env.API_URL || 'http://localhost:8787';
const OUT = resolve(process.argv[2] || 'screenshots');
const CHROME = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const VIEWPORTS = [
  { name: 'phone', width: 390, height: 844, trainee: ['Alex Rivera', '1234'] },
  { name: 'desktop', width: 1280, height: 800, trainee: ['Sam Patel', '5678'] },
];

async function apiLogin([name, pin]) {
  const r = await fetch(`${API}/auth/trainee/login`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name, pin }) });
  return (await r.json()).token;
}
async function apiGet(token, path) {
  return (await fetch(API + path, { headers: { authorization: `Bearer ${token}` } })).json();
}

mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath: CHROME });
for (const vp of VIEWPORTS) {
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: vp.name === 'phone' ? 2 : 1 });
  page.on('dialog', d => d.accept()); // "Leave this test?" when moving on from the half-filled test
  let n = 0;
  const shot = async (label, fullPage = true) => {
    await page.waitForLoadState('networkidle');
    n += 1;
    await page.screenshot({ path: `${OUT}/${vp.name}-${String(n).padStart(2, '0')}-${label}.png`, fullPage });
  };
  const go = async path => { await page.goto(APP + path); await page.waitForLoadState('networkidle'); };

  await go('/login');
  await shot('sign-in');
  await page.getByRole('tab', { name: 'New trainee' }).click();
  await shot('new-trainee');
  await page.getByRole('tab', { name: 'I have a reset code' }).click();
  await shot('reset-code');

  // Pending account (Jordan Lee is left pending by the demo seed).
  await page.getByRole('tab', { name: 'Sign in' }).click();
  await page.getByLabel('Full name').fill('Jordan Lee');
  await page.getByLabel('4-digit PIN').fill('2468');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.getByText('Your account is waiting for approval.').waitFor();
  await shot('pending-approval');

  // Wrong PIN message.
  await page.getByRole('button', { name: 'Back to sign in' }).click();
  await page.getByLabel('Full name').fill(vp.trainee[0]);
  await page.getByLabel('4-digit PIN').fill('0000');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.getByRole('alert').waitFor();
  await shot('sign-in-wrong-pin');

  await page.getByLabel('4-digit PIN').fill(vp.trainee[1]);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.getByRole('heading', { name: 'Choose your training' }).waitFor();
  await shot('tracks');

  await go('/track/1926');
  await shot('weeks');
  await go('/track/1926/week/6');
  await shot('week-not-started');
  await go('/track/1926/week/1');
  await shot('week-passed');
  await go('/track/1926/week/5');
  await shot('week-retake');
  await go('/track/1926/week/2');
  await shot('week-try-tomorrow');
  await go('/track/1926/week/3');
  await shot('week-locked');

  await go('/track/1926/week/6/test');
  await page.locator('.question').first().waitFor();
  const radios = page.locator('.question');
  for (let i = 0; i < 3; i++) await radios.nth(i).locator('input[type=radio]').nth(i % 4).check();
  await shot('test-in-progress', false);
  await shot('test-full-page');

  const token = await apiLogin(vp.trainee);
  const { attempts } = await apiGet(token, '/me/attempts');
  const passed = attempts.find(a => a.track === '1926' && a.week === 1);
  const failed = attempts.find(a => a.track === '1926' && a.week === 5);
  const lockedFail = attempts.find(a => a.track === '1926' && a.week === 3); // newest first: the fail that locked it
  await go(`/attempt/${passed.id}`);
  await shot('result-pass');
  await go(`/attempt/${failed.id}`);
  await shot('result-fail');
  await go(`/attempt/${lockedFail.id}`);
  await shot('result-fail-week-locked');
  await go('/history');
  await shot('my-results');

  await page.getByRole('button', { name: 'Log out' }).click();
  await page.getByText('You have logged out.').waitFor();
  await shot('logged-out');
  await page.close();
}
await browser.close();
console.log(`Screenshots written to ${OUT}`);
