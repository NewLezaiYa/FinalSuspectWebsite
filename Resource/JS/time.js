/*
 * 把 LAST_MODIFIED 表里的时间写回页面上的「更新于」节点
 */
(function () {
  'use strict';

  var SITE_ROOT = (function () {
    var el = document.currentScript;
    var src = (el && el.getAttribute('src')) ||
      (document.querySelector('script[src*="time.js"]') || {}).src || '';
    if (!src) return '';
    var p;
    try { p = decodeURIComponent(new URL(src, location.href).pathname); } catch (e) { return ''; }
    p = String(p).replace(/\\/g, '/');
    var m = p.match(/^(.*\/)Resource\/JS\/time\.js$/i);
    return m ? m[1] : '';
  })();


  function pageKey() {
    var p = decodeURIComponent(location.pathname).replace(/\\/g, '/');
    var key = p;
    if (SITE_ROOT && key.indexOf(SITE_ROOT) === 0) key = key.slice(SITE_ROOT.length);
    else {
      var m = key.match(/FinalSuspectWebsite\/(.*)$/i);
      key = m ? m[1] : key.split('/').filter(Boolean).slice(-1)[0];
    }
    key = key.replace(/^\/+/, '').replace(/\/+$/, '');
    return key || 'index.html';
  }


  function candidates(key) {
    if (/\.html?$/i.test(key)) return [key];
    return [key + '.html', key + '/index.html', key];
  }

  function lookup(key) {
    var map = window.LAST_MODIFIED;
    if (!map) return null;

    var keys = Object.keys(map);
    var cand = candidates(key);
    var c, i, k, lower;

    for (c = 0; c < cand.length; c++) {
      if (map[cand[c]]) return map[cand[c]];
    }
    for (c = 0; c < cand.length; c++) {
      lower = cand[c].toLowerCase();
      for (i = 0; i < keys.length; i++) {
        if (keys[i].toLowerCase() === lower) return map[keys[i]];
      }
    }
    for (c = 0; c < cand.length; c++) {
      lower = cand[c].toLowerCase();
      for (i = 0; i < keys.length; i++) {
        k = keys[i].toLowerCase();
        if (k.slice(-lower.length - 1) === '/' + lower) return map[keys[i]];
      }
    }
    return null;
  }

  function render() {
    var nodes = document.querySelectorAll('[data-last-modified], #lastEditTime');
    if (!nodes.length) return;
    var key = pageKey();
    var val = lookup(key);
    if (!val) {
      if (window.console && console.warn) {
        console.warn('[time] 未匹配到更新时间 · key=' + key +
          ' · LAST_MODIFIED=' + (window.LAST_MODIFIED ? '已加载' : '未加载') +
          ' · pathname=' + location.pathname);
      }
      return;
    }
    Array.prototype.forEach.call(nodes, function (n) {
      if (!n.textContent.trim() || n.hasAttribute('data-last-modified')) {
        n.textContent = val;
        n.setAttribute('datetime', val.replace(' ', 'T'));
      }
    });
  }

  render();
  document.addEventListener('DOMContentLoaded', render);
  document.addEventListener('shell:ready', function () { setTimeout(render, 0); });
  window.addEventListener('load', function () { setTimeout(render, 120); });
})();
