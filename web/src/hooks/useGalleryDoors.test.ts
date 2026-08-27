import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { useGalleryDoors } from './useGalleryDoors';

/* ------------------------------------------------------------ helpers -- */

/**
 * The markup Gallery.tsx renders, reduced to what the engine reads back:
 * eight cards in two sets of four, each with a `.gal-door`.
 */
function buildGallery() {
  const section = document.createElement('section');
  section.id = 'gallery';
  section.innerHTML = `
    <div class="gal-scroll" id="galScroll">
      <div class="gal-pin">
        <div class="gal-stage" id="galStage">
          <div class="gal-mid" id="galMid">
            <div class="gal-mid-actions"></div>
          </div>
          ${[0, 1]
            .map(
              () =>
                `<div class="gal-set">${[0, 1, 2, 3]
                  .map(
                    () =>
                      `<article class="gal-card"><div class="gal-door"><div class="gal-meta"></div></div></article>`,
                  )
                  .join('')}</div>`,
            )
            .join('')}
        </div>
      </div>
    </div>`;
  document.body.appendChild(section);
  const scroll = section.querySelector<HTMLDivElement>('#galScroll')!;
  const stage = section.querySelector<HTMLDivElement>('#galStage')!;
  /* jsdom lays nothing out, so the engine's only two inputs — the stage box
     and the viewport height — are stated outright. 1440x863 is a desktop
     window; 863 is the viewport the door wall was measured at. */
  Object.defineProperty(stage, 'clientWidth', { value: 1440, configurable: true });
  Object.defineProperty(stage, 'clientHeight', { value: 863, configurable: true });
  return { section, scroll, stage };
}

function mount(scroll: HTMLDivElement, stage: HTMLDivElement) {
  const scrollRef = { current: scroll as HTMLDivElement | null };
  const stageRef = { current: stage as HTMLDivElement | null };
  return renderHook(() => useGalleryDoors(scrollRef, stageRef));
}

function setViewportHeight(px: number) {
  Object.defineProperty(window, 'innerHeight', {
    value: px,
    configurable: true,
    writable: true,
  });
}

let dom: ReturnType<typeof buildGallery>;

beforeEach(() => {
  setViewportHeight(863);
  dom = buildGallery();
});

afterEach(() => {
  dom.section.remove();
});

/* -------------------------------------------------------------- specs -- */

describe('the runway', () => {
  it('stretches #galScroll to innerHeight * 5.5', () => {
    const { unmount } = mount(dom.scroll, dom.stage);
    /* site.js:2228. The measured target: 4747 at an 863px-tall viewport,
       which is what the old build reports and the port did not. */
    expect(dom.scroll.style.height).toBe('4746.5px');
    expect(Math.round(parseFloat(dom.scroll.style.height))).toBe(4747);
    unmount();
  });

  it('follows the viewport height', () => {
    setViewportHeight(900);
    const { unmount } = mount(dom.scroll, dom.stage);
    expect(Math.round(parseFloat(dom.scroll.style.height))).toBe(4950);
    unmount();
  });

  it('leaves the runway alone under gal-static', () => {
    dom.section.style.setProperty('--galMode', 'grid');
    const { unmount } = mount(dom.scroll, dom.stage);
    expect(dom.scroll.style.height).toBe('');
    unmount();
  });
});

describe('the mode', () => {
  it('is the door wall when --galMode is unset', () => {
    const { unmount } = mount(dom.scroll, dom.stage);
    expect(dom.section.classList.contains('gal-static')).toBe(false);
    unmount();
  });

  it.each(['phone', 'grid'])('is static at --galMode:%s', (mode) => {
    dom.section.style.setProperty('--galMode', mode);
    const { unmount } = mount(dom.scroll, dom.stage);
    // site.js:2091 — phone and grid are treated alike.
    expect(dom.section.classList.contains('gal-static')).toBe(true);
    unmount();
  });

  it('publishes the phone column geometry, not the door geometry', () => {
    dom.section.style.setProperty('--galMode', 'phone');
    const { unmount } = mount(dom.scroll, dom.stage);
    /* site.js:2131-2135 at w=1440,h=863:
       colW = min(1440-44,460) = 460
       cw   = min(1440*0.42,300) = 300, ch = round(300*0.66*2/3) = 132
       colH = 132 * (460/300) = 202.4 -> 202
       colGap = round(min(18,max(10,863*0.018))) = 16 */
    expect(dom.stage.style.getPropertyValue('--cw')).toBe('460px');
    expect(dom.stage.style.getPropertyValue('--ch')).toBe('202px');
    expect(dom.stage.style.getPropertyValue('--colGap')).toBe('16px');
    unmount();
  });

  it('clears every inline style the door engine wrote when it goes static', () => {
    const { unmount } = mount(dom.scroll, dom.stage);
    const card = dom.stage.querySelector<HTMLElement>('.gal-card')!;
    const door = dom.stage.querySelector<HTMLElement>('.gal-door')!;
    expect(card.style.transform).not.toBe('');

    dom.section.style.setProperty('--galMode', 'phone');
    window.dispatchEvent(new Event('resize'));

    // site.js:2136-2144
    expect(card.style.transform).toBe('');
    expect(card.style.opacity).toBe('');
    expect(door.style.transform).toBe('');
    expect(door.style.boxShadow).toBe('');
    expect(dom.scroll.style.height).toBe('');
    unmount();
  });
});

describe('the card geometry at rest', () => {
  it('sizes the cards from the stage box', () => {
    const { unmount } = mount(dom.scroll, dom.stage);
    /* site.js:2101-2104 at w=1440,h=863,navH=0:
       byW = 1440*(0.5-0.035-0.16)-26 = 413.2, which is the binding limit
       (min against 1440*0.30=432, byH=463.63 and 430),
       so cw = 413.2 and ch = round(413.2*0.66) = 273. */
    expect(parseFloat(dom.stage.style.getPropertyValue('--cw'))).toBeCloseTo(413.2, 4);
    expect(dom.stage.style.getPropertyValue('--ch')).toBe('273px');
    expect(dom.stage.style.getPropertyValue('--galBandY')).toBe('0px');
    unmount();
  });

  it('gathers the cards on the stagger, front card first', () => {
    const { unmount } = mount(dom.scroll, dom.stage);
    const cards = Array.from(dom.stage.querySelectorAll<HTMLElement>('.gal-card'));
    expect(cards).toHaveLength(8);
    /* jsdom's rect is all zeros, so gt = 1 and gTarget = (1-0.40)/1.46
       = 0.410959. GTOTAL = 1+0.12*7 = 1.84.
       Set 0 slot 0: ord = (2-1-0)*4 + 0 = 4
         -> ss(0.410959*1.84 - 0.48) = ss(0.276164) = 0.18666
       Set 1 slot 0: ord = (2-1-1)*4 + 0 = 0
         -> ss(0.756164) = 0.850686, i.e. the BACK set gathers first. */
    expect(cards[0].style.opacity).toBe('0.187');
    expect(cards[4].style.opacity).toBe('0.851');
    for (const c of cards) expect(c.style.transform).toMatch(/^translate3d\(.+\) scale\(.+\)$/);
    unmount();
  });

  it('rings only the two peeking cards while the pile is closed', () => {
    const { unmount } = mount(dom.scroll, dom.stage);
    const set0 = dom.stage.querySelectorAll<HTMLElement>('.gal-set')[0];
    const doors = Array.from(set0.querySelectorAll<HTMLElement>('.gal-door'));
    // site.js:2083 — PEEK_CARDS is [1,2]; stackAmt is 1 with spread at 0.
    expect(doors[0].style.boxShadow).toBe('');
    expect(doors[3].style.boxShadow).toBe('');
    expect(doors[1].style.boxShadow).toContain('inset 0 0 0 3px rgba(198,166,100,1.000)');
    expect(doors[1].style.boxShadow).toContain('0 0 0 1px rgba(198,166,100,0.600)');
    expect(doors[2].style.boxShadow).toBe(doors[1].style.boxShadow);
    unmount();
  });

  it('keeps every door shut until its set walks', () => {
    const { unmount } = mount(dom.scroll, dom.stage);
    // walk is 0 at p=0, so fold is 0 and DOOR_ANG (78) is not applied yet.
    for (const d of dom.stage.querySelectorAll<HTMLElement>('.gal-door'))
      expect(d.style.transform).toMatch(/^rotateY\(-?0\.00deg\)$/);
    unmount();
  });

  it('stacks set 0 in front and holds set 1 behind it', () => {
    const { unmount } = mount(dom.scroll, dom.stage);
    const sets = Array.from(dom.stage.querySelectorAll<HTMLElement>('.gal-set'));
    /* site.js:2276-2280 at walk=0: u is 0 and -1.
       Set 1's z is held back by `hold = spread = 0`, so it sits at 0 too,
       but its zIndex is 10 + round(-1*5) = 5. */
    expect(sets[0].style.transform).toBe('translate3d(0,0.0px,0.0px)');
    expect(sets[0].style.zIndex).toBe('10');
    expect(sets[1].style.zIndex).toBe('5');
    expect(sets[0].classList.contains('settled')).toBe(false);
    expect(dom.stage.classList.contains('settled')).toBe(false);
    unmount();
  });

  it('holds the mid copy hidden until the spread is nearly done', () => {
    const { unmount } = mount(dom.scroll, dom.stage);
    // site.js:2255 — clamp01((spread - 0.72) / 0.28), and spread is 0 here.
    // jsdom normalises the '0.000' the engine writes down to '0'.
    expect(document.getElementById('galMid')!.style.opacity).toBe('0');
    unmount();
  });
});

describe('teardown', () => {
  it('stops responding to resize once unmounted', () => {
    const { unmount } = mount(dom.scroll, dom.stage);
    unmount();
    dom.scroll.style.height = '11px';
    setViewportHeight(1000);
    window.dispatchEvent(new Event('resize'));
    expect(dom.scroll.style.height).toBe('11px');
  });
});
