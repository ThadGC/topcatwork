import { chromium } from 'playwright';
const b=await chromium.launch({channel:'chrome'});
const p=await b.newPage({viewport:{width:1440,height:900}});
await p.goto('http://localhost:3000'+(process.argv[2]||'/contact'),{waitUntil:'domcontentloaded'});
await p.waitForTimeout(1200);
console.log(await p.evaluate(()=>{
  const m=document.querySelector('main');
  const dup=[...document.querySelectorAll('[id="reviews"]')].length;
  return 'dup#reviews='+dup+'\n'+[...m.children].map((c,i)=>{
    const r=c.getBoundingClientRect();
    return `${i} <${c.tagName.toLowerCase()}${c.id?'#'+c.id:''} class="${c.className.toString().slice(0,40)}"> top=${(r.top+scrollY).toFixed(0)} h=${r.height.toFixed(0)} pos=${getComputedStyle(c).position}`;
  }).join('\n');
}));
await b.close();
