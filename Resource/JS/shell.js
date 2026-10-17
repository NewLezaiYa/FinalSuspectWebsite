/*
 * 站点框架：根据 body[data-shell] 生成顶栏、侧栏、面包屑、目录、页脚、搜索与弹窗
 */

(function () {
  'use strict';

  // 低配设备自动降级：关掉无限循环动画与毛玻璃，显著降低常驻 CPU / GPU 占用
  // 手动覆盖：localStorage['fs.lowfx'] = '1' 强制开启 / '0' 强制关闭
  (function applyLowFx() {
    var saved = null;
    try { saved = localStorage.getItem('fs.lowfx'); } catch (e) { }
    var auto = ((navigator.hardwareConcurrency || 8) <= 4) || ((navigator.deviceMemory || 8) <= 4);
    var low = saved === '1' ? true : (saved === '0' ? false : auto);
    if (low) document.documentElement.setAttribute('data-lowfx', '1');
  })();


  /* 站点结构：名称与描述全部来自 Resource/lang/<locale>.json 的 nav.* */
  var SITE_NAV = [
    {
      id: 'start', icon: 'fa-flag-checkered', top: true, items: [
        { id: 'intro', href: 'FinalSuspect/Introduction.html', icon: 'fa-book-open' },
        { id: 'faq', href: 'FinalSuspect/FAQ.html', icon: 'fa-life-ring' },
        { id: 'keyboard', href: 'FinalSuspect/Keyboard.html', icon: 'fa-keyboard' }
      ]
    },
    {
      id: 'guide', icon: 'fa-graduation-cap', href: 'FinalSuspect/Guide/index.html', items: [
        { id: 'installation', href: 'FinalSuspect/Guide/Installation.html', icon: 'fa-download' },
        { id: 'update', href: 'FinalSuspect/Guide/Update.html', icon: 'fa-rotate' },
        { id: 'outputlog', href: 'FinalSuspect/Guide/OutputLog.html', icon: 'fa-file-export' }
      ]
    },
    {
      id: 'options', icon: 'fa-sliders', href: 'FinalSuspect/Options/index.html', items: [
        { id: 'opt-autoendgame', href: 'FinalSuspect/Options/AutoEndGame.html', icon: 'fa-flag-checkered' },
        { id: 'opt-autostartgame', href: 'FinalSuspect/Options/AutoStartGame.html', icon: 'fa-users-cog' },
        { id: 'opt-enablefac', href: 'FinalSuspect/Options/EnableFAC.html', icon: 'fa-shield-halved' },
        { id: 'opt-disablevanillasound', href: 'FinalSuspect/Options/DisableVanillaSound.html', icon: 'fa-volume-xmark' },
        { id: 'opt-fastboot', href: 'FinalSuspect/Options/FastBoot.html', icon: 'fa-bolt' },
        { id: 'opt-kickfriendcode', href: 'FinalSuspect/Options/KickPlayerWithAbnormalFriendCode.html', icon: 'fa-user-xmark' },
        { id: 'opt-kickbanlist', href: 'FinalSuspect/Options/KickPlayerInBanList.html', icon: 'fa-ban' },
        { id: 'opt-kickdenyname', href: 'FinalSuspect/Options/KickPlayerWithDenyName.html', icon: 'fa-user-slash' },
        { id: 'opt-offlinemode', href: 'FinalSuspect/Options/OfflineMode.html', icon: 'fa-plug-circle-xmark' },
        { id: 'opt-showplayerinfo', href: 'FinalSuspect/Options/ShowPlayerInfo.html', icon: 'fa-id-card' },
        { id: 'opt-spamdenyword', href: 'FinalSuspect/Options/SpamDenyWord.html', icon: 'fa-comment-slash' },
        { id: 'opt-switchoutfit', href: 'FinalSuspect/Options/SwitchOutfitType.html', icon: 'fa-shirt' },
        { id: 'opt-unlockfps', href: 'FinalSuspect/Options/UnlockFPS.html', icon: 'fa-gauge-high' },
        { id: 'opt-usemodcursor', href: 'FinalSuspect/Options/UseModCursor.html', icon: 'fa-arrow-pointer' }
      ]
    },
    {
      id: 'features', icon: 'fa-toolbox', href: 'FinalSuspect/Features/index.html', items: [
        { id: 'feat-clearautologs', href: 'FinalSuspect/Features/ClearAutoLogs.html', icon: 'fa-trash-can' },
        { id: 'feat-dumplog', href: 'FinalSuspect/Features/DumpLog.html', icon: 'fa-file-code' },
        { id: 'feat-mainmenustyle', href: 'FinalSuspect/Features/MainMenuStyleManager.html', icon: 'fa-palette' },
        { id: 'feat-mymusic', href: 'FinalSuspect/Features/MyMusic.html', icon: 'fa-music' },
        { id: 'feat-nametag', href: 'FinalSuspect/Features/NameTagManager.html', icon: 'fa-tags' },
        { id: 'feat-resourcemanager', href: 'FinalSuspect/Features/ResourceManager.html', icon: 'fa-folder-tree' },
        { id: 'feat-unloadmod', href: 'FinalSuspect/Features/UnloadMod.html', icon: 'fa-toggle-on' }
      ]
    },
    {
      id: 'logs', icon: 'fa-code-branch', items: [
        { id: 'changelog', href: 'FinalSuspect/Changelog.html', icon: 'fa-clock-rotate-left' }
      ]
    }
  ];


  var THEME_KEY = 'fs.theme';
  var THEME_META = { dark: '#030308', light: '#eef1f7' };


  function applyTheme(name) {
    var light = name === 'light';
    if (light) document.documentElement.setAttribute('data-theme', 'light');
    else document.documentElement.removeAttribute('data-theme');
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', light ? THEME_META.light : THEME_META.dark);
    return light ? 'light' : 'dark';
  }


  function currentTheme() {
    try { return localStorage.getItem(THEME_KEY) === 'light' ? 'light' : 'dark'; } catch (e) { return 'dark'; }
  }


  function buildThemeSwitch() {
    var wrap = el('div', 'theme-switch');
    var btn = el('button', 'theme-switch__btn');
    btn.type = 'button';
    btn.id = 'themeToggle';
    bindAttr(btn, 'aria-label', 'ui.themeToggle');
    btn.innerHTML = '<i class="fas fa-sun"></i><i class="fas fa-moon"></i>';

    btn.addEventListener('click', function () {
      var next = currentTheme() === 'light' ? 'dark' : 'light';
      try { localStorage.setItem(THEME_KEY, next); } catch (e) { }
      applyTheme(next);
      document.dispatchEvent(new CustomEvent('theme:change', { detail: { theme: next } }));
    });

    wrap.appendChild(btn);
    return wrap;
  }


  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }


  /* ---- 国际化辅助：文案统一来自 Resource/lang/<locale>.json ---- */
  function t(key, params, fallback) {
    if (window.I18N && window.I18N.t) {
      var value = window.I18N.t(key, params, fallback);
      if (value) return value;
    }
    return fallback || '';
  }

  function navName(id) { return t('nav.pages.' + id + '.name'); }
  function navDesc(id) { return t('nav.pages.' + id + '.desc'); }
  function groupName(id) { return t('nav.groups.' + id + '.name'); }

  /* 写入文案的同时登记 data-i18n，切换语言时由 I18N.apply() 统一刷新 */
  function bindText(node, key, params) {
    if (!node || !key) return node;
    node.setAttribute('data-i18n', key);
    var value = t(key, params);
    if (value) node.textContent = value;
    return node;
  }

  function bindAttr(node, attr, key) {
    if (!node || !key) return node;
    node.setAttribute('data-i18n-' + attr, key);
    var value = t(key);
    if (value) node.setAttribute(attr, value);
    return node;
  }

  function normPath(p) {
    p = String(p || '').replace(/\\/g, '/');
    p = p.replace(/^.*?\/FinalSuspectWebsite\//i, '');
    p = p.replace(/^\/+/, '');
    p = p.replace(/index\.html?$/i, '');
    return p.replace(/\/+$/, '').toLowerCase();
  }

  function findCurrent() {
    var here = normPath(location.pathname);
    for (var g = 0; g < SITE_NAV.length; g++) {
      var items = SITE_NAV[g].items || [];
      for (var i = 0; i < items.length; i++) {
        if (normPath(items[i].href) === here || (items[i].id === document.body.dataset.page)) {
          return { group: SITE_NAV[g], item: items[i] };
        }
      }
    }

    for (var g2 = 0; g2 < SITE_NAV.length; g2++) {
      if (SITE_NAV[g2].href && normPath(SITE_NAV[g2].href) === here) {
        return {
          group: SITE_NAV[g2],
          item: {
            id: SITE_NAV[g2].id + '-index',
            name: groupName(SITE_NAV[g2].id) + t('ui.overviewSuffix'),
            href: SITE_NAV[g2].href
          },
          isIndex: true
        };
      }
    }
    return null;
  }

  function pageDepth() {
    var parts = normPath(location.pathname).split('/').filter(Boolean);
    if (parts.length && /\.html?$/i.test(parts[parts.length - 1])) parts.pop();
    return parts.length;
  }


  function href(h) {
    if (/^https?:/i.test(h) || h.charAt(0) === '#') return h;
    var clean = String(h).replace(/^\/+/, '');
    var depth = pageDepth();
    return depth > 0 ? '../'.repeat(depth) + clean : clean;
  }


  function buildTopbar(cur, mode) {
    var bar = el('header', 'topbar');
    bar.id = 'topbar';


    var progress = el('div', 'read-progress');
    progress.setAttribute('data-progress', '');
    bar.appendChild(progress);

    var inner = el('div', 'topbar__inner');


    var brand = el('a', 'brand');
    brand.href = href('index.html');
    bindAttr(brand, 'aria-label', 'ui.brandHome');

    brand.innerHTML =
      '<span class="brand__mark">' +
      '<svg viewBox="0 0 40 40" aria-hidden="true">' +
      '<defs>' +
      '<linearGradient id="bmGrad" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0%" stop-color="#00f0ff"/>' +
      '<stop offset="55%" stop-color="#14e0c8"/>' +
      '<stop offset="100%" stop-color="#b44dff"/>' +
      '</linearGradient>' +
      '</defs>' +
      '<circle class="bm-ring" cx="20" cy="20" r="18.5" fill="none" stroke="rgba(0,240,255,.5)"' +
      ' stroke-width="1" stroke-dasharray="4 5"/>' +
      '<circle class="bm-ring bm-ring--rev" cx="20" cy="20" r="15" fill="none" stroke="rgba(255,45,149,.35)"' +
      ' stroke-width=".8" stroke-dasharray="2 7"/>' +
      '<path class="bm-hex" d="M20 4 L33 11.5 L33 28.5 L20 36 L7 28.5 L7 11.5 Z"/>' +
      '<text class="bm-text" x="20" y="24.5" text-anchor="middle">FS</text>' +
      '</svg>' +
      '</span>' +
      '<span class="brand__text">FinalSuspect</span>';
    inner.appendChild(brand);


    var nav = el('nav', 'topnav');
    bindAttr(nav, 'aria-label', 'ui.mainNav');

    var homeLink = el('a', 'topnav__link');
    bindText(homeLink, 'ui.home');
    homeLink.href = href('index.html');
    if (mode === 'home') homeLink.setAttribute('aria-current', 'page');
    nav.appendChild(homeLink);

    SITE_NAV.forEach(function (g) {
      if (g.id === 'logs') return;
      var target = g.href || (g.items && g.items[0] && g.items[0].href);
      if (!target) return;
      var a = el('a', 'topnav__link');
      bindText(a, 'nav.groups.' + g.id + '.name');
      a.href = href(target);
      if (cur && cur.group && cur.group.id === g.id) a.setAttribute('aria-current', 'page');
      nav.appendChild(a);
    });


    var logLink = el('a', 'topnav__link topnav__link--accent');
    bindText(logLink, 'nav.groups.logs.name');
    logLink.href = href('FinalSuspect/Changelog.html');
    if (cur && cur.group && cur.group.id === 'logs') logLink.setAttribute('aria-current', 'page');
    nav.appendChild(logLink);

    inner.appendChild(nav);


    var actions = el('div', 'topbar__actions');

    var hamburger = el('button', 'icon-btn hamburger', '<i class="fas fa-bars"></i>');
    hamburger.type = 'button';
    hamburger.id = 'railToggle';
    bindAttr(hamburger, 'aria-label', 'ui.openNav');
    hamburger.setAttribute('aria-expanded', 'false');
    actions.appendChild(hamburger);

    var cmdBtn = el('button', 'cmdk-trigger');
    cmdBtn.type = 'button';
    cmdBtn.id = 'cmdkTrigger';
    cmdBtn.innerHTML = '<i class="fas fa-magnifying-glass"></i>' +
      '<span data-i18n="ui.searchTrigger"></span>' +
      '<span class="cmdk-trigger__keys"><kbd>Ctrl</kbd><kbd>K</kbd></span>';
    actions.appendChild(cmdBtn);

    actions.appendChild(buildThemeSwitch());
    actions.appendChild(buildLangSwitch());

    inner.appendChild(actions);
    bar.appendChild(inner);
    document.body.insertBefore(bar, document.body.firstChild);
    return bar;
  }


  function buildLangSwitch() {
    var wrap = el('div', 'lang-switch');
    var cur = (window.I18N && window.I18N.get()) || 'zh-CN';
    var locales = (window.I18N && window.I18N.list) ? window.I18N.list() : [{ code: 'zh-CN', short: '中', name: '简体中文' }];

    var btn = el('button', 'lang-switch__btn');
    btn.type = 'button';
    btn.setAttribute('data-lang-toggle', '');
    btn.setAttribute('aria-haspopup', 'true');
    btn.setAttribute('aria-expanded', 'false');
    bindAttr(btn, 'title', 'ui.languageToggle');
    btn.innerHTML =
      '<i class="fas fa-language"></i>' +
      '<span class="lang-switch__cur" data-lang-current></span>' +
      '<i class="fas fa-chevron-down lang-switch__caret"></i>';

    var menu = el('div', 'lang-switch__menu');
    menu.setAttribute('role', 'menu');
    locales.forEach(function (loc) {
      var label = (window.I18N && window.I18N.label(loc.code)) || loc.name;
      var item = el('button', 'lang-switch__item' + (loc.code === cur ? ' is-active' : ''));
      item.type = 'button';
      item.setAttribute('role', 'menuitemradio');
      item.setAttribute('data-lang-option', loc.code);
      item.setAttribute('aria-checked', loc.code === cur ? 'true' : 'false');
      item.innerHTML =
        '<span class="lang-switch__dot"></span>' +
        '<span>' + esc(label) + '</span>' +
        '<span class="lang-switch__code">' + esc(loc.code.toUpperCase()) + '</span>';
      item.addEventListener('click', function (e) {
        e.stopPropagation();
        if (window.I18N) window.I18N.set(loc.code);
        close();
      });
      menu.appendChild(item);
    });

    wrap.appendChild(btn);
    wrap.appendChild(menu);

    function open() { wrap.classList.add('is-open'); btn.setAttribute('aria-expanded', 'true'); }
    function close() { wrap.classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false'); }

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      wrap.classList.contains('is-open') ? close() : open();
    });
    document.addEventListener('click', function (e) {
      if (!wrap.contains(e.target)) close();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });

    return wrap;
  }


  function buildRail(cur) {
    var aside = el('aside', 'shell__rail');
    aside.id = 'siteRail';
    var rail = el('div', 'rail');


    var filter = el('div', 'rail__filter');
    var input = el('input');
    input.type = 'search';
    input.id = 'railFilter';
    bindAttr(input, 'placeholder', 'ui.railFilter');
    bindAttr(input, 'aria-label', 'ui.railFilterLabel');
    filter.appendChild(input);
    rail.appendChild(filter);

    var openId = (cur && cur.group) ? cur.group.id : null;
    if (document.body.dataset.rail) openId = document.body.dataset.rail;


    var topItems = [];
    SITE_NAV.forEach(function (g) {
      if (g.top && g.items) topItems = topItems.concat(g.items);
    });
    if (topItems.length) {
      var topBox = el('div', 'rail__top');
      topItems.forEach(function (it) {
        var a = el('a', 'rail__link rail__link--top');
        a.href = href(it.href);
        a.dataset.id = it.id;
        a.setAttribute('data-desc', navDesc(it.id));
        a.innerHTML = '<i class="fas ' + esc(it.icon || 'fa-file') + '"></i><span></span>';
        bindText(a.querySelector('span'), 'nav.pages.' + it.id + '.name');
        if (cur && cur.item && cur.item.id === it.id) a.setAttribute('aria-current', 'page');
        topBox.appendChild(a);
      });
      rail.appendChild(topBox);
    }

    SITE_NAV.forEach(function (g) {
      if (g.top) return;
      var group = el('div', 'rail__group');
      group.dataset.open = (openId === g.id) ? 'true' : 'false';
      group.dataset.group = g.id;
      var isLink = !!g.href;
      var head = el(isLink ? 'a' : 'button', 'rail__group-title');
      if (isLink) head.href = href(g.href);
      else head.type = 'button';
      head.innerHTML =
        '<i class="fas ' + esc(g.icon || 'fa-folder') + '"></i>' +
        '<span></span>' +
        (g.items ? '<span class="rail__count">' + g.items.length + '</span>' : '') +
        (g.items ? '<i class="fas fa-chevron-down caret"></i>' : '');
      bindText(head.querySelector('span'), 'nav.groups.' + g.id + '.name');
      if (!isLink) {
        head.setAttribute('aria-expanded', group.dataset.open === 'true' ? 'true' : 'false');
        head.addEventListener('click', function () {
          var open = group.dataset.open === 'true';
          group.dataset.open = open ? 'false' : 'true';
          head.setAttribute('aria-expanded', open ? 'false' : 'true');
        });
      }
      group.appendChild(head);

      if (g.items) {
        var list = el('div', 'rail__list');
        g.items.forEach(function (it) {
          var a = el('a', 'rail__link');
          a.href = href(it.href);
          a.dataset.id = it.id;
          a.setAttribute('data-desc', navDesc(it.id));
          a.innerHTML = '<span></span>';
          bindText(a.querySelector('span'), 'nav.pages.' + it.id + '.name');
          if (cur && cur.item && cur.item.id === it.id) a.setAttribute('aria-current', 'page');
          list.appendChild(a);
        });

        if (g.id === 'logs' && window.ChangelogSource) {
          window.ChangelogSource.list().forEach(function (v) {
            var sub = el('a', 'rail__sub');
            sub.href = href('FinalSuspect/Changelog.html') + '#' + v.id;
            sub.innerHTML = '<span>v' + esc(v.version) + '</span>' +
              '<b style="margin-left:auto">' + esc(v.date) + '</b>';
            list.appendChild(sub);
          });
        }
        group.appendChild(list);
      }
      rail.appendChild(group);
    });

    aside.appendChild(rail);


    var scrim = el('div', 'rail-scrim');
    scrim.id = 'railScrim';
    document.body.appendChild(scrim);


    input.addEventListener('input', function () {
      var q = input.value.trim().toLowerCase();
      filter.classList.toggle('is-empty', false);
      var anyVisible = false;
      SITE_NAV.forEach(function (g) {
        var group = rail.querySelector('.rail__group[data-group="' + g.id + '"]');
        if (!group) return;
        var links = group.querySelectorAll('.rail__link');
        var groupHit = !q;
        links.forEach(function (a) {
          var hay = ((a.textContent || '') + ' ' + (a.getAttribute('data-desc') || '')).toLowerCase();
          var hit = !q || hay.indexOf(q) !== -1;
          a.classList.toggle('rail__link--hidden', !hit);
          if (hit) groupHit = true;
        });

        var headLabel = group.querySelector('.rail__group-title span');
        if (q && headLabel && headLabel.textContent.toLowerCase().indexOf(q) !== -1) {
          groupHit = true;
          links.forEach(function (a) { a.classList.remove('rail__link--hidden'); });
        }
        group.style.display = groupHit ? '' : 'none';
        if (groupHit) {
          anyVisible = true;
          if (q) group.dataset.open = 'true';
        }
      });
      filter.classList.toggle('is-empty', !anyVisible);
    });

    return aside;
  }


  function buildCrumbs(cur) {
    var nav = el('nav', 'crumbs');
    bindAttr(nav, 'aria-label', 'ui.breadcrumb');
    var html = '<a href="' + href('index.html') + '"><i class="fas fa-house"></i> <span data-i18n="ui.home"></span></a>';
    if (cur && cur.group) {
      var groupKey = 'nav.groups.' + cur.group.id + '.name';
      if (cur.group.href) {
        html += '<span class="crumbs__sep">▸</span><a href="' + href(cur.group.href) + '"><span data-i18n="' + groupKey + '"></span></a>';
      } else {
        html += '<span class="crumbs__sep">▸</span><span data-i18n="' + groupKey + '"></span>';
      }
      if (cur.item && !cur.isIndex) {
        html += '<span class="crumbs__sep">▸</span><span aria-current="page" data-i18n="nav.pages.' + esc(cur.item.id) + '.name"></span>';
      }
    }
    nav.innerHTML = html;
    return nav;
  }


  function buildToc(main) {
    if (document.body.dataset.toc === 'off') return null;
    var heads = main.querySelectorAll('.sec-title, .sub-title, h2[id], h3[id]');
    if (heads.length < 3) return null;

    var aside = el('aside', 'shell__toc');
    var toc = el('nav', 'toc');
    bindAttr(toc, 'aria-label', 'ui.tocLabel');
    var list = el('div', 'toc__list');

    heads.forEach(function (h, i) {
      if (!h.id) h.id = 'sec-' + (i + 1) + '-' + Math.random().toString(36).slice(2, 6);
      var lvl = h.classList.contains('sub-title') ? 3 : 2;
      var a = el('a', 'toc__link' + (lvl === 3 ? ' toc__link--h3' : ''));
      a.href = '#' + h.id;
      a.textContent = h.textContent.trim().replace(/^\d+\s*/, '');
      a.dataset.target = h.id;
      list.appendChild(a);
    });

    toc.innerHTML = '<div class="toc__title"><i class="fas fa-list-ul"></i> <span data-i18n="ui.tocTitle"></span></div>';
    toc.appendChild(list);



    aside.appendChild(toc);


    var links = list.querySelectorAll('.toc__link');

    /* 切换语言后，标题文字变了，目录项跟着刷新 */
    document.addEventListener('i18n:change', function () {
      links.forEach(function (l) {
        var h = document.getElementById(l.dataset.target);
        if (h) l.textContent = h.textContent.trim().replace(/^\d+\s*/, '');
      });
    });

    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (l) { l.classList.toggle('is-active', l.dataset.target === en.target.id); });
      });
    }, { rootMargin: '-20% 0px -70% 0px', threshold: 0 });
    heads.forEach(function (h) { obs.observe(h); });

    return aside;
  }


  function buildLegal() {
    var bar = el('footer', 'legal-bar');
    bar.innerHTML =
      '<span class="legal-bar__copy" data-i18n-html="ui.legalCopy"></span>' +
      '<span class="legal-bar__note" data-i18n-html="ui.legalNote"></span>';

    var anchor = document.querySelector('.shell') || document.querySelector('main');
    if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(bar, anchor.nextSibling);
    else document.body.appendChild(bar);
    return bar;
  }


  function buildDock() {
    var dock = el('div', 'dock');


    var top = el('button', 'dock__btn dock__btn--top');
    top.type = 'button';
    bindAttr(top, 'aria-label', 'ui.backToTop');
    top.innerHTML =
      '<svg class="dock__ring" viewBox="0 0 44 44" aria-hidden="true">' +
      '<circle class="dock__ring-bg" cx="22" cy="22" r="20" fill="none" stroke-width="2"/>' +
      '<circle class="dock__ring-fg" cx="22" cy="22" r="20" fill="none" stroke-width="2"' +
      ' stroke-dasharray="125.6" stroke-dashoffset="125.6"/>' +
      '</svg>' +
      '<i class="fas fa-arrow-up"></i>';
    dock.appendChild(top);


    var love = el('button', 'dock__btn dock__btn--love');
    love.type = 'button';
    love.id = 'openAppreciate';
    bindAttr(love, 'aria-label', 'ui.appreciate');
    love.innerHTML = '<i class="fas fa-heart"></i><span class="dock__pulse"></span>';
    dock.appendChild(love);

    document.body.appendChild(dock);

    var ring = top.querySelector('.dock__ring-fg');
    var CIRC = 125.6;
    var ticking = false;
    var max = 1;
    function measure() { // 缓存可滚动距离，避免每次滚动强制同步布局
      max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    }
    function update() {
      var y = window.scrollY || window.pageYOffset || 0;
      var p = Math.min(1, y / max);
      if (ring) ring.setAttribute('stroke-dashoffset', String(CIRC * (1 - p)));
      top.classList.toggle('is-on', y > 300);
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    window.addEventListener('resize', function () { measure(); update(); }, { passive: true });
    window.addEventListener('load', measure, { passive: true });
    measure();
    update();

    top.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    return dock;
  }


  function buildCmdk() {
    var wrap = el('div', 'cmdk');
    wrap.id = 'cmdk';
    wrap.innerHTML =
      '<div class="cmdk__panel" role="dialog" aria-modal="true" data-i18n-aria-label="ui.searchTitle">' +
      '<div class="cmdk__head">' +
      '<i class="fas fa-magnifying-glass"></i>' +
      '<input class="cmdk__input" id="cmdkInput" type="text" autocomplete="off"' +
      ' data-i18n-placeholder="ui.searchPlaceholder" data-i18n-aria-label="ui.searchTitle">' +
      '<kbd>ESC</kbd>' +
      '</div>' +
      '<div class="cmdk__list" id="cmdkList"></div>' +
      '</div>';
    document.body.appendChild(wrap);

    var input = wrap.querySelector('#cmdkInput');
    var list = wrap.querySelector('#cmdkList');

    function flatItems() {
      var flat = [];
      SITE_NAV.forEach(function (g) {
        (g.items || []).forEach(function (it) {
          flat.push({
            group: groupName(g.id),
            name: navName(it.id),
            href: it.href,
            icon: it.icon,
            desc: navDesc(it.id)
          });
        });
      });
      flat.push({
        group: t('ui.cmdkHomeGroup'),
        name: t('ui.cmdkHomeName'),
        href: 'index.html',
        icon: 'fa-house',
        desc: t('ui.cmdkHomeDesc')
      });
      return flat;
    }

    var activeIdx = 0;
    var shown = [];

    function render(q) {
      q = (q || '').trim().toLowerCase();
      shown = flatItems().filter(function (it) {
        if (!q) return true;
        return (it.name + ' ' + it.desc + ' ' + it.group).toLowerCase().indexOf(q) !== -1;
      }).slice(0, 40);
      activeIdx = 0;
      if (!shown.length) {
        list.innerHTML = '<div class="cmdk__empty" data-i18n="ui.searchEmpty">' + esc(t('ui.searchEmpty')) + '</div>';
        return;
      }
      var html = '';
      var lastGroup = null;
      shown.forEach(function (it, i) {
        if (it.group !== lastGroup) {
          html += '<div class="cmdk__group-label">' + esc(it.group) + '</div>';
          lastGroup = it.group;
        }
        html += '<a class="cmdk__item' + (i === 0 ? ' is-active' : '') + '" href="' + href(it.href) + '" data-i="' + i + '">' +
          '<i class="fas ' + esc(it.icon || 'fa-file') + '"></i>' +
          '<b>' + esc(it.name) + '</b>' +
          (it.desc ? '<small>' + esc(it.desc) + '</small>' : '') +
          '</a>';
      });
      list.innerHTML = html;
    }

    function setActive(i) {
      var items = list.querySelectorAll('.cmdk__item');
      if (!items.length) return;
      activeIdx = (i + items.length) % items.length;
      items.forEach(function (n, k) { n.classList.toggle('is-active', k === activeIdx); });
      var cur = items[activeIdx];
      if (cur && cur.scrollIntoView) cur.scrollIntoView({ block: 'nearest' });
    }

    function open() {
      wrap.classList.add('is-open');
      render('');
      input.value = '';
      setTimeout(function () { input.focus(); }, 60);
    }
    function close() { wrap.classList.remove('is-open'); }

    input.addEventListener('input', function () { render(input.value); });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setActive(activeIdx + 1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(activeIdx - 1); }
      else if (e.key === 'Enter') {
        e.preventDefault();
        var items = list.querySelectorAll('.cmdk__item');
        if (items[activeIdx]) location.href = items[activeIdx].getAttribute('href');
      } else if (e.key === 'Escape') { close(); }
    });
    wrap.addEventListener('click', function (e) {
      if (e.target === wrap) close();
      if (e.target.closest('.cmdk__item')) close();
    });

    document.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); open(); }
      if (e.key === 'Escape') close();
      if (e.key === '/' && !/input|textarea/i.test(document.activeElement.tagName)) { e.preventDefault(); open(); }
    });
    var trigger = document.getElementById('cmdkTrigger');
    if (trigger) trigger.addEventListener('click', open);

    document.addEventListener('i18n:change', function () {
      if (wrap.classList.contains('is-open')) render(input.value);
    });

    return wrap;
  }


  function buildAppreciate() {
    var m = el('div', 'cmdk');
    m.id = 'appreciateModal';
    m.innerHTML =
      '<div class="cmdk__panel" style="max-width:400px;text-align:center">' +
      '<div class="cmdk__head"><i class="brand-ico brand-ico--wechat" style="color:#09bb07"></i>' +
      '<b style="flex:1;font-family:var(--f-display);letter-spacing:.06em" data-i18n="ui.appreciateTitle"></b>' +
      '<button class="icon-btn" type="button" id="apprClose" data-i18n-aria-label="ui.close" style="width:32px;height:32px"><i class="fas fa-xmark"></i></button></div>' +
      '<div style="padding:var(--s-5)">' +
      '<p style="color:var(--t2);font-size:var(--fs-sm);margin-bottom:var(--s-4)" data-i18n="ui.appreciateDesc"></p>' +
      '<div style="background:#fff;padding:10px;border-radius:8px;display:inline-block">' +
      '<img src="' + href('Resource/images/Appreciate_Slok.webp') + '" data-i18n-alt="ui.appreciateAlt" width="200" height="200" loading="lazy" decoding="async" style="width:200px;height:200px">' +
      '</div>' +
      '<p style="color:var(--t4);font-size:var(--fs-xs);margin-top:var(--s-4)" data-i18n="ui.appreciateNote"></p>' +
      '</div>' +
      '</div>';
    document.body.appendChild(m);
    function close() { m.classList.remove('is-open'); }
    m.addEventListener('click', function (e) { if (e.target === m) close(); });
    m.querySelector('#apprClose').addEventListener('click', close);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    document.addEventListener('click', function (e) {
      if (e.target.closest('#openAppreciate')) m.classList.add('is-open');
    });
    return m;
  }


  function bindDrawer(rail) {
    var toggle = document.getElementById('railToggle');
    var scrim = document.getElementById('railScrim');
    if (!rail) return;
    function open() {
      rail.classList.add('is-open');
      if (scrim) scrim.classList.add('is-open');
      if (toggle) toggle.setAttribute('aria-expanded', 'true');
      document.documentElement.style.overflow = 'hidden';
    }
    function close() {
      rail.classList.remove('is-open');
      if (scrim) scrim.classList.remove('is-open');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
      document.documentElement.style.overflow = '';
    }
    if (toggle) toggle.addEventListener('click', function () {
      rail.classList.contains('is-open') ? close() : open();
    });
    if (scrim) scrim.addEventListener('click', close);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    rail.addEventListener('click', function (e) {
      if (e.target.closest('.rail__link') && window.innerWidth < 1024) close();
    });
  }


  function bindGroupReveal() {
    document.querySelectorAll('[data-group]').forEach(function (wrap) {
      var step = parseInt(wrap.dataset.group, 10) || 60;
      var children = wrap.children;
      for (var i = 0; i < children.length; i++) {
        var c = children[i];
        if (!c.hasAttribute('data-reveal')) c.setAttribute('data-reveal', '');
        if (!c.dataset.revealDelay) c.dataset.revealDelay = String(Math.min(i * step, 900));
      }
    });
  }


  function refreshI18n() {
    if (window.I18N && window.I18N.apply) window.I18N.apply();
  }


  function init() {
    var mode = document.body.dataset.shell || 'full';
    var cur = findCurrent();

    applyTheme(currentTheme());
    buildTopbar(cur, mode);
    refreshI18n();
    bindGroupReveal();
    buildDock();

    if (mode === 'home') {
      buildCmdk();
      buildAppreciate();
      buildLegal();
      refreshI18n();

      document.dispatchEvent(new CustomEvent('shell:ready', { detail: { mode: mode } }));
      return;
    }


    var main = document.querySelector('main');
    if (!main) {
      var c = document.querySelector('.container');
      if (c) {
        main = el('main', 'shell__main');
        while (c.firstChild) main.appendChild(c.firstChild);
        c.parentNode.replaceChild(main, c);
      } else {
        main = el('main', 'shell__main');
        document.body.appendChild(main);
      }
    }
    main.classList.add('shell__main');

    var shell = el('section', 'shell');
    shell.id = 'shell';
    main.parentNode.insertBefore(shell, main);

    var rail = buildRail(cur);
    shell.appendChild(rail);
    shell.appendChild(main);

    var toc = buildToc(main);
    if (toc) shell.appendChild(toc);
    else shell.classList.add('shell--no-toc');
    if (document.body.dataset.toc === 'off') shell.classList.add('shell--no-toc');


    var crumbs = buildCrumbs(cur);
    main.insertBefore(crumbs, main.firstChild);

    bindDrawer(rail);
    buildLegal();
    buildCmdk();
    buildAppreciate();
    refreshI18n();
    markReadyWhenLoaded();

    document.dispatchEvent(new CustomEvent('shell:ready', { detail: { mode: mode, current: cur } }));
  }


  function markReadyWhenLoaded() {
    var go = function () {
      requestAnimationFrame(function () {
        setTimeout(function () { document.body.classList.add('is-ready'); }, 60);
      });
    };
    if (document.readyState === 'complete') go();
    else window.addEventListener('load', go, { once: true });
  }

  /* 等语言文件加载完成后再搭骨架，避免导航/按钮出现中英闪跳 */
  function boot() {
    var go = function () {
      try {
        init();
      } catch (err) {
        if (window.console && console.error) console.error('[shell] 初始化失败', err);
      }
    };
    if (window.I18N && window.I18N.ready && typeof window.I18N.ready.then === 'function') {
      window.I18N.ready.then(go, go);
      return;
    }
    go();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
