'use client';

/* ==========================================================================
   `.tc-up` — the plans/photos dropzone. A port of `mountUpload()` and
   `renderUploads()` (site.js:3521–3585), which build this markup as an
   innerHTML string. Every class name below is load-bearing: the styling
   lives in assets/site.css and is not being touched.

   ⚠️ THE FILE INPUT HAS NO `name`, DELIBERATELY. An unnamed control is not a
   successful control, so `new FormData(form)` skips it. The files reach
   send.php only through `TC_FORM_EXTRA`, as `file1`…`fileN`. Give this input
   a name and every attachment is posted twice.

   The `compact` variant is the one inside the estimator; it changes the two
   lines of copy and hides the "seen it somewhere" link until there is
   something to show.
   ========================================================================== */

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';

import {
  UP_ACCEPT,
  UP_MAX,
  addFiles,
  fmtSize,
  getFiles,
  getLink,
  removeFile,
  setLink,
  subscribe,
} from '@/lib/form/uploads';

export interface TcUploadProps {
  compact?: boolean;
}

const EMPTY_FILES: never[] = [];
const getFilesServer = () => EMPTY_FILES;
const getLinkServer = () => '';

export default function TcUpload({ compact = false }: TcUploadProps) {
  /* getServerSnapshot must return a STABLE reference. An inline `() => []`
     builds a new array per call, which React detects as a changed snapshot and
     warns "The result of getServerSnapshot should be cached to avoid an
     infinite loop". Module-level constants below. */
  const files = useSyncExternalStore(subscribe, getFiles, getFilesServer);
  const link = useSyncExternalStore(subscribe, getLink, getLinkServer);
  const [errors, setErrors] = useState<string[]>([]);
  const [over, setOver] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const dropRef = useRef<HTMLDivElement | null>(null);
  const linkRef = useRef<HTMLInputElement | null>(null);

  /*
    site.js:3583 — the link box is written back from the store only when it
    is not the focused element, so a re-render never fights the typist.
  */
  useEffect(() => {
    const el = linkRef.current;
    if (el && el.value !== link && document.activeElement !== el) el.value = link;
  }, [link]);

  const browse = useCallback(() => inputRef.current?.click(), []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setOver(false);
    if (e.dataTransfer && e.dataTransfer.files.length) {
      setErrors(addFiles(e.dataTransfer.files));
    }
  }, []);

  return (
    <div className={compact ? 'tc-up compact' : 'tc-up'}>
      <div
        ref={dropRef}
        className={over ? 'tc-up-drop over' : 'tc-up-drop'}
        tabIndex={0}
        role="button"
        aria-label="Add plans, measurements or photos"
        onClick={browse}
        onKeyDown={(e) => {
          /* site.js:3541 — Enter and Space both open the picker. */
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            browse();
          }
        }}
        onDragEnter={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDragEnd={() => setOver(false)}
        onDrop={onDrop}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 16V4" />
          <path d="m7.5 8.5 4.5-4.5 4.5 4.5" />
          <path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
        </svg>
        <span className="tc-up-txt">
          <b>
            {compact ? (
              <>
                Rather send your plans? <u>Attach them</u>
              </>
            ) : (
              'Add your plans, measurements or photos'
            )}
          </b>
          <small>
            {compact
              ? 'A drawing, a sketch or a photo of the room. We will price it exactly.'
              : 'Drag them in or browse. PDF, photos, sketches or a designer’s drawing, up to 8 files.'}
          </small>
        </span>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={UP_ACCEPT}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => {
            setErrors(addFiles(e.target.files ?? []));
            /* site.js:3544 — cleared so re-picking the same file re-fires. */
            e.target.value = '';
          }}
        />
      </div>

      <p className="tc-up-err" role="alert" hidden={!errors.length}>
        {errors.join(' ')}
      </p>

      <ul className="tc-up-list">
        {files.map((it, i) => {
          const ext = (it.file.name.split('.').pop() || 'file').toUpperCase().slice(0, 4);
          return (
            <li className="tc-up-item" key={it.file.name + ':' + it.file.size}>
              <span
                className="tc-up-thumb"
                style={it.url ? { backgroundImage: 'url("' + it.url + '")' } : undefined}
                aria-hidden="true"
              >
                {it.url ? '' : ext}
              </span>
              <span className="tc-up-name">
                {it.file.name}
                <span>{fmtSize(it.file.size)}</span>
              </span>
              <button
                type="button"
                className="tc-up-x"
                data-i={i}
                aria-label={'Remove ' + it.file.name}
                onClick={() => {
                  removeFile(i);
                  /* site.js:3558–3560 — focus the next remove button, or
                     fall back to the dropzone when the list empties. */
                  requestAnimationFrame(() => {
                    const root = dropRef.current?.parentElement;
                    const xs = root?.querySelectorAll<HTMLElement>('.tc-up-x');
                    const next = xs && xs.length ? xs[Math.min(i, xs.length - 1)] : null;
                    (next ?? dropRef.current)?.focus();
                  });
                }}
              >
                ×
              </button>
            </li>
          );
        })}
        {files.length ? (
          <li className="tc-up-morerow">
            {files.length >= UP_MAX ? (
              <span className="tc-up-cap">
                {UP_MAX} of {UP_MAX} files attached
              </span>
            ) : (
              <>
                <button type="button" className="tc-up-add" onClick={browse}>
                  <span aria-hidden="true">+</span> Add another file
                </button>
                <span className="tc-up-cap">
                  {files.length} of {UP_MAX}
                </span>
              </>
            )}
          </li>
        ) : null}
      </ul>

      <label
        className={
          compact && (files.length || link) ? 'tc-up-link show' : 'tc-up-link'
        }
      >
        <span>Seen the stone you want somewhere? Paste the link and we will source it</span>
        <input
          ref={linkRef}
          type="url"
          inputMode="url"
          placeholder="https://"
          aria-label="Link to the stone you have seen"
          defaultValue={link}
          onChange={(e) => setLink(e.target.value)}
        />
      </label>
    </div>
  );
}
