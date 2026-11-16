/* Florista about page — docs/design-log.md, 2026-08-22.
   Scroll reveal as a progressive enhancement. The hidden states only exist
   once .fa-armed is set here, so no JS means a fully visible page. Each
   [data-reveal] is shown once, the first time a quarter of it is on screen. */
(function () {
  'use strict';

  var section = document.querySelector('.fa-section');
  if (!section) return;

  var targets = section.querySelectorAll('[data-reveal]');
  if (!targets.length) return;

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!('IntersectionObserver' in window) || reduced.matches) return;

  section.classList.add('fa-armed');

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-seen');
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.25, rootMargin: '0px 0px -5% 0px' }
  );

  targets.forEach(function (el) {
    var r = el.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) {
      // already on screen at load: show it, no pop-in
      el.classList.add('is-seen');
    } else {
      observer.observe(el);
    }
  });
})();
