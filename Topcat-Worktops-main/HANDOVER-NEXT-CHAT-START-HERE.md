# START HERE — 25 August 2026, after THE INNER-PAGES ROUND (D391–D405)

Read this, then `HANDOVER.md` **§D** (the register, newest first — this round is **D391–D405**),
**§2** (the standing rules) and **§2s** (SITE SPEED). About twenty minutes, and enough to work safely.

> ⚠️ **This replaces the previous version of this same file**, now
> `HANDOVER-2026-08-24-launch-prep-start-here.md` (D378–D390). Everything that still
> matters is carried below.

> ⭐⭐⭐ **HE HAS NAMED THE NEXT ROUND HIMSELF AND IT IS THREE THINGS, IN HIS ORDER:**
> **1. the site-speed optimisation · 2. making all the forms and emails actually work ·
> 3. an audit round over the whole site.** That is §2 and it is the only thing the next chat
> is for. ⛔ **THE COPY IS FIXED AND IS NOT REOPENED (§3). THE COMPOSITION AND THE ANIMATION
> ARE PER BAND.**
> ⭐ **HE WATCHED THIS ROUND BEING BUILT, LIVE, AND CORRECTED FOUR THINGS MID-BUILD.** Nothing
> here is awaiting a sign-off. **One thing is owed and unverifiable from here: §1a, the flicker.**

---

## 0. ⛔⛔⛔ THE FOUR THINGS TO TAKE FROM THIS ROUND

**⭐⭐⭐ 1. "STILL WRONG" AFTER YOU CHANGED THE OBVIOUS PROPERTY MEANS YOU CHANGED THE WRONG ONE.
MEASURE WHAT IS PAINTED, NOT WHAT IS DECLARED.**

He asked for the trust tags to be white for the **third** time. They were already `--bone`
(`#F4F1EA`) and `getComputedStyle` had confirmed it at every previous ask. What made them grey was
**`font-weight:300`**: at 12px Montserrat's stems fall under one pixel, so most of the glyph is
partial-coverage antialiasing and the eye integrates the average, not the peak.

```
   canvas, 4x supersample, mean painted luminance inside the ink
   300 / #F4F1EA    194.1   → the eye sees #c2c2c2     ← what he kept looking at
   500 / #F4F1EA    210.4   → #d2d2d2
   500 / #FFFFFF    222.3   → #dedede                  ← shipped
```

⛔⛔ **`getComputedStyle` SAID `#F4F1EA` THROUGH ALL THREE ASKS AND WAS NO HELP AT ANY OF THEM.**
When he repeats himself, the variable you have been adjusting is not the one he is looking at (§12).

**⭐⭐⭐ 2. A BOUNDING BOX IS NOT AN OPTICAL SIZE, AND WHEN THE TWO DISAGREE HE IS RIGHT.**

He called the phone glyph *"too big"* when it measured **21.1px against WhatsApp's 23px** — smaller
by bounding box **and** by painted area (91%). He was still right: the WhatsApp mark is an
**outlined bubble that is mostly negative space** and the handset is a **solid shape**, and a solid
glyph reads heavier at equal size. It ships at **80% of the WhatsApp ink**.

⚠️ The journey was **12.4px (his "too small") → 21.1px (his "too big") → 18.4px**. ⛔ Do not "correct"
it back to parity because the numbers look tidier.

**⭐⭐⭐ 3. THE SWEEP ONLY FINDS WHAT ITS PREDICATE DESCRIBES.** D385 swept 13 pages × 13 widths and
passed a page where **the prose ran flush into the quote card with a zero-pixel gutter**. D387 had
already learned that an overflow sweep misses a WRAP. This round it missed an **overlap**, a **zero
gutter** and a **ragged wrapped line**.

```
the four predicates that are now run, and why each exists
   page overflow            the original test, still necessary
   unclipped element bleed   ⚠️ must ignore what a parent clips — .svc-hero-bg is widened
                                by --curveOut on purpose and reported 11 false hits per page
   clipped control text      catches a label eaten by its own box
   column gutter             catches "adjacent" reading as "overlapping"
```

⚠️ **AND "SIBLINGS MUST SHARE A HEIGHT" HAS TO BE STATED AS "SIBLINGS SHARING A *LINE*"** — the 2×2
chip grid legitimately runs 44/44 then 42/42, because the Google bubble's fixed 26px stack makes its
row taller. Stated loosely it reported a fault 36 times. **112 page × width combinations now clean.**

**⭐⭐ 4. `node --check` IS NOT A SCOPE GATE AND NOT A LIFETIME GATE EITHER.** A `let` declared beside
its own function, read by a hoisted function that runs **synchronously earlier in the same IIFE**, is
a temporal-dead-zone ReferenceError that kills every line after it — in syntactically perfect code.
It was caught by driving the `#hero` path, not by reading it. **Declare state with the rest of its
module's state, at the top.**

---

## 1. ⭐⭐⭐ WHAT THIS ROUND BUILT

### ⭐ THE INNER PAGES — the round's spine

| Surface | Before | After |
|---|---|---|
| **trust tags** `.chip` | painted **`#c2c2c2`** at weight 300 | **`#dedede`**, weight 500 on `#fff` |
| **section headings** | 6 of 8 with no gold, on all 167 pages | every one white-and-gold |
| **title → subtitle** | flat **8px** at every band | **`0.66em`** — 15.8px phone, 25.1px desktop |
| **`.ticks`** "Why Topcat" | Montserrat white on bare text, 3px gap, gold disc | Cinzel gold in `.feat`'s own card, tick |
| **section dividers** | grey `border-top` (a rule-10 breach) | full-bleed graded champagne, never under a hero |
| **the quote card's gutter** | **0px** at 1121 and 1280 | **40px**, floor raised to `372 + 2×40` |
| **the sticky bar** | dormant on all 176 pages | rises on every one, both narrow bands |

### ⭐ 1a. ⛔⛔ THE ONE THING OWED — THE CORNER-BUTTON FLICKER, UNVERIFIED

He photographed the call button over the quarry frame: *"this gradient thing inside this block or
whatever you have going on in the call button block is flickering, and it's creating this effect."*

The ground is now **`rgba(8,8,11,0.70)` + `blur(9px)`, read off `html.cine-on .cine-skip`** and
verified identical by computed style — his correction, after he rejected a near-opaque version:
*"it should still be the same gradient as behind the skip intro button."*

⛔⛔⛔ **BUT THE FLICKER ITSELF COULD NOT BE REPRODUCED OR PHOTOGRAPHED HERE: the pane's screenshot
goes black on any page carrying `backdrop-filter` (§7), so the single property under investigation is
the one this harness cannot capture.** He was told so plainly.

⚠️ **THE PRIME SUSPECT IS WRITTEN INTO THE STYLESHEET AND IS THE NEXT THING TO TRY:** `.wa-fab` and
`.call-fab` are **`position:fixed`** — a separate compositing root from the `<video>` — while the skip
pill is `position:absolute` inside the sticky hero and moves **with** its own backdrop.
`isolation:isolate` was added as the cheap remedy. ⛔ **If it still shimmers on his device, that is
the thing to change. Not another colour.**

### ⭐ THE FILM IS A ONE-WAY JOURNEY (D403)

⭐⭐⭐ **THE FAULT HE FOUND WAS WORSE THAN THE REWIND HE DESCRIBED: PULL-TO-REFRESH WAS UNREACHABLE.**
A phone fires its native refresh only at `scrollTop === 0`, and scroll 0 was the film's **first
frame**, nine screens above the finished hero. **There was no way to refresh this page from the place
people actually stand on it.**

⛔⛔ **WHICH IS WHY THE RUNWAY COLLAPSES AND THE SCROLL IS NOT CLAMPED** — a floor under `scrollY`
would stop the rewind and make the gesture permanently impossible.

```
   film complete + chase settled + scroll at rest (220ms)
      → html.cine-done drops .cine from 8-10.5 viewports to ONE
      → scrollY reduced by exactly the travel removed
      → still on the hero?  lands at 0, nothing moves on screen
      → already down the page?  position preserved to the pixel
      → the #hero hash is dropped, or "refresh to see the video" would be false
```

⚠️ **THE HASH NEEDS TWO CALL SITES.** Clicking the logo while already locked is a same-document hash
change, so `lockFilm()` early-returns and never reaches the clear.

### ⭐ TERMS, PRIVACY, AND 178 PAGES OF DEAD LINKS

`Privacy`, `Terms` and `Cookies` were `href="#"` in the footer of every page since it was written.
⭐ **The terms are HIS, verbatim from `topcatworktops.co.uk/terms`** — *"copy all of that exactly as
it is"* — and the privacy policy was **written against an audit of what the site actually does**, on
his condition *"if you're going to guess about a privacy policy, don't write one."*

⛔⛔ **THREE THINGS IN HIS TERMS CONTRADICT THE SITE AND WERE DELIBERATELY LEFT ALONE. THEY ARE HIS
TO RULE ON AND THEY ARE IN §11.**

---

## 2. ⭐⭐⭐ WHAT THE NEXT ROUND IS — HIS OWN THREE, IN HIS ORDER

His words: *"What we're going to do next is the site speed optimization, and making sure all the
forms and emails are working, and then running an audit to make sure that everything is looking
good."*

### ⛔⛔ 1. THE SITE-SPEED PASS

⭐ **STILL NOTHING DONE, AND IT HAS NOW BEEN ASKED FOR TWICE** (it was §2 of the last START HERE too).
What is already true is in §4. What a real pass would look at, in the order it is likely to pay:

```
1. THE FILMS ARE 22.8 MB ON DISK and one visitor pulls 3.87–13.28 MB of it. That is the
   site's whole speed story and it has never been re-examined against a SLOW connection.
   ⛔ Do NOT re-compress without reading the SSIM/MB tables in the two encode.sh files (§4).
2. BROTLI AND THE PRODUCTION HOST — still open (§11 item 3). `dev-server.js` compresses and
   the host may not, so every byte figure read locally is optimistic.
3. `assets/site.css` is ~736 KB and `site.js` ~592 KB before the comment strip;
   `make_upload.py` takes the landing page's first load from 2.35 MB to 0.83 MB. ⭐ Re-run it
   and read the printed saving — that number is the honest one, not the working files.
4. `assets/tcform.js` on every page is one round trip; inlining it from the builders is the
   obvious trade. ⭐ THE STICKY BAR COST NOTHING — its CSS went into the `nav.css` these
   pages already load, which is the pattern to copy for anything else shared.
5. Fonts, the 132 slab photographs on `/stones/`, and lazy-loading below the fold.
```

### ⛔⛔ 2. THE FORMS AND THE EMAILS — ⚠️ **§2 RULE 14 IS NOW SUPERSEDED**

⛔⛔⛔ **READ THIS BEFORE §10 RULE 14.** That rule says the missing form backend is a DESIGN-build
non-issue and *"is never to be raised as a blocker"*. **HE HAS NOW ASKED FOR IT HIMSELF**, so for the
next round it is a task, not a forbidden topic. ⚠️ It does not become a blocker for anything else —
it becomes **his second named item**.

```
⭐ ALL 38 FORMS ALREADY VALIDATE AND ARE ONE STRING FROM LIVE (D384).
   `assets/tcform.js` → set the `ENDPOINT` constant at the top and every form posts for real.
⚠️ WHAT IS NOT DECIDED, AND HE HAS TO CHOOSE: where that endpoint points.
   It needs a host that can accept a POST and send mail — which is §11 item 3, the question
   that has now been asked more than a dozen times. **The two are the same question.**
⚠️ THE THREE FORMS ARE `.qform` (31 pages), `#tradeForm`, `#ctaForm` (6 pages) — one file
   owns all of them, so this is one change, not 38.
⛔ Nothing about the validation needs revisiting; it was measured and fixed in D384.
```

### ⛔⛔ 3. THE AUDIT ROUND

His words: *"then running an audit to make sure that everything is looking good."* ⭐ There is an
`audit-site` skill and §0's four predicates are the sweep to run. ⚠️ **Take his own list first** — he
finds faults by eye that no sweep has ever caught (§0.1, §0.2, §12).

### ⚠️ The things this round left knowingly unfinished

1. ⛔⛔ **THE CORNER-BUTTON FLICKER IS UNVERIFIED** — §1a. **Ask him first whether it is still there.**
2. ⛔ **THE PALEST DOZEN STONE TILES ARE STILL SHORT OF 4.5:1** and cannot be fixed without darkening
   the picture, which he has forbidden. **He knows the tiles were left alone; he does not know the
   residual number.**
3. ⚠️ **THE PHONE'S KITCHEN WASH, STILL REVERTED AND STILL OWED A REWORK (D367).** ⛔⛔ **THE CAUSE IS
   WRITTEN DOWN AND MUST NOT BE RE-DISCOVERED:** `drawImage` **clips** a source rect reaching outside
   the video and leaves the rest of the canvas STALE. **THE AGREED FIX: BAKE THE WASH FROM FILM TIME.**
4. ⚠️ **THE MID-PAGE CTAs ARE ON THE NINE SERVICE LEAVES ONLY.** The materials, guides and county
   pages are the same shape and it is a one-line change per family. **He has not been asked.**
5. ⚠️ **THE TABLET ON A WIDE-SHORT WINDOW** — the kitchen beat's island fence cannot hold above ~1.35
   aspect. Nothing is broken; worth one look on a real landscape iPad.

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
                 chosen with you and fitted by our own team." — two subtitles, one element.
```

⚠️ **`.cine-open` — "It starts as a mountain." — STANDS DOWN AT EVERY BAND.** Not deleted; it is the
restore path if a band ever loses its second hero.

⛔⛔⛔ **FOUR SEPARATE COPY FAULTS WERE CAUGHT BY HIM, NOT BY ME, AND EVERY ONE WAS A CLAIM THE
BUSINESS CANNOT MAKE. Check any new line against all four:**

| the line said | why it was false |
|---|---|
| *"through the quarry"* | the film **opens at** the quarry face and never travels through one |
| *"cut for your kitchen"* | fireplaces, vanity tops and dining tables are **all live pages** |
| *"…are veined differently"* | `absolute-black-extra` has **no visible grain**; quartz is engineered |
| *"one of a kind patterns in stone"* | a plural against a mass noun — **and a third restatement** |

⭐ **AND A FIFTH THIS ROUND, ON GRAMMAR (D402):** *"Marble, quartz and granite, with porcelain"* made
porcelain a property of the granite. **A trailing "with X" attaches to the nearest noun.** It is
*"Marble, quartz, granite and porcelain"* now — his own construction.

⚠️ *"decades"* is defensible and *"for life"* is not. ⚠️ *"unique"*, never *"completely unique"*.

---

## 4. ⭐⭐⭐ SITE SPEED IS A STANDING RULE — HIS OWN WORDS

Unprompted, 18 Aug: *"just make sure you always keep site speed in mind… **site speed is key**."*
`HANDOVER.md` **§2s**. **⭐ AND IT IS NOW HIS NAMED FIRST ITEM FOR THE NEXT ROUND — see §2.**

1. ⛔⛔ **ONE FILM PER BAND AND ONLY ONE IS EVER FETCHED.** Three cuts (**22.8 MB** together), a
   visitor downloads exactly one — **1920: 13.28 MB · 864: 5.62 MB · 608: 3.87 MB**. An in-place
   `<script>` beside the `<video>` sets `src` and `poster` **during parse**. ⛔ **A `display:none`
   VIDEO STILL DOWNLOADS ITS `src` AND `poster`.**
2. ⭐ **`preload="none"` in the markup**, flipped to `auto` by the scrub once the band is known.
3. ⭐⭐ **FIRST PAINT COSTS THE POSTER, NOT THE FILM** — **121 KB** desktop, 81 tablet, 54 phone.
4. ⭐⭐ **COMMENTS COME OFF ON THE WAY OUT (D315).** ⛔ Never strip comments from the SOURCE.
5. ⭐ **NOTHING UNREFERENCED SHIPS.** Dot-folders never ship.

⭐ **THIS ROUND'S NET EFFECT ON WEIGHT WAS NEUTRAL-TO-POSITIVE:** the sticky bar reached 167 new
pages at **no new request** by riding the generated `nav.css` they already load, and two legal pages
were added. ⚠️ **`dev-server.js` COMPRESSES AND THE HOST MAY NOT.** ⚠️ **A MEDIA ELEMENT'S OWN FETCH
OFTEN DOES NOT APPEAR IN `resource` TIMING** — prove "the wrong film did not load" by the ABSENCE of
the other bands' URLs plus `video.getAttribute('src')`.

---

## 5. ⛔ THREE DEVICE BANDS

```
   ≤ 720px          721 – 1120px          ≥ 1121px
   the phone   ·   the tablet        ·   the desktop
```
⛔ **THE TABLET-ONLY BLOCK IS STILL LAST IN THE STYLESHEET** (search `THE TABLET BAND`).
⭐ **Widen a phone rule's own query to reach the tablet, never copy it.** ⭐ This round did exactly
that for "View as grid" — the rule MOVED into a `max-width:1120px` query of its own.
⭐⭐ **AND WHEN A RULE BECOMES EVERY BAND'S, DELETE ITS QUERY RATHER THAN ADDING A THIRD COPY.**
⚠️ ⛔⛔ **SOURCE ORDER DECIDES BETWEEN EQUAL SPECIFICITY — BUT AN ID IS NOT EQUAL.**

⛔⛔⛔ **THE PER-BAND CASCADE IS THE ONE MENTAL MODEL FOR BOTH THE FILM AND THE BEATS:
`-phone` → `-narrow` → the bare attribute.** ⚠️ **A BEAT WITH NO `-narrow` PAIR HAS NO DESKTOP-ONLY
TIMING.**

⭐ **IN THE SCRUB THE BANDS ARE `heroOn` (desktop) · `heroNr` (both narrow) · `heroPh` / `heroTab`.**

⭐⭐ **AND THERE ARE TWO STYLESHEETS, WHICH IS THE ARCHITECTURE AND NOT AN ACCIDENT:**
`index.html`'s inline `<style>` (lifted to `assets/site.css` for the landing page and the seven
internal pages) and `services/service.css` (the other 167). ⛔ **A CHANGE TO A SHARED COMPONENT HAS
TO BE MADE IN BOTH.** ⭐⭐ **THE BETTER ANSWER, PROVEN THIS ROUND, IS TO EXTRACT RATHER THAN COPY:**
the sticky bar's CSS is pulled out of `index.html` into the generated `nav.css` by `_is_nav_sel()` in
`build_pages.py`, so there is one description and no drift. **Copy that pattern for the next shared
component.**

---

## 6. ⛔ THE GATES — RUN THESE

```bash
cd "Website Demo" && python3 build_pages.py                     # FIRST — writes footer.css AND nav.css
cd "Website Demo/services" && python3 build_services.py
cd "Website Demo/stones" && python3 build_stones.py
cd "Website Demo" && python3 build_seo_pages.py
cd "Website Demo/stones" && python3 harvest/verify.py            # 132/132/132 ✅
node --check "Website Demo/assets/tcform.js"
```

⛔⛔ **NEVER RUN `trade/build_trade.py`.** ⛔ `build_images.py` / `patch_images.py` are one-shot.
**The CSS gate** (brace delta 0, and compare the COUNT against HEAD) and **`node --check` on all
three inline `<script>` blocks** after every edit to `index.html`. ⚠️ The JS gate must EXCLUDE
`application/ld+json` **and `<script src=…>`**.
⭐⭐ **AND A `<div>` BALANCE CHECK AFTER ANY STRUCTURAL CUT** (259/257 is correct and long-standing).

⛔⛔⛔ **`node --check` IS A SYNTAX GATE, NOT A RUNTIME ONE, NOT A SCOPE ONE, AND NOT A LIFETIME ONE**
— §0.4 cost a whole-film crash in syntactically perfect code. **Read the console AND drive the page.**

⛔⛔ **A BRACE INSIDE A COMMENT COUNTS.** ⭐ This round: `index.html` **3331 → 3339**,
`service.css` **176 → 202**, every pair accounted for.

### ⭐ THE FREEZE PROBE — 1440×900, FRESH LOAD, TAB IN FRONT

| Signal | Value |
|---|---|
| `.gal-scroll` height | **4950** |
| `--revPer` (on `#reviews`) | **3** |
| `feTurbulence` count | **60** |
| elements | **2715** |
| hero ink (`.hero-inner` padding-top) | **86.1828** |
| `#footer` height | **503.78** |
| `.hero-bg` children | **7** |
| broken images / 4xx / console errors | **0 / 0 / none** |
| the film fetched | **1920 only** |
| document height, **fresh load** | **23993** |
| ⭐ document height, **after the film locks** | **15443** ← NEW, and expected (D403) |

⭐ **EVERY ROW RE-VERIFIED AT THE END OF THIS ROUND.** ⚠️ **THE DOCUMENT HEIGHT NOW HAS TWO CORRECT
VALUES** — read it on a fresh load before quoting it. ⚠️ The element count is only valid on a fresh
load. ⚠️ Filter broken images on `i.src && i.complete && i.naturalWidth===0`.

---

## 7. ⚠️ THE ENVIRONMENT TRAPS — ALL LIVE

**⭐⭐⭐ NEW THIS ROUND:**

- ⛔⛔⛔ **`backdrop-filter` BLACKS THE PANE'S SCREENSHOT, WHICH MEANS YOU CANNOT PHOTOGRAPH A FAULT
  IN `backdrop-filter` ITSELF.** ⭐ **THE WORKAROUND, AND IT WORKS:** inject
  `*{backdrop-filter:none !important}` into the live DOM, shoot, then reload. It changes the very
  thing under test, so it is a workaround for photographing OTHER things on the page, not that one.
- ⛔⛔⛔ **A TDZ CRASH IS INVISIBLE TO EVERY GATE.** A `let` read by a hoisted function that runs
  synchronously earlier in the same IIFE throws and kills the rest of the file. §0.4.
- ⛔⛔ **AN EXEMPTION KEYED ON THE WRONG CONDITION LOOKS LIKE IT WORKS.** `:first-child` for
  "the section under the hero" passed six page families and failed all 132 stone pages, where
  `<main>` opens with the hero. **Name the real condition (adjacency), not a proxy for it.**
- ⛔⛔ **EACH LINE OF A WRAPPING FLEX ROW STRETCHES INDEPENDENTLY.** A taller pill made its own line
  taller at 375 and not at 600 — so it looked fine at most widths. **Compare heights within a LINE.**
- ⚠️ **`getBBox()` IS THE TOOL FOR "IS THIS ICON THE RIGHT SIZE".** Two glyphs at the same CSS size
  can differ by 40% of painted ink if one does not fill its viewBox.
- ⚠️ **A SECOND `def` OF THE SAME NAME AT MODULE LEVEL IS A SILENT OVERRIDE, NOT A FALLBACK.**
  `build_seo_pages.py` carried two `gold_last`s; the first had never run once.

**(Carried, all still live)**

- ⛔⛔⛔ **`currentTime` IS NOT THE FRAME ON THE SCREEN.** 1–3 frames of lead under a live scrub.
  ⭐ `video.requestVideoFrameCallback` → `metadata.mediaTime` is the only ground truth.
- ⛔⛔⛔ **THE FILM NEEDS ~8s TO BUFFER AFTER A NAVIGATION, AND THE EASED CHASE ~2.5–3.5s TO SETTLE.**
  ⭐⭐ **POLL `currentTime` UNTIL IT STOPS CHANGING BEFORE TRUSTING ANY READING.**
- ⛔⛔⛔ **A CANVAS MODEL OF A CSS `radial-gradient(x% y% at …)` MUST DRAW AN ELLIPSE.**
- ⛔⛔ **`getComputedStyle` STRAIGHT AFTER TOGGLING A CLASS RETURNS THE TRANSITION'S MID-FLIGHT VALUE.**
- ⛔⛔⛔ **MEASURE TEXT AFTER THE FONT LANDS.** Cinzel is **135px wider** across the headline.
- ⛔⛔ **`@keyframes` INSIDE A NON-MATCHING `@media` NEVER REGISTER.**
- ⛔⛔ **`drawImage` CLIPS AN OFF-FRAME SOURCE RECT AND LEAVES THE REST OF THE CANVAS STALE** (§2.3).
- ⛔⛔ **AN ID BEATS A LATE CLASS**, and **A SHARED SELECTOR REACHES ITS NEIGHBOUR**.
- ⛔⛔⛔ **A SCROLL ANIMATION IS DEAD IN A BACKGROUND TAB**, and the pane throttles rAF even when
  fronted. ⚠️ **A BACKGROUNDED PANE TAB ALSO SCREENSHOTS BLACK** — front it (`tabs_select`) first.
- ⛔⛔ **A RELOAD CAN DROP THE PANE'S VIEWPORT EMULATION. READ `innerWidth` IN THE SAME PROBE AS THE
  NUMBER**, every time.
- ⛔⛔ **A NARROW LOAD LOOKS EXACTLY LIKE A BROKEN PAGE.** `--stoneRaster:on` below 720px swaps the
  live marble SVG for a bitmap: `feTurbulence` reads 0 and elements drop ~570.
- ⛔⛔ **AN INLINE STYLE OUTRANKS A CLASS RULE** — hand the property back (`style.removeProperty`).
- ⛔⛔ **A CSS EDIT DOES NOT SHOW UNTIL THE BUILDERS RE-RUN** (`site.css?v=<hash>`, `stone.css?v=`).
  ⚠️ `index.html`'s own inline CSS is served directly and needs no builder.
- ⭐⭐ **A SAME-ORIGIN IFRAME IS THE FAST WAY TO SWEEP MANY PAGES × MANY WIDTHS.**
  ⚠️ `javascript_tool` **times out at 30s**, so batch 2–4 pages per call, and it is lost on any
  navigation of the host page — **keep it on a page you are not going to leave**.
- ⚠️ **`javascript_tool` KEEPS THE PAGE'S TOP-LEVEL SCOPE BETWEEN CALLS** — wrap probes in `(()=>{…})()`.
- ⭐ **`scroll-behavior:smooth` eats programmatic scrolls** — use `behavior:'instant'`.
- ⛔ **`computer` LIMITS: `wait` ≤ 10s, `scroll_amount` ≤ 10.** Chain them.
- ⚠️ A SCREEN-READER-ONLY LIVE REGION LOOKS LIKE A 268px OVERFLOW — filter `.sr-only`, `.est-sr`,
  `#estPriceSR`, `.chip-legacy` out of any sweep.
- (Carried) **no numpy, PIL only** · **no libwebp in this ffmpeg; the browser canvas is the only SVG
  rasteriser** · valid stone presets: calacatta, carrara, crema, emperador, eternal, fumo, goldveil,
  mist, nerogold, statuario.

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

⭐⭐ **`.claude/launch.json` IS ATTACH-ONLY NOW — 25 Aug 2026.** It was
`runtimeExecutable:node` + `autoPort:true`, so **every chat that opened a preview spawned its OWN
`node dev-server.js` on a random port** instead of reusing the real one; four strays were found on
63785, 64623, 49613 and 56181, and the fifth hit the per-folder cap and refused to start. It now
carries `url` + `port` and no command, so `preview_start` attaches to the detached server and starts
nothing. ⛔ Do not put `runtimeExecutable` back.

---

## 9. ⭐ WHERE THINGS STAND

| Page | State |
|---|---|
| **`/`** | opens on his film at every band; ⭐ **the film is now a ONE-WAY journey — the ending becomes the top of the document and only a refresh replays it (D403)**; three story beats per band, a pill skip control, a sticky action bar on both narrow bands |
| **`/about/` + six internal** | the `.page-head` family on his own night render, copy band at 10:1. ⭐ **The sticky bar rises here now** |
| **`/services/*.html`** | nine leaves, each on its own photograph; ⭐ **section headings gilded, spacing fixed, Why Topcat redesigned, TWO mid-page CTAs, porcelain on the materials strip** |
| **`/stones/`** | 132 pages + collection + compare; ⛔ **the slabs are untouched by his order** |
| **`/materials/` `/guides/` `/worktops/` `/sitemap.html`** | the 26-page SEO layer; same heading, spacing and divider treatment |
| **`/trade/`** | eight sections; ⭐ **its five dead contact links now work** |
| ⭐ **`/terms/` `/privacy/`** | **NEW.** His terms verbatim; a privacy policy written from an audit |
| **all 178 pages** | one footer, one mobile nav, ⭐ **working Privacy / Terms / Cookies links**, every trust tag white **at weight 500**, every form validating, ⭐ **a sticky contact bar on both narrow bands** |

⚠️ **SHARED PHOTOGRAPHS NOT TO DELETE**: `kitchen-day.jpg`, `hero-night-*`, `og-cover.jpg`,
`team/fitting.jpg`, `pagehead-*`, and everything inside the dot-folders under `assets/video/` and
`assets/site/`.

---

## 10. ⛔ RULES THAT MUST NOT BE BROKEN

1. ⛔ **Fabrication is IN-HOUSE (D202)** — "our experienced fabricators". It has flipped three times.
2. ⛔ **Never "laser" anything.** They template **by hand**.
3. ⛔ **The brand is "Topcat", one word.**
4. ⛔ **A stone's NAME and PHOTOGRAPH must match the supplier's own.**
5. ⛔ **Never state what we cannot guarantee, and never use an absolute.**
6. ⛔ **Every measurement in millimetres.**
7. ⛔ **Never a bright or gold line across the TOP of a card or section.** ⚠️ **D395 is a client
   reversal for INNER-PAGE SECTION DIVIDERS ONLY**, made with the alternative in front of him. ⛔ It
   does not reopen the rule for cards, tiles or panels, and nothing hard-edged or full-bleed goes
   back on a section.
8. **No showroom. Never show the review count. Value, not cheap.**
9. **Voice:** quietly confident master. British English, commas not em dashes, no exclamation
   marks, **no AI slop, no jargon**. ⚠️ Customer review quotes are verbatim and exempt.
10. ⛔ **The logo is the client's artwork, never re-drawn or re-coloured. Set HEIGHT only.**
11. ⛔⛔ **A mark is never put in a circle, ring, disc or plate.** ⚠️ A control is not a mark.
    ⛔ **And a dark shape with an EDGE has been rejected twice.** ⭐ **NEVER A GRADIENT OVER A SLAB
    PHOTOGRAPH EITHER.**
12. ⛔ **One device at a time unless he says otherwise.** ⚠️ **D403 was applied at ALL THREE BANDS**
    because his rule was stated generally (*"they have to refresh to see the video again"*) and an
    inconsistent film across bands at launch would be worse. **He was told plainly.**
13. ⛔⛔ **TWO NUMBERS: WhatsApp → 07464 940287 (mobile). Every `tel:` → 0800 098 2812 (freephone).**
14. ⚠️⚠️ **SUPERSEDED FOR THE NEXT ROUND — SEE §2.2.** The rule was *"this is a design build, never
    raise the missing form backend as a blocker"*. **He has now asked for the forms and emails to
    work**, so it is a task. ⛔ It still is not a blocker for anything else.
15. ⛔⛔ **2 CREDITS MAXIMUM PER GENERATED IMAGE.** ⭐ **This round spent nothing.**
16. ⭐⭐⭐ **SITE SPEED IS KEY** — his own words, and his named first item for the next round.

---

## 11. OPEN — DO THESE NEXT

### ⭐⭐⭐ The three he has just named

1. ⭐⭐⭐ **THE SITE-SPEED PASS** — §2.1. Asked for twice now.
2. ⭐⭐⭐ **THE FORMS AND EMAILS, FOR REAL** — §2.2. **One string, once item 3 is answered.**
3. ⭐⭐⭐ **THE AUDIT ROUND** — §2.3.

### ⭐⭐⭐ The one that is blocking two of the three

4. ⭐⭐⭐ **HOW DO FILES ACTUALLY REACH `thadeusg3.sg-host.com`?** Asked more than a dozen times.
   **Everything from D291 onward is still NOT live** — his video, every word of the film's copy, all
   three device builds, the contact controls, the whole launch-prep round and this one.
   ⚠️ **IT IS NOW ALSO THE ANSWER TO "MAKE THE FORMS WORK"** — the endpoint needs a host that can
   accept a POST and send mail. **The two questions are one question.**

### ⭐⭐ Owed answers from him

5. ⭐⭐ **IS THE CORNER-BUTTON FLICKER STILL THERE?** §1a. **Cannot be verified from here.**
6. ⭐⭐⭐ **HIS TERMS CONTRADICT THE SITE IN THREE PLACES.** Copied verbatim on his instruction and
   deliberately not "fixed" — legal text is his:
   - **§5.1 "workmanship for 2 weeks"** against a site that promises a **ten-year guarantee** and
     72-hour aftercare.
   - **§10.2 disputes via the "Financial Ombudsman"** — the FOS covers financial services, not
     worktop installation, so that route does not exist for this business.
   - **§12 ends "www.topcatworktops.com"** where the business is **.co.uk**.
7. ⭐⭐ **THE PRIVACY POLICY IS MISSING THREE FACTS ONLY HE HAS** — the **ICO registration number**,
   the real **retention period**, and the **mail/CRM processor** once one is chosen. ⛔ Inventing any
   of them is exactly the guessing he forbade.
8. ⭐⭐ **DO THE MID-PAGE CTAs GO ON THE MATERIALS, GUIDES AND COUNTY PAGES TOO?** §2.4.
9. ⭐⭐ **WHOSE ARGENTO DOES HE SELL?** His reference is a dense flecked grey-white; the site shows
   the supplier's veined marble-look. ⛔ Do not paste the Google image.
10. ⭐⭐ **THE STONE PHOTOGRAPHY AUDIT** — 24 of 132 verified; **92 Nile Stone tiles unverified**.
11. ⭐⭐ **THE PHONE'S KITCHEN WASH REWORK** — §2.3, the plan is written.
12. ⭐⭐ **THE HEADLINE WORDING** — he is still taking the client's input. Three alternates parked.
13. ⭐ **THE HERO PLATE FOR THE ENDING.** Withdrawn at D328. ⚠️ His f7 renders may be exactly that.
14. ⭐⭐ **DOES THE FILM WANT SOUND?** The masters carry PCM; the site drops it. Never discussed.
15. ⭐ **THE 19 DRONE VIDEOS** (Hornchurch, Rickmansworth) — worth re-asking now the site carries film.
16. ⚠️ **THE GROWTH ON THE FIRST SCREEN IS OUT.** D350 added it on his *"it should get bigger"*;
    D352 removed it. **He has not been asked whether he wants it back.**
17. ⭐⭐ **THE PHONE'S BAR** — the skeleton crosses his 11-Aug *"already formed from the top"* ruling.
    **One word puts it back: delete the two `header.bar.preform::after` lines.**
18. ⭐⭐ **A QUOTE CARD FOR THE PHONE AND TABLET.** D300 is desktop-only because he said so.
19. ⭐⭐ **THE SITEMAP LINK'S GOLD STYLING** — `seo.css` has the rule, no footer has the hook.
20. ⭐⭐ **Trade terms** — payment, minimum order, lead times, a dedicated contact. **His stated
    first priority.**
21. ⭐⭐ **Two sentences for Nick and Rimsha** · **the credit ceiling** · **Calacatta Gold licensing**
    · **the fireplace scope, with Nick** · **Ali Jaffer and Kav / Uxbridge**.
22. ⭐ **Confirm the silica / HSE sentence in his own words (D202).**
23. ⭐ **Kitchen islands is not on his service list** — the page is live, linked and dressed (D294).
24. ⭐ **Trustpilot** — recommended against putting 4.0 beside the Google 5.0. He has not ruled.
25. ⚠️ **RIMSHA OR REMSHA?** Still unresolved. Her name is on a public page under her photograph.
26. ⚠️ **THE HORNCHURCH GALLERY SET** — the lead frame is clear, the other 11 were never checked.
27. ⚠️ **Two slabs lean blue and nobody has ruled**: `arabescato-grey`, `calacatta-gold-shimmer`.
28. ⭐ **Facebook, TikTok, YouTube?** ⛔ Do not guess handles.
29. ⭐ **Per-stone og:image** — 132 conversions.
30. ⚠️ **`Next Stone Slabs` is named in one place** — sanctioned by D203. Read D203 before "fixing".
31. ⚠️ **The branch `tablet-round-d197-d200` receives every push** (the remote updates both refs). It
    is a duplicate of `main` and should be deleted once item 4 is answered.

**Still waiting on the client:** whether Quartzite becomes a fourth range, 20mm vs 30mm pricing,
brackets for vanity tops / fireplaces / tables, and the £3k vs £3,850 three-slab discrepancy.

**CLOSED this round:** the trust tags' greyness (for the right reason this time), the section
headings' gold on 167 pages, the title-to-text gap, the Why Topcat list, the grey divider and its two
reversals, the sticky bar on all 176 pages, the trade page's five dead links, "View as grid" on the
tablet, the quote card's gutter, the site-wide responsiveness sweep, `/terms/`, `/privacy/`, the three
dead footer links on 178 pages, porcelain on the materials strip, two mid-page CTAs, the film's
one-way lock, the phone glyph, and the preview server's five-per-folder cap.

---

## 12. ⭐ HOW THIS CLIENT WORKS

⛔⛔⛔ **HIS COMPLAINT NAMES THE SYMPTOM CORRECTLY EVERY TIME. IF YOU "FIX" IT AND HE REPEATS
HIMSELF, YOU CHANGED THE WRONG VARIABLE — DO NOT CHANGE THE SAME ONE HARDER.** ⭐ **THIS ROUND IS THE
CLEANEST EXAMPLE YET: three asks for "white", two colour changes, and the answer was font-weight.**

⭐⭐⭐ **AND WHEN THE MEASUREMENT DISAGREES WITH HIS EYE, HIS EYE IS DESCRIBING SOMETHING THE
MEASUREMENT IS NOT.** He called a 21.1px glyph "too big" beside a 23px one. Both numbers were right
and so was he — a solid shape reads heavier than an outlined one. **Find the measure that matches
what he is seeing, do not argue from the one that does not.**

⭐⭐⭐ **HE WATCHES WHILE YOU BUILD AND HE WILL STOP YOU MID-CHANGE.** This round: the divider
removed → asked back → made full-bleed, and the icon too small → too big → settled, all within
minutes. ⭐ **When he does: revert immediately and completely, say so plainly, and do not defend the
idea.** ⚠️ **AND DO NOT TAKE THE REVERT AS THE END OF THE TASK.**

⭐⭐ **HE REVERSES HIMSELF FREELY AND FAST, AND THE LAST VERSION IS THE ONE HE MEANS.**
⚠️ **When a reversal restores an older mechanism, say so plainly rather than presenting it as new.**

⭐⭐ **HE SENDS CORRECTIONS MID-TURN, CONSTANTLY.** This round had **five**. Finish the one you are
on, read the new one before shipping, then take them in his order. **Read the whole queue before
committing anything.**

⭐⭐ **HE ASKS FOR YOUR OPINION AND MEANS IT.** *"Whatever you think is best."* **Answer with a
recommendation and a reason, then build it.**

⭐⭐ **HIS SCREENSHOTS MARK MOMENTS, NOT LAYOUTS.** ⭐ **When he sends a screenshot of something that
already works, that is a spec, not a complaint.**

⛔⛔ **DO NOT ARGUE YOURSELF OUT OF SOMETHING HE ASKED FOR, AND DO NOT HAND HIM THE DILEMMA.**
**A real constraint is a problem to solve, not a question to return.** ⭐ **THE PORCELAIN PILL IS THE
MODEL:** the ask conflicted with a standing rule, so the conflict was named in one sentence with the
option attached — and he ruled in six words (*"you can just state that porcelain is upon request"*).

⛔⛔ **DO NOT ASK HIS PERMISSION. Commit, push, report.**

⭐⭐ **WHEN YOUR OWN WORK CAUSED THE FAULT, SAY SO IN THE FIRST LINE.** He is fine with that and not
fine with spin. ⭐ **AND WHEN YOU COULD NOT VERIFY SOMETHING, SAY THAT TOO** — §1a was handed to him
as "unverified, here is why, tell me if it persists", and that is the right way to hold it.

⚠️ **HE SWEARS WHEN SOMETHING LOOKS WRONG, AND THE COMPLAINT IS ALWAYS REAL.**

- **Walk the journey, do not check the page.** ⭐⭐ **Look at the result before reporting it done.**
- **Measure, then claim** — and if you could not measure it, say so.
- ⭐⭐ **AND CHECK THE VIEWPORT IN THE SAME BREATH AS THE NUMBER.**

---

## 13. BUDGET AND THE DOCUMENT SET

⭐ **This round spent 0 credits.** Every figure was the browser's own layout engine, a canvas,
`getBBox()` and plain arithmetic; no image, video or audio was generated.

| File | What it is |
|---|---|
| **`HANDOVER.md`** | ⭐ The single current state. §D is the register, **D1–D130, D132–D405**. §2 the standing rules, **§2s SITE SPEED**, §2a the supplier list. ⚠️ **THERE IS NO D131 ROW.** ⚠️ Section numbers are referenced from code comments — **do not renumber** |
| **`Website Demo/index.html`** | ⭐⭐ The whole landing design AND the stylesheet for the seven internal pages. Search `THE SCROLL FILM`, `THE DEAD SCROLL`, ⭐ `cine-done`, `THE STICKY ACTION BAR`, `--photo-fade`, `to-hero`, `skipToEnd`, `THE INTERNAL PAGE HEAD`, `THE TABLET BAND` |
| **`Website Demo/services/service.css`** | ⭐⭐⭐ Dresses all 167 generated pages. ⛔ No footer rules. ⛔ **The tags, buttons and tokens exist HERE as well as in `index.html` — change both, or better, EXTRACT (§5)**. New this round: the section divider, `.ticks`, `.cta-inline`, `.legal`, `.mat-note` |
| **`Website Demo/assets/tcform.js`** | ⭐⭐⭐ **ONE BEHAVIOUR FOR ALL 38 FORMS**, and **the `ENDPOINT` constant that is §2.2's whole task** |
| **`Website Demo/stones/stone.css`** | ⭐⭐ The collection and the 132 stone pages. ⛔ **Read the `.stile-name` note before touching the tiles** |
| **`Website Demo/build_pages.py`** | ⭐⭐ Seven internal pages, `site.css`, `site.js`, `footer.css`, `nav.css`. ⚠️ **RUN IT FIRST.** ⭐ `_is_nav_sel()` now carries the sticky bar into `nav.css` — **the extract-don't-copy pattern** |
| **`Website Demo/build_seo_pages.py`** | ⭐⭐ The 26-page SEO layer **plus `/terms/` and `/privacy/`**. ⭐ `gold_head()` vs `gold_last()` — section headings vs the h1 |
| **`Website Demo/services/build_services.py`** | ⭐⭐ The nine leaves. ⭐ `cta_inline()` and `related_intro_materials()` are new |
| **`Website Demo/make_upload.py`** | ⭐⭐⭐ Writes a clean `../upload/`. ⚠️ Dot-folders never ship; comments stripped on the way out. **⭐ §2.1 starts here** |
| **`Website Demo/.htaccess`** | ⭐⭐ Cache rules, mp4/webm for a week. ⚠️ A dotfile |
| **`assets/footer.css` `assets/nav.css`** | ⛔ **GENERATED.** Never edit |
| ⛔ **`trade/build_trade.py`** | ⛔⛔ **SUPERSEDED — DO NOT RUN** |
| ⛔ **`build_images.py` `patch_images.py`** | ⛔⛔ **ONE-SHOT, CANNOT RUN AGAIN** |
| **`assets/video/.src-2026-08-23/`** | ⭐⭐ His masters + `encode.sh` with the full method. **⛔ Read the SSIM/MB tables before re-compressing anything (§2.1)** |
| `HANDOVER-2026-08-24-launch-prep-start-here.md` | ⭐ The START HERE this file replaces (D378–D390) |
| `HANDOVER-2026-08-24-phone-and-tablet-rounds-start-here.md` | ⭐ **Read it for the film's text at every band** |
| `HANDOVER-archive-to-2026-08-06.md` | ⚠️ **Every design the client rejected, in his words.** Read before redesigning anything |

### ⭐ THIS ROUND'S COMMITS, IN ORDER

```
025bdf3  D391–D399  the inner pages get their gold, their spacing and a sticky contact bar
b39e159  D400–D401  porcelain joins the materials strip, and the service pages ask twice more
7d2d07d  D402       marble, quartz, granite and porcelain — his correction
05116c8  D403–D405  the film is a one-way journey, and the corner buttons get their icon back
```
