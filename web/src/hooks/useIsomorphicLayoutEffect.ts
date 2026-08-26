'use client';

import { useEffect, useLayoutEffect } from 'react';

/**
 * `useLayoutEffect` on the client, `useEffect` on the server.
 *
 * The chrome is prerendered at build time (`output: 'export'`), and React
 * logs a warning for every `useLayoutEffect` it meets during a server render.
 * The measurement it guards — `.mn-sub` scrollHeight — genuinely has to run
 * before paint, so the effect stays layout-timed in the browser.
 */
export const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;
