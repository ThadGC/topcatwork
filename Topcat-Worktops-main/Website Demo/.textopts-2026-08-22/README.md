# First-screen text options — 22 August 2026

⛔ **A MOCKUP, NOT THE SITE.** Dot-prefixed, so `make_upload.py` never ships it. Nothing in
`index.html` (the real one) was touched to make this.

**Why it exists.** Client, 22 Aug: *"the first frame technically needs to act like a second hero
section. So the text needs to show in that open space of the valley on the first frame, there
should be a very clear indicator to scroll and text that will entice people to scroll. because we
cannot have a bottleneck. people have to scroll and see the video… right now I'm talking about
desktop specifically… so now I need you to give me options."*

## Open it

    http://localhost:5501/.textopts-2026-08-22/#B      one frame at a time
    http://localhost:5501/.textopts-2026-08-22/?all    all eleven, stacked, scroll by eye

| # | What |
|---|---|
| `#0` | the first frame **as it stands** — the page rests here and carries nothing |
| `#A` | copy: the film's own line, promoted — *It starts as a mountain.* |
| `#B` | copy: the proposition — *Your worktop begins in a mountain.* |
| `#C` | copy: the invitation — *Every worktop has a beginning.* |
| `#D` | copy: the whole journey — *Chosen at the quarry, fitted in your kitchen.* |
| `#P2` | treatment: whole frame grades down, no shape anywhere |
| `#P3` | treatment: the film's own per-block wash |
| `#F` | the scroll indicator at the foot of the frame, centred |
| `#S1` `#S2` `#S3` | the **second** frame (the slab), three wordings |

`A`–`D` all carry treatment **P1**, so the four are compared on copy alone. `P1`/`P2`/`P3` all
carry `B`, so the three are compared on treatment alone.

## ⛔⛔ The finding that decided the layout

**The valley looks like the empty part of the frame and it is the brightest part of it** — the trap
D313 fell into twice and D316 measured its way out of. Measured on `plate-f1.webp` through the
`cover` crop a 1440×900 viewport actually applies:

| block | median | p97 | bone type, bare |
|---|---|---|---|
| left third | 76 | 188 | **2.27:1** |
| left 42% | 83 | 203 | 1.95:1 |
| the sky | 180 | 211 | 1.81:1 |
| the quarry floor | 125 | 205 | 1.92:1 |

The median would call the left third comfortable. The 97th percentile is 188, because haze and
white marble blocks sit in it. **A passing title can live with that for three seconds; a hero
rests, so it cannot.** Every option therefore carries a treatment.

⭐ **Moving the block up does not help** — measured at 44/47/50/53/57% of the frame, the headline
gets *worse* going up (into the sky) and the indicator barely moves. **57% is already the best
vertical position on this frame.**

## ⭐ P1, the recommendation, measured

Left-edge grade at 0.66 over the veil's resting 0.20:

| element | contrast |
|---|---|
| headline | **5.12:1** |
| invitation | **10.33:1** |
| the cue's word | **12.07:1** |
| the cue's gold rule | **3.93:1** (against the 3.0 a non-text graphic needs) |

⛔⛔ **MEASURE THE INK, NOT THE BOX.** The cue's flex container is the full 561px of the block and
reads **2.86:1** off the marble at its far end — where there is no ink at all. The word is 180px
wide and clears at 12.07:1. The first pass reported the container's figure and nearly bought a
fix for a problem that did not exist.

⭐ **It is anchored to the frame edge, which is why it cannot read as a panel.** `.hero-shade`
already carries a 90deg layer of exactly this kind; it just runs the wrong way for copy on the
left (0.26 → 0.46, darkening to the RIGHT).

## ⭐⭐ The second frame needs no treatment at all

The left half of the slab shot is **pure black**: bone on it measures **18.62:1**, the ceiling for
this ink. No grade, no wash, no edge. ⛔ Do not give it the opening frame's treatment out of
symmetry — there is nothing here for a grade to fix. The only open question on that frame is the
words.

## Files

| File | What |
|---|---|
| `index.html` | the eleven frames |
| `slab-t18.webp` | the second frame, `ffmpeg`-extracted from `topcat-intro-1920.mp4` at t=18.0 |

The opening frame is not copied here — it reads the real `assets/video/plates/plate-f1.webp`.

## To bring any of this into the site

Nothing here is wired. The copy block, the `.edge` layer and the heavier cue would go into
`index.html`'s film section, and the treatment must **fade out as the film starts moving** so the
picture is unobstructed while it plays — that is the one piece the mockup cannot show, because it
is static.
