import os
from pathlib import Path
from PIL import Image, ImageFile


def human_size(num_bytes):
    units = ["B", "KB", "MB", "GB"]
    size = float(num_bytes)
    for unit in units:
        if size < 1024 or unit == units[-1]:
            return f"{size:.2f}{unit}"
        size /= 1024


def convert_to_webp(img_dir):
    """将PNG/JPG图片转换为WebP格式"""
    ImageFile.LOAD_TRUNCATED_IMAGES = True
    
    if not img_dir.exists() or not img_dir.is_dir():
        print("未找到 assets/img 文件夹，请确认目录结构是否正确。")
        return

    exts = {".jpg", ".jpeg", ".png"}
    files = [p for p in img_dir.rglob("*") if p.suffix.lower() in exts and p.is_file()]

    if not files:
        print("assets/img 文件夹内没有可处理的图片（.jpg/.jpeg/.png）。")
        return

    converted_count = 0
    for path in files:
        webp_path = path.with_suffix('.webp')
        
        # 如果WebP文件已存在，跳过
        if webp_path.exists():
            continue
        
        try:
            before = path.stat().st_size
            with Image.open(path) as img:
                # 转换为RGBA模式（处理PNG透明度）
                if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
                    img = img.convert('RGBA')
                    img.save(webp_path, format='WEBP', quality=80, method=6)
                else:
                    img = img.convert('RGB')
                    img.save(webp_path, format='WEBP', quality=80, method=6)
            
            after = webp_path.stat().st_size
            reduction = ((before - after) / before) * 100
            print(f"✓ {path.name} -> {webp_path.name}: {human_size(before)} -> {human_size(after)} (减少 {reduction:.1f}%)")
            converted_count += 1
        except Exception as e:
            print(f"✗ {path.name}: 转换失败 ({e})")
    
    print(f"\n共转换 {converted_count} 个图片为WebP格式")


def optimize_existing(img_dir):
    """优化现有的PNG/JPG图片"""
    ImageFile.LOAD_TRUNCATED_IMAGES = True
    
    if not img_dir.exists() or not img_dir.is_dir():
        print("未找到 assets/img 文件夹，请确认目录结构是否正确。")
        return

    exts = {".jpg", ".jpeg", ".png"}
    files = [p for p in img_dir.rglob("*") if p.suffix.lower() in exts and p.is_file()]

    if not files:
        print("assets/img 文件夹内没有可处理的图片（.jpg/.jpeg/.png）。")
        return

    for path in files:
        try:
            before = path.stat().st_size
            with Image.open(path) as img:
                save_kwargs = {"optimize": True}
                if path.suffix.lower() in {".jpg", ".jpeg"}:
                    save_kwargs["quality"] = 70
                    save_kwargs["progressive"] = True
                elif path.suffix.lower() == ".png":
                    save_kwargs["compress_level"] = 9
                img.save(path, **save_kwargs)
            after = path.stat().st_size
            print(f"{path.name}: {human_size(before)} -> {human_size(after)}")
        except Exception as e:
            print(f"{path.name}: 处理失败 ({e})")


if __name__ == "__main__":
    img_dir = Path.cwd() / "assets" / "img"
    
    print("=" * 60)
    print("第一步：将PNG/JPG转换为WebP格式")
    print("=" * 60)
    convert_to_webp(img_dir)
    
    print("\n" + "=" * 60)
    print("第二步：优化现有PNG/JPG图片")
    print("=" * 60)
    optimize_existing(img_dir)
    
    print("\n✅ 图片优化完成！")