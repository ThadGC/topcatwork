/* The home enquiry card offers the stone as an OPTIONAL field; the inner
   contact pages do not (client, 27 Aug). */
import { chromium } from 'playwright';
const W = Number(process.argv[2]||1440), H = Number(process.argv[3]||900);
const PAGES = ['/', '/contact', '/about', '/estimate', '/projects'];
const b = await chromium.launch({ channel: 'chrome' });
const ctx = await b.newContext({ viewport:{width:W,height:H} });
const p = await ctx.newPage();
await p.addInitScript(()=>{try{document.documentElement.style.scrollBehavior='auto';}catch{}});
for (const path of PAGES) {
  await p.goto('http://localhost:3000'+path,{waitUntil:'domcontentloaded'}).catch(()=>{});
  await p.waitForTimeout(1400);
  await p.evaluate(()=>{const b=[...document.querySelectorAll('button,a')].find(e=>/skip intro/i.test(e.textContent||''));if(b)b.click();});
  await p.waitForTimeout(900);
  const r = await p.evaluate(() => {
    const sel = document.querySelector('#ctaStonePick');
    const chip = document.querySelector('#ctaStone');
    return {
      hasForm: !!document.querySelector('#ctaForm'),
      picker: !!sel,
      placeholder: sel ? sel.options[0].textContent : null,
      groups: sel ? [...sel.querySelectorAll('optgroup')].map(g=>g.label+':'+g.children.length) : [],
      opts: sel ? sel.options.length : 0,
      named: sel ? (sel.getAttribute('name') || '(none)') : null,
      chipHidden: chip ? chip.hasAttribute('hidden') : null,
    };
  });
  console.log(`${path.padEnd(12)} form=${r.hasForm} picker=${r.picker} opts=${r.opts} name=${r.named} groups=${r.groups.join(' ')} placeholder="${r.placeholder||''}"`);
}
// and the round trip on the home page
await p.goto('http://localhost:3000/',{waitUntil:'domcontentloaded'}).catch(()=>{});
await p.waitForTimeout(1400);
await p.evaluate(()=>{const b=[...document.querySelectorAll('button,a')].find(e=>/skip intro/i.test(e.textContent||''));if(b)b.click();});
await p.waitForTimeout(900);
const trip = await p.evaluate(async () => {
  const sel = document.querySelector('#ctaStonePick');
  const opt = [...sel.options].find(o => o.value === 'calacatta-gold' ) || sel.options[3];
  sel.value = opt.value;
  sel.dispatchEvent(new Event('change', { bubbles: true }));
  await new Promise(r=>setTimeout(r,400));
  const chip = document.querySelector('#ctaStone');
  const afterPick = { chipHidden: chip.hasAttribute('hidden'), name: document.querySelector('#ctaStoneName')?.textContent, pickerStillThere: !!document.querySelector('#ctaStonePick') };
  // what does the payload carry?
  const fd = new FormData(document.querySelector('#ctaForm'));
  if (window.TC_FORM_EXTRA) window.TC_FORM_EXTRA(fd, document.querySelector('#ctaForm'));
  const sent = [...fd.entries()].filter(([k]) => /stone/.test(k)).map(([k,v]) => k+'='+v);
  document.querySelector('#ctaStoneX')?.click();
  await new Promise(r=>setTimeout(r,400));
  return { picked: opt.value, afterPick, sent, backAfterClear: !!document.querySelector('#ctaStonePick') };
});
console.log('\nround trip:', JSON.stringify(trip, null, 1));
await ctx.close(); await b.close();
