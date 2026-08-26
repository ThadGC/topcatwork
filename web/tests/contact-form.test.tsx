/* ==========================================================================
   <ContactForm/> end to end, against a stubbed fetch.

   What is being proved here is the POST CONTRACT with send.php — the field
   names, the endpoint, the multipart body — plus the fact that a failing
   submission never reaches the network at all. send.php is not being tested;
   it is not ours to test and it is not running.
   ========================================================================== */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';

import ContactForm from '@/components/forms/ContactForm';
import { MSG , ENDPOINT } from '@/lib/form/validate';

/*
  `input`, not `change`. The form clears a bad field on the INPUT event
  (tcform.js:179), which is what a real keystroke fires; `fireEvent.change`
  dispatches only `change` and would never exercise that path.
*/
function fill(placeholder: string, value: string) {
  const el = screen.getByPlaceholderText(placeholder);
  fireEvent.input(el, { target: { value } });
  return el;
}

function submit() {
  fireEvent.click(screen.getByRole('button', { name: 'Send my enquiry' }));
}

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  localStorage.clear();
  fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 });
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('<ContactForm/> — the happy path', () => {
  it('posts a multipart body to the enquiry endpoint and nowhere else', async () => {
    render(<ContactForm />);
    fill('Your name', 'Nick Bell');
    fill('Email address', 'nick@example.com');
    submit();

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

    const [url, init] = fetchMock.mock.calls[0];
    // The endpoint moved off PHP when the app stopped being a static
    // export: send.php only survived the rewrite because output:'export'
    // forbids route handlers. ENDPOINT is the single source of truth.
    expect(url).toBe(ENDPOINT);
    expect(init.method).toBe('POST');
    expect(init.body).toBeInstanceOf(FormData);
    expect(init.headers).toEqual({ Accept: 'application/json' });
  });

  it('carries every field send.php reads', async () => {
    render(<ContactForm />);
    fill('Your name', 'Nick Bell');
    fill('Email address', 'nick@example.com');
    fill('Phone number', '07464 940287');
    fill('Postcode', 'WC1N 3AX');
    fireEvent.change(screen.getByPlaceholderText('Message'), {
      target: { value: 'Two runs and an island please.' },
    });
    submit();

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const fd: FormData = fetchMock.mock.calls[0][1].body;

    expect(fd.get('name')).toBe('Nick Bell');
    expect(fd.get('email')).toBe('nick@example.com');
    expect(fd.get('phone')).toBe('07464 940287');
    expect(fd.get('postcode')).toBe('WC1N 3AX');
    expect(fd.get('message')).toBe('Two runs and an island please.');

    /* The five fields tcform.js adds on top of the inputs. */
    expect(fd.get('form_name')).toBe('Enquiry card');
    expect(fd.get('page')).toBe(location.pathname);
    expect(typeof fd.get('page_title')).toBe('string');
    expect(['phone', 'tablet', 'desktop']).toContain(fd.get('device'));
    expect(String(fd.get('screen'))).toMatch(/^\d+×\d+$/);
  });

  it('does NOT post the file input as a form field', async () => {
    /* The uploader's <input type="file"> has no `name`, so FormData skips
       it; attachments arrive only as file1…fileN via TC_FORM_EXTRA. A name
       on that input would double every attachment. */
    render(<ContactForm />);
    fill('Your name', 'Nick Bell');
    fill('Email address', 'nick@example.com');
    submit();

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const fd: FormData = fetchMock.mock.calls[0][1].body;
    const fileEntries = [...fd.keys()].filter((k) => /^file\d+$/.test(k));
    expect(fileEntries).toEqual([]);
    expect(fd.get('file')).toBeNull();
  });

  it('shows the thank-you line and clears the form', async () => {
    render(<ContactForm />);
    const name = fill('Your name', 'Nick Bell') as HTMLInputElement;
    fill('Email address', 'nick@example.com');
    submit();

    await screen.findByText(
      'Thank you Nick, your enquiry is on its way. We reply within one working day.',
    );
    expect(name.value).toBe('');
  });
});

describe('<ContactForm/> — validation gates the network', () => {
  it('never calls fetch when the name is missing', async () => {
    render(<ContactForm />);
    fill('Email address', 'nick@example.com');
    submit();

    await screen.findByText(MSG.name);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('never calls fetch with neither an email nor a phone', async () => {
    render(<ContactForm />);
    fill('Your name', 'Nick Bell');
    submit();

    await screen.findByText(MSG.reach);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('marks the offending field with tc-bad and aria-invalid', async () => {
    render(<ContactForm />);
    fill('Your name', 'Nick Bell');
    fill('Email address', 'not-an-email');
    submit();

    await screen.findByText(MSG.email);
    const email = screen.getByPlaceholderText('Email address');
    expect(email).toHaveClass('tc-bad');
    expect(email).toHaveAttribute('aria-invalid', 'true');
  });

  it('marks BOTH contact fields when neither is filled in', async () => {
    render(<ContactForm />);
    fill('Your name', 'Nick Bell');
    submit();

    await screen.findByText(MSG.reach);
    expect(screen.getByPlaceholderText('Email address')).toHaveClass('tc-bad');
    expect(screen.getByPlaceholderText('Phone number')).toHaveClass('tc-bad');
  });

  it('clears the mark and restores the resting note as soon as you type', async () => {
    render(<ContactForm />);
    fill('Your name', 'Nick Bell');
    fill('Email address', 'not-an-email');
    submit();

    await screen.findByText(MSG.email);
    fill('Email address', 'nick@example.com');

    expect(screen.getByPlaceholderText('Email address')).not.toHaveClass('tc-bad');
    await screen.findByText('We reply within one working day.');
  });
});

describe('<ContactForm/> — when send.php cannot send', () => {
  it('tells the visitor to phone, and says so honestly', async () => {
    /* send.php answers 500 only after every sender rung was refused, and it
       has already written the enquiry to _enquiry-files/.failed/ by then. */
    fetchMock.mockResolvedValue({ ok: false, status: 500 });
    render(<ContactForm />);
    fill('Your name', 'Nick Bell');
    fill('Email address', 'nick@example.com');
    submit();

    await screen.findByText(MSG.failed);
  });

  it('re-enables the send button so the visitor can try again', async () => {
    fetchMock.mockRejectedValue(new Error('offline'));
    render(<ContactForm />);
    fill('Your name', 'Nick Bell');
    fill('Email address', 'nick@example.com');
    submit();

    await screen.findByText(MSG.failed);
    expect(screen.getByRole('button', { name: 'Send my enquiry' })).not.toBeDisabled();
  });
});

describe('the visit trail rides along', () => {
  it('sends the journey when there is one, and omits it when there is not', async () => {
    render(<ContactForm />);
    fill('Your name', 'Nick Bell');
    fill('Email address', 'nick@example.com');
    submit();
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    /* Nothing has booted the trail in this test, so there is no journey. */
    expect(fetchMock.mock.calls[0][1].body.get('journey')).toBeNull();

    localStorage.setItem(
      'tc_journey',
      JSON.stringify({ started: Date.now(), ev: [{ t: 'ev', k: 'Viewed', v: '/', at: Date.now() }] }),
    );
    localStorage.setItem('tc_estimate', JSON.stringify({ t: 'est', stone: 'Calacatta' }));

    cleanup();
    render(<ContactForm />);
    fill('Your name', 'Nick Bell');
    fill('Email address', 'nick@example.com');
    submit();

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    const fd: FormData = fetchMock.mock.calls[1][1].body;
    expect(JSON.parse(String(fd.get('journey'))).ev).toHaveLength(1);
    expect(JSON.parse(String(fd.get('estimate'))).stone).toBe('Calacatta');
  });
});
