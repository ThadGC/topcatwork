# START HERE — 11 August 2026, end of the ALPHABETICAL ORDER, V2 REMOVAL and MIRROR RANGE round

Read this, then `HANDOVER.md` **§D** (the decision register, start at **D84–D92**) and **§2**
(the standing rules). That is about fifteen minutes and it is enough to work safely.

> ⛔ **SCOPE, BEFORE ANYTHING ELSE — DESKTOP IS FROZEN AND THE WORK IS MOBILE (D90, D91).**
> The final CTA card went to plain grey and desktop design closed with it. The client: *"when I
> say let's do mobile, then we only work on mobile. Everything else stays exactly as it is on the
> other devices."* Tablet is AFTER mobile, and he says when.
> ⚠️ **This is easy to break without noticing.** `index.html` is one file with inline CSS, so
> nearly every rule is unscoped and applies at every width. ⛔ **Put mobile work inside a
> width-scoped media query. Never edit a base rule to fix mobile** — that changes the desktop he
> has just frozen, and it will render perfectly while doing it (§9). ⚠️ `max-width:900px` catches
> tablet as well, which is not in scope while mobile is. **§2 rule 15.**
>
> ⭐ **PROVE THE FREEZE, DO NOT ASSERT IT.** The pattern that works, used for D92: copy the
> pre-change `index.html` to a temporary `.html` beside it, serve both, probe the same set of
> rects and computed styles at **1440×900** and **768×1024** in each, and diff. Identical output
> is the evidence. ⚠️ Delete the temp copy afterwards — left live it is an indexable page (D60's
> failure mode), and the live-reload will 404 on it in the console until you do.
>
> ⭐ **Mobile so far: the HERO (D92, D97), the REVIEWS (D93–D95) and the SERVICES HELIX
> (D96, D97).** The hero's bevel is **30°** and its bottom edge sits 57px above the fold; the
> helix shows **five** cards, the outer two inert ghosts, the middle three interactive.
> ⚠️ **A mask's intermediate stop is a partial reveal** — the top ghost sits behind the intro at
> 0.10 alpha so the copy stays readable. ⛔ **Those stops are in PIXELS, deliberately (D98).** A
> percentage scales with the STAGE; what the stop has to line up with is the COPY, whose bottom
> sits a fixed px distance below the stage top and does not move when the text rewraps. As
> percentages the ramp overran the text and the fifth card was invisible on delivery.
> ⭐ **Retuning the spiral: it spans `4·STEP + --hxH`.** Keep that within about a card's height of
> the stage, or a card that is supposed to be visible quietly stops being so. ⛔ **Decide interactivity by POSITION, not opacity**, and
> know that `pointer-events:none` does NOT stop a dispatched click — guard the listener too.
> ⚠️ **A bevel hairline drawn with a gradient**: `to top right` is only correct in a SQUARE box.
> The angle is `tan⁻¹(rise/run)`, which is also the bevel's own angle from the horizontal.
> ⛔ **When a desktop-only component is wanted on mobile, LIFT its CSS into a shared media query
> — never copy it.** D96 moved `.helix-stage`…`.helix-ui` into
> `@media(min-width:1121px),(max-width:720px)`, placed immediately AFTER the desktop block so
> rule order is unchanged. ⚠️ **Tablet (721–1120px) is deliberately excluded and still shows the
> flip-card grid**; widen the query to `(min-width:721px)` when the tablet round comes.
> ⚠️ **A desktop component's FLOORS are the trap** — the helix's card 300px / R 210px / STEP 96px
> minimums are each wider than a phone can give, so the desktop branch would have thrown the
> spiral off both edges. Check every `Math.max` floor before reusing a desktop measure. The hero is centred with a matched
> bevel replacing the curved bottom edge; the reviews are a swipeable carousel with the
> neighbouring cards peeking either side and the pager moved below. The hero's mobile ceiling is
> `max-width:720px`, which clears iPad portrait at 768.
>
> ⛔ **SCOPE PHONE JS-BACKED WORK WITH A CLASS, NOT A SECOND MEDIA QUERY (D93).** `.rev-solo` is
> set from `perPage()===1`, the same test the layout maths uses, so CSS and JS cannot disagree
> about what a phone is. ⚠️ They already did: the old `max-width:720px` arrow rule fires at
> exactly 720px where `perPage()` returns 3. **A second source of truth for one fact is this
> project's most repeated bug** — D51, D59, D68, D78, and a media query there would have been
> the fifth.

> ⚠️ **This replaces the version written after the logo / dark-quartz / name-integrity round**,
> now archived as `HANDOVER-2026-08-10-logo-and-integrity-start-here.md`. It described a
> **126**-stone range ordered by POPULARITY, and a site with a **V2**. All three have moved: the
> range is **132**, everything is **alphabetical**, and **V2 no longer exists**.

---

## 0. ⛔ RUN THIS BEFORE YOU DEPLOY, AND BEFORE YOU CALL ANYTHING DONE

```bash
cd "Website Demo/stones" && python3 harvest/verify.py
```

> 132 stones, 132 with a photograph, 132 pages on disk — ✅ PASS

**Nine checks.** Every one exists because it caught something that was already live on the
client's site:

| # | Catches | The real case behind it |
|---|---|---|
| 1 | same IMAGE, two names | Almond Beige == Calacatta Gold Soft, pixel-identical |
| 2 | same TILE FILE, two stones | Dolce Vita and Dolce Vita Leather both → `dolce-vita.webp` |
| 3 | same STONE, two names | Black Marinace == Nero Marinace, because "nero" is Italian for "black" |
| 4 | stale tile | tiles from an older run still shipping |
| 5 | a page for a stone we no longer sell | four dead pages stayed live and indexable |
| 6 | a measurement that is not millimetres | 22 pages printed `322 x 162 mm` for a slab in centimetres |
| 7 | a promise we cannot keep | 355 hits, including "the pattern is consistent across the slab" |
| 8 | ⭐ a photograph from the WRONG SUPPLIER, or with no provenance | proven by pointing Carrara at a Caesarstone file |
| 9 | ⭐ a NAME that disagrees with the supplier's own title | 15 stones shipped a honed or leathered slab under a plain name |

⭐ **Checks 8 and 9 are the most important.** See §2.

---

## 1. WHERE IT STANDS

```bash
node "Website Demo/dev-server.js"      # → http://localhost:5501
```

**⚠️ There is no git.** This is a GitHub ZIP, not a clone. Take a dated `*.pre-<thing>.bak`
before any large edit — those backups are the only version control there is.

| | |
|---|---|
| Live pages | **167** |
| The range | **132 stones**, every one with a real supplier photograph and a description written from it |
| Quartz | 67 — 51 light, 16 dark |
| Marble & Quartzite | 45 — ⚠️ **18 marble, 26 quartzite, 1 travertine** |
| Granite | 20 — ⚠️ **only 9 of them light** |
| Tiles | every full tile ≥1200 (124 of 132 at ≥1600), every `-s.webp` exactly **800** |
| Internal links | 1,107, **0 broken** |
| Versions | **one.** V2 is gone (§6) |

**⛔ Desktop design is CLOSED (D91), not merely complete. What is missing is plumbing,
photography and the name-accuracy work — none of which is a desktop design change.**

### The two things that actually block go-live

1. ⭐⭐ **The enquiry form has no backend, and it carries file uploads.** `buildEnquiry()` in the
   CTA IIFE assembles a `FormData` and has nowhere to POST. The client was burned by a previous
   agency whose site produced **one client in nine months**, and this engagement will be judged
   on **measurable leads**. There is nothing to measure. Netlify Forms with uploads is the
   obvious fit. **Top open item for six sessions and still not done.**
2. **Photography — the STONES are done. The PEOPLE and the PROJECTS are not.** Three director
   portraits, one Why feature shot, three About work photographs, and eight gallery projects
   that currently reuse service images under invented names and places.

---

## 2. ⛔ THE INTEGRITY RULE — the one that matters most

The client, after finding a stone whose photograph did not match its name:

> "These names cannot be wrong. If someone googles it and sees it looks different here, then we
> have a big problem. And if someone chooses this one by this name and TopCat somehow shows up
> at the house with a wrong looking slab, then we are fucked."

⭐ **A stone name is only meaningful RELATIVE TO A SUPPLIER.** "Calacatta Gold" is a marketing
name that different manufacturers put on completely different-looking products. So the site can
never be validated against a generic Google image. **The only defensible test is that the
photograph shipped under a name is the one THAT supplier publishes under THAT name.** Checks 8
and 9 enforce exactly that.

### ⛔ FOUR WAYS THIS HAS ALREADY GONE WRONG

1. **Wrong finish under a plain name — 15 stones.** Provenance was correct on every one and they
   were still wrong, because our name dropped the supplier's finish word: Nile's "BELVEDERE
   LEATHER" was listed as **Belvedere**, "Carrara Honed" as **Carrara**. All renamed to the
   supplier's own title. **Check 9 fails the build on this.**
2. **Right stone, wrong VIEW.** Calacatta Oro came from the right supplier under the right name
   and still looked like a different stone, because the window was a tight zoom on a quiet patch.
   ⭐ **A tile must show the stone at a scale where its PATTERN is recognisable**, not merely at
   the right resolution. No check catches this. Only the eye does.
3. **A rename made by the agent.** Chasing the client's reference, "Calacatta Gold Oro" was
   renamed to "Calacatta Gold" and pointed at a hand-picked crop. ⛔ **Reverted.**
4. ⭐ **A SUBSTITUTION made by the agent — 11 Aug, and the newest.** Asked for "mirror grey,
   mirror black, mirror white", a search of one supplier listing concluded those names did not
   exist anywhere and shipped Bloom's *Sparkle* range instead, under a search alias. **The
   supplier publishes all six Mirror stones as ordinary product pages**; their own search box
   returns them in one request. The client found it by typing "mirror" into the site and getting
   nothing he recognised. ⛔ **Search the supplier's own search before concluding a product does
   not exist. A category that merely sounds right is not the product. And never substitute a
   different product for the one you were asked for.** See D88 → D89.

### ⚠️ `stones/supplier_names.py` — the seven authorised differences

Five are the **supplier's own misspellings** of well-known stones, where our spelling is what a
customer googles: `Artic Cream`, `Verde Gautemala`, `Macaubus Fantasy`, `White Eclpyse`,
`Grigio Shimmerr`. Plus `Carrara Jumbo` (JUMBO is a slab FORMAT) and Travertine Romano
Classico's `H/F`.

⭐ **An entry there AUTHORISES the difference** and records the exact string an order must be
placed against. ⛔ The check still fails if that record drifts from the supplier's real title.
⚠️ It is **not** a licence to rename a different product — that is failure 4 above.

---

## 3. ⚠️ THE TRAPS THAT WILL WASTE YOUR SESSION

### Ordering and the wheel — all new this round, and easy to undo by accident

- ⛔ **THE RANGE IS ALPHABETICAL EVERYWHERE (D85).** `catalogue_active.py` sorts on the DISPLAYED
  NAME within each material, and that one sort feeds the collection grid, the estimator's picker
  and the wheel. ⚠️ **This reversed D74** (spread the dark stones out) — the two cannot both be
  had, because a name says nothing about colour. **Granite now opens on seven dark stones in a
  row.** The client has seen it. If he wants the spread back, sort on the FIRST LETTER only and
  spread tone within each letter — a change to `_alphabetical` and nothing else.
- ⛔ **THE WHEEL'S SEATING AND ITS ORDER BELONG TOGETHER.** `fanOrder` used to seat rank 0 centre,
  rank 1 left, rank 2 right, outwards — correct for a popularity list. Feed an alphabetical list
  into that and the eleven on screen read 9,7,5,3,1,0,2,4,6,8,10: perfectly sorted, invisibly so.
  It is sequential now. ⚠️ Put centre-out back if you ever put popularity order back.
- ⛔ **NO DARK STONE ON THE FIRST SCREEN (D86).** `clearOpening()` walks outward taking the next
  LIGHT stone each way until it has `OPEN_SPAN` a side, then puts the skipped darks back **split
  half each side** — that split is the balance the client asked for. ⚠️ **Measure the visible
  window before changing OPEN_SPAN**: the wheel shows **9 cards** fully at every width tested
  (912 to 1920), and protecting only five put the deferred darks at +4 and +5, on screen and both
  on one side. The client saw it. ⛔ Applies to the WHEEL only — the collection grid is a plain
  sorted list. If they ever have to match, MOVE the function rather than copying it.
- ⚠️ **Granite cannot do better than nine.** It has exactly 9 light stones in 20, so nine light
  cards is everything it owns.

### Mobile, and the one that has already bitten

- ⛔ **A PHONE GESTURE MUST ANSWER TO A MOUSE AND A TRACKPAD TOO (D94).** The review swipe shipped
  bound to `touchstart`/`touchmove`/`touchend` only, so on the client's MacBook — a laptop
  narrowed to a phone width, no touch hardware, no touch events — it did nothing at all.
  ⭐ **A phone layout is looked at on a DESKTOP browser far more often than on a phone during a
  build, including by the client.** Bind three paths: touch, `pointerType==='mouse'` drag, and a
  `wheel` with `deltaX` (a two-finger trackpad swipe fires nothing either drag handler hears).
  ⚠️ **It passed its own verification** because the tests synthesised touch events — that proves
  the handler works, not that a person can reach it. Drive the real input a person will use.
- ⚠️ Mouse-drag traps: bind move/up to the **window** or a drag leaving the deck sticks; and
  `user-select:none` while dragging, or dragging across text selects it and the belt looks frozen.
- ⚠️ Trackpad trap: **momentum fires wheel events for ~1s after the fingers lift**, so one flick
  pages several times without a quiet-period lock.
- ⚠️ The Browser pane **translates mouse to touch below 768px**, so a `computer` drag there tests
  the TOUCH path, not the mouse path. Dispatch `PointerEvent`s with `pointerType:'mouse'` to test
  what the client actually uses.
- ⛔ **A TRANSFORM-SCALED CARD LEAVES SLACK NO CSS RULE NAMES (D95).** `.rev` is `inset:0` inside a
  deck box that is NOT scaled, so `(1-scale)/2` of the deck's height is dead space above and below
  it — 27px a side, and it was most of a spacing complaint. `gridLayout()` writes the measured
  scale out as `--revScale` so the stage is sized from the card the customer can see. ⚠️ Solo
  therefore **skips the stage-height cap on the scale**, or stage → scale → stage is circular.
- ⚠️ **Two measurement traps in the reviews section**: an open card's height **animates over
  .45s**, so an early probe reports the collapsed height; and the card entrance depends on
  **scroll HISTORY, not scroll position** — a fresh load shows cards parked where an already
  scrolled one shows them seated. Give both files the same history before calling it a regression.

### Photography

- ⛔ **SUPER-RESOLUTION DESTROYS SPECKLE, and the drift metric does not catch it (D88a).**
  Measured: the model kept **32.5%** of the fine texture on a mirror-fleck grey where a plain
  Lanczos resample kept **81.1%**. D77's pattern-drift check passed it at 3.36 — inside its own
  1.0–5.1 band — because a mean absolute difference at 128px cannot see fine texture being
  smoothed away. ⭐ **For a speckled or sparkled stone, resample; measure high-frequency energy
  and look at the tile before installing any upscale.** Super-resolution is still right for
  veined stones (D77).
- ⚠️ **`-s.webp` IS 800px, NOT 300.** Every small wheel tile on the site is 800 and the `srcset`
  declares `800w`. Three were written at 300 on 11 Aug and it was caught only by comparing
  against an existing tile. Audit with the one-liner in D88a if you touch tiles.
- ⛔ **`slabify.py` rewrites every tile it accepts.** After any full run:
  `cp -f stones/harvest/_upscale/installed/*.webp assets/slabs/`
- ⛔ **If you change a crop, sync the restore set FIRST.** `_upscale/installed/` holds the
  *pre-fix* tile and the restore copies it back.
- ⛔ **NEVER rebuild a crop from `rec["box"]`.** Two earlier steps rebind `im`.
- ⛔ **Do NOT run `expand.py`.** It rebuilds from the original 52 and would delete live stones.
- ⚠️ **Upscaling cannot rescue a small soft source.** Ten CRL tiles were enlarged 2.6x and three
  still had to be dropped.

### The recurring structural bugs

- ⛔ **`catalogue_source.py` is a 52-STONE SNAPSHOT. It is not the range.** `catalogue_active.py`
  is. Reading the wrong one has caused **four** live defects (D51, D59, D68, D78).
- ⛔ **A SECOND FILE THAT LOOKS LIKE THE SOURCE OF TRUTH IS THIS PROJECT'S RECURRING BUG.** The
  fourth instance was `SLAB_TILES` in index.html: fourteen stones showed the real photograph on
  their page and a **drawn SVG cartoon** on the wheel. ⚠️ Nothing errored — the drawn fallback is
  by design. `apply_catalogue.py` now derives SLAB_TILES from the manifest and fails the build.
- ⛔ **AN INVENTED DATA VALUE CAN BLANK THE WHOLE SITE.** `preset:"noir"` — a preset name that
  does not exist — made `marble()` throw before the reveal observer was wired, so every `.rise`
  element stayed at opacity 0. `node --check` passed, the build passed, verify passed, every
  route returned 200. `check_presets()` now fails the build on it. **Valid presets:** calacatta,
  carrara, crema, emperador, eternal, fumo, goldveil, mist, nerogold, statuario.
- ⛔ **`[hidden]` LOSES TO ANY AUTHOR `display` RULE.** Three instances, one of which meant the
  Refine button did nothing for its whole life.
- ⛔ **CHECK WHAT IS A DIRECT CHILD OF `<body>` BEFORE ADDING A FIXED BACKGROUND.** The stone
  pages' floor is `body::before` at z-index 0 and `nav.crumb` sits outside `<main>`.
- ⚠️ **THE `./v2/` GREP TRAP, which bit again on 11 Aug.** BSD grep prints `v2/about.html`, not
  `./v2/about.html`, so `grep -v "^./v2/"` silently matches nothing. Use `grep -Ev "(^|/)v2/"`.
  ⚠️ Now mostly moot — see §6.
- ⚠️ **Explanations belong in Python, never in an HTML comment in the template.**
- ⚠️ **`10cm` in Judy Z.'s review trips the millimetres scan and must stay.** A real customer's
  words. Check every scan hit before acting on it.

---

## 4. THE PIPELINE

```bash
cd "Website Demo/stones"
python3 apply_catalogue.py            # MATERIALS + SLAB_TILES into ../index.html, with guards
python3 harvest/similar.py            # measures tiles -> similar.json. BEFORE build.
python3 build_stones.py               # 132 stone pages + the collection grid
python3 harvest/verify.py             # ⛔ the gate, nine checks
cd .. && python3 build_seo_pages.py   # 26 pages incl. the sitemap; re-run whenever the range changes
```

⭐ **One stone list.** `catalogue_active.py` is the only place that says what the site sells. It
concatenates `catalogue_expanded.py` (the base) + `catalogue_dark.py` (the dark quartz, 10 Aug)
+ `catalogue_mirror.py` (the Mirror range, 11 Aug), then sorts each material A–Z (D85).

⚠️ `catalogue_dark.py`, `catalogue_mirror.py` and `descriptions.py` exist SEPARATELY because
`grow.py` regenerates `catalogue_expanded.py` — which is how the D46 correction was silently
reverted.

### Adding a stone, and what the gate demands

1. Image into `stones/harvest/raw/<supplier>/<slug>.jpg`.
2. Tiles into `assets/slabs/`: `<slug>.webp` at **1600** and `<slug>-s.webp` at **800**.
3. `assets/slabs/manifest.json`: slug → tile stem.
4. `harvest/slabify-report.json`: a record with `slug`, `src="raw/<folder>/<file>"`, `ok=true`
   — **check 8 fails without it**.
5. `harvest/catalogue.json`: `{source, slug, title}` with the supplier's OWN title — **check 9
   reads this**.
6. `harvest/verify.py` → `SUP_DIR` needs the supplier → raw-folder mapping.
7. A row in `catalogue_mirror.py` (or the right module) and a line in `descriptions.py` —
   `build_stones.py` RAISES rather than shipping a stone with no description.

---

## 5. ⛔ RULES THAT MUST NOT BE BROKEN

Full list in `HANDOVER.md` §2. The ones that get broken by accident:

1. ⛔ **A stone's NAME and its PHOTOGRAPH must both match the supplier's own** (§2 above).
2. ⛔ **Fabrication is OUTSOURCED. Never claim in-house.** Templating, fitting and aftercare ARE
   theirs and may be claimed freely.
3. ⛔ **Never state something we cannot guarantee, and never use an absolute.** Comparatives are
   safe. Enforced by check 7.
4. ⛔ **Every measurement in millimetres.** The estimator's linear metres of edging is the one
   exception, because it is a pricing unit.
5. ⛔ **A stone is called what it is; the range is named for what it contains** — "Marble &
   Quartzite". `RANGE_LABEL` in build_stones.py and `MAT_LABEL` in index.html.
6. ⛔ **A wrong image under a right name is the worst possible outcome.**
7. ⛔ **The scene gate is a filter, not a guarantee. A contact sheet at 330px minimum, looked at
   by a person, is the only check that catches a forklift in the frame.**
8. ⛔ **Never a bright or gold line across the TOP of a card or section**, anywhere.
9. ⛔ **Suppliers are never named publicly.** Porcelain never goes on the stone wheel.
   ⚠️ The `sup:` field is in the injected data and is never rendered — a documented scan hit.
10. **No showroom. Never show the review count. Never signal a young company. Value, not cheap.**
11. **Voice:** quietly confident master. British English, commas not em dashes, no exclamation
    marks.
12. ⚠️ **Natural stone photography is INDICATIVE and only the copy says so.**
13. ⚠️ `stones/harvest/raw/` is ~1.6GB and must not be deployed.
14. ⛔ **The logo is the client's artwork and is never re-drawn. Set HEIGHT only.**

---

## 6. ⛔ V2 NO LONGER EXISTS (D87)

The client: "completely remove version two and everything about it." Gone: the fixed **V1/V2
pill** (it was inline in index.html *and* a `PILL` constant in **three** builders — stones,
services, trade), **`/versions.html`**, **`/v2/`** (69 pages) and **`/index-v2.html`** (683KB,
sitting in the site root).

⚠️ **Parked, not shredded**: everything is in `.removed-2026-08-10-v2/`, **outside
`Website Demo/`**, so it cannot be served or deployed. There is no git, so say the word to delete
it for good. ⭐ This closed a live risk: V2 was never rewritten and still carries the old
in-house-fabrication claims. ⚠️ Older measurements say "non-V2 pages"; that now just means
"pages".

---

## 7. ⚠️ WHAT THE CLIENT HAS NOT SEEN

**Almost everything from 7 August onwards**, plus all of this session. Show it in this order:

1. **The real logo** — nav, footer and favicon, on every page.
2. **The page floor** (§4l) and the stone pages now standing on it.
3. **About and Why — by SCROLLING, not screenshots.** Both builds are motion.
4. **The stones** — the wheel, the collection, a stone page. Biggest visible change.
5. **The SEO layer** — a material page, then a guide, then a town page, in that order.

⚠️ **Say out loud that the three director portraits and the Why feature shot are placeholders.**

---

## 8. OPEN — DO THESE NEXT

1. ⭐⭐ **Build the enquiry form backend.** Nothing else changes whether this is judged a success.
2. ⭐ **Close the licensing question on Caesarstone, CRL and now Bloom.** Twenty live stones come
   from them and `LICENSING.md` says TopCat must BUY from a source for its photography to be
   defensible. The client instructed all three directly; get the accounts confirmed before
   go-live. ⛔ A business risk, not a code risk. No scan will catch it.
3. ⭐ **Walk the name-and-image audit sheet.** Checks 8 and 9 prove provenance and wording; they
   cannot prove the crop *looks* like the stone. That needs eyes on all 132.
4. ⭐ **Harvest the rest of Bloom, and the three suppliers never touched.** Bloom was on the
   client's list from the start and sat unharvested until 11 Aug; only 13 of their images are in
   `raw/bloom/` and their quartz catalogue is far bigger. **AKG, Cosentino/Silestone and Fugen
   have never been harvested at all** — Fugen returns 403 and Cosentino's colours page redirects.
   ⛔ **Classic Quartz Stone is off limits**: their robots.txt carries `User-agent: ClaudeBot /
   Disallow: /`. The client is their customer and can request assets directly.
5. ⭐ **Calacatta Gold is UNRESOLVED.** The client's intro video is built around it. Every
   harvested supplier has been searched. ⭐ **Needs the maker's name from the video.**
6. **Build `/services/`** — the client already assumes it exists.
7. **Have TopCat read the 132 stone descriptions.** No human at TopCat has read them.
8. ⭐ **THE MOBILE PASS — this is the live job (D91).** Genuinely untouched. ⛔ **Mobile only until
   the client says tablet**, and inside media queries, never in a base rule.
9. **Real project photographs and names** for the eight `PROJECTS` entries and four people slots.
10. **A clamp-floor sweep, still not done sitewide.**
11. **The popularity ranking is editorial, not TopCat's sales data** (`POPULAR` in index.html).
    ⚠️ Since D85 it only chooses where each range OPENS — it no longer orders anything.
12. **Confirm live paths before go-live**, and re-run all four compliance scans.

**Still waiting on the client** (full list in §D): whether Quartzite becomes a fourth range, the
20mm vs 30mm price question, brackets for vanity tops / fireplaces / tables, the hero's "Request
a call" demotion (asked four times), and the £3k vs £3,850 three-slab discrepancy.

---

## 9. ⭐ HOW THIS CLIENT FINDS BUGS, AND WHAT IT MEANS FOR YOU

**Every defect of the last five sessions rendered perfectly.** A page showing `322 x 162 mm`
looks no different from `3220 x 1620 mm`. A drawn SVG cartoon under a real stone's name looks
like a slab until you know the range. A blank site looked like a slow load.

He finds them by **walking the site as a customer would**, and by **typing what his customers
type**. The Mirror round is the cleanest example: the stones were live, the build passed all nine
checks, and he found the fault in four seconds by typing "mirror" into the search box.

- **Walk the journey, do not check the page.** Every recent fault lived in the gap between two
  screens that were each individually correct.
- ⭐ **LOOK AT THE RESULT BEFORE REPORTING IT DONE.** The invented preset, the SVG cartoons, the
  covered breadcrumb, the smoothed-out speckle and the 300px tiles all passed every automated
  check and would have been caught by opening the page once.
- ⭐ **SEARCH THE SITE THE WAY HE WILL.** If a stone is added, type its name — and the words a
  customer would use for it — into both the wheel and `/stones/`.
- **Measure, then claim.** "0 orphaned pages" was true when written and false for a week.
- **Write the check that fails the build**, not the note that warns.
- ⚠️ **A guard that fires is usually right.** Exceptions get written down with evidence, never
  quietly widened.

---

## 10. BUDGET AND ENVIRONMENT

- **~82 credits** of the client's **100-credit ceiling** spent, **2 of them this session** (one
  2×2 montage whose result was measured and then **rejected** — see D88a). About **18 left**.
- ⚠️ **Cannot push to GitHub from this machine.** No `.git`, no `gh`, no credential helper.
- ⚠️ **The Browser pane's console replays stale entries**, and programmatic `scrollTo` sometimes
  does nothing after a live-reload — drive it with the `computer` scroll action instead, and
  front the tab first. Instrument a copy for JS errors: write `_debug.html` with an error probe
  in `<head>`, load that, read `window.__ERRS__`.

---

## 11. THE DOCUMENT SET

| File | What it is |
|---|---|
| **`HANDOVER.md`** | ⭐ The single current state. §D is the decision register, **D1–D89**, including every reversal. §2a is the client's supplier list |
| **`stones/catalogue_mirror.py`** | ⭐ The Mirror range, and the full write-up of the substitution mistake that preceded it |
| `stones/catalogue_dark.py` | The dark quartz added 10 Aug, and **the six candidates rejected, with reasons** |
| **`stones/supplier_names.py`** | ⭐ The seven authorised name differences and the exact string an order must use |
| `stones/descriptions.py` | The 132 descriptions, with the rules for writing them at the top |
| `Docs/topcat-worktops-SEO-LOG.md` | Every URL, title, target query and SEO change |
| `HANDOVER-2026-08-10-slab-photography-complete.md` | ⭐ How the photography pipeline works. Read §2, §3 and §5 before touching `stones/harvest/` |
| `HANDOVER-2026-08-10-logo-and-integrity-start-here.md` | The previous START HERE. Superseded by this file |
| `HANDOVER-archive-to-2026-08-06.md` | ⚠️ **Every design the client rejected, in his words.** Read before redesigning anything |

⚠️ **Section numbers in `HANDOVER.md` are referenced from code comments** (`§3`, `§4`, `§5a`,
`§6.7`, `§7.5` are live in `index.html`). **Do not renumber.**
