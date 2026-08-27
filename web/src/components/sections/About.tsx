'use client';

import { srcSet } from '@/data/home/srcset';
import { useAboutHinge } from '@/hooks/useAboutHinge';
import { useCursorGlow } from '@/hooks/useCursorGlow';
import { useReveal } from '@/hooks/useReveal';
import { useRef } from 'react';

/**
 * `section.section#about` — index.html:4048.
 *
 * Six copy blocks on the left, a six-tile collage on the right.
 *
 * THE `--rd` DELAYS ARE MARKUP, NOT CSS. Each `.rise` in this section carries
 * an inline `--rd` (0/120/180/240/300/360/480ms) and `#about .rise` reads it
 * as `transition-delay` (site.css:2872). That is the one place on the page
 * where the reveal stagger is authored per element rather than derived, so
 * the values have to travel with the markup — see the `style` props below.
 *
 * THE COLLAGE IMAGES ARE ASSIGNED IN JS, and this component does the same
 * thing for the same reason (site.js:4412): `picks` is sparse. Tiles 1, 5 and
 * 6 get no `src` at all — tile 1 is the brand plate, which shows the vertical
 * logo instead of a photograph, and 5 and 6 are the two team portraits, which
 * carry their own `src` in the markup. Emitting `src=""` on the other three
 * would fire a request for the page itself, so an absent attribute is
 * correct, not lazy.
 *
 * THE HINGE lives in `useAboutHinge` (site.js:4411-4441 + `scrollSequence`,
 * site.js:4244-4278). It needs its own ref because it queries and writes the
 * six `.ac-tile`s directly and measures `#aboutCollage`'s rect, not the
 * section's — the section is a full-height two-column block and its top
 * crosses the trigger line long before the collage does.
 */

/** site.js:4413 — index-aligned with the six `.ac-tile`s; nulls are deliberate. */
const COLLAGE_PICKS: readonly (string | null)[] = [
  null,
  '/assets/site/about-fitting-386.webp',
  '/assets/team/fitting.jpg',
  '/assets/projects/harrow-1400.webp',
  null,
  null,
];

const COLLAGE_SIZES = '(max-width:720px) 240px, 375px';

/** The alt text carried by the three photographic tiles, in markup order. */
const COLLAGE_ALT = [
  'Worktops going in on a kitchen fit',
  'Fitting a worktop',
  'A mitred waterfall island fitted on the Harrow project',
] as const;

export default function About() {
  const ref = useReveal<HTMLElement>();
  const collageRef = useRef<HTMLDivElement>(null);
  useCursorGlow(ref, '.ac-tile');
  useAboutHinge(collageRef);

  return (
    <section className="section" id="about" ref={ref}>
      <div className="about-wrap">
        <div className="about-copy">
          <h2
            className="section-title rise"
            style={{ ['--rd' as string]: '0ms', maxWidth: '22ch' }}
          >
            About <em>us</em>
          </h2>
          <p className="section-sub rise" style={{ ['--rd' as string]: '120ms' }}>
            We built Topcat because buying a worktop should be simpler, clearer
            and more personal. It is the heart of your home after all.
          </p>
          <p className="section-sub rise" style={{ ['--rd' as string]: '180ms' }}>
            With a background in distribution, we saw customers handed inflated
            and unclear quotes with service to match, and jobs where the person
            who sells the work is not the person who measures it, makes it or
            fits it. We wanted to change that.
          </p>
          <p className="section-sub rise" style={{ ['--rd' as string]: '240ms' }}>
            So we take responsibility for the whole process, from helping you
            choose your stone to templating, fabricating and fitting it, all
            under one roof.
          </p>
          <p className="section-sub rise" style={{ ['--rd' as string]: '300ms' }}>
            One contractor. One contact. No chasing around.
          </p>
          <p className="section-sub rise" style={{ ['--rd' as string]: '360ms' }}>
            Great worktops are about more than the stone. They are about
            precision, communication and an experience that feels effortless. If
            you want to speak to someone who knows your project from start to
            finish, ask for Nick. His is the name you will see time and time
            again in the reviews above.
          </p>
          <div className="about-cta rise" style={{ ['--rd' as string]: '480ms' }}>
            <a className="rev-cta-primary" href="#cta">
              Chat with Topcat
            </a>
          </div>
        </div>

        <div className="about-collage" id="aboutCollage" ref={collageRef}>
          <figure className="ac-tile ac-w1 ac-plate glow-card">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="ac-mark"
              src="/assets/brand/topcat-vertical.svg"
              alt=""
              aria-hidden="true"
              draggable={false}
              loading="lazy"
              decoding="async"
            />
            <div className="ac-veil" />
            <div className="sheen" />
          </figure>

          {(['ac-w2', 'ac-w3', 'ac-w4'] as const).map((cls, n) => {
            const pick = COLLAGE_PICKS[n + 1];
            return (
              <figure key={cls} className={`ac-tile ${cls} glow-card`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  {...(pick ? { src: pick, ...srcSet(pick, COLLAGE_SIZES) } : {})}
                  alt={COLLAGE_ALT[n]}
                  draggable={false}
                  loading="lazy"
                  decoding="async"
                />
                <div className="ac-veil" />
                <div className="sheen" />
              </figure>
            );
          })}

          <figure className="ac-tile ac-p ac-p1 glow-card">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/team/nick-320.webp?v=4"
              srcSet="/assets/team/nick-320.webp?v=4 320w, /assets/team/nick-640.webp?v=4 640w"
              sizes="(max-width:1120px) 162px, 241px"
              alt="Nick, Managing Director at Topcat Worktops"
              draggable={false}
              loading="lazy"
              decoding="async"
            />
            <div className="sheen" />
            <figcaption className="acp-who">
              <b className="acp-name">Nick</b>
              <span className="acp-role">Managing Director</span>
            </figcaption>
          </figure>

          <figure className="ac-tile ac-p ac-p2 glow-card">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/team/rimsha-320.webp?v=4"
              srcSet="/assets/team/rimsha-320.webp?v=4 320w, /assets/team/rimsha-640.webp?v=4 640w"
              sizes="(max-width:1120px) 162px, 241px"
              alt="Rimsha, Operations Director at Topcat Worktops"
              draggable={false}
              loading="lazy"
              decoding="async"
            />
            <div className="sheen" />
            <figcaption className="acp-who">
              <b className="acp-name">Rimsha</b>
              <span className="acp-role">Operations Director</span>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
