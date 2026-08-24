# START HERE — 22 August 2026, after THE FIRST-SCREEN ROUND (D325–D332)

Read this, then `HANDOVER.md` **§D** (the register, newest first — this round is **D325–D332**),
**§2** (the standing rules) and **§2s** (SITE SPEED). About twenty minutes, and enough to work safely.

> ⚠️ **This replaces the previous version of this same file**, now
> `HANDOVER-2026-08-22-video-round-start-here.md` (D319–D324). Everything that still matters is
> carried below.

> ⭐⭐ **THE ACTIVE SCOPE IS THE FIRST SCREEN, AND A NEW VIDEO IS COMING.** He closed the round with
> *"we're gonna get a new video"* and *"we'll continue working on this in the new chat."*
> **§3 is what happens when it lands. §4 is the first screen as it stands.**

---

## 0. ⛔⛔⛔ THE ONE THING TO TAKE FROM THIS ROUND

**⭐⭐⭐ I CHANGED THE INK THREE TIMES BEFORE READING THE PAINT ORDER, AND HE HAD TO SWEAR AT ME TO
GET THERE.** The film's gold looked muddy. He said so three times, in plainer and plainer language.

```
D325b  the ground is bright, so LIGHTEN the ink        → "the start here is faded"
D327b  put the site's real ink back, DARKEN the ground → "even darker than it was before"
D327c  lighten the ink again, brighter this time       → still wrong
D327e  ⭐ read the paint order. `text-shadow` was
       painting ON TOP of the gold the whole time      → right, first time
```

⛔⛔ **THE MECHANISM, BECAUSE IT WILL CATCH ANYONE AGAIN.** With `background-clip:text` the element's
BACKGROUND — the gold ramp, clipped to the glyphs — paints FIRST. A `text-shadow` paints after any
background and before the glyph fill. So a dark shadow lands **on top of the metal**, and
`-webkit-text-fill-color:transparent` then paints nothing over it to hide it. ⭐ **And it is why
`.hero-title em` has always looked right: `.hero-title` declares no text-shadow at all.**
⚠️ `.cine-hl` and `.cine-line` set one for their WHITE and an `em` INHERITS it — it has to be turned
off explicitly. Use `filter:drop-shadow()` when separation is genuinely needed; it draws behind.

⭐⭐⭐ **THE GENERAL LESSON: HIS COMPLAINT NAMED THE SYMPTOM CORRECTLY EVERY TIME AND I KEPT TUNING
THE WRONG VARIABLE.** The evidence was in his first screenshot — dark blur *inside* the letterforms
is not a hue problem. **Look at what he sends before deciding what to change.**

---

## 1. ⭐⭐⭐ WHAT THIS ROUND DID (D325–D332)

```
D325   the opening frame becomes a SECOND HERO on desktop — copy, invitation,
       scroll indicator, on a grade anchored to the left frame edge
D325b  it clears the skyline, and takes white-and-gold
D326   ⛔ the third title is withdrawn ("Then the centre of your kitchen")
D327   optimised for bounce rate: bigger title, new slab copy, the skip control
       made visible, and the hero's rounded corners taken off the film
D327e  ⭐ THE GOLD FIX — text-shadow, not colour
D327f  the grade lightened off the mountainside; the arrow rebuilt a third time
D328   ⭐⭐ HIS TWO NEW MASTERS — and the film is a RE-CUT, so three things moved
D329   all the overlay plates removed, on his instruction
D330   the overlay comes back from his two new stills
D331   ⭐ the morph was GEOMETRY, not colour — the overlay becomes the master's f0
D332   ⛔ the overlay reverted and parked whole, ahead of the new video
```

---

## 2. ⭐⭐⭐ SITE SPEED IS A STANDING RULE — HIS OWN WORDS

Unprompted, 18 Aug: *"just make sure you always keep site speed in mind… **site speed is key**."*
`HANDOVER.md` **§2s**, and it is §2 material.

1. ⛔⛔ **ONE FILM PER BAND AND ONLY ONE IS EVER FETCHED.** Three cuts (**21.9 MB** together), a
   visitor downloads exactly one. An in-place `<script>` beside the `<video>` sets `src` and
   `poster` **during parse**. ⛔ **A `display:none` VIDEO STILL DOWNLOADS ITS `src` AND `poster`.**
   **Re-verify zero requests for the other two after ANY change to that element or that script.**
2. ⭐ **`preload="none"` in the markup**, flipped to `auto` by the scrub once the band is known.
3. ⭐⭐ **FIRST PAINT COSTS THE POSTER, NOT THE FILM** — **120 KB** desktop, 80 tablet, 53 phone, each
   the film's own first frame so there is nothing to swap. ⛔ Do not let them grow; D330 pushed them
   to 163/125/97 and they had to be walked back down by quality.
4. ⭐⭐ **COMMENTS COME OFF ON THE WAY OUT (D315).** `make_upload.py` strips every `.html`/`.css`/
   `.js` into `upload/`. ⛔ Never strip comments from the SOURCE — they are the design record.
5. ⭐ **NOTHING UNREFERENCED SHIPS.** Dot-folders never ship. ⛔ When you remove an element, move its
   assets into a dot-folder **in the same edit** (D329 and D332 both had to).

⚠️ **`dev-server.js` COMPRESSES AND THE HOST MAY NOT.** ⚠️ **A MEDIA ELEMENT'S OWN FETCH OFTEN DOES
NOT APPEAR IN `resource` TIMING.** Prove "the wrong film did not load" by the ABSENCE of the other
bands' URLs plus `video.getAttribute('src')`.

---

## 3. ⭐⭐⭐ WHEN THE NEW VIDEO ARRIVES — DO THESE, IN THIS ORDER

⛔⛔⛔ **D328 IS THE WORKED EXAMPLE. A NEW MASTER IS NEVER JUST A RE-ENCODE.** His last one kept the
first fourteen seconds and changed everything from t=16, and **three separate things had to move
with it.** Assume the same until measured otherwise.

1. **Copy the masters in.** `assets/video/.src-<date>/`, verify byte-exact by SHA-256.
   ⚠️ `~/Downloads` access has been blocked before (D319) and worked at D328 — if `cp` returns
   EPERM, write a `.command` into the scratchpad and `open -a Terminal` it.
2. ⛔⛔ **CHECK THE MOBILE MASTER FOR A PILLARBOX. IT HAS ARRIVED THAT WAY TWICE** (D319, D328) —
   a 9:16 film **608 wide centred at x=656** inside a 1920×1080 box. `cropdetect` across the film
   AND a per-column luminance max; they must agree. ⭐ *"No cropping needed"* is about his FRAMING;
   the pillars still come off, or `cover` keeps the bars and 68% of every frame ships as black.
3. **Encode.** `bash .src-2026-08-22/encode.sh` is the template — crf 25/26/27, `fps=12`,
   `crop=864:1080:680:0` for the tablet. ⛔ All three must be **44.250s / 531 frames** or the scroll
   maths stops matching across bands.
4. ⛔ **BUMP `?v=` ON ALL THREE FILMS AND ALL THREE POSTERS IN THE SAME EDIT.** `.htaccess` holds
   mp4 for a week. Currently films `?v=2`, posters `?v=3`.
5. ⭐⭐ **RE-MEASURE THE SLAB BEAT ON EVERY BAND.** The void moves with the cut. D328's method:
   sample the p97 of the band's own copy area every 0.25s and find where it reads ≤6.
   Current windows — desktop **15.0–24.5** (left 7–46% black 14.75→25.00), tablet **21.0–25.3**
   (top 18% black 20.50→25.00), phone **16.2–24.0** (top 18% black 16.00→23.50).
6. ⭐ **RE-CHECK THE OPENING GRADE.** Every contrast figure in §4 was measured on the current f0.
   If the opening shot changes, re-run them.
7. ⭐ **REGENERATE THE POSTERS** — `.plates-2026-08-22/make_plates.py` does it, at the §2s budget.

---

## 4. ⭐⭐⭐ THE FIRST SCREEN AS IT STANDS — DESKTOP ONLY

⛔ **DESKTOP ONLY (≥1121), AND THAT IS HIS INSTRUCTION**: *"right now I'm talking about desktop
specifically, we will talk about mobile and tablet text placement after."* The phone and tablet
keep their own opening title (`.cine-open`) and their own cue, untouched. **That conversation is
still owed.**

```
Your worktop STARTS HERE.          Cinzel, 76px, gold on "starts here."
Follow the slab from the quarry to your kitchen.
SCROLL TO BEGIN  ↓                 the arrow, centred under the word
```

| What | Where | Value |
|---|---|---|
| the block | `.cine-hero` | `top:22vh`, left gutter `clamp(20px,7vw,132px)`, width `clamp(320px,46vw,660px)` |
| the headline | `.cine-hl` | `clamp(38px,5vw,76px)`, line-height 1.06 |
| its travel | `HERO_Z` | **300**, not the titles' 560 — see below |
| it is gone by | `HERO_OUT` | **t=6.0**, full until 4.44 |
| the grade | `.cine-edge` | left edge 0.88→0 by **76%**, plus a top-left corner pool at 0.72 |
| the corners | `--cineCurve` | 0 through the film, ramping from `CURVE_AT` **0.90** |

⭐ **MEASURED AS SHIPPED**: headline line 1 **4.27:1**, the gold **4.47:1**, the invitation
**13.16:1**, the cue's word **16.79:1**.

- ⛔⛔ **ANCHORED BY ITS TOP, NOT CENTRED.** On `top:57%` + `translateY(-50%)` the block's position
  depended on its own height, so a longer headline pushed the first line back down through the
  skyline. ⭐ The skyline was MEASURED — walking each column until its gradient breaks out of the
  sky's noise floor puts the ridge at **y 250–280 of 900**, median 30%.
- ⛔⛔ **HERO_Z IS 300 BECAUSE THE BLOCK IS AT THE TOP.** `perspective-origin` is `26% 50%`, so
  anything above the middle travels UP as it approaches; the titles' own 560 renders it at 2.27×
  and takes the headline off the top of the screen while it is still half visible.
- ⛔⛔⛔ **THE VALLEY LOOKS LIKE THE EMPTY PART OF THE FRAME AND IT IS THE BRIGHTEST PART OF IT.**
  D313's trap for the third time. Median 76, **p97 188**. Only a percentile finds it.
- ⭐⭐ **THE GRADE IS ANCHORED TO THE FRAME EDGE, WHICH IS WHY IT CANNOT READ AS A PANEL.** He has
  twice rejected a dark shape with an edge on it. ⭐ **AND IT COSTS HIS MARBLE NOTHING**: the subject
  starts at 62% and measures **p97 181 graded, 181 ungraded**. Only background sky darkens.
- ⚠️ **THE COPY'S RIGHT EDGE AT 42% IS WHAT SEPARATES HIS TWO SHADOW ASKS** — *"slightly lighter on
  the left, but not much"* and *"don't let the mountain side be too dark."* Everything past 42%
  protects nothing, so the head came down a little and the tail came down hard.
- ⛔⛔⛔ **THE ARROW IS THREE LAYERS AND THE FIRST TWO DESIGNS BOTH FAILED THE SAME WAY.** A chevron
  travelling down a channel is a crossbar when you freeze it. **He reviews from screenshots, so a
  design that only reads in motion does not read at all.** Now `i` is the shaft and `i::after` the
  head — both permanent, neither animated — and only `i::before`, the bright stroke, moves.
- ⚠️ **`clip-path` CLIPS TO THE BORDER BOX**, and the shaft is 2px wide: an `inset(0 0 …)` on it cut
  the 19px head clean off and shipped a bare line.

---

## 5. ⭐⭐ THE FILM'S COPY — TWO BEATS AND THE HERO

```
first screen  Your worktop STARTS HERE.          (desktop; phone/tablet keep "It starts as a mountain.")
15.0-24.5s    Your slab is ONE OF A KIND.
              No two slabs are the same.         tablet 21.0-25.3 · phone 16.2-24.0
   → the hero's own words: Surfaces worth building around
```

⛔ **THE THIRD BEAT IS WITHDRAWN (D326)** — *"Remove the text that comes up on this part."* Parked in
full in a comment where it sat. It came off **every band**, because it carried no per-band timing:
it was a beat of the STORY, not a placement. ⚠️ `[data-vpos="low"]` now positions nothing and stays
anyway — it is the restore path.

⭐ **HIS OTHER HEADLINE CANDIDATES ARE PARKED IN THE MARKUP** (unique / beautiful / bespoke) —
**he is still taking the client's input on the wording**, so expect this to change.

---

## 6. ⭐⭐⭐ THE OVERLAY — OFF, BUT HE LIKES IT

⭐ Client: *"revert the overlay changes for now because we're gonna get a new video. But also keep
the overlay changes in mind for if we wanna use it again… **because it is looking better**."*
**A PAUSE, NOT A REJECTION. Expect to bring it back.**

⛔⛔⛔ **AND BRING BACK THE D331 VERSION, NOT D330's.** The difference is the whole lesson:

| the fade was blending | distance |
|---|---|
| his `F1 FIXED.png` vs the desktop film's f0 | **0.301** |
| his `Mobile f1.png` vs the phone film's f0 | **0.143** |
| ⭐ the MASTER's own f0 vs the web film's f0 | **0.011–0.016** |

His stills are different **RENDERS** of the shot — trees and veining in different places. **Colour
can be graded; geometry cannot.** That is the morph he screenshotted, and no filter could fix it.
D331 extracts the frame from his 86.5 MB master instead: **0.043 / 0.036 / 0.037**, nothing left to
morph. The overlay still earns its place — the master frame is far cleaner than the same frame
through the web encode.

**To restore:** `.plates-2026-08-22/removed-code-d332.txt` holds every block verbatim — `css`,
`markup`, `js`, `js_load` and the three one-line call sites **separately, because they are not
inside the other blocks**. Move `plates/` back out of the dot-folder, paste, bump `?v=`.
⚠️ Re-run `make_plates.py` first if the film has been re-cut — f0 changes with it.
⭐ Fade width **3 frames** (was 6): with a matched still the only ghost is camera motion, and the
film drifts 0.115/frame.

---

## 7. ⛔ THREE DEVICE BANDS

```
   ≤ 720px          721 – 1120px          ≥ 1121px
   the phone   ·   the tablet        ·   the desktop
```
⛔ **THE TABLET-ONLY BLOCK IS STILL LAST IN THE STYLESHEET** (search `THE TABLET BAND`).
⭐ **Widen a phone rule's own query to reach the tablet, never copy it.**
⚠️ ⛔⛔ **AND SOURCE ORDER DECIDES BETWEEN EQUAL SPECIFICITY** — `html.cine-on .cine-cue{display:none}`
written up with the hero's block LOST to the base `display:flex` written later. Caught by reading
the computed style, not by looking.

---

## 8. ⛔ THE GATES — RUN THESE

```bash
cd "Website Demo" && python3 build_pages.py                     # FIRST — writes footer.css AND nav.css
cd "Website Demo/services" && python3 build_services.py
cd "Website Demo/stones" && python3 build_stones.py
cd "Website Demo" && python3 build_seo_pages.py
cd "Website Demo/stones" && python3 harvest/verify.py            # 132/132/132 ✅
```

⛔⛔ **NEVER RUN `trade/build_trade.py`.** ⛔ `build_images.py` / `patch_images.py` are one-shot.
**The CSS gate** (brace delta 0, comment delta 0 against HEAD) and **`node --check` on all three
inline `<script>` blocks** after every edit to `index.html`.
⚠️ **The JS gate must EXCLUDE `application/ld+json`** or it fails on the schema.

⭐⭐⭐ **AND A `<div>` BALANCE CHECK AFTER ANY STRUCTURAL CUT — THIS IS NEW AND IT IS NOT OPTIONAL.**
D329 cut a block that ended mid-element, left the closing `</div>` behind, and it began closing
`.hero-bg` instead — putting three grade layers outside the hero's clip. **Nothing looked wrong; the
document just got 456px taller.** Count `<div` vs `</div>` (comments, `<script>` and `<style>`
stripped) against `git show HEAD:` — it must be balanced AND differ from HEAD by exactly the layers
you meant to change.

### ⭐ THE FREEZE PROBE — 1440×900, FRESH LOAD, TAB IN FRONT

| Signal | Value |
|---|---|
| `.gal-scroll` height | **4950** |
| `--revPer` (on `#reviews`) | **3** |
| `feTurbulence` count | **60** |
| elements | **2689** |
| hero ink (`.hero-inner` padding-top) | **86.1828** |
| `#footer` height | **504** |
| document height | **24443** |
| `.hero-bg` children | **6** |
| broken images / 4xx / console errors | **0 / 0 / none** |

⚠️ **ELEMENTS: 2689 with the overlay OFF, 2690 with it on.** ⚠️ **DOCUMENT HEIGHT 24443 — if it
reads 24899 a structural cut has left a stray closing tag.** ⚠️ The element count is only valid on a
fresh load. ⚠️ Filter broken images on `i.src && i.complete && i.naturalWidth===0`.

---

## 9. ⚠️ THE ENVIRONMENT TRAPS — ALL LIVE

- ⛔⛔⛔ **NEW — ANCHOR AN INSERTION ON A UNIQUE LINE.** New JS was anchored on `function measure(){`
  and **there are four of those in this file**. It landed in the stones IIFE and the console read
  `plate is not defined` from `tick`. **Verify the insertion is in the scope you meant.**
- ⛔⛔ **NEW — `git check-ignore` BEFORE COMMITTING ANY NEW DOT-FOLDER OF HIS ORIGINALS.** The `TC*`
  rule matches his film naming; his overlay stills were `F1 FIXED.png` / `Mobile f1.png` and 8.7 MB
  of PNG was heading for a commit. Rule now `**/assets/video/.plates-*/src/`.
- ⛔⛔ **NEW — A SEARCH OVER SCALE AND OFFSET IS SLOW.** 2500 PIL crop/resize combinations exceeded a
  two-minute timeout. Coarsen the grid, or run it in the background and do other work.
- ⛔⛔⛔ **macOS HAS BLOCKED THIS PROCESS FROM `~/Downloads` BEFORE** (D319) and allowed it at D328.
  If it returns EPERM: write a `.command` into the scratchpad and `open -a Terminal` it.
- ⛔⛔⛔ **THE FILM NEEDS ~8s TO BUFFER AFTER A NAVIGATION BEFORE A SCRUB MEASURES ANYTHING.**
- ⛔⛔ **SAMPLING A SCRUB FASTER THAN THE EASED CHASE MEASURES THE CHASE, NOT THE PAGE.** A big jump
  needs ~2.5–3.5s to settle; non-monotonic film times in a sweep are the tell.
- ⛔⛔⛔ **A SCROLL ANIMATION IS DEAD IN A BACKGROUND TAB.** Front the tab.
- ⛔⛔⛔ **TWO TABS DRIFT TO DIFFERENT VIEWPORTS.** Read `innerWidth`/`innerHeight` in the SAME probe
  as the numbers you are comparing.
- ⚠️ **A BAND SWAP AFTER LOAD IS A REAL REQUEST, NOT A FAULT** — the pane opens narrow, and resizing
  to 1440 makes `fetchFilm()` fetch the desktop cut. Re-navigate at the target width before
  believing a wrong-band count.
- ⛔⛔ **A NARROW LOAD LOOKS EXACTLY LIKE A BROKEN PAGE.** `--stoneRaster:on` below 720px swaps the
  live marble SVG for a bitmap: `feTurbulence` reads 0 and elements drop ~570. Fresh tab, resize,
  THEN load.
- ⛔⛔ **AN INLINE STYLE OUTRANKS A CLASS RULE** — hand the property back (`style.opacity=''`).
- ⛔⛔ **A CSS EDIT DOES NOT SHOW UNTIL THE BUILDERS RE-RUN** (`site.css?v=<hash>`).
- ⛔⛔ **THE PANE'S SCREENSHOT GOES BLACK after `resize_window` + reload.** Fresh tab, navigate,
  resize, shoot **without** reloading. ⚠️ It also composites only the frame at the top of the
  document — a stacked mockup returns black below the fold.
- ⛔ **`zoom` REGION CROP IS NOT SUPPORTED in the pane** — it returns the full screenshot.
- ⭐ **`scroll-behavior:smooth` eats programmatic scrolls** — use `behavior:'instant'` and pin the
  position with a short interval while you settle.
- ⛔ **`computer` LIMITS: `wait` ≤ 10s, `scroll_amount` ≤ 10.** Chain them.
- ⛔⛔ **CONSOLE ERRORS PERSIST ACROSS RELOADS** — check `performance.getEntriesByType('resource')`
  for `responseStatus >= 400`. ⭐ **And read the console when something does not appear** — that is
  what found `plate is not defined` in seconds.
- (Carried) `javascript_tool` runs before async work settles · **no numpy, PIL only; no libwebp in
  this ffmpeg (PIL does the WebP); the browser canvas is the only SVG rasteriser** · valid stone
  presets: calacatta, carrara, crema, emperador, eternal, fumo, goldveil, mist, nerogold, statuario.

---

## 10. ⭐ THE LINK, AND THE SERVER

```bash
cd "Website Demo" && nohup caffeinate -ims node dev-server.js > /tmp/topcat-server.log 2>&1 &
```

⚠️⚠️ **THE IP HAS MOVED FOUR TIMES** (192.168.1.106 → 10.101.1.252 → **192.168.10.246**).
**Re-check with `ipconfig getifaddr en0` at the start of every reply that hands him a link.** A dead
link presents as *"most of the images aren't loading"*.
⚠️ **The server also stops overnight.** ⭐ **DETACHED ON PURPOSE — do not `preview_stop` it.**
⚠️ It DOES need a restart after any edit to `dev-server.js`.
⭐ **USE `http://localhost:5501` IN THE PREVIEW PANE**, on his instruction.

---

## 11. ⭐ WHERE THINGS STAND

| Page | State |
|---|---|
| **`/`** | opens on his film at every band, **a second hero on the first screen (desktop)**, two story beats, skip control, 182vh of dead scroll on the finished hero, square corners through the film that round only for the hero |
| **`/about/` + six internal** | the `.page-head` family; directors visible and bright at all bands |
| **`/services/*.html`** | nine leaves, each on its OWN photograph; burger nav ≤1120; quote card ≥1121 |
| **`/stones/`** | 132 pages + collection + compare; white ledes; **no quote card, deliberately** |
| **`/materials/` `/guides/` `/worktops/` `/sitemap.html`** | the 26-page SEO layer; 22 carry the quote card |
| **`/trade/`** | eight sections; CTA carries WhatsApp |
| **all 176 pages** | one footer, one mobile nav, og:image + twitter:card, favicon, hours **Mon–Sun 7am–9pm**, no code comments in view-source |

⚠️ **SHARED PHOTOGRAPHS NOT TO DELETE**: `kitchen-day.jpg`, `hero-night-*`, `og-cover.jpg`,
`team/fitting.jpg`, and everything inside the dot-folders under `assets/video/`.

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
10. ⛔ **The logo is the client's artwork, never re-drawn, re-coloured or generated. Set HEIGHT only.**
11. ⛔⛔ **A mark is never put in a circle, ring, disc or plate.** ⚠️ A control is not a mark.
12. ⛔ **One device at a time unless he says otherwise.**
13. ⭐⭐ **THIS IS A DESIGN BUILD. NEVER RAISE THE MISSING FORM BACKEND AS A BLOCKER.**
14. ⛔⛔ **2 CREDITS MAXIMUM PER GENERATED IMAGE.** ⭐ **This round spent nothing.**
15. ⭐⭐⭐ **SITE SPEED IS KEY** — his own words.

---

## 13. OPEN — DO THESE NEXT

### ⭐⭐⭐ The video and the first screen, which is the live scope

1. ⭐⭐⭐ **THE NEW VIDEO.** §3 is the whole procedure. ⛔ Assume a re-cut until measured.
2. ⭐⭐⭐ **MOBILE AND TABLET TEXT PLACEMENT.** He explicitly deferred it: *"we will talk about mobile
   and tablet text placement after."* **This is owed and he has not forgotten it.**
3. ⭐⭐ **THE HEADLINE WORDING** — he is taking the client's input. Three alternates parked in the
   markup.
4. ⭐⭐ **THE OVERLAY, WHEN HE WANTS IT** — §6. Bring back D331's version, not D330's.
5. ⭐ **THE HERO PLATE FOR THE NEW ENDING.** Withdrawn at D328 because the re-cut moved the camera.
   **It needs a new still from him**, or it stays off.
6. ⭐⭐ **DOES THE FILM WANT SOUND?** The masters carry 24-bit PCM; the site drops it. Never discussed.
7. ⭐ **THE 19 DRONE VIDEOS** (Hornchurch, Rickmansworth) — worth re-asking now the site carries film.

### ⭐⭐⭐ The ones that are costing money

8. ⭐⭐⭐ **HOW DO FILES ACTUALLY REACH `thadeusg3.sg-host.com`?** Asked twelve times. §6 of the old
   START HERE is exact and clone-tested. **Everything from D291 onward is still NOT live.**
9. ⭐⭐⭐ **WHOSE ARGENTO DOES HE SELL?** His reference is a dense flecked grey-white; the site shows
   the supplier's veined marble-look. ⛔ Do not paste the Google image.
10. ⭐⭐ **THE STONE PHOTOGRAPHY AUDIT** — 24 of 132 verified; **92 Nile Stone tiles unverified**.

### ⭐⭐ His call

11. ⭐⭐ **THE PHONE'S BAR** — the skeleton crosses his 11-Aug *"already formed from the top"* ruling.
    **One word puts it back: delete the two `header.bar.preform::after` lines.**
12. ⭐⭐ **THE SITEMAP LINK'S GOLD STYLING** — `seo.css` has the rule, no footer has the hook.
13. ⭐⭐ **A QUOTE CARD FOR THE PHONE AND TABLET.** D300 is desktop-only because he said so.
14. ⭐⭐ **Trade terms** — payment, minimum order, lead times, a dedicated contact. **His stated first
    priority.**
15. ⭐⭐ **Two sentences for Nick and Rimsha** · **the credit ceiling** · **Calacatta Gold licensing**
    · **the fireplace scope, with Nick** · **Ali Jaffer and Kav / Uxbridge**.
16. ⭐ **Confirm the silica / HSE sentence in his own words (D202).**
17. ⭐ **Kitchen islands is not on his service list** — the page is live, linked and dressed (D294).
18. ⭐ **Trustpilot** — recommended against putting 4.0 beside the Google 5.0. He has not ruled.
19. ⚠️ **RIMSHA OR REMSHA?** Still unresolved. Her name is on a public page under her photograph.
20. ⚠️ **THE HORNCHURCH GALLERY SET** — the lead frame is clear, the other 11 were never checked.
21. ⚠️ **Two slabs lean blue and nobody has ruled**: `arabescato-grey` (−13.78),
    `calacatta-gold-shimmer` (−12.39).
22. ⭐ **Facebook, TikTok, YouTube?** ⛔ Do not guess handles.

### ⭐ Ready to build

23. ⭐ **Per-stone og:image** — 132 conversions.
24. ⚠️ **`Next Stone Slabs` is named in one place** — sanctioned by D203. Read D203 before "fixing".
25. ⚠️ **The stale branch `tablet-round-d197-d200`** — deletable once item 8 is answered.
26. ⭐ **Pick a production host**; brotli; check the `.htaccess` cache rules survive it. ⚠️ **The
    video makes this urgent.**

**Still waiting on the client:** whether Quartzite becomes a fourth range, 20mm vs 30mm pricing,
brackets for vanity tops / fireplaces / tables, and the £3k vs £3,850 three-slab discrepancy.

**CLOSED this round:** the first screen as a second hero; the skyline placement; white-and-gold and
the `text-shadow` bug behind it; the third title; the slab copy; the skip control; the film's rounded
corners; his two new masters and the beats they moved; and the overlay, built twice and parked.

---

## 14. ⭐ HOW THIS CLIENT WORKS

⛔⛔⛔ **HIS COMPLAINT NAMES THE SYMPTOM CORRECTLY EVERY TIME. IF YOU "FIX" IT AND HE REPEATS
HIMSELF, YOU CHANGED THE WRONG VARIABLE — DO NOT CHANGE THE SAME ONE HARDER.** He told me the gold
was wrong three times. Twice I adjusted the colour. The third time I read the paint order and found
a `text-shadow` sitting on top of it. **The evidence was in his first screenshot.**

⛔⛔ **DO NOT ARGUE YOURSELF OUT OF SOMETHING HE ASKED FOR, AND DO NOT HAND HIM THE DILEMMA.**
**A real constraint is a problem to solve, not a question to return.**

⛔⛔ **DO NOT ASK HIS PERMISSION. Commit, push, report.**

⭐⭐⭐ **HE REVIEWS FROM SCREENSHOTS.** Two arrow designs failed because they only read while
animating — frozen, they were a crossbar on a line. **Anything on screen must be legible in a
still.**

⭐⭐⭐ **HE REVERSES HIMSELF FREELY AND FAST, AND HE REVERSES YOU FASTER.** The overlay went in, out,
back in from new art, rebuilt from the master, and out again inside one day. **The way to make that
cheap is to park everything and delete nothing**, with a README naming the exact restore path.

⭐⭐ **HE SENDS CORRECTIONS MID-TURN, THREE OR FOUR DEEP.** Finish the one you are on, then take the
next in his order.

⭐⭐ **WHEN YOUR OWN WORK CAUSED THE FAULT, SAY SO IN THE FIRST LINE.** He is fine with that and not
fine with spin. Most of this round's bugs were mine and all were found by MEASURING.

⚠️ **HE SWEARS WHEN SOMETHING LOOKS WRONG, AND THE COMPLAINT IS ALWAYS REAL.**

- **Walk the journey, do not check the page.** ⭐⭐ **Look at the result before reporting it done.**
- **Measure, then claim** — and if you could not measure it, say so.
- ⭐⭐ **AND CHECK THE VIEWPORT IN THE SAME BREATH AS THE NUMBER.**

---

## 15. BUDGET AND THE DOCUMENT SET

⭐ **This round spent 0 credits.** Every encode, crop, grade match and measurement was `ffmpeg`, PIL
and plain Python; the films and the stills are his own.

| File | What it is |
|---|---|
| **`HANDOVER.md`** | ⭐ The single current state. §D is the register, **D1–D130, D132–D332**. §2 the standing rules, **§2s SITE SPEED**, §2a the supplier list. ⚠️ **THERE IS NO D131 ROW.** ⚠️ Section numbers are referenced from code comments — **do not renumber** |
| **`Website Demo/index.html`** | ⭐⭐ The whole landing design. Search `THE SCROLL FILM`, `THE OPENING FRAME AS A SECOND HERO`, `THE FILM'S WHITE-AND-GOLD`, `THE CORNERS BELONG TO THE HERO`, `cine-line`, `--cineHold`, `THE WELD`, `THE TABLET BAND` |
| **`assets/video/.src-2026-08-22/`** | ⭐⭐ His two current masters (`.gitignore`d) + `encode.sh` with the full method |
| **`assets/video/.plates-2026-08-22/`** | ⭐⭐ The overlay, parked: `removed-code-d332.txt`, `make_plates.py`, `plates/`, his two PNGs in `src/` |
| **`assets/video/.plates-removed-2026-08-22/`** | The D329 removal and D323's four withdrawn stills |
| **`Website Demo/.textopts-2026-08-22/`** | ⭐ The eleven first-screen options he chose from |
| **`Docs/Overlay-for-Scroll-Animation-Guide.md`** | ⭐ **His own written build guide** for the stills |
| **`Website Demo/build_pages.py`** | ⭐⭐ Seven internal pages, `site.css`, `site.js`, `footer.css`, `nav.css`. ⚠️ **RUN IT FIRST** |
| **`Website Demo/make_upload.py`** | ⭐⭐⭐ Writes a clean `../upload/`. ⚠️ Dot-folders never ship; comments stripped on the way out |
| **`Website Demo/.htaccess`** | ⭐⭐ Cache rules, mp4/webm for a week. ⚠️ A dotfile |
| **`assets/footer.css` `assets/nav.css`** | ⛔ **GENERATED.** Never edit |
| **`services/service.css`** | ⭐⭐⭐ Dresses all 167 generated pages. ⛔ No footer rules |
| ⛔ **`trade/build_trade.py`** | ⛔⛔ **SUPERSEDED — DO NOT RUN** |
| ⛔ **`build_images.py` `patch_images.py`** | ⛔⛔ **ONE-SHOT, CANNOT RUN AGAIN** |
| `HANDOVER-2026-08-22-video-round-start-here.md` | ⭐ The START HERE this file replaces (D319–D324) |
| `HANDOVER-archive-to-2026-08-06.md` | ⚠️ **Every design the client rejected, in his words.** Read before redesigning anything |
