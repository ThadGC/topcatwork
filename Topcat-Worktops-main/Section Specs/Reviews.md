# Reviews

## What it is

The most interactive section on the page, with two distinct modes:

**Grid mode (default)** — three review cards side by side, with arrows either side. Pressing an
arrow slides the visible three out and brings the next three in from the other side. The pager
wraps, so you can keep pressing either arrow forever. The three cards deal themselves in one at
a time when you scroll to the section, and ride back out if you scroll above it.

**Stack mode** — clicking any card drops the whole set into a physical stack with that review on
top and the rest clearly peeking out behind it. You can **drag the top card away in any
direction** to send it to the back, or click it to flip it and see the project photo behind the
review. An animated hand demonstrates the grab-and-throw once when you enter the mode, and the
top card moves with it. An "All reviews" button returns to the grid.

## Where it sits

Position 2, between the Hero and Services. A plain section in normal flow — no coupling to its
neighbours.

## Content

Six reviews. Each needs a quote, an attribution, and a project photo for the card back.

| # | Quote | Attribution |
|---|---|---|
| 1 | From the first visit to the final polish the whole thing was stress-free. Our kitchen is completely transformed. | Sarah M. · St Albans |
| 2 | The seam is basically invisible and the veining runs right through the island. Exactly what we'd envisioned. | James & Priya · Hertford |
| 3 | Clear quote, no hidden costs, and fitted within three days. Genuinely couldn't fault them. | Daniel O. · Enfield |
| 4 | They talked us through every material until we found the one — helpful the whole way, never pushy. | The Bellinghams · Welwyn |
| 5 | Absolutely beautiful workmanship. The island is the showpiece of the whole house now. | Aisha K. · Barnet |
| 6 | Meticulous from template to fit, and the waterfall edge is flawless. Worth every penny. | Rebecca T. · Potters Bar |

```js
const REVIEWS = [ { q:'…', a:'Sarah M. · St Albans', img:'<url>' }, /* …6 */ ];
```

Every card also shows a 5-star row and the source label `Google review`.

Header copy:

- Eyebrow: `What people say`
- Title: `Kitchens, <em>transformed</em>` — must sit on **one centred line**
- Sub: `Real words from real installs. Browse the wall below, then tap a review to read it and flip through the rest.`

## Images

**Six photos — one project shot per review**, shown on the *back* of the card when you flip it
in stack mode.

- **Aspect ratio ~3:2 landscape.** The card is `min(90vw,540px)` × `min(52vh,340px)` — about
  1.6:1 — filled with `object-fit:cover`.
- **Supply at least 1080 × 680px.**
- The front of the card is the quote on generated marble; only the back uses a photograph.

**If you don't supply images**, the back renders the generated `PHOTO TO COME` placeholder —
the prototype currently uses `phImg('PROJECT PHOTO')` for all six. Swap `img` per review when
the photography arrives; nothing else changes.

The card *front* uses procedural marble (`marble('goldveil', seed)`), not a photo — masked to
fade out radially so the quote stays readable. No image needed.

## Markup

```html
<section class="section mode-grid" id="reviews">
  <div class="section-head rise">
    <span class="eyebrow">What people say</span>
    <h2 class="section-title">Kitchens, <em>transformed</em></h2>
    <p class="section-sub">Real words from real installs…</p>
  </div>

  <div class="rev-backwrap">
    <button class="rev-back" id="revBack">← All reviews</button>
  </div>

  <div class="rev-stage" id="revStage">
    <div class="rev-deck" id="revDeck"><!-- cards injected --></div>
    <button class="rev-page prev" id="revPagePrev" aria-label="Previous reviews">‹</button>
    <button class="rev-page next" id="revPageNext" aria-label="Next reviews">›</button>
    <div class="rev-drag-cue" id="revDragCue" aria-hidden="true"><!-- hand icon --></div>
  </div>

  <div class="rev-ui">
    <button class="wbtn" id="revPrev" aria-label="Previous review">‹</button>
    <div class="rev-dots" id="revDots"></div>
    <button class="wbtn" id="revNext" aria-label="Next review">›</button>
  </div>
  <div class="rev-hint" id="revHint">Tap a review to open it</div>
</section>
```

Each card:

```html
<article class="rev" tabindex="0" data-i="0">
  <div class="rev-inner">
    <div class="rev-face front">
      <div class="rev-stone"><!-- marble svg --></div>
      <div class="rev-front">
        <div class="stars">★★★★★</div>
        <p class="quote">"…"</p>
        <div class="rev-author">Sarah M. · St Albans</div>
        <div class="rev-src">Google review</div>
      </div>
    </div>
    <div class="rev-face back">
      <div class="stone"><img src="…" alt=""></div>
      <div class="rev-back-veil"></div>
      <div class="rev-back-text">
        <span class="rb-label">The project</span>
        <span class="rb-auth">Sarah M. · St Albans</span>
        <span class="flip-hint">← Back to review</span>
      </div>
    </div>
  </div>
</article>
```

All six cards live in the deck permanently and are **positioned by transform** — mode changes
move them rather than adding or removing them.

## Layout & styling

```css
.rev-stage{position:relative;max-width:1320px;margin:0 auto;
  display:flex;align-items:center;justify-content:center;height:min(74vh,560px)}
.rev-deck{position:relative;width:min(90vw,540px);height:min(52vh,340px);transform-style:preserve-3d}

.rev{position:absolute;inset:0;perspective:1400px;cursor:grab;
  transition:transform .62s var(--ease),opacity .5s var(--ease)}
.rev.dragging{transition:none;cursor:grabbing;will-change:transform}
.rev.tossed  {transition:transform .42s var(--ease-2),opacity .42s var(--ease-2)}
.rev.tucking {transition:transform .6s var(--ease),opacity .5s var(--ease)}
.rev.entering{transition:transform .95s var(--ease)}   /* the long ride in */
.rev.leaving {transition:transform 1.15s var(--ease)}  /* slower ride out */

.rev-inner{position:absolute;inset:0;transform-style:preserve-3d;transition:transform .85s var(--ease)}
.rev.flipped .rev-inner{transform:rotateY(180deg)}
.rev-face{position:absolute;inset:0;border-radius:18px;overflow:hidden;backface-visibility:hidden;
  border:1px solid var(--hair-soft);background:linear-gradient(155deg,#15151b,#0e0e12)}
.rev-face.back{transform:rotateY(180deg)}
```

Mode is a class on the section (`.mode-grid` / `.mode-stack`) which drives:

```css
#reviews.mode-grid .rev{cursor:pointer}
#reviews.mode-grid .rev-ui{display:none}
#reviews.mode-grid .rev-face.back{display:none}   /* grid cards never flip */
#reviews.mode-grid .rev-inner{transform-style:flat} /* keeps scaled text crisp */
#reviews.mode-grid .quote{-webkit-line-clamp:5;display:-webkit-box;overflow:hidden}
#reviews.mode-grid .rev-backwrap{visibility:hidden}
```

### Pager arrows

```css
.rev-page{
  position:absolute;top:50%;transform:translateY(-50%);z-index:20;
  width:46px;height:46px;border-radius:50%;
  background:rgba(8,8,10,0.55);border:1px solid var(--hair);color:var(--bone);
  display:none;align-items:center;justify-content:center;cursor:pointer;
  backdrop-filter:blur(6px);
}
#reviews.mode-grid .rev-page{display:flex}
.rev-page.prev{left:-6px}    /* just outside the stage, so cards keep their width */
.rev-page.next{right:-6px}
.rev-page:hover{border-color:var(--gold);color:var(--gold)}
```

## Behaviour — grid mode

Three cards per page (one on screens under 720px, where three would be unreadable).

```js
function perPage(){ return window.innerWidth < 720 ? 1 : 3; }
```

Card sizing, recomputed on resize, `load`, and `document.fonts.ready`:

```js
const gap    = 16;
const availW = Math.min(window.innerWidth * 0.80, 1180);  // as wide as the arrows' clearance allows
let   GS     = (availW - (pp-1)*gap) / (pp*cardW);        // fit the row across
GS = Math.min(GS, (stageH*0.94)/cardH, 0.92);             // and inside the stage height, capped
```

Cards on the current page sit in a centred row; cards on any other page are parked off-screen
at `entryOff = window.innerWidth/2 + cellW/2 + 80`.

### Paging (wrapping)

```js
gridPage = (gridPage + d + pages) % pages;
```

Travel always runs the way you pressed — the outgoing page leaves *against* the direction of
travel and the incoming page arrives from the other side.

**With only two pages the same cards come straight back**, so a naive implementation slides them
back in from the side they just left and the carousel visibly shuttles instead of rotating. The
fix: once the outgoing page is off-screen, silently recycle it round to the incoming side with
transitions disabled, so the next press brings it in from the correct direction.

```js
// after the outgoing page has cleared (~1300ms)
revNodes.forEach((el,i)=>{ if(cardPage(i)!==gridPage) parkGridCard(i, d>0?1:-1, /*instant*/true); });
```

The arrows never disable — they only go inert if there is nothing to page to.

## Behaviour — stack mode

Clicking a grid card calls `selectCard(i)`: that review goes to the top and the rest fall in
behind it.

```js
const STEP = 30, VISIBLE = 4;
const dy = depth*STEP - (VISIBLE*STEP)/2;   // lift by half its own depth — see Pitfalls
const sc = 1 - depth*0.04;
el.style.transform = `translate3d(${depth?depth*11:0}px,${dy}px,0) scale(${sc}) rotate(${depth?TILT[depth%5]:0}deg)`;
el.style.opacity   = depth > VISIBLE ? 0 : 1;
```

`TILT = [-4, 2.5, -2, 3.5, -3]` — a gentle resting tilt per depth so it reads as a real stack.

### Dragging

- Drag the top card in **any direction**; the card follows with a slight rotation
  (`rotate(dx*0.045deg)`) and fades toward `0.35` as it travels.
- Release past `SENSITIVITY = 160px` and it is **sent to the back**: it carries on ~190px in the
  throw direction, shrinking to `scale(0.74)` and `opacity 0.35`, then after 300ms the stack
  re-lays out with it at the back.
- Release short of the threshold and it snaps home (`.tossed`, 0.42s).
- Click without dragging flips the top card to the project photo.
- The `‹ ›` buttons under the deck do the same as a throw (next) and lift the back card to the
  front (previous).

### The drag cue

On entering stack mode, a hand icon mimes grab → drag → release, three times, and **the top card
moves with it** (a 52px shove with a slight tilt, springing back).

```css
#reviews.mode-stack.cue-on .rev-drag-cue{animation:dragCue 3s var(--ease) .45s 3 both}
#reviews.mode-stack.cue-on .rev.top     {animation:cardCue 3s var(--ease) .45s 3 both}
#reviews.mode-stack .rev.top.dragging,
#reviews.mode-stack .rev.top.tossed,
#reviews.mode-stack .rev.top.tucking{animation:none}
```

`.cue-on` is set when the mode opens and **cleared by the first real interaction** — drag,
throw, or either arrow — so the demo can never fight the user. A CSS animation outranks the
inline transform the stack layout writes, and hands it straight back when it ends.

### Stack legibility

The cards behind are already fully opaque — what buries them is the top card's cast shadow and
their own near-invisible edge. In stack mode:

```css
#reviews.mode-stack .rev.top .rev-face{box-shadow:0 26px 54px -30px rgba(0,0,0,.82),0 0 0 1px var(--hair) inset}
#reviews.mode-stack .rev:not(.top) .rev-face{box-shadow:0 16px 38px -30px rgba(0,0,0,.65);border-color:rgba(201,162,78,0.32)}
```

Stack mode also **hides the section header** and trims the padding and stage height — without
that the section runs well past a laptop screen and the prev/next controls fall off the bottom.

```css
#reviews.mode-stack .section-head{display:none}
#reviews.mode-stack{padding-top:clamp(24px,4vh,56px)}
#reviews.mode-stack .rev-stage{height:min(58vh,500px)}
#reviews.mode-stack .rev-ui{margin-top:12px}
#reviews.mode-stack .rev-hint{margin-top:14px}
```

## Motion — the entrance

```js
const REV_ORDER      = [1,4,2,3,0,5];   // criss-cross across a page
const REV_PAGE_ORDER = [1,0,2];         // middle first, then the outer two
const REV_STEP_IN    = 140;             // ms between arrivals
const REV_STEP_OUT   = 200;             // leaving is slower
const REV_FROM       = [-1,-1,1,-1,1,1];// which side each card rides in from
```

Only the cards on the **current page** take part; the rest are parked by the pager.

| Direction | Line | Notes |
|---|---|---|
| In | stage top `≤ 0.74` × viewport, scrolling **down** | |
| Out | stage top `≥ 0.68` × viewport, scrolling **up** | |

Scroll direction decides which line applies, with a 6px deadband. The exit line was originally
0.32, which was only ~110px below the resting position — one wheel click emptied the entire
wall. At 0.68 it takes ~430px of deliberate upward scrolling.

## Responsive

- 3 cards per page above 720px, 1 below.
- Title forces one line only above 760px (`white-space:nowrap`), so it can still wrap on a phone.

## Accessibility

- Cards are `tabindex="0"`; Enter/Space selects in grid mode and flips in stack mode.
- Pager arrows and the stack controls have `aria-label`s.
- Under `prefers-reduced-motion: reduce`, the entrance is skipped — cards render seated — and
  the drag cue does not animate.

## Pitfalls

**Returning from the stack must force the seated state.** `gridLayout()` only seats cards when
the "has entered" flag is true, and the scroll watcher can flip that flag false while you are
reading the stack (its work is skipped in stack mode). Returning then parked the entire wall
off-screen and the reviews vanished. `backToGrid()` must assert `revEntered = true` and resync
the scroll baseline so a stale scroll direction can't immediately fire the exit either.

**Lift the stack by half its depth.** The stack grows downward; without the counter-shift the
whole thing hangs below the deck's centre and pushes the controls off the bottom of the screen.

**Recycle pages off-screen, or the carousel shuttles.** See Paging above.

**Re-measure on `load` and `fonts.ready`.** If the first layout pass runs before the page has
real dimensions, the card scale falls back to a hardcoded default and *nothing* recomputes it
until a window resize — leaving permanently undersized cards.

**Cancel in-flight entrance runs on reversal**, and clear any queued `.entering` removal at the
start of a new flight, or a quick in-out scroll leaves cards stranded or snapping.

**Keep the arrows clear of the cards.** They sit just outside the stage box (`left:-6px`), and
the card row width (`availW`) is set to leave them room. Overlapping arrows swallow card clicks.
