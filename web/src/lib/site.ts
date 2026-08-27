/**
 * The production origin, in one place.
 *
 * Every canonical on the site already points here (verified across all 178
 * pages on 27 Aug), so robots.ts and sitemap.ts must agree with it or the
 * sitemap contradicts the canonicals it lists.
 *
 * ⚠️ The TARGET DOMAIN IS STILL UNCONFIRMED with the client — it has been
 * "Unclear" in the project record for weeks. This is the domain the ported
 * canonicals use, so it is the only defensible answer today. If launch goes to
 * a different host, change it here and the canonicals with it.
 */
export const SITE = 'https://www.topcatworktops.co.uk';
