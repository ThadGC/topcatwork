# The opening overlay — D330, rebuilt at D331

⛔ **Dot-prefixed, never ships.** `src/` holds his two PNG originals, `.gitignore`d — do not delete.

## ⛔⛔⛔ D331: the overlay is the MASTER's own first frame, not his stills

Client, with mid-fade screenshots of both bands: *"it morphs a lot… after it's done morphing the
colors have almost changed completely and the trees are moving. We just gotta do what we gotta do
to fix this."*

**The morph was unfixable by any filter, and the measurement says why.** His stills are different
RENDERS of the shot — trees and veining in different places:

| the fade was blending | distance |
|---|---|
| his `F1 FIXED.png` vs the desktop film's f0 | **0.301** |
| his `Mobile f1.png` vs the phone film's f0 | **0.143** |
| the MASTER's f0 vs the web film's f0 | **0.011–0.016** |

Colour can be graded (D330 did); **geometry cannot** — no filter moves a tree. So the plates are
now extracted from the 86.5/38.5 MB masters: distance **0.043 / 0.036 / 0.037** against the three
cuts, nothing left to morph. The overlay still earns its place — the master frame is much cleaner
than the same frame through the 12.7 MB web encode, and it is also the poster, so first paint is it.

⭐ **His PNGs stay parked in `src/`.** If he re-renders them to actually match the film, flip
`USE_HIS_PNGS` in `make_plates.py` — and verify the distance before shipping.

## The fade: 3 frames since D331

With a matched still the only ghost left is CAMERA MOTION under the dissolve (the film drifts
0.115/frame away from f0). At 3 frames the blend is 0.74 over one frame of motion and 0.26 over
two — motion-blur scale, gone by f3. The 6-frame width belonged to the mismatched era and held
ghost over 0.474 of drift.

## Cache stamps

Plates `?v=2`, posters `?v=3` (D331). ⚠️ D330 changed poster CONTENT without bumping — the v=3
also repairs that. Bump both again with any re-cut, in the same edit as the files.
