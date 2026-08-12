# TopCat Worktops — Site Audit (Website Demo, V1)

> **Update (26 July 2026, later the same day):** the responsiveness fixes below are now DONE in
> both `index.html` and `index-v2.html` — root-level `overflow-x:clip` (kills the mobile
> layout-viewport expansion, the 770px header, sideways drift, the doubled JS scroll math, and
> the desktop horizontal scrollbar), a burger + full-screen menu below 1120px, review arrows
> moved into real gutters on phones, gallery cards resized for narrow stages with the mid copy
> below the walls, and the stones/process choreography verified working on mobile. Verified at
> 375/768/1280 with no horizontal scroll at any size and desktop pixel-identical. Still open:
> content items (phone number, form endpoint, reviewer names, Checkatrade figure), CTA coverage,
> and any deliberate re-choreography of holds/runways — to be discussed section by section.

> **Round 2 (26 July 2026) — desktop redesign pass (`index.html` / V1 only):**
> - **Reviews (all sizes):** real Google reviewer names on each card; reordered most-persuasive first;
>   defensive filter drops any review by Luke/Copley/Thadeus. Card **stack removed** — "Read more" now
>   **extends the card in place** (grows to a cap, scrolls if longer). Added a **Get in touch / Call us
>   CTA** below the wall (Call uses the real number 0800 098 2812).
> - **Reviews (desktop ≥1121 only):** entrance is a **scroll-driven half-backflip** (cards rise and lay
>   flat, staggered, reversible); paging **shifts one review at a time** with a cartwheel out/in instead
>   of replacing all three. Mobile/tablet keep the old deal-in + paging, with the new data.
> - **Services centring:** the grid freezes **centred** below the header when leaving reviews (was
>   bottom-framed, leaving a gap). Desktop only.
> - **Gallery:** backdrop now **holds still** (moved inside the pin); the leaving set's centre copy
>   **fades as it walks past** so it no longer zooms over the next set's cards.
> - **Stones → Process:** the panel **rises from the bottom** over the dimmed stones (was slide-in from
>   the right); the dead frozen-stones gap before it appears is cut from ~1 screen to ~1 short scroll
>   (desktop timing; mobile keeps original timing, still from the bottom).
> - **Not yet ported:** these Round-2 changes are **V1 only** — `index-v2.html` still has the old
>   behaviour, so the V1/V2 toggle now shows two different experiences.

> **Round 3 (26 July 2026) — refinements (`index.html` / V1):**
> - **Reviews:** backflip slowed (plays over more scroll so it's watchable); cards made shorter /
>   near-square (0.86 ratio); hover now shows the **gold cursor-glow** like the Services cards —
>   removed the whitish sheen/arris pseudos that were overriding it (the "grey bar").
> - **Services → Gallery:** services holds only briefly then the gallery arrives (no ~3-scroll
>   freeze) — same short-lead-in pattern as stones→process.
> - **Gallery:** the moving "glare" was the sheet's own marble background scrolling — made the sheet
>   **solid** (static marble now lives only in the pinned `gal-bg`). The **"Projects, one by one"
>   headline is pinned** at top-centre while cards animate below it. Cards **shrunk** and the centre
>   copy now **fades in only once the cards reach the walls**, so nothing is ever covered.
> - **Stones:** a **horizontal trackpad swipe** over the wheel steps through stones (vertical still
>   scrolls the page); wheel sized down for breathing room (was edge-to-edge on tall screens).

> **Round 4 (26 July 2026) — final polish (`index.html` / V1):**
> - Reviews: all three cards now **flip up together** (stagger removed).
> - **Gold section divider** between reviews and services, with a shine that **slides side-to-side as
>   you scroll** past it.
> - Gallery: the set→set **walk is quicker**; added **Get in touch** + **View all as grid** buttons
>   under the centre copy (grid = fullscreen overlay of all 8 projects, each opens its detail).
> - **Both big empty gaps removed** — after the gallery (before stones) and after the process (before
>   the estimator). Cause was the trailing `padding-bottom` compensation added when panels were pulled
>   up; dropped it so the next section fills the tail.
> - **Stones spacing**: smaller wheel, space under the material tabs, and SEE THE FULL SELECTION lifted
>   off the bottom edge.
> - **Stones swipe**: only a clearly-horizontal swipe (`|dx| > |dy|·2`) rotates a stone, so a
>   slightly-angled up-swipe still scrolls the page.
>
> A full engineering **HANDOVER.md** now sits alongside this file for the next session. Still open:
> the **V2 decision** and the real-data items (form endpoint, site-wide phone number, Checkatrade).

Date: 26 July 2026 · Audited at 375×812 (mobile), 768×1024 (tablet), 1280×800 (desktop) against `Website Demo/index.html` served by `dev-server.js`.

---

## Executive summary

The site is a single 4,114-line HTML file with heavy scroll choreography (sticky pins, hold veils, slide-in panels, scroll-driven card animations). It was built desktop-first, and two structural problems break everything downstream:

1. **Horizontal overflow is never fully clipped.** Elements deliberately parked offscreen (review cards, the process panel, FAQ slabs) widen the document. On desktop this shows a horizontal scrollbar (doc is 1,669px wide on a 1,280px viewport). On mobile it is catastrophic: the layout viewport expands to ~769×1666 on a 375×812 phone, so the fixed header becomes 770px wide (its "Get a quote" button sits offscreen), the page pans sideways, and — critically — **all JS scroll math reads `window.innerHeight` = 1666 instead of 812**, so every trigger line, runway and hold is computed at roughly double length. This one bug is the root of most of the "mess on mobile".

2. **Scroll-theatre economics.** On desktop, the page is 14,678px tall = 18.3 viewports, of which roughly 11,400px (~14 viewports, well over half) is animation runway with no new content: services hold 1,600px, gallery gather 4,400px, stones hold 1,600px, process slide-in 2,173px, FAQ 1,600px. On mobile (with the doubled math) the page balloons to 20,818px ≈ 26 screens of swiping. The complaint "I swipe 2–3 times at Choose your stone before anything changes" is precisely the stones section's 1,600px dead hold tail (2 full viewports).

---

## Root-cause chain (mobile)

```
unclipped offscreen elements (process panel, rev cards, FAQ slabs; #faq scrollWidth 808)
        → document scrollWidth ~769px on a 375px phone
        → Chrome expands the layout viewport to 769×1666
        → fixed header sizes to 770px  → header CTA + version toggle offscreen
        → page can be panned sideways  → sections drift out of frame
        → window.innerHeight reports 1666, CSS vh ≈ 812
        → all scroll triggers/runways/holds computed ~2× too long
        → animations crawl, holds need 2–3 extra swipes, cards gather at wrong positions
```

Fixing the clipping (e.g. `overflow-x: clip` on `body`/section wrappers, or clipping each parked element inside an already-clipped ancestor) collapses this whole chain.

---

## Section-by-section

| Section | Desktop 1280×800 | Mobile 375×812 |
|---|---|---|
| Header/nav | OK (nav + CTA visible) | **Broken** — nav is `display:none` below 1120px with **no hamburger replacement**; header is 770px wide so the CTA that *would* fit is pushed offscreen. Only the logo is visible. Tablet identical. |
| Hero | OK | **Good** — stacks correctly: headline, copy, 2 CTAs, trust chips all visible. |
| Reviews | OK (3-up grid, paging) | **Poor** — one card at a time; prev/next arrow buttons **overlap the review text** on both sides; long quotes clip mid-sentence (Read more does work). The entering/leaving card parks offscreen and contributes to the overflow bug. |
| Services | OK | **Good** — cards stack single-column, readable, CTA per card. |
| Gallery ("Projects, one by one") | Works, but 4,400px runway is long | **Broken** — the 8 project cards render as ~135×89px thumbnails piled on top of each other at 3–59% opacity (half `visibility:hidden`), effectively invisible dark-on-black. ~4,700px of scroll shows a black void with a heading. |
| Supplier strip | OK (marquee) | OK (marquee edge-crop is by design). |
| Stones ("wheel") | OK; hold after it = 1,600px dead scroll (the 2–3-swipe complaint, present on desktop too) | **Poor** — wheel renders but slabs are nearly invisible (dark procedural marble on near-black, entrance state); hold tail doubles via the vh bug; heading/UI hard to find. |
| Process (slide-in panel) | Works; 2,173px runway | **Broken** — panel parks half-way across the screen with its heading clipped at the right edge ("A process with…"); underlying stones section remains visible on the left — two sections interleaved. |
| Estimator | OK | **Good** — single column, sliders and toggles usable. |
| Why TopCat | OK | **Good** (feature image is an acknowledged placeholder). |
| FAQ | OK; 1,600px runway | **Good visually** — slab cards render nicely; cards are very tall for one question each; `#faq` measures 808px wide (overflow contributor). |
| CTA + form | OK | **Good** — stacks well. Form is a demo stub (see Content). |
| Footer | OK | **Good** — single column. |

---

## Interaction & UX issues (all sizes)

- **Dead scroll holds**: stones → process hold and services hold are each 2 viewports of nothing changing on screen. Users read this as "the page is stuck". The gallery's 5.5-viewport gather is the same problem stretched further.
- **No navigation below 1120px** (tablet included) — users can't jump to Estimate/FAQ/Contact at all, on a ~21k-px-tall page.
- **CTA drought mid-page**: quote CTAs exist in the header (desktop only), hero, stones section, and the bottom form. Nothing in gallery, process, estimator (natural spot: "get this priced properly"), why, or FAQ. On mobile, effectively: hero → (18,000px later) → form.
- **Version toggle (V1/V2)** floats bottom-right and is offscreen on mobile due to the width bug; also not something end users should see in production.
- **Momentum/jump scrolling breaks choreography**: sections that "deal in" on scroll triggers can be skipped entirely by fast scrolls/anchor jumps, leaving black voids (observed in gallery and reviews on instant jumps).

## Accessibility notes (quick pass, not exhaustive)

- Only 5 `alt` attributes in the file; review-card images use empty alt (acceptable if decorative). 16 `aria-label`s present — arrows/buttons are reasonably labelled.
- `prefers-reduced-motion` is respected in several animations — good — but the scroll-jacked runways themselves remain.
- Keyboard: review cards get `tabIndex`, but the scroll-choreographed sections (gallery, process) have no keyboard path to reach their content states.
- Tap targets: the reviews prev/next arrows overlap text on mobile; the wheel relies on horizontal drag inside a vertical page (grab-conflict).

---

## Content & data findings

### Reviews — VERIFIED REAL ✅
All 16 reviews in the site (and in `Docs/Topcat Reviews.docx` — they match word-for-word) are **confirmed verbatim, live Google reviews** for Topcat Worktops Ltd (Google Business Profile, 27 Old Gloucester St, London WC1N 3AX; phone 0800 098 2812; topcatworktops.co.uk):

- Live listing shows **5.0 stars, exactly 16 reviews, all 5-star** — same count, same order as the site.
- Five distinctive phrases spot-checked verbatim against the live Maps reviews (e.g. "came in at least £1,200 cheaper" — Jhanzeb Chaudhry; "Calacatta Viola worktop" — Abbas; "installed within 48 hours" — CHERIF).
- Live reviewer names (in site order): Judy Z., Abbas, Maheen Amjad, Davinder Dhillon, Maria Shahsawar, Kav Patel, Kinga Skubiszewska, Joel Brizman, Jhanzeb Chaudhry, farah remadna, CHERIF, Tabrez Chaudhry, naied khan, Han LnB, Ali Jaffer, Megan Webb. The site currently attributes every card to just "Google review" — real first names + "via Google" would add credibility.
- "Nick/Nik" in reviews matches the company (Nick — Managing Director per the About page).
- Only difference: the doc/site versions replaced em-dashes with commas.

### Placeholders still in the build
- **Phone number is fake**: `tel:+441727000000` (two places). Real number: **0800 098 2812**.
- Email `hello@topcatworktops.co.uk` — plausible but unconfirmed; verify before launch.
- **Form doesn't send** — submit is intercepted with "this is a demo form, so nothing was sent" (acknowledged in code; needs a real endpoint).
- CTA section shows "RATING FIGURES ARE PLACEHOLDERS" — the Google 5.0 figure is actually correct (16 reviews); the **Checkatrade 4.9 is unverified** (they are on Checkatrade but no rating found; remove or verify).
- Review-card back "project photo" images are generated placeholders; Why-us feature image and process/project imagery are placeholder frames.
- V2 (`index-v2.html`) differs from V1 by ~115 lines (styling variants); same architecture, same issues.

---

## Workflow note

This folder (`Topcat-Worktops-main/`) is a **GitHub ZIP download, not a git clone** — there's no `.git` directory, so you can't pull or push from here. The Word doc's instructions expect `git clone https://github.com/lukecopley6/Topcat-Worktops.git`. Recommend cloning properly (or `git init` + set the remote) before making changes, so work can go back up to GitHub.

---

## Recommended fix order (to discuss one-by-one)

1. **Clip horizontal overflow globally** — kills the mobile layout-viewport bug, fixes the header width, sideways drift, and the doubled scroll math in one move. Cheap, high impact, no visual redesign.
2. **Mobile nav** — hamburger (or minimal sticky "Get a quote" + menu) below 1120px.
3. **Shorten/disable the holds and runways on touch/small screens** — collapse stones/services/FAQ holds, and swap gallery + process choreography for plain stacked layouts on mobile (media-query the scroll-jacking away rather than rewriting it).
4. **Reviews on mobile** — move arrows outside the card, show reviewer first names, real 5.0/16 figures.
5. **Gallery mobile layout** — simple swipeable strip or stacked cards instead of the gather effect.
6. **Stones visibility** — lift slab brightness/contrast on entry; ensure heading + UI visible on mobile.
7. **CTA coverage** — add a quote CTA after estimator and FAQ at minimum; consider a persistent mobile bottom bar (quote / call).
8. **Real data pass** — phone number, form endpoint, reviewer names, Checkatrade figure, remove version toggle for production.
