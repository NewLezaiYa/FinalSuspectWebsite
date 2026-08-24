#!/usr/bin/env node
/**
 * update-last-modified.mjs
 * 自动生成 Resource/JS/last-modified.js
 *
 * 时间来源（取较新者）：
 *  1. git 最后提交时间（git log -1 --format=%cd）
 *  2. 本地文件修改时间（mtime，用于本地有未提交更改的情况）
 *
 * 用法：node tools/update-last-modified.mjs
 */
import { spawnSync } from 'node:child_process';
import { readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const ROOT = process.cwd();

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
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const files = [...collectHtml(join(ROOT, 'FinalSuspect')), join(ROOT, 'index.html')];

const map = {};
for (const f of files) {
    const rel = relative(ROOT, f).split(sep).join('/');
    const gitT = gitLastCommit(f);
    const mt = localMtime(f);
    // 取较新者：本地有未提交修改时优先显示本地修改时间
    map[rel] = !gitT || mt > gitT ? mt : gitT;
}

const lines = Object.keys(map).sort().map((k) => `  "${k}": "${map[k]}"`);
const content = `// Auto-generated from git log + local mtime - do not edit manually\n// Regenerate: node tools/update-last-modified.mjs\nwindow.LAST_MODIFIED = {\n${lines.join(',\n')}\n};\n`;

writeFileSync(join(ROOT, 'Resource', 'JS', 'last-modified.js'), content, 'utf8');
console.log(`last-modified.js 已更新：${lines.length} 个页面`);
