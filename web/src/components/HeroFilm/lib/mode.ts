/**
 * HERO FILM — the bisect switch.
 *
 * ⛔ WHY THIS EXISTS. The shake this film is being rebuilt to avoid CANNOT BE
 * REPRODUCED LOCALLY. The client, 28 Aug: it never appears on localhost or in
 * a desktop device emulator, only on a real phone hitting a real deployment.
 * So nobody working on this code can test the thing they are fixing, and a
 * report of "still shaking" from a single URL teaches almost nothing.
 *
 * These modes exist so that ONE round of testing on his phone isolates the
 * cause. Each one removes exactly one layer and leaves everything else
 * identical. Give him the list, ask him to open each and say steady or
 * shaking, and the answers name the culprit between them.
 *
 * Read once at mount from `?film=`. Never read again, never watched — a mode
 * is a build variant, not a runtime setting.
 *
 * ── the order to try them in ────────────────────────────────────────────────
 *
 *   ?film=off      Nothing mounts. Static hero, normal page.
 *                  RUN THIS FIRST. It takes ten seconds and it is the only
 *                  one that can invalidate the whole diagnosis: if the page
 *                  STILL shakes with no film on it at all, the film was never
 *                  the cause and the problem is elsewhere on the page.
 *
 *   ?film=frozen   Everything mounts and is visible, the runway is full
 *                  height, but NO JavaScript runs — no loop, no seek, not one
 *                  style written. Pure CSS under the visitor's finger.
 *                  Shaking here means the cause is purely structural: the
 *                  stage is not getting a viewport-anchored fixed layer, and
 *                  something above it is clipping or scroll-positioning it.
 *                  Nothing else can be responsible, because nothing else runs.
 *                  Steady here means the structure is right and the cause is
 *                  in the loop or the media — go on to the next two.
 *
 *   ?film=noseek   The loop runs and the text animates exactly as shipped,
 *                  but `currentTime` is never written, so the picture holds a
 *                  single frame. Shaking here (after a steady `frozen`) means
 *                  main-thread cost in the loop or the text, not the media.
 *                  It also lets him say, by eye, whether the TEXT shakes
 *                  independently of the picture.
 *
 *   ?film=notext   The film scrubs; the story lines are not mounted at all.
 *                  Shaking here (after a steady `noseek`) means the media
 *                  pipeline — decode and presentation latency.
 *                  If `noseek` AND `notext` are both steady but the default
 *                  shakes, neither half alone overruns the frame budget and
 *                  the two together do.
 *
 *   ?film=range    Reverts to a plain `src=` and lets the browser range-fetch
 *                  while the scrub seeks, exactly as the old build did, with
 *                  every other rule still in force. This is the one mode where
 *                  SHAKING IS GOOD NEWS: it proves memory residency is what
 *                  fixed it, and it proves the phone can be made to reproduce
 *                  the old failure on demand.
 *
 *   ?film=noscale  Drops the reveal line's 1 -> 0.84 exit shrink, the film's
 *                  only animated scale on live text. For the case where the
 *                  text alone is reported unsteady as beat 2 leaves.
 */

export type FilmMode =
  | 'on'
  | 'off'
  | 'frozen'
  | 'noseek'
  | 'notext'
  | 'range'
  | 'noscale';

const MODES: readonly FilmMode[] = [
  'on',
  'off',
  'frozen',
  'noseek',
  'notext',
  'range',
  'noscale',
];

export function readFilmMode(search?: string): FilmMode {
  try {
    const q = search ?? (typeof location === 'undefined' ? '' : location.search);
    const v = new URLSearchParams(q).get('film');
    return (MODES as readonly string[]).includes(v ?? '') ? (v as FilmMode) : 'on';
  } catch {
    return 'on';
  }
}

/** Does this mode mount the film at all? */
export const mounts = (m: FilmMode): boolean => m !== 'off';
/** Does this mode run the animation loop and write styles? */
export const animates = (m: FilmMode): boolean => m !== 'off' && m !== 'frozen';
/** Does this mode drive `video.currentTime`? */
export const seeks = (m: FilmMode): boolean => animates(m) && m !== 'noseek';
/** Does this mode render the story lines? */
export const showsText = (m: FilmMode): boolean => mounts(m) && m !== 'notext';
/** Does this mode load the film into memory before arming the scrub? */
export const residentLoad = (m: FilmMode): boolean => m !== 'range';
/** Does this mode animate the reveal line's exit scale? */
export const scalesReveal = (m: FilmMode): boolean => m !== 'noscale';
