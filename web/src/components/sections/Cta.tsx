'use client';

import ContactForm from '@/components/forms/ContactForm';
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
export default function Cta() {
  const ref = useReveal<HTMLElement>();

  return (
    <section id="cta" ref={ref}>
      <div className="cta-card rise">
        <div className="cta-copy">
          <h2 className="cta-title">
            Get in touch with <em>Topcat</em>
          </h2>
          <p className="cta-line">
            Tell us about your kitchen and we&apos;ll come and measure it. A
            free home visit across our service area, a fixed itemised quote, and
            a ten-year guarantee on every install. Prefer to talk it through?
            Ask for Nick.
          </p>
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

        <ContactForm />
      </div>
    </section>
  );
}
