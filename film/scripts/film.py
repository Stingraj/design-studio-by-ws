#!/usr/bin/env python3
"""Film pipeline: storyboard.json -> shots (Blender 2.5D) -> captioned mezzanines -> assembled film.

  python3 film/scripts/film.py preview            # 15 s, 960x540, low samples
  python3 film/scripts/film.py final              # full 5-min 1080p master (resumable)
  python3 film/scripts/film.py final --only p1-s05 # re-render one shot
"""
import json, math, os, shutil, subprocess, sys
from PIL import Image, ImageDraw, ImageFont

FILM = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
BLENDER = shutil.which('blender') or '/opt/homebrew/bin/blender'
SB = json.load(open(os.path.join(FILM, 'storyboard.json')))
FPS = SB['fps']
PAPER, INK, STONE = (241, 238, 232), (21, 21, 19), (133, 129, 122)
ACCENT = {'p1': (196, 169, 138), 'p2': (163, 176, 138)}
F = lambda n: os.path.join(FILM, 'fonts', n)

def font(name, px, weight=None):
    f = ImageFont.truetype(F(name), px)
    if weight:
        try: f.set_variation_by_axes([weight])
        except Exception: pass
    return f

def tracked(draw, xy, text, fnt, fill, track):
    x, y = xy
    for ch in text:
        draw.text((x, y), ch, font=fnt, fill=fill)
        x += draw.textlength(ch, font=fnt) + track
    return x

def run(cmd, **kw):
    r = subprocess.run(cmd, capture_output=True, text=True, **kw)
    if r.returncode:
        sys.stderr.write(r.stderr[-3000:]); raise SystemExit(f'failed: {cmd[:4]}')
    return r

def card_png(item, res, path):
    W, H = res
    im = Image.new('RGB', res, PAPER); d = ImageDraw.Draw(im)
    key = item['card']; acc = ACCENT.get(key, STONE)
    m = round(W * 0.08)
    kick = font('InterTight.ttf', round(W * 0.0105), 500)
    big = font('InstrumentSerif-Regular.ttf', round(W * (0.085 if key in ('open', 'close') else 0.11)))
    sub = font('InstrumentSerif-Italic.ttf', round(W * 0.03))
    lines = item.get('lines', [])
    lh = big.size * 0.98
    block = lh * len(lines) + (sub.size * 1.6 if item.get('sub') else 0)
    y = H * 0.5 - block / 2
    d.line([(m, y - H * 0.085), (m + W * 0.05, y - H * 0.085)], fill=acc, width=max(1, W // 960))
    tracked(d, (m, y - H * 0.07), item.get('kicker', ''), kick, STONE, kick.size * 0.22)
    for ln in lines:
        d.text((m - big.size * 0.04, y), ln, font=big, fill=INK); y += lh
    if item.get('sub'):
        d.text((m, y + sub.size * 0.35), item['sub'], font=sub, fill=INK)
    im.save(path)

def caption_png(cap, res, path):
    W, H = res
    im = Image.new('RGBA', res, (0, 0, 0, 0))
    # soft bottom scrim for legibility on bright interiors
    scrim = Image.linear_gradient('L').resize((1, round(H * 0.42)))
    scrim = scrim.point(lambda v: int(v * 0.42)).resize((W, scrim.height))
    im.paste((10, 10, 9, 255), (0, H - scrim.height), scrim)
    d = ImageDraw.Draw(im)
    m = round(W * 0.055)
    kick = font('InterTight.ttf', round(W * 0.0105), 500)
    ttl = font('InstrumentSerif-Regular.ttf', round(W * 0.034))
    yb = H - m * 0.9
    d.text((m, yb - ttl.size), cap[1], font=ttl, fill=(250, 248, 244, 255))
    tracked(d, (m, yb - ttl.size - kick.size * 2.2), cap[0].upper() + '  —', kick, (250, 248, 244, 215), kick.size * 0.22)
    im.save(path)

def render_shot(item, res, samples, work):
    name = item['shot']
    frames = os.path.join(work, 'frames', name)
    os.makedirs(frames, exist_ok=True)
    n = round(item['seconds'] * FPS)
    if len([f for f in os.listdir(frames) if f.endswith('.jpg') and os.path.getsize(os.path.join(frames, f)) > 0]) >= n:
        return frames
    spec = {'plate': os.path.join(FILM, 'plates', name + '.jpg'), 'depth': os.path.join(FILM, 'depth', name + '.png'),
            'out': frames + '/', 'seconds': item['seconds'], 'move': item['move'], 'strength': item.get('strength', 1.0),
            'res': res, 'samples': samples, 'fps': FPS, 'dof': item.get('dof', 0)}
    sp = os.path.join(work, f'{name}.json'); json.dump(spec, open(sp, 'w'))
    r = run([BLENDER, '-b', '--factory-startup', '--python', os.path.join(FILM, 'scripts', 'build_shot.py'), '--', sp])
    for ln in r.stdout.splitlines():
        if ln.startswith('MOVE'): print('   ', ln)
    return frames

def mezz(item, res, samples, work):
    key = item.get('shot') or 'card-' + item['card']
    out = os.path.join(work, 'clips', key + '.mp4')
    if os.path.exists(out): return out
    os.makedirs(os.path.dirname(out), exist_ok=True)
    dur = item['seconds']; W, H = res
    grade = f'unsharp=5:5:0.35:5:5:0,vignette=PI/10,noise=c0s=4:c0f=t+u,format=yuv420p'
    enc = ['-c:v', 'libx264', '-crf', '14', '-preset', 'medium', '-r', str(FPS), '-pix_fmt', 'yuv420p']
    if 'card' in item:
        png = os.path.join(work, key + '.png'); card_png(item, res, png)
        run(['ffmpeg', '-v', 'error', '-y', '-loop', '1', '-t', str(dur), '-framerate', str(FPS), '-i', png,
             '-vf', 'noise=c0s=3:c0f=t+u,format=yuv420p', *enc, out])
    else:
        frames = render_shot(item, res, samples, work)
        inputs = ['-framerate', str(FPS), '-i', os.path.join(frames, '%04d.jpg')]
        if item.get('cap'):
            cp = os.path.join(work, key + '-cap.png'); caption_png(item['cap'], res, cp)
            inputs += ['-loop', '1', '-t', str(dur), '-framerate', str(FPS), '-i', cp]
            fo = dur - 2.2
            fc = (f'[1:v]format=rgba,fade=t=in:st=0.9:d=1.0:alpha=1,fade=t=out:st={fo:.2f}:d=1.0:alpha=1[c];'
                  f'[0:v][c]overlay=0:0:format=auto,{grade}[v]')
        else:
            fc = f'[0:v]{grade}[v]'
        run(['ffmpeg', '-v', 'error', '-y', *inputs, '-filter_complex', fc, '-map', '[v]', '-t', str(dur), *enc, out])
        if os.path.getsize(out) > 10000 and not KEEP_FRAMES:
            shutil.rmtree(frames)
    return out

def assemble(seq, clips, out, crf):
    T = SB['transitions']
    ins = sum([['-i', c] for c in clips], [])
    fc, last, t = [], '0:v', seq[0]['seconds']
    for i in range(1, len(seq)):
        tr = seq[i - 1].get('t', 'dissolve'); d = T[tr]
        kind = 'fadewhite' if tr == 'paper' else 'fade'
        off = t - d
        lab = f'x{i}'
        fc.append(f'[{last}][{i}:v]xfade=transition={kind}:duration={d}:offset={off:.3f}[{lab}]')
        last, t = lab, off + seq[i]['seconds']
    fc.append(f'[{last}]format=yuv420p[out]')
    run(['ffmpeg', '-v', 'error', '-y', *ins, '-filter_complex', ';'.join(fc), '-map', '[out]',
         '-c:v', 'libx264', '-crf', str(crf), '-preset', 'slow', '-tune', 'film', '-r', str(FPS),
         '-movflags', '+faststart', '-metadata', f'title={SB["title"]}', out])
    return t

KEEP_FRAMES = '--keep-frames' in sys.argv
if __name__ == '__main__':
    mode = sys.argv[1]
    if mode == 'preview':
        P = SB['preview']; seq, res, samples = P['sequence'], P['res'], P['samples']
        work = os.path.join(FILM, 'renders', 'preview'); out = os.path.join(FILM, 'preview', 'preview_v1.mp4'); crf = 18
    else:
        seq, res, samples = SB['sequence'], [1920, 1080], 32
        work = os.path.join(FILM, 'renders', 'final'); out = os.path.join(FILM, 'master', 'dsws_film_1080p.mp4'); crf = 16
    only = sys.argv[sys.argv.index('--only') + 1] if '--only' in sys.argv else None
    os.makedirs(os.path.dirname(out), exist_ok=True)
    clips = []
    for i, it in enumerate(seq):
        key = it.get('shot') or 'card-' + it['card']
        if only and key != only:
            clips.append(os.path.join(work, 'clips', key + '.mp4')); continue
        if only:
            for p in (os.path.join(work, 'clips', key + '.mp4'),):
                if os.path.exists(p): os.remove(p)
        print(f'[{i+1}/{len(seq)}] {key}', flush=True)
        clips.append(mezz(it, res, samples, work))
    if only: sys.exit(0)
    total = assemble(seq, clips, out, crf)
    print(f'OK {out} {total:.1f}s')
