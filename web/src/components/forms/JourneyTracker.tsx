'use client';

/* ==========================================================================
   The visit trail's page-load hook — `journeyBoot()` from tcform.js:183–188,
   mounted per page exactly as `<script src="/assets/tcform.js">` is included
   per page in the source. Renders nothing.

   ⚠️ THE OTHER HALF OF tcform.js's PAGE-LOAD WORK IS NOT HERE. The
   soft-keyboard watcher (tcform.js:190–204, `html.kb-open`) is owned by
   <ChromeScripts/> — it only ever moves `.mbar` and the FABs, which are
   chrome, and a page with no form still needs it when the estimator's number
   pad opens. Mounting it here as well would give two watchers fighting over
   one class.

   Everything this records stays in the visitor's own localStorage until they
   choose to send a form; see @/lib/form/journey for the promises the privacy
   page makes about it.
   ========================================================================== */

import { useEffect } from 'react';

import { journeyBoot } from '@/lib/form/journey';

export default function JourneyTracker() {
  useEffect(() => journeyBoot(), []);
  return null;
}
