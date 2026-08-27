'use client';

/* ==========================================================================
   `<ScrollMemory/>` — remembers where you were, and puts you back there.

   Mounted once in the root layout, so it covers every page on the site. See
   lib/scrollMemory.ts for why the browser cannot be trusted with this here.

   It only ever acts on a FULL-DOCUMENT `back_forward` navigation. A bfcache
   restore (`pageshow` with `persisted`) already has the live DOM and the live
   scroll offset and is left completely alone; a forward navigation is a new
   page and starts at the top like any other.
   ========================================================================== */

import { useEffect } from 'react';

import {
  isBackForward,
  posKey,
  readPosition,
  settled,
  writePosition,
} from '@/lib/scrollMemory';

/** How long to keep trying before giving up. The home page has to wait for the
 *  film to lock, which is a network-dependent moment; everything else settles
 *  in a frame or two. */
const GIVE_UP_MS = 6000;
/** Keep re-asserting the offset for this long after landing on it, so a late
 *  layout shift underneath does not quietly drag the page somewhere else. */
const HOLD_MS = 900;

export default function ScrollMemory() {
  useEffect(() => {
    const key = posKey(location);

    /* Take the job off the browser. Chrome's own restoration fights the
       runway collapse and loses — see lib/scrollMemory.ts. */
    const previousMode = history.scrollRestoration;
    try {
      history.scrollRestoration = 'manual';
    } catch {
      /* not supported: our restore still runs, the browser's may also fire */
    }

    /* ── remember ──────────────────────────────────────────────────────── */
    const save = () => {
      writePosition(key, {
        y: Math.round(window.scrollY),
        cine: document.documentElement.classList.contains('cine-done'),
      });
    };
    /* `pagehide` fires for a real unload AND for a bfcache freeze, which is
       every way this page can be left. `visibilitychange` is the backstop for
       the iOS case where `pagehide` can be skipped. */
    addEventListener('pagehide', save);
    const onHide = () => {
      if (document.visibilityState === 'hidden') save();
    };
    addEventListener('visibilitychange', onHide);

    /* ── restore ───────────────────────────────────────────────────────── */
    let raf = 0;
    let landedAt = 0;
    const started = performance.now();
    const saved = isBackForward() ? readPosition(key) : null;

    if (saved && saved.y > 0) {
      const step = () => {
        raf = 0;
        const now = performance.now();
        if (now - started > GIVE_UP_MS) return;

        if (!settled(saved.y)) {
          raf = requestAnimationFrame(step);
          return;
        }
        /* Land on it, then keep landing on it: hydration, webfonts and the
           film's own remeasure all move the page under us for a few hundred
           milliseconds after it first looks ready. */
        if (Math.abs(window.scrollY - saved.y) > 2) {
          window.scrollTo({ top: saved.y, behavior: 'instant' });
          landedAt = landedAt || now;
        } else if (!landedAt) {
          landedAt = now;
        }
        if (now - landedAt < HOLD_MS) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }

    return () => {
      removeEventListener('pagehide', save);
      removeEventListener('visibilitychange', onHide);
      if (raf) cancelAnimationFrame(raf);
      try {
        history.scrollRestoration = previousMode;
      } catch {
        /* ignore */
      }
    };
  }, []);

  return null;
}
