/**
 * HERO FILM — public surface.
 *
 * Usage:
 *
 *   // app/layout.tsx — must be parse-time, see HeroFilmBoot's header
 *   <head><HeroFilmBoot /></head>
 *
 *   // app/page.tsx
 *   <HeroFilm trust={<TrustChips />}>
 *     <HeroCopy />
 *   </HeroFilm>
 *
 * Everything else in this folder is internal to the film; the lib modules are
 * exported because they are pure and unit-tested, and because the estimator
 * and the projects hall will want the same cover-fit helpers.
 */

export { HeroFilm, default } from './HeroFilm';
export type { HeroFilmProps } from './HeroFilm';
export { HeroFilmBoot } from './HeroFilmBoot';

export { useHeroFilm } from './useHeroFilm';
export type {
  HeroFilmApi,
  HeroFilmRefs,
  HeroFilmSources,
  HeroFilmPlates,
  UseHeroFilmOptions,
} from './useHeroFilm';

export { useCineBand, filmSupported } from './useCineBand';
export type { CineEnv } from './useCineBand';
export { useFilmTransport } from './useFilmTransport';
export type { FilmTransport } from './useFilmTransport';
export { useVideoFrame } from './useVideoFrame';
export type { PresentedFrame, VideoFrameHandle } from './useVideoFrame';

export {
  decideTransport,
  chaseRate,
  frameFor,
  frameTime,
  lastFrameIndex,
  DEFAULT_TRANSPORT,
} from './lib/transport';
export type {
  TransportCommand,
  TransportConfig,
  TransportInput,
} from './lib/transport';

export { STORY, HERO_COPY, beatWindow, pickBand } from './lib/timeline';
export type { Band, StoryBeat, BeatWindow } from './lib/timeline';

export { revealClip, wideClip, phoneClip, at } from './lib/reveal';
export type { RevealBox } from './lib/reveal';

export * from './lib/outputs';
export { coverFit, filmFrame, revealFrame, sampleRect } from './lib/geometry';
export { FrameSampler } from './lib/sampler';
