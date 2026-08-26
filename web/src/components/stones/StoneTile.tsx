import type { CollectionTile, RelatedStone } from '@/lib/stones';

import { SlabImage } from './SlabImage';

/**
 * `a.stile` — the slab card. 134 of the legacy pages contain at least one.
 *
 * TWO VARIANTS, and they are not interchangeable:
 *
 *   grid    `class="stile rise"` on the collection page. Carries the seven
 *           `data-*` filter attributes and a `.stile-tag` material badge in
 *           the top-left corner. No aria-label — the visible `.stile-name`
 *           is the accessible name.
 *
 *   mini    `class="stile mini"` in a stone page's "More … to consider" row.
 *           No data attributes, no `.rise`, NO `.stile-tag`, and an explicit
 *           aria-label. stone.css drops `.st-grid.related .stile-name` from
 *           clamp(16px,1.5vw,20px) to a flat 16px.
 *
 * The `›` is `&rsaquo;` in the source, aria-hidden, and revealed on hover by
 * `.stile:hover .stile-go`. The shine sweep is `.stile::after`, pure CSS.
 */
export function StoneTile({ tile }: { tile: CollectionTile }) {
  const { data } = tile;
  return (
    <a
      className="stile rise"
      href={tile.href}
      data-mat={data.mat}
      data-tone={data.tone}
      data-hue={data.hue}
      data-vein={data.vein}
      data-finish={data.finish}
      data-attr={data.attr}
      data-find={data.find}
    >
      <span className="stile-stone">
        <SlabImage image={tile.image} />
      </span>
      <span className="stile-veil" />
      <span className="stile-tag">{tile.materialLabel}</span>
      <span className="stile-meta">
        <span className="stile-name">{tile.name}</span>
        <span className="stile-sup">{tile.finish}</span>
      </span>
      <span className="stile-go" aria-hidden="true">
        &rsaquo;
      </span>
    </a>
  );
}

/** The `.stile.mini` used in the three-up related row. */
export function RelatedStoneTile({ stone }: { stone: RelatedStone }) {
  return (
    <a className="stile mini" href={stone.href} aria-label={stone.ariaLabel}>
      <span className="stile-stone">
        <SlabImage image={stone.image} />
      </span>
      <span className="stile-veil" />
      <span className="stile-meta">
        <span className="stile-name">{stone.name}</span>
        <span className="stile-sup">{stone.finish}</span>
      </span>
      <span className="stile-go" aria-hidden="true">
        &rsaquo;
      </span>
    </a>
  );
}
