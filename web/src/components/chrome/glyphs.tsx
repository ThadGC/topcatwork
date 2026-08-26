/**
 * The chrome's own inline SVG paths, copied character-for-character out of
 * the legacy markup.
 *
 * These live here rather than in a shared icon module because the chrome must
 * not drift when page-level icon sets are refactored: the header, the mobile
 * sheet, the sticky bar, the FABs and the footer are the parts of the site
 * that appear on all 178 pages, and a one-character change to a `d=` here
 * changes every one of them at once.
 *
 * ---------------------------------------------------------------------------
 * THERE ARE TWO WHATSAPP GLYPHS AND THEY ARE NOT THE SAME
 * ---------------------------------------------------------------------------
 *   SHEET  `.mbar-a` and `.mn-alt`.  Tail drawn `-.883-.688-1.48-1.538
 *          -1.653-1.835`, outer ring left unclosed (`m0`, no trailing `z`).
 *   SOLID  `.wa-fab` and `.foot-social`.  Tail `-.883-.788-1.48-1.761-1.653
 *          -2.059`, ring closed (`zm-.001`).
 *
 * The delta is sub-pixel — the two were hand-edited at different sizes — and
 * one canonical glyph would be defensible. Both are kept because keeping them
 * costs ten lines and guarantees each mark renders exactly as it does on the
 * page it came from. If the client ever asks for one, delete SHEET and point
 * `.mbar`/`.mn-alt` at SOLID.
 *
 * Every export returns bare paths, not an <svg>. The wrapper differs at each
 * site — `fill="currentColor"` in the footer, nothing on the FAB, `focusable`
 * present in some places and absent in others — so the caller supplies it.
 */

/** WhatsApp, sheet variant: `.mbar-a`, `.mn-alt`. */
export function WhatsAppPathsSheet() {
  return (
    <>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.688-1.48-1.538-1.653-1.835-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413A11.815 11.815 0 0 0 12.05 0m0 21.784h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.981.999-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.002-5.45 4.437-9.884 9.888-9.884a9.82 9.82 0 0 1 6.988 2.896 9.825 9.825 0 0 1 2.892 6.995c-.002 5.45-4.437 9.886-9.885 9.886" />
    </>
  );
}

/** WhatsApp, solid variant: `.wa-fab`, `.foot-social`. */
export function WhatsAppPathsSolid() {
  return (
    <>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413A11.815 11.815 0 0 0 12.05 0zm-.001 21.785h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884z" />
    </>
  );
}

/**
 * The handset. One path everywhere it appears, and it carries a baked-in
 * `transform="translate(-3.3965,-2.3291) scale(1.35116)"` — someone fitted a
 * glyph drawn for a different box into the 24x24 viewBox and committed the
 * matrix rather than redrawing the path. The numbers are load-bearing; do not
 * "simplify" them away.
 */
export function PhonePath() {
  return (
    <path
      transform="translate(-3.3965,-2.3291) scale(1.35116)"
      d="M6.3 3.5h2.4l1.7 4-2 1.3a11 11 0 0 0 4.8 4.8l1.3-2 4 1.7v2.4a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.3 5.7a2 2 0 0 1 2-2.2Z"
    />
  );
}

/**
 * The caret. Three sites, two readings:
 *
 *   nav.top Services trigger   strokeWidth 1.6, linecap only
 *   nav.top Stones trigger     strokeWidth 1.4, linecap AND linejoin
 *   .mn-toggle (both)          strokeWidth 1.6, linecap only
 *
 * The Stones caret really is different in the source. Reproduced rather than
 * unified — at 9x6 the two differ by about a third of a pixel.
 */
export function CaretPath({
  strokeWidth = '1.6',
  linejoin = false,
}: {
  strokeWidth?: string;
  linejoin?: boolean;
}) {
  return (
    <path
      d="M1 1l4 4 4-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      {...(linejoin ? { strokeLinejoin: 'round' as const } : {})}
    />
  );
}
