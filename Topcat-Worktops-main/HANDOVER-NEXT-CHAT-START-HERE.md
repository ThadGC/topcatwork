# START HERE — 25 August 2026, the LAUNCH chat (D423–D437 landed, `upload/` now ships in the repo)

Read this, then `HANDOVER.md` **§D** (the register, newest first — this round is **D423–D437**),
**§2** (the standing rules) and **§2s** (SITE SPEED). About twenty minutes, and enough to work safely.

> ⚠️ **This replaces the previous version of this same file**, now
> `HANDOVER-2026-08-25-film-and-hero-round-start-here.md` (D416–D422).

> ⭐⭐⭐ **THE TWO FAULTS THAT OPENED THE LAST ROUND ARE CLOSED, AND THEY WERE BOTH REAL.**
> The film glitched because it was **24fps** and no engine tuning can invent frames that do not
> exist — it is **60fps** now. The hero text differed on his machine because half the composition
> was keyed to the **window** while the picture is keyed to **cover-scale** — the whole first screen
> and the story layer now live in the **film's own coordinates**.
> ⛔ **WHAT IS LEFT IS THE LAUNCH ITSELF, AND ONE THING NOBODY HAS EVER TESTED: A REAL EMAIL.**

---

## 1. ⛔⛔⛔ THE FIVE THINGS THAT WOULD HAVE SAVED THE LAST ROUND

Every one of these cost a cycle. Read them before touching anything.

**⭐⭐⭐⭐ 1. `assets/site.css` AND `assets/site.js` ARE LIFTED OUT OF `index.html` VERBATIM AT BUILD
TIME.** Editing them by hand *looks* like it works and the next `build_pages.py` throws it away.
**This was hit TWICE in one round** and was caught only by driving the pages — the 167 generated
pages took a change and the seven internal ones did not. ⭐ **`services/service.css` is the only
one of the three that is a real source you may edit directly.**

**⭐⭐⭐⭐ 2. USE THE iOS SIMULATOR. IT IS SET UP AND IT IS THE ONLY PLACE A WHOLE CLASS OF FAULT
SHOWS.** Three rounds were spent measuring a desktop harness that reported everything clean while
he watched the site fail on a phone. Real mobile Safari found the frozen film in ten minutes.
```bash
xcrun simctl boot 577F5380-1735-4EA3-BBCF-398EBD0C2672      # iPhone 17
```
then `control attach`, `control open_url http://<ip>:5501/`, `control touch_path` to drive it.
⚠️ A fast `swipe` often does not register — use a multi-point `touch_path`. ⭐⭐ **AND PUT A
READOUT ON THE PAGE**: a `?diag` overlay printing `innerHeight`, document height, scrollY and the
engine's own state is what turned "it's glitching" into `sk0 seeking1 pend1`. Build it, use it,
delete it before shipping.

**⭐⭐⭐ 3. NOTHING INSIDE A SCALED BLOCK MAY CARRY ITS OWN SCALE.** `.cine-hero` carries
`scale(var(--heroScale))`. A `vw` size, a `--uipx` size or a `vw` measure inside it is scaled
TWICE and drifts against everything scaled once. **This trap has now cost three separate rounds**
— the title's `5vw` (D418b), the subtitle's `--uipx` (D423), the measure's `46vw` (D437).

**⭐⭐⭐ 4. A BOX IS NOT INK, AND A LINE MUST BE MEASURED UNDER ITS OWN x RANGE.** D432c moved the
wrong element because I compared the island's top edge against the *subtitle's box* bottom while
reading the island under the *title's* width — two different rows of the composition. The real
numbers were 74 film px of room, not 2. ⭐ Use a `Range` over the text and take `getClientRects()`.

**⭐⭐ 5. A CUSTOM PROPERTY IS INHERITED FROM WHERE IT IS DECLARED.** `header.bar{--barH:…}` is
visible to the bar and nothing else — `#services` kept reading the stale base value and spent
92.58px of a 640px window on padding. Declare shared numbers on `:root`.

---

## 2. ⭐⭐⭐ THE FILM — WHAT IT IS NOW

```
60fps by motion interpolation      2651 frames · 44.1833s · 2.56px of scroll per frame
1920 → 24.5 MB · 864 → 10.7 MB · 608 → 7.7 MB     (+12–16%, one ever fetched, ?v=6)
recipe                             assets/video/.src-2026-08-23/encode60.sh
```

⭐⭐ **THE MASTERS ARE 24fps AND THAT IS WHY THIS WAS NECESSARY.** At 24fps the desktop film moved
**6.4px of scroll per frame** while a slow trackpad scroll delivers 1–3px per animation frame, so
the picture changed every 2nd–6th frame and every change was 41ms of camera motion. ⛔ Two rounds
of chase/ease/threshold tuning failed because **no engine can invent a picture between two frames
that do not exist.**

### ⚠️ THE FOUR CONSTANTS, AND WHAT EACH ONE IS

| constant | is | ⛔ is NOT |
|---|---|---|
| `FPS` **60** | the file's rate | anything to do with the tables |
| `SRCFPS` **12** | the grid the slab-reveal tables were TRACKED on (`track_edge.py` line 8) | the film's rate — **D416 conflated these and silently turned the reveal off** |
| `EASE` 0.15 | the chase's pull, **per 1/60s**, dt-normalised | a per-animation-frame constant |
| `SEEK_STALL` 140ms | how long a seek in flight is trusted | optional — without it iOS deadlocks |

⭐ **The chase never closes slower than the film's own rate**, so a fling plays to a stop instead
of trailing off into single frames; and under a slow scroll the remaining distance is under that
floor, so the playhead sits EXACTLY on the scroll.

⛔⛔ **THE DECODER IS WOKEN WITH ONE `play()`/`pause()` ON `loadeddata`.** A muted `playsinline`
video that has never decoded a frame is the case Safari will not scrub. ⚠️ `muted` and
`playsinline` must stay on the element or iOS rejects the `play()` and the film never scrubs.

---

## 3. ⭐⭐⭐ THE FILM'S COORDINATE SYSTEM — READ BEFORE MOVING ANY COPY ON THE LANDING PAGE

The film is `object-fit:cover`: it scales by **max**(W/1920, H/1080) and is centred. Anything keyed
to `vw`/`vh` moves to a **different law** than the picture, so the gap between a word and the slab
was a different number on every window shape. Three variables fix that:

```
--filmU    ONE FILM PIXEL, as a CSS length      (0.83333px at 1440x900)
--filmX    where the film's left edge lands     (-66px at 1440x900)
--filmY    where the film's top edge lands      (0px at 1440x900)
```

Every desktop story value is a measurement taken off the 1920×1080 frame times `--filmU`.

| | at 1440×900 | across 1121×700 → 2560×1200 |
|---|---|---|
| slab beat, title ink | y 224–341 | **200–1001, identical** |
| slab beat, subtitle ink | — | **216–630, identical** |
| first screen, title ink top | 224 | **224–229** |
| kitchen beat | 207 (30.6 above the slab beat) | 40 / 57 film px clear of the island |

⚠️ **`--filmX` IS NOT `(vw − filmWidth)/2` — `.hero-bg` BLEEDS**, measuring **1468px inside a
1440px window**. Derive anchors from the measured box.
⭐ `revealTick()` needs no change when copy moves: it reads live layout.
⛔ **Phone and tablet are NOT on this anchor yet.** He has not asked; the offer is open (§6.1).

---

## 4. ⭐⭐ THE MOBILE JITTER — ONE CAUSE, AND IT IS CLOSED

Every mobile browser collapses its address bar **as you scroll**, firing `resize` at each step.
Fourteen handlers on this page write layout from `window.innerHeight`, so one swipe re-laid the page
out dozens of times and the document grew and shrank under the finger. **It is self-feeding**: the
jump changes scroll velocity, which moves the bar again.

⭐ A capture-phase listener in the head swallows a resize that is **only** the address bar — same
width, height change ≤140px, band ≤1120. ⚠️ It must be registered FIRST and with `capture:true`.
⭐ The film's own divisor is held still separately (`vpH` in `measure()`).

**Verified on real iOS Safari:** `innerHeight` moved 714↔754 through a whole swipe while document
height stayed **constant**, **zero** backwards scroll jumps, **zero** resize events reached any
handler.

---

## 5. ⭐⭐⭐ THE LAUNCH — WHAT IS DONE AND WHAT IS LEFT

### ⭐ The delivery flow CHANGED this round (D434)

⛔⛔ **`upload/` IS COMMITTED NOW.** His instruction: *"The dev should be able to just take it as is
and upload it."* So the dev pulls `main` and drops **the contents of `Topcat-Worktops-main/upload/`**
into `public_html`. No python, no build step.

⛔⛔⛔ **BUT `make_upload.py` MUST STILL RUN BEFORE THE FINAL PUSH OF EVERY ROUND**, or the folder in
git is last round's site. It refuses a stale build, which is the only guard that makes this safe.
⚠️ 103 MB, 643 files, and the builders re-stamp every HTML file each run, so most of them re-commit.

### ⛔ The launch checklist — in order

1. ⭐⭐⭐ **ONE REAL TEST SUBMIT** on the live site → check info@'s inbox **and its spam folder**.
   ⛔⛔ **REAL MAIL HAS NEVER BEEN SENT AND CANNOT BE VERIFIED FROM THIS LAPTOP.** If it lands in
   spam the fix is SPF for `website@topcatworktops.co.uk` at the host — DNS, not code.
2. ⭐⭐⭐ **THE DEV UPLOADS** → then **flush SiteGround's dynamic cache in Site Tools** (D289). The
   films changed file AND cache-buster this round (`?v=6`) and every stylesheet has a new hash.
3. ⭐⭐ **HIS THREE LEGAL CONTRADICTIONS** — his to rule on, and they are on a live page: the 2-week
   workmanship line against the ten-year guarantee, the Financial Ombudsman route that does not
   cover worktops, and the `.com` address where the business is `.co.uk`.
4. ⭐⭐ **THE PRIVACY POLICY'S THREE MISSING FACTS** — ICO number, retention period, mail/CRM
   processor. ⛔ Inventing any of them is the guessing he forbade.
5. ⭐ Then it is live. **The site itself passed its audit** (15 pages × 13 widths, 13,208 links).

---

## 6. ⭐ OPEN — OWED ANSWERS

1. ⭐⭐ **Phone and tablet on the film anchor?** Desktop is done (§3). Their crops and compositions
   are his approved ones; the same measurement per band is offered and not yet asked for.
2. ⭐⭐ **Did the test email arrive at info@, out of spam?**
3. ⭐⭐ **His three legal contradictions** and **the privacy policy's three facts** (§5).
4. ⭐⭐ **The autoreply address** — he creates it, then flip `$SEND_AUTOREPLY` in send.php.
5. ⭐⭐ **`#estCta` "Get your exact quote"** — to /contact/ as well? (D409 kept it on `#cta` because
   it carries the estimate and attachments; one word moves it.)
6. ⭐⭐ **Mid-page CTAs on the materials, guides and county families too?** (never asked)
7. ⭐⭐ Whose Argento · the 92 unverified Nile Stone tiles · the phone's kitchen-wash rework
   (⛔ cause written down, D367: `drawImage` clips an off-frame source rect and leaves the canvas
   STALE; agreed fix is BAKE THE WASH FROM FILM TIME) · the headline wording · film sound · the 19
   drone videos · the phone bar's preform · a quote card for phone/tablet · the sitemap link's gold
   (`foot-sitemap` awaits its hook) · trade terms (his stated first priority) · Nick and Rimsha's
   sentences · **RIMSHA OR REMSHA** · the Hornchurch set · the two blue-leaning slabs · social
   handles (⛔ never guess) · per-stone og:image · `Next Stone Slabs` naming (D203 sanctions it) ·
   Trustpilot · Calacatta Gold licensing · the palest dozen stone tiles (short of 4.5:1; he knows).
8. ⚠️ **The branch `tablet-round-d197-d200`** still receives every push. Delete once the dev
   confirms pulling from `main` works.

**Still waiting on the client:** Quartzite as a fourth range, 20mm vs 30mm pricing, brackets for
vanity tops / fireplaces / tables, the £3k vs £3,850 three-slab discrepancy.

---

## 7. ⚠️ THE ENVIRONMENT TRAPS — ALL LIVE

**⭐ NEW THIS ROUND:**

- ⛔⛔⛔ **`site.css` / `site.js` ARE GENERATED FROM `index.html`** (§1.1).
- ⛔⛔⛔ **THE iOS SIMULATOR IS THE ONLY HONEST MOBILE TEST** (§1.2). `100vh` on a phone is the
  LARGE viewport, so an `absolute` element pinned to the bottom of a `100vh` box is **below the
  fold** while the address bar shows — and every emulator reports `100vh === innerHeight`, so it
  looks correct here and is missing there.
- ⛔⛔ **THE BROWSER PANE GOES HIDDEN AND THEN rAF AND rVFC DO NOT FIRE.** Frame-paint sampling
  silently returns nothing. Check `document.hidden` before trusting any animation measurement.
- ⚠️ A `Range`'s `getClientRects()` returns one rect per *fragment*, not per line — an `<em>` splits
  a line into two. **Count distinct `top` values** for a line count.
- ⭐ `backdrop-filter` was the thing blacking the pane's screenshots on the landing page; with D435
  it is gone from there, so landing-page captures work now.

**(Carried — the full list with explanations is §7 of
`HANDOVER-2026-08-25-film-and-hero-round-start-here.md`):** `currentTime` is not the frame on screen
(rVFC is truth) · the film needs ~8s to buffer · a TDZ crash is invisible to every gate — declare
module state at the top · a second `def` of the same name is a silent override · `getComputedStyle`
mid-transition lies · measure text after Cinzel lands · `@keyframes` inside a non-matching `@media`
never register · `drawImage` clips off-frame source rects and leaves the canvas STALE · an ID beats
a late class · **an overlap sweep lies twice: SVG internals, and mid-entrance `.rise` ancestors** ·
an inline style outranks a class rule · a CSS edit does not show until the builders re-run · a
same-origin iframe sweeps pages × widths, `javascript_tool` times out at 30s (batch 2–4) and keeps
top-level scope · `scroll-behavior:smooth` eats programmatic scrolls · `computer` limits: wait ≤10s,
scroll_amount ≤10 · filter `.sr-only,.est-sr,#estPriceSR,.chip-legacy` out of sweeps · no numpy, PIL
only · no libwebp in this ffmpeg · `php -l` does not exist here — **send.php's first real parse is on
the host** · valid stone presets: calacatta, carrara, crema, emperador, eternal, fumo, goldveil,
mist, nerogold, statuario.

---

## 8. ⛔ THE GATES — RUN THESE

```bash
cd "Website Demo" && python3 build_pages.py                     # FIRST — writes site.css, site.js, footer.css, nav.css
cd "Website Demo/services" && python3 build_services.py
cd "Website Demo/stones" && python3 build_stones.py
cd "Website Demo" && python3 build_seo_pages.py
cd "Website Demo/stones" && python3 harvest/verify.py            # 132/132/132 ✅
node --check "Website Demo/assets/site.js"
node --check "Website Demo/assets/tcform.js"
node --check "Website Demo/dev-server.js"
cd "Website Demo" && python3 make_upload.py                      # the shipping truth — and now the shipped artefact
```

⛔⛔ **NEVER RUN `trade/build_trade.py`.** ⛔ `build_images.py` / `patch_images.py` are one-shot.
**The CSS gate** (brace delta 0, count vs HEAD — `index.html` is at **3389** since D437) and
**`node --check` on all three inline `<script>` blocks** after every `index.html` edit (exclude
`ld+json` and `src=`). ⭐ **div balance 260/258, anchor balance 118/112** — long-standing and
correct; compare against HEAD rather than expecting zero.
⭐⭐ **AND AFTER ANY MARKUP MOVE:** `grep -c 'class="wa-fab"'` across the generated families (§4.2 of
the previous doc — `p["floats"]` in `build_pages.py` is a POSITIONAL slice).

### ⭐ THE FREEZE PROBE — 1440×900, FRESH LOAD, TAB IN FRONT

| Signal | Value |
|---|---|
| `--filmU` / `--filmX` / `--filmY` | **0.83333px / -66px / 0px** |
| `--heroScale` / `--svcFit` | **1 / 1** |
| `header.bar` height | **76** |
| first-screen title lines | **2** (at every desktop size) |
| the film fetched | **one per band: 608 / 864 / 1920, `?v=6`, 60fps** |
| `.gal-scroll` height | **4950** |
| `feTurbulence` count | **60** |
| elements | **2717** |
| `#footer` height | **504** |
| `#services` height | **900** (== 100vh at every size) |
| `.hero-bg` width at a 1440 window | **1468** (it bleeds — do not assume 1440) |
| document height, fresh load | **23936** |
| broken images / 4xx / console errors | **0 / 0 / none** |

---

## 9. ⭐ THE LINK, AND THE SERVER

```bash
cd "Website Demo" && nohup caffeinate -ims node dev-server.js > /tmp/topcat-server.log 2>&1 &
```

⚠️⚠️ **THE IP HAS MOVED FOUR TIMES** (currently **192.168.10.246**). **Re-check with
`ipconfig getifaddr en0` at the start of every reply that hands him a link.** ⚠️ The server stops
overnight. ⭐ Detached on purpose — do not `preview_stop` it. ⭐ `http://localhost:5501` in the
preview pane, on his instruction. ⭐⭐ **`.claude/launch.json` is ATTACH-ONLY** (url+port, no
command) — ⛔ do not put `runtimeExecutable` back. ⭐ The dev server answers POST `/send.php` with a
mock and logs the fields; it never ships.

---

## 10. ⛔ RULES THAT MUST NOT BE BROKEN

1. ⛔ **Fabrication is IN-HOUSE (D202)** — "our experienced fabricators". Flipped three times.
2. ⛔ **Never "laser" anything.** They template **by hand**.
3. ⛔ **The brand is "Topcat", one word.**
4. ⛔ **A stone's NAME and PHOTOGRAPH must match the supplier's own.** Suppliers are never named
   publicly (⚠️ except `Next Stone Slabs`, his own D203 exception).
5. ⛔ **Never state what we cannot guarantee, never an absolute.** ⚠️ Verbatim customer reviews are
   exempt — including the one `10cm` in a review on the landing page (D412). Do not "fix" it.
6. ⛔ **Every measurement in millimetres** (exception: the estimator's linear metres).
7. ⛔ **Never a bright or gold line across the TOP of a card or section.**
8. **No showroom. Never show the review count. Value, not cheap.**
9. **Voice:** quietly confident master. British English, commas not em dashes, no exclamation
   marks, no AI slop, no jargon. Reviews verbatim and exempt.
10. ⛔ **The logo is the client's artwork. Set HEIGHT only.** ⭐ In EMAIL it is styled text (D413).
11. ⛔⛔ **A mark never goes in a circle, ring, disc or plate.** A control is not a mark.
    ⭐ **AND NO GRADIENT ON THE CORNER DISCS** (D420) **AND NO `backdrop-filter` ON THEM DURING THE
    FILM** (D435) — those were two different faults and each one flashed.
12. ⛔ **One device at a time unless he says otherwise** — a generally-stated rule may be applied
    per-band-consistently, said plainly (D403 precedent).
13. ⛔⛔ **TWO NUMBERS: WhatsApp → 07464 940287. Every `tel:` → 0800 098 2812.**
14. ⭐⭐⭐ **SITE SPEED IS KEY** (§2s), and **D415: no loading animation, ever, as a speed answer.**
15. ⭐ **Change the journey tracker → change /privacy/ in the same commit** (D408).
16. ⭐⭐ **THE 1440×900 FRAME IS HIS APPROVED REFERENCE.** ⛔ When a composition is wrong on one
    screen and right on another, **the fix is the coordinate system, not the design** (D432b).
17. ⛔⛔ **2 CREDITS MAXIMUM PER GENERATED IMAGE.** ⭐ This round spent nothing.

---

## 11. ⭐ HOW THIS CLIENT WORKS

⛔⛔⛔ **HIS COMPLAINT NAMES THE SYMPTOM CORRECTLY EVERY TIME. IF YOU "FIX" IT AND HE REPEATS
HIMSELF, YOU CHANGED THE WRONG VARIABLE.** ⭐⭐⭐ **THIS ROUND IS THE MOST EXPENSIVE PROOF YET: the
flashing disc took TWELVE reports**, and the mechanism had been correctly written down at D419 and
then re-armed at D420 by the fix for a *different* fault on the same element. **Two real faults on
one control. Fixing one restored the other.**

⭐⭐⭐ **WHEN HE SAYS "I'VE TOLD YOU THIS BEFORE", GO AND READ THE REGISTER ROW.** Twice this round
the answer was already in it.

⭐⭐ **HE REVERSES HIMSELF FREELY AND THE LAST VERSION IS THE ONE HE MEANS** — the bar went
78.5 → 62 → 68 → 76 in one afternoon, and each step was a genuine correction.

⭐⭐ **HE SENDS CORRECTIONS MID-TURN, CONSTANTLY** — eight in one turn this round. Finish the one
you are on, read the whole queue, then take them in his order.

⭐⭐ **DO NOT SOLVE A PROBLEM HE HAS NOT REPORTED.** D432b was rejected on sight because I moved an
approved element while fixing something else. State the concern, then do only what was asked.

⚠️ **HE SWEARS WHEN SOMETHING LOOKS WRONG, AND THE COMPLAINT IS ALWAYS REAL.** ⭐ **When your own
work caused it, say so in the first line** — he is fine with that and not fine with spin.

⛔⛔ **DO NOT ASK HIS PERMISSION. Commit, push, report.** ⭐ **And when you could not verify
something, say that too** — real mail is held that way, and always has been.

---

## 12. BUDGET AND THE DOCUMENT SET

⭐ **This round spent 0 credits.** ffmpeg, the layout engine, `requestVideoFrameCallback`, the iOS
Simulator, PIL and grep.

| File | What it is |
|---|---|
| **`HANDOVER.md`** | §D the register **D1–D130, D132–D437** (⚠️ no D131). §2 rules, §2s speed, §2a suppliers. ⛔ Do not renumber sections |
| **`Website Demo/index.html`** | the landing page, **and the SOURCE of site.css and site.js**. Search `--filmU`, `setFilmFrame`, `SRCFPS`, `SEEK_STALL`, `decoderKick`, `--heroScale`, `--svcFit`, `bar-always` |
| **`Website Demo/assets/site.css` · `site.js`** | ⛔ **GENERATED. Do not edit.** |
| **`Website Demo/services/service.css`** | a real source — the generated pages' sheet |
| **`Website Demo/send.php`** | the form endpoint and the branded email. ⚠️ First real parse is on the host |
| **`Website Demo/build_pages.py`** | ⚠️ `p["floats"]` IS POSITIONAL |
| **`assets/video/.src-2026-08-23/encode60.sh`** | ⭐⭐⭐ the D425 60fps recipe and its size table. ⛔ Read before re-compressing anything |
| **`.textanim-2026-08-24/track_edge.py`** | ⭐⭐⭐ the reveal tables' tracker — **its first line is why `SRCFPS` is 12** |
| **`Website Demo/make_upload.py`** | writes `upload/` — **now a committed artefact, still must be run** |
| `HANDOVER-2026-08-25-film-and-hero-round-start-here.md` | the previous START HERE (D416–D422) — full carried trap list |
| `HANDOVER-archive-to-2026-08-06.md` | every design he rejected, in his words |

### ⭐ THIS ROUND'S COMMITS, IN ORDER

```
5fbccb8  D423–D429   60fps film, dt-normalised chase, address-bar gate, thinner chrome, services fit
4df3d6b  D430–D431b  SRCFPS 12 restores the slab reveal; --ly:0px restores the text transforms; iOS seeks
a81162d  D432        the copy moves in the film's own coordinates
0b4cd45  D432b–c     the kitchen beat back where he approved it
057245a  D432d,D433  the slab beat at the first screen's height; nav contents drop
bf58dd3  D433b–c,D434  bar 76 and centred; upload/ ships in the repo
2f5cc27  D435        the blur comes off all three controls — the flashing band
867c05b  D436,D437   sticky bar from the first pixel on inner pages; the headline holds two lines
<this>   —           the START HERE for the launch chat
```
