/* ==========================================================================
   zopaaa-loans — Loan calculator engine
   Pure JS EMI / amortization math + Canvas 2D charts (no libraries).
   Powers both the homepage mini-calculator and the full calculator page.
   ========================================================================== */

(function () {
  'use strict';

  /* ------------------------------------------------------------------
     Core maths
     amount            principal borrowed (GBP)
     aprPercent        representative APR, e.g. 9.9
     termMonths        loan duration in months
     extraMonthly      additional voluntary payment applied every month
     feePercent        one-off processing fee, % of principal (added to repayable)
     insuranceMonthly  optional monthly insurance premium (added to repayable)
     ------------------------------------------------------------------ */
  function computeLoan(params) {
    var amount = Math.max(0, Number(params.amount) || 0);
    var apr = Math.max(0, Number(params.aprPercent) || 0);
    var months = Math.max(1, Math.round(Number(params.termMonths) || 1));
    var extra = Math.max(0, Number(params.extraMonthly) || 0);
    var feePercent = Math.max(0, Number(params.feePercent) || 0);
    var insurance = Math.max(0, Number(params.insuranceMonthly) || 0);

    var monthlyRate = apr / 100 / 12;
    var baseMonthly;
    if (monthlyRate === 0) {
      baseMonthly = amount / months;
    } else {
      var pow = Math.pow(1 + monthlyRate, months);
      baseMonthly = amount * monthlyRate * pow / (pow - 1);
    }

    var schedule = [];
    var balance = amount;
    var totalInterest = 0;
    var month = 0;
    var payment = baseMonthly + extra;

    while (balance > 0.005 && month < 1200) {
      month++;
      var interest = balance * monthlyRate;
      var principalPortion = payment - interest;
      if (principalPortion > balance) principalPortion = balance;
      if (principalPortion < 0) principalPortion = 0;
      balance = Math.max(0, balance - principalPortion);
      totalInterest += interest;
      schedule.push({
        month: month,
        payment: principalPortion + interest,
        principal: principalPortion,
        interest: interest,
        balance: balance
      });
      if (balance <= 0.005) break;
    }

    var fee = amount * (feePercent / 100);
    var totalInsurance = insurance * schedule.length;
    var totalRepayment = amount + totalInterest + fee + totalInsurance;

    return {
      baseMonthly: baseMonthly,
      monthlyPayment: baseMonthly + insurance,
      totalMonths: schedule.length,
      totalInterest: totalInterest,
      totalRepayment: totalRepayment,
      fee: fee,
      totalInsurance: totalInsurance,
      schedule: schedule
    };
  }

  window.ZopaaaLoans = window.ZopaaaLoans || {};
  window.ZopaaaLoans.computeLoan = computeLoan;

  /* ------------------------------------------------------------------
     Homepage mini calculator
     ------------------------------------------------------------------ */
  function initHomeCalculator() {
    var root = document.getElementById('homeCalculator');
    if (!root) return;
    var amountSlider = root.querySelector('#hcAmount');
    var termSlider = root.querySelector('#hcTerm');
    var amountOut = root.querySelector('#hcAmountValue');
    var termOut = root.querySelector('#hcTermValue');
    var monthlyOut = root.querySelector('#hcMonthly');
    var totalOut = root.querySelector('#hcTotal');
    var interestOut = root.querySelector('#hcInterest');
    var aprOut = root.querySelector('#hcApr');
    var APR = 9.9;

    function render() {
      var amount = Number(amountSlider.value);
      var months = Number(termSlider.value);
      amountOut.textContent = window.ZopaaaLoans.formatGBP(amount);
      termOut.textContent = months + (months === 1 ? ' month' : ' months');
      setFill(amountSlider);
      setFill(termSlider);

      var result = computeLoan({ amount: amount, aprPercent: APR, termMonths: months });
      animateValue(monthlyOut, result.monthlyPayment, 2, '£');
      animateValue(totalOut, result.totalRepayment, 2, '£');
      animateValue(interestOut, result.totalInterest, 2, '£');
      if (aprOut) aprOut.textContent = APR + '%';
    }

    [amountSlider, termSlider].forEach(function (el) {
      el.addEventListener('input', render);
    });
    render();
  }

  /* ------------------------------------------------------------------
     Full calculator page
     ------------------------------------------------------------------ */
  function initFullCalculator() {
    var root = document.getElementById('fullCalculator');
    if (!root) return;

    var els = {
      amount: root.querySelector('#calcAmount'),
      apr: root.querySelector('#calcApr'),
      term: root.querySelector('#calcTerm'),
      extra: root.querySelector('#calcExtra'),
      fee: root.querySelector('#calcFee'),
      insurance: root.querySelector('#calcInsurance'),
      amountVal: root.querySelector('#calcAmountValue'),
      aprVal: root.querySelector('#calcAprValue'),
      termVal: root.querySelector('#calcTermValue'),
      extraVal: root.querySelector('#calcExtraValue'),
      monthly: root.querySelector('#calcMonthlyOut'),
      totalInterest: root.querySelector('#calcInterestOut'),
      totalRepayment: root.querySelector('#calcTotalOut'),
      payoffTime: root.querySelector('#calcPayoffOut'),
      feeOut: root.querySelector('#calcFeeOut'),
      tableBody: document.getElementById('amortBody'),
      toggleTable: document.getElementById('amortToggle')
    };

    var donutCanvas = document.getElementById('donutChart');
    var lineCanvas = document.getElementById('balanceChart');
    var fullSchedule = false;

    function currentParams() {
      return {
        amount: Number(els.amount.value),
        aprPercent: Number(els.apr.value),
        termMonths: Number(els.term.value),
        extraMonthly: Number(els.extra.value || 0),
        feePercent: Number(els.fee.value || 0),
        insuranceMonthly: Number(els.insurance.value || 0)
      };
    }

    function render() {
      els.amountVal.textContent = window.ZopaaaLoans.formatGBP(Number(els.amount.value));
      els.aprVal.textContent = Number(els.apr.value).toFixed(1) + '%';
      els.termVal.textContent = els.term.value + ' months';
      if (els.extraVal) els.extraVal.textContent = window.ZopaaaLoans.formatGBP(Number(els.extra.value || 0));
      [els.amount, els.apr, els.term, els.extra].forEach(function (s) { if (s) setFill(s); });

      var result = computeLoan(currentParams());

      animateValue(els.monthly, result.monthlyPayment, 2, '£');
      animateValue(els.totalInterest, result.totalInterest, 2, '£');
      animateValue(els.totalRepayment, result.totalRepayment, 2, '£');
      if (els.feeOut) animateValue(els.feeOut, result.fee, 2, '£');
      if (els.payoffTime) {
        var years = Math.floor(result.totalMonths / 12);
        var monthsRem = result.totalMonths % 12;
        els.payoffTime.textContent = (years > 0 ? years + 'y ' : '') + monthsRem + 'm';
      }

      renderTable(result.schedule);
      drawDonut(donutCanvas, Number(els.amount.value), result.totalInterest, result.fee + result.totalInsurance);
      drawBalanceChart(lineCanvas, result.schedule);
    }

    function renderTable(schedule) {
      if (!els.tableBody) return;
      var rows = fullSchedule ? schedule : schedule.slice(0, 12);
      els.tableBody.innerHTML = rows.map(function (row) {
        return '<tr><td>' + row.month + '</td>' +
          '<td>' + window.ZopaaaLoans.formatGBP(row.payment, 2) + '</td>' +
          '<td>' + window.ZopaaaLoans.formatGBP(row.principal, 2) + '</td>' +
          '<td>' + window.ZopaaaLoans.formatGBP(row.interest, 2) + '</td>' +
          '<td>' + window.ZopaaaLoans.formatGBP(row.balance, 2) + '</td></tr>';
      }).join('');
    }

    if (els.toggleTable) {
      els.toggleTable.addEventListener('click', function () {
        fullSchedule = !fullSchedule;
        els.toggleTable.textContent = fullSchedule ? 'Show first 12 months' : 'Show full schedule';
        render();
      });
    }

    Object.keys(els).forEach(function (key) {
      var el = els[key];
      if (el && (el.tagName === 'INPUT' || el.tagName === 'SELECT')) {
        el.addEventListener('input', render);
      }
    });

    render();
    window.addEventListener('resize', debounce(render, 200));
  }

  /* ------------------------------------------------------------------
     Canvas: donut chart — principal vs interest vs fees
     ------------------------------------------------------------------ */
  function drawDonut(canvas, principal, interest, fees) {
    if (!canvas) return;
    var ctx = setupCanvas(canvas);
    var w = canvas.clientWidth, h = canvas.clientHeight;
    var cx = w / 2, cy = h / 2;
    var radius = Math.min(w, h) / 2 - 12;
    var lineWidth = radius * 0.34;

    var total = principal + interest + fees;
    if (total <= 0) total = 1;
    var segments = [
      { value: principal, color: getCssVar('--color-primary-500') },
      { value: interest, color: getCssVar('--color-accent-500') },
      { value: fees, color: getCssVar('--color-primary-200') }
    ];

    ctx.clearRect(0, 0, w, h);
    var start = -Math.PI / 2;
    segments.forEach(function (seg) {
      var angle = (seg.value / total) * Math.PI * 2;
      if (angle <= 0) return;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, start, start + angle);
      ctx.strokeStyle = seg.color;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'butt';
      ctx.stroke();
      start += angle;
    });

    ctx.fillStyle = getCssVar('--text-primary');
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '700 18px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(Math.round((principal / total) * 100) + '%', cx, cy - 10);
    ctx.font = '600 11px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = getCssVar('--text-secondary');
    ctx.fillText('Principal', cx, cy + 12);
  }

  /* ------------------------------------------------------------------
     Canvas: balance-over-time line chart
     ------------------------------------------------------------------ */
  function drawBalanceChart(canvas, schedule) {
    if (!canvas || !schedule || schedule.length === 0) return;
    var ctx = setupCanvas(canvas);
    var w = canvas.clientWidth, h = canvas.clientHeight;
    var padding = { top: 18, right: 16, bottom: 28, left: 54 };
    var plotW = w - padding.left - padding.right;
    var plotH = h - padding.top - padding.bottom;

    ctx.clearRect(0, 0, w, h);

    var maxBalance = schedule[0].balance + schedule[0].principal;
    var gridLines = 4;
    ctx.strokeStyle = getCssVar('--border-color');
    ctx.fillStyle = getCssVar('--text-secondary');
    ctx.font = '11px "Plus Jakarta Sans", sans-serif';
    ctx.lineWidth = 1;
    for (var g = 0; g <= gridLines; g++) {
      var y = padding.top + (plotH / gridLines) * g;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(w - padding.right, y);
      ctx.stroke();
      var value = maxBalance * (1 - g / gridLines);
      ctx.textAlign = 'right';
      ctx.fillText('£' + Math.round(value / 1000) + 'k', padding.left - 8, y + 3);
    }

    function pointFor(i) {
      var x = padding.left + (plotW * i) / (schedule.length - 1 || 1);
      var y = padding.top + plotH * (1 - schedule[i].balance / maxBalance);
      return { x: x, y: y };
    }

    var gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + plotH);
    gradient.addColorStop(0, hexToRgba(getCssVar('--color-primary-500'), 0.28));
    gradient.addColorStop(1, hexToRgba(getCssVar('--color-primary-500'), 0));

    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top + plotH);
    schedule.forEach(function (_, i) {
      var p = pointFor(i);
      ctx.lineTo(p.x, p.y);
    });
    ctx.lineTo(padding.left + plotW, padding.top + plotH);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.beginPath();
    schedule.forEach(function (_, i) {
      var p = pointFor(i);
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.strokeStyle = getCssVar('--color-primary-600');
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = getCssVar('--text-secondary');
    var labelStep = Math.max(1, Math.floor(schedule.length / 5));
    for (var i = 0; i < schedule.length; i += labelStep) {
      var p = pointFor(i);
      ctx.fillText('Yr ' + Math.ceil((i + 1) / 12), p.x, h - 6);
    }
  }

  /* ------------------------------------------------------------------
     Helpers
     ------------------------------------------------------------------ */
  function setupCanvas(canvas) {
    var dpr = window.devicePixelRatio || 1;
    var cssWidth = canvas.clientWidth || canvas.parentElement.clientWidth;
    var cssHeight = canvas.clientHeight || 260;
    canvas.width = cssWidth * dpr;
    canvas.height = cssHeight * dpr;
    var ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return ctx;
  }

  function getCssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || '#606C38';
  }

  function hexToRgba(hex, alpha) {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(function (c) { return c + c; }).join('');
    var bigint = parseInt(hex, 16);
    var r = (bigint >> 16) & 255, g = (bigint >> 8) & 255, b = bigint & 255;
    return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
  }

  function setFill(slider) {
    var min = Number(slider.min) || 0;
    var max = Number(slider.max) || 100;
    var pct = ((Number(slider.value) - min) / (max - min)) * 100;
    slider.style.setProperty('--fill', pct + '%');
  }

  function animateValue(el, target, decimals, prefix) {
    if (!el) return;
    var start = parseFloat((el.textContent || '0').replace(/[^0-9.]/g, '')) || 0;
    var duration = 500;
    var startTime = null;
    el.classList.add('pulse-update');
    function step(ts) {
      if (!startTime) startTime = ts;
      var progress = Math.min((ts - startTime) / duration, 1);
      var value = start + (target - start) * progress;
      el.textContent = (prefix || '') + value.toLocaleString('en-GB', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      });
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
    setTimeout(function () { el.classList.remove('pulse-update'); }, 450);
  }

  function debounce(fn, wait) {
    var t;
    return function () {
      clearTimeout(t);
      var args = arguments;
      t = setTimeout(function () { fn.apply(null, args); }, wait);
    };
  }

  document.addEventListener('DOMContentLoaded', function () {
    initHomeCalculator();
    initFullCalculator();
  });
})();
