# TopCat Worktops — Section Specs

Build specs for the sections proven out in the interactive prototype
(`../Interactive Demo/index.html`). Each document describes one section completely enough to
rebuild it from the spec alone — structure, styling, behaviour, motion timings, and the
non-obvious traps that cost real debugging time in the prototype.

## Documents

| Section | Page order | Document |
|---|---|---|
| Reviews | 2 | [Reviews.md](Reviews.md) |
| Services | 3 | [Services.md](Services.md) |
| Project Gallery | 4 | [Project Gallery.md](Project%20Gallery.md) |
| Stone Selection | 5 | [Stone Selection.md](Stone%20Selection.md) |
| Supplier Strip | 6 | [Supplier Strip.md](Supplier%20Strip.md) |
| Process | 7 | [Process.md](Process.md) |
| FAQ | 10 | [FAQ.md](FAQ.md) |

Positions 1, 8, 9, 11 and 12 (Hero, Estimator, Meet the Team, Final CTA, Footer) are
placeholders in the prototype and are **not** specified — they have no agreed design yet.

## How to read these

Every document follows the same shape:

1. **What it is** — the finished behaviour in a paragraph.
2. **Where it sits** — page position and any coupling to neighbouring sections.
3. **Content** — the data the section renders.
4. **Images** — what to supply, and the placeholder that stands in until you do.
5. **Markup** — HTML skeleton.
6. **Layout & styling** — the CSS that matters, with real values.
7. **Behaviour** — interactions.
8. **Motion** — every timing and threshold in one table.
9. **Responsive**.
10. **Accessibility**.
11. **Pitfalls** — mistakes that look correct but aren't. Read this section before building.

## Conventions used throughout

**Design tokens** (from `:root` in the prototype):

```css
--ink:#0A0A0C;        /* page background            */
--ink-2:#101014;      /* raised surface             */
--bone:#F2EEE6;       /* primary text               */
--muted:rgba(242,238,230,0.55);
--faint:rgba(242,238,230,0.32);
--gold:#C9A24E;       /* accent                     */
--gold-soft:#d8bc7a;  /* accent, italic display     */
--hair:rgba(201,162,78,0.22);       /* gold hairline */
--hair-soft:rgba(242,238,230,0.10); /* neutral hairline */
--ease:cubic-bezier(0.22,1,0.36,1);
--ease-2:cubic-bezier(0.65,0,0.35,1);
--ease-slow:cubic-bezier(0.4,0,0.15,1);
--serif:"Cormorant Garamond",Georgia,serif;
--sans:"Inter",system-ui,-apple-system,sans-serif;
```

**Section heads** — every section head is centred. Note that the title and sub carry their own
`max-width`, so `text-align:center` alone is not enough: the auto side margins are required to
centre the *boxes*, or the text centres inside a box that is still flush left.

```css
.section-head{max-width:1320px;margin:0 auto clamp(40px,6vw,72px);text-align:center}
.section-head .section-title,
.section-head .section-sub{margin-left:auto;margin-right:auto}
```

**Reduced motion** — the page carries a global kill switch:

```css
@media (prefers-reduced-motion: reduce){
  *{animation:none!important;transition-duration:.001ms!important}
}
```

That is a blunt instrument and **not sufficient on its own**. It stops CSS animation, but every
section here is also driven by JavaScript that writes transforms directly — which the rule
cannot touch. Each section must additionally check
`window.matchMedia('(prefers-reduced-motion: reduce)').matches` and resolve straight to its
settled state, or a card can be left frozen mid-flight at whatever offset the kill switch caught
it at. The per-section specs say what "settled" means in each case.

## Two page-wide rules that are easy to miss

These caused real, hard-to-diagnose bugs in the prototype. They apply to any section that is
pulled up over its neighbour (Project Gallery, Process):

1. **A wrapper pulled over another section must not swallow its clicks.** The wrapper is
   invisible but still captures every pointer event over its area. Set `pointer-events:none` on
   the wrapper and `pointer-events:auto` on the panel inside it. Symptom if you miss it: the
   section underneath is only clickable in a thin sliver above the overlap.

2. **A panel parked off-screen horizontally must be clipped.** Translating a full-width panel
   one viewport to the right makes the document twice as wide, which gives the whole page a
   horizontal scrollbar and lets the entire site slide sideways. Put `overflow-x:clip` on the
   wrapper — `clip`, not `hidden`, because `hidden` creates a scroll container and breaks the
   sticky panel inside it.
