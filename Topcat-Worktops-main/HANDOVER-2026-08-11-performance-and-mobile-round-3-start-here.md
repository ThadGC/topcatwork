# START HERE — 11 August 2026, end of the PERFORMANCE + THIRD MOBILE ROUND

Read this, then `HANDOVER.md` **§D** (the decision register, start at **D109–D114**) and **§2**
(the standing rules, especially **rule 15**). That is about fifteen minutes and it is enough to
work safely.

> ⚠️ **This replaces the version written after the SECOND mobile round**, now archived as
> `HANDOVER-2026-08-11-mobile-round-2-start-here.md`. That file described a site shipping **3 MB
> on the first screen**, a phone whose services section was a **helix**, and a gallery whose copy
> sat **below** the cards. ⚠️ It also gives the freeze probe a **2.6s** settle, which is wrong —
> see §0.

---

## 0. ⛔ SCOPE, BEFORE ANYTHING ELSE

**DESKTOP AND TABLET ARE FROZEN. THE WORK IS MOBILE, ON HIS PHONE, OVER THE LAN LINK.**

> Client, 11 Aug: *"When I talk about the service stopping, I'm only talking about mobile. This
> is the only place I'm viewing things now. And when I say mobile, I mean on my phone separately
> on the link you sent me."* And: *"the helix stays on desktop. I'm only talking about mobile."*

| Band | What it gets | Status |
|---|---|---|
| **≤ 720px** | the mobile build | ⭐ live scope |
| **721–1120px** | the old tablet/fallback layouts | ⛔ **frozen, untouched** |
| **≥ 1121px** | the desktop composition | ⛔ **frozen, signed off (D91)** |

⚠️ `index.html` is one file with **inline CSS**, so nearly every rule is unscoped. ⛔ **Mobile
work goes inside `@media(max-width:720px)`. Never edit a base rule to fix mobile.**

### ⛔ ORDER DECIDES, AND IT HAS NOW BITTEN THREE TIMES

`.gal-mid-actions{margin-top:auto}` inside the mobile query **lost** to a base
`.gal-mid-actions{margin-top:clamp(...)}` that sits *later in the file* at equal specificity.
Same fault as D106, and again in D114 with the two-column grid. ⭐ **When a mobile override does
not take, check what comes AFTER it before you touch anything else** — add a parent to the
selector (`.gal-mid .gal-mid-actions`) rather than moving code.

### ⭐ PROVE THE FREEZE — AND THE OLD PROCEDURE IS WRONG

1. `cp index.html.pre-<thing>.bak _regress-before.html` and serve both.
2. Walk the whole page in each, then **settle 8 SECONDS**, then probe rects + computed styles.
3. Diff. ⚠️ **Delete the temp copy afterwards** (D60's failure mode).

⛔ **2.6s IS NOT ENOUGH AND IT PRODUCED A 415-DIFF FALSE ALARM (D113).** The stone wheel's
one-shot entrance is still running well past that, and **335 of those 415 were its 67 slabs at a
different rotation**. At 8s the same comparison gave 31.

⛔ **AND WHEN THE PROBE IS STILL NOISY, DO NOT ARGUE WITH IT — REPLACE IT (D114).** A later run
returned **653** diffs with the wheel *and* the gallery both mid-flight. The answer was to stop
diffing the whole document and instead **compare the exact computed properties the round
touched**, on both frozen widths:

```js
// deterministic, animation-proof, and it is what proved D114 safe
pick(helixStage, ['display','perspective','height','touchAction','webkitMaskImage'])
pick(grid,       ['display','gridTemplateColumns','gap','maxWidth','perspective','padding'])
pick(svcCard,    ['aspectRatio','minHeight','transformOrigin'])
```

Byte-for-byte identical at 1440×900 **and** 768×1024 is the evidence. ⭐ **Element count and
document height matching is a strong signal on its own** — a real layout regression moves one of
them.

⚠️ **Baseline noise floor:** grab the same page twice, 3s apart, touching nothing → **29 diffs**,
all the brand marquee and the bouncing scroll cue. That is the floor to compare against.

---

## 1. ⛔ RUN THIS BEFORE YOU DEPLOY, AND BEFORE YOU CALL ANYTHING DONE

```bash
cd "Website Demo/stones" && python3 harvest/verify.py
```

> 132 stones, 132 with a photograph, 132 pages on disk — ✅ PASS

**Nine checks**, every one of which exists because it caught something already live. ⭐ Checks 8
and 9 — the photograph's supplier, and the name against the supplier's own title — matter most.
⚠️ **It covers the STONES only.** Nothing in it looks at the landing page.

---

## 2. ⛔ THE LINK — READ THIS BEFORE HE SAYS IT IS BROKEN AGAIN

```bash
cd "Website Demo" && nohup caffeinate -ims node dev-server.js > /tmp/topcat-server.log 2>&1 &
```

**Give him `http://<lan-ip>:5501`** — `ipconfig getifaddr en0`. It was `192.168.1.102:5501`.

⭐ **THE SERVER IS DETACHED ON PURPOSE (PPID 1).** ⛔ **DO NOT `preview_stop` IT, DO NOT KILL IT
TO RESTART, AND DO NOT LET THE PREVIEW TOOLING OWN IT.** The single biggest cause of "the link
keeps closing" was **this session's agent killing it repeatedly** — at one check nothing was
listening at all. Verify with `lsof -nP -iTCP:5501 -sTCP:LISTEN` before blaming his phone.

⚠️ **THREE SERVERS ONCE RAN AT ONCE** (5501, 57144, 58295) and the two older ones were still
running the **pre-compression code**. If he opens the "normal" port and reports no improvement,
check which process is actually serving it.

### What the dev server now does, and what does NOT travel to production

| | |
|---|---|
| brotli / gzip on text | HTML **1,084 KB → ~205 KB** over the wire |
| `Cache-Control: no-cache` + ETag on HTML | 0-byte 304s, **and the tab survives backgrounding** |
| `public, max-age=300` + ETag on assets | a repeat photo fetch is 0 bytes |
| reload keeps scroll position | ⭐ see below |

⛔ **`no-store` WAS THE BUG THAT KILLED HIS BACKGROUNDED TAB (D111).** It does not merely skip
the cache — **it makes a page ineligible for the back/forward cache**, so Chrome discarded the
tab and coming back meant a fresh network fetch, which is the one that fails while a phone's
Wi-Fi re-associates. ⚠️ The names mislead: `no-cache` means *revalidate*, `no-store` means
*never keep it*. Only the second breaks the phone.

⭐⭐ **EVERY SAVE TO `index.html` RELOADS HIS PHONE.** Twelve reloads in one working session.
Each one used to dump him at the hero, which from the far end of a phone is indistinguishable
from the page glitching — it explained more of "it takes me right back to the hero" than any page
code did. The reload now **saves and restores scroll position** (verified: parked at 6000,
reloaded, still 6000). ⚠️ **Tell him when you are about to do a run of edits.**

⛔ **ALL OF §2 IS DEV-SERVER ONLY.** No production host is chosen. Whatever is picked must do
brotli on text and long-lived cache headers on assets or the whole gain is lost.

**⚠️ There is no git.** Take a dated `index.html.pre-<thing>.bak` before any large edit — **50 of
them now**. This round's: `pre-image-optim`, `pre-gallery-round3`, `pre-gal-copy-and-svc-grid`.

---

## 3. ⛔ THE INTEGRITY RULE — still the one that matters most

> "These names cannot be wrong. If someone googles it and sees it looks different here, then we
> have a big problem. And if someone chooses this one by this name and TopCat somehow shows up at
> the house with a wrong looking slab, then we are fucked."

⭐ **A stone name is only meaningful RELATIVE TO A SUPPLIER.** The only defensible test is that
the photograph shipped under a name is the one **that supplier** publishes under **that name**.
Checks 8 and 9 enforce exactly that.

**Four ways this has already gone wrong:** a finish word dropped from a plain name (15 stones); the
right stone at the wrong **VIEW** (a tight zoom on a quiet patch — no check catches this, only the
eye); a rename made by the agent; and ⛔ **a SUBSTITUTION made by the agent** — search the
supplier's own search box before concluding a product does not exist, and never substitute.

⚠️ `stones/supplier_names.py` holds **seven authorised name differences** and records the exact
string an order must be placed against. ⛔ It is not a licence to rename a different product.

---

## 4. ⭐ WHERE THE PHONE STANDS

| Section | State |
|---|---|
| **Top nav** | formed at scroll 0, flare off (D106) |
| **Hero** | centred, 30° bevel, CTAs matched to the icon row (D92–D100) |
| **Reviews** | drum carousel, interruptible, swipe works (D101/D102/D107) |
| **Services** | ⭐ **NEW: the helix is GONE. Six square 152×152 blocks, two across, that slide together into place (D114)** |
| **Project gallery** | ⭐ pile centred; arrives while the divider is still crossing; **title + subtitle ABOVE the cards, buttons BELOW** (D110, D113) |
| **Sticky bottom bar** | Get a quote · Email · Call (D99/D106) |
| Everything else | ⛔ untouched — still the desktop-era layout at phone width |

### ⭐ THE HELIX IS GONE ON MOBILE, AND NOTE WHAT THAT DELETED (D114)

`--hxMode` is no longer set to `phone`, so `hxPhone()` is false and **the phone's entire gesture
path switches itself off**: `attachSwipe`'s `enabled` gate never opens, the stage's
`touch-action:none` stops applying, and that section scrolls like any other. ⭐ **D102, D103 and
D112 all existed to make a hand-rolled scroll behave on that one component. On a phone there is
now nothing to hand-roll.** ⛔ **The helix stays on desktop and is untouched** (his words, and
D91 anyway).

⚠️ `attachSwipe` is still live for the **reviews** carousel — D112's fixes still matter.

### ⛔ THE LESSONS THAT COST TIME THIS ROUND

1. ⛔ **A GLIDE THE CUSTOMER CANNOT STOP IS A RACE, NOT A FEEL PROBLEM (D112).** `stopGlide()`
   was reachable only from a `pointerdown` **on the stage**, so a thumb down anywhere else did
   nothing — measured **406px of further travel after the touch**, with the native scroll that
   touch started running at the same time. Two things driving `window.scrollTop` sixty times a
   second. Now killed by a capture-phase `pointerdown`/`touchstart`/`wheel` on the **window**.
2. ⛔ **RELEASE SPEED FROM ONE EVENT PAIR IS A LIE (D112).** `vy=step/dt` with dt floored at 1ms,
   and a phone delivers a move every 4–8ms: a **40px flick threw the page 309px**. Now averaged
   over a 70ms window, which also means a pause-then-lift does not fling at all.
3. ⛔ **`min-height` + `aspect-ratio` SOLVES A TILE BACKWARDS (D114).** A rule written for the old
   one-column phone (`min-height:420px`) honoured both the ratio and the floor and derived the
   **WIDTH** from the height: a **375px card in a 146px column**, hanging off both edges. The
   client photographed it. `min-height:0` is the whole fix, and it is now `!important` because
   this was got wrong twice.
4. ⛔ **`space-between` NEEDS TWO CHILDREN (D113).** The gallery copy column has three, so it put
   the **subtitle in the middle of the screen**. `flex-start` + `margin-top:auto` on the actions.
5. ⛔ **A BLOCK THAT SPANS THE STAGE MUST BE `pointer-events:none` (D113)** or the cards under it
   stop being tappable.
6. ⚠️ **`.hx-front` IS A CARD FACE, NOT A POSITION.** A test that read it as "which card is in
   front" reported the helix swipe broken — on the *unchanged baseline* too. **Measure card
   rects.**

---

## 5. ⚠️ THE TRAPS THAT WILL WASTE YOUR SESSION

### ⛔ The environment lies — three ways, all cost real time this round

- ⛔ **`requestAnimationFrame` DOES NOT RUN WHILE THE BROWSER PANE IS HIDDEN.** The gallery loop
  shuts itself off when caught up and restarts only from a scroll event, so a hidden pane leaves
  every card frozen and reads exactly like a broken build. **It caused a full false diagnosis of
  "I broke the gallery".** ⭐ Check `document.visibilityState` before believing a still scene.
- ⛔ **THE EDITOR HOOK OPENS A `file://` TAB** of `index.html`, and `javascript_tool` will happily
  run there instead of on `http://localhost:5501`. Several measurements landed on it. ⭐ Check
  `location.href` in the probe itself, and `tabs_context` when a result looks impossible.
- ⚠️ **The console REPLAYS STALE ENTRIES.** A `barH is not defined` error was read as live and
  came from the gap between two saves; a fresh instrumented run returned zero. ⭐ Write
  `_debug.html` with an error probe as the first thing in `<head>`, drive it, read `__ERRS__`.
  ⚠️ **Delete `_debug.html` afterwards.**

### Still true from earlier rounds

- ⛔ **`catalogue_source.py` is a 52-STONE SNAPSHOT. It is not the range.** `catalogue_active.py`
  is. Four live defects came from reading the wrong one.
- ⛔ **AN INVENTED DATA VALUE CAN BLANK THE WHOLE SITE.** Valid presets: calacatta, carrara,
  crema, emperador, eternal, fumo, goldveil, mist, nerogold, statuario.
- ⛔ **`[hidden]` LOSES TO ANY AUTHOR `display` RULE.**
- ⛔ **THE RANGE IS ALPHABETICAL EVERYWHERE (D85).** ⛔ **NO DARK STONE ON THE FIRST SCREEN (D86).**
- ⚠️ `10cm` in Judy Z.'s review trips the millimetres scan and must stay. A real customer's words.
- ⛔ **SUPER-RESOLUTION DESTROYS SPECKLE (D88a).** For a speckled stone, **resample**.
- ⚠️ **`-s.webp` IS 800px, NOT 300.** ⛔ **Do NOT run `expand.py`.**
- ⚠️ **`vh` behaves differently on a real phone.** The hero is `min-height:90vh` on mobile.

---

## 6. THE PIPELINE

```bash
cd "Website Demo/stones"
python3 apply_catalogue.py            # MATERIALS + SLAB_TILES into ../index.html, with guards
python3 harvest/similar.py            # measures tiles -> similar.json. BEFORE build.
python3 build_stones.py               # 132 stone pages + the collection grid
python3 harvest/verify.py             # ⛔ the gate, nine checks
cd .. && python3 build_seo_pages.py   # 26 pages incl. the sitemap
```

### ⭐ NEW: the responsive-image pipeline (D109)

```bash
cd "Website Demo"
python3 build_images.py     # extracts + builds the WebP ladders into assets/site/
python3 patch_images.py     # wires index.html to them. EVERY replacement is asserted
```

⛔ **THE ORIGINALS IN `assets/` ARE NEVER TOUCHED OR DELETED** — `kitchen-day.jpg` is referenced
by 20 other files. Ladders are written alongside into `assets/site/` (23 variants, 1.3 MB).
⛔ `patch_images.py` aborts and writes nothing if any pattern matches an unexpected number of
times — a partial patch of a 1 MB file with no git is the worst outcome available.

⚠️ **SIZE AN IMAGE BY ITS COVER-SCALED RENDER WIDTH, NOT ITS ELEMENT WIDTH.** Every photo here is
`object-fit:cover` in a box taller than it is wide, so the browser scales to the box's HEIGHT and
crops the sides. Judging by width said `cta-slab.jpg` was 6× oversized when it was *under*-sized.
⚠️ **PSNR lies on downscales** — quarry scored 33 dB at 764px and 41 dB at 1000px, the same
picture one crop-pixel apart. **Judge by eye at 4× zoom.**

**Where it landed:** first screen **3,037 KB → 286 KB**; photographs **2,158 KB → 445 KB**;
99 MB of decoded image memory on the phone largely gone. ⭐ **That memory figure, not the
download, was the original "glitching and jumping".**

---

## 7. ⛔ RULES THAT MUST NOT BE BROKEN

1. ⛔ **A stone's NAME and its PHOTOGRAPH must both match the supplier's own** (§3).
2. ⛔ **Fabrication is OUTSOURCED. Never claim in-house.** Templating, fitting and aftercare ARE
   theirs and may be claimed freely.
3. ⛔ **Never state something we cannot guarantee, and never use an absolute.**
4. ⛔ **Every measurement in millimetres.** The estimator's linear metres of edging is the
   exception, because it is a pricing unit.
5. ⛔ **A stone is called what it is; the range is named for what it contains** — "Marble &
   Quartzite".
6. ⛔ **Never a bright or gold line across the TOP of a card or section**, anywhere.
7. ⛔ **Suppliers are never named publicly.** Porcelain never goes on the stone wheel.
8. **No showroom. Never show the review count. Never signal a young company. Value, not cheap.**
9. **Voice:** quietly confident master. British English, commas not em dashes, no exclamation
   marks.
10. ⛔ **The logo is the client's artwork and is never re-drawn. Set HEIGHT only.**
11. ⛔ **ONE DEVICE AT A TIME. Desktop is frozen and only the client unfreezes it.**

---

## 8. ⚠️ WHAT THE CLIENT HAS AND HAS NOT SEEN

⭐ **He is reviewing on his phone only, over the LAN link.** He is not looking at the desktop
build at all right now.

**Not yet seen — everything desktop from 7 August onwards:** the real logo, the page floor, About
and Why by scrolling, the stones (wheel, collection, a stone page), and the SEO layer.

⚠️ **Say out loud that the three director portraits and the Why feature shot are placeholders.**

---

## 9. OPEN — DO THESE NEXT

### ⭐ His live list, in his words, none of it done

1. ⭐⭐ **The project gallery: ONE SWIPE from four cards to eight.** *"it should take one swipe to
   go from showing four cards to showing eight cards."* Today the second set arrives on **scroll**
   (`WALK_START`/`WALK_END` on the pinned progress). Making it a swipe means wiring `attachSwipe`
   to the gallery — ⚠️ read D112 first, all of it.
2. ⭐⭐ **And make it obvious more exist.** *"it should be clear that there's more cards… right
   now, as a new user, I'd only see the four projects done."* No affordance exists at all.
3. ⭐ **The gap before the cards arrive.** *"there's one giant opening when you scroll before it
   comes up."*
4. ⭐ **The divider looks wrong.** *"the divider is not just a straight line, it looks like there's
   some design error there."* ⚠️ There is a bright bloom sitting on that line in his screenshot —
   **look at it before assuming it is the flare.**
5. ⚠️ **The animations are not smooth on his iPhone.** He parked it, twice. **NOT diagnosed.**
   Frames measure 8ms p50 on the Mac, so it is device-side — the coasting rAF playhead and the
   composited card layers are the first places to look.

### The two that actually block go-live — unchanged, and neither is design

6. ⭐⭐ **The enquiry form has no backend, and it carries file uploads.** `buildEnquiry()` assembles
   a `FormData` and has nowhere to POST. The client was burned by a previous agency whose site
   produced **one client in nine months**, and this engagement will be judged on **measurable
   leads**. **Top open item for eleven sessions.**
7. **Photography — the STONES are done. The PEOPLE and the PROJECTS are not.**

### Everything else

8. ⚠️ **A live copy problem, flagged and NOT fixed** — `SERVICES[0].long` promises worktops *"cut
   from a single slab, vein-matched across every joint"*: both a claim to fabrication TopCat
   outsource (rule 2) and an absolute (rule 3). ⛔ **Live on tablet widths right now.**
   ⚠️ `verify.py` check 7 does not scan index.html's inline data.
9. ⭐ **Pick a production host** and give it brotli + cache headers (§2).
10. ⭐ Close the licensing question on Caesarstone, CRL and Bloom. Walk the name-and-image audit
    sheet. Harvest AKG, Cosentino/Silestone, Fugen. ⛔ Classic Quartz Stone is off limits.
11. ⭐ **Calacatta Gold is UNRESOLVED** — needs the maker's name from his intro video.
12. **Build `/services/`**, have TopCat read the 132 descriptions, real project photographs.
13. **The TABLET round**, when he calls it. ⚠️ The services flip-card grid and the reviews'
    side-arrow rule still dress 721–1120px, and the nav still forms on scroll there.

**Still waiting on the client:** whether Quartzite becomes a fourth range, 20mm vs 30mm pricing,
brackets for vanity tops / fireplaces / tables, the hero's "Request a call" demotion (asked four
times), and the £3k vs £3,850 three-slab discrepancy.

---

## 10. ⭐ HOW THIS CLIENT WORKS, AND WHAT IT MEANS FOR YOU

⛔⛔ **DO THE THING HE ASKED FOR, IN THE MESSAGE HE ASKED FOR IT.** This round's worst moment was
not a bug. He said *"for mobile, we're no longer going to do the helix, I want a two by two
grid"*; the agent did a different item from the same message and reported the helix as "next".
He was rightly furious. ⭐ **If a message contains two asks, do the one he named first, or say
plainly which you are dropping and why — before you start, not after.**

⚠️ **He corrects the DIAGNOSIS, not just the design, and he is usually right.** *"It's not my Mac
that's sleeping, it's when I go off of Chrome on my phone"* pointed straight at `no-store` and
bfcache, which no measurement had suggested. **Take his correction as data.**

⚠️ **He describes the ANIMATION he wants, not the shape.** *"I did not tell you to make it look
like doors, I told you the animation."* Doors were his simile for how they should move; the
blocks were supposed to keep looking like blocks.

**Every defect of the last nine sessions rendered perfectly.** A page showing `322 x 162 mm` looks
no different from `3220 x 1620 mm`. A swipe handler bound to the wrong event type looks exactly
like a swipe handler. Three lines of editor's notes as body text looked like nothing and moved the
whole site 48px.

- **Walk the journey, do not check the page.**
- ⭐ **LOOK AT THE RESULT BEFORE REPORTING IT DONE**, and **drive the input at the SPEED a person
  will use**. A synthesised event proves the handler works, not that anyone can reach it.
- **Measure, then claim.** **Write the check that fails the build**, not the note that warns.
- ⚠️ **A guard that fires is usually right** — and a probe that returns nonsense usually means the
  probe is wrong, not the site (§5).

---

## 11. BUDGET AND THE DOCUMENT SET

- **~82 credits** of the client's **100-credit ceiling** spent. About **18 left**. ⭐ **This round
  cost none** — layout, script and delivery work, no image generation.

| File | What it is |
|---|---|
| **`HANDOVER.md`** | ⭐ The single current state. §D is the register, **D1–D114**, including every reversal. §2 the standing rules, §2a the supplier list |
| `HANDOVER-2026-08-11-mobile-round-2-start-here.md` | The previous START HERE. ⚠️ Superseded — pre-performance, pre-grid, and its 2.6s settle is wrong |
| `HANDOVER-2026-08-11-mobile-round-2.md` | The narrative of the second mobile round: the gesture arbiter and the drum |
| **`Website Demo/build_images.py`** | ⭐ The image pipeline, with the cover-scale and PSNR reasoning in its header |
| **`Website Demo/patch_images.py`** | ⭐ Wires the ladders into index.html. Every replacement asserted |
| **`Website Demo/dev-server.js`** | ⭐ Compression, caching and the reload that keeps scroll position. Read its header before changing headers |
| **`stones/supplier_names.py`** | ⭐ The seven authorised name differences |
| `stones/catalogue_mirror.py` / `catalogue_dark.py` | The Mirror range and the substitution write-up; the dark quartz and the six rejected |
| `stones/descriptions.py` | The 132 descriptions, with the rules for writing them |
| `Docs/topcat-worktops-SEO-LOG.md` | Every URL, title, target query and SEO change |
| `HANDOVER-2026-08-10-slab-photography-complete.md` | ⭐ How the photography pipeline works |
| `HANDOVER-archive-to-2026-08-06.md` | ⚠️ **Every design the client rejected, in his words.** Read before redesigning anything |

⚠️ **Section numbers in `HANDOVER.md` are referenced from code comments** (`§3`, `§4`, `§5a`,
`§6.7`, `§7.5` are live in `index.html`). **Do not renumber.**

⚠️ **`Website Demo/` holds 50 `index.html.pre-*.bak` files.** They are the only version control
there is. This round's are `pre-image-optim`, `pre-gallery-round3` and
`pre-gal-copy-and-svc-grid`.
