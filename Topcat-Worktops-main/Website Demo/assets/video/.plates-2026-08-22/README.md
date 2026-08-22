# The opening overlay — 22 August 2026 (D330)

⛔ **Dot-prefixed, so `make_upload.py` never ships this folder.** `src/` holds his two originals and
is `.gitignore`d by name. ⛔ **Do not delete them** — re-exporting an overlay needs the original,
never the WebP and never the video.

Client: *"here are the two new overlays for the desktop and for the mobile version. So this is only
the overlay of the very first frame, so make sure it matches up perfectly and doesn't morph too much
when it moves into the next frame. Make sure it fades out nicely so it's not noticeable like a
flicker… It must fade out perfectly to match exactly like it's part of the video. But this is the
very first frame, and it must be the first thing that they see when the user loads in."*

| his file | | becomes |
|---|---|---|
| `F1 FIXED.png` | 1672×941 | `plates/plate-f0.webp` (1920×1080) and `plates/tablet/plate-f0.webp` (864×1080) |
| `Mobile f1.png` | 1520×2688 | `plates/plate-f0-phone.webp` (608×1080) |

⭐ **THE PHONE HAS ONE FOR THE FIRST TIME.** Every previous version of this mechanism refused to
attach a source below 721px, because he had never supplied a vertical still. He has now.

## ⭐ "It must be the first thing that they see" — the posters are the same still

The overlay attaches after `load`, which is after first paint. If the poster were still the film's
own frame, the visitor would see the film's frame and then watch it improve when the overlay
arrived. **So the posters are now generated from his stills**, and first paint IS the overlay —
there is nothing to swap.

⚠️ **They cost no more than before.** His stills are sharper, so at the old quality they came out
163/125/97 KB against the §2s budget of 122/82/55. Quality was walked down per file until each fit:
**q68 → 121 KB · q60 → 81 KB · q52 → 55 KB.** ⛔ The poster carries first paint; do not let it grow.

## ⛔ "Doesn't morph" — what was measured

**Geometry.** A search over ±10% scale and ±2.4% offset against the film's own f0 returns
**zoom 1.00, offset 0** for both stills. They are aligned; nothing was nudged.

**Anchor.** Both match **f0** best, not f1 or later:

| | f0 | f1 | f2 | f3 |
|---|---|---|---|---|
| desktop | **0.242** | 0.243 | 0.294 | 0.349 |
| phone | **0.099** | 0.181 | 0.306 | 0.423 |

⚠️ The desktop still is looser than the phone's because it is a **fresh generation** of the shot
rather than an extract, so its fine detail differs. It is the same shot, same framing — a WRONG
shot on this metric measures 0.647+.

**Aspect.** Each was cropped to its film's exact aspect *before* resizing — his 1.7768 against the
film's 1.7778, and his 0.5655 against 0.5630. ⛔ Left alone `cover` scales them a fraction
differently and the dissolve **breathes** (D323's lesson).

**Grade.** The desktop still ran **+3.3 / +5.3 / +6.4** bright per channel against f0, which would
have shown as the sky dropping when it faded. Each channel's mean and standard deviation were
shifted onto the film's — grade only, detail untouched. ⭐ His phone still already matched to within
**1.4** and was left completely alone.

## ⛔ "Fades out nicely, not a flicker" — the width is measured, not chosen

The film's own drift away from f0, on the same metric:

```
f1 0.115 · f2 0.228 · f3 0.301 · f4 0.366 · f6 0.474 · f8 0.555 · f12 0.692
```

Past about **six frames** the FILM has moved further from f0 than the still ever was, and holding
the still there puts a stale picture over a moving camera — the one thing D322 proved is worse than
a quick blend. So `PLATE_FADE = 6`: half a second of film, about 92vh of scroll.

⭐ **Smoothstep, so it leaves 1 and lands on 0 with no slope at either end.** Measured live:

```
f0 1.000 · f1 0.977 · f2 0.814 · f3 0.563 · f4 0.298 · f5 0.078 · f6 0.018 · f8 0
```

A linear ramp has a visible start, which is the flicker he is asking not to see.

## Regenerating

`make_plates.py` in this folder does all of it — aspect crop, grade match, the three crops, and the
posters at their budgets. ⚠️ Re-run it if the film is ever re-cut: **f0 will have changed** and both
the grade match and the fade width are derived from it.
