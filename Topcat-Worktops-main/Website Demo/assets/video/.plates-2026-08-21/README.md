# The generation stills and where they sit in the film — 21 August 2026 (D320)

He sent six frame images and the scroll-animation guide:

> *"in this folder called frame images, you will use this guide to overlay the images into the video
> at the correct points with the correct image for that spot. this is for desktop, will send mobile
> soon."*

## What is here

| File | What |
|---|---|
| `holds.py` | ⭐⭐ The guide's §4 matcher, **rewritten without numpy** (this machine has PIL only). Prints which frame each still matches, the confidence, and the hold frame |
| his originals | ⛔ **NOT here and NOT in git** — they are 19.6 MB of PNG in `Frame images/` at the repo root, `.gitignore`d like the film masters. **Do not delete them**; re-exporting a plate needs the original, never the WebP and never the video |
| the shipped plates | `../plates/plate-f<frame>.webp`, 0.56 MB for six, **committed** |

## ⭐⭐ The mapping, derived from the footage

⛔ **NEVER FROM THE FILENAMES.** That is the guide's first rule, because on the project it came from
four of eight stills named the wrong shot. They happened to be right here — ⚠️ that is luck.

```
still            frame   t (s)     plate distance   next-best   verdict
Final F1.png     f1       0.0833   0.097            0.647       6.7x clear
final f3.png     f122    10.1667   0.180            0.840       4.7x clear
F4.png           f206    17.1667   0.008            0.231      29x   clear
F5.png           f277    23.0833   0.006            0.249      41x   clear
New F6.png       f472    39.3333   0.058            0.189       3.3x clear
New F7 (1).png   f529    44.0833   0.064            0.365       5.7x clear
```

⚠️ **F1 AND F3 SCORE AN ORDER OF MAGNITUDE WORSE AND THAT IS REAL, NOT A BAD HOLD.** Both sit inside
camera moves, so the film frame carries motion blur the still does not, and f3's veining has drifted
the way an interpolated middle frame does. They are unambiguously the right shots. ⛔ Do not chase
those numbers by moving the hold — the hold is already the best frame in the window.

⭐ **Registration was measured, not eyeballed: all six align at dx=0, dy=0.** What did need fixing
was ASPECT — his stills are 1.7684 and the film is 1.7778, so `cover` scaled them 0.5% differently
and the cross-fade breathed. The export crops each still to the film's exact aspect first, by
height, never by width — the framing is his.

## ⛔ Re-run it if the film is ever re-cut

```bash
cd "Website Demo/assets/video/.plates-2026-08-21"
python3 holds.py ../topcat-intro-1920.mp4 "$HOME/Documents/TOPCAT WORKTOPS/Frame images"
```

A stale hold table parks the film on the wrong frame and the plate will not register — the guide's
own warning, and the reason the table above records the confidence and not just the answer.

## ⚠️ Mobile has none of this

He said *"this is for desktop, will send mobile soon."* The plates are `display:none` below 1121 and
the scrub never attaches their `src`, so a phone downloads none of the 0.56 MB. A second film needs
its own set of everything — these holds mean nothing in the 608 cut.
