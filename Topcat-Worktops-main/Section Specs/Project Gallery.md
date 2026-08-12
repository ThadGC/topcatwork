# Project Gallery

## What it is

The most elaborate section on the page. An opaque panel that **rises up over the Services
section**, which freezes in place behind it. Inside, eight project cards perform a four-stage
scroll-driven choreography:

1. **Gather** — the cards fly in from the sides and pile into a loose stack.
2. **Column** — the stack fans out into a vertical column of four.
3. **Split** — the column parts into two pairs, one on each side wall.
4. **Walk** — you move forward down the "hallway": the near set swells and slides past your
   shoulders while the next four resolve out of the dark ahead, the cards folding open like
   double doors as you pass through them.

Clicking any settled card opens a **fullscreen project detail** with a hero, metadata, copy, an
image gallery and a lightbox.

## Where it sits

Position 4, between Services and Stone Selection. It is the arriving half of a handoff:

> **Services freezes on screen → the Gallery sheet climbs over it.**

## Content

Eight projects, each with a name, a location and a photo.

| # | Name | Location |
|---|---|---|
| 1 | Bookmatched Island | Hampstead |
| 2 | Waterfall Kitchen | Richmond |
| 3 | Full-height Splashback | Islington |
| 4 | Template & Fit | St Albans |
| 5 | Family Kitchen | Hertford |
| 6 | Bespoke Layout | Welwyn |
| 7 | Vein-matched Joins | Enfield |
| 8 | Clean Install | Barnet |

```js
const PROJECTS = [ { img:'<url>', name:'Bookmatched Island', place:'Hampstead' }, /* …8 */ ];
```

Two lines of centre copy appear between the walls, one per hallway segment — currently
placeholders, to be written:

- Segment 1 — eyebrow `The work`, line *"Placeholder — a line about the craft sits here…"*
- Segment 2 — eyebrow `And more`, line *"Placeholder — a second thought carries the next four…"*

The detail overlay also needs, per project: material, scope, completion date, a "What we did"
paragraph set, and a set of gallery images. Currently hardcoded placeholder copy.

Header copy:

- Eyebrow: `Recent work`
- Title: `Projects, <em>one by one</em>`
- Sub: `Eight kitchens. They gather as you scroll, then break out — click any project to open it.`

## Images

**This is the most image-hungry section.**

**1. Eight card images** — one per project.
- **Aspect ratio 3:2 landscape.** Card is `--cw` wide by `--ch = cw × 0.66`.
- **Supply at least 1200 × 800px.** Cards render up to ~520px wide, so 2× for retina.
- Filtered on the card to `saturate(0.86) brightness(0.84) contrast(1.02)`, returning to full
  on hover — supply un-graded originals.

**2. Detail hero image** — per project, used as a full-bleed background.
- **Supply at least 2000 × 1200px**, landscape. Safe area in the lower left for the title.

**3. Detail gallery images** — several per project, shown in the body and openable in a lightbox.
- **Supply at least 1600 × 1100px each.** Mixed orientation is fine.

**Until you supply them**, every slot renders the generated `PHOTO TO COME` placeholder
(`phImg('PROJECT PHOTO')`). The prototype currently borrows the Services and Process photos as
stand-ins for the eight cards — replace `PROJECTS[n].img` with the real shots.

## Markup

```html
<div class="gal-wrap" id="galWrap">
  <section id="gallery">
    <div class="section" style="padding-bottom:0">
      <div class="section-head rise">
        <span class="eyebrow">Recent work</span>
        <h2 class="section-title">Projects, <em>one by one</em></h2>
        <p class="section-sub">Eight kitchens. They gather as you scroll…</p>
      </div>
    </div>

    <div class="gal-scroll" id="galScroll">
      <!-- OUTSIDE the pin on purpose: scrolls at native speed for parallax -->
      <div class="gal-bg" aria-hidden="true">
        <div class="gal-bg-glow"></div>
        <div class="gal-bg-grid"></div>
        <span class="gal-bg-word w1">Quarry</span>
        <span class="gal-bg-word w2">Slab</span>
        <span class="gal-bg-word w3">Kitchen</span>
      </div>
      <div class="gal-pin">
        <div class="gal-stage" id="galStage">
          <div class="gal-hint" id="galHint">Click a project to open it</div>
          <!-- .gal-set blocks injected: 2 sets of 4 cards + centre copy -->
        </div>
      </div>
    </div>
  </section>
</div>

<!-- these two get re-parented to <body> at init — see Pitfalls -->
<div class="proj-detail" id="projDetail" aria-hidden="true">…</div>
<div class="proj-lightbox" id="projLightbox" aria-hidden="true">…</div>
```

Each card:

```html
<article class="gal-card" tabindex="0" role="button" aria-label="Bookmatched Island — Hampstead">
  <div class="gal-door">
    <img src="…" alt="Bookmatched Island — Hampstead" draggable="false">
    <div class="gal-veil"></div>
    <div class="gal-meta">
      <span class="gal-name">Bookmatched Island</span>
      <span class="gal-place">Hampstead</span>
    </div>
  </div>
</article>
```

**The card is only the positioning shell.** `.gal-door` inside it is the visible face, hinged on
the card's outer edge, and carries all the chrome so its swing is never clipped.

## Layout & styling

```css
.gal-wrap{position:relative;z-index:3;pointer-events:none}  /* margin-top set from JS */
#gallery{
  position:sticky;top:0;
  background:var(--ink);            /* opaque, or the held section shows through */
  border-radius:26px 26px 0 0;
  overflow:clip;                     /* clip, NOT hidden — hidden breaks the sticky pin */
  will-change:transform;
  pointer-events:auto;
}
.gal-wrap::after{content:"";display:block;height:100vh}  /* arrival runway */

.gal-pin{position:sticky;top:0;z-index:1;height:100vh;overflow:hidden}
.gal-stage{position:absolute;inset:0;perspective:1500px;perspective-origin:50% 50%}
.gal-set{position:absolute;inset:0;z-index:1;will-change:transform,opacity;pointer-events:none}
.gal-set.settled{pointer-events:auto}

.gal-card{
  position:absolute;left:50%;top:50%;
  width:var(--cw,420px);height:var(--ch,278px);
  margin-left:calc(var(--cw) / -2);margin-top:calc(var(--ch) / -2);
  perspective:1500px;will-change:transform,opacity;cursor:pointer;
}
.gal-door{position:absolute;inset:0;border-radius:14px;overflow:hidden;
  border:1px solid var(--hair-soft);background:var(--ink-2);
  box-shadow:0 34px 80px -30px rgba(0,0,0,0.92);will-change:transform}
```

### The lit leading edge

```css
#gallery::before{
  content:"";position:absolute;inset:0 0 auto;height:92px;z-index:40;pointer-events:none;
  border:1px solid rgba(201,162,78,0.55);border-bottom:none;border-radius:inherit;
  mask-image:linear-gradient(#000 18%,transparent);
}
```

### Card sizing

```js
cw = Math.min(stageW*0.36, stageH*0.52, 520);
ch = Math.round(cw*0.66);
rowS = ch*0.54;   // row pitch — same-side rows sit 2 pitches apart
```

## Motion — the panel arrival

Identical mechanism to the Process panel, but vertical.

```js
const ARRIVE_GLIDE = 0.85;   // rise completes at this share of the runway
const SCRUB        = 0.045;  // low, so the scene coasts after the wheel stops

const wt = -galWrap.getBoundingClientRect().top / vh;
qTarget  = clamp01(wt / ARRIVE_GLIDE);
// damped, then:
galSec.style.transform = `translateY(${(vh*(1-arrLag)).toFixed(2)}px)`;
```

## Motion — the card choreography

All positions are **derived, not tabled**. Each card's row is its index; its side alternates
(even → left, odd → right).

```js
const PER_SET = 4;                       // cards per hallway segment
const RUNWAY  = 5.5;                     // viewport heights of scroll (set on .gal-scroll)

const GATHER_FROM = 0.6, GATHER_TO = 2.3;  // gather window, in viewports of wrap travel
const COL_START   = 0.18, COL_END   = 0.30; // stack → column
const SPLIT_START = 0.33, SPLIT_END = 0.47; // column → side walls
const WALK_START  = 0.58, WALK_END  = 0.82; // forward down the hallway

const HALL_PAST = 1150;   // px a leaving set travels toward the camera
const HALL_FAR  = 1600;   // px down the corridor the next set waits
const WALL_TILT = 0;      // resting cards sit flat/head-on
const DOOR_ANG  = 78;     // deg a door reaches mid-pass
const DOOR_SPEED= 1.6;    // how early in the walk the doors finish opening
const PAIR_G    = 18;     // px between a side's two cards
const ROWF      = 0.54;   // row pitch as a fraction of card height
const SIDE_MARGIN = 0.035;// stage-width fraction left at each edge after the split
const STAGGER   = 0.15;   // how much of the gather separates each card's arrival
const STACK_TILT= [-3.4, 2.2, -1.4, 3.0];
const STACK_SC  = 1.18;   // the pile reads big before the cards fan out
```

Per-card entry variation — so cards sharing a side still travel along separate lines:

```js
const SLOTS = [
  {s:1.00, dir:-1, ord:0, ed:0.60, ey:-0.16},  // row 1 → splits left
  {s:0.94, dir:-1, ord:2, ed:0.92, ey: 0.20},  // row 2 → splits right
  {s:0.97, dir: 1, ord:1, ed:0.66, ey: 0.14},  // row 3 → splits left
  {s:0.92, dir: 1, ord:3, ed:1.00, ey:-0.22}   // row 4 → splits right
];
```

`s` = relative size, `dir` = side it flies in from, `ord` = arrival order, `ed` = start distance
(fraction of stage width), `ey` = entry height (fraction of stage height).

### The playhead

Scroll does **not** drive the scene directly — it sets a target, and a playhead eases toward it
each frame. Everything renders from the playhead. That lag is what makes the motion feel fluid
rather than welded to the wheel, and why the cards keep drifting after you stop scrolling.

```js
const f = 1 - Math.pow(1 - SCRUB, dt*60);   // frame-rate independent
gCur += (gTarget - gCur) * f;
pCur += (pTarget - pCur) * f;
```

The loop shuts itself off once caught up; a scroll event restarts it.

**The gather runs on the wrap's scroll position** — one continuous clock through the glide, the
settle park and the run-up to the pin. Keyed to the runway's viewport position instead, it
*stalls* during the settle park (a visible hitch right as the flight starts) and then compresses
the flight into too little scroll, so the cards move several times faster than the arrival glide.

### The walk

```js
const u = walk - setIndex;   // 0 = beside you, +1 = walked past, -1 = down the corridor
const z = u >= 0 ? u*HALL_PAST : u*HALL_FAR;
const opacity = u >= 0 ? clamp01((1-u)*3.2) : clamp01(1 + u*1.02);
const fold = smoothstep(clamp01(u * DOOR_SPEED));
const ry = -side * (WALL_TILT*split + (DOOR_ANG - WALL_TILT)*fold);
```

Cards are clickable only when their set is parked at the front **and** fully laid out
(`|u| < 0.05 && open > 0.96`) — never mid-move.

## The Services handoff

Services freezes while this sheet climbs over it. Sized on load, resize and `fonts.ready`:

```js
const vh = window.innerHeight;
const svcBottom = svcEl.offsetTop + svcEl.offsetHeight;
const below = pin.offsetHeight - svcBottom;
const tail = vh * 2;                       // must be ≥ vh × (1 + ARRIVE_GLIDE) = 1.85

tailEl.style.height     = tail + 'px';
galWrap.style.marginTop = -(tail + below) + 'px';
galWrap.style.paddingBottom = below + 'px';
pin.style.top = (vh - svcBottom) + 'px';
```

Structure: Services sits inside `.hold-wrap > .hold-pin`, with a `.hold-tail` after the pin.

## Responsive

- Card size derives from the stage, so it scales continuously.
- `.gal-bg` grid and ghost words are decorative and scale with the viewport.
- The detail overlay is a normal scrolling document at all widths.

## Accessibility

- Cards are `role="button"`, `tabindex="0"`, with `aria-label` "Name — Place"; Enter/Space opens.
- The detail overlay traps focus, closes on Escape, and sets `aria-hidden` when closed.
- Under `prefers-reduced-motion: reduce`: the arrival resolves immediately, the hallway walk
  becomes a plain vertical slide with no depth (`y = -u*vh*1.05`, `z = 0`), and the doors don't
  fold (`fold = 0`).

## Pitfalls

**The wrapper must not swallow clicks.** `.gal-wrap` is pulled up over Services and paints above
it. Invisible or not, it captures every pointer event over its area — the Services cards were
only clickable in a 12px sliver at the top. `pointer-events:none` on the wrap, `auto` on
`#gallery`.

**Re-parent the fixed overlays to `<body>`.** `#projDetail` and `#projLightbox` are
`position:fixed`, but `<main>` has its own stacking context *and* `#gallery` carries a permanent
transform — a transformed ancestor becomes the containing block for fixed children and pins them
to the section instead of the screen. Move both to `<body>` at init.

**Never remove the sheet's transform.** Always write `translateY(0px)` at rest. Toggling the
property off demotes the layer and lands as a visible hitch at both the start and end of the
glide.

**`overflow:clip`, not `hidden`.** `hidden` makes the element a scroll container and breaks the
sticky pin inside it.

**Clamp the frame delta both ways.** A backwards timestamp makes the damping *diverge* instead
of settle: `Math.min(Math.max((now-last)/1000, 0), 0.1)`.

**The tail must outlast the glide.** The pin starts sticking a viewport before the sheet begins
rising; a one-viewport tail runs out mid-climb and Services scrolls away behind the sheet.

**Prefer `pipeline`-style independent stages over barriers in the choreography** — the beats
(gather → column → split → walk) must not overlap, or the fan grabs a card mid-flight.
