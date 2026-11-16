/*
  Florista header behaviour — the mobile sheet and the scroll glass.

  Vanilla, no framework, no dependency on the base theme's global.js. Written to fail
  quietly: if any element is missing the rest still works, because a header
  that throws takes the whole page's JS down with it.
*/
(function () {
  'use strict';

  var header = document.querySelector('[data-florista-header]');
  var drawer = document.querySelector('[data-fh-drawer]');
  var overlay = document.querySelector('[data-fh-overlay]');
  var openBtn = document.querySelector('[data-fh-open]');
  var closeBtn = document.querySelector('[data-fh-close]');

  /* ----------------------------------------------------------------------
     Scroll glass — opaque at rest, frosted past 8px.
     ---------------------------------------------------------------------- */
  if (header) {
    var SCROLL_THRESHOLD = 8;
    var ticking = false;

    var syncScrollState = function () {
      header.classList.toggle(
        'is-scrolled',
        window.scrollY > SCROLL_THRESHOLD
      );
      ticking = false;
    };

    // rAF-throttled: scroll fires far more often than the class needs updating.
    window.addEventListener(
      'scroll',
      function () {
        if (!ticking) {
          ticking = true;
          window.requestAnimationFrame(syncScrollState);
        }
      },
      { passive: true }
    );

    // Run once on load — a reload partway down the page should not start opaque.
    syncScrollState();
  }

  /* ----------------------------------------------------------------------
     Bar dropdown — «מוצרים נלווים» (2026-08-29). JS-driven rather than pure
     :hover so aria-expanded always tells the truth: a CSS-only panel is
     invisible to keyboards and screen readers.
     ---------------------------------------------------------------------- */
  var canHover = window.matchMedia('(hover: hover)').matches;

  Array.prototype.forEach.call(
    document.querySelectorAll('[data-fh-dropdown]'),
    function (item) {
      var toggle = item.querySelector('.fh-nav-toggle');
      if (!toggle) return;

      var setOpen = function (open) {
        item.classList.toggle('is-open', open);
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      };

      // Pointer: hovering the item opens, leaving closes. Bound only on
      // devices that can actually hover — on touch, mouseenter fires right
      // before click and the pair would open-then-close in a single tap.
      if (canHover) {
        item.addEventListener('mouseenter', function () {
          setOpen(true);
        });
        item.addEventListener('mouseleave', function () {
          setOpen(false);
        });
      }

      // Click serves touch and the keyboard — Enter/Space on a button fire a
      // click with detail 0. A MOUSE click on a hover device is ignored:
      // hover already opened the panel, and toggling here would snap it shut
      // under the pointer.
      toggle.addEventListener('click', function (event) {
        if (canHover && event.detail > 0) return;
        setOpen(!item.classList.contains('is-open'));
      });

      // Escape closes and hands focus back to the trigger.
      item.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && item.classList.contains('is-open')) {
          setOpen(false);
          toggle.focus();
        }
      });

      // Tabbing out of the group closes it, so a keyboard user never leaves
      // an orphaned panel floating over the page behind them.
      item.addEventListener('focusout', function (event) {
        if (!item.contains(event.relatedTarget)) setOpen(false);
      });
    }
  );

  /* ----------------------------------------------------------------------
     The sheet
     ---------------------------------------------------------------------- */
  if (!drawer || !overlay || !openBtn) return;

  var isOpen = false;

  var focusables = function () {
    return drawer.querySelectorAll('a[href], button:not([disabled])');
  };

  var open = function () {
    if (isOpen) return;
    isOpen = true;

    drawer.hidden = false;
    overlay.hidden = false;

    // Force a reflow so the transition runs from the off-screen position
    // instead of the element simply appearing in place.
    void drawer.offsetWidth;

    drawer.classList.add('is-open');
    overlay.classList.add('is-open');
    openBtn.setAttribute('aria-expanded', 'true');

    // Scroll lock. Without it the page behind scrolls under the sheet on iOS.
    document.body.style.overflow = 'hidden';

    // Focus has to enter the dialog or a keyboard user is still out on the page.
    if (closeBtn) closeBtn.focus();
  };

  var close = function () {
    if (!isOpen) return;
    isOpen = false;

    drawer.classList.remove('is-open');
    overlay.classList.remove('is-open');
    openBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';

    // Return focus to the control that opened it.
    openBtn.focus();

    // Keep the element in the tree until the slide-out has actually played,
    // otherwise `hidden` removes it instantly and the transition never shows.
    var done = function () {
      if (!isOpen) {
        drawer.hidden = true;
        overlay.hidden = true;
      }
      drawer.removeEventListener('transitionend', done);
    };

    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      done();
    } else {
      drawer.addEventListener('transitionend', done);
      // Fallback: transitionend does not fire if the element is display:none'd
      // by something else mid-flight.
      window.setTimeout(done, 400);
    }
  };

  openBtn.addEventListener('click', open);
  if (closeBtn) closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', close);

  // Accordion groups in the sheet — tap opens, tap again closes. State lives
  // on the button's aria-expanded and the sub-list's [hidden], nothing else.
  Array.prototype.forEach.call(
    document.querySelectorAll('[data-fh-accordion]'),
    function (btn) {
      btn.addEventListener('click', function () {
        var sub = document.getElementById(btn.getAttribute('aria-controls'));
        if (!sub) return;
        var expanded = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        sub.hidden = expanded;
      });
    }
  );

  document.addEventListener('keydown', function (event) {
    if (!isOpen) return;

    if (event.key === 'Escape') {
      close();
      return;
    }

    // Trap Tab inside the sheet. aria-modal alone tells a screen reader to stay
    // put; it does not stop the browser tabbing out to the page behind.
    if (event.key !== 'Tab') return;

    var items = focusables();
    if (!items.length) return;

    var first = items[0];
    var last = items[items.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  // The sheet only exists below the flat-nav breakpoint — 1200px, keep in
  // sync with florista-header.css (this constant sat at a stale 768 after the
  // breakpoint moved to 1088; fixed in passing 2026-08-29). Resizing past it
  // while open would otherwise leave the scroll lock on with nothing holding it.
  var wide = window.matchMedia('(min-width: 1200px)');
  var onWide = function (event) {
    if (event.matches) close();
  };

  if (typeof wide.addEventListener === 'function') {
    wide.addEventListener('change', onWide);
  } else if (typeof wide.addListener === 'function') {
    wide.addListener(onWide); // Safari < 14
  }
})();
