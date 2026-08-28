/**
 * The enquiry endpoint refuses exactly what send.php:120 refused, and nothing
 * more. This exists because the port required name AND email, so every enquiry
 * left with only a phone number was turned away — on a site whose own form
 * offers a phone field and whose live predecessor accepts one.
 */
import { describe, expect, it, beforeAll } from 'vitest';

/* Delivery OFF: an empty forward URL turns delivery into nothing, which the
   route reports as 502. So 422 = refused by validation, 502 = ACCEPTED by
   validation and then not delivered. Nothing is ever mailed. */
beforeAll(() => {
  process.env.ENQUIRY_FORWARD_URL = '';
  delete process.env.SMTP_URL; delete process.env.SMTP_HOST; delete process.env.SMTP_USER;
});

async function post(fields: Record<string, string>) {
  const { POST } = await import('@/app/api/enquiry/route');
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.append(k, v);
  const res = await POST(new Request('http://localhost/api/enquiry', { method: 'POST', body: fd }) as never);
  const body = await res.json().catch(() => ({}));
  return { status: res.status, errors: (body as { errors?: string[] }).errors ?? [] };
}

describe('enquiry validation matches send.php:120', () => {
  it('refuses a name under 2 characters', async () => {
    const r = await post({ name: 'A', phone: '01279 123456' });
    expect(r.status).toBe(422);
    expect(r.errors.join(' ')).toMatch(/name/i);
  });
  it('refuses when there is neither an email nor a phone', async () => {
    const r = await post({ name: 'Test User' });
    expect(r.status).toBe(422);
    expect(r.errors.join(' ')).toMatch(/email address or a phone number/i);
  });
  it('ACCEPTS a phone-only enquiry (the lead that used to be thrown away)', async () => {
    const r = await post({ name: 'Test User', phone: '01279 123456', form_name: 'probe' });
    expect(r.status).not.toBe(422);
  });
  it('ACCEPTS an email-only enquiry', async () => {
    const r = await post({ name: 'Test User', email: 'someone@example.com' });
    expect(r.status).not.toBe(422);
  });
  it('still refuses a malformed email', async () => {
    const r = await post({ name: 'Test User', email: 'nope' });
    expect(r.status).toBe(422);
    expect(r.errors.join(' ')).toMatch(/does not look right/i);
  });
});
