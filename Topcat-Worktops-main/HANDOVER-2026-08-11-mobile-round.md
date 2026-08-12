# The first mobile round — 11 August 2026

The narrative behind **D90–D98**. `HANDOVER.md` carries the state; this carries the reasoning, and
in particular the reasoning behind the things that were got **wrong** first, because those are the
parts a later session is most likely to undo by accident.

---

## 1. How the round opened: desktop closed

The session began with one small desktop change and one large instruction.

The change: the final CTA card carried `--marbleBG` at `cover` — the page floor's own photographed
Portoro slab, but at full strength rather than whispered in the way the nav glass takes it. The
veining ran straight through the six form fields. The client asked for "a plain background, that
grey that we have", and it became `--ink-2`, the panel grey the FAQ plate, the gallery tiles, the
About collage tiles and the estimator panels already use.

⚠️ **It was not simply the image removed.** The `background-color` underneath was `#101015`, which
is near-black rather than grey, so dropping the image alone would have produced a black card. The
grey had to be stated.

Then the instruction (D91):

> "After this, desktop will stay exactly as it is in its current design, until I decide to change
> it again… When I mention changes, I'm only referring to mobile, and then afterwards I will say
> we're going to work on tablet. **Everything else stays exactly as it is on the other devices.**"

⭐ **This is a harder constraint than it sounds, and the reason is structural.** `index.html` is
one file with inline CSS. Almost every rule is unscoped and therefore applies at every width.
There is no module boundary to hide behind: "fixing it on mobile" by editing a base rule silently
changes a desktop the client has just signed off, and — per §9 of the START HERE — it renders
perfectly while doing it.

Two things followed from that, and both should outlive this round:

1. **Every mobile rule went inside `@media(max-width:720px)`.** 720px is the hero's existing
   mobile ceiling and it clears iPad portrait at 768, which is what keeps tablet genuinely out of
   scope rather than nominally out of scope.
2. ⭐ **The freeze is proven, not asserted.** Before each change the pre-change file was copied
   beside the live one, both were served, and the same set of rects and computed styles was
   probed at 1440×900 and 768×1024 in each and diffed. Every round in this document ends with
   that diff coming back identical. It caught nothing — which is the point; without it, "desktop
   is untouched" would have been an opinion.

---

## 2. The hero

Centring was the easy half. The interesting parts were the two things centring broke.

**The line-reveal mask.** `.hl` is an `overflow:hidden` box that carried `.08em` of padding on the
**right only**, to stop the last glyph's overhang being clipped. Left-aligned that is invisible.
Centred, it pushes the title half that distance off-centre. It is symmetric now.

**The trust line's gold rule.** `.hero-sub::before` is a left-edge mark — the client's own earlier
request for that line to "stand out in a different way". Against centred text it strands itself at
the far left of a full-width block and reads as a stray mark. It stands down on mobile only, and
the client was told, because it was his request being dropped.

⛔ **It was deliberately NOT replaced with a short gold rule above the copy.** That is the
top-edge hairline §2 rule 10 forbids, and the rule has been broken twice already by someone
inferring that a *particular* placement was fine.

### The bevel, and a piece of geometry worth keeping

The curved bottom edge became a matched bevel. The first version was 45°, later reduced to 30° and
then given much shorter corners so the flat run reaches close to the sides.

⭐ **`--bevX` is the run, `--bevY` the rise, and the ratio IS the angle.** 22/38 = 0.579,
tan(30°) = 0.577. Change one without the other and it stops being 30°.

⛔ **The hairline is where this gets subtle.** It is three background gradients, not an SVG,
because a stretched SVG holds its angle at only one width and a stroke scaled on one axis stops
being 1px. At 45° the diagonals were drawn with `to top right` in a **square** box. The moment the
box stopped being square that was wrong — not obviously, but by a few degrees, so the hairline
drifts off the cut it is supposed to trace.

**The derivation, since the next person will need it:** a gradient's colour bands run
*perpendicular* to its gradient line. For the bands to lie along a cut of direction (run, rise),
the gradient line must be perpendicular to it, and solving that gives `tan(A) = rise / run`. So
**A is exactly the bevel's own angle from the horizontal** — 30deg, and −30deg for the mirrored
cut. Use the angle, never the corner keyword.

### The scroll cue

The client asked for the word "Scroll" to go on mobile and observed that the divider could then
move up. ⚠️ **Reducing `min-height` alone did nothing** — the hero's content is taller than 90vh,
so the bottom padding had to come down with it. Measured: 812 → 755px, so the bevel and 57px of
the reviews are both on the first screen.

---

## 3. The reviews

The brief: neighbours visible either side, the pager below, the centre card slightly smaller,
swipeable.

⭐ **The neighbours are the whole affordance.** A single centred card with two arrows gives a
customer no reason to believe there is anything else to read. That is why the card gave up width
(72% of the screen) rather than taking back the width the arrows vacated.

⭐ **`soloDist()` is why the wrap is free.** Each card's *signed, shortest-way-round* distance from
the current page decides its slot, so a page turn is "everything moves one slot" and the last
review's next is the first. ⛔ The park-and-recycle dance `goPage()` performs for the desktop
3-up wall is unnecessary here and must not be copied in — the neighbours are already on screen.

### ⛔ The swipe that only worked on a touchscreen

This is the most instructive failure of the round.

The swipe shipped bound to `touchstart` / `touchmove` / `touchend` **only**. The client tested it
on his MacBook — no touch hardware, therefore no touch events — and neither a two-finger trackpad
swipe nor a click-and-drag did anything at all.

⭐ **The lesson generalises well beyond this control: a phone layout is looked at on a desktop
browser far more often than on a phone during a build, including by the client.**

⚠️ **And it passed its own verification**, because the tests *synthesised* touch events. That
proves the handler works. It does not prove a person can reach it. **Drive the input a person will
actually use.**

Three paths now:

- **touch**, unchanged;
- **mouse**, via pointer events filtered to `pointerType==='mouse'` — ⚠️ move and up bound to the
  **window**, or a drag leaving the deck sticks with the button already up; and `user-select:none`
  while dragging, or dragging across a card of text selects the text and the belt looks frozen;
- **trackpad**, which is a **`wheel` event with `deltaX`** and fires nothing either drag handler
  listens for. ⚠️ Acted on only when the gesture is more sideways than vertical, and locked until
  the wheel stream has been quiet 140ms, because **momentum keeps firing for about a second** and
  one flick otherwise turns five reviews.

⚠️ The Browser pane translates mouse to touch below 768px, so a drag performed there exercises the
**touch** path. `PointerEvent`s with `pointerType:'mouse'` are how the mouse path gets tested.

### Reading a whole review

The open card was being fitted to one screen — right on desktop, wrong on a phone, where it left a
925-character review scrolling inside the card. A scrollbar inside a scrolling page, with no sense
of how much was left. On mobile the card now takes its full content height and the **page**
scrolls, which is the "dragging to read" the client described.

⚠️ `overflow` had to be set on **both** axes: `visible` on one beside `hidden` on the other
computes back to `auto` and the scrollbar returns.

### The spacing complaint that was not a spacing choice

The client said the gap between the subtitle and the buttons was too big. It was 64px, and the
largest single term in it was **invisible**.

⭐ **`.rev` is `inset:0` inside a deck box that is not scaled**, while the card is transform-scaled
to ~0.84. So `(1-scale)/2` of the deck's height — **27px above the card and 27px below** — was
dead space that no CSS rule named. Tuning the numbers that did exist would only have chased it.

`gridLayout()` now writes the measured scale out as `--revScale`, so the stage is sized from the
card a customer can see and the two remaining numbers mean what they say. ⚠️ The phone helix
therefore **skips the stage-height cap on the scale**, or stage → scale → stage is circular.

⚠️ **One consequence was missed first time**: the open-card pager drop counted the band but not
the half-air the centring puts under the card, so an open card sat 4px from the buttons where a
closed one sits 20. It reads `--revAir` from the stylesheet now rather than hard-coding it.

---

## 4. The services helix

The client wanted the desktop helix on mobile, optimised so the section is not a long scroll, and
offered two ideas: fade it behind the subtitle, or halve the subtitle. **Both were taken.**

⭐ **The section got far shorter, not longer: 2,939px → 629px**, because the helix replaces six
stacked flip cards, which were the tallest block on the phone.

⛔ **The card CSS was LIFTED, not copied.** Everything from `.helix-stage` to `.helix-ui` moved
into a shared `@media(min-width:1121px),(max-width:720px)` block, placed immediately **after** the
desktop block so its order against anything else touching those selectors is unchanged. **A second
copy would have been this project's signature bug for the fifth time** (D51, D59, D68, D78, D93).

⭐ **`--hxMode` is set by the media query and read by the script**, so the breakpoint is declared
once, in the CSS. A `matchMedia` test in the helix would have been a second opinion about what a
phone is.

⛔ **The desktop FLOORS are the trap.** Card 300px, R 210px, STEP 96px are each wider than a phone
can give — the desktop branch would have handed a 335px stage a 300px card and a 210px radius and
thrown the spiral off both edges.

### The fifth card, which shipped invisible

The client asked for one more card top and bottom, very faded and non-interactive, with the top
one **behind** the copy but not obstructing it. What was delivered showed four.

⛔ **Three causes stacked, which is why no single tweak would have found it:**

1. The stage overlapped the copy by 118px, so the top ghost sat **entirely** inside the band the
   mask holds at 0.10 for the text's sake. It had nowhere to be seen. 70px now.
2. ⭐ **The mask's top stops were percentages and had to be pixels.** A percentage scales with the
   **stage**; the thing the stop must meet is the **copy**, whose bottom sits a fixed ~46px below
   the stage top — the negative margin less the head's own margin — and **that distance does not
   move when the copy rewraps at another width**. As percentages the ramp overran the text, so the
   only part of the ghost a customer can see was still climbing out of the fade.
3. The ghost opacity was 0.22 and the mask multiplied it to nothing.

Measured after: **top ghost 32px of exposed card at 0.31 effective brightness, bottom ghost 43px at
0.29** — balanced, where before one was visible and the other was not.

⭐ **A mask reads alpha**, so an intermediate stop is a partial reveal rather than a hard edge.
That is the mechanism that puts a card behind the intro at 0.10 without touching legibility.
⛔ **The mask goes on the STAGE, never on a `.helix-card`** — a mask, filter or opacity on the card
shell flattens its 3D and the back face paints as a mirrored front.

### Two more geometry notes

⭐ **The spiral spans `4·STEP + --hxH`.** Keep that within about a card's height of the stage or a
card that is supposed to be visible quietly stops being so. Vertical room on a phone comes from
the **cards** — a card's height is 0.66 of its width — not from the section.

⚠️ **sin is symmetric about 90°**, so the card one step out and the ghost two steps out sit at the
**same** sideways offset. Pushing the arc too wide collapsed both into one 77px sliver and took
away the tap target the client explicitly asked to keep.

### Interactivity

⛔ **Decided by POSITION, not opacity.** The existing `o<0.1` test would have left the
0.22-opacity ghosts clickable, and a card you can tap but cannot see is the worst of both.

⚠️ **`pointer-events:none` was not enough on its own.** A dispatched click bypasses hit-testing, so
`render()` sets `.hx-ghost` and the click listener refuses it outright. Proven both ways: a click
on a ghost does not move the spiral, a click on the card one step out does.

---

## 5. What this round did not touch

⛔ **Only the hero, the reviews and the services section have been built for a phone.** The
estimator, the stone wheel and `/stones/`, About, Why, the process and gallery sections, the FAQ,
the enquiry form, the footer and nav, and every generated page are still wearing the desktop-era
layout at phone width. **Ask the client which is next rather than choosing.**

⛔ **Tablet (721–1120px) is untouched by instruction.** Two things wait for that round: the
services flip-card grid still serves that band (widen the helix's shared query to
`(min-width:721px)`), and the reviews' old side-arrow rule still dresses 721–760px.

---

## 6. One thing found and deliberately not fixed

`SERVICES[0].long` in `index.html` promises worktops *"cut from a single slab, vein-matched across
every joint"*.

That is **both** a claim to fabrication TopCat outsource (§2 rule 1) and an absolute (§2 rule 12),
and it is very nearly the sentence D63 removed from the stone pages for exactly those two reasons.

⛔ **It is live on tablet widths right now** — the grid is hidden on desktop and, since D96, on
mobile, but not between. ⚠️ **`verify.py` check 7 only scans the generated stone pages**, which is
the gap that let it survive D63.

It was left alone because it is client-facing copy and needs his approval on new wording, not
because it is safe. It is item 3 in the START HERE's open list.
