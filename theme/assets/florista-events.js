/* Florista events page — docs/design-log.md, 2026-08-23.
   Scroll reveal as a progressive enhancement, same contract as
   florista-about.js: the hidden states only exist once .fev-armed is set
   here, so no JS means a fully visible page. */

/* Reduced motion: the hero video autoplays via its attribute (so it still
   works with no JS for everyone else); for prefers-reduced-motion users
   this pauses it on its first frame. */
/* All five events sections load this file so each stays self-contained in the
   editor. The browser fetches it once but executes every <script> tag, so
   without this guard the observers and the date-field listeners bound five
   times (reportValidity fired five times per blur). */
if (!window.__floristaEventsInit) {
window.__floristaEventsInit = true;

(function () {
  'use strict';

  var video = document.querySelector('.fev-hero-video');
  if (!video) return;

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var apply = function () {
    if (reduced.matches) {
      video.pause();
      video.currentTime = 0;
      video.removeAttribute('autoplay');
    }
  };
  apply();
  if (reduced.addEventListener) reduced.addEventListener('change', apply);
})();
(function () {
  'use strict';

  var sections = document.querySelectorAll('.fev-page');
  if (!sections.length) return;

  var targets = document.querySelectorAll('.fev-page [data-reveal]');
  if (!targets.length) return;

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!('IntersectionObserver' in window) || reduced.matches) return;

  sections.forEach(function (el) {
    el.classList.add('fev-armed');
  });

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-seen');
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -5% 0px' }
  );

  targets.forEach(function (el) {
    var r = el.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) {
      el.classList.add('is-seen');
    } else {
      observer.observe(el);
    }
  });
})();

/* Event-date mask — the owner, 2026-08-24: the field must read DD/MM/YYYY. A
   native date input renders in the browser's locale and cannot be forced,
   so the input is text and this inserts the slashes while typing and keeps
   the validity message in Hebrew. Plausibility only (day 1-31, month 1-12);
   the date goes into an email, nothing computes on it. */
(function () {
  'use strict';

  var field = document.querySelector('.fev-date');
  if (!field) return;

  field.addEventListener('input', function () {
    var digits = field.value.replace(/\D/g, '').slice(0, 8);
    var out = digits;
    if (digits.length > 4) {
      out = digits.slice(0, 2) + '/' + digits.slice(2, 4) + '/' + digits.slice(4);
    } else if (digits.length > 2) {
      out = digits.slice(0, 2) + '/' + digits.slice(2);
    }
    field.value = out;
    field.setCustomValidity('');
  });

  field.addEventListener('invalid', function () {
    field.setCustomValidity('נא להזין תאריך מלא, למשל 31/12/2026');
  });

  field.addEventListener('blur', function () {
    var m = field.value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!m) return;
    var day = +m[1];
    var month = +m[2];
    if (day < 1 || day > 31 || month < 1 || month > 12) {
      field.setCustomValidity('נא לבדוק את התאריך — יום/חודש/שנה');
      field.reportValidity();
    }
  });
})();
}
