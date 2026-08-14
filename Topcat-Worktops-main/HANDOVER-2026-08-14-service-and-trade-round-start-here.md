# START HERE — 14 August 2026, after the SERVICE PAGES AND TRADE PAGE ROUND (D227–D235)

Read this, then `HANDOVER.md` **§D** (the register, newest first — this round is **D227–D235**) and
**§2** (the standing rules). That is about twenty minutes and it is enough to work safely.

> ⚠️ **This replaces the previous version of this same file**, which covered the Drive photography
> and broken-animation round (D214–D226) and is now
> `HANDOVER-2026-08-14-drive-photography-round-start-here.md`. Everything in it that still matters
> is carried below.

---

## 0. ⛔⛔⛔ THE ONE THING TO TAKE FROM THIS ROUND

**Nine decisions, and SIX of them were the same two faults wearing different clothes.**

### Fault A — an instruction that reached SOME device bands and not others. Four times.

| He asked | It shipped as | Found |
|---|---|---|
| D197 *"remove eyebrows from the title… for all the internal pages"* | a `max-width:720px` rule — phone only | **D229** |
| D174 *"remove the scroll arrow at the bottom of the hero section"* | a `max-width:1120px` rule — phone + tablet, desktop kept it | **D234** |
| D198 *"remove the get a quote inside the NavBar"* | tablet-only, plus a separate `≤430px` rule — **so it lived on between 431 and 720px** | **D235** |
| D226 the helix's yaw | corrected, and the spiral's own `360/N` left alone | **D227** |

⭐⭐⭐ **WHEN HE NAMES AN ELEMENT, CHECK EVERY BAND BEFORE CALLING IT DONE.** Run the check at 390,
900 and 1440, not at the width you happen to be looking at. He finds these by dragging a responsive
preview, and each one reads to him as "I already told you this".

### Fault B — code that was never doing anything, and looked fine on a read-through.

- ⛔⛔⛔ **D231: THE TRADE CARDS' CSS STYLED `.trade-card strong` AND `.trade-card span`.
  `trade_cards()` EMITS `<h3>` AND `<p>`.** Six declarations, none matching anything, since the day
  it was written. What shipped was the browser's defaults: heading and body the **same colour**,
  heading at **700 weight**, **0px** between them, 21 characters a line.
- ⛔⛔ **D227: `(d*360/N)` IS NOT AUTOMATICALLY CORRECT FOR EVERY `N`** — and D226's own comment said
  the spiral "genuinely does absorb any count", which is what stopped the last session testing it.
- ⛔⛔ **D233: `trade/build_trade.py` STILL WRITES `/trade/index.html` AND HAS BEEN SUPERSEDED SINCE
  D190.** Nothing imports it, nothing points at it, so nobody would notice — until someone runs it
  and silently reverts four rounds of work. **Now marked ⛔ DO NOT RUN at the top.**

⭐⭐ **THE RULE THAT CATCHES ALL OF THESE IS D207: PRINT THE COMPUTED VALUE BEFORE YOU CHANGE THE
DECLARATION.** Reading the block would have told you it was fine every single time.

---

## 1. ⭐⭐ THE SERVICE RANGE IS COMPLETE — NINE LEAF PAGES

Every one of his eight helix services now opens its own page (D228). **Three were written from
nothing this round**, and the H1s are the card names, not SEO titles (D229).

| Tile | Page | H1 |
|---|---|---|
| Kitchen Worktops | `kitchen-worktops.html` | Kitchen **Worktops** |
| Splashbacks | `splashbacks.html` | Splashbacks |
| Bathrooms | `bathroom-worktops.html` | Bathrooms |
| Outdoor Spaces | `outdoor-kitchens.html` | Outdoor **Spaces** |
| ⭐ Fireplaces | ⭐ **`fireplaces.html`** | Fireplaces |
| ⭐ Dining Tables | ⭐ **`dining-tables.html`** | Dining **Tables** |
| ⭐ Vanity Tops | ⭐ **`vanity-tops.html`** | Vanity **Tops** |
| Commercial | `commercial-worktops.html` | Commercial |
| *(not a tile)* | `kitchen-islands.html` | Kitchen **Islands** |

- ⛔⛔ **VANITY TOPS USED TO OPEN THE BATHROOM PAGE AND HE CAUGHT IT.** Fixed by **splitting the
  content, not redirecting**: `bathroom-worktops` **keeps its slug, URL and ranking** and now covers
  shower surrounds, thresholds, sills and bath panels; the basins moved to the new page.
  **Do not re-point that tile.**
- ⛔ **THE `<title>` AND `metadesc` STILL CARRY THE SEARCH PHRASES** ("outdoor kitchen worktops").
  Only the on-page heading is the card name. Do not "tidy" the titles to match.
- ⛔⛔ **THE FIREPLACE PAGE'S SCOPE PARAGRAPH IS THE POINT OF IT, NOT A HEDGE.** It says plainly that
  Topcat cut and fit the stone, do **not** install stoves, flues or gas appliances, and cut to the
  figures the customer's own installer gives. §2 rule 12, and nobody has said they take more on.
  ⚠️ **ONE FAQ IS LOAD-BEARING AND TRUE:** engineered quartz is resin-bound, so it suits a surround
  or a mantel rather than the hearth under an appliance. **Do not "simplify" that answer.**
- ⚠️ **A SERVICE PAGE LIVES IN SIX PLACES.** `services/build_services.py`, the `SERVICES` array in
  `index.html`, **both** nav menus, `SERVICE_PAGES` and `APPLICATIONS` in `build_seo_pages.py`, and
  `TRADE_SCOPE` in `build_pages.py`. A tenth service goes in all six.

---

## 2. ⭐⭐ THE TRADE PAGE WAS REBUILT ALMOST ENTIRELY (D230–D233)

He called it *"so incredibly important"* and *"absolutely terrible"* in the same round. It is now
**eight sections**: head, what you get, who we work with, ⭐ what you can specify, reviews, process,
⭐ trade questions, enquiry.

- **Title: "Trade with *Topcat*"** (D233). ⛔ *"One trade off your critical path"* is **dead** — it
  was jargon and it parsed as "one trade-off". **The phrase was in four places and all four changed.**
- **The intro is ONE centred paragraph** at 1000px against the cards' 1027px (D232). ⚠️ It has had
  three arrangements in one day; what he rejected was never the alignment, it was the **547px
  centred ribbon** that `.section-head`'s 52ch measure made of three paragraphs.
- **The cards are the home page's `.wy-r` language** — 14px radius, panel gradient, the same black
  marble veiled back — **with the GOLD rim** (`--hair`), not the Why tiles' soft one. ⭐ **Copying a
  component copies its exceptions too**; that is how the rim went missing for an hour.
- **Two sections were missing entirely**: the page linked to neither `/services/` nor `/stones/`, and
  answered none of a specifier's operational questions.
- ⛔⛔ **NO TRADE TERMS ANYWHERE ON IT.** Payment, minimum order and discount structure have never
  been supplied, so "what are your trade terms" is answered by pointing at the form. **This is the
  single most valuable thing he could send** — see §10.
- ⛔ **NO `FAQPage` SCHEMA.** Dead since 7 May 2026. The accordion is plain `<details>`/`<summary>`.

---

## 3. ⛔ THREE DEVICE BANDS — AND SEE §0, FAULT A

```
   ≤ 720px          721 – 1120px          ≥ 1121px
   the phone   ·   the tablet        ·   the desktop
```

⭐⭐ **"THE TABLET IS THE MOBILE BUILD, BIGGER" IS DONE BY WIDENING THE PHONE RULE'S OWN QUERY —
NEVER BY WRITING THE RULE AGAIN.**
⭐⭐ **AND THE OTHER HALF OF THAT, LEARNED FOUR TIMES THIS ROUND: WHEN A RULE MUST REACH A THIRD
BAND, LIFT THE MECHANISM TO BASE SCOPE AND LEAVE ONLY THE NUMBERS IN THE BLOCKS.** D235 did this for
the curved bottom edge — the nav bar and the hero each have **one** description now, with
`--navCurveR` 18/26/34 and `--curveR` 48 everywhere. Pasting it into a desktop block would have made
three.
⛔ **THE TABLET-ONLY BLOCK IS THE LAST THING IN THE STYLESHEET.** Search `THE TABLET BAND`.

---

## 4. ⭐⭐ EVERYTHING IS PUSHED — AND STOP ASKING HIM

⛔⛔ **DO NOT ASK HIS PERMISSION TO PUSH, OR TO DO ANYTHING ELSE HE HAS ALREADY ASKED FOR.**
14 Aug 2026: *"Why do you keep asking my fucking permission for stuff? I have it on bypass
permissions."* **Do the work, commit it, push it, and report what was done.** Ask only about things
only he can answer — a business fact, a copy decision, a photograph he has to supply.

Branch **`tablet-round-d197-d200`**, working tree clean, **level with the remote**.

| Commit | What |
|---|---|
| `7425794` | D235 one curve mechanism at every width, hero rebalanced, nav CTA gap |
| `47cd3ec` | D234 the scroll cue deleted, "Project gallery" |
| `1ac2e53` | D233 "Trade with Topcat", jargon gone from four places |
| `8bd3e30` | D232 the trade page finished |
| `d6d3672` | D231 the trade cards rebuilt |
| `3111e54` | D230 the trade ribbon, last eyebrows, footer gap, project grid |
| `a3f5998` | D229 leaf heroes: no eyebrow, card name, gold last word |
| `576e976` | D228 every service has its own page |
| `6fe1366` | D227 the helix's arc step |

⛔ **`gh` IS NOT INSTALLED**, so the PR cannot be opened from here: `brew install gh` once, or
https://github.com/ThadGC/topcatwork/pull/new/tablet-round-d197-d200

---

## 5. ⭐ THE LINK, AND THE HOST QUESTION HE HAS STILL NOT ANSWERED

```bash
cd "Website Demo" && nohup caffeinate -ims node dev-server.js > /tmp/topcat-server.log 2>&1 &
```

**Give him `http://192.168.1.102:5501`** — re-check with `ipconfig getifaddr en0`.
⭐ **THE SERVER IS DETACHED ON PURPOSE — PID 5158, untouched for three days and a dozen rounds.**
⛔ Do not `preview_stop` it and do not kill it to restart.
⭐ **USE `http://localhost:5501` IN THE PREVIEW PANE**, on his instruction: *"Stop asking to access
the link or something. Just look at the local host in the preview."*

### ⚠️ HE REVIEWS ON `thadeusg3.sg-host.com`

**We still do not know how files get there. Asked five times.** ⛔ Until it is answered, anything
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
`application/ld+json` block, which is JSON and fails `node --check` — a false alarm that cost time
this round.

### ⭐ THE FREEZE PROBE — THESE NUMBERS ARE THE PROOF

| Signal | 1440×900, fresh load |
|---|---|
| `.gal-scroll` height | **4950** |
| `--revPer` (on `section.mode-grid`) | **3** |
| `feTurbulence` | **60** |
| document height | **14833** |
| elements | **2709** |
| broken images | 0 |
| horizontal overflow | none |

⚠️ **MEASURE ON A FRESH LOAD AT THE TARGET WIDTH.** Resizing from a phone preset to 1440 without
reloading leaves `.gal-scroll` at its static height and looks like a regression that is not there.
⚠️ **FILTER BROKEN IMAGES ON `i.src && …`** — `#pmShot` is an `<img>` with no `src` at all (the stone
modal's placeholder), so an unfiltered check reports 1 forever.

---

## 7. ⭐ WHERE THINGS STAND

| Page | State |
|---|---|
| **`/`** | hero rebalanced, curved edges everywhere, scroll cue gone, grid overlay renamed |
| **`/services/`** | ⭐⭐ **NINE leaf pages — all eight of his services have their own** |
| **`/trade/`** | ⭐⭐ **rebuilt: eight sections, new title, new cards, two new sections** |
| **`/projects/`** | ⭐ **two-up grid at every width above the phone**, his own order |
| **`/estimate/` `/about/` `/contact/`** | as before |
| **`/stones/`** | the collection page, section eyebrow removed |
| `/materials/` `/guides/` `/worktops/` `/sitemap.html` | the SEO layer |

### The project gallery order (D230, D235) — his own, do not re-sort

```
Wimbledon    |  Watford
Hornchurch   |  Rickmansworth
Ruislip      |  Central London
Harlow       |  Harrow
```

⛔⛔ **A ROW-MAJOR GRID FILLS ACROSS BEFORE IT FILLS DOWN, SO THE ARRAY IS NOT THE ORDER HE SPOKE.**
He described two columns downward; the array interleaves them. ⚠️ **Harlow before Harrow** — one
letter apart, and he checked.

### The hero, as of this round

- **No scroll cue at any width** (D234) — markup and all its rules deleted, plus `.scrollcue` and
  the `cue` keyframe, which nothing else used.
- **The composition is 164 above / 201 below**, about 45:55 of the slack between the fixed nav and
  the hero floor (D235). ⛔ Not a dead 50:50 — a block centred by arithmetic reads as sitting low.
- **Phone and tablet bubbles**: Google reviews · 10 year guarantee · 72-hour aftercare ·
  ⭐ **Free home visit** (D231, replacing "Every detail included" — the other three are all trust and
  a fourth gave a visitor nothing to act on). ⚠️ **The desktop fact row still says "Every detail
  included" and should** — he named tablet and mobile.
- **The bar's quote button shows on DESKTOP ONLY** (D235) — wherever the burger is, the bar is logo
  and burger.

---

## 8. ⛔ RULES THAT MUST NOT BE BROKEN

1. ⛔ **Fabrication is IN-HOUSE (D202).** "Our experienced fabricators." It has flipped three times.
2. ⛔ **Never "laser" anything.** They template **by hand**.
3. ⛔ **The brand is "Topcat", one word.**
4. ⛔ **A stone's NAME and PHOTOGRAPH must match the supplier's own**, and the catalogue decides
   what a stone is called — not scraped copy.
5. ⛔ **Never state what we cannot guarantee, and never use an absolute.** ⭐ **A seam is always
   visible.**
6. ⛔ **Every measurement in millimetres.**
7. ⛔ **Never a bright or gold line across the TOP of a card or section**, anywhere. ⚠️ A full 34%
   gold BORDER is fine and is the site's standard — that is the rim, not a top band.
8. **No showroom of our own. Never show the review count. Value, not cheap.**
9. **Voice:** quietly confident master. British English, commas not em dashes, no exclamation marks.
   ⭐⭐ **AND NO AI SLOP (D213, D228)** — no "showcases our expertise", no "bring your vision to
   life", no "second to none". **Just what was done.** ⚠️ Also **no jargon** (D233): "critical path"
   was construction-programme language half his audience does not use.
10. ⛔ **The logo is the client's artwork and is never re-drawn. Set HEIGHT only.**
11. ⛔ **ONE DEVICE AT A TIME. Only the client unfreezes a band.**
12. ⭐⭐ **THIS IS A DESIGN BUILD. NEVER RAISE THE MISSING FORM BACKEND AS A BLOCKER.**

---

## 9. ⚠️⚠️ HOW TO MEASURE — THE PART THAT EARNED ITS PLACE

- ⛔⛔⛔ **PRINT THE COMPUTED VALUE BEFORE YOU CHANGE THE DECLARATION (D207).** Three separate faults
  this round were invisible in the source and obvious in `getComputedStyle`. **A rule can be parsed,
  present, and matching nothing.**
- ⛔⛔ **MEASURE LAYOUT WITH LAYOUT PROPERTIES.** A `getBoundingClientRect()` on an element carrying
  `.rise` includes the reveal's `translateY`: the trade card read **−34px** from the footer when the
  true gap was **0**. **`offsetTop` ignores transforms** (D221, D230).
- ⛔⛔ **SAMPLE THE PHOTOGRAPH, DO NOT GUESS AT IT.** For contrast over a hero image, draw the
  background to a canvas **at its own rendered `cover` scale and offset** and find the brightest
  pixel in the band the text occupies. That is how D232 got 3.51:1 — a real number, on a real
  worktop highlight, not an average.
- ⛔⛔ **AND MEASURE WHERE THE TEXT IS, NOT WHERE ITS BOX IS.** D229's first contrast reading said
  2.36:1 because `.crumb` is a full-width flex box and the sample was taken at the box's right edge,
  where no text sits.
- ⛔ **DEEPENING A VEIL TO WIN CONTRAST IS THE MOVE D217 ALREADY TRIED AND REVERTED** — it fixes the
  text by flattening the photograph, and on this site the photograph IS the product. **Shade the
  words, with a `0 0`-led shadow so the rim sits on all four sides of the letterform.**
- ⛔ **A `.click()` IN A PROBE DOES NOT HIT-TEST.** Use `elementFromPoint` (D212).
- ⛔ **CONFIRM THE RUNNING DOCUMENT IS THE FILE YOU JUST WROTE** (`fetch` it and grep) before
  believing a negative result (D222).

### The environment traps (all still live)

- ⛔⛔⛔ **A STRAY `*/` SILENTLY DELETES THE NEXT CSS RULE.** The §6 gate catches it.
- ⛔⛔ **THE PANE FREEZES ANIMATIONS AT ZERO when `document.visibilityState === 'hidden'`.**
- ⛔⛔ **THE PANE SILENTLY RESIZES ITSELF, AND IT DID SO REPEATEDLY THIS ROUND.** Screenshots then
  render into a small corner and are unusable. **Read `innerWidth` in the same call as your
  measurements**, and judge desktop visually at **1141–1200**.
- ⛔ **CONSOLE ERRORS FROM `javascript_tool` ARE YOUR OWN PROBE WRAPPERS, NOT THE PAGE.** Two
  `SyntaxError`s were chased this round; a clean load in a **fresh tab** logged nothing at all.
  **Open a new tab before believing a console error.**
- ⛔⛔ **`service.css` AND `stone.css` ARE NOT CONTENT-HASHED** — a reload can serve the previous
  edit. **Still open.**
- ⛔ **`scroll-behavior:smooth` IS ON `<html>`** — every probe `scrollTo` animates unless
  `behavior:'instant'`.
- ⛔ **`javascript_tool` TIMES OUT AT 30s**, and a `location.reload()` inside it kills the call —
  reload in one call, measure in the next.
- ⛔ **AN INVENTED DATA VALUE CAN BLANK THE WHOLE SITE.** Valid presets: calacatta, carrara, crema,
  emperador, eternal, fumo, goldveil, mist, nerogold, statuario.
- ⛔ **THE RANGE IS ALPHABETICAL EVERYWHERE (D85). NO DARK STONE ON THE FIRST SCREEN (D86).**

---

## 10. OPEN — DO THESE NEXT

### ⭐⭐ Waiting on him

1. ⭐⭐ **HOW DO FILES GET TO `thadeusg3.sg-host.com`?** Asked five times. **Nothing else matters if
   he cannot see the work.**
2. ⭐⭐ **TRADE TERMS.** Payment, minimum order, lead-time commitments, a dedicated trade contact.
   **The trade FAQ has a question about this that currently answers "we would rather quote them
   than post them"** — honest, but it is the one answer on that page that is a deflection. It is
   also his stated first priority as a business.
3. ⭐⭐ **THE FIREPLACE SCOPE, WITH NICK.** The page says Topcat do NOT install stoves, flues or gas
   appliances and do not set hearth clearances. **If they take on more than that, the page is
   understating the service** — but rule 12 forbids claiming it until he says so.
4. ⭐⭐ **ALI JAFFER AND KAV / UXBRIDGE** — two Drive folders that match no project. Are they projects
   nine and ten? He has photographs for neither.
5. ⭐ **THE 19 DRONE VIDEOS** in the Hornchurch and Rickmansworth folders. He said *"the videos
   rotating one after the other"* while describing the image slideshow, so no video is in the hero.
6. ⭐ **THE TWO DROPPED HORNCHURCH PHOTOGRAPHS** — both files are still on disk, one line each.
7. ⭐ **CONFIRM THE SILICA / HSE SENTENCE** in his own words (D202). A health-and-safety claim.
8. ⭐ **KITCHEN ISLANDS** — not on his service list; page still live and still linked. Delete or keep?
9. ⭐ **TRUSTPILOT** — recommended AGAINST putting 4.0 beside the Google 5.0. **He has not ruled.**

### ⭐ Ready to build

10. ⭐⭐ **PHOTOGRAPHY IS THE BIGGEST REMAINING GAP.** ⛔ **He has said twice: generate nothing.**
    - **Three service tiles show the wrong subject** — Outdoor Spaces a quarry, Commercial a
      kitchen, Bathrooms a bare slab. He asked for the first two to be replaced.
    - **Three tiles show "PHOTO TO COME"** — Fireplaces, Dining Tables, Vanity Tops — and their
      three new leaf pages all take the slab shot for the same reason.
      ⚠️ **His whole portfolio was checked on one contact sheet: it holds no fireplace and no dining
      table.** Those two need a shoot or nothing.
    - **The director portraits and the Why feature shot are placeholders.**
11. ⭐ **THE SITE HAS NO FAVICON AT ALL** — every browser requests `/favicon.ico` and gets a 404.
12. ⭐ **CONTENT-HASH `service.css` AND `stone.css`** — §9, and it will bite him on his phone.
13. ⚠️ **THE GENERATED PAGES SHIP THEIR CODE COMMENTS TO VIEW-SOURCE**, including his own quotes, on
    a public repo. Long-standing and nothing in them is sensitive, but stripping comments at build
    time is a small change. **Flagged, not done.**
14. ⚠️ **THE HORNCHURCH PHOTO** showing a garden through bi-folds with what looks like a child on
    play equipment. **It is now the third card in the gallery**, so more prominent than before.
15. ⭐ **THE `<title>` STILL SAYS "London & the Home Counties"** — he changed the hero, not the
    title, and the title is a search asset.
16. ⚠️ **~166 LEAF PAGES' META DESCRIPTIONS STILL NAME FOUR COUNTIES**, not eight. Deliberately left.

### The rest

17. ⭐ Pick a production host; brotli and long-lived cache headers.
18. ⭐ Close the licensing question on Caesarstone, CRL and Bloom. ⛔ Classic Quartz Stone is off
    limits. ⭐ **Calacatta Gold is UNRESOLVED.**
19. ⚠️ **IS IT RIMSHA OR REMSHA?** A real person's name on a public page.
20. ⭐ **FACEBOOK, TIKTOK, YOUTUBE?** ⛔ Do not guess handles.

**Still waiting on the client:** whether Quartzite becomes a fourth range, 20mm vs 30mm pricing
(⚠️ the thickness toggle moves no number, which is correct until he rules), brackets for vanity tops
/ fireplaces / tables, and the £3k vs £3,850 three-slab discrepancy.

---

## 11. ⭐ HOW THIS CLIENT WORKS

⛔⛔⛔ **DO NOT ARGUE YOURSELF OUT OF SOMETHING HE ASKED FOR, AND DO NOT HAND HIM THE DILEMMA
EITHER.** **A real constraint is a problem to solve, not a question to return. If he names a thing,
build the thing.**

⛔⛔ **AND DO NOT ASK HIS PERMISSION.** *"Why do you keep asking my fucking permission for stuff? I
have it on bypass permissions."* Commit, push, report. See §4.

⛔⛔ **DO THE THING HE ASKED FOR, IN THE MESSAGE HE ASKED FOR IT.** He sends asks in runs and adds
more mid-build — **four separate mid-turn messages this round.** Do them in his order. **Say plainly
which you are dropping and why.**

⛔⛔⛔ **A REGISTER ROW IS A RECORD OF WHAT HE ASKED FOR ONCE. IT DOES NOT OUTRANK WHAT HE IS ASKING
FOR NOW.** ⭐ **WHEN THE CLIENT DESCRIBES A THING AND THE PAGE DISAGREES WITH HIS DESCRIPTION, THE
PAGE IS WRONG.** A description IS an instruction. (D225 is the row that earned this; D235 reversed
D198's tablet-only scoping on exactly these grounds.)

⚠️⚠️ **HE REVERSES HIMSELF FREELY AND FAST — AND THAT IS FINE. LOG IT.** ⛔ **Write the reversal into
§D WITH THE REASON THE OLD DECISION EXISTED**, or the next session helpfully rebuilds the thing he
just rejected. ⭐ **D230's two-column trade intro was reversed by D232 within the hour, and the
reason D230 existed — the 547px ribbon — is what stops it being rebuilt.**

⚠️ **HE CORRECTS THE DIAGNOSIS, NOT JUST THE DESIGN, AND HE IS USUALLY RIGHT.** Take the report as
data and **go and MEASURE.** "It's fucking wrong" was a spiral angle. "The title is right up against
the text" was 0px, from CSS that matched nothing. "The text is hard to read" was 3.51:1.

⚠️ **HE SWEARS WHEN SOMETHING LOOKS WRONG, AND THE COMPLAINT IS ALWAYS REAL.** Do not get defensive
and do not over-apologise. Find it, name the actual cause, fix it, say what it was.

- **Walk the journey, do not check the page.**
- ⭐⭐ **LOOK AT THE RESULT BEFORE REPORTING IT DONE.**
- **Measure, then claim.** ⚠️ **And if you could not measure it, say so.**

---

## 12. BUDGET AND THE DOCUMENT SET

- **~82 credits** of the client's **100-credit ceiling** spent, about **18 left**. ⭐ **This round
  cost none** — no image generation, on his instruction.

| File | What it is |
|---|---|
| **`HANDOVER.md`** | ⭐ The single current state. §D is the register, **D1–D130 and D132–D235**. §2 the standing rules, §2a the supplier list. ⚠️ **THERE IS NO D131 ROW** |
| **`Website Demo/index.html`** | ⭐⭐ The whole design — inline `<style>` and `<script>`. Search `THE TABLET BAND`, `const PROJECTS`, `const SERVICES`, `const REVIEWS`, `ANG_STEP`, `--navCurveR` |
| **`Website Demo/build_pages.py`** | ⭐⭐ Builds the seven internal pages and the shared assets. **Owns `/trade/index.html`** |
| **`Website Demo/services/build_services.py`** | ⭐ The nine service leaf pages |
| **`Website Demo/build_seo_pages.py`** | ⭐ The 26-page SEO layer, the sitemap, and `APPLICATIONS` on ~166 pages |
| ⛔ **`Website Demo/trade/build_trade.py`** | ⛔⛔ **SUPERSEDED — DO NOT RUN.** Would revert the trade page to 1 August (D233) |
| `Website Demo/assets/site.css` `site.js` | ⛔ **GENERATED. Never edit.** |
| **`Website Demo/assets/projects/`** | ⭐ **107 WebP files — the client's real portfolio** |
| `Website Demo/services/service.css` `stones/stone.css` | ⭐ Hand-maintained, shared by ~166 leaf pages. ⚠️ **NOT content-hashed** |
| `Website Demo/stones/build_stones.py` | Builds the collection, compare.html and 132 stone pages |
| `Website Demo/stones/harvest/verify.py` | ⭐ The nine-check gate |
| `Website Demo/dev-server.js` | Compression, caching, and the reload that keeps scroll position |
| `Docs/topcat-worktops-SEO-LOG.md` | Every URL, title, target query and SEO change |
| `HANDOVER-2026-08-14-drive-photography-round-start-here.md` | ⭐ **The START HERE this file replaces** (D214–D226) |
| `HANDOVER-archive-to-2026-08-06.md` | ⚠️ **Every design the client rejected, in his words.** Read before redesigning anything |

⚠️ **Section numbers in `HANDOVER.md` are referenced from code comments** (`§3`, `§4`, `§5a`, `§6.7`,
`§7.5` are live in `index.html`). **Do not renumber.**
