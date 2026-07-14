/* ==========================================================================
   zopaaa-loans — Shared header & footer injection
   Keeps navigation/footer markup in one place so every page stays in sync
   without a build step. Runs before DOMContentLoaded-dependent scripts.
   ========================================================================== */

(function () {
  'use strict';

  var YEAR = new Date().getFullYear();

  var LOAN_TYPES = [
    { href: 'loan-types.html#personal', name: 'Personal Loan', desc: 'For life’s everyday plans', icon: 'wallet' },
    { href: 'loan-types.html#home-improvement', name: 'Home Improvement', desc: 'Renovate, extend, upgrade', icon: 'home' },
    { href: 'loan-types.html#wedding', name: 'Wedding Loan', desc: 'Fund the big day', icon: 'heart' },
    { href: 'loan-types.html#car', name: 'Car Loan', desc: 'Drive away sooner', icon: 'car' },
    { href: 'loan-types.html#debt-consolidation', name: 'Debt Consolidation', desc: 'One simple payment', icon: 'layers' },
    { href: 'loan-types.html#holiday', name: 'Holiday Loan', desc: 'Book the getaway', icon: 'sun' }
  ];

  var ICONS = {
    wallet: '<path d="M3 7a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v1h1a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"/><path d="M16 12h3"/>',
    home: '<path d="M4 11 12 4l8 7"/><path d="M6 10v9a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-9"/>',
    heart: '<path d="M12 20s-7-4.35-9.5-8.8C.7 7.9 2.3 4.5 5.8 4c2-.3 3.7.7 4.7 2.2C11.5 4.7 13.2 3.7 15.2 4c3.5.5 5.1 3.9 3.3 7.2C19 15.65 12 20 12 20Z"/>',
    car: '<path d="M4 16V9.5a2 2 0 0 1 1.2-1.8L7 7l1.2-2.4A2 2 0 0 1 10 3.5h4a2 2 0 0 1 1.8 1.1L17 7l1.8.7A2 2 0 0 1 20 9.5V16"/><path d="M4 16h16"/><circle cx="7.5" cy="16.5" r="1.7"/><circle cx="16.5" cy="16.5" r="1.7"/>',
    layers: '<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 13 9 5 9-5"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M3 12h2M19 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/>'
  };

  function svgIcon(name, cls) {
    return '<svg class="' + (cls || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONS[name] || '') + '</svg>';
  }

  function dropdownItems() {
    return LOAN_TYPES.map(function (t) {
      return '<a class="dropdown-item" href="' + t.href + '">' +
        '<span class="dd-icon">' + svgIcon(t.icon) + '</span>' +
        '<span><strong>' + t.name + '</strong><span>' + t.desc + '</span></span>' +
        '</a>';
    }).join('');
  }

  var NAV_ITEMS = [
    { href: 'about.html', label: 'About Us' },
    { href: 'calculator.html', label: 'Calculator' },
    { href: 'how-it-works.html', label: 'How It Works / Eligibility' },
    { href: 'loan-types.html', label: 'Loan Types', dropdown: true },
    { href: 'blog.html', label: 'Blog' },
    { href: 'faq.html', label: 'FAQs' },
    { href: 'contact.html', label: 'Contact' }
  ];

  function currentFile() {
    var p = window.location.pathname.split('/').pop();
    return p === '' ? 'index.html' : p;
  }

  function brandMark() {
    return '<span class="brand-mark">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 17V9l8-5 8 5v8"/><path d="M9 21v-6a3 3 0 0 1 6 0v6"/></svg>' +
      '</span>';
  }

  function buildHeader() {
    var current = currentFile();
    var navHtml = NAV_ITEMS.map(function (item) {
      var isActive = item.href === current;
      if (item.dropdown) {
        return '<li class="has-dropdown">' +
          '<a href="' + item.href + '" class="' + (isActive ? 'active' : '') + '" aria-haspopup="true">' + item.label +
          '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg></a>' +
          '<div class="dropdown-panel" role="menu">' + dropdownItems() + '</div>' +
          '</li>';
      }
      return '<li><a href="' + item.href + '" class="' + (isActive ? 'active' : '') + '"' + (isActive ? ' aria-current="page"' : '') + '>' + item.label + '</a></li>';
    }).join('');

    var mobileNav = NAV_ITEMS.map(function (item) {
      var isActive = item.href === current;
      if (item.dropdown) {
        return '<li>' +
          '<button class="accordion-trigger" type="button" aria-expanded="false">' + item.label +
          '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>' +
          '</button>' +
          '<ul class="sub-links">' + LOAN_TYPES.map(function (t) { return '<li><a href="' + t.href + '">' + t.name + '</a></li>'; }).join('') + '<li><a href="loan-types.html">View all loan types →</a></li></ul>' +
          '</li>';
      }
      return '<li><a href="' + item.href + '" class="' + (isActive ? 'active' : '') + '">' + item.label + '</a></li>';
    }).join('');

    return '' +
    '<a href="#main" class="skip-link">Skip to content</a>' +
    '<div class="scroll-progress" id="scrollProgress"></div>' +
    '<header class="navbar" id="navbar">' +
      '<div class="container">' +
        '<a href="index.html" class="brand">' + brandMark() + '<span>zopaaa-loans</span></a>' +
        '<nav aria-label="Primary">' +
          '<ul class="nav-links">' + navHtml + '</ul>' +
        '</nav>' +
        '<div class="nav-cta">' +
          '<a href="loans.html#apply" class="btn btn-primary btn-sm">Apply Now</a>' +
          '<button class="menu-toggle" id="menuToggle" aria-label="Open menu" aria-expanded="false" aria-controls="mobileDrawer"><span></span><span></span><span></span></button>' +
        '</div>' +
      '</div>' +
    '</header>' +
    '<div class="mobile-drawer" id="mobileDrawer">' +
      '<ul>' + mobileNav + '</ul>' +
      '<div class="drawer-cta">' +
        '<a href="loans.html#apply" class="btn btn-primary btn-block">Apply Now</a>' +
        '<a href="tel:08001234567" class="btn btn-outline btn-block">Call 0800 123 4567</a>' +
      '</div>' +
    '</div>';
  }

  function buildFooter() {
    return '' +
    '<footer class="site-footer">' +
      '<div class="container">' +
        '<div class="footer-top">' +
          '<div class="footer-col footer-brand">' +
            '<a href="index.html" class="brand" style="color:#fff">' + brandMark() + '<span>zopaaa-loans</span></a>' +
            '<p>Straightforward personal loans with fair rates, fast decisions, and no hidden fees. Borrow with confidence.</p>' +
            '<div class="social-row">' +
              '<a href="#" aria-label="Instagram"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="3.6"/><circle cx="17" cy="7" r="1"/></svg></a>' +
              '<a href="#" aria-label="Facebook"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 21v-7.6h2.6l.4-3h-3V8.4c0-.9.24-1.5 1.56-1.5H16.6V4.2C16.3 4.16 15.3 4 14.1 4c-2.4 0-4 1.47-4 4.16v2.24H7.5v3H10V21h3.5Z"/></svg></a>' +
              '<a href="#" aria-label="TikTok"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.6 5.82c-.9-.8-1.44-1.95-1.44-3.22h-3.1v12.4a2.59 2.59 0 0 1-2.59 2.5c-1.43 0-2.6-1.16-2.6-2.6 0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64 0 3.33 2.76 5.7 5.69 5.7 3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.24-1.48Z"/></svg></a>' +
            '</div>' +
          '</div>' +
          '<div class="footer-col">' +
            '<h4>Loans</h4>' +
            '<ul>' +
              '<li><a href="loans.html">Personal Loans</a></li>' +
              '<li><a href="loan-types.html">Loan Types</a></li>' +
              '<li><a href="calculator.html">Loan Calculator</a></li>' +
              '<li><a href="how-it-works.html#eligibility">Eligibility Checker</a></li>' +
              '<li><a href="how-it-works.html">How It Works</a></li>' +
            '</ul>' +
          '</div>' +
          '<div class="footer-col">' +
            '<h4>Company</h4>' +
            '<ul>' +
              '<li><a href="about.html">About Us</a></li>' +
              '<li><a href="blog.html">Blog &amp; Guides</a></li>' +
              '<li><a href="faq.html">FAQs</a></li>' +
              '<li><a href="contact.html">Contact</a></li>' +
              '<li><a href="contact.html#careers">Careers</a></li>' +
            '</ul>' +
          '</div>' +
          '<div class="footer-col">' +
            '<h4>Contact</h4>' +
            '<ul>' +
              '<li><a href="tel:08001234567"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 5c0 8.3 6.7 15 15 15v-3.2a1.5 1.5 0 0 0-1.2-1.47l-3.1-.62a1.5 1.5 0 0 0-1.45.4l-1.2 1.2a12 12 0 0 1-5.3-5.3l1.2-1.2a1.5 1.5 0 0 0 .4-1.45l-.62-3.1A1.5 1.5 0 0 0 6.2 4H4Z"/></svg> 0800 123 4567</a></li>' +
              '<li><a href="mailto:support@zopaaa-loans.co.uk"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16v12H4Z"/><path d="m4 7 8 6 8-6"/></svg> support@zopaaa-loans.co.uk</a></li>' +
            '</ul>' +
          '</div>' +
        '</div>' +
        '<div class="footer-bottom">' +
          '<span>&copy; ' + YEAR + ' zopaaa-loans Financial Services Ltd. All rights reserved.</span>' +
          '<div class="footer-bottom-links">' +
            '<a href="privacy.html">Privacy Policy</a><a href="terms.html">Terms &amp; Conditions</a><a href="cookies.html">Cookie Policy</a><a href="terms.html#responsible-lending">Responsible Lending</a>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</footer>' +
    '<div class="cookie-banner" id="cookieBanner" role="dialog" aria-label="Cookie consent">' +
      '<p>We use cookies to personalise content, provide social features and analyse our traffic. Read our <a href="cookies.html" style="text-decoration:underline">Cookie Policy</a> to learn more.</p>' +
      '<div class="cookie-actions">' +
        '<button class="btn btn-outline btn-sm" id="cookieDecline">Decline</button>' +
        '<button class="btn btn-primary btn-sm" id="cookieAccept">Accept All</button>' +
      '</div>' +
    '</div>' +
    '<div class="page-loader" id="pageLoader">' +
      '<div class="loader-ring"></div>' +
      '<div class="loader-brand">zopaaa-loans</div>' +
    '</div>' +
    '<div class="toast-container" id="toastContainer" aria-live="polite"></div>';
  }

  document.addEventListener('DOMContentLoaded', function () {
    var headerMount = document.getElementById('site-header');
    var footerMount = document.getElementById('site-footer');
    if (headerMount) headerMount.innerHTML = buildHeader();
    if (footerMount) footerMount.innerHTML = buildFooter();
    document.dispatchEvent(new CustomEvent('components:ready'));
  });
})();
