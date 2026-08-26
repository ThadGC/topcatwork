import type { Config } from 'tailwindcss';

/**
 * TopCat design system — ported verbatim from the legacy stylesheets.
 *
 *   assets/site.css          (3354 lines, home + heavy pages)
 *   assets/nav.css
 *   assets/footer.css
 *   seo.css
 *   services/service.css     (the content-page token root)
 *   stones/stone.css
 *
 * THIS IS A PORT, NOT A REDESIGN. Every literal below is copied out of the
 * source. Do not round, normalise, or "improve" a value.
 *
 * What deliberately does NOT live here (see src/app/globals.css):
 *   - the two @font-face blocks
 *   - both :root token blocks, including the three site/service divergences
 *   - body::before (the marble floor)
 *   - every rule that reads a JS-written custom property (54 of them)
 *   - the CSS->JS channel properties that media queries write and JS reads
 *   - the height-based media queries and the 13 reduced-motion blocks
 *   - the gold text-gradient recipe
 *
 * Tailwind cannot express any of those, and getComputedStyle cannot read a
 * utility class.
 *
 * This file is loaded by globals.css through Tailwind v4's `@config`
 * directive, which is what keeps the legacy-shaped `screens` ranges
 * (`{ min, max }`) available — v4's `--breakpoint-*` theme keys are
 * min-width only.
 */
const config: Config = {
  content: [
    './src/app/**/*.{ts,tsx,mdx}',
    './src/components/**/*.{ts,tsx,mdx}',
    './src/lib/**/*.{ts,tsx}',
  ],

  theme: {
    /* ------------------------------------------------------------------
     * §6.6 BREAKPOINTS — exactly three, and JS agrees with them:
     *   site.js matchMedia('(min-width:1121px)'), mPhone, mNarrow.
     * The 20-odd one-off widths in the source (360/400/420/560/600/620/
     * 640/760/820/880/900/980/1000/1040/1080/1100) stay as raw @media
     * blocks in globals.css. Do not invent screens for them.
     * ---------------------------------------------------------------- */
    screens: {
      phone: { max: '720px' },
      narrow: { min: '721px', max: '1120px' },
      wide: { min: '1121px' },
    },

    extend: {
      /* ----------------------------------------------------------------
       * §3 COLOUR
       * The named tokens resolve through the CSS custom properties so the
       * site/service divergence in --muted and --faint survives: a
       * `text-muted` inside a content page picks up 0.60, on the home page
       * 0.55. Raw hexes are used only where the source uses a raw hex.
       * -------------------------------------------------------------- */
      colors: {
        ink: {
          DEFAULT: '#0B0B0D',
          2: '#15151A',
          3: '#1D1D23',
        },
        bone: '#F4F1EA',
        gold: {
          DEFAULT: '#C6A664',
          lo: '#8C6B34',
          hi: '#E4CD92',
          soft: '#D4B778',
          // Untokenised in the source but present in every gold gradient.
          deep: '#BC9A54',
        },
        warn: '#E08A6B',

        // Token-backed, so the two roots stay distinct. See globals.css §1.4.
        muted: 'var(--muted)',
        faint: 'var(--faint)',
        body: 'var(--body)',
        hair: 'var(--hair)',
        'hair-soft': 'var(--hair-soft)',

        /* The recurring un-tokenised rgba() families, as hex so the
         * Tailwind alpha modifier works: `bg-scrim-hero/70` is
         * rgba(7,7,9,0.70). */
        scrim: {
          hero: '#070709', //   rgba(7,7,9,a)     hero scrims
          photo: '#08080A', //  rgba(8,8,10,a)    photo-fade / nav plate
          cine: '#060609', //   rgba(6,6,9,a)     cine edge + line scrim
          shadow: '#060608', // rgba(6,6,8,a)     text-shadow family
          plate: '#0E0E13', //  rgba(14,14,19,a)  plate stone tint
        },

        // Highlight literals.
        flare: '#FFF4D6', //   rgba(255,244,214,0.95) bar-flare core
        sheen: '#FFFFFF', //   rgba(255,255,255,0.34) button sheen
        bevel: {
          hi: '#FFFBEE', //    inset 0 1px 0 rgba(255,251,238,0.6)
          lo: '#4A3410', //    inset 0 -1px 0 rgba(74,52,16,0.45)
        },
      },

      /* ----------------------------------------------------------------
       * §4.1 FONT STACKS — aliases onto the tokens, never re-declared.
       * -------------------------------------------------------------- */
      fontFamily: {
        serif: 'var(--serif)',
        sans: 'var(--sans)',
        brand: 'var(--brand)',
      },

      /* ----------------------------------------------------------------
       * §4.2 TYPE SCALE — the discrete px steps in the source.
       * Keys are the px number: `text-11` is 11px, `text-12.5` is 12.5px.
       * -------------------------------------------------------------- */
      fontSize: {
        8: '8px',
        '8.5': '8.5px',
        9: '9px',
        '9.5': '9.5px',
        10: '10px',
        '10.5': '10.5px',
        11: '11px',
        '11.5': '11.5px',
        12: '12px',
        '12.5': '12.5px',
        13: '13px',
        '13.5': '13.5px',
        14: '14px',
        '14.5': '14.5px',
        15: '15px',
        16: '16px',
        17: '17px',
        18: '18px',
        19: '19px',
        20: '20px',
        23: '23px',
        26: '26px',
        72: '72px',

        /* The fluid display roles, as declared. */
        'hero-title': 'clamp(72px,min(6.2vw,10.6vh),92px)', // --hTitle
        'hero-sub': 'clamp(16px,min(1.42vw,2.3vh),19.5px)',
        'section-title': 'clamp(28px,min(4.6vw,5.4vh),54px)',
        'section-sub': 'clamp(13.5px,min(1.4vw,2.2vh),16px)',
        'page-h1': 'clamp(32px,min(4.8vw,6vh),58px)',
        'page-h1-phone': 'clamp(30px,8.6vw,40px)',
        'stone-h1': 'clamp(32px,4.6vw,54px)',
        lede: 'clamp(14.5px,1.25vw,16.5px)',
        'lead-answer': 'clamp(16px,1.35vw,19px)',
      },

      /* ----------------------------------------------------------------
       * §4.4 LETTER-SPACING — the full scale, keyed by its em value,
       * plus the semantic aliases the source uses consistently.
       * -------------------------------------------------------------- */
      letterSpacing: {
        '-0.01': '-0.01em',
        '-0.004': '-0.004em', // cine lines
        0: '0',
        '0.005': '0.005em',
        '0.01': '0.01em', // display headings
        '0.014': '0.014em',
        '0.02': '0.02em',
        '0.04': '0.04em',
        '0.05': '0.05em',
        '0.06': '0.06em',
        '0.08': '0.08em',
        '0.09': '0.09em',
        '0.12': '0.12em',
        '0.13': '0.13em',
        '0.14': '0.14em',
        '0.15': '0.15em',
        '0.16': '0.16em', // nav
        '0.18': '0.18em',
        '0.19': '0.19em',
        '0.2': '0.2em', // bar-cta
        '0.22': '0.22em', // buttons, mobile nav
        '0.24': '0.24em', // button hover
        '0.26': '0.26em',
        '0.28': '0.28em',
        '0.3': '0.3em',
        '0.32': '0.32em',
        '0.34': '0.34em', // eyebrow
        '0.42': '0.42em',

        // px-valued outliers, verbatim.
        '1.1px': '1.1px',
        '2.5px': '2.5px',
        '3px': '3px',
        fluid: 'clamp(0.8px,0.3vw,1.1px)',

        // semantic aliases
        display: '0.01em',
        cine: '-0.004em',
        nav: '0.16em',
        cta: '0.2em',
        btn: '0.22em',
        'btn-hover': '0.24em',
        eyebrow: '0.34em',
      },

      /* ----------------------------------------------------------------
       * §4.5 LINE-HEIGHT
       * -------------------------------------------------------------- */
      lineHeight: {
        1: '1',
        '1.06': '1.06',
        '1.07': '1.07',
        '1.12': '1.12',
        '1.15': '1.15',
        '1.2': '1.2',
        '1.25': '1.25',
        '1.3': '1.3',
        '1.32': '1.32',
        '1.45': '1.45',
        '1.5': '1.5', // body, site.css
        '1.55': '1.55',
        '1.58': '1.58', // hero-sub
        '1.6': '1.6', // body, service.css
        '1.62': '1.62',
        '1.7': '1.7', // lede
        '1.72': '1.72',
        '1.8': '1.8',
      },

      /* ----------------------------------------------------------------
       * §5 SPACING — there is no numeric scale in the source. Spacing is
       * fluid clamp() pairs, and the same pairs repeat. These are those
       * pairs, verbatim. Tailwind's own numeric scale stays available
       * underneath for the fixed px values (4/8/9/10/12/16/22 ...).
       * -------------------------------------------------------------- */
      spacing: {
        /* gutters — `gutter` is the single most repeated value in the
         * system: header.bar, .page-head, .hero-inner, footer.site and
         * service.css .wrap all use it. */
        gutter: 'clamp(20px,5vw,64px)',
        'gutter-lg': 'clamp(24px,5vw,72px)',
        'gutter-md': 'clamp(24px,5vw,60px)',
        'gutter-sm': 'clamp(20px,4vw,28px)',
        'gutter-xs': 'clamp(16px,4vw,48px)',
        'gutter-gal': '6vw',

        /* section vertical rhythm */
        'sec-lg': 'clamp(84px,12vh,120px)',
        'sec-hero': 'clamp(56px,9vh,116px)',
        'sec-md': 'clamp(30px,4.6vh,84px)',
        'sec-foot': 'clamp(28px,5vh,58px)',
        'sec-sm': 'clamp(18px,4.2vh,64px)',
        'sec-band': 'clamp(44px,5.5vw,76px)',

        /* card padding pairs */
        'card-x': 'clamp(24px,1.8vw,32px)',
        'card-y': 'clamp(18px,2.2vw,26px)',
        'card-tight': 'clamp(16px,1.6vw,24px)',
        'card-a-y': 'clamp(17px,2.6vh,34px)',
        'card-a-x': 'clamp(18px,2.4vw,42px)',
        'card-b-y': 'clamp(18px,2.6vh,30px)',
        'card-b-x': 'clamp(18px,1.7vw,30px)',
        'card-c-y': 'clamp(14px,1.9vh,20px)',
        'card-c-x': 'clamp(16px,1.5vw,24px)',
        'card-d-y': 'clamp(13px,1.9vh,19px)',
        'card-d-x': 'clamp(16px,2vw,26px)',
        'card-e-y': 'clamp(26px,3.6vh,52px)',
        'card-e-x': 'clamp(24px,3vw,50px)',

        /* gaps */
        'gap-foot': 'clamp(22px,2.4vw,44px)',
        'gap-lg': 'clamp(16px,2.6vw,26px)',
        'gap-md': 'clamp(14px,1.6vw,22px)',
        'gap-ctl': 'clamp(12px,1.6vw,22px)',
        'gap-chip': 'clamp(8px,0.72vw,14px)',
        'gap-nav': 'clamp(18px,2.2vw,30px)',

        /* misc measured rhythm */
        'head-gap': 'clamp(14px,2.8vh,42px)', // .section-head margin-bottom
        'head-h1-gap': 'clamp(14px,2.2vh,22px)', // .page-head h1 margin-bottom
        'title-gap': 'clamp(20px,3.2vh,38px)', // .hero-title margin-bottom
        'sub-gap': 'clamp(24px,3.8vh,44px)', // .hero-sub margin-bottom
        'sub-top': 'clamp(7px,1.2vh,13px)', // .section-sub margin-top
        'hero-pad-b': 'clamp(72px,10.8vh,132px)', // --heroPadB
        'hero-pad-b-short': 'clamp(52px,13.5vh,150px)', // @media(max-height:560px)

        /* --uipx-scaled UI paddings (desktop-fluid) */
        ui8: 'calc(8 * var(--uipx))',
        ui10: 'calc(10 * var(--uipx))',
        ui11: 'calc(11 * var(--uipx))',
        'ui11.5': 'calc(11.5 * var(--uipx))',
        ui12: 'calc(12 * var(--uipx))',
        ui17: 'calc(17 * var(--uipx))',
        ui22: 'calc(22 * var(--uipx))',
        ui26: 'calc(26 * var(--uipx))',
        ui34: 'calc(34 * var(--uipx))',

        /* chrome */
        bar: 'var(--barH)',
      },

      /* ----------------------------------------------------------------
       * §5 CONTAINERS + §4.6 MEASURE
       * -------------------------------------------------------------- */
      maxWidth: {
        site: '1320px', // .section-head, .hero-inner, .foot-grid
        1240: '1240px',
        1180: '1180px',
        wrap: 'var(--maxw)', // service.css --maxw:1160px
        1160: '1160px',
        1040: '1040px',
        1000: '1000px',
        980: '980px',
        940: '940px',
        920: '920px',
        'hero-copy': 'min(92vw,1040px)',
        'hero-narrow': 'min(92vw,660px)',

        // measures
        '18ch': '18ch', // .section-title
        '22ch': '22ch',
        '30ch': '30ch', // .foot-tag
        '34ch': '34ch',
        '44ch': '44ch', // .cta-line
        '46ch': '46ch',
        '47ch': '47ch',
        '52ch': '52ch', // .section-sub
        '54ch': '54ch',
        '56ch': '56ch', // .hero-sub
        '60ch': '60ch',
        '62ch': '62ch', // .lede
        '70ch': '70ch', // .lead-answer
      },

      /* ----------------------------------------------------------------
       * §5 RADIUS — `2px` is the default in the source (34 occurrences).
       * -------------------------------------------------------------- */
      borderRadius: {
        0: '0',
        1: '1px',
        2: '2px', // the system default
        3: '3px',
        4: '4px',
        5: '5px',
        6: '6px',
        7: '7px',
        8: '8px',
        9: '9px',
        10: '10px',
        11: '11px',
        12: '12px',
        14: '14px',
        15: '15px',
        16: '16px',
        18: '18px',
        20: '20px',
        22: '22px',
        100: '100px',
        pill: '999px',
        half: '50%',
        'top-6': '6px 6px 0 0',
        'top-15': '15px 15px 0 0',
        'left-2': '2px 0 0 2px',

        /* curve tokens — these are custom properties because the cine
         * film animates --cineCurve into them. */
        curve: 'var(--curveR,48px)',
        'nav-curve': 'var(--navCurveR,34px)',
      },

      /* ----------------------------------------------------------------
       * §3 BACKDROP BLUR — the exact ladder in use.
       * -------------------------------------------------------------- */
      backdropBlur: {
        3: '3px',
        4: '4px',
        6: '6px',
        7: '7px',
        8: '8px', // chips, cards
        9: '9px',
        10: '10px',
        14: '14px', // nav bar + dropdown
        16: '16px',
        18: '18px', // mobile nav overlay
      },
      blur: {
        3: '3px',
        4: '4px',
        6: '6px',
        7: '7px',
        8: '8px',
        9: '9px',
        10: '10px',
        14: '14px',
        16: '16px',
        18: '18px',
      },
      backdropSaturate: {
        125: '1.25', // pairs with blur(16px)
      },

      /* ----------------------------------------------------------------
       * §3 ELEVATION
       * -------------------------------------------------------------- */
      boxShadow: {
        card: '0 24px 54px -30px rgba(0,0,0,0.9)',
        nav: '0 26px 54px -22px rgba(0,0,0,0.9)',
        gold: '0 18px 40px -18px rgba(198,166,100,0.55)',
        panel: '0 34px 64px -30px rgba(0,0,0,0.95), 0 0 0 1px var(--hair) inset',
        'panel-deep': '0 55px 100px -45px rgba(0,0,0,0.98), 0 0 0 1px var(--hair) inset',
        drop: '0 50px 120px -40px rgba(0,0,0,0.95)',
        bevel: 'inset 0 1px 0 rgba(255,251,238,0.6), inset 0 -1px 0 rgba(74,52,16,0.45)',
      },

      /* ----------------------------------------------------------------
       * §1.2 EASING — --ease-2 is declared but never referenced in the
       * source. It is carried anyway, as instructed.
       * -------------------------------------------------------------- */
      transitionTimingFunction: {
        DEFAULT: 'var(--ease)',
        brand: 'var(--ease)', //       cubic-bezier(0.16,1,0.3,1)   ~95% of transitions
        'brand-2': 'var(--ease-2)', // cubic-bezier(0.65,0,0.35,1)  declared, unused
        'brand-slow': 'var(--ease-slow)', // cubic-bezier(0.4,0,0.15,1)  hero Ken Burns
        roll: 'cubic-bezier(.45,.05,.2,1)', // --revRoll
      },

      /* §5 TRANSITION DURATIONS — every value in the source. */
      transitionDuration: {
        0: '0ms',
        180: '180ms',
        200: '.2s',
        250: '.25s',
        300: '.3s', // 54 uses
        320: '.32s',
        350: '.35s', // 71 uses — the most common
        380: '380ms',
        400: '.4s',
        450: '.45s',
        500: '.5s',
        550: '.55s',
        600: '.6s',
        700: '.7s',
        720: '.72s', // --revRoll
        750: '.75s',
        800: '.8s',
        850: '.85s',
        900: '.9s',
        1000: '1s',
        1050: '1.05s',
        1150: '1.15s',
        1200: '1.2s',
        1300: '1.3s',
        3000: '3s', // hero Ken Burns
      },

      /* §1.5 process stagger (--td) and hero reveal delays (--hd/--rd) are
       * authored per-element in markup; they stay inline styles. */
      transitionDelay: {
        0: '0ms',
        120: '120ms',
        130: '130ms', // --td, .pt-b
        180: '180ms', // --hd
        240: '240ms',
        260: '260ms', // --td, .pt-c
        300: '300ms',
        340: '340ms', // --hd
        360: '360ms',
        390: '390ms', // --td, .pt-d
        480: '480ms',
        520: '520ms', // --td, .pt-e
        560: '560ms', // --hd
        720: '720ms', // --hd
        880: '880ms', // --hd
      },

      zIndex: {
        floor: '0', // body::before
        bar: '50', // header.bar
        burger: '80',
        'mobile-nav': '40',
      },

      fontWeight: {
        light: '300', // 59 uses — body / lede
        normal: '400', // 42 uses — headings, nav
        medium: '500', // 22 uses — chips, table th
        semibold: '600', // 32 uses — CTA, em, table heads
        bold: '700', // one stray rule; Montserrat var tops out at 600 so it
        //             synthesises. Ported as-is on purpose.
      },
    },
  },

  plugins: [],
};

export default config;
