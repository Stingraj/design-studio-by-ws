import React, { useLayoutEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger, prefersReducedMotion } from '../../lib/gsap';

export default function HorizontalGalleryStrip({ images, label = 'Gallery' }) {
  const secRef = useRef(null);
  const stripRef = useRef(null);
  const [reduced] = useState(() => prefersReducedMotion());

  useLayoutEffect(() => {
    if (reduced) return undefined;
    const sec = secRef.current;
    const pinWrap = stripRef.current;

    let pinWrapWidth;
    let horizontalScrollLength;

    function refresh() {
      pinWrapWidth = pinWrap.scrollWidth;
      horizontalScrollLength = pinWrapWidth - window.innerWidth;
    }

    refresh();
    const ctx = gsap.context(() => {
      // Pinning and horizontal scrolling
      gsap.to(pinWrap, {
        scrollTrigger: {
          scrub: true,
          trigger: sec,
          pin: sec,
          start: 'center center',
          end: () => `+=${pinWrapWidth}`,
          invalidateOnRefresh: true,
        },
        x: () => -horizontalScrollLength,
        ease: 'none',
      });
    });

    ScrollTrigger.addEventListener('refreshInit', refresh);
    return () => {
      ScrollTrigger.removeEventListener('refreshInit', refresh);
      ctx.revert();
    };
  }, [images, reduced]);

  return (
    <section className={`portfolio${reduced ? ' portfolio--static' : ''}`} aria-label={label}>
      <div className="container-fluid">
        <div className="horiz-gallery-wrapper" ref={secRef}>
          <div className="horiz-gallery-strip" ref={stripRef}>
            {images.map((img, i) => (
              <figure className="project-wrap" key={img.src}>
                <img src={img.src} alt={img.caption} loading="lazy" decoding="async" />
                <figcaption>
                  <span>{String(i + 1).padStart(2, '0')}</span>
                  {img.caption}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
