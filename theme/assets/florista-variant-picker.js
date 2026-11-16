/* Florista variant picker — the owner, 2026-09-07. Renders for any product with
   real options (see snippets/florista-variant-picker.liquid for why it did not
   exist before). Picking a value swaps the hidden `id` the form posts, the
   price on screen, and the running total on the add button.

   Deliberately tolerant of two price markups, because snippets/florista-price
   (the struck compare-at price) is on an open PR and may or may not be present
   on the theme this ships with:
     · plain  <p class="fp-price"><bdi>189.99 ₪</bdi></p>
     · sale   <p class="fp-price f-price--sale">…<bdi class="f-price-now">…
              <s class="f-price-was"><bdi>…</bdi></s></p>
   It updates the "now" price in both, and only touches the struck price when
   that element already exists. It never invents markup it has no CSS for.

   Idempotent per element (data-ready) so a theme-editor section re-render
   cannot double-bind. */

(function () {
  function each(list, fn) {
    Array.prototype.forEach.call(list, fn);
  }

  function init(scope) {
    each((scope || document).querySelectorAll('[data-variant-picker]'), function (wrap) {
      if (wrap.dataset.ready) return;
      wrap.dataset.ready = '1';

      var variants;
      try {
        variants = JSON.parse(wrap.dataset.variants);
      } catch (e) {
        return; /* leave the plain form behaviour intact */
      }
      if (!variants || !variants.length) return;

      var form = wrap.closest('form');
      if (!form) return;
      var idInput = form.querySelector('input[name="id"]');
      var btn = form.querySelector('[name="add"]');
      var section = wrap.closest('.fp-section');
      var priceWrap = section && section.querySelector('.fp-price');
      var soldOutMsg = wrap.querySelector('[data-variant-soldout]');
      var groups = wrap.querySelectorAll('.fp-variant-group');

      function selected() {
        var values = [];
        each(groups, function (group) {
          var checked = group.querySelector('.fp-variant-radio:checked');
          values.push(checked ? checked.value : null);
        });
        return values;
      }

      function matches(variant, values) {
        for (var i = 0; i < values.length; i++) {
          if (values[i] !== null && variant.options[i] !== values[i]) return false;
        }
        return true;
      }

      /* The variant whose options equal the current choice in every position. */
      function find(values) {
        for (var i = 0; i < variants.length; i++) {
          var variant = variants[i];
          if (variant.options.length !== values.length) continue;
          var exact = true;
          for (var j = 0; j < values.length; j++) {
            if (variant.options[j] !== values[j]) { exact = false; break; }
          }
          if (exact) return variant;
        }
        return null;
      }

      /* Mark values that cannot be bought, cascading left to right: a group is
         judged against the choices made in the groups BEFORE it only, never
         the ones after.

         Judging against the whole current selection is the obvious version and
         it is wrong. Once the customer lands on a combination that is out of
         stock, every probe in every group inherits that dead value and the
         page strikes through the lot — telling them גדול is gone when גדול is
         on the shelf at 249.99, just not with a vase.

         Marks rather than disables: a disabled radio cannot be focused, and a
         shopper is entitled to press "גדול" and be told it is gone rather than
         find the control inert with no explanation. */
      function markAvailability(values) {
        each(groups, function (group, gi) {
          each(group.querySelectorAll('.fp-variant-radio'), function (radio) {
            var probe = [];
            for (var k = 0; k < values.length; k++) {
              probe[k] = k < gi ? values[k] : null; /* null = any */
            }
            probe[gi] = radio.value;
            var ok = false;
            for (var i = 0; i < variants.length; i++) {
              if (variants[i].available && matches(variants[i], probe)) { ok = true; break; }
            }
            var label = group.querySelector('label[for="' + radio.id + '"]');
            if (label) label.classList.toggle('fp-variant-pill--gone', !ok);
          });
        });
      }

      function showPrice(variant) {
        if (!priceWrap) return;
        var now = priceWrap.querySelector('.f-price-now') || priceWrap.querySelector('bdi');
        if (now) now.textContent = variant.priceText;

        var was = priceWrap.querySelector('.f-price-was');
        if (!was) return;

        /* The "מחיר מבצע" label goes with it. Hiding only the struck number
           leaves a screen reader saying "מחיר מבצע 249.99 ₪, במקום" on a
           variant that is not on sale — ", במקום " lives inside the <s>, so it
           travels along, and the opening word is hidden here. */
        var saleWord = priceWrap.querySelector('.f-price-saleword');
        var onSale = !!variant.compareAtText;

        if (onSale) {
          var wasBdi = was.querySelector('bdi') || was;
          wasBdi.textContent = variant.compareAtText;
        }
        was.hidden = !onSale;
        if (saleWord) saleWord.hidden = !onSale;
        priceWrap.classList.toggle('f-price--sale', onSale);
      }

      /* The main photo follows the variant when the variant has one of its own
         (2026-09-23, the orchid's colour option). Only the <img> is touched —
         src, srcset and alt — so the sizes attribute and the frame CSS stay
         exactly as the section rendered them. A variant without a photo
         leaves the current picture in place rather than blanking it. */
      var mainImg = section && section.querySelector('.fp-media img');
      function showImage(variant) {
        if (!mainImg || !variant.image || !variant.image.src) return;
        if (mainImg.getAttribute('src') === variant.image.src) return;
        mainImg.setAttribute('srcset', variant.image.srcset || '');
        mainImg.setAttribute('src', variant.image.src);
        mainImg.setAttribute('alt', variant.image.alt || '');
      }

      function apply() {
        var values = selected();
        markAvailability(values);

        var variant = find(values);
        var sellable = !!(variant && variant.available);

        if (variant) {
          if (idInput) idInput.value = variant.id;
          showPrice(variant);
          showImage(variant);
          if (btn) btn.dataset.basePrice = variant.price;
        }

        if (soldOutMsg) soldOutMsg.hidden = sellable;

        /* Only `disabled` here. florista-atc.js owns the button's TEXT, and
           two scripts writing one label is how a stale price ships — the same
           reason the age picker suppresses the running total. The reason the
           button is off is spelled out in fp-variant-sold-out instead. */
        if (btn && !btn.classList.contains('fx-busy') && !btn.classList.contains('fx-added')) {
          btn.disabled = !sellable;
        }

        /* florista-atc.js owns the button's running total. Tell it the base
           price moved so the bouquet + add-ons figure follows the choice.

           Fired even when the combination is unbuyable, and on purpose: the
           price above has already changed to that variant, so gating this
           leaves the button quoting the previously selected variant while the
           price beside it says something else. The button is disabled either
           way; the two numbers on screen must still agree. */
        document.dispatchEvent(new CustomEvent('florista:variant-change', {
          bubbles: true,
          detail: { form: form }
        }));
      }

      wrap.addEventListener('change', function (e) {
        if (e.target && e.target.classList && e.target.classList.contains('fp-variant-radio')) apply();
      });

      apply();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { init(document); });
  } else {
    init(document);
  }
  document.addEventListener('shopify:section:load', function (e) { init(e.target); });
})();
