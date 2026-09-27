# Hoja de contacto de renders (control de calidad, docs/16 §8).
import sys, glob, os
from PIL import Image
files = sys.argv[2:] or sorted(glob.glob('public/images/dishes/*.webp'))
cols = min(5, len(files)); rows = (len(files) + cols - 1) // cols
tw, th = 324, 405
sheet = Image.new('RGB', (cols * tw, rows * th), (30, 30, 30))
for i, f in enumerate(files):
    im = Image.open(f).convert('RGB').resize((tw, th))
    sheet.paste(im, ((i % cols) * tw, (i // cols) * th))
sheet.save(sys.argv[1], quality=85)
print(sys.argv[1], len(files))
