# The client's two masters and two stills — 23 August 2026 (D333)

⛔ **Dot-prefixed, so `make_upload.py` never ships this folder.** The `.mov` masters are
`.gitignore`d by `**/assets/video/.*/TC*` and the two PNG stills by `**/assets/video/.src-*/*.png`
(a LOCATION rule added this round — the D330 stills dodged the `TC*` prefix rule by name, and these
landed in the same drop as the masters rather than in a `.plates-*/src/`). **They are the only
copies in the repo** and every shipped cut and plate is derived from them. ⛔ Do not delete them.

Client: *"Here you're going to see the new video for desktop, the new video for mobile, the new
overlay starting image for desktop, and the new overlay starting image for mobile. So go ahead and
replace the current videos and images that we have and the overlay images."*

| file | what it is |
|---|---|
| `TC video desktop final fix.mov` | 91.4 MB · 1920×1080 · h264 · 24fps · 44.250s · PCM audio |
| `TC video mobile final fix.mov` | 39.5 MB · 1920×1080 · h264 · 24fps · 44.250s · PCM audio |
| `F1 FIXED SLAB.png` | 9.5 MB · 2688×1513 · the desktop overlay still |
| `F1 SLAB mobile.png` | 4.5 MB · 1080×1920 · the mobile overlay still |

All four copied out of `~/Downloads` and verified byte-exact by SHA-256 (no EPERM this time).

## ⭐⭐ This re-cut is the OPENING, not the ending

Frame-difference against the D328 masters: t=0–8 differs (desktop rms up to 0.238), converging
through 9–10 and **byte-identical from t=10.25 on** (rms 0.0000 at every probe to 43.9, both
masters). The opening was re-rendered with gold-veined slabs — matching the site's gold and the two
new stills. Consequences, all measured:

- **The slab-beat windows SURVIVE.** They live in the unchanged region. p97-sweep on the new
  encodes: desktop dark 14.50→25.00 (beat 15.0–24.5 ✓), tablet 20.25→25.25 (21.0–25.3 ✓), phone
  16.00→23.50 (16.2–24.0 ✓) — same relationships that shipped.
- **The first-screen grade SURVIVES.** Same model over old f0 vs new f0, all four copy regions
  flat or slightly better (line1 p97-CR 7.75→8.10, gold 7.71→7.83, invitation 12.39→12.31, cue
  17.32→17.30). Skyline median still 30% of frame height. The valley is brighter ungraded
  (p97 188→207) but the grade holds it.
- ⭐⭐⭐ **THE STILLS MATCH THE FILM AT LAST** — 0.0147 (desktop) / 0.0306 (phone) against the
  masters' own f0, where D330's pair measured 0.301/0.143. Same render, so they are the overlay
  plates again: see `.plates-2026-08-23/`.

## ⛔⛔⛔ The mobile master arrived pillarboxed — THIRD time (D319, D328, D333)

Inside the 1920×1080 container: a 9:16 film **608 wide, full height, centred at x=656**. Measured
two ways, agreeing exactly: `cropdetect` unanimous over 16 samples (`crop=608:1080:656:0`), and a
per-column luminance max over 11 frames (lit columns 656–1263, bar max luma 0/1). The pillars come
off; his framing is untouched.

## What ships

| band | file | size | from |
|---|---|---|---|
| ≥1121 desktop | `topcat-intro-1920.mp4` | 13.28 MB | the desktop master, full width |
| 721–1120 tablet | `topcat-intro-864.mp4` | 5.62 MB | the **same** master, D312's 4:5 window at x=680 |
| ≤720 phone | `topcat-intro-608.mp4` | 3.87 MB | the mobile master, pillars cropped |

All three **44.250s / 531 frames at 12fps**, single video stream, GOP I+7P — the scroll maths and
the seek cadence are identical to the D328 cuts (seek latency measured p50 5.5ms / max 10.5ms).
Sizes are in family with D328's 12.74/5.40/3.72 — the denser veining costs ~4%.

⚠️ `?v=` went **2 → 3** on all three films and **3 → 4** on all three posters in the same edit of
`index.html`, plus plates at `?v=3`. `.htaccess` holds mp4 for a week.

## Re-running

```bash
cd "Website Demo/assets/video/.src-2026-08-23" && bash encode.sh
cd "../.plates-2026-08-23" && python3 make_plates.py   # plates AND posters, from the stills
```
