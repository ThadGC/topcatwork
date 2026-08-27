/**
 * The two inline SVGs that appear only under /stones/.
 *
 * They live here rather than in components/chrome/glyphs.tsx because nothing
 * outside this archetype uses them: the compare mark is on the stone detail
 * page, the collection's control row and the compare picker; the magnifier is
 * on the collection search box and the picker's.
 */

/**
 * The two-rectangle "compare" mark — one solid slab, one dashed.
 *
 * The stroke width is NOT the same at all three call sites: 2.4 on the stone
 * detail page's `.stp-compare`, 2.6 on the collection's `.st-compare`, and 1.3
 * on the compare page's larger empty-state mark, which also uses a different
 * rect geometry (see <CompareEmptyMark/>). Copied, not unified.
 */
export function CompareRects({ strokeWidth }: { strokeWidth: number | string }) {
  return (
    <svg
      viewBox="0 0 48 32"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      aria-hidden="true"
    >
      <rect x="1.5" y="1.5" width="19" height="29" rx="2" />
      <rect x="27.5" y="1.5" width="19" height="29" rx="2" strokeDasharray="4 4" />
    </svg>
  );
}

/**
 * The compare page's empty-state mark. Same idea, different numbers: the rects
 * are at x=1/27 with width 20 and height 30 (not 1.5/27.5 × 19 × 29), the dash
 * is `3 3` (not `4 4`) and the stroke is 1.3. It is drawn at 64px rather than
 * 17px, which is why it was redrawn thinner.
 */
export function CompareEmptyMark() {
  return (
    <svg viewBox="0 0 48 32" fill="none" stroke="currentColor" strokeWidth="1.3">
      <rect x="1" y="1" width="20" height="30" rx="2" />
      <rect x="27" y="1" width="20" height="30" rx="2" strokeDasharray="3 3" />
    </svg>
  );
}

/** The magnifier inside `label.st-search`. */
export function SearchGlass() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.5-4.5" />
    </svg>
  );
}

/** The refine drawer's three-bar filter icon. */
export function RefineBars() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden="true"
    >
      <path d="M3 6h18M7 12h10M11 18h2" />
    </svg>
  );
}

/** The × on a compare card. */
export function DropCross() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

/** The ⌄ that closes the compare picker sheet. */
export function PickerChevron() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 9.5l6 6 6-6" />
    </svg>
  );
}
