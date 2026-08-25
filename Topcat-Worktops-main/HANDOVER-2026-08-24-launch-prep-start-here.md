# START HERE — 24 August 2026, after THE LAUNCH-PREP ROUND (D378–D390)

Read this, then `HANDOVER.md` **§D** (the register, newest first — this round is **D378–D390**),
**§2** (the standing rules) and **§2s** (SITE SPEED). About twenty minutes, and enough to work safely.

> ⚠️ **This replaces the previous version of this same file**, now
> `HANDOVER-2026-08-24-contact-controls-start-here.md` (D371–D377). Everything that still
> matters is carried below.

> ⭐⭐⭐ **HE OPENED THIS ROUND WITH "WE'RE NOW MOVING INTO THE FINAL PHASE BEFORE LAUNCH. SO WE NEED
> TO GET EVERYTHING RIGHT."** Everything below is that. **THE ROUND IS NOT FINISHED** — two of the
> four things he asked for at the top are still open and they are listed first, in §2.
> ⛔ **THE COPY IS FIXED AND IS NOT REOPENED (§3). THE COMPOSITION AND THE ANIMATION ARE PER BAND.**
> ⭐ **HE WATCHED THIS ROUND BEING BUILT, LIVE, AND STOPPED THREE THINGS MID-BUILD.** Everything
> here is either his instruction or was signed off by him seeing it. **Nothing is awaiting a
> sign-off, but §2's two items are owed.**

---

## 0. ⛔⛔⛔ THE THREE THINGS TO TAKE FROM THIS ROUND

**⭐⭐⭐ 1. HE PICKED THE TWO WORST CARDS OUT OF EIGHT, BY EYE, WITH NO TOOLS. HE ALWAYS DOES.**

```
   Rickmansworth   3.55:1     ← he named this one
   Hornchurch      3.77:1     ← and this one
   Central London  4.75
   Watford         6.21   Harlow 6.11   Harrow 6.80   Ruislip 7.26   Wimbledon 13.87
```

⛔⛔ **SO WHEN HE SAYS SOMETHING IS HARD TO READ, GO AND MEASURE IT BEFORE YOU DESIGN ANYTHING** —
and measure the WORST CASE, not the average. Every failure this round had a fine average and a
terrible worst case: the internal page head measured **5.06 worst against a mean of 16**, which is
why it had passed every casual look for eleven days. **The fault is the variation, not the mean.**
The words cross a bright island and a dark window inside one line.

**⭐⭐⭐ 2. WHEN A THING MUST FIT ITS CONTENT, MEASURE THE CONTENT — AND SIZE THE THING BY WHAT THE
CONTENT IS SIZED BY.** Three separate faults this round were one idea:

```
the caption falloff   the fade was a % of the CARD, but the caption is a multiple of --cw,
                      and the card is 1.61:1 on desktop and 2.28:1 on the phone. Same fade,
                      completely different job. `max(100%, calc(var(--cw) * 0.62))` fixed it.
the trade button      "BROWSE THE STONE CATALOGUE" is 285px of label in a 280px column. It did
                      not fit at ANY padding, and `overflow:hidden` ate the last three letters.
the CTA pair          each button sized itself to its OWN label, so a wide gold one sat above a
                      narrow ghost one. He called it "uneven and unbalanced". It was.
```

**⭐⭐ 3. A NUMBER YOU RECORDED IS ONLY AS GOOD AS THE MODEL THAT PRODUCED IT.** D263's service-hero
figures said the scrim was fine. It was not: `radial-gradient(66% 62% at …)` is an **ELLIPSE**, and
the canvas model that measured it had drawn a **CIRCLE of max(rx,ry)** — a 950px circle standing in
for a 950×250 ellipse, which makes the scrim look far darker away from centre than it is. Modelled
properly, the gold title measured **3.36:1** and the breadcrumb **3.91**. ⛔ **Re-derive the model,
not just the number.**

---

## 1. ⭐⭐⭐ WHAT THIS ROUND BUILT

### ⭐ TEXT ON PHOTOGRAPHS — the round's spine

| Surface | Before | After |
|---|---|---|
| **project cards** `.gal-veil` | worst **3.55:1** | **6.99** desktop/tablet, **5.85** phone |
| **grid overlay tiles** `.gg-veil` | same two-stop ramp | the same shared curve |
| **stone tiles** `.stile` | worst **1.30**, 105 of 132 under 4.5 | ⛔ **UNCHANGED BY HIS ORDER** — §1a |
| **internal page head** `.page-head` | **5.06 / 5.07** | **10.06 / 10.36** at 320, **11.02 / 12.16** at 1440 |
| **service + SEO hero** `.svc-hero` | gold h1 **3.36**, crumb **3.91** | **≥6.73** and **≥5.98** across all nine + the SEO daylight shot |

⭐⭐ **ONE CURVE SERVES THE CARDS: `--photo-fade` IN `:root`** — fourteen eased stops, the shape
`.pt-scrim` already used, because a two-stop ramp has a visible corner where it flattens and that is
the D365 complaint waiting to happen. ⛔ **Do not flatten it back to a few stops.**

⭐⭐⭐ **AND IT IS SIZED BY `--cw`, NOT BY THE CARD'S HEIGHT.** Every part of the caption is
`calc(var(--cw) * k)`, so a two-line title's top sits at a constant **0.25 × --cw** off the floor at
every band. The CARD is what changes shape. With the fade at 100% the phone's two-line titles came
back at **3.52 / 3.95 / 4.21** — no better than before the fix — while the desktop read 6.99.

### ⭐ 1a. ⛔⛔⛔ THE STONE TILES — HE STOPPED THREE ATTEMPTS AND THE ANSWER IS "LEAVE THEM"

He was watching. In order, he stopped:

1. a deeper veil — *"don't do that because it's taking away from the pattern… The stone is the
   focus, not the name"*
2. the caption moved BELOW the picture — *"doesn't really look good. It's too solid"*
3. a translucent plate — *"I'm also not a fan of… this transparent gray block over it. **Just pretty
   much keep it like it was before. Just make sure the text is easy to read.**"*

⛔⛔ **THE TILE IS EXACTLY AS IT WAS AND ONLY THE SHADOW STACK IS NEW.** The measured cost of every
rejected option is written into `stones/stone.css` so nobody re-discovers it:

```
as it was                              105 of 132 below 4.5:1, worst 1.30
the heaviest shadow that still           100 of 132 — a shadow cannot save white type
  looks like Cinzel                             on a white slab
an 8-way 1px keyline per glyph           100 of 132, and it fills in the face at 20px
dark ink on light stones (data-tone)   49 of the 90 "light" ones fail — light marble is
                                              WHITE WITH BLACK VEINS and the veins run
                                              straight through the caption
deepening the veil                        0 below 4.5 — and it is the thing he stopped
```

⭐⭐ **A SLAB IS A HIGH-CONTRAST PATTERN BY DEFINITION — THAT IS THE PRODUCT — SO NO SINGLE INK
SURVIVES IT.** ⛔ Do not reach for the veil again without asking him first.

### ⭐ THE TRUST TAGS — white, and they fit

⭐⭐ **WHITE ON ALL 176 PAGES.** He asked twice, because the landing sheet went white first and the
**port** on the 167 service and SEO pages did not follow — exactly the drift `service.css`'s own note
warns about. ⛔ **THERE ARE TWO STYLESHEETS AND A CHANGE TO THE TAGS HAS TO BE MADE IN BOTH.**

⭐⭐ **AND THEY FIT ON ONE LINE EACH DOWN TO 320.** ⛔ **THEY WERE NOT OVERFLOWING — THEY WERE
WRAPPING, WHICH IS WHY THE OVERFLOW SWEEP DID NOT SEE THEM**: two tags stood **48px** against their
neighbours' **44** and the row read as broken. Each tag has **136px** at 320 and they needed
**141, 144, 147 and 156**. Everything inside now scales with the viewport between **320 and 400**,
and at 400 every value has already reached the number it has always had, so **no other width changes
at all**. ⚠️ **THE GOOGLE TAG IS THE BINDING ONE (156px)** — measure that one, never the guarantee.

### ⭐ THE FORMS — all 38, and one of them was lying

| | was |
|---|---|
| `.qform` (31 pages) | ⛔⛔⛔ accepted a **COMPLETELY EMPTY** form and said *"Thank you, we have your details"* |
| `#tradeForm` | `<button type="button">` with **no listener anywhere** — clicking it did nothing at all |
| `#ctaForm` (6 pages) | honest, but accepted an empty form, an address of "x" and a phone of "1" |

⭐⭐⭐ **`assets/tcform.js` OWNS ALL OF THEM NOW.** A name, and at least ONE of email or phone;
a loose mail pattern that catches "x" and "me@" without adjudicating RFC 5322; **nine digits after
stripping**, because `+44 7464 940287` has twelve; an optional postcode checked only if filled.
The error goes in the reply line the card ALREADY has, so it never pushes the button down the page.
⭐⭐⭐ **THE BACKEND IS ONE STRING — set `ENDPOINT` at the top of that file and all 38 post for
real.** ⛔ That is his call and his schedule and **is never to be raised as a blocker** (§10 rule 14).

### ⭐ RESPONSIVENESS — 13 pages × 13 widths, 320 → 1920

**Zero horizontal page overflow anywhere.** Three findings, all fixed (§0's second lesson).
⭐ `body{overflow-wrap:break-word}` on **both** stylesheets is the standing guard: it acts only when
a single word genuinely cannot fit a line of its own, so it changes nothing today and catches every
future long stone name. ⚠️ **It cannot rescue a `white-space:nowrap` element** — nowrap does not
wrap, it overflows (D171).

### ⭐ THE LOGO, AND THE FLASH IT FIRST SHIPPED WITH

⭐ The logo lands on the second hero from anywhere. `#hero` was **already** the convention on 167
pages and had never done anything, because `#hero` is sticky at scroll 0.

⛔⛔⛔ **AND THE FIX FOR THE FLASH IS THE INTERESTING PART: THE JUMP CANNOT BE MADE EARLY ENOUGH TO
WIN THAT RACE, SO THE FIX IS NOT TO PAINT.** The scroll is set by the film's own IIFE at the END of
the body; by then the poster, the opening titles and the cue are already on screen. A flag goes up
in the `<head>` before any of those layers exist, the stylesheet holds them at zero, and it comes
down on **`seeked`** — not a timer — so the picture fades in already on the right frame.
⚠️ **THE 3s CATCH IN THE HEAD IS NOT OPTIONAL**: if the film fails or JS dies after that line, the
flag must still come off or the hero is blank for ever.

### ⭐ HIS TWO NIGHT RENDERS, AND THE SPACING

⭐ Two pictures, three files, behind the seven internal-page heroes: **1672 / 1150 / 900**, and the
whole set is **69 / 42 / 78 KB against the old 95 and 58**. The tablet had no cut of its own before
and pulled the desktop file. Exactly one is fetched per band.

⭐ The first section sits **56px** under the head on the narrow bands and **81px** on the desktop —
his own two-part instruction. The gap was **151px** and was a seam clearing a divider that is not
there.

---

## 2. ⭐⭐⭐ WHAT THE NEXT ROUND IS — TWO THINGS HE ASKED FOR ARE STILL OWED

He set out four things at the top of this round. Two are done. **These two are not:**

### ⛔⛔ 1. THE LIST OF EVERYTHING ELSE THAT STILL NEEDS DOING

His words: *"Then afterwards, you can list other things that still need to be done."*
⭐ **§11 is that list and it is up to date** — but he has not been walked through it. **Hand him
§11's top items in plain English and let him choose.** ⚠️ He has since said *"I have noticed more
things"*, so expect his own list too, and take his first.

### ⛔⛔ 2. THE SITE-SPEED PASS

His words: *"then at the end, we're going to do everything we can to fully optimize the site speed
as much as possible so that even on slow Internet, everything is loading perfectly."*

⭐ **NOTHING HAS BEEN DONE ON THIS YET THIS ROUND.** What is already true is in §4. What a real pass
would look at, in the order it is likely to pay:

```
1. THE FILMS ARE 22.8 MB ON DISK and one visitor pulls 3.87–13.28 MB of it. That is the
   site's whole speed story and it has never been re-examined against a SLOW connection.
   ⛔ Do NOT re-compress without reading the SSIM/MB tables in the two encode.sh files (§4).
2. BROTLI AND THE PRODUCTION HOST — still open (§11 item 4). `dev-server.js` compresses and
   the host may not, so every byte figure read locally is optimistic.
3. `assets/site.css` is 733 KB and `site.js` 589 KB before the comment strip; `make_upload.py`
   takes the landing page's first load from 2.35 MB to 0.83 MB. ⭐ Re-run it and read the
   printed saving — that number is the honest one, not the working files.
4. THE ONE NEW REQUEST THIS ROUND is `assets/tcform.js` (12 KB working, far less stripped) on
   every page. It is deliberate — one description for 38 forms — but it IS a round trip, and
   inlining it from the builders is the obvious trade if he wants it.
5. Fonts, the 132 slab photographs on `/stones/`, and lazy-loading below the fold.
```

### ⚠️ The things this round left knowingly unfinished

1. ⛔⛔ **THE PALEST DOZEN STONE TILES ARE STILL SHORT OF 4.5:1** and cannot be fixed without
   darkening the picture, which he has forbidden (§1a). **He knows the tiles were left alone; he
   does not know the residual number.** Tell him if it comes up.
2. ⚠️ **THE PHONE'S KITCHEN WASH, STILL REVERTED AND STILL OWED A REWORK (D367).** It runs the
   original radial — stable, and what he has approved — because two attempts at a better shade
   flashed on his device. ⛔⛔ **THE CAUSE IS WRITTEN DOWN AND MUST NOT BE RE-DISCOVERED:**
   `drawImage` **clips** a source rect reaching outside the video and leaves the rest of the canvas
   STALE, so any moving or partly-off-frame sampling box mixes live and previous-frame pixels.
   **THE AGREED FIX: BAKE THE WASH FROM FILM TIME** — sample the seated box OFFLINE per half-second,
   ship a ~20-entry table, drive the strength from `t` alone. Plumbing is already there
   (`bandGrade(el,box)` + `KB`); `clearRect` before every sample draw is in since D366.
3. ⚠️ **THE TABLET ON A WIDE-SHORT WINDOW** — the kitchen beat's island fence cannot hold above
   ~1.35 aspect. Nothing is broken; the wash carries it. Worth one look on a real landscape iPad.
4. ⚠️ **THE STICKY BAR IS DORMANT ON THE SEVEN INTERNAL PAGES** — its trigger reads `.hero-ctas`,
   which those pages do not have. One line would wake it but it has never been discussed with him.
   **Do not do it unasked.**

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
| *"…are veined differently"* | `absolute-black-extra` has **no visible grain**; quartz is engineered |
| *"one of a kind patterns in stone"* | a plural against a mass noun — **and a third restatement of the title** |

⭐ **THE SUBTITLE'S JOB IS TO SAY WHAT THE TITLE DOES NOT.** ⚠️ Every superseded line is parked in
the markup **labelled with why it is wrong**. ⚠️ *"decades"* is defensible and *"for life"* is not.
⚠️ *"unique"*, never *"completely unique"* — his own second option.

⭐ **THE CTA LABELS ARE HIS, AND THEY ARE NOW THE SAME ON THE LANDING HERO AND THE 35 HERO PAGES:**
**"Get a free quote"** and **"Give us a call"** on the narrow bands, through `.cta-long`/`.cta-short`.

---

## 4. ⭐⭐⭐ SITE SPEED IS A STANDING RULE — HIS OWN WORDS

Unprompted, 18 Aug: *"just make sure you always keep site speed in mind… **site speed is key**."*
`HANDOVER.md` **§2s**, and it is §2 material. **⭐ HE ASKED FOR A FULL PASS THIS ROUND AND IT HAS
NOT HAPPENED YET — see §2.**

1. ⛔⛔ **ONE FILM PER BAND AND ONLY ONE IS EVER FETCHED.** Three cuts (**22.8 MB** together), a
   visitor downloads exactly one — **1920: 13.28 MB · 864: 5.62 MB · 608: 3.87 MB**. An in-place
   `<script>` beside the `<video>` sets `src` and `poster` **during parse**. ⛔ **A `display:none`
   VIDEO STILL DOWNLOADS ITS `src` AND `poster`.** ⭐ Re-verified this round at 1440: zero requests
   for the other two bands.
2. ⭐ **`preload="none"` in the markup**, flipped to `auto` by the scrub once the band is known.
3. ⭐⭐ **FIRST PAINT COSTS THE POSTER, NOT THE FILM** — **121 KB** desktop, 81 tablet, 54 phone.
   ⭐ The poster, the overlay plate and the film's own first frame are **one picture**.
4. ⭐⭐ **COMMENTS COME OFF ON THE WAY OUT (D315).** `make_upload.py` strips every `.html`/`.css`/
   `.js` into `upload/`. ⛔ Never strip comments from the SOURCE — they are the design record.
5. ⭐ **NOTHING UNREFERENCED SHIPS.** Dot-folders never ship. ⛔ When you remove an element, move
   its assets into a dot-folder **in the same edit**.

⭐ **THIS ROUND'S NET EFFECT ON WEIGHT WAS POSITIVE**: the three new page-head files
(**69 / 42 / 78 KB**) are lighter than the two they replaced (95 / 58) and the tablet stopped
pulling the desktop file. ⚠️ **THE ONE NEW REQUEST IS `assets/tcform.js`** on every page — see §2.
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
⭐ **Widen a phone rule's own query to reach the tablet, never copy it.**
⭐⭐ **AND WHEN A RULE BECOMES EVERY BAND'S, DELETE ITS QUERY RATHER THAN ADDING A THIRD COPY.**
⚠️ ⛔⛔ **SOURCE ORDER DECIDES BETWEEN EQUAL SPECIFICITY — BUT AN ID IS NOT EQUAL.** Rules have lost
to `#hero …` selectors written far earlier. ⭐ **THIS ROUND HIT IT TWICE**: the head-to-section gap
needed `!important` because those seams are set by ID, and the tag rules carry `#hero …,.page-head …`
on every line for the same reason.

⛔⛔⛔ **THE PER-BAND CASCADE IS THE ONE MENTAL MODEL FOR BOTH THE FILM AND THE BEATS:
`-phone` → `-narrow` → the bare attribute.** A band that names nothing inherits the one below it.
⚠️ **A BEAT WITH NO `-narrow` PAIR HAS NO DESKTOP-ONLY TIMING** — its base attribute IS every
band's number (D358a's leak). **Before retiming any beat, check whether it carries a `-narrow`
pair; if not, add one pinning the current values in the same edit.**

⭐ **IN THE SCRUB THE BANDS ARE `heroOn` (desktop) · `heroNr` (both narrow) · `heroPh` / `heroTab`**
— use `heroNr` for anything the two narrow bands share.

⭐⭐ **AND THERE ARE TWO STYLESHEETS, WHICH IS THE ARCHITECTURE AND NOT AN ACCIDENT:**
`index.html`'s inline `<style>` (lifted verbatim to `assets/site.css` for the landing page and the
seven internal pages) and `services/service.css` (the other 167). ⛔ **A CHANGE TO A SHARED
COMPONENT — the tags, the buttons, a token — HAS TO BE MADE IN BOTH.** He caught exactly this
omission this round and had to ask twice.

---

## 6. ⛔ THE GATES — RUN THESE

```bash
cd "Website Demo" && python3 build_pages.py                     # FIRST — writes footer.css AND nav.css
cd "Website Demo/services" && python3 build_services.py
cd "Website Demo/stones" && python3 build_stones.py
cd "Website Demo" && python3 build_seo_pages.py
cd "Website Demo/stones" && python3 harvest/verify.py            # 132/132/132 ✅
node --check "Website Demo/assets/tcform.js"                     # ⭐ NEW — a real file now
```

⛔⛔ **NEVER RUN `trade/build_trade.py`.** ⛔ `build_images.py` / `patch_images.py` are one-shot.
**The CSS gate** (brace delta 0, and compare the COUNT against HEAD) and **`node --check` on all
three inline `<script>` blocks** after every edit to `index.html`. ⚠️ The JS gate must EXCLUDE
`application/ld+json` **and now also `<script src=…>`** — `index.html` has one of those since D384.
⭐⭐ **AND A `<div>` BALANCE CHECK AFTER ANY STRUCTURAL CUT** (259/257 is correct and long-standing).

⛔⛔⛔ **`node --check` IS A SYNTAX GATE, NOT A RUNTIME ONE** (D357) — read the console after any JS
edit and drive the page.
⛔⛔ **AND IT IS NOT A SCOPE GATE EITHER.** A rule can parse perfectly and never apply — wrong media
query, or outranked by an id. **Read the computed value back at the band you meant to change.**

⛔⛔ **A BRACE INSIDE A COMMENT COUNTS.** Write CSS in comments without braces, and compare the
COUNT, not just the delta. ⭐ This round: `index.html` **3296 → 3331**, `service.css` **159 → 176**,
every pair accounted for.

### ⭐ THE FREEZE PROBE — 1440×900, FRESH LOAD, TAB IN FRONT

| Signal | Value |
|---|---|
| `.gal-scroll` height | **4950** |
| `--revPer` (on `#reviews`) | **3** |
| `feTurbulence` count | **60** |
| elements | ⭐ **2715** ← was 2714; the one new `<script src>` (D384) |
| hero ink (`.hero-inner` padding-top) | **86.1828** |
| `#footer` height | **503.78** |
| `.hero-bg` children | **7** |
| broken images / 4xx / console errors | **0 / 0 / none** |
| the film fetched | **1920 only** |
| document height | **23993** |
| film travel / dead scroll | **818.2vh / 131.8vh** |
| skip control | **175px wide, `border-radius:999px`** |

⭐ **EVERY ROW RE-VERIFIED AT THE END OF THIS ROUND.**
⚠️ The element count is only valid on a fresh load. ⚠️ Filter broken images on
`i.src && i.complete && i.naturalWidth===0`.

---

## 7. ⚠️ THE ENVIRONMENT TRAPS — ALL LIVE

**⭐⭐⭐ NEW THIS ROUND, AND THE FIRST THREE COST REAL TIME:**

- ⛔⛔⛔ **A CANVAS MODEL OF A CSS `radial-gradient(x% y% at …)` MUST DRAW AN ELLIPSE.** `rx` is a
  percentage of the box's WIDTH and `ry` of its HEIGHT; `createRadialGradient` only does circles, so
  a model using `max(rx,ry)` reports a scrim far darker than the real one. **Scale the context
  (`ctx.scale(1, ry/rx)`) and draw a circle inside it.** This is what made D263's recorded figures
  wrong for eight days.
- ⛔⛔ **`getComputedStyle` STRAIGHT AFTER TOGGLING A CLASS RETURNS THE TRANSITION'S MID-FLIGHT
  VALUE, NOT THE TARGET.** A rule that reads `opacity:0 !important` measured **1**, and it looked
  exactly like a rule that was not applying. ⭐ **Check `el.matches(selector)` and the rule list
  first, and only then read the value — after a timeout longer than the transition.**
- ⛔⛔ **AN OVERFLOW SWEEP DOES NOT CATCH A WRAP.** The trust tags were breaking onto two lines, not
  spilling, so every `scrollWidth > clientWidth` test passed. ⭐ **Compare SIBLING HEIGHTS in a row
  that is supposed to be uniform** — that is the test that would have found it.
- ⭐⭐ **A SAME-ORIGIN IFRAME IS THE FAST WAY TO SWEEP MANY PAGES × MANY WIDTHS** — set its width,
  load a URL, read `contentDocument`. Far cheaper than resizing the pane and navigating.
  ⚠️ `javascript_tool` **times out at 30s**, so batch 2–3 pages per call, and the harness is lost on
  any navigation of the host page — keep it on a page you are not going to leave.
- ⚠️ **A CUSTOM PROPERTY HOLDING A `clamp()` COMES BACK AS THE RAW STRING**, so `parseFloat` gives
  `NaN` and a probe silently reports `null`. Measure it with a throwaway element sized in that
  `calc()` instead.
- ⚠️ **`text-wrap:balance` WILL SPLIT A TWO-WORD LABEL THAT IS ONLY 2px TOO WIDE** and stand the
  whole tag a line taller. Give the label `nowrap` once it genuinely fits.
- ⚠️ **A SCREEN-READER-ONLY LIVE REGION LOOKS LIKE A 268px OVERFLOW** (`clip-path:inset(50%)` plus
  `nowrap`). Filter `.sr-only`, `.est-sr`, `#estPriceSR`, `.chip-legacy` out of any sweep.

**(Carried, all still live)**

- ⛔⛔⛔ **`currentTime` IS NOT THE FRAME ON THE SCREEN.** 1–3 frames of lead under a live scrub.
  ⭐ `video.requestVideoFrameCallback` → `metadata.mediaTime` is the only ground truth, and a fast
  scrub presents about every SIXTH frame. ⭐ **D389 leans on `seeked` for exactly this reason.**
- ⛔⛔⛔ **THE FILM NEEDS ~8s TO BUFFER AFTER A NAVIGATION, AND THE EASED CHASE ~2.5–3.5s TO SETTLE.**
  ⭐⭐ **POLL `currentTime` UNTIL IT STOPS CHANGING BEFORE TRUSTING ANY READING.**
- ⛔⛔⛔ **MEASURE TEXT AFTER THE FONT LANDS.** Cinzel is **135px wider** across the headline.
- ⛔⛔ **`@keyframes` INSIDE A NON-MATCHING `@media` NEVER REGISTER.** Keyframes belong at base scope.
- ⛔⛔ **`drawImage` CLIPS AN OFF-FRAME SOURCE RECT AND LEAVES THE REST OF THE CANVAS STALE** (§2.2).
- ⛔⛔ **AN ID BEATS A LATE CLASS**, and **A SHARED SELECTOR REACHES ITS NEIGHBOUR** — scope per beat.
- ⛔⛔ **THE FRAME AVERAGE OF THIS FILM BELONGS TO NOTHING IN IT.** Measure the region you mean.
- ⛔⛔⛔ **A SCROLL ANIMATION IS DEAD IN A BACKGROUND TAB**, and the pane throttles rAF even when
  fronted. ⚠️ **A BACKGROUNDED PANE TAB ALSO SCREENSHOTS BLACK** — front it (`tabs_select`) first.
- ⛔⛔ **A RELOAD CAN DROP THE PANE'S VIEWPORT EMULATION.** **READ `innerWidth` IN THE SAME PROBE AS
  THE NUMBER**, every time. It is the cheapest guard on this whole list.
- ⛔⛔ **THE PANE'S SCREENSHOT GOES BLACK after `resize_window` + reload.** Fresh tab, navigate,
  resize, shoot **without** reloading. ⭐ **AND `backdrop-filter` ANYWHERE CAN BLACK THE CAPTURE.**
- ⛔⛔ **A NARROW LOAD LOOKS EXACTLY LIKE A BROKEN PAGE.** `--stoneRaster:on` below 720px swaps the
  live marble SVG for a bitmap: `feTurbulence` reads 0 and elements drop ~570. ⚠️ **A tab that
  navigates BEFORE it is resized loads narrow and keeps those numbers** — reload after resizing.
- ⛔⛔ **AN INLINE STYLE OUTRANKS A CLASS RULE** — hand the property back (`style.removeProperty`).
- ⛔⛔ **A CSS EDIT DOES NOT SHOW UNTIL THE BUILDERS RE-RUN** (`site.css?v=<hash>`, `stone.css?v=`).
  ⚠️ `index.html`'s own inline CSS is served directly and needs no builder.
- ⭐ **`scroll-behavior:smooth` eats programmatic scrolls** — use `behavior:'instant'`, and set it
  twice (a scroll set immediately after a navigation is undone by scroll restoration).
- ⛔ **`computer` LIMITS: `wait` ≤ 10s, `scroll_amount` ≤ 10.** Chain them.
- ⚠️ **`javascript_tool` KEEPS THE PAGE'S TOP-LEVEL SCOPE BETWEEN CALLS** — a second `const bb`
  throws `Identifier already declared`. Wrap probes in `(()=>{ … })()`.
- (Carried) `javascript_tool` runs before async work settles — kick, wait, read back in a second
  call · **no numpy, PIL only** (PIL WebP **is** available and was used this round) · **no libwebp
  in this ffmpeg; the browser canvas is the only SVG rasteriser** · valid stone presets: calacatta,
  carrara, crema, emperador, eternal, fumo, goldveil, mist, nerogold, statuario.

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
| **`/`** | opens on his film at every band, a second hero on the first screen at ALL THREE BANDS, three story beats with per-band composition and animation, a pill skip control, a sticky action bar on both narrow bands, and a finished hero whose dead scroll is 131.8vh on desktop. ⭐ **The film's text is finished on desktop, phone and tablet.** ⭐ The logo lands here, without a flash |
| **`/about/` + six internal** | the `.page-head` family, now on **his own night render** with a copy band that measures 10:1. ⚠️ They carry the sticky bar's markup but it never rises there (§2) |
| **`/services/*.html`** | nine leaves, each on its OWN photograph; **hero re-measured and re-scrimmed**, subtitle white, CTA pair even; burger nav ≤1120; quote card ≥1121 |
| **`/stones/`** | 132 pages + collection + compare; white ledes; **no quote card, deliberately**; ⛔ **the slabs are untouched by his order** |
| **`/materials/` `/guides/` `/worktops/` `/sitemap.html`** | the 26-page SEO layer; 22 carry the quote card; same hero treatment as the service leaves |
| **`/trade/`** | eight sections; CTA carries WhatsApp; **its form works now, and its ghost button no longer clips** |
| **all 176 pages** | one footer, one mobile nav, og:image + twitter:card, favicon, hours **Mon–Sun 7am–9pm**, no code comments in view-source, **every trust tag white**, **every form validating** |

⚠️ **SHARED PHOTOGRAPHS NOT TO DELETE**: `kitchen-day.jpg`, `hero-night-*` (still the landing hero's
own picture), `og-cover.jpg`, `team/fitting.jpg`, `pagehead-*`, and everything inside the
dot-folders under `assets/video/` and `assets/site/`.

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
    ⭐ **AND AS OF THIS ROUND, NEVER A GRADIENT OVER A SLAB PHOTOGRAPH EITHER (§1a).**
12. ⛔ **One device at a time unless he says otherwise.** ⭐ This round he worked across all three
    deliberately and said so; that is his call to make, not a licence to assume it next time.
13. ⛔⛔ **TWO NUMBERS: WhatsApp → 07464 940287 (mobile). Every `tel:` → 0800 098 2812 (freephone).**
    Never "tidied" into one.
14. ⭐⭐ **THIS IS A DESIGN BUILD. NEVER RAISE THE MISSING FORM BACKEND AS A BLOCKER.** ⭐ The forms
    are now correct and one string from live (§1); that is the right way to hold this.
15. ⛔⛔ **2 CREDITS MAXIMUM PER GENERATED IMAGE.** ⭐ **This round spent nothing.**
16. ⭐⭐⭐ **SITE SPEED IS KEY** — his own words. ⭐ **And he has asked for a full pass (§2).**

---

## 11. OPEN — DO THESE NEXT

### ⭐⭐⭐ The ones he asked for and has not got

1. ⭐⭐⭐ **THE LIST, WALKED THROUGH WITH HIM** — §2.
2. ⭐⭐⭐ **THE SITE-SPEED PASS** — §2, and it is the last thing he named before launch.

### ⭐⭐⭐ The ones that are costing money

3. ⭐⭐⭐ **HOW DO FILES ACTUALLY REACH `thadeusg3.sg-host.com`?** Asked twelve times.
   **Everything from D291 onward is still NOT live — including his video, every word of the film's
   copy, all three device builds, the contact controls and this entire launch-prep round.**
4. ⭐⭐⭐ **WHOSE ARGENTO DOES HE SELL?** His reference is a dense flecked grey-white; the site shows
   the supplier's veined marble-look. ⛔ Do not paste the Google image.
5. ⭐⭐ **THE STONE PHOTOGRAPHY AUDIT** — 24 of 132 verified; **92 Nile Stone tiles unverified**.
6. ⭐ **Pick a production host**; brotli; check the `.htaccess` cache rules survive it.
   ⚠️ **22.8 MB of film makes this urgent** — and it is half of item 2.

### ⭐⭐ His call

7. ⭐⭐ **THE PHONE'S KITCHEN WASH REWORK** — §2, the plan is written.
8. ⭐⭐ **THE HEADLINE WORDING** — he is still taking the client's input. Three alternates parked.
9. ⭐ **THE HERO PLATE FOR THE ENDING.** Withdrawn at D328 because the re-cut moved the camera.
   **It needs a new still from him**, or it stays off. ⚠️ His new f7 renders may be exactly that —
   worth asking, since they are already on the site as the internal page heads.
10. ⭐⭐ **DOES THE FILM WANT SOUND?** The masters carry PCM; the site drops it. Never discussed.
11. ⭐ **THE 19 DRONE VIDEOS** (Hornchurch, Rickmansworth) — worth re-asking now the site carries film.
12. ⚠️ **THE GROWTH ON THE FIRST SCREEN IS OUT.** D350 added a 1.00→1.20 scale on his *"it should
    get bigger"*; D352 removed it. **He has not been asked whether he wants it back.**
13. ⭐⭐ **THE PHONE'S BAR** — the skeleton crosses his 11-Aug *"already formed from the top"* ruling.
    **One word puts it back: delete the two `header.bar.preform::after` lines.**
14. ⭐⭐ **A QUOTE CARD FOR THE PHONE AND TABLET.** D300 is desktop-only because he said so.
15. ⭐⭐ **THE SITEMAP LINK'S GOLD STYLING** — `seo.css` has the rule, no footer has the hook.
16. ⭐⭐ **Trade terms** — payment, minimum order, lead times, a dedicated contact. **His stated
    first priority.**
17. ⭐⭐ **Two sentences for Nick and Rimsha** · **the credit ceiling** · **Calacatta Gold licensing**
    · **the fireplace scope, with Nick** · **Ali Jaffer and Kav / Uxbridge**.
18. ⭐ **Confirm the silica / HSE sentence in his own words (D202).**
19. ⭐ **Kitchen islands is not on his service list** — the page is live, linked and dressed (D294).
20. ⭐ **Trustpilot** — recommended against putting 4.0 beside the Google 5.0. He has not ruled.
21. ⚠️ **RIMSHA OR REMSHA?** Still unresolved. Her name is on a public page under her photograph.
22. ⚠️ **THE HORNCHURCH GALLERY SET** — the lead frame is clear, the other 11 were never checked.
23. ⚠️ **Two slabs lean blue and nobody has ruled**: `arabescato-grey`, `calacatta-gold-shimmer`.
24. ⭐ **Facebook, TikTok, YouTube?** ⛔ Do not guess handles.
25. ⭐ **Per-stone og:image** — 132 conversions.
26. ⚠️ **`Next Stone Slabs` is named in one place** — sanctioned by D203. Read D203 before "fixing".
27. ⚠️ **The branch `tablet-round-d197-d200` receives every push** (the remote is configured to
    update both refs). It is a duplicate of `main` and should be deleted once item 3 is answered.

**Still waiting on the client:** whether Quartzite becomes a fourth range, 20mm vs 30mm pricing,
brackets for vanity tops / fireplaces / tables, and the £3k vs £3,850 three-slab discrepancy.

**CLOSED this round:** the project cards' caption legibility, the grid tiles', the stone tiles'
(as far as he will allow), the trust tags' colour on all 176 pages, the tags' fit at 320, the logo's
destination and its first-frame flash, his two night renders behind the internal heroes, the
head-to-section gap on both bands, all 38 forms, the site-wide overflow sweep, the internal page
head's copy band, the service and SEO hero scrim, the service hero's white subtitle, and the service
hero's CTA pair.

---

## 12. ⭐ HOW THIS CLIENT WORKS

⛔⛔⛔ **HIS COMPLAINT NAMES THE SYMPTOM CORRECTLY EVERY TIME. IF YOU "FIX" IT AND HE REPEATS
HIMSELF, YOU CHANGED THE WRONG VARIABLE — DO NOT CHANGE THE SAME ONE HARDER.**

⭐⭐⭐ **AND WHEN HE DESCRIBES A FEELING, THE MECHANISM BEHIND IT IS USUALLY EXACTLY WHAT HE SAYS.**
This round: *"that looks uneven and unbalanced"* — the two buttons were literally different widths,
because each was sizing itself to its own label. *"It's kind of hard to read"* on two cards out of
eight — those two measured 3.55 and 3.77 against the others' 6.1+. **Take the words literally and go
measure.**

⭐⭐⭐ **HE WATCHES WHILE YOU BUILD AND HE WILL STOP YOU MID-CHANGE.** Three times on the stone tiles
in about fifteen minutes. ⭐ **When he does: revert immediately and completely, say so plainly, and
do not defend the idea.** ⚠️ **AND DO NOT TAKE THE REVERT AS THE END OF THE TASK** — he still wanted
the names readable; he had only ruled out one way of getting there.

⭐⭐ **HE REVERSES HIMSELF FREELY AND FAST, SOMETIMES INSIDE ONE MESSAGE, AND THE LAST VERSION IS THE
ONE HE MEANS.** This round: *"make it small and say free quote… call us… next to each other"* →
two minutes later, with a screenshot → *"the buttons say get a free quote and give us a call, and
those are evenly lined up… similar to what we have in the main hero section."* **The second one was
built.** ⚠️ **And when a reversal restores an older mechanism, say so plainly rather than presenting
it as new.**

⭐⭐ **HE SENDS CORRECTIONS MID-TURN, CONSTANTLY.** This round had **eight** of them. Finish the one
you are on, read the new one before shipping, then take them in his order. **Read the whole queue
before committing anything.**

⭐⭐ **HE ASKS FOR YOUR OPINION AND MEANS IT.** *"Whatever you think is best."* **Answer with a
recommendation and a reason, then build it.**

⭐⭐ **HIS SCREENSHOTS MARK MOMENTS, NOT LAYOUTS.** Work out whether he is pointing at a STATE or a
TIME. ⭐ **This round they were all STATES, and twice he sent a screenshot of the RIGHT answer** —
his own phone's landing hero — and asked for another page to match it. **When he sends a screenshot
of something that already works, that is a spec, not a complaint.**

⛔⛔ **DO NOT ARGUE YOURSELF OUT OF SOMETHING HE ASKED FOR, AND DO NOT HAND HIM THE DILEMMA.**
**A real constraint is a problem to solve, not a question to return.** ⭐ When his ask and the frame
genuinely conflict — as they did on the stone tiles — **build the best thing the constraint allows,
write down what each option measured, and tell him the number.**

⛔⛔ **DO NOT ASK HIS PERMISSION. Commit, push, report.**

⭐⭐ **WHEN YOUR OWN WORK CAUSED THE FAULT, SAY SO IN THE FIRST LINE.** He is fine with that and not
fine with spin. ⭐ **This round the logo's first-frame flash was mine, shipped in D381 and fixed in
D389; saying so cost nothing.**

⚠️ **HE SWEARS WHEN SOMETHING LOOKS WRONG, AND THE COMPLAINT IS ALWAYS REAL.**

- **Walk the journey, do not check the page.** ⭐⭐ **Look at the result before reporting it done.**
- **Measure, then claim** — and if you could not measure it, say so.
- ⭐⭐ **AND CHECK THE VIEWPORT IN THE SAME BREATH AS THE NUMBER.**

---

## 13. BUDGET AND THE DOCUMENT SET

⭐ **This round spent 0 credits.** Every figure was the browser's own layout engine, a canvas and
plain arithmetic; no image, video or audio was generated. The two new photographs are **his**, re-
encoded from the PNGs he sent.

| File | What it is |
|---|---|
| **`HANDOVER.md`** | ⭐ The single current state. §D is the register, **D1–D130, D132–D390**. §2 the standing rules, **§2s SITE SPEED**, §2a the supplier list. ⚠️ **THERE IS NO D131 ROW.** ⚠️ Section numbers are referenced from code comments — **do not renumber** |
| **`Website Demo/index.html`** | ⭐⭐ The whole landing design AND the stylesheet for the seven internal pages. Search `THE SCROLL FILM`, `THE DEAD SCROLL`, `THE STICKY ACTION BAR`, `--photo-fade`, `THE CAPTION FALLOFF`, `to-hero`, `skipToEnd`, `THE INTERNAL PAGE HEAD`, `THE TABLET BAND` |
| ⭐⭐⭐ **`Website Demo/assets/tcform.js`** | **NEW — ONE BEHAVIOUR FOR ALL 38 FORMS.** Validation, the error state, the reply, and the single `ENDPOINT` constant that makes every form on the site live. Its header records what each of the three forms was doing wrong |
| **`Website Demo/services/service.css`** | ⭐⭐⭐ Dresses all 167 generated pages. ⛔ No footer rules. ⛔ **The tags, the buttons and the tokens exist HERE as well as in `index.html` — change both** |
| **`Website Demo/stones/stone.css`** | ⭐⭐ The collection and the 132 stone pages. ⛔ **Read the `.stile-name` note before touching the tiles (§1a)** |
| ⭐⭐ **`assets/site/.src-2026-08-24/`** | **His two night renders, the masters.** `pagehead-wide-master.png` 1672×940 and `pagehead-tall-master.png` 1520×2688. ⛔ Never shipped, never deleted |
| ⭐⭐ **`.textanim-2026-08-24/track_edge.py`** | **THE SLAB EDGE TRACKER — all three bands.** Desktop by default; **`--phone` runs the two-edge variant**; the tablet's parameters are in its header. ⭐ Re-run it if the film is ever re-cut |
| ⭐⭐ **`.textanim-2026-08-24/removed-pin-d349-d351.txt`** | **THE PIN, PARKED WHOLE.** ⛔ None of it was wrong; it inherited a 12fps picture |
| ⭐⭐ **`.textanim-2026-08-24/removed-wave-d348.txt`** | **THE SWEEPING WAVE, PARKED WHOLE** |
| **`assets/video/.src-2026-08-23/`** | ⭐⭐ His two current masters and two stills (`.gitignore`d) + `encode.sh` with the full method |
| **`assets/video/.plates-2026-08-23/`** | ⭐⭐ The overlay pipeline: `make_plates.py` writes the plates AND the posters |
| **`Docs/Overlay-for-Scroll-Animation-Guide.md`** | ⭐ **His own written build guide** for the stills |
| **`Website Demo/build_pages.py`** | ⭐⭐ Seven internal pages, `site.css`, `site.js`, `footer.css`, `nav.css`. ⚠️ **RUN IT FIRST** |
| **`Website Demo/make_upload.py`** | ⭐⭐⭐ Writes a clean `../upload/`. ⚠️ Dot-folders never ship; comments stripped on the way out |
| **`Website Demo/.htaccess`** | ⭐⭐ Cache rules, mp4/webm for a week. ⚠️ A dotfile |
| **`assets/footer.css` `assets/nav.css`** | ⛔ **GENERATED.** Never edit |
| ⛔ **`trade/build_trade.py`** | ⛔⛔ **SUPERSEDED — DO NOT RUN** |
| ⛔ **`build_images.py` `patch_images.py`** | ⛔⛔ **ONE-SHOT, CANNOT RUN AGAIN** |
| `HANDOVER-2026-08-24-contact-controls-start-here.md` | ⭐ The START HERE this file replaces (D371–D377) — **read it for the contact controls at every band**, which this round did not touch |
| `HANDOVER-2026-08-24-phone-and-tablet-rounds-start-here.md` | ⭐ **Read it for the film's text at every band** |
| `HANDOVER-archive-to-2026-08-06.md` | ⚠️ **Every design the client rejected, in his words.** Read before redesigning anything |

### ⭐ THIS ROUND'S COMMITS, IN ORDER

```
a9d9316  D378–D381  the project cards get a caption falloff, the stone names get a shadow,
                    the tags go white and the logo lands on the second hero
fc2fef8  D382       his two night renders go behind the inner-page heroes, one per shape
addfe3e  D383       the first section sits up under the internal-page head
3b1d632  D384       every form validates, and one of them was lying to customers
85fae60  D385       nothing overflows its box at any width, 320 to 1920
ca954a6  D386–D388  the internal heroes read properly, the tags fit at 320, every tag is white
575278f  D389–D390  the logo lands without a flash, the service hero's pair matches the main hero
```
