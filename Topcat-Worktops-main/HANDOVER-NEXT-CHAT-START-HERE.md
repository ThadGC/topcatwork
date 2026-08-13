# START HERE — 13 August 2026, end of the PERFORMANCE AND HERO ROUND

Read this, then `HANDOVER.md` **§D** (the decision register, newest first — this round is
**D162–D178**) and **§2** (the standing rules, especially **rule 9** and **rule 15**). That is about
fifteen minutes and it is enough to work safely.

> ⚠️ **This replaces the previous version of this same file**, which covered the eighteen-ask
> mobile round (D144–D161). Everything in it that still matters is carried below.

---

## 0. ⛔⛔ THE ONE THING TO READ FIRST: THE LAG WAS REAL, IT WAS MEASURED, AND THE FIX IS UNVERIFIED

He said three things in one message: *"the review section, the animation, is extremely laggy… as you
scroll down some of the rest of the site is also laggy… and when I scroll too quickly, for some
reason, it's just reloading the site on my side. It could be a problem on my phone, it could not."*

⭐⭐ **HE WAS RIGHT AND IT WAS NOT HIS PHONE.** Measured at 375×812 **before** any edit:

| Signal | Before | After |
|---|---|---|
| elements carrying a live `filter` | **431** | **231** |
| `feTurbulence` (per-pixel fractal noise) | **63** | **0** |
| `feGaussianBlur` | **42** | **0** |
| elements holding `will-change` (permanent GPU layers) | **107** | **18** |
| DOM elements | 2,590 | 1,991 |

⭐ **WHY THE REVIEWS WERE WORST, WHICH IS THE PART THAT NAMES THE BUG:** `marbleSVG()` stacks THREE
`feTurbulence` (octaves 3, 3, 4) plus two displacement maps, and it was called with a DIFFERENT SEED
for 16 review cards and 6 Why tiles, so nothing could be cached between them. **A live SVG filter is
re-evaluated whenever its element is re-rasterised, and a transform re-rasterises** — so every frame
of the review roll was recomputing fractal noise for the card in flight.

⭐ **WHY THE TAB RELOADED:** iOS Safari kills and silently reloads a tab whose renderer exceeds its
memory budget, and a promoted layer costs `w × h × 4` bytes whether or not anything moves. **67 of
the 107 were the stone wheel's slabs**, most of them off-screen. It presents as "it reloaded", never
as "out of memory", which is why it read as a phone problem for three rounds.

⚠️⚠️ **THE COUNTS ARE MEASURED. THE EVICTION IS THE DOCUMENTED BEHAVIOUR THAT FITS THEM, AND IT IS
NOT VERIFIED ON HIS DEVICE. ASK HIM WHETHER IT STILL RELOADS.** That is open item 1.

⭐ **THE FIX CHANGED THE RENDERING PATH, NOT ONE PIXEL.** `marbleFill()` hands the same SVG string to
the image decoder as a `data:` URI, so it is rasterised once and cached as a bitmap. Same seeds, same
marbles. ⛔ **That mattered: D156 and D160 tuned this texture BY EYE, twice.** Anything that re-cut
the noise would have quietly undone both.

---

## 1. ⭐ THE FREEZE PROBE — NEW BASELINE, RE-MEASURED AFTER EVERY EDIT TODAY

**Final state verified at 1440×900 and 768×1024:**

| Signal | 1440×900 | 768×1024 |
|---|---|---|
| document height | **14641** | **18418** |
| element count | **2577** | **2577** |
| gallery cards | `413.2×273 ×4, 199.9×132.1 ×4` | `210.1 / 210.5 / 210.9 / 211.4` and `105.4 / 105.6 / 105.8 / 106.1` |
| `.gal-scroll` height | — | **5632** |
| `--galMode` / `--svcMode` / `--stoneRaster` | `(unset)` | `(unset)` |
| `.gal-static` class on `#gallery` | **false** | **false** |
| `feTurbulence` in document | **60** | **60** |
| review card | dark, `rgb(21,21,27) → rgb(14,14,18)` | same |

⚠️ **THE 768 HEIGHT MOVED FROM 18385 TO 18418 AND THAT IS EXPECTED, NOT DRIFT** — the footer's new
social row (D178) adds 33px there and nothing at 1440. **Element count moved 2,590 → 2,541 → 2,577**:
−49 for Tabrez's review card (D168), then +9 for the Google chip markup, +10 for the CTA labels and
the WhatsApp button, +17 for the subtitle spans, the score and the social row. Every step accounted.

### ⛔ THE PROCEDURE — USE THIS VERSION

**1. Probe with `scrollTo({top:y, behavior:'instant'})`. Always.** `<html>` carries
`scroll-behavior:smooth`, so every plain `scrollTo()` in a probe ANIMATES.
**2. At 768, park at `galScrollTop + 2000` and CONVERGE — poll card widths until three consecutive
reads agree.** Settles in ~9s. A fixed wait passes spuriously.
**3. The tells differ.** 1440 must be FLAT (all four big cards equal); **768 is a clean rising
progression** (210.1 → 211.4) and that is the real layout — do not "fix" it.
**4. Sample in ≤24s chunks** — `javascript_tool` times out at 30s.
⭐ **CHECK `--galMode` AND `.gal-static` FIRST AND YOU MAY NOT NEED ANY OF IT.** Both are
unset/false above 720px, which proves the phone branch never ran.

---

## 2. ⛔ SCOPE

**DESKTOP AND TABLET ARE FROZEN. THE WORK IS MOBILE, ON HIS PHONE, OVER THE LAN LINK.**

| Band | What it gets | Status |
|---|---|---|
| **≤ 720px** | the mobile build | ⭐ live scope |
| **721–1120px** | the old tablet/fallback layouts | ⛔ **frozen** |
| **≥ 1121px** | the desktop composition | ⛔ **frozen, signed off (D91)** |

⚠️ `index.html` is one file with **inline CSS**, so nearly every rule is unscoped. ⛔ **Mobile work
goes inside `@media(max-width:720px)`. Never edit a base rule to fix mobile.**

⭐ **HE UNFREEZES BY NAMING AN ITEM, MID-MESSAGE.** This round he named the footer (D178) and "the
site" for the WhatsApp button (D173) — both were built at every width **because they are ADDITIVE**:
a new row and a fixed overlay that re-compose nothing. ⚠️ **When the boundary is unclear, take the
reversible reading and tell him you did.**

⭐ **NEW MARKUP CANNOT BE SCOPED BY A MEDIA QUERY (D120).** Default it to `display:none` in the base
rule and let the phone opt in. This round it carried the Google mark, the reason bubbles, the two
CTA label lengths and the phone's own subtitle — **five separate uses, all in `.g-mark,.g-stack,
.chip-reason,.cta-short,.hs-phone{display:none}`.**
⭐ **AND FOR A COPY CHANGE, THE IDIOM IS TWO SPANS, ONE SHOWN** — `.svc-sub-long`/`.svc-sub-short`
(D96) is the precedent, and `.hs-wide`/`.hs-phone` (D175) now follows it.

⚠️ **`--faqMode` / `--galMode` / `--svcMode` / `--hxMode` / `--stoneRaster` ARE THE IDIOM FOR "IS
THIS A PHONE?"** — declared in CSS, read back by script. ⛔ A second `matchMedia` in JS is this
project's most repeated bug (D51, D59, D68, D78, D93, D105).

---

## 3. ⛔ THE LINK

```bash
cd "Website Demo" && nohup caffeinate -ims node dev-server.js > /tmp/topcat-server.log 2>&1 &
```

**Give him `http://192.168.1.102:5501`** — re-check with `ipconfig getifaddr en0`.

⭐ **THE SERVER IS DETACHED ON PURPOSE (PPID 1).** ⛔ **DO NOT `preview_stop` IT, DO NOT KILL IT TO
RESTART.** Verify with `lsof -nP -iTCP:5501 -sTCP:LISTEN`. **PID 5158, untouched across five rounds.**

⭐⭐ **EVERY SAVE TO `index.html` RELOADS HIS PHONE.** Tell him before a run of edits.

### ⛔ `stone.css` IS CACHED FOR FIVE MINUTES
`index.html` is `no-cache`; **assets are `public, max-age=300`**. Prove it before debugging anything:
`fetch('/stones/stone.css?bust='+n)` against `document.styleSheets`. ⚠️ Warn the client too.

⛔ **ALL OF §3 IS DEV-SERVER ONLY.** No production host is chosen.

---

## 4. ⭐ THE CODE IS ON GITHUB, AND IT IS PUBLIC

**https://github.com/ThadGC/topcatwork** — **4 commits on `main`, HEAD `d10d8ec`, 13 Aug.**

⚠️ **HE CHOSE PUBLIC KNOWINGLY.** Do not re-litigate it unprompted. ⛔ 18 files name Nile Stone and
Next Stone Slabs — §2 rule 9's buying list, now indexed. A private repo with collaborators gives his
devs identical access; the offer stands.

⭐ **USE `git status --porcelain` AS A SCOPE PROOF.** Every round this week it confirmed only
`Website Demo/index.html` and `HANDOVER.md` changed, and **nothing under `stones/*.html`**.

⛔ **GITIGNORE PATTERNS MUST BE `**/`-ANCHORED** — a pattern with a slash is anchored to the repo
root and the site lives at `Topcat-Worktops-main/Website Demo/…`.

⚠️⚠️ **"NOT RENDERED" IS NOT "REMOVED", AND THIS REPO IS PUBLIC.** D168 was nearly shipped by adding
a name to a runtime `.filter()`, which took the card off the deck **and left the review verbatim in
the page source**. If he asks for content to come off, delete it from what ships.

---

## 5. ⛔ THE INTEGRITY RULE — still the one that matters most

> "These names cannot be wrong. If someone googles it and sees it looks different here, then we
> have a big problem."

```bash
cd "Website Demo/stones" && python3 harvest/verify.py
```

> 132 stones, 132 with a photograph, 132 pages on disk — ✅ PASS *(last run 13 Aug)*

⚠️ It covers the STONES only. **Nothing in it looks at the landing page**, which is where all of this
round's work landed. `NOT_A_STONE` is the exemption list — keep it exact.

⭐ Both go-live copy scans pass: rule 1 (in-house fabrication) returns nothing, and rule 11's
centimetres scan returns only `index.html` — **Judy Z.'s "10cm", the documented exception.**
⚠️ Run the centimetres scan with `grep -Ev "(^|/)v2/|\.removed"` or it also reports an archived file
under `stones/.removed-2026-08-10/`, which is not live.

### ⭐⭐ AND A NEW GATE — RUN IT AFTER EVERY CSS EDIT

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

**It must print `0` and `0`.** See §7.1 — this caught a live bug twice in one day.

---

## 6. ⭐ WHERE THE PHONE STANDS

| Section | State |
|---|---|
| **Top nav** | burger is three bare stripes, no box (D132) |
| **Hero** | ⭐ **REBUILT THIS ROUND.** Title 80px under the nav; its own subtitle *"Quartz, granite and marble worktops, chosen with you and fitted by our own team."* (D175); **Free quote stacked above Call us** (D177); four bubbles — **Google / ★★★★★ 5.0** with the real Google mark (D170/D176), **10 year guarantee**, **72-hour aftercare**, **Quick turnaround time** (D172); **no scroll arrow** (D174); even 35/34/35 gaps. The three icon facts are `display:none`, not deleted |
| **Reviews** | ⛔ **BACK TO THE DARK CARD** (D167, reversing D116/D156/D160). No entrance (D134/D145). **15 reviews — Tabrez Chaudhry removed** (D168) |
| **Services** | popularity order, tiles link to their page, gold rim, 7px corners (D146). ⭐ **Photographs at FULL BRIGHTNESS** — the scrim only covers the two type bands (D162) |
| **Project gallery** | ⛔⛔ **NO ANIMATION AT ALL. A plain natively-scrolled column of 8 cards, 331×145** (D163). No pin, no runway, no rAF. **No gold rim, nothing on finger-touch** (D164/D165). Tapping still opens the project |
| **Stone wheel** | bend 30, card 0.80, cap 390, bare gold arrows (D135–D138) — ⛔ untouched for three rounds. ⭐ `will-change` dropped from its 67 slabs (D166) |
| **Estimator** | rebuilt: one piece = one labelled card (D148) |
| **Process** | title 89.5px under the divider (D149) |
| **About** | Nick and Rimsha only, two 3:4 plates — **DESKTOP TOO** (D150); copy centred, phone only (D151) |
| **FAQ** | plain accordion; nothing open on arrival (D152/D154) |
| **Footer** | centred head, badge pills, full-width contact pills (D153/D159). ⭐ **NEW: a social row — Instagram, LinkedIn, WhatsApp** (D178) |
| **Floating button** | ⭐ **NEW: WhatsApp, black and gold, bottom-right, clears the sticky bar by 14px** (D173). Number `447464940287` |
| Page floor | veil 0.46 (D123). ⛔ Every section dark — light bands were built and rejected (D161) |
| Sticky bottom bar | Get a quote · Email · Call (D99/D106) |
| Everything else | ⛔ untouched — still the desktop-era layout at phone width |

---

## 7. ⛔ THE LESSONS THAT COST THE MOST

### 1. ⛔⛔⛔ PROSE APPENDED AFTER A CLOSED `*/` IS BARE CSS, AND IT EATS THE NEXT RULE

Twice in one day, both mine. A comment was extended by typing under it — but the `*/` was already
there, so the new text sat in the stylesheet as garbage. **The parser discarded it AND the rule
immediately after it.** `#hero .hero-cue{display:none}` silently did nothing while the rules further
down applied normally.

⭐⭐ **IT LOOKS EXACTLY LIKE A SPECIFICITY PROBLEM AND IS NOT ONE.** The tell: the rule is **absent
from `document.styleSheets` altogether**, not merely outranked. Walk the sheet and check
`el.matches(selectorText)` — if nothing matches, it was never parsed.
⛔ **The first instance had been live for a whole round before it was found.** §5 now has the gate.

### 2. ⛔⛔ WHEN A CHANGE HAS A COST SOMEWHERE ELSE, THE COST STAYS BEHIND — FOURTH TIME

`#gallery` carried `margin-top:-70px`, written by D129 purely to cancel a nav reserve inside
`.gal-mid`. The gallery rebuild deleted the reserve and **left the compensation**, so the section rode
up and **the divider ran straight through "View our project gallery"**. He found it in a screenshot.

⭐ **EVERY MEASUREMENT I TOOK WAS INSIDE THE GALLERY; THAT NUMBER DESCRIBES THE JOIN TO THE SECTION
ABOVE IT.** After changing a value, grep for what was derived from it — and look at the seams.
Previous three: D142/`animPx`, D156/`--gold-lo`, D154/the FAQ drawer.

### 3. ⛔ REMOVING A THING LEAVES ITS SPACE BEHIND, AND THE HERO TOOK THREE PASSES

Cutting the fact row freed ~101px, and because `.hero-inner` is a block in normal flow it **all
pooled at the bottom as one hole**. Pass 1 spent it on the gaps; pass 2 respent it after the layout
changed again; pass 3 he said *"the gaps in between is just too big"* — because the scroll arrow was
a hard floor forcing the space between elements rather than above them. **Removing the arrow was what
finally let the space go where he wanted it.**

### 4. ⛔ "REMOVE THE ANIMATION" AND "IT IS LAGGING" WERE ONE FIX, AND FREEZING WOULD HAVE FAILED BOTH

Pinning the accordion at `q=1` would have removed the animation and kept the machine — a sticky pin,
a viewport-tall stage and eight absolutely-positioned cards moved by a scroll-derived transform every
frame. **That answers his words and not his complaint.** The engine is stopped instead: `measure()`
returns early, and **both `frame()` AND `render()` bail** — `render()` needed its own guard because
it is called directly at boot, and **an inline style beats a stylesheet rule**.

### 5. ⚠️ A LAYOUT CHANGE CAN COST A LINE ITS BREAK POINT

Putting the hero subtitle in a bordered pill stranded "by us" on a line alone: `.nowrap` holds a
283px phrase together and the first sentence measures 290px, so the measure had to land in a **7px
window**. ⭐ **`text-wrap:balance` was the obvious reach and is WRONG here** — it evens the lines it
CAN break and cannot break the locked phrase, producing a ragged ascending wedge. The pill was
removed the next message and the problem went with it.

### 6. ⚠️ A BRAND-NAME SEARCH IS ACTIVELY DANGEROUS FOR SOCIAL LINKS

Searching "TopCat Worktops" surfaces Top Cat Furniture, Top Cat Media Group and unrelated "topcat"
handles. ⭐ **The two real profiles came off TopCat's own live site and were then checked for a 200.**
Facebook returned 400 and the TikTok handle serves an empty stub, so neither was added. **Never fill
a social row by guessing a handle.**

---

## 8. ⚠️ THE ENVIRONMENT TRAPS

- ⛔⛔⛔ **A STRAY `*/` SILENTLY DELETES THE NEXT CSS RULE.** §7.1, and the gate in §5.
- ⛔⛔ **`scroll-behavior:smooth` IS ON `<html>` — EVERY PROBE `scrollTo` ANIMATES.**
- ⛔⛔ **THE PANE GOES `visibilityState:'hidden'` AND THEN SILENTLY IGNORES `scrollTo`.** ⭐ Check
  `document.visibilityState` FIRST. `tabs_select` did not front it; **`tabs_create` + `navigate` did.**
- ⛔ **A STALE SCREENSHOT WILL DISAGREE WITH LIVE DOM READS, AND THE DOM IS RIGHT.**
- ⛔ **`javascript_tool` TIMES OUT AT 30s.** Split long settles into ≤24s calls.
- ⛔ **THE PANE CANNOT TAP ANYTHING BELOW 768px AND IT FAILS SILENTLY.** Use `el.click()`.
- ⚠️ **THE PANE DOWNSCALES A 1440px VIEWPORT INTO AN ~800px IMAGE** — measure desktop, don't look.
- ⚠️ **`zoom` with a `region` is not supported.** Apply a temporary `transform:scale()` with a corner
  `transform-origin` and screenshot that — 2.3× proved the service-tile numerals this round.
- ⛔ **`catalogue_source.py` is a 52-STONE SNAPSHOT, not the range.** `catalogue_active.py` is.
- ⛔ **AN INVENTED DATA VALUE CAN BLANK THE WHOLE SITE.** Valid presets: calacatta, carrara, crema,
  emperador, eternal, fumo, goldveil, mist, nerogold, statuario.
- ⛔ **THE RANGE IS ALPHABETICAL EVERYWHERE (D85). NO DARK STONE ON THE FIRST SCREEN (D86).**
- ⚠️ **`-s.webp` IS 800px, NOT 300.** ⛔ Do NOT run `expand.py`.

---

## 9. ⛔ RULES THAT MUST NOT BE BROKEN

1. ⛔ **A stone's NAME and its PHOTOGRAPH must both match the supplier's own** (§5).
2. ⛔ **Fabrication is OUTSOURCED. Never claim in-house.** Templating, fitting and aftercare ARE
   theirs and may be claimed freely.
3. ⛔ **Never state something we cannot guarantee, and never use an absolute.**
4. ⛔ **Every measurement in millimetres.** The estimator's linear metres of edging is the exception.
5. ⛔ **A stone is called what it is; the range is named for what it contains** — "Marble & Quartzite".
6. ⛔ **Never a bright or gold line across the TOP of a card or section**, anywhere.
7. ⛔ **Suppliers are never named publicly.**
8. **No showroom. Never show the review count. Never signal a young company. Value, not cheap.**
9. **Voice:** quietly confident master. British English, commas not em dashes, no exclamation marks.
10. ⛔ **The logo is the client's artwork and is never re-drawn. Set HEIGHT only.**
11. ⛔ **ONE DEVICE AT A TIME. Desktop is frozen and only the client unfreezes it** — see §2.
12. ⛔ **The Google mark stays in its four official colours and the WhatsApp glyph keeps its shape.**
    They attribute a rating and a channel to their owners, which is the one thing that makes a
    third-party mark legitimate here. **The Google "G" is the only multi-colour element on the site,
    on purpose** — that is what makes it read as somebody else's verdict rather than our decoration.

---

## 10. OPEN — DO THESE NEXT

### ⭐ Ask him these, they are cheap

1. ⭐⭐ **DOES IT STILL RELOAD, AND IS IT SMOOTHER?** §0. 89 compositing layers and all 63 turbulence
   filters are gone, but **the eviction theory is unverified on his handset.** This is the one
   measurement only he can take.
2. ⭐⭐ **FACEBOOK, TIKTOK, YOUTUBE?** Only Instagram and LinkedIn exist on his own site. Facebook
   returns 400 and the TikTok handle is an empty stub. ⛔ **Do not guess handles** (§7.6).
3. ⭐ **"72-hour aftercare" AND "Quick turnaround time" — two bubbles or one?** His sentence reads
   either way. Two were built because deleting one is a line and rewriting is not.
4. ⭐ **SHORT OR LONG BUTTON LABELS?** The phone says "Free quote" / "Call us" — his own words, and
   forced at the time by a clipping constraint that no longer exists now they are stacked.
5. ⭐ **THE PHONE'S SUBTITLE DROPPED THE PLACE.** "across London and the Home Counties" is gone from
   the hero on mobile only. It is still in the footer, FAQ, schema and page title.
6. ⚠️ **IS IT RIMSHA OR REMSHA?** He said "Remsha" in a voice note; the page says **Rimsha** and that
   was kept. ⛔ It is a real person's name on a public page. **Same call taken on Jhanzeb.**
7. ⭐ **Does the brand marquee come off DESKTOP too?** D143 hid it on the phone only.
8. ⚠️ **HAS HE SEEN `/stones/compare.html` WORKING?** The picker was broken from the day it was built
   (D155), so he has never used the page as designed.

### ⛔ The two that actually block go-live — neither is design

9. ⭐⭐ **The enquiry form has no backend, and it carries file uploads.** `buildEnquiry()` assembles a
   `FormData` and has nowhere to POST. **Top open item for seventeen sessions.** ⚠️ Compare sends a
   shortlist at it via `?stones=` that nothing reads.
10. **Photography — the STONES are done. The PEOPLE and the PROJECTS are not.** ⚠️ Say out loud that
    the director portraits and the Why feature shot are placeholders. ⚠️ **Three of the six service
    tiles show the wrong subject** — Bathrooms a bare slab, Outdoor Kitchens a quarry, Commercial a
    kitchen. ⭐ **This got more visible this round**, because D162 took those photographs up to full
    brightness.

### The rest

11. ⭐ **The service pages need the global sections** — no project gallery, stone selector or
    estimator. Extract once into shared files that `build_services.py` wires into all six.
12. ⚠️ **A live copy problem, flagged and NOT fixed** — `SERVICES[0].long` and the service pages'
    "Vein-matched by hand" both claim fabrication TopCat outsource (rule 2) and state an absolute
    (rule 3). ⛔ **Live on the service pages right now.** ⚠️ `verify.py` check 7 does not scan
    index.html's inline data.
13. ⭐ **Pick a production host** and give it brotli + long-lived cache headers (§3).
14. ⭐ Close the licensing question on Caesarstone, CRL and Bloom. ⛔ Classic Quartz Stone is off
    limits. ⭐ **Calacatta Gold is UNRESOLVED** — needs the maker's name from his intro video.
15. **The TABLET round**, when he calls it. ⚠️ It still has the flip-card grid, black review cards,
    the boxed burger, the brand marquee, **and every desktop-shaped thing the phone has now fixed** —
    including the whole animated gallery engine this round removed on mobile.

**Still waiting on the client:** whether Quartzite becomes a fourth range, 20mm vs 30mm pricing
(⚠️ the estimator's thickness toggle currently moves no number, which is correct until he rules),
brackets for vanity tops / fireplaces / tables, the hero's "Request a call" demotion (asked four
times), and the £3k vs £3,850 three-slab discrepancy.

---

## 11. ⭐ HOW THIS CLIENT WORKS

⛔⛔ **DO THE THING HE ASKED FOR, IN THE MESSAGE HE ASKED FOR IT.** He sends asks in runs of four to
six and adds more mid-build. Do them in his order. **Say plainly which you are dropping and why.**

⚠️ **HE CORRECTS THE DIAGNOSIS, NOT JUST THE DESIGN, AND HE IS USUALLY RIGHT.** He said the site was
lagging and might be his phone; it was 431 filtered elements and 107 compositing layers. He said the
gaps were too big when two passes had just been spent widening them; he was right, and the arrow was
why. **Take the report as data even when the explanation is hedged.**

⚠️⚠️ **HE REVERSES HIMSELF FREELY AND FAST — SOMETIMES ONE MESSAGE LATER — AND THAT IS FINE. LOG
IT.** This round: **D167** reversed D116 and took D156 and D160 with it; **D171** reversed D169's
subtitle ring the next message; **D177** reversed D171's side-by-side buttons the message after that
and partly reversed D174. ⛔ **Write the reversal into §D WITH THE REASON THE OLD DECISION EXISTED**,
or the next session helpfully rebuilds the thing he just rejected.

⭐ **DELETE, DO NOT OVERRIDE, WHEN REVERTING.** D167 and D171 both removed the rules rather than
out-specifying them. Two competing descriptions of one element is how D106, D113 and D114 each lost a
rule to a later one at equal specificity.

⭐ **HE WILL COMMISSION SOMETHING SPECULATIVELY IF YOU GIVE HIM A WAY OUT** — D161 was asked for with
*"if it doesn't look good, I want to be able to revert it"*, built as one fenced block, and removed in
one command. ⭐ Offer that shape for anything open-ended.

⭐ **HE DESCRIBES THE ANIMATION HE WANTS, NOT THE SHAPE.** *"It just plays"*, *"like an accordion"*,
*"almost works like a parallax"*.

⚠️ **HE SOMETIMES SAYS "just push to GitHub, don't tell me you're going to."** Push, then report what
went up.

- **Walk the journey, do not check the page.**
- ⭐ **LOOK AT THE RESULT BEFORE REPORTING IT DONE.** The divider through the title, and the faint
  service-tile numerals, were both invisible to every measurement and obvious in a picture.
- **Measure, then claim.** ⚠️ **And if you could not measure it, say so** — §0's eviction theory and
  D173's WhatsApp number both shipped with an explicit "not verified".

---

## 12. BUDGET AND THE DOCUMENT SET

- **~82 credits** of the client's **100-credit ceiling** spent. About **18 left**. ⭐ **This round
  cost none** — layout, CSS and script work only, no image generation.

| File | What it is |
|---|---|
| **`HANDOVER.md`** | ⭐ The single current state. §D is the register, **D1–D130 and D132–D178**. §2 the standing rules, §2a the supplier list. ⚠️ **THERE IS NO D131 ROW** — do not reuse the number |
| `HANDOVER-2026-08-12-ten-ask-mobile-round-start-here.md` | The START HERE two rounds back |
| `HANDOVER-2026-08-12-search-compare-untied-gallery-start-here.md` | The one before that |
| `Website Demo/index.html.pre-review-card-revert.bak` | ⭐ **This round's baseline** — the file before the review card went back to dark (D167) |
| `Website Demo/index.html.pre-stone-sections.bak` | ⭐ **Holds the LIGHT STONE BANDS version (D161), which he rejected.** Keep it — it is the only copy |
| `Website Demo/index.html.pre-hero-fold-round.bak` | Baseline before D144–D161 |
| `Website Demo/stones/build_stones.py` | Builds the collection, compare.html and 132 stone pages |
| `Website Demo/stones/harvest/verify.py` | ⭐ The nine-check gate. `NOT_A_STONE` is the exemption list |
| `Website Demo/stones/stone.css` | Collection + stone + compare styles. ⚠️ Cached 5 minutes (§3) |
| `Website Demo/dev-server.js` | Compression, caching, and the reload that keeps scroll position |
| `stones/supplier_names.py` | ⭐ The seven authorised name differences |
| `Docs/topcat-worktops-SEO-LOG.md` | Every URL, title, target query and SEO change |
| `HANDOVER-archive-to-2026-08-06.md` | ⚠️ **Every design the client rejected, in his words.** Read before redesigning anything |

⚠️ **Section numbers in `HANDOVER.md` are referenced from code comments** (`§3`, `§4`, `§5a`, `§6.7`,
`§7.5` are live in `index.html`). **Do not renumber.**

⚠️ **`Website Demo/` holds 66 `index.html.pre-*.bak` files** — and a git repo (§4).
