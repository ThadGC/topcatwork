# START HERE — 12 August 2026, end of the EIGHTEEN-ASK MOBILE ROUND

Read this, then `HANDOVER.md` **§D** (the decision register, start at **D144–D161**) and **§2**
(the standing rules, especially **rule 9** and **rule 15**). That is about fifteen minutes and it
is enough to work safely.

> ⚠️ **This replaces the version written after the SEARCH + COMPARE + UNTIED-GALLERY ROUND**, now
> archived as `HANDOVER-2026-08-12-search-compare-untied-gallery-start-here.md`. That file
> describes a hero whose gold line stops on screen, review cards that ride in on scroll, service
> tiles inset 19.5px inside the subtitle, a gallery card 78px below its subtitle, a desktop-shaped
> estimator, three directors in About, an index-and-plate FAQ and a single-column footer.
> ⛔ **Every one of those has changed.** Its §9.1 also still lists the hero's rounded corner as
> unverified — **his screenshot settles it, and it passed.**

> ⭐⭐ **THIS ROUND WAS THREE MESSAGES, EIGHTEEN ASKS, AND HE SENT LATER ONES WHILE EARLIER WORK WAS
> STILL BEING BUILT.** Ten, then six, then two. Everything was done in the order he named it.
> **FOUR of them reverse reasoning written down earlier the same day** — D159 overturns D153's
> argument against a bordered footer badge, D158 partly undoes D129's centred CTA, D160 walks back
> D156's veil, and D161's own FAQ fix undoes half of D154. Every reversal is logged with the reason
> the old decision existed, which is §2's standing instruction and the only thing that stops the
> next session rebuilding what he has just rejected.

> ⛔⛔ **D161 (THE LIGHT STONE BANDS) WAS BUILT, SHOWN, AND REVERTED THE SAME DAY — HIS WORD WAS
> "revert it".** He commissioned it himself with the escape hatch stated up front, looked at the
> result and took it. **The site carries NO light sections. Do not propose them again as a fresh
> idea — read D161 first.** ⚠️ Only the fenced CSS block was removed; D160's review-card
> readability fix, made in the same message, was KEPT because that was a fault he reported rather
> than part of the trial. `Website Demo/index.html.pre-stone-sections.bak` still holds the version
> with the bands if it is ever wanted back.

---

## 0. ⭐ THE FREEZE PROBE — AND A CORRECTION TO THE PROCEDURE THAT COST HALF AN HOUR

**Run TWICE on 12 Aug against `index.html.pre-hero-fold-round.bak` at 1440×900 and 768×1024 — PASSED
both times**, the second after a further six changes including the FAQ script, which runs at every
width.
Document heights **identical at 14641 / 18385**, the exact figures the last doc quotes. galPin,
galStage, galScroll, revPage, svcFace, the estimator's six-column row template, the FAQ index and
plate, the footer's four- and two-column grids and `#process`'s 90px/102.4px padding are all
byte-identical. Only two differences, both intended (D150), plus **+8 elements, fully accounted**:
3 estimator field labels + 12 FAQ question spans + the guarantee span **and its `<b>`**, less the 9
elements of Ali's figure.

### ⛔⛔ THE 5-SECOND SETTLE PASSES SPURIOUSLY — AND THE TELLS DIFFER BY WIDTH

The last doc's §0 says park at `galScrollTop + 2000`, settle 5s, snap twice 1.2s apart and require
the two to be equal. **That test passes spuriously.** The eased playhead updates only on rAF ticks,
`frame()` shuts itself off above 720px the moment it thinks it has caught the scroll, and it can
stall well short of the resting position — so two snaps 1.2s apart agree on a value that is simply
wrong. It did exactly that here, on the BASELINE, at 1440: a stable, converged, **non-monotonic**
read of 423.5 / 423.9 / 428.5 / 426.

⭐ **THE TELLS, AND THEY ARE DIFFERENT AT THE TWO WIDTHS:**
- **1440 is a FLAT read.** All four big cards must be the SAME size — `413.2×273 ×4, 199.9×132.1 ×4`.
  Any spread at all means mid-flight.
- **768 is a clean rising PROGRESSION** — `210.1, 210.5, 210.9, 211.4` and `105.4, 105.6, 105.8,
  106.1`. That is the real layout (the column is walking, so each card is at its own depth). Do not
  "fix" it.

### ⛔⛔ AND THE REAL REASON THE PROBES WERE SLOW: `scroll-behavior:smooth` IS ON `<html>`

⚠️ **THE PREVIOUS VERSION OF THIS SECTION SAID 768 "CONVERGES ASYMPTOTICALLY AND NEEDS ~60s". THAT
WAS MY OWN PROBE, NOT THE PAGE.** `document.documentElement` carries `scroll-behavior:smooth`, so
**every `window.scrollTo()` in a probe ANIMATES over several hundred ms.** The playhead is then
chasing a moving target, which looks exactly like heavy damping and inflates every settle.

⭐⭐ **ALWAYS PROBE WITH `scrollTo({top:y, behavior:'instant'})`.** With that one change the same
768 measurement settled in **9 seconds**, not sixty, and landed on the identical values. It also
turns per-frame measurements from noise into signal: a travel test that read "0, 0, 0.5, 1, 3, 6…"
(an accelerating ramp — the tell that the TARGET is moving) read a clean "0, 200, 200, 200…" once
the scroll was instant.
⚠️ This does not affect the client: `scroll-behavior` governs programmatic and anchor scrolls, not
a finger. It only ever corrupted measurements.

⭐ At 1440 you may still need to jiggle (`target+1`, back to `target`, ×5) to wake the rAF loop
after a long idle. Sample in ≤24s chunks — the `javascript_tool` call times out at 30s — and give
both files the SAME scroll history: scroll to 0 first, then one instant jump to the target.

⭐ **CHECK `--galMode` FIRST AND YOU MAY NOT NEED ANY OF THIS.** It is `(unset)` above 720px, which
is proof the phone branch of `measure()` never ran. If your gallery edits are inside `if(phone){…}`,
that one read is stronger evidence than a card hash.

---

## 1. ⛔ SCOPE — UNCHANGED, AND IT HELD ALL ROUND EXCEPT WHERE HE UNFROZE IT

**DESKTOP AND TABLET ARE FROZEN. THE WORK IS MOBILE, ON HIS PHONE, OVER THE LAN LINK.**

| Band | What it gets | Status |
|---|---|---|
| **≤ 720px** | the mobile build | ⭐ live scope |
| **721–1120px** | the old tablet/fallback layouts | ⛔ **frozen, untouched** |
| **≥ 1121px** | the desktop composition | ⛔ **frozen, signed off (D91)** — ⭐ **one exception this round, D150** |

⚠️ `index.html` is one file with **inline CSS**, so nearly every rule is unscoped. ⛔ **Mobile work
goes inside `@media(max-width:720px)`. Never edit a base rule to fix mobile.**

⭐ **NEW MARKUP CANNOT BE SCOPED BY A MEDIA QUERY (D120), AND IT WAS USED FOUR TIMES THIS ROUND.**
Default it to `display:none` in the base rule and let the phone opt in — the estimator's field
labels (D148), the FAQ's full question (D152) and the footer's guarantee mark (D153) all do this.
⚠️ **NO new markup was added in the second half of this round** — the element count is unchanged at
2590, which is why the second freeze run is a clean equality rather than an accounted delta.
⭐⭐ **AND THERE IS A REASON IT IS SAFE FOR GRIDS: a `display:none` grid item is not a grid item at
all**, so adding three spans to a six-column row leaves the desktop template receiving exactly six
items. Verified byte-identical.

⭐ **ADDING A CLASS TO AN EXISTING ELEMENT IS FREE.** `foot-explore`, `foot-browse` and `foot-c-*`
are name hooks referenced by no base rule. Prefer them to positional `:nth-child()` against a
markup order nobody would know was load-bearing.

⭐ **THIS ROUND'S PHONE BLOCK IS STILL THE LAST THING IN THE STYLESHEET, ON PURPOSE.** Sections 7–12
were appended to it. Nothing comes after it, so nothing can out-order it.

---

## 2. ⛔ THE LINK

```bash
cd "Website Demo" && nohup caffeinate -ims node dev-server.js > /tmp/topcat-server.log 2>&1 &
```

**Give him `http://<lan-ip>:5501`** — `ipconfig getifaddr en0`. It is `192.168.1.102:5501`.

⭐ **THE SERVER IS DETACHED ON PURPOSE (PPID 1).** ⛔ **DO NOT `preview_stop` IT, DO NOT KILL IT TO
RESTART.** Verify with `lsof -nP -iTCP:5501 -sTCP:LISTEN` before blaming his phone. **PID 5158,
untouched across three rounds now.**

⭐⭐ **EVERY SAVE TO `index.html` RELOADS HIS PHONE.** The reload restores scroll position. **Tell
him before a run of edits** — this round carried about thirty saves.

### ⛔ `stone.css` IS CACHED FOR FIVE MINUTES

`index.html` is `no-cache` so it reloads instantly. **Assets are `public, max-age=300`** — a change
to `/stones/stone.css` does NOT reach the browser for up to five minutes. ⭐ Prove it before
debugging: `fetch('/stones/stone.css?bust='+n)` and compare against `document.styleSheets`. Force
with `link.href='/stones/stone.css?bust='+n`. ⚠️ **Warn the client too.**

⛔ **ALL OF §2 IS DEV-SERVER ONLY.** No production host is chosen.

---

## 3. ⭐ THE CODE IS ON GITHUB, AND IT IS PUBLIC

**https://github.com/ThadGC/topcatwork** — pushed 12 Aug, one commit on `main`.

⚠️ **HE CHOSE PUBLIC KNOWINGLY, AFTER BEING TOLD WHAT IT PUBLISHES.** Do not re-litigate it
unprompted. ⛔ 18 files name Nile Stone and Next Stone Slabs, including `index.html` and every
handover — that is §2 rule 9's buying list, now indexed. A private repo with collaborators gives
his devs identical access; the offer stands if he asks.

⭐ **USE `git status --porcelain` AS A SCOPE PROOF.** This round it confirmed only `index.html` and
`stones/stone.css` changed under `Website Demo/` — and nothing under `stones/*.html`, which is the
proof that the D155 picker fix touched no generated page.

⛔ **GITIGNORE PATTERNS MUST BE `**/`-ANCHORED** — a pattern with a slash is anchored to the repo
root and the site lives at `Topcat-Worktops-main/Website Demo/…`.

---

## 4. ⛔ THE INTEGRITY RULE — still the one that matters most

> "These names cannot be wrong. If someone googles it and sees it looks different here, then we
> have a big problem."

```bash
cd "Website Demo/stones" && python3 harvest/verify.py
```

> 132 stones, 132 with a photograph, 132 pages on disk — ✅ PASS *(last run 12 Aug, after this round)*

⚠️ It covers the STONES only. **Nothing in it looks at the landing page**, which is where all of
this round's work landed. `NOT_A_STONE` is the exemption list — keep it exact; every name excused
there is a name it can no longer catch.

⭐ The two go-live copy scans also re-run clean: §2 rule 1 (in-house fabrication) returns nothing,
and rule 11's centimetres scan returns only `index.html` — **Judy Z.'s "10cm", the one documented
exception, which must stay.**

---

## 5. ⭐ WHERE THE PHONE STANDS

| Section | State |
|---|---|
| **Top nav** | the burger is three bare stripes, no box (D132) |
| **Hero** | the gold line runs OFF the screen at 45°, R:48, overhang 14px (D144). ⭐ D133's corner leak is CONFIRMED FIXED by his own screenshot |
| **Reviews** | no entrance at all — head or cards (D134/D145); the card is STONE, not white — #EFECE5→#E0DCD3, champagne #6F5327 (D156); ⭐⭐ **NEW: the veil went back UP to 0.90/0.94 — D156 opened it too far and the veins landed on the words** (D160) |
| **Services** | popularity order, tiles link to their page, gold rim, 7px corners, tiles run to the subtitle's edges (D146) |
| **Project gallery** | 1600ms clock (D142), card 0 at 25.2px and still during the deal (D147); ⭐⭐ **NEW: NO held run and NO playhead damping — the column tracks the finger 1:1** (D157); ⭐ **NEW: foot tightened, last card → divider 256.6 → 168.9px** (D158) |
| **Stone wheel** | bend 30, card 0.80, wheel cap 390, bare gold arrows (D135–D138) — ⛔ untouched |
| **Stones → estimator seam** | the brand marquee is a plain divider (D143) |
| **Estimator** | rebuilt: one piece = one labelled card, stats are rows, every caption/hint pair stacked (D148) |
| **Process** | title 89.5px under the divider, matching the gap above it exactly (D149) |
| **About** | Nick and Rimsha only, two 3:4 plates — DESKTOP TOO (D150); title, copy and CTA centred, PHONE ONLY (D151) |
| **FAQ** | a plain accordion (D152); ⭐⭐ **NEW: rows take the enquiry form's grey, the drawer is frosted glass, NOTHING is open on arrival and a re-tap closes** (D154) |
| **Footer** | centred head, Explore beside Browse (D153); ⭐⭐ **NEW: both marks are hero-style badge pills, the phone and email are full-width centred pills out of the column, Explore/Browse centred in their halves** (D159) |
| **The collection** | the search narrows properly (D139) |
| ⛔ **Light stone bands** | ⛔⛔ **TRIED AND REVERTED THE SAME DAY (D161). Every section is dark, as before. Read D161 before ever suggesting it again** |
| **`/stones/compare.html`** | the compare page (D141); ⭐⭐ **NEW: the "Add a stone" picker was COMPLETELY BROKEN since it was built and is fixed** (D155) |
| Page floor | veil 0.46 (D123) |
| Sticky bottom bar | Get a quote · Email · Call (D99/D106) |
| Everything else | ⛔ untouched — still the desktop-era layout at phone width |

---

## 6. ⛔ THE LESSONS THAT COST THE MOST THIS ROUND

### 1. ⛔⛔ A COMPUTED-STYLE SWEEP CANNOT SEE AN ENTRANCE DRIVEN BY INLINE TRANSFORMS

He asked twice for the reviews entrance to go. **D134 measured the section, found the deck and all
sixteen cards already at `opacity:1` with no transform, and concluded the entrance was the section
head alone.** That was right about the CSS and wrong about the section: the cards are positioned by
`soloRender()`, whose `!revEntered` branch parks them ~400px off-screen. Nothing in the computed
style says so. ⭐ **Look for the flag, not the class.** And when a client repeats a complaint you
have already "fixed", assume you fixed a different thing.

### 2. ⛔⛔ THE SAME FAULT SIX TIMES READS AS SIX DESIGN PROBLEMS

"So much text" in the estimator was one idiom repeated: `justify-content:space-between` pairs —
caption left, explanation right — which needs ~420px and gets 294px of panel. Six of them. ⭐
**Count the shapes before redesigning any of them.** The answer was fewer things per line, never
smaller type; the captions were already at 9.5px on .18em because someone had shrunk them once.

### 3. ⛔ ONE ITEM WEARING THREE NAMES LOOKS LIKE BAD STYLING

The FAQ "looks terrible" because the row said "What it costs", the plate's eyebrow said "Pricing"
and its heading said "How much does a stone worktop cost?" — fine as index-then-detail in separate
columns, incoherent stacked on a phone. ⭐ **The mechanism was already right** (`place()` has moved
the plate inline below 760px since it was built). It was wearing desktop clothes.

### 4. ⭐ A GAP THAT WILL NOT CLOSE IS OFTEN A RESERVATION, NOT SPACING

The gallery's 78px subtitle gap contained 42.8px that D128 added so the upward-hanging pile would
clear the copy. No amount of tuning air would have touched it. ⭐ **Hanging the fan entirely BELOW
slot 0 instead of centring it there removed the need for the reservation altogether** — and made
card 0 perfectly still during the deal, which is closer to D142's brief than the old behaviour was.

### 5. ⭐ TWO GAPS EITHER SIDE OF A DIVIDER REDUCE TO ONE SENTENCE

`.section-divider`'s margin is symmetric, so "same distance above and below" is just "give the two
sections the same padding". ⭐ **Express it as the same clamp, never as the px it evaluates to** —
D147 and D149 both do this, and both track the screen height rather than agreeing once.

### 6. ⛔⛔ WHEN A CHANGE HAS A COST SOMEWHERE ELSE, THE COST STAYS BEHIND

Twice in one round the same shape: a decision was implemented correctly and the thing it had been
*paying for* was left standing. **D142 put the gallery accordion on a clock but left `animPx`, the
690px of scroll that existed only so the animation could be scrubbed** — so the section pinned and
did nothing for three flicks (D157). **D116 made the review card the brightest thing on the page and
D156 toned it down, but `--gold-lo` had been chosen for the OLD card's luminance** — leaving it
would have shipped 3.42:1 text (D156). ⭐ **After changing a value, grep for what was derived from
it.** Both were found by asking "what did the old number justify?", not by looking at the change.

### 7. ⭐ THE CLIENT'S TWO COMPLAINTS ABOUT ONE SECTION WERE TWO DIFFERENT BUGS

"It feels stuck" and "it still feels like it's moving" sound like one vague impression. They were
`animPx` (a dead pinned run) and `SCRUB` (a mouse-wheel damping constant on a touch screen) —
unrelated code, both real. ⭐ **Do not collapse a client's two clauses into one fault.**

### 8. ⚠️ A TRANSITION MEASURED TOO SOON WILL LIE ABOUT ITS DIRECTION

The FAQ chevrons read INVERTED 1.2s after a tap — the base rule's `.55s` on `--ease` has a long
tail. Settled they are correct. ⭐ Same family as §0: **anything eased needs converging on, not
waiting on.**

---

## 7. ⚠️ THE ENVIRONMENT TRAPS

- ⛔⛔ **`scroll-behavior:smooth` IS ON `<html>` — EVERY PROBE `scrollTo` ANIMATES.** See §0. Always
  use `scrollTo({top,behavior:'instant'})`. This corrupted the last round's settle measurements and
  produced a "~60s asymptotic tail" that does not exist.
- ⛔ **A STALE SCREENSHOT WILL DISAGREE WITH LIVE DOM READS AND THE DOM IS RIGHT.** Late in this
  round the pane returned a screenshot of the reviews section while `getBoundingClientRect()` had
  the page in the gallery. Same `visibilityState:'hidden'` cause as below. ⭐ Trust the measurement,
  open a fresh tab for the picture.
- ⛔⛔ **THE BROWSER PANE GOES `visibilityState:'hidden'` AND THEN SILENTLY IGNORES `scrollTo`.**
  It happened mid-round: `scrollY` stayed 0 against a 15521px document with no locks, no overflow,
  `scrollingElement` correct. ⭐ **Check `document.visibilityState` FIRST when a scroll will not
  take.** `tabs_select` did not front it; **`tabs_create` + `navigate` did**, and scrolling worked
  immediately afterwards even while it still reported hidden.
- ⛔ **`javascript_tool` TIMES OUT AT 30s.** Split long settles into ≤24s calls that stash state on
  `window`, or the call dies and you lose the probe.
- ⛔ **THE PANE CANNOT TAP ANYTHING BELOW 768px AND IT FAILS SILENTLY.** Use `el.click()` — it
  exercised the estimator's shapes, island, add/remove and the FAQ's twelve rows fine.
- ⚠️ **THE PANE DOWNSCALES A 1440px VIEWPORT INTO AN ~800px IMAGE**, so desktop screenshots are
  near-useless for detail. Measure instead. `zoom` on an element re-lays out (unlike `transform`)
  but does not defeat the downscale.
- ⚠️ **`zoom` with a `region` is not supported.** To inspect a detail on the PHONE, apply a
  temporary `transform:scale()` with a corner `transform-origin` and screenshot that — 7× is what
  proved the hero arc.
- ⚠️ **`location.href` read in the same tick as the assignment returns the OLD url.** A `reload()`
  in the same call as the probe kills the call — reload, then probe separately.
- ⛔ **`catalogue_source.py` is a 52-STONE SNAPSHOT, not the range.** `catalogue_active.py` is.
- ⛔ **AN INVENTED DATA VALUE CAN BLANK THE WHOLE SITE.** Valid presets: calacatta, carrara, crema,
  emperador, eternal, fumo, goldveil, mist, nerogold, statuario.
- ⛔ **THE RANGE IS ALPHABETICAL EVERYWHERE (D85). NO DARK STONE ON THE FIRST SCREEN (D86).**
- ⚠️ **`-s.webp` IS 800px, NOT 300.** ⛔ Do NOT run `expand.py`.

---

## 8. ⛔ RULES THAT MUST NOT BE BROKEN

1. ⛔ **A stone's NAME and its PHOTOGRAPH must both match the supplier's own** (§4).
2. ⛔ **Fabrication is OUTSOURCED. Never claim in-house.** Templating, fitting and aftercare ARE
   theirs and may be claimed freely.
3. ⛔ **Never state something we cannot guarantee, and never use an absolute.**
4. ⛔ **Every measurement in millimetres.** The estimator's linear metres of edging is the exception.
5. ⛔ **A stone is called what it is; the range is named for what it contains** — "Marble & Quartzite".
6. ⛔ **Never a bright or gold line across the TOP of a card or section**, anywhere.
7. ⛔ **Suppliers are never named publicly.** ⚠️ The retired marquee held BRANDS, not suppliers —
   see D143 before "restoring" anything.
8. **No showroom. Never show the review count. Never signal a young company. Value, not cheap.**
9. **Voice:** quietly confident master. British English, commas not em dashes, no exclamation marks.
10. ⛔ **The logo is the client's artwork and is never re-drawn. Set HEIGHT only.**
11. ⛔ **ONE DEVICE AT A TIME. Desktop is frozen and only the client unfreezes it** — he did so once,
    explicitly, for D150, and that is the model: he names the change and the device.

---

## 9. OPEN — DO THESE NEXT

### ⭐ Ask him these four, they are cheap and two are one-word answers

1. ⭐⭐ **DOES THE ABOUT CENTRING GO TO DESKTOP TOO (D151)?** He said the About change "also applies
   to desktop… only the about us section part", but the change he had just described was cutting
   Ali. The removal went in at every width; **the centring is phone-only until he says otherwise**,
   because desktop is frozen and that is the reversible reading. He was told this plainly. If yes,
   move three rules out of the phone block and nothing else changes.
2. ⚠️ **IS IT RIMSHA OR REMSHA?** He said "Remsha" in the voice note; the page has always said
   **Rimsha** and that was kept — a phonetic spelling is not an instruction to rename a real
   person. One word from him settles it. ⛔ It is a real person's name on a public page.
3. ✅ ~~Does the FAQ need tap-to-close?~~ **ANSWERED — he said "the first one stays open" and it is
   done (D154): nothing is open on arrival and a re-tap closes.**
4. ⭐ **DOES HE WANT THE "price is below" CUE IN THE ESTIMATOR?** He raised it and answered himself
   ("or we don't have to say anything"). Nothing was added. One line if he asks. **Still open.**
5. ⚠️ **HAS HE SEEN `/stones/compare.html` WORKING?** The picker was broken from the day the page was
   built (D155) — at every width, not just the phone — so **he has never used the page as designed**.
   Worth putting in front of him now that it works, and worth asking whether the page still earns its
   place given he chose it over the form backend. ⛔ `stone.css` is cached 5 minutes; warn him.

### ⭐ Carried, still open

6. ⭐ **Does the brand marquee come off DESKTOP too?** D143 hid it on the phone only. ⚠️ He may want
   it back with brands alone — it never held his buying list.
7. ⚠️ **The "keep scrolling" indicator may be OBSOLETE.** D142 means the animation no longer needs
   scrolling at all. **Ask before building it.**
8. ⭐ **The animations on his iPhone.** Raised three times, never diagnosed. ⭐ **This round should
   help and for a measurable reason:** D145 removed three permanently-transitioned cards, D144 kept
   D133's dropped compositing layer, and D148/D152 removed a framed plate and a min-height from the
   phone's paint, and D157 removed a damped per-frame playhead and 690px of pinned runway. **That is still a prediction, not a measurement.**

### ⛔ The two that actually block go-live — unchanged, and neither is design

9. ⭐⭐ **The enquiry form has no backend, and it carries file uploads.** `buildEnquiry()` assembles a
   `FormData` and has nowhere to POST. **Top open item for fourteen sessions.** ⚠️ Compare sends a
   shortlist at it via `?stones=` that nothing reads.
10. **Photography — the STONES are done. The PEOPLE and the PROJECTS are not.** ⚠️ Say out loud that
   the director portraits and the Why feature shot are placeholders. ⭐ **There are TWO portrait
   plates now, not three, and they are 3:4 rather than 1:2** — the shoot brief changed with D150.
   ⚠️ **Three of the six service tiles show the wrong subject** — Bathrooms a bare slab, Outdoor
   Kitchens a quarry, Commercial a kitchen.

### The rest

11. ⭐ **The service pages need the global sections** — no project gallery, stone selector or
    estimator. Extract once into shared files that `build_services.py` wires into all six.
12. ⚠️ **A live copy problem, flagged and NOT fixed** — `SERVICES[0].long` and the service pages'
    "Vein-matched by hand" both claim fabrication TopCat outsource (rule 2) and state an absolute
    (rule 3). ⛔ **Live on the service pages right now.** ⚠️ `verify.py` check 7 does not scan
    index.html's inline data.
13. ⭐ **Pick a production host** and give it brotli + long-lived cache headers (§2).
14. ⭐ Close the licensing question on Caesarstone, CRL and Bloom. ⛔ Classic Quartz Stone is off
    limits. ⭐ **Calacatta Gold is UNRESOLVED** — needs the maker's name from his intro video.
15. **The TABLET round**, when he calls it. ⚠️ It still has the flip-card grid with "click for
    details", black review cards, the boxed burger, the ringed wheel arrows, the brand marquee,
    **and every desktop-shaped thing this round fixed on the phone** — the estimator's colliding
    captions, the index-and-plate FAQ and the stacked footer are all still there at 721–1120px.

**Still waiting on the client:** whether Quartzite becomes a fourth range, 20mm vs 30mm pricing
(⚠️ the estimator's thickness toggle currently moves no number, which is correct until he rules),
brackets for vanity tops / fireplaces / tables, the hero's "Request a call" demotion (asked four
times), and the £3k vs £3,850 three-slab discrepancy.

---

## 10. ⭐ HOW THIS CLIENT WORKS

⛔⛔ **DO THE THING HE ASKED FOR, IN THE MESSAGE HE ASKED FOR IT.** This round was **one message
with ten asks**. They were done in his order, and the order mattered — #6 (the process gap) had to
be measured after #5 (the estimator) because it is measured against the estimator's own last line.
**Say plainly which you are dropping and why, before you start.**

⚠️ **HE CORRECTS THE DIAGNOSIS, NOT JUST THE DESIGN, AND HE IS USUALLY RIGHT.** He said the review
cards animate; a previous round had "proved" they do not. He said the FAQ looks terrible; the fault
was three labels, not the styling. **Take the report as data even when the explanation is wrong —
and especially when you have already answered it once.**

⚠️ **HE SCOPES BY DEVICE, EXPLICITLY, AND HE WILL UNFREEZE ONE THING AT A TIME.** "This part also
applies to desktop, but nothing else… only the about us section part." ⭐ **When the boundary of
that sentence is unclear, take the reversible reading and tell him you did.**

⚠️ **HE REVERSES HIMSELF AND THAT IS FINE — BUT LOG IT.** ⛔ **Write the reversal into §D with the
reason the old decision existed**, or the next session helpfully rebuilds the thing he just
rejected. D147's "the gap was a reservation, not spacing" is the model.

⭐ **HE DESCRIBES THE ANIMATION HE WANTS, NOT THE SHAPE.** *"It just plays"*, *"like an accordion"*,
*"fold or go almost out of the screen"*.

- **Walk the journey, do not check the page.**
- ⭐ **LOOK AT THE RESULT BEFORE REPORTING IT DONE.**
- **Measure, then claim.** ⚠️ **And if you could not measure it, say so.**

---

## 11. BUDGET AND THE DOCUMENT SET

- **~82 credits** of the client's **100-credit ceiling** spent. About **18 left**. ⭐ **This round
  cost none** — layout, CSS and script work, no image generation.

| File | What it is |
|---|---|
| **`HANDOVER.md`** | ⭐ The single current state. §D is the register, **D1–D130 and D132–D153**. §2 the standing rules, §2a the supplier list. ⚠️ **THERE IS NO D131 ROW** — reconstruct from the 12 Aug archive's §5 if needed, but **do not reuse the number** |
| `HANDOVER-2026-08-12-search-compare-untied-gallery-start-here.md` | The previous START HERE. ⚠️ Superseded on the hero divider, the reviews, the services tiles, the gallery gap, the estimator, About, the FAQ and the footer |
| `Website Demo/index.html.pre-hero-fold-round.bak` | ⭐ **This round's baseline — the freeze probe's reference** |
| `Website Demo/index.html.pre-navbar-divider-stone.bak` | Baseline before the burger / hero-corner / wheel round |
| `Website Demo/index.html.pre-gallery-untied.bak` | Baseline before the gallery came off the scroll |
| `Website Demo/stones/build_stones.py` | Builds the collection, compare.html and 132 stone pages. `scoped_words()` and `_haystacks()` are the search |
| `Website Demo/stones/harvest/verify.py` | ⭐ The nine-check gate. `NOT_A_STONE` is the exemption list — keep it exact |
| `Website Demo/stones/stone.css` | Collection + stone + compare styles. ⚠️ Cached 5 minutes (§2) |
| `Website Demo/dev-server.js` | Compression, caching, and the reload that keeps scroll position |
| `stones/supplier_names.py` | ⭐ The seven authorised name differences |
| `Docs/topcat-worktops-SEO-LOG.md` | Every URL, title, target query and SEO change |
| `HANDOVER-archive-to-2026-08-06.md` | ⚠️ **Every design the client rejected, in his words.** Read before redesigning anything |

⚠️ **Section numbers in `HANDOVER.md` are referenced from code comments** (`§3`, `§4`, `§5a`,
`§6.7`, `§7.5` are live in `index.html`). **Do not renumber.**

⚠️ **`Website Demo/` holds 57 `index.html.pre-*.bak` files** — and a git repo (§3). This round's is
`pre-hero-fold-round`.
