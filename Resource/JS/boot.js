/*
 * 首页加载入口：判断是否需要播放开场动画，结束后让页面进入就绪态
 */
(function () {
  'use strict';


  var IMAGES = [
    'Resource/images/FinalSuspect-Logo-Splash.webp',
    'Resource/images/FinalSuspect-BG-XtremeWave-Preview.webp'
  ];

  var SESSION_KEY = 'fs.splashAt';
  var WINDOW_MS = 1000 * 60 * 30;

  function ready() {
    requestAnimationFrame(function () {
      setTimeout(function () { document.body.classList.add('is-ready'); }, 50);
    });
  }

  function revealNow() {
    var overlay = document.getElementById('loadingOverlay');
    if (overlay) {
      overlay.classList.add('hidden');
      setTimeout(function () { overlay.style.display = 'none'; }, 420);
    }
    ready();
  }


  function boot() {
    var overlay = document.getElementById('loadingOverlay');
    if (!overlay || typeof window.SplashIntro === 'undefined') { ready(); return; }


    var navEntry = (performance.getEntriesByType && performance.getEntriesByType('navigation')[0]) || {};
    if (navEntry.type === 'back_forward') { revealNow(); return; }


    var last = 0;
    try { last = parseInt(sessionStorage.getItem(SESSION_KEY) || '0', 10); } catch (e) { last = 0; }
    if (last && Date.now() - last < WINDOW_MS) { revealNow(); return; }
    try { sessionStorage.setItem(SESSION_KEY, String(Date.now())); } catch (e) { }


    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { revealNow(); return; }

    window.SplashIntro.start({
      images: IMAGES,
      onComplete: function () { ready(); }
    });
  }

  /* 等语言文件就绪后再播放开场动画，保证进度文案有翻译可用 */
  function start() {
    if (window.I18N && window.I18N.ready && typeof window.I18N.ready.then === 'function') {
      window.I18N.ready.then(boot, boot);
      return;
    }
    boot();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
