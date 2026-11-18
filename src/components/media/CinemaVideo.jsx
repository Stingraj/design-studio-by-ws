import React, { useEffect, useRef, useState } from 'react';
import { prefersReducedMotion } from '../../lib/gsap';
import { lowBandwidth, pickSource } from '../../data/film';

/** Responsive poster: WebP at 1280/1920 with a JPEG fallback. */
export function FilmPoster({ base, alt = '', eager = false, sizes = '100vw', className = '' }) {
  return (
    <picture className={className}>
      <source type="image/webp" srcSet={`${base}-1280.webp 1280w, ${base}-1920.webp 1920w`} sizes={sizes} />
      <img
        src={`${base}.jpg`}
        alt={alt}
        width="1920"
        height="1080"
        loading={eager ? 'eager' : 'lazy'}
        fetchPriority={eager ? 'high' : 'auto'}
        decoding="async"
      />
    </picture>
  );
}

/**
 * Ambient, silent loop that sits over its own poster.
 * - Nothing downloads until the block is on screen (preload="none" + IntersectionObserver).
 * - Pauses off screen and in background tabs.
 * - Reduced motion, Save-Data and 2G get the poster only.
 * - `toggle` renders a visible pause/play control (WCAG 2.2.2 for motion over 5 s).
 */
export default function CinemaVideo({ src, poster, alt = '', eager = false, toggle = false, className = '' }) {
  const wrap = useRef(null);
  const video = useRef(null);
  const userPaused = useRef(false);
  const [enabled] = useState(() => typeof window !== 'undefined' && !prefersReducedMotion() && !lowBandwidth());
  const [playing, setPlaying] = useState(false);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (!enabled) return undefined;
    const v = video.current;
    v.muted = true; // property, not just the attribute, or iOS refuses to autoplay
    let visible = false;
    const tryPlay = () => {
      if (!visible || userPaused.current || document.hidden) return;
      if (!v.getAttribute('src')) v.src = pickSource(src, { cover: true });
      v.play().catch(() => {});
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) tryPlay(); else v.pause();
    }, { threshold: 0.2 });
    io.observe(wrap.current);
    const onVis = () => (document.hidden ? v.pause() : tryPlay());
    document.addEventListener('visibilitychange', onVis);
    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      v.pause();
      v.removeAttribute('src');
      v.load();
    };
  }, [enabled, src]);

  const onToggle = () => {
    const v = video.current;
    if (v.paused) { userPaused.current = false; if (!v.getAttribute('src')) v.src = pickSource(src, { cover: true }); v.play().catch(() => {}); }
    else { userPaused.current = true; v.pause(); }
  };

  // The toggle is a sibling, not a child: parents may transform the video layer
  // (parallax), which would trap the button under any scrim drawn above it.
  return (
    <>
    <div ref={wrap} className={`cinema ${shown ? 'is-live' : ''} ${className}`}>
      <FilmPoster base={poster} alt={alt} eager={eager} className="cinema__poster" />
      {enabled && (
        <video
          ref={video}
          className="cinema__video"
          muted
          playsInline
          loop
          preload="none"
          aria-hidden="true"
          tabIndex={-1}
          onPlaying={() => { setPlaying(true); setShown(true); }}
          onPause={() => setPlaying(false)}
        />
      )}
    </div>
      {enabled && toggle && (
      <button type="button" className="cinema__toggle" onClick={onToggle}>
        <span aria-hidden="true">{playing ? '❚❚' : '▶'}</span>
        {playing ? 'Pause motion' : 'Play motion'}
      </button>
      )}
    </>
  );
}
