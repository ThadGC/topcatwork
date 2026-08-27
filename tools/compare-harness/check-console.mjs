import { chromium } from 'playwright';
const b = await chromium.launch();
for (const path of ['/', '/projects/']) {
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const msgs = [];
  p.on('console', (m) => { if (m.type()==='error'||m.type()==='warning') msgs.push(m.type()+': '+m.text().slice(0,180)); });
  p.on('pageerror', (e) => msgs.push('pageerror: '+String(e).slice(0,180)));
  await p.goto('http://localhost:3000'+path, { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(2500);
  if (path === '/') {
    await p.evaluate(() => { const x=[...document.querySelectorAll('button,a')].find(e=>/skip intro/i.test(e.textContent||'')); if(x)x.click(); });
    await p.waitForTimeout(1500);
  }
  await p.evaluate(() => document.getElementById('gallery')?.scrollIntoView({block:'start',behavior:'auto'}));
  await p.waitForTimeout(700);
  await p.evaluate(() => { const cs=[...document.querySelectorAll('.gal-card')]; (cs.find(c=>c.dataset.key==='harrow')||cs[0])?.click(); });
  await p.waitForTimeout(1800);
  const hyd = msgs.filter(m=>/hydrat|did not match|server.*client|Text content/i.test(m));
  console.log(path, '| total warn/err:', msgs.length, '| hydration:', hyd.length);
  msgs.slice(0,6).forEach(m=>console.log('   ', m));
  await p.close();
}
await b.close();
