/* ==========================================================================
   zopaaa-loans — Scroll & entrance animations
   IntersectionObserver reveals, animated counters, typing hero headline,
   subtle parallax for hero blobs.
   ========================================================================== */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    autoTagReveals();
    initScrollReveal();
    initCounters();
    initTypingHero();
    initParallax();
  });

  /* Automatically mark common section children for reveal if the author
     didn't hand-annotate them, so every page gets consistent motion. */
  function autoTagReveals() {
    document.querySelectorAll('.card, .step-card, .stat-block, .doc-item, .office-card, .timeline-item, .value-card').forEach(function (el, i) {
      if (!el.hasAttribute('data-reveal')) {
        el.setAttribute('data-reveal', 'up');
        el.style.setProperty('--d', (i % 6) * 70 + 'ms');
      }
    });
  }

  function initScrollReveal() {
    var targets = document.querySelectorAll('[data-reveal]');
    if (!('IntersectionObserver' in window) || targets.length === 0) {
      targets.forEach(function (t) { t.classList.add('revealed'); });
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var delay = entry.target.style.getPropertyValue('--d');
          if (delay) entry.target.style.transitionDelay = delay;
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
    targets.forEach(function (t) { observer.observe(t); });
  }

  /* ---------------- Animated counters ---------------- */
  function initCounters() {
    var counters = document.querySelectorAll('[data-counter]');
    if (counters.length === 0) return;
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          runCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    counters.forEach(function (c) { observer.observe(c); });
  }

  function runCounter(el) {
    var target = parseFloat(el.dataset.counter);
    var decimals = el.dataset.decimals ? parseInt(el.dataset.decimals, 10) : 0;
    var suffix = el.dataset.suffix || '';
    var prefix = el.dataset.prefix || '';
    var duration = 1800;
    var start = null;

    function step(ts) {
      if (!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var value = target * eased;
      el.textContent = prefix + value.toLocaleString('en-GB', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      }) + suffix;
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.classList.add('pulse-update');
      }
    }
    requestAnimationFrame(step);
  }

  /* ---------------- Typing hero headline ---------------- */
  function initTypingHero() {
    var el = document.querySelector('[data-typing]');
    if (!el) return;
    var words = JSON.parse(el.dataset.typing || '[]');
    if (words.length === 0) return;
    var wordIndex = 0, charIndex = 0, deleting = false;
    var span = document.createElement('span');
    span.className = 'type-cursor';
    el.appendChild(span);

    function tick() {
      var word = words[wordIndex];
      if (!deleting) {
        charIndex++;
        span.textContent = word.slice(0, charIndex);
        if (charIndex === word.length) {
          deleting = true;
          setTimeout(tick, 1600);
          return;
        }
      } else {
        charIndex--;
        span.textContent = word.slice(0, charIndex);
        if (charIndex === 0) {
          deleting = false;
          wordIndex = (wordIndex + 1) % words.length;
        }
      }
      setTimeout(tick, deleting ? 45 : 85);
    }
    tick();
  }

  /* ---------------- Subtle parallax for hero blobs ---------------- */
  function initParallax() {
    var blobs = document.querySelectorAll('.blob');
    if (blobs.length === 0) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    window.addEventListener('scroll', function () {
      var y = window.scrollY;
      blobs.forEach(function (blob, i) {
        blob.style.transform = 'translateY(' + (y * (0.08 + i * 0.04)) + 'px)';
      });
    }, { passive: true });
  }
})();
