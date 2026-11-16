/* florista-bridal.js — reveal-on-pin for the זרי כלה album (fba-).
   Adds .fba-js to the album root (the CSS hides text only under that class,
   so no-JS visitors see everything), then reveals each panel's text the
   first time it enters the viewport. Reduced-motion users get everything
   visible immediately. The scroll stacking itself is pure CSS. */
(function () {
  'use strict';

  var album = document.querySelector('.fba-album');
  if (!album) return;

  var panels = album.querySelectorAll('.fba-panel');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  if (!('IntersectionObserver' in window) || reduced.matches) {
    panels.forEach(function (p) {
      p.classList.add('is-in');
    });
    return;
  }

  album.classList.add('fba-js');

  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.35 }
  );

  panels.forEach(function (p) {
    io.observe(p);
  });
})();
