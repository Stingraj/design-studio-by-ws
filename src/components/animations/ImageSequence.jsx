import React, { useLayoutEffect, useRef, useState } from 'react';
import { gsap, prefersReducedMotion } from '../../lib/gsap';
import { imageSequence } from '../../lib/imageSequence';

const frameUrl = (folder, i) => `${folder}/frame-${String(i + 1).padStart(3, '0')}.jpg`;

export default function ImageSequence({
  folder,
  frameCount,
  width = 1280,
  height = 720,
  chapters,
  label,
}) {
  const rootRef = useRef(null);
  const canvasRef = useRef(null);
  const [reduced] = useState(() => prefersReducedMotion());

  useLayoutEffect(() => {
    if (reduced) return undefined;
    const root = rootRef.current;
    const captions = root.querySelectorAll('.seq__chapter');
    const bar = root.querySelector('.seq__progress span');
    let active = -1;

    const ctx = gsap.context(() => {
      const urls = new Array(frameCount).fill().map((o, i) => frameUrl(folder, i));
      imageSequence({
        urls,
        canvas: canvasRef.current,
        onUpdate: (index) => {
          const next = chapters.findIndex((c) => index >= c.from && index <= c.to);
          if (next !== active) {
            captions.forEach((el, i) => el.classList.toggle('is-active', i === next));
            active = next;
          }
          gsap.set(bar, { scaleX: index / (frameCount - 1) });
        },
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: '+=220%',
          pin: true,
          scrub: true,
        },
      });
    }, root);

    return () => ctx.revert();
  }, [folder, frameCount, chapters, reduced]);

  return (
    <div className="seq-root">
      <section className={`seq${reduced ? ' seq--static' : ''}`} ref={rootRef} aria-label={label}>
        {reduced ? (
          <img
            className="seq__canvas"
            src={frameUrl(folder, frameCount - 1)}
            alt={label}
            loading="lazy"
          />
        ) : (
          <canvas className="seq__canvas" ref={canvasRef} width={width} height={height} role="img" aria-label={label} />
        )}
        <div className="seq__shade" aria-hidden="true" />
        <ol className="seq__chapters">
          {chapters.map((c, i) => (
            <li key={c.title} className={`seq__chapter${i === 0 ? ' is-active' : ''}`}>
              <span className="kicker">{c.kicker}</span>
              <h3>{c.title}</h3>
              <p>{c.text}</p>
            </li>
          ))}
        </ol>
        <div className="seq__progress" aria-hidden="true"><span /></div>
      </section>
    </div>
  );
}
