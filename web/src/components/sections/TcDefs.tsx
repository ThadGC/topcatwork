/**
 * `svg.tc-defs` — the two gold gradients the page SVGs reference by id
 * (`url(#tcGold)`, `url(#tcGoldSolid)`).
 *
 * It is the first child of `<main>` on every site-styled page and it must
 * stay there: a `url(#id)` paint resolves against the document, so the defs
 * have to be in the DOM before anything that fills with them paints. The
 * `width="0" height="0"` is what keeps it from taking any layout.
 *
 * The content-styled pages (/trade/, /privacy/, /terms/) ship a cut-down
 * version with `#tcGold` only — pass `solid={false}` for those.
 */
export function TcDefs({ solid = true }: { solid?: boolean }) {
  return (
    <svg className="tc-defs" aria-hidden="true" focusable="false" width="0" height="0">
      <defs>
        <linearGradient id="tcGold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#E9D5A0" />
          <stop offset=".55" stopColor="#C6A664" />
          <stop offset="1" stopColor="#96723A" />
        </linearGradient>
        {solid ? (
          <linearGradient id="tcGoldSolid" x1=".12" y1="0" x2=".78" y2="1">
            <stop offset="0" stopColor="#F6E9C2" />
            <stop offset=".3" stopColor="#DFC489" />
            <stop offset=".58" stopColor="#C6A664" />
            <stop offset=".82" stopColor="#AB8949" />
            <stop offset="1" stopColor="#8C6B34" />
          </linearGradient>
        ) : null}
      </defs>
    </svg>
  );
}
