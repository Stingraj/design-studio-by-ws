import { chromium } from 'playwright-core';
import fs from 'node:fs'; import { createRequire } from 'node:module';
const axe = fs.readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'), 'utf8');
const b = await chromium.launch({ channel: 'chrome' }); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
const seen = new Map();
for (const r of ['/', '/projects', '/projects/01', '/services', '/process', '/studio', '/contact']) {
  const p = await ctx.newPage(); await p.goto('http://localhost:4317' + r, { waitUntil: 'networkidle' }).catch(()=>{}); await p.waitForTimeout(1200);
  await p.addScriptTag({ content: axe });
  const v = await p.evaluate(async () => (await axe.run(document, { runOnly: ['color-contrast'] })).violations.flatMap(v => v.nodes.map(n => ({ t: n.target.join(' '), d: n.any[0]?.data, cls: document.querySelector(n.target[0])?.className?.toString?.() }))));
  for (const x of v) { const k = `${x.d?.fgColor} on ${x.d?.bgColor} ${x.d?.contrastRatio} ${x.d?.fontSize}`; if (!seen.has(k)) seen.set(k, []); seen.get(k).push(r + ' ' + x.t); }
  await p.close();
}
for (const [k, v] of seen) console.log(k, '\n   ', [...new Set(v)].slice(0, 4).join('\n    '), v.length > 4 ? `\n    …+${v.length - 4}` : '');
await b.close();
