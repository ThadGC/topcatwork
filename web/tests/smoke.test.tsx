import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import HomePage from '../src/app/page';

/**
 * Proves the harness end to end: vitest runs, the React plugin compiles TSX,
 * jsdom provides a DOM, and Testing Library can query it.
 */
describe('harness', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2);
  });

  it('renders a server component that returns plain JSX', () => {
    render(<HomePage />);
    // The home page's h1 is the hero headline, index.html:3668. It used to be
    // "Topcat Worktops" here because the page was a scaffold stub; the real
    // composition renders the client's own headline instead.
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      /Surfaces worth\s*building around/,
    );
  });
});

/**
 * The home page is the site's primary structured-data surface — the entity
 * every other page's graph points at — and the only page whose gold gradients
 * have nowhere else to come from. Both used to be missing here while all 177
 * other pages had them, which is exactly the shape of bug a per-page eyeball
 * never catches.
 */
describe('the home page head-of-graph', () => {
  const SOURCE = readFileSync(resolve(__dirname, '../../index.html'), 'utf8');

  it('emits index.html’s JSON-LD block verbatim', () => {
    const raw = /<script type="application\/ld\+json">(.*?)<\/script>/s.exec(
      SOURCE,
    )![1];
    const { container } = render(<HomePage />);
    const scripts = container.querySelectorAll(
      'script[type="application/ld+json"]',
    );
    expect(scripts).toHaveLength(1);

    const emitted = JSON.parse(scripts[0].textContent!);
    expect(emitted).toEqual(JSON.parse(raw));
    // Spot-check the fields that make it a local-business result, so a
    // reshaped extractor cannot quietly drop them.
    expect(emitted['@type']).toBe('HomeAndConstructionBusiness');
    expect(emitted.telephone).toBe('+448000982812');
    expect(emitted.areaServed).toHaveLength(8);
    expect(emitted.address.addressLocality).toBe('St Albans');
    expect(emitted.openingHoursSpecification[0].dayOfWeek).toHaveLength(7);
    expect(emitted.makesOffer).not.toHaveLength(0);
  });

  it('defines every gradient the page paints with', () => {
    const { container } = render(<HomePage />);
    const defs = container.querySelector('svg.tc-defs');
    expect(defs).toBeTruthy();
    // Full defs here, not the content pages' cut-down pair: `.wbtn svg`
    // strokes with url(#tcGoldSolid).
    expect(defs!.querySelector('#tcGold')).toBeTruthy();
    expect(defs!.querySelector('#tcGoldSolid')).toBeTruthy();
    // In `#hero`, where the source puts it.
    expect(container.querySelector('#hero > svg.tc-defs')).toBeTruthy();

    // Nothing paints with an id the page never defines.
    for (const ref of container.innerHTML.matchAll(/url\(#([\w-]+)\)/g)) {
      expect(container.querySelector(`#${ref[1]}`), ref[1]).toBeTruthy();
    }
  });
});
