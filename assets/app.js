(function () {
  'use strict';

  var WA_NUMBER = '923352649604';
  var WA_TEXT = 'Assalam o Alaikum! I want to order ZONIC buds. Rs 2,999 COD.';
  var waLink = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(WA_TEXT);
  document.querySelectorAll('[data-wa]').forEach(function (a) { a.href = waLink; });

  var clamp = function (v, lo, hi) { return Math.min(hi, Math.max(lo, v)); };
  var smoothstep = function (p, e0, e1) {
    var t = clamp((p - e0) / (e1 - e0 || 1e-6), 0, 1);
    return t * t * (3 - 2 * t);
  };
  function rng(seed) {
    var s = seed >>> 0;
    return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  }
  var rand = rng(20260823);

  var reduceMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
  var rm = function () { return reduceMQ.matches; };

  var GATES = [
    '(prefers-reduced-motion: reduce)'
  ];
  var MQLS = GATES.map(function (q) { return window.matchMedia(q); });

  var stage = document.querySelector('.stage');
  var heroSec = document.querySelector('.hero');
  var video = document.getElementById('hero');
  var posterLayer = document.querySelector('.poster');
  var ring = document.querySelector('.ring');
  var cue = document.querySelector('.cue');
  var bandEls = Array.prototype.slice.call(document.querySelectorAll('.band'));
  var bands = bandEls.map(function (el) {
    return {
      el: el,
      a: parseFloat(el.dataset.a),
      b: parseFloat(el.dataset.b),
      rampOverride: el.dataset.ramp ? parseFloat(el.dataset.ramp) : null,
      op: -1, k: -1
    };
  });
  var VIDEO_URL = 'assets/hero-scrub.mp4';
  var POSTER_URL = 'assets/hero-poster.jpg';
  var VIDEO_BYTES = 1167697;

  var scrubOn = false;
  var heroReady = false;
  var heroOnScreen = true;
  var started = false;
  var target = 0, shown = 0, rafId = null, lastTick = 0;
  var seekBusy = false, pendingTime = null;
  var loadStart = 0;
  var loadK = 0;

  function heroProgress() {
    var range = heroSec.offsetHeight - window.innerHeight;
    if (range <= 0) return 0;
    return clamp((window.scrollY - heroSec.offsetTop) / range, 0, 1);
  }

  function requestSeek(t) {
    if (!video.duration) return;
    t = clamp(t, 0, video.duration - 0.001);
    if (seekBusy) { pendingTime = t; return; }
    seekBusy = true;
    try { video.currentTime = t; } catch (e) { seekBusy = false; pendingTime = null; }
  }
  video.addEventListener('seeked', function () {
    seekBusy = false;
    if (pendingTime !== null) { var t = pendingTime; pendingTime = null; requestSeek(t); }
  });
  video.addEventListener('error', function () { seekBusy = false; pendingTime = null; });

  var isMobile = /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  function startBlobFetch() {
    if (started) return;
    started = true;
    if (isMobile) {
      loadHeroDirect();
    } else {
      loadHeroBlob().catch(failVideo);
    }
  }

  function initHeroOnce() {
    if (initHeroOnce.done) return;
    initHeroOnce.done = true;
    startBlobFetch();
  }

  function loadHeroDirect() {
    stage.classList.add('loading');
    video.src = VIDEO_URL;
    video.load();
    video.addEventListener('canplay', function () {
      stage.classList.remove('loading');
      heroReady = true;
      requestSeek(heroProgress() * video.duration);
      stage.classList.add('video-ready');
    }, { once: true });
    video.addEventListener('error', function () {
      stage.classList.remove('loading');
      failVideo();
    }, { once: true });
  }

  function loadHeroBlob() {
    stage.classList.add('loading');
    var ctrl = new AbortController();
    var watchdog = setTimeout(function () { ctrl.abort(); }, 20000);
    return fetch(VIDEO_URL, { priority: 'low', signal: ctrl.signal }).then(function (res) {
      if (!res.ok && !res.body) throw new Error('http ' + res.status);
      var total = Number(res.headers.get('Content-Length')) || VIDEO_BYTES;
      if (!res.body) return res.blob().then(function (b) { finishBlob(b); return; });
      var reader = res.body.getReader();
      var chunks = [], got = 0, lastRing = 0;
      function pump() {
        return reader.read().then(function (r) {
          if (r.done) { clearTimeout(watchdog); finishBlob(new Blob(chunks)); return; }
          clearTimeout(watchdog);
          watchdog = setTimeout(function () { ctrl.abort(); }, 20000);
          chunks.push(r.value);
          got += r.value.length;
          var frac = Math.min(1, got / (total || 1));
          var now = performance.now();
          if (now - lastRing > 100 || frac === 1) {
            lastRing = now;
            ring.style.setProperty('--ld', Math.round(126 * (1 - frac)));
          }
          return pump();
        });
      }
      return pump();
    });
  }

  function finishBlob(blob) {
    ring.style.setProperty('--ld', 0);
    stage.classList.remove('loading');
    video.src = URL.createObjectURL(blob);
    video.load();
    video.addEventListener('canplay', function () {
      heroReady = true;
      requestSeek(heroProgress() * video.duration);
      stage.classList.add('video-ready');
    }, { once: true });
  }

  function failVideo() {
    stage.classList.remove('loading');
    stage.classList.add('video-failed');
  }

  function bandRamp(band) {
    if (band.rampOverride) return band.rampOverride;
    return Math.min(0.025, (band.b - band.a) * 0.35);
  }

  function updateCaptions(p) {
    var now = performance.now();
    if (loadStart && now - loadStart < 1100) {
      loadK = smoothstep((now - loadStart) / 1100, 0, 1);
    } else if (loadStart) { loadK = 1; loadStart = 0; }

    for (var i = 0; i < bands.length; i++) {
      var bd = bands[i];
      var a = bd.a, b = bd.b;
      var f = Math.min(0.02, (b - a) / 3);
      var op;
      if (i === 0) op = 1 - smoothstep(p, b - f, b);
      else if (i === bands.length - 1) op = smoothstep(p, a, a + f);
      else op = smoothstep(p, a, a + f) * (1 - smoothstep(p, b - f, b));
      var k = clamp((p - a) / (bandRamp(bd) || 1e-6), 0, 1);
      if (i === 0) k = Math.max(k, loadK);
      if (Math.abs(op - bd.op) > 0.004) { bd.op = op; bd.el.style.opacity = op.toFixed(3); }
      if (Math.abs(k - bd.k) > 0.008) { bd.k = k; bd.el.style.setProperty('--k', k.toFixed(3)); }
    }
    cue.classList.toggle('gone', p > 0.02);
  }

  var waves = Array.prototype.slice.call(document.querySelectorAll('.wave path')).map(function (path) {
    return { el: path, d: -1, idle: false };
  });
  function updateWaves() {
    var vh = window.innerHeight, moving = false;
    for (var i = 0; i < waves.length; i++) {
      var wv = waves[i];
      if (wv.idle) continue;
      var r = wv.el.getBoundingClientRect();
      if (r.top > vh + 60) continue;
      var k = clamp((vh * 0.86 - r.top) / (vh * 0.42), 0, 1);
      var d = 1 - k;
      if (Math.abs(d - wv.d) > 0.004) {
        wv.d = d; wv.el.style.setProperty('--d', d.toFixed(3)); moving = true;
      } else if (k >= 1) { wv.idle = true; }
    }
    return moving;
  }
  function wavesReset() { waves.forEach(function (wv) { wv.d = -1; wv.idle = false; }); }

  function tick(now) {
    var dt = Math.min(100, now - (lastTick || now));
    lastTick = now;
    var busy = false;

    if (scrubOn && heroOnScreen) {
      var k = 0.28;
      shown += (target - shown) * (1 - Math.pow(1 - k, dt / 16.667));
      if (Math.abs(target - shown) < 0.0005) { shown = target; }
      else busy = true;
      if (heroReady) requestSeek(shown * video.duration);
      updateCaptions(shown);
    }
    if (wavesDirty || busy) { if (updateWaves()) busy = true; else wavesDirty = false; }

    if (busy) { rafId = requestAnimationFrame(tick); }
    else { rafId = null; lastTick = 0; }
  }
  var wavesDirty = true;
  function wake() { if (rafId === null) { lastTick = 0; rafId = requestAnimationFrame(tick); } }

  function onScroll() {
    if (scrubOn) target = heroProgress();
    wavesDirty = true;
    wake();
  }

  var ioEls = Array.prototype.slice.call(document.querySelectorAll('.io'));
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      var el = en.target;
      el.classList.add('in');
      setTimeout(function () { el.classList.add('done'); }, 1100);
      if (el.classList.contains('eq-divider') && !el.dataset.h) {
        el.dataset.h = '1';
        var rr = rng(Math.floor(el.getBoundingClientRect().top) + 7);
        Array.prototype.forEach.call(el.children, function (bar) {
          bar.style.setProperty('--h', Math.round(14 + rr() * 26) + 'px');
        });
      }
      io.unobserve(el);
    });
  }, { threshold: 0.18 });
  ioEls.forEach(function (el) { io.observe(el); });

  var ticker = document.querySelector('.ticker');
  if (ticker) {
    new IntersectionObserver(function (es) {
      es.forEach(function (e) { ticker.classList.toggle('on', e.isIntersecting); });
    }, { threshold: 0 }).observe(ticker);
  }

  var navEl = document.querySelector('.nav');
  var navProg = document.getElementById('navProg');
  var lastNavY = -1;
  function updateNav() {
    var y = window.scrollY || window.pageYOffset || 0;
    if (Math.abs(y - lastNavY) < 2 && lastNavY !== -1) return;
    lastNavY = y;
    if (navEl) navEl.classList.toggle('scrolled', y > 10);
    if (navProg) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var p = max > 0 ? clamp(y / max, 0, 1) : 0;
      navProg.style.transform = 'scaleX(' + p.toFixed(4) + ')';
    }
  }
  window.addEventListener('scroll', updateNav, { passive: true });
  window.addEventListener('resize', updateNav, { passive: true });
  updateNav();

  var hold = { v: 0, tgt: 0, raf: null, last: 0, phase: 0, done: false };
  var holdBud = document.getElementById('holdBud');
  var holdPass = document.getElementById('holdPass');
  var proofSec = document.getElementById('proof');
  var ripCards = Array.prototype.slice.call(document.querySelectorAll('.cards .card'));

  function holdWrite(dt) {
    hold.v += (hold.tgt - hold.v) * (1 - Math.pow(1 - 0.065, dt / 16.667));
    if (!hold.tgt && hold.v < 0.004 && !hold.done) hold.v = 0;
    holdBud.style.setProperty('--hold', hold.v.toFixed(3));
    hold.phase += dt / 260;
    for (var i = 0; i < ripCards.length; i++) {
      var y = Math.sin(hold.phase + i * 1.1) * 3 * hold.v;
      ripCards[i].style.transform = 'translateY(' + y.toFixed(2) + 'px)';
    }
    if (hold.tgt && hold.v > 0.985) completeHold();
    var alive = Math.abs(hold.tgt - hold.v) > 0.003 || (hold.tgt && true);
    if (alive) hold.raf = requestAnimationFrame(holdLoop); else { hold.raf = null; ripCards.forEach(function (c) { c.style.transform = ''; }); }
  }
  function holdLoop(now) {
    var dt = Math.min(64, now - (hold.last || now));
    hold.last = now;
    holdWrite(dt);
  }
  function holdWake() {
    if (!hold.raf && !rm()) { hold.last = 0; hold.raf = requestAnimationFrame(holdLoop); }
  }
  function completeHold() {
    if (hold.done) return;
    hold.done = true;
    hold.v = 1;
    holdBud.style.setProperty('--hold', '1');
    holdBud.classList.add('charged-hold');
    proofSec.classList.add('charged');
    holdPass.hidden = false;
    requestAnimationFrame(function () { holdPass.classList.add('show'); });
  }
  function resetHold() {
    hold.done = false; hold.v = 0; hold.tgt = 0;
    holdBud.style.setProperty('--hold', '0');
    holdBud.classList.remove('charged-hold');
    proofSec.classList.remove('charged');
    holdPass.classList.remove('show');
    holdPass.hidden = true;
    ripCards.forEach(function (c) { c.style.transform = ''; });
  }
  if (holdBud) {
    holdBud.addEventListener('pointerdown', function (e) {
      if (rm()) { completeHold(); return; }
      e.preventDefault();
      if (hold.done) return;
      hold.tgt = 1; holdWake();
    });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (ev) {
      holdBud.addEventListener(ev, function () { if (!hold.done) { hold.tgt = 0; holdWake(); } });
    });
    holdBud.addEventListener('keydown', function (e) {
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); if (rm()) completeHold(); else { hold.tgt = 1; holdWake(); } }
    });
    holdBud.addEventListener('keyup', function () { if (!hold.done) { hold.tgt = 0; holdWake(); } });
    holdBud.setAttribute('tabindex', '0');
    holdBud.setAttribute('role', 'button');
    holdBud.setAttribute('aria-label', 'Press and hold the ZONIC earbud');
  }

  function splitEl(el, mode) {
    var text = el.textContent.trim();
    var sr = document.createElement('span');
    sr.className = 'sr-only';
    sr.textContent = text;
    el.textContent = '';
    el.appendChild(sr);

    if (mode === 'sharp') {
      var dual = document.createElement('span');
      dual.className = 'dual';
      dual.setAttribute('aria-hidden', 'true');
      var soft = document.createElement('span');
      soft.className = 'soft w-full';
      soft.innerHTML = el.dataset.html || text;
      var sharp = document.createElement('span');
      sharp.className = 'sharp';
      sharp.innerHTML = el.dataset.html || text;
      dual.appendChild(soft); dual.appendChild(sharp);
      el.appendChild(dual);
      return;
    }

    var vis = document.createElement('span');
    vis.setAttribute('aria-hidden', 'true');
    var words = text.split(/\s+/);
    var n = words.length;
    var spread = mode === 'staged' ? 0.55 : 0.5;
    for (var i = 0; i < n; i++) {
      var wsp = document.createElement('span');
      wsp.className = 'w';
      wsp.textContent = words[i];
      var th;
      if (mode === 'scatter') th = (i / n) * 0.45 + rand() * 0.06;
      else th = (i / n) * spread + rand() * 0.05;
      wsp.style.setProperty('--th', th.toFixed(3));
      if (mode === 'scatter') {
        wsp.style.setProperty('--jx', ((rand() * 28 - 14)).toFixed(1) + 'px');
        wsp.style.setProperty('--jy', ((rand() * 20 - 10)).toFixed(1) + 'px');
        wsp.style.setProperty('--jr', ((rand() * 12 - 6)).toFixed(1) + 'deg');
      }
      vis.appendChild(wsp);
      if (i < n - 1) vis.appendChild(document.createTextNode(' '));
    }
    el.appendChild(vis);
  }

  document.querySelectorAll('.split').forEach(function (el) {
    var mode = 'rise';
    if (el.classList.contains('fx-fall')) mode = 'fall';
    else if (el.classList.contains('fx-sharp')) mode = 'sharp';
    else if (el.classList.contains('fx-scatter')) mode = 'scatter';
    else if (el.classList.contains('fx-staged')) mode = 'staged';
    if (mode === 'sharp') el.dataset.html = el.innerHTML;
    splitEl(el, mode);
  });

  function pinToFinalStates() {
    waves.forEach(function (wv) { wv.el.style.setProperty('--d', '0'); wv.d = 0; wv.idle = true; });
    ioEls.forEach(function (el) { el.classList.add('in', 'done'); });
    completeHold();
    document.body.classList.add('paused');
  }
  function unpinFinalStates() {
    wavesReset();
    ioEls.forEach(function (el) {
      el.classList.remove('in', 'done');
      if (el.classList.contains('eq-divider')) delete el.dataset.h;
    });
    resetHold();
    document.body.classList.remove('paused');
  }

  var scrubScrollBound = false;
  function enableScrub() {
    if (scrubOn) return;
    scrubOn = true;
    initHeroOnce();
    if (!scrubScrollBound) { window.addEventListener('scroll', onScroll, { passive: true }); scrubScrollBound = true; }
    bands.forEach(function (b) { b.op = -1; b.k = -1; });
    unpinFinalStates();
    loadStart = performance.now();
    updateCaptions(heroProgress());
    onScroll();
  }
  function disableScrub() {
    if (!scrubOn) return;
    scrubOn = false;
    window.removeEventListener('scroll', onScroll);
    scrubScrollBound = false;
    if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }
  }
  function applyHeroMode() {
    if (GATES.some(function (q) { return window.matchMedia(q).matches; })) disableScrub();
    else enableScrub();
  }
  MQLS.forEach(function (m) { m.addEventListener('change', applyHeroMode); });

  if (window.location.protocol === 'file:') document.documentElement.classList.add('force-static');

  posterLayer.style.backgroundImage = 'url("' + POSTER_URL + '")';

  var heroIO = new IntersectionObserver(function (es) {
    es.forEach(function (e) { heroOnScreen = e.isIntersecting; if (heroOnScreen) wake(); });
  }, { threshold: 0 });
  heroIO.observe(heroSec);

  reduceMQ.addEventListener('change', function (e) {
    if (e.matches) pinToFinalStates();
    else { applyHeroMode(); }
  });

  document.addEventListener('visibilitychange', function () {
    document.body.classList.toggle('paused', document.hidden);
  });

  window.addEventListener('resize', function () { wavesDirty = true; wake(); }, { passive: true });

  applyHeroMode();
})();
