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

  /* ⭐⭐⭐ SET THIS AND EVERY FORM ON THE SITE POSTS FOR REAL. Nothing else has to change.
     It is posted a `FormData`, so file attachments on the enquiry card ride along unchanged. */
  var ENDPOINT = '';

  var PHONE_TXT = '0800 098 2812';

  /* a mail address, deliberately loose: the job is to catch "x", "me@" and "me@me",
     not to adjudicate RFC 5322 — a real address that this rejects would be a lost customer */
  var RX_MAIL = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;

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

    var was = btn ? btn.textContent : '';
    if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
    say(f, 'Sending…', '');
    fetch(ENDPOINT, { method: 'POST', body: payload(f), headers: { Accept: 'application/json' } })
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
    Array.prototype.forEach.call(document.querySelectorAll('form.cta-form, form.qform, form[data-tcform]'), wire);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
