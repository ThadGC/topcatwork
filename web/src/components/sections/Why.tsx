'use client';

import type { ReactNode } from 'react';

import { useCursorGlow } from '@/hooks/useCursorGlow';
import { useReveal } from '@/hooks/useReveal';

/**
 * `section.section#why` — index.html:4086.
 *
 * A photo tile plus five numbered reason tiles in a mosaic. The mosaic is a
 * grid with named areas, so the `wy-a`…`wy-e` classes are the placement and
 * the tiles must stay in source order.
 *
 * The icons are inline SVG, verbatim from the source, and they matter: each
 * one is drawn to sit on the same optical weight at the tiny size the tile
 * renders them, and several rely on `fill-rule="evenodd"` to cut their
 * counters. Swapping in an icon font or a sprite would change the drawing.
 */

interface Reason {
  icon: ReactNode;
  n: string;
  cls: string;
  h: string;
  p: string;
}

const REASONS: readonly Reason[] = [
  {
    cls: 'wy-a',
    n: '01',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
      >
        <path d="M8.7 6.2a5.8 5.8 0 1 0 0 11.6 5.8 5.8 0 0 0 0-11.6Zm0 2.4a3.4 3.4 0 1 1 0 6.8 3.4 3.4 0 0 1 0-6.8Z" />
        <path d="M15.3 6.2a5.8 5.8 0 1 0 0 11.6 5.8 5.8 0 0 0 0-11.6Zm0 2.4a3.4 3.4 0 1 1 0 6.8 3.4 3.4 0 0 1 0-6.8Z" />
      </svg>
    ),
    h: 'One accountable team',
    p: 'One contract and one contact, from first measurement to final wipe down. We template it, we cut it, we fit it, and we answer for all of it.',
  },
  {
    cls: 'wy-b',
    n: '02',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
      >
        <path d="M12.9 2.8a1.7 1.7 0 0 0-1.2.5L3 12a1.7 1.7 0 0 0 0 2.4l6.6 6.6a1.7 1.7 0 0 0 2.4 0l8.7-8.7a1.7 1.7 0 0 0 .5-1.2V4.5a1.7 1.7 0 0 0-1.7-1.7h-6.6ZM17 6.6a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2Z" />
      </svg>
    ),
    h: 'Fixed, itemised pricing',
    p: 'The quote you approve is the price you pay, templating, edges and fitting all costed up front on one page.',
  },
  {
    cls: 'wy-c',
    n: '03',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.8 20.5 11.3h-5.1v5.1H8.6v-5.1H3.5L12 2.8Z" />
        <rect x="3.2" y="19.4" width="17.6" height="1.8" rx="0.9" />
      </svg>
    ),
    h: 'Above and beyond',
    p: 'Every cut-out free of charge, drainer grooves as standard, edges pencil-rounded, kind to small hands.',
  },
  {
    cls: 'wy-d',
    n: '04',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.9"
        strokeLinecap="round"
      >
        <path d="M12 2.6C17.5 5.5 17.5 9.1 12 12 6.5 14.9 6.5 18.5 12 21.4" />
      </svg>
    ),
    h: 'Vein-matched by hand',
    p: 'Slabs are laid out and matched before a single cut, so joints and waterfall edges run continuous.',
  },
  {
    cls: 'wy-e',
    n: '05',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
      >
        <path d="M12 2.4a9.6 9.6 0 1 0 0 19.2 9.6 9.6 0 0 0 0-19.2Zm1.15 4.3v5.05l3.3 1.93-1.16 1.98-4.44-2.6V6.7h2.3Z" />
      </svg>
    ),
    h: 'Aftercare inside 72 hours',
    p: 'Tweaks after fitting never wait more than 72 hours and never cost a penny. Others take a month once paid.',
  },
];

export default function Why() {
  const ref = useReveal<HTMLElement>();
  useCursorGlow(ref, '.wy-tile');

  return (
    <section className="section" id="why" ref={ref}>
      <div className="section-head rise">
        <h2 className="section-title">
          More reasons to <em>choose us</em>
        </h2>
        <p className="section-sub">
          Anyone can sell you a slab. What you&apos;re actually buying is the
          service around it, the guidance, the measuring, the matching, the fit
          and the aftercare, and that is the part we are judged on.
        </p>
      </div>

      <div className="why-mosaic" id="whyMosaic">
        <figure className="wy-tile wy-p glow-card">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/site/why-team-900.webp"
            alt="The Topcat team at work"
            draggable={false}
            loading="lazy"
            decoding="async"
          />
          <div className="wy-p-veil" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="wy-p-mark"
            src="/assets/brand/topcat-vertical.svg"
            alt=""
            aria-hidden="true"
            draggable={false}
            loading="lazy"
            decoding="async"
          />
          <div className="sheen" />
        </figure>

        {REASONS.map((r) => (
          <article
            key={r.cls}
            className={`wy-tile wy-r ${r.cls} glow-card`}
          >
            <div className="wy-stone" aria-hidden="true" />
            <span className="wy-top">
              <span className="wy-ico" aria-hidden="true">
                {r.icon}
              </span>
              {/* Hidden below 620px tall — decorative, hence aria-hidden. */}
              <span className="wy-n" aria-hidden="true">
                {r.n}
              </span>
            </span>
            <h3>{r.h}</h3>
            <p>{r.p}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
