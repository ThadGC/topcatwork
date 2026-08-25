# START HERE — 24 August 2026, after THE CONTACT-CONTROLS ROUND (D371–D377)

Read this, then `HANDOVER.md` **§D** (the register, newest first — this round is **D371–D377**),
**§2** (the standing rules) and **§2s** (SITE SPEED). About twenty minutes, and enough to work safely.

> ⚠️ **This replaces the previous version of this same file**, now
> `HANDOVER-2026-08-24-phone-and-tablet-rounds-start-here.md` (D359–D370). Everything that still
> matters is carried below.

> ⭐⭐⭐ **THE FILM'S TEXT IS FINISHED ON ALL THREE BANDS AND IS NOT WHAT THIS ROUND TOUCHED.**
> This round was the CONTACT CONTROLS — the floating pair, the skip control and the sticky bar —
> plus the tablet's ending and the desktop's dead scroll. §1 records what every control does now.
> ⛔ **THE COPY IS FIXED AND IS NOT REOPENED (§3). THE COMPOSITION AND THE ANIMATION ARE PER BAND.**
> ⭐ **HE HAS SEEN AND DRIVEN EVERY CHANGE IN THIS ROUND** — each one was his instruction and each
> was verified live before it was reported. **Nothing is awaiting a sign-off.**

---

## 0. ⛔⛔⛔ THE ONE THING TO TAKE FROM THIS ROUND

**⭐⭐⭐ EVERY FAULT HE REPORTED THIS ROUND WAS A LAYOUT NUMBER THAT NOBODY HAD EVER MEASURED — AND
IN EACH CASE THE VALUE WAS ALREADY IN THE STYLESHEET, JUST NEVER READ BACK.**

```
the crushed word    `flex:1 1 0` sizes a button by its RATIO and ignores its content, so
                    three labels of 11, 8 and 4 characters went into two identical widths
                    and the LONGEST word got the LEAST room: 4.73px of air against 25.62.
                    HE saw it. One measurement named it.
the misaligned row  the chips sat on the hero column (660px) while the subtitle sat on its
                    own measure (560px) — two different boxes nobody had ever compared.
the nominal table   the dead-scroll table's "900vh film / 200vh dead" were --cineH split by
                    the hold. The REAL travel is one viewport less. Taking the table at its
                    word would have sped the film up.
the silent overtake my own first cut let a ghost button outgrow the gold CTA (129.6 vs 131.1),
                    crossing an 11 Aug ruling. Re-measuring caught it, not looking.
```

⛔⛔ **THE RULE THAT COVERS ALL FOUR: A NUMBER IN THE STYLESHEET IS NOT A MEASUREMENT. READ THE
RENDERED VALUE BACK, AND COMPARE THE TWO THINGS THAT ARE SUPPOSED TO LINE UP** — the chip against
the ink, the button against its label, the hold against the travel. This is last round's
"measure the thing you changed" turned forward: **measure the thing you are about to change,
first**, because the fault is usually already visible in the numbers.

⭐⭐⭐ **AND THE SECOND LESSON, WHICH IS WORTH REAL MONEY: WHEN A LAYOUT MUST FIT ITS CONTENT, GIVE
IT A CONTENT BASIS, NOT A RATIO.** `flex:1 1 0` + `min-width:0` is a licence to shrink below the
content and clip it silently (nowrap text does not wrap, it overflows — the D171 trap). `flex:1 1
auto` makes the content the floor and shares only the surplus. **Equal grow then produces equal
air automatically**, whatever the labels say — no per-label constants to maintain.

⭐⭐ **AND A THIRD: HE REVERSES HIMSELF INSIDE A SINGLE MESSAGE, AND THE LAST VERSION IS THE ONE HE
MEANS.** This round: *"those should be closer together… or the WhatsApp and the phone should be
right next to each other"* → *"the WhatsApp on the right, the phone on the left"*, and *"there is
no more phone and WhatsApp button"* → *"maybe just the WhatsApp button."* **Both times the second
half was the instruction.** Read the whole message before starting.

---

## 1. ⭐⭐⭐ WHAT THE CONTACT CONTROLS DO RIGHT NOW, AT EVERY BAND

⛔ **EVERY NUMBER BELOW IS MEASURED AND LIVE.** Desktop is `min-width:1121px`, the phone is `≤720`,
the tablet is `721–1120` and its own rules are LAST in the stylesheet.

### ⭐ THE FLOATING PAIR — `.wa-fab` / `.call-fab`

| | desktop ≥1121 | tablet 721–1120 | phone ≤720 |
|---|---|---|---|
| during the film | ⭐ none (both hidden ≥1121, D207) | ⭐ **[phone] [SKIP] [WhatsApp]**, 28px off the pill | ⭐ **[WhatsApp] [SKIP] [phone]**, equal air |
| on the finished hero | none | ⭐ **WhatsApp alone**, corner home | ⭐⭐ **NOTHING — the corner is clear** |
| once the sticky bar rises | none | ⭐ hidden | ⭐ hidden |
| internal pages (no film) | none | the corner pair, unchanged | the corner pair, unchanged |

⭐⭐⭐ **THE TWO NARROW BANDS ARE DELIBERATE MIRRORS OF EACH OTHER AND THAT IS NOT AN OVERSIGHT.**
The phone keeps D359's order (WhatsApp left) because he ruled it and signed it off; the tablet
takes D371's (phone left) because he ruled that separately, with his own reason: *"I'm not sure if
people even have sim cards or can make calls from tablet, but just in case they can."*
⚠️ **If he ever asks for them to match, it is the phone that moves** — the tablet's is the newer
ruling.

⭐⭐ **THE GATES ARE ALL `skip-live`, AND THEY ARE SCOPED UNDER `cine-on` FOR ONE REASON**: the
seven internal pages have no film and no `cine-on`, so they keep their D359 corner pair untouched,
and a landing whose film fails (`fail()` strips `cine-on`) falls back to the same pair rather than
to an empty corner. ⛔ **Never write these gates unscoped.**

⭐ The tablet's flank arithmetic: skip edges at `50vw ∓ 87.4px`, gap **28px**, buttons 46px →
wa `translateX(calc(179.4px - 50vw))`, call `translateX(calc(-97.4px - 50vw))`, both off the
shared `right:18` home. **Measured 28.0/28.0, symmetric to 0.0, at 768 and 900.**
⚠️ **THE CONSTANTS CARRY THE SKIP'S RENDERED 174.8px** — re-derive if its face, text or padding
changes. (D375 changed its *shape*, not its width; re-measured 174.8 at 390, 768 and 1440.)

### ⭐ THE SKIP CONTROL — `.cine-skip`

| | desktop ≥1121 | tablet 721–1120 | phone ≤720 |
|---|---|---|---|
| shape | ⭐⭐ **PILL** (D375) | pill | pill |
| face | `border-radius:999px`, `padding:13px 26px`, 12px/500, gold border, chevron | the same | the same |
| position | bottom-right corner | centred on the fab row, +27px | centred on the fab row, +21px |

⭐⭐⭐ **THE SHAPE IS NOW ONE DECLARATION AT BASE SCOPE, NOT THREE COPIES.** D375 deleted the
`≤1120` pill rule and folded the radius and padding into the base `html.cine-on .cine-skip` rule.
⛔ **THE `≤1120` CENTRING BLOCK IS SEPARATE AND UNTOUCHED** — shape is every band's, position is
per band. Do not merge them.
⛔ Still not a mark in a disc (§2 rule 11): a bordered control with a label, which the rule exempts.

### ⭐ THE STICKY ACTION BAR — `.mbar`

| | desktop ≥1121 | tablet 721–1120 | phone ≤720 |
|---|---|---|---|
| exists | ⛔ `display:none`, never rendered | ⭐⭐ **YES, since D372** | yes |
| reads | — | **Get a quote · WhatsApp · Call** | **Get a quote · WhatsApp · Call** |
| layout | — | ⭐ centred cluster, fixed 282/209/209, gaps 10 | ⭐ content-sized, grow 1.7/1/1 |
| rises when | — | the hero's CTA row passes the header's bottom edge | the same |

⭐⭐⭐ **THE MIDDLE ACTION IS WHATSAPP, NOT EMAIL (D372)** — `wa.me/447464940287`.
⛔⛔ **TWO NUMBERS, DELIBERATE, NEVER "TIDIED" INTO ONE: WhatsApp goes to the 07464 MOBILE, every
`tel:` on the site goes to the 0800 098 2812 FREEPHONE.** A UK freephone cannot hold a WhatsApp
account. ⚠️ The email address did not disappear from the site — it is in the contact block and the
footer.

⭐⭐⭐ **THE PHONE'S BUTTONS ARE SIZED BY THEIR OWN LABELS (D377), AND THIS IS THE ROUND'S BIGGEST
LESSON.** `flex:1 1 auto` — content is the floor, only the surplus is shared, `min-width:0` deleted
with the zero basis it existed for. **Air per side, measured:**

```
        430:  29.9 / 22.1 / 22.1        360:  16.1 / 12.8 / 12.8
        390:  20.7 / 16.7 / 16.7        320:  12.0 / 10.4 / 10.4
        gaps 12 / 8 / 8 / 12 at every width, nothing over its box
```

⚠️ **THE GOLD BUTTON'S GROW IS 1.7 AND THAT NUMBER IS LOAD-BEARING.** At 1.35 a ghost button
overtook it (129.6 vs 131.1) and the two swapped places around ~400px, crossing the 11 Aug ruling
that *"the quote button takes the extra width."* ⚠️ Below ~330 the basis wins over the share and
WhatsApp is the wider box again — nothing fixes that without shrinking the word, and the row is
uniformly tight there anyway.

⭐⭐ **THE BAR CAN NEVER RISE DURING THE FILM, AND THIS WAS VERIFIED RATHER THAN ASSUMED.** `#hero`
is sticky, so its CTA row sits at a CONSTANT 547px (at 390) through the whole film against an 80px
threshold — sampled at seven points from f0 to the end, `mbarOn` false at every one. **So D372's
stand-down can never fire on the film's trio.** ⚠️ Re-check this if the hero ever stops being
sticky.

⚠️ **THE BAR IS DORMANT ON THE SEVEN INTERNAL PAGES** — its trigger reads `.hero-ctas`, which those
pages do not have, so the IIFE returns early and the bar never rises there. It is markup that costs
nothing. **This is pre-existing, not this round's doing** — flag it to him if he ever asks why the
bar is only on the landing page.

### ⭐ THE TABLET'S ENDING — "Surfaces worth building around" (D373)

| | value at 768×1024 |
|---|---|
| chip grid | ⭐⭐ **`width:550px`** — the subtitle's own first-line ink |
| alignment | left edge on the **Q** of "Quartz", right edge on the **d** of "and" |
| measured | chips 109.0/659.0 vs ink 108.85/659.15 → **0.15px**; 0.12px at 900 |
| title top | 251 → **221.5** |
| chips bottom | 814 → **825** (span 563 → 604) |
| the margins | padding-top `clamp(76px,8.2vh,96px)`, title `clamp(24px,4.2vh,52px)`, sub and cta `clamp(42px,5.8vh,62px)` |

⭐⭐ **THE 550 IS A MEASUREMENT OF THE 19px LINE, NOT A ROUND NUMBER.** Both the sub and the chip
grid are centred in the same column, so one width lands both edges at every tablet width — no
per-width constants. ⚠️ **RE-MEASURE IT IF THE SUBTITLE'S TEXT, SIZE OR FONT EVER CHANGES** —
moving type re-wraps ink (last round's own lesson, §0).
⚠️ The vh floors are what protect **1024×768 landscape**, this band's tightest window (D297).

### ⭐ THE DESKTOP'S DEAD SCROLL (D376)

```
   --cineH 1100vh → 1050vh      --cineHold 0.1818 → 0.1387      DESKTOP ONLY
   real travel 950vh  →  film 818.2vh (UNCHANGED)  +  dead 131.8vh (was 181.8)
   pace delta measured at exactly 0.00
```

⛔⛔⛔ **BOTH NUMBERS MUST ALWAYS MOVE TOGETHER.** The scrub computes `film = eased/(1 − hold)`, so
trimming the hold alone squeezes the same film into less travel and speeds the picture up.
⛔⛔ **AND SOLVE AGAINST THE REAL TRAVEL, NOT THE TABLE'S NOMINAL FIGURES.** `.cine` is `--cineH`
tall with a STICKY `#hero`, so the scrollable travel is **one viewport LESS** than `--cineH`. The
table's "900vh film / 200vh dead" were `--cineH` split by the hold; the true figures were 818.2 /
181.8. **Taking the naive value would have cost the film 4vh of travel.** The table now carries
this warning in the stylesheet — read it before touching either number.
⚠️ Tablet (900vh / 0.2) and phone (800vh / 0.2125) are untouched; he named the desktop.

---

## 2. ⭐⭐⭐ WHAT THE NEXT ROUND IS

⛔⛔ **NOTHING IS OPEN BY INSTRUCTION AND NOTHING IS AWAITING A SIGN-OFF.** Every item this round
was his own instruction, built and verified. ⭐ **ASK HIM WHAT IS NEXT**, or take the standing list
in §11.

### ⚠️ The things this round left knowingly unfinished

1. ⭐⭐⭐ **THE PHONE'S KITCHEN WASH, STILL REVERTED AND STILL OWED A REWORK (D367).** It runs the
   original radial — stable, and what he has approved — because two attempts at a better shade
   flashed on his device. ⛔⛔ **THE CAUSE IS WRITTEN DOWN AND MUST NOT BE RE-DISCOVERED:**
   `drawImage` **clips** a source rect reaching outside the video and leaves the rest of the canvas
   STALE, so any moving or partly-off-frame sampling box mixes live and previous-frame pixels and
   its statistic oscillates per frame. **THE AGREED FIX: BAKE THE WASH FROM FILM TIME** — sample
   the seated box OFFLINE per half-second, ship a ~20-entry table, drive the strength from `t`
   alone. The plumbing is already there (`bandGrade(el,box)` + `KB`). `clearRect` before every
   sample draw is in since D366 and protects everything else.
2. ⚠️ **THE TABLET ON A WIDE-SHORT WINDOW** — the kitchen beat's island fence cannot hold above
   ~1.35 aspect. Nothing is broken; the wash carries it. Worth one look on a real landscape iPad.
3. ⚠️ **THE PHONE'S SLAB FENCE IS TIGHT AT SMALL WIDTHS** — 10 film px at 390. A post-reveal wash
   guard is in place for exactly that, but it has not been seen on a 320-wide device.
4. ⚠️ **THE STICKY BAR IS DORMANT ON THE INTERNAL PAGES** (above). One line would wake it — a
   fallback trigger element — but it has never been discussed with him. **Do not do it unasked.**

---

## 3. ⭐⭐⭐ THE FILM'S COPY — FIXED, AND THE SAME AT EVERY BAND

```
FIRST SCREEN (every band)
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
              ⚠️ NARROW BANDS SHOW `.hs-phone` INSTEAD: "Quartz, granite and marble worktops,
                 chosen with you and fitted by our own team." — and D373's chip alignment is
                 measured off THAT line. Two subtitles, one element, `#hero .hs-wide` hidden ≤1120.
```

⚠️ **`.cine-open` — "It starts as a mountain." — STANDS DOWN AT EVERY BAND.** Not deleted; it is
the restore path if a band ever loses its second hero.

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
   VIDEO STILL DOWNLOADS ITS `src` AND `poster`.** ⭐ **Re-verified this round: zero requests for
   the other two bands at 1440.**
2. ⭐ **`preload="none"` in the markup**, flipped to `auto` by the scrub once the band is known.
3. ⭐⭐ **FIRST PAINT COSTS THE POSTER, NOT THE FILM** — **121 KB** desktop, 81 tablet, 54 phone.
   ⭐ The poster, the overlay plate and the film's own first frame are **one picture**.
4. ⭐⭐ **COMMENTS COME OFF ON THE WAY OUT (D315).** `make_upload.py` strips every `.html`/`.css`/
   `.js` into `upload/`. ⛔ Never strip comments from the SOURCE — they are the design record.
5. ⭐ **NOTHING UNREFERENCED SHIPS.** Dot-folders never ship. ⛔ When you remove an element, move
   its assets into a dot-folder **in the same edit**.

⚠️ **THIS ROUND ADDED NO ASSETS AND NO REQUESTS.** The bar's WhatsApp glyph is the `mn-pair`'s own
inline path, re-used; the email glyph it replaced was inline too. Every other change is CSS.
⚠️ **`dev-server.js` COMPRESSES AND THE HOST MAY NOT.** ⚠️ **A MEDIA ELEMENT'S OWN FETCH OFTEN DOES
NOT APPEAR IN `resource` TIMING** — prove "the wrong film did not load" by the ABSENCE of the other
bands' URLs plus `video.getAttribute('src')`.

---

## 5. ⛔ THREE DEVICE BANDS

```
   ≤ 720px          721 – 1120px          ≥ 1121px
   the phone   ·   the tablet        ·   the desktop
```
⛔ **THE TABLET-ONLY BLOCK IS STILL LAST IN THE STYLESHEET** (search `THE TABLET BAND`).
⭐ **Widen a phone rule's own query to reach the tablet, never copy it** — this round did exactly
that for the whole sticky-bar block (720 → 1120).
⭐⭐ **AND WHEN A RULE BECOMES EVERY BAND'S, DELETE ITS QUERY RATHER THAN ADDING A THIRD COPY** —
D375's pill. One description beats three that can drift.
⚠️ ⛔⛔ **SOURCE ORDER DECIDES BETWEEN EQUAL SPECIFICITY — BUT AN ID IS NOT EQUAL.** Rules have lost
to `#hero …` selectors written far earlier; D373's block carries `#hero` on every declaration for
exactly that reason.

⛔⛔⛔ **THE PER-BAND CASCADE IS THE ONE MENTAL MODEL FOR BOTH THE FILM AND THE BEATS:
`-phone` → `-narrow` → the bare attribute.** A band that names nothing inherits the one below it.
⚠️ **A BEAT WITH NO `-narrow` PAIR HAS NO DESKTOP-ONLY TIMING** — its base attribute IS every
band's number (D358a's leak). **Before retiming any beat, check whether it carries a `-narrow`
pair; if not, add one pinning the current values in the same edit.**

⭐ **IN THE SCRUB THE BANDS ARE `heroOn` (desktop) · `heroNr` (both narrow) · `heroPh` / `heroTab`**
— use `heroNr` for anything the two narrow bands share, and the specific one only where a band
owns its own number.

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
⛔⛔ **AND IT IS NOT A SCOPE GATE EITHER.** A rule can parse perfectly and never apply — wrong media
query, or outranked by an id. **Read the computed value back at the band you meant to change.**

⛔⛔ **A BRACE INSIDE A COMMENT COUNTS.** Write CSS in comments without braces, and compare the
COUNT, not just the delta. ⭐ This round: **1825 → 1833**, every pair accounted for.

### ⭐ THE FREEZE PROBE — 1440×900, FRESH LOAD, TAB IN FRONT

| Signal | Value |
|---|---|
| `.gal-scroll` height | **4950** |
| `--revPer` (on `#reviews`) | **3** |
| `feTurbulence` count | **60** |
| elements | **2714** |
| hero ink (`.hero-inner` padding-top) | **86.1828** |
| `#footer` height | **503.78** |
| `.hero-bg` children | **7** |
| broken images / 4xx / console errors | **0 / 0 / none** |
| the film fetched | **1920 only** |
| ⭐ document height | **23993** ← NEW VALUE, see below |
| ⭐ film travel / dead scroll | **818.2vh / 131.8vh** |
| ⭐ skip control | **174.8px wide, `border-radius:999px`** |

⭐ **EVERY ROW RE-VERIFIED AT THE END OF THIS ROUND.**
⭐⭐⭐ **THE DOCUMENT-HEIGHT ROW IS UN-RETIRED, AND THE LAST SESSION'S CONCLUSION WAS WRONG.** It
retired the row as "environmental" because the old doc's **24443** would not reproduce (the pane
read 23500). It reproduces exactly: this pane read **24443** before D376, and **23993** after —
and 24443 − 23993 = **450px = the 50vh of dead scroll D376 removed at 900 tall**. The 23500 reading
was the anomaly, not the 24443. ⚠️ **Use 23993 as the baseline now, and if it moves, the dead
scroll or a section height moved — it is a real signal again.**
⚠️ The element count is only valid on a fresh load. ⚠️ Filter broken images on
`i.src && i.complete && i.naturalWidth===0`.

---

## 7. ⚠️ THE ENVIRONMENT TRAPS — ALL LIVE

**⭐⭐⭐ NEW THIS ROUND:**

- ⛔⛔⛔ **A MANUALLY-ADDED STATE CLASS STICKS, BECAUSE THE LISTENER ONLY TOGGLES ON CHANGE.** Adding
  `.on` to `.mbar` by hand to measure it left it on: the scroll handler holds `shown` in a closure
  and only writes when `past !== shown`, so it never took the class back off. **I read that as the
  bar rising during the film and nearly "fixed" a fault that did not exist.** ⭐ **Probe a state by
  DRIVING the page into it, or reload before trusting any state you set by hand.**
- ⚠️ **`selectNodeContents` THROWS ON A NULL NODE** — a button with no `<span>` (the gold CTA) has
  no element child to select. Guard it, or the whole probe dies and returns nothing.
- ⭐⭐ **THE ENTRANCE TRANSFORM SCALES EVERY MEASUREMENT.** `#hero` renders at `scale(0.84)` until
  `.loaded`, so every rect read before the film ends is 0.84× the real number (a 660px column
  measures 554.4). **Add `.loaded` — or scroll to the end of the film — before measuring the
  ending, and check a known width to confirm the scale is gone.**

**(Carried, all still live)**

- ⛔⛔⛔ **`currentTime` IS NOT THE FRAME ON THE SCREEN.** 1–3 frames of lead under a live scrub.
  ⭐ `video.requestVideoFrameCallback` → `metadata.mediaTime` is the only ground truth, and a fast
  scrub presents about every SIXTH frame.
- ⛔⛔⛔ **THE FILM NEEDS ~8s TO BUFFER AFTER A NAVIGATION, AND THE EASED CHASE ~2.5–3.5s TO SETTLE.**
  ⭐⭐ **POLL `currentTime` UNTIL IT STOPS CHANGING BEFORE TRUSTING ANY READING.**
- ⛔⛔⛔ **MEASURE TEXT AFTER THE FONT LANDS.** Cinzel is **135px wider** across the headline.
- ⛔⛔ **`@keyframes` INSIDE A NON-MATCHING `@media` NEVER REGISTER.** Keyframes belong at base scope.
- ⛔⛔ **`drawImage` CLIPS AN OFF-FRAME SOURCE RECT AND LEAVES THE REST OF THE CANVAS STALE** (§2.1).
- ⛔⛔ **AN ID BEATS A LATE CLASS**, and **A SHARED SELECTOR REACHES ITS NEIGHBOUR** — scope per beat.
- ⛔⛔ **THE FRAME AVERAGE OF THIS FILM BELONGS TO NOTHING IN IT.** Measure the region you mean.
- ⛔⛔⛔ **A SCROLL ANIMATION IS DEAD IN A BACKGROUND TAB**, and the pane throttles rAF even when
  fronted. ⚠️ **A BACKGROUNDED PANE TAB ALSO SCREENSHOTS BLACK** — front it (`tabs_select`) first.
  ⚠️ It also freezes `skip-live` and every scrub-written value; a background tab reports stale.
  ⭐ **Hit this again this round**: a scroll listener did not fire until the tab was fronted.
- ⛔⛔ **A RELOAD CAN DROP THE PANE'S VIEWPORT EMULATION.** ⭐ **Hit this again this round** — a tab
  set to 768 came back as 375 and reported phone numbers. **READ `innerWidth` IN THE SAME PROBE AS
  THE NUMBER**, every time. It is the cheapest guard on this whole list.
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
| **`/`** | opens on his film at every band, the overlay cutting to it at f0, a second hero on the first screen at ALL THREE BANDS, three story beats with per-band composition and animation, **a pill skip control on every band**, **a sticky action bar on both narrow bands carrying Get a quote · WhatsApp · Call**, and a finished hero whose dead scroll is 131.8vh on desktop. ⭐⭐⭐ **The film's text is finished on desktop, phone and tablet** |
| **`/about/` + six internal** | the `.page-head` family; directors visible and bright at all bands. ⚠️ They carry the sticky bar's markup but it never rises there (§1) |
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
12. ⛔ **One device at a time unless he says otherwise.** ⭐ **All three bands are built. This round
    he worked across all three deliberately, naming each one** — that is his call to make, not a
    licence to assume it next time.
13. ⛔⛔ **TWO NUMBERS: WhatsApp → 07464 940287 (mobile). Every `tel:` → 0800 098 2812 (freephone).**
    Never "tidied" into one.
14. ⭐⭐ **THIS IS A DESIGN BUILD. NEVER RAISE THE MISSING FORM BACKEND AS A BLOCKER.**
15. ⛔⛔ **2 CREDITS MAXIMUM PER GENERATED IMAGE.** ⭐ **This round spent nothing.**
16. ⭐⭐⭐ **SITE SPEED IS KEY** — his own words.

---

## 11. OPEN — DO THESE NEXT

### ⭐⭐⭐ The ones that are costing money

1. ⭐⭐⭐ **HOW DO FILES ACTUALLY REACH `thadeusg3.sg-host.com`?** Asked twelve times.
   **Everything from D291 onward is still NOT live — including his video, every word of the film's
   copy, all three device builds and this round's contact controls.**
2. ⭐⭐⭐ **WHOSE ARGENTO DOES HE SELL?** His reference is a dense flecked grey-white; the site shows
   the supplier's veined marble-look. ⛔ Do not paste the Google image.
3. ⭐⭐ **THE STONE PHOTOGRAPHY AUDIT** — 24 of 132 verified; **92 Nile Stone tiles unverified**.
4. ⭐ **Pick a production host**; brotli; check the `.htaccess` cache rules survive it.
   ⚠️ **22.8 MB of film makes this urgent.**

### ⭐⭐ His call

5. ⭐⭐ **THE PHONE'S KITCHEN WASH REWORK** — §2 item 1, the plan is written.
6. ⭐⭐ **THE HEADLINE WORDING** — he is still taking the client's input. Three alternates parked.
7. ⭐ **THE HERO PLATE FOR THE ENDING.** Withdrawn at D328 because the re-cut moved the camera.
   **It needs a new still from him**, or it stays off.
8. ⭐⭐ **DOES THE FILM WANT SOUND?** The masters carry PCM; the site drops it. Never discussed.
9. ⭐ **THE 19 DRONE VIDEOS** (Hornchurch, Rickmansworth) — worth re-asking now the site carries film.
10. ⚠️ **THE GROWTH ON THE FIRST SCREEN IS OUT.** D350 added a 1.00→1.20 scale on his *"it should
    get bigger"*; D352 removed it. **He has not been asked whether he wants it back.** ⚠️ Note the
    ENDING now grows at every band, so the answer may be that the first screen should not.
11. ⭐⭐ **THE PHONE'S BAR** — the skeleton crosses his 11-Aug *"already formed from the top"* ruling.
    **One word puts it back: delete the two `header.bar.preform::after` lines.**
12. ⭐⭐ **A QUOTE CARD FOR THE PHONE AND TABLET.** D300 is desktop-only because he said so.
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
25. ⚠️ **The branch `tablet-round-d197-d200` receives every push** (the remote is configured to
    update both refs). It is a duplicate of `main` and should be deleted once item 1 is answered.

**Still waiting on the client:** whether Quartzite becomes a fourth range, 20mm vs 30mm pricing,
brackets for vanity tops / fireplaces / tables, and the £3k vs £3,850 three-slab discrepancy.

**CLOSED this round:** the tablet's trio and its call-button gate, the tablet's ending alignment
and spread, the sticky bar on the tablet, WhatsApp replacing Email on the bar, the floating pair's
stand-down under the bar, the phone's clear corner on the ending, the pill skip on the desktop, the
desktop's dead scroll, and the sticky bar's button spacing.

---

## 12. ⭐ HOW THIS CLIENT WORKS

⛔⛔⛔ **HIS COMPLAINT NAMES THE SYMPTOM CORRECTLY EVERY TIME. IF YOU "FIX" IT AND HE REPEATS
HIMSELF, YOU CHANGED THE WRONG VARIABLE — DO NOT CHANGE THE SAME ONE HARDER.**

⭐⭐⭐ **AND WHEN HE DESCRIBES A FEELING, THE MECHANISM BEHIND IT IS USUALLY EXACTLY WHAT HE SAYS.**
This round: *"the p at the end of WhatsApp is too close to the border"* was **4.73px against its
neighbours' 25.62** — he had eyeballed a 5:1 ratio and was right. *"You can't see the border of the
gradient"* was a linear gradient's own box edge. *"The arrow is too see-through"* was an 0.62 alpha.
**Take the words literally and go measure.**

⭐⭐ **HE REVERSES HIMSELF FREELY AND FAST, AND THAT IS FINE — SOMETIMES INSIDE ONE MESSAGE.** The
tablet's call button has moved three times in two days (D368 out, D369 in, D371 film-only). **The
way to make that cheap is to park everything and delete nothing**, labelled with why it went.
⚠️ **And when a reversal restores an older mechanism, say so plainly rather than presenting it as
new.** ⚠️ **THE LAST VERSION IN A MESSAGE IS THE ONE HE MEANS** (§0).

⭐⭐ **HE SENDS CORRECTIONS MID-TURN.** Finish the one you are on, read the new one before shipping,
then take them in his order. ⭐ **This round a mid-turn message arrived while the first instruction
was still being built and REPLACED half of it** — the tablet's trio survived, the ending's contact
buttons changed completely. **Read the whole queue before committing anything.**

⭐⭐ **HE ASKS FOR YOUR OPINION AND MEANS IT.** *"Let me know if you actually think that we should
center everything… I rate that's what we should do."* **Answer with a recommendation and a reason,
then build it** — he had already decided, and the reason is what he was checking.

⭐⭐ **HIS SCREENSHOTS MARK MOMENTS, NOT LAYOUTS.** Work out whether he is pointing at a STATE or a
TIME. He is usually pointing at a time. ⭐ **This round's was a state** — the finished hero — and the
give-away was that it showed the `.hs-phone` subtitle, which only the narrow bands render.

⛔⛔ **DO NOT ARGUE YOURSELF OUT OF SOMETHING HE ASKED FOR, AND DO NOT HAND HIM THE DILEMMA.**
**A real constraint is a problem to solve, not a question to return.** ⭐ When his ask and the frame
genuinely conflict, **size the thing to the frame and tell him the number**.

⛔⛔ **DO NOT ASK HIS PERMISSION. Commit, push, report.**

⭐⭐ **WHEN YOUR OWN WORK CAUSED THE FAULT, SAY SO IN THE FIRST LINE.** He is fine with that and not
fine with spin. ⭐ **And correct yourself mid-round when a measurement contradicts you** — D377's
grow factor was raised because my own first cut had quietly inverted a client ruling, and saying so
cost nothing.

⚠️ **HE SWEARS WHEN SOMETHING LOOKS WRONG, AND THE COMPLAINT IS ALWAYS REAL.**

- **Walk the journey, do not check the page.** ⭐⭐ **Look at the result before reporting it done.**
- **Measure, then claim** — and if you could not measure it, say so.
- ⭐⭐ **AND CHECK THE VIEWPORT IN THE SAME BREATH AS THE NUMBER.**

---

## 13. BUDGET AND THE DOCUMENT SET

⭐ **This round spent 0 credits.** Every figure was the browser's own layout engine and plain
arithmetic; no image, video or audio was generated.

| File | What it is |
|---|---|
| **`HANDOVER.md`** | ⭐ The single current state. §D is the register, **D1–D130, D132–D377**. §2 the standing rules, **§2s SITE SPEED**, §2a the supplier list. ⚠️ **THERE IS NO D131 ROW.** ⚠️ Section numbers are referenced from code comments — **do not renumber** |
| **`Website Demo/index.html`** | ⭐⭐ The whole landing design. Search `THE SCROLL FILM`, `THE DEAD SCROLL`, `THE STICKY ACTION BAR`, `skip intro`, `THE SLAB REVEALS ITS OWN CAPTION`, `THE PHONE'S OWN TRACK`, `THE TABLET'S OWN TRACK`, `THE KITCHEN BEAT ARRIVES BY THE SIDE`, `THE ENDING COMES TOWARDS YOU`, `THE OPENING FRAME AS A SECOND HERO`, `cine-line`, `bandGrade`, `THE TABLET BAND` |
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
| `HANDOVER-2026-08-24-phone-and-tablet-rounds-start-here.md` | ⭐ The START HERE this file replaces (D359–D370) — **read it for the film's text at every band**, which this round did not touch |
| `HANDOVER-archive-to-2026-08-06.md` | ⚠️ **Every design the client rejected, in his words.** Read before redesigning anything |

### ⭐ THIS ROUND'S COMMITS, IN ORDER

```
a78e55d  D371–D373  the trio clusters and swaps sides, the sticky bar reaches the tablet
                    carrying WhatsApp, the tablet's ending aligns to its own ink
907e632  D374–D376  the phone's corner clears on the ending, the skip goes pill everywhere,
                    the desktop's dead scroll loses half a screen
35acb43  D377       the sticky bar's buttons take their width from their own labels
```
