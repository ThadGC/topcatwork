/**
 * HERO FILM — how the clip gets into the element.
 *
 * Ported from VDM Digital's scroll-scrub engine (`loadClip` / `loadViaBlob` /
 * `attachVideo`). The order is the entire point, and the reference's own
 * comment explains why it is this way round rather than the other:
 *
 *   > Direct same-origin URL first. Both Vite dev and Cloudflare serve byte
 *   > ranges, so currentTime stays seekable, and it sidesteps the blob: media
 *   > safety check entirely. Only if that errors do we buy the whole file.
 *
 *   > This used to be the ONLY path. It is now second, because Chrome rejects
 *   > `blob:` media under its URL safety check in some profiles and policies
 *   > ("MEDIA_ELEMENT_ERROR: Media load rejected by URL safety check"), which
 *   > silently left every scene frozen on its poster. It stays as a fallback
 *   > because it is genuinely more reliable where byte-range support is poor.
 *
 * For Topcat the direct path is also the only one that scales: the desktop cut
 * is 25 MB and the blob path buys all of it before a single frame can be
 * scrubbed, whereas a byte-range seek fetches the one GOP it needs. The blob
 * path exists for the hosts that answer a Range request with the whole file
 * and a 200 — on those, `currentTime` silently stops being seekable, and a
 * clip you have entirely in memory always is.
 *
 * ── the difference from the reference ───────────────────────────────────────
 * The reference creates its own <video> per segment. Topcat has exactly one
 * film, it lives in JSX, and the frame sampler, the rVFC subscription and nine
 * refs are all bound to that element — so this attaches sources TO a given
 * element rather than creating one. Everything else is the same shape.
 */

export interface FilmSourceOptions {
  /** Called when BOTH the direct URL and the Blob fallback have failed. */
  onFail: () => void;
  /** Called once the element has painted a real frame (first `seeked`). */
  onPainted?: () => void;
  /** Injectable for tests. */
  fetchImpl?: typeof fetch;
  createObjectURL?: (blob: Blob) => string;
  revokeObjectURL?: (url: string) => void;
}

export interface FilmSourceHandle {
  /** The direct URL this handle was asked for. */
  readonly source: string;
  /** True once the Blob fallback has been attached. */
  readonly viaBlob: boolean;
  /** True once both paths have failed — the caller may stop waiting. */
  readonly exhausted: boolean;
  /** True once a real decoded frame has been painted. */
  readonly painted: boolean;
  /** Abort the in-flight fetch, drop listeners, revoke the object URL. */
  release(): void;
}

/** `video.load()` is not implemented in jsdom and throws on detached elements. */
function reload(video: HTMLVideoElement): void {
  try {
    video.load();
  } catch {
    /* the element will pick the src up on its own */
  }
}

/**
 * Point `video` at `source`, direct first and Blob second.
 *
 * The returned handle owns the AbortController and the object URL; calling
 * `release()` is mandatory on teardown or on a band change that swaps encodes.
 */
export function attachFilmSource(
  video: HTMLVideoElement,
  source: string,
  opts: FilmSourceOptions,
): FilmSourceHandle {
  const fetchImpl = opts.fetchImpl ?? (typeof fetch === 'function' ? fetch : undefined);
  const makeUrl =
    opts.createObjectURL ??
    (typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function'
      ? (b: Blob) => URL.createObjectURL(b)
      : undefined);
  const dropUrl =
    opts.revokeObjectURL ??
    (typeof URL !== 'undefined' && typeof URL.revokeObjectURL === 'function'
      ? (u: string) => URL.revokeObjectURL(u)
      : undefined);

  let released = false;
  let objectUrl: string | null = null;
  const abort = typeof AbortController === 'function' ? new AbortController() : null;

  const handle = {
    source,
    viaBlob: false,
    exhausted: false,
    painted: false,
    release() {
      if (released) return;
      released = true;
      video.removeEventListener('error', onDirectError);
      video.removeEventListener('error', onBlobError);
      video.removeEventListener('seeked', onSeeked);
      try {
        abort?.abort();
      } catch {
        /* already settled */
      }
      if (objectUrl) {
        dropUrl?.(objectUrl);
        objectUrl = null;
      }
    },
  };

  function fail() {
    if (released) return;
    handle.exhausted = true;
    opts.onFail();
  }

  /**
   * First real painted frame. `seeked` ONLY — the same event the reference
   * keys its `data-video-painted` flag off, and deliberately nothing else.
   *
   * `loadeddata` used to be wired up here too, on the theory that a film
   * parked at frame 0 should not sit under its plate. It bought nothing: the
   * plate's own opacity curve is already 1 at frame 0, so the gate is not what
   * is holding it there. What it cost was the exact case the gate exists for.
   * On the first scrub away from 0, `video.currentTime` reports the seek
   * TARGET the instant the seek is issued, long before that frame is decoded;
   * the plate curve reads the new time, drops to 0, and on iOS — which paints
   * nothing until playback has been initiated once — the plate comes off over
   * an empty element. Keyed off `seeked`, `painted` is still false at that
   * moment and the plate holds until a frame genuinely exists.
   */
  function onSeeked() {
    if (released || handle.painted) return;
    handle.painted = true;
    video.dataset.painted = 'true';
    opts.onPainted?.();
  }

  function onBlobError() {
    if (released) return;
    fail();
  }

  function onDirectError() {
    if (released) return;
    if (!fetchImpl || !makeUrl) {
      fail();
      return;
    }
    void loadViaBlob();
  }

  async function loadViaBlob() {
    try {
      const response = await fetchImpl!(source, abort ? { signal: abort.signal } : undefined);
      if (!response.ok) throw new Error('Clip failed: ' + response.status);
      const blob = await response.blob();
      if (released) return;
      objectUrl = makeUrl!(blob);
      handle.viaBlob = true;
      video.addEventListener('error', onBlobError, { once: true });
      video.src = objectUrl;
      reload(video);
    } catch (error) {
      if (released) return;
      if (error instanceof Error && error.name === 'AbortError') return;
      fail();
    }
  }

  video.addEventListener('error', onDirectError, { once: true });
  video.addEventListener('seeked', onSeeked, { once: true });
  delete video.dataset.painted;
  video.src = source;
  reload(video);

  return handle;
}
