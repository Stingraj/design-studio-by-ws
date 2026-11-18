import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { stopScroll, startScroll } from '../../lib/scroll';
import { fmtTime, pickSource } from '../../data/film';

/**
 * Full-screen film player.
 * Plays the given chapters in order (one file per residence) with room markers.
 * Keyboard: Space/K play-pause, ←/→ 5 s, Shift+←/→ previous/next room, Esc close.
 * Focus is trapped inside and returned to the opener on close.
 */
export default function FilmPlayer({ chapters, start = 0, startTime = 0, onClose }) {
  const dialog = useRef(null);
  const video = useRef(null);
  const playBtn = useRef(null);
  const opener = useRef(typeof document !== 'undefined' ? document.activeElement : null);
  const [ci, setCi] = useState(start);
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [finished, setFinished] = useState(false);
  const ch = chapters[ci];
  const src = useMemo(() => pickSource(ch.src), [ch]);

  const roomIndex = useMemo(() => {
    let r = 0;
    ch.rooms.forEach((room, i) => { if (room.t <= time + 0.25) r = i; });
    return r;
  }, [ch, time]);

  useEffect(() => {
    const prev = opener.current;
    stopScroll();
    document.body.style.overflow = 'hidden';
    playBtn.current?.focus();
    return () => {
      startScroll();
      document.body.style.overflow = '';
      if (prev && typeof prev.focus === 'function') prev.focus();
    };
  }, []);

  // New chapter: reset and start playing (the film is silent, so autoplay is allowed).
  // `startTime` applies once, to the chapter the player opened on (e.g. a discipline).
  const firstOpen = useRef(true);
  useEffect(() => {
    setTime(0); setFinished(false);
    const v = video.current;
    if (!v) return;
    v.muted = true;
    if (firstOpen.current && startTime > 0) {
      const at = startTime;
      const seekTo = () => { v.currentTime = at; setTime(at); };
      if (v.readyState >= 1) seekTo(); else v.addEventListener('loadedmetadata', seekTo, { once: true });
    }
    firstOpen.current = false;
    v.play().catch(() => setPlaying(false));
  }, [ci]);

  const toggle = useCallback(() => {
    const v = video.current;
    if (finished) { setFinished(false); if (chapters.length > 1 && ci !== 0) { setCi(0); return; } v.currentTime = 0; }
    if (v.paused) v.play().catch(() => {}); else v.pause();
  }, [finished, chapters.length, ci]);

  const seek = useCallback((s) => {
    const v = video.current;
    v.currentTime = Math.min(Math.max(0, s), ch.duration - 0.1);
    setTime(v.currentTime);
    setFinished(false);
  }, [ch.duration]);

  const jumpRoom = (d) => {
    const i = Math.min(Math.max(0, roomIndex + d), ch.rooms.length - 1);
    seek(ch.rooms[i].t);
  };

  const onEnded = () => {
    if (ci < chapters.length - 1) setCi(ci + 1);
    else { setFinished(true); setPlaying(false); }
  };

  const onKeyDown = (e) => {
    const tag = e.target.tagName;
    if (e.key === 'Escape') { e.preventDefault(); onClose(); return; }
    if (e.key === 'Tab') {
      const f = dialog.current.querySelectorAll('button, input');
      const first = f[0]; const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      return;
    }
    if (tag === 'INPUT') return; // the scrubber owns its own arrow keys
    if ((e.key === ' ' && tag !== 'BUTTON') || e.key === 'k' || e.key === 'K') { e.preventDefault(); toggle(); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); e.shiftKey ? jumpRoom(1) : seek(video.current.currentTime + 5); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); e.shiftKey ? jumpRoom(-1) : seek(video.current.currentTime - 5); }
  };

  const pct = (time / ch.duration) * 100;
  const room = ch.rooms[roomIndex];

  return createPortal(
    <div
      ref={dialog}
      className="film-player"
      role="dialog"
      aria-modal="true"
      aria-label={`Film — ${ch.title}, ${ch.subtitle}`}
      onKeyDown={onKeyDown}
    >
      <div className="film-player__bar">
        <span className="film-player__title">
          <span className="film-player__num">{String(ci + 1).padStart(2, '0')}</span> {ch.title}
          <span className="film-player__client"> · {ch.subtitle}</span>
        </span>
        <span className="film-player__room" aria-hidden="true">{room?.label}</span>
        <button type="button" className="film-player__close" onClick={onClose}>Close <span aria-hidden="true">×</span></button>
      </div>

      <div className="film-player__stage">
        <video
          key={ch.key}
          ref={video}
          src={src}
          poster={`${ch.poster}-1920.webp`}
          muted
          playsInline
          autoPlay
          preload="auto"
          onClick={toggle}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
          onEnded={onEnded}
        >
          <track kind="chapters" src={ch.track} srcLang="en" label="Rooms" default />
        </video>
        {finished && (
          <div className="film-player__end">
            <p>{chapters.length > 1 ? 'End of the film.' : `End of ${ch.title}.`}</p>
            <button type="button" onClick={toggle}>Watch again</button>
          </div>
        )}
      </div>

      <div className="film-player__controls">
        <button ref={playBtn} type="button" className="film-player__play" onClick={toggle}>
          <span aria-hidden="true">{playing ? '❚❚' : '▶'}</span> {playing ? 'Pause' : 'Play'}
        </button>
        <span className="film-player__time"><span>{fmtTime(time)}</span> / {fmtTime(ch.duration)}</span>
        <div className="film-player__track" style={{ '--p': `${pct}%` }}>
          <input
            type="range"
            min="0"
            max={ch.duration}
            step="0.1"
            value={Math.min(time, ch.duration)}
            onChange={(e) => seek(Number(e.target.value))}
            aria-label={`Position in ${ch.title}`}
            aria-valuetext={`${fmtTime(time)} of ${fmtTime(ch.duration)}${room ? `, ${room.label}` : ''}`}
          />
          {ch.rooms.map((r) => (
            <span key={r.t} className="film-player__tick" style={{ left: `${(r.t / ch.duration) * 100}%` }} aria-hidden="true" />
          ))}
        </div>
        {chapters.length > 1 && (
          <div className="film-player__chapters" role="group" aria-label="Residences">
            {chapters.map((c, i) => (
              <button key={c.key} type="button" aria-current={i === ci ? 'true' : undefined} onClick={() => setCi(i)}>
                {String(i + 1).padStart(2, '0')} {c.title}
              </button>
            ))}
          </div>
        )}
      </div>

      <nav className="film-player__rooms" aria-label={`Chapters in ${ch.title}`}>
        {ch.rooms.map((r, i) => (
          <button key={r.t} type="button" aria-current={i === roomIndex ? 'true' : undefined} onClick={() => seek(r.t)}>
            <span>{fmtTime(r.t)}</span> {r.label}
          </button>
        ))}
      </nav>
    </div>,
    document.body,
  );
}
