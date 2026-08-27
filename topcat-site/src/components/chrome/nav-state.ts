'use client';

import { useSyncExternalStore } from 'react';

/**
 * The mobile nav's open/closed state, held in a module-level store rather
 * than in React context.
 *
 * ---------------------------------------------------------------------------
 * WHY NOT CONTEXT
 * ---------------------------------------------------------------------------
 * Four separate components read this one boolean — the burger inside
 * <SiteHeader>, the sheet in <MobileNav>, and (through `html.nav-open`) both
 * `.mbar` and the FABs. A context would force every one of them to sit under
 * a provider, which in turn forces every route layout to remember to add one.
 * There is exactly one nav sheet per document, so a module store is both
 * simpler and impossible to mis-wire: `<SiteHeader />` and `<MobileNav />`
 * can be dropped into any layout, in any order, with no props.
 *
 * `useSyncExternalStore` is the supported way to read an external store from
 * React, and it gives the correct server snapshot for free — the exported
 * HTML always renders the closed state, which is what the legacy HTML ships.
 */

export interface NavState {
  readonly navOpen: boolean;
  /** id of the one open `.mn-sub`, or null. The sheet is an accordion. */
  readonly openSub: string | null;
}

const CLOSED: NavState = { navOpen: false, openSub: null };

let state: NavState = CLOSED;
const listeners = new Set<() => void>();

function emit(next: NavState): void {
  if (next.navOpen === state.navOpen && next.openSub === state.openSub) return;
  state = next;
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): NavState {
  return state;
}

function getServerSnapshot(): NavState {
  return CLOSED;
}

export function useNavState(): NavState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * `html.nav-open` is written here rather than from an effect because the
 * source writes it synchronously inside the click handler, and because the
 * class has to land on an element React does not own.
 *
 * `resetSubs` reproduces a real difference between the two source scripts:
 *
 *   site.js:4357 — the six rich pages
 *     A SECOND click listener on the burger, registered after the first:
 *       burger.addEventListener('click', () => {
 *         if (!html.classList.contains('nav-open')) closeSubs(); });
 *     By the time it runs the first listener has already toggled the class,
 *     so `!nav-open` reads as "we just closed". Sub-panels therefore reset on
 *     a burger close and ONLY on a burger close — tapping a link or pressing
 *     Escape leaves the open panel open for the next time the sheet opens.
 *
 *   the inline script — the 171 lite pages
 *     closeSubs is folded into setOpen itself (`function o(v){…if(!v)c();}`),
 *     so EVERY close resets, link taps and Escape included.
 *
 * Both are reproduced rather than picked between.
 */
export function setNavOpen(open: boolean, resetSubs = false): void {
  if (typeof document !== 'undefined') {
    document.documentElement.classList.toggle('nav-open', open);
  }
  emit({
    navOpen: open,
    openSub: !open && resetSubs ? null : state.openSub,
  });
}

/** closeSubs() runs first in the source, so opening one panel closes the other. */
export function toggleSub(id: string): void {
  emit({ navOpen: state.navOpen, openSub: state.openSub === id ? null : id });
}

/** Unmount safety: never leave the document scroll-locked behind a stale class. */
export function releaseNav(): void {
  if (typeof document !== 'undefined') {
    document.documentElement.classList.remove('nav-open');
  }
  emit(CLOSED);
}
