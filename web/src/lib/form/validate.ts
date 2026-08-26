/* ==========================================================================
   The enquiry-form validation rules — a verbatim port of `check()` in
   ../../../../assets/tcform.js (lines 102–117), lifted out of the DOM so it
   can be unit-tested.

   THIS IS A PORT, NOT A REDESIGN. Every rule, every order of evaluation and
   every message string below comes out of tcform.js as it stands. Do not add
   a rule the source does not have (no "email is required", no minimum
   message length, no phone format beyond the digit count), do not reword a
   message, and do not reorder the checks — the first failure is the only one
   reported, and which one fires first is observable behaviour.

   The server agrees with a subset of this and no more: send.php:120 rejects
   only `mb_strlen($name) < 2 || ($email === '' && $phone === '')` with a 422.
   Everything else here is client-side courtesy, which is exactly why the
   client must not be stricter than the source was.
   ========================================================================== */

/** send.php's own reply-to line and the number every failure message quotes. */
export const PHONE_TXT = '0800 098 2812';

/** tcform.js:3 — the endpoint. Static export: this is the legacy PHP file. */
export const ENDPOINT = '/api/enquiry';

/** tcform.js:4 — the client-side ceiling on one multipart POST. */
export const MAX_POST = 100 * 1024 * 1024;

/**
 * tcform.js:6. Deliberately loose: one or more non-space non-@ characters,
 * an @, the same again, a dot, then two-or-more ASCII letters. It accepts
 * plenty of addresses a stricter regex would reject and that is the point —
 * the real validation is that a human reads the enquiry.
 */
export const RX_MAIL = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;

/**
 * tcform.js:113. A UK outward+inward code with optional space. Note it is
 * only applied when a postcode field exists AND has been filled in — the
 * postcode is never required.
 */
export const RX_POSTCODE = /^[A-Za-z]{1,2}[0-9][0-9A-Za-z]?\s*[0-9][A-Za-z]{2}$/;

/** The five messages, byte for byte. The dashes are em dashes (U+2014). */
export const MSG = {
  name: 'Please tell us your name so we know who we are replying to.',
  reach:
    'Please leave an email address or a phone number so we can come back to you.',
  email: 'That email address does not look right — please check it.',
  phone: 'That phone number looks too short — please check it.',
  postcode: 'That postcode does not look right — please check it.',
  /* tcform.js:156–159 — one string, wrapped across three source lines. */
  oversize:
    'Your attachments come to over 100 MB together, which is more than the form can ' +
    'carry in one go. Please take a file or two off and send the largest to us on ' +
    'WhatsApp instead.',
  /* tcform.js:163 — note the ellipsis is U+2026, not three dots. */
  sending: 'Sending…',
  /* tcform.js:168 */
  failed:
    'Something went wrong sending that. Please call ' +
    PHONE_TXT +
    ' and we will take it down for you.',
} as const;

export type FieldName = 'name' | 'email' | 'phone' | 'postcode';

/**
 * The four fields `check()` looks for by `[name="…"]`.
 *
 * `undefined` models a field the form does not have at all, which is a real
 * distinction in the source: `q(f,'postcode')` returning null skips the
 * postcode rule entirely (tcform.js:113 tests `pc &&` before the value),
 * whereas an empty string would still be skipped but for the other reason.
 * The trade page's `.qform` has no postcode and no message; the enquiry card
 * has both.
 */
export interface ContactValues {
  name?: string;
  email?: string;
  phone?: string;
  postcode?: string;
}

export interface ValidationFailure {
  /** The field `check()` hands to `.focus()` — `bad.el` in tcform.js:142. */
  field: FieldName;
  /** Every field `mark(el,true)` is called on. Usually one; two for `reach`. */
  fields: FieldName[];
  message: string;
}

/** tcform.js:66 — `String(el.value||'').trim()`, with null reading as ''. */
function v(value: string | undefined): string {
  return typeof value === 'string' ? value.trim() : '';
}

/** tcform.js:67 — everything that is not 0-9 is thrown away. */
export function digits(s: string | undefined | null): string {
  return String(s ?? '').replace(/[^0-9]/g, '');
}

/**
 * The port of `check()`. Returns the FIRST failure or null.
 *
 * Order is load-bearing and matches the source exactly:
 *   1. name shorter than 2 characters (after trimming)
 *   2. neither an email nor a phone number
 *   3. an email that is present and does not match RX_MAIL
 *   4. a phone that is present and carries fewer than 9 digits
 *   5. a postcode field that exists, is filled, and does not match
 */
export function validate(values: ContactValues): ValidationFailure | null {
  const name = v(values.name);
  const mail = v(values.email);
  const tel = v(values.phone);

  if (name.length < 2) {
    return { field: 'name', fields: ['name'], message: MSG.name };
  }

  const hasMail = !!mail;
  const hasTel = !!tel;

  if (!hasMail && !hasTel) {
    /*
      tcform.js:108–109 marks BOTH and focuses `mail || tel` — the email
      element when the form has one, otherwise the phone element. A form
      with neither field cannot reach here in practice; `email` is the
      source's own first choice so it stays the default.
    */
    return {
      field: values.email === undefined && values.phone !== undefined
        ? 'phone'
        : 'email',
      fields: ['email', 'phone'],
      message: MSG.reach,
    };
  }

  if (hasMail && !RX_MAIL.test(mail)) {
    return { field: 'email', fields: ['email'], message: MSG.email };
  }

  /* Nine digits, not ten: 020 7946 0958 is ten, 0800 098 2812 is eleven,
     and a nine-digit local number with the leading zero dropped is real. */
  if (hasTel && digits(tel).length < 9) {
    return { field: 'phone', fields: ['phone'], message: MSG.phone };
  }

  /* `pc &&` first: a form without the field skips this rule outright. */
  if (values.postcode !== undefined) {
    const pc = v(values.postcode);
    if (pc && !RX_POSTCODE.test(pc)) {
      return { field: 'postcode', fields: ['postcode'], message: MSG.postcode };
    }
  }

  return null;
}

/**
 * tcform.js:10–13 — the site's own three device bands, which send.php prints
 * in the enquiry header ("Sent from a tablet (1024×768)"). These are NOT the
 * Tailwind screens: the middle band is called `tablet` here and `narrow` in
 * the design system, and the boundaries are ≤720 / ≤1120 / above.
 */
export function band(width: number): 'phone' | 'tablet' | 'desktop' {
  return width <= 720 ? 'phone' : width <= 1120 ? 'tablet' : 'desktop';
}

/**
 * tcform.js:14–19 — the label send.php prints as `form_name`, and the reason
 * the client can tell an enquiry card apart from a trade enquiry in his
 * inbox. Matched on the form's id first, then its class.
 *
 * ⚠️ `tradeForm` is in the source but no page carries it: /trade/ ships
 * `<form class="qform" id="qform">`, so a trade enquiry arrives labelled
 * "Quick enquiry form". Ported as found — the string set is the contract
 * with send.php, and changing which one /trade/ sends would change what
 * lands in the client's inbox.
 */
export function formKind(id: string, classNames: readonly string[]): string {
  if (id === 'ctaForm') return 'Enquiry card';
  if (id === 'tradeForm') return 'Trade account form';
  if (classNames.includes('qform')) return 'Quick enquiry form';
  return 'Form';
}

/** tcform.js:145 — the greeting uses the first whitespace-delimited word. */
export function firstName(name: string | undefined | null): string {
  return String(name ?? '')
    .trim()
    .split(/\s+/)[0];
}

/** tcform.js:136 — the success line, with or without a name to greet. */
export function sentMessage(name: string): string {
  return (
    (name ? 'Thank you ' + name + ', your' : 'Your') +
    ' enquiry is on its way. We reply within one working day.'
  );
}
