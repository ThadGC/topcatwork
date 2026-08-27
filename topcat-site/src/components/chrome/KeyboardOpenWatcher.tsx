'use client';

import { useKeyboardOpen } from '@/hooks/useKeyboardOpen';

/**
 * Mounts the soft-keyboard detector. Renders nothing.
 *
 * The logic lives in assets/tcform.js, but it belongs to the chrome: the
 * `html.kb-open` class it writes only ever suppresses `.mbar` and the two
 * FABs. Keeping it here means a page with no form still behaves correctly
 * when a keyboard opens over, say, the estimator's number pad.
 */
export function KeyboardOpenWatcher() {
  useKeyboardOpen();
  return null;
}
