/* ==========================================================================
   zopaaa-loans — Form validation & submission handling
   Vanilla JS validation for contact, application and newsletter forms.
   No backend exists, so "submission" is simulated with a toast + reset.
   ========================================================================== */

(function () {
  'use strict';

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var PHONE_RE = /^[+]?[\d\s()-]{7,20}$/;

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('form[data-validate]').forEach(bindForm);
    document.querySelectorAll('form.newsletter-form').forEach(bindNewsletter);
  });

  function bindForm(form) {
    form.setAttribute('novalidate', 'true');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var fields = form.querySelectorAll('input, select, textarea');
      var isValid = true;
      fields.forEach(function (field) {
        if (!validateField(field)) isValid = false;
      });

      if (!isValid) {
        var firstError = form.querySelector('.has-error .form-control');
        if (firstError) firstError.focus();
        notify('error', 'Please check the form', 'A few fields need your attention before we can continue.');
        return;
      }

      var submitBtn = form.querySelector('button[type="submit"]');
      var originalText = submitBtn ? submitBtn.innerHTML : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Submitting&hellip;';
      }

      setTimeout(function () {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        }
        var successTarget = form.dataset.successTarget ? document.getElementById(form.dataset.successTarget) : null;
        if (successTarget) {
          form.hidden = true;
          successTarget.hidden = false;
          successTarget.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          form.reset();
        }
        notify('success', 'Submitted successfully', form.dataset.successMessage || 'Thanks — we\'ve received your details and will be in touch shortly.');
      }, 900);
    });

    form.querySelectorAll('input, select, textarea').forEach(function (field) {
      field.addEventListener('blur', function () { validateField(field); });
      field.addEventListener('input', function () {
        var group = field.closest('.form-group');
        if (group && group.classList.contains('has-error')) validateField(field);
      });
    });
  }

  function validateField(field) {
    var group = field.closest('.form-group');
    if (!group) return true;
    var value = field.value.trim();
    var message = '';

    if (field.hasAttribute('required') && value === '') {
      message = field.dataset.errorRequired || 'This field is required.';
    } else if (field.type === 'email' && value !== '' && !EMAIL_RE.test(value)) {
      message = 'Enter a valid email address.';
    } else if (field.type === 'tel' && value !== '' && !PHONE_RE.test(value)) {
      message = 'Enter a valid phone number.';
    } else if (field.hasAttribute('minlength') && value.length > 0 && value.length < parseInt(field.getAttribute('minlength'), 10)) {
      message = 'Please enter at least ' + field.getAttribute('minlength') + ' characters.';
    } else if (field.type === 'checkbox' && field.hasAttribute('required') && !field.checked) {
      message = 'You must accept to continue.';
    } else if (field.tagName === 'SELECT' && field.hasAttribute('required') && value === '') {
      message = 'Please make a selection.';
    } else if (field.type === 'number' && value !== '') {
      var num = parseFloat(value);
      var min = field.hasAttribute('min') ? parseFloat(field.getAttribute('min')) : null;
      var max = field.hasAttribute('max') ? parseFloat(field.getAttribute('max')) : null;
      if (min !== null && num < min) message = 'Minimum value is ' + min + '.';
      if (max !== null && num > max) message = 'Maximum value is ' + max + '.';
    }

    var errorEl = group.querySelector('.form-error');
    if (message) {
      group.classList.add('has-error');
      if (errorEl) errorEl.textContent = message;
      return false;
    }
    group.classList.remove('has-error');
    return true;
  }

  function bindNewsletter(form) {
    form.setAttribute('novalidate', 'true');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = form.querySelector('input[type="email"]');
      if (!input || !EMAIL_RE.test(input.value.trim())) {
        notify('error', 'Invalid email', 'Please enter a valid email address to subscribe.');
        if (input) input.focus();
        return;
      }
      notify('success', 'You\'re subscribed!', 'Look out for financial tips and loan guides in your inbox.');
      form.reset();
    });
  }

  function notify(type, title, message) {
    if (window.ZopaaaLoans && window.ZopaaaLoans.toast) {
      window.ZopaaaLoans.toast({ type: type, title: title, message: message });
    }
  }
})();
