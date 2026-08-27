import { chromium } from 'playwright';
const b=await chromium.launch({channel:'chrome'});
const p=await b.newPage({viewport:{width:1440,height:900}});
await p.goto('http://localhost:3000/contact',{waitUntil:'domcontentloaded'});
await p.waitForTimeout(2500);
console.log(await p.evaluate(()=>{
  const hosts=[...document.querySelectorAll('nextjs-portal,[data-nextjs-dev-tools-button],#__next-dev-overlay,nextjs-dev-tools-indicator')];
  const badge=hosts.map(h=>({tag:h.tagName.toLowerCase(), rect:(()=>{const r=h.getBoundingClientRect();return `${r.width.toFixed(0)}x${r.height.toFixed(0)}`})()}));
  // and anything painted in the bottom-left corner
  const corner=document.elementFromPoint(38, window.innerHeight-38);
  return {devHosts:badge, bottomLeft: corner? corner.tagName.toLowerCase()+'.'+String(corner.className).slice(0,30):null};
}));
await b.close();
