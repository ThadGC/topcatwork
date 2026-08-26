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
export { useFilmScrub, scrubIsMobile } from './useFilmScrub';
export { useFilmTransport } from './useFilmTransport';
export type { FilmTransport } from './useFilmTransport';
export { useVideoFrame } from './useVideoFrame';
export type { PresentedFrame, VideoFrameHandle } from './useVideoFrame';

/** The default transport: coalesced seeks, epsilon deadband, target lerp. */
export {
  decideScrub,
  lerpToward,
  scrubEpsilon,
  DEFAULT_SCRUB,
  SRC_FRAME,
  HAVE_CURRENT_DATA,
} from './lib/scrub';
export type { ScrubCommand, ScrubConfig, ScrubInput } from './lib/scrub';

export { attachFilmSource } from './lib/filmSource';
export type { FilmSourceHandle, FilmSourceOptions } from './lib/filmSource';

export { filmMode, readFilmMode } from './lib/mode';
export type { FilmMode } from './lib/mode';

/** The alternative transport, reachable only through `?film=play`. */
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

/**
 * The reveal.
 *
 * `revealPanes` is what the engine drives: two composited clip panes, no
 * clip-path anywhere. `revealClip` and its two halves are the ORIGINAL polygon
 * geometry — no longer written to the DOM, kept because they are the definition
 * of the picture the panes are tested against.
 */
export {
  revealPanes,
  widePanes,
  phonePanes,
  wedgePane,
  cornerPane,
  paneSlant,
  paneLevel,
  insidePane,
  applyAffine,
  composeAffine,
  invertAffine,
  affineCss,
  IDENTITY,
  PANE_OFF,
  PANE_SEAM,
  WEDGE_BLEED,
  STRIP_BLEED,
  revealClip,
  wideClip,
  phoneClip,
  at,
} from './lib/reveal';
export type {
  RevealBox,
  RevealMetrics,
  RevealPanes,
  PaneBleed,
  Affine,
} from './lib/reveal';

export * from './lib/outputs';
export { coverFit, filmFrame, revealFrame, sampleRect } from './lib/geometry';
export { FrameSampler } from './lib/sampler';
