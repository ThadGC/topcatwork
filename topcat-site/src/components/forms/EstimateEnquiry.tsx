'use client';

/* ==========================================================================
   `<EstimateEnquiry>` — the enquiry form inside the estimator's right-hand
   board, `form.cta-form#estPoaForm`.

   WHY IT EXISTS. Marble & quartzite, granite and porcelain are POA: the
   calculator is replaced by the "priced by hand" panel, which offered an
   uploader and then two links out — one to `#cta` at the foot of the page,
   one to the phone. The client's 27 Aug note: "there's an option to add your
   files and measurements, but there's no form below that. So if someone
   chooses that, they need a form. And the form should go on the block on
   the right. So then they can add their plans or measurements and get in
   touch. And then it also still has to have those details."

   So the POA path now closes where it starts. The right board keeps its
   details — "Priced by hand", "Price on application", the stone and its
   finish, the what-is-included line — and this form sits under them, in the
   space the cutting-plan stats leave empty when there is no plan to draw.

   THE UPLOADER MOVED IN HERE WITH IT, out of the panel on the left. Leaving
   it there would have left the page with two drop zones and two identical
   gold "Get a price for this stone" buttons, which on a phone stack one
   above the other. The panel's primary link now points at this form instead.

   `@/lib/form/uploads` is still one list for the whole page, so a file
   attached here is the same file the CTA card at the foot of the page would
   send — the two uploaders on /estimate/ have always been two views of one
   store.

   THE STONE RIDES ALONG. `stone` is appended exactly as the wheel's chip is,
   so the enquiry lands in the inbox naming the slab it is about. The
   estimator's full state arrives separately as `estimate`, which
   lib/form/payload.ts reads out of localStorage for every form on the site.
   ========================================================================== */

import { useEffect } from 'react';

import { appendUploads, clearUploads } from '@/lib/form/uploads';
import TcUpload from './TcUpload';
import { badProps, useEnquiryForm } from './useEnquiryForm';

const CLASSES = ['cta-form'] as const;

export interface EstimateEnquiryProps {
  /**
   * The stone this enquiry is about, already formatted the way the CTA
   * card's chip formats it — "Carrara Honed · Marble". Sent as `stone`.
   */
  stone?: string;
}

export default function EstimateEnquiry({ stone = '' }: EstimateEnquiryProps) {
  const form = useEnquiryForm({
    id: 'estPoaForm',
    classNames: CLASSES,
    values: (f) => ({
      name: f.querySelector<HTMLInputElement>('[name="name"]')?.value,
      email: f.querySelector<HTMLInputElement>('[name="email"]')?.value,
      phone: f.querySelector<HTMLInputElement>('[name="phone"]')?.value,
      postcode: f.querySelector<HTMLInputElement>('[name="postcode"]')?.value,
    }),
    onSent: clearUploads,
  });

  /*
    CHAINED, NOT REPLACED. `window.TC_FORM_EXTRA` is a single global and the
    CTA card installs one too — on /estimate/ and on the home page both forms
    are mounted at once. Overwriting it would silently strip the other form's
    stone and attachments, so each link calls the one it displaced and every
    link ignores forms that are not its own.
  */
  useEffect(() => {
    const el = form.formRef.current;
    const previous = window.TC_FORM_EXTRA;
    window.TC_FORM_EXTRA = (fd, f) => {
      if (typeof previous === 'function') previous(fd, f);
      if (f !== el) return;
      if (stone) fd.append('stone', stone);
      appendUploads(fd);
    };
    return () => {
      window.TC_FORM_EXTRA = previous;
    };
  }, [form.formRef, stone]);

  const note = form.note;

  return (
    <form
      ref={form.formRef}
      className="cta-form est-form"
      id="estPoaForm"
      noValidate
      onSubmit={form.onSubmit}
      onInput={form.onInput}
    >
      <p className="est-form-lead">
        Send us your plans or measurements and we will price this stone by hand.
      </p>
      <div className="cta-row">
        <input
          type="text"
          name="name"
          placeholder="Your name"
          autoComplete="name"
          {...badProps(form.bad, 'name')}
        />
        <input
          type="email"
          name="email"
          placeholder="Email address"
          autoComplete="email"
          {...badProps(form.bad, 'email')}
        />
      </div>
      <div className="cta-row">
        <input
          type="tel"
          name="phone"
          placeholder="Phone number"
          autoComplete="tel"
          {...badProps(form.bad, 'phone')}
        />
        <input
          type="text"
          name="postcode"
          placeholder="Postcode"
          autoComplete="postal-code"
          {...badProps(form.bad, 'postcode')}
        />
      </div>
      <textarea name="message" placeholder="Anything else we should know" />
      {/* The FULL uploader, not the compact one: the compact variant only
          reveals its "seen it somewhere?" link field once something is
          attached, and the panel's bullets beside it promise that field
          outright ("a link to a slab you have seen"). */}
      <TcUpload />
      <button type="submit" className="cta-send" disabled={form.sending}>
        {form.sending ? 'Sending…' : 'Submit'}
      </button>
      <p
        className={
          'cta-reply' + (note?.kind === 'bad' ? ' tc-bad' : note?.kind === 'ok' ? ' tc-ok' : '')
        }
        role={note ? 'status' : undefined}
        aria-live={note ? 'polite' : undefined}
      >
        {note ? note.message : 'We reply within one working day.'}
      </p>
    </form>
  );
}
