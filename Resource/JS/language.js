
/* FinalSuspect 站点国际化（i18n）运行时
 *
 * 文案统一放在 Resource/lang/ 下：
 *   zh-CN.json  中文文案（当前站点的默认语言，HTML 中的中文作为兜底同步保留）
 *   en-US.json  英文文案（目前留空，未翻译时自动回退到 zh-CN 并提示）
 *
 * HTML 用法：
 *   data-i18n="key"             → 覆盖元素文本（纯文本）
 *   data-i18n-html="key"        → 覆盖元素 innerHTML（文案里含 <strong>/<a>/<code> 等标签时）
 *   data-i18n-placeholder="key" → 覆盖 placeholder 属性，其余支持 title / aria-label / alt / content
 *   key 以 "p." 开头时自动补全为 page.<body[data-page]>.*，例如 p.title
 *
 * JS 用法：
 *   I18N.t('ui.copy')           取文案（支持 {name} 占位符：I18N.t('splash.verify', {done: 3, total: 9})）
 *   I18N.set('en-US')           切换语言（会持久化到 localStorage['fs.lang'] 并重新套用）
 *   I18N.ready                  Promise，首个语言文件加载并套用后 resolve
 *   document.addEventListener('i18n:change', fn)  语言切换后的回调（用于重建动态列表）
 */
window.I18N = (function () {
  'use strict';

  var DEFAULT_LOCALE = 'zh-CN';
  var STORAGE_KEY = 'fs.lang';
  var ATTRS = ['placeholder', 'title', 'aria-label', 'alt', 'content'];

  var LOCALES = [
    { code: 'zh-CN', short: '中', name: '简体中文' },
    { code: 'en-US', short: 'EN', name: 'English' }
  ];

  var ALIAS = {
    zh: 'zh-CN',
    'zh-cn': 'zh-CN',
    'zh-hans': 'zh-CN',
    'zh-hant': 'zh-CN',
    'zh-tw': 'zh-CN',
    'zh-hk': 'zh-CN',
    en: 'en-US',
    'en-us': 'en-US',
    'en-gb': 'en-US'
  };

  var ISSUE_URL = 'https://github.com/NewLezaiYa/FinalSuspectWebsite/issues/new';

  /* 语言文件目录：以 language.js 自身位置解析 ../lang/，页面在任意层级都可用 */
  var BASE = (function () {
    var script = document.currentScript;
    if (!script) {
      var all = document.getElementsByTagName('script');
      for (var i = all.length - 1; i >= 0; i--) {
        if (/language\.js(\?|#|$)/.test(all[i].src || '')) { script = all[i]; break; }
      }
    }
    if (script && script.src) {
      try { return new URL('../lang/', script.src).href; } catch (e) { /* 老浏览器兜底 */ }
    }
    return 'Resource/lang/';
  })();

  var dicts = {};
  var pending = {};
  var locale = detect();
  var effective = DEFAULT_LOCALE;
  var noticeBox = null;

  /* ------------------------------------------------------------------ */
  /* 工具                                                               */
  /* ------------------------------------------------------------------ */
  function warn(msg, err) {
    if (window.console && console.warn) console.warn('[i18n] ' + msg, err || '');
  }

  function normalize(code) {
    if (!code) return null;
    var key = String(code).toLowerCase();
    if (ALIAS[key]) return ALIAS[key];
    for (var i = 0; i < LOCALES.length; i++) {
      if (LOCALES[i].code.toLowerCase() === key) return LOCALES[i].code;
    }
    return null;
  }

  function detect() {
    var saved = null;
    try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) { saved = null; }
    var hit = normalize(saved);
    if (hit) return hit;

    var list = navigator.languages || [navigator.language || DEFAULT_LOCALE];
    for (var i = 0; i < list.length; i++) {
      var tag = String(list[i]).toLowerCase();
      var base = tag.split('-')[0];
      if (base === 'zh') return 'zh-CN';
      if (base === 'en') return 'en-US';
    }
    return DEFAULT_LOCALE;
  }

  function getPath(obj, path) {
    var parts = String(path || '').split('.');
    var cur = obj;
    for (var i = 0; i < parts.length; i++) {
      if (!cur || typeof cur !== 'object') return undefined;
      cur = cur[parts[i]];
    }
    return cur;
  }

  function pageId() {
    return (document.body && document.body.getAttribute('data-page')) || 'home';
  }

  /* 支持 p.xxx 简写：自动加上当前页面命名空间 */
  function fullKey(key) {
    key = String(key || '');
    return key.indexOf('p.') === 0 ? 'page.' + pageId() + '.' + key.slice(2) : key;
  }

  function interpolate(text, params) {
    if (!params) return text;
    return String(text).replace(/\{(\w+)\}/g, function (all, name) {
      return Object.prototype.hasOwnProperty.call(params, name) ? String(params[name]) : all;
    });
  }

  function hasStrings(code) {
    var dict = dicts[code];
    if (!dict) return false;
    for (var k in dict) {
      if (Object.prototype.hasOwnProperty.call(dict, k) && k !== 'meta') return true;
    }
    return false;
  }

  /* ------------------------------------------------------------------ */
  /* 读取语言文件（允许空文件 / 坏 JSON：一律回退成空字典）              */
  /* ------------------------------------------------------------------ */
  function fetchDict(code) {
    if (typeof fetch !== 'function') return Promise.resolve({});
    return fetch(BASE + code + '.json', { cache: 'no-cache' })
      .then(function (res) { return res.ok ? res.text() : ''; })
      .then(function (text) {
        text = String(text || '').trim();
        if (!text) return {};
        try {
          var obj = JSON.parse(text);
          return obj && typeof obj === 'object' ? obj : {};
        } catch (e) {
          warn(code + '.json 解析失败（已当作空文案处理）', e);
          return {};
        }
      })
      .catch(function (err) {
        warn('读取 ' + code + '.json 失败', err);
        return {};
      });
  }

  function loadDict(code) {
    if (dicts[code]) return Promise.resolve(dicts[code]);
    if (pending[code]) return pending[code];
    pending[code] = fetchDict(code).then(function (obj) {
      dicts[code] = obj || {};
      delete pending[code];
      return dicts[code];
    });
    return pending[code];
  }

  /* ------------------------------------------------------------------ */
  /* 取词                                                               */
  /* ------------------------------------------------------------------ */
  function t(key, params, fallback) {
    var path = fullKey(key);
    var value = getPath(dicts[locale], path);
    if (value === undefined || value === null || value === '') {
      value = getPath(dicts[DEFAULT_LOCALE], path);
    }
    if (value === undefined || value === null || value === '') value = fallback;
    if (value === undefined || value === null) return '';
    /* 只有字符串才会被当作文案；指向整个分组时返回空，避免出现 [object Object] */
    return typeof value === 'string' ? interpolate(value, params) : '';
  }

  /* ------------------------------------------------------------------ */
  /* 套用到 DOM                                                         */
  /* ------------------------------------------------------------------ */
  function apply() {
    if (!document.body) return;

    var i;
    var nodes = document.querySelectorAll('[data-i18n]');
    for (i = 0; i < nodes.length; i++) {
      var text = t(nodes[i].getAttribute('data-i18n'));
      if (text) nodes[i].textContent = text;
    }

    nodes = document.querySelectorAll('[data-i18n-html]');
    for (i = 0; i < nodes.length; i++) {
      var html = t(nodes[i].getAttribute('data-i18n-html'));
      if (html) nodes[i].innerHTML = html;
    }

    ATTRS.forEach(function (attr) {
      var list = document.querySelectorAll('[data-i18n-' + attr + ']');
      for (var k = 0; k < list.length; k++) {
        var value = t(list[k].getAttribute('data-i18n-' + attr));
        if (value) list[k].setAttribute(attr, value);
      }
    });

    /* CSS 里的文案（如侧栏“无匹配项”）通过自定义属性下发 */
    var cssNoMatch = t('css.noMatch');
    if (cssNoMatch) {
      document.documentElement.style.setProperty('--i18n-no-match', '"' + String(cssNoMatch).replace(/"/g, '\\"') + '"');
    }

    effective = hasStrings(locale) ? locale : DEFAULT_LOCALE;
    document.documentElement.setAttribute('lang', effective);
    document.documentElement.setAttribute('data-lang', shortLabel(locale));

    markSwitcher();
    renderNotice();
  }

  /* ------------------------------------------------------------------ */
  /* 语言切换器状态                                                     */
  /* ------------------------------------------------------------------ */
  function markSwitcher() {
    document.querySelectorAll('[data-lang-current]').forEach(function (node) {
      node.textContent = shortLabel(locale);
    });
    document.querySelectorAll('[data-lang-option]').forEach(function (node) {
      var on = normalize(node.getAttribute('data-lang-option')) === locale;
      node.classList.toggle('is-active', on);
      node.setAttribute('aria-checked', on ? 'true' : 'false');
    });
    var toggle = document.querySelector('[data-lang-toggle]');
    if (toggle) toggle.setAttribute('title', t('ui.languageToggle', null, '切换语言'));
  }

  /* ------------------------------------------------------------------ */
  /* 未翻译提示（en-US.json 为空时提示去贡献翻译）                      */
  /* ------------------------------------------------------------------ */
  function renderNotice() {
    var show = locale !== DEFAULT_LOCALE && !hasStrings(locale);

    if (!show) {
      if (noticeBox) noticeBox.classList.remove('is-on');
      return;
    }

    if (!noticeBox) {
      noticeBox = document.createElement('div');
      noticeBox.id = 'langNotice';
      noticeBox.className = 'lang-notice';
      noticeBox.setAttribute('role', 'status');
      noticeBox.innerHTML =
        '<span class="lang-notice__icon"><i class="fas fa-language"></i></span>' +
        '<div class="lang-notice__body">' +
        '<strong class="lang-notice__title"></strong>' +
        '<p class="lang-notice__text"></p>' +
        '<p class="lang-notice__text lang-notice__text--en"></p>' +
        '<div class="lang-notice__actions">' +
        '<a class="lang-notice__link" target="_blank" rel="noopener noreferrer">' +
        '<i class="brand-ico brand-ico--github"></i> <span class="lang-notice__link-text"></span></a>' +
        '<button class="lang-notice__back" type="button"></button>' +
        '</div>' +
        '</div>';

      var anchor = document.querySelector('.shell') || document.querySelector('main');
      if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(noticeBox, anchor);
      else document.body.insertBefore(noticeBox, document.body.firstChild);

      var back = noticeBox.querySelector('.lang-notice__back');
      back.addEventListener('click', function () { set(DEFAULT_LOCALE); });
    }

    noticeBox.querySelector('.lang-notice__title').textContent = t('ui.langNoticeTitle', null, '该页面暂时无英文翻译');
    noticeBox.querySelector('.lang-notice__text').textContent = t('ui.langNoticeBody', null, '');
    /* 英文提示直接写在这里：它描述的是“英文文案尚未提供”，本身不属于任何语言字典 */
    noticeBox.querySelector('.lang-notice__text--en').textContent =
      'This page is not available in English yet. ' +
      'If you would like to contribute a translation, please open an issue on GitHub.';
    noticeBox.querySelector('.lang-notice__link-text').textContent = t('ui.langNoticeIssue', null, '去 GitHub 打开 issue');
    noticeBox.querySelector('.lang-notice__back').textContent = t('ui.langNoticeBack', null, '返回中文');
    noticeBox.querySelector('.lang-notice__link').href = ISSUE_URL;
    noticeBox.classList.add('is-on');
  }

  /* ------------------------------------------------------------------ */
  /* 对外 API                                                           */
  /* ------------------------------------------------------------------ */
  function shortLabel(code) {
    for (var i = 0; i < LOCALES.length; i++) {
      if (LOCALES[i].code === code) return LOCALES[i].short;
    }
    return String(code || '').toUpperCase();
  }

  function label(code) {
    var hit = normalize(code) || code;
    for (var i = 0; i < LOCALES.length; i++) {
      if (LOCALES[i].code === hit) {
        var meta = getPath(dicts[hit], 'meta');
        return (meta && meta.name) || LOCALES[i].name;
      }
    }
    return hit;
  }

  function emit() {
    document.dispatchEvent(new CustomEvent('i18n:change', {
      detail: { locale: locale, effective: effective, translated: hasStrings(locale) }
    }));
  }

  function set(code) {
    var next = normalize(code);
    if (!next) return Promise.resolve(locale);
    locale = next;
    try { localStorage.setItem(STORAGE_KEY, next); } catch (e) { /* 隐私模式忽略 */ }

    return loadDict(DEFAULT_LOCALE)
      .then(function () { return next === DEFAULT_LOCALE ? null : loadDict(next); })
      .then(function () {
        apply();
        emit();
        return locale;
      });
  }

  function boot() {
    var chain = loadDict(DEFAULT_LOCALE);
    if (locale !== DEFAULT_LOCALE) {
      chain = chain.then(function () { return loadDict(locale); });
    }
    return chain.then(function () {
      apply();
      emit();
      document.dispatchEvent(new CustomEvent('i18n:ready', {
        detail: { locale: locale, effective: effective }
      }));
      return { locale: locale, effective: effective };
    }).catch(function (err) {
      warn('初始化失败，保持 HTML 中的兜底文案', err);
      return { locale: DEFAULT_LOCALE, effective: DEFAULT_LOCALE };
    });
  }

  var ready = boot();

  document.addEventListener('shell:ready', function () { apply(); });

  return {
    ready: ready,
    t: t,
    apply: apply,
    set: set,
    get: function () { return locale; },
    label: label,
    list: function () { return LOCALES.slice(); }
  };
})();
