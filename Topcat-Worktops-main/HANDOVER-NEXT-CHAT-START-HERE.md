# START HERE — 14 August 2026, after the CLIENT'S NOTES ROUND (D201–D213)

Read this, then `HANDOVER.md` **§D** (the register, newest first — this round is **D201–D213**) and
**§2** (the standing rules, especially **rules 1, 7, 9 and 16**, all of which MOVED this round).
That is about twenty minutes and it is enough to work safely.

> ⚠️ **This replaces the previous version of this same file**, which covered the tablet round
> (D197–D200) and is now `HANDOVER-2026-08-14-tablet-round-start-here.md`. Everything in it that
> still matters is carried below.

---

## 0. ⛔⛔⛔ FOUR RULES REVERSED IN ONE DAY. READ THIS BEFORE YOU WRITE A WORD OF COPY

The client sent a Word document of his own notes and then eleven more asks by voice. **He
overturned four things the whole site was built around.** If you work from memory of this project,
you will be working from the old rules.

| # | It used to be | It is now | Where |
|---|---|---|---|
| 1 | Fabrication is **OUTSOURCED**, never claim in-house | ⛔ **IN-HOUSE.** His words: **"by our experienced fabricators"** | D202 |
| 2 | The brand is **TopCat** | ⛔ **Topcat**, one word. 1,431 renames | D201 |
| 3 | Suppliers are **never named publicly** | ⚠️ He put **Next Stone Slabs** in the public brand marquee himself | D203 |
| 4 | Templating is **laser** | ⛔ **By hand.** The word "laser" is gone from 18 files | D203 |

⭐ Also: the service area is **eight counties**, not four. The range is **eight services**, not six.

⚠️⚠️ **FABRICATION HAS NOW FLIPPED THREE TIMES** — July in-house, 7 Aug outsourced, 14 Aug
in-house. **Read D202 before writing anything about who cuts the stone.** The §2 rule 1 scan is
obsolete and returns four files by design; do not "fix" them.

⚠️ **ONE THING HE SHOULD CONFIRM IN HIS OWN WORDS:** the silica FAQ now says *"we carry out our
fabrication in our own workshop… dust extraction and wet-cutting… current HSE guidance."* That is a
**health and safety claim**. It was built as he wrote it and flagged to him. It is the one sentence
here where being wrong is not a copy problem.

---

## 1. ⛔⛔ THE THREE BUGS THIS ROUND FOUND — AND HOW EACH ONE HID

### 1. ⛔⛔⛔ A SCRIPTED `.click()` NEVER HIT-TESTS, SO IT PASSES ON A DEAD BUTTON

**The project cards had never been clickable on a phone, or anywhere on `/projects/`.** `.gal-set`
is `pointer-events:none` by design; the cards get their events back from `.gal-set.settled`, **a
class only the pinned desktop accordion adds**. `.gal-static` turns that engine off, so the cards
sat there computing `pointer-events:none` (D212).

⭐⭐ **MY OWN TESTING PASSED EVERY TIME BECAUSE `card.click()` DISPATCHES STRAIGHT AT THE NODE.**
Only a real pointer goes through the compositor.

```js
const r = el.getBoundingClientRect();
const top = document.elementFromPoint(r.left+r.width/2, r.top+r.height/2);
top && el.contains(top)      // ← the only honest answer
```

⭐ **TEST A CLICK TARGET WITH `elementFromPoint`, NEVER WITH `.click()`.**

### 2. ⛔⛔ A RULE THAT IS PARSED, PRESENT, AND LOSING

The nav dropdown said `.nav-menu a{padding:9px 20px}` and **it had never once applied.** `nav.top a`
(0,1,2) sets `padding:8px 1px` and out-specifies `.nav-menu a` (0,1,1). Every item had been **one
pixel** from the panel border since the menu was built (D207).

⭐⭐ **IT LOOKS EXACTLY LIKE A TASTE PROBLEM AND IS A SPECIFICITY BUG.** The client saw it as
"doesn't look good"; the cause was a shorter selector further up the file.
⭐ **PRINT THE COMPUTED VALUE BEFORE YOU CHANGE THE DECLARATION.** This is D106/D113/D114/D197 for
the fifth time, and the fourth time it was a padding or display value.

### 3. ⛔⛔ THE BLUR WAS THE CROP, NOT THE FILE

Project photos looked soft. Every tile was forced to `aspect-ratio:3/2` — the wide ones to **21/9** —
and filled with `background-size:cover`. His photographs are **4672×7008 portraits**. A 21:9
letterbox out of a 3:4 portrait takes a thin strip and blows it up to 1180px on a 2× screen (D212).

⭐ **THE SOURCE WAS NEVER THE PROBLEM; THE SHAPE IT WAS POURED INTO WAS.** Now a `column-count`
masonry collage, 3 → 2 → 1, every photo at its own proportions. **Max scale factor 0.64 at 2× DPR** —
every file is still larger than the box it is drawn into.
⛔ **`<img>` WITH REAL `width`/`height`, NOT A BACKGROUND** — a background cannot declare an aspect
ratio, so the columns packed wrong and every tile jumped as the photos arrived.

---

## 2. ⭐⭐ THE CLIENT'S REAL PORTFOLIO IS IN — AND ONE CARD IS WAITING FOR HIM

Seven real installations scraped from **his own site**, `topcatworktops.co.uk/portfolio` (D211).

| # | Project | Location | Project type | Photos |
|---|---|---|---|---|
| 1 | The Ruislip Project | Ruislip, Hillingdon | Worktop, splashback, breakfast bar and arches | 7 |
| 2 | The Central London Project | London | Worktop | 7 |
| 3 | The Hornchurch Project | Essex | Worktop, island and splashbacks | 7 |
| 4 | The Harrow Project | Harrow | Worktop | 3 |
| 5 | The Harlow Project | Essex | Worktop and splashback | 7 |
| 6 | The Rickmansworth Project | Rickmansworth | Worktop and splashback | 7 |
| 7 | The Watford Project | Watford | Worktop and splashback | 7 |
| 8 | **Project eight** | ⭐⭐ **HE IS SENDING THIS** | — | placeholder |

⭐ **HOW TO SCRAPE IT AGAIN, BECAUSE IT IS NOT OBVIOUS.** The site is Next.js and **the project text
is not in the served HTML** — `curl` returns nothing for it. The image URLs are. The text comes back
by fetching each route with an **`RSC: 1` header**, or by reading rendered `innerText` per page.
⛔ The blob storage serves **AVIF bytes under `.png` names**; `sips` reads them where PIL will not.
The pipeline is **`sips → PNG → PIL → WebP`**.

⛔⛔ **DO NOT RE-SYNC THE DESCRIPTIONS FROM HIS SITE (D213).** D211 took them verbatim and he
rejected exactly that: *"it just sounds so much like AI… speak like the brand speaks."* **The facts
are his, the sentences are ours.** Take the facts and write them again.

⚠️⚠️ **SCRAPED COPY IS NOT AUTOMATICALLY TRUE COPY.** His site calls Taj Mahal **"quartz"**; our own
stone page is titled **Taj Mahal Quartzite**. Carrying his word across would have had a project page
contradict the stone page beside it — §2 rule 13. **The catalogue is the authority on what a stone
is called.**

⛔ **NO MATERIAL FIELD AND NO COMPLETION DATE** in the detail panel. Material is not recorded per
project on his site and inventing one is the integrity rule in a different costume; the date he
removed himself. **Five of the seven have no description and none was written for them** — the story
column hides itself and the intro drops to one column.

---

## 3. ⛔ THREE DEVICE BANDS — UNCHANGED, STILL THE FIRST THING TO GET RIGHT

```
   ≤ 720px          721 – 1120px          ≥ 1121px
   the phone   ·   the tablet        ·   the desktop
   signed off      signed off            unfrozen ITEM BY ITEM this round
```

⭐⭐ **"THE TABLET IS THE MOBILE BUILD, BIGGER" IS DONE BY WIDENING THE PHONE RULE'S OWN QUERY TO
1120 — NEVER BY WRITING THE RULE AGAIN.** Widening a `max-width` is additive for the phone and
invisible to the desktop.

⛔ **THE TABLET-ONLY BLOCK IS THE LAST THING IN THE STYLESHEET.** Search `THE TABLET BAND`. Both ends
always: `@media(min-width:721px) and (max-width:1120px)`. Written higher it loses to base rules at
identical specificity.

⭐ **HE UNFREEZES BY NAMING AN ITEM, MID-MESSAGE — AND HE DID IT SIX TIMES THIS ROUND** (the nav
dropdown, the WhatsApp button, the footer, the Stones menu, the services list, the gallery). ⚠️ **A
named item is unfrozen; the band around it is not.**

⛔ **Band work goes inside a width-scoped media query.** The one documented exemption is an element
that does not render outside its band at all — `#services .services-grid` is `display:none` from
1121px, which is why its orphan-tile rule is unscoped and says so in a comment.

---

## 4. ⛔⛔ EIGHT COMMITS ARE SITTING UNPUSHED

Branch **`tablet-round-d197-d200`**, working tree clean.

| Commit | What |
|---|---|
| `80d910d` | D213 project descriptions in the house voice |
| `9bc5d1b` | D212 cards clickable, gallery collage |
| `8176c2f` | D211 the real portfolio, 52 images |
| `d36f922` | D210 the seams claim |
| `a8bc9f6` | D208–D209 Stones panel, footer tail |
| `209d83b` | D207 dropdown, WhatsApp |
| `ac53409` | D206 eight services |
| `3896080` | D201–D205 his notes document |

⚠️⚠️ **HE HAS NOT SAID PUSH.** He has been asked after every commit. ⭐ **He sometimes says "just
push to GitHub, don't tell me you're going to" — if he does, push then report.**
⛔ **`gh` IS NOT INSTALLED**, so the PR cannot be opened from here: `brew install gh` once, or
https://github.com/ThadGC/topcatwork/pull/new/tablet-round-d197-d200

---

## 5. ⭐ THE LINK, AND THE HOST QUESTION HE HAS STILL NOT ANSWERED

```bash
cd "Website Demo" && nohup caffeinate -ims node dev-server.js > /tmp/topcat-server.log 2>&1 &
```

**Give him `http://192.168.1.102:5501`** — re-check with `ipconfig getifaddr en0`.
⭐ **THE SERVER IS DETACHED ON PURPOSE — PID 5158, untouched across nine rounds.** ⛔ Do not
`preview_stop` it and do not kill it to restart.

### ⚠️ HE REVIEWS ON `thadeusg3.sg-host.com`

⭐ **THIS IS NOW CONFIRMED, NOT SUSPECTED** — all four screenshots in his notes document carry that
URL. **We still do not know how files get there.** Asked three times. ⛔ Until it is answered,
anything built may be invisible to him and he will report bugs already fixed.

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

### ⭐ THE FREEZE PROBE — THESE NUMBERS ARE THE PROOF

| Signal | 375×812 | 1440×900 |
|---|---|---|
| `.gal-scroll` height | 1542 | **4950** |
| `--revPer` | 1 | **3** |
| `feTurbulence` | 0 | **60** |
| broken images | 0 | 0 |
| horizontal overflow | none | none |

⚠️ **DOCUMENT HEIGHT AND ELEMENT COUNT MOVED THIS ROUND AND THAT IS CORRECT** — content grew (a
seventh and eighth service, six About paragraphs, the real portfolio). **The bold structural numbers
are the freeze proof; height is not.** Account for every element you add: the eighth service was
+42 (29 grid + 12 helix + 1 nav), exactly.

⛔ **NOTHING SCROLL-DRIVEN CAN BE MEASURED IN AN OFF-SCREEN IFRAME.** The accordion never settles
there. Test the desktop gallery in the real pane, sweeping ~40 scroll positions — it settles at
about half of them.

---

## 7. ⭐ WHERE THINGS STAND

| Page | State |
|---|---|
| **`/`** | phone, tablet and desktop all worked on this round |
| **`/services/`** | ⭐ **seven leaf pages, eight tiles** — Fireplaces and Dining Tables have no page yet |
| **`/projects/`** | ⭐⭐ **the real portfolio, cards clickable, collage detail view** |
| **`/estimate/` `/about/` `/contact/` `/trade/`** | as before, with this round's copy |
| **`/stones/`** | the collection page; nav panel now points at selector / all / compare |
| `/materials/` `/guides/` `/worktops/` `/sitemap.html` | the SEO layer |

⭐ **ALL SEVEN SHARE ONE STYLESHEET.** `build_pages.py` lifts `index.html`'s `<style>`/`<script>` to
`assets/site.css` / `site.js`. ⛔⛔ **TO CHANGE AN INTERNAL PAGE, EDIT `index.html` AND RE-RUN.
NEVER HAND-EDIT A GENERATED FILE.**

### The eight services, in his order (D206)

`Kitchen Worktops · Splashbacks · Bathrooms · Outdoor Spaces · Fireplaces · Dining Tables ·
Vanity Tops · Commercial`

⭐⭐ **ONE ORDER GOVERNS ALL THREE RENDERINGS.** `ORDER` and `PHONE_ORDER` are both the identity now;
`SERVICES` is the only place order lives. ⛔ **A SECOND LIST IS THE BUG** — `PHONE_ORDER` named six
when there were seven and stranded a card at the front of the grid.
⚠️ **Kitchen Islands is not on his list and is no longer a tile, but its PAGE is still live** and
that was flagged to him, not inferred.

---

## 8. ⛔ RULES THAT MUST NOT BE BROKEN

1. ⛔ **Fabrication is IN-HOUSE (D202).** "Our experienced fabricators."
2. ⛔ **Never "laser" anything.** They template **by hand**.
3. ⛔ **The brand is "Topcat", one word.**
4. ⛔ **A stone's NAME and PHOTOGRAPH must match the supplier's own**, and the catalogue decides
   what a stone is called — not scraped copy.
5. ⛔ **Never state what we cannot guarantee, and never use an absolute.** ⭐ **A seam is always
   visible** — he corrected us on this and he was right.
6. ⛔ **Every measurement in millimetres.**
7. ⛔ **Never a bright or gold line across the TOP of a card or section**, anywhere.
8. **No showroom of our own** (the distributor's warehouse IS offered). **Never show the review
   count. Value, not cheap** — a "£1000 cheaper" line was dropped from his own copy for this.
9. **Voice:** quietly confident master. British English, commas not em dashes, no exclamation marks.
   ⭐⭐ **AND NO BROCHURE VOICE (D213)** — no "showcases our expertise", no "bring your vision to
   life", no "our experienced team". **Just what was done.**
10. ⛔ **The logo is the client's artwork and is never re-drawn. Set HEIGHT only.**
11. ⛔ **ONE DEVICE AT A TIME. Only the client unfreezes a band.**
12. ⭐⭐ **THIS IS A DESIGN BUILD. NEVER RAISE THE MISSING FORM BACKEND AS A BLOCKER.**

---

## 9. ⚠️ THE ENVIRONMENT TRAPS

- ⛔⛔⛔ **A STRAY `*/` SILENTLY DELETES THE NEXT CSS RULE.** The gate in §6 catches it.
- ⛔⛔ **A `.click()` IN A PROBE DOES NOT HIT-TEST.** §1.1. Use `elementFromPoint`.
- ⛔⛔ **`service.css` AND `stone.css` ARE NOT CONTENT-HASHED** — a reload can serve the previous
  edit for five minutes. `fetch(url,{cache:'reload'})` on the bare URL fixes it. **Still open.**
- ⛔⛔ **THE PANE FREEZES TRANSITIONS AT ZERO when `visibilityState:'hidden'`** — a transition parked
  at `currentTime:0` is a stopped clock, not a layout fault. Check `document.visibilityState` first.
- ⛔⛔ **THE PANE DOWNSCALES ITS SCREENSHOTS.** A screenshot disagreeing with a DOM read means the
  DOM is right. **Judge with screenshots, measure with the DOM.**
- ⛔ **LAZY IMAGES MAKE A SCREENSHOT LIE** — set `loading='eager'` and wait before judging a collage.
- ⛔ **`scroll-behavior:smooth` IS ON `<html>`** — every probe `scrollTo` animates unless
  `behavior:'instant'`.
- ⛔ **THE PANE SILENTLY RESIZES ITSELF.** Read `innerWidth` in the same call as your measurements.
- ⛔ **`javascript_tool` TIMES OUT AT 30s.** Split into ≤24s calls.
- ⛔ **`awk` DOES NOT UNDERSTAND `\s`.** Use `[ \t]`.
- ⛔ **AN INVENTED DATA VALUE CAN BLANK THE WHOLE SITE.** Valid presets: calacatta, carrara, crema,
  emperador, eternal, fumo, goldveil, mist, nerogold, statuario.
- ⛔ **THE RANGE IS ALPHABETICAL EVERYWHERE (D85). NO DARK STONE ON THE FIRST SCREEN (D86).**

---

## 10. OPEN — DO THESE NEXT

### ⭐⭐ Waiting on him

1. ⭐⭐ **PROJECT EIGHT.** Name, location, project type, description and photos. Card 8 is a
   placeholder holding its place.
2. ⭐⭐ **PUSH?** Eight commits queued (§4).
3. ⭐⭐ **HOW DO FILES GET TO `thadeusg3.sg-host.com`?** Asked three times. **Nothing else matters if
   he cannot see the work.**
4. ⭐ **CONFIRM THE SILICA / HSE SENTENCE** in his own words (§0).
5. ⭐ **TWO LIVE AI-TELLS, FLAGGED NOT CHANGED (D213):** the reviews CTA *"Let's bring your vision to
   life"* and the Why subtitle *"and ours is second to none"*. Both his call.
6. ⭐ **KITCHEN ISLANDS** — not on his service list; page still live. Delete or keep?
7. ⭐ **TRUSTPILOT** — researched and recommended AGAINST putting 4.0 beside the Google 5.0 in the
   hero; suggested it lives by the reviews section without a number until it is above ~4.5.
   **He has not ruled.**

### ⭐ Ready to build

8. ⭐ **FIREPLACES AND DINING TABLES HAVE NO LEAF PAGE.** Their tiles carry no `href` on purpose.
   ⚠️ Needs real detail from Nick — fireplace copy touches building regulations and rule 5 forbids
   inventing it.
9. ⭐ **PHOTOGRAPHY IS THE BIGGEST REMAINING GAP.** ⛔ **He has said twice: generate nothing.**
   - **Three service tiles show the wrong subject** — Outdoor Spaces a quarry, Commercial a kitchen,
     Bathrooms a bare slab. He asked for the first two to be replaced.
   - **Three service tiles show "PHOTO TO COME"** — Fireplaces, Dining Tables, Vanity Tops.
   - **The director portraits and the Why feature shot are placeholders**, and larger on tablet.
   - ⚠️ In the project gallery, **"Dining Tables" shows a fabricator grinding** and **"Exclusive
     Fireplaces" shows a kitchen** — offered to swap both to the plate, he has not answered.
10. ⭐ **CONTENT-HASH `service.css` AND `stone.css`** — §9, and it will bite him on his phone.
11. ⚠️ **THE HORNCHURCH PHOTO** shows a garden through bi-folds with what looks like a child on play
    equipment. Already public on his own site, but worth a look before go-live.
12. ⭐ **THE `<title>` STILL SAYS "London & the Home Counties"** — he changed the hero, not the
    title, and the title is a search asset. His call.
13. ⚠️ **~166 LEAF PAGES' META DESCRIPTIONS STILL NAME FOUR COUNTIES.** Adding four more pushes them
    past the length Google shows. Deliberately left.

### The rest

14. ⭐ Pick a production host; brotli and long-lived cache headers.
15. ⭐ Close the licensing question on Caesarstone, CRL and Bloom. ⛔ Classic Quartz Stone is off
    limits. ⭐ **Calacatta Gold is UNRESOLVED.**
16. ⚠️ **IS IT RIMSHA OR REMSHA?** A real person's name on a public page.
17. ⭐ **FACEBOOK, TIKTOK, YOUTUBE?** ⛔ Do not guess handles.

**Still waiting on the client:** whether Quartzite becomes a fourth range, 20mm vs 30mm pricing
(⚠️ the thickness toggle moves no number, which is correct until he rules), brackets for vanity tops
/ fireplaces / tables, and the £3k vs £3,850 three-slab discrepancy.

---

## 11. ⭐ HOW THIS CLIENT WORKS

⛔⛔⛔ **DO NOT ARGUE YOURSELF OUT OF SOMETHING HE ASKED FOR, AND DO NOT HAND HIM THE DILEMMA
EITHER.** D189 and D200 both did it. **A real constraint is a problem to solve, not a question to
return. If he names a thing, build the thing.**

⛔⛔ **DO THE THING HE ASKED FOR, IN THE MESSAGE HE ASKED FOR IT.** He sends asks in runs of four to
fourteen and adds more mid-build — **he sent five separate mid-turn messages this round.** Do them
in his order. **Say plainly which you are dropping and why.**

⚠️⚠️ **HE REVERSES HIMSELF FREELY AND FAST — FOUR STANDING RULES IN ONE DAY — AND THAT IS FINE. LOG
IT.** ⛔ **Write the reversal into §D WITH THE REASON THE OLD DECISION EXISTED**, or the next session
helpfully rebuilds the thing he just rejected. ⭐ **D211 was reversed by D213 inside one round.**

⚠️ **HE CORRECTS THE DIAGNOSIS, NOT JUST THE DESIGN, AND HE IS USUALLY RIGHT.** Take the report as
data and **go and MEASURE before deciding he is describing the thing you think he is.** "It isn't
even centered" was a 170px offset. "Doesn't look good" was a specificity bug. "They're blurry" was a
21:9 crop. "Not clickable" was `pointer-events:none` inherited from an engine that was switched off.

⭐ **DELETE, DO NOT OVERRIDE, WHEN REVERTING.** Two competing descriptions of one element is how
D106, D113 and D114 each lost a rule.

⭐ **RECORD YOUR OWN DEAD ENDS IN §D**, with their measurements.

⚠️ **HE SWEARS WHEN SOMETHING LOOKS WRONG, AND THE COMPLAINT IS ALWAYS REAL.** Do not get defensive
and do not over-apologise. Find it, name the actual cause, fix it, say what it was.

- **Walk the journey, do not check the page.**
- ⭐⭐ **LOOK AT THE RESULT BEFORE REPORTING IT DONE.** The `PHONE_ORDER` bug was invisible to every
  measurement and obvious in one screenshot.
- **Measure, then claim.** ⚠️ **And if you could not measure it, say so** — the "text cut off" report
  in D210 could not be reproduced and was written up as unreproduced, not as fixed.

---

## 12. BUDGET AND THE DOCUMENT SET

- **~82 credits** of the client's **100-credit ceiling** spent, about **18 left**. ⭐ **This round
  cost none** — no image generation, on his instruction. The 52 project images were **downloaded
  from his own site**, not generated.

| File | What it is |
|---|---|
| **`HANDOVER.md`** | ⭐ The single current state. §D is the register, **D1–D130 and D132–D213**. §2 the standing rules, §2a the supplier list. ⚠️ **THERE IS NO D131 ROW** |
| **`Website Demo/index.html`** | ⭐⭐ The whole design — inline `<style>` and `<script>`. Search `THE TABLET BAND`, `const PROJECTS`, `const SERVICES` |
| **`Website Demo/build_pages.py`** | ⭐⭐ Builds the six internal pages and the shared assets |
| `Website Demo/assets/site.css` `site.js` | ⛔ **GENERATED. Never edit.** |
| **`Website Demo/assets/projects/`** | ⭐ **52 WebP files, 3.3MB — the client's real portfolio photography.** `<key>-1400/-560` are cards, `<key>-gN` are the collage, sized to their own proportions |
| `Website Demo/services/service.css` `stones/stone.css` | ⭐ Hand-maintained, shared by ~166 leaf pages. ⚠️ **NOT content-hashed** |
| **`Website Demo/index.html.pre-client-notes.bak`** | ⭐ **This round's baseline** — before any of D201–D213 |
| `Website Demo/index.html.pre-tablet-round.bak` | before the tablet band existed |
| `Website Demo/index.html.pre-stone-sections.bak` | ⭐ **Holds the LIGHT STONE BANDS version (D161), which he rejected.** The only copy |
| `HANDOVER-2026-08-14-tablet-round-start-here.md` | ⭐ **The START HERE this file replaces** (D197–D200) |
| `Website Demo/stones/build_stones.py` | Builds the collection, compare.html and 132 stone pages |
| `Website Demo/stones/harvest/verify.py` | ⭐ The nine-check gate |
| `Website Demo/dev-server.js` | Compression, caching, and the reload that keeps scroll position |
| `Docs/topcat-worktops-SEO-LOG.md` | Every URL, title, target query and SEO change |
| `HANDOVER-archive-to-2026-08-06.md` | ⚠️ **Every design the client rejected, in his words.** Read before redesigning anything |

⚠️ **Section numbers in `HANDOVER.md` are referenced from code comments** (`§3`, `§4`, `§5a`, `§6.7`,
`§7.5` are live in `index.html`). **Do not renumber.**
