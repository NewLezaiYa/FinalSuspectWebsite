/* ============================================================================
 * FinalSuspect Website — fx.js
 * 全站动效引擎（纯原生，无依赖）：
 *   1. 滚动上电（IntersectionObserver 分级揭示 + 阶梯延迟）
 *   2. 3D 倾斜 / 磁吸光标（磁贴、大按钮）
 *   3. 点击涟漪
 *   4. 打字机（hero 指令行）
 *   5. 数值滚动（数据条）
 *   6. 目录平滑滚动 + 滚动进度
 *   7. 图片灯箱
 *   8. 复制按钮 / 错误码复制
 *   9. 开机自检叠层（首次进入）
 *  10. 齿轮联动 / 视差
 * ========================================================================== */
(function () {
  'use strict';

  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ==========================================================================
   * 1. 滚动上电
   * ======================================================================== */
  function initReveal() {
    var nodes = $$('[data-reveal]');
    if (!nodes.length) return;

    if (REDUCED || !('IntersectionObserver' in window)) {
      nodes.forEach(function (n) { n.classList.add('is-in'); });
      return;
    }

    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var n = en.target;
        var delay = parseInt(n.dataset.revealDelay || '0', 10);
        setTimeout(function () { n.classList.add('is-in'); }, delay);
        obs.unobserve(n);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.06 });

    nodes.forEach(function (n) { obs.observe(n); });
  }

  /* 说明：分组阶梯延迟（[data-group]）由 Nav.js 的 bindGroupReveal 统一处理，
     因为 Nav.js 先于 fx.js 执行；此处不再重复实现。 */

  /* ==========================================================================
   * 2. 3D 倾斜 + 磁吸
   * ======================================================================== */
  function initTilt() {
    if (REDUCED) return;
    var MAX = 7;

    $$('.tilt').forEach(function (card) {
      var raf = null;
      var glare = card.querySelector('.tilt__glare');

      function move(e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width;
        var py = (e.clientY - r.top) / r.height;
        var ry = (px - 0.5) * MAX * 2;
        var rx = (0.5 - py) * MAX * 2;
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(function () {
          card.style.setProperty('--rx', rx.toFixed(2) + 'deg');
          card.style.setProperty('--ry', ry.toFixed(2) + 'deg');
          if (glare) {
            card.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
            card.style.setProperty('--my', (py * 100).toFixed(1) + '%');
          }
        });
      }
      function leave() {
        if (raf) cancelAnimationFrame(raf);
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
      }
      card.addEventListener('mousemove', move);
      card.addEventListener('mouseleave', leave);
    });
  }

  /** 磁吸按钮：光标靠近时轻微吸附 */
  function initMagnetic() {
    if (REDUCED) return;
    $$('.btn--magnetic, .fab-main').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        var dx = (e.clientX - (r.left + r.width / 2)) / r.width;
        var dy = (e.clientY - (r.top + r.height / 2)) / r.height;
        b.style.transform = 'translate(' + (dx * 7).toFixed(2) + 'px,' + (dy * 7).toFixed(2) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  /* ==========================================================================
   * 3. 点击涟漪
   * ======================================================================== */
  function initRipple() {
    if (REDUCED) return;
    document.addEventListener('pointerdown', function (e) {
      var host = e.target.closest('.btn, .tile, .rail__link, .topnav__link, .icon-btn, .cmdk__item');
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

  /* ==========================================================================
   * 4. 打字机
   * ======================================================================== */
  function typewriter(node, lines, opts) {
    opts = opts || {};
    var speed = opts.speed || 42;
    var hold = opts.hold || 1800;
    var li = 0, ci = 0, dir = 1;

    node.innerHTML = '<span class="tw"></span><i class="cursor"></i>';
    var out = node.querySelector('.tw');

    function tick() {
      var line = lines[li];
      if (dir === 1) {
        ci++;
        out.textContent = line.slice(0, ci);
        if (ci >= line.length) { dir = -1; return setTimeout(tick, hold); }
        setTimeout(tick, speed + Math.random() * 34);
      } else {
        ci--;
        out.textContent = line.slice(0, ci);
        if (ci <= 0) {
          dir = 1;
          li = (li + 1) % lines.length;
          return setTimeout(tick, 320);
        }
        setTimeout(tick, 18);
      }
    }
    setTimeout(tick, 520);
  }

  function initTyper() {
    var node = $('[data-typer]');
    if (!node) return;
    var lines = (node.dataset.typer || '').split('|').filter(Boolean);
    if (!lines.length) return;
    if (REDUCED) { node.textContent = lines[0]; return; }
    typewriter(node, lines);
  }

  /* ==========================================================================
   * 5. 数值滚动
   * ======================================================================== */
  function initCounters() {
    var nodes = $$('[data-count]');
    if (!nodes.length) return;
    if (REDUCED || !('IntersectionObserver' in window)) {
      nodes.forEach(function (n) { n.textContent = n.dataset.count + (n.dataset.suffix || ''); });
      return;
    }
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var n = en.target;
        obs.unobserve(n);
        var target = parseFloat(n.dataset.count) || 0;
        var suffix = n.dataset.suffix || '';
        var dur = 1100;
        var t0 = performance.now();
        (function step(now) {
          var p = Math.min(1, (now - t0) / dur);
          var eased = 1 - Math.pow(1 - p, 3);
          n.textContent = Math.round(target * eased) + (p === 1 ? suffix : '');
          if (p < 1) requestAnimationFrame(step);
        })(t0);
      });
    }, { threshold: 0.4 });
    nodes.forEach(function (n) { obs.observe(n); });
  }

  /* ==========================================================================
   * 6. 目录平滑滚动 + 阅读进度
   * ======================================================================== */
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
    function upd() {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      var p = h > 0 ? (window.scrollY / h) * 100 : 0;
      bar.style.width = p.toFixed(2) + '%';
    }
    window.addEventListener('scroll', upd, { passive: true });
    window.addEventListener('resize', upd);
    upd();
  }

  /* ==========================================================================
   * 7. 图片灯箱
   * ======================================================================== */
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

  /* ==========================================================================
   * 8. 复制按钮 / 错误码
   * ======================================================================== */
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
      try { document.execCommand('copy'); done(); } catch (e) { /* 忽略 */ }
      ta.remove();
    }
  }

  function initCopy() {
    $$('pre').forEach(function (pre) {
      if (pre.parentNode && pre.parentNode.classList.contains('term__body')) { /* 允许 */ }
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


  /* ==========================================================================
   * 10. 视差 / 齿轮联动
   * ======================================================================== */
  function initParallax() {
    if (REDUCED) return;
    var nodes = $$('[data-parallax]');
    if (!nodes.length) return;
    var ticking = false;
    function upd() {
      var y = window.scrollY;
      nodes.forEach(function (n) {
        var k = parseFloat(n.dataset.parallax) || 0.1;
        n.style.transform = 'translate3d(0,' + (-y * k).toFixed(2) + 'px,0)';
      });
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(upd); }
    }, { passive: true });
    upd();
  }

  /** 齿轮随滚动加速旋转（机械联动感） */
  function initGearLink() {
    if (REDUCED) return;
    var gears = $$('[data-gear]');
    if (!gears.length) return;
    var spin = 0;
    var ticking = false;
    function upd() {
      var y = window.scrollY;
      spin = y * 0.22;
      gears.forEach(function (g, i) {
        var dir = i % 2 ? -1 : 1;
        g.style.transform = 'rotate(' + (spin * dir).toFixed(1) + 'deg)';
      });
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(upd); }
    }, { passive: true });
  }

  /* ==========================================================================
   * 启动
   * ======================================================================== */
  function boot() {
    initReveal();
    initTilt();
    initMagnetic();
    initRipple();
    initTyper();
    initCounters();
    initSmoothAnchors();
    initProgress();
    initLightbox();
    initCopy();
    initParallax();
    initGearLink();
    document.documentElement.classList.add('fx-ready');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
