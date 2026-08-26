'use client';

/**
 * `nav.crumb` — the Family-B breadcrumb, present on 172 of the 178 legacy
 * pages. On the stone archetype it sits OUTSIDE <main>, which is why
 * stone.css names it explicitly in
 * `main, body > nav.crumb, body > footer{position:relative;z-index:1}`.
 *
 * Client-side only for the back arrow. The source puts the rule in an inline
 * onclick:
 *
 *   if(history.length>1 && document.referrer &&
 *      new window.URL(document.referrer,location).origin===location.origin)
 *     { history.back(); return false }
 *
 * i.e. step back through history when the visitor arrived from this site, and
 * otherwise fall through to the href — so a cold landing from Google still
 * goes somewhere sensible instead of leaving the tab. Reproduced exactly,
 * including the `history.length>1` guard.
 */
import type { Breadcrumbs } from '@/lib/stones';

export function Breadcrumb({ crumbs }: { crumbs: Breadcrumbs }) {
  const { back, items } = crumbs;

  return (
    <nav className="crumb" aria-label="Breadcrumb">
      {back ? (
        <a
          className="crumb-back"
          href={back.href}
          aria-label={back.label}
          onClick={(event) => {
            if (
              history.length > 1 &&
              document.referrer &&
              new window.URL(document.referrer, location.href).origin === location.origin
            ) {
              event.preventDefault();
              history.back();
            }
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <defs>
              <linearGradient id="backGold" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#C6A664" />
                <stop offset=".5" stopColor="#E4CD92" />
                <stop offset="1" stopColor="#C6A664" />
              </linearGradient>
            </defs>
            <path
              d="M15 18l-6-6 6-6"
              stroke="url(#backGold)"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </a>
      ) : null}
      <ol>
        {items.map((item) => (
          <li key={item.name} {...(item.current ? { 'aria-current': 'page' } : {})}>
            {item.href ? <a href={item.href}>{item.name}</a> : item.name}
          </li>
        ))}
      </ol>
    </nav>
  );
}
