import { chromium } from 'playwright';
const b = await chromium.launch({ channel: 'chrome' });
for (const [w,h,dsf,l] of [[390,844,3,'phone'],[900,900,2,'tablet'],[1440,900,2,'desktop']]) {
  const ctx = await b.newContext({ viewport:{width:w,height:h}, deviceScaleFactor:dsf });
  const p = await ctx.newPage();
  await p.goto('http://localhost:3000/', { waitUntil:'load', timeout:45000 });
  await p.waitForTimeout(3000);
  await p.screenshot({ path:`out/top-${l}.png` });
  await ctx.close();
}
await b.close(); console.log('ok');
