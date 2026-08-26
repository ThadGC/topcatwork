'use client';

/**
 * ARCHETYPE 10 — the compare tool.
 *
 * The shortlist lives in the URL and nowhere else: `?s=slug,slug,slug`. No
 * localStorage, no cookie, no server. That is what makes "Copy link" work as a
 * share button, and it is why the page can be a static export at all.
 *
 * Unlike the collection browser, this one IS declarative React. Nothing here
 * is server-rendered — the legacy page also ships an empty `#cmpCards` and
 * fills it on DOMContentLoaded — so there is no `.rise`/className conflict to
 * avoid and no SEO payload to preserve. The 132 records come from `CMP_DATA`,
 * lifted out of stones/compare.html:303 by the extractor.
 *
 * The URL is written with `history.replaceState`, never `pushState`: adding
 * and dropping stones must not fill the back button with dead states, and the
 * breadcrumb's back arrow depends on `history.length` meaning something.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { CompareRecord } from '@/lib/stones';
import { matchesTerms, normaliseQuery } from '@/lib/stones';

import {
  CompareEmptyMark,
  DropCross,
  PickerChevron,
  SearchGlass,
} from './icons';

/** "3 stones side by side" / "1 stone side by side" / "" when empty. */
function sideBySideLabel(n: number): string {
  return n ? `${n}${n === 1 ? ' stone' : ' stones'} side by side` : '';
}

function slabAlt(stone: CompareRecord): string {
  return `${stone.name} ${stone.shown.toLowerCase()} slab`;
}

export function StoneCompare({ data }: { data: CompareRecord[] }) {
  const bySlug = useMemo(
    () => new Map(data.map((stone) => [stone.slug, stone])),
    [data],
  );

  const [selected, setSelected] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [pickOpen, setPickOpen] = useState(false);
  const [pickMat, setPickMat] = useState('All');
  const [pickQuery, setPickQuery] = useState('');
  const [shareLabel, setShareLabel] = useState('Copy link');

  const pickSearchRef = useRef<HTMLInputElement>(null);
  const lastFocus = useRef<Element | null>(null);

  /**
   * Read `?s=` once on mount.
   *
   * Deliberately `location.search` and not `useSearchParams()`: under
   * `output: 'export'` the latter forces the whole route into a Suspense
   * boundary and still resolves to nothing at build time, because there is no
   * server to see the query string. Reading it here is both simpler and an
   * exact match for what the legacy script does at DOMContentLoaded.
   *
   * Unknown slugs are dropped rather than rendered as gaps — a stale shared
   * link degrades to the stones it can still resolve.
   */
  useEffect(() => {
    const match = /[?&]s=([^&]*)/.exec(location.search);
    if (match) {
      setSelected(
        decodeURIComponent(match[1])
          .split(',')
          .filter((slug) => bySlug.has(slug)),
      );
    }
    setHydrated(true);
  }, [bySlug]);

  /** Keep the URL in step with the shortlist. Never before hydration, or the
   *  first render would wipe the incoming `?s=` before it has been read. */
  useEffect(() => {
    if (!hydrated) return;
    const next = selected.length
      ? `${location.pathname}?s=${encodeURIComponent(selected.join(','))}`
      : location.pathname;
    history.replaceState(null, '', next);
  }, [selected, hydrated]);

  /** `html.cmp-locked` freezes the page behind the picker sheet. */
  useEffect(() => {
    document.documentElement.classList.toggle('cmp-locked', pickOpen);
    return () => document.documentElement.classList.remove('cmp-locked');
  }, [pickOpen]);

  const closePick = useCallback(() => {
    setPickOpen(false);
    const previous = lastFocus.current;
    if (previous instanceof HTMLElement) previous.focus();
  }, []);

  const openPick = useCallback(() => {
    lastFocus.current = document.activeElement;
    setPickOpen(true);
    // The 80ms is the source's. The sheet slides in first; focusing before it
    // has laid out scrolls the panel to the top on iOS.
    setTimeout(() => pickSearchRef.current?.focus(), 80);
  }, []);

  useEffect(() => {
    if (!pickOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closePick();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [pickOpen, closePick]);

  const toggle = (slug: string) => {
    setSelected((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );
  };

  const share = () => {
    const done = (ok: boolean) => {
      setShareLabel(ok ? 'Link copied' : 'Copy failed');
      setTimeout(() => setShareLabel('Copy link'), 1800);
    };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(location.href).then(
        () => done(true),
        () => done(false),
      );
    } else {
      done(false);
    }
  };

  /**
   * The picker's material tabs: "All" plus each distinct `mat` in the order it
   * first appears in CMP_DATA. That yields Quartz, Marble, Granite — three,
   * not five, because quartzite and travertine are bucketed into Marble.
   */
  const materials = useMemo(() => {
    const seen = ['All'];
    for (const stone of data) if (!seen.includes(stone.mat)) seen.push(stone.mat);
    return seen;
  }, [data]);

  const pickTerms = useMemo(() => normaliseQuery(pickQuery), [pickQuery]);
  const pickResults = useMemo(
    () =>
      data.filter((stone) => {
        if (pickMat !== 'All' && stone.mat !== pickMat) return false;
        if (pickTerms.length && !matchesTerms(stone, pickTerms)) return false;
        return true;
      }),
    [data, pickMat, pickTerms],
  );

  const cards = selected
    .map((slug) => bySlug.get(slug))
    .filter((s): s is CompareRecord => Boolean(s));
  const names = cards.map((stone) => stone.name);
  const count = cards.length;

  return (
    <>
      <section className="st-hero cmp-hero">
        <div className="wrap">
          <h1>
            Compare your <em>shortlist</em>
          </h1>
          <p className="lede">
            Put your stones side by side and just look at them. Add as many as you
            like, then ask us to bring samples of the ones you keep coming back to.
          </p>
        </div>
      </section>

      <section className="cmp-wrap">
        <div className="wrap">
          <div className="cmp-bar">
            <p className="cmp-count" id="cmpCount">
              {sideBySideLabel(count)}
            </p>
            <div className="cmp-baractions">
              <button
                className="cmp-clear"
                id="cmpClear"
                type="button"
                hidden={count === 0}
                onClick={() => setSelected([])}
              >
                Clear all
              </button>
              {/* Sharing one stone is just its own page — the button appears at two. */}
              <button
                className="cmp-share"
                id="cmpShare"
                type="button"
                hidden={count < 2}
                onClick={share}
              >
                {shareLabel}
              </button>
              <button
                className="cmp-add btn-gold"
                id="cmpAdd"
                type="button"
                hidden={!hydrated}
                onClick={openPick}
              >
                <span aria-hidden="true">+</span> Add a stone
              </button>
            </div>
          </div>

          <div className="cmp-empty" id="cmpEmpty" hidden={count > 0}>
            <span className="cmp-empty-mark" aria-hidden="true">
              <CompareEmptyMark />
            </span>
            <p className="cmp-empty-line">Nothing to compare yet.</p>
            <p className="cmp-empty-sub">
              Add two or more stones and they will sit side by side here, with
              everything we know about each one lined up underneath.
            </p>
            <button
              className="btn-gold cmp-add-first"
              id="cmpAddFirst"
              type="button"
              onClick={openPick}
            >
              Choose your first stone
            </button>
          </div>

          <div className="cmp-cards" id="cmpCards" hidden={count === 0}>
            {cards.map((stone) => (
              <div className="cmp-card" key={stone.slug}>
                <button
                  className="cmp-drop"
                  type="button"
                  aria-label={`Remove ${stone.name}`}
                  onClick={() => toggle(stone.slug)}
                >
                  <DropCross />
                </button>
                <a className="cmp-thumb" href={`/stones/${stone.slug}.html`}>
                  {/*
                    src is the 800w `-s` crop, not the 1600w file: these are
                    thumbnails at 240px and the small crop is a different
                    framing, not just a resize.
                  */}
                  <img
                    className="cmp-img"
                    src={stone.img}
                    srcSet={`${stone.img} 800w, ${stone.img2} 1600w`}
                    sizes="(max-width:720px) 46vw, 240px"
                    alt={slabAlt(stone)}
                    loading="lazy"
                    decoding="async"
                  />
                </a>
                <span className="cmp-tag">{stone.shown}</span>
                <a className="cmp-name" href={`/stones/${stone.slug}.html`}>
                  {stone.name}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Revealed as soon as there is anything at all to enquire about. */}
      <section className="cta-band cmp-cta" id="cmpCta" hidden={count < 1}>
        <div className="wrap">
          <h2>
            Narrowed it <em>down?</em>
          </h2>
          <p>
            We will bring samples of your shortlist to your home, in your light,
            against your own cabinets, and talk through what each one is like to
            live with. You approve photographs of your actual slab before a single
            cut.
          </p>
          <div className="cta-row">
            <a
              className="btn-gold"
              id="cmpEnquire"
              href={`/index.html?stones=${encodeURIComponent(names.join(', '))}#cta`}
            >
              Ask for these samples
            </a>
            <a className="btn-ghost" href="tel:+448000982812">
              Call 0800 098 2812
            </a>
          </div>
          <p className="cmp-cta-note" id="cmpCtaNote">
            {names.length ? `Your shortlist: ${names.join(', ')}.` : ''}
          </p>
        </div>
      </section>

      <section className="cta-band">
        <div className="wrap rise">
          <h2>
            Can&apos;t choose from a <em>screen?</em>
          </h2>
          <p>
            Nobody should. Book a free home visit and we bring samples to you.
            Prefer to talk it through? Ask for Nick.
          </p>
          <div className="cta-row">
            <a className="btn-gold" href="/contact/">
              Book a free home visit
            </a>
            <a className="btn-ghost" href="/stones/">
              Back to the collection
            </a>
          </div>
        </div>
      </section>

      {/*
        The picker sheet. Sits outside <main> in the source, after the mobile
        bar — see app/stones/compare/page.tsx for where it is mounted.
      */}
      <div
        className="cmp-pick"
        id="cmpPick"
        hidden={!pickOpen}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cmpPickTitle"
        onClick={(event) => {
          if (event.target === event.currentTarget) closePick();
        }}
      >
        <div className="cmp-pick-panel">
          <div className="cmp-pick-head">
            <h2 id="cmpPickTitle">Add a stone</h2>
            <button
              className="cmp-pick-down"
              id="cmpPickDown"
              type="button"
              aria-label="Close the picker and go back to your comparison"
              onClick={closePick}
            >
              <PickerChevron />
            </button>
          </div>

          <label className="st-search cmp-pick-search">
            <SearchGlass />
            <input
              ref={pickSearchRef}
              id="cmpSearch"
              type="search"
              placeholder="Try white, matt, marble effect"
              aria-label="Search stones by colour, finish or name"
              value={pickQuery}
              onChange={(event) => setPickQuery(event.target.value)}
            />
          </label>

          <div
            className="st-ftabs cmp-pick-tabs"
            id="cmpTabs"
            role="group"
            aria-label="Filter by material"
          >
            {materials.map((material) => (
              <button
                key={material}
                className={material === pickMat ? 'ftab on' : 'ftab'}
                type="button"
                onClick={() => setPickMat(material)}
              >
                {material}
              </button>
            ))}
          </div>

          <p className="cmp-pick-count" id="cmpPickCount">
            {`Showing ${pickResults.length}${pickResults.length === 1 ? ' stone' : ' stones'}`}
          </p>

          <div className="cmp-pick-grid" id="cmpPickGrid">
            {pickResults.map((stone) => {
              const on = selected.includes(stone.slug);
              return (
                <button
                  key={stone.slug}
                  className={on ? 'cmp-pick-tile on' : 'cmp-pick-tile'}
                  type="button"
                  aria-pressed={on || undefined}
                  onClick={() => toggle(stone.slug)}
                >
                  <img
                    className="cmp-pick-img"
                    src={stone.img}
                    srcSet={`${stone.img} 800w, ${stone.img2} 1600w`}
                    sizes="(max-width:720px) 46vw, 240px"
                    alt={slabAlt(stone)}
                    loading="lazy"
                    decoding="async"
                  />
                  <span className="cmp-pick-veil" />
                  <span className="cmp-pick-meta">
                    <span className="cmp-pick-name">{stone.name}</span>
                    <span className="cmp-pick-sup">{stone.finish}</span>
                  </span>
                  {on ? (
                    <span className="cmp-pick-on" aria-hidden="true">
                      Added
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          <p className="cmp-pick-empty" id="cmpPickEmpty" hidden={pickResults.length > 0}>
            No stone by that name in the collection.
          </p>
        </div>
      </div>
    </>
  );
}
