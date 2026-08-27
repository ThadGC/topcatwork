'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { MATERIALS, matLabel, type MatKey, type WheelStone } from '@/data/home/stoneWheel';
import { filterStones, newStoneFilter } from '@/hooks/useStoneWheel';
import { face } from '@/lib/estimator/marble';

const PICK_MATS: MatKey[] = ['Quartz', 'Marble', 'Granite'];

/**
 * The enquiry form's stone picker, as the stone collection rather than a list
 * of names.
 *
 * The client: "the way that it's currently functioning where it says to
 * [choose] your stone, it only has the names. The choose your stone should
 * create a pop up window where it takes them to the all stone section, and
 * they can just choose their stone that they're looking for."
 *
 * It wears the estimator modal's own clothes — `.est-modal`, `.est-mcard`,
 * `.est-mtabs`, `.sp-grid`, `.sp-tile` — so the two stone pickers on the site
 * are one thing seen twice, and this file adds no new panel CSS. The tiles
 * carry the same procedural face the estimator's do, `face(stone, seed, slug)`.
 *
 * PORTALLED TO `document.body`, NOT RENDERED IN PLACE. `.est-modal` is
 * `position:fixed`, and `#cta` sits inside sections that establish stacking
 * contexts — the project overlay was trapped exactly this way and read to the
 * client as "the nav bar is wrong, there's a random line". The estimator's own
 * modal is kept outside its section for the same reason.
 *
 * Searching reuses the wheel's `filterStones`, so a query here and the same
 * query on the wheel return the same stones.
 */
export default function StonePickerModal({
  open,
  onClose,
  onPick,
  selectedSlug,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (s: WheelStone) => void;
  selectedSlug?: string;
}) {
  const [mounted, setMounted] = useState(false);
  const [mat, setMat] = useState<MatKey>('Quartz');
  const [q, setQ] = useState('');
  const cardRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);
  /** Whatever opened it, so focus can go back there on close. */
  const opener = useRef<HTMLElement | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    opener.current = document.activeElement as HTMLElement | null;
    // The list is long; the search is what a visitor wants first.
    const t = window.setTimeout(() => searchRef.current?.focus(), 40);
    // A fixed panel over a scrolling page scrolls the page behind it.
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.clearTimeout(t);
      document.body.style.overflow = prev;
      opener.current?.focus?.();
    };
  }, [open]);

  const list = useMemo(() => {
    const f = newStoneFilter();
    f.q = q;
    return filterStones(MATERIALS[mat] ?? [], f);
  }, [mat, q]);

  const total = MATERIALS[mat]?.length ?? 0;
  const count = q.trim()
    ? list.length
      ? `${list.length} of ${total} in ${matLabel(mat)}`
      : `Nothing in ${matLabel(mat).toLowerCase()} matches that`
    : `${total} in ${matLabel(mat)}`;

  if (!mounted) return null;

  return createPortal(
    <div
      className={'est-modal sp-modal' + (open ? ' open' : '')}
      role="dialog"
      aria-modal="true"
      aria-labelledby="ctaStoneModalTitle"
      hidden={!open}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          e.stopPropagation();
          onClose();
        }
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="est-mcard" ref={cardRef}>
        <div className="est-mhead">
          <div>
            <h3 id="ctaStoneModalTitle">Choose your stone</h3>
            <p>
              Optional, and nothing is fixed by it — samples come to your kitchen and you approve your own slab from
              photographs before a single cut.
            </p>
          </div>
          <button className="est-mx" type="button" aria-label="Close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="est-mbody">
          <div className="est-mtabs">
            {PICK_MATS.map((m) => (
              <button
                key={m}
                className={'mat-tab' + (m === mat ? ' on' : '')}
                type="button"
                aria-pressed={m === mat}
                onClick={() => setMat(m)}
              >
                {matLabel(m)}
              </button>
            ))}
            <label className="est-msearch">
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <circle cx="7" cy="7" r="5" />
                <path d="M10.6 10.6 14 14" />
              </svg>
              <input
                ref={searchRef}
                type="search"
                placeholder="Try white, matt, marble effect"
                aria-label="Search stones by name"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </label>
          </div>

          <p className={'est-mcount' + (list.length ? '' : ' none')}>{count}</p>

          {!!list.length && (
            <div className="sp-grid">
              {list.map((s) => (
                <button
                  key={s.slug}
                  className={'sp-tile' + (s.slug === selectedSlug ? ' on' : '')}
                  type="button"
                  aria-pressed={s.slug === selectedSlug}
                  onClick={() => {
                    onPick(s);
                    onClose();
                  }}
                >
                  {/* The real slab crop, over the procedural face as its
                      placeholder — the wheel carries `img800` and this is a
                      picker you choose by eye. `loading="lazy"` matters: a
                      material tab is ~45 stones and only a couple of rows are
                      ever on screen. */}
                  <span className="sp-face" style={{ backgroundImage: face(s.stone, s.seed, s.slug) }}>
                    {s.img800 ? (
                      <img src={s.img800} alt="" loading="lazy" decoding="async" />
                    ) : null}
                  </span>
                  <b>{s.name}</b>
                  <small>{s.finish || s.kind || s.mat}</small>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
