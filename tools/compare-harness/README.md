# compare-harness

Playwright scripts that measure the OLD build against the NEW one. Built across the
sessions of 26–27 Aug 2026 and kept here because every previous copy lived in a session
scratchpad under `/private/tmp` and was lost when the session ended.

`node_modules` is deliberately not committed. Install once:

```bash
cd tools/compare-harness
npm install          # playwright 1.62.1 + pngjs
npx playwright install chromium
```

Both builds must be serving before any script runs:

- **OLD** (the spec, read-only) `~/Documents/TOPCAT WORKTOPS` on `:8099`
- **NEW** `~/Documents/TOPCAT-REACT/web` on `:3000`

## The scripts

| script | what it answers |
|---|---|
| `compare.mjs <path> --w 1440 --sel "..."` | old vs new: element counts, type, geometry, docH |
| `sweep.mjs --bands 375,900,1440` | representative pages across the three device bands |
| `anim-audit.mjs <path> <w>` | entrance animations live on old but static on new |
| `park-audit.mjs <path> <w>` | parked-state diff (opacity/transform before reveal) |
| `func-test.mjs <path> <w>` | accordions, form submit, every link resolves |
| `crawl-links.mjs 200` | every internal link, 404 check |
| `probe-nav.mjs <w>` | nav items and dropdowns, both builds |
| `shot-page.mjs <path> <w> <name>` | screenshots **with reveals fired** (steps the scroll first) |
| `verify-projfix.mjs <w>` | the project overlay: portal parents, a 36-point paint scan behind the open overlay, the bar-logo click, media-grid cells and `.proj-brand` geometry per project, lightbox reachability |
| `verify-reduce.mjs <w>` | `prefers-reduced-motion`: how many `.rise` blocks are parked at first paint |
| `shot-plate.mjs <w> <key>` | the media grid scrolled to the `.proj-brand` plate, both builds |
| `check-marble.mjs` | `svg.marble` census inside `.rev-stone`, both builds |
| `check-console.mjs` | console errors and hydration mismatches on `/` and `/projects/` |
| `probe-film-paint.mjs <w> <h> <name>` | real Chrome: does the hero film cover the whole box, or is there a dead black column? |
| `probe-reveal-tablet.mjs <w> <h>` | drives the runway to beat 1's own frames and photographs the reveal, both builds |
| `probe-wheel-filter.mjs <w> <h>` | the filtered stone wheel: slab count vs match count, and duplicates |
| `shot-wheel-filter.mjs <w> <h>` | the wheel filtered to one / three / all, as pictures |
| `probe-stonepick.mjs <w> <h>` | the home enquiry card's optional stone picker, and its absence elsewhere |
| `probe-poa-form.mjs <w> <h>` | the estimator's priced-by-hand form: validation and the POSTed body (fetch stubbed) |
| `probe-back.mjs <w> <h>` | the stone-wheel journey: does Back return to the stone section? both builds |
| `probe-back-site.mjs <w> <h>` | ten journeys across the site: Back restores the offset, and a first visit still starts at the top |

## Rules these scripts already encode — do not undo them

- **`channel: 'chrome'` for anything about the film.** Playwright's bundled Chromium has no
  H.264 and will not decode it — `currentTime` stays 0 and every conclusion is worthless.
  The system Chrome does decode. `probe-film-paint.mjs` and `probe-reveal-tablet.mjs` both
  launch with it.
- Scroll in **steps** before capturing. A `fullPage` screenshot does not fire `.rise`
  reveals, so the page captures as a black void on **both** builds.
- Force `document.documentElement.style.scrollBehavior = 'auto'` before any programmatic
  scroll, or every section reads "not in view".
- Skip the cine intro on `/` first — OLD `#cineSkip`, NEW a `<button>` whose **text** is
  "Skip intro" (its class is a CSS-module hash; match on text, never class).
- Measure in a **separate** `page.evaluate` from the click. React has not re-rendered and
  CSS transitions have not run in the same tick.
- Headless Chromium **will not decode or play the hero film**. Any film conclusion from
  these scripts is worthless — use the in-app browser pane or the iOS Simulator.
- Require `width > 40 && height > 8` before trusting an `elementFromPoint` result; the
  same text often exists on a zero-size screen-reader twin.
- Use identical cadence on both builds, always.
