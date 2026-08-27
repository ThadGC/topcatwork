/**
 * POST /api/enquiry — the enquiry endpoint. It sends the email.
 *
 * ⚠️ THIS COMMENT WAS WRONG FOR MOST OF 27 Aug. It said "It does NOT send
 * email... a serverless function has no sendmail", which stopped being true in
 * 631744b when forwarding was added, and a handoff copied the stale claim into
 * its launch blockers. If you change the delivery here, change this too.
 *
 * WHERE IT GOES: info@topcatworktops.co.uk, fixed. `ENQUIRY_TO` can point a
 * staging run somewhere else; a request cannot. See lib/mail/send.ts.
 *
 * HOW IT GETS THERE, in order, first one that works:
 *   1. SMTP from this process (nodemailer), composing the email here — the
 *      real path, live as soon as the host environment has credentials.
 *   2. The legacy send.php on the old host, handed the same multipart. Still
 *      live, still mails the same inbox; the fallback so that delivery cannot
 *      silently become nothing while (1) is unconfigured.
 *   3. Nothing — and then the visitor is TOLD, with a 502. A form that says
 *      "your enquiry is on its way" while dropping it is the one outcome this
 *      route must never produce.
 *
 * WHAT IS IN THE EMAIL — lib/mail/compose.ts, a port of send.php's builder:
 *   name email phone postcode message service   the form's own inputs
 *   form_name                                   WHICH form they filled in
 *   stone stone_link                            the stone they had selected
 *   estimate                                    material, slabs, extras, the
 *                                               range shown, or the POA path
 *   journey                                     what they did, step by step,
 *                                               with pages, dwell and visits
 *   page page_title device screen                where from, and on what
 *   file1…fileN                                 attached, as real attachments
 * Any other string field is passed through as its own row, which is how the
 * old endpoint behaved.
 */
import { NextResponse } from 'next/server';

import { composeEnquiry, type Attachment } from '@/lib/mail/compose';
import { mailTo, sendByForward, sendBySmtp, smtpConfigured } from '@/lib/mail/send';

/* Buffers and a TCP socket — this cannot run on the edge runtime. */
export const runtime = 'nodejs';
/* An enquiry is never cached. */
export const dynamic = 'force-dynamic';

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
    /** 'smtp' | 'forward' | 'none' — which way it actually went out. */
    via?: string;
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
  const files: { field: string; file: File }[] = [];
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
    /* The field NAME matters: send.php reads file1..fileN (uploads.ts:161). */
    files.push({ field: key, file: value });
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
  // Delivery. SMTP first, the legacy endpoint second, and an honest failure
  // third. See the header, and lib/mail/send.ts.
  // ---------------------------------------------------------------------
  const FORWARD_URL =
    process.env.ENQUIRY_FORWARD_URL ?? 'https://thadeusg3.sg-host.com/send.php';

  /* The files, read once, as real attachments. */
  const attachments: Attachment[] = [];
  for (const { file } of files) {
    attachments.push({
      /* iOS photographs arrive with no name and no extension at all — send.php
         had a whole comment about this (D439). Give it one so the attachment
         is openable rather than a nameless blob. */
      filename: file.name || `attachment-${attachments.length + 1}.jpg`,
      size: file.size,
      contentType: file.type || 'application/octet-stream',
      content: Buffer.from(await file.arrayBuffer()),
    });
  }

  const mail = composeEnquiry({ fields, attachments });

  let delivered = false;
  let via: string = 'none';
  let deliveryError: string | null = null;

  if (smtpConfigured()) {
    try {
      const r = await sendBySmtp(mail, attachments);
      delivered = r.delivered;
      via = r.via;
      deliveryError = r.error ?? null;
    } catch (e) {
      deliveryError = e instanceof Error ? e.message : String(e);
    }
  }

  /* Not `else` — if SMTP is configured but fails on this request, the enquiry
     is still worth more than the error. Fall through and try the old host. */
  if (!delivered && FORWARD_URL) {
    try {
      const r = await sendByForward(fields, files, FORWARD_URL);
      if (r.delivered) {
        delivered = true;
        via = r.via;
        deliveryError = null;
      } else {
        deliveryError = [deliveryError, r.error].filter(Boolean).join('; ');
      }
    } catch (e) {
      deliveryError = [deliveryError, e instanceof Error ? e.message : String(e)]
        .filter(Boolean)
        .join('; ');
    }
  }

  /*
    A visitor must never be told "we have your details" when nothing was sent.
    useEnquiryForm shows the thank-you panel on a 2xx, so a failed delivery has
    to be a non-2xx here or the old lie comes straight back.

    The one case that is allowed through is local development with delivery
    deliberately switched off (ENQUIRY_FORWARD_URL=""), so the forms can be
    worked on without mailing anyone.
  */
  const deliveryOff = !smtpConfigured() && !FORWARD_URL;
  if (!delivered && !deliveryOff) {
    console.error('[enquiry] delivery failed', { to: mailTo(), via, deliveryError });
    return NextResponse.json(
      {
        ok: false,
        errors: [
          'We could not send that just now. Please call 0800 098 2812 and we will take it down.',
        ],
      },
      { status: 502 },
    );
  }

  console.info('[enquiry]', {
    at: new Date().toISOString(),
    to: mailTo(),
    via,
    from: fields.email,
    name: fields.name,
    form: fields.form_name,
    page: fields.page,
    stone: fields.stone,
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
      via,
    },
  });
}

/** The old endpoint answered GET with a self-test (`?selftest=1`). */
export async function GET(): Promise<NextResponse> {
  const forward = process.env.ENQUIRY_FORWARD_URL ?? 'https://thadeusg3.sg-host.com/send.php';
  return NextResponse.json({
    ok: true,
    endpoint: 'enquiry',
    accepts: 'POST multipart/form-data',
    to: mailTo(),
    /* Reports configuration only. It does NOT send a test message — the
       legacy `send.php?selftest=1` did, which is worth knowing before you
       poke it. */
    delivery: smtpConfigured() ? 'smtp' : forward ? 'forward to legacy send.php' : 'off',
  });
}
