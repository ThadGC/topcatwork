# Stone Selection

## What it is

A material picker built as a **circular gallery**. Three tabs — Marble, Quartz, Granite — each
load a wheel of seven stone slabs arranged along a shallow arc, curving away toward the edges of
the screen. You can drag the wheel left and right, use the arrows, or click a slab to bring it
to the centre. A readout under the wheel names the selected stone and its supplier.

When the section first scrolls into view it plays an entrance: the slabs rise and fan open into
the arc.

Every slab is **procedurally generated marble** — no photography required.

## Where it sits

Position 5, between the Project Gallery and the Supplier Strip.

It is the *held* half of a handoff:

> **Stone Selection freezes on screen → the Process panel slides in from the right over it.**

The Supplier Strip sits inside the same sticky pin, hanging below the framed wheel. The sizing
for that handoff is specified in [Process.md](Process.md#the-stone-selection-handoff), because
the arriving section owns it. From this section's side, all that matters is:

- It must sit inside `.hold-wrap > .hold-pin`, with the Supplier Strip after it and a
  `.hold-veil` last.
- It must remain **interactive while frozen** — you can still drag the wheel while the Process
  panel is on its way in. (See Pitfalls.)

## Content

Three materials, seven stones each. Each stone needs a name, its material, a supplier, and a
marble *style key* that picks which procedural pattern to draw.

```js
const MATERIALS = {
  Marble:  [ {name:"Statuario Vena", mat:"Marble", sup:"Antolini",    stone:"statuario"}, /* …7 */ ],
  Quartz:  [ {name:"Statuario Nuvo", mat:"Quartz", sup:"Caesarstone", stone:"statuario"}, /* …7 */ ],
  Granite: [ {name:"Absolute Black", mat:"Granite",sup:"Levantina",   stone:"nerogold"},  /* …7 */ ],
};
let currentMat = 'Quartz';   // the tab that opens by default
```

**Marble** — Statuario Vena (Antolini), Bianco Carrara (Levantina), Nero Marquina (Compac),
Calacatta Oro (Noble Stone), Arabescato (Margraf), Emperador Dark (Ceralsio), Calacatta Viola
(Antolini).

**Quartz** — Statuario Nuvo (Caesarstone), Pearl Jasmine (Caesarstone), Et Marquina (Silestone),
Eternal Calacatta (Silestone), Calacatta Gold (Cimstone), Cloudburst (Caesarstone), Eternal Noir
(Silestone).

**Granite** — Absolute Black (Levantina), Steel Grey (Cimstone), Black Pearl (Cosentino), Silver
Cloud (Levantina), Kashmir White (Levantina), Star Galaxy (Cosentino), Colonial White
(Levantina).

Header copy:

- Eyebrow: `The collection`
- Title: `Choose your <em>stone</em>`
- Sub: `Drag through the collection — grab and sweep, or use the arrows.`
- Below the wheel: a `See the full selection` link.

## Images

**None required.** Each slab's face is a generated SVG:

```js
marble(styleKey, seed)   // styleKey ∈ statuario | carrara | nerogold | calacatta | emperador | eternal | goldveil
```

The `stone` field on each entry selects the pattern; the seed makes each slab unique. Seven
styles cover the range from pale, finely-veined marble through to dark stone with gold veining.

**If you later want real slab photography**, replace the generated SVG inside each slab with an
`<img>`:

- **Aspect ratio: portrait, roughly 3:4.**
- **Supply at least 900 × 1200px.**
- Shoot flat-on and evenly lit — the slabs are shown as flat cards, not in perspective.

Keep the generated marble as the fallback for any stone without a photo, so the wheel is never
half-empty.

## Markup

```html
<section class="section" id="stones">
  <div class="section-head rise">
    <span class="eyebrow">The collection</span>
    <h2 class="section-title">Choose your <em>stone</em></h2>
    <p class="section-sub">Drag through the collection — grab and sweep, or use the arrows.</p>
  </div>

  <div class="mat-tabs rise" id="matTabs">
    <button class="mat-tab" data-mat="Marble">Marble</button>
    <button class="mat-tab on" data-mat="Quartz">Quartz</button>
    <button class="mat-tab" data-mat="Granite">Granite</button>
  </div>

  <div class="wheel-wrap rise">
    <div class="wheel" id="wheel" aria-label="Slab selector" role="group"></div>
    <div class="wheel-ui">
      <button class="wbtn" id="prev" aria-label="Previous stone">‹</button>
      <div class="readout" id="readout"></div>
      <button class="wbtn" id="next" aria-label="Next stone">›</button>
    </div>
    <div class="full-link"><a href="#">See the full selection</a></div>
  </div>
</section>
```

## Layout & styling

```css
.wheel{
  position:relative;height:min(66vh,560px);
  display:flex;align-items:center;justify-content:center;
  touch-action:pan-y;      /* let the page scroll vertically while we take horizontal drags */
  user-select:none;
  overflow-x:clip;overflow-y:visible;
  cursor:grab;
}
.wheel .slab{position:absolute;/* transform written per frame */}
.wheel.entering .slab{
  transition:transform 1s var(--ease-slow),opacity .9s var(--ease-slow),filter .9s var(--ease-slow);
}
.wheel.gallery .slab{transition:box-shadow .55s var(--ease)}  /* rAF drives transform; only the shadow eases */
```

The material tabs are pill buttons; the active one carries `.on`. The readout below shows the
selected stone's name and supplier.

## Behaviour — the wheel

```js
const BEND         = 5;      // arc depth multiplier
const BEND_PX      = BEND*24;// how far the outer slabs curve away
const SCROLL_EASE  = 0.08;   // per-frame catch-up toward the target index
const SCROLL_SPEED = 1.4;    // drag-to-travel ratio
const LAND         = 3;      // index that sits centred when a wheel loads
```

Each slab's position is a function of its distance from the centre:

```js
const ax  = (i - current) * pitch;                 // horizontal offset from centre
const arc = R - Math.sqrt(Math.max(R*R - ax*ax, 0)); // depth along the arc
```

Slabs further from the centre sit further back on the arc, scaled down and dimmed, so the wheel
reads as circular rather than as a flat row.

`current` eases toward `target` each frame at `SCROLL_EASE`; the loop is a continuous
`requestAnimationFrame` while the section is active.

Interactions:

- **Drag** — pointer or touch, horizontal. `moved` is tracked so a drag doesn't fire a click.
- **Arrows** — step `target` by ±1.
- **Click a slab** — sets `target` to that slab's index, bringing it to the centre.
- **Material tabs** — swap `SLABS` to the new material, rebuild the nodes, and replay the
  entrance.

## Motion — the entrance

Triggered by an `IntersectionObserver` at `threshold: 0.55`, once:

1. **Prime** — slabs start low, small and dimmed.
2. **Rise** — they lift into the arc (`.entering`, 1s on `--ease-slow`).
3. **Fan** — they spread out to their arc positions, then the wheel hands over to the
   drag/scroll loop (`.gallery`) after ~1.9s.

Under `prefers-reduced-motion: reduce`, the entrance is skipped and the wheel starts settled.

## Responsive

- The wheel is `min(66vh, 560px)` tall, so it scales with viewport height.
- `touch-action:pan-y` keeps vertical page scrolling working on touch while horizontal drags
  are captured by the wheel.
- `overflow-x:clip` on the wheel keeps the outer slabs from widening the document.

## Accessibility

- The wheel is `role="group"` with `aria-label="Slab selector"`.
- Arrows carry `aria-label`s.
- The readout is live text, so the selected stone is announced.
- Material tabs are real `<button>`s.
- **Known gap:** slabs are not individually focusable. If keyboard selection of a specific stone
  is required, give each slab `tabindex="0"` and wire Enter/Space to the same handler as click.

## Pitfalls

**It must stay interactive while frozen.** The Process wrapper is pulled up over this section
and, being invisible, will swallow every drag and click meant for the wheel unless that wrapper
carries `pointer-events:none`. Symptom: the wheel simply stops responding once you have scrolled
far enough for the Process panel's runway to begin — which looks like a wheel bug but isn't.

**The Process panel must cover the full screen.** If it is shorter than `100vh`, this section
shows underneath it — the "See the full selection" link was visible below the Process cards.

**`overflow-x:clip`, not `hidden`, on the wheel.** `hidden` would create a scroll container and
break the sticky pin this section sits inside.

**Give each generated slab a distinct seed.** The marble SVGs use filter ids derived from the
seed; duplicate seeds across the page mean two slabs share a filter and one renders wrong. Keep
this section's seeds clear of the FAQ's and the reviews'.

**Don't fire a click at the end of a drag.** Track movement during the drag and suppress the
click if the pointer travelled more than a few pixels, or every sweep also selects a stone.
