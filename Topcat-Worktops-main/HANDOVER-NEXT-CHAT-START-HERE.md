# START HERE — 25 August 2026, after THE FORMS-AND-SPEED ROUND (D406–D415)

Read this, then `HANDOVER.md` **§D** (the register, newest first — this round is **D406–D415**),
**§2** (the standing rules) and **§2s** (SITE SPEED). About twenty minutes, and enough to work safely.

> ⚠️ **This replaces the previous version of this same file**, now
> `HANDOVER-2026-08-25-inner-pages-round-start-here.md` (D391–D405). Everything that still
> matters is carried below.

> ⭐⭐⭐ **THE ROUND IS COMPLETE AND EVERYTHING IS PUSHED.** His three named items are built —
> the site-speed pass (D411, D414), the forms and emails (D407–D410, D413), the audit (D412) —
> plus his mid-round asks: the reviews gap (D406), the email v2 redesign, the uploader's
> "+ Add another file", and the no-loader ruling (D415). **The launch verdict was given and he
> accepted it: READY, pending two host-side facts.** His instruction: *"push to github. so my
> dev can load it fully functional"* — done, `main` is current and the dev pulls from GitHub.
> ⛔⛔⛔ **THE NEXT CHAT OPENS BY ASKING: (1) has the dev uploaded the CONTENTS of `upload/`,
> and did the ONE TEST SUBMIT arrive at info@topcatworktops.co.uk (check spam the first time)?
> (2) is the corner-button flicker still there (D405)?** Nothing else starts before those.

---

## 0. ⛔⛔⛔ THE THINGS TO TAKE FROM THIS ROUND

**⭐⭐⭐ 1. A 100vh SECTION POOLS ITS SLACK WHERE justify-content LEAVES IT, AND ON A TALLER
WINDOW THAT SLACK IS SOMEBODY'S "GIGANTIC GAP" (D406).** `#reviews` is min-height:100vh and
top-biased, so ALL its slack pooled under the strap line — 188px at a 900 window, hundreds on his
screen. ⭐ **THE FIX BUILDS ONE SIDE'S GAP FROM THE OTHER SIDE'S OWN FORMULAS:**
`.rev-cta{margin-top:auto;padding-top:<the old clamp as a minimum>}` pins the line to the section's
floor, and `#reviews{padding-bottom:calc(#services' padding-top + .svc-intro's)}` makes
line→divider equal divider→title **by construction at every window height** (158/158 at 900,
184/218 at 1050 — the 34 is #services' centring slack, optically nothing). ⛔ **Never equalise a
PINNED rail's seam from static rects — walk the scroll and judge by eye.**

**⭐⭐⭐ 2. A SWEEP PREDICATE THAT DOESN'T KNOW ABOUT ENTRANCES OR SVG REPORTS DESIGN AS FAULT
(D412).** /trade/ "overlapped" at all 13 widths (SVG internals — sibling `<g>`/`<path>` rects
overlap by design; `className` on SVG is `[object SVGAnimatedString]`), and /about/'s name
"overlapped" its role at 9 widths (`.rise` cards below the iframe's fold sit mid-entrance; a
transformed ANCESTOR makes child rects lie while the children's own computed transform reads
`none`). ⭐ **The fix: skip SVG internals, force entrances settled before measuring
(`*{transition:none!important;animation:none!important}` +
`.rise{opacity:1!important;transform:none!important}`), and walk UP for transforms.** With that:
**15 pages × 13 widths = 195 combinations, zero faults.**

**⭐⭐ 3. THE UNREFERENCED SCAN AND THE LIVENESS SCAN BOTH PAY (D411, D414).** 2.7 MB of dead
masters were shipping (`service-dining.jpg` — the ORIGINAL whose webp ladder is what pages use —
and `team.jpg`); moved to `.superseded-2026-08-25/` dot-folders, ⛔ originals KEPT. **Two whole
font weights were loading on every page with zero uses** (Montserrat 200, Cinzel 700 — the one
`font-weight:700` is `.sf-badge`, a Montserrat context that was already faux-bolding); pruned from
all five head templates. ⭐ **CODE THAT LOOKS DEAD AND IS NOT:** `chip-legacy` is the
screen-reader review line; `foot-sitemap` in seo.css is open item's parked hook — a client
decision, not cruft. The five generated stylesheets: 241 classes, exactly 1 without a hook (that
parked one).

**⭐⭐ 4. `php -l` DOES NOT EXIST ON THIS MAC.** `send.php` shipped syntax-checked by careful
re-read and brace/paren counts only. ⚠️ **The first upload to the host is also its first real
parse** — if a submit 500s, read the host's PHP error log before touching the front end.

**⭐⭐ 5. HE REVIEWS A RENDER AND UPGRADES IT THE SAME DAY.** The email preview (SendUserFile of
a sample render) got v1 approved-then-redesigned in one message: *"the problem is we can make it
look even better."* ⭐ **Show the render EARLY — the preview is what turned a vague "grid like
SBX" into six precise asks.** The preview mirror lives in this round's transcript; it is a
one-off, never shipped.

---

## 1. ⭐⭐⭐ WHAT THIS ROUND BUILT

### ⭐ THE FORMS ARE LIVE (D407, email v2 D413)

| Piece | State |
|---|---|
| **`Website Demo/send.php`** | NEW. One PHP file answers all 38 forms → mails **info@topcatworktops.co.uk**. Ships via `make_upload.py` |
| **the email, v2** | ⭐⭐ **the two sides VISIBLY DIVIDED** — labels on a bone column behind a 1px champagne seam, values on white. Near-black header: serif TOPCAT WORKTOPS, champagne NEW ENQUIRY FROM THE WEBSITE, then **"Contact page · Enquiry card · Sent from a phone (390×844)"** — which form, which device, in the header AND the subject |
| **the sections** | person grid → MESSAGE → THEIR ESTIMATE (material, stone, pieces in mm, slabs, island, extras, £range) → THEIR FILES → **THEIR VISIT AT A GLANCE** (device by THE SITE'S OWN three bands, screen, first seen, visits on >30-min gaps, **time on site**, pages, source) → **PAGES THEY VIEWED** (per-page dwell) → **WHAT THEY DID, STEP BY STEP** |
| **`ENDPOINT`** | `'/send.php'` in tcform.js — root-relative, every page posts to the same file |
| **attachments** | ≤12 MB together ride IN the email; bigger batches saved to `_enquiry-files/<random>/` (no indexes, no handlers, whitelist-renamed) with links. Per-file 50 MB (TC_UP), total 100 MB (tcform guard, human message) |
| **failure path** | `mail()` false → enquiry written to `_enquiry-files/.failed/` (deny-all), visitor told plainly with the phone number |
| **the logo** | ⭐ **STAYS TEXT, his own let-out** (*"whatever sends easiest"*): mail clients block remote images until the reader opts in, Gmail strips data: URIs — the styled header always arrives |
| **the autoreply** | ⛔ **WRITTEN AND OFF, his instruction** (*"that will get sent from another email that we create"*). Flip `$SEND_AUTOREPLY` + `$AUTOREPLY_FROM` when he makes the address |
| **dev mock** | `dev-server.js` answers POST /send.php `{ok:true,dev:true}` + logs fields — never shipped |

⭐ **VERIFIED LOCALLY END TO END** — enquiry card and .qform submit, success states show, the mock
logged `name, email, phone, postcode, message, page, page_title, form_name, device, screen,
journey, estimate, file1, file2`. ⛔⛔ **REAL MAIL IS THE ONE UNVERIFIABLE INCH — it happens the
moment the dev uploads. First send may land in spam: that is SPF for
`website@topcatworktops.co.uk` at the host. DNS, not code.**

### ⭐ THE JOURNEY (D408) — "gather as much data as possible"

`tcform.js` (**?v=3**) owns two localStorage stores: **`tc_journey`** APPENDS (arrival +
referrer/UTM, page views, clicks on short-labelled links/buttons with their section, estimator
material/stone picks, a **`Left` pagehide marker** that closes the last page's dwell — capped 120
events, expires in 30 days) and **`tc_estimate`** OVERWRITES with the latest full estimator
snapshot. The estimator drops notes into `window.__tcq` during parse; tcform drains it and swaps
in a live sink — order-proof. The visit maths (visits, time on site, dwell) is computed
server-side in send.php, so the tracker stays tiny.
⛔⛔ **NOTHING TRANSMITS OUTSIDE A SUBMITTED FORM — and /privacy/ was updated IN THE SAME
COMMIT.** ⛔ **Standing rule now: change the tracker → change /privacy/, same commit, always.**
⚠️ Estimator TAB clicks are excluded from the generic click logger (`#estTabs`) — the specific
hook logs them; unfiltered, the email showed every switch twice.

### ⭐ THE REST, SHORT

- **D409 — quote-labelled CTAs → /contact/**: the landing's `.bar-cta`, `.mn-cta`, `.mbar-cta`,
  the hero's `.btn-gold`, ⭐ **and D414 caught the projects `.proj-cta-btn` at `href="#"` on two
  pages** — /contact/ now, **zero `href="#"` remain shipped**. ⚠️ **KEPT on #cta by his own
  wording (quote-LABELLED):** "Tell us about your kitchen", the "Get in touch" family, and
  **`#estCta` "Get your exact quote"** — the estimator handoff whose stone chip and attachments
  ride the in-page store. **He has not ruled on estCta; one word moves it.**
- **D410 — "Max 50 MB per file"** in `--faint` 11px, bottom-right of the upload block, all six
  enquiry-card pages via build_pages.py.
- **D413 — the uploader's invitation**: after a first file, a bordered **"+ Add another file"**
  pill (a control, not a mark — rule 11 holds) with "N of 8" beside it; at 8 it states the cap.
  Verified on the phone band with synthetic files.
- **D415 — NO LOADING ANIMATION BEFORE THE FILM.** He asked for a recommendation; recommended
  against for three reasons (no gap to cover — the poster IS the film's first frame; a fixed wait
  punishes the fast without rescuing the slow; Core Web Vitals); **he accepted.** ⛔ Do not
  re-propose a loader. If the test server feels slow, fix host compression / flush the SiteGround
  cache — never mask it with an animation.

---

## 2. ⭐⭐⭐ WHAT THE NEXT ROUND IS

**He has not named it.** The opening moves, in order:

1. ⛔⛔ **Has the dev uploaded, and did the TEST EMAIL arrive at info@?** (spam folder the first
   time — SPF). Until that upload, nothing from D291 onward is live. **The upload-path question
   is ANSWERED: the dev pulls `main` from GitHub and uploads the CONTENTS of `upload/`.**
2. ⭐⭐ **Is the corner-button flicker still there?** (D405, carried). If yes: the fix is the
   `position:fixed` compositing root, **not another colour**.
3. ⭐⭐ His owed answers, §6.

---

## 3. ⭐⭐⭐ THE FILM'S COPY — FIXED, NOT REOPENED

The film's copy is FIXED (§3 of `HANDOVER-2026-08-25-inner-pages-round-start-here.md` — the four
false-claim traps and the grammar rule live there in full). *"decades"* is defensible, *"for
life"* is not; *"unique"*, never *"completely unique"*.

---

## 4. ⭐⭐⭐ SITE SPEED — §2s, THE STATE AFTER D411/D414

**The wire numbers (gzip -9, what a visitor actually downloads):**

| Surface | First load |
|---|---|
| **landing, phone** | **~290 KB to first paint** (119 KB html + 54 KB poster + ~18 KB logo + fonts); the 3.87 MB film streams BEHIND the poster |
| **landing, desktop** | ~360 KB (122 KB poster); film 13.28 MB streamed |
| **internal pages** | 6–10 KB html + 37 KB site.css + 67 KB site.js, both cached once for all seven |
| **generated pages** | 5–10 KB html + 5.3 KB service.css + 3 KB tcform.js + the hero's srcset rung |
| **stone collection** | 23.8 KB html, all 132 tiles `loading="lazy"` with srcset |

1. ⛔⛔ **ONE FILM PER BAND, ONE EVER FETCHED — re-verified after every loader edit** (608/864/
   1920 by `getAttribute('src')`, zero cross-band URLs). ⚠️ The desktop poster is
   `topcat-intro-poster.webp` (no "1920") — a probe grepping "1920-poster" reports it missing
   when it is not.
2. ⭐ **The poster preloads at `fetchPriority:'high'`** from the in-place band script.
3. ⭐ **Brotli beside deflate in `.htaccess`**, both IfModule-guarded.
4. ⭐ **Fonts: Cinzel 400;500;600 + Montserrat 300;400;500;600** — D414's prune; ⛔ do not add a
   weight back without a `font-weight` use to justify it.
5. ⛔ **NOT touched, deliberately:** the three film encodes (⛔ read the SSIM/MB tables in the two
   `encode.sh` files before EVER re-compressing — the knee is not visible in the SSIM column),
   the slab photographs (his order, and they are the product), the slab tiles' 1-hour self-healing
   cache (D289), `tcform.js` external (cached once across 178 pages), and `site.css`/`site.js`
   per-page pruning (guarded IIFEs, cached once — judged not worth the drift risk at launch).
6. ⛔ **D415: no loading animation, ever, for speed reasons** — §1.

---

## 5. ⭐ THE HOST, THE DEV, AND WHAT "LIVE" TAKES

- **The dev pulls `main` from GitHub → uploads the CONTENTS of `upload/`** into public_html at
  `thadeusg3.sg-host.com` (SiteGround) → **flushes the dynamic cache in Site Tools** (D289).
- **send.php needs**: PHP 7.4+ with mail() — SiteGround default. Raise upload limits only in Site
  Tools → PHP Manager. ⛔ **php_value in .htaccess 500s the site under FPM.**
- **From/SPF**: sends From `website@topcatworktops.co.uk`; until the domain's SPF includes the
  host, the first submit may land in spam. DNS, not code.
- `_enquiry-files/` is created at runtime by send.php with its own .htaccess. It never exists in
  the repo or `upload/`.
- ⚠️ **Rebuild discipline before any push the dev will pull:** builders (§8 order) →
  `make_upload.py` → commit → push. `make_upload.py` refuses a stale build.

---

## 6. ⭐ OPEN — OWED ANSWERS AND CARRIED ITEMS

**Answered this round:** the upload path (the dev, from GitHub); §2 rule 14 retired (forms built);
the loader question (D415, no).

1. ⭐⭐ **Did the test email arrive at info@?** (and out of spam?)
2. ⭐⭐ **The corner-button flicker** (D405) — still there on his device?
3. ⭐⭐ **HIS TERMS CONTRADICT THE SITE IN THREE PLACES** (his to rule on): §5.1 "workmanship for
   2 weeks" vs the ten-year guarantee; §10.2 "Financial Ombudsman" (covers financial services,
   not worktops); §12 ends ".com" where the business is .co.uk.
4. ⭐⭐ **The privacy policy still needs three facts only he has**: the ICO registration number,
   the real retention period, the mail/CRM processor. ⛔ Not guessed, his own instruction.
5. ⭐⭐ **`#estCta` "Get your exact quote"** — also to /contact/? (D409 kept it, one word moves it.)
6. ⭐⭐ **The autoreply address** — he creates it, then flip `$SEND_AUTOREPLY`.
7. ⭐⭐ **Mid-page CTAs on the materials/guides/county families too?** (still un-asked)
8. ⭐⭐ Whose Argento · the 92 unverified Nile Stone tiles · the phone's kitchen-wash rework
   (⛔ the cause is WRITTEN DOWN, D367: `drawImage` clips an off-frame source rect and leaves the
   canvas stale; the agreed fix is BAKE THE WASH FROM FILM TIME) · the headline wording · film
   sound · the 19 drone videos · the first-screen growth · the phone bar's preform ·
   a quote card for phone/tablet · the sitemap link's gold (`foot-sitemap` awaits its hook) ·
   trade terms (his stated first priority) · Nick and Rimsha's sentences · **RIMSHA OR REMSHA** ·
   the Hornchurch set · the two blue-leaning slabs · social handles (⛔ never guess) · per-stone
   og:image · `Next Stone Slabs` naming (D203 sanctions it) · Trustpilot · Calacatta Gold
   licensing · the palest dozen stone tiles (short of 4.5:1; he knows) · the tablet on a
   wide-short window.
9. ⚠️ **The branch `tablet-round-d197-d200`** still receives every push. Delete once the dev
   confirms pulling from `main` works.

**Still waiting on the client:** Quartzite as a fourth range, 20mm vs 30mm pricing, brackets for
vanity tops / fireplaces / tables, the £3k vs £3,850 three-slab discrepancy.

---

## 7. ⚠️ THE ENVIRONMENT TRAPS — ALL LIVE

**⭐ NEW THIS ROUND:**

- ⛔⛔ **THE PANE'S SCREENSHOT SCALE BREAKS AT EXPLICIT DESKTOP SIZES** — `resize_window` to
  1440×900 renders the page into a ~220px strip of the capture; `zoom` is unsupported. The
  mobile PRESET captures correctly. Measure with rects at desktop; judge visuals at presets.
- ⛔⛔ **AN OVERLAP SWEEP LIES TWICE** — SVG internals, and mid-entrance `.rise` ancestors (§0.2).
- ⚠️ **`php -l` does not exist here** — send.php's first real parse is on the host (§0.4).
- ⚠️ **`document height, fresh load` DEPENDS ON WHEN YOU READ IT**: the film runway is sized off
  the video's duration metadata, so a 3.2s read gave 23072 where the settled value is 24014.
  **Read it after the film buffers (~8s), or trust the locked value (15464) instead.**
- ⚠️ **The dev server was restarted this round** for the POST mock — if the pane shows a dead
  page: `cd "Website Demo" && nohup caffeinate -ims node dev-server.js > /tmp/topcat-server.log 2>&1 &`

**(Carried, all still live — full explanations in §7 of
`HANDOVER-2026-08-25-inner-pages-round-start-here.md`):** `currentTime` is not the frame on
screen (rVFC is truth) · the film needs ~8s to buffer, the chase 2.5–3.5s to settle ·
backdrop-filter blacks the pane's screenshot (inject `*{backdrop-filter:none!important}`, shoot,
reload) · a TDZ crash is invisible to every gate — declare module state at the top · a second
`def` of the same name is a silent override · getComputedStyle mid-transition lies · measure text
after Cinzel lands (135px on the headline) · `@keyframes` inside a non-matching `@media` never
register · `drawImage` clips off-frame source rects and leaves the canvas STALE · an ID beats a
late class · scroll animations are dead in a background tab; a backgrounded pane tab screenshots
black (front it first) · a reload can drop the pane's viewport emulation — **read `innerWidth` in
the same probe as the number** · a narrow load looks broken (`--stoneRaster:on` below 720:
feTurbulence 0, elements −570) · an inline style outranks a class rule (`style.removeProperty`) ·
a CSS edit does not show until the builders re-run (`?v=` hashes; index.html's own inline CSS is
direct) · a same-origin iframe sweeps pages × widths; `javascript_tool` times out at 30s — batch
2–4 pages — and keeps top-level scope (wrap in `(()=>{…})()`; deliberate `window.__x` survives
until navigation) · `scroll-behavior:smooth` eats programmatic scrolls (`behavior:'instant'`) ·
`computer` limits: wait ≤10s, scroll_amount ≤10 · filter `.sr-only,.est-sr,#estPriceSR,
.chip-legacy` out of sweeps · no numpy, PIL only · no libwebp in this ffmpeg; the pane is the
only SVG rasteriser · valid stone presets: calacatta, carrara, crema, emperador, eternal, fumo,
goldveil, mist, nerogold, statuario.

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
**`node --check` on all three inline `<script>` blocks** after every `index.html` edit (exclude
`ld+json` and `src=`). ⭐ **div balance: 260/258 since D410.** ⚠️ A brace inside a comment counts.

### ⭐ THE FREEZE PROBE — 1440×900, FRESH LOAD, TAB IN FRONT

| Signal | Value |
|---|---|
| `.gal-scroll` height | **4950** |
| `--revPer` (on `#reviews`) | **3** |
| `feTurbulence` count | **60** |
| elements | **2717** (D410's note div + the poster preload link) |
| hero ink (`.hero-inner` padding-top) | **86.1828** |
| `#footer` height | **503.78** |
| `.hero-bg` children | **7** |
| broken images / 4xx / console errors | **0 / 0 / none** |
| the film fetched | **one per band: 608 / 864 / 1920** |
| document height, **fresh load, AFTER the film buffers** | **24014** ⚠️ an early read shows less (§7) |
| document height, **after the film locks** | **15464** |

---

## 9. ⭐ THE LINK, AND THE SERVER

```bash
cd "Website Demo" && nohup caffeinate -ims node dev-server.js > /tmp/topcat-server.log 2>&1 &
```

⚠️⚠️ **THE IP HAS MOVED FOUR TIMES** (last **192.168.10.246**). **Re-check with
`ipconfig getifaddr en0` at the start of every reply that hands him a link.** ⚠️ The server stops
overnight. ⭐ Detached on purpose — do not `preview_stop` it. ⭐ `http://localhost:5501` in the
preview pane, on his instruction. ⭐⭐ **`.claude/launch.json` is ATTACH-ONLY** (url+port, no
command) — ⛔ do not put `runtimeExecutable` back. ⭐ The dev server answers POST /send.php with
a mock (§1) — restart it after editing dev-server.js.

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
   divider reversal does not reopen this anywhere else — it held in the EMAIL design too.
8. **No showroom. Never show the review count. Value, not cheap.**
9. **Voice:** quietly confident master. British English, commas not em dashes, no exclamation
   marks, no AI slop, no jargon. Reviews verbatim and exempt.
10. ⛔ **The logo is the client's artwork. Set HEIGHT only.** ⭐ In EMAIL it is styled text, his
    let-out (D413) — never an image attachment.
11. ⛔⛔ **A mark never goes in a circle, ring, disc or plate.** A control is not a mark (the
    "+ Add another file" pill is a control). Never a gradient over a slab photograph.
12. ⛔ **One device at a time unless he says otherwise** — a generally-stated rule may be applied
    per-band-consistently, said plainly (D403 precedent).
13. ⛔⛔ **TWO NUMBERS: WhatsApp → 07464 940287. Every `tel:` → 0800 098 2812.** Re-verified.
14. ⭐ **RETIRED:** "never raise the missing form backend" — it exists (D407). Still his:
    the autoreply address, the host upload.
15. ⛔⛔ **2 CREDITS MAXIMUM PER GENERATED IMAGE.** ⭐ This round spent nothing.
16. ⭐⭐⭐ **SITE SPEED IS KEY** — his standing rule (§2s), served by D411/D414, and **D415: no
    loading animation, ever, as a speed answer.**
17. ⭐ **Change the journey tracker → change /privacy/ in the same commit** (D408). The policy is
    written from an audit of what the site DOES and must stay true.

---

## 11. ⭐ HOW THIS CLIENT WORKS

The full section is §12 of `HANDOVER-2026-08-25-inner-pages-round-start-here.md`; all still true.
The load-bearing lines:

- ⛔⛔⛔ **His complaint names the symptom correctly every time.** If you "fix" it and he repeats
  himself, you changed the wrong variable — measure what is PAINTED, not what is declared.
- ⭐⭐⭐ **When measurement disagrees with his eye, his eye is describing something the
  measurement is not.**
- ⭐⭐⭐ **He watches while you build and corrects mid-turn** — this round: the gap screenshot,
  the push instruction, and the speed-priority message all arrived mid-build. Finish the current
  thing, read the whole queue, take his order.
- ⭐⭐ **He asks for your opinion and means it** — D415 is the model: a recommendation with
  reasons, then his one-line ruling. **Answer, do not survey.**
- ⛔⛔ **Do not hand him the dilemma; solve it and name the conflict in one sentence** (the
  estCta call, the email logo).
- ⛔⛔ **Do not ask his permission. Commit, push, report.** ⭐ And when you could not verify
  something (real mail, the flicker), SAY SO — that is what he trusts.

---

## 12. BUDGET AND THE DOCUMENT SET

⭐ **This round spent 0 credits.** Everything was layout engine, localStorage, grep and arithmetic.

| File | What it is |
|---|---|
| **`HANDOVER.md`** | §D the register **D1–D130, D132–D415** (⚠️ no D131). §2 rules, §2s speed, §2a suppliers. ⛔ Do not renumber sections |
| **`Website Demo/send.php`** | ⭐⭐⭐ the form endpoint and the v2 email — §1. ⚠️ First real parse is on the host |
| **`Website Demo/assets/tcform.js`** | ⭐⭐⭐ every form + THE JOURNEY + `form_name`/`device`/`screen`/`page_title` + the `Left` marker — **?v=3** |
| **`Website Demo/index.html`** | the landing + the shared stylesheet. This round: D406's reviews floor, D409's hrefs (+ the projects fix), D410's note, the uploader pill, the estimator's `jot()` hooks, the poster preload, the pruned fonts URL |
| **`Website Demo/dev-server.js`** | + the POST /send.php mock (dev only, never ships) |
| **`Website Demo/build_seo_pages.py`** | + the two /privacy/ paragraphs (D408); fonts URL; ?v=3 |
| **`Website Demo/build_pages.py` `services/build_services.py` `stones/build_stones.py`** | fonts URL + ?v=3 bumps |
| **`Website Demo/make_upload.py`** | unchanged — ships send.php, skips the dot-folders |
| **`Website Demo/.htaccess`** | + the brotli block |
| `HANDOVER-2026-08-25-inner-pages-round-start-here.md` | the previous START HERE (D391–D405) — the film-copy rules, the full trap explanations and the client section live there in full |
| `HANDOVER-archive-to-2026-08-06.md` | every design he rejected, in his words. Read before redesigning |

### ⭐ THIS ROUND'S COMMITS, IN ORDER

```
32193a9  D406        the reviews strap line meets the divider at the services title's own distance
559815f  D407–D410   the forms deliver: send.php mails the branded grid to info@, the journey rides along
287eb8c  D411        the speed pass: dead masters off the host, the poster asked for first, brotli offered
37b5023  D412        the audit round comes back clean, and the handover moves forward
fd793a3  D413–D414   the email divides its two sides and counts the visit, the uploader asks for the next file
<this>   D415        no loader before the film, and the round's own START HERE
```
