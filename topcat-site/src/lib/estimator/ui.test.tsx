/**
 * The panel, driven the way a visitor drives it.
 *
 * The engine has its own vector table next door; this file only asserts that
 * the things that were dead in the shell — the tabs, the chips, "+ Island",
 * "+ Add another piece", the linear-metre box — actually move the numbers, and
 * that the ids the ported CSS hangs on all survive.
 */
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import Estimator from '@/components/sections/Estimator';
import { LIM } from './constants';

/** Every id site.js:3681-3697 looks up, plus the ones its generated markup
 *  mints. Losing any one of them silently unstyles part of the panel. */
const IDS = [
  'estimator', 'estPanel', 'estTabs', 'estStoneBtn', 'estSwatch', 'estStoneName', 'estStoneSup',
  'estCalc', 'estQuick', 'estIsland', 'estRows', 'estAdd', 'estBoard', 'estPoa', 'estPoaTitle',
  'estPoaLead', 'estPreview', 'estStamp', 'estStats', 'stSlabs', 'stSlabsL', 'stArea', 'stJoins',
  'stJoinsL', 'estJnote', 'estOutK', 'estPrice', 'estPriceSR', 'estMeta', 'estAdds', 'estInc',
  'estCta', 'exWaterfall', 'exSplash', 'exSill', 'exRemoval', 'exEdge', 'estEdgePanel',
  'estEdgeBtn', 'estEdgeGlyph', 'estEdgeTxt', 'estLmWrap', 'estLm', 'estLmOut', 'estModal',
  'estModalTitle', 'estModalSub', 'estModalX', 'estModalBody',
];

const $ = (id: string) => document.getElementById(id)!;
const chip = (label: string) => screen.getByRole('button', { name: label });

/**
 * jsdom's own `requestAnimationFrame` is wall-clock driven and will not run
 * inside a macrotask loop, so the price readout — which eases toward its
 * target at 0.14 a frame, site.js:3813-3819 — never arrives. Redefine a frame
 * as a plain macrotask for the duration of the test.
 */
const realRaf = globalThis.requestAnimationFrame;
const realCaf = globalThis.cancelAnimationFrame;

beforeEach(() => {
  globalThis.requestAnimationFrame = ((cb: FrameRequestCallback) =>
    setTimeout(() => cb(0), 0) as unknown as number) as typeof requestAnimationFrame;
  globalThis.cancelAnimationFrame = ((id: number) =>
    clearTimeout(id as unknown as ReturnType<typeof setTimeout>)) as typeof cancelAnimationFrame;
});

afterEach(() => {
  globalThis.requestAnimationFrame = realRaf;
  globalThis.cancelAnimationFrame = realCaf;
});

/**
 * Drain everything pending until the panel is at rest.
 *
 * Three passes, because three clocks are stacked here. Pass one burns 200 ms
 * of WALL time for the 140 ms recompute debounce (site.js:3967). React then
 * flushes that re-render and its effects only as `act()` EXITS, so the frame
 * the price effect requests is not yet queued inside that pass — passes two
 * and three drain the ~55 frames the easing needs to land within a pound of
 * any target in the bracket table.
 */
async function settle() {
  for (let pass = 0; pass < 3; pass++) {
    await act(async () => {
      const until = Date.now() + (pass === 0 ? 200 : 0);
      while (Date.now() < until) await new Promise((r) => setTimeout(r, 5));
      for (let i = 0; i < 80; i++) await new Promise((r) => setTimeout(r, 0));
    });
  }
}

describe('the panel wakes up', () => {
  it('keeps every id the ported CSS depends on', async () => {
    render(<Estimator />);
    await settle();
    for (const id of IDS) expect(document.getElementById(id), id).not.toBeNull();
  });

  it('opens on one row, quartz, and its own landing stone', async () => {
    render(<Estimator />);
    await settle();
    expect($('estRows').querySelectorAll('.est-row')).toHaveLength(1);
    expect($('estStoneName').textContent).toBe('Azul Shimmer');
    expect($('estMeta').textContent).toBe('Azul Shimmer · 1 piece · 1 slab');
    expect($('stSlabs').textContent).toBe('1');
    expect($('estPrice').textContent).toBe('£2,000 – £2,500');
  });
});

describe('+ Island', () => {
  it('presses in, and switches the bracket COLUMN rather than adding a slab', async () => {
    render(<Estimator />);
    await settle();
    fireEvent.click(chip('U-shape'));
    await settle();
    expect($('estPrice').textContent).toBe('£3,000 – £3,600');
    expect($('estIsland')).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click($('estIsland'));
    await settle();
    expect($('estIsland')).toHaveAttribute('aria-pressed', 'true');
    // The brief's "£3,498 – £3,957" is frame 11 on the way to this pair.
    expect($('estPrice').textContent).toBe('£3,850 – £4,300');
    expect($('estMeta').textContent).toBe('Azul Shimmer · 4 pieces · 3 slabs');
  });

  it('toggles the island row back out again', async () => {
    render(<Estimator />);
    await settle();
    fireEvent.click($('estIsland'));
    await settle();
    expect($('estRows').querySelectorAll('.est-row')).toHaveLength(2);
    fireEvent.click($('estIsland'));
    await settle();
    expect($('estRows').querySelectorAll('.est-row')).toHaveLength(1);
    expect($('estIsland')).toHaveAttribute('aria-pressed', 'false');
  });
});

describe('+ Add another piece', () => {
  it('grows to the ten-row cap and then stops', async () => {
    render(<Estimator />);
    await settle();
    for (let i = 0; i < 20; i++) fireEvent.click($('estAdd'));
    await settle();
    expect($('estRows').querySelectorAll('.est-row')).toHaveLength(LIM.rows);
    expect($('estAdd')).toBeDisabled();
  });

  it('removes a row again', async () => {
    render(<Estimator />);
    await settle();
    fireEvent.click($('estAdd'));
    await settle();
    expect($('estRows').querySelectorAll('.est-row')).toHaveLength(2);
    fireEvent.click(screen.getByRole('button', { name: 'Remove piece B' }));
    await settle();
    expect($('estRows').querySelectorAll('.est-row')).toHaveLength(1);
  });
});

describe('the material tabs', () => {
  it('Marble & Quartzite goes to POA with no price', async () => {
    render(<Estimator />);
    await settle();
    fireEvent.click(chip('Marble & Quartzite'));
    await settle();
    expect($('estPrice').textContent).toBe('Price on application');
    expect($('estPrice').className).toContain('txt');
    expect($('estPoa').hasAttribute('hidden')).toBe(false);
    expect($('estCalc').hasAttribute('hidden')).toBe(true);
    expect($('estStats').hasAttribute('hidden')).toBe(true);
    expect($('estCta').hasAttribute('hidden')).toBe(true);
    expect($('estPoaTitle').innerHTML).toBe('Marble and quartzite are priced <em>by hand</em>');
  });

  it('Porcelain is POA too, and hides the stone picker it has no catalogue for', async () => {
    render(<Estimator />);
    await settle();
    fireEvent.click(chip('Porcelain'));
    await settle();
    expect($('estPrice').textContent).toBe('Price on application');
    expect($('estStoneBtn').hasAttribute('hidden')).toBe(true);
    expect($('estMeta').textContent).toBe('Porcelain and sintered stone');
  });

  it('coming back to Quartz prices again', async () => {
    render(<Estimator />);
    await settle();
    fireEvent.click(chip('Granite'));
    await settle();
    expect($('estPrice').textContent).toBe('Price on application');
    fireEvent.click(chip('Quartz'));
    await settle();
    expect($('estPrice').textContent).toBe('£2,000 – £2,500');
    expect($('estPoa').hasAttribute('hidden')).toBe(true);
  });
});

describe('typing sizes', () => {
  it('recalculates after the 140 ms debounce, and clamps on blur', async () => {
    render(<Estimator />);
    await settle();
    const len = screen.getByLabelText('Piece A length in millimetres') as HTMLInputElement;

    fireEvent.change(len, { target: { value: '6000' } });
    await settle();
    // 6000 mm across a 3160 mm usable quartz slab is one joint.
    expect($('stJoins').textContent).toBe('1');
    expect($('stJoinsL').textContent).toBe('joint');
    expect($('estJnote').hasAttribute('hidden')).toBe(false);

    fireEvent.change(len, { target: { value: '99999' } });
    fireEvent.blur(len);
    await settle();
    expect(len.value).toBe(String(LIM.len[1]));
  });

  it('clamps an out-of-range width up from below the floor', async () => {
    render(<Estimator />);
    await settle();
    const wid = screen.getByLabelText('Piece A width in millimetres') as HTMLInputElement;
    fireEvent.change(wid, { target: { value: '5' } });
    fireEvent.blur(wid);
    await settle();
    expect(wid.value).toBe(String(LIM.wid[0]));
  });
});

describe('the extras', () => {
  it('removal adds a flat £200 to both ends', async () => {
    render(<Estimator />);
    await settle();
    fireEvent.click($('exRemoval'));
    await settle();
    expect($('estPrice').textContent).toBe('£2,200 – £2,700');
    expect($('estAdds').textContent).toBe('Includes taking your old worktop away.');
    expect($('estAdds').hasAttribute('hidden')).toBe(false);
  });

  it('detailed edging opens its picker, then its metres box, then charges', async () => {
    render(<Estimator />);
    await settle();
    expect($('estEdgePanel').hasAttribute('hidden')).toBe(true);

    fireEvent.click($('exEdge'));
    await settle();
    expect($('estEdgePanel').hasAttribute('hidden')).toBe(false);
    expect($('estLmWrap').hasAttribute('hidden')).toBe(true);
    // No profile chosen yet, so nothing is charged.
    expect($('estPrice').textContent).toBe('£2,000 – £2,500');

    fireEvent.click($('estEdgeBtn'));
    await waitFor(() => expect($('estModalBody').querySelectorAll('.ep-tile').length).toBe(18));
    fireEvent.click($('estModalBody').querySelectorAll('.ep-tile')[0]);
    await settle();
    expect($('estEdgeTxt').textContent).toContain('Eased');
    expect($('estLmWrap').hasAttribute('hidden')).toBe(false);

    fireEvent.change($('estLm'), { target: { value: '6' } });
    await settle();
    expect($('estAdds').textContent).toBe('Includes 6 m of eased edging.');
    expect($('estPrice').textContent).toBe('£2,900 – £4,300');
  });
});

describe('the stone picker', () => {
  it('opens, filters and changes the stone', async () => {
    render(<Estimator />);
    await settle();
    expect($('estModal').hasAttribute('hidden')).toBe(true);

    fireEvent.click($('estStoneBtn'));
    await waitFor(() => expect($('estModal').hasAttribute('hidden')).toBe(false));
    expect($('estModalTitle').textContent).toBe('Choose your stone');

    fireEvent.change($('estStoneSearch'), { target: { value: 'marquina' } });
    await settle();
    const tiles = $('estModalBody').querySelectorAll('.sp-tile');
    expect(tiles.length).toBeGreaterThan(0);
    expect(tiles.length).toBeLessThan(67);

    fireEvent.click(tiles[0]);
    await settle();
    expect($('estStoneName').textContent).toBe('Marquina');
    expect($('estMeta').textContent).toContain('Marquina');
  });
});
