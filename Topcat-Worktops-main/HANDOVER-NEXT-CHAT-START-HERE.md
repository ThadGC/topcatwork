# START HERE — 16 August 2026, after THE WELD ROUND (D269–D277)

Read this, then `HANDOVER.md` **§D** (the register, newest first — this round is **D269–D277**) and
**§2** (the standing rules). That is about twenty minutes and it is enough to work safely.

> ⚠️ **This replaces the previous version of this same file**, which covered the internal pages
> round (D259–D268) and is now `HANDOVER-2026-08-16-internal-pages-round-start-here.md`.
> Everything in it that still matters is carried below.

---

## 0. ⛔⛔⛔ THE ONE THING TO TAKE FROM THIS ROUND

**⭐⭐⭐ A MEAN HIDES A RAMP, AND A NUMBER OFF THE FILE IS NOT WHAT THE SCREEN IS SHOWING.**

The Argento slab was reported pink **four times**. Each fix measured clean and each one was wrong:

| Pass | What was measured | Why it was wrong |
|---|---|---|
| 1 | one mean over the frame → a warm cast | the fault was a left-to-right RAMP, +5 one side to +14 the other |
| 2 | one global white-balance gain | a gain cannot correct a ramp — it left the right third pink and made the left green |
| 3 | flat-field, mean a\* −0.15 ✅ | **he was still being served the file from pass 2**: slab URLs had no version |
| 4 | hard clamp, verified on the ENCODED bytes | lossy WebP pushed chroma back up by +3 after a clean zero in the buffer |

⛔ **MAP A GRID, NOT A MEAN.** ⛔ **MEASURE THE ENCODED FILE, NOT THE BUFFER.** ⛔ **AND MEASURE
THE PIXELS THE BROWSER PAINTS** — draw the served image to a canvas and read it there.

### ⭐⭐ THE SECOND THING: THREE MEASUREMENTS LIED THIS ROUND, ALL THE SAME WAY

Everything that reported a POSITION lied, because something had moved the box without moving the
layout. §12 already says this and it caught three more:

- ⛔ **A PINNED STICKY ELEMENT LIES ABOUT WHERE IT LIVES.** `offsetTop` carries the sticky shift in
  Chrome exactly as `getBoundingClientRect()` does. Re-measuring the weld while `#process` was
  pinned put the start line at the reader's own scroll position and read progress 0 for ever.
  **Every figure is taken off `#about` now, which is never sticky.**
- ⛔ **`.rise` IS A 34px `translateY` AND THE RECT REPORTS IT.** The helix arrows sat exactly 34px
  low because the "Call us" button was read before its reveal landed. **Third time.**
- ⛔ **`cloneNode` COPIES THE STYLE ATTRIBUTE.** The weld buys scroll with an inline `margin-top`
  on `#about`, and the slabs carried their clone 783px below where the real section lands.

---

## 1. ⭐⭐⭐ THE WELD — WHAT WAS BUILT, AND THE FOUR MOMENTS (D269, D270, D272, D274)

Client: *"as the user scrolls, the about us section is going to slide in from both sides like a
sliding door exactly in half, and then have this golden line that merges exactly… almost welding
the two pieces together, and that simulates Topcat adding two stones perfectly together."*

```
px 0 ─────── 360 ──────────────── 1440 ──── 1710      (at 1440x900)
   REST 0.40vh   SLIDE 1.20vh        WELD 0.30vh
   Process held  the slabs close      flash, seam fades, hand-over
```

⛔⛔ **`#process` GOES `position:sticky` AND `--procPin` CHOOSES THE FRAME.** It shows the section's
CONTENT box from the bar's lower edge down, falling back to bottom-flush only when even that cannot
reach. **Bottom-flush alone held the reader on the one frame with the headline cut off** at 824 tall.
⛔⛔ **THE SEAM AT 50% FALLS IN THE COLUMN GUTTER AT EVERY DESKTOP WIDTH** — measured at 1121, 1440
and 1920 before anything was built. **The left slab carries the story, the right carries the
collage.** ⚠️ If `.about-wrap`'s columns or gap ever change, re-measure that the midline still
misses both columns or the doors will slice a word.
⭐ **EACH LEAF PAINTS ITS OWN HALF OF THE PAGE FLOOR**, offset so the grain rejoins — that is the
"two stones matching up", and it is also what makes the hand-over invisible, because `body::before`
is fixed.
⛔ **TWO GATES, NOT ONE:** `#about` is hidden for the WHOLE phase (it rises up the screen behind a
Process with no background of its own); the STAGE only comes up once the slabs move, or both slab
shadows sit parked against the screen edges through the rest window.
⛔⛔ **THE CLONE IS MIRRORED PER FRAME, NOT SNAPSHOTTED**, on its own rAF — `scrollSequence`'s damped
playhead keeps settling for the best part of a second after the wheel stops.
⚠️ **THE EXTRA SCROLL IS BOUGHT** with an inline `margin-top` on `#about` (**906.75px** at
1440×900), behind the pinned section where nothing sees it, and **cleared on teardown**.

⭐ **THE COLLAGE CLOCK IS THE PAIR OF ASKS PULLING OPPOSITE WAYS** — finish before the seam goes
(D272) but let every card fold where it can be SEEN (D274). The window between them is only ~600px
of scroll. `{start:1.21, end:0.576, scrub:0.26}` **only when the weld runs** (desktop, motion on,
`#process` present); `/about/` and the frozen bands keep `{0.94, 0.02, 0.062}`.

---

## 2. ⛔⛔ EVERY SLAB URL IS VERSIONED NOW — BUMP IT (D276)

```
SLAB_V   in Website Demo/index.html          (the wheel)
SLAB_V   in Website Demo/stones/build_stones.py  (132 pages + collection + compare)
```

⛔⛔⛔ **BUMP BOTH, IN STEP, WHENEVER ANY SLAB FILE IS RE-CUT.** Currently **"3"**. Slab files are
not content-hashed and the filename is the slug, so a corrected slab is the same URL as the wrong
one — **that is why the client was shown a stale Argento through two fixes.**
⚠️ **IT DOES NOT HELP THE REVIEW HOST**, which needs the build re-uploading whatever the URL says.

---

## 3. ⚠️⚠️ ARGENTO IS UNRESOLVED AND IT IS NOT A COLOUR PROBLEM

Client, with a photograph: *"according to all of google, this is what Argento looks like. not the
stone you currently have there."* His reference is a **dense flecked grey-white quartz**. The site
shows a **veined marble-look**.

⭐⭐⭐ **VERIFIED AGAINST THE SUPPLIER'S LIVE PAGE, NOT AGAINST OUR OWN COPY:**
`https://nextstoneslabs.co.uk/quartz/` lists **Argento = `argento.jpg`**, "a white marble aesthetic
with delicate grey and gold veining". **That is the file on the site. The harvest did not mispair
it.** "Argento" is Italian for silver and several makers use it — the same trap as "Calacatta
Classic" (§ the archive, D45).
⛔ **HIS STONE IS NOT IN THE CATALOGUE UNDER ANY NAME** — all 132 tiles scanned for a neutral
flecked grey; the nearest are Bianco Sardo (granite speckle), Bianco Antico, Bianco Crystal.
⛔ **DO NOT PASTE THE GOOGLE IMAGE.** Someone else's copyright, and it would put another maker's
slab under his supplier's product name.
⭐ **THE QUESTION HE HAS NOT ANSWERED: whose Argento does he actually sell?**

⚠️ Meanwhile the tile has been colour-corrected as far as it can go: flat-fielded for the lighting
ramp, then the red-green axis hard-clamped so **no pixel in either rung carries any red at all**,
with margin because lossy WebP pushes chroma back up. Cost: mean a\* −2.4, a shade cool of neutral.
The description was rewritten with it — **it used to say "a soft pink cast"**, written honestly
against the bad tile, which is the case `descriptions.py`'s own header warns about.

---

## 4. ⛔⛔⛔ HE HAS SAID HIS TRUST IN THE STONE PHOTOGRAPHY IS GONE

*"you have completely lost my trust in you having the correct stones on display."*

**The honest state, measured:**

| Source | Shipping tiles | Verified? |
|---|---|---|
| Next Stone Slabs | **24** | ✅ **all 24 checked name-by-name against their live page, 16 Aug. Every pairing matches** |
| Nile Stone (`nile` + `nile-inv`) | **92** | ⛔ **not verified.** Their public site does not serve its catalogue to a plain fetch; the harvest ran against a JS bundle and the stock system |
| unattributable from disk | **16** | ⛔ no raw file matches the tile name |

⛔⛔⛔ **THE DEFECT UNDERNEATH IT: THE PIPELINE NEVER RECORDED WHICH SUPPLIER URL EACH PHOTOGRAPH
CAME FROM.** `catalogue.json` keeps source, slug, title, section — no link back. **That is why a
question like his takes an hour instead of a minute.**
⭐ **THE OFFER ON THE TABLE, NOT YET ACCEPTED:** re-run the harvest so every tile carries its source
URL, check all 132 name-against-image, and give him a contact sheet of the whole collection with
names so he can scan it himself. **This is the biggest open item on the project.**

---

## 5. ⛔ THREE DEVICE BANDS — THE DESKTOP IS STILL THE ONE IN SCOPE

```
   ≤ 720px          721 – 1120px          ≥ 1121px
   the phone   ·   the tablet        ·   the desktop
   FROZEN          FROZEN                HE IS WORKING HERE
```

⚠️ **EVERYTHING THIS ROUND WAS DESKTOP-ONLY AND THE BANDS WERE RE-MEASURED BOTH WAYS** — fresh at
900 and 390, AND by dragging a desktop window down with the effect already built. Tablet docH
returns to **13559**, phone to **15125**, both identical to before.
⛔ **THE TABLET IS ON THE SAME PROCESS GRID** (the flex-column fallback only starts at ≤980), so
`--u` could not go near base scope.
⛔ **`#weldStage` IS `display:none` AT BASE SCOPE** — without that one line a desktop window dragged
down to the tablet unfolds **two full-width About sections** into a frozen band.
⛔ **THE TABLET-ONLY BLOCK IS STILL THE LAST THING IN THE STYLESHEET.** Search `THE TABLET BAND`.

### ⚠️ TWO CSS TRAPS THIS ROUND ADDED TO THE LIST

- ⛔ **`#procFlow` AGAINST `#procFlow` IS DECIDED BY SOURCE ORDER, NOT BY THE MEDIA QUERY.** The
  desktop `--u` override was written in a block ABOVE the declaration and lost silently — every
  other number in the same edit landed, which is what made it look like it had worked.
- ⛔ **`node --check` PASSES A DEAD VARIABLE.** A stale `TRAVEL` threw on every frame. ⚠️ **And the
  preview pane keeps console messages across a reload**, so the errors looked live long after they
  were fixed — confirm the running document is the file you wrote (D222) before believing either.

---

## 6. ⭐⭐ EVERYTHING IS PUSHED — AND STOP ASKING HIM

⛔⛔ **DO NOT ASK HIS PERMISSION TO PUSH, OR TO DO ANYTHING ELSE HE HAS ALREADY ASKED FOR.**
*"Why do you keep asking my fucking permission for stuff? I have it on bypass permissions."*

Branch **`tablet-round-d197-d200`**, working tree clean, **level with the remote**.

| Commit | What |
|---|---|
| `e84557e` | D277 no pixel in the Argento file carries any red |
| `f4923b1` | D276 every slab URL version-stamped |
| `c2db029` | D275 the pink is a lighting ramp, so it takes a flat-field |
| `c1a8237` | D273–D275 round helix arrows, every card folds, Argento not pink |
| `4449851` | D272 the collage finishes before the weld line goes |
| `3aa51b5` | D271 smaller Process blocks, tighter About |
| `122d295` | D270 the resting window and the landing that clears the bar |
| `5468f13` | D269 the weld |

⛔ **`gh` IS NOT INSTALLED**, so the PR cannot be opened from here: `brew install gh` once, or
https://github.com/ThadGC/topcatwork/pull/new/tablet-round-d197-d200

---

## 7. ⭐ THE LINK, AND THE HOST QUESTION — NOW THE MOST EXPENSIVE OPEN ITEM

```bash
cd "Website Demo" && nohup caffeinate -ims node dev-server.js > /tmp/topcat-server.log 2>&1 &
```

**Give him `http://192.168.1.102:5501`** — re-check with `ipconfig getifaddr en0`.
⭐ **THE SERVER IS DETACHED ON PURPOSE — PID 5158, untouched for nearly five days.**
⛔ Do not `preview_stop` it and do not kill it to restart.
⭐ **USE `http://localhost:5501` IN THE PREVIEW PANE**, on his instruction.

### ⛔⛔⛔ HE REVIEWS ON `thadeusg3.sg-host.com` AND WE STILL DO NOT KNOW HOW FILES GET THERE

**Asked EIGHT times.** ⚠️ He has said a DEVELOPER uploads the build. ⛔ **This round it cost real
money:** the Argento tile was corrected three times and reported wrong each time, and at least one
of those rounds was almost certainly him looking at a build nobody had re-uploaded. **Get the
mechanism before building anything else he has to review.**

---

## 8. ⛔ THE GATES — RUN THESE

```bash
cd "Website Demo/stones" && python3 harvest/verify.py          # 132/132/132 ✅
cd "Website Demo" && python3 build_pages.py                     # after ANY index.html change
cd "Website Demo/services" && python3 build_services.py         # after a service page change
cd "Website Demo" && python3 build_seo_pages.py                 # after a SERVICE_PAGES/APPLICATIONS change
cd "Website Demo/stones" && python3 build_stones.py             # after a stone page, stone.css or SLAB_V change
```

⛔⛔ **NEVER RUN `Website Demo/trade/build_trade.py`.** Superseded; it would revert the trade page
to 1 August (D233). It is marked at the top of the file.

**The CSS gate, after every CSS edit** — must print `0` and `0`:

```bash
cd "Website Demo" && python3 -c "
import re
css=re.search(r'<style>(.*?)</style>',open('index.html',encoding='utf-8').read(),re.S).group(1)
i=0;bad=0
while i<len(css):
    if css.startswith('/*',i):
        j=css.find('*/',i+2)
        if j==-1: bad+=1;break
        i=j+2;continue
    if css.startswith('*/',i): bad+=1;i+=2;continue
    i+=1
print('comment issues:',bad,'| braces:',css.count('{')-css.count('}'))"
```

⭐ **AND CHECK THE JS PARSES** (⚠️ syntax only — it will not catch a variable you deleted):

```bash
cd "Website Demo" && python3 -c "
import re,subprocess,tempfile
s=open('index.html',encoding='utf-8').read()
js=re.search(r'\n<script>\n(.*?)\n</script>',s,re.S).group(1)
p=tempfile.mktemp(suffix='.js'); open(p,'w').write(js)
print(subprocess.run(['node','--check',p],capture_output=True,text=True).stderr or 'JS OK')"
```

⚠️ **THAT REGEX DELIBERATELY MATCHES ONLY THE MAIN SCRIPT.** A looser one also catches the
`application/ld+json` block, which is JSON and fails `node --check`.

### ⭐ THE FREEZE PROBE — THESE NUMBERS ARE THE PROOF

| Signal | 1440×900, fresh load |
|---|---|
| `.gal-scroll` height | **4950** |
| `--revPer` (on `section.mode-grid`) | **3** |
| `feTurbulence` count | **60** |
| document height | **15469** ⚠️ was 14731 — the weld buys ~907px and D266's divider went |
| elements | **2663** fresh · **~2771** once the weld stage is built on approach |
| `#svcNav` children | **8** |
| hero ink (`.hero-inner` padding) | **164.683 / 97.2** |
| broken images | 0 |
| horizontal overflow | none |
| Process pinned frame air | **60.1 above the title / 60.1 below the buttons** |
| helix arrows vs "Call us" | centres both at **892.8**, delta **0.00** |

⚠️ **MEASURE ON A FRESH LOAD AT THE TARGET WIDTH.** ⚠️ **FILTER BROKEN IMAGES ON
`i.src && i.complete && i.naturalWidth===0`** — `#pmShot` is an `<img>` with no `src` at all.
⚠️ **THE ONLY CONSOLE ERROR ON THE PAGE IS `/favicon.ico` 404** (open item 14).

---

## 9. ⚠️ THE IMAGE PIPELINE IS HAND-DRIVEN, AND GENERATION IS CAPPED AT 2 CREDITS

⛔⛔ **`build_images.py` AND `patch_images.py` ARE BOTH ONE-SHOT AND CAN NO LONGER RUN.**

⭐ **THE ROUTE FOR THE NEXT PHOTOGRAPH:**

1. ⛔ **LOOK ON DISK FIRST** — `assets/projects/` (107), `assets/slabs/` (264), `assets/site/`.
2. ⭐ **AND ASK WHETHER A CROP ANSWERS IT** — D265 removed a badly-reading logo for nothing.
3. Crop with the target boxes measured first — **every slot is at least two different shapes**.
4. Cut rungs with the pipeline's own rules: **LANCZOS, WebP q85, method 6**, clamped to the native
   width. ⛔ **Never upscale to make a table look tidy.**
5. ⛔ **A NEW PREFIX, NOT NEW BYTES UNDER THE OLD ONE** (D241). ⚠️ **THE SLAB TILES ARE THE ONE
   EXCEPTION** — their filename is the slug and four builders read it, so they are overwritten in
   place and `SLAB_V` is bumped instead (§2). Originals go to a dated folder, never deleted.
6. Register the ladder by hand in **`SS`**, keyed on the exact `.img` URL the record carries.
7. `build_pages.py`, then the gates.

⛔⛔⛔ **IF YOU GENERATE: 2 CREDITS MAXIMUM PER IMAGE, HIS EXPLICIT CEILING. CHECK `balance` BEFORE
AND AFTER THE FIRST ONE AND STOP IF IT DOES NOT MATCH.** `get_cost` is not a price — it was wrong
by a hundred times on 15 Aug, and that round cost **101.46 credits**. ⚠️ **The charge settles late:
wait, re-read, then quote a figure to anybody.** ⭐ **This round and the last spent nothing.**

---

## 10. ⭐ WHERE THINGS STAND

| Page | State |
|---|---|
| **`/`** | ⭐⭐ **the About now WELDS over Process on desktop** (§1); hero centred on its ink; four bubbles with gold marks; no brand marquee; smaller Process blocks with 60px of air top and bottom; a tighter About; round helix arrows on the "Call us" line |
| **`/services/*.html`** | ⭐⭐ NINE leaf pages on the landing page's nav, hero and stone floor, FAQ in cards |
| **`/materials/` `/guides/` `/worktops/` `/sitemap.html`** | ⭐ the 26-page SEO layer, same treatment |
| **`/stones/`** | 132 pages + collection + compare; **every slab URL now carries `?v=`** |
| **`/services/` `/projects/` `/estimate/` `/about/` `/contact/`** | the `.page-head` family. ⚠️ **The four that reuse the Process section take the smaller tiles, and `/about/` takes the tighter copy** — same component, deliberately not divergent |
| **`/trade/`** | eight sections ⚠️ its own CTA still shows hours and no WhatsApp |

⚠️ **THREE SHARED PHOTOGRAPHS ARE STILL LIVE AND MUST NOT BE DELETED**: `hero-kitchen.jpg`,
`kitchen-day.jpg`, `cta-slab.jpg`.

---

## 11. ⛔ RULES THAT MUST NOT BE BROKEN

1. ⛔ **Fabrication is IN-HOUSE (D202).** "Our experienced fabricators." It has flipped three times.
2. ⛔ **Never "laser" anything.** They template **by hand**.
3. ⛔ **The brand is "Topcat", one word.**
4. ⛔ **A stone's NAME and PHOTOGRAPH must match the supplier's own.** ⚠️ **And a name is not
   unique across makers — see §3.**
5. ⛔ **Never state what we cannot guarantee, and never use an absolute.** ⭐ **A seam is always
   visible.**
6. ⛔ **Every measurement in millimetres.**
7. ⛔ **Never a bright or gold line across the TOP of a card or section.** ⚠️ A full 34% gold
   BORDER is fine and is the site's standard.
8. **No showroom of our own. Never show the review count. Value, not cheap.**
9. **Voice:** quietly confident master. British English, commas not em dashes, no exclamation marks.
   ⭐⭐ **NO AI SLOP** and **no jargon**.
10. ⛔ **The logo is the client's artwork, is never re-drawn, and is never generated. Set HEIGHT
    only.**
11. ⛔⛔ **A MARK IS NEVER PUT IN A CIRCLE, A RING, A DISC OR A PLATE** (D260, and the back arrow on
    10 Aug). ⚠️ **A CONTROL IS NOT A MARK** — D273 put the helix ARROWS back in the site's round
    `.wbtn`, on his instruction, because every other arrow button on the site is a circle.
    ⛔ **This rule is about logos and icons, not navigation buttons. Do not confuse them again.**
12. ⛔ **ONE DEVICE AT A TIME. Only the client unfreezes a band.** ⭐ **The DESKTOP is in scope.**
    ⚠️ **But a DELETION he asked for is not band-scoped.**
13. ⭐⭐ **THIS IS A DESIGN BUILD. NEVER RAISE THE MISSING FORM BACKEND AS A BLOCKER.**
14. ⛔⛔ **2 CREDITS MAXIMUM PER GENERATED IMAGE.** §9.

---

## 12. ⚠️⚠️ HOW TO MEASURE — THE PART THAT EARNED ITS PLACE

- ⛔⛔⛔ **PRINT THE COMPUTED VALUE BEFORE YOU CHANGE THE DECLARATION (D207).**
- ⛔⛔⛔ **AND LOOK AT IT AFTERWARDS.** A number that passes is not a picture that works.
- ⛔⛔⛔ **A MEAN HIDES A RAMP — MAP A GRID (D275).** Four passes at the same slab, three of them
  measured "clean".
- ⛔⛔⛔ **MEASURE THE ENCODED FILE AND THE PAINTED PIXELS, NOT THE BUFFER (D277).** Lossy WebP put
  +3 of chroma back after a clean zero.
- ⛔⛔⛔ **ANYTHING THAT REPORTS A POSITION LIES IF SOMETHING MOVED THE BOX WITHOUT MOVING THE
  LAYOUT** — a pinned sticky (D270), `.rise`'s 34px translate (D273), `.glow-card`, a 3D hinge.
  `offsetTop` is NOT a refuge from sticky; it carries the shift too.
- ⛔⛔ **MEASURE INSIDE THE TEXT'S OWN `Range` RECT, NOT ACROSS THE BAND (D263).**
- ⛔⛔ **MEASURE THE DRAWN ARTWORK, NOT THE BOX**, on anything with `object-fit`.
- ⛔⛔ **CONTRAST IS MEASURED BY COMPOSITING, NOT BY LOOKING.**
- ⛔ **A DAMPED PLAYHEAD MEANS PROGRESS 1 IS WHERE THE SETTLING STARTS, NOT WHERE IT ENDS** — at
  6.2% a frame the last collage tile needs ~44 frames after the target lands (D272).
- ⛔ **BALANCED IS NOT THE SAME AS CORRECT (D262).**
- ⛔ **A GRID ITEM WITH NO `grid-area` IN A NAMED-AREAS GRID IS AUTO-PLACED (D268).**
- ⛔ **`img.currentSrc` LIES ONCE YOU HAVE BROWSED THE SITE.**
- ⛔ **CONFIRM THE RUNNING DOCUMENT IS THE FILE YOU JUST WROTE** before believing a negative (D222).

### The environment traps (all still live)

- ⛔⛔⛔ **A STRAY `*/` SILENTLY DELETES THE NEXT CSS RULE.** The §8 gate catches it.
- ⛔⛔ **AND A LITERAL TAG INSIDE AN HTML COMMENT BREAKS `build_pages.py`'s BALANCE CHECK** (D262).
- ⛔⛔ **`node --check` PASSES A DELETED VARIABLE** (§5), and **the pane keeps console messages
  across a reload**, so a fixed error still looks live.
- ⛔⛔ **THE PANE FREEZES ANIMATIONS AT ZERO when `document.visibilityState === 'hidden'`**, and
  **a screenshot does not always wake it.** ⭐ **OPENING A NEW TAB DOES** — and a new tab also
  cures the pane's letterboxing, which hit this round repeatedly.
- ⛔⛔ **THE PANE'S SCREENSHOT LETTERBOXES THE PAGE INTO THE TOP-LEFT** and `computer{zoom}` does
  NOT crop. ⛔ **`scrollTo` needs `scrollBehavior:'auto'` set first.**
- ⛔⛔ **`service.css` AND `stone.css` ARE NOT CONTENT-HASHED** — a reload can serve the previous
  edit. ⭐ `fetch(url,{cache:'reload'})` then reload. **Still open** (§13 item 15).
- ⛔ **`javascript_tool` TIMES OUT AT 30s**, and it does not take a Promise — set state on `window`
  in one call and read it in the next.
- ⛔ **NO NUMPY ON THIS MACHINE.** PIL only, pure Python loops. A 1600×1600 flat-field is ~2s.
- ⛔ **NO SVG RASTERISER** — no ImageMagick, no cairosvg, no rsvg.
- ⛔ **AN INVENTED DATA VALUE CAN BLANK THE WHOLE SITE.** Valid presets: calacatta, carrara, crema,
  emperador, eternal, fumo, goldveil, mist, nerogold, statuario.

---

## 13. OPEN — DO THESE NEXT

### ⭐⭐⭐ The two that are costing money

1. ⭐⭐⭐ **HOW DO FILES GET TO `thadeusg3.sg-host.com`?** Asked EIGHT times. **This round it caused
   at least one wasted correction cycle.** Get the mechanism.
2. ⭐⭐⭐ **WHOSE ARGENTO DOES HE SELL?** §3. Until he answers, the page shows his supplier's
   Argento and he believes it is the wrong stone.

### ⭐⭐ Waiting on him

3. ⭐⭐ **THE STONE PHOTOGRAPHY AUDIT** — §4. He has said his trust is gone; the offer to re-run the
   harvest with source URLs and check all 132 is on the table and unanswered.
4. ⭐⭐ **WHAT IS THE CREDIT CEILING NOW?** Nothing spent for two rounds.
5. ⭐⭐ **CLOSE THE CALACATTA GOLD LICENSING QUESTION.**
6. ⭐⭐ **THE LEAF PAGES HAVE NO MOBILE NAV.** A burger and an overlay is the real answer; his call.
7. ⭐⭐ **THE TABLET'S TILES ARE STILL AT HALF BRIGHTNESS** (`.face.front .stone{opacity:0.5}`; the
   13 Aug "full brightness" fix only ever applied below 600px). One line.
8. ⭐⭐ **TRADE TERMS.** Payment, minimum order, lead times, a dedicated contact. **His stated first
   priority.** ⚠️ The trade page's own CTA still carries hours and no WhatsApp.
9. ⭐⭐ **THE FIREPLACE SCOPE, WITH NICK.**
10. ⭐⭐ **ALI JAFFER AND KAV / UXBRIDGE** — two Drive folders that match no project.
11. ⭐ **THE 19 DRONE VIDEOS** in the Hornchurch and Rickmansworth folders.
12. ⭐ **CONFIRM THE SILICA / HSE SENTENCE** in his own words (D202).
13. ⭐ **KITCHEN ISLANDS** — not on his service list; page still live and still linked.
14. ⭐ **TRUSTPILOT** — recommended AGAINST putting 4.0 beside the Google 5.0. **He has not ruled.**
15. ⭐ **THE HORNCHURCH DUPLICATE** — `-g1` and `-g9` are the same nook.

### ⭐ Ready to build

16. ⭐ **THE SITE HAS NO FAVICON AT ALL** — the only console error on the page.
17. ⭐⭐ **CONTENT-HASH `service.css` AND `stone.css`** — §12. **`SLAB_V` is the pattern to copy.**
18. ⭐⭐ **THE TWO DIRECTOR PLATES ARE STILL EMPTY** (Nick, Rimsha). ⛔ **He has said three times:
    generate nothing.**
19. ⭐ **`/services/kitchen-islands.html`** is the one leaf page still on a shared stock hero.
20. ⚠️ **THE GENERATED PAGES SHIP THEIR CODE COMMENTS TO VIEW-SOURCE**, including his own quotes.
21. ⚠️ **THE HORNCHURCH CARD PHOTO** shows a garden with what looks like a child on play equipment.
22. ⭐ **THE `<title>` STILL SAYS "London & the Home Counties"** — the title is a search asset.
23. ⚠️ **~166 LEAF PAGES' META DESCRIPTIONS STILL NAME FOUR COUNTIES**, not eight.
24. ⚠️ **THE SPLASHBACK PHOTOGRAPH'S SOCKETS ARE NOT UK PATTERN.**
25. ⭐ Pick a production host; brotli and long-lived cache headers.
26. ⚠️ **IS IT RIMSHA OR REMSHA?** A real person's name on a public page.
27. ⭐ **FACEBOOK, TIKTOK, YOUTUBE?** ⛔ Do not guess handles.
28. ⚠️ **`Next Stone Slabs` IS NAMED IN ONE PLACE ONLY** — the quartz page's brand sentence.
29. ⚠️ **TWO SLABS LEAN BLUE AND NOBODY HAS RULED ON THEM**: `arabescato-grey` (r−b −13.78) and
    `calacatta-gold-shimmer` (−12.39). Told him; not touched.

**Still waiting on the client:** whether Quartzite becomes a fourth range, 20mm vs 30mm pricing,
brackets for vanity tops / fireplaces / tables, and the £3k vs £3,850 three-slab discrepancy.

---

## 14. ⭐ HOW THIS CLIENT WORKS

⛔⛔⛔ **DO NOT ARGUE YOURSELF OUT OF SOMETHING HE ASKED FOR, AND DO NOT HAND HIM THE DILEMMA
EITHER.** **A real constraint is a problem to solve, not a question to return.**

⛔⛔ **AND DO NOT ASK HIS PERMISSION.** Commit, push, report. See §6.
⚠️ **THE ONE EXCEPTION HE MADE HIMSELF, THIS ROUND:** *"So after deciding, send me a question either
to revert it or to fix it."* **When he asks for a question, give him a question.**

⭐⭐⭐ **HE IS USUALLY RIGHT ABOUT THE DIAGNOSIS, NOT JUST THE SYMPTOM.** *"Randomly placed in that
corner"* was grid auto-placement. *"Still a black corner attached to it"* was an unclipped
rectangle. **"There's still pink in it" was a lighting ramp a mean could not see, and then a stale
cache, and then a lossy encoder.** ⛔ **Take the complaint literally and go and measure the thing
he named — and when he says it is STILL wrong, do not re-measure the same way.**

⭐⭐ **HE SENDS CORRECTIONS MID-TURN, OFTEN THREE OR FOUR DEEP.** **Finish the one you are on, then
take the next in his order** — and if a later message reverses an earlier one, say so in the report
rather than quietly dropping the first.

⭐⭐⭐ **HE REMEMBERS WHAT HE ASKED FOR WEEKS AGO.** **Before saying something is done, check whether
it is done at every width.**

⚠️⚠️ **HE REVERSES HIMSELF FREELY AND FAST — AND THAT IS FINE. LOG IT.** ⛔ **Write the reversal
into §D WITH THE REASON THE OLD DECISION EXISTED.** D273 reversed D243's button shape; the reason
D243 existed is in the row.

⭐⭐ **WHEN YOUR OWN WORK CAUSED THE NEXT FAULT, SAY SO IN THE FIRST LINE.** He is fine with that and
not fine with spin. **This round D274 fixed D272, and D270 fixed D269 — say it plainly.**

⚠️ **HE SWEARS WHEN SOMETHING LOOKS WRONG, AND THE COMPLAINT IS ALWAYS REAL.** *"do whatever you
have to fucking do to get the fucking pink off"* — at that point stop tuning and make it a
guarantee that cannot come back.

- **Walk the journey, do not check the page.**
- ⭐⭐ **LOOK AT THE RESULT BEFORE REPORTING IT DONE.**
- **Measure, then claim.** ⚠️ **And if you could not measure it, say so.**

---

## 15. BUDGET AND THE DOCUMENT SET

- ⛔⛔ **THE 100-CREDIT CEILING IN THE OLD DOCS IS OBSOLETE.** The 15 Aug round spent **101.46** on
  its own. ⭐ **His standing instruction is 2 credits maximum per image.** ⭐⭐ **Ask him where the
  budget actually stands before generating anything.** ⭐ **This round spent nothing.**

| File | What it is |
|---|---|
| **`HANDOVER.md`** | ⭐ The single current state. §D is the register, **D1–D130 and D132–D277**. §2 the standing rules, §2a the supplier list. ⚠️ **THERE IS NO D131 ROW** |
| **`Website Demo/index.html`** | ⭐⭐ The whole landing design — inline `<style>` and `<script>`. Search `THE WELD`, `SLAB_V`, `THE TABLET BAND`, `const SERVICES`, `const SS`, `--barH`, `--procPin`, `weldClock`, `footToCallUs` |
| **`Website Demo/build_pages.py`** | ⭐⭐ Builds the seven internal pages and the shared assets. **Owns `/trade/index.html`.** ⚠️ Its `section()` has two guards |
| **`Website Demo/services/service.css`** | ⭐⭐⭐ **The shared sheet EVERY generated page links — 176 of them** |
| **`Website Demo/services/build_services.py`** | ⭐ The nine service leaf pages, `HERO_IMG`, `TC_DEFS` / `HERO_CHIPS` |
| **`Website Demo/build_seo_pages.py`** | ⭐ The 26-page SEO layer, the sitemap, `APPLICATIONS` |
| **`Website Demo/stones/build_stones.py`** | Builds the collection, compare.html and 132 stone pages. ⭐ **Carries `SLAB_V`** |
| **`Website Demo/stones/descriptions.py`** | ⭐⭐ One line per stone, written against the tile we ship. ⛔ **Its header's rule bit this round: re-cut a tile and its sentence is stale** |
| **`Website Demo/stones/harvest/`** | The pipeline, `LICENSING.md` (read before enabling a source), `catalogue.json`, `verify.py`. ⛔ **No source URL is recorded per tile — §4** |
| ⛔ **`Website Demo/trade/build_trade.py`** | ⛔⛔ **SUPERSEDED — DO NOT RUN** |
| ⛔ **`build_images.py` `patch_images.py`** | ⛔⛔ **ONE-SHOT, CANNOT RUN AGAIN** — see §9 |
| `Website Demo/assets/site.css` `site.js` | ⛔ **GENERATED. Never edit.** |
| **`Website Demo/assets/slabs/`** | ⭐ 264 slab photographs. ⚠️ `.pre-wb-2026-08-16/` holds the original Argento bytes |
| **`Website Demo/assets/projects/`** | ⭐ **107 WebP files — the client's real portfolio** |
| **`Website Demo/assets/brand/`** | ⭐ The client's own artwork. ⛔ **Never re-drawn, never generated** |
| `Docs/topcat-worktops-SEO-LOG.md` | Every URL, title, target query and SEO change |
| `HANDOVER-2026-08-16-internal-pages-round-start-here.md` | ⭐ **The START HERE this file replaces** (D259–D268) |
| `HANDOVER-archive-to-2026-08-06.md` | ⚠️ **Every design the client rejected, in his words.** Read before redesigning anything |

⚠️ **Section numbers in `HANDOVER.md` are referenced from code comments** (`§3`, `§4`, `§5a`, `§6.7`,
`§7.5` are live in `index.html`). **Do not renumber.**
