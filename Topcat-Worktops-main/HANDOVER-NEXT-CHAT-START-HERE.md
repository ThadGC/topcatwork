# START HERE — 23 August 2026, after THE FILM ROUND (D333–D347)

Read this, then `HANDOVER.md` **§D** (the register, newest first — this round is **D333–D347**),
**§2** (the standing rules) and **§2s** (SITE SPEED). About twenty minutes, and enough to work safely.

> ⚠️ **This replaces the previous version of this same file**, now
> `HANDOVER-2026-08-22-first-screen-round-start-here.md` (D325–D332). Everything that still matters
> is carried below.

> ⭐⭐ **THE ACTIVE SCOPE IS THE FILM'S THREE TEXT BEATS, ON DESKTOP.** His new video landed, the
> overlay came back, and every word on the film was rewritten at least twice. **§4 is the copy as it
> stands. §5 is the placement and the numbers that hold it. §13 item 2 is what he is owed next.**

---

## 0. ⛔⛔⛔ THE ONE THING TO TAKE FROM THIS ROUND

**⭐⭐⭐ I MEASURED THE WRONG THING THREE TIMES, AND EACH TIME THE NUMBER SAID "FINE" WHILE HIS EYE
SAID "WRONG". HIS EYE WAS RIGHT EVERY TIME.**

```
"too hard to read"     x3   the wash reads a 97th PERCENTILE of the picture behind the
                            words. The room is nearly black with specular streaks as bright
                            as the type — and the percentile discards exactly the streaks
"make the subtitles          I moved bone from 96% alpha to 100% and reported it done.
 white"                x2    Bone is #F4F1EA. It is not white
"the g is not in line        I measured the BOXES (identical, so "no fault"), then estimated
 with the t"                 the perspective scale by hand and read a 3.3px error that
                             did not exist
```

⛔⛔ **THE COMMON FAULT IS NOT CARELESSNESS, IT IS MEASURING A MODEL INSTEAD OF THE THING.** A
percentile is a model of the picture. An alpha is a model of "white". A hand-derived scale is a
model of the transform. **Every one of them agreed with me and disagreed with him.**

⭐⭐⭐ **THE RULE THAT COMES OUT OF IT: MEASURE THE RENDERED ARTEFACT, AND PREFER THE VALUE THE ENGINE
ITSELF HOLDS.** `DOMMatrix(getComputedStyle(el).transform).a` for the scale. `ctx.measureText().
actualBoundingBoxLeft` for where ink actually starts. The frame drawn to a canvas, not a percentile
of it. ⚠️ **And when he repeats himself, the variable I am changing is not the one that is wrong** —
§14 has said this since D327 and it caught me three more times in one day.

---

## 1. ⭐⭐⭐ WHAT THIS ROUND DID (D333–D347)

```
D333   ⭐ HIS NEW VIDEO — two masters, and the mobile one was PILLARBOXED A THIRD TIME
D334   the overlay returns, and the fade becomes an INSTANT CUT (his blur complaint)
D335   the first screen's subtext names the journey
D336   the arrow goes off-centre (⚠️ reverses D327f) and gets a fourth design
D337   ⭐ the arrow becomes ONE CONNECTED SVG PATH with light travelling through it
D338   the Google rating + 10 year guarantee come to the first screen, bottom left
D339   ⛔ THE ARROW'S GLITCH WAS MINE — a filter stacked on an animated mask
D340   the slab beat rewritten, moved to the hero's height, and its Z travel capped
D341   ⛔ the subtitle could not rely on VEINING — not every slab has any
D342   ⛔ "through the quarry" and "cut for your kitchen" were both untrue
D343   ⭐⭐ a THIRD BEAT returns on the closing kitchen (⚠️ reverses D326)
D344   it comes in with the lights, not after them — he sent the exact frame
D345   both beats to two lines; the kitchen beat lifted off the island
D346   ⛔⛔ the wash was reading a percentile that hid the streaks breaking the words
D347   ⛔⛔ the subtitles were still not white; the sub aligns to the title's STEM
D348   ⛔ the words go still and a wave eats them — REVERSED THE SAME NIGHT, wrong reference frame
D349   ⭐⭐⭐ THE PIN — the first screen is glued to the picture and rides it out of shot
D350   ⛔⛔ "it's shaking" — the pin was right, its CLOCK was wrong: 60fps words on a 12fps picture
D351   ⛔⛔ still shaking, sideways — `currentTime` is NOT the frame on screen. rVFC is
D352   ⭐⭐⭐ THE PIN IS OUT. The block slides off on the SCROLL and the gutter dissolves it
```

### ⛔⛔⛔ THE TRAP THAT COST TWO ROUNDS, AND IT WILL CATCH THE NEXT PERSON

```
the film is 12fps          a picture that steps and words that slide are not "in sync" —
the scrub is 60fps         they oscillate against each other by a whole frame of travel

⛔⛔⛔ DO NOT TIE       ⭐⭐ **D352's RULE, PAID FOR OVER FOUR ROUNDS: TYPE MOVES ON THE SCROLL
TYPE TO THIS PICTURE      CLOCK, NEVER ON THE FILM'S.** A pin inherits 12fps, and a fast scrub
                          presents about every SIXTH frame. A blurred photograph carries that
                          invisibly; a 76px serif does not. Accuracy cannot fix it — D351 got
                          the pin exact (every painted frame → exactly one text position) and
                          he still saw it shake.
                       ⚠️ If you ever DO pin something: `currentTime` is not the painted frame
                          (1-3 frames of lead under a scrub). `requestVideoFrameCallback` →
                          `metadata.mediaTime` is the only ground truth. Both are parked in
                          `.textanim-2026-08-24/removed-pin-d349-d351.txt`.

measure the text AFTER     ⛔ Cinzel is 135px wider across the headline than the fallback.
the font lands                D349 tracked the wrong patch of mountain because of it
```

---

## 2. ⭐⭐⭐ SITE SPEED IS A STANDING RULE — HIS OWN WORDS

Unprompted, 18 Aug: *"just make sure you always keep site speed in mind… **site speed is key**."*
`HANDOVER.md` **§2s**, and it is §2 material.

1. ⛔⛔ **ONE FILM PER BAND AND ONLY ONE IS EVER FETCHED.** Three cuts (**22.8 MB** together), a
   visitor downloads exactly one — **1920: 13.28 MB · 864: 5.62 MB · 608: 3.87 MB**. An in-place
   `<script>` beside the `<video>` sets `src` and `poster` **during parse**. ⛔ **A `display:none`
   VIDEO STILL DOWNLOADS ITS `src` AND `poster`.** **Re-verify zero requests for the other two after
   ANY change to that element or that script.** ⭐ Verified clean at 1440 / 900 / 375 this round.
2. ⭐ **`preload="none"` in the markup**, flipped to `auto` by the scrub once the band is known.
3. ⭐⭐ **FIRST PAINT COSTS THE POSTER, NOT THE FILM** — **121 KB** desktop, 81 tablet, 54 phone.
   ⭐ Since D333 the poster, the overlay plate and the film's own first frame are **one picture**, so
   nothing swaps at any point. ⛔ Do not let the posters grow.
4. ⭐⭐ **COMMENTS COME OFF ON THE WAY OUT (D315).** `make_upload.py` strips every `.html`/`.css`/
   `.js` into `upload/`. ⛔ Never strip comments from the SOURCE — they are the design record.
5. ⭐ **NOTHING UNREFERENCED SHIPS.** Dot-folders never ship. ⛔ When you remove an element, move its
   assets into a dot-folder **in the same edit**.

⚠️ **`dev-server.js` COMPRESSES AND THE HOST MAY NOT.** ⚠️ **A MEDIA ELEMENT'S OWN FETCH OFTEN DOES
NOT APPEAR IN `resource` TIMING.** Prove "the wrong film did not load" by the ABSENCE of the other
bands' URLs plus `video.getAttribute('src')`.

---

## 3. ⭐⭐⭐ THE FILM'S COPY, AS IT STANDS — EVERY WORD IS HIS OR WAS APPROVED BY HIM

```
FIRST SCREEN (desktop, at rest)
    Your worktop STARTS HERE.
    Follow the slab from the finest mountains of Europe and Asia,
    out of the quarry and into your kitchen.
    SCROLL TO BEGIN  ↓
    [Google 5.0]  [10 year guarantee]              bottom left, fading with the copy

15.0 – 24.5   The slab you choose is UNIQUE.
              Measured, cut and finished for your home, and built to last for decades.

28.5 – 37.5   The stone sets the tone of THE ROOM.
              Once you choose your stone, the rest follows.

   → the hero's own words: Surfaces worth building around
```

⛔⛔⛔ **FOUR SEPARATE COPY FAULTS WERE CAUGHT BY HIM, NOT BY ME, AND EVERY ONE WAS A CLAIM THE
BUSINESS CANNOT MAKE. Check any new line against all four:**

| the line said | why it was false |
|---|---|
| *"through the quarry"* | the film **opens at** the quarry face and never travels through one |
| *"cut for your kitchen"* | fireplaces, vanity tops and dining tables are **all live pages** |
| *"…are veined differently"* | `absolute-black-extra` has **no visible grain**; quartz is engineered; porcelain is printed |
| *"one of a kind patterns in stone"* | a plural against a mass noun — **and a third restatement of the title** |

⭐ **THE SUBTITLE'S JOB IS TO SAY WHAT THE TITLE DOES NOT.** Three of the four faults above were a
subtitle repeating its own title. ⚠️ **Every superseded line is parked in the markup LABELLED WITH
WHY IT IS WRONG**, so none of them can come back by accident.
⚠️ **"decades" is defensible and "for life" is not** — the guarantee is ten years and is a separate
promise (rule 12). ⚠️ **"unique", never "completely unique"** — his own second option and the better
English.

---

## 4. ⭐⭐⭐ THE PLACEMENT, AND THE NUMBERS THAT HOLD IT — DESKTOP ONLY

⛔ **DESKTOP ONLY (≥1121), AND THAT IS STILL HIS INSTRUCTION.** The phone and tablet keep their own
opening title and their own placement, untouched. **§13 item 2.**

| | first screen | slab beat | kitchen beat |
|---|---|---|---|
| anchor | `top:22vh` | `top:22vh` `[data-vpos-wide="hero"]` | `top:16vh` `[data-vpos-wide="high"]` |
| title | `clamp(38px,5vw,76px)` | the same | `clamp(34px,4.8vw,70px)` |
| measure | `clamp(320px,46vw,660px)` | `clamp(320px,52vw,760px)` | the same |
| Z travel | ⛔ none — it SLIDES OFF on the scroll, t=1.85→6.0 (D352) | `HERO_Z` 300 | **150** |
| lines | 2 | 2 | 2 |

⛔⛔⛔ **ANYTHING ANCHORED NEAR THE TOP CANNOT TRAVEL THE TITLES' FULL 560.** `perspective-origin` is
`26% 50%`, so a line above the middle travels **up AND left** as it approaches. D325b learned it on
the hero; D340 sprang it again on the slab beat (measured **leaving the frame at 0.58 opacity**); and
**D345 sprang it a third time because the cap keyed on one attribute VALUE and a second anchor name
had been added.** It now keys on the attribute's **presence**. ⚠️ The higher the anchor, the harder
the throw — hence 150 for `high` against 300 for `hero`.

⭐⭐ **THE KITCHEN BEAT IS FENCED ON THREE SIDES AND ALL THREE WERE MEASURED:**

```
the island's top edge     y 363–390       block bottom holds ~19px clear
the pendant lights        x 785–798       title right edge tops out at 756
the nav bar               y 0–79          block top holds ~26px clear
```

⛔ **MEASURE PER MOMENT, NOT WORST-AGAINST-WORST.** The block is LOWEST at the start of the beat,
which is exactly when the island is also lowest; the island reaches 363 only later, once the
approach has lifted the words. Worst-against-worst says this design does not fit. It does.
⛔ **AND MEASURE IN THE TEXT'S OWN BAND.** The slab beat's slab reads a left edge of **727 over the
whole frame but 790–955 in the band the words occupy** — the low figure is its bottom corner, under
the text. The whole-frame number would have vetoed a design that is fine.

### ⭐⭐ The subtitle is indented to the title's STEM, not to the box

Client: *"the middle of the g and the middle of the stem of the t, those go together."*
⛔ **THE BOXES WERE ALREADY IDENTICAL — both at x 123.85 — SO NOTHING IN THE LAYOUT WAS WRONG.**
Cinzel's `T` is a crossbar with its stem under the middle: its ink starts ~1px from the box but its
**stem sits at 0.3095 × the font size**, measured identical at both title sizes. A sans capital
centres at only ~8px, so left-flush they read ~13px apart.

```css
margin-left: calc(<the title's own clamp> * 0.3095 - <that subtitle's first-glyph half-ink>)
```
⚠️ The subtracted term is **per subtitle**: `M` centres at 9.08px, `O` at 7.97 at 19px. **Re-read it
if a subtitle's first letter changes** — a pixel is visible against a 70px stem. Calibrated live:
**residual 0.00px on both beats.**

### ⭐⭐ Every subtitle is WHITE, and three things had to change for that

⛔ `#fff` **not `--bone`** (bone is `#F4F1EA`, a warm limestone tint) · **weight 400 not 300** (at
19px a light weight is a hairline) · ⛔ **and the inherited contact shadow had to go** — `.cine-line`
sets `0 1px 4px rgba(6,6,8,0.5)`, which on a 72px serif is a contact shadow and on a 19px hairline
puts its blur **inside** the strokes and greys them from the edges in.

---

## 5. ⭐⭐⭐ THE WASH — AND THE PERCENTILE THAT WAS HIDING THE FAULT

`bandGrade()` samples the picture behind a line and sets `--lg`, which drives `.cine-line::before`,
a soft radial that reaches zero at its own box edge (**a wash, never a panel — 0.94 was tried at
D311 and looked like a plate; 0.62 is the accepted centre**).

⛔⛔⛔ **IT WAS READING A 97th PERCENTILE OF A 48×4 DOWNSAMPLE, AND ON THE KITCHEN SHOT THAT HID
EXACTLY THE THING BREAKING THE WORDS.** Measured behind the beat on the real rendered frame:

```
p50 0.011      p97 0.076      max 0.88     <- bone measures 1.0:1 against bone
```

A nearly black room with **specular streaks as bright as the type**, off the polished floor and the
windows. The downsample averaged a thin streak into the dark around it, then the percentile threw
away the top 3% — which **is** the streak. It asked for **0.24**.

⭐⭐ **NOW: 48×8, and the MAXIMUM cell rather than a percentile.** A cell is already an average of
~40 source pixels, so the "stray speck" the old note guarded against cannot exist at this
resolution. Measured after: **`--lg` runs 0.87–1.0** through the beat.
⚠️ **The shared canvas had to grow to 48×8 in the same edit** — a canvas shorter than the tallest
read hands back rows of transparent black and poisons the numbers. The nav grade still draws and
reads its own 48×4 in the top of it, verified unchanged.
⭐ **This is D313's lesson inverted.** D313: a median lies, use a percentile. Here: the percentile
lies too, for the very same reason.

---

## 6. ⭐⭐ THE OVERLAY — ON, AND IT IS AN INSTANT CUT

⭐ His stills finally **match the film**: `F1 FIXED SLAB.png` measures **0.0147** from the desktop
master's f0 and `F1 SLAB mobile.png` **0.0306** — the same render at last, where D330's pair sat at
0.301/0.143 and morphed. That was the exact condition `.plates-2026-08-22/make_plates.py` documented
for going back to his artwork.

⛔⛔ **THE FADE IS GONE.** Client: *"it needs to go away instantly when the user scrolls instead of a
fade because the fade causes a blurriness."* The blur was structural: a dissolve blends a frozen f0
with a film already elsewhere (one frame of camera motion is rms 0.054), so **any** width ghosts.
The cut lands at **half a film frame**, keyed to `currentTime` — the frame the viewer SEES, not the
eased target. Cutting between two copies of the same frame 0.03 apart is invisible.
⛔ Plates ship at the **film's** resolution (1920/864/608), not the still's 2688, or the cut shows as
a crisp→soft jump. Pipeline: `.plates-2026-08-23/make_plates.py`.

---

## 7. ⭐⭐ THE ARROW — FIFTH DESIGN, AND THE FOUR THAT FAILED

```
1  a chevron travelling down a channel     frozen: a crossbar on a line
2  one shape revealed by a clip            frozen: half a line
3  a bright stroke down a static shaft     always whole — and he still said no
4  the whole arrow bobbing                 "very plain, it can be better"
5  ⭐ ONE CONNECTED PATH, LIGHT PASSING THROUGH IT
```

⭐ Researched first, on his instruction, and **the research mostly ruled things out**: the published
vocabulary is a bouncing chevron, a `stroke-dashoffset` self-draw, and a glow — and the first two
are the two that already failed here. **He reviews from screenshots**, so a design that only reads
in motion does not read at all.
⭐ One SVG path (`M16 1.25V94.75M1.25 80L16 94.75 30.75 80`) means the shaft's end **is** the vertex
— his *"connect the tip to the point"* — and the left arm's tip sits at x=0 of the box, which is what
lines it up with the "S" of SCROLL.
⛔⛔ **THE GLITCH HE SAW WAS MINE**: the lit layer carried `drop-shadow` **and** an animated
`mask-position`, so every frame re-rastered the mask and recomputed a blur from it, inside a
`will-change` layer, on a page also scrubbing a 1920×1080 film. **A mask animation is cheap; a mask
animation under a filter is not.** Now the mask is **static** and a gradient band moves inside it on
`transform` alone.
⚠️ The mask duplicates the path — **same `d`, same 2.5 stroke, same caps, changed in the same edit.**
⭐ 1.8s cycle, and **the dip's timing is written in percentages** so a speed change cannot break its
sync with the light.

---

## 8. ⛔ THREE DEVICE BANDS

```
   ≤ 720px          721 – 1120px          ≥ 1121px
   the phone   ·   the tablet        ·   the desktop
```
⛔ **THE TABLET-ONLY BLOCK IS STILL LAST IN THE STYLESHEET** (search `THE TABLET BAND`).
⭐ **Widen a phone rule's own query to reach the tablet, never copy it.**
⚠️ ⛔⛔ **AND SOURCE ORDER DECIDES BETWEEN EQUAL SPECIFICITY.**

---

## 9. ⛔ THE GATES — RUN THESE

```bash
cd "Website Demo" && python3 build_pages.py                     # FIRST — writes footer.css AND nav.css
cd "Website Demo/services" && python3 build_services.py
cd "Website Demo/stones" && python3 build_stones.py
cd "Website Demo" && python3 build_seo_pages.py
cd "Website Demo/stones" && python3 harvest/verify.py            # 132/132/132 ✅
```

⛔⛔ **NEVER RUN `trade/build_trade.py`.** ⛔ `build_images.py` / `patch_images.py` are one-shot.
**The CSS gate** (brace delta 0 against HEAD) and **`node --check` on all three inline `<script>`
blocks** after every edit to `index.html`. ⚠️ The JS gate must EXCLUDE `application/ld+json`.
⭐⭐ **AND A `<div>` BALANCE CHECK AFTER ANY STRUCTURAL CUT.**

⭐⭐⭐ **THE GATES EARNED THEIR KEEP TWICE THIS ROUND.** The brace check caught a slice that had
swallowed a media query's closing `}`; and reading the JS after an edit caught that the Z cap had
silently stopped applying to a newly-added anchor. **Neither was visible on screen.**

### ⭐ THE FREEZE PROBE — 1440×900, FRESH LOAD, TAB IN FRONT

| Signal | Value |
|---|---|
| `.gal-scroll` height | **4950** |
| `--revPer` (on `#reviews`) | **3** |
| `feTurbulence` count | **60** |
| elements | **2711** |
| hero ink (`.hero-inner` padding-top) | **86.1828** |
| `#footer` height | **503.78** |
| document height | **24443** |
| `.hero-bg` children | **7** |
| broken images / 4xx / console errors | **0 / 0 / none** |

⚠️ **2711 is with the overlay ON and the three beats present.** ⚠️ **DOCUMENT HEIGHT 24443 — if it
reads 24899 a structural cut has left a stray closing tag.** ⚠️ The element count is only valid on a
fresh load. ⚠️ Filter broken images on `i.src && i.complete && i.naturalWidth===0`.

---

## 10. ⚠️ THE ENVIRONMENT TRAPS — ALL LIVE

- ⛔⛔⛔ **NEW — TAKE THE SCALE FROM THE MATRIX, NOT FROM ARITHMETIC.** A hand-derived perspective
  scale produced a 3.3px alignment error that did not exist. `new DOMMatrixReadOnly(getComputedStyle
  (el).transform).a` is the number the engine is actually using.
- ⛔⛔ **NEW — `ctx.font` SILENTLY REJECTS A LINE-HEIGHT.** `'400 63px/67px Cinzel'` does not parse,
  canvas falls back to a default font, and **both measurements come back identical and meaningless**
  — which reads exactly like "they are aligned". Verify `ctx.font` after setting it.
- ⛔⛔ **NEW — A CSS `mask` DRAW MUST FIT ITS CANVAS.** A 48×8 read from a 48×4 canvas returns rows of
  transparent black and quietly poisons the average.
- ⛔⛔ **`git check-ignore` BEFORE COMMITTING ANY NEW DOT-FOLDER OF HIS ORIGINALS.** The `TC*` rule
  matches his film naming only; his stills are not named that. Location rules now cover both
  (`**/assets/video/.src-*/*.png`, `**/assets/video/.plates-*/src/`).
- ⛔⛔⛔ **THE FILM NEEDS ~8s TO BUFFER AFTER A NAVIGATION BEFORE A SCRUB MEASURES ANYTHING.**
- ⛔⛔ **SAMPLING A SCRUB FASTER THAN THE EASED CHASE MEASURES THE CHASE, NOT THE PAGE.** ~2.5–3.5s
  to settle; non-monotonic film times in a sweep are the tell.
- ⛔⛔⛔ **A SCROLL ANIMATION IS DEAD IN A BACKGROUND TAB**, and **the pane throttles rAF even when
  fronted** — an in-pane fps sweep measures the throttle, not the page. Judge smoothness by seek
  latency and by what is animated, not by a frame counter.
- ⛔⛔⛔ **TWO TABS DRIFT TO DIFFERENT VIEWPORTS.** Read `innerWidth`/`innerHeight` in the SAME probe.
- ⚠️ **A BAND SWAP AFTER LOAD IS A REAL REQUEST, NOT A FAULT** — re-navigate at the target width.
- ⛔⛔ **A NARROW LOAD LOOKS EXACTLY LIKE A BROKEN PAGE.** `--stoneRaster:on` below 720px swaps the
  live marble SVG for a bitmap: `feTurbulence` reads 0 and elements drop ~570.
- ⛔⛔ **AN INLINE STYLE OUTRANKS A CLASS RULE** — hand the property back (`style.opacity=''`).
- ⛔⛔ **A CSS EDIT DOES NOT SHOW UNTIL THE BUILDERS RE-RUN** (`site.css?v=<hash>`).
- ⛔⛔ **THE PANE'S SCREENSHOT GOES BLACK after `resize_window` + reload.** Fresh tab, navigate,
  resize, shoot **without** reloading.
- ⛔ **`zoom` REGION CROP IS NOT SUPPORTED in the pane.** ⭐ To inspect something small, scale the
  element itself and shoot — and **drop a 1px `position:fixed` guide** at the coordinate you are
  testing; that is what turned "it looks misaligned" into a measurement.
- ⭐ **`scroll-behavior:smooth` eats programmatic scrolls** — use `behavior:'instant'`.
- ⛔ **`computer` LIMITS: `wait` ≤ 10s, `scroll_amount` ≤ 10.** Chain them.
- (Carried) `javascript_tool` runs before async work settles · **no numpy, PIL only; no libwebp in
  this ffmpeg; the browser canvas is the only SVG rasteriser** · valid stone presets: calacatta,
  carrara, crema, emperador, eternal, fumo, goldveil, mist, nerogold, statuario.

---

## 11. ⭐ THE LINK, AND THE SERVER

```bash
cd "Website Demo" && nohup caffeinate -ims node dev-server.js > /tmp/topcat-server.log 2>&1 &
```

⚠️⚠️ **THE IP HAS MOVED FOUR TIMES** (currently **192.168.10.246**).
**Re-check with `ipconfig getifaddr en0` at the start of every reply that hands him a link.** A dead
link presents as *"most of the images aren't loading"*.
⚠️ **The server also stops overnight.** ⭐ **DETACHED ON PURPOSE — do not `preview_stop` it.**
⭐ **USE `http://localhost:5501` IN THE PREVIEW PANE**, on his instruction.

---

## 12. ⭐ WHERE THINGS STAND

| Page | State |
|---|---|
| **`/`** | opens on his NEW film at every band, the overlay cutting to it at f0, **a second hero on the first screen with the Google rating bottom-left**, **three story beats**, skip control, 182vh of dead scroll on the finished hero |
| **`/about/` + six internal** | the `.page-head` family; directors visible and bright at all bands |
| **`/services/*.html`** | nine leaves, each on its OWN photograph; burger nav ≤1120; quote card ≥1121 |
| **`/stones/`** | 132 pages + collection + compare; white ledes; **no quote card, deliberately** |
| **`/materials/` `/guides/` `/worktops/` `/sitemap.html`** | the 26-page SEO layer; 22 carry the quote card |
| **`/trade/`** | eight sections; CTA carries WhatsApp |
| **all 176 pages** | one footer, one mobile nav, og:image + twitter:card, favicon, hours **Mon–Sun 7am–9pm**, no code comments in view-source |

⚠️ **SHARED PHOTOGRAPHS NOT TO DELETE**: `kitchen-day.jpg`, `hero-night-*`, `og-cover.jpg`,
`team/fitting.jpg`, and everything inside the dot-folders under `assets/video/`.

---

## 13. ⛔ RULES THAT MUST NOT BE BROKEN

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
10. ⛔ **The logo is the client's artwork, never re-drawn or re-coloured. Set HEIGHT only.**
11. ⛔⛔ **A mark is never put in a circle, ring, disc or plate.** ⚠️ A control is not a mark.
    ⛔ **And a dark shape with an EDGE has been rejected twice** — grades are anchored to the frame
    edge or are washes that reach zero inside their own box. **Never a panel.**
12. ⛔ **One device at a time unless he says otherwise.**
13. ⭐⭐ **THIS IS A DESIGN BUILD. NEVER RAISE THE MISSING FORM BACKEND AS A BLOCKER.**
14. ⛔⛔ **2 CREDITS MAXIMUM PER GENERATED IMAGE.** ⭐ **This round spent nothing.**
15. ⭐⭐⭐ **SITE SPEED IS KEY** — his own words.

---

## 14. OPEN — DO THESE NEXT

### ⭐⭐⭐ The film, which is the live scope

1. ⭐⭐⭐ **THE TEXT ANIMATION — ONE SECTION AT A TIME, AND THE FIRST ONE IS DONE (D349).** The first
   screen is now PINNED to the picture: it does not fade, does not travel in Z, and rides the ground
   it stands on out of frame. **The two beats are back on D316 exactly and are WAITING FOR HIM** —
   his words: *"that will also have its own different way of animating… we're only doing the first
   part now."* ⛔ **DO NOT INVENT EITHER OF THEM.** ⭐ D348's wave, parked in
   `.textanim-2026-08-24/`, is a real candidate for the CLOSING KITCHEN — its shot is measured as
   completely locked off, so a pin has nothing to ride there.
2. ⭐⭐⭐ **MOBILE AND TABLET TEXT PLACEMENT. THIS IS NOW BADLY OWED.** Deferred since D325 (*"we will
   talk about mobile and tablet text placement after"*), and **the desktop has moved a long way from
   them this round** — two-line titles, a lifted kitchen beat, stem-aligned subtitles, a third beat.
   ⚠️ **Measured and NOT fixed, because it is out of scope: on the phone the slab beat already flies
   off-frame while still at 0.68 opacity, and always has.**
   ⛔⛔ **AND D349 HAS WIDENED THE GAP**: the desktop's first screen is pinned to the picture, while
   both narrow bands still fly their opening title at the viewer. ⚠️ **A PIN DOES NOT PORT — IT IS
   RE-MEASURED PER FILM.** The phone runs a different cut and the tablet a different crop, so each
   needs its own tracked table (the probe is in D349).
3. ⭐⭐ **THE HEADLINE WORDING** — he is still taking the client's input. Three alternates parked.
4. ⭐ **THE HERO PLATE FOR THE ENDING.** Withdrawn at D328 because the re-cut moved the camera.
   **It needs a new still from him**, or it stays off.
5. ⭐⭐ **DOES THE FILM WANT SOUND?** The masters carry PCM; the site drops it. Never discussed.
6. ⭐ **THE 19 DRONE VIDEOS** (Hornchurch, Rickmansworth) — worth re-asking now the site carries film.

### ⭐⭐⭐ The ones that are costing money

7. ⭐⭐⭐ **HOW DO FILES ACTUALLY REACH `thadeusg3.sg-host.com`?** Asked twelve times.
   **Everything from D291 onward is still NOT live — including his new video and every word of the
   film's copy.**
8. ⭐⭐⭐ **WHOSE ARGENTO DOES HE SELL?** His reference is a dense flecked grey-white; the site shows
   the supplier's veined marble-look. ⛔ Do not paste the Google image.
9. ⭐⭐ **THE STONE PHOTOGRAPHY AUDIT** — 24 of 132 verified; **92 Nile Stone tiles unverified**.
10. ⭐ **Pick a production host**; brotli; check the `.htaccess` cache rules survive it.
    ⚠️ **22.8 MB of film makes this urgent.**

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
21. ⚠️ **Two slabs lean blue and nobody has ruled**: `arabescato-grey`, `calacatta-gold-shimmer`.
22. ⭐ **Facebook, TikTok, YouTube?** ⛔ Do not guess handles.
23. ⭐ **Per-stone og:image** — 132 conversions.
24. ⚠️ **`Next Stone Slabs` is named in one place** — sanctioned by D203. Read D203 before "fixing".
25. ⚠️ **The stale branch `tablet-round-d197-d200`** — deletable once item 7 is answered.

**Still waiting on the client:** whether Quartzite becomes a fourth range, 20mm vs 30mm pricing,
brackets for vanity tops / fireplaces / tables, and the £3k vs £3,850 three-slab discrepancy.

**CLOSED this round:** his new video on all three bands; the pillarbox, a third time; the overlay,
back and cutting instead of fading; the arrow, through two more designs, a glitch and three speed
changes; the Google rating on the first screen; all three beats' copy and placement; the wash's
percentile bug; and the subtitles, finally white.

---

## 15. ⭐ HOW THIS CLIENT WORKS

⛔⛔⛔ **HIS COMPLAINT NAMES THE SYMPTOM CORRECTLY EVERY TIME. IF YOU "FIX" IT AND HE REPEATS
HIMSELF, YOU CHANGED THE WRONG VARIABLE — DO NOT CHANGE THE SAME ONE HARDER.** He said "too hard to
read" three times and "make them white" twice. **Each repeat was a new fault in a new place, and
each time my measurement had already told me it was fine.** §0.

⛔⛔ **WHEN HE REPEATS HIMSELF, GO AND LOOK AT THE RENDERED PIXELS.** Drawing the video frame to a
canvas and reading `max` rather than `p97` found in one probe what three rounds of reasoning missed.

⛔⛔ **DO NOT ARGUE YOURSELF OUT OF SOMETHING HE ASKED FOR, AND DO NOT HAND HIM THE DILEMMA.**
**A real constraint is a problem to solve, not a question to return.** ⭐ When his ask and the frame
genuinely conflict — his *"same size as the other text"* against pendant lights in the lane — **size
the thing to the frame and tell him the number**, do not silently drop the ask.

⛔⛔ **DO NOT ASK HIS PERMISSION. Commit, push, report.**

⭐⭐⭐ **HE REVIEWS FROM SCREENSHOTS, AND HE SENDS THEM.** He sent a frame this round and said "come in
here" — it was identifiable to **t=29.0 exactly**, because only that frame had both the settling
floor tiles and a globe entering the top edge. **When he sends a frame, identify it precisely; the
answer is in the picture.**

⭐⭐⭐ **HE REVERSES HIMSELF FREELY AND FAST.** D326 removed a beat; D343 put one back in the same
window. D327f asked for the arrow centred; D336 asked for it off-centre. **The way to make that
cheap is to park everything and delete nothing**, labelled with why it went.

⭐⭐ **HE SENDS CORRECTIONS MID-TURN, THREE OR FOUR DEEP.** Finish the one you are on, then take the
next in his order.

⭐⭐ **WHEN YOUR OWN WORK CAUSED THE FAULT, SAY SO IN THE FIRST LINE.** He is fine with that and not
fine with spin. The arrow's glitch, the wash's percentile and the grey subtitles were all mine.

⚠️ **HE SWEARS WHEN SOMETHING LOOKS WRONG, AND THE COMPLAINT IS ALWAYS REAL.**

- **Walk the journey, do not check the page.** ⭐⭐ **Look at the result before reporting it done.**
- **Measure, then claim** — and if you could not measure it, say so.
- ⭐⭐ **AND CHECK THE VIEWPORT IN THE SAME BREATH AS THE NUMBER.**

---

## 16. BUDGET AND THE DOCUMENT SET

⭐ **This round spent 0 credits.** Every encode, crop, grade match, glyph metric and contrast figure
was `ffmpeg`, PIL, the browser's own canvas and plain Python; the films and the stills are his.

| File | What it is |
|---|---|
| **`HANDOVER.md`** | ⭐ The single current state. §D is the register, **D1–D130, D132–D347**. §2 the standing rules, **§2s SITE SPEED**, §2a the supplier list. ⚠️ **THERE IS NO D131 ROW.** ⚠️ Section numbers are referenced from code comments — **do not renumber** |
| **`Website Demo/index.html`** | ⭐⭐ The whole landing design. Search `THE SCROLL FILM`, `THE OPENING FRAME AS A SECOND HERO`, `THE ARROW`, `THE OPENING OVERLAY`, `THE PROOF`, `cine-line`, `bandGrade`, `THE TABLET BAND` |
| **`assets/video/.src-2026-08-23/`** | ⭐⭐ His two current masters and two stills (`.gitignore`d) + `encode.sh` with the full method |
| **`assets/video/.plates-2026-08-23/`** | ⭐⭐ The overlay pipeline: `make_plates.py` writes the plates AND the posters |
| **`assets/video/.plates-2026-08-22/`** | The D330–D332 record, including the master-frame pipeline this replaces |
| **`Website Demo/.textopts-2026-08-22/`** | ⭐ The eleven first-screen options he chose from |
| **`Docs/Overlay-for-Scroll-Animation-Guide.md`** | ⭐ **His own written build guide** for the stills |
| **`Website Demo/build_pages.py`** | ⭐⭐ Seven internal pages, `site.css`, `site.js`, `footer.css`, `nav.css`. ⚠️ **RUN IT FIRST** |
| **`Website Demo/make_upload.py`** | ⭐⭐⭐ Writes a clean `../upload/`. ⚠️ Dot-folders never ship; comments stripped on the way out |
| **`Website Demo/.htaccess`** | ⭐⭐ Cache rules, mp4/webm for a week. ⚠️ A dotfile |
| **`assets/footer.css` `assets/nav.css`** | ⛔ **GENERATED.** Never edit |
| **`services/service.css`** | ⭐⭐⭐ Dresses all 167 generated pages. ⛔ No footer rules |
| ⛔ **`trade/build_trade.py`** | ⛔⛔ **SUPERSEDED — DO NOT RUN** |
| ⛔ **`build_images.py` `patch_images.py`** | ⛔⛔ **ONE-SHOT, CANNOT RUN AGAIN** |
| `HANDOVER-2026-08-22-first-screen-round-start-here.md` | ⭐ The START HERE this file replaces (D325–D332) |
| `HANDOVER-archive-to-2026-08-06.md` | ⚠️ **Every design the client rejected, in his words.** Read before redesigning anything |
