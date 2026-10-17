/**
 * 语言文件自检：node tools/i18n-check.mjs
 *
 * 1) HTML / JS 里用到的语言键是否都在 Resource/lang/zh-CN.json 中
 * 2) 每个页面还有哪些中文没有绑定语言键
 * 3) data-i18n 是否被误用在含子元素的节点上（会吞掉图标等子节点）
 * 4) en-US.json 状态（允许留空，运行时自动回退 zh-CN）
 */
import { readFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { analyzeHtml, getPath, walkFiles, readJson, ROOT, LANG_DIR } from './i18n-lib.mjs';

const zh = readJson(join(LANG_DIR, 'zh-CN.json'));
const en = readJson(join(LANG_DIR, 'en-US.json'));

/* ---------------- HTML ---------------- */
const used = new Map();
const addUsed = (key, where) => {
    if (!used.has(key)) used.set(key, new Set());
    used.get(key).add(where);
};

let htmlKeyCount = 0;
const pages = [];
for (const file of walkFiles(ROOT, ['.html'])) {
    const rel = relative(ROOT, file).split(sep).join('/');
    const result = analyzeHtml(readFileSync(file, 'utf8'));
    pages.push({ rel, ...result });
    for (const node of result.nodes) {
        if (!node.key) continue;
        htmlKeyCount++;
        addUsed(node.key, rel + ':' + node.line);
    }
}

/* ---------------- JS ---------------- */
const jsFiles = walkFiles(join(ROOT, 'Resource', 'JS'), ['.js']).filter(
    (f) => !/^(last-modified|changelog-source)\.js$/.test(f)
);
let jsKeyCount = 0;
for (const file of jsFiles) {
    const rel = relative(ROOT, file).split(sep).join('/');
    const src = readFileSync(file, 'utf8');
    const re = /(?:I18N\.t|bindText|bindAttr|data-i18n(?:-html|-placeholder|-title|-aria-label|-alt)?=)\s*\(?\s*['"]([a-z][A-Za-z0-9_.]*)['"]/g;
    let m;
    while ((m = re.exec(src))) {
        if (!/^[a-z]+(\.[A-Za-z0-9_-]+)+$/.test(m[1])) continue;
        jsKeyCount++;
        addUsed(m[1], rel);
    }
}

/* 动态拼接的键：nav.pages.* / nav.groups.* 由代码拼出，按字典内容视作已用 */
for (const id of Object.keys(zh.data.nav?.pages || {})) {
    addUsed('nav.pages.' + id + '.name', 'nav(dynamic)');
    addUsed('nav.pages.' + id + '.desc', 'nav(dynamic)');
}
for (const id of Object.keys(zh.data.nav?.groups || {})) {
    addUsed('nav.groups.' + id + '.name', 'nav(dynamic)');
}

const missing = [];
for (const [key, where] of used) {
    if (getPath(zh.data, key) === undefined) missing.push({ key, where: [...where] });
}

const emptyValues = [];
(() => {
    const walkDict = (obj, prefix) => {
        for (const [k, v] of Object.entries(obj)) {
            const path = prefix ? prefix + '.' + k : k;
            if (v && typeof v === 'object') walkDict(v, path);
            else if (typeof v === 'string' && !v.trim()) emptyValues.push(path);
        }
    };
    walkDict(zh.data, '');
})();

/* page.* 与 HTML 是否一致（字典值过时提示） */
const drift = [];
for (const page of pages) {
    for (const node of page.nodes) {
        if (!node.key.startsWith('page.')) continue;
        const value = getPath(zh.data, node.key);
        if (typeof value === 'string' && value !== node.value) {
            drift.push({ key: node.key, rel: page.rel, line: node.line, dict: value, html: node.value });
        }
    }
}

/* ---------------- 输出 ---------------- */
console.log('=== 语言文件 ===');
console.log(`zh-CN.json: ${zh.empty ? '空' : Object.keys(zh.data).length + ' 个顶层分组'}`);
console.log(`en-US.json: ${en.empty ? '空文件（未翻译，运行时回退 zh-CN）' : Object.keys(en.data).length + ' 个顶层分组'}`);

console.log('\n=== 键使用情况 ===');
console.log(`HTML 引用 ${htmlKeyCount} 处 / JS 引用 ${jsKeyCount} 处 / 唯一键 ${used.size} 个`);
console.log(`缺失键: ${missing.length}`);
for (const item of missing.slice(0, 40)) console.log(`  !! ${item.key} ← ${item.where.slice(0, 3).join(', ')}`);
if (missing.length > 40) console.log(`  ...另有 ${missing.length - 40} 个`);

if (emptyValues.length) {
    console.log(`\n空值键: ${emptyValues.length}`);
    for (const path of emptyValues.slice(0, 20)) console.log('  ! ' + path);
}

if (drift.length) {
    console.log(`\n字典与 HTML 不一致（请运行 node tools/i18n-extract.mjs）: ${drift.length} 处`);
    for (const item of drift.slice(0, 12)) {
        console.log(`  ~ ${item.rel}:${item.line} ${item.key}`);
        console.log(`      字典: ${item.dict}`);
        console.log(`      HTML: ${item.html}`);
    }
}

console.log('\n=== 未绑定的中文（按页面） ===');
let uncoveredTotal = 0;
for (const page of pages) {
    if (!page.uncovered.length) continue;
    uncoveredTotal += page.uncovered.length;
    console.log(`${page.rel} (${page.pageId}) → ${page.uncovered.length} 处`);
    for (const item of page.uncovered.slice(0, 8)) console.log(`   L${item.line} [${item.kind}] ${item.snippet}`);
    if (page.uncovered.length > 8) console.log(`   ...另有 ${page.uncovered.length - 8} 处`);
}
console.log(`\n合计未绑定: ${uncoveredTotal} 处`);

console.log('\n=== data-i18n 误用在含子元素的节点 ===');
let riskyTotal = 0;
for (const page of pages) {
    for (const item of page.risky) {
        riskyTotal++;
        console.log(`  ${page.rel} L${item.line} → ${item.key} (<${item.tag}>)`);
    }
}
if (!riskyTotal) console.log('  无');

const ok = missing.length === 0 && uncoveredTotal === 0 && riskyTotal === 0;
console.log('\n结果: ' + (ok ? '通过 ✅' : '需要处理 ⚠️'));
process.exit(ok ? 0 : 1);
