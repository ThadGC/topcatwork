'use client';

import { useRef } from 'react';

import { useFooterTail } from '@/hooks/useFooterTail';

import { MailPath, PhonePath, WhatsAppPathsSolid } from './glyphs';
import {
  EMAIL,
  EMAIL_HREF,
  FOOT_AREA,
  FOOT_BROWSE_HEAD,
  FOOT_COPYRIGHT,
  FOOT_EXPLORE,
  FOOT_HOURS,
  FOOT_LEGAL,
  FOOT_TAGLINE,
  FACEBOOK_URL,
  INSTAGRAM_URL,
  LINKEDIN_URL,
  PHONE_DISPLAY,
  PHONE_TEL,
  WHATSAPP_DISPLAY,
  WHATSAPP_URL,
} from './nav-data';

export interface SiteFooterProps {
  /**
   * The Browse column's last link. The source hard-codes a bare `#faq`, which
   * resolves on the three pages that have a FAQ section and is a dead link on
   * the other 174. Defaulted to the source's value; pass '/#faq' to fix it.
   */
  readonly faqHref?: string;
}

/**
 * `footer.site#footer` — byte-identical across all 177 modern pages.
 *
 * ---------------------------------------------------------------------------
 * THE TAIL
 * ---------------------------------------------------------------------------
 * `.foot-c-area` and `.foot-c-hours` are rendered inside `.foot-contact`,
 * where the phone layout wants them, and an empty `<div class="foot-tail">`
 * sits below the grid. At 721px and up a script moves those two nodes into
 * the tail, where they get a full-width row of their own instead of being
 * squeezed into the fourth column. See useFooterTail for why this is a DOM
 * move rather than a conditional render.
 *
 * Two consequences for anyone editing below this line:
 *
 *   1. `.foot-tail:empty{display:none}` is what keeps the empty div invisible
 *      on phones. The div must have NO children — not a comment, not a space.
 *      `<div ... />` is correct; do not "tidy" it into `<div>{null}</div>`.
 *
 *   2. `.foot-c-area` and `.foot-c-hours` must stay static JSX. No key, no
 *      conditional, no interpolated child below them, or React will re-insert
 *      them where it thinks they belong and undo the move.
 */
export function SiteFooter({ faqHref = '#faq' }: SiteFooterProps) {
  const footer = useRef<HTMLElement>(null);
  const tail = useRef<HTMLDivElement>(null);
  const contact = useRef<HTMLDivElement>(null);
  const area = useRef<HTMLDivElement>(null);
  const hours = useRef<HTMLDivElement>(null);

  useFooterTail({ footer, tail, contact, area, hours });

  return (
    <footer className="site" id="footer" ref={footer}>
      <div className="foot-grid">
        <div className="foot-brand">
          <a
            className="brand brand-stack"
            href="/"
            aria-label="Topcat Worktops, home"
          >
            <img
              className="brand-logo"
              src="/assets/brand/topcat-vertical.svg"
              alt=""
              width={528}
              height={495}
              decoding="async"
            />
          </a>
          <p className="foot-tag">{FOOT_TAGLINE}</p>
          <span className="foot-stars">
            <b>★★★★★</b> 5.0 · Google reviews
          </span>
          {/*
            `.foot-guar` is display:none everywhere except below 720px, where
            the footer's star line becomes a pill and this becomes a second
            one under it. It is rendered on every viewport regardless — the
            source does the same, and hiding it in JS instead would cost a
            hydration mismatch for no gain.
          */}
          <span className="foot-stars foot-guar">
            <b>10</b> year guarantee
          </span>
          <div className="foot-social">
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Topcat Worktops on Instagram"
            >
              {/* Stroked, not filled — the only stroked glyph in the chrome. */}
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                aria-hidden="true"
              >
                <rect x="3.2" y="3.2" width="17.6" height="17.6" rx="5" />
                <circle cx="12" cy="12" r="4.1" />
                <circle
                  cx="17.1"
                  cy="6.9"
                  r="1.15"
                  fill="currentColor"
                  stroke="none"
                />
              </svg>
            </a>
            {/* Facebook — added 27 Aug 2026, the client's own page. Filled,
                like LinkedIn and WhatsApp beside it; Instagram is the only
                stroked glyph in the chrome. */}
            <a
              href={FACEBOOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Topcat Worktops on Facebook"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z" />
              </svg>
            </a>
            <a
              href={LINKEDIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Topcat Worktops on LinkedIn"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3.2 9h3.6v12H3.2zM9.6 9h3.45v1.64h.05c.48-.9 1.66-1.85 3.42-1.85 3.66 0 4.33 2.35 4.33 5.4V21h-3.6v-5.02c0-1.2-.02-2.74-1.73-2.74-1.73 0-2 1.3-2 2.65V21H9.6z" />
              </svg>
            </a>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Message Topcat Worktops on WhatsApp"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <WhatsAppPathsSolid />
              </svg>
            </a>
          </div>
        </div>

        <div className="foot-col foot-explore">
          <div className="foot-k">Explore</div>
          <ul>
            {FOOT_EXPLORE.map((link) => (
              <li key={link.href}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>
        </div>

        <div className="foot-col foot-browse">
          <div className="foot-k">Browse</div>
          <ul>
            {FOOT_BROWSE_HEAD.map((link) => (
              <li key={link.href}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
            <li>
              <a href={faqHref}>FAQ</a>
            </li>
          </ul>
        </div>

        <div className="foot-col foot-contact" ref={contact}>
          <div className="foot-k">Contact</div>
          <div className="foot-c-phone">
            <span className="foot-ck">Phone</span>
            <a className="foot-cv" href={PHONE_TEL}>
              <svg className="foot-cv-ico" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <PhonePath />
              </svg>
              {PHONE_DISPLAY}
            </a>
          </div>
          <div className="foot-c-email">
            <span className="foot-ck">Email</span>
            <a className="foot-cv" href={EMAIL_HREF}>
              <svg className="foot-cv-ico" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <MailPath />
              </svg>
              {EMAIL}
            </a>
          </div>
          <div className="foot-c-wa">
            {/* Below 721px the icon inside the pill names the channel, so this
                label is hidden there (chrome.css) exactly as Phone's and
                Email's already are. It stays in the DOM for the wider layout
                and for assistive tech. */}
            <span className="foot-ck">WhatsApp</span>
            <a
              className="foot-cv"
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`WhatsApp ${WHATSAPP_DISPLAY}`}
            >
              <svg className="foot-cv-ico" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <WhatsAppPathsSolid />
              </svg>
              {WHATSAPP_DISPLAY}
            </a>
          </div>

          {/* --- moved into .foot-tail at >=721px. Keep static. --- */}
          <div className="foot-c-area" ref={area}>
            <span className="foot-ck">Area</span>
            <span className="foot-cv">{FOOT_AREA}</span>
          </div>
          <div className="foot-c-hours" ref={hours}>
            <span className="foot-ck">Hours</span>
            <span className="foot-cv">{FOOT_HOURS}</span>
          </div>
        </div>
      </div>

      {/* Must render with zero children — see the note above. */}
      <div className="foot-tail" id="footTail" ref={tail} />

      <div className="foot-bar">
        <span>{FOOT_COPYRIGHT}</span>
        <div className="foot-legal">
          {FOOT_LEGAL.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
