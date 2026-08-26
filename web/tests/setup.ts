import '@testing-library/jest-dom/vitest';

/**
 * jsdom implements no `matchMedia`, and this port leans on it hard: the
 * gallery, services, process and FAQ sections all branch on a media query in
 * an effect, and so do useCursorGlow / useReviewDeck / the cine film. Without
 * a stub, mounting any page throws before a single assertion runs.
 *
 * The stub reports "does not match" for everything, which is the desktop
 * reading for every `max-width` query in the codebase. A test that needs a
 * different answer should override `window.matchMedia` itself.
 */
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

/**
 * jsdom implements no `IntersectionObserver` either, and the `.rise` reveal
 * that uses it is on essentially every section of every page. The stub
 * records nothing and fires nothing: elements simply never gain `.in`, which
 * is the pre-scroll state and the right default for a unit test.
 *
 * A test that wants to assert on the revealed state should replace this with
 * its own fake and invoke the callback by hand.
 */
if (typeof globalThis.IntersectionObserver === 'undefined') {
  class NoopIntersectionObserver {
    readonly root = null;
    readonly rootMargin = '';
    readonly scrollMargin = '';
    readonly thresholds: readonly number[] = [];
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
    takeRecords(): IntersectionObserverEntry[] {
      return [];
    }
  }

  const ctor = NoopIntersectionObserver as unknown as typeof IntersectionObserver;
  globalThis.IntersectionObserver = ctor;
  if (typeof window !== 'undefined') window.IntersectionObserver = ctor;
}
