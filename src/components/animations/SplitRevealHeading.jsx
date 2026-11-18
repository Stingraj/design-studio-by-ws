import React, { useLayoutEffect, useRef } from 'react';
import { gsap, ScrollTrigger, SplitText, prefersReducedMotion } from '../../lib/gsap';

export default function SplitRevealHeading({ as: Tag = 'h1', className = '', delay = 0.5, children }) {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const text = ref.current;
    if (prefersReducedMotion()) {
      text.removeAttribute('aria-hidden');
      return undefined;
    }
    gsap.set(text, { opacity: 0 });
    let mySplitText;
    let tween;
    let st;
    let cancelled = false;

    const animate = (d) => {
      if (!text.isSplit) {
        mySplitText.split({
          type: 'chars, words',
          charsClass: 'char',
        });
      }
      tween && tween.kill();
      tween = gsap.from(mySplitText.chars, {
        duration: 1,
        delay: d,
        opacity: 0,
        scale: 0,
        y: 80,
        rotationX: 180,
        transformOrigin: '0% 50% -50',
        ease: 'back',
        stagger: 0.05,
        onComplete: () => {
          mySplitText.revert();
          text.removeAttribute('aria-hidden');
        },
      });
    };

    (document.fonts?.ready ?? Promise.resolve()).then(() => {
      if (cancelled) return;
      gsap.set(text, { opacity: 1 });
      mySplitText = SplitText.create(text, {
        type: 'chars, words',
        charsClass: 'char',
      });
      animate(delay);
      st = ScrollTrigger.create({ trigger: text, start: 'top bottom', end: 'bottom top', onEnterBack: () => animate(0) });
    });

    return () => {
      cancelled = true;
      tween && tween.kill();
      st && st.kill();
      mySplitText && mySplitText.revert();
      gsap.set(text, { clearProps: 'opacity' });
    };
  }, [delay]);

  return (
    <Tag ref={ref} className={`split-reveal ${className}`.trim()} aria-hidden="true">
      {children}
    </Tag>
  );
}
