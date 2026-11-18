#!/usr/bin/env python3
""""What we do": a ~90 s cut about the studio's disciplines, edited from the
already-rendered shot mezzanines (film/renders/final/clips). No new 3D render.

    film/.venv/bin/python film/scripts/whatwedo.py

Only caption-free shots are used, so no room names are burned in. Writes
film/master/dsws_whatwedo_1080p.mp4; run scripts/web.py afterwards for the web cuts.
"""
import json, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from film import FILM, FPS, SB, card_png, run, assemble  # same type, grain and dissolves as the main film

RES = (1920, 1080)
CLIPS = os.path.join(FILM, 'renders', 'final', 'clips')
WORK = os.path.join(FILM, 'renders', 'whatwedo')
OUT = os.path.join(FILM, 'master', 'dsws_whatwedo_1080p.mp4')
ENC = ['-c:v', 'libx264', '-crf', '14', '-preset', 'medium', '-r', str(FPS), '-pix_fmt', 'yuv420p']

SHOT = 7.0   # seconds kept from each shot
IN = 2.0     # skip the first seconds of each clip (camera settling)

# Disciplines follow src/data/services.js (title + slug).
SEQUENCE = [
    {'card': 'open', 'lines': ['What we do'], 'kicker': 'DESIGN STUDIO BY WS · HYDERABAD', 'seconds': 4.5, 't': 'paper'},

    {'card': 'd1', 'lines': ['Residential', 'Architecture'], 'kicker': '01 — PLANNING THE WHOLE HOME', 'seconds': 3.4, 't': 'paper',
     'chapter': ('Residential Architecture', 'residential-architecture')},
    {'clip': 'p2-s07', 't': 'dissolve'}, {'clip': 'p2-s10', 't': 'dissolve'}, {'clip': 'p1-s09', 't': 'paper'},

    {'card': 'd2', 'lines': ['Interior', 'Architecture'], 'kicker': '02 — ONE PALETTE, ROOM TO ROOM', 'seconds': 3.4, 't': 'paper',
     'chapter': ('Interior Architecture', 'interior-architecture')},
    {'clip': 'p1-s06', 't': 'dissolve'}, {'clip': 'p2-s14', 't': 'dissolve'}, {'clip': 'p2-s17', 't': 'paper'},

    {'card': 'd3', 'lines': ['Bespoke', 'Joinery'], 'kicker': '03 — DRAWN TO THE MILLIMETRE', 'seconds': 3.4, 't': 'paper',
     'chapter': ('Bespoke Joinery', 'bespoke-joinery')},
    {'clip': 'p1-s13', 't': 'dissolve'}, {'clip': 'p1-s18', 't': 'dissolve'}, {'clip': 'p2-s29', 't': 'paper'},

    {'card': 'd4', 'lines': ['3D', 'Visualisation'], 'kicker': '04 — SEE IT BEFORE IT IS BUILT', 'seconds': 3.4, 't': 'paper',
     'chapter': ('3D Visualisation', '3d-visualisation')},
    # The service shown literally: a still render holds, then the same view starts to move.
    {'still': 'p1-s15', 'seconds': 2.6, 't': 'dissolve'},
    {'clip': 'p1-s15', 'in': 0.0, 't': 'paper'},

    {'card': 'close', 'lines': ['Every home begins', 'with a word.'], 'sub': 'hello@waseemsaife.com',
     'kicker': 'ARCHITECTURE · INTERIORS · JOINERY', 'seconds': 6.0},
]

def segment(i, it):
    path = os.path.join(WORK, f'{i:02d}.mp4')
    if os.path.exists(path) and os.path.getsize(path) > 10000:
        return path
    if 'card' in it:
        png = os.path.join(WORK, f'{i:02d}.png'); card_png(it, RES, png)
        run(['ffmpeg', '-v', 'error', '-y', '-loop', '1', '-t', str(it['seconds']), '-framerate', str(FPS), '-i', png,
             '-vf', 'noise=c0s=3:c0f=t+u,format=yuv420p', *ENC, path])
    elif 'still' in it:
        # Freeze the shot's own first frame (already graded, exact framing), so the
        # dissolve into the moving shot has no double image: the still simply starts to move.
        png = os.path.join(WORK, f'{i:02d}.png')
        run(['ffmpeg', '-v', 'error', '-y', '-i', os.path.join(CLIPS, it['still'] + '.mp4'), '-frames:v', '1', png])
        run(['ffmpeg', '-v', 'error', '-y', '-loop', '1', '-t', str(it['seconds']), '-framerate', str(FPS), '-i', png,
             '-vf', 'noise=c0s=3:c0f=t+u,format=yuv420p', *ENC, path])
    else:
        run(['ffmpeg', '-v', 'error', '-y', '-ss', str(it.get('in', IN)), '-t', str(SHOT),
             '-i', os.path.join(CLIPS, it['clip'] + '.mp4'), '-an', *ENC, path])
    return path

if __name__ == '__main__':
    os.makedirs(WORK, exist_ok=True)
    seq = [dict(it, seconds=it.get('seconds', SHOT)) for it in SEQUENCE]
    clips = [segment(i, it) for i, it in enumerate(seq)]
    total = assemble(seq, clips, OUT, 16)

    # Chapter starts (same overlap arithmetic as assemble()).
    T, starts, t = SB['transitions'], [0.0], 0.0
    for i in range(1, len(seq)):
        t += seq[i - 1]['seconds'] - T[seq[i - 1].get('t', 'dissolve')]; starts.append(t)
    chapters = [{'t': round(s, 2), 'label': it['chapter'][0], 'slug': it['chapter'][1]}
                for it, s in zip(seq, starts) if it.get('chapter')]
    json.dump({'duration': round(total, 2), 'chapters': chapters},
              open(os.path.join(FILM, 'master', 'whatwedo.json'), 'w'), indent=2)
    print(f'OK {OUT} {total:.1f}s', chapters)
