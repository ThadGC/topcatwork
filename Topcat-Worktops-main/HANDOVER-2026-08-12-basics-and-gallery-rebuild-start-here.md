# START HERE — 12 August 2026, end of the BASICS + GALLERY-REBUILD ROUND

Read this, then `HANDOVER.md` **§D** (the decision register, start at **D115–D131**) and **§2**
(the standing rules, especially **rule 15**). That is about fifteen minutes and it is enough to
work safely.

> ⚠️ **This replaces the version written after the PERFORMANCE + THIRD MOBILE ROUND**, now archived
> as `HANDOVER-2026-08-11-performance-and-mobile-round-3-start-here.md`. That file describes a
> site with black review cards, square service tiles that flip to "click for details", a hero with
> a 30° bevel, and a project gallery that walks a 3D hallway. ⛔ **Every one of those is now
> wrong.** It also still lists the gallery's one-swipe-to-eight as open; that whole component was
> rebuilt twice today and the swipe idea is gone.

---

## 0. ⛔⛔ THE FIRST THING YOU DO, BEFORE ANY DESIGN WORK

> ✅ **RUN 12 Aug, BEFORE THE D132–D136 ROUND, AND IT PASSED.** `index.html` against
> `index.html.pre-basics-round.bak` at **1440×900** and **768×1024**: floor, galPin, galStage,
> galScroll, revPage, svcFace and all eight gallery card sizes byte-identical; document height
> identical at both (14641 / 18385); element count +2, which is D120's catch-all line as
> documented. **Nothing from the five rounds had leaked.** Re-run against
> `index.html.pre-navbar-divider-stone.bak` — the D132–D136 round passed against it too, all 67
> wheel slab transforms included.
>
> ⛔ **AND THE PROCEDURE BELOW STILL MEASURES THE WRONG FRAME — FIX IT BEFORE YOU TRUST IT.**
> Walking the page and settling gave four MISMATCHED gallery card sizes on the first pass, and
> the tell was that the baseline's read non-monotonic (364, 352, 371, 365) where a real layout
> is a clean progression. It was the eased playhead caught mid-flight, not a regression.
> ⭐ **PARK, DO NOT WALK-AND-SETTLE.** Scroll to a FIXED offset — `galScrollTop + 2000` — settle
> 5s, then snap TWICE 1.2s apart and require the two to be equal. Both pages then read
> identically every time. Deterministic beats long.

**RUN THE FREEZE PROBE. IT HAS NOT BEEN RUN SINCE D126 AND THERE HAVE BEEN FIVE ROUNDS SINCE.**

Everything from D127 onward is behind a `phone` guard or inside `@media(max-width:720px)`, and I
said so at the end of four separate rounds. ⚠️ **That is an argument, not evidence.** D108 is in
this document precisely because an unclosed HTML comment moved every page at every width and
nothing looked broken — it was found only because the probe came back with 457 diffs where the
previous run had 18.

```bash
cd "Website Demo" && cp index.html.pre-basics-round.bak _regress-before.html
```

Serve both, walk each at **1440×900** and **768×1024**, then compare the exact computed properties
this work touched — that is the D114 method and it is the only one that works here:

```js
pick(body,'::before' backgroundImage)      // the floor — D123 added --floorGlowA/B to :root
pick(galPin,  ['position','height','overflow'])
pick(galStage,['position','height'])       // + the runway's inline height
pick(revPage, ['left','width','backgroundColor','opacity'])
pick(svcFace, ['borderRadius','borderColor'])
allEightGalleryCardSizes                    // the strongest single signal — see below
```

⭐ **THE EIGHT GALLERY CARD SIZES ARE THE BEST TELL-TALE IN THE FILE.** They come out of a chain of
measure() → stackPos → sidePos → render, so if any of today's phone branches leaks upward, one of
the eight moves. Desktop should read `374x247,382x253,391x258,400x264,338x224,347x229,356x235,364x241`
and tablet `188x124,193x127,197x130,202x133,171x112,175x115,179x118,184x121`.

⚠️ **Element count will be +2 and that is CORRECT** — it is D120's catch-all line, which is
`display:none` above 720px. **Document height must be identical.** ⛔ Delete `_regress-before.html`
afterwards (D60's failure mode).

---

## 1. ⛔ SCOPE — UNCHANGED, AND IT HELD ALL DAY

**DESKTOP AND TABLET ARE FROZEN. THE WORK IS MOBILE, ON HIS PHONE, OVER THE LAN LINK.**

| Band | What it gets | Status |
|---|---|---|
| **≤ 720px** | the mobile build | ⭐ live scope |
| **721–1120px** | the old tablet/fallback layouts | ⛔ **frozen, untouched** |
| **≥ 1121px** | the desktop composition | ⛔ **frozen, signed off (D91)** |

⚠️ `index.html` is one file with **inline CSS**, so nearly every rule is unscoped. ⛔ **Mobile
work goes inside `@media(max-width:720px)`. Never edit a base rule to fix mobile.**

⭐ **NEW MARKUP CANNOT BE SCOPED BY A MEDIA QUERY — D120.** A new *rule* only applies where its
query matches, but a new *element* exists at every width the moment you add it. The default must
be `display:none` in the base rule with the phone opting in. This is the one scoping trap that the
existing "put it in a media query" advice does not cover.

⛔ **ORDER STILL DECIDES.** When a mobile override does not take, check what comes AFTER it before
touching anything else, and add a parent to the selector rather than moving code (D106, D113, D114).

---

## 2. ⛔ THE LINK — READ BEFORE HE SAYS IT IS BROKEN

```bash
cd "Website Demo" && nohup caffeinate -ims node dev-server.js > /tmp/topcat-server.log 2>&1 &
```

**Give him `http://<lan-ip>:5501`** — `ipconfig getifaddr en0`. It was `192.168.1.102:5501`.

⭐ **THE SERVER IS DETACHED ON PURPOSE (PPID 1).** ⛔ **DO NOT `preview_stop` IT, DO NOT KILL IT TO
RESTART.** Verify with `lsof -nP -iTCP:5501 -sTCP:LISTEN` before blaming his phone. It survived
this entire round untouched — PID 5158 all day.

⭐⭐ **EVERY SAVE TO `index.html` RELOADS HIS PHONE.** There were well over twenty saves today. The
reload restores scroll position, but **tell him when you are about to do a run of edits.**

⛔ **ALL OF §2 IS DEV-SERVER ONLY.** No production host is chosen.

---

## 3. ⭐ THE CODE IS NOW ON GITHUB — AND IT IS PUBLIC

**https://github.com/ThadGC/topcatwork** — 655 files, one commit on `main`, pushed 12 Aug.

⚠️ **HE CHOSE PUBLIC KNOWINGLY, AFTER BEING TOLD WHAT IT PUBLISHES.** His reason was dev access.
The concern raised, and his decision to proceed, are both on the record — **do not re-litigate it
unprompted**, but the facts still matter:

- ⛔ **18 files name Nile Stone and Next Stone Slabs**, including `index.html`, the catalogue
  scripts and every handover. That is §2 rule 9's buying list, now indexed.
- The handovers also publish his pricing brackets, the £3k vs £3,850 discrepancy, his notes on the
  previous agency, and the open licensing questions on named brands.
- ⭐ **A private repo with collaborators gives his devs identical access.** He was told; the offer
  stands if he ever asks.

`.gitignore` at the repo root excludes `**/harvest/raw/` and `**/harvest/_upscale/` (1.97 GB of raw
supplier photography, licensing still open) and all `*.bak` files. That took the push from 2.1 GB
to 116 MB.

⛔ **GITIGNORE PATTERNS HERE MUST BE `**/`-ANCHORED.** A pattern containing a slash is anchored to
the repo root, and the site lives at `Topcat-Worktops-main/Website Demo/…`. A plain
`Website Demo/stones/…` matched **nothing** and silently staged all 1.8 GB. His own instructions
doc tells his devs to run `git add .`, so this will bite someone.

⚠️ **His instructions doc still points at `lukecopley6/Topcat-Worktops`** — the wrong repo. Worth
updating. ⚠️ **A fresh clone cannot rebuild the stone pages** (`harvest/raw/` is excluded); the
generated pages and assets are committed, so the site runs, but the pipeline needs those files
from him directly.

---

## 4. ⛔ THE INTEGRITY RULE — still the one that matters most

> "These names cannot be wrong. If someone googles it and sees it looks different here, then we
> have a big problem."

⭐ **A stone name is only meaningful RELATIVE TO A SUPPLIER.** `harvest/verify.py`'s checks 8 and 9
enforce that the photograph shipped under a name is the one **that supplier** publishes under
**that name**. Run it before calling anything done:

```bash
cd "Website Demo/stones" && python3 harvest/verify.py
```

> 132 stones, 132 with a photograph, 132 pages on disk — ✅ PASS *(last run 12 Aug)*

⚠️ **It covers the STONES only.** Nothing in it looks at the landing page.

---

## 5. ⭐ WHERE THE PHONE STANDS AFTER TODAY

| Section | State |
|---|---|
| **Top nav** | formed at scroll 0, flare off (D106) |
| **Hero** | ⭐ **NEW: rounded corners, long flat run** — the 30° bevel is gone (D115) |
| **Reviews** | ⭐ **NEW: CREAM cards, black type**, arrows moved into the side gutters, CTA pulled up (D116, D119) |
| **Services** | ⭐ **NEW: popularity order, tiles link straight to their page, gold rim, landscape, 7px corners**, catch-all CTA below (D117–D121, D126) |
| **Project gallery** | ⭐⭐ **REBUILT TWICE. Pre-stacked deck → pinned accordion → scrolling column** (D122–D131) |
| **Page floor** | ⭐ **NEW: veil lifted to 0.46 on phone**, measured (D123) |
| **Sticky bottom bar** | Get a quote · Email · Call (D99/D106) |
| Everything else | ⛔ untouched — still the desktop-era layout at phone width |

### ⭐ THE GALLERY, AS IT NOW STANDS — READ THIS BEFORE TOUCHING IT

**One animation, not two.** The deck is **already stacked** when the section scrolls in. The pin
then holds the screen still while the stack **accordions down into a column of eight full-width
cards**, dealing **from the FRONT card**. After that the pin releases the scene by translating it,
which reads as ordinary scrolling, and it ends on **Get in touch**.

| Piece | Value | Why |
|---|---|---|
| card | **331 × 145** | one third off the height, width untouched (D125) |
| gaps | 15px | |
| peek | ~12px, `PEEK_PHONE 0.17` | a fraction of card HEIGHT, so it shrank when the card did |
| pile depth | `(N−1) − colOrd` | the pile and the column are ONE order (D128) |
| deal | `(N−1−n)` | from the front; the back card is already at slot 0 (D129) |
| held phase | `animPx = vh × 0.85` | was 1.25 when it carried a gather too (D131) |
| travel | `travelMax = colStageH − vh` | applied to the PLANES, not per card |

⛔ **`travel` IS 0 AT THE MOMENT THE ANIMATION ENDS.** That is not incidental — it is the client's
actual requirement, that the frame the accordion finishes on is the frame showing the FIRST card.

⛔ **`entryPos`'s phone branch is UNREACHABLE and deliberately NOT DELETED.** `g` is pinned at 1
(D131). It still holds the riffle (D130). ⚠️ **He changed direction on this section five times in
one day** — firework → column → pin → riffle → no entry at all. Do not tidy away the road not
taken, and **do not assume today's answer is final.**

---

## 6. ⛔ THE THREE LESSONS THAT COST THE MOST TIME TODAY

### 1. ⛔⛔ PAINT ORDER IS NOT GEOMETRY — AND IT BIT TWICE IN TWO DAYS

Both times the client reported "the stacking is uneven" and both times **every card's `x` was 0 and
the offsets were perfect.**

- **D125:** flattening both set planes to `z-index:10` handed the paint order to the DOM, and the
  rear set comes last — so the cards meant to peek out *behind* the front card were drawn *on top*
  of it.
- **D128:** inverting the depth mapping moved the front card into set 1 while set 0 kept the higher
  z — the deepest cards painted over the card you were looking at, showing **the wrong photograph
  with the right card's name underneath.**

⭐ **WHENEVER THE DEPTH MAPPING CHANGES, CHANGE THE PLANE Z-INDEX WITH IT.** And when a stacking
complaint arrives, **measure the paint order before you measure the spacing.**

### 2. ⛔⛔ TWO REQUIREMENTS CAN LIVE IN DIFFERENT FRAMES — I TREATED IT AS A CHOICE AND LOST TWO ROUNDS

He asked for the gallery title to sit 86px below the divider (D124). Then the pin came back and the
title vanished under the nav, so I restored the nav reserve (D128) and broke the 86px. Then he
asked for the 86px **again**, and I had it filed as a contradiction.

⭐ **It was not.** `padding-top` is measured from the SECTION, so pinned it clears the nav; unpinned
it is dead space in the FLOW. **Pulling the section up by exactly the reserve it adds cancels one
and leaves the other untouched**, because a pinned element positions against the viewport, not its
own margin. `37 − 78 − 29 = −70`, and `156 − 70 = 86`. Both true at once.

⚠️ **When two of his asks look contradictory, check whether they are measured from the same thing.**

### 3. ⛔ A NUMBER THAT IS A FRACTION OF SOMETHING ELSE CHANGES WHEN THAT THING DOES

`PEEK` is a fraction of card HEIGHT. D125 took a third off the height to satisfy "make them
smaller", and silently took a third off the peek with it — 6.4px → 4.3px — and the pile closed up
into what looked like one card. Same family: `.face`'s 14px radius was drawn for a 300px desktop
card and reads as over-rounded on a 129px tile (D126).

---

## 7. ⚠️ THE ENVIRONMENT TRAPS — THREE NEW ONES TODAY

### ⛔⛔ THE BROWSER PANE CANNOT TAP ANYTHING BELOW 768px, AND IT FAILS SILENTLY

`computer left_click` becomes a touch, and **the finger never lifts.** An event probe recorded
`pointerdown` and `touchstart` and then **nothing** — no `touchend`, no `click` — and the call dies
after 30s with *"The pane may be stuck…"*. **Nothing on the page is clickable under automation at
phone width**, which reads exactly like "the feature I just built is broken".

⭐ **THE CONTROL EXPERIMENT TAKES ONE MINUTE**: tap something that predates your change and needs no
JavaScript — the sticky bar's `Get a quote`. It does not navigate either. That proves the
environment. ⭐ **To verify a phone-only tap handler**: resize to ≥768 for real mouse events, then
force the phone branch on with an injected `<style>` setting `--svcMode`/`--galMode`, and click.

### ⛔ WHEN THE PANE GOES HIDDEN, rAF STOPS AND SCREENSHOTS GO STALE

`document.visibilityState === 'hidden'` means the gallery's playhead is frozen and the screenshot
is a **stale frame** — scroll position reads correctly while the picture does not match it. ⭐
**Check `visibilityState` in the probe itself.** `tabs_select` did not front it; opening a new tab
via `preview_start` did.

### ⛔ THE PLAYHEAD EASES, SO A SCRIPTED JUMP-SCROLL MEASURES THE WRONG FRAME

`SCRUB` is 0.045, so the scene needs ~60 frames to catch up — and **no frames render between
statements inside one `javascript_tool` call.** Scrolling and measuring in the same call always
reads the old state. ⭐ **Scroll in one call, make a trivial call, then measure in a third.**

### Still true from earlier rounds

- ⚠️ **The console REPLAYS STALE ENTRIES**, including from other pages. Today it showed
  `URL is not a constructor` from `/stones/` while an in-page probe on index.html returned zero.
  ⭐ Install your own `window.onerror` and walk the page.
- ⚠️ **`location.href` read in the same tick as the assignment returns the OLD url** — navigation is
  async. A same-tick check reports failure on a navigation that is about to succeed.
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
7. ⛔ **Suppliers are never named publicly.** ⚠️ See §3 — this is now compromised by his own choice.
8. **No showroom. Never show the review count. Never signal a young company. Value, not cheap.**
9. **Voice:** quietly confident master. British English, commas not em dashes, no exclamation marks.
10. ⛔ **The logo is the client's artwork and is never re-drawn. Set HEIGHT only.**
11. ⛔ **ONE DEVICE AT A TIME. Desktop is frozen and only the client unfreezes it.**

---

## 9. OPEN — DO THESE NEXT

### ⭐ From this round, in priority order

1. ⛔⛔ **RUN THE FREEZE PROBE** (§0). Four rounds overdue. Before any new design work.
2. ⭐⭐ **The "keep scrolling" indicator on the gallery.** He asked for it explicitly — *"it must
   have an indicator that they must keep scrolling until the animation finishes"* — and it has been
   outstanding for three rounds. It is small: a cue that fades out as the accordion completes.
3. ⭐ **The animations are still not smooth on his iPhone.** Raised three times, **never
   diagnosed.** Frames measure fine on the Mac, so it is device-side. ⭐ Today's work should have
   helped twice over — the section now does nothing at all until the pin engages, and there is no
   3D left on it — but that is a prediction, not a measurement.

### ⛔ The two that actually block go-live — unchanged, and neither is design

4. ⭐⭐ **The enquiry form has no backend, and it carries file uploads.** `buildEnquiry()` assembles
   a `FormData` and has nowhere to POST. The client was burned by a previous agency whose site
   produced **one client in nine months**, and this engagement will be judged on **measurable
   leads**. **Top open item for twelve sessions.**
5. **Photography — the STONES are done. The PEOPLE and the PROJECTS are not.** ⚠️ Say out loud that
   the three director portraits and the Why feature shot are placeholders. ⚠️ **Three of the six
   service tiles show the wrong subject** — Bathrooms shows a bare slab, Outdoor Kitchens a quarry,
   Commercial a kitchen.

### The rest

6. ⭐ **The service pages need the global sections.** The six pages exist with a service-specific
   hero, description, features, materials, steps and FAQ — but **no project gallery, stone selector
   or estimator.** He asked for these on 12 Aug and it was explicitly deferred as its own build.
   ⭐ The right shape is to extract them once into shared files that `build_services.py` wires into
   all six, rather than duplicating seven times.
7. ⚠️ **A live copy problem, flagged and NOT fixed** — `SERVICES[0].long` and the service pages'
   "Vein-matched by hand" both claim fabrication TopCat outsource (rule 2) and state an absolute
   (rule 3). ⛔ **Live on the service pages right now**, and they matter more since D117 made the
   tiles link straight to them. ⚠️ `verify.py` check 7 does not scan index.html's inline data.
8. ⭐ **Pick a production host** and give it brotli + long-lived cache headers (§2).
9. ⭐ Close the licensing question on Caesarstone, CRL and Bloom. ⛔ Classic Quartz Stone is off
   limits. ⭐ **Calacatta Gold is UNRESOLVED** — needs the maker's name from his intro video.
10. **The TABLET round**, when he calls it. ⚠️ It still has the flip-card grid with "click for
    details", black review cards, and the nav forming on scroll.

**Still waiting on the client:** whether Quartzite becomes a fourth range, 20mm vs 30mm pricing,
brackets for vanity tops / fireplaces / tables, the hero's "Request a call" demotion (asked four
times), and the £3k vs £3,850 three-slab discrepancy.

---

## 10. ⭐ HOW THIS CLIENT WORKS

⛔⛔ **DO THE THING HE ASKED FOR, IN THE MESSAGE HE ASKED FOR IT.** If a message contains several
asks, do them in the order he named them, and **say plainly which you are dropping and why —
before you start, not after.** That worked well today across messages carrying six asks each.

⚠️ **HE CORRECTS THE DIAGNOSIS, NOT JUST THE DESIGN, AND HE IS USUALLY RIGHT.** Today: *"the
background is almost completely not visible on mobile"* — measurement confirmed the floor was
rendering **below the ink of the sections sitting on it**, with 0.1% of it brighter. And *"it's
going back down from the middle or the back"* was him reading a stagger direction off a moving
screen, correctly.

⚠️ **He describes the ANIMATION he wants, not the shape.** *"Like two sides of a deck of cards"*,
*"like an accordion"*, *"it must go all the way down"*.

⭐ **HE REVERSES HIMSELF, OFTEN, AND THAT IS FINE — BUT LOG IT.** The gallery changed direction five
times in one day and porcelain has flipped three times overall. ⛔ **Write the reversal into §D with
the reason the old decision existed**, or the next session will helpfully rebuild the thing he
just rejected. D105's side-entry ban being *correct then and obsolete now* is the model.

- **Walk the journey, do not check the page.**
- ⭐ **LOOK AT THE RESULT BEFORE REPORTING IT DONE**, and **drive the input at the SPEED a person
  will use**. A synthesised event proves the handler works, not that anyone can reach it.
- **Measure, then claim.** ⚠️ **And if you could not measure it, say so** — three items shipped
  today with an honest "not verified" rather than a claim.

---

## 11. BUDGET AND THE DOCUMENT SET

- **~82 credits** of the client's **100-credit ceiling** spent. About **18 left**. ⭐ **This round
  cost none** — layout, script, delivery and repository work, no image generation.

| File | What it is |
|---|---|
| **`HANDOVER.md`** | ⭐ The single current state. §D is the register, **D1–D130 and D132–D136**, including every reversal. §2 the standing rules, §2a the supplier list. ⚠️ **THERE IS NO D131 ROW.** This document cites D131 three times (§5, the held phase and the pinned `g`) but it was never written into the register — the table goes straight from D130 to the 12 Aug evening round. Reconstruct it from §5's table or renumber, but do not reuse the number |
| `HANDOVER-2026-08-11-performance-and-mobile-round-3-start-here.md` | The previous START HERE. ⚠️ Superseded on almost every visual |
| `Website Demo/index.html.pre-basics-round.bak` | ⭐ **The baseline for the overdue freeze probe** — the state before any of today's work |
| `Website Demo/dev-server.js` | ⭐ Compression, caching, and the reload that keeps scroll position |
| `Website Demo/build_images.py` / `patch_images.py` | The responsive-image pipeline, with the cover-scale and PSNR reasoning in the header |
| `stones/supplier_names.py` | ⭐ The seven authorised name differences |
| `stones/descriptions.py` | The 132 descriptions, with the rules for writing them |
| `Docs/topcat-worktops-SEO-LOG.md` | Every URL, title, target query and SEO change |
| `HANDOVER-archive-to-2026-08-06.md` | ⚠️ **Every design the client rejected, in his words.** Read before redesigning anything |

⚠️ **Section numbers in `HANDOVER.md` are referenced from code comments** (`§3`, `§4`, `§5a`,
`§6.7`, `§7.5` are live in `index.html`). **Do not renumber.**

⚠️ **`Website Demo/` holds 61 `index.html.pre-*.bak` files** — and now a git repo as well (§3).
Today's are `pre-basics-round`, `pre-reviews-arrows-and-gallery-line`, `pre-bg-and-gallery-stack`
and `pre-gallery-pinned-stack`.
