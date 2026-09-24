
(function () {
  'use strict';


  function pageKey() {
    var path = decodeURIComponent(location.pathname).replace(/\\/g, '/');
    var m = path.match(/FinalSuspectWebsite\/(.+)$/i);
    if (m) return m[1];

    var parts = path.split('/').filter(Boolean);
    var idx = parts.lastIndexOf('FinalSuspectWebsite');
    if (idx !== -1) return parts.slice(idx + 1).join('/');
    return parts.slice(-1)[0] || 'index.html';
  }


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

  document.addEventListener('shell:ready', function () { setTimeout(render, 0); });
  window.addEventListener('load', function () { setTimeout(render, 120); });
})();
