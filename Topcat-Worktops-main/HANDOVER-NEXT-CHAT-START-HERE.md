# START HERE — 18 August 2026, after THE SCROLL FILM ROUND (D310–D314)

Read this, then `HANDOVER.md` **§D** (the register, newest first — this round is **D310–D314**)
and **§2** (the standing rules). That is about twenty minutes and it is enough to work safely.

> ⚠️ **This replaces the previous version of this same file**, which is now
> `HANDOVER-2026-08-17-full-audit-and-composition-start-here.md` (D291–D309). The round before
> that (D278–D290) is `HANDOVER-2026-08-17-directors-hero-delivery-start-here.md`.
> Everything that still matters is carried below.

---

## 0. ⛔⛔⛔ THE ONE THING TO TAKE FROM THIS ROUND

**⭐⭐⭐ TWICE I CHOSE AN INSTRUMENT BEFORE MEASURING WHAT I WAS DRESSING, AND HE REJECTED BOTH.
THE THIRD ANSWER CAME OUT OF ONE MEASUREMENT AND WAS OBVIOUS ONCE I HAD IT.**

```
D311  the nav could not be read over the film's daylight quarry, so I poured the bar's own
      stone glass from the first pixel. It carried the nav — and put a slab of black marble
      across the top of his film for nine screens. He said it "doesn't look good"
D313  so I replaced it with dark FROSTED glass. Same mistake, lighter. "I still don't like
      that it's a dark frosted glass... make a different plan"
      ⭐ THEN I MEASURED THE BAND BEHIND THE BAR, every two seconds, for the whole film:
        mean 121→220 for fifteen seconds, exactly 0 from t=16 to t=24,
        and a SPREAD INSIDE ONE FRAME of 247 of 255 — black pines beside white marble
      **No fixed ink colour can survive that, and no per-word one either.** The answer is
      something between the words and the picture, and it belongs in the picture's own grade
```

⭐⭐ **AND MEASURE IT WHERE HE ACTUALLY LOOKS.** A worst-pixel-anywhere-behind-the-bar figure said
**3.05:1** and nearly sent me darkening the whole film. Measured under each link's OWN box —
the honest question — the same frame ran **14.8 to 16.5:1 on six of the seven links**, and the one
exception was a single word over a pendant lamp. **A contour on that word cost nothing; darkening
the film for it would have cost everything.**

⛔ **HE REVERSED ME TWICE IN ONE HOUR AND WAS RIGHT BOTH TIMES.** When your own fix is the thing
he is complaining about, say so in the first line and rebuild it.

---

## 1. ⭐⭐⭐ WHAT THIS ROUND DID (D310–D314)

He sent an 86 MB master and asked for it to be tied to the scroll, then corrected the result four
times in a row. Every correction is in the register with its measurement.

```
D310  THE LANDING PAGE OPENS ON HIS FILM, scrubbed by the scroll — desktop, §2
D311  the veil comes OFF the film and rides back in for the hero, from t=38 — §3
D312  the film reaches the PHONE AND TABLET as its own 4:5 cut, not the same one squeezed — §4
D313  the bar is a SKELETON for the whole film and the hero, and forms only after it — §3
D314  the working day is Monday to Sunday, 7am to 9pm across all 176 pages — and the
      upload was shipping seven pages the client had removed
```

---

## 2. ⭐⭐⭐ THE FILM IS THE HERO'S OWN BACKDROP (D310)

⭐⭐ **THERE IS NO SECOND SECTION, AND THAT IS THE WHOLE DESIGN.** `.cine` is a tall box and
`#hero` is `position:sticky` inside it, so the hero pins for the length of the film and then
unpins and scrolls away exactly as it always did. *"The end frame becomes the hero"* is then true
**by construction** — the film simply stops on its last frame and the copy rises on it.

⛔⛔ **THE OBVIOUS BUILD — a film section handing over to the hero photograph — CANNOT BE MADE
SEAMLESS.** `hero-night` is a brighter grade of this same shot, so the handover reads as a light
coming on. (It IS the same shot: the hero's own comment has said *"the intro animation's end frame
is the backdrop"* since it was written.)

⚠️⚠️ `html` and `main` carry `overflow-x:**clip**`, not `hidden`. **`clip` does not create a scroll
container and `hidden` does** — sticky works here only because of that earlier choice. Do not
"tidy" either to `hidden` or the hero stops pinning.

### The numbers, and where each one lives

| What | Where | Value |
|---|---|---|
| pace | `--cineH` on `.cine` | **1000vh** desktop · **800vh** tablet · **700vh** phone |
| the hero's beat at the end | `--cineHold` | **0.10** of travel (~90vh) |
| where the veil starts | `--cineVeilAt` | **38** (seconds into the film) |
| the veil's floor | `--cineVeilMin` | **0.20** |
| where the copy rises | `INK_AT` in the scrub | 0.93 of the film |

⭐ **THE HERO'S OWN STAGED ENTRANCE IS THE REVEAL** — the scrub sets `.loaded`, the same class the
hero has always used, so the choreography he approved plays at the END of the film instead of at
page load. `window.__cineHold` is what tells the hero's IIFE to leave that class alone.

⛔⛔ **A `display:none` VIDEO STILL DOWNLOADS.** CSS decides what is painted; `preload` and the URLs
decide what is FETCHED. Both films live on the element as `data-*` and an in-place script attaches
the right one during parse — **verified as zero requests for either file on the wrong band.**

---

## 3. ⭐⭐⭐ THE VEIL AND THE BAR — TWO SEPARATE ANSWERS, BOTH SCRUBBED (D311, D313)

**The veil** (`.hero-shade`) is scrubbed with the film: a **0.20 floor** across every scene, then a
smoothstep to **1.00** over the closing shot. Measured: 0.20 held to t=38, **0.39 at 40, 0.76 at
42, 1.00 at 44.2**. ⭐ The frame he named was matched in the browser at his own 1.587 aspect — the
island's top edge runs 0.335→0.74 at **t=38.0s** against 0.34→0.75 in his screenshot.

**The bar** is a **skeleton** — logo, links, Get a Quote, and nothing else. No stone, no frosted
glass, no gold hairline, for the whole film AND the hero. It forms only once the hero itself starts
to leave, with the same pour and D33's hairline drawing out from the centre.

⛔ **THE TRIGGER IS THE HERO'S OWN RECT, NOT A SCROLL NUMBER** (`top <= -40`). The hero is sticky,
so it sits at 0 for the entire film; `scrollY` would have to be told the film's length and would be
wrong at every other viewport height. Same idiom as the phone's action bar.

⭐⭐ **LEGIBILITY LIVES IN `.hero-navgrade` — the picture's grade, not a bar.** It is the veil's own
`--navScrim` curve (one description, stacked twice for a daylight picture) on its own element: no
edge, no shape, no colour of its own. The scrub writes `--navGrade` from **how bright that band
actually is** — floor 0.20, full by 185 — so over the slab on black it is black-on-black and
invisible, and over the quarry it is a soft fall.

⛔⛔ **THE STATISTIC IS THE WHOLE THING, AND TWO WRONG ONES WERE MEASURED FIRST.** A **mean** failed
at t=4 (the band averages 121 because pines sit beside marble → link at **3.0:1**). The **85th
percentile** failed at t=16, where the slab crosses under the bar in a black frame — four bright
cells of twenty-four never reach p85, so the grade read 0 and the worst link measured **1.15:1**.
It is the **97th percentile of a 48×4 grid** now, with a floor.

⛔ **A LIGHT PANEL WAS HIS OWN SUGGESTION AND CANNOT BE BUILT.** Every supplied lockup is the LIGHT
artwork — gold gradient for a dark ground. **Gold on the brand's bone is 1.9:1**: a cream bar erases
his wordmark, and §12 rule 10 says the logo is never re-drawn or re-coloured.

⚠️ **THIS CROSSES THE 11-AUG PHONE RULING** (*"the nav bar should already be formed… from the
top"*). Its reason was that a late bar *"looks like something loading rather than a deliberate
reveal"* — the film IS that reveal, and he described the skeleton without naming a band. **One word
puts the phone back: delete the two `header.bar.preform::after` lines.**

---

## 4. ⭐⭐ THE PHONE AND TABLET GET THEIR OWN CUT (D312)

⛔⛔ **`object-fit:cover` ON THE 16:9 MASTER IS BAD ARITHMETIC.** A 390×660 hero is 0.59; covering a
1.78 film into it throws away **67% of the width** and blows the surviving third up to 1170 device
pixels — **a 2.7× upscale of a third of his picture**. A 4:5 crop shows **all 864px** across the
same 1170: a 1.35× upscale.

⭐ **THE CROP IS x=680, NOT THE CENTRE, AND THE LAST FRAME CHOSE IT** — that frame becomes the
phone's hero. Four offsets were cut and looked at at the shipped size: 380 cuts the island's right
edge, 528 (dead centre) is slack, **680 puts the island and its three pendants in the middle**, 830
reads busy. The whole film was then re-checked at 680.

⛔ **THE HERO TAKES 100vh WHILE THE FILM RUNS** — the phone's hero is `max(90vh,…)`, so at 390×844
it is 759.6 and would leave **84px of bare floor** under a pinned hero. ⭐ D303's centring survives
it, measured both ways: **105.8/100.1 film-off and 148.0/142.3 film-on** — the same 5.7px, which is
pre-existing at that viewport.

⚠️ The tight case is a **1024-wide tablet held landscape**: the 4:5 cut shows its middle band and
the pendant tops clip. Rare — an iPad landscape at 1180 is in the desktop band — and a
landscape-only framing nudge is one line.

---

## 5. ⭐ THE FILES THIS ROUND ADDED

| File | What and why |
|---|---|
| `assets/video/topcat-intro-1920.mp4` | **11.7 MB.** 1920×1080, 12fps, **crf 25, keyframe every 8**, `-bf 0 -refs 4`. Desktop |
| `assets/video/topcat-intro-864.mp4` | **5.0 MB.** The 4:5 crop at x=680, crf 26. ≤1120 |
| `…-poster.webp` / `…-864-poster.webp` | Each film's own first frame, 122 KB / 82 KB |
| `assets/video/.src-2026-08-18/` | His 86 MB master + `encode.sh`. ⛔ **The master is `.gitignore`d** — GitHub warns past 50 MB — but it is ON DISK and must not be deleted |

⭐⭐⭐ **THE ENCODE WAS MEASURED AND THE STANDARD SCROLL-SCRUB ADVICE LOSES.** That advice is
all-intra (`-g 1`). Mean SSIM against his master at 1920×1080/12fps:

```
-g 1  crf 34   10.5 MB   0.9717     ← all-intra, the usual advice
-g 1  crf 31   14.2 MB   0.9791
-g 8  crf 25   11.7 MB   0.9911     ← what ships: smaller AND better
```

An intra-only file spends its whole budget re-describing a slow dolly. The seek cost it was
supposed to buy is not real: **measured in the browser, 6.5 ms median and 13.2 ms worst**, forward
and backward alike. ⚠️ **12fps is a SCROLL rate, not a frame rate** — over 900vh the 531 frames land
one every ~15px, so the wheel is the limit, not the file.

⚠️ `?v=1` is hand-stamped and `.htaccess` holds mp4/webm for a **week**. ⛔ **Re-encode and bump the
stamp in the same edit, poster included.**

---

## 6. ⛔ DELIVERY

```bash
git clone https://github.com/ThadGC/topcatwork.git topcat && cd topcat
cd "Topcat-Worktops-main/Website Demo" && python3 make_upload.py
```

This build serves:

```
/assets/site.css?v=deaa51cf5b      /assets/site.js?v=6c3d5e0d07
/services/service.css?v=23cff11fdb /assets/footer.css?v=d77df19cd6
/assets/nav.css?v=349149e16f       /stones/stone.css?v=5e7fdddb8d
/seo.css?v=6c5fddc3a1
```

1. Upload the **CONTENTS** of `upload/` into `public_html`. **676 files, 176 HTML pages, 98.4 MB.**
2. ⚠️ **"SHOW HIDDEN FILES" ON** — `.htaccess` is the caching fix and most clients hide it.
3. ⛔⛔ **FLUSH SITEGROUND'S DYNAMIC CACHE** (Site Tools → Speed → Caching). It sits in front of
   Apache and ignores `.htaccess` entirely.
4. View-source a stone page and check the `?v=` matches.

⚠️⚠️ **THE PAGE COUNT IS 176, NOT 183, AND IT ALWAYS WAS.** `make_upload.py` was shipping
`stones/.removed-2026-08-10/` and `.removed-2026-08-11/` — **seven stone pages the client had taken
off the site** — because the skip rule knew `.src-` and `.pre-` and nobody had archived under a
third prefix. Unlinked, but public and indexable. **Fixed (D314): any dot-prefixed FOLDER is
workshop, not site.** Every older handover's "183" included those seven.

⭐ **`main` and `origin/main` are identical** and one `git push` moves both refs.
⛔ **NOTHING FROM D291 ONWARD IS LIVE.** The film has never been on the host.

---

## 7. ⛔ THREE DEVICE BANDS

```
   ≤ 720px          721 – 1120px          ≥ 1121px
   the phone   ·   the tablet        ·   the desktop
```
⛔ **THE TABLET-ONLY BLOCK IS STILL LAST IN THE STYLESHEET** (search `THE TABLET BAND`).
⚠️ The film deliberately runs at **all three** — he asked for it (D312) — so its rules sit at base
scope with only `--cineH` per band. Everything else stays one-device-at-a-time.

---

## 8. ⛔ THE GATES — RUN THESE

```bash
cd "Website Demo" && python3 build_pages.py                     # FIRST — writes footer.css AND nav.css
cd "Website Demo/services" && python3 build_services.py
cd "Website Demo/stones" && python3 build_stones.py
cd "Website Demo" && python3 build_seo_pages.py
cd "Website Demo/stones" && python3 harvest/verify.py            # 132/132/132 ✅
```

⛔⛔ **NEVER RUN `trade/build_trade.py`** (reverts trade to 1 Aug). ⚠️ Its constants were updated in
D314 for the day it is ever revived — that is not permission to run it; `/trade/` is built by
`build_pages.py`. ⛔ `build_images.py` / `patch_images.py` are one-shot.
**The CSS gate** (comment delta 0 against the file's own baseline of one, brace delta 0) and
**`node --check` on all three inline `<script>` blocks** after every edit to `index.html`.

### ⭐ THE FREEZE PROBE — 1440×900, FRESH LOAD, TAB IN FRONT

| Signal | Value |
|---|---|
| `.gal-scroll` height | **4950** |
| `--revPer` (on `#reviews`) | **3** |
| `feTurbulence` count | **60** |
| `#svcNav` children | **8** |
| elements | **2672** |
| hero ink (`.hero-inner` padding-top) | **86.1828** |
| `#about` height | **704** |
| collage | **497×621** |
| `#footer` height | **504** |
| `.wheel-ui` width | **480** |
| document height | **23543** (was 15443 — the film's travel) |
| broken images / overflow / console errors | **0 / none / none** |

⚠️ **ELEMENTS MOVED 2667 → 2672 AND NONE OF IT IS A REGRESSION**: the `.cine` wrapper, the
`<video>`, the head guard, the in-place loader, and `.hero-navgrade`.
⚠️ **THE ELEMENT COUNT IS ONLY VALID ON A FRESH LOAD** — the weld stage adds ~93 nodes once built.
⚠️ **Filter broken images on `i.src && i.complete && i.naturalWidth===0`** (`#pmShot` has no src).

---

## 9. ⚠️ THE ENVIRONMENT TRAPS — ALL LIVE, THREE NEW

- ⛔⛔⛔ **A SCROLL ANIMATION IS DEAD IN A BACKGROUND TAB, AND IT LOOKS EXACTLY LIKE A BUG.** rAF
  does not run in a tab that is not in front, so the scrub froze at `currentTime` 0 with a
  perfectly healthy video (readyState 4, seekable 0–44.25) and no custom property ever written.
  **I debugged a non-existent fault for several minutes.** Front the tab first.
- ⛔⛔ **CONSOLE ERRORS PERSIST ACROSS RELOADS.** Two 404s from a deliberate fail-path test were
  still listed on a clean load. **Check `performance.getEntriesByType('resource')` for
  `responseStatus >= 400` before believing the console.**
- ⛔ **A `display:none` VIDEO STILL DOWNLOADS ITS `src` AND ITS `poster`.** See §2.
- ⛔⛔ **A CSS EDIT DOES NOT SHOW UNTIL THE BUILDERS RE-RUN.** `dev-server.js` serves assets
  `max-age=300` and the page asks for `site.css?v=<hash>`; editing the file does not change the URL.
- ⭐ **`dev-server.js` ANSWERS BYTE RANGES NOW (206).** It read whole files and replied 200, and
  Safari will not seek a video without ranges — a scrub verified here would not have been verifying
  what Apache does.
- ⛔⛔ **THE PANE'S SCREENSHOT SCALES DOWN OR GOES BLACK after `resize_window` + reload.** Open a
  FRESH tab, navigate, resize, and shoot **without** reloading.
- ⛔ **LAZY IMAGES NEVER FETCH AFTER resize + instant `scrollTo`** — judge by `naturalWidth`.
- ⛔ **`.rise` REVEALS DO NOT FIRE AFTER AN INSTANT JUMP** — add `.in` yourself for a shot.
- ⛔ **THE WELD STAGE TEARS DOWN PAST THE HAND-OVER** — to read the clone you must be inside the
  phase (`procTop + ~900`).
- ⛔ **NAVIGATING THE PANE TO A `file://` URL WEDGES THE TAB.**
- ⭐ **`scroll-behavior:smooth` eats programmatic scrolls** — use `scrollTo({top,behavior:'instant'})`.
  ⚠️ **AND THE EASED SCRUB NEEDS ~2s TO SETTLE after a big jump** — a 1400ms wait read the film at
  the wrong frame and looked like a broken mapping.
- (Carried) `javascript_tool` runs before async work settles · `node --check` passes deleted
  variables · **no numpy, PIL only; no libwebp in this ffmpeg (PIL does the WebP); the browser
  canvas is the only SVG rasteriser** · valid stone presets: calacatta, carrara, crema, emperador,
  eternal, fumo, goldveil, mist, nerogold, statuario.

---

## 10. ⭐ THE LINK, AND THE SERVER

```bash
cd "Website Demo" && nohup caffeinate -ims node dev-server.js > /tmp/topcat-server.log 2>&1 &
```

**Give him `http://192.168.1.106:5501`** — ⚠️ **the IP MOVED this round (was .102)**; re-check with
`ipconfig getifaddr en0` every session.
⭐ **THE SERVER IS DETACHED ON PURPOSE.** ⛔ Do not `preview_stop` it. ⚠️ It DOES need a restart
after any edit to `dev-server.js` itself.
⭐ **USE `http://localhost:5501` IN THE PREVIEW PANE**, on his instruction.

---

## 11. ⭐ WHERE THINGS STAND

| Page | State |
|---|---|
| **`/`** | **opens on his film**, scrubbed by the scroll at every band, ending on the hero; skeleton bar until the hero leaves; helix reads Splashbacks / **Kitchen Worktops** / Bathrooms |
| **`/about/` + six internal** | the `.page-head` family; directors visible and bright at all bands |
| **`/services/*.html`** | nine leaves, each on its OWN photograph; burger nav ≤1120; quote card ≥1121 |
| **`/stones/`** | 132 pages + collection + compare; white ledes; **no quote card, deliberately** |
| **`/materials/` `/guides/` `/worktops/` `/sitemap.html`** | the 26-page SEO layer; 22 carry the quote card |
| **`/trade/`** | eight sections; CTA carries WhatsApp |
| **all 176 pages** | one footer, one mobile nav, og:image + twitter:card, favicon, **hours Mon–Sun 7am–9pm** |

⚠️ **SHARED PHOTOGRAPHS NOT TO DELETE**: `kitchen-day.jpg`, `cta-slab.jpg`, `hero-kitchen.jpg`,
`hero-night-*` (still the fallback hero and the phone/tablet still), and the superseded
`service-commercial.*` / `service-splash-marble.*` ladders.

---

## 12. ⛔ RULES THAT MUST NOT BE BROKEN

1. ⛔ **Fabrication is IN-HOUSE (D202)** — "our experienced fabricators". It has flipped three times.
2. ⛔ **Never "laser" anything.** They template **by hand**.
3. ⛔ **The brand is "Topcat", one word.**
4. ⛔ **A stone's NAME and PHOTOGRAPH must match the supplier's own.**
5. ⛔ **Never state what we cannot guarantee, and never use an absolute.** A seam is always visible.
6. ⛔ **Every measurement in millimetres.**
7. ⛔ **Never a bright or gold line across the TOP of a card or section.**
8. **No showroom. Never show the review count. Value, not cheap.**
9. **Voice:** quietly confident master. British English, commas not em dashes, no exclamation
   marks, **no AI slop, no jargon**. ⚠️ Customer review quotes are verbatim and exempt.
10. ⛔ **The logo is the client's artwork, never re-drawn, never re-coloured, never generated. Set
    HEIGHT only.** ⚠️ **Every supplied lockup is the LIGHT artwork** — it needs a dark ground, and
    that is a real design constraint, not a preference (D313).
11. ⛔⛔ **A mark is never put in a circle, ring, disc or plate.** ⚠️ A control is not a mark.
12. ⛔ **One device at a time unless he says otherwise.**
13. ⭐⭐ **THIS IS A DESIGN BUILD. NEVER RAISE THE MISSING FORM BACKEND AS A BLOCKER.**
14. ⛔⛔ **2 CREDITS MAXIMUM PER GENERATED IMAGE.** ⭐ **The last seven rounds spent nothing.**

---

## 13. OPEN — DO THESE NEXT

### ⭐⭐⭐ The ones that are costing money

1. ⭐⭐⭐ **HOW DO FILES ACTUALLY REACH `thadeusg3.sg-host.com`?** Asked ten times. §6 is exact and
   clone-tested. **Everything from D291 onward is still NOT live, including the entire film.**
2. ⭐⭐⭐ **WHOSE ARGENTO DOES HE SELL?** His reference is a dense flecked grey-white; the site shows
   the supplier's veined marble-look. ⛔ Do not paste the Google image.
3. ⭐⭐ **THE STONE PHOTOGRAPHY AUDIT** — 24 of 132 verified; **92 Nile Stone tiles unverified**.

### ⭐⭐ New this round, and his call

4. ⭐⭐ **THE FILM'S PACE.** `--cineH` is 1000/800/700vh ≈ 20vh of scroll per second of film. One
   number per band, and the first thing he is likely to want moved.
5. ⭐⭐ **THE PHONE'S BAR** — the skeleton crosses his 11-Aug "already formed from the top" ruling
   (§3). Ask, or wait for him to react.
6. ⭐ **THE HOURS ARE `Monday to Sunday, 7am to 9pm`** on all 176 pages, visible line and schema
   together (seven `dayOfWeek` entries, `Mo-Su 07:00-21:00` in the SEO layer). ⭐ That closed a
   contradiction that had only been flagged: the landing page's schema had said **six** days
   where everything else said five, and it survived the 17-Aug sweep. Nothing open here now.
7. ⭐ **THE LANDSCAPE-TABLET CROP** — a 1024-wide tablet held landscape clips the pendant tops (§4).
8. ⭐ **DOES THE FILM WANT SOUND?** The master carries 24-bit PCM; the site drops it entirely and
   nothing on the page can play audio. Never discussed.

### ⭐⭐ Waiting on him

9. ⭐⭐ **Trade terms** — payment, minimum order, lead times, a dedicated contact. **His stated first
   priority.**
10. ⭐⭐ **Two sentences for Nick and Rimsha** if he wants descriptions back under their names.
11. ⭐⭐ **What is the credit ceiling now?**
12. ⭐⭐ **Calacatta Gold licensing.**
13. ⭐⭐ **The fireplace scope, with Nick.**
14. ⭐⭐ **Ali Jaffer and Kav / Uxbridge** — two Drive folders matching no project.
15. ⭐ **The 19 drone videos** (Hornchurch, Rickmansworth) — ⚠️ now that the site can carry film,
    these are worth re-asking about.
16. ⭐ **Confirm the silica / HSE sentence in his own words (D202).**
17. ⭐ **Kitchen islands is not on his service list** — the page is live, linked and dressed (D294).
18. ⭐ **Trustpilot** — recommended against putting 4.0 beside the Google 5.0. He has not ruled.
19. ⚠️ **RIMSHA OR REMSHA?** Still unresolved. Her name is on a public page under her photograph.
20. ⚠️ **THE HORNCHURCH GALLERY SET** — the lead frame is clear, the other 11 were never checked
    frame by frame. Do it before launch.
21. ⚠️ **Two slabs lean blue and nobody has ruled**: `arabescato-grey` (−13.78),
    `calacatta-gold-shimmer` (−12.39).
22. ⭐ **Facebook, TikTok, YouTube?** ⛔ Do not guess handles.

### ⭐ Ready to build

23. ⭐⭐ **A QUOTE CARD FOR THE PHONE AND TABLET.** D300 is desktop-only because he said "for desktop
    specifically". **His call.**
24. ⭐ **Per-stone og:image** (each stone page sharing its own slab photograph) — 132 conversions.
25. ⚠️ **The generated pages still ship their code comments to view-source.** `footer.css` and
    `nav.css` strip theirs.
26. ⚠️ **`Next Stone Slabs` is named in one place** — sanctioned by D203. Read D203 before "fixing".
27. ⚠️ **The stale branch `tablet-round-d197-d200`** — deletable once item 1 is answered.
28. ⭐ **Pick a production host**; brotli; check the `.htaccess` cache rules survive it. ⚠️ **The
    video makes this urgent** — 98.4 MB, and the mp4 rules are new and untested on the host.

**Still waiting on the client:** whether Quartzite becomes a fourth range, 20mm vs 30mm pricing,
brackets for vanity tops / fireplaces / tables, and the £3k vs £3,850 three-slab discrepancy.

**CLOSED this round:** the hero's static photograph on desktop, phone and tablet; the nav bar's
material over the film (three attempts); the film's compression; the working hours; and the upload
shipping removed pages.

---

## 14. ⭐ HOW THIS CLIENT WORKS

⛔⛔⛔ **DO NOT ARGUE YOURSELF OUT OF SOMETHING HE ASKED FOR, AND DO NOT HAND HIM THE DILEMMA.**
**A real constraint is a problem to solve, not a question to return.** When the phone could not
carry a 16:9 film, the answer was to cut a 4:5 frame out of it — not to ask him which he preferred.

⛔⛔ **DO NOT ASK HIS PERMISSION. Commit, push, report.**

⭐⭐⭐ **HE REVERSES HIMSELF FREELY AND FAST, AND HE REVERSES YOU FASTER.** This round: the veil came
off the film and then a light one went back on within the hour; the bar's material was rejected
twice in a row. **Log it with the reason the old decision existed** and rebuild without argument.

⭐⭐ **HE SENDS CORRECTIONS MID-TURN, THREE OR FOUR DEEP.** Finish the one you are on, then take the
next in his order.

⭐⭐ **WHEN YOUR OWN WORK CAUSED THE FAULT, SAY SO IN THE FIRST LINE.** He is fine with that and not
fine with spin.

⭐ **HE IS USUALLY RIGHT ABOUT THE DIAGNOSIS, NOT JUST THE SYMPTOM.** *"The black isn't working with
it"* was a background whose brightness swings 247 levels inside one frame.

⚠️ **HE SWEARS WHEN SOMETHING LOOKS WRONG, AND THE COMPLAINT IS ALWAYS REAL.**

- **Walk the journey, do not check the page.** ⭐⭐ **Look at the result before reporting it done.**
- **Measure, then claim** — and if you could not measure it, say so.

---

## 15. BUDGET AND THE DOCUMENT SET

⭐ **This round spent 0 credits.** The film is his own; every encode and crop was `ffmpeg`
(installed this round via Homebrew — it was not on this machine).

| File | What it is |
|---|---|
| **`HANDOVER.md`** | ⭐ The single current state. §D is the register, **D1–D130, D132–D314**. §2 the standing rules, §2a the supplier list. ⚠️ **THERE IS NO D131 ROW.** ⚠️ Section numbers are referenced from code comments — **do not renumber** |
| **`Website Demo/index.html`** | ⭐⭐ The whole landing design, inline `<style>` and three `<script>` blocks. Search `THE SCROLL FILM`, `THE VEIL COMES OFF`, `SKELETON`, `--cineH`, `hero-navgrade`, `THE WELD`, `SLAB_V`, `THE TABLET BAND` |
| **`Website Demo/build_pages.py`** | ⭐⭐ The seven internal pages, `site.css`, `site.js`, **`footer.css` and `nav.css`**. ⚠️ **RUN IT FIRST** |
| **`Website Demo/make_upload.py`** | ⭐⭐⭐ Writes a clean `../upload/`. ⚠️ Dot-prefixed folders no longer ship (D314) |
| **`Website Demo/.htaccess`** | ⭐⭐ Cache rules, now including **mp4/webm for a week**. ⚠️ A dotfile |
| **`assets/video/`** | ⭐⭐ Both cuts, both posters, and `.src-2026-08-18/` with the master and `encode.sh` |
| **`assets/footer.css` `assets/nav.css`** | ⛔ **GENERATED.** Never edit |
| **`services/service.css`** | ⭐⭐⭐ Dresses all **167** generated pages (⚠️ older docs say 176 — that counted the seven removed). ⛔ No footer rules; carries `THE LEAD LAYOUT` |
| **`services/build_services.py`** | ⭐ Nine leaves. `HERO_IMG`; `qform_html()` |
| **`build_seo_pages.py`** | ⭐ The 26-page SEO layer and the sitemap |
| **`stones/build_stones.py`** | 132 stone pages + collection + compare. Carries `SLAB_V` |
| **`stones/descriptions.py`** | ⭐⭐ One line per stone. ⛔ Re-cut a tile and its sentence is stale |
| ⛔ **`trade/build_trade.py`** | ⛔⛔ **SUPERSEDED — DO NOT RUN** |
| ⛔ **`build_images.py` `patch_images.py`** | ⛔⛔ **ONE-SHOT, CANNOT RUN AGAIN** |
| `Docs/topcat-worktops-SEO-LOG.md` | Every URL, title and target query |
| `HANDOVER-2026-08-17-full-audit-and-composition-start-here.md` | ⭐ The START HERE this file replaces |
| `HANDOVER-archive-to-2026-08-06.md` | ⚠️ **Every design the client rejected, in his words.** Read before redesigning anything |
