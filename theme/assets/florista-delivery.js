/* Florista delivery scheduler — date + time slot, on the CART page.
   Moved from the product page 2026-08-22 (the owner: one order goes to one
   recipient at one time, so the date is picked once per order, not per
   product) — docs/design-log.md.
   Rules, decided with the owner (2026-08-22, extended 2026-09-01):
   - No deliveries on שבת, on חג or on יום העצמאות — the holiday calendar
     is window.FLORISTA_HOLIDAYS (generated: docs/tools/gen-holidays.py,
     independently verified by check-holidays.py), loaded by its own
     script tag before this file. The cart section's blocked-dates
     textarea remains as a manual override for one-off closures.
   - ערב חג behaves exactly like Friday. חול המועד and ימי זיכרון are
     normal days. A peak flower day (ולנטיין, יום האישה, ט״ו באב…) on
     Sun–Thu merges the two weekday windows into one all-day slot; a peak
     day that falls on Friday just follows the Friday rules.
   - Slots Sun–Thu: 09:00–14:00 · 16:00–19:00. Friday/ערב חג: 09:00–15:00.
     Peak: 09:00–19:00. The lists live in the Liquid markup; this file
     only decides which list shows for the chosen date.
   - Same-day: offered while today still has a slot that has not ENDED —
     on Fridays and ערבי חג as well since 2026-09-04 (the owner: "I NEED TO OFFER
     SAME DAY DELIVERY ON FRIDAY"; the 09:00–15:00 slot is the only limit).
     A slot is removed once it ends (14:01
     can no longer pick 09:00–14:00; at 18:00 the 16:00–19:00 slot is
     still fine) — the owner, 2026-09-01, in two steps: first the slot-expiry
     rule superseding the 2026-08-23 "make it stupid" no-time-check note,
     then dropping the old flat 17:00 gate in favour of slot-end as the
     only limit ("the slot till 19:00 even if its 18:00 … its fine").
     The end hours ride on data-end in the markup; CUTOFF_HOUR survives
     only as the fallback when data-end is missing. If the 2h-lead logic
     ever returns, it lived at git 2c862d8 (LEAD_MINUTES).
   Everything is stored as CART ATTRIBUTES — one set per order:
   `_delivery_date` (ISO, machine-readable, hidden from the customer) plus a
   human-readable `תאריך משלוח` and the chosen `שעת משלוח`. The inputs are
   form="cart" so a checkout submit carries them, AND every change is saved
   immediately via /cart/update.js so the choice survives reloads and rides
   along with dynamic checkout buttons (PayPal) that bypass the form. */

(function () {
  /* Both cart sections include this file so each survives the other being
     removed in the theme editor — run once no matter how many tags load. */
  if (window.__floristaDeliveryInit) return;
  window.__floristaDeliveryInit = true;

  /* Fallback only: same-day now closes when the day's LAST slot ends
     (see LAST_END below); 17 is used only if the markup carries no
     data-end hours. */
  var CUTOFF_HOUR = 17;
  var FRIDAY = 5;
  var SATURDAY = 6;

  var root = document.querySelector('.fd-scheduler');
  if (!root) return;

  var form = document.getElementById('cart') || root.closest('form');
  var dateInput = root.querySelector('.fd-date');
  var prettyInput = root.querySelector('.fd-date-pretty');
  var shownEl = root.querySelector('.fd-date-shown');
  var errorEl = root.querySelector('.fd-error');
  var hintEl = root.querySelector('.fd-hint');
  var groups = root.querySelectorAll('.fd-slots');
  var termsBox = document.querySelector('.fd-terms__box');
  var termsError = document.querySelector('.fd-terms__error');

  var blocked = {};
  (root.dataset.blocked || '').split(/[\s,]+/).forEach(function (d) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(d)) blocked[d] = true;
  });

  /* When does each slot group's LAST window close? Read from the markup's
     data-end hours so the JS never disagrees with the rendered slots.
     Same-day stays offerable until this hour (the owner, 2026-09-01). */
  var LAST_END = {};
  groups.forEach(function (g) {
    g.querySelectorAll('input[type="radio"]').forEach(function (r) {
      var e = parseInt(r.dataset.end, 10) || 0;
      if (e > (LAST_END[g.dataset.kind] || 0)) LAST_END[g.dataset.kind] = e;
    });
  });

  /* {iso: [behavior, hebrew name]} — generated calendar, may be absent if
     the asset failed to load; everything then degrades to the old rules. */
  var HOLIDAYS = window.FLORISTA_HOLIDAYS || {};

  /* What kind of day is this? type is one of:
     'closed' (שבת, חג, יום העצמאות, manual block), 'friday' (real Friday,
     ערב חג, or a peak day that falls on Friday), 'peak', 'week'. */
  function dayInfo(d) {
    if (d.getDay() === SATURDAY) return { type: 'closed', name: 'שבת' };
    var key = iso(d);
    var h = HOLIDAYS[key];
    if (blocked[key]) return { type: 'closed', name: h ? h[1] : '' };
    if (h) {
      if (h[0] === 'closed') return { type: 'closed', name: h[1] };
      if (h[0] === 'friday') return { type: 'friday', name: h[1] };
      if (h[0] === 'peak') {
        return d.getDay() === FRIDAY
          ? { type: 'friday', name: h[1] }
          : { type: 'peak', name: h[1] };
      }
    }
    if (d.getDay() === FRIDAY) return { type: 'friday', name: '' };
    return { type: 'week', name: '' };
  }

  /* The native input prints the date in the browser's locale, so .fd-date's own
     text is transparent and this span carries the DD/MM/YYYY the customer reads.
     Empty means "no date yet" -- show the Hebrew prompt in muted ink. */
  var DATE_PROMPT = 'בחרו תאריך';
  function showDate(text) {
    if (!shownEl) return;
    shownEl.textContent = text || DATE_PROMPT;
    shownEl.classList.toggle('fd-date-shown--empty', !text);
  }

  /* Repaint the overlay from whatever the input holds right now, and NOTHING
     else. Bound to `input`, which Chrome fires on every keystroke inside the
     field: without it the painted date went stale mid-edit and the customer
     could be shown a date the field no longer held. Deliberately does not
     validate -- the Saturday/blocked/past rules clear the value, and doing
     that between keystrokes would fight the person typing. `change` still
     runs the full onDateChange. */
  function paintFromInput() {
    var v = dateInput.value;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) { showDate(''); return; }
    var d = fromIso(v);
    showDate(
      String(d.getDate()).padStart(2, '0') + '/' +
      String(d.getMonth() + 1).padStart(2, '0') + '/' + d.getFullYear()
    );
  }

  function iso(d) {
    return d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0');
  }
  function fromIso(s) {
    var p = s.split('-');
    return new Date(+p[0], +p[1] - 1, +p[2]);
  }
  function validDay(d) {
    return dayInfo(d).type !== 'closed';
  }

  /* The earliest offerable day. Same-day lasts while today still has a
     slot that has not ended — on Friday-type days too (a real Friday or
     an ערב חג): The owner, 2026-09-04, "I NEED TO OFFER SAME DAY DELIVERY ON
     FRIDAY", so Friday same-day closes when its 09:00–15:00 slot ends,
     exactly like any other day. Then walk forward past שבת, חגים and
     blocked dates. */
  function earliestDate() {
    var now = new Date();
    var d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var t = dayInfo(d).type;
    if (t === 'closed' ||
        now.getHours() >= (LAST_END[t] || CUTOFF_HOUR)) {
      d.setDate(d.getDate() + 1);
    }
    while (!validDay(d)) d.setDate(d.getDate() + 1);
    return d;
  }

  function showError(msg) {
    errorEl.textContent = msg;
    errorEl.hidden = false;
  }
  function clearError() {
    errorEl.hidden = true;
    errorEl.textContent = '';
  }

  function checkedSlot() {
    return root.querySelector('.fd-slots:not([hidden]) input[type="radio"]:checked');
  }

  /* Save the current choice to the cart itself, so it survives reloads and
     reaches checkout no matter which button starts it. */
  function persist() {
    var slot = checkedSlot();
    var attrs = {};
    attrs['_delivery_date'] = dateInput.value || '';
    attrs['תאריך משלוח'] = prettyInput.value || '';
    attrs['שעת משלוח'] = slot ? slot.value : '';
    if (termsBox) {
      attrs['_terms_accepted_at'] = termsBox.checked ? new Date().toISOString() : '';
    }
    var greetBox = document.querySelector('.fd-greeting__box');
    var greetText = document.querySelector('.fd-greeting__text');
    if (greetBox && greetText) {
      attrs['ברכה'] = greetBox.checked ? greetText.value.trim() : '';
    }
    fetch('/cart/update.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ attributes: attrs })
    }).catch(function () { /* the form="cart" inputs are the fallback */ });
  }

  function hideAllGroups() {
    groups.forEach(function (g) {
      g.hidden = true;
      g.disabled = true;
      g.querySelectorAll('input[type="radio"]').forEach(function (r) {
        r.checked = false;
        r.disabled = false;
        r.closest('.fd-slot').classList.remove('fd-slot--off');
      });
    });
  }

  function onDateChange(keepSlot) {
    /* At init the groups are still hidden, so look in ALL groups — the
       Liquid-prefilled radio lives in a hidden fieldset until we show it. */
    var pre = root.querySelector('.fd-slots input[type="radio"]:checked');
    var savedSlot = keepSlot && pre ? pre.value : null;
    hideAllGroups();
    prettyInput.value = '';
    showDate('');
    clearError();
    if (!dateInput.value) { hintEl.hidden = false; persist(); return; }

    var d = fromIso(dateInput.value);
    var info = dayInfo(d);
    if (info.type === 'closed') {
      dateInput.value = '';
      hintEl.hidden = false;
      /* Name the day when we know it — "אין משלוחים ביום כיפור" beats a
         generic refusal. Manual one-off blocks have no name. */
      showError(info.name
        ? 'אין משלוחים ב' + info.name + ' — נא לבחור יום אחר'
        : 'אין משלוחים בתאריך זה — נא לבחור יום אחר');
      persist();
      return;
    }
    var min = earliestDate();
    if (d < min) {
      dateInput.value = '';
      hintEl.hidden = false;
      showError('התאריך שנבחר כבר אינו זמין — נא לבחור יום אחר');
      persist();
      return;
    }

    hintEl.hidden = true;

    var group = root.querySelector('.fd-slots[data-kind="' + info.type + '"]');
    group.hidden = false;
    group.disabled = false;

    /* Same-day order: a slot that has already ENDED is off the table
       (a running one stays pickable — the owner, 2026-09-01). */
    var now = new Date();
    if (iso(d) === iso(new Date(now.getFullYear(), now.getMonth(), now.getDate()))) {
      group.querySelectorAll('input[type="radio"]').forEach(function (r) {
        var end = parseInt(r.dataset.end, 10);
        if (end && now.getHours() >= end) {
          r.disabled = true;
          r.closest('.fd-slot').classList.add('fd-slot--off');
        }
      });
    }

    if (savedSlot) {
      var again = group.querySelector('input[value="' + savedSlot + '"]');
      if (again && !again.disabled) again.checked = true;
    }

    var dd = String(d.getDate()).padStart(2, '0');
    var mm = String(d.getMonth() + 1).padStart(2, '0');
    var dayName = new Intl.DateTimeFormat('he-IL', { weekday: 'long' }).format(d);
    prettyInput.value = dayName + ' ' + dd + '/' + mm + '/' + d.getFullYear();
    showDate(dd + '/' + mm + '/' + d.getFullYear());
  }

  dateInput.min = iso(earliestDate());
  var max = new Date();
  max.setDate(max.getDate() + 60);
  dateInput.max = iso(max);

  dateInput.addEventListener('input', paintFromInput);
  dateInput.addEventListener('change', function () {
    onDateChange(false);
    persist();
  });
  root.addEventListener('change', function (e) {
    if (e.target.matches('input[type="radio"]')) {
      clearError();
      persist();
    }
  });

  if (termsBox) {
    termsBox.addEventListener('change', function () {
      if (termsBox.checked) {
        termsError.hidden = true;
        termsError.textContent = '';
      }
      persist();
    });
  }

  /* Greeting card: opt-in reveal, 200-CHARACTER cap with a live counter,
     saved like everything else. The cap itself is the textarea's native
     maxlength (the owner, 2026-08-22: characters, not words) — the JS slice only
     covers an oversized value that arrived already saved. Unchecking hides
     the field and clears the saved greeting (the text is kept in the box in
     case it was a slip).
     Everything is DELEGATED to document and the elements are looked up
     per-event: the greeting lives in the cart-items section, and listeners
     bound to the elements themselves die silently whenever anything
     re-renders that markup — this way there is nothing to lose. */
  var greetTimer = null;

  function greetEls() {
    return {
      box: document.querySelector('.fd-greeting__box'),
      body: document.querySelector('.fd-greeting__body'),
      text: document.querySelector('.fd-greeting__text'),
      count: document.querySelector('.fd-greeting__count')
    };
  }

  function updateGreetCount() {
    var g = greetEls();
    if (!g.text || !g.count) return;
    var limit = +g.count.dataset.limit || 200;
    if (g.text.value.length > limit) {
      g.text.value = g.text.value.slice(0, limit);
    }
    var used = g.text.value.length;
    g.count.textContent = used === 0
      ? 'עד ' + limit + ' תווים'
      : used + ' מתוך ' + limit + ' תווים';
  }

  /* While unchecked the textarea is disabled so a checkout submit cannot
     carry a greeting the customer switched off. */
  function syncGreetState() {
    var g = greetEls();
    if (!g.box || !g.body || !g.text) return;
    g.body.hidden = !g.box.checked;
    g.text.disabled = !g.box.checked;
  }

  document.addEventListener('change', function (e) {
    if (e.target.matches('.fd-greeting__box')) {
      syncGreetState();
      if (e.target.checked) {
        var g = greetEls();
        if (g.text) g.text.focus();
      }
      persist();
    } else if (e.target.matches('.fd-greeting__text')) {
      persist();
    }
  });

  document.addEventListener('input', function (e) {
    if (e.target.matches('.fd-greeting__text')) {
      updateGreetCount();
      window.clearTimeout(greetTimer);
      greetTimer = window.setTimeout(persist, 800);
    }
  });

  syncGreetState();
  updateGreetCount();

  if (form) {
    /* JS owns validation so the messages are always Hebrew; the `required`
       attributes stay in the markup as the no-JS fallback. */
    form.noValidate = true;
    form.addEventListener('submit', function (e) {
      if (!dateInput.value) {
        e.preventDefault();
        showError('נא לבחור תאריך משלוח');
        dateInput.focus();
        return;
      }
      if (!checkedSlot()) {
        e.preventDefault();
        showError('נא לבחור שעת משלוח');
        return;
      }
      if (termsBox && !termsBox.checked) {
        e.preventDefault();
        termsError.textContent = 'כדי להמשיך לתשלום יש לאשר את תנאי השימוש';
        termsError.hidden = false;
        termsBox.focus();
      }
    });
  }

  /* A saved choice from a previous visit: the inputs are prefilled from
     cart.attributes in Liquid — re-validate it (the date may have passed)
     and keep what still holds.
     LAST, and fenced: this is the one block that runs real logic at load,
     and an exception here must not take the listeners above down with it. */
  try {
    if (dateInput.value) {
      onDateChange(true);
      persist();
    }
  } catch (err) {
    /* keep the page interactive; the submit validation still guards checkout */
  }
})();
