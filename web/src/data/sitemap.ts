/* ==========================================================================
   /sitemap.html — the page's own link list, lifted verbatim out of the live
   sitemap.html.

   Hand-written on the legacy site, so it is carried as data rather than
   derived from src/data/*.json. The two are NOT the same list and must not be
   unified: the sitemap's labels are editorial ("Calacatta Oro" for
   calacatta-oro-quartz.html, "Patagonia Extra" for patagonia.html, "Venaria"
   for venaria-reale.html), its counts are the source's own reading (Materials
   says "5 pages" above six links and Guides "9 pages" above ten, because the
   hub link is not counted), and its first group lists ten in-page anchors
   that are not separate URLs at all. Deriving any of it would quietly rewrite
   the page.
   ========================================================================== */

export interface SitemapLink {
  readonly href: string;
  readonly label: string;
}

export interface SitemapStoneColumn {
  readonly title: string;
  /** The `<span class="sm-count">` beside the `<h3>`. */
  readonly count: string;
  readonly links: readonly SitemapLink[];
}

export interface SitemapGroup {
  readonly title: string;
  /** The `<span class="sm-count">` beside the `<h2>`. */
  readonly count: string;
  /** `<p class="note">`. Two of the six groups have none. */
  readonly note?: string;
  /** A flat `<ul class="rel two-up">` — every group but the stones. */
  readonly links?: readonly SitemapLink[];
  /** `<div class="sm-stones">` — the stones group only. */
  readonly columns?: readonly SitemapStoneColumn[];
}

export const SITEMAP_LEDE =
  'Every page on the site, in one place. If you are looking for something ' +
  'specific and cannot find it here, call us on 0800 098 2812 and we will ' +
  'point you at it.';

export const SITEMAP_GROUPS: readonly SitemapGroup[] = [
  {
    title: 'The main pages',
    count: '12 links',
    note: 'The landing page is a single page, so the entries below the first one are sections of it rather than separate URLs.',
    links: [
      { href: '/index.html', label: 'Home' },
      { href: '/index.html#services', label: 'Surfaces for every space' },
      { href: '/index.html#gallery', label: 'Project gallery' },
      { href: '/index.html#stones', label: 'The stone collection' },
      { href: '/index.html#estimator', label: 'Price estimator' },
      { href: '/index.html#process', label: 'Our process' },
      { href: '/index.html#about', label: 'About us' },
      { href: '/index.html#why', label: 'Why choose us' },
      { href: '/index.html#faq', label: 'Frequently asked questions' },
      { href: '/index.html#cta', label: 'Get a quote' },
      { href: '/trade/', label: 'For the trade' },
      { href: '/sitemap.html', label: 'Sitemap' },
    ],
  },
  {
    title: 'Services',
    count: '9 pages',
    links: [
      { href: '/services/kitchen-worktops.html', label: 'Kitchen worktops' },
      { href: '/services/kitchen-islands.html', label: 'Kitchen islands and waterfall ends' },
      { href: '/services/splashbacks.html', label: 'Splashbacks and upstands' },
      { href: '/services/bathroom-worktops.html', label: 'Bathroom worktops and shower surrounds' },
      { href: '/services/vanity-tops.html', label: 'Stone vanity tops' },
      { href: '/services/outdoor-kitchens.html', label: 'Outdoor kitchen worktops' },
      { href: '/services/fireplaces.html', label: 'Fireplace surrounds, hearths and mantels' },
      { href: '/services/dining-tables.html', label: 'Stone dining tables' },
      { href: '/services/commercial-worktops.html', label: 'Commercial stone surfaces' },
    ],
  },
  {
    title: 'Materials',
    count: '5 pages',
    links: [
      { href: '/materials/', label: 'All materials' },
      { href: '/materials/quartz-worktops.html', label: 'Quartz worktops' },
      { href: '/materials/granite-worktops.html', label: 'Granite worktops' },
      { href: '/materials/marble-worktops.html', label: 'Marble worktops' },
      { href: '/materials/porcelain-worktops.html', label: 'Porcelain worktops' },
      { href: '/materials/quartzite-worktops.html', label: 'Quartzite worktops' },
    ],
  },
  {
    title: 'Guides',
    count: '9 pages',
    note: 'Plain answers to the questions people actually search for, each written and reviewed by name.',
    links: [
      { href: '/guides/', label: 'All guides' },
      { href: '/guides/how-much-do-quartz-worktops-cost.html', label: 'How much do quartz worktops cost in the UK?' },
      { href: '/guides/quartz-vs-granite-worktops.html', label: 'Quartz vs granite worktops: which should you choose?' },
      { href: '/guides/is-quartz-heatproof.html', label: 'Is quartz heatproof? Can you put hot pans on quartz?' },
      { href: '/guides/quartz-vs-porcelain-worktops.html', label: 'Quartz vs porcelain worktops: which is right for your kitchen?' },
      { href: '/guides/20mm-vs-30mm-quartz-worktops.html', label: '20mm or 30mm quartz worktop: which thickness should you choose?' },
      { href: '/guides/quartzite-vs-quartz.html', label: 'Quartzite vs quartz: they are not the same thing' },
      { href: '/guides/is-quartz-safe-silica.html', label: 'Is quartz safe? Silica, silicosis and what it means for your kitchen' },
      { href: '/guides/best-kitchen-worktop-material.html', label: 'The best kitchen worktop material for a UK kitchen' },
      { href: '/guides/what-happens-when-we-template.html', label: 'What happens when we template your kitchen' },
    ],
  },
  {
    title: 'Areas we cover',
    count: '4 counties, 4 towns',
    note: 'County pages cover the whole county. Town pages exist for the areas we are asked for most often, and more are added only once the current ones have proved themselves.',
    links: [
      { href: '/worktops/', label: 'All areas we cover' },
      { href: '/worktops/hertfordshire/', label: 'Hertfordshire' },
      { href: '/worktops/hertfordshire/stevenage/', label: 'Hertfordshire › Stevenage' },
      { href: '/worktops/hertfordshire/st-albans/', label: 'Hertfordshire › St Albans' },
      { href: '/worktops/essex/', label: 'Essex' },
      { href: '/worktops/essex/harlow/', label: 'Essex › Harlow' },
      { href: '/worktops/london/', label: 'London' },
      { href: '/worktops/london/enfield/', label: 'London › Enfield' },
      { href: '/worktops/berkshire/', label: 'Berkshire' },
    ],
  },
  {
    title: 'The stone collection',
    count: '132 stones',
    columns: [
      {
        title: 'Quartz',
        count: '67',
        links: [
          { href: '/stones/almond-beige.html', label: 'Almond Beige' },
          { href: '/stones/arabescato-capri.html', label: 'Arabescato Capri' },
          { href: '/stones/arabescato-classico.html', label: 'Arabescato Classico' },
          { href: '/stones/arabescato-elegance.html', label: 'Arabescato Elegance' },
          { href: '/stones/arabescato-faniello.html', label: 'Arabescato Faniello' },
          { href: '/stones/arabescato-gold.html', label: 'Arabescato Gold' },
          { href: '/stones/arabescato-grey.html', label: 'Arabescato Grey' },
          { href: '/stones/argento.html', label: 'Argento' },
          { href: '/stones/azalai-negro.html', label: 'Azalai Negro' },
          { href: '/stones/azul-shimmer.html', label: 'Azul Shimmer' },
          { href: '/stones/bianco-glacier.html', label: 'Bianco Glacier' },
          { href: '/stones/bianco-starlight.html', label: 'Bianco Starlight' },
          { href: '/stones/black-mirror.html', label: 'Black Mirror' },
          { href: '/stones/black-tempal.html', label: 'Black Tempal' },
          { href: '/stones/blue-lagoon.html', label: 'Blue Lagoon' },
          { href: '/stones/blue-mirror.html', label: 'Blue Mirror' },
          { href: '/stones/borghini-royal.html', label: 'Borghini Royal' },
          { href: '/stones/brown-mirror.html', label: 'Brown Mirror' },
          { href: '/stones/calacatta-aurelia.html', label: 'Calacatta Aurelia' },
          { href: '/stones/calacatta-borghini-light.html', label: 'Calacatta Borghini Light' },
          { href: '/stones/calacatta-classic.html', label: 'Calacatta Classic' },
          { href: '/stones/calacatta-exotic.html', label: 'Calacatta Exotic' },
          { href: '/stones/calacatta-fantastico.html', label: 'Calacatta Fantastico' },
          { href: '/stones/calacatta-gold-shimmer.html', label: 'Calacatta Gold Shimmer' },
          { href: '/stones/calacatta-gold-soft.html', label: 'Calacatta Gold Soft' },
          { href: '/stones/calacatta-grey-classic.html', label: 'Calacatta Grey Classic' },
          { href: '/stones/calacatta-lucente.html', label: 'Calacatta Lucente' },
          { href: '/stones/calacatta-luna.html', label: 'Calacatta Luna' },
          { href: '/stones/calacatta-oro-quartz.html', label: 'Calacatta Oro' },
          { href: '/stones/calacatta-soft-shimmer.html', label: 'Calacatta Soft Shimmer' },
          { href: '/stones/calacatta-supreme.html', label: 'Calacatta Supreme' },
          { href: '/stones/carrara-jumbo.html', label: 'Carrara Jumbo' },
          { href: '/stones/carrara-shimmer.html', label: 'Carrara Shimmer' },
          { href: '/stones/cloud-burst.html', label: 'Cloud Burst' },
          { href: '/stones/concrete-earth.html', label: 'Concrete Earth' },
          { href: '/stones/corchia-gold.html', label: 'Corchia Gold' },
          { href: '/stones/corchia-light.html', label: 'Corchia Light' },
          { href: '/stones/cream-mirror.html', label: 'Cream Mirror' },
          { href: '/stones/crema-d-aizhi.html', label: 'Crema D Aizhi' },
          { href: '/stones/crema-evora.html', label: 'Crema Evora' },
          { href: '/stones/crema-tempest.html', label: 'Crema Tempest' },
          { href: '/stones/crema-venato.html', label: 'Crema Venato' },
          { href: '/stones/cremo-delicato.html', label: 'Cremo Delicato' },
          { href: '/stones/cristallo-gris.html', label: 'Cristallo Gris' },
          { href: '/stones/darcrest.html', label: 'Darcrest' },
          { href: '/stones/fresh-cement.html', label: 'Fresh Cement' },
          { href: '/stones/grey-mirror.html', label: 'Grey Mirror' },
          { href: '/stones/grigio-fantasy.html', label: 'Grigio Fantasy' },
          { href: '/stones/grigio-shimmer.html', label: 'Grigio Shimmer' },
          { href: '/stones/grigio-starlight.html', label: 'Grigio Starlight' },
          { href: '/stones/labradorite-royal.html', label: 'Labradorite Royal' },
          { href: '/stones/laurent-black.html', label: 'Laurent Black' },
          { href: '/stones/london-grey.html', label: 'London Grey' },
          { href: '/stones/marquina.html', label: 'Marquina' },
          { href: '/stones/misterio-gold.html', label: 'Misterio Gold' },
          { href: '/stones/nero-starlight.html', label: 'Nero Starlight' },
          { href: '/stones/repen.html', label: 'Repen' },
          { href: '/stones/royal-grey.html', label: 'Royal Grey' },
          { href: '/stones/sabbia-beige.html', label: 'Sabbia Beige' },
          { href: '/stones/sahara-dunes.html', label: 'Sahara Dunes' },
          { href: '/stones/taj-mahal-elegance.html', label: 'Taj Mahal Elegance' },
          { href: '/stones/tuscany-supreme.html', label: 'Tuscany Supreme' },
          { href: '/stones/umbra-marron.html', label: 'Umbra Marron' },
          { href: '/stones/vanilla-noir.html', label: 'Vanilla Noir' },
          { href: '/stones/white-eclypse.html', label: 'White Eclypse' },
          { href: '/stones/white-mirror.html', label: 'White Mirror' },
          { href: '/stones/woodlands.html', label: 'Woodlands' },
        ],
      },
      {
        title: 'Marble & Quartzite',
        count: '45',
        links: [
          { href: '/stones/aqua-gucci.html', label: 'Aqua Gucci' },
          { href: '/stones/arabescato-corchia-extra.html', label: 'Arabescato Corchia Extra' },
          { href: '/stones/arabescato-corchia-extra-honed.html', label: 'Arabescato Corchia Extra Honed' },
          { href: '/stones/arabescato-vagli-oro.html', label: 'Arabescato Vagli Oro Honed' },
          { href: '/stones/belvedere.html', label: 'Belvedere' },
          { href: '/stones/belvedere-leather.html', label: 'Belvedere Leather' },
          { href: '/stones/bianco-eclypsia-calacatta.html', label: 'Bianco Eclypsia Calacatta' },
          { href: '/stones/blue-roma.html', label: 'Blue Roma' },
          { href: '/stones/blue-roma-honed.html', label: 'Blue Roma Honed' },
          { href: '/stones/calacatta-brasil.html', label: 'Calacatta Brasil' },
          { href: '/stones/calacatta-cremo-honed.html', label: 'Calacatta Cremo Honed' },
          { href: '/stones/calacatta-gold-oro.html', label: 'Calacatta Gold Oro Honed' },
          { href: '/stones/calacatta-vagli-oro.html', label: 'Calacatta Vagli Oro Honed' },
          { href: '/stones/calacatta-viola.html', label: 'Calacatta Viola' },
          { href: '/stones/calacatta-viola-honed.html', label: 'Calacatta Viola Honed' },
          { href: '/stones/carrara.html', label: 'Carrara' },
          { href: '/stones/carrara-honed.html', label: 'Carrara Honed' },
          { href: '/stones/cosmic-black.html', label: 'Cosmic Black' },
          { href: '/stones/cote-d-azur.html', label: 'Cote D Azur' },
          { href: '/stones/cristallo.html', label: 'Cristallo' },
          { href: '/stones/dolce-vita.html', label: 'Dolce Vita' },
          { href: '/stones/dover-white.html', label: 'Dover White' },
          { href: '/stones/fantastico-arni.html', label: 'Fantastico Arni Honed' },
          { href: '/stones/fusion-black.html', label: 'Fusion Black' },
          { href: '/stones/fusion-blue-leather.html', label: 'Fusion Blue Leather' },
          { href: '/stones/fusion-wow-multicolour.html', label: 'Fusion Wow Multicolour' },
          { href: '/stones/lemurian-blue.html', label: 'Lemurian Blue' },
          { href: '/stones/macaubas-fantasy.html', label: 'Macaubas Fantasy' },
          { href: '/stones/magma-gold.html', label: 'Magma Gold' },
          { href: '/stones/marron-imperial.html', label: 'Marron Imperial' },
          { href: '/stones/mont-blanc.html', label: 'Mont Blanc' },
          { href: '/stones/mystic-grey.html', label: 'Mystic Grey' },
          { href: '/stones/nero-marinace.html', label: 'Nero Marinace' },
          { href: '/stones/nero-marquina.html', label: 'Nero Marquina' },
          { href: '/stones/ocean-fantasy.html', label: 'Ocean Fantasy' },
          { href: '/stones/patagonia.html', label: 'Patagonia Extra' },
          { href: '/stones/rainforest-brown.html', label: 'Rainforest Brown' },
          { href: '/stones/rosa-alicante.html', label: 'Rosa Alicante' },
          { href: '/stones/rosso-levanto.html', label: 'Rosso Levanto' },
          { href: '/stones/taj-mahal.html', label: 'Taj Mahal' },
          { href: '/stones/travertine-romano-classico.html', label: 'Travertine Romano Classico Honed' },
          { href: '/stones/venaria-reale.html', label: 'Venaria' },
          { href: '/stones/verde-alpi.html', label: 'Verde Alpi' },
          { href: '/stones/verde-guatemala.html', label: 'Verde Guatemala' },
          { href: '/stones/white-macaubas.html', label: 'White Macaubas' },
        ],
      },
      {
        title: 'Granite',
        count: '20',
        links: [
          { href: '/stones/absolute-black-brushed.html', label: 'Absolute Black Brushed' },
          { href: '/stones/absolute-black-extra.html', label: 'Absolute Black Extra' },
          { href: '/stones/absolute-black-honed.html', label: 'Absolute Black Honed' },
          { href: '/stones/absolute-black-leather.html', label: 'Absolute Black Leather' },
          { href: '/stones/angola-black-leather.html', label: 'Angola Black Leather' },
          { href: '/stones/antiq-brown-extra.html', label: 'Antiq Brown Extra' },
          { href: '/stones/antiq-brown-leather.html', label: 'Antiq Brown Leather' },
          { href: '/stones/arctic-cream.html', label: 'Arctic Cream' },
          { href: '/stones/astoria.html', label: 'Astoria' },
          { href: '/stones/azul-platino.html', label: 'Azul Platino' },
          { href: '/stones/baltic-brown.html', label: 'Baltic Brown' },
          { href: '/stones/bianco-antico.html', label: 'Bianco Antico' },
          { href: '/stones/bianco-crystal.html', label: 'Bianco Crystal' },
          { href: '/stones/bianco-sardo.html', label: 'Bianco Sardo' },
          { href: '/stones/black-pearl.html', label: 'Black Pearl' },
          { href: '/stones/blue-dunes-leather.html', label: 'Blue Dunes Leather' },
          { href: '/stones/blue-pearl.html', label: 'Blue Pearl GT' },
          { href: '/stones/blues-in-the-night.html', label: 'Blues In The Night' },
          { href: '/stones/colombo-juparana.html', label: 'Colombo Juparana' },
          { href: '/stones/colonial-cream.html', label: 'Colonial Cream' },
        ],
      },
    ],
  },
];
