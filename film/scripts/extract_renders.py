#!/usr/bin/env python3
"""Derive clean render plates from the client presentation slides.

Client originals in public/projects/project-N/slide-NN.jpg are READ ONLY.
Outputs:
  film/plates/pN-sNN.jpg                         full-res clean crop (film source)
  public/projects/project-N/renders/sNN-W.webp   W in 800/1400/2000 (site)
  public/projects/project-N/renders/sNN.jpg      1400px JPEG fallback
  film/plates/manifest.json
"""
import json, os, sys
import numpy as np
from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
RENDERS = {
    1: [5, 6, 8, 9, 10, 12, 13, 14, 15, 17, 18, 19, 20, 22, 23, 24, 25, 27, 28, 29, 30],
    2: [5, 6, 7, 9, 10, 11, 12, 13, 14, 16, 17, 18, 20, 21, 23, 24, 25, 27, 28, 29, 30, 31],
}
LABEL_BAND = 70      # slide label "ROOM - 3BHK" sits in y≈25–60 of a 1125px slide
WHITE = 242          # luminance treated as slide paper
WIDTHS = (800, 1400, 2000)

def content_bbox(a):
    lum = a.mean(axis=2)
    ink = lum < WHITE
    cols = np.where(ink.mean(axis=0) > 0.35)[0]
    rows = np.where(ink.mean(axis=1) > 0.35)[0]
    return cols[0], rows[0], cols[-1] + 1, rows[-1] + 1

def main():
    os.makedirs(os.path.join(ROOT, 'film', 'plates'), exist_ok=True)
    manifest = []
    for p, slides in RENDERS.items():
        out_dir = os.path.join(ROOT, 'public', 'projects', f'project-{p}', 'renders')
        os.makedirs(out_dir, exist_ok=True)
        for s in slides:
            src = os.path.join(ROOT, 'public', 'projects', f'project-{p}', f'slide-{s:02d}.jpg')
            im = Image.open(src).convert('RGB')
            a = np.asarray(im)
            x0, y0, x1, y1 = content_bbox(a)
            y0 = max(y0, LABEL_BAND)           # drop the slide label band
            crop = im.crop((x0, y0, x1, y1))
            w, h = crop.size
            plate = os.path.join(ROOT, 'film', 'plates', f'p{p}-s{s:02d}.jpg')
            crop.save(plate, quality=96, subsampling=0)
            for W in WIDTHS:
                if W > w and W != WIDTHS[0]:
                    continue
                dst = os.path.join(out_dir, f's{s:02d}-{W}.webp')
                tw = min(W, w)
                crop.resize((tw, round(h * tw / w)), Image.LANCZOS).save(dst, 'WEBP', quality=80, method=6)
            crop.resize((min(1400, w), round(h * min(1400, w) / w)), Image.LANCZOS).save(
                os.path.join(out_dir, f's{s:02d}.jpg'), quality=84, optimize=True, progressive=True)
            manifest.append({'project': p, 'slide': s, 'w': w, 'h': h, 'aspect': round(w / h, 3),
                             'bbox': [int(x0), int(y0), int(x1), int(y1)]})
            print(f'p{p} s{s:02d} {w}x{h} ar={w/h:.2f}')
    with open(os.path.join(ROOT, 'film', 'plates', 'manifest.json'), 'w') as f:
        json.dump(manifest, f, indent=1)

if __name__ == '__main__':
    main()
