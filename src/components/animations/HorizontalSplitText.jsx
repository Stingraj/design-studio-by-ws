import React, { useLayoutEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger, SplitText, prefersReducedMotion } from '../../lib/gsap';

export default function HorizontalSplitText({ text, kicker }) {
  const wrapperRef = useRef(null);
  const textRef = useRef(null);
  const [reduced] = useState(() => prefersReducedMotion());

  useLayoutEffect(() => {
    if (reduced) return undefined;
    let ctx;
    let cancelled = false;

    (document.fonts?.ready ?? Promise.resolve()).then(() => {
      if (cancelled || !wrapperRef.current) return;
      ctx = gsap.context(() => {
        const wrapper = wrapperRef.current;
        const textEl = textRef.current;
        const split = SplitText.create(textEl, { type: 'chars, words' });

        const scrollTween = gsap.to(textEl, {
          xPercent: -100,
          ease: 'none',
          scrollTrigger: {
            trigger: wrapper,
            pin: true,
            end: () => `+=${Math.round(textEl.offsetWidth * 0.75)}`,
            scrub: true,
            invalidateOnRefresh: true,
          },
        });

        split.chars.forEach((char) => {
          gsap.from(char, {
            yPercent: 'random(-200, 200)',
            rotation: 'random(-20, 20)',
            ease: 'back.out(1.2)',
            scrollTrigger: {
              trigger: char,
              containerAnimation: scrollTween,
              start: 'left 100%',
              end: 'left 30%',
              scrub: 1,
            },
          });
        });
      }, wrapperRef);
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
    });

    return () => {
      cancelled = true;
      ctx && ctx.revert();
    };
  }, [text, reduced]);

  return (
    <div className="hsplit-root">
      <section className={`Horizontal${reduced ? ' Horizontal--static' : ''}`} ref={wrapperRef}>
        {kicker && <span className="Horizontal__kicker">{kicker}</span>}
        <div className="container">
          <h2 className="Horizontal__text heading-xl" ref={textRef}>{text}</h2>
        </div>
      </section>
    </div>
  );
}
