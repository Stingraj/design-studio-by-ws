import React, { Suspense, lazy, useRef, useState } from 'react';
import { FilmPoster } from './CinemaVideo';
import { FILM_CHAPTERS, fmtTime } from '../../data/film';
import { prefersReducedMotion } from '../../lib/gsap';

const FilmPlayer = lazy(() => import('./FilmPlayer'));
const STRIP_FRAMES = 24; // frames per sprite, see film/scripts/web.py strip()

/**
 * A poster that opens the film player.
 * - `chapters`: indices into FILM_CHAPTERS, or `items`: chapter objects (e.g. WHAT_WE_DO).
 * - `strip`: optional filmstrip sprite. Moving a mouse across the poster flips through
 *   the film like a flip-book (one ~220 KB image fetched on first hover, no video). Touch, keyboard and
 *   reduced-motion visitors simply see the poster.
 * The player is code-split, so it costs nothing until someone presses play.
 */
export default function FilmStage({ chapters = [0, 1], items, startTime = 0, poster, strip, title, meta, children }) {
  const [open, setOpen] = useState(null); // { start, time }
  const [frame, setFrame] = useState(null);
  const [armed, setArmed] = useState(false); // strip is fetched on first mouse hover only
  const btn = useRef(null);
  const list = items || chapters.map((i) => FILM_CHAPTERS[i]);
  const length = list.reduce((s, c) => s + c.duration, 0);
  const play = (start = 0, time = 0) => setOpen({ start, time });

  const onMove = (e) => {
    if (!strip || e.pointerType !== 'mouse' || prefersReducedMotion()) return;
    const r = btn.current.getBoundingClientRect();
    const x = Math.min(Math.max((e.clientX - r.left) / r.width, 0), 0.9999);
    setFrame(Math.floor(x * STRIP_FRAMES));
  };

  return (
    <>
      {/* No aria-label: the visible title and length are the accessible name (WCAG 2.5.3). */}
      <button
        ref={btn}
        type="button"
        className={`film-stage ${frame != null ? 'is-scrubbing' : ''}`}
        onClick={() => play(0, startTime)}
        onPointerEnter={(e) => { if (strip && e.pointerType === 'mouse' && !prefersReducedMotion()) setArmed(true); }}
        onPointerMove={onMove}
        onPointerLeave={() => setFrame(null)}
        data-cursor="play"
      >
        <FilmPoster base={poster || list[0].poster} sizes="100vw" />
        {strip && armed && (
          <span
            className="film-stage__strip"
            aria-hidden="true"
            style={{
              backgroundImage: `url(${strip})`,
              backgroundPosition: `${((frame ?? 0) / (STRIP_FRAMES - 1)) * 100}% 0`,
            }}
          />
        )}
        {strip && frame != null && (
          <span className="film-stage__scrub" aria-hidden="true">
            <span style={{ width: `${((frame + 1) / STRIP_FRAMES) * 100}%` }} />
          </span>
        )}
        <span className="film-stage__label">
          <span className="film-stage__disc" aria-hidden="true">▶</span>
          <span className="film-stage__text">
            <strong>{title}</strong>
            <span>{meta || `${fmtTime(length)} · no sound`}</span>
          </span>
        </span>
      </button>
      {typeof children === 'function' ? children(play, list) : null}
      {open && (
        <Suspense fallback={null}>
          <FilmPlayer chapters={list} start={open.start} startTime={open.time} onClose={() => setOpen(null)} />
        </Suspense>
      )}
    </>
  );
}
