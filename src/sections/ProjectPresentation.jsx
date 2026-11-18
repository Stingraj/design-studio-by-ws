import React, { useEffect, useMemo, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

function PresentationSlide({ slide, index, scrollRef }) {
  const slideRef = useRef(null);
  const imgRef = useRef(null);
  const infoRef = useRef(null);

  useEffect(() => {
    const gsap = window.gsap;
    const ST = window.ScrollTrigger;
    if (!gsap || !ST) return;

    const el = slideRef.current;
    const img = imgRef.current;

    if (img) {
      gsap.fromTo(img,
        { y: '-12%' },
        {
          y: '12%',
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            scroller: scrollRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        }
      );
    }

    if (infoRef.current) {
      gsap.fromTo(infoRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            scroller: scrollRef.current,
            start: 'top 55%',
            toggleActions: 'play none none none',
          },
        }
      );
    }
  }, [scrollRef]);

  return (
    <div ref={slideRef} className="pres-slide">
      <div className="pres-slide__img-wrap">
        <img
          ref={imgRef}
          src={slide.src}
          alt=""
          className="pres-slide__img"
          loading={index < 3 ? 'eager' : 'lazy'}
          decoding="async"
        />
      </div>

      {slide.room && (
        <div className="pres-slide__info" ref={infoRef}>
          <div className="pres-slide__info-inner">
            <span className="pres-slide__room-label">{slide.room.name}</span>
            <p className="pres-slide__room-desc">{slide.room.desc}</p>
          </div>
        </div>
      )}

      <div className="pres-slide__counter">
        {slide.counter}
      </div>
    </div>
  );
}

export default function ProjectPresentation({ project, onClose }) {
  const scrollRef = useRef(null);

  const slides = useMemo(() => {
    if (!project) return [];
    const roomMap = {};
    project.rooms?.forEach((r) => { roomMap[r.slide] = r; });
    return Array.from({ length: project.slideCount || 0 }, (_, i) => {
      const n = i + 1;
      const padded = String(n).padStart(2, '0');
      return {
        src: `${project.folder}/slide-${padded}.jpg`,
        alt: `${project.title} — slide ${padded}`,
        counter: `${padded} / ${String(project.slideCount).padStart(2, '0')}`,
        room: roomMap[n] || null,
      };
    });
  }, [project]);

  useEffect(() => {
    if (!project) return;
    const esc = (e) => { if (e.key === 'Escape') onClose(); };
    document.body.classList.add('modal-open');
    document.documentElement.setAttribute('data-lenis-prevent', '');
    window.addEventListener('keydown', esc);
    return () => {
      document.body.classList.remove('modal-open');
      document.documentElement.removeAttribute('data-lenis-prevent');
      window.removeEventListener('keydown', esc);
    };
  }, [project, onClose]);

  useEffect(() => {
    if (project && scrollRef.current) {
      scrollRef.current.scrollTop = 0;
      setTimeout(() => window.ScrollTrigger?.refresh(), 100);
    }
  }, [project]);

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          className="pres-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={project.title}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <motion.div
            className="pres-panel"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.8, ease: [0.77, 0, 0.175, 1] }}
          >
            <div className="pres-bar">
              <div className="pres-bar__left">
                <span className="pres-bar__type">{project.type}</span>
                <h2 className="pres-bar__title">{project.title}</h2>
              </div>
              <div className="pres-bar__right">
                <span className="pres-bar__meta">{project.location} · {project.year}</span>
                <button
                  type="button"
                  onClick={onClose}
                  className="pres-bar__close"
                  aria-label="Close presentation"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            </div>

            <div className="pres-deck" ref={scrollRef} data-lenis-prevent>
              {slides.map((slide, i) => (
                <PresentationSlide
                  key={slide.src}
                  slide={slide}
                  index={i}
                  scrollRef={scrollRef}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
