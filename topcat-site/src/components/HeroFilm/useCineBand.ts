'use client';

/**
 * HERO FILM — band + capability detection.
 *
 * The legacy module kept two live `MediaQueryList`s and re-read them in
 * `readHeroBand()` on every `sync()`. Here they are a `useSyncExternalStore`,
 * which gives the same liveness plus a defined server snapshot — mandatory
 * under `output: 'export'`, where the HTML is generated with no viewport at
 * all.
 *
 * The server snapshot is the wide band with the film OFF. That is the correct
 * pre-hydration state for two independent reasons: it is the still-hero
 * fallback (which is what a no-JS visitor must get), and the real gate is the
 * inline boot script in ./HeroFilmBoot.tsx, which sets `html.cine-on` during
 * HTML parse so the CSS is already right before React ever runs.
 */

import { useSyncExternalStore } from 'react';
import type { Band } from './lib/timeline';

const WIDE = '(min-width:1121px)';
const NARROW = '(max-width:1120px)';
const PHONE = '(max-width:720px)';
const REDUCE = '(prefers-reduced-motion: reduce)';

export interface CineEnv extends Band {
  /** prefers-reduced-motion: reduce */
  reduce: boolean;
}

const SERVER_ENV: CineEnv = {
  wide: true,
  narrow: false,
  phone: false,
  tablet: false,
  mode: 'wide',
  reduce: false,
};

function readEnv(): CineEnv {
  const wide = matchMedia(WIDE).matches;
  const narrow = matchMedia(NARROW).matches;
  const phone = matchMedia(PHONE).matches;
  return {
    wide,
    narrow,
    phone,
    tablet: narrow && !phone,
    // `readHeroBand()`, site.js 3277-3279.
    mode: wide ? 'wide' : narrow ? 'nr' : 'off',
    reduce: matchMedia(REDUCE).matches,
  };
}

/**
 * Cached so `getSnapshot` is referentially stable between changes —
 * `useSyncExternalStore` compares by identity and would otherwise loop.
 *
 * Dropped once nobody is subscribed. Between the last unsubscribe and the next
 * subscribe there is no `change` listener attached, so anything cached over
 * that gap is unverifiable — and a stale band on remount would start the film
 * against the wrong encode and the wrong beat timings.
 */
let cached: CineEnv | null = null;
let subscribers = 0;

function snapshot(): CineEnv {
  if (cached) return cached;
  cached = readEnv();
  return cached;
}

function subscribe(onChange: () => void): () => void {
  if (typeof matchMedia !== 'function') return () => {};
  subscribers++;
  const lists = [WIDE, NARROW, PHONE, REDUCE].map((q) => matchMedia(q));
  const handler = () => {
    const next = readEnv();
    const prev = cached;
    if (
      prev &&
      prev.wide === next.wide &&
      prev.narrow === next.narrow &&
      prev.phone === next.phone &&
      prev.reduce === next.reduce
    ) {
      return;
    }
    cached = next;
    onChange();
  };
  for (const l of lists) l.addEventListener('change', handler);
  return () => {
    for (const l of lists) l.removeEventListener('change', handler);
    if (--subscribers <= 0) {
      subscribers = 0;
      cached = null;
    }
  };
}

export function useCineBand(): CineEnv {
  return useSyncExternalStore(subscribe, snapshot, () => SERVER_ENV);
}

/**
 * Can this browser run the film at all?
 *
 * Same three gates as the legacy head script (index.html 3456-3466): a
 * `matchMedia` implementation, no reduced-motion preference, and an MP4 the
 * element admits it can play. `canPlayType` returns `''`, `'maybe'` or
 * `'probably'`; the legacy test is truthiness, so `'maybe'` counts.
 */
export function filmSupported(reduce: boolean): boolean {
  if (typeof window === 'undefined') return false;
  if (typeof window.matchMedia !== 'function') return false;
  if (reduce) return false;
  try {
    return !!document.createElement('video').canPlayType('video/mp4');
  } catch {
    return false;
  }
}
