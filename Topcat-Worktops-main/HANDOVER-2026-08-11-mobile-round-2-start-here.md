# ⛔ SUPERSEDED — archived 11 August 2026 (late)

> **This is no longer the START HERE.** It was replaced at the end of the PERFORMANCE +
> THIRD MOBILE ROUND; read `HANDOVER-NEXT-CHAT-START-HERE.md` instead.
> ⚠️ It describes a site that shipped **3 MB on the first screen**, a phone whose services
> section was a **helix**, a gallery whose copy sat **below** the cards, and a dev server that
> sent everything uncompressed with `no-store`. All four have changed (D109–D114).
> ⚠️ Its §0 also tells you to settle **2.6s** before the freeze probe. That is **wrong** and it
> produced a 415-diff false alarm — the stone wheel needs about **8s**. Kept for the reasoning
> it carries, not for its state.

---

# START HERE — 11 August 2026, end of the SECOND MOBILE ROUND

Read this, then `HANDOVER.md` **§D** (the decision register, start at **D99–D108**) and **§2**
(the standing rules, especially **rule 15**). That is about fifteen minutes and it is enough to
work safely.

> ⚠️ **This replaces the version written after the FIRST mobile round**, now archived as
> `HANDOVER-2026-08-11-mobile-round-1-start-here.md`. That file described a phone with three
> sections built, a review swipe that did not work on the client's iPhone, and no bottom bar.

---

## 0. ⛔ SCOPE, BEFORE ANYTHING ELSE

**DESKTOP DESIGN IS FROZEN (D91). THE WORK IS MOBILE. TABLET IS NOT IN SCOPE.**

> Client, 11 Aug: *"After this, desktop will stay exactly as it is in its current design, until I
> decide to change it again… **When I mention changes, I'm only referring to mobile**, and then
> afterwards I will say we're going to work on tablet. So when I say let's do mobile, then we
> only work on mobile. **Everything else stays exactly as it is on the other devices.**"*

⚠️ **This is structurally easy to break.** `index.html` is one file with **inline CSS**, so nearly
every rule is unscoped and applies at every width. ⛔ **Put mobile work inside a width-scoped
media query. Never edit a base rule to fix mobile** — that changes the desktop he has just frozen,
and it will render perfectly while doing it (§10).

| Band | What it gets | Status |
|---|---|---|
| **≤ 720px** | the mobile build | ⭐ live scope |
| **721–1120px** | the old tablet/fallback layouts | ⛔ **frozen, untouched** |
| **≥ 1121px** | the desktop composition | ⛔ **frozen, signed off** |

⚠️ 720px is the established mobile ceiling and it **clears iPad portrait at 768px**, which is what
keeps tablet out of scope. ⚠️ A `max-width:900px` query would catch tablet — check which existing
breakpoint governs before adding a new one.

### ⭐ PROVE THE FREEZE, DO NOT ASSERT IT — AND RUN IT LAST

1. `cp index.html.pre-<thing>.bak _regress-before.html` and serve both.
2. Probe the same rects and computed styles at **1440×900** and **768×1024** in each.
3. Diff. Identical output is the evidence.
4. ⚠️ **Delete the temp copy afterwards** — left live it is an indexable page (D60's failure
   mode), and the live-reload 404s on it in the console until you do.

⛔ **THIS IS NOT ONLY A CHECK ON DESKTOP, AND D108 IS THE PROOF.** An HTML comment was left
unclosed while a note was being added, which dropped three lines of editor's notes into `<body>`
as visible text and moved **every page down 48px at every width, mobile included**. Nothing looked
broken — the shift was uniform, so screenshots still looked like the site, the JS was fine and
`node --check` could never see it. It was caught only because the probe returned **457 diffs where
the previous run had 18**. ⭐ **It is the one check in this project that reads the whole document
rather than the part being worked on. Run it after the LAST edit, not after the interesting one.**

⚠️ **Two traps that make you call a difference a regression when it is not:**
- **Entrances depend on scroll HISTORY, not scroll position.** A freshly loaded file shows cards
  parked where an already-scrolled one shows them seated. Give both files the same history.
- **The scroll-driven scenes COAST.** The gallery, the wheel and the helix ride an eased playhead
  that keeps drifting after the scroll stops. Settle ~2.6s before probing, or you will diff two
  different moments and read sub-pixel noise as a change.

---

## 1. ⛔ RUN THIS BEFORE YOU DEPLOY, AND BEFORE YOU CALL ANYTHING DONE

```bash
cd "Website Demo/stones" && python3 harvest/verify.py
```

> 132 stones, 132 with a photograph, 132 pages on disk — ✅ PASS

**Nine checks**, every one of which exists because it caught something already live. ⭐ Checks 8
and 9 — the photograph's supplier, and the name against the supplier's own title — are the most
important. Full detail in §3.

⚠️ **This gate covers the STONES only.** Nothing in it looks at the landing page, so mobile work
is verified by measurement, by the freeze probe, and by opening the page.

---

## 2. WHERE IT STANDS

```bash
node "Website Demo/dev-server.js"      # → http://localhost:5501
```

⭐ **VIEWING IT ON A REAL PHONE, AND THE CLIENT DOES.** The dev server binds to every interface,
so it is already on the LAN — `ipconfig getifaddr en0` gives the address, then open
`http://<ip>:<port>` on a phone on the same Wi-Fi. Live reload works over the network.
⚠️ **The port moves**: the launch config asks for 5501 and takes a free one if that is busy, so a
session can be on 5501 and 57144 at once. **When the client says the link is dead, check the port
and the IP before touching the site** — twice now it has been neither.

**⚠️ There is no git.** This is a GitHub ZIP, not a clone. Take a dated `index.html.pre-<thing>.bak`
before any large edit — those backups are the only version control there is, and the freeze probe
depends on them. **47 of them now**; this round's is `pre-mobile-round2`.

| | |
|---|---|
| Live pages | **167** |
| The range | **132 stones**, every one with a real supplier photograph and a description written from it |
| Quartz | 67 — 51 light, 16 dark |
| Marble & Quartzite | 45 — ⚠️ 18 marble, 26 quartzite, 1 travertine |
| Granite | 20 — ⚠️ only 9 of them light |
| Versions | **one.** V2 is gone (D87) |
| Desktop design | ⛔ **closed (D90/D91)** |
| Mobile design | ⭐ **in progress — hero, reviews, services, bottom bar, gallery entrance** |
| Tablet design | ⛔ **not started, and out of scope until the client says** |

### The two things that actually block go-live — unchanged, and neither is design

1. ⭐⭐ **The enquiry form has no backend, and it carries file uploads.** `buildEnquiry()` in the
   CTA IIFE assembles a `FormData` and has nowhere to POST. The client was burned by a previous
   agency whose site produced **one client in nine months**, and this engagement will be judged on
   **measurable leads**. There is nothing to measure. Netlify Forms with uploads is the obvious
   fit. **Top open item for ten sessions.**
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

## 4. ⭐ THE MOBILE BUILD — WHERE EACH SECTION STANDS

Two rounds, **D90–D108**. Read those rows before touching any of it.

| Section | State |
|---|---|
| **Top nav** | ⭐ **already formed at the top of the page** — glass and hairline from scroll 0, flare off (D106) |
| **Hero** | centred; matched **bevel** at **30°**; no "Scroll" word; edge raised 57px; the two CTAs are exactly as wide as the icon row (D92, D97, D98, D100) |
| **Reviews** | swipeable carousel, neighbours peeking, pager below, whole review opens in one go; **rolls like a drum**, and the swipe works on a phone (D93–D95, D101, D102, D107) |
| **Services** | the desktop **helix**: five cards, two inert ghosts; the drag no longer scrolls the page with it (D96–D98, D103) |
| **Sticky bottom bar** | Get a quote · Email · Call, rising once the hero's CTAs go by (D99, D106) |
| **Project gallery** | arrives earlier, rises from below like a firework, gold rim, cards and copy higher (D105) |
| Everything else | ⛔ untouched — still the desktop-era layout at phone width |

### ⭐ ONE PIECE OF SHARED MACHINERY: `attachSwipe`

It sits at the very top of the main `<script>` and is the **single gesture arbiter for both phone
carousels**. Read its header comment before touching either one.

- ⛔ **It sets `touch-action:none` and scrolls the page BY HAND on a near-vertical drag.** That is
  not incidental: it is what stops the browser stealing a swipe (D102) and what stops a diagonal
  drag moving the screen (D103). A change that drops the pass-through, or its release glide,
  strands the customer's finger on a dead patch of screen. **Test by scrolling THROUGH the
  section with a finger on the cards, not past it.**
- ⚠️ **`html` carries `scroll-behavior:smooth`** for the nav's anchor jumps, and it silently
  throttles any hand-rolled scroll — measured, 120px of finger moved the page 45. The arbiter
  overrides it inline for the length of a gesture and puts it back after the glide.
- ⚠️ A trackpad's two-finger **swipe is a `wheel` with deltaX** and fires none of this. Each
  carousel keeps its own wheel handler.
- ⚠️ Every caller gates it on the phone test the stylesheet already declares (`revSolo()`,
  `--hxMode`). **Never add a width test here.**

### ⛔ THE LESSONS THAT COST TIME, IN THE ORDER THEY WILL BITE AGAIN

1. ⛔ **A PHONE GESTURE HAS THREE INPUTS AND THE BROWSER IS THE FOURTH PARTY (D93 → D94 → D102).**
   The review swipe took three builds. Touch-only failed on the client's MacBook; a mouse path was
   bolted beside it; then the touch path failed on his iPhone because `touch-action:pan-y` let the
   BROWSER claim any drag with a real vertical component before a handler could run. ⭐ **The fix
   was not another handler — it was making one arbiter own the gesture.** ⚠️ It passed its own
   tests every time, because synthesised events prove the handler works, not that a person can
   reach it.
2. ⛔ **A CSS TRANSITION CANNOT BE PICKED UP MID-FLIGHT (D107).** The inline transform already
   holds the DESTINATION while the compositor eases toward it, so switching the transition off
   mid-roll **snaps the element to its destination**. One swipe looked right; two in a row jumped,
   which the client read as "it won't let me swipe quickly". ⭐ **Anything a second gesture can
   interrupt must be driven frame by frame from one number**, not by a transition.
3. ⛔ **A DISTANCE-ONLY THRESHOLD REJECTS THE FASTEST GESTURE (D107).** A flick leaves the glass
   after 25–40px, under a 48px throw. **The faster the user swiped, the more certain it was to be
   ignored.** Speed and distance, with a small floor so a tap's drift cannot page.
4. ⛔ **AN UNCLOSED COMMENT MOVED THE WHOLE SITE 48px AND LOOKED FINE (D108).** See §0.
5. ⛔ **SCOPE JS-BACKED PHONE WORK WITH A CLASS OR A CSS VARIABLE, NOT A SECOND MEDIA QUERY.**
   `.rev-solo` from `perPage()===1`, `--hxMode` on the services stage, `--galMode` on the gallery.
   **A second opinion about what a phone is has been this project's most repeated bug** — D51,
   D59, D68, D78, and the gallery was still carrying three raw `M.w<720` tests until D105.
6. ⛔ **WHEN A DESKTOP COMPONENT IS WANTED ON MOBILE, LIFT ITS CSS INTO A SHARED QUERY — NEVER
   COPY IT (D96).** ⚠️ **A desktop component's FLOORS are the trap**: the helix's card 300px /
   R 210px / STEP 96px minimums are each wider than a phone can give.
7. ⛔ **A TRANSFORM-SCALED CARD LEAVES SLACK NO CSS RULE NAMES (D95).** `(1-scale)/2` of the deck's
   height is dead space above and below — 27px a side, and most of a spacing complaint.
8. ⛔ **MASK STOPS THAT MUST LINE UP WITH TEXT GO IN PIXELS, NOT PERCENTAGES (D98).** As
   percentages the fade overran the text and **the fifth helix card shipped invisible**.
9. ⛔ **DECIDE INTERACTIVITY BY POSITION, NOT OPACITY — AND GUARD THE LISTENER (D97).**
   ⚠️ **`pointer-events:none` does not stop a dispatched click.**
10. ⚠️ **READ A LIVE VALUE RATHER THAN RESTATING IT.** The open review's pager drop reads
    `--revAir`, the stage's margin reads the strap's own margin, the drum's step is derived from
    its radius. Every one of those was a bug first: two numbers describing one distance drift the
    moment either is tuned.

### ⚠️ Geometry worth writing down

- **The bevel.** `--bevX` is the run, `--bevY` the rise, and **the ratio IS the angle**:
  22/38 = 0.579, tan(30°) = 0.577. ⛔ The hairline is three gradients, and **a gradient's bands run
  perpendicular to its gradient line**, so lying along the cut needs `tan(A)=rise/run`. `to top
  right` traced it only while the box was SQUARE.
- **The review drum.** `translateZ(−R) rotateY(θ) translateZ(R)`, **in that order** — it puts the
  drum's axis at the screen plane so the front card keeps its true size and only the ones turning
  away recede. ⛔ **R is solved from the neighbour's INNER EDGE, not its centre**: a card turned
  32° is foreshortened to cos(32°) of its width, and holding the centre collapsed the peek from
  44px of visible card to 4.
- **The helix.** The spiral spans **`4·STEP + --hxH`**. Keep that within about a card's height of
  the stage. ⚠️ **sin is symmetric about 90°**, so the card one step out and the ghost two steps
  out share a sideways offset.
- **Vertical room on a phone comes from the CARDS**, not the section: a card's height is 0.66 of
  its width.

---

## 5. ⚠️ THE TRAPS THAT WILL WASTE YOUR SESSION

### Still true from earlier rounds

- ⛔ **`catalogue_source.py` is a 52-STONE SNAPSHOT. It is not the range.** `catalogue_active.py`
  is. Reading the wrong one has caused **four** live defects (D51, D59, D68, D78).
- ⛔ **AN INVENTED DATA VALUE CAN BLANK THE WHOLE SITE.** `preset:"noir"` threw before the reveal
  observer was wired, so every `.rise` element stayed at opacity 0. `node --check` passed, the
  build passed, verify passed, every route returned 200. **Valid presets:** calacatta, carrara,
  crema, emperador, eternal, fumo, goldveil, mist, nerogold, statuario.
- ⛔ **`[hidden]` LOSES TO ANY AUTHOR `display` RULE.** Three instances, one of which meant the
  Refine button did nothing for its whole life.
- ⛔ **CHECK WHAT IS A DIRECT CHILD OF `<body>` BEFORE ADDING A FIXED BACKGROUND.** The stone
  pages' floor is `body::before` at z-index 0 and `nav.crumb` sits outside `<main>`.
  ⚠️ The phone's sticky bar is now also a direct child of `<body>`, at z-index 39.
- ⛔ **THE RANGE IS ALPHABETICAL EVERYWHERE (D85)**, which reversed D74's tone spreading. Granite
  opens on seven dark stones in a row; the client has seen it.
- ⛔ **NO DARK STONE ON THE FIRST SCREEN (D86).** `clearOpening()` protects `OPEN_SPAN` a side.
- ⚠️ `10cm` in Judy Z.'s review trips the millimetres scan and must stay. A real customer's words.

### Photography

- ⛔ **SUPER-RESOLUTION DESTROYS SPECKLE, and the drift metric does not catch it (D88a).** For a
  speckled or sparkled stone, **resample**. Super-resolution is still right for veined stones (D77).
- ⚠️ **`-s.webp` IS 800px, NOT 300.**
- ⛔ **`slabify.py` rewrites every tile it accepts.** After any full run:
  `cp -f stones/harvest/_upscale/installed/*.webp assets/slabs/`
- ⛔ **Do NOT run `expand.py`.** It rebuilds from the original 52 and would delete live stones.

### The environment

- ⚠️ **The Browser pane's console REPLAYS STALE ENTRIES.** ⭐ Trust an instrumented copy: register
  an error probe, drive every control, read it back.
- ⚠️ **The Browser pane translates mouse to touch below 768px**, so a drag performed there
  exercises the TOUCH path. Dispatch `PointerEvent`s with `pointerType:'mouse'` to test the rest.
- ⚠️ Programmatic `scrollTo` sometimes does nothing on the first call after a live-reload. Set
  `document.documentElement.scrollTop` and read it back; call twice if it reports 0. ⚠️ And
  neutralise `scroll-behavior:smooth` around it, or the read comes back mid-animation.
- ⚠️ **Cannot push to GitHub from this machine.** No `.git`, no `gh`, no credential helper.
- ⚠️ **`vh` behaves differently on a real phone** — mobile browsers size `100vh` without their own
  chrome and it shifts as the address bar hides. The hero is `min-height:90vh` on mobile.

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
6. ⛔ **Never a bright or gold line across the TOP of a card or section**, anywhere. ⚠️ It has been
   broken twice by inferring that a particular placement was fine. The phone's sticky bar takes a
   **bone** hairline on its top edge for exactly this reason (D99).
7. ⛔ **Suppliers are never named publicly.** Porcelain never goes on the stone wheel.
8. **No showroom. Never show the review count. Never signal a young company. Value, not cheap.**
9. **Voice:** quietly confident master. British English, commas not em dashes, no exclamation
   marks.
10. ⛔ **The logo is the client's artwork and is never re-drawn. Set HEIGHT only.**
11. ⛔ **ONE DEVICE AT A TIME. Desktop is frozen and only the client unfreezes it** (§0, rule 15).

---

## 8. ⚠️ WHAT THE CLIENT HAS AND HAS NOT SEEN

⭐ **He reviews on a real phone AND on a narrowed MacBook**, and the difference matters: both
faults in D107 were invisible on a mouse and only showed on the phone. **Drive both.**

**Not yet seen — everything desktop from 7 August onwards:**

1. **The real logo** — nav, footer and favicon, on every page.
2. **The page floor** and the stone pages now standing on it.
3. **About and Why — by SCROLLING, not screenshots.** Both builds are motion.
4. **The stones** — the wheel, the collection, a stone page. Biggest visible change.
5. **The SEO layer** — a material page, then a guide, then a town page, in that order.

⚠️ **Say out loud that the three director portraits and the Why feature shot are placeholders.**

---

## 9. OPEN — DO THESE NEXT

1. ⭐ **Finish the mobile round.** Done: the nav, hero, reviews, services, the sticky bar and the
   gallery's entrance. ⛔ **Not touched at phone width:** the estimator, the stone wheel and
   `/stones/`, the About and Why builds, the process section, the FAQ, the enquiry form, the
   footer and the nav menu, plus every generated page (stones, services, trade, SEO).
   **Ask the client which is next rather than choosing** — he is walking the page section by
   section and describing what he sees, and he will say.
2. ⭐ **Two things from this round are worth his eyes specifically**: the hand-rolled vertical
   scroll over the review deck and the helix (it has a glide, but it is not the browser's own),
   and whether "get an estimate" on the bottom bar meant the quote form or the **estimator**.
3. ⭐⭐ **Build the enquiry form backend.** Nothing else changes whether this is judged a success.
4. ⚠️ **A live copy problem is flagged and NOT fixed** — `SERVICES[0].long` in index.html promises
   worktops *"cut from a single slab, vein-matched across every joint"*. That is both a claim to
   fabrication TopCat outsource (rule 2) and an absolute (rule 3), and it is the same sentence
   D63 removed from the stone pages. ⛔ **It is live on tablet widths right now** — the grid is
   hidden on desktop and on mobile but not between. ⚠️ **`verify.py` check 7 does not scan
   index.html's inline data**, which is the gap that let it survive D63. Needs the client's
   approval on new wording.
5. ⭐ **Close the licensing question on Caesarstone, CRL and Bloom.** Twenty live stones come from
   them and `LICENSING.md` says TopCat must BUY from a source for its photography to be
   defensible. ⛔ A business risk, not a code risk. No scan will catch it.
6. ⭐ **Walk the name-and-image audit sheet.** Checks 8 and 9 prove provenance and wording; they
   cannot prove the crop *looks* like the stone. That needs eyes on all 132.
7. ⭐ **Harvest the rest of Bloom, and the three suppliers never touched** — AKG,
   Cosentino/Silestone and Fugen. ⛔ **Classic Quartz Stone is off limits**: their robots.txt
   carries `User-agent: ClaudeBot / Disallow: /`.
8. ⭐ **Calacatta Gold is UNRESOLVED.** The client's intro video is built around it. ⭐ **Needs the
   maker's name from the video.**
9. **Build `/services/`** — the client already assumes it exists.
10. **Have TopCat read the 132 stone descriptions.** No human at TopCat has read them.
11. **Real project photographs and names** for the eight `PROJECTS` entries and four people slots.
12. **The TABLET round**, when the client calls it. ⭐ Three things are waiting for it: the
    services flip-card grid still serves 721–1120px (widen the helix's shared query to
    `(min-width:721px)`), the reviews' old side-arrow rule still dresses the 721–760px band, and
    the nav bar still forms on scroll there.
13. **Confirm live paths before go-live**, and re-run all four compliance scans.

**Still waiting on the client:** whether Quartzite becomes a fourth range, the 20mm vs 30mm price
question, brackets for vanity tops / fireplaces / tables, the hero's "Request a call" demotion
(asked four times), and the £3k vs £3,850 three-slab discrepancy.

---

## 10. ⭐ HOW THIS CLIENT FINDS BUGS, AND WHAT IT MEANS FOR YOU

**Every defect of the last eight sessions rendered perfectly.** A page showing `322 x 162 mm` looks
no different from `3220 x 1620 mm`. A drawn SVG cartoon under a real stone's name looks like a
slab until you know the range. A blank site looked like a slow load. A swipe handler bound to the
wrong event type looks exactly like a swipe handler. **Three lines of editor's notes rendered as
body text looked like nothing at all, and moved the whole site 48px.**

He finds them by **walking the site as a customer would**, and by **using it on the device it is
built for**. The Mirror round was the cleanest example — the build passed all nine checks and he
found the fault in four seconds by typing "mirror" into the search box. The swipe was the next: he
found it by trying to swipe, and then by trying to swipe *fast*.

- **Walk the journey, do not check the page.** Every recent fault lived in the gap between two
  screens that were each individually correct.
- ⭐ **LOOK AT THE RESULT BEFORE REPORTING IT DONE.**
- ⭐ **DRIVE THE INPUT A PERSON WILL ACTUALLY USE.** A synthesised event proves the handler works,
  not that anyone can reach it. ⚠️ And drive it at the SPEED a person will use — D107 was two
  faults that only a fast finger could find.
- **Measure, then claim.** "0 orphaned pages" was true when written and false for a week.
- **Write the check that fails the build**, not the note that warns.
- ⚠️ **A guard that fires is usually right.** Exceptions get written down with evidence, never
  quietly widened.

---

## 11. BUDGET AND THE DOCUMENT SET

- **~82 credits** of the client's **100-credit ceiling** spent. About **18 left**. ⭐ **Both mobile
  rounds cost none** — layout and script work, no image generation.

| File | What it is |
|---|---|
| **`HANDOVER.md`** | ⭐ The single current state. §D is the decision register, **D1–D108**, including every reversal. §2 is the standing rules, §2a the client's supplier list |
| **`HANDOVER-2026-08-11-mobile-round-2.md`** | ⭐ The narrative of THIS round: the gesture arbiter, the drum, and the two faults only a fast finger on a real phone could find |
| `HANDOVER-2026-08-11-mobile-round.md` | The narrative of the FIRST mobile round — the hero, the carousel and the phone helix |
| `HANDOVER-2026-08-11-mobile-round-1-start-here.md` | The previous START HERE. Superseded by this file |
| `HANDOVER-2026-08-11-alphabetical-v2-mirror-start-here.md` | The one before that — ⚠️ predates the desktop freeze and all mobile work |
| **`stones/catalogue_mirror.py`** | ⭐ The Mirror range, and the full write-up of the substitution mistake that preceded it |
| `stones/catalogue_dark.py` | The dark quartz, and **the six candidates rejected, with reasons** |
| **`stones/supplier_names.py`** | ⭐ The seven authorised name differences and the exact string an order must use |
| `stones/descriptions.py` | The 132 descriptions, with the rules for writing them at the top |
| `Docs/topcat-worktops-SEO-LOG.md` | Every URL, title, target query and SEO change |
| `HANDOVER-2026-08-10-slab-photography-complete.md` | ⭐ How the photography pipeline works. Read §2, §3 and §5 before touching `stones/harvest/` |
| `HANDOVER-archive-to-2026-08-06.md` | ⚠️ **Every design the client rejected, in his words.** Read before redesigning anything |

⚠️ **Section numbers in `HANDOVER.md` are referenced from code comments** (`§3`, `§4`, `§5a`,
`§6.7`, `§7.5` are live in `index.html`). **Do not renumber.**

⚠️ **`Website Demo/` holds 47 `index.html.pre-*.bak` files.** They are the only version control
there is. This round's is **`pre-mobile-round2`**, which is the pre-change file both freeze probes
were run against.
