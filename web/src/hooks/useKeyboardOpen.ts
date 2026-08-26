'use client';

import { useEffect } from 'react';

/**
 * Port of assets/tcform.js:190-203, verbatim.
 *
 *   var open = (vv.height / (root.clientHeight || vv.height)) < 0.78;
 *
 * It lives in the form script but it is a chrome behaviour: `html.kb-open`
 * only ever suppresses `.mbar` and the two FABs, so that a soft keyboard on
 * a phone does not shove the sticky contact bar up over the field the user
 * is typing into.
 *
 * The 0.78 ratio, the 260ms focusout settle and the silent bail when
 * `visualViewport` is undefined are all the source's. Writes the class only
 * on a change, like the source's `if (open === on) return`.
 */
export function useKeyboardOpen(): void {
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const root = document.documentElement;
    let on = false;

    const check = () => {
      const open = vv.height / (root.clientHeight || vv.height) < 0.78;
      if (open === on) return;
      on = open;
      root.classList.toggle('kb-open', open);
    };

    const onFocusOut = () => {
      window.setTimeout(check, 260);
    };

    vv.addEventListener('resize', check);
    vv.addEventListener('scroll', check);
    document.addEventListener('focusout', onFocusOut);
    check();

    return () => {
      vv.removeEventListener('resize', check);
      vv.removeEventListener('scroll', check);
      document.removeEventListener('focusout', onFocusOut);
      root.classList.remove('kb-open');
    };
  }, []);
}
