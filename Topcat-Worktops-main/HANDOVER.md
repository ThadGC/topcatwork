# TopCat Worktops — Session Handover

> ⛔ **11 Aug 2026 — THE FIFTH HELIX CARD SHIPPED INVISIBLE (D98).** Three causes stacked: the
> stage overlapped the copy so far that the top ghost sat entirely inside the mask's protective
> band, the mask's top stops were PERCENTAGES where they had to be PIXELS, and the ghost opacity
> was low enough that the mask finished it off. ⭐ **The keeper: a percentage stop scales with the
> STAGE, and the thing that stop has to line up with is the COPY.** The copy's bottom is a fixed
> px distance below the stage top and does not move when the text rewraps. Measured after, the
> two ghosts are balanced at 0.31 / 0.29 where the top one was invisible. ⚠️ Room for the fifth
> card came from the CARDS (width 0.76 → 0.70, and height is 0.66 of width), not the section.
> ⭐ The hero bevel's cuts are short now — 80% of the width is flat — and 22/38 = tan(30°) is what
> keeps the hairline lying on the cut.

> ⭐ **11 Aug 2026 — THE MOBILE HELIX SHOWS FIVE CARDS, TWO OF THEM INERT GHOSTS, AND THE HERO'S
> BEVEL IS 30° WITH ITS EDGE RAISED (D97).** The stage reaches up under the intro on a negative
> margin, so it gained two cards and got 20px SHORTER. ⭐ **The mask's top stop is 0.10 alpha, not
> 0** — that is what puts a card behind the copy at 0.022–0.08, visible as depth and unable to
> compete with the text. ⛔ **Interactivity is decided by POSITION, not opacity**, and
> pointer-events alone was not enough: a dispatched click bypasses hit-testing, so the listener
> refuses `.hx-ghost` outright. ⚠️ **sin is symmetric about 90°**, so the card one step out and
> the ghost two steps out share a sideways offset — widen the arc too far and both collapse into
> one sliver. ⛔ **The bevel hairline's gradient angle had to change with the bevel**: `to top
> right` traced the cut only because the box was square; the angle is `tan⁻¹(rise/run)`.

> ⭐ **11 Aug 2026 — THE SERVICES HELIX RUNS ON MOBILE NOW (D96), and the section went from
> 2,939px to 649px** because it replaces six stacked flip cards. ⛔ **The card CSS was LIFTED out
> of the desktop media query into a shared one, not copied** — a second copy would have been this
> project's signature bug for the fifth time. `--hxMode` is set by the media query and read by the
> script, so the breakpoint is declared once. ⚠️ **The desktop floors are the trap** (card 300, R
> 210, STEP 96 are all wider than a phone can give). ⭐ STEP is the edit as much as the rise: at
> 0.30 of the stage the ±2 cards climb clear and the mask takes them, so a phone shows three
> cards. ⚠️ The mask goes on the STAGE, never a card, or the 3D flattens. ⛔ Tablet keeps the grid.

> ⭐ **11 Aug 2026 — THE MOBILE REVIEW SPACING IS REBUILT ON THE CARD'S REAL HEIGHT (D95).**
> Subtitle→card 64→30, card→buttons 54→20. ⛔ **Most of that gap was invisible slack, not a
> spacing choice**: the stage was sized from the deck's UNSCALED height while the card is
> transform-scaled to ~0.84 inside it, leaving 27px of dead space a side that no rule named.
> `gridLayout()` now writes the measured scale out as `--revScale`, so the stage is sized from the
> card the customer can see. ⚠️ Solo must skip the stage-height cap on the scale, or it is
> circular. ⚠️ Half the air had to be added to the open-card pager drop too — missed first time,
> which put the buttons 4px under an open card where a closed one is 20.

> ⛔ **11 Aug 2026 — THE SWIPE ONLY ANSWERED TO A TOUCHSCREEN, SO IT DID NOTHING FOR THE CLIENT
> (D94).** It was bound to touch events only; his MacBook has no touch hardware, so neither a
> two-finger trackpad swipe nor a click-and-drag reached it. ⭐ **The lesson generalises to this
> whole round: a phone layout is looked at on a DESKTOP browser far more often than on a phone
> during a build, including by the client — so a phone gesture has to answer to a mouse and a
> trackpad as well.** ⚠️ It passed its own verification because the tests synthesised touch
> events, which proves the handler works and not that a person can reach it. Three paths now:
> touch, mouse drag, and a `wheel` with `deltaX`. ⭐ An open review also shows the WHOLE review in
> one go — no scrollbar inside a scrolling page — and tapping again closes it.

> ⭐ **11 Aug 2026 — THE MOBILE REVIEWS ARE A SWIPEABLE CAROUSEL (D93).** The neighbouring
> reviews now peek in from both edges, the centre card is slightly narrower to make room, and the
> two pager buttons have moved below it. ⭐ **The neighbours are the affordance, not decoration**:
> a lone centred card with two arrows tells a customer nothing about there being more to read.
> ⛔ **The phone dress is scoped by a CLASS set from `perPage()===1`, not by a media query** — the
> stylesheet and the layout maths must never hold separate opinions about what a phone is, which
> is D51/D59/D68/D78's failure mode and would have been its fifth outing. ⚠️ The pager rides DOWN
> with an open card rather than capping it; capping left a long review scrolling inside 290px.

> ⭐ **11 Aug 2026, the mobile round opens — THE MOBILE HERO IS CENTRED AND ITS BOTTOM EDGE IS A
> MATCHED BEVEL (D92).** Title, trust line, CTAs and chips all centre on the viewport centre; the
> three reasons go back to a **row of three**, icon over label, icons top-aligned so they read as
> one line. The curved bottom edge is gone: `--bev` is both the run and the rise of each corner
> cut, which is what keeps the angle at exactly 45°, and the hairline that traces it is three
> background gradients rather than an SVG, because a stretched SVG is only 45° at one width.
> ⚠️ **The trust line's gold LEFT rule stands down on mobile** — it cannot work against centred
> text — and the client should be told that, since the rule was his own request. ⛔ Desktop and
> tablet were **probed side by side against the pre-change file at 1440×900 and 768×1024 and came
> back identical**; that side-by-side probe is the pattern to reuse for every mobile change.

> ⛔ **11 Aug 2026, later — DESKTOP DESIGN IS CLOSED, AND WORK IS NOW MOBILE-ONLY (D90, D91).**
> The last desktop change was the final CTA card: it carried the page floor's own photographed
> slab at full strength behind the enquiry form, and the client asked for **plain grey** — it is
> now `--ink-2`, the panel grey every other card on the site already uses. ⛔ **Then desktop
> froze.** "When I say let's do mobile, then we only work on mobile. Everything else stays exactly
> as it is on the other devices." Tablet comes after mobile, and the client says when.
> ⚠️ **The trap is structural, not one of memory**: `index.html` is one file with inline CSS, so
> nearly every rule is unscoped and applies at every width. **A mobile change belongs inside a
> width-scoped media query; editing a base rule to fix mobile silently changes the frozen
> desktop.** See **§2 rule 15**. ⚠️ This is a DESIGN freeze — the enquiry backend, the
> photography and the licensing questions are unaffected and still open.

> ⭐ **11 Aug 2026 — ALPHABETICAL ORDER, V2 REMOVED, AND THE MIRROR RANGE. The range is 132.**
> Three client decisions in one session, and the last one exposed the worst mistake of the
> project so far. **(1)** Every stone on every surface is now **alphabetical** (D85) — "it would
> make it easier for people to navigate" — which ⛔ **reverses D74's dark/light spreading**,
> because a name says nothing about colour. Granite consequently opens on seven dark stones in a
> row; he has seen it. The wheel needed a real change, not just new data: its fan seated cards
> centre-out, which scrambles a sorted list into two interleaved runs. **(2)** The first five,
> then the whole visible nine, must be light (D86) — no landing card can do that alphabetically,
> so the darks inside the opening window are deferred just past it, split evenly either side.
> **(3)** **V2 is gone entirely** (D87), which also closed the standing risk that its
> un-rewritten in-house-fabrication claims could be published by a revival.
>
> ⛔ **THE ONE TO READ IF YOU READ NOTHING ELSE — D88 → D89.** Asked for "mirror grey, mirror
> black, mirror white", a search of one supplier listing concluded those names existed nowhere,
> and **shipped a different product under a search alias instead**. The supplier publishes all
> six Mirror stones as ordinary product pages; **their own search box returns them in one
> request**. The client found it in four seconds by typing "mirror" into the site. ⭐ **Search
> the supplier's own search before concluding a product does not exist, and never substitute a
> different product for the one you were asked for.** All six are live now under their real
> names. ⚠️ D88a is worth reading beside it: **super-resolution destroys speckle**, and D77's
> drift metric passed the ruined tile.

> ⭐ **10 Aug 2026, third session — THE RANGE IS NAMED "MARBLE & QUARTZITE".** The client walked
> the journey the last session had left half-fixed: he pressed **Marble**, opened a stone, and
> was told **Quartzite**. "We cannot have that confusion." ⛔ **The answer is not to call it
> marble** — 26 of that range's 45 stones are quartzite, one is travertine, and no merchant sells
> Taj Mahal as marble. **The stone always says what it is; the range is now named for what it
> contains.** Two constants carry the wording, `mat` never moved, so no price or filter changed.
> Read **§D D66–D68** and **§4p**, and **§2 rule 13** before renaming anything.
>
> ⚠️ Two things fell out of checking which surfaces name a material, and both were live: a
> hand-typed quartzite list had gone stale at 10 of 26, so **16 stones could not be found by
> searching the word that describes them**; and the HTML sitemap was built from the 52-stone
> snapshot, so **63 stone pages were missing from the page whose job is to prove nothing is
> orphaned**. ⭐ Both are the same root cause as D51 and D59 — **a second file that looks like
> the source of truth** — now hit for the third time.

> ⭐ **10 Aug 2026, second session — THE COPY ROUND.** Every stone description on the site was
> rewritten, all 115 of them, because the client read one and found it was **factually backwards**.
> Behind it sat a script that assembled 63 blurbs from a fixed phrase bank. Also fixed this round:
> **22 pages printing a wrong slab size**, **three unkeepable promises** in the shared facts block
> (one on all 45 marble pages, and it claimed fabrication TopCat outsource), **27 pages that
> contradicted themselves** by titling a quartzite "Marble", **four dead pages still live and
> indexable**, and a **correction from the day before that had silently reverted**.
>
> ⛔ **Read `§D` D56a–D65 before touching stone copy, `stones/descriptions.py` before writing any,
> and run `harvest/verify.py` before you call anything done.** It has seven checks now, not four.
>
> ⚠️ **The through-line of this session, and the thing to carry forward:** every defect was a
> sentence or a number that *looked* right on a page that *rendered* correctly. None of it would
> have been caught by looking at the site. The client caught three of them himself.


**THE single current handover. Start here in a new chat.**
Current as of **11 August 2026**, end of the **first mobile round**.
⭐ **The range is 132 stones across 167 live pages. Desktop design is CLOSED (D91); the live scope
is MOBILE (≤720px); tablet is untouched by instruction.** Open
`HANDOVER-NEXT-CHAT-START-HERE.md` first in a new chat, and
`HANDOVER-2026-08-11-mobile-round.md` before touching any mobile rule; this file is the full
record behind both.

**If you are picking this up cold, read in this order:** §D the Decision Register → §0 the current
state → §2 the standing rules. That is about ten minutes and it is enough to work safely. The two
narrative session write-ups (`HANDOVER-2026-08-07-*.md`) explain *why* things are the way they
are, and are worth reading before redesigning anything they cover.

---

## ⭐ HOW TO USE THIS DOCUMENT

1. **Read §D, the Decision Register, first.** It is the list of every client decision, including
   the ones that were later **reversed**. Several rules on this project have flipped more than
   once, so a rule read without its history will send you the wrong way.
2. Then §0 for the current state and the outstanding job.
3. §2 is the standing rules. They are the ones that get broken by accident.

### ⚠️ MAINTAINING THIS DOCUMENT — client instruction, 7 Aug 2026

> "Keep track of everything we do and every decision we make. If I change something that was
> previously made in the handover doc, then change and update the handover doc."

So, whenever the client makes or changes a decision:

- **Add a row to §D** with the date, what was decided, and what it supersedes.
- **If it reverses an earlier decision, mark the old row `⛔ REVERSED` and say what replaced it.
  Never silently delete a decision.** The reversal history is the most valuable thing in here,
  because it stops the next session re-proposing something already rejected.
- **Update the affected section** in the body, and the standing rule in §2 if there is one.
- **If it touches SEO in any way**, also update `Docs/topcat-worktops-SEO-LOG.md`, which is the
  record written for the client's SEO specialist.
- **If a design was rejected**, record the client's own words. They are what stops it coming back.

### The document set

| File | What it is |
|---|---|
| **`HANDOVER.md`** | ⭐ This file. The single current state. |
| **`Docs/topcat-worktops-SEO-LOG.md`** | ⭐ Every URL, title, target query, schema decision, linking structure, compliance scan and SEO change log. Written to hand to the client's SEO specialist. |
| `Docs/topcat-worktops-seo-build-plan.md` | The SEO research behind the build |
| `Docs/topcat-worktops-industry-brief.md` | Industry, materials, regulation, competitors |
| `Docs/topcat-worktops-customer-psychology.md` | Buyer psychology, homeowner and trade |
| `Docs/topcat-worktops-sales-call-notes.md` | What the owners actually said on the sales call |
| `HANDOVER-archive-to-2026-08-06.md` | ⚠️ Every earlier round and **every design the client rejected, with their words**. Read before redesigning anything. |
| `HANDOVER-2026-08-07-seo-build.md` | The narrative write-up of the 7 Aug SEO session (first session that day) |
| `HANDOVER-2026-08-07-design-round.md` | ⭐ The narrative write-up of the 7 Aug design round (second session): the sitemap, the two scroll animations, the FAQ redesign, the enquiry form's foot, the helix card backs. **Read §2 and §5 of it before touching either scroll build or the FAQ.** |
| `HANDOVER-2026-08-09-real-slab-photography.md` | The narrative write-up of the first slab-photography session (the pipeline itself: harvest, crop, gate, match). ⚠️ Its plan to harvest marble.com was **reversed the next day** — read the file below before acting on it. |
| **`HANDOVER-2026-08-10-slab-photography-complete.md`** | ⭐ The narrative write-up of the 9–10 Aug session that **finished** the photography: 52/52 stones, the six collection bugs that were hiding the images, the licensing decision on marble.com, the two automatic guards and the live wrong-image errors they caught, and the popularity ordering. **Read §2, §3 and §5 of it before touching anything in `stones/harvest/`** — most of what looks like a threshold worth tuning was arrived at by looking at several hundred photographs, and the obvious tuning has already failed. |
| **`HANDOVER-NEXT-CHAT-START-HERE.md`** | ⭐ **Rewritten 11 Aug, end of the FIRST MOBILE ROUND. This is the file to open first in a new chat** — the device-scope rule and how to prove the freeze, the nine-check gate, the integrity rule and its four failures, the six lessons of the mobile round, and the open list in priority order. |
| **`HANDOVER-2026-08-11-mobile-round.md`** | ⭐ The narrative write-up of the first mobile round (D90–D98): the desktop freeze and how it is proven, the hero's bevel geometry, the swipe that only answered to a touchscreen, the invisible slack behind a spacing complaint, and the three stacked causes of a helix card that shipped invisible. **Read before touching any mobile rule.** |
| `HANDOVER-2026-08-11-alphabetical-v2-mirror-start-here.md` | The START HERE from the alphabetical / V2-removal / Mirror round, superseded 11 Aug. ⚠️ Predates the desktop freeze and all mobile work |
| `HANDOVER-2026-08-10-logo-and-integrity-start-here.md` | The START HERE from the logo / name-integrity round, superseded 11 Aug. ⚠️ Describes a **126**-stone range ordered by POPULARITY on a site that still had a V2 — all three have moved |
| `HANDOVER-2026-08-10-naming-round-start-here.md` | The START HERE from the naming round, superseded 10 Aug. Still good on the range rename |
| **`stones/catalogue_mirror.py`** | ⭐ The Mirror range (D89), and the full write-up of the substitution mistake that preceded it |
| `HANDOVER-2026-08-10-photography-start-here.md` | ⚠️ The PREVIOUS start-here, written after the photography session and renamed when it was superseded. Still good on the pipeline and the traps, but **two rounds out of date**: it says 63 stones carry generated copy, it predates verify.py checks 5–7, and it predates the range being renamed Marble & Quartzite. |
| **`stones/descriptions.py`** | ⭐ The 115 stone descriptions and, at the top, the rules for writing them. Read before changing a single one. |
| `HANDOVER.pre-*.bak.md` | Previous copies of this file |

⚠️ **Section numbers here are referenced from code comments** (`§3`, `§4`, `§5a`, `§6.7`, `§7.5`
are live in `index.html`). **Do not renumber.** Grep `§[0-9]` across the Website Demo first.

---

## D. ⭐ DECISION REGISTER

Every client decision, newest first. **`⛔ REVERSED` rows are kept on purpose** — they are how the
next session avoids re-proposing something already killed.

### Active decisions

| # | Date | Decision | Notes |
|---|---|---|---|
| D118 | 12 Aug | ⭐ **THE PHONE'S SERVICE TILES ARE LANDSCAPE, NOT SQUARE, AND THEY WEAR A GOLD RIM** | Client: *"add a gold border around the surfaces for every space cards, and I want them to be a little bit thinner instead of being actual blocks, make them more rectangular shapes each of the blocks."* ⚠️ **"THINNER" MEANS SHORTER, NOT NARROWER** — the columns are fixed by the 2-up grid, so height is the only dimension a tile can give up. `aspect-ratio:1.38/1` takes the tile from a 146px square to **146 × 106** (measured 129.4 × 93.7 at 375px, after the grid's 5vw padding and 10px gap). ⛔ **`min-height:0 !important` HAD TO STAY AND THE REASON GETS WORSE WITH A WIDER RATIO** — D114's trap is that `@media(max-width:600px){.svc{aspect-ratio:auto;min-height:420px}}` derives the WIDTH from the height, and at 1.38 that would compute 420 × 1.38 = **580px** of card in a 146px column, against D114's 375px. The wider the tile, the worse the fault it is holding back. ⭐ The rim is the whole border at `rgba(198,166,100,0.62)`, carried above `--hair` (0.34), which disappears at tile size over a photograph. ⛔ **The WHOLE border, never a top edge alone** — §2 rule 10, built by mistake twice before. Reverses D114's square tile ("almost like an ice block grid"), on the client's own instruction |
| D117 | 12 Aug | ⭐⭐ **THE PHONE LISTS SERVICES MOST-POPULAR FIRST, AND EACH TILE IS NOW A LINK STRAIGHT TO ITS PAGE — NO MORE "CLICK FOR DETAILS"** | Client: *"in the surfaces for every space, we're gonna list them from most popular to least popular service. And those cards won't say click for details. It will then go to that specific page."* Order confirmed by him: **Worktops, Islands, Bathrooms, Splashbacks, Outdoor, Commercial**. ⛔ **RE-ORDERING THE `SERVICES` ARRAY IS THE OBVIOUS MOVE AND IT IS WRONG — TWO OTHER THINGS INDEX IT BY POSITION.** The desktop helix spins in `ORDER=[1,0,2,3,5,4]` and the project gallery captions its first four photographs from `SERVICES[0..3]`. Moving the array would silently re-spin a FROZEN desktop helix (§2 rule 15) and swap the gallery's pictures out from under their captions — two regressions, neither of which looks like a bug in the thing that was changed. **The array is data; the order is presentation; they are kept apart.** ⛔ **AND IT IS NOT CSS `order` EITHER, WHICH WAS THE NEXT OBVIOUS MOVE**: `buildCards` stamps a literal `01`…`06` from the build index, so a purely visual re-order runs the numbers **01, 02, 04, 03, 06, 05** down the page. The DOM moves instead and the labels move with it, which also keeps the screen-reader order equal to the visual order and keeps the reveal's `:nth-child` row delays and column offsets addressing the right tiles. ⭐ Scoped by `--svcMode`, declared in the stylesheet and read back by the script — the `--hxMode`/`--galMode` idiom (D96, D105), so no second opinion about what a phone is. **No base rule was touched at all**: the property is declared only inside the phone query and the script falls back to `desktop` when it is unset. ⛔ **`arrange()` BAILS ENTIRELY WHEN THE DOM ALREADY READS CORRECTLY** — on a frozen width the wanted order IS the built order, but `appendChild` still removes and re-inserts every node, restarting transitions and re-entering the reveal. Re-running an identical arrangement is not the same as leaving it alone. ⭐ The tap is intercepted in the CAPTURE phase on the grid, so `buildCards`' flip never fires and the card cannot half-flip on its way out; `buildCards` itself is untouched because the same function builds the tablet grid and the process tiles. ⚠️ The tile keeps `tabIndex=0` but stops being a flip control, so it takes `role="link"` — otherwise a screen reader still offers a hint that is now hidden. **Verified: all six tiles resolve name → correct page** |
| D116 | 12 Aug | ⭐ **THE PHONE'S REVIEW CARD IS CREAM WITH BLACK TYPE, NOT BLACK WITH CREAM TYPE** | Client: *"give the reviews a cream white design instead of the black design, so it'll have black text and the cream white card… just so that the review part stands out a little bit more."* ⭐ **NO NEW COLOUR WAS INVENTED — IT IS THE BRAND'S OWN TWO, SWAPPED.** The card takes `--bone` (#F4F1EA) and the type takes `--ink` (#0B0B0D). ⛔ **SCOPED BY `.rev-solo`, NOT A MEDIA QUERY (D93's rule).** `.rev-solo` is set from `perPage()===1` (`innerWidth<720`), the same test the layout maths uses; a media query here would be a second opinion about what a phone is, and the two already disagree at exactly 720px. It also guarantees tablet cannot catch it — `perPage()` returns 3 from 720px up. ⚠️ **EVERY OVERRIDE IS THERE BECAUSE THE TOKEN WOULD OTHERWISE VANISH, NOT BECAUSE IT LOOKED BETTER.** `--muted`, `--faint` and `--hair-soft` are all WHITE at low alpha — on cream they are invisible, not subtle. Same for `--gold` (#C6A664) on anything that must be READ: ~1.9:1 against #F4F1EA. The stars, the seal and "Read more" move to `--gold-lo` (#8C6B34, ~4.6:1), which is the palette's own antique champagne. ⛔ Do not "restore" --gold here. ⭐ **THE STONE STAYS AND ITS VEIL FLIPS**: `.rev-stone` is marbleSVG() at card scale, the thing that stops a card reading as a plain rectangle (§4); its near-black wash was tuned for a DARK face and left standing would grey the cream card into putty, so it is inverted to a cream wash doing the same job, and the veining reads as faint mottling instead |
| D115 | 12 Aug | ⭐ **THE HERO DIVIDER HAS ROUNDED CORNERS AND A LONGER FLAT RUN. ⛔ REVERSES D97's 30° BEVEL** | Client: *"the Hero section divider that has those sharp corners now — move the flat part even further and then just round the corners near the edge of the screen. So we're gonna make it round corners instead of sharp corners."* ⭐ **THE FLAT RUN AND THE CORNER ARE ONE NUMBER NOW, WHERE THE BEVEL NEEDED TWO.** The bevel's ratio WAS its angle (22/38 = tan 30°), so `--bevX` and `--bevY` could never move independently without tilting the cut away from the hairline tracing it. A quarter-circle has no angle to hold: `--curveR:26px` is the whole shape, and it leaves **323px flat of a 375px screen against the bevel's 299px** — the "even further" he asked for arrives as a consequence of the softer corner rather than in tension with it. ⛔ **THE HAIRLINE HAD TO STOP BEING GRADIENTS AND BECOME A BORDER, AND THAT IS THE REAL LESSON.** D97 drew each diagonal with a `linear-gradient` and derived the gradient angle from the bevel angle. **A gradient can only ever draw a straight band — an arc has no single angle, so no gradient traces this shape.** A border follows `border-radius` exactly and stays 1px doing it. The box is `R + 1px` tall so the straight part of each side border is zero; the left and right borders exist ONLY to paint their half of the arc, because a corner arc is split between its two adjacent borders and leaving the sides transparent draws half a gold arc fading into nothing. ⭐ `clip-path:inset(0 round …)` rather than `border-radius` on `.hero-bg`, because clip-path clips DESCENDANTS and the photo is an `<img>` transform-scaled to 1.08 on load; `border-radius` would have needed `overflow:hidden` added to a base rule desktop shares. ⚠️ **HISTORY, SO NOBODY REVIVES THE WRONG ONE**: this edge was `border-radius:50% 30px` — an ellipse across the whole width with NO flat run — until 11 Aug, and that is the thing the client rejected. A rounded corner is not that ellipse. Keep 2R well under the screen width |
| D114 | 11 Aug | ⛔⛔ **THE HELIX IS GONE ON MOBILE. Six cards in a two-column grid that swing in like double doors. ⭐ THE HELIX STAYS ON DESKTOP** | Client: *"For mobile, we're no longer going to do the helix. I want it to be a simple two by two grid, next to each other"*, then, after a first attempt came out wrong: *"clear small blocks where you can see the full block on each side next to each other… maybe flipping in, like doors closing, from each side."* ⚠️ **THE AGENT WAS TOLD THIS AND DID THE GALLERY INSTEAD, THEN REPORTED THE HELIX AS "NEXT".** That is the fault worth recording: the instruction was explicit and unambiguous and it was deferred without being asked. ⭐ **WHAT THIS DELETES IS AS IMPORTANT AS WHAT IT ADDS.** `--hxMode` is no longer set to `phone`, so `hxPhone()` is false and the phone's entire gesture path switches itself off — `attachSwipe`'s `enabled` gate never opens, the stage's `touch-action:none` stops applying, and the page scrolls over this section the way it scrolls everything else. **D102, D103 and D112 all existed to make a hand-rolled scroll behave on this one component; on a phone there is now nothing to hand-roll.** ⛔ **THE BUG THAT MADE THE FIRST ATTEMPT UNUSABLE, AND IT IS NOT OBVIOUS**: `@media(max-width:600px){.svc{aspect-ratio:auto;min-height:420px}}` was written for a ONE-column phone layout. Left standing it combines with an `aspect-ratio` to solve the card the wrong way round — the ratio is honoured, the 420px floor is honoured, and the WIDTH comes out at 420 ÷ 1.12 = **375px, a full-screen-wide card jammed into a 146px column**, hanging off both edges. `min-height:0` is the whole fix. ⚠️ Two columns also has to out-rank that same `max-width:600px` block's `grid-template-columns:1fr`; it does only because this block is LATER at equal specificity — the third time that ordering rule has bitten (D106, D113). ⭐ **THE DOORS**: each ROW is a pair, left card hinged on its LEFT edge, right card on its RIGHT, swinging in to meet. ⚠️ The delay is per ROW, not per card — `--si` is the DOM index, so a `--si × n` stagger would land one door before its partner and the pair would never meet. ⛔ `perspective` goes on the GRID, never in a transform on `.svc` itself: the flip lives on `.svc-inner` and giving the shell its own 3D context is what flattens a child into painting its back face. ⭐ **FREEZE PROVEN BY TARGETED COMPARISON, NOT BY THE WHOLE-PAGE PROBE** — at 1440 and at 768 every property this round touched (helix display, stage perspective/height/touch-action/mask, card geometry, grid display/columns/gap/max-width, card aspect-ratio/min-height/transform-origin) reads **byte-for-byte identical** before and after. ⚠️ The whole-page probe returned 653 diffs and was **not usable**: the stone wheel alone accounts for 335 of them and the gallery for most of the rest, both being scroll-driven scenes at a different phase. **When the probe is this noisy, compare the specific computed properties you changed — that is deterministic and the probe is not.** ⚠️ Still open from this round: the gallery's one-swipe-to-eight and its "more cards" affordance, the pre-arrival gap, and the divider the client says looks wrong |
| D113 | 11 Aug | ⭐ **THE PHONE'S GALLERY COPY IS SPLIT: TITLE AND SUBTITLE ABOVE THE CARDS, BUTTONS BELOW. ⚠️ AND THE FREEZE PROBE'S 2.6s SETTLE IS NOT ENOUGH — IT NEEDS 8s** | Client: *"I still want the title and the subtitle to be above, and then the cards to pretty much immediately follow after that… after the title settles, the last few cards come in… and then has the buttons below."* ⛔ **THE BLOCK IS STRETCHED, NOT MOVED.** Anchoring `.gal-mid-actions` to a `bottom:` of its own cannot work — `.gal-mid` is `position:absolute`, so it becomes the containing block and the buttons would hang off the BOTTOM OF THE COPY, not the stage. Instead `.gal-mid` spans the whole stage (`inset:0`) and lays its children out in a column; the cards fly over the gap between. ⚠️ `pointer-events:none` on it is now LOAD-BEARING — it covers the stage, so without it the cards stop being tappable. ⛔ **TWO CSS MISTAKES MADE AND MEASURED, BOTH OF WHICH LOOKED PLAUSIBLE:** (1) `justify-content:space-between` has THREE children here, so it put the SUBTITLE in the middle of the screen — the fix is `flex-start` plus `margin-top:auto` on the actions alone. (2) That `margin-top:auto` then LOST, because the base `.gal-mid-actions{margin-top:clamp(...)}` rule sits AFTER the media query at equal specificity; `.gal-mid .gal-mid-actions` outranks it without moving code (D106's ordering lesson, second time). ⭐ The two halves also now fade on DIFFERENT clocks: the heading leads on the gather (`gRaw`), the buttons wait for the spread, because on a phone the copy is above the cards and cannot be covered by one — which is exactly what makes leading with it safe, and why desktop keeps waiting. Measured: title 24px under the nav, subtitle 12px under the title, 407px of clear band for the cards, buttons 24px above the sticky bar. ⚠️⚠️ **THE PROCEDURE CORRECTION THAT MATTERS MORE THAN THE FEATURE: the freeze probe came back with 415 diffs and it was NOT a regression.** §0 of the START HERE says settle ~2.6s; the STONE WHEEL's one-shot entrance is still running well past that, and 335 of the 415 were its 67 slabs at a different rotation. **At 8s the same comparison gives 31.** ⛔ Do not read a large diff as a fault until the wheel has finished — and do not lower the settle back. ⭐ An idle noise-floor check (grab the same page twice, 3s apart, touching nothing) returns 29 and is the honest baseline to compare against. ⚠️ **ALSO A LIVE ENVIRONMENT TRAP: `requestAnimationFrame` DOES NOT RUN WHILE THE BROWSER PANE IS HIDDEN**, and this gallery's loop shuts itself off when caught up and restarts only from a scroll event — so a hidden pane leaves it frozen and every card reads as stuck. It cost a full false diagnosis of "I broke the gallery". Check `document.visibilityState` before believing a still scene |
| D112 | 11 Aug | ⛔ **"IT JUST JUMPS BETWEEN SECTIONS" WAS A GLIDE THE CUSTOMER COULD NOT STOP, PLUS A RELOAD THAT THREW HIM BACK TO THE TOP. FOUR FAULTS** | Client, on the services helix: *"when I put my thumb down… whenever I try to scroll in that whole section, everything glitches out and it takes me right back to the hero. It's jumping between sections. I'm seeing every section at hyper speed with my thumb barely moving."* ⭐ **(1) THE GLIDE WAS UNSTOPPABLE, AND THAT IS THE WHOLE BUG.** `stopGlide()` was reachable only from a `pointerdown` ON THE STAGE, so the one thing anybody does to halt a moving page — put a thumb down — did nothing. Measured: **406px of further travel after the touch**. Worse, the native scroll that touch then begins runs AT THE SAME TIME as the hand-rolled glide, and two things drive `window.scrollTop` sixty times a second. ⛔ That is not a feel complaint, it is a race. Now killed by a capture-phase `pointerdown`/`touchstart`/`wheel` on the WINDOW. **(2) THE RELEASE SPEED WAS ONE SAMPLE.** `vy=step/dt` with dt floored at 1ms, and a phone delivers pointermove every 4–8ms, so an ordinary final sample became 5px/ms — a **40px flick threw the page 309px**, which is precisely "my thumb barely moving". Now averaged over a 70ms window, which also means a pause-then-lift does not fling at all (verified: moved exactly the finger's 100px). **(3) MOMENTUM WAS TOO CHEAP TO SPEND**: total travel is `v0/(1-decay)`, so 0.94 spent 16.7 frames of launch speed; 0.90 with a 2.6px/ms cap spends 10. Hard flick **1.43 viewports → 0.59**. **(4) `fling()` DID NOT CANCEL AN EXISTING GLIDE** — each rAF chain re-registers itself, so a second would have ADDED to the first, not replaced it. ⭐⭐ **AND THE ONE NOBODY WOULD HAVE GUESSED: the live-reload was firing on every save while he was reviewing.** Twelve reloads in one working session, each dumping him at the hero — from the far end of a phone that is indistinguishable from the page glitching. The reload now saves and restores scroll position (verified: parked at 6000, reloaded, still 6000). ⚠️ **`.hx-front` IS A CARD FACE, NOT A POSITION** — a first attempt to prove the horizontal swipe still worked read it as "which card is in front" and reported failure on the UNCHANGED baseline too. The helix rotates by transform; measure card RECTS. Horizontal swipe verified working after the fix (six cards moved, centre went Kitchen Islands → Splashbacks, page did not scroll), reviews verified paging on a flick. ⛔ Freeze probe: 30 diffs at 1440×900 and 30 at 768×1024, all marquee/scroll-cue, counts and heights identical. ⚠️ **STILL OPEN: the client wants the gallery copy SPLIT — title and subtitle ABOVE the cards, buttons BELOW — the pre-arrival gap closed, and reports the section divider looks wrong. None of that is done** |
| D111 | 11 Aug | ⛔ **`no-store` WAS KILLING THE PHONE'S BACKGROUNDED TAB. The dev server is now detached, compressed and cacheable** | Client: *"the hosting thing keeps closing. Every time I go out of it for a short amount of time it says can't open this page"*, and then the correction that matters: *"It's not my Mac that's sleeping. It's when I go off of Chrome on my phone."* ⭐ **Three causes.** (1) ⛔ **The agent kept killing the server** — `preview_stop`, a `kill`, and at one check NOTHING was listening. It now runs `nohup`'d with PPID 1 so the session's tooling cannot take it down, under `caffeinate` as insurance. (2) ⭐ **`Cache-Control:no-store` DOES NOT MERELY SKIP THE CACHE — IT MAKES A PAGE INELIGIBLE FOR THE BACK/FORWARD CACHE.** Chrome keeps a backgrounded tab in memory and restores it instantly; `no-store` makes it discard the tab, so returning means a fresh fetch — the one that fails while a phone's Wi-Fi is re-associating. ⚠️ The names mislead: `no-cache` means "revalidate", `no-store` means "never keep it". Only the second breaks the phone. Now `no-cache` + an ETag over the served body, so revalidation is a 0-byte 304. (3) **The live-reload snippet reloaded on any stream error**, throwing away a good page to request one that was not there; it now backs off to 15s and holds what it has (verified: server killed for six seconds, page stayed fully rendered), releases the stream on `pagehide` so it does not itself block bfcache, and reconnects on `pageshow`. ⚠️ **The whole of this is DEV-SERVER only and does not travel to production** — a host must be chosen and given the same compression and cache headers, and that is still open |
| D110 | 11 Aug | ⭐ **THE PHONE'S PROJECT GALLERY: PILE DEAD CENTRE, ARRIVING EARLIER, CARDS AND COPY BOTH HIGHER AND CLOSER TOGETHER** | Client, on the stacked beat: *"the first card is slightly lower than the middle of the screen, we need to move that card exactly to the center… the cards also need to come up earlier in the scroll before the border of the above section goes through… the words 'view our project gallery' should be closer to the actual cards, and the cards themselves slightly higher closer to the nav bar."* ⭐ **THE 50px HE COULD SEE WAS TWO FAULTS ADDING UP, AND ONLY ONE IS OBVIOUS.** (1) ⛔ **NOTHING IN THIS SECTION KNEW ABOUT THE STICKY BOTTOM BAR (D99).** Every "centre" was computed on a band running from under the nav to the very bottom of the viewport — i.e. 59px of it behind a bar the customer cannot see through. (2) **Centring the pile's EXTENT is not centring the card you look at**: the peek nudges run upward, so the eight-card extent's midpoint sits well above the front card, which is the biggest and hangs lowest. On a phone only the front card really reads, so `stackY=(navH-barH)/2` now puts *that* on the visible centre — measured 0px off, from +50. ⛔ Desktop keeps extent-centring. ⭐ **EARLIER WAS ABOUT THE WINDOW'S END, NOT ITS START**: 0.16 already began the flight 13% into the section, but STAGGER spreads eight arrivals across the whole window and the last did not land until 1.62, which is 0.62 of a viewport INTO the pin. GATHER_TO_P 1.62 → 0.72 lands the eighth card before the pin, so the whole settle happens while the border above is still crossing — measured, cards are visibly arriving with the border at 116px and 16px down the screen. ⚠️ **Pulling only the gather forward would have left the pile sitting still for ~1.8 viewports**, so the break-out came with it: SPREAD_START_P/END_P 0.08/0.28 for the phone against desktop's 0.27/0.47. ⭐ **THE CARDS AND THE COPY DELIBERATELY DO NOT MOVE TOGETHER THIS TIME** — D105 moved them in step to stop the cards landing on the words, but he asked for the gap CLOSED, so the copy moves further: cards `yShift` 0.22 → 0.25 of the stage, copy `bottom` 12% → 18% of the pin. Measured: nav-to-cards 75px → 51px, cards-to-copy 79px → 41px. ⚠️ Safe because `.gal-mid` is at opacity 0 for the entire gather and only fades in as the spread completes, so a higher copy block cannot collide with a higher pile. ⛔ Freeze probe against the pre-round file: **30 diffs at 1440×900, 28 at 768×1024, every one the animating marquee or the scroll cue**, geometry and opacity only; element count and document height identical at both. ⚠️ **A `barH is not defined` error in the console was STALE** — it came from the gap between two saves and a fresh instrumented run driving `measure()` twice and the whole gallery returned zero errors. The console replay trap, again. ⚠️ **Still open: the client reports the animations are not smooth on his iPhone.** He parked it; it is NOT diagnosed. Frames measure 8ms p50 on the Mac, so it is device-side — the coasting rAF playhead and the composited card layers are the first places to look |
| D109 | 11 Aug | ⭐ **THE PAGE WAS 3 MB ON THE FIRST SCREEN AND IS NOW 286 KB. Nothing about it looks different, proven by probe at both frozen widths** | Client: *"the website is currently glitching and jumping around and taking a second to load… we need to have super fast load speeds even with all the images and the video that's going to come in… keep the site looking great, don't change anything about the way it looks."* ⭐ **FOUR SEPARATE FAULTS, AND THE FIRST WAS THE LINK HE WAS TESTING ON.** (1) `dev-server.js` sent everything **uncompressed** and stamped `Cache-Control:no-store` on every file, so his phone re-pulled the entire site on every load AND every live-reload. Now brotli/gzip on text and ETag revalidation on assets: HTML **1,084 KB → 205 KB**, a repeat photo fetch **282 KB → 0 bytes (304)**. ⛔ Delivery only, not one byte on disk changed. (2) **36% of index.html was seven photographs pasted in as base64** — 391 KB of text that cannot be cached, lazy-loaded, converted or meaningfully compressed. Extracted to files by `build_images.py`. (3) **The photographs were serving at up to 24× the pixels their box uses**, and decoded to **99 MB of image memory on a phone** — quarry.jpg alone was 546 KB and 16.5 MB of RAM for a box 105×208. **That memory figure is the "glitching", not the download**: an iPhone holding 99 MB of bitmap for pictures it is showing at postage-stamp size stutters and jumps. (4) 18 `<img>` tags carried **one** `loading=lazy` and **two** width/height between them. ⚠️ **THE TRAP THAT NEARLY MIS-SIZED HALF OF THEM: every one of these sits under `object-fit:cover`, mostly in boxes TALLER than they are wide, so the binding constraint is the box's HEIGHT and the browser crops the sides.** Judging by width alone says cta-slab.jpg is 6× oversized when it is actually **under**-sized, and makes `sizes` select a rung far too small. ⛔ Requirements are `natural_width × cover_scale × 2`, measured by scrolling the whole page at 375px and 1440px. ⚠️ **PSNR IS A LIAR HERE and was nearly believed twice**: quarry scored 33 dB at 764px and 41 dB at 1000px — the same picture, a one-pixel crop offset apart. A 4× zoom on the finest detail showed 764px, 1000px and the original as identical, which is why WebP q85 was kept over q88 and saved 169 KB. ⭐ **The originals are never touched or deleted** — kitchen-day.jpg is referenced by 20 other files — so no other page can be affected. ⛔ **Freeze probe run LAST (D108's lesson): 27 diffs at 1440×900 and 27 at 768×1024, every one of them the animating marquee or the bouncing scroll cue, geometry and opacity only. Element count and document height identical at both.** ⚠️ Still open: no production host is chosen, and compression/caching in production is the HOST's job — the dev-server fix does not travel |
| D108 | 11 Aug | ⛔ **AN UNCLOSED HTML COMMENT PUT 48px OF EDITOR'S NOTES AT THE TOP OF EVERY PAGE, AT EVERY WIDTH. Caught by the freeze probe, not by eye** | Kept because the failure mode is the lesson, not the typo. A note was added to the sticky bar's comment block by prepending it to the `<div>` — with its own `-->`, while the block above still had one. The three lines between the two became a **text node in `<body>`**, and the whole page moved down 48px on desktop, tablet and mobile alike. ⭐ **NOTHING ABOUT IT LOOKED BROKEN**: the JS was fine, `node --check` was never going to see it, the section it belonged to worked perfectly, and the shift was uniform, so every screenshot still looked like the site. **It was found only because the desktop/tablet probe came back with 457 diffs where the previous run had 18** — the pattern §0 of the START HERE describes, doing exactly the job it is there for. ⚠️ **THE POINT: the freeze probe is not only a check on desktop.** It is the one thing in this project that reads the whole document rather than the part being worked on, and here it caught a fault on the very device that WAS in scope. ⛔ Run it after the last edit, not after the interesting one |
| D107 | 11 Aug | ⛔ **THE ROLL COULD NOT BE INTERRUPTED, WHICH READ AS "IT WON'T LET ME SWIPE QUICKLY". TWO SEPARATE CAUSES** | Client, on the rebuilt carousel: "when I try and swipe quickly on the reviews, it's not letting me swipe quickly", and note **"it only happens when I view it on my phone, not on the preview on the MacBook"**. **(1) A CSS TRANSITION CANNOT BE PICKED UP MID-FLIGHT.** The inline transform already holds the DESTINATION while the compositor is still easing toward it, so the instant a new drag turned the transition off, the belt **snapped forward to that destination** and only then began following the finger. One swipe looked right; two in a row jumped. ⭐ **The roll is now driven frame by frame from ONE number** — `soloAnim`, the drum's offset in steps from the current page — so a new gesture simply continues from wherever the eye last saw it. ⚠️ `.rev-live` is the switch between "the loop owns the cards" and "the stylesheet does"; the section's ride-in from off-screen still borrows CSS for one beat, and ⛔ **taking the cards over on the same call that seats them turned that entrance into a teleport** (measured: x −214 → 187 with no frame between). **(2) A DISTANCE-ONLY THRESHOLD REJECTS THE FASTEST GESTURE.** A flick leaves the glass after 25–40px, under the 48px throw, so the belt rolled back — the control ignored exactly the input a confident user reaches for. ⭐ **The release now carries its SPEED as well as its distance** (>0.45px/ms, with a 10px floor so a tap's drift cannot page). ⚠️ Both faults are invisible on a mouse, which is why the client only saw them on the phone |
| D106 | 11 Aug | ⭐ **THE PHONE'S NAV BAR IS ALREADY FORMED AT THE TOP OF THE PAGE, AND THE STICKY BAR LEADS WITH THE QUOTE** | Client: "the nav bar should already be formed, so already a gold line below it and everything, from the top. Not after you start scrolling — immediately it must already be there", and "the call button must be switched with the get a quote button." ⚠️ **On desktop the bar deliberately floats transparent over the hero and pours its glass in as you leave the top — that is FROZEN (D91) and is untouched.** On a phone it reads differently: the bar is ~66px of a small screen, the logo sits straight on a busy photograph, and a hairline arriving late looks like something still loading. ⛔ **The flare goes with it**: `.bar-flare` is the shine that rides the hairline out from its centre AS IT FORMS (D33), and a bar that is already formed has nothing to form — left armed it would flash across a finished line 40px into the first scroll. ⚠️ Both rules must sit AFTER the base ones; same specificity, so order decides |
| D105 | 11 Aug | ⭐ **THE PROJECT GALLERY ARRIVES EARLIER, RISES FROM BELOW LIKE A FIREWORK, WEARS A GOLD RIM, AND SITS HIGHER UP THE SCREEN. Mobile only** | Client: "for the project gallery section I want the cards to come in slightly earlier, and I also want them all to pop up from the bottom and then lay in a stack. So they all pop up directly up like it's a firework shooting up, and then they all stack there. Instead of coming in from the sides. And then they spread out to the way that it currently is. I just wanted to have a golden rim around it. And I also want the four cards that are showing to be slightly higher… then move the title, subtitle and button slightly higher in that section." **(1) EARLIER**: the gather window is `0.16 → 1.62` of a viewport on a phone against the desktop's `0.40 → 1.86`, so the whole arrival happens while the section is still coming up the screen rather than after it has landed. **(2) FROM BELOW**: ⛔ **A SIDE ENTRY IS THE ONE THING A PHONE HAS NO ROOM FOR** — each card used to start a full stage width out PLUS most of its own width, i.e. ~450px off a 375px screen, so most of every flight happened where nobody could see it. They now start a card-height below the stage floor and rise. ⚠️ **The lateral offset is small but NOT zero** (0.10 of the stage at most): eight cards on one perfectly vertical line overlap exactly and read as a single card rising. **(3) THE RIM** is the card's whole border in the site's own champagne, carried a little stronger — ⛔ **NOT a top-edge seam, which §2 rule 10 forbids and which has been built by mistake twice.** **(4) HIGHER**: the walls' phone shift goes −0.16 → −0.22 of the stage and the copy block goes 4% → 12% off the floor of the pin. ⚠️ **Those two move TOGETHER** — shift the cards without the copy and they land on the words. ⭐ Also: `--galMode` now declares the phone in the STYLESHEET and the script reads it, replacing three separate `M.w<720` tests that disagreed with the 720px query at exactly 720px (D93's lesson, found sitting in the file) |
| D104 | 11 Aug | ⛔ **iOS DOUBLE-TAP ZOOM IS OFF ON EVERY CONTROL, PHONE ONLY** | Client: "if I tap the buttons too quickly it automatically zooms in my phone, because double tap on iPhone means zoom in. So we have to be careful of that." ⚠️ **This is not a mis-tap to design around**: zoom-on-double-tap is the DEFAULT on every element that has not opted out, so paging a carousel or walking a stepper at any speed fires it. `touch-action:manipulation` opts the control out and leaves everything else — pinch zoom included — exactly as it was, so the page is still zoomable for anyone who needs it. ⭐ **Deliberately a blanket rule** over `a, button, [role=button], label, summary, input, select, textarea` rather than a list of today's buttons, which would not cover the next one somebody adds. ⚠️ Where an element also needs the page not to pan (the review stage, the helix), that `none` is on an ancestor and still wins — the effective value is the INTERSECTION down the chain, not the nearest declaration |
| D103 | 11 Aug | ⛔ **THE HELIX NO LONGER DRAGS THE PAGE WITH IT. A diagonal swipe turns the spiral and nothing else** | Client: "the helix section is also laggy or completely glitched. As I'm swiping it diagonally down or diagonally up, the screen is also moving diagonally down and diagonally up. So we need to make it if they're touching the cards, the screen basically stays still unless they're swiping directly up or directly down on that section." ⛔ **He is describing a real fault, not a preference**: the helix's touch handlers were bound `{passive:true}` with NO `touch-action` on the stage, so they could never stop a scroll — the browser panned on the gesture's vertical component while the script turned the spiral on its horizontal one, at the same time. ⭐ Fixed by `touch-action:none` on the phone stage and the shared arbiter in D102. ⛔ **THE DESKTOP PATH IS UNTOUCHED AND STILL ITS OWN CODE** — the old mouse and touch handlers simply stand aside when `--hxMode` says phone, because desktop is frozen (D91) and a rewrite of a frozen surface's input is still a change to it |
| D102 | 11 Aug | ⛔ **THE REVIEW SWIPE DID NOT WORK ON THE CLIENT'S iPHONE — THIRD BUILD, AND THE FIRST ONE THAT FIXES THE RIGHT THING** | Client: "the review section is completely glitched out, if I try and swipe on it, it's not working." ⛔ **D93 shipped touch-only and failed on his MacBook; D94 bolted a mouse path beside it; and the touch path then failed on his phone. Three builds, one root cause: the gesture was arbitrated in three places, and on a phone the BROWSER was arbitrating first.** ⭐ **`touch-action:pan-y` HANDS THE FIRST DECISION TO THE BROWSER**, which takes any drag with a real vertical component as a page scroll before a single handler runs — and a thumb swipe is never perfectly horizontal. Nothing in the handler was reachable. ⭐ **So the page is taken out of the argument**: `touch-action:none`, ONE arbiter (`attachSwipe`) shared with the helix, axis decided once at 5px, ties going to the carousel. ⛔ **THE PRICE, PAID DELIBERATELY**: `none` also kills the native vertical scroll over that element, so a near-vertical drag is scrolled BY HAND, 1:1, with a decaying glide on release — that is the client's "unless they're swiping directly up or directly down". ⚠️ **`html` carries `scroll-behavior:smooth` and it poisons a hand-rolled scroll** — every `scrollBy` animates toward its target and sixty a second each restart from where the last got to; measured, 120px of finger moved the page 45. An inline `auto` is set for as long as the gesture owns the page. ⚠️ Bound to the STAGE, not the deck: the deck is only the centre card's box, and a thumb landing on a peeking neighbour was landing outside the one element that listened |
| D101 | 11 Aug | ⭐ **THE REVIEWS ROLL LIKE A DRUM NOW. ⛔ The old motion was not missing, it was FRONT-LOADED** | Client: "when I swipe or click the buttons there's barely any animation, it just flicks over to the next one, it's an instant switch between them. I almost want it to feel like a rotating wheel — imagine a roll of duct tape laying down flat, and you're just rolling the reviews in, and the other one rolls out." ⭐ **THE DIAGNOSIS IS THE KEEPER.** The page change already ran 0.95s — but on `--ease`, `cubic-bezier(0.16,1,0.3,1)`, an expo-out that covers ~90% of the distance in the first quarter of its time and crawls the rest. Measured mid-flight, the card was already home. ⚠️ **A longer duration on that curve changes nothing you can see; the CURVE is the fault.** Now 0.72s on a curve with real acceleration at both ends. ⭐ The reviews sit on the rim of a cylinder with a VERTICAL axis — the client's roll of tape — as `translateZ(−R) rotateY(θ) translateZ(R)`, in that order, which puts the drum's axis at the screen plane so the front card stays at its true size and only the ones turning away recede. ⭐ **R IS SOLVED FROM THE PEEK, AND FROM ITS INNER EDGE, NOT ITS CENTRE**: ⛔ the first version held the neighbour's centre where D93 put it and the peek collapsed from 44px of visible card to 4 — a card turned 32° is FORESHORTENED to cos(32°) of its width, so holding the centre pushes the inner edge 70px further out. ⭐ **Every card is on the rim; there is no parked state left.** The old build teleported anything more than one page away with `transition:none`, which is why the outgoing neighbour VANISHED instead of rolling out. ⚠️ `.rev.entering` set `transition:transform` alone, silently dropping the fade the base rule carried — opacity is back in the list |
| D100 | 11 Aug | ⭐ **THE HERO'S TWO BUTTONS ARE AS WIDE AS THE ICON ROW, EDGE TO EDGE** | Client: "make the get your free quote and give us a call slightly thinner, not as wide. I want to basically match the size of the side of the icons." They were `width:100%`, reaching the screen's own margins while the composition above them stopped well short, so the pair read as two bars rather than as part of the same centred stack. ⭐ **THE WIDTH IS DERIVED, NOT TYPED**: the three reasons are equal thirds and each icon is centred in its own third, so first-icon-left to last-icon-right is `(2/3)·row + (2/3)·gap + icon` — 256px on a 375px handset, measured against icons at 59 and 316. ⚠️ Both terms are CSS variables shared with the icon row, which is the point: type 257px instead and the buttons stop lining up the moment the gap clamp moves at another width. ⚠️ **The type size had to come in with the width and had to be vw-led** — the label is `nowrap` inside an `overflow:hidden` button, so a label that does not fit is not a wrap, it is a silently clipped word, and the button is 246px at 360 and 219 at 320 |
| D99 | 11 Aug | ⭐ **THE PHONE GETS A STICKY BOTTOM ACTION BAR: CALL, EMAIL, GET A QUOTE** | Client: "mobile should have a nav bar and a sticky bottom nav bar. The top nav bar will be visible from the start on mobile, then as you scroll past the two CTAs in the hero section the sticky bottom nav will pop up with the email and phone and get an estimate or whatever buttons are necessary." ⚠️ The top bar already behaves that way and was left alone. ⭐ **THE TRIGGER IS THE CTA ROW'S OWN RECT, NOT A SCROLL NUMBER** — `scrollY > 600` would be a second description of where the hero's buttons are and would be wrong the moment the title wraps to another line on another handset. It rises when the row passes behind the fixed header. ⛔ `display:none` above 720px, so desktop and tablet render identically — proven by probe, not asserted. ⚠️ **The top edge is the BONE hairline, not gold**: §2 rule 10 forbids a bright or gold line across the top of a card or section and this is the top edge of a bar. ⚠️ `visibility:hidden` while parked, not just a transform, or three links sit invisibly in the tab order. ⚠️ z-index 39 — under the burger menu at 40 so the sheet covers it, far under the estimator modal and the project overlay. ⚠️ `body` takes 66px of bottom padding or the footer's last line lives under the bar. ⭐ Three actions, all already on the page (the hero's call button, the contact block's address, the quote CTA) — no new promise and no new number. ⚠️ **"Get an estimate" was read as the quote CTA**, not the estimator tool; say if the estimator is what he meant |
| D98 | 11 Aug | ⛔ **THE FIFTH HELIX CARD WAS INVISIBLE, AND THE BEVEL'S CORNERS WERE TOO LONG. Both fixed, and the mask lesson behind the first one is the keeper** | Client: "I can only see the one at the bottom, the back of the card, but I cannot see the top one. So now there's four on the screen when there should be five", plus "in the hero I want that flat bottom part to be closer to the sides, so there's only a little bit of the angle that's visible." ⛔ **THE FIFTH CARD FAILED FOR THREE REASONS AT ONCE, WHICH IS WHY ONE TWEAK WOULD NOT HAVE FOUND IT.** **(1)** The stage overlapped the copy by 118px, so the top ghost sat ENTIRELY inside the band the mask holds at 0.10 for the text's sake — 70px now, and only ~15px of the card tucks behind the copy. **(2)** ⭐ **THE MASK'S TOP STOPS WERE PERCENTAGES, AND THEY HAD TO BE PIXELS.** A percentage scales with the STAGE; the thing this stop must line up with is the COPY. The copy's bottom sits a fixed ~46px below the stage top (the −70px margin less the head's own ~21px margin) and **that distance does not move when the copy rewraps at another width**, so the stops are `0.10 → 46px, solid by 64px`. As percentages the ramp ran on past the text and the only part of the ghost a customer can see was still climbing out of the fade. **(3)** The ghost opacity was 0.22 and the mask multiplied it to nothing; 0.32 now, which behind the copy still lands at 0.032. ⭐ **Measured after: top ghost 32px of exposed sliver at 0.312 effective brightness, bottom ghost 43px at 0.285 — balanced, where before the top one was invisible and the bottom one was not.** ⚠️ Room for the fifth slot came from the CARDS, not from the section: card width 0.76 → 0.70 of the stage (its height is 0.66 of its width, so trimming width is what buys vertical room) and STEP 0.20 → 0.175. ⭐ **Sanity check for anyone retuning this: the spiral spans `4·STEP + --hxH`. Keep that within about a card's height of the stage or a card the client asked to SEE stops being visible.** The section is 701px, up 72px from three cards to five. ⭐ **THE BEVEL'S CUTS ARE SHORT NOW**: `--bevX` 64 → 38, `--bevY` 37 → 22, so the flat run is **299px of a 375px screen, 80%**, against 247px before. ⚠️ **22/38 = 0.579 and tan(30°) = 0.577** — the ratio is the angle, and the hairline's `30deg` gradient only lies on the cut while it holds. Measured after: 30.07°. ⛔ **Desktop 1440×900 and tablet 768×1024 probed identical** — hero height, clip, border, cue span, inner padding, stage, mask, helix margin, card width and height, the grid's columns and rect, and all six card positions, opacities, pointer-events and ghost flags. Error probe clean, and no ghost is left clickable. |
| D97 | 11 Aug | ⭐ **FIVE CARDS ON THE MOBILE HELIX WITH TWO INERT GHOSTS, THE SPIRAL RUNNING OFF BOTH EDGES, AND THE HERO'S BEVEL DOWN TO 30° WITH ITS EDGE RAISED** | Four client changes in one round, all mobile. **(1) THE GHOST PAIR.** "I still want to see one more on the top and one more at the bottom, but very faded, and you can't interact with that block. You can interact with the centre block, the block above that, and the block below that", and then: **"that one more on the top goes behind the text, but must be so faded that the text is not obstructed at all and it's still easy to read."** ⭐ **The stage now reaches UP under the intro on a −118px margin**, which is what buys the fifth card its room without the section growing — measured, the section went 649px → **629px while gaining two cards**. ⛔ **The copy had to be lifted above the helix**, which comes after it in the DOM and would otherwise paint over the words. ⭐ **THE MASK'S TOP STOP IS 0.10 ALPHA, NOT 0** — a mask reads alpha, so an intermediate stop is a partial reveal: measured, the ghost renders at **0.022 behind the first line of copy and 0.08 behind the last**, present as depth and unable to compete with body text. ⚠️ Below the copy the mask opens to solid so the same card resolves as it descends. ⛔ **INTERACTIVITY IS DECIDED BY POSITION, NOT OPACITY**: the existing `o<0.1` test would have left the ghosts clickable at 0.22, and a card you can tap but cannot see is the worst of both. ⚠️ **And pointer-events was not enough on its own** — a dispatched click bypasses hit-testing, so `.hx-ghost` is set by render() and the click listener refuses it outright. Proven: a click on a ghost does not move the spiral; a click on the card one step out does. ⚠️ The phone fade is a RAMP, not a step, because `d` is fractional throughout a spin and a threshold would make a card blink as it crossed. **(2) OFF THE EDGES.** "I wanted it to go all the way to the side of the screen, so it goes out of the screen essentially." ⛔ **0.62 of the stage was too far and the reason is worth knowing: sin is symmetric about 90°, so the card ONE step out and the ghost TWO steps out sit at the SAME sideways offset** — push them wide and both collapse into one 77px sliver, losing the tap target the client explicitly asked to keep. **0.56 crosses the edge and still leaves 94px of card.** **(3) THE SCROLL CUE LOSES ITS WORD** and the hero's bottom edge comes up with it: "I don't want it to say scroll, and that means we can also move that divider or bottom border higher up." ⚠️ **min-height ALONE would have done nothing** — the content is taller than 90vh, so the bottom padding had to come down with it. Measured: hero **812 → 755px**, so the bevel and 57px of the reviews are both on the first screen. **(4) THE BEVEL IS 30°, NOT 45°.** The RISE is kept and the RUN lengthened, so it reads as a shallower, longer cut rather than a smaller one: `--bevX:64px`, `--bevY:37px`, **tan⁻¹(37/64) = 30.03°**, flat middle 247px of 375. ⛔ **THE HAIRLINE'S GRADIENT ANGLE HAD TO CHANGE WITH IT, AND THIS IS THE TRAP**: `to top right` traced the cut only because the old box was SQUARE. A gradient's bands run perpendicular to its gradient line, so lying along a cut of (run, rise) requires `tan(A)=rise/run` — **A is exactly the bevel's angle from the horizontal**, 30deg and −30deg. Keep the corner keyword in a non-square box and the hairline drifts off the cut it is supposed to trace. ⭐ **Verified**: five cards at 375 with the ±1 pair interactive at 94px visible and the ±2 pair inert at 0.22; next, prev, mouse drag, touch swipe and trackpad wheel all turn it; no horizontal scroll; error probe clean. ⛔ **Desktop 1440×900 and tablet 768×1024 probed identical** — hero height, min-height, clip, border, cue span, cue rect, inner padding, stage, mask, helix margin, the grid's columns and rect, and all six card positions, opacities, pointer-events and ghost flags. |
| D96 | 11 Aug | ⭐ **THE SERVICES HELIX NOW RUNS ON MOBILE, AND THE SECTION IS 2,290px SHORTER FOR IT** | Client: "on mobile for the surfaces for every space section, I still want the same helix like we do on desktop, but we need to optimise it to work for the mobile version. Without the user having to scroll too far down — I want the helix to maybe fade out behind the subtitle text, or we make the subtitle half the text and create the helix in the best possible way for mobile." ⭐ **BOTH of his suggestions were taken, and the result is far SHORTER, not longer**: the helix replaces the six stacked flip cards, which were the tallest block on the phone. **Measured at 375×812: the section was 2,939px and is now 649px.** ⛔ **THE CARD CSS WAS LIFTED, NOT COPIED.** Everything from `.helix-stage` to `.helix-ui` used to live inside `@media(min-width:1121px)`; it now sits in a shared `@media(min-width:1121px),(max-width:720px)` block. **A second copy of it would have been this project's signature bug for the fifth time** (D51, D59, D68, D78, D93). ⚠️ It was moved to sit immediately AFTER the desktop block, not before, so its order against anything else touching those selectors is unchanged — desktop probed identical. ⭐ **`--hxMode` is set by the media query and READ by the script**, so the breakpoint is declared once, in the CSS; a `matchMedia` test in the helix would have been a second opinion about what a phone is. ⛔ **THE DESKTOP FLOORS ARE THE TRAP**: card 300px, R 210px, STEP 96px are all wider than a phone can give, so the desktop branch would hand a 335px stage a 300px card and a 210px radius and throw the spiral off both edges. The phone branch is card 0.76·W (255px), R 0.47·W, STEP 0.30·H. ⭐ **STEP IS THE EDIT, NOT JUST THE RISE.** At 0.22 the ±2 cards still sat inside the frame and five overlapping cards on a 375px screen read as clutter; at 0.30 that pair climbs clear of the stage and the mask takes it, so a phone shows **three** cards — the one you are reading and a hint either side. ⚠️ **The section does not grow for it**: the stage height is fixed and the spiral simply runs out of it, which is the client's "fade out". ⭐ **The mask goes on the STAGE, never on a card** — a mask, filter or opacity on the card shell flattens its 3D and the back face paints as a mirrored front. Verified after: `transform-style` on the shell is still `preserve-3d`. ⚠️ **The limestone REVERSE is effectively not seen on a phone**, because only cards two steps out have turned past 90° and those are the ones the mask removes. A deliberate trade for legibility; say so if the client asks. ⚠️ **The card's furniture had to come down with the card**: at the shared sizes the name wrapped to two lines and "View this service" was 197px of button in 176px of room. Now 19px name, 10px label at 0.18em — both measured to one line. ⚠️ **Drag distance too**: the desktop floor of 180px per card is half a phone screen, so a full swipe would not reach one card. ⭐ **The intro is HALVED on the phone** — two spans in the markup, exactly one displayed, so desktop keeps its paragraph unchanged to the character. Both say the same true things: templating and fitting are TopCat's, the cutting is the workshops' (§2 rule 1). ⛔ **TABLET (721–1120px) KEEPS THE FLIP-CARD GRID** and is deliberately not in the shared query, because tablet is frozen until the client says otherwise (D91). Widen it to `(min-width:721px)` when the tablet round comes. ⭐ **Verified**: next, prev, mouse drag, touch swipe and trackpad wheel all turn the spiral; no horizontal scroll; error probe clean; **desktop 1440×900 identical including the subtitle rect, the stage, and all six card positions, sizes and opacities**; tablet 768×1024 identical including the grid columns and card geometry. |
| D95 | 11 Aug | ⭐ **THE MOBILE REVIEW SPACING IS REBUILT ON THE CARD'S REAL HEIGHT. The gap was mostly INVISIBLE SLACK, not a spacing choice** | Client: "on mobile the spacing between the subtitle and the buttons is too big. Move the buttons slightly up close to the card, and then move the card closer up to the subtitle. Optimise the spacing." ⛔ **THE PART WORTH UNDERSTANDING**: the stage was sized from `--revCardH`, which is the deck's UNSCALED height — but the card is transform-scaled to ~0.84 inside it, so `(1-scale)/2` of that height was dead space above the card and the same again below. **27px a side on a 397px handset, named by no rule at all.** Of the 64px between the subtitle and the card, 27 was slack, 22 was the section head's margin and 15 was stage padding. ⚠️ **Tuning the numbers that did exist would only ever have chased it** — that is why this is a rebuild rather than two smaller values. ⭐ `gridLayout()` now writes the measured scale out as **`--revScale`**, so the stage height is `card height × scale + air + pager band` and every number in the rule means what it says. ⛔ **Solo must therefore SKIP the stage-height cap on the scale** (`GS=Math.min(GS,(stageH*0.94)/ch,1)`) — the stage is derived from the scale, so capping the scale against the stage is circular. It is also unnecessary: a card cannot overflow a stage measured from it. ⚠️ **The deck box is still the unscaled height and so is taller than the stage's content box.** It overflows a few px each way, which is invisible — it paints nothing — and keeps the scaled card centred. ⛔ Do not "fix" that by shrinking the deck; the card is `inset:0` within it. ⭐ **Measured, 375×812 — subtitle→card 64 → 30, card→buttons 54 → 20, buttons→strap 18 unchanged; the section is 62px shorter and the card, the 40px peeks and the 64px button spacing are all untouched.** ⚠️ **The pager band is 50px and the button is 46px of it, so the card-to-button gap is `--revAir/2 + (band − 46)`.** The strap line sits a fixed ~19px under the stage, so a band that leaves the buttons further from the card than that makes them read as the strap's controls rather than the card's. ⛔ **HALF THE AIR HAD TO BE ADDED TO THE OPEN-CARD PAGER DROP TOO, and it was missed first time**: an open card put the buttons **4px** below it where a closed one is 20, because the drop counted the band but not the half-air the centring puts under the card. It reads `--revAir` from the stylesheet rather than hard-coding it, so the two cannot drift when the spacing is next tuned. Open and closed now both measure 20px. ⛔ **Desktop 1440×900 and tablet 768×1024 re-probed: head rect, head margin, stage, deck, pager, all 16 cards and the shared expand path identical.** ⚠️ **Two measurement traps cost time here and will again**: an open card's height ANIMATES over .45s, so a probe that reads too early reports the collapsed height and a nonsense pager gap; and **the card entrance depends on SCROLL HISTORY, not on scroll position** — a file loaded fresh shows every card parked where one already scrolled shows them seated. Give both files the same history before calling a difference a regression. |
| D94 | 11 Aug | ⛔ **THE SWIPE D93 SHIPPED ONLY WORKED ON A TOUCHSCREEN, SO IT DID NOT WORK FOR THE CLIENT AT ALL. Plus: an open review now shows the WHOLE review in one go** | Client, testing it: "I am trying to swipe on the review card now, but for some reason it's not letting me, whether I swipe with my MacBook with two fingers or whether I click and hold and swipe. It's not working." ⛔ **He is right and the cause is embarrassing in hindsight**: the handler was `touchstart`/`touchmove`/`touchend` ONLY. A laptop narrowed to a phone width has no touch hardware, fires no touch events, and there was nothing to catch a drag. ⭐ **THE LESSON, AND IT GENERALISES TO THE WHOLE MOBILE ROUND: a phone layout is looked at on a desktop browser far more often than on a phone during a build — including by the client. A phone gesture that only answers to touch events is untested and unusable for everyone reviewing it.** ⚠️ It passed its own verification because the tests SYNTHESISED touch events; they proved the handler worked, not that a person could reach it. ⭐ **Two input paths added beside the touch one.** **(1) Mouse drag**, via pointer events filtered to `pointerType==='mouse'` so touch keeps its own handlers. ⚠️ move and up bind to the WINDOW, not the deck — a drag that leaves the deck still has to finish, or the belt sticks mid-gesture with the button already up. ⚠️ `user-select:none` while dragging only, or dragging across a card of text selects the text and the belt appears frozen. **(2) A two-finger trackpad swipe, which is a `wheel` event with deltaX and fires nothing either drag handler listens for** — this is the gesture a Mac user reaches for first. ⚠️ Acted on only when `|deltaX| > |deltaY|`, so a two-finger scroll DOWN the page still scrolls the page; almost no trackpad scroll is perfectly vertical. ⚠️ **Momentum keeps firing wheel events for about a second after the fingers lift**, which paged several times from one flick — a lock holds until the stream has been quiet for 140ms, so a flick turns exactly one review. ⭐ **THE OPEN CARD NOW SHOWS THE WHOLE REVIEW, NO INNER SCROLLBAR.** Client: "if someone taps on the review they can read the whole review… everything should be visible in one go", and tapping again closes it. `capR` fits an open card to ONE SCREEN, which is right on desktop and wrong on a phone: it left a 925-character review scrolling inside the card, so a customer had a scrollbar inside a scrolling page and no sense of how much was left. On a phone the card takes its full content height and the PAGE scrolls — the "dragging to read" he described. ⚠️ `overflow` had to be set on BOTH axes: `visible` on one axis beside `hidden` on the other computes back to `auto` and the scrollbar returns. ⭐ **Measured after, at 375 and 430**: mouse drag left/right, touch swipe, trackpad flick both ways, both buttons, neighbour tap, tap-to-open and tap-to-close all driven and confirmed; a vertical drag and a vertical wheel are left uncancelled so the page still scrolls; a short drag settles back and its trailing click does NOT also expand; the 925-character review renders complete with no inner scroll and nothing overlapping the pager or the strap line. ⛔ **Desktop 1440×900 and tablet 768×1024 re-probed against `index.html.pre-mobile-reviews.bak` — stage, deck, pager, all 16 cards AND the shared expand path (343→564, 227px stage margin, quote still scrolling inside as designed) identical.** Error probe clean after driving every control. |
| D93 | 11 Aug | ⭐ **THE MOBILE REVIEWS ARE A SWIPEABLE CAROUSEL: NEIGHBOURS PEEKING EITHER SIDE, PAGER BELOW** | Client: "move the two buttons below, spaced out next to each other well. And on the left and the right of the review card I would like to see the other cards, so that the user can swipe it to the left or the right and then go to the other card… make the main center review card slightly smaller, and then show the other two on the side of it, so it's obvious that there's a review on either side that they can swipe to or click the buttons left or right below." ⛔ **MOBILE ONLY, and desktop + tablet were probed against the pre-change file and came back identical** — see the measurements below. ⭐ **THE SCOPE IS A CLASS, `.rev-solo`, NOT A MEDIA QUERY, AND THAT IS THE PART TO KEEP.** It is set by `gridLayout()` from `perPage()===1` — the same test the layout maths uses — so the stylesheet can never disagree with the JS about what a phone is. ⚠️ The two ALREADY disagreed: the old `@media(max-width:720px)` arrow rule fires at exactly 720px where `perPage()` still returns 3. **A second source of truth for the same fact is this project's most repeated bug** (D51, D59, D68, D78) and a media query here would have been the fifth. ⭐ **The card got SMALLER on purpose**: `availW` was `innerWidth-96`, reserving 48px a side for arrows sitting in the gutters. The arrows moved below, and rather than handing that width back to the card it goes to the neighbours — 72% of the screen, **270px of card on a 375px handset against 279px before**, with each neighbour showing exactly **40px**. ⭐ **The neighbours are the whole affordance**, not decoration: one centred card with two arrows gives a customer no reason to believe there is anything else to read, which is why he asked. They sit at 0.86 scale and 0.5 opacity, and **tapping one pages to it**. ⭐ **`soloDist()` is why the wrap is free**: each card's SIGNED, shortest-way-round distance from the current page decides its slot, so a page turn is "everything moves one slot" and the last review's next is the first. ⛔ **The park-and-recycle dance `goPage()` does for the 3-up wall is not needed and must not be copied here** — the neighbours are already on screen. ⭐ **The swipe tracks the finger** and settles or turns at 48px. ⚠️ **The axis is decided ONCE, on the first real movement, and held** — re-deciding per frame makes a diagonal drag flicker between scrolling the page and moving the belt. Vertical drags are left alone and are NOT preventDefaulted, so the page still scrolls; measured. ⚠️ **A swipe ends in a click on most engines**, so exactly one click is swallowed after a drag or every page turn would also expand whichever card the finger landed on. ⭐ **The pager RIDES DOWN with an open card.** First attempt capped the card at the pager's top instead, and that was wrong: it left a long review scrolling inside ~290px on an 812px phone. Now the band drops with it — measured open: card 484px tall, buttons 12px under it, strap line 24px under them, nothing overlapping. ⚠️ **The band height was measured, not picked**: the strap line sits a fixed ~29px under the stage, so `--revPagerH` only moves the card-to-button gap. At 84px the buttons were 77px below the card and 29px above the strap and read as part of the strap line; at 58px they sit 51px under the card and 18px above the strap. ⭐ **Measured after, at 375×812**: centre card 270px centred on 187.5, both peeks exactly 40px, buttons 64px apart centred on 188, no horizontal scroll, and every one of prev / next / swipe-left / swipe-right / neighbour-tap / expand / collapse driven and confirmed. ⛔ **Desktop 1440×900 and tablet 768×1024 probed against `index.html.pre-mobile-reviews.bak` served side by side: section, stage, deck, pager and ALL 16 card positions, widths, opacities and z-indexes identical**, and the desktop cartwheel pager still shifts 0,1,2 → 1,2,3. ⚠️ **The live console showed `revSolo is not defined` and it was STALE** — the dev server reloaded between the edit that added the call and the edit that added the function. An instrumented `_debug.html` with an error probe in `<head>` returned **zero** errors on a clean load and after driving every control. §10 warns about exactly this; trust the probe, not the replay. D91, §2 rule 15 |
| D92 | 11 Aug | ⭐ **THE MOBILE HERO IS CENTRED, AND ITS BOTTOM EDGE IS A MATCHED BEVEL. First change of the mobile round** | Client: "for the mobile hero section, most of the things are going to be centered… the title, the subtitle, and then the three icons are all going to be center with the icon on top and the text below, and they're all three going to be in line", and "the divider between the hero and the reviews section is currently just a curved line… change that to a matched bevel design, mostly flat in the centre and then just the corners cut in, reaching the border… the middle will be longer, and then the forty five degree angle cut on the two sides." ⛔ **ALL OF IT IS INSIDE `@media(max-width:720px)` — desktop and tablet are byte-identical, proven rather than assumed** (see below). ⭐ **The three reasons go back to a ROW of three**, icon over label, each centred in an equal third — this deliberately overrides the `max-width:760px` rule that stacks them one per row, which still governs the untouched 721–760px band. ⚠️ **Icons are TOP-aligned, not centred on the tallest label**: the three labels wrap to different line counts, and centring them vertically puts the three icons at three different heights, which is the one thing "all three in line" rules out. Measured at 375px: three 106px columns, all three icons at y=341 and all three labels at y=377. ⚠️ **THE TRUST LINE LOSES ITS GOLD LEFT RULE ON MOBILE, and the client should be told**: `.hero-sub::before` is a LEFT-EDGE mark (§4b, his own "stand out in a different way" brief) and against centred text it strands itself at the far left of a full-width block. It stands down at ≤720px only. ⛔ **Do not replace it with a short gold rule above the copy — that is the top-edge hairline §2 rule 10 forbids and has rejected twice.** ⭐ **THE BEVEL, and the two things that make it work.** It was `border-bottom-left/right-radius:50% 30px`, an ellipse across the whole width. Now `--bev:34px` is BOTH the horizontal run and the vertical rise of each cut, which is what makes the angle exactly 45° — change the one number and it stays true; change one axis and it stops being a bevel. On a 375px handset the flat middle is 307px against two 34px cuts. **(1)** The clip is on **`.hero-bg`**, not on `.hero` — `.hero-shade` lives inside `.hero-bg` so one clip takes the photograph and its shading together, and ⛔ putting it on `.hero` would have clipped the hairline pseudo-element in half, because a pseudo-element is clipped by its own parent's clip-path. **(2)** The hairline is **three background gradients, not an SVG**: each diagonal is drawn inside its own `--bev` SQUARE, where `to top right` / `to top left` is exactly 45° at every width. ⛔ An SVG stretched with `preserveAspectRatio="none"` is only 45° at one width, and a stroke scaled on one axis stops being 1px. ⭐ **Measured after**: everything centres on 187.5 at 375px (title, both sub lines, CTAs, chips — the exact viewport centre); no horizontal scroll at 320 / 375 / 390 / 430; the hero still fits one screen at 430×932; and the facts row got **45px SHORTER** than the stacked version it replaces. ⛔ **Desktop and tablet proven unchanged, not assumed**: the pre-change file was served side by side and probed at **1440×900 and 768×1024** — every rect of the hero, its title, sub, facts, CTAs, chips, cue and the CTA card, plus the border, radius, clip-path, flex-direction and text-align, came back **identical**. ⚠️ The `.hl` line-mask's padding went from `.08em` on the right only to symmetric, or the centred title sits half that off-centre. D91, §2 rule 15 |
| D91 | 11 Aug | ⛔ **DESKTOP IS FROZEN. WORK MOVES TO MOBILE, THEN TABLET, AND ONLY ONE AT A TIME** | Client, closing the desktop design round: "after this, desktop will stay exactly as it is in its current design, until I decide to change it again… then you and I are going to work on the mobile and tablet sections. **When I mention changes, I'm only referring to mobile**, and then afterwards I will say we're going to work on tablet. So when I say let's do mobile, then we only work on mobile. **Everything else stays exactly as it is on the other devices.**" ⭐ **This is a SCOPE rule, and it is the one most likely to be broken by accident**, because the site is a single self-contained `index.html` with **inline CSS**: nearly every rule is unscoped and therefore applies to every width. ⛔ **So a mobile change must be made INSIDE a width-scoped media query, never by editing a base rule** — editing the base rule to "fix mobile" silently changes desktop, which is now out of bounds. ⚠️ The existing breakpoints on the landing page are `max-width:900px` and `max-width:560px` with a few others; **check which one governs before writing a new one**, and prefer `max-width` blocks so desktop keeps the untouched base. ⚠️ **Tablet is NOT in scope while mobile is in scope** — a `max-width:900px` block catches tablet widths too, so a mobile-only change usually belongs under a narrower ceiling. ⭐ **Desktop is unfrozen only by the client saying so.** ⚠️ Design only: the enquiry backend, the photography and the licensing work (§7) are unaffected and still open. |
| D90 | 11 Aug | ⭐ **THE FINAL CTA CARD IS A PLAIN GREY. The last desktop design change** | Client: "I don't like that there's such a detailed background in the one visit, one price, one team section. **Just make it a plain background, that grey that we have.**" ⚠️ The card was carrying **`--marbleBG` at `cover`** — the page floor's own photographed Portoro slab, but at full strength rather than whispered in the way the nav glass and the modal take it (§4l), so the veining and the crystalline grain ran straight through the six form fields and the drop zone. ⭐ **It is now `--ink-2` (#15151A), the site's standing panel grey** — the same background the FAQ plate, the gallery tiles, the About collage tiles and the estimator panels already use, so the card reads as one of the site's panels instead of as a second piece of stone competing with the floor it sits on. ⛔ **Not simply the image removed**: the `background-color` underneath was `#101015`, which is near-black rather than grey, so dropping the image alone would have given him a black card. ⚠️ **The form fields are a LIFT off this background** (`rgba(255,255,255,0.045)` plus a `--hair-soft` hairline) — if the grey is ever changed, check the fields still separate from it. ⚠️ Nothing else moved: measured at 1366×610 the section is **499px**, byte-identical to the figure recorded in §0 for the same size, and there is no horizontal scroll. **The card's gold border, the box shadow and every measure are untouched.** ⭐ **Desktop design closes here** — see D91. |
| D89 | 11 Aug | ⭐ **THE MIRROR RANGE IS IN — ALL SIX, UNDER THEIR REAL NAMES. The range is 132.** ⛔ **This CORRECTS D88, which reached the wrong conclusion** | Client: "mirror grey, mirror black and mirror white… those are the most popular slabs", then, on finding the site returned nothing he recognised: "when I go to all stones and I type in mirror, nothing shows up, because you got the wrong name. Now go get exactly what I asked for." ⛔ **He was right and D88 was wrong.** Bloom DO publish these, as six ordinary product pages at `/tiles-1/<colour>-mirror`: **White, Cream, Grey, Brown, Blue and Black Mirror**, all live now. ⚠️ **HOW THE FIRST PASS MISSED THEM, WHICH IS THE LESSON**: it parsed the product JSON embedded in Bloom's `/quartz` listing, found a category called **"Mirror Chip"** holding their *Sparkle* products, and concluded the Mirror names did not exist anywhere. It never used **the supplier's own search box** — `bloomstoneslondon.com/search?q=mirror` returns all six in one request. ⭐ **Search the supplier's own search before concluding a product does not exist. A category that merely sounds right is not the product.** ⛔ The three Sparkle stones shipped in D88 have been withdrawn (pages moved to `stones/.removed-2026-08-11/`, tiles and records removed) — they were a substitution the client never asked for. ⚠️ **The name is the supplier's, word order and all**: Bloom write "Grey Mirror", not "Mirror Grey", and check 9 does not normalise word order. Customer phrasing is handled by search, not by renaming the stone — per-word AND means "mirror grey" and "grey mirror" both land on it. ⭐ **The mirror→sparkle alias added to `STONE_WORDS` in D88 has been REMOVED**: it papered over the wrong names instead of fixing them, and the real names need no alias. **Measured live: "mirror" returns 6 on the collection page and 6 in the wheel; "mirror black", "black mirror", "mirror grey", "mirror white" each return exactly one.** ⭐ Photography is Bloom's own, **five native 1600x1600 flat scans** needing no crop at all, White Mirror resampled 960 → 1600. Tones measured off the tiles, not guessed: White 234, Cream 159, Grey 132 light; Brown 35, Blue 19, Black 14 dark. All six clear check 1 (nearest existing tile 20-40, fails at ≤8). ⚠️ Quartz is now 67 with 16 dark, and the opening nine are still all light (D86 holds). ⚠️ Bloom licensing still **open**, as for Caesarstone and CRL. |
| D88 | 11 Aug | ⛔ **WRONG, CORRECTED BY D89 THE SAME DAY. Kept because the error is the lesson.** It concluded that no supplier published "Mirror Black/White/Grey" and shipped Bloom's *Sparkle* range under a search alias instead. The conclusion was reached from one listing page's embedded JSON and never checked against the supplier's own search box, which returns all six immediately. ⚠️ Everything below about the open-web trap still stands; only the conclusion about Bloom was wrong. ~~THE THREE "MIRROR" BEST SELLERS ARE IN THE WHEEL, UNDER THE SUPPLIER'S NAMES, WITH "MIRROR" MADE SEARCHABLE~~ | Client, out of a meeting: "three stones we have to add to quartz as they are the best sellers… mirror grey, mirror black, mirror white… any means necessary and make sure the image is high quality." ⛔ **NO SUPPLIER ON HIS OWN LIST PUBLISHES A STONE UNDER THOSE NAMES — the search is finished, do not repeat it.** All 1,785 harvested images and every harvest JSON (0), Nile, Next, Caesarstone, CRL, Noble Stone (0), AKG (the word appears only in WordPress CSS gradient names), Cosentino (307s), Fugen (403, blocks us), **and topcatworktops.co.uk itself including sitemap, portfolio and blog (0)**. ⭐ **"Mirror" is a TRADE DESCRIPTION, not a product name**: a dozen unrelated UK merchants sell "Black Mirror Quartz" and they are not the same slab as each other, which is D82's exact trap. ⭐ **Bloom Stones London — on the client's list, `ok=True`, robots.txt allows — sell the family under a category they literally call "Mirror Chip"**, as Bianco Sparkle, Grigio Sparkle Light and Nero Sparkle. Those three now ship **under Bloom's own names**, so checks 8 and 9 pass, and **`STONE_WORDS` in index.html maps mirror → sparkle** so "mirror black" narrows to Nero Sparkle, "mirror white" to Bianco Sparkle, "mirror grey" to Grigio Sparkle Light. Measured live: "mirror" returns 3 of 64. ⚠️ **If TopCat confirm these ARE their Mirror range, the rename is a `name=` change in `catalogue_mirror.py` plus a `supplier_names.py` entry** — and the STONE_WORDS entry must move with it. ⛔ **Two of Bloom's whites were REJECTED**: Bianco Galaxy and Bianco Glitter are featureless flats with no stone visible, which is D75's own rejection reason and a check-1 hash risk. Red Sparkle has the room reflected in it. ⚠️ Licensing on Bloom is **open**, exactly as for Caesarstone and CRL — confirm the account before go-live. §2a, D8 (never named publicly, verified 0 mentions on the built pages). |
| D88a | 11 Aug | ⛔ **SUPER-RESOLUTION DESTROYS SPECKLE. It was measured, rejected, and D77's drift metric did not catch it** | The three mirror-chip tiles were put through the documented route — 2×2 montage, `bytedance_image_upscale` at 4k, **2 credits spent** — and the result was **rejected for the grey**. ⭐ Measured as fine-detail energy retained against the supplier's own crop: **AI keeps 32.5% (Grigio Sparkle Light), 63.0% (Nero Sparkle), 74.9% (Bianco Sparkle); a plain Lanczos resample keeps 81.1%, 94.1%, 80.3%.** ⛔ **The model reads mirror-fleck sparkle as noise and smooths it away** — the opposite of the veined stones in D77, where it sharpened. The grey came back visibly blotched, with colour banding where dense speckle had been. ⚠️ **D77's pattern-drift check PASSED it at 3.36, inside its own 1.0–5.1 band**, because a mean absolute difference at 128px cannot see fine texture being destroyed. ⭐ **The rule this sets: drift is blind to smoothing. For a speckled or sparkled stone, measure high-frequency energy and look at the tile before installing any upscale — and prefer a plain resample.** All three ship as the supplier's own crop resampled to 1600 (959 → 1600, 923 → 1600, 1306 → 1600). ⚠️ **A second self-inflicted fault worth recording**: the small wheel variants were first written at **300px when every other `-s.webp` on the site is 800px**, a third of the resolution the `srcset` declares — caught by comparing against an existing tile rather than by any check. Now 800/1600 like the rest, and audited: every small tile is 800, every full tile ≥1200. |
| D87 | 10 Aug | ⛔ **V2 IS GONE. The whole second version, the switcher and the chooser page are out of the site** | Client: "remove the V2 from the side completely… where there's version one of the website and version two of the website, completely remove version two and everything about it." ⭐ Removed: the fixed **V1/V2 pill** bottom-right of every page (it was inline in index.html and a `PILL` constant in **three** builders — stones, services and trade), **`/versions.html`** (the chooser splash), **`/v2/`** (69 pages, 1.3MB) and **`/index-v2.html`** (683KB, the original A/B landing page that was still sitting in the site root). ⚠️ **Parked, not shredded**: everything moved to `.removed-2026-08-10-v2/` **outside `Website Demo/`**, so it cannot be served or deployed, following the same precedent as D60's removed stone pages. There is no git here, so say the word to delete it for good. ⭐ **This closes a live risk**: §2 rule 1 recorded that "V2 was not rewritten and still carries the old claims" about in-house fabrication — dormant but one revival away from being published. It is now impossible to publish by accident. ⚠️ The go-live compliance scans still carry their `grep -Ev "(^\|/)v2/"` filters; harmless, and they can be simplified next time they are touched. ⚠️ **The `./v2/` grep trap bit again while checking this** — BSD grep prints `v2/about.html`, so `grep -v "^./v2/"` matched nothing and the sweep looked like 72 pages still carried the pill. The live count is **0**. Measured after: 161 live pages, 1,071 internal links, 0 broken, verify.py ✅. |
| D86 | 10 Aug | ⭐ **NO DARK STONE ON THE FIRST SCREEN, AND THE LEFTOVERS BALANCED. All NINE visible cards are light in every range** | Client: "the first five showing cards should be light, so the centre one and the two on the side, and then the centre one and the two on the other side", then on seeing it wide: **"let's rather not have dark ones on the first screen if we can help it, I want balance."** ⛔ **NO CHOICE OF LANDING CARD CAN DELIVER THIS**: granite has 9 light stones in 20 and its longest run of consecutive lights A-to-Z is **THREE**, so there is no position in granite where even five in a row are light. ⛔ **FIVE WAS ALSO THE WRONG NUMBER AND THAT IS THE LESSON — measure the window before protecting it.** The wheel shows **9 cards** fully (`--dim` 1.00 / 0.78 / 0.56 / 0.34 / 0.18, four each side) plus partials, at every width from 912 to 1920. A five-card window therefore left the two deferred darks at **+4 and +5 — on screen, and both on the same side**, which is exactly what the client saw and objected to. ⭐ **`clearOpening` now walks outward taking the next LIGHT stone each way until it has OPEN_SPAN=7 a side, and puts the darks it stepped over back SPLIT EVENLY, half beyond each edge** — that split is the "balance", and it is why they are not simply dumped after the window. ⚠️ The span is capped at (lights−1)/2, so a range cannot protect more than it owns. **Measured: quartz and marble are clean to ±7 (15 cards); granite is clean to ±4 — its 9 lights exactly fill the 9 visible cards — and its remaining darks sit 3 left, 3 right.** ⭐ Cost in alphabetical order: quartz and marble keep A-to-Z apart from two deferred stones each. ⛔ **Granite does not and cannot**: 11 of its 20 are dark, so holding 9 lights together means the rest of that belt is the dark stones. That is the client's own trade and he was shown the numbers. ⛔ **The collection grid is NOT touched** — no centre card, so it stays a plain, perfectly sorted A-to-Z list. If the two ever have to match, MOVE `clearOpening` into `catalogue_active.py` rather than copying it, or they will drift (D51's failure mode). ⭐ Landing cards are the most popular stone in each range **that is not dark**: **Azul Shimmer** (quartz, the client's own pick), **Carrara Honed** (marble — ⭐ restored, the most popular UK marble, which D85 had pushed off) and **Bianco Crystal** (granite). ⚠️ Verified in the browser at 1920 on all three tabs, and against the pixels rather than the `tone` labels: every visible card measures a median luminance of 129–234. |
| D85 | 10 Aug | ⭐ **THE WHOLE RANGE IS ALPHABETICAL, ON BOTH SURFACES. ⛔ This REVERSES D74** | Client: "we should probably be smarter and order all the slabs in the slab wheel and in the collection thing in alphabetical order, because that would make it easier for people to navigate. And if they already want one." ⛔ **D74 was also his instruction and the two cannot both be had** — a stone's NAME says nothing about its colour, so sorting by name drops the tone wherever the alphabet leaves it. Measured after: quartz longest dark run 3, marble 4, **granite 7**, and granite's seven are at the FRONT now (Absolute Black ×4, Angola Black, Antiq Brown ×2). ⚠️ **That is the exact wall D74 was built to remove, moved from the end of granite to the start of it, and the client has been shown it.** The one mitigation that keeps both is his own hedge — "possibly only worry about the first letter" — i.e. sort on the first letter and spread tone within each letter; it is a change to `_alphabetical` in `catalogue_active.py` and nothing else. ⭐ **One sort, both surfaces**: `catalogue_active.S` feeds the collection grid, the estimator's picker and the wheel, so alphabetical is done once. ⚠️ Sorted on the **displayed name**, case-folded, **not the slug** — `calacatta-oro-quartz` displays as "Calacatta Oro" and `arctic-cream` ships `artic-cream`, so a slug sort would produce an order the customer can see no logic in. ⭐ **Per material, not across the whole catalogue**, or the "All" view would interleave the three ranges. ⛔ **THE WHEEL NEEDED A REAL CHANGE, NOT JUST NEW DATA, AND THIS IS THE PART TO UNDERSTAND**: `fanOrder` seated rank 0 at the centre, rank 1 to its LEFT, rank 2 to its RIGHT and so on outwards, which was correct for a popularity list (it kept the least popular out of the left wing). Feed an alphabetical list into that and the eleven on screen read 9,7,5,3,1,0,2,4,6,8,10 — two interleaved sequences. **It would have been perfectly sorted and no customer could ever have seen it.** The belt is now sequential, so dragging right walks A to Z. ⚠️ If the wheel ever goes back to popularity order, the centre-out seating has to go back with it. ⭐ **Where each range OPENS is now the only job `POPULAR` has left**, and D48 survives there: `landingIndex()` opens on the most popular stone whose card and the two after it are light. **Quartz keeps Azul Shimmer (D84); marble moves to Calacatta Gold Oro Honed** because Carrara Honed has Cosmic Black behind it; **granite moves off Absolute Black Extra to Bianco Antico** — ⛔ D48 giving way to the tone rule below, deliberately. ⚠️ The estimator's default derives through the same function, so the two still cannot drift. §4m |
| D85a | 10 Aug | ⭐ **NO DARK STONE MAY LEAD A RANGE. The wheel enters the alphabet wherever that rule is satisfied** | Client, with D85: "whatever looks best, as long as there's not a dark stone that's in the first slot or the first three slots." ⚠️ **The catalogue cannot honour this and the wheel has to** — rotating the entry point does not break alphabetical order, because dragging still walks A to Z, it just starts partway in, which is what a wrap-around carousel does anyway. ⛔ **The first version took the earliest qualifying stone and that was wrong, in a way only looking would catch**: granite opened on Arctic Cream, whose entire LEFT wing is Absolute Black Honed, Absolute Black Leather, Angola Black Leather and both Antiq Browns — five near-black cards in a row at a `--dim` of 0.34 falling to 0.18, which reads as **a hole where the wheel should be**, not as dark slabs. ⭐ So the rule now scores the whole **eleven-card window** and takes the fewest darks: Bianco Antico (4, spread) over Arctic Cream (6, banked). ⚠️ It reads the list it is GIVEN, so a filtered wheel also opens on a light stone rather than on whatever the filter left first. |
| D84 | 10 Aug | ⭐ **THE QUARTZ WHEEL OPENS ON AZUL SHIMMER, PLACED BY THE CLIENT** ⚠️ **The LANDING CARD stands; the hand-placed neighbours and the two darks were superseded within the hour by D85's alphabetical order** | Client: "in the quartz part of the stone wheel you are going to put Azul Shimmer as the first slab, that one will be the first one that they see before interacting. Then add a couple of brighter slabs next to it, and then a dark slab there here and there… put Arabescato Elegance next to it, and Calacatta Oro on the other side of it." ⛔ **This PARTLY SUPERSEDES D48 for quartz only** — "the one that displays first must be the most popular" no longer holds there, because Azul Shimmer is his choice rather than a trade ranking. ⚠️ Do not "correct" the quartz list back; the comment above `POPULAR` now says so. ⭐ **The eleven, left to right as the fan seats them** (ranks 9,7,5,3,1,**0**,2,4,6,8,10): Sahara Dunes, Carrara Jumbo, **Laurent Black**, Borghini Royal, Arabescato Elegance, **⭐AZUL SHIMMER**, Calacatta Oro, Calacatta Fantastico, **Marquina**, Carrara Shimmer, Crema Tempest. ⭐ **A new `PINNED` constant was needed and it is the interesting part.** D74's `spread()` interleaves ranks 1–10 by tone, and it only left the old quartz head alone because that list contained no dark stone at all. The moment two darks were placed in it, spread() had both tones to merge and **would have pulled Arabescato Elegance and Calacatta Oro off the landing card's shoulders** — the one thing the client named explicitly. `PINNED={Quartz:FAN_HEAD}` fixes the eleven he placed; the default is 1, which is D74 unchanged, so **Marble and Granite are byte-identical** (measured: longest dark run still Marble 1, Granite 2). The tail is still spread automatically. ⭐ **The darks sit at ranks 5 and 6, and that is a measurement, not a taste**: depth is `filter:brightness(--dim)`, which is 0.34 at ranks 5–6 and **0.18 from rank 7 out**. A white slab survives 0.18; Marquina measures a median of **4**, so further out it renders at about 1/255 and reads as a *hole in the fan* rather than a slab. Ranks 5 and 6 are the outermost slots where a dark stone is still visibly stone, one per wing. ⭐ **Laurent Black and Marquina were chosen by LOOKING, not by measuring darkness** — Royal Grey, Black Tempal and Nero Starlight are darker still and are flat fills with no pattern at card size, so beside the veined whites they read as blank cards. ⚠️ **The estimator's opening stone followed automatically** to Azul Shimmer (`BEST[m]=POPULAR[m][0]`, D48's deliberate derivation) and the opening price is unchanged at £2,000 – £2,500, because the bracket table is keyed on material and slab count, not on the stone. ⚠️ **The `/stones/` collection grid is a SEPARATE order** (`_interleave` in `catalogue_active.py`) and was not touched; ask the client whether he wants it to match. Measured: 126 stones all ranked, 0 unranked, inline JS parses, all 61 quartz tiles 200, no drawn-SVG fallback in the eleven, verify.py ✅. §4m |
| D83 | 10 Aug | ⛔ **FIFTEEN STONES CARRIED A PHOTOGRAPH OF A DIFFERENT FINISH FROM THEIR NAME. Renamed, and verify check 9 now fails the build on it** | Client: "if you're getting this one wrong, how should I believe that every other stone is correct?" — a fair question, and the audit answered it badly. ⛔ **Provenance was not enough.** Check 8 proved every tile came from the right supplier under a matching filename, and fifteen stones were still wrong, because our NAME dropped the supplier's finish word: we called Nile's "BELVEDERE LEATHER" simply **Belvedere**, their "Carrara Honed" simply **Carrara**, their "Blue Dunes Leather" **Blue Dunes**, their "PATAGONIA EXTRA" **Patagonia**. ⚠️ **That is the wrong-slab-at-the-house scenario exactly**: choose Belvedere here, ask TopCat for Belvedere, receive a different finish. All fifteen renamed to the supplier's own title. ⭐ **Check 9 compares the stone's NAME to the supplier's TITLE for the exact file it ships** and fails the build when they disagree; proven by injecting a wrong name and watching it fire. ⚠️ Seven legitimate differences are recorded in **`stones/supplier_names.py`** — five are the supplier's own misspellings of well-known stones (Artic Cream, Verde Gautemala, Macaubus Fantasy, White Eclpyse, Grigio Shimmerr, where OUR spelling is what a customer googles), and JUMBO is a slab FORMAT rather than a different stone. ⭐ An entry there AUTHORISES the difference, and the check still fails if the record itself goes stale against the supplier. ⭐ **Calacatta Oro was also re-cropped**: right supplier, right name, but the window was a tight zoom on a quiet patch, so it read as a plain white stone instead of the dramatic copper-veined slab a customer finds on Google. Now the full slab height, 2956px native. **The rule that sets: a tile must show the stone at a scale where its PATTERN is recognisable, not merely at the right resolution.** |
| D82 | 10 Aug | ⛔ **A STONE'S NAME AND ITS PHOTOGRAPH MUST MATCH THE SUPPLIER'S OWN. Now enforced by verify check 8** | Client: "these names cannot be wrong. If someone googles it and sees it looks different here, then we have a big problem… if someone chooses this one by this name and TopCat somehow shows up at the house with a wrong looking slab, then we are fucked." ⛔ **The thing that triggered it was mine**: chasing his Calacatta Gold reference I RENAMED the marble "Calacatta Gold Oro" to "Calacatta Gold" and attached a crop I had chosen. That is the exact failure he describes and it was reverted. ⭐ **A stone name is only meaningful RELATIVE TO A SUPPLIER** — "Calacatta Gold" is a marketing name different manufacturers put on completely different-looking products, so the site can never be validated against a generic Google image. The only defensible test is that the photograph shipped under a name is the one THAT supplier publishes under it. **Check 8 enforces exactly that** and was proven by pointing Carrara at a Caesarstone file and watching it fail. ⭐ **Audited: 121 of 126 clean.** The other five: one had lost its provenance in the revert (restored), and **four are spelled correctly here and INCORRECTLY by the supplier** — Nile's own titles are "Artic Cream", "Verde Gautemala", "Macaubus Fantasy" and "White Eclpyse". ⭐ The public name stays correct, because that is what a customer googles; the supplier's exact string is recorded in **`stones/supplier_names.py`** so an order can actually be placed. ⚠️ **Calacatta Gold is unresolved and needs Nick**: Nile's own quartz of that name is GREY veined (0.03% warm pixels) and their marble of that name is a busy brown, while the client's reference is a clean white with fine gold — a third manufacturer's product. ⚠️ Its tile is also a 4.2x upscale from 384px, the weakest image in the range. |
| D81 | 10 Aug | ⭐ **CALACATTA GOLD ADDED AS QUARTZ AND LEADS THE RANGE. The range is 127** | Client: "when we were first doing research it said the most popular stone was Calacatta Gold, why is this not one of our options? our whole intro video is based on that", then "Google says Calacatta Gold can be quartz or marble, add it to whatever category sells most in the UK", and "it must be the first thing that displays for whatever category it's in". ⭐ **Added as QUARTZ** — the industry brief calls quartz "the most popular and most all-round choice in UK kitchens" — and set as `POPULAR.Quartz[0]`, so the wheel now lands on it. ⭐ **NO UPSCALING AT ALL**: Nile's flat scan is 6496x3898, the slab face measures x 720-5760 / y 760-3280, and a 2400px square comes out of it natively, so the shipped 1600 tile is a DOWNSAMPLE. ⚠️ **The range already contained this stone under another name** — "Calacatta Gold Oro" (marble), since **oro is Italian for gold**. They are different products and both stay. ⛔ **verify check 3 correctly flagged "Calacatta Oro == Calacatta Gold"**, because its normalised key translates oro to gold — the same rule that caught Black Marinace == Nero Marinace. Here Nile genuinely publish two different quartz (warm cream with copper veining vs bright white with grey and fine gold, **perceptual distance 121** against a fail threshold of 8), so a `CONFIRMED_DISTINCT` exception was added **with the evidence written down**. ⚠️ That list is how the guard gets quietly disabled; measure, look at both tiles, and describe the difference or it is not an exception. ⚠️ **Open for the client**: the quartz range now holds Calacatta Gold, Calacatta Oro, Calacatta Gold Soft and Calacatta Gold Shimmer. Those are the suppliers' own product names, but four near-identical names in one range is the confusion D66 exists to prevent. |
| D80 | 10 Aug | ⛔ **"VEINING" WAS RETURNING STONES WITH NO VEINS. `vein` MEANS BUSY, NOT VEINED** | Client: "when I search veining, some without veining come up." He is right and the cause is a conflation in the search vocabulary: `vein` is a BUSYNESS classifier measured off the pixels (statement / soft / calm), and `SEARCH_WORDS` expanded `statement` to "veiny veined veining bold dramatic busy…". ⚠️ **Dense speckle reads as busy without being linear**, so Bianco Sardo, Baltic Brown, Angola Black Leather and Nero Marinace all carry `statement` and all answered a search for veining with no vein in them anywhere. Measured on the tiles they sit at the BOTTOM of the vein-structure scale (p99 over median ≈ 3.1–4.4 against 8–19 for genuinely veined stones). ⭐ **The vein words now come from the DESCRIPTION**, which was written with each photograph open and is the only record of what is actually in the picture — Nero Marinace's own line calls it "a conglomerate rather than a veined stone". ⚠️ Three traps inside that: the description had to be scanned for NEGATION (indexing that line verbatim made the one stone that denies having veins answer "veined"); the vocabulary had to widen beyond the word "vein" (Fusion Black says "striations" and is one of the most veined stones in the range); and "marbled" had to go, it matched 107 of 126. ⭐ **The whole description is now indexed**, so "sparkle", "copper", "pebbles", "crystals" and "diagonal" all work where they previously returned nothing — the client's actual complaint was "I can type whatever I want and it comes back with no stones". **Measured after: "veining" returns 79, zero unveined leaking, zero veined missing, and no term in a 20-word sweep returns nothing.** |
| D79 | 10 Aug | ⭐ **A GOLD BACK ARROW SITS BESIDE THE BREADCRUMB ON ALL 160 GENERATED PAGES** | Client: "a golden back arrow button, to go back to the previous page, in the top corner of the page below the nav bar… and if there's a directory of the pages that you're on, the back button must be next to that", then "make it a simple golden gradient back arrow, not a circle around it, not anything, just simple." ⭐ It lives INSIDE `.crumb`, which every generated page already carries in exactly that spot, so the two can never drift apart. ⚠️ It is an `<a>` with a REAL href taken from the parent crumb, not a bare button: right without JS, right on a cold open from search where there is no history, and right in a new tab. The inline handler only prefers `history.back()` when there is genuinely same-origin history. ⛔ First build gave it a ring, which the client cut; the gold is the brand gradient on the stroke itself now. ⚠️ Two build errors worth remembering: the inline handler's braces must be DOUBLED inside the builders' f-string templates, and anchoring the insert on the `<nav>` tag put both of build_stones.py's buttons on the FIRST crumb — anchor on each trail instead. |
| D78 | 10 Aug | ⛔ **THE WHEEL WAS SHOWING DRAWN SVG CARTOONS FOR THE 14 NEW STONES, AND THE BREADCRUMB WAS INVISIBLE ON 127 PAGES** | Two separate silent-render faults found from the client's screenshots. **(1)** `SLAB_TILES` in index.html is the slug→tile map the WHEEL reads and it was written only by `harvest/match.py`, which was never re-run — so the stone PAGES showed the photograph while the wheel fell back to `marble()`'s drawn SVG for the same stone. ⚠️ Nothing 404'd and nothing errored, because the fallback is by design; the customer just saw a cartoon under a real stone's name. ⭐ `apply_catalogue.py` now DERIVES SLAB_TILES from `manifest.json` and fails the build if any catalogue stone has no tile. **Fourth instance of the same root cause as D51, D59 and D68: a second file that has to be hand-synced.** **(2)** `nav.crumb` is a direct child of `<body>`, and D71's fixed page floor at z-index 0 painted straight over it, so the breadcrumb was invisible on every stone page from the moment the floor went in. Found only because the new back button did not appear either. ⛔ List every content-bearing direct child of `<body>` before adding a fixed background. |
| D77 | 10 Aug | ⛔ **THE TEN UNDERSIZED DARK TILES ARE UPSCALED. NOTHING ON THE SITE IS BELOW 1200px NOW** | Client: "these are terribly, terribly low quality images… there may be no fucking blurry images on the entire site." He is right and it should never have shipped: ten of the fourteen new tiles went live at **512–799px** against a range standard of 1600, on a site whose stated bar is "everything has to look 4k perfect quality" (D50). ⛔ **They were shipped knowing they were small, with the upscale left as a follow-up item. That was the wrong call** — the handover's own quality floor is not a nice-to-have and a soft tile is exactly what the client checks. ⭐ Fixed with the documented cheap route: **three 2×2 montages, 6 credits total** against 20 one at a time, `bytedance_image_upscale` at 4k, returning 4096px sheets that split to 2048 per stone and install at 1600. **Pattern drift measured at 1.0–5.1** (mean absolute difference at 128px), so the model sharpened rather than re-imagined, and all ten were compared against their originals at real display size before installing. ⛔ Restore set synced, provenance in `upscaled.json`. **Every tile on the site is now ≥1200px, 121 of 129 at ≥1600.** |
| D76 | 10 Aug | ⛔ **THE WHOLE SITE WENT BLANK FOR ONE INVENTED WORD, AND NOTHING CAUGHT IT** | Client: "none of the animations are loading in, the whole website is currently empty… most of the hero section is gone." Cause: the 14 dark quartz were given `preset="noir"`, **a preset name that does not exist**. `marble()` does `const p=STONES[preset]` then reads `p.grey`, so it threw a TypeError at the top of the script, before the reveal observer was wired — every `.rise` element stayed at opacity 0 and the hero, the copy and the reviews were simply not there. ⚠️ **The measurement had the right value and it was overwritten by hand**: `derive.measure()` returns a `preset` keyed on (tone, hue), and it was ignored in favour of a typed-in name. ⛔ **Everything passed**: `node --check`, the build, `verify.py` all seven, 200 on every route. Nothing tests that a data value means anything to the code that consumes it. ⭐ `check_presets()` in `apply_catalogue.py` now reads the valid names out of the JS `STONES` block and **fails the build** on any preset the engine does not know; it was tested by re-introducing "noir" and confirming it fires. ⚠️ The guard was itself written wrong first — it checked `s["stone"]` when the catalogue key is `preset`, so it silently passed everything. Check that a new guard actually fires. |
| D75 | 10 Aug | ⭐ **FOURTEEN DARK QUARTZ ADDED. The range is 129, and quartz goes from 2 dark in 50 to 16 dark in 64** | Client, escalating: "are you telling me you're not going to get any more dark stones… if there are, then add them", with his own list of nine suppliers. ⛔ **The first answer given to him was wrong in SCOPE and that is the lesson**: the search was limited to the two suppliers TopCat already buy from, because D45 put the rest on "ask first" — so the honest report of "about 2 available" was true of a question nobody had asked. **485 images from Caesarstone, CRL and Noble Stone were already sitting in `raw/` unharvested-for.** ⭐ Now live: **6 black quartz, 4 of them veined** — Laurent Black (gold veining on black), Marquina and Azalai Negro (white veining on black), Black Tempal, Nero Starlight, plus Vanilla Noir, Woodlands, Darcrest, Belvedere Black, Terra Marron, Umbra Marron, Forest, Cristallo Gris, Labradorite Royal. ⛔ **Six candidates were rejected and the reasons are recorded in `catalogue_dark.py`** — Soft Black is a flat fill with no stone in it, Marquina Shimmer carries a room reflection, Concrete Oyster and Urban Concrete measured LIGHT (adding those under "dark" is D58's exact defect), and Croma Black / Silk Negro were **caught by verify check 1 as pixel-identical to each other and to Fresh Cement** — ⚠️ not really the same photograph, but all three are featureless flats and a perceptual hash of a flat image is the same whatever its colour. Dropped rather than loosening the guard. ⚠️ **CRL's tiles ship at 625px** against the range's 1600 because that is the largest frame CRL publish; they want an upscale pass (~6 credits) before go-live. ⚠️ Licensing on Caesarstone and CRL is **open** — see §2a. §2a, §4r |
| D74 | 10 Aug | ⛔ **REVERSED the same day by D85 (alphabetical).** Kept because the reasoning still matters: it is why granite must never be sorted on tone, and its `_spread` merge is the code to restore if the client wants the spread back within each letter. ⭐ **DARK AND LIGHT ARE INTERLEAVED IN EVERY RANGE. An ordering change only, no stone added, removed or reclassified** | Client: "make sure to spread them in between, don't keep all the dark next to each other. Also spread the dark in between the light with marble and with granite. I don't mean adding more to marble and granite, I just mean take the ones that are already there and move them in between." ⚠️ **Granite closed on SEVEN dark stones in a row** and marble had three clumps of three, because the catalogue was grouped by material then alphabetical and the tone fell where the alphabet left it. Longest dark run now: **Quartz 1, Marble 1, Granite 2** (11 darks in 20 cannot do better than 2). ⭐ Two places, one method: `_interleave` in `catalogue_active.py` covers the collection grid, the estimator's picker and the wheel's tail; `RANK` in index.html covers the wheel's fan. ⛔ **D48 IS PRESERVED**: rank 0 is pinned to `POPULAR[0]` so the landing card is still the most popular, and ranks 1-10 are shuffled only among themselves so the visible eleven is the same set. ⛔ **Both were got wrong first time by interleaving POPULAR and the catalogue separately** — the light group sorts first, which moved granite's landing card off Absolute Black Extra, and lifting the ranked stones out of an interleaved catalogue re-clustered the tail into a run of six. It has to be applied to the FINAL order. ⛔ Do not "simplify" either to a sort on tone; sorting on tone is what makes the clumps. §4r |
| D73 | 10 Aug | ⭐ **THE RANGE ON SHOW MUST NOT READ AS THE WHOLE RANGE. A sourcing line now sits on every surface where a stone is chosen** | Client: "we must make it very clear and obvious somewhere to say if you don't find your stone, we can source it… because if they think this is the only range that we have, that wouldn't make sense, because there is more. So in all those spaces where they have to choose a stone." ⚠️ **It already existed in four places and none of them were where it was needed**: the collection's lede (last clause of a skimmed paragraph), the collection's empty state (only after a filter returns nothing), the enquiry form's upload, and the marble/granite POA text. It was absent from the **wheel**, from **every stone page** and from the **estimator's picker** — the three places a person actually runs out of options. Now on all three, plus lifted out of the collection lede onto its own line. ⛔ **Hedged deliberately**: "we can usually source it", "we will source it where we can". §2 rule 12 forbids an absolute and this is a promise about other people's quarries. ⛔ Suppliers still never named (D8). §4r |
| D72 | 10 Aug | ⛔ **THE "REFINE" BUTTON DID NOTHING, AND A SECOND BUTTON HAD THE SAME BUG. One missing CSS line each** | Client: "there's a button that says refine, I don't know what that does. If it doesn't do anything, remove it." It did nothing **visible**: the drawer is opened by toggling the HTML `hidden` attribute, which the browser honours via a UA rule of `[hidden]{display:none}` — and a UA rule loses to any author rule, so `.st-drawer{display:flex}` held it open in every state. All three filter groups sat permanently open and **pushed the stones off the first screen**, which is the exact failure D53 built the drawer to avoid. ⭐ **Not removed, fixed** — removing it would have left the filters permanently taking the space D53 reclaimed. Two full rows of stones now sit above the fold where one partial row did. ⚠️ **Found a second live instance in the estimator**: `.est-lm{display:flex}` meant the "Total linear metres" field showed the moment the edge panel opened, contradicting both `renderEdge()` and the markup comment beside it saying it "stays out of sight until a profile is chosen". ⭐ **Third instance overall** — `.st-badge` three lines above `.st-drawer` in the same file had already been caught, fixed and commented, and the lesson was not carried across. A scan for the pattern now exists and returns clean. §4r |
| D71 | 10 Aug | ⭐ **The stone pages and the collection now stand on the landing page's floor, not flat `--ink`** | Client: "inside the stone pages it should have the same background as the landing page, that same faded black background." They were `background:var(--ink)`, which is why the site changed character the moment you left the home page. Now the same Portoro photograph under the same veil at the same measured strength (§4l). ⚠️ **The url must be ROOT-RELATIVE** — index.html can write `url('assets/…')` from the site root, these pages sit a level down. ⚠️ `main` **and** `body > footer` both need lifting over the fixed floor, because on generated pages they are siblings rather than nested as on the landing page. §4r |
| D70 | 10 Aug | **Blue Roma re-cropped: warehouse racking and the slab's cut edge were across the top of the tile** | Client, from the wheel: "there's this strip on the top where it looks like it's above the slab, just crop it slightly more in." Measured rather than eyeballed — saturation runs 26–34 across rows 24–44 (the warm cut edge) and settles at 5.5 from row 56, so the cut is at row 60. Re-squared to 1540 and centred; no re-upscale and **no credits**, because pixels were removed from an already-upscaled tile rather than added. ⛔ **The restore set was synced FIRST**, per the trap that "fixed" Aqua Gucci and Calacatta Gold Oro twice each — `_upscale/installed/` now holds the corrected tile, so the documented post-run restore carries the fix instead of reverting it. Provenance in `upscaled.json`. ⭐ **A new scan then measured every tile's top and bottom band against its own body**: 11 flagged across 115, all reviewed at 330px, **all genuine stone**. Blue Roma was the only real fault. §4r |
| D69 | 10 Aug | ⭐ **THE REAL LOGO IS IN. The client supplied his own artwork and it replaces a hand-rebuilt approximation that was live on all 150 pages** | Client: "this is the real logo, not the one that we currently have on the site. The one we currently have on the site is very wrong." He is right, and it was worse than a wrong drawing: the mark was **redrawn by hand in inline SVG** and the wordmark was **live text** set in Cinzel and Montserrat, so the "logo" was a reconstruction that could drift again whenever a webfont fell back. Now: **nav takes the horizontal lockup, footer takes the vertical** (his instruction), favicon takes the icon squared off. ⭐ **One `<img>` per surface pointing at a file** — the old mark was pasted into four builders AND the head of every page, which is why correcting it meant editing five source files. ⚠️ **The generated pages also changed colour**: their wordmark was set in `--bone`, so they carried a white TOPCAT where the landing page carried gold; the supplied lockup is gold throughout and the two now match. ⛔ **viewBoxes are retightened to the ink** and **height is the only dimension ever set** — see `assets/brand/README.md`. Measured: bar height unchanged at 78.5px, 150/150 pages carrying all three assets, 0 broken links, verify.py ✅. §4q |
| D68 | 10 Aug | ⛔ **The HTML sitemap was built from the 52-STONE SNAPSHOT and 63 stone pages were missing from it** | Found while checking which surfaces name a material. `_stone_catalogue()` in `build_seo_pages.py` read `catalogue_source.py`, not `catalogue_active.py`, so the one page built to prove nothing is orphaned listed 52 of 115. ⚠️ **The handover's "0 orphaned pages" did not catch it** — that figure was measured before the range grew and was never re-measured. ⚠️ Its `except` swallowed the import error and shipped a sitemap with **no stones at all** on the first fix attempt, silently. Now 115 linked, 0 broken, and the stone columns are headed by the range label. ⭐ Same failure as D51 and D59 for the third time: **a second file that looks like the source of truth**. |
| D67 | 10 Aug | ⛔ **A hand-typed list of quartzite slugs had gone stale and made 16 stones unsearchable** | `QUARTZITE` in index.html named 10 slugs against a real 26, so Mont Blanc, Macaubas Fantasy, Cosmic Black, Dover White and twelve others could not be found by a customer typing the one word that describes them — on the range's highest-margin stones. Travertine was a hard-coded slug beside it. Both are gone: the wheel reads `kind` off the catalogue, which `apply_catalogue.py` now emits. **Measured after: "quartzite" returns 26 of 45, "marble" 18, "travertine" 1, and "quartzite" inside the Quartz range correctly returns nothing.** |
| D66 | 10 Aug | ⭐ **The browse range is renamed "MARBLE & QUARTZITE" on every customer-facing surface. The stone always states what it is; the range around it is named for what it contains** | Client: "on the collection page it shows marble, but on the actual page it says quartzite, natural stone. So we have to say available in marble and quartzite or something like that. We cannot have that confusion." ⚠️ **D65 fixed the page and broke the journey** — naming the true stone was right, but nothing connected it to the Marble tab the customer had just pressed. ⛔ **The two literal readings of his instruction were both rejected, and here is why**: "Taj Mahal is available in marble and quartzite" is not true and could not be made true (it is one rock, and every UK merchant sells it as quartzite); and "just say natural stone" throws away the word the customer searches, the reason the stone costs what it does, and re-opens D65. ⭐ **The honest version of what he asked for is at RANGE level, and it is what the trade does**: the range is 18 marbles, 26 quartzites and 1 travertine, so "Marble" was wrong about the majority of its own contents. Now: the tab, the collection filter, the estimator tab and the sitemap column say **Marble & Quartzite**; the wheel readout, the card tag, the estimator's stone line, the enquiry chip and the image alt say the **true rock**; and every stone page carries a **Range** row under Stone. ⛔ `mat` is untouched, so no price, filter, POA or deep link moved. ⚠️ **The travertine is deliberately not in the label** — one stone in 45, its own card and page say Travertine, and a three-noun range name reads as a list. ⭐ **To change the wording, change `RANGE_LABEL` in build_stones.py and `MAT_LABEL` in index.html.** §4p |
| D65 | 10 Aug | ⛔ **27 stone pages CONTRADICTED THEMSELVES: titled "Marble", spec block said "Quartzite". The visible copy now names the true stone; the CATEGORY is unchanged** | Client: "Take Fusion Black. It says stone is quartzite, natural stone. Why doesn't the stone say marble, or why is it in the marble when it's a quartzite? That doesn't make any sense to me." He is right — `<title>` read *Fusion Black Marble Worktops* while the spec block on the same screen read *Stone: Quartzite (natural stone)*, because `mat` is the browse-and-pricing category and `facts['kind']` is what the stone actually is. 26 quartzites and one travertine. ⭐ New `shown_mat()` in build_stones.py drives the title, meta description, hero tag, eyebrow and the "About …" heading from the TRUE type. ⛔ **`mat` is deliberately untouched**, so the estimator, filters, wheel, POA behaviour and every price are exactly as TopCat set them. ⚠️ Do NOT "finish the job" by adding Quartzite to `MATS` in index.html — it would put a fourth material tab and a fourth range on a site TopCat present as quartz, marble and granite, and that is TopCat's call. **Open question for TopCat, in §7.** |
| D64 | 10 Aug | **Thickness is now "20 mm or 30 mm" on all 115 pages, and it is what TopCat SUPPLY, not what one slab in a yard measured** | Client: "some places where you say quartzite, natural stone, you don't give slab sizings on those, like twenty or thirty millimetres." 59 of 115 showed no thickness at all, because the supplier's stock system only publishes a figure for slabs it happens to hold. ⚠️ The old row was the **wrong fact anyway** — it printed the thickness of one physical slab in a supplier's yard, which is not what the customer is sold. TopCat's own estimator offers exactly two (`THICK=[20,30]` in index.html), so that is the honest answer and it is identical on every page. ⛔ Slab SIZE is still shown only for the 56 where the supplier publishes it and omitted for the other 59 — a size is planned around, and inventing one is the defect this whole round exists to remove. |
| D63 | 10 Aug | ⛔ **Three UNKEEPABLE PROMISES were live in `MAT_FACTS`, one of them on all 45 marble pages. All rewritten, and a scan now fails the build** | Client, finding it himself on Arabescato Gold: "It says the pattern is consistent across the slab. No it fucking isn't. You cannot say that something is consistent across the slab when it's not. Don't say things that you cannot guarantee. Be more vague." Two more went out beside it: granite's "so there are no surprises on fitting day", and marble's **"we vein-match every joint by hand"**, which is a guarantee AND ⛔ a claim to fabrication work TopCat outsource (D21, §2 rule 1). ⭐ **Absolutes are the tell** — "all it asks for", "the one thing it minds", "keeps it perfect", "in its stride". A comparative is safe, an absolute is not: quartz now reads "varies less between slabs than natural stone does". ⭐ `verify.py` check 7 scans every built page for the whole family and **found 355 hits** on the pre-fix pages. ⚠️ It strips HTML comments first — a comment quoting a banned phrase shipped in all 115 pages once and tripped a naive scan. |
| D62 | 10 Aug | ⭐ **Every stone description was REWRITTEN from the photograph we ship. Colour and pattern only, no claims** | Client: "Just describe the colour of the stone. Don't talk about things like, oh, it can match to another stone or make promises we do not guarantee that we can fulfil. Only write about the way that it looks that someone might search." Nothing about sealing, heat, durability, joints, or what a stone suits — an earlier draft carried all of those and the client cut them. ⛔ **NEITHER SUPPLIER PUBLISHES ANY COPY**: checked directly, Nile's `description` field returns "Click on the image to enlarge" for all 138 products and Next Stone Slabs has no product pages at all, so there was nothing to reword. ⛔ **Never look an engineered quartz up on the open web** — the name is a manufacturer's marketing name and a different maker's slab answers to it, the same reasoning that killed marble.com (D45). All 115 tiles were reviewed at 330px before a word was written. ⭐ Copy now lives in its own file, `stones/descriptions.py`, because `grow.py` regenerates `catalogue_expanded.py` — which is exactly how D46 was silently reverted. `build_stones.py` RAISES rather than falling back to an old blurb. |
| D61 | 10 Aug | ⛔ **63 of the 115 descriptions were SCRIPT-ASSEMBLED from a phrase bank, and one of the canned lines was factually backwards** | The client read Calacatta Classic and objected to "a bright white ground" (trade jargon), "very little movement" (trade jargon) and **"It hides everyday marks better than a busier stone will"** — "busier stones will obviously hide marks better because it's busier." He is right, and it was worse than one bad line: `expand.py:153` filled four slots from fixed lists keyed off measured pixels, so 63 blurbs drew on 78 sentences, ten stones closed on the same one, and the reversed claim landed on five pages **including Absolute Black Honed** — a plain matt near-black granite, the single worst surface in the range for showing marks. The word "ground" was on 81 pages. |
| D60 | 10 Aug | ⛔ **The four duplicates removed by D55b still had LIVE, INDEXABLE pages, including `black-marinace.html`** | Checks 1-4 of verify.py all read the CATALOGUE, so a page that outlived its entry was invisible to every one of them — including the exact Black Marinace duplicate check 3 was built to catch. Moved to `stones/.removed-2026-08-10/` rather than deleted. ⭐ verify.py check 5 now lists the DISK and fails on any stone page the catalogue no longer sells. |
| D59 | 10 Aug | ⛔ **The D46 Misterio Gold correction had been SILENTLY REVERTED and was wrong on the live site** | D46 fixed it from "dark brown" to pale cream on 9 Aug. That fix is still in `catalogue_source.py` — but the site builds from `catalogue_expanded.py`, which `grow.py` rebuilt from an older snapshot, restoring `tone='dark', hue='brown'` and the old blurb. It had been answering the "dark" filter with a pale stone ever since. ⚠️ **This is the failure mode D51 was created to prevent and it happened anyway**: one source file is not enough if a generator can overwrite it. Restored, and copy moved out to descriptions.py where grow.py cannot reach it. |
| D58 | 10 Aug | **20 stones were filed under a colour the photograph contradicts. Corrected against the tiles** | The filter runs on `tone`/`hue`, so this is what a customer actually clicks. Fusion Wow Multicolour was *light cream* and is dark orange-brown; Calacatta Viola was *dark brown* and is a white marble; Blue Dunes was *dark blue* and is pale cream; Cristallo was *light white* and is warm honey brown. Found by running the catalogue's own classifier (`derive.measure`) over every shipping tile and reviewing all 20 by eye — the classifier alone is not trusted, it reads Fusion Black as brown because of the gold. |
| D57 | 10 Aug | ⛔ **EVERY MEASUREMENT ON THE SITE IS IN MILLIMETRES. 22 pages were printing a WRONG slab size, not merely a wrong unit** | Client: "It's also showing the thickness as three centimetres. Every slab has to show in millimetres. Every measurement has to be in millimetres." ⚠️ Worse than a unit inconsistency: `slab_facts()` appended the letters "mm" to whatever figure it held, so a slab recorded as 322 x 162 **centimetres** printed as **"322 x 162 mm"** — a worktop the size of a sheet of A4 — on 22 stone pages. Data normalised to mm; the renderer and verify.py check 6 both now **fail** on a figure under 1000 in either dimension, because a unit error survives every visual check: the page looks perfectly correct. ⚠️ The estimator's "Total linear metres" for edge profiling is a PRICING unit and is deliberately left alone. |
| D56b | 10 Aug | **The "more to consider" strip now shows stones that actually LOOK alike, measured off the photographs** | Client: "At the bottom of the actual slab page, it shows slabs that look similar to that. It doesn't just show random slabs." It was `same[(idx + k) % len(same)]` — the next three entries in the list, sharing nothing but material. Measured: 30% matched on colour and **on 76 of 115 pages all three suggestions were unlike the stone**; Nero Marquina, a black marble, offered a pale blue, a white and a blue. ⭐ New `harvest/similar.py` describes each tile by ground, veins, contrast and busyness and picks nearest neighbours. ⚠️ Three things it taught: the MEAN colour is useless (a white marble with black veins averages to grey), features must be **normalised before weighting** or colour silently stops counting, and busyness needs a **log** or the busiest stone in the range matches to nothing. ⛔ Same material only, and it must be re-run before build_stones.py whenever tiles change. |
| D56a | 10 Aug | **Calacatta Viola and Arabescato Classico re-cropped and re-upscaled; 2 credits** | Viola's green lifting strap could not be cropped out of its frame — the straps run diagonally, so a band clear at the bottom is not clear at the top, and the widest clean window was only 512px. Moved to a **different frame of the same slab** with no straps across the face: 368px → 1600px. ⚠️ Arabescato Classico's "blown highlights" were **not a defect in the stone** — every flat frame Next publish is an installed worktop with sunlight falling across it. Window chosen by measuring the smallest brightness sweep across three frames, 440px → 1600px. ⚠️ `upscale.py --install` does NOT populate `_upscale/installed/`, so all three would have reverted on the next full run; the restore set is now synced and covers all 94. |
| D56 | 10 Aug | ⭐ **`harvest/verify.py` is now a REQUIRED pre-deploy gate, after the client found EIGHT defects live that the pipeline had passed** | Client: "make hundred percent sure … that no two pictures are the same and that every stone is exactly the stone we're looking for … it would be detrimental to the company if someone chooses the stone and it's actually the wrong stone." It checks four failures that **do not catch each other**: (1) same IMAGE two names — Almond Beige and Calacatta Gold Soft were pixel-identical; (2) same TILE FILE two stones — Dolce Vita and its Leather variant both pointed at one .webp; (3) ⚠️ **same STONE two names — Black Marinace == Nero Marinace, TWO DIFFERENT photographs of one stone because "nero" is Italian for "black", which a pixel check passes happily**; (4) stale tiles from an older run. ⛔ Same stone in a different FINISH is legitimate (Absolute Black is sold in four), and MATERIAL is part of the identity key (quartz "Carrara Jumbo" ≠ marble "Carrara Polished") — remove either nuance and the guard becomes a nuisance that gets switched off. ⚠️ The other lesson: the range must be reviewed at **330px minimum**; the 215px contact sheet used earlier is exactly how eight faults reached the client. §0 |
| D55b | 10 Aug | ⛔ **Four entries removed as the same stone listed twice. The range is 115: Quartz 50, Marble 45, Granite 20** | Dolce Vita Leather, Mystic Grey Leather and Bianco Eclypsia Calacatta Leather each had **no photograph of their own** — the supplier published one image under both the plain and the leathered name, and cropping them differently only disguised it. Black Marinace was the same stone AND the same finish as Nero Marinace. ⭐ **The rule this sets: a finish variant earns a place only if the supplier photographed it SEPARATELY.** Absolute Black in four finishes is fine — four real photographs. ⚠️ Patagonia's pin is deliberately WIDE and it is the only tile under 1200px (880): the stone genuinely is angular white shards with dark seams, and a tighter crop lands inside one shard and reads as a single crack ("is it supposed to look like this?" — yes, but not cropped like that). Resolution traded for recognisability. §3, §4 |
| D55 | 10 Aug | ⛔ **Three added stones reached a contact sheet with the WAREHOUSE still in frame. Pinned to middle-band crops** | Fusion Wow Multicolour had **red shutter doors and a rendered building wall** across its top third; Arabescato Corchia Extra and Dover White each had a **rack pole** through the slab. All three passed `classify` as a scan because the stone is the dominant texture — the scene gate is a filter, not a guarantee. ⚠️ **Trimming ONE side only moved the window onto the pole at the other**, which was tried first; the fix is a middle band. ⭐ The lesson is the standing one: **a contact sheet of every shipping tile, looked at by a person, is the only check that catches this**, and it is not optional. |
| D54 | 10 Aug | **The range is 119 — Quartz 50, Marble 49, Granite 20 — after a recount that found D52's marble ceiling was wrong** | Client, pushing back: "I don't understand why you're saying you only have ninety six when I said fifty of each… I still want fifty of each if their suppliers allow that." He was right to push. D52 reported Marble capped at 29, taken from `expand.py`'s own count — but that count predated the pipeline fixes that lifted accepted tiles from ~150 to 176. A recount against the tiles actually on disk gave Marble 63 raw / **49 unique**, and Granite 27 raw / **20 unique**. ⛔ **Marble's 50th genuinely does not exist**: "Cote D Azur" and "Cote D'Azur" are the same stone listed by both suppliers, one apostrophe apart. Granite stops at 20 for the same reason it always did. ⚠️ Finish variants ARE counted separately (Absolute Black Honed / Leathered), because the live range already listed Antiq Brown Extra beside Antiq Brown Leather and they are different products a customer picks between — deduping them cost 9 marbles and 9 granites. New tool `harvest/grow.py`; ⛔ do NOT re-run `expand.py`, it rebuilds from the original 52 and would delete live stones. |
| D53 | 10 Aug | **The filtering is redesigned, and the /stones/ collection can now refine on colour, veining and finish** | Client: "they've redesigned the filtering system so that it looks and functions better. And on the all stones, we need to have the filter option there as well." The collection page could filter by material and tone only — so the one surface showing every stone was the least narrowable, which is untenable at 96. Colour/Veining/Finish now sit in a **Refine drawer** (a button, not three permanent chip rows, which would have pushed the stone below the fold). ⭐ On BOTH surfaces a chip that would return nothing is now **dimmed and unclickable**, counted against every other group's choices so the alternatives beside it stay reachable — clicking a filter and getting nothing back is what makes a panel feel broken. OR inside a group, AND across groups. §4n |
| D52 | 10 Aug | **The range is switched on at 96 stones — Quartz 50, Marble 29, Granite 17 — and every one carries a real photograph** | Client, for the third time: "I want fifty in each category, not fifty two in total through the 3 categories. 50 in each unless one of them doesn't have 50." **Quartz reaches 50.** ⛔ Marble and Granite cannot, and that is a supply fact: the two licensed suppliers list 27 marble and 27 granite names between them, and after the ones with no usable photograph the pool is 29 and 17. Padding either would mean listing stone TopCat cannot get, or taking photography from a supplier they have no account with (LICENSING.md forbids the second, D45). The route to a wider granite range is another supplier account or the Caesarstone/CRL/Cosentino packs. ⚠️ 44 of the 96 carry **generated copy** (`review=True`) that has not been through the client's voice. §4n |
| D51 | 10 Aug | ⭐ **The stone list now lives in ONE file. `catalogue_active.py` is the switch** | It was three hand-kept copies — `catalogue_source.S`, `STONE_LIST` in build_stones.py, `MATERIALS` in index.html — each with a comment telling the next person to remember the other two. That held at 52 because someone checked by hand every time; it does not hold at 96, and drift does not error, it just shows a different slab from the stone page under the same name. build_stones imports it, `apply_catalogue.py` injects it into index.html. **To change the range, change one import.** |
| D50 | 10 Aug | **Tiles that had no larger photograph are super-resolved. 73 stones, 46 credits, every one checked by eye against the original before it shipped** | Client: "if it's not four k HD or at least very clear, fucking fix it… I don't care how you do it", with Higgsfield allowed and a 100-credit ceiling. ⛔ **It does not generate or re-imagine a stone** — it enlarges the supplier's own photograph of the crop slabify already accepted. Batched **four stones per job** (2x2 montage, flat 2 credits/job whatever the size) which cut the bill from 146 credits to 46. ⚠️ **`harvest/_upscale/installed/` holds every upscaled tile and MUST be copied back over `assets/slabs/` after any full `slabify.py` run**, or the run silently reverts them. Provenance is in `harvest/upscaled.json`. ⚠️ Two supplier photographs carry defects that are in the ORIGINAL, not introduced: Arabescato Classico has two small blown reflections, Verde Alpi and Aqua Gucci have yard marks. §4n |
| D49 | 10 Aug | ⛔ **The wheel's selected card was rendering at `brightness(1.10)` and THAT was the "overexposure", not the photographs** | Client, diagnosing it himself: "some of the overexposed images is simply because of the light… on the design because the front image that's selected is highlighted, it's causing images to overexpose. So some of the images that you created aren't even overexposed." He was right. `layout()` and `fanOut()` added `+near*0.10` to `--dim`, which only ever reached the centre card. On a pale stone that clips — Calacatta Fantastico sits at median 235 and 1.10x drives it past 255. **Depth may only ever DIM; the centre now shows the true photograph** and still pops through scale, lift and its halo shadow. ⚠️ Carrara Jumbo and Carrara Shimmer still MEASURE 31% clipped and are correct: a white quartz photographed on white. §4n |
| D48 | 9 Aug | **The stone wheel opens on the UK's most popular stone and fans outward in popularity order** ⛔ **THE ORDERING HALF IS SUPERSEDED BY D85 — the wheel is alphabetical. The LANDING half survives** | Client: "the 11 stones that show are the UK's top 11 most popular choices, and the one that displays first must be the most popular of each stone." One table, `POPULAR` in index.html, and the estimator's default stone is derived through the same `landingIndex()` so the two can no longer drift. ⚠️ **"The eleven that show are the top eleven" is no longer true and cannot be** — the eleven on screen are now whatever sits either side of the landing card in the alphabet. The surviving rule is the landing card itself, subject to D85a's tone rule. Landing cards now: **Azul Shimmer** (quartz, the client's own pick, D84), **Calacatta Gold Oro Honed** (marble), **Bianco Antico** (granite). ⚠️ The ranking is evidenced from UK trade sources, **not TopCat's own sales data** — swap the lists the moment the client has real figures. §4m |
| D47 | 9 Aug | ⛔ **An orphaned marble.com harvest from a previous session had downloaded 542 files and was still running. Killed, and `raw/marbledotcom` deleted** | It started 21:01 from another session and survived into this one. It was missed by the first sweep because its command line runs Python from a heredoc and never contains the literal string `harvest.py`. **Nothing from it ever reached the site** (verified against the manifest), and marble.com is now `ok=False` in `harvest.py` per D45. ⚠️ When checking for stray jobs, grep for the working directory, not the script name. |
| D46 | 9 Aug | **Misterio Gold's colour data and blurb were WRONG and have been corrected against the supplier's photograph** ⚠️ client to read the new sentence | It was written as `dark / brown / statement` — "Deep warm veining on a darker ground" — before anyone had seen it. Next Stone's own photograph is a **pale cream** with fine gold veining. It was answering the "dark" filter and then showing a pale stone. Now `light / cream / calm`, preset `crema`, new blurb. Corrected in all three copies of the list. §4m |
| D45 | 9 Aug | ⛔ **marble.com is NOT used, and the ~2,535-stone harvest planned in the last handover was NOT run** | **Reverses the plan in the then-current START HERE (§3 of it), since superseded twice.** Two reasons. (1) `LICENSING.md`'s own test is that TopCat must **buy from** a source for its photography to be defensible; marble.com is a US countertop retailer TopCat has no account with, so it fails the same test that put Caesarstone and CRL on "ask first". (2) It was not needed — the licensed suppliers reached 47 of 52 once the pipeline's own bugs were fixed, and 4 of the 5 remaining stones are **engineered quartz**, where a same-named product from another maker is a *different product* and marble.com would be the wrong image under the right name. The cheap half is kept: `harvest/mdc_index.py` indexes all 2,363 names from ONE request if the client ever licenses it. §4m |
| D44 | 9 Aug | **Natural stone now carries a photograph too** ⚠️ **reverses the "natural stone keeps the drawn slab" rule** | The rule (written into `index.html` above `SLAB_TILES`) was that marble/granite/quartzite keep the drawing, because each block is unique and a stock photo becomes a promise about veining TopCat cannot keep. Client, 9 Aug, overriding: *"every single stone there in its actual pattern and image… so that there's no fucking mistakes"*, and earlier *"find an image of that exact slab for that exact name, then add that image"*. ⚠️ **The safeguard the old rule provided still has to come from the copy** — the site must keep saying a photograph is indicative and that the customer approves their ACTUAL slab before cutting. §4m |
| D43 | 9 Aug | **The page floor is a real PORTORO photograph — HAIRLINE veining only — under a tunable dark veil** | Client, over **six** passes: "it almost looks like just paintbrush strokes… low quality and blurry" → "I don't like the stone, the thick grey line looks bad, has to look like a stone everyone would love to buy, better veining" → "there should be some sort of dark transparent cover over it so the sections stand out more" → "the background shouldn't be too complicated so it doesn't distract" → **"background needs to be even darker"** → **"I also don't like the thick gold veining"**. ⛔ The last two are the binding ones: no thick vein of ANY colour, and darker than the old floor. §4l |
| D42 | 9 Aug | **The footer is cut to MAIN PAGES: two link columns, not five** | Client: "completely clean up the footer, it's way too big… you won't have to list everything out, you'll have those main pages. Services counts as one page." 931px → 411px, 31 links → 17. ⚠️ Materials, Guides and Areas each keep ONE hub link — read §4k before trimming further. §4k |
| D41 | 9 Aug | **The FAQ and the final CTA lose their dead vertical space** | Client: "move Answers set in stone closer up to the divider, there's too much space… and adjust the space on the final CTA as well." The FAQ was pinned to 100vh with its content centred, so 366px of a 900px box was empty. §4a |
| D40 | 9 Aug | ⛔ **NEVER a gold line across the top of a card or a section — anywhere, as a general rule.** The Why tiles take the review cards' black marble instead | Client, unprompted and general: "don't ever use that fingernail design on top of sections… give the cards the same black stone marble you have in the review cards, but faded so you can read the text." **This is now §2 rule 10.** §4i |
| D39 | 9 Aug | **The three owners are the TOP band of the About collage, the work photographs below** | Client: "the three owners must be on the top of the collage and then the team below." Reverses the order built earlier the same day. §4a |
| D38 | 9 Aug | **The About copy is bound to the collage's edges** | Client: "the title has to be in line with the top of the collage, and Chat with TopCat has to be aligned with the bottom." §4a |
| D37 | 9 Aug | **The nav bar's flash is 0.76s, not 0.58s** | Client: "slightly, slightly slower." §4h |
| D36 | 9 Aug | **The final CTA drops the "Call us" ghost button; the number is underlined in the left column instead** | **Partially reverses D30.** Client: "remove the call us button with the number and just underline the number on the reach out to us directly, and then everything just moves up with the what happens next, that's perfectly fine, we just need to balance out that section so there's not so much empty space." The "what happens next" strip STAYS. §4g |
| D35 | 9 Aug | **The Why reason tiles are designed, not grey blocks, and the feature slot takes a placeholder photograph** | Client: "we need to add some sort of design into the more reasons to choose us, we can't just have it grey blocks… where it says feature image, just add any image in there now so we can have it as a placeholder." §4i |
| D34 | 9 Aug | **The About team moves INSIDE the collage as three equal tiles; the copy is cut and gains a "Chat with TopCat" CTA** | **Supersedes the team-row placement in D11.** Client: "instead of having the people below with their names, we'll have the team members actually be inside the collage with their name and their role there, so three of those images can be the same size… and then on the other side it'll just be about us text and then a chat CTA, chat with TopCat." §4a |
| D33 | 9 Aug | **The nav bar's hairline FLASHES from the centre outwards as it forms** | Client: "the same thing as that divider where the shine goes across as you scroll, but start in the middle and go to the two sides quite quickly." §4h |
| D32 | 9 Aug | **"Let's bring your vision to life" under the reviews is a CTA** | Client: "a button below, or underline it and an arrow to make it clickable, or just something to make that a CTA." Built as an underlined gold link with an arrow, not a button. §4j |
| D31 | 7 Aug | **The helix cards' reverse is a REAL generated slab, not black marble** | Client, over three passes: "slightly too dark, make it a lighter card, some grey or faded white that fits the brand, I want those to stand out a bit more" → "let's not make it pure white" → "give it a stone design". It runs through the site's own `marble()` engine, preset calacatta, a different seed per card. §4e |
| D30 | 7 Aug | **The enquiry form gains a "what happens next" strip** | ⚠️ **HALF of this was reversed on 9 Aug by D36** — the "Call us" ghost button it also added is gone. The strip stays and is the thing filling the column. Original client wording: "add the call us directly button back below the send my enquiry, or maybe request a call, whatever you think is best, otherwise optimise that empty space". §4g |
| D29 | 7 Aug | **The FAQ is a grouped CONTENTS PAGE, four categories of three** | **Supersedes the FAQ half of D11.** Client: "now that we have so many questions we need to redesign that whole section", then "three in each category, either three or four, so it all looks even". §4a |
| D28 | 7 Aug | **The helix arrival is ~1.9s, not 1.16s** | Client: "a little bit too fast, it finishes before the user even reaches the end". Threshold also raised so it starts later. §4e |
| D27 | 7 Aug | **The services helix BUILDS as you arrive, one card at a time from the top** | Client: "form one by one from the top card, so you see the back, then the next one and the next one, almost animate in one by one semi quickly." Spatial order top → bottom. Pacing later slowed by D28. §4e |
| D26 | 7 Aug | **The Why mosaic is tied to the VIEW, not the scroll** | **Partially reverses D11.** Client: "make sure it always fully animates in and is not tied to the scroll, it's just tied to the view." ⚠️ About is still scroll-tied, deliberately. §4a and §4e |
| D25 | 7 Aug | **An HTML sitemap at `/sitemap.html`, linked from every footer** | Client's words: so the SEO build can be explored when needed. Generated, never hand-written. §4f |
| D24 | 7 Aug | **Track every decision and every reversal in this handover, and keep all SEO in the docs** | This section exists because of it |
| D23 | 7 Aug | **Kitchens lead, but the site is not kitchens-only** | Kitchens get the most focus and lead every title and H1. Bathrooms, vanity tops, splashbacks, outdoor, commercial, fireplaces and tables appear on every material and location page via the "Not only kitchens" block. Supersedes D22. |
| D21 | 7 Aug | **Fabrication is OUTSOURCED. Never claim in-house.** | **Reverses D6.** Client: "we don't do in house fabrication, do not talk about in house fabrication." See §2.1 and §4d. |
| D20 | 7 Aug | **Build the SEO content: 5 material, 9 guide, 9 location pages** | §4d and the SEO log |
| D19 | 7 Aug | **Porcelain is offered again, bespoke and enquiry-led only** | **Reverses D14.** Estimator tab is POA with `noCat:true`, plus a material page. Dekton and Neolith back in the brand strip. |
| D18 | 7 Aug | **Trade returns to the primary nav, as a dedicated page** | **Reverses D9.** B2B is the client's stated first priority. |
| D17 | 7 Aug | **The hero carries the place as a REGION, not a county list** | "across London and the Home Counties" |
| D16 | 7 Aug | **No hero eyebrow at all** | Client rejected even the shortened four-county version: naming four counties reads as a limit, not a promise |
| D15 | 6 Aug | **Estimator priced from the client's bracket table, marble and granite POA** | §6 |
| D13 | 6 Aug | **The 52-stone catalogue is the client's real range** | Not placeholder data. §5 |
| D12 | 6 Aug | **Estimator moved to sit directly after the stone showroom** | Pick the stone, then price it |
| D11 | 6 Aug | **About, Why, FAQ and contact redesigned** | FAQ approved as built. §4a |
| D10 | 1 Aug | **Nav reduced to six links, "Get a quote" promoted** | Trade later re-added by D18, so it is seven now |
| D8 | Jul | **Suppliers are never named publicly** | Nile Stone and Next Stone Slabs stay in the data, never rendered |
| D7 | Jul | **Never show the review count (~16)** | 5.0 rating only, no `aggregateRating` anywhere |
| D5 | Jul | **No physical showroom, ever** | Samples come to the customer, slabs approved from photographs |
| D4 | Jul | **Never signal a young or new company** | No founding year |
| D3 | Jul | **Value, not cheap** | No discount language. The supplier-discount claim stays off the site, see D2 |
| D2 | Jul | **"Best supplier discounts in the country" is INTERNAL ONLY** | Unverifiable and it argues on price. The client has re-sent it twice and it has stayed off both times |
| D1 | Jul | **Voice: quietly confident master** | British English, commas not em dashes, no exclamation marks |

### Reversed and superseded, kept for the record

| # | Date | Decision | What happened |
|---|---|---|---|
| D43c | 9 Aug | Page floor as Portoro with a bold gold vein network | ⛔ **QUIETENED same day.** Client: "the background shouldn't be too complicated so it doesn't distract", then "I also don't like the thick gold veining", then "needs to be even darker". The stone is right; the drama was not. Now hairlines only, on a darker veil. |
| D43b | 9 Aug | Page floor as a plain dark marble with one sweeping grey vein | ⛔ **REJECTED same day.** Client: "I don't like the stone, the thick grey line looks bad." ⚠️ The lesson generalises and was then confirmed a second time on the gold version: **a thick vein reads as a CRACK, not as a desirable slab, whatever colour it is.** Hairlines only. Applies to any stone imagery added anywhere on this site. |
| D43a | 9 Aug | Page floor as a hand-built SVG of blurred strokes | ⛔ **REPLACED by D43.** It was six `feGaussianBlur stdDeviation="52"` strokes stretched over the viewport, and it measured only 10 luminance levels wide with no detail above the blur — hence "paintbrush strokes… low quality and blurry". ⚠️ Several rounds were spent trying to rebuild it procedurally with `feTurbulence`; the tone could be matched exactly but not the *quality*, which is why it ended up a photograph. Do not re-attempt the procedural route without reading §4l first. |
| D35a | 9 Aug | The Why tiles dressed with a gold hairline seam across their top edge | ⛔ **REVERSED the same day by D40.** ⚠️ **This should never have been built.** "No bright band across the top of anything — that was tried and rejected outright" was ALREADY in the handover, in §6.5, about the estimator. It was read as an estimator note rather than a site rule, and the client had to reject the same idea twice. It is §2 rule 10 now, stated generally, so the next person does not have to infer it from a section they may never read. |
| D34a | 9 Aug | The three directors as the BOTTOM band of the About collage | ⛔ **REVERSED the same day by D39.** Built bottom-first that morning on the reasoning that the flip build should land on the people last; the client wanted them leading. ⚠️ Flipping the band means flipping the DOM too — DOM order IS build order (§4a). |
| D30a | 7 Aug | The enquiry form's second way in: a "Call us on 0800 098 2812" ghost button under the submit | ⛔ **REVERSED 9 Aug by D36.** It duplicated the number already in the left column, and the client's call was to carry it once, underlined, where it already lives. ⚠️ Note the shape of this: the button was added on 7 Aug *because the client asked for a call option there*, and removed on 9 Aug *by the same client seeing it built*. The requirement it answered — a second way in that is not the form — is now served by the underlined number. Do not re-add the button; if the need comes back, the conversation is about the left column. |
| D11c | 6 Aug | The team as a credit strip UNDER the story in the left column, "the people who look after your job" | ⛔ **SUPERSEDED 9 Aug by D34.** The people are inside the collage now. Client's read was that the collage was the half of the section that worked and the text side was the half that did not, so the people moved into the good half rather than sitting beside it. The rest of D11 stands. This also retired the `@media(max-height:840px)` block's "do not delete" note, which existed only because copy and people were in series in one column. |
| D11b | 6 Aug | The FAQ as a rail of questions with the answer panel beside it — "that's perfectly fine" | ⛔ **SUPERSEDED 7 Aug by D29.** It was approved at EIGHT questions and it worked there. Twelve broke it: the rail went to two columns, every row wrapped to two or three lines, and it read as a wall of text next to a mostly empty panel. **The approval was of a design at a size, not of the design forever.** The rest of D11 stands. |
| D11a | 6 Aug | The Why mosaic builds on SCROLL POSITION, same engine as About | ⛔ **REVERSED 7 Aug by D26.** Not a change of taste: the scroll-driven build could never finish on a screen tall enough to frame the whole section, so the last tiles sat permanently dim. The one-by-one motion the client asked for on 6 Aug is unchanged, only its clock. **The rest of D11 stands.** |
| D14 | 6 Aug | Porcelain NOT offered at all, hard rule, owner by phone | ⛔ **REVERSED 7 Aug by D19.** Note this had already reversed a July "we do it but don't advertise it" position. Porcelain has now flipped three times, so get it in writing before changing it again. |
| D22 | 7 Aug | Location URLs at `/kitchen-worktops/` | ⛔ **SUPERSEDED same day by D23.** Renamed to `/worktops/` because the business is not kitchens-only. No live URLs existed, so no redirects were needed. Renaming again after go-live would need 301s. |
| D9 | 1 Aug | Trade removed from the nav | ⛔ **REVERSED 7 Aug by D18** |
| D6 | Jul | Present fabrication as fully in-house | ⛔ **REVERSED 7 Aug by D21.** This one had itself overridden an earlier "never claim in-house" position, and the ASA risk was flagged and accepted at the time. Now settled the honest way. |

### Still waiting on the client

| Question | Raised | Status |
|---|---|---|
| ⭐ **Confirm the Bloom account, and that TopCat's Mirror range is Bloom's** | 11 Aug | ⭐ **Largely answered: the six Mirror stones are LIVE (D89)** — White, Cream, Grey, Brown, Blue and Black Mirror, from Bloom Stones London's own product pages under their own names. ⚠️ Two things still need Nick: **confirm the Bloom trade account** (same open licensing question as Caesarstone and CRL, §2a), and confirm these are the slabs TopCat actually sell as their best sellers. ⛔ Do not re-run the supplier search — it is finished and recorded in D89.
| ⭐ **Should Quartzite be a fourth range on the site?** 26 stones sold as Marble are quartzite, and one is travertine | 10 Aug | **Answered enough to ship, still open in principle.** The range is now labelled **Marble & Quartzite** and every stone names its own rock (D66), so nothing on the site misdescribes anything and the question is no longer urgent. A genuine fourth tab still costs nothing in price (both POA) but puts a fourth range on a site TopCat present as quartz/marble/granite. ⭐ **The groundwork is done** — `mat` is the key, the labels are two constants, and `kind` is already emitted per stone — so splitting it later is a small change. **TopCat's call. Worth asking Nick whether his customers ask for quartzite by name.** See D65, D66 |
| ⭐ **Upscale the ten CRL tiles, and harvest the four suppliers never touched** | 10 Aug | **Open, and both are small jobs.** The 14 dark quartz are live (D75), but CRL's ten ship at **625px** against the range's 1600, because 1280x625 is the largest frame CRL publish. They are sharp, just small, and want an upscale pass at about **6 credits** (four stones a job). ⛔ Separately, **four of the client's nine suppliers have never been harvested at all** — AKG, Bloom, Classic Quartz and **Cosentino/Silestone**. Silestone alone is likely to carry more dark quartz than everything added so far. See §2a for the list and the open licensing question on Caesarstone and CRL. |
| ⭐ **Should the range take on DARK QUARTZ? The suppliers list it and TopCat do not show it** | 10 Aug | **Asked by the client, answered with data, needs his decision.** He is right: **48 of the 50 quartz are light, 96%**, against 33% dark in marble and 55% in granite, and there is no black quartz at all. It is **not a supply fact** — the licensed suppliers publish at least six dark or mid quartz TopCat do not list, and two already **passed the pipeline's own gate**: ⭐ **Nero Starlight** (a near-black sparkle, 762px, would need upscaling) and **Grigio Shimmer** (a plain warm grey, 2130px, the best source of the lot, no upscale needed). **Marquina Shimmer** is a genuine black with white veining, rejected only for softness (2.3). Also available: Urban Concrete, Misterio Grey, and Calacatta Black Fusion (white with dramatic black veining, not a dark stone). ⚠️ **The cause is D54's cap**: quartz filled its 50 on Calacattas and whites, and the dark ones were never reached. ⛔ **Not added unilaterally** — the catalogue is what TopCat SELL (D13), not what the suppliers list, so adding needs Nick to confirm he can supply them. |
| **Read the 115 new stone descriptions.** They are colour and pattern only and were written from the tiles, but no human at TopCat has read them | 10 Aug | Unanswered. This replaces the old "63 carry generated copy" item, which is now resolved |
| Do the suppliers have better frames for Aqua Gucci, Verde Alpi and Arabescato Classico? | 10 Aug | Unanswered. All three faults are in the ORIGINAL photograph. Arabescato Classico's is sunlight on an installed worktop and no crop removes it entirely |
| Demote the hero's "Request a call" to a text link or the phone number | 4 times | Unanswered. Two co-equal buttons split intent, this is the biggest remaining hero gain. |
| Is the 1-slab-with-island bracket deliberate? | 6 Aug | Unanswered |
| Any brackets for vanity tops, fireplaces and tables? | 6 Aug | Unanswered, blocks §6.6 |
| Should 20mm vs 30mm change the price? | 6 Aug | Unanswered. It currently does not. |
| A 3-slab job: sales notes say £3k–£3.2k, the estimator says £3,850–£4,300 | 7 Aug | Probably VAT-inclusive vs ex-VAT. Two-minute check with Nick. |


---

## 0. START HERE

```bash
node "Website Demo/dev-server.js"      # → http://localhost:5501
```

**⚠️ There is no git.** This repo is a GitHub ZIP download, not a clone. Take a dated
`index.html.pre-*.bak` before any large edit — those backups are the only version control there is.

### Where the project is

**The site is now 35 indexable pages and ~33,400 words**, up from 9 pages. The desktop design is
essentially complete and the SEO content layer is built (§4d), with an HTML sitemap over the top
of it (§4f). What is missing is not design, it is **plumbing and photography**.

### The two things that actually block go-live

1. ⭐⭐ **The enquiry form has no backend, and it carries file uploads.** `buildEnquiry()` in the
   CTA IIFE assembles everything into a `FormData` and has nowhere to POST. This is bigger than it
   looks: the client was burned by a previous agency, their live site produced **one client in
   nine months**, and they will judge this engagement on **measurable leads**. There is currently
   nothing to measure. Netlify Forms with uploads is the obvious fit. §7.0.
2. **Real photography — ⭐ THE STONES ARE DONE, and as of the copy round their DESCRIPTIONS
   are too.** All **115 stones** carry a real supplier photograph and a description written from
   it. What is still invented is the **eight gallery projects** and the **four people/feature
   slots**, which are dashed placeholders. Nobody commits to a £3,000 surface off a generated
   pattern, and that argument now applies only to the project gallery. §7.3 and §7.5.

Behind those, **the estimator's product-type selector** (§6.6) is the last significant build job,
and it is blocked on Nick supplying brackets for anything other than kitchens.

### Verified at the end of the 9–10 Aug session (slab photography)

**52 of 52 stones carry a real supplier photograph**, up from 6 (⚠️ the range grew to **115** later that day, D54/D55b). Full reasoning in
`HANDOVER-2026-08-10-slab-photography-complete.md`; operational summary in
`HANDOVER-2026-08-10-photography-start-here.md`. Decisions **D44–D48**.

The headline is not that photographs were found. It is that **the images were already on disk and
the pipeline was throwing them away** — six collection bugs, five of them the same mistake: *a
measurement that condemns a stone for being what it is*. The scene gate rejected every black stone
because it counted deep-shadow pixels; the exposure gate rejected every pale plain stone for being
pale and plain. Of the 60 images the first gate refused, **49 were flat slab scans**.

⚠️ **Two wrong images were already live and were found by the guards built this session** — the
natural marble Calacatta Gold Oro was wearing Next Stone's *engineered quartz* "Calacatta Gold" via
an alias inherited as "confirmed by eye", and Carrara Shimmer was showing the wrong maker's product.
`match.py` now refuses both classes structurally.

**Not seen by the client yet.** Backup: `index.html.pre-slabs.bak`.

### Verified at the end of the 9 Aug session

**Thirteen changes over three rounds**, all client-asked (D32–D43, plus a re-confirmation of the
FAQ).
**None has been seen by the client in its finished state.** Backups, one per round:
`index.html.pre-about-rebuild.bak`, `index.html.pre-footer-cleanup.bak` and
`index.html.pre-background.bak`, plus a `.pre-footer.bak` beside each of the four builders.

⚠️ **The client DID steer the page floor live, over six messages, without seeing where it landed**
(§4l). Show that one first — every other change sits on top of it.

**Measured, not eyeballed.** Every section inside one screen at all five test sizes, and the page
got substantially shorter — four sections lost dead space rather than content:

| | 1366×610 | 1200×655 | 1512×824 | 1440×900 | 1920×1080 |
|---|---|---|---|---|---|
| About | 444 | 487 | 665 | 745 | 766 |
| Why | 489 | 520 | 655 | 709 | 827 |
| FAQ | 473 | 479 | 582 | 601 | 670 |
| Final CTA | 499 | 514 | 583 | 622 | 655 |
| Footer | 379 | 403 | 401 | 411 | 435 |

Where that came from, at 1440×900: the **FAQ 900 → 601** (it was pinned to 100vh with its content
centred, §4a), the **footer 931 → 411** (§4k), and the final CTA 646 → 622. The FAQ and the footer
were both *taller than the viewport* before.

**The About alignment is exact**: the title's top and the CTA's bottom each land within 0px of the
collage's edges at all five sizes (§4a). The three director names share a baseline at every size.
The CTA's two columns finish level at every size.

**The page floor** (§4l) measures median 9 / p90 12 / max 24 against the old floor's 13 / 16 / 19,
so it is darker than the site has ever had; measured thick-vein content is **0.0000%**; and all
five things that draw on `--marbleBG` were checked individually, including the scrolled nav glass
and the CTA card, which take the stone **without** the veil.

Inline JS parses (`node --check`), every `ld+json` block parses on the landing page **and** on a
sample of generated pages, **zero JS errors** from an instrumented copy walked top to bottom and
back with a FAQ question clicked, the upload disclosure toggled and the nav bar's `.scrolled` state
cycled. No horizontal scroll at 1920 / 1512 / 1440 / 1366 / 1200 / 375. Estimator still opens at
£2,000 – £2,500, FAQ still 12 rows. The About collage's `scrollSequence` still reaches its settled
state on all six tiles after the band swap, and all six tiles' images load.

**Sitewide after the footer cut and four builder re-runs: 3,393 internal links, 0 broken, 0
orphaned pages** across 89 non-V2 pages. All four go-live compliance scans clean — the only hits
are the two long-documented ones (the code comment recording the FAQPage removal, and the `sup:`
field in the stone data, which is never rendered).

### Verified at the end of the 7 Aug session

**4,185 internal links checked, 0 broken, 0 orphaned pages** (was 3,975 before the sitemap).
JSON-LD valid across all non-V2 pages. Inline JS parses (`node --check`). Zero JS errors captured
by an instrumented copy walked from top to bottom of the landing page with every rAF path pumped.
No horizontal scroll at 375px on every page type including the sitemap and the wide comparison
tables. All routes 200 including `/sitemap.html`. Estimator still opens at £2,000 – £2,500 with
four material tabs, FAQ still 12 rows, footer 6 columns, legal bar now four links.
Compliance scans clean under the **corrected** V2 filter (§2 rule 1): the only hits are the two
documented ones, a code comment in `index.html` recording the FAQPage removal, and the `sup:`
field in the stone data, which is never rendered.

**The builds, measured rather than eyeballed** (§4a, §4e): the Why mosaic reaches opacity 1.00 on
all six tiles at 1440×900, 1920×1080 and 1366×610, from the scroll position where the old engine
stalled the last tile at 0.82. The services helix arrives top-first over ~1.9s and its seated
state is byte-identical to before the entrance was added. All six card backs carry a generated
slab.

**The FAQ redesign** (§4a): four even columns of three; the plate holds ONE height across all
twelve answers at every size tested (1440×900 → 196px, 1366×610 → 164px, 1200×655 → 164px,
1512×824 → 199px, 1920×1080 → 216px, 900×900 → 176px) with no answer overflowing; Tab walks the
twelve, arrows step column-wise and Left/Right jump groups; the plate moves inline under the
picked question at one column.

**The enquiry form** (§4g): both columns finish level, and the section is 582px at 1366×610 after
the clamp-floor fix, against 647px before it.

Hero, About, Why, the FAQ and the contact card each still inside one screen at 1366×610,
1200×655, 1512×824, 1440×900 and 1920×1080.


## 1. What this is

A marketing site demo for **TopCat Worktops Ltd**, a real UK stone-worktop company (quartz, marble,
granite) serving **London, Hertfordshire, Essex and Berkshire**. They run paid ads from month one,
so everything has to convert and give a buyer no reason to hesitate.

| | Path | What it is |
|---|---|---|
| **V1** | `Website Demo/index.html` | The live single page, ~7,700 lines, one self-contained file with inline CSS and JS. **All active work happens here.** |
| ~~**V2**~~ | ⛔ **REMOVED 10 Aug 2026 (D87)** | The ~70-page rebuild, the `versions.html` chooser and `index-v2.html` are out of the site, moved to `.removed-2026-08-10-v2/` outside `Website Demo/`. The client asked for it gone completely. ⚠️ There is now only one version, so "non-V2 pages" in older measurements just means "pages". |

Generated sub-sites under V1: `services/` (6 pages), `stones/` (52 stone pages + collection),
`trade/`. Each has its own `build_*.py` — **edit the builder, never the generated HTML**.

---

## 2. ⭐ STANDING RULES — client decisions, do not break these

Also in `memory/topcat-copy-constraints.md`, loaded every session.

1. ⛔ **REVERSED 7 Aug 2026. Fabrication is OUTSOURCED and the site must NEVER claim in-house.**
   The client's decision, resolving a conflict open for several sessions: "we don't do in house
   fabrication, do not talk about in house fabrication." TopCat advise, source the slab,
   laser-template, place the cut with long-standing fabrication workshops, fit, and carry the ten
   year guarantee. **Templating, fitting and aftercare ARE theirs and may be claimed freely** —
   "fitted by our own team" is true and was deliberately kept. Cutting and polishing are not. The
   positioning that replaced it is *one contract, one contact, and we answer for all of it*, which
   is what buyers actually value and is entirely true.
   Scan before go-live, must return nothing:
   `grep -ril "our own workshop\|we cut\|in-house fabrication" --include="*.html" . | grep -Ev "(^|/)v2/"`
   ⚠️ **That filter was `grep -v "^./v2/"` until 7 Aug 2026 and it silently did nothing.** BSD
   grep on macOS prints `v2/faq.html`, not `./v2/faq.html`, so the anchored pattern never
   matched and every scan came back full of dormant V2 hits. Same fix applied to all the scans
   in the SEO log §8. If you copy a scan from an older doc, check its filter first.
   ⭐ **This risk is closed as of 10 Aug 2026 (D87): V2 has been removed from the site entirely.**
   It was never rewritten and still carries the old in-house-fabrication claims, which is why it
   was one revival away from publishing them. It now sits outside `Website Demo/` and cannot be
   deployed. ⛔ If it is ever brought back, rewrite those claims BEFORE it goes anywhere near a
   server. The scans' `v2/` filters are now redundant but harmless.
   Full detail in `HANDOVER-2026-08-07-seo-build.md` §1.
2. **No physical showroom, ever.** "Showroom" means the online experience. In person means a free
   home visit with samples; slab approval is from photographs of the customer's actual slab.
3. **Never signal young or new.** No founding year, no "est. 2024". Lead on craft and experience.
4. **Never show the review count** (~16). Show the 5.0 rating and the testimonials. No
   `reviewCount` or `aggregateRating` in schema anywhere.
   ⚠️ **This was being broken.** The landing page JSON-LD carried `aggregateRating` with
   `"reviewCount": "16"`, publishing the count to Google. Removed 7 Aug 2026. It produced
   nothing anyway, Google makes self-reviewed star markup ineligible. Re-scan before go-live.
5. **Value, not cheap.** No discount language. ⚠️ This is the rule that keeps biting — see §4b for
   the supplier-discount claim the client keeps sending and why it stays off the page.
6. **Voice:** quietly confident master. Plain, exact, warm, British English. **No exclamation
   marks, commas not em dashes.** No AI-tell words.
7. **Service area:** London, Hertfordshire, Essex and Berkshire, plus nationwide templating.
   ⚠️ **But do not print the county list as a hero strip** — see §4b, the client rejected exactly
   that because four named counties reads as a limit rather than a promise.
8. **PORCELAIN — status reversed twice, current position (client, 7 Aug 2026): OFFERED again,
   bespoke and enquiry-led only.** July: "we do it but don't advertise it". 6 Aug: banned outright
   by the owner and stripped from V1 and V2, Dekton and Neolith pulled from the brand strip.
   **7 Aug: the client reinstated it as a made-to-order, enquiry-led service (no calculator, PDF
   or photo upload).** So porcelain, Dekton and Neolith are back, and `/materials/porcelain-worktops.html`
   now exists. ⚠️ Do NOT invent porcelain slab names or add porcelain to the stone wheel, there is
   no supplied range, which is why the estimator tab carries `noCat:true`. Owner sign-off came via
   the client rather than a second call, so treat as confirmed but noted.
9. ⛔ **The suppliers' names never appear publicly.** Nile Stone and Next Stone Slabs are the
   client's own trade sources; printing them hands a competitor his buying list. `sup` stays in the
   data, but every public surface shows **finish** instead.
10. ⛔ **NEVER a bright or gold line across the TOP of a card or a section.** Client's own words,
    9 Aug 2026, given as a general rule: *"Don't ever use that fingernail design on top of
    sections."* No top hairline, no lit seam, no bright band, on any card, tile, panel or section
    edge, anywhere on the site.
    ⚠️ **This was already the rule and it still got broken.** It lived in §6.5 as an estimator
    note — "⛔ No bright band across the top of anything, that was tried and rejected outright" —
    and on 9 Aug a gold seam was added to the Why tiles anyway, because a rule filed under one
    section reads as being about that section. The client rejected the same idea a second time.
    **It is stated here, generally, so nobody has to infer it from a section they may never read.**
    What to use instead when a card needs to stop looking flat: the site's own stone
    (`marbleSVG()`) veiled back, which is what the review cards and now the Why tiles do (§4i).
11. ⛔ **EVERY MEASUREMENT ON THE SITE IS IN MILLIMETRES.** Client, 10 Aug 2026: "every slab has
    to show in millimetres, every measurement has to be in millimetres." ⚠️ The one deliberate
    exception is the estimator's **linear metres** of edge profile, which is a PRICING unit.
    Scan before go-live, must return nothing outside `v2/`:
    `grep -rlE "[0-9]+ ?cm\b" --include="*.html" . | grep -Ev "(^|/)v2/"`
12. ⛔ **NEVER STATE SOMETHING WE CANNOT GUARANTEE, AND NEVER USE AN ABSOLUTE.** Client, 10 Aug
    2026, on finding "the pattern is consistent across the slab" live: "You cannot say that
    something is consistent when it's not. Don't say things that you cannot guarantee. Be more
    vague." ⚠️ **Comparatives are safe, absolutes are not** — "varies less than quarried stone"
    is defensible, "consistent" is not. Enforced by `harvest/verify.py` check 7, which fails the
    build. It had 355 hits when it was written. ⚠️ This is the same family as rule 1: "we
    vein-match every joint by hand" was BOTH an unkeepable promise AND a claim to fabrication.
13. ⛔ **A STONE IS ALWAYS CALLED WHAT IT IS. THE RANGE AROUND IT IS NAMED FOR WHAT IT CONTAINS.**
    Client, 10 Aug 2026: "on the collection page it shows marble, but on the actual page it says
    quartzite… we cannot have that confusion." ⚠️ **The fix is never to soften the stone's name
    to match a category.** 26 of the marble range are quartzite and one is travertine; calling
    any of them marble is a misdescription, and it attaches marble's care copy — etches with
    acid, softer — to a stone that does neither. The range is labelled **Marble & Quartzite**
    instead: `RANGE_LABEL` in `stones/build_stones.py` and `MAT_LABEL` in `index.html`, and
    those two constants are the only place the wording lives.
    ⛔ **`mat` is the pricing key and is never changed to fix a wording problem.** §4p, D66.
14. ⛔ **THE LOGO IS THE CLIENT'S ARTWORK AND IS NEVER RE-DRAWN.** Client, 10 Aug 2026, on the
    version that had been live: *"the one we currently have on the site is very wrong."* The
    files live in `Website Demo/assets/brand/` and every surface references one of them.
    ⚠️ **The failure this replaces was not a bad drawing, it was a drawing at all** — the mark
    was hand-built inline SVG and the wordmark was live text, so it could never be more than an
    approximation and it could drift on a font fallback. If the logo needs to change, replace
    the file. ⛔ Never paste path data into a template, a builder or a `<head>`.
    ⛔ **Set HEIGHT only.** Width follows the intrinsic ratio; setting both squashes the lockup,
    and at nav size that reads as a subtly wrong logo rather than an obviously broken one.
    §4q, D69, and `assets/brand/README.md`.
15. ⛔ **ONE DEVICE AT A TIME. DESKTOP IS FROZEN AND ONLY THE CLIENT UNFREEZES IT.** Client,
    11 Aug 2026: "when I say let's do mobile, then we only work on mobile. Everything else stays
    exactly as it is on the other devices." Desktop design is closed as of D90; mobile is the
    current scope, tablet comes after, and the client says when each begins.
    ⛔ **A mobile change goes inside a width-scoped media query, never into a base rule.**
    `index.html` is one file with inline CSS, so almost every rule is unscoped and applies at
    every width — "fixing it on mobile" by editing the base rule silently changes the desktop
    the client has just frozen. ⚠️ Check which existing breakpoint governs before adding a new
    one, and prefer `max-width` blocks so desktop keeps the untouched base. ⚠️ A
    `max-width:900px` block catches TABLET too, which is not in scope while mobile is. D91.

---

## 2a. ⭐ THE SUPPLIER LIST — the client's own, sent 10 Aug 2026

⚠️ **Keep this list here. The client sent it explicitly and asked that it live in the handover.**
It is the answer to "where does more range come from", and the reason the dark quartz exists.

| Supplier | URL | Status |
|---|---|---|
| **Nile Stone** | https://www.nilestone.co.uk/quartz-surfaces | ⭐ **Licensed.** TopCat buy here. 413 + 746 images harvested |
| **Next Stone Slabs** | https://nextstoneslabs.co.uk/quartz/ | ⭐ **Licensed.** TopCat buy here. 141 images harvested |
| **Caesarstone** | https://www.caesarstone.co.uk/ | ⚠️ 176 images harvested, **4 stones now live**. Account not confirmed |
| **CRL Stone** | https://crlstone.co.uk/ | ⚠️ 261 images harvested, **10 stones now live**. Account not confirmed |
| **Noble Stone UK** | https://noblestone.uk/ | 48 images harvested, all white marble-effect, **nothing dark** |
| **Cosentino / Silestone** | https://www.cosentino.com/en-gb/silestone/ | ⛔ **NEVER HARVESTED.** ⭐ The best remaining source of dark |
| **Classic Quartz** | https://www.classicquartzstone.com/ | ⛔ **NEVER HARVESTED** |
| **AKG Surfaces** | https://akgsurfaces.co.uk/ | ⛔ **NEVER HARVESTED** (empty folder exists) |
| **Bloom Stones London** | https://www.bloomstoneslondon.com/ | ⛔ **NEVER HARVESTED** (empty folder exists) |
| **Fugen Stone** | https://fugenstone.co.uk/ | ⛔ **NEVER HARVESTED** (empty folder exists) |

⛔ **FOUR OF THESE HAVE NEVER BEEN HARVESTED AT ALL** and that is where the next batch of range
comes from. It is a harvest run, not a research problem. **Silestone especially** is likely to
carry more dark quartz than everything currently added put together.

⚠️ **The licensing question is open on Caesarstone and CRL and must be closed before go-live.**
`LICENSING.md`'s test is that TopCat must **buy from** a source for its photography to be
defensible (D45). The client instructed these directly and supplied the links himself, so the
work proceeded — but confirm the accounts or get written permission. ⛔ This is a business risk,
not a code risk, and no scan will catch it. Suppliers are still never named publicly (D8).

---

## 3. Real business facts

- **Phone** 0800 098 2812 (`tel:+448000982812`), Mon–Fri 8am–6pm. **Email**
  info@topcatworktops.co.uk (NOT hello@). ✅ The last `hello@`, in the homepage JSON-LD, was fixed
  7 Aug 2026, along with `areaServed`, which had listed only Hertfordshire towns and now names the
  four counties.
- **No public address.** Home visits only.
- **Team:** Nick (Managing Director, front of house, naming him is approved), Rimsha (Operations
  Director), Ali (Sales Consultant). "Founded by three lifelong friends." All three are named on
  the page, in the About team row.
- **Guarantee** ten years. **Lead time** ~3–5 working days. Reviews are real, 5.0 on Google.
- **Tagline** "Surfaces worth building around" (the live site's price-led one was dropped).
- ⚠️ **Checkatrade rating is UNVERIFIED** and was removed. Confirm the real platform and figure
  before it ever returns.

### The owner's four differentiators, as he sent them

Worth having in full, because three of them are now the hero's three reasons (§4b):

1. **Customer service** — second to none.
2. **Supplier relationships** — "no one gets better discounts than us anywhere in the country".
   ⛔ **INTERNAL ONLY. Never on the site.** Unverifiable, and it argues on price, which breaks rule
   5. It surfaces as the number at quote stage instead.
3. **Above and beyond** — all cut-outs free (plug, sink, tap), pencil edging as standard so
   children are safe around sharp corners, and sink/drainer grooves as standard.
4. **Aftercare** — every kitchen is handcrafted so slight adjustments happen; others make you wait
   a month or more once they have been paid, and TopCat have never taken more than **72 hours**,
   completely free of charge.

---

## 4. Section order and the layout system (V1)

hero → reviews → services → gallery → **stones → brand strip → estimator** → process → about →
why → faq → cta → trade prompt → footer

⚠️ **The estimator moved on 6 Aug** to sit directly after the stone showroom: you pick your stone,
then you price it. Two consequences, both deliberate:
- The **brand strip stayed with the stones** and is now the stones → estimator boundary, not
  stones → process. It is stone content, so it belongs there. A plain `.section-divider` carries
  estimator → process.
- The old "estimator and Why read as one block, so no divider between them" rule is **dead** — the
  client said they are not one section. About → Why now takes that divider. Seven dividers.

**Layout rules that are load-bearing** (full detail in the archive §5a):

- **Everything is normal flow.** No pinning, no sticky, no runways, no cross-section overlays. The
  old hold/arrival choreography was stripped out and must not come back. The About and Why builds
  (§4a) are scroll-tied but stay entirely within this rule.
- **The clamp-floor rule.** Every vertical measure must keep shrinking on a short window. A
  `clamp()` whose floor is in px stops responding the moment the screen is short enough to hit it,
  which is exactly the screen with no height to spare. Pick floors small enough that the **vh term
  still governs at ~610px of viewport height**.
  - ⚠️ It applies to more than padding: a `max-width` that sets height (`.at-shot`) needs the same
    treatment, and **display type must be capped against vh as well as vw** —
    `clamp(24px,min(3.1vw,4.6vh),42px)`.
  - Violations were found by accident rather than by a sweep (`#cta` padding, `.cta-title`,
    `.cta-line`). **Assume there are more.** Check the floor whenever you touch a clamp. §7.8.
- **One full-bleed background** (`body::before`). No section gets its own marble. Marble on framed
  **cards** is fine, and that exception is what the estimator's stone wash and the FAQ answer panel
  rely on.
- **Every section fits one screen** (the estimator is the standing exception, §7.7). Test at
  **1366×610** and **1200×655**, not just 1440×900. ⚠️ **And at 1512×824** — the Why section's
  compression breakpoint was `max-height:820px`, so a MacBook at 824 fell straight through the gap
  and got tall-screen spacing on a screen with 7px to spare. It is 845 now.

---

## 4a. ⭐ About, Why, FAQ and the contact block — 6 Aug, with About rebuilt again 9 Aug

The client's brief, in their words: the About images should build **"flipping off each other"** as
you scroll; the Why reasons should come **"up one by one out of the abyss from the back and setting
up in the front"**; the team belongs in About, not in Why; the FAQ was **"very basic… in the middle
and text heavy, there's nothing interesting about it"**; and the contact block had **"too much
empty space on the left side, and the right side is too busy"**.

All four were reviewed once by the client. **About and Why were sent back** — the animation was too
quick to notice and the Why layout did not read — and the below are the corrected versions.
**The FAQ was approved as built** ("that's perfectly fine").

### `scrollSequence()` and `viewSequence()` — TWO engines, one contract

⚠️ **Updated 7 Aug 2026 (D26). They used to be one engine. Read this before moving a block
between them.**

Both take `(host, tiles, apply, opts)` and both call `apply(el, e, i)` with that tile's own eased
0→1, so a block can be swapped from one to the other without touching its `apply()`. The only
difference is **what drives `e`**:

| | `scrollSequence` | `viewSequence` |
|---|---|---|
| clock | scroll **position** | elapsed **time** |
| used by | **About** | **Why**, and the services helix has its own copy of the idea (§4e) |
| scrolling back up | unwinds | stays built |
| damping | yes, a playhead that TRAILS the wheel | not applicable |
| ⚠️ can it fail to finish? | **yes** — see below | no |

**`scrollSequence`** reads a progress figure off the block's own travel through the viewport,
gives each tile a staggered slice of it, and puts a **damped playhead** between the two so the
build TRAILS the scroll by a beat. The client asked for a slide lag, not a scrubber welded to the
wheel.

⚠️ **Its failure mode, which is what cost the Why mosaic.** Progress only reaches 1 once the
block's top has climbed to `END·vh`, near the top of the screen. If the section is built to fit
ONE screen, a visitor who frames the whole section, head and all, never scrolls the block that
high — and the taller their window, the sooner the section is framed and the worse it gets.
Measured at 1920×1080 with the Why section framed: the mosaic's top sat at 0.259vh against an
END of 0.10, progress reached 0.81, and the last tile finished at **0.82 opacity**. That is
exactly what the client screenshotted.

**About is unaffected and was checked, not assumed.** Its collage sits high in its own section, so
with the About section framed the collage top is at 0.12vh, progress reaches 0.89, and the last
tile's opacity ramp (`e*2.1`) saturates at 1. Verified at both 1080 and 610 viewport heights.
**So About keeps the scroll lag the client explicitly asked for. Do not "fix" it.**

**Before moving any block onto `scrollSequence`, do this sum:** measure the block's top as a
fraction of vh with its section framed, and check it is below `END`. If it is not, the build will
never finish and you want `viewSequence`.

**`viewSequence`** fires once from an IntersectionObserver at 0.2 of the block's own area, runs a
plain timeline, and disconnects. `dur` is one tile's own travel in ms, `gap` the ms between one
tile starting and the next. It does **not** replay on the way back up: "tied to the view" means it
arrives when you get there and then it is simply built.

- ⚠️ **It is normal flow.** No pin, no sticky, no runway, no overlay. This is not the choreography
  that was stripped out, and it is **not** the scroll-tied treatment the client killed in the
  PROCESS section — that was that section's whole centrepiece, and the standing rule that nothing
  in `#process` may be tied to scroll position still holds.
- ⚠️ **Tiles it drives must not also be `.rise`.** That class pins `opacity:0` until its own
  observer fires and fights the opacity written every frame. Both mosaics had `.rise` removed.
- `tick()` runs **once synchronously** at setup, or the tiles paint fully formed for one frame.
- The first read **snaps** rather than eases, so a page loaded below the section is already built.
- The rAF only runs while an IntersectionObserver says the block is near the screen.

**Pacing.** Slowed on the client's review ("delay that animation a little bit more, so it's
visually obvious as the user scrolls" — About; "just slight" — Why). Both pass explicit opts.
The two engines take different knobs:

| About — `scrollSequence` | | Why — `viewSequence` | |
|---|---|---|---|
| `start` → `end` | 0.94 → 0.02 (0.92vh of scroll) | `dur` — one tile's own travel | 620ms |
| `span` — one tile's own travel | 0.42 | `gap` — between one tile and the next | 175ms |
| `step` — gap between tiles | 0.112 | `threshold` — how much must be on screen | 0.2 |
| `scrub` — damping, lower is laggier | 0.062 | total for six tiles | ~1.5s |

- ⚠️ **About only: `5*step + span` must stay under 1**, or the sixth tile never finishes inside
  the block's travel and the mosaic is permanently one tile short. `viewSequence` has no
  equivalent bound, because time does not run out.
- ⚠️ **About only: don't push `start` far past 1.0** to slow it further. Progress starts when the
  block's top crosses `start·vh`, so a high `start` means the first tiles are most of the way
  built before the mosaic is on screen at all, which is the opposite of what was asked for.
  Lengthen the window at the `end` side instead.
- Opacity saturates before the motion does (About ramps `e*2.1`, Why uses `e²`), so a tile reading
  as solid may still be moving. **Judge the pace by eye, not by an opacity readout.**
- ⚠️ **You cannot judge either build from the Browser pane.** It runs with
  `document.visibilityState === 'hidden'`, so rAF is fully paused and a time-driven build simply
  never advances between tool calls. The method that works, and the one that verified this
  session: copy the page, insert a shim above `</head>` that replaces `requestAnimationFrame`
  with a queue plus a `window.__pump(t)` that drains it at a timestamp you choose, then step the
  timeline by hand and read the tiles after each step. Delete the copy afterwards. §8.

### About — ⭐ REBUILT 9 Aug (D34): the people are in the collage now

**Client:** *"We need to design that better. I just don't think the text side of the about us
section looks good, I like the images side, that looks good. Instead of having the people below
with their names, we'll have the team members actually be inside the collage with their name and
their role there. So three of those images can be the same size, and then the rest will be a
collage of the team, but they all need to fit within the collage. And then on the other side it'll
just be about us text and then a chat CTA, chat with TopCat."*

**The diagnosis matters more than the fix:** the client liked the collage and disliked the column
beside it. So the answer was not to redesign the collage, it was to move the good thing's territory
outward — the people went *into* the composition that was working, and the column that was not
working lost two thirds of its content.

- **The copy is two paragraphs, down from three** (~198 words to ~122). Nothing load-bearing came
  out: the D21-safe wording is intact ("place the cut with **workshops**", never in-house), and
  "Ask for Nick" now closes the second paragraph instead of owning a third.
- **The column ends on one gold CTA, "Chat with TopCat"**, left-aligned. Left, not centred: it is
  a column of prose and a centred button in it reads as a stray.
- ⭐ **The title and the CTA are bound to the collage's edges (D38).** "About us" sits exactly on
  the collage's top edge and "Chat with TopCat" exactly on its bottom edge, measured to 0px at
  every size. Three things do it together and all three are needed: `align-items:stretch` on the
  wrap, `.about-copy` as a flex **column**, and `margin-top:auto` on `.about-cta`. The collage is
  `align-self:start` so the row's top edge IS its top edge.
  - ⚠️ `.about-cta` also needs `display:flex`. `.rev-cta-primary` sets no display of its own, so
    as a bare inline `<a>` its 15px vertical padding spilled out of the line box and the button
    hung **12.5px below** the collage. Everywhere else these buttons already sit in a flex row,
    which is why it had never shown up before.
  - ⚠️ **If the copy ever grows taller than the collage, the bottom alignment breaks** (the top
    one survives). There is simply no slack left for `auto` to eat. Watch it if anyone lengthens
    this copy.
- **The collage is SIX ROWS, three columns**, `"p1 p2 p3" ×3 / "w1 w1 w2" / "w1 w1 w3" ×2`.
  ⚠️ **The three directors are the TOP band (D39), the work photographs below.** They were built
  the other way round earlier the same day and the client flipped them.
  **Flipping the band means flipping the DOM as well** — DOM order is build order — and the
  `HINGE` array is indexed by DOM position, so that had to be re-dealt too. Areas are named
  `p1..p3` / `w1..w3` rather than `a..f` precisely because letters stopped matching reading order
  the moment the bands swapped.
  The three directors are three **identical** 1:2 tiles. ⚠️ Equal is the point: three people at
  three sizes is a hierarchy nobody asked for. Below them the work — one big square, a short
  landscape, a portrait.
- **The portraits take a triptych hinge**: the left one swings off its left edge, the middle falls
  off its top, the right one swings off its right edge, so the row opens outward from the centre.
- ⚠️ **Still SIX tiles.** `scrollSequence`'s bound is `5*step + span < 1` and it is currently at
  0.98. A seventh tile breaks the build permanently, one tile short. See below.
- The tiles still hinge off their own **edges**, top to bottom, and the three portraits inherit the
  d/e/f hinges — left edge, top edge, right edge — which opens them outward like a triptych.
  `perspective:1250px` on `.about-collage` is what makes a rotation read as a panel swinging.
- **Three work photographs, not six**: handshake (big square), samples (short landscape), fitting
  (portrait). Read in order they are the job — we meet you, we help you choose, we fit it.
  ⚠️ The two that came out were **"One of our stone masons"** and **"Polishing an edge by hand"**,
  which were the last images on the landing page implying in-house fabrication after the D21
  rewrite. **Do not put them back.** Fitting is genuinely theirs and is safe to show.
- ⚠️ **The three portraits are PLACEHOLDERS and are deliberately not filled with stock faces.** A
  real name against someone else's photograph is a lie the page cannot afford. The plate is built
  at its finished size, so the shoot lands as an `<img>` dropped in above the `figcaption` and
  nothing else moves. Do not restyle the tile to suit the placeholder.
- ⚠️ **`.acp-role` reserves TWO LINES with `min-height`, used or not.** "Operations Director" wraps
  at every size; without the reservation Rimsha's plate grows a line taller than the other two and
  her name sits visibly above Nick's and Ali's. That is the same ragged-baseline fault the old
  credit strip had, just moved into the collage. Tracking is `0.12em`, not the 0.16em the other
  eyebrows use, for the same reason it always was.
- ⚠️ **Everything inside a portrait tile is sized off `--sideW`, never `vw`.** The collage is capped
  by the viewport's HEIGHT as well as its width, so on a wide short laptop the tiles are narrow
  while vw is large. Keyed to vw, the medallion came out **84px inside an 87px tile** at 1366×610.
  `--sideW` is the only measure that knows how big the tiles actually are. Same family of trap as
  the display-type-vs-vh rule in §4.
- **`.about-wrap` is ONE row again**, `"copy collage"`. The two-row grid, the `.about-team` block
  and every `.at-*` class are gone. `--sideW`'s height budget relaxed from `100vh - 250px` to
  `100vh - 210px`, which is what pays for the portraits being legible.
- ⚠️ **The `@media(max-height:840px)` block used to carry a "do not delete" and no longer does.**
  It was load-bearing for one specific reason — copy and people in series in one column — and that
  reason left with the credit strip. What remains of it is the copy-measure rule, which was always
  about the copy: 52ch is right on a tall screen and three wasted lines on a wide short one.

### Why — a tile mosaic that reads in rows

- ⚠️ **Driven by `viewSequence`, NOT `scrollSequence` (client, 7 Aug, D26).** The motion is
  unchanged; only the clock is. Putting it back on the scroll reintroduces a build that cannot
  finish on a screen tall enough to frame the section, which is the bug the client reported.
- The tall feature image and the bulleted list are **gone**. Tiles arrive from **depth**
  (`translateZ(-640px)` → 0) rather than flipping — same `apply()` shape as About, different body.
  ⚠️ Opacity is **e², not e**: a tile 500px back at half brightness reads as a flat card fading in,
  and holding it dark until it is nearly home is what makes the distance read.
- ⚠️ **THE LAYOUT WAS REJECTED ONCE ALREADY — read this before changing it again.** The first
  version was a 3×3 (`"p p a" / "p p b" / "c d e"`), with 01 and 02 stacked down the right and 03
  to 05 along the bottom. The client's words: *"having one and two stacked on top of each other and
  then three, four, and five from the side doesn't really look nice or work nicely."* It is now
  **twelve columns, two rows**, with the photo taking a three-column block down the **left** (About
  puts its images on the right, so this mirrors it) and the reasons running in plain rows beside it:
  ```
  "p p p a a a a a b b b b"     01 wide, 02 narrower
  "p p p c c c d d d e e e"     03, 04, 05 in equal thirds
  ```
  **The non-negotiable is the path: left to right, top to bottom.** Sizes may vary — that is what
  stops it reading as a plain card grid — but a reader must never have to work out where to look
  next. The client has now rejected two separate layouts on exactly that ground; the other was the
  process section's ashlar interlock, in the archive.
- The breakpoints keep the rows: 6 columns at ≤1000px (photo over the top, then 2-up, then 3-up),
  one column at ≤620px.
- **The photo is optional here.** The client said so directly, and the section would survive as
  five tiles in a 3+2 if the feature shot never arrives.
- The reasons carry **numerals 01–05**. Not a ranking, just the order. With the row layout they are
  belt and braces, so swapping them back for the old gold diamond is a one-line change.
- The section has a normal centred `.section-head`, so the **nav FIT map entry** is
  `['#why .section-head','#why .why-mosaic']`.
- Dead classes removed site-wide: `why-wrap`, `why-feature`, `why-body`, `why-lead`, `why-list`,
  `why-people`, `why-person`.

### ⭐ FAQ and final CTA — the dead vertical space, removed 9 Aug (D41)

**Client:** *"Move Answers set in stone closer up to the divider between More reasons to choose us
and it, because there's too much space. And adjust the space on the final CTA as well."*

**What it actually was.** `#faq#faq` carried `min-height:100vh` with `justify-content:center`, the
last trace of the sticky sheet the FAQ used to arrive on. At 1440×900 that put a **534px
composition inside a 900px box — 207px of empty space above it and 159px below**. The comment
above it described "a full-height marble panel with the slab stack centred in it", but the panel
had already gone: this section has no background of its own, because the one full-bleed marble on
`body::before` is the rule (§4). The height was buying literally nothing.

| | before | after |
|---|---|---|
| divider → FAQ title | 261px | 85px |
| FAQ section height | 900px (= exactly 100vh at every size) | 601px |
| FAQ foot → CTA card | 213px | 90px |

- ⚠️ Its `padding-top` was `clamp(88px,9vh,116px)`. At 610px of viewport 9vh is 55px, so the
  **88px floor won on exactly the screen with no room** — a clamp-floor violation of the kind
  §7.8 keeps predicting. Now `clamp(20px,3.4vh,52px)`, vh-governed all the way down.
- `#cta`'s padding came down with it, from `clamp(26px,6vh,86px)` to `clamp(18px,4.2vh,64px)`.
  Nothing was wrong with it in isolation; it looked loose next to a FAQ that had just lost 300px.
- ⚠️ **A section being exactly 100vh at every screen size is a smell, not a coincidence.** Three
  other sections still carry `min-height:100vh` — `#reviews`, `#services` and `#process`. Those
  three are genuinely full-screen compositions, so they are fine, but if any of them ever look
  top-heavy this is the first thing to measure.

### FAQ — a grouped contents page ⭐ REDESIGNED 7 Aug (D29, supersedes D11b)

**Client:** *"Now that we have so many questions, we need to redesign that whole section. It has
to be incredible, immaculate, fit with the rest of the design."* Then, on the first version:
*"Three in each category, either three or four, so it all looks even and nicely spaced."*

**What was wrong.** The previous design was approved at EIGHT questions and worked there. Twelve
broke it: the rail split into two columns, every row wrapped to two or three lines, and the
section read as a wall of text beside a panel that was mostly empty. **Nothing was wrong with
the old design except the number of questions**, which is worth remembering before treating any
approval as permanent.

**The three moves that fix it, in order of how much they matter:**

1. **The twelve are GROUPED into four named columns of three.** Four chunks of three is a set a
   reader can hold; twelve equals is not. This is the whole idea, the rest is detail.
   ⚠️ **The groups must stay EVEN** — the client asked for that explicitly after seeing a
   2/3/3/4 version, where the short first column read as a mistake. A thirteenth question means
   going to four rows in *every* group, not five in one.
2. **Each row shows a SHORT LABEL, not the question.** `What it costs`, not *How much does a
   stone worktop cost?* One line per row is what makes the eye run down a column instead of
   reading paragraphs. ⚠️ `.faq-qt` is `white-space:nowrap` with an ellipsis, deliberately —
   keep labels under about 22 characters. The full question is on the plate and is the button's
   `aria-label`, so nothing is lost.
3. **The plate moved from BESIDE the index to BENEATH it, full width.** A two-sentence answer in
   a tall narrow column is mostly air. Wide and shallow fits what is actually in it.

**The groups**, and why each question sits where it does:

| Group | Rows |
|---|---|
| Price and guarantee | What it costs · Hidden costs · Our guarantee |
| How it works | How long it takes · Who comes to your home · Where we work |
| Your stone | Choosing your stone · Matching your slab · Porcelain and sintered |
| Living with it | Seams and joints · Hot pans and heat · Silica and safety |

The aftercare question ("what happens if something is not right after fitting") sits under
**Price and guarantee** rather than Living with it. That is what balanced the groups to 3/3/3/3,
and it is honest: the answer is about coming back free of charge and the ten year guarantee,
which is a commercial promise, not a maintenance tip.

- ⚠️ **`FAQS` array order IS the page order.** The index fills the columns in array order, so
  entries sharing a `g` must stay contiguous and in the order they should read down their
  column. Reordering the array reorders the page.
- ⚠️ **The vertical rules between columns need `align-items:stretch`.** A rule on a
  start-aligned group stops at its last row. Belt and braces now the groups are even, but it is
  what stops the index looking broken if one ever ends up a row short.

**⭐ THE RULE THAT SURVIVES ALL FOUR VERSIONS OF THIS SECTION: nothing moves when you pick a
question.** It is now enforced differently, and better:

- The plate's height is **MEASURED, not guessed**. `lockPlate()` collapses it, runs all twelve
  answers through it, keeps the tallest and pins it. It re-runs on `fonts.ready` (a height
  measured in the fallback font is the wrong height) and on resize, debounced.
- ⚠️ **This replaced a hand-picked `min-height` clamp, which was out by 11px at 1366×610** and
  made the section jump. How tall an answer renders depends on the viewport width, the font size
  at that width and where the lines happen to break — nobody can hold that in their head, and
  the next person to edit an answer would not think to re-check it. The CSS clamp is still there
  as the pre-JS fallback only.
- Verified stable across all twelve at 1440×900 (196px), 1366×610 (164px), 1920×1080 (216px) and
  900×900 (176px), with no answer overflowing.

**Accessibility — ⚠️ the pattern CHANGED and the reason matters.** It was a `role="tablist"`
with a roving tabindex. That was right for a flat rail of eight. It is wrong now: the questions
sit under four real headings, which makes this a table of contents, and **a tablist whose
children include headings is invalid ARIA**. So each question is now a plain `<button>` with
`aria-controls` on the plate, the live one carries `aria-current="true"`, and the plate is
`role="region" aria-live="polite"` so the swap is announced. Tab walks the twelve, which is what
anyone expects of a contents list, and headings give screen reader users something to navigate
by. Arrows are kept as an enhancement: Up/Down walk the flat order (down a column, on to the top
of the next), Left/Right jump to the neighbouring group at the same depth, clamped.
**Do not put `role="tablist"` back without also flattening the groups.**

- The swap still replays a staggered animation by dropping a class and **forcing a reflow**
  (`void panel.offsetWidth`). Without the reflow the browser coalesces the remove and the add
  and nothing restarts.
- ⚠️ The index's arrival stagger is an **animation, not a transition**: the rows already
  transition `padding-left` and colour on hover, and a `transition-delay` for the stagger would
  delay those too, so every hover would lag by up to half a second.
- Four columns down to 1040px, then two, then one at 760px. ⚠️ **The plate only moves inline
  (under the question you picked) at the ONE-column breakpoint.** At two columns an inline plate
  would land inside a half-width group and be unreadable.
- History, so nobody re-treads it: fourteen flip slabs → eight accordion rows (1 Aug) → the
  eight-question rail with the panel beside it (6 Aug, approved) → this (7 Aug).
  ⛔ The flip grid is not a direction to go back to; it ran 2.5 screens and read as square tiles.

### Contact block — rebalanced, and the uploader is a disclosure

- The **direct-contact block moved to the left column**: phone, email and hours are contact
  details, not form controls, and they belong with the copy. It is pushed to the foot of the column
  with `margin-top:auto`, so the two sides finish level whatever the form does. `.cta-direct` /
  `.cta-call` are gone and the trust marks run side by side instead of stacked.
- The uploader is **"+ Add plans or measurements"**, a 0fr→1fr disclosure.
  ⚠️ **It opens itself whenever the shared store is non-empty, and says how many files are on the
  enquiry.** Every `.tc-up` on the page is one store (§6.5), so a plan attached in the estimator or
  on the POA panel is already on this form — behind a closed toggle with no count it reads as lost,
  and the visitor attaches it twice or not at all. It never auto-*closes*, which would fight a
  deliberate open.
- ⚠️ The collapsed body needs **`visibility:hidden`**, not just zero height: an `overflow:hidden`
  box of zero height still holds its contents in the focus order, so without it a keyboard user
  tabs into an invisible drop zone. It is delayed 0.48s on the way closed so the collapse still
  animates.


## 4b. ⭐ The hero — rebuilt 6 Aug over TWO passes (second pass NOT yet seen)

The client's brief: the subhead was too long, and they wanted the pattern off an HVAC site they
sent — **title, then a one-liner, then three quick reasons with custom icons, then the badges**.

**Stack now:** H1 → trust line (gold rule) → three reasons, icon + stacked label → two CTAs → two
proof chips. **No eyebrow.**

### ⛔ Rejected in pass one — do not re-offer these

1. **A shortened eyebrow.** Pass one cut "Worktops across London, Hertfordshire, Essex &
   Berkshire" (9px, 62 characters) down to the four counties at a legible 12px. The client killed
   it, and the reason is worth keeping: **naming four counties implies those are the only four**,
   when the real coverage runs everywhere between them and templating is nationwide. A coverage
   list at the top of the page reads as a limit, not a promise. Coverage now lives where it can be
   qualified — footer, FAQ, service pages. **Do not reinstate a geography strip in the hero
   without solving that.**
2. **Thin outline icons.** Pass one used 1.35px line icons on a gradient stroke. Client: *"I hate
   the icons… weak cutout looking ones."* The brief is **thick, gold, solid, premium.**
3. **A one-liner that lists rooms.** "Quartz, marble and granite for kitchens, bathrooms and
   commercial spaces" was rejected because **a list always leaves someone out** — vanity tops,
   fireplaces and tables are all real enquiries.

### The trust line

> Chosen from the slab you approve, fitted by the team that measured it.

Names no room and no material on purpose, so it holds for any project type. It carries a **gold
rule down its left edge** because the client asked for it to "stand out in a different way" and a
brighter grey would not have done it.

- ⚠️ The rule is a **pseudo-element, not `border-left`**: a border draws the full box height
  including line-box leading, so it overshoots the text by ~4px top and bottom and reads as a
  misaligned bar. `top/bottom:.18em` trims it to the visual text.
- ⚠️ **No `ch` measure on `.hero-sub`,** deliberately. A ch cap narrower than the column guarantees
  a wrap and strands the last word on line two. The column is the only limit and the copy is kept
  short enough to fit it. **Lengthen that sentence and it wraps — re-measure if you edit it.**

### The three reasons — and the fourth that is NOT here

| | label | sub-line |
|---|---|---|
| 1 | Service second to none | guided at every step |
| 2 | Every cut-out included | pencil edges and grooves |
| 3 | Aftercare in 72 hours | free, not a month's wait |

⛔ **The fourth differentiator — "no one gets better supplier discounts in the country" — is
deliberately off the page** (§3, and `memory/topcat-copy-constraints.md`). Unverifiable, and it
argues on price, which breaks rule 5 and undercuts everything else the page is building.
**The client re-sent it on 6 Aug and it was still left out, with that reasoning given back to
them.** If they push, that is the conversation to have, not a silent addition.

- ⚠️ **The label STACKS over its sub-line.** That is the whole point of pass two: one long line per
  reason pushed the row edge to edge with nothing between the three.
- ⚠️ **Keep all three at one label line + one sub-line.** Ragged counts (1+1, 1+2, 2+1) was the
  state mid-pass and it looks broken. Budget is ~22 characters for a label and ~24 for a sub-line
  at the 1440 column width. **Re-measure if you reword.**
- `.hf` is `flex:1 1 0`, so a long label wraps inside its own column instead of stealing width
  from the two beside it.
- `.hero-copy` is `clamp(560px,48vw,720px)`, widened from a flat 600px. At 600 the H1 broke to
  THREE lines at 1440, the trust line wrapped, and every reason label wrapped. It tracks vw rather
  than sitting at 720 flat because the copy must stay inside the dark half of the photo —
  `.hero-shade` is still fairly opaque at 52% and thins fast after that.

### The icons

Solid shapes filled with **`#tcGoldSolid`** — a *second* gradient, added because the ramp tuned for
a 1.3px stroke goes flat once it fills a solid shape. It runs diagonally with a brighter highlight
and a deeper shadow, which is what makes a solid glyph read as metal rather than a gold sticker.
`#tcGold` (the stroke ramp, matching the favicon and `.hero-title em`) is still defined.

- Both live in the `.tc-defs` sprite at the top of `.hero`. ⚠️ Zero-sized and absolutely
  positioned: `display:none` kills the paint server in some engines, and an unpositioned 0×0 box
  still takes part in layout.
- ⚠️ **No animated sweep.** The shimmer was deliberately dropped from every button on the site for
  one consistent look, and a glinting icon row would put it straight back.
- **Medal** for service: ribbon tails behind, disc in front with a ring knocked out. ⚠️ **No star**
  — the five gold stars of the Google chip sit ~60px below and a second star reads as a rating.
- ⚠️ **The cut-out icon took FIVE attempts, four of them the same mistake.** A **rectangle holding
  smaller shapes reads as a device, every time**: as an outline it was a camera, then a car stereo;
  as a solid rounded rectangle with a slot and a ring punched out it went straight back to being a
  camera. It is now an **L-shaped run in plan** with the openings punched through by `evenodd` —
  the site's own drawing language, the view the estimator renders cut plans in. Nothing else in a
  UI is that shape, so the eye reads a plan instead of an object. **Do not tidy it back into a
  rectangle and do not convert it to a stroke.**
- The L carries a **tighter `viewBox` (`2.2 2.2 19.6 19.6`)** than the other two: it occupies only
  17.2 of its 24 units where the medal fills 22 and the clock 21.3, so at a shared CSS width it
  rendered visibly smaller and the row read as two sizes.

### Still open, for the client

- ⚠️ **Recommended and NOT done: demote "Request a call" to a text link or the phone number.** Two
  co-equal buttons split intent, and this is the highest-value change left in the hero. It is the
  **third** time it has been raised (archive §6.3, still unanswered) — it wants a decision, not
  another unilateral edit.
- **Mobile stacks the three reasons and pushes the CTA below the fold at 390px.** Left alone on
  purpose: mobile is the next phase in the agreed order of work (§7.6). The fix when it comes is
  to move the reasons *below* the CTAs on mobile.

---

## 4c. ⭐ 7 Aug changes — porcelain, Trade, the region line, four FAQs

Prompted by three client research docs (`Docs/topcat-worktops-*.md`: industry, customer psychology,
sales-call notes). All of the below is built and verified. **None of it has been seen by the client
yet.** Backup: `index.html.pre-porcelain.bak`.

### Porcelain is back, bespoke and enquiry-led (reverses the 6 Aug ban for the estimator)

⚠️ **Standing Rule 8 still says porcelain was banned on 6 Aug. That was reversed on 7 Aug by the
client:** porcelain IS offered again, but **bespoke and enquiry-led only**, no calculator. Update
Rule 8's wording next time it is touched. Owner sign-off on the reversal is on the record via the
client, not a second phone call, so treat it as confirmed but note it.

- **Estimator gained a fourth material tab, Porcelain**, POA like marble and granite. It has
  **`noCat:true`** in `MATS` because the client has not supplied a porcelain stone range, so there
  is nothing for the picker to show. Rather than invent porcelain slab names (the exact
  placeholder problem the real catalogue fixed), it carries one honest stand-in, `NO_CAT.Porcelain`
  = "Porcelain and sintered stone", and the stone picker (`#estStoneBtn`) is **hidden** on that
  tab. Drop `noCat` the day a real range lands and the picker returns on its own.
  - ⚠️ `bestFor()`, `findStone()` and `setStone()` all had to learn `noCat` so they never index an
    undefined `MATERIALS[m]`. `renderPoaSlab()` and the ticket meta both drop the second line on a
    no-catalogue material, or the plate read "Porcelain and sintered stone / Porcelain".
  - ⚠️ `.est-stonebtn` sets its own `display:flex`, so hiding it needed an explicit
    `[hidden]{display:none}` (the §6.7 hidden-attribute trap, again).
- **POA copy is now per-material** (`POA_LEAD` map). Marble and granite keep the owner's "the
  block and the distributor swing the cost" reason. **Porcelain gets a different reason** because
  it is manufactured to a spec: the JOB varies (waterjet not saw, fewer suppliers, mitred edges),
  not the stone. Do not give porcelain the marble paragraph, it would be factually wrong.
- ⚠️ **Porcelain is on the ESTIMATOR tabs only, never the stone wheel's** (`#matTabs` still has
  three). The wheel picks a specific slab and there is no porcelain range, so a fourth wheel tab
  would fan an empty belt.
- **Dekton and Neolith are back in the brand strip** (`SUPPLIERS`), restored because they are
  sintered-porcelain brands and porcelain is offered again. The porcelain scan for Rule 8 will no
  longer come back clean, that is expected now.
- **Porcelain still needs a proper material page** (see §10), the estimator route is only half of
  it.

### Trade is back in the nav (reverses the 1 Aug removal)

B2B is the client's stated first priority and the customer-psychology brief is explicit that trade
buyers must be able to self-identify in seconds. Trade went back into **both** the desktop nav
(`nav.top`) and the mobile nav, as `/trade/` — the one nav item that is a real page, not a hash.
⚠️ The in-page nav JS only intercepts `a[href^="#"]`, so it passes straight through. The three
sub-site builders (`services/`, `stones/`, `trade/build_*.py`) all had `NAV_LINKS` updated and were
**re-run**, so every generated page carries the Trade link too. The client wanted a dedicated Trade
**page**, not a homepage section, which is exactly what already exists at `/trade/`.

### Hero region line (client: "add the place back as a region")

The trust line is now "Chosen from the slab you approve, fitted by us across London and the Home
Counties." ⚠️ **Region, never the four counties** — the county list was tried as an eyebrow and
rejected (§4b), naming four counties reads as the only four. "London and the Home Counties" is an
inclusion, not a boundary. ⚠️ The line now runs to **two lines** at desktop, and the region phrase
is wrapped in `<span class="nowrap">` so it breaks BEFORE "across London…" rather than splitting
the place name. The exact counties still live in the footer, FAQ and schema, where they can be
qualified.

### Four new FAQs, and the FAQ rail is now TWO columns

Answering more of the documented homeowner fears (customer-psychology brief §2.6). Added:
**aftercare in 72 hours, who comes to your home, hot pans / heat by material, and do you work with
porcelain.** The FAQ went from 8 questions to **12**.

- ⚠️ **The `FAQS` array and the `FAQPage` JSON-LD are still two separate copies** — both were
  updated, verified in sync, both parse. A syntax-gate is now part of the health check (see §8).
- ⚠️ **The rail is a two-column grid on desktop (≥1000px).** Twelve single-column rows ran the
  section ~320px past one screen. `grid-auto-flow:column` with six fixed rows fills column 1 with
  01–06 then column 2 with 07–12, so DOM order still runs top-to-bottom down each column. **That
  column-wise fill is what keeps the keyboard handler correct with zero JS change** — it steps by
  index, which now walks down a column and wraps to the top of the next. Do NOT switch to `row`
  flow, it would desync the arrows from the visual order. Below 1000px it is one column (the
  861–1000 tablet band is taller than a screen, fine, that is the deferred tablet pass); below
  860px the panel moves inline and it is an accordion, unchanged. The seventh row grows its own top
  hairline in grid mode.
- Verified: section back to exactly 100vh at 1440×900 and at 1000×700; 6+6 columns; arrows,
  Home/End, roving tabindex and the panel swap all still work; the accordion still moves the panel
  inline below 860; console clean over the whole page; no h-scroll.

⚠️ **FAQPage schema is DEAD as of 2026** (Google deprecated it, stopped showing FAQ rich results 7
May 2026, deleted the docs 15 June 2026). The block we keep in sync is now **inert, not harmful**.
The visible FAQ content is still worth having for users and AI. **Remove the FAQPage JSON-LD before
go-live, or leave it as dead weight, but never add FAQPage markup to a new page.** Full detail in
`Docs/topcat-worktops-seo-build-plan.md`.

---

## 4d. ⭐ The SEO content layer — built 7 Aug (NOT yet seen by the client)

**25 pages, 22,346 words.** All generated by `Website Demo/build_seo_pages.py`.
⚠️ **Never hand-edit the HTML. Edit the builder and re-run it.** The builder's docstring carries
the house rules and the schema policy, read it before changing anything.

| Family | URL pattern | Count |
|---|---|---|
| Materials | `/materials/<slug>.html` | 5 + index |
| Guides | `/guides/<slug>.html` | 9 + index |
| Areas | `/worktops/<county>/<town>/` | 4 counties + 4 towns + index |

New stylesheet `Website Demo/seo.css`, loaded **after** `/services/service.css`. The shell is
reused, so the new pages are visibly the same site. Only genuinely new components live in seo.css.

### The fabrication rewrite that had to come first

D21 reversed the in-house claim, so roughly **25 customer-facing claims** were rewritten across
`index.html` and all three sub-site builders before a single new page was written. The replacement
positioning is **one contract, one contact, and we answer for all of it**, which the customer
psychology brief identifies as what buyers actually value, and which is entirely true.

⚠️ **What is still true and was deliberately kept:** "fitted by our own team". Installation is
genuinely theirs. Do not strip it in an over-correction. Templating and aftercare are theirs too.

⚠️ **V2 was NOT rewritten** and still carries the old in-house claims and dead schema. It is
dormant. Fix it before any revival.

### Two live rule violations found and fixed in passing

Neither was introduced by this session.

1. **`aggregateRating` with `"reviewCount": "16"` was in the landing page JSON-LD**, publishing
   the low review count to Google and breaking D7. It produced nothing anyway, because Google
   makes self-reviewed star markup ineligible. Removed.
2. **The landing page schema still carried `hello@`**, and `areaServed` listed twelve
   Hertfordshire towns only, reflecting an old narrow positioning. Both corrected.
3. The landing page **title** said "St Albans & London". Now names London and the Home Counties.

### Schema policy, which is not what most people expect

**Built:** `HomeAndConstructionBusiness`, `BreadcrumbList`, `Article` + `author` as `Person`.

⛔ **Never build:** `FAQPage` (Google deprecated it, rich results stopped **7 May 2026**, docs
deleted **15 June 2026** — it was removed from the landing page, all six service pages and the
trade page), `HowTo`, `Service`, `WebSite`+`SearchAction`, `aggregateRating`/`review` on our own
pages, `Product`/`Offer` without a real visible price, and **`LocalBusiness` on location pages**
(TopCat is not located in those towns, and marking up an address it does not have risks a manual
action). Also **do not create an `llms.txt`**, Google ignores it.

**The visible FAQ content stays.** Only the markup is dead.

### Location pages: why they are safe

Google renamed "doorway pages" to "doorway abuse" and the definition turns on **funnelling**.
Enforcement is **site-level**, so a bad rollout drags the whole domain. Every location page
therefore converts standalone, swaps **nine** real local variables, and sits under a real county
hub so the URL is a browseable hierarchy. Location pages are **26% of URLs** against a ~40%
ceiling.

⚠️ **DO NOT bulk-add Phase 2 towns.** Gate at 90 days: all 8 indexed, ≥6 with impressions, ≥3 with
clicks. Phase 2 and 3 lists live in the SEO log §5. Towns were chosen on **autocomplete demand,
not affluence** — Harpenden, Windsor, Ascot and prime-central London returned zero demand signal
despite the money.

### The silica page is the biggest opportunity, and the most dangerous to edit

`/guides/is-quartz-safe-silica.html`. Across four competitor sitemaps totalling 684 URLs there is
exactly **one** safety page and it mentions silica zero times. It is also **YMYL**, so errors are
expensive. Accuracy rules, all of which the page currently respects:

- ⚠️ **Never write "HSE banned dry cutting" as law.** HSE's own wording is that the guidance
  "effectively rules out dry-cutting" but "is not a new law, or a formal prohibition".
- ⚠️ **There is no UK ban and none coming.** Australia banned it July 2024. The UK government
  explicitly **declined** a ban on 2 June 2026.
- ⚠️ **Never claim any product is "silica free" without a manufacturer SDS on file.** The most
  credible products qualify to "less than 1%" in their own small print.
- ⚠️ **Porcelain is NOT the safe alternative.** Roughly 15 to 25% crystalline silica, higher than
  several low-silica quartzes.
- The page's genuine edge is that, **because fabrication is outsourced**, TopCat can honestly
  describe what they require of and verify in their partners. No competitor is doing this. That
  edge only exists because of D21.

### Internal linking

Hub and spoke, verified 0 orphans. **The footer is the only sitewide route into Materials, Guides
and Areas.** ⚠️ It carried a full link column per family from 7 Aug until 9 Aug, when it was cut
to one hub link each — see the ⭐ note below before touching it.
`.est-readmore` under the estimator's help band is the highest-intent internal link on the site.
`/guides/best-kitchen-worktop-material.html` is the intended linking hub.

⚠️ **If you restructure the footer, keep a real path to all three new families.** Unlinked page
sets are the textbook doorway signature.

⭐ **UPDATED 9 Aug (D42).** The footer was cut from five link columns to two, so the sitewide route
into those families is now **one hub link each** (`/materials/`, `/guides/`, `/worktops/`) in the
Browse column, rather than 25 individual links. Every family is still reachable in two clicks, and
verified at 0 orphans across all 89 non-V2 pages. **The rule above is unchanged and is now the
single reason the Browse column exists — do not remove it.** Full detail and the before/after in
§4k.

---

## 4e. ⭐ The services helix now BUILDS on arrival — 7 Aug (NOT yet seen by the client)

**Client:** *"As the user scrolls I want it to basically form one by one from the top card. So the
top card is obviously angled, so you see the back, then the next one and the next one and the next
one. I want those to almost animate in one by one semi quickly."*

Before this the six helix cards were simply there when you reached the section. Now they arrive
one at a time, **in spatial order, top of the spiral first**, over about 1.16 seconds.

- **The order is computed, not hardcoded.** `EN_SLOT` sorts the cards by their resting `d` (the
  signed step from the front) descending, so it survives a change to `ORDER` above it. The
  sequence you see is: the top card showing its gold **back**, then the angled one below it, then
  the **front** card third, then the two beneath. The front card is *not* first — the client
  described a path down the spiral, not an emphasis on the front card.
- ⚠️ **The card at `d=3` is skipped in the ordering.** `render()` zeroes opacity two steps out, so
  with six cards that one is the invisible back pole. Giving it its own slot opened the build with
  150ms of nothing, so it shares slot 0 with the first real card.
- **Each card comes forward out of the depth** into its own slot: 340px back, 40px high, 12%
  small, faded out. Sliding them *along* the spiral was the other option and it fights itself —
  the cards above the front and the cards below it would have to travel in opposite directions to
  both read as "further out", and the front card has no "further out" to come from.
- ⚠️ **The entrance is a MULTIPLIER inside the existing `render()`, not a second transform
  system.** At `en=1` every added term is identity and the line is the original one. **Verified:
  the seated state is byte-identical to before the change**, every card's transform, `--hxO`,
  `--hxB` and z-index. A resize, a drag or a click mid-arrival all stay correct because the
  resting geometry is still the only source of truth.
- ⚠️ **The observer is installed from inside `boot()`, not at parse time.** On smaller screens the
  helix is `display:none` and the stage measures 0×0, and a zero-area element can never satisfy an
  IntersectionObserver threshold — arming it early would leave the cards at `en=0`, which is
  invisible. `boot()` already retries until the stage has size, and the resize handler re-runs it
  if the window is later widened into the desktop layout.
- ⚠️ **`restD()` writes its own modulo instead of calling `mod()`.** `mod` is a `const` declared
  further down the same IIFE, so calling it from the `EN_SLOT` setup hits its temporal dead zone.
  That threw `Cannot access 'mod' before initialization`, which killed the whole IIFE and left
  every card invisible. Caught in one pass; worth knowing the shape of it.
- Timing knobs, at the top of the IIFE: `EN_DUR` **820ms** per card, `EN_GAP` **265ms** between
  cards, `EN_BACK` 340px, `EN_RISE` 40px, `EN_SHRINK` 0.12. Six cards land in **~1.9s**.
- ⚠️ **SLOWED on the client's review, 7 Aug (D28): "a little bit too fast, it finishes the
  animation before the user even reaches the end."** It was 560/150, so all six were down in
  1.16s — over before someone scrolling at a normal pace had settled into the section.
  **Two changes, and both were needed:** the pacing above, AND the observer threshold went from
  0.25 to **0.42**, so the build does not start until the spiral is properly on screen rather
  than peeking in at the bottom. Slowing it alone would just have moved the same problem later.
- ⚠️ The observer uses `threshold:[0,0.42]` plus a `boundingClientRect.top < 0` escape hatch. A
  bare 0.42 would be unreachable if the stage were ever taller than the viewport, and the build
  would simply never start.
- `prefers-reduced-motion` seats all six immediately.

### The cards' reverse — a real generated slab, 7 Aug (D31)

**Client, in three passes:** *"The top card and the bottom card showing the back, that's
currently just slightly too dark. Make it a lighter card, some grey or faded white that fits
within the brand, I want those to stand out a little bit more."* → *"Let's not make it pure
white."* → *"Give it a stone design."*

The back was black marble, and two things stacked against it: the page's ground is near-black,
and `render()` dims the far cards to tell depth. The two cards turned far enough to show their
reverse sank into the section.

- ⭐ **The reverse is now a real slab from the site's own `marble()` engine**, preset
  `calacatta` — warm off-white ground, grey structure, gold veining. Not a hand-drawn pale
  background: literally the same stone the wheel and the estimator draw, which is the point.
  **Not pure white**, which the client ruled out explicitly.
- **Each card takes its own seed** (`611 + j*37`), so the six backs are six different slabs
  rather than one repeat. That is what stops the spiral looking printed.
- ⚠️ **It is applied in the deferred `setTimeout(…,0)` block**, alongside `attachGlow`, because
  `marble()`'s `STONES` presets are a `const` declared further down the script and calling it
  while the helix IIFE runs would hit the TDZ.
- ⚠️ **`preserveAspectRatio="none"` plus `background-size:100% 100%`**, the same swap the
  estimator's `face()` makes. `marble()` draws a PORTRAIT slab and these cards are landscape, so
  slicing it shows a narrow band and most of the vein network never appears. Stretched, the
  whole slab reads, and stone is organic enough that the distortion is invisible. **Do not put
  `cover` back** — it crops it straight to the band again.
- ⚠️ **Everything inside had to flip with the ground.** Gold type on bone is about 1.6:1 and
  unreadable, so the wordmark is warm charcoal `#241F18` and only the diamond and the rules stay
  metal. **Do not put `--gold` text back on this face.**
- ⚠️ **The back face has its OWN depth ramp**, remapped in CSS off the same `--hxB` the script
  writes: `brightness(calc(0.42 + 0.58 * var(--hxB)))`. render()'s ramp (0.5 → 1) is tuned for
  the photo faces, and a pale stone taken to 0.5 goes muddy grey and loses the veining that
  makes it read as stone. This lands the top and bottom of the spiral near 0.78. **Remapping
  here rather than changing `render()` is deliberate** — the photo faces keep exactly the depth
  falloff they were designed with.

---

## 4f. ⭐ `/sitemap.html` — the HTML sitemap, 7 Aug (NOT yet seen by the client)

Asked for so the SEO build could be walked from one screen. **Generated by
`build_seo_pages.py`, never hand-written** — it is built from the same `MATERIALS`, `GUIDES`,
`COUNTIES` and `TOWNS` lists the pages come from, plus `stones/catalogue_source.py` for the 52
stones, so it cannot drift out of sync.

- Groups: the main pages, 6 services, 5 materials, 9 guides, 4 counties + 4 towns, and all 52
  stones in three columns by material. 591 words, `index, follow`.
- **Linked from the legal bar of every footer**, which meant a one-line change in `index.html` and
  in all four builders. Present on **87 of 89** non-V2 pages; the two without it are
  `versions.html` (the dev version chooser) and `index-v2.html` (stale and unlinked, §9).
- On the landing page it sits **first** in the legal bar, ahead of Privacy, Terms and Cookies.
  ⚠️ Those three are still `href="#"` placeholders waiting on the client's policies. Sitemap is
  the only one of the four that goes anywhere.
- ⚠️ **`.foot-legal` is `display:flex` with a 20px gap**, so in the generated footers the small
  print needed wrapping in its own `<span>` or the link would have been gapped off an anonymous
  flex box. And `.foot-legal a{color:var(--faint)}` in `service.css` beats a bare `.foot-sitemap`
  on specificity, so the seo.css rule is `.foot-legal a.foot-sitemap`.
- ⚠️ **There is no `/services/` index page.** Materials, guides and areas all have a hub; services
  does not. The sitemap therefore lists the six service pages directly and points at the landing
  page's services section as the hub. Flagged, not built — it needs copy the client has not seen.

---

## 4g. ⭐ The foot of the enquiry form — 7 Aug (NOT yet seen by the client)

**Client:** *"Add the call us directly button back below the send my enquiry. Or maybe request a
call, whatever you think is best. Otherwise we just need to optimise that empty space below the
send my enquiry button."*

There was **~119px of dead column** under the submit button: the copy side finished level with
the card, the form side stopped short. Three things fill it, in the order someone hesitating
over a submit button actually wants them.

1. ⛔ **A second way in — REMOVED 9 Aug (D36).** It was a ghost "Call us on 0800 098 2812" button
   under the gold submit. The client's call on seeing it built: *"remove the call us button with
   the number and just underline the number on the reach out to us directly."* The reasoning on
   7 Aug was that the duplication was correct — the left column a reference, the right an action
   at the point of decision. The client did not read it that way; they read it as the same number
   twice. **The requirement is still served**, by the number in the left column, which now carries
   a standing gold underline and a size bump so it looks like the action it is.
   ⚠️ A **standing** underline, not one that waits for a hover: a hover-only affordance is
   invisible on a touch screen, which is where most calls come from.
   ⚠️ The selector is `.cta-lines a.cta-tel`. A bare `.cta-tel` is (0,1,0) and loses to the
   `.cta-lines a` rules above it (0,2,0), which silently ate both the colour and the size.
2. **"What happens next", three numbered lines.** The unspoken question at a submit button is
   "what am I actually signing up for". Every line is true and none of it is new copy the client
   has to approve on trust: it restates the free home visit, the fixed itemised quote and the
   no-pressure callback that the page already promises elsewhere.
3. **The reply promise**, kept, now as the last word.

- ⚠️ **This blew the one-screen budget and the fix was a CLAMP-FLOOR SWEEP of the form** (§7.8).
  The additions took the section from 463px to 647px at 1366×610, past one screen. The cause was
  not the additions on their own: `.cta-form`'s row gap (11px), the input padding (12px), the
  textarea floor (76px) and the submit padding (13px) were all **flat px** and could not shrink.
  That was survivable while the form was the shorter of the two columns and stopped being
  survivable the moment it became the taller one. All four are vh-aware now, and the section is
  **582px at 610** with both columns finishing level. **This is exactly the class of violation
  §7.8 says to expect more of.**
- ⚠️ `--gold-lo` (`#8C6B34`) is the deep end of the gold ramp and all but disappears at 10px on
  ink. The step numerals use mid gold at 0.72 opacity instead. Worth knowing before using
  `--gold-lo` for anything small again.
- **Where the ~54px went when the button came out (9 Aug).** Not into air: the client's brief was
  *"balance out that section so there's not so much empty space"*, so it went into the spacing and
  size of "what happens next" — bigger line type, more gap between the steps, more room above the
  rule. All still vh-aware clamps with small floors, because this column is the one that decides
  whether the card fits a 610px screen. **The two columns finish level at all five test sizes**,
  which they now do naturally rather than by `margin-top:auto` stretching the left one.

---

## 4h. ⭐ The nav bar's line flashes as it forms — 9 Aug (D33, NOT yet seen by the client)

**Client:** *"When the user first scrolls and the nav bar forms, I want almost the same thing to
happen as that divider where the shine goes across as you scroll. But start in the middle and go
to the two sides quite quickly, so as it forms it just does that flash or shine thing."*

The bar's bottom hairline (`header.bar::after`) used to simply fade up with the glass. Now it
**draws out from its own centre**, and a bright head rides each leading edge out to the screen edge
and leaves with it.

- The heads use the **same gradient, blur and border-radius as `.sd-line::after`**, which is the
  site's one shine language (§4). This is that shine, split in two and fired once rather than
  tracked against scroll position.
- ⚠️ **The flare is a real element (`<i class="bar-flare">`), not a third pseudo.** `::before` is
  the glass and `::after` is the line, both taken, and the flare needs two heads travelling
  independently. It is `position:absolute`, so it is **not** a flex item of the bar and does not
  touch the nav's layout.
- ⚠️ **`overflow:hidden` on `.bar-flare` is LOAD-BEARING.** The heads travel `50vw`, which puts
  them half off the viewport at the end. Without the clip that is horizontal scroll at every width,
  which is a standing rule. Verified: `scrollWidth === innerWidth` at 1920 through 375.
- Timing is **0.76s** for the flare and 0.76s for the line's draw. It was 0.58s and the client
  asked for "slightly, slightly slower" on review (D37). ⚠️ **Keep the two on the same duration.**
  The heads are meant to read as the leading edges of the line drawing itself, and they visibly
  come apart if the flare and the draw differ.
- It replays whenever `.scrolled` is re-added, so scrolling back to the top and down again fires it
  again. That is deliberate and reads as the bar re-forming.
- `prefers-reduced-motion` drops the flare entirely and seats the line at `scaleX(1)`, so it still
  arrives, just without the flash.
- ⚠️ **Landing page only.** The generated sub-sites' `header.bar` (in `services/service.css`) is
  `position:sticky` with permanent glass, a plain `border-bottom` and no `.scrolled` state at all,
  so there is no forming moment there to decorate. If those bars ever get one, this is the effect
  to bring across.

---

## 4i. ⭐ The Why tiles are designed now — 9 Aug (D35, NOT yet seen by the client)

**Client:** *"We need to add some sort of design into the more reasons to choose us. We can't just
have it grey blocks… the other blocks need to look better designed. And where it says feature
image, just add any image in there now so we can have it as a placeholder."*

**The feature slot** now carries `assets/team/team.jpg`, which the About collage stopped using the
same day, so nothing on the page is doubled. ⚠️ It is a **placeholder**, and the real brief for the
slot is unchanged and still owed (§7.5): the whole team together, or a finished install.

**The five reason tiles** get three things, and **none of them costs vertical height**, which is the
constraint this section has always been up against:

| | what it is | why |
|---|---|---|
| `.wy-stone` | the review cards' black marble, one slab per tile, veiled back | client, 9 Aug (D40) — see below |
| `.wy-ico` | a solid gold icon per reason | the hero's icon language (client, 6 Aug: "thick, gold, solid, premium") |
| `.wy-top` | puts the icon on the **same line** as the numeral | which is what makes the icon free |

**⛔ The gold seam that used to be here, and why it is never coming back.** The first version of
these tiles carried a lit gold hairline across the top edge. The client's response was a general
rule, not a note about this section: *"Don't ever use that fingernail design on top of sections."*
⚠️ **The rule already existed** — §6.5 has carried "no bright band across the top of anything,
that was tried and rejected outright" since the estimator round — and it got broken because it was
filed under the estimator. It is **§2 rule 10** now, stated site-wide. Do not add a top seam to
anything.

**What replaced it.** `marbleSVG()`, literally the same generator the review cards use, filled per
tile from the WHY MOSAIC IIFE with its own seed so no two tiles carry the same slab.

- ⚠️ **The veil is DEEPER than the review cards' (0.74→0.86 against their 0.55→0.72).** These
  tiles are about a third of a review card's area and carry nearly as many words, so the veining
  crowds the copy at the review setting. If you lift it, check the body text against the
  **brightest vein**, not the average — the failure is local, not overall.
- ⚠️ **`.wy-stone` is a real child element, not a pseudo.** `.glow-card` already owns `::before`
  and `::after` on every tile for its cursor-reactive rim and halo, and a pseudo here would have
  fought them for `background`. Same trap applies to anything else added to a `.glow-card`.
- ⚠️ **No `overflow:hidden` on `.wy-r`.** `.glow-card`'s halo is `inset:-1px` and blurred, so it
  spills outside the box on purpose; clipping there would cut the cursor light off at the border.
  The stone that *does* need clipping is clipped by `.wy-stone` instead.
- ⚠️ **`marbleSVG`, `rng` and `veinPath` are `function` declarations, so they are hoisted** and
  safe to call from the IIFE. This is **not** true of `marble(preset,seed)`, whose `STONES` presets
  are a `const` further down — that is the temporal dead zone that killed the helix IIFE once
  already (§4e). Swap to `marble()` and it has to move into a deferred `setTimeout(…,0)`.
- **The icons, and what they must not be.** ⚠️ **No icon is a rectangle holding smaller shapes** —
  that silhouette read as a camera and then a car stereo through five attempts in the hero, and the
  lesson holds here. Nothing is a star, either, for the same reason the hero's medal has none.
  - 01 two linked rings · 02 a punched price tag · 03 an arrow clearing a baseline ·
    04 a vein · 05 a clock disc with the hands knocked out.
  - ⚠️ **04 is the one STROKED icon in a set of five filled ones, deliberately.** Its subject is a
    line. Every filled version read as something else: two mirrored halves came out as a **coffee
    bean**, and two slabs side by side is the rectangle-holding-shapes silhouette. At 2.9 units on
    a 24 box it is a thick ribbon, not the 1.35px hairline that was rejected on 6 Aug.
  - ⚠️ **03's gap between the arrow and the bar is what stops it reading as an upload glyph.**
    Do not close it up.
  - All five were checked at **18px as well as at 96px**. An icon that only works large is not
    finished — they render at 15–21px on the page.
- On a short window the **numeral** is the first thing dropped (`max-height:620px`), not the icon:
  the icon is the thing carrying the design and it costs no height of its own.

---

## 4j. ⭐ The reviews line is a CTA — 9 Aug (D32, NOT yet seen by the client)

**Client:** *"On the section that says 'like what you're reading, let's bring your vision to life',
we need to make that a CTA. Whether we make it a button below, or underline it and an arrow to make
it clickable, or just something to make that a CTA."*

`.rev-cta` under the review wall held a sentence and nothing else, sitting in the one place every
other section carries an action. Now **"Let's bring your vision to life"** is a gold link to `#cta`
with a standing underline and an arrow that steps right on hover.

- ⚠️ **A link, not a button, and that was a choice.** The page already pairs a gold button with a
  ghost in the hero, the services intro and the process foot. A fourth pair here is a fourth place
  the eye has to choose, and the hero already taught us what two co-equal buttons cost (§4b).
- The underline is **permanent**: it IS the affordance, so it cannot wait for a hover a touch
  screen never sends. Hover only brightens the gold and nudges the arrow.
- "Like what you're reading?" stays in bone as the lead-in, so the gold half is unambiguously the
  clickable half.

---

## 4k. ⭐ The footer, cut to main pages — 9 Aug (D42, NOT yet seen by the client)

**Client:** *"You need to completely clean up the footer, it's way too big. You won't have to list
everything out, you'll have those main pages. So Services counts as one page, when they click on
that it goes to the services page and all that section of the site. And then you'll have the
Explore section, then whatever usually goes into a footer. Not everything."*

It was **five link columns, 31 links, 931px tall** — taller than the viewport on a 900px screen.
Now **two link columns, 17 links, 411px**.

| | before | after |
|---|---|---|
| Brand | logo, tagline, stars | unchanged |
| **Explore** | 9 links | Services · Projects · Stones · Estimate · About us · For the trade |
| Services | all 6 service pages | ⛔ gone |
| Materials | all 5 material pages | ⛔ gone |
| Guides | 6 guide links | ⛔ gone |
| Areas we cover | 5 area links | ⛔ gone |
| **Browse** | — | Materials · Worktop guides · Areas we cover · FAQ (**the three hubs**) |
| Contact | phone, email, area, hours | unchanged |
| Legal bar | Sitemap · Privacy · Terms · Cookies | unchanged |

### ⚠️ READ THIS BEFORE TRIMMING THE FOOTER FURTHER

The footer is the **only sitewide route** into `/materials/`, `/guides/` and `/worktops/`, and an
unlinked page set is the textbook **doorway signature**. Enforcement for that is **site-level**, so
getting it wrong drags the whole domain, not just those pages (§4d).

**The cut did not drop those families — it links each one ONCE, at its hub, and lets the hub link
its own children.** That is cleaner hub-and-spoke than 25 sitewide links were, and every family
stays reachable in two clicks. **Do not remove the Browse column.** If the footer has to shrink
again, take rows out of Explore instead.

Verified after the cut: **3,393 internal links, 0 broken, 0 orphaned pages** across all 89 non-V2
pages.

### The same cut, in all five places

⚠️ **The footer is written FIVE times** — `index.html` plus a `footer_html()` in each of
`services/build_services.py`, `stones/build_stones.py`, `trade/build_trade.py` and
`build_seo_pages.py`. All five were changed and **all four builders were re-run** (6 + 53 + 1 + 26
pages). Change one and you have to change all five, or the site's footers drift apart.

- The sub-site grid in `services/service.css` was **already** `1.4fr 1fr 1fr 1.3fr` — four columns.
  The builders had been emitting **six** `.foot-col`s into it, so the last two wrapped onto a
  second grid row. That is why the generated footers were tall too, and it fixed itself the moment
  the count came down to four. No CSS change was needed there.
- Three builders were left with dead locals (`services_links`, `mat_links`, `mats`/`guides`/
  `places`) once their columns went. Removed.

### ⚠️ "Services" has nowhere real to point

The client described clicking Services and landing on "the services page… and all that section of
the site". **There is no `/services/` index page** — it is the one family without a hub (§7.18).
The link points at `/index.html#services`, the landing section, which does list all six and links
to each. That satisfies the behaviour today.

**This is now the second time the gap has surfaced**, and this time the client described the page
as if it exists. Building it needs copy they have not seen, so it was not built — but it should be
the next thing offered. Repoint the footer link the day it lands.

---

## 4l. ⭐ The page floor — 9 Aug (D43, NOT yet seen by the client)

**Client, over six passes.** Worth reading in order, because the destination is not where it
started: *"That dark background almost looks like just paintbrush strokes. I like how it looks
almost far away, it gives the site depth, and I like that everything floats over it. But it looks
low quality and blurry… it's currently just a whole bunch of stripes."* → *"I don't like the stone,
the thick grey line looks bad, it has to look like a stone everyone would love to buy, better
veining."* → *"There should be some sort of dark transparent cover over it so the site sections
stand out more."* → *"The background shouldn't be too complicated so it doesn't distract."* →
*"Background needs to be even darker."* → *"I also don't like the thick gold veining."*

**Read as a whole, the brief is: real stone, hairline veining only, and darker than before.**
The first three passes pulled toward richer; the last three pulled hard back toward quieter. Do
not re-introduce drama here.

**What it is now:** `assets/stone-floor.webp` — a **Nero Portoro** slab, black stone with a fine
hairline vein web and crystalline grain, graded down and sat under a dark veil. 90KB, 2048×1152.

### Why Portoro specifically

Gold-veined black marble is a stone people genuinely covet, and **the veining is the brand's own
champagne gold**, so the floor and the accent colour are the same material. Every other dark stone
tried came back to a grey vein, which is the first thing the client rejected.

### ⭐ THE NUMBERS THAT MATTER

Tuned against **measured pixel luminance**, not by eye — the darks here are so close together that
a screenshot genuinely cannot be trusted, and several rounds were wasted before this was measured
instead of eyeballed. On an 800×450 raster:

| | median | p90 | max |
|---|---|---|---|
| The OLD floor | 13 | 16 | 19 |
| The graded slab, before the veil | 13 | 21 | 51 |
| **What the page sees, at `--floorVeil:0.6` over `rgba(6,6,9)`** | **9** | **12** | **24** |

So the floor is now **darker than the site has ever had** (median 9 against 13), and the only
thing left in the top end is hairline vein and grain.

⚠️ **If you replace this image, match those numbers.** A floor a few levels lighter changes the
weight of every section on the site at once.

### ⛔ NO THICK VEINING, OF ANY COLOUR

The client rejected a thick grey vein and then a thick gold one. **A thick vein reads as a crack,
not as a slab.** The crop behind this was not chosen by eye: every candidate window was scored by
thresholding the vein level and **eroding** it — a thick vein survives an erosion, a hairline does
not — and the window kept was one where **0.0000%** survived. If you swap the image, run that same
check rather than judging it visually; at these luminances the eye is unreliable and the client
has now caught the same fault twice.

### The knobs, in the order you should reach for them

1. **`--floorVeil`** on `:root` (currently `0.6`). One number. Up = quieter, down = more stone.
   ⚠️ It sits **third** in `body::before`'s background stack, *below* the two gold corner
   radials — CSS paints the first layer on top, so this dims the stone without dimming the brand
   glows with it. Do not move it to the front.
   ⚠️ **The veil colour is `rgba(6,6,9)`, DARKER than `--ink` (11,11,14), and that is the whole
   reason the floor can get darker at all.** A veil the same colour as the ink can only pull the
   stone *towards* ink, never past it — raising its alpha just kills the veining and leaves the
   page looking exactly as bright as before. This was the fix for "needs to be even darker".
2. **The grade.** The image is remapped percentile-by-percentile onto a target curve; the top
   anchor controls how loud the veining is. It went 105 → 58 → 51 across the client's
   "not too complicated" and "even darker" notes.
3. **The crop.** Chosen by scoring, not by eye — see the erosion test above.

### ⚠️ Things that will bite

- **One asset, five consumers.** `--marbleBG` feeds the page floor, the scrolled nav glass, the
  CTA card, the estimator modal and the trade prompt. That is deliberate (§4, "no second marble
  scale, so it can't re-open the patchwork complaint") — but **only the page floor gets the
  veil**. The other four already carry their own darkening and were checked individually.
- ⛔ **A single dominant vein reads as a CRACK.** That is what got the first stone rejected. Stone
  wants a *network*: several fine veins branching and crossing. This applies to any stone imagery
  added anywhere, not just here.
- **It must stay far from the card stone.** The review cards, the Why tiles and the helix backs
  all carry `marbleSVG()` at card scale. The floor is one enormous slab at very low contrast, and
  that difference in scale is what stops the two reading as a patchwork.
- ⚠️ **Do not re-attempt the procedural SVG route casually.** Several rounds went into rebuilding
  the floor with `feTurbulence`. The tone could be matched exactly, but not the perceived quality.
  Two findings worth keeping if anyone tries again: `feFlood` fills the **entire** filter region,
  so a mask that never returns zero alpha covers every pixel and no amount of opacity reduction
  will let the darks go dark; and `feFuncA type="gamma"` with a high exponent is the fix, because
  it keeps only the bright tail of the noise.
- The old SVG floor is in `index.html.pre-background.bak` if it is ever wanted back.

---

## 4m. ⭐ Real slab photography and the popularity order — 9–10 Aug (D44–D48)

**Full reasoning: `HANDOVER-2026-08-10-slab-photography-complete.md`. Operational summary:
`HANDOVER-2026-08-10-photography-start-here.md`.** This section is the map.

**All stones carry a real photograph** from Nile Stone and Next Stone Slabs (⚠️ written at 52; the range is **115** now). One map,
`assets/slabs/manifest.json`, feeds five surfaces: the wheel (`SLAB_TILES` → `stoneMarkup()`), the
estimator's picker, swatch and cut plan (`face(preset, seed, slug)`), the `/stones/` grid and all
52 stone pages (`build_stones.py` → `stone_face()`). SEO/material pages carry no stone tiles.

Rebuild with:

```bash
cd "Website Demo/stones/harvest" && python3 slabify.py && python3 match.py --prune
cd .. && python3 build_stones.py
```

### The things that will bite the next person

- ⛔ **Only `nile`, `nile-inv` and `next` may become a published tile** (`PUBLISHABLE` in
  `slabify.py`). Everything else in `raw/` is surveyed-only or excluded — see `LICENSING.md`.
- ⛔ **Two structural guards in `match.py`, and both caught wrong images that were already live.**
  An engineered quartz may only wear a *quartz* photograph (judged on the supplier's own section in
  `catalogue.json`, **never** the folder — Nile's stock system carries quartz too), and only **its
  own maker's** photograph, because a quartz name belongs to the brand. Natural stone is exempt
  from the second: there the name is the quarry's. Porcelain (`top-marazzi`) is refused outright.
- ⚠️ **The gates are calibrated by eye, not by taste.** Almost every threshold in `slabify.py`
  carries the measurement that set it and the failure that forced it. The recurring bug is *a
  measurement that condemns a stone for being what it is* — black stones read as "rooms", pale
  plain stones as "blown". **Read §2 and §3 of the write-up before changing any of them.**
- ⚠️ **`match.py --prune` or the extras deploy** — slabify writes 176 tiles, the site uses 52.
- ⚠️ **Natural-stone photography is indicative, and only the COPY says so** (D44). Every marble and
  granite page carries "You approve photographs of your actual slab before a single cut". That line
  is now the sole safeguard against a stock photo reading as a promise about veining.

### The selector's order (D48)

`POPULAR` in `index.html` — three lists, most popular first — and `fanOrder()` lays them out
**centre-out** around the landing slot, so the eleven cards on screen are the top eleven and rank 1
is dead centre. Sorted-not-fanned would put the least popular in the left wing. Opens on
**Calacatta Oro** / **Carrara** / **Absolute Black Extra**. `BEST` (the estimator's default) is
derived from the same table so the two cannot drift.
⚠️ **Evidenced editorial ranking, not TopCat's sales data** — replace the three lists when the
client has real figures; nothing else needs touching.

⛔ **QUARTZ NO LONGER FOLLOWS ANY OF THAT (D84, 10 Aug).** The client placed the quartz eleven
himself: **Azul Shimmer** lands, **Arabescato Elegance** and **Calacatta Oro** sit on its
shoulders, two brighter slabs beyond them, then one dark slab in each wing. So the quartz list is
an editorial and visual arrangement and **must not be "corrected" back to the trade ranking**.
Marble and Granite are untouched and still read exactly as described above.

⚠️ **Two things about that arrangement are load-bearing and easy to undo by accident:**

- **`PINNED` exists because of D74.** `spread()` interleaves ranks 1–10 by tone, and it used to
  leave quartz alone only because the quartz list held **no dark stone at all**. Put darks in it
  and spread() has both tones to merge, which pulls the two stones the client named off the
  landing card's shoulders. `PINNED={Quartz:FAN_HEAD}` fixes all eleven; the default of 1 is D74
  exactly, so Marble and Granite are unchanged. The tail is still spread automatically.
- ⛔ **Do not push the darks further out to "spread them more."** Depth is
  `filter:brightness(var(--dim))` on the faces: **0.34 at ranks 5–6, 0.18 from rank 7 outwards**.
  A white slab survives 0.18 and a black one does not — Marquina's median is **4**, so out there
  it renders at roughly 1/255 and reads as a hole in the fan. Ranks 5 and 6 are the outermost
  slots where a dark stone still looks like stone.
- ⭐ **The two darks were chosen by eye, not by darkness.** Royal Grey, Black Tempal and Nero
  Starlight measure darker and are flat fills with no pattern at card size; next to the veined
  whites they read as blank cards. Laurent Black (copper on black) and Marquina (white on black)
  read as stone. A dark slab only does the client's job here if you can see the stone in it.

---

## 4o. ⭐ THE COPY ROUND — 10 Aug, second session (D56a–D65)

**Nothing in this section has been seen by the client in its finished state**, other than the
three faults he found himself. Backups: `HANDOVER.pre-10aug-copy-round.bak.md`,
`stones/catalogue_expanded.py.pre-mm.bak`, `.pre-colour.bak`, `stones/build_stones.py.pre-mm.bak`.

### What was actually wrong, and why none of it was visible

⚠️ **Every defect this round rendered perfectly.** A page showing `322 x 162 mm` looks no
different from one showing `3220 x 1620 mm`. "The pattern is consistent across the slab" reads
like ordinary marketing. That is why the checks below fail the BUILD rather than warn.

| What | Scale | How it is now caught |
|---|---|---|
| Script-assembled blurbs, one factually reversed | 63 of 115 | `descriptions.py` + build raises if a stone has no entry |
| Slab size printed in cm under an "mm" label | 22 pages | `slab_facts()` raises; verify check 6 |
| Unkeepable promises in the shared facts block | 355 hits | verify check 7 |
| Pages titled "Marble" for a quartzite | 27 pages | `shown_mat()` |
| Dead pages for stones we no longer sell | 4 pages | verify check 5 |
| Colour data contradicting the photograph | 20 stones | reviewed by eye against every tile |

### ⛔ The rules for writing stone copy, which is the part most likely to be undone

1. **Colour and pattern. Nothing else.** No sealing, heat, durability, joints, what it suits,
   what it matches. The client cut every one of those from a draft that had them.
2. **Write from the tile we ship**, with the photograph open. ⚠️ If a tile is recropped, its
   description is stale — `descriptions.py` says so at the top and it applies to your own work.
3. ⛔ **Never research an engineered quartz on the open web.** The name is a manufacturer's
   marketing name; another maker's slab answers to it. Same reasoning as D45.
4. ⛔ **Neither supplier publishes any copy.** Checked directly on 10 Aug. Nile's `description`
   field is the string "Click on the image to enlarge" for all 138 products; Next Stone Slabs has
   no product pages. `harvest/supplier_copy.py` re-checks this if you doubt it. Do not go looking
   again expecting a different answer.
5. **Absolutes are the tell.** "consistent", "exactly", "all it asks for", "never stains". A
   comparative is defensible, an absolute is not.

### The pipeline, in order

```bash
cd "Website Demo/stones"
python3 apply_catalogue.py            # inject MATERIALS into ../index.html
python3 harvest/match.py --prune      # name -> tile, manifest.json + SLAB_TILES
python3 harvest/similar.py            # ⭐ NEW: measures tiles -> similar.json. BEFORE build.
python3 build_stones.py               # 115 stone pages + the collection grid
python3 harvest/verify.py             # ⛔ the gate, seven checks
```

### ⚠️ Traps this round added to the pile

- **`upscale.py --install` does not populate `_upscale/installed/`.** Three re-upscaled tiles
  would have reverted on the next full run. The restore set is synced now and covers all 94.
- **A pin must be keyed on the stem the MANIFEST names.** Arabescato Classico's catalogue row
  says `tile='arabescato-classico-ft'` but the manifest ships `arabescato-classico`; pinning the
  wrong one does nothing, silently.
- **Explanations belong in Python, never in an HTML comment in the template.** A comment quoting
  a banned phrase ships in the source of all 115 pages.

---

## 4p. ⭐ THE RANGE IS "MARBLE & QUARTZITE" — 10 Aug, third session (D66–D68)

**Not seen by the client.** Backups: `index.html.pre-quartzite-label.bak`,
`stones/build_stones.py.pre-quartzite-label.bak`, `stones/apply_catalogue.py.pre-quartzite-label.bak`,
`sitemap.html.pre-quartzite-label.bak`, `HANDOVER.pre-quartzite-label.bak.md`.

### The problem D65 left behind

D65 made each stone page name the true rock. It was right, and on its own it made the **journey**
worse: the customer presses **Marble**, opens Fusion Black, and is told **Quartzite**, with nothing
on either screen connecting the two. The client found it immediately.

⚠️ **The range was never mostly marble.** 18 of the 45 are marble. **26 are quartzite** and one is
travertine. A tab labelled "Marble" was wrong about the majority of what sat under it.

### ⛔ Why the stone's name was not the thing to soften

Both literal readings of the instruction were tried on paper and rejected:

| Reading | Why not |
|---|---|
| "Available in marble **and** quartzite" | Not true of any single stone, and unfixable. Taj Mahal is one rock. Every UK merchant sells it as quartzite, and one of them sells an engineered **quartz** imitation under the same name — the confusion is real and it runs the other way |
| "Just say **natural stone**" | Throws away the word the customer searches, the reason the stone costs what it does, and re-opens D65. It would also attach marble's care copy — etches with acid, softer — to a stone that does neither |

⭐ **The honest version of what the client asked for is at RANGE level, and it is what the trade
does.** The stone always states what it is. The range around it is named for what it contains.

### Where each name is used now

| Says the **range** — "Marble & Quartzite" | Says the **true rock** — Quartzite / Travertine / Marble |
|---|---|
| wheel rail tab, collection filter chip | wheel readout, collection card tag |
| estimator material tab, its picker's tabs and count | estimator's picked-stone line, enquiry chip |
| the stone page's new **Range** row | page title, meta, hero tag, eyebrow, "About …", image alt |
| sitemap stone column | |

⛔ **`mat` is untouched.** It is still the browse-and-pricing key, so no price, filter, POA
behaviour or deep link moved. Only printed words changed.

### ⚠️ Things that will bite

- ⭐ **To change the wording, change it in TWO places**: `RANGE_LABEL` in `stones/build_stones.py`
  and `MAT_LABEL` in `index.html`. Everything else reads from them.
- **`kind` is emitted per wheel entry by `apply_catalogue.py`**, which imports `shown_mat` from
  `build_stones.py` so the wheel and the pages cannot disagree about what a rock is. Re-run
  `apply_catalogue.py` after any catalogue change or the wheel keeps the old kinds.
- ⚠️ **"Marble & Quartzite is priced by hand" does not parse.** A compound range takes a plural
  verb, so the POA heading's subject carries its own verb in `POA_HEAD` rather than being
  assembled from the label. Any new heading built by concatenation will hit this.
- ⚠️ **The estimator tab wraps to two lines** and that is intentional — the label needs 180px and
  a quarter of that rail is 125px. Measured cost to the section: **6px**. All four tabs stay the
  same size and the wheel rail's 190×46 blocks are unchanged.
- **`titled_mat()` drops the rock from a title when the name already carries it**, so Travertine
  Romano Classico is not "Travertine Romano Classico Travertine Worktops". Scanned: 0 of 115
  titles now repeat a word.
- ⚠️ **`10cm` in Judy Z.'s review trips the rule 11 scan and must stay.** It is a real customer's
  own words. Do not edit a review to satisfy a scan — check the hit before acting on it.

### Measured

115 stones, 115 photographs, 115 pages — `verify.py` all seven checks ✅. **2,716 internal links,
0 broken.** Inline JS parses, JSON-LD valid, **zero console errors**. No horizontal scroll at 1440
or 375. Rule 1 scan clean; rule 11 scan clean apart from the review above and a base64 blob.
Card tags across the marble range: **18 Marble, 26 Quartzite, 1 Travertine**.

---

## 4q. ⭐ THE REAL LOGO — 10 Aug, fourth session (D69)

**Not seen by the client.** Backups: `index.html.pre-real-logo.bak`, and a `.pre-real-logo.bak`
beside each of the four builders.

### What was actually there before

Not a logo file. The mark was **hand-rebuilt as inline SVG** (a 200×250 viewBox of two bars,
two crossing strokes and a diamond) and the wordmark was **live text** — TOPCAT in Cinzel,
WORKTOPS in Montserrat, tracked out to fake the lockup. It had the right silhouette and was
wrong throughout. ⚠️ **Being type, it could also drift**: any webfont fallback changed the
"logo".

Three further things fell out of it, all of which the file-based version removes:

- The favicon was the same wrong drawing **URL-encoded into the `<head>` of all 150 pages**.
- The landing page footer's mark filled itself from a gradient defined inside the **nav's**
  inline SVG. It rendered only because the two happened to share a document.
- The generated pages set the wordmark in `--bone`, so they carried a **white** TOPCAT while
  the landing page carried gold. Nobody had noticed, because the two are never on screen
  together.

### Where each lockup goes

| Surface | Lockup | Height |
|---|---|---|
| Nav bar, landing page | horizontal | 34px |
| Nav bar, all 149 generated pages | horizontal | 32px |
| Footer, landing page | **vertical** | 104px |
| Footer, all generated pages | **vertical** | 96px |
| Favicon, everywhere | icon, squared | 16–32px |

⭐ **The client's instruction was explicit: horizontal in the nav, vertical in the footer.**

### ⚠️ Things that will bite

- ⛔ **Height is the only dimension ever set.** Width follows the intrinsic ratio (horizontal
  4.5053:1, vertical 1.0664:1). Setting both squashes it, and a squashed logo at 34px reads as
  subtly wrong rather than obviously broken, which is the harder fault to catch.
- ⚠️ **The viewBoxes are retightened to the ink** and the supplied originals are kept beside
  them, untouched, in `assets/brand/`. The supplied horizontal carries 36 units of air on the
  left against 21 on the right; left as-is it throws the nav's alignment out by ~1.6px and
  makes `height:34px` draw a 27px logo. Bounds were measured with `getBBox()` in a real
  renderer, not estimated from path data, because the wordmark is all curves.
- ⭐ **`services/service.css` dresses every generated page.** Its `.brand` block is four lines
  and it covers all 149. That is one edit, not four.
- ⚠️ **`assets/brand/` also holds `make_brand.py`**, which rebuilds the derived files from the
  originals. If new artwork arrives, re-measure rather than reusing the numbers.
- ⚠️ The link is the accessible name (`aria-label`); the image is decorative and takes `alt=""`
  so the brand is not announced twice.

### Measured

Bar height **unchanged at 78.5px**; nav lockup 153.2×34 against the old 155×35. Footer lockup
110.9×104 against the old 150.6×102. **150 of 150 live pages** carry all three assets, every
request 200. **0 broken internal links** over 6,948 checked. `verify.py` all seven ✅. No
horizontal scroll at 1440 or 375; at 375 the lockup ends at 173px with the burger at 313px.
Inline JS parses, JSON-LD parses, rule 1 and rule 11 scans at their documented baseline.

### ⛔ Still missing, and worth asking for

The client holds the logo in a **darker gradient, black, white and solid champagne gold**. Only
the gold gradient is on disk. ⭐ **White is the one that will be felt first** — it is what a
logo over a photograph needs, and what a social share card needs. Related gaps, both of which
predate this work: there is **no `apple-touch-icon`** (iOS wants a 180px PNG on a real
background, not a transparent SVG) and **no `og:image` anywhere on the site**, so a link shared
to WhatsApp previews with no image at all.

---

## 4r. ⭐ THE STONE-CHOOSING ROUND — 10 Aug, fourth session (D70–D73)

**Not seen by the client.** Backups: `index.html.pre-real-logo.bak`, `stones/stone.css.pre-floor.bak`,
`stones/build_stones.py.pre-source-note.bak`, `assets/slabs/blue-roma*.webp.pre-topcrop.bak`,
`stones/harvest/upscaled.json.pre-topcrop.bak`.

### ⛔ The `hidden` bug, three times in one codebase

The single most reusable thing in this session. `[hidden]{display:none}` is a **user-agent** rule,
so **any author rule that sets `display` beats it** and the element never hides:

| Element | What it cost |
|---|---|
| `.st-badge` | A bare gold dot on screen with no refinements active. **Found, fixed, commented** |
| `.st-drawer` | Three lines below it in the same file. The Refine button did nothing visible for its whole life, and the filters pushed the stones off the first screen |
| `.est-lm` | The estimator's metres field appeared before a profile was chosen, contradicting its own code and the comment beside it |

⭐ **The lesson is not the CSS, it is that the fix was already in the file.** The `.st-badge`
comment even states the general rule. It was written as a note about one element instead of being
applied to its neighbours or turned into a check. There is a scan for the pattern now; it returns
clean.

⛔ **Any element you hide with `hidden` and give a `display` value needs its own `[hidden]` rule.**

### The floor on the stone pages

Same Portoro photograph, same veil, same measured strength as §4l. ⚠️ **Root-relative url** (these
pages sit a level down) and ⚠️ **`main` and `body > footer` both need `position:relative;z-index:1`**,
because on generated pages they are siblings rather than nested as they are on the landing page.
⛔ Do not lift them with `body > *`, that would break the header's `position:sticky`.

### Blue Roma, and the scan that came out of it

Cut at row 60 of 1600, measured: saturation runs 26–34 across rows 24–44 (the slab's warm cut edge,
with racking above it) and settles at 5.5 from row 56. Re-squared to 1540, centred. **No credits** —
pixels were removed from an already-upscaled tile, not added.

⛔ **The restore set was synced first.** `_upscale/installed/` holds the *pre-fix* tile and the
documented post-run restore copies it back; Aqua Gucci and Calacatta Gold Oro were each "fixed"
twice before this was understood.

⭐ A new scan measures every tile's top and bottom 5% against its own body. **11 bands flagged
across 115, all reviewed at 330px, all genuine stone.** Blue Roma was the only real fault, which is
the useful result: the range is clean and now there is a cheap way to re-ask the question.

### The sourcing line

⭐ **It existed in four places and none of them were where somebody runs out of options.** Now on
the wheel, on every stone page (closing "more to consider", where a person is already hunting for
an alternative), in the estimator's picker (appended unconditionally, so it is there when a search
returns nothing), and lifted out of the collection's lede onto its own line.

⚠️ In the estimator's picker it is a `<button>`, not an `<a>`: the dialog's Tab trap collects
`modal.querySelectorAll("button")`, and it closes the dialog before jumping, or the page scrolls
away behind an open modal.

⛔ **Hedged on purpose** — "usually", "where we can". §2 rule 12, and it is a promise about other
people's quarries and stock.

### Measured

`verify.py` all seven ✅. **7,064 internal links, 0 broken.** Inline JS and JSON-LD parse. Rule 1
scan clean, rule 11 at its documented baseline, no absolutes in any of the new copy. `#stones`
still inside one screen: **744px at 1440×900, 539px at 1366×610.** Refine drawer 0 → 179 → 0px.
No horizontal scroll at 1440 or 375.

---

## 5. The stone catalogue — the client's real range

⚠️ **Written at 52 stones: Quartz 24, Marble 20, Granite 8.** The range is now **115 — Quartz 50, Marble 45, Granite 20** (D54, D55b). The reasoning below still holds; the counts do not.

- **`stones/catalogue_source.py` is the source of truth.** Edit that, then re-run the injector,
  because ⚠️ **the catalogue is duplicated** into `MATERIALS` (index.html, the wheel) and
  `STONE_LIST` (`stones/build_stones.py`, the collection and the 52 stone pages). If the two
  disagree, the same stone renders differently in different places.
- **Nile Stone** runs an Angular front end over a JSON API:
  `POST /secure/inventory/{category}/{page}/{id}`, the id being the number in the product slug.
  Thickness, block number and real slab sizes came off their live inventory. Nine stones returned
  `total_items: 0` (no stock that day) and carry names only, no invented specs. **Next Stone Slabs**
  publish no specs; their ten names were verified against `/quartz/`.
- ⚠️ **Nine stones filed under Marble are QUARTZITE** (Taj Mahal, Cristallo, Patagonia, Lemurian
  Blue, Fusion Blue, Fusion Black, Bianco Eclypsia, Blue Roma, Belvedere) and one is **travertine**.
  The client groups them under Marble, which is fine, but marble care copy says the stone *etches*
  and is *softer*, which is **plainly wrong for quartzite**. Each carries a `facts=` override that
  replaces kind/care/wear on its own page. **Never let a quartzite inherit marble care copy.**
- The colour filter gained **Blues and Greens**, because the real range has them.
- Stone pages show **finish, typical slab size and thickness**, omitted rather than guessed.
- ⚠️ If the catalogue ever shrinks, **prune `stones/*.html`** or dead pages linger. 34 were deleted
  on 6 Aug.
- ~~**Still to do: real photography.** Every stone renders procedurally from a preset + seed.~~
  ✅ **DONE 10 Aug — all 115 stones carry a real supplier photograph, and a description written from it (D62).** The procedural `marble()`
  render is now the FALLBACK only, used where a stone has no tile in `assets/slabs/manifest.json`
  (currently none). Keep it: it is vector, sharp at any size, and it is what makes it safe to
  refuse a doubtful photograph. `preset` and `seed` are still carried on every stone for that
  reason, and `derive.py` keeps them resembling the real slab.
  See `HANDOVER-2026-08-10-slab-photography-complete.md`.

### The slab wheel

- ⚠️ **Two lists, on purpose.** `SLABS_UNIQUE` is what the filter matched and is what the
  "Showing 8 of 8" count reads. **`SLABS` is the belt the wheel turns, which is that list REPEATED
  until it is wider than the screen.** On desktop the pitch comes from the rail geometry and
  ignores how many stones there are, so granite's eight stones made an 880px belt inside an 1182px
  wheel and the fan visibly stopped short of both edges (client, 6 Aug). `makeBelt()` repeats the
  range instead. **Do not fix this by stretching the pitch** — at 1920 an eight-stone belt would
  need a step wider than the card and the shingle overlap would break into separate floating cards.
  Verified: all three materials span the screen at 1182 and 1920, granite holds through a full
  rotation, and a filter down to one stone still fills the wheel.
- Below 1121px `metrics()` already carries its own `(W+cw*2)/n` coverage term, so `makeBelt`
  deliberately does nothing there (repeating would feed back into that term).
- The wheel is full-bleed, the two rails are docked to the viewport edges and must stay a matched
  set (same width, height, type, one even gap). Depth is **brightness, never opacity**.
- `--railW` / `--railBlockH` live on `.stone-stage` and `metrics()` **reads** `--railW`. Never
  hardcode it.

---

## 6. The estimator

The most worked-on part of the site. Read this whole section before touching it.

### 6.1 The price is a LOOKUP, not a build-up

```
low  = BRACKETS[worktopSlabs][island ? 'island' : 'solo'][0] + (removal ? 200 : 0) + metres*150
high = BRACKETS[worktopSlabs][island ? 'island' : 'solo'][1] + (removal ? 200 : 0) + metres*300
```

| worktop slabs | no island | with island |
|---|---|---|
| 1 | £2,000 – £2,500 | £2,300 – £2,800 |
| 2 | £3,000 – £3,600 | £3,850 – £4,300 |
| 3 | £3,850 – £4,300 | £4,350 – £5,000 |
| 4 | £4,350 – £5,000 | £5,100 – £5,550 |

- ⚠️ **The index is the slabs the WORKTOPS need, NOT counting the island.** The client's own figures
  force this: 2-with-island is exactly the 3-slab solo bracket, and 3-with-island is exactly the
  4-slab solo bracket. That is "an island adds a slab" already priced in. `compute()` packs
  **twice** — once with everything for the drawing, once with non-island rows for the price. The
  ticket may honestly say "3 slabs" while the bracket read was "2 + island". Intended.
- ⚠️ **The 1-slab island row breaks that pattern.** Built exactly as given. Flagged, unanswered.
- **Past four worktop slabs there is no bracket** → "Priced by hand". Do not extrapolate a fifth.
- ⚠️ **The slab count IS the price**, so a wasted slab is an £850 error. `pack()` runs the same
  guillotine packer over four sort orders and keeps the fewest-slab result. Do not collapse it.
- `round50` is gone. The brackets are exact client numbers.

### 6.2 Marble, granite and now porcelain have no calculator

`MATS[mat].poa` is true for all three (**porcelain added 7 Aug, §4c**). The panel is replaced by a
POA block, the ticket draws **one whole slab** with a name plate, the stamp reads "By appointment"
and the ticket's CTA is hidden (the POA panel already carries a CTA and the phone number). ⚠️
Porcelain also carries `noCat:true`, so its stone picker is hidden and its POA reason differs (the
job varies, not the block) — see §4c.

⭐ **The owner's actual reason, and it is in the copy:** not mystique about blocks and craft, but
that **the material cost swings enormously between one stone and the next and between
distributors**. Two customers asking for "marble" can be quoted wildly different numbers.

### 6.3 The rows

`label · length · width · thickness · used for · remove`, all in mm.
- **One row is one piece.** Quantity was removed; "depth" is called **width**.
- **No native `<select>` anywhere.** The OS dropdown is the one thing that cannot be styled.
  Thickness is a **segmented pair**; "used for" is **our own listbox** (`usePop`, appended to
  `<body>`, `position:fixed`, placed off the trigger's rect, flips above when there is no room,
  clamps into the viewport, closes when the trigger scrolls away, full keyboard support).
  ⚠️ Outside clicks close it on **`pointerdown` in the capture phase** — a plain click fires after
  the row rebuild and lands on whatever moved under the cursor.
- **"Used for"** is the client's five plus two the model needs: `Worktop run` (their list has no
  word for a plain run) and **`Island`, which is load-bearing** because it picks the bracket column.
- **Upstands clamp width to 100–150mm** and rebuild the row so the field's own min/max follow.
- ⚠️ **First-run state: ONE row, no shape chip preselected.** It used to open on a preset L-shape,
  which is somebody else's kitchen the visitor has to undo first.

### 6.4 Extras and edging

⚠️ **No prices beside the toggles.** Removal (£200) and detailed edging (£150–£300 per linear metre)
still move the number, but they move it **in the estimate**, and `#estAdds` names them in words. A
running bill beside the switches turns the panel into a menu and invites haggling.

Edging flow: tick → **choose a profile** → *then* the metres field appears. Nothing is added until a
real number is entered. The **18 profiles are drawn as SVG cross-sections** from the client's chart.
⚠️ The Ogee needs its convex-then-concave S or it is indistinguishable from the Cove.
⚠️ "Waterfall" is both a profile and an extra. Same word, two things, both on screen. Flagged.

### 6.5 The stone, and uploads

- The chosen stone is **never blank**: whatever the wheel or a deep link handed over, otherwise
  `BEST[mat]` (currently `calacatta-fantastico` / `calacatta-gold-oro` / `absolute-black-extra`).
  ⚠️ Those are slugs — if the catalogue changes, check them.
- The picker shows the full range per material with **search by name**, and choosing one dispatches
  `topcat:stone` so the enquiry chip follows. The thread runs both ways.
- ⚠️ `.sp-face` needs `display:block` — it is a `<span>` and inline boxes ignore `aspect-ratio`.
  ⚠️ Swatches use `background-size:100% 100%`, not `cover`; a cover-crop of a pale stone at 44px
  lands on a plain patch and reads as a blank card.
- **Uploads** (`TC_UP`, top level, just above the estimator IIFE): one shared store behind **three**
  controls — the POA panel, the quartz calculator (`.compact`) and the enquiry form, where it lives
  behind a disclosure (§4a). Attach a plan anywhere and it is already on the form. 8 files, 10MB
  each, `pdf jpg jpeg png heic heif webp gif doc docx dwg dxf`. Rejections are named out loud.
  Blob URLs are revoked on remove. Plus the owner's **supplier-link field**, for a slab they have
  already found.
- The faded stone wash is on the **cutting-plan side only**, inside the card. ⛔ **No bright band
  across the top of anything** — that was tried and rejected outright.

### 6.6 ⭐ NEXT: the product-type selector

The client wants a "what are you looking for?" step so the estimator speaks to every buyer.
**The finding that shapes it: they have only ever priced kitchens.** So:

**Priced (calculator + brackets, quartz only):** kitchen worktops, island, splashbacks, outdoor,
commercial. Marble and granite stay POA.

**Enquiry-led (no invented numbers):**

| | measurements | material | notes |
|---|---|---|---|
| **Vanity tops** | PDF **or** manual | quartz colour picker, or photo/link for marble and granite | edging extra at £150–300/lm |
| **Fireplaces** | **PDF only**, no manual entry | photo or link, **marble and granite only, no quartz** | the client's call |
| **Tables** | PDF **or** manual | quartz picker, or photo/link | shape selector including custom |

Plus a way out for anything else, which the `.est-help` band already does ("Not quite your space?"
→ Talk to our team / Call).

**Ask Nick for:** any brackets at all for vanity tops, fireplaces and tables; whether 20 vs 30mm
should change the price (it currently does not, because his table does not vary by it); and whether
the odd 1-slab-with-island bracket is deliberate.

### 6.7 The eleven guarded defects

All still hold, and every control built since was built to the same rules: jointed segments never
rotate; `hasOwnProperty` not truthiness on any preset from a URL; functional copy is `--muted` never
`--faint`; the rolling price writes `#estPrice` per frame while `#estPriceSR` is written **once**
per recompute; `aria-pressed` on every tab and chip; focus is handed on after a row is removed;
`+ Island` honours the row cap; an emptied piece field restores the model's value (the linear-metres
field is deliberately the exception); `#estBoard` has `role="group"`.

⚠️ **The `hidden`-attribute trap:** `.est-modal`, `.est-stats`, `.est-pop`, `.est-adds` and
`.est-out .btn-gold` all set their own `display`, which **beats** the `hidden` attribute's UA
`display:none`. Each needed an explicit `[hidden]{display:none}`. Check any new element you toggle.

⚠️ **Dialog open state is a FLAG, never the `.open` class** — the class lands on the next frame, so
an Escape in the same tick would read the dialog as shut.

---

## 7. Open items

0. ⭐⭐ **THE ENQUIRY FORM HAS NO BACKEND, AND IT CARRIES FILE UPLOADS.** The biggest gap between
   demo and working site. `buildEnquiry()` in the CTA IIFE assembles everything into a `FormData`
   (details, stone, supplier link, up to 8 attachments) and has nowhere to POST. Needs a handler
   that accepts `multipart/form-data` — Netlify Forms with uploads is the obvious fit since the
   site has been deployed there before. Decide where enquiries land (info@topcatworktops.co.uk) and
   whether attachments are emailed or linked. Until then the form says plainly that nothing was
   sent, which is the only honest thing it can say.
1. ⚠️ **Cannot push to GitHub from this machine.** No `.git`, no `gh`, no credential helper. A fresh
   `git init` shares no ancestry with `github.com/lukecopley6/Topcat-Worktops`, so a push would need
   `--force` and would destroy their history. Confirm with the repo owner first.
2. **The estimator product-type selector** — §6.6. The live job.
3. ✅ **Real stone photography — DONE for all 115 (D44–D48).** Written when the client was sending images for 52. Biggest conversion
   cap on the site. ⚠️ It is now also an SEO dependency: the location pages were built to assemble
   themselves from real dated projects, which is the one asset no competitor in this vertical has.
   Photograph every install with its town and date.
4. **Real project photos and names.** The eight `PROJECTS` entries reuse service images with
   invented names and places.
5. **Photography still owed** — ⚠️ **the shot list CHANGED on 9 Aug (D34, D35), re-read it.**
   - ⭐ **Three head-and-shoulders portraits of Nick, Rimsha and Ali**, and they are now
     **1:2 standing crops, not squares** — they are the bottom half of the About collage
     (`.ac-p`), not thumbnails in a strip. This is the most visible unfinished thing on the page
     after the stone photography, because the three tiles are a third of the composition. They
     are the only remaining marked placeholders on the landing page. Drop an `<img>` in above
     each `figcaption` and the plate, scrim and name are already right.
   - **One feature shot for the Why mosaic** (`.wy-p`): the whole team together, or a finished
     install. ⚠️ That slot currently holds `assets/team/team.jpg` as a **stand-in** so the
     section can be judged (client's instruction). It no longer *looks* unfinished, so it is
     easier to forget — it is still a placeholder.
   - **The three About work photographs** (handshake, samples, fitting) are AI-generated
     placeholders in `assets/team/`. Keep the shapes, swap the images.
   - ⚠️ Do **not** commission replacements for `mason.jpg` or `polishing.jpg`. They were dropped
     on 9 Aug because they imply in-house fabrication, which D21 forbids.
6. **Agreed order of work (client, 30 July):** finish desktop sections, **then** the mobile and
   tablet pass across the whole site, **then** real photography and copy. Mobile is genuinely
   untouched: at 375px the sections stack and run well past one screen, which is expected, but
   nothing there has been designed yet. ⚠️ The hero's known mobile issue is in §4b.
7. **The estimator section overruns the fold**, and always has. Head→`.est-grid` is ~878px against
   an 824px budget at 1440×900; it was 918 before the pricing session. ⚠️ **The driver is the
   right-hand ticket, not the input panel** — closing the rest means shrinking the drawn slab,
   which is a design decision rather than a tidy-up.
8. **A clamp-floor sweep has STILL not been done sitewide.** Violations turned up by accident on
   6 Aug (§4) and again on 7 Aug, when four flat measures in `.cta-form` pushed the contact card
   37px past one screen the moment anything was added below the submit button (§4g). Both times
   they were found by a section breaking, not by a sweep. Grep every `clamp(` **and every flat px
   vertical measure** in the style block, work out its value at a 610px viewport, and fix any
   where the floor wins. ⚠️ Flat px measures are the worse half of this and the easier half to
   miss, because they do not look like clamps at all.
9. **Copy the client has not seen:** the `/trade/` page, `.trade-prompt`, `PROC_DETAIL`, and the 52
   stone blurbs are all ours. Worth a read-through with them.
10. **Confirm live paths before go-live.** Canonical and OG on the service, stone and trade pages
    assume `/services/<slug>.html`, `/stones/<slug>.html` and `/trade/`.
11. **V2 is well behind V1** and has had no work for many sessions beyond the porcelain strip-out.
    If the client picks it up, expect a sizeable catch-up.
12. **Closed, do not reopen unprompted:** ornate dividers (three designs rejected); the scroll-tied
    process animation (⚠️ `#process` only — About and Why are scroll-tied on purpose, §4a); the
    fourteen-slab flip FAQ; the Why 3×3 mosaic (§4a); stone veining inside the nav CTA; the
    standalone estimator page; **the hero eyebrow and the thin outline icons (§4b)**.
13. **Where the client is up to.**
    - **FAQ — approved twice.** "That's perfectly fine" on 6 Aug at eight questions, and again on
      9 Aug on the four-column contents page. ⛔ It is settled. Do not redesign it unprompted.
    - **About** — rebuilt 9 Aug to their brief (D34), **not seen since**.
    - **Why** — the mosaic had one round of feedback applied on 7 Aug; the tiles were designed
      on 9 Aug (D35), **not seen**.
    - **Contact block** — seen once, no comment; the foot changed again on 9 Aug (D36), not seen.
    - **Hero** — pass one seen and sent back; **pass two has NOT been seen.** It carries one open
      recommendation ("Request a call", §4b) and one live disagreement (the supplier-discount
      reason, D2).
    - **The whole SEO layer (§4d)** — not seen at all.
    - ⚠️ The pacing of the two scroll builds, and the nav bar's flash, can only be judged by eye,
      so watch them scroll it rather than describing it.
14. ✅ **DONE 7 Aug.** The last `hello@` in the homepage JSON-LD, and the `areaServed` list that
    named only Hertfordshire towns, were both corrected. So was the landing page title, which
    still said "St Albans & London".
15. ⚠️ **V2 (`/v2/`) was not touched by the fabrication rewrite** and still carries in-house
    claims and dead schema. It is dormant and unlinked from the main journey. If it is ever
    revived it needs the same pass V1 got, see §4d.
16. **The client has not seen most of the 7 Aug work.** That is the hero second pass (§4b),
    porcelain, the Trade nav and the region line (§4c), the entire 25-page SEO layer (§4d), the
    animation changes and the helix's new card backs (§4e), the sitemap (§4f), the FAQ redesign
    (§4a) and the enquiry form's new foot (§4g). Show the SEO pages by walking a material page, a
    guide and a town page, in that order, because the town page only makes sense once they have
    seen the pattern. ⚠️ **The animations can only be judged by eye and only in a real browser**
    — watch them scroll it, and see §4a on why the Browser pane cannot show them.
    ⚠️ The FAQ and the helix back faces each went through client feedback rounds inside the same
    session, so what is on the page is the third iteration of both. Show them the current state
    rather than describing the journey.
17. **The client has not seen ANY of the 9 Aug work** — the reviews CTA (§4j), the nav bar's
    flash (§4h), the About rebuild and alignment (§4a), the Why tiles in stone (§4i), the
    enquiry form's foot (§4g), the FAQ and CTA spacing (§4a), the footer cut (§4k) and the new
    page floor (§4l). ⚠️ They gave four rounds of direction on the floor without seeing the
    finished state, so **show that one first** — everything else sits on top of it.
    ⚠️ **Show About and Why by scrolling, not by screenshot**: both sections' builds are motion,
    and the nav flash only exists in the moment you leave the top of the page.
    ⚠️ Say out loud that the three director portraits and the Why feature shot are placeholders —
    the Why one now holds a real photograph and no longer announces itself.
    ⚠️ **Walk the footer on a generated page as well as the landing page.** The cut went into all
    five copies and the sub-sites are where a drift would show first.
18. ⭐⭐ **BUILD `/services/` — the client now assumes it exists.** ⚠️ Upgraded from a note to a
    recommendation on 9 Aug. Describing the footer, the client said Services should be one link
    and "when they click on that it goes to the services page, and all that section of the site".
    That page does not exist; the link points at the landing page's services section instead
    (§4k). It is also the one page family without a hub, and a hub is the natural landing page
    for the broader-than-kitchens positioning D23 asked for. **It needs copy the client has not
    seen, which is the only reason it was not built.** Offer it next; repoint the footer link in
    all five places the day it lands.
19. ⚠️ **There is no `/services/` index page.** Materials, guides and areas each have a hub;
    services does not, and building the sitemap is what surfaced it (§4f). Not a break — the six
    pages are linked from the landing section, the footer and every "Not only kitchens" block —
    but it is the one family without a hub, and a hub is the natural landing page for the
    broader-than-kitchens positioning D23 asked for. Needs client copy, so it was not built.

---

## 8. Verification gotchas

- ⛔⛔ **THE BROWSER PANE CANNOT TAP ANYTHING IN MOBILE-EMULATION MODE, AND IT FAILS SILENTLY —
  12 Aug 2026.** At any viewport under 768px the pane translates `computer left_click` into touch
  events, and **the finger never lifts**. An event probe on the window recorded `pointerdown` and
  `touchstart` and then **nothing** — no `touchend`, no `mouseup`, no `click` — and the call itself
  dies after a 30s timeout with the misleading message *"The pane may be stuck (modal dialog,
  navigation hang, or unresponsive renderer)"*. ⚠️ **Nothing on the page is clickable under
  automation at phone width**, so this reads exactly like "the feature I just built does not work".
  ⭐ **THE CONTROL EXPERIMENT IS THE WHOLE TRICK, AND IT TAKES ONE MINUTE**: tap something that
  long predates your change and needs no JavaScript — the sticky bar's `Get a quote`, a plain
  `<a href="#cta">`. It does not navigate either, and the hash does not change. That proves the
  environment, not the page. ⭐ **HOW TO ACTUALLY VERIFY A PHONE-ONLY TAP HANDLER**: resize to a
  width ≥768 so real mouse events are delivered, then force the phone branch on with an injected
  `<style>` setting the mode custom property (`--svcMode`, `--hxMode`, `--galMode`) and fire a real
  click. That exercises the genuine handler with genuine user input. ⚠️ A `dispatchEvent(new
  MouseEvent('click'))` does run the handler and IS worth doing, but it only proves the handler
  exists — never that anyone can reach it (§10). ⚠️ **And `location.href` read in the same tick as
  the assignment still returns the OLD url** — navigation is asynchronous, so a same-tick check
  reports failure on a navigation that is about to succeed. Read it in a later call.
- ⚠️ **The Browser pane's console is unreliable** — it replays stale entries from earlier loads,
  including from files you have since deleted, with line numbers that do not match. **Do not trust
  it.** The reliable method: write an instrumented copy that installs its own error handler before
  the page scripts, load that, scroll the whole page, and read `window.__errs`:
  ```
  python3 -c "…insert <script>window.__errs=[]…</script> right after <head>…"
  ```
  Delete the copy afterwards.
- ⚠️ **Syntax-gate the inline JS BEFORE loading the page — a missing comma cost a debug loop on 7
  Aug.** Editing the `FAQS` array left the previous last entry without a trailing comma, and the
  whole script block threw `Unexpected token '{'`, blanking the FAQ. The pane's console lied about
  where. The gate: extract every inline `<script>` that is not `application/ld+json`, concatenate,
  and `node --check`. Also `json.loads` every `ld+json` block. Both are one Python snippet and they
  catch this class of error before the browser ever runs:
  ```
  # non-json inline scripts -> node --check ; ld+json blocks -> json.loads
  ```
- ⚠️ **Anchored find-and-replace in this file needs an ORDER ASSERTION.** `index.html` is ~886KB
  and short CSS anchors repeat. A two-marker slice whose start index lands *after* its end index
  silently duplicates everything between them — that happened on 6 Aug and added 121KB of
  duplicated CSS and markup before it was caught. **Always `assert start < end`, print the byte
  delta, and diff the selector list against the backup afterwards:**
  ```
  diff <(grep -o '^\s*\.[a-zA-Z][a-zA-Z0-9_-]*[{, ]' OLD.bak | tr -d '{, ' | sort -u) \
       <(grep -o '^\s*\.[a-zA-Z][a-zA-Z0-9_-]*[{, ]' index.html | tr -d '{, ' | sort -u)
  ```
  Anything unexpectedly deleted shows up immediately.
- ⚠️ **The pane runs HIDDEN, so `requestAnimationFrame` is paused.** `document.visibilityState`
  is `'hidden'`, and a rAF counter installed from `javascript_tool` reads **zero frames** between
  two calls. Anything on a time-driven clock — the Why mosaic, the services helix entrance — will
  appear frozen part-built and you will "find" a bug that is not there. The method that works:
  copy the page, insert a shim directly above `</head>` that swaps rAF for a queue you drain
  yourself, then step the timeline by hand and read the DOM after each step.
  ```
  window.__q=[];
  window.requestAnimationFrame=function(cb){window.__q.push(cb);return window.__q.length;};
  window.__pump=function(t){var q=window.__q;window.__q=[];q.forEach(function(cb){cb(t);});};
  ```
  Then `__pump(0)`, `__pump(150)`, `__pump(300)`… and read `--hxO` or `style.opacity` after each.
  ⚠️ **The IntersectionObserver that starts these builds also needs a rendering opportunity**, so
  scroll in one `javascript_tool` call and pump in the *next* one. Pumping in the same call as
  the scroll reads all zeroes, because the observer callback has not been delivered yet.
  Delete the copy afterwards.
- ⚠️ **Transformed elements measure wrong.** `.rise` elements are translated until revealed, and the
  §4a mosaics are scaled by their own perspective mid-build, so `getBoundingClientRect()` returns
  the *visual* box, not the layout box. Force `.in` on every `.rise`, scroll the mosaics to their
  settled state, and only then measure. Section heights are safe (the section itself is not
  transformed); tile sizes are not.
- **Trust geometry over screenshots.** The pane renders emulated widths scaled, and it sometimes
  paints a stale frame after a resize — it did so repeatedly on 6 Aug, rendering the page in a
  ~508px box inside an 800px shot. `resize_window` to the `desktop` preset clears it. Drive
  `javascript_tool` and read rects and computed styles.
- **To inspect something small (an icon, a chip) close up:** clone it into a fixed full-screen
  overlay at a large CSS size and screenshot that. ⚠️ Strip `hero-el` / `rise` off the clone and
  force `opacity:1`, or it inherits `opacity:0` and you photograph an empty box. `zoom` with a
  region is **not** supported by the pane — it returns the full screenshot.
- **A hidden pane cannot paint mid-page screenshots.** The workaround: pin the section over the
  viewport (`#x{position:fixed;inset:0;z-index:9998;background:var(--ink)}` plus
  `*{transition:none}`), force its scripts to their settled state, screenshot at scroll 0, reload.
  Sections are transparent, so the background is required or whatever is underneath bleeds through.
- **`scroll-behavior` is smooth**, so set `document.documentElement.style.scrollBehavior='auto'`
  before assigning `scrollTop`, then dispatch a `scroll` event.
- ⚠️ **Do not drive the stone wheel's material tabs from a scripted loop.** Clicking through them
  programmatically navigated the page to `/stones/` twice during verification and killed the run.
  Check the wheel by hand, or measure it one material at a time.
- ⚠️ **The Browser pane's click coordinates are not CSS pixels.** Clicks placed from a screenshot
  landed hundreds of pixels off. Use `read_page` and click by `ref`, or call `.click()` in JS.

**Health check:** reload → zero errors after scrolling the whole page → no horizontal scroll at
1920/1440/375 → the wheel spans the screen on **all three** materials → the estimator prices an
L-shape at £2,000–£2,500 and a marble tab goes POA → the listbox opens, arrows move, Escape returns
focus → hero, About, Why and the contact card each inside one screen at 1366×610 / 1200×655 /
1512×824 → the hero's trust line on one line and all three reasons at 1+1 lines → the About tiles
arrive one at a time over roughly a screen of scrolling → **the six services helix cards build
top-first over about two seconds, and the six Why tiles reach FULL brightness with the section
simply framed, without scrolling further** (§4a, §4e — the Why one has to be checked with the
whole section in view, not with the mosaic pushed to the top of the screen) → **the helix's top
and bottom cards read as pale stone, clearly visible against the ground** (§4e) → **the FAQ shows
four even columns of three, the plate does not change height on ANY of the twelve, and Tab walks
the twelve while the arrows step column-wise** (§4a) → **the enquiry form's two columns finish
level, with the three next-steps lines below the submit and NO Call us button** (§4g, D36) → the
upload disclosure opens itself and shows a count when a file is attached in the estimator →
**the page floor is visibly stone — a gold vein network in near-black, not stripes — and it stays
BEHIND everything, with no section competing with it** (§4l; if it looks loud, `--floorVeil` is
the one knob) →
**the nav bar's gold line draws out from its centre with a bright head running to each edge the
first time you scroll past 40px, and there is still no horizontal scroll while it does** (§4h) →
**"Let's bring your vision to life" under the reviews is gold, underlined and clickable** (§4j) →
**the About collage is three equal portrait tiles OVER three work photographs, Nick, Rimsha and
Ali's names all sit on ONE baseline, and the section title's top and the CTA's bottom line up with
the collage's top and bottom edges** (§4a — the role reserves two lines, so a name sitting proud of
the other two means that reservation has been lost) → **the five Why tiles are veined black stone
with a solid gold icon and ⛔ NO gold line on their top edge** (§4i, §2 rule 10) → **the feature
tile holds a photograph** → **the FAQ sits close under its divider and is nowhere near 100vh**
(§4a) → **the footer is four columns and fits the viewport, with Materials, Guides and Areas each
linked once at its hub** (§4k — if the Browse column has gone, three page families have been
orphaned) →
`/sitemap.html`, `/stones/`, `/trade/`, `/services/*`, `/materials/*`, `/guides/*`, `/worktops/*`,
`/v2/` all 200.

---

## 9. Reference

- **`stones/catalogue_source.py`** — the 52-stone dataset, source of truth for the catalogue.
- **`HANDOVER-2026-08-07-design-round.md`** — the narrative of the 7 Aug design round, and the
  best single explanation of why the Why mosaic and the FAQ are built the way they are.
- **`HANDOVER-2026-08-07-seo-build.md`** — the narrative of the 7 Aug SEO session.
- **`HANDOVER-archive-to-2026-08-06.md`** — every earlier round, including the rejected designs.
  Read before redesigning the process section, the gallery, or any divider.
- **`HANDOVER.pre-hero-session.bak.md`** — the previous copy of this file, before the hero session.
- **`TopCat-Website-Copy-and-SEO-Strategy.pdf`** — research, copy and SEO strategy.
- **`Docs/`** — client briefs and sales-call notes, the ground truth about the business.
- **`Section Specs/`** — per-section specs from the client.
- **`memory/topcat-copy-constraints.md`** — the standing rules, auto-loaded each session.
- **Backups** (`Website Demo/index.html.pre-*.bak`), newest first. ⚠️ **These are the only version
  control. Keep the recent few.**

  | file | the state it preserves |
  |---|---|
  | `.pre-background.bak` | ⭐ before the page floor was replaced — the old blurred-stroke SVG in `--marbleBG`, and `body::before` with no veil layer (§4l) |
  | `.pre-footer-cleanup.bak` | ⭐ before the 9 Aug **second** round — the six-column 931px footer, the FAQ still pinned to 100vh, the Why tiles with their gold top seam, the owners at the BOTTOM of the collage, the un-aligned About column (§4a, §4i, §4k). ⚠️ Each of the four builders has its own `.pre-footer.bak` beside it from the same moment. |
  | `.pre-about-rebuild.bak` | ⭐ before the 9 Aug **first** round — the About credit strip and four-row collage, the undressed Why tiles and dashed feature slot, the CTA's Call us button and `.cta-or2` seam, the non-clickable reviews line, and the nav bar with no flare (§4a, §4g–§4j) |
  | `.pre-faq-redesign.bak` | before the 7 Aug FAQ redesign, the CTA form foot and the helix back faces (§4a, §4e, §4g) |
  | `.pre-sequence.bak` | before the 7 Aug animation changes — Why still on `scrollSequence`, helix with no entrance (§4a, §4e) |
  | `.pre-partners.bak` | before the 7 Aug fabrication rewrite (§4d). Also exists for all three builders. |
  | `.pre-porcelain.bak` | before the 7 Aug porcelain / Trade-nav / region / FAQ changes (§4c) |
  | `.pre-hero2.bak` | before the hero's **second** pass — shortened eyebrow, thin outline icons, room-list one-liner |
  | `.pre-hero.bak` | before the hero touched at all — 9px eyebrow, three-line subhead, no reason row |
  | `.pre-sections.bak` | before the About / Why / FAQ / contact redesign — two-column Why, accordion FAQ, always-open uploader |
  | `.pre-catalogue.bak` | before the real 52-stone catalogue went in |
  | `.pre-reorder.bak` | before the estimator moved to sit after the stones |
  | `.pre-pricing.bak` | before the bracket-table re-pricing |

- `Website Demo/index-v2.html` — an old unrelated design, unlinked and stale, safe to delete.
- ⚠️ **Dead CSS worth knowing about:**
  - `.reasons` (a four-cell proof bar ported from V2) has rules in the style block but **no markup
    anywhere**. Either use it or delete it; do not assume it is live.
  - `.ph-title` — ⚠️ **there are TWO different rules with this name.** The one near the top of the
    sheet is a 34–64px display title and has been dead for some time; it is left alone. The other
    was part of the placeholder skin and **was removed on 9 Aug** along with `.ph-slot` and
    `.ph-note`, because both of their users went that day (§4a, §4i). If you need a dashed
    "shot to come" frame again, it is in `index.html.pre-about-rebuild.bak`.
- **`Docs/topcat-worktops-SEO-LOG.md`** — ⭐ the SEO record for the client's specialist. Update it
  whenever anything SEO changes.
- **`Docs/topcat-worktops-seo-build-plan.md`** — the research behind the build (§10).
- **`Website Demo/build_seo_pages.py`** — generates all 25 SEO pages **and `/sitemap.html`**.
  House rules in its docstring.
- **`Website Demo/seo.css`** — components for the material, guide, location and sitemap pages.
- **`Website Demo/assets/stone-floor.webp`** — ⭐ the page floor (§4l). 90KB, 2048×1152, a graded
  Nero Portoro slab. It is the value of `--marbleBG`, so it is ALSO the nav glass, the CTA card,
  the estimator modal and the trade prompt. ⚠️ Do not swap it without reading §4l: it is tuned to
  measured luminance targets and to zero thick-vein content, and getting either wrong changes the
  weight of every section on the site at once.

---

## 10. ⭐ SEO — where everything lives, and the rules

**The full record is `Docs/topcat-worktops-SEO-LOG.md`.** It is written to be handed to the
client's SEO specialist cold, and it is the file to update whenever anything SEO changes. It
contains every URL with its title, word count, schema and target query; the internal linking
structure; every schema decision with the reason it was built or removed; the location page rules;
the phased town rollout with its gate; the silica accuracy rules; copy-paste compliance scans; and
a dated change log.

### The six rules that are easiest to break by accident

1. **Never add `FAQPage`, `HowTo`, `Service`, `WebSite`+`SearchAction`, or `aggregateRating` on
   our own pages.** All dead or ineligible in 2026. §4d.
2. **Never claim in-house fabrication.** D21.
3. **Location pages stay under ~40% of URLs**, currently 26%, and never bulk-publish.
4. **Never expose the review count**, in copy or in schema. D7.
5. **Never name the suppliers publicly.** D8. The `sup` field stays in the data and is never
   rendered, which was verified.
6. **Never hand-edit `/sitemap.html`.** It is generated by `build_seo_pages.py` from the same
   lists as the pages (§4f). A hand-edit is lost on the next rebuild, and a sitemap that has
   drifted out of sync is worse than none.

### Run these before go-live

They are written out in full in the SEO log §8. In short: scan for fabrication claims, dead
schema, supplier names and founding-year language; syntax-gate the inline JS with `node --check`;
validate every `ld+json` block; and check for broken links and orphans.

### The next SEO actions, in order

1. **Conversion tracking**, which is blocked on the enquiry backend (§7.0). Nothing else matters
   as much, because leads are the metric this engagement is judged on.
2. **Buy one month of Ahrefs or Semrush** and validate the town list before Phase 2. All current
   prioritisation is ordinal, from SERP composition and UK autocomplete, with no cardinal volumes.
3. **Real project photography with the town and date**, which is what makes the location pages
   genuinely local and is the one asset no competitor in this vertical has.
4. **Review generation naming the town and the fitter.**
5. **Phase 2 towns**, only after the 90-day gate: Watford, Hemel Hempstead, Chelmsford, Romford,
   Slough, Wimbledon.
6. **Consider the WFF Quality Mark**, the cheapest E-E-A-T signal available in this niche.
