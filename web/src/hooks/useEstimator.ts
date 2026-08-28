'use client';

/**
 * The estimator's state machine — assets/site.js:3587-4245.
 *
 * All of the panel's mutable state and every handler the old IIFE installed,
 * with the pure engine left in src/lib/estimator. The component below it is a
 * renderer; nothing here touches the DOM except the two things the source
 * genuinely does imperatively (the eased price readout and the board's
 * stagger), which live in the component.
 *
 * THE DEBOUNCE IS REAL. site.js:3966-3967 recomputes 140 ms after a keystroke,
 * not on every one, so the state is split in two: `live` drives the controlled
 * inputs and updates instantly, `committed` drives the engine and lags by the
 * debounce on the two typing paths (a row's number inputs, site.js:3999-4004;
 * the linear-metre box, site.js:4069). Every other path commits immediately.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  ISLAND,
  LIM,
  MATS,
  SHAPES,
  clamp,
  widRange,
  type ExtraId,
  type MatId,
  type Piece,
  type UseId,
} from '@/lib/estimator/constants';
import { MATERIALS, bestFor, findStone, type CatalogueStone, type StoneDetail } from '@/lib/estimator/catalogue';
import { STONE_PALETTES } from '@/lib/estimator/marble';
import { edgeMetres, estimate, type Estimate } from '@/lib/estimator/price';

/** Everything the engine reads. */
interface EngineState {
  mat: MatId;
  stone: CatalogueStone;
  pieces: Piece[];
  checked: Partial<Record<ExtraId, boolean>>;
  edgeIdx: number | null;
  lmRaw: string;
}

/** site.js:3700 — the panel opens on one 3000 × 620 × 20 worktop run. */
const FIRST_PIECE: Piece = { len: 3000, wid: 620, th: 20, use: 'run' };

/** site.js:4041 — what "+ Add another piece" pushes. NOT the same as the
 *  opening piece: it is 2000 mm, not 3000. */
const ADDED_PIECE: Piece = { len: 2000, wid: 620, th: 20, use: 'run' };

export type ModalMode = 'stone' | 'edge';

export function useEstimator() {
  const initial = useMemo<EngineState>(
    () => ({ mat: 'Quartz', stone: bestFor('Quartz'), pieces: [{ ...FIRST_PIECE }], checked: {}, edgeIdx: null, lmRaw: '' }),
    [],
  );

  const [live, setLive] = useState<EngineState>(initial);
  const [committed, setCommitted] = useState<EngineState>(initial);
  /** site.js:3701 — which quick-start chip is lit, or none. */
  /**
   * ⛔ HAS THE VISITOR ACTUALLY CHOSEN A STONE?
   *
   * The engine has always opened on a real stone — `bestFor('Quartz')`, which
   * is Azul Shimmer — because every piece of it, the board, the slab count and
   * the price, needs one to compute against. That default then read as a
   * CHOICE: the board showed a stone nobody picked, priced it, and the enquiry
   * email carried it as the customer's own.
   *
   * The client: "make sure that the estimator is completely empty until
   * someone has chosen a stone from the stone selector ... otherwise they can
   * say browse or choose your stone."
   *
   * So the state keeps its working default and the SCREEN does not present it.
   * Until this latches, the stone button invites them to choose one and the
   * board shows no price. It latches on picking a stone or on changing the
   * material, both of which are the visitor saying what they want.
   */
  const [stoneChosen, setStoneChosen] = useState(false);

  const [shapeChip, setShapeChip] = useState<string | null>(null);
  /** site.js:3701 — the next board render animates its pieces in. */
  const animateNext = useRef(true);
  /** The shell's static markup is what the server sends; the engine's output
   *  only replaces it after mount, exactly as site.js does. */
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const deb = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearDeb = () => {
    if (deb.current) clearTimeout(deb.current);
    deb.current = null;
  };
  useEffect(() => clearDeb, []);

  /** Apply a change and recompute now — site.js `compute()`. */
  const commit = useCallback((next: EngineState) => {
    clearDeb();
    setLive(next);
    setCommitted(next);
  }, []);

  /** Apply a change and recompute in 140 ms — site.js:3967 `softCompute()`. */
  const commitSoon = useCallback((next: EngineState) => {
    clearDeb();
    setLive(next);
    deb.current = setTimeout(() => setCommitted(next), 140);
  }, []);

  const result: Estimate = useMemo(() => estimate(committed), [committed]);

  /* ---------------- rows — site.js:3999-4046 ---------------- */

  /** A number input while it is being typed in. No clamping yet, and the
   *  source only accepts it at all when it parses — site.js:4002. */
  const typeField = useCallback(
    (i: number, f: 'len' | 'wid', raw: string) => {
      const v = +raw;
      if (!isFinite(v) || !live.pieces[i]) return;
      const pieces = live.pieces.map((p, k) => (k === i ? { ...p, [f]: v } : p));
      commitSoon({ ...live, pieces });
    },
    [live, commitSoon],
  );

  /** Blur / commit of a number input — site.js:4013-4020. An empty box falls
   *  back to the value already held, then clamps. */
  const blurField = useCallback(
    (i: number, f: 'len' | 'wid', raw: string) => {
      const p = live.pieces[i];
      if (!p) return;
      const t = raw.trim();
      const v = clamp(t === '' ? p[f] : t, f === 'wid' ? widRange(p) : LIM.len);
      commit({ ...live, pieces: live.pieces.map((q, k) => (k === i ? { ...q, [f]: v } : q)) });
    },
    [live, commit],
  );

  /** site.js:4025-4031. */
  const setThickness = useCallback(
    (i: number, th: number) => {
      if (!live.pieces[i]) return;
      commit({ ...live, pieces: live.pieces.map((p, k) => (k === i ? { ...p, th } : p)) });
    },
    [live, commit],
  );

  /** site.js:4006-4012 — changing the use re-clamps the width into the new
   *  range, which is how an upstand snaps from 620 mm down to 150 mm. */
  const setUse = useCallback(
    (i: number, use: UseId) => {
      const p = live.pieces[i];
      if (!p || p.use === use) return;
      const wr = widRange({ use });
      const pieces = live.pieces.map((q, k) => (k === i ? { ...q, use, wid: Math.min(wr[1], Math.max(wr[0], q.wid)) } : q));
      setShapeChip(null);
      animateNext.current = true;
      commit({ ...live, pieces });
    },
    [live, commit],
  );

  /** site.js:4033-4039. */
  const removePiece = useCallback(
    (i: number) => {
      const pieces = live.pieces.filter((_, k) => k !== i);
      setShapeChip(null);
      animateNext.current = true;
      commit({ ...live, pieces });
    },
    [live, commit],
  );

  /** site.js:4040-4045 — hard stop at LIM.rows. */
  const addPiece = useCallback(() => {
    if (live.pieces.length >= LIM.rows) return;
    setShapeChip(null);
    animateNext.current = true;
    commit({ ...live, pieces: [...live.pieces, { ...ADDED_PIECE }] });
  }, [live, commit]);

  const addDisabled = live.pieces.length >= LIM.rows;

  /* ---------------- quick-start — site.js:4047-4061 ---------------- */

  /** site.js:4050-4055. Toggles the island row in and out; it is a piece like
   *  any other, and it counts against the same ten-row cap. */
  const toggleIsland = useCallback(() => {
    animateNext.current = true;
    const i = live.pieces.findIndex((p) => p.use === 'island');
    if (i >= 0) {
      commit({ ...live, pieces: live.pieces.filter((_, k) => k !== i) });
      return;
    }
    if (live.pieces.length >= LIM.rows) return;
    commit({ ...live, pieces: [...live.pieces, { ...ISLAND }] });
  }, [live, commit]);

  /** site.js:4056-4060 — a shape REPLACES the rows, but keeps any island. */
  const applyShape = useCallback(
    (name: string) => {
      animateNext.current = true;
      const isl = live.pieces.find((p) => p.use === 'island');
      const pieces: Piece[] = SHAPES[name].map(([len, wid, use]) => ({ len, wid, th: 20, use }));
      if (isl) pieces.push(isl);
      setShapeChip(name);
      commit({ ...live, pieces });
    },
    [live, commit],
  );

  /** site.js:3996 — the "+ Island" chip's own pressed state. */
  const islandOn = live.pieces.some((p) => p.use === 'island');

  /* ---------------- material and stone — site.js:3826-3870, 4062-4067 ---- */

  const selfEvent = useRef(false);

  /** site.js:3826-3843. Announcing re-broadcasts to the rest of the page. */
  const setStone = useCallback(
    (entry: CatalogueStone, announce: boolean) => {
      /* They have named a stone. See stoneChosen. */
      setStoneChosen(true);
      animateNext.current = true;
      const mat = entry.mat && MATS[entry.mat as MatId] && entry.mat !== live.mat ? (entry.mat as MatId) : live.mat;
      commit({ ...live, mat, stone: entry });
      if (announce && typeof document !== 'undefined') {
        selfEvent.current = true;
        document.dispatchEvent(
          new CustomEvent('topcat:stone', {
            detail: {
              name: entry.name,
              mat: entry.mat || mat,
              stone: entry.stone,
              seed: entry.seed,
              slug: entry.slug,
              sup: entry.sup,
              src: 'estimator',
            },
          }),
        );
        selfEvent.current = false;
      }
    },
    [live, commit],
  );

  /** site.js:4062-4067 — a tab switches the bucket AND its landing stone. */
  const setMat = useCallback(
    (m: MatId) => {
      if (m === live.mat) return;
      /* Switching material is also a choice: it lands on that bucket's stone
         and the visitor asked for it. See stoneChosen. */
      setStoneChosen(true);
      animateNext.current = true;
      commit({ ...live, mat: m, stone: bestFor(m) });
    },
    [live, commit],
  );

  /** site.js:4076-4079 — another section on the page picked a stone. */
  const liveRef = useRef(live);
  liveRef.current = live;
  useEffect(() => {
    const onStone = (e: Event) => {
      if (selfEvent.current) return;
      const d = (e as CustomEvent<StoneDetail>).detail;
      const cur = liveRef.current;
      const entry = d ? findStone(d, cur.mat, STONE_PALETTES) : bestFor(cur.mat);
      animateNext.current = true;
      const mat = entry.mat && MATS[entry.mat as MatId] && entry.mat !== cur.mat ? (entry.mat as MatId) : cur.mat;
      clearDeb();
      const next = { ...cur, mat, stone: entry };
      setLive(next);
      setCommitted(next);
    };
    document.addEventListener('topcat:stone', onStone);
    return () => document.removeEventListener('topcat:stone', onStone);
  }, []);

  /* ---------------- extras and edging — site.js:3880-3903, 4068-4075 ----- */

  /** site.js:4068-4071. */
  const toggleExtra = useCallback(
    (id: ExtraId, on: boolean) => commit({ ...live, checked: { ...live.checked, [id]: on } }),
    [live, commit],
  );

  const setEdgeIdx = useCallback(
    (i: number) => {
      commit({ ...live, edgeIdx: i });
    },
    [live, commit],
  );

  /** site.js:4072. */
  const typeLm = useCallback((raw: string) => commitSoon({ ...live, lmRaw: raw }), [live, commitSoon]);

  /** site.js:4073-4075 — on commit the box DOES get the 0.5–40 clamp the
   *  pricing path skips, and a blank box is left blank. */
  const blurLm = useCallback(() => {
    const raw = live.lmRaw.trim();
    const lmRaw = raw === '' ? live.lmRaw : String(Math.min(LIM.lm[1], Math.max(LIM.lm[0], parseFloat(raw) || LIM.lm[0])));
    commit({ ...live, lmRaw });
  }, [live, commit]);

  const edgeOn = !!live.checked.exEdge;
  /** site.js:3888-3890 — the hint disappears once a length is in the box. */
  const lmHint = edgeMetres(edgeOn, live.edgeIdx, live.lmRaw) ? '' : 'Your total run length, usually four to eight metres in a kitchen.';

  /* ---------------- the picker modal — site.js:4143-4245 ---------------- */

  const [modalMode, setModalMode] = useState<ModalMode | null>(null);
  const [modalMat, setModalMat] = useState<string>('Quartz');
  const [stoneQuery, setStoneQuery] = useState('');

  /** site.js:4204-4213. */
  const openModal = useCallback(
    (mode: ModalMode) => {
      if (mode === 'stone') {
        setModalMat(live.stone.mat && MATERIALS[live.stone.mat] ? live.stone.mat : live.mat);
        setStoneQuery('');
      }
      setModalMode(mode);
    },
    [live],
  );
  const closeModal = useCallback(() => setModalMode(null), []);

  /** site.js:3841 — porcelain has no catalogue, so it has no picker button. */
  const stoneBtnHidden = !!(MATS[(live.stone.mat || live.mat) as MatId] || {}).noCat;

  return {
    mounted,
    live,
    result,
    shapeChip,
    stoneChosen,
    islandOn,
    addDisabled,
    animateNext,
    edgeOn,
    lmHint,
    stoneBtnHidden,
    modalMode,
    modalMat,
    stoneQuery,
    setModalMat,
    setStoneQuery,
    openModal,
    closeModal,
    typeField,
    blurField,
    setThickness,
    setUse,
    removePiece,
    addPiece,
    toggleIsland,
    applyShape,
    setMat,
    setStone,
    toggleExtra,
    setEdgeIdx,
    typeLm,
    blurLm,
  };
}
