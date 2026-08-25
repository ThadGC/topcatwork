(function () {
  'use strict';
  var ENDPOINT = '/send.php';
  var MAX_POST = 100 * 1024 * 1024;
  var PHONE_TXT = '0800 098 2812';
  var RX_MAIL = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;
  var J_KEY = 'tc_journey', E_KEY = 'tc_estimate';
  var J_MAX = 120;
  var J_TTL = 30 * 24 * 3600 * 1000;
  function band() {
    var w = window.innerWidth;
    return w <= 720 ? 'phone' : w <= 1120 ? 'tablet' : 'desktop';
  }
  function formKind(f) {
    if (f.id === 'ctaForm') return 'Enquiry card';
    if (f.id === 'tradeForm') return 'Trade account form';
    if (f.classList.contains('qform')) return 'Quick enquiry form';
    return 'Form';
  }
  function jload() {
    try {
      var j = JSON.parse(localStorage.getItem(J_KEY) || 'null');
      if (j && j.started && (Date.now() - j.started) < J_TTL && j.ev instanceof Array) return j;
    } catch (e) {}
    return { started: Date.now(), ev: [] };
  }
  function jsave(j) { try { localStorage.setItem(J_KEY, JSON.stringify(j)); } catch (e) {} }
  function jpush(o) {
    var j = jload();
    o.at = Date.now();
    j.ev.push(o);
    if (j.ev.length > J_MAX) j.ev = j.ev.slice(j.ev.length - J_MAX);
    jsave(j);
  }
  function takeQ(o) {
    if (!o || typeof o !== 'object') return;
    if (o.t === 'est') { try { localStorage.setItem(E_KEY, JSON.stringify(o)); } catch (e) {} }
    else jpush(o);
  }
  function journeyBoot() {
    var j = jload();
    if (!j.ev.length) {
      var src = { t: 'ev', k: 'Arrived', v: (document.referrer || 'direct') };
      if (/utm_/.test(location.search)) src.v += ' ' + location.search.slice(0, 120);
      jpush(src);
    }
    jpush({ t: 'ev', k: 'Viewed', v: location.pathname });
    var q0 = window.__tcq;
    if (q0 instanceof Array) for (var i = 0; i < q0.length; i++) takeQ(q0[i]);
    window.__tcq = { push: takeQ };
    document.addEventListener('click', function (e) {
      var a = e.target && e.target.closest && e.target.closest('a,button');
      if (!a || a.closest('.est-row,.est-seg,.tc-up,#estTabs')) return;
      var tx = String(a.textContent || '').replace(/\s+/g, ' ').trim();
      if (!tx) tx = String(a.getAttribute('aria-label') || '').trim();
      if (tx.length < 2 || tx.length > 60) return;
      var sec = a.closest('section[id],footer,nav,header');
      jpush({ t: 'ev', k: 'Clicked', v: tx,
              s: sec ? (sec.id || sec.tagName.toLowerCase()) : '', p: location.pathname });
    }, true);
    addEventListener('pagehide', function () {
      jpush({ t: 'ev', k: 'Left', v: location.pathname });
    });
  }
  function q(f, n) { return f.querySelector('[name="' + n + '"]'); }
  function v(el) { return el ? String(el.value || '').trim() : ''; }
  function digits(s) { return String(s || '').replace(/[^0-9]/g, ''); }
  function noteEl(f) {
    var n = f.querySelector('.cta-reply, .qf-note, .tc-formnote');
    if (n) return n;
    n = document.createElement('p');
    n.className = 'tc-formnote';
    var btn = f.querySelector('button[type=submit], button.cta-send');
    if (btn && btn.parentNode) btn.parentNode.insertBefore(n, btn.nextSibling);
    else f.appendChild(n);
    return n;
  }
  function say(f, msg, kind) {
    var n = noteEl(f);
    if (n.getAttribute('data-rest') === null || n.getAttribute('data-rest') === undefined) {
      n.setAttribute('data-rest', n.textContent);
    }
    n.textContent = msg;
    n.classList.remove('tc-bad', 'tc-ok');
    if (kind) n.classList.add(kind === 'bad' ? 'tc-bad' : 'tc-ok');
    n.setAttribute('role', 'status');
    n.setAttribute('aria-live', 'polite');
  }
  function rest(f) {
    var n = f.querySelector('.cta-reply, .qf-note, .tc-formnote');
    if (!n) return;
    var r = n.getAttribute('data-rest');
    if (r !== null && r !== undefined) n.textContent = r;
    n.classList.remove('tc-bad', 'tc-ok');
  }
  function mark(el, bad) {
    if (!el) return;
    el.classList.toggle('tc-bad', !!bad);
    if (bad) el.setAttribute('aria-invalid', 'true');
    else el.removeAttribute('aria-invalid');
  }
  function check(f) {
    var name = q(f, 'name'), mail = q(f, 'email'), tel = q(f, 'phone'), pc = q(f, 'postcode');
    [name, mail, tel, pc].forEach(function (el) { mark(el, false); });
    if (v(name).length < 2) { mark(name, true); return { el: name, msg: 'Please tell us your name so we know who we are replying to.' }; }
    var hasMail = !!v(mail), hasTel = !!v(tel);
    if (!hasMail && !hasTel) {
      mark(mail, true); mark(tel, true);
      return { el: mail || tel, msg: 'Please leave an email address or a phone number so we can come back to you.' };
    }
    if (hasMail && !RX_MAIL.test(v(mail))) { mark(mail, true); return { el: mail, msg: 'That email address does not look right — please check it.' }; }
    if (hasTel && digits(v(tel)).length < 9) { mark(tel, true); return { el: tel, msg: 'That phone number looks too short — please check it.' }; }
    if (pc && v(pc) && !/^[A-Za-z]{1,2}[0-9][0-9A-Za-z]?\s*[0-9][A-Za-z]{2}$/.test(v(pc))) {
      mark(pc, true); return { el: pc, msg: 'That postcode does not look right — please check it.' };
    }
    return null;
  }
  function payload(f) {
    var fd = new FormData(f);
    fd.append('page', location.pathname);
    fd.append('page_title', String(document.title || '').split('|')[0].trim().slice(0, 80));
    fd.append('form_name', formKind(f));
    fd.append('device', band());
    fd.append('screen', window.innerWidth + '\u00d7' + window.innerHeight);
    try {
      var j = jload();
      if (j.ev.length) fd.append('journey', JSON.stringify(j));
      var est = localStorage.getItem(E_KEY);
      if (est) fd.append('estimate', est);
    } catch (e) {}
    try { if (typeof window.TC_FORM_EXTRA === 'function') window.TC_FORM_EXTRA(fd, f); } catch (e) {}
    return fd;
  }
  function sent(f, name) {
    if (f.classList.contains('qform')) { f.classList.add('sent'); return; }
    say(f, (name ? 'Thank you ' + name + ', your' : 'Your') + ' enquiry is on its way. We reply within one working day.', 'ok');
  }
  function submit(f) {
    var bad = check(f);
    if (bad) {
      say(f, bad.msg, 'bad');
      if (bad.el && bad.el.focus) bad.el.focus();
      return;
    }
    var name = v(q(f, 'name')).split(/\s+/)[0];
    var btn = f.querySelector('button[type=submit], button.cta-send');
    if (!ENDPOINT) {
      say(f, (name ? name + ', this' : 'This') + ' form is not connected yet — please call ' + PHONE_TXT +
             ' or message us on WhatsApp and we will pick it up straight away.', 'bad');
      return;
    }
    var fd = payload(f);
    var totalB = 0;
    fd.forEach(function (v) { if (v && typeof v.size === 'number') totalB += v.size; });
    if (totalB > MAX_POST) {
      say(f, 'Your attachments come to over 100 MB together, which is more than the form can '
           + 'carry in one go. Please take a file or two off and send the largest to us on '
           + 'WhatsApp instead.', 'bad');
      return;
    }
    var was = btn ? btn.textContent : '';
    if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
    say(f, 'Sending…', '');
    fetch(ENDPOINT, { method: 'POST', body: fd, headers: { Accept: 'application/json' } })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r; })
      .then(function () { sent(f, name); f.reset(); })
      .catch(function () {
        say(f, 'Something went wrong sending that. Please call ' + PHONE_TXT + ' and we will take it down for you.', 'bad');
      })
      .then(function () { if (btn) { btn.disabled = false; btn.textContent = was; } });
  }
  function wire(f) {
    if (f.__tc) return; f.__tc = 1;
    f.setAttribute('novalidate', 'novalidate');
    f.addEventListener('submit', function (e) { e.preventDefault(); submit(f); });
    Array.prototype.forEach.call(f.querySelectorAll('button.cta-send, button[type=submit]'), function (b) {
      if (b.type !== 'submit') b.addEventListener('click', function (e) { e.preventDefault(); submit(f); });
    });
    f.addEventListener('input', function (e) {
      if (e.target && e.target.classList && e.target.classList.contains('tc-bad')) { mark(e.target, false); rest(f); }
    });
  }
  function boot() {
    journeyBoot();
    Array.prototype.forEach.call(document.querySelectorAll('form.cta-form, form.qform, form[data-tcform]'), wire);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();