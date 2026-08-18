# The 864 cut — retired 18 August 2026 (D316)

`topcat-intro-864.mp4` was D312's single narrow cut: one fixed 864×1080 window at x=680, used by
both the phone and the tablet. It is replaced by `topcat-intro-556.mp4` (phone) and
`topcat-intro-812.mp4` (tablet), each panned. See `.src-2026-08-18/pan.py`.

⛔ **WHY IT HAD TO GO, AND IT IS ARITHMETIC RATHER THAN TASTE.** `.hero-vid` is
`object-fit:cover` over a hero that is `max(90vh,…)`. A 390×844 phone therefore gives a
**390×759** box — aspect **0.514**, not the 0.8 a 4:5 cut is made for. Covering 0.8 into 0.514
scales to fill the height and discards the sides:

| | |
|---|---|
| rendered | 607×759 at scale 0.7028 |
| source width surviving | **555 of 864 px — 36% discarded** |
| master window actually seen | x **835..1389** (D312 intended 680..1544) |
| upscale on a DPR-3 phone | **2.11×** (the register recorded 1.35×) |

So the phone was showing the middle of the middle: the island and the kitchen run, with the living
room cropped away. The client's note — *"it's facing more towards the kitchen side. It actually
needs to face more towards the living room side"* — was exactly right, and D312's own figure was
the thing that hid it.

⭐ Each replacement is cut **at its band's own aspect**, so `cover` has nothing left to throw away
and the chosen composition is what reaches the screen. ⚠️ The 2.1× upscale does **not** go away and
cannot: the master is 1080 tall and a DPR-3 phone hero is 2277 device px tall. That is a property
of the supplied render.

⛔ Kept on disk, not deleted, and this folder is dot-prefixed so `make_upload.py` will not ship it.
