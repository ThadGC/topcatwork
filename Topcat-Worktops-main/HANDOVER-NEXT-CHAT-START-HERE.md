# START HERE — 25 August 2026, after THE FORMS-AND-SPEED ROUND (D406–D414)

Read this, then `HANDOVER.md` **§D** (the register, newest first — this round is **D406–D412**),
**§2** (the standing rules) and **§2s** (SITE SPEED). About twenty minutes, and enough to work safely.

> ⭐⭐⭐ **SAME-DAY SECOND PASS (D413–D414), on his review:** the email is **v2** — the two
> columns visibly divided, the header names WHICH FORM and WHICH DEVICE (the site's own three
> bands), and three computed sections: *visit at a glance* (visits, time on site), *pages they
> viewed* (with dwell), *step by step*. `tcform.js` is **?v=3** (`form_name`/`device`/`screen`/
> `page_title` + a `Left` pagehide marker). The uploader shows **"+ Add another file"** after a
> first attach. Two dead font weights pruned from every page, the projects "Get a quote" was
> `href="#"` on 2 pages and is /contact/ now — **zero `href="#"` remain shipped**.
> ⭐⭐ **THE LAUNCH VERDICT GIVEN: ready, pending the two host-side facts** — the dev's upload
> (then one real submit into info@'s inbox) and the flicker answer (D405).

> ⚠️ **This replaces the previous version of this same file**, now
> `HANDOVER-2026-08-25-inner-pages-round-start-here.md` (D391–D405). Everything that still
> matters is carried below.

> ⭐⭐⭐ **HIS THREE NAMED ITEMS ARE BUILT: the site-speed pass (D411), the forms and emails
> (D407–D410), and the audit round (D412).** He gave the specs mid-round with his SBX email
> screenshot and corrected one gap live (D406). **Everything is pushed to `main` on his
> instruction: *"push to github so my dev can upload to the test server."***
> ⛔⛔ **THE ONE THING NO LAPTOP CAN DO: SEND REAL MAIL. The forms' last inch happens the moment
> the dev uploads `upload/` to the host — then submit once and look in info@'s inbox. §1.**

---

## 0. ⛔⛔⛔ THE THINGS TO TAKE FROM THIS ROUND

**⭐⭐⭐ 1. A 100vh SECTION POOLS ITS SLACK WHERE justify-content LEAVES IT, AND ON A TALLER
WINDOW THAT SLACK IS SOMEBODY'S "GIGANTIC GAP".** He sent a screenshot: the reviews strap line
floating hundreds of px above the gold divider while the services title sat a fixed distance below
it. `#reviews` is min-height:100vh and top-biased, so ALL its slack pooled under the last line —
188px at a 900 window and growing with every pixel of height. ⭐ **THE FIX BUILDS ONE SIDE'S GAP
FROM THE OTHER SIDE'S OWN FORMULAS:** `.rev-cta{margin-top:auto;padding-top:<the old clamp as a
minimum>}` pins the line to the section's floor, and `#reviews{padding-bottom:calc(#services'
padding-top + .svc-intro's)}` makes line→divider equal divider→title **by construction, at every
window height**. Measured 158/158 at 900, 184/218 at 1050 (the 34 is #services' centring slack —
optically nothing). ⛔ **Do not equalise a PINNED rail's seam from static rects — walk it** (§0.4).

**⭐⭐⭐ 2. A SWEEP PREDICATE THAT DOESN'T KNOW ABOUT ENTRANCES OR SVG REPORTS DESIGN AS FAULT.**
Two false alarms cost real time this round: /trade/ "overlapped" at all 13 widths (SVG internals —
sibling `<g>`/`<path>` rects overlap by design, and `className` on SVG is `[object
SVGAnimatedString]`), and /about/'s name "overlapped" its role at 9 widths (`.rise` cards below the
iframe's fold sit mid-entrance; a transformed ANCESTOR makes child rects lie while the children's
own computed transform reads `none`). ⭐ **The fix: skip SVG internals, force entrances settled
before measuring (`*{transition:none!important;animation:none!important}` +
`.rise{opacity:1!important;transform:none!important}`), and walk UP for transforms, not just at the
pair.** With that: **15 pages × 13 widths = 195 combinations, zero faults.**

**⭐⭐ 3. THE UNREFERENCED SCAN PAYS EVERY TIME IT RUNS.** D315 found 18.7 MB; this round found
**2.7 MB more** — `service-dining.jpg` (2.6 MB, the MASTER whose 880/1600/2400 webp ladder is what
pages actually use) and `team.jpg` (dropped by the About collage; index.html's own comment says so)
were both shipping. ⭐ Moved to `.superseded-2026-08-25/` dot-folders — **originals KEPT, they just
stopped shipping** (⛔ never delete originals). The scan now returns only `favicon.ico` (implicit
browser fetch, keep) and a 0.9 KB brand svg.

**⭐⭐ 4. `php -l` DOES NOT EXIST ON THIS MAC.** `send.php` shipped syntax-checked by careful
re-read and a brace/paren count only. ⚠️ **The first upload to the host is also its first real
parse** — if a submit 500s, read the host's PHP error log before touching the front end.

---

## 1. ⭐⭐⭐ WHAT THIS ROUND BUILT

### ⭐ THE FORMS ARE LIVE (D407) — one string became one file

| Piece | State |
|---|---|
| **`Website Demo/send.php`** | NEW. One PHP file answers all 38 forms → mails **info@topcatworktops.co.uk**. Rides `make_upload.py` into `upload/` |
| **the email** | his SBX grid in Topcat's clothes: near-black header, serif TOPCAT WORKTOPS, champagne NEW ENQUIRY FROM THE WEBSITE, label/value rows in alternating bone/white, gold section caps: MESSAGE · THEIR ESTIMATE · THEIR FILES · WHAT THEY DID ON THE SITE. Reply-To = the customer |
| **`ENDPOINT`** in tcform.js | `'/send.php'` — root-relative so /stones/ and /services/ post to the same file |
| **attachments** | ≤12 MB together ride IN the email; bigger batches saved to `_enquiry-files/<random>/` (no indexes, no handlers, whitelist-renamed) with links in the email. Per-file 50 MB (TC_UP), total 100 MB (tcform) with a human message pointing the largest at WhatsApp |
| **failure path** | `mail()` false → enquiry written to `_enquiry-files/.failed/` (deny-all), visitor told plainly with the phone number |
| **the autoreply** | ⛔ **WRITTEN AND OFF, HIS INSTRUCTION**: *"that will get sent from another email that we create. So I don't have to do that yet."* Flip `$SEND_AUTOREPLY` + `$AUTOREPLY_FROM` when he makes the address |
| **dev mock** | `dev-server.js` answers POST /send.php with `{ok:true,dev:true}` + logs fields — the whole flow drives locally; **never shipped** (make_upload skips dev-server.js) |

⭐ **VERIFIED LOCALLY END TO END:** the enquiry card and a .qform both submit, success states show,
the mock logs `name, email, phone, postcode, message, page, journey, estimate`. ⛔⛔ **REAL MAIL IS
UNVERIFIABLE FROM HERE AND WAS SAID SO PLAINLY.** The moment `upload/` lands on the host: submit
once, look in info@'s inbox, and check the spam folder the first time — `website@topcatworktops.co.uk`
is the From and SPF alignment depends on where the domain's mail actually lives (§5).

### ⭐ THE JOURNEY (D408) — "gather as much data as possible"

`tcform.js` owns two localStorage stores: **`tc_journey`** APPENDS (arrival + referrer/UTM, page
views, clicks on any short-labelled link/button with its section, estimator material/stone picks —
capped 120 events, expires in 30 days) and **`tc_estimate`** OVERWRITES with the latest full
estimator snapshot (material, stone, every piece in mm, slabs, island, extras, the £lo–£hi shown).
The estimator drops notes into a `window.__tcq` array during parse; tcform drains it and swaps in a
live sink — **order-proof, neither script needs the other loaded.**
⛔⛔ **NOTHING TRANSMITS OUTSIDE A SUBMITTED FORM — and /privacy/ was updated IN THE SAME COMMIT.**
"Stores nothing in your browser" was about to become a lie; it now describes the note, its expiry,
and that it leaves the device only inside an enquiry. ⛔ **Change the tracker → change /privacy/,
same commit, always.** ⚠️ Estimator TAB clicks are excluded from the generic click logger
(`#estTabs`) — the specific hook logs them and the email showed every switch twice.

### ⭐ THE REST, SHORT

- **D409 — quote-labelled CTAs → /contact/**: the landing's `.bar-cta`, `.mn-cta`, `.mbar-cta` and
  the hero's `.btn-gold`. The 176 generated pages already pointed there. ⚠️ **KEPT on #cta by his
  own wording (quote-LABELLED):** "Tell us about your kitchen", the "Get in touch" family, and
  **`#estCta` "Get your exact quote"** — the estimator handoff whose stone chip and attachments
  ride the in-page store. **He has not ruled on estCta; one word moves it.**
- **D410 — "Max 50 MB per file"** in `--faint` 11px, bottom-right of the upload block, visible with
  the disclosure open or closed; carried to the five other enquiry-card pages by build_pages.py.
- **D406 — the reviews/divider gap**, §0.1.
- **D411 — the speed pass**, §4.
- **D412 — the audit**, §0.2 and the register row.

---

## 2. ⭐⭐⭐ WHAT THE NEXT ROUND IS

**He has not named it.** The obvious opening move, in order:

1. ⛔⛔ **ASK WHETHER THE DEV HAS UPLOADED, AND WHETHER A TEST EMAIL ARRIVED AT info@.** Until
   that upload, nothing from D291 onward is live. His words this round: *"push to github so my dev
   can upload to the test server"* — **the upload path question (asked a dozen times) is answered:
   the dev pulls from GitHub.** What to upload: **the CONTENTS of `upload/`** into public_html.
2. ⭐⭐ **IS THE CORNER-BUTTON FLICKER STILL THERE?** (D405, carried.) Unverifiable here —
   `backdrop-filter` blacks the pane's screenshot. If yes: the fix is the `position:fixed`
   compositing root, **not another colour**.
3. ⭐⭐ **THE FIRST REAL SUBMIT** may land in spam — if so, the answer is SPF/DKIM for
   `website@topcatworktops.co.uk` at the host, not code.
4. ⭐ The owed client answers, §6.

---

## 3. ⭐⭐⭐ THE FILM'S COPY — FIXED (§3 of the previous file, unchanged, still binding)

The film's copy is FIXED and not reopened. The four false-claim traps and the grammar rule
(trailing "with X" attaches to the nearest noun) are in
`HANDOVER-2026-08-25-inner-pages-round-start-here.md` §3 — check any NEW line against them.
*"decades"* is defensible, *"for life"* is not; *"unique"*, never *"completely unique"*.

---

## 4. ⭐⭐⭐ SITE SPEED — §2s, PLUS THIS ROUND

1. ⛔⛔ **ONE FILM PER BAND, ONE EVER FETCHED — re-verified at all three bands AFTER touching the
   loader** (608/864/1920 by `getAttribute('src')`, zero cross-band URLs).
2. ⭐ **NEW: the poster preloads at `fetchPriority:'high'`** from the same in-place band script —
   first paint IS the poster. ⚠️ The desktop poster is `topcat-intro-poster.webp` (no "1920") —
   a probe grepping for "1920-poster" reports it missing when it is not.
3. ⭐ **NEW: brotli block in `.htaccess`** beside deflate, both IfModule-guarded.
4. ⭐ **2.7 MB of dead masters off the host** (§0.3). Upload: **82.9 → 80.3 MB.**
5. ⭐ Landing first load **~0.72 MB** before the film streams (497 KB html + 121 KB poster + logos
   and fonts). The 132 stone tiles were ALREADY `loading="lazy" decoding="async"` with srcset.
6. ⛔ **NOT touched, deliberately:** the three film encodes (the SSIM/MB tables mark the knee —
   read `.src-2026-08-18/encode.sh` and `.src-2026-08-21/encode.sh` before ever re-compressing),
   the slab photographs (his order, and they are the product), the slab tiles' 1-hour self-healing
   cache (D289), and `tcform.js` stays EXTERNAL (7.5 KB stripped, cached once across 178 pages).

---

## 5. ⭐ THE HOST, THE DEV, AND WHAT "LIVE" TAKES

- **The dev pulls `main` from GitHub and uploads to `thadeusg3.sg-host.com` (SiteGround).**
  What goes up: **the CONTENTS of `upload/`** (run the builders, then `make_upload.py`, commit,
  push). ⚠️ SiteGround's dynamic cache must be flushed in Site Tools after upload (D289).
- **send.php needs**: PHP 7.4+ with mail() — SiteGround default. Raise upload limits only in
  Site Tools → PHP Manager. ⛔ **php_value in .htaccess 500s the site under FPM.**
- **From/SPF**: the email sends From `website@topcatworktops.co.uk`. If the domain's mail lives
  elsewhere (their current info@ host), the first submit may land in spam until the host's SPF
  includes SiteGround. That is DNS, not code.
- `_enquiry-files/` is created at runtime by send.php with its own .htaccess (no indexes, no
  handlers). It never exists in the repo or `upload/`.

---

## 6. ⭐ OPEN — OWED ANSWERS AND CARRIED ITEMS

**Newly answered this round:** how files reach the host (the dev, from GitHub — item 4 of the old
list); §2 rule 14 (forms) — **done, rule retired**; the mid-page CTA question widened? No — still
open, item 4 below.

1. ⭐⭐ **Did the test email arrive at info@?** (and: out of spam?)
2. ⭐⭐ **The corner-button flicker** (D405) — still there on his device?
3. ⭐⭐ **HIS TERMS CONTRADICT THE SITE IN THREE PLACES** (his to rule on): §5.1 "workmanship for
   2 weeks" vs the ten-year guarantee; §10.2 "Financial Ombudsman" (does not cover worktops);
   §12 ends ".com" where the business is .co.uk.
4. ⭐⭐ **Mid-page CTAs on the materials/guides/county families too?** (still un-asked)
5. ⭐⭐ **The privacy policy still needs three facts only he has**: ICO registration number, the
   real retention period, the mail/CRM processor. ⛔ Not guessed, on his own instruction.
6. ⭐⭐ **`#estCta` "Get your exact quote"** — should it also go to /contact/? (D409 kept it.)
7. ⭐⭐ **The autoreply address** — he will create it; then flip `$SEND_AUTOREPLY`.
8. ⭐⭐ Whose Argento; the 92 unverified Nile Stone tiles; the phone's kitchen-wash rework (the
   bake-from-film-time plan is written, D367); the headline wording; film sound; the 19 drone
   videos; the growth on the first screen; the phone bar's preform; a quote card for phone/tablet;
   the sitemap link's gold; trade terms; Nick and Rimsha's sentences; **RIMSHA OR REMSHA**; the
   Hornchurch set; the two blue-leaning slabs; social handles (⛔ do not guess); per-stone
   og:image; `Next Stone Slabs` naming (D203 sanctions it); Trustpilot; Calacatta Gold licensing;
   the palest dozen stone tiles (short of 4.5:1, he knows); the tablet on a wide-short window.
9. ⚠️ **The branch `tablet-round-d197-d200`** still receives every push (one push, both refs).
   Delete once the dev confirms the pull works from `main`.

**Still waiting on the client:** Quartzite as a fourth range, 20mm vs 30mm pricing, brackets for
vanity tops / fireplaces / tables, the £3k vs £3,850 three-slab discrepancy.

---

## 7. ⚠️ THE ENVIRONMENT TRAPS — ALL LIVE

**⭐ NEW THIS ROUND:**

- ⛔⛔ **THE PANE'S SCREENSHOT SCALE BREAKS AT EXPLICIT DESKTOP SIZES** — `resize_window` to
  1440×900 renders the page into a ~220px strip of the capture; zoom is unsupported. Measure with
  rects and judge small visual questions at native/preset sizes, or scale the element under test.
- ⛔⛔ **AN OVERLAP SWEEP LIES TWICE** — SVG internals, and mid-entrance `.rise` ancestors. §0.2.
- ⚠️ **`php -l` does not exist here** — send.php's first real parse is on the host. §0.4.
- ⚠️ **The dev server was restarted this round** to pick up the POST mock — if the pane shows a
  dead page, the server may be freshly down: `cd "Website Demo" && nohup caffeinate -ims node
  dev-server.js > /tmp/topcat-server.log 2>&1 &`

**(Carried, all still live — the full list with explanations is §7 of
`HANDOVER-2026-08-25-inner-pages-round-start-here.md`):** `currentTime` is not the frame on screen
(rVFC is truth) · the film needs ~8s to buffer, the chase 2.5–3.5s to settle · backdrop-filter
blacks the pane's screenshot (inject `*{backdrop-filter:none!important}`, shoot, reload) · a TDZ
crash is invisible to every gate · getComputedStyle mid-transition · measure text after Cinzel
lands · @keyframes inside a non-matching @media never register · drawImage clips off-frame source
rects and leaves the canvas stale · an ID beats a late class · scroll animations are dead in a
background tab and a backgrounded pane tab screenshots black · a reload can drop the pane's
viewport emulation — **read `innerWidth` in the same probe as the number** · a narrow load looks
like a broken page (`--stoneRaster:on` below 720) · an inline style outranks a class rule · a CSS
edit does not show until the builders re-run (`?v=` hashes) · a same-origin iframe sweeps many
pages × widths, 30s timeout, batch 2–4 · `javascript_tool` keeps top-level scope — wrap in
`(()=>{…})()` · `scroll-behavior:smooth` eats programmatic scrolls (`behavior:'instant'`) ·
`computer` limits: wait ≤10s, scroll_amount ≤10 · filter `.sr-only,.est-sr,#estPriceSR,.chip-legacy`
out of sweeps · no numpy, PIL only · no libwebp in ffmpeg; the pane is the only SVG rasteriser ·
valid stone presets: calacatta, carrara, crema, emperador, eternal, fumo, goldveil, mist, nerogold,
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
**The CSS gate** (brace delta 0, count vs HEAD — `index.html` is at **3353** since D413) and
**`node --check` on all three inline `<script>` blocks** after every edit to `index.html` (exclude
`ld+json` and `src=`). ⭐ **div balance: 260/258 since D410** (the max-note div; the +2 delta is
correct and long-standing).

### ⭐ THE FREEZE PROBE — 1440×900, FRESH LOAD, TAB IN FRONT — re-based this round

| Signal | Value |
|---|---|
| `.gal-scroll` height | **4950** |
| `--revPer` (on `#reviews`) | **3** |
| `feTurbulence` count | **60** |
| elements | **2717** ← +2 (the 50 MB note div, the poster preload link) |
| hero ink (`.hero-inner` padding-top) | **86.1828** |
| `#footer` height | **503.78** |
| `.hero-bg` children | **7** |
| broken images / 4xx / console errors | **0 / 0 / none** |
| the film fetched | **one per band: 608 / 864 / 1920** |
| document height, **fresh load** | **24014** ← +21 (D406's reviews floor) |
| document height, **after the film locks** | **15464** |

---

## 9. ⭐ THE LINK, AND THE SERVER

```bash
cd "Website Demo" && nohup caffeinate -ims node dev-server.js > /tmp/topcat-server.log 2>&1 &
```

⚠️⚠️ **THE IP HAS MOVED FOUR TIMES** (last **192.168.10.246**). **Re-check with
`ipconfig getifaddr en0` at the start of every reply that hands him a link.** ⚠️ The server stops
overnight. ⭐ **Detached on purpose — do not `preview_stop` it.** ⭐ **`http://localhost:5501` in
the preview pane**, on his instruction. ⭐⭐ **`.claude/launch.json` is ATTACH-ONLY** (url+port, no
command) — ⛔ do not put `runtimeExecutable` back (five stray servers, D-25-Aug).
⭐ **The dev server now answers POST /send.php with a mock** — see §1.

---

## 10. ⛔ RULES THAT MUST NOT BE BROKEN

1. ⛔ **Fabrication is IN-HOUSE (D202)** — "our experienced fabricators". Flipped three times.
2. ⛔ **Never "laser" anything.** They template **by hand**.
3. ⛔ **The brand is "Topcat", one word.**
4. ⛔ **A stone's NAME and PHOTOGRAPH must match the supplier's own.** Suppliers never named
   publicly (⚠️ except `Next Stone Slabs`, his own D203 exception).
5. ⛔ **Never state what we cannot guarantee, never an absolute.** ⚠️ Verbatim customer reviews
   are exempt — including the one `10cm` in a review on the landing page (D412). Do not "fix" it.
6. ⛔ **Every measurement in millimetres** (exception: the estimator's linear metres).
7. ⛔ **Never a bright or gold line across the TOP of a card or section.** D395's inner-page
   divider reversal does not reopen this anywhere else — and it held in the EMAIL design too.
8. **No showroom. Never show the review count. Value, not cheap.**
9. **Voice:** quietly confident master. British English, commas not em dashes, no exclamation
   marks, no AI slop, no jargon. Reviews verbatim and exempt.
10. ⛔ **The logo is the client's artwork. Set HEIGHT only.**
11. ⛔⛔ **A mark never goes in a circle, ring, disc or plate.** A control is not a mark. Never a
    gradient over a slab photograph.
12. ⛔ **One device at a time unless he says otherwise** — a generally-stated rule may be applied
    per-band-consistently, said plainly (D403 precedent).
13. ⛔⛔ **TWO NUMBERS: WhatsApp → 07464 940287. Every `tel:` → 0800 098 2812.** (Re-verified
    site-wide this round.)
14. ⭐ **RETIRED THIS ROUND:** "never raise the missing form backend" — the backend exists now
    (D407). What remains his: the autoreply address, and the host upload.
15. ⛔⛔ **2 CREDITS MAXIMUM PER GENERATED IMAGE.** ⭐ This round spent nothing.
16. ⭐⭐⭐ **SITE SPEED IS KEY** — his standing rule (§2s), served this round by D411.
17. ⭐ **NEW: change the journey tracker → change /privacy/ in the same commit.** The policy is
    written from an audit of what the site DOES; it must stay true (D408).

---

## 11. ⭐ HOW THIS CLIENT WORKS

The full section is §12 of `HANDOVER-2026-08-25-inner-pages-round-start-here.md` and it is all
still true. The load-bearing lines:

- ⛔⛔⛔ **His complaint names the symptom correctly every time.** If you "fix" it and he repeats
  himself, you changed the wrong variable — measure what is PAINTED, not what is declared.
- ⭐⭐⭐ **When measurement disagrees with his eye, his eye is describing something the
  measurement is not.** Find the measure that matches what he sees.
- ⭐⭐⭐ **He watches while you build and corrects mid-turn** — this round: the gap screenshot and
  the push instruction, both mid-build. Finish the current thing, read the whole queue, take his
  order.
- ⛔⛔ **Do not hand him the dilemma; solve it and name the conflict in one sentence** (the
  estCta call in D409 is this round's example).
- ⛔⛔ **Do not ask his permission. Commit, push, report.** ⭐ And when you could not verify
  something (real mail, the flicker), SAY SO — that is what he trusts.

---

## 12. BUDGET AND THE DOCUMENT SET

⭐ **This round spent 0 credits.** Everything was layout engine, localStorage, grep and arithmetic.

| File | What it is |
|---|---|
| **`HANDOVER.md`** | §D the register **D1–D130, D132–D412** (⚠️ no D131). §2 rules, §2s speed, §2a suppliers. ⛔ Do not renumber sections |
| **`Website Demo/send.php`** | ⭐⭐⭐ NEW — the form endpoint and the branded email. §1 |
| **`Website Demo/assets/tcform.js`** | ⭐⭐⭐ every form + THE JOURNEY (`tc_journey`, `tc_estimate`, `window.__tcq`) + `form_name`/`device`/`screen` and the `Left` dwell marker — now `?v=3` |
| **`Website Demo/index.html`** | the landing + the shared stylesheet. This round: D406's reviews floor, D409's hrefs, D410's note, the estimator's `jot()` hooks, the poster preload |
| **`Website Demo/dev-server.js`** | + the POST /send.php mock (dev only, never ships) |
| **`Website Demo/build_seo_pages.py`** | + the two /privacy/ paragraphs (D408). `?v=2` |
| **`Website Demo/build_pages.py` `services/build_services.py`** | `?v=2` bumps; everything else per the previous file |
| **`Website Demo/make_upload.py`** | unchanged — ships send.php, skips the new dot-folders |
| **`Website Demo/.htaccess`** | + the brotli block |
| `HANDOVER-2026-08-25-inner-pages-round-start-here.md` | the START HERE this file replaces (D391–D405) — the film-copy rules, the full trap list and the client section live there in full |
| `HANDOVER-archive-to-2026-08-06.md` | every design he rejected, in his words. Read before redesigning |

### ⭐ THIS ROUND'S COMMITS, IN ORDER

```
32193a9  D406        the reviews strap line meets the divider at the services title's own distance
559815f  D407–D410   the forms deliver: send.php mails the branded grid to info@, the journey rides along
287eb8c  D411        the speed pass: dead masters off the host, the poster asked for first, brotli offered
<this>   D412        the audit round comes back clean, and the handover moves forward
```
