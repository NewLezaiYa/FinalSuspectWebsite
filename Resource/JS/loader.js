/* ============================================================================
 * FinalSuspect Website — loader.js
 * 启动调度：控制机械启动序列（仅主页）+ 首屏资源预加载
 *   1. 每次会话（30 分钟内）只播放一次，避免反复刷新被打断
 *   2. 后退/前进导航直接跳过，避免"返回还要等动画"
 *   3. 无论是否播放动画，最终都会给 <body> 加 .is-ready 触发首屏入场
 * ========================================================================== */
(function () {
  'use strict';

  /* 首屏需要就绪的资源（相对路径，file:// 与子目录部署都能用）
     只保留真正会显示在首屏的 2 张图。原先 7 张里其余全是首屏之外的大图，
     提前下载只会拖慢首次进入；WebP 小图合计约 210 KB（原 PNG 版本约 12 MB）。 */
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

  /* file:// 下把根相对路径转成页面相对路径 */
  function toUrl(p) {
    return location.protocol === 'file:' ? p : '/' + p.replace(/^\/+/, '');
  }

  function boot() {
    var overlay = document.getElementById('loadingOverlay');
    if (!overlay || typeof window.SplashIntro === 'undefined') { ready(); return; }

    // 后退 / 前进：直接显示页面
    var navEntry = (performance.getEntriesByType && performance.getEntriesByType('navigation')[0]) || {};
    if (navEntry.type === 'back_forward') { revealNow(); return; }

    // 会话内只播一次
    var last = 0;
    try { last = parseInt(sessionStorage.getItem(SESSION_KEY) || '0', 10); } catch (e) { last = 0; }
    if (last && Date.now() - last < WINDOW_MS) { revealNow(); return; }
    try { sessionStorage.setItem(SESSION_KEY, String(Date.now())); } catch (e) { /* 忽略隐私模式 */ }

    // 尊重用户"减少动效"偏好
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { revealNow(); return; }

    window.SplashIntro.start({
      images: IMAGES.map(toUrl),
      onComplete: function () { ready(); }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
