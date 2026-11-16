/* Florista collection page — docs/design-log.md, 2026-08-22.
   One job, a progressive enhancement: submit the sort form the moment the
   select changes. Without JS the noscript button submits the same form. */
(function () {
  'use strict';

  var section = document.querySelector('.fc-section');
  if (!section) return;

  var sort = section.querySelector('[data-sort]');
  if (sort) {
    sort.addEventListener('change', function () {
      sort.form.submit();
    });
  }
})();
