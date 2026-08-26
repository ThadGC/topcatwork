/**
 * HERO FILM — the pre-paint boot script.
 *
 * Two things have to happen before the browser paints, and neither can wait
 * for React to hydrate.
 *
 * 1. THE `cine-on` GATE.
 *    The film's entire layout — a 1050vh runway with a sticky hero — is CSS
 *    gated on `html.cine-on`. Set that class in an effect and the first paint
 *    is the still hero at 100vh, the second is a 1050vh runway, and the page
 *    visibly reflows on every load. Setting it from an inline script during
 *    HTML parse is what the legacy page did, and it is why the legacy page has
 *    no flash. Under `output: 'export'` this markup is baked into the HTML, so
 *    it runs at exactly the same point in the parse.
 *
 *    The same script is the reduced-motion and codec gate. If any of the three
 *    checks fails the class is never added, the CSS never switches, and the
 *    visitor keeps the still hero — with no video ever fetched.
 *
 * 2. THE RESIZE SHIM.
 *    On mobile, scrolling collapses the URL bar, which fires `resize` with a
 *    viewport 100-ish pixels taller. Every scroll-driven module on the page
 *    re-measures, the film's `travel` changes mid-scrub, and the timeline
 *    jumps several seconds. The shim swallows those events in the capture
 *    phase — before any listener sees them — when the width is unchanged, the
 *    viewport is narrow, and the height moved less than 140px. A real
 *    orientation change or window resize passes straight through.
 *
 *    It must be registered before any other resize listener, which is another
 *    reason it is a parse-time script and not an effect.
 *
 * Render this once, high in the tree — the root layout's <head> is ideal.
 * It emits no DOM.
 */

const BOOT = `(function(){
  var lw=window.innerWidth, lh=window.innerHeight;
  window.addEventListener('resize',function(e){
    var w=window.innerWidth, h=window.innerHeight;
    if(w===lw && w<=1120 && Math.abs(h-lh)<=140){ e.stopImmediatePropagation(); return; }
    lw=w; lh=h;
  }, true);
})();
(function(){try{
  if(!window.matchMedia)return;
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  if(!document.createElement('video').canPlayType('video/mp4'))return;
  document.documentElement.classList.add('cine-on');
  if((location.hash||'').toLowerCase()==='#hero'){
    document.documentElement.classList.add('to-hero');
    if('scrollRestoration' in history) history.scrollRestoration='manual';
    setTimeout(function(){document.documentElement.classList.remove('to-hero');},3000);
  }
}catch(e){}})();`;

export function HeroFilmBoot() {
  return (
    <script
      // Inline, not `next/script`: this has to execute during HTML parse, and
      // under a static export that is exactly what a plain inline tag does.
      dangerouslySetInnerHTML={{ __html: BOOT }}
    />
  );
}

export default HeroFilmBoot;
