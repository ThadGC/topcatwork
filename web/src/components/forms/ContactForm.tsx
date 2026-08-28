'use client';

/* ==========================================================================
   `<ContactForm>` — the enquiry card, `form.cta-form#ctaForm`.

   The same block of markup appears verbatim on /contact/, /about/,
   /estimate/ and /projects/ (and in the home page's #cta), which is the
   whole reason it is a component. send.php identifies it by id: `ctaForm`
   becomes `form_name: "Enquiry card"` in the client's inbox.

   It posts to the enquiry route handler. It used to post to /send.php, which
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

import { type WheelStone } from '@/data/home/stoneWheel';
import { chipKind, chipLabel, readStoneLink } from '@/lib/form/stoneDeepLink';
import { appendUploads, clearUploads, getFiles, getLink, subscribe } from '@/lib/form/uploads';
import StonePickerModal from './StonePickerModal';
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

export interface ContactFormProps {
  /**
   * Offer a stone picker when no stone has been chosen.
   *
   * ⛔ REVERSED, 28 Aug. It used to default OFF, on his 27 Aug line: "on the
   * home page, the get in touch form, if someone hasn't selected a stone, they
   * should be able to choose... but it has to say that it's optional. It
   * doesn't have to be on the inner contact forms."
   *
   * He changed his mind on 28 Aug, having seen it: "the contact form currently
   * doesn't have the choose your stone option like the other form has. So make
   * sure that all the major contact forms are correct." So it now defaults ON
   * and every form that renders this component offers it.
   *
   * The prop is kept rather than deleted: it is still the switch for any form
   * where the question would not make sense, and the argument for turning it
   * off somewhere is the same argument as before.
   */
  stonePicker?: boolean;
}

export default function ContactForm({ stonePicker = true }: ContactFormProps = {}) {
  const [stone, setStone] = useState<string>('');
  const [upOpen, setUpOpen] = useState(false);
  const [upCount, setUpCount] = useState('');
  /* The stone popup — see StonePickerModal.tsx. */
  const [pickOpen, setPickOpen] = useState(false);

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
      /* `kind` is the DISPLAY family and `mat` is the PRICING bucket, and they
         differ for 27 of the 132 stones — every quartzite and the travertine
         sit in the "Marble" bucket. The wheel sends no `kind` at all
         (site.js:1431 dispatches name/mat/stone/seed/slug/sup), so without the
         catalogue lookup those 27 read "· Marble" where the live site reads
         "· Quartzite". `chipKind` is site.js:4362-4365. */
      setStone(d.mat ? `${d.name} · ${d.kind ?? chipKind(d) ?? d.mat}` : d.name);
    };
    document.addEventListener('topcat:stone', onStone);
    return () => document.removeEventListener('topcat:stone', onStone);
  }, []);

  /*
    THE `?stone=` DEEP LINK — site.js:4585-4603, which the port dropped.

    Every stone page's "Get an estimate for this stone" arrives here carrying
    the stone in the query string. See lib/form/stoneDeepLink.ts for why this
    sets state directly rather than dispatching an event and listening for it:
    a sibling component's effect runs BEFORE the listener above is attached, so
    the event would land with nobody listening.

    The re-broadcast on a zero timeout is only for the OTHER listener — the
    estimator's, at useEstimator.ts:254 — which matters on the pages where
    <Estimator/> and <Cta/> are both mounted. By then every effect has run.

    `location.search`, not `useSearchParams()`: the hook forces the route into
    a Suspense boundary under `output: 'export'`. StoneCompare.tsx:71-79 makes
    the same call for the same reason.
  */
  useEffect(() => {
    const d = readStoneLink(window.location.search);
    if (!d) return;
    setStone(chipLabel(d));
    const id = window.setTimeout(() => {
      document.dispatchEvent(
        new CustomEvent('topcat:stone', {
          detail: { name: d.name, mat: d.mat, kind: chipKind(d), slug: d.slug },
        }),
      );
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  /* site.js:4366–4372 — the hook the payload builder calls.

     CHAINED, NOT REPLACED. The estimator's POA form installs one too, and on
     /estimate/ and the home page both are mounted at once; whichever mounted
     last would otherwise strip the other's stone and attachments. Every link
     ignores forms that are not its own, so chaining is safe. */
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

  /* Choosing here dispatches the SAME event the wheel dispatches, so the
     chip, the payload and any other listener are fed by one path. The picker
     hands over the record itself, so there is no slug to look back up. */
  const onPick = (hit: WheelStone) => {
    document.dispatchEvent(
      new CustomEvent('topcat:stone', {
        detail: {
          name: hit.name,
          mat: hit.mat,
          kind: hit.kind,
          stone: hit.stone,
          seed: hit.seed,
          slug: hit.slug,
        },
      }),
    );
  };

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
      {/* The picker and the chip are one slot: pick a stone and the chip
          replaces the trigger, clear the chip and the trigger comes back.

          This was a bare `<select>` of 132 names until 27 Aug. The client:
          "it only has the names. The choose your stone should create a pop up
          window where it takes them to the all stone section, and they can
          just choose their stone" — and, separately, that any dropdown here
          must be custom-coded rather than the device's own. The trigger wears
          the uploader's dashed row so the two optional additions to an
          enquiry read as a pair, and it is a fraction of the height the
          select box was. */}
      <textarea name="message" placeholder="Message" />
      {stonePicker && !stone ? (
        <>
          <button
            type="button"
            id="ctaStonePick"
            className="cta-up-t cta-stonet"
            aria-haspopup="dialog"
            aria-expanded={pickOpen}
            onClick={() => setPickOpen(true)}
          >
            <span className="cs-mk" aria-hidden="true" />
            <span>Choose your stone (optional)</span>
            <span className="cs-more" aria-hidden="true">
              Browse
            </span>
          </button>
          <StonePickerModal open={pickOpen} onClose={() => setPickOpen(false)} onPick={onPick} />
        </>
      ) : null}
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
