import React, {
  useEffect, useRef, useState, useCallback, useMemo
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Lenis from 'lenis';

/* ═══════════════════════════════════════════════════════════════
   DATA
═══════════════════════════════════════════════════════════════ */
const PROJECTS = [
  {
    id: '01',
    title: 'F-204 Mr. Samad',
    subtitle: 'Residential · Hyderabad',
    type: '3D Presentation',
    year: '2026',
    location: 'F-204, Hyderabad',
    client: 'Mr. Samad',
    accent: '#c4a98a',
    slideCount: 31,
    folder: '/projects/project-1',
    coverSlide: 5,
    rooms: [
      { slide: 1,  name: 'Project Cover',        desc: 'A bespoke residential vision — refined, measured, and deeply personal.' },
      { slide: 4,  name: 'Formal Living Room',   desc: 'A space designed for hosting. Modern textures intersect with warm ambient lighting to create a threshold of quiet luxury.' },
      { slide: 8,  name: 'Informal Living Room', desc: 'An intimate family gathering area where comfort is the primary design principle — soft seating, layered light.' },
      { slide: 12, name: 'Master Bedroom',        desc: 'Symmetrical wood paneling, warm tonal restraint and modern low-slung seating. Restraint as a design language.' },
      { slide: 17, name: 'Guest Bedroom',         desc: 'A serene and welcoming environment. Soft neutral palettes and abundant natural light define the space.' },
      { slide: 22, name: 'Kids Bedroom',          desc: 'Playful yet sophisticated — allowing room for growth, creativity and years of memories.' },
      { slide: 27, name: 'Kitchen',               desc: 'Functional modern layout with sleek handleless cabinetry and premium stone finishes.' },
      { slide: 30, name: 'Pooja Room',            desc: 'A quiet contemplative space, carved out with deep respect for traditional sensibilities and ritual.' },
    ],
  },
  {
    id: '02',
    title: 'F-1002 Srinivas Reddy',
    subtitle: 'Residential · Hyderabad',
    type: '3D Presentation',
    year: '2026',
    location: 'F-1002, Hyderabad',
    client: 'Mr. Srinivas Reddy',
    accent: '#a3b08a',
    slideCount: 32,
    folder: '/projects/project-2',
    coverSlide: 5,
    rooms: [
      { slide: 1,  name: 'Project Cover',        desc: 'An exercise in spatial restraint — where every element earns its place.' },
      { slide: 4,  name: 'Formal Living Room',   desc: 'Fluted glass, custom marble consoles and curved partitions sculpt the living threshold. Architecture as furniture.' },
      { slide: 9,  name: 'Informal Living Room', desc: 'Soft shadows and balanced indirect illumination sculpt clean geometric volumes around the focal wall.' },
      { slide: 15, name: "Children's Bedroom",   desc: 'Bright and adaptable — integrated study zones and custom joinery grow with the child.' },
      { slide: 20, name: 'Guest Bedroom',         desc: 'Understated elegance. Tactile materials and restful hues create a room that breathes.' },
      { slide: 23, name: 'Master Bedroom',        desc: 'A luxurious retreat. Bespoke headboard detail, a walk-in wardrobe, and considered dressing light.' },
      { slide: 27, name: 'Kitchen',               desc: 'Sage green handleless cabinetry offset by white marble countertops. Precise and unhurried.' },
      { slide: 30, name: 'Pooja Room',            desc: 'Warm metallic accents and hand-crafted backdrops frame a serene spiritual corner.' },
      { slide: 31, name: 'Balcony',               desc: 'An outdoor extension designed for stillness — surveying the panoramic city views.' },
    ],
  },
];

const EXHIBITION = [
  {
    id: '01',
    projectId: '02',
    roomName: 'Formal Living Room',
    location: 'Hyderabad, IN',
    category: 'Residential Interior',
    description: 'Fluted glass, custom marble consoles and curved partitions sculpting the living threshold into something worth arriving at.',
    image: '/projects/project-2/slide-05.jpg',
  },
  {
    id: '02',
    projectId: '01',
    roomName: 'Master Suite',
    location: 'Hyderabad, IN',
    category: 'Bedroom Design',
    description: 'Symmetrical wood paneling, warm tones and modern low-slung seating — restraint elevated into a design language.',
    image: '/projects/project-1/slide-12.jpg',
  },
  {
    id: '03',
    projectId: '01',
    roomName: 'Kitchen',
    location: 'Hyderabad, IN',
    category: 'Kitchen Design',
    description: 'Handleless cabinetry, premium stone countertops and considered task lighting. Functional beauty, unhurried.',
    image: '/projects/project-1/slide-27.jpg',
  },
  {
    id: '04',
    projectId: '02',
    roomName: 'TV Media Wall',
    location: 'Hyderabad, IN',
    category: 'Living Room',
    description: 'Soft shadows and balanced indirect illumination sculpting clean geometric volumes around the focal wall.',
    image: '/projects/project-2/slide-09.jpg',
  },
];

/* ═══════════════════════════════════════════════════════════════
   LOADER
═══════════════════════════════════════════════════════════════ */
function Loader() {
  return (
    <motion.div
      className="loader"
      initial={{ y: 0 }}
      animate={{ y: '-102%' }}
      transition={{ duration: 1.2, ease: [0.77, 0, 0.175, 1], delay: 1.5 }}
    >
      <div className="loader__inner">
        <motion.div
          className="loader__name"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut', delay: 0.2 }}
        >
          Design Studio by WS
        </motion.div>
        <div className="loader__bar">
          <motion.span
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.1, ease: 'easeInOut', delay: 0.1 }}
          />
        </div>
        <motion.span
          className="loader__sub"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          Loading index
        </motion.span>
      </div>
    </motion.div>
  );
}

function WhiteFade({ onComplete }) {
  return (
    <motion.div
      className="white-fade"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 1.0, ease: 'easeOut', delay: 2.2 }}
      onAnimationComplete={onComplete}
    />
  );
}

/* ═══════════════════════════════════════════════════════════════
   FILM SECTION (interior video)
═══════════════════════════════════════════════════════════════ */
const fadeUp = {
  hidden: { opacity: 0, y: 34 },
  visible: { opacity: 1, y: 0 },
};
const sectionVp = { once: true, margin: '-10% 0px' };

function FilmSection() {
  return (
    <section className="film" id="film">
      <motion.div
        className="film__copy"
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={sectionVp}
        transition={{ duration: 0.85, ease: 'easeOut' }}
      >
        <span className="kicker">Interior film</span>
        <h2>Motion is used softly,<br />like daylight moving<br />through a room.</h2>
        <p>
          Spaces are best understood in motion — the way light
          shifts across a surface, the sequence of thresholds.
          This film distils the studio's approach to spatial storytelling.
        </p>
      </motion.div>
      <motion.div
        className="film__frame"
        initial={{ opacity: 0, scale: 0.97 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={sectionVp}
        transition={{ duration: 1.0, ease: 'easeOut' }}
      >
        <video
          src="/media/interior-film.mp4"
          poster="/media/studio-interior.jpg"
          muted
          loop
          playsInline
          autoPlay
        />
      </motion.div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   NAV
═══════════════════════════════════════════════════════════════ */
function Nav({ visible, onOpenProject }) {
  return (
    <motion.nav
      className="nav"
      aria-label="Primary navigation"
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : -16 }}
      transition={{ duration: 1.1, ease: [0.25, 1, 0.5, 1] }}
    >
      <a href="#top" className="nav__brand">Design Studio by WS</a>
      <div className="nav__links">
        <a href="#exhibition">Work</a>
        <button onClick={() => onOpenProject(PROJECTS[0])}>Projects</button>
        <a href="#studio">Studio</a>
        <a href="#contact">Contact</a>
      </div>
    </motion.nav>
  );
}

/* ═══════════════════════════════════════════════════════════════
   HERO
═══════════════════════════════════════════════════════════════ */
function Hero({ onNavReady }) {
  const heroRef = useRef(null);
  const imgWrapRef = useRef(null);
  const imgParallaxRef = useRef(null);
  const imgRef = useRef(null);
  const titleRef = useRef(null);
  const scrollHintRef = useRef(null);
  const mousePos = useRef({ x: 0, y: 0 });
  const currentMouse = useRef({ x: 0, y: 0 });
  const rafRef = useRef(null);
  const animDoneRef = useRef(false);

  useEffect(() => {
    const gsap = window.gsap;
    if (!gsap) return;
    const titleEl = titleRef.current;
    if (!titleEl) return;
    const words = [...titleEl.querySelectorAll('.hw')];
    gsap.set(words, { opacity: 0, y: 60, filter: 'blur(12px)' });
    gsap.set(imgWrapRef.current, { scale: 1.1 });
    gsap.set(scrollHintRef.current, { opacity: 0, y: 20 });
    const tl = gsap.timeline({ delay: 2.7 });
    tl.to(imgWrapRef.current, { scale: 1, duration: 2.4, ease: 'power3.out' });
    tl.to(words, {
      opacity: 1, y: 0, filter: 'blur(0px)',
      stagger: { each: 0.09 },
      duration: 1.2, ease: 'power3.out',
      onComplete: () => { animDoneRef.current = true; onNavReady?.(); },
    }, '-=1.8');
    tl.to(scrollHintRef.current, { opacity: 1, y: 0, duration: 0.9, ease: 'power2.out' }, '-=0.5');
    return () => tl.kill();
  }, [onNavReady]);

  useEffect(() => {
    if (window.matchMedia('(hover: none)').matches) return;
    const lerp = (a, b, t) => a + (b - a) * t;
    const onMove = (e) => {
      mousePos.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mousePos.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    const tick = () => {
      currentMouse.current.x = lerp(currentMouse.current.x, mousePos.current.x, 0.055);
      currentMouse.current.y = lerp(currentMouse.current.y, mousePos.current.y, 0.055);
      const { x, y } = currentMouse.current;
      if (imgParallaxRef.current) imgParallaxRef.current.style.transform = `translate(${x * 16}px, ${y * 10}px)`;
      if (titleRef.current && animDoneRef.current) titleRef.current.style.transform = `translate(${x * -7}px, ${y * -5}px)`;
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { window.removeEventListener('mousemove', onMove); cancelAnimationFrame(rafRef.current); };
  }, []);

  useEffect(() => {
    const gsap = window.gsap;
    const ST = window.ScrollTrigger;
    if (!gsap || !ST) return;
    gsap.registerPlugin(ST);
    const st = ST.create({
      trigger: heroRef.current,
      start: 'top top',
      end: '+=55%',
      pin: true,
      pinSpacing: true,
      scrub: 1.4,
      onUpdate: (self) => {
        const p = self.progress;
        if (imgRef.current) imgRef.current.style.transform = `scale(${1 - p * 0.08})`;
        if (titleRef.current) titleRef.current.style.opacity = `${1 - p * 2.2}`;
        if (scrollHintRef.current) scrollHintRef.current.style.opacity = `${1 - p * 3.5}`;
      },
    });
    return () => st.kill();
  }, []);

  return (
    <header className="hero" id="top" ref={heroRef}>
      <div className="hero__img-wrap" ref={imgWrapRef}>
        <div className="hero__img-parallax" ref={imgParallaxRef}>
          <img
            ref={imgRef}
            src="/projects/project-2/slide-10.jpg"
            alt="Design Studio by Waseem Saife — luxury interior"
            className="hero__img"
            loading="eager"
            decoding="sync"
            fetchpriority="high"
          />
        </div>
      </div>
      <div className="hero__gradient" aria-hidden="true" />
      <div className="hero__grain" aria-hidden="true" />

      <div className="hero__title-wrap" ref={titleRef}>
        <div className="hero__line">
          <span className="hw">DESIGN</span>
          <span className="hw">STUDIO</span>
        </div>
        <div className="hero__line hero__line--indent">
          <span className="hw">BY</span>
          <span className="hw">WASEEM</span>
          <span className="hw">SAIFE</span>
        </div>
      </div>

      <div className="hero__meta" aria-hidden="true">
        <span>Architecture · Interiors · Spatial Design</span>
      </div>

      <div className="hero__scroll" ref={scrollHintRef} aria-hidden="true">
        <span className="hero__scroll-label">Scroll</span>
        <div className="hero__scroll-line"><div className="hero__scroll-fill" /></div>
      </div>
    </header>
  );
}

/* ═══════════════════════════════════════════════════════════════
   EXHIBITION ITEM
═══════════════════════════════════════════════════════════════ */
function ExhibitionItem({ item, index, onSelectProject }) {
  const itemRef = useRef(null);
  const imgInnerRef = useRef(null);

  useEffect(() => {
    const gsap = window.gsap;
    const ST = window.ScrollTrigger;
    if (!gsap || !ST) return;

    const el = itemRef.current;
    const imgInner = imgInnerRef.current;
    const textEls = el.querySelectorAll('.exh__animate');

    gsap.set(el, { opacity: 0, y: 80 });
    gsap.set(imgInner, { scale: 1.1 });
    gsap.set(textEls, { opacity: 0, y: 36 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        toggleActions: 'play none none none',
      },
    });

    tl.to(el, { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out' })
      .to(imgInner, { scale: 1, duration: 1.8, ease: 'power3.out' }, '<')
      .to(textEls, { opacity: 1, y: 0, stagger: 0.1, duration: 1.0, ease: 'power3.out' }, '<+0.3');

    return () => tl.kill();
  }, []);

  const project = PROJECTS.find(p => p.id === item.projectId);

  const handleOpen = (e) => {
    e.preventDefault();
    if (project) onSelectProject(project);
  };

  return (
    <article className="exh-item" ref={itemRef}>
      <div className="exh-item__num exh__animate">
        <span>{item.id}</span>
      </div>

      <button className="exh-item__img-btn" onClick={handleOpen} aria-label={`View ${item.roomName} project`}>
        <div className="exh-item__img-wrap">
          <div className="exh-item__img-inner" ref={imgInnerRef}>
            <img
              src={item.image}
              alt={item.roomName}
              className="exh-item__img"
              loading="lazy"
              decoding="async"
            />
          </div>
          <div className="exh-item__img-overlay" aria-hidden="true" />
          <div className="exh-item__img-cta" aria-hidden="true">
            <span>Open Project</span>
          </div>
        </div>
      </button>

      <div className="exh-item__info">
        <div className="exh-item__kicker exh__animate">
          <span className="exh-item__category">{item.category}</span>
          <span className="exh-item__sep" aria-hidden="true">—</span>
          <span className="exh-item__location">{item.location}</span>
        </div>

        <h2 className="exh-item__title exh__animate">{item.roomName}</h2>

        <p className="exh-item__desc exh__animate">{item.description}</p>

        <button className="exh-item__cta exh__animate" onClick={handleOpen}>
          <span>View Full Project</span>
          <svg width="20" height="14" viewBox="0 0 20 14" fill="none" aria-hidden="true">
            <path d="M1 7h18M13 1l6 6-6 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </article>
  );
}

/* ═══════════════════════════════════════════════════════════════
   EXHIBITION SECTION
═══════════════════════════════════════════════════════════════ */
function ExhibitionSection({ onSelectProject }) {
  const introRef = useRef(null);

  useEffect(() => {
    const gsap = window.gsap;
    const ST = window.ScrollTrigger;
    if (!gsap || !ST) return;
    const el = introRef.current;
    gsap.set(el, { opacity: 0, y: 50 });
    ST.create({
      trigger: el,
      start: 'top 88%',
      once: true,
      onEnter: () => gsap.to(el, { opacity: 1, y: 0, duration: 1.3, ease: 'power3.out' }),
    });
  }, []);

  return (
    <section className="exhibition" id="exhibition">
      <div className="exhibition__intro" ref={introRef}>
        <span className="kicker">Selected Works</span>
        <p className="exhibition__tagline">Rooms composed<br />like quiet cinema.</p>
      </div>

      <div className="exhibition__list">
        {EXHIBITION.map((item, index) => (
          <ExhibitionItem
            key={item.id}
            item={item}
            index={index}
            onSelectProject={onSelectProject}
          />
        ))}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PROJECTS GRID (teaser cards)
═══════════════════════════════════════════════════════════════ */
function ProjectsGrid({ onSelectProject }) {
  const headRef = useRef(null);

  useEffect(() => {
    const gsap = window.gsap;
    const ST = window.ScrollTrigger;
    if (!gsap || !ST) return;
    gsap.set(headRef.current, { opacity: 0, y: 40 });
    ST.create({
      trigger: headRef.current,
      start: 'top 88%',
      once: true,
      onEnter: () => gsap.to(headRef.current, { opacity: 1, y: 0, duration: 1.1, ease: 'power3.out' }),
    });
  }, []);

  return (
    <section className="projects-grid" id="work">
      <div className="projects-grid__head" ref={headRef}>
        <span className="kicker">Full Presentations</span>
        <h2>Both projects, in full.</h2>
      </div>
      <div className="projects-grid__cards">
        {PROJECTS.map((project, i) => (
          <ProjectCard key={project.id} project={project} index={i} onSelect={onSelectProject} />
        ))}
      </div>
    </section>
  );
}

function ProjectCard({ project, index, onSelect }) {
  const cardRef = useRef(null);

  useEffect(() => {
    const gsap = window.gsap;
    const ST = window.ScrollTrigger;
    if (!gsap || !ST) return;
    gsap.set(cardRef.current, { opacity: 0, y: 60 });
    ST.create({
      trigger: cardRef.current,
      start: 'top 88%',
      once: true,
      onEnter: () => gsap.to(cardRef.current, { opacity: 1, y: 0, duration: 1.2, delay: index * 0.12, ease: 'power3.out' }),
    });
  }, [index]);

  const coverSrc = `${project.folder}/slide-${String(project.coverSlide).padStart(2, '0')}.jpg`;

  return (
    <button
      className="project-card"
      ref={cardRef}
      onClick={() => onSelect(project)}
      style={{ '--card-accent': project.accent }}
    >
      <div className="project-card__img-wrap">
        <img
          src={coverSrc}
          alt={project.title}
          className="project-card__img"
          loading="lazy"
          decoding="async"
        />
        <div className="project-card__img-overlay" aria-hidden="true" />
      </div>
      <div className="project-card__content">
        <div className="project-card__meta">
          <span className="project-card__id">{project.id}</span>
          <span className="project-card__type">{project.type} · {project.slideCount} slides</span>
        </div>
        <strong className="project-card__title">{project.title}</strong>
        <span className="project-card__sub">{project.subtitle}</span>
      </div>
      <div className="project-card__cta">
        <span>Open Presentation</span>
        <svg width="18" height="12" viewBox="0 0 18 12" fill="none">
          <path d="M1 6h16M11 1l6 5-6 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STUDIO
═══════════════════════════════════════════════════════════════ */
function Studio() {
  const fadeUp = { hidden: { opacity: 0, y: 34 }, visible: { opacity: 1, y: 0 } };
  const vp = { once: true, margin: '-10% 0px' };

  return (
    <section className="studio" id="studio">
      <motion.div
        className="studio__statement"
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={vp}
        transition={{ duration: 0.9, ease: 'easeOut' }}
      >
        <span className="kicker">Studio position</span>
        <h2>Architecture should feel<br />measured before it feels decorative.</h2>
      </motion.div>
      <div className="studio__grid">
        {[
          ['01', 'Site-led planning'],
          ['02', 'Interior discipline'],
          ['03', 'Material restraint'],
          ['04', 'Precise delivery'],
        ].map(([n, l], i) => (
          <motion.div
            key={n}
            className="studio__cell"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={vp}
            transition={{ duration: 0.75, delay: i * 0.09, ease: 'easeOut' }}
          >
            <span>{n}</span>
            <strong>{l}</strong>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CONTACT
═══════════════════════════════════════════════════════════════ */
function ContactSection() {
  const sectionRef = useRef(null);
  const [status, setStatus] = useState('idle'); // idle | sent

  useEffect(() => {
    const gsap = window.gsap;
    const ST = window.ScrollTrigger;
    if (!gsap || !ST) return;
    const el = sectionRef.current;
    gsap.set(el, { opacity: 0, y: 60 });
    ST.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => gsap.to(el, { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out' }),
    });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus('sent');
  };

  return (
    <section className="contact" id="contact" ref={sectionRef}>
      <div className="contact__inner">
        <div className="contact__header">
          <span className="kicker">Inquiries</span>
          <h2>Start a<br />conversation.</h2>
          <p>
            We are currently accepting new commissions for 2027.
            Please share your project details below.
          </p>
          <div className="contact__info">
            <div className="contact__info-item">
              <span>Email</span>
              <a href="mailto:hello@waseemsaife.com">hello@waseemsaife.com</a>
            </div>
            <div className="contact__info-item">
              <span>Studio</span>
              <strong>Hyderabad, India</strong>
            </div>
          </div>
        </div>

        {status === 'sent' ? (
          <div className="contact__success">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="23" stroke="currentColor" strokeWidth="1.5" />
              <path d="M14 24l8 8 12-16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <h3>Thank you</h3>
            <p>We'll be in touch shortly.</p>
          </div>
        ) : (
          <form className="contact__form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-field">
                <label htmlFor="cf-name">Name</label>
                <input id="cf-name" type="text" placeholder="Your name" required />
              </div>
              <div className="form-field">
                <label htmlFor="cf-email">Email</label>
                <input id="cf-email" type="email" placeholder="your@email.com" required />
              </div>
            </div>
            <div className="form-field">
              <label htmlFor="cf-type">Inquiry Type</label>
              <select id="cf-type" required defaultValue="">
                <option value="" disabled>Select a service</option>
                <option value="residential">Residential Architecture</option>
                <option value="interior">Interior Design</option>
                <option value="hospitality">Hospitality / Commercial</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-field">
              <label htmlFor="cf-message">Message</label>
              <textarea id="cf-message" rows="4" placeholder="Tell us about your project…" required />
            </div>
            <button type="submit" className="contact__submit">
              <span>Submit Inquiry</span>
              <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
                <path d="M1 7h18M13 1l6 6-6 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FOOTER
═══════════════════════════════════════════════════════════════ */
function Footer() {
  return (
    <footer className="footer" id="footer">
      {/* Big cinematic name marquee */}
      <div className="footer__name-marquee" aria-hidden="true">
        <div className="footer__name-track">
          {Array.from({ length: 4 }).map((_, i) => (
            <span key={i} data-text="WASEEM SAIFE">WASEEM SAIFE</span>
          ))}
        </div>
      </div>

      <div className="footer__grid">
        <div className="footer__col">
          <p className="footer__brand">Design Studio by WS</p>
          <p className="footer__sub">Architecture · Interiors · Spatial Design</p>
        </div>
        <div className="footer__col">
          <span className="footer__label">Studio</span>
          <strong>Hyderabad, India</strong>
        </div>
        <div className="footer__col">
          <span className="footer__label">Email</span>
          <a href="mailto:hello@waseemsaife.com">hello@waseemsaife.com</a>
        </div>
        <div className="footer__col">
          <span className="footer__label">Year</span>
          <strong>{new Date().getFullYear()}</strong>
        </div>
      </div>

      <div className="footer__bottom">
        <span>© {new Date().getFullYear()} Design Studio by Waseem Saife</span>
        <span>All rights reserved</span>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PROJECT PRESENTATION MODAL
═══════════════════════════════════════════════════════════════ */
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

    // Parallax scroll on image
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

    // Info text fade in on scroll
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
          alt={slide.alt}
          className="pres-slide__img"
          loading={index < 3 ? 'eager' : 'lazy'}
          decoding="async"
        />
        <div className="pres-slide__vignette" aria-hidden="true" />
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

function ProjectPresentation({ project, onClose }) {
  const scrollRef = useRef(null);

  const slides = useMemo(() => {
    if (!project) return [];
    const roomMap = {};
    project.rooms.forEach(r => { roomMap[r.slide] = r; });
    return Array.from({ length: project.slideCount }, (_, i) => {
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
    // Stop Lenis from intercepting scroll inside the modal
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
      // Refresh ScrollTrigger after deck mounts so inner scroll triggers work
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
            {/* Sticky header bar */}
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

            {/* Scrollable deck — data-lenis-prevent stops Lenis from blocking native scroll */}
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

/* ═══════════════════════════════════════════════════════════════
   INDEX STRIP
═══════════════════════════════════════════════════════════════ */
function IndexStrip() {
  return (
    <div className="index-strip">
      <div><span>Projects</span><strong>02</strong></div>
      <div><span>Slides</span><strong>63</strong></div>
      <div><span>Location</span><strong>HYD</strong></div>
      <div><span>Motion</span><strong>GSAP</strong></div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   APP
═══════════════════════════════════════════════════════════════ */
export default function App() {
  const [selectedProject, setSelectedProject] = useState(null);
  const [showIntro, setShowIntro] = useState(true);
  const [navVisible, setNavVisible] = useState(false);

  // Lenis + GSAP ticker
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    const gsap = window.gsap;
    const ST = window.ScrollTrigger;
    if (gsap && ST) {
      lenis.on('scroll', ST.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      let id;
      const raf = (t) => { lenis.raf(t); id = requestAnimationFrame(raf); };
      id = requestAnimationFrame(raf);
      return () => { cancelAnimationFrame(id); lenis.destroy(); };
    }
    return () => { lenis.destroy(); };
  }, []);

  const handleNavReady = useCallback(() => setNavVisible(true), []);

  return (
    <>
      {showIntro && <Loader />}
      {showIntro && <WhiteFade onComplete={() => setShowIntro(false)} />}
      <Nav visible={navVisible} onOpenProject={setSelectedProject} />

      <main>
        <Hero onNavReady={handleNavReady} />
        <IndexStrip />
        <ExhibitionSection onSelectProject={setSelectedProject} />
        <ProjectsGrid onSelectProject={setSelectedProject} />
        <Studio />
        <FilmSection />
        <ContactSection />
      </main>

      <Footer />

      <ProjectPresentation
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </>
  );
}
