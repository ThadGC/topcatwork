# START HERE — 24 August 2026, after THE TEXT ANIMATION ROUND (D348–D353)

Read this, then `HANDOVER.md` **§D** (the register, newest first — this round is **D348–D353**),
**§2** (the standing rules) and **§2s** (SITE SPEED). About twenty minutes, and enough to work safely.

> ⚠️ **This replaces the previous version of this same file**, now
> `HANDOVER-2026-08-23-film-round-start-here.md` (D333–D347). Everything that still matters
> is carried below.

> ⭐⭐ **THE ACTIVE SCOPE IS THE FILM'S TEXT ANIMATION, ONE SECTION AT A TIME, ON DESKTOP.** The
> first screen is DONE (§4). **The two beats are deliberately untouched and are waiting for him** —
> his instruction, verbatim, in §13 item 1. ⛔ **Do not invent either of them.**

---

## 0. ⛔⛔⛔ THE ONE THING TO TAKE FROM THIS ROUND

**⭐⭐⭐ SIX BUILDS OF ONE ANIMATION. FOUR OF THEM WERE MEASURED, VERIFIED AND CORRECT, AND HE
REJECTED ALL FOUR. THE FAULT WAS NEVER ACCURACY — IT WAS THE FRAME OF REFERENCE, AND THEN THE
CLOCK.**

```
D348  the words hold still and a wave erases them   "functioning, but not very good"
D349  the words are PINNED to the picture           "it's shaking"
D350  the pin runs on the film's frame, not the     "still shaking, left and right"
      scroll's continuous time
D351  the pin runs on the frame the browser has     "we can't get the text to stop shaking"
      actually PAINTED (verified exact)
D352  ⭐ the words leave on the SCROLL and the
      screen's own edge dissolves them              "we're almost there"
D353  ⭐ and they leave from the first pixel of it
```

⛔⛔⛔ **THE RULE THAT COST FOUR ROUNDS: TYPE MOVES ON THE SCROLL CLOCK, NEVER ON THE FILM'S.**
The film is **12fps**, and a fast scrub presents roughly **every sixth frame**. A blurred moving
photograph carries that stepping invisibly. **A 76px serif does not.** By D351 the pin was exact —
every painted frame mapped to exactly one text position, verified live — **and he still saw it
shake, because he was seeing the film's own frame rate rendered on type.** No amount of accuracy
was ever going to fix it. The answer was to stop following the picture at all.

⭐⭐ **AND THE SECOND LESSON, WHICH IS ABOUT READING HIM: HIS SCREENSHOTS MARK MOMENTS IN THE
SCROLL, NOT POSITIONS IN THE LAYOUT.** At D352 he sent a frame with the words half off the side and
said *"once the text reaches this point"* — I built the block STILL until that moment. What he
meant was that it should already be on its way by then. **When he sends a frame, ask what it is a
picture OF: the state, or the timing.**

---

## 1. ⭐⭐⭐ WHAT THIS ROUND DID (D348–D353)

```
D348   the words hold still, a soft wave erases them left to right      ⛔ superseded
D349   ⭐⭐ THE PIN — the words glued to the ground they stand on,
       from a tracked per-frame table of the film's own far field       ⛔ superseded, PARKED
D350   the pin moves to the film's own frame grid, and it grows
D351   the pin reads the frame rVFC says is PAINTED, not `currentTime`
D352   ⭐⭐⭐ THE PIN COMES OUT. The block SLIDES OFF on the scroll, and a
       mask nailed to the LEFT GUTTER dissolves it as it crosses
D353   ⭐⭐ it leaves from the FIRST pixel of scroll, at the picture's own
       starting speed, and the fade tightens to half the gutter
```

---

## 2. ⭐⭐⭐ SITE SPEED IS A STANDING RULE — HIS OWN WORDS

Unprompted, 18 Aug: *"just make sure you always keep site speed in mind… **site speed is key**."*
`HANDOVER.md` **§2s**, and it is §2 material.

1. ⛔⛔ **ONE FILM PER BAND AND ONLY ONE IS EVER FETCHED.** Three cuts (**22.8 MB** together), a
   visitor downloads exactly one — **1920: 13.28 MB · 864: 5.62 MB · 608: 3.87 MB**. An in-place
   `<script>` beside the `<video>` sets `src` and `poster` **during parse**. ⛔ **A `display:none`
   VIDEO STILL DOWNLOADS ITS `src` AND `poster`.** **Re-verify zero requests for the other two after
   ANY change to that element or that script.** ⭐ Verified clean this round at 1440 and 390.
2. ⭐ **`preload="none"` in the markup**, flipped to `auto` by the scrub once the band is known.
3. ⭐⭐ **FIRST PAINT COSTS THE POSTER, NOT THE FILM** — **121 KB** desktop, 81 tablet, 54 phone.
   ⭐ The poster, the overlay plate and the film's own first frame are **one picture**, so nothing
   swaps at any point. ⛔ Do not let the posters grow.
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
    [Google 5.0]  [10 year guarantee]              bottom left, leaving with the copy

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
promise (rule 12). ⚠️ **"unique", never "completely unique"** — his own second option.

---

## 4. ⭐⭐⭐ THE FIRST SCREEN'S EXIT — THE ONE THAT SURVIVED, AND WHY

⛔ **DESKTOP ONLY (≥1121), AND THAT IS STILL HIS INSTRUCTION.** §13 item 2.

**The whole mechanism in four lines:**

```
the block           holds its approved position at rest, and NEVER moves for the film
from t=0            it translates LEFT on the eased SCROLL value — 761px, its own right
                    edge to the frame's left — and is clear at t=6.0
the fade            a mask NAILED TO THE LEFT GUTTER that never moves. The block crosses it
the chips           carry the identical offset, so the first screen leaves as ONE object
```

⭐⭐⭐ **THE MASK DOES NOT MOVE AND THE BLOCK MOVES THROUGH IT. THAT IS THE WHOLE DESIGN.** Client:
*"the fade is never visible in the center of the screen or in the center of the text or away from
the side… it gives the illusion that the side of the screen is wiping it away instead of an actual
animation."* A sweeping mask — D348's, and the first cut of D352 — puts the fade in the MIDDLE of
the frame, where you can watch it happen. This is the opposite construction.

⭐⭐ **THE RAMP IS THE GUTTER, AND THAT IS WHY IT IS FREE:**

```css
--edgeFade: calc(clamp(20px,7vw,132px) * 0.5);   /* the copy's own inset, halved */
```

The copy is inset by `clamp(20px,7vw,132px)`, so a ramp written from the same expression **ends
before the type begins at every desktop width** — the approved rest frame is untouched and the two
cannot drift apart, because they are one value. ⛔ **It is also why the two beats need no
exception**: they sit at the same gutter and never move, so the fade never reaches them.
⚠️ **HALF the gutter since D353** — the full width read as *"a gradient fade"*; half keeps the
letters solid until they are ~50px from the edge. ⭐ One number if he wants it firmer still.

### ⭐⭐ The speed is a measurement, not a feel

`wipeEase(p) = 0.4p + 0.6p²` over 761px.

```
the far field travels    620 screen px over the six seconds, starting at 51 px/s
this curve starts at     50.7 px/s      — the picture's rate to within a pixel
and finishes             1.23x ahead of the scene
```

That is what *"it matches perfectly with the video"* buys: it sits with the picture for the first
moment and is then taken by the side. ⛔ **It must NOT keep pace for long** — anything that matches
a 12fps film invites the eye to compare the two and see the steps (§0). ⚠️ **It starts with real
velocity, not an ease-in**: an ease-in is exactly the *"I can swipe quite a while before the text
starts moving"* he objected to at D353.

⭐ **ONE WRITE PER FRAME** — a single translate shared by the words and the proof chips, under a
fully static mask. Nothing to re-rasterise, and ⛔ **no `filter` anywhere near a masked element**
(that pair is what glitched the arrow at D339).

### ⚠️ THE TWO BEATS ARE ON D316 AND ARE UNTOUCHED

`story()` is **byte-identical to its pre-D348 self**, verified by diff, at every band: fade in over
16%, travel in Z, fade out over 26%, with the depth-of-field blur as they cross the focal plane.
**Each gets its own answer and he says when.** §13 item 1.

| | first screen | slab beat | kitchen beat |
|---|---|---|---|
| anchor | `top:22vh` | `top:22vh` `[data-vpos-wide="hero"]` | `top:16vh` `[data-vpos-wide="high"]` |
| title | `clamp(38px,5vw,76px)` | the same | `clamp(34px,4.8vw,70px)` |
| measure | `clamp(320px,46vw,660px)` | `clamp(320px,52vw,760px)` | the same |
| exit | ⭐ slides off on the scroll | Z travel 300 | Z travel **150** |

⛔⛔ **THE PERSPECTIVE TRAP IS STILL LIVE ON THE TWO BEATS.** `perspective-origin` is `26% 50%`, so
anything anchored above the middle travels UP AND LEFT as it approaches, and it has been sprung
three times (D325b, D340, D345). The cap keys on the **presence** of `data-vpos-wide`, not its
value. ⚠️ The first screen no longer travels, so it can no longer spring it.

---

## 5. ⭐⭐ THE CLEARANCES, AND HOW TO MEASURE THEM

⭐⭐ **THE KITCHEN BEAT IS FENCED ON THREE SIDES AND ALL THREE WERE MEASURED:**

```
the island's top edge     y 359–366 through the beat    block bottom 345, so 14–21px clear
the pendant lights        x 785–798                     title right ink edge 776
the nav bar               y 0–79                        block top 144, so 65px clear
```

⛔ **MEASURE PER MOMENT, NOT WORST-AGAINST-WORST**, and ⛔ **MEASURE IN THE TEXT'S OWN BAND** — the
slab beat's slab reads a left edge of **727 over the whole frame but 790–955 in the band the words
occupy**, and the whole-frame number would have vetoed a design that is fine.
⚠️ **14px is the tightest the kitchen beat gets** (at t=36) and it never touches. It was ~19 when
the words still travelled; the travel used to lift them clear as the island rose. **His call.**

---

## 6. ⭐⭐ THE WASH — AND THE PERCENTILE THAT WAS HIDING THE FAULT

`bandGrade()` samples the picture behind a line and sets `--lg`, which drives `.cine-line::before`,
a soft radial that reaches zero at its own box edge (**a wash, never a panel — 0.94 was tried at
D311 and looked like a plate; 0.62 is the accepted centre**).

⛔⛔⛔ **IT WAS READING A 97th PERCENTILE OF A 48×4 DOWNSAMPLE, AND ON THE KITCHEN SHOT THAT HID
EXACTLY THE THING BREAKING THE WORDS.** Measured behind the beat on the real rendered frame:

```
p50 0.011      p97 0.076      max 0.88     <- bone measures 1.0:1 against bone
```

A nearly black room with **specular streaks as bright as the type**. ⭐⭐ **NOW: 48×8, and the
MAXIMUM cell rather than a percentile** — `--lg` runs 0.87–1.0 through the beat.
⚠️ The shared canvas is 48×8; a canvas shorter than the tallest read hands back rows of transparent
black and poisons the numbers. ⭐ **This is D313's lesson inverted** — a median lies, and so does a
percentile, for the very same reason.

---

## 7. ⭐⭐ THE OVERLAY, AND THE ARROW

**The overlay** is ON and it is an **instant cut**, not a fade. Client: *"it needs to go away
instantly when the user scrolls instead of a fade because the fade causes a blurriness."* The blur
was structural — a dissolve blends a frozen f0 with a film already elsewhere. The cut lands at
**half a film frame**, keyed to `currentTime`. ⛔ Plates ship at the **film's** resolution
(1920/864/608), not the still's 2688. Pipeline: `.plates-2026-08-23/make_plates.py`.

**The arrow** is on its fifth design: **one connected SVG path with light travelling through it**
(`M16 1.25V94.75M1.25 80L16 94.75 30.75 80`). Four designs failed before it.
⛔⛔ **THE GLITCH HE SAW WAS MINE**: the lit layer carried `drop-shadow` **and** an animated
`mask-position`, so every frame re-rastered the mask and recomputed a blur from it. **A mask
animation is cheap; a mask animation under a filter is not.** The mask is now static and a gradient
band moves inside it on `transform` alone. ⚠️ The mask duplicates the path — **same `d`, same 2.5
stroke, same caps, changed in the same edit.**

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
**The CSS gate** (brace delta 0, and compare the COUNT against HEAD) and **`node --check` on all
three inline `<script>` blocks** after every edit to `index.html`. ⚠️ The JS gate must EXCLUDE
`application/ld+json`. ⭐⭐ **AND A `<div>` BALANCE CHECK AFTER ANY STRUCTURAL CUT** (259/257 is the
correct, long-standing figure — it is not an error).

⛔⛔ **NEW — A BRACE INSIDE A COMMENT COUNTS.** A comment containing `html{overflow-x:clip}` pushed
the CSS count up by one while the delta stayed 0; the count only made sense again after the braces
came out of the prose. **Write CSS in comments without braces**, and compare the COUNT, not just
the delta, or the gate quietly stops meaning anything.

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

⭐ **EVERY ROW RE-VERIFIED AT THE END OF THIS ROUND.** ⚠️ **2711 is with the overlay ON and the three
beats present.** ⚠️ **DOCUMENT HEIGHT 24443 — if it reads 24899 a structural cut has left a stray
closing tag.** ⚠️ The element count is only valid on a fresh load. ⚠️ Filter broken images on
`i.src && i.complete && i.naturalWidth===0`.

---

## 10. ⚠️ THE ENVIRONMENT TRAPS — ALL LIVE

- ⛔⛔⛔ **NEW — `currentTime` IS NOT THE FRAME ON THE SCREEN.** Assigning it moves it at once; the
  picture waits for the decode. Measured under a live scrub: **1 to 3 frames of lead, 23px on
  screen**. ⭐ `video.requestVideoFrameCallback` → `metadata.mediaTime` is the only ground truth,
  and it also reveals that **a fast scrub presents about every SIXTH frame**.
- ⛔⛔⛔ **NEW — MEASURE TEXT AFTER THE FONT LANDS.** Cinzel is **135px wider** across the headline
  than the fallback. A measurement taken before `document.fonts.ready` sent D349's tracker to a
  patch of mountain 200px from the glyph it was supposed to be pinned to, and cost a whole re-track.
- ⛔⛔ **NEW — THE FRAME AVERAGE OF THIS FILM BELONGS TO NOTHING IN IT.** The camera flies forward
  along the quarry face, so **the near wall expands to the RIGHT while the far field swings LEFT**.
  A global motion estimate is the average of two opposing motions. Measure the region you mean.
- ⛔⛔ **A CSS `mask` DRAW MUST FIT ITS CANVAS.** A 48×8 read from a 48×4 canvas returns rows of
  transparent black and quietly poisons the average.
- ⛔⛔ **`git check-ignore` BEFORE COMMITTING ANY NEW DOT-FOLDER OF HIS ORIGINALS.**
- ⛔⛔⛔ **THE FILM NEEDS ~8s TO BUFFER AFTER A NAVIGATION BEFORE A SCRUB MEASURES ANYTHING.**
- ⛔⛔ **SAMPLING A SCRUB FASTER THAN THE EASED CHASE MEASURES THE CHASE, NOT THE PAGE.** ~2.5–3.5s
  to settle; poll `currentTime` until it stops changing before trusting a reading or a screenshot.
- ⛔⛔⛔ **A SCROLL ANIMATION IS DEAD IN A BACKGROUND TAB**, and **the pane throttles rAF even when
  fronted** — an in-pane fps sweep measures the throttle, not the page.
- ⛔⛔ **TWO TABS DRIFT TO DIFFERENT VIEWPORTS.** Read `innerWidth`/`innerHeight` in the SAME probe.
- ⚠️ **A SCROLL SET IMMEDIATELY AFTER A NAVIGATION IS UNDONE** by the browser's own scroll
  restoration. Set it, then set it again a moment later.
- ⚠️ **A BAND SWAP AFTER LOAD IS A REAL REQUEST, NOT A FAULT** — re-navigate at the target width.
- ⛔⛔ **A NARROW LOAD LOOKS EXACTLY LIKE A BROKEN PAGE.** `--stoneRaster:on` below 720px swaps the
  live marble SVG for a bitmap: `feTurbulence` reads 0 and elements drop ~570.
- ⛔⛔ **AN INLINE STYLE OUTRANKS A CLASS RULE** — hand the property back (`style.opacity=''`), and
  **do not write a property at a band that has no rule to answer it** (D348 shipped that once).
- ⛔⛔ **A CSS EDIT DOES NOT SHOW UNTIL THE BUILDERS RE-RUN** (`site.css?v=<hash>`). ⚠️ `index.html`'s
  own inline CSS is served directly and needs no builder.
- ⛔⛔ **THE PANE'S SCREENSHOT GOES BLACK after `resize_window` + reload.** Fresh tab, navigate,
  resize, shoot **without** reloading.
- ⛔ **`zoom` REGION CROP IS NOT SUPPORTED in the pane.** ⭐ To inspect something small, render it
  offline with PIL and read the PNG — that is what proved the pin held on the ridge.
- ⭐ **`scroll-behavior:smooth` eats programmatic scrolls** — use `behavior:'instant'`.
- ⛔ **`computer` LIMITS: `wait` ≤ 10s, `scroll_amount` ≤ 10.** Chain them.
- (Carried) `javascript_tool` runs before async work settles — kick the work, wait, read it back in
  a second call · **no numpy, PIL only** (PIL's `ImageChops.difference` + `ImageStat` is a fast SAD
  and is what every track this round was built on) · **no libwebp in this ffmpeg; the browser canvas
  is the only SVG rasteriser** · valid stone presets: calacatta, carrara, crema, emperador, eternal,
  fumo, goldveil, mist, nerogold, statuario.

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
| **`/`** | opens on his film at every band, the overlay cutting to it at f0, **a second hero on the first screen that now slides off on the scroll**, **three story beats**, skip control, 182vh of dead scroll on the finished hero |
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

1. ⭐⭐⭐ **THE TWO BEATS' ANIMATIONS — HIS, AND HE SAYS WHEN.** Verbatim: *"the animation of the text
   where it says the slab you choose is unique will change that one to be something different only
   when we're ready. We're doing one section at a time now. And then the same thing for the stone
   sets the tone of the room, that will also have its own different way of animating."*
   ⛔ **DO NOT INVENT EITHER OF THEM. WAIT FOR HIM.** ⭐ Two mechanisms are already built, measured
   and parked, and either is a paste away — see §16. **A wave that erases in place is the natural
   candidate for the CLOSING KITCHEN, whose shot is measured as completely locked off** (zero camera
   motion), so a pin has nothing to ride there.
2. ⭐⭐⭐ **MOBILE AND TABLET TEXT PLACEMENT. STILL BADLY OWED.** Deferred since D325 (*"we will talk
   about mobile and tablet text placement after"*), and the desktop has now moved a very long way
   from them. ⚠️ **Measured and NOT fixed, because it is out of scope: on the phone the slab beat
   already flies off-frame while still at 0.68 opacity, and always has.**
   ⚠️ **THE FIRST SCREEN'S EXIT DOES NOT PORT AS-IS** — the phone runs a different cut and the
   tablet a different crop, so the far field's speed (§4) has to be re-measured per band before the
   curve means anything.
3. ⭐⭐ **THE HEADLINE WORDING** — he is still taking the client's input. Three alternates parked.
4. ⭐ **THE HERO PLATE FOR THE ENDING.** Withdrawn at D328 because the re-cut moved the camera.
   **It needs a new still from him**, or it stays off.
5. ⭐⭐ **DOES THE FILM WANT SOUND?** The masters carry PCM; the site drops it. Never discussed.
6. ⭐ **THE 19 DRONE VIDEOS** (Hornchurch, Rickmansworth) — worth re-asking now the site carries film.
7. ⚠️ **THE GROWTH IS OUT.** D350 added a 1.00→1.20 scale on his *"it should get bigger"*; D352
   removed it with the pin, because a still block that grows reads as a zoom. **He has not been
   asked whether he wants it back on the sliding block.** It is one line.

### ⭐⭐⭐ The ones that are costing money

8. ⭐⭐⭐ **HOW DO FILES ACTUALLY REACH `thadeusg3.sg-host.com`?** Asked twelve times.
   **Everything from D291 onward is still NOT live — including his video and every word of the
   film's copy.**
9. ⭐⭐⭐ **WHOSE ARGENTO DOES HE SELL?** His reference is a dense flecked grey-white; the site shows
   the supplier's veined marble-look. ⛔ Do not paste the Google image.
10. ⭐⭐ **THE STONE PHOTOGRAPHY AUDIT** — 24 of 132 verified; **92 Nile Stone tiles unverified**.
11. ⭐ **Pick a production host**; brotli; check the `.htaccess` cache rules survive it.
    ⚠️ **22.8 MB of film makes this urgent.**

### ⭐⭐ His call

12. ⭐⭐ **THE PHONE'S BAR** — the skeleton crosses his 11-Aug *"already formed from the top"* ruling.
    **One word puts it back: delete the two `header.bar.preform::after` lines.**
13. ⭐⭐ **THE SITEMAP LINK'S GOLD STYLING** — `seo.css` has the rule, no footer has the hook.
14. ⭐⭐ **A QUOTE CARD FOR THE PHONE AND TABLET.** D300 is desktop-only because he said so.
15. ⭐⭐ **Trade terms** — payment, minimum order, lead times, a dedicated contact. **His stated first
    priority.**
16. ⭐⭐ **Two sentences for Nick and Rimsha** · **the credit ceiling** · **Calacatta Gold licensing**
    · **the fireplace scope, with Nick** · **Ali Jaffer and Kav / Uxbridge**.
17. ⭐ **Confirm the silica / HSE sentence in his own words (D202).**
18. ⭐ **Kitchen islands is not on his service list** — the page is live, linked and dressed (D294).
19. ⭐ **Trustpilot** — recommended against putting 4.0 beside the Google 5.0. He has not ruled.
20. ⚠️ **RIMSHA OR REMSHA?** Still unresolved. Her name is on a public page under her photograph.
21. ⚠️ **THE HORNCHURCH GALLERY SET** — the lead frame is clear, the other 11 were never checked.
22. ⚠️ **Two slabs lean blue and nobody has ruled**: `arabescato-grey`, `calacatta-gold-shimmer`.
23. ⭐ **Facebook, TikTok, YouTube?** ⛔ Do not guess handles.
24. ⭐ **Per-stone og:image** — 132 conversions.
25. ⚠️ **`Next Stone Slabs` is named in one place** — sanctioned by D203. Read D203 before "fixing".
26. ⚠️ **The stale branch `tablet-round-d197-d200`** — deletable once item 8 is answered.

**Still waiting on the client:** whether Quartzite becomes a fourth range, 20mm vs 30mm pricing,
brackets for vanity tops / fireplaces / tables, and the £3k vs £3,850 three-slab discrepancy.

**CLOSED this round:** the first screen's text animation, through six builds — a wave, a pin, the
pin on the film's frame grid, the pin on the painted frame, the slide with an edge fade, and the
slide starting from the first pixel of scroll.

---

## 15. ⭐ HOW THIS CLIENT WORKS

⛔⛔⛔ **HIS COMPLAINT NAMES THE SYMPTOM CORRECTLY EVERY TIME. IF YOU "FIX" IT AND HE REPEATS
HIMSELF, YOU CHANGED THE WRONG VARIABLE — DO NOT CHANGE THE SAME ONE HARDER.** He said "it's
shaking" three times across three different builds, and each time my measurement said the build was
correct. **It was: and he was still right.** The variable was never the one being measured.

⛔⛔ **WHEN HE REPEATS HIMSELF, GO AND LOOK AT THE RENDERED PIXELS**, and if the thing you are
building follows something else on the page, **go and check what that something is actually doing**
— the film's frame rate was in plain sight for three rounds.

⭐⭐⭐ **HIS SCREENSHOTS MARK MOMENTS, NOT LAYOUTS.** See §0. When he sends a frame, work out whether
he is pointing at a STATE or at a TIME. He is usually pointing at a time.

⛔⛔ **DO NOT ARGUE YOURSELF OUT OF SOMETHING HE ASKED FOR, AND DO NOT HAND HIM THE DILEMMA.**
**A real constraint is a problem to solve, not a question to return.** ⭐ When his ask and the frame
genuinely conflict, **size the thing to the frame and tell him the number**.

⛔⛔ **DO NOT ASK HIS PERMISSION. Commit, push, report.**

⭐⭐⭐ **HE REVIEWS FROM SCREENSHOTS, AND HE SENDS THEM.** ⭐⭐ **HE REVERSES HIMSELF FREELY AND FAST** —
D348's wave was killed by D349 and asked for again by D352, four builds later. **The way to make
that cheap is to park everything and delete nothing**, labelled with why it went. It paid for itself
inside one day this round.

⭐⭐ **HE SENDS CORRECTIONS MID-TURN, THREE OR FOUR DEEP.** Finish the one you are on, then take the
next in his order. ⚠️ **A correction that arrives while you are still building can invert the
design** — his *"the fade is never visible in the center"* landed mid-build and reversed the whole
construction. **Read it before shipping what you have.**

⭐⭐ **WHEN YOUR OWN WORK CAUSED THE FAULT, SAY SO IN THE FIRST LINE.** He is fine with that and not
fine with spin.

⚠️ **HE SWEARS WHEN SOMETHING LOOKS WRONG, AND THE COMPLAINT IS ALWAYS REAL.**

- **Walk the journey, do not check the page.** ⭐⭐ **Look at the result before reporting it done.**
- **Measure, then claim** — and if you could not measure it, say so.
- ⭐⭐ **AND CHECK THE VIEWPORT IN THE SAME BREATH AS THE NUMBER.**

---

## 16. BUDGET AND THE DOCUMENT SET

⭐ **This round spent 0 credits.** Every track, contrast figure and glyph metric was `ffmpeg`, PIL,
the browser's own canvas and plain Python; the film and the stills are his.

| File | What it is |
|---|---|
| **`HANDOVER.md`** | ⭐ The single current state. §D is the register, **D1–D130, D132–D353**. §2 the standing rules, **§2s SITE SPEED**, §2a the supplier list. ⚠️ **THERE IS NO D131 ROW.** ⚠️ Section numbers are referenced from code comments — **do not renumber** |
| **`Website Demo/index.html`** | ⭐⭐ The whole landing design. Search `THE SCROLL FILM`, `THE EDGE FADE`, `THE OPENING FRAME AS A SECOND HERO`, `THE ARROW`, `THE OPENING OVERLAY`, `cine-line`, `bandGrade`, `THE TABLET BAND` |
| ⭐⭐ **`.textanim-2026-08-24/removed-pin-d349-d351.txt`** | **THE PIN, PARKED WHOLE** — the tracked table, `heroCopy()`, the video-frame callback, why it went and how to restore it. ⛔ None of it was wrong; it inherited a 12fps picture |
| ⭐⭐ **`.textanim-2026-08-24/removed-wave-d348.txt`** | **THE SWEEPING WAVE, PARKED WHOLE** — a real candidate for the closing kitchen beat (§14 item 1) |
| **`assets/video/.src-2026-08-23/`** | ⭐⭐ His two current masters and two stills (`.gitignore`d) + `encode.sh` with the full method |
| **`assets/video/.plates-2026-08-23/`** | ⭐⭐ The overlay pipeline: `make_plates.py` writes the plates AND the posters |
| **`Website Demo/.textopts-2026-08-22/`** | ⭐ The eleven first-screen options he chose from |
| **`Docs/Overlay-for-Scroll-Animation-Guide.md`** | ⭐ **His own written build guide** for the stills |
| **`Website Demo/build_pages.py`** | ⭐⭐ Seven internal pages, `site.css`, `site.js`, `footer.css`, `nav.css`. ⚠️ **RUN IT FIRST** |
| **`Website Demo/make_upload.py`** | ⭐⭐⭐ Writes a clean `../upload/`. ⚠️ Dot-folders never ship; comments stripped on the way out |
| **`Website Demo/.htaccess`** | ⭐⭐ Cache rules, mp4/webm for a week. ⚠️ A dotfile |
| **`assets/footer.css` `assets/nav.css`** | ⛔ **GENERATED.** Never edit |
| **`services/service.css`** | ⭐⭐⭐ Dresses all 167 generated pages. ⛔ No footer rules |
| ⛔ **`trade/build_trade.py`** | ⛔⛔ **SUPERSEDED — DO NOT RUN** |
| ⛔ **`build_images.py` `patch_images.py`** | ⛔⛔ **ONE-SHOT, CANNOT RUN AGAIN** |
| `HANDOVER-2026-08-23-film-round-start-here.md` | ⭐ The START HERE this file replaces (D333–D347) |
| `HANDOVER-archive-to-2026-08-06.md` | ⚠️ **Every design the client rejected, in his words.** Read before redesigning anything |
