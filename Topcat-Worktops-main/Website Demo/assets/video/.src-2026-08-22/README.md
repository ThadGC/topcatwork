# The client's two masters — 22 August 2026 (D328)

⛔ **Dot-prefixed, so `make_upload.py` never ships this folder.** The two `.mov` files are
`.gitignore`d by `**/assets/video/.*/TC*` — **they are the only copies in the repo** and every
shipped cut is derived from them by `encode.sh`. ⛔ Do not delete them.

Client: *"Here you are going to see the two new videos. One is for desktop and one is for mobile.
So just as we've explained many times before, separate files, we're not loading them both… Use the
desktop one for desktop, and you just crop it for tablet, and then the mobile one is for mobile
only."*

| file | what it is |
|---|---|
| `TC FINAL FIX DESKTOP.mov` | 86.5 MB · 1920×1080 · h264 · 24fps · 44.250s · 24-bit PCM stereo |
| `TC MOBILE FINAL FIX.mov` | 38.5 MB · 1920×1080 · h264 · 24fps · 44.250s · 24-bit PCM stereo |

Both copied out of `~/Downloads` and verified byte-exact by SHA-256.

## ⛔⛔⛔ The mobile master arrived pillarboxed again

Exactly as D319's did. Inside the 1920×1080 container is a **9:16 film 608 wide, full height,
centred at x=656**, with 656px of pure black either side. Measured two ways, and they agree
exactly:

- `cropdetect` across the film → `x1:656 x2:1263 w:608 h:1080 x:656 y:0`
- per-column luminance max over 10 frames → first lit column **656**, last **1263**, width **608**

⭐ *"Without cropping or editing"* is about his **framing**, which is his and is untouched. The
**pillars** still have to come off, or `cover` on a 0.462 phone box keeps the bars and throws away
the picture, and 68% of every frame ships as black (§2s, site speed).

## What ships

| band | file | size | from |
|---|---|---|---|
| ≥1121 desktop | `topcat-intro-1920.mp4` | 12.74 MB | the desktop master, full width |
| 721–1120 tablet | `topcat-intro-864.mp4` | 5.40 MB | the **same** master, D312's 4:5 window at x=680 |
| ≤720 phone | `topcat-intro-608.mp4` | 3.72 MB | the mobile master, pillars cropped |

All three **44.250s / 531 frames at 12fps**, so the scroll maths is identical at every band.
⛔ The tablet is **not a third film** — it is the desktop cut cropped, which is why the two share
every beat.

## ⚠️ The film was RE-CUT, and three things had to move with it

The first fourteen seconds are unchanged (frame-difference at t=0, 4, 10 is under 0.3). **From
t=16 the shot is different.** Consequences, all measured on the new cuts:

**1. The slab beat moved.** The void it sits in is somewhere else now:

| band | where the frame is black | beat, was | beat, now |
|---|---|---|---|
| desktop, left 7–46% | 14.75 → 25.00 | 13.5–23.5 | **15.0–24.5** |
| tablet, top 18% | 20.50 → 25.00 | 21.0–27.5 | **21.0–25.3** |
| phone, top 18% | 16.00 → 23.50 | 16.2–24.4 | **16.2–24.0** |

⚠️ The old desktop window started at 13.5, where the new film still measures **222** — the words
would have landed on bright picture for the first second and a half.

**2. The hero plate is withdrawn.** His generation still for the ending no longer matches it: against
the old film it sat at **0.069**, against the new one its best frame anywhere in the last 2.5s is
**0.292**, and that best frame is f527 rather than f530. Side by side the camera has pushed **in and
left** — the island is much closer, the bar stools along it are gone. Same room, different shot.
⭐ Parked, not deleted: both crops are still at `plates/plate-f529.webp` and
`plates/tablet/plate-f529.webp`, and the markup to restore it is in an HTML comment where it used
to be. **It needs a new still from him for the new ending.**

**3. The opening plate stays.** Re-matched against the new film it still lands on **f0 at 0.111**,
which is where it has always been. The opening shot did not change.

## The old encodes

Overwritten in place, as asked. ⭐ **They are recoverable from git** — they were tracked files, so
`git show <commit>:'Topcat-Worktops-main/Website Demo/assets/video/topcat-intro-1920.mp4' > out.mp4`
brings any of them back. Nothing needed parking on disk. The old MASTERS are still in
`.src-2026-08-18/` and `.src-2026-08-21/`.

⚠️ `?v=` went **1 → 2** on all three films and all three posters in the same edit. `.htaccess`
holds mp4 for a week; without the bump a returning visitor keeps the old film.

## Re-running

```bash
cd "Website Demo/assets/video/.src-2026-08-22" && bash encode.sh
```

⚠️ CRFs (25 desktop / 26 tablet / 27 phone) are carried from the D318 and D319 size tables, measured
on the same material at the same rate. ⛔ Re-run those tables if a future master's grade changes.
