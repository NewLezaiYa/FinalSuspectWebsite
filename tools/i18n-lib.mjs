/**
 * i18n 工具公共库（供 tools/i18n-check.mjs 与 tools/i18n-extract.mjs 复用）
 *
 * 导出：
 *   analyzeHtml(html)      解析页面里登记的 data-i18n 键、未绑定中文、误用节点
 *   getPath(obj, path)     按 a.b.c 取值
 *   walkFiles(dir, exts)   递归收集文件（忽略 .git / node_modules / .github / tools）
 *   readJson(file)         读取 JSON（空文件返回 { data: {}, empty: true }）
 *   LANG_DIR / ROOT / SKIP_DIRS
 *
 * 解析规则与 Resource/JS/language.js 保持一致：
 *   data-i18n             → 元素纯文本
 *   data-i18n-html        → 元素 innerHTML
 *   data-i18n-<attr>      → 属性（placeholder / title / aria-label / alt）
 *   p.xxx                 → page.<body data-page>.xxx
 */

import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const SKIP_TEXT_TAGS = new Set(['script', 'style', 'pre', 'code', 'kbd', 'samp']);
const VOID_TAGS = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);
export const ATTRS = ['placeholder', 'title', 'aria-label', 'alt'];

const CJK = /[\u4e00-\u9fff]/;
const SKIP_CLASS_RE = /(^|\s)(credit__(?:name|avatar|role))(\s|$)/;

function collapse(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
}

function stripTags(html) {
    return collapse(
        html
            .replace(/<br\s*\/?>/gi, ' ')
            .replace(/<[^>]*>/g, '')
            .replace(/&nbsp;/g, ' ')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&amp;/g, '&')
    );
}

export function analyzeHtml(html) {
    const bodyMatch = /<body\b[^>]*\bdata-page="([^"]+)"/i.exec(html);
    const pageId = bodyMatch ? bodyMatch[1] : '';

    const clean = html
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<style[\s\S]*?<\/style>/gi, '');

    const stack = [];
    const nodes = [];
    const uncovered = [];
    const risky = [];

    const covered = () => {
        for (let i = stack.length - 1; i >= 0; i--) {
            const attrs = stack[i].attrs;
            if (attrs['data-i18n'] || attrs['data-i18n-html']) return true;
        }
        return false;
    };

    const re = /<(\/?)([a-zA-Z][\w:-]*)((?:"[^"]*"|'[^']*'|[^>"'])*)>|([^<]+)/g;
    let m;
    let line = 1;
    let lastIndex = 0;

    /* 由 JS 动态写入、不参与静态翻译的节点（例如首页日志入口的“了解”占位） */
    const isDynamic = () => stack.some((node) => /(^|\s)id="logMeta"/.test(node.attrText || ''));

    const countLines = (to) => {
        for (let i = lastIndex; i < to; i++) if (clean[i] === '\n') line++;
        lastIndex = to;
    };

    const resolve = (key) => (key.startsWith('p.') ? 'page.' + pageId + '.' + key.slice(2) : key);

    while ((m = re.exec(clean))) {
        countLines(m.index);
        const closing = m[1];
        const tag = (m[2] || '').toLowerCase();
        const attrText = m[3] || '';
        const text = m[4];

        if (closing) {
            for (let i = stack.length - 1; i >= 0; i--) {
                if (stack[i].tag === tag) {
                    const node = stack[i];
                    const inner = clean.slice(node.innerStart, m.index);
                    if (node.attrs['data-i18n']) {
                        if (node.hasChildElement) {
                            risky.push({ line: node.line, key: node.attrs['data-i18n'], tag: node.tag });
                        }
                        nodes.push({
                            key: resolve(node.attrs['data-i18n']),
                            kind: 'text',
                            value: stripTags(inner),
                            line: node.line,
                            tag: node.tag,
                            raw: node.attrs['data-i18n']
                        });
                    } else if (node.attrs['data-i18n-html']) {
                        nodes.push({
                            key: resolve(node.attrs['data-i18n-html']),
                            kind: 'html',
                            value: collapse(inner),
                            line: node.line,
                            tag: node.tag,
                            raw: node.attrs['data-i18n-html']
                        });
                    }
                    stack.length = i;
                    break;
                }
            }
            continue;
        }

        if (text != null) {
            const value = text.trim();
            const inSkipped = stack.some((n) => SKIP_TEXT_TAGS.has(n.tag) || n.skipClass);
            if (value && CJK.test(value) && !covered() && !isDynamic() && !inSkipped) {
                uncovered.push({ line, kind: 'text', snippet: value.slice(0, 70) });
            }
            continue;
        }

        const attrs = {};
        const attrRe = /([\w:-]+)\s*=\s*"([^"]*)"/g;
        let am;
        while ((am = attrRe.exec(attrText))) attrs[am[1].toLowerCase()] = am[2];

        if (stack.length && !VOID_TAGS.has(tag)) stack[stack.length - 1].hasChildElement = true;

        for (const attr of ATTRS) {
            const value = attrs[attr];
            if (value && CJK.test(value) && !attrs['data-i18n-' + attr]) {
                uncovered.push({ line, kind: attr, snippet: value.slice(0, 70) });
            }
            const key = attrs['data-i18n-' + attr];
            if (key) {
                nodes.push({
                    key: resolve(key),
                    kind: attr,
                    value: value || '',
                    line,
                    tag,
                    raw: key
                });
            }
        }

        for (const attrName of ['data-i18n', 'data-i18n-html']) {
            /* 文本/HTML 的实际取值在闭合标签处补齐，这里只做属性键的收集 */
            void attrs[attrName];
        }

        if (!VOID_TAGS.has(tag)) {
            if (!/\/$/.test(attrText)) {
                stack.push({
                    tag,
                    attrs,
                    attrText,
                    line,
                    innerStart: m.index + m[0].length,
                    hasChildElement: false,
                    skipClass: SKIP_CLASS_RE.test(attrs['class'] || '')
                });
            }
        }
    }

    /* 移除占位节点（真正的值在闭合标签时补上） */
    const real = nodes.filter((n) => !n.pending);

    return { pageId, nodes: real, uncovered, risky };
}

export function getPath(obj, path) {
    let cur = obj;
    for (const part of String(path).split('.')) {
        if (!cur || typeof cur !== 'object') return undefined;
        cur = cur[part];
    }
    return cur;
}

/* ------------------------------------------------------------------ */
/* 文件 / JSON 公共工具                                                */
/* ------------------------------------------------------------------ */

export const ROOT = process.cwd();
export const LANG_DIR = join(ROOT, 'Resource', 'lang');
export const SKIP_DIRS = new Set(['.git', 'node_modules', '.github', 'tools']);

/** 递归收集指定扩展名的文件，跳过构建 / 仓库目录 */
export function walkFiles(dir, exts, out = []) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        if (SKIP_DIRS.has(entry.name) || entry.name.startsWith('_')) continue; // 跳过临时/调试文件
        const full = join(dir, entry.name);
        if (entry.isDirectory()) walkFiles(full, exts, out);
        else if (exts.some((ext) => entry.name.endsWith(ext))) out.push(full);
    }
    return out;
}

/** 读取 JSON；空文件或读不到时返回空字典（en-US.json 允许留空） */
export function readJson(file) {
    try {
        const raw = readFileSync(file, 'utf8').trim();
        if (!raw) return { data: {}, empty: true };
        return { data: JSON.parse(raw), empty: false };
    } catch (err) {
        throw new Error(`无法解析 ${relative(ROOT, file).split(sep).join('/')}：${err.message}`);
    }
}