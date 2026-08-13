# START HERE — 12 August 2026, end of the EIGHTEEN-ASK MOBILE ROUND

Read this, then `HANDOVER.md` **§D** (the decision register, newest first — this round is
**D144–D161**) and **§2** (the standing rules, especially **rule 9** and **rule 15**). That is about
fifteen minutes and it is enough to work safely.

> ⚠️ **This replaces `HANDOVER-2026-08-12-ten-ask-mobile-round-start-here.md`**, which was itself a
> patched copy of the previous round's doc and had gone stale in three places. Prefer this file.

---

## 0. ⛔⛔ THE ONE THING TO READ FIRST: D161 WAS BUILT AND REVERTED THE SAME DAY

He commissioned a **light stone background** for Services, the estimator, About and the FAQ — with
the escape hatch stated up front (*"if it doesn't look good, I want to be able to revert it"*) —
looked at the result and said **"revert it"**. It is gone. **Every section is dark, as it always was.**

⛔ **DO NOT PROPOSE LIGHT SECTIONS AGAIN AS A FRESH IDEA.** Read D161 first. It was measured on
brand, it passed the freeze at both frozen widths, and every fault found during the build was fixed
before he saw it — **it failed on his eye, not on execution.** That is the most useful kind of
rejection to have on record, and re-suggesting it would waste his time and yours.

⚠️ Only the fenced CSS block was removed. **D160's review-card readability fix, made in the same
message, was deliberately KEPT** — that was a fault he reported, not part of the trial.
⭐ `Website Demo/index.html.pre-stone-sections.bak` still holds the version with the bands.

⭐⭐ **THE TWO FINDINGS FROM THAT ATTEMPT SURVIVE IT AND ARE GENERAL:**
- **`.section-title em` IS PAINTED BY A GRADIENT WITH `background-clip:text`.** Setting `color` on
  it does nothing and looks like it worked. Its ramp measured **2.42:1** on a light ground.
- **When you invert a ground, an OPAQUE panel can be left alone but a TRANSLUCENT one cannot** — it
  is by definition a function of what is behind it. That is what caught the FAQ drawer (white text
  on a light frosted panel, invisible). **Check every `rgba()` surface.**

---

## 1. ⭐ THE FREEZE PROBE — RUN THREE TIMES TODAY, PASSED EVERY TIME

**Final state verified at 1440×900 and 768×1024 after the revert:**

| Signal | 1440×900 | 768×1024 |
|---|---|---|
| document height | **14641** | **18385** |
| gallery cards | `413.2×273 ×4, 199.9×132.1 ×4` | `210.1 / 210.5 / 210.9 / 211.4` and `105.4 / 105.6 / 105.8 / 106.1` |
| `.gal-scroll` height | 4950px | 5632px |
| element count | **2590** | **2590** |
| services/estimator/about/faq grounds | `none` | `none` |
| `#services .section-title` | `rgb(244,241,234)` | `rgb(244,241,234)` |
| `.rev-face` | `rgb(21,21,27) → rgb(14,14,18)` (dark) | same |
| FAQ plate | 1184×196, one row open | one row open |

⭐ **+8 ELEMENTS AGAINST THE PRE-ROUND BASELINE, FULLY ACCOUNTED**: 3 estimator field labels + 12 FAQ
question spans + the footer guarantee span **and its `<b>`**, less the 9 elements of Ali's figure
(D150). Nothing else was added.

### ⛔⛔ THE PROCEDURE, CORRECTED TWICE — USE THIS VERSION

**1. Probe with `scrollTo({top:y, behavior:'instant'})`. Always.**
`<html>` carries `scroll-behavior:smooth`, so **every plain `scrollTo()` in a probe ANIMATES** and
the playhead chases a moving target. ⚠️ **The previous doc's claim that 768 "converges
asymptotically over ~60s" was my own probe, not the page** — with instant scrolls the same
measurement settles in **9 seconds** on identical values. It never affected the client; a finger is
not a programmatic scroll.

**2. Park at `galScrollTop + 2000`, then converge — do not just wait.**
The old "settle 5s, snap twice 1.2s apart" test **passes spuriously**: `frame()` shuts itself off
above 720px the moment it thinks it has caught the scroll and can stall short of rest, so two snaps
agree on a wrong value. It did exactly that on the BASELINE at 1440.

**3. The tells are different at the two widths.**
- **1440 must be FLAT** — all four big cards the same size. Any spread means mid-flight.
- **768 is a clean rising PROGRESSION** (210.1 → 211.4). That is the real layout, the column is
  walking. Do not "fix" it.

**4. At 1440, jiggle to wake the rAF loop** (`target+1`, back to `target`, ×5) then settle 4s.
**5. Sample in ≤24s chunks** — `javascript_tool` times out at 30s.
**6. Give both files the same scroll history** — scroll to 0 first, then one instant jump.

⭐ **CHECK `--galMode` FIRST AND YOU MAY NOT NEED ANY OF IT.** It is `(unset)` above 720px, which is
proof the phone branch of `measure()` never ran. If your gallery edits are inside `if(phone){…}`,
that one read beats a card hash.

---

## 2. ⛔ SCOPE

**DESKTOP AND TABLET ARE FROZEN. THE WORK IS MOBILE, ON HIS PHONE, OVER THE LAN LINK.**

| Band | What it gets | Status |
|---|---|---|
| **≤ 720px** | the mobile build | ⭐ live scope |
| **721–1120px** | the old tablet/fallback layouts | ⛔ **frozen, untouched** |
| **≥ 1121px** | the desktop composition | ⛔ **frozen, signed off (D91)** — one authorised exception this round, **D150** |

⚠️ `index.html` is one file with **inline CSS**, so nearly every rule is unscoped. ⛔ **Mobile work
goes inside `@media(max-width:720px)`. Never edit a base rule to fix mobile.**

⭐ **HE DOES UNFREEZE DESKTOP, ONE NAMED ITEM AT A TIME, MID-MESSAGE.** D150: *"this part also
applies to the desktop version… but nothing else that I mentioned here, only the about us section
part."* One item promoted, nine still phone-only. **"Frozen" means "changes only where he names
one".** ⚠️ **When the boundary of that sentence is unclear, take the reversible reading and tell
him you did** — that is why D151's centring is phone-only and is question 1 below.

⭐ **NEW MARKUP CANNOT BE SCOPED BY A MEDIA QUERY (D120).** Default it to `display:none` in the base
rule and let the phone opt in — D148, D152 and D153 all do this.
⭐⭐ **AND IT IS SAFE FOR GRIDS: a `display:none` grid item is not a grid item at all**, so adding
three spans to a six-column row leaves the desktop template receiving exactly six. Verified.

⭐ **ADDING A CLASS TO AN EXISTING ELEMENT IS FREE.** `foot-explore`, `foot-browse`, `foot-c-*` are
name hooks no base rule references — far better than positional `:nth-child()` against a markup
order nobody would know was load-bearing.

⭐ **THE PHONE BLOCK IS THE LAST THING IN THE STYLESHEET, ON PURPOSE.** Sections 1–11 live in it.
Three rounds lost a mobile override to a base rule at equal specificity sitting later (D106, D113,
D114). Nothing comes after it, so nothing can.

⚠️ **`--faqMode` / `--galMode` / `--svcMode` / `--hxMode` ARE THE IDIOM FOR "IS THIS A PHONE?"** —
declared in CSS, read back by script. ⛔ A second `matchMedia` in JS is this project's most repeated
bug (D51, D59, D68, D78, D93, D105). ⚠️ But note `--faqMode` (720) and the FAQ's own `narrow`
matchMedia (760) are **two different questions**: where the phone build starts, and where the plate
moves inline. Both are correct.

---

## 3. ⛔ THE LINK

```bash
cd "Website Demo" && nohup caffeinate -ims node dev-server.js > /tmp/topcat-server.log 2>&1 &
```

**Give him `http://192.168.1.102:5501`** — re-check with `ipconfig getifaddr en0`.

⭐ **THE SERVER IS DETACHED ON PURPOSE (PPID 1).** ⛔ **DO NOT `preview_stop` IT, DO NOT KILL IT TO
RESTART.** Verify with `lsof -nP -iTCP:5501 -sTCP:LISTEN` before blaming his phone. **PID 5158,
untouched across four rounds.**

⭐⭐ **EVERY SAVE TO `index.html` RELOADS HIS PHONE.** The reload restores scroll position. **Tell him
before a run of edits** — this round carried roughly fifty.

### ⛔ `stone.css` IS CACHED FOR FIVE MINUTES

`index.html` is `no-cache`; **assets are `public, max-age=300`**, so a change to `/stones/stone.css`
does not reach the browser for up to five minutes. ⭐ Prove it before debugging anything:
`fetch('/stones/stone.css?bust='+n)` and compare against `document.styleSheets`; force with
`link.href='/stones/stone.css?bust='+n`. ⚠️ **Warn the client too** — it looks exactly like a broken
build. It bit again this round on D155.

⛔ **ALL OF §3 IS DEV-SERVER ONLY.** No production host is chosen.

---

## 4. ⭐ THE CODE IS ON GITHUB, AND IT IS PUBLIC

**https://github.com/ThadGC/topcatwork** — one commit on `main`, pushed 12 Aug.

⚠️ **HE CHOSE PUBLIC KNOWINGLY, AFTER BEING TOLD WHAT IT PUBLISHES.** Do not re-litigate it
unprompted. ⛔ 18 files name Nile Stone and Next Stone Slabs — that is §2 rule 9's buying list, now
indexed. A private repo with collaborators gives his devs identical access; the offer stands.

⭐ **USE `git status --porcelain` AS A SCOPE PROOF.** Today it confirms only `Website Demo/index.html`
and `Website Demo/stones/stone.css` changed — **and nothing under `stones/*.html`**, which is the
proof that D155's picker fix touched no generated page.

⛔ **GITIGNORE PATTERNS MUST BE `**/`-ANCHORED** — a pattern with a slash is anchored to the repo
root and the site lives at `Topcat-Worktops-main/Website Demo/…`.

---

## 5. ⛔ THE INTEGRITY RULE — still the one that matters most

> "These names cannot be wrong. If someone googles it and sees it looks different here, then we
> have a big problem."

```bash
cd "Website Demo/stones" && python3 harvest/verify.py
```

> 132 stones, 132 with a photograph, 132 pages on disk — ✅ PASS *(last run 12 Aug, post-revert)*

⚠️ It covers the STONES only. **Nothing in it looks at the landing page**, which is where nearly all
of this round's work landed. `NOT_A_STONE` is the exemption list — keep it exact.

⭐ The two go-live copy scans also pass: §2 rule 1 (in-house fabrication) returns nothing, and rule
11's centimetres scan returns only `index.html` — **Judy Z.'s "10cm", the one documented exception,
which must stay.**

---

## 6. ⭐ WHERE THE PHONE STANDS

| Section | State |
|---|---|
| **Top nav** | burger is three bare stripes, no box (D132) |
| **Hero** | the gold line runs OFF the screen at 45°, R:48, overhang 14px (D144). ⭐ **D133's black-corner leak is CONFIRMED FIXED by his own screenshot** |
| **Reviews** | no entrance at all, head or cards (D134/D145). Card is STONE not white: #EFECE5→#E0DCD3, veil 0.90/0.94, champagne #6F5327 (D156 + D160) |
| **Services** | popularity order, tiles link to their page, gold rim, 7px corners, tiles run to the subtitle's edges (D146) |
| **Project gallery** | 1600ms clock (D142); card 0 at 25.2px and still during the deal (D147); **no held run and no playhead damping — tracks the finger 1:1** (D157); foot tightened, last card → divider 256.6 → 168.9px (D158) |
| **Stone wheel** | bend 30, card 0.80, cap 390, bare gold arrows (D135–D138) — ⛔ untouched for two rounds |
| **Stones → estimator seam** | brand marquee replaced by a plain divider (D143) |
| **Estimator** | rebuilt: one piece = one labelled card, stats are rows, every caption/hint pair stacked (D148) |
| **Process** | title 89.5px under the divider, matching the gap above it exactly (D149) |
| **About** | Nick and Rimsha only, two 3:4 plates — **DESKTOP TOO** (D150); title, copy and CTA centred, phone only (D151) |
| **FAQ** | plain accordion (D152); rows take the enquiry form's grey, drawer is frosted glass, **nothing open on arrival and a re-tap closes** (D154) |
| **Footer** | centred head; both marks are hero-style badge pills; phone and email are full-width centred pills out of the column; Explore/Browse centred in their halves (D153 + D159) |
| **The collection** | search narrows properly (D139) |
| **`/stones/compare.html`** | **the "Add a stone" picker was broken from the day it was built and is now fixed** (D155) |
| Page floor | veil 0.46 (D123). ⛔ Every section dark — see §0 |
| Sticky bottom bar | Get a quote · Email · Call (D99/D106) |
| Everything else | ⛔ untouched — still the desktop-era layout at phone width |

---

## 7. ⛔ THE LESSONS THAT COST THE MOST

### 1. ⛔⛔ A COMPUTED-STYLE SWEEP CANNOT SEE AN ENTRANCE DRIVEN BY INLINE TRANSFORMS

He asked twice for the reviews entrance to go. D134 measured the section, found the deck and all
sixteen cards already at `opacity:1`, and concluded the entrance was the section head alone. Right
about the CSS, wrong about the section: the cards are positioned by `soloRender()`, whose
`!revEntered` branch parks them ~400px off-screen. **Nothing in the computed style says so.**
⭐ **Look for the flag, not the class. And when he repeats a complaint you have already "fixed",
assume you fixed a different thing.**

### 2. ⛔⛔ WHEN A CHANGE HAS A COST SOMEWHERE ELSE, THE COST STAYS BEHIND

Three times in one day. **D142 put the gallery on a clock but left `animPx`** — 690px of scroll that
existed only so the animation could be scrubbed, so the section pinned and did nothing for three
flicks (D157). **D116 made the review card the brightest thing on the page; D156 toned it down but
`--gold-lo` had been chosen for the OLD card's luminance**, which would have shipped 3.42:1 text.
**D154 made the FAQ drawer light for a dark page**, and it went invisible the moment the ground
changed (D161). ⭐ **After changing a value, grep for what was derived from it.** All three were
found by asking "what did the old number justify?", never by looking at the change.

### 3. ⛔ THE CLIENT'S TWO CLAUSES WERE TWO DIFFERENT BUGS

"It feels stuck" and "it still feels like it's moving" sound like one vague impression. They were
`animPx` (a dead pinned run) and `SCRUB` (a mouse-wheel damping constant on a touch screen) —
unrelated code, both real. ⭐ **Do not collapse a client's two clauses into one fault.**

### 4. ⛔ ONE ITEM WEARING THREE NAMES LOOKS LIKE BAD STYLING

The FAQ "looked terrible" because the row said "What it costs", the plate's eyebrow said "Pricing"
and its heading said "How much does a stone worktop cost?" — fine as index-then-detail in separate
columns, incoherent stacked on a phone. ⭐ **The mechanism was already right**; it was wearing
desktop clothes.

### 5. ⛔ THE SAME FAULT SIX TIMES READS AS SIX DESIGN PROBLEMS

"So much text" in the estimator was one idiom repeated: `justify-content:space-between` pairs that
want ~420px and get 294px of panel. ⭐ **Count the shapes before redesigning any of them.** The
answer was fewer things per line, never smaller type.

### 6. ⚠️ A VEIL ALPHA IS NOT PORTABLE BETWEEN TWO BASE COLOURS

D156 opened the review card's stone from 0.88 to 0.74 — a small step on a near-white card, but the
veins are cream and on a GREY card they became the highest-contrast thing on it, running straight
through the paragraph. **Contrast measured 13.7:1 and the text was still hard to read** (D160).
⭐ **Re-judge a texture whenever its base moves, and look at it — do not calculate it.**

### 7. ⚠️ A TRANSITION MEASURED TOO SOON WILL LIE ABOUT ITS DIRECTION

The FAQ chevrons read INVERTED 1.2s after a tap — the base rule's `.55s` on `--ease` has a long
tail. ⭐ Anything eased needs converging on, not waiting on. Same family as §1.

---

## 8. ⚠️ THE ENVIRONMENT TRAPS

- ⛔⛔ **`scroll-behavior:smooth` IS ON `<html>` — EVERY PROBE `scrollTo` ANIMATES.** See §1.
- ⛔⛔ **THE PANE GOES `visibilityState:'hidden'` AND THEN SILENTLY IGNORES `scrollTo`.** `scrollY`
  stayed 0 against a 15521px document with no locks and `scrollingElement` correct. ⭐ **Check
  `document.visibilityState` FIRST when a scroll will not take.** `tabs_select` did not front it;
  **`tabs_create` + `navigate` did.**
- ⛔ **A STALE SCREENSHOT WILL DISAGREE WITH LIVE DOM READS, AND THE DOM IS RIGHT.** Same cause.
  ⭐ Trust the measurement; open a fresh tab for the picture.
- ⛔ **`javascript_tool` TIMES OUT AT 30s.** Split long settles into ≤24s calls.
- ⛔ **THE PANE CANNOT TAP ANYTHING BELOW 768px AND IT FAILS SILENTLY.** Use `el.click()` — it drove
  the estimator's shapes, island, add/remove and all twelve FAQ rows fine.
- ⚠️ **THE PANE DOWNSCALES A 1440px VIEWPORT INTO AN ~800px IMAGE**, so desktop screenshots are
  near-useless for detail. Measure instead.
- ⚠️ **`zoom` with a `region` is not supported.** To inspect a detail on the phone, apply a temporary
  `transform:scale()` with a corner `transform-origin` and screenshot that — 7× proved the hero arc.
- ⚠️ **A `reload()` in the same call as the probe kills the call.** Reload, then probe separately.
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
7. ⛔ **Suppliers are never named publicly.** ⚠️ The retired marquee held BRANDS, not suppliers — read
   D143 before "restoring" anything.
8. **No showroom. Never show the review count. Never signal a young company. Value, not cheap.**
9. **Voice:** quietly confident master. British English, commas not em dashes, no exclamation marks.
10. ⛔ **The logo is the client's artwork and is never re-drawn. Set HEIGHT only.**
11. ⛔ **ONE DEVICE AT A TIME. Desktop is frozen and only the client unfreezes it** — see §2.

---

## 10. OPEN — DO THESE NEXT

### ⭐ Ask him these, they are cheap and three are one-word answers

1. ⭐⭐ **DOES THE ABOUT CENTRING GO TO DESKTOP TOO (D151)?** He said the About change "also applies
   to desktop… only the about us section part", but the change he had just described was cutting
   Ali. The removal went in at every width; **the centring is phone-only** until he says otherwise.
   He was told this plainly. If yes, move three rules out of the phone block and nothing else changes.
2. ⚠️ **IS IT RIMSHA OR REMSHA?** He said "Remsha" in a voice note; the page has always said
   **Rimsha** and that was kept — a phonetic spelling is not an instruction to rename a real person.
   ⛔ It is a real person's name on a public page.
3. ⭐ **DOES HE WANT A "the price is below" CUE IN THE ESTIMATOR?** He raised it and answered himself
   ("or we don't have to say anything"). Nothing was added. One line if he asks.
4. ⚠️ **HAS HE SEEN `/stones/compare.html` WORKING?** The picker was broken from the day the page was
   built (D155), at every width — **so he has never used the page as designed.** Worth putting in
   front of him, and worth asking whether it still earns its place given he chose it over the form
   backend. ⛔ `stone.css` is cached 5 minutes; warn him.
5. ⭐ **Does the brand marquee come off DESKTOP too?** D143 hid it on the phone only. ⚠️ He may want it
   back with brands alone — it never held his buying list.
6. ⚠️ **The "keep scrolling" indicator may be OBSOLETE.** D142/D157 mean the animation needs no
   scrolling at all now. **Ask before building it.**

### ⭐ The one prediction still unmeasured

7. ⭐ **The animations on his iPhone.** Raised three times, never diagnosed. **This round should help
   and for measurable reasons:** D145 removed three permanently-transitioned cards, D157 removed a
   damped per-frame playhead **and** 690px of pinned runway, D148/D152 removed a framed plate and a
   min-height from the phone's paint, and D133 dropped a permanent compositing layer. **That is still
   a prediction, not a measurement — ask him.**

### ⛔ The two that actually block go-live — unchanged, and neither is design

8. ⭐⭐ **The enquiry form has no backend, and it carries file uploads.** `buildEnquiry()` assembles a
   `FormData` and has nowhere to POST. **Top open item for fifteen sessions.** ⚠️ Compare sends a
   shortlist at it via `?stones=` that nothing reads.
9. **Photography — the STONES are done. The PEOPLE and the PROJECTS are not.** ⚠️ Say out loud that
   the director portraits and the Why feature shot are placeholders. ⭐ **There are TWO portrait
   plates now, not three, and they are 3:4 rather than 1:2** — the shoot brief changed with D150.
   ⚠️ **Three of the six service tiles show the wrong subject** — Bathrooms a bare slab, Outdoor
   Kitchens a quarry, Commercial a kitchen.

### The rest

10. ⭐ **The service pages need the global sections** — no project gallery, stone selector or
    estimator. Extract once into shared files that `build_services.py` wires into all six.
11. ⚠️ **A live copy problem, flagged and NOT fixed** — `SERVICES[0].long` and the service pages'
    "Vein-matched by hand" both claim fabrication TopCat outsource (rule 2) and state an absolute
    (rule 3). ⛔ **Live on the service pages right now.** ⚠️ `verify.py` check 7 does not scan
    index.html's inline data.
12. ⭐ **Pick a production host** and give it brotli + long-lived cache headers (§3).
13. ⭐ Close the licensing question on Caesarstone, CRL and Bloom. ⛔ Classic Quartz Stone is off
    limits. ⭐ **Calacatta Gold is UNRESOLVED** — needs the maker's name from his intro video.
14. **The TABLET round**, when he calls it. ⚠️ It still has the flip-card grid with "click for
    details", black review cards, the boxed burger, the ringed wheel arrows, the brand marquee, **and
    every desktop-shaped thing this round fixed on the phone** — the estimator's colliding captions,
    the index-and-plate FAQ and the stacked footer are all still there at 721–1120px.

**Still waiting on the client:** whether Quartzite becomes a fourth range, 20mm vs 30mm pricing
(⚠️ the estimator's thickness toggle currently moves no number, which is correct until he rules),
brackets for vanity tops / fireplaces / tables, the hero's "Request a call" demotion (asked four
times), and the £3k vs £3,850 three-slab discrepancy.

---

## 11. ⭐ HOW THIS CLIENT WORKS

⛔⛔ **DO THE THING HE ASKED FOR, IN THE MESSAGE HE ASKED FOR IT.** This round was **three messages
and eighteen asks**, and he sent later ones while earlier work was still being built. They were done
in his order, and the order mattered — the process gap (#6) had to be measured *after* the estimator
(#5) because it is measured against the estimator's own last line. **Say plainly which you are
dropping and why, before you start.**

⚠️ **HE CORRECTS THE DIAGNOSIS, NOT JUST THE DESIGN, AND HE IS USUALLY RIGHT.** He said the review
cards animate; a previous round had "proved" they do not. He said the FAQ looked terrible; the fault
was three labels, not styling. He said the gallery felt stuck; it was two separate bugs. **Take the
report as data even when the explanation is wrong — and especially when you have already answered it
once.**

⚠️ **HE REVERSES HIMSELF FREELY AND THAT IS FINE — BUT LOG IT.** Four reversals in one day: D158 part
of D129, D159 of D153, D160 of D156, and D161 of itself. ⛔ **Write the reversal into §D WITH THE
REASON THE OLD DECISION EXISTED**, or the next session helpfully rebuilds the thing he just rejected.

⭐ **HE WILL COMMISSION SOMETHING SPECULATIVELY IF YOU GIVE HIM A WAY OUT.** D161 was asked for with
"if it doesn't look good, I want to be able to revert it" — so it was built as one fenced block with
a stated revert path, shown, and removed in one command. ⭐ **Offer that shape for anything
open-ended; it is why a rejected experiment cost almost nothing.**

⭐ **HE DESCRIBES THE ANIMATION HE WANTS, NOT THE SHAPE.** *"It just plays"*, *"like an accordion"*,
*"fold or go almost out of the screen"*, *"almost works like a parallax"*.

- **Walk the journey, do not check the page.**
- ⭐ **LOOK AT THE RESULT BEFORE REPORTING IT DONE.** Two faults this round were invisible to a
  measurement and obvious in a screenshot.
- **Measure, then claim.** ⚠️ **And if you could not measure it, say so** — D133 and D161's
  `background-attachment` caveat both shipped with an explicit "not verified on the device".

---

## 12. BUDGET AND THE DOCUMENT SET

- **~82 credits** of the client's **100-credit ceiling** spent. About **18 left**. ⭐ **This round
  cost none** — layout, CSS and script work only, no image generation.

| File | What it is |
|---|---|
| **`HANDOVER.md`** | ⭐ The single current state. §D is the register, **D1–D130 and D132–D161**. §2 the standing rules, §2a the supplier list. ⚠️ **THERE IS NO D131 ROW** — reconstruct from the archive if needed, but **do not reuse the number** |
| `HANDOVER-2026-08-12-ten-ask-mobile-round-start-here.md` | The previous START HERE, superseded by this file |
| `HANDOVER-2026-08-12-search-compare-untied-gallery-start-here.md` | The one before that |
| `Website Demo/index.html.pre-stone-sections.bak` | ⭐ **Holds the LIGHT STONE BANDS version (D161), which he rejected.** Keep it — it is the only copy |
| `Website Demo/index.html.pre-hero-fold-round.bak` | ⭐ **This round's freeze baseline** — the file as it was before any of D144–D161 |
| `Website Demo/index.html.pre-gallery-untied.bak` | Baseline before the gallery came off the scroll |
| `Website Demo/stones/build_stones.py` | Builds the collection, compare.html and 132 stone pages. `scoped_words()` and `_haystacks()` are the search |
| `Website Demo/stones/harvest/verify.py` | ⭐ The nine-check gate. `NOT_A_STONE` is the exemption list — keep it exact |
| `Website Demo/stones/stone.css` | Collection + stone + compare styles. ⚠️ Cached 5 minutes (§3) |
| `Website Demo/dev-server.js` | Compression, caching, and the reload that keeps scroll position |
| `stones/supplier_names.py` | ⭐ The seven authorised name differences |
| `Docs/topcat-worktops-SEO-LOG.md` | Every URL, title, target query and SEO change |
| `HANDOVER-archive-to-2026-08-06.md` | ⚠️ **Every design the client rejected, in his words.** Read before redesigning anything |

⚠️ **Section numbers in `HANDOVER.md` are referenced from code comments** (`§3`, `§4`, `§5a`, `§6.7`,
`§7.5` are live in `index.html`). **Do not renumber.**

⚠️ **`Website Demo/` holds 58 `index.html.pre-*.bak` files** — and a git repo (§4).
