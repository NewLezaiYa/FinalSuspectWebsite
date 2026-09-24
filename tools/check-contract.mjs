/**
 * 契约检查：Nav.js / fx.js 里新建的类名，是否都能在 CSS 中找到定义
 * （避免"JS 生成了没有样式的 DOM"这种静默失效）
 * 用法：node tools/_tmp-contract.mjs
 */
import { readFileSync, readdirSync } from 'node:fs';

const css = readdirSync('Resource/CSS')
  .filter((f) => f.endsWith('.css'))
  .map((f) => readFileSync('Resource/CSS/' + f, 'utf8'))
  .join('\n');

const nav = readFileSync('Resource/JS/Nav.js', 'utf8');
const fx = readFileSync('Resource/JS/fx.js', 'utf8');

/* 先去掉字符串拼接的干扰：把 ' + ... + ' 折叠成单个引号串 */
function normalize(src) {
  return src.replace(/'\s*\+\s*[^+;]*?\+\s*'/g, '');
}

/* 从 JS 的 el('tag', 'class ...') 与 innerHTML 的 class="..." 中抽取类名 */
const classes = new Set();
for (const raw of [nav, fx]) {
  const src = normalize(raw);
  for (const m of src.matchAll(/el\('[a-z]+',\s*'([^']+)'/g)) {
    m[1].split(/\s+/).forEach((c) => c && classes.add(c));
  }
  for (const m of src.matchAll(/class="([^"$]*?)"/g)) {
    m[1].split(/\s+/).forEach((c) => { if (c && !c.includes('{')) classes.add(c); });
  }
}

/* Font Awesome 图标类由 CDN 提供，不走本地 CSS */
const isFa = (c) => /^fa[sbr]?$|^fa-/.test(c);

/* 这些是辅助类/状态类，允许只在 HTML 或运行时出现 */
const ALLOW = new Set([
  'hc', 'tl', 'tr', 'bl', 'br', 'led', 'tag', 'cmdk__item', 'is-active', 'caret',
  'icon-btn', 'hamburger', 'fab-item__btn--pink', 'toc__link--h3', 'shell--no-toc'
]);

const missing = [];
for (const c of classes) {
  if (ALLOW.has(c) || isFa(c)) continue;
  const re = new RegExp('\\.' + c.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&') + '(?![\\w-])');
  if (!re.test(css)) missing.push(c);
}

console.log(`检查类名 ${classes.size} 个（已排除 Font Awesome 图标类）`);
if (missing.length) {
  console.log(`❌ 有 ${missing.length} 个类名在 CSS 中找不到定义：`);
  missing.forEach((c) => console.log('   • ' + c));
  process.exit(1);
}
console.log('✅ JS 生成的所有类名都有对应样式');
