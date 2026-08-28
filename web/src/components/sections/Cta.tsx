'use client';

import type { ReactNode } from 'react';

import ContactForm, { WhatHappensNext } from '@/components/forms/ContactForm';
import { useReveal } from '@/hooks/useReveal';

/**
 * `section#cta` — index.html:4174. The enquiry card.
 *
 * THE LEFT COLUMN IS HERE; THE FORM IS NOT. `.cta-copy` — the headline, the
 * lede, the three direct-contact lines and the two trust badges — is unique to
 * this section, so it lives here. `form.cta-form#ctaForm` is shared with
 * /contact/ and is owned by <ContactForm/>, which keeps the class, the id and
 * every field `name` exactly as send.php expects them.
 *
 * `.cta-card` is the `.rise` element, not the section: the card is what fades
 * up, and putting the class on the section would animate the full-bleed
 * background with it.
 */
export interface CtaProps {
  /**
   * Passed straight to <ContactForm/>; see the reasoning there.
   *
   * Defaults ON since 28 Aug — "make sure that all the major contact forms are
   * correct" — so /contact/, /about/, /estimate/ and /projects/ now offer the
   * picker exactly as the home page does.
   */
  stonePicker?: boolean;
  /**
   * Replace the heading and the opening paragraph.
   *
   * The 132 stone pages use this. The client, 28 Aug: "take the full form
   * that's on the landing page and also on the contact page, and add that as a
   * global section into every single individual stone page... it'll take them
   * right down to where it will say Make It Yours with the same details, but
   * just in the other format so they can fill out their details right here on
   * this page... you only have to just change the text."
   *
   * So the CARD is the same card everywhere — same fields, same contact lines,
   * same trust row — and only the two lines of copy above it change.
   */
  heading?: ReactNode;
  lede?: ReactNode;
  /** Seeded straight into the form's stone chip. See <ContactForm/>. */
  initialStone?: { name: string; mat?: string; slug?: string };
  /**
   * Fade the card up on scroll — the `.rise` one-way door in hooks/useReveal.ts.
   *
   * ON everywhere by default. The home page, /about, /estimate, /projects,
   * /services, /stone-selector and the 132 stone pages all keep it, and the
   * client has never objected to any of them.
   *
   * OFF on /contact. The client, 28 Aug: "on the contact form, the form is
   * currently animating in. It should just already be there. Don't animate the
   * form in, on the contact page." There the card IS the page rather than its
   * sign-off, and it sits directly under <PageHead/>, so the entrance plays
   * while the page is still arriving.
   *
   * ⛔ AND ON A PHONE IT WAS FAILING SHUT, NOT JUST ANIMATING. The card is
   * 1226px tall at 390 and its top sits at 548 in an 844px viewport, so only
   * 24.1% of it is ever on screen — under useReveal's 0.25 threshold. Measured
   * over 3.2s: opacity stayed 0 and `.in` was never added. The contact form was
   * INVISIBLE on arrival until the visitor happened to scroll.
   */
  reveal?: boolean;
}

export default function Cta({
  stonePicker = true,
  heading,
  lede,
  initialStone,
  reveal = true,
}: CtaProps = {}) {
  const ref = useReveal<HTMLElement>();

  return (
    <section id="cta" ref={ref}>
      {/* No `.rise` means nothing to reveal: `.cta-card` declares neither
          opacity nor transform, so the card is settled in the SSR HTML, at
          first paint, and with JavaScript off. `useReveal` above stays
          unconditional (rules of hooks) and simply observes nothing. */}
      <div className={reveal ? 'cta-card rise' : 'cta-card'}>
        <div className="cta-copy">
          <h2 className="cta-title">
            {heading ?? (
              <>
                Get in touch with <em>Topcat</em>
              </>
            )}
          </h2>
          <p className="cta-line">
            {lede ?? (
              <>
                Tell us about your kitchen and we&apos;ll come and measure it. A
                free home visit across our service area, a fixed itemised quote,
                and a ten-year guarantee on every install. Prefer to talk it
                through? Ask for Nick.
              </>
            )}
          </p>
          <WhatHappensNext />
          <div className="cta-reach">
            <div className="cta-or">Or reach us directly</div>
            <ul className="cta-lines">
              <li>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  aria-hidden="true"
                >
                  <path d="M4 5c0-1 1-2 2-2h2l2 5-2 1a12 12 0 006 6l1-2 5 2v2c0 1-1 2-2 2A16 16 0 014 5z" />
                </svg>
                <a className="cta-tel" href="tel:+448000982812">
                  0800 098 2812
                </a>
              </li>
              <li>
                <svg
                  className="ic-wa"
                  viewBox="-1.7 -1.7 27.4 27.4"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  <path d="M12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413A11.815 11.815 0 0 0 12.05 0zm-.001 21.785h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884z" />
                </svg>
                <a
                  className="cta-tel"
                  href="https://wa.me/447464940287"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="07464 940287 on WhatsApp"
                >
                  07464 940287
                </a>
              </li>
              <li>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  aria-hidden="true"
                >
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="m3.6 6.5 8.4 6 8.4-6" />
                </svg>
                <a href="mailto:info@topcatworktops.co.uk">
                  info@topcatworktops.co.uk
                </a>
              </li>
            </ul>
            <div className="cta-trust">
              <div className="cta-rate">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="#C6A664"
                    d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.3 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8z"
                  />
                </svg>
                <span className="r-txt">
                  <span className="r-src">Google Reviews</span>
                  <span className="r-score">5.0 ★★★★★</span>
                </span>
              </div>
              <div className="cta-rate">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="#C6A664"
                    d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.3 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8z"
                  />
                </svg>
                <span className="r-txt">
                  <span className="r-src">Guarantee</span>
                  <span className="r-score">Ten years</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <ContactForm stonePicker={stonePicker} initialStone={initialStone} />
      </div>
    </section>
  );
}
