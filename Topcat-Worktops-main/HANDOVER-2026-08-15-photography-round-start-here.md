# START HERE — 15 August 2026, after the PHOTOGRAPHY ROUND (D241–D245)

Read this, then `HANDOVER.md` **§D** (the register, newest first — this round is **D241–D245**) and
**§2** (the standing rules). That is about twenty minutes and it is enough to work safely.

> ⚠️ **This replaces the previous version of this same file**, which covered the desktop hero
> round (D236–D240) and is now `HANDOVER-2026-08-15-desktop-hero-round-start-here.md`.
> Everything in it that still matters is carried below.

---

## 0. ⛔⛔⛔ THE ONE THING TO TAKE FROM THIS ROUND

**⭐⭐⭐ HE SENT EIGHT PHOTOGRAPHS IN ONE SITTING, ONE MESSAGE PER SERVICE, AND EVERY TILE ON THE
SITE IS HIS OWN WORK NOW.** Then he looked at the result and found what the photographs had broken.

| He sent | It closed |
|---|---|
| dining, bathrooms, outdoor, fireplace, vanity, commercial, splashbacks, kitchen | the **three** "PHOTO TO COME" plates, the **three** wrong subjects, and the last **two** July stock images |

⭐⭐ **THE LESSON IS THE SECOND HALF, NOT THE FIRST: A CONTRAST DECISION IS ONLY VALID FOR THE
PICTURE IT WAS MEASURED AGAINST.** The tile scrims were tuned on 13 Aug against a set where most
images were dark. His are pale stone — a white marble vanity, a Carrara fireplace, a quartz
peninsula — and pale stone lands exactly where the service name sits. **Measured: the phone went to
1.76:1, with seven of eight tiles under the 4.5 bar.** Nothing errored, nothing moved, the type just
went soft. ⛔ **Change a photograph and re-measure the type over it, every time.**

### ⛔⛔ AND FOUR MEASUREMENT TRAPS THAT EACH COST TIME

- ⛔⛔⛔ **`img.currentSrc` LIES ONCE YOU HAVE BROWSED THE SITE.** A card reported the 2400px rung,
  which would have meant the whole ladder was decorative — but Chrome prefers a candidate it has
  ALREADY downloaded, and a leaf hero had put a bigger file in the cache. **A throwaway probe page
  with `?q=` on every candidate is the only honest test.** It showed 880 at both phone and desktop.
- ⛔⛔ **`minmax(0,1fr)` STILL RESOLVES TO MAX-CONTENT WHEN THE PARENT ROW IS AUTO-SIZED.** Setting
  the minimum to zero is not enough. The About collage reported 1019px, beat the copy's 761, and
  **grew the section from 844 to 1101**. Put the images out of flow.
- ⛔⛔ **A NEW `<img>` INHERITS THE RULE WRITTEN FOR THE PHOTOGRAPH BESIDE IT.** `.wy-p img` is
  `inset:0;width:100%;height:100%` and out-specifies a lone class, so the client's logo shipped
  **stretched to 181x251 against its own 528x495** — and looked entirely plausible in a screenshot.
  ⭐ **Compare the RENDERED ratio to the INTRINSIC one.** Rule 14 cannot be checked by eye.
- ⛔ **`getBoundingClientRect()` ON ANYTHING CARRYING `.rise` LIES BY THE REVEAL'S OFFSET.** It said
  the helix top missed the title by 34px; `offsetTop` said 23 = 23. This is D221/D230 and it caught
  me twice this round.

---

## 1. ⭐⭐ THE EIGHT SERVICE TILES AS THEY NOW STAND

Every one is the client's own file. **Seven arrived on 15 Aug; nothing here is stock any more.**

| Tile | Crop of his original |
|---|---|
| Kitchen Worktops | `(1914,1969)–(6330,4912)` of 7360x4912 |
| Splashbacks | `(0,0)–(1620,1080)` of 1920x1080 |
| Bathrooms | `(331,1398)–(5601,4912)` |
| Outdoor Spaces | `(3496,1288)–(7360,3654)` |
| Fireplaces | `(1450,880)–(3000,1913)` of **3000x2000** |
| Dining Tables | `(2639,1472)–(7275,4563)` |
| Vanity Tops | `(737,4301)–(4731,6963)` of a **5464x8192 PORTRAIT** |
| Commercial | `(3974,1398)–(7360,3654)` |

- ⭐⭐⭐ **THE CROP IS THE JOB, AND IT IS DECIDED BY THREE BOXES.** Each file is centre-cropped by
  the card grid at **1.52:1**, the leaf hero at **2.69:1** and that hero on a phone at **0.73:1** —
  so a desktop hero shows the middle **55.8%** of the file's HEIGHT and a phone hero the middle
  **48.4%** of its WIDTH. ⛔ **A subject sitting off-centre survives none of them**, and it was
  off-centre in every frame he sent. All eight are cut to 1.5:1 with the subject on the centre.
- ⭐⭐ **SIMULATE THE HERO VEIL OFFLINE BEFORE WRITING A FILE.** `.svc-hero-bg::after` is two
  gradients compositing to **0.61–0.96**. Compositing candidate crops under that arithmetic is what
  caught the dining crop cutting the lily heads off, and it rejected a tighter fireplace crop whose
  hero band was a flat panel of marble with no shape in it.
- ⭐ **THE CROP ALSO DID FOUR JOBS BEYOND FRAMING**, and each is a reason: a **television** out of
  the fireplace shot, a **red wall sign and a shelf of ornaments** out of the kitchen, **Cyrillic
  shopfront lettering** out of the commercial one — and the **sockets kept** in the splashback,
  because that tile's copy says "cut around sockets and hobs".
- ⛔ **HEROES TAKE THE 1600 RUNG, NOT 2400.** A CSS background has no `srcset`, so the builder's
  choice is what a phone downloads; under that veil the extra pixels are invisible. Two sources are
  small, so their ladders clamp at **1550** and **1620** — no 2400, an upscale adds bytes and no
  detail.
- ⛔⛔ **TWO PREFIXES ARE DELIBERATELY NOT THE OBVIOUS ONES: `service-splash-marble` AND
  `service-worktops-quartz`.** `service-splashbacks-706` and `service-worktops-554` are the DIFFERENT
  July photographs they replaced. Two pictures sharing a rung prefix is an `SS` table waiting to be
  mis-read. Both old pairs stay on disk.
- ⭐ **`phImg()` STAYS AND IS NOT DEAD CODE** — D206 shipped `src="undefined"` the day a service
  arrived without a photograph. A ninth service gets a plate, not a blank.

---

## 2. ⭐ WHAT ELSE MOVED THIS ROUND

| # | Thing |
|---|---|
| **D242** | Tile names legible again: **phone 1.76 → 6.32:1**, **desktop 3.87 → 5.72** (front card **8.07**). Tablet measured at **8.39** and left alone. |
| **D243** | The helix arrows are the "Call us" block — 129.79 x 50.75, centred on the helix and on its line, all to **0.00px**. |
| **D244** | The About collage runs the full height of the copy, bottom edge **0px** from the Chat button, plus a fourth work tile. |
| **D245** | The vertical lockup on the Why feature shot, height only, ratio held to 1.0658 vs 1.0667. |

- ⭐⭐ **D242's FIX NEEDED BOTH HALVES AND THAT WAS MEASURED FIRST.** Moving the name down 12px with
  the scrim untouched reaches only **3.85**; deepening the scrim alone reaches **3.30**; together
  **6.32**. ⛔ **The transparent window stayed 47%→76% to the character** — that is the client's
  "full brightness" ruling and deepening the middle is the move that would quietly undo it.
- ⭐⭐ **THE DESKTOP NEEDED THE OPPOSITE FIX.** Its name floats at **23–57%** of the card because
  `.hx-meta` also holds the button, which keeps its space on every card. **So a nudge down moves
  nothing and deepening the FOOT moves almost nothing: 3.85 → 3.95.** The gain is all in the 20–60%
  band where the glyphs are.
- ⛔⛔⛔ **D243's FOOT IS SET FROM SCRIPT BECAUSE NO CSS VALUE CAN DO IT.** The columns are a stretch
  row in a `min-height:100vh` frame, so the row follows the WINDOW while the copy's height is
  intrinsic: **the gap below the CTA pair is 6.5px at 863 tall and 48.8px at 900.** Recomputed from
  a fresh read on every resize, never accumulated — D236's rule — and it runs BEFORE `metrics()`.

---

## 3. ⛔ THREE DEVICE BANDS — AND THE DESKTOP IS STILL THE ONE IN SCOPE

```
   ≤ 720px          721 – 1120px          ≥ 1121px
   the phone   ·   the tablet        ·   the desktop
   FROZEN          FROZEN                HE IS WORKING HERE
```

⚠️ **HE CROSSED THE FREEZE HIMSELF FOR D242** — *"on desktop mobile and tablet"* — and that was
built as asked. ⛔ It does not generalise; the next mobile change needs its own instruction.
⭐⭐ **THE MECHANISM GOES TO BASE SCOPE AND ONLY THE NUMBERS LIVE IN THE BAND BLOCKS.**
⛔ **THE TABLET-ONLY BLOCK IS THE LAST THING IN THE STYLESHEET.** Search `THE TABLET BAND`.
⚠️ Base scope IS the desktop — **check what the frozen bands were silently inheriting before you
touch a base rule.** D244 and D245 both needed a `display:none` at base so a new element could not
land on a frozen band.

### ⚠️⚠️ TWO BOUNDARIES THAT ARE NOT THE ONES YOU EXPECT

- ⛔ **THE TILE SCRIM'S QUERY IS `max-width:600px`, NOT THE SITE'S 720px PHONE BAND.** 601–720 falls
  through to the base rules with the tablet. **The two numbers should agree eventually.**
- ⚠️ **THE 13 Aug "FULL BRIGHTNESS" FIX ONLY EVER APPLIED BELOW 600px.** The tablet's tiles still
  carry `.face.front .stone{opacity:0.5}` — the photograph at HALF strength over near-black, which
  is exactly the "dark radiant" he rejected on the phone. **It is why the tablet reads so well, and
  it is a look he has not seen. Told him; his call, and it is one line.**

---

## 4. ⭐⭐ EVERYTHING IS PUSHED — AND STOP ASKING HIM

⛔⛔ **DO NOT ASK HIS PERMISSION TO PUSH, OR TO DO ANYTHING ELSE HE HAS ALREADY ASKED FOR.**
*"Why do you keep asking my fucking permission for stuff? I have it on bypass permissions."*
**Do the work, commit it, push it, and report what was done.**

Branch **`tablet-round-d197-d200`**, working tree clean, **level with the remote**.

| Commit | What |
|---|---|
| `601be39` | D245 the vertical lockup on the Why feature shot |
| `1866f37` | D244 the About collage runs the full height of the copy |
| `9f78861` | D243 the helix arrows become the Call us block |
| `7e209b3` | D242 the service names read clearly on every band |
| `23d691f` | D241 all eight service tiles are his own photographs |
| `efad6f2` | D241 the first three tiles and their heroes |

⛔ **`gh` IS NOT INSTALLED**, so the PR cannot be opened from here: `brew install gh` once, or
https://github.com/ThadGC/topcatwork/pull/new/tablet-round-d197-d200

---

## 5. ⭐ THE LINK, AND THE HOST QUESTION HE HAS STILL NOT ANSWERED

```bash
cd "Website Demo" && nohup caffeinate -ims node dev-server.js > /tmp/topcat-server.log 2>&1 &
```

**Give him `http://192.168.1.102:5501`** — re-check with `ipconfig getifaddr en0`.
⭐ **THE SERVER IS DETACHED ON PURPOSE — PID 5158, untouched for five days.**
⛔ Do not `preview_stop` it and do not kill it to restart.
⭐ **USE `http://localhost:5501` IN THE PREVIEW PANE**, on his instruction: *"Stop asking to access
the link or something. Just look at the local host in the preview."*

### ⚠️ HE REVIEWS ON `thadeusg3.sg-host.com`

**We still do not know how files get there. Asked six times.** ⛔ Until it is answered, anything
built may be invisible to him and he will report bugs already fixed.

---

## 6. ⛔ THE GATES — RUN THESE

```bash
cd "Website Demo/stones" && python3 harvest/verify.py          # 132/132/132 ✅
cd "Website Demo" && python3 build_pages.py                     # after ANY index.html change
cd "Website Demo/services" && python3 build_services.py         # after a service page change
cd "Website Demo" && python3 build_seo_pages.py                 # after a SERVICE_PAGES/APPLICATIONS change
```

⛔⛔ **NEVER RUN `Website Demo/trade/build_trade.py`.** It is superseded and would revert the trade
page to 1 August (D233). It is marked at the top of the file.

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
| document height | **14833** |
| elements | **2692** ⚠️ was 2687 — D244's tile is 4 nodes, D245's logo is 1 |
| `#svcNav` children | **8** |
| broken images | 0 |
| horizontal overflow | none |

⚠️ **MEASURE ON A FRESH LOAD AT THE TARGET WIDTH.** Resizing from a phone preset to 1440 without
reloading leaves `.gal-scroll` at its static height and looks like a regression that is not there.
⚠️ **FILTER BROKEN IMAGES ON `i.src && …`** — `#pmShot` is an `<img>` with no `src` at all.

---

## 7. ⚠️ THE IMAGE PIPELINE IS HAND-DRIVEN NOW, AND THAT IS NOT A CHOICE

⛔⛔ **`build_images.py` AND `patch_images.py` ARE BOTH ONE-SHOT AND CAN NO LONGER RUN.** The first
extracts seven base64 photographs out of `index.html` and exits if it does not find exactly seven;
the second already took them out in D109. **Do not run either to "regenerate" a ladder.**

⭐ **THE ROUTE FOR THE NEXT PHOTOGRAPH**, which D241 walked eight times:

1. Crop to **1.5:1** with the subject centred — check it against all three boxes (§1).
2. Cut rungs with the pipeline's own rules: **LANCZOS, WebP q85, method 6**, clamped to the native
   width. Save a `.jpg` master beside them.
3. Register the ladder by hand in **`SS`**, keyed on the exact `.img` URL the record carries.
4. Point the tile's `img` at the **top** rung and the leaf hero at the **1600** one.
5. `build_pages.py`, then `services/build_services.py`, then the gates.

⛔ **QUALITY IS 85 FOR EVERYTHING** — the level `build_images.py` verified by eye. It was NOT
lowered for the expensive outdoor file, because a per-image quality is a second rule nobody finds.

---

## 8. ⭐ WHERE THINGS STAND

| Page | State |
|---|---|
| **`/`** | ⭐⭐ **all eight tiles his own photographs, names legible on every band, helix arrows on the Call us line, About collage full height, lockup on the Why shot** |
| **`/services/`** | NINE leaf pages — eight open on his own photograph, kitchen-islands still on `kitchen-day.jpg` |
| **`/trade/`** | eight sections, "Trade with Topcat", no trade terms anywhere |
| **`/projects/`** | three duplicates out, Topcat plates close three blocks |
| **`/estimate/` `/about/` `/contact/`** | as before |
| **`/stones/`** | the collection page |
| `/materials/` `/guides/` `/worktops/` `/sitemap.html` | the SEO layer |

⚠️ **THREE SHARED PHOTOGRAPHS ARE STILL LIVE AND MUST NOT BE DELETED**: `hero-kitchen.jpg` is the
LANDING PAGE's hero, `kitchen-day.jpg` is `/services/kitchen-islands.html`, `cta-slab.jpg` is the
landing page's CTA band. What ended is three service pages sharing two pictures between them.

---

## 9. ⛔ RULES THAT MUST NOT BE BROKEN

1. ⛔ **Fabrication is IN-HOUSE (D202).** "Our experienced fabricators." It has flipped three times.
2. ⛔ **Never "laser" anything.** They template **by hand**.
3. ⛔ **The brand is "Topcat", one word.**
4. ⛔ **A stone's NAME and PHOTOGRAPH must match the supplier's own.**
5. ⛔ **Never state what we cannot guarantee, and never use an absolute.** ⭐ **A seam is always
   visible.**
6. ⛔ **Every measurement in millimetres.**
7. ⛔ **Never a bright or gold line across the TOP of a card or section**, anywhere. ⚠️ A full 34%
   gold BORDER is fine and is the site's standard — that is the rim, not a top band.
8. **No showroom of our own. Never show the review count. Value, not cheap.**
9. **Voice:** quietly confident master. British English, commas not em dashes, no exclamation marks.
   ⭐⭐ **NO AI SLOP** and **no jargon**.
10. ⛔ **The logo is the client's artwork and is never re-drawn. Set HEIGHT only.** ⚠️ **D245 is the
    newest place this applies, and it is the one that nearly shipped broken** — see §0.
11. ⛔ **ONE DEVICE AT A TIME. Only the client unfreezes a band.** ⭐ **The DESKTOP is in scope.**
12. ⭐⭐ **THIS IS A DESIGN BUILD. NEVER RAISE THE MISSING FORM BACKEND AS A BLOCKER.**

---

## 10. ⚠️⚠️ HOW TO MEASURE — THE PART THAT EARNED ITS PLACE

- ⛔⛔⛔ **PRINT THE COMPUTED VALUE BEFORE YOU CHANGE THE DECLARATION (D207).** A rule can be parsed,
  present, and matching nothing.
- ⛔⛔ **AND CHECK WHAT YOUR TEST ACTUALLY MEASURES.** See §0 — a cached `currentSrc`, an `fr` track
  that resolves to max-content, an inherited `img` rule, and a rect that carries a reveal.
- ⛔⛔ **CONTRAST IS MEASURED BY COMPOSITING, NOT BY LOOKING.** Draw the photograph to a canvas with
  its own CSS `filter`, composite it under the element's own computed gradient stops at the type's
  real band, and take the BRIGHTEST pixel. That is how D242 got 1.76:1 and how the fix was chosen
  before a line was written.
- ⛔⛔ **MEASURE LAYOUT WITH LAYOUT PROPERTIES.** `getBoundingClientRect()` on an element carrying
  `.rise` includes the reveal's `translateY`. **`offsetTop` ignores transforms** (D221, D230, D243).
- ⛔ **DEEPENING A VEIL TO WIN CONTRAST IS THE MOVE D217 ALREADY TRIED AND REVERTED.** Shade the
  words, or scrim only where they are.
- ⛔ **A `.click()` IN A PROBE DOES NOT HIT-TEST.** Use `elementFromPoint` (D212).
- ⛔ **CONFIRM THE RUNNING DOCUMENT IS THE FILE YOU JUST WROTE** before believing a negative (D222).

### The environment traps (all still live)

- ⛔⛔⛔ **A STRAY `*/` SILENTLY DELETES THE NEXT CSS RULE.** The §6 gate catches it.
- ⛔⛔ **THE PANE FREEZES ANIMATIONS AT ZERO when `document.visibilityState === 'hidden'`.** A
  screenshot wakes it — **often a SECOND screenshot is needed**, and the helix and both collages all
  measure as nonsense until they have run.
- ⛔⛔ **THE PANE SILENTLY RESIZES ITSELF.** **Read `innerWidth` in the same call as your
  measurements**, and judge desktop visually at **1141–1200**.
- ⚠️ **THE PANE'S SCREENSHOT SOMETIMES STOPS TRACKING A SCRIPTED `scrollTo`.** Scroll with the
  `computer` tool instead, or accept the DOM probe as the evidence and say so.
- ⛔ **CONSOLE ERRORS FROM `javascript_tool` ARE YOUR OWN PROBE WRAPPERS, NOT THE PAGE.** **Open a
  new tab before believing a console error.**
- ⛔⛔ **`service.css` AND `stone.css` ARE NOT CONTENT-HASHED** — a reload can serve the previous
  edit. **Still open.**
- ⛔ **`scroll-behavior:smooth` IS ON `<html>`** — every probe `scrollTo` animates unless
  `behavior:'instant'`.
- ⛔ **`javascript_tool` TIMES OUT AT 30s**, and a `location.reload()` inside it kills the call.
  ⚠️ A promise chain that runs too long returns **"Promise was collected"** — split it into calls.
- ⛔ **AN INVENTED DATA VALUE CAN BLANK THE WHOLE SITE.** Valid presets: calacatta, carrara, crema,
  emperador, eternal, fumo, goldveil, mist, nerogold, statuario.
- ⛔ **THE RANGE IS ALPHABETICAL EVERYWHERE (D85). NO DARK STONE ON THE FIRST SCREEN (D86).**

---

## 11. OPEN — DO THESE NEXT

### ⭐⭐ Waiting on him

1. ⭐⭐ **HOW DO FILES GET TO `thadeusg3.sg-host.com`?** Asked six times. **Nothing else matters if
   he cannot see the work.**
2. ⭐⭐ **THE TABLET'S TILES ARE STILL AT HALF BRIGHTNESS** — §3. His "full brightness" ruling never
   reached that band. One line, and it would then need the same scrim treatment the phone just got.
3. ⭐ **THE SERVICE HERO VEIL DIMS ALL EIGHT NEW PHOTOGRAPHS.** It composites to 0.61–0.96 and is
   shared by ~166 pages, so lightening it is a site-wide change he has not asked for. **Told him
   four times; it is one line in `service.css` when he wants it.**
4. ⭐ **THE HORNCHURCH DUPLICATE HE HAS NOT NAMED — `-g1` AND `-g9` ARE THE SAME NOOK.** Removed,
   measured and put back: it is the only portrait balancing that gallery's two landscapes. **His call.**
5. ⭐ **HARLOW'S PLATE WAS NOT ASKED FOR.** One field to delete.
6. ⭐⭐ **TRADE TERMS.** Payment, minimum order, lead times, a dedicated contact. **His stated first
   priority, and the trade FAQ currently deflects it.**
7. ⭐⭐ **THE FIREPLACE SCOPE, WITH NICK.** The page says Topcat do NOT install stoves, flues or gas
   appliances. If they take on more, the page is understating the service.
8. ⭐⭐ **ALI JAFFER AND KAV / UXBRIDGE** — two Drive folders that match no project.
9. ⭐ **THE 19 DRONE VIDEOS** in the Hornchurch and Rickmansworth folders.
10. ⭐ **CONFIRM THE SILICA / HSE SENTENCE** in his own words (D202). A health-and-safety claim.
11. ⭐ **KITCHEN ISLANDS** — not on his service list; page still live and still linked. Delete or keep?
12. ⭐ **TRUSTPILOT** — recommended AGAINST putting 4.0 beside the Google 5.0. **He has not ruled.**

### ⭐ Ready to build

13. ⭐⭐ **THE PHOTOGRAPHY GAP IS MUCH SMALLER NOW, AND WHAT IS LEFT IS PEOPLE.** ⛔ **He has said
    twice: generate nothing.**
    - **The two director portraits** (Nick, Rimsha) are still empty plates.
    - **The Why feature shot** and **three of the four About collage tiles** are AI stand-ins.
    - **`/services/kitchen-islands.html`** is the one leaf page still on a shared stock hero.
14. ⭐ **THE SITE HAS NO FAVICON AT ALL** — every browser requests `/favicon.ico` and gets a 404.
    ⚠️ `assets/brand/favicon.svg` exists and is referenced; the `.ico` is what is missing.
15. ⭐ **CONTENT-HASH `service.css` AND `stone.css`** — §10, and it will bite him on his phone.
16. ⚠️ **THE GENERATED PAGES SHIP THEIR CODE COMMENTS TO VIEW-SOURCE**, including his own quotes, on
    a public repo. Nothing is sensitive; stripping comments at build time is a small change.
17. ⚠️ **THE HORNCHURCH CARD PHOTO** shows a garden through bi-folds with what looks like a child on
    play equipment. **It is the third card in the gallery.**
18. ⭐ **THE `<title>` STILL SAYS "London & the Home Counties"** — he changed the hero, not the title,
    and the title is a search asset.
19. ⚠️ **~166 LEAF PAGES' META DESCRIPTIONS STILL NAME FOUR COUNTIES**, not eight. Deliberately left.
20. ⚠️ **THE SPLASHBACK PHOTOGRAPH'S SOCKETS ARE NOT UK PATTERN.** Not legible at card size, and the
    copy names sockets on purpose — but it is his page and he may want it swapped.

### The rest

21. ⭐ Pick a production host; brotli and long-lived cache headers.
22. ⭐ Close the licensing question on Caesarstone, CRL and Bloom. ⛔ Classic Quartz Stone is off
    limits. ⭐ **Calacatta Gold is UNRESOLVED.**
23. ⚠️ **IS IT RIMSHA OR REMSHA?** A real person's name on a public page.
24. ⭐ **FACEBOOK, TIKTOK, YOUTUBE?** ⛔ Do not guess handles.

**Still waiting on the client:** whether Quartzite becomes a fourth range, 20mm vs 30mm pricing
(⚠️ the thickness toggle moves no number, which is correct until he rules), brackets for vanity tops
/ fireplaces / tables, and the £3k vs £3,850 three-slab discrepancy.

---

## 12. ⭐ HOW THIS CLIENT WORKS

⛔⛔⛔ **DO NOT ARGUE YOURSELF OUT OF SOMETHING HE ASKED FOR, AND DO NOT HAND HIM THE DILEMMA
EITHER.** **A real constraint is a problem to solve, not a question to return. If he names a thing,
build the thing.**

⛔⛔ **AND DO NOT ASK HIS PERMISSION.** Commit, push, report. See §4.

⛔⛔ **DO THE THING HE ASKED FOR, IN THE MESSAGE HE ASKED FOR IT.** ⭐⭐ **THIS ROUND HE SENT SEVEN
MID-TURN MESSAGES IN A ROW, ONE SERVICE AT A TIME, WHILE THE FIRST WAS STILL BEING BUILT.** Do them
in his order and finish each one.

⚠️⚠️ **HE REVERSES HIMSELF FREELY AND FAST — AND THAT IS FINE. LOG IT.** ⛔ **Write the reversal into
§D WITH THE REASON THE OLD DECISION EXISTED.**

⭐⭐ **WHEN SOMETHING IS DIFFERENT FROM WHAT HE ASKED, SAY SO PLAINLY IN THE REPORT.** ⚠️ **And when
your own work causes the next fault, say that too** — D242 exists because D241 broke it, and the
report said so in the first line.

⚠️ **HE CORRECTS THE DIAGNOSIS, NOT JUST THE DESIGN, AND HE IS USUALLY RIGHT.** *"In mobile, it just
looks a bit hard to read"* was 1.76:1.

⚠️ **HE SWEARS WHEN SOMETHING LOOKS WRONG, AND THE COMPLAINT IS ALWAYS REAL.** Find it, name the
actual cause, fix it, say what it was.

- **Walk the journey, do not check the page.**
- ⭐⭐ **LOOK AT THE RESULT BEFORE REPORTING IT DONE.** ⚠️ **And a screenshot is not enough for
  anything with a ratio in it** — D245 looked fine and was stretched.
- **Measure, then claim.** ⚠️ **And if you could not measure it, say so.**

---

## 13. BUDGET AND THE DOCUMENT SET

- **~82 credits** of the client's **100-credit ceiling** spent, about **18 left**. ⭐ **This round
  cost none** — every photograph was his own file, on his instruction.

| File | What it is |
|---|---|
| **`HANDOVER.md`** | ⭐ The single current state. §D is the register, **D1–D130 and D132–D245**. §2 the standing rules, §2a the supplier list. ⚠️ **THERE IS NO D131 ROW** |
| **`Website Demo/index.html`** | ⭐⭐ The whole design — inline `<style>` and `<script>`. Search `THE TABLET BAND`, `const SERVICES`, `const SS`, `about-collage`, `wy-p-mark`, `helix-ui`, `footToCallUs` |
| **`Website Demo/build_pages.py`** | ⭐⭐ Builds the seven internal pages and the shared assets. **Owns `/trade/index.html`.** ⚠️ Its markup markers search from `</style>` |
| **`Website Demo/services/build_services.py`** | ⭐ The nine service leaf pages and `HERO_IMG` |
| **`Website Demo/build_seo_pages.py`** | ⭐ The 26-page SEO layer, the sitemap, and `APPLICATIONS` on ~166 pages |
| ⛔ **`Website Demo/trade/build_trade.py`** | ⛔⛔ **SUPERSEDED — DO NOT RUN** |
| ⛔ **`build_images.py` `patch_images.py`** | ⛔⛔ **ONE-SHOT, CANNOT RUN AGAIN** — see §7 |
| `Website Demo/assets/site.css` `site.js` | ⛔ **GENERATED. Never edit.** |
| **`Website Demo/assets/site/`** | ⭐ **The eight service photographs and their ladders**, plus the shared stock. ⚠️ `service-worktops-554`, `service-splashbacks-706`, `service-islands-468` and `quarry` are superseded, unreferenced, and kept on purpose |
| **`Website Demo/assets/projects/`** | ⭐ **107 WebP files — the client's real portfolio.** ⚠️ Six are unused on purpose |
| **`Website Demo/assets/brand/`** | ⭐ The client's own artwork. `topcat-vertical.svg` is the project plate (D240) and the Why mark (D245) |
| `Website Demo/services/service.css` `stones/stone.css` | ⭐ Hand-maintained, shared by ~166 leaf pages. ⚠️ **NOT content-hashed** |
| `Website Demo/stones/build_stones.py` | Builds the collection, compare.html and 132 stone pages |
| `Website Demo/stones/harvest/verify.py` | ⭐ The nine-check gate |
| `Website Demo/dev-server.js` | Compression, caching, and the reload that keeps scroll position |
| `Docs/topcat-worktops-SEO-LOG.md` | Every URL, title, target query and SEO change |
| `HANDOVER-2026-08-15-desktop-hero-round-start-here.md` | ⭐ **The START HERE this file replaces** (D236–D240) |
| `HANDOVER-archive-to-2026-08-06.md` | ⚠️ **Every design the client rejected, in his words.** Read before redesigning anything |

⚠️ **Section numbers in `HANDOVER.md` are referenced from code comments** (`§3`, `§4`, `§5a`, `§6.7`,
`§7.5` are live in `index.html`). **Do not renumber.**
