/**
 * Crawl every internal link on the NEW build and assert it resolves, then
 * check the same URL on OLD so a 404 that exists on both is not reported as a
 * regression.
 *
 *   node crawl-links.mjs [maxPages]
 */
import { chromium } from 'playwright';

const NEW = 'http://localhost:3000', OLD = 'http://localhost:8099';
const MAX = Number(process.argv[2] || 200);

const seen = new Set(['/']);
const queue = ['/'];
const linkSources = new Map();      // url -> first page that linked it
const pagesCrawled = [];

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport:{width:1440,height:900} });
const page = await ctx.newPage();

while (queue.length && pagesCrawled.length < MAX) {
  const path = queue.shift();
  let hrefs = [];
  try {
    await page.goto(NEW + path, { waitUntil:'domcontentloaded', timeout:30000 });
    await page.waitForTimeout(450);
    hrefs = await page.evaluate(() => [...document.querySelectorAll('a[href]')].map(a => a.getAttribute('href')));
  } catch { continue; }
  pagesCrawled.push(path);
  for (const h of hrefs) {
    if (!h) continue;
    if (/^(https?:|tel:|mailto:|javascript:|#)/i.test(h)) continue;
    const clean = h.split('#')[0].split('?')[0];
    if (!clean) continue;
    const abs = new URL(clean, NEW + path).pathname;
    if (seen.has(abs)) continue;
    seen.add(abs);
    linkSources.set(abs, path);
    queue.push(abs);
  }
}
console.log(`crawled ${pagesCrawled.length} pages, found ${seen.size} distinct internal URLs`);

const bad = [];
for (const u of seen) {
  const rn = await page.request.get(NEW + u, { maxRedirects: 5 }).catch(()=>null);
  const sn = rn ? rn.status() : 'ERR';
  if (sn === 200) continue;
  const ro = await page.request.get(OLD + u, { maxRedirects: 5 }).catch(()=>null);
  const so = ro ? ro.status() : 'ERR';
  bad.push({ u, sn, so, from: linkSources.get(u) || '(seed)' });
}
await browser.close();

console.log(`\nNON-200 ON NEW: ${bad.length}`);
for (const b of bad) {
  const verdict = b.so === 200 ? 'REGRESSION (old works)' : 'broken on both';
  console.log(`  ${String(b.sn).padEnd(5)} old=${String(b.so).padEnd(5)} ${verdict.padEnd(22)} ${b.u}   <- linked from ${b.from}`);
}
