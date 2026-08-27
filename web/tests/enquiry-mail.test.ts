// @vitest-environment node
/* ==========================================================================
   The enquiry email, end to end through the route — WITHOUT mailing anyone.

   The client, 27 Aug: "all the information and data as we've spoken about
   before gets sent through — what the person did, which form they filled in,
   which stone they were looking at and selected, and all the data we can
   possibly need has to go there. And if they've attached any files, the files
   have to go through."

   So each of those is an assertion here, on a realistic payload built the way
   a real submission builds one.
   ========================================================================== */
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { composeAutoReply, composeEnquiry, evLine, humanMs, summariseJourney } from '@/lib/mail/compose';

const T0 = Date.UTC(2026, 7, 27, 9, 0, 0);

/** The trail a real visitor leaves: two visits, four pages, the estimator. */
const JOURNEY = {
  started: T0,
  ev: [
    { k: 'Arrived', v: 'google.com', at: T0 },
    { k: 'Viewed', v: '/', at: T0 + 1_000 },
    { k: 'Clicked', v: 'Get a quote', s: 'hero', p: '/', at: T0 + 21_000 },
    { k: 'Viewed', v: '/estimate', at: T0 + 40_000 },
    { k: 'Estimator material', v: 'Marble', at: T0 + 51_000 },
    { k: 'Estimator stone', v: 'Carrara Honed', at: T0 + 61_000 },
    { k: 'Viewed', v: '/projects', at: T0 + 120_000 },
    /* a gap longer than 30 min — a second visit */
    { k: 'Viewed', v: '/contact', at: T0 + 3 * 3600_000 },
    { k: 'Left', v: '/contact', at: T0 + 3 * 3600_000 + 30_000 },
  ],
};

const ESTIMATE = {
  mat: 'Quartz',
  stone: 'Calacatta Gold',
  pieces: ['3000 × 600', '1200 × 600'],
  slabs: 2,
  island: true,
  extras: ['Drainer grooves', 'Upstands'],
  lo: 3200,
  hi: 3900,
};

function fields(over: Record<string, string> = {}): Record<string, string> {
  return {
    name: 'Jane Cooper',
    email: 'jane@example.com',
    phone: '07700 900123',
    postcode: 'HP1 2AB',
    message: 'Two runs and an island.\nCan you template next week?',
    form_name: 'Enquiry card',
    page: '/',
    page_title: 'Kitchen Worktops',
    device: 'desktop',
    screen: '1440×900',
    stone: 'Calacatta Gold · Quartz',
    stone_link: 'https://example.com/a-slab',
    journey: JSON.stringify(JOURNEY),
    estimate: JSON.stringify(ESTIMATE),
    ...over,
  };
}

describe('the trail, read the way send.php read it', () => {
  it('counts a 30-minute silence as a second visit', () => {
    expect(summariseJourney(JOURNEY).visits).toBe(2);
  });

  it('orders the pages and gives each one its dwell', () => {
    const j = summariseJourney(JOURNEY);
    expect(j.pageOrder).toEqual(['/', '/estimate', '/projects', '/contact']);
    // send.php:222 — a Viewed owns the time to the NEXT EVENT, not to the next
    // Viewed. '/' is viewed at +1s and the click lands at +21s, so 20s.
    expect(j.pageDwell['/']).toBe(20_000);
    // '/estimate' at +40s, next event (the material switch) at +51s.
    expect(j.pageDwell['/estimate']).toBe(11_000);
  });

  it('names where they came from', () => {
    expect(summariseJourney(JOURNEY).cameFrom).toBe('google.com');
  });

  it('phrases each kind of event the way the client reads them', () => {
    expect(evLine({ k: 'Arrived', v: 'direct' })).toBe('Arrived from a direct visit');
    expect(evLine({ k: 'Estimator stone', v: 'Carrara Honed' })).toBe('Estimator: chose Carrara Honed');
    expect(evLine({ k: 'Clicked', v: 'Get a quote', s: 'hero', p: '/' })).toBe(
      'Clicked "Get a quote" in hero on /',
    );
  });

  it('drops a repeated line rather than printing it twice', () => {
    const j = summariseJourney({
      started: T0,
      ev: [
        { k: 'Viewed', v: '/', at: T0 },
        { k: 'Viewed', v: '/', at: T0 + 1000 },
        { k: 'Viewed', v: '/estimate', at: T0 + 2000 },
      ],
    });
    expect(j.lines.map((l) => l[1])).toEqual(['Viewed /', 'Viewed /estimate']);
  });

  it('reads a duration the way a person says it', () => {
    expect(humanMs(45_000)).toBe('45 sec');
    expect(humanMs(5 * 60_000)).toBe('5 min');
    expect(humanMs(3 * 3600_000 + 30 * 60_000)).toBe('3 h 30 min');
  });

  it('survives a corrupt trail instead of losing the enquiry', () => {
    const mail = composeEnquiry({ fields: fields({ journey: '{not json' }) });
    expect(mail.subject).toContain('Jane Cooper');
  });
});

describe('the email carries everything the client asked for', () => {
  const mail = composeEnquiry({
    fields: fields(),
    attachments: [
      { filename: 'plans.pdf', size: 2_100_000, content: Buffer.from('x'), contentType: 'application/pdf' },
      { filename: 'kitchen.jpg', size: 900_000, content: Buffer.from('y'), contentType: 'image/jpeg' },
    ],
  });

  it('says who it is from, in the subject', () => {
    expect(mail.subject).toBe('New enquiry — Jane Cooper (HP1 2AB) · Enquiry card');
  });

  it('replies to the customer, not to the website', () => {
    expect(mail.replyTo).toBe('jane@example.com');
  });

  it('names WHICH FORM they filled in', () => {
    expect(mail.html).toContain('Enquiry card');
    expect(mail.text).toContain('Form: Enquiry card');
  });

  it('names the stone they had selected, and the slab they linked', () => {
    expect(mail.html).toContain('Calacatta Gold · Quartz');
    expect(mail.html).toContain('https://example.com/a-slab');
  });

  it('carries the estimate they were shown', () => {
    expect(mail.html).toContain('Their estimate');
    expect(mail.html).toContain('3000 × 600');
    expect(mail.html).toContain('with island');
    expect(mail.html).toContain('Drainer grooves');
    expect(mail.html).toContain('£3,200 – £3,900');
  });

  it('marks a priced-by-hand enquiry as one', () => {
    const poa = composeEnquiry({
      fields: fields({ estimate: JSON.stringify({ mat: 'Marble', stone: 'Carrara', poa: true }) }),
    });
    expect(poa.html).toContain('Priced by hand (POA path)');
  });

  it('lists the files, with their sizes', () => {
    expect(mail.html).toContain('plans.pdf');
    expect(mail.html).toContain('2.0 MB');
    expect(mail.html).toContain('kitchen.jpg');
  });

  it('tells him WHAT THEY DID, step by step', () => {
    expect(mail.html).toContain('What they did, step by step');
    expect(mail.html).toContain('Estimator: chose Carrara Honed');
    expect(mail.html).toContain('Clicked &quot;Get a quote&quot; in hero on /');
  });

  it('summarises the visit', () => {
    expect(mail.html).toContain('Their visit at a glance');
    expect(mail.html).toContain('2 visits');
    expect(mail.html).toContain('4 different pages');
    expect(mail.html).toContain('google.com');
    expect(mail.html).toContain('Desktop · 1440×900');
  });

  it('says which page the enquiry came off', () => {
    expect(mail.html).toContain('Kitchen Worktops — /');
  });

  it('keeps the message, with its line breaks', () => {
    expect(mail.html).toContain('Two runs and an island.<br>Can you template next week?');
  });

  it('passes through a field it has never heard of', () => {
    const extra = composeEnquiry({ fields: fields({ how_soon: 'Within a month' }) });
    expect(extra.html).toContain('How soon');
    expect(extra.html).toContain('Within a month');
  });

  it('escapes what a visitor typed instead of rendering it', () => {
    const xss = composeEnquiry({ fields: fields({ name: '<script>alert(1)</script>' }) });
    expect(xss.html).not.toContain('<script>alert(1)</script>');
    expect(xss.html).toContain('&lt;script&gt;');
  });

  it('ships a text alternative as well as the HTML', () => {
    expect(mail.text).toContain('NEW ENQUIRY — Jane Cooper');
    expect(mail.text).toContain('Stone: Calacatta Gold · Quartz');
    expect(mail.text).toContain('plans.pdf');
  });
});

describe('the route delivers, and never lies about it', () => {
  /* The forward is the path that is live today, so it is the one asserted.
     SMTP is off in the test environment (no credentials), which is exactly
     the production fallback ordering. */
  beforeEach(() => {
    vi.resetModules();
    delete process.env.SMTP_URL;
    delete process.env.SMTP_HOST;
    delete process.env.SMTP_USER;
    process.env.ENQUIRY_FORWARD_URL = 'https://example.invalid/send.php';
  });

  async function post(body: FormData) {
    const { POST } = await import('@/app/api/enquiry/route');
    return POST(new Request('http://localhost/api/enquiry', { method: 'POST', body }));
  }

  function realBody() {
    const fd = new FormData();
    for (const [k, v] of Object.entries(fields())) fd.append(k, v);
    fd.append('file1', new File([new Uint8Array(2048)], 'plans.pdf', { type: 'application/pdf' }));
    fd.append('file2', new File([new Uint8Array(1024)], 'kitchen.jpg', { type: 'image/jpeg' }));
    return fd;
  }

  it('forwards every field AND every file to the endpoint that mails him', async () => {
    let sent: FormData | null = null;
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_url: string, init: RequestInit) => {
        sent = init.body as FormData;
        return new Response(JSON.stringify({ ok: true }), { status: 200 });
      }),
    );

    const res = await post(realBody());
    expect(res.status).toBe(200);
    const json = (await res.json()) as { ok: boolean; received?: { via?: string; attachments: number } };
    expect(json.ok).toBe(true);
    expect(json.received?.via).toBe('forward');
    expect(json.received?.attachments).toBe(2);

    const body = sent as unknown as FormData;
    expect(body).toBeTruthy();
    // every field the client named
    for (const k of ['name', 'email', 'phone', 'postcode', 'message', 'form_name', 'stone', 'stone_link', 'journey', 'estimate', 'page', 'device']) {
      expect(body.get(k), `missing field: ${k}`).toBeTruthy();
    }
    // and both files, as files
    const f1 = body.get('file1') as File;
    const f2 = body.get('file2') as File;
    expect(f1).toBeInstanceOf(File);
    expect(f1.name).toBe('plans.pdf');
    expect(f1.size).toBe(2048);
    expect(f2).toBeInstanceOf(File);
    expect(f2.name).toBe('kitchen.jpg');
  });

  it('returns 502 — never a thank-you — when delivery fails', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('nope', { status: 500 })));
    const res = await post(realBody());
    expect(res.status).toBe(502);
    const json = (await res.json()) as { ok: boolean; errors?: string[] };
    expect(json.ok).toBe(false);
    expect(json.errors?.[0]).toContain('0800 098 2812');
  });

  it('returns 502 when the transport throws, rather than pretending', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('ECONNREFUSED'); }));
    const res = await post(realBody());
    expect(res.status).toBe(502);
  });

  it('refuses an enquiry with no name or email before trying to send', async () => {
    const fetchSpy = vi.fn(async () => new Response(JSON.stringify({ ok: true }), { status: 200 }));
    vi.stubGlobal('fetch', fetchSpy);
    const fd = new FormData();
    fd.append('message', 'hello');
    const res = await post(fd);
    expect(res.status).toBe(422);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});

describe('the confirmation the customer gets back', () => {
  const reply = composeAutoReply({
    fields: fields(),
    attachments: [
      { filename: 'plans.pdf', size: 2_100_000, content: Buffer.from('x'), contentType: 'application/pdf' },
    ],
  });

  it('says what the client asked it to say', () => {
    expect(reply.subject).toBe('Thank you for contacting Topcat Worktops');
    expect(reply.text).toContain('Hi Jane,');
    expect(reply.text).toContain('We have received your enquiry');
    expect(reply.text).toContain('get back to you shortly');
    expect(reply.text).toContain('Thank you for contacting Topcat Worktops');
  });

  it('USES NO EM DASHES OR EN DASHES, anywhere the customer can see', () => {
    expect(reply.subject).not.toMatch(/[—–]/);
    expect(reply.text).not.toMatch(/[—–]/);
    /* The HTML carries the visitor's own words too, so strip tags and check
       the copy the template contributes. */
    expect(reply.html.replace(/<[^>]*>/g, '')).not.toMatch(/[—–]/);
  });

  it('echoes back the details they actually sent, and nothing they did not', () => {
    expect(reply.text).toContain('Name: Jane Cooper');
    expect(reply.text).toContain('Email: jane@example.com');
    expect(reply.text).toContain('Postcode: HP1 2AB');
    expect(reply.text).toContain('Stone: Calacatta Gold · Quartz');
    expect(reply.text).toContain('File attached: plans.pdf');
    /* The office's own diagnostics are not the customer's business. */
    expect(reply.text).not.toContain('journey');
    expect(reply.text).not.toContain('Their visit');
    expect(reply.html).not.toContain('step by step');
  });

  it('does not greet a nameless enquiry with an empty Hi', () => {
    const anon = composeAutoReply({ fields: { ...fields(), name: '' } });
    expect(anon.text.startsWith('Hi')).toBe(false);
  });

  it('escapes what the visitor typed', () => {
    const xss = composeAutoReply({ fields: fields({ name: '<img src=x onerror=1>' }) });
    expect(xss.html).not.toContain('<img src=x');
    expect(xss.html).toContain('&lt;img');
  });

  it('gives the customer a way back that is a person', () => {
    expect(reply.text).toContain('0800 098 2812');
    expect(reply.text).toContain('info@topcatworktops.co.uk');
  });
});
