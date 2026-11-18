// axe-core scan of every route plus the open dialogs. Usage: node qa/axe.mjs <baseUrl>
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const axeSource = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

const base = process.argv[2] || 'http://localhost:4317';
const routes = ['/', '/films', '/projects', '/projects/01', '/projects/02', '/services', '/process', '/studio', '/contact', '/does-not-exist'];
const browser = await chromium.launch({ channel: 'chrome' });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
const results = [];

async function scan(page, label) {
  await page.addScriptTag({ content: axeSource });
  const r = await page.evaluate(async () => {
    const res = await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] } });
    return res.violations.map(v => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.length, targets: v.nodes.slice(0, 3).map(n => n.target.join(' ')) }));
  });
  results.push({ label, violations: r });
}

for (const route of routes) {
  const page = await ctx.newPage();
  await page.goto(base + route, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(1500);
  // scroll through so lazy sections mount
  await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); } window.scrollTo(0, 0); });
  await scan(page, route);
  if (route === '/') {
    await page.locator('.home-film .film-stage').click();
    await page.waitForSelector('.film-player');
    await page.waitForTimeout(800);
    await scan(page, '/ (film player open)');
    await page.keyboard.press('Escape');
  }
  if (route === '/films') {
    for (const id of ['what-we-do', 'the-residences']) {
      await page.locator(`#${id} .film-stage`).click();
      await page.waitForSelector('.film-player'); await page.waitForTimeout(800);
      await scan(page, `/films (${id} player open)`);
      await page.keyboard.press('Escape'); await page.waitForTimeout(300);
    }
  }
  if (route === '/projects/01') {
    await page.locator('.room__lead').first().click().catch(() => {});
    await page.waitForTimeout(600);
    if (await page.locator('.lightbox').count()) await scan(page, '/projects/01 (lightbox open)');
  }
  await page.close();
}
await browser.close();
fs.writeFileSync('qa/axe-report.json', JSON.stringify(results, null, 2));
for (const r of results) {
  console.log(`${r.label}: ${r.violations.length ? '' : 'no violations'}`);
  for (const v of r.violations) console.log(`  [${v.impact}] ${v.id} ×${v.nodes} — ${v.help}\n      ${v.targets.join('\n      ')}`);
}
