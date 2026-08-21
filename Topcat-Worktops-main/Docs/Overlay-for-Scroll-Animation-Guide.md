# Scroll-scrubbed film with section holds — build guide

**Hand this whole file to Claude.** It is written to be executed, not just read.

It describes how to build a site where scrolling scrubs a video frame by frame,
the camera **parks on a chosen frame** for each section while that section's copy
is on screen, and the **original generation still is overlaid** on the parked
frame so the copy is read against a clean image instead of a compressed video
frame.

Anthropic ships a `scroll-scrub-video` skill that covers the encode and a base
scrub template. If Claude has it, use it for §1–§3 and treat this document as
everything after — the holds, the plates, the carry, and the verification are
what it does not cover, and they are where all the difficulty is.

---

## The one thing to understand before starting

**There is no sharp frame in the middle of a camera move.** Rendered motion blur
is proportional to how far the camera travelled during the shutter, so every
frame of a fast pan is smeared, and its neighbours are smeared by the same
amount. Measured on a real 1300-frame film: within any moving stretch every
frame sits within 0.90–1.08 of its neighbours for detail; only 5% of frames have
a frame 25% sharper within three; 26% have none within sixty. A parked frame
scores ~1200 for detail, a moving one 180–360.

So do not plan to "snap to the nearest sharp frame" when the viewer stops. It
cannot work. The design that does work:

1. Pick a small number of **holds** — frames where the camera is parked.
2. Overlay the **original still** on each hold, so the resting image is perfect.
3. When the viewer stops mid-flight, **carry them on to the next hold** rather
   than leaving them parked on a smear.

Everything below is that, in order.

---

## 0. Get these from the user before writing any code

| | why it matters |
|---|---|
| **The film master** (`.mov`/`.mp4`, any size) | must be re-encoded; the original is never served |
| **The still each section sits on** — the generation plates | overlaid at the hold. Without these, skip §5 and accept a compressed frame under the copy |
| **Copy for each section** | drives the dwell lengths |
| **Whether phones get their own render** | a 16:9 film centre-cropped into a 9:19.5 phone throws away ~17% of the width. That is geometry, not a setting |

**Ask whether every section has a still.** On the project this came from, one of
eight was missing because that shot had been re-rendered after the still was
made — and nobody noticed until the plate was matched against the film and
scored eight times worse than every other. That section still has no plate.

**Do not trust the still filenames.** On the same project the files were numbered
in an order that had since changed, and four of the eight named the wrong
section. Derive the mapping from the footage (§4.2). Never from the name.

---

## 1. Encode the film all-intra

Non-negotiable. Every frame must be a keyframe or seeking to an arbitrary frame
requires decoding from the last I-frame, and the scrub stutters.

```bash
ffmpeg -i "MASTER.mov" -an \
  -c:v libx264 -g 1 -bf 0 -crf 20 -preset medium \
  -pix_fmt yuv420p -profile:v high -fps_mode passthrough \
  -movflags +faststart demo/assets/animation.mp4
```

`-g 1` = keyframe interval of one. `-bf 0` = no B-frames. `-fps_mode passthrough`
keeps the frame count exact, which everything downstream depends on.

**Verify it took:**

```bash
ffprobe -v error -select_streams v:0 -show_entries frame=pict_type -of csv=p=0 animation.mp4 | sort | uniq -c
```

Every line must read `I`. A single `P` or `B` means the encode did not apply.

**Then record the exact frame count and duration** — hold times are derived from
them and being one frame out is visible:

```bash
ffprobe -v error -select_streams v:0 -show_entries stream=width,height,nb_frames,duration,r_frame_rate -of default=nw=1 animation.mp4
```

**On size.** All-intra is large: expect 60–120 MB for a minute of 1080p. CRF 20
is a good default; CRF 22–23 if it must fit under a limit (GitHub hard-rejects
files over 100 MB). The plates in §5 buy real headroom here — once the resting
frames are covered by stills, the video only has to carry the *moving* frames,
where nobody can resolve fine detail anyway.

**Serve it over HTTP with Range support.** Python's plain
`SimpleHTTPRequestHandler` ignores `Range`, and the video then sticks on frame 0
forever because the seek never completes. `file://` fails the same way.

---

## 2. Lay out the track

The page is a tall spacer with a `position: sticky` stage inside it. Scroll
position maps to a target time in the film.

The track is **not** a linear map of scroll to time. It alternates:

- **dwell** — a run of scroll where the film time does not change at all. This is
  where a section's copy rises, is read, and falls.
- **travel** — a run of scroll where the film time moves from one hold to the
  next.

```js
let segs = [], totalPx = 0;
const measure = () => {
  const h = window.innerHeight;
  if (h <= 0) return;             // hidden pane / pre-render: keep the old track
  vh = h;
  segs = []; let at = 0;
  sections.forEach((s, i) => {
    const px = s.dwell / 100 * vh;                       // dwell is in vh units
    segs.push({ kind: 'dwell', sec: s, from: at, len: px });
    s.dwellFrom = at; s.dwellLen = px;
    at += px;
    const next = sections[i + 1];
    if (next) {
      const tpx = (next.t - s.t) * TRAVEL_VH_PER_SEC / 100 * vh;
      segs.push({ kind: 'travel', t0: s.t, t1: next.t, a: s, b: next, from: at, len: tpx });
      at += tpx;
    }
  });
  totalPx = at;
  cine.style.height = Math.round(totalPx) + 'px';        // the spacer IS the track
};
```

**`TRAVEL_VH_PER_SEC` is the pacing dial** — screens of scroll per second of
film. 26 is brisk, 34 is deliberate, past ~45 it reads as sluggish. It is also
the exchange rate the carry in §6 uses, so the two move together.

**Ease the travel with smoothstep, not linearly.** Every travel sits between two
parked dwells; a linear map means the camera snaps from standstill to full speed
at one boundary and slams to a stop at the other — a velocity discontinuity at
every join, which is exactly where a scrub feels rough.

```js
const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

let tT;
if (seg.kind === 'dwell') tT = seg.sec.t;                       // parked
else tT = seg.t0 + (seg.t1 - seg.t0) * smooth(0, 1, (y - seg.from) / seg.len);
```

**Dwell floor:** roughly 120vh. At a 720px viewport that is 864px of scroll, and
one hard trackpad flick covers 800–1200px. Below ~110 a single gesture crosses
the entire hold, which is the one thing the dwell exists to prevent. Take pace
out of `TRAVEL_VH_PER_SEC` before cutting dwells further.

---

## 3. Drive the video

Two rules, both load-bearing.

**Ease the shown time toward the target** — never assign scroll position straight
to `currentTime`, or the video jitters one frame behind the compositor:

```js
shownT = shownT + (tT - shownT) * 0.14;    // 0.10 = long cinematic glide, 0.16 = snappy
seekIfWorthIt(shownT);
```

**Never issue a seek while one is in flight, and never issue one smaller than a
frame:**

```js
let shownT = 0, seekStamp = 0;
const seekIfWorthIt = t => {
  if (vid.readyState < 2) return;
  if (vid.seeking) {
    // watchdog: a seek into unbuffered data can stall. Re-issue rather than
    // letting one stuck seek mean "parked on this frame forever".
    if (performance.now() - seekStamp > 1200) {
      seekStamp = performance.now();
      try { vid.currentTime = t; } catch (e) {}
    }
    return;
  }
  if (Math.abs(vid.currentTime - t) <= 1 / FPS) return;
  seekStamp = performance.now();
  vid.currentTime = t;
};
```

Also required, all cheap:

- Run the whole thing in **one `requestAnimationFrame` loop**, not on scroll
  events. Scroll events fire once per notch and then coast; the loop sees the
  real position.
- **Pause the loop** with an `IntersectionObserver` when the stage is off screen.
- **Promote the stage** with `transform: translateZ(0)`; never animate layout
  properties in the loop. Writing `height` on a progress bar every frame dirties
  layout, layout re-resolves the sticky offset on the main thread, and the whole
  stage judders. Use `transform: scaleY()`.
- **Prime iOS** with a muted `play()` → `pause()` on first touch, or seeks render
  black.
- **Honour `prefers-reduced-motion`**: collapse the track to one screen and show
  a static first frame.
- **Cache-bust every asset with `?v=N`** and bump N on any re-encode. The film is
  served with a long `max-age` (re-downloading 90 MB a visit defeats the point),
  so without a new URL browsers serve the old cut.

---

## 4. Find the holds — this is the part that goes wrong

A hold is a `t` in seconds. Getting it wrong by two frames is visible, and
sharpness scores alone will not find it. Work through these four in order.

### 4.1 Measure camera motion per frame

Sharpness cannot answer "is this frame blurred" — a Laplacian score conflates
blur with *content*, and a clean frame of sky scores lower than a smeared frame
of rock. Camera translation does not have that problem: the renderer's motion
blur is proportional to how far the camera moved during the shutter.

Phase correlation gives sub-pixel translation between consecutive frames in a
few milliseconds each. Hann-window the frames first or the edge discontinuity
puts a false peak at zero shift on every frame.

### 4.2 Match each still into the film

Do not trust filenames (see §0). Match on **structure** — zero-mean, unit-
variance greyscale — because a generation still and the render made from it are
graded slightly differently, and a raw difference ranks on exposure instead of
content. A real match scores 0.03–0.07 against a next-best of 0.26–0.55. A score
above ~0.3 means that still is not in this film at all.

### 4.3 "Camera parked" is not "picture still" — the trap that costs the most

Phase correlation measures **translation**. A shot holding on firelight, fog,
lanterns or particles reads as a flat 0.00 px/frame while the picture keeps
evolving toward the still it was generated from.

Real numbers from one film: across a 19-frame "rest" the distance to the plate
falls monotonically 0.169 → 0.037. Across a 42-frame one, 0.378 → 0.041. Parking
at the near end of a rest is therefore **not free**, even though nothing is
moving. Three of eight holds were 2× off their plates for exactly this reason.

**So: when a plate exists, plate distance is the only metric you need.** It
captures registration *and* blur in one number — a blurred frame differs from the
sharp still more than a clean one does. Rank on it, not on sharpness, not on
motion.

### 4.4 The engine lands up to a frame short of `t`

Because `seekIfWorthIt` skips seeks smaller than one frame, the settled
`currentTime` is the **last seek issued**, which is always a hair below the
target. Measured across eight holds: **−0.02 to −1.00 frames**, and it varies
between stops on the same hold.

You cannot control which of the two it shows. So do not try — **choose a hold
frame `f` that minimises `max(d[f], d[f-1])`**, where `d` is plate distance.
Both are then good, whichever appears.

This single criterion reproduces every hand-picked hold on the reference project,
and it automatically avoids the classic failure of parking on the first frame of
a rest — because then `f-1` is the last *moving* frame of the approach and the
`max` is terrible.

### The script that does all four

Save as `holds.py`. It prints a ready-to-paste table.

```python
"""holds.py - where does each section's hold go?

    python holds.py path/to/animation.mp4 path/to/stills_dir

Prints, for every still: which frame of the film it matches, how confident that
match is, and the recommended hold frame + time. Also prints a base64 camera-
speed table (one byte per frame, 1/16 px) for the optional settle.

Nothing here is tuned to a particular film: the working resolution follows the
source's own aspect ratio, the match window follows its frame rate, and the hold
is chosen on plate distance alone - see "the criterion" below.
"""
import base64, os, subprocess, sys
import numpy as np
from PIL import Image

WIDTH = 320          # working width; height follows the source's aspect


def probe(path):
    out = subprocess.check_output([
        'ffprobe', '-v', 'error', '-select_streams', 'v:0',
        '-show_entries', 'stream=width,height,nb_frames,r_frame_rate,duration',
        '-of', 'default=nw=1:nk=1', path]).decode().split()
    w, h = int(out[0]), int(out[1])
    num, den = out[2].split('/')
    fps = float(num) / float(den)
    return w, h, fps


def norm(a):
    a = a.astype(np.float32)
    return (a - a.mean()) / (a.std() + 1e-6)


def decode(path, W, H):
    p = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', path,
                          '-vf', 'scale=%d:%d,format=gray' % (W, H),
                          '-f', 'rawvideo', '-pix_fmt', 'gray', '-'],
                         stdout=subprocess.PIPE, bufsize=W * H * 64)
    out = []
    while True:
        b = p.stdout.read(W * H)
        if len(b) < W * H:
            break
        out.append(np.frombuffer(b, np.uint8).reshape(H, W))
    p.stdout.close(); p.wait()
    return np.stack(out)


def shift(a, b, W, H):
    """Translation from a to b in px, by phase correlation."""
    fa, fb = np.fft.rfft2(a), np.fft.rfft2(b)
    cross = fa * np.conj(fb)
    mag = np.abs(cross); mag[mag < 1e-9] = 1e-9
    r = np.fft.irfft2(cross / mag, s=a.shape)
    dy, dx = np.unravel_index(np.argmax(r), r.shape)
    if dy > H // 2: dy -= H
    if dx > W // 2: dx -= W
    return float(np.hypot(dx, dy))


def main():
    film, stills = sys.argv[1], sys.argv[2]
    sw, sh, fps = probe(film)
    W = WIDTH
    H = max(2, int(round(WIDTH * sh / sw)) // 2 * 2)     # follow the source aspect, keep it even
    raw = decode(film, W, H)
    n = len(raw)
    print('film: %dx%d, %d frames, %.4fs at %g fps  (working at %dx%d)'
          % (sw, sh, n, n / fps, fps, W, H))

    # --- camera speed. Hann-windowed, or the frame edge fakes a peak at zero shift
    win = np.outer(np.hanning(H), np.hanning(W)).astype(np.float32)
    wf = raw.astype(np.float32) * win
    motion = np.zeros(n, np.float32)
    for i in range(1, n):
        motion[i] = shift(wf[i - 1], wf[i], W, H)
    motion[0] = motion[1] if n > 1 else 0.0
    rest_thr = max(0.4, float(np.percentile(motion, 15)))   # adaptive, diagnostic only
    print('camera speed: median %.2f, p90 %.2f, max %.2f px/frame at %dpx wide; "at rest" < %.2f\n'
          % (np.median(motion), np.percentile(motion, 90), motion.max(), W, rest_thr))

    F = np.stack([norm(f) for f in raw])
    win_fr = int(round(fps))            # +-1s: how far the hold may sit from the match
    excl = int(round(fps * 2))          # +-2s: excluded when looking for the next-best match

    print('%-26s %-8s %-7s %-9s %-8s %-9s %s'
          % ('still', 'matches', 'score', 'next-best', 'hold', 'hold t', 'worst of the pair'))
    rows = []
    for fn in sorted(os.listdir(stills)):
        if not fn.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')):
            continue
        q = norm(np.asarray(Image.open(os.path.join(stills, fn)).convert('L')
                            .resize((W, H), Image.LANCZOS)))
        d = np.abs(F - q).mean(axis=(1, 2))
        j = int(np.argmin(d))
        far = d.copy(); far[max(0, j - excl):j + excl + 1] = np.inf
        second = float(far.min())
        if d[j] > 0.30 or second / max(d[j], 1e-9) < 1.6:
            print('%-26s %-8s %-7.3f %-9.3f  NOT IN THIS FILM - wrong still, or the shot was re-rendered'
                  % (fn[:26], 'f%d' % j, d[j], second))
            continue

        # THE CRITERION. The engine settles up to a full frame short of t, so
        # both f and f-1 have to be good; pick the f whose worse half is best.
        #   - f=0 has no f-1 and cannot be undershot below it, so it scores alone
        #   - the LAST frame is unreachable (the seek is clamped off the end of
        #     the file), so the search stops at n-2
        # Deliberately NOT gated on "is the camera at rest": plate distance
        # already carries blur AND registration - a smeared frame differs from
        # a sharp still more than a clean one does - and any motion threshold
        # would be a number tuned to one film's camera speeds.
        lo = max(0, j - win_fr)
        hi = min(n - 2, j + win_fr)
        best_f, best_v = None, 1e9
        for f in range(lo, hi + 1):
            v = d[f] if f == 0 else max(d[f], d[f - 1])
            if v < best_v: best_f, best_v = f, v
        if best_f is None:
            print('%-26s %-8s %-7.3f %-9.3f  no reachable frame near the match'
                  % (fn[:26], 'f%d' % j, d[j], second))
            continue
        t = best_f / fps
        r0, r1 = best_f, best_f
        while r0 > 0 and motion[r0] < rest_thr: r0 -= 1
        while r1 < n - 1 and motion[r1 + 1] < rest_thr: r1 += 1
        note = '  (at rest %d-%d)' % (r0, r1) if r1 > r0 else '  (camera never stops here)'
        if j >= n - 1: note += '  NB best match is the final frame, which the seek clamp cannot reach'
        print('%-26s %-8s %-7.3f %-9.3f f%-7d %-9.4f %.3f%s'
              % (fn[:26], 'f%d' % j, d[j], second, best_f, t, best_v, note))
        rows.append((fn, best_f, t))

    print('\npaste into POINTS (rename ids, set dwell/copy yourself):')
    for fn, f, t in rows:
        print("    { id: '%s', t: %.4f, dwell: 150 },   /* f%d, from %s */"
              % (os.path.splitext(fn)[0].lower().replace(' ', '-'), t, f, fn))

    q = np.clip(np.round(motion * 16), 0, 255).astype(np.uint8)
    b = base64.b64encode(q.tobytes()).decode()
    print('\ncamera-speed table, %d frames (max quantise error %.4f px):'
          % (n, float(np.abs(motion - q / 16.0).max())))
    lines = [b[i:i + 96] for i in range(0, len(b), 96)]
    print('\n'.join("    '%s' +" % l for l in lines)[:-2] + ';')


if __name__ == '__main__':
    main()
```

**Re-run this whenever the film is re-cut, and replace the table with the video.**
A stale camera-speed table snaps to the wrong frames, which is worse than not
snapping at all.

### What good output looks like

Run against the reference project's own film and stills, this is what it prints —
and it independently reproduces holds that had been picked by hand over several
days, five of seven exactly and two within a single frame:

```
still                      matches  score   next-best hold     hold t    worst of the pair
1 hero.png                 f0       0.051   0.292     f0       0.0000    0.051  (rest 0-65)
2 work.png                 f145     0.082   0.488     f145     6.0417    0.095  (rest 144-145)
3 process.png              f338     0.039   0.267     f339     14.1250   0.042  (rest 338-341)
4 services.png             f530     0.033   0.446     f530     22.0833   0.043  (rest 528-541)
5 hard truths.png          f529     0.330   0.558      NOT IN THIS FILM - wrong still, or the shot was re-rendered
6 about us.png             f916     0.043   0.434     f917     38.2083   0.046  (rest 900-918)
7 FAQ.png                  f1109    0.042   0.466     f1110    46.2500   0.043  (rest 1088-1113)
8 final cta.png            f1299    0.051   0.361     f1298    54.0833   0.075  (rest 1258-1299)  NB best match is the final frame...
```

Read it like this:

- **`score` vs `next-best`** is the confidence. 0.03–0.08 against 0.27–0.56 is
  unambiguous. `5 hard truths.png` at 0.330 against 0.558 is not a weak match, it
  is **no match** — that shot had been re-rendered and the still was never
  replaced. The script says so rather than quietly picking a frame, which is the
  single most useful thing it does.
- **`process.png` matched f338 but the hold is f339.** f338 is the frame the
  camera *arrives* on, so an undershoot would show f337, still moving. f339 costs
  0.003 and cannot.
- **`worst of the pair` is the number to judge by** — it is what you actually get
  on a bad stop. Anything an order of magnitude above its neighbours means the
  hold is wrong or the still does not belong to that shot.
- **The filenames are wrong here and it does not matter.** `3 process.png` is the
  stairway that About sits on; `6 about us.png` is the hut that Process sits on.
  The script never reads the names, so the mapping comes out right anyway. Assign
  sections from the frame numbers, not the filenames.

---

## 5. Overlay the stills on the holds

At a hold the copy is being read against the frame behind it, and that frame has
been through an H.264 encode. The fix is to cross-fade the **original generation
still** over the video while the section is up.

**Use the original file. Never a still re-extracted from the video** — that
carries exactly the compression it is meant to be covering. It is overlaying the
same thing over itself.

Markup — one div as the first child of each section frame, under the copy and
over the video:

```html
<div class="plate" aria-hidden="true" style="background-image:url('assets/plate-work.webp?v=1')"></div>
```

```css
.cine__stage .plate {
  position: absolute; inset: 0; z-index: 0;
  background-size: cover; background-position: center;
  opacity: 0; pointer-events: none;
}
.scene.on .plate { will-change: opacity; }   /* only while the scene is live */
```

Driver — **opacity comes from how far the footage is from the hold, in frames.
Not from dwell progress:**

```js
if (s.plate) {
  const off = Math.abs(shownT - s.t) * FPS;
  const po = (1 - smooth(0.5, 3, off)).toFixed(3);   // solid within half a frame, gone by 3
  if (po !== s.lastPO) { s.plate.style.opacity = po; s.lastPO = po; }
}
```

A scene's own fade typically runs a third of a screen past its dwell, so a
dwell-driven plate would still be lit after the camera had pulled away — the
still would be sitting over a completely different shot.

Export at the film's native resolution, WebP q90. Eight 1080p plates came to
0.9 MB total.

**Verify registration, do not eyeball it.** After wiring up, drive the real
engine (§7) and print, for each section, the frame actually shown and its plate
distance. On the reference project six of seven land on the best frame available
in the run. If one is much worse than its neighbours, the hold is wrong.

---

## 6. Carry on to the next hold when the viewer stops mid-flight

Given §0 — no sharp frame exists mid-flight — the only real answer is to finish
the flight. After the scroll has been quiet for 450ms inside a travel segment,
ease the page to the next hold.

Three things make this feel like the camera landing rather than the page being
snatched:

**Direction-locked, not nearest.** Taking whichever hold is closer means stopping
just short of a section drags the viewer *backwards* through the film — the site
undoing a scroll they just made. Move only the way they were already going.

**Duration derived from the film, not from pixels.** A generic jump-scroll curve
crosses a typical flight in ~650ms, which reads as a snatch. Convert the
remaining scroll back into film-seconds at the same rate the track was laid out
with, and play those at ~1.9× real time. A full flight is ~8 film-seconds and
plays over ~4s. It is the shot finishing, not a snap.

**Cancellable on the first input**, and never under `prefers-reduced-motion` —
unrequested page movement is the exact thing those visitors asked not to have.

```js
const GLIDE_IDLE = 450;    /* ms of quiet before it fires */
const GLIDE_RATE = 1.9;    /* film-seconds per real second; 1.0 = the shot at its own speed */
const GLIDE_MAX  = 4200;   /* ms - longest the page will ever move on its own */

/* +1 down, -1 up. Only recorded while nothing is jumping, or the carry keeps
   re-arming its own direction from its own scrolling. */
if (y !== lastScrollY) {
  if (!jumping && lastScrollY >= 0) scrollDir = y > lastScrollY ? 1 : -1;
  lastScrollY = y; stillSince = nowMs;
}
const idleFor = nowMs - stillSince;

if (!reduceMotion && seg.kind === 'travel' && idleFor > GLIDE_IDLE && !jumping) {
  const to = scrollDir < 0 ? seg.a : seg.b;          // distance is never consulted
  const px = Math.abs(targetFor(to.id) - y);
  const filmSecs = px / (TRAVEL_VH_PER_SEC / 100 * vh);
  jumpTo(to.id, clamp(filmSecs / GLIDE_RATE * 1000, 900, GLIDE_MAX));
}
```

Reuse whatever eased jump-scroll the nav already uses, so it is the same motion
the site uses elsewhere — but **give the running animation its own cancellation
token**:

```js
let jumping = null;
function jumpTo(id, ms) {
  const target = targetFor(id);
  if (reduceMotion) { window.scrollTo(0, target); return; }
  const from = window.scrollY, dist = target - from;
  if (Math.abs(dist) < 4) return;
  const dur = ms || clamp(500 + Math.abs(dist) * 0.1, 600, 1800);
  const t0 = performance.now();
  const token = { cancel: false };
  jumping = token;
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const tick = now => {
    if (token.cancel) return;
    const t = clamp((now - t0) / dur, 0, 1);
    window.scrollTo(0, from + dist * ease(t));
    if (t < 1) requestAnimationFrame(tick);
    else if (jumping === token) jumping = null;
  };
  requestAnimationFrame(tick);
}
['wheel', 'touchstart', 'keydown'].forEach(ev =>
  window.addEventListener(ev, () => { if (jumping) { jumping.cancel = true; jumping = null; } }, { passive: true })
);
```

> **The bug that hides here:** if cancelling only sets `token.cancel` and leaves
> `jumping` pointing at a dead animation, every later `if (!jumping)` test is
> blocked for the rest of the visit — the carry works exactly once and then
> silently never fires again. The token above separates "is a scroll running"
> from "should I stop". This shipped broken and was only caught by reasoning
> about it, because nothing throws.

**Optional extra: the settle.** A displacement-bounded search for the stillest
frame within ~3% of frame width, fired after 140ms of quiet, converts near-misses
into clean landings — dead-still stops go from 30% to 42%. Be honest about its
ceiling: it barely touches the heavy cases (20% → 18%), because in the middle of
a fast pan the nearest still frame is 27+ frames and a third of a screen away.
The carry is what actually solves the problem; the settle is a polish pass.

---

## 7. Verify it — and you cannot do it in a hidden tab

**A hidden tab runs no `requestAnimationFrame` callbacks at all**, so the whole
engine is frozen and every screenshot and reading is meaningless. If Claude is
driving a preview pane that is not on screen, it is testing nothing.

`--headless --screenshot --virtual-time-budget` is **not** a substitute either:
virtual time fast-forwards the 1200ms stuck-seek watchdog instantly, so every
seek is cancelled and re-issued and the video sits on frame 0 while the page
otherwise looks fine. Timing-based behaviour (the 450ms arm, the 4s carry)
collapses to nothing for the same reason.

Drive headless Chrome over CDP on a **real clock**. Node 24 has a global
`WebSocket`, so this needs no dependencies:

```js
/* verify.js - node verify.js   (a Range-capable server must be up on :8173) */
const { spawn } = require('child_process');
const os = require('os'), path = require('path'), fs = require('fs');
const PORT = 9222, URL = 'http://localhost:8173/';
const PROFILE = path.join(os.tmpdir(), 'cdp-' + process.pid);   // must be ABSOLUTE
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function target() {
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/json/list`);
      const p = (await r.json()).find(t => t.type === 'page' && t.webSocketDebuggerUrl);
      if (p) return p.webSocketDebuggerUrl;
    } catch (e) {}
    await sleep(250);
  }
  throw new Error('no page target');
}

function connect(url) {
  const ws = new WebSocket(url);
  let id = 0; const waiting = new Map();
  ws.addEventListener('message', e => {
    const m = JSON.parse(e.data);
    if (m.id && waiting.has(m.id)) { waiting.get(m.id)(m); waiting.delete(m.id); }
  });
  return {
    ready: new Promise(r => ws.addEventListener('open', r)),
    send: (method, params = {}) => new Promise((res, rej) => {
      const i = ++id;
      waiting.set(i, m => m.error ? rej(new Error(m.error.message)) : res(m.result));
      ws.send(JSON.stringify({ id: i, method, params }));
    }),
    close: () => ws.close(),
  };
}

(async () => {
  const chrome = spawn('chrome', [       // full path on Windows
    '--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${PROFILE}`,
    '--window-size=1440,900', '--no-first-run', '--disable-gpu', '--hide-scrollbars',
    '--autoplay-policy=no-user-gesture-required', 'about:blank',
  ], { stdio: 'ignore' });

  const cdp = connect(await target());
  await cdp.ready;
  await cdp.send('Page.enable'); await cdp.send('Runtime.enable');
  const ev = async e => {
    const r = await cdp.send('Runtime.evaluate', { expression: e, awaitPromise: true, returnByValue: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.text);
    return r.result.value;
  };

  await cdp.send('Page.navigate', { url: URL });
  await sleep(7000);                     // let the film buffer; a scrub before that is noise

  // 1. does every hold land on the frame you chose?
  //    same ids and times as POINTS in the engine - keep them in step
  const HOLDS = { hero: 0, work: 6.0417, about: 14.125 /* ...one per section */ };
  for (const [id, want] of Object.entries(HOLDS)) {
    await ev(`document.querySelector('[href="#${id}"]').click()`);
    await sleep(3200);
    const t = await ev(`document.querySelector('video').currentTime`);
    console.log(id, 'want', want, 'got', t.toFixed(4), 'frame f' + Math.floor(t * 24 + 1e-4),
                'off', ((t - want) * 24).toFixed(2), 'frames');
  }

  // 2. does the carry go the way the viewer was going?
  const probe = async (label, y, dir) => {
    await ev(`scrollTo(0, ${dir > 0 ? y - 300 : y + 300})`);   // seed the direction
    await sleep(180);
    await ev(`scrollTo(0, ${y})`);
    await sleep(6500);
    console.log(label, '->', (await ev(`document.querySelector('video').currentTime`)).toFixed(2));
  };
  // land somewhere inside the first flight, whatever this film's layout is:
  // past the opening dwell, a third of the way into the travel after it
  const mid = await ev(`(() => {
    const vh = innerHeight, s = SECTIONS[0], n = SECTIONS[1];
    return Math.round(s.dwell / 100 * vh + (n.t - s.t) * TRAVEL_VH_PER_SEC / 100 * vh * 0.35);
  })()`);
  await probe('stopped mid-flight, scrolling DOWN', mid, +1);   // must land on SECTIONS[1]
  await probe('stopped mid-flight, scrolling UP', mid, -1);     // must land on SECTIONS[0]

  const shot = await cdp.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('shot.png', Buffer.from(shot.data, 'base64'));
  cdp.close(); chrome.kill();
  await sleep(500);
  try { fs.rmSync(PROFILE, { recursive: true, force: true }); } catch (e) {}
})();
```

**Always report `video.currentTime` next to a screenshot.** It is the only proof
the frame on screen is the intended one.

To check the cancel, sample **inside** the 450ms arm window — measure movement in
the 200ms before a synthetic `wheel` event and the 160ms after. Sample later than
450ms and the arm has already fired a *new* carry, and you will read that as
"never stopped". (That exact mistake produced a false failure on the reference
project; the code was fine, the test was not.)

---

## 8. Traps, each of which costs about a day

- **Adjacent string literals with no `+`.** A long base64 table pasted as
  multiple quoted lines without `+` is silently truncated by automatic semicolon
  insertion — the table decoded to 72 frames instead of 1300, parsed clean, threw
  nothing. **Always run the shipped decoder against the shipped literal** and
  assert the length equals the frame count.
- **Headless Chrome clamps the window to ~500px wide.** `--window-size=390`
  renders a 500px layout, so every `vw`-derived measurement is wrong and the
  screenshot lies about mobile.
- **A CSS keyframe with `forwards` beats the stylesheet.** An animation holding
  `letter-spacing: .18em` while the rule said `.04em` made every measurement of
  that element 21% too narrow — the mark was 36px off centre and clipped on
  phones. Unify the value in all three places.
- **CSS masks cannot threshold.** Every compositing mode scales or subtracts
  alpha; there is no `step()`. If an effect needs a hard cut-off in a noise mask,
  bake the threshold into the image.
- **`object-fit: cover` on a 16:9 film in a 9:19.5 viewport crops ~17% of the
  width.** That is geometry. The options are pan the crop, letterbox, or render a
  portrait cut — there is no setting that fixes it.
- **A second film needs a second set of everything.** Frame-matching one cut's
  holds into another scores 70–140 on a 0–255 scale — no frames in common. Source,
  duration, hold times, stills, poster and camera-speed table all swap as a set,
  or the viewer gets holds from the wrong render.
- **Commercial fonts.** If the design calls for one, buy the licence. Do not pull
  it from a free-font mirror.
- **Never commit a settings file that records tool-permission decisions.** They
  can contain presigned URLs with live auth tokens.

---

## 9. What is general here, and what is a starting value

The **method** is film-agnostic and the scripts take no hardcoded property of any
particular film — resolution and aspect come from `ffprobe`, the frame rate comes
from the file, the match window is expressed in seconds, and the hold is chosen
on plate distance alone rather than on any motion threshold. Tested both ways: on
the film it was written for it reproduces every hold, and pointed at an unrelated
portrait cut it correctly reports that none of the stills belong to it.

These, however, are **starting values, not constants.** Expect to move them:

| | default | move it when |
|---|---|---|
| `TRAVEL_VH_PER_SEC` | 26–34 | the site feels rushed or endless. Multiply by film length for total page height |
| `dwell` per section | 120–540 vh | the copy is longer or shorter. 120 is the floor — below that one flick crosses a whole hold |
| `GLIDE_RATE` | 1.9 | flights are much shorter or longer than ~8 film-seconds |
| `GLIDE_MAX` | 4200 ms | never let the page move on its own for longer than feels right on the actual footage |
| lerp `0.14` | 0.14 | slow atmospheric footage suits 0.10; punchy footage 0.16 |
| plate fade `smooth(0.5, 3, off)` | 3 frames | a slower camera can take a wider fade; a whip needs a tighter one |
| match reject at `0.30` | 0.30 | real matches came in at 0.03–0.08 and true non-matches at 0.31–0.52 on two different films. Print the numbers and check the gap is that clean before trusting it |

Two structural assumptions worth stating out loud, because they are the ones that
would need actual rework rather than a new number:

- **The camera parks at each section.** If the film never stops moving, there are
  no holds, the plates have nothing to register against, and the carry has
  nowhere to carry to. Check this first — `holds.py` prints `camera never stops
  here` when it happens.
- **The stills are the frames the film was rendered from.** If they were made
  some other way, or the shot was re-rendered afterwards, the overlay will never
  register no matter where the hold goes. The script's `NOT IN THIS FILM` line is
  what catches that.

## 10. Ship checklist

- [ ] every frame reports `pict_type=I`
- [ ] served over HTTP with Range support, not `file://`
- [ ] shipped motion table decodes to exactly the frame count, asserted in code
- [ ] every still matched into the film, mapping derived from footage not filenames
- [ ] any still scoring > 0.3 flagged to the user as missing, not silently skipped
- [ ] each hold picked by `min(max(d[f], d[f-1]))`
- [ ] plate opacity driven by frame distance from the hold, not dwell progress
- [ ] carry is direction-locked and cancels on the first wheel/touch/key
- [ ] `jumping` cleared on cancel, not just `token.cancel` set
- [ ] `prefers-reduced-motion` collapses the track and disables the carry
- [ ] every hold verified over CDP with `currentTime` printed, not eyeballed
- [ ] `?v=` bumped on every asset after a re-encode

---

*Written from a shipped build: a 1300-frame 54s film, 8 sections, 7 stills, ~35
screens of scroll. Every number quoted above was measured on it, not estimated.*
