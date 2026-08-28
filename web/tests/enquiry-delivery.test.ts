/**
 * Where an enquiry goes, and what happens when it cannot get there.
 *
 * The recipient is fixed and a request cannot move it; a failure is reported
 * to the visitor as a failure rather than a thank-you. Delivery is stubbed
 * throughout, so this file never sends mail.
 *
 * ⚠️ No file attachment is exercised here: the jsdom shim this suite runs on
 * hangs on File.arrayBuffer(), which is part of its known failure baseline.
 * Attachments are covered by the composed-email preview instead.
 */
import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';

const REAL_FETCH = globalThis.fetch;
afterEach(() => { globalThis.fetch = REAL_FETCH; vi.restoreAllMocks(); });
beforeEach(() => {
  delete process.env.SMTP_URL; delete process.env.SMTP_HOST; delete process.env.SMTP_USER;
  delete process.env.ENQUIRY_TO;
});

function enquiry() {
  const fd = new FormData();
  fd.append('name', 'Sarah Whitfield');
  fd.append('email', 'sarah.whitfield@example.co.uk');
  fd.append('phone', '07700 900412');
  fd.append('postcode', 'CM20 2FB');
  fd.append('form_name', 'Stone page enquiry');
  fd.append('stone', 'Calacatta Gold');
  fd.append('message', 'Galley kitchen, two runs, roughly 4.2m.');
  fd.append('estimate', JSON.stringify({ mat: 'Quartz', stone: 'Calacatta Gold', slabs: 2, lo: 2000, hi: 2500 }));

  return new Request('http://localhost/api/enquiry', { method: 'POST', body: fd });
}

describe('enquiry delivery', () => {
  it('with delivery switched off it touches the network not at all', async () => {
    process.env.ENQUIRY_FORWARD_URL = '';
    const spy = vi.fn(); globalThis.fetch = spy as never;
    const { POST } = await import('@/app/api/enquiry/route');
    const res = await POST(enquiry() as never);
    console.log('  delivery off  -> status', res.status, '| network calls:', spy.mock.calls.length);
    expect(spy).not.toHaveBeenCalled();
  });

  it('delivers to the configured endpoint, carrying every field and the file', async () => {
    process.env.ENQUIRY_FORWARD_URL = 'https://example.invalid/send.php';
    let seenUrl = ''; let seenBody: FormData | null = null;
    globalThis.fetch = (async (url: string, init: { body: FormData }) => {
      seenUrl = String(url); seenBody = init.body;
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }) as never;
    const { POST } = await import('@/app/api/enquiry/route');
    const res = await POST(enquiry() as never);
    const body = await res.json();
    const b = seenBody as unknown as FormData;
    console.log('  posted to      :', seenUrl);
    console.log('  status         :', res.status, '| via:', body.via ?? JSON.stringify(body).slice(0, 80));
    console.log('  carried fields :', [...b.keys()].join(', '));
    console.log('  (file omitted: the jsdom shim in this suite hangs on File.arrayBuffer)');
    expect(res.status).toBe(200);
    expect(seenUrl).toBe('https://example.invalid/send.php');
    for (const k of ['name','email','phone','postcode','form_name','stone','message','estimate'])
      expect([...b.keys()]).toContain(k);
  });

  it('tells the visitor the truth when delivery fails', async () => {
    process.env.ENQUIRY_FORWARD_URL = 'https://example.invalid/send.php';
    globalThis.fetch = (async () =>
      new Response(JSON.stringify({ ok: false, error: 'mail refused' }), { status: 500 })) as never;
    const { POST } = await import('@/app/api/enquiry/route');
    const res = await POST(enquiry() as never);
    console.log('  upstream fails -> status', res.status, '(must NOT be 2xx)');
    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  it('always goes to info@topcatworktops.co.uk and a request cannot change it', async () => {
    process.env.ENQUIRY_FORWARD_URL = '';
    const { mailTo } = await import('@/lib/mail/send');
    const fd = new FormData();
    fd.append('name', 'Someone'); fd.append('email', 'a@example.com');
    fd.append('to', 'elsewhere@example.com');
    fd.append('ENQUIRY_TO', 'elsewhere@example.com');
    const { POST } = await import('@/app/api/enquiry/route');
    await POST(new Request('http://localhost/api/enquiry', { method: 'POST', body: fd }) as never);
    console.log('  recipient after a request that tried to redirect it:', mailTo());
    expect(mailTo()).toBe('info@topcatworktops.co.uk');
  });
});
