#!/usr/bin/env node
/**
 * bump-assets.mjs
 * 给页面里引用的本地 CSS / JS 加内容版本号（?v=<hash>），彻底绕开浏览器缓存。
 *
 *   href="Resource/CSS/layout.css"      →  href="Resource/CSS/layout.css?v=a1b2c3d4"
 *   src="../../Resource/JS/shell.js"          →  src="../../Resource/JS/shell.js?v=a1b2c3d4"
 *
 * 版本号 = Resource/CSS 与 Resource/JS 下全部文件的「名称 + 大小 + 修改时间」哈希后 8 位，
 * 任何一次样式或脚本改动都会生成新版本号，从而强制浏览器重新拉取。
 *
 * 幂等：重复执行只会替换已有的 ?v=，不会叠加。
 * 用法：node tools/bump-assets.mjs
 */
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join, basename } from 'node:path';
import { createHash } from 'node:crypto';

const ROOT = process.cwd();
const IGNORE = new Set(['.git', 'node_modules', '.vscode', '.github', 'docs', '.tmp-edge']);

function walk(dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) { if (!IGNORE.has(e.name)) walk(join(dir, e.name), out); }
    else if (e.name.endsWith('.html')) out.push(join(dir, e.name));
  }
  return out;
}

/* ---- 计算版本号：所有 CSS（含被 @import 的分册）+ 所有 JS ---- */
const hash = createHash('sha1');
for (const dir of ['Resource/CSS', 'Resource/JS']) {
  for (const f of readdirSync(join(ROOT, dir)).sort()) {
    const p = join(ROOT, dir, f);
    const st = statSync(p);
    hash.update(f + ':' + st.size + ':' + Math.round(st.mtimeMs));
  }
}
const V = hash.digest('hex').slice(0, 8);

let files = 0, refs = 0;

for (const f of walk(ROOT)) {
  const html = readFileSync(f, 'utf8');
  const out = html.replace(
    /(["'])([^"']*?Resource\/(?:CSS|JS)\/[^"'?]+\.(?:css|js))(?:\?v=[0-9a-f]+)?\1/g,
    (m, q, url) => { refs++; return q + url + '?v=' + V + q; }
  );
  if (out !== html) { writeFileSync(f, out, 'utf8'); files++; }
}

console.log(`资源版本号：${V}`);
console.log(`更新 ${files} 个页面，改写 ${refs} 处引用`);
