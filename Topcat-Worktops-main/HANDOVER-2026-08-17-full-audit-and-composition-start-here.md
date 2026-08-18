# START HERE — 17 August 2026, after THE AUDIT AND COMPOSITION ROUND (D291–D309)

Read this, then `HANDOVER.md` **§D** (the register, newest first — this round is **D291–D309**)
and **§2** (the standing rules). That is about twenty minutes and it is enough to work safely.

> ⚠️ **This replaces the previous version of this same file**, which is now
> `HANDOVER-2026-08-17-full-audit-and-composition-start-here.md`. The round before it
> (D278–D290) is `HANDOVER-2026-08-17-directors-hero-delivery-start-here.md`.
> Everything that still matters is carried below.

---

## 0. ⛔⛔⛔ THE ONE THING TO TAKE FROM THIS ROUND

**⭐⭐⭐ FOUR TIMES THIS ROUND I MADE A CHANGE THAT LOOKED RIGHT AND DID NOTHING WHERE HE WAS
LOOKING. THE COMMON FAULT IS NOT CHECKING WHAT ACTUALLY GOVERNS.**

```
D291  the collage clock was verified on the landing; /about/ shares the file with no
      #process, so it kept a clock nobody had re-tuned and the directors never appeared
D306  a colour scoped `#about …` never reached `.weld-about`, the CLONE the weld slides,
      so the copy turned white only when the animation ended — he saw it, I had not
D308  `.about-copy .section-sub{max-width}` was plainly in the document and DEAD: an
      `#about …` pair later in the file out-specifies it. Computed said 520px throughout
D307  `.lead-grid` carried its own `max-width:1280px`, 120px wider than every other
      section, so the reading column sat 60px out of line and nobody had measured it
```

⭐ **THE HABIT THAT CATCHES ALL FOUR: read the COMPUTED value before and after, on the surface he
is actually looking at.** A rule present in the file proves nothing. `getComputedStyle` told me in
one call each time.
⛔ **AND ANYTHING THE WELD CLONES MUST BE STYLED BY CLASS.** `.weld-about` lives inside
`#weldStage`, so no `#about`-scoped rule can ever dress it.

---

## 1. ⭐⭐⭐ WHAT THIS ROUND DID (D291–D309)

Two instructions: a full audit (*"make sure every inner page is designed very nicely… things
aren't contradicting… triple check everything"*), then a run of corrections on the hero, the inner
pages, the text colour, the About copy and the photographs.

```
D291  the non-weld collage clock — the directors now land ON SCREEN on /about/
D292  eight counties everywhere; og:image on all 183 pages; /favicon.ico
D293  the tablet's service tiles at full brightness (his 13-Aug ruling, ≤600 only)
D294  kitchen-islands opens on the Harrow waterfall — his own project photo
D295  ONE MOBILE NAV on every generated page (the leaves had none below 1121)
D296  the splashback hero re-cropped so the Australian sockets leave the frame
D297  THE HERO IS CENTRED, and a short window buys hero height to allow it — §2
D298  the directors' tone-down deleted; they match every other collage tile
D299  About body copy white (superseded by D306, which made it site-wide)
D300  THE INNER PAGES GET A SECOND COLUMN with a sticky quote card — §3
D301  About copy 6 paragraphs → 5, and the freed height SPENT on his two gaps
D302  Rimsha re-cut further back; hairline gap 13px → 5.7px; portraits ?v=4
D303  phone + tablet centre BELOW the bar (opposite of desktop, both right) — §2
D304  READING COPY IS WHITE, supporting detail stays grey — one `--body` token — §4
D305  Commercial opens on his marble-bar frame, 16:9 out of a portrait source
D306  EVERY section subtitle white — and that fixed the weld-clone bug — §5
D307  the quote card centred in the margin, level with the first line of copy
D308  About measure 52ch → 47ch so it stops short of the seam; title gap 10 → 27px
D309  Commercial ⇄ Bathrooms in the HELIX ONLY (a local ORDER permutation)
```

### What the audit scanned and found CLEAN (do not re-scan without cause)

- **"laser"** zero · **cm** one hit, inside a customer's verbatim review · **exclamation marks**
  two, both inside reviews · **em dashes in visible copy** zero · **absolutes** zero
- **reviewCount / aggregateRating** zero live · **supplier names** only the sanctioned quartz
  sentence · **"showroom"** only as "No showroom trip"
- **internal links** zero broken across 176 files · **JSON-LD** parses on every page ·
  **duplicate `<title>`s** none

---

## 2. ⭐⭐⭐ THE HERO — TWO FRAMES, AND THAT IS DELIBERATE (D297, D303)

⭐⭐ **THE RELATION IS THE WHOLE THING:** `.hero` centres `.hero-inner`, so the paddings do not
place the ink — only their DIFFERENCE does.

```
gapAbove − gapBelow = padTop − padBottom + titleLeading
moving padTop by X moves the composition by X/2
```

| Band | Frame it centres in | Why |
|---|---|---|
| **desktop ≥1121** | the WHOLE hero, from y=0 | the bar is transparent glass over the photograph, 78.5 of 900 = **8.7%** |
| **phone + tablet** | the frame BELOW the bar (`+ var(--barH)` in the relation) | the same bar is 80 of 660 = **12%** and carries the logo and burger: furniture, not glass |

⛔⛔ **ON A SHORT WINDOW THE COMPOSITION DOES NOT FIT AND NO PADDING FIXES THAT.** At 390×676 the
copy is 463.5px inside a 608px hero. **A composition that does not fit cannot be centred, only
squeezed** — so the hero BUYS height when it is short, and only then:

```
phone   .hero{min-height:max(90vh, min(100vh, 660px))}
tablet  .hero{min-height:max(90vh, min(100vh, 780px))}  + gaps 4/4.4/4.4vh → 3.2/3.4/3.4vh
```

⭐ 90vh is untouched above ~733px, so **D97's peek of the next section survives where it was
designed**. ⚠️ The floors are `calc(120px − 12vh)` / `calc(132px − 12vh)`, **not constants** — the
constraint runs with viewport HEIGHT and a constant is wrong in both directions.
⚠️ **The phone's leading term is the phone's own title size, not `--hTitle`** (that is the
desktop's 72px where the phone renders 38).
⚠️ `#hero .hero-inner` in the ≤1120 block out-specifies a bare `.hero-inner` in the phone block.

**Measured:** 1440×900 **0.00px** from y=0 · 390×676 **59.8 / 61.3** · 375×667 **60.6 / 62.1** ·
1024×768 **58.8 / 60.3** · 900×1000 **155.1 / 156.6** — every mobile band even to 1.5px.
⭐ The hero subtitle is full `--bone` at every band (D303).

---

## 3. ⭐⭐⭐ THE INNER PAGES HAVE A SECOND COLUMN (D300, D307)

The reading sections sit in `.lead-grid` and the freed column carries a sticky quote card.

```
.lead-grid   padding-left:max(sidePad, calc((100% − var(--maxw))/2 + sidePad))   ← the page's own
             grid-template-columns:minmax(0,724px) minmax(372px,1fr); gap:0        content edge
.lead-aside  position:sticky; top:calc(var(--barH) + 18px); justify-self:center
             margin-top:clamp(30px,4.6vh,54px)   ← starts level with the first line, not the hero
.qform       width:372px                          ← without this the card fills its track
```

⛔ **THE GRID ENDS BEFORE THE FAQ ON PURPOSE** — the FAQ and related-services blocks are
themselves multi-column and would be crushed beside a sidebar, and ending the container there is
what makes the card ride down and then be carried away as the full-width band arrives. **No script
does it.**
⭐ **22 pages carry it:** 9 service leaves, 5 materials, 9 guides, 4 counties, 4 towns.
⛔ **NOT** the indexes, the sitemap, the collection or any of the 132 stone pages.
⛔ **DESKTOP ONLY (≥1121)** — every rule but the `display:none` sits inside the query, so phone and
tablet are unchanged by construction. **A phone form is his call, not an inference.**
⚠️ Measured at 1800: reading column left **384 = the page's own content left**, card **128px from
the copy and 128px from the page border**, card top **0px** from the first paragraph.
⚠️ Markup is lifted into both builders (`qform_html()`), the select is seeded with the page's own
subject, and there is no backend — acknowledged in place, §13 rule 13. The card says *"Get in
touch with Topcat"* and promises nothing about how a quote is produced (his correction).

---

## 4. ⭐⭐⭐ TEXT COLOUR HAS TWO ROLES (D304, D306)

```
--body   (= --bone)   anything a visitor READS      17.43:1
--muted  (55–60%)     anything that LABELS           6.58:1
```

⛔ **`--muted` USED TO DO BOTH**, which is why FAQ answers were as dim as a chip count. ⭐ Declared
in `index.html` AND `service.css` — the stone and SEO pages load the latter, so one declaration
reaches all four families.

**White:** every section subtitle (`.section-sub`, `.faq-sub`, the generated `.block .sub`), FAQ
answers, the prose column, Why bullets, feature and step copy, closing CTA paragraphs, project
descriptions, trade cards, the process modal, internal-page hero ledes, stone ledes, the SEO price
table and card copy, the quote card's line, the hero subtitle.
**Grey, on his instruction:** breadcrumbs, nav links, chips, counts, captions, notes, byline, the
footer, estimator labels — **and the form's placeholders** ("gray in the fields").

⚠️ Two colours look wrong in a probe and are correct: `.proj-desc p` first matches the gold "What
we did" label, and `.rev-author` has been bone since it was built.

---

## 5. ⛔⛔⛔ THE WELD CLONES THE ABOUT SECTION — STYLE IT BY CLASS

`.weld-about` is a **clone** of `#about` living inside `#weldStage`. It is what you watch for the
whole animation, and **no `#about`-scoped rule can reach it**.

- **D306** — a white colour scoped `#about .about-copy .section-sub` left the clone grey, so the
  copy appeared to turn white at the hand-over. He spotted it before I did.
- **D308** — the mirror image: the rules that DO govern this copy are
  `#about .section-sub,.weld-about .section-sub` (base, the measure) and
  `#about .section-title + .section-sub,.weld-about …` (in the ≥1121 block, the title gap). They
  already carry the clone, they sit later in the file, and they out-specify anything you add with
  a class selector. **A new `.about-copy …` rule is dead on arrival.**

⭐ **Search `#about .section-sub` before changing anything about that copy, and read the computed
value to confirm your edit won.**

---

## 6. ⭐ PHOTOGRAPHS ADDED OR RE-CUT THIS ROUND

| File | What and why |
|---|---|
| `assets/site/service-commercial-bar-*` | **D305, his frame.** A marble bar counter under a gold-lit back bar, replacing a white salon interior with no stone in it. 16:9 cut out of a 3024×4032 portrait at y1500 — chosen from three, because that band puts the worktop in the foreground. ⚠️ **q80, not the pipeline's 85**: the frame is high-frequency and 85 came out at 280 KB; 76 already showed nothing by eye |
| `assets/site/service-splash-hob-*` | **D296.** The splashback re-cropped so two Australian sockets on OPPOSITE edges leave the frame. Ladder tops out at **1200**, the crop's own width |
| `assets/team/nick-* rimsha-*` | **D302.** Rimsha's crop takes her full 1684 width and her eye line alone drops to 0.398, closing the hairline gap 13px → 5.7. ⚠️ **`E` is per-portrait now.** Stamps at **`?v=4`**, bump both in step |
| `assets/site/og-cover.jpg` | **D292.** 1200×630 share card cut from the hero source; every page declares it |
| `favicon.ico` | **D292.** Browser-rasterised from his own SVG (no SVG rasteriser on this machine) |

⛔ **NEW PREFIX, NEVER NEW BYTES UNDER THE OLD ONE (D241).** Every replaced ladder is **kept on
disk** — a deleted photograph cannot be recovered from the browser.
⚠️ Cut scripts and sources live in `assets/site/.src-2026-08-18/` and `assets/team/.src-2026-08-16/`.

---

## 7. ⛔ DELIVERY — AND IT IS VERIFIED, NOT ASSUMED

```bash
git clone https://github.com/ThadGC/topcatwork.git topcat && cd topcat
cd "Topcat-Worktops-main/Website Demo" && python3 make_upload.py
```

⭐ **THIS WAS TESTED FROM A CLEAN CLONE AT THE END OF THIS ROUND**: cloned from GitHub into a
scratch folder, ran `make_upload.py`, and **diffed the result against the local `upload/` file by
file — zero differences.** 679 files, 183 HTML pages, ~81.5 MB, `.htaccess` present.

This build serves:

```
/assets/site.css?v=9da47fcc97      /assets/site.js?v=9eb6f3b313
/services/service.css?v=23cff11fdb /assets/footer.css?v=32e3e12343
/assets/nav.css?v=349149e16f       /stones/stone.css?v=5e7fdddb8d
/seo.css?v=6c5fddc3a1
```

1. Upload the **CONTENTS** of `upload/` into `public_html`.
2. ⚠️ **"SHOW HIDDEN FILES" ON** — `.htaccess` is the caching fix and most clients hide it.
3. ⛔⛔ **FLUSH SITEGROUND'S DYNAMIC CACHE** (Site Tools → Speed → Caching). It sits in front of
   Apache and ignores `.htaccess` entirely.
4. View-source a stone page and check the `?v=` matches. If it does, it is live.

⚠️ **THE STAMPS MOVE WHENEVER THE FILES DO** — always quote what `make_upload.py` prints.
⭐ **`main` and `origin/main` are identical** and one `git push` moves both refs (D285).

---

## 8. ⛔ THREE DEVICE BANDS

```
   ≤ 720px          721 – 1120px          ≥ 1121px
   the phone   ·   the tablet        ·   the desktop
```
⛔ **THE TABLET-ONLY BLOCK IS STILL LAST IN THE STYLESHEET** (search `THE TABLET BAND`).
⚠️ He worked across all three this round, so the "one device at a time" freeze is not what he is
doing — but it still applies to anything he has not mentioned.

---

## 9. ⛔ THE GATES — RUN THESE

```bash
cd "Website Demo" && python3 build_pages.py                     # FIRST — writes footer.css AND nav.css
cd "Website Demo/services" && python3 build_services.py
cd "Website Demo/stones" && python3 build_stones.py
cd "Website Demo" && python3 build_seo_pages.py
cd "Website Demo/stones" && python3 harvest/verify.py            # 132/132/132 ✅
```

⛔⛔ **NEVER RUN `trade/build_trade.py`** (reverts trade to 1 Aug). ⛔ `build_images.py` /
`patch_images.py` are one-shot.
**The CSS gate** (0 comment issues, 0 brace delta) and **`node --check` on the inline JS** after
every edit to `index.html`; the CSS gate also runs against `service.css`.

### ⭐ THE FREEZE PROBE — 1440×900, FRESH LOAD

| Signal | Value |
|---|---|
| `.gal-scroll` height | **4950** |
| `--revPer` (on `#reviews`) | **3** |
| `feTurbulence` count | **60** |
| `#svcNav` children | **8** |
| elements | **2667** |
| hero ink (`.hero-inner` padding-top) | **86.183** |
| `#about` height | **704** |
| collage | **497×621** |
| `#footer` height | **504** (1440) · **789** (900) · **1102** (375) |
| `.wheel-ui` width | **480** |
| portrait tiles | **241×241**, `?v=4` |
| broken images / overflow / console errors | **0 / none / none** |

⚠️⚠️ **FOUR OF THESE MOVED ON 17 AUG AND NONE IS A REGRESSION** — hero ink (D297 centred it),
`#about` and the collage (D301 shortened the copy), elements (D292's nine Open Graph tags).
**Compare against THIS table, never against an older handover.**
⚠️ **THE ELEMENT COUNT IS ONLY VALID ON A FRESH LOAD** — the weld stage adds ~93 nodes once built.
⚠️ **Filter broken images on `i.src && i.complete && i.naturalWidth===0`** (`#pmShot` has no src).

---

## 10. ⚠️ THE ENVIRONMENT TRAPS — ALL LIVE, THREE NEW

- ⛔⛔⛔ **A CSS EDIT DOES NOT SHOW UNTIL THE BUILDERS RE-RUN.** `dev-server.js` serves assets
  `max-age=300` and the page asks for `service.css?v=<hash>`; editing the file does not change the
  URL, so the browser keeps the cached copy. **Re-run the builder (the hash changes) and reload.**
  This cost a confusing measurement this round.
- ⛔⛔ **THE PANE'S SCREENSHOT GOES SOLID BLACK ON THE LANDING PAGE AFTER `resize_window`** — local
  AND live, so it is the capture path, not the site: a hidden full-viewport overlay with
  `backdrop-filter` breaks the rasteriser. Open a FRESH tab for screenshots after any resize.
- ⛔⛔ **LAZY IMAGES NEVER FETCH AFTER resize + instant `scrollTo`** — zero network requests.
  Set `img.loading='eager'` to wake them. Judge missing images by `naturalWidth`, never by a shot.
- ⛔ **`.rise` REVEALS DO NOT FIRE AFTER AN INSTANT JUMP** — the observers never see the entry, so a
  screenshot shows an empty section. Add `.in` yourself for the shot.
- ⛔ **THE WELD STAGE TEARS DOWN PAST THE HAND-OVER** — to read the clone you must be INSIDE the
  phase (`procTop + ~900`), and the damped playhead needs a separate call to settle.
- ⛔ **NAVIGATING THE PANE TO A `file://` URL WEDGES THE TAB** — every later navigation is blocked.
- ⭐ **`scroll-behavior:smooth` eats programmatic scrolls** — use `scrollTo({top,behavior:'instant'})`.
- (Carried) rAF freezes in background tabs · `javascript_tool` runs before async work settles ·
  console messages persist across reloads · `node --check` passes deleted variables · **no numpy,
  PIL only; the browser canvas is the only SVG rasteriser** · valid stone presets: calacatta,
  carrara, crema, emperador, eternal, fumo, goldveil, mist, nerogold, statuario.

---

## 11. ⭐ THE LINK, AND THE SERVER

```bash
cd "Website Demo" && nohup caffeinate -ims node dev-server.js > /tmp/topcat-server.log 2>&1 &
```

**Give him `http://192.168.1.102:5501`** — re-check with `ipconfig getifaddr en0`.
⭐ **THE SERVER IS DETACHED ON PURPOSE.** ⛔ Do not `preview_stop` it or kill it to restart.
⭐ **USE `http://localhost:5501` IN THE PREVIEW PANE**, on his instruction.

---

## 12. ⭐ WHERE THINGS STAND

| Page | State |
|---|---|
| **`/`** | hero centred at every band with a white subtitle; helix reads Splashbacks / **Kitchen Worktops** / Bathrooms; About copy tightened, white, clear of the seam; directors bright and matched |
| **`/about/` + six internal** | the `.page-head` family; directors visible and bright at all bands |
| **`/services/*.html`** | nine leaves, each on its OWN photograph; burger nav ≤1120; quote card ≥1121 |
| **`/stones/`** | 132 pages + collection + compare; white ledes; burger nav; **no quote card, deliberately** |
| **`/materials/` `/guides/` `/worktops/` `/sitemap.html`** | the 26-page SEO layer; 22 of them carry the quote card |
| **`/trade/`** | eight sections; CTA carries WhatsApp |
| **all 183 pages** | one footer, one mobile nav, og:image + twitter:card, favicon |

⚠️ **SHARED PHOTOGRAPHS NOT TO DELETE**: `kitchen-day.jpg`, `cta-slab.jpg`, `hero-kitchen.jpg`,
and now the superseded `service-commercial.*` and `service-splash-marble.*` ladders.

---

## 13. ⛔ RULES THAT MUST NOT BE BROKEN

1. ⛔ **Fabrication is IN-HOUSE (D202)** — "our experienced fabricators". It has flipped three times.
2. ⛔ **Never "laser" anything.** They template **by hand**.
3. ⛔ **The brand is "Topcat", one word.**
4. ⛔ **A stone's NAME and PHOTOGRAPH must match the supplier's own.**
5. ⛔ **Never state what we cannot guarantee, and never use an absolute.** A seam is always visible.
6. ⛔ **Every measurement in millimetres.**
7. ⛔ **Never a bright or gold line across the TOP of a card or section.** A full 34% gold border is
   the site's standard.
8. **No showroom. Never show the review count. Value, not cheap.**
9. **Voice:** quietly confident master. British English, commas not em dashes, no exclamation
   marks, **no AI slop, no jargon**. ⚠️ Customer review quotes are verbatim and exempt.
10. ⛔ **The logo is the client's artwork, never re-drawn, never generated. Set HEIGHT only.**
11. ⛔⛔ **A mark is never put in a circle, ring, disc or plate.** ⚠️ A control is not a mark — but
    D282/D286 prove that carve-out is not a licence; ask what a control already is.
12. ⛔ **One device at a time unless he says otherwise.**
13. ⭐⭐ **THIS IS A DESIGN BUILD. NEVER RAISE THE MISSING FORM BACKEND AS A BLOCKER.** He named it
    himself as his own pre-launch task.
14. ⛔⛔ **2 CREDITS MAXIMUM PER GENERATED IMAGE.** ⭐ **The last six rounds spent nothing.**

---

## 14. OPEN — DO THESE NEXT

### ⭐⭐⭐ The ones that are costing money

1. ⭐⭐⭐ **HOW DO FILES ACTUALLY REACH `thadeusg3.sg-host.com`?** Asked nine times. ⭐ An upload DID
   land on 17 Aug (the live site matched local byte-for-byte), so the flow works once someone runs
   it. §7 is exact and now clone-tested. **Everything from D291 onward is still NOT live.**
2. ⭐⭐⭐ **WHOSE ARGENTO DOES HE SELL?** His reference is a dense flecked grey-white; the site shows
   the supplier's veined marble-look, verified name by name. ⛔ Do not paste the Google image.
3. ⭐⭐ **THE STONE PHOTOGRAPHY AUDIT** — 24 of 132 verified; **92 Nile Stone tiles unverified**; the
   re-harvest with recorded source URLs is offered and unanswered.

### ⭐⭐ Waiting on him

4. ⭐⭐ **Trade terms** — payment, minimum order, lead times, a dedicated contact. **His stated first
   priority.**
5. ⭐⭐ **Two sentences for Nick and Rimsha** if he wants descriptions back under their names.
6. ⭐⭐ **What is the credit ceiling now?**
7. ⭐⭐ **Calacatta Gold licensing.**
8. ⭐⭐ **The fireplace scope, with Nick.**
9. ⭐⭐ **Ali Jaffer and Kav / Uxbridge** — two Drive folders matching no project.
10. ⭐ **The 19 drone videos** (Hornchurch, Rickmansworth).
11. ⭐ **Confirm the silica / HSE sentence in his own words (D202).**
12. ⭐ **Kitchen islands is not on his service list** — the page is live, linked and now properly
    dressed (D294); confirm it stays.
13. ⭐ **Trustpilot** — recommended against putting 4.0 beside the Google 5.0. He has not ruled.
14. ⚠️ **RIMSHA OR REMSHA?** Still unresolved. Her name is on a public page under her photograph.
15. ⚠️ **THE HORNCHURCH GALLERY SET** — the lead frame is clear (play equipment, **no child**), but
    the other 11 images were never checked frame by frame. Do it before launch.
16. ⚠️ **Two slabs lean blue and nobody has ruled**: `arabescato-grey` (−13.78),
    `calacatta-gold-shimmer` (−12.39).
17. ⭐ **Facebook, TikTok, YouTube?** ⛔ Do not guess handles.

### ⭐ Ready to build

18. ⭐⭐ **A QUOTE CARD FOR THE PHONE AND TABLET.** D300 is desktop-only because he said "for desktop
    specifically". A handset form is worth having and is a different composition — **his call.**
19. ⭐ **Per-stone og:image** (each stone page sharing its own slab photograph) — 132 conversions,
    his call on the weight.
20. ⚠️ **The generated pages still ship their code comments to view-source.** `footer.css` and
    `nav.css` strip theirs; the same treatment would suit the pages.
21. ⚠️ **`Next Stone Slabs` is named in one place** (the quartz page's brand sentence) — sanctioned
    by D203, listed so nobody "fixes" it either way without reading D203.
22. ⚠️ **The stale branch `tablet-round-d197-d200`** — deletable once item 1 is answered and nothing
    pulls it by name. The double refspec keeps it current meanwhile.
23. ⭐ **Pick a production host**; brotli; check the `.htaccess` cache rules survive it.

**Still waiting on the client:** whether Quartzite becomes a fourth range, 20mm vs 30mm pricing,
brackets for vanity tops / fireplaces / tables, and the £3k vs £3,850 three-slab discrepancy.

**CLOSED this round:** the leaf pages' missing mobile nav, the tablet's half-brightness tiles, the
missing `favicon.ico`, kitchen-islands' stock hero, the `<title>` question, the four-county metas,
the trade-CTA note (was already stale), **the splashback's foreign sockets** and **the commercial
page's wrong photograph**.

---

## 15. ⭐ HOW THIS CLIENT WORKS

⛔⛔⛔ **DO NOT ARGUE YOURSELF OUT OF SOMETHING HE ASKED FOR, AND DO NOT HAND HIM THE DILEMMA.**
**A real constraint is a problem to solve, not a question to return.** When the hero would not fit,
the answer was to buy height on short windows — not to ask him which gap he preferred.

⛔⛔ **DO NOT ASK HIS PERMISSION. Commit, push, report.**

⭐⭐⭐ **HE IS USUALLY RIGHT ABOUT THE DIAGNOSIS, NOT JUST THE SYMPTOM** — *"only after the animation
finishes does the text turn white"* was a clone the stylesheet could not reach; *"the buttons next
to it are moving"* was a flex row sized by its own text. ⚠️ **But not always the mechanism**: *"we
pushed to GitHub and the update just wasn't there"* was a delivered file hidden by a clock.
**Take the complaint literally, measure the thing he named, and prove the mechanism before
touching anything.**

⭐⭐ **HE REVERSES HIMSELF FREELY AND FAST, AND THAT IS FINE — LOG IT WITH THE REASON THE OLD
DECISION EXISTED.** This round: grey subtitles (D304) → white (D306) within the hour; the
directors' filter (D278) → deleted (D298); the hero frame (D259) → the whole box (D297) → below the
bar on mobile (D303).

⭐⭐ **HE SENDS CORRECTIONS MID-TURN, THREE OR FOUR DEEP.** Finish the one you are on, then take the
next in his order.

⭐⭐ **WHEN YOUR OWN WORK CAUSED THE FAULT, SAY SO IN THE FIRST LINE.** He is fine with that and not
fine with spin.

⚠️ **HE SWEARS WHEN SOMETHING LOOKS WRONG, AND THE COMPLAINT IS ALWAYS REAL.**

- **Walk the journey, do not check the page.** ⭐⭐ **Look at the result before reporting it done.**
- **Measure, then claim** — and if you could not measure it, say so.

---

## 16. BUDGET AND THE DOCUMENT SET

⭐ **This round spent 0 credits.** Every photograph was his own, cropped or re-cut; the favicon was
his own SVG rasterised.

| File | What it is |
|---|---|
| **`HANDOVER.md`** | ⭐ The single current state. §D is the register, **D1–D130, D132–D309**. §2 the standing rules, §2a the supplier list. ⚠️ **THERE IS NO D131 ROW.** ⚠️ Section numbers are referenced from code comments — **do not renumber** |
| **`Website Demo/index.html`** | ⭐⭐ The whole landing design, inline `<style>` and `<script>`. Search `THE WELD`, `SLAB_V`, `THE TABLET BAND`, `#about .section-sub`, `weldClock`, `soloGapX`, `fitStoneName` |
| **`Website Demo/build_pages.py`** | ⭐⭐ The seven internal pages, `site.css`, `site.js`, **`footer.css` and `nav.css`**. ⚠️ **RUN IT FIRST** |
| **`Website Demo/make_upload.py`** | ⭐⭐⭐ Writes a clean `../upload/`. The only correct answer to "which folder do I upload" |
| **`Website Demo/.htaccess`** | ⭐⭐ Cache rules. ⚠️ A dotfile — FTP clients hide it |
| **`assets/footer.css` `assets/nav.css`** | ⛔ **GENERATED.** Never edit; change the landing page and re-run |
| **`services/service.css`** | ⭐⭐⭐ Dresses all 176 generated pages. ⛔ No footer rules; `nav.top`/`.bar-cta` hide at 1120; carries `THE LEAD LAYOUT` |
| **`services/build_services.py`** | ⭐ Nine leaves. `HERO_IMG` maps each to its own photograph; `qform_html()` |
| **`build_seo_pages.py`** | ⭐ The 26-page SEO layer and the sitemap |
| **`stones/build_stones.py`** | 132 stone pages + collection + compare. Carries `SLAB_V` |
| **`stones/descriptions.py`** | ⭐⭐ One line per stone. ⛔ Re-cut a tile and its sentence is stale |
| **`stones/harvest/`** | The pipeline, `LICENSING.md`, `verify.py`. ⛔ No source URL per tile — §14 item 3 |
| ⛔ **`trade/build_trade.py`** | ⛔⛔ **SUPERSEDED — DO NOT RUN** |
| ⛔ **`build_images.py` `patch_images.py`** | ⛔⛔ **ONE-SHOT, CANNOT RUN AGAIN** |
| **`assets/site/.src-2026-08-17/` `.src-2026-08-18/`** | Hero, splashback and commercial-bar sources with their cut scripts |
| **`assets/team/.src-2026-08-16/`** | The directors' sources and `build_portraits.py` |
| `Docs/topcat-worktops-SEO-LOG.md` | Every URL, title and target query — **the recorded title strategy lives here** |
| `HANDOVER-2026-08-17-full-audit-and-composition-start-here.md` | ⭐ The START HERE this file replaces |
| `HANDOVER-archive-to-2026-08-06.md` | ⚠️ **Every design the client rejected, in his words.** Read before redesigning anything |
