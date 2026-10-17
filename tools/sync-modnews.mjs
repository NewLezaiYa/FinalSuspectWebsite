/**
 * 把 Resource/ModNews 下的 md 文件同步进 Resource/JS/changelog-source.js 的清单。
 *
 * 用法：node tools/sync-modnews.mjs
 * 规则：文件名必须是 FS.v<版本>_<YYYYMMDD>.md，例如 FS.v1.5_20261010.md
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const ROOT = process.cwd();
const DIR = join(ROOT, 'Resource', 'ModNews');
const TARGET = join(ROOT, 'Resource', 'JS', 'changelog-source.js');
const START = '  // <modnews:files>';
const END = '  // </modnews:files>';
const NAME_RE = /^FS\.v(\d+(?:\.\d+)*)_(\d{4})(\d{2})(\d{2})\.md$/i;

let entries = [];
try {
    entries = readdirSync(DIR, { withFileTypes: true })
        .filter((e) => e.isFile() && /\.md$/i.test(e.name))
        .map((e) => e.name);
} catch (err) {
    console.error(`读取目录失败：${DIR}\n${err.message}`);
    process.exit(1);
}

function sortKey(name) {
    const m = NAME_RE.exec(name);
    return { version: m[1], date: `${m[2]}-${m[3]}-${m[4]}`, versionNumber: m[1].split('.').map(Number) };
}

function compare(a, b) {
    const ka = sortKey(a);
    const kb = sortKey(b);
    if (ka.date !== kb.date) return ka.date < kb.date ? 1 : -1;
    const len = Math.max(ka.versionNumber.length, kb.versionNumber.length);
    for (let i = 0; i < len; i++) {
        const d = (ka.versionNumber[i] || 0) - (kb.versionNumber[i] || 0);
        if (d !== 0) return d;
    }
    return 0;
}

const valid = entries.filter((n) => NAME_RE.test(n));
const invalid = entries.filter((n) => !NAME_RE.test(n)).sort();
valid.sort(compare);

const source = readFileSync(TARGET, 'utf8');
// 跟随目标文件的换行风格（仓库里的手写文件用 CRLF）
const eol = source.includes('\r\n') ? '\r\n' : '\n';
const block = [
    START,
    '  var FILES = [',
    ...valid.map((n) => `    '${n}'${valid[valid.length - 1] === n ? '' : ','}`),
    '  ];',
    END,
].join(eol);

const startIndex = source.indexOf(START);
const endIndex = source.indexOf(END);

if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
    console.error(`没有在 ${relative(ROOT, TARGET).split(sep).join('/')} 里找到 <modnews:files> 标记，已中止。`);
    process.exit(1);
}

const next = source.slice(0, startIndex) + block + source.slice(endIndex + END.length);

if (next === source) {
    console.log(`清单已是最新：${valid.length} 个版本文件。`);
} else {
    writeFileSync(TARGET, next, 'utf8');
    console.log(`已写入 ${relative(ROOT, TARGET).split(sep).join('/')}：${valid.length} 个版本文件。`);
}

console.log(`  目录：${relative(ROOT, DIR).split(sep).join('/')}`);
console.log(`  清单：${valid.join('、')}`);

if (invalid.length) {
    console.warn('\n以下文件不符合 FS.v<版本>_<YYYYMMDD>.md 命名，已跳过：');
    for (const name of invalid) console.warn(`  - ${name}`);
}
