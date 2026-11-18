"""Cut web deliverables from the master film into public/media/film/.

    film/.venv/bin/python scripts/web.py [--force]   (needs ffmpeg + Pillow)

The master is never touched. Every output is H.264 + faststart, silent (the film
has no soundtrack), and each file stays well under GitHub's 50 MB warning so it
can ship as a static asset.
"""
import json, os, subprocess, sys

FILM = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ROOT = os.path.dirname(FILM)
MASTER = os.path.join(FILM, 'master', 'dsws_film_1080p.mp4')
OUT = os.path.join(ROOT, 'public', 'media', 'film')
SB = json.load(open(os.path.join(FILM, 'storyboard.json')))

# Timeline: where each storyboard item starts in the master (xfades overlap shots).
T = SB['transitions']
seq = SB['sequence']
starts, t = [0.0], 0.0
for i in range(1, len(seq)):
    t += seq[i - 1]['seconds'] - T[seq[i - 1].get('t', 'dissolve')]
    starts.append(t)
END = starts[-1] + seq[-1]['seconds']
P2 = next(i for i, x in enumerate(seq) if x.get('card') == 'p2')
# Cut the chapters at the white peak of the paper transition into the F-1002 card.
CUT = round(starts[P2] + T['paper'] / 2, 2)
CHAPTERS = {'f204': (0.0, CUT), 'f1002': (CUT, END)}

def run(cmd):
    print('  $', ' '.join(cmd[:6]), '…')
    subprocess.run(cmd, check=True)

def x264(height, maxrate, crf, scale=True):
    vf = ['-vf', f'scale=-2:{height}:flags=lanczos'] if scale else []
    return [*vf, '-c:v', 'libx264', '-preset', 'slow', '-tune', 'film',
            '-crf', str(crf), '-maxrate', maxrate, '-bufsize', str(int(maxrate[:-1]) * 2) + 'k',
            '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-an', '-movflags', '+faststart']

def still(at, name, src=MASTER):
    """Poster frames: ffmpeg grabs a lossless PNG, Pillow writes WebP (this ffmpeg has no libwebp)."""
    from PIL import Image
    png = os.path.join(OUT, f'.{name}.png')
    run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{at:.3f}', '-i', src, '-frames:v', '1', png])
    im = Image.open(png).convert('RGB')
    for w, q in ((1920, 80), (1280, 78)):
        im.resize((w, round(im.height * w / im.width)), Image.LANCZOS).save(
            os.path.join(OUT, f'{name}-{w}.webp'), 'WEBP', quality=q, method=6)
    im.save(os.path.join(OUT, f'{name}.jpg'), 'JPEG', quality=84, optimize=True, progressive=True)
    os.remove(png)

def poster_from_render(path, name):
    from PIL import Image
    im = Image.open(path).convert('RGB')
    w, h = im.size; th = round(w * 9 / 16)  # centre-crop to 16:9
    if th < h:
        im = im.crop((0, (h - th) // 2, w, (h - th) // 2 + th))
    for W, q in ((1920, 80), (1280, 78)):
        im.resize((W, round(W * 9 / 16)), Image.LANCZOS).save(os.path.join(OUT, f'{name}-{W}.webp'), 'WEBP', quality=q, method=6)
    im.resize((1920, 1080), Image.LANCZOS).save(os.path.join(OUT, f'{name}.jpg'), 'JPEG', quality=84, optimize=True, progressive=True)

def strip(src, duration, name, n=24, w=640):
    """Filmstrip sprite for the hover-scrub preview: n frames side by side, one WebP."""
    from PIL import Image
    tmp = os.path.join(OUT, f'.{name}.png')
    step = duration / n
    run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-vf',
         f"fps=1/{step:.4f},scale={w}:-2:flags=lanczos,tile={n}x1", '-frames:v', '1', tmp])
    Image.open(tmp).convert('RGB').save(os.path.join(OUT, f'{name}.webp'), 'WEBP', quality=70, method=6)
    os.remove(tmp)

def ts(s):
    h, s = divmod(s, 3600); m, s = divmod(s, 60)
    return f'{int(h):02d}:{int(m):02d}:{s:06.3f}'

def chapters_vtt(key, a, b):
    """Room chapters for one chapter file, times relative to its own start."""
    cues = []
    for x, st in zip(seq, starts):
        if not (st < b and st + x['seconds'] > a + 1.0):
            continue
        label = (x.get('cap') or [None, None])[1] or ((x.get('lines') or [None])[0] if x.get('card') in ('p1', 'p2') else None)
        if x.get('card') == 'open':
            label = 'Opening'
        if label:
            cues.append([max(0.0, st - a), label])
    lines = ['WEBVTT', '']
    for i, (st, label) in enumerate(cues):
        en = cues[i + 1][0] if i + 1 < len(cues) else b - a
        lines += [str(i + 1), f'{ts(st)} --> {ts(en)}', label, '']
    open(os.path.join(OUT, f'{key}.chapters.vtt'), 'w').write('\n'.join(lines))
    return cues

if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    manifest = {'chapters': []}

    for key, (a, b) in CHAPTERS.items():
        print(f'{key}: {a:.2f} → {b:.2f}')
        for h, rate, crf in ((1080, '2600k', 22), (720, '1400k', 23)):
            if os.path.exists(os.path.join(OUT, f'{key}-{h}.mp4')) and '--force' not in sys.argv:
                continue
            run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{a:.3f}', '-t', f'{b - a:.3f}', '-i', MASTER,
                 *x264(h, rate, crf), os.path.join(OUT, f'{key}-{h}.mp4')])
        cues = chapters_vtt(key, a, b)
        manifest['chapters'].append({'key': key, 'start': a, 'duration': round(b - a, 2),
                                     'rooms': [{'t': round(s, 2), 'label': l} for s, l in cues]})

    # Chapter posters come from the client's own render crops, not film frames:
    # a still shows any 2.5D stretching far more than motion does.
    poster_from_render(os.path.join(ROOT, 'public', 'projects', 'project-1', 'renders', 's06.jpg'), 'f204-poster')
    poster_from_render(os.path.join(ROOT, 'public', 'projects', 'project-2', 'renders', 's14.jpg'), 'f1002-poster')

    # Hero loop: p2-s07 (fluted glass into the dining room), caption-free. A crossfade
    # of the clip's tail into its head makes the 7 s loop seamless.
    i7 = seq.index(next(x for x in seq if x.get('shot') == 'p2-s07'))
    s, L, F = starts[i7] + T['dissolve'] + 0.05, 7.0, 1.4
    assert s + L + F < starts[i7] + seq[i7]['seconds'] - T[seq[i7]['t']], 'loop overlaps a transition'
    for h, rate, crf in ((1080, '3200k', 25), (720, '1600k', 26)):
        fc = (f'[0:v]split[a][b];[a]trim={F}:{L + F},setpts=PTS-STARTPTS[body];'
              f'[b]trim=0:{F},setpts=PTS-STARTPTS[head];'
              f'[body][head]xfade=transition=fade:duration={F}:offset={L - F},scale=-2:{h}:flags=lanczos[v]')
        run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{s:.3f}', '-t', f'{L + F:.3f}', '-i', MASTER,
             '-filter_complex', fc, '-map', '[v]', *x264(h, rate, crf, scale=False), os.path.join(OUT, f'hero-loop-{h}.mp4')])
    # The poster is the loop's own first frame, so the video takes over invisibly.
    still(0, 'hero-loop-poster', src=os.path.join(OUT, 'hero-loop-1080.mp4'))

    manifest['hero'] = {'start': round(s, 2), 'length': L}

    # "What we do" (scripts/whatwedo.py): one short film, chapters = disciplines.
    WWD = os.path.join(FILM, 'master', 'dsws_whatwedo_1080p.mp4')
    if os.path.exists(WWD):
        meta = json.load(open(os.path.join(FILM, 'master', 'whatwedo.json')))
        for h, rate, crf in ((1080, '2600k', 22), (720, '1400k', 23)):
            dst = os.path.join(OUT, f'whatwedo-{h}.mp4')
            if not os.path.exists(dst) or '--force' in sys.argv:
                run(['ffmpeg', '-v', 'error', '-y', '-i', WWD, *x264(h, rate, crf), dst])
        poster_from_render(os.path.join(ROOT, 'public', 'projects', 'project-2', 'renders', 's10.jpg'), 'whatwedo-poster')
        rooms = [{'t': 0.0, 'label': 'What we do'}] + [{'t': c['t'], 'label': c['label'], 'slug': c['slug']} for c in meta['chapters']]
        lines = ['WEBVTT', '']
        for i, r in enumerate(rooms):
            en = rooms[i + 1]['t'] if i + 1 < len(rooms) else meta['duration']
            lines += [str(i + 1), f"{ts(r['t'])} --> {ts(en)}", r['label'], '']
        open(os.path.join(OUT, 'whatwedo.chapters.vtt'), 'w').write('\n'.join(lines))
        manifest['whatwedo'] = {'key': 'whatwedo', 'duration': meta['duration'], 'rooms': rooms}
        strip(WWD, meta['duration'], 'whatwedo-strip')
    strip(MASTER, END, 'residences-strip')
    # The site imports this at build time (src/data/film.json): chapter lengths + room cues.
    json.dump(manifest, open(os.path.join(ROOT, 'src', 'data', 'film.json'), 'w'), indent=2)
    for f in sorted(os.listdir(OUT)):
        print(f'{os.path.getsize(os.path.join(OUT, f)) / 1e6:8.2f} MB  {f}')
