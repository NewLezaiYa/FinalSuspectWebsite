#!/usr/bin/env node
/**
 * extract-changelog.mjs
 * 从旧版 FinalSuspect/Changelog.html 中解析出版本与改动条目，
 * 生成结构化数据文件 Resource/JS/changelog-data.js
 *
 * 用法：node tools/extract-changelog.mjs [源文件]
 */
import { readFileSync, writeFileSync } from 'node:fs';

const SRC = process.argv[2] || 'FinalSuspect/Changelog.html';
const OUT = 'Resource/JS/changelog-data.js';

const html = readFileSync(SRC, 'utf8');

/** 归类映射：旧 class → 新 key */
const KIND = {
    'section-fix': 'fix',
    'section-optimize': 'opt',
    'section-change': 'change',
    'section-new': 'add',
    'section-remove': 'remove',
    'section-reset': 'reset'
};

const strip = (s) =>
    s
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/\s+/g, ' ')
        .trim();

/** 用正则按 `version-badge` 切块，每块是一个版本 */
const blocks = html.split(/<div class="changelog-content">/).slice(1);

const versions = [];

for (const block of blocks) {
    const badge = block.match(/<div class="version-badge"\s+id="([^"]+)">([^<]+)</);
    if (!badge) continue;
    const id = badge[1];
    const badgeText = strip(badge[2]);

    const version = (badgeText.match(/^([\d.]+)/) || [, ''])[1];
    const type = /OpenBeta|预览/i.test(badgeText) ? '预览版' : '正式版';
    const dateRaw = (id.match(/_(\d{8})$/) || [, ''])[1];
    const date = dateRaw
        ? `${dateRaw.slice(0, 4)}-${dateRaw.slice(4, 6)}-${dateRaw.slice(6, 8)}`
        : '';

    // 版本元信息：对应官方版本 / BepInEx / 版本类型
    const metaBlock = block.slice(0, block.indexOf('update-section') === -1 ? block.length : block.indexOf('update-section'));
    const metaCells = [...metaBlock.matchAll(/<div class="info-card">([\s\S]*?)<\/div>\s*<\/div>/g)].map((m) =>
        strip(m[1])
    );

    // 改动分类
    const groups = [];
    const sectionRe = /<div class="update-section section-(\w+)"[^>]*>([\s\S]*?)(?=<div class="update-section|<\/div>\s*<\/div>\s*<\/div>|$)/g;
    let m;
    while ((m = sectionRe.exec(block)) !== null) {
        const cls = 'section-' + m[1];
        const kind = KIND[cls];
        if (!kind) continue;
        const body = m[2];
        const titleM = body.match(/<div class="section-title">([\s\S]*?)<\/div>/);
        const title = titleM ? strip(titleM[1]).replace(/^\S+\s*/, '') : kind;
        const items = [...body.matchAll(/<div class="update-item[^"]*"[^>]*>([\s\S]*?)<\/div>/g)]
            .map((x) => strip(x[1]))
            .filter(Boolean);
        if (items.length) groups.push({ kind, title, items });
    }

    if (groups.length) {
        versions.push({ id, version, type, date, badge: badgeText, meta: metaCells, groups });
    }
}

const payload = `/* ============================================================================
 * FinalSuspect Website — changelog-data.js
 * 由 tools/extract-changelog.mjs 从旧版 Changelog.html 解析生成
 * 重新生成：node tools/extract-changelog.mjs
 * 顺序：新 → 旧
 * ========================================================================== */
window.CHANGELOG = ${JSON.stringify(versions, null, 2)};
`;

writeFileSync(OUT, payload, 'utf8');
const total = versions.reduce((n, v) => n + v.groups.reduce((k, g) => k + g.items.length, 0), 0);
console.log(`已生成 ${OUT}`);
console.log(`版本数：${versions.length}，改动条目：${total}`);
versions.forEach((v) => console.log(`  ${v.id}  ${v.version} ${v.type} ${v.date}  分组 ${v.groups.length}`));
