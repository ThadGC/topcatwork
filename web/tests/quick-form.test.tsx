/* ==========================================================================
   <QuickForm/> — the /trade/ aside.

   Two behaviours here exist only on this form and are easy to lose in a
   port: it sends a `service` field, and on success it swaps the whole card
   for its thank-you panel instead of writing a reply line.
   ========================================================================== */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';

import QuickForm from '@/components/forms/QuickForm';
import { MSG } from '@/lib/form/validate';

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

function fill(placeholder: string, value: string) {
  fireEvent.change(screen.getByPlaceholderText(placeholder), { target: { value } });
}

describe('<QuickForm/>', () => {
  it('pre-selects the service /trade/ pre-selects', () => {
    render(<QuickForm defaultService="Commercial" />);
    expect(screen.getByLabelText('What do you need')).toHaveValue('Commercial');
  });

  it('sends the service alongside the contact details', async () => {
    render(<QuickForm defaultService="Commercial" />);
    fill('Your name', 'Nick Bell');
    fill('Phone number', '07464 940287');
    fireEvent.click(screen.getByRole('button', { name: 'Send my enquiry' }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const fd: FormData = fetchMock.mock.calls[0][1].body;
    expect(fd.get('service')).toBe('Commercial');
    expect(fd.get('name')).toBe('Nick Bell');
    expect(fd.get('phone')).toBe('07464 940287');
  });

  it('is labelled "Quick enquiry form", which is what /trade/ actually sends', async () => {
    /* Not "Trade account form": the page ships id="qform". See formKind. */
    render(<QuickForm />);
    fill('Your name', 'Nick Bell');
    fill('Email address', 'nick@example.com');
    fireEvent.click(screen.getByRole('button', { name: 'Send my enquiry' }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(fetchMock.mock.calls[0][1].body.get('form_name')).toBe('Quick enquiry form');
  });

  it('has no postcode field, so the postcode rule never fires', async () => {
    render(<QuickForm />);
    expect(screen.queryByPlaceholderText('Postcode')).toBeNull();
    fill('Your name', 'Nick Bell');
    fill('Email address', 'nick@example.com');
    fireEvent.click(screen.getByRole('button', { name: 'Send my enquiry' }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
  });

  it('swaps to the thank-you panel with .sent instead of a reply line', async () => {
    const { container } = render(<QuickForm />);
    fill('Your name', 'Nick Bell');
    fill('Email address', 'nick@example.com');
    fireEvent.click(screen.getByRole('button', { name: 'Send my enquiry' }));

    await waitFor(() => expect(container.querySelector('form')).toHaveClass('sent'));
    expect(
      screen.queryByText(
        'Thank you Nick, your enquiry is on its way. We reply within one working day.',
      ),
    ).toBeNull();
    expect(
      screen.getByText(/Thank you, we have your details and will come back to you/),
    ).toBeInTheDocument();
  });

  it('applies the same name rule as the enquiry card', async () => {
    render(<QuickForm />);
    fill('Email address', 'nick@example.com');
    fireEvent.click(screen.getByRole('button', { name: 'Send my enquiry' }));
    await screen.findByText(MSG.name);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
