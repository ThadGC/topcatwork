# START HERE — 15 August 2026, after the DESKTOP HERO ROUND (D236–D240)

Read this, then `HANDOVER.md` **§D** (the register, newest first — this round is **D236–D240**) and
**§2** (the standing rules). That is about twenty minutes and it is enough to work safely.

> ⚠️ **This replaces the previous version of this same file**, which covered the service pages and
> trade page round (D227–D235) and is now
> `HANDOVER-2026-08-14-service-and-trade-round-start-here.md`. Everything in it that still matters
> is carried below.

---

## 0. ⛔⛔⛔ THE ONE THING TO TAKE FROM THIS ROUND

**⭐⭐⭐ THE DESKTOP IS OPEN AND HE IS ITERATING ON IT FAST. THE HERO CHANGED THREE TIMES IN ONE DAY.**

| He asked | It became | Reversed by |
|---|---|---|
| D237 *"add this to the hero section of the desktop version"* | the tablet's stack, bubbles 2×2, gold rule kept | **D238, one hour later** |
| D238 *"centre the hero section design just like on the tablet"* | centred, gold rule deleted, four bubbles across | still live |
| D239 *"let's try with the subtitle in one line"* | one line | **D239, one message later** |

⭐⭐ **THAT IS NOT INDECISION, IT IS HOW HE WORKS — AND EVERY REVERSAL HAS TO CARRY THE REASON THE OLD
DECISION EXISTED**, or the next session helpfully rebuilds the thing he just rejected. D237's 480px
bubble cap was a real measurement of the two buttons, and it existed only because the copy was
LEFT-aligned; centred, the block gets both edges for free. That sentence is what stops it coming back.

### ⛔⛔ AND THREE MEASUREMENT TRAPS THAT EACH COST TIME THIS ROUND

- ⛔⛔⛔ **`scrollWidth > clientWidth` IS NOT AN OVERFLOW TEST.** Both round to whole pixels, so on a
  163.82px chip **all four bubbles reported one pixel of overflow — one of them with 122px of slack.**
  I shipped a padding change to "fix" it before measuring properly, then reverted it.
  **Compare the children against the content box in sub-pixels.**
- ⛔⛔ **MEASURE THE TEXT, NOT ITS BOX.** `.hl` is a full-width `overflow:hidden` mask, so a
  `getBoundingClientRect()` on the headline's line says **1040** — the copy width — not the 842.6 the
  glyphs actually occupy. **A `Range` over the text contents is the only way to answer "where does
  the B start and the D end".**
- ⛔⛔ **A BLOCK BOX WITH A `max-width` INSIDE A WIDER PARENT ALIGNS LEFT.** The bubble row came out
  the right WIDTH and **98.7px to the left** of the headline it was matching. `margin-inline:auto`.
  That is D199's finding on the copy box, one level down, and it happened twice this round.

---

## 1. ⛔⛔⛔ THE BUG HE FOUND, AND THE SHAPE OF IT

**D236: the project gallery broke on a resize and was perfect after a refresh.** Client: *"it's only
broken when I change the responsiveness. So if I refresh it, then it still works perfectly."*

**`measure()` added `.gal-static` and nothing ever took it off.** Every rule of the static layout is
gated on that class at **base scope** (D195 lifted them out of the phone query on purpose), so the
class ALONE, at any width, takes `position:sticky` off the pin, makes the stage static and turns the
eight absolutely-positioned cards into flex items. Narrowing past 1120 added it; widening back left
it on while `--galMode` went unset and the accordion started drawing again.

⭐ **Measured at 1200 after a 900 → 1200 resize: pin `static`, cards `relative`, carrying
`translate3d(-1311.6px, 355.8px)` at `opacity:0`.** That was his screenshot exactly.

⭐⭐ **IT IS A `toggle` FROM THE SAME READ THAT DRIVES THE ENGINE NOW.** ⛔ **Do not reintroduce a
one-way `add`.** ⚠️ And look for the same shape elsewhere: a class or an inline style set on the way
INTO a band and never cleared on the way out is invisible to a refresh and obvious to a drag.

---

## 2. ⭐⭐ THE DESKTOP HERO AS IT NOW STANDS

**Title → trust line → two buttons → four bubbles, centred, at every width.** The icon fact row is
**deleted** (D237), the trust line's gold rule is **deleted** (D238), and the four bubbles run
across in one row.

| Thing | At 1440×900 |
|---|---|
| headline | **89.3px**, two lines, `clamp(72px,min(6.2vw,10.6vh),92px)` |
| copy box | **1040px** centred (`min(92vw,1040px)`) |
| trust line | **two** lines, capped at `56ch` |
| buttons | **259.4 = 259.4**, centred to 0.0px |
| bubbles | **842.6px**, four × 202.9, edges **0.0px** off the B of "building" and the D of "around" |
| composition | **166 above / 201 below**, 45:55 (D235's balance, and it holds by itself) |

- ⭐⭐ **THE BUBBLE ROW IS MEASURED IN THE HEADLINE'S OWN TYPE SIZE.** "building around" sets in
  **9.4374 em** — identical at 72, 80, 89.28 and 92px — so the cap is `calc(var(--hTitle) * 9.4374)`
  and the two edges cannot drift. ⛔ **A fixed px cap would have been right at 1440 and wrong
  everywhere else**: that line runs 679.5px at 1121 and 868px at 1600.
- ⭐⭐ **THE TWO BUTTONS ARE AN EQUAL-COLUMN GRID**, `repeat(2,1fr)` at `width:max-content`, which is
  how two buttons become one size without a number. The phone and tablet are the same grid with
  **one** column and a 76% container, so D188's shared measure now lives on the row, not on each
  button.
- ⛔⛔ **CENTRING THE COPY PUT THE HEADLINE ACROSS THE THREE LIT PENDANTS.** The big shade layer is a
  LEFT-TO-RIGHT ramp aimed at a composition that no longer exists — 0.94 at the left edge and **0.19
  where the words now are**. Sampling the photograph itself: **2.45:1 white, 1.52:1 gold.** Both fail.
  ⭐ The fix is a **scrim under the copy**, zero at the edges, so the island's far end keeps its
  light: **6.29:1 white, 3.90:1 gold, 3.40 at the gold gradient's darkest stop.** ⛔ A flat wash is
  what D217 reverted and only reaches 3.36 anyway.
- ⚠️ **THE SCRIM IS TWO VARIABLES SO THE FROZEN BANDS SWITCH IT OFF** — the phone and tablet keep
  D187's flat 0.30 wash. **One veil per band.**
- ⚠️⚠️ **THE PHONE'S TYPE SIZES ARE WRITTEN DOWN NOW AND THAT MATTERS.** It had no title or subtitle
  size of its own and sat on the base clamp's FLOOR (38px, 14.5px). Making the base rule the big
  centred one would have grown the frozen phone headline to 52px silently. **Both are explicit in
  the ≤1120 block.**

---

## 3. ⛔ THREE DEVICE BANDS — AND THE DESKTOP IS THE ONE IN SCOPE

```
   ≤ 720px          721 – 1120px          ≥ 1121px
   the phone   ·   the tablet        ·   the desktop
   FROZEN          FROZEN                HE IS WORKING HERE
```

⭐⭐ **THE MECHANISM GOES TO BASE SCOPE AND ONLY THE NUMBERS LIVE IN THE BAND BLOCKS.** D235 set this
and this round leaned on it five times: the centring, the chip grid, the CTA grid, the scrim and the
title size are each written ONCE, with `--chipCols`, `--ctaCols`, `--heroScrimA/B` and `--hTitle`
carrying the per-band values.
⛔ **THE TABLET-ONLY BLOCK IS THE LAST THING IN THE STYLESHEET.** Search `THE TABLET BAND`.
⚠️ Base scope IS the desktop. A change to a base rule reaches the phone and tablet unless they
override it — **check what they were silently inheriting before you touch a base number.**

---

## 4. ⭐⭐ EVERYTHING IS PUSHED — AND STOP ASKING HIM

⛔⛔ **DO NOT ASK HIS PERMISSION TO PUSH, OR TO DO ANYTHING ELSE HE HAS ALREADY ASKED FOR.**
*"Why do you keep asking my fucking permission for stuff? I have it on bypass permissions."*
**Do the work, commit it, push it, and report what was done.**

Branch **`tablet-round-d197-d200`**, working tree clean, **level with the remote**.

| Commit | What |
|---|---|
| `0c33e6e` | D240 three duplicates out, the Topcat plate fills the holes |
| `8b93746` | D239 the bubble row ends where the headline does, the buttons match |
| `90d5c81` | D238 the desktop hero centred, the gold rule gone |
| `4eef0ab` | D236–D237 the desktop hero takes the tablet's composition, the gallery survives a resize |

⛔ **`gh` IS NOT INSTALLED**, so the PR cannot be opened from here: `brew install gh` once, or
https://github.com/ThadGC/topcatwork/pull/new/tablet-round-d197-d200

---

## 5. ⭐ THE LINK, AND THE HOST QUESTION HE HAS STILL NOT ANSWERED

```bash
cd "Website Demo" && nohup caffeinate -ims node dev-server.js > /tmp/topcat-server.log 2>&1 &
```

**Give him `http://192.168.1.102:5501`** — re-check with `ipconfig getifaddr en0`.
⭐ **THE SERVER IS DETACHED ON PURPOSE — PID 5158, untouched for four days.**
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

⭐⭐ **IT EARNED ITS PLACE AGAIN THIS ROUND: A COMMENT EDIT LEFT A STRAY `*/` THAT SILENTLY DELETED
`.hero-ctas`**, and the gate is the only thing that saw it.

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
| `feTurbulence` | **60** |
| document height | **14833** |
| elements | **2687** ⚠️ was 2709 — the icon row's 22 nodes came out (D237) |
| `#svcNav` | **8** |
| broken images | 0 |
| horizontal overflow | none |

⚠️ **MEASURE ON A FRESH LOAD AT THE TARGET WIDTH.** Resizing from a phone preset to 1440 without
reloading leaves `.gal-scroll` at its static height and looks like a regression that is not there.
⚠️ **FILTER BROKEN IMAGES ON `i.src && …`** — `#pmShot` is an `<img>` with no `src` at all.

---

## 7. ⛔⛔⛔ A CSS COMMENT BROKE A BUILDER, AND THE CLASS OF FAULT IS STILL OPEN

**`build_pages.py` finds its parts with plain string searches.** A comment in the stylesheet quoted
an element's opening tag verbatim, the search matched THERE first, and **every internal page shipped
a slab of CSS as visible text on the screen** where the icon definitions should have been.

⭐ **Fixed at the class, not the instance: every markup marker now searches from `</style>`
onwards.** ⚠️ **But the same trap is one careless backtick away for the other builders** — do not
write a live element's opening tag out in a comment. Name it as `.class` instead.

⚠️ **AND `str.replace` WITH NO MATCH DOES NOTHING AND RAISES NOTHING.** The chips extractor stripped
`hero-el` with an exact match on `--hd:1040ms`; the day the stagger changed, every internal page
would have shipped its bubbles at **opacity 0, holding their space, invisible**. It is a regex now.

---

## 8. ⭐ WHERE THINGS STAND

| Page | State |
|---|---|
| **`/`** | ⭐⭐ **hero centred at every width, headline 89px, four bubbles across, gallery survives a resize** |
| **`/services/`** | NINE leaf pages — all eight of his services have their own |
| **`/trade/`** | rebuilt: eight sections, "Trade with Topcat", no trade terms anywhere |
| **`/projects/`** | ⭐ **three duplicates out, Topcat plates close three blocks** |
| **`/estimate/` `/about/` `/contact/`** | as before |
| **`/stones/`** | the collection page |
| `/materials/` `/guides/` `/worktops/` `/sitemap.html` | the SEO layer |

### The project galleries after D240

| Project | Photographs | Block at 3 columns |
|---|---|---|
| Hornchurch | 7 (`-g6` out) | 3/2/2, a **74px** step |
| Rickmansworth | 15 (`-g16` out) | 5/5/5 flush |
| Central London | 13 **+ plate** | 5/5/4, the plate two slots tall |
| Harlow | 14 (`-g7` out) **+ plate** | 5/5/5 flush |
| Harrow | 2 **+ plate** | one a column |

- ⭐⭐ **THE PLATE LANDS IN THE GAP BY ARITHMETIC.** `column-count` balances and fills in source
  order, so the LAST item, given exactly the height of the missing slots, can only go where the hole
  is. `(cols − n mod cols) mod cols` IS the hole, computed from the gallery length — ⛔ **it was a
  typed number for an hour and that was wrong.**
- ⚠️ It answers each band separately: **two columns gives Harrow no hole, and one column never has
  one**, so neither renders a plate.
- ⚠️ The plate is out of `MEDIA`, so the lightbox never opens a blank slide, and it is `aria-hidden`.
- ⛔ **THE ORDER OF THE GRID IS HIS AND IS NOT TO BE RE-SORTED**: Wimbledon | Watford / Hornchurch |
  Rickmansworth / Ruislip | Central London / **Harlow | Harrow** (one letter apart, and he checked).

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
10. ⛔ **The logo is the client's artwork and is never re-drawn. Set HEIGHT only.** ⚠️ The project
    plates (D240) are the newest place this applies.
11. ⛔ **ONE DEVICE AT A TIME. Only the client unfreezes a band.** ⭐ **He unfroze the DESKTOP on
    14 Aug and it is the band in scope.**
12. ⭐⭐ **THIS IS A DESIGN BUILD. NEVER RAISE THE MISSING FORM BACKEND AS A BLOCKER.**

---

## 10. ⚠️⚠️ HOW TO MEASURE — THE PART THAT EARNED ITS PLACE

- ⛔⛔⛔ **PRINT THE COMPUTED VALUE BEFORE YOU CHANGE THE DECLARATION (D207).** A rule can be parsed,
  present, and matching nothing.
- ⛔⛔ **AND CHECK WHAT YOUR TEST ACTUALLY MEASURES.** See §0 — `scrollWidth`/`clientWidth` round to
  whole pixels, a mask's box is not its text, and a `max-width` box is not centred by default.
- ⛔⛔ **SAMPLE THE PHOTOGRAPH, DO NOT GUESS AT IT.** For contrast over a hero image, draw the
  background to a canvas **at its own rendered `cover` scale and offset**, undo the `1.08` load
  transform, and find the brightest pixel in the band the text occupies, composited under every
  shade layer. That is how D238 got 2.45:1 and 1.52:1 — real numbers on the real pendant lights.
- ⛔⛔ **MEASURE LAYOUT WITH LAYOUT PROPERTIES.** `getBoundingClientRect()` on an element carrying
  `.rise` includes the reveal's `translateY`. **`offsetTop` ignores transforms** (D221, D230).
- ⛔ **DEEPENING A VEIL TO WIN CONTRAST IS THE MOVE D217 ALREADY TRIED AND REVERTED.** Shade the
  words, or scrim only where they are.
- ⛔ **A `.click()` IN A PROBE DOES NOT HIT-TEST.** Use `elementFromPoint` (D212).
- ⛔ **CONFIRM THE RUNNING DOCUMENT IS THE FILE YOU JUST WROTE** before believing a negative (D222).

### The environment traps (all still live)

- ⛔⛔⛔ **A STRAY `*/` SILENTLY DELETES THE NEXT CSS RULE.** The §6 gate catches it. It happened again.
- ⛔⛔ **THE PANE FREEZES ANIMATIONS AT ZERO when `document.visibilityState === 'hidden'`.** A
  screenshot still wakes it, which is how the gallery was verified this round.
- ⛔⛔ **THE PANE SILENTLY RESIZES ITSELF.** **Read `innerWidth` in the same call as your
  measurements**, and judge desktop visually at **1141–1200**.
- ⛔ **CONSOLE ERRORS FROM `javascript_tool` ARE YOUR OWN PROBE WRAPPERS, NOT THE PAGE.** One of mine
  was still in the log this round. **Open a new tab before believing a console error.**
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

1. ⭐⭐ **HOW DO FILES GET TO `thadeusg3.sg-host.com`?** Asked five times. **Nothing else matters if
   he cannot see the work.**
2. ⭐ **THE HORNCHURCH DUPLICATE HE HAS NOT NAMED — `-g1` AND `-g9` ARE THE SAME NOOK.** It was
   removed, measured and put back: it is the only portrait balancing that gallery's two landscape
   shots, and without it the two of them sit alone in column one under a **399px** hole. **Told him;
   his call.**
3. ⭐ **HARLOW'S PLATE WAS NOT ASKED FOR.** Removing the duplicate left 14 photographs, which balance
   5/5/4 with the hole in the MIDDLE of the block. One plate closes it. **Told him; one field to
   delete.**
4. ⭐⭐ **TRADE TERMS.** Payment, minimum order, lead-time commitments, a dedicated trade contact.
   **The trade FAQ currently answers "we would rather quote them than post them"** — honest, but it
   is the one answer on that page that is a deflection, and it is his stated first priority.
5. ⭐⭐ **THE FIREPLACE SCOPE, WITH NICK.** The page says Topcat do NOT install stoves, flues or gas
   appliances. **If they take on more, the page is understating the service.**
6. ⭐⭐ **ALI JAFFER AND KAV / UXBRIDGE** — two Drive folders that match no project. Projects nine and
   ten? He has photographs for neither.
7. ⭐ **THE 19 DRONE VIDEOS** in the Hornchurch and Rickmansworth folders.
8. ⭐ **THE TWO DROPPED HORNCHURCH PHOTOGRAPHS** — both files are still on disk, one line each.
9. ⭐ **CONFIRM THE SILICA / HSE SENTENCE** in his own words (D202). A health-and-safety claim.
10. ⭐ **KITCHEN ISLANDS** — not on his service list; page still live and still linked. Delete or keep?
11. ⭐ **TRUSTPILOT** — recommended AGAINST putting 4.0 beside the Google 5.0. **He has not ruled.**

### ⭐ Ready to build

12. ⭐⭐ **PHOTOGRAPHY IS THE BIGGEST REMAINING GAP.** ⛔ **He has said twice: generate nothing.**
    - **Three service tiles show the wrong subject** — Outdoor Spaces a quarry, Commercial a
      kitchen, Bathrooms a bare slab. He asked for the first two to be replaced.
    - **Three tiles show "PHOTO TO COME"** — Fireplaces, Dining Tables, Vanity Tops — and their three
      leaf pages all take the slab shot. ⚠️ **His whole portfolio holds no fireplace and no dining
      table**, checked on one contact sheet. Those two need a shoot or nothing.
    - **The director portraits and the Why feature shot are placeholders.**
13. ⭐ **THE SITE HAS NO FAVICON AT ALL** — every browser requests `/favicon.ico` and gets a 404.
    ⚠️ `assets/brand/favicon.svg` exists and is referenced; the `.ico` is what is missing.
14. ⭐ **CONTENT-HASH `service.css` AND `stone.css`** — §10, and it will bite him on his phone.
15. ⚠️ **THE GENERATED PAGES SHIP THEIR CODE COMMENTS TO VIEW-SOURCE**, including his own quotes, on
    a public repo. Nothing in them is sensitive; stripping comments at build time is a small change.
16. ⚠️ **THE HORNCHURCH CARD PHOTO** shows a garden through bi-folds with what looks like a child on
    play equipment. **It is the third card in the gallery.**
17. ⭐ **THE `<title>` STILL SAYS "London & the Home Counties"** — he changed the hero, not the title,
    and the title is a search asset.
18. ⚠️ **~166 LEAF PAGES' META DESCRIPTIONS STILL NAME FOUR COUNTIES**, not eight. Deliberately left.

### The rest

19. ⭐ Pick a production host; brotli and long-lived cache headers.
20. ⭐ Close the licensing question on Caesarstone, CRL and Bloom. ⛔ Classic Quartz Stone is off
    limits. ⭐ **Calacatta Gold is UNRESOLVED.**
21. ⚠️ **IS IT RIMSHA OR REMSHA?** A real person's name on a public page.
22. ⭐ **FACEBOOK, TIKTOK, YOUTUBE?** ⛔ Do not guess handles.

**Still waiting on the client:** whether Quartzite becomes a fourth range, 20mm vs 30mm pricing
(⚠️ the thickness toggle moves no number, which is correct until he rules), brackets for vanity tops
/ fireplaces / tables, and the £3k vs £3,850 three-slab discrepancy.

---

## 12. ⭐ HOW THIS CLIENT WORKS

⛔⛔⛔ **DO NOT ARGUE YOURSELF OUT OF SOMETHING HE ASKED FOR, AND DO NOT HAND HIM THE DILEMMA
EITHER.** **A real constraint is a problem to solve, not a question to return. If he names a thing,
build the thing.**

⛔⛔ **AND DO NOT ASK HIS PERMISSION.** Commit, push, report. See §4.

⛔⛔ **DO THE THING HE ASKED FOR, IN THE MESSAGE HE ASKED FOR IT.** He sends asks in runs and adds
more mid-build — **two separate mid-turn messages this round.** Do them in his order.

⚠️⚠️ **HE REVERSES HIMSELF FREELY AND FAST — AND THAT IS FINE. LOG IT.** ⛔ **Write the reversal into
§D WITH THE REASON THE OLD DECISION EXISTED.** ⭐ This round the hero moved three times in a day and
the trust line went to one line and back within two messages.

⭐⭐ **WHEN SOMETHING IS DIFFERENT FROM WHAT HE ASKED, SAY SO PLAINLY IN THE REPORT.** Two things
this round were not his instruction — Harlow's plate and the Hornchurch duplicate left in — and both
were reported with the measurement behind them rather than buried or quietly done.

⚠️ **HE CORRECTS THE DIAGNOSIS, NOT JUST THE DESIGN, AND HE IS USUALLY RIGHT.** *"It's only broken
when I change the responsiveness"* was a one-way `classList.add`.

⚠️ **HE SWEARS WHEN SOMETHING LOOKS WRONG, AND THE COMPLAINT IS ALWAYS REAL.** Find it, name the
actual cause, fix it, say what it was.

- **Walk the journey, do not check the page.**
- ⭐⭐ **LOOK AT THE RESULT BEFORE REPORTING IT DONE.**
- **Measure, then claim.** ⚠️ **And if you could not measure it, say so.**

---

## 13. BUDGET AND THE DOCUMENT SET

- **~82 credits** of the client's **100-credit ceiling** spent, about **18 left**. ⭐ **This round
  cost none** — no image generation, on his instruction.

| File | What it is |
|---|---|
| **`HANDOVER.md`** | ⭐ The single current state. §D is the register, **D1–D130 and D132–D240**. §2 the standing rules, §2a the supplier list. ⚠️ **THERE IS NO D131 ROW** |
| **`Website Demo/index.html`** | ⭐⭐ The whole design — inline `<style>` and `<script>`. Search `THE TABLET BAND`, `const PROJECTS`, `const SERVICES`, `--hTitle`, `--chipCols`, `--heroScrimA`, `proj-brand` |
| **`Website Demo/build_pages.py`** | ⭐⭐ Builds the seven internal pages and the shared assets. **Owns `/trade/index.html`.** ⚠️ Its markup markers search from `</style>` — see §7 |
| **`Website Demo/services/build_services.py`** | ⭐ The nine service leaf pages |
| **`Website Demo/build_seo_pages.py`** | ⭐ The 26-page SEO layer, the sitemap, and `APPLICATIONS` on ~166 pages |
| ⛔ **`Website Demo/trade/build_trade.py`** | ⛔⛔ **SUPERSEDED — DO NOT RUN.** Would revert the trade page to 1 August (D233) |
| `Website Demo/assets/site.css` `site.js` | ⛔ **GENERATED. Never edit.** |
| **`Website Demo/assets/projects/`** | ⭐ **107 WebP files, 101 of them referenced — the client's real portfolio.** ⚠️ The six unused are kept on disk on purpose: `harlow-g7`, `hornchurch-g6`, `rickmansworth-g16` (D240's duplicates), `hornchurch-g2` and `-g3` (dropped 14 Aug), and `wimbledon-560` |
| **`Website Demo/assets/brand/`** | ⭐ The client's own artwork. `topcat-vertical.svg` is the project plate's logo (D240) |
| `Website Demo/services/service.css` `stones/stone.css` | ⭐ Hand-maintained, shared by ~166 leaf pages. ⚠️ **NOT content-hashed** |
| `Website Demo/stones/build_stones.py` | Builds the collection, compare.html and 132 stone pages |
| `Website Demo/stones/harvest/verify.py` | ⭐ The nine-check gate |
| `Website Demo/dev-server.js` | Compression, caching, and the reload that keeps scroll position |
| `Docs/topcat-worktops-SEO-LOG.md` | Every URL, title, target query and SEO change |
| `HANDOVER-2026-08-14-service-and-trade-round-start-here.md` | ⭐ **The START HERE this file replaces** (D227–D235) |
| `HANDOVER-archive-to-2026-08-06.md` | ⚠️ **Every design the client rejected, in his words.** Read before redesigning anything |

⚠️ **Section numbers in `HANDOVER.md` are referenced from code comments** (`§3`, `§4`, `§5a`, `§6.7`,
`§7.5` are live in `index.html`). **Do not renumber.**
