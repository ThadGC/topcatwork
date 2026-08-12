# The second mobile round — 11 August 2026

The narrative behind **D99–D108**. `HANDOVER.md` carries the state; this carries the reasoning,
and in particular the reasoning behind the things that were got **wrong** first, because those are
the parts a later session is most likely to undo by accident.

The client worked through the phone section by section, describing what he saw. Nine changes came
out of it, plus one fault of my own that the freeze probe caught.

---

## 1. The shape of this round: he is testing on the phone now

Round one was built and checked in an emulator. Round two was reviewed on an iPhone, and that
single change of device is what produced most of this document. **Three of the faults below are
completely invisible on a mouse**, and one of them had already shipped twice.

Worth stating plainly for whoever picks this up: the emulator is where the work gets done, but it
is not where it gets judged.

---

## 2. The sticky bottom bar (D99, D106)

> "Mobile should have a nav bar and a sticky bottom nav bar. The top nav bar will be visible from
> the start on mobile, then as you scroll past the two CTAs in the hero section the sticky bottom
> nav will pop up with the email and phone and get an estimate or whatever buttons are necessary."

The top bar already behaved that way, so nothing was done to it in the first pass — see §7, where
it turned out he meant something else by "visible".

**The trigger is the CTA row's own rectangle.** `scrollY > 600` would have been a second
description of where the hero's buttons are, and it would be wrong the moment the title wraps to
another line on another handset — the same family as a media query disagreeing with the layout
maths. It rises when the row passes behind the fixed header, which is the point at which the
buttons are genuinely gone rather than merely near the top.

Three things worth keeping:

- ⚠️ **The top edge is a bone hairline, not gold.** §2 rule 10 forbids a bright or gold line across
  the top of a card or section, and this is the top edge of a bar. The rule has already been
  broken twice by someone deciding that a *particular* placement was fine.
- ⚠️ **`visibility:hidden` while parked, not just a transform.** A translated bar is still in the
  accessibility tree and still tabbable, which would put three links at the top of the tab order
  that nobody can see.
- ⚠️ **z-index 39**, which is a deliberate gap: under the burger menu at 40 so the full-screen
  sheet covers it, and far under the estimator modal and the project overlay, which own the
  screen outright.

The three actions are all things the page already carries — the hero's call button, the contact
block's address, the quote CTA. No new promise, no new number.

**D106 swapped the order** at his request: the quote leads, Call sits at the far end. The dress
travels with the element, so the filled gold button simply moved left.

---

## 3. The hero's buttons (D100)

> "Make the get your free quote and give us a call slightly thinner, not as wide. I want to
> basically match the size of the side of the icons."

They were `width:100%`, reaching the screen's own margins while the composition above them stopped
well short — so the pair read as two bars rather than as part of the same centred stack.

⭐ **The width is derived, not typed.** The three reasons are equal thirds and each icon is centred
in its own third, so the distance from the first icon's left edge to the last icon's right edge is
`(2/3)·row + (2/3)·gap + icon`. Measured after: icons at 59 and 316, buttons at 59 and 316.

Both terms are CSS variables shared with the icon row, and that is the whole point of them
existing. Type `257px` instead and the buttons stop lining up the moment the gap clamp moves at
another handset width.

⚠️ **The type size had to come in with the width, and had to be vw-led.** The label is
`white-space:nowrap` inside an `overflow:hidden` button, so a label that does not fit is not a
wrap — it is a **silently clipped word**. The button is derived from the screen, so it is 246px at
360 and 219 at 320, where the same label at 12.5px overhangs. `min(12.5px, 3.3vw)` keeps the
longest label inside its button down to a 320px handset.

---

## 4. The reviews, and three builds of one swipe

This is the most instructive part of the round.

### 4.1 The swipe that the browser was eating (D102)

> "The review section is completely glitched out, if I try and swipe on it, it's not working."

The history matters:

- **D93** shipped `touchstart`/`touchmove`/`touchend` only. It did nothing on his MacBook.
- **D94** bolted a mouse path and a trackpad path beside it.
- **D102** — the touch path itself then failed on his iPhone.

Three builds, one root cause: **the gesture was being arbitrated in three places, and on a phone
the browser was arbitrating first.**

⭐ **`touch-action:pan-y` hands the first decision to the browser.** It takes any drag with a real
vertical component as a page scroll before a single handler runs — and a thumb swipe is never
perfectly horizontal. The page slid, the belt did not move, and nothing in the handler was
reachable at that point. It is not a handler bug. It is a bug about who owns the gesture.

So the page was taken out of the argument: **`touch-action:none`, one arbiter, one axis decided
once at 5px, ties going to the carousel.**

⛔ **The price, paid deliberately.** `none` also kills the native vertical scroll over that
element, so a near-vertical drag is now scrolled **by hand** — 1:1 while the finger is down, then
a decaying glide so a flick still coasts. That is exactly what the client asked for on the helix
("the screen basically stays still unless they're swiping directly up or directly down"), and it
is the same machinery, so the two carousels behave identically.

⚠️ **`html` carries `scroll-behavior:smooth`** for the nav's anchor jumps, and it poisons a
hand-rolled scroll: every `scrollBy` animates toward its target, and sixty of them a second each
restart from wherever the last animation had got to. **Measured: 120px of finger travel moved the
page 45px.** The arbiter sets an inline `auto` for as long as the gesture owns the page and takes
it off after the glide, not on pointerup — the glide is `scrollBy` too.

⚠️ It is bound to the **stage**, not the deck. The deck is only the centre card's box; a thumb
landing on a peeking neighbour, or in the air beside the card, was landing outside the one element
that listened. On a phone the finger goes where the section is, not where the box is.

### 4.2 "It's not letting me swipe quickly" (D107)

> "When I try and swipe quickly on the reviews, it's not letting me swipe quickly." — and, crucially,
> "it only happens when I view it on my phone, not on the preview here on the MacBook."

Two separate causes, both invisible on a mouse.

**(1) A CSS transition cannot be picked up mid-flight.** The inline transform already holds the
DESTINATION while the compositor is still easing toward it. So the instant a new drag switched the
transition off, the belt **snapped forward to that destination** and only then began following the
finger. One swipe at a time looked right; two in a row jumped.

⭐ That is why it reads as "won't let me swipe quickly" rather than as "the animation is wrong":
the gesture *is* heard, it just lands on a belt that has teleported.

The roll is now driven frame by frame from **one number** — `soloAnim`, the drum's offset in steps
from whatever page is current. A drag writes it, a commit tweens it to zero, and an interruption
simply retargets from wherever it has got to. There is no state to reconcile because there is only
one number.

⚠️ **The section's ride-in still borrows CSS for one beat, and that nearly broke it.** The cards
park ~400px off-screen before the section is scrolled into, and taking them over on the same call
that seats them turned the entrance into a teleport — measured, x went −214 → 187 with no frame in
between. `.rev-live` is the switch between "the loop owns the cards" and "the stylesheet does", and
the first settle after an entrance deliberately leaves it off. A swipe during that 0.8s window is
not stranded: the drag branch claims `.rev-live` immediately, which is the right answer anyway —
the customer's finger outranks the entrance.

**(2) A distance-only threshold rejects the fastest gesture there is.** A flick leaves the glass
after 25–40px of travel, well under the 48px throw, so the belt rolled back and the swipe read as
ignored. **The faster he swiped, the more certain it was to be dropped.** The release now carries
its speed as well as its distance — above 0.45px/ms it is a flick, with a 10px floor so the few px
of drift in a tap cannot page the carousel.

Measured after: a 36px fast flick pages; a second flick 120ms into the first rolls through to the
next without a jump; a slow 24px nudge correctly does nothing; a tap still opens the review.

### 4.3 The roll itself (D101)

> "There's barely any animation, it just flicks over to the next one, it's an instant switch
> between them. I almost want it to feel like a rotating wheel — imagine a roll of duct tape
> laying down flat, and you're just rolling the reviews in, and the other one rolls out."

⭐ **The diagnosis is the keeper: the motion was not missing, it was front-loaded.** The page
change already ran 0.95s — but on `--ease`, `cubic-bezier(0.16,1,0.3,1)`, an expo-out that covers
about 90% of the distance in the first quarter of its time and crawls the rest. Probed mid-flight,
the card was already all but home.

⚠️ **A longer duration on that curve changes nothing you can see. The curve is the fault.**

Two other things were feeding the same complaint:

- The old build **teleported** any card more than one page away with `transition:none`, which is
  why the outgoing neighbour *vanished* instead of rolling out. Every review is on the rim now;
  there is no parked state left.
- `.rev.entering` set `transition:transform` alone, which silently dropped the fade the base rule
  carried — so a neighbour's dimming snapped while its travel eased.

**The drum.** The reviews sit on the rim of a cylinder whose axis is vertical — his roll of tape
lying flat — as `translateZ(−R) rotateY(θ) translateZ(R)`, **in that order**. The order is the
trick: it puts the drum's axis at the screen plane, so the front card sits at z=0 at its true size
and only the ones turning away recede. `rotateY(θ) translateZ(R)` alone would push the front card
R px toward the camera and blow it up.

⛔ **R is solved from the peek, and from its INNER EDGE, not its centre.** The first version held
the neighbour's centre where D93 put it, and the peek collapsed from 44px of visible card to **4**.
A card turned 32° is foreshortened to cos(32°) of its width, so holding the centre pushes the
inner edge 70px further out and the neighbours slide off the screen. The peek is not decoration —
D93 exists because a lone centred card gives a customer no reason to think there is anything else
to read.

### 4.4 The strap line, and a gap that only looked right closed

He asked for the bottom CTA to stand off the pager buttons; it went from ~18px to 45.

⚠️ **Adjacent siblings collapse their vertical margins**, and the stage's own margin is JS-driven
when a review is open. So what a customer sees between the dropped buttons and the strap is
`marginBottom − drop`, which used to be a constant that matched the strap's old margin **by
coincidence**. The moment the margin opened up, an open review sat 24px from its buttons where a
closed one sat 45. It reads the live value now. This is the third time in two rounds that two
numbers describing one distance have drifted; the pattern is in the START HERE §4 lesson 10.

---

## 5. The helix (D103)

> "The helix section is also laggy or completely glitched. As I'm swiping it diagonally down or
> diagonally up, the screen is also moving diagonally down and diagonally up. So we need to make
> it if they're touching the cards, the screen basically stays still unless they're swiping
> directly up or directly down on that section."

He is describing a real fault, not a preference. The helix's touch handlers were bound
`{passive:true}` with **no `touch-action` on the stage**, so they could never stop a scroll: the
browser panned on the gesture's vertical component while the script turned the spiral on its
horizontal one, at the same time.

Fixed with the same arbiter as the reviews — which is why it is shared code rather than two
implementations that will drift.

⛔ **The desktop path is untouched and still its own code.** The old mouse and touch handlers
simply stand aside when `--hxMode` says phone. Desktop is frozen, and rewriting a frozen surface's
input is still a change to it.

---

## 6. Double-tap zoom (D104)

> "If I tap the buttons too quickly it automatically zooms in my phone, because double tap on
> iPhone means zoom in. So we have to be careful of that."

⚠️ **This is not a mis-tap to design around.** Zoom-on-double-tap is the default on every element
that has not opted out, so paging a carousel or walking a stepper at any speed fires it.

`touch-action:manipulation` opts the control out and leaves everything else — pinch zoom included
— exactly as it was, so the page is still zoomable for anyone who needs it.

⭐ **Deliberately a blanket rule** over `a, button, [role=button], label, summary, input, select,
textarea` rather than a list of today's buttons, which would not cover the next one somebody adds.
⚠️ Where an element also needs the page *not* to pan (the review stage, the helix), that `none` is
on an ancestor and still wins: the effective value is the **intersection** down the chain, not the
nearest declaration.

---

## 7. The nav bar (D106)

> "The nav bar should already be formed, so already a gold line below it and everything, from the
> top. Not after you start scrolling — immediately it must already be there."

The first pass read "visible from the start" as a statement of what already happened, because the
bar *is* visible from the start. He meant **formed** — glass and hairline, not just present.

⚠️ On desktop the bar deliberately floats transparent over the hero photograph and pours its glass
in as you leave the top. That is the idea there and it is frozen. On a phone it reads differently:
the bar is ~66px of a small screen, the logo sits straight on a busy photograph, and a hairline
arriving late looks like something still loading rather than like a reveal.

⛔ **The flare goes with it.** `.bar-flare` is the shine that rides the hairline out from its
centre **as it forms** (D33). A bar that is already formed has nothing to form, so leaving it armed
would fire a flash across a finished line 40px into the first scroll.

---

## 8. The project gallery (D105)

> "I want the cards to come in slightly earlier, and I also want them all to pop up from the
> bottom and then lay in a stack. So they all pop up directly up like it's a firework shooting up,
> and then they all stack there. Instead of coming in from the sides. And then they spread out to
> the way that it currently is. I just wanted to have a golden rim around it. And I also want the
> four cards that are showing to be slightly higher… then move the title, subtitle and button
> slightly higher in that section."

**Earlier.** The gather window is `0.16 → 1.62` of a viewport on a phone against the desktop's
`0.40 → 1.86`, so the whole arrival happens while the section is still coming up the screen.

**From below.** ⛔ A side entry is the one thing a phone has no room for: each card started a full
stage width out *plus* most of its own width — about 450px off a 375px screen — so most of every
flight happened where nobody could see it, and the eight arrivals read as cards appearing at the
edge rather than as a gather. They now start a card-height below the stage floor and rise.

⚠️ **The lateral offset is small but not zero** (0.10 of the stage at most). Eight cards on one
perfectly vertical line overlap exactly and rise as a single card.

**The rim** is the card's whole border in the site's own champagne, carried a little stronger.
⛔ Not a top-edge seam, which rule 10 forbids.

**Higher.** The walls' phone shift went −0.16 → −0.22 of the stage and the copy block 4% → 12% off
the floor of the pin. ⚠️ Those two move **together** — shift the cards without the copy and they
land on the words.

⭐ One tidy-up came with it: `--galMode` now declares the phone in the stylesheet and the script
reads it, replacing **three separate `M.w<720` tests** that disagreed with the 720px media query at
exactly 720px. That is D93's lesson, found sitting in the file.

---

## 9. ⛔ The fault I introduced, and how it was caught (D108)

While adding a note to the sticky bar's comment block, I prepended it to the `<div>` **with its own
`-->`** — while the block above still had one. The three lines between the two became a **text node
in `<body>`**, and the whole page moved down 48px on desktop, tablet and mobile alike.

⭐ **Nothing about it looked broken.** The JavaScript was fine. `node --check` was never going to
see it. The section it belonged to worked perfectly. The shift was uniform, so every screenshot
still looked like the site.

It was found because the desktop/tablet freeze probe came back with **457 diffs where the previous
run had 18**.

⚠️ **The point is not the typo.** It is that the freeze probe is the only thing in this project
that reads the whole document rather than the part being worked on, and here it caught a fault on
the very device that *was* in scope. ⛔ **Run it after the last edit, not after the interesting
one.** A file-wide comment-balance check afterwards confirmed nothing else of the kind is lurking:
95 opens, 95 closes, no stray closers.

---

## 10. What this round did not touch

⛔ **Still wearing the desktop-era layout at phone width:** the estimator, the stone wheel and
`/stones/`, About, Why, the process section, the FAQ, the enquiry form, the footer and nav menu,
and every generated page. **Ask the client which is next rather than choosing** — he is walking the
page in order and will say.

⛔ **Tablet (721–1120px) is untouched by instruction.** Three things wait for that round: the
services flip-card grid still serves that band, the reviews' old side-arrow rule still dresses
721–760px, and the nav bar still forms on scroll there.

**Two things from this round deserve his eyes specifically:** the hand-rolled vertical scroll over
the review deck and the helix — it has a glide, but it is not the browser's own — and whether "get
an estimate" on the bottom bar meant the quote form or the estimator tool. It was built as the
quote form.
