/* ============================================================================================
   TOPCAT — ONE BEHAVIOUR FOR EVERY FORM ON THE SITE.  24 August 2026.

   Client: *"we're going to start making sure that every form is working."*

   ⛔⛔⛔ **WHAT WAS ACTUALLY WRONG, MEASURED ON THE LIVE PAGES, BECAUSE ALL THREE FORMS WERE
   BROKEN IN A DIFFERENT WAY AND ONLY ONE OF THEM LOOKED IT:**

     .qform      31 pages (services leaves, /materials/, /guides/, /worktops/)
                 Submitted anything, including a COMPLETELY EMPTY form, and then showed
                 "Thank you, we have your details and will come back to you within one
                 working day."  ⛔ **THAT SENTENCE WAS NOT TRUE.** Nothing was sent, nothing
                 was stored, and the visitor walked away believing Topcat had their number.
                 This is the worst fault on the site and it was on 31 pages.

     #tradeForm  /trade/
                 `<button type="button">` with no listener anywhere. Clicking "Open a trade
                 account" did NOTHING AT ALL — no message, no error, no submit. Verified:
                 the form has no action, no method and no submit handler.

     #ctaForm    6 pages
                 Honest ("this is a demo form, so nothing was sent") but accepted an empty
                 form, an address of "x", and a phone number of "1".

   ⭐⭐⭐ **SO THE THREE OF THEM SHARE ONE DESCRIPTION NOW.** Every form on the site is upgraded
   by this file: the same validation, the same error state, the same reply. A fourth form added
   next month is correct the moment it has `name`/`email`/`phone` fields.

   ⭐⭐⭐ **AND THE BACKEND IS ONE STRING AWAY.** `ENDPOINT` below is the only thing that has to
   change when he picks a form service (Formspree, Basin, Netlify, his own). Until it is set,
   the reply says plainly that the form is not connected yet AND hands the visitor the phone
   number, so nobody is ever told their enquiry arrived when it did not.
   ⛔ This is NOT a blocker and must never be presented as one — it is his call and his schedule.
   The job here was to make the forms correct, so that connecting them is one line.
   ============================================================================================ */
(function () {
  'use strict';

  /* ⭐⭐⭐ LIVE SINCE 25 Aug 2026 — his own ask: "we have to make sure the emails are actually
     going there so we can test them." `/send.php` ships with the site (it is in `Website Demo/`
     and rides `make_upload.py` into `upload/`), builds the branded grid email and mails it to
     info@topcatworktops.co.uk. The dev server answers the same path with a harmless JSON mock,
     so the whole flow is testable locally; real mail needs the real host's PHP.
     ⚠️ Root-relative on purpose: /stones/x.html and /services/y.html post to the same file. */
  var ENDPOINT = '/send.php';

  /* the host's PHP defaults cap a POST around 128 MB; the front end stops a hair earlier with a
     human answer instead of letting the server cut the connection with none */
  var MAX_POST = 100 * 1024 * 1024;

  var PHONE_TXT = '0800 098 2812';

  /* a mail address, deliberately loose: the job is to catch "x", "me@" and "me@me",
     not to adjudicate RFC 5322 — a real address that this rejects would be a lost customer */
  var RX_MAIL = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;

  /* ============================================================================================
     ⭐⭐⭐ THE JOURNEY — 25 Aug 2026, client: "we need to gather as much data as possible. So if
     someone used the estimator on the site or chose a service or interacted with different
     sections, we need that information… After submitting the form, all that data must be sent
     along with the email."
     ⭐ WHAT THIS IS: a first-party note of the visit, kept in THIS BROWSER's localStorage and
     sent to Topcat ONLY inside an enquiry the visitor submits. No cookie, no beacon, no third
     party, nothing transmitted on its own — /privacy/ describes it in exactly those terms, so
     changing this behaviour means changing that page in the same commit.
     ⭐ TWO STORES: `tc_journey` is the APPEND trail (page views, meaningful clicks, estimator
     picks, capped and aged out); `tc_estimate` is the LATEST estimator snapshot, OVERWRITTEN on
     every recompute — compute() runs per keystroke and a trail of half-typed kitchens is noise
     where the finished one is signal.
     ⭐ The estimator (an inline script that runs before this file) drops notes into the
     `window.__tcq` array; boot() drains it and swaps in a live object so later notes flow
     straight through. The queue pattern is ORDER-PROOF: neither file needs the other loaded.
     ============================================================================================ */
  var J_KEY = 'tc_journey', E_KEY = 'tc_estimate';
  var J_MAX = 120;                          // events kept; oldest fall off
  var J_TTL = 30 * 24 * 3600 * 1000;        // a month-old trail is somebody else's visit

  /* ⭐ 25 Aug (client): "we must be able to say if it was sent from mobile or desktop or
     tablet" — the three bands are THE SITE'S OWN (≤720 / ≤1120 / desktop), so the email speaks
     the same language as the stylesheet. The screen size rides along for the odd in-between. */
  function band() {
    var w = window.innerWidth;
    return w <= 720 ? 'phone' : w <= 1120 ? 'tablet' : 'desktop';
  }
  /* ⭐ and "we must clearly say which form they submitted" — the form knows what it is */
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
    /* first touch of a fresh trail: where they came from, and any campaign tags */
    if (!j.ev.length) {
      var src = { t: 'ev', k: 'Arrived', v: (document.referrer || 'direct') };
      if (/utm_/.test(location.search)) src.v += ' ' + location.search.slice(0, 120);
      jpush(src);
    }
    jpush({ t: 'ev', k: 'Viewed', v: location.pathname });
    /* drain what the estimator queued before we loaded, then take the queue over */
    var q0 = window.__tcq;
    if (q0 instanceof Array) for (var i = 0; i < q0.length; i++) takeQ(q0[i]);
    window.__tcq = { push: takeQ };
    /* meaningful clicks: any link or button with a short human label. Capture phase, so a
       handler that swallows the event cannot swallow the note. The estimator's own row
       furniture (thickness segs, the × on a row) is skipped — the `est` snapshot already
       carries the finished configuration, which is the signal those clicks are noise around. */
    document.addEventListener('click', function (e) {
      var a = e.target && e.target.closest && e.target.closest('a,button');
      if (!a || a.closest('.est-row,.est-seg,.tc-up,#estTabs')) return;   /* #estTabs: the specific hook already logs it */
      var tx = String(a.textContent || '').replace(/\s+/g, ' ').trim();
      if (!tx) tx = String(a.getAttribute('aria-label') || '').trim();
      if (tx.length < 2 || tx.length > 60) return;
      var sec = a.closest('section[id],footer,nav,header');
      jpush({ t: 'ev', k: 'Clicked', v: tx,
              s: sec ? (sec.id || sec.tagName.toLowerCase()) : '', p: location.pathname });
    }, true);
    /* the Left marker closes the last page's dwell — without it "time on site" ends at the last
       click rather than at leaving. pagehide fires on close, navigate AND bfcache-park. */
    addEventListener('pagehide', function () {
      jpush({ t: 'ev', k: 'Left', v: location.pathname });
    });
  }

  function q(f, n) { return f.querySelector('[name="' + n + '"]'); }
  function v(el) { return el ? String(el.value || '').trim() : ''; }
  function digits(s) { return String(s || '').replace(/[^0-9]/g, ''); }

  /* ⚠️ THE MESSAGE ELEMENT IS THE ONE THE PAGE ALREADY HAS, WHERE IT HAS ONE. The enquiry card
     carries `.cta-reply` ("We reply within one working day") and the SEO card carries `.qf-note`;
     both sit exactly where a reply belongs, so re-using them keeps the layout still instead of
     pushing the button down the page the first time somebody gets it wrong. */
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
    /* announced, not just painted — a sighted user sees the red field, a screen reader needs this */
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

  /* ⭐⭐ **WHAT IS ACTUALLY REQUIRED, AND WHY IT IS NOT "EVERYTHING".** A quote enquiry is useless
     without a name and without a way to answer it — and it is NOT useless without a postcode, a
     message or a company. So: a name, and AT LEAST ONE of email or phone. ⛔ Demanding both is how
     forms lose the customer who does not want to be called. */
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
    /* ⚠️ NINE DIGITS, NOT TEN, AND COUNTED AFTER STRIPPING: a UK landline or mobile typed with
       spaces, brackets, a +44 or a leading 0 all reduce to 9-13, and a number typed as +44 7464
       940287 has TWELVE. Counting characters instead of digits rejects half of them. */
    if (hasTel && digits(v(tel)).length < 9) { mark(tel, true); return { el: tel, msg: 'That phone number looks too short — please check it.' }; }
    /* the postcode is optional, but a filled one that cannot be a postcode is worth catching:
       it is what the free home visit is booked from */
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
    /* ⭐ the whole visit rides with the enquiry — the email's "WHAT THEY DID ON THE SITE" block */
    try {
      var j = jload();
      if (j.ev.length) fd.append('journey', JSON.stringify(j));
      var est = localStorage.getItem(E_KEY);
      if (est) fd.append('estimate', est);
    } catch (e) {}
    /* the enquiry card's picked-stone chip and its attachments, when the page has them.
       ⚠️ Read through a hook rather than reaching into the landing page's own state, so this
       file stays the only thing that knows how a form is sent. */
    try { if (typeof window.TC_FORM_EXTRA === 'function') window.TC_FORM_EXTRA(fd, f); } catch (e) {}
    return fd;
  }

  function sent(f, name) {
    /* .qform hides its fields and shows `.qf-done` — its own design, kept */
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
      /* ⛔⛔ **NOT "WE HAVE YOUR DETAILS". THAT WAS THE BUG.** Nothing has been sent, so the reply
         says so and gives the visitor a route that works right now. The moment ENDPOINT is set
         this branch never runs again. */
      say(f, (name ? name + ', this' : 'This') + ' form is not connected yet — please call ' + PHONE_TXT +
             ' or message us on WhatsApp and we will pick it up straight away.', 'bad');
      return;
    }

    var fd = payload(f);
    /* per-file 50 MB is enforced where files are picked (TC_UP); the TOTAL is enforced here,
       because eight legal files can still add up past what one POST can carry */
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
    /* ⛔ **THE TRADE FORM'S BUTTON IS `type="button"`, SO IT NEVER FIRED A SUBMIT EVENT AT ALL** —
       that is the whole reason it did nothing. Rather than change the markup on a generated page,
       any non-submit button that looks like the send button is wired to the same path. */
    Array.prototype.forEach.call(f.querySelectorAll('button.cta-send, button[type=submit]'), function (b) {
      if (b.type !== 'submit') b.addEventListener('click', function (e) { e.preventDefault(); submit(f); });
    });
    /* clear a field's error the moment the visitor starts fixing it — an error that stays red
       while you retype reads as "still wrong" and is the commonest reason people give up */
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

/* ⭐⭐ THE KEYBOARD WATCHER (D440) — sets `html.kb-open` while the on-screen keyboard is up, so the
   sticky bar and the corner pair can get out of its way (the rules live in site.css).
   ⭐ WHY visualViewport AND NOT A FOCUS EVENT. Focus tells you an input was tapped, not that a
   keyboard appeared — a Bluetooth keyboard, a date spinner or a desktop browser all focus without
   one, and hiding the bar there would be a bug of its own. `visualViewport.height` collapsing well
   below the layout height is the keyboard ITSELF, whatever raised it.
   ⚠️ THE 0.78 RATIO, NOT A PIXEL COUNT. iOS keyboards run roughly 260-400px depending on device,
   predictive bar and language, so any fixed threshold is wrong on some phone; a share of the
   viewport holds across all of them. iOS chrome collapsing on scroll is only ~60-90px, about 0.10,
   so it stays well clear and the bar does not flicker while reading.
   ⛔ TCFORM.JS IS THE ONE FILE ON EVERY PAGE, INCLUDING THE LANDING PAGE — site.js is not (the
   landing page carries its JS inline), so this must live here or the fix misses `/`. */
(function(){
  var vv = window.visualViewport;
  if (!vv) return;                       /* desktop Safari <13 and old Android: no keyboard anyway */
  var root = document.documentElement, on = false;
  function check(){
    /* the layout viewport is the honest comparison — innerHeight does not move for the keyboard */
    var open = (vv.height / (root.clientHeight || vv.height)) < 0.78;
    if (open === on) return;
    on = open;
    root.classList.toggle('kb-open', open);
  }
  vv.addEventListener('resize', check);
  /* ⚠️ A SCROLL CAN CHANGE THE RATIO TOO — iOS fires resize on the visual viewport when the
     keyboard opens, but scrolling the page while it is open re-offsets it without a resize. */
  vv.addEventListener('scroll', check);
  /* ⚠️ AND ON BLUR THE KEYBOARD LEAVES WITHOUT ALWAYS FIRING resize IN TIME — one late re-check
     costs nothing and stops the bar staying hidden after the user taps Done. */
  document.addEventListener('focusout', function(){ setTimeout(check, 260); });
  check();
})();
