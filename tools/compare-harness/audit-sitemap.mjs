/* Every URL in sitemap.xml must equal that page's own canonical, and every
   canonical on the site must appear in the sitemap. */
const SITE='https://www.topcatworktops.co.uk';
const xml=await (await fetch('http://localhost:3000/sitemap.xml')).text();
const locs=[...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
console.log('sitemap urls:', locs.length, '| unique:', new Set(locs).size);

const bad=[], missing=[];
for (const loc of locs) {
  const path = loc === SITE ? '/' : loc.slice(SITE.length);
  const r = await fetch('http://localhost:3000'+path, { redirect:'follow' });
  if (!r.ok) { bad.push(`${path} -> HTTP ${r.status}`); continue; }
  const html = await r.text();
  const m = html.match(/rel="canonical"\s+href="([^"]+)"/);
  if (!m) { missing.push(path+' (no canonical)'); continue; }
  if (m[1] !== loc) bad.push(`${path}\n     sitemap:   ${loc}\n     canonical: ${m[1]}`);
}
console.log('\nMISMATCHED or UNREACHABLE:', bad.length);
bad.slice(0,12).forEach(b=>console.log('  '+b));
console.log('NO CANONICAL:', missing.length, missing.slice(0,5).join(', '));
