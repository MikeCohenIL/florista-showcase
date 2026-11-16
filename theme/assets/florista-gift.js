/* Florista gift block — the required "למי המשלוח?" answer plus the
   RECIPIENT's first name, last name and phone when it is a gift. Flipped
   from the buyer's details on 2026-08-23 (the owner, docs/design-log.md): the
   cart captures who receives the flowers, and the note under the fields
   says the recipient's address is entered on the next page, at checkout.
   Everything is CART ATTRIBUTES with Hebrew names (`סוג הזמנה`,
   `שם המקבל`, `שם משפחה המקבל`, `טלפון המקבל`) so it lands readable on
   the order. The pill pair has NO preselected answer — an explicit tap is
   the only thing that counts as knowing it's a gift.

   Completely independent of florista-delivery.js: own init guard, own
   listeners (delegated to document, same reasoning as the greeting), no
   shared selectors. Its /cart/update.js posts carry only its own keys —
   Shopify merges attributes per key, so the scheduler's saves and these
   never overwrite each other. */

(function () {
  if (window.__floristaGiftInit) return;
  window.__floristaGiftInit = true;

  function root() {
    return document.querySelector('.fd-gift');
  }
  function chosen() {
    var r = document.querySelector('.fd-gift input[type="radio"]:checked');
    return r ? r.value : '';
  }
  function firstInput() {
    return document.querySelector('.fd-gift__input--first');
  }
  function lastInput() {
    return document.querySelector('.fd-gift__input--last');
  }
  function phoneInput() {
    return document.querySelector('.fd-gift__input[type="tel"]');
  }
  function errorEl() {
    return document.querySelector('.fd-gift__error');
  }

  function showError(msg) {
    var el = errorEl();
    if (!el) return;
    el.textContent = msg;
    el.hidden = false;
  }
  function clearError() {
    var el = errorEl();
    if (!el) return;
    el.hidden = true;
    el.textContent = '';
  }

  /* While לעצמי (or nothing) is chosen the recipient fields are hidden AND
     disabled, so a checkout submit cannot carry stale gift details. The
     typed values stay in the inputs in case the switch was a slip. */
  function sync() {
    var el = root();
    if (!el) return;
    var isGift = chosen() === 'מתנה';
    var details = el.querySelector('.fd-gift__details');
    if (details) details.hidden = !isGift;
    el.querySelectorAll('.fd-gift__input').forEach(function (i) {
      i.disabled = !isGift;
    });
  }

  /* Recipient phone: DIGITS ONLY, exactly 10 of them, starting with 0 —
     an Israeli mobile (05X-XXXXXXX) the way a customer types it. The owner,
     2026-09-04: "must accept NUMBERS only and must check that the field
     is really a phone number (10 digits)". Anything that is not a digit
     is dropped as it is typed (scrub), so pasting "054-123 4567" leaves
     0541234567; a pasted +972 prefix is folded back to the leading 0.
     9-digit landlines are rejected on purpose — the courier calls the
     recipient on the way, and the owner asked for 10 digits. */
  function phoneDigits(v) {
    var d = (v || '').replace(/\D/g, '');
    if (d.indexOf('972') === 0) d = '0' + d.slice(3);
    return d.slice(0, 10);
  }
  function phoneOk(v) {
    return /^0\d{9}$/.test(phoneDigits(v));
  }
  function scrubPhone(el) {
    var clean = phoneDigits(el.value);
    if (el.value !== clean) el.value = clean;
  }

  /* One Hebrew message per field — used at submit AND on blur, so the
     customer hears about an empty or malformed field as they leave it,
     not only when the checkout button refuses. */
  function fieldError(el) {
    if (!el) return '';
    if (el.classList.contains('fd-gift__input--first')) {
      return el.value.trim() ? '' : 'נא למלא את השם הפרטי של המקבל/ת';
    }
    if (el.classList.contains('fd-gift__input--last')) {
      return el.value.trim() ? '' : 'נא למלא את שם המשפחה של המקבל/ת';
    }
    if (el.type === 'tel') {
      if (!el.value.trim()) return 'נא למלא את מספר הטלפון של המקבל/ת';
      return phoneOk(el.value) ? '' : 'מספר הטלפון חייב להכיל 10 ספרות, למשל 0541234567';
    }
    return '';
  }
  function markInvalid(el, bad) {
    if (!el) return;
    el.classList.toggle('fd-gift__input--invalid', !!bad);
    el.setAttribute('aria-invalid', bad ? 'true' : 'false');
  }

  /* Posts are chained so rapid pill-flicking can't land out of order at
     Shopify and leave a stale answer saved — the attrs snapshot is taken at
     call time, the requests run one after another, last write wins. */
  var pending = Promise.resolve();

  function persist() {
    if (!root()) return;
    var isGift = chosen() === 'מתנה';
    var first = firstInput();
    var last = lastInput();
    var phone = phoneInput();
    var attrs = {};
    attrs['סוג הזמנה'] = chosen();
    attrs['שם המקבל'] = isGift && first ? first.value.trim() : '';
    attrs['שם משפחה המקבל'] = isGift && last ? last.value.trim() : '';
    attrs['טלפון המקבל'] = isGift && phone ? phone.value.trim() : '';
    /* Wipe the pre-flip buyer keys (שם המזמין/טלפון המזמין) still saved on
       carts from before 2026-08-23, so they can't surface on an order.
       Removable once those test carts have expired. */
    attrs['שם המזמין'] = '';
    attrs['טלפון המזמין'] = '';
    pending = pending.then(function () {
      return fetch('/cart/update.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attributes: attrs })
      });
    }).catch(function () { /* the form="cart" inputs are the fallback */ });
  }

  var timer = null;

  document.addEventListener('change', function (e) {
    if (e.target.matches('.fd-gift input[type="radio"]')) {
      sync();
      clearError();
      if (e.target.value === 'מתנה') {
        var first = firstInput();
        if (first && !first.value) first.focus();
      }
      persist();
    } else if (e.target.matches('.fd-gift__input')) {
      clearError();
      persist();
    }
  });

  document.addEventListener('input', function (e) {
    if (e.target.matches('.fd-gift__input')) {
      if (e.target.type === 'tel') scrubPhone(e.target);
      if (!fieldError(e.target)) markInvalid(e.target, false);
      window.clearTimeout(timer);
      timer = window.setTimeout(persist, 800);
    }
  });

  /* Keyboards that ignore inputmode (desktop) still get digits only. */
  document.addEventListener('keypress', function (e) {
    if (!e.target.matches('.fd-gift__input[type="tel"]')) return;
    if (e.ctrlKey || e.metaKey || e.key.length !== 1) return;
    if (!/\d/.test(e.key)) e.preventDefault();
  });

  /* Leaving a gift field empty or malformed flags it right away. */
  document.addEventListener('focusout', function (e) {
    if (!e.target.matches('.fd-gift__input') || chosen() !== 'מתנה') return;
    var msg = fieldError(e.target);
    markInvalid(e.target, msg);
    if (msg) showError(msg); else clearError();
  });

  var form = document.getElementById('cart');
  if (form) {
    /* florista-delivery.js already set form.noValidate and validates the
       date, slot and terms; this handler runs after it (script order) and
       adds the gift checks. If an earlier handler already blocked and
       focused, keep the error visible but don't steal focus. */
    form.addEventListener('submit', function (e) {
      if (!root()) return;
      var canFocus = !e.defaultPrevented;
      var c = chosen();
      if (!c) {
        e.preventDefault();
        showError('נא לבחור: מתנה או לעצמכם');
        if (canFocus) {
          var first = document.querySelector('.fd-gift input[type="radio"]');
          if (first) first.focus();
        }
        return;
      }
      if (c === 'מתנה') {
        /* Every recipient field is mandatory (the owner, 2026-09-04). Mark all
           the bad ones at once, report the first, focus it. */
        var fields = [firstInput(), lastInput(), phoneInput()];
        var firstBad = null;
        var firstMsg = '';
        fields.forEach(function (f) {
          var msg = fieldError(f);
          markInvalid(f, msg);
          if (msg && !firstBad) { firstBad = f; firstMsg = msg; }
        });
        if (firstBad) {
          e.preventDefault();
          showError(firstMsg);
          if (canFocus) firstBad.focus();
          return;
        }
      }
      clearError();
    });
  }

  sync();
})();
