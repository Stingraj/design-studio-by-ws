import React, { useLayoutEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger, prefersReducedMotion } from '../../lib/gsap';

export default function StackedPanels({ items, renderPanel, label }) {
  const rootRef = useRef(null);
  const [reduced] = useState(() => prefersReducedMotion());

  useLayoutEffect(() => {
    if (reduced) return undefined;
    const root = rootRef.current;
    let ctx;

    const build = () => {
      ctx && ctx.revert();
      ctx = gsap.context(() => {
        const panels = gsap.utils.toArray('.stack-panel', root);
        panels.forEach((p) => { p.style.marginBottom = ''; });
        panels.pop();

        panels.forEach((panel) => {
          // Get the element holding the content inside the panel
          const innerpanel = panel.querySelector('.stack-panel__inner');
          const panelHeight = innerpanel.offsetHeight;
          const windowHeight = window.innerHeight;
          const difference = panelHeight - windowHeight;

          // portion of the timeline used for fake-scrolling content taller than the viewport
          const fakeScrollRatio = difference > 0 ? (difference / (difference + windowHeight)) : 0;

          if (fakeScrollRatio) {
            panel.style.marginBottom = `${panelHeight * fakeScrollRatio}px`;
          }

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: panel,
              start: 'bottom bottom',
              end: () => (fakeScrollRatio ? `+=${innerpanel.offsetHeight}` : 'bottom top'),
              pinSpacing: false,
              pin: true,
              scrub: true,
            },
          });

          if (fakeScrollRatio) {
            tl.to(innerpanel, { yPercent: -100, y: window.innerHeight, duration: 1 / (1 - fakeScrollRatio) - 1, ease: 'none' });
          }
          tl.fromTo(panel, { scale: 1, opacity: 1 }, { scale: 0.7, opacity: 0.5, duration: 0.9 })
            .to(panel, { opacity: 0, duration: 0.1 });
        });
      }, root);
    };
    build();

    let lastWidth = window.innerWidth;
    let timer;
    const onResize = () => {
      if (window.innerWidth === lastWidth) return;
      lastWidth = window.innerWidth;
      clearTimeout(timer);
      timer = setTimeout(() => {
        build();
        ScrollTrigger.refresh();
      }, 200);
    };
    window.addEventListener('resize', onResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', onResize);
      ctx && ctx.revert();
      gsap.utils.toArray('.stack-panel', root).forEach((p) => { p.style.marginBottom = ''; });
    };
  }, [items, reduced]);

  return (
    <div className={`slides-wrapper${reduced ? ' slides-wrapper--static' : ''}`} ref={rootRef} aria-label={label} role="region">
      {items.map((item, i) => (
        <section className={`stack-panel stack-panel--${i % 2 ? 'dark' : 'light'}`} key={item.key ?? i}>
          <div className="stack-panel__content">
            <div className="stack-panel__inner">{renderPanel(item, i)}</div>
          </div>
        </section>
      ))}
    </div>
  );
}
