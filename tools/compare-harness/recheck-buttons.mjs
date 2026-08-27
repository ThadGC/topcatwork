/* The first pass called these dead by comparing URL/scroll/DOM length, which
   cannot see a transform or a class change. This one compares PIXELS. */
import { chromium } from 'playwright';
import crypto from 'node:crypto';
const CASES = [
  ['/',        /^Read more$/,       'reviews: Read more'],
  ['/',        /^Commercial$/,      'services helix: Commercial'],
  ['/',        /^Next service$/,    'services: Next'],
  ['/stones',  /^Dark$/,            'collection: Dark chip'],
  ['/stones',  /^All tones$/,       'collection: All tones'],
  ['/estimate',/^Next stone$/,      'estimator: Next stone'],
  ['/estimate',/^Granite$/,         'estimator: Granite tab'],
  ['/about',   /Matching your slab/,'faq: Matching your slab'],
  ['/projects',/^Read more$/,       'projects: Read more'],
];
const b=await chromium.launch({channel:'chrome'});
for (const [path, rx, name] of CASES) {
  const p=await b.newPage({viewport:{width:1440,height:900}});
  await p.goto('http://localhost:3000'+path,{waitUntil:'domcontentloaded'});
  await p.addStyleTag({content:'*{scroll-behavior:auto !important}'});
  await p.waitForTimeout(1500);
  const skip=p.locator('button',{hasText:/skip intro/i}).first();
  if(await skip.count()){await skip.click().catch(()=>{});await p.waitForTimeout(800);}
  const btn=p.locator('button:visible',{hasText:rx}).first();
  if(!await btn.count()){ console.log(name.padEnd(30),'BUTTON NOT FOUND'); await p.close(); continue; }
  await btn.scrollIntoViewIfNeeded().catch(()=>{});
  await p.waitForTimeout(700);
  const hash = async () => crypto.createHash('md5').update(await p.screenshot()).digest('hex').slice(0,10);
  const before = await hash();
  await btn.click({timeout:3000}).catch(e=>console.log('   click err',String(e).slice(0,50)));
  await p.waitForTimeout(1100);           // let transitions finish
  const after = await hash();
  const url = p.url().replace('http://localhost:3000','');
  console.log(name.padEnd(30), before===after ? 'NO PIXEL CHANGE' : 'changed', '| url:', url);
  await p.close();
}
await b.close();
