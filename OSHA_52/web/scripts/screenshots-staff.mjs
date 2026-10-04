// Screenshots of every reviewer/admin screen at phone and desktop width, plus the sample CSV export and PDF record
// downloaded through the app's own buttons. Needs the dev API with demo data (npm run dev:api) and the app built
// against it and served (see web/README.md).   node web/scripts/screenshots-staff.mjs [outDir]
// One browser tab is used throughout (the session lives in that tab), and each screen is shot at both sizes.
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const APP = process.env.APP_URL || 'http://localhost:4173';
const OUT = resolve(process.argv[2] || 'screenshots-staff');
const CHROME = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const SIZES = { phone: { width: 390, height: 844, deviceScaleFactor: 2, mobile: true }, desktop: { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false } };

mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath: CHROME });
const context = await browser.newContext({ acceptDownloads: true });
const page = await context.newPage();
const cdp = await context.newCDPSession(page);
page.on('dialog', d => d.accept());
let n = 0;

const size = async s => {
  // Resize first (Playwright's own viewport), then set the device scale; the reverse order loses the scale.
  await page.setViewportSize({ width: SIZES[s].width, height: SIZES[s].height });
  await cdp.send('Emulation.setDeviceMetricsOverride', SIZES[s]);
};
const settle = async () => { await page.waitForLoadState('networkidle'); await page.waitForTimeout(150); };
async function shot(label) {
  n += 1;
  for (const s of ['phone', 'desktop']) {
    await size(s);
    await settle();
    await page.screenshot({ path: `${OUT}/${s}-${String(n).padStart(2, '0')}-${label}.png`, fullPage: true });
  }
  await size('desktop');
}
const go = async path => { await page.goto(APP + path); await settle(); };
const save = async (click, name) => {
  const [dl] = await Promise.all([page.waitForEvent('download'), click()]);
  await dl.saveAs(`${OUT}/${name || dl.suggestedFilename()}`);
  return dl.suggestedFilename();
};

await size('desktop');
await go('/staff/login');
await shot('sign-in');

// First sign-in with the initial password: forced change.
await page.getByLabel('Email').fill('admin@example.com');
await page.getByLabel('Password').fill('dev-admin-pass-1');
await page.getByRole('button', { name: 'Sign in' }).click();
await page.getByRole('heading', { name: 'Change your password' }).waitFor();
await shot('first-sign-in-change-password');
await page.getByLabel('Current password').fill('dev-admin-pass-1');
await page.getByLabel(/New password \(at least/).fill('dev-admin-pass-2');
await page.getByLabel('New password again').fill('dev-admin-pass-2');
await page.getByRole('button', { name: 'Save new password' }).click();
await page.getByRole('heading', { name: 'Dashboard' }).waitFor();
await shot('dashboard');

await go('/staff/trainees');
await shot('trainees');
await save(() => page.getByRole('button', { name: 'Export CSV' }).click(), 'sample-export-trainees.csv');

await page.getByRole('link', { name: 'Dwayne Brooks' }).click();
await page.getByRole('heading', { name: 'Dwayne Brooks' }).waitFor();
await shot('trainee-locked-week');
await page.getByRole('button', { name: 'Reset PIN' }).click();
await page.getByText('Give this code to').waitFor();
await shot('trainee-pin-reset-code');
const pdfName = await save(() => page.getByRole('button', { name: /Download training record/ }).click(), 'sample-training-record-Dwayne-Brooks.pdf');

await go('/staff/trainees');
await page.getByRole('link', { name: 'Maria Gonzalez' }).click();
await page.getByRole('heading', { name: 'Maria Gonzalez' }).waitFor();
await shot('trainee-progress');
await save(() => page.getByRole('button', { name: /Download training record/ }).click(), 'sample-training-record-Maria-Gonzalez.pdf');

await go('/staff/results');
await shot('results');
await go('/staff/results?track=1926&result=fail');
await shot('results-filtered-1926-fails');
const csvName = await save(() => page.getByRole('button', { name: 'Export CSV' }).click(), 'sample-export-1926-fails.csv');
await go('/staff/results');
await save(() => page.getByRole('button', { name: 'Export CSV' }).click(), 'sample-export-all-results.csv');
await go('/staff/results?track=1926&view=weeks');
await shot('results-by-week');
await save(() => page.getByRole('button', { name: /Export this table/ }).click(), 'sample-export-results-by-week-1926.csv');

await go('/staff/results?track=1926&result=fail');
await page.locator('.table tbody tr a').first().click();
await page.getByText('Trainee\'s answer').first().waitFor();
await shot('attempt-detail');

await go('/staff/missed?track=1926');
await shot('most-missed');
await save(() => page.getByRole('button', { name: 'Export CSV' }).click(), 'sample-export-most-missed-1926.csv');

await go('/staff/reviewers');
await shot('reviewers');
await page.getByLabel('Full name').fill('Jamie Chen');
await page.getByLabel('Email').fill('jamie@example.com');
await page.getByRole('button', { name: 'Create invite link' }).click();
await page.getByText('Works once.').waitFor();
await shot('reviewer-invite-link');

// Approve one pending sign-up from the dashboard, to show the list after a decision.
await go('/staff');
await page.locator('.signup').filter({ hasText: 'Chris Ortega' }).getByRole('button', { name: 'Approve' }).click();
await page.locator('.signup').filter({ hasText: 'Chris Ortega' }).waitFor({ state: 'detached' });
await shot('dashboard-after-approval');

await page.getByRole('button', { name: 'Log out' }).click();
await page.getByText('You have logged out.').waitFor();
await shot('logged-out');

// The invited reviewer's one-time link.
await go('/invite/demo-invite-token-for-pat-morgan-0001');
await page.getByText('pat@example.com').waitFor();
await shot('invite-set-password');

await browser.close();
console.log(`Screenshots and samples written to ${OUT} (PDF suggested name: ${pdfName}; CSV: ${csvName})`);
