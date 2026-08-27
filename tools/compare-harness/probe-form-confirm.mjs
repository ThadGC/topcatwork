/* What the visitor SEES after submitting — success and failure. Nothing is
   emailed: the POST is answered in the page. */
import { chromium } from 'playwright';
const b=await chromium.launch({channel:'chrome'});

async function run(path, formSel, fill, ok) {
  const p=await b.newPage({viewport:{width:1440,height:900}});
  await p.goto('http://localhost:3000'+path,{waitUntil:'domcontentloaded'});
  await p.addStyleTag({content:'*{scroll-behavior:auto !important}'});
  await p.waitForTimeout(1400);
  const skip=p.locator('button',{hasText:/skip intro/i}).first();
  if(await skip.count()){await skip.click().catch(()=>{});await p.waitForTimeout(800);}
  await p.evaluate((good)=>{
    const real=window.fetch;
    window.fetch=async(u,i)=>{
      if(String(u).includes('/api/enquiry'))
        return new Response(JSON.stringify(good?{ok:true}:{ok:false,errors:['nope']}),{status:good?200:502});
      return real(u,i);
    };
  }, ok);
  await fill(p);
  await p.locator(formSel).scrollIntoViewIfNeeded().catch(()=>{}); await p.waitForTimeout(400);
  await p.locator(formSel+' button[type=submit]').first().click();
  await p.waitForTimeout(2500);
  const seen=await p.evaluate((sel)=>{
    const f=document.querySelector(sel);
    const scope=f?.closest('section,div.qform,form')?.parentElement||document.body;
    const txt=[...scope.querySelectorAll('.cta-reply,.qf-note,.tc-formnote,.qf-done,.est-reply,[role=status],[aria-live]')]
      .map(e=>({cls:e.className.toString().slice(0,26), vis:!!(e.offsetWidth||e.offsetHeight), t:(e.textContent||'').trim().slice(0,110)}))
      .filter(x=>x.t);
    return {msgs:txt, formHidden: f? getComputedStyle(f).display==='none'||!f.offsetHeight : null,
      sentClass: !!document.querySelector('.sent, .qform.sent, form.sent')};
  }, formSel);
  console.log(`${path} ${formSel} ok=${ok}:`, JSON.stringify(seen.msgs.filter(m=>m.vis)));
  await p.close();
}

const fillCta = async p => {
  await p.locator('#ctaForm input[name=name]').fill('Probe');
  await p.locator('#ctaForm input[name=email]').fill('probe@example.com');
  await p.locator('#ctaForm input[name=phone]').fill('07700 900123');
  await p.locator('#ctaForm input[name=postcode]').fill('HP1 2AB');
};
const fillQ = async p => {
  await p.locator('#qform input[name=name]').first().fill('Probe');
  await p.locator('#qform input[name=email]').first().fill('probe@example.com');
  await p.locator('#qform input[name=phone]').first().fill('07700 900123');
};
const fillPoa = async p => {
  const tab=p.locator('.est-tabs .mat-tab',{hasText:/porcelain/i}).first();
  if(await tab.count()){await tab.click();await p.waitForTimeout(800);}
  await p.locator('#estPoaForm').scrollIntoViewIfNeeded(); await p.waitForTimeout(400);
  await p.locator('#estPoaForm input[name=name]').fill('Probe');
  await p.locator('#estPoaForm input[name=email]').fill('probe@example.com');
  await p.locator('#estPoaForm input[name=phone]').fill('07700 900123');
  await p.locator('#estPoaForm input[name=postcode]').fill('HP1 2AB');
};

await run('/',        '#ctaForm',   fillCta, true);
await run('/contact', '#ctaForm',   fillCta, true);
await run('/trade',   '#qform',     fillQ,   true);
await run('/estimate','#estPoaForm',fillPoa, true);
console.log('--- failure path ---');
await run('/',        '#ctaForm',   fillCta, false);
await b.close();
