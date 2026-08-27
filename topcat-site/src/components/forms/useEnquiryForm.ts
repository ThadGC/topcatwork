'use client';

/* ==========================================================================
   The submit cycle shared by both enquiry forms — a port of `submit()`,
   `say()`, `rest()` and `mark()` (tcform.js:78–171).

   The legacy code mutates the DOM directly: it writes `.tc-bad` / `.tc-ok`
   on a note paragraph, stashes the note's resting text in `data-rest` so it
   can be put back, and toggles `aria-invalid` on the offending input. React
   holds the same three facts as state — `note`, `bad`, `sending` — and the
   components render them onto the same class names, so the CSS in
   assets/site.css and services/service.css needs no change at all.

   ⛔ NO NEXT API ROUTE, NO SERVER ACTION. `output: 'export'` forbids both,
   and the endpoint is now app/api/enquiry. This posts the same multipart
   body at it -- only the URL moved.
   ========================================================================== */

import { useCallback, useRef, useState } from 'react';

import {
  MAX_POST,
  MSG,
  firstName,
  sentMessage,
  validate,
  type ContactValues,
  type FieldName,
  type ValidationFailure,
} from '@/lib/form/validate';
import { buildPayload, postEnquiry, totalBytes } from '@/lib/form/payload';

export type NoteKind = 'bad' | 'ok' | '';

export interface Note {
  message: string;
  /** '' is the "Sending…" state: tcform.js:163 passes an empty kind. */
  kind: NoteKind;
}

export interface UseEnquiryFormOptions {
  /** The form's id — decides `form_name` (see formKind). */
  id: string;
  /** The form's classes — `qform` changes both `form_name` and the reply. */
  classNames: readonly string[];
  /** Reads the current values out of the form for `validate()`. */
  values: (form: HTMLFormElement) => ContactValues;
  /**
   * true for `.qform`: tcform.js:135 swaps the whole card for its thank-you
   * panel by adding `.sent` instead of writing a reply line.
   */
  swapOnSent?: boolean;
  /** Run after a successful send, alongside `form.reset()`. */
  onSent?: () => void;
}

export interface EnquiryForm {
  note: Note | null;
  bad: ReadonlySet<FieldName>;
  sending: boolean;
  sent: boolean;
  formRef: React.RefObject<HTMLFormElement | null>;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  /** tcform.js:179–181 — typing in a bad field clears it and the message. */
  onInput: (e: React.FormEvent<HTMLFormElement>) => void;
}

export function useEnquiryForm(opts: UseEnquiryFormOptions): EnquiryForm {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [note, setNote] = useState<Note | null>(null);
  const [bad, setBad] = useState<ReadonlySet<FieldName>>(() => new Set());
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const focus = useCallback((field: FieldName) => {
    const form = formRef.current;
    if (!form) return;
    const el = form.querySelector<HTMLElement>('[name="' + field + '"]');
    if (el && el.focus) el.focus();
  }, []);

  const fail = useCallback(
    (bad_: ValidationFailure) => {
      setBad(new Set(bad_.fields));
      setNote({ message: bad_.message, kind: 'bad' });
      focus(bad_.field);
    },
    [focus],
  );

  const onSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      /* tcform.js:175 — the form is `novalidate`, so this is the only gate. */
      e.preventDefault();
      const form = formRef.current;
      if (!form || sending) return;

      const problem = validate(opts.values(form));
      if (problem) {
        fail(problem);
        return;
      }
      setBad(new Set());

      const name = firstName(opts.values(form).name);
      const fd = buildPayload(form, { id: opts.id, classNames: opts.classNames });

      /* tcform.js:153–160 — before anything is sent, and before the button
         is disabled, because this failure is the visitor's to fix. */
      if (totalBytes(fd) > MAX_POST) {
        setNote({ message: MSG.oversize, kind: 'bad' });
        return;
      }

      setSending(true);
      setNote({ message: MSG.sending, kind: '' });

      postEnquiry(fd)
        .then(() => {
          if (opts.swapOnSent) {
            setSent(true);
            setNote(null);
          } else {
            setNote({ message: sentMessage(name), kind: 'ok' });
          }
          form.reset();
          opts.onSent?.();
        })
        .catch(() => {
          setNote({ message: MSG.failed, kind: 'bad' });
        })
        .then(() => {
          setSending(false);
        });
    },
    [fail, opts, sending],
  );

  /**
   * tcform.js:179–181. Only a field currently marked bad clears on input,
   * and clearing it also restores the note's resting text — which is why
   * `note` goes back to null rather than to some neutral string.
   */
  const onInput = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      const target = e.target as HTMLElement | null;
      const field = target?.getAttribute?.('name') as FieldName | null;
      if (!field || !bad.has(field)) return;
      const next = new Set(bad);
      next.delete(field);
      setBad(next);
      setNote(null);
    },
    [bad],
  );

  return { note, bad, sending, sent, formRef, onSubmit, onInput };
}

/** The class the legacy `mark()` writes, plus its aria partner. */
export function badProps(bad: ReadonlySet<FieldName>, field: FieldName) {
  const isBad = bad.has(field);
  return {
    className: isBad ? 'tc-bad' : undefined,
    'aria-invalid': isBad ? ('true' as const) : undefined,
  };
}
