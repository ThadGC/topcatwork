'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import TcUpload from '@/components/forms/TcUpload';
import { useCursorGlow } from '@/hooks/useCursorGlow';
import { useEstimator } from '@/hooks/useEstimator';
import { useIsomorphicLayoutEffect } from '@/hooks/useIsomorphicLayoutEffect';
import { useReveal } from '@/hooks/useReveal';
import { MATERIALS, faceSlug, matchStone, modalTerms, type CatalogueStone } from '@/lib/estimator/catalogue';
import { EDGES } from '@/lib/estimator/catalogue.data';
import {
  DARKSTONES,
  LAB,
  LIM,
  MATS,
  THICK,
  USES,
  matLabel,
  useLabel,
  widRange,
  type MatId,
  type UseId,
} from '@/lib/estimator/constants';
import { face } from '@/lib/estimator/marble';
import type { Plan } from '@/lib/estimator/pack';

/** The POA board's name-plate veil — see the note at its usage below. Inline
 *  because `home-sections.css` is generated from the old site.css and this rule
 *  has no counterpart there to extract. */
const PLATE_VEIL: React.CSSProperties = {
  position: 'absolute',
  left: 0,
  right: 0,
  bottom: 0,
  height: '62%',
  pointerEvents: 'none',
  background:
    'linear-gradient(180deg,rgba(8,8,10,0) 0%,rgba(8,8,10,0.14) 32%,rgba(8,8,10,0.46) 60%,rgba(8,8,10,0.72) 82%,rgba(8,8,10,0.78) 100%)',
};

/**
 * `section.section#estimator` — index.html:3881. The price calculator, engine
 * and all: assets/site.js:3587-4245.
 *
 * The markup is the source's, unchanged, down to the en-dashes in the stat
 * slots and the placeholder range in `.est-price`. What used to be missing is
 * everything below it — the slab packer, the joint placement, the bracket
 * lookup and the picker modals. Those live in src/lib/estimator (pure, and
 * checked against vectors dumped out of the original) and in
 * src/hooks/useEstimator (state and handlers). This file renders.
 *
 * WHAT THE ENGINE ACTUALLY DOES, because it is easy to assume otherwise: it
 * packs the user's pieces onto SLABS and prices from the client's bracket
 * table by slab count. It is not a per-square-metre calculator. An island does
 * not add a slab to that count — it switches the table's column. And only
 * Quartz calculates at all; Marble, Granite and Porcelain are priced by hand.
 *
 * THE SERVER SENDS THE SHELL. site.js is a script that attaches to static
 * markup, so the first paint is the placeholder panel and the engine replaces
 * it. `mounted` reproduces that exactly, which also keeps the procedural slab
 * faces (which mint document-unique SVG filter ids) out of the server render.
 *
 * THE TWO DROPZONES ARE <TcUpload/>, NOT `div.tc-up[data-up]`. They are empty
 * divs in the source because site.js:3521 `mountUpload()` finds every
 * `.tc-up[data-up]` and writes the widget into it with innerHTML. That is
 * ported to React, so the marker attribute is deliberately NOT emitted — an
 * un-ported site.js landing later would otherwise blow away a React subtree.
 *
 * Both roots share ONE file list, exactly as the legacy `TC_UP` singleton
 * does: a file dropped on the compact one inside the calculator is the same
 * file the "priced by hand" panel shows, and it is the list `TC_FORM_EXTRA`
 * posts as `file1`…`fileN`. See src/lib/form/uploads.ts.
 */

/** site.js:3707 — the SVG for one edge profile's cross-section. */
function EdgeGlyph({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 116 64" aria-hidden="true">
      <path className="epf" d={d} />
    </svg>
  );
}

/* ------------------------------------------------------------------------
   The cutting plan — site.js:3780-3812.
   ------------------------------------------------------------------------ */

function Board({ plan, bg, dark, animate }: { plan: Plan; bg: string; dark: boolean; animate: boolean }) {
  const ref = useRef<HTMLDivElement>(null);

  /* site.js:3805-3811 — a 45 ms stagger, applied on the frame after the frame
     after paint so the transition has a start value to run from. Reduced
     motion, or an unstructured change, jumps straight to the end state. */
  useIsomorphicLayoutEffect(() => {
    const host = ref.current;
    if (!host) return;
    const els = [...host.querySelectorAll<HTMLElement>('.est-piece')];
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (animate && !reduce) {
      els.forEach((el, i) => {
        el.style.transitionDelay = i * 45 + 'ms';
      });
      let raf2 = 0;
      const raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => els.forEach((el) => el.classList.add('in')));
      });
      return () => {
        cancelAnimationFrame(raf1);
        cancelAnimationFrame(raf2);
      };
    }
    els.forEach((el) => {
      el.style.transition = 'none';
      el.classList.add('in');
    });
  });

  const { L, W } = plan.dims;
  return (
    <div ref={ref} style={{ display: 'contents' }}>
      {plan.slabs.map((s, si) => (
        <figure className="est-slab" key={si}>
          <div className="est-slabface" style={{ aspectRatio: `${L}/${W}`, backgroundImage: bg }}>
            {s.placed.map((p, pi) => {
              /* site.js:3792-3801 — the piece is positioned as a percentage of
                 the slab, and its slice of the slab photo is reproduced by
                 blowing the background up and shifting it, so the veining
                 lines up across a joint. */
              const l = (p.x / L) * 100;
              const t = (p.y / W) * 100;
              const w = (p.w / L) * 100;
              const h = (p.h / W) * 100;
              const bw = (L / p.w) * 100;
              const bh = (W / p.h) * 100;
              const px = p.w < L ? (p.x / (L - p.w)) * 100 : 0;
              const py = p.h < W ? (p.y / (W - p.h)) * 100 : 0;
              const cls =
                'est-piece' +
                (dark ? ' pdark' : '') +
                (h < 15 || w < 9 ? ' tiny' : '') +
                (p.jl ? ' jl' : '') +
                (p.jr ? ' jr' : '');
              return (
                <div
                  className={cls}
                  key={pi}
                  style={{
                    left: l.toFixed(2) + '%',
                    top: t.toFixed(2) + '%',
                    width: w.toFixed(2) + '%',
                    height: h.toFixed(2) + '%',
                    backgroundImage: bg,
                    backgroundSize: bw.toFixed(2) + '% ' + bh.toFixed(2) + '%',
                    backgroundPosition: px.toFixed(2) + '% ' + py.toFixed(2) + '%',
                  }}
                >
                  <span className="pl">{p.lab}</span>
                  <span className="pd">
                    {p.w} × {p.h}
                  </span>
                </div>
              );
            })}
          </div>
          <figcaption>
            <span>Slab {si + 1}</span>
            <span>
              {L} × {W} mm
            </span>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------------
   The "Used for" listbox — site.js:4080-4142. It is appended to <body> in the
   source, not to the row, because the rows scroll inside a clipped panel.
   ------------------------------------------------------------------------ */

function UsePop({
  anchor,
  current,
  onPick,
  onClose,
}: {
  anchor: HTMLElement;
  current: UseId;
  onPick: (u: UseId) => void;
  onClose: (refocus?: boolean) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  /** site.js:4086-4096 — below the button if it fits, above it if not, and
   *  always at least 10 px inside the viewport. */
  const place = useCallback(() => {
    const pop = ref.current;
    if (!pop) return;
    const r = anchor.getBoundingClientRect();
    pop.style.minWidth = Math.max(190, r.width) + 'px';
    pop.style.left = '0px';
    pop.style.top = '0px';
    const w = pop.offsetWidth;
    const h = pop.offsetHeight;
    let x = Math.min(r.left, innerWidth - w - 10);
    x = Math.max(10, x);
    let y = r.bottom + 6 + h <= innerHeight - 10 ? r.bottom + 6 : r.top - 6 - h;
    y = Math.max(10, Math.min(y, innerHeight - h - 10));
    pop.style.left = x + 'px';
    pop.style.top = y + 'px';
  }, [anchor]);

  useIsomorphicLayoutEffect(() => {
    place();
    const raf = requestAnimationFrame(() => setOpen(true));
    const sel = ref.current?.querySelector<HTMLElement>('[aria-selected="true"]') || ref.current?.querySelector<HTMLElement>('button');
    if (sel) {
      sel.classList.add('active');
      sel.focus();
    }
    return () => cancelAnimationFrame(raf);
  }, [place]);

  /* site.js:4131-4142 — a capturing pointerdown closes it, a resize closes it,
     and a scroll either re-places it or closes it once the row is off-screen. */
  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      const t = e.target as HTMLElement;
      if (ref.current?.contains(t) || t.closest?.('.est-dropbtn')) return;
      onClose();
    };
    const onResize = () => onClose();
    const onScroll = () => {
      const r = anchor.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) onClose();
      else place();
    };
    document.addEventListener('pointerdown', onDown, true);
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onScroll, true);
    return () => {
      document.removeEventListener('pointerdown', onDown, true);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onScroll, true);
    };
  }, [anchor, onClose, place]);

  /** site.js:4117-4130. */
  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const opts = [...(ref.current?.querySelectorAll<HTMLElement>('button') ?? [])];
    const at = opts.indexOf(document.activeElement as HTMLElement);
    if (e.key === 'Escape' || e.key === 'Tab') {
      e.preventDefault();
      onClose(true);
      return;
    }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const n = opts[(at + (e.key === 'ArrowDown' ? 1 : opts.length - 1) + opts.length) % opts.length];
      opts.forEach((o) => o.classList.remove('active'));
      n.classList.add('active');
      n.focus();
    }
    if (e.key === 'Home' || e.key === 'End') {
      e.preventDefault();
      (e.key === 'Home' ? opts[0] : opts[opts.length - 1]).focus();
    }
  };

  return createPortal(
    <div ref={ref} className={'est-pop' + (open ? ' open' : '')} role="listbox" onKeyDown={onKeyDown}>
      {USES.map((u) => (
        <button type="button" role="option" key={u.id} data-use={u.id} aria-selected={u.id === current} onClick={() => onPick(u.id)}>
          {u.label}
        </button>
      ))}
    </div>,
    document.body,
  );
}

/* ------------------------------------------------------------------------ */

export default function Estimator() {
  const ref = useReveal<HTMLElement>();
  /* site.js:4244-4245 — `attachGlow(#estPanel)` and `attachGlow(#estPreview)`,
     the section's two `.glow-card`s. */
  useCursorGlow(ref, '.glow-card');
  const est = useEstimator();
  const { live, result } = est;

  /* site.js:3986-3992, 4038-4039 — the source rebuilds the rows with innerHTML
     and then puts focus back where the interaction left it. React keeps the
     nodes, but the focus moves still have to be made by hand. */
  const focusAfter = (pick: () => HTMLElement | null | undefined) => {
    requestAnimationFrame(() => pick()?.focus());
  };
  const rowsEl = useRef<HTMLDivElement>(null);

  /* site.js:3873, 3830-3832 — one background-image value drives the swatch,
     the two dressing washes and every piece on the board. */
  /* `faceSlug` is the only addition: a bucket with no catalogue of its own
     (porcelain) has no slug, so it borrows the most-asked-for marble's slab
     photo instead of falling through to the drawn stand-in. */
  const bg = est.mounted ? face(live.stone.stone, live.stone.seed, faceSlug(live.stone, live.mat)) : '';
  const dark = !!DARKSTONES[live.stone.stone];

  /* site.js:3831 — the washes are decorative spans outside this subtree's
     control flow, so they are painted the way the source paints them. */
  useEffect(() => {
    if (!bg) return;
    ref.current?.querySelectorAll<HTMLElement>('.est-wash').forEach((el) => {
      el.style.backgroundImage = bg;
    });
  }, [bg, ref]);

  /* ---- the eased price readout — site.js:3813-3825 ---- */

  const priceEl = useRef<HTMLDivElement>(null);
  const lowT = useRef(0);
  const highT = useRef(0);
  const lowS = useRef<number | null>(null);
  const highS = useRef<number | null>(null);
  const raf = useRef<number | null>(null);

  const fmt = (v: number) => '£' + Math.round(v).toLocaleString('en-GB');

  const frame = useCallback(() => {
    raf.current = null;
    const el = priceEl.current;
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const f = reduce ? 1 : 0.14;
    lowS.current = lowS.current === null ? lowT.current : lowS.current + (lowT.current - lowS.current) * f;
    highS.current = highS.current === null ? highT.current : highS.current + (highT.current - highS.current) * f;
    if (Math.abs(lowT.current - lowS.current) < 1 && Math.abs(highT.current - highS.current) < 1) {
      lowS.current = lowT.current;
      highS.current = highT.current;
    }
    el.textContent = fmt(lowS.current) + ' – ' + fmt(highS.current);
    if (lowS.current !== lowT.current || highS.current !== highT.current) raf.current = requestAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!est.mounted) return;
    const el = priceEl.current;
    if (!el) return;
    if (result.price.type === 'range') {
      /* site.js:3820-3825 `showRange` — the FIRST call snaps, because lowS is
         still null; every call after it eases at 0.14 a frame. */
      el.classList.remove('txt');
      lowT.current = result.price.lo;
      highT.current = result.price.hi;
      if (raf.current === null) raf.current = requestAnimationFrame(frame);
    } else {
      /* site.js:3826-3832 `showText`. */
      if (raf.current) cancelAnimationFrame(raf.current);
      raf.current = null;
      lowS.current = null;
      highS.current = null;
      el.classList.add('txt');
      el.textContent = result.price.text;
    }
  }, [result.price, est.mounted, frame]);

  useEffect(
    () => () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    },
    [],
  );

  /* ---- the "Used for" popover ---- */

  const [popRow, setPopRow] = useState<number | null>(null);
  const popBtn = useRef<HTMLButtonElement | null>(null);
  const closePop = useCallback((refocus?: boolean) => {
    const btn = popBtn.current;
    popBtn.current = null;
    setPopRow(null);
    if (refocus && btn && document.contains(btn)) btn.focus();
  }, []);

  /* ---- the modal — site.js:4204-4222 ---- */

  const modalRef = useRef<HTMLDivElement>(null);
  const modalReturn = useRef<HTMLElement | null>(null);
  const [modalHidden, setModalHidden] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (est.modalMode) {
      setModalHidden(false);
      document.documentElement.style.overflow = 'hidden';
      let raf2 = 0;
      const raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => setModalOpen(true));
      });
      return () => {
        cancelAnimationFrame(raf1);
        cancelAnimationFrame(raf2);
      };
    }
    setModalOpen(false);
    document.documentElement.style.overflow = '';
    /* site.js:4219 — the card animates out for 420 ms before it is hidden. */
    const t = setTimeout(() => setModalHidden(true), 420);
    return () => clearTimeout(t);
  }, [est.modalMode]);

  /* site.js:4213 — focus the current choice, else the first control. */
  const modalBody = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!est.modalMode) {
      const back = modalReturn.current;
      modalReturn.current = null;
      if (back && document.contains(back)) back.focus();
      return;
    }
    const b = modalBody.current;
    (b?.querySelector<HTMLElement>('.on') || b?.querySelector<HTMLElement>('button') || null)?.focus();
    // Only on open, not on every keystroke in the search box.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [est.modalMode]);

  /** site.js:4223-4232 — Escape closes, Tab cycles inside the card. */
  const onModalKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      est.closeModal();
      return;
    }
    if (e.key !== 'Tab') return;
    const f = [...(modalRef.current?.querySelectorAll<HTMLElement>('button') ?? [])].filter((el) => el.offsetParent !== null);
    if (!f.length) return;
    const first = f[0];
    const last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const openModalFrom = (mode: 'stone' | 'edge', el: HTMLElement | null) => {
    modalReturn.current = el;
    est.openModal(mode);
  };

  /* site.js:4155-4166 — the picker's filtered list and its count line. */
  const terms = modalTerms(est.stoneQuery);
  const modalList: CatalogueStone[] = (MATERIALS[est.modalMat] ?? []).filter((s) => !terms.length || matchStone(s, terms));
  const modalCount = est.stoneQuery.trim()
    ? modalList.length
      ? modalList.length + ' of ' + (MATERIALS[est.modalMat]?.length ?? 0) + ' in ' + matLabel(est.modalMat)
      : 'Nothing in ' + matLabel(est.modalMat).toLowerCase() + ' matches that'
    : (MATERIALS[est.modalMat]?.length ?? 0) + ' in ' + matLabel(est.modalMat);

  /* site.js:3872-3879 — the POA board is one whole slab with a name plate. */
  const poaMat = live.stone.mat || live.mat;
  const poaSub = (MATS[poaMat as MatId] || {}).noCat ? 'Priced by hand' : poaMat;

  const showEngine = est.mounted;
  const animate = est.animateNext.current;
  if (est.mounted) est.animateNext.current = false;

  return (
    <>
      <section className="section" id="estimator" ref={ref}>
        <div className="section-head rise">
          <h2 className="section-title">
            What would yours <em>cost</em>?
          </h2>
          <p className="section-sub">
            Type in your sizes, straight off the tape, and watch them laid out on real slabs. An honest range in
            seconds, no forms and no phone number, with your exact price after a free home visit.
          </p>
        </div>

        <div className="est-grid">
          <div className="est-panel glow-card rise" id="estPanel">
            <div className="est-block">
              <div className="est-labelrow">
                <span className="est-k">Material</span>
                <span className="est-hint">Engineered or natural</span>
              </div>
              <div className="est-tabs" id="estTabs">
                {(['Quartz', 'Marble', 'Granite', 'Porcelain'] as MatId[]).map((m) => (
                  <button
                    key={m}
                    className={'mat-tab' + (live.mat === m ? ' on' : '')}
                    data-mat={m}
                    type="button"
                    aria-pressed={live.mat === m}
                    onClick={() => est.setMat(m)}
                  >
                    {m === 'Marble' ? <>Marble &amp; Quartzite</> : m}
                  </button>
                ))}
              </div>
              <button
                className="est-stonebtn"
                id="estStoneBtn"
                type="button"
                aria-haspopup="dialog"
                hidden={showEngine ? est.stoneBtnHidden : undefined}
                onClick={(e) => openModalFrom('stone', e.currentTarget)}
              >
                <span className="est-swatch" id="estSwatch" aria-hidden="true" style={bg ? { backgroundImage: bg } : undefined} />
                <span className="est-stonetxt">
                  <b id="estStoneName">{showEngine ? live.stone.name : '–'}</b>
                  <small id="estStoneSup">
                    {showEngine
                      ? (live.stone.kind || live.stone.mat || live.mat) + (live.stone.finish ? ' · ' + live.stone.finish : '')
                      : '–'}
                  </small>
                </span>
                <span className="est-change" aria-hidden="true">
                  Change
                </span>
              </button>
            </div>

            <div id="estCalc" hidden={showEngine ? result.calcHidden : undefined}>
              <div className="est-block">
                <div className="est-labelrow">
                  <span className="est-k">Your worktops</span>
                  <span className="est-hint">Most kitchens are two or three pieces</span>
                </div>
                <div className="est-quick" id="estQuick" role="group" aria-label="Quick-start kitchen shapes">
                  {(['straight', 'lshape', 'ushape', 'galley'] as const).map((s) => (
                    <button
                      key={s}
                      className={'est-chip' + (est.shapeChip === s ? ' on' : '')}
                      data-shape={s}
                      type="button"
                      aria-pressed={est.shapeChip === s}
                      onClick={() => est.applyShape(s)}
                    >
                      {{ straight: 'Straight', lshape: 'L-shape', ushape: 'U-shape', galley: 'Galley' }[s]}
                    </button>
                  ))}
                  <button
                    className={'est-chip' + (est.islandOn ? ' on' : '')}
                    id="estIsland"
                    type="button"
                    aria-pressed={est.islandOn}
                    onClick={est.toggleIsland}
                  >
                    + Island
                  </button>
                </div>

                {/* site.js:3968-3993 — the rows, rebuilt whenever the list changes. */}
                <div className="est-rows" id="estRows" ref={rowsEl}>
                  <div className="est-rowhead" aria-hidden="true">
                    <span />
                    <span>Length mm</span>
                    <span>Width mm</span>
                    <span>Thickness mm</span>
                    <span className="rh-use">Used for</span>
                    <span />
                  </div>
                  {live.pieces.map((p, i) => {
                    const lab = LAB(i);
                    const wr = widRange(p);
                    return (
                      <div className="est-row" data-i={i} key={i}>
                        <span className="est-pl">{lab}</span>
                        <span className="est-fl est-fl-len" aria-hidden="true">
                          Length mm
                        </span>
                        <input
                          className="est-in"
                          data-f="len"
                          type="number"
                          inputMode="numeric"
                          min={LIM.len[0]}
                          max={LIM.len[1]}
                          step={10}
                          value={p.len}
                          aria-label={`Piece ${lab} length in millimetres`}
                          onChange={(e) => est.typeField(i, 'len', e.target.value)}
                          onBlur={(e) => est.blurField(i, 'len', e.target.value)}
                        />
                        <span className="est-fl est-fl-wid" aria-hidden="true">
                          Width mm
                        </span>
                        <input
                          className="est-in"
                          data-f="wid"
                          type="number"
                          inputMode="numeric"
                          min={wr[0]}
                          max={wr[1]}
                          step={10}
                          value={p.wid}
                          aria-label={`Piece ${lab} width in millimetres`}
                          onChange={(e) => est.typeField(i, 'wid', e.target.value)}
                          onBlur={(e) => est.blurField(i, 'wid', e.target.value)}
                        />
                        <span className="est-fl est-fl-th" aria-hidden="true">
                          Thickness mm
                        </span>
                        <span className="est-seg" role="group" aria-label={`Piece ${lab} thickness`}>
                          {THICK.map((t) => (
                            <button
                              key={t}
                              type="button"
                              data-th={t}
                              aria-pressed={p.th === t}
                              aria-label={`${t} millimetre`}
                              onClick={() => est.setThickness(i, t)}
                            >
                              {t}
                            </button>
                          ))}
                        </span>
                        <button
                          className="est-dropbtn est-use"
                          type="button"
                          data-f="use"
                          aria-haspopup="listbox"
                          aria-expanded={popRow === i}
                          aria-label={`What piece ${lab} is for`}
                          onClick={(e) => {
                            if (popRow === i) {
                              closePop();
                              return;
                            }
                            popBtn.current = e.currentTarget;
                            setPopRow(i);
                          }}
                        >
                          <span>{useLabel(p.use)}</span>
                        </button>
                        <button
                          className="est-x"
                          type="button"
                          aria-label={`Remove piece ${lab}`}
                          onClick={() => {
                            est.removePiece(i);
                            focusAfter(() => {
                              const xs = rowsEl.current?.querySelectorAll<HTMLElement>('.est-x') ?? [];
                              return xs[Math.min(i, xs.length - 1)] ?? document.getElementById('estAdd');
                            });
                          }}
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                </div>

                <div className="est-rowfoot">
                  <button
                    className="est-add"
                    id="estAdd"
                    type="button"
                    disabled={est.addDisabled}
                    onClick={() => {
                      est.addPiece();
                      focusAfter(() => rowsEl.current?.querySelector<HTMLElement>('.est-row:last-child .est-in[data-f=len]'));
                    }}
                  >
                    <span className="est-addplus" aria-hidden="true">
                      +
                    </span>
                    <span className="est-addtxt">Add another piece</span>
                  </button>
                  <span className="est-mm">Sizes in millimetres, 3000&thinsp;mm = 3&thinsp;m</span>
                </div>
              </div>

              <div className="est-block">
                <div className="est-labelrow">
                  <span className="est-k">The extras</span>
                  <span className="est-hint">Toggle what applies</span>
                </div>
                <div className="est-extras">
                  {(
                    [
                      ['exWaterfall', 'Waterfall island ends', 'Mitred stone folded to the floor', ''],
                      ['exSplash', 'Full-height splashback', 'The same stone, run up the wall', ''],
                      ['exSill', 'Window sill', 'Cut and finished in the same stone', ''],
                      ['exRemoval', 'Old worktop removal', 'Taken out and disposed of for you', ''],
                      ['exEdge', 'Detailed edging', 'A milled profile in place of the standard pencil edge', 'est-x-wide'],
                    ] as const
                  ).map(([id, name, sub, extra]) => (
                    <label className={'est-extra' + (extra ? ' ' + extra : '')} key={id}>
                      <input
                        type="checkbox"
                        id={id}
                        checked={!!live.checked[id]}
                        onChange={(e) => est.toggleExtra(id, e.target.checked)}
                      />
                      <span className="est-sw" aria-hidden="true" />
                      <span className="est-xname">
                        {name}
                        <small>{sub}</small>
                      </span>
                    </label>
                  ))}

                  {/* site.js:3891-3903 — the profile picker only appears once the
                      switch is on, and the metres box only once a profile is chosen. */}
                  <div className="est-edge" id="estEdgePanel" hidden={showEngine ? !est.edgeOn : true}>
                    <button
                      className="est-edgebtn"
                      id="estEdgeBtn"
                      type="button"
                      aria-haspopup="dialog"
                      onClick={(e) => openModalFrom('edge', e.currentTarget)}
                    >
                      <span className="est-edgeglyph" id="estEdgeGlyph" aria-hidden="true">
                        {live.edgeIdx !== null && <EdgeGlyph d={EDGES[live.edgeIdx][1]} />}
                      </span>
                      <span className="est-edgetxt" id="estEdgeTxt">
                        {live.edgeIdx === null ? (
                          <>
                            Choose your edge profile<small>Eighteen to choose from</small>
                          </>
                        ) : (
                          <>
                            {EDGES[live.edgeIdx][0]}
                            <small>£150 – £300 per linear metre</small>
                          </>
                        )}
                      </span>
                      <span className="est-change" aria-hidden="true">
                        Choose
                      </span>
                    </button>
                    <div className="est-lm" id="estLmWrap" hidden={showEngine ? !est.edgeOn || live.edgeIdx === null : true}>
                      <label htmlFor="estLm">Total linear metres</label>
                      <input
                        className="est-in"
                        id="estLm"
                        type="number"
                        inputMode="decimal"
                        min="0.5"
                        max="40"
                        step="0.5"
                        placeholder="4"
                        value={live.lmRaw}
                        onChange={(e) => est.typeLm(e.target.value)}
                        onBlur={est.blurLm}
                      />
                      <span className="est-lmout" id="estLmOut">
                        {est.lmHint}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="est-standard">A pencil edge and rounded corners come as standard.</p>
              </div>

              <div className="est-block">
                <TcUpload compact />
              </div>
            </div>

            <div className="est-poa" id="estPoa" hidden={showEngine ? result.poaHidden : true}>
              <span className="est-poa-rule" aria-hidden="true" />
              {/* site.js:3909 — the head is the one string the panel writes as HTML. */}
              <h3
                id="estPoaTitle"
                dangerouslySetInnerHTML={
                  showEngine && result.poaTitleHTML ? { __html: result.poaTitleHTML } : undefined
                }
              >
                {showEngine && result.poaTitleHTML ? undefined : (
                  <>
                    Marble and quartzite are priced <em>by hand</em>
                  </>
                )}
              </h3>
              <p id="estPoaLead">
                {showEngine && result.poaLead
                  ? result.poaLead
                  : 'The price of the stone itself swings enormously here, from one block to the next and from one supplier to the next, so a calculator could only ever give you a number we could not stand behind. Send us what you already have and we will go and source it.'}
              </p>
              <ul className="est-poa-points">
                <li>A plan, a sketch or your measurements, in whatever form you have them</li>
                <li>
                  A photo of the colour you are after, or a link to a slab you have seen, and we will find it or
                  something better
                </li>
                <li>Samples come to your kitchen, and you approve your own slab from photographs before a single cut</li>
              </ul>
              <TcUpload />
              <div className="est-poa-cta">
                <a className="rev-cta-primary" href="#cta">
                  Get a price for this stone
                </a>
                <a className="rev-cta-ghost" href="tel:+448000982812">
                  Call 0800 098 2812
                </a>
              </div>
            </div>
          </div>

          <div className="est-preview glow-card rise" id="estPreview">
            <span className="est-dress" aria-hidden="true">
              <span className="est-wash" />
            </span>
            <div className="est-bhead">
              <span className="est-k">Your cutting plan</span>
              <span className="est-stamp" id="estStamp">
                {showEngine ? result.stamp : 'Indicative range'}
              </span>
            </div>
            <div
              className={'est-board' + (showEngine && result.plan && result.plan.slabs.length > 1 ? ' multi' : '')}
              id="estBoard"
              role="group"
              aria-label="Slab cutting plan"
            >
              {showEngine &&
                (result.plan ? (
                  result.plan.slabs.length ? (
                    <Board plan={result.plan} bg={bg} dark={dark} animate={animate} />
                  ) : (
                    <div className="est-empty">Add a piece above and your cutting plan appears here.</div>
                  )
                ) : (
                  /* site.js:3871-3879 — the POA board. */
                  <figure className="est-slab est-poaslab">
                    <div className="est-slabface" style={{ backgroundImage: bg }}>
                      {/* The name plate sits straight on the slab photo, and the
                          sheet gradient in `.est-poaslab .est-slabface::before`
                          only reaches rgba(6,6,8,0.66) — enough over the old
                          drawn stand-in, not over a real light marble. This is
                          the same near-black veil the cutting-plan slabs already
                          wear (`.est-slabface::before`, rgba(8,8,10,0.8)),
                          feathered so it reads as depth of field rather than a
                          band. Measured: it carries both lines past WCAG AA. */}
                      <span className="est-plate-veil" aria-hidden="true" style={PLATE_VEIL} />
                      <figcaption className="est-plate">
                        <b>{live.stone.name}</b>
                        <span>{poaSub}</span>
                      </figcaption>
                    </div>
                  </figure>
                ))}
            </div>
            <div className="est-stats" id="estStats" hidden={showEngine ? result.statsHidden : undefined}>
              <div className="est-stat">
                <b id="stSlabs">{showEngine ? (result.stSlabs ?? '–') : '–'}</b>
                <span id="stSlabsL">{showEngine ? (result.stSlabsL ?? 'slabs') : 'slabs'}</span>
              </div>
              <div className="est-stat">
                <b id="stArea">{showEngine ? (result.stArea ?? '–') : '–'}</b>
                <span>of worktop</span>
              </div>
              <div className="est-stat">
                <b id="stJoins">{showEngine ? (result.stJoints ?? '–') : '–'}</b>
                <span id="stJoinsL">{showEngine ? (result.stJointsL ?? 'joints') : 'joints'}</span>
              </div>
            </div>
            <p className="est-jnote" id="estJnote" hidden={showEngine ? result.jnoteHidden : true}>
              Runs longer than the slab carry one discreet joint, placed exactly at your template visit.
            </p>
            <div className="est-out">
              <span className="est-k" id="estOutK">
                {showEngine ? result.outK : 'Your estimate'}
              </span>
              {/* The engine writes this node's text frame by frame — see the
                  easing effect above — so React must not own its children. */}
              <div className="est-price" id="estPrice" aria-hidden="true" ref={priceEl} suppressHydrationWarning>
                £2,000 – £2,500
              </div>
              <span className="est-sr" id="estPriceSR" aria-live="polite">
                {showEngine
                  ? result.price.type === 'range'
                    ? 'Estimated range £' +
                      Math.round(result.price.lo).toLocaleString('en-GB') +
                      ' to £' +
                      Math.round(result.price.hi).toLocaleString('en-GB')
                    : result.price.sr
                  : ''}
              </span>
              <div className="est-meta" id="estMeta">
                {showEngine ? (result.meta ?? '') : 'Quartz · 2 pieces · 1 slab'}
              </div>
              <p className="est-adds" id="estAdds" hidden={showEngine ? result.addsHidden : true}>
                {showEngine ? (result.adds ?? '') : ''}
              </p>
              <p className="est-inc" id="estInc">
                Templating, fitting, every cut-out, drainer grooves, pencil edges and rounded corners, all included.
                Indicative only, your itemised quote follows a free visit.
              </p>
              <a href="#cta" className="btn-gold" id="estCta" hidden={showEngine ? result.ctaHidden : undefined}>
                Get your exact quote
              </a>
            </div>
          </div>
        </div>

        <div className="est-help rise">
          <div className="est-help-txt">
            <b>Not quite your space?</b>
            <span>
              Breakfast bars, curved runs, more than four slabs, a stone we have not listed. Plenty of jobs sit outside
              a calculator, and they are often the best ones. Tell us what you have in mind and we will price it by
              hand.
            </span>
          </div>
          <div className="est-help-cta">
            <a className="rev-cta-primary" href="#cta">
              Talk to our team
            </a>
            <a className="rev-cta-ghost" href="tel:+448000982812">
              Call 0800 098 2812
            </a>
          </div>
        </div>

        <p className="est-readmore">
          Still choosing? Read up on <a href="/materials/quartz-worktops.html">quartz</a>,{' '}
          <a href="/materials/granite-worktops.html">granite</a>, <a href="/materials/marble-worktops.html">marble</a>,{' '}
          <a href="/materials/porcelain-worktops.html">porcelain</a> and{' '}
          <a href="/materials/quartzite-worktops.html">quartzite</a>, or see{' '}
          <a href="/guides/how-much-do-quartz-worktops-cost.html">what worktops actually cost</a>.
        </p>
      </section>

      {est.mounted && popRow !== null && popBtn.current && (
        <UsePop
          anchor={popBtn.current}
          current={live.pieces[popRow]?.use ?? 'run'}
          onPick={(u) => {
            const i = popRow;
            closePop();
            est.setUse(i, u);
            focusAfter(() => rowsEl.current?.querySelector<HTMLElement>(`.est-row[data-i="${i}"] .est-use`));
          }}
          onClose={closePop}
        />
      )}

      {/*
        The stone / edge-profile picker. It is a SIBLING of #estimator in the
        source, not a child — `.est-modal` is `position:fixed`, and keeping it
        outside the section keeps it clear of the section's stacking context.
      */}
      <div
        className={'est-modal' + (modalOpen ? ' open' : '')}
        id="estModal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="estModalTitle"
        hidden={modalHidden}
        ref={modalRef}
        onKeyDown={onModalKeyDown}
        onClick={(e) => {
          if (e.target === e.currentTarget) est.closeModal();
        }}
      >
        <div className="est-mcard">
          <div className="est-mhead">
            <div>
              <h3 id="estModalTitle">{est.modalMode === 'edge' ? 'Choose your edge profile' : 'Choose your stone'}</h3>
              <p id="estModalSub">
                {est.modalMode === 'edge'
                  ? 'Milled into the front face of the stone, £150 to £300 per linear metre. A pencil edge and rounded corners come as standard, so this is only if you want something worked.'
                  : 'Samples come to your kitchen, and you approve your own slab from photographs before a single cut.'}
              </p>
            </div>
            <button className="est-mx" id="estModalX" type="button" aria-label="Close" onClick={est.closeModal}>
              ×
            </button>
          </div>
          <div className="est-mbody" id="estModalBody" ref={modalBody}>
            {est.modalMode === 'edge' ? (
              /* site.js:4198-4202. */
              <div className="ep-grid">
                {EDGES.map((x, i) => (
                  <button
                    key={i}
                    className={'ep-tile' + (i === live.edgeIdx ? ' on' : '')}
                    type="button"
                    data-ep={i}
                    aria-pressed={i === live.edgeIdx}
                    onClick={() => {
                      est.closeModal();
                      est.setEdgeIdx(i);
                    }}
                  >
                    <EdgeGlyph d={x[1]} />
                    <span>{x[0]}</span>
                  </button>
                ))}
              </div>
            ) : (
              /* site.js:4166-4180 — the three tabs are hard-coded, so porcelain
                 is deliberately absent from the picker. */
              <>
                <div className="est-mtabs">
                  {['Quartz', 'Marble', 'Granite'].map((m) => (
                    <button
                      key={m}
                      className={'mat-tab' + (m === est.modalMat ? ' on' : '')}
                      type="button"
                      data-mmat={m}
                      aria-pressed={m === est.modalMat}
                      onClick={() => est.setModalMat(m)}
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
                      type="search"
                      id="estStoneSearch"
                      placeholder="Try white, matt, marble effect"
                      aria-label="Search stones by name"
                      value={est.stoneQuery}
                      onChange={(e) => est.setStoneQuery(e.target.value)}
                    />
                  </label>
                </div>
                <p className={'est-mcount' + (modalList.length ? '' : ' none')}>{modalCount}</p>
                {!!modalList.length && (
                  <div className="sp-grid">
                    {modalList.map((s) => (
                      <button
                        key={s.slug}
                        className={'sp-tile' + (s.slug === live.stone.slug ? ' on' : '')}
                        type="button"
                        data-slug={s.slug}
                        aria-pressed={s.slug === live.stone.slug}
                        onClick={() => {
                          est.closeModal();
                          est.setStone(s, true);
                        }}
                      >
                        <span className="sp-face" style={{ backgroundImage: face(s.stone, s.seed, s.slug) }} />
                        <b>{s.name}</b>
                        <small>{s.finish || s.kind || s.mat}</small>
                      </button>
                    ))}
                  </div>
                )}
                <p className="est-msource">
                  Not the stone you had in mind? We can usually source it.{' '}
                  <button
                    type="button"
                    id="estSourceAsk"
                    onClick={() => {
                      est.closeModal();
                      /* site.js:4241-4243 — hand the visitor to the enquiry form. */
                      setTimeout(() => document.getElementById('cta')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
                    }}
                  >
                    Tell us what you are after
                  </button>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
