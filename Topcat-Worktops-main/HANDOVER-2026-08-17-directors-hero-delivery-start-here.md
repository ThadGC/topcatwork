# START HERE — 17 August 2026, after THE DIRECTORS, THE HERO AND THE DELIVERY ROUND (D278–D290)

Read this, then `HANDOVER.md` **§D** (the register, newest first — this round is **D278–D290**) and
**§2** (the standing rules). That is about twenty minutes and it is enough to work safely.

> ⚠️ **This replaces the previous version of this same file**, which covered the weld round
> (D269–D277) and is now `HANDOVER-2026-08-16-weld-round-start-here.md`.
> Everything in it that still matters is carried below.

---

## 0. ⛔⛔⛔ THE ONE THING TO TAKE FROM THIS ROUND

**⭐⭐⭐ WORK HE CANNOT SEE IS NOT DELIVERED, AND FOR TWO DAYS NONE OF IT REACHED HIM.**

He wrote: *"push to github!!! my developer cant see the new update. says updated 2 days ago"*.
Everything **was** pushed — to `tablet-round-d197-d200`. **`main` was two days stale, and `main`
is what GitHub shows when you open the repo.** Thirty-six commits, D246 to D284, were invisible to
anyone who did not know the branch name. Every round had been reported to him as "pushed", which
was true and useless.

Then the developer uploaded and **the site still came back as the old one** — two more causes,
both now fixed (§7a).

⛔ **NEVER REPORT A ROUND AS PUSHED ON THE STRENGTH OF THE BRANCH.** Check what `main` says.
⛔ **AND PUSHING IS NOT PUBLISHING.** GitHub being current does nothing for
`thadeusg3.sg-host.com`; that upload is a separate human step.

### ⭐⭐ THE SECOND THING: A TRANSPLANTED COMPONENT INHERITS ITS HOST, NOT ITS ORIGIN

D290 hit this three times in one hour, and it is the trap to expect whenever markup from
`index.html` is dropped onto a page dressed by `service.css`:

- ⛔ `service.css` sets `body{line-height:1.6}` where the landing page sets **1.5** — the footer
  came out **28px taller** with identical markup.
- ⛔ It also sets `body{font-weight:300}` where the landing page **declares nothing**, so the
  browser's 400 applies there. **"The landing page does not say" and "the component should not
  care" are different statements.**
- ⛔ **A CSS COMMENT CONTAINING A BRACE BROKE THE RULE SPLITTER.** One footer comment quotes the
  client and contains `{`; splitting each rule on its first `{` cut inside the comment, so
  `#footer .foot-grid` was never matched and the phone footer's whole `grid-template-areas` rule
  was silently dropped. **Strip comments BEFORE splitting, never after.**

---

## 1. ⭐⭐⭐ THE DIRECTORS ARE REAL, AND THEY MOVED TWICE (D278, D279, D280)

He sent photographs of Nick and Rimsha — his own people, AI-retouched by him — and the empty
plates from 9 Aug are filled at last.

```
D278  top band, 114x152, background masked out   →  he reversed the mask
D278b background stays, stood back, filtered     →  "the text is too small"
D279  BOTTOM band, 241x241, site's own type      →  "remove the details"
D280  note line gone, plate sits lower           →  where it stands now
```

⛔⛔ **THE CARD IS SQUARE AND THAT IS NOT A STYLE CHOICE.** He wants them bigger AND still stood
back. **Nick's frame carries only 190px of paper above his crown**, so any wider card forces a
shorter crop, which forces a close-up. At 1:1 his head is half the frame with his shoulders in it.
⭐ **THE STUDIO BACKGROUND STAYS — he reversed the cut-out.** Masking it was the wrong instrument
for a real problem (the paper reads 195 against a mosaic that means 124); the TONE was the fault,
so it is `filter:brightness(.68) saturate(.9)` on `.ac-p img`, one tunable line. Measured on the
painted pixels, the pair sits at **77** against the mosaic's 60/98/106.
⚠️ **FILTERS DO NOT COMPOUND** — that declaration REPLACES `.ac-tile img`'s, and the hover has to
be restated or the pair snaps to full brightness.
⛔ **THE PAIR IS LAST IN THE DOM NOW.** DOM order IS the build order, so a band at the foot of the
grid must be at the foot of the markup; `picks` and `HINGE` are indexed by DOM position and moved
with it. ⭐ **They fold LAST and in full view** — measured at px 1024 with the slab edge at x=884,
both are still at 78°.
⚠️ **THE `?v=` ON THE PORTRAITS IS AT 3.** Bump both tiles in step whenever either is re-cut.
⚠️ **THE NOTE LINE IS GONE AND SO IS ITS CONTAINER QUERY.** Do not re-add a note without one — the
card is 241px on a desktop, 275 on an 800px tablet and 162 on a 900px one, an order no viewport
breakpoint follows.

---

## 2. ⭐⭐ A NEW HERO, AND ITS SHADOW HAD TO MOVE WITH IT (D283, D284)

The night kitchen is a new photograph, framed closer. ⛔ **IT WENT INTO FIVE PLACES:** the `<img>`,
the `<link rel=preload>`, the `SS` ladder, and **BOTH `--pageHeadImg` declarations** — the
`.page-head` band on the seven internal pages, which D196 declares IS the landing hero's picture.
⭐ New prefix `hero-night-*`, ladder **1400/2000/2752** (the top rung is native; the pipeline never
upscales). ⚠️ `hero-kitchen-*` is now unreferenced anywhere — §10's note listing it among the three
shared photographs is stale. Kept on disk.

⛔⛔⛔ **THE SHADE'S LEFT-TO-RIGHT RAMP IS GONE.** It ran **0.94 at the left edge to 0.06 at 74%**,
written in July for copy on the left and a photograph on the right. The copy has been CENTRED since
D232, so it was painting a wall over the one part of the frame with nothing in it — composited veil
**0.944 left against 0.414 right**. And the text was failing where the ramp gave up: the gold word
measured **2.56:1**, below the 3:1 large-text threshold.
⭐ The lean is **0.26 → 0.46** now, toward the lit kitchen, and the centred scrim carries the rest
at **0.70/0.36**. ⭐⭐ **D187's FLAT PHONE WASH IS RETIRED** — it existed because the big layer was a
ramp, and that reason died with the ramp. Phone and tablet take the same centred scrim: gold
**2.68 → 4.67** there, **and the photograph's own edge gets LIGHTER**, 0.484 → 0.472.

⚠️⚠️ **A WORST-PIXEL CONTRAST FIGURE OVERSTATES THE PROBLEM.** At 900 the gold's worst sample reads
3.05 — but it is **one sample in 14,175, at the corner of the element box**, and the 1st percentile
is **7.04**. Quote the distribution, not the extreme.

---

## 3. ⛔⛔ THE PAGER AND THE WHEEL: A POSITION AGAINST THE WRONG BOX, FOUR TIMES (D282, D286, D287, D288)

Four faults in two days, all the same mistake.

| | what was measured against the wrong thing |
|---|---|
| D282 | the review arrow's x assumed a peek gutter the tablet does not have (`--revScale` is **1.0000** there, so the expression collapsed to `cardLeft − 13px` and it sat ON the quote) |
| D286 | the stylesheet rebuilt that gap from the card SCALE instead of the geometry the cards are placed by |
| D287 | the arrow's y used `top:50%` of the STAGE, which carries `padding-bottom:--revPagerH` — **exactly 30px low, half of 60** |
| D288 | the stone wheel's row was a flex box sized by the readout's own text |

⭐⭐ **BOTH PAGER AXES ARE DERIVED NOW.** `soloGapX()` projects the neighbour's inner edge through
the same drum transform the renderer uses and publishes `--revPagerX`; the y is
`calc((100% − var(--revPagerH)) / 2)`. ⛔ **DO NOT PUT A HAND-TYPED OFFSET BACK** — the cards ride a
3D drum under perspective, so the visible gap is **31.5px at 900 where `SOLO_GAP` says 12**.
⛔ **AND D282 IS REVERSED**: he does not want the round button there. *"In circles, which it's not
supposed to be."* `.rev-solo` is a CLASS, not a media query, so the tablet wears the phone's own
bare chevron with no rule restating it.

⭐ **THE STONE WHEEL'S ARROWS NO LONGER MOVE.** The 132 names measure **122px to 505px**, so the
pair was swinging **147px each side**. It is a three-column grid on a fixed 480px row; the name box
reserves two lines; `fitStoneName()` steps the type down for the few that want a third.
⛔ **`min-width:0` ON THE READOUT IS LOAD-BEARING** — a grid item's automatic minimum is its
content, so the grid alone does not fix it.
⚠️ **THE RESERVATION IS `calc(var(--rNameFS) * 2.3)`, NOT `em`.** `em` resolves against the font
size the fit overwrites, so a shrunk name shrank its own box and **the buttons moved down**.

---

## 4. ⭐⭐⭐ DELIVERY IS FIXED IN THREE PLACES NOW (D285, D289, D290)

**D285 — one destination.** Local work is on `main`, and `remote.origin.push` carries two refspecs
so one `git push` moves `main` AND the old round branch:
```
refs/heads/main:refs/heads/main
refs/heads/main:refs/heads/tablet-round-d197-d200
```
⛔ **THE STALE BRANCH IS DELIBERATELY NOT DELETED** — we still do not know how files reach the host,
and if the developer's process pulls it by name, deleting it breaks them silently.

**D289 — why a fresh upload looked old.** Three stylesheets shipped with **no version**:
`service.css`, `stone.css`, `seo.css`. **`service.css` alone dresses 176 pages**, so a browser
holding yesterday's copy re-dressed the whole new site in the old design. All three carry
`?v=<sha1>` now. A `.htaccess` sets `no-cache` on HTML, a year on the hashed CSS/JS and
**deliberately only an hour on images** — slab tiles and the portraits are named for their subject,
so a re-cut file is the same URL.

**D290 — one footer, generated.** Four builders carried four footers; three had drifted (4497
characters against 1928, 1928 and 1755). All lift it from `index.html` now, `build_pages.py` also
writes **`assets/footer.css`**, and `service.css`'s own footer rules are deleted.

---

## 5. ⛔ THE UPLOAD, EXACTLY (§7a — GIVE THIS TO THE DEVELOPER)

```bash
git clone https://github.com/ThadGC/topcatwork.git topcat && cd topcat
cd "Topcat-Worktops-main/Website Demo" && python3 make_upload.py
```

`make_upload.py` writes `../upload/` — **669 files, 183 HTML pages, ~78 MB** — with the build
scripts, the 60-odd `.bak` snapshots, the markdown and the `.src-*` originals stripped. It refuses
to run if `index.html` is newer than `assets/site.css`, and it prints the `?v=` numbers the build
serves.

1. Upload the **CONTENTS** of `upload/` into `public_html`. `index.html` lands directly there.
2. ⚠️ **TURN ON "SHOW HIDDEN FILES" IN THE FTP CLIENT.** `.htaccess` is in there and most clients
   hide it — the one file that fixes the caching.
3. ⛔⛔ **FLUSH SITEGROUND'S CACHE. THIS IS NOT OPTIONAL.** Site Tools → Speed → Caching →
   **Dynamic Cache → Flush**. It sits in front of Apache and ignores `.htaccess` entirely. Purge
   Cloudflare too if it is on.
4. Check in view-source that a stone page asks for the current `service.css?v=…`. If the number
   matches, it is live.

⚠️ **THE STAMP MOVES WHENEVER `service.css` DOES.** Re-run `make_upload.py` and use what it prints;
do not quote an old number.

---

## 6. ⛔ THREE DEVICE BANDS — ALL THREE ARE IN PLAY NOW

```
   ≤ 720px          721 – 1120px          ≥ 1121px
   the phone   ·   the tablet        ·   the desktop
```
⚠️ **HE OPENED THE PHONE AND TABLET THIS ROUND** and worked across all three freely — the "one
device at a time" freeze (§2 rule 15) is not what he is doing today. **It still applies to anything
he has not asked about**: do not redesign a band he did not mention.
⛔ **THE TABLET-ONLY BLOCK IS STILL THE LAST THING IN THE STYLESHEET.** Search `THE TABLET BAND`.
⛔ **`.rev-solo` AND `.ac-p` ARE CLASSES, NOT MEDIA QUERIES** — a change there reaches every band
that wears them, which is usually what you want and always worth knowing.

---

## 7. ⛔ THE GATES — RUN THESE

```bash
cd "Website Demo" && python3 build_pages.py                     # after ANY index.html change
cd "Website Demo/services" && python3 build_services.py
cd "Website Demo/stones" && python3 build_stones.py             # after a stone page, stone.css or SLAB_V
cd "Website Demo" && python3 build_seo_pages.py
cd "Website Demo/stones" && python3 harvest/verify.py            # 132/132/132 ✅
```

⚠️ **`build_pages.py` NOW ALSO WRITES `assets/footer.css`**, so it must run before the other three
or they will link a stale footer hash.
⛔⛔ **NEVER RUN `Website Demo/trade/build_trade.py`.** Superseded; it would revert the trade page
to 1 August (D233).

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

### ⭐ THE FREEZE PROBE — 1440×900, FRESH LOAD

| Signal | Value |
|---|---|
| `.gal-scroll` height | **4950** |
| `--revPer` | **3** |
| `feTurbulence` count | **60** |
| `#svcNav` children | **8** |
| elements | **2659** |
| hero ink (`.hero-inner` padding-top) | **164.683** |
| `#about` height | **759** |
| collage | **497×676** |
| `#footer` height | **504** (1440) · **789** (900) · **1102** (375) |
| `.wheel-ui` width | **480** |
| broken images / overflow / console errors | **0 / none / none** |

⚠️ **FILTER BROKEN IMAGES ON `i.src && i.complete && i.naturalWidth===0`** — `#pmShot` has no `src`.
⚠️ **docH IS NOT A STABLE SIGNAL ON THE LANDING PAGE** — the weld buys ~920px of scroll only once
the stage builds on approach, so a fresh-load reading (14537) and a settled one (15456) both differ
from the register's older figures. Compare like with like or use the table above.

---

## 8. ⚠️ HOW TO MEASURE — THE PART THAT EARNED ITS PLACE

- ⛔⛔⛔ **PRINT THE COMPUTED VALUE BEFORE YOU CHANGE THE DECLARATION (D207), AND LOOK AT IT AFTER.**
- ⛔⛔⛔ **A POSITION IS ALWAYS AGAINST SOME BOX — NAME IT.** Four faults this round (§3).
- ⛔⛔⛔ **STRIP CSS COMMENTS BEFORE SPLITTING ON `{`.** A comment with a brace in it silently ate a
  whole rule (D290).
- ⛔⛔ **A TRANSPLANTED COMPONENT INHERITS ITS HOST.** Pin what it must not inherit, and fall back to
  the CSS INITIAL where the origin declares nothing.
- ⛔⛔ **CONTRAST IS MEASURED BY COMPOSITING, NOT BY LOOKING** — and quote a percentile, not the
  single worst pixel (D284).
- ⛔⛔ **MEASURE THE ENCODED FILE AND THE PAINTED PIXELS, NOT THE BUFFER (D277).**
- ⛔⛔ **A MEAN HIDES A RAMP — MAP A GRID (D275).**
- ⛔ **ANYTHING THAT REPORTS A POSITION LIES IF SOMETHING MOVED THE BOX WITHOUT MOVING THE LAYOUT** —
  a pinned sticky, `.rise`'s 34px translate, a 3D hinge. `offsetTop` is NOT a refuge from sticky.
- ⛔ **`getClientRects()` ON A FLEX BOX RETURNS NO LINE BOXES.** A Range over `.r-name` read **0
  lines for all 132 stones** and the fit was silently inert (D288). Measure an inner span.
- ⛔ **SWEEP, DO NOT SAMPLE.** 232 readouts × 4 viewports found the wheel's vertical drift; one
  screenshot would not have.
- ⛔ **CONFIRM THE RUNNING DOCUMENT IS THE FILE YOU JUST WROTE** before believing a negative (D222).

### The environment traps (all still live)

- ⛔⛔⛔ **A STRAY `*/` SILENTLY DELETES THE NEXT CSS RULE.** The §7 gate catches it.
- ⛔⛔ **THE PANE FREEZES rAF WHEN THE TAB IS HIDDEN.** Opening a second tab backgrounds the first:
  the weld stopped building and looked broken for ten minutes this round. It was the tab, not the
  code. ⭐ Front the tab and it resumes.
- ⛔⛔ **`javascript_tool` RUNS BEFORE ASYNC WORK SETTLES.** IntersectionObservers and image decodes
  need a SEPARATE call — set state on `window` in one, read it in the next.
- ⛔⛔ **THE PANE'S SCREENSHOT CAN CATCH A MID-LOAD FRAME.** Twice this round a hero looked black
  because the reveal had not fired. Re-shoot before believing it.
- ⛔ **`node --check` PASSES A DELETED VARIABLE**, and the pane keeps console messages across a
  reload, so a fixed error still looks live.
- ⛔ **NO NUMPY ON THIS MACHINE.** PIL only, pure Python loops. ⛔ **NO SVG RASTERISER.**
- ⛔ **AN INVENTED DATA VALUE CAN BLANK THE WHOLE SITE.** Valid presets: calacatta, carrara, crema,
  emperador, eternal, fumo, goldveil, mist, nerogold, statuario.

---

## 9. ⭐ THE LINK, AND THE SERVER

```bash
cd "Website Demo" && nohup caffeinate -ims node dev-server.js > /tmp/topcat-server.log 2>&1 &
```

**Give him `http://192.168.1.102:5501`** — re-check with `ipconfig getifaddr en0`.
⭐ **THE SERVER IS DETACHED ON PURPOSE — PID 5158, up 5 days 17 hours.** ⛔ Do not `preview_stop` it
and do not kill it to restart. ⭐ **USE `http://localhost:5501` IN THE PREVIEW PANE**, on his
instruction.

---

## 10. ⭐ WHERE THINGS STAND

| Page | State |
|---|---|
| **`/`** | new night-kitchen hero with a rebalanced veil; the About **welds** over Process on desktop; the directors are the collage's **bottom band**; the stone wheel's arrows are pinned |
| **`/services/*.html`** | NINE leaf pages, the landing page's nav, hero and stone floor |
| **`/materials/` `/guides/` `/worktops/` `/sitemap.html`** | the 26-page SEO layer |
| **`/stones/`** | 132 pages + collection + compare; every slab URL carries `?v=` |
| **the seven internal pages** | the `.page-head` family, now on the new hero photograph |
| **`/trade/`** | eight sections ⚠️ its own CTA still shows hours and no WhatsApp |
| **all 183 pages** | **one footer**, generated from the landing page, identical at every width |

⚠️ **THREE SHARED PHOTOGRAPHS MUST NOT BE DELETED**: `kitchen-day.jpg`, `cta-slab.jpg` — and
`hero-kitchen.jpg`, which is now unreferenced but kept.

---

## 11. ⛔ RULES THAT MUST NOT BE BROKEN

1. ⛔ **Fabrication is IN-HOUSE (D202).** "Our experienced fabricators." It has flipped three times.
2. ⛔ **Never "laser" anything.** They template **by hand**.
3. ⛔ **The brand is "Topcat", one word.**
4. ⛔ **A stone's NAME and PHOTOGRAPH must match the supplier's own.** ⚠️ A name is not unique across
   makers — see §12.
5. ⛔ **Never state what we cannot guarantee, and never use an absolute.** ⭐ A seam is always visible.
6. ⛔ **Every measurement in millimetres.**
7. ⛔ **Never a bright or gold line across the TOP of a card or section.** ⚠️ A full 34% gold BORDER
   is fine and is the site's standard. ⚠️ This is why the aftercare ledger kept a diamond rather
   than a rule between its two credentials (D281).
8. **No showroom of our own. Never show the review count. Value, not cheap.**
9. **Voice:** quietly confident master. British English, commas not em dashes, no exclamation marks.
   ⭐⭐ **NO AI SLOP** and **no jargon**.
10. ⛔ **The logo is the client's artwork, never re-drawn, never generated. Set HEIGHT only.**
11. ⛔⛔ **A MARK IS NEVER PUT IN A CIRCLE, A RING, A DISC OR A PLATE.** ⚠️ **A CONTROL IS NOT A
    MARK** — but ⛔ **that carve-out is not a licence to make every control a circle**: D282 used it
    to justify round review arrows and he reversed it the next day. **Ask what that control already
    is before changing its shape.**
12. ⛔ **ONE DEVICE AT A TIME unless he says otherwise** — see §6.
13. ⭐⭐ **THIS IS A DESIGN BUILD. NEVER RAISE THE MISSING FORM BACKEND AS A BLOCKER.**
14. ⛔⛔ **2 CREDITS MAXIMUM PER GENERATED IMAGE.** ⭐ This round and the last spent **nothing**.

---

## 12. OPEN — DO THESE NEXT

### ⭐⭐⭐ The ones that are costing money

1. ⭐⭐⭐ **HOW DO FILES ACTUALLY REACH `thadeusg3.sg-host.com`?** Asked NINE times. §5 is now an
   exact guide, but nobody has confirmed what the developer really does — FTP, File Manager, a git
   deploy. **Until that is known, every upload is a guess and the cache flush may be skipped.**
2. ⭐⭐⭐ **WHOSE ARGENTO DOES HE SELL?** His reference is a dense flecked grey-white quartz; the site
   shows his supplier's veined marble-look, **verified against `nextstoneslabs.co.uk` name by name**.
   ⛔ His stone is not in the catalogue under any name. ⛔ Do not paste the Google image.
3. ⭐⭐ **THE STONE PHOTOGRAPHY AUDIT.** *"You have completely lost my trust in you having the
   correct stones on display."* 24 of 132 verified against the supplier's live page; **92 Nile Stone
   tiles are unverified** and the pipeline never recorded which supplier URL each photograph came
   from. The offer to re-run the harvest with source URLs is on the table and unanswered.

### ⭐⭐ Waiting on him

4. ⭐⭐ **TWO SENTENCES FOR NICK AND RIMSHA** if he ever wants a description back under their names.
   The ones I wrote were removed at D280 — his call, and they are his people.
5. ⭐⭐ **WHAT IS THE CREDIT CEILING NOW?** Nothing spent for three rounds.
6. ⭐⭐ **CLOSE THE CALACATTA GOLD LICENSING QUESTION.**
7. ⭐⭐ **THE LEAF PAGES HAVE NO MOBILE NAV.** A burger and an overlay is the real answer; his call.
8. ⭐⭐ **THE TABLET'S STONE TILES ARE STILL AT HALF BRIGHTNESS** (`.face.front .stone{opacity:0.5}`).
   One line.
9. ⭐⭐ **TRADE TERMS.** Payment, minimum order, lead times, a dedicated contact. **His stated first
   priority.** ⚠️ The trade page's CTA still carries hours and no WhatsApp.
10. ⭐⭐ **THE FIREPLACE SCOPE, WITH NICK.**
11. ⭐⭐ **ALI JAFFER AND KAV / UXBRIDGE** — two Drive folders that match no project.
12. ⭐ **THE 19 DRONE VIDEOS** in the Hornchurch and Rickmansworth folders.
13. ⭐ **CONFIRM THE SILICA / HSE SENTENCE** in his own words (D202).
14. ⭐ **KITCHEN ISLANDS** — not on his service list; page still live and still linked.
15. ⭐ **TRUSTPILOT** — recommended AGAINST putting 4.0 beside the Google 5.0. He has not ruled.

### ⭐ Ready to build

16. ⭐ **THE FAVICON IS AN SVG ONLY.** `assets/brand/favicon.svg` exists and serves **200** — the
    old "no favicon" item is out of date. ⚠️ **But `/favicon.ico` is still a 404**, which is what
    browsers and some crawlers ask for by default, and it was the page's only console error for
    weeks. One `.ico` at the web root closes it.
17. ⭐⭐ **THE TWO DIRECTOR PLATES ARE DONE** — this item is CLOSED (D278–D280).
18. ⭐⭐ **CONTENT-HASH `service.css` / `stone.css`** — **CLOSED (D289)**, along with `seo.css` and
    the new `footer.css`.
19. ⭐ **`/services/kitchen-islands.html`** is the one leaf page still on a shared stock hero.
20. ⚠️ **THE GENERATED PAGES SHIP THEIR CODE COMMENTS TO VIEW-SOURCE**, including his own quotes.
    ⚠️ `footer.css` is generated with comments STRIPPED — the same treatment would suit the pages.
21. ⚠️ **THE HORNCHURCH CARD PHOTO** shows a garden with what looks like a child on play equipment.
22. ⭐ **THE `<title>` STILL SAYS "London & the Home Counties"** — the title is a search asset.
23. ⚠️ **~166 LEAF PAGES' META DESCRIPTIONS STILL NAME FOUR COUNTIES**, not eight.
24. ⚠️ **THE SPLASHBACK PHOTOGRAPH'S SOCKETS ARE NOT UK PATTERN.**
25. ⭐ Pick a production host; brotli and long-lived cache headers. ⚠️ `.htaccess` now carries the
    cache rules — check they survive whatever host is chosen.
26. ⚠️ **IS IT RIMSHA OR REMSHA?** A real person's name on a public page, and it is now under her
    photograph.
27. ⭐ **FACEBOOK, TIKTOK, YOUTUBE?** ⛔ Do not guess handles.
28. ⚠️ **`Next Stone Slabs` IS NAMED IN ONE PLACE ONLY** — the quartz page's brand sentence.
29. ⚠️ **TWO SLABS LEAN BLUE AND NOBODY HAS RULED**: `arabescato-grey` (r−b −13.78) and
    `calacatta-gold-shimmer` (−12.39).
30. ⚠️ **THE STALE BRANCH `tablet-round-d197-d200`** can be deleted once item 1 is answered and it
    is confirmed nothing pulls it by name.

**Still waiting on the client:** whether Quartzite becomes a fourth range, 20mm vs 30mm pricing,
brackets for vanity tops / fireplaces / tables, and the £3k vs £3,850 three-slab discrepancy.

---

## 13. ⭐ HOW THIS CLIENT WORKS

⛔⛔⛔ **DO NOT ARGUE YOURSELF OUT OF SOMETHING HE ASKED FOR, AND DO NOT HAND HIM THE DILEMMA
EITHER.** **A real constraint is a problem to solve, not a question to return.**

⛔⛔ **AND DO NOT ASK HIS PERMISSION.** Commit, push, report.

⭐⭐⭐ **HE IS USUALLY RIGHT ABOUT THE DIAGNOSIS, NOT JUST THE SYMPTOM.** *"The buttons next to it
are moving"* was a flex row sized by its own text. *"The darker shadow is still coming in from the
left"* was a July ramp aimed at a composition that no longer existed. *"Why is it below the center
of the card?"* was 30px, exactly half the stage's reserved padding. **Take the complaint literally
and go and measure the thing he named.**

⭐⭐ **HE REVERSES HIMSELF FREELY AND FAST — AND THAT IS FINE. LOG IT.** This round: the portrait
background (masked → kept), the director note line (his own idea → removed the same evening), the
review arrows (round → bare chevron, one day). ⛔ **Write the reversal into §D WITH THE REASON THE
OLD DECISION EXISTED.**

⭐⭐ **HE SENDS CORRECTIONS MID-TURN, OFTEN THREE OR FOUR DEEP.** Finish the one you are on, then
take the next in his order.

⭐⭐⭐ **HE REMEMBERS WHAT HE ASKED FOR WEEKS AGO.** Before saying something is done, check it is done
at every width.

⭐⭐ **WHEN YOUR OWN WORK CAUSED THE NEXT FAULT, SAY SO IN THE FIRST LINE.** He is fine with that and
not fine with spin. **This round D279 fixed D278, D286 fixed D282, D287 fixed D286 — say it plainly.**

⚠️ **HE SWEARS WHEN SOMETHING LOOKS WRONG, AND THE COMPLAINT IS ALWAYS REAL.**

- **Walk the journey, do not check the page.**
- ⭐⭐ **LOOK AT THE RESULT BEFORE REPORTING IT DONE.**
- **Measure, then claim.** ⚠️ And if you could not measure it, say so.

---

## 14. BUDGET AND THE DOCUMENT SET

- ⛔⛔ **THE 100-CREDIT CEILING IN THE OLD DOCS IS OBSOLETE.** The 15 Aug round spent **101.46** on
  its own. ⭐ **2 credits maximum per image.** ⭐ **The last three rounds spent nothing.**

| File | What it is |
|---|---|
| **`HANDOVER.md`** | ⭐ The single current state. §D is the register, **D1–D130 and D132–D290**. §2 the standing rules, §2a the supplier list. ⚠️ **THERE IS NO D131 ROW** |
| **`Website Demo/index.html`** | ⭐⭐ The whole landing design — inline `<style>` and `<script>`. Search `THE WELD`, `SLAB_V`, `THE TABLET BAND`, `--revPagerX`, `soloGapX`, `fitStoneName`, `--rNameFS`, `THE ARROWS DO NOT MOVE` |
| **`Website Demo/build_pages.py`** | ⭐⭐ The seven internal pages, `site.css`, `site.js` **and `footer.css`**. Owns `/trade/index.html`. ⚠️ **RUN IT FIRST** — the other builders link footer.css's hash |
| **`Website Demo/make_upload.py`** | ⭐⭐⭐ **NEW (D289).** Writes a clean `../upload/` for the host. The only correct answer to "which folder do I upload" |
| **`Website Demo/.htaccess`** | ⭐⭐ **NEW (D289).** Cache rules. ⚠️ A dotfile — FTP clients hide it |
| **`Website Demo/assets/footer.css`** | ⛔ **GENERATED.** Never edit; change the landing page and re-run |
| **`Website Demo/services/service.css`** | ⭐⭐⭐ The shared sheet every generated page links. ⛔ **NO FOOTER RULES HERE ANY MORE** |
| **`Website Demo/services/build_services.py`** | ⭐ The nine service leaf pages |
| **`Website Demo/build_seo_pages.py`** | ⭐ The 26-page SEO layer, the sitemap |
| **`Website Demo/stones/build_stones.py`** | 132 stone pages + collection + compare. ⭐ Carries `SLAB_V` |
| **`Website Demo/stones/descriptions.py`** | ⭐⭐ One line per stone. ⛔ Re-cut a tile and its sentence is stale |
| **`Website Demo/stones/harvest/`** | The pipeline, `LICENSING.md`, `catalogue.json`, `verify.py`. ⛔ No source URL per tile — §12 item 3 |
| ⛔ **`trade/build_trade.py`** | ⛔⛔ **SUPERSEDED — DO NOT RUN** |
| ⛔ **`build_images.py` `patch_images.py`** | ⛔⛔ **ONE-SHOT, CANNOT RUN AGAIN** |
| **`assets/team/.src-2026-08-16/`** | ⭐ The directors' source frames and the cut script |
| **`assets/site/.src-2026-08-17/`** | ⭐ The hero's source PNG and its cut script |
| `Docs/topcat-worktops-SEO-LOG.md` | Every URL, title, target query and SEO change |
| `HANDOVER-2026-08-16-weld-round-start-here.md` | ⭐ **The START HERE this file replaces** (D269–D277) |
| `HANDOVER-archive-to-2026-08-06.md` | ⚠️ **Every design the client rejected, in his words.** Read before redesigning anything |

⚠️ **Section numbers in `HANDOVER.md` are referenced from code comments** (`§3`, `§4`, `§5a`, `§6.7`,
`§7.5` are live in `index.html`). **Do not renumber.**
