/**
 * The procedural slab face — assets/site.js:690-691, 692-705, 706-740.
 *
 * Every stone with a photo in SLAB_TILES uses the photo; the rest (and the
 * porcelain stand-in, which has no slug at all) get an SVG drawn from a
 * palette and a seed. Ported because the estimator's `face()` needs it and the
 * legacy `marble()` lives outside the estimator IIFE.
 *
 * `UID` is a module-level counter in the source too — it only exists to keep
 * the SVG filter ids unique within a document, so it is client-only and never
 * part of a server render.
 */
import { tileURL } from './catalogue';

/** site.js:706-717 — the ten palettes. */
export const STONE_PALETTES: Record<string, { base: [string, string]; grey: string; gold: string; hair: string }> = {
  calacatta: { base: ['#F1ECE2', '#E4DCCC'], grey: 'rgba(120,124,130,0.30)', gold: 'rgba(198,166,100,0.55)', hair: 'rgba(150,150,155,0.22)' },
  statuario: { base: ['#F4F2EC', '#E8E6DE'], grey: 'rgba(90,95,105,0.34)', gold: 'rgba(198,166,100,0.30)', hair: 'rgba(120,124,132,0.20)' },
  carrara: { base: ['#E9E9E6', '#DADAD4'], grey: 'rgba(110,118,124,0.38)', gold: 'rgba(160,160,150,0.18)', hair: 'rgba(120,126,132,0.24)' },
  nerogold: { base: ['#111116', '#08080b'], grey: 'rgba(180,180,190,0.10)', gold: 'rgba(198,166,100,0.62)', hair: 'rgba(198,166,100,0.16)' },
  emperador: { base: ['#2a2018', '#17110b'], grey: 'rgba(120,90,60,0.22)', gold: 'rgba(198,166,100,0.48)', hair: 'rgba(180,140,90,0.16)' },
  eternal: { base: ['#EDE9E1', '#DFD8CB'], grey: 'rgba(105,110,118,0.28)', gold: 'rgba(198,166,100,0.40)', hair: 'rgba(140,144,150,0.20)' },
  goldveil: { base: ['#101015', '#0a0a0d'], grey: 'rgba(150,150,160,0.06)', gold: 'rgba(198,166,100,0.50)', hair: 'rgba(255,224,143,0.20)' },
  crema: { base: ['#EFE6D4', '#E2D5BC'], grey: 'rgba(150,130,100,0.26)', gold: 'rgba(198,166,100,0.40)', hair: 'rgba(160,140,110,0.20)' },
  mist: { base: ['#DDDEDC', '#CBCCC8'], grey: 'rgba(105,110,116,0.30)', gold: 'rgba(150,150,145,0.16)', hair: 'rgba(120,124,130,0.22)' },
  fumo: { base: ['#1E2024', '#141518'], grey: 'rgba(190,195,205,0.16)', gold: 'rgba(198,166,100,0.28)', hair: 'rgba(180,185,195,0.14)' },
};

let UID = 0;

/** site.js:691. */
function mulberry32(a: number): () => number {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** site.js:692-705. */
function vein(rng: () => number, w: number, h: number, startTop: boolean): string {
  let x = startTop ? rng() * w : -20;
  let y = startTop ? -20 : rng() * h;
  let d = `M ${x.toFixed(0)} ${y.toFixed(0)}`;
  const steps = 4 + Math.floor(rng() * 3);
  for (let i = 0; i < steps; i++) {
    const nx = startTop ? x + (rng() - 0.45) * w * 0.5 : x + w / steps + (rng() - 0.5) * 70;
    const ny = startTop ? y + h / steps + (rng() - 0.5) * 70 : y + (rng() - 0.5) * h * 0.5;
    const c1x = x + (nx - x) * 0.3 + (rng() - 0.5) * 55;
    const c1y = y + (rng() - 0.5) * 70;
    const c2x = x + (nx - x) * 0.7 + (rng() - 0.5) * 55;
    const c2y = ny + (rng() - 0.5) * 70;
    d += ` C ${c1x.toFixed(0)} ${c1y.toFixed(0)}, ${c2x.toFixed(0)} ${c2y.toFixed(0)}, ${nx.toFixed(0)} ${ny.toFixed(0)}`;
    x = nx;
    y = ny;
  }
  return d;
}

/** site.js:718-740 — three grey veins, two gold, four hairlines, then noise. */
export function marble(preset: string, seed: number): string {
  const p = STONE_PALETTES[preset] || STONE_PALETTES.calacatta;
  const rand = mulberry32(seed * 997 + 13);
  const id = ++UID;
  const w = 400;
  const h = 520;
  let veins = '';
  for (let i = 0; i < 3; i++)
    veins += `<path d="${vein(rand, w, h, i % 2 === 0)}" stroke="${p.grey}" stroke-width="${(6 + rand() * 10).toFixed(1)}" fill="none" stroke-linecap="round" filter="url(#b${id})"/>`;
  for (let i = 0; i < 2; i++)
    veins += `<path d="${vein(rand, w, h, i % 2 === 0)}" stroke="${p.gold}" stroke-width="${(2 + rand() * 4).toFixed(1)}" fill="none" stroke-linecap="round"/>`;
  for (let i = 0; i < 4; i++)
    veins += `<path d="${vein(rand, w, h, rand() > 0.5)}" stroke="${p.hair}" stroke-width="${(0.7 + rand() * 1.4).toFixed(1)}" fill="none" stroke-linecap="round"/>`;
  return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${p.base[0]}"/><stop offset="1" stop-color="${p.base[1]}"/></linearGradient>
      <filter id="b${id}"><feGaussianBlur stdDeviation="1.1"/></filter>
      <filter id="n${id}"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="${seed}"/><feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.06 0"/></filter>
      <radialGradient id="s${id}" cx="0.3" cy="0.12" r="1"><stop offset="0" stop-color="rgba(255,255,255,0.18)"/><stop offset="0.4" stop-color="rgba(255,255,255,0)"/></radialGradient>
    </defs>
    <rect width="${w}" height="${h}" fill="url(#g${id})"/>${veins}
    <rect width="${w}" height="${h}" filter="url(#n${id})"/>
    <rect width="${w}" height="${h}" fill="url(#s${id})"/></svg>`;
}

const faceCache: Record<string, string> = {};

/**
 * site.js:3711-3719 — the CSS `background-image` value for a stone.
 *
 * The photo wins when there is one. The drawn fallback is cached per
 * preset+seed and has its `preserveAspectRatio` swapped to `none` so it
 * stretches to the piece rather than cropping.
 */
export function face(preset: string, seed: number, slug?: string): string {
  const photo = tileURL(slug);
  if (photo) return "url('" + photo + "')";
  const k = preset + '·' + seed;
  if (!faceCache[k]) {
    const svg = marble(preset, seed).replace('preserveAspectRatio="xMidYMid slice"', 'preserveAspectRatio="none"');
    faceCache[k] = "url('data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg) + "')";
  }
  return faceCache[k];
}
