/* ============================================================================
   TOPCAT WORKTOPS — V2 BEHAVIOUR
   Motion rule from the brand book: stone has mass. Everything fades and rises
   into place; nothing springs or bounces. prefers-reduced-motion is honoured
   everywhere — the experience degrades to elegant, never broken.
   ========================================================================== */
(function () {
  'use strict';

  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- 1. LOADER: the plumb-bob drops and settles ---------- */
  function loader() {
    var el = $('.loader');
    if (!el) return;
    var hide = function () { el.classList.add('done'); };
    if (REDUCED) { hide(); return; }
    // never hold the page hostage: settle on load, or after a hard cap
    var t = setTimeout(hide, 2100);
    window.addEventListener('load', function () { clearTimeout(t); setTimeout(hide, 900); });
  }

  /* ---------- 2. THE VEIN: scroll rail + plumb-bob ---------- */
  function vein() {
    var rail = $('.vein-rail');
    if (!rail) return;
    var fill = $('.fill', rail), bob = $('.bob', rail);
    var raf = null;
    function draw() {
      raf = null;
      var h = document.documentElement.scrollHeight - window.innerHeight;
      var p = h > 0 ? Math.min(1, Math.max(0, window.scrollY / h)) : 0;
      var px = p * window.innerHeight;
      fill.style.height = px + 'px';
      bob.style.top = px + 'px';
    }
    function onScroll() { if (raf === null) raf = requestAnimationFrame(draw); }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    draw();
  }

  /* ---------- 3. NAV ---------- */
  function nav() {
    var bar = $('.nav');
    if (bar) {
      var stick = function () { bar.classList.toggle('stuck', window.scrollY > 30); };
      window.addEventListener('scroll', stick, { passive: true });
      stick();
    }

    // dropdowns (click to open; hover on pointer devices)
    $$('.has-menu').forEach(function (m) {
      var btn = $('button', m);
      if (!btn) return;
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var was = m.classList.contains('open');
        $$('.has-menu').forEach(function (o) { o.classList.remove('open'); });
        m.classList.toggle('open', !was);
        btn.setAttribute('aria-expanded', String(!was));
      });
      if (window.matchMedia('(hover:hover)').matches) {
        m.addEventListener('mouseenter', function () { m.classList.add('open'); });
        m.addEventListener('mouseleave', function () { m.classList.remove('open'); });
      }
    });
    document.addEventListener('click', function () {
      $$('.has-menu').forEach(function (o) { o.classList.remove('open'); });
    });

    // mobile sheet
    var burger = $('.burger');
    if (burger) {
      burger.addEventListener('click', function () {
        var open = document.documentElement.classList.toggle('menu-open');
        burger.setAttribute('aria-expanded', String(open));
      });
      $$('.mnav a').forEach(function (a) {
        a.addEventListener('click', function () {
          document.documentElement.classList.remove('menu-open');
          burger.setAttribute('aria-expanded', 'false');
        });
      });
    }
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        document.documentElement.classList.remove('menu-open');
        $$('.has-menu').forEach(function (o) { o.classList.remove('open'); });
      }
    });
  }

  /* ---------- 4. REVEALS ---------- */
  function reveals() {
    var els = $$('.rise, .mask, .draw');
    if (!els.length) return;
    if (REDUCED || !('IntersectionObserver' in window)) {
      els.forEach(function (e) { e.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (e) { io.observe(e); });
  }

  /* ---------- 5. COUNTERS ---------- */
  function counters() {
    var els = $$('[data-count]');
    if (!els.length) return;
    if (REDUCED || !('IntersectionObserver' in window)) {
      els.forEach(function (e) { e.textContent = e.getAttribute('data-count'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target; io.unobserve(el);
        var raw = el.getAttribute('data-count');
        var target = parseFloat(raw);
        var dec = (raw.split('.')[1] || '').length;
        var suffix = el.getAttribute('data-suffix') || '';
        var t0 = null, dur = 1500;
        function step(ts) {
          if (t0 === null) t0 = ts;
          var p = Math.min(1, (ts - t0) / dur);
          var eased = 1 - Math.pow(1 - p, 3);          // heavy out, no overshoot
          el.textContent = (target * eased).toFixed(dec) + suffix;
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      });
    }, { threshold: 0.5 });
    els.forEach(function (e) { io.observe(e); });
  }

  /* ---------- 6. FAQ ACCORDION ---------- */
  function faq() {
    $$('.faq-item').forEach(function (item) {
      var q = $('.faq-q', item), a = $('.faq-a', item);
      if (!q || !a) return;
      q.setAttribute('aria-expanded', 'false');
      q.addEventListener('click', function () {
        var open = item.classList.toggle('open');
        q.setAttribute('aria-expanded', String(open));
        a.style.height = open ? a.firstElementChild.offsetHeight + 'px' : '0px';
      });
    });
    window.addEventListener('resize', function () {
      $$('.faq-item.open').forEach(function (item) {
        var a = $('.faq-a', item);
        if (a) a.style.height = a.firstElementChild.offsetHeight + 'px';
      });
    });
  }

  /* ---------- 7. HERO PARALLAX (subtle, heavy) ---------- */
  function parallax() {
    if (REDUCED) return;
    var img = $('.hero-bg img');
    if (!img) return;
    var raf = null;
    function draw() {
      raf = null;
      var y = window.scrollY;
      if (y > window.innerHeight * 1.2) return;
      img.style.transform = 'translate3d(0,' + (y * 0.16).toFixed(2) + 'px,0) scale(1.04)';
    }
    window.addEventListener('scroll', function () {
      if (raf === null) raf = requestAnimationFrame(draw);
    }, { passive: true });
  }

  /* ---------- 8. PROCEDURAL MARBLE ----------
     The gold is already in the stone. Every slab is generated, so no two are
     the same — the same idea as the Origin system, expressed in pixels.        */
  function rng(seed) {
    var s = seed >>> 0 || 1;
    return function () {
      s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0;
      return s / 4294967296;
    };
  }

  function marbleSVG(opts) {
    opts = opts || {};
    var seed   = opts.seed || 7;
    var base   = opts.base || '#F4F1EA';
    var base2  = opts.base2 || '#E4DED2';
    var vein   = opts.vein || '#C6A664';
    var grey   = opts.grey || 'rgba(90,90,96,.36)';
    var count  = opts.count || 5;
    var W = 600, H = 420;
    var r = rng(seed), i, j;
    var uid = 'm' + seed + Math.floor(r() * 99999);
    var out = '<svg viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg" ' +
              'preserveAspectRatio="xMidYMid slice" aria-hidden="true">';
    out += '<defs><linearGradient id="bg' + uid + '" x1="0" y1="0" x2="1" y2="1">' +
           '<stop offset="0" stop-color="' + base + '"/>' +
           '<stop offset="1" stop-color="' + base2 + '"/></linearGradient>' +
           '<filter id="sf' + uid + '"><feGaussianBlur stdDeviation="1.1"/></filter>' +
           '<filter id="sh' + uid + '"><feGaussianBlur stdDeviation="6"/></filter></defs>';
    out += '<rect width="' + W + '" height="' + H + '" fill="url(#bg' + uid + ')"/>';

    // a vein runs diagonally across the slab, with tributaries breaking off it.
    // wander keeps the line believable; opacity is passed in so the soft drifts
    // underneath stay atmospheric instead of reading as ink blots.
    function strand(x0, y0, ang, len, w, col, op, blur, wander) {
      var d = 'M' + x0.toFixed(1) + ',' + y0.toFixed(1);
      var x = x0, y = y0, a = ang;
      var segs = 9 + Math.floor(r() * 6);
      for (var k = 0; k < segs; k++) {
        a += (r() - 0.5) * (wander || 0.34);
        var sl = len / segs;
        var nx = x + Math.cos(a) * sl, ny = y + Math.sin(a) * sl;
        var cx = x + Math.cos(a - 0.22) * sl * 0.55, cy = y + Math.sin(a - 0.22) * sl * 0.55;
        d += ' Q' + cx.toFixed(1) + ',' + cy.toFixed(1) + ' ' + nx.toFixed(1) + ',' + ny.toFixed(1);
        x = nx; y = ny;
      }
      return '<path d="' + d + '" fill="none" stroke="' + col + '" stroke-width="' + w.toFixed(2) +
             '" stroke-linecap="round" opacity="' + op.toFixed(2) + '"' +
             (blur ? ' filter="url(#' + blur + uid + ')"' : '') + '/>';
    }

    // soft drifts underneath: barely-there clouding, not smudges
    for (i = 0; i < 3; i++) {
      out += strand(-40 + r() * W * 0.5, r() * H, 0.34 + r() * 0.3, W * (1.1 + r() * 0.5),
                    18 + r() * 22, grey, 0.1 + r() * 0.09, 'sh', 0.2);
    }
    // the main structure
    for (i = 0; i < count; i++) {
      var sx = -30 + r() * W * 0.55, sy = -20 + r() * (H + 40);
      var ang = 0.3 + r() * 0.42;
      // a soft grey shoulder, then the gold running along it
      out += strand(sx, sy, ang, W * (1.1 + r() * 0.4), 2.4 + r() * 3.4, grey, 0.3 + r() * 0.22, 'sf', 0.3);
      out += strand(sx + 5, sy + 4, ang, W * (1.05 + r() * 0.4), 0.5 + r() * 0.85, vein, 0.65 + r() * 0.35, null, 0.3);
      // tributaries breaking off it
      for (j = 0; j < 3; j++) {
        out += strand(sx + r() * W * 0.8, sy + (r() - 0.5) * 70, ang + (r() - 0.5) * 1.1,
                      W * (0.14 + r() * 0.26), 0.3 + r() * 0.5, vein, 0.3 + r() * 0.4, null, 0.5);
      }
    }
    // fine hairlines for depth
    for (i = 0; i < count * 2; i++) {
      out += strand(r() * W, r() * H, 0.25 + r() * 0.6, W * (0.1 + r() * 0.2),
                    0.25 + r() * 0.35, grey, 0.16 + r() * 0.2, null, 0.6);
    }
    out += '</svg>';
    return out;
  }
  window.marbleSVG = marbleSVG;

  function stones() {
    $$('[data-stone]').forEach(function (el, idx) {
      var kind = el.getAttribute('data-stone');
      var seed = parseInt(el.getAttribute('data-seed'), 10) || (idx + 3) * 17;
      var presets = {
        calacatta: { base: '#F7F5F0', base2: '#E9E3D6', vein: '#C6A664', grey: 'rgba(96,96,104,.34)', count: 5 },
        carrara:   { base: '#F2F2F0', base2: '#DFE0DE', vein: 'rgba(198,166,100,.45)', grey: 'rgba(88,92,98,.42)', count: 6 },
        statuario: { base: '#FAF9F6', base2: '#ECEAE4', vein: '#C6A664', grey: 'rgba(70,74,82,.5)', count: 4 },
        nero:      { base: '#141418', base2: '#0C0C10', vein: '#C6A664', grey: 'rgba(226,226,232,.16)', count: 5 },
        portoro:   { base: '#101014', base2: '#08080B', vein: '#E4CD92', grey: 'rgba(198,166,100,.2)', count: 6 },
        emperador: { base: '#463528', base2: '#2C211A', vein: '#D9BE86', grey: 'rgba(226,214,196,.18)', count: 5 },
        granite:   { base: '#2A2A30', base2: '#191920', vein: 'rgba(198,166,100,.5)', grey: 'rgba(210,210,220,.22)', count: 7 },
        quartz:    { base: '#F6F4F0', base2: '#EBE8E1', vein: 'rgba(198,166,100,.55)', grey: 'rgba(120,122,128,.24)', count: 3 }
      };
      var p = presets[kind] || presets.calacatta;
      p.seed = seed;
      el.innerHTML = marbleSVG(p);
    });
  }

  /* ---------- 9. TILT (weighty, tiny) ---------- */
  function tilt() {
    if (REDUCED || !window.matchMedia('(hover:hover)').matches) return;
    $$('[data-tilt]').forEach(function (el) {
      el.style.transformStyle = 'preserve-3d';
      el.addEventListener('mousemove', function (e) {
        var b = el.getBoundingClientRect();
        var rx = ((e.clientY - b.top) / b.height - 0.5) * -3.2;
        var ry = ((e.clientX - b.left) / b.width - 0.5) * 3.2;
        el.style.transform = 'perspective(900px) rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg)';
      });
      el.addEventListener('mouseleave', function () { el.style.transform = ''; });
    });
  }

  /* ---------- 10. QUOTE FORM (demo: no backend) ---------- */
  function forms() {
    $$('form[data-demo]').forEach(function (f) {
      f.addEventListener('submit', function (e) {
        e.preventDefault();
        var note = $('.form-reply', f);
        if (note) {
          note.textContent = 'Thank you. This is a demo form, so nothing was sent, but on the live site your enquiry would reach us and we would reply within one working day.';
          note.style.color = '#C6A664';
        }
      });
    });
  }

  /* ---------- 11. CURRENT PAGE IN NAV ---------- */
  function markCurrent() {
    var here = location.pathname.replace(/index\.html$/, '').replace(/\/$/, '');
    $$('.nav-links a, .mnav a').forEach(function (a) {
      var href = a.getAttribute('href');
      if (!href || href.charAt(0) === '#') return;
      var path = a.pathname ? a.pathname.replace(/index\.html$/, '').replace(/\/$/, '') : '';
      if (path && path === here) a.setAttribute('aria-current', 'page');
    });
  }

  /* ---------- BOOT ---------- */
  function init() {
    loader(); vein(); nav(); reveals(); counters();
    faq(); parallax(); stones(); tilt(); forms(); markCurrent();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }
})();
