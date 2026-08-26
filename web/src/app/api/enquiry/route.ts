/**
 * POST /api/enquiry — the enquiry endpoint.
 *
 * This replaces the legacy `send.php`. That file was 464 lines of PHP doing
 * `mail()` with a hand-rolled MIME multipart, and it only survived the rewrite
 * because the app was built `output: 'export'`, which forbids route handlers.
 * The export target was chosen for SiteGround's Apache host; the moment the
 * deploy target became Vercel, both the constraint and the PHP went away.
 *
 * WHAT THIS DOES NOW, and what it deliberately does not.
 *
 * It accepts the same multipart body the forms already build (see
 * lib/form/payload.ts — unchanged, so nothing on the client had to move except
 * the URL), validates the fields the old endpoint treated as required, and
 * acknowledges. It does NOT send email.
 *
 * That is not an oversight. Delivery needs a transport this environment does
 * not have: PHP's `mail()` worked because it ran on the same box as the mail
 * server, and a serverless function has no sendmail. Wiring it up is a matter
 * of dropping a transport in below — the shape is already here — plus a
 * mailbox credential in the host's environment. Until that exists, an enquiry
 * is validated and logged rather than silently swallowed, so a demo shows the
 * real success and failure states instead of a fake one.
 *
 * THE FIELDS, carried over from send.php verbatim so nothing downstream has to
 * change when a transport is added:
 *   name email phone postcode message   the form's own inputs
 *   page page_title form_name device screen   stamped by buildPayload()
 *   journey estimate stone stone_link service   optional context
 * Any other string field is passed through, which is how the old endpoint
 * behaved (it printed unknown fields into the email rather than dropping them).
 */
import { NextResponse } from 'next/server';

/** Mirrors send.php's `$FILE_MAX`, and TC_UP's `MAXB` on the client. */
const FILE_MAX = 50 * 1024 * 1024;
const TOTAL_MAX = 50 * 1024 * 1024;

/** What the old endpoint refused to send without. */
const REQUIRED = ['name', 'email'] as const;

export interface EnquiryResult {
  ok: boolean;
  /** Present when ok is false: which fields were missing or wrong. */
  errors?: string[];
  /** Present when ok is true: what the server understood, for the demo. */
  received?: {
    fields: number;
    attachments: number;
    attachmentBytes: number;
    delivered: boolean;
  };
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(request: Request): Promise<NextResponse<EnquiryResult>> {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ ok: false, errors: ['Malformed request body.'] }, { status: 400 });
  }

  const errors: string[] = [];
  const fields: Record<string, string> = {};
  const files: File[] = [];
  let attachmentBytes = 0;

  for (const [key, value] of form.entries()) {
    if (typeof value === 'string') {
      fields[key] = value;
      continue;
    }
    // A File. iOS photographs arrive with no extension at all — send.php had a
    // whole comment about this (D439). Nothing here depends on the name, so it
    // is simply carried.
    if (value.size > FILE_MAX) {
      errors.push(`${value.name || 'A file'} is larger than 50 MB.`);
      continue;
    }
    attachmentBytes += value.size;
    files.push(value);
  }

  for (const key of REQUIRED) {
    if (!fields[key] || !fields[key].trim()) errors.push(`Missing: ${key}.`);
  }
  if (fields.email && !EMAIL.test(fields.email.trim())) {
    errors.push('That email address does not look right.');
  }
  if (attachmentBytes > TOTAL_MAX) {
    errors.push('Those files come to more than 50 MB in total.');
  }

  if (errors.length) {
    return NextResponse.json({ ok: false, errors }, { status: 422 });
  }

  // ---------------------------------------------------------------------
  // Delivery. Deliberately absent — see the header. A transport slots in
  // here, is handed `fields` and `files`, and sets `delivered`.
  // ---------------------------------------------------------------------
  const delivered = false;

  // Logged rather than dropped, so a demo enquiry is recoverable from the
  // host's function logs and it is obvious the endpoint really ran.
  console.info('[enquiry]', {
    at: new Date().toISOString(),
    from: fields.email,
    name: fields.name,
    form: fields.form_name,
    page: fields.page,
    device: fields.device,
    attachments: files.length,
    attachmentBytes,
    delivered,
  });

  return NextResponse.json({
    ok: true,
    received: {
      fields: Object.keys(fields).length,
      attachments: files.length,
      attachmentBytes,
      delivered,
    },
  });
}

/** The old endpoint answered GET with a self-test (`?selftest=1`). */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    ok: true,
    endpoint: 'enquiry',
    accepts: 'POST multipart/form-data',
    delivery: 'not configured — validated and logged only',
  });
}
