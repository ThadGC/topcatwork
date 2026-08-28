/* ==========================================================================
   BACK GOES BACK TO WHERE YOU WERE.

   The client, 27 Aug: "when I open that individual stone and click the back
   button, it doesn't take me back to the stone section... It takes me all the
   way back to the beginning of the video, which it should not do. So the back
   button should only go back to the previous part that I was viewing."

   ── why the browser does not do this on its own ────────────────────────────
   Every navigation on this site is a FULL page load. The stone wheel opens a
   slab with `location.href` (site.js:1058, ported in useStoneWheel), and the
   collection tiles and the nav are plain `<a href>`. So going back is a fresh
   document, and Chrome's automatic restoration has to guess a scroll offset
   for a page whose height is still moving: the home page's hero film was an
   800vh runway at parse time that grew again as the sections below hydrated
   and then COLLAPSED to one viewport the moment the film locked. ⛔ The film
   was stripped out 28 Aug 2026, but the page still grows as it hydrates, and
   whatever replaces the film will have its own settle point — see `settled()`.
   Measured on the build that still had it, back from a stone page: Chrome restored
   16408 at t=241ms and had lost it again by t=522ms, and on the next run never
   restored at all. The old build's own restoration works only because its
   height happens to settle sooner. Racy either way.

   So this module takes the job off the browser — `history.scrollRestoration`
   goes to `manual` — and does it deterministically:

     1. `remember()` writes the offset on `pagehide`, together with whether the
        intro had already finished.
     2. On the way back, `takeRestore()` reports the saved offset for exactly
        this URL, and only for a `back_forward` navigation.
     3. Nothing is restored until the page has stopped changing height.

   ⛔ WHAT WENT WITH THE FILM, AND HAS TO COME BACK WITH IT. Restoring the
   offset was only half the job. The film also saved whether the intro had
   already finished, and its boot script read that flag at PARSE time to put
   the document straight into its end state — otherwise pressing Back replayed
   the intro from frame 0 under the visitor. And `settled()` had to wait for
   the runway's collapse, because that collapse subtracted from `scrollY` in
   the same frame; restoring before it meant the subtraction ate the offset.
   Both halves are needed again by whatever pins the hero next.
   ========================================================================== */

/** sessionStorage prefix. The boot script builds the same key inline — if this
 *  changes, change it there too (it is interpolated, so it cannot drift). */
export const POS_KEY = 'tc:pos:';

export interface SavedPosition {
  /** `window.scrollY` when the page was left. */
  y: number;
}

/** The URL this position belongs to. Hash excluded: `/#hero` and `/` are the
 *  same page and the visitor's offset is the same fact either way. */
export function posKey(loc: { pathname: string; search: string }): string {
  return POS_KEY + loc.pathname + loc.search;
}

/** Did the visitor arrive here with Back or Forward? */
export function isBackForward(): boolean {
  try {
    const nav = performance.getEntriesByType('navigation')[0] as
      | PerformanceNavigationTiming
      | undefined;
    return nav?.type === 'back_forward';
  } catch {
    return false;
  }
}

export function readPosition(key: string): SavedPosition | null {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const v = JSON.parse(raw) as Partial<SavedPosition>;
    if (typeof v?.y !== 'number' || !isFinite(v.y)) return null;
    return { y: Math.max(0, Math.round(v.y)) };
  } catch {
    return null;
  }
}

export function writePosition(key: string, pos: SavedPosition): void {
  try {
    sessionStorage.setItem(key, JSON.stringify(pos));
  } catch {
    /* private mode, quota, a browser with storage off — never block a nav */
  }
}

export function clearPosition(key: string): void {
  try {
    sessionStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

/**
 * Is the page's height finally settled enough to trust an offset?
 *
 * The document has to be tall enough to hold the offset at all, or the browser
 * clamps the scroll and the offset is lost silently.
 *
 * ⛔ THERE WAS A SECOND GATE AND IT WAS LOAD-BEARING: while the hero film was
 * running nothing counted as settled until it had locked, because the lock
 * collapsed the runway and subtracted the same distance from `scrollY` in the
 * same frame. Restore before that and the subtraction ate the offset. The film
 * was stripped out 28 Aug 2026; anything that pins the hero again needs its own
 * version of that gate here.
 */
export function settled(y: number): boolean {
  const root = document.documentElement;
  return root.scrollHeight - window.innerHeight >= y - 2;
}
