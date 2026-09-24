/* ============================================================================
 * FinalSuspect Website — Nav.js
 * 统一外壳引擎：顶栏 / 左栏导航树 / 面包屑 / 右栏目录 / 移动抽屉 /
 *              命令面板（Ctrl+K）/ 浮动操作台 / 全站页脚
 *
 * 用法：在页面 <body> 上声明
 *   data-shell="full" | "home"      full=文档外壳（默认），home=主页驾驶舱
 *   data-page="<页面 id>"            取自 SITE 树中的 id，用于高亮与面包屑
 *   data-rail="guide|options|..."    可选：打开抽屉时默认展开的分组
 *   data-toc="auto|off"              可选：off 强制不生成右栏目录
 * ========================================================================== */
(function () {
  'use strict';

  var IS_FILE = location.protocol === 'file:';

  /* ==========================================================================
   * 站点树（唯一数据源：左栏、面包屑、命令面板、页脚均由它渲染）
   * ======================================================================== */
  var SITE = [
    {
      id: 'start', name: '开始', icon: 'fa-flag-checkered', items: [
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
      id: 'logs', name: '动态', icon: 'fa-code-branch', items: [
        { id: 'changelog', name: '更新日志', href: 'FinalSuspect/Changelog.html', icon: 'fa-clock-rotate-left', desc: '按版本倒序的完整改动记录' }
      ]
    }
  ];

  /* 页脚链接组（复用 SITE 之外的外部链接） */
  var EXTERNAL = [
    { name: 'GitHub 仓库', href: 'https://github.com/Slok7565/FinalSuspect', icon: 'fa-brands fa-github' },
    { name: '下载最新版', href: 'https://github.com/Slok7565/FinalSuspect/releases', icon: 'fa-download' },
    { name: '问题反馈', href: 'https://github.com/NewLezaiYa/FinalSuspectWebsite/issues', icon: 'fa-circle-exclamation' }
  ];

  /* ==========================================================================
   * 工具
   * ======================================================================== */
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
  /** 归一化当前路径，便于同源比较（去掉 index.html 与结尾斜杠） */
  function normPath(p) {
    p = String(p || '').replace(/\\/g, '/');
    p = p.replace(/^.*?\/FinalSuspectWebsite\//i, '');
    p = p.replace(/^\/+/, '');
    p = p.replace(/index\.html?$/i, '');
    return p.replace(/\/+$/, '').toLowerCase();
  }
  /** 当前页面在 SITE 中的条目 */
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
    // 索引页（Guide/Options/Features 的 index）
    for (var g2 = 0; g2 < SITE.length; g2++) {
      if (SITE[g2].href && normPath(SITE[g2].href) === here) {
        return { group: SITE[g2], item: { id: SITE[g2].id + '-index', name: SITE[g2].name + '总览', href: SITE[g2].href }, isIndex: true };
      }
    }
    return null;
  }
  /** 根相对路径（file:// 下转换为相对路径，保证本地双击可预览） */
  function asset(p) {
    if (!IS_FILE) return '/' + String(p).replace(/^\/+/, '');
    var depth = normPath(location.pathname).split('/').filter(Boolean).length - 1;
    return '../'.repeat(Math.max(0, depth)) + String(p).replace(/^\/+/, '');
  }
  /**
   * 站内链接解析。
   * 一律保留 .html 后缀：这是唯一在所有环境下都成立的形式
   * —— file:// 直接打开、Python/nginx 等普通静态服务器、GitHub Pages、
   *    Cloudflare Pages 都能正确命中；去掉后缀在缺少 rewrite 的服务器上会 404。
   */
  function href(h) {
    if (/^https?:/i.test(h) || h.charAt(0) === '#') return h;
    return IS_FILE ? asset(h) : h;
  }

  /* ==========================================================================
   * 1. 顶栏
   * ======================================================================== */
  function buildTopbar(cur, mode) {
    var bar = el('header', 'topbar');
    bar.id = 'topbar';

    // 顶部阅读进度条（机械导轨上的滑块）
    var progress = el('div', 'read-progress');
    progress.setAttribute('data-progress', '');
    bar.appendChild(progress);

    var inner = el('div', 'topbar__inner');

    // 品牌
    var brand = el('a', 'brand');
    brand.href = href('index.html');
    brand.innerHTML =
      '<span class="brand__mark">FS</span>' +
      '<span class="brand__text">FinalSuspect</span>' +
      '<span class="brand__sub">MOD DOCS</span>';
    inner.appendChild(brand);

    // 主导航（主页显示全部；内页靠左栏，顶栏只放一级分组）
    var nav = el('nav', 'topnav');
    nav.setAttribute('aria-label', '主导航');
    var groups = SITE.filter(function (g) { return g.href || g.id === 'start' || g.id === 'logs'; });
    var homeHref = href('index.html');
    var homeLink = el('a', 'topnav__link', '<i class="fas fa-house"></i> 首页');
    homeLink.href = homeHref;
    if (mode === 'home') homeLink.setAttribute('aria-current', 'page');
    nav.appendChild(homeLink);
    groups.forEach(function (g) {
      var target = g.href || (g.items && g.items[0] && g.items[0].href);
      if (!target) return;
      var a = el('a', 'topnav__link', esc(g.name));
      a.href = href(target);
      if (cur && cur.group && cur.group.id === g.id) a.setAttribute('aria-current', 'page');
      nav.appendChild(a);
    });
    inner.appendChild(nav);

    // 右侧动作
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
    cmdBtn.innerHTML = '<i class="fas fa-magnifying-glass"></i><span>搜索文档…</span>' +
      '<span class="cmdk-trigger__keys"><kbd>Ctrl</kbd><kbd>K</kbd></span>';
    actions.appendChild(cmdBtn);

    inner.appendChild(actions);
    bar.appendChild(inner);
    document.body.insertBefore(bar, document.body.firstChild);
    return bar;
  }

  /* ==========================================================================
   * 2. 左栏导航树
   * ======================================================================== */
  function buildRail(cur) {
    var aside = el('aside', 'shell__rail');
    aside.id = 'siteRail';
    var rail = el('div', 'rail');

    // 过滤框
    var filter = el('div', 'rail__filter');
    var input = el('input');
    input.type = 'search';
    input.id = 'railFilter';
    input.placeholder = '筛选页面…';
    input.setAttribute('aria-label', '筛选导航项');
    filter.appendChild(input);
    rail.appendChild(filter);

    var status = el('div', 'rail__status');
    var openId = (cur && cur.group) ? cur.group.id : null;
    if (document.body.dataset.rail) openId = document.body.dataset.rail;

    SITE.forEach(function (g) {
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
        group.appendChild(list);
      }
      rail.appendChild(group);
    });

    // 状态铭牌
    status.innerHTML =
      '<div class="rail__status-row"><span><i class="led led--cyan"></i> 文档服务</span><b>ONLINE</b></div>' +
      '<div class="rail__status-row"><span>模组版本</span><b>' + esc(window.SITE_VERSION || '1.3') + '</b></div>' +
      '<div class="rail__status-row"><span>页面总数</span><b>' + String(countPages()) + '</b></div>';
    rail.appendChild(status);

    aside.appendChild(rail);

    // 移动端遮罩
    var scrim = el('div', 'rail-scrim');
    scrim.id = 'railScrim';
    document.body.appendChild(scrim);

    // 过滤逻辑
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
        // 分组标题自身也参与匹配
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

  function countPages() {
    var n = 0;
    SITE.forEach(function (g) { n += (g.items ? g.items.length : 1); });
    return n;
  }

  /* ==========================================================================
   * 3. 面包屑
   * ======================================================================== */
  function buildCrumbs(cur) {
    var nav = el('nav', 'crumbs');
    nav.setAttribute('aria-label', '面包屑');
    var html = '<a href="' + href('index.html') + '"><i class="fas fa-house"></i> 首页</a>';
    if (cur && cur.group) {
      if (cur.group.href) {
        html += '<span class="crumbs__sep">/</span><a href="' + href(cur.group.href) + '">' + esc(cur.group.name) + '</a>';
      } else {
        html += '<span class="crumbs__sep">/</span><span>' + esc(cur.group.name) + '</span>';
      }
      if (cur.item && !cur.isIndex) {
        html += '<span class="crumbs__sep">/</span><span aria-current="page">' + esc(cur.item.name) + '</span>';
      }
    }
    nav.innerHTML = html;
    return nav;
  }

  /* ==========================================================================
   * 4. 右栏目录（扫描正文 h2 / .sec-title / h3 / .sub-title）
   * ======================================================================== */
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

    toc.innerHTML = '<div class="toc__title"><i class="fas fa-list-ul"></i> 本页目录</div>';
    toc.appendChild(list);

    // 元数据铭牌
    var meta = el('dl', 'toc__meta');
    var cur = findCurrent();
    meta.innerHTML =
      '<dt>所在分类</dt><dd>' + esc(cur && cur.group ? cur.group.name : '文档') + '</dd>' +
      '<dt>最后更新</dt><dd id="tocUpdated">—</dd>' +
      '<dt>文档版本</dt><dd>' + esc(window.SITE_VERSION || '1.3') + '</dd>';
    toc.appendChild(meta);

    aside.appendChild(toc);

    // 滚动高亮
    var links = list.querySelectorAll('.toc__link');
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (l) { l.classList.toggle('is-active', l.dataset.target === en.target.id); });
      });
    }, { rootMargin: '-20% 0px -70% 0px', threshold: 0 });
    heads.forEach(function (h) { obs.observe(h); });

    // 同步页脚时间到目录铭牌
    var footTime = document.querySelector('[data-last-modified]');
    var localTime = document.getElementById('lastEditTime');
    var upd = meta.querySelector('#tocUpdated');
    setTimeout(function () {
      var src = (footTime && footTime.textContent.trim()) || (localTime && localTime.textContent.trim());
      if (upd && src) upd.textContent = src;
    }, 260);

    return aside;
  }

  /* ==========================================================================
   * 5. 浮动操作台 + 回到顶部
   * ======================================================================== */
  function buildFab() {
    var dock = el('div', 'fab-dock');
    dock.innerHTML =
      '<div class="fab-item">' +
        '<span class="fab-item__label">更新日志</span>' +
        '<a class="fab-item__btn" href="' + href('FinalSuspect/Changelog.html') + '" aria-label="更新日志"><i class="fas fa-clock-rotate-left"></i></a>' +
      '</div>' +
      '<div class="fab-item">' +
        '<span class="fab-item__label">赞赏支持</span>' +
        '<button class="fab-item__btn fab-item__btn--pink" type="button" id="openAppreciate" aria-label="赞赏支持"><i class="fas fa-heart"></i></button>' +
      '</div>' +
      '<div class="fab-item">' +
        '<span class="fab-item__label">回到顶部</span>' +
        '<button class="fab-item__btn" type="button" id="fabTop" aria-label="回到顶部"><i class="fas fa-arrow-up"></i></button>' +
      '</div>' +
      '<button class="fab-main" type="button" id="fabMain" aria-label="更多操作" aria-expanded="false"><i class="fas fa-plus"></i></button>';
    document.body.appendChild(dock);

    var main = dock.querySelector('#fabMain');
    main.addEventListener('click', function () {
      var open = dock.classList.toggle('is-open');
      main.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('click', function (e) {
      if (!dock.contains(e.target)) {
        dock.classList.remove('is-open');
        main.setAttribute('aria-expanded', 'false');
      }
    });
    dock.querySelector('#fabTop').addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // 独立回到顶部按钮（滚动后出现）
    var toTop = el('button', 'to-top', '<i class="fas fa-chevron-up"></i>');
    toTop.type = 'button';
    toTop.setAttribute('aria-label', '回到顶部');
    toTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
    document.body.appendChild(toTop);

    var lastY = 0;
    window.addEventListener('scroll', function () {
      var y = window.scrollY || window.pageYOffset;
      toTop.classList.toggle('is-visible', y > 420);
      lastY = y;
    }, { passive: true });
    return dock;
  }

  /* ==========================================================================
   * 6. 命令面板
   * ======================================================================== */
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

  /* ==========================================================================
   * 7. 页脚
   * ======================================================================== */
  function buildFooter() {
    var f = el('footer', 'site-footer');
    var cols = SITE.map(function (g) {
      var rows = (g.items || []).map(function (it) {
        return '<a href="' + href(it.href) + '">' + esc(it.name) + '</a>';
      }).join('');
      if (g.href) rows = '<a href="' + href(g.href) + '">' + esc(g.name) + '总览</a>' + rows;
      return '<div class="site-footer__col"><h4>' + esc(g.name) + '</h4>' + rows + '</div>';
    }).join('');
    var ext = EXTERNAL.map(function (e) {
      return '<a href="' + e.href + '" target="_blank" rel="noopener noreferrer"><i class="' + e.icon + '"></i> ' + esc(e.name) + '</a>';
    }).join('');

    f.innerHTML =
      '<div class="site-footer__grid">' +
        '<div class="site-footer__col">' +
          '<h4>关于本项目</h4>' +
          '<span>FinalSuspect 模组官方文档站</span>' +
          '<span>模组作者：Slok</span>' +
          '<span>网站设计：LezaiYa</span>' +
          '<span>许可协议：AGPL-3.0</span>' +
        '</div>' +
        cols +
        '<div class="site-footer__col"><h4>相关链接</h4>' + ext + '</div>' +
      '</div>' +
      '<div class="site-footer__note">' +
        '<strong>注意：</strong>本模组不隶属于 Among Us 或 Innersloth LLC，其包含的内容也未得到 Innersloth LLC 的认可或以其他方式赞助。' +
        '此处包含的部分材料是 Innersloth LLC 的财产。 © Innersloth LLC' +
      '</div>' +
      '<div class="site-footer__bottom">' +
        '<span>最后更新：<time id="lastEditTime" data-last-modified datetime=""></time></span>' +
        '<span>网站设计 ©<span class="name">LezaiYa</span> · FinalSuspect Mod ©<span class="name">Slok</span></span>' +
      '</div>';

    // 页脚插到 shell 之后（或 container 之后）
    var anchor = document.querySelector('.shell') || document.querySelector('main');
    if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(f, anchor.nextSibling);
    else document.body.appendChild(f);
    return f;
  }

  /* ==========================================================================
   * 8. 赞赏弹窗（全站可用）
   * ======================================================================== */
  function buildAppreciate() {
    var m = el('div', 'cmdk');
    m.id = 'appreciateModal';
    m.innerHTML =
      '<div class="cmdk__panel" style="max-width:400px;text-align:center">' +
        '<div class="cmdk__head"><i class="fa-brands fa-weixin" style="color:#09bb07"></i>' +
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

  /* ==========================================================================
   * 9. 抽屉开关
   * ======================================================================== */
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

  /* ==========================================================================
   * 9b. 分组阶梯揭示：[data-group="N"] 的直接子元素自动排布入场延迟
   * ======================================================================== */
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

  /* ==========================================================================
   * 10. 组装
   * ======================================================================== */
  function init() {
    var mode = document.body.dataset.shell || 'full';
    var cur = findCurrent();

    buildTopbar(cur, mode);
    removeLegacyChrome();
    bindGroupReveal();

    if (mode === 'home') {
      buildFab();
      buildCmdk();
      buildAppreciate();
      markReadyWhenLoaded();
      document.dispatchEvent(new CustomEvent('shell:ready', { detail: { mode: mode } }));
      return;
    }

    // 文档外壳：把 <main class="shell__main"> 组装进 .shell
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

    // 面包屑置于正文最前
    var crumbs = buildCrumbs(cur);
    main.insertBefore(crumbs, main.firstChild);

    bindDrawer(rail);
    buildFooter();
    buildFab();
    buildCmdk();
    buildAppreciate();
    markReadyWhenLoaded();

    document.dispatchEvent(new CustomEvent('shell:ready', { detail: { mode: mode, current: cur } }));
  }

  /** 移除旧版遗留的浮动按钮 / 返回按钮，避免与新外壳冲突 */
  function removeLegacyChrome() {
    ['.changelog-btn', '.appreciate-btn', '.back-button', '.back-to-top',
     '.wechat-modal', '#loadingOverlay .loading-content'].forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (n) { n.remove(); });
    });
  }

  /** 主页：等待首屏资源就绪后加 .is-ready，触发入场动画 */
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
