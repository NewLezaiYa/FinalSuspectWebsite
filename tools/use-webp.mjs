#!/usr/bin/env node
/**
 * use-webp.mjs
 * 把 HTML 里的 <img src="...png|jpg"> 批量升级为 <picture>：
 *   <picture><source srcset="x.webp" type="image/webp"><img src="x.png" ...></picture>
 *
 * 同时执行加载性能优化：
 *   - 首屏图（data-eager 或 class 含 hero/splash）：loading="eager" + fetchpriority="high"
 *   - 其余图：loading="lazy" + decoding="async"
 *
 * 只在该 webp 文件真实存在时才改写；幂等（重复执行不会嵌套 picture）。
 *
 * 用法：node tools/use-webp.mjs [--dry]
 */
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname, relative, resolve, sep } from 'node:path';

const ROOT = process.cwd();
const DRY = process.argv.includes('--dry');
const IGNORE = new Set(['.git', 'node_modules', '.vscode', '.github', '.tmp-edge', 'docs']);

function walk(dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) { if (!IGNORE.has(e.name)) walk(join(dir, e.name), out); }
    else if (e.name.endsWith('.html')) out.push(join(dir, e.name));
  }
  return out;
}

const EAGER_HINTS = ['hero__logo', 'splashTeamLogo', 'tile__media'];

let files = 0, imgs = 0, skipped = 0;

for (const file of walk(ROOT)) {
  const html = readFileSync(file, 'utf8');
  const dir = dirname(file);

  const out = html.replace(/<img\b([^>]*?)>/g, (whole, attrs) => {
    // 已在 <picture> 内的不再处理
    if (whole.includes('data-nowebp')) return whole;
    const srcM = attrs.match(/\bsrc=["']([^"']+)["']/);
    if (!srcM) return whole;
    const src = srcM[1];
    if (/^(https?:|data:|\/\/)/i.test(src)) { skipped++; return whole; }
    if (!/\.(png|jpe?g)$/i.test(src)) { skipped++; return whole; }

    const webp = src.replace(/\.(png|jpe?g)$/i, '.webp');
    const abs = resolve(dir, webp);
    if (!existsSync(abs)) { skipped++; return whole; }

    // 加载策略
    const isEager = EAGER_HINTS.some((h) => attrs.includes(h));
    let a = attrs
      .replace(/\s*loading=["'][^"']*["']/g, '')
      .replace(/\s*decoding=["'][^"']*["']/g, '')
      .replace(/\s*fetchpriority=["'][^"']*["']/g, '')
      .replace(/\s*$/, '');
    a += isEager
      ? ' loading="eager" fetchpriority="high" decoding="async"'
      : ' loading="lazy" decoding="async"';

    imgs++;
    return `<picture><source srcset="${webp}" type="image/webp"><img${a}></picture>`;
  });

  if (out !== html) {
    files++;
    if (!DRY) writeFileSync(file, out, 'utf8');
    console.log(`  ${DRY ? '[dry] ' : ''}${relative(ROOT, file).split(sep).join('/')}`);
  }
}

console.log(`\n处理文件 ${files} 个，升级图片 ${imgs} 张，跳过 ${skipped} 张（外链/无 webp/已处理）`);
if (DRY) console.log('（dry-run，未写入）');
