import { render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useReveal } from '@/hooks/useReveal';

/**
 * The reveal hook is the one piece of behaviour this slice of the port owns
 * outright, and it is load-bearing in a way that is easy to miss: `.rise`
 * starts at `opacity:0`. If the hook stops adding `.in`, the page renders
 * blank and every other test still passes.
 */

interface Fired {
  target: Element;
  isIntersecting: boolean;
}

class FakeIO implements IntersectionObserver {
  readonly root = null;
  readonly rootMargin = '';
  /* Added by the DOM lib TypeScript 7 ships; `implements` requires it. */
  readonly scrollMargin = '';
  readonly thresholds: readonly number[] = [];
  static instances: FakeIO[] = [];
  observed: Element[] = [];
  unobserved: Element[] = [];
  disconnected = false;
  constructor(
    public cb: IntersectionObserverCallback,
    public options?: IntersectionObserverInit,
  ) {
    FakeIO.instances.push(this);
  }
  observe(el: Element) {
    this.observed.push(el);
  }
  unobserve(el: Element) {
    this.unobserved.push(el);
    this.observed = this.observed.filter((n) => n !== el);
  }
  disconnect() {
    this.disconnected = true;
    this.observed = [];
  }
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
  fire(entries: Fired[]) {
    this.cb(entries as unknown as IntersectionObserverEntry[], this);
  }
}

function Subject({ extra = false }: { extra?: boolean }) {
  const ref = useReveal<HTMLElement>();
  return (
    <section ref={ref}>
      <h2 className="rise" data-testid="a">
        a
      </h2>
      <p className="rise" data-testid="b">
        b
      </p>
      <p data-testid="plain">not a rise</p>
      {extra ? (
        <p className="rise" data-testid="late">
          late
        </p>
      ) : null}
    </section>
  );
}

beforeEach(() => {
  FakeIO.instances = [];
  vi.stubGlobal('IntersectionObserver', FakeIO);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('useReveal', () => {
  it('observes every .rise in its subtree at threshold 0.25', () => {
    const { getByTestId } = render(<Subject />);
    const io = FakeIO.instances[0];
    expect(io.options?.threshold).toBe(0.25);
    expect(io.observed).toEqual([getByTestId('a'), getByTestId('b')]);
    expect(io.observed).not.toContain(getByTestId('plain'));
  });

  it('adds .in on intersection and unobserves — a one-way door', () => {
    const { getByTestId } = render(<Subject />);
    const io = FakeIO.instances[0];
    const a = getByTestId('a');

    io.fire([{ target: a, isIntersecting: true }]);
    expect(a).toHaveClass('in');
    expect(io.unobserved).toContain(a);

    // The source never removes `.in`; scrolling back must not undo a reveal.
    io.fire([{ target: a, isIntersecting: false }]);
    expect(a).toHaveClass('in');
  });

  it('ignores entries that are not intersecting', () => {
    const { getByTestId } = render(<Subject />);
    const io = FakeIO.instances[0];
    const b = getByTestId('b');
    io.fire([{ target: b, isIntersecting: false }]);
    expect(b).not.toHaveClass('in');
    expect(io.unobserved).not.toContain(b);
  });

  it('observes the root itself when the root carries .rise', () => {
    function RootRise() {
      const ref = useReveal<HTMLElement>();
      return <aside className="rise" data-testid="root" ref={ref} />;
    }
    const { getByTestId } = render(<RootRise />);
    expect(FakeIO.instances[0].observed).toEqual([getByTestId('root')]);
  });

  it('picks up .rise nodes React commits after mount', async () => {
    const { rerender, getByTestId } = render(<Subject />);
    rerender(<Subject extra />);
    // The MutationObserver sweep is async by design (microtask), so wait.
    await waitFor(() =>
      expect(FakeIO.instances[0].observed).toContain(getByTestId('late')),
    );
  });

  it('does not re-arm a node that has already revealed', async () => {
    const { rerender, getByTestId } = render(<Subject />);
    const io = FakeIO.instances[0];
    const a = getByTestId('a');
    io.fire([{ target: a, isIntersecting: true }]);
    expect(io.observed).not.toContain(a);

    rerender(<Subject extra />);
    await waitFor(() =>
      expect(io.observed).toContain(getByTestId('late')),
    );
    expect(io.observed).not.toContain(a);
  });

  it('disconnects on unmount', () => {
    const { unmount } = render(<Subject />);
    unmount();
    expect(FakeIO.instances[0].disconnected).toBe(true);
  });

  it('fails OPEN when IntersectionObserver is missing', () => {
    // Without this branch an old browser would show a page of invisible
    // sections — worse than showing them all at once with no animation.
    vi.stubGlobal('IntersectionObserver', undefined);
    const { getByTestId } = render(<Subject />);
    expect(getByTestId('a')).toHaveClass('in');
    expect(getByTestId('b')).toHaveClass('in');
    expect(getByTestId('plain')).not.toHaveClass('in');
  });
});
