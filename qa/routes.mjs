// Route + screenshot harness. Usage: node qa/routes.mjs <baseUrl> <outDir> [widths]
import { chromium } from 'playwright-core';
import fs from 'node:fs';
const [base='http://127.0.0.1:4173', out='qa/shots', w='375,768,1440,1920'] = process.argv.slice(2);
const widths = w.split(',').map(Number);
const routes = ['/', '/films', '/projects', '/projects/01', '/projects/02', '/services', '/process', '/studio', '/contact', '/does-not-exist'];
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome' });
const report = [];
for (const width of widths) {
  const ctx = await browser.newContext({ viewport: { width, height: width < 800 ? 812 : 900 }, deviceScaleFactor: 1 });
  for (const r of routes) {
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    const failed = [];
    page.on('requestfailed', q => failed.push(q.url()));
    page.on('response', s => { if (s.status() >= 400) failed.push(`${s.status()} ${s.url()}`); });
    await page.goto(base + r, { waitUntil: 'load', timeout: 60000 });
    await page.waitForTimeout(6000);
    const text = (await page.evaluate(() => document.body.innerText)).trim().length;
    const name = `${width}${r === '/' ? '_home' : r.replaceAll('/', '_')}.png`;
    await page.screenshot({ path: `${out}/${name}` });
    report.push({ width, route: r, textChars: text, errors: errors.slice(0, 3), failed: failed.slice(0, 5) });
    await page.close();
  }
  await ctx.close();
}
await browser.close();
fs.writeFileSync(`${out}/report.json`, JSON.stringify(report, null, 2));
for (const x of report) console.log(x.width, x.route.padEnd(16), 'text', x.textChars, 'err', x.errors.length, 'fail', x.failed.length, x.errors[0] ? '| ' + x.errors[0].slice(0, 90) : '', x.failed[0] ? '| ' + x.failed[0].slice(0, 90) : '');
