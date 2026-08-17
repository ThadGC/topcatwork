# START HERE — 17 August 2026, after THE FULL-AUDIT AND COMPOSITION ROUND (D291–D307)

Read this, then `HANDOVER.md` **§D** (the register, newest first — this round is **D291–D307**)
and **§2** (the standing rules). That is about twenty minutes and it is enough to work safely.

> ⚠️ **This replaces the previous version of this same file**, which covered the directors, the
> hero and delivery (D278–D290) and is now
> `HANDOVER-2026-08-17-directors-hero-delivery-start-here.md`.
> Everything in it that still matters is carried below.

---

## 0. ⛔⛔⛔ THE ONE THING TO TAKE FROM THIS ROUND

**⭐⭐⭐ THE PHOTOS WERE ON EVERY PAGE AND THE CLIENT STILL COULD NOT SEE THEM (D291).**

He wrote: *"Why the fuck can I see Nick and Rimsha's photos on the landing page, but not on the
inner about us page? So we pushed it to GitHub, and the update just wasn't there."*

⭐ **MEASURE DELIVERY BEFORE BELIEVING A DELIVERY FAULT.** Local `main` == `origin/main`; the live
host served byte-identical `/about/` HTML, the same `site.css?v=`, both portraits 200 at the local
byte sizes. Nothing was stale anywhere. **The animation was hiding delivered content.**

⛔⛔ **A DECISION VERIFIED ON ONE PAGE IS NOT VERIFIED ON THE SIBLING THAT SHARES THE FILE.**
D279 moved the directors to the FOOT of the collage's build order and verified it on the landing,
where the weld clock (D274) finishes them in full view. `/about/` links the same file with **no
weld**, so it kept the 6-Aug slow clock — tuned when the portraits built EARLY — and the pair
became the tail of a playhead that completed **5,122px after the collage left the screen** at
837×863. Two dark slots at any reading pace. `end` 0.02 → **0.20**, `scrub` 0.062 → **0.14** on
the non-weld branch only; `span`/`step` and the whole weld branch untouched.

---

## 1. ⭐⭐⭐ WHAT THIS ROUND DID (D291–D307)

Two instructions, the audit and then the composition round: *"make sure the About Us pages are
perfect throughout everything... every inner page designed very nicely... do a full audit... things
aren't contradicting... triple check everything"*, then a run of specific corrections on the hero,
the inner pages, the About copy and the portraits. Design and information only — form/email wiring
stays on his schedule (§11 rule 13: never raise it as a blocker).

```
D291  the non-weld collage clock — the directors now land ON SCREEN on /about/ at all
      three bands and on the landing tablet; weld + freeze probe regression-checked
D292  information round: EIGHT counties in every meta/og/schema (30 pages were on four,
      the landing meta still said "St Albans"); og:image on ALL 183 pages (there was
      NONE anywhere, landing had no OG at all) via assets/site/og-cover.jpg; the
      kitchen-worktops title onto the Home-Counties umbrella; /favicon.ico exists (item 16)
D293  the tablet's service tiles at FULL brightness — the client's own 13-Aug ruling was
      implemented ≤600 only; its five rules moved (not copied) to ≤1120 (item 8)
D294  kitchen-islands opens on the HARROW WATERFALL — his own project photo, referenced
      in place from /assets/projects/, no re-encode (item 19)
D295  ONE MOBILE NAV on every generated page — the 170-odd leaf pages had NOTHING below
      1121px; the landing's burger + D194 overlay ported by the D290 mechanism:
      generated assets/nav.css + markup lifted at build + ~20 lines of JS inlined (item 7)
D296  the splashback hero re-cropped so the Australian sockets leave the frame;
      new prefix service-splash-hob-*, ladder tops out at 1200 (its own width)
D297  THE HERO IS CENTRED ON THE WHOLE FRAME at every band, and a short window
      buys hero height to make that possible — see §2a
D298  the directors' tone-down DELETED: they take the collage's own
      brightness(.85) at rest and its brightness(1) on hover, like every tile
D299  About body copy is white (--bone), scoped to that section. A TEST he asked
      for, not a settled decision — the revert is deleting one line
D300  THE INNER PAGES GET A SECOND COLUMN with a sticky quote card — see §2b
D301  About copy 6 paragraphs -> 5, 178 words -> 139, and the freed height is
      SPENT on the two gaps he named rather than quietly shrinking the section
D302  Rimsha re-cut further back, hairline gap 13px -> 5.7px; ?v= bumped to 4
D303  phone + tablet centre BELOW the bar (the opposite of the desktop, and
      both are right — see §2a); hero subtitle is full --bone at every band
D304  READING COPY IS WHITE, SUPPORTING DETAIL STAYS GREY — one `--body`
      token across all four families; contrast 6.58:1 -> 17.43:1 (see §2d)
D305  Commercial opens on his marble-bar frame, 16:9 out of a portrait source,
      q80 because the frame is high-frequency; salon ladder kept on disk
D306  EVERY section subtitle is white — and that fixed a bug I shipped at
      D299: an #about-scoped rule cannot reach the weld's CLONE, so the copy
      turned white only at hand-over. Style by CLASS anything the weld carries
D307  the quote card is centred in the margin (and the grid was 60px out of
      line with every other section), starts level with the first line of
      copy, and its copy no longer promises a quote-by-email process
```

### What the audit scanned and found CLEAN (do not re-scan without cause)

- **"laser"** — zero. **cm** — one hit, inside a customer's verbatim review; their words, stays.
- **Exclamation marks** — two, both inside customer reviews; theirs, stay.
- **Em dashes in visible copy** — zero. **Absolutes wordlist** — zero.
- **reviewCount / aggregateRating** — zero live (one code comment notes the rule).
- **Supplier names** — `sup:` data field only (kept per §2 rule 9) + the sanctioned quartz-page
  sentence. **Showroom** — only as "No showroom trip".
- **Internal links** — zero broken across 176 files. **JSON-LD** — parses on every page.
- **Duplicate `<title>`s** — none. **Trade CTA** — the old open-list note ("hours and no
  WhatsApp") is STALE: the built page has no hours text and six WhatsApp links.

---

## 2a. ⭐⭐⭐ THE HERO IS CENTRED ON THE WHOLE FRAME NOW (D297)

⛔ **D259 CENTRED IT BELOW THE BAR AND HE REJECTED THAT.** The bar is a floating glass pill with
the photograph running under it, so the frame the eye reads starts at **y=0**, not at the bar's foot.

⭐⭐ **THE RELATION IS THE WHOLE THING:** `.hero` centres `.hero-inner`, so the paddings do not
place the ink — only their difference does.

```
gapAbove − gapBelow = padTop − padBottom + titleLeading    →   padTop = padBottom − leading
moving padTop by X moves the composition by X/2
```

⛔⛔ **BUT ON A SHORT WINDOW THE COMPOSITION DOES NOT FIT, AND NO PADDING FIXES THAT.** At 390×676
the copy is 463.5px inside a 608px hero with a fixed 80px bar: centring needs 667px and there are
608. **A composition that does not fit cannot be centred, only squeezed.** So the hero BUYS height
when it is short, and only when it is short:

```
phone   .hero{min-height:max(90vh, min(100vh, 660px))}
tablet  .hero{min-height:max(90vh, min(100vh, 780px))}  + gaps 4/4.4/4.4vh → 3.2/3.4/3.4vh
```

⭐ 90vh is untouched above ~733px, so **D97's peek of the next section survives where it was
designed**. ⚠️ The floors are `calc(120px − 12vh)` and `calc(132px − 12vh)`, **not constants** — the
constraint runs with viewport HEIGHT and a constant is wrong in both directions.
⚠️ **The phone's leading term is the phone's own title size, not `--hTitle`** (that is the desktop's
72px where the phone renders 38). ⚠️ `#hero .hero-inner` in the ≤1120 block out-specifies a bare
`.hero-inner` in the phone block — an edit written there does nothing.

⭐⭐⭐ **AND THE TWO BANDS CENTRE ON DIFFERENT FRAMES — D303, ONE DAY LATER, ON HIS INSTRUCTION.**
The desktop reads from **y=0** (the bar is transparent glass over the photograph, 8.7% of the
hero). The phone and tablet centre **below the bar**, which carries `+ var(--barH)` in their
relation: there the same bar is **12%** of a shorter hero and holds the logo and burger, so it is
furniture and the title must not crowd it. ⭐ It also dissolved the one window D297 could not
solve — at 375x667 the block can no longer walk into the bar, so the floor stops binding.

**Measured after D303** (cap to chips, against the bar's foot and the hero's):
1440×900 **0.00** from y=0 · 390×676 **59.8 / 61.3** · 375×667 **60.6 / 62.1** ·
1024×768 **58.8 / 60.3** · 900×1000 **155.1 / 156.6** — every mobile band even to 1.5px.

---

## 2b. ⭐⭐⭐ THE INNER PAGES HAVE A SECOND COLUMN (D300)

The reading sections sit in `.lead-grid` (`minmax(0,1fr) 372px`, `max-width:1280px`) and the freed
column carries a sticky quote card at `top:calc(var(--barH) + 18px)`.

⛔ **THE GRID ENDS BEFORE THE FAQ ON PURPOSE** — the FAQ and related-services blocks are themselves
multi-column and would be crushed beside a sidebar, and ending the container there is what makes the
card ride down and then be carried away as the full-width band arrives. **No script does it.**
⭐ **22 pages carry it:** 9 service leaves, 5 materials, 9 guides, 4 counties, 4 towns.
⛔ **NOT** the indexes, the sitemap, the collection or any of the 132 stone pages.
⛔ **DESKTOP ONLY (≥1121)** — every rule but the `display:none` sits inside the query, so the phone
and tablet pages are unchanged by construction. A phone form is his call, not an inference.
⚠️ The markup is lifted into both builders (`qform_html()`), the service select is seeded with the
page's own subject, and there is no backend — acknowledged in place, §11 rule 13.

⭐⭐ **D307 RE-ANCHORED THE WHOLE THING.** The container is full-bleed with its left padding computed
onto the page's own content edge — `max(sidePad, calc((100% − var(--maxw))/2 + sidePad))` — because
the first version's `max-width:1280px` put the reading column **60px out of line with every other
section**. The card carries `width:372px` (a block grid item with auto width fills its track, so
`justify-self:center` had nothing to centre), sits in a zero-gap column so the space either side is
equal by construction, and starts on a `margin-top` — never padding, which would ride along and
push the pinned card down the page.

---

## 2d. ⭐⭐⭐ TEXT COLOUR HAS TWO ROLES NOW (D304)

```
--body   (= --bone)   anything a visitor READS      17.43:1
--muted  (55-60%)     anything that LABELS           6.58:1
```

⛔ **`--muted` USED TO DO BOTH**, which is why FAQ answers and project write-ups were as dim as a
chip count. ⭐ Declared in `index.html` AND `service.css` — the stone and SEO pages load the
latter, so one declaration reaches all four families.

**White:** FAQ answers, the prose column, Why bullets, feature/step copy, closing CTA paragraph,
project descriptions, trade cards, the process modal, internal-page hero ledes, stone ledes, the
SEO price table and card copy, the quote card's line, the hero subtitle (D303).
**Grey, on his instruction:** section subtitles, breadcrumbs, nav links, chips, counts, captions,
notes, byline, footer, estimator labels — **and the form's placeholders** ("gray in the fields").

⚠️ Two colours look wrong in a probe and are correct: `.proj-desc p` first matches the gold
"What we did" label, and `.rev-author` has been bone since it was built.

⭐⭐ **AND SECTION SUBTITLES ARE WHITE TOO (D306), REVERSING THE GREY-SUBTITLE HALF OF D304** — his
newer instruction. `.section-sub`, `.faq-sub` and the generated `.block .sub` all take `--body`.

⛔⛔⛔ **THE TRAP THAT COST A ROUND: AN ID-SCOPED RULE CANNOT DRESS WHAT THE WELD CLONES.**
`.weld-about` lives in `#weldStage`, so `#about .about-copy .section-sub` never matched it — the
clone stayed grey while the real section was white, and the hand-over read as the text changing
colour on screen. **Anything the weld carries must be styled by CLASS.**

---

## 2c. ⛔ THE COLLAGE CLOCK — WHO GETS WHICH NUMBERS NOW

```
weldClock (≥1121 + motion + #process on the page)   start 1.21  end 0.576  scrub 0.26   (D274)
everything else (/about/ all bands, landing ≤1120)  start 0.94  end 0.20   scrub 0.14   (D291)
```
⛔ **`span:0.42, step:0.112` ARE THE CHOREOGRAPHY AND BELONG TO THE CLIENT** — do not touch them
to fix a timing complaint; move `end`/`scrub` like both fixes above did.
⚠️ The pair is STILL last in the DOM and last to build (D279): any future page that includes the
collage must check the tail lands on screen THERE too.

---

## 3. ⭐⭐ THE MOBILE NAV PORT (D295) — HOW IT IS WIRED

- **`assets/nav.css` is GENERATED by `build_pages.py`** — never edit it; change index.html and
  re-run. Same comment-strip + inheritance-pinning as footer.css (D290's transplant traps).
- **The three leaf builders lift the markup from index.html at build time** (`_nav_from_index()`)
  and inline `NAV_JS`. One rewrite on the lift: overlay `href="#cta"` → `/contact/` (no leaf has
  a #cta id). A brace in the lifted markup would crash the build by design (f-string guard).
- **service.css owns the leaf bar**: `nav.top` hides at **1120 now (was 960)** and `.bar-cta`
  hides with it — D235's "wherever the burger is, the bar is logo + burger". ⛔ Do not re-split.
- The seven internal pages were never touched — they inherit the landing's nav via site.css/js.
- ⚠️ **The overlay carries the D194 submenus** (Services expands to nine, Stones to six). If a
  leaf page is ever added or renamed, the landing overlay is the ONE place its menu entry lives.

---

## 4. ⭐ NEW SHARED ASSETS THIS ROUND

| File | What it is |
|---|---|
| `assets/site/og-cover.jpg` | 1200×630 share card, cut from `assets/site/.src-2026-08-17/hero-night-source.png` (LANCZOS, JPEG q85, 84 KB). Declared with width/height + `twitter:card` by all four builders AND index.html's own head — the landing had no OG tags at all before this. ⚠️ Re-cut it if the hero ever changes; the builders reference the URL, they do not regenerate the file |
| `favicon.ico` | Web root, 48/32/16 in one file. Rasterised from the client's own `favicon.svg` BY THE BROWSER PANE (canvas → PNG → PIL); ⛔ no SVG rasteriser exists on this machine and the mark is never re-drawn (rule 10). Closes the last console 404 |
| `assets/nav.css` | ⛔ GENERATED — see §3 |

Idea parked, not built: per-stone og:image (each stone page sharing its own slab photo) — needs
132 JPEG conversions; his call on the disk/upload weight.

---

## 5. ⛔ THE UPLOAD, EXACTLY (unchanged mechanism — NEW NUMBERS)

```bash
git clone https://github.com/ThadGC/topcatwork.git topcat && cd topcat
cd "Topcat-Worktops-main/Website Demo" && python3 make_upload.py
```

Now **672 files, 183 HTML pages, ~79 MB** (the three new files are nav.css, favicon.ico,
og-cover.jpg). This build serves:

```
/assets/site.css?v=ad54b74257      /assets/site.js?v=2db7fba80f
/services/service.css?v=6679a739fb /assets/footer.css?v=32e3e12343
/assets/nav.css?v=349149e16f       /stones/stone.css?v=4c72f6abc6
/seo.css?v=2ee91ef254
```

1. Upload the **CONTENTS** of `upload/` into `public_html`.
2. ⚠️ **"SHOW HIDDEN FILES" ON** in the FTP client — `.htaccess` is the caching fix.
3. ⛔⛔ **FLUSH SITEGROUND'S DYNAMIC CACHE** (Site Tools → Speed → Caching → Flush). It ignores
   `.htaccess` entirely.
4. View-source a stone page and check `service.css?v=6679a739fb`. Match = live.

⚠️ **THE STAMPS MOVE WHENEVER THE FILES DO** — always quote what `make_upload.py` prints, never
this table after another edit.

---

## 6. ⛔ THREE DEVICE BANDS — unchanged

```
   ≤ 720px          721 – 1120px          ≥ 1121px
   the phone   ·   the tablet        ·   the desktop
```
⛔ **THE TABLET-ONLY BLOCK IS STILL LAST IN THE STYLESHEET** (`THE TABLET BAND`).
⚠️ The "one device at a time" freeze applies to anything he has not asked about; this round he
asked for everything ("across the board"), which is why D293/D295 touched all bands.

---

## 7. ⛔ THE GATES — RUN THESE (unchanged, plus one note)

```bash
cd "Website Demo" && python3 build_pages.py                     # FIRST — writes footer.css AND nav.css
cd "Website Demo/services" && python3 build_services.py
cd "Website Demo/stones" && python3 build_stones.py
cd "Website Demo" && python3 build_seo_pages.py
cd "Website Demo/stones" && python3 harvest/verify.py            # 132/132/132 ✅
```

⛔⛔ **NEVER RUN `trade/build_trade.py`** (reverts trade to 1 Aug). ⛔ `build_images.py` /
`patch_images.py` are one-shot, cannot run again.

**The CSS gate** (unchanged, §7 of the old file — must print `0` and `0`) and **the JS parse
gate** after every index.html edit. Both are in the previous START HERE verbatim; copy from
there or from HANDOVER.md §8.

### ⭐ THE FREEZE PROBE — 1440×900, fresh load (all unchanged this round)

| Signal | Value |
|---|---|
| `.gal-scroll` height | **4950** |
| `--revPer` (on `#reviews`) | **3** |
| `feTurbulence` count | **60** |
| `#svcNav` children | **8** |
| elements | **2667** ⚠️ was 2659 — D292's nine Open Graph meta tags |
| hero ink (`.hero-inner` padding-top) | **86.183** ⚠️ was 164.683 — D297 centred the hero |
| `#about` height | **704** ⚠️ was 759 — D301 shortened the copy |
| collage | **497×621** ⚠️ was 497×676, same reason |
| portrait tiles | **241×241**, `?v=4` |
| `#footer` height | **504** (1440) · **789** (900) · **1102** (375) |
| `.wheel-ui` width | **480** |
| broken images / overflow / console errors | **0 / none / none** |

---

## 8. ⚠️ THE ENVIRONMENT TRAPS — THREE NEW ONES THIS ROUND, ALL IN THE PANE

- ⛔⛔⛔ **THE PANE'S SCREENSHOT GOES SOLID BLACK ON THE LANDING PAGE AFTER `resize_window`** —
  local AND live, so it is the capture path, not the site: a hidden full-viewport overlay with
  `backdrop-filter` (`#mobileNav`, blur 18px) breaks the off-screen rasteriser. **Users see the
  page fine.** Workaround: `display:none` the four overlays (`mobileNav`, `procModal`,
  `projDetail`, `projLightbox`) before shooting — and even that stops working once a tab has
  been resized repeatedly; the tab's capture surface wedges PERMANENTLY. Open a FRESH tab for
  screenshots after any resize. Leaf pages capture fine.
- ⛔⛔ **LAZY IMAGES NEVER LOAD AFTER resize + instant `scrollTo`** — 16 tiles sat
  `complete:false` with zero network requests. Setting `img.loading='eager'` via JS wakes them.
  Judge "images missing" by `naturalWidth`, never by a screenshot.
- ⛔ **NAVIGATING THE PANE TO A `file://` URL WEDGES THE TAB** — every later navigation returns
  "blocked by policy". Close the tab and open a new one; serve scratch pages from the dev server.
- (Carried) rAF freezes in backgrounded tabs; `javascript_tool` runs before async work settles —
  set state in one call, read in the next; console messages persist across reloads; `node
  --check` passes deleted variables; **no numpy, PIL only; no SVG rasteriser** (browser-canvas
  is the rasteriser now, see §4); broken-image filter is `i.src && i.complete &&
  i.naturalWidth===0` (`#pmShot` has no src). Valid stone presets: calacatta, carrara, crema,
  emperador, eternal, fumo, goldveil, mist, nerogold, statuario.
- ⭐ **`scroll-behavior:smooth` eats programmatic scrolls** — use
  `scrollTo({top,behavior:'instant'})` in the pane or the next read lies.

---

## 9. ⭐ THE LINK, AND THE SERVER

```bash
cd "Website Demo" && nohup caffeinate -ims node dev-server.js > /tmp/topcat-server.log 2>&1 &
```

**Give him `http://192.168.1.102:5501`** — re-check with `ipconfig getifaddr en0`.
⭐ **THE SERVER IS DETACHED ON PURPOSE — PID 5158.** ⛔ Do not `preview_stop` or kill it.
⭐ **USE `http://localhost:5501` IN THE PREVIEW PANE**, on his instruction.

---

## 10. ⭐ WHERE THINGS STAND

| Page | State |
|---|---|
| **`/`** | night-kitchen hero; weld over Process on desktop; directors = the collage's bottom band, now landing ON SCREEN at every band; wheel arrows pinned; tablet service tiles at full brightness |
| **`/about/` + six internal** | `.page-head` family; directors VISIBLE at all bands (D291) |
| **`/services/*.html`** | nine leaves, every one on its OWN photograph now; burger nav ≤1120 |
| **`/stones/`** | 132 pages + collection + compare; burger nav ≤1120; eight-county metas |
| **`/materials/` `/guides/` `/worktops/` `/sitemap.html`** | 26-page SEO layer; burger nav ≤1120 |
| **`/trade/`** | eight sections; CTA carries WhatsApp (the old "hours, no WhatsApp" note was stale) |
| **all 183 pages** | one footer (D290), one mobile nav (D295), og:image + twitter:card (D292), favicon.ico (D292) |

⚠️ **SHARED PHOTOGRAPHS NOT TO DELETE**: `kitchen-day.jpg` (now unreferenced by any hero but
protected), `cta-slab.jpg`, `hero-kitchen.jpg` (unreferenced, kept).

---

## 11. ⛔ RULES THAT MUST NOT BE BROKEN (unchanged — the short list)

1. ⛔ **Fabrication is IN-HOUSE (D202)** — flipped three times, read D202 first.
2. ⛔ **Never "laser"** — templating is by hand. 3. ⛔ **"Topcat", one word.**
4. ⛔ **A stone's name and photograph match the supplier's own.**
5. ⛔ **Never an absolute, never an unkeepable claim.** A seam is always visible.
6. ⛔ **Millimetres everywhere** (estimator's linear metres excepted).
7. ⛔ **Never a bright/gold line across the TOP of anything.** Full gold border at 34% is standard.
8. **No showroom. Never show the review count. Value, not cheap.**
9. **Voice: quietly confident master. British English, commas not em dashes, no exclamation
   marks, no AI slop, no jargon.** ⚠️ Customer review quotes are verbatim and exempt.
10. ⛔ **The logo is the client's artwork. Never re-drawn, height only.** (The favicon.ico was
    browser-rasterised from his file, not re-drawn — that is the only sanctioned path.)
11. ⛔⛔ **A mark never goes in a circle/ring/disc/plate.** A control is not a mark, but D282/D286
    prove the carve-out is not a licence — ask what a control already is before reshaping it.
12. ⛔ **One device at a time unless he says otherwise.**
13. ⭐⭐ **DESIGN BUILD — never raise the missing form/email backend as a blocker.** He named it
    himself this round as his own pre-launch task.
14. ⛔⛔ **2 credits max per generated image.** ⭐ This round spent **nothing** (four rounds running).

---

## 12. OPEN — DO THESE NEXT

### ⭐⭐⭐ The ones that are costing money

1. ⭐⭐⭐ **HOW DO FILES ACTUALLY REACH `thadeusg3.sg-host.com`?** Asked NINE times, still
   unanswered — but ⭐ the 17-Aug upload DID land (the live site matched local byte-for-byte
   before this round's changes), so whatever the developer did worked ONCE. §5 is the exact
   guide. **The current build (D291–D295) is NOT yet uploaded — the live site is one round
   behind until the developer re-runs §5.**
2. ⭐⭐⭐ **WHOSE ARGENTO DOES HE SELL?** His reference is a dense flecked grey-white; the site
   shows the supplier's veined marble-look, verified name-by-name. ⛔ Do not paste the Google image.
3. ⭐⭐ **THE STONE PHOTOGRAPHY AUDIT** — 24/132 verified; 92 Nile Stone tiles unverified; the
   re-harvest offer (with recorded source URLs) is on the table and unanswered.

### ⭐⭐ Waiting on him

4. ⭐⭐ **Two sentences for Nick and Rimsha** if he wants descriptions back (D280 removed mine).
5. ⭐⭐ **What is the credit ceiling now?** Nothing spent for four rounds.
6. ⭐⭐ **Calacatta Gold licensing.**
7. ⭐⭐ **Trade terms** — payment, minimum order, lead times, contact. **His stated first priority.**
8. ⭐⭐ **The fireplace scope, with Nick.**
9. ⭐⭐ **Ali Jaffer and Kav / Uxbridge** — two Drive folders matching no project.
10. ⭐ **The 19 drone videos** (Hornchurch, Rickmansworth).
11. ⭐ **The silica / HSE sentence in his words (D202).**
12. ⭐ **Kitchen islands not on his service list** — page live, linked, and now properly dressed
    (D294); confirm it stays.
13. ⭐ **Trustpilot** — recommended against 4.0 beside the Google 5.0; he has not ruled.
14. ⚠️ **RIMSHA OR REMSHA?** Still unresolved; his dictation this round transcribed "Remshaw",
    which settles nothing. Her name is on a public page.
15. ⚠️ **THE SPLASHBACK HERO'S SOCKETS ARE AUSTRALIAN, NOT UK** — confirmed by eye this round:
    slanted-pin pairs left wall AND right of the orchid, opposite edges so no crop removes both.
    Replace the photograph, retouch, or accept — his call. ⚠️ It is otherwise the right subject.
16. ⚠️ **THE HORNCHURCH LEAD PHOTO** — checked at 1400px this round: play equipment yes, **no
    visible child** (the red shape by the fence is a punching bag). ⚠️ The 11-image gallery set
    was NOT checked frame by frame; do that before launch.
17. ⚠️ **Two slabs lean blue, nobody has ruled**: `arabescato-grey` (−13.78), `calacatta-gold-shimmer` (−12.39).
18. ⭐ **Facebook, TikTok, YouTube?** ⛔ Do not guess handles.

### ⭐ Ready to build

19. ⭐ **Per-stone og:image** (slab photo as each stone page's share card) — see §4.
20. ⚠️ **The generated pages still ship their code comments to view-source** (item 20 of the old
    list) — footer.css and nav.css strip theirs; the PAGES' HTML comments still ship. Same
    treatment would suit them.
21. ⚠️ **~`Next Stone Slabs` named in one place** (quartz page brand sentence) — sanctioned by
    D203, listed so nobody "fixes" it either way without reading D203.
22. ⚠️ **The stale branch `tablet-round-d197-d200`** — deletable once item 1 is answered and
    nothing pulls it by name. The double-refspec push keeps it current meanwhile.
23. ⭐ Production host choice; brotli; check `.htaccess` cache rules survive the host.

**Still waiting on the client:** Quartzite as a fourth range, 20mm vs 30mm pricing, brackets for
vanity/fireplace/table work, and the £3k vs £3,850 three-slab discrepancy.

**CLOSED this round:** old items 7 (leaf mobile nav — D295), 8 (tablet tile brightness — D293),
16 (favicon.ico — D292), 19 (kitchen-islands hero — D294), 22 (the `<title>` — resolved as the
SEO log's recorded umbrella strategy, D292), 23 (four-county metas — D292), and the trade-CTA
"hours and no WhatsApp" note (stale — the built page already carries WhatsApp and no hours).

---

## 13. ⭐ HOW THIS CLIENT WORKS (carried, one addition)

⛔⛔⛔ **Do not argue yourself out of something he asked for, and do not hand him the dilemma.**
⛔⛔ **Do not ask his permission. Commit, push, report.**
⭐⭐⭐ **He is usually right about the diagnosis, not just the symptom** — but ⭐ **this round he
was right about the SYMPTOM and wrong about the mechanism** (*"the update just wasn't there"* —
it was there, the clock hid it). **Take the complaint literally, measure the thing he named, and
if the mechanism is different, prove the real one before touching anything.**
⭐⭐ **He reverses himself freely — log it with the reason the old decision existed.**
⭐⭐ **When your own work caused the fault, say so in the first line.** This round: D279's reorder
plus the untouched 6-Aug clock caused the invisible directors — mine, both halves.
⚠️ **He swears when something looks wrong, and the complaint is always real.**
- **Walk the journey. Look at the result. Measure, then claim — and if you could not measure it,
  say so** (D293's screenshot failed; the row says how it was verified instead).

---

## 14. BUDGET AND THE DOCUMENT SET

⭐ **This round spent 0 credits** — og-cover is a crop of his hero, the favicon is his own SVG
rasterised, the islands hero is his own project photo referenced in place.

| File | What it is |
|---|---|
| **`HANDOVER.md`** | ⭐ The single current state. §D register **D1–D130, D132–D295**. ⚠️ No D131 row. ⛔ §-numbers are referenced from code comments — do not renumber |
| **`Website Demo/index.html`** | ⭐⭐ The landing. Search `THE WELD`, `SLAB_V`, `THE TABLET BAND`, `--revPagerX`, `soloGapX`, `fitStoneName`, `scrollSequence`, `weldClock` |
| **`Website Demo/build_pages.py`** | ⭐⭐ Internal pages + site.css/js + **footer.css + nav.css**. ⚠️ RUN FIRST |
| **`Website Demo/make_upload.py`** | ⭐⭐⭐ Writes `../upload/`. The only answer to "which folder do I upload" |
| **`Website Demo/.htaccess`** | ⭐⭐ Cache rules. A dotfile — FTP clients hide it |
| **`assets/footer.css` `assets/nav.css`** | ⛔ GENERATED. Never edit |
| **`services/service.css`** | ⭐⭐⭐ Dresses all 176 generated pages. ⛔ No footer rules; nav.top/bar-cta hide at 1120 (D295) |
| **`services/build_services.py`** | ⭐ Nine leaves. HERO_IMG maps every leaf to its own photograph (D294) |
| **`build_seo_pages.py`** | ⭐ 26-page SEO layer + sitemap |
| **`stones/build_stones.py`** | 132 stone pages + collection + compare. Carries `SLAB_V` |
| **`stones/descriptions.py`** | ⭐⭐ One line per stone. ⛔ Re-cut a tile → its sentence is stale |
| **`stones/harvest/`** | Pipeline, `LICENSING.md`, `verify.py`. ⛔ No source URL per tile — §12 item 3 |
| ⛔ **`trade/build_trade.py`** | ⛔⛔ SUPERSEDED — DO NOT RUN |
| ⛔ **`build_images.py` `patch_images.py`** | ⛔⛔ ONE-SHOT — CANNOT RUN AGAIN |
| **`assets/team/.src-2026-08-16/`** | Directors' source frames + cut script |
| **`assets/site/.src-2026-08-17/`** | Hero source PNG + cut script (also feeds og-cover, §4) |
| `Docs/topcat-worktops-SEO-LOG.md` | Every URL, title, target query — **the recorded title strategy lives here** |
| `HANDOVER-2026-08-17-directors-hero-delivery-start-here.md` | ⭐ The START HERE this file replaces (D278–D290) |
| `HANDOVER-archive-to-2026-08-06.md` | ⚠️ Every design the client rejected, in his words |
