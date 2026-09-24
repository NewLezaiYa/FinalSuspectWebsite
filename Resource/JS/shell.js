
(function () {
  'use strict';

  var IS_FILE = location.protocol === 'file:';


  var SITE = [
    {
      id: 'start', name: '开始', icon: 'fa-flag-checkered', top: true, items: [
        { id: 'intro', name: '模组简介', href: 'FinalSuspect/Introduction.html', icon: 'fa-book-open', desc: 'Final Suspect 是什么、理念与开发团队' },
        { id: 'faq', name: '疑难解答', href: 'FinalSuspect/FAQ.html', icon: 'fa-life-ring', desc: '安装失败、报错代码、连接异常的分步排查' },
        { id: 'keyboard', name: '快捷键', href: 'FinalSuspect/Keyboard.html', icon: 'fa-keyboard', desc: '模组端与房主专用快捷键一览' }
      ]
    },
    {
      id: 'guide', name: '教程', icon: 'fa-graduation-cap', href: 'FinalSuspect/Guide/index.html', items: [
        { id: 'installation', name: '安装', href: 'FinalSuspect/Guide/Installation.html', icon: 'fa-download', desc: 'Steam / Epic 双平台安装步骤' },
        { id: 'update', name: '更新', href: 'FinalSuspect/Guide/Update.html', icon: 'fa-rotate', desc: '手动更新与版本升级流程' },
        { id: 'outputlog', name: '导出日志', href: 'FinalSuspect/Guide/OutputLog.html', icon: 'fa-file-export', desc: '出问题时如何导出日志给开发者' }
      ]
    },
    {
      id: 'options', name: '选项', icon: 'fa-sliders', href: 'FinalSuspect/Options/index.html', items: [
        { id: 'opt-autoendgame', name: '结束时自动返回大厅', href: 'FinalSuspect/Options/AutoEndGame.html', icon: 'fa-flag-checkered', desc: '对局结束自动跳过结算回到大厅' },
        { id: 'opt-autostartgame', name: '人满自动开始游戏', href: 'FinalSuspect/Options/AutoStartGame.html', icon: 'fa-users-cog', desc: '差一人满员即启动 10 秒倒计时' },
        { id: 'opt-enablefac', name: '启用反作弊 FAC', href: 'FinalSuspect/Options/EnableFAC.html', icon: 'fa-shield-halved', desc: '开启 Final Anti Cheat 房间防护' },
        { id: 'opt-disablevanillasound', name: '禁用原版游戏音乐', href: 'FinalSuspect/Options/DisableVanillaSound.html', icon: 'fa-volume-xmark', desc: '屏蔽大厅等待音乐' },
        { id: 'opt-fastboot', name: '快速启动模式', href: 'FinalSuspect/Options/FastBoot.html', icon: 'fa-bolt', desc: '启动耗时约 15 秒缩短到 5 秒' },
        { id: 'opt-kickfriendcode', name: '踢出好友代码异常玩家', href: 'FinalSuspect/Options/KickPlayerWithAbnormalFriendCode.html', icon: 'fa-user-xmark', desc: '自动检测异常好友代码' },
        { id: 'opt-kickbanlist', name: '踢出被封禁的玩家', href: 'FinalSuspect/Options/KickPlayerInBanList.html', icon: 'fa-ban', desc: '命中封禁名单自动踢出' },
        { id: 'opt-kickdenyname', name: '踢出违规昵称玩家', href: 'FinalSuspect/Options/KickPlayerWithDenyName.html', icon: 'fa-user-slash', desc: '敏感词与恶意昵称自动处理' },
        { id: 'opt-offlinemode', name: '离线模式（试验性）', href: 'FinalSuspect/Options/OfflineMode.html', icon: 'fa-plug-circle-xmark', desc: '不从远程获取资源' },
        { id: 'opt-showplayerinfo', name: '展示玩家平台与客户端信息', href: 'FinalSuspect/Options/ShowPlayerInfo.html', icon: 'fa-id-card', desc: '大厅显示平台与好友代码' },
        { id: 'opt-spamdenyword', name: '屏蔽违禁词', href: 'FinalSuspect/Options/SpamDenyWord.html', icon: 'fa-comment-slash', desc: '聊天违禁词替换为星号' },
        { id: 'opt-switchoutfit', name: '切换外观形象', href: 'FinalSuspect/Options/SwitchOutfitType.html', icon: 'fa-shirt', desc: '经典豆子 / 牧马 / 长颈豆' },
        { id: 'opt-unlockfps', name: '解锁帧数限制', href: 'FinalSuspect/Options/UnlockFPS.html', icon: 'fa-gauge-high', desc: '解除 60FPS 上限，最高 165FPS' },
        { id: 'opt-usemodcursor', name: '使用模组鼠标光标', href: 'FinalSuspect/Options/UseModCursor.html', icon: 'fa-arrow-pointer', desc: '用模组定制光标替换系统光标' }
      ]
    },
    {
      id: 'features', name: '功能', icon: 'fa-toolbox', href: 'FinalSuspect/Features/index.html', items: [
        { id: 'feat-clearautologs', name: '清空自动日志', href: 'FinalSuspect/Features/ClearAutoLogs.html', icon: 'fa-trash-can', desc: '一键清理累积的自动日志文件' },
        { id: 'feat-dumplog', name: '输出日志', href: 'FinalSuspect/Features/DumpLog.html', icon: 'fa-file-code', desc: '把当前运行日志导出为文件' },
        { id: 'feat-mainmenustyle', name: '切换主页风格', href: 'FinalSuspect/Features/MainMenuStyleManager.html', icon: 'fa-palette', desc: '6 套可切换的游戏主页背景' },
        { id: 'feat-mymusic', name: '我的音乐', href: 'FinalSuspect/Features/MyMusic.html', icon: 'fa-music', desc: '自定义大厅与菜单背景音乐' },
        { id: 'feat-nametag', name: '名称标识管理', href: 'FinalSuspect/Features/NameTagManager.html', icon: 'fa-tags', desc: '管理玩家名称标识显示规则' },
        { id: 'feat-resourcemanager', name: '资源管理', href: 'FinalSuspect/Features/ResourceManager.html', icon: 'fa-folder-tree', desc: '查看与管理模组资源文件' },
        { id: 'feat-unloadmod', name: '切换原版', href: 'FinalSuspect/Features/UnloadMod.html', icon: 'fa-toggle-on', desc: '临时以原版客户端启动游戏' }
      ]
    },
    {
      id: 'logs', name: '更新日志', icon: 'fa-code-branch', items: [
        { id: 'changelog', name: '全部版本', href: 'FinalSuspect/Changelog.html', icon: 'fa-clock-rotate-left', desc: '按版本倒序的完整改动记录' }
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
    btn.setAttribute('aria-label', '切换亮色 / 暗色主题');
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

  function normPath(p) {
    p = String(p || '').replace(/\\/g, '/');
    p = p.replace(/^.*?\/FinalSuspectWebsite\//i, '');
    p = p.replace(/^\/+/, '');
    p = p.replace(/index\.html?$/i, '');
    return p.replace(/\/+$/, '').toLowerCase();
  }

  function findCurrent() {
    var here = normPath(location.pathname);
    for (var g = 0; g < SITE.length; g++) {
      var items = SITE[g].items || [];
      for (var i = 0; i < items.length; i++) {
        if (normPath(items[i].href) === here || (items[i].id === document.body.dataset.page)) {
          return { group: SITE[g], item: items[i] };
        }
      }
    }

    for (var g2 = 0; g2 < SITE.length; g2++) {
      if (SITE[g2].href && normPath(SITE[g2].href) === here) {
        return { group: SITE[g2], item: { id: SITE[g2].id + '-index', name: SITE[g2].name + '总览', href: SITE[g2].href }, isIndex: true };
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


  function asset(p) {
    return href(p);
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
    brand.setAttribute('aria-label', 'FinalSuspect 文档首页');

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
    nav.setAttribute('aria-label', '主导航');

    var homeLink = el('a', 'topnav__link', '首页');
    homeLink.href = href('index.html');
    if (mode === 'home') homeLink.setAttribute('aria-current', 'page');
    nav.appendChild(homeLink);

    SITE.forEach(function (g) {
      if (g.id === 'logs') return;
      var target = g.href || (g.items && g.items[0] && g.items[0].href);
      if (!target) return;
      var a = el('a', 'topnav__link', esc(g.name));
      a.href = href(target);
      if (cur && cur.group && cur.group.id === g.id) a.setAttribute('aria-current', 'page');
      nav.appendChild(a);
    });


    var logLink = el('a', 'topnav__link topnav__link--accent', '更新日志');
    logLink.href = href('FinalSuspect/Changelog.html');
    if (cur && cur.group && cur.group.id === 'logs') logLink.setAttribute('aria-current', 'page');
    nav.appendChild(logLink);

    inner.appendChild(nav);


    var actions = el('div', 'topbar__actions');

    var hamburger = el('button', 'icon-btn hamburger', '<i class="fas fa-bars"></i>');
    hamburger.type = 'button';
    hamburger.id = 'railToggle';
    hamburger.setAttribute('aria-label', '打开导航');
    hamburger.setAttribute('aria-expanded', 'false');
    actions.appendChild(hamburger);

    var cmdBtn = el('button', 'cmdk-trigger');
    cmdBtn.type = 'button';
    cmdBtn.id = 'cmdkTrigger';
    cmdBtn.innerHTML = '<i class="fas fa-magnifying-glass"></i><span>搜索文档 / SEARCH</span>' +
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
    var cur = (window.I18N && window.I18N.get()) || 'zh';

    var btn = el('button', 'lang-switch__btn');
    btn.type = 'button';
    btn.setAttribute('data-lang-toggle', '');
    btn.setAttribute('aria-haspopup', 'true');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('title', '切换语言');
    btn.innerHTML =
      '<i class="fas fa-language"></i>' +
      '<span class="lang-switch__cur" data-lang-current>' + (cur === 'en' ? 'EN' : '中') + '</span>' +
      '<i class="fas fa-chevron-down lang-switch__caret"></i>';

    var menu = el('div', 'lang-switch__menu');
    menu.setAttribute('role', 'menu');
    ['zh', 'en'].forEach(function (code) {
      var label = (window.I18N && window.I18N.label(code)) || (code === 'en' ? 'English' : '中文');
      var item = el('button', 'lang-switch__item' + (code === cur ? ' is-active' : ''));
      item.type = 'button';
      item.setAttribute('role', 'menuitemradio');
      item.setAttribute('data-lang-option', code);
      item.setAttribute('aria-checked', code === cur ? 'true' : 'false');
      item.innerHTML =
        '<span class="lang-switch__dot"></span>' +
        '<span>' + esc(label) + '</span>' +
        '<span class="lang-switch__code">' + code.toUpperCase() + '</span>';
      item.addEventListener('click', function (e) {
        e.stopPropagation();
        if (window.I18N) window.I18N.set(code);
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
    input.placeholder = '筛选页面…';
    input.setAttribute('aria-label', '筛选导航项');
    filter.appendChild(input);
    rail.appendChild(filter);

    var openId = (cur && cur.group) ? cur.group.id : null;
    if (document.body.dataset.rail) openId = document.body.dataset.rail;


    var topItems = [];
    SITE.forEach(function (g) {
      if (g.top && g.items) topItems = topItems.concat(g.items);
    });
    if (topItems.length) {
      var topBox = el('div', 'rail__top');
      topItems.forEach(function (it) {
        var a = el('a', 'rail__link rail__link--top');
        a.href = href(it.href);
        a.dataset.id = it.id;
        a.dataset.search = (it.name + ' ' + (it.desc || '')).toLowerCase();
        a.innerHTML = '<i class="fas ' + esc(it.icon || 'fa-file') + '"></i><span>' + esc(it.name) + '</span>';
        if (cur && cur.item && cur.item.id === it.id) a.setAttribute('aria-current', 'page');
        topBox.appendChild(a);
      });
      rail.appendChild(topBox);
    }

    SITE.forEach(function (g) {
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
        '<span>' + esc(g.name) + '</span>' +
        (g.items ? '<span class="rail__count">' + g.items.length + '</span>' : '') +
        (g.items ? '<i class="fas fa-chevron-down caret"></i>' : '');
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
          a.dataset.search = (it.name + ' ' + (it.desc || '')).toLowerCase();
          a.innerHTML = '<span>' + esc(it.name) + '</span>';
          if (cur && cur.item && cur.item.id === it.id) a.setAttribute('aria-current', 'page');
          list.appendChild(a);
        });

        if (g.id === 'logs' && window.VERSIONS && window.VERSIONS.length) {
          window.VERSIONS.forEach(function (v) {
            var sub = el('a', 'rail__sub');
            sub.href = href('FinalSuspect/Changelog.html') + '#' + v.id;
            var total = v.totals
              ? Object.keys(v.totals).reduce(function (s, k) { return s + v.totals[k]; }, 0)
              : (v.highlights || []).length;
            sub.innerHTML = '<span>v' + esc(v.version) + '</span><b>' + esc(v.date) + '</b>' +
              '<span style="margin-left:auto">' + total + '</span>';
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
      SITE.forEach(function (g) {
        var group = rail.querySelector('.rail__group[data-group="' + g.id + '"]');
        if (!group) return;
        var links = group.querySelectorAll('.rail__link');
        var groupHit = !q;
        links.forEach(function (a) {
          var hit = !q || a.dataset.search.indexOf(q) !== -1;
          a.classList.toggle('rail__link--hidden', !hit);
          if (hit) groupHit = true;
        });

        if (q && g.name.toLowerCase().indexOf(q) !== -1) {
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
    nav.setAttribute('aria-label', '面包屑');
    var html = '<a href="' + href('index.html') + '"><i class="fas fa-house"></i> 首页</a>';
    if (cur && cur.group) {
      if (cur.group.href) {
        html += '<span class="crumbs__sep">▸</span><a href="' + href(cur.group.href) + '">' + esc(cur.group.name) + '</a>';
      } else {
        html += '<span class="crumbs__sep">▸</span><span>' + esc(cur.group.name) + '</span>';
      }
      if (cur.item && !cur.isIndex) {
        html += '<span class="crumbs__sep">▸</span><span aria-current="page">' + esc(cur.item.name) + '</span>';
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
    toc.setAttribute('aria-label', '本页目录');
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

    toc.innerHTML = '<div class="toc__title"><i class="fas fa-list-ul"></i> 本页目录 / INDEX</div>';
    toc.appendChild(list);



    aside.appendChild(toc);


    var links = list.querySelectorAll('.toc__link');
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
      '<span class="legal-bar__copy">网站设计 ©<b>LezaiYa</b> · FinalSuspect Mod ©<b>Slok</b>' +
        ' · <a href="https://github.com/Slok7565/FinalSuspect" target="_blank" rel="noopener noreferrer">GitHub</a>' +
        ' · AGPL-3.0</span>' +
      '<span class="legal-bar__note">本模组不隶属于 Among Us 或 Innersloth LLC，' +
        '部分材料为 Innersloth LLC 的财产。 © Innersloth LLC</span>' +
      '<span class="legal-bar__time">最后更新 / LAST UPDATE <time id="lastEditTime" data-last-modified datetime=""></time></span>';

    var anchor = document.querySelector('.shell') || document.querySelector('main');
    if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(bar, anchor.nextSibling);
    else document.body.appendChild(bar);
    return bar;
  }


  function buildActions() {
    var dock = el('div', 'dock');


    var top = el('button', 'dock__btn dock__btn--top');
    top.type = 'button';
    top.setAttribute('aria-label', '回到顶部');
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
    love.setAttribute('aria-label', '赞赏支持');
    love.innerHTML = '<i class="fas fa-heart"></i><span class="dock__pulse"></span>';
    dock.appendChild(love);

    document.body.appendChild(dock);

    var ring = top.querySelector('.dock__ring-fg');
    var CIRC = 125.6;
    var ticking = false;
    function update() {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      var y = window.scrollY || window.pageYOffset || 0;
      var p = h > 0 ? Math.min(1, y / h) : 0;
      if (ring) ring.setAttribute('stroke-dashoffset', String(CIRC * (1 - p)));
      top.classList.toggle('is-on', y > 300);
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    window.addEventListener('resize', update);
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
      '<div class="cmdk__panel" role="dialog" aria-modal="true" aria-label="搜索文档">' +
        '<div class="cmdk__head">' +
          '<i class="fas fa-magnifying-glass"></i>' +
          '<input class="cmdk__input" id="cmdkInput" type="text" placeholder="搜索页面、选项、功能…" autocomplete="off">' +
          '<kbd>ESC</kbd>' +
        '</div>' +
        '<div class="cmdk__list" id="cmdkList"></div>' +
      '</div>';
    document.body.appendChild(wrap);

    var input = wrap.querySelector('#cmdkInput');
    var list = wrap.querySelector('#cmdkList');
    var flat = [];
    SITE.forEach(function (g) {
      (g.items || []).forEach(function (it) {
        flat.push({ group: g.name, name: it.name, href: it.href, icon: it.icon, desc: it.desc || '' });
      });
    });
    flat.push({ group: '首页', name: '主页', href: 'index.html', icon: 'fa-house', desc: '网站首页与快速入口' });

    var activeIdx = 0;
    var shown = [];

    function render(q) {
      q = (q || '').trim().toLowerCase();
      shown = flat.filter(function (it) {
        if (!q) return true;
        return (it.name + ' ' + it.desc + ' ' + it.group).toLowerCase().indexOf(q) !== -1;
      }).slice(0, 40);
      activeIdx = 0;
      if (!shown.length) {
        list.innerHTML = '<div class="cmdk__empty">没有匹配的页面</div>';
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

    return wrap;
  }


  function buildAppreciate() {
    var m = el('div', 'cmdk');
    m.id = 'appreciateModal';
    m.innerHTML =
      '<div class="cmdk__panel" style="max-width:400px;text-align:center">' +
        '<div class="cmdk__head"><i class="brand-ico brand-ico--wechat" style="color:#09bb07"></i>' +
        '<b style="flex:1;font-family:var(--f-display);letter-spacing:.06em">微信赞赏</b>' +
        '<button class="icon-btn" type="button" id="apprClose" aria-label="关闭" style="width:32px;height:32px"><i class="fas fa-xmark"></i></button></div>' +
        '<div style="padding:var(--s-5)">' +
          '<p style="color:var(--t2);font-size:var(--fs-sm);margin-bottom:var(--s-4)">扫描二维码支持 FinalSuspect，感谢您的慷慨赞助！</p>' +
          '<div style="background:#fff;padding:10px;border-radius:8px;display:inline-block">' +
            '<img src="' + asset('Resource/images/Appreciate_Slok.webp') + '" alt="微信赞赏二维码" width="200" height="200" loading="lazy" decoding="async" style="width:200px;height:200px">' +
          '</div>' +
          '<p style="color:var(--t4);font-size:var(--fs-xs);margin-top:var(--s-4)">扫码支付后，您的支持将直接送达开发人员</p>' +
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


  function init() {
    var mode = document.body.dataset.shell || 'full';
    var cur = findCurrent();

    applyTheme(currentTheme());
    buildTopbar(cur, mode);
    removeLegacyChrome();
    bindGroupReveal();
    buildActions();

    if (mode === 'home') {
      buildCmdk();
      buildAppreciate();
      buildLegal();

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
    markReadyWhenLoaded();

    document.dispatchEvent(new CustomEvent('shell:ready', { detail: { mode: mode, current: cur } }));
  }


  function removeLegacyChrome() {
    ['.changelog-btn', '.appreciate-btn', '.back-button', '.back-to-top',
     '.wechat-modal', '#loadingOverlay .loading-content'].forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (n) { n.remove(); });
    });
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

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
