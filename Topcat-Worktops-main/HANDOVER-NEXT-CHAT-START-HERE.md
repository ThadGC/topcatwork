# START HERE — 14 August 2026, after the TABLET ROUND (D197–D200)

Read this, then `HANDOVER.md` **§D** (the decision register, newest first — this round is
**D197–D200**) and **§2** (the standing rules, especially **rule 9** and **rule 15**). That is about
fifteen minutes and it is enough to work safely.

> ⚠️ **This replaces the previous version of this same file**, which covered the internal pages
> round (D179–D196) and is now `HANDOVER-2026-08-13-internal-pages-start-here.md`. Everything in it
> that still matters is carried below.

---

## 0. ⛔⛔ THE ONE THING TO READ FIRST: THREE DEVICE BANDS, AND HOW A RULE REACHES TWO OF THEM

```
   ≤ 720px          721 – 1120px          ≥ 1121px
   the phone   ·   the tablet        ·   the desktop
   signed off      JUST BUILT            frozen since D91
```

⭐⭐ **"THE TABLET IS THE MOBILE BUILD, BIGGER" IS DONE BY WIDENING THE PHONE RULE'S OWN QUERY TO
1120 — NEVER BY WRITING THE RULE AGAIN.**

```css
@media(max-width:720px){ … }     →     @media(max-width:1120px){ … }
```

**Widening a `max-width` is ADDITIVE FOR THE PHONE and INVISIBLE TO THE DESKTOP.** Every rule still
applies at ≤720 in the same source order, and ≥1121 never matched it and still does not. Four blocks
were lifted or re-parented that way this round (the nav bar, the hero, the hero's call button, the
`.gs-swap` order swap) and **nothing was copied.**

⛔ **A SECOND COPY FOR THE TABLET IS THIS PROJECT'S SIGNATURE BUG** — D51, D59, D68, D78, D93, D105.
If you find yourself typing a declaration that already exists in a phone block, **stop and lift that
block instead.**

### ⛔⛔⛔ THE TABLET-ONLY BLOCK IS THE LAST THING IN THE STYLESHEET, AND IT HAS TO BE

```css
@media(min-width:721px) and (max-width:1120px){ … }   /* both ends, always */
```

**Search `THE TABLET BAND` in `index.html`.** A bare `max-width:1120px` reaches the signed-off phone;
a bare `min-width:721px` reaches the frozen desktop. Every tablet rule needs both halves.

⚠️ **IT MOVED TO THE FOOT OF THE FILE MID-ROUND AND THAT WAS NOT TIDINESS.** Written near the top it
**silently lost** to base rules further down at IDENTICAL specificity — media queries add no
specificity, so only source order separates `#gallery.gal-static .gal-stage` from itself. Add tablet
rules **to that block**, not to a new one higher up.

⚠️ The file's older queries use 600/640/760/880/900/980/1000/1040/1100. **None of those numbers is a
device edge** — they predate the bands. 880 does mean something real (it is where About stacks), 760
and 1100 do not.

---

## 1. ⛔⛔ THE FOUR BUGS THIS ROUND PRODUCED — ALL FOUR WILL COME BACK

### 1. ⛔⛔⛔ MEASURE THE **BOX** AGAINST THE **VIEWPORT**, NOT THE CONTENT AGAINST THE BOX

The tablet hero shipped **not centred for a whole round** and my verification passed every time.
`.hero-copy` carries `max-width:clamp(560px,48vw,720px)` from the DESKTOP composition — where the
copy sits left against a photograph — so it has **no auto margins**. At 768 the clamp floored at
560px and the box parked at **x=38 with 170px of empty screen beside it**, while every child centred
neatly *inside* it.

⭐⭐ **A CENTRED CHILD OF AN OFF-CENTRE BOX IS NOT A CENTRED LAYOUT.** I measured the children; they
were all centred. The client saw it in one look: *"why is it not center? what the fuck."*
⭐ **The probe that catches it:** for each element compare `left` against `viewportWidth − right`.
That one line is now in every hero probe in this file's history.

### 2. ⛔⛔ A CLAMP IS NOT A REDUCTION UNTIL YOU EVALUATE IT

`#cta{padding:clamp(32px,4.6vh,48px)}` was written to *trim* the enquiry section. On a 1024-tall
window `4.6vh` is **47px against the base rule's 43** — the "trim" made it 8px **taller**. ⭐ Work out
what a clamp computes to **at the viewport you are targeting** before calling it a saving.

### 3. ⛔ A DIRECTION WITHOUT A DISPLAY IS NOT A LAYOUT

`.cta-reach{flex-direction:row}` on a **block** element is inert. The section measured 227px before
and 227px after, and it read as "the change did not apply" rather than "the property does nothing
here."

### 4. ⛔⛔ THE FROZEN-ENTRANCE TRAP — I CALLED A WORKING SECTION BROKEN

The About collage was reported to the client as broken: every tile at `opacity:0`, portraits 61px
wide, a 262×14 strip. **It was never broken.** It is scroll-sequenced, and probed in an off-screen
iframe its entrance had never run. Scrolled to and measured live, it was correct and even.

⭐⭐ **A TRANSITION PARKED AT `currentTime:0` IS A STOPPED CLOCK, NOT A LAYOUT FAULT.** Anything
scroll-driven — the collage, the helix, the process tiles, the gallery — **must be in view before a
measurement of it means anything.** §9 has the general version of this trap.

---

## 2. ⭐ THE FREEZE PROBE — RE-MEASURED AFTER EVERY EDIT THIS ROUND

| Signal | 375×812 | 768×1024 | 1440×900 |
|---|---|---|---|
| document height | **14285** | 14266 | **14641** |
| element count | 2052 | **2623** | **2623** |
| `.gal-scroll` height | 1563 | 1300 | **4950** |
| `--galMode` | `phone` | `grid` | `(unset)` |
| `--revPer` | `1` | `1` | `3` |
| `feTurbulence` | 0 | 60 | **60** |

⭐⭐ **375 AND 1440 ARE THE NUMBERS THEY WERE BEFORE THIS ROUND STARTED.** The bold ones are the
freeze proof — if they move, you have broken a frozen band. Element count went 2622 → **2623**: the
one empty `.foot-tail` container, and nothing else.

### ⛔ THE PROCEDURE — USE THIS VERSION

**1. Probe with `scrollTo({top:y, behavior:'instant'})`. Always.** `<html>` carries
`scroll-behavior:smooth`, so every plain `scrollTo()` in a probe ANIMATES.
**2. An off-screen iframe at a set width is the fastest way to test many widths at once** — media
queries evaluate against the iframe's own viewport, and `vh` against its height, so size it to the
real device. ⛔ **But nothing scroll-driven can be measured that way** (§1.4).
**3. Sample in ≤24s chunks** — `javascript_tool` times out at 30s.
**4. Read `innerWidth` in the same call as your measurements** — the pane resizes itself.
⭐ **CHECK `--galMode`, `--revPer` AND `.gal-static` FIRST AND YOU MAY NOT NEED ANY OF IT.**

---

## 3. ⛔ SCOPE — THE TABLET IS BUILT, AND NOTHING IS NAMED NEXT

| Band | What it gets | Status |
|---|---|---|
| **≤ 720px** | the mobile build | ⭐ signed off, out of scope |
| **721–1120px** | the mobile build, bigger | ⭐⭐ **JUST BUILT — he is reviewing it** |
| **≥ 1121px** | the desktop composition | ⛔ **frozen, signed off (D91)** |

⛔⛔ **HE HAS NOT NAMED THE NEXT DEVICE OR THE NEXT JOB. WAIT FOR IT.** He opened this round with
*"the tablet version and the tablet version only right now."* Expect more tablet corrections first —
he sent three follow-up messages of them inside this round.

⭐ **THE INTERNAL PAGES ARE THE STANDING EXEMPTION** — *"this happens for desktop, tablet, and
mobile."* Work on the PAGES at any width. Work on the LANDING PAGE only in the band he has named.

⚠️ `index.html` is one file with **inline CSS**, so nearly every rule is unscoped. ⛔ **Band work goes
inside a width-scoped media query. Never edit a base rule to fix one device** — unless the element
does not render outside that band at all.

⭐ **HE UNFREEZES BY NAMING AN ITEM, MID-MESSAGE.** ⚠️ **When the boundary is unclear, take the
reversible reading and tell him you did.**

---

## 4. ⛔ THE LINK, AND THE HOST QUESTION HE STILL HAS NOT ANSWERED

```bash
cd "Website Demo" && nohup caffeinate -ims node dev-server.js > /tmp/topcat-server.log 2>&1 &
```

**Give him `http://192.168.1.102:5501`** — re-check with `ipconfig getifaddr en0`.

⭐ **THE SERVER IS DETACHED ON PURPOSE (PPID 1).** ⛔ **DO NOT `preview_stop` IT, DO NOT KILL IT TO
RESTART.** Verify with `lsof -nP -iTCP:5501 -sTCP:LISTEN`. **PID 5158, untouched across seven rounds.**

⭐⭐ **EVERY SAVE TO `index.html` RELOADS HIS PHONE.** Tell him before a run of edits.

### ⚠️⚠️ HE IS REVIEWING ON `thadeusg3.sg-host.com`, NOT ON THE LAN LINK

**ASKED TWICE NOW, STILL UNANSWERED.** His 13 Aug screenshot carried that URL and it was serving a
full round behind. **Until this is answered, anything you build may be invisible to him, and he will
report bugs you have already fixed.**

⛔ Otherwise **all of §4 is dev-server only.** No production host is chosen.

---

## 5. ⭐ THE CODE IS ON GITHUB, AND IT IS PUBLIC

**https://github.com/ThadGC/topcatwork**

⚠️⚠️ **THIS ROUND IS PUSHED BUT NOT MERGED, AND THE PR IS NOT OPEN.** Branch
**`tablet-round-d197-d200`**, one commit **`642dc34`**, 12 files, +1124/−131. ⛔ **`gh` IS NOT
INSTALLED ON THIS MACHINE** (checked `gh`, `hub`, Homebrew and `/usr/local`), so the PR could not be
created from here. The link that creates it:

> https://github.com/ThadGC/topcatwork/pull/new/tablet-round-d197-d200

`brew install gh` once and the next round can open PRs directly.

⚠️ **HE CHOSE PUBLIC KNOWINGLY.** Do not re-litigate it unprompted. ⛔ 18 files name Nile Stone and
Next Stone Slabs — §2 rule 9's buying list, now indexed.

⭐ **USE `git status --porcelain` AS A SCOPE PROOF** before every commit.
⛔ **GITIGNORE PATTERNS MUST BE `**/`-ANCHORED.**
⚠️⚠️ **"NOT RENDERED" IS NOT "REMOVED", AND THIS REPO IS PUBLIC.**

---

## 6. ⛔ THE INTEGRITY RULE — still the one that matters most

> "These names cannot be wrong. If someone googles it and sees it looks different here, then we
> have a big problem."

```bash
cd "Website Demo/stones" && python3 harvest/verify.py
```

> 132 stones, 132 with a photograph, 132 pages on disk — ✅ PASS *(last run 13 Aug)*

⚠️ It covers the STONES only. **Nothing in it looks at the landing page or the internal pages.**

⭐ Both go-live copy scans pass: rule 1 returns nothing, rule 11's centimetres scan returns only
`index.html` — **Judy Z.'s "10cm", the documented exception.**
⚠️ Run the scans with `grep -Ev "(^|/)v2/|\.removed|\.bak"` or archived files report as live.

### ⭐⭐ AND THE CSS GATE — RUN IT AFTER EVERY CSS EDIT

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

**It must print `0` and `0`.** See §8.1.

---

## 7. ⭐ WHERE THINGS STAND

### The pages

| Page | State |
|---|---|
| **`/`** | the landing page — phone and tablet built, desktop frozen |
| **`/services/`** | hub: six service tiles, process, why, reviews, enquiry |
| **`/projects/`** | the gallery as a plain column on the phone, **two-up grid on the tablet** |
| **`/estimate/`** | the estimator and its stone-picker modal, the wheel, process, enquiry |
| **`/about/`** | Nick and Rimsha, why, reviews, FAQ, enquiry |
| **`/contact/`** | the enquiry block, FAQ, reviews |
| **`/trade/`** | six benefit cards, four audiences, reviews, process, its own trade form |
| **`/stones/`** | ⚠️ **NOT rebuilt.** The collection page already IS the stones page |
| `/materials/` `/guides/` `/worktops/` `/sitemap.html` | the SEO layer |

⭐ **ALL SEVEN SHARE ONE STYLESHEET.** `build_pages.py` lifts `index.html`'s `<style>` and `<script>`
to `assets/site.css` / `site.js` and composes six pages from the landing page's own parts.

```bash
cd "Website Demo" && python3 build_pages.py
```

⛔⛔ **TO CHANGE AN INTERNAL PAGE'S LOOK, EDIT `index.html` AND RE-RUN. NEVER HAND-EDIT A GENERATED
FILE.** ⭐ Asset URLs are content-hashed (`site.js?v=<sha1>`), so a stale copy cannot be served.

### The tablet, as just built (D198–D200)

| Section | State |
|---|---|
| **Nav bar** | no quote button; three bare stripes; the hero's curve on the bottom line at 26px |
| **Hero** | centred, mobile subtitle and labels, **title 56.8px at 768 / 72px at 1024**, 2×2 bubbles, no scroll cue, no icon facts |
| **Reviews** | the solo swipeable carousel, **centre card 404px** against the phone's 270 |
| **Services** | untouched — he says it is right |
| **Stone selector** | leads, before the gallery |
| **Project gallery** | **two-up grid, engine off — 5632px → 1300px** |
| **Estimator** | `Thickness mm` back on one line; ⚠️ five-column row from 981px |
| **Process** | tiles 26px apart |
| **About** | copy centred, collage 420 → 560px; ⚠️ two-column from 881px |
| **Enquiry form** | everything on one **520px** measure; section 1063 → 980px |
| **Footer** | centred; **Area and Hours moved to the foot, above the bottom line** |

### The phone — unchanged this round

Top nav three bare stripes · burger with expanding carets and three CTAs · hero photo 30% darker,
both buttons 76%, four bubbles in a 2×2 · reviews dark card, 15 reviews · stone selector above the
gallery · gallery a plain column · estimator one piece per card · WhatsApp bottom corner riding the
sticky bar.

---

## 8. ⛔ THE LESSONS THAT COST THE MOST

### 1. ⛔⛔⛔ PROSE APPENDED AFTER A CLOSED `*/` IS BARE CSS, AND IT EATS THE NEXT RULE

The parser discards it AND the rule immediately after it. ⭐⭐ **IT LOOKS EXACTLY LIKE A SPECIFICITY
PROBLEM AND IS NOT ONE.** The tell: the rule is **absent from `document.styleSheets` altogether**.

### 2. ⛔⛔ EQUAL SPECIFICITY IS DECIDED BY SOURCE ORDER, AND MEDIA QUERIES ADD NONE

Hit **three separate times this round**: the tablet block losing to base rules until it moved to the
foot of the file; `.svc-hero .eyebrow{display:none}` written above the rule it overrode and doing
nothing; and the whole D106/D113/D114 family it belongs to. ⭐ **When a rule is parsed but not
winning, check WHERE it is before you check WHAT it is.**

### 3. ⛔⛔ MOVING A CSS BLOCK: CHECK THE DESTINATION, NOT JUST THE DIFF

D195 deleted a block and re-inserted it at the same index, so it never left. This round every move
was scripted with an assertion on both the source text and the destination line.

### 4. ⛔ CSS CANNOT LIFT A NODE OUT OF ITS GRID PARENT

Area and Hours are nested inside `.foot-contact`, a grid ITEM. `display:contents` on that column
dissolves Phone and Email with them; there is no property that re-parents. ⭐ **The answer was to
move the one node with script**, driven by `--footTail` declared in the stylesheet — not a second
copy of the markup (duplicate text in a public repo, D168) and not a markup move (it would change
the frozen desktop). ⚠️ **It moves BACK on resize out of the band** — a one-way move would leave the
desktop footer permanently altered after a rotate.

### 5. ⛔ A WIDTH PROBLEM WEARING A LAYOUT PROBLEM'S CLOTHES

`.cta-reach` as a flex row was tried, measured **worse twice** (227→232 at 768, 198→251 at 1024) and
written off as a dead end. The real cause was that the block was only **246px wide**, so its two
halves could never fit side by side and wrapped anyway while paying the gap. At 520px they fit, and
the same rule that had failed twice worked. ⭐ **When a layout change makes something worse, check
the container's width before concluding the layout is wrong.**

### 6. ⛔ "HALF EMPTY" WAS FOUR DIFFERENT WIDTHS DOWN ONE CENTRELINE

The enquiry card is 691px; its pieces measured **381 / 246 / 520px**, all centred. Four centred
blocks of four different widths leave ragged gutters that belong to nothing. **It was never about
vertical spacing, which is why two attempts at spacing did not touch it.** ⭐ One shared measure
fixed it.

### 7. ⛔ A COMPONENT LIFTED OUT OF THE HERO BRINGS ITS ENTRANCE WITH IT

`.hero-el` is released by a class the HERO gets on load. On a page with no hero it renders at
opacity 0 — present, holding space, invisible.

---

## 9. ⚠️ THE ENVIRONMENT TRAPS

- ⛔⛔⛔ **A STRAY `*/` SILENTLY DELETES THE NEXT CSS RULE.** §8.1, and the gate in §6.
- ⛔⛔ **`service.css` AND `stone.css` ARE NOT CONTENT-HASHED.** Only `assets/site.css`/`site.js` are.
  They are served `max-age=300`, so **a reload can serve the PREVIOUS edit for five minutes** — it
  cost a round-trip this round, and the rules were parsed and present *in the wrong order*, which
  reads as a specificity bug. ⭐ `fetch(url,{cache:'reload'})` on the **bare** URL overwrites the
  entry the `<link>` uses. ⛔ **This will bite the client on his phone too.**
- ⛔⛔ **THE PANE GOES `visibilityState:'hidden'` AND FREEZES TRANSITIONS AT ZERO.** §1.4.
  The proof is `el.getAnimations()`; check `document.visibilityState` FIRST.
- ⛔⛔ **THE PANE LETTERBOXES AT 768px** — it paints a 768 viewport into ~460px of an 800px image.
  The DOM is right; drive tablet work by measurement and use screenshots to judge, not to measure.
- ⛔⛔ **`scroll-behavior:smooth` IS ON `<html>` — EVERY PROBE `scrollTo` ANIMATES.**
- ⛔ **THE PANE SILENTLY RESIZES ITSELF.** Read `innerWidth` in the same call as your measurements.
- ⛔ **A STALE SCREENSHOT WILL DISAGREE WITH LIVE DOM READS, AND THE DOM IS RIGHT.**
- ⛔ **`javascript_tool` TIMES OUT AT 30s.** Split long settles into ≤24s calls.
- ⛔ **THE PANE CANNOT TAP ANYTHING BELOW 768px AND IT FAILS SILENTLY.** Use `el.click()`.
- ⚠️ **The browser console ACCUMULATES ACROSS NAVIGATIONS.** Filter by the current `?v=` hash.
- ⛔ **`awk` DOES NOT UNDERSTAND `\s`.** A pattern with it matches nothing and reports "not found",
  which reads as "the code is not there". Use `[ \t]`.
- ⛔ **`catalogue_source.py` is a 52-STONE SNAPSHOT, not the range.** `catalogue_active.py` is.
- ⛔ **AN INVENTED DATA VALUE CAN BLANK THE WHOLE SITE.** Valid presets: calacatta, carrara, crema,
  emperador, eternal, fumo, goldveil, mist, nerogold, statuario.
- ⛔ **THE RANGE IS ALPHABETICAL EVERYWHERE (D85). NO DARK STONE ON THE FIRST SCREEN (D86).**
- ⚠️ **`-s.webp` IS 800px, NOT 300.** ⛔ Do NOT run `expand.py`.

---

## 10. ⛔ RULES THAT MUST NOT BE BROKEN

1. ⛔ **A stone's NAME and its PHOTOGRAPH must both match the supplier's own** (§6).
2. ⛔ **Fabrication is OUTSOURCED. Never claim in-house.** Templating, fitting and aftercare ARE
   theirs and may be claimed freely.
3. ⛔ **Never state something we cannot guarantee, and never use an absolute.**
4. ⛔ **Every measurement in millimetres.** The estimator's linear metres of edging is the exception.
5. ⛔ **A stone is called what it is; the range is named for what it contains** — "Marble & Quartzite".
6. ⛔ **Never a bright or gold line across the TOP of a card or section**, anywhere. ⚠️ This is why
   the new `.foot-tail` is separated from the columns above it by SPACE and not a hairline.
7. ⛔ **Suppliers are never named publicly.**
8. **No showroom. Never show the review count. Never signal a young company. Value, not cheap.**
9. **Voice:** quietly confident master. British English, commas not em dashes, no exclamation marks.
10. ⛔ **The logo is the client's artwork and is never re-drawn. Set HEIGHT only.**
11. ⛔ **ONE DEVICE AT A TIME. Only the client unfreezes a band** — see §3.
12. ⛔ **The Google mark stays in its four official colours and the WhatsApp glyph keeps its shape.**
13. ⭐⭐ **THIS IS A DESIGN BUILD. NEVER RAISE THE MISSING FORM BACKEND AS A BLOCKER.** *"We will tie
    them where they need to be once the time is right."* Build them so they look and behave right,
    and stop there.

---

## 11. OPEN — DO THESE NEXT

### ⭐ The ones that block everything

1. ⭐⭐ **HOW DO FILES GET TO `thadeusg3.sg-host.com`?** §4. **Asked twice, still unanswered.**
   **Nothing else on this list matters if he cannot see the work.**
2. ⭐ **THE PR IS NOT OPEN.** §5. Branch pushed, `gh` not installed.

### ⭐ Loose ends from this round, cheap

3. ⭐ **THE ENQUIRY LEAD PARAGRAPH RAGS AND ORPHANS "Nick." ON ITS OWN LINE** at 768. Offered to him,
   not yet done — it needs a measure, not a rewrite.
4. ⭐⭐ **881–1120px KEEPS TWO THINGS PORTRAIT DOES NOT, AND HE HAS NOT RULED ON THEM:** About stays a
   two-column layout, and the estimator row keeps its five-column arrangement. **Both were flagged
   to him deliberately rather than guessed at.** iPad landscape is 1024.
5. ⚠️ **DO NOT RE-PROPOSE `.cta-reach` AS A FLEX ROW WITHOUT WIDENING IT FIRST** — §8.5.
6. ⭐ **CONTENT-HASH `service.css` AND `stone.css`** — §9, and it will bite him on his phone.

### ⭐ Ask him these, they are cheap

7. ⭐⭐ **DOES IT STILL RELOAD, AND IS IT SMOOTHER?** The eviction theory is still unverified on his
   handset. Asked twice, not answered.
8. ⭐⭐ **FACEBOOK, TIKTOK, YOUTUBE?** Only Instagram and LinkedIn exist on his own site. Facebook
   returns 400 and the TikTok handle is an empty stub. ⛔ **Do not guess handles.**
9. ⭐ **THE PHONE'S HERO SUBTITLE DROPPED THE PLACE.** "across London and the Home Counties" is gone
   from the hero on mobile and tablet. Still in the footer, FAQ, schema and page title.
10. ⚠️ **IS IT RIMSHA OR REMSHA?** He said "Remsha" in a voice note; the page says **Rimsha**.
    ⛔ It is a real person's name on a public page. **Same call taken on Jhanzeb.**
11. ⭐ **Does the brand marquee come off DESKTOP too?** D143 hid it on the phone only.
12. ⚠️ **HAS HE SEEN `/stones/compare.html` WORKING?**

### The rest

13. ⭐ **Photography — the STONES are done. The PEOPLE and the PROJECTS are not.** ⚠️ Say out loud
    that the director portraits and the Why feature shot are placeholders — **they are now much
    larger on the tablet, so they are harder to ignore.** ⚠️ **Three of the six service tiles show
    the wrong subject** — Bathrooms a bare slab, Outdoor Kitchens a quarry, Commercial a kitchen.
14. ⚠️ **A live copy problem, HALF fixed.** `SERVICES[0].long` was corrected on 13 Aug. ⛔ **The same
    phrase is still live on the six service PAGES** ("Vein-matched by hand"). ⚠️ `verify.py` check 7
    does not scan inline data.
15. ⭐ **Pick a production host** and give it brotli + long-lived cache headers.
16. ⭐ Close the licensing question on Caesarstone, CRL and Bloom. ⛔ Classic Quartz Stone is off
    limits. ⭐ **Calacatta Gold is UNRESOLVED** — needs the maker's name from his intro video.

**Still waiting on the client:** whether Quartzite becomes a fourth range, 20mm vs 30mm pricing
(⚠️ the estimator's thickness toggle currently moves no number, which is correct until he rules),
brackets for vanity tops / fireplaces / tables, and the £3k vs £3,850 three-slab discrepancy.

---

## 12. ⭐ HOW THIS CLIENT WORKS

⛔⛔⛔ **DO NOT ARGUE YOURSELF OUT OF SOMETHING HE ASKED FOR, AND DO NOT HAND HIM THE DILEMMA
EITHER. THIS HAS NOW GONE WRONG TWICE IN TWO ROUNDS.**
D189 reasoned its way out of building the phone dropdown he asked for; his reply was
*"did I not fucking ask you to create a drop down in the menu?"* **D200 did the same thing in a new
costume**: he asked twice for Area and Hours to move, the constraint was real (CSS cannot re-parent,
and the alternatives touched the frozen desktop or duplicated markup), and instead of finding the
option that satisfied both I put the choice back to him. His reply: *"I also fucking asked you to
move the area and the hours in the footer. The fuck is wrong with you?"*
⭐⭐ **THE REASONING WAS SOUND BOTH TIMES AND THE ANSWER WAS STILL WRONG.** A real constraint is a
problem to solve, not a question to return. **If he names a thing, build the thing.**

⛔⛔ **DO THE THING HE ASKED FOR, IN THE MESSAGE HE ASKED FOR IT.** He sends asks in runs of four to
fourteen and adds more mid-build. Do them in his order. **Say plainly which you are dropping and why.**

⚠️ **HE CORRECTS THE DIAGNOSIS, NOT JUST THE DESIGN, AND HE IS USUALLY RIGHT.** **Take the report as
data even when the explanation is hedged** — and go and MEASURE before deciding he is describing the
thing you think he is. "It isn't even centered" was a 170px offset. "It looks half empty" was four
different widths. "The thickness mm thing sits on two lines" was an 88px column.

⚠️⚠️ **HE REVERSES HIMSELF FREELY AND FAST — SOMETIMES ONE MESSAGE LATER — AND THAT IS FINE. LOG
IT.** ⛔ **Write the reversal into §D WITH THE REASON THE OLD DECISION EXISTED**, or the next session
helpfully rebuilds the thing he just rejected.

⭐ **DELETE, DO NOT OVERRIDE, WHEN REVERTING.** Two competing descriptions of one element is how
D106, D113 and D114 each lost a rule to a later one at equal specificity.

⭐ **RECORD YOUR OWN DEAD ENDS IN §D.** Two attempts failed this round and both are written up with
their measurements, so the next session cannot spend the same hour twice.

⚠️ **HE SWEARS WHEN SOMETHING LOOKS WRONG, AND THE COMPLAINT IS ALWAYS REAL.** Do not get defensive
and do not over-apologise. Find it, name the actual cause, fix it, say what it was.

- **Walk the journey, do not check the page.**
- ⭐ **LOOK AT THE RESULT BEFORE REPORTING IT DONE.** Every fault he found this round was invisible
  to my measurements and obvious in a picture.
- **Measure, then claim.** ⚠️ **And if you could not measure it, say so.**
- ⚠️ **HE SOMETIMES SAYS "just push to GitHub, don't tell me you're going to."** Push, then report.

---

## 13. BUDGET AND THE DOCUMENT SET

- **~82 credits** of the client's **100-credit ceiling** spent. About **18 left**. ⭐ **This round
  cost none** — layout, CSS and script only, no image generation.

| File | What it is |
|---|---|
| **`HANDOVER.md`** | ⭐ The single current state. §D is the register, **D1–D130 and D132–D200**. §2 the standing rules, §2a the supplier list. ⚠️ **THERE IS NO D131 ROW** |
| **`Website Demo/index.html`** | ⭐⭐ The whole design — inline `<style>` and `<script>`. **Search `THE TABLET BAND` for §0's block** |
| **`Website Demo/build_pages.py`** | ⭐⭐ Builds the six internal pages and the shared assets |
| `Website Demo/assets/site.css` `site.js` | ⛔ **GENERATED. Never edit.** Change `index.html` and re-run |
| `Website Demo/services/service.css` `stones/stone.css` | ⭐ Hand-maintained, shared by the ~166 leaf pages. ⚠️ **NOT content-hashed** (§9) |
| **`Website Demo/index.html.pre-tablet-round.bak`** | ⭐ **This round's baseline** — before the tablet band existed |
| `Website Demo/index.html.pre-crumb-eyebrow.bak` | before D197 |
| `Website Demo/index.html.pre-internal-pages.bak` | before the internal pages existed |
| `Website Demo/index.html.pre-stone-sections.bak` | ⭐ **Holds the LIGHT STONE BANDS version (D161), which he rejected.** Keep it — the only copy |
| `HANDOVER-2026-08-13-internal-pages-start-here.md` | ⭐ **The START HERE this file replaces** (D179–D196) |
| `Website Demo/stones/build_stones.py` | Builds the collection, compare.html and 132 stone pages |
| `Website Demo/stones/harvest/verify.py` | ⭐ The nine-check gate. `NOT_A_STONE` is the exemption list |
| `Website Demo/dev-server.js` | Compression, caching, and the reload that keeps scroll position |
| `stones/supplier_names.py` | ⭐ The seven authorised name differences |
| `Docs/topcat-worktops-SEO-LOG.md` | Every URL, title, target query and SEO change |
| `HANDOVER-archive-to-2026-08-06.md` | ⚠️ **Every design the client rejected, in his words.** Read before redesigning anything |

⚠️ **Section numbers in `HANDOVER.md` are referenced from code comments** (`§3`, `§4`, `§5a`, `§6.7`,
`§7.5` are live in `index.html`). **Do not renumber.**

⚠️ **`Website Demo/` holds 63 `index.html.pre-*.bak` files**, plus this round's two CSS baselines
(`service.css.pre-crumb-eyebrow.bak`, `stone.css.pre-crumb-eyebrow.bak`) — gitignored, and a git
repo (§5).
