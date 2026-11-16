/* Florista age picker — the owner, 2026-08-25. Digit-balloon products carry one
   variant per digit count ("ספרה אחת" / "שתי ספרות" / "שלוש ספרות"), priced
   per digit. The customer types the age being celebrated; the number of
   digits picks the variant, the shown price follows, and the age itself is
   submitted as properties[גיל]. The add button stays disabled until a valid
   age is typed. Idempotent per element (data-ready) so a section re-render
   in the theme editor can't double-bind. */

(function () {
  function init(scope) {
    var wraps = (scope || document).querySelectorAll('[data-age-picker]');
    Array.prototype.forEach.call(wraps, function (wrap) {
      if (wrap.dataset.ready) return;
      wrap.dataset.ready = '1';

      var variants;
      try {
        variants = JSON.parse(wrap.dataset.variants);
      } catch (e) {
        return; /* leave the plain form behaviour intact */
      }
      if (!variants || !variants.length) return;

      var input = wrap.querySelector('.fp-age-input');
      var form = wrap.closest('form');
      if (!input || !form) return;
      var idInput = form.querySelector('input[name="id"]');
      var btn = form.querySelector('[name="add"]');
      var section = wrap.closest('.fp-section');
      var priceEl = section && section.querySelector('.fp-price bdi');

      function apply() {
        var digits = input.value.replace(/\D/g, '');
        if (digits !== input.value) input.value = digits;
        var age = digits.replace(/^0+/, '');
        if (!age) {
          if (btn) btn.disabled = true;
          return;
        }
        var v = variants[Math.min(age.length, variants.length) - 1];
        if (idInput) idInput.value = v.id;
        if (priceEl) priceEl.textContent = v.price;
        if (btn && !btn.classList.contains('fx-busy')) btn.disabled = false;
      }

      input.addEventListener('input', apply);
      input.addEventListener('blur', function () {
        /* normalise "067" → "67" so the property reads like an age */
        input.value = input.value.replace(/^0+(?=\d)/, '');
        apply();
      });
      apply(); /* initial state: no age yet → button disabled */
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { init(document); });
  } else {
    init(document);
  }
  document.addEventListener('shopify:section:load', function (e) { init(e.target); });
})();
