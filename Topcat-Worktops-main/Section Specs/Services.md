# Services

## What it is

A centred heading over a row of four cards, one per service. Each card is a photo with the
service name and a one-line summary over it; clicking a card flips it to reveal a longer
description on the back.

The cards are not present when you arrive. As the grid scrolls into view they **deal in one at
a time from the right**, each sliding into its slot with the next following about a sixth of a
second behind. Scroll back up above the grid and they leave again the same way, so the entrance
replays every time you come to it.

The section itself does not move — all the motion belongs to the cards. It is a plain section
in normal document flow.

## Where it sits

Position 3, between Reviews and the Project Gallery.

It has one coupling: **the Project Gallery is pulled up over it and freezes it in place.** From
this section's point of view nothing needs doing — the mechanism lives entirely in the Gallery
spec — but be aware that the Services cards are deliberately still on screen, frozen, while the
Gallery sheet climbs over them. That means:

- The cards must remain clickable while frozen (see Pitfalls).
- Don't add a bottom margin expecting empty space after this section; the Gallery overlaps it.

## Content

Four services. Each needs: a short title, a one-line summary for the card front, a longer
paragraph for the card back, and a photo.

| # | Title | Front summary | Back copy |
|---|---|---|---|
| 01 | Bespoke Worktops | Cut to your kitchen from a single slab, vein-matched throughout. | Your worktop is cut from a single slab and shaped to your kitchen, with veining matched across every join so the surface reads as one continuous piece. We guide the detail from slab selection through to the finished fit. |
| 02 | Islands & Waterfall | Mitred edges that fold the stone down to the floor. | Mitred waterfall edges fold the stone down to the floor for a solid, architectural island. The veining is planned around each corner so the pattern flows unbroken down the sides. |
| 03 | Splashbacks | Run the surface up the wall for seamless continuity. | Carry the same stone up the wall for a seamless, vein-matched finish — no grout lines and no visual break between the worktop and the wall behind it. |
| 04 | Template & Fit | Laser-templated to a fraction of a millimetre, fitted in days. | We laser-template your kitchen once the units are level, capturing every measurement precisely, then fit the finished worktop ourselves — cleanly, and usually within days. |

Data shape:

```js
const SERVICES = [
  { t:"Bespoke Worktops",       // title
    d:"Cut to your kitchen…",   // front summary (one line)
    long:"Your worktop is cut…",// back copy
    img:"<url or data-uri>" },  // optional — see Images
  // …4 total
];
```

Header copy:

- Eyebrow: `What we do`
- Title: `Craft that lives in the <em>detail</em>`
- Sub: `Four things we do, end to end. Click a card to read what's involved.`

## Images

**Four photos, one per service.**

- **Aspect ratio 4:5 portrait.** The card is `aspect-ratio:4/5` and the image fills it with
  `object-fit:cover`, so anything not 4:5 will be cropped centrally.
- **Supply at least 800 × 1000px** (cards render ~271 × 338 at a 1280px viewport, ~430 × 538 on
  a wide screen; 2× that for retina).
- The same image is used on both faces of the card — front (dimmed behind the text) and back.
- Front face shows the image at `opacity:0.5` under a bottom-weighted dark veil, brightening to
  `opacity:0.64, scale(1.13)` on hover.

**If you don't supply an image**, leave `img` off the data object and the card renders a
generated SVG placeholder — a dark panel with a picture icon, the service name, and the words
`PHOTO TO COME`. It is a real image (a data-URI), so layout and cropping behave exactly as they
will with the final photo. Swap `img` in later with no other changes.

```js
const img = s.img || phImg(s.t.toUpperCase());
```

## Markup

```html
<section class="section" id="services">
  <div class="section-head rise">
    <span class="eyebrow">What we do</span>
    <h2 class="section-title">Craft that lives in the <em>detail</em></h2>
    <p class="section-sub">Four things we do, end to end. Click a card to read what's involved.</p>
  </div>
  <div class="services-grid" id="svcGridServices"></div>
</section>
```

Cards are generated into `.services-grid`. Each card:

```html
<article class="svc" tabindex="0">
  <div class="svc-inner">
    <div class="face front">
      <div class="stone"><img src="…" alt="Bespoke Worktops"></div>
      <div class="veil"></div><div class="sheen"></div>
      <div class="front-text">
        <div class="idx">01</div>
        <div class="ft-bottom">
          <h3>Bespoke Worktops</h3>
          <p class="desc">Cut to your kitchen from a single slab…</p>
          <span class="flip-hint">↻ Click for details</span>
        </div>
      </div>
    </div>
    <div class="face back">
      <div class="stone"><img src="…" alt=""></div>
      <div class="veil"></div>
      <div class="back-text">
        <div class="idx">01</div>
        <h3>Bespoke Worktops</h3>
        <p>Your worktop is cut from a single slab…</p>
        <span class="flip-hint">← Back</span>
      </div>
    </div>
  </div>
</article>
```

## Layout & styling

```css
#services{position:relative;z-index:1;overflow-x:clip}

.services-grid{
  max-width:1600px;margin:0 auto;
  display:grid;gap:18px;grid-template-columns:repeat(4,1fr);
}

.svc{
  position:relative;aspect-ratio:4/5;min-width:0;
  perspective:1800px;cursor:pointer;
  transition:transform .7s var(--ease);
  transform-origin:50% 88%;
}
.svc-inner{position:absolute;inset:0;transform-style:preserve-3d;transition:transform 1s var(--ease)}
.svc.flipped .svc-inner{transform:rotateY(180deg)}

.face{
  position:absolute;inset:0;border-radius:14px;overflow:hidden;
  backface-visibility:hidden;
  border:1px solid var(--hair-soft);background:var(--ink-2);
  box-shadow:0 20px 50px -30px rgba(0,0,0,0.9);
}
.face.back{transform:rotateY(180deg)}
```

Front face treatment: image at `opacity:0.5`, a `to top` dark veil, and a diagonal `sheen`
gradient parked off-screen left that sweeps across on hover.

Hover (front only, never while flipped):

```css
.svc:not(.flipped):hover .face.front .stone{opacity:0.64;transform:scale(1.13)}
.svc:not(.flipped):hover .face.front .veil{opacity:0.82}
.svc:not(.flipped):hover .sheen{transform:translateX(120%)}
.svc:not(.flipped):hover .face.front{box-shadow:0 34px 64px -30px rgba(0,0,0,0.95),0 0 0 1px var(--hair) inset}
```

Type inside the card scales off the card width so it stays in proportion when the card shrinks:
title `clamp(24px,1.85vw,32px)`, summary `14.5px`, flip hint `10px` at `letter-spacing:0.22em`.

## Behaviour

- **Click or Enter/Space** toggles `.flipped` on the card. Flip is 1s on `--ease`.
- Cards are independent — several can be flipped at once. There is no accordion behaviour.
- Hover effects are suppressed while a card is flipped.

## Motion — the staggered entrance

Each card waits off the right edge of the screen and slides into its slot.

```css
.svc.svc-rev{
  opacity:0;transform:translateX(var(--svcFrom,760px));
  transition:transform .9s var(--ease),opacity .5s var(--ease);
  transition-delay:calc(var(--si,0) * var(--svcStagger,150ms));
  will-change:transform,opacity;
}
.svc.svc-rev.revealed{opacity:1;transform:none}
```

| Value | Setting | Why |
|---|---|---|
| Travel per card | `--svcFrom`, measured per card | Distance from the card's slot to just past the right edge, `+60px`. Measured individually so each card travels only as far as it needs to. |
| Stagger | `--svcStagger: 150ms` × card index | The one-at-a-time rhythm. |
| Slide duration | `.9s` on `--ease` | |
| Fade duration | `.5s` | Shorter than the slide, so cards are visible for most of their travel. |
| Trigger on | grid top `< 0.78` × viewport height | Scrolling down. |
| Trigger off | grid top `> 0.94` × viewport height | Scrolling up. The gap between the two is hysteresis — without it, hovering on the line flickers. |

Measuring the travel distance, on load and on resize:

```js
// measure the RESTING slot with the transform removed, or offsets compound
el.style.transition='none'; el.style.transform='none';
const r = el.getBoundingClientRect();
el.style.setProperty('--svcFrom', Math.round(window.innerWidth - r.left + 60) + 'px');
el.style.transform = prev; void el.offsetWidth; el.style.transition = prevTransition;
```

**Why a measured distance and not `100vw` for all four:** with a blanket value the leftmost
card flies across the entire screen while the rightmost barely moves — the speeds look wildly
different because the durations are equal but the distances aren't.

**Why a class toggle with CSS delays, and not a scroll-linked position:** scroll-linked
staggers are invisible if the user scrolls quickly — the whole run completes within a couple of
wheel clicks. A triggered, time-based run always plays in full regardless of scroll speed.

## Responsive

- 4 columns at full width; `.services-grid` caps at `max-width:1600px`.
- ≤1100px: 2 columns, and card aspect changes to `5/4` landscape.
- ≤600px: 1 column, `aspect-ratio:auto` with `min-height:420px`.

## Accessibility

- Cards are `tabindex="0"` and respond to Enter and Space as well as click.
- Images carry the service title as `alt` on the front; the back copy repeats the title as a
  heading so the flip has an accessible label.
- Under `prefers-reduced-motion: reduce` the entrance is skipped entirely — cards render in
  place at `opacity:1` with no transform and no scroll listener attached.

## Pitfalls

**The section must clip horizontally.** Cards waiting off the right edge widen the document and
give the page a horizontal scrollbar. `#services` carries `overflow-x:clip`. Use `clip`, not
`hidden`.

**The cards sit under the Project Gallery's wrapper.** The Gallery is pulled up over this
section, and its wrapper — though invisible — will swallow every click and hover meant for the
cards unless the wrapper has `pointer-events:none`. Symptom: only a thin strip at the top of
each card responds. This is fixed in the Gallery spec but it presents as a Services bug.

**Measure the resting slot with the transform cleared.** If you measure while the card is
already translated, each measurement compounds the last and the cards drift further off-screen
on every resize.

**Don't let the reveal fight the hover.** The reveal's resting state is `transform:none`, which
is more specific than the hover rule would be if both lived on the same element and the same
property. Here they don't clash because hover animates children (`.stone`, `.veil`, `.sheen`)
rather than the card itself — keep it that way, or the hover lift silently stops working.
