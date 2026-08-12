# Supplier Strip

## What it is

A quiet band of supplier names that scrolls continuously sideways — a marquee — under the Stone
Selection wheel. It is the smallest section on the page and exists to lend credibility rather
than to be interacted with.

## Where it sits

Position 6, between Stone Selection and Process.

It is **not a standalone block in the layout** — it lives *inside the Stone Selection's sticky
pin*, hanging below the framed wheel. That placement is deliberate:

- While the Process panel slides in, the wheel is frozen with its bottom on the viewport's
  bottom edge, and this strip hangs just below the fold for the whole handoff.
- The Process panel's pull-up has to account for the strip's height (`stripH` in
  [Process.md](Process.md#the-stone-selection-handoff)), and that same amount is handed back as
  padding so the following section doesn't start underneath it.

If you move this strip out of the pin, the Process handoff sizing must be recalculated.

## Content

Ten supplier names, repeated twice in the DOM so the marquee can loop seamlessly:

```js
const SUPPLIERS = [
  "Silestone","Caesarstone","Dekton","Neolith","Technistone",
  "Unistone","Compac","Cimstone","Ceralsio","Noble Stone"
];
strip.innerHTML = [...SUPPLIERS, ...SUPPLIERS].map(s => `<span>${s}</span>`).join('');
```

Label above the strip: eyebrow `Sourced from`.

> The prototype also carries a **"Prototype note"** paragraph under the strip explaining that the
> slabs are procedural placeholders. **Delete this on the real build.**

## Images

**None.** The strip is text only.

If logos are wanted instead of names, supply them as **SVG**, single-colour, with a consistent
optical height (~24px cap height), and set them to `opacity:0.5` rising to `1` on hover to match
the current text treatment. Avoid raster logos — they will be scaled and sit on a dark
background.

## Markup

```html
<section style="padding:64px 0 0">
  <div style="max-width:1320px;margin:0 auto 22px;padding:0 clamp(20px,5vw,64px)">
    <span class="eyebrow rise">Sourced from</span>
  </div>
  <div class="strip"><div class="strip-track" id="strip"></div></div>
</section>
```

## Layout & styling

```css
.strip{
  position:relative;overflow:hidden;
  padding:26px 0;
  border-top:1px solid var(--hair-soft);
  border-bottom:1px solid var(--hair-soft);
  /* fade the names out at both edges so they don't hard-cut */
  mask-image:linear-gradient(90deg,transparent,#000 12%,#000 88%,transparent);
  -webkit-mask-image:linear-gradient(90deg,transparent,#000 12%,#000 88%,transparent);
}
.strip-track{
  display:flex;gap:64px;width:max-content;
  animation:marquee 34s linear infinite;
}
.strip:hover .strip-track{animation-play-state:paused}   /* pauses so a name can be read */

.strip-track span{
  font-family:var(--serif);font-size:22px;font-weight:400;
  letter-spacing:0.04em;color:var(--faint);white-space:nowrap;
  transition:color .4s var(--ease);
}
.strip-track span:hover{color:var(--bone)}

@keyframes marquee{ to{transform:translateX(-50%)} }   /* exactly half — the list is duplicated */
```

The names are set in the **display serif at 22px**, not small uppercase sans — they read as a
roll-call of stone houses rather than as a logo bar. Hovering pauses the marquee and lifts the
hovered name to full `--bone`.

**The `-50%` is load-bearing.** The track holds the list twice, so translating by exactly half
its width lands on a frame identical to the start, and the loop is invisible. Any other value
produces a visible jump.

## Behaviour

Near-decorative. Two small touches:

- **Hovering the strip pauses the marquee** (`animation-play-state:paused`), so a name can
  actually be read rather than chased.
- Hovering an individual name lifts it from `--faint` to `--bone`.

## Motion

| Value | Setting |
|---|---|
| Duration | `34s` for one full cycle |
| Timing | `linear` — any easing makes the loop pulse |
| Direction | right to left |
| Loop | `infinite`, seamless via the duplicated list |
| On hover | paused |

## Responsive

The gap between names uses `clamp(36px,5vw,72px)` so the density stays similar across widths.
No breakpoint changes are needed — the marquee simply shows fewer names at once on a phone.

## Accessibility

- The strip is decorative; the duplicated half should carry `aria-hidden="true"` so screen
  readers don't announce every supplier twice.
- A continuously moving marquee is a common accessibility complaint. The page carries a global
  reduced-motion kill switch that already stops it:

```css
@media (prefers-reduced-motion: reduce){
  *{animation:none!important;transition-duration:.001ms!important}
}
```

That halts the marquee mid-track, which leaves the names at an arbitrary offset. Better to also
lay them out statically rather than relying on the blanket rule alone:

```css
@media (prefers-reduced-motion: reduce){
  .strip-track{transform:none;flex-wrap:wrap;justify-content:center;width:auto}
}
```

## Pitfalls

**Duplicate the list, and translate by exactly `-50%`.** Any mismatch between the duplication
count and the translate distance shows as a stutter once per cycle.

**Keep it inside the Stone Selection pin** unless you also re-derive the Process handoff sizing.
Its height is measured as `stripH` and used twice — once to extend the panel's pull-up, once as
padding handed back to the following section.

**Don't let it capture pointer events during the handoff.** It sits inside the held pin beneath
the incoming Process panel; the panel's wrapper carries `pointer-events:none` so the strip stays
hoverable, but the strip must not be given a `z-index` that lifts it above the arriving panel.

**Remove the prototype note.** The paragraph about procedural placeholder slabs is scaffolding,
not copy.
