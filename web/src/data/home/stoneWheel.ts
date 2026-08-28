/**
 * The stone wheel's dataset — "Choose your stone" on the home page.
 *
 * PORTED FROM assets/site.js:
 *   827-828   MAT_LABEL / matLabel
 *   829-968   MATERIALS — the three material lists (Marble 45, Quartz 67,
 *             Granite 20). NOT re-extracted here; see THE ADAPTER below.
 *   969-983   SLAB_TILES / tileURL / tileSrcset / stoneMarkup
 *   985-1000  POPULAR — the hand-ordered preference list per material
 *   1262-1288 STONE_WORDS / STONE_FIXES — the filter's synonym tables
 *
 * THE ADAPTER
 * -----------
 * The legacy `MATERIALS` table is 132 hand-written object literals. Every
 * field of every one of them is already in `src/data/stones.json`, so this
 * module derives the table instead of copying it — a second copy would be a
 * second thing to keep true.
 *
 * The derivation was verified field-by-field against the legacy literals for
 * all 132 stones (`useStoneWheel.test.ts` re-checks the shape and the counts):
 *
 *   name    <- collection.tiles[].name
 *   slug    <- collection.tiles[].slug
 *   mat     <- collection.tiles[].data.mat      Quartz | Marble | Granite
 *   tone    <- collection.tiles[].data.tone
 *   hue     <- collection.tiles[].data.hue
 *   vein    <- collection.tiles[].data.vein
 *   finish  <- stones[].finish                  "Polished", capitalised
 *   kind    <- stones[].family via KIND_BY_FAMILY
 *   stone   <- stones[].estimator.p             palette preset
 *   seed    <- stones[].estimator.s             integer seed
 *
 * ORDER IS LOAD-BEARING. `clearOpening()` walks outward from the landing
 * stone through the list's own neighbours, so the belt it produces — and
 * therefore which slabs sit either side of centre — depends on the order of
 * each material list. `collection.tiles` is in the same order as the legacy
 * literals (both are the slug/name alphabetical order), and grouping the
 * tiles by `data.mat` while preserving tile order reproduces all three lists
 * exactly. Verified: the derived slug sequence is `===` the legacy one for
 * Quartz, Marble and Granite.
 *
 * TWO FIELDS OF THE LEGACY LITERAL ARE NOT CARRIED:
 *
 *   `sup` — the supplier ("Nile Stone", "CRL Stone", …). It is not in
 *     stones.json, it is never rendered, and the only consumer of the
 *     `topcat:stone` event it rides on reads `name`/`mat`/`kind` only
 *     (site.js:4392-4404, ContactForm.tsx:66-78). Suppliers are never named
 *     on this site, so it is not worth re-introducing to carry a dead field.
 *
 *   `silica` — it does not exist. NOT ONE of the 132 legacy literals has a
 *     `silica` key, so `s.silica` is `undefined` throughout: the silica
 *     filter chips can never match anything, and `syncSilicaGroup()`
 *     (site.js:1330-1345) consequently hides the whole "Silica" group on
 *     every material. That is the live behaviour, and the port keeps it —
 *     the field is declared optional and simply never set.
 */
import {
  collection,
  stones as stoneRecords,
  type StoneImage,
} from '@/lib/stones';

/** site.js:1037 — the three material buckets, and the only keys of MATERIALS. */
export type MatKey = 'Marble' | 'Quartz' | 'Granite';

/** One row of the legacy `MATERIALS` table. */
export interface WheelStone {
  name: string;
  slug: string;
  /** The selector/pricing bucket: Quartz | Marble | Granite. */
  mat: MatKey;
  /** The display family: Quartz | Quartzite | Marble | Granite | Travertine.
   *  This is what `.r-mat` shows, via `s.kind || s.mat` (site.js:1067). */
  kind: string;
  /** Palette preset for the procedural renderer — carried because the search
   *  haystack includes it (site.js:1296). */
  stone: string;
  /** Generator seed. Same reason. */
  seed: number;
  tone: string;
  hue: string;
  vein: string;
  /** Capitalised: "Polished", "Honed", "Leathered", "Brushed". */
  finish: string;
  /** Never set — see the header. Declared so `filterStones` can read it. */
  silica?: string;
  /** 800w slab crop, `/assets/slabs/<tile>-s.webp?v=3`. */
  img800: string;
  /** 1600w slab, `/assets/slabs/<tile>.webp?v=3`. */
  img1600: string;
}

/* ------------------------------------------------------------------ 827-828 */

export const MAT_LABEL: Record<string, string> = {
  Quartz: 'Quartz',
  Marble: 'Marble & Quartzite',
  Granite: 'Granite',
  Porcelain: 'Porcelain',
};
export const matLabel = (m: string): string => MAT_LABEL[m] || m;

/* ------------------------------------------------------------ the adapter */

/**
 * `StoneRecord.family` -> the legacy literal's `kind`. Checked against all
 * 132 literals: no exceptions, no stone where the two disagree.
 */
const KIND_BY_FAMILY: Record<string, string> = {
  quartz: 'Quartz',
  quartzite: 'Quartzite',
  granite: 'Granite',
  marble: 'Marble',
  travertine: 'Travertine',
};

const recordBySlug = new Map(stoneRecords.map((s) => [s.slug, s]));

/**
 * site.js:969-978 — `SLAB_TILES` maps a stone's slug to its slab FILENAME,
 * and the two differ for a dozen stones ("arctic-cream" -> "artic-cream",
 * "blue-pearl" -> "blue-pearl-gt", and ten more typo'd filenames). That map
 * is not restated here: `collection.tiles[].image` already carries the
 * resolved URLs, and they were verified equal to `tileURL()`/`tileSrcset()`
 * for all 132 slugs.
 */
function urlsFromTile(image: StoneImage): { img800: string; img1600: string } {
  const small = image.srcset.find((s) => s.descriptor === '800w');
  const large = image.srcset.find((s) => s.descriptor === '1600w');
  return { img800: small?.url ?? image.src, img1600: large?.url ?? image.src };
}

function buildMaterials(): Record<MatKey, WheelStone[]> {
  const out: Record<MatKey, WheelStone[]> = { Marble: [], Quartz: [], Granite: [] };
  for (const tile of collection.tiles) {
    const mat = tile.data.mat as MatKey;
    const rec = recordBySlug.get(tile.slug);
    if (!rec || !out[mat]) continue;
    const { img800, img1600 } = urlsFromTile(tile.image);
    out[mat].push({
      name: tile.name,
      slug: tile.slug,
      mat,
      kind: KIND_BY_FAMILY[rec.family] ?? rec.familyLabel,
      stone: rec.estimator.p,
      seed: parseInt(rec.estimator.s, 10),
      tone: tile.data.tone,
      hue: tile.data.hue,
      vein: tile.data.vein,
      finish: rec.finish,
      img800,
      img1600,
    });
  }
  return out;
}

/** site.js:829-968. Marble 45, Quartz 67, Granite 20. */
export const MATERIALS: Record<MatKey, WheelStone[]> = buildMaterials();

/* ---------------------------------------------------------------- 971-983 */

/**
 * site.js:975-983 — the slab `<img>` for one wheel tile.
 *
 * THREE THINGS ARE DELIBERATE AND NONE OF THEM MATCHES THE COLLECTION TILE:
 *
 *  1. `sizes` is `(max-width:700px) 60vw, 300px`. The collection tile's is
 *     `(max-width:700px) 45vw, 290px`. They are different budgets for
 *     different layouts — do not share one.
 *  2. `alt` is EMPTY. Each slab already carries its name in a `<span class=
 *     "name">` sibling, so alt text would read the name twice.
 *  3. THE 1600w CANDIDATE HAS NO LEADING SLASH. site.js:981 builds the
 *     srcset as
 *        '/assets/slabs/'+t+'-s.webp?v='+V+' 800w, assets/slabs/'+t+
 *        '.webp?v='+V+' 1600w'
 *     — absolute for 800w, RELATIVE for 1600w. On `/`, where the wheel
 *     lives, the relative form resolves to exactly the same file, which is
 *     why it has never been noticed. It is reproduced here rather than
 *     silently corrected; if the wheel is ever put on a nested route, THIS
 *     is the line that breaks, and it should break the same way the old
 *     build would have.
 *
 * The legacy function falls back to `marble(s.stone, s.seed)` — a procedural
 * SVG — when a slug has no slab photograph. That branch is unreachable: all
 * 132 slugs are in `SLAB_TILES`, so it is not ported (the generator itself is
 * a separate, unported piece of work).
 */
export function stoneMarkup(s: WheelStone): string {
  const relative1600 = s.img1600.replace(/^\//, '');
  return (
    '<img class="stone-photo" src="' +
    s.img1600 +
    '" srcset="' +
    s.img800 +
    ' 800w, ' +
    relative1600 +
    ' 1600w" sizes="(max-width:700px) 60vw, 300px" alt="" loading="lazy" fetchpriority="low" decoding="async">'
  );
}

/* ---------------------------------------------------------------- 985-1000 */

/**
 * site.js:985-1000, character for character.
 *
 * A hand-ordered preference list per material. `landingIndex()` walks it in
 * order and lands the wheel on the first entry that is present in the current
 * (possibly filtered) list AND is not a dark-tone stone — so the first name in
 * each array is the stone the section opens on. Quartz opens on Azul Shimmer.
 *
 * The order is the client's, not alphabetical and not derived from anything
 * in the data. Re-sorting it changes which stone the home page sells.
 */
export const POPULAR: Record<MatKey, string[]> = {
  Quartz: ['azul-shimmer', 'arabescato-elegance', 'calacatta-oro-quartz', 'borghini-royal',
    'calacatta-fantastico', 'laurent-black', 'marquina', 'carrara-jumbo', 'carrara-shimmer',
    'sahara-dunes', 'crema-tempest',
    'calacatta-gold-soft', 'arabescato-capri', 'arabescato-gold', 'grigio-fantasy',
    'almond-beige', 'arabescato-grey', 'crema-venato', 'crema-evora', 'sabbia-beige',
    'tuscany-supreme', 'misterio-gold', 'concrete-earth', 'fresh-cement', 'cloud-burst',
    'blue-lagoon'],
  Marble: ['carrara-honed', 'calacatta-gold-oro', 'calacatta-viola', 'fantastico-arni',
    'arabescato-vagli-oro', 'calacatta-vagli-oro', 'bianco-eclypsia-calacatta', 'nero-marquina',
    'taj-mahal', 'patagonia', 'cristallo', 'belvedere-leather', 'blue-roma', 'fusion-blue-leather',
    'fusion-black', 'lemurian-blue', 'venaria-reale', 'rainforest-brown', 'verde-guatemala',
    'travertine-romano-classico'],
  Granite: ['absolute-black-extra', 'bianco-crystal', 'azul-platino', 'colonial-cream', 'astoria',
    'blue-dunes-leather', 'colombo-juparana', 'antiq-brown-extra'],
};

/* --------------------------------------------------------------- 1262-1288 */

/**
 * site.js:1262-1283 — the filter search vocabulary.
 *
 * A term maps to a rule string. Space-separated groups must ALL hit; within a
 * group, `|`-separated alternatives are an OR. So `marbleeffect` ->
 * 'quartz statement|soft' means the stone must be quartz AND either
 * statement-veined or soft-veined.
 *
 * This is NOT the same table as `SCOPED`/`FIX` in lib/stones.ts. Those two
 * belong to the collection page and the compare picker, which search
 * pre-baked `data-attr`/`data-find` haystacks. The wheel builds its haystack
 * from the record's own fields (site.js:1290-1297) and matches with these.
 */
export const STONE_WORDS: Record<string, string> = {
  beige: 'cream', sand: 'cream', sandy: 'cream', biscuit: 'cream', ivory: 'cream|white',
  offwhite: 'white|cream', bright: 'light white', warm: 'cream', cool: 'grey|white',
  charcoal: 'dark grey|black', anthracite: 'dark grey|black', graphite: 'dark grey|black', silver: 'grey',
  navy: 'dark blue', teal: 'blue|green', gold: 'cream|gold', golden: 'cream|gold', brass: 'gold|cream',
  veiny: 'statement', veined: 'statement', veining: 'statement', bold: 'statement',
  dramatic: 'statement', busy: 'statement', patterned: 'statement', marbled: 'statement|soft',
  plain: 'calm', uniform: 'calm', solid: 'calm', simple: 'calm', subtle: 'calm|soft', quiet: 'calm|soft',
  matt: 'honed', matte: 'honed', flat: 'honed', satin: 'honed', gloss: 'polished', glossy: 'polished',
  shiny: 'polished', shine: 'polished', textured: 'leathered', rough: 'leathered', brushed: 'leathered',
  sparkle: 'shimmer', sparkly: 'shimmer', sparkling: 'shimmer', glitter: 'shimmer',
  crystal: 'shimmer|crystal', concrete: 'cement|concrete', industrial: 'cement|concrete',
  engineered: 'quartz', manmade: 'quartz', composite: 'quartz',
  natural: 'marble|granite|quartzite|travertine',
  hardwearing: 'quartz|granite|quartzite', durable: 'quartz|granite|quartzite',
  tough: 'granite|quartzite|quartz', practical: 'quartz|granite',
  lowmaintenance: 'quartz', hygienic: 'quartz',
  silicafree: 'silicafree', nosilica: 'silicafree', lowsilica: 'lowsilica',
  silicosis: 'silicafree|lowsilica', safe: 'silicafree|lowsilica',
  marbleeffect: 'quartz statement|soft', marblelook: 'quartz statement|soft',
  marblestyle: 'quartz statement|soft',
};

/** site.js:1284-1288. Misspellings corrected before matching. Note that this
 *  table also maps two words to themselves (`quartzite`, `emperador`) and one
 *  to a two-word phrase (`tajmahal` -> 'taj mahal'); kept verbatim. */
export const STONE_FIXES: Record<string, string> = {
  calcutta: 'calacatta', calcatta: 'calacatta', calacata: 'calacatta',
  calacutta: 'calacatta', calcata: 'calacatta', carara: 'carrara', carrera: 'carrara',
  carrarra: 'carrara', statuairo: 'statuario', statuary: 'statuario', marquena: 'marquina',
  marchina: 'marquina', arabascato: 'arabescato', arabesco: 'arabescato', quartzite: 'quartzite',
  guatamala: 'guatemala', emperador: 'emperador', tajmahal: 'taj mahal',
};
