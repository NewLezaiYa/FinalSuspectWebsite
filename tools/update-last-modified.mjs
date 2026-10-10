/**
 * 用法：node tools/update-last-modified.mjs
 */
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const ROOT = process.cwd();
const STATE_FILE = join(ROOT, 'tools', '.last-modified-state.json');
const OUT_FILE = join(ROOT, 'Resource', 'JS', 'last-modified.js');
const STATE_VERSION = 1;

/** 递归收集目录下所有 .html */
function collectHtml(dir, out = []) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const p = join(dir, entry.name);
        if (entry.isDirectory()) collectHtml(p, out);
        else if (entry.name.endsWith('.html')) out.push(p);
    }
    return out;
}

/** git 最后提交时间（本地时区 YYYY-MM-DD HH:MM），无记录返回 null */
function gitLastCommit(absPath) {
    const rel = relative(ROOT, absPath).split(sep).join('/');
    const r = spawnSync('git', ['log', '-1', '--format=%cd', '--date=format:%Y-%m-%d %H:%M', '--', rel], {
        cwd: ROOT,
        encoding: 'utf8',
    });
    if (r.status !== 0) return null;
    const t = (r.stdout || '').trim();
    return t || null;
}

/** 本地文件修改时间（本地时区 YYYY-MM-DD HH:MM） */
function localMtime(absPath) {
    const d = statSync(absPath).mtime;
    return fmt(d);
}

function fmt(d) {
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** 规范化内容：去掉资源版本号，使 ?v= 变化不影响指纹 */
function normalize(src) {
    return src.replace(/\?v=[0-9a-f]+\b/g, '');
}

/** 内容指纹 */
function fingerprint(absPath) {
    return createHash('sha1').update(normalize(readFileSync(absPath, 'utf8')), 'utf8').digest('hex').slice(0, 16);
}

/** 读取快照 */
function readState() {
    if (!existsSync(STATE_FILE)) return {};
    try {
        const json = JSON.parse(readFileSync(STATE_FILE, 'utf8'));
        return (json && json.files) || {};
    } catch (e) {
        console.warn('快照文件损坏，将重新生成：' + STATE_FILE);
        return {};
    }
}

const files = [...collectHtml(join(ROOT, 'FinalSuspect')), join(ROOT, 'index.html')];
const oldState = readState();
const state = {};
const map = {};
const changed = [];
let kept = 0;

for (const f of files) {
    const rel = relative(ROOT, f).split(sep).join('/');
    const fp = fingerprint(f);
    const prev = oldState[rel];

    let time;
    if (prev && prev.hash === fp) {
        time = prev.time; // 内容未变，沿用原时间
        kept++;
    } else if (prev) {
        time = localMtime(f); // 内容确实改了
        changed.push(rel);
    } else {
        time = gitLastCommit(f) || localMtime(f); // 首次记录：用 git 提交时间做种子
        changed.push(rel + '（首次记录）');
    }

    state[rel] = { hash: fp, time: time };
    map[rel] = time;
}

const lines = Object.keys(map).sort().map((k) => `  "${k}": "${map[k]}"`);
const content = `// Auto-generated from content fingerprint snapshot - do not edit manually\n// Regenerate: node tools/update-last-modified.mjs\n// Snapshot: tools/.last-modified-state.json\nwindow.LAST_MODIFIED = {\n${lines.join(',\n')}\n};\n`;

writeFileSync(OUT_FILE, content, 'utf8');
writeFileSync(
    STATE_FILE,
    JSON.stringify({ version: STATE_VERSION, files: Object.keys(state).sort().reduce((o, k) => (o[k] = state[k], o), {}) }, null, 2) + '\n',
    'utf8'
);

console.log(`last-modified.js 已更新：${lines.length} 个页面（${kept} 个内容未变沿用原时间，${changed.length} 个刷新）`);
if (changed.length) console.log('  刷新：' + changed.join('、'));
