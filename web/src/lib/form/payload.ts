/* ==========================================================================
   The POST contract — a verbatim port of `payload()` and the fetch in
   `submit()` (tcform.js:118–171).

   send.php IS GONE. It only survived the rewrite because output:'export'
   exactly as it is, and this project is a static export, so there is no Next
   route handler and no server action anywhere near a form. The whole job of
   this file is to build a multipart body send.php already understands.

   THE FIELDS send.php READS, and where each one comes from:

     name email phone postcode message   the form's own inputs (FormData)
     service                             the /trade/ page's <select>
     stone stone_link file1…fileN        TC_FORM_EXTRA, from the estimator
                                         chip and the uploader
     page                                location.pathname   → page_label()
     page_title                          document.title, first segment
     form_name                           'Enquiry card' | 'Quick enquiry form'
     device screen                       the three site bands + viewport
     journey                             the visit trail (see ./journey)
     estimate                            the estimator's last state

   send.php:286–291 prints ANY other string field it does not know about as
   its own labelled row, so adding a field to a form needs no PHP change —
   which is why nothing here filters the FormData.
   ========================================================================== */

import { ENDPOINT, band, formKind } from './validate';
import { E_KEY, jload } from './journey';

export interface PayloadOptions {
  /**
   * The form's id, used for `form_name`. tcform.js reads it off the element;
   * here it is passed in so a test can build a payload without a DOM form.
   */
  id: string;
  /** The form's class list, used for the `.qform` branch of `formKind()`. */
  classNames: readonly string[];
}

/**
 * tcform.js:121 — the tail of the <title> is the site name, which would be
 * the same on every enquiry, so only the first `|` segment is sent and it is
 * cut to 80 characters. send.php truncates again at 90 (`fld('page_title',
 * 90)`), so the shorter cut here is the one that bites.
 */
export function pageTitle(title: string): string {
  return String(title || '')
    .split('|')[0]
    .trim()
    .slice(0, 80);
}

/**
 * tcform.js:124 — the separator is U+00D7 MULTIPLICATION SIGN, not the
 * letter x. send.php passes it straight through into the email header.
 */
export function screenSize(width: number, height: number): string {
  return width + '×' + height;
}

/**
 * Builds the body for one submission.
 *
 * `new FormData(form)` picks up every successful control the form owns, so
 * the inputs need no enumeration here and a field added to the markup is
 * carried automatically.
 */
export function buildPayload(
  form: HTMLFormElement,
  opts: PayloadOptions,
): FormData {
  const fd = new FormData(form);

  fd.append('page', location.pathname);
  fd.append('page_title', pageTitle(document.title));
  fd.append('form_name', formKind(opts.id, opts.classNames));
  fd.append('device', band(window.innerWidth));
  fd.append('screen', screenSize(window.innerWidth, window.innerHeight));

  try {
    const j = jload();
    if (j.ev.length) fd.append('journey', JSON.stringify(j));
    /*
      ⛔ ONLY AN ESTIMATE THE VISITOR ACTUALLY MADE.

      `used` is written by takeQ and by nothing else, and takeQ is only reached
      once the estimator's state differs from the one it opened on. Anything in
      storage without it is either a pre-versioning leftover or a shape that
      merely looks like an estimate, and neither belongs in an email that
      TopCat reads as a statement of what the customer chose.
    */
    const est = localStorage.getItem(E_KEY);
    if (est) {
      let used = false;
      try {
        used = (JSON.parse(est) as { used?: boolean })?.used === true;
      } catch {
        used = false;
      }
      if (used) fd.append('estimate', est);
    }
  } catch {
    /* tcform.js:130 swallows this too: no trail must ever block an enquiry. */
  }

  try {
    /*
      The hook site.js installs (site.js:4366) to bolt on the estimator's
      stone chip, the "seen it somewhere" link and the uploaded files. It is
      kept as a window hook rather than a prop because the estimator is a
      separate island that may not be mounted at all.
    */
    if (typeof window.TC_FORM_EXTRA === 'function') window.TC_FORM_EXTRA(fd, form);
  } catch {
    /* ignore */
  }

  return fd;
}

/**
 * tcform.js:153–160 — the client-side size guard. Counts only the entries
 * that are files (a `size` number); the text fields are irrelevant next to
 * a 50 MB photograph. send.php has its own ceilings on top of this: 50 MB a
 * file, 100 MB a POST, 12 MB before attachments become download links.
 */
export function totalBytes(fd: FormData): number {
  let total = 0;
  fd.forEach((value) => {
    if (value && typeof (value as File).size === 'number') {
      total += (value as File).size;
    }
  });
  return total;
}

/**
 * tcform.js:164–169. `Accept: application/json` because send.php always
 * answers JSON — `{ok:true,via:…}` or `{ok:false,error:…}` with a 422 for
 * missing details and a 500 when every sender rung was refused.
 *
 * ⚠️ A non-2xx is a real failure and must surface as one. When send.php
 * cannot send, it has already written the enquiry to `_enquiry-files/
 * .failed/` server-side, so telling the visitor to phone is honest rather
 * than a lie about lost details.
 */
export async function postEnquiry(fd: FormData): Promise<void> {
  const r = await fetch(ENDPOINT, {
    method: 'POST',
    body: fd,
    headers: { Accept: 'application/json' },
  });
  if (r.ok) return;

  /*
    ⛔ THE REASON IS READ, NOT DISCARDED.

    This used to be `if (!r.ok) throw new Error(String(r.status))`, so the whole
    of the route's `errors` array was thrown away and every failure reached the
    visitor as the same generic "something went wrong, please phone us". A
    visitor who simply left the name blank was told the site was broken, and a
    genuinely broken send looked identical to a typo — which is exactly what
    made the phone-only rejection invisible in the field for as long as it was.

    A 4xx is the visitor's to fix, so its messages are shown. A 5xx is ours, so
    the caller keeps its own wording and the phone number.
  */
  let reasons: string[] = [];
  if (r.status >= 400 && r.status < 500) {
    try {
      const body = (await r.json()) as { errors?: unknown };
      if (Array.isArray(body?.errors)) {
        reasons = body.errors.filter((x): x is string => typeof x === 'string' && !!x.trim());
      }
    } catch {
      /* not JSON, or an empty body: fall through to the generic message */
    }
  }
  const err = new Error(String(r.status)) as Error & { reasons?: string[] };
  if (reasons.length) err.reasons = reasons;
  throw err;
}
