#!/usr/bin/env node
/**
 * verify-site.mjs
 * 全站静态自检：
 *   1. 每页 <script> / <link> 引用的本地文件是否存在
 *   2. HTML 标签配对（忽略自闭合与 void 元素）
 *   3. 站内链接目标是否存在（.html / 目录 / 无扩展名的优雅链接）
 *   4. 图片 src 是否存在（跳过外链与 data:）
 *   5. 是否残留旧类名 / 旧脚本引用 / 绝对路径
 *
 * 用法：node tools/verify-site.mjs
 */
import { readdirSync, statSync, existsSync, readFileSync } from 'node:fs';
import { join, dirname, relative, resolve, sep } from 'node:path';

const ROOT = process.cwd();
const IGNORE_DIRS = new Set(['.git', 'node_modules', '.vscode', '.github']);

/* ---------- 收集所有 html ---------- */
function walk(dir, out = []) {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
        if (e.isDirectory()) {
            if (IGNORE_DIRS.has(e.name)) continue;
            walk(join(dir, e.name), out);
        } else if (e.name.endsWith('.html')) {
            out.push(join(dir, e.name));
        }
    }
    return out;
}

const pages = walk(ROOT);
const problems = [];
const warnings = [];

const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
    'link', 'meta', 'param', 'source', 'track', 'wbr']);

const OLD_CLASSES = ['container', 'back-button', 'back-to-top', 'wechat-modal', 'modal-content',
    'changelog-btn', 'appreciate-btn', 'image-grid', 'image-wrapper', 'guide-img',
    'content-section', 'outfit-list', 'outfit-item', 'loading-content', 'version-nav',
    'update-section', 'update-item', 'changelog-content', 'version-badge', 'footer-copyright',
    'footer-meta', 'edit-time', 'jump-btn', 'btn-group', 'section-title', 'section-content'];

const OLD_SCRIPTS = ['h1.js', 'h2.js', 'h3.js', 'main.js', 'Appreciate.js', 'Wechat.js',
    'BackToTop.js', 'Image.js', 'Copy.js', 'Version.js', '404.js', 'Errorcode.js',
    'Load.js', 'index.js'];

/* ---------- 逐页检查 ---------- */
for (const file of pages) {
    const rel = relative(ROOT, file).split(sep).join('/');
    const html = readFileSync(file, 'utf8');
    const dir = dirname(file);

    /* 1. 本地资源引用是否存在 */
    const refRe = /<(?:script|link|img)\b[^>]*?(?:src|href)=["']([^"']+)["']/g;
    let m;
    while ((m = refRe.exec(html)) !== null) {
        const url = m[1].trim();
        if (/^(https?:|data:|mailto:|#|\/\/)/i.test(url)) continue;
        if (url.startsWith('/')) {
            problems.push(`${rel}: 使用根绝对路径 "${url}"（应改为相对路径）`);
            continue;
        }
        const target = resolve(dir, url.split('?')[0].split('#')[0]);
        if (!existsSync(target)) problems.push(`${rel}: 引用的文件不存在 → ${url}`);
    }

    /* 2. 旧脚本引用 */
    for (const s of OLD_SCRIPTS) {
        if (new RegExp(`Resource/JS/${s.replace('.', '\\.')}['"]`).test(html)) {
            problems.push(`${rel}: 仍引用已废弃脚本 ${s}`);
        }
    }

    /* 3. 旧类名残留 */
    const classAttrs = [...html.matchAll(/class="([^"]*)"/g)].map((x) => x[1]);
    const used = new Set();
    classAttrs.forEach((c) => c.split(/\s+/).forEach((k) => k && used.add(k)));
    for (const c of OLD_CLASSES) {
        if (used.has(c)) warnings.push(`${rel}: 出现旧类名 .${c}`);
    }

    /* 4. 标签配对 */
    const stack = [];
    const tagRe = /<(\/?)([a-zA-Z][a-zA-Z0-9-]*)\b([^>]*)>/g;
    let t;
    while ((t = tagRe.exec(html)) !== null) {
        const closing = t[1] === '/';
        const name = t[2].toLowerCase();
        const attrs = t[3] || '';
        if (VOID.has(name) || attrs.endsWith('/')) continue;
        if (name === 'script' || name === 'style') {
            /* 跳过脚本/样式内部内容 */
            if (!closing) {
                const end = html.indexOf(`</${name}>`, tagRe.lastIndex);
                if (end === -1) { problems.push(`${rel}: <${name}> 未闭合`); break; }
                tagRe.lastIndex = end + name.length + 3;
            }
            continue;
        }
        if (!closing) stack.push({ name, index: t.index });
        else {
            const top = stack.pop();
            if (!top) problems.push(`${rel}: 多余的 </${name}>`);
            else if (top.name !== name) {
                problems.push(`${rel}: 标签不匹配，<${top.name}> 被 </${name}> 关闭`);
            }
        }
    }
    if (stack.length) {
        problems.push(`${rel}: 未闭合标签 ${stack.map((s) => '<' + s.name + '>').join(', ')}`);
    }

    /* 5. 站内链接目标 */
    const linkRe = /<a\b[^>]*href=["']([^"']+)["']/g;
    while ((m = linkRe.exec(html)) !== null) {
        const url = m[1].trim();
        if (/^(https?:|mailto:|#|\/\/|javascript:)/i.test(url)) continue;
        if (url.startsWith('/')) continue; /* 已在上方报错 */
        const clean = url.split('#')[0].split('?')[0];
        if (!clean) continue;
        const target = resolve(dir, clean);
        const cands = [target, target + '.html', join(target, 'index.html')];
        if (!cands.some((c) => existsSync(c))) {
            problems.push(`${rel}: 死链 → ${url}`);
        }
    }

    /* 6. 必备外壳声明 */
    if (!/data-shell=/.test(html)) problems.push(`${rel}: <body> 缺少 data-shell 声明`);
    if (!/Resource\/JS\/Nav\.js/.test(html)) problems.push(`${rel}: 缺少 Nav.js 引用`);
}

/* ---------- CSS import 链 ---------- */
const entry = join(ROOT, 'Resource/CSS/cyberpunk.css');
if (existsSync(entry)) {
    const css = readFileSync(entry, 'utf8');
    for (const im of css.matchAll(/@import\s+url\(['"]?([^'")]+)['"]?\)/g)) {
        const p = join(dirname(entry), im[1]);
        if (!existsSync(p)) problems.push(`cyberpunk.css: @import 目标不存在 → ${im[1]}`);
    }
}

/* ---------- 输出 ---------- */
console.log(`检查页面：${pages.length} 个`);
console.log('');

if (problems.length) {
    console.log(`❌ 错误 ${problems.length} 条：`);
    problems.forEach((p) => console.log('   • ' + p));
} else {
    console.log('✅ 无错误');
}

if (warnings.length) {
    console.log('');
    console.log(`⚠️  提示 ${warnings.length} 条：`);
    warnings.forEach((p) => console.log('   • ' + p));
}

process.exit(problems.length ? 1 : 0);
