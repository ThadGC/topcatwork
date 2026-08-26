/**
 * HERO FILM — the `?film=` transport switch.
 *
 * The default matters more than the switch does: anything that is not exactly
 * `play` must land on the VDM scrub, because a typo in a URL is not consent to
 * ship the experiment.
 */

import { describe, it, expect } from 'vitest';
import { readFilmMode } from './mode';

describe('readFilmMode', () => {
  it('defaults to the disciplined-seek scrub', () => {
    expect(readFilmMode('')).toBe('scrub');
    expect(readFilmMode('?utm_source=x')).toBe('scrub');
  });

  it('opts into the forward-play chase only on an exact match', () => {
    expect(readFilmMode('?film=play')).toBe('play');
    expect(readFilmMode('?a=1&film=play')).toBe('play');
    expect(readFilmMode('?film=PLAY')).toBe('play');
  });

  it('treats anything else as the default', () => {
    for (const search of ['?film=', '?film=scrub', '?film=playback', '?filmy=play']) {
      expect(readFilmMode(search), search).toBe('scrub');
    }
  });

  it('survives a malformed escape rather than throwing on it', () => {
    expect(readFilmMode('?film=%E0%A4%A')).toBe('scrub');
  });
});
