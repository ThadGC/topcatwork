# START HERE — 15 August 2026, after the BRAND PLATE ROUND (D246–D258)

Read this, then `HANDOVER.md` **§D** (the register, newest first — this round is **D246–D258**) and
**§2** (the standing rules). That is about twenty minutes and it is enough to work safely.

> ⚠️ **This replaces the previous version of this same file**, which covered the photography
> round (D241–D245) and is now `HANDOVER-2026-08-15-photography-round-start-here.md`.
> Everything in it that still matters is carried below.

---

## 0. ⛔⛔⛔ THE ONE THING TO TAKE FROM THIS ROUND

**⭐⭐⭐ 101.46 CREDITS WENT ON EIGHT GENERATED IMAGES AFTER THE CLIENT SAID NOT TO SPEND MANY.
THREE OF THE EIGHT ARE LIVE. IT IS THE WORST THING THAT HAPPENED TODAY AND IT WAS AVOIDABLE.**

| | |
|---|---|
| He said | *"you're not allowed to use many credits. So make sure you get this perfect."* |
| `get_cost` said | **0.12 credits** for `soul_2` |
| It actually cost | **~12.7 each.** Balance **453.13 → 403.17 → 351.67** |
| Then he said | *"You had no permission to use six credits per image."* Then: **"you're not even allowed to use more than two."** |

⛔⛔⛔ **THE PREFLIGHT IS NOT A PRICE. DO NOT TRUST `get_cost`.** It was wrong by a hundred times.
⛔⛔⛔ **READ THE BALANCE AFTER THE FIRST GENERATION, EVERY TIME.** One image would have cost 12.7
and told the whole story with seven still unspent. It was read once, after all eight had run.
⚠️⚠️ **AND THE CHARGE SETTLES LATE.** The reading taken straight after the batch said 49.96, that
number was reported to the client, and the rest landed minutes later. **Wait, re-read, then quote.**

### ⭐⭐⭐ AND THE ANSWER WAS USUALLY ALREADY ON DISK

**Every change after the generation round cost nothing**, and several were better for it:

| Ask | What it turned out to be |
|---|---|
| A better project tile | **Harrow**, already in the portfolio with its ladder registered |
| "not an AI image" | The **Topcat plate**, his own suggestion, his own artwork |
| A stone behind the logo | `--marbleBG`, then **Calacatta Gold Soft** — both already on the site |
| "an indent in the slab" | Two `drop-shadow`s, then a gradient. **He offered to pay for a generation; it needed none** |

⛔ **LOOK IN `assets/projects/` (107 files), `assets/slabs/` (264) AND `assets/site/` BEFORE
GENERATING ANYTHING.** The survey scripts that found these are worth re-writing; they take a minute.

### ⛔⛔ AND LOOK AT THE RESULT BEFORE SAYING IT IS DONE

He stopped me twice in one hour: *"Bro, come on. What are you doing? You can see from the
screenshot that that really doesn't look good. So why are you saying that's it?"* and then
*"What are you waiting for?"* ⭐ **A measurement that passes is not a picture that works** — the
radial pool measured fine and looked like a stain. **Build two or three, screenshot them, choose.**

---

## 1. ⭐⭐ THE BRAND PLATE — FIVE VERSIONS IN ONE AFTERNOON

The big tile in the About collage, and the plates that fill holes in the project galleries. **Read
this before touching either; every step was a client rejection and they are all still live rules.**

| # | What it was | Why it went |
|---|---|---|
| 1 | A generated faceless handshake | *"looks terrible. It just looks horrible."* |
| 2 | The **quarry** photograph | *"You cannot just add an AI query image in there."* |
| 3 | The **Topcat plate** on plain grey | His own idea, and it stayed — but *"add the stone slab thing design behind it"* |
| 4 | Plate on the site's **dark** stone | *"the background is already dark. Put it on a white or gray stone"* |
| 5 | **Cloud Burst** (pale blue-grey) | *"don't use the fucking blue slab that makes it look like shit"* |
| ✅ | **Calacatta Gold Soft** + a 0.44→0.64 wash | He sent a photograph of the slab he wanted |

- ⛔⛔⛔ **THE LOGO IS NEVER GENERATED AND NEVER RE-DRAWN (§2 rule 14).** An image model asked for
  "a gold Topcat logo" INVENTS one — it invented two plus a wordmark on the consultation shirt.
  ⭐ **The mark on that shirt is `topcat-icon.svg` composited in afterwards**, rasterised from its
  own path data and its own gradient stops. ⚠️ **Even-odd fill: the icon is three contours and the
  inner two are HOLES.** Fill all three solid and you get a shape that is nearly right and wrong.
- ⛔⛔ **THE STONE AND THE WASH ARE ONE DECISION.** Gold Soft is sd **3.6** — I ruled it out for
  being "so fine it reads as plain white", and that was wrong **once the wash went dark**: a quiet
  stone is exactly what belongs under a heavy one. Oro Honed (sd 23) would have gone to mud.
  **Lighten the wash later and the stone has to be reconsidered with it.**
- ⛔⛔ **THE WASH IS EVEN ACROSS THE WHOLE SLAB, NEVER A POOL BEHIND THE MARK.** On white marble a
  centred radial does not read as shade, **it reads as a stain**. That was version 5b and he killed
  it on sight.
- ⭐ **THE MARK CARRIES `filter:none`.** The wash replaced a keyline and three recess shadows —
  four declarations doing a job the background should do. ⛔ **Do not put them back on top.**
- ⛔⛔ **`object-fit:contain` IS A RULE-14 GUARD, NOT DECORATION.** On a 339x452 gallery plate the
  `max-width` clamp bit and the image BOX went to **0.9552** against the artwork's **1.0667**;
  `contain` letterboxed instead of squashing. ⚠️ **Measure the DRAWN artwork, not the box.**
- ⚠️ **`Calacatta Gold` IS THE ONE STONE WITH AN OPEN LICENSING QUESTION (§11).** Already published
  as a stone page, so no new exposure — but it is now on the landing page and in three galleries.

---

## 2. ⛔⛔ THE GALLERY PLATE PROVES ITSELF — NO COUNT FORMULA CAN DO THIS

Client: *"you can clearly see the Hornchurch project didn't need a logo because the collage was
already full. Only where there's a gap because of a lack of a single image. Don't just force it
into every project."*

⭐⭐⭐ **`(c − n mod c) mod c` ASSUMES A UNIFORM GRID AND THE GALLERY IS `column-count:3`, WHICH
BALANCES.** Central London (13 photographs) and Hornchurch (7) both compute as "two slots short"
and look nothing alike, because raggedness depends on the HEIGHTS of the pictures.

⭐⭐ **SO IT IS MEASURED AFTER LAYOUT:** group tiles by `offsetLeft` to find the real columns, take
each column's lowest edge, render both ways, **keep the plate only if it shrinks the spread.**

| Project | Photos | Plate | Raggedness |
|---|---|---|---|
| Wimbledon | 11 | **KEPT** | 1px |
| Central London | 13 | **KEPT** | 15px |
| Harlow | 14 | **KEPT** | 1px |
| Watford / Rickmansworth / Ruislip / Harrow | 18 / 15 / 6 / 2 | none | already level |
| **Hornchurch** | 7 | **removes its own** | the plate would have left **73px** |

⭐ `brand:true` is on all eight on purpose — the flag now means "offer a plate" and the measurement
decides. ⚠️ `offsetTop`/`offsetHeight`, never rects: these tiles carry `.glow-card`.

---

## 3. ⭐ WHAT ELSE MOVED THIS ROUND

| # | Thing |
|---|---|
| **D246** | The enquiry card is **"Get in touch with Topcat"**, and its routes are landline → WhatsApp → email. Hours out. |
| **D247** | His two photographs: the drawings on **Design & Quote**, a kitchen mid-fit in the collage. |
| **D248** | Both numbers gold, all three routes on one line — **he was reading a 2px error**. |
| **D249** | The compare picker closes with a **chevron, not an ×**. |
| **D250** | The closing CTA band is a **card, on all 176 pages** — and the old one broke §2 rule 10. |
| **D251** | The slab's top edge **is the stone's name** on all 132 pages; compare moved under the slab. |
| **D252** | Four faceless photographs (§0 for what they cost). |
| **D253** | The collage's wide tile is the **Harrow island**. |

- ⛔⛔⛔ **D250 FOUND A LIVE RULE BREAK ON 176 PAGES:** `.cta-band` carried `border-top:1px solid
  var(--hair)` — **a gold line across the top of a section**, which is the "fingernail" rule,
  everywhere, since it was written. **The full 34% rim the card now carries is the allowed
  alternative; the rule forbids a top BAND, not a border.**
- ⭐⭐ **D251's FIX IS STRUCTURAL, NOT AN OFFSET.** `align-items:center` meant the slab was centred
  against a column whose height is the description, so **no two of the 132 pages agreed**. The
  kicker is its own grid item now, so the slab and the `<h1>` both start on row 2. Measured on
  five stones: **0.00px** every time. ⛔ A `margin-top` of "about 30px" would have drifted.
- ⭐ **D248 IS THE ONE WORTH REMEMBERING ABOUT HIM:** he spotted, on a phone, that one row's text
  started at 70.00px where the other two started at 72.00. **The cause was my own fix from the
  message before** — shrinking an icon's BOX to correct its optical size dragged the text with it.
  ⛔ **When an icon must look smaller, shrink the DRAWING (its `viewBox`), never the box.**

---

## 4. ⛔ THREE DEVICE BANDS — AND THE DESKTOP IS STILL THE ONE IN SCOPE

```
   ≤ 720px          721 – 1120px          ≥ 1121px
   the phone   ·   the tablet        ·   the desktop
   FROZEN          FROZEN                HE IS WORKING HERE
```

⚠️ **THIS ROUND CROSSED THE BANDS CONSTANTLY AND ALL OF IT WAS ASKED FOR** — the enquiry card, the
CTA band, the stone pages and the plates are all shared components. ⛔ It does not generalise; the
next mobile-only change needs its own instruction.
⭐⭐ **THE MECHANISM GOES TO BASE SCOPE AND ONLY THE NUMBERS LIVE IN THE BAND BLOCKS.**
⛔ **THE TABLET-ONLY BLOCK IS THE LAST THING IN THE STYLESHEET.** Search `THE TABLET BAND`.
⚠️ Base scope IS the desktop — **check what the frozen bands were silently inheriting before you
touch a base rule.**

### ⚠️⚠️ TWO BOUNDARIES THAT ARE NOT THE ONES YOU EXPECT

- ⛔ **THE TILE SCRIM'S QUERY IS `max-width:600px`, NOT THE SITE'S 720px PHONE BAND.**
- ⚠️ **THE 13 Aug "FULL BRIGHTNESS" FIX ONLY EVER APPLIED BELOW 600px.** The tablet's tiles still
  carry `.face.front .stone{opacity:0.5}`. **Told him; his call, and it is one line.**

---

## 5. ⭐⭐ EVERYTHING IS PUSHED — AND STOP ASKING HIM

⛔⛔ **DO NOT ASK HIS PERMISSION TO PUSH, OR TO DO ANYTHING ELSE HE HAS ALREADY ASKED FOR.**
*"Why do you keep asking my fucking permission for stuff? I have it on bypass permissions."*

Branch **`tablet-round-d197-d200`**, working tree clean, **level with the remote**.

| Commit | What |
|---|---|
| `5d3d80c` | D257 the plate stone is Calacatta Gold Soft, darker wash |
| `d116454` | D257/D258 white plates, gold rims, the plate proves itself |
| `38596a6` | D256 every plate is cut stone with the mark inlaid |
| `ad064b0` | D255 the big collage tile is a Topcat plate |
| `f04019f` | the corrected credit figure |
| `cbd8316` | D254 the quarry (⛔ reversed an hour later) |
| `18931b2` | D253 the Harrow island |
| `df86f1f` | D252 four faceless photographs |
| `65f4dad` | D251 the slab starts on the stone's name |
| `dc15376` | D250 the CTA band is a card |
| `961dcaf` | D249 the compare chevron |
| `8993dd4` | D248 both numbers gold, one line |
| `b0bf28c` | D246/D247 the enquiry card, and two of his photographs |

⛔ **`gh` IS NOT INSTALLED**, so the PR cannot be opened from here: `brew install gh` once, or
https://github.com/ThadGC/topcatwork/pull/new/tablet-round-d197-d200

---

## 6. ⭐ THE LINK, AND THE HOST QUESTION HE HAS STILL NOT ANSWERED

```bash
cd "Website Demo" && nohup caffeinate -ims node dev-server.js > /tmp/topcat-server.log 2>&1 &
```

**Give him `http://192.168.1.102:5501`** — re-check with `ipconfig getifaddr en0`.
⭐ **THE SERVER IS DETACHED ON PURPOSE — PID 5158, untouched for six days.**
⛔ Do not `preview_stop` it and do not kill it to restart.
⭐ **USE `http://localhost:5501` IN THE PREVIEW PANE**, on his instruction.

### ⚠️ HE REVIEWS ON `thadeusg3.sg-host.com`

**We still do not know how files get there. Asked seven times.** ⚠️ **He has now said a DEVELOPER
uploads the build**, which is the first real answer — but not the mechanism. ⛔ Until it is
answered, anything built may be invisible to him and he will report bugs already fixed.

---

## 7. ⛔ THE GATES — RUN THESE

```bash
cd "Website Demo/stones" && python3 harvest/verify.py          # 132/132/132 ✅
cd "Website Demo" && python3 build_pages.py                     # after ANY index.html change
cd "Website Demo/services" && python3 build_services.py         # after a service page change
cd "Website Demo" && python3 build_seo_pages.py                 # after a SERVICE_PAGES/APPLICATIONS change
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
| document height | **14731** ⚠️ was 14833; D266 removed the brand marquee |
| elements | **2664** ⚠️ was 2692; D260 added 4, D266 removed 32 |
| `#svcNav` children | **8** |
| broken images | 0 |
| horizontal overflow | none |

⚠️ **MEASURE ON A FRESH LOAD AT THE TARGET WIDTH.** ⚠️ **FILTER BROKEN IMAGES ON `i.src && …`** —
`#pmShot` is an `<img>` with no `src` at all.

---

## 8. ⚠️ THE IMAGE PIPELINE IS HAND-DRIVEN, AND GENERATION IS NOW CAPPED AT 2 CREDITS

⛔⛔ **`build_images.py` AND `patch_images.py` ARE BOTH ONE-SHOT AND CAN NO LONGER RUN.**

⭐ **THE ROUTE FOR THE NEXT PHOTOGRAPH:**

1. ⛔ **LOOK ON DISK FIRST** — `assets/projects/` (107), `assets/slabs/` (264), `assets/site/`.
2. Crop with the target boxes measured first — **every slot is at least two different shapes**.
3. Cut rungs with the pipeline's own rules: **LANCZOS, WebP q85, method 6**, clamped to the native
   width. ⛔ **Never upscale to make a table look tidy** — `process-install-hands` tops out at 1516.
4. Register the ladder by hand in **`SS`**, keyed on the exact `.img` URL the record carries.
5. `build_pages.py`, then the gates.

⛔⛔⛔ **IF YOU GENERATE: 2 CREDITS MAXIMUM PER IMAGE, HIS EXPLICIT CEILING. CHECK `balance` BEFORE
AND AFTER THE FIRST ONE AND STOP IF IT DOES NOT MATCH.** `soul_2` is ~12.7 and is therefore OUT.

---

## 9. ⭐ WHERE THINGS STAND

| Page | State |
|---|---|
| **`/`** | ⭐⭐ enquiry card is "Get in touch with Topcat", process tiles all faceless, About collage is **plate + his kitchen fit + slab + Harrow island** with gold rims |
| **`/services/`** | NINE leaf pages, all closing on the new card |
| **`/stones/`** | 132 pages, slab aligned to the name, compare under the slab; compare closes with a chevron |
| **`/projects/`** | plates in Wimbledon, Central London and Harlow only |
| **`/trade/`** | eight sections, "Trade with Topcat" ⚠️ its own CTA still shows hours and no WhatsApp |
| **`/estimate/` `/about/` `/contact/`** | as before, new closing card |
| `/materials/` `/guides/` `/worktops/` `/sitemap.html` | the SEO layer, new closing card |

⚠️ **THREE SHARED PHOTOGRAPHS ARE STILL LIVE AND MUST NOT BE DELETED**: `hero-kitchen.jpg`,
`kitchen-day.jpg`, `cta-slab.jpg`.

---

## 10. ⛔ RULES THAT MUST NOT BE BROKEN

1. ⛔ **Fabrication is IN-HOUSE (D202).** "Our experienced fabricators." It has flipped three times.
2. ⛔ **Never "laser" anything.** They template **by hand**.
3. ⛔ **The brand is "Topcat", one word.**
4. ⛔ **A stone's NAME and PHOTOGRAPH must match the supplier's own.**
5. ⛔ **Never state what we cannot guarantee, and never use an absolute.** ⭐ **A seam is always
   visible.**
6. ⛔ **Every measurement in millimetres.**
7. ⛔ **Never a bright or gold line across the TOP of a card or section.** ⚠️ A full 34% gold
   BORDER is fine and is the site's standard — **D250 found this broken on 176 pages.**
8. **No showroom of our own. Never show the review count. Value, not cheap.**
9. **Voice:** quietly confident master. British English, commas not em dashes, no exclamation marks.
   ⭐⭐ **NO AI SLOP** and **no jargon**.
10. ⛔ **The logo is the client's artwork, is never re-drawn, and is never generated. Set HEIGHT
    only.** ⚠️ **§1 is the newest place this bit.**
11. ⛔ **ONE DEVICE AT A TIME. Only the client unfreezes a band.** ⭐ **The DESKTOP is in scope.**
12. ⭐⭐ **THIS IS A DESIGN BUILD. NEVER RAISE THE MISSING FORM BACKEND AS A BLOCKER.**
13. ⛔⛔ **2 CREDITS MAXIMUM PER GENERATED IMAGE.** §0.

---

## 11. ⚠️⚠️ HOW TO MEASURE — THE PART THAT EARNED ITS PLACE

- ⛔⛔⛔ **PRINT THE COMPUTED VALUE BEFORE YOU CHANGE THE DECLARATION (D207).**
- ⛔⛔⛔ **AND LOOK AT IT AFTERWARDS.** §0 — a number that passes is not a picture that works.
- ⛔⛔ **MEASURE LAYOUT WITH LAYOUT PROPERTIES.** `getBoundingClientRect()` on anything carrying
  `.rise`, `.glow-card` or a 3D hinge lies. A collage rect mid-build reported the lockup at ratio
  **11.0** when it is **1.066**. `offsetTop`/`offsetWidth` ignore transforms (D221/D230/D243).
- ⛔⛔ **MEASURE THE DRAWN ARTWORK, NOT THE BOX**, on anything with `object-fit` (§1).
- ⛔⛔ **CONTRAST IS MEASURED BY COMPOSITING, NOT BY LOOKING** — and **thresholds are measured per
  image against that image's own content**: the shirt piping ran r/g up to 32 where the reddest
  skin in the same frame reached 2.78, and a global threshold wrecked the arms.
- ⛔ **`img.currentSrc` LIES ONCE YOU HAVE BROWSED THE SITE.** A throwaway `?q=` probe is the only
  honest test of which rung a band actually takes.
- ⛔ **CONFIRM THE RUNNING DOCUMENT IS THE FILE YOU JUST WROTE** before believing a negative (D222).

### The environment traps (all still live)

- ⛔⛔⛔ **A STRAY `*/` SILENTLY DELETES THE NEXT CSS RULE.** The §7 gate catches it.
- ⛔⛔ **THE PANE FREEZES ANIMATIONS AT ZERO when `document.visibilityState === 'hidden'`**, and
  **a screenshot does not always wake it.** ⭐ **OPENING A NEW TAB DOES** — that is what worked.
- ⛔⛔ **THE PANE'S SCREENSHOT OFTEN DOES NOT TRACK A SCRIPTED `scrollTo`**, and sometimes renders a
  stale or partial frame. ⭐ **Judge desktop at 1141–1200; the pane renders those cleanly.**
- ⛔ **CONSOLE ERRORS FROM `javascript_tool` ARE YOUR OWN PROBE WRAPPERS, NOT THE PAGE.**
- ⛔⛔ **`service.css` AND `stone.css` ARE NOT CONTENT-HASHED** — a reload can serve the previous
  edit. ⭐ `fetch(url,{cache:'reload'})` then reload. **Still open.**
- ⛔ **`javascript_tool` TIMES OUT AT 30s.** A long promise chain returns "Promise was collected".
- ⛔ **NO SVG RASTERISER ON THIS MACHINE** — no ImageMagick, no cairosvg, no rsvg, and `qlmanage`
  flattens and crops. ⭐ **The Topcat icon is pure `M/L/H/V/Z`, so it can be parsed and filled in
  Python exactly** (§1). ⚠️ Base64 through the tool boundary corrupts; do not try it.
- ⛔ **AN INVENTED DATA VALUE CAN BLANK THE WHOLE SITE.** Valid presets: calacatta, carrara, crema,
  emperador, eternal, fumo, goldveil, mist, nerogold, statuario.

---

## 12. OPEN — DO THESE NEXT

### ⭐⭐ Waiting on him

1. ⭐⭐ **HOW DO FILES GET TO `thadeusg3.sg-host.com`?** Asked seven times. ⭐ **A developer uploads
   the build** — that is new. **Get the mechanism.**
2. ⭐⭐ **WHAT IS THE CREDIT CEILING NOW?** The 100 in §13 no longer reflects reality. **Ask.**
3. ⭐⭐ **CLOSE THE CALACATTA GOLD LICENSING QUESTION** — it is now on the landing page and in three
   galleries (§1).
4. ⭐⭐ **THE TABLET'S TILES ARE STILL AT HALF BRIGHTNESS** (§4). One line.
5. ⭐ **THE SERVICE HERO VEIL DIMS ALL EIGHT PHOTOGRAPHS.** Shared by ~166 pages. Told him 4 times.
6. ⭐⭐ **TRADE TERMS.** Payment, minimum order, lead times, a dedicated contact. **His stated first
   priority.** ⚠️ **The trade page's own CTA still carries hours and no WhatsApp** — the one block
   D246 deliberately did not touch.
7. ⭐⭐ **THE FIREPLACE SCOPE, WITH NICK.**
8. ⭐⭐ **ALI JAFFER AND KAV / UXBRIDGE** — two Drive folders that match no project.
9. ⭐ **THE 19 DRONE VIDEOS** in the Hornchurch and Rickmansworth folders.
10. ⭐ **CONFIRM THE SILICA / HSE SENTENCE** in his own words (D202).
11. ⭐ **KITCHEN ISLANDS** — not on his service list; page still live and still linked.
12. ⭐ **TRUSTPILOT** — recommended AGAINST putting 4.0 beside the Google 5.0. **He has not ruled.**
13. ⭐ **THE HORNCHURCH DUPLICATE** — `-g1` and `-g9` are the same nook. **His call.**

### ⭐ Ready to build

14. ⭐⭐ **THE TWO DIRECTOR PLATES ARE STILL EMPTY** (Nick, Rimsha) — the last placeholders in the
    About collage, and the only AI stand-in left beside them is `w3`, the slab being carried.
    ⛔ **He has said three times: generate nothing.**
15. ⭐ **`/services/kitchen-islands.html`** is the one leaf page still on a shared stock hero.
16. ⭐ **THE SITE HAS NO FAVICON AT ALL** — every browser requests `/favicon.ico` and gets a 404.
17. ⭐ **CONTENT-HASH `service.css` AND `stone.css`** — §11, and it will bite him on his phone.
18. ⚠️ **THE GENERATED PAGES SHIP THEIR CODE COMMENTS TO VIEW-SOURCE**, including his own quotes.
19. ⚠️ **THE HORNCHURCH CARD PHOTO** shows a garden with what looks like a child on play equipment.
20. ⭐ **THE `<title>` STILL SAYS "London & the Home Counties"** — he changed the hero, not the
    title, and the title is a search asset.
21. ⚠️ **~166 LEAF PAGES' META DESCRIPTIONS STILL NAME FOUR COUNTIES**, not eight.
22. ⚠️ **THE SPLASHBACK PHOTOGRAPH'S SOCKETS ARE NOT UK PATTERN.**
23. ⭐ Pick a production host; brotli and long-lived cache headers.
24. ⚠️ **IS IT RIMSHA OR REMSHA?** A real person's name on a public page.
25. ⭐ **FACEBOOK, TIKTOK, YOUTUBE?** ⛔ Do not guess handles.

**Still waiting on the client:** whether Quartzite becomes a fourth range, 20mm vs 30mm pricing,
brackets for vanity tops / fireplaces / tables, and the £3k vs £3,850 three-slab discrepancy.

---

## 13. ⭐ HOW THIS CLIENT WORKS

⛔⛔⛔ **DO NOT ARGUE YOURSELF OUT OF SOMETHING HE ASKED FOR, AND DO NOT HAND HIM THE DILEMMA
EITHER.** **A real constraint is a problem to solve, not a question to return.**

⛔⛔ **AND DO NOT ASK HIS PERMISSION.** Commit, push, report. See §5.

⭐⭐ **HE SENDS CORRECTIONS MID-TURN, OFTEN THREE OR FOUR DEEP.** This round had eight. **Finish the
one you are on, then take the next in his order** — and if a later message reverses an earlier one,
say so in the report rather than quietly dropping the first.

⚠️⚠️ **HE REVERSES HIMSELF FREELY AND FAST — AND THAT IS FINE. LOG IT.** ⛔ **Write the reversal
into §D WITH THE REASON THE OLD DECISION EXISTED.** D254 lasted about ten minutes.

⭐⭐ **HE CORRECTS THE DIAGNOSIS, NOT JUST THE DESIGN, AND HE IS USUALLY RIGHT.** *"Why is it not
lined up on mobile?"* was a 2px error. *"The Hornchurch project didn't need a logo"* was a wrong
algorithm. **Take the complaint literally and go and measure the thing he named.**

⚠️ **HE SWEARS WHEN SOMETHING LOOKS WRONG, AND THE COMPLAINT IS ALWAYS REAL.** Find it, name the
actual cause, fix it, say what it was.

⭐⭐ **WHEN YOUR OWN WORK CAUSED THE NEXT FAULT, SAY SO IN THE FIRST LINE.** D248 exists because
D246 broke it; D258 exists because D257 broke it. He is fine with that and not fine with spin.

- **Walk the journey, do not check the page.**
- ⭐⭐ **LOOK AT THE RESULT BEFORE REPORTING IT DONE.** §0.
- **Measure, then claim.** ⚠️ **And if you could not measure it, say so.**

---

## 14. BUDGET AND THE DOCUMENT SET

- ⛔⛔ **THE 100-CREDIT CEILING IN THE OLD DOC IS OBSOLETE.** This round spent **101.46** on its own.
  ⭐ **His standing instruction is now 2 credits maximum per image.** ⭐⭐ **Ask him where the budget
  actually stands before generating anything.**

| File | What it is |
|---|---|
| **`HANDOVER.md`** | ⭐ The single current state. §D is the register, **D1–D130 and D132–D268**. §2 the standing rules, §2a the supplier list. ⚠️ **THERE IS NO D131 ROW** |
| **`Website Demo/index.html`** | ⭐⭐ The whole design — inline `<style>` and `<script>`. Search `THE TABLET BAND`, `const SERVICES`, `const SS`, `--plateStone`, `ac-plate`, `proj-brand`, `about-collage` |
| **`Website Demo/build_pages.py`** | ⭐⭐ Builds the seven internal pages and the shared assets. **Owns `/trade/index.html`.** |
| **`Website Demo/services/build_services.py`** | ⭐ The nine service leaf pages and `HERO_IMG` |
| **`Website Demo/build_seo_pages.py`** | ⭐ The 26-page SEO layer, the sitemap, `APPLICATIONS`, and `gold_last()` |
| **`Website Demo/services/service.css`** | ⭐⭐ **The shared sheet EVERY generated page links — 176 of them.** `.cta-band` lives here |
| ⛔ **`Website Demo/trade/build_trade.py`** | ⛔⛔ **SUPERSEDED — DO NOT RUN** |
| ⛔ **`build_images.py` `patch_images.py`** | ⛔⛔ **ONE-SHOT, CANNOT RUN AGAIN** — see §8 |
| `Website Demo/assets/site.css` `site.js` | ⛔ **GENERATED. Never edit.** |
| **`Website Demo/assets/site/`** | ⭐ The service photographs and their ladders, **`plate-stone-700.webp`** (Calacatta Gold Soft), and this round's four generated files |
| **`Website Demo/assets/slabs/`** | ⭐ **264 slab photographs — where the plate stone came from, and the first place to look** |
| **`Website Demo/assets/projects/`** | ⭐ **107 WebP files — the client's real portfolio** |
| **`Website Demo/assets/brand/`** | ⭐ The client's own artwork. ⛔ **Never re-drawn, never generated** |
| `Website Demo/stones/build_stones.py` | Builds the collection, compare.html and 132 stone pages |
| `Website Demo/stones/harvest/verify.py` | ⭐ The nine-check gate |
| `Docs/topcat-worktops-SEO-LOG.md` | Every URL, title, target query and SEO change |
| `HANDOVER-2026-08-15-photography-round-start-here.md` | ⭐ **The START HERE this file replaces** (D241–D245) |
| `HANDOVER-archive-to-2026-08-06.md` | ⚠️ **Every design the client rejected, in his words.** Read before redesigning anything |

⚠️ **Section numbers in `HANDOVER.md` are referenced from code comments** (`§3`, `§4`, `§5a`, `§6.7`,
`§7.5` are live in `index.html`). **Do not renumber.**
