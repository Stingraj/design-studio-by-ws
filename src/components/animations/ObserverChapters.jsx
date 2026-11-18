import React, { useLayoutEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger, SplitText, Observer, prefersReducedMotion } from '../../lib/gsap';
import { getLenis } from '../../lib/scroll';

const bgImage = (src) => `linear-gradient(180deg, rgba(0, 0, 0, 0.6) 50%, rgba(0, 0, 0, 0.1) 100%), url("${src}")`;

function scrollTo(y) {
  const lenis = getLenis();
  if (lenis) lenis.scrollTo(y, { immediate: true, force: true });
  else window.scrollTo(0, y);
}

export default function ObserverChapters({ chapters, label }) {
  const rootRef = useRef(null);
  const [reduced] = useState(() => prefersReducedMotion());

  useLayoutEffect(() => {
    if (reduced) return undefined;
    const root = rootRef.current;
    let ctx;
    let cancelled = false;
    let teardown = () => {};

    (document.fonts?.ready ?? Promise.resolve()).then(() => {
      if (cancelled) return;
      ctx = gsap.context(() => {
        const sections = root.querySelectorAll('.chapter');
        const images = root.querySelectorAll('.chapter .bg');
        const headings = gsap.utils.toArray('.section-heading', root);
        const outerWrappers = gsap.utils.toArray('.outer', root);
        const innerWrappers = gsap.utils.toArray('.inner', root);
        const splitHeadings = headings.map((heading) => new SplitText(heading, { type: 'chars,words,lines', linesClass: 'clip-text' }));
        const counter = root.querySelector('.chapters__count');
        const dots = root.querySelectorAll('.chapters__dot');
        let currentIndex = -1;
        let animating = false;
        let active = false;

        gsap.set(outerWrappers, { yPercent: 100 });
        gsap.set(innerWrappers, { yPercent: -100 });

        function gotoSection(index, direction) {
          animating = true;
          const fromTop = direction === -1;
          const dFactor = fromTop ? -1 : 1;
          const tl = gsap.timeline({
            defaults: { duration: 1.25, ease: 'power1.inOut' },
            onComplete: () => { animating = false; },
          });
          if (currentIndex >= 0) {
            gsap.set(sections[currentIndex], { zIndex: 0 });
            tl.to(images[currentIndex], { yPercent: -15 * dFactor })
              .set(sections[currentIndex], { autoAlpha: 0 });
          }
          gsap.set(sections[index], { autoAlpha: 1, zIndex: 1 });
          tl.fromTo([outerWrappers[index], innerWrappers[index]], {
            yPercent: (i) => (i ? -100 * dFactor : 100 * dFactor),
          }, {
            yPercent: 0,
          }, 0)
            .fromTo(images[index], { yPercent: 15 * dFactor }, { yPercent: 0 }, 0)
            .fromTo(splitHeadings[index].chars, {
              autoAlpha: 0,
              yPercent: 150 * dFactor,
            }, {
              autoAlpha: 1,
              yPercent: 0,
              duration: 1,
              ease: 'power2',
              stagger: {
                each: 0.02,
                from: 'random',
              },
            }, 0.2);

          currentIndex = index;
          counter.textContent = `${String(index + 1).padStart(2, '0')} / ${String(sections.length).padStart(2, '0')}`;
          dots.forEach((d, i) => {
            d.classList.toggle('is-active', i === index);
            if (i === index) d.setAttribute('aria-current', 'step');
            else d.removeAttribute('aria-current');
          });
        }

        const observer = Observer.create({
          target: window,
          type: 'wheel,touch,pointer',
          wheelSpeed: -1,
          onDown: () => !animating && step(-1),
          onUp: () => !animating && step(1),
          tolerance: 10,
          preventDefault: true,
        });
        observer.disable();

        let st;

        function deactivate() {
          if (!active) return;
          active = false;
          observer.disable();
          root.classList.remove('is-active');
          getLenis()?.start();
        }

        function activate(snapY, index, direction) {
          if (active) return;
          active = true;
          getLenis()?.stop();
          scrollTo(snapY);
          root.classList.add('is-active');
          observer.enable();
          if (currentIndex !== index && !animating) gotoSection(index, direction);
        }

        // Leaving at either end jumps across the pinned range, which is visually seamless
        function step(dir) {
          const next = currentIndex + dir;
          if (next < 0 || next >= sections.length) {
            deactivate();
            scrollTo(dir > 0 ? st.end + 2 : st.start - 2);
            return;
          }
          gotoSection(next, dir);
        }

        st = ScrollTrigger.create({
          trigger: root,
          start: 'top top',
          end: '+=100%',
          pin: true,
          onEnter: (self) => activate(self.start + 1, 0, 1),
          onEnterBack: (self) => activate(self.end - 1, sections.length - 1, -1),
          onLeave: deactivate,
          onLeaveBack: deactivate,
        });

        ScrollTrigger.create({
          trigger: root,
          start: 'top 80%',
          once: true,
          onEnter: () => currentIndex < 0 && gotoSection(0, 1),
        });

        const onKey = (e) => {
          if (!active) return;
          const fwd = ['ArrowDown', 'PageDown', ' '].includes(e.key);
          const back = ['ArrowUp', 'PageUp'].includes(e.key);
          if (!fwd && !back) return;
          e.preventDefault();
          if (!animating) step(fwd ? 1 : -1);
        };
        window.addEventListener('keydown', onKey);

        const onDot = (e) => {
          const i = Number(e.currentTarget.dataset.index);
          if (animating || i === currentIndex) return;
          gotoSection(i, i > currentIndex ? 1 : -1);
        };
        dots.forEach((d) => d.addEventListener('click', onDot));

        teardown = () => {
          window.removeEventListener('keydown', onKey);
          dots.forEach((d) => d.removeEventListener('click', onDot));
          if (active) getLenis()?.start();
          observer.kill();
          splitHeadings.forEach((s) => s.revert());
        };
      }, root);
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
    });

    return () => {
      cancelled = true;
      teardown();
      ctx && ctx.revert();
    };
  }, [chapters, reduced]);

  if (reduced) {
    return (
      <div className="chapters chapters--static" aria-label={label} role="region">
        {chapters.map((c) => (
          <section className="chapter" key={c.num}>
            <div className="bg" style={{ backgroundImage: bgImage(c.image) }}>
              <div className="chapter__body">
                <span className="chapter__kicker">{c.kicker}</span>
                <h2 className="section-heading">{c.heading}</h2>
                <p>{c.text}</p>
              </div>
            </div>
          </section>
        ))}
      </div>
    );
  }

  return (
    <div className="chapters-root">
      <div className="chapters" ref={rootRef} aria-label={label} role="region">
        {chapters.map((c) => (
          <section className="chapter" key={c.num}>
            <div className="outer">
              <div className="inner">
                <div className="bg" style={{ backgroundImage: bgImage(c.image) }}>
                  <div className="chapter__body">
                    <span className="chapter__kicker">{c.kicker}</span>
                    <h2 className="section-heading">{c.heading}</h2>
                    <p>{c.text}</p>
                    {c.outputs && (
                      <ul className="chapter__outputs">
                        {c.outputs.map((o) => <li key={o}>{o}</li>)}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        ))}
        <div className="chapters__hud">
          <span className="chapters__count" aria-live="polite">01 / {String(chapters.length).padStart(2, '0')}</span>
          <div className="chapters__dots">
            {chapters.map((c, i) => (
              <button type="button" key={c.num} className="chapters__dot" data-index={i} aria-label={`Show ${c.kicker}`} />
            ))}
          </div>
          <span className="chapters__hint">Scroll, swipe or use arrow keys</span>
        </div>
      </div>
    </div>
  );
}
