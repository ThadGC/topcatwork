const orNull=el=>{ if(el) return el;
  const holder=document.createElement('div'), stub=document.createElement('div');
  holder.appendChild(stub); return stub; };
function attachSwipe(el,opts){
  if(!el)return;
  const SLOP=5;
  const cfg=Object.assign({enabled:()=>true,ignore:null,onStart:null,onMove:null,onEnd:null},opts||{});
  let on=false,axis=0,pid=null,touch=false,sx=0,sy=0,ly=0,lt=0,glide=null,freed=false;
  const VY_WIN=70;
  let vyHist=[];
  let lx=0,lxt=0,vx=0;
  const freeScroll=()=>{ if(!freed){freed=true;document.documentElement.style.scrollBehavior='auto';} };
  const restoreScroll=()=>{ if(freed){freed=false;document.documentElement.style.scrollBehavior='';} };
  const stopGlide=()=>{ if(glide!==null){cancelAnimationFrame(glide);glide=null;} restoreScroll(); };
  const killGlide=()=>{ if(glide!==null) stopGlide(); };
  window.addEventListener('pointerdown',killGlide,{capture:true,passive:true});
  window.addEventListener('touchstart',killGlide,{capture:true,passive:true});
  window.addEventListener('wheel',killGlide,{capture:true,passive:true});
  el.addEventListener('pointerdown',e=>{
    if(!cfg.enabled())return;
    if(e.pointerType==='mouse'&&e.button!==0)return;
    if(cfg.ignore&&cfg.ignore(e.target))return;
    stopGlide();
    on=true;axis=0;pid=e.pointerId;touch=e.pointerType!=='mouse';
    sx=e.clientX;sy=e.clientY;ly=e.clientY;lt=e.timeStamp||performance.now();
    vyHist=[{y:e.clientY,t:lt}];
    lx=e.clientX;lxt=lt;vx=0;
  });
  window.addEventListener('pointermove',e=>{
    if(!on||e.pointerId!==pid)return;
    const dx=e.clientX-sx,dy=e.clientY-sy;
    if(!axis){
      if(Math.abs(dx)<SLOP&&Math.abs(dy)<SLOP)return;
      axis=Math.abs(dx)>=Math.abs(dy)?1:-1;
      if(axis>0){ try{el.setPointerCapture(pid);}catch(_){} if(cfg.onStart)cfg.onStart(); }
    }
    if(axis>0){
      if(e.cancelable)e.preventDefault();
      const nx=e.timeStamp||performance.now(),dt2=Math.max(1,nx-lxt);
      vx=0.6*((e.clientX-lx)/dt2)+0.4*vx;
      lx=e.clientX;lxt=nx;
      if(cfg.onMove)cfg.onMove(dx);
      return;
    }
    if(!touch)return;
    freeScroll();
    const now=e.timeStamp||performance.now(),step=e.clientY-ly;
    ly=e.clientY;lt=now;
    vyHist.push({y:e.clientY,t:now});
    while(vyHist.length>2&&now-vyHist[0].t>VY_WIN) vyHist.shift();
    window.scrollBy(0,-step);
  },{passive:false});
  function releaseSpeed(){
    if(vyHist.length<2) return 0;
    const a=vyHist[0], b=vyHist[vyHist.length-1], dt=b.t-a.t;
    return dt>4 ? (b.y-a.y)/dt : 0;
  }
  function fling(){
    stopGlide();
    let v=Math.max(-2.6,Math.min(2.6,releaseSpeed()))*16.7;
    freeScroll();
    const step=()=>{
      v*=0.90;
      if(Math.abs(v)<0.4){glide=null;restoreScroll();return;}
      window.scrollBy(0,-v);
      glide=requestAnimationFrame(step);
    };
    glide=requestAnimationFrame(step);
  }
  function end(e){
    if(!on||(e&&e.pointerId!==pid))return;
    on=false;
    try{el.releasePointerCapture(pid);}catch(_){}
    if(axis>0){ if(cfg.onEnd)cfg.onEnd(e?e.clientX-sx:0,vx); }
    else if(axis<0&&touch&&Math.abs(releaseSpeed())>0.25){ fling(); }
    else restoreScroll();
    axis=0;pid=null;
  }
  window.addEventListener('pointerup',end);
  window.addEventListener('pointercancel',end);
}
const SS={
 "/assets/projects/ruislip-1400.webp":"/assets/projects/ruislip-560.webp 560w, /assets/projects/ruislip-1400.webp 1400w",
 "/assets/projects/central-london-1400.webp":"/assets/projects/central-london-560.webp 560w, /assets/projects/central-london-1400.webp 1400w",
 "/assets/projects/hornchurch-1400.webp":"/assets/projects/hornchurch-560.webp 560w, /assets/projects/hornchurch-1400.webp 1400w",
 "/assets/projects/harrow-1400.webp":"/assets/projects/harrow-560.webp 560w, /assets/projects/harrow-1400.webp 1400w",
 "/assets/projects/harlow-1400.webp":"/assets/projects/harlow-560.webp 560w, /assets/projects/harlow-1400.webp 1400w",
 "/assets/projects/rickmansworth-1400.webp":"/assets/projects/rickmansworth-560.webp 560w, /assets/projects/rickmansworth-1400.webp 1400w",
 "/assets/projects/watford-1400.webp":"/assets/projects/watford-560.webp 560w, /assets/projects/watford-1400.webp 1400w",
 "/assets/projects/wimbledon-1400.webp":"/assets/projects/wimbledon-560.webp 560w, /assets/projects/wimbledon-1400.webp 1400w",
 "/assets/site/hero-night-2752.webp":"/assets/site/hero-night-1400.webp 1400w, /assets/site/hero-night-2000.webp 2000w, /assets/site/hero-night-2752.webp 2752w",
 "/assets/site/cta-slab-2752.webp":"/assets/site/cta-slab-1958.webp 1958w, /assets/site/cta-slab-2752.webp 2752w",
 "/assets/site/kitchen-day-1188.webp":"/assets/site/kitchen-day-626.webp 626w, /assets/site/kitchen-day-1188.webp 1188w",
 "/assets/site/quarry-955.webp":"/assets/site/quarry-518.webp 518w, /assets/site/quarry-955.webp 955w",
 "/assets/site/service-dining-2400.webp":"/assets/site/service-dining-880.webp 880w, /assets/site/service-dining-1600.webp 1600w, /assets/site/service-dining-2400.webp 2400w",
 "/assets/site/service-bathrooms-2400.webp":"/assets/site/service-bathrooms-880.webp 880w, /assets/site/service-bathrooms-1600.webp 1600w, /assets/site/service-bathrooms-2400.webp 2400w",
 "/assets/site/service-outdoor-2400.webp":"/assets/site/service-outdoor-880.webp 880w, /assets/site/service-outdoor-1600.webp 1600w, /assets/site/service-outdoor-2400.webp 2400w",
 "/assets/site/service-fireplaces-1550.webp":"/assets/site/service-fireplaces-880.webp 880w, /assets/site/service-fireplaces-1550.webp 1550w",
 "/assets/site/service-vanity-2400.webp":"/assets/site/service-vanity-880.webp 880w, /assets/site/service-vanity-1600.webp 1600w, /assets/site/service-vanity-2400.webp 2400w",
 "/assets/site/service-commercial-bar-2400.webp":"/assets/site/service-commercial-bar-880.webp 880w, /assets/site/service-commercial-bar-1600.webp 1600w, /assets/site/service-commercial-bar-2400.webp 2400w",
 "/assets/site/service-splash-hob-1200.webp":"/assets/site/service-splash-hob-880.webp 880w, /assets/site/service-splash-hob-1200.webp 1200w",
 "/assets/site/service-worktops-quartz-2400.webp":"/assets/site/service-worktops-quartz-880.webp 880w, /assets/site/service-worktops-quartz-1600.webp 1600w, /assets/site/service-worktops-quartz-2400.webp 2400w",
 "/assets/site/process-quote-plans-1600.webp":"/assets/site/process-quote-plans-880.webp 880w, /assets/site/process-quote-plans-1600.webp 1600w",
 "/assets/site/about-fitting-386.webp":"/assets/site/about-fitting-248.webp 248w, /assets/site/about-fitting-386.webp 386w",
 "/assets/site/process-consult-shake-1600.webp":"/assets/site/process-consult-shake-880.webp 880w, /assets/site/process-consult-shake-1600.webp 1600w",
 "/assets/site/process-install-hands-1516.webp":"/assets/site/process-install-hands-880.webp 880w, /assets/site/process-install-hands-1516.webp 1516w",
 "/assets/site/about-handshake-900.webp":"/assets/site/about-handshake-600.webp 600w, /assets/site/about-handshake-900.webp 900w",
 "assets/team/handshake.jpg":"/assets/site/team-handshake-600.webp 600w, /assets/site/team-handshake-900.webp 900w",
 "assets/team/samples.jpg":"/assets/site/team-samples-248.webp 248w, /assets/site/team-samples-386.webp 386w",
 "assets/team/fitting.jpg":"/assets/site/team-fitting-248.webp 248w, /assets/site/team-fitting-386.webp 386w"
};
function ss(u,z){ const s=SS[u]; return s?` srcset="${s}" sizes="${z}"`:''; }
const SERVICES=[
  {t:"Kitchen Worktops",long:"Worktops cut from a single slab where the run allows, islands with mitred waterfall ends that fold the stone to the floor, templated to the millimetre and fitted by our own team.",href:"/services/kitchen-worktops.html",img:"/assets/site/service-worktops-quartz-2400.webp"},
  {t:"Splashbacks",long:"The same stone carried up the wall, cut around sockets and hobs, with no grout lines and no visual break above the worktop.",href:"/services/splashbacks.html",img:"/assets/site/service-splash-hob-1200.webp"},
  {t:"Bathrooms",long:"Shower surrounds, thresholds and window sills cut from one stone, so the room reads as a single material rather than a set of parts.",href:"/services/bathroom-worktops.html",img:"/assets/site/service-bathrooms-2400.webp"},
  {t:"Outdoor Spaces",long:"Weatherproof stone for garden kitchens, barbecue runs and outdoor bars, cut to fit around sinks, hobs and built-in appliances.",href:"/services/outdoor-kitchens.html",img:"/assets/site/service-outdoor-2400.webp"},
  {t:"Fireplaces",long:"Hearths, surrounds and mantels cut to your opening and finished by hand, in the same stone as the rest of the house if you want the rooms to tie together.",href:"/services/fireplaces.html",img:"/assets/site/service-fireplaces-1550.webp"},
  {t:"Dining Tables",long:"Table and console tops cut to your shape and edge profile, in the same stone as the kitchen, so the piece reads as part of the room rather than as furniture bought separately.",href:"/services/dining-tables.html",img:"/assets/site/service-dining-2400.webp"},
  {t:"Vanity Tops",long:"Basin tops cut for undermount or countertop basins, with the tap holes exactly where you want them and the edges finished to match.",href:"/services/vanity-tops.html",img:"/assets/site/service-vanity-2400.webp"},
  {t:"Commercial",long:"Reception desks, counters and washroom surfaces for offices, bars and shops, fitted to your programme by one team.",href:"/services/commercial-worktops.html",img:"/assets/site/service-commercial-bar-2400.webp"}
];
const flipIcon='<svg viewBox="0 0 24 24"><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M3 21v-5h5"/></svg>';
const backIcon='<svg viewBox="0 0 24 24"><path d="M9 5l-7 7 7 7"/><path d="M2 12h20"/></svg>';
function phImg(label){
  const svg=`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 320'>
    <defs><linearGradient id='pg' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='#20202a'/><stop offset='1' stop-color='#0d0d11'/></linearGradient></defs>
    <rect width='400' height='320' fill='url(#pg)'/>
    <g fill='none' stroke='#C6A664' stroke-width='1.3' opacity='0.5'>
      <rect x='163' y='96' width='74' height='53' rx='6'/><circle cx='200' cy='123' r='13'/><path d='M176 96l8-12h32l8 12'/>
    </g>
    <text x='200' y='178' fill='#F4F1EA' font-family='Montserrat,sans-serif' font-size='10' letter-spacing='3' text-anchor='middle' opacity='0.42'>PHOTO TO COME</text>
  </svg>`;
  return 'data:image/svg+xml;utf8,'+encodeURIComponent(svg);
}
const moreIcon='<svg viewBox="0 0 24 24"><path d="M5 12h14"/><path d="M13 6l6 6-6 6"/></svg>';
function buildCards(container, items, opts){
  if(!container) return;
  opts=opts||{};
  items.forEach((s,i)=>{
    const el=document.createElement('article');
    el.className='svc enter';el.tabIndex=0;el.style.setProperty('--d',(i*150)+'ms');
    const idx='0'+(i+1);
    const img=s.img||phImg(s.ph||s.t.toUpperCase());
    const frontDesc=opts.nameOnly?'':`<p class="desc">${s.d}</p>`;
    const backCta=(opts.readMore&&s.href)
      ? `<a class="svc-more" href="${s.href}" onclick="event.stopPropagation()">Read more ${moreIcon}</a>`
      : `<span class="flip-hint">${backIcon} Back</span>`;
    el.innerHTML=`
      <div class="svc-inner">
        <div class="face front">
          <div class="stone"><img src="${img}"${ss(img,"(max-width:720px) 440px, 1160px")} alt="${s.t}" loading="lazy" decoding="async"></div>
          <div class="veil"></div><div class="sheen"></div>
          <div class="front-text">
            <div class="idx">${idx}</div>
            <div class="ft-bottom">
              <h3>${s.t}</h3>
              ${frontDesc}
              <span class="flip-hint">${flipIcon} Click for details</span>
            </div>
          </div>
        </div>
        <div class="face back">
          <div class="stone"><img src="${img}"${ss(img,"(max-width:720px) 440px, 1160px")} alt="" loading="lazy" decoding="async"></div>
          <div class="veil"></div>
          <div class="back-text">
            <div class="idx">${idx}</div>
            <h3>${s.t}</h3>
            <p>${s.long}</p>
            ${backCta}
          </div>
        </div>
      </div>`;
    el.addEventListener('click',()=>el.classList.toggle('flipped'));
    el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();el.classList.toggle('flipped');}});
    container.appendChild(el);
  });
}
const PROCESS=[
  {t:"Consultation",img:"/assets/site/process-consult-shake-1600.webp",d:"We visit, understand the space, and guide you to the right stone.",
   d:"Understanding your space and style.",
   long:"We start at your kitchen, understanding the space, how you live in it, and the look you're after, then guide you to the material and finish that fit, with no pressure and no jargon."},
  {t:"Design & Quote",img:"/assets/site/process-quote-plans-1600.webp",d:"Layout, edges and a clear quote with no hidden costs.",
   d:"A clear, itemised plan and price.",
   long:"We plan the layout, edge profiles, joints and cut-outs, then give you a clear, itemised quote covering template, fabrication and installation, the price you see is the price you pay."},
  {t:"Template & Craft",img:"/assets/site/process-template-678.webp",d:"Templated by hand to the millimetre, then precision-cut and polished.",
   d:"Measured and cut to the millimetre.",
   long:"Once your units are level we template the space by hand to a fraction of a millimetre. Your slab is then precision-cut and polished by our own experienced fabricators, cut wet to full safety standards, with the veining matched through the joints before we fit it ourselves."},
  {t:"Install & Enjoy",img:"/assets/site/process-install-hands-1516.webp",d:"Fitted cleanly and precisely, usually within days.",
   d:"Fitted cleanly, usually within days.",
   long:"Our team fits your worktop cleanly and precisely, usually within days of templating, squared, sealed and ready to use. Then the kitchen is yours to enjoy."}
];
const PROC_COPY=[
  "We visit, look at the space, and help you choose.",
  "One itemised price, agreed before anything is cut.",
  "Templated by us, cut and polished to that template.",
  "Fitted and sealed, usually within days."
];
(function(){
  const flow=document.getElementById('procFlow');
  if(!flow||typeof PROCESS==='undefined') return;
  const AREAS=['pt-a','pt-b','pt-c','pt-d'];
  const tiles=PROCESS.map((p,i)=>{
    const el=document.createElement('article');
    el.className='ptile glow-card '+AREAS[i];
    el.setAttribute('role','button');
    el.setAttribute('tabindex','0');
    el.setAttribute('aria-label',p.t+', read more about this step');
    el.innerHTML=`<img src="${p.img}"${ss(p.img,"(max-width:720px) 345px, 515px")} alt="${p.t}" draggable="false" loading="lazy" decoding="async">
      <div class="pt-scrim"></div><div class="sheen"></div>
      <span class="pt-pill">${i+1}</span>
      <div class="pt-text"><h3 class="pt-name">${p.t}</h3><p class="pt-line">${PROC_COPY[i]}</p>
        <span class="pt-more">Read more <span aria-hidden="true">&rsaquo;</span></span></div>`;
    flow.appendChild(el);
    return el;
  });
  const banner=document.createElement('article');
  banner.className='ptile glow-card pt-e';
  banner.innerHTML=`<span class="pt-pill">5</span><span class="pe-label">Aftercare</span>
    <div class="pe-big"><b>72h</b><span>on site again if anything needs attention</span></div>
    <span class="pe-sep" aria-hidden="true"></span>
    <div class="pe-item"><b>10-year</b><span>guarantee, in writing</span></div>`;
  flow.appendChild(banner);
  tiles.push(banner);
  setTimeout(()=>{ tiles.forEach(el=>attachGlow(el)); },0);
  const PAIRS=[[0,1],[1,2],[3,4]];
  const arrows=PAIRS.map((pair,k)=>{
    const a=document.createElement('span');
    a.className='pt-arrow'; a.setAttribute('aria-hidden','true');
    a.textContent='\u203a';
    a.style.setProperty('--ad',(0.6+k*0.25)+'s');
    flow.appendChild(a);
    return {el:a,pair};
  });
  function measure(){
    if(window.innerWidth<=980) return;
    arrows.forEach(({el,pair})=>{
      const L=tiles[pair[0]], R=tiles[pair[1]];
      el.style.left=((L.offsetLeft+L.offsetWidth+R.offsetLeft)/2)+'px';
      el.style.top=(L.offsetTop+L.offsetHeight/2)+'px';
    });
  }
  const PROC_DETAIL=[
    {lede:"A free home visit, usually about an hour, in the room the worktop is going into. No obligation and nobody trying to close you on the day.",
     points:[["What happens","We look at the space together, talk through how you actually use the kitchen, and measure roughly so we can price it properly."],
             ["What we bring","Samples, so you can see the stone in your own light rather than under a showroom spotlight."],
             ["What you get","An honest steer on the material that suits your life, including when the cheaper option is the better one."]]},
    {lede:"One clear, itemised quote, put together after the visit and explained line by line. The price we agree is the price you pay.",
     points:[["What we plan","Layout, edge profiles, where the joints fall and how they are vein matched, plus every cut-out."],
             ["What is included","Template, fabrication, fitting and VAT. Cut-outs, drainer grooves and pencil edges come as standard, not as extras."],
             ["What happens next","Nothing until you say so. We only order and cut once you have approved the quote and the slab."]]},
    {lede:"The precise part. We template off your real cabinets, then your slab is cut and polished to that template.",
     points:[["Templating","Measured by hand to a fraction of a millimetre, once the units are level and secure. Getting this right is what stops surprises on fitting day."],
             ["In the workshop","Your slab is cut wet to current HSE standards and polished by hand, with the veining matched across every joint before it leaves us."],
             ["Your slab","You approve the actual piece from photographs first, so the stone you chose is the stone that arrives."]]},
    {lede:"Fitting day, usually within days of templating. Our own team, on the date we agreed.",
     points:[["On the day","Floors protected, the worktop squared, sealed and the joints finished on site. Most kitchens are done inside a day."],
             ["Before we leave","We walk it with you and sign it off together, and take the packaging away with us."],
             ["Afterwards","A ten-year guarantee in writing, and if anything needs attention we are back on site inside 72 hours."]]}
  ];
  const modal=document.createElement('div');
  modal.className='pmodal'; modal.id='procModal';
  modal.setAttribute('role','dialog'); modal.setAttribute('aria-modal','true');
  modal.setAttribute('aria-labelledby','pmTitle'); modal.hidden=true;
  modal.innerHTML=`<div class="pmodal-veil" data-close></div>
    <div class="pmodal-card">
      <button type="button" class="pm-x" data-close aria-label="Close">&times;</button>
      <div class="pm-shot"><img alt="" id="pmShot" draggable="false"><span class="pm-badge" id="pmBadge"></span></div>
      <div class="pm-body">
        <h3 class="pm-title" id="pmTitle"></h3>
        <p class="pm-lede" id="pmLede"></p>
        <ul class="pm-points" id="pmPoints"></ul>
        <div class="pm-foot">
          <a class="rev-cta-primary" href="#cta" data-close>Get in touch</a>
          <a class="rev-cta-ghost" href="tel:+448000982812">Call us</a>
        </div>
      </div>
    </div>`;
  document.body.appendChild(modal);
  const pmShot=modal.querySelector('#pmShot'), pmBadge=modal.querySelector('#pmBadge'),
        pmTitle=modal.querySelector('#pmTitle'), pmLede=modal.querySelector('#pmLede'),
        pmPoints=modal.querySelector('#pmPoints'), pmX=modal.querySelector('.pm-x');
  let lastFocus=null,detailOpen=false;
  function openDetail(i){
    const p=PROCESS[i], d=PROC_DETAIL[i];
    lastFocus=document.activeElement;
    pmShot.src=p.img; pmShot.alt=p.t;
    pmBadge.textContent=String(i+1);
    pmTitle.textContent=p.t;
    pmLede.textContent=d.lede;
    pmPoints.innerHTML='';
    d.points.forEach(([k,v])=>{
      const li=document.createElement('li');
      const ks=document.createElement('span'); ks.className='pk'; ks.textContent=k;
      const vs=document.createElement('span'); vs.className='pv'; vs.textContent=v;
      li.append(ks,vs); pmPoints.appendChild(li);
    });
    modal.hidden=false; detailOpen=true;
    requestAnimationFrame(()=>{ if(detailOpen) modal.classList.add('open'); });
    document.documentElement.style.overflow='hidden';
    pmX.focus();
  }
  function closeDetail(){
    if(!detailOpen) return;
    detailOpen=false;
    modal.classList.remove('open');
    document.documentElement.style.overflow='';
    setTimeout(()=>{ if(!detailOpen) modal.hidden=true; },350);
    if(lastFocus&&lastFocus.focus&&lastFocus!==document.body) lastFocus.focus();
    else pmX.blur();
  }
  modal.addEventListener('click',e=>{ if(e.target.closest('[data-close]')) closeDetail(); });
  document.addEventListener('keydown',e=>{ if(e.key==='Escape'&&detailOpen) closeDetail(); });
  tiles.slice(0,4).forEach((el,i)=>{
    el.addEventListener('click',()=>openDetail(i));
    el.addEventListener('keydown',e=>{
      if(e.key==='Enter'||e.key===' '){ e.preventDefault(); openDetail(i); }
    });
  });
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce){
    flow.classList.add('flow','still');
    measure();
  }else{
    const PR_ON=0.80, PR_OFF=0.97;
    let on=false;
    function check(){
      const topFrac=flow.getBoundingClientRect().top/(window.innerHeight||1);
      if(!on&&topFrac<PR_ON){ on=true; flow.classList.add('flow'); }
      else if(on&&topFrac>PR_OFF){ on=false; flow.classList.remove('flow'); }
    }
    (function boot(){
      if(!flow.clientWidth){ setTimeout(boot,120); return; }
      measure(); check();
    })();
    window.addEventListener('scroll',check,{passive:true});
    window.addEventListener('resize',()=>{ measure(); check(); });
  }
})();
buildCards(document.getElementById('svcGridServices'), SERVICES, {nameOnly:true, readMore:true});
(function(){
  const grid=document.getElementById('svcGridServices');
  if(!grid) return;
  const built=[...grid.children];
  const PHONE_ORDER=built.map((_,i)=>i);
  const svcMode=()=>(getComputedStyle(grid).getPropertyValue('--svcMode').trim()||'desktop');
  let applied=null;
  function arrange(){
    const mode=svcMode();
    if(mode===applied) return;
    applied=mode;
    const seq=(mode==='phone')
      ? (()=>{const picked=PHONE_ORDER.map(i=>built[i]).filter(Boolean);
              return picked.concat(built.filter(el=>!picked.includes(el)));})()
      : built;
    const current=[...grid.children];
    if(seq.length===current.length && seq.every((el,n)=>el===current[n])) return;
    seq.forEach((el,n)=>{
      grid.appendChild(el);
      el.querySelectorAll('.idx').forEach(x=>{x.textContent='0'+(n+1);});
      el.style.setProperty('--si',n);
    });
  }
  function hrefFor(card){
    const i=built.indexOf(card);
    return (i>=0 && SERVICES[i]) ? SERVICES[i].href : null;
  }
  function intercept(e){
    if(svcMode()!=='phone') return;
    const card=e.target.closest && e.target.closest('.svc');
    if(!card || !grid.contains(card)) return;
    if(e.target.closest('a')) return;
    const href=hrefFor(card);
    if(!href) return;
    e.stopPropagation(); e.preventDefault();
    location.href=href;
  }
  grid.addEventListener('click',intercept,true);
  grid.addEventListener('keydown',e=>{
    if(e.key!=='Enter' && e.key!==' ') return;
    intercept(e);
  },true);
  function label(){
    const phone=svcMode()==='phone';
    built.forEach((el,i)=>{
      const s=SERVICES[i];
      if(phone && s && s.href){ el.setAttribute('role','link'); el.setAttribute('aria-label',s.t); }
      else { el.removeAttribute('role'); el.removeAttribute('aria-label'); }
    });
  }
  function sync(){ arrange(); label(); }
  function setHeroScale(){
    var v = innerWidth >= 1121 ? Math.max(0.70, Math.min(innerWidth / 1440, innerHeight / 900, 1)) : 1;
    document.documentElement.style.setProperty('--heroScale', String(Math.round(v * 1000) / 1000));
  }
  setHeroScale();
  addEventListener('resize', setHeroScale, {passive:true});
  const svcSec=document.getElementById('services');
  const svcWrap=svcSec&&svcSec.querySelector('.svc-wrap');
  function setSvcFit(){
    if(!svcWrap)return;
    if(innerWidth<1121){
      document.documentElement.style.setProperty('--svcFit','1');
      svcWrap.style.marginBottom=''; return;
    }
    document.documentElement.style.setProperty('--svcFit','1');
    svcWrap.style.marginBottom='0px';
    svcWrap.style.flex='0 0 auto';
    const nat=svcWrap.getBoundingClientRect().height;
    svcWrap.style.flex='';
    if(!nat)return;
    const cs=getComputedStyle(svcSec);
    const avail=innerHeight-parseFloat(cs.paddingTop)-parseFloat(cs.paddingBottom);
    const k=Math.max(0.74,Math.min(1,avail/nat));
    document.documentElement.style.setProperty('--svcFit',String(Math.round(k*1000)/1000));
    if(k<1){ svcWrap.style.flex='0 0 auto'; svcWrap.style.marginBottom=((k-1)*nat).toFixed(1)+'px'; }
    else { svcWrap.style.flex=''; svcWrap.style.marginBottom='0px'; }
  }
  setSvcFit();
  addEventListener('resize', setSvcFit, {passive:true});
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(setSvcFit);
  sync();
  addEventListener('resize',sync,{passive:true});
})();
const svcRevealCards=[...document.querySelectorAll('#services .svc')];
const svcReduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if(svcReduce){
  svcRevealCards.forEach(el=>{ el.classList.remove('enter'); el.style.opacity='1'; });
}else{
  svcRevealCards.forEach((el,i)=>{ el.classList.remove('enter'); el.classList.add('svc-rev'); el.style.setProperty('--si',i); });
  function measureSvcOffsets(){
    svcRevealCards.forEach(el=>{
      const pt=el.style.transition, pf=el.style.transform;
      el.style.transition='none'; el.style.transform='none';
      const r=el.getBoundingClientRect();
      el.style.setProperty('--svcFrom',Math.round((window.innerWidth||1200)-r.left+60)+'px');
      el.style.transform=pf; void el.offsetWidth; el.style.transition=pt;
    });
  }
  const SVC_ON=0.78, SVC_OFF=0.94;
  let svcShown=false;
  function checkSvcReveal(){
    const grid=document.getElementById('svcGridServices'); if(!grid)return;
    const topFrac=grid.getBoundingClientRect().top/(window.innerHeight||1);
    if(!svcShown && topFrac<SVC_ON){ svcShown=true;  svcRevealCards.forEach(el=>el.classList.add('revealed')); }
    else if(svcShown && topFrac>SVC_OFF){ svcShown=false; svcRevealCards.forEach(el=>el.classList.remove('revealed')); }
  }
  measureSvcOffsets();
  checkSvcReveal();
  window.addEventListener('scroll',checkSvcReveal,{passive:true});
  window.addEventListener('resize',()=>{ measureSvcOffsets(); checkSvcReveal(); });
  window.addEventListener('load',()=>{ measureSvcOffsets(); checkSvcReveal(); });
}
(function(){
  const stage=document.getElementById('helixStage');
  const nav=document.getElementById('svcNav');
  if(!stage||!nav) return;
  const ORDER=[0,1,7,3,4,5,6,2];
  const items=ORDER.map(i=>SERVICES[i]);
  const N=items.length;
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cards=items.map((s,j)=>{
    const el=document.createElement('article');
    el.className='helix-card';
    el.setAttribute('role','group');
    el.setAttribute('aria-label',s.t);
    const hxImg=s.img||phImg(s.ph||s.t.toUpperCase());
    const hxLink=s.href?`<a class="hx-link" href="${s.href}">View this service</a>`:'';
    el.innerHTML=`<div class="hx-face hx-front glow-card"><img src="${hxImg}"${ss(hxImg,"(max-width:720px) 210px, 385px")} alt="${s.t}" draggable="false" loading="lazy" decoding="async"><div class="hx-veil"></div>
      <div class="hx-meta"><h3 class="hx-name">${s.t}</h3>
      ${hxLink}</div></div>
      <div class="hx-face hx-back glow-card"><div class="hx-back-frame"><span class="hx-back-diamond"></span><span class="hx-back-word">Topcat</span><span class="hx-back-sub">Worktops</span></div></div>`;
    el.addEventListener('click',()=>{
      if(el.classList.contains('hx-ghost')) return;
      if(!el.classList.contains('front')) goTo(j);
    });
    stage.appendChild(el);
    return el;
  });
  setTimeout(()=>{
    cards.forEach((el,j)=>{
      attachGlow(el);
      const back=el.querySelector('.hx-back');
      if(back && typeof marble==='function'){
        const svg=marble('calacatta',611+j*37)
          .replace('preserveAspectRatio="xMidYMid slice"','preserveAspectRatio="none"');
        back.style.backgroundImage=
          "url('data:image/svg+xml;charset=utf-8,"+encodeURIComponent(svg)+"')";
      }
    });
  },0);
  const navBtns=items.map((s,j)=>{
    const b=document.createElement('button');
    b.type='button'; b.textContent=s.t;
    b.setAttribute('role','tab');
    b.addEventListener('click',()=>goTo(j));
    nav.appendChild(b);
    return b;
  });
  let target=0, cur=0, raf=null, last=0;
  let R=280, STEP=110;
  const SCRUB=0.12;
  const ENT=cards.map(()=>0);
  const EN_BACK=340;
  const EN_RISE=40;
  const EN_SHRINK=0.12;
  const EN_DUR=820;
  const EN_GAP=265;
  const restD=j=>j>N/2?j-N:j;
  const EN_SLOT=[]; let _slot=0;
  cards.map((_,j)=>j).sort((a,b)=>restD(b)-restD(a)).forEach(j=>{
    EN_SLOT[j]=Math.abs(restD(j))<N/2 ? _slot++ : 0;
  });
  const hxMode=()=>(getComputedStyle(stage).getPropertyValue('--hxMode').trim()||'desktop');
  let phoneHx=false;
  function metrics(){
    const r=stage.getBoundingClientRect();
    if(!r.width||!r.height) return;
    phoneHx=hxMode()==='phone';
    if(phoneHx){
      const w=Math.max(200,Math.min(320,r.width*0.70));
      stage.style.setProperty('--hxW',Math.round(w)+'px');
      stage.style.setProperty('--hxH',Math.round(w*0.66)+'px');
      R=Math.max(130,Math.min(250,r.width*0.56));
      STEP=Math.max(56,Math.min(104,r.height*0.175));
      return;
    }
    const w=Math.max(300,Math.min(470,r.width*0.56));
    stage.style.setProperty('--hxW',Math.round(w)+'px');
    stage.style.setProperty('--hxH',Math.round(w*0.66)+'px');
    R=Math.max(210,Math.min(375,r.width*0.36));
    STEP=Math.max(96,Math.min(165,r.height*0.26));
  }
  const mod=(v,n)=>((v%n)+n)%n;
  const ANG_STEP=60;
  const YAW_STEP=ANG_STEP*0.9;
  function render(){
    for(let j=0;j<N;j++){
      let d=mod(j-cur,N); if(d>N/2)d-=N;
      const th=d*ANG_STEP*Math.PI/180;
      const c=(Math.cos(th)+1)/2;
      const x=Math.sin(th)*R, z=(Math.cos(th)-1)*R, y=-d*STEP;
      const yaw=d*YAW_STEP;
      const s=0.68+0.32*c;
      const edge=Math.max(0,Math.abs(d)-2);
      const el=cards[j];
      const en=ENT[j], k=1-en;
      el.style.transform=`translate3d(${x.toFixed(1)}px,${(y-k*EN_RISE).toFixed(1)}px,${(z-k*EN_BACK).toFixed(1)}px) rotateY(${yaw.toFixed(2)}deg) scale(${(s*(1-k*EN_SHRINK)).toFixed(3)})`;
      let o=(1-edge)*(0.92+0.08*c)*en;
      let live=true;
      if(phoneHx){
        const ad=Math.abs(d);
        const vis=ad<=1 ? 1 : (ad<=2 ? 1-(ad-1)*0.68 : Math.max(0,0.32*(3-ad)));
        o=Math.min(o,vis*en);
        live=ad<1.5;
      }
      el.style.setProperty('--hxO',o.toFixed(3));
      el.style.setProperty('--hxB',(0.5+0.5*c).toFixed(3));
      el.style.pointerEvents=(o<0.1||!live)?'none':'auto';
      el.classList.toggle('hx-ghost',!live);
      el.style.zIndex=String(10+Math.round(c*100));
      const front=Math.abs(d)<0.5;
      el.classList.toggle('front',front);
      el.style.setProperty('--hxDetail',Math.max(0,1-Math.abs(d)*2.2).toFixed(3));
    }
  }
  function frame(now){
    raf=null;
    const dt=Math.min(Math.max((now-last)/1000,0),0.1); last=now;
    const f=reduce?1:1-Math.pow(1-SCRUB,dt*60);
    cur+=(target-cur)*f;
    if(Math.abs(target-cur)<0.001)cur=target;
    render();
    if(cur!==target) raf=requestAnimationFrame(frame);
  }
  const kick=()=>{ if(raf===null){ last=performance.now(); raf=requestAnimationFrame(frame); } };
  function markActive(){
    const on=mod(Math.round(target),N);
    navBtns.forEach((b,j)=>{ b.classList.toggle('on',j===on); b.setAttribute('aria-selected',j===on?'true':'false'); });
  }
  function goTo(j){
    let d=mod(j-mod(target,N),N); if(d>N/2)d-=N;
    target+=d; markActive(); kick();
  }
  document.getElementById('helixNext')?.addEventListener('click',()=>{ target+=1; markActive(); kick(); });
  document.getElementById('helixPrev')?.addEventListener('click',()=>{ target-=1; markActive(); kick(); });
  let hxDragging=false, hxMoved=false, hxStartX=0, hxStartTarget=0;
  const hxStep=()=>{
    const w=stage.getBoundingClientRect().width||900;
    return hxMode()==='phone' ? Math.max(78,w*0.34) : Math.max(180,w*0.33);
  };
  function hxDown(x){ hxDragging=true; hxMoved=false; hxStartX=x; hxStartTarget=target; stage.classList.add('dragging'); }
  function hxMove(x){
    if(!hxDragging) return;
    const dx=x-hxStartX;
    if(Math.abs(dx)>4) hxMoved=true;
    target=hxStartTarget-dx/hxStep();
    markActive(); kick();
  }
  function hxUp(){
    if(!hxDragging) return;
    hxDragging=false; stage.classList.remove('dragging');
    target=Math.round(target); markActive(); kick();
    if(hxMoved) setTimeout(()=>{ hxMoved=false; },0);
  }
  const hxPhone=()=>hxMode()==='phone';
  stage.addEventListener('mousedown',e=>{ if(hxPhone())return; e.preventDefault(); hxDown(e.clientX); });
  window.addEventListener('mousemove',e=>{ if(hxPhone())return; hxMove(e.clientX); });
  window.addEventListener('mouseup',()=>{ if(hxPhone())return; hxUp(); });
  stage.addEventListener('touchstart',e=>{ if(hxPhone())return; hxDown(e.touches[0].clientX); },{passive:true});
  stage.addEventListener('touchmove',e=>{ if(hxPhone())return; hxMove(e.touches[0].clientX); },{passive:true});
  stage.addEventListener('touchend',()=>{ if(hxPhone())return; hxUp(); });
  attachSwipe(stage,{
    enabled:hxPhone,
    onStart:()=>{ hxDown(0); },
    onMove:dx=>hxMove(dx),
    onEnd:()=>hxUp()
  });
  stage.addEventListener('click',e=>{ if(hxMoved){ e.stopPropagation(); e.preventDefault(); hxMoved=false; } },true);
  let hxAccum=0, hxCooldown=0;
  stage.addEventListener('wheel',e=>{
    if(Math.abs(e.deltaX) < Math.abs(e.deltaY)*2) return;
    e.preventDefault();
    const now=performance.now();
    hxAccum+=e.deltaX;
    if(now>=hxCooldown && Math.abs(hxAccum)>24){
      target=Math.round(target)+(hxAccum>0?1:-1);
      hxAccum=0; hxCooldown=now+300;
      markActive(); kick();
    }
  },{passive:false});
  let entPlayed=false, entRaf=null, entT0=null;
  function entFrame(now){
    if(entT0===null)entT0=now;
    const ms=now-entT0;
    let all=true;
    for(let j=0;j<N;j++){
      const u=Math.max(0,Math.min(1,(ms-EN_SLOT[j]*EN_GAP)/EN_DUR));
      if(u<1)all=false;
      ENT[j]=1-Math.pow(1-u,3);
    }
    render();
    entRaf=all?null:requestAnimationFrame(entFrame);
  }
  function watchEntrance(){
    if(entPlayed)return;
    if(reduce){ entPlayed=true; ENT.fill(1); render(); return; }
    const io=new IntersectionObserver(es=>{
      for(const e of es){
        if(entPlayed||!e.isIntersecting)continue;
        if(e.intersectionRatio<0.42 && e.boundingClientRect.top>0)continue;
        entPlayed=true; io.disconnect();
        entRaf=requestAnimationFrame(entFrame);
      }
    },{threshold:[0,0.42]});
    io.observe(stage);
  }
  let booted=false, tries=0;
  function footToCallUs(){
    const wrap=document.querySelector('.svc-helix');
    const row=wrap&&wrap.parentElement;
    const ui=wrap&&wrap.querySelector('.helix-ui');
    const intro=document.querySelector('#services .svc-intro');
    const ctas=document.querySelectorAll('#services .svc-intro-ctas a');
    const call=ctas[ctas.length-1];
    if(!wrap||!row||!ui||!intro||!call) return;
    const tf=getComputedStyle(intro).transform;
    const riseY=(tf&&tf!=='none'&&window.DOMMatrixReadOnly)?new DOMMatrixReadOnly(tf).m42:0;
    const cb=call.getBoundingClientRect();
    const gap=row.getBoundingClientRect().bottom-(cb.bottom-riseY)
             -(ui.getBoundingClientRect().height-cb.height)/2;
    wrap.style.setProperty('--helixFoot',Math.max(0,gap).toFixed(2)+'px');
  }
  function boot(){
    footToCallUs();
    const r=stage.getBoundingClientRect();
    if(!r.width||!r.height){ if(++tries<20) setTimeout(boot,150); return; }
    booted=true; metrics(); cur=target; render(); markActive(); watchEntrance();
  }
  boot();
  if(window.ResizeObserver){
    const ro=new ResizeObserver(()=>{ footToCallUs(); if(booted) metrics(); });
    ['#services .svc-intro .section-title','#services .svc-intro .section-sub','#svcNav']
      .forEach(s=>{ const el=document.querySelector(s); if(el) ro.observe(el); });
  }
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(footToCallUs);
  window.addEventListener('load',footToCallUs);
  window.addEventListener('resize',()=>{ if(!booted){ tries=0; boot(); return; } footToCallUs(); metrics(); render(); });
})();
let UID=0;
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function vein(rng,w,h,startTop){
  let x=startTop?rng()*w:-20, y=startTop?-20:rng()*h;
  let d=`M ${x.toFixed(0)} ${y.toFixed(0)}`;
  const steps=4+Math.floor(rng()*3);
  for(let i=0;i<steps;i++){
    const nx=startTop?x+(rng()-0.45)*w*0.5:x+(w/steps)+(rng()-0.5)*70;
    const ny=startTop?y+(h/steps)+(rng()-0.5)*70:y+(rng()-0.5)*h*0.5;
    const c1x=x+(nx-x)*0.3+(rng()-0.5)*55,c1y=y+(rng()-0.5)*70;
    const c2x=x+(nx-x)*0.7+(rng()-0.5)*55,c2y=ny+(rng()-0.5)*70;
    d+=` C ${c1x.toFixed(0)} ${c1y.toFixed(0)}, ${c2x.toFixed(0)} ${c2y.toFixed(0)}, ${nx.toFixed(0)} ${ny.toFixed(0)}`;
    x=nx;y=ny;
  }
  return d;
}
const STONES={
  calacatta:{base:['#F1ECE2','#E4DCCC'],grey:'rgba(120,124,130,0.30)',gold:'rgba(198,166,100,0.55)',hair:'rgba(150,150,155,0.22)'},
  statuario:{base:['#F4F2EC','#E8E6DE'],grey:'rgba(90,95,105,0.34)',gold:'rgba(198,166,100,0.30)',hair:'rgba(120,124,132,0.20)'},
  carrara:{base:['#E9E9E6','#DADAD4'],grey:'rgba(110,118,124,0.38)',gold:'rgba(160,160,150,0.18)',hair:'rgba(120,126,132,0.24)'},
  nerogold:{base:['#111116','#08080b'],grey:'rgba(180,180,190,0.10)',gold:'rgba(198,166,100,0.62)',hair:'rgba(198,166,100,0.16)'},
  emperador:{base:['#2a2018','#17110b'],grey:'rgba(120,90,60,0.22)',gold:'rgba(198,166,100,0.48)',hair:'rgba(180,140,90,0.16)'},
  eternal:{base:['#EDE9E1','#DFD8CB'],grey:'rgba(105,110,118,0.28)',gold:'rgba(198,166,100,0.40)',hair:'rgba(140,144,150,0.20)'},
  goldveil:{base:['#101015','#0a0a0d'],grey:'rgba(150,150,160,0.06)',gold:'rgba(198,166,100,0.50)',hair:'rgba(255,224,143,0.20)'},
  crema:{base:['#EFE6D4','#E2D5BC'],grey:'rgba(150,130,100,0.26)',gold:'rgba(198,166,100,0.40)',hair:'rgba(160,140,110,0.20)'},
  mist:{base:['#DDDEDC','#CBCCC8'],grey:'rgba(105,110,116,0.30)',gold:'rgba(150,150,145,0.16)',hair:'rgba(120,124,130,0.22)'},
  fumo:{base:['#1E2024','#141518'],grey:'rgba(190,195,205,0.16)',gold:'rgba(198,166,100,0.28)',hair:'rgba(180,185,195,0.14)'}
};
function marble(preset,seed){
  const p=STONES[preset],rng=mulberry32(seed*997+13),id=++UID,w=400,h=520;
  let veins='';
  for(let i=0;i<3;i++)veins+=`<path d="${vein(rng,w,h,i%2===0)}" stroke="${p.grey}" stroke-width="${(6+rng()*10).toFixed(1)}" fill="none" stroke-linecap="round" filter="url(#b${id})"/>`;
  for(let i=0;i<2;i++)veins+=`<path d="${vein(rng,w,h,i%2===0)}" stroke="${p.gold}" stroke-width="${(2+rng()*4).toFixed(1)}" fill="none" stroke-linecap="round"/>`;
  for(let i=0;i<4;i++)veins+=`<path d="${vein(rng,w,h,rng()>0.5)}" stroke="${p.hair}" stroke-width="${(0.7+rng()*1.4).toFixed(1)}" fill="none" stroke-linecap="round"/>`;
  return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${p.base[0]}"/><stop offset="1" stop-color="${p.base[1]}"/></linearGradient>
      <filter id="b${id}"><feGaussianBlur stdDeviation="1.1"/></filter>
      <filter id="n${id}"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="${seed}"/><feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.06 0"/></filter>
      <radialGradient id="s${id}" cx="0.3" cy="0.12" r="1"><stop offset="0" stop-color="rgba(255,255,255,0.18)"/><stop offset="0.4" stop-color="rgba(255,255,255,0)"/></radialGradient>
    </defs>
    <rect width="${w}" height="${h}" fill="url(#g${id})"/>${veins}
    <rect width="${w}" height="${h}" filter="url(#n${id})"/>
    <rect width="${w}" height="${h}" fill="url(#s${id})"/></svg>`;
}
function rng(seed){
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}
function veinPath(rand, w, h, y0){
  let d = `M ${-40} ${y0}`;
  let x = -40, y = y0;
  const steps = 6 + Math.floor(rand()*3);
  const stepX = (w + 120) / steps;
  for(let i=0;i<steps;i++){
    const nx = x + stepX;
    const ny = y + (rand()-0.5) * h * 0.34;
    const cx1 = x + stepX*0.35, cy1 = y + (rand()-0.5)*h*0.22;
    const cx2 = x + stepX*0.7,  cy2 = ny + (rand()-0.5)*h*0.22;
    d += ` C ${cx1.toFixed(1)} ${cy1.toFixed(1)}, ${cx2.toFixed(1)} ${cy2.toFixed(1)}, ${nx.toFixed(1)} ${ny.toFixed(1)}`;
    x = nx; y = ny;
  }
  return d;
}
function marbleRasterOn(){
  return getComputedStyle(document.body).getPropertyValue('--stoneRaster').trim()==='on';
}
function marbleFill(el,seed){
  if(!el) return;
  if(marbleRasterOn()){
    el.innerHTML='';
    el.style.backgroundImage='url("data:image/svg+xml;charset=utf-8,'+encodeURIComponent(marbleSVG(seed))+'")';
    el.style.backgroundSize='cover';
    el.style.backgroundPosition='center';
    el.style.backgroundRepeat='no-repeat';
  }else{
    el.innerHTML=marbleSVG(seed);
  }
}
function marbleSVG(seed){
  const rand = rng(seed);
  const W = 900, H = 480;
  const fid = 'f' + seed;
  let greys = '';
  const nGrey = 2 + Math.floor(rand()*2);
  for(let i=0;i<nGrey;i++){
    const y = H*(0.18 + rand()*0.64);
    const width = 5 + rand()*9;
    const op = 0.16 + rand()*0.16;
    greys += `<path d="${veinPath(rand,W,H,y)}" fill="none" stroke="#8f8b82" stroke-width="${width.toFixed(1)}" opacity="${op.toFixed(2)}" filter="url(#${fid}b)"/>`;
    greys += `<path d="${veinPath(rand,W,H,y + (rand()-0.5)*18)}" fill="none" stroke="#cbc6ba" stroke-width="${(width*0.26).toFixed(1)}" opacity="${(op*1.5).toFixed(2)}" filter="url(#${fid}d)"/>`;
  }
  let golds = '';
  const nGold = 1 + Math.floor(rand()*2);
  for(let i=0;i<nGold;i++){
    const y = H*(0.15 + rand()*0.7);
    golds += `<path d="${veinPath(rand,W,H,y)}" fill="none" stroke="#EFC24E" stroke-width="${(1.2 + rand()*1.3).toFixed(1)}" opacity="${(0.5 + rand()*0.25).toFixed(2)}" filter="url(#${fid}d)"/>`;
  }
  let hairs = '';
  for(let i=0;i<3;i++){
    const y = H*rand();
    hairs += `<path d="${veinPath(rand,W,H,y)}" fill="none" stroke="#7d7a72" stroke-width="0.8" opacity="${(0.14 + rand()*0.12).toFixed(2)}" filter="url(#${fid}d)"/>`;
  }
  return `
  <svg class="marble" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <filter id="${fid}b" x="-20%" y="-20%" width="140%" height="140%">
        <feTurbulence type="fractalNoise" baseFrequency="0.012 0.02" numOctaves="3" seed="${seed}" result="n"/>
        <feDisplacementMap in="SourceGraphic" in2="n" scale="46"/>
        <feGaussianBlur stdDeviation="4"/>
      </filter>
      <filter id="${fid}d" x="-20%" y="-20%" width="140%" height="140%">
        <feTurbulence type="fractalNoise" baseFrequency="0.014 0.024" numOctaves="3" seed="${seed+3}" result="n"/>
        <feDisplacementMap in="SourceGraphic" in2="n" scale="34"/>
        <feGaussianBlur stdDeviation="0.5"/>
      </filter>
      <filter id="${fid}m">
        <feTurbulence type="fractalNoise" baseFrequency="0.006 0.008" numOctaves="4" seed="${seed+9}"/>
        <feColorMatrix type="matrix" values="0 0 0 0 0.15  0 0 0 0 0.155  0 0 0 0 0.16  0 0 0 0.06 0"/>
        <feComposite operator="over" in2="SourceGraphic"/>
      </filter>
      <linearGradient id="${fid}base" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#131414"/>
        <stop offset="0.5" stop-color="#0e0f0f"/>
        <stop offset="1" stop-color="#141515"/>
      </linearGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#${fid}base)"/>
    <rect width="${W}" height="${H}" fill="#34363a" opacity="0.10" filter="url(#${fid}m)"/>
    ${greys}
    ${hairs}
    ${golds}
  </svg>`;
}
const MAT_LABEL={Quartz:'Quartz',Marble:'Marble & Quartzite',Granite:'Granite',Porcelain:'Porcelain'};
const matLabel=m=>MAT_LABEL[m]||m;
const MATERIALS={
  Marble:[
    {name:"Aqua Gucci",slug:"aqua-gucci",mat:"Marble",kind:"Quartzite",sup:"Nile Stone",stone:"mist",seed:905,tone:"light",hue:"blue",vein:"statement",finish:"Polished"},
    {name:"Arabescato Corchia Extra",slug:"arabescato-corchia-extra",mat:"Marble",kind:"Marble",sup:"Nile Stone",stone:"calacatta",seed:953,tone:"light",hue:"white",vein:"statement",finish:"Polished"},
    {name:"Arabescato Corchia Extra Honed",slug:"arabescato-corchia-extra-honed",mat:"Marble",kind:"Marble",sup:"Nile Stone",stone:"calacatta",seed:903,tone:"light",hue:"white",vein:"statement",finish:"Honed"},
    {name:"Arabescato Vagli Oro Honed",slug:"arabescato-vagli-oro",mat:"Marble",kind:"Marble",sup:"Nile Stone",stone:"calacatta",seed:301,tone:"light",hue:"white",vein:"statement",finish:"Honed"},
    {name:"Belvedere",slug:"belvedere",mat:"Marble",kind:"Quartzite",sup:"Nile Stone",stone:"emperador",seed:960,tone:"dark",hue:"black",vein:"statement",finish:"Polished"},
    {name:"Belvedere Leather",slug:"belvedere-leather",mat:"Marble",kind:"Quartzite",sup:"Nile Stone",stone:"emperador",seed:312,tone:"dark",hue:"black",vein:"statement",finish:"Leathered"},
    {name:"Bianco Eclypsia Calacatta",slug:"bianco-eclypsia-calacatta",mat:"Marble",kind:"Quartzite",sup:"Nile Stone",stone:"calacatta",seed:311,tone:"light",hue:"white",vein:"statement",finish:"Polished"},
    {name:"Blue Roma",slug:"blue-roma",mat:"Marble",kind:"Quartzite",sup:"Nile Stone",stone:"mist",seed:313,tone:"light",hue:"blue",vein:"soft",finish:"Polished"},
    {name:"Blue Roma Honed",slug:"blue-roma-honed",mat:"Marble",kind:"Quartzite",sup:"Nile Stone",stone:"mist",seed:965,tone:"light",hue:"blue",vein:"statement",finish:"Honed"},
    {name:"Calacatta Brasil",slug:"calacatta-brasil",mat:"Marble",kind:"Quartzite",sup:"Nile Stone",stone:"calacatta",seed:910,tone:"light",hue:"white",vein:"statement",finish:"Polished"},
    {name:"Calacatta Cremo Honed",slug:"calacatta-cremo-honed",mat:"Marble",kind:"Marble",sup:"Nile Stone",stone:"calacatta",seed:920,tone:"light",hue:"white",vein:"soft",finish:"Honed"},
    {name:"Calacatta Gold Oro Honed",slug:"calacatta-gold-oro",mat:"Marble",kind:"Marble",sup:"Nile Stone",stone:"calacatta",seed:302,tone:"light",hue:"white",vein:"statement",finish:"Polished"},
    {name:"Calacatta Vagli Oro Honed",slug:"calacatta-vagli-oro",mat:"Marble",kind:"Marble",sup:"Nile Stone",stone:"calacatta",seed:304,tone:"light",hue:"white",vein:"statement",finish:"Honed"},
    {name:"Calacatta Viola",slug:"calacatta-viola",mat:"Marble",kind:"Marble",sup:"Nile Stone",stone:"goldveil",seed:303,tone:"light",hue:"white",vein:"statement",finish:"Polished"},
    {name:"Calacatta Viola Honed",slug:"calacatta-viola-honed",mat:"Marble",kind:"Marble",sup:"Nile Stone",stone:"calacatta",seed:945,tone:"light",hue:"white",vein:"statement",finish:"Honed"},
    {name:"Carrara",slug:"carrara",mat:"Marble",kind:"Marble",sup:"Nile Stone",stone:"calacatta",seed:956,tone:"light",hue:"white",vein:"statement",finish:"Polished"},
    {name:"Carrara Honed",slug:"carrara-honed",mat:"Marble",kind:"Marble",sup:"Nile Stone",stone:"carrara",seed:310,tone:"light",hue:"white",vein:"soft",finish:"Honed"},
    {name:"Cosmic Black",slug:"cosmic-black",mat:"Marble",kind:"Quartzite",sup:"Nile Stone",stone:"nerogold",seed:964,tone:"dark",hue:"black",vein:"statement",finish:"Polished"},
    {name:"Cote D Azur",slug:"cote-d-azur",mat:"Marble",kind:"Quartzite",sup:"Nile Stone",stone:"mist",seed:949,tone:"light",hue:"blue",vein:"statement",finish:"Polished"},
    {name:"Cristallo",slug:"cristallo",mat:"Marble",kind:"Quartzite",sup:"Nile Stone",stone:"statuario",seed:314,tone:"light",hue:"brown",vein:"statement",finish:"Polished"},
    {name:"Dolce Vita",slug:"dolce-vita",mat:"Marble",kind:"Quartzite",sup:"Nile Stone",stone:"calacatta",seed:967,tone:"light",hue:"white",vein:"statement",finish:"Polished"},
    {name:"Dover White",slug:"dover-white",mat:"Marble",kind:"Quartzite",sup:"Nile Stone",stone:"mist",seed:961,tone:"light",hue:"white",vein:"statement",finish:"Polished"},
    {name:"Fantastico Arni Honed",slug:"fantastico-arni",mat:"Marble",kind:"Marble",sup:"Nile Stone",stone:"statuario",seed:305,tone:"light",hue:"white",vein:"statement",finish:"Honed"},
    {name:"Fusion Black",slug:"fusion-black",mat:"Marble",kind:"Quartzite",sup:"Nile Stone",stone:"nerogold",seed:316,tone:"dark",hue:"black",vein:"statement",finish:"Polished"},
    {name:"Fusion Blue Leather",slug:"fusion-blue-leather",mat:"Marble",kind:"Quartzite",sup:"Nile Stone",stone:"goldveil",seed:315,tone:"dark",hue:"grey",vein:"statement",finish:"Leathered"},
    {name:"Fusion Wow Multicolour",slug:"fusion-wow-multicolour",mat:"Marble",kind:"Quartzite",sup:"Nile Stone",stone:"crema",seed:951,tone:"dark",hue:"brown",vein:"statement",finish:"Polished"},
    {name:"Lemurian Blue",slug:"lemurian-blue",mat:"Marble",kind:"Quartzite",sup:"Nile Stone",stone:"fumo",seed:317,tone:"dark",hue:"blue",vein:"soft",finish:"Polished"},
    {name:"Macaubas Fantasy",slug:"macaubas-fantasy",mat:"Marble",kind:"Quartzite",sup:"Nile Stone",stone:"calacatta",seed:911,tone:"light",hue:"white",vein:"statement",finish:"Polished"},
    {name:"Magma Gold",slug:"magma-gold",mat:"Marble",kind:"Quartzite",sup:"Nile Stone",stone:"emperador",seed:958,tone:"dark",hue:"brown",vein:"statement",finish:"Polished"},
    {name:"Marron Imperial",slug:"marron-imperial",mat:"Marble",kind:"Marble",sup:"Nile Stone",stone:"emperador",seed:907,tone:"dark",hue:"brown",vein:"statement",finish:"Polished"},
    {name:"Mont Blanc",slug:"mont-blanc",mat:"Marble",kind:"Quartzite",sup:"Nile Stone",stone:"calacatta",seed:930,tone:"light",hue:"white",vein:"calm",finish:"Polished"},
    {name:"Mystic Grey",slug:"mystic-grey",mat:"Marble",kind:"Quartzite",sup:"Nile Stone",stone:"mist",seed:952,tone:"light",hue:"grey",vein:"statement",finish:"Polished"},
    {name:"Nero Marinace",slug:"nero-marinace",mat:"Marble",kind:"Quartzite",sup:"Nile Stone",stone:"nerogold",seed:948,tone:"dark",hue:"black",vein:"statement",finish:"Polished"},
    {name:"Nero Marquina",slug:"nero-marquina",mat:"Marble",kind:"Marble",sup:"Nile Stone",stone:"nerogold",seed:306,tone:"dark",hue:"black",vein:"statement",finish:"Polished"},
    {name:"Ocean Fantasy",slug:"ocean-fantasy",mat:"Marble",kind:"Quartzite",sup:"Nile Stone",stone:"mist",seed:955,tone:"light",hue:"grey",vein:"statement",finish:"Polished"},
    {name:"Patagonia Extra",slug:"patagonia",mat:"Marble",kind:"Quartzite",sup:"Nile Stone",stone:"mist",seed:318,tone:"light",hue:"white",vein:"statement",finish:"Polished"},
    {name:"Rainforest Brown",slug:"rainforest-brown",mat:"Marble",kind:"Marble",sup:"Nile Stone",stone:"emperador",seed:307,tone:"dark",hue:"brown",vein:"statement",finish:"Polished"},
    {name:"Rosa Alicante",slug:"rosa-alicante",mat:"Marble",kind:"Marble",sup:"Nile Stone",stone:"crema",seed:957,tone:"light",hue:"cream",vein:"statement",finish:"Polished"},
    {name:"Rosso Levanto",slug:"rosso-levanto",mat:"Marble",kind:"Marble",sup:"Nile Stone",stone:"emperador",seed:963,tone:"dark",hue:"brown",vein:"statement",finish:"Polished"},
    {name:"Taj Mahal",slug:"taj-mahal",mat:"Marble",kind:"Quartzite",sup:"Nile Stone",stone:"crema",seed:319,tone:"light",hue:"cream",vein:"calm",finish:"Polished"},
    {name:"Travertine Romano Classico Honed",slug:"travertine-romano-classico",mat:"Marble",kind:"Travertine",sup:"Nile Stone",stone:"crema",seed:309,tone:"light",hue:"cream",vein:"soft",finish:"Honed and filled"},
    {name:"Venaria",slug:"venaria-reale",mat:"Marble",kind:"Quartzite",sup:"Nile Stone",stone:"eternal",seed:320,tone:"light",hue:"cream",vein:"soft",finish:"Polished"},
    {name:"Verde Alpi",slug:"verde-alpi",mat:"Marble",kind:"Marble",sup:"Nile Stone",stone:"fumo",seed:909,tone:"dark",hue:"green",vein:"statement",finish:"Polished"},
    {name:"Verde Guatemala",slug:"verde-guatemala",mat:"Marble",kind:"Marble",sup:"Nile Stone",stone:"fumo",seed:308,tone:"dark",hue:"green",vein:"statement",finish:"Polished"},
    {name:"White Macaubas",slug:"white-macaubas",mat:"Marble",kind:"Quartzite",sup:"Nile Stone",stone:"calacatta",seed:954,tone:"light",hue:"white",vein:"statement",finish:"Polished"},
  ],
  Quartz:[
    {name:"Almond Beige",slug:"almond-beige",mat:"Quartz",kind:"Quartz",sup:"Nile Stone",stone:"crema",seed:201,tone:"light",hue:"cream",vein:"calm",finish:"Polished"},
    {name:"Arabescato Capri",slug:"arabescato-capri",mat:"Quartz",kind:"Quartz",sup:"Nile Stone",stone:"calacatta",seed:202,tone:"light",hue:"white",vein:"statement",finish:"Polished"},
    {name:"Arabescato Classico",slug:"arabescato-classico",mat:"Quartz",kind:"Quartz",sup:"Next Stone Slabs",stone:"calacatta",seed:936,tone:"light",hue:"white",vein:"calm",finish:"Polished"},
    {name:"Arabescato Elegance",slug:"arabescato-elegance",mat:"Quartz",kind:"Quartz",sup:"Nile Stone",stone:"statuario",seed:203,tone:"light",hue:"white",vein:"soft",finish:"Polished"},
    {name:"Arabescato Faniello",slug:"arabescato-faniello",mat:"Quartz",kind:"Quartz",sup:"Next Stone Slabs",stone:"calacatta",seed:926,tone:"light",hue:"white",vein:"soft",finish:"Polished"},
    {name:"Arabescato Gold",slug:"arabescato-gold",mat:"Quartz",kind:"Quartz",sup:"Next Stone Slabs",stone:"eternal",seed:219,tone:"light",hue:"white",vein:"statement",finish:"Polished"},
    {name:"Arabescato Grey",slug:"arabescato-grey",mat:"Quartz",kind:"Quartz",sup:"Next Stone Slabs",stone:"carrara",seed:221,tone:"light",hue:"white",vein:"statement",finish:"Polished"},
    {name:"Argento",slug:"argento",mat:"Quartz",kind:"Quartz",sup:"Next Stone Slabs",stone:"calacatta",seed:938,tone:"light",hue:"white",vein:"calm",finish:"Polished"},
    {name:"Azalai Negro",slug:"azalai-negro",mat:"Quartz",kind:"Quartz",sup:"CRL Stone",stone:"fumo",seed:907,tone:"dark",hue:"blue",vein:"soft",finish:"Polished"},
    {name:"Azul Shimmer",slug:"azul-shimmer",mat:"Quartz",kind:"Quartz",sup:"Nile Stone",stone:"mist",seed:204,tone:"light",hue:"blue",vein:"calm",finish:"Polished"},
    {name:"Bianco Glacier",slug:"bianco-glacier",mat:"Quartz",kind:"Quartz",sup:"Nile Stone",stone:"calacatta",seed:923,tone:"light",hue:"white",vein:"soft",finish:"Polished"},
    {name:"Bianco Starlight",slug:"bianco-starlight",mat:"Quartz",kind:"Quartz",sup:"Nile Stone",stone:"calacatta",seed:932,tone:"light",hue:"white",vein:"calm",finish:"Polished"},
    {name:"Black Mirror",slug:"black-mirror",mat:"Quartz",kind:"Quartz",sup:"Bloom Stones London",stone:"nerogold",seed:955,tone:"dark",hue:"black",vein:"calm",finish:"Polished"},
    {name:"Black Tempal",slug:"black-tempal",mat:"Quartz",kind:"Quartz",sup:"Caesarstone",stone:"nerogold",seed:902,tone:"dark",hue:"black",vein:"soft",finish:"Polished"},
    {name:"Blue Lagoon",slug:"blue-lagoon",mat:"Quartz",kind:"Quartz",sup:"Nile Stone",stone:"carrara",seed:206,tone:"light",hue:"blue",vein:"statement",finish:"Polished"},
    {name:"Blue Mirror",slug:"blue-mirror",mat:"Quartz",kind:"Quartz",sup:"Bloom Stones London",stone:"nerogold",seed:954,tone:"dark",hue:"blue",vein:"calm",finish:"Polished"},
    {name:"Borghini Royal",slug:"borghini-royal",mat:"Quartz",kind:"Quartz",sup:"Nile Stone",stone:"calacatta",seed:205,tone:"light",hue:"white",vein:"statement",finish:"Polished"},
    {name:"Brown Mirror",slug:"brown-mirror",mat:"Quartz",kind:"Quartz",sup:"Bloom Stones London",stone:"emperador",seed:953,tone:"dark",hue:"brown",vein:"calm",finish:"Polished"},
    {name:"Calacatta Aurelia",slug:"calacatta-aurelia",mat:"Quartz",kind:"Quartz",sup:"Next Stone Slabs",stone:"calacatta",seed:941,tone:"light",hue:"white",vein:"calm",finish:"Polished"},
    {name:"Calacatta Borghini Light",slug:"calacatta-borghini-light",mat:"Quartz",kind:"Quartz",sup:"Next Stone Slabs",stone:"calacatta",seed:937,tone:"light",hue:"white",vein:"calm",finish:"Polished"},
    {name:"Calacatta Classic",slug:"calacatta-classic",mat:"Quartz",kind:"Quartz",sup:"Nile Stone",stone:"calacatta",seed:939,tone:"light",hue:"white",vein:"calm",finish:"Polished"},
    {name:"Calacatta Exotic",slug:"calacatta-exotic",mat:"Quartz",kind:"Quartz",sup:"Nile Stone",stone:"calacatta",seed:916,tone:"light",hue:"white",vein:"soft",finish:"Polished"},
    {name:"Calacatta Fantastico",slug:"calacatta-fantastico",mat:"Quartz",kind:"Quartz",sup:"Nile Stone",stone:"calacatta",seed:207,tone:"light",hue:"white",vein:"statement",finish:"Polished"},
    {name:"Calacatta Gold Shimmer",slug:"calacatta-gold-shimmer",mat:"Quartz",kind:"Quartz",sup:"Nile Stone",stone:"calacatta",seed:921,tone:"light",hue:"white",vein:"soft",finish:"Polished"},
    {name:"Calacatta Gold Soft",slug:"calacatta-gold-soft",mat:"Quartz",kind:"Quartz",sup:"Nile Stone",stone:"eternal",seed:209,tone:"light",hue:"cream",vein:"soft",finish:"Polished"},
    {name:"Calacatta Grey Classic",slug:"calacatta-grey-classic",mat:"Quartz",kind:"Quartz",sup:"Next Stone Slabs",stone:"calacatta",seed:943,tone:"light",hue:"white",vein:"calm",finish:"Polished"},
    {name:"Calacatta Lucente",slug:"calacatta-lucente",mat:"Quartz",kind:"Quartz",sup:"Next Stone Slabs",stone:"calacatta",seed:940,tone:"light",hue:"white",vein:"calm",finish:"Polished"},
    {name:"Calacatta Luna",slug:"calacatta-luna",mat:"Quartz",kind:"Quartz",sup:"Next Stone Slabs",stone:"calacatta",seed:934,tone:"light",hue:"white",vein:"calm",finish:"Polished"},
    {name:"Calacatta Oro",slug:"calacatta-oro-quartz",mat:"Quartz",kind:"Quartz",sup:"Nile Stone",stone:"eternal",seed:208,tone:"light",hue:"white",vein:"soft",finish:"Polished"},
    {name:"Calacatta Soft Shimmer",slug:"calacatta-soft-shimmer",mat:"Quartz",kind:"Quartz",sup:"Nile Stone",stone:"calacatta",seed:942,tone:"light",hue:"white",vein:"calm",finish:"Polished"},
    {name:"Calacatta Supreme",slug:"calacatta-supreme",mat:"Quartz",kind:"Quartz",sup:"Nile Stone",stone:"calacatta",seed:928,tone:"light",hue:"white",vein:"soft",finish:"Polished"},
    {name:"Carrara Jumbo",slug:"carrara-jumbo",mat:"Quartz",kind:"Quartz",sup:"Nile Stone",stone:"carrara",seed:214,tone:"light",hue:"white",vein:"soft",finish:"Polished"},
    {name:"Carrara Shimmer",slug:"carrara-shimmer",mat:"Quartz",kind:"Quartz",sup:"Nile Stone",stone:"carrara",seed:213,tone:"light",hue:"white",vein:"soft",finish:"Polished"},
    {name:"Cloud Burst",slug:"cloud-burst",mat:"Quartz",kind:"Quartz",sup:"Nile Stone",stone:"eternal",seed:212,tone:"light",hue:"blue",vein:"soft",finish:"Polished"},
    {name:"Concrete Earth",slug:"concrete-earth",mat:"Quartz",kind:"Quartz",sup:"Nile Stone",stone:"mist",seed:211,tone:"light",hue:"grey",vein:"calm",finish:"Polished"},
    {name:"Corchia Gold",slug:"corchia-gold",mat:"Quartz",kind:"Quartz",sup:"Next Stone Slabs",stone:"calacatta",seed:922,tone:"light",hue:"white",vein:"soft",finish:"Polished"},
    {name:"Corchia Light",slug:"corchia-light",mat:"Quartz",kind:"Quartz",sup:"Next Stone Slabs",stone:"mist",seed:927,tone:"light",hue:"green",vein:"soft",finish:"Polished"},
    {name:"Cream Mirror",slug:"cream-mirror",mat:"Quartz",kind:"Quartz",sup:"Bloom Stones London",stone:"crema",seed:951,tone:"light",hue:"cream",vein:"calm",finish:"Polished"},
    {name:"Crema D Aizhi",slug:"crema-d-aizhi",mat:"Quartz",kind:"Quartz",sup:"Next Stone Slabs",stone:"crema",seed:944,tone:"light",hue:"cream",vein:"calm",finish:"Polished"},
    {name:"Crema Evora",slug:"crema-evora",mat:"Quartz",kind:"Quartz",sup:"Next Stone Slabs",stone:"crema",seed:216,tone:"light",hue:"cream",vein:"calm",finish:"Polished"},
    {name:"Crema Tempest",slug:"crema-tempest",mat:"Quartz",kind:"Quartz",sup:"Next Stone Slabs",stone:"crema",seed:218,tone:"light",hue:"cream",vein:"statement",finish:"Polished"},
    {name:"Crema Venato",slug:"crema-venato",mat:"Quartz",kind:"Quartz",sup:"Next Stone Slabs",stone:"crema",seed:217,tone:"light",hue:"cream",vein:"soft",finish:"Polished"},
    {name:"Cremo Delicato",slug:"cremo-delicato",mat:"Quartz",kind:"Quartz",sup:"Next Stone Slabs",stone:"calacatta",seed:917,tone:"light",hue:"white",vein:"soft",finish:"Polished"},
    {name:"Cristallo Gris",slug:"cristallo-gris",mat:"Quartz",kind:"Quartz",sup:"CRL Stone",stone:"emperador",seed:914,tone:"dark",hue:"brown",vein:"soft",finish:"Polished"},
    {name:"Darcrest",slug:"darcrest",mat:"Quartz",kind:"Quartz",sup:"Caesarstone",stone:"fumo",seed:904,tone:"dark",hue:"blue",vein:"soft",finish:"Honed"},
    {name:"Fresh Cement",slug:"fresh-cement",mat:"Quartz",kind:"Quartz",sup:"Next Stone Slabs",stone:"mist",seed:224,tone:"light",hue:"grey",vein:"calm",finish:"Polished"},
    {name:"Grey Mirror",slug:"grey-mirror",mat:"Quartz",kind:"Quartz",sup:"Bloom Stones London",stone:"fumo",seed:952,tone:"light",hue:"grey",vein:"calm",finish:"Polished"},
    {name:"Grigio Fantasy",slug:"grigio-fantasy",mat:"Quartz",kind:"Quartz",sup:"Nile Stone",stone:"mist",seed:210,tone:"light",hue:"grey",vein:"soft",finish:"Polished"},
    {name:"Grigio Shimmer",slug:"grigio-shimmer",mat:"Quartz",kind:"Quartz",sup:"Nile Stone",stone:"mist",seed:935,tone:"light",hue:"grey",vein:"calm",finish:"Polished"},
    {name:"Grigio Starlight",slug:"grigio-starlight",mat:"Quartz",kind:"Quartz",sup:"Nile Stone",stone:"mist",seed:933,tone:"light",hue:"grey",vein:"calm",finish:"Polished"},
    {name:"Labradorite Royal",slug:"labradorite-royal",mat:"Quartz",kind:"Quartz",sup:"CRL Stone",stone:"fumo",seed:915,tone:"dark",hue:"green",vein:"statement",finish:"Polished"},
    {name:"Laurent Black",slug:"laurent-black",mat:"Quartz",kind:"Quartz",sup:"CRL Stone",stone:"nerogold",seed:906,tone:"dark",hue:"black",vein:"statement",finish:"Polished"},
    {name:"London Grey",slug:"london-grey",mat:"Quartz",kind:"Quartz",sup:"Nile Stone",stone:"mist",seed:931,tone:"light",hue:"grey",vein:"calm",finish:"Polished"},
    {name:"Marquina",slug:"marquina",mat:"Quartz",kind:"Quartz",sup:"CRL Stone",stone:"fumo",seed:905,tone:"dark",hue:"blue",vein:"soft",finish:"Polished"},
    {name:"Misterio Gold",slug:"misterio-gold",mat:"Quartz",kind:"Quartz",sup:"Next Stone Slabs",stone:"crema",seed:223,tone:"light",hue:"cream",vein:"calm",finish:"Polished"},
    {name:"Nero Starlight",slug:"nero-starlight",mat:"Quartz",kind:"Quartz",sup:"Nile Stone",stone:"nerogold",seed:916,tone:"dark",hue:"black",vein:"calm",finish:"Polished"},
    {name:"Repen",slug:"repen",mat:"Quartz",kind:"Quartz",sup:"Nile Stone",stone:"crema",seed:918,tone:"dark",hue:"brown",vein:"calm",finish:"Polished"},
    {name:"Royal Grey",slug:"royal-grey",mat:"Quartz",kind:"Quartz",sup:"Nile Stone",stone:"fumo",seed:929,tone:"dark",hue:"grey",vein:"soft",finish:"Polished"},
    {name:"Sabbia Beige",slug:"sabbia-beige",mat:"Quartz",kind:"Quartz",sup:"Next Stone Slabs",stone:"crema",seed:220,tone:"light",hue:"green",vein:"calm",finish:"Polished"},
    {name:"Sahara Dunes",slug:"sahara-dunes",mat:"Quartz",kind:"Quartz",sup:"Next Stone Slabs",stone:"crema",seed:215,tone:"light",hue:"cream",vein:"calm",finish:"Polished"},
    {name:"Taj Mahal Elegance",slug:"taj-mahal-elegance",mat:"Quartz",kind:"Quartz",sup:"Nile Stone",stone:"crema",seed:924,tone:"light",hue:"cream",vein:"soft",finish:"Polished"},
    {name:"Tuscany Supreme",slug:"tuscany-supreme",mat:"Quartz",kind:"Quartz",sup:"Next Stone Slabs",stone:"crema",seed:222,tone:"light",hue:"cream",vein:"soft",finish:"Polished"},
    {name:"Umbra Marron",slug:"umbra-marron",mat:"Quartz",kind:"Quartz",sup:"CRL Stone",stone:"emperador",seed:912,tone:"dark",hue:"brown",vein:"statement",finish:"Polished"},
    {name:"Vanilla Noir",slug:"vanilla-noir",mat:"Quartz",kind:"Quartz",sup:"Caesarstone",stone:"emperador",seed:901,tone:"dark",hue:"brown",vein:"statement",finish:"Polished"},
    {name:"White Eclypse",slug:"white-eclypse",mat:"Quartz",kind:"Quartz",sup:"Nile Stone",stone:"calacatta",seed:913,tone:"light",hue:"white",vein:"statement",finish:"Polished"},
    {name:"White Mirror",slug:"white-mirror",mat:"Quartz",kind:"Quartz",sup:"Bloom Stones London",stone:"statuario",seed:950,tone:"light",hue:"white",vein:"statement",finish:"Polished"},
    {name:"Woodlands",slug:"woodlands",mat:"Quartz",kind:"Quartz",sup:"Caesarstone",stone:"emperador",seed:903,tone:"dark",hue:"brown",vein:"soft",finish:"Polished"},
  ],
  Granite:[
    {name:"Absolute Black Brushed",slug:"absolute-black-brushed",mat:"Granite",kind:"Granite",sup:"Nile Stone",stone:"nerogold",seed:919,tone:"dark",hue:"black",vein:"soft",finish:"Brushed"},
    {name:"Absolute Black Extra",slug:"absolute-black-extra",mat:"Granite",kind:"Granite",sup:"Nile Stone",stone:"nerogold",seed:401,tone:"dark",hue:"black",vein:"calm",finish:"Polished"},
    {name:"Absolute Black Honed",slug:"absolute-black-honed",mat:"Granite",kind:"Granite",sup:"Nile Stone",stone:"nerogold",seed:947,tone:"dark",hue:"black",vein:"calm",finish:"Honed"},
    {name:"Absolute Black Leather",slug:"absolute-black-leather",mat:"Granite",kind:"Granite",sup:"Nile Stone",stone:"nerogold",seed:946,tone:"dark",hue:"black",vein:"calm",finish:"Leathered"},
    {name:"Angola Black Leather",slug:"angola-black-leather",mat:"Granite",kind:"Granite",sup:"Nile Stone",stone:"nerogold",seed:915,tone:"dark",hue:"black",vein:"statement",finish:"Leathered"},
    {name:"Antiq Brown Extra",slug:"antiq-brown-extra",mat:"Granite",kind:"Granite",sup:"Nile Stone",stone:"emperador",seed:402,tone:"dark",hue:"brown",vein:"calm",finish:"Polished"},
    {name:"Antiq Brown Leather",slug:"antiq-brown-leather",mat:"Granite",kind:"Granite",sup:"Nile Stone",stone:"emperador",seed:914,tone:"dark",hue:"brown",vein:"statement",finish:"Leathered"},
    {name:"Arctic Cream",slug:"arctic-cream",mat:"Granite",kind:"Granite",sup:"Nile Stone",stone:"mist",seed:906,tone:"light",hue:"grey",vein:"statement",finish:"Polished"},
    {name:"Astoria",slug:"astoria",mat:"Granite",kind:"Granite",sup:"Nile Stone",stone:"crema",seed:404,tone:"light",hue:"cream",vein:"soft",finish:"Polished"},
    {name:"Azul Platino",slug:"azul-platino",mat:"Granite",kind:"Granite",sup:"Nile Stone",stone:"mist",seed:403,tone:"light",hue:"grey",vein:"calm",finish:"Polished"},
    {name:"Baltic Brown",slug:"baltic-brown",mat:"Granite",kind:"Granite",sup:"Nile Stone",stone:"emperador",seed:901,tone:"dark",hue:"brown",vein:"statement",finish:"Polished"},
    {name:"Bianco Antico",slug:"bianco-antico",mat:"Granite",kind:"Granite",sup:"Nile Stone",stone:"calacatta",seed:962,tone:"light",hue:"white",vein:"statement",finish:"Polished"},
    {name:"Bianco Crystal",slug:"bianco-crystal",mat:"Granite",kind:"Granite",sup:"Nile Stone",stone:"statuario",seed:405,tone:"light",hue:"white",vein:"calm",finish:"Polished"},
    {name:"Bianco Sardo",slug:"bianco-sardo",mat:"Granite",kind:"Granite",sup:"Nile Stone",stone:"calacatta",seed:902,tone:"light",hue:"white",vein:"statement",finish:"Polished"},
    {name:"Black Pearl",slug:"black-pearl",mat:"Granite",kind:"Granite",sup:"Nile Stone",stone:"nerogold",seed:925,tone:"dark",hue:"black",vein:"soft",finish:"Polished"},
    {name:"Blue Dunes Leather",slug:"blue-dunes-leather",mat:"Granite",kind:"Granite",sup:"Nile Stone",stone:"fumo",seed:406,tone:"light",hue:"cream",vein:"statement",finish:"Leathered"},
    {name:"Blue Pearl GT",slug:"blue-pearl",mat:"Granite",kind:"Granite",sup:"Nile Stone",stone:"fumo",seed:904,tone:"dark",hue:"blue",vein:"statement",finish:"Polished"},
    {name:"Blues In The Night",slug:"blues-in-the-night",mat:"Granite",kind:"Granite",sup:"Nile Stone",stone:"fumo",seed:912,tone:"dark",hue:"blue",vein:"statement",finish:"Polished"},
    {name:"Colombo Juparana",slug:"colombo-juparana",mat:"Granite",kind:"Granite",sup:"Nile Stone",stone:"crema",seed:408,tone:"light",hue:"cream",vein:"soft",finish:"Polished"},
    {name:"Colonial Cream",slug:"colonial-cream",mat:"Granite",kind:"Granite",sup:"Nile Stone",stone:"crema",seed:407,tone:"light",hue:"cream",vein:"calm",finish:"Polished"},
  ],
};
const SLAB_TILES={"absolute-black-brushed":"absolute-black-brushed","absolute-black-extra":"absolute-black-extra","absolute-black-honed":"absolute-black-honed","absolute-black-leather":"absolute-black-leather","almond-beige":"almond-beige","angola-black-leather":"angola-black-leather","antiq-brown-extra":"antiq-brown-extra","antiq-brown-leather":"antiq-brown-leather","aqua-gucci":"aqua-gucci","arabescato-capri":"arabescato-capri","arabescato-classico":"arabescato-classico","arabescato-corchia-extra":"arabescato-corchia-extra","arabescato-corchia-extra-honed":"arabescato-corchia-extra-honed","arabescato-elegance":"arabescato-elegance","arabescato-faniello":"arabescato-faniello","arabescato-gold":"arabescato-gold","arabescato-grey":"arabescato-grey","arabescato-vagli-oro":"arabescato-vagli-oro-honed","arctic-cream":"artic-cream","argento":"argento","astoria":"astoria","azalai-negro":"azalai-negro","azul-platino":"azul-platino","azul-shimmer":"azul-shimmer","baltic-brown":"baltic-brown","belvedere":"belvedere","belvedere-leather":"belvedere-leather","bianco-antico":"bianco-antico","bianco-crystal":"bianco-crystal","bianco-eclypsia-calacatta":"bianco-eclypsia-calacatta-leather","bianco-glacier":"bianco-glacier","bianco-sardo":"bianco-sardo","bianco-starlight":"bianco-starlight","black-mirror":"black-mirror","black-pearl":"black-pearl","black-tempal":"black-tempal","blue-dunes-leather":"blue-dunes","blue-lagoon":"blue-lagoon","blue-mirror":"blue-mirror","blue-pearl":"blue-pearl-gt","blue-roma":"blue-roma","blue-roma-honed":"blue-roma-honed","blues-in-the-night":"blues-in-the-night","borghini-royal":"borghini-royal","brown-mirror":"brown-mirror","calacatta-aurelia":"calacatta-aurelia","calacatta-borghini-light":"calacatta-borghini-light","calacatta-brasil":"calacatta-brasil","calacatta-classic":"calacatta-classic","calacatta-cremo-honed":"calacatta-cremo-honed","calacatta-exotic":"calacatta-exotic","calacatta-fantastico":"calacatta-fantastico","calacatta-gold-oro":"calacatta-gold-oro-honed","calacatta-gold-shimmer":"calacatta-gold-shimmer","calacatta-gold-soft":"calacatta-gold-soft","calacatta-grey-classic":"calacatta-grey-classic","calacatta-lucente":"calacatta-lucente","calacatta-luna":"calacatta-luna","calacatta-oro-quartz":"calacatta-oro","calacatta-soft-shimmer":"calacatta-soft-shimmer","calacatta-supreme":"calacatta-supreme","calacatta-vagli-oro":"calacatta-vagli-oro-honed","calacatta-viola":"calacatta-viola","calacatta-viola-honed":"calacatta-viola-honed","carrara":"carrara-polished","carrara-honed":"carrara-honed","carrara-jumbo":"carrara","carrara-shimmer":"carrara-shimmer","cloud-burst":"cloud-burst","colombo-juparana":"colombo-juparana","colonial-cream":"colonial-cream","concrete-earth":"concrete-earth","corchia-gold":"corchia-gold","corchia-light":"corchia-light","cosmic-black":"cosmic-black","cote-d-azur":"cote-d-azur","cream-mirror":"cream-mirror","crema-d-aizhi":"crema-d-aizhi","crema-evora":"crema-evora","crema-tempest":"crema-tempest","crema-venato":"crema-venato","cremo-delicato":"cremo-delicato","cristallo":"cristallo","cristallo-gris":"cristallo-gris","darcrest":"darcrest","dolce-vita":"dolce-vita","dover-white":"dover-white","fantastico-arni":"fantastico-arni-honed","fresh-cement":"fresh-cement","fusion-black":"fusion-black","fusion-blue-leather":"fusion-blue","fusion-wow-multicolour":"fusion-wow-multicolour","grey-mirror":"grey-mirror","grigio-fantasy":"grigio-fantasy","grigio-shimmer":"grigio-shimmerr","grigio-starlight":"grigio-starlight","labradorite-royal":"labradorite-royal","laurent-black":"laurent-black","lemurian-blue":"lemurian-blue","london-grey":"london-grey","macaubas-fantasy":"macaubus-fantasy","magma-gold":"magma-gold","marquina":"marquina","marron-imperial":"marron-imperial","misterio-gold":"misterio-gold","mont-blanc":"mont-blanc","mystic-grey":"mystic-grey","nero-marinace":"nero-marinace","nero-marquina":"nero-marquina","nero-starlight":"nero-starlight","ocean-fantasy":"ocean-fantasy","patagonia":"patagonia-extra","rainforest-brown":"rainforest-brown","repen":"repen","rosa-alicante":"rosa-alicante","rosso-levanto":"rosso-levanto","royal-grey":"royal-grey","sabbia-beige":"ns-sabbia-beige","sahara-dunes":"sahara-dunes","taj-mahal":"taj-mahal","taj-mahal-elegance":"taj-mahal-elegance","travertine-romano-classico":"travertine-romano-classico-h-f","tuscany-supreme":"tuscany-supreme","umbra-marron":"umbra-marron","vanilla-noir":"vanilla-noir","venaria-reale":"venaria","verde-alpi":"verde-alpi","verde-guatemala":"verde-gautemala","white-eclypse":"white-eclpyse","white-macaubas":"white-macaubas","white-mirror":"white-mirror","woodlands":"woodlands"};
const SLAB_V='3';
function tileURL(slug){
  const t=slug&&Object.prototype.hasOwnProperty.call(SLAB_TILES,slug)?SLAB_TILES[slug]:null;
  return t?'/assets/slabs/'+t+'.webp?v='+SLAB_V:null;
}
function tileSrcset(slug){
  const t=slug&&Object.prototype.hasOwnProperty.call(SLAB_TILES,slug)?SLAB_TILES[slug]:null;
  return t?'/assets/slabs/'+t+'-s.webp?v='+SLAB_V+' 800w, assets/slabs/'+t+'.webp?v='+SLAB_V+' 1600w':null;
}
function stoneMarkup(s){
  const u=tileURL(s.slug),ss=tileSrcset(s.slug);
  return u?'<img class="stone-photo" src="'+u+'" srcset="'+ss+'" sizes="(max-width:700px) 60vw, 300px" alt="" loading="lazy" decoding="async">'
          :marble(s.stone,s.seed);
}
let currentMat='Quartz';
const POPULAR={
  Quartz:['azul-shimmer','arabescato-elegance','calacatta-oro-quartz','borghini-royal',
          'calacatta-fantastico','laurent-black','marquina','carrara-jumbo','carrara-shimmer',
          'sahara-dunes','crema-tempest',
          'calacatta-gold-soft','arabescato-capri','arabescato-gold','grigio-fantasy',
          'almond-beige','arabescato-grey','crema-venato','crema-evora','sabbia-beige',
          'tuscany-supreme','misterio-gold','concrete-earth','fresh-cement','cloud-burst',
          'blue-lagoon'],
  Marble:['carrara-honed','calacatta-gold-oro','calacatta-viola','fantastico-arni',
          'arabescato-vagli-oro','calacatta-vagli-oro','bianco-eclypsia-calacatta','nero-marquina',
          'taj-mahal','patagonia','cristallo','belvedere-leather','blue-roma','fusion-blue-leather',
          'fusion-black','lemurian-blue','venaria-reale','rainforest-brown','verde-guatemala',
          'travertine-romano-classico'],
  Granite:['absolute-black-extra','bianco-crystal','azul-platino','colonial-cream','astoria',
           'blue-dunes-leather','colombo-juparana','antiq-brown-extra'],
};
function landingIndex(list,mat){
  const n=list.length, dark=i=>list[((i%n)+n)%n].tone==='dark';
  for(const slug of (POPULAR[mat||currentMat]||[])){
    const i=list.findIndex(s=>s.slug===slug);
    if(i>=0&&!dark(i)) return i;
  }
  let best=-1,score=Infinity;
  for(let i=0;i<n;i++){
    if(dark(i)) continue;
    let c=0; for(let d=-2;d<=2;d++) if(dark(i+d)) c++;
    if(c<score){score=c;best=i;}
  }
  return best>=0?best:0;
}
const OPEN_SPAN=7;
function clearOpening(list,s){
  const n=list.length, land=list[s];
  const lights=list.filter(x=>x.tone!=='dark').length;
  if(n<7||lights<5) return {list:list.slice(),s};
  const span=Math.min(OPEN_SPAN,Math.floor((lights-1)/2));
  const skipped=[],left=[],right=[];
  let i=s,j=s;
  while(left.length<span){ i=((i-1)%n+n)%n; (list[i].tone==='dark'?skipped:left).unshift(list[i]); }
  while(right.length<span){ j=(j+1)%n; (list[j].tone==='dark'?skipped:right).push(list[j]); }
  const used=new Set([...left,land,...right,...skipped].map(x=>x.slug));
  const rest=[];
  for(let k=1;k<=n;k++){ const x=list[(j+k)%n]; if(!used.has(x.slug)) rest.push(x); }
  const half=Math.ceil(skipped.length/2);
  const belt=[...skipped.slice(half),...left,land,...right,...skipped.slice(0,half),...rest];
  return {list:belt,s:belt.indexOf(land)};
}
function fanOrder(list){
  if(list.length<3) return list.slice();
  const {list:belt,s}=clearOpening(list,landingIndex(list));
  const n=belt.length, L=Math.min(LAND,n-1), out=new Array(n);
  for(let k=0;k<n;k++) out[(L+k)%n]=belt[(s+k)%n];
  return out;
}
let SLABS_UNIQUE=MATERIALS[currentMat];
let SLABS=SLABS_UNIQUE;
const LAND=3;
const wheel=orNull(document.getElementById('wheel')),readout=orNull(document.getElementById('readout'));
const prevBtn=orNull(document.getElementById('prev')),nextBtn=orNull(document.getElementById('next'));
const matBtns=[...document.querySelectorAll('#matTabs .mat-tab[data-mat]')];
const BEND=5, SCROLL_EASE=0.08, SCROLL_SPEED=1.4, BEND_PX=BEND*24;
let wheelPlayed=false, galleryOn=false;
let target=0, current=0;
let idx=LAND, dragging=false, dragStartX=0, dragStartTarget=0, moved=false;
let nodes=[], animTimers=[];
function buildNodes(){
  wheel.querySelectorAll('.slab').forEach(n=>n.remove());
  nodes=SLABS.map((s,i)=>{
    const el=document.createElement('div');el.className='slab';el.dataset.i=i;
    el.innerHTML=`<div class="stone">${stoneMarkup(s)}</div><div class="glass"></div><span class="name">${s.name}</span>`;
    el.addEventListener('click',()=>{
      if(moved||!galleryOn)return;
      const off=shortestOffset(i);
      if(off===0){ location.href='/stones/'+s.slug+'.html'; return; }
      target=Math.round(target)+off;
    });
    wheel.appendChild(el);return el;
  });
}
function mod(n,m){return((n%m)+m)%m;}
const stoneViewBtn=document.getElementById('stoneView');
function slabReadout(i){
  const s=SLABS[i];
  readout.innerHTML=`<div class="r-mat">${s.kind||s.mat}</div><div class="r-name"><span>${s.name}</span></div><div class="r-sup">Fitted with a ten-year guarantee</div>`;
  fitStoneName(readout.querySelector('.r-name'));
  if(stoneViewBtn)stoneViewBtn.href=`/stones/${s.slug}.html`;
}
function fitStoneName(el){
  if(!el)return;
  el.style.fontSize='';
  const sp=el.firstElementChild; if(!sp)return;
  const base=parseFloat(getComputedStyle(el).fontSize)||26;
  const lines=()=>{
    const lh=parseFloat(getComputedStyle(el).lineHeight)||base*1.15;
    return Math.round(sp.getBoundingClientRect().height/lh);
  };
  for(let fs=base; lines()>2 && fs>base*0.6; ){ fs-=1; el.style.fontSize=fs+'px'; }
}
function showArrows(on){const v=on?'1':'0',p=on?'auto':'none';prevBtn.style.opacity=v;nextBtn.style.opacity=v;prevBtn.style.pointerEvents=p;nextBtn.style.pointerEvents=p;}
function shortestOffset(i){ const n=SLABS.length; let d=mod(i-mod(Math.round(current),n),n); if(d>n/2)d-=n; return d; }
function metrics(){
  const cw=(nodes[0]&&nodes[0].offsetWidth)||320;
  const W=wheel.clientWidth||1200;
  let step;
  if(window.matchMedia('(min-width:1121px)').matches){
    const stageW=(wheel.parentElement&&wheel.parentElement.clientWidth)||W;
    const railW=parseFloat(getComputedStyle(wheel.parentElement).getPropertyValue('--railW'))||190;
    const stonesPad=parseFloat(getComputedStyle(orNull(document.getElementById('stones'))).paddingLeft)||0;
    const allowed=Math.max(stageW/2-railW-28+stonesPad,cw*1.2);
    step=Math.max((allowed-cw/2)/3,cw*0.42);
  }else{
    step=Math.max(cw*0.52,W*0.085,(W+cw*2)/SLABS.length);
  }
  const H=Math.max(wheel.clientWidth/2,1);
  const bend=wheelBend();
  const R=(H*H+bend*bend)/(2*bend);
  return {step,H,R};
}
let bendCache=null;
function wheelBend(){
  if(bendCache===null){
    const v=parseFloat(getComputedStyle(wheel).getPropertyValue('--wheelBend'));
    bendCache=(isFinite(v)&&v>0)?v:BEND_PX;
  }
  return bendCache;
}
function makeBelt(list){
  if(!list.length) return [];
  list=fanOrder(list);
  if(!window.matchMedia('(min-width:1121px)').matches) return list.slice();
  const cw=(nodes[0]&&nodes[0].offsetWidth)||320;
  const need=(wheel.clientWidth||1200)+cw*2;
  const reps=Math.max(1,Math.ceil(need/Math.max(list.length*metrics().step,1)));
  const out=[];
  for(let r=0;r<reps;r++) out.push(...list);
  return out;
}
function layout(pos){
  const n=SLABS.length,{step,H,R}=metrics();
  const total=n*step;
  nodes.forEach((el,i)=>{
    let x=(i-pos)*step;
    x=mod(x+total/2,total)-total/2;
    const ax=Math.min(Math.abs(x),H);
    const arc=R-Math.sqrt(Math.max(R*R-ax*ax,0));
    const rot=Math.sign(x)*Math.asin(ax/R)*(180/Math.PI);
    const d=Math.abs(x)/H;
    const near=Math.max(0,1-Math.abs(x)/(step*0.9));
    const sc=(1-Math.min(d,1)*0.14)*(1+near*0.09);
    const lift=near*-8;
    const op=Math.abs(x)>H*1.3?0:1;
    const stepsOut=Math.abs(x)/step;
    const br=Math.min(1,(stepsOut<=3 ? 1-0.22*stepsOut : Math.max(0.18,0.34-0.16*(stepsOut-3))));
    const fade=(n%2===0)?Math.max(0,Math.min(1,(total/2-step*0.5-Math.abs(x))/(step*0.5))):1;
    const vis=op*fade;
    el.style.transform=`translate3d(${x.toFixed(1)}px,${(arc+lift).toFixed(1)}px,0) rotate(${rot.toFixed(2)}deg) scale(${sc.toFixed(3)})`;
    el.style.opacity=vis.toFixed(3);
    el.style.setProperty('--dim',br.toFixed(3));
    el.style.zIndex=Math.round(100-d*50+near*40);
    el.style.pointerEvents=vis<0.15?'none':'auto';
    el.classList.toggle('center',near>0.5);
  });
  const c=mod(Math.round(pos),n);
  if(c!==idx){ idx=c; slabReadout(idx); }
}
function tick(){
  if(galleryOn){
    current+=(target-current)*SCROLL_EASE;
    if(Math.abs(target-current)<0.0005)current=target;
    layout(current);
  }
  requestAnimationFrame(tick);
}
let pendingIdx=null;
function startGallery(){
  if(!SLABS.length) return;
  galleryOn=true; wheel.classList.add('gallery'); showArrows(true);
  target=current=Math.min(LAND,SLABS.length-1); layout(current); slabReadout(idx);
  if(pendingIdx!=null){ target=Math.round(target)+shortestOffset(pendingIdx); pendingIdx=null; }
}
function pointerDown(x){ if(!galleryOn)return; dragging=true;moved=false;dragStartX=x;dragStartTarget=target;wheel.classList.add('dragging'); }
function pointerMove(x){
  if(!dragging)return;
  const {step}=metrics();
  const dx=x-dragStartX;
  if(Math.abs(dx)>4)moved=true;
  target=dragStartTarget-(dx/step)*SCROLL_SPEED;
}
function pointerUp(){ if(!dragging)return; dragging=false;wheel.classList.remove('dragging'); target=Math.round(target); }
wheel.addEventListener('mousedown',e=>{e.preventDefault();pointerDown(e.clientX);});
window.addEventListener('mousemove',e=>pointerMove(e.clientX));
window.addEventListener('mouseup',pointerUp);
wheel.addEventListener('touchstart',e=>pointerDown(e.touches[0].clientX),{passive:true});
wheel.addEventListener('touchmove',e=>pointerMove(e.touches[0].clientX),{passive:true});
wheel.addEventListener('touchend',pointerUp);
let stoneWheelAccum=0, stoneWheelCooldown=0;
wheel.addEventListener('wheel',e=>{
  if(!galleryOn)return;
  if(Math.abs(e.deltaX) < Math.abs(e.deltaY)*2)return;
  e.preventDefault();
  const now=performance.now();
  stoneWheelAccum+=e.deltaX;
  if(now>=stoneWheelCooldown && Math.abs(stoneWheelAccum)>24){
    target=Math.round(target)+(stoneWheelAccum>0?1:-1);
    stoneWheelAccum=0; stoneWheelCooldown=now+260;
  }
},{passive:false});
nextBtn.onclick=()=>{if(galleryOn)target=Math.round(target)+1;};
prevBtn.onclick=()=>{if(galleryOn)target=Math.round(target)-1;};
window.addEventListener('keydown',e=>{if(!galleryOn)return;if(e.key==='ArrowRight')target=Math.round(target)+1;if(e.key==='ArrowLeft')target=Math.round(target)-1;});
const reduceWheel=window.matchMedia('(prefers-reduced-motion:reduce)').matches;
function primeWheel(){
  showArrows(false);
  const L=Math.min(LAND,nodes.length-1);
  nodes.forEach((el,i)=>{
    el.classList.remove('center');
    if(i===L){ el.style.transform='translate3d(0,150px,0) scale(0.86)'; el.style.zIndex=30; }
    else{ el.style.transform='translate3d(0,0,0) scale(0.6)'; el.style.zIndex=1; }
    el.style.opacity=0;
  });
  slabReadout(L);
  idx=L;
}
function fanOut(){
  const n=SLABS.length,{step,H,R}=metrics();
  const L=Math.min(LAND,n-1);
  nodes.forEach((el,i)=>{
    let off=i-L; if(off>n/2)off-=n; if(off<-n/2)off+=n;
    const x=off*step, ax=Math.min(Math.abs(x),H);
    const arc=R-Math.sqrt(Math.max(R*R-ax*ax,0));
    const rot=Math.sign(x)*Math.asin(ax/R)*(180/Math.PI);
    const d=Math.abs(x)/H;
    const near=Math.max(0,1-Math.abs(x)/(step*0.9));
    const sc=(1-Math.min(d,1)*0.14)*(1+near*0.09);
    const lift=near*-8;
    const op=Math.abs(x)>H*1.3?0:1;
    const stepsOut=Math.abs(x)/step;
    const br=Math.min(1,(stepsOut<=3 ? 1-0.22*stepsOut : Math.max(0.18,0.34-0.16*(stepsOut-3))));
    const fade=(n%2===0)?Math.max(0,Math.min(1,(n*step/2-step*0.5-Math.abs(x))/(step*0.5))):1;
    el.style.transform=`translate3d(${x.toFixed(1)}px,${(arc+lift).toFixed(1)}px,0) rotate(${rot.toFixed(2)}deg) scale(${sc.toFixed(3)})`;
    el.style.opacity=(op*fade).toFixed(3);el.style.setProperty('--dim',br.toFixed(3));
    el.style.zIndex=Math.round(100-d*50+near*40);
    el.classList.toggle('center',near>0.5);
  });
}
function clearAnim(){ animTimers.forEach(clearTimeout); animTimers=[]; }
function playAnim(){
  clearAnim();
  wheel.classList.add('entering');
  const c=nodes[Math.min(LAND,nodes.length-1)];
  c.style.transform='translate3d(0,0,0) scale(0.86)';c.style.opacity=1;c.style.zIndex=30;
  animTimers.push(setTimeout(fanOut,850));
  animTimers.push(setTimeout(()=>{ wheel.classList.remove('entering'); startGallery(); },1900));
}
function playWheel(){ if(wheelPlayed)return; wheelPlayed=true; playAnim(); }
function loadMaterial(mat){
  currentMat=mat; wheelPlayed=true;
  matBtns.forEach(b=>b.classList.toggle('on',b.dataset.mat===mat));
  SLABS_UNIQUE=filterStones(MATERIALS[mat]);
  SLABS=makeBelt(SLABS_UNIQUE);
  refreshFilterUI();
  galleryOn=false; clearAnim();
  wheel.classList.remove('gallery','dragging','entering');
  if(!SLABS.length){ clearWheelToEmpty(); return; }
  restoreStoneActions();
  buildNodes();
  target=current=Math.min(LAND,SLABS.length-1);
  primeWheel();
  requestAnimationFrame(()=>requestAnimationFrame(playAnim));
}
matBtns.forEach(b=>b.addEventListener('click',()=>loadMaterial(b.dataset.mat)));
const stoneFilter={q:'',tone:new Set(),hue:new Set(),vein:new Set(),finish:new Set(),silica:new Set()};
const sfPanel=document.getElementById('stoneFilter'),sfBtn=document.getElementById('stoneFilterBtn'),
      sfSearch=document.getElementById('sfSearch'),sfCountEl=document.getElementById('sfCount'),
      sfBadgeEl=document.getElementById('sfBadge');
const sfActiveN=()=>(stoneFilter.q.trim()?1:0)+stoneFilter.tone.size+stoneFilter.hue.size+
                    stoneFilter.vein.size+stoneFilter.finish.size+stoneFilter.silica.size;
const STONE_WORDS={
  beige:'cream',sand:'cream',sandy:'cream',biscuit:'cream',ivory:'cream|white',
  offwhite:'white|cream',bright:'light white',warm:'cream',cool:'grey|white',
  charcoal:'dark grey|black',anthracite:'dark grey|black',graphite:'dark grey|black',silver:'grey',
  navy:'dark blue',teal:'blue|green',gold:'cream|gold',golden:'cream|gold',brass:'gold|cream',
  veiny:'statement',veined:'statement',veining:'statement',bold:'statement',
  dramatic:'statement',busy:'statement',patterned:'statement',marbled:'statement|soft',
  plain:'calm',uniform:'calm',solid:'calm',simple:'calm',subtle:'calm|soft',quiet:'calm|soft',
  matt:'honed',matte:'honed',flat:'honed',satin:'honed',gloss:'polished',glossy:'polished',
  shiny:'polished',shine:'polished',textured:'leathered',rough:'leathered',brushed:'leathered',
  sparkle:'shimmer',sparkly:'shimmer',sparkling:'shimmer',glitter:'shimmer',
  crystal:'shimmer|crystal',concrete:'cement|concrete',industrial:'cement|concrete',
  engineered:'quartz',manmade:'quartz',composite:'quartz',
  natural:'marble|granite|quartzite|travertine',
  hardwearing:'quartz|granite|quartzite',durable:'quartz|granite|quartzite',
  tough:'granite|quartzite|quartz',practical:'quartz|granite',
  lowmaintenance:'quartz',hygienic:'quartz',
  silicafree:'silicafree',nosilica:'silicafree',lowsilica:'lowsilica',
  silicosis:'silicafree|lowsilica',safe:'silicafree|lowsilica',
  marbleeffect:'quartz statement|soft',marblelook:'quartz statement|soft',
  marblestyle:'quartz statement|soft'
};
const STONE_FIXES={calcutta:'calacatta',calcatta:'calacatta',calacata:'calacatta',
  calacutta:'calacatta',calcata:'calacatta',carara:'carrara',carrera:'carrara',
  carrarra:'carrara',statuairo:'statuario',statuary:'statuario',marquena:'marquina',
  marchina:'marquina',arabascato:'arabescato',arabesco:'arabescato',quartzite:'quartzite',
  guatamala:'guatemala',emperador:'emperador',tajmahal:'taj mahal'};
const hayCache={};
function stoneHaystack(s){
  if(hayCache[s.slug])return hayCache[s.slug];
  const kind=(s.kind||s.mat)+(s.mat==='Quartz'?' engineered':' natural stone');
  const sil=s.silica==='free'?'silicafree lowsilica silica free':(s.silica==='low'?'lowsilica low silica':'');
  return hayCache[s.slug]=[s.name,kind,s.tone,s.hue,s.vein,s.finish,s.stone,sil]
    .join(' ').toLowerCase();
}
function nearlyIn(hay,t){
  if(t.length<5)return false;
  for(let i=0;i<t.length;i++){ if(hay.includes(t.slice(0,i)+t.slice(i+1)))return true; }
  return false;
}
function termHits(hay,raw){
  const t=STONE_FIXES[raw]||raw;
  if(hay.includes(t))return true;
  const rule=STONE_WORDS[t];
  if(rule)return rule.split(' ').every(grp=>grp.split('|').some(w=>hay.includes(w)));
  return nearlyIn(hay,t)||nearlyIn(hay,raw);
}
function matchStone(s,terms){
  const hay=stoneHaystack(s);
  return terms.every(t=>termHits(hay,t));
}
function filterStones(list){
  const q=stoneFilter.q.trim().toLowerCase()
    .replace(/\b(marble|stone)\s+(effect|look|style)\b/g,'$1$2')
    .replace(/\blow\s+maintenance\b/g,'lowmaintenance')
    .replace(/\bsilica[\s-]*free\b/g,'silicafree').replace(/\bfree[\s-]*of[\s-]*silica\b/g,'silicafree')
    .replace(/\blow[\s-]*silica\b/g,'lowsilica')
    .replace(/\boff[\s-]white\b/g,'offwhite');
  const terms=q?q.split(/[\s,]+/).filter(Boolean):[];
  return list.filter(s=>
    (!terms.length||matchStone(s,terms))&&
    (!stoneFilter.tone.size||stoneFilter.tone.has(s.tone))&&
    (!stoneFilter.hue.size ||stoneFilter.hue.has(s.hue)) &&
    (!stoneFilter.vein.size||stoneFilter.vein.has(s.vein))&&
    (!stoneFilter.finish.size||[...stoneFilter.finish].some(f=>(s.finish||'').toLowerCase().includes(f)))&&
    (!stoneFilter.silica.size||(s.silica&&(stoneFilter.silica.has(s.silica)||
      (s.silica==='free'&&stoneFilter.silica.has('low'))))));
}
function syncSilicaGroup(){
  if(!sfPanel)return;
  const grp=sfPanel.querySelector('.sf-chips[data-f="silica"]');
  if(!grp)return;
  const list=MATERIALS[currentMat]||[];
  const has={free:list.some(s=>s.silica==='free'),low:list.some(s=>s.silica==='free'||s.silica==='low')};
  let any=false;
  grp.querySelectorAll('.sf-chip').forEach(c=>{
    const on=!!has[c.dataset.v];
    c.hidden=!on; if(on)any=true;
    if(!on&&c.classList.contains('on')){ c.classList.remove('on'); stoneFilter.silica.delete(c.dataset.v); }
  });
  const box=grp.closest('.sf-group'); if(box)box.hidden=!any;
}
function syncChipAvailability(){
  if(!sfPanel)return;
  const list=MATERIALS[currentMat]||[];
  sfPanel.querySelectorAll('.sf-chips').forEach(g=>{
    const f=g.dataset.f;
    g.querySelectorAll('.sf-chip').forEach(c=>{
      if(c.hidden)return;
      if(c.classList.contains('on')){ c.disabled=false; return; }
      const v=c.dataset.v;
      c.disabled=!list.some(s=>{
        if(f==='finish'? !(s.finish||'').toLowerCase().includes(v) : s[f]!==v) return false;
        for(const k of ['tone','hue','vein','finish']){
          if(k===f||!stoneFilter[k].size) continue;
          const hit=k==='finish'
            ? [...stoneFilter[k]].some(x=>(s.finish||'').toLowerCase().includes(x))
            : stoneFilter[k].has(s[k]);
          if(!hit) return false;
        }
        return true;
      });
    });
  });
}
function refreshFilterUI(){
  syncSilicaGroup();
  syncChipAvailability();
  const total=MATERIALS[currentMat].length, act=sfActiveN();
  if(sfBadgeEl){ sfBadgeEl.hidden=!act; sfBadgeEl.textContent=act?act:''; }
  if(sfCountEl) sfCountEl.textContent=SLABS_UNIQUE.length?`Showing ${SLABS_UNIQUE.length} of ${total}`:`No matches in ${matLabel(currentMat)}`;
  if(sfPanel) sfPanel.classList.toggle('sf-empty',!SLABS_UNIQUE.length);
}
const stoneViewWrap=document.getElementById('stoneView');
function clearWheelToEmpty(){
  galleryOn=false; clearAnim();
  wheel.classList.remove('gallery','entering','dragging');
  wheel.querySelectorAll('.slab').forEach(el=>el.remove());
  nodes=[];
  readout.innerHTML=`<div class="r-mat">${matLabel(currentMat)}</div><div class="r-name">No stones match</div><div class="r-sup">Clear a filter or try another material</div>`;
  showArrows(false);
  if(stoneViewWrap){ stoneViewWrap.style.opacity='0.4'; stoneViewWrap.style.pointerEvents='none'; }
}
function restoreStoneActions(){
  if(stoneViewWrap){ stoneViewWrap.style.opacity=''; stoneViewWrap.style.pointerEvents=''; }
}
function applyStoneFilter(){
  SLABS_UNIQUE=filterStones(MATERIALS[currentMat]);
  SLABS=makeBelt(SLABS_UNIQUE);
  refreshFilterUI();
  if(!SLABS.length){ clearWheelToEmpty(); return; }
  restoreStoneActions();
  clearAnim(); wheel.classList.remove('entering');
  buildNodes();
  if(wheelPlayed){ wheel.classList.remove('gallery'); startGallery(); }
  else primeWheel();
}
function clearStoneFilters(){
  stoneFilter.q=''; if(sfSearch)sfSearch.value='';
  stoneFilter.tone.clear(); stoneFilter.hue.clear(); stoneFilter.vein.clear(); stoneFilter.finish.clear(); stoneFilter.silica.clear();
  if(sfPanel)sfPanel.querySelectorAll('.sf-chip.on').forEach(c=>c.classList.remove('on'));
}
if(sfPanel&&sfBtn){
  const sfOpen=o=>{ sfPanel.hidden=!o; sfBtn.setAttribute('aria-expanded',o?'true':'false'); if(o&&sfSearch)sfSearch.focus(); };
  sfBtn.addEventListener('click',()=>sfOpen(sfPanel.hidden));
  document.addEventListener('click',e=>{ if(!sfPanel.hidden&&!sfPanel.contains(e.target)&&!sfBtn.contains(e.target)) sfOpen(false); });
  window.addEventListener('keydown',e=>{ if(e.key==='Escape'&&!sfPanel.hidden) sfOpen(false); });
  sfPanel.querySelectorAll('.sf-chips').forEach(g=>{
    const key=g.dataset.f;
    g.querySelectorAll('.sf-chip').forEach(ch=>{
      ch.addEventListener('click',()=>{
        const v=ch.dataset.v, set=stoneFilter[key];
        if(set.has(v))set.delete(v); else set.add(v);
        ch.classList.toggle('on');
        applyStoneFilter();
      });
    });
  });
  if(sfSearch)sfSearch.addEventListener('input',()=>{ stoneFilter.q=sfSearch.value; applyStoneFilter(); });
  const sfClear=document.getElementById('sfClear');
  if(sfClear)sfClear.addEventListener('click',()=>{ clearStoneFilters(); applyStoneFilter(); });
  refreshFilterUI();
}
window.addEventListener('resize',()=>{ bendCache=null; if(galleryOn)layout(current); else if(!wheelPlayed)primeWheel(); });
buildNodes();
SLABS=makeBelt(SLABS_UNIQUE);
buildNodes();
requestAnimationFrame(tick);
function announceStone(){
  const s=SLABS[idx]; if(!s)return;
  document.dispatchEvent(new CustomEvent('topcat:stone',{detail:{name:s.name,mat:s.mat,stone:s.stone,seed:s.seed,slug:s.slug,sup:s.sup}}));
}
const stoneEstBtn=document.getElementById('stoneEst'),stoneAskBtn=document.getElementById('stoneAsk');
if(stoneEstBtn)stoneEstBtn.addEventListener('click',announceStone);
if(stoneAskBtn)stoneAskBtn.addEventListener('click',announceStone);
if(reduceWheel){ wheelPlayed=true; startGallery(); }
else{
  primeWheel();
  const wheelIO=new IntersectionObserver((es)=>{es.forEach(e=>{ if(e.isIntersecting){playWheel();wheelIO.disconnect();} });},{threshold:0.55});
  wheelIO.observe(wheel);
}
const REVIEWS=[
  {n:"Judy Z.", q:"10/10 experience!! I had Nick as my point of contact for the end to end stone worktop work, it was extremely smooth process with minimal hustle. From the beginning, Nick was very professional, responsive and polite, which was a great customer experience for me. The team came in the next week to measure and Nick ordered the stone right away, so it was ready for installation 3-4 days after they templated the worktop. On the installation day, the team spent about 1.5h to complete the work and has done a clean job. The 2 workers on the day were absolutely brilliant, and have done a great service! 🙏 Basically, there was a window corner which was not originally planned to install any 10cm stone cover, but they brought the extra materials and cut the bit of window frame perfectly and installed it on the day (as I was there in person and they checked with me before making any adjustments). Very happy with my experience"},
  {n:"Jhanzeb Chaudhry", q:"I’m so happy I went with Topcat Worktops for my kitchen! I had visited a few kitchen showrooms before and was honestly shocked at how expensive the quotes were. Topcat came in at least £1,200 cheaper than the others, and the quality and service were absolutely amazing. Nik was brilliant from the start, super helpful, always available to answer my questions (even out of hours), and guided me through the whole process with real care. On installation day, the team arrived on time and did a fantastic job. The finish is flawless, and everything was done to a really high standard. Highly recommend Topcat Worktops, great prices, great service, and a beautiful end result!"},
  {n:"Maheen Amjad", q:"Topcat Worktops came highly recommended by our interior designer, and they certainly didn't disappoint. As we're based in Scotland, everything was handled over the phone and email, but Nick made the whole process incredibly easy. He was always quick to respond, answered all our questions, and helped us choose the right worktop for our kitchen without any pressure. The service was professional from start to finish, and we always felt well looked after despite being hundreds of miles away. The Topcat Worktops team installed the worktop and the quality is excellent. We're delighted with the finished result and wouldn't hesitate to recommend Topcat Worktops to others."},
  {n:"Cherif", q:"Excellent service, quick responses and my Quartz kitchen worktop was installed within 48 hours from my initial conversation with Nick"},
  {n:"Joel Brizman", q:"Highly recommended: Topcat Worktops replaced our old kitchen worktop with a new quartz worktop. The process was quick and seamless. From the initial visit, their friendly staff took care to understand our vision and our requirements, which included a one-source A-to-Z solution (including removal and disposal of the old worktop and a complete refit of our existing plumbing and electric hob). The installation was carried out very quickly after ordering - and was smooth, efficient with the installers taking great care to ensure there was no damage to surroundings. We are very satisfied with the process and the outcome."},
  {n:"Abbas", q:"We recently chose a Calacatta Viola worktop from Topcat Worktops Ltd and couldn't be happier with the result. The team were helpful throughout the whole process and made everything easy from start to finish. The installation was carried out professionally and the worktop looks absolutely stunning in our kitchen. Would definitely recommend Topcat Worktops to anyone looking for quality products and excellent service."},
  {n:"Maria Shahsawar", q:"Really pleased with our new kitchen worktops from Topcat Worktops. Nick was brilliant from start to finish, very responsive, patient while we decided on colours and materials, and provided a free no-obligation quote with no pressure at all. The quality of the worktops and installation is excellent, and the finished kitchen looks amazing. The team were professional, tidy, and completed everything to a high standard. Would definitely recommend Topcat Worktops to anyone looking for new kitchen worktops."},
  {n:"Davinder Dhillon", q:"I’ve just had my quartz worktop installed, and I’m already thrilled with how it looks and feels. The finish is smooth, modern, and really elevates the whole kitchen. The craftsmanship is excellent, clean edges, seamless joints, and a perfect fit around the sink and hob. Even though it’s brand new, I can already tell it’s going to be easy to maintain and very durable. Overall, I’m extremely happy with the installation and excited to start using it."},
  {n:"Kav Patel", q:"Very pleased with the service that was provided by Topcats . Whilst our project took longer than expected, Topcats were very patient with us and delivered amazing worktops to complement our kitchen. Would definitely recommend Topcats and a big shout out to Nick who we started the journey with back in Feb 2025."},
  {n:"Kinga Skubiszewska", q:"Excellent experience from start to finish. Professional, responsive, and easy to work with throughout the project. Communication was clear, the work was completed to a high standard, and the entire process was handled efficiently. I am very happy with the results and would gladly work with them again. Highly recommended."},
  {n:"Ali Jaffer", q:"Really happy with their work. Nick was really helpful and transparent about the whole process, easy comms and a flawless finish. Would definitely recommend!"},
  {n:"Naied Khan", q:"Had kitchen work tops and back splash done. Work was done professionally with special attention to details. Everything was done within the time frame, and I am very happy with the results and the suggestions that were recommended, great service, and highly professional. Highly recommend 👌"},
  {n:"Farah Remadna", q:"Excellent service from start to finish. Everything was completed perfectly with great attention to detail. The team was friendly, professional, and easy to work with. Highly recommended!"},
  {n:"Megan Webb", q:"Excellent service and a wonderful company to work with - I would recommend to anyone."},
  {n:"Han L.", q:"Splashback was phenomenal, quick responses, reasonable pricing. Would recommend."},
]
  .filter(r=>!/luke|copley|thadeus|tabrez/i.test(r.n))
  .map(r=>({...r,a:r.n,img:phImg("PROJECT PHOTO")}));
const deck=orNull(document.getElementById('revDeck'));
const revSection=orNull(document.getElementById('reviews'));
const revStage=orNull(document.getElementById('revStage'));
const revNodes=REVIEWS.map((r,i)=>{
  const el=document.createElement('article');el.className='rev';el.dataset.i=i;el.tabIndex=0;
  el.dataset.full=r.q;
  el.innerHTML=`
    <div class="rev-inner">
      <div class="rev-face front">
        <div class="rev-stone" data-marble="${4100+i*7}"></div>
        <div class="rev-front">
          <div class="rev-top"><div class="stars">★★★★★</div><span class="rev-src">Google review</span></div>
          <p class="quote"><span class="qt"></span><button type="button" class="rev-more">Read more</button></p>
          <div class="rev-foot">
            <!-- The Stone-Grade Seal at signature size: the SAME 200-unit geometry as the mark in
                 the About section (two rings, plumb line, head, tail, diamond), not a redrawn
                 approximation. Stroke widths are non-scaling (see .rev-seal *), so they are read
                 as rendered px and stay hairline instead of scaling to a blob. -->
            <svg class="rev-seal" viewBox="0 0 200 200" fill="none" aria-hidden="true">
              <g stroke="currentColor">
                <circle cx="100" cy="100" r="92" stroke-width="0.55"/>
                <circle cx="100" cy="100" r="84" stroke-width="0.45" opacity="0.65"/>
                <path d="M100 44 L100 96" stroke-width="0.9" stroke-linecap="round"/>
                <path d="M78 96 L122 96 L100 124 Z" stroke-width="0.9" stroke-linejoin="round"/>
                <path d="M100 124 L100 150" stroke-width="0.9" stroke-linecap="round"/>
                <rect x="93" y="131" width="14" height="14" transform="rotate(45 100 138)" stroke-width="0.7"/>
              </g>
            </svg>
            <div class="rev-author">${r.n}</div>
          </div>
        </div>
      </div>
    </div>`;
  el.querySelector('.qt').textContent='“'+r.q+'”';
  el.querySelector('.rev-more').addEventListener('click',ev=>{
    ev.stopPropagation();
    toggleExpand(el);
  });
  marbleFill(el.querySelector('.rev-stone'), +el.querySelector('.rev-stone').dataset.marble);
  deck.appendChild(el);return el;
});
function isDesktopRev(){ return window.innerWidth>=1121; }
const REV_OPEN_GAP=24;
function collapseCard(el){
  el.classList.remove('expanded');
  el.style.height='';
  if(revStage){
    revStage.style.marginBottom='';
    revStage.style.setProperty('--revPagerDrop','0px');
  }
  fitQuote(el);
  if(isDesktopRev()){ if(!revPaging&&revPhase==='settled') placeDesktopRest(); }
  else el.style.zIndex='1';
}
function toggleExpand(el){
  if(!el)return;
  if(el.classList.contains('expanded')){ collapseCard(el); return; }
  if(!el.classList.contains('clamped'))return;
  revNodes.forEach(n=>{ if(n!==el && n.classList.contains('expanded')) collapseCard(n); });
  const base=el.offsetHeight;
  el.classList.add('expanded');
  el.style.zIndex='40';
  el.style.height=base+'px';
  fitQuote(el);
  const q=el.querySelector('.quote');
  const extra=q?Math.max(0,q.scrollHeight-q.clientHeight):0;
  const r0=el.getBoundingClientRect();
  const sc=(base&&r0.height)?r0.height/base:1;
  const vh=window.innerHeight||800;
  const capR=Math.min(Math.max(240,vh-r0.top-24),vh*0.80,640);
  const finalH=revSolo() ? base+extra+28
                         : Math.min(base+extra+28, capR/sc);
  el.style.height=finalH+'px';
  if(revSolo()){
    const band=parseFloat(getComputedStyle(revStage).paddingBottom)||0;
    const air=parseFloat(getComputedStyle(revSection).getPropertyValue('--revAir'))||0;
    const drop=Math.max(0,Math.round((r0.top+finalH*sc)+air/2+band-revStage.getBoundingClientRect().bottom));
    revStage.style.setProperty('--revPagerDrop',drop+'px');
    const strap=parseFloat(getComputedStyle(revSection.querySelector('.rev-cta')||revStage).marginTop)||REV_OPEN_GAP;
    revStage.style.marginBottom = drop>0 ? (drop+strap)+'px' : '';
  }else if(revStage){
    const over=(r0.top+finalH*sc)-revStage.getBoundingClientRect().bottom+REV_OPEN_GAP;
    revStage.style.marginBottom = over>1 ? Math.round(over)+'px' : '';
  }
}
function collapseAllReviews(){
  revNodes.forEach(n=>{ if(n.classList.contains('expanded')) collapseCard(n); });
}
const reduceRev=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function revNoEntrance(){ return reduceRev || revSolo(); }
let revEntered=revNoEntrance();
let gridSlots=[];
let entryOff=900;
let gridPage=0;
const pagePrevBtn=document.getElementById('revPagePrev');
const pageNextBtn=document.getElementById('revPageNext');
function perPage(){
  const el=document.getElementById('reviews');
  const v=el?parseInt(getComputedStyle(el).getPropertyValue('--revPer'),10):NaN;
  return Number.isFinite(v)&&v>0 ? v : (window.innerWidth<720?1:3);
}
function pageCount(){ return Math.ceil(REVIEWS.length/perPage()); }
function cardPage(i){ return Math.floor(i/perPage()); }
function pageCards(){ return revNodes.map((_,i)=>i).filter(i=>cardPage(i)===gridPage); }
function gridLayout(){
  collapseAllReviews();
  revSection.classList.toggle('rev-solo',revSolo());
  if(isDesktopRev()){ desktopLayout(); return; }
  const pp=perPage();
  gridPage=Math.max(0,Math.min(gridPage,pageCount()-1));
  const cw=deck.offsetWidth||480, ch=deck.offsetHeight||320;
  const gap=window.innerWidth<720?16:16;
  const availW=revSolo() ? Math.min(window.innerWidth*0.72,420)
                         : Math.min(window.innerWidth*0.80,1180);
  const stageH=deck.parentElement.clientHeight||520;
  let GS=(availW-(pp-1)*gap)/(pp*cw);
  if(revSolo()) GS=Math.min(GS,1);
  else GS=Math.min(GS,(stageH*0.94)/ch,1);
  if(!(GS>0))GS=0.5;
  const cellW=cw*GS;
  const totalW=pp*cellW+(pp-1)*gap;
  entryOff=window.innerWidth/2+cellW/2+80;
  if(revSolo()){
    revSection.style.setProperty('--revScale',GS.toFixed(4));
    soloR=soloRadius(cellW);
    soloOff=Math.round(soloStep(soloR));
    revSection.style.setProperty('--revPagerX',soloGapX(soloR,cellW).toFixed(1)+'px');
    gridSlots=revNodes.map(()=>({x:0,y:0,s:GS}));
    soloPlace(0,true);
    updatePageBtns();
    markClamped();
    return;
  }
  gridSlots=revNodes.map((_,i)=>{
    const col=i%pp;
    return {x:Math.round(-totalW/2+cellW/2+col*(cellW+gap)), y:0, s:GS};
  });
  revNodes.forEach((el,i)=>{
    el.style.zIndex=1;
    placeGridCard(i);
  });
  updatePageBtns();
  markClamped();
}
function fitQuote(el){
  const q=el.querySelector('.quote'), t=el.querySelector('.qt'), b=el.querySelector('.rev-more');
  if(!q||!t||!b)return;
  const full=el.dataset.full||'';
  if(el.classList.contains('expanded')){
    t.textContent='“'+full+'”'; b.style.display=''; b.textContent='Show less'; return;
  }
  b.style.display='none';
  t.textContent='“'+full+'”';
  if(q.scrollHeight<=q.clientHeight+1){
    el.classList.remove('clamped'); return;
  }
  el.classList.add('clamped');
  b.style.display=''; b.textContent='Read more';
  const words=full.split(/\s+/);
  let lo=1, hi=words.length, best=1;
  while(lo<=hi){
    const mid=(lo+hi)>>1;
    t.textContent='“'+words.slice(0,mid).join(' ')+'… ';
    if(q.scrollHeight<=q.clientHeight+1){ best=mid; lo=mid+1; } else { hi=mid-1; }
  }
  t.textContent='“'+words.slice(0,best).join(' ')+'… ';
}
function markClamped(){ revNodes.forEach(fitQuote); }
function updatePageBtns(){
  if(!pagePrevBtn||!pageNextBtn)return;
  const many=pageCount()>1;
  pagePrevBtn.disabled=!many;
  pageNextBtn.disabled=!many;
}
function placeGridCard(i){
  const page=cardPage(i);
  if(page===gridPage) seatGridCard(i,!revEntered);
  else parkGridCard(i,page<gridPage?-1:1);
}
function parkGridCard(i,dir,instant){
  const el=revNodes[i], g=gridSlots[i];
  if(el._revEndT){ clearTimeout(el._revEndT); el._revEndT=null; }
  const t=`translate3d(${Math.round(dir*entryOff)}px,${g.y}px,0) rotate(${(dir*4).toFixed(1)}deg) scale(${g.s.toFixed(3)})`;
  if(instant){
    const prev=el.style.transition;
    el.style.transition='none';
    el.style.transform=t;
    void el.offsetWidth;
    el.style.transition=prev;
  }else{
    el.classList.remove('leaving'); el.classList.add('entering');
    el.style.transform=t;
  }
  el.style.opacity=1;
  el.style.pointerEvents='none';
}
let pageRecycleT=null;
function goPage(d){
  const pages=pageCount();
  if(pages<2)return;
  if(revSolo()){
    collapseAllReviews();
    gridPage=(gridPage+d+pages)%pages;
    soloAnim+=d;
    revEntered=true;
    soloPlace(0,true);
    updatePageBtns();
    return;
  }
  const from=gridPage;
  gridPage=(gridPage+d+pages)%pages;
  revEntered=true;
  clearTimeout(pageRecycleT);
  revNodes.forEach((el,i)=>{
    const page=cardPage(i);
    if(page===gridPage){
      parkGridCard(i, d>0?1:-1, true);
      seatGridCard(i,false);
    }else if(page===from){
      parkGridCard(i, d>0?-1:1, false);
    }else{
      parkGridCard(i, d>0?1:-1, true);
    }
  });
  pageRecycleT=setTimeout(()=>{
    revNodes.forEach((el,i)=>{ if(cardPage(i)!==gridPage) parkGridCard(i, d>0?1:-1, true); });
  },1300);
  updatePageBtns();
}
const REV_FROM=[-1,-1,1,-1,1,1];
function seatGridCard(i,waiting){
  const el=revNodes[i], g=gridSlots[i], from=REV_FROM[i%REV_FROM.length];
  if(el._revEndT){ clearTimeout(el._revEndT); el._revEndT=null; }
  if(waiting){
    el.classList.remove('entering'); el.classList.add('leaving');
    el.style.transform=`translate3d(${Math.round(from*entryOff)}px,${g.y}px,0) rotate(${(from*4).toFixed(1)}deg) scale(${g.s.toFixed(3)})`;
  }else{
    el.classList.remove('leaving'); el.classList.add('entering');
    el.style.transform=`translate3d(${g.x}px,${g.y}px,0) rotate(0deg) scale(${g.s.toFixed(3)})`;
    el._revEndT=setTimeout(()=>{ el.classList.remove('entering'); el._revEndT=null; },1250);
  }
  el.style.opacity=1;
  el.style.pointerEvents=waiting?'none':'auto';
}
const SOLO_NS=0.86;
const SOLO_DIM=0.5;
const SOLO_GAP=12;
let soloOff=0;
const SOLO_ANG=32;
let soloR=520;
const SOLO_P=1000;
function soloRadius(cellW){
  const a=SOLO_ANG*Math.PI/180;
  const E=cellW/2+SOLO_GAP;
  const C=cellW*SOLO_NS*Math.cos(a)/2;
  const den=SOLO_P*Math.sin(a)-E*(1-Math.cos(a));
  return den>1 ? SOLO_P*(E+C)/den : cellW*2;
}
function soloGapX(R,cellW){
  const a=SOLO_ANG*Math.PI/180;
  const px=-cellW*SOLO_NS/2;
  const x1=px*Math.cos(a)+R*Math.sin(a);
  const z1=-px*Math.sin(a)+R*Math.cos(a);
  return (cellW/2 + x1*SOLO_P/(SOLO_P+R-z1))/2;
}
function soloStep(R){
  const a=SOLO_ANG*Math.PI/180;
  return R*Math.sin(a)*SOLO_P/(SOLO_P+R*(1-Math.cos(a)));
}
let soloDragged=false;
function revSolo(){ return !isDesktopRev() && perPage()===1; }
function soloDist(i){
  const n=pageCount();
  let d=(cardPage(i)-gridPage+n)%n;
  if(d>n/2)d-=n;
  return d;
}
const SOLO_DUR=620;
let soloAnim=0, soloA0=0, soloT0=0, soloRaf=null, soloDragBase=0;
const easeRoll=t=>t<0.5 ? 4*t*t*t : 1-Math.pow(-2*t+2,3)/2;
function soloStop(){ if(soloRaf!==null){ cancelAnimationFrame(soloRaf); soloRaf=null; } }
function soloFrame(now){
  soloRaf=null;
  const t=Math.min(1,(now-soloT0)/SOLO_DUR);
  soloAnim=soloA0*(1-easeRoll(t));
  if(t>=1) soloAnim=0;
  soloRender();
  if(t<1) soloRaf=requestAnimationFrame(soloFrame);
}
function soloSettle(){
  soloStop();
  if(Math.abs(soloAnim)<0.0008){ soloAnim=0; soloRender(); return; }
  soloA0=soloAnim; soloT0=performance.now();
  soloRaf=requestAnimationFrame(soloFrame);
}
function soloRender(){
  const gs=gridSlots.length?gridSlots[0].s:1;
  revNodes.forEach((el,i)=>{
    const d=soloDist(i);
    const u=d+soloAnim;
    const au=Math.abs(u);
    if(el._revEndT){ clearTimeout(el._revEndT); el._revEndT=null; }
    if(!revEntered){
      el.classList.remove('entering'); el.classList.add('leaving');
      const from=d===0?(REV_FROM[i%REV_FROM.length]):(d<0?-1:1);
      el.style.transform=`translate3d(${Math.round(from*entryOff)}px,0,0) scale(${(gs*SOLO_NS).toFixed(3)})`;
      el.style.opacity=Math.abs(d)<=1?1:0; el.style.pointerEvents='none'; el.style.zIndex=1;
      return;
    }
    el.classList.remove('entering','leaving');
    const t=Math.min(au,1);
    const s=gs*(1-(1-SOLO_NS)*t);
    const op=au<=1 ? 1-(1-SOLO_DIM)*au : Math.max(0,SOLO_DIM*(2-au));
    el.style.transform=
      `translateZ(${-soloR}px) rotateY(${(u*SOLO_ANG).toFixed(2)}deg) translateZ(${soloR}px) scale(${s.toFixed(3)})`;
    el.style.opacity=op.toFixed(3);
    el.style.pointerEvents=op>0.05?'auto':'none';
    el.style.zIndex=Math.round(10-au*3);
  });
}
let soloLiveT=null;
function soloPlace(drag,settle){
  if(!revEntered){
    soloStop(); soloAnim=0; clearTimeout(soloLiveT);
    deck.classList.remove('rev-live');
    soloRender(); return;
  }
  if(settle && !deck.classList.contains('rev-live') && !revNoEntrance()){
    soloStop(); soloAnim=0; soloRender();
    clearTimeout(soloLiveT);
    soloLiveT=setTimeout(()=>{ if(revEntered) deck.classList.add('rev-live'); },820);
    return;
  }
  clearTimeout(soloLiveT);
  deck.classList.add('rev-live');
  if(settle){ soloSettle(); return; }
  soloStop();
  soloAnim=soloDragBase+(soloOff>0?drag/soloOff:0);
  soloRender();
}
const SOLO_THROW=48;
const SOLO_FLICK=0.45;
const SOLO_FLICK_MIN=10;
attachSwipe(revStage,{
  enabled:revSolo,
  ignore:t=>!!(t.closest&&t.closest('.rev-page')),
  onStart:()=>{ soloStop(); soloDragBase=soloAnim; soloDragged=true; deck.classList.add('solo-dragging'); },
  onMove:dx=>{ soloPlace(dx,false); },
  onEnd:(dx,vx)=>{
    deck.classList.remove('solo-dragging');
    setTimeout(()=>{ soloDragged=false; },0);
    const flick=Math.abs(vx)>SOLO_FLICK&&Math.abs(dx)>SOLO_FLICK_MIN;
    if(Math.abs(dx)>SOLO_THROW){ goPage(dx<0?1:-1); return; }
    if(flick){ goPage(vx<0?1:-1); return; }
    soloPlace(0,true);
  }
});
let wheelAcc=0,wheelLock=false,wheelQuietT=null;
deck.addEventListener('wheel',e=>{
  if(!revSolo())return;
  if(Math.abs(e.deltaX)<=Math.abs(e.deltaY))return;
  e.preventDefault();
  clearTimeout(wheelQuietT);
  wheelQuietT=setTimeout(()=>{ wheelAcc=0; wheelLock=false; },140);
  if(wheelLock)return;
  wheelAcc+=e.deltaX;
  if(Math.abs(wheelAcc)>60){ goPage(wheelAcc>0?1:-1); wheelAcc=0; wheelLock=true; }
},{passive:false});
deck.addEventListener('click',e=>{
  if(e.target.closest('.rev-more'))return;
  const c=e.target.closest('.rev'); if(!c)return;
  if(soloDragged){ soloDragged=false; return; }
  if(revSolo()){
    const d=soloDist(revNodes.indexOf(c));
    if(d===1||d===-1){ goPage(d); return; }
  }
  toggleExpand(c);
});
deck.addEventListener('keydown',e=>{
  if(e.key!=='Enter'&&e.key!==' ')return;
  e.preventDefault();
  const c=e.target.closest('.rev'); if(c)toggleExpand(c);
});
if(pagePrevBtn)pagePrevBtn.onclick=()=>{ isDesktopRev()?shiftCards(-1):goPage(-1); };
if(pageNextBtn)pageNextBtn.onclick=()=>{ isDesktopRev()?shiftCards(1):goPage(1); };
window.addEventListener('resize',gridLayout);
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(gridLayout);
window.addEventListener('load',gridLayout);
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(gridLayout);
const N_REV=revNodes.length;
let revStart=0;
let desktopSlots=[];
let revPhase='enter';
let revPaging=false;
const REV_STAG=0;
const REV_FLIP_Y=130, REV_FLIP_RX=-88, REV_FLIP_SC=0.82;
const REV_ENTER_TOP=0.95, REV_SETTLE_TOP=0.20;
const eOut=t=>1-Math.pow(1-t,3);
const clampR=v=>v<0?0:v>1?1:v;
function measureDesktopSlots(){
  const cw=deck.offsetWidth||300, ch=deck.offsetHeight||400;
  const gap=28;
  const availW=Math.min(window.innerWidth*0.84,1220);
  const stageH=deck.parentElement.clientHeight||520;
  let GS=Math.min((availW-2*gap)/(3*cw),(stageH*0.96)/ch,1);
  if(!(GS>0))GS=0.9;
  const cellW=cw*GS, totalW=3*cellW+2*gap;
  desktopSlots=[0,1,2].map(s=>({x:Math.round(-totalW/2+cellW/2+s*(cellW+gap)),s:GS}));
}
function visibleRevIds(){ return [0,1,2].map(k=>(revStart+k)%N_REV); }
function restTransform(k){ const g=desktopSlots[k]; return `translate3d(${g.x}px,0,0) scale(${g.s.toFixed(3)})`; }
function parkReview(el){ el.style.transition='none'; el.style.transform='translate3d(0,60px,0) scale(0.9)'; el.style.opacity='0'; el.style.pointerEvents='none'; el.style.zIndex='0'; }
function placeDesktopRest(){
  const vis=visibleRevIds();
  revNodes.forEach((el,i)=>{
    const k=vis.indexOf(i);
    if(k<0){ parkReview(el); return; }
    el.style.transition='transform .5s var(--ease),opacity .4s var(--ease)';
    el.style.transform=restTransform(k);
    el.style.opacity='1'; el.style.pointerEvents='auto';
    el.style.zIndex=el.classList.contains('expanded')?'40':String(5-k);
  });
}
function applyEntranceFlip(p){
  const vis=visibleRevIds();
  revNodes.forEach((el,i)=>{
    const k=vis.indexOf(i);
    if(k<0){ parkReview(el); return; }
    const lp=clampR((p-k*REV_STAG)/(1-2*REV_STAG));
    const e=eOut(lp), g=desktopSlots[k];
    const y=REV_FLIP_Y*(1-e), rx=REV_FLIP_RX*(1-e), sc=REV_FLIP_SC+(g.s-REV_FLIP_SC)*e;
    el.style.transition='none';
    el.style.transform=`perspective(1400px) translate3d(${g.x}px,${y.toFixed(1)}px,0) rotateX(${rx.toFixed(1)}deg) scale(${sc.toFixed(3)})`;
    el.style.opacity=clampR(e*1.6).toFixed(3);
    el.style.pointerEvents=e>0.98?'auto':'none';
    el.style.zIndex=String(5-k);
  });
}
function revScrollProgress(){
  const top=revStage.getBoundingClientRect().top/(window.innerHeight||1);
  return clampR((REV_ENTER_TOP-top)/(REV_ENTER_TOP-REV_SETTLE_TOP));
}
function desktopReviewScroll(){
  if(!isDesktopRev()||revPaging)return;
  const p=reduceRev?1:revScrollProgress();
  if(p>=1){ if(revPhase!=='settled'){ revPhase='settled'; placeDesktopRest(); } }
  else{ revPhase='enter'; collapseAllReviews(); applyEntranceFlip(p); }
}
function desktopLayout(){
  measureDesktopSlots(); markClamped(); updatePageBtns();
  if(reduceRev){ revPhase='settled'; placeDesktopRest(); return; }
  const p=revScrollProgress();
  if(p>=1){ revPhase='settled'; placeDesktopRest(); }
  else{ revPhase='enter'; applyEntranceFlip(p); }
}
window.addEventListener('scroll',desktopReviewScroll,{passive:true});
function shiftCards(dir){
  if(revPaging||N_REV<4)return;
  collapseAllReviews(); measureDesktopSlots();
  revPaging=true;
  const oldVis=visibleRevIds();
  const leavingId=dir>0?oldVis[0]:oldVis[2];
  revStart=(revStart+dir+N_REV)%N_REV;
  const newVis=visibleRevIds();
  const enteringId=dir>0?newVis[2]:newVis[0];
  const enSlot=dir>0?2:0;
  const roll=380*dir;
  const offX=(window.innerWidth/2)+420;
  const lv=revNodes[leavingId];
  lv.style.transition='transform .72s cubic-bezier(.5,0,.7,1),opacity .6s ease';
  lv.style.transform=`translate3d(${(-dir*offX).toFixed(0)}px,-40px,0) rotate(${(-roll).toFixed(0)}deg) scale(0.5)`;
  lv.style.opacity='0'; lv.style.zIndex='1'; lv.style.pointerEvents='none';
  newVis.forEach((id,k)=>{
    if(id===enteringId)return;
    const el=revNodes[id];
    el.style.transition='transform .6s var(--ease),opacity .4s var(--ease)';
    el.style.transform=restTransform(k);
    el.style.opacity='1'; el.style.zIndex=String(5-k); el.style.pointerEvents='auto';
  });
  const en=revNodes[enteringId];
  en.style.transition='none';
  en.style.transform=`translate3d(${(dir*offX).toFixed(0)}px,-40px,0) rotate(${roll.toFixed(0)}deg) scale(0.5)`;
  en.style.opacity='0'; en.style.zIndex=String(5-enSlot); en.style.pointerEvents='none';
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
    en.style.transition='transform .74s cubic-bezier(.25,.9,.3,1),opacity .5s ease';
    en.style.transform=restTransform(enSlot);
    en.style.opacity='1';
  }));
  setTimeout(()=>{ revPaging=false; revPhase='settled'; placeDesktopRest(); },800);
}
gridLayout();
const REV_STEP_IN=140;
const REV_STEP_OUT=200;
const REV_PAGE_ORDER=[1,0,2];
let revSeqTimers=[];
function runRevSequence(seating){
  revSeqTimers.forEach(clearTimeout); revSeqTimers=[];
  if(revSolo()){ soloPlace(0,true); return; }
  const ids=pageCards();
  const seq=REV_PAGE_ORDER.filter(k=>k<ids.length).map(k=>ids[k]);
  const step=seating?REV_STEP_IN:REV_STEP_OUT;
  seq.forEach((ri,k)=>{
    revSeqTimers.push(setTimeout(()=>seatGridCard(ri,!seating),k*step));
  });
}
const REV_ENTER_LINE=0.74;
const REV_EXIT_LINE=0.68;
let revLastY=window.scrollY, revDir=0;
function checkRevSequence(){
  if(reduceRev)return;
  if(revSolo()){ if(!revEntered){ revEntered=true; soloPlace(0,true); } return; }
  if(isDesktopRev())return;
  const y=window.scrollY;
  if(Math.abs(y-revLastY)>=6){ revDir=y>revLastY?1:-1; revLastY=y; }
  const topFrac=revStage.getBoundingClientRect().top/(window.innerHeight||1);
  if(!revEntered && revDir>=0 && topFrac<=REV_ENTER_LINE){ revEntered=true;  runRevSequence(true); }
  else if(revEntered && revDir<0 && topFrac>=REV_EXIT_LINE){ revEntered=false; runRevSequence(false); }
}
checkRevSequence();
window.addEventListener('scroll',checkRevSequence,{passive:true});
window.addEventListener('resize',checkRevSequence);
const GLOW_EASE=0.1;
const glowItems=[];
function attachGlow(el){
  if(!el) return;
  const g={el,tx:0,ty:0,x:0,y:0,a:0,ta:0,init:false};
  el.addEventListener('pointerenter',()=>{ g.ta=1; });
  el.addEventListener('pointermove',e=>{
    const r=el.getBoundingClientRect();
    g.tx=e.clientX-r.left; g.ty=e.clientY-r.top;
    if(!g.init){ g.x=g.tx; g.y=g.ty; g.init=true; }
  });
  el.addEventListener('pointerleave',()=>{ g.ta=0; g.init=false; });
  glowItems.push(g);
}
function glowTick(){
  for(const g of glowItems){
    if(g.a<0.002&&g.ta===0)continue;
    g.x+=(g.tx-g.x)*GLOW_EASE; g.y+=(g.ty-g.y)*GLOW_EASE;
    g.a+=(g.ta-g.a)*0.12;
    const w=g.el.offsetWidth||1;
    g.el.style.setProperty('--gx',g.x.toFixed(1)+'px');
    g.el.style.setProperty('--gy',g.y.toFixed(1)+'px');
    g.el.style.setProperty('--gxb',(w-g.x).toFixed(1)+'px');
    g.el.style.setProperty('--ga',g.a.toFixed(3));
  }
  requestAnimationFrame(glowTick);
}
document.querySelectorAll('.svc').forEach(attachGlow);
document.querySelectorAll('.pstep-frame').forEach(attachGlow);
revNodes.forEach(attachGlow);
document.querySelectorAll('.hero-chips .glow-card').forEach(attachGlow);
requestAnimationFrame(glowTick);
(function(){
  const scroll=document.getElementById('galScroll');
  const stage=document.getElementById('galStage');
  if(!scroll||!stage||typeof SERVICES==='undefined'||typeof PROCESS==='undefined') return;
  const PROJECTS=[
    {key:'wimbledon', name:'The Wimbledon Project', place:'Wimbledon, London',
     img:'/assets/projects/wimbledon-1400.webp', brand:true, type:'Worktops and splashbacks, across multiple apartments',
     story:'A development of several apartments, each one templated and fitted on its own. The worktops and full height splashbacks run through every flat in the same stone, so the block reads as one piece of work rather than a set of separate kitchens.',
     reviewBy:'Kinga Skubiszewska',
     gallery:[['/assets/projects/wimbledon-g1.webp',1067,1600], ['/assets/projects/wimbledon-g2.webp',1067,1600], ['/assets/projects/wimbledon-g3.webp',1067,1600], ['/assets/projects/wimbledon-g4.webp',1067,1600], ['/assets/projects/wimbledon-g5.webp',1067,1600], ['/assets/projects/wimbledon-g6.webp',1067,1600], ['/assets/projects/wimbledon-g7.webp',1067,1600], ['/assets/projects/wimbledon-g8.webp',1067,1600], ['/assets/projects/wimbledon-g9.webp',1067,1600], ['/assets/projects/wimbledon-g10.webp',1067,1600], ['/assets/projects/wimbledon-g11.webp',1067,1600]]},
    {key:'watford', name:'The Watford Project', place:'Watford',
     img:'/assets/projects/watford-1400.webp', brand:true, type:'Worktop and splashback', story:'',
     gallery:[['/assets/projects/watford-g1.webp',1600,1066], ['/assets/projects/watford-g2.webp',1600,1066], ['/assets/projects/watford-g3.webp',1600,1066], ['/assets/projects/watford-g4.webp',1600,1066], ['/assets/projects/watford-g5.webp',1600,1066], ['/assets/projects/watford-g6.webp',1600,1066], ['/assets/projects/watford-g7.webp',1600,1067], ['/assets/projects/watford-g8.webp',1600,1067], ['/assets/projects/watford-g9.webp',1600,1067], ['/assets/projects/watford-g10.webp',1600,1067], ['/assets/projects/watford-g11.webp',1600,1067], ['/assets/projects/watford-g12.webp',1600,1067], ['/assets/projects/watford-g13.webp',1600,1067], ['/assets/projects/watford-g14.webp',1600,1067], ['/assets/projects/watford-g15.webp',1600,1067], ['/assets/projects/watford-g16.webp',1600,1067], ['/assets/projects/watford-g17.webp',1600,1067], ['/assets/projects/watford-g18.webp',1600,1067]]},
    {key:'hornchurch', name:'The Hornchurch Project', place:'Essex',
     img:'/assets/projects/hornchurch-1400.webp', brand:true, type:'Worktop, island and splashbacks',
     story:'Taj Mahal quartzite at 30mm, across the worktop, the island and the splashbacks, with a single ogee edge worked through the run.',
     gallery:[['/assets/projects/hornchurch-g1.webp',882,1177], ['/assets/projects/hornchurch-g4.webp',1569,1177], ['/assets/projects/hornchurch-g5.webp',1569,1177], ['/assets/projects/hornchurch-g7.webp',1200,1600], ['/assets/projects/hornchurch-g8.webp',1200,1600], ['/assets/projects/hornchurch-g9.webp',1200,1600], ['/assets/projects/hornchurch-g10.webp',1200,1600]]},
    {key:'rickmansworth', name:'The Rickmansworth Project', place:'Rickmansworth',
     img:'/assets/projects/rickmansworth-1400.webp', brand:true, type:'Worktop and splashback', story:'',
     gallery:[['/assets/projects/rickmansworth-g1.webp',1084,1446], ['/assets/projects/rickmansworth-g2.webp',1084,1446], ['/assets/projects/rickmansworth-g3.webp',1084,1446], ['/assets/projects/rickmansworth-g4.webp',1084,1446], ['/assets/projects/rickmansworth-g5.webp',1084,1446], ['/assets/projects/rickmansworth-g6.webp',1084,1446], ['/assets/projects/rickmansworth-g7.webp',1200,1600], ['/assets/projects/rickmansworth-g8.webp',1200,1600], ['/assets/projects/rickmansworth-g9.webp',1200,1600], ['/assets/projects/rickmansworth-g10.webp',1200,1600], ['/assets/projects/rickmansworth-g11.webp',1200,1600], ['/assets/projects/rickmansworth-g12.webp',1200,1600], ['/assets/projects/rickmansworth-g13.webp',1200,1600], ['/assets/projects/rickmansworth-g14.webp',1200,1600], ['/assets/projects/rickmansworth-g15.webp',1200,1600]]},
    {key:'ruislip', name:'The Ruislip Project', place:'Ruislip, Hillingdon',
     img:'/assets/projects/ruislip-1400.webp', brand:true, type:'Worktop, splashback, breakfast bar and arches',
     story:'Calacatta Sydney Black quartz at 20mm, across the worktop, the island and the splashbacks. The breakfast bar was cut to the room, and the doorway into the kitchen lined in the same stone so the run carries through.',
     gallery:[['/assets/projects/ruislip-g1.webp',1067,1600], ['/assets/projects/ruislip-g2.webp',1067,1600], ['/assets/projects/ruislip-g3.webp',1067,1600], ['/assets/projects/ruislip-g4.webp',1067,1600], ['/assets/projects/ruislip-g5.webp',1067,1600], ['/assets/projects/ruislip-g6.webp',1067,1600]]},
    {key:'central-london', name:'The Central London Project', place:'London',
     img:'/assets/projects/central-london-1400.webp', brand:true, type:'Worktop', story:'',
     reviewBy:'Joel Brizman', brand:true,
     gallery:[['/assets/projects/central-london-g1.webp',1600,1067], ['/assets/projects/central-london-g2.webp',1600,1067], ['/assets/projects/central-london-g3.webp',1600,1067], ['/assets/projects/central-london-g4.webp',1600,1067], ['/assets/projects/central-london-g5.webp',1600,1067], ['/assets/projects/central-london-g6.webp',1600,1067], ['/assets/projects/central-london-g7.webp',1600,1067], ['/assets/projects/central-london-g8.webp',1600,1067], ['/assets/projects/central-london-g9.webp',1600,1067], ['/assets/projects/central-london-g10.webp',1600,1067], ['/assets/projects/central-london-g11.webp',1600,1067], ['/assets/projects/central-london-g12.webp',1600,1067], ['/assets/projects/central-london-g13.webp',1600,1067]]},
    {key:'harlow', name:'The Harlow Project', place:'Essex',
     img:'/assets/projects/harlow-1400.webp', brand:true, type:'Worktop and splashback', story:'', brand:true,
     gallery:[['/assets/projects/harlow-g1.webp',1084,1446], ['/assets/projects/harlow-g2.webp',882,1177], ['/assets/projects/harlow-g3.webp',1084,1446], ['/assets/projects/harlow-g4.webp',1084,1446], ['/assets/projects/harlow-g5.webp',1084,1446], ['/assets/projects/harlow-g6.webp',1084,1446], ['/assets/projects/harlow-g8.webp',1200,1600], ['/assets/projects/harlow-g9.webp',1200,1600], ['/assets/projects/harlow-g10.webp',1200,1600], ['/assets/projects/harlow-g11.webp',1200,1600], ['/assets/projects/harlow-g12.webp',1200,1600], ['/assets/projects/harlow-g13.webp',1200,1600], ['/assets/projects/harlow-g14.webp',1200,1600], ['/assets/projects/harlow-g15.webp',1200,1600]]},
    {key:'harrow', name:'The Harrow Project', place:'Harrow',
     img:'/assets/projects/harrow-1400.webp', brand:true, type:'Worktop', story:'', brand:true,
     gallery:[['/assets/projects/harrow-g1.webp',1084,1446], ['/assets/projects/harrow-g2.webp',1084,1446]]}
  ];
  const PER_SET=4;
  const NSETS=Math.ceil(PROJECTS.length/PER_SET);
  let focused=false;
  const RUNWAY=5.5;
  const GATHER_FROM=0.40, GATHER_TO=1.86;
  const GATHER_FROM_P=0.30, GATHER_TO_P=0.98;
  const SPREAD_START=0.27, SPREAD_END=0.47;
  const SPREAD_START_P=0.10, SPREAD_END_P=0.88;
  const COL_STAG=0.58;
  const COL_SQ=2/3;
  const WALK_START=0.56,  WALK_END=0.70;
  const HALL_PAST=1150;
  const HALL_FAR=1600;
  const WALL_TILT=0;
  const DOOR_ANG=78;
  const DOOR_SPEED=1.6;
  const PAIR_G=18;
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp01=v=>v<0?0:v>1?1:v;
  const ss=t=>t*t*(3-2*t);
  const lerp=(a,b,t)=>a+(b-a)*t;
  const SLOTS=[
    {s:1.00, dir:-1, ord:0, ed:0.60, ey:-0.16},
    {s:1.00, dir:-1, ord:2, ed:0.92, ey: 0.20},
    {s:1.00, dir: 1, ord:1, ed:0.66, ey: 0.14},
    {s:1.00, dir: 1, ord:3, ed:1.00, ey:-0.22}
  ];
  const SIDE_MARGIN=0.035;
  const STAGGER=0.12;
  const GTOTAL=1+STAGGER*(PROJECTS.length-1);
  const STACK_SC=1.18;
  const PEEK=0.062;
  const PEEK_PHONE=0.17;
  const PEEK_CARDS=[1,2];
  const MID_BAND=0.32;
  const MID_GAP=26;
  const navBar=document.querySelector('header.bar');
  const mBar=document.querySelector('.mbar');
  const galStatic=()=>{
    const m=getComputedStyle(stage.closest('#gallery')||stage).getPropertyValue('--galMode').trim();
    return m==='phone'||m==='grid';
  };
  let cw=340, ch=224, stackY=0, bandY=0, phone=false, M={w:1000,h:700};
  function measure(){
    const w=stage.clientWidth||1000, h=stage.clientHeight||700;
    phone=galStatic();
    const galEl=stage.closest('#gallery');
    if(galEl) galEl.classList.toggle('gal-static',phone);
    const navH=navBar?navBar.offsetHeight:0;
    const barH=(mBar&&mBar.offsetHeight)||0;
    const avail=Math.max(240,h-navH);
    bandY=navH/2;
    const margin=Math.max(30,Math.min(132,avail*0.135));
    const byH=(avail-2*margin-PAIR_G)/2/0.66;
    const byW=w*(0.5-SIDE_MARGIN-MID_BAND/2)-MID_GAP;
    cw = phone ? Math.min(w*0.42,300) : Math.min(w*0.30,byH,byW,430);
    ch=Math.round(cw*0.66*(phone?COL_SQ:1));
    let lo=Infinity,hi=-Infinity;
    for(let s=0;s<NSETS;s++)for(let i=0;i<PER_SET;i++){
      const d=(PER_SET-1)-i+s*PER_SET, y=-d*(ch*PEEK), half=ch*STACK_SC*(1-d*0.022)/2;
      if(y-half<lo)lo=y-half;
      if(y+half>hi)hi=y+half;
    }
    stackY=bandY-(lo+hi)/2;
    if(phone) stackY=(navH-barH)/2;
    if(phone){
      const vhNow=window.innerHeight;
      const colW=Math.min(w-2*22,460);
      colSc=colW/cw;
      colH=ch*colSc;
      colGap=Math.round(Math.min(18,Math.max(10,vhNow*0.018)));
      scroll.style.height='';
      stage.style.height='';
      if(mid) mid.style.height='';
      stage.querySelectorAll('.gal-card').forEach(c=>{ c.style.transform=''; c.style.opacity=''; });
      stage.querySelectorAll('.gal-door').forEach(d=>{ d.style.transform=''; d.style.boxShadow=''; });
      stage.querySelectorAll('.gal-meta').forEach(m=>{ m.style.opacity=''; });
      if(mid){ mid.style.opacity=''; mid.style.transform=''; }
      const midAct=mid&&mid.querySelector('.gal-mid-actions');
      if(midAct) midAct.style.opacity='';
      stage.style.setProperty('--cw',Math.round(colW)+'px');
      stage.style.setProperty('--ch',Math.round(colH)+'px');
      stage.style.setProperty('--colGap',colGap+'px');
      stage.style.setProperty('--galNavH',navH+'px');
      stage.style.setProperty('--galBarH',barH+'px');
      M={w,h:vhNow};
      return;
      const subEl=mid&&mid.querySelector('.section-sub');
      const copyBottom=subEl ? (subEl.offsetTop+subEl.offsetHeight) : (navH+140);
      const colAir=Math.min(30,Math.max(18,vhNow*0.03));
      colTop=Math.round(copyBottom+colAir);
      const actH=(midActions&&midActions.offsetHeight)||56;
      const foot=Math.round(actH+barH+Math.max(56,vhNow*0.082));
      colStageH=Math.round(colTop+PROJECTS.length*(colH+colGap)-colGap+foot);
      stage.style.height='';
      if(mid) mid.style.height=colStageH+'px';
      travelMax=Math.max(0,colStageH-vhNow);
      animPx=0;
      scroll.style.height=(vhNow+animPx+travelMax)+'px';
      const fanFull=(PROJECTS.length-1)*ch*PEEK_PHONE;
      stackY=colTop+colH/2-vhNow/2+fanFull;
    }else{
      stage.style.height='';
    }
    stage.style.setProperty('--cw',cw+'px'); stage.style.setProperty('--ch',ch+'px');
    stage.style.setProperty('--galBandY',bandY+'px');
    stage.style.setProperty('--galNavH',navH+'px');
    stage.style.setProperty('--galBarH',barH+'px');
    M={w,h:phone?window.innerHeight:h};
  }
  function columnPos(i,s){
    const n=s*PER_SET+i;
    return {x:0, y:colTop+n*(colH+colGap)+colH/2-M.h/2, rot:0, sc:colSc};
  }
  const colOrd=(i,s)=>s*PER_SET+i;
  const pileDepth=(i,s)=> phone ? (PROJECTS.length-1)-colOrd(i,s)
                                : (PER_SET-1)-i + s*PER_SET;
  function stackPos(i,s){
    const d=pileDepth(i,s);
    if(phone) return {x:0, y:stackY-d*(ch*PEEK_PHONE), rot:0, sc:colSc};
    return {x:0, y:stackY-d*(ch*PEEK), rot:0, sc:STACK_SC*(1-d*0.022)};
  }
  function sidePos(i){
    const s=SLOTS[i].s;
    const side=(i%2===0)?-1:1;
    const row=(i<2)?-1:1;
    const yShift = phone ? -M.h*0.07 : 0;
    return {x:side*(M.w/2 - M.w*SIDE_MARGIN - cw*s/2),
            y:bandY + yShift + row*(PAIR_G/2 + ch*s/2), rot:0, sc:s};
  }
  function entryPos(i,s){
    const f=SLOTS[i], p=stackPos(i,s);
    const dir=(s%2===0)?f.dir:-f.dir;
    if(phone){
      const side=(pileDepth(i,s)%2===0)?-1:1;
      const off=(M.w + cw*p.sc)/2 + 8;
      return {x:p.x+side*off, y:p.y, rot:0, sc:p.sc};
    }
    return {x:p.x+dir*(M.w*f.ed+cw*p.sc*0.6), y:p.y+f.ey*M.h, rot:0, sc:p.sc*0.82};
  }
  function cardGather(gRaw,i,s){
    const ord = phone ? colOrd(i,s) : ((NSETS-1-s)*PER_SET + SLOTS[i].ord);
    return ss(clamp01(gRaw*GTOTAL - ord*STAGGER));
  }
  const mid=document.getElementById('galMid');
  const midActions=mid&&mid.querySelector('.gal-mid-actions');
  const sets=[];
  for(let s=0;s<NSETS;s++){
    const setEl=document.createElement('div');
    setEl.className='gal-set';
    const nodes=PROJECTS.slice(s*PER_SET,(s+1)*PER_SET).map((p,i)=>{
      const el=document.createElement('article');
      el.className='gal-card';
      el.tabIndex=0; el.setAttribute('role','button');
      el.setAttribute('aria-label',p.name+', '+p.place);
      el.dataset.name=p.name; el.dataset.place=p.place; el.dataset.key=p.key||'';
      el.style.zIndex=10+i;
      el.innerHTML=`<div class="gal-door glow-card">
        <img src="${p.img||phImg(p.ph||p.name.toUpperCase())}"${ss(p.img,"(max-width:720px) 440px, 1160px")} alt="${p.name}, ${p.place}" draggable="false" loading="lazy" decoding="async">
        <div class="gal-veil"></div>
        <div class="sheen"></div>
        <div class="gal-meta"><span class="gal-name">${p.name}</span><span class="gal-place">${p.place}</span></div>
      </div>`;
      const door=el.querySelector('.gal-door');
      door.style.transformOrigin=(i%2===0)?'0% 50%':'100% 50%';
      attachGlow(door);
      el.addEventListener('click',()=>openFocus(el));
      el.addEventListener('keydown',e=>{ if(e.key==='Enter'||e.key===' '){e.preventDefault();openFocus(el);} });
      setEl.appendChild(el);
      return el;
    });
    stage.appendChild(setEl);
    sets.push({el:setEl,nodes,doors:nodes.map(n=>n.querySelector('.gal-door'))});
  }
  let colSc=1, colH=0, colGap=14, colTop=0, colStageH=0;
  let animPx=0, travelMax=0;
  function sizeRunway(){
    if(galStatic()){ scroll.style.height=''; return; }
    scroll.style.height=(window.innerHeight*RUNWAY)+'px';
  }
  const SCRUB=0.045;
  let gTarget=0, gCur=0, pTarget=0, pCur=0, raf=null, last=0;
  const ANIM_MS=1600;
  let animT0=null, animQ=0;
  function readScroll(){
    const vh=window.innerHeight;
    const r=scroll.getBoundingClientRect();
    const gt=1-r.top/vh;
    const gF=phone?GATHER_FROM_P:GATHER_FROM, gT=phone?GATHER_TO_P:GATHER_TO;
    gTarget=reduce?1:clamp01((gt-gF)/(gT-gF));
    const len=Math.max(1,scroll.offsetHeight-vh);
    pTarget=clamp01(-r.top/len);
    if(phone && animT0===null && r.top<=0) animT0=performance.now();
  }
  function render(){
    if(phone) return;
    const vh=window.innerHeight;
    const gRaw=gCur, p=pCur;
    const sS=phone?SPREAD_START_P:SPREAD_START, sE=phone?SPREAD_END_P:SPREAD_END;
    const animFrac = (animPx+travelMax)>0 ? animPx/(animPx+travelMax) : 1;
    const q      = phone ? animQ : 0;
    const travel = phone ? clamp01((p-animFrac)/Math.max(1-animFrac,0.0001))*travelMax : 0;
    const sPhase = phone ? q : 0;
    const spreadLin=reduce?1:(phone?sPhase:clamp01((p-sS)/(sE-sS)));
    const spread=reduce?1:ss(spreadLin);
    const walk=phone?0:ss(clamp01((p-WALK_START)/(WALK_END-WALK_START)));
    const open=spread;
    const stackAmt=1-spread;
    mid.style.opacity=(phone ? clamp01((gRaw*GTOTAL-0.04)/0.34)
                             : clamp01((spread-0.72)/0.28)).toFixed(3);
    if(midActions) midActions.style.opacity = phone ? clamp01((spread-0.55)/0.45).toFixed(3) : '';
    if(mid) mid.style.transform = phone ? `translateY(${(-travel).toFixed(1)}px)` : '';
    let anySettled=false;
    for(let s=0;s<NSETS;s++){
      const u=walk-s;
      const z  = reduce ? 0 : (u>=0 ? u*HALL_PAST : u*HALL_FAR);
      const y  = reduce ? -u*vh*1.05 : 0;
      const op = u>=0 ? clamp01((1-u)*3.2)
                      : clamp01(1+u*1.02);
      const hold=(s===0)?1:spread;
      const zP=phone?0:z*hold, yP=phone?-travel:y*hold, opP=phone?1:lerp(1,op,hold);
      const set=sets[s];
      set.el.style.transform=`translate3d(0,${yP.toFixed(1)}px,${zP.toFixed(1)}px)`;
      set.el.style.opacity=opP.toFixed(3);
      set.el.style.visibility=opP<0.001?'hidden':'visible';
      set.el.style.zIndex=phone?String(10+s):String(10+Math.round(u*5));
      const fold=reduce?0:ss(clamp01(u*DOOR_SPEED));
      const settled=phone ? open>0.96 : (Math.abs(u)<0.05 && open>0.96);
      set.el.classList.toggle('settled',settled);
      if(settled) anySettled=true;
      set.nodes.forEach((el,i)=>{
        const g=phone?1:cardGather(gRaw,i,s);
        const A=entryPos(i,s), B=stackPos(i,s), D=phone?columnPos(i,s):sidePos(i);
        const n=s*PER_SET+i;
        const spC = phone
          ? ss(clamp01((spreadLin*(1+COL_STAG) - ((PROJECTS.length-1-n)/(PROJECTS.length-1))*COL_STAG)))
          : spread;
        const x  =lerp(lerp(A.x,B.x,g), D.x, spC);
        const yy =lerp(lerp(A.y,B.y,g), D.y, spC);
        const sc =lerp(lerp(A.sc,B.sc,g), D.sc, spC);
        el.style.transform=`translate3d(${x.toFixed(1)}px,${yy.toFixed(1)}px,0) scale(${sc.toFixed(3)})`;
        el.style.opacity=g.toFixed(3);
        if(phone && el._meta!==null){
          el._meta = el._meta || el.querySelector('.gal-meta');
          const isFront = (n===PROJECTS.length-1);
          if(el._meta) el._meta.style.opacity = Math.max(spC, isFront ? g : 0).toFixed(3);
        }
        if(PEEK_CARDS.indexOf(i)>=0){
          const a=stackAmt.toFixed(3);
          set.doors[i].style.boxShadow=`0 34px 80px -30px rgba(0,0,0,0.92),inset 0 0 0 3px rgba(198,166,100,${a}),0 0 0 1px rgba(198,166,100,${(stackAmt*0.6).toFixed(3)})`;
        }
        const side=(i%2===0)?-1:1;
        const ry=phone?0:-side*(WALL_TILT*spread + (DOOR_ANG-WALL_TILT)*fold);
        set.doors[i].style.transform=`rotateY(${ry.toFixed(2)}deg)`;
      });
    }
    stage.classList.toggle('settled',anySettled);
  }
  function frame(now){
    raf=null;
    if(phone) return;
    const dt=Math.min(Math.max((now-last)/1000,0),0.1); last=now;
    readScroll();
    const f=reduce?1:1-Math.pow(1-SCRUB,dt*60);
    const playing = animT0!==null && animQ<1;
    if(playing){
      const raw=Math.min(1,(now-animT0)/ANIM_MS);
      animQ=reduce?1:raw;
    }
    const dg=gTarget-gCur;
    if(phone) pCur=pTarget;
    const dp=pTarget-pCur;
    if(!playing && Math.abs(dg)<0.0002 && Math.abs(dp)<0.0002){
      gCur=gTarget; pCur=pTarget; render(); return;
    }
    gCur+=dg*f; if(!phone) pCur+=dp*f;
    render();
    raf=requestAnimationFrame(frame);
  }
  function kick(){ if(raf===null){ last=performance.now(); raf=requestAnimationFrame(frame); } }
  window.addEventListener('scroll',kick,{passive:true});
  const detail=document.getElementById('projDetail');
  const dName=document.getElementById('projName');
  const dPlace=document.getElementById('projPlace');
  const dMetaPlace=document.getElementById('projMetaPlace');
  const heroBg=document.getElementById('projHeroBg');
  const mediaWrap=document.getElementById('projMedia');
  let MEDIA=[];
  const HERO_N=5, heroSlides=[];
  for(let i=0;i<HERO_N;i++){ const s=document.createElement('div'); s.className='phb-slide'; heroBg.appendChild(s); heroSlides.push(s); }
  let heroIdx=0, heroTimer=null, heroSeq=[], heroRun=0;
  const srcOf=g=>Array.isArray(g)?g[0]:g;
  const preload=u=>new Promise(res=>{ const im=new Image(); im.onload=im.onerror=()=>res(u); im.src=u; });
  function startHero(clickedSrc, pool){
    const run=++heroRun;
    clearInterval(heroTimer); heroTimer=null;
    const list=(pool&&pool.length?pool.map(srcOf):[]);
    heroSeq=[clickedSrc,...list.filter(s=>s!==clickedSrc)];
    heroSlides.forEach(s=>{ s.style.transition='none'; s.style.opacity='0'; s.style.zIndex='0'; s.classList.remove('active'); });
    heroIdx=0;
    const first=heroSlides[0];
    first.style.backgroundImage=`url("${heroSeq[0]}")`;
    void first.offsetWidth;
    first.style.opacity='1'; first.style.zIndex='1'; first.classList.add('active');
    requestAnimationFrame(()=>heroSlides.forEach(s=>{ s.style.transition=''; }));
    if(heroSeq.length<2) return;
    heroSeq.slice(1,3).forEach(preload);
    heroTimer=setInterval(()=>advance(run),4500);
  }
  async function advance(run){
    if(run!==heroRun || heroSeq.length<2) return;
    const cur=heroSlides[heroIdx%HERO_N], nxt=heroSlides[(heroIdx+1)%HERO_N];
    const url=heroSeq[(heroIdx+1)%heroSeq.length];
    await preload(url);
    if(run!==heroRun) return;
    nxt.style.backgroundImage=`url("${url}")`;
    nxt.style.transition='none'; nxt.style.opacity='0'; nxt.style.zIndex='2';
    void nxt.offsetWidth;
    nxt.style.transition=''; nxt.classList.add('active'); nxt.style.opacity='1';
    heroIdx++;
    setTimeout(()=>{
      if(run!==heroRun) return;
      cur.style.transition='none'; cur.style.opacity='0'; cur.style.zIndex='0'; cur.classList.remove('active');
      void cur.offsetWidth; cur.style.transition='';
      preload(heroSeq[(heroIdx+1)%heroSeq.length]);
    },1400);
  }
  function stopHero(){ heroRun++; clearInterval(heroTimer); heroTimer=null; }
  function loadMedia(proj){
    mediaWrap.innerHTML='';
    MEDIA=(proj&&proj.gallery?proj.gallery:[]).map(g=>({src:g[0],w:g[1],h:g[2]}));
    MEDIA.forEach((m,i)=>{
      const el=document.createElement('div');
      el.className='proj-ph glow-card';
      el.tabIndex=0; el.setAttribute('role','button');
      el.setAttribute('aria-label',(proj.name||'Project')+', photograph '+(i+1)+' of '+MEDIA.length);
      el.innerHTML='<img src="'+m.src+'" width="'+m.w+'" height="'+m.h+'" alt="'+
        ((proj.name||'Project')+', photograph '+(i+1))+'" loading="lazy" decoding="async" draggable="false">'+
        '<div class="sheen"></div>';
      el.addEventListener('click',()=>openLightbox(i));
      el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openLightbox(i);}});
      attachGlow(el);
      mediaWrap.appendChild(el);
    });
    if(proj&&proj.brand&&MEDIA.length){
      const first=MEDIA[0];
      const gap=c=>(c-(MEDIA.length%c))%c;
      const n3=gap(3), n2=gap(2);
      const plate=document.createElement('div');
      plate.className='proj-brand';
      plate.setAttribute('aria-hidden','true');
      if(first&&first.w&&first.h){
        plate.style.setProperty('--brandAR3',first.w+' / '+(first.h*(n3||1)));
        plate.style.setProperty('--brandAR2',first.w+' / '+(first.h*(n2||1)));
      }
      plate.style.setProperty('--brandShow3',n3?'flex':'none');
      plate.style.setProperty('--brandShow2',n2?'flex':'none');
      plate.innerHTML='<img src="/assets/brand/topcat-vertical.svg" alt="" draggable="false">';
      mediaWrap.appendChild(plate);
      requestAnimationFrame(()=>{
        const ragged=()=>{
          const bottoms=new Map();
          for(const el of mediaWrap.children){
            if(!el.offsetWidth&&!el.offsetHeight) continue;
            const x=Math.round(el.offsetLeft);
            bottoms.set(x,Math.max(bottoms.get(x)||0,el.offsetTop+el.offsetHeight));
          }
          const v=[...bottoms.values()];
          return v.length>1?Math.max(...v)-Math.min(...v):0;
        };
        const withPlate=ragged();
        plate.style.display='none';
        const without=ragged();
        plate.style.display='';
        if(withPlate>=without) plate.remove();
      });
    }
    mediaWrap.style.display=MEDIA.length?'':'none';
  }
  const lightbox=document.getElementById('projLightbox');
  const plImg=document.getElementById('plImg');
  const plLabel=document.getElementById('plLabel');
  const plCounter=document.getElementById('plCounter');
  let lbIndex=0;
  function renderLb(){ const m=MEDIA[lbIndex]; plImg.style.backgroundImage=`url(${m.src})`; plLabel.textContent=''; plCounter.textContent=(lbIndex+1)+' / '+MEDIA.length; lightbox.classList.toggle('is-video',m.type==='video'); }
  function openLightbox(i){ lbIndex=i; renderLb(); lightbox.classList.add('on'); lightbox.setAttribute('aria-hidden','false'); }
  function closeLightbox(){ lightbox.classList.remove('on'); lightbox.setAttribute('aria-hidden','true'); }
  function lbNext(){ lbIndex=(lbIndex+1)%MEDIA.length; renderLb(); }
  function lbPrev(){ lbIndex=(lbIndex-1+MEDIA.length)%MEDIA.length; renderLb(); }
  orNull(document.getElementById('plNext')).addEventListener('click',lbNext);
  orNull(document.getElementById('plPrev')).addEventListener('click',lbPrev);
  orNull(document.getElementById('plClose')).addEventListener('click',closeLightbox);
  function openFocus(el){
    const img=el.querySelector('img');
    const proj=PROJECTS.find(p=>p.key===el.dataset.key)||{};
    dName.textContent=el.dataset.name;
    dPlace.textContent=el.dataset.place;
    if(dMetaPlace) dMetaPlace.textContent=el.dataset.place;
    const setRow=(rowId,valId,val)=>{const r=document.getElementById(rowId),v=document.getElementById(valId);
      if(v) v.textContent=val||''; if(r) r.style.display=val?'':'none';};
    setRow('projTypeRow','projMetaType',proj.type);
    const desc=document.getElementById('projDesc'), story=document.getElementById('projStory'),
          storyWrap=document.getElementById('projStoryWrap'), intro=detail.querySelector('.proj-intro');
    if(story) story.textContent=proj.story||'';
    if(storyWrap) storyWrap.style.display=proj.story?'':'none';
    const rev=document.getElementById('projRev'), revText=document.getElementById('projRevText'),
          revName=document.getElementById('projRevName');
    let r=null;
    if(proj.reviewBy){
      try{ r=REVIEWS.find(x=>x.n===proj.reviewBy)||null; }catch(e){ console.warn('REVIEWS not in scope for',proj.reviewBy,e); }
      if(!r) console.warn('No review found for',proj.reviewBy);
    }
    if(revText) revText.textContent=r?'“'+r.q+'”':'';
    if(revName) revName.textContent=r?r.n:'';
    if(rev) rev.style.display=r?'':'none';
    const hasCol=!!(proj.story||r);
    if(desc) desc.style.display=hasCol?'':'none';
    if(intro) intro.style.gridTemplateColumns=hasCol?'':'1fr';
    loadMedia(proj);
    startHero(img.src, proj.gallery);
    detail.scrollTop=0;
    detail.classList.add('on'); detail.setAttribute('aria-hidden','false');
    document.documentElement.classList.add('proj-open');
    focused=true;
  }
  function closeFocus(){ if(lightbox.classList.contains('on'))closeLightbox(); detail.classList.remove('on'); detail.setAttribute('aria-hidden','true'); document.documentElement.classList.remove('proj-open'); stopHero(); focused=false; }
  orNull(document.querySelector('header.bar')).addEventListener('click',e=>{
    if(e.target.closest('a') && detail.classList.contains('on')) closeFocus();
  },true);
  orNull(document.getElementById('projClose')).addEventListener('click',closeFocus);
  (function(){
    const overlay=document.createElement('div');
    overlay.className='gal-grid-view';
    overlay.setAttribute('aria-hidden','true');
    overlay.innerHTML='<button type="button" class="gal-grid-close">Close &times;</button>'+
      '<div class="gal-grid-title"><h3>Project <em>gallery</em></h3></div>'+
      '<div class="gal-grid-inner"></div>';
    const inner=overlay.querySelector('.gal-grid-inner');
    PROJECTS.forEach(p=>{
      const it=document.createElement('article');
      it.className='gal-grid-item glow-card'; it.tabIndex=0; it.setAttribute('role','button');
      it.setAttribute('aria-label',p.name+', '+p.place);
      it.dataset.name=p.name; it.dataset.place=p.place; it.dataset.key=p.key||'';
      it.innerHTML=`<img src="${p.img||phImg(p.ph||p.name.toUpperCase())}"${ss(p.img,"(max-width:720px) 440px, 1160px")} alt="${p.name}, ${p.place}" draggable="false" loading="lazy" decoding="async"><div class="gg-veil"></div><div class="sheen"></div><span class="gg-name">${p.name}</span><span class="gg-place">${p.place}</span>`;
      attachGlow(it);
      it.addEventListener('click',()=>openFocus(it));
      it.addEventListener('keydown',e=>{ if(e.key==='Enter'||e.key===' '){e.preventDefault();openFocus(it);} });
      inner.appendChild(it);
    });
    document.body.appendChild(overlay);
    const openGrid=()=>{ overlay.classList.add('on'); overlay.setAttribute('aria-hidden','false'); document.documentElement.classList.add('gal-grid-open'); };
    const closeGrid=()=>{ overlay.classList.remove('on'); overlay.setAttribute('aria-hidden','true'); document.documentElement.classList.remove('gal-grid-open'); };
    overlay.querySelector('.gal-grid-close').addEventListener('click',closeGrid);
    document.querySelectorAll('.gal-grid-btn').forEach(b=>b.addEventListener('click',e=>{ e.preventDefault(); e.stopPropagation(); openGrid(); }));
    window.addEventListener('keydown',e=>{ if(e.key==='Escape'&&overlay.classList.contains('on')&&!detail.classList.contains('on')) closeGrid(); });
  })();
  window.addEventListener('keydown',e=>{
    if(lightbox.classList.contains('on')){
      if(e.key==='Escape')closeLightbox();
      else if(e.key==='ArrowRight')lbNext();
      else if(e.key==='ArrowLeft')lbPrev();
      return;
    }
    if(e.key==='Escape'&&focused)closeFocus();
  });
  window.addEventListener('resize',()=>{ sizeRunway(); measure(); kick(); });
  if('ResizeObserver' in window){
    let lastW=0,lastH=0;
    new ResizeObserver(()=>{
      const w=Math.round(stage.clientWidth), h=Math.round(stage.clientHeight);
      if(w===lastW&&h===lastH) return;
      lastW=w; lastH=h;
      sizeRunway(); measure(); kick();
    }).observe(stage);
  }
  window.addEventListener('load',()=>{ sizeRunway(); measure(); kick(); });
  if(document.fonts&&document.fonts.ready) document.fonts.ready.then(()=>{ measure(); kick(); });
  document.body.appendChild(detail);
  document.body.appendChild(lightbox);
  (function boot(){
    if(!window.innerHeight||!stage.clientWidth){ setTimeout(boot,120); return; }
    sizeRunway();
    measure();
    readScroll();
    gCur=gTarget; pCur=pTarget;
    render();
  })();
})();
(function(){
const FAQS = [
  {
    g:'Price and guarantee', label:'What it costs', tag:'Pricing',
    q:'How much does a stone worktop cost?',
    a:'It depends on the stone, the size of your kitchen and the detailing, but most kitchens fall within a clear range, which the estimator above shows you in seconds. Your exact, itemised price, covering template, fabrication, fitting and VAT, follows a free home visit, with nothing hidden.'
  },
  {
    g:'Price and guarantee', label:'Hidden costs', tag:'Pricing',
    q:'Are there any hidden costs?',
    a:'None. Your quote covers templating, precision cutting and installation, itemised in full before any work begins. Cut-outs, drainer grooves and pencil edges come as standard rather than as extras. The price we agree is the price you pay.'
  },
  {
    g:'Price and guarantee', label:'Our guarantee', tag:'Aftercare',
    q:'What happens if something is not right after fitting?',
    a:'We come back and put it right, free of charge. Every kitchen is made by hand, so now and again a surface wants a small adjustment once you have lived with it for a few days. The difference is how long you wait. We have never taken more than 72 hours to come back out, and the ten year guarantee sits behind the work either way.'
  },
  {
    g:'How it works', label:'How long it takes', tag:'Process',
    q:'How long does it take, start to finish?',
    a:'From template to fitted worktop is typically three to five working days. One visit to template your kitchen by hand to the millimetre, then our fitters install the finished surface, and we are back inside 72 hours if anything at all needs attention.'
  },
  {
    g:'How it works', label:'Who comes to your home', tag:'Process',
    q:'Who will actually be coming to my home?',
    a:'The same small team throughout. One of us comes out to template, and the same team fits it. The cutting is done by our own experienced fabricators, so the whole job stays with us rather than being passed down the line. You get one name and one number for the whole job, so you always know who is coming and when.'
  },
  {
    g:'How it works', label:'Where we work', tag:'Areas',
    q:'Which areas do you cover?',
    a:'London, Hertfordshire, Essex, Berkshire, Buckinghamshire, Surrey, Oxfordshire and Bedfordshire for the full service, and we template nationwide for projects worth the journey. If you are just outside these areas, ask. We are always happy to see if we can help.'
  },
  {
    g:'Your stone', label:'Choosing your stone', tag:'Materials',
    q:'Quartz, granite or marble, which is right for me?',
    a:'There is no single best, it depends on how you live. Quartz suits most busy kitchens: durable, non-porous, no sealing. Granite is natural, heat-tolerant and hard-wearing. Marble is the most beautiful but needs care, as it etches and patinas. Tell us how you cook and we will steer you honestly.'
  },
  {
    g:'Your stone', label:'Matching your slab', tag:'Materials',
    q:'Will the slab match the sample I saw?',
    a:'Natural stone varies, that is its beauty. Before a single cut is made you approve your exact slab from photographs of the piece itself, so the veining you fall for is precisely what arrives in your kitchen. You are also welcome to visit the distributor\'s warehouse and choose your slab in person, which for natural stone we highly recommend.'
  },
  {
    g:'Your stone', label:'Porcelain and sintered', tag:'Materials',
    q:'Do you work with porcelain and sintered stone?',
    a:'Yes, made to order. Porcelain takes direct heat, holds its colour in sunlight and works outdoors as well as in, which is why it suits outdoor kitchens and the run beside a hob. It is cut on a waterjet rather than a saw and the thin edges are mitred by hand to read as solid stone, so we price it against your plans rather than from a calculator. Send us what you have and we will come back with a figure.'
  },
  {
    g:'Living with it', label:'Seams and joints', tag:'Craftsmanship',
    q:'Will I be able to see the seams?',
    a:'A seam is always visible, and anyone who tells you otherwise is selling you something. What we can do is place it where it is least in the way, close it tight and match the veining through it, so it reads as part of the stone rather than as a join. We will show you where every seam will fall before anything is cut.'
  },
  {
    g:'Living with it', label:'Hot pans and heat', tag:'Care',
    q:'Can I put a hot pan straight onto it?',
    a:'On granite and porcelain, yes. Quartz is the one to be careful with, because the resin that binds it can mark if a pan comes straight off the hob, so use a trivet. If you cook hard and would rather never think about it, porcelain takes direct heat without complaint, and plenty of kitchens run porcelain around the hob and quartz everywhere else.'
  },
  {
    g:'Living with it', label:'Silica and safety', tag:'Safety',
    q:'Is a stone worktop safe to have in the house?',
    a:'Completely. A sealed, installed worktop poses no silica risk in your home, the dust risk comes from the fabrication process and not from having a finished worktop in your kitchen. It matters all the same, which is why we carry out our fabrication in our own workshop, where we control the cutting process, use appropriate dust extraction and wet-cutting methods, and follow current HSE guidance.'
  }
];
const faqIndex = document.getElementById('faqIndex');
const panel    = document.getElementById('faqPanel');
const faqBody  = document.getElementById('faqBody');
if(faqIndex && panel && faqBody){
  const tagEl=document.getElementById('fpTag'), qEl=document.getElementById('fpQ'),
        aEl  =document.getElementById('fpA');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const narrow = window.matchMedia('(max-width:760px)');
  const faqSection = document.getElementById('faq');
  const faqPhone = () => faqSection &&
    getComputedStyle(faqSection).getPropertyValue('--faqMode').trim() === 'phone';
  const groups=[];
  FAQS.forEach((f,i)=>{
    let g=groups[groups.length-1];
    if(!g || g.name!==f.g){ g={name:f.g, items:[]}; groups.push(g); }
    g.items.push(i);
  });
  const tabs=[];
  const groupOf=[];
  const posInGroup=[];
  groups.forEach((g,gi)=>{
    const wrap=document.createElement('div');
    wrap.className='faq-group';
    const k=document.createElement('h3');
    k.className='faq-gk'; k.textContent=g.name; k.style.setProperty('--gi',gi);
    wrap.appendChild(k);
    g.items.forEach((i,row)=>{
      const f=FAQS[i];
      const b=document.createElement('button');
      b.type='button'; b.className='faq-q'; b.id='faqQ'+i;
      b.setAttribute('aria-controls','faqPanel');
      b.setAttribute('aria-label',f.q);
      b.style.setProperty('--fi',i);
      const dot=document.createElement('span'); dot.className='faq-dot'; dot.setAttribute('aria-hidden','true');
      const txt=document.createElement('span'); txt.className='faq-qt'; txt.textContent=f.label;
      const full=document.createElement('span'); full.className='faq-qf'; full.textContent=f.q;
      full.setAttribute('aria-hidden','true');
      b.append(dot,txt,full);
      wrap.appendChild(b);
      tabs[i]=b; groupOf[i]=gi; posInGroup[i]=row;
    });
    faqIndex.appendChild(wrap);
  });
  let cur=-1;
  function place(){
    if(narrow.matches && cur>=0) tabs[cur].after(panel);
    else faqBody.appendChild(panel);
  }
  function deselect(){
    if(cur>=0){
      tabs[cur].classList.remove('on');
      tabs[cur].removeAttribute('aria-current');
      tabs[cur].setAttribute('aria-expanded','false');
    }
    cur=-1;
    if(faqSection) faqSection.classList.add('faq-shut');
    place();
  }
  function select(k,focus){
    if(k<0 || k>=tabs.length || k===cur) return;
    if(faqSection) faqSection.classList.remove('faq-shut');
    if(cur>=0){
      tabs[cur].classList.remove('on');
      tabs[cur].removeAttribute('aria-current');
      tabs[cur].setAttribute('aria-expanded','false');
    }
    cur=k;
    tabs[k].setAttribute('aria-expanded','true');
    const t=tabs[k], f=FAQS[k];
    t.classList.add('on');
    t.setAttribute('aria-current','true');
    tagEl.textContent=f.tag; qEl.textContent=f.q; aEl.textContent=f.a;
    panel.setAttribute('aria-labelledby',t.id);
    place();
    if(!reduce){ panel.classList.remove('fp-in'); void panel.offsetWidth; panel.classList.add('fp-in'); }
    if(focus) t.focus();
  }
  let lockT=null;
  function lockPlate(){
    if(narrow.matches){ panel.style.minHeight=''; return; }
    const t0=tagEl.textContent, q0=qEl.textContent, a0=aEl.textContent;
    const wasIn=panel.classList.contains('fp-in');
    panel.classList.remove('fp-in');
    panel.style.minHeight='0px';
    let max=0;
    for(const f of FAQS){
      tagEl.textContent=f.tag; qEl.textContent=f.q; aEl.textContent=f.a;
      if(panel.offsetHeight>max) max=panel.offsetHeight;
    }
    tagEl.textContent=t0; qEl.textContent=q0; aEl.textContent=a0;
    panel.style.minHeight=max+'px';
    if(wasIn) panel.classList.add('fp-in');
  }
  const relock=()=>{ clearTimeout(lockT); lockT=setTimeout(lockPlate,120); };
  tabs.forEach((b,i)=>b.addEventListener('click',()=>{
    if(faqPhone() && i===cur) deselect(); else select(i,false);
  }));
  faqIndex.addEventListener('keydown',e=>{
    const n=tabs.length;
    if(cur<0) return;
    let k=null;
    if(e.key==='ArrowDown')      k=(cur+1)%n;
    else if(e.key==='ArrowUp')   k=(cur-1+n)%n;
    else if(e.key==='ArrowRight'||e.key==='ArrowLeft'){
      const dir=e.key==='ArrowRight'?1:-1;
      const g=groups[(groupOf[cur]+dir+groups.length)%groups.length];
      k=g.items[Math.min(posInGroup[cur], g.items.length-1)];
    }
    else if(e.key==='Home') k=0;
    else if(e.key==='End')  k=n-1;
    if(k===null) return;
    e.preventDefault();
    select(k,true);
  });
  narrow.addEventListener('change',()=>{ place(); lockPlate(); });
  window.addEventListener('resize',relock);
  window.addEventListener('resize',()=>{ if(!faqPhone() && cur<0) select(0,false); });
  if(faqPhone()) deselect(); else select(0,false);
  lockPlate();
  if(document.fonts && document.fonts.ready) document.fonts.ready.then(lockPlate);
  if(reduce){
    faqIndex.classList.add('in');
  }else{
    const io = new IntersectionObserver(es=>{
      es.forEach(e=>faqIndex.classList.toggle('in', e.isIntersecting || e.boundingClientRect.top < 0));
    },{rootMargin:'0px 0px -12% 0px'});
    io.observe(faqIndex);
  }
}
})();
(function(){
  const BAR=76, GAP=18;
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FIT={
    reviews  :['#reviews .section-head'  ,'#reviews .rev-cta'],
    services :['#services .svc-wrap'     ,'#services .svc-wrap'],
    stones   :['#stones .section-head'   ,'#stones .wheel-ui'],
    estimator:['#estimator .section-head','#estimator .est-grid'],
    why      :['#why .section-head'      ,'#why .why-mosaic'],
    process  :['#process .section-head'  ,'#process .section-cta'],
    faq      :['#faq .faq-header'        ,'#faq .faq-foot']
  };
  function absTop(el){ let y=0,n=el; while(n){ y+=n.offsetTop; n=n.offsetParent; } return y; }
  let navRaf=null;
  function glideTo(y){
    if(navRaf){ cancelAnimationFrame(navRaf); navRaf=null; }
    const start=window.scrollY, dist=y-start;
    if(reduce||Math.abs(dist)<2){ window.scrollTo({top:y,behavior:'instant'}); return; }
    const dur=Math.min(1100,Math.max(450,Math.abs(dist)/9));
    const t0=performance.now();
    const ease=t=>t<0.5 ? 4*t*t*t : 1-Math.pow(-2*t+2,3)/2;
    const stop=()=>{ if(navRaf){ cancelAnimationFrame(navRaf); navRaf=null; }
                     window.removeEventListener('wheel',stop); window.removeEventListener('touchstart',stop); };
    window.addEventListener('wheel',stop,{passive:true,once:true});
    window.addEventListener('touchstart',stop,{passive:true,once:true});
    (function step(now){
      const t=Math.min(1,(now-t0)/dur);
      window.scrollTo({top:Math.round(start+dist*ease(t)),behavior:'instant'});
      if(t<1){ navRaf=requestAnimationFrame(step); } else { navRaf=null; stop(); }
    })(t0);
  }
  function targetFor(id){
    const vh=window.innerHeight||1;
    if(id==='gallery'){
      const sc=document.getElementById('galScroll');
      if(sc&&sc.offsetHeight>vh) return absTop(sc)+0.5*(sc.offsetHeight-vh);
    }
    const fit=FIT[id];
    if(fit){
      const h=document.querySelector(fit[0]), t=document.querySelector(fit[1]);
      if(h&&t){
        const top=absTop(h), comp=absTop(t)+t.offsetHeight-top, avail=vh-BAR;
        return top-BAR-(comp<=avail-GAP*2 ? Math.max(GAP,(avail-comp)/2) : GAP);
      }
    }
    const el=document.getElementById(id);
    return el ? absTop(el)-BAR-GAP : null;
  }
  document.addEventListener('click',e=>{
    const a=e.target.closest('a[href^="#"]');
    if(!a||a.getAttribute('href')==='#') return;
    const id=a.getAttribute('href').slice(1);
    if(!document.getElementById(id)) return;
    const y=targetFor(id);
    if(y===null) return;
    e.preventDefault();
    const max=Math.max(0,document.documentElement.scrollHeight-(window.innerHeight||0));
    glideTo(Math.max(0,Math.min(Math.round(y),max)));
    history.replaceState(null,'','#'+id);
  });
})();
(function(){
  const divs=[...document.querySelectorAll('.section-divider')];
  if(!divs.length) return;
  const shine=()=>{
    const vh=window.innerHeight||1;
    divs.forEach(d=>{
      const r=d.getBoundingClientRect();
      const p=1-(r.top+r.height/2)/vh;
      const c=Math.max(0,Math.min(1,p));
      d.style.setProperty('--shine',(c*100).toFixed(1)+'%');
      d.style.setProperty('--shineA',
        Math.max(0,Math.min(1,(c-0.04)/0.10,(0.96-c)/0.10)).toFixed(3));
    });
  };
  shine();
  window.addEventListener('scroll',shine,{passive:true});
  window.addEventListener('resize',shine);
})();
(function(){
  const bar=document.getElementById('siteBar'); if(!bar)return;
  const hero=document.getElementById('hero');
  const on=()=>{
    const film=document.documentElement.classList.contains('cine-on')&&hero;
    const formed=film?(hero.getBoundingClientRect().top<=-40):(window.scrollY>40);
    bar.classList.toggle('scrolled',formed);
    bar.classList.toggle('preform',!!film&&!formed);
  };
  on();
  window.addEventListener('scroll',on,{passive:true});
})();
(function(){
  const mbar=document.getElementById('mobileBar');
  if(!mbar)return;
  if(!document.querySelector('.hero-ctas')){
    document.documentElement.classList.add('bar-always');
    mbar.classList.add('on');
    return;
  }
  const ctas=document.querySelector('.hero-ctas');
  if(!ctas)return;
  let shown=false;
  const on=()=>{
    const past=ctas.getBoundingClientRect().bottom < (document.querySelector('header.bar')?.offsetHeight||76);
    if(past!==shown){ shown=past; mbar.classList.toggle('on',past); }
  };
  on();
  window.addEventListener('scroll',on,{passive:true});
  window.addEventListener('resize',on);
})();
(function(){
  const root=document.documentElement;
  const cine=document.getElementById('cine');
  const vid=document.getElementById('heroVid');
  const hero=document.getElementById('hero');
  if(!cine||!vid||!hero)return;
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  if(reduce.matches||!vid.canPlayType('video/mp4')){ root.classList.remove('cine-on'); return; }
  window.__cineHold=true;
  const FPS=60, DUR=44.25;
  const SRCFPS=12;
  const EASE=0.15;
  const INK_AT=0.93;
  const frameE=()=>(1-hold)/(dur*FPS);
  const mPhone=matchMedia('(max-width:720px)');
  const mNarrow=matchMedia('(max-width:1120px)');
  const band=(d,k)=>(mPhone.matches&&d[k+'Phone'])||(mNarrow.matches&&d[k+'Narrow'])||d[k];
  const wantSrc=()=>band(vid.dataset,'src');
  const wantPoster=()=>band(vid.dataset,'poster');
  let hold=0.10, top=0, travel=1, dur=DUR, veilAt=38, veilMin=0.20;
  const GRADE_LO=30, GRADE_HI=185;
  const GRADE_MIN=0.20;
  const gcv=document.createElement('canvas'); gcv.width=48; gcv.height=8;
  const gctx=gcv.getContext('2d',{willReadFrequently:true});
  let graded=-1;
  // ---- FRAME-GRADE THROTTLE (D454) ----------------------------------------
  // grade() and bandGrade() sample the film by pulling the decoded video frame
  // back off the GPU -- drawImage(vid,...) then getImageData(). The readback is
  // the expensive half: measured at ~8.3ms PER CALL on a desktop against the
  // 1920 cut (the getImageData itself is 0.008ms), and far worse on a phone.
  // Both ran once per rAF tick -- grade() for the nav band, bandGrade() once for
  // EVERY lit line of copy -- so one 60fps frame spent 17-33ms in readbacks
  // alone against a 16.7ms budget. That is the choppy background and the choppy
  // text: they are dropped frames, not a slow network.
  //
  // Nothing is lost by sampling less often. The film is SCRUBBED, not played: a
  // new frame only reaches the screen when a seek completes, every ~100-150ms.
  // Sampling faster than the film changes just re-reads the same pixels. So we
  // stamp a token per presented frame and every sampler memoises against it --
  // one readback per film frame, not one per line per tick.
  let gTok=0, gradeTok=-1;
  const bandMemo=new WeakMap();
  function gTick(){
    const t=(vid.readyState>=2&&!isNaN(vid.currentTime))?vid.currentTime:0;
    gTok=Math.round(t*SRCFPS);
  }
  let target=0, eased=-1, want=0, pending=false, raf=null, live=true, inked=null, fetched=false,
      locked=false, settleT=null, seekFr=-1, lastT=0, vpW=0, vpH=0, seekAt=0, kicked=false;
  let veiled=-1;
  const clamp=v=>v<0?0:v>1?1:v;
  const heroBg=hero.querySelector('.hero-bg');
  const barEl=document.querySelector('header.bar');
  const barH=()=>barEl?barEl.getBoundingClientRect().height:78;
  const stage=()=>{ if(!hero.classList.contains('loaded'))
    requestAnimationFrame(()=>requestAnimationFrame(()=>hero.classList.add('loaded'))); };
  const plateEl=document.getElementById('cinePlate');
  const PLATE_CUT=0.5;
  let plateO=-1, plateUrl='';
  const plateSrc=()=>{const d=plateEl.dataset;
    return (mPhone.matches&&d.srcPhone)||(mNarrow.matches&&d.srcNarrow)||d.src||'';};
  function plate(t){
    if(!plateEl)return;
    const url=plateSrc();
    if(url&&url!==plateUrl){ plateUrl=url; plateEl.style.backgroundImage="url('"+url+"')"; }
    const shown=(vid.readyState>=2&&!isNaN(vid.currentTime))?vid.currentTime:t;
    const o=(shown*FPS<PLATE_CUT)?1:0;
    if(o!==plateO){ plateO=o; plateEl.style.opacity=o; }
  }
  function setFilmFrame(){
    const bg=heroBg&&heroBg.getBoundingClientRect(); if(!bg||!bg.width||!bg.height)return;
    const fw=vid.videoWidth||(mPhone.matches?608:(mNarrow.matches?864:1920)), fh=vid.videoHeight||1080;
    const sc=Math.max(bg.width/fw,bg.height/fh);
    root.style.setProperty('--filmU',(Math.round(sc*100000)/100000)+'px');
    root.style.setProperty('--filmX',(Math.round((bg.width-fw*sc)/2*100)/100)+'px');
    root.style.setProperty('--filmY',(Math.round((bg.height-fh*sc)/2*100)/100)+'px');
  }
  vid.addEventListener('loadedmetadata',setFilmFrame);
  function measure(){
    setFilmFrame();
    const cs=getComputedStyle(cine);
    const h=parseFloat(cs.getPropertyValue('--cineHold'));
    if(h>0&&h<0.9)hold=h;
    const va=parseFloat(cs.getPropertyValue('--cineVeilAt'));
    if(va>=0&&va<dur)veilAt=va;
    const vm=parseFloat(cs.getPropertyValue('--cineVeilMin'));
    if(vm>=0&&vm<=1)veilMin=vm;
    top=cine.getBoundingClientRect().top+window.scrollY;
    if(!vpH||innerWidth!==vpW||Math.abs(innerHeight-vpH)>140){ vpW=innerWidth; vpH=innerHeight; }
    travel=Math.max(1,cine.offsetHeight-vpH);
  }
  function fail(){
    root.classList.remove('cine-on');
    root.classList.remove('skip-live');
    window.__cineHold=false;
    document.documentElement.style.removeProperty('--cineVeil');
    root.style.removeProperty('--navGrade'); graded=-1;
    stage();
    dispatchEvent(new Event('scroll'));
    if(raf)cancelAnimationFrame(raf);
    raf=null;
    if(typeof filmWatch!=='undefined'&&filmWatch!==null){ clearTimeout(filmWatch); filmWatch=null; }
  }
  vid.addEventListener('error',fail);
  function filmDead(){ return !!vid.error || vid.networkState===3; }
  function checkFilmDead(){ if(filmDead()){ fail(); return true; } return false; }
  if(!checkFilmDead()){
    var deadTries=0;
    var deadPoll=setInterval(function(){
      if(checkFilmDead()||++deadTries>10||vid.readyState>=2)clearInterval(deadPoll);
    },400);
  }
  var SPAN_MIN=4, filmOK=false;
  function bufferedSpan(){
    try{ var b=vid.buffered,m=0;
         for(var i=0;i<b.length;i++)m=Math.max(m,b.end(i)-b.start(i));
         return m; }catch(e){ return 0; }
  }
  function filmReady(){
    if(filmOK)return true;
    if(vid.readyState>=3&&bufferedSpan()>=SPAN_MIN){ filmOK=true; }
    return filmOK;
  }
  function filmMaybeReady(){ if(!filmOK&&filmReady()){ onScroll(); dispatchEvent(new Event('scroll')); } }
  vid.addEventListener('progress',filmMaybeReady);
  vid.addEventListener('canplay',filmMaybeReady);
  vid.addEventListener('canplaythrough',filmMaybeReady);
  vid.addEventListener('loadeddata',filmMaybeReady);
  const SEEK_STALL=140;
  function decoderKick(){
    if(kicked)return; kicked=true;
    try{ const p=vid.play();
         const stop=()=>{ try{vid.pause();}catch(e){} seekFr=-1; seek(); };
         if(p&&p.then)p.then(stop,()=>{kicked=false;}); else stop();
    }catch(e){ kicked=false; }
  }
  vid.addEventListener('loadeddata',decoderKick);
  if(vid.readyState>=2)decoderKick();
  function seek(){
    const now=performance.now();
    if(vid.seeking){
      if(now-seekAt<SEEK_STALL){ pending=true; return; }
      decoderKick();
    }
    pending=false;
    const last=Math.max(0,Math.round(dur*FPS)-1);
    const f=Math.max(0,Math.min(last,Math.floor(want*FPS)));
    if(f===seekFr)return;
    seekFr=f; seekAt=now;
    try{vid.currentTime=(f+0.5)/FPS;}catch(e){}
  }
  vid.addEventListener('seeked',()=>{ if(pending)seek(); });
  setInterval(()=>{ if(!locked&&live&&(pending||vid.seeking)&&performance.now()-seekAt>SEEK_STALL)seek(); },200);
  function ink(film){
    const on=film>=INK_AT;
    if(on===inked)return;
    inked=on;
    hero.classList.toggle('loaded',on);
  }
  function veil(film){
    const t=film*dur;
    const k=clamp((t-veilAt)/Math.max(0.001,dur-veilAt));
    const v=+(veilMin+(1-veilMin)*(k*k*(3-2*k))).toFixed(2);
    if(v===veiled)return;
    veiled=v;
    document.documentElement.style.setProperty('--cineVeil',v);
  }
  let curved=-1;
  const CURVE_AT=0.90;
  function curve(film){
    const k=clamp((film-CURVE_AT)/(1-CURVE_AT));
    const v=+(k*k*(3-2*k)).toFixed(2);
    if(v===curved)return;
    curved=v;
    cine.style.setProperty('--cineCurve',v);
  }
  function grade(){
    if(!vid.videoWidth||vid.readyState<2)return;
    if(gTok===gradeTok)return;          // same film frame: --navGrade cannot have moved
    gradeTok=gTok;
    const bg=heroBg.getBoundingClientRect(); if(!bg.height)return;
    const bandH=barH();
    const vr=vid.videoWidth/vid.videoHeight, br=bg.width/bg.height;
    let dw,dh,dx,dy;
    if(vr>br){ dh=bg.height; dw=dh*vr; dx=(bg.width-dw)/2; dy=0; }
    else { dw=bg.width; dh=dw/vr; dx=0; dy=(bg.height-dh)/2; }
    const sc=vid.videoWidth/dw;
    const sx=(0-dx)*sc, sy=(0-dy)*sc, sw=bg.width*sc, sh=bandH*sc;
    try{ gctx.drawImage(vid,sx,sy,sw,sh,0,0,48,4); }catch(e){ return; }
    let d; try{ d=gctx.getImageData(0,0,48,4).data; }catch(e){ return; }
    const cell=[];
    for(let i=0;i<192;i++) cell.push(0.2126*d[i*4]+0.7152*d[i*4+1]+0.0722*d[i*4+2]);
    cell.sort((a,b)=>a-b);
    const hi=cell[187];
    const g=+Math.max(GRADE_MIN,clamp((hi-GRADE_LO)/(GRADE_HI-GRADE_LO))).toFixed(2);
    if(g===graded)return;
    graded=g;
    root.style.setProperty('--navGrade',g);
  }
  const WIPE_AT=0, WIPE_OUT=6.0;
  const HW={x0:0,x1:0}, HT={x0:0,x1:0};
  const boxOf=(el,o)=>{ o.x0=el.offsetLeft; o.x1=el.offsetLeft+el.offsetWidth; };
  const wipeEase=p=>0.4*p+0.6*p*p;
  function measurePin(){
    if(!heroOn)return;
    if(heroEl)boxOf(heroEl,HW);
    if(trustEl)boxOf(trustEl,HT);
  }
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>{ measurePin(); measureReveal(); });
  const REV_X=[
    2.0,8.9,26.9,46.1,66.2,86.3,106.8,127.9,149.8,171.2,193.2,215.9,238.8,261.5,
    283.5,306.1,328.6,350.8,373.1,395.0,416.9,438.2,459.5,480.7,501.7,521.9,541.8,561.5,
    581.2,600.1,618.6,637.4,655.8,673.4,690.2,707.4,724.3,740.6,756.0,771.7,787.6,802.4,
    816.6,831.1,845.5,859.2,872.3,885.6,898.9,911.7,923.7,936.0,948.2,959.9,971.4,982.6,
    993.7,1004.2,1014.6,1025.1,1035.6,1045.6,1055.1,1064.6,1074.2,1083.5,1092.3,1101.2,1110.2,1118.5,
    1126.4,1134.6,1142.6,1150.4,1158.1,1165.5,1172.9,1179.8,1186.3,1193.1,1199.7,1205.7];
  const REV_S=[
    0.0,-0.0294,-0.0334,-0.0351,-0.0378,-0.0408,-0.044,-0.0477,-0.0515,-0.0538,
    -0.0594,-0.0643,-0.0672,-0.0712,-0.075,-0.0796,-0.083,-0.0874,-0.0923,-0.0952,
    -0.1001,-0.1037,-0.1098,-0.1144,-0.1182,-0.1232,-0.1294,-0.1341,-0.1394,-0.1449,
    -0.1505,-0.1553,-0.1599,-0.1647,-0.1713,-0.1774,-0.1834,-0.1888,-0.1949,-0.2011,
    -0.2062,-0.2111,-0.2176,-0.2226,-0.228,-0.2341,-0.2383,-0.2434,-0.2487,-0.2527,
    -0.2576,-0.2621,-0.2678,-0.2737,-0.2785,-0.2832,-0.2891,-0.2936,-0.2982,-0.3027,
    -0.3074,-0.3116,-0.3169,-0.3216,-0.3257,-0.3296,-0.3335,-0.3377,-0.341,-0.3443,
    -0.3482,-0.3507,-0.3544,-0.3583,-0.3621,-0.3652,-0.3684,-0.372,-0.3746,-0.3774,
    -0.3803,-0.3845];
  const REV_F0=124, REV_PAD=3;
  const PREV_F0=170;
  const PREV_X=[
    25.2,31.6,38.3,44.3,50.2,54.8,60.1,64.0,67.5,69.8,72.9,74.3,75.6,78.8,85.1,92.0,
    99.5,109.0,119.7,130.8,143.2,156.4,169.5,182.8,194.8,207.9,221.0,232.1,241.7,255.0,264.0,273.0];
  const PREV_SX=[
    -0.2289,-0.2369,-0.2456,-0.2523,-0.2593,-0.2610,-0.2687,-0.2718,-0.2769,-0.2809,
    -0.2861,-0.2905,-0.2950,-0.2995,-0.3054,-0.3093,-0.3147,-0.3201,-0.3218,-0.3264,
    -0.3303,-0.3355,-0.3404,-0.3461,-0.3479,-0.3522,-0.3585,-0.3591,-0.3542,-0.3750,-0.3750,-0.3750];
  const PREV_Y=[
    -9999,-9999,-9999,-9999,-9999,-9999,-9999,-9999,-8.1,-4.1,-0.7,2.6,6.3,13.4,26.2,41.2,
    58.6,77.9,99.0,120.8,142.7,164.5,186.2,206.9,227.0,246.0,263.9,280.7,296.6,310.8,324.1,335.9];
  const PREV_SY=[
    0,0,0,0,0,0,0,0,0.0542,0.0525,0.0523,0.0518,0.0511,0.0511,0.0506,0.0502,
    0.0500,0.0499,0.0493,0.0487,0.0480,0.0473,0.0459,0.0464,0.0456,0.0459,0.0459,0.0454,
    0.0439,0.0440,0.0432,0.0423];
  const TREV_F0=157, TREV_YREF=360;
  const TREV_X=[
    15.0,32.6,50.4,68.2,85.1,101.3,117.9,134.4,149.9,164.9,180.1,195.3,209.8,223.3,237.4,251.3,
    264.5,277.1,290.1,303.0,315.3,327.5,339.4,351.3,362.5,373.5,384.6,395.5,406.1,416.3,426.5,
    436.6,446.3,455.7,465.1,474.4,483.2,491.5,500.1,508.6,516.8,524.9,533.0,540.5,547.9,554.8,
    561.7,569.0,575.7];
  const TREV_S=[
    -0.1582,-0.1672,-0.1730,-0.1799,-0.1858,-0.1912,-0.1976,-0.2044,-0.2094,-0.2151,-0.2210,
    -0.2238,-0.2296,-0.2324,-0.2362,-0.2428,-0.2434,-0.2525,-0.2527,-0.2609,-0.2687,-0.2751,
    -0.2785,-0.2817,-0.2853,-0.2930,-0.2950,-0.2991,-0.3045,-0.3121,-0.3131,-0.3201,-0.3243,
    -0.3307,-0.3331,-0.3369,-0.3400,-0.3456,-0.3517,-0.3553,-0.3571,-0.3591,-0.3618,-0.3652,
    -0.3683,-0.3694,-0.3742,-0.3806,-0.3812];
  const revEl=document.querySelector('.cine-line[data-vpos-wide="hero"]');
  let revOn=false, revClip=null, revSc=null, shownFr=-1;
  const RV={sc:0.8333,dx:-80,dy:0,left:0,top:0,w:0,h:0,ok:false};
  function measureReveal(){
    revOn=(heroOn||heroNr)&&!!revEl;
    RV.ph=heroPh&&!heroOn;
    RV.tb=heroTab;
    if(!revOn){ revealTick(); return; }
    RV.fw=RV.ph?608:(RV.tb?864:1920);
    RV.left=revEl.offsetLeft; RV.top=revEl.offsetTop; RV.w=revEl.offsetWidth; RV.h=revEl.offsetHeight;
    const bb=heroBg&&heroBg.getBoundingClientRect();
    if(bb&&bb.width&&bb.height){
      const vr=(vid.videoWidth&&vid.videoHeight)?vid.videoWidth/vid.videoHeight:(RV.fw/1080);
      let dw,dh,dx,dy;
      if(vr>bb.width/bb.height){ dh=bb.height; dw=dh*vr; dx=(bb.width-dw)/2; dy=0; }
      else { dw=bb.width; dh=dw/vr; dx=0; dy=(bb.height-dh)/2; }
      RV.sc=dw/RV.fw; RV.dx=bb.left+dx; RV.dy=bb.top+dy; RV.ok=true;
    }
    revealTick();
  }
  function revealTick(){
    if(!revEl)return;
    if(!revOn||!RV.ok){
      if(revClip!==null){ revClip=null; revEl.style.clipPath=''; }
      if(revSc!==null){ revSc=null; revEl.style.removeProperty('--lsc'); }
      return;
    }
    const fr=(shownFr>=0)?shownFr
      :((vid.readyState>=2&&!isNaN(vid.currentTime))?vid.currentTime:0)*SRCFPS;
    const at=(a,u)=>{ const n=a.length-1; if(u<=0)return a[0]; if(u>=n)return a[n];
      const i=Math.floor(u), t=u-i; return a[i]+(a[i+1]-a[i])*t; };
    let c;
    if(RV.ph){
      const i=fr-PREV_F0;
      const done=i>=PREV_X.length-1;
      if(done)c='';
      else{
        const x0=at(PREV_X,i)-REV_PAD, sx=at(PREV_SX,i);
        const fX=e=>(e+RV.left-RV.dx)/RV.sc, fY=e=>(e+RV.top-RV.dy)/RV.sc;
        const eX=f=>+(f*RV.sc+RV.dx-RV.left).toFixed(1), eY=f=>+(f*RV.sc+RV.dy-RV.top).toFixed(1);
        const XL=fX(-400), XR=fX(RV.w+400), YT=fY(-200), YB=fY(RV.h+200);
        const Xat=y=>x0+sx*(y-240);
        if(at(PREV_Y,i)<-5000){
          c='polygon('+eX(XL)+'px '+eY(YT)+'px,'+eX(Xat(YT))+'px '+eY(YT)+'px,'
           +eX(Xat(YB))+'px '+eY(YB)+'px,'+eX(XL)+'px '+eY(YB)+'px)';
        }else{
          const yp=at(PREV_Y,i)-REV_PAD, sy=at(PREV_SY,i);
          const Yat=x=>yp+sy*(x-304);
          const cx=(x0+sx*(yp-240-304*sy))/(1-sx*sy);
          const cy=yp+sy*(cx-304);
          c='polygon('+eX(XL)+'px '+eY(YT)+'px,'+eX(XR)+'px '+eY(YT)+'px,'
           +eX(XR)+'px '+eY(Yat(XR))+'px,'+eX(cx)+'px '+eY(cy)+'px,'
           +eX(Xat(YB))+'px '+eY(YB)+'px,'+eX(XL)+'px '+eY(YB)+'px)';
        }
      }
    }else{
    const GX=RV.tb?TREV_X:REV_X, GS=RV.tb?TREV_S:REV_S,
          GF0=RV.tb?TREV_F0:REV_F0, GYR=RV.tb?TREV_YREF:490;
    const i=fr-GF0;
    const x0=at(GX,i)-REV_PAD, s=at(GS,i);
    const yT=RV.top-60, yB=RV.top+RV.h+60;
    const xT=+((RV.dx+(x0+s*((yT-RV.dy)/RV.sc-GYR))*RV.sc)-RV.left).toFixed(1);
    const xB=+((RV.dx+(x0+s*((yB-RV.dy)/RV.sc-GYR))*RV.sc)-RV.left).toFixed(1);
    const done=(i>=GX.length-1)||Math.min(xT,xB)>RV.w+30;
    c=done?'':'polygon(-2000px -60px,'+xT+'px -60px,'+xB+'px '+(RV.h+60)+'px,-2000px '+(RV.h+60)+'px)';
    }
    if(c!==revClip){ revClip=c; revEl.style.clipPath=c; }
  }
  const HAS_RVFC=!!(vid&&typeof vid.requestVideoFrameCallback==='function');
  if(HAS_RVFC){
    const onFrame=(now,meta)=>{
      const f=meta.mediaTime*SRCFPS;
      if(f!==shownFr){ shownFr=f; revealTick(); }
      try{ vid.requestVideoFrameCallback(onFrame); }catch(e){}
    };
    try{ vid.requestVideoFrameCallback(onFrame); }catch(e){}
  }
  const KIT_SET=30.2, KIT_OUT=35.3;
  const kitEl=document.querySelector('.cine-line[data-vpos-wide="high"]');
  const KW={x1:0};
  const KB={ox:0,oy:0,ow:0,oh:0};
  let kitTx=null;
  function measureKit(){
    if(!kitEl)return;
    if(!heroNr){ cine.style.removeProperty('--kitG'); }
    if(!heroOn&&!heroNr){
      kitEl.style.removeProperty('--lx'); kitTx=null;
      kitEl.style.removeProperty('--lyp');
      kitEl.style.removeProperty('--lg');
    }
    if(heroOn||heroNr) KW.x1=kitEl.offsetLeft+kitEl.offsetWidth;
    KB.ox=kitEl.offsetLeft; KB.oy=kitEl.offsetTop; KB.ow=kitEl.offsetWidth; KB.oh=kitEl.offsetHeight;
  }
  const STORY=[...document.querySelectorAll('.cine-line')].map(el=>({
    el, at:0, out:0, o:-1, z:-1, b:-1, g:-1,
    zNear: 560
  }));
  function retimeStory(){
    for(const L of STORY){
      const d=L.el.dataset;
      L.at =+band(d,'at' )||0;
      L.out=+band(d,'out')||0;
      L.zNear=(!mNarrow.matches && L.el.dataset.vposWide)
        ? (L.el.dataset.vposWide==='high' ? 150 : 300) : Z_NEAR;
      L.o=L.z=L.b=L.g=-1;
    }
  }
  const Z_FAR=-150, Z_NEAR=560;
  retimeStory();
  function bandGrade(el,box){
    if(!vid.videoWidth||vid.readyState<2)return -1;
    const bg=heroBg.getBoundingClientRect(); if(!bg.height)return -1;
    const r=box?{left:bg.left+box.ox,top:bg.top+box.oy,width:box.ow,height:box.oh}
               :el.getBoundingClientRect();
    if(!r.height)return -1;
    // Key is the film frame PLUS the box, rounded to 8px. A line travels across
    // the frame while it is lit, so a moved line must resample even on a held
    // frame -- but a line sitting still on a held frame must not.
    const key=gTok+'|'+Math.round(r.left/8)+','+Math.round(r.top/8)
                    +','+Math.round(r.width/8)+','+Math.round(r.height/8);
    const memo=bandMemo.get(el);
    if(memo&&memo.key===key)return memo.v;
    const vr=vid.videoWidth/vid.videoHeight, br=bg.width/bg.height;
    let dw,dh,dx,dy;
    if(vr>br){ dh=bg.height; dw=dh*vr; dx=(bg.width-dw)/2; dy=0; }
    else { dw=bg.width; dh=dw/vr; dx=0; dy=(bg.height-dh)/2; }
    const sc=vid.videoWidth/dw;
    const sx=(r.left-bg.left-dx)*sc, sy=(r.top-bg.top-dy)*sc;
    const sw=Math.max(1,r.width*sc), sh=Math.max(1,r.height*sc);
    try{ gctx.clearRect(0,0,48,8); gctx.drawImage(vid,sx,sy,sw,sh,0,0,48,8); }catch(e){ return -1; }
    let d; try{ d=gctx.getImageData(0,0,48,8).data; }catch(e){ return -1; }
    const cell=[];
    for(let i=0;i<384;i++) cell.push(0.2126*d[i*4]+0.7152*d[i*4+1]+0.0722*d[i*4+2]);
    cell.sort((a,b)=>a-b);
    const v=clamp((cell[383]-GRADE_LO)/(GRADE_HI-GRADE_LO));
    bandMemo.set(el,{key,v});
    return v;
  }
  let firstAlpha=0;
  function story(t){
    for(const L of STORY){
      if(L.out<=L.at)continue;
      const p=clamp((t-L.at)/(L.out-L.at));
      if(L.el===revEl&&(heroOn||heroNr)){
        const FAD=heroPh?2.03:2.47;
        const a=(p<=0||p>=1)?0:Math.min(1,(L.out-t)/FAD);
        const o=+(a*a*(3-2*a)).toFixed(2);
        if(o!==L.o){ L.o=o; L.el.style.opacity=o; }
        if(heroNr){
          const q=clamp((t-(L.out-FAD))/FAD);
          const sc=+(1-0.16*q*q).toFixed(3);
          if(sc!==revSc){ revSc=sc;
            if(sc===1)L.el.style.removeProperty('--lsc');
            else L.el.style.setProperty('--lsc',sc);
          }
        }
        if(heroNr&&revClip===''&&o>0.02){
          const g=bandGrade(L.el);
          if(g>=0){ const w=+(g*o).toFixed(2); if(w!==L.g){ L.g=w; L.el.style.setProperty('--lg',w); } }
        }
        else if(L.g!==0){ L.g=0; L.el.style.setProperty('--lg',0); }
        if(L.z!==0){ L.z=0; L.el.style.setProperty('--lz',0); }
        if(L.b!==0){ L.b=0; L.el.style.filter='none'; }
        if(!HAS_RVFC)revealTick();
        continue;
      }
      if(L.el===kitEl&&heroNr){
        const o=(p<=0||p>=1)?0:1;
        const RMP=heroPh?1.8:2.2;
        const ps=L.at+RMP, po=L.out-RMP;
        let tx=0;
        if(t<ps){ const q=clamp((t-L.at)/(ps-L.at)); tx=+(-KW.x1*(1-q)*(1-q)).toFixed(2); }
        else if(t>po){ const q=clamp((t-po)/(L.out-po)); tx=+(-KW.x1*q*q).toFixed(2); }
        if(tx!==kitTx){ kitTx=tx; L.el.style.setProperty('--lx',tx); }
        if(o!==L.o){ L.o=o; L.el.style.opacity=o; }
        if(o>0.02){
          const g=bandGrade(L.el);
          if(g>=0){ const w=+(g*o).toFixed(2); if(w!==L.g){ L.g=w; L.el.style.setProperty('--lg',w); } }
        } else if(L.g!==0){ L.g=0; L.el.style.setProperty('--lg',0); }
        if(L.z!==0){ L.z=0; L.el.style.setProperty('--lz',0); }
        if(L.b!==0){ L.b=0; L.el.style.filter='none'; }
        continue;
      }
      if(L.el===kitEl&&heroOn){
        const o=(p<=0||p>=1)?0:1;
        let tx=0;
        if(t<KIT_SET){ const q=clamp((t-L.at)/(KIT_SET-L.at)); tx=+(-KW.x1*(1-q)*(1-q)).toFixed(2); }
        else if(t>KIT_OUT){ const q=clamp((t-KIT_OUT)/(L.out-KIT_OUT)); tx=+(-KW.x1*q*q).toFixed(2); }
        if(tx!==kitTx){ kitTx=tx; L.el.style.setProperty('--lx',tx); }
        if(o!==L.o){ L.o=o; L.el.style.opacity=o; }
        if(o>0.02){
          const g=bandGrade(L.el);
          if(g>=0){ const w=+(g*o).toFixed(2); if(w!==L.g){ L.g=w; L.el.style.setProperty('--lg',w); } }
        } else if(L.g!==0){ L.g=0; L.el.style.setProperty('--lg',0); }
        if(L.z!==0){ L.z=0; L.el.style.setProperty('--lz',0); }
        if(L.b!==0){ L.b=0; L.el.style.filter='none'; }
        continue;
      }
      const a=(p<=0||p>=1)?0:Math.min(1,p/0.16,(1-p)/0.26);
      const o=+(a*a*(3-2*a)).toFixed(2);
      if(L===STORY[0])firstAlpha=o;
      const z=Math.round(Z_FAR+((L.zNear||Z_NEAR)-Z_FAR)*p*p);
      const b=p>0.72?Math.round(((p-0.72)/0.28)*9)/2:0;
      if(o!==L.o){ L.o=o; L.el.style.opacity=o; }
      if(o>0.02){
        const g=bandGrade(L.el);
        if(g>=0){ const w=+(g*o).toFixed(2); if(w!==L.g){ L.g=w; L.el.style.setProperty('--lg',w); } }
      } else if(L.g!==0){ L.g=0; L.el.style.setProperty('--lg',0); }
      if(z!==L.z){ L.z=z; L.el.style.setProperty('--lz',z); }
      if(b!==L.b){ L.b=b; L.el.style.filter=b?'blur('+b+'px)':'none'; }
    }
  }
  const heroEl=document.getElementById('cineHero');
  const HERO_OUT=6.0, HERO_EDGE=1, HERO_Z=300;
  let heroOn=false, heroPh=false, heroTab=false, heroNr=false, heroMode='off', heroLast='', heroO=-1, heroZ=-1, heroE=-1, heroTx=null, trustGone=null;
  const readHeroBand=()=>{ heroOn=matchMedia('(min-width:1121px)').matches; heroPh=mPhone.matches;
    heroNr=!heroOn&&mNarrow.matches; heroTab=heroNr&&!heroPh;
    heroMode=heroOn?'wide':(heroNr?'nr':'off'); };
  readHeroBand();
  const trustEl=document.getElementById('cineTrust');
  function heroCopy(t){
    if(!heroEl)return;
    if(heroMode!==heroLast){
      heroLast=heroMode;
      heroO=-1; heroZ=-1; heroE=-1; heroTx=null; trustGone=null;
      heroEl.style.opacity=''; heroEl.style.visibility='';
      heroEl.style.removeProperty('--hz'); heroEl.style.removeProperty('--tx');
      if(trustEl){
        trustEl.style.opacity=''; trustEl.style.visibility='';
        trustEl.style.removeProperty('--tx');
      }
      cine.style.removeProperty('--cineEdge');
    }
    if(heroMode==='off')return;
    if(heroMode==='nr'){
      const p=clamp(t/4.8);
      const a=p>=1?0:Math.min(1,(1-p)/0.26);
      const o=+(a*a*(3-2*a)).toFixed(2);
      const z=Math.round(380*p*p);
      if(z!==heroZ){ heroZ=z; heroEl.style.setProperty('--hz',z); }
      if(o!==heroO){
        heroO=o; heroEl.style.opacity=o; heroEl.style.visibility=o?'visible':'hidden';
        cine.style.setProperty('--cineEdge',o);
      }
      return;
    }
    const p=clamp((t-WIPE_AT)/(WIPE_OUT-WIPE_AT));
    const tx=+(-HW.x1*wipeEase(p)).toFixed(2);
    const o=p>=1?0:1;
    if(tx!==heroTx){
      heroTx=tx;
      heroEl.style.setProperty('--tx',tx);
      if(trustEl)trustEl.style.setProperty('--tx',tx);
    }
    if(o!==heroO){
      heroO=o; heroEl.style.opacity=o; heroEl.style.visibility=o?'visible':'hidden';
      if(trustEl){ trustEl.style.opacity=o; trustEl.style.visibility=o?'visible':'hidden'; }
    }
    if(o&&trustEl&&HT.x1>HT.x0){
      const gone=(HT.x1+tx)<=0;
      if(gone!==trustGone){ trustGone=gone; trustEl.style.visibility=gone?'hidden':'visible'; }
    }
    if(heroZ!==0){ heroZ=0; heroEl.style.setProperty('--hz',0); }
    const vis=HW.x1>0?clamp((HW.x1+tx)/HW.x1):0;
    const e=+(HERO_EDGE*vis).toFixed(2);
    if(e!==heroE){ heroE=e; cine.style.setProperty('--cineEdge',e); }
  }
  const cueEl=document.getElementById('cineCue');
  const skipEl=document.getElementById('cineSkip');
  let cued=null, skipped=null;
  function chrome(film){
    const g=firstAlpha<=0.02;
    if(g!==cued){
      cued=g;
      if(cueEl){ cueEl.classList.toggle('gone',g); if(g)cueEl.style.opacity=''; }
    }
    if(cueEl&&!g)cueEl.style.opacity=firstAlpha;
    const d=film>0.985;
    if(d!==skipped){ skipped=d; if(skipEl)skipEl.hidden=d;
      root.classList.toggle('skip-live',!d);
    }
  }
  function skipToEnd(){
    measure();
    window.scrollTo({top:Math.round(top+travel),behavior:'instant'});
    target=1; eased=1; want=dur;
    seek(); gTick(); ink(1); veil(1); curve(1); story(dur); heroCopy(dur); plate(dur); chrome(1); grade();
    armSettle();
    if(locked)dropHeroHash();
  }
  if(skipEl)skipEl.addEventListener('click',skipToEnd);
  function heroHash(){ return (location.hash||'').toLowerCase()==='#hero'; }
  function unveil(){ root.classList.remove('to-hero'); }
  if(heroHash()){
    skipToEnd();
    vid.addEventListener('seeked',()=>{ requestAnimationFrame(()=>requestAnimationFrame(unveil)); },{once:true});
    vid.addEventListener('error',unveil,{once:true});
    addEventListener('load',()=>{ skipToEnd(); setTimeout(()=>{ skipToEnd(); unveil(); },160); });
  }
  document.addEventListener('click',e=>{
    const a=e.target.closest&&e.target.closest('a.brand'); if(!a)return;
    const u=new URL(a.getAttribute('href'),location.href);
    if(u.hash.toLowerCase()!=='#hero'||u.pathname.replace(/index\.html$/,'/')!==location.pathname.replace(/index\.html$/,'/'))return;
    e.preventDefault();
    if(location.hash.toLowerCase()!=='#hero')history.replaceState(null,'','#hero');
    skipToEnd();
  });
  function tick(now){
    raf=null;
    const t=now||performance.now();
    if(!lastT)lastT=t-1000/60;
    let dt=t-lastT; lastT=t;
    if(dt>100)dt=100;
    if(dt<1)dt=1;
    if(eased<0)eased=target;
    const d=target-eased, ad=Math.abs(d), FE=frameE();
    if(ad<=FE*0.02){ eased=target; }
    else{
      let step=ad*(1-Math.pow(1-EASE,dt/(1000/60)));
      const floor=FE*(dt/(1000/FPS));
      if(step<floor)step=floor;
      if(step>ad)step=ad;
      eased+=(d<0?-1:1)*step;
    }
    const film=clamp(eased/(1-hold));
    want=film*dur;
    seek();
    gTick();
    ink(film);
    veil(film);
    curve(film);
    story(want);
    heroCopy(want);
    plate(want);
    chrome(film);
    grade();
    if(eased!==target)raf=requestAnimationFrame(tick);
    else armSettle();
  }
  const kick=()=>{ if(raf===null){ lastT=0; raf=requestAnimationFrame(tick); } };
  function lockFilm(){
    if(locked)return;
    locked=true;
    measure();
    const drop=travel;
    root.classList.add('cine-done');
    window.scrollTo({top:Math.max(0,Math.round(window.scrollY-drop)),behavior:'instant'});
    dropHeroHash();
    dispatchEvent(new Event('resize'));
  }
  function dropHeroHash(){
    if((location.hash||'').toLowerCase()!=='#hero')return;
    try{history.replaceState(null,'',location.pathname+location.search);}catch(e){}
  }
  function armSettle(){
    if(locked)return;
    if(clamp(eased/(1-hold))<1)return;
    if(settleT)clearTimeout(settleT);
    settleT=setTimeout(()=>{ if(!locked&&clamp(eased/(1-hold))>=1)lockFilm(); },220);
  }
  function onScroll(){
    if(locked)return;
    if(!live)return;
    target=clamp((window.scrollY-top)/travel);
    if(!filmReady())target=0;
    kick();
    armSettle();
  }
  function fetchFilm(){
    const src=wantSrc();
    const post=wantPoster();
    const have=vid.getAttribute('src');
    if(fetched&&have===src){ if(vid.preload!=='auto')vid.preload='auto'; return; }
    fetched=true;
    if(post)vid.poster=post;
    vid.preload='auto';
    if(have!==src){ vid.src=src; want=-1; seekFr=-1; try{ vid.load(); }catch(e){} }
  }
  function sync(){
    root.classList.add('cine-on');
    window.__cineHold=true;
    cine.style.removeProperty('height');
    retimeStory();
    readHeroBand();
    measurePin();
    measureReveal();
    measureKit();
    plate(want);
    fetchFilm();
    measure(); eased=-1; inked=null; veiled=-1; curved=-1;
    onScroll();
    dispatchEvent(new Event('scroll'));
  }
  if(window.IntersectionObserver){
    new IntersectionObserver(es=>{ live=es[0].isIntersecting; if(live)onScroll(); }).observe(cine);
  }
  vid.addEventListener('loadedmetadata',()=>{
    if(isFinite(vid.duration)&&vid.duration>1)dur=vid.duration;
    if(window.scrollY<4){ const p=vid.play(); if(p&&p.then)p.then(()=>vid.pause()).catch(()=>{}); }
    measure(); onScroll();
  });
  addEventListener('scroll',onScroll,{passive:true});
  addEventListener('resize',sync);
  addEventListener('load',sync);
  if(mNarrow.addEventListener)mNarrow.addEventListener('change',sync);
  if(mPhone.addEventListener)mPhone.addEventListener('change',sync);
  addEventListener('load',()=>{
    const w=()=>plate(want);
    if(window.requestIdleCallback)requestIdleCallback(w,{timeout:1500}); else setTimeout(w,300);
  });
  if(reduce.addEventListener)reduce.addEventListener('change',e=>{ if(e.matches)fail(); });
  sync();
})();
(function(){
  const hero=document.getElementById('hero'); if(!hero)return;
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(!window.__cineHold)requestAnimationFrame(()=>requestAnimationFrame(()=>hero.classList.add('loaded')));
  if(reduce)return;
  const img=document.getElementById('heroImg');
  let ready=false, tx=0,ty=0,x=0,y=0,raf=null;
  setTimeout(()=>{ready=true;},3100);
  function frame(){
    raf=null;
    x+=(tx-x)*0.055; y+=(ty-y)*0.055;
    img.style.transform=`scale(1.08) translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0)`;
    if(Math.abs(tx-x)>0.05||Math.abs(ty-y)>0.05)raf=requestAnimationFrame(frame);
  }
  const kick=()=>{ if(ready&&raf===null)raf=requestAnimationFrame(frame); };
  hero.addEventListener('pointermove',e=>{
    const r=hero.getBoundingClientRect();
    tx=((e.clientX-r.left)/r.width-0.5)*-16;
    ty=((e.clientY-r.top)/r.height-0.5)*-9;
    kick();
  });
  hero.addEventListener('pointerleave',()=>{tx=0;ty=0;kick();});
})();
const TC_UP={
  MAX:8, MAXB:50*1024*1024,
  EXT:['pdf','jpg','jpeg','png','heic','heif','webp','gif','doc','docx','dwg','dxf'],
  files:[], link:'',
  fmt(b){ return b<1048576 ? Math.max(1,Math.round(b/1024))+' KB' : (b/1048576).toFixed(1)+' MB'; },
  add(incoming){
    const bad=[];
    for(const f of incoming){
      if(this.files.length>=this.MAX){ bad.push('You can attach up to '+this.MAX+' files. The rest were not added.'); break; }
      const ext=(f.name.split('.').pop()||'').toLowerCase();
      if(this.EXT.indexOf(ext)<0){ bad.push('“'+f.name+'” is not a file we can open.'); continue; }
      if(f.size>this.MAXB){ bad.push('“'+f.name+'” is over '+Math.round(this.MAXB/1048576)+' MB, please send a smaller copy.'); continue; }
      if(this.files.some(x=>x.file.name===f.name&&x.file.size===f.size))continue;
      this.files.push({file:f,url:/^image\//.test(f.type)?URL.createObjectURL(f):''});
    }
    this.emit(); return bad;
  },
  remove(i){
    const it=this.files[i]; if(!it)return;
    if(it.url)URL.revokeObjectURL(it.url);
    this.files.splice(i,1); this.emit();
  },
  setLink(v){ this.link=String(v||'').trim().slice(0,300); this.emit(); },
  emit(){ document.dispatchEvent(new CustomEvent('topcat:files')); }
};
function mountUpload(root){
  const compact=root.classList.contains('compact');
  root.innerHTML=
    '<div class="tc-up-drop" tabindex="0" role="button" aria-label="Add plans, measurements or photos">'+
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 16V4"/><path d="m7.5 8.5 4.5-4.5 4.5 4.5"/>'+
      '<path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/></svg>'+
      '<span class="tc-up-txt"><b>'+(compact?'Rather send your plans? <u>Attach them</u>':'Add your plans, measurements or photos')+'</b>'+
      '<small>'+(compact?'A drawing, a sketch or a photo of the room. We will price it exactly.'
                       :'Drag them in or browse. PDF, photos, sketches or a designer’s drawing, up to 8 files.')+'</small></span>'+
      '<input type="file" multiple accept="'+TC_UP.EXT.map(e=>'.'+e).join(',')+'">'+
    '</div>'+
    '<p class="tc-up-err" role="alert" hidden></p>'+
    '<ul class="tc-up-list"></ul>'+
    '<label class="tc-up-link"><span>Seen the stone you want somewhere? Paste the link and we will source it</span>'+
    '<input type="url" inputmode="url" placeholder="https://" aria-label="Link to the stone you have seen"></label>';
  const drop=root.querySelector('.tc-up-drop'), input=root.querySelector('input[type=file]');
  const err=root.querySelector('.tc-up-err'), link=root.querySelector('.tc-up-link input');
  const showErr=msgs=>{ err.hidden=!msgs.length; err.textContent=msgs.join(' '); };
  drop.addEventListener('click',()=>input.click());
  drop.addEventListener('keydown',e=>{
    if(e.key==='Enter'||e.key===' '){ e.preventDefault(); input.click(); }
  });
  input.addEventListener('change',()=>{ showErr(TC_UP.add(input.files)); input.value=''; });
  ['dragenter','dragover'].forEach(t=>drop.addEventListener(t,e=>{ e.preventDefault(); drop.classList.add('over'); }));
  ['dragleave','dragend'].forEach(t=>drop.addEventListener(t,()=>drop.classList.remove('over')));
  drop.addEventListener('drop',e=>{
    e.preventDefault(); drop.classList.remove('over');
    if(e.dataTransfer&&e.dataTransfer.files.length)showErr(TC_UP.add(e.dataTransfer.files));
  });
  link.addEventListener('input',()=>TC_UP.setLink(link.value));
  root.querySelector('.tc-up-list').addEventListener('click',e=>{
    const add=e.target.closest('.tc-up-add');
    if(add){ input.click(); return; }
    const x=e.target.closest('.tc-up-x'); if(!x)return;
    const i=+x.dataset.i;
    TC_UP.remove(i);
    const xs=root.querySelectorAll('.tc-up-x');
    (xs[Math.min(i,xs.length-1)]||drop).focus();
  });
}
function renderUploads(){
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const rows=TC_UP.files.map((it,i)=>{
    const ext=(it.file.name.split('.').pop()||'file').toUpperCase().slice(0,4);
    const thumb=it.url?' style="background-image:url('+JSON.stringify(it.url)+')"':'';
    return '<li class="tc-up-item"><span class="tc-up-thumb"'+thumb+' aria-hidden="true">'+
      (it.url?'':esc(ext))+'</span><span class="tc-up-name">'+esc(it.file.name)+
      '<span>'+TC_UP.fmt(it.file.size)+'</span></span>'+
      '<button type="button" class="tc-up-x" data-i="'+i+'" aria-label="Remove '+esc(it.file.name)+'">&times;</button></li>';
  }).join('');
  const more=TC_UP.files.length
    ? '<li class="tc-up-morerow">'+(TC_UP.files.length>=TC_UP.MAX
        ? '<span class="tc-up-cap">'+TC_UP.MAX+' of '+TC_UP.MAX+' files attached</span>'
        : '<button type="button" class="tc-up-add"><span aria-hidden="true">+</span> Add another file</button>'
          +'<span class="tc-up-cap">'+TC_UP.files.length+' of '+TC_UP.MAX+'</span>')+'</li>'
    : '';
  document.querySelectorAll('.tc-up').forEach(root=>{
    const ul=root.querySelector('.tc-up-list'); if(ul)ul.innerHTML=rows+more;
    const li=root.querySelector('.tc-up-link');
    if(li&&root.classList.contains('compact'))li.classList.toggle('show',!!(TC_UP.files.length||TC_UP.link));
    const inp=root.querySelector('.tc-up-link input');
    if(inp&&inp.value!==TC_UP.link&&document.activeElement!==inp)inp.value=TC_UP.link;
  });
}
document.addEventListener('topcat:files',renderUploads);
(function(){
  const root=document.getElementById('estimator'); if(!root)return;
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const MATS={
    Quartz   :{dims:{L:3200,W:1600},rotate:true, poa:false},
    Marble   :{dims:{L:2800,W:1600},rotate:false,poa:true },
    Granite  :{dims:{L:3000,W:1700},rotate:true, poa:true },
    Porcelain:{dims:{L:3200,W:1600},rotate:false,poa:true, noCat:true}
  };
  const NO_CAT={
    Porcelain:{name:'Porcelain and sintered stone',mat:'Porcelain',sup:'',slug:'',finish:'',
               stone:'mist',seed:41}
  };
  const KERF=5, TRIM=20;
  const BRACKETS={
    1:{solo:[2000,2500],island:[2300,2800]},
    2:{solo:[3000,3600],island:[3850,4300]},
    3:{solo:[3850,4300],island:[4350,5000]},
    4:{solo:[4350,5000],island:[5100,5550]}
  };
  const MAX_BRACKET=4;
  const REMOVAL=200;
  const EDGE_RATE=[150,300];
  const EXTRAS=['exWaterfall','exSplash','exSill','exRemoval','exEdge'];
  const LIM={len:[300,6000],wid:[100,1500],lm:[0.5,40],rows:10};
  const UPSTAND=[100,150];
  const THICK=[20,30];
  const USES=[
    {id:'run',    label:'Worktop run'},
    {id:'sink',   label:'Sink run'},
    {id:'hob',    label:'Hob run'},
    {id:'sinkhob',label:'Sink and hob run'},
    {id:'splash', label:'Splashback'},
    {id:'upstand',label:'Upstands'},
    {id:'island', label:'Island'}
  ];
  const SHAPES={
    straight:[[3000,620,'sinkhob']],
    lshape  :[[3000,620,'sink'],[2200,620,'hob']],
    ushape  :[[3000,620,'sink'],[2600,620,'hob'],[2200,620,'run']],
    galley  :[[3000,620,'sink'],[3000,620,'hob']]
  };
  const ISLAND={len:2000,wid:1000,th:20,use:'island'};
  const DARKSTONES={nerogold:1,emperador:1,goldveil:1,fumo:1};
  const BEST={};
  Object.keys(MATERIALS).forEach(m=>{
    const list=MATERIALS[m];
    if(list&&list.length) BEST[m]=list[landingIndex(list,m)].slug;
  });
  const EDGES=[
    ['Eased',              'M4 10H104a6 6 0 0 1 6 6v32a6 6 0 0 1-6 6H4Z'],
    ['Rounded top & bottom','M4 10H94a16 16 0 0 1 16 16v12a16 16 0 0 1-16 16H4Z'],
    ['1/4" Round',         'M4 10H96a14 14 0 0 1 14 14v30H4Z'],
    ['Matched Bevel',      'M4 10H90l20 16v12l-20 16H4Z'],
    ['1/4" Bevel',         'M4 10H96l14 14v30H4Z'],
    ['1/2" Bevel',         'M4 10H82l28 28v16H4Z'],
    ['Flat Ogee',          'M4 10H48c30 0 24 22 38 30c14 8 12 14-2 14H4Z'],
    ['Ogee',               'M4 10H84v8c14 0 26 7 26 16c0 10-18 11-18 20H4Z'],
    ['Bullnose Ogee',      'M4 10H80v6a16 16 0 1 1 0 32v6H4Z'],
    ['Cove Ogee',          'M4 10H78v8c0 10 12 8 12 18s10 8 14 12c2 2 4 4 6 6H4Z'],
    ['Cove',               'M4 10H88v8c0 22 8 36 22 36H4Z'],
    ['Cove Dupont',        'M4 10H86v8c0 10 12 8 12 18v6c0 8 6 12 12 12H4Z'],
    ['Half Bullnose',      'M4 10H84c14 0 26 12 26 26v18H4Z'],
    ['Demi Bullnose',      'M4 10H76c18 0 34 16 34 34v10H4Z'],
    ['Full Bullnose',      'M4 10H88a22 22 0 1 1 0 44H4Z'],
    ['Hollywood Bevel',    'M4 10H56l54 38v6H4Z'],
    ['Waterfall',          'M4 10H80c0 9 9 7 9 16s9 7 9 16 5 7 8 12H4Z'],
    ['Dupont',             'M4 10H84v12c14 0 26 12 26 32H4Z']
  ];
  const tabs=[...root.querySelectorAll('#estTabs .mat-tab')];
  const rowsEl=document.getElementById('estRows');
  const addBtn=document.getElementById('estAdd');
  const quickEl=document.getElementById('estQuick');
  const islandBtn=document.getElementById('estIsland');
  const shapeChips=[...quickEl.querySelectorAll('.est-chip[data-shape]')];
  const board=document.getElementById('estBoard');
  const stSlabs=document.getElementById('stSlabs'), stSlabsL=document.getElementById('stSlabsL');
  const stArea=document.getElementById('stArea'), stJoints=document.getElementById('stJoins');
  const stJointsL=document.getElementById('stJoinsL');
  const statsEl=document.getElementById('estStats');
  const jnote=document.getElementById('estJnote');
  const priceEl=document.getElementById('estPrice');
  const priceSR=document.getElementById('estPriceSR');
  const metaEl=document.getElementById('estMeta');
  const outK=document.getElementById('estOutK'), ctaBtn=document.getElementById('estCta');
  const stampEl=document.getElementById('estStamp'), addsEl=document.getElementById('estAdds');
  const calcWrap=document.getElementById('estCalc'), poaWrap=document.getElementById('estPoa');
  const poaTitle=document.getElementById('estPoaTitle');
  const poaLead=document.getElementById('estPoaLead');
  const POA_LEAD={
    Marble:'The price of the stone itself swings enormously here, from one block to the next and from one supplier to the next, so a calculator could only ever give you a number we could not stand behind. Send us what you already have and we will go and source it.',
    Granite:'The price of the stone itself swings enormously here, from one block to the next and from one supplier to the next, so a calculator could only ever give you a number we could not stand behind. Send us what you already have and we will go and source it.',
    Porcelain:'Porcelain is cut on a waterjet rather than a saw, the slabs come from a much shorter list of suppliers, and the thin edges are mitred by hand to read as solid stone. That is real work and it varies job to job, so we price it properly rather than guess. Send us your plans and we will come back with a figure.',
  };
  POA_LEAD._default=POA_LEAD.Marble;
  const POA_HEAD={
    Marble:'Marble and quartzite are priced',
    Granite:'Granite is priced',
    Porcelain:'Porcelain is priced',
  };
  const stoneBtn=document.getElementById('estStoneBtn'), swatchEl=document.getElementById('estSwatch');
  const stoneNameEl=document.getElementById('estStoneName'), stoneSupEl=document.getElementById('estStoneSup');
  const edgeChk=document.getElementById('exEdge'), edgePanel=document.getElementById('estEdgePanel');
  const edgeBtn=document.getElementById('estEdgeBtn'), edgeGlyph=document.getElementById('estEdgeGlyph');
  const edgeTxt=document.getElementById('estEdgeTxt'), lmWrap=document.getElementById('estLmWrap');
  const lmInput=document.getElementById('estLm'), lmOut=document.getElementById('estLmOut');
  const modal=document.getElementById('estModal'), mTitle=document.getElementById('estModalTitle');
  const mSub=document.getElementById('estModalSub'), mBody=document.getElementById('estModalBody');
  const mX=document.getElementById('estModalX');
  let mat='Quartz';
  let stone=null;
  const jot=o=>{try{(window.__tcq=window.__tcq||[]).push(o)}catch(e){}};
  let pieces=[{len:3000,wid:620,th:20,use:'run'}];
  let edgeIdx=null;
  let animateNext=true;
  let selfEvent=false;
  const clamp=(v,r)=>{v=Math.round(+v); return isFinite(v)?Math.min(r[1],Math.max(r[0],v)):r[0];};
  const LAB=i=>String.fromCharCode(65+i%26);
  const useLabel=id=>(USES.find(u=>u.id===id)||USES[0]).label;
  const widRange=p=>p.use==='upstand'?UPSTAND:LIM.wid;
  const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const edgeSVG=d=>'<svg viewBox="0 0 116 64" aria-hidden="true"><path class="epf" d="'+d+'"/></svg>';
  const faceCache={};
  function face(preset,seed,slug){
    const photo=typeof tileURL==='function'?tileURL(slug):null;
    if(photo)return "url('"+photo+"')";
    const k=preset+'·'+seed;
    if(!faceCache[k]){
      const svg=marble(preset,seed).replace('preserveAspectRatio="xMidYMid slice"','preserveAspectRatio="none"');
      faceCache[k]="url('data:image/svg+xml;charset=utf-8,"+encodeURIComponent(svg)+"')";
    }
    return faceCache[k];
  }
  function pack(list){
    const {L,W}=MATS[mat].dims, uL=L-TRIM*2, uW=W-TRIM*2;
    const parts=[]; let joints=0;
    list.forEach(p=>{
      const len=clamp(p.len,LIM.len), wid=Math.min(clamp(p.wid,widRange(p)),uW);
      if(len<=uL){ parts.push({w:len,h:wid,lab:p.lab}); }
      else{
        const n=Math.ceil(len/uL), seg=Math.ceil(len/n);
        joints+=n-1;
        for(let s=0;s<n;s++){
          const w=Math.min(seg,len-seg*s);
          parts.push({w,h:wid,lab:p.lab+'·'+(s+1),jl:s>0,jr:s<n-1});
        }
      }
    });
    const rotOK=MATS[mat].rotate;
    function tryPlace(s,part){
      let best=null;
      s.free.forEach((r,ri)=>{
        const orients=[[part.w,part.h]];
        if(rotOK&&!part.jl&&!part.jr&&part.w!==part.h)orients.push([part.h,part.w]);
        orients.forEach(([w,h],oi)=>{
          if(w<=r.w&&h<=r.h){
            const score=Math.min(r.w-w,r.h-h)+oi*0.5;
            if(!best||score<best.score)best={ri,w,h,score};
          }
        });
      });
      if(!best)return false;
      const r=s.free[best.ri];
      s.placed.push({x:r.x,y:r.y,w:best.w,h:best.h,lab:part.lab,jl:part.jl,jr:part.jr});
      const remW=r.w-best.w-KERF, remH=r.h-best.h-KERF, out=[];
      if(remW>0&&remH>0){
        if(remW>=remH){ out.push({x:r.x+best.w+KERF,y:r.y,w:remW,h:r.h},{x:r.x,y:r.y+best.h+KERF,w:best.w,h:remH}); }
        else{ out.push({x:r.x,y:r.y+best.h+KERF,w:r.w,h:remH},{x:r.x+best.w+KERF,y:r.y,w:remW,h:best.h}); }
      }
      else if(remW>0)out.push({x:r.x+best.w+KERF,y:r.y,w:remW,h:r.h});
      else if(remH>0)out.push({x:r.x,y:r.y+best.h+KERF,w:r.w,h:remH});
      s.free.splice(best.ri,1,...out.filter(o=>o.w>=60&&o.h>=60));
      return true;
    }
    const ORDERS=[
      (a,b)=>Math.max(b.w,b.h)-Math.max(a.w,a.h),
      (a,b)=>b.w*b.h-a.w*a.h,
      (a,b)=>b.h-a.h||b.w-a.w,
      (a,b)=>b.w-a.w||b.h-a.h
    ];
    let slabs=null;
    ORDERS.forEach(cmp=>{
      const out=[];
      [...parts].sort(cmp).forEach(part=>{
        for(const s of out){ if(tryPlace(s,part))return; }
        const s={free:[{x:TRIM,y:TRIM,w:uL,h:uW}],placed:[]};
        out.push(s); tryPlace(s,part);
      });
      if(!slabs||out.length<slabs.length)slabs=out;
    });
    const areaM2=parts.reduce((s,p)=>s+p.w*p.h,0)/1e6;
    return {slabs:slabs||[],joints,areaM2,dims:MATS[mat].dims};
  }
  function render(plan){
    if(!plan.slabs.length){
      board.classList.remove('multi');
      board.innerHTML='<div class="est-empty">Add a piece above and your cutting plan appears here.</div>';
      return;
    }
    const {L,W}=plan.dims;
    const bg=face(stone.stone,stone.seed,stone.slug);
    const dark=DARKSTONES[stone.stone]?' pdark':'';
    board.classList.toggle('multi',plan.slabs.length>1);
    board.innerHTML=plan.slabs.map((s,si)=>{
      const inner=s.placed.map(p=>{
        const l=p.x/L*100, t=p.y/W*100, w=p.w/L*100, h=p.h/W*100;
        const bw=L/p.w*100, bh=W/p.h*100;
        const px=p.w<L?p.x/(L-p.w)*100:0, py=p.h<W?p.y/(W-p.h)*100:0;
        const tiny=(h<15||w<9)?' tiny':'';
        const j=(p.jl?' jl':'')+(p.jr?' jr':'');
        return '<div class="est-piece'+dark+tiny+j+'" style="left:'+l.toFixed(2)+'%;top:'+t.toFixed(2)+
          '%;width:'+w.toFixed(2)+'%;height:'+h.toFixed(2)+'%;background-image:'+bg+
          ';background-size:'+bw.toFixed(2)+'% '+bh.toFixed(2)+'%;background-position:'+px.toFixed(2)+'% '+py.toFixed(2)+'%">'+
          '<span class="pl">'+p.lab+'</span><span class="pd">'+p.w+' × '+p.h+'</span></div>';
      }).join('');
      return '<figure class="est-slab"><div class="est-slabface" style="aspect-ratio:'+L+'/'+W+
        ';background-image:'+bg+'">'+inner+'</div><figcaption><span>Slab '+(si+1)+
        '</span><span>'+L+' × '+W+' mm</span></figcaption></figure>';
    }).join('');
    const els=board.querySelectorAll('.est-piece');
    if(animateNext&&!reduce){
      els.forEach((el,i)=>{ el.style.transitionDelay=(i*45)+'ms'; });
      requestAnimationFrame(()=>requestAnimationFrame(()=>els.forEach(el=>el.classList.add('in'))));
    }else{
      els.forEach(el=>{ el.style.transition='none'; el.classList.add('in'); });
    }
    animateNext=false;
  }
  let lowT=0,highT=0,lowS=null,highS=null,raf=null;
  const fmt=v=>'£'+Math.round(v).toLocaleString('en-GB');
  function frame(){
    raf=null;
    const f=reduce?1:0.14;
    lowS=lowS===null?lowT:lowS+(lowT-lowS)*f;
    highS=highS===null?highT:highS+(highT-highS)*f;
    if(Math.abs(lowT-lowS)<1&&Math.abs(highT-highS)<1){lowS=lowT;highS=highT;}
    priceEl.textContent=fmt(lowS)+' – '+fmt(highS);
    if(lowS!==lowT||highS!==highT)raf=requestAnimationFrame(frame);
  }
  const kick=()=>{ if(raf===null)raf=requestAnimationFrame(frame); };
  function showRange(lo,hi){
    priceEl.classList.remove('txt');
    lowT=lo; highT=hi;
    priceSR.textContent='Estimated range '+fmt(lo)+' to '+fmt(hi);
    kick();
  }
  function showText(t,sr){
    if(raf){cancelAnimationFrame(raf);raf=null;}
    lowS=highS=null;
    priceEl.classList.add('txt');
    priceEl.textContent=t;
    priceSR.textContent=sr||t;
  }
  const bestFor=m=>(MATS[m]&&MATS[m].noCat)
    ? NO_CAT[m]
    : (MATERIALS[m].find(s=>s.slug===BEST[m])||MATERIALS[m][0]);
  function setStone(entry,announce){
    stone=entry;
    if(entry.mat&&MATS[entry.mat]&&entry.mat!==mat){ mat=entry.mat; syncTabs(); }
    const bg=face(stone.stone,stone.seed,stone.slug);
    swatchEl.style.backgroundImage=bg;
    document.querySelectorAll('#estimator .est-wash').forEach(el=>{ el.style.backgroundImage=bg; });
    stoneNameEl.textContent=stone.name;
    stoneSupEl.textContent=(stone.kind||stone.mat||mat)+(stone.finish?' · '+stone.finish:'');
    stoneBtn.hidden=!!(MATS[stone.mat||mat]||{}).noCat;
    if(announce){
      selfEvent=true;
      document.dispatchEvent(new CustomEvent('topcat:stone',{detail:{name:stone.name,
        mat:stone.mat||mat,stone:stone.stone,seed:stone.seed,slug:stone.slug,sup:stone.sup,src:'estimator'}}));
      selfEvent=false;
      jot({t:'ev',k:'Estimator stone',v:stone.name});
    }
    animateNext=true; compute();
  }
  function findStone(d){
    const m=(d.mat&&MATS[d.mat])?d.mat:mat;
    if((MATS[m]||{}).noCat) return NO_CAT[m];
    const hit=(MATERIALS[m]||[]).find(s=>(d.slug&&s.slug===d.slug)||
      (d.name&&s.name.toLowerCase()===String(d.name).toLowerCase()));
    if(hit)return hit;
    const ok=typeof d.stone==='string'&&Object.prototype.hasOwnProperty.call(STONES,d.stone);
    const fb=bestFor(m);
    return {name:String(d.name||fb.name).slice(0,60),mat:m,sup:'',slug:'',
            stone:ok?d.stone:fb.stone,seed:ok?(+d.seed||0):fb.seed};
  }
  function renderPoaSlab(){
    board.classList.remove('multi');
    const m=stone.mat||mat;
    const sub=(MATS[m]||{}).noCat ? 'Priced by hand' : m;
    board.innerHTML='<figure class="est-slab est-poaslab"><div class="est-slabface" style="background-image:'+
      face(stone.stone,stone.seed,stone.slug)+'"><figcaption class="est-plate"><b>'+esc(stone.name)+
      '</b><span>'+esc(sub)+'</span></figcaption></div></figure>';
  }
  function edgeMetres(){
    if(!edgeChk.checked||edgeIdx===null)return 0;
    const raw=lmInput.value.trim(); if(raw==='')return 0;
    const v=parseFloat(raw);
    return isFinite(v)&&v>0?Math.min(LIM.lm[1],v):0;
  }
  function renderLmOut(){
    lmOut.textContent=edgeMetres()?'':'Your total run length, usually four to eight metres in a kitchen.';
  }
  function renderEdge(){
    const on=edgeChk.checked;
    edgePanel.hidden=!on;
    if(!on){ lmWrap.hidden=true; return; }
    if(edgeIdx===null){
      edgeGlyph.innerHTML='';
      edgeTxt.innerHTML='Choose your edge profile<small>Eighteen to choose from</small>';
      lmWrap.hidden=true;
    }else{
      edgeGlyph.innerHTML=edgeSVG(EDGES[edgeIdx][1]);
      edgeTxt.innerHTML=esc(EDGES[edgeIdx][0])+'<small>£150 – £300 per linear metre</small>';
      lmWrap.hidden=false;
    }
    renderLmOut();
  }
  function compute(){
    addsEl.hidden=true;
    if(MATS[mat].poa){
      calcWrap.hidden=true; poaWrap.hidden=false;
      statsEl.hidden=true; jnote.hidden=true;
      poaTitle.innerHTML=esc(POA_HEAD[mat]||matLabel(mat)+' is priced')+' <em>by hand</em>';
      poaLead.textContent=POA_LEAD[mat]||POA_LEAD._default;
      renderPoaSlab();
      outK.textContent='Priced by hand';
      stampEl.textContent='By appointment';
      showText('Price on application',mat+' is priced by hand, tell us the room and we will price it properly');
      metaEl.textContent=stone.name+(stone.finish?' · '+stone.finish:'');
      if((MATS[mat]||{}).noCat) metaEl.textContent=stone.name;
      ctaBtn.hidden=true;
      jot({t:'est',mat:mat,stone:stone.name,poa:true});
      return;
    }
    calcWrap.hidden=false; poaWrap.hidden=true; statsEl.hidden=false;
    outK.textContent='Your estimate';
    stampEl.textContent='Indicative range';
    ctaBtn.hidden=false;
    const plan=pack(pieces.map((p,i)=>({...p,lab:LAB(i)})));
    render(plan);
    const n=plan.slabs.length;
    stSlabs.textContent=n||'–';
    stSlabsL.textContent=n===1?'slab needed':'slabs needed';
    stArea.textContent=n?plan.areaM2.toFixed(1)+' m²':'–';
    stJoints.textContent=n?(plan.joints||'none'):'–';
    stJointsL.textContent=plan.joints===1?'joint':'joints';
    jnote.hidden=!plan.joints;
    if(!n){
      showText('—','Add your sizes to see a range');
      metaEl.textContent='Add your sizes to see a range';
      return;
    }
    const pcs=pieces.length;
    const nx=EXTRAS.reduce((s,id)=>s+(orNull(document.getElementById(id)).checked?1:0),0);
    const meta=stone.name+' · '+(pcs===1?'1 piece':pcs+' pieces')+' · '+(n===1?'1 slab':n+' slabs')+
      (nx?' · '+(nx===1?'1 extra':nx+' extras'):'');
    metaEl.textContent=meta;
    const worktops=pieces.filter(p=>p.use!=='island');
    const island=worktops.length<pieces.length;
    const wSlabs=worktops.length?pack(worktops.map((p,i)=>({...p,lab:LAB(i)}))).slabs.length:0;
    const key=Math.max(1,wSlabs);
    if(key>MAX_BRACKET){
      showText('Priced by hand','A kitchen this size is priced by hand, please get in touch');
      metaEl.textContent=meta+' · beyond the estimator';
      return;
    }
    const br=BRACKETS[key][island?'island':'solo'];
    let lo=br[0], hi=br[1];
    const added=[];
    if(orNull(document.getElementById('exRemoval')).checked){ lo+=REMOVAL; hi+=REMOVAL; added.push('taking your old worktop away'); }
    const m=edgeMetres();
    if(m){ lo+=m*EDGE_RATE[0]; hi+=m*EDGE_RATE[1];
      added.push(m+' m of '+EDGES[edgeIdx][0].toLowerCase()+' edging'); }
    addsEl.hidden=!added.length;
    if(added.length)addsEl.textContent='Includes '+added.join(' and ')+'.';
    showRange(lo,hi);
    jot({t:'est',mat:mat,stone:stone.name,pieces:pieces.map(p=>p.len+'×'+p.wid+'×'+p.th+'mm '+p.use),
      slabs:n,island:island,extras:added,lo:lo,hi:hi});
  }
  let deb=null;
  const softCompute=()=>{ clearTimeout(deb); deb=setTimeout(compute,140); };
  function renderRows(focus){
    rowsEl.innerHTML='<div class="est-rowhead" aria-hidden="true"><span></span><span>Length mm</span>'+
      '<span>Width mm</span><span>Thickness mm</span><span class="rh-use">Used for</span><span></span></div>'+
      pieces.map((p,i)=>{
        const lab=LAB(i), wr=widRange(p);
        return '<div class="est-row" data-i="'+i+'">'+
          '<span class="est-pl">'+lab+'</span>'+
          '<span class="est-fl est-fl-len" aria-hidden="true">Length mm</span>'+
          '<input class="est-in" data-f="len" type="number" inputmode="numeric" min="'+LIM.len[0]+'" max="'+LIM.len[1]+'" step="10" value="'+p.len+'" aria-label="Piece '+lab+' length in millimetres">'+
          '<span class="est-fl est-fl-wid" aria-hidden="true">Width mm</span>'+
          '<input class="est-in" data-f="wid" type="number" inputmode="numeric" min="'+wr[0]+'" max="'+wr[1]+'" step="10" value="'+p.wid+'" aria-label="Piece '+lab+' width in millimetres">'+
          '<span class="est-fl est-fl-th" aria-hidden="true">Thickness mm</span>'+
          '<span class="est-seg" role="group" aria-label="Piece '+lab+' thickness">'+
            THICK.map(t=>'<button type="button" data-th="'+t+'" aria-pressed="'+(p.th===t)+
              '" aria-label="'+t+' millimetre">'+t+'</button>').join('')+'</span>'+
          '<button class="est-dropbtn est-use" type="button" data-f="use" aria-haspopup="listbox" '+
            'aria-expanded="false" aria-label="What piece '+lab+' is for"><span>'+esc(useLabel(p.use))+'</span></button>'+
          '<button class="est-x" type="button" aria-label="Remove piece '+lab+'">×</button>'+
          '</div>';
      }).join('');
    addBtn.disabled=pieces.length>=LIM.rows;
    if(focus==='last'){
      const el=rowsEl.querySelector('.est-row:last-child .est-in[data-f=len]'); if(el)el.focus();
    }else if(typeof focus==='number'){
      const el=rowsEl.querySelector('.est-row[data-i="'+focus+'"] .est-use'); if(el)el.focus();
    }
  }
  const setOn=(el,on)=>{ el.classList.toggle('on',on); el.setAttribute('aria-pressed',on); };
  const clearShapeChips=()=>shapeChips.forEach(c=>setOn(c,false));
  function syncIsland(){ setOn(islandBtn,pieces.some(p=>p.use==='island')); }
  function syncTabs(){ tabs.forEach(t=>setOn(t,t.dataset.mat===mat)); }
  rowsEl.addEventListener('input',e=>{
    const inp=e.target.closest('.est-in'); if(!inp)return;
    const i=+inp.closest('.est-row').dataset.i, f=inp.dataset.f, v=+inp.value;
    if(isFinite(v)&&pieces[i]){ pieces[i][f]=v; softCompute(); }
  });
  function setUse(i,id){
    if(!pieces[i]||pieces[i].use===id)return;
    pieces[i].use=id;
    const wr=widRange(pieces[i]);
    pieces[i].wid=Math.min(wr[1],Math.max(wr[0],pieces[i].wid));
    syncIsland(); clearShapeChips(); animateNext=true; renderRows(i); compute();
  }
  rowsEl.addEventListener('change',e=>{
    const inp=e.target.closest('.est-in'); if(!inp)return;
    const i=+inp.closest('.est-row').dataset.i, f=inp.dataset.f;
    if(!pieces[i])return;
    const raw=inp.value.trim();
    const v=clamp(raw===''?pieces[i][f]:raw,f==='wid'?widRange(pieces[i]):LIM.len);
    pieces[i][f]=v; inp.value=v;
    compute();
  });
  rowsEl.addEventListener('click',e=>{
    const seg=e.target.closest('.est-seg button');
    if(seg){
      const i=+seg.closest('.est-row').dataset.i;
      if(!pieces[i])return;
      pieces[i].th=+seg.dataset.th;
      seg.parentNode.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',b===seg));
      compute(); return;
    }
    const drop=e.target.closest('.est-dropbtn');
    if(drop){ openUsePop(drop); return; }
    const x=e.target.closest('.est-x'); if(!x)return;
    const i=+x.closest('.est-row').dataset.i;
    pieces.splice(i,1);
    clearShapeChips(); syncIsland();
    animateNext=true; renderRows(); compute();
    const xs=rowsEl.querySelectorAll('.est-x');
    (xs[Math.min(i,xs.length-1)]||addBtn).focus();
  });
  addBtn.addEventListener('click',()=>{
    if(pieces.length>=LIM.rows)return;
    pieces.push({len:2000,wid:620,th:20,use:'run'});
    clearShapeChips();
    animateNext=true; renderRows('last'); compute();
  });
  quickEl.addEventListener('click',e=>{
    const b=e.target.closest('.est-chip'); if(!b)return;
    animateNext=true;
    if(b===islandBtn){
      const i=pieces.findIndex(p=>p.use==='island');
      if(i>=0)pieces.splice(i,1);
      else{ if(pieces.length>=LIM.rows)return;
        pieces.push({...ISLAND}); }
      syncIsland(); renderRows(); compute(); return;
    }
    shapeChips.forEach(c=>setOn(c,c===b));
    const isl=pieces.find(p=>p.use==='island');
    pieces=SHAPES[b.dataset.shape].map(([len,wid,use])=>({len,wid,th:20,use}));
    if(isl)pieces.push(isl);
    syncIsland(); renderRows(); compute();
  });
  tabs.forEach(b=>b.addEventListener('click',()=>{
    if(b.dataset.mat===mat)return;
    mat=b.dataset.mat; syncTabs();
    jot({t:'ev',k:'Estimator material',v:mat});
    setStone(bestFor(mat),false);
  }));
  EXTRAS.forEach(id=>orNull(document.getElementById(id)).addEventListener('change',()=>{
    if(id==='exEdge')renderEdge();
    compute();
  }));
  lmInput.addEventListener('input',()=>{ renderLmOut(); softCompute(); });
  lmInput.addEventListener('change',()=>{
    const raw=lmInput.value.trim();
    if(raw!=='')lmInput.value=Math.min(LIM.lm[1],Math.max(LIM.lm[0],parseFloat(raw)||LIM.lm[0]));
    renderLmOut(); compute();
  });
  document.addEventListener('topcat:stone',e=>{
    if(selfEvent)return;
    setStone(e.detail?findStone(e.detail):bestFor(mat),false);
  });
  const usePop=document.createElement('div');
  usePop.className='est-pop'; usePop.setAttribute('role','listbox'); usePop.hidden=true;
  document.body.appendChild(usePop);
  let popRow=-1, popBtn=null, popTimer=null;
  const popOpen=()=>popBtn!==null;
  function placePop(){
    if(!popBtn)return;
    const r=popBtn.getBoundingClientRect();
    usePop.style.minWidth=Math.max(190,r.width)+'px';
    usePop.style.left='0px'; usePop.style.top='0px';
    const w=usePop.offsetWidth, h=usePop.offsetHeight;
    let x=Math.min(r.left,innerWidth-w-10); x=Math.max(10,x);
    let y=(r.bottom+6+h<=innerHeight-10)?r.bottom+6:r.top-6-h;
    y=Math.max(10,Math.min(y,innerHeight-h-10));
    usePop.style.left=x+'px'; usePop.style.top=y+'px';
  }
  function openUsePop(btn){
    if(popBtn===btn){ closeUsePop(); return; }
    closeUsePop();
    popBtn=btn; popRow=+btn.closest('.est-row').dataset.i;
    const cur=pieces[popRow]?pieces[popRow].use:'run';
    usePop.innerHTML=USES.map(u=>'<button type="button" role="option" data-use="'+u.id+
      '" aria-selected="'+(u.id===cur)+'">'+esc(u.label)+'</button>').join('');
    clearTimeout(popTimer);
    usePop.hidden=false; placePop();
    requestAnimationFrame(()=>{ if(popOpen())usePop.classList.add('open'); });
    btn.setAttribute('aria-expanded','true');
    const sel=usePop.querySelector('[aria-selected="true"]')||usePop.firstChild;
    if(sel){ sel.classList.add('active'); sel.focus(); }
  }
  function closeUsePop(refocus){
    if(!popBtn)return;
    const btn=popBtn; popBtn=null; popRow=-1;
    btn.setAttribute('aria-expanded','false');
    usePop.classList.remove('open');
    clearTimeout(popTimer);
    popTimer=setTimeout(()=>{ if(!popOpen())usePop.hidden=true; },220);
    if(refocus&&document.contains(btn))btn.focus();
    else if(usePop.contains(document.activeElement))document.activeElement.blur();
  }
  usePop.addEventListener('click',e=>{
    const o=e.target.closest('[data-use]'); if(!o)return;
    const i=popRow; closeUsePop(); setUse(i,o.dataset.use);
  });
  usePop.addEventListener('keydown',e=>{
    const opts=[...usePop.querySelectorAll('button')];
    const at=opts.indexOf(document.activeElement);
    if(e.key==='Escape'){ e.preventDefault(); closeUsePop(true); return; }
    if(e.key==='Tab'){ e.preventDefault(); closeUsePop(true); return; }
    if(e.key==='ArrowDown'||e.key==='ArrowUp'){
      e.preventDefault();
      const n=opts[(at+(e.key==='ArrowDown'?1:opts.length-1)+opts.length)%opts.length];
      opts.forEach(o=>o.classList.remove('active')); n.classList.add('active'); n.focus();
    }
    if(e.key==='Home'||e.key==='End'){ e.preventDefault(); (e.key==='Home'?opts[0]:opts[opts.length-1]).focus(); }
  });
  document.addEventListener('pointerdown',e=>{
    if(!popOpen())return;
    if(usePop.contains(e.target)||e.target.closest('.est-dropbtn'))return;
    closeUsePop();
  },true);
  window.addEventListener('resize',()=>{ if(popOpen())closeUsePop(); });
  window.addEventListener('scroll',()=>{
    if(!popOpen())return;
    const r=popBtn.getBoundingClientRect();
    if(r.bottom<0||r.top>innerHeight)closeUsePop(); else placePop();
  },true);
  let modalOpen=false,modalMode=null,modalMat='Quartz',modalReturn=null,closeTimer=null,stoneQuery='';
  function buildModal(){
    if(modalMode==='stone'){
      mTitle.textContent='Choose your stone';
      mSub.textContent='Samples come to your kitchen, and you approve your own slab from photographs before a single cut.';
      const q=stoneQuery.trim().toLowerCase();
      const qterms=q?q.replace(/\b(marble|stone)\s+(effect|look|style)\b/g,'$1$2')
                     .split(/[\s,]+/).filter(Boolean):[];
      const list=MATERIALS[modalMat].filter(s=>!qterms.length||matchStone(s,qterms));
      const count=q
        ? (list.length?list.length+' of '+MATERIALS[modalMat].length+' in '+matLabel(modalMat)
                      :'Nothing in '+matLabel(modalMat).toLowerCase()+' matches that')
        : MATERIALS[modalMat].length+' in '+matLabel(modalMat);
      mBody.innerHTML='<div class="est-mtabs">'+['Quartz','Marble','Granite'].map(m=>
          '<button class="mat-tab'+(m===modalMat?' on':'')+'" type="button" data-mmat="'+m+
          '" aria-pressed="'+(m===modalMat)+'">'+esc(matLabel(m))+'</button>').join('')+
        '<label class="est-msearch"><svg viewBox="0 0 16 16" aria-hidden="true">'+
        '<circle cx="7" cy="7" r="5"/><path d="M10.6 10.6 14 14"/></svg>'+
        '<input type="search" id="estStoneSearch" placeholder="Try white, matt, marble effect" '+
        'aria-label="Search stones by name" value="'+esc(stoneQuery)+'"></label></div>'+
        '<p class="est-mcount'+(list.length?'':' none')+'">'+esc(count)+'</p>'+
        (list.length?'<div class="sp-grid">'+list.map(s=>
          '<button class="sp-tile'+(s.slug===stone.slug?' on':'')+'" type="button" data-slug="'+s.slug+
          '" aria-pressed="'+(s.slug===stone.slug)+'">'+
          '<span class="sp-face" style="background-image:'+face(s.stone,s.seed,s.slug)+'"></span>'+
          '<b>'+esc(s.name)+'</b><small>'+esc(s.finish||s.kind||s.mat)+'</small></button>').join('')+'</div>':'')+
        '<p class="est-msource">Not the stone you had in mind? We can usually source it. '+
        '<button type="button" id="estSourceAsk">Tell us what you are after</button></p>';
    }else{
      mTitle.textContent='Choose your edge profile';
      mSub.textContent='Milled into the front face of the stone, £150 to £300 per linear metre. A pencil edge and rounded corners come as standard, so this is only if you want something worked.';
      mBody.innerHTML='<div class="ep-grid">'+EDGES.map((x,i)=>
        '<button class="ep-tile'+(i===edgeIdx?' on':'')+'" type="button" data-ep="'+i+
        '" aria-pressed="'+(i===edgeIdx)+'">'+edgeSVG(x[1])+'<span>'+esc(x[0])+'</span></button>').join('')+'</div>';
    }
  }
  function openModal(mode,trigger){
    modalMode=mode; modalReturn=trigger||null;
    if(mode==='stone'){ modalMat=(stone.mat&&MATERIALS[stone.mat])?stone.mat:mat; stoneQuery=''; }
    buildModal();
    clearTimeout(closeTimer);
    modal.hidden=false; modalOpen=true;
    document.documentElement.style.overflow='hidden';
    requestAnimationFrame(()=>requestAnimationFrame(()=>{ if(modalOpen)modal.classList.add('open'); }));
    (mBody.querySelector('.on')||mBody.querySelector('button')||mX).focus();
  }
  function closeModal(){
    if(!modalOpen)return;
    modalOpen=false;
    modal.classList.remove('open');
    document.documentElement.style.overflow='';
    closeTimer=setTimeout(()=>{ if(!modalOpen)modal.hidden=true; },420);
    const back=modalReturn; modalReturn=null;
    if(back&&document.contains(back))back.focus();
    else if(document.activeElement&&modal.contains(document.activeElement))document.activeElement.blur();
  }
  stoneBtn.addEventListener('click',()=>openModal('stone',stoneBtn));
  edgeBtn.addEventListener('click',()=>openModal('edge',edgeBtn));
  mX.addEventListener('click',closeModal);
  modal.addEventListener('click',e=>{ if(e.target===modal)closeModal(); });
  modal.addEventListener('keydown',e=>{
    if(e.key==='Escape'){ e.preventDefault(); closeModal(); return; }
    if(e.key!=='Tab')return;
    const f=[...modal.querySelectorAll('button')].filter(el=>el.offsetParent!==null);
    if(!f.length)return;
    const first=f[0],last=f[f.length-1];
    if(e.shiftKey&&document.activeElement===first){ e.preventDefault(); last.focus(); }
    else if(!e.shiftKey&&document.activeElement===last){ e.preventDefault(); first.focus(); }
  });
  mBody.addEventListener('input',e=>{
    if(e.target.id!=='estStoneSearch')return;
    const pos=e.target.selectionStart;
    stoneQuery=e.target.value;
    buildModal();
    const box=document.getElementById('estStoneSearch');
    if(box){ box.focus(); try{ box.setSelectionRange(pos,pos); }catch(err){} }
  });
  mBody.addEventListener('click',e=>{
    const mt=e.target.closest('[data-mmat]');
    if(mt){ modalMat=mt.dataset.mmat; buildModal();
      const f=mBody.querySelector('[data-mmat].on'); if(f)f.focus(); return; }
    const st=e.target.closest('[data-slug]');
    if(st){ const s=MATERIALS[modalMat].find(x=>x.slug===st.dataset.slug);
      if(s){ closeModal(); setStone(s,true); } return; }
    const ep=e.target.closest('[data-ep]');
    if(ep){ edgeIdx=+ep.dataset.ep; closeModal(); renderEdge(); compute(); return; }
    if(e.target.closest('#estSourceAsk')){
      closeModal();
      const cta=document.getElementById('cta');
      if(cta)setTimeout(()=>cta.scrollIntoView({behavior:'smooth',block:'start'}),60);
    }
  });
  renderRows(); renderEdge(); syncIsland();
  setStone(bestFor(mat),false);
  attachGlow(document.getElementById('estPanel'));
  attachGlow(document.getElementById('estPreview'));
})();
function scrollSequence(host,tiles,apply,opts){
  if(!host||!tiles.length)return;
  const o=opts||{};
  const START=o.start!=null?o.start:0.98;
  const END  =o.end  !=null?o.end  :0.26;
  const SPAN =o.span !=null?o.span :0.40;
  const STEP =o.step !=null?o.step :0.105;
  const SCRUB=o.scrub!=null?o.scrub:0.085;
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    tiles.forEach((el,i)=>apply(el,1,i)); return;
  }
  let cur=null,raf=null,live=false;
  function read(){
    const vh=window.innerHeight||1, top=host.getBoundingClientRect().top/vh;
    return Math.max(0,Math.min(1,(START-top)/(START-END)));
  }
  function tick(){
    const t=read();
    cur = cur===null ? t : cur+(t-cur)*SCRUB;
    for(let i=0;i<tiles.length;i++){
      const u=Math.max(0,Math.min(1,(cur-i*STEP)/SPAN));
      apply(tiles[i],1-Math.pow(1-u,3),i);
    }
    if(live)raf=requestAnimationFrame(tick);
  }
  tick();
  const io=new IntersectionObserver(es=>{
    es.forEach(e=>{
      if(e.isIntersecting===live)return;
      live=e.isIntersecting;
      if(live){ raf=requestAnimationFrame(tick); }
      else if(raf){ cancelAnimationFrame(raf); raf=null; cur=read(); tick(); }
    });
  },{rootMargin:'140% 0px 140% 0px'});
  io.observe(host);
}
function viewSequence(host,tiles,apply,opts){
  if(!host||!tiles.length)return;
  const o=opts||{};
  const DUR =o.dur !=null?o.dur :620;
  const GAP =o.gap !=null?o.gap :175;
  const HOLD=o.hold!=null?o.hold:0;
  const THR =o.threshold!=null?o.threshold:0.2;
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    tiles.forEach((el,i)=>apply(el,1,i)); return;
  }
  tiles.forEach((el,i)=>apply(el,0,i));
  let t0=null,raf=null,played=false;
  function frame(now){
    if(t0===null)t0=now;
    const ms=now-t0-HOLD;
    let all=true;
    for(let i=0;i<tiles.length;i++){
      const u=Math.max(0,Math.min(1,(ms-i*GAP)/DUR));
      if(u<1)all=false;
      apply(tiles[i],1-Math.pow(1-u,3),i);
    }
    raf=all?null:requestAnimationFrame(frame);
  }
  const io=new IntersectionObserver(es=>{
    for(const e of es){
      if(!e.isIntersecting||played)continue;
      played=true; io.disconnect();
      raf=requestAnimationFrame(frame);
    }
  },{threshold:THR});
  io.observe(host);
}
(function(){
  const m=document.getElementById('whyMosaic'); if(!m)return;
  const tiles=Array.prototype.slice.call(m.querySelectorAll('.wy-tile'));
  setTimeout(()=>{ tiles.forEach(el=>attachGlow(el)); },0);
  m.querySelectorAll('.wy-stone').forEach((el,i)=>{ marbleFill(el, 5200+i*13); });
  viewSequence(m,tiles,(el,e)=>{
    if(e>0.999){ el.style.transform=''; el.style.opacity=''; return; }
    el.style.transform='translateZ('+(-(1-e)*640).toFixed(0)+'px) translateY('+((1-e)*40).toFixed(1)+'px)';
    el.style.opacity=(e*e).toFixed(3);
  },{dur:620,gap:175,threshold:0.2});
})();
(function(){
  const cards=document.querySelectorAll('.trade-stone');
  if(!cards.length) return;
  cards.forEach((el,i)=>{ marbleFill(el, 7400+i*17); });
})();
(function(){
  const burger=document.getElementById('navBurger');
  const sheet=document.getElementById('mobileNav');
  if(!burger||!sheet) return;
  const setOpen=open=>{
    document.documentElement.classList.toggle('nav-open',open);
    burger.setAttribute('aria-expanded',open);
    burger.setAttribute('aria-label',open?'Close menu':'Open menu');
  };
  burger.addEventListener('click',()=>setOpen(!document.documentElement.classList.contains('nav-open')));
  sheet.addEventListener('click',e=>{ if(e.target.closest('a')) setOpen(false); });
  window.addEventListener('keydown',e=>{ if(e.key==='Escape') setOpen(false); });
  sheet.addEventListener('click',e=>{
    const t=e.target.closest('.mn-toggle');
    if(!t) return;
    const panel=document.getElementById(t.getAttribute('aria-controls'));
    if(!panel) return;
    const open=!panel.classList.contains('open');
    closeSubs();
    if(open){
      panel.classList.add('open');
      panel.style.maxHeight=panel.scrollHeight+'px';
      t.setAttribute('aria-expanded','true');
    }
  });
  function closeSubs(){
    sheet.querySelectorAll('.mn-sub').forEach(p=>{ p.classList.remove('open'); p.style.maxHeight=''; });
    sheet.querySelectorAll('.mn-toggle').forEach(b=>b.setAttribute('aria-expanded','false'));
  }
  burger.addEventListener('click',()=>{
    if(!document.documentElement.classList.contains('nav-open')) closeSubs();
  });
})();
(function(){
  const form=document.getElementById('ctaForm');
  const reply=document.getElementById('ctaReply');
  if(!form||!reply) return;
  window.TC_FORM_EXTRA=function(fd,f){
    if(f!==form) return;
    const chipEl=document.getElementById('ctaStoneName');
    if(chipEl&&chipEl.textContent)fd.append('stone',chipEl.textContent);
    if(TC_UP.link)fd.append('stone_link',TC_UP.link);
    TC_UP.files.forEach((it,i)=>fd.append('file'+(i+1),it.file,it.file.name));
  };
  document.querySelectorAll('.tc-up[data-up]').forEach(mountUpload);
  renderUploads();
  const upWrap=document.getElementById('ctaUp');
  const upBtn=document.getElementById('ctaUpT');
  const upN=document.getElementById('ctaUpN');
  if(upWrap&&upBtn&&upN){
    const setUp=on=>{
      upWrap.classList.toggle('open',on);
      upBtn.setAttribute('aria-expanded',on?'true':'false');
    };
    upBtn.addEventListener('click',()=>setUp(!upWrap.classList.contains('open')));
    const syncUp=()=>{
      const n=TC_UP.files.length;
      upN.textContent = n ? (n===1?'1 file':n+' files') : (TC_UP.link?'link added':'');
      if(n||TC_UP.link) setUp(true);
    };
    document.addEventListener('topcat:files',syncUp);
    syncUp();
  }
  const chipKind=d=>{
    const row=(MATERIALS[d.mat]||[]).find(s=>s.slug===d.slug||s.name===d.name);
    return (row&&row.kind)||d.mat;
  };
  const chip=document.getElementById('ctaStone');
  const chipName=document.getElementById('ctaStoneName');
  const chipX=document.getElementById('ctaStoneX');
  if(chip&&chipName&&chipX){
    document.addEventListener('topcat:stone',e=>{
      const d=e.detail;
      if(!d){ chip.hidden=true; chipName.textContent=''; return; }
      chipName.textContent=d.mat?`${d.name} · ${chipKind(d)}`:d.name;
      chip.hidden=false;
    });
    chipX.addEventListener('click',()=>{
      document.dispatchEvent(new CustomEvent('topcat:stone',{detail:null}));
    });
  }
})();
(function(){
  const collage=document.getElementById('aboutCollage'); if(!collage)return;
  const picks=[null,'/assets/site/about-fitting-386.webp','/assets/team/fitting.jpg',
               '/assets/projects/harrow-1400.webp',null,null];
  collage.querySelectorAll('.ac-tile img').forEach((im,i)=>{ if(!picks[i])return; im.src=picks[i];
      if(SS[picks[i]]){ im.srcset=SS[picks[i]]; im.sizes='(max-width:720px) 240px, 375px'; }
      im.loading='lazy'; im.decoding='async'; });
  setTimeout(()=>{ collage.querySelectorAll('.ac-tile').forEach(el=>attachGlow(el)); },0);
  const HINGE=[
    {ax:'X',deg:-84,org:'50% 0%'},
    {ax:'Y',deg:-78,org:'100% 50%'},
    {ax:'Y',deg: 78,org:'0% 50%'},
    {ax:'X',deg:-84,org:'50% 0%'},
    {ax:'Y',deg: 78,org:'0% 50%'},
    {ax:'Y',deg:-78,org:'100% 50%'}
  ];
  const tiles=Array.prototype.slice.call(collage.querySelectorAll('.ac-tile'));
  tiles.forEach((el,i)=>{ el.style.transformOrigin=HINGE[i%HINGE.length].org; });
  const weldClock=window.matchMedia('(min-width:1121px)').matches
    && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    && !!document.getElementById('process');
  scrollSequence(collage,tiles,(el,e,i)=>{
    if(e>0.999){ el.style.transform=''; el.style.opacity=''; return; }
    const h=HINGE[i%HINGE.length];
    el.style.transform='translateZ('+(-(1-e)*70).toFixed(1)+'px) rotate'+h.ax+
                       '('+((1-e)*h.deg).toFixed(2)+'deg)';
    el.style.opacity=Math.min(1,e*2.1).toFixed(3);
  },weldClock?{start:1.21,end:0.576,span:0.42,step:0.112,scrub:0.26}
             :{start:0.94,end:0.20,span:0.42,step:0.112,scrub:0.14});
})();
(function(){
  const proc=document.getElementById('process'), about=document.getElementById('about');
  if(!proc||!about)return;
  const mqWide=window.matchMedia('(min-width:1121px)');
  const mqCalm=window.matchMedia('(prefers-reduced-motion: reduce)');
  const REST=0.40,SHUT=1.20,WELD=0.30,
        EDGE_IN=0.06,
        ARMD  =0.94;
  let stage=null,doorL=null,doorR=null,tilesReal=null,tilesL=null,tilesR=null;
  let S=0,TOTAL=1,HOLD=0,SLIDE=1,TAIL=1,target=0;
  let cur=-1,on=false,phase=false,welded=false,ticking=false,armed=false,loop=null;
  function docTop(el){let y=0;for(let n=el;n;n=n.offsetParent)y+=n.offsetTop;return y}
  function easeIO(t){return t<0.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2}
  function cloneAbout(){
    const c=about.cloneNode(true);
    c.removeAttribute('id');
    c.querySelectorAll('[id]').forEach(el=>el.removeAttribute('id'));
    c.classList.add('weld-about');
    c.setAttribute('aria-hidden','true');
    c.style.marginTop='0px';
    c.querySelectorAll('.rise').forEach(el=>{el.style.transition='none';el.classList.add('in')});
    return c;
  }
  function build(){
    if(stage)return;
    stage=document.createElement('div');
    stage.id='weldStage';
    stage.setAttribute('aria-hidden','true');
    const leaf=side=>{
      const d=document.createElement('div');
      d.className='weld-door weld-'+side;
      const f=document.createElement('div'); f.className='weld-floor';
      const face=document.createElement('div'); face.className='weld-face';
      face.appendChild(cloneAbout());
      d.appendChild(f); d.appendChild(face);
      return d;
    };
    doorL=leaf('l'); doorR=leaf('r');
    const seam=document.createElement('div'); seam.id='weldSeam';
    seam.innerHTML='<span class="ws-glow"></span><span class="ws-run"></span><span class="ws-head"></span>';
    stage.appendChild(doorL); stage.appendChild(doorR); stage.appendChild(seam);
    document.body.appendChild(stage);
    tilesReal=[].slice.call(about.querySelectorAll('.ac-tile'));
    tilesL=[].slice.call(doorL.querySelectorAll('.ac-tile'));
    tilesR=[].slice.call(doorR.querySelectorAll('.ac-tile'));
    about.querySelectorAll('.rise').forEach(el=>{el.style.transition='none';el.classList.add('in')});
  }
  function mirror(){
    for(let i=0;i<tilesReal.length;i++){
      const t=tilesReal[i].style.transform,o=tilesReal[i].style.opacity;
      if(tilesR[i].style.transform!==t){tilesR[i].style.transform=t;tilesL[i].style.transform=t}
      if(tilesR[i].style.opacity!==o){tilesR[i].style.opacity=o;tilesL[i].style.opacity=o}
    }
  }
  function pump(){ if(!on){loop=null;return} mirror(); loop=requestAnimationFrame(pump) }
  function measure(){
    const vh=window.innerHeight,procH=proc.offsetHeight;
    const barH=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--barH'))||0;
    const pin=Math.min(0,Math.max(vh-procH,barH-(parseFloat(getComputedStyle(proc).paddingTop)||0)));
    proc.style.setProperty('--procPin',pin.toFixed(2)+'px');
    const slack=Math.max(0,(vh-barH)-about.offsetHeight);
    target=barH+Math.min(slack/2,vh*0.06);
    HOLD =Math.round(vh*REST);
    SLIDE=Math.round(vh*SHUT);
    TAIL =Math.round(vh*WELD);
    TOTAL=HOLD+SLIDE+TAIL;
    const pad=Math.max(0,TOTAL-(procH+pin-target));
    about.style.marginTop=pad?pad+'px':'';
    S=docTop(about)-pad-procH-pin;
    if(stage)stage.style.setProperty('--weldTop',target+'px');
  }
  function frame(){
    ticking=false;
    const px=window.pageYOffset-S;
    if(px===cur)return;
    cur=px;
    const inPhase=px>0&&px<TOTAL;
    if(inPhase&&!stage)build();
    if(inPhase!==phase){
      phase=inPhase;
      about.classList.toggle('weld-hide',inPhase);
      if(inPhase){proc.classList.remove('weld-past');measure()}
    }
    if(inPhase){
      const d=Math.max(0,Math.min(1,(px-HOLD)/SLIDE));
      if(d>0&&!on){on=true;stage.classList.add('on');if(!loop)loop=requestAnimationFrame(pump)}
      else if(d<=0&&on){on=false;stage.classList.remove('on')}
      if(!on){proc.classList.remove('weld-past');return}
      const off=(1-easeIO(d))*100;
      doorL.style.transform='translate3d('+(-off).toFixed(3)+'%,0,0)';
      doorR.style.transform='translate3d('+off.toFixed(3)+'%,0,0)';
      const w=Math.max(0,Math.min(1,(px-HOLD-SLIDE)/TAIL));
      const fade=Math.max(0,1-Math.max(0,w-0.25)/0.55);
      stage.style.setProperty('--edgeA',(d<1?Math.min(1,d/EDGE_IN):fade).toFixed(3));
      stage.style.setProperty('--seamA',(d<1?0:fade).toFixed(3));
      if(d>=1&&!welded){
        welded=true;
        stage.classList.remove('welding');void stage.offsetWidth;stage.classList.add('welding');
      }else if(d<ARMD&&welded){welded=false;stage.classList.remove('welding')}
      mirror();
    }else{
      if(on){on=false;mirror();stage.classList.remove('on')}
      proc.classList.toggle('weld-past',px>=TOTAL);
    }
  }
  function onScroll(){if(!ticking){ticking=true;requestAnimationFrame(frame)}}
  function enable(){
    if(armed||!mqWide.matches||mqCalm.matches)return;
    armed=true;
    document.body.classList.add('weld-live');
    requestAnimationFrame(()=>{measure();cur=-1;frame()});
    window.addEventListener('scroll',onScroll,{passive:true});
  }
  function disable(){
    if(!armed)return;
    armed=false;
    window.removeEventListener('scroll',onScroll);
    document.body.classList.remove('weld-live');
    about.classList.remove('weld-hide');proc.classList.remove('weld-past');
    about.style.marginTop='';
    if(stage){stage.classList.remove('on','welding')}
    on=false;phase=false;welded=false;cur=-1;
    if(loop){cancelAnimationFrame(loop);loop=null}
  }
  new IntersectionObserver(es=>{
    es.forEach(e=>{if(e.isIntersecting&&armed){build();measure();cur=-1;frame()}})
  },{rootMargin:'150% 0px 150% 0px'}).observe(proc);
  let rt=null;
  window.addEventListener('resize',()=>{
    clearTimeout(rt);
    rt=setTimeout(()=>{
      if(!mqWide.matches||mqCalm.matches){disable();return}
      enable();measure();cur=-1;frame();
    },160);
  });
  mqWide.addEventListener('change',()=>{mqWide.matches?enable():disable()});
  enable();
})();
const io=new IntersectionObserver((es)=>{es.forEach(e=>{
  if(!e.isIntersecting)return;
  e.target.classList.add('in');
  io.unobserve(e.target);
});},{threshold:0.25});
document.querySelectorAll('.rise').forEach(el=>io.observe(el));
(function(){
  const q=new URLSearchParams(location.search);
  const name=(q.get('stone')||'').trim().slice(0,60);
  if(!name)return;
  const mat=['Marble','Quartz','Granite'].includes(q.get('mat'))?q.get('mat'):null;
  const preset=Object.prototype.hasOwnProperty.call(STONES,q.get('p')||'')?q.get('p'):null;
  const seed=parseInt(q.get('s'),10)||0;
  const slug=(q.get('slug')||'').trim().slice(0,60);
  document.dispatchEvent(new CustomEvent('topcat:stone',{detail:{name,mat,stone:preset,seed,slug}}));
  if(mat){
    clearStoneFilters(); SLABS_UNIQUE=filterStones(MATERIALS[currentMat]);
    SLABS=makeBelt(SLABS_UNIQUE); refreshFilterUI();
    const list=MATERIALS[mat]||[];
    const i=list.findIndex(x=>x.slug===q.get('slug')||x.name.toLowerCase()===name.toLowerCase());
    if(i>=0){
      pendingIdx=i;
      if(currentMat!==mat){ loadMaterial(mat); }
      else if(galleryOn){ target=Math.round(target)+shortestOffset(i); pendingIdx=null; }
    }
  }
})();
(function(){
  const foot=document.querySelector('#footer')||document.querySelector('footer');
  const tail=document.getElementById('footTail');
  const contact=document.querySelector('.foot-contact');
  const area=document.querySelector('.foot-c-area');
  const hours=document.querySelector('.foot-c-hours');
  if(!foot||!tail||!contact||!area||!hours) return;
  function place(){
    const on=getComputedStyle(foot).getPropertyValue('--footTail').trim()==='on';
    const host=on?tail:contact;
    if(area.parentElement!==host){ host.appendChild(area); host.appendChild(hours); }
  }
  place();
  window.addEventListener('resize',place,{passive:true});
})();