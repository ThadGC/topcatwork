/**
 * The deferred still — promotion.
 *
 * The still hero ships with `data-src` and no `src`, because `cine-on` holds it
 * at opacity 0 for the whole session on any device that runs the film, and it
 * was still costing 151,604 bytes at `fetchpriority="high"`. These tests pin
 * the promotion contract: the three callers that turn it back into a real image
 * must all get the same result, and calling twice must not undo it.
 */

import { describe, it, expect } from 'vitest';

import { promoteDeferredImage, promoteDeferredImages } from './deferredImg';

const SRC = '/assets/site/hero-night-2752.webp';
const SET =
  '/assets/site/hero-night-1400.webp 1400w, /assets/site/hero-night-2752.webp 2752w';

function deferred(): HTMLImageElement {
  const img = document.createElement('img');
  img.setAttribute('data-src', SRC);
  img.setAttribute('data-srcset', SET);
  img.setAttribute('sizes', '(max-width:720px) 1000px, 1739px');
  return img;
}

describe('promoteDeferredImage', () => {
  it('moves data-src and data-srcset onto the real attributes', () => {
    const img = deferred();
    expect(promoteDeferredImage(img)).toBe(true);
    expect(img.getAttribute('src')).toBe(SRC);
    expect(img.getAttribute('srcset')).toBe(SET);
  });

  it('clears the data- attributes so a second call is a no-op', () => {
    const img = deferred();
    promoteDeferredImage(img);
    expect(img.hasAttribute('data-src')).toBe(false);
    expect(promoteDeferredImage(img)).toBe(false);
    expect(img.getAttribute('src')).toBe(SRC);
  });

  it('leaves sizes alone — it never started a fetch on its own', () => {
    const img = deferred();
    promoteDeferredImage(img);
    expect(img.getAttribute('sizes')).toBe('(max-width:720px) 1000px, 1739px');
  });

  it('is safe on a null element and on an image that was never deferred', () => {
    expect(promoteDeferredImage(null)).toBe(false);
    expect(promoteDeferredImage(document.createElement('img'))).toBe(false);
  });

  it('does not invent a srcset when there was none', () => {
    const img = document.createElement('img');
    img.setAttribute('data-src', SRC);
    promoteDeferredImage(img);
    expect(img.hasAttribute('srcset')).toBe(false);
    expect(img.getAttribute('src')).toBe(SRC);
  });
});

describe('promoteDeferredImages', () => {
  it('promotes every deferred image under a root and counts them', () => {
    const root = document.createElement('div');
    root.append(deferred(), deferred(), document.createElement('img'));
    expect(promoteDeferredImages(root)).toBe(2);
    expect(root.querySelectorAll('img[data-src]')).toHaveLength(0);
    expect(root.querySelectorAll('img[src]')).toHaveLength(2);
  });

  it('is safe on a null root', () => {
    expect(promoteDeferredImages(null)).toBe(0);
  });
});
