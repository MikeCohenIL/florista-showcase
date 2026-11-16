/* Cross-sell slider arrows (desktop) — the track scrolls and snaps
   natively; the arrows only nudge it one card. In RTL a negative
   scrollBy x moves the view leftward, which is FORWARD; the dir check
   keeps this correct if the pinned direction ever changes. Arrows stay
   hidden unless the track actually overflows. */

(function () {
  if (window.__floristaXsellInit) return;
  window.__floristaXsellInit = true;

  document.querySelectorAll('.fxs-slider').forEach(function (slider) {
    var track = slider.querySelector('.fxs-track');
    var prev = slider.querySelector('.fxs-arrow--prev');
    var next = slider.querySelector('.fxs-arrow--next');
    if (!track || !prev || !next) return;

    var rtl = (document.documentElement.dir || '').toLowerCase() === 'rtl';

    function step() {
      var card = track.querySelector('.fxs-card');
      return card ? card.getBoundingClientRect().width + 16 : 240;
    }

    function sync() {
      var overflow = track.scrollWidth > track.clientWidth + 1;
      prev.hidden = !overflow;
      next.hidden = !overflow;
    }

    prev.addEventListener('click', function () {
      track.scrollBy({ left: (rtl ? 1 : -1) * step(), behavior: 'smooth' });
    });
    next.addEventListener('click', function () {
      track.scrollBy({ left: (rtl ? -1 : 1) * step(), behavior: 'smooth' });
    });

    window.addEventListener('resize', sync);
    sync();
  });
})();
