/* ==========================================================================
   Delivery.

   THE RECIPIENT IS FIXED. `info@topcatworktops.co.uk`, exactly as send.php
   hard-coded `$TO` and for the same reason: an enquiry endpoint that can be
   pointed anywhere by a request is an open relay. `ENQUIRY_TO` can override it
   for a staging run, and nothing else can.

   TWO WAYS OUT, tried in order, and the route tells the visitor the truth
   about which one worked:

     1. SMTP, from this process, via nodemailer. This is the real one — the
        site sends its own mail and depends on nothing else. It turns on the
        moment the host has credentials in its environment.
     2. The legacy `send.php` on the old host, which is still live and still
        mails the same inbox. It is the fallback so delivery cannot regress to
        nothing while (1) is unconfigured.

   NO CREDENTIAL IS EVER WRITTEN INTO THIS REPOSITORY. Everything below reads
   `process.env`. What Hannes needs to set is documented in .env.example.
   ========================================================================== */
import nodemailer from 'nodemailer';

import type { Attachment, ComposedEmail } from './compose';

export const DEFAULT_TO = 'info@topcatworktops.co.uk';

export type DeliveryVia = 'smtp' | 'forward' | 'none';

export interface DeliveryResult {
  delivered: boolean;
  via: DeliveryVia;
  error?: string;
  /** The message id an SMTP server gave back, for tracing a lost enquiry. */
  id?: string;
}

export function mailTo(): string {
  return (process.env.ENQUIRY_TO || DEFAULT_TO).trim();
}

/** True when the host has enough to send on its own. */
export function smtpConfigured(): boolean {
  return !!(process.env.SMTP_URL || (process.env.SMTP_HOST && process.env.SMTP_USER));
}

function transport() {
  if (process.env.SMTP_URL) return nodemailer.createTransport(process.env.SMTP_URL);
  const port = Number(process.env.SMTP_PORT || 587);
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    /* 465 is implicit TLS; 587 upgrades with STARTTLS. Getting this wrong is
       the usual cause of a hang rather than an error, so it is derived from
       the port instead of being another thing to set. */
    secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : port === 465,
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS ?? '' }
      : undefined,
  });
}

/**
 * Send by SMTP.
 *
 * `from` must be an address the SMTP account is allowed to send as, which is
 * why it is its own variable and defaults to the authenticating user rather
 * than to the visitor. The visitor is the `Reply-To`, so hitting reply in the
 * inbox still answers the customer — send.php made the same choice for the
 * same reason (its comment at line 414).
 */
export async function sendBySmtp(
  mail: ComposedEmail,
  attachments: Attachment[],
): Promise<DeliveryResult> {
  const from =
    process.env.SMTP_FROM ||
    (process.env.SMTP_USER ? `Topcat Worktops website <${process.env.SMTP_USER}>` : '');
  if (!from) return { delivered: false, via: 'smtp', error: 'no SMTP_FROM or SMTP_USER' };

  const info = await transport().sendMail({
    from,
    to: mailTo(),
    replyTo: mail.replyTo,
    subject: mail.subject,
    text: mail.text,
    html: mail.html,
    attachments: attachments.map((a) => ({
      filename: a.filename,
      content: a.content,
      contentType: a.contentType,
    })),
  });
  return { delivered: true, via: 'smtp', id: info.messageId };
}

/**
 * Hand the same multipart to the legacy endpoint.
 *
 * send.php is 464 lines of delivery that is still live and still mails the
 * right inbox — a sender ladder for a host whose `mail()` rejects unbranded
 * envelopes, MIME multipart, the iOS no-extension case, and a spill to
 * download links over 12 MB. While SMTP is unconfigured this keeps enquiries
 * arriving instead of nowhere.
 */
export async function sendByForward(
  fields: Record<string, string>,
  files: { field: string; file: File }[],
  url: string,
): Promise<DeliveryResult> {
  const out = new FormData();
  for (const [k, v] of Object.entries(fields)) out.append(k, v);
  for (const { field, file } of files) out.append(field, file, file.name || field);

  const upstream = await fetch(url, { method: 'POST', body: out });
  const raw = await upstream.text();
  let parsed: { ok?: boolean; error?: string } | null = null;
  try {
    parsed = JSON.parse(raw) as { ok?: boolean; error?: string };
  } catch {
    /* It answers JSON; anything else is a host-level failure page. */
  }
  if (upstream.ok && parsed?.ok === true) return { delivered: true, via: 'forward' };
  return {
    delivered: false,
    via: 'forward',
    error: parsed?.error ?? `upstream ${upstream.status}`,
  };
}

/**
 * The confirmation the CUSTOMER gets back.
 *
 * BEST EFFORT, ALWAYS. It is sent after the enquiry itself and its failure is
 * swallowed: the enquiry reaching the office is what matters, and a bounced
 * courtesy email must never turn a delivered enquiry into an error the
 * visitor sees.
 *
 * ⚠️ SMTP ONLY. The legacy send.php fallback cannot do this — its own
 * autoreply is commented out in that file, and this route has no transport of
 * its own until SMTP is configured. Set the credentials in .env.example and
 * customers start being confirmed.
 */
export async function sendAutoReply(mail: ComposedEmail, to: string): Promise<boolean> {
  if (!smtpConfigured() || !to) return false;
  const from =
    process.env.SMTP_FROM ||
    (process.env.SMTP_USER ? `Topcat Worktops <${process.env.SMTP_USER}>` : '');
  if (!from) return false;
  try {
    await transport().sendMail({
      from,
      to,
      /* A reply to the confirmation should reach a person, not the robot. */
      replyTo: mailTo(),
      subject: mail.subject,
      text: mail.text,
      html: mail.html,
    });
    return true;
  } catch {
    return false;
  }
}
