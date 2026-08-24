# START HERE — 24 August 2026, after THE DESKTOP TEXT ROUND (D354–D358a)

Read this, then `HANDOVER.md` **§D** (the register, newest first — this round is **D354–D358a**),
**§2** (the standing rules) and **§2s** (SITE SPEED). About twenty minutes, and enough to work safely.

> ⚠️ **This replaces the previous version of this same file**, now
> `HANDOVER-2026-08-24-text-animation-round-start-here.md` (D348–D353). Everything that still
> matters is carried below.

> ⭐⭐⭐ **THE FILM'S TEXT IS FINISHED ON DESKTOP. ALL FOUR SECTIONS NOW CARRY HIS OWN DESIGNS**,
> and §1 records exactly what each one does. ⭐⭐ **THE NEXT SCOPE IS THE TABLET AND THE PHONE**,
> in his words: *"we're going to, on the next chat, work on the tablet and mobile versions and make
> the best for that, because it's going to be different. But the text will be the same."*
> ⛔ **THE COPY IS FIXED AND IS NOT REOPENED (§3). THE COMPOSITION AND THE ANIMATION ARE PER BAND.**

---

## 0. ⛔⛔⛔ THE ONE THING TO TAKE FROM THIS ROUND

**⭐⭐⭐ EVERY FAULT THIS ROUND WAS A CLOCK. THREE DIFFERENT ANIMATIONS, THREE DIFFERENT ANSWERS,
AND THE ANSWER IS NEVER THE SAME TWICE.**

```
the slab reveal    D354   rides the PAINTED FILM FRAME (rVFC)      because nothing moves
the kitchen slide  D355   rides the SCROLL                          because the type moves
                   D357   moved to a WALL CLOCK on his instruction   -> lingered, and janked
                   D358   moved BACK to the scroll on his instruction
the ending         D356   rides a WALL CLOCK (a CSS transition)      because it is not in the film
```

⛔⛔ **THE RULE THAT COVERS ALL OF IT: MATCH THE CLOCK TO WHAT IS ACTUALLY MOVING.**

- **Type that MOVES must not ride the film.** The film is 12fps and a fast scrub presents about
  every sixth frame — invisible on a photograph, plainly visible on a 76px serif. That cost four
  builds at D349–D351 and is why the first screen and the kitchen beat run on the scroll.
- **A BOUNDARY that moves with the picture MUST ride the painted frame.** D354's clip is the slab's
  own edge; if it ran on the scroll it would detach from the edge under a scrub and put lit type on
  the stone. Nothing moves relative to anything, so there is nothing to judder. ⛔ `currentTime` is
  NOT the painted frame — `requestVideoFrameCallback`'s `mediaTime` is.
- **Anything OUTSIDE the film's timeline rides a wall clock.** The ending is a CSS transition
  triggered by a class, and always was.

⭐⭐⭐ **AND THE THING THAT COST THE MOST TIME: A WALL CLOCK INSIDE A SCRUBBED FILM IS A TRAP.**
He asked for one at D357 for a real reason (a scrubbed animation is only as smooth as the hand
driving it) and it produced two faults that scrubbing cannot have — **it lingered over the previous
scene on a fast back-scrub, because a 1.25s exit cannot outrun a reverse scroll**, and **it read as
jagged, because it ran a second rAF with a `getImageData` readback per frame against a video that
was decoding seeks.** D358 put it back. ⚠️ **Both flips were his call and both are logged. If he
asks for a wall clock again, it needs an opacity gate at the window edges and a throttled wash.**

⭐⭐ **THE SECOND LESSON, WHICH IS ABOUT THE GATE:** `node --check` passed on a file that threw a
`ReferenceError` on every frame, because an edit had deleted two `const` declarations and a missing
declaration is a RUNTIME error. **A clean syntax check is not a working page — read the console.**

---

## 1. ⭐⭐⭐ WHAT THE TEXT DOES RIGHT NOW, SECTION BY SECTION

⛔ **THIS IS THE SECTION HE ASKED FOR. Everything below is measured and live.**
⛔⛔ **EVERY DESKTOP BEHAVIOUR IS SCOPED `min-width:1121px`. The phone and the tablet still run the
PRE-ROUND animations — the "narrow" column is the starting point for the next round, not a bug.**

### ⭐ SECTION 1 — THE FIRST SCREEN · *"Your worktop starts here."*

| | desktop ≥1121 | tablet 721–1120 · phone ≤720 |
|---|---|---|
| element | `.cine-hero` `#cineHero` — a second hero | `.cine-line.cine-open` — *"It starts as a mountain."* |
| window | at rest from t=0, clear by **t=6.0** | **1.0 → 6.0**, `data-vpos="top"` |
| entrance | ⭐ none — it is already there when the page opens | fade in over 16% of the window |
| exit | ⭐⭐⭐ **SLIDES OFF LEFT ON THE SCROLL** | travel in Z + fade out over 26% |

**The desktop exit, the whole mechanism in four lines (D352–D353):**

```
the block      holds its approved position at rest and NEVER moves for the film
from t=0       it translates LEFT on the eased SCROLL value — 761px at 1440, its own
               right edge to the frame's left — on wipeEase(p) = 0.4p + 0.6p²
the fade       a mask NAILED TO THE LEFT GUTTER that never moves. The block crosses it
the chips      carry the identical offset, so the first screen leaves as ONE object
```

⭐⭐⭐ **THE MASK DOES NOT MOVE AND THE BLOCK MOVES THROUGH IT. THAT IS THE WHOLE DESIGN.** Client:
*"the fade is never visible in the center of the screen or in the center of the text or away from
the side… it gives the illusion that the side of the screen is wiping it away instead of an actual
animation."* A sweeping mask puts the fade in the MIDDLE of the frame, where you can watch it
happen. This is the opposite construction.

⭐⭐ **THE RAMP IS THE GUTTER, WHICH IS WHY IT IS FREE:**
`--edgeFade: calc(clamp(20px,7vw,132px) * 0.5)` — the copy's own inset, **halved** (the full width
read as *"a gradient fade"*). Written from the same expression the copy is inset by, so it ends
before the type begins at every desktop width and the two cannot drift apart.

⭐⭐ **THE SPEED IS A MEASUREMENT:** the far field travels 620 screen px over the six seconds
starting at **51 px/s**; this curve starts at **50.7 px/s** and finishes **1.23×** ahead of the
scene. ⛔ It must NOT keep pace for long — anything matching a 12fps film invites the eye to
compare the two and see the steps. ⚠️ It starts with real velocity, never an ease-in.

### ⭐ SECTION 2 — THE SLAB BEAT · *"The slab you choose is **unique.**"*

| | desktop ≥1121 | tablet 721–1120 | phone ≤720 |
|---|---|---|---|
| window | **10.3 → 24.5** | **21.0 → 25.3** | **16.2 → 24.0** |
| anchor | `data-vpos-wide="hero"` → `top:22vh`, left gutter | `top:13vh`, centred | `top:13vh`, centred |
| entrance | ⭐⭐⭐ **THE SLAB REVEALS IT** | fade in over 16% | fade in over 16% |
| exit | plain fade, **22.03 → 24.5** (2.47s) | Z travel + fade over 26% | Z travel + fade over 26% |

**⭐⭐⭐ THE REVEAL (D354) — the words never move and never fade in.** Client: *"the slab fills the
screen and then goes back at an angle revealing an open space… I would like the text to pretty much
already be there, and then it almost gets revealed as if the slab is revealing it… so the t and the
c of the word the and choose will obviously already be there, and then the h and the e… it all gets
revealed as if it's coming out from behind the slab. The animation just plays at that angle."*

```
the words      sit at their approved position at opacity 1 from t=10.3
the curtain    a clip-path whose boundary IS the slab's own left edge, tracked per film
               frame — REV_X (x at film y 490) and REV_S (the slope, -0.03 -> -0.38)
the clock      the PAINTED frame (rVFC), so the boundary and the stone step together
the reveal     t=11.25 (the T) -> t~15.1 (the full stop of "unique.") at 1440x900
```

⭐⭐ **THE TABLE IS THE MEASUREMENT:** frames **124–205** of the 1920 cut, threshold 40 on the void
side, least-squares line over 32 rows a frame — **the edge is straight to 2.2 film px**, which is
why two numbers a frame carry it exactly. `REV_PAD` 3 keeps type off the lit fringe. Strictly
monotone; the slab's backswing from f206 is outside the domain. ⚠️ **RE-TRACK IF THE FILM IS EVER
RE-CUT** — the probe is `.textanim-2026-08-24/track_edge.py`.
⭐ The clip comes **OFF** past f205 (or when the edge clears the box + 30px), so the element is
exactly its pre-round self for the exit. ⚠️ Wash pinned to **0** (measured void, and mid-reveal the
box straddles the lit slab). ⛔ The em's `drop-shadow` is off on this beat — a filter under an
animated mask is D339's arrow glitch by another door.

### ⭐ SECTION 3 — THE KITCHEN BEAT · *"The stone sets the tone of **the room.**"*

| | desktop ≥1121 | tablet + phone ≤1120 |
|---|---|---|
| window | **27.0 → 38.5** | **28.5 → 37.5** (pinned at D358a) |
| anchor | `data-vpos-wide="high"` → `top:16vh`, left gutter | `top:13vh`, centred |
| entrance | ⭐⭐⭐ **SLIDES IN FROM THE LEFT AND SETS** | fade in over 16% |
| exit | ⭐⭐ the same slide, time-reversed | Z travel + fade out over 26% |

**⭐⭐⭐ THE SLIDE (D355 → D358a), scroll-tied.** Client: *"I wanted to animate in — no fade or
anything, just coming in from the left side and setting… And then for that text to go away, I
wanted it to go back out to the left in reverse. The same way that it came, just reverse that."*

```
27.0 -> 30.2   in    -KW.x1 * (1-q)^2   full speed on the first pixel, decelerating to
                                        a dead stop at rest — that stop IS the "set"
30.2 -> 35.3   hold   it does not move at all — 5.1s
35.3 -> 38.5   out   -KW.x1 * q^2       the identical curve, time-reversed
```

⭐⭐ **BOTH EDGES ARE MEASURED, NOT CHOSEN (D358a):** the kitchen shot cuts in at **t=25.5** (the
text band's mean jumps 0 → 11) and is established ground from **~26.8** (mean ~32, p97 65–67), so
27.0 gives it a beat to settle; the corners round at **39.8** and the hero's ink rises at **41.1**,
so a fade finishing at 38.5 leaves 1.3s of empty closing shot before the frame becomes the hero.
⭐ **THE SLIDE IS THE SAFE AXIS (D345's fences):** the vertical position never changes, so the
island (14–21px below) and the bar (65px above) keep their clearances for the beat's whole life,
and a sliding block sits LEFT of rest, so it only ever moves further from the pendants at 785–798.
⛔ **AN OPACITY GATE AT THE WINDOW EDGES IS WHAT MAKES THE BACK-SCROLL CLEAN** — outside the window
the words do not exist, whatever position the slide would hold. That is D358's fix; do not remove it.

### ⭐ SECTION 4 — THE ENDING · *"Surfaces worth building around"*

| | desktop ≥1121 | tablet + phone ≤1120 (and the no-film path) |
|---|---|---|
| what moves | ⭐⭐⭐ **the WHOLE block, as one object** | each element separately, staggered |
| motion | scale **0.84 → exactly 1.00** + fade | rise 26px + fade |
| timing | **1.05s**, `--ease`, 180ms delay | **1.15s** each, `--hd` 180/340/560/720/880 |
| clock | a CSS transition — never was scroll-tied | the same |

**⭐⭐⭐ IT COMES TOWARDS YOU (D356 → D357).** Client: *"fades in from the center of the screen and
then becomes bigger as it settles, so basically as if it is coming closer"*, then, correcting the
first build: *"I don't just mean the surfaces worth building around text. I mean all of that, that
whole section — from the buttons to all the little things and the subtext and everything."*

⭐⭐⭐ **THE SECOND MESSAGE MOVED THE TRANSFORM UP A LEVEL, FROM `.hero-title` TO `.hero-inner`, AND
THAT IS THE WHOLE DESIGN.** Scaling each element would be four zooms at once, and **the GAPS between
them would not scale** — the composition would visibly stretch as it arrived. One transform on the
block keeps every internal relationship exactly proportional, which is the only reading of "coming
closer" that is physically true. ⛔ **So the per-element stagger stands down in this scope** — it is
not deleted, and still runs on both narrow bands and whenever the film does not.
⭐ **A `scale()` on purpose, which is the OPPOSITE of D325b's ruling** — there a scale was rejected
for reading like a zoom; **a zoom is exactly what he asked for here**, and `.hero-inner` carries no
perspective to add one to. ⛔ It lands on **exactly 1.00** and the transform is **gone** at rest
(not `scale(1)`), so the frozen composition is untouched and `.hero-inner` never becomes a
containing block for the rest of the page's life.
⚠️ Triggered by `ink()` flipping `.loaded` at `INK_AT` 0.93 (t=41.1) — a switch, not a scrub.

---

## 2. ⭐⭐⭐ THE NEXT ROUND — THE TABLET AND THE PHONE

His instruction, verbatim: *"we're going to, on the next chat, work on the tablet and mobile
versions and make the best for that, because it's going to be different. But the text will be the
same."* ⭐ This also closes the placement question deferred since **D325** (*"we will talk about
mobile and tablet text placement after"*).

⛔⛔ **THE COPY IS FIXED (§3). What is open is PLACEMENT and ANIMATION, per band.**

### ⚠️ What is already known, so it is not re-discovered

1. ⛔⛔⛔ **THE THREE BANDS ARE THREE DIFFERENT FILMS, NOT THREE CROPS.** 1920 (16:9), 864 (a 4:5
   crop) and 608 (a 9:16 VERTICAL cut, D319). **A composition measured on one says nothing about
   the others.** Every beat window in §1 was measured per band for exactly this reason.
2. ⛔⛔ **THE FIRST SCREEN'S EXIT DOES NOT PORT AS-IS.** Its speed is matched to the far field's
   own travel in the 1920 cut (51 px/s). **That has to be re-measured on each band's own film**
   before the curve means anything.
3. ⛔⛔ **THE SLAB REVEAL NEEDS A NEW TRACK PER BAND.** `REV_X`/`REV_S` are film pixels of the
   **1920** cut. The slab's edge geometry is different on a 4:5 crop and completely different on
   the vertical cut. ⭐ `.textanim-2026-08-24/track_edge.py` does the work — extract that band's
   frames, run it, check the max residual (it must stay ≤ ~4 film px for a straight-line clip to
   be honest), and pick the domain where X is strictly monotone.
4. ⭐ **THE KITCHEN SLIDE PORTS, BUT THE DISTANCE DOES NOT.** `KW.x1` is the box's right edge; on
   the narrow bands the line is **centred and full-width**, so a slide from the left is a different
   distance and arguably a different idea. His words were *"coming in from the left side"* about a
   left-anchored desktop block.
5. ⭐ **THE ENDING PORTS IN ONE RULE** — the `min-width:1121px` block moves or widens. ⚠️ Check the
   scale value by eye at each band: 0.84 on a 92px headline is not 0.84 on a 38px one.
6. ⚠️ **MEASURED AND NOT FIXED, BECAUSE IT WAS OUT OF SCOPE: on the phone the slab beat already
   flies off-frame while still at 0.68 opacity, and always has.** That is a real fault waiting in
   this round.
7. ⭐ **THE NARROW BANDS' CURRENT PLACEMENT** is `left:0;right:0;padding:0 clamp(20px,7vw,54px);
   text-align:center`, size `clamp(27px,6.6vw,44px)`, beats at `top:13vh`, subtitle 16px centred.
   The subtitle rule carries a note saying placement is *"still his open question"* — this is that
   question.
8. ⛔ **THE TABLET-ONLY BLOCK IS LAST IN THE STYLESHEET** (search `THE TABLET BAND`) and must stay
   last. ⭐ **Widen a phone rule's own query to reach the tablet, never copy it.**

---

## 3. ⭐⭐⭐ THE FILM'S COPY — FIXED, AND THE SAME AT EVERY BAND

```
FIRST SCREEN (desktop, at rest)
    Your worktop STARTS HERE.
    Follow the slab from the finest mountains of Europe and Asia,
    out of the quarry and into your kitchen.
    SCROLL TO BEGIN  ↓
    [Google 5.0]  [10 year guarantee]              bottom left, leaving with the copy

  (phone + tablet opening title)   It starts as a mountain.

SLAB BEAT     The slab you choose is UNIQUE.
              Measured, cut and finished for your home, and built to last for decades.

KITCHEN BEAT  The stone sets the tone of THE ROOM.
              Once you choose your stone, the rest follows.

ENDING        Surfaces worth BUILDING AROUND
              Chosen from the slab you approve, fitted by us across England and the British Isles.
```

⛔⛔⛔ **FOUR SEPARATE COPY FAULTS WERE CAUGHT BY HIM, NOT BY ME, AND EVERY ONE WAS A CLAIM THE
BUSINESS CANNOT MAKE. Check any new line against all four:**

| the line said | why it was false |
|---|---|
| *"through the quarry"* | the film **opens at** the quarry face and never travels through one |
| *"cut for your kitchen"* | fireplaces, vanity tops and dining tables are **all live pages** |
| *"…are veined differently"* | `absolute-black-extra` has **no visible grain**; quartz is engineered; porcelain is printed |
| *"one of a kind patterns in stone"* | a plural against a mass noun — **and a third restatement of the title** |

⭐ **THE SUBTITLE'S JOB IS TO SAY WHAT THE TITLE DOES NOT.** ⚠️ Every superseded line is parked in
the markup **labelled with why it is wrong**. ⚠️ *"decades"* is defensible and *"for life"* is not.
⚠️ *"unique"*, never *"completely unique"* — his own second option.

---

## 4. ⭐⭐⭐ SITE SPEED IS A STANDING RULE — HIS OWN WORDS

Unprompted, 18 Aug: *"just make sure you always keep site speed in mind… **site speed is key**."*
`HANDOVER.md` **§2s**, and it is §2 material.

1. ⛔⛔ **ONE FILM PER BAND AND ONLY ONE IS EVER FETCHED.** Three cuts (**22.8 MB** together), a
   visitor downloads exactly one — **1920: 13.28 MB · 864: 5.62 MB · 608: 3.87 MB**. An in-place
   `<script>` beside the `<video>` sets `src` and `poster` **during parse**. ⛔ **A `display:none`
   VIDEO STILL DOWNLOADS ITS `src` AND `poster`.** **Re-verify zero requests for the other two
   after ANY change to that element or that script** — this is the single most expensive thing on
   the site to get wrong, and the next round touches all three bands.
2. ⭐ **`preload="none"` in the markup**, flipped to `auto` by the scrub once the band is known.
3. ⭐⭐ **FIRST PAINT COSTS THE POSTER, NOT THE FILM** — **121 KB** desktop, 81 tablet, 54 phone.
   ⭐ The poster, the overlay plate and the film's own first frame are **one picture**, so nothing
   swaps at any point. ⛔ Do not let the posters grow.
4. ⭐⭐ **COMMENTS COME OFF ON THE WAY OUT (D315).** `make_upload.py` strips every `.html`/`.css`/
   `.js` into `upload/`. ⛔ Never strip comments from the SOURCE — they are the design record.
5. ⭐ **NOTHING UNREFERENCED SHIPS.** Dot-folders never ship. ⛔ When you remove an element, move
   its assets into a dot-folder **in the same edit**.

⚠️ **`dev-server.js` COMPRESSES AND THE HOST MAY NOT.** ⚠️ **A MEDIA ELEMENT'S OWN FETCH OFTEN DOES
NOT APPEAR IN `resource` TIMING.** Prove "the wrong film did not load" by the ABSENCE of the other
bands' URLs plus `video.getAttribute('src')`.

---

## 5. ⛔ THREE DEVICE BANDS

```
   ≤ 720px          721 – 1120px          ≥ 1121px
   the phone   ·   the tablet        ·   the desktop
```
⛔ **THE TABLET-ONLY BLOCK IS STILL LAST IN THE STYLESHEET** (search `THE TABLET BAND`).
⭐ **Widen a phone rule's own query to reach the tablet, never copy it.**
⚠️ ⛔⛔ **AND SOURCE ORDER DECIDES BETWEEN EQUAL SPECIFICITY** — three rules this round rely on it.

⛔⛔⛔ **AND THE PER-BAND CASCADE IS THE ONE MENTAL MODEL FOR BOTH THE FILM AND THE BEATS:
`-phone` → `-narrow` → the bare attribute.** A band that names nothing inherits the one below it.
⚠️ **D358a's LESSON: A BEAT WITH NO `-narrow` PAIR HAS NO DESKTOP-ONLY TIMING** — its base attribute
IS every band's number, so a desktop retime silently reaches the phone and the tablet. It happened,
for about an hour. **Before retiming any beat, check whether it carries a `-narrow` pair; if it does
not, add one pinning the current values in the same edit.**

---

## 6. ⛔ THE GATES — RUN THESE

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

⛔⛔⛔ **NEW (D357) — `node --check` IS A SYNTAX GATE, NOT A RUNTIME ONE.** An edit that deleted two
`const` declarations passed it cleanly and threw `ReferenceError` on every frame in the browser.
**Read the console after ANY JS edit** — arm `window.addEventListener('error',…)` and drive the
page, because the pane's console buffer also keeps **STALE errors from earlier loads** and will show
you a bug you have already fixed.

⛔⛔ **A BRACE INSIDE A COMMENT COUNTS.** A comment containing `html{overflow-x:clip}` pushed the CSS
count up by one while the delta stayed 0. **Write CSS in comments without braces**, and compare the
COUNT, not just the delta.

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

⭐ **EVERY ROW RE-VERIFIED AT THE END OF THIS ROUND.** ⚠️ The element count is only valid on a fresh
load. ⚠️ Filter broken images on `i.src && i.complete && i.naturalWidth===0`.

---

## 7. ⚠️ THE ENVIRONMENT TRAPS — ALL LIVE

- ⛔⛔⛔ **`currentTime` IS NOT THE FRAME ON THE SCREEN.** Assigning it moves it at once; the picture
  waits for the decode. Measured under a live scrub: **1 to 3 frames of lead, 23px on screen**.
  ⭐ `video.requestVideoFrameCallback` → `metadata.mediaTime` is the only ground truth, and it also
  reveals that **a fast scrub presents about every SIXTH frame**.
- ⛔⛔⛔ **THE FILM NEEDS ~8s TO BUFFER AFTER A NAVIGATION, AND THE EASED CHASE NEEDS ~2.5–3.5s TO
  SETTLE.** ⭐⭐ **POLL `currentTime` UNTIL IT STOPS CHANGING BEFORE TRUSTING ANY READING** — this
  round produced a completely wrong measurement (film time 3.4 while the scroll said 29) by reading
  too early. A settle-poll is four lines and it is now the standard opening of every probe.
- ⛔⛔⛔ **MEASURE TEXT AFTER THE FONT LANDS.** Cinzel is **135px wider** across the headline than the
  fallback. A measurement taken before `document.fonts.ready` cost a whole re-track at D349.
- ⛔⛔ **THE FRAME AVERAGE OF THIS FILM BELONGS TO NOTHING IN IT** — the near wall expands RIGHT
  while the far field swings LEFT. Measure the region you mean.
- ⛔⛔ **A CSS `mask`/canvas DRAW MUST FIT ITS CANVAS.** A 48×8 read from a 48×4 canvas returns rows
  of transparent black and quietly poisons the average.
- ⛔⛔ **`git check-ignore` BEFORE COMMITTING ANY NEW DOT-FOLDER OF HIS ORIGINALS.**
- ⛔⛔⛔ **A SCROLL ANIMATION IS DEAD IN A BACKGROUND TAB**, and **the pane throttles rAF even when
  fronted**. ⚠️ **A BACKGROUNDED PANE TAB ALSO SCREENSHOTS BLACK** — front it (`tabs_select`) before
  shooting, which is what finally produced this round's real captures.
- ⛔⛔ **THE PANE'S SCREENSHOT GOES BLACK after `resize_window` + reload.** Fresh tab, navigate,
  resize, shoot **without** reloading. ⭐ **AND `backdrop-filter` ANYWHERE ON THE PAGE CAN BLACK THE
  CAPTURE** — the chips and the nav carry it; users see the page fine.
- ⭐⭐ **TO SEE A MID-ANIMATION FRAME, FREEZE IT DELIBERATELY**: write the measured values inline
  (`transition:none` + the transform + the opacity), screenshot, then remove them. That is how both
  the reveal and the ending were verified by eye.
- ⚠️ **A CSS TRANSITION WITH A DELAY CANNOT BE SAMPLED BY TOGGLING A CLASS AND READING IMMEDIATELY**
  — the computed value stays at the start until the delay elapses, which reads as "it snapped".
  Remove the class, **wait out the reverse**, then re-add and sample.
- ⛔⛔ **TWO TABS DRIFT TO DIFFERENT VIEWPORTS.** Read `innerWidth`/`innerHeight` in the SAME probe.
- ⚠️ **A SCROLL SET IMMEDIATELY AFTER A NAVIGATION IS UNDONE** by scroll restoration. Set it, then
  set it again a moment later.
- ⛔⛔ **A NARROW LOAD LOOKS EXACTLY LIKE A BROKEN PAGE.** `--stoneRaster:on` below 720px swaps the
  live marble SVG for a bitmap: `feTurbulence` reads 0 and elements drop ~570. **The next round is
  narrow — expect this and do not chase it.**
- ⛔⛔ **AN INLINE STYLE OUTRANKS A CLASS RULE** — hand the property back (`style.removeProperty`),
  and **do not write a property at a band that has no rule to answer it**.
- ⛔⛔ **A CSS EDIT DOES NOT SHOW UNTIL THE BUILDERS RE-RUN** (`site.css?v=<hash>`). ⚠️ `index.html`'s
  own inline CSS is served directly and needs no builder.
- ⭐ **`scroll-behavior:smooth` eats programmatic scrolls** — use `behavior:'instant'`.
- ⛔ **`computer` LIMITS: `wait` ≤ 10s, `scroll_amount` ≤ 10.** Chain them.
- (Carried) `javascript_tool` runs before async work settles — kick the work, wait, read it back in
  a second call · **no numpy, PIL only** · **no libwebp in this ffmpeg; the browser canvas is the
  only SVG rasteriser** · valid stone presets: calacatta, carrara, crema, emperador, eternal, fumo,
  goldveil, mist, nerogold, statuario.

---

## 8. ⭐ THE LINK, AND THE SERVER

```bash
cd "Website Demo" && nohup caffeinate -ims node dev-server.js > /tmp/topcat-server.log 2>&1 &
```

⚠️⚠️ **THE IP HAS MOVED FOUR TIMES** (currently **192.168.10.246**).
**Re-check with `ipconfig getifaddr en0` at the start of every reply that hands him a link.** A dead
link presents as *"most of the images aren't loading"*.
⚠️ **The server also stops overnight.** ⭐ **DETACHED ON PURPOSE — do not `preview_stop` it.**
⭐ **USE `http://localhost:5501` IN THE PREVIEW PANE**, on his instruction.

---

## 9. ⭐ WHERE THINGS STAND

| Page | State |
|---|---|
| **`/`** | opens on his film at every band, the overlay cutting to it at f0, **a second hero on the first screen**, **three story beats**, skip control, 182vh of dead scroll on the finished hero. ⭐ **All four text sections carry his own designs on DESKTOP (§1); the phone and the tablet still run the pre-round animations** |
| **`/about/` + six internal** | the `.page-head` family; directors visible and bright at all bands |
| **`/services/*.html`** | nine leaves, each on its OWN photograph; burger nav ≤1120; quote card ≥1121 |
| **`/stones/`** | 132 pages + collection + compare; white ledes; **no quote card, deliberately** |
| **`/materials/` `/guides/` `/worktops/` `/sitemap.html`** | the 26-page SEO layer; 22 carry the quote card |
| **`/trade/`** | eight sections; CTA carries WhatsApp |
| **all 176 pages** | one footer, one mobile nav, og:image + twitter:card, favicon, hours **Mon–Sun 7am–9pm**, no code comments in view-source |

⚠️ **SHARED PHOTOGRAPHS NOT TO DELETE**: `kitchen-day.jpg`, `hero-night-*`, `og-cover.jpg`,
`team/fitting.jpg`, and everything inside the dot-folders under `assets/video/`.

---

## 10. ⛔ RULES THAT MUST NOT BE BROKEN

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
12. ⛔ **One device at a time unless he says otherwise.** ⭐ **He has now said otherwise: the tablet
    and the phone are the open scope, and the DESKTOP is frozen again.**
13. ⭐⭐ **THIS IS A DESIGN BUILD. NEVER RAISE THE MISSING FORM BACKEND AS A BLOCKER.**
14. ⛔⛔ **2 CREDITS MAXIMUM PER GENERATED IMAGE.** ⭐ **This round spent nothing.**
15. ⭐⭐⭐ **SITE SPEED IS KEY** — his own words.

---

## 11. OPEN — DO THESE NEXT

### ⭐⭐⭐ The live scope

1. ⭐⭐⭐ **THE TABLET AND THE PHONE — PLACEMENT AND ANIMATION FOR ALL FOUR SECTIONS.** §2 carries
   everything already known. ⛔ **The copy does not change.**

### ⭐⭐⭐ The ones that are costing money

2. ⭐⭐⭐ **HOW DO FILES ACTUALLY REACH `thadeusg3.sg-host.com`?** Asked twelve times.
   **Everything from D291 onward is still NOT live — including his video, every word of the film's
   copy, and this entire round.**
3. ⭐⭐⭐ **WHOSE ARGENTO DOES HE SELL?** His reference is a dense flecked grey-white; the site shows
   the supplier's veined marble-look. ⛔ Do not paste the Google image.
4. ⭐⭐ **THE STONE PHOTOGRAPHY AUDIT** — 24 of 132 verified; **92 Nile Stone tiles unverified**.
5. ⭐ **Pick a production host**; brotli; check the `.htaccess` cache rules survive it.
   ⚠️ **22.8 MB of film makes this urgent.**

### ⭐⭐ His call

6. ⭐⭐ **THE HEADLINE WORDING** — he is still taking the client's input. Three alternates parked.
7. ⭐ **THE HERO PLATE FOR THE ENDING.** Withdrawn at D328 because the re-cut moved the camera.
   **It needs a new still from him**, or it stays off.
8. ⭐⭐ **DOES THE FILM WANT SOUND?** The masters carry PCM; the site drops it. Never discussed.
9. ⭐ **THE 19 DRONE VIDEOS** (Hornchurch, Rickmansworth) — worth re-asking now the site carries film.
10. ⚠️ **THE GROWTH ON THE FIRST SCREEN IS OUT.** D350 added a 1.00→1.20 scale on his *"it should
    get bigger"*; D352 removed it with the pin. **He has not been asked whether he wants it back on
    the sliding block.** It is one line. ⚠️ Note the ENDING now grows (D356), so the answer may be
    that the first screen should not.
11. ⭐⭐ **THE PHONE'S BAR** — the skeleton crosses his 11-Aug *"already formed from the top"* ruling.
    **One word puts it back: delete the two `header.bar.preform::after` lines.** ⭐ **This is a
    PHONE item and the phone is now in scope.**
12. ⭐⭐ **A QUOTE CARD FOR THE PHONE AND TABLET.** D300 is desktop-only because he said so.
    ⭐ **Also now in scope, if he wants it.**
13. ⭐⭐ **THE SITEMAP LINK'S GOLD STYLING** — `seo.css` has the rule, no footer has the hook.
14. ⭐⭐ **Trade terms** — payment, minimum order, lead times, a dedicated contact. **His stated
    first priority.**
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
25. ⚠️ **The stale branch `tablet-round-d197-d200`** — deletable once item 2 is answered.

**Still waiting on the client:** whether Quartzite becomes a fourth range, 20mm vs 30mm pricing,
brackets for vanity tops / fireplaces / tables, and the £3k vs £3,850 three-slab discrepancy.

**CLOSED this round:** the slab beat's animation (the reveal), the kitchen beat's animation (the
slide, through a clock reversal and three retimes), and the ending's animation (the whole block
coming forward) — **all three to his own designs, and the desktop film text is finished.**

---

## 12. ⭐ HOW THIS CLIENT WORKS

⛔⛔⛔ **HIS COMPLAINT NAMES THE SYMPTOM CORRECTLY EVERY TIME. IF YOU "FIX" IT AND HE REPEATS
HIMSELF, YOU CHANGED THE WRONG VARIABLE — DO NOT CHANGE THE SAME ONE HARDER.**

⭐⭐⭐ **AND WHEN HE DESCRIBES A FEELING, THE MECHANISM BEHIND IT IS USUALLY EXACTLY WHAT HE SAYS.**
*"It comes in and goes out very weirdly"* was a scrubbed animation inheriting the hand driving it.
*"It gets stuck on the previous screen"* was a wall-clock exit unable to outrun a reverse scroll.
*"It feels a bit jagged"* was a second rAF plus a per-frame `getImageData` against a decoding video.
**Three vague-sounding sentences, three exact diagnoses. Take the words literally and go measure.**

⭐⭐ **HE REVERSES HIMSELF FREELY AND FAST, AND THAT IS FINE.** The kitchen beat's clock flipped
twice in one day and its timing three times. **The way to make that cheap is to park everything and
delete nothing**, labelled with why it went. ⚠️ **And when a reversal restores an older mechanism,
say so plainly rather than presenting it as new.**

⭐⭐ **HE SENDS CORRECTIONS MID-TURN.** *"I don't just mean the text… I mean that whole section"*
arrived while the first version was still being verified and **inverted the construction**. Finish
the one you are on, read the new one before shipping, then take them in his order.

⭐⭐ **HIS SCREENSHOTS MARK MOMENTS, NOT LAYOUTS.** When he sends a frame, work out whether he is
pointing at a STATE or at a TIME. He is usually pointing at a time.

⛔⛔ **DO NOT ARGUE YOURSELF OUT OF SOMETHING HE ASKED FOR, AND DO NOT HAND HIM THE DILEMMA.**
**A real constraint is a problem to solve, not a question to return.** ⭐ When his ask and the frame
genuinely conflict, **size the thing to the frame and tell him the number**.

⛔⛔ **DO NOT ASK HIS PERMISSION. Commit, push, report.**

⭐⭐ **WHEN YOUR OWN WORK CAUSED THE FAULT, SAY SO IN THE FIRST LINE.** He is fine with that and not
fine with spin. **Two of this round's faults were mine — a deleted declaration and a rule-15 leak —
and both were reported before anything else.**

⚠️ **HE SWEARS WHEN SOMETHING LOOKS WRONG, AND THE COMPLAINT IS ALWAYS REAL.**

- **Walk the journey, do not check the page.** ⭐⭐ **Look at the result before reporting it done.**
- **Measure, then claim** — and if you could not measure it, say so.
- ⭐⭐ **AND CHECK THE VIEWPORT IN THE SAME BREATH AS THE NUMBER.**

---

## 13. BUDGET AND THE DOCUMENT SET

⭐ **This round spent 0 credits.** Every track, contrast figure and glyph metric was `ffmpeg`, PIL,
the browser's own canvas and plain Python; the film and the stills are his.

| File | What it is |
|---|---|
| **`HANDOVER.md`** | ⭐ The single current state. §D is the register, **D1–D130, D132–D358a**. §2 the standing rules, **§2s SITE SPEED**, §2a the supplier list. ⚠️ **THERE IS NO D131 ROW.** ⚠️ Section numbers are referenced from code comments — **do not renumber** |
| **`Website Demo/index.html`** | ⭐⭐ The whole landing design. Search `THE SCROLL FILM`, `THE EDGE FADE`, `THE SLAB REVEALS ITS OWN CAPTION`, `THE KITCHEN BEAT ARRIVES BY THE SIDE`, `THE ENDING COMES TOWARDS YOU`, `THE OPENING FRAME AS A SECOND HERO`, `cine-line`, `bandGrade`, `THE TABLET BAND` |
| ⭐⭐ **`.textanim-2026-08-24/track_edge.py`** | **THE SLAB EDGE TRACKER** — rebuilds `REV_X`/`REV_S`. ⭐ **The next round needs this per band** |
| ⭐⭐ **`.textanim-2026-08-24/removed-pin-d349-d351.txt`** | **THE PIN, PARKED WHOLE.** ⛔ None of it was wrong; it inherited a 12fps picture |
| ⭐⭐ **`.textanim-2026-08-24/removed-wave-d348.txt`** | **THE SWEEPING WAVE, PARKED WHOLE** |
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
| `HANDOVER-2026-08-24-text-animation-round-start-here.md` | ⭐ The START HERE this file replaces (D348–D353) |
| `HANDOVER-archive-to-2026-08-06.md` | ⚠️ **Every design the client rejected, in his words.** Read before redesigning anything |

### ⭐ THIS ROUND'S COMMITS, IN ORDER

```
5e3bbfe  D354    the slab reveals its own caption
0d59316  D355    the kitchen beat arrives by the side it will leave by
0943eec  D355a   the kitchen text comes in slower
c2f0a82  D355b   the exit matches the entry  ·  D356  the ending comes towards you, as one object
3cbf573  D357    the scroll says when, the animation owns how   (⛔ reversed by D358)
dd6d8ff  D358    the kitchen slide is back on the scroll, earlier
10ee3af  D358a   the kitchen beat stays longer, and a rule-15 leak is pinned
```
