# START HERE — 25 August 2026, the FILM-AND-HERO chat (open: D416–D422, launch next)

Read this, then `HANDOVER.md` **§D** (the register, newest first — this round is **D406–D422**),
**§2** (the standing rules) and **§2s** (SITE SPEED). About twenty minutes, and enough to work safely.

> ⚠️ **This replaces the previous version of this same file**, now
> `HANDOVER-2026-08-25-forms-and-speed-round-start-here.md` (D406–D415).

> ⭐⭐⭐ **THIS CHAT EXISTS FOR TWO FAULTS HE STILL SEES ON HIS OWN MACHINE, AND THEN THE LAUNCH.
> HE NAMED BOTH:**
> **1. THE FILM STILL GLITCHES** on his MacBook trackpad — *"if I swipe quickly and it starts
> slowing down… once I've released my fingers off the trackpad, it's still glitching towards the
> end. Everything has to be smooth."*
> **2. THE HERO TEXT IS STILL TOO BIG** in HIS Chrome at localhost — *"the whole section text and
> size is too big. look at the fucking difference in the fucking screenshots I sent before."*
> ⛔⛔⛔ **NEITHER REPRODUCES HERE. BOTH WERE "FIXED" AND MEASURED CLEAN THREE TIMES AND HE STILL
> SEES THEM — SO THE FIRST MOVE IS NOT ANOTHER FIX. IT IS §1: GET HIS ACTUAL NUMBERS.**

---

## 1. ⛔⛔⛔ DO THIS FIRST — THE ONE THING THAT UNBLOCKS BOTH

**Everything measured in this harness says both are fixed. He still sees both. That means the
harness and his Chrome differ in something nobody has measured yet** — and three rounds have now
been spent guessing at it (§0.1). ⭐ **Ask him to paste this into Chrome's console on localhost and
send back the line it prints.** It is read-only and takes him ten seconds:

```js
(()=>{const v=document.getElementById('heroVid');const s=getComputedStyle(document.documentElement);
return JSON.stringify({win:[innerWidth,innerHeight],dpr:devicePixelRatio,
zoom:+(outerWidth/innerWidth).toFixed(2),heroScale:s.getPropertyValue('--heroScale').trim(),
uipx:s.getPropertyValue('--uipx').trim(),
title:getComputedStyle(document.querySelector('.cine-hero .cine-hl')).fontSize,
film:(v&&v.getAttribute('src')||'').split('/').pop(),vw:v&&v.videoWidth,ready:v&&v.readyState});})()
```

⭐ **WHAT EACH FIELD SETTLES:**

| field | why it matters |
|---|---|
| `win` | **the whole hero question.** Every measurement here assumed 1440×900 or 1512×830. If his window is, say, 1280×720 or he is at 1121–1250, the composition is scaled by a number nobody has checked |
| `zoom` | ⭐⭐⭐ **THE PRIME SUSPECT FOR THE TEXT, AND IT HAS NEVER BEEN ASKED.** Chrome page zoom at 110/125% makes every CSS px bigger while `innerWidth` shrinks — the site would then scale itself DOWN and still look bigger to him, which is EXACTLY the pattern of his complaint. His first screenshot even carried a `1.00` readout in the corner that nobody chased |
| `dpr` | a Retina 2× decode of a 1920 all-intra-ish film is ~4× the work of the pane's — **the prime suspect for the film** |
| `heroScale` / `uipx` / `title` | proves whether D418c's scale is actually applying on HIS machine, or silently invalid there (it was invalid CSS here for a whole round, §0.2) |
| `film` / `vw` / `ready` | proves which cut his browser fetched and whether it is fully buffered when he swipes |

⚠️ **Ask for a SCREEN RECORDING of the swipe as well** if he can — "glitching towards the end" has
at least three distinct causes (decode stalls, the chase overshooting, the story-line retime), and
they look different in motion. ⭐ A photograph of a still frame will not separate them.

---

## 2. ⭐⭐ THE FILM — WHAT IS ALREADY TRUE, AND WHAT TO TRY NEXT

### What was done (D416, D421) and measured clean HERE

```
24fps, -g 4, from his own 24fps masters      608: 6.91 MB · 864: 9.69 MB · 1920: 22.31 MB
the scrub's dead zone   1 frame (was ½)      EASE 0.12 → 0.15
slow scroll             265 frames, EVERY step 0 or +1, zero jumps, zero backwards
decaying fling          117 frames, last 40 steps ALL 1–2 frames, zero backwards, zero stalls
```

⛔ **DO NOT re-run the same measurement and report it clean again. It is clean here. That is the
problem, not the answer.**

### ⭐ The escalation ladder, in the order it is likely to pay

1. ⭐⭐⭐ **HIS `dpr`.** On a 2× Retina MacBook the desktop cut is decoded at 1920×1080 into a
   3024-wide frame. If `dpr` comes back 2, the honest fix is **a fourth cut for high-DPI narrow
   windows** (or serving the 864 cut to windows under ~1500 CSS px), not more scrub tuning.
2. ⭐⭐ **`-tune fastdecode`** on the desktop cut — the skill's own lever for "the seek is fast but
   playback feels heavy on weak hardware". Costs a little quality at the same CRF; measure the
   rubble at 4× before shipping (D319's law: **the SSIM column never shows the knee**).
3. ⭐⭐ **THE CANVAS FRAME-SEQUENCE FALLBACK** — the `scroll-scrub-video` skill's documented
   escalation when video scrubbing still stutters (`references/performance.md`). A sequence of
   frames drawn to a canvas has no decoder in the loop at all. ⛔ It is a big change and a big
   weight increase; it is the last resort, not the first.
4. ⚠️ **Check the film is fully buffered when he swipes.** `ready` < 4 in §1's probe means he is
   scrubbing into an unbuffered region and NO amount of tuning will fix it — the answer there is
   to hold the film's runway until `canplaythrough`.
5. ⚠️ **Rule out the story lines.** `retimeStory()` moves the copy on the same scroll; if the
   "glitch" is type stepping rather than the picture, it is a different fault entirely (D352 parked
   a pin for exactly this reason). His recording settles it in seconds.

---

## 3. ⭐⭐ THE HERO TEXT — WHAT IS ALREADY TRUE, AND THE TRAPS

### What was done (D418 → D418b → D418c) and measured clean HERE

```
--uipx      one 1440×900-anchored px for the desktop CHROME (nav, quote button, logo, chips)
            clamp(0.74px, min(100vw/1440,100vh/900), 1.18px)         ← valid CSS: bounds carry px
--heroScale ONE scale for the first-screen COMPOSITION, set from JS  ← see the trap below
            1 at 1440×900, the tighter axis under it, floor 0.70
verified    1440×900 → scale 1,     column 0.453 of the frame, arrow-to-chips air 0.235
            1512×830 → scale 0.922, column 0.449,               air 0.233
```

⛔⛔⛔ **THREE TRAPS, ALL PAID FOR ALREADY:**

1. **A UNITLESS CSS `clamp()` OF VIEWPORT UNITS IS INVALID AND FAILS SILENTLY.**
   `clamp(0.70, min(100vw/1440, 100vh/900), 1)` mixes lengths with numbers — `scale()` rejects the
   whole transform and **the page looks exactly as if nothing was applied, with no console error.**
   That is why `--heroScale` is set from JS (`setHeroScale()`). ⚠️ `--uipx` is fine because its
   bounds are px.
2. **A `vw` FONT SIZE FIGHTS THE SCALE.** The title was `clamp(38px,5vw,76px)`: it GREW with width
   while the scale shrank with the tighter axis, so on a wide-short window it still came out too
   big. It is a flat **72px** now and the one scale does all the work.
3. **THE FIRST SCREEN MUST SCALE AS ONE OBJECT.** The arrow is drawn TWICE — a solid silhouette and
   a `<b>` light that passes through it. Scaling the parts individually desynchronised them and put
   a "flash" beside the arrow (his words). ⛔ **Never scale the pieces. One transform on
   `.cine-hero`, `transform-origin:left top`, composed with the exit travel it already carries.**

### ⭐ If §1 comes back with `zoom` ≠ 1.00

**That is the answer, and it is not a bug.** Say so plainly and give him the choice: either he views
at 100%, or the composition is re-anchored to what he actually looks at. ⛔ Do not silently shrink
the design to compensate for a zoom level — the 1440×900 reference is HIS approved look and every
other desktop is measured against it.

---

## 4. ⛔⛔ THE FOUR SELF-INFLICTED FAULTS OF THIS ROUND — READ BEFORE EDITING

**⭐⭐⭐ 1. A REGEX THAT MATCHES ITS OWN INSERTION WILL EAT IT.** A cleanup `re.search` for the
block being replaced matched the NEW comment (same opening words), deleted from there through a
later brace, and silently removed the FAB ground AND the rule's closing brace — leaving the buttons
completely unstyled and the following rules swallowed. **Braces still balanced.** ⛔ **Never run a
removal regex in the same pass as an insertion that shares its wording; assert a count before and
after, and diff the block you think you touched.** ⭐ It was caught by driving the page, not by any
gate — the browser showed default-blue link borders.

**⭐⭐⭐ 2. `p["floats"]` IN `build_pages.py` IS A POSITIONAL SLICE — everything between the mobile
menu's `</nav>` and `<main>`.** Moving the two FABs into the hero (inside `<main>`) emptied it and
shipped **177 internal pages with no WhatsApp and no Call button at all.** The builders ran clean,
every gate passed, and only a per-page `grep -c 'class="wa-fab"'` found it. ⛔ **Never relocate
markup out of that region, and grep the generated pages for anything you move.**

**⭐⭐ 3. AN EDIT IN THE WRONG COPY OF A RULE CHANGES NOTHING AND LOOKS LIKE THE FIX FAILED.** Two
this round: the skip pill's alignment landed in a desktop-scoped copy (the governing one is inside
`@media(max-width:1120px)`), and the hero scale landed on `.cine-trust` (the chips) instead of
`.cine-hero`. ⭐ **Both were found by reading the COMPUTED value back, not by re-reading the
source.** After any CSS edit: read the property off the live element and confirm it changed.

**⭐⭐ 4. WHEN A FIX MISSES, CHANGE THE VARIABLE, NOT THE MAGNITUDE.** D418 keyed the anchor on
width; his window is wide and SHORT, so it made his chrome BIGGER — the opposite of the ask. The
axis was wrong, not the amount. **This is §12's own rule, self-inflicted.**

---

## 5. ⭐⭐⭐ THE LAUNCH — WHAT IS DONE AND WHAT IS LEFT

### Done and pushed (this round, D406–D422)

| Piece | State |
|---|---|
| **the forms** | `send.php` mails a branded grid email to **info@topcatworktops.co.uk**; all 38 forms post; journey + estimator data ride along; the uploader offers "+ Add another file"; "Max 50 MB per file" printed |
| **the film** | 24fps, keyframe-dense, one cut per band, one ever fetched |
| **speed** | 2.7 MB of dead masters off the host, two unused font weights pruned, poster preloaded at high priority, brotli offered; landing first paint **~290 KB on a phone** |
| **the audit** | 15 pages × 13 widths clean, 13,208 internal links resolve, **zero `href="#"`**, one tel + one WhatsApp number everywhere, zero console errors |
| **the corner controls** | one ground (the skip pill's), three controls on one line, **no gradient** |

### ⛔ The launch checklist — in order

1. ⭐⭐⭐ **THE TWO FAULTS ABOVE.** He will not launch with the film glitching on his own machine.
2. ⭐⭐⭐ **THE DEV UPLOADS.** He pulls `main` from GitHub → uploads the **CONTENTS of `upload/`**
   into public_html → **flushes SiteGround's dynamic cache in Site Tools** (D289). ⚠️ Run the
   builders then `make_upload.py` before the final push; `make_upload.py` refuses a stale build.
3. ⭐⭐⭐ **ONE TEST SUBMIT** on the live site → check info@'s inbox **and its spam folder**. If it
   lands in spam the fix is SPF for `website@topcatworktops.co.uk` at the host — DNS, not code.
   ⛔ **REAL MAIL CANNOT BE VERIFIED FROM THIS LAPTOP. It has never been sent.**
4. ⭐⭐ **HIS THREE LEGAL CONTRADICTIONS** (§6 items 3–4) — his to rule on, and they are on a live
   page: the 2-week workmanship line against the ten-year guarantee, the Financial Ombudsman route
   that does not cover worktops, and the `.com` address in §12 where the business is `.co.uk`.
5. ⭐⭐ **THE PRIVACY POLICY'S THREE MISSING FACTS** — ICO number, retention period, mail/CRM
   processor. ⛔ Inventing any of them is the guessing he forbade.
6. ⭐ Then it is live. **The site itself passed its audit.**

---

## 6. ⭐ OPEN — OWED ANSWERS

1. ⭐⭐⭐ **The film's glitch on his machine** — §1, §2.
2. ⭐⭐⭐ **The hero text size in his Chrome** — §1, §3.
3. ⭐⭐ **HIS TERMS CONTRADICT THE SITE IN THREE PLACES** (§5 item 4).
4. ⭐⭐ **The privacy policy's three facts** (§5 item 5).
5. ⭐⭐ **Did the test email arrive at info@, out of spam?**
6. ⭐⭐ **`#estCta` "Get your exact quote"** — to /contact/ as well? (D409 kept it on `#cta`
   because it carries the estimate and attachments; one word moves it.)
7. ⭐⭐ **The autoreply address** — he creates it, then flip `$SEND_AUTOREPLY` in send.php.
8. ⭐⭐ **Mid-page CTAs on the materials, guides and county families too?** (never asked)
9. ⭐⭐ Whose Argento · the 92 unverified Nile Stone tiles · the phone's kitchen-wash rework
   (⛔ the cause is written down, D367: `drawImage` clips an off-frame source rect and leaves the
   canvas STALE; the agreed fix is BAKE THE WASH FROM FILM TIME) · the headline wording · film
   sound · the 19 drone videos · the first-screen growth · the phone bar's preform · a quote card
   for phone/tablet · the sitemap link's gold (`foot-sitemap` awaits its hook) · trade terms (his
   stated first priority) · Nick and Rimsha's sentences · **RIMSHA OR REMSHA** · the Hornchurch set
   · the two blue-leaning slabs · social handles (⛔ never guess) · per-stone og:image ·
   `Next Stone Slabs` naming (D203 sanctions it) · Trustpilot · Calacatta Gold licensing · the
   palest dozen stone tiles (short of 4.5:1; he knows) · the tablet on a wide-short window.
10. ⚠️ **The branch `tablet-round-d197-d200`** still receives every push. Delete once the dev
    confirms pulling from `main` works.

**Still waiting on the client:** Quartzite as a fourth range, 20mm vs 30mm pricing, brackets for
vanity tops / fireplaces / tables, the £3k vs £3,850 three-slab discrepancy.

---

## 7. ⚠️ THE ENVIRONMENT TRAPS — ALL LIVE

**⭐ NEW THIS ROUND:**

- ⛔⛔⛔ **THE PANE'S SCREENSHOT IS UNUSABLE AT EXPLICIT DESKTOP SIZES** — `resize_window` to
  1440×900 renders the page into a ~220px strip of the capture, and `zoom` is unsupported. **The
  mobile PRESET captures correctly.** Judge desktop by measured rects; judge phone by eye.
- ⛔⛔ **`document.styleSheets` ENUMERATION RETURNED ZERO MATCHES TWICE THIS ROUND** while the
  rules were plainly applying. Do not use it to find "which rule wins" — **read the computed value
  off the element, and find the rule by reading the source.**
- ⛔⛔ **A UNITLESS `clamp()` OF VIEWPORT UNITS IS INVALID CSS AND FAILS SILENTLY** (§3 trap 1).
- ⚠️ **`document height, fresh load` DEPENDS ON WHEN YOU READ IT** — the film runway is sized off
  the video's duration metadata, so an early read gives a smaller number. Read it after the film
  buffers (~8s), or trust the locked value.
- ⚠️ **The dev server was restarted this round** (POST mock). If the pane shows a dead page:
  `cd "Website Demo" && nohup caffeinate -ims node dev-server.js > /tmp/topcat-server.log 2>&1 &`

**(Carried — the full list with explanations is §7 of
`HANDOVER-2026-08-25-forms-and-speed-round-start-here.md`):** `currentTime` is not the frame on
screen (rVFC is truth) · the film needs ~8s to buffer, the chase 2.5–3.5s to settle ·
`backdrop-filter` blacks the pane's screenshot (inject `*{backdrop-filter:none!important}`, shoot,
reload) · a TDZ crash is invisible to every gate — declare module state at the top · a second `def`
of the same name is a silent override · `getComputedStyle` mid-transition lies · measure text after
Cinzel lands · `@keyframes` inside a non-matching `@media` never register · `drawImage` clips
off-frame source rects and leaves the canvas STALE · an ID beats a late class · scroll animations
are dead in a background tab and a backgrounded pane tab screenshots black · **a reload can drop
the pane's viewport emulation — read `innerWidth` in the same probe as the number** · a narrow load
looks like a broken page (`--stoneRaster:on` below 720) · an inline style outranks a class rule · a
CSS edit does not show until the builders re-run (`?v=` hashes; index.html's own inline CSS is
served directly) · a same-origin iframe sweeps pages × widths, `javascript_tool` times out at 30s (batch
2–4) and keeps top-level scope (wrap in `(()=>{…})()`) · `scroll-behavior:smooth` eats programmatic
scrolls · `computer` limits: wait ≤10s, scroll_amount ≤10 · filter `.sr-only,.est-sr,#estPriceSR,
.chip-legacy` out of sweeps · **an overlap sweep lies twice: SVG internals, and mid-entrance
`.rise` ancestors** · no numpy, PIL only · no libwebp in this ffmpeg; the pane is the only SVG
rasteriser · `php -l` does not exist here — **send.php's first real parse is on the host** · valid
stone presets: calacatta, carrara, crema, emperador, eternal, fumo, goldveil, mist, nerogold,
statuario.

---

## 8. ⛔ THE GATES — RUN THESE

```bash
cd "Website Demo" && python3 build_pages.py                     # FIRST — writes footer.css AND nav.css
cd "Website Demo/services" && python3 build_services.py
cd "Website Demo/stones" && python3 build_stones.py
cd "Website Demo" && python3 build_seo_pages.py
cd "Website Demo/stones" && python3 harvest/verify.py            # 132/132/132 ✅
node --check "Website Demo/assets/tcform.js"
node --check "Website Demo/dev-server.js"
cd "Website Demo" && python3 make_upload.py                      # the shipping truth + its own gates
```

⛔⛔ **NEVER RUN `trade/build_trade.py`.** ⛔ `build_images.py` / `patch_images.py` are one-shot.
**The CSS gate** (brace delta 0, count vs HEAD — `index.html` is at **3358** since D422) and
**`node --check` on all three inline `<script>` blocks** after every `index.html` edit (exclude
`ld+json` and `src=`). ⭐ **div balance 260/258, anchor balance 118/112** — both long-standing and
correct; compare against HEAD rather than expecting zero.
⭐⭐ **AND AFTER ANY MARKUP MOVE:** `grep -c 'class="wa-fab"'` across the generated families (§4.2).

### ⭐ THE FREEZE PROBE — 1440×900, FRESH LOAD, TAB IN FRONT

| Signal | Value |
|---|---|
| `.gal-scroll` height | **4950** |
| `--revPer` (on `#reviews`) | **3** |
| `feTurbulence` count | **60** |
| elements | **2717** |
| hero ink (`.hero-inner` padding-top) | **86.1828** |
| `#footer` height | **503.78** |
| `.hero-bg` children | **7** |
| broken images / 4xx / console errors | **0 / 0 / none** |
| the film fetched | **one per band: 608 / 864 / 1920, `?v=4`** |
| ⭐ `--heroScale` at 1440×900 | **1** (0.922 at 1512×830) |
| ⭐ first-screen column / frame height | **0.453** |
| document height, fresh load, after buffering | **24014** |
| document height, after the film locks | **15464** |

---

## 9. ⭐ THE LINK, AND THE SERVER

```bash
cd "Website Demo" && nohup caffeinate -ims node dev-server.js > /tmp/topcat-server.log 2>&1 &
```

⚠️⚠️ **THE IP HAS MOVED FOUR TIMES** (last **192.168.10.246**). **Re-check with
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
7. ⛔ **Never a bright or gold line across the TOP of a card or section.** D395's inner-page divider
   reversal does not reopen this anywhere else; it held in the EMAIL design too.
8. **No showroom. Never show the review count. Value, not cheap.**
9. **Voice:** quietly confident master. British English, commas not em dashes, no exclamation
   marks, no AI slop, no jargon. Reviews verbatim and exempt.
10. ⛔ **The logo is the client's artwork. Set HEIGHT only.** ⭐ In EMAIL it is styled text (D413) —
    never an image attachment.
11. ⛔⛔ **A mark never goes in a circle, ring, disc or plate.** A control is not a mark.
    ⭐ **AND NO GRADIENT ON THE CORNER DISCS — that gradient WAS the stripe (D420).**
12. ⛔ **One device at a time unless he says otherwise** — a generally-stated rule may be applied
    per-band-consistently, said plainly (D403 precedent).
13. ⛔⛔ **TWO NUMBERS: WhatsApp → 07464 940287. Every `tel:` → 0800 098 2812.**
14. ⭐ **RETIRED:** "never raise the missing form backend" — it exists (D407). Still his: the
    autoreply address, and the host upload.
15. ⛔⛔ **2 CREDITS MAXIMUM PER GENERATED IMAGE.** ⭐ This round spent nothing.
16. ⭐⭐⭐ **SITE SPEED IS KEY** (§2s), and **D415: no loading animation, ever, as a speed answer.**
17. ⭐ **Change the journey tracker → change /privacy/ in the same commit** (D408).
18. ⭐⭐ **THE 1440×900 FRAME IS HIS APPROVED REFERENCE for the first screen.** Everything else is
    measured against it. ⛔ Do not redesign it to satisfy a window nobody has measured (§3).

---

## 11. ⭐ HOW THIS CLIENT WORKS

⛔⛔⛔ **HIS COMPLAINT NAMES THE SYMPTOM CORRECTLY EVERY TIME. IF YOU "FIX" IT AND HE REPEATS
HIMSELF, YOU CHANGED THE WRONG VARIABLE — DO NOT CHANGE THE SAME ONE HARDER.** ⭐⭐⭐ **THIS ROUND
IS THE MOST EXPENSIVE PROOF YET: the stripe on the corner buttons took THREE attempts** (isolation,
then a flat ground, then finally the element's own `linear-gradient(155deg,…)` — which had been
there since D173 and was never the video at all). **Two of those attempts changed the backdrop. The
fault was the foreground.**

⭐⭐⭐ **WHEN HE SAYS "I'VE TOLD YOU THIS BEFORE", STOP FIXING AND START MEASURING SOMETHING ELSE.**
That sentence has now appeared on both open faults.

⭐⭐ **HE REVERSES HIMSELF FREELY AND THE LAST VERSION IS THE ONE HE MEANS** (white quote-button
text, tried and reversed within the hour).

⭐⭐ **HE SENDS CORRECTIONS MID-TURN, CONSTANTLY** — five in one turn this round. Finish the one
you are on, read the whole queue, then take them in his order.

⭐⭐ **HE ASKS FOR YOUR OPINION AND MEANS IT** (D415, the loader: a recommendation with three
reasons, then his one-line ruling). **Answer, do not survey.**

⚠️ **HE SWEARS WHEN SOMETHING LOOKS WRONG, AND THE COMPLAINT IS ALWAYS REAL.** ⭐ **When your own
work caused it, say so in the first line** — he is fine with that and not fine with spin.

⛔⛔ **DO NOT ASK HIS PERMISSION. Commit, push, report.** ⭐ **And when you could not verify
something, say that too** — real mail, and both faults in §1, are held that way.

---

## 12. BUDGET AND THE DOCUMENT SET

⭐ **This round spent 0 credits.** Layout engine, `requestVideoFrameCallback`, ffmpeg, grep.

| File | What it is |
|---|---|
| **`HANDOVER.md`** | §D the register **D1–D130, D132–D422** (⚠️ no D131). §2 rules, §2s speed, §2a suppliers. ⛔ Do not renumber sections |
| **`Website Demo/index.html`** | the landing + the shared stylesheet. Search `--heroScale`, `setHeroScale`, `--uipx`, `THE SCROLL FILM`, `cine-done`, `wa-fab` |
| **`Website Demo/send.php`** | the form endpoint and the branded email. ⚠️ First real parse is on the host |
| **`Website Demo/assets/tcform.js`** | every form + the journey stores — **?v=3** |
| **`Website Demo/build_pages.py`** | ⚠️ **`p["floats"]` IS POSITIONAL** (§4.2) |
| **`Website Demo/assets/video/.src-2026-08-23/encode.sh`** | ⭐⭐⭐ the D416 encode matrix and the SSIM/MB tables. ⛔ Read before re-compressing anything |
| **`Website Demo/make_upload.py`** | writes `upload/` — what the dev ships |
| `HANDOVER-2026-08-25-forms-and-speed-round-start-here.md` | the previous START HERE (D406–D415) — full trap list and client section |
| `HANDOVER-archive-to-2026-08-06.md` | every design he rejected, in his words |

### ⭐ THIS ROUND'S COMMITS, IN ORDER

```
32193a9  D406        the reviews strap line meets the divider at the services title's own distance
559815f  D407–D410   the forms deliver: send.php mails the branded grid to info@
287eb8c  D411        the speed pass: dead masters off, poster asked for first, brotli offered
37b5023  D412        the audit round comes back clean
fd793a3  D413–D414   the email divides its two sides and counts the visit
849a54d  D415        no loader before the film
58ad89a  D416–D418   the film scrubs at 24fps; the quote button wears the ramp; the chrome anchors
2ac1005  D418b,D419  the anchor follows the tighter axis; the stripe loses its (wrong) mechanism
fc0be55  D418c,D420–D422  the corner buttons lose the gradient that WAS the stripe; one scale; the tail settles
<this>   —           the START HERE for the film-and-hero chat
```
