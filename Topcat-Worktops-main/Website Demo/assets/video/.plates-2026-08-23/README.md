# The opening overlay, third build — D333/D334 (23 Aug 2026): his stills, instant cut

⛔ **Dot-prefixed, never ships.** The PNG originals live in `../.src-2026-08-23/` (`.gitignore`d).
The D330–D332 record, including the master-frame pipeline this replaces, stays in
`../.plates-2026-08-22/`.

## ⭐⭐⭐ His stills are the plates again, and the measurement is why that is finally safe

`.plates-2026-08-22/make_plates.py` documented the condition for going back to his artwork:
*"only if he re-renders stills that MATCH the film — verify the distance ≤ ~0.1 first."* He did.
The film's opening was re-rendered and the stills with it:

| pair | distance |
|---|---|
| `F1 FIXED SLAB.png` vs the desktop master's f0 | **0.0147** |
| `F1 SLAB mobile.png` vs the phone master's f0 | **0.0306** |
| (D330's stills, for contrast) | 0.301 / 0.143 |
| shipped plates vs the shipped encodes' f0 | 0.032 / 0.031 / 0.046 |

Same render — trees, veining and rubble in the same places. Nothing to morph, nothing to jump.

## ⛔⛔⛔ The fade is GONE — an instant cut, on his instruction

Client: *"the overlay image needs to go away instantly when the user scrolls instead of a fade
because the fade causes a blurriness over it."* The blur was structural, not a width to tune: a
dissolve blends a frozen f0 with a film that is already elsewhere — one frame of camera motion
measures rms 0.054 from f0, three frames 0.106 — so ANY fade ghosts the trees. The cut lands at
**half a film frame**, the first instant the displayed frame changes (`PLATE_CUT=0.5` in the
scrub), keyed to `currentTime` — the frame the viewer SEES — not the eased target, carried from
D331. Cutting between two copies of the same frame 0.03 apart is invisible; scrolling back to the
top brings the plate back at the same line.

## ⛔ Plates ship at the FILM's resolution (1920/864/608), not the still's 2688

A plate sharper than the film would make the instant cut visible as a crisp→soft jump. At the
film's own size the still is still cleaner than the CRF-25 first frame, which is the point.
Weights: 329 / 155 / 109 KB at q86 — fetched once, after `load`, only on the visitor's own band.

## The posters come from the same images

Walked down to the §2s budget: **121 KB desktop (1400w) / 81 KB tablet / 54 KB phone** — so
poster, plate and film all open on one picture and first paint has nothing to swap.

## Cache stamps

Films `?v=3`, posters `?v=4`, plates `?v=3` — all bumped in the same edit (D333). ⚠️ Bump all
three families again with any re-cut, in the same edit as the files.
