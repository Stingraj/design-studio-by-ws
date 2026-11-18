#!/usr/bin/env python3
"""Contact sheet: contact_sheet.py OUT.jpg COLS TILE_W TILE_H img1 img2 ..."""
import subprocess, sys
out, cols, tw, th, *imgs = sys.argv[1:]
cols, tw, th = int(cols), int(tw), int(th)
args = ['ffmpeg', '-v', 'error', '-y']
for f in imgs: args += ['-i', f]
fc = ''.join(f'[{i}]scale={tw}:{th}:force_original_aspect_ratio=decrease,pad={tw}:{th}:(ow-iw)/2:(oh-ih)/2:color=0x222222[v{i}];' for i in range(len(imgs)))
layout = '|'.join(f'{(k % cols) * tw}_{(k // cols) * th}' for k in range(len(imgs)))
fc += ''.join(f'[v{i}]' for i in range(len(imgs))) + f'xstack=inputs={len(imgs)}:layout={layout}:fill=black'
subprocess.run(args + ['-filter_complex', fc, '-frames:v', '1', '-q:v', '3', out], check=True)
print(out)
