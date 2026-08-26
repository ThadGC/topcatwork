'use client';

import { useEffect, type RefObject } from 'react';

/**
 * The cursor glow on `.glow-card` — ported from assets/site.js:1983-2011
 * (`GLOW_EASE`, `glowItems`, `attachGlow`, `glowTick`).
 *
 * Every card on the home page — services, reviews, process tiles, gallery
 * doors, the estimator panels, the why mosaic — carries `.glow-card`, whose
 * `::before`/`::after` paint a radial highlight at `--gx`/`--gy` with opacity
 * `--ga`. Those four custom properties are written from JS, never by a class,
 * because they change with the pointer.
 *
 * WHY ONE SHARED RAF LOOP
 * -----------------------
 * The source pushes every card into a single `glowItems` array and runs ONE
 * `requestAnimationFrame` loop over all of them. On the home page that is
 * upwards of 40 cards; 40 independent rAF loops would each pay the callback
 * and layout-read overhead separately. The loop is also what makes the glow
 * ease rather than snap — position lerps at GLOW_EASE (0.1) and opacity at
 * 0.12 per frame toward the pointer target.
 *
 * The early-out `if (g.a < 0.002 && g.ta === 0) continue;` is doing real work:
 * with no pointer on any card the loop touches nothing, so an idle page costs
 * one empty rAF tick instead of 40 style writes.
 *
 * `--gxb` is the mirrored x (`width - x`). The back faces of flip cards read
 * it instead of `--gx` (globals.css: `.face.back::after{--gx:var(--gxb,50%)}`)
 * because the face is mirrored by `rotateY(180deg)` and an un-mirrored glow
 * would track the wrong way as the pointer moves.
 */

const GLOW_EASE = 0.1;

interface GlowItem {
  el: HTMLElement;
  /** pointer target, element-relative px */
  tx: number;
  ty: number;
  /** eased current position */
  x: number;
  y: number;
  /** eased current opacity, and its target (1 while hovered) */
  a: number;
  ta: number;
  /** false until the first pointermove, so the glow does not slide in from 0,0 */
  init: boolean;
}

const items = new Set<GlowItem>();
let raf: number | null = null;

function tick() {
  for (const g of items) {
    // Idle and invisible — skip the four style writes entirely.
    if (g.a < 0.002 && g.ta === 0) continue;
    g.x += (g.tx - g.x) * GLOW_EASE;
    g.y += (g.ty - g.y) * GLOW_EASE;
    g.a += (g.ta - g.a) * 0.12;
    const w = g.el.offsetWidth || 1;
    g.el.style.setProperty('--gx', g.x.toFixed(1) + 'px');
    g.el.style.setProperty('--gy', g.y.toFixed(1) + 'px');
    g.el.style.setProperty('--gxb', (w - g.x).toFixed(1) + 'px');
    g.el.style.setProperty('--ga', g.a.toFixed(3));
  }
  raf = requestAnimationFrame(tick);
}

function attach(el: HTMLElement): () => void {
  const g: GlowItem = { el, tx: 0, ty: 0, x: 0, y: 0, a: 0, ta: 0, init: false };

  const enter = () => {
    g.ta = 1;
  };
  const move = (e: PointerEvent) => {
    const r = el.getBoundingClientRect();
    g.tx = e.clientX - r.left;
    g.ty = e.clientY - r.top;
    if (!g.init) {
      g.x = g.tx;
      g.y = g.ty;
      g.init = true;
    }
  };
  const leave = () => {
    g.ta = 0;
    g.init = false;
  };

  el.addEventListener('pointerenter', enter);
  el.addEventListener('pointermove', move);
  el.addEventListener('pointerleave', leave);
  items.add(g);
  if (raf === null) raf = requestAnimationFrame(tick);

  return () => {
    el.removeEventListener('pointerenter', enter);
    el.removeEventListener('pointermove', move);
    el.removeEventListener('pointerleave', leave);
    items.delete(g);
    // Leave the properties where they are; the element is going away.
    if (items.size === 0 && raf !== null) {
      cancelAnimationFrame(raf);
      raf = null;
    }
  };
}

/**
 * Wire the cursor glow to every `.glow-card` inside `root`.
 *
 * @param root      subtree to scan
 * @param selector  override when a section glows something other than
 *                  `.glow-card` — the gallery attaches to `.gal-door`, which
 *                  is a `.glow-card` too, so the default covers it.
 */
export function useCursorGlow(
  root: RefObject<HTMLElement | null>,
  selector = '.glow-card',
): void {
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    // A coarse pointer never fires pointerenter/pointermove the way this
    // effect assumes, and the glow is pure decoration — skip the listeners
    // and the rAF loop on touch devices entirely.
    if (
      typeof matchMedia === 'function' &&
      matchMedia('(hover: none)').matches
    ) {
      return;
    }
    const detachers: (() => void)[] = [];
    el.querySelectorAll<HTMLElement>(selector).forEach((n) => {
      detachers.push(attach(n));
    });
    return () => detachers.forEach((d) => d());
  }, [root, selector]);
}
