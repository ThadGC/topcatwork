/* ==========================================================================
   The enquiry-form rules, pinned against assets/tcform.js.

   Every expectation here is a claim about the LEGACY behaviour, not about
   what good validation would look like. Several of them assert that the form
   is deliberately permissive — a nine-digit phone number passes, a postcode
   is optional, an address like `a@b.co` is accepted — and those are the ones
   most likely to be "fixed" by someone who has not read tcform.js. If one of
   these fails, the port drifted; change the port, not the test.
   ========================================================================== */

import { describe, expect, it } from 'vitest';

import {
  MSG,
  RX_MAIL,
  RX_POSTCODE,
  band,
  digits,
  firstName,
  formKind,
  sentMessage,
  validate,
} from '@/lib/form/validate';
import { pageTitle, screenSize } from '@/lib/form/payload';

/** A submission that passes every rule, so each test can break one thing. */
const OK = {
  name: 'Nick Bell',
  email: 'nick@example.co.uk',
  phone: '07464 940287',
  postcode: 'WC1N 3AX',
};

describe('validate — the name rule (tcform.js:105)', () => {
  it('rejects an empty name', () => {
    expect(validate({ ...OK, name: '' })).toEqual({
      field: 'name',
      fields: ['name'],
      message: MSG.name,
    });
  });

  it('rejects a one-character name', () => {
    expect(validate({ ...OK, name: 'A' })?.message).toBe(MSG.name);
  });

  it('rejects whitespace that trims to nothing', () => {
    expect(validate({ ...OK, name: '   ' })?.message).toBe(MSG.name);
  });

  it('accepts two characters', () => {
    expect(validate({ ...OK, name: 'Jo' })).toBeNull();
  });

  it('trims before measuring, so "  Jo  " passes', () => {
    expect(validate({ ...OK, name: '  Jo  ' })).toBeNull();
  });

  it('treats a missing name field as an empty one', () => {
    expect(validate({ email: 'a@b.co' })?.message).toBe(MSG.name);
  });
});

describe('validate — one contact route is required (tcform.js:107)', () => {
  it('rejects a submission with neither email nor phone', () => {
    expect(validate({ name: 'Nick', email: '', phone: '' })).toEqual({
      field: 'email',
      fields: ['email', 'phone'],
      message: MSG.reach,
    });
  });

  it('marks BOTH fields, not just one', () => {
    expect(validate({ name: 'Nick', email: '', phone: '' })?.fields).toEqual([
      'email',
      'phone',
    ]);
  });

  it('accepts an email on its own', () => {
    expect(validate({ name: 'Nick', email: 'a@b.co', phone: '' })).toBeNull();
  });

  it('accepts a phone on its own', () => {
    expect(validate({ name: 'Nick', email: '', phone: '020 7946 0958' })).toBeNull();
  });

  it('focuses the phone field when the form has no email input', () => {
    expect(validate({ name: 'Nick', phone: '' })?.field).toBe('phone');
  });

  it('agrees with send.php:120, which rejects exactly this case with a 422', () => {
    /* PHP: mb_strlen($name) < 2 || ($email === '' && $phone === '') */
    expect(validate({ name: 'Nick', email: '', phone: '' })).not.toBeNull();
    expect(validate({ name: 'N', email: 'a@b.co' })).not.toBeNull();
    expect(validate({ name: 'Nick', email: 'a@b.co' })).toBeNull();
  });
});

describe('validate — the email rule (tcform.js:111)', () => {
  const bad = [
    'nick',
    'nick@',
    '@example.com',
    'nick@example',
    'nick@example.c',
    'nick @example.com',
    'nick@exa mple.com',
    'nick@@example.com',
    'nick@example.123',
  ];
  it.each(bad)('rejects %j', (value) => {
    expect(validate({ ...OK, email: value })?.message).toBe(MSG.email);
  });

  const good = [
    'a@b.co',
    'nick@example.com',
    'nick.bell+quote@example.co.uk',
    "o'brien@example.com",
    'nick@sub.domain.example.museum',
  ];
  it.each(good)('accepts %j', (value) => {
    expect(validate({ ...OK, email: value })).toBeNull();
  });

  it('is applied to the trimmed value', () => {
    expect(validate({ ...OK, email: '  nick@example.com  ' })).toBeNull();
  });

  it('is the source regex, unchanged', () => {
    expect(RX_MAIL.source).toBe('^[^\\s@]+@[^\\s@]+\\.[A-Za-z]{2,}$');
  });
});

describe('validate — the phone rule (tcform.js:112)', () => {
  it('counts digits, not characters', () => {
    expect(digits('+44 (0)7464 940287')).toBe('4407464940287');
    expect(digits('')).toBe('');
    expect(digits(null)).toBe('');
  });

  it('rejects eight digits', () => {
    expect(validate({ ...OK, phone: '01234567' })?.message).toBe(MSG.phone);
  });

  it('accepts exactly nine digits — the boundary', () => {
    expect(validate({ ...OK, phone: '012345678' })).toBeNull();
  });

  it('accepts a UK mobile written with spaces', () => {
    expect(validate({ ...OK, phone: '07464 940287' })).toBeNull();
  });

  it('accepts an international form with punctuation', () => {
    expect(validate({ ...OK, phone: '+44 (0)20 7946 0958' })).toBeNull();
  });

  it('rejects a number whose length comes from punctuation, not digits', () => {
    expect(validate({ ...OK, phone: '(0)-- 12 34' })?.message).toBe(MSG.phone);
  });
});

describe('validate — the postcode rule (tcform.js:113)', () => {
  const good = ['WC1N 3AX', 'wc1n3ax', 'M1 1AE', 'B33 8TH', 'CR2 6XH', 'DN55 1PT', 'EC1A 1BB'];
  it.each(good)('accepts %j', (value) => {
    expect(validate({ ...OK, postcode: value })).toBeNull();
  });

  const bad = ['WC1N', '3AX', '1234', 'WC1N 3A', 'WC1N 3AXX', 'NOT A POSTCODE'];
  it.each(bad)('rejects %j', (value) => {
    expect(validate({ ...OK, postcode: value })?.message).toBe(MSG.postcode);
  });

  it('is OPTIONAL — an empty postcode passes', () => {
    expect(validate({ ...OK, postcode: '' })).toBeNull();
    expect(validate({ ...OK, postcode: '   ' })).toBeNull();
  });

  it('is skipped entirely when the form has no postcode field', () => {
    /* The trade page's .qform is exactly this shape. */
    const { postcode: _drop, ...noPostcode } = OK;
    void _drop;
    expect(validate(noPostcode)).toBeNull();
  });

  it('is the source regex, unchanged', () => {
    expect(RX_POSTCODE.source).toBe(
      '^[A-Za-z]{1,2}[0-9][0-9A-Za-z]?\\s*[0-9][A-Za-z]{2}$',
    );
  });
});

describe('validate — only the first failure is reported, in source order', () => {
  it('reports the name before the missing contact route', () => {
    expect(validate({ name: '', email: '', phone: '' })?.message).toBe(MSG.name);
  });

  it('reports the missing contact route before a bad postcode', () => {
    expect(validate({ name: 'Nick', email: '', phone: '', postcode: 'nope' })?.message).toBe(
      MSG.reach,
    );
  });

  it('reports a bad email before a short phone', () => {
    expect(validate({ name: 'Nick', email: 'nope', phone: '1' })?.message).toBe(MSG.email);
  });

  it('reports a short phone before a bad postcode', () => {
    expect(
      validate({ name: 'Nick', email: '', phone: '1', postcode: 'nope' })?.message,
    ).toBe(MSG.phone);
  });

  it('accepts the fully valid submission', () => {
    expect(validate(OK)).toBeNull();
  });
});

describe('the message strings are the client’s words, verbatim', () => {
  it('uses em dashes, not hyphens', () => {
    expect(MSG.email).toBe('That email address does not look right — please check it.');
    expect(MSG.phone).toBe('That phone number looks too short — please check it.');
    expect(MSG.postcode).toBe('That postcode does not look right — please check it.');
  });

  it('keeps the exact name and reach copy', () => {
    expect(MSG.name).toBe(
      'Please tell us your name so we know who we are replying to.',
    );
    expect(MSG.reach).toBe(
      'Please leave an email address or a phone number so we can come back to you.',
    );
  });

  it('quotes the freephone number in the failure message', () => {
    expect(MSG.failed).toBe(
      'Something went wrong sending that. Please call 0800 098 2812 and we will take it down for you.',
    );
  });

  it('uses a single ellipsis character while sending', () => {
    expect(MSG.sending).toBe('Sending…');
  });
});

describe('band — the site’s three device bands (tcform.js:10)', () => {
  it.each([
    [320, 'phone'],
    [720, 'phone'],
    [721, 'tablet'],
    [1120, 'tablet'],
    [1121, 'desktop'],
    [2560, 'desktop'],
  ])('%i px is %s', (width, expected) => {
    expect(band(width as number)).toBe(expected);
  });
});

describe('formKind — what send.php prints as form_name (tcform.js:14)', () => {
  it('labels the enquiry card', () => {
    expect(formKind('ctaForm', ['cta-form'])).toBe('Enquiry card');
  });

  it('labels the quick form', () => {
    expect(formKind('qform', ['qform'])).toBe('Quick enquiry form');
  });

  it('has a tradeForm branch that no page currently reaches', () => {
    /* /trade/ ships id="qform", so its enquiries arrive as "Quick enquiry
       form". The branch exists in tcform.js and is ported as found. */
    expect(formKind('tradeForm', [])).toBe('Trade account form');
    expect(formKind('qform', ['qform'])).not.toBe('Trade account form');
  });

  it('falls back to "Form"', () => {
    expect(formKind('somethingElse', ['whatever'])).toBe('Form');
  });
});

describe('the reply line', () => {
  it('greets with the first word of the name', () => {
    expect(firstName('Nick Bell')).toBe('Nick');
    expect(firstName('  Rimsha  ')).toBe('Rimsha');
  });

  it('builds the thank-you exactly as tcform.js:136 does', () => {
    expect(sentMessage('Nick')).toBe(
      'Thank you Nick, your enquiry is on its way. We reply within one working day.',
    );
  });

  it('drops the greeting when there is no name to use', () => {
    expect(sentMessage('')).toBe(
      'Your enquiry is on its way. We reply within one working day.',
    );
  });
});

describe('payload helpers', () => {
  it('sends only the first | segment of the title, cut to 80', () => {
    expect(pageTitle('Contact Topcat Worktops | Free Quote | Topcat')).toBe(
      'Contact Topcat Worktops',
    );
    expect(pageTitle('x'.repeat(200))).toHaveLength(80);
    expect(pageTitle('')).toBe('');
  });

  it('joins the screen size with U+00D7, not the letter x', () => {
    expect(screenSize(1440, 900)).toBe('1440×900');
    expect(screenSize(1440, 900)).not.toContain('x');
  });
});
