# The plates are gone — 22 August 2026 (D329)

⛔ **Dot-prefixed, so `make_upload.py` never ships this folder.**

Client: *"Remember a while ago that we added a starting frame that overlays the very first part of
the video? Remove that overlay image. Same for mobile. Remove the overlay image. Remove all the
overlay images on both videos."*

**All of it came out** — the markup, the CSS, the scrub code and the image files. The film now
paints nothing but the film.

⚠️ **The phone never had any.** It has run its own cut since D319 and the mechanism refused to
attach a `src` below 721px, so nothing was ever painted or fetched there. Removing "the overlay
image" from mobile was already true; there was nothing to take out.

## What was live at the moment of removal

Only **one**: the opening still at `data-t="0"`, on desktop and tablet. The hero plate had already
been withdrawn hours earlier at **D328**, when his new master turned out to be a re-cut and the
still stopped matching the ending (0.069 → 0.292).

## What is in here

| | |
|---|---|
| `removed-code.txt` | **Every block that was cut, verbatim** — the CSS, the markup, and the three JS sections — under headings that name where each came from |
| `plates/` | The image files: `plate-f1.webp`, `plate-f529.webp` and their `tablet/` crops, 880 KB |
| `plates/.removed-2026-08-21/` | The four stills withdrawn at D323, with their own README of frames, times, fade widths and measured distances |

## To bring it back

1. Move `plates/` back to `assets/video/plates/`.
2. Paste the four blocks in `removed-code.txt` back where their headings say.
3. Restore the five call sites, which were **not** in those blocks:
   - `plates(dur)` in the skip handler, after `heroCopy(dur)`
   - `plates(want)` in `tick()`, after the `heroCopy(want)` line
   - `replate()` in `sync()`, after `readHeroBand()`
   - the `addEventListener('load', …)` hook — it is in `removed-code.txt` under `js_load`
4. Re-run `.plates-2026-08-21/holds.py` against the **current** film. ⛔ The hold table is stale:
   it was matched against the pre-D328 cut, and the film has been re-cut since.

## ⚠️ Two things this removal taught, both worth keeping

**1. Cutting a block that ends mid-element leaves the closing tag behind.** The markup cut ran up
to `</div>` without including it, so `.cine-plates`' closing tag survived its opening tag and
started closing `.hero-bg` instead — which put `.hero-shade`, `.hero-navgrade` and `.cine-edge`
outside the hero's clip. Nothing looked obviously broken; **the document just got 456px taller**
(24443 → 24899), which is the only reason it was caught. ⭐ A `<div>` balance count against
`git show HEAD:` is the check, and it should be run after any structural cut.

**2. Removing the elements orphans the assets.** §2s rule 5 — nothing unreferenced ships — so the
`plates/` folder had to move in here in the same edit, not be left in `assets/video/`. ⚠️ The
options mockup at `.textopts-2026-08-22/` referenced the old path too and was re-pointed here.

## After

Desktop document height back to **24443**, elements **2691 → 2689** (the layer and its one plate),
`.hero-bg` back to 6 children with all three grade layers inside it, and **zero requests for
anything under `plates/`** at every band.
