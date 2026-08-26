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
 * Render this once, high in the tree. It emits no DOM.
 *
 * ── where it goes, and why not <head> ───────────────────────────────────────
 * <HeroFilm> renders it as the first child of `.cine`, NOT the root layout's
 * <head>, because `html.cine-on` is not only the film's gate: chrome.css:1133
 * puts the WhatsApp and call FABs into their film state off the same class,
 * and globals.css:1199 suppresses the hero stagger off it. The root layout is
 * on all 178 routes and 177 of them have no film, so a head-level boot would
 * change the chrome on every one of them. Scoped to the film's own subtree it
 * runs a few kilobytes into <body> — still during parse, still before the hero
 * has been laid out, and still before <video> and the still <img> exist.
 *
 * ── what it was worth ───────────────────────────────────────────────────────
 * This component was written, commented and exported, and then never rendered:
 * `cine-on` was reaching the document only from `sync()`, after hydration. The
 * cost was measured on a Samsung S21 Ultra (384x722 CSS px, dpr 3.75):
 *
 *   - Until hydration the runway is `height:auto`, i.e. one viewport, not the
 *     phone band's `--cineH: 800vh` (globals.css:504). That puts the services
 *     strip ~1.3k px below the fold instead of ~5.8k px, inside Chrome's
 *     lazy-loading threshold, and Chrome duly fetched SIX service images —
 *     1,863,538 bytes — starting at t=251ms, 317ms BEFORE the film's own first
 *     byte at t=568ms. `loading="lazy"` was on all of them and did nothing,
 *     because lazy is measured against a layout that was wrong.
 *   - The first paint is a 100vh hero and the second is an 800vh runway, which
 *     is the reflow the note above says this script exists to prevent.
 *   - The resize shim was not installed at all, so every scroll-driven module
 *     on the page re-measured on the first URL-bar collapse.
 *
 * ── the disarm, and why asserting `cine-on` at parse needs one ──────────────
 * Setting the class here moves it from "after hydration" to "before anything",
 * which is the whole point — but it also means the class is asserted by a
 * script that cannot know whether the JavaScript behind it will ever arrive.
 * If a chunk 404s after a bad deploy, or React throws before its first effect,
 * the visitor keeps the film's page state forever, and on the phone band that
 * state is expensive:
 *
 *   chrome.css:1141  html.cine-on:not(.skip-live) .wa-fab, .call-fab
 *                    { display:none }   -- `skip-live` is added by the engine,
 *                    so the WhatsApp and call buttons, the two conversion
 *                    elements a phone visitor has, are gone for good.
 *   HeroFilm.module.css:1161  .hero:not(.loaded) .inner { opacity:0 }
 *                    -- `loaded` is added by the engine too.
 *   HeroFilm.module.css:140   .bgImg { opacity:0 }, and the still now ships
 *                    with `data-src` (./lib/deferredImg.ts), so there is not
 *                    even an image behind it.
 *
 * Before this component was rendered, all three of those failed safe, because
 * `cine-on` simply never appeared. So the class is ARMED here rather than
 * asserted: `window.__cineHold` is set by the engine (useHeroFilm.ts:1185 when
 * the film runs, :1155 when `fail()` drops it) and is `undefined` only if
 * React never reached the film at all. The check is anchored on `load` plus
 * two seconds — `load` waits for every script to fetch and execute, including
 * the ones that 404, so a slow network merely delays the check instead of
 * tripping it, and the 100vh -> 800vh reflow this file exists to prevent
 * cannot come back on a phone that is merely slow.
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
  var disarm=function(){
    if(window.__cineHold!==undefined)return;
    var d=document.documentElement, c=document.getElementById('cine');
    var i=c&&c.querySelector('img[data-src]');
    if(i){var q=i.getAttribute('data-srcset');
      if(q)i.setAttribute('srcset',q);
      i.setAttribute('src',i.getAttribute('data-src'));
      i.removeAttribute('data-src');i.removeAttribute('data-srcset');}
    var v=c&&c.querySelector('video');
    if(v&&v.getAttribute('src')){try{v.removeAttribute('src');v.load();}catch(e){}}
    d.classList.remove('cine-on');d.classList.remove('to-hero');
  };
  var check=function(){setTimeout(disarm,2000);};
  if(document.readyState==='complete')check();
  else window.addEventListener('load',check,{once:true});
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

/* ─────────────────────────────────────────────────────────────────────────────
   THE MEDIA BOOT — the second parse-time script, and the one that decides how
   soon the film has bytes.

   ── the measurement ─────────────────────────────────────────────────────────
   `<video>` ships with no `src`: the band is unknown at build time, so baking
   one in would start a 24 MB desktop download on a phone. The engine picks the
   encode instead — but it does so from `sync()`, which runs from an effect
   gated on `enabled`, which is set from ANOTHER effect. That whole chain sits
   behind 621,339 bytes of JavaScript in eight chunks. On the S21 Ultra the
   chunks started at t=132ms, hydration burned two long tasks (98ms and 170ms
   in the in-page probe), and the film's first byte went out at t=568ms. The
   probe's `firstScrollAt` was 563ms — the visitor started scrubbing before the
   film had asked for a single frame.

   ── what this fixes ─────────────────────────────────────────────────────────
   Everything the React chain knows about which encode to fetch, an inline
   script sitting next to the element already knows: three media queries and a
   table of six URLs. Running it where the <video> is parsed puts the film's
   first byte at roughly t=90ms instead of t=568ms — ~480ms of extra buffering
   before the first scroll, against a `SPAN_MIN` of 4 seconds of contiguous
   buffer before the scrub is allowed to start at all.

   The band test is `pickBand()`'s, in the same order: phone wins over narrow,
   narrow over wide. `preload="auto"` replaces the markup's `preload="none"` at
   the same moment, because "none" is what stops the element fetching on its
   own.

   It also owns the OTHER half of the same decision — see ./lib/deferredImg.ts.
   When the film is off, the still <img> is the hero and this is what promotes
   it, so a reduced-motion visitor does not wait for hydration to see anything.

   ── the contract with attachFilmSource ──────────────────────────────────────
   `lib/filmSource.ts` skips its own `video.src = …; video.load()` when the
   element already carries this exact URL. Without that guard the head start is
   worse than useless: `load()` aborts the in-flight fetch and discards the
   buffer.
   ────────────────────────────────────────────────────────────────────────── */

export interface FilmMediaBootProps {
  /** [wide, tablet, phone] encode URLs, in `pickBand` order. */
  sources: readonly [string, string, string];
  /** [wide, tablet, phone] poster URLs, in `pickBand` order. */
  posters: readonly [string, string, string];
}

function mediaBoot(props: FilmMediaBootProps): string {
  const s = JSON.stringify(props.sources);
  const p = JSON.stringify(props.posters);
  return `(function(){try{
  var t=document.currentScript, bg=t&&t.parentNode; if(!bg)return;
  if(!document.documentElement.classList.contains('cine-on')){
    var i=bg.querySelector('img[data-src]');
    if(i){var q=i.getAttribute('data-srcset');
      if(q)i.setAttribute('srcset',q);
      i.setAttribute('src',i.getAttribute('data-src'));
      i.removeAttribute('data-src');i.removeAttribute('data-srcset');}
    return;
  }
  var v=bg.querySelector('video'); if(!v||!window.matchMedia)return;
  var b=matchMedia('(max-width:720px)').matches?2:matchMedia('(max-width:1120px)').matches?1:0;
  var S=${s},P=${p};
  if(P[b])v.poster=P[b];
  v.preload='auto';
  v.src=S[b];
}catch(e){}})();`;
}

/**
 * Render this as the LAST child of the element that holds the still `<img>`
 * and the `<video>` — it addresses them through `document.currentScript`'s
 * parent, so both must already be parsed when it runs.
 */
export function FilmMediaBoot(props: FilmMediaBootProps) {
  return <script dangerouslySetInnerHTML={{ __html: mediaBoot(props) }} />;
}

export default HeroFilmBoot;
