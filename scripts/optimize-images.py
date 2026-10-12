"""Сжимает PNG в собранной игре (dist/assets) без заметной потери качества:
палитра из 256 цветов без дизеринга — для пиксель-арта это почти незаметно, а файлы в 5–6 раз легче.
Исходники в public/assets не трогаются. Запуск после сборки: python3 scripts/optimize-images.py"""
import os, io, sys
from PIL import Image

root = sys.argv[1] if len(sys.argv) > 1 else 'dist/assets'
before = after = 0
for dp, _, files in os.walk(root):
    for f in files:
        if not f.endswith('.png'):
            continue
        p = os.path.join(dp, f)
        size = os.path.getsize(p)
        before += size
        im = Image.open(p).convert('RGBA')
        q = im.quantize(256, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.NONE)
        buf = io.BytesIO()
        q.save(buf, 'PNG', optimize=True)
        if buf.tell() < size:
            open(p, 'wb').write(buf.getvalue())
            size = buf.tell()
        after += size
print(f'PNG: {before / 1e6:.1f} МБ -> {after / 1e6:.1f} МБ')
