/* Florista ajax add-to-cart — the owner, 2026-08-23: adding must NOT leave the
   page. Any form with class fx-atc (the product form, the cross-sell
   quick-adds) posts to /cart/add.js instead of navigating; the button
   itself confirms (נוסף לסל ✓) and the header bag count updates.
   No-JS falls back to the plain form post, which lands on /cart — the
   previous behaviour, not a broken one. Delegated to document so a
   re-rendered section can never detach the listener (same reasoning as
   the cart greeting).

   Extended 2026-08-28 (the owner chose "checkbox rows") with the buy-box add-ons,
   snippets/florista-addons.liquid. Two jobs on top of the above:

     · the add-on block ships `hidden` and is unhidden here, so a visitor
       without JS never sees a checkbox that could not work;
     · with one or more add-ons ticked the request switches from FormData to
       a JSON items[] array, adding the bouquet and each add-on as separate
       cart lines in one round trip. With none ticked the FormData path is
       byte-for-byte what it was before, so nothing else on the site changes.

   The cart-page chips that once shared this path (data-cart-refresh, which
   reloaded after a successful add) were removed on 2026-08-29 at the owner's
   request; the attribute and its reload branch went with them, so every
   fx-atc form again keeps the page exactly where it is.

   The button also carries a running total. That is deliberately suppressed on
   digit-balloon products: florista-age-picker.js rewrites the variant and the
   displayed price as the age is typed, and two scripts owning one number is
   how a stale total gets shipped. Those products still add add-ons fine. */

(function () {
  if (window.__floristaAtcInit) return;
  window.__floristaAtcInit = true;

  function each(list, fn) {
    Array.prototype.forEach.call(list, fn);
  }

  /* Shopify's money_format, applied client-side so the running total is
     formatted exactly the way Liquid's `| money` formatted the base price. */
  function formatMoney(cents, format) {
    var placeholder = /\{\{\s*(\w+)\s*\}\}/;
    var match = format.match(placeholder);
    var key = match ? match[1] : 'amount';

    function group(precision, thousands, decimal) {
      var fixed = (cents / 100).toFixed(precision);
      var parts = fixed.split('.');
      var whole = parts[0].replace(/(\d)(?=(\d\d\d)+$)/g, '$1' + thousands);
      return parts[1] ? whole + decimal + parts[1] : whole;
    }

    var value;
    switch (key) {
      case 'amount_no_decimals': value = group(0, ',', '.'); break;
      case 'amount_with_comma_separator': value = group(2, '.', ','); break;
      case 'amount_no_decimals_with_comma_separator': value = group(0, '.', ','); break;
      case 'amount_with_apostrophe_separator': value = group(2, "'", '.'); break;
      case 'amount_with_space_separator': value = group(2, ' ', ','); break;
      case 'amount_no_decimals_with_space_separator': value = group(0, ' ', '.'); break;
      default: value = group(2, ',', '.');
    }
    return format.replace(placeholder, value);
  }

  function checkedAddons(form) {
    return form ? form.querySelectorAll('.fp-addon-check:checked') : [];
  }

  /* What the button should read right now: the plain label, or the label
     followed by the bouquet + ticked add-ons. */
  function buyLabel(btn) {
    var base = btn.dataset.baseLabel;
    if (!base) return btn.dataset.idleLabel || btn.textContent.trim();

    var form = btn.closest('form');
    var total = Number(btn.dataset.basePrice || 0);
    each(checkedAddons(form), function (box) {
      total += Number(box.dataset.addonPrice || 0);
    });
    return base + ' · ' + formatMoney(total, btn.dataset.moneyFormat || '{{amount}} ₪');
  }

  function relabel(btn) {
    if (!btn || btn.classList.contains('fx-busy') || btn.classList.contains('fx-added')) return;
    btn.textContent = buyLabel(btn);
  }

  function initAddons(scope) {
    each((scope || document).querySelectorAll('[data-addons]'), function (block) {
      if (block.dataset.ready) return;
      block.dataset.ready = '1';
      block.hidden = false;

      var form = block.closest('form');
      var btn = form && form.querySelector('[name="add"]');
      if (!btn) return;

      /* the age picker owns the price on digit balloons — see the header */
      if (btn.dataset.basePrice && !form.querySelector('[data-age-picker]')) {
        btn.dataset.baseLabel = btn.textContent.trim();
        btn.dataset.idleLabel = btn.dataset.baseLabel;
        relabel(btn);
      }
    });
  }

  document.addEventListener('change', function (e) {
    var box = e.target;
    if (!box || !box.classList || !box.classList.contains('fp-addon-check')) return;
    var form = box.closest('form');
    relabel(form && form.querySelector('[name="add"]'));
  });

  /* The variant picker owns the base price on multi-option products: it
     rewrites data-base-price as the choice changes and fires this, so the
     bouquet + add-ons total on the button follows. Same reason the age picker
     is excluded above — one script per number — except here the picker keeps
     data-base-price honest instead of taking the label over. */
  document.addEventListener('florista:variant-change', function (e) {
    var form = e.detail && e.detail.form;
    relabel(form && form.querySelector('[name="add"]'));
  });

  function errorEl(form) {
    var el = form.querySelector('.fx-atc-error');
    if (!el) {
      el = document.createElement('p');
      el.className = 'fx-atc-error';
      el.setAttribute('role', 'alert');
      form.appendChild(el);
    }
    return el;
  }

  /* One ticked add-on and the request has to carry two products, which
     /cart/add.js only accepts as JSON. With none ticked we keep sending the
     FormData exactly as before — the age picker's properties[גיל], the
     cross-sell quick-adds and every other fx-atc form are untouched. */
  function requestBody(form) {
    var addons = checkedAddons(form);
    if (!addons.length) {
      return { headers: { Accept: 'application/json' }, body: new FormData(form) };
    }

    var data = new FormData(form);
    var main = { id: Number(data.get('id')), quantity: Number(data.get('quantity') || 1) };
    var properties = {};
    var hasProperties = false;
    data.forEach(function (value, key) {
      var match = /^properties\[(.+)\]$/.exec(key);
      if (match && String(value).length) {
        properties[match[1]] = value;
        hasProperties = true;
      }
    });
    if (hasProperties) main.properties = properties;

    var items = [main];
    each(addons, function (box) {
      items.push({ id: Number(box.dataset.addonId), quantity: 1 });
    });

    return {
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ items: items })
    };
  }

  document.addEventListener('submit', function (e) {
    var form = e.target && e.target.closest ? e.target.closest('form.fx-atc') : null;
    if (!form) return;
    e.preventDefault();

    var btn = form.querySelector('[name="add"]');
    if (!btn || btn.disabled) return;
    var idle = btn.dataset.idleLabel || btn.textContent.trim();
    btn.dataset.idleLabel = idle;

    btn.disabled = true;
    btn.classList.add('fx-busy');
    var err = errorEl(form);
    err.hidden = true;

    var request = requestBody(form);

    fetch('/cart/add.js', {
      method: 'POST',
      headers: request.headers,
      body: request.body
    })
      .then(function (res) {
        if (!res.ok) {
          return res.json().then(function (d) { throw d; });
        }
        return fetch('/cart.js').then(function (r) { return r.json(); });
      })
      .then(function (cart) {
        updateBag(cart.item_count);
        btn.classList.remove('fx-busy');
        btn.classList.add('fx-added');
        btn.textContent = 'נוסף לסל ✓';
        /* clear the ticks so a second click cannot silently re-add the wine */
        each(checkedAddons(form), function (box) { box.checked = false; });

        window.setTimeout(function () {
          btn.classList.remove('fx-added');
          btn.disabled = false;
          btn.textContent = buyLabel(btn);
        }, 1800);
      })
      .catch(function (d) {
        btn.classList.remove('fx-busy');
        btn.disabled = false;
        btn.textContent = buyLabel(btn);
        /* Shopify's error description is only shown if it arrived in Hebrew —
           the store's locale strings are Hebrew, but never surface English. */
        var msg = d && d.description && /[֐-׿]/.test(d.description)
          ? d.description
          : 'לא הצלחנו להוסיף לסל — נסו שוב';
        err.textContent = msg;
        err.hidden = false;
      });
  });

  function updateBag(count) {
    var bag = document.querySelector('.fh-bag');
    if (!bag) return;
    bag.setAttribute('aria-label', 'סל הקניות, ' + count + ' פריטים');
    var badge = bag.querySelector('.fh-bag-count');
    if (!badge && count > 0) {
      badge = document.createElement('span');
      badge.className = 'fh-bag-count';
      badge.setAttribute('aria-hidden', 'true');
      bag.appendChild(badge);
    }
    if (badge) badge.textContent = count;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { initAddons(document); });
  } else {
    initAddons(document);
  }
  /* theme editor re-renders a section without reloading the page */
  document.addEventListener('shopify:section:load', function (e) { initAddons(e.target); });
})();
