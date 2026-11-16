/* ==========================================================================
   Florista best sellers — load more.

   Not pagination. The section already rendered every card it is ever going to
   show (24 by default); the ones past the first page carry `hidden`. The button
   drops that attribute a page at a time. No network, no layout shift beyond the
   new rows.

   Focus moves to the first newly revealed card, per docs/design-log.md. Without
   it a keyboard user presses the button, focus stays on the button, and eight
   cards appear somewhere above with nothing announcing them. The count line is
   aria-live="polite" and visually hidden — it is there for that announcement.
   ========================================================================== */
(function () {
  function init(root) {
    if (root.dataset.bsReady === 'true') return;

    var button = root.querySelector('[data-bs-more]');
    if (!button || button.disabled) return;

    var status = root.querySelector('[data-bs-count]');
    var step = parseInt(root.dataset.bsStep, 10) || 8;
    var total = root.querySelectorAll('[data-bs-card]').length;

    button.addEventListener('click', function () {
      var hidden = root.querySelectorAll('[data-bs-card][hidden]');
      if (!hidden.length) return;

      var first = hidden[0];
      for (var i = 0; i < step && i < hidden.length; i++) {
        hidden[i].hidden = false;
      }

      var shown = total - root.querySelectorAll('[data-bs-card][hidden]').length;
      if (status) {
        status.textContent = 'מוצגים ' + shown + ' מתוך ' + total + ' מוצרים';
      }
      if (shown >= total) {
        button.hidden = true;
      }

      var link = first.querySelector('a');
      if (link) link.focus();
    });

    root.dataset.bsReady = 'true';
  }

  function initAll(scope) {
    (scope || document).querySelectorAll('[data-bs-root]').forEach(init);
  }

  initAll();

  // The theme editor re-renders a section in place; re-bind when it does.
  document.addEventListener('shopify:section:load', function (event) {
    initAll(event.target);
  });
})();
