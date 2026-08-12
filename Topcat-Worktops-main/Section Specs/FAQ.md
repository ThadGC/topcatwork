# FAQ

## What it is

Six questions laid out as marble slabs in a 3 × 2 grid, sized so the heading and all six slabs
fit on one screen with nothing cut off. Each slab shows a number, a category tag and the
question. Clicking a slab **flips it over**: the back carries the question again, small, above a
gold hairline, with the answer beneath it.

The slabs are not there when you arrive — they ride in from the sides one at a time in a
criss-cross order, and ride back out the same way if you scroll above the grid.

The marble is generated procedurally, so **this section needs no photography at all**.

## Where it sits

Position 10, between Meet the Team and the Final CTA. It is a plain section in normal flow —
no coupling to its neighbours.

## Content

Six question/answer pairs, each with a short category tag.

| # | Tag | Question | Answer |
|---|---|---|---|
| 01 | Materials | Will the slab match the sample I saw? | Natural stone varies — that is its beauty. Before a single cut is made, you approve your exact slab, so the veining you fall in love with is precisely what is installed. |
| 02 | Craftsmanship | Will I be able to see the seams? | Seams are positioned with intent and vein-matched so the pattern flows across every join. Most of our clients cannot find them once the worktop is installed. |
| 03 | Pricing | Are there any hidden costs? | None. Your quote covers templating, precision cutting and installation, itemised in full before any work begins. The price we agree is the price you pay. |
| 04 | Process | How long does installation take? | From templating to installation is typically three days. One visit to laser-measure your kitchen to the millimetre, then our fitters install the finished worktop. |
| 05 | Peace of mind | Who will be coming into my home? | Our own vetted installation team, with a named contact who keeps you informed at every stage. Professional, respectful of your home, and gone before you know it. |
| 06 | Safety | Is an engineered stone worktop safe? | Completely. A finished, sealed worktop poses no silica risk in the home — the precautions apply to cutting, which our fabrication partners carry out to full safety standards. |

```js
const FAQS = [ { tag:'Materials', q:'…', a:'…' }, /* …6 total */ ];
```

Header copy:

- Eyebrow: `Frequently asked`
- Title: `Answers, set <em>in stone</em>`
- Sub: `Scroll through the slabs — tap one to reveal its answer.`

> Note: the sub still says "scroll through" from an earlier design. Reword to something like
> *"Tap a slab to reveal its answer."*

## Images

**None.** Every slab face is procedurally generated marble — an inline SVG of veining drawn
from a numeric seed, so each slab is unique and nothing needs downloading.

```js
marbleSVG(seed)   // returns an <svg class="marble"> string
```

Each slab uses `seed = 137 + i*61 + 7` on the front and `seed + 37` on the back, so the two
faces are different stone rather than a mirror image. Keep the seeds well clear of other
sections' so no two slabs on the page share an SVG filter id.

If you later want real slab photography instead, replace the `marbleSVG()` call inside each
face with an `<img>` at **3:2 landscape**, `object-fit:cover` — but the generated marble is the
intended look.

## Markup

```html
<section class="faq-section" id="faq">
  <div class="faq-header">
    <div class="faq-eyebrow">Frequently asked</div>
    <h2 class="faq-title">Answers, set <em>in stone</em></h2>
    <p class="faq-sub">Tap a slab to reveal its answer.</p>
  </div>
  <div class="stack-outer" id="stackOuter">
    <div class="stack-pin" id="stackPin"><!-- slab cells injected here --></div>
  </div>
</section>
```

Each slab is wrapped in a cell — **the cell carries the entrance, the slab carries the flip**:

```html
<div class="slab-cell" style="--fi:0">
  <div class="slab" role="button" tabindex="0" aria-expanded="false" aria-label="…">
    <div class="slab-inner">
      <div class="slab-face front">
        <svg class="marble">…</svg>
        <div class="slab-content">
          <div class="slab-meta"><span class="num">01 / 06</span><span>Materials</span></div>
          <h3 class="slab-q">Will the slab match the sample I saw?</h3>
          <div class="slab-hint"><span class="ring">+</span><span class="label">Reveal answer</span></div>
        </div>
      </div>
      <div class="slab-face back">
        <svg class="marble">…</svg>
        <div class="slab-content">
          <h3 class="slab-q">Will the slab match the sample I saw?</h3>
          <div class="slab-inlay"></div>
          <p class="slab-a">Natural stone varies…</p>
          <div class="slab-hint"><span class="ring">×</span><span class="label">Back</span></div>
        </div>
      </div>
    </div>
  </div>
</div>
```

## Layout & styling

### Sizing — the whole section on one screen

The slab height is derived from the **viewport**, not from the slab's own width. This is the
single most important decision in the section: width-based sizing overflows on short screens.

```css
.faq-section{
  --slabH:clamp(150px,calc((100vh - 300px) / 2),300px);
  --gold-soft:#d8bc7a;
}
```

`300px` covers the heading, the row gap and breathing room; the rest is split between the two
rows. Result: 210px slabs on a 720px-tall screen, 300px on 900px — fitting in both cases with
~110px to spare.

```css
.faq-section .faq-header{
  max-width:1060px;margin:0 auto;padding:0 28px clamp(24px,4vh,56px);
  text-align:center;
}
.faq-section .stack-pin{
  position:relative;
  max-width:1600px;margin:0 auto;padding:0 clamp(20px,4vw,48px);
  display:grid;grid-template-columns:repeat(3,1fr);gap:20px;align-items:start;
}
```

### The flip

```css
.faq-section .slab{
  position:relative;width:100%;height:var(--slabH);
  cursor:pointer;perspective:1400px;
  transition:transform .45s var(--ease);
}
.faq-section .slab:hover{transform:translateY(-4px)}

.faq-section .slab-inner{
  position:absolute;inset:0;
  transform-style:preserve-3d;
  transition:transform .8s cubic-bezier(.4,0,.2,1);
}
.faq-section .slab.open .slab-inner{transform:rotateY(180deg)}

.faq-section .slab-face{
  position:absolute;inset:0;overflow:hidden;background:#100f0b;
  backface-visibility:hidden;-webkit-backface-visibility:hidden;
}
.faq-section .slab-face.back{transform:rotateY(180deg)}
```

**The slab height never changes on open.** That is deliberate — an expanding slab reflows the
grid and shoves the second row around.

Face treatments: a polish sheen (`linear-gradient(115deg,…)` at low opacity) and a 1px warm
arris highlight along the top edge.

### Content within each face

```css
.faq-section .slab-content{
  position:absolute;inset:0;z-index:4;
  display:flex;flex-direction:column;
  padding:clamp(18px,1.6vw,28px) clamp(22px,1.9vw,34px);
}
.faq-section .slab-q{
  font-family:var(--serif);font-weight:600;
  font-size:clamp(20px,1.75vw,28px);line-height:1.18;color:#fff;
  text-shadow:0 1px 2px rgba(0,0,0,.7),0 -1px 0 rgba(0,0,0,.3);
  max-width:15em;
}
/* FRONT: question centred between meta and prompt */
.faq-section .slab-face.front .slab-q{margin-top:auto;margin-bottom:auto}

/* BACK: question small at the top, answer beneath */
.faq-section .slab-face.back .slab-q{
  font-size:clamp(14px,1.05vw,17px);line-height:1.3;margin:0;
  max-width:none;color:var(--gold-soft);
}
.faq-section .slab-inlay{height:1px;width:72px;background:var(--gold);margin:10px 0 12px;opacity:.85;flex:none}
.faq-section .slab-a{
  font-size:clamp(13px,0.95vw,15.5px);line-height:1.58;color:#f2eee6;margin:0;
  overflow:auto;              /* a very long answer scrolls rather than spilling */
}
.faq-section .slab-face.back .slab-hint{margin-top:auto}
```

## Behaviour

- **Click, Enter or Space** toggles `.open`, flipping the slab.
- **Accordion** — opening one slab closes any other that is open.
- `aria-expanded` tracks the state.

## Motion — the staggered entrance

Driven by JavaScript timers rather than CSS delays, because the entrance reverses and a fast
reversal has to cancel a run already in flight.

```js
const FAQ_ORDER    = [1,4,2,3,0,5];   // criss-cross, so it never scans as a sweep
const FAQ_STEP_IN  = 140;             // ms between arrivals
const FAQ_STEP_OUT = 170;             // leaving is slower
const FAQ_FROM     = [-1,1,1,-1,-1,1];// which side each slab rides in from
```

```css
.faq-section .slab-cell{transition:transform .55s var(--ease);will-change:transform}
.faq-section .slab-cell.entering{transition:transform .95s var(--ease)}
.faq-section .slab-cell.leaving {transition:transform 1.05s var(--ease)}
```

Each cell is parked fully off its own side, measured individually:

```js
const off = FAQ_FROM[i] < 0 ? -(rect.right + 90) : (window.innerWidth - rect.left + 90);
cell.style.transform = `translateX(${off}px) rotate(${FAQ_FROM[i]*3}deg)`;
```

The 3° lean into the travel straightens as the slab lands.

### Triggers

| Direction | Line | Notes |
|---|---|---|
| In | grid top `≤ 0.72` × viewport, scrolling **down** | |
| Out | grid top `≥ max(0.45×vh, vh − rowHeight − 30)`, scrolling **up** | ~0.65 of the viewport in practice |

Scroll direction decides which line applies, with a 6px deadband so jitter can't flip it.

**Why the exit line is so low:** it originally sat at 0.30 of the viewport, where the grid was
still fully on screen — from mid-section a single wheel click was enough to clear all six at
once. Deriving it from the row height means the grid has to slide back down until its top row
is itself leaving the bottom of the screen, which takes real scrolling (roughly 3× more).

## Responsive

| Width | Columns |
|---|---|
| > 1000px | 3 |
| ≤ 1000px | 2 |
| ≤ 640px | 1, and `--slabH:215px` |

## Accessibility

- Slabs are `role="button"`, `tabindex="0"`, with `aria-expanded` and an `aria-label` carrying
  the question.
- Under `prefers-reduced-motion: reduce`: the entrance is skipped (cells render in place) and
  the flip is instant (`.slab-inner{transition:none}`).

## Pitfalls

**Size the slab from the viewport, not its width.** Width-based sizing (`19.5vw`) looked fine on
a wide monitor and overflowed the screen on a laptop, cutting off the bottom row.

**The mobile height override must target `.faq-section`, not `:root`.** `--slabH` is declared on
`.faq-section`, so a `:root` override never applies — this silently did nothing for a long time.

**Keep the entrance and the hover on different elements.** The cell owns the entrance transform;
the slab owns the hover lift. Put both on one element and the entrance's resting state — being
more specific — silently kills the hover.

**Cancel in-flight runs on reversal.** Without clearing the pending timers, a quick scroll
down-then-up leaves slabs stranded off-screen.

**Don't let a queued "hand-back" strip the long glide.** Each arrival schedules the removal of
its `.entering` class ~1s later. If a new flight starts before that fires, it strips the long
transition mid-travel and the movement snaps. Clear the pending timeout at the start of every
placement.

**Check the back face fits, not just the section.** Shortening the slabs is limited by the
longest answer, not by the layout. At 720px tall the longest answer leaves only ~20px of spare
room inside the back face — verify against the real copy before reducing `--slabH` further.
