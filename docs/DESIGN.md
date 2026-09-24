# 站点架构与维护说明

本文档说明 FinalSuspect 文档站重构后的结构、设计体系与维护方式。
技术栈保持**纯静态 HTML + CSS + 原生 JavaScript**，无框架、无构建步骤、无依赖安装。

---

## 一、目录结构

```
FinalSuspectWebsite/
├── index.html                    # 主页（驾驶舱 / Bento 磁贴）
├── FinalSuspect/                 # 全部内容页
│   ├── Introduction.html  FAQ.html  Keyboard.html  Changelog.html  404.html
│   ├── Guide/     index + Installation / Update / OutputLog
│   ├── Options/   index + 14 个选项详情页
│   └── Features/  index + 7 个功能详情页
├── Resource/
│   ├── CSS/      设计系统（见下）
│   ├── JS/       外壳 / 动效 / 启动动画 / 数据
│   ├── images/   图片资源
│   └── MP3/      音频资源
└── tools/        维护脚本（Node，仅本地执行，不参与部署）
```

---

## 二、样式体系（`Resource/CSS/`）

入口文件 `cyberpunk.css` 只做 `@import` 聚合，页面一律只引这一个文件：

| 文件 | 职责 |
|---|---|
| `tokens.css` | 设计令牌：颜色、表面、机械纹理、排版、间距、圆角、阴影、动效曲线、层级 `z-index` |
| `mech.css` | 机械感组件库：切角几何、HUD 角标、面板与铆钉、警示斜纹、齿轮、机加工按钮、终端窗、状态提示、手风琴、图集卡片 |
| `shell.css` | 全站外壳：顶栏、左栏导航树、面包屑、右栏目录、抽屉、浮动操作台、命令面板；主页 hero + Bento 布局 |
| `pages.css` | 四类页面模板：索引页（卡片网格）、详情页（摘要 + facts + 相关推荐）、图集页、时间线页 |
| `fx.css` | 动画关键帧与交互特效（入场、故障、机械抖振、页面切换等） |
| `splash-intro.css` | 仅首页引入：机械启动序列的全部样式 |

**约定**：任何新组件都必须使用 `tokens.css` 的变量，不得写死颜色与尺寸。

---

## 三、脚本体系（`Resource/JS/`）

| 文件 | 职责 | 引入范围 |
|---|---|---|
| `Nav.js` | 统一外壳引擎。读取 `<body>` 上的 `data-shell` / `data-page`，构建顶栏、左栏导航树、面包屑、右栏目录、移动端抽屉、命令面板（`Ctrl`+`K`）、浮动操作台与全站页脚 | **全部页面** |
| `fx.js` | 动效引擎：滚动上电、3D 倾斜、磁吸按钮、点击涟漪、打字机、数值滚动、图片灯箱、代码复制、视差、开机自检 | **全部页面** |
| `Time.js` | 页脚「最后更新」时间渲染（读取 `last-modified.js`） | 全部页面 |
| `last-modified.js` | 由 `tools/update-last-modified.mjs` 生成的页面时间表 | 全部页面 |
| `SplashIntro.js` | 机械启动序列（网格 → 齿轮咬合 → Logo 装配 → 自检日志 → 资源校验 → 液压合闸 → 落幕） | 仅首页 |
| `loader.js` | 启动调度：会话内只播一次、后退前进跳过、尊重 `prefers-reduced-motion` | 仅首页 |
| `versions.js` | 版本索引（版本号、日期、分类统计、要点），供主页版本条与日志页共用 | 首页 / 日志页 |
| `changelog-data.js` | 由 `tools/extract-changelog.mjs` 生成的完整改动数据（9 版本 / 287 条） | 日志页 |

### 页面声明方式

```html
<body data-shell="full"          <!-- full = 文档外壳；home = 主页驾驶舱 -->
      data-page="opt-fastboot"   <!-- 对应 Nav.js 中 SITE 树的 id，用于高亮与面包屑 -->
      data-rail="options"        <!-- 打开抽屉时默认展开的分组 -->
      data-toc="off">            <!-- 可选：强制不生成右栏目录 -->
    <main> … 正文 … </main>
</body>
```

**新增页面只需两步**：在 `Nav.js` 的 `SITE` 数组里加一条记录，然后按现有模板写 HTML。
导航树、面包屑、命令面板、页脚会同时更新，无需改动其它文件。

---

## 四、页面模板

| 模板 | 适用 | 结构要点 |
|---|---|---|
| **Home** | `index.html` | `hero`（满屏舞台）+ `bento`（大磁贴 + 入口磁贴）+ `stat-row`（数值滚动）+ `version-strip` |
| **Index** | `Guide/` `Options/` `Features/` 的 index | `index-hero` + `facts` + 索引工具条（本地筛选）+ `card-grid` |
| **Detail** | 22 个详情页 | `page-head` → `lede` → `facts` → `prose`（`sec-title` 分节）→ `related` → `pager` |
| **Stream** | `Changelog.html` | 分类筛选芯片 + `timeline`（由 `changelog-data.js` 渲染）+ `tl-version` / `tl-group` / `tl-item` |

---

## 五、维护脚本（`tools/`，本地执行）

```bash
node tools/verify-site.mjs            # 全站自检：资源引用、标签配对、死链、旧标记
node tools/update-last-modified.mjs   # 重新生成 Resource/JS/last-modified.js
node tools/extract-changelog.mjs      # 从旧版日志重新解析 Resource/JS/changelog-data.js
```

> 每次改完页面，先跑 `verify-site.mjs`，它能在无浏览器环境下发现死链、标签不配对、绝对路径等问题。

---

## 六、路径与部署约定

- **站内链接统一带 `.html` 后缀**。这是唯一在以下环境都成立的形式：
  `file://` 直接打开、Python/nginx 等普通静态服务器、GitHub Pages、Cloudflare Pages。
  去掉后缀在缺少 rewrite 规则的服务器上会 404。
- **图片等资源使用页面相对路径**（`../../Resource/images/x.png`），不使用根绝对路径 `/...`，
  这样站点部署在子目录（如 `user.github.io/RepoName/`）也不会裂图。
- 部署由 `.github/workflows/static.yml` 完成：推送 `main` 分支后整仓库发布到 GitHub Pages。

---

## 七、动效与可访问性

- 全站尊重 `prefers-reduced-motion`：关闭时会跳过启动序列、禁用倾斜/涟漪/视差。
- 启动序列每个会话只播放一次（30 分钟窗口），浏览器后退/前进直接跳过。
- 所有交互元素保留 `:focus-visible` 焦点环，导航具备 `aria-current` / `aria-expanded` 语义。
- 图片灯箱、命令面板、抽屉均支持 `Esc` 关闭。
