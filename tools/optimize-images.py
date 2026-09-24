#!/usr/bin/env python3
"""
optimize-images.py
把 Resource/images 下的大图转成 WebP（PNG 保留作为回退），并输出体积对比。

策略：
  * 截图 / 图标 / Logo：保持原始分辨率，quality 80（文字边缘锐利，肉眼无损）
  * 背景大图（名字含 BG / Preview）：限制最大宽度 1600px，quality 78（本就是装饰性背景）

用法：python tools/optimize-images.py [--max-width 1600] [--quality 80] [--dry-run]
"""
import argparse
import os
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    sys.exit("需要 Pillow：python -m pip install Pillow")

ROOT = Path(__file__).resolve().parent.parent
IMAGES = ROOT / "Resource" / "images"

# 这些是装饰性背景，可以安全降分辨率
BACKGROUND_HINTS = ("-BG-", "Preview")

# Logo 实际显示宽度都在 600px 以内，原图 4000px 属于严重浪费
LOGO_MAX_WIDTH = 1800


def is_background(name: str) -> bool:
    return any(h in name for h in BACKGROUND_HINTS)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--max-width", type=int, default=1600)
    ap.add_argument("--quality", type=int, default=80)
    ap.add_argument("--bg-quality", type=int, default=78)
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    files = sorted(p for p in IMAGES.iterdir() if p.suffix.lower() in (".png", ".jpg", ".jpeg"))
    if not files:
        sys.exit("未找到图片")

    total_before = total_after = 0
    print(f"{'文件':<52}{'原大小':>10}{'WebP':>10}{'省':>8}  尺寸")
    print("-" * 100)

    for f in files:
        before = f.stat().st_size
        total_before += before
        out = f.with_suffix(".webp")
        bg = is_background(f.name)
        is_logo = "Logo" in f.name or "LOGO" in f.name
        max_w = args.max_width if bg else (LOGO_MAX_WIDTH if is_logo else None)
        quality = args.bg_quality if bg else args.quality

        try:
            with Image.open(f) as im:
                orig_size = im.size
                work = im
                if max_w and im.width > max_w:
                    h = round(im.height * max_w / im.width)
                    work = im.resize((max_w, h), Image.LANCZOS)
                if work.mode in ("RGBA", "LA", "P"):
                    work = work.convert("RGBA")
                elif work.mode != "RGB":
                    work = work.convert("RGB")

                if args.dry_run:
                    # 估算：WebP 通常约为 PNG 的 20%~35%
                    after = int(before * (0.25 if bg else 0.3))
                else:
                    work.save(out, "WEBP", quality=quality, method=6)
                    after = out.stat().st_size
                note = f"{orig_size[0]}x{orig_size[1]} → {work.size[0]}x{work.size[1]}" \
                    if work.size != orig_size else f"{orig_size[0]}x{orig_size[1]}"
        except Exception as e:  # noqa: BLE001
            print(f"{f.name:<52}{before/1024:>9.0f}K{'转换失败':>12}  {e}")
            total_after += before
            continue

        total_after += after
        saved = (1 - after / before) * 100 if before else 0
        print(f"{f.name:<52}{before/1024:>9.0f}K{after/1024:>9.0f}K{saved:>7.0f}%  {note}")

    print("-" * 100)
    print(f"总计：{total_before/1024/1024:.2f} MB → {total_after/1024/1024:.2f} MB "
          f"（省 {(1-total_after/total_before)*100:.0f}%）")
    if args.dry_run:
        print("（dry-run，未写入文件）")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
