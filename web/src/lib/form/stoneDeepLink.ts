/**
 * THE `?stone=` DEEP LINK — the port of assets/site.js:4585-4603.
 *
 * ---------------------------------------------------------------------------
 * WHY THIS FILE EXISTS
 * ---------------------------------------------------------------------------
 * The old build ends with a bare IIFE that reads the stone out of the query
 * string and announces it:
 *
 *   const q=new URLSearchParams(location.search);
 *   const name=(q.get('stone')||'').trim().slice(0,60);
 *   if(!name)return;
 *   const mat=['Marble','Quartz','Granite'].includes(q.get('mat'))?q.get('mat'):null;
 *   ...
 *   document.dispatchEvent(new CustomEvent('topcat:stone',{detail:{...}}));
 *
 * Every one of the 132 stone pages links into it. The port kept BOTH
 * consumers of that event — the enquiry chip in `ContactForm.tsx` and the
 * estimator's stone in `useEstimator.ts` — and dropped the dispatcher, so the
 * parameters have been arriving and being ignored. The client, 28 Aug: "when
 * someone goes to an individual stone page and they click get an estimate for
 * this stone, it's currently completely fucked. It's supposed to go straight
 * to the contact form with the stone preselected."
 *
 * ---------------------------------------------------------------------------
 * ⛔ WHY THE CONSUMER SETS ITS OWN STATE INSTEAD OF LISTENING FOR THE EVENT
 * ---------------------------------------------------------------------------
 * A naive port — a `<StoneDeepLink/>` component that dispatches the event on
 * mount — silently does nothing. React flushes passive effects children before
 * parents, so a sibling rendered above `<ContactForm/>` fires its effect BEFORE
 * ContactForm's `document.addEventListener` has run, and the event lands with
 * nobody listening. So `ContactForm` reads the URL itself and sets its own
 * state directly; the event is re-broadcast afterwards purely so the OTHER
 * listener (the estimator, on `/` and `/estimate/`) still hears it.
 */

import { MATERIALS } from '@/lib/estimator/catalogue';

/** The pricing buckets the source is willing to accept — site.js:4589. */
const MATS = ['Marble', 'Quartz', 'Granite'] as const;

export interface StoneLink {
  name: string;
  mat?: string;
  slug?: string;
}

/**
 * Parse a `location.search` into a stone, or null when there is no stone in it.
 *
 * ⛔ Returns null, never a sentinel string. A helper that returns `'absent'`
 * reads as truthy at the call site and every fallback after it is skipped —
 * that exact mistake has produced a wrong answer in this codebase before.
 *
 * `slice(0, 60)` on both strings is the source's cap and is what stops a
 * hand-edited URL from writing an arbitrary payload into the enquiry.
 */
export function readStoneLink(search: string): StoneLink | null {
  let q: URLSearchParams;
  try {
    q = new URLSearchParams(search);
  } catch {
    return null;
  }
  const name = (q.get('stone') || '').trim().slice(0, 60);
  if (!name) return null;

  const rawMat = q.get('mat');
  const mat = (MATS as readonly string[]).includes(rawMat ?? '') ? (rawMat as string) : undefined;
  const slug = (q.get('slug') || '').trim().slice(0, 60) || undefined;

  return { name, mat, slug };
}

/**
 * site.js:4362-4365, verbatim:
 *
 *   const chipKind=d=>{
 *     const row=(MATERIALS[d.mat]||[]).find(s=>s.slug===d.slug||s.name===d.name);
 *     return (row&&row.kind)||d.mat;
 *   };
 *
 * `mat` is the PRICING bucket and `kind` is the DISPLAY family, and they
 * differ for 27 of the 132 stones — every quartzite and the one travertine sit
 * in the "Marble" bucket. Without the lookup the client's own example reads
 * "Bianco Eclypsia Calacatta · Marble" where the live site reads "· Quartzite".
 */
export function chipKind(d: { mat?: string; slug?: string; name?: string }): string | undefined {
  if (!d.mat) return undefined;
  const row = (MATERIALS[d.mat] || []).find(
    (s) => (d.slug && s.slug === d.slug) || (d.name && s.name === d.name),
  );
  return row?.kind || d.mat;
}

/** site.js:4400 — `${name} · ${kind}`, or the bare name when there is no mat. */
export function chipLabel(d: StoneLink): string {
  const kind = chipKind(d);
  return kind ? `${d.name} · ${kind}` : d.name;
}
