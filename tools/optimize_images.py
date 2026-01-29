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


def main():
    ImageFile.LOAD_TRUNCATED_IMAGES = True
    img_dir = Path.cwd() / "assets" / "img"
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
    main()
