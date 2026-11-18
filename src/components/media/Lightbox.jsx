import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { stopScroll, startScroll } from '../../lib/scroll';
import RenderImage from './RenderImage';

/**
 * Full-screen render viewer.
 * Keyboard: ←/→ to move, Esc to close, Tab stays inside (focus trap).
 * Touch: horizontal swipe. Focus returns to the opener on close.
 */
export default function Lightbox({ project, frames, index, onClose, onIndex }) {
  const dialog = useRef(null);
  const closeBtn = useRef(null);
  const opener = useRef(typeof document !== 'undefined' ? document.activeElement : null);
  const touch = useRef(null);
  const [live, setLive] = useState('');
  const frame = frames[index];
  const go = useCallback((d) => onIndex((index + d + frames.length) % frames.length), [index, frames.length, onIndex]);

  useEffect(() => {
    const prev = opener.current;
    stopScroll();
    document.body.style.overflow = 'hidden';
    closeBtn.current?.focus();
    return () => {
      startScroll();
      document.body.style.overflow = '';
      if (prev && typeof prev.focus === 'function') prev.focus();
    };
  }, []);

  useEffect(() => {
    setLive(`${frame.caption}, image ${index + 1} of ${frames.length}`);
  }, [frame, index, frames.length]);

  const onKeyDown = (e) => {
    if (e.key === 'Escape') { e.preventDefault(); onClose(); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
    else if (e.key === 'Tab') {
      const f = dialog.current.querySelectorAll('button');
      const first = f[0]; const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  };

  const onTouchStart = (e) => { touch.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touch.current == null) return;
    const dx = e.changedTouches[0].clientX - touch.current;
    if (Math.abs(dx) > 48) go(dx < 0 ? 1 : -1);
    touch.current = null;
  };

  return createPortal(
    <div
      ref={dialog}
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={`${project.title} — render viewer`}
      onKeyDown={onKeyDown}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="lightbox__bar">
        <span className="lightbox__count">{String(index + 1).padStart(2, '0')} / {String(frames.length).padStart(2, '0')}</span>
        <span className="lightbox__caption">{frame.caption}</span>
        <button ref={closeBtn} type="button" className="lightbox__close" onClick={onClose}>Close <span aria-hidden="true">×</span></button>
      </div>
      <figure className="lightbox__stage">
        <RenderImage key={frame.slide} project={project} slide={frame.slide} eager alt={`${frame.caption}, ${project.title}`} />
      </figure>
      <div className="lightbox__nav">
        <button type="button" onClick={() => go(-1)}><span aria-hidden="true">← </span>Previous</button>
        <button type="button" onClick={() => go(1)}>Next<span aria-hidden="true"> →</span></button>
      </div>
      <p className="sr-only" aria-live="polite">{live}</p>
    </div>,
    document.body,
  );
}
