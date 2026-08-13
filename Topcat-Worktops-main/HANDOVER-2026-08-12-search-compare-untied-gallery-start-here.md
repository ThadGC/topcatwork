# START HERE — 12 August 2026, end of the SEARCH + COMPARE + UNTIED-GALLERY ROUND

Read this, then `HANDOVER.md` **§D** (the decision register, start at **D132–D143**) and **§2**
(the standing rules, especially **rule 9** and **rule 15**). That is about fifteen minutes and it
is enough to work safely.

> ⚠️ **This replaces the version written after the BASICS + GALLERY-REBUILD ROUND**, now archived
> as `HANDOVER-2026-08-12-basics-and-gallery-rebuild-start-here.md`. That file describes a phone
> with a boxed burger, a deep-curved stone wheel, ringed wheel arrows, a scroll-scrubbed gallery
> accordion and a brand marquee between stones and the estimator. ⛔ **Every one of those has
> changed.** Its §0 also still says the freeze probe is overdue — it was run, and it passed.

---

## 0. ✅ THE FREEZE PROBE WAS RUN, AND THE PROCEDURE IN THE OLD DOC IS WRONG

**Run 12 Aug against `index.html.pre-basics-round.bak` at 1440×900 and 768×1024 — PASSED.**
Floor, galPin, galStage, galScroll, revPage, svcFace and all eight gallery card sizes identical;
document height identical (14641 / 18385); element count +2, which is D120's catch-all line.
**Nothing from the five rounds had leaked.** It was re-run after every change below and passed
each time — this round's baselines are `index.html.pre-navbar-divider-stone.bak` and
`index.html.pre-gallery-untied.bak`.

### ⛔ PARK, DO NOT WALK-AND-SETTLE — the old §0 measures the wrong frame

Walking the page and settling gave four MISMATCHED card sizes on the first pass. The tell was
that the baseline's read **non-monotonic** — 364, 352, 371, 365 — where a real layout is a clean
progression. It was the eased playhead caught mid-flight, not a regression.

⭐ **Scroll to a FIXED offset — `galScrollTop + 2000` — settle 5s, then snap TWICE 1.2s apart and
require the two to be equal.** Both pages then read identically every time. Deterministic beats
long. The old advice ("settle 8 seconds") is guesswork by comparison.

```js
pick(galPin,  ['position','height','overflow'])
pick(galStage,['position','height'])          // + .gal-scroll's height
pick(revPage, ['left','width','backgroundColor','opacity'])
pick(svcFace, ['borderRadius','borderColor'])
allEightGalleryCardSizes                       // the strongest single signal
```

⭐ **FOR A CHANGE THAT TOUCHES THE STONE WHEEL, HASH ALL 67 SLAB TRANSFORMS TOO.** The wheel's
`metrics()` runs at every width, so a phone-only intention is not a phone-only effect until it is
measured. Desktop at 1440 must read `413x273 x4, 200x132 x4`; tablet at 768 `210x138, 211x139 x3,
105x69, 106x69, 106x70 x2`.

⚠️ **`async` awaits DO render frames inside `javascript_tool`.** The old doc says no frames render
between statements in one call — that is true of synchronous code only. An async IIFE awaiting
real timeouts works, which makes park-and-settle possible in a single call.

---

## 1. ⛔ SCOPE — UNCHANGED, AND IT HELD ALL ROUND

**DESKTOP AND TABLET ARE FROZEN. THE WORK IS MOBILE, ON HIS PHONE, OVER THE LAN LINK.**

| Band | What it gets | Status |
|---|---|---|
| **≤ 720px** | the mobile build | ⭐ live scope |
| **721–1120px** | the old tablet/fallback layouts | ⛔ **frozen, untouched** |
| **≥ 1121px** | the desktop composition | ⛔ **frozen, signed off (D91)** |

⚠️ `index.html` is one file with **inline CSS**, so nearly every rule is unscoped. ⛔ **Mobile work
goes inside `@media(max-width:720px)`. Never edit a base rule to fix mobile.**

⭐ **NEW MARKUP CANNOT BE SCOPED BY A MEDIA QUERY (D120).** A new *rule* applies only where its
query matches; a new *element* exists at every width the moment you add it. Default it to
`display:none` in the base rule and let the phone opt in. Used twice more this round (D143's
divider, and it is why the compare entry links needed a decision).

⭐ **THIS ROUND'S PHONE BLOCK IS THE LAST THING IN THE STYLESHEET, ON PURPOSE.** Three rounds have
lost a mobile override to a base rule sitting later at equal specificity (D106, D113, D114).
Nothing comes after it, so nothing can.

⚠️ **THE `/stones/` PAGES ARE NOT PART OF index.html's FROZEN COMPOSITION**, and §8 records that
he has never seen their desktop. Compare's entry links were therefore added at every width. If he
ever signs off the stones desktop, that decision needs revisiting.

---

## 2. ⛔ THE LINK

```bash
cd "Website Demo" && nohup caffeinate -ims node dev-server.js > /tmp/topcat-server.log 2>&1 &
```

**Give him `http://<lan-ip>:5501`** — `ipconfig getifaddr en0`. It is `192.168.1.102:5501`.

⭐ **THE SERVER IS DETACHED ON PURPOSE (PPID 1).** ⛔ **DO NOT `preview_stop` IT, DO NOT KILL IT TO
RESTART.** Verify with `lsof -nP -iTCP:5501 -sTCP:LISTEN` before blaming his phone. **PID 5158,
untouched across this round and the last.**

⭐⭐ **EVERY SAVE TO `index.html` RELOADS HIS PHONE.** The reload restores scroll position. **Tell
him before a run of edits.**

### ⛔⛔ NEW, AND IT WILL WASTE A ROUND: `stone.css` IS CACHED FOR FIVE MINUTES

`index.html` is `no-cache` so it reloads instantly. **Assets are `public, max-age=300`** — so a
change to `/stones/stone.css` does NOT reach the browser for up to five minutes. This bit twice in
one session: the compare grid measured 150px columns when the file on disk clearly said 124px.

⭐ **PROVE IT BEFORE DEBUGGING ANYTHING**: `fetch('/stones/stone.css?bust='+n)` and check the text,
then compare against `document.styleSheets`. If the fetch has your rule and the live sheet does
not, it is the cache. Force it with `link.href='/stones/stone.css?bust='+n`.
⚠️ **Warn the client too** — a styling change to the stones pages will not appear on his phone
straight away, and it looks exactly like a broken build.

⛔ **ALL OF §2 IS DEV-SERVER ONLY.** No production host is chosen.

---

## 3. ⭐ THE CODE IS ON GITHUB, AND IT IS PUBLIC

**https://github.com/ThadGC/topcatwork** — pushed 12 Aug, one commit on `main`.

⚠️ **HE CHOSE PUBLIC KNOWINGLY, AFTER BEING TOLD WHAT IT PUBLISHES.** Do not re-litigate it
unprompted. ⛔ 18 files name Nile Stone and Next Stone Slabs, including `index.html` and every
handover — that is §2 rule 9's buying list, now indexed. A private repo with collaborators gives
his devs identical access; the offer stands if he asks.

⭐ **THE REPO IS ALSO A SAFETY NET AND WAS USED AS ONE THIS ROUND.** `git status --porcelain` after
a rebuild proved that changing the search touched **only the collection page** and left all 132
stone pages byte-identical. Use it that way.

⛔ **GITIGNORE PATTERNS MUST BE `**/`-ANCHORED** — a pattern with a slash is anchored to the repo
root and the site lives at `Topcat-Worktops-main/Website Demo/…`.

---

## 4. ⛔ THE INTEGRITY RULE — still the one that matters most

> "These names cannot be wrong. If someone googles it and sees it looks different here, then we
> have a big problem."

```bash
cd "Website Demo/stones" && python3 harvest/verify.py
```

> 132 stones, 132 with a photograph, 132 pages on disk — ✅ PASS *(last run 12 Aug)*

⭐ **THE GATE FIRED THIS ROUND AND IT WAS RIGHT.** Check 5 counts every `.html` in `/stones/` as a
stone page, so `compare.html` tripped it the moment it was built. **The fix was to name it in an
explicit `NOT_A_STONE` set, not to loosen the check** — every name excused there is a name it can
no longer catch. ⚠️ It covers the STONES only. Nothing in it looks at the landing page.

---

## 5. ⭐ WHERE THE PHONE STANDS

| Section | State |
|---|---|
| **Top nav** | ⭐ **NEW: the burger is three bare stripes, no box** (D132) |
| **Hero** | rounded corners (D115); ⚠️ **the corner fix D133 is UNVERIFIED — see §9.1** |
| **Reviews** | cream cards, gutter arrows (D116/D119); ⭐ **NEW: no entrance animation** (D134) |
| **Services** | popularity order, tiles link to their page, gold rim, 7px corners (D117–D121, D126) |
| **Project gallery** | ⭐⭐ **NEW: the accordion runs on a 1600ms CLOCK, not the scroll** (D142) |
| **Stone wheel** | ⭐ **NEW: bend 30 (was 120), card 0.80, wheel cap 390, bare gold arrows** (D135–D138) |
| **Stones → estimator seam** | ⭐ **NEW: the brand marquee is a plain divider on the phone** (D143) |
| **The collection** | ⭐ **NEW: the search actually narrows** (D139) |
| **`/stones/compare.html`** | ⭐⭐ **NEW PAGE** (D141) |
| Page floor | veil 0.46 (D123) |
| Sticky bottom bar | Get a quote · Email · Call (D99/D106) |
| Everything else | ⛔ untouched — still the desktop-era layout at phone width |

### ⭐ THE GALLERY IS NO LONGER SCROLL-DRIVEN — READ THIS BEFORE TOUCHING IT

`q` was `p/animFrac`, scroll position scrubbed. It is now **`animQ`, wall-clock time**: `ANIM_MS`
1600 from the instant the pin engages (`r.top <= 0`), increasing only, so a flick up cannot rewind
it and a fast scroll cannot fast-forward it.

⚠️ **`travel` IS STILL SCROLL-DERIVED AND THAT IS DELIBERATE.** Travel is the column moving up the
screen, which IS the page scrolling and must follow the finger. He asked to untie the ANIMATION,
not the page. Do not "finish the job" by untying travel as well.

⛔⛔ **THE rAF LOOP HAD TO BE TAUGHT TO STAY AWAKE.** `frame()` shut itself off the moment the
playhead caught the scroll — safe while everything was scroll-derived, because nothing could
change without a scroll event to restart it. A clock can. `playing` now holds the loop open;
remove it and the deal freezes mid-air the instant the finger lifts.

⭐ **HOW IT WAS PROVEN, AND HOW TO RE-PROVE IT**: park at the pin, then sample every 160ms with the
scroll untouched. scrollY constant at 2119 while the card gap went **12 → 13 → 29 → 59 → 94 → 127
→ 152**. If the gap does not move with the scroll frozen, it is broken.

### ⭐ THE COMPARE PAGE, AS IT STANDS

`/stones/compare.html?s=slug,slug,slug` — **a comparison is a LINK**, which is the half of this
with a business case: no showroom (D5), so the one thing a showroom does that the site could not
is hold samples side by side, and Nick can now text that view to a customer.

- **Two cards across, wrapping down. Slab, name, material — nothing else** (D141, cut back the same
  day it was built). The facts are on the stone page, one tap away.
- The picker IS the collection: same tiles, same tabs, **same search function** — `_haystacks()` is
  shared, so the grid and the picker cannot answer one query two ways.
- ⚠️ **`?stones=` RIDES THE ENQUIRY LINK AND NOTHING READS IT.** It is carried so the day the form
  is wired the shortlist arrives with the customer. **Not a working handover.**

---

## 6. ⛔ THE LESSONS THAT COST THE MOST THIS ROUND

### 1. ⛔⛔ "IT'S NOT WORKING" MEANT "IT RETURNS 80% OF THE PAGE"

Client: *"when I type white, it's not only showing all the white ones. Nothing changes."* The
search **was** firing. `white` returned **79 of 132 and 29 were not white stones**; `marble`
returned **112 of 132**. A filter returning 60–85% of a 132-tile grid, on a phone's single column,
is indistinguishable from one that does nothing.

**Two independent faults, and fixing either alone leaves him still right:** the description was in
the haystack (so a black stone described as having *white veining* answered "white"), and the match
was a **substring** (so `indexOf("marble")` found it inside `marbleeffect`, the keyword every quartz
carries). ⭐ **Measure the RESULT SET before believing a handler is dead.**

### 2. ⛔⛔ THE CONSOLE REPLAYS STALE ENTRIES — AND THAT WAS USED TO DISMISS A REAL ERROR

`URL is not a constructor` was live on the collection page **and all 132 stone pages**, and the
previous session wrote it off as a stale replay from another page. It was genuine: **inside an
inline `onclick` the scope chain includes the document, so the bare identifier `URL` resolves to
`document.URL` — a string — before it ever reaches `window.URL`.** The handler threw, `history.back()`
never ran, the click fell through to the href, and the page navigated anyway, so it LOOKED fine.

⭐ **THE CHECK COSTS TEN SECONDS: open a NEW TAB, load the page, read the console.** A fresh tab has
nothing to replay. Both halves of "the console lies" are true — it replays, *and* it reports real
errors. Never use the first to dismiss the second.

### 3. ⛔ A MISSPELT CLASS DOES NOT ERROR — IT RENDERS THE BROWSER'S DEFAULTS

The compare page shipped `class="crumbs"` where every other page says `class="crumb"`. The
breadcrumb was unstyled, `ol` fell back to `display:block`, three items stacked vertically at
**77px instead of a 26px row** — and the client reported it as "a gigantic open space", i.e. as a
design decision. ⭐ **When spacing looks wrong, check the element is actually styled before tuning
anything.**

### 4. ⛔ THE VISIBLE CORNER WAS THE ROTATION, NOT THE SAG (D137)

Two rounds on the stone wheel were spent flattening the arc because "the sides curve down too
much". The outermost card's CENTRE is already off-screen at x=379 on a 375px phone — but the card
is tilted `asin(ax/R)`, and at 37.7° the tilt swings its bottom corner back INWARD to x=363.
⭐ **Measure the thing he can see, not the thing you changed.** The corner hit-test (four corners
through the element's own `DOMMatrix`, inset 7px, `elementFromPoint`) turned "I can see the
corners" into `offscreen` / `covered` / `VISIBLE` per corner.

### 5. ⭐ DERIVE THE VOCABULARY, DO NOT TYPE IT (D139)

`scoped_words()` builds the 35 colour/material/finish words from the catalogue itself. D51's lesson
keeps recurring: a hand-kept list beside data that also lives in the data does not error when it
goes stale — it quietly stops working. Add a hue and the page learns it at the next build.

---

## 7. ⚠️ THE ENVIRONMENT TRAPS

- ⛔⛔ **`stone.css` IS CACHED FIVE MINUTES.** See §2. The single biggest time-waster this round.
- ⛔ **THE BROWSER PANE CANNOT TAP ANYTHING BELOW 768px AND IT FAILS SILENTLY.** `computer
  left_click` becomes a touch and the finger never lifts. Control experiment: tap the sticky bar's
  `Get a quote`, which predates everything and needs no JS.
- ⛔ **WHEN THE PANE GOES HIDDEN, rAF STOPS AND SCREENSHOTS GO STALE.** Check
  `document.visibilityState` inside the probe. `tabs_select` does not always front it; a new tab does.
- ⚠️ **`zoom` with a `region` is not supported** — it returns a full screenshot. To inspect a
  detail, apply a temporary `transform:scale()` with a corner `transform-origin` and screenshot that.
- ⚠️ **`location.href` read in the same tick as the assignment returns the OLD url.**
- ⛔ **`catalogue_source.py` is a 52-STONE SNAPSHOT, not the range.** `catalogue_active.py` is.
- ⛔ **AN INVENTED DATA VALUE CAN BLANK THE WHOLE SITE.** Valid presets: calacatta, carrara, crema,
  emperador, eternal, fumo, goldveil, mist, nerogold, statuario.
- ⛔ **THE RANGE IS ALPHABETICAL EVERYWHERE (D85). NO DARK STONE ON THE FIRST SCREEN (D86).**
- ⚠️ `10cm` in Judy Z.'s review trips the millimetres scan and must stay. A real customer's words.
- ⚠️ **`-s.webp` IS 800px, NOT 300.** ⛔ Do NOT run `expand.py`.

---

## 8. ⛔ RULES THAT MUST NOT BE BROKEN

1. ⛔ **A stone's NAME and its PHOTOGRAPH must both match the supplier's own** (§4).
2. ⛔ **Fabrication is OUTSOURCED. Never claim in-house.** Templating, fitting and aftercare ARE
   theirs and may be claimed freely.
3. ⛔ **Never state something we cannot guarantee, and never use an absolute.**
4. ⛔ **Every measurement in millimetres.** The estimator's linear metres of edging is the exception.
5. ⛔ **A stone is called what it is; the range is named for what it contains** — "Marble & Quartzite".
6. ⛔ **Never a bright or gold line across the TOP of a card or section**, anywhere.
7. ⛔ **Suppliers are never named publicly.** ⭐ **Enforced this round** — he asked for the buying
   list in the brand marquee and it was refused; he chose to drop the band instead (D143).
   ⚠️ Note the marquee held BRANDS, not suppliers — see D143 before "restoring" anything.
8. **No showroom. Never show the review count. Never signal a young company. Value, not cheap.**
9. **Voice:** quietly confident master. British English, commas not em dashes, no exclamation marks.
10. ⛔ **The logo is the client's artwork and is never re-drawn. Set HEIGHT only.**
11. ⛔ **ONE DEVICE AT A TIME. Desktop is frozen and only the client unfreezes it.**

---

## 9. OPEN — DO THESE NEXT

### ⭐ Carried from this round

1. ⛔⛔ **THE HERO'S ROUNDED CORNER IS FIXED BUT UNVERIFIED, AND ONLY HIS PHONE CAN SETTLE IT
   (D133).** Chrome renders the arc perfectly at 6× magnification with the floor flooded flat red —
   the geometry was never wrong. The diagnosis is an **iOS compositing leak**: `.hero-bg img`
   carried `will-change:transform` + `scale(1.08)`, promoting it to its own layer, and a promoted
   child composites AFTER the parent's `clip-path` is rasterised, so the photograph's near-black
   square corner paints past the arc. Three mechanisms are now on it. ⭐ **Ask him directly.** If it
   is still black, the leak was not the cause and the next lever is the floor's brightness at the
   top of the page, which is D123's number.
2. ⭐ **Does the brand marquee come off DESKTOP too?** D143 hid it on the phone only, per rule 15.
   He has not been asked. ⚠️ And he may want it back with brands alone — it never held his buying
   list.
3. ⚠️ **The "keep scrolling" indicator may now be OBSOLETE.** It was asked for so people knew to
   keep scrolling until the animation finished — but D142 means the animation no longer needs
   scrolling at all. **Ask before building it.**
4. ⭐ **The animations on his iPhone.** Raised three times, never diagnosed. ⭐ D142 removes a
   scroll-scrubbed rAF driving eight composited layers, and D133 drops a permanent compositing
   layer on the hero image — both should help. **That is a prediction, not a measurement.**

### ⛔ The two that actually block go-live — unchanged, and neither is design

5. ⭐⭐ **The enquiry form has no backend, and it carries file uploads.** `buildEnquiry()` assembles
   a `FormData` and has nowhere to POST. **Top open item for thirteen sessions.** ⚠️ Compare now
   sends a shortlist at it via `?stones=` that nothing reads — that only pays off once this is done.
   ⭐ It was put to him plainly this round that this matters more than compare; he chose compare,
   which is his call and is on the record.
6. **Photography — the STONES are done. The PEOPLE and the PROJECTS are not.** ⚠️ Say out loud that
   the three director portraits and the Why feature shot are placeholders. ⚠️ **Three of the six
   service tiles show the wrong subject** — Bathrooms a bare slab, Outdoor Kitchens a quarry,
   Commercial a kitchen.

### The rest

7. ⭐ **The service pages need the global sections** — no project gallery, stone selector or
   estimator. Extract once into shared files that `build_services.py` wires into all six.
8. ⚠️ **A live copy problem, flagged and NOT fixed** — `SERVICES[0].long` and the service pages'
   "Vein-matched by hand" both claim fabrication TopCat outsource (rule 2) and state an absolute
   (rule 3). ⛔ **Live on the service pages right now.** ⚠️ `verify.py` check 7 does not scan
   index.html's inline data.
9. ⭐ **Pick a production host** and give it brotli + long-lived cache headers (§2).
10. ⭐ Close the licensing question on Caesarstone, CRL and Bloom. ⛔ Classic Quartz Stone is off
    limits. ⭐ **Calacatta Gold is UNRESOLVED** — needs the maker's name from his intro video.
11. **The TABLET round**, when he calls it. ⚠️ It still has the flip-card grid with "click for
    details", black review cards, the boxed burger, the ringed wheel arrows and the brand marquee.

**Still waiting on the client:** whether Quartzite becomes a fourth range, 20mm vs 30mm pricing,
brackets for vanity tops / fireplaces / tables, the hero's "Request a call" demotion (asked four
times), and the £3k vs £3,850 three-slab discrepancy.

---

## 10. ⭐ HOW THIS CLIENT WORKS

⛔⛔ **DO THE THING HE ASKED FOR, IN THE MESSAGE HE ASKED FOR IT.** If a message carries several
asks, do them in the order he named them, and **say plainly which you are dropping and why —
before you start, not after.** This round carried messages with four and five asks each.

⚠️ **HE CORRECTS THE DIAGNOSIS, NOT JUST THE DESIGN, AND HE IS USUALLY RIGHT.** He said the search
was not working; it was firing and returning 80% of the page. He said the wheel's corners showed;
they did, for a reason nobody had looked at. **Take the report as data even when the explanation
is wrong.**

⭐ **HE ASKS WHETHER SOMETHING IS WORTH BUILDING, AND HE WANTS A REAL ANSWER.** He asked whether
compare earned its place without a visualiser. He was told plainly that the form backend matters
more, and he chose compare anyway. ⭐ **Give the honest recommendation once, then build what he
picks without relitigating it.**

⚠️ **HE REVERSES HIMSELF AND THAT IS FINE — BUT LOG IT.** The gallery has now changed direction six
times and the stone wheel's curve three times in one day. ⛔ **Write the reversal into §D with the
reason the old decision existed**, or the next session helpfully rebuilds the thing he just
rejected. D137's "the tilt, not the sag" is the model.

⭐ **HE DESCRIBES THE ANIMATION HE WANTS, NOT THE SHAPE.** *"It just plays"*, *"like an accordion"*,
*"like two sides of a deck of cards"*.

- **Walk the journey, do not check the page.**
- ⭐ **LOOK AT THE RESULT BEFORE REPORTING IT DONE.**
- **Measure, then claim.** ⚠️ **And if you could not measure it, say so** — D133 shipped with an
  explicit "not verified on the device", and that is the honest way to hand it over.

---

## 11. BUDGET AND THE DOCUMENT SET

- **~82 credits** of the client's **100-credit ceiling** spent. About **18 left**. ⭐ **This round
  cost none** — layout, script, search and page-building work, no image generation.

| File | What it is |
|---|---|
| **`HANDOVER.md`** | ⭐ The single current state. §D is the register, **D1–D130 and D132–D143**. §2 the standing rules, §2a the supplier list. ⚠️ **THERE IS NO D131 ROW** — the previous START HERE cites it three times but it was never written in. Reconstruct it from that file's §5 if needed, but **do not reuse the number** |
| `HANDOVER-2026-08-12-basics-and-gallery-rebuild-start-here.md` | The previous START HERE. ⚠️ Superseded on the burger, the wheel, the arrows, the gallery clock, the marquee and the search |
| `Website Demo/index.html.pre-navbar-divider-stone.bak` | Baseline before the burger / hero-corner / wheel round |
| `Website Demo/index.html.pre-gallery-untied.bak` | ⭐ Baseline before the gallery came off the scroll |
| `Website Demo/stones/build_stones.py` | ⭐ Builds the collection, **compare.html** and 132 stone pages. `scoped_words()` and `_haystacks()` are the search; `compare_page()` is the new page |
| `Website Demo/stones/harvest/verify.py` | ⭐ The nine-check gate. `NOT_A_STONE` is the exemption list — keep it exact |
| `Website Demo/stones/stone.css` | ⭐ Collection + stone + **compare** styles. ⚠️ Cached 5 minutes (§2) |
| `Website Demo/dev-server.js` | Compression, caching, and the reload that keeps scroll position |
| `stones/supplier_names.py` | ⭐ The seven authorised name differences |
| `Docs/topcat-worktops-SEO-LOG.md` | Every URL, title, target query and SEO change |
| `HANDOVER-archive-to-2026-08-06.md` | ⚠️ **Every design the client rejected, in his words.** Read before redesigning anything |

⚠️ **Section numbers in `HANDOVER.md` are referenced from code comments** (`§3`, `§4`, `§5a`,
`§6.7`, `§7.5` are live in `index.html`). **Do not renumber.**

⚠️ **`Website Demo/` holds 56 `index.html.pre-*.bak` files** — and a git repo (§3). This round's are
`pre-navbar-divider-stone` and `pre-gallery-untied`.
