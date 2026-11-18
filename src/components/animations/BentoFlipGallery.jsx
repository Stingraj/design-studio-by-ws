import React, { useLayoutEffect, useRef } from 'react';
import { gsap, ScrollTrigger, Flip, prefersReducedMotion } from '../../lib/gsap';

export default function BentoFlipGallery({ images, label = 'Gallery' }) {
  const galleryRef = useRef(null);
  const items = images.slice(0, 8);

  useLayoutEffect(() => {
    const galleryElement = galleryRef.current;
    if (!galleryElement || prefersReducedMotion()) return undefined;
    const galleryItems = galleryElement.querySelectorAll('.gallery__item');
    let flipCtx;

    const createTween = () => {
      flipCtx && flipCtx.revert();
      galleryElement.classList.remove('gallery--final');

      flipCtx = gsap.context(() => {
        // Temporarily add the final class to capture the final state
        galleryElement.classList.add('gallery--final');
        const flipState = Flip.getState(galleryItems);
        galleryElement.classList.remove('gallery--final');

        const flip = Flip.to(flipState, {
          simple: true,
          ease: 'expoScale(1, 5)',
        });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: galleryElement,
            start: 'center center',
            end: '+=100%',
            scrub: true,
            pin: galleryElement.parentNode,
          },
        });
        tl.add(flip);
        return () => gsap.set(galleryItems, { clearProps: 'all' });
      });
    };
    createTween();

    let lastWidth = window.innerWidth;
    let timer;
    const onResize = () => {
      if (window.innerWidth === lastWidth) return;
      lastWidth = window.innerWidth;
      clearTimeout(timer);
      timer = setTimeout(() => {
        createTween();
        ScrollTrigger.refresh();
      }, 200);
    };
    window.addEventListener('resize', onResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', onResize);
      flipCtx && flipCtx.revert();
      galleryElement.classList.remove('gallery--final');
    };
  }, [images]);

  return (
    <div className="bento-flip" role="region" aria-label={label}>
      <div className="gallery-wrap">
        <div className="gallery gallery--bento" ref={galleryRef}>
          {items.map((img) => (
            <figure className="gallery__item" key={img.src}>
              <img src={img.src} alt={img.caption} loading="lazy" decoding="async" />
            </figure>
          ))}
        </div>
      </div>
    </div>
  );
}
