/* ==========================================================================
   The enquiry email, composed here rather than by a PHP file on another host.

   This is a port of send.php's email builder (lines 196–345 of the legacy
   file, which is still the reference in ~/Documents/TOPCAT WORKTOPS). Every
   section it produced is produced here, in the same order and the same
   palette, because the client already reads these emails and the layout is
   the one he knows:

     the contact rows      name, email, phone, postcode, service, stone,
                           stone link, then ANY other field the form carried
     Message
     Their estimate        material, stone, pieces, slabs, extras, range —
                           or "Priced by hand (POA path)"
     Their files           attached, with sizes
     Their visit at a glance   device, first seen, visits, time on site,
                           pages viewed, came from
     Pages they viewed     with per-page dwell
     What they did, step by step   the trail, most recent 60

   PURE. Nothing here touches the network, the filesystem or `process.env`, so
   the whole email can be asserted in a unit test — see compose.test.ts.
   ========================================================================== */

/** send.php:44–51 — the palette the client's inbox already shows. */
const INK = '#0B0B0E';
const BONE = '#F4F1EA';
const SEAM = '#E3DCCB';
const ROWLN = '#EFEAE0';
const GOLD = '#C6A664';
const TEXT = '#1B1B18';
const MUTE = '#8A857A';
const LINK = '#8A6D3B';

/** send.php's `$GAP` — the silence that separates one visit from the next. */
const GAP = 30 * 60 * 1000;

export interface JourneyEvent {
  k?: string;
  v?: string;
  s?: string;
  p?: string;
  at?: number;
}
export interface Journey {
  started?: number;
  ev?: JourneyEvent[];
}
export interface Attachment {
  filename: string;
  size: number;
  content: Buffer;
  contentType?: string;
}

export function h(s: unknown): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** send.php:212–216. */
export function humanMs(ms: number): string {
  const s = Math.round(ms / 1000);
  if (s < 60) return s + ' sec';
  if (s < 3600) return Math.round(s / 60) + ' min';
  return Math.floor(s / 3600) + ' h ' + Math.round((s % 3600) / 60) + ' min';
}

export function humanBytes(n: number): string {
  return (n / 1048576).toFixed(1) + ' MB';
}

/** send.php:237–253 — one line of the trail, in the client's own phrasing. */
export function evLine(e: JourneyEvent): string {
  const k = String(e.k ?? '');
  const v = String(e.v ?? '');
  const s = String(e.s ?? '');
  const p = String(e.p ?? '');
  switch (k) {
    case 'Viewed':
      return 'Viewed ' + v;
    case 'Left':
      return 'Left ' + v;
    case 'Arrived':
      return 'Arrived from ' + (v === 'direct' ? 'a direct visit' : v);
    case 'Estimator material':
      return 'Estimator: switched to ' + v;
    case 'Estimator stone':
      return 'Estimator: chose ' + v;
    case 'Clicked': {
      let t = 'Clicked "' + v + '"';
      if (s !== '') t += ' in ' + s;
      if (p !== '') t += ' on ' + p;
      return t;
    }
    default:
      return (k + ' ' + v).trim();
  }
}

export interface JourneySummary {
  events: JourneyEvent[];
  visits: number;
  spentMs: number;
  pageOrder: string[];
  pageDwell: Record<string, number>;
  firstSeen: string;
  cameFrom: string;
  /** [clock, what happened], consecutive duplicates dropped. */
  lines: [string, string][];
}

/** `date('j M, H:i')` / `date('H:i')`, in the site's own timezone. */
function stamp(ms: number, withDate: boolean): string {
  const d = new Date(ms);
  const opts: Intl.DateTimeFormatOptions = withDate
    ? { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false }
    : { hour: '2-digit', minute: '2-digit', hour12: false };
  return new Intl.DateTimeFormat('en-GB', { ...opts, timeZone: 'Europe/London' })
    .format(d)
    .replace(',', '');
}

/** send.php:199–235 — everything the trail can honestly be asked. */
export function summariseJourney(journey: Journey | null): JourneySummary {
  const empty: JourneySummary = {
    events: [], visits: 0, spentMs: 0, pageOrder: [], pageDwell: {},
    firstSeen: '', cameFrom: '', lines: [],
  };
  if (!journey || !Array.isArray(journey.ev)) return empty;

  const events = journey.ev
    .slice(-150)
    .filter((e): e is JourneyEvent => !!e && typeof e === 'object' && typeof e.at === 'number')
    .sort((a, b) => (a.at as number) - (b.at as number));
  if (!events.length) return empty;

  let visits = 0;
  let spentMs = 0;
  let spanStart: number | null = null;
  let prevAt: number | null = null;
  for (const e of events) {
    const at = e.at as number;
    if (prevAt === null || at - prevAt > GAP) {
      visits++;
      if (spanStart !== null && prevAt !== null) spentMs += prevAt - spanStart;
      spanStart = at;
    }
    prevAt = at;
  }
  if (spanStart !== null && prevAt !== null) spentMs += prevAt - spanStart;

  /* A `Viewed` owns the time to the next event, capped at the visit gap. */
  const pageDwell: Record<string, number> = {};
  const pageOrder: string[] = [];
  for (let i = 0; i < events.length; i++) {
    const e = events[i];
    if (e.k !== 'Viewed') continue;
    const path = String(e.v ?? '');
    if (!path) continue;
    let d = 0;
    const next = events[i + 1];
    if (next) d = Math.min((next.at as number) - (e.at as number), GAP);
    if (!(path in pageDwell)) {
      pageDwell[path] = 0;
      pageOrder.push(path);
    }
    pageDwell[path] += Math.max(d, 0);
  }

  const lines: [string, string][] = [];
  let prev = '';
  for (const e of events) {
    const t = evLine(e);
    if (t === '' || t === prev) continue;
    lines.push([stamp(e.at as number, false), t]);
    prev = t;
  }

  return {
    events,
    visits,
    spentMs,
    pageOrder,
    pageDwell,
    firstSeen: typeof journey.started === 'number' ? stamp(journey.started, true) : '',
    cameFrom: String(events.find((e) => e.k === 'Arrived')?.v ?? ''),
    lines,
  };
}

/* --- the table ---------------------------------------------------------- */

const row = (label: string, value: string): string =>
  '<tr>' +
  `<td style="padding:13px 18px;background:${BONE};border-right:1px solid ${SEAM};border-bottom:1px solid ${ROWLN};color:${MUTE};font:600 10.5px/1.6 Arial,Helvetica,sans-serif;letter-spacing:0.1em;text-transform:uppercase;width:31%;vertical-align:top">${h(label)}</td>` +
  `<td style="padding:13px 18px;background:#FFFFFF;border-bottom:1px solid ${ROWLN};color:${TEXT};font:400 14.5px/1.6 Arial,Helvetica,sans-serif;vertical-align:top">${value}</td></tr>`;

const section = (t: string): string =>
  `<tr><td colspan="2" style="padding:30px 18px 10px;background:#FFFFFF;border-bottom:1px solid ${ROWLN};color:${GOLD};font:700 12px/1.4 Arial,Helvetica,sans-serif;letter-spacing:0.18em;text-transform:uppercase">${h(t)}</td></tr>`;

const wide = (html: string): string =>
  `<tr><td colspan="2" style="padding:14px 18px 18px;background:#FFFFFF;color:${TEXT};font:400 14.5px/1.7 Arial,Helvetica,sans-serif">${html}</td></tr>`;

/** send.php:286 — every field the form carried that has no row of its own. */
const KNOWN = new Set([
  'name', 'email', 'phone', 'postcode', 'service', 'stone', 'stone_link', 'message',
  'page', 'page_title', 'form_name', 'device', 'screen', 'journey', 'estimate', 'sent_at',
]);

export interface EnquiryEstimate {
  mat?: string;
  stone?: string;
  poa?: boolean;
  pieces?: unknown[];
  slabs?: number | string;
  island?: boolean;
  extras?: unknown[];
  lo?: number;
  hi?: number;
}

export interface ComposedEmail {
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}

export function composeEnquiry(opts: {
  fields: Record<string, string>;
  attachments?: Attachment[];
  now?: number;
}): ComposedEmail {
  const f = opts.fields;
  const attachments = opts.attachments ?? [];
  const get = (k: string) => (f[k] ?? '').trim();

  const name = get('name');
  const email = get('email');
  const phone = get('phone');
  const postcode = get('postcode');
  const service = get('service');
  const stone = get('stone');
  const stoneLink = get('stone_link');
  const message = get('message');
  const formName = get('form_name');
  const device = get('device');
  const screen = get('screen');

  let journey: Journey | null = null;
  let estimate: EnquiryEstimate | null = null;
  try {
    journey = f.journey ? (JSON.parse(f.journey) as Journey) : null;
  } catch {
    /* A broken trail must never cost the enquiry. send.php swallowed it too. */
  }
  try {
    estimate = f.estimate ? (JSON.parse(f.estimate) as EnquiryEstimate) : null;
  } catch {
    /* ditto */
  }
  const j = summariseJourney(journey);

  /* --- rows ------------------------------------------------------------ */
  let rows = '';
  rows += row('Name', h(name));
  if (email) rows += row('Email', `<a href="mailto:${h(email)}" style="color:${LINK}">${h(email)}</a>`);
  if (phone)
    rows += row('Phone', `<a href="tel:${h(phone.replace(/[^0-9+]/g, ''))}" style="color:${LINK}">${h(phone)}</a>`);
  if (postcode) rows += row('Postcode', h(postcode));
  if (service) rows += row('Service', h(service));
  /* Named, not just 'Stone'. There can be a second stone further down — the
     one they priced in the estimator — and the two are different facts. */
  if (stone) rows += row('Stone they asked about', h(stone));
  if (stoneLink) rows += row('Stone link', `<a href="${h(stoneLink)}" style="color:${LINK}">${h(stoneLink)}</a>`);

  /* Which form, and where from — the client asked for this by name. It was
     in send.php's footer; it is a row here so it cannot be missed. */
  if (formName) rows += row('Form', h(formName));
  const page = get('page');
  const pageTitle = get('page_title');
  if (page) rows += row('Sent from', h(pageTitle ? `${pageTitle} — ${page}` : page));

  for (const [k, v] of Object.entries(f)) {
    if (KNOWN.has(k) || typeof v !== 'string' || !v.trim()) continue;
    rows += row(k.slice(0, 40).replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase()), h(v.trim().slice(0, 500)));
  }

  if (message) {
    rows += section('Message');
    rows += wide(h(message).replace(/\r?\n/g, '<br>'));
  }

  if (estimate && estimate.stone) {
    /*
      ⛔ THE TWO STONES ARE DIFFERENT FACTS AND THE EMAIL MUST SAY SO.

      The stone at the top is the one the enquiry is about. The stone here is
      the one they ran through the estimator, which may well be another. Left
      as two rows both labelled "Stone" it reads as a contradiction, and the
      client's first question on seeing one was which of them the customer
      actually wanted.

      This section only exists at all when they really used the estimator —
      see the guard in Estimator.tsx. No section means they did not touch it.
    */
    const priced = estimate.stone.trim();
    const asked = stone.trim();
    const same = !asked || priced.toLowerCase() === asked.toLowerCase();
    rows += section('Their estimate');
    if (!same) {
      rows += wide(
        `<span style="color:${MUTE}">They priced a different stone from the one their enquiry names. ` +
          `The enquiry is about <b style="color:${INK}">${h(asked)}</b>; the figures below are for ` +
          `<b style="color:${INK}">${h(priced)}</b>.</span>`,
      );
    }
    rows += row('Material', h(estimate.mat ?? ''));
    rows += row(same ? 'Stone priced' : 'Stone priced (not the one above)', h(estimate.stone));
    if (estimate.poa) {
      rows += row('Price', 'Priced by hand (POA path)');
    } else {
      if (Array.isArray(estimate.pieces) && estimate.pieces.length)
        rows += row('Pieces', estimate.pieces.slice(0, 12).map((x) => h(String(x))).join('<br>'));
      if (estimate.slabs != null)
        rows += row('Slabs', h(String(estimate.slabs)) + (estimate.island ? ' · with island' : ''));
      if (Array.isArray(estimate.extras) && estimate.extras.length)
        rows += row('Extras', h(estimate.extras.map(String).join(' · ')));
      if (typeof estimate.lo === 'number' && typeof estimate.hi === 'number')
        rows += row(
          'Range shown',
          `<b>£${Math.round(estimate.lo).toLocaleString('en-GB')} to £${Math.round(estimate.hi).toLocaleString('en-GB')}</b>`,
        );
    }
  }

  if (attachments.length) {
    rows += section('Their files — attached');
    for (const a of attachments) rows += row(a.filename, humanBytes(a.size));
  }

  if (j.events.length) {
    rows += section('Their visit at a glance');
    /* Stated either way, so its absence is never read as data missing. */
    rows += row(
      'Estimator',
      estimate && estimate.stone
        ? 'Used it' + (estimate.stone ? ', on ' + h(estimate.stone) : '')
        : 'Did not use it',
    );
    if (device) rows += row('Device', device.replace(/^./, (c) => c.toUpperCase()) + (screen ? ' · ' + h(screen) : ''));
    if (j.firstSeen) rows += row('First seen', h(j.firstSeen));
    rows += row('Visits', j.visits + (j.visits === 1 ? ' visit' : ' visits'));
    if (j.spentMs > 0) rows += row('Time on site', h(humanMs(j.spentMs)) + (j.visits > 1 ? ' across the visits' : ''));
    rows += row('Pages viewed', j.pageOrder.length + ' ' + (j.pageOrder.length === 1 ? 'page' : 'different pages'));
    if (j.cameFrom) rows += row('Came from', h(j.cameFrom === 'direct' ? 'a direct visit' : j.cameFrom));

    if (j.pageOrder.length) {
      rows += section('Pages they viewed');
      for (const path of j.pageOrder.slice(0, 14))
        rows += row(path === '/' ? '/ (home)' : path, j.pageDwell[path] >= 5000 ? 'about ' + humanMs(j.pageDwell[path]) : 'a glance');
      if (j.pageOrder.length > 14) rows += row('…', '+' + (j.pageOrder.length - 14) + ' more');
    }

    rows += section('What they did, step by step');
    for (const l of j.lines.slice(-60)) rows += row(l[0], h(l[1]));
  } else if (device) {
    /* No trail (a visitor with storage blocked) — still say what we know. */
    rows += section('Their visit at a glance');
    rows += row('Device', device.replace(/^./, (c) => c.toUpperCase()) + (screen ? ' · ' + h(screen) : ''));
  }

  const subject = 'New enquiry — ' + name + (postcode ? ' (' + postcode + ')' : '') + (formName ? ' · ' + formName : '');

  const html =
    `<!doctype html><html><body style="margin:0;padding:24px 0;background:${INK}">` +
    `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${INK}"><tr><td align="center">` +
    `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="640" style="width:640px;max-width:96%;background:#FFFFFF;border-radius:4px;overflow:hidden">` +
    `<tr><td style="padding:22px 18px;background:${INK};color:${GOLD};font:700 13px/1.4 Arial,Helvetica,sans-serif;letter-spacing:0.22em;text-transform:uppercase">Topcat Worktops — new enquiry</td></tr>` +
    `<tr><td style="padding:0"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">${rows}</table></td></tr>` +
    `<tr><td style="padding:18px;background:${BONE};color:${MUTE};font:400 11.5px/1.6 Arial,Helvetica,sans-serif">Sent by the Topcat Worktops website. Reply to this email and it goes straight to ${h(email || 'the sender')}.</td></tr>` +
    `</table></td></tr></table></body></html>`;

  /* A text/plain alternative, so the enquiry is readable in any client and
     does not score as an HTML-only email. */
  const t: string[] = [];
  t.push('NEW ENQUIRY — ' + name);
  if (formName) t.push('Form: ' + formName);
  if (email) t.push('Email: ' + email);
  if (phone) t.push('Phone: ' + phone);
  if (postcode) t.push('Postcode: ' + postcode);
  if (service) t.push('Service: ' + service);
  if (stone) t.push('Stone: ' + stone);
  if (stoneLink) t.push('Stone link: ' + stoneLink);
  if (page) t.push('Sent from: ' + (pageTitle ? pageTitle + ' — ' + page : page));
  if (device) t.push('Device: ' + device + (screen ? ' · ' + screen : ''));
  if (message) t.push('', 'Message:', message);
  if (estimate && estimate.stone) {
    t.push('', 'Their estimate:');
    t.push('  Material: ' + (estimate.mat ?? ''));
    t.push('  Stone: ' + estimate.stone);
    if (estimate.poa) t.push('  Price: Priced by hand (POA path)');
    else if (typeof estimate.lo === 'number' && typeof estimate.hi === 'number')
      t.push(`  Range shown: £${Math.round(estimate.lo).toLocaleString('en-GB')} – £${Math.round(estimate.hi).toLocaleString('en-GB')}`);
  }
  if (attachments.length) {
    t.push('', 'Files attached:');
    for (const a of attachments) t.push('  ' + a.filename + ' (' + humanBytes(a.size) + ')');
  }
  if (j.lines.length) {
    t.push('', 'What they did:');
    for (const l of j.lines.slice(-60)) t.push('  ' + l[0] + '  ' + l[1]);
  }

  return { subject, html, text: t.join('\n'), replyTo: email || undefined };
}

/* --------------------------------------------------------------------------
   THE AUTOREPLY — what the customer gets back.

   New on 27 Aug 2026, at the client's request: "we need to craft an email that
   the client receives ... just saying we've received your inquiry for these
   details, we will get back to you shortly, thank you for contacting Topcat
   Worktops."

   ⚠️ THIS REVERSES AN EARLIER DECISION. send.php has an autoreply written and
   commented out, with the note "WRITTEN AND SWITCHED OFF, his instruction". It
   is on again, here.

   NO EM DASHES, and no en dashes used as punctuation, anywhere in the copy
   below. The client asked for that specifically. Sentences are separated with
   full stops and commas instead.
   -------------------------------------------------------------------------- */

/** tcform.js:145 — the greeting uses the first whitespace-delimited word. */
function firstWord(name: string): string {
  return String(name ?? '').trim().split(/\s+/)[0] ?? '';
}

export function composeAutoReply(opts: {
  fields: Record<string, string>;
  attachments?: Attachment[];
}): ComposedEmail {
  const f = opts.fields;
  const get = (k: string) => (f[k] ?? '').trim();
  const attachments = opts.attachments ?? [];

  const name = get('name');
  const hi = firstWord(name);

  /* Only what they actually gave us, echoed back so they can check it. */
  const detail: [string, string][] = [];
  if (name) detail.push(['Name', name]);
  if (get('email')) detail.push(['Email', get('email')]);
  if (get('phone')) detail.push(['Phone', get('phone')]);
  if (get('postcode')) detail.push(['Postcode', get('postcode')]);
  if (get('service')) detail.push(['What you need', get('service')]);
  if (get('stone')) detail.push(['Stone', get('stone')]);
  if (get('message')) detail.push(['Your message', get('message')]);
  if (attachments.length)
    detail.push([
      attachments.length === 1 ? 'File attached' : 'Files attached',
      attachments.map((a) => a.filename).join(', '),
    ]);

  const rows = detail
    .map(([k, v]) =>
      `<tr><td style="padding:11px 18px;background:${BONE};border-right:1px solid ${SEAM};border-bottom:1px solid ${ROWLN};color:${MUTE};font:600 10.5px/1.6 Arial,Helvetica,sans-serif;letter-spacing:0.1em;text-transform:uppercase;width:34%;vertical-align:top">${h(k)}</td>` +
      `<td style="padding:11px 18px;background:#FFFFFF;border-bottom:1px solid ${ROWLN};color:${TEXT};font:400 14.5px/1.6 Arial,Helvetica,sans-serif;vertical-align:top">${h(v).replace(/\r?\n/g, '<br>')}</td></tr>`,
    )
    .join('');

  const subject = 'Thank you for contacting Topcat Worktops';

  const html =
    `<!doctype html><html><body style="margin:0;padding:24px 0;background:${INK}">` +
    `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${INK}"><tr><td align="center">` +
    `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px;max-width:96%;background:#FFFFFF;border-radius:4px;overflow:hidden">` +
    `<tr><td style="padding:22px 18px;background:${INK};color:${GOLD};font:700 13px/1.4 Arial,Helvetica,sans-serif;letter-spacing:0.22em;text-transform:uppercase">Topcat Worktops</td></tr>` +
    `<tr><td style="padding:26px 18px 6px;background:#FFFFFF;color:${TEXT};font:400 15px/1.7 Arial,Helvetica,sans-serif">` +
    (hi ? `<p style="margin:0 0 14px">Hi ${h(hi)},</p>` : '') +
    `<p style="margin:0 0 14px">Thank you for contacting Topcat Worktops. We have received your enquiry and someone from our team will get back to you shortly, always within one working day.</p>` +
    `<p style="margin:0 0 4px">These are the details you sent us.</p></td></tr>` +
    (rows
      ? `<tr><td style="padding:14px 0 0"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">${rows}</table></td></tr>`
      : '') +
    `<tr><td style="padding:22px 18px 26px;background:#FFFFFF;color:${TEXT};font:400 15px/1.7 Arial,Helvetica,sans-serif">` +
    `<p style="margin:0 0 14px">If anything above is not right, reply to this email and we will put it straight. If it is urgent, call us free on <a href="tel:+448000982812" style="color:${LINK}">0800 098 2812</a>.</p>` +
    `<p style="margin:0">Thank you again,<br>Topcat Worktops</p></td></tr>` +
    `<tr><td style="padding:16px 18px;background:${BONE};color:${MUTE};font:400 11.5px/1.7 Arial,Helvetica,sans-serif">` +
    `0800 098 2812 &nbsp;&middot;&nbsp; <a href="mailto:info@topcatworktops.co.uk" style="color:${LINK}">info@topcatworktops.co.uk</a><br>` +
    `This is an automatic confirmation. You do not need to do anything else.</td></tr>` +
    `</table></td></tr></table></body></html>`;

  const t: string[] = [];
  if (hi) t.push(`Hi ${hi},`, '');
  t.push('Thank you for contacting Topcat Worktops. We have received your enquiry and someone from our team will get back to you shortly, always within one working day.', '');
  if (detail.length) {
    t.push('These are the details you sent us.', '');
    for (const [k, v] of detail) t.push(`${k}: ${v}`);
    t.push('');
  }
  t.push('If anything above is not right, reply to this email and we will put it straight. If it is urgent, call us free on 0800 098 2812.', '');
  t.push('Thank you again,', 'Topcat Worktops', '0800 098 2812', 'info@topcatworktops.co.uk');

  return { subject, html, text: t.join('\n') };
}
