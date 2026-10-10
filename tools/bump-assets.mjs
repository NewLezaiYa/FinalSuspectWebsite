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
