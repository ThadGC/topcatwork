# START HERE — 14 August 2026, after the DRIVE PHOTOGRAPHY AND BROKEN-ANIMATION ROUND (D214–D226)

Read this, then `HANDOVER.md` **§D** (the register, newest first — this round is **D214–D226**) and
**§2** (the standing rules). That is about twenty minutes and it is enough to work safely.

> ⚠️ **This replaces the previous version of this same file**, which covered the client's notes
> round (D201–D213) and is now `HANDOVER-2026-08-14-client-notes-round-start-here.md`. Everything
> in it that still matters is carried below.

---

## 0. ⛔⛔ WHAT THIS ROUND WAS: HIS PHOTOGRAPHS, AND FOUR THINGS THAT WERE SIMPLY BROKEN

He sent a Google Drive folder and then **eleven more asks across six messages**, five of them
mid-build. **Four separate faults were found, and only one of them was introduced this round.**

| # | It looked like | It actually was | Where |
|---|---|---|---|
| 1 | The hero slideshow "pausing on black" | `gallery` became `[url,w,h]` in D212 and `startHero()` was never told — **four of five slides painted nothing** | D216 |
| 2 | The desktop accordion "sometimes broken until I refresh" | `measure()` only ever re-ran on a window `resize` | D222 |
| 3 | The helix's top and bottom cards "not turned backwards" | The eighth service changed the per-step yaw from 54° to 40.5°, so **no card ever passed 90°** | D226 |
| 3b | ⛔ **The same helix, rejected a second time** | D226 fixed the yaw and left the SPIRAL's `360/N` alone, on its own written reassurance. The poles turned but landed **15% too far out, a third as deep, 11% too big and 20% too bright** | ⭐ **D227** |
| 4 | "A black bar at the bottom" of the project hero | A radial gradient **taller than its own box**, clipped flat top and bottom | D220 |

⭐⭐ **NONE OF THESE WERE VISIBLE IN THE CODE ON A READ-THROUGH.** Every one needed a measurement.
See §9 — that section is the real value of this document.

---

## 1. ⭐⭐ THE CLIENT'S REAL PHOTOGRAPHY IS IN, AND PROJECT EIGHT IS REAL

**53 photographs pulled from his own Google Drive** (D214), plus **The Wimbledon Project** as the
eighth (D215). `assets/projects/` is now **107 files, 7.1MB**.

| Project | Tiles | Review | Story |
|---|---|---|---|
| The Ruislip Project | 6 | — | ✅ |
| The Central London Project | 13 | ⭐ **Joel Brizman** | — |
| The Hornchurch Project | 8 | — | ✅ |
| The Harrow Project | 2 | — | — |
| The Harlow Project | 15 | — | — |
| The Rickmansworth Project | 16 | — | — |
| The Watford Project | 18 | — | — |
| ⭐ **The Wimbledon Project** | 11 | ⭐ **Kinga Skubiszewska** | ✅ |

⛔ **RUISLIP IS UNTOUCHED ON HIS INSTRUCTION** — *"ignore the Ruislip project and just keep it as
is."*

### ⭐ How to pull a shared Drive folder (it will be needed again)

```
https://drive.google.com/embeddedfolderview?id=<ID>#list   → plain HTML list of children + file ids
https://drive.google.com/uc?export=download&id=<ID>        → the ORIGINAL bytes
```

⛔⛔ **NEVER BUILD FROM `thumbnail?id=…&sz=…`** — it serves a downscaled copy, and building a
gallery from previews is D212's blur in a new costume. **Thumbnails are for triage only.**
⭐⭐ **THE TRIAGE METHOD IS THE REUSABLE PART.** 131 candidates is too many to judge one by one:
tile them into labelled contact sheets **and** score each for focus (variance of a Laplacian), then
choose on both — the eye for composition, the number for sharpness. Twelve of Watford's 63 survived.
⚠️ `Copy of DSC0…` and `DSC0…` are **the same file twice** in his Watford folder.
⚠️ **EXIF ORIENTATION MATTERS**: his Sony files are landscape on the sensor and portrait on the
flag. `ImageOps.exif_transpose` before resizing, then **look at the result** — do not assume.

⛔⛔ **TWO OF HIS SITE'S OWN HORNCHURCH PHOTOGRAPHS WERE DROPPED** — a slab on a trolley in a dusty
workshop, and a half-built room with a stepladder and a mitre saw. **Both files are still on disk**;
their paths are simply not in the array. One line each restores them.

### ⚠️⚠️ TWO DRIVE FOLDERS MATCH NO PROJECT AND WERE NOT GUESSED AT

- **`Ali Jaffer Project`** — a review screenshot and **no photographs**.
- **`Kav project - Uxbridge`** — **completely empty**.

**Both men's reviews are already live in `REVIEWS`**, so nothing is lost. Neither is a project on
this site, and inventing a location for one would be inventing a job. **Asked; not answered.**

---

## 2. ⛔ THE PROJECT DETAIL VIEW — REBUILT THIS ROUND, AND HE REVERSED HIMSELF TWICE IN IT

- **The hero copy is centred on BOTH axes** — 0px from each centre line on all eight (D220).
- **The cue is a bare arrow**, directly under the title at **the eyebrow's own spacing**, sharing
  one `--heroGap` token, with a matching shadow (D221).
- ⛔ **NO PANEL AND NO BAR BEHIND THE WORDS.** The words are carried by a `text-shadow` led by a
  centred `0 0` blur, so the rim sits on all four sides of the letterform (D220/D221).
- **The nav bar stays visible on a project page** — the whole nav stack moves (sheet 121, bar 122,
  burger 123), the lightbox still covers it at 130, and a nav click closes the overlay first (D218).
- **A project can carry its customer's Google review**, beside the description (D219).

⛔⛔ **THE REVIEW TEXT IS NOT STORED ON THE PROJECT. `reviewBy` HOLDS A NAME AND THE WORDS ARE
LOOKED UP IN `REVIEWS` AT RENDER TIME.** That is D168: a review deleted from `REVIEWS` but left in a
second array still ships to every visitor and still sits in view-source on a **public** repo.
⚠️ His Drive screenshots are Google's own **collapsed** cards ("… More"). The full text was already
in `REVIEWS`. **The site's own array is the better source than his screenshot.**

---

## 3. ⛔ THREE DEVICE BANDS — UNCHANGED, STILL THE FIRST THING TO GET RIGHT

```
   ≤ 720px          721 – 1120px          ≥ 1121px
   the phone   ·   the tablet        ·   the desktop
```

⭐⭐ **"THE TABLET IS THE MOBILE BUILD, BIGGER" IS DONE BY WIDENING THE PHONE RULE'S OWN QUERY —
NEVER BY WRITING THE RULE AGAIN.**
⭐ **CHECK BEFORE YOU MOVE ANYTHING: the hero's whole chip block was ALREADY widened to
`@media(max-width:1120px)` in the tablet round**, so this round's new bubbles reached the tablet by
themselves. ⚠️ Its inner comment still said *"Phone only; the hero above 720px is frozen"* — **a
stale comment inside a widened block.** Corrected. Expect more of these.
⛔ **THE TABLET-ONLY BLOCK IS THE LAST THING IN THE STYLESHEET.** Search `THE TABLET BAND`.

---

## 4. ⭐⭐ EVERYTHING IS PUSHED — AND STOP ASKING HIM

⛔⛔ **DO NOT ASK HIS PERMISSION TO PUSH, OR TO DO ANYTHING ELSE HE HAS ALREADY ASKED FOR.**
14 Aug 2026: *"Why do you keep asking my fucking permission for stuff? I have it on bypass
permissions."* Fourteen commits had been queued across several rounds because every session asked
first. **Do the work, commit it, push it, and report what was done.** Ask only about things only he
can answer — a business fact, a copy decision, a photograph he has to supply.

Branch **`tablet-round-d197-d200`**, working tree clean, **level with
`origin/tablet-round-d197-d200`**. The table below is the history that was queued and is now up.

| Commit | What |
|---|---|
| ⭐ *(this round)* | **D227 the helix's arc step — the fix D226 got half right** |
| `e4f1692` | D226 the helix's poles |
| `2aea04c` | D225 the rating order, desktop Google chip |
| `2122cbb` | D221–D224 accordion geometry, names, hero reasons |
| `19c3670` | D220 the hero copy in the middle |
| `2f4bbba` | D214–D219 the Drive photography and project eight |
| `a995caf` … `3896080` | D201–D213, the client's notes round |

⛔ **`gh` IS NOT INSTALLED**, so the PR cannot be opened from here: `brew install gh` once, or
https://github.com/ThadGC/topcatwork/pull/new/tablet-round-d197-d200

---

## 5. ⭐ THE LINK, AND THE HOST QUESTION HE HAS STILL NOT ANSWERED

```bash
cd "Website Demo" && nohup caffeinate -ims node dev-server.js > /tmp/topcat-server.log 2>&1 &
```

**Give him `http://192.168.1.102:5501`** — re-check with `ipconfig getifaddr en0`.
⭐ **THE SERVER IS DETACHED ON PURPOSE — PID 5158, untouched for two days and ten rounds.**
⛔ Do not `preview_stop` it and do not kill it to restart.

### ⚠️ HE REVIEWS ON `thadeusg3.sg-host.com`

**We still do not know how files get there. Asked four times.** ⛔ Until it is answered, anything
built may be invisible to him and he will report bugs already fixed.

---

## 6. ⛔ THE GATES — RUN THESE

```bash
cd "Website Demo/stones" && python3 harvest/verify.py          # 132/132/132 ✅
cd "Website Demo" && python3 build_pages.py                     # after ANY index.html change
```

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

⭐ **AND CHECK THE JS PARSES** — this round added a `ResizeObserver` and an `async` function to the
inline script:

```bash
cd "Website Demo" && python3 -c "
import re,subprocess,tempfile
s=open('index.html',encoding='utf-8').read()
js=re.search(r'\n<script>\n(.*?)\n</script>',s,re.S).group(1)
p=tempfile.mktemp(suffix='.js'); open(p,'w').write(js)
print(subprocess.run(['node','--check',p],capture_output=True,text=True).stderr or 'JS OK')"
```

### ⭐ THE FREEZE PROBE — THESE NUMBERS ARE THE PROOF

| Signal | 375×812 | 1440×900 |
|---|---|---|
| `.gal-scroll` height | — | **4950** |
| `--revPer` (on `section.mode-grid`) | — | **3** |
| `feTurbulence` | 0 | **60** |
| document height | — | **14833** |
| broken images | 0 | 0 |
| horizontal overflow | none | none |

⚠️ **MEASURE THESE ON A FRESH LOAD AT THE TARGET WIDTH.** Resizing the pane from a phone preset to
1440 without reloading leaves `.gal-scroll` at its static height (1648) and will look like a
regression that is not there.
⛔ **NOTHING SCROLL-DRIVEN CAN BE MEASURED IN AN OFF-SCREEN IFRAME.** Test the desktop gallery in
the real pane. **It settles at 19–21 of 41 swept scroll positions — that is healthy, not a fault.**
A 13-point sweep can land entirely between the settle windows and report zero.

---

## 7. ⭐ WHERE THINGS STAND

| Page | State |
|---|---|
| **`/`** | hero chips, helix, gallery and projects all worked on this round |
| **`/services/`** | ⭐ seven leaf pages, eight tiles — Fireplaces and Dining Tables have no page yet |
| **`/projects/`** | ⭐⭐ **eight real projects, 89 photographs, reviews, all cards hit-tested clickable** |
| **`/estimate/` `/about/` `/contact/` `/trade/`** | as before |
| **`/stones/`** | the collection page |
| `/materials/` `/guides/` `/worktops/` `/sitemap.html` | the SEO layer |

⭐ **ALL SEVEN SHARE ONE STYLESHEET.** `build_pages.py` lifts `index.html`'s `<style>`/`<script>` to
`assets/site.css` / `site.js`. ⛔⛔ **TO CHANGE AN INTERNAL PAGE, EDIT `index.html` AND RE-RUN.
NEVER HAND-EDIT A GENERATED FILE.**

### The hero's fact row and bubbles, as of this round

- **Desktop** shows the three icon facts: *Your project, expertly handled · Every detail included ·
  **72 hours of aftercare*** (his wording, D224), all three headings **top-aligned** so they sit on
  one line. ⛔ `align-items:flex-start`, not `center` — centring three boxes of unequal content
  height drops the shortest one, which is what he saw.
- **Phone and tablet** show **four bubbles**: Google reviews · 10 year guarantee · 72-hour aftercare
  · Every detail included. ⛔ "Quick turnaround time" and "Your project expertly handled" are both
  **deliberately gone** (D224, D225) — do not restore either.
- **The Google chip is now identical at every width** (D225): the mark, "Google reviews", and
  **`5.0 ★★★★★` — score on the LEFT, stars on the right**, the score sitting under the G.
  ⛔ **D176 RECORDS THE OPPOSITE ORDER AND IS SUPERSEDED.**

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
7. ⛔ **Never a bright or gold line across the TOP of a card or section**, anywhere.
8. **No showroom of our own. Never show the review count. Value, not cheap.**
9. **Voice:** quietly confident master. British English, commas not em dashes, no exclamation marks.
   ⭐⭐ **AND NO BROCHURE VOICE (D213)** — no "showcases our expertise", no "bring your vision to
   life". **Just what was done.**
10. ⛔ **The logo is the client's artwork and is never re-drawn. Set HEIGHT only.**
11. ⛔ **ONE DEVICE AT A TIME. Only the client unfreezes a band.**
12. ⭐⭐ **THIS IS A DESIGN BUILD. NEVER RAISE THE MISSING FORM BACKEND AS A BLOCKER.**

---

## 9. ⚠️⚠️ HOW TO MEASURE — THE PART THAT EARNED ITS PLACE THIS ROUND

Every fault in §0 was invisible on a read-through. These are the specific ways to see them.

- ⛔⛔⛔ **AN EXPRESSION THAT CONTAINS `N` IS NOT AUTOMATICALLY CORRECT FOR EVERY `N`.** The helix's
  `(d*360/N)*0.9` was right at six services and wrong at eight, and D206's own comment said the
  geometry "absorbed six → seven → eight with no tuning" — **true of the positions, false of the
  wind.** A reassuring comment is not a proof.
  ⛔⛔⛔ **AND THAT INCLUDES THE COMMENT WRITTEN BY THE LAST FIX (D227).** D226 corrected the yaw
  and then wrote *"the SPIRAL still uses `360/N` for x/z/y and should"* about the half it had not
  tested. It should not have: **only five slots are ever visible, so `360/N` does not spread the
  picture over more cards, it reshapes those five.** The client rejected the fix on sight. **When
  one expression in a component turns out to be wrong for `N`, MEASURE EVERY OTHER ONE.**
- ⛔⛔ **`getComputedStyle` CANNOT SEE A ROTATION PAST 90°.** Recovering the angle from the matrix
  folds it into ±90°, so 108° reads as 72° and a fixed bug still looks broken.
  **Read `el.style.transform` — the authored string.**
- ⛔⛔ **MEASURE LAYOUT WITH LAYOUT PROPERTIES.** A `getBoundingClientRect()` on an element carrying
  a bob or a scrub includes the transform: the arrow's 18px gap read as 23px. **`offsetTop` ignores
  transforms.**
- ⛔⛔ **A GRADIENT THAT REACHES ITS BOX EDGE STILL CARRYING COLOUR DRAWS A HARD EDGE THERE.**
  A radial ellipse taller than its own box is clipped flat — that is the "black bar" he saw.
  **Feather to zero inside the box, or do not use one.**
- ⛔⛔ **A NEGATIVE RESULT FROM AN UNVERIFIED BUILD IS NOT A RESULT.** A probe reported the new
  `ResizeObserver` never firing; it was firing, and the page under test was loaded before the
  rebuild. **Confirm the running document is the file you just wrote** (`fetch` it and grep) before
  believing a "no".
- ⛔⛔ **A `.click()` IN A PROBE DOES NOT HIT-TEST.** Use `elementFromPoint` (D212).
- ⛔ **PRINT THE COMPUTED VALUE BEFORE YOU CHANGE THE DECLARATION** (D207) — a rule can be parsed,
  present, and losing.
- ⛔ **`measure()`-STYLE FUNCTIONS THAT ONLY RE-RUN ON `resize` ARE A BUG WAITING.** The gallery now
  has a `ResizeObserver` on its stage plus `load` and `fonts.ready`. **The helix and the reviews
  deck still measure on `resize` alone** — if either is ever reported as "sometimes wrong until I
  refresh", that is the first place to look.

### The environment traps (all still live)

- ⛔⛔⛔ **A STRAY `*/` SILENTLY DELETES THE NEXT CSS RULE.** The §6 gate catches it.
- ⛔⛔ **THE PANE FREEZES ANIMATIONS AT ZERO when `document.visibilityState === 'hidden'`.** Hit
  again this round: the whole hero read `opacity:0` and looked broken. **Check `visibilityState`
  first**, then `el.getAnimations().forEach(a=>a.finish())` to see the end state.
- ⛔⛔ **THE PANE'S NATIVE WIDTH IS ~420px.** DOM measurements at 1440 are correct, but
  **screenshots at 1440 render into a small corner and are unusable.** Judge desktop visually at
  **~1141–1200**, which is inside the desktop band and still renders.
- ⛔⛔ **THE PANE SILENTLY RESIZES ITSELF.** Read `innerWidth` in the same call as your measurements.
- ⛔⛔ **`service.css` AND `stone.css` ARE NOT CONTENT-HASHED** — a reload can serve the previous
  edit. **Still open.**
- ⛔ **`scroll-behavior:smooth` IS ON `<html>`** — every probe `scrollTo` animates unless
  `behavior:'instant'`.
- ⛔ **`javascript_tool` TIMES OUT AT 30s.** Split into ≤24s calls; a 41-point sweep needs two.
- ⛔ **`awk` DOES NOT UNDERSTAND `\s`.** Use `[ \t]`.
- ⛔ **AN INVENTED DATA VALUE CAN BLANK THE WHOLE SITE.** Valid presets: calacatta, carrara, crema,
  emperador, eternal, fumo, goldveil, mist, nerogold, statuario.
- ⛔ **THE RANGE IS ALPHABETICAL EVERYWHERE (D85). NO DARK STONE ON THE FIRST SCREEN (D86).**

---

## 10. OPEN — DO THESE NEXT

### ⭐⭐ Waiting on him

1. ⭐⭐ **HOW DO FILES GET TO `thadeusg3.sg-host.com`?** Asked four times. **Nothing else matters if
   he cannot see the work.**
2. ⭐⭐ **ALI JAFFER AND KAV / UXBRIDGE** — two Drive folders that match no project (§1). Are they
   projects nine and ten? He has photographs for neither.
3. ⭐ **THE 19 DRONE VIDEOS** in the Hornchurch and Rickmansworth folders. He said *"the videos
   rotating one after the other"* while describing the image slideshow, so **no video was put in
   the hero**. If he meant the real footage, that is a build.
4. ⭐ **THE TWO DROPPED HORNCHURCH PHOTOGRAPHS** (§1) — restore or leave.
5. ⭐ **CONFIRM THE SILICA / HSE SENTENCE** in his own words (D202). It is a health-and-safety claim.
6. ⭐ **KITCHEN ISLANDS** — not on his service list; page still live. Delete or keep?
7. ⭐ **TRUSTPILOT** — recommended AGAINST putting 4.0 beside the Google 5.0. **He has not ruled.**
8. ⭐ **TWO LIVE AI-TELLS, FLAGGED NOT CHANGED (D213):** the reviews CTA *"Let's bring your vision
   to life"* and the Why subtitle *"and ours is second to none"*.

### ⭐ Ready to build

9. ⭐ **FIREPLACES AND DINING TABLES HAVE NO LEAF PAGE.** Their tiles carry no `href` on purpose.
    ⚠️ Needs real detail from Nick — fireplace copy touches building regulations and rule 5 forbids
    inventing it.
10. ⭐ **PHOTOGRAPHY IS STILL THE BIGGEST REMAINING GAP.** ⛔ **He has said twice: generate nothing.**
    - **Three service tiles show the wrong subject** — Outdoor Spaces a quarry, Commercial a
      kitchen, Bathrooms a bare slab. He asked for the first two to be replaced.
    - **Three service tiles show "PHOTO TO COME"** — Fireplaces, Dining Tables, Vanity Tops.
    - **The director portraits and the Why feature shot are placeholders.**
11. ⭐ **THE SITE HAS NO FAVICON AT ALL** — every browser requests `/favicon.ico` and gets a 404.
    Found in the console this round. Small, but it is a go-live item.
12. ⭐ **CONTENT-HASH `service.css` AND `stone.css`** — §9, and it will bite him on his phone.
13. ⚠️ **THE HORNCHURCH PHOTO** showing a garden through bi-folds with what looks like a child on
    play equipment. Already public on his own site, but worth a look before go-live.
14. ⭐ **THE `<title>` STILL SAYS "London & the Home Counties"** — he changed the hero, not the
    title, and the title is a search asset.
15. ⚠️ **~166 LEAF PAGES' META DESCRIPTIONS STILL NAME FOUR COUNTIES**, not eight. Deliberately left.

### The rest

16. ⭐ Pick a production host; brotli and long-lived cache headers.
17. ⭐ Close the licensing question on Caesarstone, CRL and Bloom. ⛔ Classic Quartz Stone is off
    limits. ⭐ **Calacatta Gold is UNRESOLVED.**
18. ⚠️ **IS IT RIMSHA OR REMSHA?** A real person's name on a public page.
19. ⭐ **FACEBOOK, TIKTOK, YOUTUBE?** ⛔ Do not guess handles.

**Still waiting on the client:** whether Quartzite becomes a fourth range, 20mm vs 30mm pricing
(⚠️ the thickness toggle moves no number, which is correct until he rules), brackets for vanity tops
/ fireplaces / tables, and the £3k vs £3,850 three-slab discrepancy.

---

## 11. ⭐ HOW THIS CLIENT WORKS

⛔⛔⛔ **DO NOT ARGUE YOURSELF OUT OF SOMETHING HE ASKED FOR, AND DO NOT HAND HIM THE DILEMMA
EITHER.** **A real constraint is a problem to solve, not a question to return. If he names a thing,
build the thing.**

⛔⛔ **DO THE THING HE ASKED FOR, IN THE MESSAGE HE ASKED FOR IT.** He sends asks in runs and adds
more mid-build — **five separate mid-turn messages this round.** Do them in his order. **Say plainly
which you are dropping and why.**

⛔⛔⛔ **A REGISTER ROW IS A RECORD OF WHAT HE ASKED FOR ONCE. IT DOES NOT OUTRANK WHAT HE IS ASKING
FOR NOW.** This round's worst mistake: he described the Google chip, the description disagreed with
the page, and D176 was used to justify leaving it — **twice**. His reply began *"I have told you so
many times."* ⭐ **WHEN THE CLIENT DESCRIBES A THING AND THE PAGE DISAGREES WITH HIS DESCRIPTION,
THE PAGE IS WRONG.** A description IS an instruction.

⚠️⚠️ **HE REVERSES HIMSELF FREELY AND FAST — AND THAT IS FINE. LOG IT.** ⛔ **Write the reversal
into §D WITH THE REASON THE OLD DECISION EXISTED**, or the next session helpfully rebuilds the thing
he just rejected. ⭐ **D217 was reversed by D220 within the hour; D224's fifth bubble was removed by
D225 minutes after it shipped.**

⚠️ **HE CORRECTS THE DIAGNOSIS, NOT JUST THE DESIGN, AND HE IS USUALLY RIGHT.** Take the report as
data and **go and MEASURE.** "A long pause of just black" was four empty slides. "Sometimes broken"
was a measurement that never re-ran. "Turned backwards is broken" was 81° where 108° was needed.
"Not lined up" was an 8px drop from `align-items:center`.

⭐ **DELETE, DO NOT OVERRIDE, WHEN REVERTING.** Two competing descriptions of one element is how
D106, D113 and D114 each lost a rule. **Watch for it in your own edits** — this round produced two
duplicate `.chip-reason` rules and a duplicate `margin-bottom` and both had to be merged back.

⚠️ **HE SWEARS WHEN SOMETHING LOOKS WRONG, AND THE COMPLAINT IS ALWAYS REAL.** Do not get defensive
and do not over-apologise. Find it, name the actual cause, fix it, say what it was.

- **Walk the journey, do not check the page.**
- ⭐⭐ **LOOK AT THE RESULT BEFORE REPORTING IT DONE.**
- **Measure, then claim.** ⚠️ **And if you could not measure it, say so.**

---

## 12. BUDGET AND THE DOCUMENT SET

- **~82 credits** of the client's **100-credit ceiling** spent, about **18 left**. ⭐ **This round
  cost none** — no image generation, on his instruction. The 53 project images were **downloaded
  from his own Drive**, not generated.

| File | What it is |
|---|---|
| **`HANDOVER.md`** | ⭐ The single current state. §D is the register, **D1–D130 and D132–D226**. §2 the standing rules, §2a the supplier list. ⚠️ **THERE IS NO D131 ROW** |
| **`Website Demo/index.html`** | ⭐⭐ The whole design — inline `<style>` and `<script>`. Search `THE TABLET BAND`, `const PROJECTS`, `const SERVICES`, `const REVIEWS`, `YAW_STEP` |
| **`Website Demo/build_pages.py`** | ⭐⭐ Builds the six internal pages and the shared assets |
| `Website Demo/assets/site.css` `site.js` | ⛔ **GENERATED. Never edit.** |
| **`Website Demo/assets/projects/`** | ⭐ **107 WebP files, 7.1MB — the client's real portfolio.** `<key>-1400/-560` are cards, `<key>-gN` are the collage |
| `Website Demo/services/service.css` `stones/stone.css` | ⭐ Hand-maintained, shared by ~166 leaf pages. ⚠️ **NOT content-hashed** |
| **`Website Demo/index.html.pre-drive-photos.bak`** | ⭐ **This round's baseline** — before any of D214–D226 |
| `Website Demo/index.html.pre-client-notes.bak` | before D201–D213 |
| `Website Demo/index.html.pre-stone-sections.bak` | ⭐ **Holds the LIGHT STONE BANDS version (D161), which he rejected.** The only copy |
| `HANDOVER-2026-08-14-client-notes-round-start-here.md` | ⭐ **The START HERE this file replaces** (D201–D213) |
| `Website Demo/stones/build_stones.py` | Builds the collection, compare.html and 132 stone pages |
| `Website Demo/stones/harvest/verify.py` | ⭐ The nine-check gate |
| `Website Demo/dev-server.js` | Compression, caching, and the reload that keeps scroll position |
| `Docs/topcat-worktops-SEO-LOG.md` | Every URL, title, target query and SEO change |
| `HANDOVER-archive-to-2026-08-06.md` | ⚠️ **Every design the client rejected, in his words.** Read before redesigning anything |

⚠️ **Section numbers in `HANDOVER.md` are referenced from code comments** (`§3`, `§4`, `§5a`, `§6.7`,
`§7.5` are live in `index.html`). **Do not renumber.**
