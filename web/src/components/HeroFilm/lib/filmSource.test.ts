/**
 * HERO FILM — clip loading order, and the Blob fallback.
 *
 * The ORDER is the whole contract, and getting it backwards is silent: a
 * blob-first loader works fine on the developer's machine and leaves every
 * visitor on a Chrome profile with the URL safety check frozen on a poster.
 * The reverse mistake is just as quiet — a direct-only loader looks perfect
 * until it meets a host that answers a Range request with the whole file and a
 * 200, at which point `currentTime` stops being seekable and the film sticks.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { attachFilmSource } from './filmSource';

const URL_DIRECT = '/assets/video/topcat-intro-1920.mp4?v=8';
const URL_BLOB = 'blob:topcat/deadbeef';

let video: HTMLVideoElement;

beforeEach(() => {
  HTMLMediaElement.prototype.load = () => {};
  video = document.createElement('video');
  document.body.append(video);
});

afterEach(() => {
  video.remove();
  vi.restoreAllMocks();
});

/** A `fetch` that resolves to a body of `bytes` zero bytes. */
function okFetch(bytes = 8) {
  return vi.fn(async () => ({
    ok: true,
    status: 200,
    blob: async () => new Blob([new Uint8Array(bytes)], { type: 'video/mp4' }),
  })) as unknown as typeof fetch;
}

function harness(over: Partial<Parameters<typeof attachFilmSource>[2]> = {}) {
  const onFail = vi.fn();
  const onPainted = vi.fn();
  const revoked: string[] = [];
  const handle = attachFilmSource(video, URL_DIRECT, {
    onFail,
    onPainted,
    fetchImpl: okFetch(),
    createObjectURL: () => URL_BLOB,
    revokeObjectURL: (u) => revoked.push(u),
    ...over,
  });
  return { handle, onFail, onPainted, revoked };
}

describe('the direct URL comes first', () => {
  it('assigns the same-origin URL straight to the element', () => {
    const { handle } = harness();
    expect(video.getAttribute('src')).toBe(URL_DIRECT);
    expect(handle.viaBlob).toBe(false);
    handle.release();
  });

  it('does not fetch anything unless the element errors', async () => {
    const fetchImpl = okFetch();
    const { handle } = harness({ fetchImpl });
    // Byte ranges keep currentTime seekable and sidestep the blob: media
    // safety check, so on the happy path the 25 MB clip is never bought whole.
    await Promise.resolve();
    expect(fetchImpl).not.toHaveBeenCalled();
    handle.release();
  });
});

describe('the Blob fallback comes second', () => {
  it('buys the whole clip only after the direct URL has errored', async () => {
    const fetchImpl = okFetch();
    const { handle } = harness({ fetchImpl });

    video.dispatchEvent(new Event('error'));
    await vi.waitFor(() => expect(handle.viaBlob).toBe(true));

    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect((fetchImpl as unknown as ReturnType<typeof vi.fn>).mock.calls[0][0]).toBe(
      URL_DIRECT,
    );
    expect(video.getAttribute('src')).toBe(URL_BLOB);
    handle.release();
  });

  it('reports the DIRECT url as its identity even once it is serving a blob', async () => {
    // The band-change check in useHeroFilm compares against this. Compare
    // against `v.src` instead and a blob: URL matches no encode, so every
    // resize would re-download the film.
    const { handle } = harness();
    video.dispatchEvent(new Event('error'));
    await vi.waitFor(() => expect(handle.viaBlob).toBe(true));
    expect(handle.source).toBe(URL_DIRECT);
    handle.release();
  });

  it('fails only when the Blob path errors too', async () => {
    const { handle, onFail } = harness();

    video.dispatchEvent(new Event('error'));
    await vi.waitFor(() => expect(handle.viaBlob).toBe(true));
    // The first error was a fallback trigger, not a failure.
    expect(onFail).not.toHaveBeenCalled();

    video.dispatchEvent(new Event('error'));
    expect(onFail).toHaveBeenCalledTimes(1);
    expect(handle.exhausted).toBe(true);
    handle.release();
  });

  it('fails when the clip cannot be fetched at all', async () => {
    const fetchImpl = vi.fn(async () => ({
      ok: false,
      status: 404,
      blob: async () => new Blob(),
    })) as unknown as typeof fetch;
    const { handle, onFail } = harness({ fetchImpl });

    video.dispatchEvent(new Event('error'));
    await vi.waitFor(() => expect(onFail).toHaveBeenCalledTimes(1));
    expect(handle.viaBlob).toBe(false);
    handle.release();
  });

  it('fails on a network error rather than hanging on the poster forever', async () => {
    const fetchImpl = vi.fn(async () => {
      throw new TypeError('Failed to fetch');
    }) as unknown as typeof fetch;
    const { handle, onFail } = harness({ fetchImpl });

    video.dispatchEvent(new Event('error'));
    await vi.waitFor(() => expect(onFail).toHaveBeenCalledTimes(1));
    expect(handle.exhausted).toBe(true);
    handle.release();
  });
});

describe('the painted gate', () => {
  it('is off until the decoder has actually shown something', () => {
    const { handle, onPainted } = harness();
    expect(handle.painted).toBe(false);
    expect(video.dataset.painted).toBeUndefined();
    expect(onPainted).not.toHaveBeenCalled();
    handle.release();
  });

  it('flips on the first seeked, and only once', () => {
    const { handle, onPainted } = harness();
    video.dispatchEvent(new Event('seeked'));
    video.dispatchEvent(new Event('seeked'));
    expect(handle.painted).toBe(true);
    expect(video.dataset.painted).toBe('true');
    expect(onPainted).toHaveBeenCalledTimes(1);
    handle.release();
  });

  it('does NOT flip on loadeddata — readiness is not a painted frame', () => {
    // The reference keys its gate off `seeked` alone. `loadeddata` only says
    // the element has data for the current position; on iOS nothing is
    // composited until playback has been initiated once. If this flipped the
    // gate, the very first scrub away from frame 0 would drop the plate — the
    // plate curve reads `currentTime`, which reports the seek TARGET the
    // instant the seek is issued — over an element with nothing on it.
    const { handle, onPainted } = harness();
    video.dispatchEvent(new Event('loadeddata'));
    video.dispatchEvent(new Event('canplay'));
    video.dispatchEvent(new Event('loadedmetadata'));
    expect(handle.painted).toBe(false);
    expect(video.dataset.painted).toBeUndefined();
    expect(onPainted).not.toHaveBeenCalled();

    // ...and the seek that follows is still able to flip it.
    video.dispatchEvent(new Event('seeked'));
    expect(handle.painted).toBe(true);
    expect(onPainted).toHaveBeenCalledTimes(1);
    handle.release();
  });
});

describe('teardown', () => {
  it('revokes the object URL', async () => {
    const { handle, revoked } = harness();
    video.dispatchEvent(new Event('error'));
    await vi.waitFor(() => expect(handle.viaBlob).toBe(true));

    handle.release();
    expect(revoked).toEqual([URL_BLOB]);
  });

  it('aborts an in-flight clip fetch', async () => {
    let signal: AbortSignal | undefined;
    const fetchImpl = vi.fn((_url: string, init?: RequestInit) => {
      signal = init?.signal ?? undefined;
      return new Promise<never>(() => {});
    }) as unknown as typeof fetch;

    const { handle } = harness({ fetchImpl });
    video.dispatchEvent(new Event('error'));
    await vi.waitFor(() => expect(signal).toBeDefined());
    expect(signal!.aborted).toBe(false);

    handle.release();
    expect(signal!.aborted).toBe(true);
  });

  it('stops listening, so a late error cannot resurrect the loader', async () => {
    const fetchImpl = okFetch();
    const { handle, onFail } = harness({ fetchImpl });
    handle.release();

    video.dispatchEvent(new Event('error'));
    await Promise.resolve();
    expect(fetchImpl).not.toHaveBeenCalled();
    expect(onFail).not.toHaveBeenCalled();
  });

  it('is idempotent — a double release revokes once', async () => {
    const { handle, revoked } = harness();
    video.dispatchEvent(new Event('error'));
    await vi.waitFor(() => expect(handle.viaBlob).toBe(true));
    handle.release();
    handle.release();
    expect(revoked).toEqual([URL_BLOB]);
  });
});
