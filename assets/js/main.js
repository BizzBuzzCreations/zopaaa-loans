/* ==========================================================================
   zopaaa-loans — Core interactive behaviour
   Navbar, mobile drawer, loader, scroll progress, cookie consent,
   generic accordion/tabs/modal, toasts, ripple buttons.
   ========================================================================== */

(function () {
  'use strict';

  /* ---------------- Toast system (exposed globally) ---------------- */
  function toast(opts) {
    var container = document.getElementById('toastContainer');
    if (!container) return;
    var type = opts.type || 'info';
    var el = document.createElement('div');
    el.className = 'toast ' + type;
    var iconPaths = {
      success: '<path d="M20 6 9 17l-5-5"/>',
      error: '<path d="M18 6 6 18M6 6l12 12"/>',
      info: '<path d="M12 8h.01M11 12h1v4h1"/><circle cx="12" cy="12" r="9"/>'
    };
    el.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + (iconPaths[type] || iconPaths.info) + '</svg>' +
      '<div><strong>' + (opts.title || '') + '</strong><p>' + (opts.message || '') + '</p></div>';
    container.appendChild(el);
    setTimeout(function () {
      el.style.transition = 'opacity 400ms ease, transform 400ms ease';
      el.style.opacity = '0';
      el.style.transform = 'translateX(40px)';
      setTimeout(function () { el.remove(); }, 400);
    }, opts.duration || 4200);
  }
  window.ZopaaaLoans = window.ZopaaaLoans || {};
  window.ZopaaaLoans.toast = toast;

  /* ---------------- Number formatting helper ---------------- */
  window.ZopaaaLoans.formatGBP = function (num, decimals) {
    decimals = decimals === undefined ? 0 : decimals;
    return '£' + Number(num).toLocaleString('en-GB', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  };

  /* ---------------- Init after header/footer are injected ---------------- */
  document.addEventListener('components:ready', init);
  // Fallback in case header/footer mounts are absent on a page
  document.addEventListener('DOMContentLoaded', function () {
    setTimeout(function () {
      if (!document.body.dataset.zopaaaLoansInit) init();
    }, 60);
  });

  function init() {
    if (document.body.dataset.zopaaaLoansInit) return;
    document.body.dataset.zopaaaLoansInit = 'true';

    initLoader();
    initNavbarScroll();
    initMobileDrawer();
    initScrollProgress();
    initCookieConsent();
    initAccordions();
    initTabs();
    initModals();
    initRipple();
    initDropdownA11y();
  }

  /* ---------------- Page loader ---------------- */
  function initLoader() {
    var loader = document.getElementById('pageLoader');
    if (!loader) return;
    function hide() {
      loader.classList.add('hidden');
    }
    if (document.readyState === 'complete') {
      setTimeout(hide, 350);
    } else {
      window.addEventListener('load', function () { setTimeout(hide, 350); });
    }
    // Safety net so the loader never blocks the page indefinitely
    setTimeout(hide, 2500);
  }

  /* ---------------- Sticky navbar on scroll ---------------- */
  function initNavbarScroll() {
    var navbar = document.getElementById('navbar');
    if (!navbar) return;
    function onScroll() {
      if (window.scrollY > 24) navbar.classList.add('is-scrolled');
      else navbar.classList.remove('is-scrolled');
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------------- Mobile drawer ---------------- */
  function initMobileDrawer() {
    var toggle = document.getElementById('menuToggle');
    var drawer = document.getElementById('mobileDrawer');
    if (!toggle || !drawer) return;

    toggle.addEventListener('click', function () {
      var isOpen = drawer.classList.toggle('open');
      toggle.classList.toggle('active', isOpen);
      toggle.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    drawer.querySelectorAll('.accordion-trigger').forEach(function (trigger) {
      trigger.addEventListener('click', function () {
        var subList = trigger.nextElementSibling;
        var isOpen = subList.classList.toggle('open');
        trigger.setAttribute('aria-expanded', String(isOpen));
        trigger.querySelector('svg').style.transform = isOpen ? 'rotate(180deg)' : 'rotate(0)';
      });
    });

    drawer.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        drawer.classList.remove('open');
        toggle.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  /* ---------------- Scroll progress bar ---------------- */
  function initScrollProgress() {
    var bar = document.getElementById('scrollProgress');
    if (!bar) return;
    function onScroll() {
      var doc = document.documentElement;
      var scrollable = doc.scrollHeight - doc.clientHeight;
      var pct = scrollable > 0 ? (doc.scrollTop / scrollable) * 100 : 0;
      bar.style.width = pct + '%';
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
  }

  /* ---------------- Cookie consent banner ---------------- */
  function initCookieConsent() {
    var banner = document.getElementById('cookieBanner');
    if (!banner) return;
    var KEY = 'zopaaa-loans-cookie-consent';
    var stored = localStorage.getItem(KEY);
    if (!stored) {
      setTimeout(function () { banner.classList.add('show'); }, 1200);
    }
    function respond(value) {
      localStorage.setItem(KEY, value);
      banner.classList.remove('show');
    }
    var accept = document.getElementById('cookieAccept');
    var decline = document.getElementById('cookieDecline');
    if (accept) accept.addEventListener('click', function () { respond('accepted'); });
    if (decline) decline.addEventListener('click', function () { respond('declined'); });
  }

  /* ---------------- Generic accordion (FAQ, timelines, etc.) ---------------- */
  function initAccordions() {
    document.querySelectorAll('.accordion-item').forEach(function (item) {
      var trigger = item.querySelector('.accordion-trigger');
      var panel = item.querySelector('.accordion-panel');
      if (!trigger || !panel || item.closest('.mobile-drawer')) return;
      trigger.setAttribute('aria-expanded', 'false');
      trigger.addEventListener('click', function () {
        var isOpen = item.classList.contains('open');
        var group = item.closest('[data-accordion-group]');
        if (group) {
          group.querySelectorAll('.accordion-item.open').forEach(function (openItem) {
            if (openItem !== item) {
              openItem.classList.remove('open');
              openItem.querySelector('.accordion-panel').style.maxHeight = null;
              openItem.querySelector('.accordion-trigger').setAttribute('aria-expanded', 'false');
            }
          });
        }
        if (isOpen) {
          item.classList.remove('open');
          panel.style.maxHeight = null;
          trigger.setAttribute('aria-expanded', 'false');
        } else {
          item.classList.add('open');
          panel.style.maxHeight = panel.scrollHeight + 'px';
          trigger.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  /* ---------------- Generic tabs ---------------- */
  function initTabs() {
    document.querySelectorAll('.tabs-nav').forEach(function (nav) {
      var wrap = nav.closest('[data-tabs]');
      if (!wrap) return;
      var buttons = nav.querySelectorAll('.tab-btn');
      var panels = wrap.querySelectorAll('.tab-panel');
      buttons.forEach(function (btn, i) {
        btn.addEventListener('click', function () {
          buttons.forEach(function (b) { b.classList.remove('active'); });
          panels.forEach(function (p) { p.classList.remove('active'); });
          btn.classList.add('active');
          panels[i].classList.add('active');
        });
      });
    });
  }

  /* ---------------- Generic modal ---------------- */
  function initModals() {
    document.querySelectorAll('[data-modal-target]').forEach(function (opener) {
      opener.addEventListener('click', function (e) {
        e.preventDefault();
        var modal = document.getElementById(opener.dataset.modalTarget);
        if (modal) modal.classList.add('open');
      });
    });
    document.querySelectorAll('.modal-overlay').forEach(function (modal) {
      modal.addEventListener('click', function (e) {
        if (e.target === modal || e.target.closest('.modal-close')) {
          modal.classList.remove('open');
        }
      });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.open').forEach(function (m) { m.classList.remove('open'); });
      }
    });
  }

  /* ---------------- Ripple effect on buttons ---------------- */
  function initRipple() {
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('.btn');
      if (!btn) return;
      var rect = btn.getBoundingClientRect();
      var circle = document.createElement('span');
      var size = Math.max(rect.width, rect.height);
      circle.className = 'ripple';
      circle.style.width = circle.style.height = size + 'px';
      circle.style.left = (e.clientX - rect.left - size / 2) + 'px';
      circle.style.top = (e.clientY - rect.top - size / 2) + 'px';
      btn.appendChild(circle);
      setTimeout(function () { circle.remove(); }, 700);
    });
  }

  /* ---------------- Dropdown keyboard accessibility ---------------- */
  function initDropdownA11y() {
    document.querySelectorAll('.has-dropdown > a').forEach(function (link) {
      link.addEventListener('click', function (e) {
        if (window.innerWidth > 1024) {
          // allow navigation on desktop while still supporting hover-preview
        }
      });
    });
  }
})();
