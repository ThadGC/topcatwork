/**
 * `footer.site` on /trade/ — the one footer on the site that is not
 * <SiteFooter>.
 *
 * ---------------------------------------------------------------------------
 * WHY THIS FILE EXISTS
 * ---------------------------------------------------------------------------
 * 177 of the 178 live pages ship one byte-identical footer. /trade/ ships its
 * own, and the differences are editorial, not drift:
 *
 *   tagline      "…templated, fitted and guaranteed by one team."
 *                rather than "…from slab selection to a flawless fit."
 *   brand link   /index.html#hero, aria-label "Topcat Worktops home"
 *                rather than / and "Topcat Worktops, home"
 *   no           .foot-guar pill, .foot-social row, .foot-c-wa line
 *   no           .foot-tail, and so no tail-move script
 *   columns      plain `.foot-col` — no `.foot-explore` / `.foot-browse`
 *   contact      bare `<div>` rows, not `.foot-c-phone` / `.foot-c-email` / …
 *   FAQ          /index.html#faq, which actually resolves, rather than `#faq`
 *   bottom bar   Get a quote / FAQ / Sitemap
 *                rather than Sitemap / Privacy / Terms / Cookies
 *
 * It is a plain server component. <SiteFooter> is a client component only
 * because of `useFooterTail`, and there is no tail here to move.
 *
 * ⚠️ Do not "unify" this with <SiteFooter> behind props. The two footers agree
 * on six link labels and disagree on everything else, and a merged component
 * would need a flag per line above.
 */
import {
  EMAIL,
  EMAIL_HREF,
  FOOT_AREA,
  FOOT_COPYRIGHT,
  FOOT_EXPLORE,
  FOOT_HOURS,
  PHONE_DISPLAY,
  PHONE_TEL,
  TRADE_FOOT_BROWSE,
  TRADE_FOOT_LEGAL,
  TRADE_FOOT_TAGLINE,
} from './nav-data';

export function TradeFooter() {
  return (
    <footer className="site">
      <div className="foot-grid">
        <div className="foot-brand">
          <a
            className="brand brand-stack"
            href="/"
            aria-label="Topcat Worktops home"
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
          <p className="foot-tag">{TRADE_FOOT_TAGLINE}</p>
          <span className="foot-stars">
            <b>★★★★★</b> 5.0 · Google reviews
          </span>
        </div>

        <div className="foot-col">
          <div className="foot-k">Explore</div>
          <ul>
            {FOOT_EXPLORE.map((link) => (
              <li key={link.href}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>
        </div>

        <div className="foot-col">
          <div className="foot-k">Browse</div>
          <ul>
            {TRADE_FOOT_BROWSE.map((link) => (
              <li key={link.href}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>
        </div>

        <div className="foot-col foot-contact">
          <div className="foot-k">Contact</div>
          <div>
            <span className="foot-ck">Phone</span>
            <a className="foot-cv" href={PHONE_TEL}>
              {PHONE_DISPLAY}
            </a>
          </div>
          <div>
            <span className="foot-ck">Email</span>
            <a className="foot-cv" href={EMAIL_HREF}>
              {EMAIL}
            </a>
          </div>
          <div>
            <span className="foot-ck">Area</span>
            <span className="foot-cv">{FOOT_AREA}</span>
          </div>
          <div>
            <span className="foot-ck">Hours</span>
            <span className="foot-cv">{FOOT_HOURS}</span>
          </div>
        </div>
      </div>

      <div className="foot-bar">
        <span>{FOOT_COPYRIGHT}</span>
        <div className="foot-legal">
          {TRADE_FOOT_LEGAL.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
