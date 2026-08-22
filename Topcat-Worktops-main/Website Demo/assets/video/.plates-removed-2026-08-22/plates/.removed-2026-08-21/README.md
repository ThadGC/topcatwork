# The four middle plates — withdrawn 21 August 2026 (D323)

> *"I actually don't like the overlaying of the images that you did. So you're just going to keep
> the first starting frame image, remove all the others. Keep the first one and the last one. Those
> are the only two that you keep."*

So the site now overlays **two** of his stills: `plate-f1` (the frame the page opens on) and
`plate-f529` (the frame the hero rests on). Both are looked at for a long time — the hero alone
holds for 182vh. The four in here were each a dissolve of 80–170px of scroll, passed at speed.

⛔ **NOTHING IS DELETED.** Both crops of all four are here.

| file | film frame | t (s) | fade half-width | plate distance |
|---|---|---|---|---|
| `plate-f122.webp` | f122 | 10.1667 | 3 frames ⚠️ camera moving there | 0.180 |
| `plate-f206.webp` | f206 | 17.1667 | 6 frames | 0.008 |
| `plate-f277.webp` | f277 | 23.0833 | 5 frames | 0.006 |
| `plate-f472.webp` | f472 | 39.3333 | 4 frames | 0.058 |

`desktop/` are the 16:9 crops for `topcat-intro-1920.mp4`; `tablet/` are the same stills through
D312's own window (`crop=864:1080:680:0`) for `topcat-intro-864.mp4`.

## ⛔ To bring one back

```bash
cd assets/video/plates/.removed-2026-08-21
cp desktop/plate-f206.webp ..            &&  cp tablet/plate-f206.webp ../tablet/
```

then add its `<i class="plate">` back to `.cine-plates` in `index.html` **in time order**, with both
`data-src` and `data-src-tablet`, and put its fade half-width back into `PLATE_W` **at the matching
index** — the array is positional and is read in element order.

⚠️ **The widths are measured, not chosen** — they are how far either side of its frame a still still
reads as the same picture. ⛔ Do not widen one to make it linger; that puts a stale image over a
moving camera. The originals are in `Frame images/` at the repo root and the matcher that produced
these numbers is `assets/video/.plates-2026-08-21/holds.py`.
