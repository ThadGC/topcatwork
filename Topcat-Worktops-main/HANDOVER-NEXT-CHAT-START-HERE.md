# START HERE — 16 August 2026, after the INTERNAL PAGES ROUND (D259–D268)

Read this, then `HANDOVER.md` **§D** (the register, newest first — this round is **D259–D268**) and
**§2** (the standing rules). That is about twenty minutes and it is enough to work safely.

> ⚠️ **This replaces the previous version of this same file**, which covered the brand plate
> round (D246–D258) and is now `HANDOVER-2026-08-15-brand-plate-round-start-here.md`.
> Everything in it that still matters is carried below.

---

## 0. ⛔⛔⛔ THE ONE THING TO TAKE FROM THIS ROUND

**⭐⭐⭐ AN INSTRUCTION CARRIED OUT ON ONE BAND IS NOT CARRIED OUT. THIS ROUND FOUND THREE OF THEM
STILL LIVE, AND ONE WAS SIX DAYS OLD AND HE HAD TO ASK AGAIN.**

| What he asked | What was built | Found |
|---|---|---|
| *"remove that rolling bar divider completely"* (D143) | A swap inside `@media(max-width:720px)`. **Desktop and tablet kept the marquee.** | He asked again this round (D266) |
| Black corners on the curve (his phone) | Radius + `overflow` + `translateZ` inside `@media(max-width:720px)` | He asked again for *"all platforms"* (D264) |
| *"remove eyebrows from all the internal pages"* (D197) | `@media(max-width:720px){.eyebrow{display:none}}` | Already re-fixed at D229 |

⛔⛔⛔ **THE TEST IS NOT "IS THE BAND HE NAMED FIXED", IT IS "IS THERE ANY WIDTH WHERE THE OLD THING
IS STILL THERE".** Freezing a band protects a **composition** he signed off. It does not protect a
thing he has just told you to delete — deleting it everywhere is the instruction, and the frozen
band keeps its layout either way.
⚠️ **AND WHEN A ROOT CAUSE IS A COMPOSITOR, A CACHE OR A PAINT ORDER, IT WAS NEVER A PHONE
BEHAVIOUR IN THE FIRST PLACE.** D264's corner escape is a promoted child compositing after its
parent's clip is rasterised. That happens on any engine that promotes. It was scoped to the phone
because the phone was where he could see it.

### ⭐⭐ THE SECOND THING: THE FIRST VERSION GETS REJECTED, SO BUILD IT TO BE LOOKED AT

Twice in this round the measured, defensible answer was the wrong one:

- **The gold marks.** Each was set in a 26px ring to match the Google mark's diameter. *"I don't
  like the circles. Stop doing that."* ⭐ **He had already given that rule about the back arrow on
  10 Aug** — *"not a circle around it, not anything, just simple."* **This site does not put marks
  in containers.**
- **The internal hero's veil.** The page head's flat 0.62 was the obvious reuse and it FAILS on
  daylight photographs: gold h1 **2.43:1**. It needed a centred scrim, and finding that out took a
  measurement, not an opinion.

⭐ **ZERO CREDITS WERE SPENT THIS ROUND.** Every image change was a crop or a re-point.

---

## 1. ⭐⭐ THE HERO IS CENTRED ON ITS INK, NOT ITS BOX (D259)

Client: *"if you take everything together, spaced out as it is, it doesn't look like it's exactly
in the center on the vertical axis."*

⛔⛔ **THE FRAME IS THE ONE UNDER THE NAV BAR, AND BOTH READINGS WERE BUILT AND SCREENSHOTTED
BEFORE CHOOSING.** Centred in the hero BOX (screen top → gold arc) the block moves up 27px and
reads plainly top-heavy. The bar is 78.5px of visible furniture and the eye starts below it.

⭐⭐ **AND IT IS THE INK, NOT THE BOX.** The headline's first line carries **11px** of leading above
the cap at 89.28px, so a box centred by arithmetic still looks low by that much.
`--hTitle * 0.1234` is that leading off Cinzel's own metrics, in em, so it holds at every size.

```
padding-top = padding-bottom + var(--barH) − var(--hTitle) * 0.1234
```

⛔ **ONE RELATION, NOT TWO CLAMPS.** D235 tuned them as a pair and left the ink 179/203.
Measured now: **191.26 / 191.27** at 1440×900, **158.5 / 159.1** at 1280×800, **257.9 / 258.2** at
1141×1000.

⚠️ **`--barH` IS 78.5px ON DESKTOP AND 80px IN BOTH FROZEN BANDS**, where the burger's 44px control
sets the height. Declaring the desktop number at base scope silently took 1.5px off the phone and
the tablet — **caught only by measuring the frozen bands after a base-rule edit.**

---

## 2. ⛔⛔⛔ THE MARKS ARE STRUCK METAL AND THEY ARE NEVER IN A CIRCLE (D260)

The four hero bubbles each carry a mark: the Google "G", then **10**, **72** and a **house**.

- ⭐ **THE NUMERAL IS THE ICON.** Serif face at 23px carrying the site's champagne ramp through
  `background-clip:text` — the identical treatment every gold accent word on the page takes.
  The chip still reads "10 year guarantee" to a screen reader.
- ⛔⛔⛔ **NO RING, NO PLATE, NO DISC, EVER.** §2 rule 17 now.
- ⛔ **THE HOUSE IS A STROKE, SO IT TAKES `#tcGold`.** `#tcGoldSolid` is the ramp for FILLED
  glyphs and goes flat on a 1.3px line. Both live in `.tc-defs`.
- ⚠️ **THE HOUSE NEEDS ITS OWN CLASS.** `background-clip:text` on a box containing an SVG clips
  the box's paint to text that is not there and leaves the icon unpainted.

---

## 3. ⭐⭐⭐ THE INTERNAL PAGES ARE THE LANDING PAGE NOW (D263) — AND THAT COSTS SOMETHING

All 176 generated pages take the landing page's **nav bar**, its **centred hero with the four
bubbles**, and its **stone floor**. The FAQ is cards. Client: *"way too basic of a design. You can
do better than that."*

⛔⛔⛔ **THE BUBBLES AND THE BAR NOW EXIST IN TWO STYLESHEETS AND MUST BE CHANGED IN BOTH.**
`index.html`'s `<style>` is the original; `services/service.css` carries the port. There is no
import path between them and `site.css` is 537KB, which is why it is not simply linked. **Search
`D263` in `service.css` — every ported block says where the original lives.**

| Thing | Where |
|---|---|
| The bar, the hero, the floor, the FAQ cards | `services/service.css` |
| The bubbles' markup, the paint servers, the scroll listener | **all three builders** — `services/build_services.py`, `build_seo_pages.py`, `stones/build_stones.py` |

⭐⭐ **ONE RULE HOLDS ALL 176 CLEAR OF THE NOW-FIXED BAR:** `body` pads by `--barH` and `.svc-hero`
takes it straight back with a negative margin. ⛔ The pages start three different ways — 22 with
`.svc-hero`, 147 with a bare breadcrumb, and that trail is `display:none` on a phone — so a rule
hung on any one of them leaves a whole family under the glass at some width.

⛔⛔ **THE VEIL IS A CENTRED SCRIM AND ITS FIVE NUMBERS WERE MEASURED ON ALL NINE HEROES.**
0.70 → 0.36 → 0 under the copy, over a flat that came DOWN from 0.62 to 0.44. Result: **gold h1
3.81–4.39, white h1 7.1–8.6, lede 4.59–5.26, nav 4.87–5.76**, worst cases commercial and bathrooms.
⭐ **The photographs are lighter than they have ever been here** — this replaced a 0.95 → 0.5 ramp —
which closes the "the veil dims all eight photographs" note that had been reported four times.
⛔ **Re-measure across all nine before moving any of the five.** A veil tuned on one is tuned on none.

⚠️ **THE LEAF PAGES HAVE NO MOBILE NAVIGATION AT ALL** — no burger, and `nav.top` is hidden below
960px — so the bar keeps its gold quote pill at every width, which is the pairing D235 disliked on
the landing page. **Told him. His call, one line either way, and the real fix is a burger.**

---

## 4. ⛔⛔ A CURVED EDGE IS A CUT, NOT A LINE (D264)

Client, with a screenshot: *"there's still a black corner attached to it… it's not just a rectangle
with a curve line on it."*

⭐ **THE ARCS ARE BORDERS ON ROUNDED BOXES, SO THEY ONLY EVER DREW A LINE.** The layers that
actually paint — `header.bar::before` (the glass) and `.page-head::before` (the photograph) — were
plain rectangles at `inset:0`. Both are cut to the same box and the same variables as their own arc
now, so the phone's 18/5 and the tablet's 26/7 follow without a second rule.

| Element | Instrument | Why |
|---|---|---|
| `header.bar::before`, `.page-head::before` | `border-radius` | A radius clips the `backdrop-filter` region too, in every engine. **`clip-path` + `backdrop-filter` is what Safari drops half of.** |
| `.hero-bg`, `.svc-hero-bg` | `clip-path` **plus** radius + `overflow` + `translateZ(0)` | They must cut a CHILD, which a bare radius does not do — and a promoted child composites after the parent's clip is rasterised |

⭐ **TEST IT THE WAY HE DESCRIBED IT:** paint everything behind white, paint the layer red, magnify
5×, screenshot. That is how all four were proved.

---

## 5. ⛔ THREE DEVICE BANDS — THE DESKTOP IS STILL THE ONE IN SCOPE

```
   ≤ 720px          721 – 1120px          ≥ 1121px
   the phone   ·   the tablet        ·   the desktop
   FROZEN          FROZEN                HE IS WORKING HERE
```

⚠️ **THIS ROUND CROSSED THE BANDS CONSTANTLY AND ALL OF IT WAS ASKED FOR** — the bubbles, the nav,
the hero, the curves, the marquee and the footer are shared components and he named "all
platforms" twice. ⛔ It does not generalise; the next phone-only change needs its own instruction.
⭐⭐ **THE MECHANISM GOES TO BASE SCOPE AND ONLY THE NUMBERS LIVE IN THE BAND BLOCKS.**
⛔ **THE TABLET-ONLY BLOCK IS THE LAST THING IN THE STYLESHEET.** Search `THE TABLET BAND`.
⚠️ Base scope IS the desktop — **check what the frozen bands were silently inheriting before you
touch a base rule** (§1: it cost 1.5px of nav height and was caught by measuring).

### ⚠️ TWO BOUNDARIES THAT ARE NOT THE ONES YOU EXPECT

- ⛔ **THE TILE SCRIM'S QUERY IS `max-width:600px`, NOT THE SITE'S 720px PHONE BAND.**
- ⚠️ **THE 13 Aug "FULL BRIGHTNESS" FIX ONLY EVER APPLIED BELOW 600px.** The tablet's tiles still
  carry `.face.front .stone{opacity:0.5}`. **Told him; his call, and it is one line.**

---

## 6. ⭐⭐ EVERYTHING IS PUSHED — AND STOP ASKING HIM

⛔⛔ **DO NOT ASK HIS PERMISSION TO PUSH, OR TO DO ANYTHING ELSE HE HAS ALREADY ASKED FOR.**
*"Why do you keep asking my fucking permission for stuff? I have it on bypass permissions."*

Branch **`tablet-round-d197-d200`**, working tree clean, **level with the remote**.

| Commit | What |
|---|---|
| `b3a03df` | D267/D268 "Message", and the footer's WhatsApp number placed |
| `40abf08` | D265/D266 in the register, and the probe's new baseline |
| `573f0e5` | D265 the mark cropped off the shirt, D266 the marquee deleted |
| `33b7d79` | D259–D264 in the register, with the two rejections kept |
| `6140ada` | D263 the internal pages, D264 the curves cut |
| `f0c66d4` | D259–D262 the hero centred, the gold marks, the reply line, the FAQ |

⛔ **`gh` IS NOT INSTALLED**, so the PR cannot be opened from here: `brew install gh` once, or
https://github.com/ThadGC/topcatwork/pull/new/tablet-round-d197-d200

---

## 7. ⭐ THE LINK, AND THE HOST QUESTION HE HAS STILL NOT ANSWERED

```bash
cd "Website Demo" && nohup caffeinate -ims node dev-server.js > /tmp/topcat-server.log 2>&1 &
```

**Give him `http://192.168.1.102:5501`** — re-check with `ipconfig getifaddr en0`.
⭐ **THE SERVER IS DETACHED ON PURPOSE — PID 5158, untouched for seven days.**
⛔ Do not `preview_stop` it and do not kill it to restart.
⭐ **USE `http://localhost:5501` IN THE PREVIEW PANE**, on his instruction.

### ⚠️ HE REVIEWS ON `thadeusg3.sg-host.com`

**We still do not know how files get there. Asked seven times.** ⚠️ **He has said a DEVELOPER
uploads the build**, which is the first real answer — but not the mechanism. ⛔ Until it is
answered, anything built may be invisible to him and he will report bugs already fixed.

---

## 8. ⛔ THE GATES — RUN THESE

```bash
cd "Website Demo/stones" && python3 harvest/verify.py          # 132/132/132 ✅
cd "Website Demo" && python3 build_pages.py                     # after ANY index.html change
cd "Website Demo/services" && python3 build_services.py         # after a service page change
cd "Website Demo" && python3 build_seo_pages.py                 # after a SERVICE_PAGES/APPLICATIONS change
cd "Website Demo/stones" && python3 build_stones.py             # after a stone page or stone.css change
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

⭐ **AND CHECK THE JS PARSES:**

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
| document height | **14731** ⚠️ was 14833 — D266 removed the brand marquee |
| elements | **2664** ⚠️ was 2692 — D260 added 4, D266 removed 32 |
| `#svcNav` children | **8** |
| broken images | 0 |
| horizontal overflow | none |
| hero ink above / below | **191.26 / 191.27** |

⚠️ **MEASURE ON A FRESH LOAD AT THE TARGET WIDTH.** ⚠️ **FILTER BROKEN IMAGES ON
`i.src && i.complete && i.naturalWidth===0`** — `#pmShot` is an `<img>` with no `src` at all, and
lazy images below the fold are simply not loaded yet.
⚠️ **THE ONLY CONSOLE ERROR ON THE PAGE IS `/favicon.ico` 404** (open item 14). Anything else is new.

---

## 9. ⚠️ THE IMAGE PIPELINE IS HAND-DRIVEN, AND GENERATION IS CAPPED AT 2 CREDITS

⛔⛔ **`build_images.py` AND `patch_images.py` ARE BOTH ONE-SHOT AND CAN NO LONGER RUN.**

⭐ **THE ROUTE FOR THE NEXT PHOTOGRAPH:**

1. ⛔ **LOOK ON DISK FIRST** — `assets/projects/` (107), `assets/slabs/` (264), `assets/site/`.
2. ⭐ **AND ASK WHETHER A CROP ANSWERS IT** — D265 removed a badly-reading logo from a photograph
   for nothing by cutting at x=1780. **He suggested the crop himself.**
3. Crop with the target boxes measured first — **every slot is at least two different shapes**.
4. Cut rungs with the pipeline's own rules: **LANCZOS, WebP q85, method 6**, clamped to the native
   width. ⛔ **Never upscale to make a table look tidy.**
5. ⛔ **A NEW PREFIX, NOT NEW BYTES UNDER THE OLD ONE.** One prefix means one picture (D241), the
   old ladder stays on disk, and the URL change is its own cache-bust on his phone.
6. Register the ladder by hand in **`SS`**, keyed on the exact `.img` URL the record carries.
7. `build_pages.py`, then the gates.

⛔⛔⛔ **IF YOU GENERATE: 2 CREDITS MAXIMUM PER IMAGE, HIS EXPLICIT CEILING. CHECK `balance` BEFORE
AND AFTER THE FIRST ONE AND STOP IF IT DOES NOT MATCH.** `get_cost` is not a price — it was wrong
by a hundred times on 15 Aug, and that round cost **101.46 credits**. ⚠️ **The charge settles late:
wait, re-read, then quote a figure to anybody.**

---

## 10. ⭐ WHERE THINGS STAND

| Page | State |
|---|---|
| **`/`** | ⭐⭐ hero centred on its ink, four bubbles with gold marks, **no brand marquee**, the message box says "Message", the footer's WhatsApp number sits with the other two routes |
| **`/services/*.html`** | ⭐⭐ NINE leaf pages on the landing page's nav, hero and stone floor, FAQ in cards |
| **`/materials/` `/guides/` `/worktops/` `/sitemap.html`** | ⭐ the 26-page SEO layer, same treatment; the location heroes keep their postcodes and dialling code as extra bubbles |
| **`/stones/`** | 132 pages + collection + compare, same bar and floor; slab still aligned to the name (0.00px), compare closes with a chevron |
| **`/services/` `/projects/` `/estimate/` `/about/` `/contact/`** | the `.page-head` family; **/contact/ is now form → reviews → FAQ** |
| **`/trade/`** | eight sections ⚠️ its own CTA still shows hours and no WhatsApp |

⚠️ **THREE SHARED PHOTOGRAPHS ARE STILL LIVE AND MUST NOT BE DELETED**: `hero-kitchen.jpg`,
`kitchen-day.jpg`, `cta-slab.jpg`.

---

## 11. ⛔ RULES THAT MUST NOT BE BROKEN

1. ⛔ **Fabrication is IN-HOUSE (D202).** "Our experienced fabricators." It has flipped three times.
2. ⛔ **Never "laser" anything.** They template **by hand**.
3. ⛔ **The brand is "Topcat", one word.**
4. ⛔ **A stone's NAME and PHOTOGRAPH must match the supplier's own.**
5. ⛔ **Never state what we cannot guarantee, and never use an absolute.** ⭐ **A seam is always
   visible.**
6. ⛔ **Every measurement in millimetres.**
7. ⛔ **Never a bright or gold line across the TOP of a card or section.** ⚠️ A full 34% gold
   BORDER is fine and is the site's standard — **D250 found this broken on 176 pages, and D263
   found it again on every FAQ row.**
8. **No showroom of our own. Never show the review count. Value, not cheap.**
9. **Voice:** quietly confident master. British English, commas not em dashes, no exclamation marks.
   ⭐⭐ **NO AI SLOP** and **no jargon**.
10. ⛔ **The logo is the client's artwork, is never re-drawn, and is never generated. Set HEIGHT
    only.** ⚠️ **And a correct mark is not the same as a mark that works at 392px — D265 cropped
    one off a photograph rather than keep it.**
11. ⛔⛔ **A MARK IS NEVER PUT IN A CIRCLE, A RING, A DISC OR A PLATE.** D260, and the back arrow
    on 10 Aug: *"not a circle around it, not anything, just simple."*
12. ⛔ **ONE DEVICE AT A TIME. Only the client unfreezes a band.** ⭐ **The DESKTOP is in scope.**
    ⚠️ **But a DELETION he asked for is not band-scoped — §0.**
13. ⭐⭐ **THIS IS A DESIGN BUILD. NEVER RAISE THE MISSING FORM BACKEND AS A BLOCKER.**
14. ⛔⛔ **2 CREDITS MAXIMUM PER GENERATED IMAGE.** §9.

---

## 12. ⚠️⚠️ HOW TO MEASURE — THE PART THAT EARNED ITS PLACE

- ⛔⛔⛔ **PRINT THE COMPUTED VALUE BEFORE YOU CHANGE THE DECLARATION (D207).**
- ⛔⛔⛔ **AND LOOK AT IT AFTERWARDS.** A number that passes is not a picture that works.
- ⛔⛔⛔ **MEASURE INSIDE THE TEXT'S OWN `Range` RECT, NOT ACROSS THE BAND (D263).** The first
  measurement of the centred scrim said it made things WORSE, because it scanned the full width of
  each line's band — and a centred scrim is lightest exactly where the text is not.
- ⛔⛔ **MEASURE LAYOUT WITH LAYOUT PROPERTIES.** `getBoundingClientRect()` on anything carrying
  `.rise`, `.glow-card` or a 3D hinge lies. `offsetTop`/`offsetWidth` ignore transforms.
- ⛔⛔ **MEASURE THE DRAWN ARTWORK, NOT THE BOX**, on anything with `object-fit`.
- ⛔⛔ **CONTRAST IS MEASURED BY COMPOSITING, NOT BY LOOKING** — draw the image to a canvas at its
  real `cover` scale and offset, composite every veil layer in paint order, then take the
  brightest pixel inside the ink rect.
- ⛔ **BALANCED IS NOT THE SAME AS CORRECT (D262).** `build_pages.py` lifted a section whose
  closing tag was indented one level off, swallowed the whole section behind it, and passed its
  own open/close balance check. **/about/ and /contact/ shipped the enquiry card twice for weeks.**
  There is a second guard now.
- ⛔ **A GRID ITEM WITH NO `grid-area` IN A NAMED-AREAS GRID IS NOT PLACED, IT IS AUTO-PLACED
  (D268)** — into an implicit row, in column one, at half width. That is what "randomly placed in
  that corner" turned out to be.
- ⛔ **`img.currentSrc` LIES ONCE YOU HAVE BROWSED THE SITE.** A throwaway `?q=` probe is the only
  honest test of which rung a band actually takes.
- ⛔ **CONFIRM THE RUNNING DOCUMENT IS THE FILE YOU JUST WROTE** before believing a negative (D222).

### The environment traps (all still live)

- ⛔⛔⛔ **A STRAY `*/` SILENTLY DELETES THE NEXT CSS RULE.** The §8 gate catches it.
- ⛔⛔ **AND A LITERAL TAG INSIDE AN HTML COMMENT BREAKS `build_pages.py`'s BALANCE CHECK** — it
  counts substrings across the whole block, comments included (D262).
- ⛔⛔ **THE PANE FREEZES ANIMATIONS AT ZERO when `document.visibilityState === 'hidden'`**, and
  **a screenshot does not always wake it.** ⭐ **OPENING A NEW TAB DOES.**
- ⛔⛔ **THE PANE'S SCREENSHOT SOMETIMES LETTERBOXES THE PAGE INTO THE TOP-LEFT OF THE CANVAS** and
  sometimes fills it. **Work out the scale from a known element before trusting a coordinate**, and
  ⛔ **`scrollTo` needs `scrollBehavior:'auto'` set first** or `scrollY` reads 0 for a while.
- ⛔⛔ **`service.css` AND `stone.css` ARE NOT CONTENT-HASHED** — a reload can serve the previous
  edit, and this round rewrote `service.css` heavily. ⭐ `fetch(url,{cache:'reload'})` then reload.
  **Still open, and now more likely to bite him.**
- ⛔ **`javascript_tool` TIMES OUT AT 30s.** A long promise chain returns "Promise was collected".
- ⛔ **NO SVG RASTERISER ON THIS MACHINE** — no ImageMagick, no cairosvg, no rsvg, and `qlmanage`
  flattens and crops. ⭐ PIL is there and is what cropped D265.
- ⛔ **AN INVENTED DATA VALUE CAN BLANK THE WHOLE SITE.** Valid presets: calacatta, carrara, crema,
  emperador, eternal, fumo, goldveil, mist, nerogold, statuario.

---

## 13. OPEN — DO THESE NEXT

### ⭐⭐ Waiting on him

1. ⭐⭐ **HOW DO FILES GET TO `thadeusg3.sg-host.com`?** Asked seven times. **Get the mechanism.**
2. ⭐⭐ **WHAT IS THE CREDIT CEILING NOW?** Nothing was spent this round, so the question is still
   unanswered. **Ask before generating anything.**
3. ⭐⭐ **CLOSE THE CALACATTA GOLD LICENSING QUESTION** — it is on the landing page and in three
   galleries.
4. ⭐⭐ **THE LEAF PAGES HAVE NO MOBILE NAV.** Their bar keeps the gold quote pill at every width
   because it is the only control there, which is the duplicate-button pairing D235 disliked.
   **A burger and an overlay is the real answer; his call.**
5. ⭐⭐ **THE TABLET'S TILES ARE STILL AT HALF BRIGHTNESS** (§5). One line.
6. ⭐⭐ **TRADE TERMS.** Payment, minimum order, lead times, a dedicated contact. **His stated first
   priority.** ⚠️ **The trade page's own CTA still carries hours and no WhatsApp.**
7. ⭐⭐ **THE FIREPLACE SCOPE, WITH NICK.**
8. ⭐⭐ **ALI JAFFER AND KAV / UXBRIDGE** — two Drive folders that match no project.
9. ⭐ **THE 19 DRONE VIDEOS** in the Hornchurch and Rickmansworth folders.
10. ⭐ **CONFIRM THE SILICA / HSE SENTENCE** in his own words (D202).
11. ⭐ **KITCHEN ISLANDS** — not on his service list; page still live and still linked.
12. ⭐ **TRUSTPILOT** — recommended AGAINST putting 4.0 beside the Google 5.0. **He has not ruled.**
13. ⭐ **THE HORNCHURCH DUPLICATE** — `-g1` and `-g9` are the same nook. **His call.**

### ⭐ Ready to build

14. ⭐ **THE SITE HAS NO FAVICON AT ALL** — every browser requests `/favicon.ico` and gets a 404.
    It is the only console error on the page.
15. ⭐⭐ **CONTENT-HASH `service.css` AND `stone.css`** — §12, and `service.css` changed more this
    round than in any before it.
16. ⭐⭐ **THE TWO DIRECTOR PLATES ARE STILL EMPTY** (Nick, Rimsha) — the last placeholders in the
    About collage, and the only AI stand-in left beside them is `w3`, the slab being carried.
    ⛔ **He has said three times: generate nothing.**
17. ⭐ **`/services/kitchen-islands.html`** is the one leaf page still on a shared stock hero.
18. ⚠️ **THE GENERATED PAGES SHIP THEIR CODE COMMENTS TO VIEW-SOURCE**, including his own quotes.
19. ⚠️ **THE HORNCHURCH CARD PHOTO** shows a garden with what looks like a child on play equipment.
20. ⭐ **THE `<title>` STILL SAYS "London & the Home Counties"** — he changed the hero, not the
    title, and the title is a search asset.
21. ⚠️ **~166 LEAF PAGES' META DESCRIPTIONS STILL NAME FOUR COUNTIES**, not eight.
22. ⚠️ **THE SPLASHBACK PHOTOGRAPH'S SOCKETS ARE NOT UK PATTERN.**
23. ⭐ Pick a production host; brotli and long-lived cache headers.
24. ⚠️ **IS IT RIMSHA OR REMSHA?** A real person's name on a public page.
25. ⭐ **FACEBOOK, TIKTOK, YOUTUBE?** ⛔ Do not guess handles.
26. ⚠️ **`Next Stone Slabs` IS NOW NAMED IN ONE PLACE ONLY** — the quartz page's brand sentence.
    D266 took it off the landing page with the marquee. §2 rule 9 if that ever reverses.

**Still waiting on the client:** whether Quartzite becomes a fourth range, 20mm vs 30mm pricing,
brackets for vanity tops / fireplaces / tables, and the £3k vs £3,850 three-slab discrepancy.

---

## 14. ⭐ HOW THIS CLIENT WORKS

⛔⛔⛔ **DO NOT ARGUE YOURSELF OUT OF SOMETHING HE ASKED FOR, AND DO NOT HAND HIM THE DILEMMA
EITHER.** **A real constraint is a problem to solve, not a question to return.**

⛔⛔ **AND DO NOT ASK HIS PERMISSION.** Commit, push, report. See §6.

⭐⭐ **HE SENDS CORRECTIONS MID-TURN, OFTEN THREE OR FOUR DEEP.** This round had five, two of them
while a build was running. **Finish the one you are on, then take the next in his order** — and if
a later message reverses an earlier one, say so in the report rather than quietly dropping the first.

⭐⭐⭐ **HE REMEMBERS WHAT HE ASKED FOR WEEKS AGO.** *"I also asked you a long time ago to go and
remove the brands we work with carousel."* He was right; it had been done on the phone only.
**Before saying something is done, check whether it is done at every width.**

⚠️⚠️ **HE REVERSES HIMSELF FREELY AND FAST — AND THAT IS FINE. LOG IT.** ⛔ **Write the reversal
into §D WITH THE REASON THE OLD DECISION EXISTED.**

⭐⭐ **HE CORRECTS THE DIAGNOSIS, NOT JUST THE DESIGN, AND HE IS USUALLY RIGHT.** *"Randomly placed
in that corner"* was grid auto-placement. *"Still a black corner attached to it"* was an unclipped
rectangle behind a border-drawn arc. **Take the complaint literally and go and measure the thing he
named.**

⚠️ **HE SWEARS WHEN SOMETHING LOOKS WRONG, AND THE COMPLAINT IS ALWAYS REAL.** Find it, name the
actual cause, fix it, say what it was.

⭐⭐ **WHEN YOUR OWN WORK CAUSED THE NEXT FAULT, SAY SO IN THE FIRST LINE.** He is fine with that
and not fine with spin.

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
| **`HANDOVER.md`** | ⭐ The single current state. §D is the register, **D1–D130 and D132–D268**. §2 the standing rules, §2a the supplier list. ⚠️ **THERE IS NO D131 ROW** |
| **`Website Demo/index.html`** | ⭐⭐ The whole landing design — inline `<style>` and `<script>`. Search `THE TABLET BAND`, `const SERVICES`, `const SS`, `--barH`, `chip-mk`, `hero-chips`, `foot-c-wa` |
| **`Website Demo/build_pages.py`** | ⭐⭐ Builds the seven internal pages and the shared assets. **Owns `/trade/index.html`.** ⚠️ Its `section()` has two guards now — read them before changing indentation in `index.html` |
| **`Website Demo/services/service.css`** | ⭐⭐⭐ **The shared sheet EVERY generated page links — 176 of them.** The bar, the hero, the floor, the FAQ cards and the bubbles all live here as of D263 |
| **`Website Demo/services/build_services.py`** | ⭐ The nine service leaf pages, `HERO_IMG`, and the `TC_DEFS` / `HERO_CHIPS` / scroll-listener originals |
| **`Website Demo/build_seo_pages.py`** | ⭐ The 26-page SEO layer, the sitemap, `APPLICATIONS`, `gold_last()` and `hero_chips()` |
| **`Website Demo/stones/build_stones.py`** | Builds the collection, compare.html and 132 stone pages |
| ⛔ **`Website Demo/trade/build_trade.py`** | ⛔⛔ **SUPERSEDED — DO NOT RUN** |
| ⛔ **`build_images.py` `patch_images.py`** | ⛔⛔ **ONE-SHOT, CANNOT RUN AGAIN** — see §9 |
| `Website Demo/assets/site.css` `site.js` | ⛔ **GENERATED. Never edit.** |
| **`Website Demo/assets/site/`** | ⭐ The service photographs and their ladders, `plate-stone-700.webp`, and `process-consult-shake-*` (D265) |
| **`Website Demo/assets/slabs/`** | ⭐ **264 slab photographs — the first place to look** |
| **`Website Demo/assets/projects/`** | ⭐ **107 WebP files — the client's real portfolio** |
| **`Website Demo/assets/brand/`** | ⭐ The client's own artwork. ⛔ **Never re-drawn, never generated** |
| `Website Demo/stones/harvest/verify.py` | ⭐ The nine-check gate |
| `Docs/topcat-worktops-SEO-LOG.md` | Every URL, title, target query and SEO change |
| `HANDOVER-2026-08-15-brand-plate-round-start-here.md` | ⭐ **The START HERE this file replaces** (D246–D258) |
| `HANDOVER-archive-to-2026-08-06.md` | ⚠️ **Every design the client rejected, in his words.** Read before redesigning anything |

⚠️ **Section numbers in `HANDOVER.md` are referenced from code comments** (`§3`, `§4`, `§5a`, `§6.7`,
`§7.5` are live in `index.html`). **Do not renumber.**
