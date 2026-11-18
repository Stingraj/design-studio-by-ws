#!/usr/bin/env python3
"""Monocular depth for each plate with Depth-Anything-V2-Small (ONNX, Apache-2.0).
Writes film/depth/<plate>.png (16-bit, white = near). Run with film/.venv/bin/python."""
import glob, os, sys
import numpy as np, onnxruntime as ort
from PIL import Image, ImageFilter

FILM = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
MEAN, STD = np.array([0.485, 0.456, 0.406]), np.array([0.229, 0.224, 0.225])

def run(sess, path, short=518):
    im = Image.open(path).convert('RGB')
    w, h = im.size
    s = short / min(w, h)
    tw, th = (round(w * s / 14) * 14, round(h * s / 14) * 14)
    x = (np.asarray(im.resize((tw, th), Image.BICUBIC), dtype=np.float32) / 255 - MEAN) / STD
    x = x.transpose(2, 0, 1)[None].astype(np.float32)
    d = sess.run(None, {sess.get_inputs()[0].name: x})[0].squeeze()
    d = (d - d.min()) / (d.max() - d.min() + 1e-6)
    out = Image.fromarray((d * 65535).astype(np.uint16)).resize((w, h), Image.BICUBIC)
    return out

def main():
    sess = ort.InferenceSession(os.path.join(FILM, 'models', 'depth-anything-v2-small.onnx'),
                                providers=['CPUExecutionProvider'])
    os.makedirs(os.path.join(FILM, 'depth'), exist_ok=True)
    plates = sys.argv[1:] or sorted(glob.glob(os.path.join(FILM, 'plates', '*.jpg')))
    for p in plates:
        dst = os.path.join(FILM, 'depth', os.path.basename(p).replace('.jpg', '.png'))
        if os.path.exists(dst):
            continue
        run(sess, p).save(dst)
        print('depth', os.path.basename(dst), flush=True)

if __name__ == '__main__':
    main()
