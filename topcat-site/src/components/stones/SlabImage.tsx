import type { StoneImage } from '@/lib/stones';

/**
 * A slab photograph.
 *
 * A plain <img>, not next/image, and that is deliberate on three counts:
 *
 *   1. `output: 'export'` forces `images.unoptimized`. There is no
 *      `/_next/image` endpoint on the client's Apache host, so next/image
 *      would emit the same <img> with extra wrapper markup and a runtime
 *      dependency, and buy nothing.
 *   2. The `srcset`/`sizes` pairs are hand-tuned per context — 92vw/436px for
 *      the hero slab, 45vw/290px for a collection tile, 46vw/240px in the
 *      compare grid — and the -s variant is a genuinely different crop budget,
 *      not a resize of the 1600w file. next/image would recompute all of it.
 *   3. Every URL carries the `?v=3` cache-buster the client's deploy relies
 *      on. It has to survive the port intact.
 *
 * `loading="lazy"` comes from the data, and it is on every single one: the
 * collection page ships 132 of these, so eager decoding would be brutal. That
 * includes the stone detail page's own hero slab, which is above the fold and
 * lazy anyway — the source's choice, kept.
 */
export function SlabImage({
  image,
  className,
}: {
  image: StoneImage;
  className?: string;
}) {
  return (
    <img
      className={className}
      src={image.src}
      srcSet={image.srcset.map((s) => `${s.url} ${s.descriptor}`).join(', ')}
      sizes={image.sizes}
      alt={image.alt}
      loading={image.loading as 'lazy' | 'eager'}
      decoding={image.decoding as 'async' | 'sync' | 'auto'}
    />
  );
}
