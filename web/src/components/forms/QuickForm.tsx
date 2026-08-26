'use client';

/* ==========================================================================
   `<QuickForm>` — `form.qform#qform`, the aside that sits beside the copy on
   the content-styled pages. /trade/ is the one this port needs.

   TWO THINGS THAT LOOK WRONG AND ARE NOT:

   1. It sends `form_name: "Quick enquiry form"`, not "Trade account form".
      tcform.js:16 does have a `tradeForm` branch, but no page in the source
      carries that id — /trade/ ships `id="qform"`, so the class branch wins.
      Ported as found. Changing it would change what the client sees in his
      inbox, and that string is his, not ours.

   2. On success it does NOT write a reply line. tcform.js:135 adds `.sent`
      to the form and returns; the CSS then folds `.qf-fields` away and
      reveals the `.qf-done` paragraph that was in the markup all along.

   It has no postcode field, which is why `validate()` skips the postcode
   rule entirely rather than treating an absent field as an empty one.
   ========================================================================== */

import { badProps, useEnquiryForm } from './useEnquiryForm';

const CLASSES = ['qform'] as const;

/** The nine options, in source order (trade/index.html). */
const SERVICES = [
  'Kitchen worktops',
  'Kitchen islands',
  'Splashbacks',
  'Bathrooms and vanity tops',
  'Outdoor kitchens',
  'Fireplaces',
  'Dining tables',
  'Commercial',
  'Something else',
] as const;

export interface QuickFormProps {
  /** /trade/ pre-selects "Commercial"; other hosts pick their own. */
  defaultService?: (typeof SERVICES)[number];
}

export default function QuickForm({ defaultService = 'Commercial' }: QuickFormProps) {
  const form = useEnquiryForm({
    id: 'qform',
    classNames: CLASSES,
    swapOnSent: true,
    values: (f) => ({
      name: f.querySelector<HTMLInputElement>('[name="name"]')?.value,
      email: f.querySelector<HTMLInputElement>('[name="email"]')?.value,
      phone: f.querySelector<HTMLInputElement>('[name="phone"]')?.value,
      /* No postcode input on this form — left undefined on purpose. */
    }),
  });

  const note = form.note;

  return (
    <form
      ref={form.formRef}
      className={form.sent ? 'qform sent' : 'qform'}
      id="qform"
      noValidate
      onSubmit={form.onSubmit}
      onInput={form.onInput}
    >
      <div className="qf-fields">
        <h3>
          Get in touch with <em>Topcat</em>
        </h3>
        <p className="qf-sub">Tell us what you need and we will come back to you.</p>
        <label className="sr-only" htmlFor="qfName">
          Your name
        </label>
        <input
          id="qfName"
          name="name"
          type="text"
          placeholder="Your name"
          autoComplete="name"
          {...badProps(form.bad, 'name')}
        />
        <label className="sr-only" htmlFor="qfEmail">
          Email address
        </label>
        <input
          id="qfEmail"
          name="email"
          type="email"
          placeholder="Email address"
          autoComplete="email"
          {...badProps(form.bad, 'email')}
        />
        <label className="sr-only" htmlFor="qfPhone">
          Phone number
        </label>
        <input
          id="qfPhone"
          name="phone"
          type="tel"
          placeholder="Phone number"
          autoComplete="tel"
          {...badProps(form.bad, 'phone')}
        />
        <label className="sr-only" htmlFor="qfService">
          What do you need
        </label>
        <select id="qfService" name="service" defaultValue={defaultService}>
          {SERVICES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <button type="submit" disabled={form.sending}>
          {form.sending ? 'Sending…' : 'Send my enquiry'}
        </button>
        <p
          className={
            'qf-note' +
            (note?.kind === 'bad' ? ' tc-bad' : note?.kind === 'ok' ? ' tc-ok' : '')
          }
          role={note ? 'status' : undefined}
          aria-live={note ? 'polite' : undefined}
        >
          {note ? note.message : 'We reply within one working day.'}
        </p>
      </div>
      <p className="qf-done">
        Thank you, we have your details and will come back to you within one working day.
        If it is urgent, call 0800 098 2812.
      </p>
    </form>
  );
}
