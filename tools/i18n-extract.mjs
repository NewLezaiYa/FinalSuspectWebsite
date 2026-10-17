/**
 * 从 HTML 提取 page.* 文案并写入 Resource/lang/zh-CN.json
 *
 * 用法：node tools/i18n-extract.mjs [--dry]
 * 说明：
 *   - HTML 是中文文案的唯一来源（data-i18n / data-i18n-html / data-i18n-<attr> 上的兜底文本）
 *   - 只重写字典里的 "page" 分组，ui / nav / css / splash 等公共分组保持不动
 *   - 同一页面里同一个键出现多次但文案不同时：
 *       · 其中一个是 <title>（网页标题）→ 把 <title> 的键自动改成 p.docTitle
 *       · 其它情况 → 报告冲突，需人工处理
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { analyzeHtml, walkFiles, ROOT, LANG_DIR } from './i18n-lib.mjs';

const LANG_FILE = join(LANG_DIR, 'zh-CN.json');
const DRY = process.argv.includes('--dry');

const dict = JSON.parse(readFileSync(LANG_FILE, 'utf8'));
const pageDict = {};
const conflicts = [];
const renamed = [];
let sharedSkipped = 0;

for (const file of walkFiles(ROOT, ['.html'])) {
    const rel = relative(ROOT, file).split(sep).join('/');
    let html = readFileSync(file, 'utf8');
    const original = html;
    const { pageId, nodes } = analyzeHtml(html);
    if (!pageId) continue;

    const prefix = 'page.' + pageId + '.';
    const byKey = new Map();

    for (const node of nodes) {
        if (!node.key.startsWith(prefix)) {
            sharedSkipped++;
            continue;
        }
        if (!node.value) continue;
        const shortKey = node.key.slice(prefix.length);
        if (!byKey.has(shortKey)) byKey.set(shortKey, []);
        byKey.get(shortKey).push(node);
    }

    const bucket = pageDict[pageId] || (pageDict[pageId] = {});

    for (const [shortKey, list] of byKey) {
        const values = [...new Set(list.map((n) => n.value))];

        if (values.length === 1) {
            bucket[shortKey] = values[0];
            continue;
        }

        const titleNode = list.find((n) => n.tag === 'title');
        const others = list.filter((n) => n.tag !== 'title');
        const otherValues = [...new Set(others.map((n) => n.value))];

        if (titleNode && otherValues.length === 1) {
            bucket[shortKey] = otherValues[0];
            bucket.docTitle = titleNode.value;
            if (shortKey === 'title') {
                /* 把 <title> 上的键从 p.title 改成 p.docTitle */
                const before = html;
                html = html.replace(
                    /(<title\b[^>]*?\bdata-i18n=")p\.title(")/i,
                    '$1p.docTitle$2'
                );
                if (html !== before) renamed.push(rel);
                bucket.title = otherValues[0];
            }
            continue;
        }

        conflicts.push(
            `${rel}: 键 ${prefix}${shortKey} 出现 ${values.length} 种文案 → ` +
            values.map((v) => `「${v.slice(0, 40)}」`).join(' / ')
        );
    }

    if (!DRY && html !== original) writeFileSync(file, html, 'utf8');
}

dict.page = pageDict;

if (!DRY) writeFileSync(LANG_FILE, JSON.stringify(dict, null, 2) + '\n', 'utf8');

const pageCount = Object.keys(pageDict).length;
const keyCount = Object.values(pageDict).reduce((sum, item) => sum + Object.keys(item).length, 0);
console.log(`${DRY ? '[dry] ' : ''}已同步 ${pageCount} 个页面、${keyCount} 条文案 → Resource/lang/zh-CN.json`);
if (sharedSkipped) console.log(`跳过公共键（ui.* / nav.* 等）: ${sharedSkipped} 处`);
if (renamed.length) console.log(`<title> 键改为 p.docTitle: ${[...new Set(renamed)].join(', ')}`);
if (conflicts.length) {
    console.log(`\n需要人工确认 ${conflicts.length} 处：`);
    for (const item of conflicts.slice(0, 30)) console.log('  ! ' + item);
    process.exitCode = 1;
}
