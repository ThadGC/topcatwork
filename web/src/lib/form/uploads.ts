/* ==========================================================================
   The attachment store — a port of `TC_UP` (site.js:3497–3520).

   It is a MODULE SINGLETON, not component state, because the legacy object
   is one: the estimate page mounts two `.tc-up` roots (the compact one in
   the calculator, the full one in the marble "priced by hand" panel) and
   both read and write the same list. A file dropped on one appears on the
   other, and `TC_FORM_EXTRA` sends whatever is in the single list. Holding
   it in a component would break that, and would also lose the list every
   time the enquiry card's disclosure collapsed.

   The legacy broadcast is `document.dispatchEvent(new CustomEvent(
   'topcat:files'))`; that event is kept as well as the subscriber set, so a
   ported site.js island can still listen for it.

   ⚠️ The ceilings here are the CLIENT's. send.php enforces its own and they
   are not the same numbers: 50 MB a file (agrees), 100 MB a POST (checked in
   ../form/payload), and 12 MB total before attachments stop riding in the
   email and become download links instead. The extension list must stay in
   step with `$EXT_OK` in send.php:41 — a file this store accepts and PHP
   does not is a photo that vanishes silently.
   ========================================================================== */

export interface UploadItem {
  file: File;
  /** An object URL for images, used as the thumbnail. '' for documents. */
  url: string;
}

/** site.js:3498 */
export const UP_MAX = 8;
/** site.js:3498 — 50 MB, matching `$FILE_MAX` in send.php. */
export const UP_MAXB = 50 * 1024 * 1024;
/** site.js:3499 — same list, same order, as `$EXT_OK` in send.php:41. */
export const UP_EXT = [
  'pdf',
  'jpg',
  'jpeg',
  'png',
  'heic',
  'heif',
  'webp',
  'gif',
  'doc',
  'docx',
  'dwg',
  'dxf',
] as const;

/** The `accept` attribute the legacy markup builds from UP_EXT. */
export const UP_ACCEPT = UP_EXT.map((e) => '.' + e).join(',');

let files: UploadItem[] = [];
let link = '';

const listeners = new Set<() => void>();

function emit(): void {
  /* site.js:3519 — kept so any other island still hears it. */
  if (typeof document !== 'undefined') {
    document.dispatchEvent(new CustomEvent('topcat:files'));
  }
  listeners.forEach((fn) => fn());
}

export function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function getFiles(): UploadItem[] {
  return files;
}

export function getLink(): string {
  return link;
}

/** site.js:3500 — KB under a megabyte, one decimal MB above it. */
export function fmtSize(b: number): string {
  return b < 1048576
    ? Math.max(1, Math.round(b / 1024)) + ' KB'
    : (b / 1048576).toFixed(1) + ' MB';
}

/**
 * site.js:3501–3514. Returns the messages to show, and the messages are the
 * source's own — the curly quotes around the filename included.
 *
 * The rules, in order: stop at MAX and say so once; reject an unknown
 * extension; reject an oversized file; silently skip an exact duplicate
 * (same name AND same size).
 */
export function addFiles(incoming: ArrayLike<File> | Iterable<File>): string[] {
  const bad: string[] = [];
  for (const f of Array.from(incoming as Iterable<File>)) {
    if (files.length >= UP_MAX) {
      bad.push('You can attach up to ' + UP_MAX + ' files. The rest were not added.');
      break;
    }
    const ext = (f.name.split('.').pop() || '').toLowerCase();
    if ((UP_EXT as readonly string[]).indexOf(ext) < 0) {
      bad.push('“' + f.name + '” is not a file we can open.');
      continue;
    }
    if (f.size > UP_MAXB) {
      bad.push(
        '“' +
          f.name +
          '” is over ' +
          Math.round(UP_MAXB / 1048576) +
          ' MB, please send a smaller copy.',
      );
      continue;
    }
    if (files.some((x) => x.file.name === f.name && x.file.size === f.size)) continue;
    files = files.concat({
      file: f,
      url: /^image\//.test(f.type) ? URL.createObjectURL(f) : '',
    });
  }
  emit();
  return bad;
}

/** site.js:3515–3518 — the object URL is revoked, not leaked. */
export function removeFile(i: number): void {
  const it = files[i];
  if (!it) return;
  if (it.url) URL.revokeObjectURL(it.url);
  files = files.slice(0, i).concat(files.slice(i + 1));
  emit();
}

/** site.js:3519 — trimmed and cut to 300, which is `fld('stone_link',300)`. */
export function setLink(v: string): void {
  link = String(v || '')
    .trim()
    .slice(0, 300);
  emit();
}

/**
 * Called after a successful send, mirroring `f.reset()` on the text fields:
 * the legacy page reloads its uploader state only because the enquiry card
 * is not re-rendered, but leaving eight files attached to an empty form
 * would re-send them on the next enquiry.
 */
export function clearUploads(): void {
  files.forEach((it) => {
    if (it.url) URL.revokeObjectURL(it.url);
  });
  files = [];
  link = '';
  emit();
}

/**
 * site.js:4370–4371 — the two names send.php looks for. `stone_link` is a
 * plain string field; the files are `file1`…`fileN`, which is why send.php
 * iterates `$_FILES` rather than naming them.
 */
export function appendUploads(fd: FormData): void {
  if (link) fd.append('stone_link', link);
  files.forEach((it, i) => fd.append('file' + (i + 1), it.file, it.file.name));
}
