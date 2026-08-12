# ⛔ SUPERSEDED — archived 11 August 2026

> **This is no longer the START HERE.** It was replaced at the end of the SECOND mobile round;
> read `HANDOVER-NEXT-CHAT-START-HERE.md` instead.
> ⚠️ It describes a phone with three sections built, a review swipe that did **not** work on the
> client's iPhone, no sticky bottom bar and a nav that formed on scroll. All four have changed
> (D99–D108). Kept for the reasoning it carries, not for its state.

---

# START HERE — 11 August 2026, end of the FIRST MOBILE ROUND

Read this, then `HANDOVER.md` **§D** (the decision register, start at **D90–D98**) and **§2**
(the standing rules, especially **rule 15**). That is about fifteen minutes and it is enough to
work safely.

> ⚠️ **This replaces the version written after the alphabetical-order / V2-removal / Mirror-range
> round**, now archived as `HANDOVER-2026-08-11-alphabetical-v2-mirror-start-here.md`. That file
> described a site where **desktop design was still open** and **no mobile work had been done**.
> Both have changed.

---

## 0. ⛔ SCOPE, BEFORE ANYTHING ELSE

**DESKTOP DESIGN IS FROZEN (D91). THE WORK IS MOBILE. TABLET IS NOT IN SCOPE.**

> Client, 11 Aug: *"After this, desktop will stay exactly as it is in its current design, until I
> decide to change it again… then you and I are going to work on the mobile and tablet sections.
> **When I mention changes, I'm only referring to mobile**, and then afterwards I will say we're
> going to work on tablet. So when I say let's do mobile, then we only work on mobile.
> **Everything else stays exactly as it is on the other devices.**"*

⚠️ **This is structurally easy to break.** `index.html` is one file with **inline CSS**, so nearly
every rule is unscoped and applies at every width. ⛔ **Put mobile work inside a width-scoped
media query. Never edit a base rule to fix mobile** — that changes the desktop he has just frozen,
and it will render perfectly while doing it (§9).

**The breakpoints in play:**

| Band | What it gets | Status |
|---|---|---|
| **≤ 720px** | the mobile build (this round) | ⭐ live scope |
| **721–1120px** | the old tablet/fallback layouts | ⛔ **frozen, untouched** |
| **≥ 1121px** | the desktop composition | ⛔ **frozen, signed off** |

⚠️ 720px is the established mobile ceiling here and it **clears iPad portrait at 768px**, which is
what keeps tablet out of scope. ⚠️ A `max-width:900px` query would catch tablet — check which
existing breakpoint governs before adding a new one.

### ⭐ PROVE THE FREEZE, DO NOT ASSERT IT

The pattern used for every change in this round, and the one to keep using:

1. `cp index.html _regress-before.html` **from the pre-change backup**, and serve both.
2. Probe the same set of rects and computed styles at **1440×900** and **768×1024** in each.
3. Diff. Identical output is the evidence.
4. ⚠️ **Delete the temp copy afterwards** — left live it is an indexable page (D60's failure
   mode), and the live-reload will 404 on it in the console until you do.

⚠️ **Two traps that will make you call a difference a regression when it is not:**
- **Card entrances depend on scroll HISTORY, not scroll position.** A freshly loaded file shows
  cards parked where an already-scrolled one shows them seated. Give both files the same history.
- **An open review's height ANIMATES over .45s.** Probe too early and you get the collapsed
  height and a nonsense gap.

---

## 1. ⛔ RUN THIS BEFORE YOU DEPLOY, AND BEFORE YOU CALL ANYTHING DONE

```bash
cd "Website Demo/stones" && python3 harvest/verify.py
```

> 132 stones, 132 with a photograph, 132 pages on disk — ✅ PASS

**Nine checks**, every one of which exists because it caught something already live. ⭐ Checks 8
and 9 — the photograph's supplier, and the name against the supplier's own title — are the most
important. Full detail in §3.

⚠️ **This gate covers the STONES only.** Nothing in it looks at the landing page's layout, so a
mobile change is verified by measurement and by opening the page, not by this.

---

## 2. WHERE IT STANDS

```bash
node "Website Demo/dev-server.js"      # → http://localhost:5501
```

⭐ **VIEWING IT ON A REAL PHONE.** The dev server binds to every interface, so it is already
reachable on the LAN — open `http://<mac-lan-ip>:5501` on a phone on the same Wi-Fi
(`ipconfig getifaddr en0` gives the address). Live reload works over the network, so the phone
refreshes as you save. ⚠️ The IP and the port both move — the launch config picks a free port and
this session ran on both `5501` and `55032`.

**⚠️ There is no git.** This is a GitHub ZIP, not a clone. Take a dated `index.html.pre-<thing>.bak`
before any large edit — those backups are the only version control there is, and this round's
side-by-side regression pattern depends on them.

| | |
|---|---|
| Live pages | **167** |
| The range | **132 stones**, every one with a real supplier photograph and a description written from it |
| Quartz | 67 — 51 light, 16 dark |
| Marble & Quartzite | 45 — ⚠️ 18 marble, 26 quartzite, 1 travertine |
| Granite | 20 — ⚠️ only 9 of them light |
| Versions | **one.** V2 is gone (D87) |
| Desktop design | ⛔ **closed (D90/D91)** |
| Mobile design | ⭐ **in progress — hero, reviews and services done** |
| Tablet design | ⛔ **not started, and out of scope until the client says** |

### The two things that actually block go-live — unchanged, and neither is design

1. ⭐⭐ **The enquiry form has no backend, and it carries file uploads.** `buildEnquiry()` in the
   CTA IIFE assembles a `FormData` and has nowhere to POST. The client was burned by a previous
   agency whose site produced **one client in nine months**, and this engagement will be judged on
   **measurable leads**. There is nothing to measure. Netlify Forms with uploads is the obvious
   fit. **Top open item for nine sessions.**
2. **Photography — the STONES are done. The PEOPLE and the PROJECTS are not.** Three director
   portraits, one Why feature shot, three About work photographs, and eight gallery projects that
   currently reuse service images under invented names and places.

---

## 3. ⛔ THE INTEGRITY RULE — still the one that matters most

The client, after finding a stone whose photograph did not match its name:

> "These names cannot be wrong. If someone googles it and sees it looks different here, then we
> have a big problem. And if someone chooses this one by this name and TopCat somehow shows up at
> the house with a wrong looking slab, then we are fucked."

⭐ **A stone name is only meaningful RELATIVE TO A SUPPLIER.** "Calacatta Gold" is a marketing name
that different manufacturers put on completely different-looking products, so the site can never
be validated against a generic Google image. **The only defensible test is that the photograph
shipped under a name is the one THAT supplier publishes under THAT name.** Checks 8 and 9 enforce
exactly that.

### ⛔ FOUR WAYS THIS HAS ALREADY GONE WRONG

1. **Wrong finish under a plain name — 15 stones.** Provenance was right on every one and they
   were still wrong, because our name dropped the supplier's finish word. **Check 9 fails the
   build on this.**
2. **Right stone, wrong VIEW.** Calacatta Oro came from the right supplier under the right name
   and still looked like a different stone, because the window was a tight zoom on a quiet patch.
   ⭐ **A tile must show the stone at a scale where its PATTERN is recognisable.** No check catches
   this. Only the eye does.
3. **A rename made by the agent.** ⛔ Reverted.
4. ⭐ **A SUBSTITUTION made by the agent.** Asked for the Mirror range, a search of one supplier
   listing concluded those names existed nowhere and shipped a different range under a search
   alias. **The supplier's own search box returns all six in one request.** ⛔ **Search the
   supplier's own search before concluding a product does not exist, and never substitute a
   different product for the one you were asked for.** D88 → D89.

⚠️ `stones/supplier_names.py` holds **seven authorised name differences** — five are the
supplier's own misspellings, plus `Carrara Jumbo` (a slab FORMAT) and a travertine's `H/F`. ⭐ An
entry there AUTHORISES the difference and records the exact string an order must be placed
against. ⛔ It is **not** a licence to rename a different product.

---

## 4. ⭐ THE MOBILE ROUND — WHAT WAS BUILT, AND WHAT IT TAUGHT

Nine decisions, **D90–D98**. Read those rows before touching any of it.

### What is done

| Section | State |
|---|---|
| **Final CTA** | plain grey card, `--ink-2` (D90). ⭐ The last desktop change |
| **Hero** | fully centred; matched **bevel** bottom edge at **30°**; no "Scroll" word; bottom edge raised 57px; the two CTAs now as wide as the icon row, no wider (D92, D97, D98, D100) |
| **Reviews** | swipeable carousel, neighbours peeking, pager below, whole review opens in one go — and since the second round it **rolls like a drum** and the swipe finally works on a phone (D93–D95, D101, D102) |
| **Services** | the desktop **helix**, rebuilt for a phone: five cards, two inert ghosts; the drag no longer scrolls the page with it (D96–D98, D103) |
| **Sticky bottom bar** | ⭐ new: call / email / get a quote, rising once the hero's CTAs go by (D99) |
| **Project gallery** | ⭐ new: arrives earlier, rises from below like a firework, gold rim, cards and copy higher (D105) |
| Everything else | ⛔ untouched — still the desktop-era layout at phone width |

> ⭐ **THE SECOND MOBILE ROUND (D99–D105) ADDED ONE PIECE OF SHARED MACHINERY: `attachSwipe`.**
> It is the single gesture arbiter for both phone carousels. Read its header comment before
> touching either one. ⛔ It sets `touch-action:none` and therefore scrolls the page BY HAND on a
> near-vertical drag — that is not incidental, it is what stops the browser stealing a swipe
> (D102) and what stops a diagonal drag moving the screen (D103). ⚠️ `html` carries
> `scroll-behavior:smooth`, which silently throttles any hand-rolled scroll to a third of the
> finger's travel; the arbiter overrides it inline for the length of a gesture.

### ⛔ THE SIX LESSONS THAT COST TIME, IN THE ORDER THEY WILL BITE AGAIN

1. ⛔ **A PHONE GESTURE MUST ANSWER TO A MOUSE AND A TRACKPAD TOO (D94).** The review swipe
   shipped bound to `touchstart`/`touchmove`/`touchend` only, so on the client's MacBook it did
   **nothing at all**. ⭐ **A phone layout is looked at on a DESKTOP browser far more often than on
   a phone during a build, including by the client.** Bind three paths: touch, pointer events
   filtered to `pointerType==='mouse'`, and a **`wheel` with `deltaX`** (a two-finger trackpad
   swipe fires nothing either drag handler hears). ⚠️ It passed its own verification because the
   tests **synthesised touch events** — that proves the handler works, not that a person can reach
   it.
   - ⚠️ Mouse-drag traps: bind move/up to the **window** or a drag leaving the element sticks, and
     `user-select:none` while dragging or the text selects and the belt looks frozen.
   - ⚠️ Trackpad trap: **momentum fires wheel events for ~1s after the fingers lift**, so one flick
     pages several times without a quiet-period lock.
   - ⚠️ The Browser pane **translates mouse to touch below 768px**, so a drag performed there
     exercises the TOUCH path. Dispatch `PointerEvent`s with `pointerType:'mouse'` to test the rest.
2. ⛔ **SCOPE JS-BACKED PHONE WORK WITH A CLASS OR A CSS VARIABLE, NOT A SECOND MEDIA QUERY.**
   `.rev-solo` is set from `perPage()===1`; the helix reads `--hxMode` off the stage. **A second
   opinion about what a phone is has been this project's most repeated bug** — D51, D59, D68, D78.
   ⚠️ The two already disagreed once: an old `max-width:720px` arrow rule fired at exactly 720px
   where `perPage()` still returned 3.
3. ⛔ **WHEN A DESKTOP COMPONENT IS WANTED ON MOBILE, LIFT ITS CSS INTO A SHARED QUERY — NEVER
   COPY IT (D96).** The helix's card rules moved into
   `@media(min-width:1121px),(max-width:720px)`, placed immediately **after** the desktop block so
   rule order is unchanged. ⚠️ **A desktop component's FLOORS are the trap**: the helix's card
   300px / R 210px / STEP 96px minimums are each wider than a phone can give. Check every
   `Math.max` floor before reusing a desktop measure.
4. ⛔ **A TRANSFORM-SCALED CARD LEAVES SLACK NO CSS RULE NAMES (D95).** `.rev` is `inset:0` inside
   a deck box that is **not** scaled, so `(1-scale)/2` of the deck's height is dead space above
   and below it — 27px a side, and it was most of a spacing complaint. `gridLayout()` writes the
   measured scale out as `--revScale` so the stage is sized from the card the customer can see.
   ⚠️ The phone helix therefore **skips the stage-height cap on the scale**, or stage → scale →
   stage is circular.
5. ⛔ **MASK STOPS THAT MUST LINE UP WITH TEXT GO IN PIXELS, NOT PERCENTAGES (D98).** A percentage
   scales with the **stage**; the thing the stop has to meet is the **copy**, whose bottom sits a
   fixed px distance below the stage top and does not move when the text rewraps. As percentages
   the fade overran the text and **the fifth helix card shipped invisible**.
   ⚠️ A mask reads **alpha**, so an intermediate stop is a partial reveal — that is what puts a
   card behind the intro at 0.10 without touching legibility.
6. ⛔ **DECIDE INTERACTIVITY BY POSITION, NOT OPACITY — AND GUARD THE LISTENER (D97).** The old
   `o<0.1` test left the 0.22-opacity ghosts clickable. ⚠️ **`pointer-events:none` does not stop a
   dispatched click**, so the ghost carries a class the click handler refuses outright.

### ⚠️ Geometry worth writing down

- **The bevel.** `--bevX` is the run, `--bevY` the rise, and **the ratio IS the angle**:
  22/38 = 0.579, tan(30°) = 0.577. ⛔ The hairline is three gradients, and **a gradient's bands run
  perpendicular to its gradient line**, so lying along the cut needs `tan(A)=rise/run` — A is the
  bevel's own angle from the horizontal. `to top right` traced it only while the box was SQUARE.
- **The helix.** The spiral spans **`4·STEP + --hxH`**. Keep that within about a card's height of
  the stage or a card that is supposed to be visible quietly stops being so. ⚠️ **sin is symmetric
  about 90°**, so the card one step out and the ghost two steps out share a sideways offset —
  widen the arc too far and both collapse into one sliver.
- **Vertical room on a phone comes from the CARDS**, not the section: a card's height is 0.66 of
  its width, so trimming width is what buys slots.

---

## 5. ⚠️ THE TRAPS THAT WILL WASTE YOUR SESSION

### Still true from earlier rounds

- ⛔ **`catalogue_source.py` is a 52-STONE SNAPSHOT. It is not the range.** `catalogue_active.py`
  is. Reading the wrong one has caused **four** live defects (D51, D59, D68, D78).
- ⛔ **AN INVENTED DATA VALUE CAN BLANK THE WHOLE SITE.** `preset:"noir"` — a name the engine did
  not know — threw before the reveal observer was wired, so every `.rise` element stayed at
  opacity 0. `node --check` passed, the build passed, verify passed, every route returned 200.
  **Valid presets:** calacatta, carrara, crema, emperador, eternal, fumo, goldveil, mist,
  nerogold, statuario.
- ⛔ **`[hidden]` LOSES TO ANY AUTHOR `display` RULE.** Three instances, one of which meant the
  Refine button did nothing for its whole life.
- ⛔ **CHECK WHAT IS A DIRECT CHILD OF `<body>` BEFORE ADDING A FIXED BACKGROUND.** The stone
  pages' floor is `body::before` at z-index 0 and `nav.crumb` sits outside `<main>`.
- ⛔ **THE RANGE IS ALPHABETICAL EVERYWHERE (D85)**, which reversed D74's tone spreading. Granite
  opens on seven dark stones in a row; the client has seen it.
- ⛔ **THE WHEEL'S SEATING AND ITS ORDER BELONG TOGETHER.** It is sequential now because the list
  is sorted. Put centre-out seating back only if popularity order comes back.
- ⛔ **NO DARK STONE ON THE FIRST SCREEN (D86).** `clearOpening()` protects `OPEN_SPAN` a side and
  splits the deferred darks evenly. ⚠️ Measure the visible window before changing OPEN_SPAN.
- ⚠️ `10cm` in Judy Z.'s review trips the millimetres scan and must stay. A real customer's words.

### Photography

- ⛔ **SUPER-RESOLUTION DESTROYS SPECKLE, and the drift metric does not catch it (D88a).** For a
  speckled or sparkled stone, **resample**; measure high-frequency energy and look at the tile
  before installing any upscale. Super-resolution is still right for veined stones (D77).
- ⚠️ **`-s.webp` IS 800px, NOT 300.**
- ⛔ **`slabify.py` rewrites every tile it accepts.** After any full run:
  `cp -f stones/harvest/_upscale/installed/*.webp assets/slabs/`
- ⛔ **Do NOT run `expand.py`.** It rebuilds from the original 52 and would delete live stones.

### The environment

- ⚠️ **The Browser pane's console REPLAYS STALE ENTRIES.** A `revSolo is not defined` error was
  read as live this session and was not — the dev server had reloaded between two edits. ⭐ Trust
  an instrumented copy: write `_debug.html` with an error probe in `<head>`, load it, read
  `window.__ERRS__`. It returned **zero** errors after driving every control.
- ⚠️ Programmatic `scrollTo` sometimes does nothing on the first call after a live-reload. Set
  `document.documentElement.scrollTop` and read it back; call twice if it reports 0.
- ⚠️ **Cannot push to GitHub from this machine.** No `.git`, no `gh`, no credential helper.
- ⚠️ **`vh` behaves differently on a real phone** — mobile browsers size `100vh` without their own
  chrome and it shifts as the address bar hides. The hero is `min-height:90vh` on mobile, so check
  its bottom edge on a device before adjusting it from an emulator reading.

---

## 6. THE PIPELINE

```bash
cd "Website Demo/stones"
python3 apply_catalogue.py            # MATERIALS + SLAB_TILES into ../index.html, with guards
python3 harvest/similar.py            # measures tiles -> similar.json. BEFORE build.
python3 build_stones.py               # 132 stone pages + the collection grid
python3 harvest/verify.py             # ⛔ the gate, nine checks
cd .. && python3 build_seo_pages.py   # 26 pages incl. the sitemap; re-run whenever the range changes
```

⭐ **One stone list.** `catalogue_active.py` is the only place that says what the site sells. It
concatenates `catalogue_expanded.py` + `catalogue_dark.py` + `catalogue_mirror.py`, then sorts
each material A–Z (D85).

⚠️ `catalogue_dark.py`, `catalogue_mirror.py` and `descriptions.py` exist SEPARATELY because
`grow.py` regenerates `catalogue_expanded.py` — which is how the D46 correction was silently
reverted.

**Adding a stone, and what the gate demands:** image into `harvest/raw/<supplier>/`, tiles at
1600 and 800 into `assets/slabs/`, a `manifest.json` entry, a `slabify-report.json` record
(**check 8 fails without it**), a `catalogue.json` entry with the supplier's OWN title (**check 9
reads this**), a `SUP_DIR` mapping in `verify.py`, a catalogue row and a line in
`descriptions.py` — `build_stones.py` RAISES rather than shipping a stone with no description.

---

## 7. ⛔ RULES THAT MUST NOT BE BROKEN

Full list in `HANDOVER.md` §2. The ones that get broken by accident:

1. ⛔ **A stone's NAME and its PHOTOGRAPH must both match the supplier's own** (§3 above).
2. ⛔ **Fabrication is OUTSOURCED. Never claim in-house.** Templating, fitting and aftercare ARE
   theirs and may be claimed freely.
3. ⛔ **Never state something we cannot guarantee, and never use an absolute.** Comparatives are
   safe. Enforced by check 7 — ⚠️ **on the generated stone pages only**, see §9 item 3.
4. ⛔ **Every measurement in millimetres.** The estimator's linear metres of edging is the one
   exception, because it is a pricing unit.
5. ⛔ **A stone is called what it is; the range is named for what it contains** — "Marble &
   Quartzite". `RANGE_LABEL` in build_stones.py and `MAT_LABEL` in index.html.
6. ⛔ **Never a bright or gold line across the TOP of a card or section**, anywhere.
7. ⛔ **Suppliers are never named publicly.** Porcelain never goes on the stone wheel.
8. **No showroom. Never show the review count. Never signal a young company. Value, not cheap.**
9. **Voice:** quietly confident master. British English, commas not em dashes, no exclamation
   marks.
10. ⛔ **The logo is the client's artwork and is never re-drawn. Set HEIGHT only.**
11. ⛔ **ONE DEVICE AT A TIME. Desktop is frozen and only the client unfreezes it** (§0, rule 15).

---

## 8. ⚠️ WHAT THE CLIENT HAS AND HAS NOT SEEN

⭐ **He is now reviewing on a real phone** (§2), so mobile work is seen as it lands.

**Not yet seen — everything desktop from 7 August onwards:**

1. **The real logo** — nav, footer and favicon, on every page.
2. **The page floor** and the stone pages now standing on it.
3. **About and Why — by SCROLLING, not screenshots.** Both builds are motion.
4. **The stones** — the wheel, the collection, a stone page. Biggest visible change.
5. **The SEO layer** — a material page, then a guide, then a town page, in that order.

⚠️ **Say out loud that the three director portraits and the Why feature shot are placeholders.**

---

## 9. OPEN — DO THESE NEXT

1. ⭐ **Finish the mobile round.** Done: hero, reviews, services, the sticky bottom bar and the
   project gallery's entrance. ⛔ **Not touched at phone width:** the estimator, the stone wheel
   and `/stones/`, the About and Why builds, the process section, the FAQ, the enquiry form, the
   footer and the nav menu, plus every generated page (stones, services, trade, SEO). **Ask the
   client which is next rather than choosing** — he is walking the page section by section and
   describing what he sees.
2. ⭐⭐ **Build the enquiry form backend.** Nothing else changes whether this is judged a success.
3. ⚠️ **A live copy problem is flagged and NOT fixed** — `SERVICES[0].long` in index.html promises
   worktops *"cut from a single slab, vein-matched across every joint"*. That is both a claim to
   fabrication TopCat outsource (rule 2) and an absolute (rule 3), and it is the same sentence
   D63 removed from the stone pages. ⛔ **It is live on tablet widths right now** — the grid is
   hidden on desktop and on mobile but not between. ⚠️ **`verify.py` check 7 does not scan
   index.html's inline data**, which is the gap that let it survive D63. Needs the client's
   approval on new wording.
4. ⭐ **Close the licensing question on Caesarstone, CRL and Bloom.** Twenty live stones come from
   them and `LICENSING.md` says TopCat must BUY from a source for its photography to be
   defensible. ⛔ A business risk, not a code risk. No scan will catch it.
5. ⭐ **Walk the name-and-image audit sheet.** Checks 8 and 9 prove provenance and wording; they
   cannot prove the crop *looks* like the stone. That needs eyes on all 132.
6. ⭐ **Harvest the rest of Bloom, and the three suppliers never touched** — AKG,
   Cosentino/Silestone and Fugen. ⛔ **Classic Quartz Stone is off limits**: their robots.txt
   carries `User-agent: ClaudeBot / Disallow: /`.
7. ⭐ **Calacatta Gold is UNRESOLVED.** The client's intro video is built around it. ⭐ **Needs the
   maker's name from the video.**
8. **Build `/services/`** — the client already assumes it exists.
9. **Have TopCat read the 132 stone descriptions.** No human at TopCat has read them.
10. **Real project photographs and names** for the eight `PROJECTS` entries and four people slots.
11. **The TABLET round**, when the client calls it. ⭐ Two things are waiting for it: the services
    flip-card grid still serves 721–1120px (widen the helix's shared query to `(min-width:721px)`),
    and the reviews' old side-arrow rule still dresses the 721–760px band.
12. **Confirm live paths before go-live**, and re-run all four compliance scans.

**Still waiting on the client:** whether Quartzite becomes a fourth range, the 20mm vs 30mm price
question, brackets for vanity tops / fireplaces / tables, the hero's "Request a call" demotion
(asked four times), and the £3k vs £3,850 three-slab discrepancy.

---

## 10. ⭐ HOW THIS CLIENT FINDS BUGS, AND WHAT IT MEANS FOR YOU

**Every defect of the last six sessions rendered perfectly.** A page showing `322 x 162 mm` looks
no different from `3220 x 1620 mm`. A drawn SVG cartoon under a real stone's name looks like a
slab until you know the range. A blank site looked like a slow load. **A swipe handler bound to
the wrong event type looks exactly like a swipe handler.**

He finds them by **walking the site as a customer would**, and by **using it on the device it is
built for**. The Mirror round was the cleanest example — the build passed all nine checks and he
found the fault in four seconds by typing "mirror" into the search box. The swipe was the next:
he found it by trying to swipe.

- **Walk the journey, do not check the page.** Every recent fault lived in the gap between two
  screens that were each individually correct.
- ⭐ **LOOK AT THE RESULT BEFORE REPORTING IT DONE.** The invented preset, the SVG cartoons, the
  covered breadcrumb, the smoothed-out speckle, the 300px tiles and the invisible fifth card all
  passed every automated check and would have been caught by opening the page once.
- ⭐ **DRIVE THE INPUT A PERSON WILL ACTUALLY USE.** A synthesised event proves the handler works,
  not that anyone can reach it.
- **Measure, then claim.** "0 orphaned pages" was true when written and false for a week.
- **Write the check that fails the build**, not the note that warns.
- ⚠️ **A guard that fires is usually right.** Exceptions get written down with evidence, never
  quietly widened.

---

## 11. BUDGET AND THE DOCUMENT SET

- **~82 credits** of the client's **100-credit ceiling** spent. About **18 left**. ⭐ **This whole
  mobile round cost none** — it is layout and script work, no image generation.

| File | What it is |
|---|---|
| **`HANDOVER.md`** | ⭐ The single current state. §D is the decision register, **D1–D98**, including every reversal. §2 is the standing rules, §2a the client's supplier list |
| **`HANDOVER-2026-08-11-mobile-round.md`** | ⭐ The narrative write-up of THIS round: what was built, what broke, and why each fix is shaped the way it is |
| `HANDOVER-2026-08-11-alphabetical-v2-mirror-start-here.md` | The previous START HERE. Superseded by this file — ⚠️ it predates the desktop freeze and all mobile work |
| **`stones/catalogue_mirror.py`** | ⭐ The Mirror range, and the full write-up of the substitution mistake that preceded it |
| `stones/catalogue_dark.py` | The dark quartz, and **the six candidates rejected, with reasons** |
| **`stones/supplier_names.py`** | ⭐ The seven authorised name differences and the exact string an order must use |
| `stones/descriptions.py` | The 132 descriptions, with the rules for writing them at the top |
| `Docs/topcat-worktops-SEO-LOG.md` | Every URL, title, target query and SEO change |
| `HANDOVER-2026-08-10-slab-photography-complete.md` | ⭐ How the photography pipeline works. Read §2, §3 and §5 before touching `stones/harvest/` |
| `HANDOVER-archive-to-2026-08-06.md` | ⚠️ **Every design the client rejected, in his words.** Read before redesigning anything |

⚠️ **Section numbers in `HANDOVER.md` are referenced from code comments** (`§3`, `§4`, `§5a`,
`§6.7`, `§7.5` are live in `index.html`). **Do not renumber.**

⚠️ **`Website Demo/` holds 46 `index.html.pre-*.bak` files.** They are the only version control
there is, and the regression pattern in §0 depends on the recent ones. This round's are
`pre-cta-plain-bg`, `pre-mobile-hero`, `pre-mobile-reviews`, `pre-swipe-fix`, `pre-rev-spacing`,
`pre-mobile-helix`, `pre-bevel-ghost` and `pre-helix-tune`.
