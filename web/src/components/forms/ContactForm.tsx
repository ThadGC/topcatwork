'use client';

/* ==========================================================================
   `<ContactForm>` — the enquiry card, `form.cta-form#ctaForm`.

   The same block of markup appears verbatim on /contact/, /about/,
   /estimate/ and /projects/ (and in the home page's #cta), which is the
   whole reason it is a component. send.php identifies it by id: `ctaForm`
   becomes `form_name: "Enquiry card"` in the client's inbox.

   It posts to /send.php. It does not go through a Next route handler or a
   server action, because `output: 'export'` has neither and because the PHP
   endpoint is staying exactly as it is.

   Three things ride along that are not inputs:
     - the stone chip, set by the stone wheel through a `topcat:stone` event;
     - `stone_link`, typed into the uploader;
     - `file1`…`fileN`, the attachments.
   All three are appended by `window.TC_FORM_EXTRA`, which this component
   installs while it is mounted — the same hook site.js:4366 installs, and
   for the same reason: the payload builder must not have to know which
   islands happen to be on the page.
   ========================================================================== */

import { useEffect, useState } from 'react';

import { appendUploads, clearUploads, getFiles, getLink, subscribe } from '@/lib/form/uploads';
import TcUpload from './TcUpload';
import { badProps, useEnquiryForm } from './useEnquiryForm';

/** The detail the stone wheel dispatches (site.js). */
interface StoneDetail {
  name: string;
  mat?: string;
  slug?: string;
  /** The wheel's own label for the stone family, e.g. "Quartz". */
  kind?: string;
}

const CLASSES = ['cta-form'] as const;

export default function ContactForm() {
  const [stone, setStone] = useState<string>('');
  const [upOpen, setUpOpen] = useState(false);
  const [upCount, setUpCount] = useState('');

  const form = useEnquiryForm({
    id: 'ctaForm',
    classNames: CLASSES,
    values: (f) => ({
      name: f.querySelector<HTMLInputElement>('[name="name"]')?.value,
      email: f.querySelector<HTMLInputElement>('[name="email"]')?.value,
      phone: f.querySelector<HTMLInputElement>('[name="phone"]')?.value,
      postcode: f.querySelector<HTMLInputElement>('[name="postcode"]')?.value,
    }),
    onSent: () => {
      /* `form.reset()` empties the inputs but knows nothing about the file
         store or the stone chip; leaving either attached would send them
         again with the next enquiry. */
      clearUploads();
      setStone('');
    },
  });

  /* site.js:4396–4407 — the chip is filled by the stone wheel and cleared by
     dispatching the same event with a null detail. */
  useEffect(() => {
    const onStone = (e: Event) => {
      const d = (e as CustomEvent<StoneDetail | null>).detail;
      if (!d) {
        setStone('');
        return;
      }
      setStone(d.mat ? `${d.name} · ${d.kind ?? d.mat}` : d.name);
    };
    document.addEventListener('topcat:stone', onStone);
    return () => document.removeEventListener('topcat:stone', onStone);
  }, []);

  /* site.js:4366–4372 — the hook the payload builder calls. */
  useEffect(() => {
    const el = form.formRef.current;
    const previous = window.TC_FORM_EXTRA;
    window.TC_FORM_EXTRA = (fd, f) => {
      if (f !== el) return;
      if (stone) fd.append('stone', stone);
      appendUploads(fd);
    };
    return () => {
      window.TC_FORM_EXTRA = previous;
    };
  }, [form.formRef, stone]);

  /* site.js:4383–4391 — the count in the disclosure header, and the rule
     that attaching anything springs the panel open. */
  useEffect(() => {
    const sync = () => {
      const n = getFiles().length;
      setUpCount(n ? (n === 1 ? '1 file' : n + ' files') : getLink() ? 'link added' : '');
      if (n || getLink()) setUpOpen(true);
    };
    sync();
    return subscribe(sync);
  }, []);

  const note = form.note;

  return (
    <form
      ref={form.formRef}
      className="cta-form"
      id="ctaForm"
      noValidate
      onSubmit={form.onSubmit}
      onInput={form.onInput}
    >
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
      <div className="cta-stone" id="ctaStone" hidden={!stone}>
        <span className="cs-label">Your stone</span>
        <span className="cs-name" id="ctaStoneName">
          {stone}
        </span>
        <button
          type="button"
          className="cs-x"
          id="ctaStoneX"
          aria-label="Remove the stone from this enquiry"
          onClick={() =>
            document.dispatchEvent(new CustomEvent('topcat:stone', { detail: null }))
          }
        >
          ×
        </button>
      </div>
      <textarea name="message" placeholder="Message" />
      <div className={upOpen ? 'cta-up open' : 'cta-up'} id="ctaUp">
        <button
          type="button"
          className="cta-up-t"
          id="ctaUpT"
          aria-expanded={upOpen}
          aria-controls="ctaUpBody"
          onClick={() => setUpOpen((v) => !v)}
        >
          <span className="cu-mk" aria-hidden="true"></span>
          <span className="cu-txt">Add plans or measurements</span>
          <span className="cu-count" id="ctaUpN">
            {upCount}
          </span>
        </button>
        <div className="cta-up-body" id="ctaUpBody">
          <div className="cta-up-in">
            <TcUpload />
          </div>
        </div>
        {/* 50 MB is send.php's `$FILE_MAX`, and TC_UP's `MAXB`. */}
        <div className="cu-maxnote" aria-hidden="true">
          Max 50 MB per file
        </div>
      </div>
      <button type="submit" className="cta-send" disabled={form.sending}>
        {form.sending ? 'Sending…' : 'Send my enquiry'}
      </button>
      <div className="cta-next">
        <span className="cn-k">What happens next</span>
        <ol className="cn-list">
          <li>We call you back to talk it through, no pressure.</li>
          <li>A free home visit with samples, at a time that suits you.</li>
          <li>A fixed, itemised price in writing, before anything is cut.</li>
        </ol>
      </div>
      <p
        className={
          'cta-reply' + (note?.kind === 'bad' ? ' tc-bad' : note?.kind === 'ok' ? ' tc-ok' : '')
        }
        id="ctaReply"
        role={note ? 'status' : undefined}
        aria-live={note ? 'polite' : undefined}
      >
        {note ? note.message : 'We reply within one working day.'}
      </p>
    </form>
  );
}
