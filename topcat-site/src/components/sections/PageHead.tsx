import { HeroChips } from './HeroChips';

/**
 * `section.page-head` — the masthead on /about/, /contact/, /estimate/ and
 * /projects/. The four pages differ only in the crumb's last word, the `h1`
 * and one paragraph; the chip row underneath is identical on all four.
 *
 * The breadcrumb is a plain `<nav>` with a text separator, exactly as in the
 * source. The machine-readable copy is the BreadcrumbList JSON-LD each page
 * emits alongside its metadata.
 */
export function PageHead({
  crumb,
  title,
  lede,
}: {
  crumb: string;
  title: string;
  lede: string;
}) {
  return (
    <section className="page-head">
      <div className="page-head-in">
        <nav className="page-crumb" aria-label="Breadcrumb">
          <a href="/">Home</a>
          <span>/</span>
          {crumb}
        </nav>
        <h1>{title}</h1>
        <p>{lede}</p>
        <HeroChips glow />
      </div>
    </section>
  );
}
