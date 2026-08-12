# Process

## What it is

Structurally identical to Services — a centred heading over four click-to-flip photo cards —
but with two differences that give it its own character:

1. **The whole panel slides in from the right.** It is a sticky panel pinned to the top of the
   screen; as you scroll, JavaScript slides it left into place over the frozen Stone Selection
   section behind it, with a lit gold hairline running down its leading edge.
2. **The cards rise from below**, staggered left to right, once the panel has landed — rather
   than dealing in from the side the way the Services cards do.

The panel fills the whole screen, so nothing of the section behind shows past it.

## Where it sits

Position 7, after the Supplier Strip. It is the arriving half of a two-part handoff:

> **Stone Selection freezes on screen → the Process panel slides in from the right over it.**

The Stone Selection section (and the Supplier Strip beneath it) are held in a sticky pin and
dimmed by a veil while this panel arrives. The sizing that makes that work is specified here,
because this section owns it.

## Content

Four steps. Each needs a title, a one-line summary for the card front, a longer paragraph for
the back, and a photo.

| # | Title | Front summary | Back copy |
|---|---|---|---|
| 01 | Consultation | Understanding your space and style. | We start at your kitchen — understanding the space, how you live in it, and the look you're after — then guide you to the material and finish that fit, with no pressure and no jargon. |
| 02 | Design & Quote | A clear, itemised plan and price. | We plan the layout, edge profiles, joins and cut-outs, then give you a clear, itemised quote covering template, fabrication and installation — the price you see is the price you pay. |
| 03 | Template & Craft | Measured and cut to the millimetre. | Once your units are level we laser-template the space to a fraction of a millimetre. Your slab is then precision-cut and polished to that template, with veining matched across every join. |
| 04 | Install & Enjoy | Fitted cleanly, usually within days. | Our team fits your worktop cleanly and precisely, usually within days of templating — squared, sealed and ready to use. Then the kitchen is yours to enjoy. |

Same data shape as Services (`t`, `d`, `long`, `img`).

Header copy:

- Eyebrow: `How it works`
- Title: `A process without <em>surprises</em>`
- Sub: `From first visit to finished worktop — four simple steps. Click a card for the detail.`

## Images

**Four photos, one per step.** Identical requirements to Services: **4:5 portrait**, supply at
least **800 × 1000px**, used on both card faces, `object-fit:cover`.

Omit `img` and the generated `PHOTO TO COME` placeholder stands in — see
[Services.md](Services.md#images) for how that works. It's the same helper.

## Markup

```html
<div class="proc-wrap" id="procWrap">
  <section class="section" id="process">
    <div class="section-head rise">
      <span class="eyebrow">How it works</span>
      <h2 class="section-title">A process without <em>surprises</em></h2>
      <p class="section-sub">From first visit to finished worktop — four simple steps. Click a card for the detail.</p>
    </div>
    <div class="services-grid" id="svcGrid"></div>
  </section>
</div>
```

The cards are the same `.svc` flip-card markup as Services.

The wrapper matters: `.proc-wrap` provides the scroll runway the sticky panel travels through,
via a content spacer (not padding — a sticky element can only travel inside its parent's
*content* box).

## Layout & styling

```css
.proc-wrap{position:relative;z-index:2;overflow-x:clip;pointer-events:none}
.proc-wrap::after{content:"";display:block;height:100vh}   /* the arrival runway */
#process{pointer-events:auto}

#process{
  position:sticky;top:0;
  background:var(--ink);            /* opaque, or the page shows through as it slides */
  border-radius:26px 0 0 26px;      /* rounds the LEADING edge */
  will-change:transform;

  /* pinned to the viewport, so the whole composition must fit one screen */
  padding-top:clamp(40px,6vh,96px);
  padding-bottom:clamp(32px,4.5vh,76px);
  min-height:100vh;
  display:flex;flex-direction:column;justify-content:center;
}

/* flex items with margin:0 auto do NOT stretch — see Pitfalls */
#process .section-head,#process .services-grid{width:100%}

#process .section-head{margin-bottom:clamp(24px,3.4vh,50px)}
#process .section-title{font-size:clamp(30px,3.8vw,52px);margin-bottom:14px}
#process .section-sub{max-width:56ch}

/* cards take height from column WIDTH, so cap them against the viewport on short screens */
#process .svc{max-height:calc(100vh - 360px)}
```

### The lit leading edge

A gold hairline down the left edge — the edge that leads as the panel travels right-to-left.
It is the Project Gallery's leading edge rotated a quarter turn.

```css
#process::before{
  content:"";position:absolute;inset:0 auto 0 0;width:92px;z-index:40;pointer-events:none;
  border:0;border-left:1px solid rgba(201,162,78,0.55);
  border-radius:inherit;
  mask-image:linear-gradient(90deg,#000 18%,transparent);
  -webkit-mask-image:linear-gradient(90deg,#000 18%,transparent);
}
```

The 92px band with a sideways mask makes the line read as *lit* rather than as a border — it is
solid at the leading edge and fades away behind it. **Left border only** — adding top and bottom
borders draws visible rails along the panel's edges.

## Motion — the panel arrival

A damped, scroll-driven slide. The panel is sticky, so while it is pinned the browser never
moves it and JavaScript owns 100% of its motion — which is what keeps it free of the
native-scroll judder you get trying to correct a normally-scrolling element frame by frame.

```js
const ARRIVE = 0.85;   // glide completes at this share of the runway
const SCRUB  = 0.09;   // per-frame catch-up at 60fps

// progress through the runway, in viewports
const wt = -wrap.getBoundingClientRect().top / window.innerHeight;
target = clamp01(wt / ARRIVE);

// frame-rate independent damping
const f = 1 - Math.pow(1 - SCRUB, dt * 60);
lag += (target - lag) * f;

// ALWAYS a transform — translateX(0) at rest, never removed (see Pitfalls)
sec.style.transform = `translateX(${(window.innerWidth * (1 - lag)).toFixed(2)}px)`;
veil.style.opacity  = (lag * 0.62).toFixed(3);   // dims the stones behind
```

Run the loop on `requestAnimationFrame`, started by a `scroll` listener, and let it stop itself
once `lag === target` so nothing spins while the page is idle.

| Value | Setting |
|---|---|
| Start position | one viewport to the right (`translateX(100vw)`) |
| Glide completes at | 85% of the runway; the remaining 15% is settle margin |
| Damping | `SCRUB 0.09` per frame at 60fps |
| Runway length | `100vh` (the `.proc-wrap::after` spacer) |
| Veil over the stones | `0 → 0.62` opacity, tracking arrival progress |

## Motion — the card stagger

The cards rise from below as the panel lands.

```css
.svc.proc-rev{
  opacity:0;transform:translateY(96px) scale(0.955);
  transition:transform .75s var(--ease),opacity .55s var(--ease);
  transition-delay:calc(var(--ri,0) * var(--revStagger,170ms));
}
.svc.proc-rev.revealed{opacity:1;transform:none}
```

| Value | Setting |
|---|---|
| Rise distance | `96px`, with a `0.955 → 1` scale |
| Stagger | `170ms` × column index (`0 / 0.17 / 0.34 / 0.51s`) |
| Rise duration | `.75s` |
| Trigger on | wrap progress `> 0.78` (panel essentially landed) |
| Trigger off | wrap progress `< 0.55` (hysteresis) |

**The trigger runs off the wrapper's scroll progress, not the grid's viewport position.** The
panel is sticky, so the grid sits at a *fixed* height for the entire arrival and a position-based
trigger never fires — it would only trip once the pin released and the section was already
leaving. Use the same clock as the panel arrival.

## The Stone Selection handoff

The stones freeze while this panel arrives. Sizing, run on load, resize and `document.fonts.ready`:

```js
const vh = window.innerHeight;
const stonesBottom = stonesEl.offsetTop + stonesEl.offsetHeight;  // within the pin
const stripH = pin.offsetHeight - stonesBottom;   // supplier strip hanging below the frame
const tail = vh * 2;

tailEl.style.height   = tail + 'px';
wrap.style.marginTop  = -(tail + stripH) + 'px';  // pull the panel up over the freeze
wrap.style.paddingBottom = stripH + 'px';         // hand that space back to the NEXT section
pin.style.top = (vh - stonesBottom) + 'px';       // freeze framed on the stones
```

Structure:

```html
<div class="hold-wrap" id="stonesHold">
  <div class="hold-pin" id="stonesHoldPin">
    <!-- Stone Selection section -->
    <!-- Supplier Strip section -->
    <div class="hold-veil" id="stonesVeil" aria-hidden="true"></div>
  </div>
  <div class="hold-tail" aria-hidden="true"></div>
</div>
<!-- .proc-wrap immediately follows -->
```

```css
.hold-wrap{position:relative;z-index:1}
.hold-pin{position:sticky;top:0}   /* real top set from JS — can be negative */
.hold-veil{position:absolute;inset:0;z-index:200;pointer-events:none;background:var(--ink);opacity:0}
.hold-tail{}                        /* height set from JS */
```

**The tail must be two viewports, not one.** The pin starts sticking as soon as the stones are
framed, which is a full viewport *before* the panel begins its slide. A one-viewport tail runs
out mid-arrival and the stones visibly scroll away behind the panel. The requirement is
`tail ≥ vh × (1 + ARRIVE)` = 1.85 viewports; 2 leaves margin.

## Responsive

Inherits the Services grid breakpoints — 4 columns, 2 at ≤1100px, 1 at ≤600px. The panel's
padding and type scale with viewport height so the composition keeps fitting one screen.

## Accessibility

Same as Services: cards are focusable, Enter/Space flips them, images carry the step title.

Under `prefers-reduced-motion: reduce`, the cards render in place with no stagger. The panel
arrival should also resolve immediately (`target = 1`).

## Pitfalls

**Flex items with `margin:0 auto` do not stretch.** Making `#process` a flex column to centre
its content caused the card grid — which centres itself with `margin:0 auto` — to shrink to its
content instead of filling the section. Its `1fr` columns then had nothing to resolve against
and collapsed to `0px`, so the cards became 0×0 and vanished entirely. The fix is
`#process .section-head, #process .services-grid { width:100% }`.

**The panel must be at least `100vh`.** Anything shorter and the held stones show underneath it
— their "see full selection" link was visible below the cards.

**Never remove the transform.** Toggling `transform` off at rest demotes the compositor layer
and lands as a visible hitch. Always write `translateX(0px)`, never clear the property.

**Clip the wrapper horizontally.** The parked panel sits a full viewport to the right; without
`overflow-x:clip` on `.proc-wrap` the document becomes twice as wide and the whole site slides
sideways.

**The wrapper must not swallow clicks.** `.proc-wrap` is pulled up over the Stone Selection and
would block dragging the stone wheel. `pointer-events:none` on the wrapper, `auto` on `#process`.

**Card height comes from column width.** With `aspect-ratio:4/5` the cards don't shrink on a
short-but-wide window, and the row overran the pinned panel. `max-height:calc(100vh - 360px)`
caps them — inert on tall screens, and it only gives way when height is scarce.
