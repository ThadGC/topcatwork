/* ==========================================================================
   The visit trail — a verbatim port of the journey half of tcform.js
   (lines 7–64 and 125–130).

   WHAT IT IS. Every enquiry carries a short summary of what the visitor did
   on the site, which send.php digests server-side into "Their visit at a
   glance", "Pages they viewed" and "What they did, step by step". The
   privacy page describes it in exactly those words and promises three
   things this file has to keep true:

     - it lives in the visitor's own browser storage, on their device;
     - it expires by itself within a month;
     - it is transmitted only as part of an enquiry they chose to send.

   So: localStorage only, J_TTL of 30 days enforced on read, and nothing in
   here ever touches the network. No cookie, no beacon, no third party.

   ⚠️ THE SHAPE IS THE CONTRACT. send.php:197–260 reads `{started, ev:[…]}`
   where each event is `{t,k,v,at}` plus optional `s` and `p`. It sorts by
   `at`, treats a >30 min gap as a new visit, and gives a `Viewed` event the
   time to the next event of any kind. Rename a key and the client's enquiry
   email quietly loses a section.
   ========================================================================== */

/** tcform.js:7 */
export const J_KEY = 'tc_journey';
export const E_KEY = 'tc_estimate';

/** tcform.js:8 — the trail is capped, oldest first. */
export const J_MAX = 120;

/** tcform.js:9 — thirty days, in milliseconds. */
export const J_TTL = 30 * 24 * 3600 * 1000;

export interface JourneyEvent {
  /** 'ev' for a trail entry. 'est' is intercepted before it gets here. */
  t: string;
  /** Arrived | Viewed | Left | Clicked | Estimator material | Estimator stone */
  k?: string;
  v?: string;
  /** The section id a click happened in. */
  s?: string;
  /** The path a click happened on. */
  p?: string;
  /** Date.now(), stamped on push. */
  at?: number;
}

export interface Journey {
  started: number;
  ev: JourneyEvent[];
}

function storage(): Storage | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    /* Safari private mode throws on the property access itself. */
    return null;
  }
}

/**
 * tcform.js:20–26. A trail older than J_TTL is not migrated or trimmed, it
 * is abandoned and a fresh one started — which is what "expires by itself
 * within a month" means on the privacy page.
 */
export function jload(now: number = Date.now()): Journey {
  const ls = storage();
  if (ls) {
    try {
      const raw = ls.getItem(J_KEY);
      const j = raw ? (JSON.parse(raw) as Journey | null) : null;
      if (j && j.started && now - j.started < J_TTL && Array.isArray(j.ev)) {
        return j;
      }
    } catch {
      /* Corrupt JSON reads as no trail at all, exactly as the source does. */
    }
  }
  return { started: now, ev: [] };
}

/** tcform.js:27 — a quota error must never break a form. */
export function jsave(j: Journey): void {
  const ls = storage();
  if (!ls) return;
  try {
    ls.setItem(J_KEY, JSON.stringify(j));
  } catch {
    /* ignore */
  }
}

/** tcform.js:28–34 — stamp, append, then drop from the front past J_MAX. */
export function jpush(o: JourneyEvent, now: number = Date.now()): void {
  const j = jload(now);
  o.at = now;
  j.ev.push(o);
  if (j.ev.length > J_MAX) j.ev = j.ev.slice(j.ev.length - J_MAX);
  jsave(j);
}

/**
 * tcform.js:35–39. The estimator posts its state through the same queue but
 * it is not a trail event: `{t:'est',…}` replaces the single stored estimate
 * instead of being appended. send.php:298 renders it as "Their estimate".
 */
export function takeQ(o: unknown): void {
  if (!o || typeof o !== 'object') return;
  const ev = o as JourneyEvent;
  if (ev.t === 'est') {
    const ls = storage();
    if (!ls) return;
    try {
      ls.setItem(E_KEY, JSON.stringify(o));
    } catch {
      /* ignore */
    }
    return;
  }
  jpush(ev);
}

/** The queue site.js writes into (`window.__tcq.push`), typed. */
export interface TcQueue {
  push(o: unknown): void;
}

declare global {
  interface Window {
    __tcq?: unknown[] | TcQueue;
    TC_FORM_EXTRA?: (fd: FormData, form: HTMLFormElement) => void;
  }
}

/**
 * tcform.js:40–64. Runs once per page load:
 *
 *   1. on a brand-new trail, record where the visitor came from, with the
 *      query string appended when it carries utm_ parameters;
 *   2. record the page view;
 *   3. drain anything site.js queued before this ran, then replace the
 *      array with a live `push`;
 *   4. capture every click on an `a` or `button` (capture phase, so it still
 *      fires when the handler stops propagation), except inside the
 *      estimator's own controls, which would flood the trail;
 *   5. close the page honestly on `pagehide`, which is what lets send.php
 *      give the last page a real dwell time rather than dropping it.
 *
 * Returns a teardown so a React effect can undo it.
 */
export function journeyBoot(): () => void {
  const j = jload();
  if (!j.ev.length) {
    const src: JourneyEvent = {
      t: 'ev',
      k: 'Arrived',
      v: document.referrer || 'direct',
    };
    if (/utm_/.test(location.search)) src.v += ' ' + location.search.slice(0, 120);
    jpush(src);
  }
  jpush({ t: 'ev', k: 'Viewed', v: location.pathname });

  const q0 = window.__tcq;
  if (Array.isArray(q0)) for (let i = 0; i < q0.length; i++) takeQ(q0[i]);
  window.__tcq = { push: takeQ };

  const onClick = (e: MouseEvent) => {
    const target = e.target as Element | null;
    const a = target && target.closest ? target.closest('a,button') : null;
    if (!a) return;
    /* The estimator's rows, segments, uploader and tabs are excluded at
       source — they fire constantly and say nothing about intent. */
    if (a.closest('.est-row,.est-seg,.tc-up,#estTabs')) return;
    let tx = String(a.textContent || '')
      .replace(/\s+/g, ' ')
      .trim();
    if (!tx) tx = String(a.getAttribute('aria-label') || '').trim();
    if (tx.length < 2 || tx.length > 60) return;
    const sec = a.closest('section[id],footer,nav,header');
    jpush({
      t: 'ev',
      k: 'Clicked',
      v: tx,
      s: sec ? sec.id || sec.tagName.toLowerCase() : '',
      p: location.pathname,
    });
  };

  const onPageHide = () => {
    jpush({ t: 'ev', k: 'Left', v: location.pathname });
  };

  document.addEventListener('click', onClick, true);
  addEventListener('pagehide', onPageHide);

  return () => {
    document.removeEventListener('click', onClick, true);
    removeEventListener('pagehide', onPageHide);
  };
}
