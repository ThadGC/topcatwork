# START HERE — 24 August 2026, after THE PHONE AND TABLET ROUNDS (D359–D370)

Read this, then `HANDOVER.md` **§D** (the register, newest first — this round is **D359–D370**),
**§2** (the standing rules) and **§2s** (SITE SPEED). About twenty minutes, and enough to work safely.

> ⚠️ **This replaces the previous version of this same file**, now
> `HANDOVER-2026-08-24-desktop-text-round-start-here.md` (D354–D358a). Everything that still
> matters is carried below.

> ⭐⭐⭐ **THE FILM'S TEXT IS NOW FINISHED ON ALL THREE BANDS.** The desktop closed at D358a, the
> **phone** at D359–D367 (*"This is perfect. Whatever you have now is working perfectly"*) and the
> **tablet** at D368–D370. §1 records exactly what every section does at every band.
> ⛔ **THE COPY IS FIXED AND IS NOT REOPENED (§3). THE COMPOSITION AND THE ANIMATION ARE PER BAND.**
> ⭐ **HE HAS NOT YET SEEN THE FINAL TABLET PASS (D370) OR SIGNED THE TABLET OFF** — that is the
> first thing to ask.

---

## 0. ⛔⛔⛔ THE ONE THING TO TAKE FROM THIS ROUND

**⭐⭐⭐ FOUR FAULTS THIS ROUND WERE MINE, AND NOT ONE OF THEM WAS A SYNTAX ERROR, A BROKEN LAYOUT
OR ANYTHING A GATE COULD SEE. THEY WERE ALL SCOPE OR SAMPLING FAULTS.**

```
the dead arrow      @keyframes inside a non-matching @media NEVER REGISTER, so the phone's
                    cue stood frozen for a whole build.  HE caught it.
the strobing wash   a shade driven by a LIVE video sample flashed under the scrub, twice,
                    and ended in a full revert on his order.  HE caught it, twice.
the silent ending   `#hero .hero-sub` beats `.hero-sub` however late the class is written —
                    half of one round's changes simply did not apply.  Re-measuring caught it.
the leaking size    a rule written for ONE beat sat on a shared selector and changed its
                    neighbour, pushing that beat's line into the stone.  Re-measuring caught it.
```

⛔⛔ **THE RULE THAT COVERS ALL FOUR: AFTER YOU CHANGE SOMETHING, MEASURE THE THING YOU CHANGED,
AT THE BAND YOU CHANGED IT, AND CHECK THE NEIGHBOUR YOU DID NOT MEAN TO TOUCH.** A screenshot
proves the frame; only a measurement proves the rule actually landed and landed alone.

⭐⭐⭐ **AND THE SECOND LESSON, WHICH IS THE MOST EXPENSIVE ONE HERE: NOTHING THAT MUST BE STEADY
MAY READ THE FILM LIVE.** `drawImage` **clips** a source rectangle that reaches outside the video
and paints only part of the sampling grid — the rest keeps the PREVIOUS draw's pixels. Any moving
or partly-off-frame box therefore samples live-and-stale together and its statistic oscillates per
frame. That is a strobe on a scrubbed film, and it is why the phone's kitchen wash was reverted to
its stable radial (D367). ⭐ **THE AGREED REWORK, WHEN HE REOPENS IT: BAKE THE WASH FROM FILM TIME**
— sample the seated box OFFLINE per half-second, ship a ~20-entry table, drive the strength from
`t` alone. `clearRect` before every sample draw is already in (D366) and protects everything else.

⭐⭐ **AND A THIRD, WORTH REAL MONEY IN TIME: MOVING A TEXT BLOCK RE-WRAPS ITS LINES.** Lifting the
tablet's slab beat to clear the marble made its last line end further right — and the slab's edge
is a DIAGONAL that rides higher to the right, so the first lift walked straight back into the
stone. **Re-measure the ink after every move; do not assume a lift is a pure translation.**

---

## 1. ⭐⭐⭐ WHAT THE TEXT DOES RIGHT NOW, SECTION BY SECTION, AT EVERY BAND

⛔ **EVERY NUMBER BELOW IS MEASURED AND LIVE.** Desktop is `min-width:1121px` and FROZEN; the phone
is `≤720`; the tablet is `721–1120` and its own rules are LAST in the stylesheet.

### ⭐ SECTION 1 — THE FIRST SCREEN · *"Your worktop starts here."*

| | desktop ≥1121 | tablet 721–1120 | phone ≤720 |
|---|---|---|---|
| element | `.cine-hero` (a second hero) | the same block, re-dressed | the same block, re-dressed |
| composition | left-hung at the gutter, `top:22vh` | ⭐ **CENTRED**, padding `clamp(40px,8vw,120px)` | left-hung at the gutter, `top:22vh` |
| title | `clamp(38px,5vw,76px)` | `clamp(54px,7.6vw,76px)` | `clamp(40px,11vw,54px)` |
| subtitle | 17px / 470px | 19px / 52ch | 17px / 30ch |
| the cue | word 14px, arrow 32×96 on the block's left line | word 15px, **arrow 1.25× (40×120)**, centred | word 13px, arrow 32×96 on the S's line |
| ground | `.cine-edge` corner + left ramp | ⭐ the narrow bands' own `.cine-edge`: top scrim to zero by 78% + a soft left pool | the same |
| exit | **slides off left on the scroll** (mask nailed to the gutter) | **travels in Z past the viewer**, 0→380 on p², window **4.8s**, fade last 26% | the same |

⭐⭐⭐ **THE NARROW BANDS' GRADE IS THE DESKTOP'S MECHANISM, NOT A NEW ONE** — `.cine-edge`,
frame-anchored, riding `--cineEdge` = the copy's own alpha, so the picture is unobstructed the
moment the words go. Measured under it: the title's rows read p97 ≈ **57** where they read **214**
bare (phone f0) and 209–221 (tablet f0) — the same ground class, which is why one description
serves both. ⛔ The ellipse wash that preceded it is GONE, not retuned: it sat ON the marble and
was his *"the gradient and shadow is being used is completely wrong."*

⭐⭐ **THE ARROW'S LIGHT LIVES INSIDE THE STROKE AND NOWHERE ELSE (D365c).** A ~9px pure-white
plateau (42–54%) with gold shoulders, inside the mask, on a SOLID gold base. ⛔ An unmasked bloom
was tried and rejected outright — *"Why is the glare outside of the arrow?… it starts from the
line. Doesn't leave the line."* His reference is the nav hairline's own flash (D33).
⚠️ **The arrow's position has been left-line → mid-line → under-the-R → left-line in one day.**
All four are logged; the current answer is the left line (the box's left edge IS the tip, D337).

### ⭐ SECTION 2 — THE SLAB BEAT · *"The slab you choose is **unique.**"*

| | desktop ≥1121 | tablet 721–1120 | phone ≤720 |
|---|---|---|---|
| window | **10.3 → 24.5** | **13.0 → 24.5** | **14.5 → 24.0** |
| anchor | `top:22vh`, left gutter | `top:15vh`, left gutter | `top:14.5vh`, centred |
| type | `clamp(38px,5vw,76px)` 400 | `clamp(38px,5.6vw,54px)` **600** | `clamp(29px,8.7vw,44px)` **600** |
| entrance | ⭐⭐⭐ **THE SLAB REVEALS IT** | ⭐⭐⭐ **the same, its own table** | ⭐⭐⭐ **the same, TWO edges** |
| exit | plain fade, 2.47s | ⭐ **recedes** 1.00→0.84 on q², 2.47s | ⭐ **recedes** 1.00→0.84 on q², 2.03s |

⭐⭐⭐ **THE REVEAL RUNS AT EVERY BAND NOW, EACH AGAINST ITS OWN FILM AND ITS OWN TRACK, ALL ON THE
PAINTED FRAME (rVFC).**

```
desktop  REV_X / REV_S     f124–205 of the 1920 cut, X at film y 490 + slope   (D354)
tablet   TREV_X / TREV_S   f157–205 of the 864 cut,  X at film y 360 + slope   (D368)
phone    PREV_X/SX/Y/SY    f170–201 of the 608 cut,  TWO edges, meeting at the
                           slab's own corner — a six-point polygon             (D360)
```

⭐⭐ **THE TABLET IS THE DESKTOP'S GEOMETRY CROPPED** — one straight edge, same backswing at f206,
residuals ≤1.1 film px — so it runs the desktop's four-point clip parameterised by band.
⭐⭐ **THE PHONE IS NOT**: on the vertical cut the slab TILTS BACK, so its left edge sweeps right
across the words WHILE its top edge comes down through them. Both tracked (residuals ≤0.9 / ≤0.8),
and the clip is the frame notched by the corner where the two lines meet.
⚠️ **RE-TRACK IF THE FILM IS EVER RE-CUT** — `.textanim-2026-08-24/track_edge.py`, which now
carries the phone variant (`--phone`) and the tablet's parameters in its header.

⛔⛔ **THE TABLET'S 15vh IS A FENCE, NOT A TASTE (D370).** Tracked in the SUBTITLE'S OWN COLUMNS:
at 22vh the last line cleared the rising slab by only 35.5 film px and went NEGATIVE from t=23.7;
**17vh still touched (−17.3) because lifting re-wraps the line further right into the diagonal**;
15vh clears the whole beat (worst **+4.3**, 51px of daylight at full opacity).
⛔ The phone's 14.5vh has its own fence: after the reveal the floating slab cruises with its top at
film y **341** for six seconds, and the box bottoms at **331** — 10 clear. **Do not push either
lower without re-measuring.**

### ⭐ SECTION 3 — THE KITCHEN BEAT · *"The stone sets the tone of **the room.**"*

| | desktop ≥1121 | tablet 721–1120 | phone ≤720 |
|---|---|---|---|
| window | **27.0 → 38.5** | **28.5 → 37.5** | **28.5 → 37.5** |
| anchor | `top:16vh`, left gutter | `top:20vh`, left gutter | `top:25.6vh`, centred |
| type | `clamp(34px,4.8vw,70px)` 400, sub 19px | `clamp(40px,5.9vw,56px)` **600**, sub **20px** | `clamp(29px,8.7vw,44px)` **600**, sub 16px |
| motion | slide in from the left, set, reverse out | **the same**, ramps **2.2s** | **the same**, ramps **1.8s** |
| wash | the radial, on `--lg` | the radial, **deepened + plateau held** | the radial, on `--lg` |

⭐⭐ **THE RAMPS ARE THE SAME SPEED, NOT DIFFERENT ONES**: 761px/3.2s on desktop, ~520/2.2 on the
tablet, 390/1.8 on the phone — **~217 px/s at every band**. The still hold is what the ramps leave.
⛔ **THE OPACITY GATE AT THE WINDOW EDGES IS WHAT MAKES THE BACK-SCROLL CLEAN** (D358) — outside
the window the words do not exist, whatever position the slide would hold. Do not remove it.

⭐ **THE PHONE'S ANCHOR IS COUPLED TO THE ENDING** — 25.6vh is the finished hero's own title top,
measured at 390×844, so the last beat hands its line to the headline that replaces it (D364).
⚠️ **THE TABLET'S IS NOT, DELIBERATELY (D370)**: it is fenced by the island instead — the island's
lit top measures film y **437** on the 864 cut, and 20vh + the wider measure bottoms the block
**40px clear**. ⚠️ On extreme wide-short tablet windows (aspect ≥~1.35) the crop lifts the island
above any usable anchor; there the wash carries it, as this band always has.

⭐⭐ **THE TABLET'S WASH HOLDS ITS STRENGTH FURTHER DOWN THE BOX (D370)** — centre 46%, plateau to
46%, still `farthest-side` reaching zero at 100%. The old radial had decayed to ~0.2 by the
subtitle's rows, which is why he said it was hard to read. Ground measured t=29→37: title band p97
**73→114**, sub band **88→115 with maxima 245–255** — D346's specular trap.

### ⭐ SECTION 4 — THE ENDING · *"Surfaces worth building around"*

| | every band, since D368 |
|---|---|
| what moves | ⭐⭐⭐ **the WHOLE block, as one object** (`.hero-inner`) |
| motion | scale **0.84 → exactly 1.00** + fade |
| timing | **1.05s**, `--ease`, 180ms delay |
| clock | a CSS transition, triggered by `ink()` at `INK_AT` 0.93 — never scroll-tied |

⛔ **THE MEDIA QUERY IS GONE** — D356 (desktop) → D363 (phone) → D368 (tablet) ended with the rules
at base scope inside `html.cine-on .cine`. ⭐ The per-element stagger is NOT deleted: it still runs
on every band's no-film path (reduced motion, no MP4, `fail()`).
⭐⭐ **THE TABLET'S ENDING WAS ALSO RE-PROPORTIONED (D370)**, on measured slack of 231px: title top
**303 → 251**, sub **19px/560**, both gaps **18**, buttons **61px at 14px**, chips **54px at 13px**.
⚠️ **ALL OF THOSE CARRY `#hero`** — an id beats a late class, and the first cut silently lost.

### ⭐ THE CONTROLS AT THE FOOT OF THE FILM

| | desktop ≥1121 | tablet 721–1120 | phone ≤720 |
|---|---|---|---|
| skip | bottom-right corner, **2px** radius | ⭐ **centred**, **pill**, +27px | ⭐ **centred**, **pill**, +21px |
| contacts | none (`.wa-fab` hidden) | ⭐ **[WhatsApp] [SKIP] [phone]** | ⭐ **[WhatsApp] [SKIP] [phone]** |
| dress | — | 46px, translucent glass + gold rim | the same |

⭐⭐ **THE TRIO'S AIR IS EQUAL BY CONSTRUCTION, NOT BY A NUMBER**: each side of the skip holds
`50vw − 87.4px` and the 46px button sits in the middle of it, so edge→button = button→skip at every
width. **Verified 30.8px ×4 at 390 and 158.3px ×4 at 900.** ⚠️ The constants carry the skip's
rendered width (**174.8px**) — re-derive if its face, text or padding changes.
⭐ The pair FLANKS the skip only while `skip-live` is on (a class `chrome()` writes beside the
skip's own `hidden`); the moment the skip goes they slide back to their D173/D180 corner homes.
⚠️ **The call button was ruled out for the tablet and then back in, both within an hour** — D368
took it out, D369 put it back on his *"I was wrong with what I said before"* → *"we add the phone
button again… I rate that's what we should do."* Both are logged.

---

## 2. ⭐⭐⭐ WHAT THE NEXT ROUND IS

⛔⛔ **NOTHING IS OPEN BY INSTRUCTION.** He signed the phone off explicitly and has **not yet seen
D370** (the tablet's third pass). ⭐ **ASK FIRST**: show him the tablet and get the sign-off, or the
list of changes.

### ⚠️ The things this round left knowingly unfinished

1. ⭐⭐⭐ **THE PHONE'S KITCHEN WASH, REVERTED AND OWED A REWORK (D367).** It runs the original
   radial — stable, and what he has approved — because two attempts at a better shade flashed on
   his device. **The plan is written into the stylesheet note and §0: bake it from film time.**
   The plumbing is already there (`bandGrade(el,box)` + `KB`, the seated static box).
   ⚠️ Also unproven and worth one ask: his phone may have been holding a cached build for the
   second report — the HTML carries no cache-buster. The baked table makes the question moot.
2. ⚠️ **THE TABLET ON A WIDE-SHORT WINDOW** — the kitchen beat's island fence cannot hold above
   ~1.35 aspect. Nothing is broken; the wash carries it. Worth one look on a real landscape iPad.
3. ⚠️ **THE PHONE'S SLAB FENCE IS TIGHT AT SMALL WIDTHS** — 10 film px at 390. Below ~360 the box
   grows taller relative to the frame; a post-reveal wash guard is in place for exactly that, but
   it has not been seen on a 320-wide device.

---

## 3. ⭐⭐⭐ THE FILM'S COPY — FIXED, AND THE SAME AT EVERY BAND

```
FIRST SCREEN (every band now)
    Your worktop STARTS HERE.
    Follow the slab from the finest mountains of Europe and Asia,
    out of the quarry and into your kitchen.
    SCROLL TO BEGIN  ↓
    [Google 5.0]  [10 year guarantee]              desktop only, bottom left

SLAB BEAT     The slab you choose is UNIQUE.
              Measured, cut and finished for your home, and built to last for decades.

KITCHEN BEAT  The stone sets the tone of THE ROOM.
              Once you choose your stone, the rest follows.

ENDING        Surfaces worth BUILDING AROUND
              Chosen from the slab you approve, fitted by us across England and the British Isles.
```

⚠️ **`.cine-open` — "It starts as a mountain." — NOW STANDS DOWN AT EVERY BAND** (the phone at
D359, the tablet at D368). It is not deleted; it is the restore path if a band ever loses its
second hero.

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
   VIDEO STILL DOWNLOADS ITS `src` AND `poster`.** ⭐ **Re-verified this round at all three bands
   after every band's edits: zero requests for the other two.**
2. ⭐ **`preload="none"` in the markup**, flipped to `auto` by the scrub once the band is known.
3. ⭐⭐ **FIRST PAINT COSTS THE POSTER, NOT THE FILM** — **121 KB** desktop, 81 tablet, 54 phone.
   ⭐ The poster, the overlay plate and the film's own first frame are **one picture**.
4. ⭐⭐ **COMMENTS COME OFF ON THE WAY OUT (D315).** `make_upload.py` strips every `.html`/`.css`/
   `.js` into `upload/`. ⛔ Never strip comments from the SOURCE — they are the design record.
5. ⭐ **NOTHING UNREFERENCED SHIPS.** Dot-folders never ship. ⛔ When you remove an element, move
   its assets into a dot-folder **in the same edit**.

⚠️ **THIS ROUND ADDED NO ASSETS AND NO REQUESTS** — every animation is CSS and arithmetic, every
table is numbers in the existing inline script. ⚠️ **`dev-server.js` COMPRESSES AND THE HOST MAY
NOT.** ⚠️ **A MEDIA ELEMENT'S OWN FETCH OFTEN DOES NOT APPEAR IN `resource` TIMING** — prove "the
wrong film did not load" by the ABSENCE of the other bands' URLs plus `video.getAttribute('src')`.

---

## 5. ⛔ THREE DEVICE BANDS

```
   ≤ 720px          721 – 1120px          ≥ 1121px
   the phone   ·   the tablet        ·   the desktop
```
⛔ **THE TABLET-ONLY BLOCK IS STILL LAST IN THE STYLESHEET** (search `THE TABLET BAND`).
⭐ **Widen a phone rule's own query to reach the tablet, never copy it** — this round did exactly
that for the hero column, the grade, the pill, the ghost fab dress and the cue hide.
⚠️ ⛔⛔ **AND SOURCE ORDER DECIDES BETWEEN EQUAL SPECIFICITY** — but **an id is not equal**: three
rules this round lost to `#hero …` selectors written far earlier (§0).

⛔⛔⛔ **THE PER-BAND CASCADE IS THE ONE MENTAL MODEL FOR BOTH THE FILM AND THE BEATS:
`-phone` → `-narrow` → the bare attribute.** A band that names nothing inherits the one below it.
⚠️ **A BEAT WITH NO `-narrow` PAIR HAS NO DESKTOP-ONLY TIMING** — its base attribute IS every
band's number (D358a's leak). **Before retiming any beat, check whether it carries a `-narrow`
pair; if not, add one pinning the current values in the same edit.**

⭐ **IN THE SCRUB THE BANDS ARE `heroOn` (desktop) · `heroNr` (both narrow) · `heroPh` / `heroTab`**
— use `heroNr` for anything the two narrow bands share, and the specific one only where a band
owns its own number (the reveal's table, the slide's ramp, the exit's fade seconds).

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

⛔⛔⛔ **`node --check` IS A SYNTAX GATE, NOT A RUNTIME ONE** (D357) — read the console after any JS
edit, with `window.addEventListener('error',…)` armed, and drive the page.
⛔⛔ **AND IT IS NOT A SCOPE GATE EITHER (D359b, D370).** A rule can parse perfectly and never
apply — wrong media query, or outranked by an id. **Read the computed value back at the band you
meant to change.**

⛔⛔ **A BRACE INSIDE A COMMENT COUNTS.** Write CSS in comments without braces, and compare the
COUNT, not just the delta. ⭐ This round: **1816 → 1825**, every pair accounted for.

### ⭐ THE FREEZE PROBE — 1440×900, FRESH LOAD, TAB IN FRONT

| Signal | Value |
|---|---|
| `.gal-scroll` height | **4950** |
| `--revPer` (on `#reviews`) | **3** |
| `feTurbulence` count | **60** |
| elements | **2714** ⚠️ was 2711 — **+3 is the call fab's markup** |
| hero ink (`.hero-inner` padding-top) | **86.1828** |
| `#footer` height | **503.78** |
| `.hero-bg` children | **7** |
| broken images / 4xx / console errors | **0 / 0 / none** |
| the film fetched | **1920 only** |

⭐ **EVERY ROW RE-VERIFIED AT THE END OF THIS ROUND.**
⚠️ **THE DOCUMENT-HEIGHT ROW IS RETIRED**: the old doc's 24443 does not reproduce in this pane
(it reads **23500**) — and **HEAD reads 23500 too**, verified by serving the committed file
side-by-side, so it is an environment difference and not a regression. Do not chase it.
⚠️ The element count is only valid on a fresh load. ⚠️ Filter broken images on
`i.src && i.complete && i.naturalWidth===0`.

---

## 7. ⚠️ THE ENVIRONMENT TRAPS — ALL LIVE

**⭐⭐⭐ NEW THIS ROUND, AND EACH ONE COST A BUILD:**

- ⛔⛔⛔ **`@keyframes` INSIDE A NON-MATCHING `@media` NEVER REGISTER.** They are not global from
  wherever they are written. The phone's arrow shipped frozen because its keyframes lived in the
  `min-width:1121px` block. **Keyframes belong at base scope** — they are inert until named.
- ⛔⛔⛔ **`drawImage` CLIPS AN OFF-FRAME SOURCE RECT AND LEAVES THE REST OF THE CANVAS STALE.**
  Any sampler reading a moving or partly-off-frame box mixes live and previous-frame pixels and
  its statistic oscillates. **`clearRect` before every sample draw** (now in), and **sample a
  STATIC box** (`bandGrade(el,box)`) when the element itself moves.
- ⛔⛔ **AN ID BEATS A LATE CLASS.** `#hero .hero-sub` written at line 5702 outranks `.hero-sub`
  written at 9330. Match the specificity or the rule is decoration.
- ⛔⛔ **A SHARED SELECTOR REACHES ITS NEIGHBOUR.** `.cine-line .cine-line-sub` changed BOTH beats;
  scope per beat (`[data-vpos-wide="high"] .cine-line-sub`) when only one is meant.
- ⚠️ **A FREEZE PROBE THAT SETS `animation-delay` RESTARTS THE ANIMATION** — inline styles and an
  injected stylesheet restart at different moments, so frozen layers screenshot DESYNCED while the
  live ones are perfectly locked. **Verify phase with a same-frame computed-transform read**, not
  with a freeze.
- ⚠️ **A RELOAD CAN DROP THE PANE'S VIEWPORT EMULATION** — a phone tab came back as 768 twice and
  reported tablet numbers as if they were the phone's. **Read `innerWidth` in the same probe as
  the number** (this is the old two-tab rule, now with a second cause).

**(Carried, all still live)**

- ⛔⛔⛔ **`currentTime` IS NOT THE FRAME ON THE SCREEN.** 1–3 frames of lead under a live scrub.
  ⭐ `video.requestVideoFrameCallback` → `metadata.mediaTime` is the only ground truth, and a fast
  scrub presents about every SIXTH frame.
- ⛔⛔⛔ **THE FILM NEEDS ~8s TO BUFFER AFTER A NAVIGATION, AND THE EASED CHASE ~2.5–3.5s TO SETTLE.**
  ⭐⭐ **POLL `currentTime` UNTIL IT STOPS CHANGING BEFORE TRUSTING ANY READING.**
- ⛔⛔⛔ **MEASURE TEXT AFTER THE FONT LANDS.** Cinzel is **135px wider** across the headline.
- ⛔⛔ **THE FRAME AVERAGE OF THIS FILM BELONGS TO NOTHING IN IT.** Measure the region you mean —
  this round, the whole-frame scan said the slab reached film y 73 while the TEXT's own columns
  said 559. Two completely different answers to two different questions.
- ⛔⛔⛔ **A SCROLL ANIMATION IS DEAD IN A BACKGROUND TAB**, and the pane throttles rAF even when
  fronted. ⚠️ **A BACKGROUNDED PANE TAB ALSO SCREENSHOTS BLACK** — front it (`tabs_select`) first.
  ⚠️ It also freezes `skip-live` and every scrub-written value; a background tab reports stale.
- ⛔⛔ **THE PANE'S SCREENSHOT GOES BLACK after `resize_window` + reload.** Fresh tab, navigate,
  resize, shoot **without** reloading. ⭐ **AND `backdrop-filter` ANYWHERE CAN BLACK THE CAPTURE.**
- ⛔⛔ **A NARROW LOAD LOOKS EXACTLY LIKE A BROKEN PAGE.** `--stoneRaster:on` below 720px swaps the
  live marble SVG for a bitmap: `feTurbulence` reads 0 and elements drop ~570. ⚠️ **A tab that
  navigates BEFORE it is resized loads narrow and keeps those numbers** — reload after resizing.
- ⛔⛔ **AN INLINE STYLE OUTRANKS A CLASS RULE** — hand the property back (`style.removeProperty`),
  and **do not write a property at a band that has no rule to answer it**.
- ⛔⛔ **A CSS EDIT DOES NOT SHOW UNTIL THE BUILDERS RE-RUN** (`site.css?v=<hash>`). ⚠️ `index.html`'s
  own inline CSS is served directly and needs no builder.
- ⭐ **`scroll-behavior:smooth` eats programmatic scrolls** — use `behavior:'instant'`, and set it
  twice (a scroll set immediately after a navigation is undone by scroll restoration).
- ⛔ **`computer` LIMITS: `wait` ≤ 10s, `scroll_amount` ≤ 10.** Chain them.
- ⚠️ **`javascript_tool` KEEPS THE PAGE'S TOP-LEVEL SCOPE BETWEEN CALLS** — a second `const bb`
  throws `Identifier already declared`. Wrap probes in `(()=>{ … })()`.
- (Carried) `javascript_tool` runs before async work settles — kick, wait, read back in a second
  call · **no numpy, PIL only** · **no libwebp in this ffmpeg; the browser canvas is the only SVG
  rasteriser** · valid stone presets: calacatta, carrara, crema, emperador, eternal, fumo,
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
| **`/`** | opens on his film at every band, the overlay cutting to it at f0, **a second hero on the first screen at ALL THREE BANDS**, **three story beats with per-band composition and animation**, skip control + contact trio on the narrow bands, 182vh of dead scroll on the finished hero. ⭐⭐⭐ **The film's text is finished on desktop, phone and tablet (§1)** |
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
12. ⛔ **One device at a time unless he says otherwise.** ⭐ **All three bands are now built; the
    DESKTOP and the PHONE are frozen, and the TABLET is awaiting his sign-off.**
13. ⭐⭐ **THIS IS A DESIGN BUILD. NEVER RAISE THE MISSING FORM BACKEND AS A BLOCKER.**
14. ⛔⛔ **2 CREDITS MAXIMUM PER GENERATED IMAGE.** ⭐ **This round spent nothing.**
15. ⭐⭐⭐ **SITE SPEED IS KEY** — his own words.

---

## 11. OPEN — DO THESE NEXT

### ⭐⭐⭐ The live scope

1. ⭐⭐⭐ **SHOW HIM THE TABLET (D370) AND GET THE SIGN-OFF.** He has not seen the third pass.
2. ⭐⭐ **THE PHONE'S KITCHEN WASH REWORK** — reverted at D367, plan in §2 item 1 and §0.

### ⭐⭐⭐ The ones that are costing money

3. ⭐⭐⭐ **HOW DO FILES ACTUALLY REACH `thadeusg3.sg-host.com`?** Asked twelve times.
   **Everything from D291 onward is still NOT live — including his video, every word of the film's
   copy, and both of this round's device builds.**
4. ⭐⭐⭐ **WHOSE ARGENTO DOES HE SELL?** His reference is a dense flecked grey-white; the site shows
   the supplier's veined marble-look. ⛔ Do not paste the Google image.
5. ⭐⭐ **THE STONE PHOTOGRAPHY AUDIT** — 24 of 132 verified; **92 Nile Stone tiles unverified**.
6. ⭐ **Pick a production host**; brotli; check the `.htaccess` cache rules survive it.
   ⚠️ **22.8 MB of film makes this urgent.**

### ⭐⭐ His call

7. ⭐⭐ **THE HEADLINE WORDING** — he is still taking the client's input. Three alternates parked.
8. ⭐ **THE HERO PLATE FOR THE ENDING.** Withdrawn at D328 because the re-cut moved the camera.
   **It needs a new still from him**, or it stays off.
9. ⭐⭐ **DOES THE FILM WANT SOUND?** The masters carry PCM; the site drops it. Never discussed.
10. ⭐ **THE 19 DRONE VIDEOS** (Hornchurch, Rickmansworth) — worth re-asking now the site carries film.
11. ⚠️ **THE GROWTH ON THE FIRST SCREEN IS OUT.** D350 added a 1.00→1.20 scale on his *"it should
    get bigger"*; D352 removed it. **He has not been asked whether he wants it back.** ⚠️ Note the
    ENDING now grows at every band, so the answer may be that the first screen should not.
12. ⭐⭐ **THE PHONE'S BAR** — the skeleton crosses his 11-Aug *"already formed from the top"* ruling.
    **One word puts it back: delete the two `header.bar.preform::after` lines.**
13. ⭐⭐ **A QUOTE CARD FOR THE PHONE AND TABLET.** D300 is desktop-only because he said so.
14. ⭐⭐ **THE SITEMAP LINK'S GOLD STYLING** — `seo.css` has the rule, no footer has the hook.
15. ⭐⭐ **Trade terms** — payment, minimum order, lead times, a dedicated contact. **His stated
    first priority.**
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
26. ⚠️ **The branch `tablet-round-d197-d200` receives every push** (the remote is configured to
    update both refs). It is not stale any more, but it is a duplicate of `main` and should be
    deleted once item 3 is answered.

**Still waiting on the client:** whether Quartzite becomes a fourth range, 20mm vs 30mm pricing,
brackets for vanity tops / fireplaces / tables, and the £3k vs £3,850 three-slab discrepancy.

**CLOSED this round:** the phone's four sections and its contact trio (**his sign-off: *"This is
perfect"***), the tablet's four sections and its trio, the reveal at all three bands, the ending's
arrival at all three bands, and the §2-item-6 fault carried since the phone was first measured
(the slab beat flying off-frame at readable opacity — the reveal replaced it).

---

## 12. ⭐ HOW THIS CLIENT WORKS

⛔⛔⛔ **HIS COMPLAINT NAMES THE SYMPTOM CORRECTLY EVERY TIME. IF YOU "FIX" IT AND HE REPEATS
HIMSELF, YOU CHANGED THE WRONG VARIABLE — DO NOT CHANGE THE SAME ONE HARDER.**
⭐⭐ This round: *"it's flashing like crazy"* twice, and the second time the answer was to STOP
(revert) rather than to try a third construction. **He offered that himself — take it.**

⭐⭐⭐ **AND WHEN HE DESCRIBES A FEELING, THE MECHANISM BEHIND IT IS USUALLY EXACTLY WHAT HE SAYS.**
*"You can't see the border of the gradient"* was a linear gradient's own box edge crossing the
frame. *"The arrow is too see-through"* was an 0.62 alpha. *"Why is the glare outside of the
arrow?"* was an unmasked layer. **Take the words literally and go measure.**

⭐⭐ **HE REVERSES HIMSELF FREELY AND FAST, AND THAT IS FINE.** This round the arrow's position
changed four times and the tablet's controls twice, in hours. **The way to make that cheap is to
park everything and delete nothing**, labelled with why it went. ⚠️ **And when a reversal restores
an older mechanism, say so plainly rather than presenting it as new.**

⭐⭐ **HE ASKS FOR YOUR OPINION AND MEANS IT.** *"Let me know if you actually think that we should
center everything… I rate that's what we should do."* **Answer with a recommendation and a reason,
then build it** — he had already decided, and the reason is what he was checking.

⭐⭐ **HE SENDS CORRECTIONS MID-TURN.** Finish the one you are on, read the new one before shipping,
then take them in his order. ⚠️ This round one mid-turn message *revised its own instruction*
(the kitchen's height, twice in one paragraph) — **the LAST version is the one he means.**

⭐⭐ **HIS SCREENSHOTS MARK MOMENTS, NOT LAYOUTS.** Work out whether he is pointing at a STATE or a
TIME. He is usually pointing at a time.

⛔⛔ **DO NOT ARGUE YOURSELF OUT OF SOMETHING HE ASKED FOR, AND DO NOT HAND HIM THE DILEMMA.**
**A real constraint is a problem to solve, not a question to return.** ⭐ When his ask and the frame
genuinely conflict, **size the thing to the frame and tell him the number**.

⛔⛔ **DO NOT ASK HIS PERMISSION. Commit, push, report.**

⭐⭐ **WHEN YOUR OWN WORK CAUSED THE FAULT, SAY SO IN THE FIRST LINE.** He is fine with that and not
fine with spin. **Four of this round's faults were mine and each was reported before anything else.**

⚠️ **HE SWEARS WHEN SOMETHING LOOKS WRONG, AND THE COMPLAINT IS ALWAYS REAL.**

- **Walk the journey, do not check the page.** ⭐⭐ **Look at the result before reporting it done.**
- **Measure, then claim** — and if you could not measure it, say so.
- ⭐⭐ **AND CHECK THE VIEWPORT IN THE SAME BREATH AS THE NUMBER.**

---

## 13. BUDGET AND THE DOCUMENT SET

⭐ **This round spent 0 credits.** Every track, contrast figure, island fence and glyph metric was
`ffmpeg`, PIL, the browser's own canvas and plain Python; the film and the stills are his.

| File | What it is |
|---|---|
| **`HANDOVER.md`** | ⭐ The single current state. §D is the register, **D1–D130, D132–D370**. §2 the standing rules, **§2s SITE SPEED**, §2a the supplier list. ⚠️ **THERE IS NO D131 ROW.** ⚠️ Section numbers are referenced from code comments — **do not renumber** |
| **`Website Demo/index.html`** | ⭐⭐ The whole landing design. Search `THE SCROLL FILM`, `THE EDGE FADE`, `THE SLAB REVEALS ITS OWN CAPTION`, `THE PHONE'S OWN TRACK`, `THE TABLET'S OWN TRACK`, `THE KITCHEN BEAT ARRIVES BY THE SIDE`, `THE ENDING COMES TOWARDS YOU`, `THE OPENING FRAME AS A SECOND HERO`, `THE FIRST SCREEN COMES TO THE PHONE`, `THE FILM'S TEXT ON THE TABLET`, `cine-line`, `bandGrade`, `THE TABLET BAND` |
| ⭐⭐ **`.textanim-2026-08-24/track_edge.py`** | **THE SLAB EDGE TRACKER — all three bands.** Desktop by default; **`--phone` runs the two-edge variant**; the tablet's parameters (rows 260–470, YREF 360, 864 frames) are in its header. ⭐ Re-run it if the film is ever re-cut |
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
| `HANDOVER-2026-08-24-desktop-text-round-start-here.md` | ⭐ The START HERE this file replaces (D354–D358a) |
| `HANDOVER-archive-to-2026-08-06.md` | ⚠️ **Every design the client rejected, in his words.** Read before redesigning anything |

### ⭐ THIS ROUND'S COMMITS, IN ORDER

```
29ddfc7  D359–D361  the phone takes the film's text: the hero, the two-edge reveal, the kitchen
92eda92  D359b D362 the phone's first screen rebuilt left-hung on a frame grade; the beats go bold
bc0c9da  D359c D362a D363   third pass on the first frame; the wash flattened; the ending ported
837cc25  D364      the kitchen takes the ending's line and the desktop's slide; the slab recedes
f1de14a  D365      the arrow finds the R of SCROLL; the kitchen's wash stands still
d94099a  D365a     the arrow returns to the S's line; the flash gets a hot core
aba9c7c  D365b D366 the flash becomes a glare; the scrim's strobe dies at the sampler
c02fb63  D365c D367 the glare goes back inside the stroke; the wash reverts to the radial
0823d90  D368      the tablet takes the film's text: mobile's blueprint, the desktop's reveal
cc68237  D369      the tablet's first frame centred at scale; the trio returns; the kitchen lifts
072145b  D370      the slab beat lifts off the stone; the kitchen reads easier; the ending fills
```
