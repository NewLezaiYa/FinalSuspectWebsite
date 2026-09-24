
window.I18N = (function () {
  'use strict';

  var KEY = 'fs.lang';
  var ISSUE_URL = 'https://github.com/NewLezaiYa/FinalSuspectWebsite/issues/new';

  var STRINGS = {
    zh: {
      label: '中文',
      short: '中',
      notice: '',
      noticeEn: '',
      titleEn: '',
      switchTitle: '切换语言'
    },
    en: {
      label: 'English',
      short: 'EN',

      notice: '该页面暂时无英文翻译，如果你愿意贡献翻译，请去 GitHub 打开 issue，' +
        '申请自己愿意为网站添加英文。',

      noticeEn: 'This page is not available in English yet. If you would like to contribute ' +
        'a translation, please open an issue on GitHub and let us know that you are willing ' +
        'to add English to this website.',
      titleEn: 'English translation is not available yet',
      switchTitle: 'Switch language'
    }
  };

  var PLACEHOLDER = true;


  function detect() {
    var saved = null;
    try { saved = localStorage.getItem(KEY); } catch (e) { saved = null; }
    if (saved === 'zh' || saved === 'en') return saved;
    var list = navigator.languages || [navigator.language || 'zh'];
    for (var i = 0; i < list.length; i++) {
      var tag = String(list[i]).toLowerCase();
      if (tag.indexOf('zh') === 0) return 'zh';
      if (tag.indexOf('en') === 0) return 'en';
    }
    return 'zh';
  }

  var lang = detect();

  function t(key) { return (STRINGS[lang] && STRINGS[lang][key]) || STRINGS.zh[key] || ''; }

  function set(next) {
    if (next !== 'zh' && next !== 'en') return;
    lang = next;
    try { localStorage.setItem(KEY, next); } catch (e) {  }
    render();
  }


  function banner() {
    var box = document.getElementById('langNotice');
    if (!box) {
      box = document.createElement('div');
      box.id = 'langNotice';
      box.className = 'lang-notice';
      box.setAttribute('role', 'status');
      box.innerHTML =
        '<span class="lang-notice__icon"><i class="fas fa-language"></i></span>' +
        '<div class="lang-notice__body">' +
          '<strong class="lang-notice__title"></strong>' +
          '<p class="lang-notice__text"></p>' +
          '<p class="lang-notice__text lang-notice__text--en"></p>' +
          '<div class="lang-notice__actions">' +
            '<a class="lang-notice__link" target="_blank" rel="noopener noreferrer"></a>' +
            '<button class="lang-notice__back" type="button"></button>' +
          '</div>' +
        '</div>';
      var anchor = document.body.querySelector('.shell') || document.body.querySelector('main');
      if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(box, anchor);
      else document.body.appendChild(box);
    }

    var title = box.querySelector('.lang-notice__title');
    var zh = box.querySelector('.lang-notice__text:not(.lang-notice__text--en)');
    var en = box.querySelector('.lang-notice__text--en');
    var link = box.querySelector('.lang-notice__link');
    var back = box.querySelector('.lang-notice__back');


    title.textContent = t('titleEn') || 'English translation is not available yet';
    zh.textContent = t('notice');
    en.textContent = t('noticeEn');

    link.href = ISSUE_URL;
    link.innerHTML = '<i class="fa-brands fa-github"></i> 去 GitHub 打开 issue';
    back.textContent = '返回中文';
    if (!back.dataset.bound) {
      back.dataset.bound = '1';
      back.addEventListener('click', function () { set('zh'); });
    }
    return box;
  }

  var noticeBox = null;


  function render() {
    document.documentElement.setAttribute('lang', lang === 'en' ? 'en' : 'zh-CN');

    var showNotice = PLACEHOLDER && lang === 'en';
    if (showNotice) {
      noticeBox = banner();
      noticeBox.classList.add('is-on');
    } else if (noticeBox) {
      noticeBox.classList.remove('is-on');
    }

    document.querySelectorAll('[data-lang-current]').forEach(function (el) {
      el.textContent = t('short');
    });
    document.querySelectorAll('[data-lang-option]').forEach(function (el) {
      var on = el.dataset.langOption === lang;
      el.classList.toggle('is-active', on);
      el.setAttribute('aria-checked', on ? 'true' : 'false');
    });
    var btn = document.querySelector('[data-lang-toggle]');
    if (btn) btn.setAttribute('title', t('switchTitle'));
  }

  return {
    get: function () { return lang; },
    set: set,
    render: render,
    label: function (code) { return (STRINGS[code] || STRINGS.zh).label; },
    strings: STRINGS
  };
})();

(function () {
  function boot() { if (window.I18N) window.I18N.render(); }
  document.addEventListener('shell:ready', boot);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
