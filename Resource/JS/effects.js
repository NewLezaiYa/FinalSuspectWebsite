
(function () {
  'use strict';

  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };


  function rafThrottle(fn) {
    var queued = false;
    var args = null;
    return function () {
      args = arguments;
      if (queued) return;
      queued = true;
      requestAnimationFrame(function () {
        queued = false;
        fn.apply(null, args);
      });
    };
  }


  function initReveal() {
    var nodes = $$('[data-reveal]');
    if (!nodes.length) return;

    var showAll = function () {
      nodes.forEach(function (n) { n.classList.add('is-in'); });
    };

    if (REDUCED || !('IntersectionObserver' in window)) { showAll(); return; }


    document.documentElement.classList.add('fx-reveal');

    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var n = en.target;
        var delay = parseInt(n.dataset.revealDelay || '0', 10);
        obs.unobserve(n);
        if (delay > 0) setTimeout(function () { n.classList.add('is-in'); }, delay);
        else n.classList.add('is-in');
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.04 });

    nodes.forEach(function (n) { obs.observe(n); });


    setTimeout(showAll, 1600);
  }


  function initRipple() {
    if (REDUCED) return;
    document.addEventListener('pointerdown', function (e) {
      var host = e.target.closest('.btn, .rail__link, .topnav__link, .icon-btn, .cmdk__item');
      if (!host) return;
      var r = host.getBoundingClientRect();
      var size = Math.max(r.width, r.height);
      var s = document.createElement('span');
      s.className = 'ripple';
      s.style.width = s.style.height = size + 'px';
      s.style.left = (e.clientX - r.left - size / 2) + 'px';
      s.style.top = (e.clientY - r.top - size / 2) + 'px';
      if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
      host.appendChild(s);
      setTimeout(function () { s.remove(); }, 640);
    }, { passive: true });
  }


  function initSmoothAnchors() {
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute('href').slice(1);
      if (!id) return;
      var t = document.getElementById(id);
      if (!t) return;
      e.preventDefault();
      var top = t.getBoundingClientRect().top + window.scrollY - 78;
      window.scrollTo({ top: top, behavior: REDUCED ? 'auto' : 'smooth' });
      history.replaceState(null, '', '#' + id);
    });
  }


  function initProgress() {
    var bar = $('[data-progress]');
    if (!bar) return;

    var max = 1;
    var measure = function () {
      max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    };
    var upd = rafThrottle(function () {
      var p = (window.scrollY / max) * 100;
      bar.style.width = (p < 0 ? 0 : p > 100 ? 100 : p).toFixed(2) + '%';
    });

    window.addEventListener('scroll', upd, { passive: true });
    window.addEventListener('resize', rafThrottle(measure), { passive: true });
    window.addEventListener('load', measure);
    measure();
    upd();
  }


  function initLightbox() {
    var imgs = $$('[data-zoom] img, .figure img');
    if (!imgs.length) return;

    var box = document.createElement('div');
    box.className = 'cmdk lightbox';
    box.style.placeItems = 'center';
    box.innerHTML =
      '<div style="position:relative;max-width:94vw;max-height:92vh">' +
        '<img alt="" style="max-width:94vw;max-height:88vh;border:1px solid var(--ln-1);border-radius:var(--r-sm);box-shadow:0 40px 100px rgba(0,0,0,.85)">' +
        '<button class="icon-btn" type="button" aria-label="关闭" style="position:absolute;top:-14px;right:-14px;border-radius:50%"><i class="fas fa-xmark"></i></button>' +
      '</div>';
    document.body.appendChild(box);

    var big = box.querySelector('img');
    function close() { box.classList.remove('is-open'); document.documentElement.style.overflow = ''; }
    box.addEventListener('click', function (e) { if (e.target === box || e.target.closest('button')) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });

    imgs.forEach(function (im) {
      im.style.cursor = 'zoom-in';
      im.addEventListener('click', function () {
        big.src = im.currentSrc || im.src;
        big.alt = im.alt || '';
        box.classList.add('is-open');
        document.documentElement.style.overflow = 'hidden';
      });
    });
  }


  function copyText(text, btn, okLabel, idleLabel) {
    var done = function () {
      if (!btn) return;
      var old = btn.textContent;
      btn.textContent = okLabel || '已复制';
      btn.classList.add('copied');
      setTimeout(function () { btn.textContent = idleLabel || old; btn.classList.remove('copied'); }, 1600);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(function () { fallback(); });
    } else fallback();

    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); done(); } catch (e) { }
      ta.remove();
    }
  }

  function initCopy() {
    $$('pre').forEach(function (pre) {
      if (pre.querySelector('.copy-btn')) return;
      var btn = document.createElement('button');
      btn.className = 'copy-btn';
      btn.type = 'button';
      btn.textContent = '复制';
      btn.addEventListener('click', function () {
        var code = pre.querySelector('code');
        copyText(code ? code.textContent : pre.textContent, btn, '已复制', '复制');
      });
      if (getComputedStyle(pre).position === 'static') pre.style.position = 'relative';
      pre.appendChild(btn);
    });

    $$('.error-code').forEach(function (n) {
      n.title = '点击复制错误代码';
      n.addEventListener('click', function () {
        var old = n.textContent;
        copyText(old, null);
        n.textContent = '已复制!';
        n.style.color = 'var(--c-green)';
        setTimeout(function () { n.textContent = old; n.style.color = ''; }, 1400);
      });
    });
  }


  function initHomeMeta() {
    if (document.body.dataset.shell !== 'home') return;
    var list = window.VERSIONS || [];
    var meta = document.getElementById('logMeta');
    if (meta && list.length) meta.textContent = list.length + ' 个版本 · 最新 ' + list[0].version + ' →';
  }


  function boot() {
    initHomeMeta();
    initReveal();
    initRipple();
    initSmoothAnchors();
    initProgress();
    initLightbox();
    initCopy();
    document.documentElement.classList.add('fx-ready');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
