/* ============================================================================
 * FinalSuspect Website — Time.js
 * 页脚"最后更新"时间：读取 last-modified.js 生成的 window.LAST_MODIFIED
 * 页面路径键与 tools/update-last-modified.mjs 输出保持一致（相对仓库根）
 * ========================================================================== */
(function () {
  'use strict';

  /** 当前页面在仓库中的相对路径（如 FinalSuspect/Options/FastBoot.html） */
  function pageKey() {
    var path = decodeURIComponent(location.pathname).replace(/\\/g, '/');
    var m = path.match(/FinalSuspectWebsite\/(.+)$/i);
    if (m) return m[1];
    // file:// 打开时按目录反推
    var parts = path.split('/').filter(Boolean);
    var idx = parts.lastIndexOf('FinalSuspectWebsite');
    if (idx !== -1) return parts.slice(idx + 1).join('/');
    return parts.slice(-1)[0] || 'index.html';
  }

  /** 在 LAST_MODIFIED 中查找：精确 → 去 index.html → 后缀模糊 */
  function lookup(key) {
    var map = window.LAST_MODIFIED;
    if (!map) return null;
    if (map[key]) return map[key];
    var alt = key.replace(/index\.html$/i, 'index.html');
    if (map[alt]) return map[alt];
    var keys = Object.keys(map);
    for (var i = 0; i < keys.length; i++) {
      if (keys[i].toLowerCase() === key.toLowerCase()) return map[keys[i]];
    }
    // 目录首页：FinalSuspect/Options/ ↔ FinalSuspect/Options/index.html
    if (/\/$/.test(key)) {
      var withIndex = key + 'index.html';
      if (map[withIndex]) return map[withIndex];
    }
    return null;
  }

  function localNow() {
    var d = new Date();
    var p = function (n) { return String(n).padStart(2, '0'); };
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) +
      ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
  }

  function render() {
    var nodes = document.querySelectorAll('[data-last-modified], #lastEditTime');
    if (!nodes.length) return;
    var key = pageKey();
    var val = lookup(key) || localNow();
    Array.prototype.forEach.call(nodes, function (n) {
      if (!n.textContent.trim() || n.hasAttribute('data-last-modified')) {
        n.textContent = val;
        n.setAttribute('datetime', val.replace(' ', 'T'));
      }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render);
  else render();
  // 外壳（含页脚）由 Nav.js 注入，可能在 Time.js 之后完成
  document.addEventListener('shell:ready', function () { setTimeout(render, 0); });
  window.addEventListener('load', function () { setTimeout(render, 120); });
})();
