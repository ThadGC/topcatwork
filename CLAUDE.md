# Notes for whoever works on this repo next

Written 25 August 2026, after a round chasing "the background and text are choppy".
Everything here is measured, not assumed. Where a number appears, it came off a real
run — if you change the thing it describes, re-measure rather than trusting the note.

---

## 1. `index.html` contains a verbatim copy of `assets/site.css` and `assets/site.js`

This is the single easiest way to break this site, so it is first.

The homepage does **not** link the shared stylesheet or script. It inlines both, in
full, and the inline copies are byte-identical to the files on disk (verified:
whitespace-normalised, 181,310 chars of CSS and 222,510 chars of JS, exact match).
The five inner pages — about, contact, estimate, projects, services — link the
external files instead.

**So every edit to the site CSS or the site JS has to land in two places:**

- `index.html` (the inline `<style>` and the large inline `<script>`)
- `assets/site.css` / `assets/site.js`

Patch one and not the other and the homepage and the inner pages silently diverge.
Nothing warns you. There is no build step in this repo that regenerates one from the
other — the builders were removed in `be0bec5` ("main IS the website — one folder,
nothing else").

Before you commit, confirm the two still agree.

**Do not "fix" this by switching the homepage to external files.** It looks like an
obvious win and it is not. `.htaccess` serves HTML `no-cache` and CSS/JS
`immutable, max-age=31536000`, so splitting helps repeat visitors and costs
first-time visitors two extra round trips. On a marketing site for a worktop
fabricator, first-time visitors are the ones who matter. Brotli takes the 506 KB
homepage down to roughly 65 KB on the wire; the inline copy is defensible. If you
ever revisit this, decide it on measured field data, not on instinct.

---

## 2. Never sample the film once per animation frame

This was the bug fixed in D454 (`da72f35`), and it is very easy to reintroduce
because the code that does it reads as innocent.

`grade()` and `bandGrade()` in the film module work out how bright the film is
behind the nav band and behind each line of copy, so the gold can be graded against
it. They do that by pulling the decoded video frame back off the GPU:

```js
gctx.drawImage(vid, sx, sy, sw, sh, 0, 0, 48, 8);
const d = gctx.getImageData(0, 0, 48, 8).data;
```

**That readback costs ~8.3 ms per call** on a desktop against the 1920 cut. Measured,
repeatedly, with 300 warm iterations. The `getImageData` is not the expensive part —
that is 0.008 ms. The cost is `drawImage(video, …)`, because it forces the decoded
frame out of GPU memory and into a CPU-readable canvas, which stalls the pipeline.

Both functions were being called once per `requestAnimationFrame` tick — `grade()`
unconditionally, `bandGrade()` once for **every lit line of copy**. Two to four
readbacks per frame, 17–33 ms, against a 16.7 ms frame budget. Every frame was late.
That is what "choppy background and choppy text" was: dropped frames, on desktop as
well as phone.

The fix is memoisation, not removal. The film is **scrubbed, not played** — a new
frame only reaches the screen when a seek completes, roughly every 100–150 ms.
Sampling faster than the film changes just re-reads identical pixels. So `gTick()`
stamps a token per presented frame and both samplers memoise against it. Result over
300 driven ticks: 300 readbacks → 38, and driver wall time 1478 ms → 675 ms.

**Rules that follow:**

- Never put `drawImage(video, …)` or `getImageData` on a per-frame path. If you need
  to sample the film, go through the existing token.
- `bandGrade`'s memo key includes the element's box rounded to 8 px, because a line
  travelling across a held frame genuinely must resample. Keep that if you touch it.
- The same applies to anything else that reads pixels back — `toDataURL`,
  `createImageBitmap` off a video, `WebGL readPixels`. All of them stall.

---

## 3. The film is scrubbed by `currentTime`, and that has a hard ceiling

Understand this before proposing to make the film smoother, because the obvious
moves do not work.

`seek()` sets `vid.currentTime` to advance the film. Every one of those is a real
decoder seek: the browser jumps to the previous keyframe and decodes forward. On a
desktop, with the file **fully buffered off local disk and an idle CPU**, that costs:

| | |
|---|---|
| mean | 22 ms |
| p90 | 38 ms |
| max | 51 ms |

So the film's best possible update rate is ~45 fps, delivered at irregular intervals.
Irregular delivery reads as judder even when the average looks acceptable. Over a
network, on a phone, it is much worse.

The encodes as they stand:

| cut | size | resolution | fps | keyframe every |
|---|---|---|---|---|
| `topcat-intro-1920.mp4` | 25.6 MB | 1920×1080 | 60 | 8 frames (0.133 s) |
| `topcat-intro-864.mp4` | 6.8 MB | 864×1080 | 60 | 12 frames (0.2 s) |
| `topcat-intro-608.mp4` | 6.3 MB | 608×1080 | 60 | 12 frames (0.2 s) |

Seek cost is driven by the keyframe interval — the decoder pays for every frame
between the keyframe and the target. Denser keyframes make seeks cheaper and files
bigger, and there is no setting that gives you both. Re-encoding the phone cut
all-intra at CRF 26 produced **17.5 MB** against the 6.3 MB it replaces; at GOP 3,
12.8 MB. Both trade a seek problem for a buffering problem.

**The way out of the trade-off is to stop seeking.** The film is described in the
commit log as a one-way journey (D403–D405). Forward playback is what decoders are
built for: `play()` with `playbackRate` modulated to follow the scroll costs no
seeks at all and delivers frames on a regular cadence. That is a real change to the
film module and it needs proper testing on a real phone, but it is the only approach
that makes the scrub smooth without making the download worse.

Also note `SRCFPS = 12` is the rate of the **animation tables** (`REV_X`, `PREV_X`,
`TREV_X`), not the video. The video is 60 fps. Do not "correct" one to the other.

---

## 4. `?v=` stamps are the file's sha1, and two of them are currently wrong

`.htaccess` serves `.css` and `.js` as `immutable, max-age=31536000`. The only thing
stopping a visitor holding a year-old copy is the `?v=` stamp in the URL changing
when the file changes. The convention is the first 10 hex of the file's sha1.

As of this writing both are stale — they were already stale before D454:

| file | stamp in the 5 inner pages | actual sha1 |
|---|---|---|
| `assets/site.css` | `46a7026e1b` | `5fe8d9a6cb` |
| `assets/site.js` | `c30dda8b2c` | `1bdb1eb589` (pre-D454) |

This is the D289 failure the `.htaccess` header warns about, live again. It needs
fixing, but find out first how those stamps are produced now that the builders are
gone — hand-editing five files will be undone by whatever regenerates them.

The film's `?v=` on the `.mp4` and its poster is hand-bumped. `.htaccess` is emphatic
about bumping both in the same edit as a re-encode. It is right.

---

## 5. Where the site actually is

- `www.topcatworktops.co.uk` and the apex are **not this site**. They are served by
  **Vercel**, running an older Next.js build (`x-nextjs-prerender: 1`, cache age ~27
  days). Every asset in this repo 404s there. Do not test against that domain and
  conclude anything.
- The live copy under test is on **SiteGround**. Its URL is not recorded anywhere in
  this repo, which is its own problem — write it down somewhere when you learn it.
- `.htaccess` cannot reach SiteGround's own dynamic cache, which sits in front of
  Apache. **Flush it in Site Tools after every upload** or you will spend an hour
  debugging a build that was never served.

---

## 6. Things that are already fine — leave them alone

Checked during the D454 round, so nobody spends the time again:

- **Image loading is in good shape.** 1040 `<img>` across the site, 675 lazy. The
  homepage loads only 8 images eagerly, 0.2 MB total. `stones/index.html` has 134
  images and lazy-loads 132 of them. 662 carry `srcset`, 1032 carry `decoding`.
- **The slab tiles are correctly sized**, shipping an 800 px `-s` variant alongside
  the 1600 px original with `srcset` picking between them.
- **`header.bar::before`'s `backdrop-filter: blur(14px)` is not a scroll cost.** It
  sits at `opacity: 0` until `.scrolled`, and by the time it fades in the film has
  locked. It looks alarming in a grep. It is not the problem.

The one genuine outstanding CLS item: 683 of the 1040 `<img>` tags carry no `width`,
including 17 of the 21 on the homepage.

---

## 7. Housekeeping

- **Never commit benchmark or test media.** It is very easy to leave a 17 MB encode
  in a scratch folder and push it. This repo is already 318 MB.
- The commit log uses `D<number>` markers that continue from a decision register.
  Check `git log -1` before claiming a number — D451–D453 and D454 were assigned in
  parallel by two people on the same afternoon and nearly collided.
