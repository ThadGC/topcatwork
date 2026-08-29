/* ==========================================================================
   THE VIEWPORT HEIGHT A SCROLL ANIMATION SHOULD MEASURE AGAINST.

   ⛔ `window.innerHeight` IS THE WRONG NUMBER FOR ANYTHING SCROLL-COUPLED ON A
   PHONE, AND IT DISAGREES WITH THE STYLESHEET AROUND IT.

   Two different quantities are both called "the viewport height":

     window.innerHeight                  the VISUAL viewport. On iOS Safari it
                                         steps by the height of the browser
                                         chrome every time the address bar
                                         collapses or expands — measured 844 to
                                         758 on this project's reference device,
                                         an 86px step, and it happens repeatedly
                                         during one slow scroll.

     documentElement.clientHeight        the LAYOUT viewport. This is the exact
                                         quantity CSS `vh` resolves against, and
                                         iOS Safari holds it steady while the
                                         bar animates.

   Every scroll-progress animation in this app is a ratio of a laid-out
   `getBoundingClientRect().top` — a CSS-space number — over a viewport height.
   Taking the numerator from CSS space and the denominator from the visual
   viewport means the ratio moves when nothing on the page has moved, so the
   animation it drives re-times itself mid-scroll. The client, on his phone:
   "scrolling down and up very slowly, the site is jumping around a little bit."

   ⚠️ WHY NOT A LATCHED SINGLETON. The obvious alternative is to cache a height
   at boot and refresh it only on a "real" resize. That needs a listener, a
   threshold, and a policy for orientation, split view and the on-screen
   keyboard — three more things to get wrong, and it goes stale in exactly the
   in-app browsers this is meant to help. `clientHeight` needs none of that: it
   is live, it is correct after a genuine resize, and it simply does not move
   for browser chrome. It is also the number the CSS already uses, so the two
   halves of every one of these animations finally agree.

   ⚠️ THIS IS NOT FOR EVERYTHING. Code that positions something against the
   visible area RIGHT NOW — a popover deciding whether it has room to open
   below, the film's own cover fit — genuinely wants the visual viewport and
   must keep reading `window.innerHeight`. This is for scroll-progress ratios.
   ========================================================================== */

/**
 * The layout viewport's height, the denominator for a scroll-progress ratio.
 *
 * Never returns 0: every caller divides by it.
 */
export function viewportHeight(): number {
  return document.documentElement.clientHeight || window.innerHeight || 1;
}
