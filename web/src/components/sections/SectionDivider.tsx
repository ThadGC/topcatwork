/**
 * The hairline rule between sections — index.html:3716 and friends.
 *
 *   <div class="section-divider" aria-hidden="true"><span class="sd-line"></span></div>
 *
 * It appears seven times on the home page. `.sd-line::after` is a travelling
 * gold highlight driven by a CSS animation, which is why the inner `<span>` is
 * required and cannot be folded into the wrapper. Reduced motion pins it to
 * `left:50%` (globals.css block 4) rather than removing it.
 *
 * The whole thing is decorative: `aria-hidden` is on the wrapper in the
 * source, not on the span, and that is what a screen reader needs — the
 * subtree is skipped either way and the attribute stays where the source put
 * it.
 */
export default function SectionDivider() {
  return (
    <div className="section-divider" aria-hidden="true">
      <span className="sd-line" />
    </div>
  );
}
