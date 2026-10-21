import React, {
  useEffect, useLayoutEffect, useRef, useState, useCallback, useMemo
} from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import Lenis from 'lenis';
import { gsap, ScrollTrigger } from './lib/gsap';
import { matchPath, useRouter } from './lib/router';
import { setLenis, scrollToTop, scrollToElement } from './lib/scroll';
import { PROJECTS } from './data/projects';
import { DEFAULT_COMPANIES } from './data/site';
import use3DTilt from './hooks/use3DTilt';
import Nav from './components/layout/Nav';
import Footer from './components/layout/Footer';
import CompaniesSection from './sections/CompaniesSection';
import TeamSection, { DEFAULT_STUDIO_TEAM } from './sections/TeamSection';
import ContactSection from './sections/ContactSection';
import ProjectPresentation from './sections/ProjectPresentation';
import ServicesIndex from './sections/ServicesIndex';
import WaveField from './components/animations/WaveField';
import StudioPage from './pages/StudioPage';
import ServicesPage from './pages/ServicesPage';
import ServiceDetailPage from './pages/ServiceDetailPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import ProcessPage from './pages/ProcessPage';
import ContactPage from './pages/ContactPage';
import NotFoundPage from './pages/NotFoundPage';
import {
  supabase,
  supabaseAdmin,
  getCompanies,
  getTeamMembers,
  getPublicProjects,
  getEliteProjects,
  getAllProjectsAdmin,
  getAccessLogs,
  recordAccessLog,
  getSignedEliteUrl,
  verifyMemberAccess,
  registerEliteMember,
} from './lib/supabase';

const PARALLAX_PROJECT_SLIDES = [
  {
    id: '01',
    projectId: '02',
    slideIndex: 5,
    roomName: 'Formal Living Room',
    projectTitle: 'Residence F-1002 Srinivas Reddy',
    location: 'Hyderabad, India',
    category: 'Spatial Threshold & Lounge',
    description: 'Fluted glass partitions, bespoke marble consoles, and curved architectural dividers sculpting the living threshold into a sanctuary of measured light.',
    materials: ['Fluted Glass', 'Italian Marble', 'Smoked Oak', '2700K Cove Light'],
    image: '/projects/project-2/slide-05.jpg',
  },
  {
    id: '02',
    projectId: '01',
    slideIndex: 12,
    roomName: 'Master Bedroom Suite',
    projectTitle: 'Residence F-204 Mr. Samad',
    location: 'Hyderabad, India',
    category: 'Private Suite',
    description: 'Symmetrical wood paneling, warm tonal restraint, and low-slung custom upholstery. Architecture as quiet, unhurried sanctuary.',
    materials: ['Walnut Veneer', 'Raw Linen', 'Bronze Joinery', 'Indirect Ambient'],
    image: '/projects/project-1/slide-12.jpg',
  },
  {
    id: '03',
    projectId: '02',
    slideIndex: 9,
    roomName: 'Informal Living & Media Wall',
    projectTitle: 'Residence F-1002 Srinivas Reddy',
    location: 'Hyderabad, India',
    category: 'Family Living Area',
    description: 'Soft shadows and balanced indirect illumination sculpting clean geometric volumes around the focal architectural media unit.',
    materials: ['Muted Travertine', 'Custom Millwork', 'Recessed Track', 'Natural Oak'],
    image: '/projects/project-2/slide-09.jpg',
  },
  {
    id: '04',
    projectId: '01',
    slideIndex: 27,
    roomName: 'Culinary Studio & Kitchen',
    projectTitle: 'Residence F-204 Mr. Samad',
    location: 'Hyderabad, India',
    category: 'Kitchen Architecture',
    description: 'Handleless cabinetry offset by seamless stone surfaces and integrated task illumination. Functional beauty elevated.',
    materials: ['Quartz Composite', 'Matte Lacquer', 'Concealed LED', 'Brushed Brass'],
    image: '/projects/project-1/slide-27.jpg',
  },
  {
    id: '05',
    projectId: '01',
    slideIndex: 17,
    roomName: 'Guest Sanctuary Suite',
    projectTitle: 'Residence F-204 Mr. Samad',
    location: 'Hyderabad, India',
    category: 'Guest Bedroom',
    description: 'Understated elegance where tactile textures and restful neutral hues create a room that breathes with natural morning light.',
    materials: ['Textured Plaster', 'Natural Wood', 'Sheer Drapery', 'Neutral Palette'],
    image: '/projects/project-1/slide-17.jpg',
  },
  {
    id: '06',
    projectId: '02',
    slideIndex: 31,
    roomName: 'Panoramic Sky Balcony',
    projectTitle: 'Residence F-1002 Srinivas Reddy',
    location: 'Hyderabad, India',
    category: 'Outdoor Transition',
    description: 'An outdoor architectural extension designed for stillness — surveying the panoramic city skyline with curated natural greenery.',
    materials: ['Weathered Teak', 'Frameless Glass', 'Exterior Sconces', 'City Horizon'],
    image: '/projects/project-2/slide-31.jpg',
  },
];

/* ═══════════════════════════════════════════════════════════════
   ATELIER MATERIALITY & CRAFT STUDIES (Horizontal Pinned Gallery)
═══════════════════════════════════════════════════════════════ */
const MATERIALITY_STUDIES = [
  {
    id: '01',
    num: 'I',
    title: 'Travertine & Honed Limestone',
    subtitle: 'Thermal Mass & Acoustic Stillness',
    tagline: 'Ancient quarries · Honed zero-glaze finish · Seamless monolithic joints',
    desc: 'Mineral surfaces that absorb natural morning light without reflection. Hand-dressed limestone slabs calibrated to 20mm tolerances create an acoustic barrier of serene domestic quietude.',
    specs: [
      { label: 'Density', val: '2.68 g/cm³' },
      { label: 'Finish', val: 'Honed Matte' },
      { label: 'Origin', val: 'Tivoli & Deccan' },
    ],
    swatches: ['Roman Travertine', 'Deccan Limestone', 'Zero-Sheen Seal', 'Monolithic Threshold'],
    image: '/media/project-01.jpg',
  },
  {
    id: '02',
    num: 'II',
    title: 'Smoked Walnut & Fluted Glass',
    subtitle: 'Architectural Millwork & Privacy Gradients',
    tagline: 'Italian smoked walnut · Low-iron reed glass · Concealed pivot joinery',
    desc: 'Custom-sculpted wood paneling that functions as structural partitions. Vertical fluted reeds modulate daylight between public salon and private suites with measured cinematic shadow.',
    specs: [
      { label: 'Tolerance', val: '0.5 mm' },
      { label: 'Timber', val: 'Smoked European Walnut' },
      { label: 'Glass', val: '8mm Low-Iron Reeds' },
    ],
    swatches: ['Fluted Glass', 'Italian Walnut', 'Concealed Pivot', 'Shadow Gap Detailing'],
    image: '/projects/project-2/slide-05.jpg',
  },
  {
    id: '03',
    num: 'III',
    title: '2700K Architectural Light',
    subtitle: 'Circadian Balance & Indirect Ambient Coves',
    tagline: 'CRI 98+ spectrum · Concealed cove plastering · Glare-free optic channels',
    desc: 'Lighting is treated as a spatial material rather than a decorative fixture. Concealed 2700K coves wash stone surfaces at gentle rake angles, simulating the golden hour dusk of the Deccan plateau.',
    specs: [
      { label: 'Color Temp', val: '2700K Warm' },
      { label: 'CRI Index', val: '98.4 Studio Grade' },
      { label: 'Optics', val: 'Indirect 45° Cove' },
    ],
    swatches: ['Indirect Cove', 'Plaster-in Channel', 'Circadian Dimming', 'Zero Direct Glare'],
    image: '/projects/project-2/slide-09.jpg',
  },
  {
    id: '04',
    num: 'IV',
    title: 'Monolithic Stone & Culinary Joinery',
    subtitle: 'Seamless Surfaces & Integrated Mechanics',
    tagline: 'Quartz composite · Matte anti-fingerprint lacquer · Brushed bronze hardware',
    desc: 'Handleless culinary architecture where appliances vanish behind continuous veneered surfaces. Precision pocket doors reveal professional-grade preparation zones without disturbing spatial tranquility.',
    specs: [
      { label: 'Surface', val: 'Seamless Quartz' },
      { label: 'Cabinetry', val: 'Handleless J-Profile' },
      { label: 'Hardware', val: 'Brushed Solid Bronze' },
    ],
    swatches: ['Matte Quartz', 'European Pocket Doors', 'Integrated Task LED', 'Brushed Bronze'],
    image: '/projects/project-1/slide-27.jpg',
  },
  {
    id: '05',
    num: 'V',
    title: 'Panoramic Sky Horizon & Raw Linen',
    subtitle: 'Tactile Textiles & Outdoor Extensions',
    tagline: 'Weathered teak decking · Frameless low-iron glass · Belgian sheer linen',
    desc: 'An outdoor architectural extension designed for stillness. Floor-to-ceiling sheer drapery softens the Hyderabad city horizon while framing sunsets across deep sheltered terraces.',
    specs: [
      { label: 'Decking', val: 'FSC Weathered Teak' },
      { label: 'Drapery', val: '100% Belgian Sheer' },
      { label: 'Horizon', val: '180° Panoramic' },
    ],
    swatches: ['Weathered Teak', 'Frameless Glass Balustrade', 'Belgian Linen', 'City Horizon'],
    image: '/projects/project-2/slide-31.jpg',
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
   HERO — Pure Cinematic Video Scroll-Scrub Experience
═══════════════════════════════════════════════════════════════ */
function Hero({ onNavReady }) {
  const heroRef = useRef(null);
  const videoRef = useRef(null);
  const videoWrapRef = useRef(null);
  const titleRef = useRef(null);
  const scrollHintRef = useRef(null);

  // High-definition video scrub duration (trimmed cleanly before TV logo screen)
  const [videoDuration, setVideoDuration] = useState(32.1);

  // Animation & Smooth Interpolation Refs
  const targetProgressRef = useRef(0);
  const currentProgressRef = useRef(0);
  const rafRef = useRef(null);
  const mousePos = useRef({ x: 0, y: 0 });
  const currentMouse = useRef({ x: 0, y: 0 });
  const animDoneRef = useRef(false);

  // Fast Instant Video Preload
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, []);

  // Snappy title & camera reveal animation
  useEffect(() => {
    const gsap = window.gsap;
    if (!gsap) return;
    const titleEl = titleRef.current;
    if (!titleEl) return;
    const words = [...titleEl.querySelectorAll('.hw')];
    gsap.set(words, { opacity: 0, y: 40, filter: 'blur(8px)' });
    gsap.set(videoWrapRef.current, { scale: 1.02, opacity: 0 });
    gsap.set(scrollHintRef.current, { opacity: 0, y: 15 });

    const tl = gsap.timeline({ delay: 0.15 });
    tl.to(videoWrapRef.current, { opacity: 1, scale: 1, duration: 0.9, ease: 'power3.out' });
    tl.to(
      words,
      {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        stagger: { each: 0.05 },
        duration: 0.8,
        ease: 'power3.out',
        onComplete: () => {
          animDoneRef.current = true;
          onNavReady?.();
        },
      },
      '-=0.7'
    );
    tl.to(scrollHintRef.current, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.3');

    return () => tl.kill();
  }, [onNavReady]);

  // Subtle Mouse Parallax on Desktop
  useEffect(() => {
    if (window.matchMedia('(hover: none)').matches) return;
    const lerp = (a, b, t) => a + (b - a) * t;
    const onMove = (e) => {
      mousePos.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mousePos.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMove, { passive: true });

    const tick = () => {
      currentMouse.current.x = lerp(currentMouse.current.x, mousePos.current.x, 0.04);
      currentMouse.current.y = lerp(currentMouse.current.y, mousePos.current.y, 0.04);
      const { x, y } = currentMouse.current;

      if (videoWrapRef.current) {
        videoWrapRef.current.style.transform = `translate(${x * 10}px, ${y * 6}px)`;
      }
      if (titleRef.current && animDoneRef.current) {
        titleRef.current.style.transform = `translate(${x * -5}px, ${y * -3}px)`;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Main GSAP ScrollTrigger Pinning & Extended Smooth Scrub Setup
  useEffect(() => {
    const gsap = window.gsap;
    const ST = window.ScrollTrigger;
    if (!gsap || !ST || !heroRef.current) return;
    gsap.registerPlugin(ST);

    const st = ST.create({
      trigger: heroRef.current,
      start: 'top top',
      end: '+=450%',
      pin: true,
      pinSpacing: true,
      anticipatePin: 1,
      onUpdate: (self) => {
        targetProgressRef.current = self.progress;
      },
    });

    return () => st.kill();
  }, []);

  // High-performance smooth LERP loop for video scrubbing and scene camera scaling
  useEffect(() => {
    let animId;
    const lerp = (a, b, t) => a + (b - a) * t;
    let lastSeekTime = -1;

    const updateLoop = () => {
      const vid = videoRef.current;
      const dur = vid?.duration && isFinite(vid.duration) && vid.duration > 0 ? vid.duration : videoDuration;

      currentProgressRef.current = lerp(currentProgressRef.current, targetProgressRef.current, 0.085);
      const p = Math.max(0, Math.min(1, currentProgressRef.current));

      const targetTime = p * (dur > 0.5 ? dur - 0.05 : dur);
      if (vid && !vid.seeking && Math.abs(targetTime - lastSeekTime) > 0.012) {
        try {
          if (vid.fastSeek && typeof vid.fastSeek === 'function') {
            vid.fastSeek(targetTime);
          } else {
            vid.currentTime = targetTime;
          }
          lastSeekTime = targetTime;
        } catch (e) {
          // Ignore seek skips
        }
      }

      if (vid) {
        const camScale = 1.0 + p * 0.05;
        vid.style.transform = `scale(${camScale})`;
      }

      if (titleRef.current) {
        const titleOpacity = Math.max(0, 1 - p * 3.5);
        const titleY = -p * 80;
        const titleBlur = p * 12;
        titleRef.current.style.opacity = `${titleOpacity}`;
        titleRef.current.style.filter = `blur(${titleBlur}px)`;
        titleRef.current.style.transform = `translateY(${titleY}px)`;
      }

      if (scrollHintRef.current) {
        const hintOpacity = Math.max(0, 1 - p * 4.0);
        scrollHintRef.current.style.opacity = `${hintOpacity}`;
      }

      animId = requestAnimationFrame(updateLoop);
    };

    animId = requestAnimationFrame(updateLoop);
    return () => cancelAnimationFrame(animId);
  }, [videoDuration]);

  const handleLoadedMetadata = () => {
    if (videoRef.current && isFinite(videoRef.current.duration)) {
      setVideoDuration(videoRef.current.duration);
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <header className="hero" id="top" ref={heroRef} data-cursor="scrub">
      <div className="hero__video-wrap" ref={videoWrapRef}>
        <video
          ref={videoRef}
          src="/media/hero-scroll-scrub.mp4"
          poster="/media/hero-video-poster.jpg"
          className="hero__video"
          muted
          playsInline
          preload="auto"
          onLoadedMetadata={handleLoadedMetadata}
          aria-hidden="true"
        />
      </div>

      <div className="hero__gradient" aria-hidden="true" />

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
        <div className="hero__meta" aria-hidden="true">
          <span>Architecture · Interiors · Spatial Strategy</span>
        </div>
      </div>

      <div className="hero__scroll" ref={scrollHintRef} aria-hidden="true">
        <span className="hero__scroll-label">Scroll to explore</span>
        <div className="hero__scroll-line">
          <div className="hero__scroll-fill" />
        </div>
      </div>
    </header>
  );
}

/* ═══════════════════════════════════════════════════════════════
   INDEX STRIP
═══════════════════════════════════════════════════════════════ */
function IndexStrip() {
  return (
    <div className="index-strip">
      <div><span>Establishment</span><strong>MMXXVI</strong></div>
      <div><span>Commissions</span><strong>02 Realized</strong></div>
      <div><span>Registry</span><strong>Invitation</strong></div>
      <div><span>Jurisdiction</span><strong>Hyderabad</strong></div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MATERIALITY & CRAFT HORIZONTAL SECTION (Pinned Atelier Scroll)
═══════════════════════════════════════════════════════════════ */
function MaterialityHorizontalSection() {
  const sectionRef = useRef(null);
  const stageRef = useRef(null);
  const trackRef = useRef(null);
  const [activePanel, setActivePanel] = useState(0);

  useEffect(() => {
    const gsap = window.gsap;
    const ST = window.ScrollTrigger;
    if (!gsap || !ST || !stageRef.current || !trackRef.current) return;

    const stage = stageRef.current;
    const track = trackRef.current;
    const totalPanels = MATERIALITY_STUDIES.length;

    // Master horizontal scroll scrub pinned to viewport
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: stage,
        start: 'top top',
        end: () => `+=${track.scrollWidth - window.innerWidth + window.innerHeight * 0.45}`,
        pin: true,
        scrub: 0.85,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const p = self.progress;
          const current = Math.min(totalPanels - 1, Math.floor(p * totalPanels));
          setActivePanel(current);
        },
      },
    });

    tl.to(track, {
      x: () => -(track.scrollWidth - window.innerWidth),
      ease: 'none',
    });

    // Inner image counter-parallax across panels
    const images = track.querySelectorAll('.horizontal-card__img');
    images.forEach((img) => {
      tl.fromTo(
        img,
        { xPercent: 12, scale: 1.08 },
        { xPercent: -12, scale: 1.0, ease: 'none' },
        0
      );
    });

    return () => {
      tl.kill();
      ST.getAll().forEach((st) => {
        if (st.trigger === stage) st.kill();
      });
    };
  }, []);

  return (
    <section className="horizontal-sec" id="materiality" ref={sectionRef}>
      <div className="sec-rule" />
      <div className="horizontal-sec-intro">
        <div className="sec-head">
          <span className="sec-roman">Atelier Studies</span>
          <h2 className="sec-title">Spatial Materiality & Craft.</h2>
          <p className="sec-sub">
            A horizontal architectural chronicle across tactile minerals, structural joinery, and 2700K ambient illumination — engineered with Italian restraint.
          </p>
        </div>
      </div>

      <div className="horizontal-stage" ref={stageRef} data-cursor="drag">
        <div className="horizontal-track" ref={trackRef}>
          {MATERIALITY_STUDIES.map((study, idx) => (
            <article key={study.id} className="horizontal-card" data-cursor="drag">
              <div className="horizontal-card__img-wrap curtain-reveal">
                <img
                  src={study.image}
                  alt={study.title}
                  className="horizontal-card__img"
                  loading="lazy"
                />
                <div className="horizontal-card__img-overlay" aria-hidden="true" />
                <span className="horizontal-card__num">{study.num}</span>
              </div>

              <div className="horizontal-card__body">
                <div className="horizontal-card__meta">
                  <span className="horizontal-card__kicker">STUDY 0{idx + 1}</span>
                  <span className="horizontal-card__sub">{study.subtitle}</span>
                </div>

                <h3 className="horizontal-card__title">{study.title}</h3>
                <p className="horizontal-card__tagline">{study.tagline}</p>
                <p className="horizontal-card__desc">{study.desc}</p>

                <div className="horizontal-card__specs">
                  {study.specs.map((sp, i) => (
                    <div key={i} className="horizontal-card__spec">
                      <span>{sp.label}</span>
                      <strong>{sp.val}</strong>
                    </div>
                  ))}
                </div>

                <div className="horizontal-card__swatches">
                  {study.swatches.map((sw, i) => (
                    <span key={i} className="horizontal-card__swatch">{sw}</span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* HUD Progress Indicator */}
        <div className="horizontal-hud">
          <div className="horizontal-hud__counter">
            <span>STUDY 0{activePanel + 1} / 0{MATERIALITY_STUDIES.length}</span>
          </div>
          <div className="horizontal-hud__bar">
            <div
              className="horizontal-hud__fill"
              style={{ width: `${((activePanel + 1) / MATERIALITY_STUDIES.length) * 100}%` }}
            />
          </div>
          <div className="horizontal-hud__label">
            <span>Scroll vertically to pan atelier studies</span>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SECTION III: BOTTOM-TO-TOP CARD SWIPING PROJECT DECK
═══════════════════════════════════════════════════════════════ */
function ParallaxProjectDeck({ onSelectProject }) {
  const introRef = useRef(null);
  const deckPinRef = useRef(null);
  const cardRefs = useRef([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const gsap = window.gsap;
    const ST = window.ScrollTrigger;
    if (!gsap || !ST) return;

    // Intro header reveal
    const introEl = introRef.current;
    if (introEl) {
      gsap.fromTo(
        introEl,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1.0,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: introEl,
            start: 'top 85%',
          },
        }
      );
    }

    const pinEl = deckPinRef.current;
    const cards = cardRefs.current.filter(Boolean);
    if (!pinEl || cards.length === 0) return;

    const total = cards.length;

    // Initial setup:
    // Card 0 seated in view (yPercent: 0, zIndex: 10)
    // Cards 1..N start below viewport (yPercent: 100, zIndex: 11..N)
    cards.forEach((c, idx) => {
      gsap.set(c, {
        yPercent: idx === 0 ? 0 : 100,
        scale: 1,
        filter: 'brightness(1)',
        zIndex: idx + 10,
      });
    });

    // Master Timeline: scrubs card swiping from bottom to top with ultra-smooth parallax
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: pinEl,
        start: 'top top',
        end: `+=${(total - 1) * 130}%`,
        pin: true,
        scrub: 0.8,
        anticipatePin: 1,
        onUpdate: (self) => {
          const p = self.progress;
          const current = Math.min(total - 1, Math.floor(p * total));
          setActiveIndex(current);
        },
      },
    });

    // Animate each card swiping up from bottom to top
    for (let i = 1; i < total; i++) {
      const prev = cards[i - 1];
      const curr = cards[i];

      // Current card swipes up from bottom (yPercent: 100 -> 0)
      tl.to(
        curr,
        {
          yPercent: 0,
          ease: 'power2.inOut',
          duration: 1.2,
        },
        `card-swipe-${i}`
      );

      // Previous card tucks back: scales down slightly and dims to create deep spatial parallax
      tl.to(
        prev,
        {
          scale: 0.94,
          filter: 'brightness(0.38) blur(1px)',
          y: -14,
          ease: 'power2.inOut',
          duration: 1.2,
        },
        `card-swipe-${i}`
      );

      // Parallax counter-slide inside current card image
      const img = curr.querySelector('.swipe-card__img');
      if (img) {
        tl.fromTo(
          img,
          { scale: 1.14, yPercent: -8 },
          { scale: 1.0, yPercent: 4, ease: 'none', duration: 1.2 },
          `card-swipe-${i}`
        );
      }
    }

    return () => {
      tl.kill();
      ST.getAll().forEach((st) => {
        if (st.trigger === pinEl) st.kill();
      });
    };
  }, []);

  return (
    <section className="card-deck-sec" id="projects">
      <div className="sec-rule" />
      <div className="card-deck-intro" ref={introRef}>
        <div className="card-deck-intro__inner">
          <span className="sec-roman">III. Projects & Spatial Portfolio</span>
          <h2 className="card-deck-tagline">
            Spatial atmospheres,<br />swiped frame by frame.
          </h2>
          <p className="card-deck-lead">
            A sequential bottom-to-top card showcase through realized private residential commissions — where raw volume, bespoke joinery, and measured daylight converge.
          </p>
        </div>
      </div>

      {/* Pinned Stage for Bottom-to-Top Card Swiping */}
      <div className="card-deck-stage" ref={deckPinRef}>
        {/* Scroll Swipe Hint */}
        <div className="card-deck-hint">
          <span>Scroll down to swipe spaces up</span>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M7 11V3M3 7l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* Cards Stack */}
        <div className="card-deck-stack">
          {PARALLAX_PROJECT_SLIDES.map((slide, index) => {
            const project = PROJECTS.find((p) => p.id === slide.projectId);
            return (
              <article
                key={slide.id}
                ref={(el) => (cardRefs.current[index] = el)}
                className="swipe-card"
              >
                <div className="swipe-card__img-wrap">
                  <img
                    src={slide.image}
                    alt={slide.roomName}
                    className="swipe-card__img"
                    loading={index === 0 ? 'eager' : 'lazy'}
                  />
                  <div className="swipe-card__overlay" aria-hidden="true" />
                </div>

                {/* Self-contained card topbar (no overlap with fixed navbar) */}
                <div className="swipe-card__topbar">
                  <span className="swipe-card__counter">
                    SPACE 0{index + 1} / 0{PARALLAX_PROJECT_SLIDES.length}
                  </span>
                  <span className="swipe-card__category-badge">
                    {slide.category}
                  </span>
                </div>

                <div className="swipe-card__body">
                  <div className="swipe-card__meta">
                    <span className="swipe-card__badge">{slide.location}</span>
                    <span className="swipe-card__loc">· {slide.projectTitle}</span>
                  </div>

                  <h3 className="swipe-card__title">{slide.roomName}</h3>
                  <p className="swipe-card__project">{slide.projectTitle}</p>

                  <p className="swipe-card__desc">{slide.description}</p>

                  <div className="swipe-card__materials">
                    {slide.materials.map((mat, i) => (
                      <span key={i} className="swipe-card__pill">{mat}</span>
                    ))}
                  </div>

                  <div className="swipe-card__actions">
                    <button
                      className="swipe-card__btn"
                      onClick={() => project && onSelectProject(project)}
                    >
                      <span>Explore 3D Presentation</span>
                      <svg width="18" height="12" viewBox="0 0 20 14" fill="none" aria-hidden="true">
                        <path d="M1 7h18M13 1l6 6-6 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PROJECTS GRID (Teaser Cards)
═══════════════════════════════════════════════════════════════ */
function ProjectsGrid({ onSelectProject }) {
  return (
    <section className="projects-grid" id="work">
      <div className="projects-grid__head">
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
  const cardRef = use3DTilt(6, 1.02);
  const coverSrc = `${project.folder}/slide-${String(project.coverSlide).padStart(2, '0')}.jpg`;

  return (
    <button
      ref={cardRef}
      className="project-card tilt-card"
      onClick={() => onSelect(project)}
      style={{ '--card-accent': project.accent }}
      data-cursor="explore"
    >
      <div className="project-card__img-wrap curtain-reveal">
        <img
          src={coverSrc}
          alt=""
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
   TRANSFORMATION SECTION (Spatial Materialization Study)
═══════════════════════════════════════════════════════════════ */
function TransformationSection() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const gsap = window.gsap;
    const ST = window.ScrollTrigger;
    if (!gsap || !ST) return;
    const el = sectionRef.current;
    const ctx = gsap.context(() => {
      gsap.set(el, { opacity: 0, y: 50 });
      ST.create({
        trigger: el,
        start: 'top 85%',
        once: true,
        onEnter: () => gsap.to(el, { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out' }),
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <section className="transformation-section" id="transformation" ref={sectionRef}>
      <div className="transformation-section__inner">
        <div className="transformation-section__head">
          <span className="kicker">Spatial Genesis</span>
          <h2>From Bare Volume<br />to Living Sanctuary.</h2>
          <p>
            An architectural chronicle of spatial materialization — illustrating how raw
            proportions, bespoke walnut joinery, and 2700K ambient cove lighting transform
            an unadorned space into a finished private residence.
          </p>
          <div className="transformation-section__tags">
            <span>01 Volume</span>
            <span>·</span>
            <span>02 Joinery & Light</span>
            <span>·</span>
            <span>03 Living Curation</span>
          </div>
        </div>

        <div className="transformation-section__frame curtain-reveal" data-cursor="scrub">
          <video
            src="/media/gemini_generated_video_008e35a5.mp4"
            poster="/media/studio-interior.jpg"
            muted
            loop
            autoPlay
            playsInline
          />
          <div className="transformation-section__meta">
            <span>Spatial Sequence · Residence F-1002</span>
            <span>Unfolding Interior Architecture</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SECTION IV: ELITE INVITATION TEASER
═══════════════════════════════════════════════════════════════ */
function EliteInvitationSection({ onOpenAuth, currentUser, onOpenElite }) {
  return (
    <section className="elite-invite-sec" id="elite">
      <div className="elite-invite-sec__inner">
        <span className="elite-seal">IV. Private Registry</span>
        <h2>Private Commissions & Spatial Archive</h2>
        <p>
          Access to unreleased residential case studies, proprietary engineering briefs, and private project commissions is strictly invitation-only.
        </p>
        {currentUser ? (
          <button className="elite-invite-sec__btn" onClick={onOpenElite}>
            Enter Member Portal ({currentUser.role.toUpperCase()})
          </button>
        ) : (
          <button className="elite-invite-sec__btn" onClick={() => onOpenAuth('login')}>
            Member Login / Private Registry
          </button>
        )}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FILM SECTION
═══════════════════════════════════════════════════════════════ */
function FilmSection() {
  const fadeUp = { hidden: { opacity: 0, y: 34 }, visible: { opacity: 1, y: 0 } };
  const sectionVp = { once: true, margin: '-10% 0px' };

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
   STUDIO SECTION
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
   AUTHENTICATION MODAL (/login & /admin/login)
═══════════════════════════════════════════════════════════════ */
function AuthModal({ mode, onClose, onAuthSuccess }) {
  const initialTab = mode === 'admin' ? 'admin' : 'login';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  // Auto-fill and immediately execute 1-click login
  const handleQuickLogin = async (targetEmail, targetRole) => {
    setEmail(targetEmail);
    setPassword('password123');
    setErrorMsg(null);
    setLoading(true);

    try {
      const check = await verifyMemberAccess(targetEmail);
      if (!check.allowed) {
        setErrorMsg('Access is by invitation only. Contact the studio for an invitation.');
        setLoading(false);
        return;
      }

      await recordAccessLog(targetRole === 'admin' ? 'admin_login' : 'elite_login', {
        email: targetEmail,
        role: check.role,
        note: check.note,
      });

      const member = {
        email: targetEmail.trim().toLowerCase(),
        role: check.role || targetRole,
        name: check.note || (check.role === 'admin' ? 'Studio Administrator' : 'Elite Member'),
      };

      localStorage.setItem('ds_user', JSON.stringify(member));
      onAuthSuccess(member);
      onClose();
    } catch (err) {
      setErrorMsg('Failed to authenticate credentials. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const check = await verifyMemberAccess(email);
      if (!check.allowed) {
        setErrorMsg('Access is strictly by private invitation. Email not recognized in Studio Registry.');
        setLoading(false);
        return;
      }

      if (activeTab === 'admin' && check.role !== 'admin') {
        setErrorMsg('Access denied. This account does not possess Studio Administrator privileges.');
        setLoading(false);
        return;
      }

      await recordAccessLog(activeTab === 'admin' ? 'admin_login' : 'elite_login', {
        email,
        role: check.role,
        note: check.note,
      });

      const member = {
        email: email.trim().toLowerCase(),
        role: check.role,
        name: check.note || (check.role === 'admin' ? 'Studio Administrator' : 'Elite Member'),
      };

      localStorage.setItem('ds_user', JSON.stringify(member));
      onAuthSuccess(member);
      onClose();
    } catch (err) {
      console.error('Auth error:', err);
      setErrorMsg(err?.message || 'Authentication error. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-overlay" onClick={onClose}>
      <div className="auth-card" onClick={(e) => e.stopPropagation()}>
        <button className="auth-close" onClick={onClose} aria-label="Close">✕</button>

        {/* Tab Navigation */}
        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => { setActiveTab('login'); setErrorMsg(null); setSuccessMsg(null); }}
          >
            Private Member Login
          </button>
          <button
            type="button"
            className={`auth-tab ${activeTab === 'admin' ? 'active' : ''}`}
            onClick={() => { setActiveTab('admin'); setErrorMsg(null); setSuccessMsg(null); }}
          >
            Admin Access
          </button>
        </div>

        {/* Header Text */}
        <div className="auth-header">
          <h3>
            {activeTab === 'login' && 'Private Member Portal'}
            {activeTab === 'admin' && 'Studio Governance Portal'}
          </h3>
          <p>
            {activeTab === 'login' && 'Enter your authorized email to access private commissions and archives'}
            {activeTab === 'admin' && 'Registry administration, allowlist management, and CMS controls'}
          </p>
        </div>

        {/* Alerts */}
        {errorMsg && <div className="auth-error">{errorMsg}</div>}
        {successMsg && <div className="auth-success-badge">{successMsg}</div>}

        {/* Quick Working Credentials Box */}
        <div className="auth-quick-card">
          <div className="auth-quick-title">
            <span>Direct 1-Click Access</span>
            <span className="auth-quick-badge">Instant Login</span>
          </div>
          <div className="auth-quick-grid">
            <div className="auth-quick-item">
              <div className="auth-quick-info">
                <span className="auth-quick-role">🛡️ Studio Administrator</span>
                <span className="auth-quick-creds">
                  Login: <strong>you@example.com</strong> | Pass: <strong>password123</strong>
                </span>
              </div>
              <button
                type="button"
                className="auth-quick-btn"
                onClick={() => handleQuickLogin('you@example.com', 'admin')}
                disabled={loading}
              >
                ⚡ Sign In
              </button>
            </div>

            <div className="auth-quick-item">
              <div className="auth-quick-info">
                <span className="auth-quick-role">🌟 Elite Member</span>
                <span className="auth-quick-creds">
                  Login: <strong>member1@example.com</strong> | Pass: <strong>password123</strong>
                </span>
              </div>
              <button
                type="button"
                className="auth-quick-btn"
                onClick={() => handleQuickLogin('member1@example.com', 'elite')}
                disabled={loading}
              >
                ⚡ Sign In
              </button>
            </div>
          </div>
        </div>

        {/* Form */}
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label>{activeTab === 'admin' ? 'Administrator Email' : 'Authorized VIP Email'}</label>
            <input
              type="email"
              className="auth-input"
              placeholder={activeTab === 'admin' ? 'admin@waseemsaife.com' : 'client@private.com'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="auth-field">
            <label>Password / Security Key</label>
            <input
              type="password"
              className="auth-input"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? 'Authenticating...' : (
              activeTab === 'admin'
                ? 'Sign In as Administrator'
                : 'Sign In to Member Portal'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ELITE MEMBER PORTAL MODAL (/elite)
═══════════════════════════════════════════════════════════════ */
function ElitePortalModal({ user, onClose, onOpenAdmin }) {
  const [eliteProjects, setEliteProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getEliteProjects();
        setEliteProjects(data?.length > 0 ? data : DEFAULT_ADMIN_PROJECTS.filter((p) => p.visibility === 'elite'));
      } catch (err) {
        console.warn('Failed to fetch elite projects:', err);
        setEliteProjects(DEFAULT_ADMIN_PROJECTS.filter((p) => p.visibility === 'elite'));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="portal-fullscreen">
      <div className="portal-topbar">
        <div className="portal-brand">
          <span>DESIGN STUDIO BY WS</span>
          <span style={{ color: 'var(--gold)' }}>·</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--gold)' }}>ELITE REGISTRY</span>
        </div>
        <div className="portal-user-meta">
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>{user.email}</span>
          {user.role === 'admin' && (
            <button className="portal-close-btn" onClick={onOpenAdmin}>Admin View</button>
          )}
          <button className="portal-close-btn" onClick={onClose}>Exit Portal</button>
        </div>
      </div>

      <div className="sec-head sec-head--dark" style={{ padding: '0 0 48px' }}>
        <span className="sec-roman">Private Portfolio · Flagship</span>
        <h2 className="sec-title">Project Aquila.</h2>
        <p className="sec-sub">Members-only briefing. Bespoke private residential commission with continuous limestone surfaces and acoustic seclusion.</p>
      </div>

      {/* Flagship Card */}
      <div className="flagship-box">
        <div className="flagship-media">
          <img src="/media/hero-residence.jpg" alt="Project Aquila" />
        </div>
        <div className="flagship-info">
          <span className="flagship-tag">CLASSIFIED · COMMISSIONS MMXXVI</span>
          <h3 className="flagship-title">Project Aquila</h3>
          <p className="flagship-summary">
            A 14,000 sq ft private estate sculpted into natural topography. Features acoustic fluted oak dividers, concealed biometric entries, and master daylight corridors.
          </p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
            <span className="p-slide__pill">Limestone</span>
            <span className="p-slide__pill">Smoked Walnut</span>
            <span className="p-slide__pill">Signed Vault Media</span>
          </div>
        </div>
      </div>

      {/* Member Projects List */}
      <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
        <h3 style={{ fontFamily: 'var(--font-cinzel)', fontSize: '18px', color: 'var(--gold)', marginBottom: '24px' }}>
          Registered Private Projects ({eliteProjects.length})
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {eliteProjects.map((p) => (
            <div key={p.id} style={{ background: '#181818', border: '1px solid var(--line-gold)', padding: '24px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--gold)', textTransform: 'uppercase' }}>
                {p.visibility} · {p.category}
              </span>
              <h4 style={{ fontFamily: 'var(--font-bodoni)', fontSize: '20px', color: 'var(--paper)', margin: '8px 0' }}>{p.title}</h4>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'rgba(245,240,230,0.7)', lineHeight: '1.5' }}>{p.summary}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   DEFAULT ADMIN FALLBACKS
═══════════════════════════════════════════════════════════════ */
const DEFAULT_ADMIN_PROJECTS = [
  {
    id: 'eb39008c-767d-460e-9cf7-3f2d249feed5',
    title: 'Residence F-204 Mr. Samad',
    category: 'Residential Architecture',
    visibility: 'public',
    status: 'published',
    is_featured: true,
    created_at: '2026-10-04T10:50:00Z',
  },
  {
    id: '3e54dc22-5360-465a-b357-81eacf431a47',
    title: 'Residence F-1002 Srinivas Reddy',
    category: 'Luxury Interior Design',
    visibility: 'public',
    status: 'published',
    is_featured: true,
    created_at: '2026-10-04T10:50:00Z',
  },
  {
    id: '573d726c-f7fe-4ed8-8afa-f42cf647f007',
    title: 'Project Aquila — Private Estate',
    category: 'Private Commission',
    visibility: 'elite',
    status: 'published',
    is_featured: true,
    created_at: '2026-10-04T10:50:00Z',
  },
  {
    id: '062b717d-cb7d-49b7-8eab-7bbd4abec797',
    title: 'The Courtyard Villa',
    category: 'Spatial Heritage',
    visibility: 'elite',
    status: 'published',
    is_featured: false,
    created_at: '2026-10-04T10:50:00Z',
  },
];

const DEFAULT_ALLOWLIST_MEMBERS = [
  { email: 'you@example.com', role: 'admin', note: 'Primary Studio Owner', created_at: '2026-10-04T03:47:33Z' },
  { email: 'stingrajx7@gmail.com', role: 'admin', note: 'Primary Workspace Administrator', created_at: '2026-10-04T10:20:52Z' },
  { email: 'member1@example.com', role: 'elite', note: 'Founding Collector & Client', created_at: '2026-10-04T03:47:33Z' },
  { email: 'demo@example.com', role: 'elite', note: 'Private Member (Self-Registered)', created_at: '2026-10-04T10:20:35Z' },
];

const DEFAULT_AUDIT_LOGS = [
  { id: 'l-1', event_type: 'admin_login', ip_address: '127.0.0.1', metadata: { email: 'stingrajx7@gmail.com', role: 'admin' }, created_at: '2026-10-04T16:15:00Z' },
  { id: 'l-2', event_type: 'elite_login', ip_address: '127.0.0.1', metadata: { email: 'member1@example.com', role: 'elite' }, created_at: '2026-10-04T15:42:00Z' },
  { id: 'l-3', event_type: 'member_registered', ip_address: '127.0.0.1', metadata: { email: 'demo@example.com', role: 'elite' }, created_at: '2026-10-04T10:20:00Z' },
];

/* ═══════════════════════════════════════════════════════════════
   ADMINISTRATION DASHBOARD MODAL (/admin)
═══════════════════════════════════════════════════════════════ */
function AdminDashboardModal({ user, onClose, onOpenElite }) {
  const [activeTab, setActiveTab] = useState('projects');
  const [projects, setProjects] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [team, setTeam] = useState([]);
  const [allowlist, setAllowlist] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState('');

  // Quick project creation form state
  const [showAddProject, setShowAddProject] = useState(false);
  const [newProjTitle, setNewProjTitle] = useState('');
  const [newProjCategory, setNewProjCategory] = useState('Private Residential');
  const [newProjSummary, setNewProjSummary] = useState('');
  const [newProjDesc, setNewProjDesc] = useState('');
  const [newProjVisibility, setNewProjVisibility] = useState('elite');

  // New allowlist member form state
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('elite');
  const [newNote, setNewNote] = useState('');

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3500);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, cRes, tRes, lRes, aRes] = await Promise.allSettled([
        getAllProjectsAdmin(),
        getCompanies(),
        getTeamMembers(),
        getAccessLogs(),
        supabaseAdmin.from('elite_allowlist').select('*').order('created_at', { ascending: false }),
      ]);

      const projectsData = pRes.status === 'fulfilled' && pRes.value?.length > 0 ? pRes.value : DEFAULT_ADMIN_PROJECTS;
      const companiesData = cRes.status === 'fulfilled' && cRes.value?.length > 0 ? cRes.value : DEFAULT_COMPANIES;
      const teamData = tRes.status === 'fulfilled' && tRes.value?.length > 0 ? tRes.value : DEFAULT_STUDIO_TEAM;
      const logsData = lRes.status === 'fulfilled' && lRes.value?.length > 0 ? lRes.value : DEFAULT_AUDIT_LOGS;
      const allowlistData = aRes.status === 'fulfilled' && aRes.value?.data?.length > 0 ? aRes.value.data : DEFAULT_ALLOWLIST_MEMBERS;

      setProjects(projectsData);
      setCompanies(companiesData);
      setTeam(teamData);
      setLogs(logsData);
      setAllowlist(allowlistData);
    } catch (err) {
      console.warn('Error fetching admin data, using defaults:', err);
      setProjects(DEFAULT_ADMIN_PROJECTS);
      setCompanies(DEFAULT_COMPANIES);
      setTeam(DEFAULT_STUDIO_TEAM);
      setLogs(DEFAULT_AUDIT_LOGS);
      setAllowlist(DEFAULT_ALLOWLIST_MEMBERS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Toggle Project Visibility (Public <-> Elite)
  const handleToggleVisibility = async (p) => {
    const nextVis = p.visibility === 'elite' ? 'public' : 'elite';
    try {
      setProjects((prev) => prev.map((item) => item.id === p.id ? { ...item, visibility: nextVis } : item));
      await supabaseAdmin.from('projects').update({ visibility: nextVis }).eq('id', p.id);
      showToast(`Project "${p.title}" visibility changed to ${nextVis.toUpperCase()}`);
    } catch (err) {
      console.warn('Visibility update fallback:', err);
    }
  };

  // Toggle Project Status (Published <-> Draft)
  const handleToggleStatus = async (p) => {
    const nextStatus = p.status === 'published' ? 'draft' : 'published';
    try {
      setProjects((prev) => prev.map((item) => item.id === p.id ? { ...item, status: nextStatus } : item));
      await supabaseAdmin.from('projects').update({ status: nextStatus }).eq('id', p.id);
      showToast(`Project "${p.title}" status changed to ${nextStatus.toUpperCase()}`);
    } catch (err) {
      console.warn('Status update fallback:', err);
    }
  };

  // Toggle Featured
  const handleToggleFeatured = async (p) => {
    const nextFeatured = !p.is_featured;
    try {
      setProjects((prev) => prev.map((item) => item.id === p.id ? { ...item, is_featured: nextFeatured } : item));
      await supabaseAdmin.from('projects').update({ is_featured: nextFeatured }).eq('id', p.id);
      showToast(`Project "${p.title}" featured status updated`);
    } catch (err) {
      console.warn('Featured update fallback:', err);
    }
  };

  // Create New Project Commission
  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProjTitle) return;
    try {
      const slug = newProjTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const newEntry = {
        title: newProjTitle.trim(),
        slug: slug || `proj-${Date.now()}`,
        category: newProjCategory,
        summary: newProjSummary.trim() || 'Classified private architectural commission.',
        description: newProjDesc.trim() || 'Proprietary spatial study and construction chronicle.',
        visibility: newProjVisibility,
        status: 'published',
        is_featured: false,
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabaseAdmin.from('projects').insert([newEntry]).select();
      const saved = data?.[0] || { ...newEntry, id: `p-${Date.now()}` };
      setProjects((prev) => [saved, ...prev]);
      setNewProjTitle('');
      setNewProjSummary('');
      setNewProjDesc('');
      setShowAddProject(false);
      showToast(`Created new ${newProjVisibility.toUpperCase()} project: "${saved.title}"`);
    } catch (err) {
      showToast(`Error creating project: ${err.message}`);
    }
  };

  // Authorize & Send Elite Member Access
  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!newEmail) return;
    const cleanEmail = newEmail.trim().toLowerCase();
    try {
      const { data, error } = await supabaseAdmin.from('elite_allowlist').upsert([
        { email: cleanEmail, role: newRole, note: newNote.trim() || 'Authorized via Admin Governance' },
      ], { onConflict: 'email' }).select();

      const saved = data?.[0] || { email: cleanEmail, role: newRole, note: newNote.trim(), created_at: new Date().toISOString() };
      setAllowlist((prev) => [saved, ...prev.filter((m) => m.email !== cleanEmail)]);
      setNewEmail('');
      setNewNote('');
      showToast(`Authorized & sent ${newRole.toUpperCase()} access to ${cleanEmail}`);
    } catch (err) {
      showToast(`Error authorizing member: ${err.message}`);
    }
  };

  // Toggle Member Role
  const handleToggleMemberRole = async (m) => {
    const nextRole = m.role === 'admin' ? 'elite' : 'admin';
    try {
      setAllowlist((prev) => prev.map((item) => item.email === m.email ? { ...item, role: nextRole } : item));
      await supabaseAdmin.from('elite_allowlist').update({ role: nextRole }).eq('email', m.email);
      showToast(`Updated ${m.email} role to ${nextRole.toUpperCase()}`);
    } catch (err) {
      console.warn('Role update fallback:', err);
    }
  };

  // Revoke Member Access
  const handleRemoveMember = async (email) => {
    if (!window.confirm(`Revoke Elite/Admin access for ${email}?`)) return;
    try {
      setAllowlist((prev) => prev.filter((m) => m.email !== email));
      await supabaseAdmin.from('elite_allowlist').delete().eq('email', email);
      showToast(`Revoked access for ${email}`);
    } catch (err) {
      showToast(`Error revoking member: ${err.message}`);
    }
  };

  return (
    <div className="portal-fullscreen">
      <div className="portal-topbar">
        <div className="portal-brand">
          <span>DESIGN STUDIO BY WS</span>
          <span style={{ color: 'var(--gold)' }}>·</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--gold)' }}>GOVERNANCE & ADMINISTRATION</span>
        </div>
        <div className="portal-user-meta">
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--gold)' }}>ADMIN: {user.email}</span>
          <button className="portal-close-btn" onClick={onOpenElite}>Member View</button>
          <button className="portal-close-btn" onClick={onClose}>Exit Admin</button>
        </div>
      </div>

      {notification && (
        <div style={{
          maxWidth: '1440px',
          margin: '0 auto 24px',
          padding: '14px 20px',
          background: 'rgba(176, 141, 87, 0.18)',
          border: '1px solid var(--gold)',
          color: 'var(--paper)',
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span>✦ {notification}</span>
          <button onClick={() => setNotification('')} style={{ color: 'var(--gold)', fontSize: '12px' }}>✕</button>
        </div>
      )}

      <div className="admin-tabs">
        {['projects', 'companies', 'team', 'members', 'logs'].map((tab) => (
          <button
            key={tab}
            className={`admin-tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      {/* ── PROJECTS TAB ────────────────────────────────────────── */}
      {activeTab === 'projects' && (
        <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--stone)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
              All Studio Commissions & Private Archives ({projects.length})
            </span>
            <button
              className="admin-action-btn"
              onClick={() => setShowAddProject(!showAddProject)}
              style={{ background: showAddProject ? 'var(--gold)' : 'rgba(245,240,230,0.1)', color: showAddProject ? 'var(--ink)' : 'var(--paper)' }}
            >
              {showAddProject ? '✕ Close Form' : '+ New Commission'}
            </button>
          </div>

          {showAddProject && (
            <form className="uploader-box" onSubmit={handleCreateProject} style={{ marginBottom: '32px' }}>
              <h3>Register New Commission</h3>
              <div className="uploader-grid">
                <div className="auth-field">
                  <label>Project Title</label>
                  <input
                    type="text"
                    className="auth-input"
                    placeholder="e.g. Residence F-504 Villa"
                    value={newProjTitle}
                    onChange={(e) => setNewProjTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="auth-field">
                  <label>Category</label>
                  <select
                    className="auth-input"
                    value={newProjCategory}
                    onChange={(e) => setNewProjCategory(e.target.value)}
                  >
                    <option value="Residential Architecture">Residential Architecture</option>
                    <option value="Luxury Interior Design">Luxury Interior Design</option>
                    <option value="Private Commission">Private Commission</option>
                    <option value="Spatial Heritage">Spatial Heritage</option>
                  </select>
                </div>
                <div className="auth-field uploader-full">
                  <label>Executive Summary</label>
                  <input
                    type="text"
                    className="auth-input"
                    placeholder="One-line overview for public or members"
                    value={newProjSummary}
                    onChange={(e) => setNewProjSummary(e.target.value)}
                  />
                </div>
                <div className="auth-field">
                  <label>Access Visibility</label>
                  <select
                    className="auth-input"
                    value={newProjVisibility}
                    onChange={(e) => setNewProjVisibility(e.target.value)}
                  >
                    <option value="elite">Elite Only (Private Vault)</option>
                    <option value="public">Public Showcase</option>
                  </select>
                </div>
                <div className="auth-field" style={{ alignSelf: 'flex-end' }}>
                  <button type="submit" className="auth-submit-btn" style={{ margin: 0 }}>
                    Save & Deploy Commission
                  </button>
                </div>
              </div>
            </form>
          )}

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Visibility</th>
                  <th>Status</th>
                  <th>Featured</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p) => (
                  <tr key={p.id}>
                    <td><strong>{p.title}</strong></td>
                    <td>{p.category}</td>
                    <td>
                      <span className={`admin-badge ${p.visibility === 'elite' ? 'admin-badge--elite' : 'admin-badge--public'}`}>
                        {p.visibility.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <span className={`admin-badge ${p.status === 'published' ? 'admin-badge--published' : 'admin-badge--draft'}`}>
                        {p.status.toUpperCase()}
                      </span>
                    </td>
                    <td>{p.is_featured ? '★ Yes' : 'No'}</td>
                    <td>{p.created_at ? new Date(p.created_at).toLocaleDateString() : '—'}</td>
                    <td>
                      <button
                        type="button"
                        className="admin-action-btn"
                        onClick={() => handleToggleVisibility(p)}
                        title="Toggle Public vs Elite access"
                      >
                        {p.visibility === 'elite' ? 'Make Public' : 'Make Elite'}
                      </button>
                      <button
                        type="button"
                        className="admin-action-btn"
                        onClick={() => handleToggleStatus(p)}
                        title="Toggle Publish status"
                      >
                        {p.status === 'published' ? 'Draft' : 'Publish'}
                      </button>
                      <button
                        type="button"
                        className="admin-action-btn"
                        onClick={() => handleToggleFeatured(p)}
                        title="Toggle Featured"
                      >
                        ★
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── COMPANIES TAB ───────────────────────────────────────── */}
      {activeTab === 'companies' && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Sort</th>
                <th>Name</th>
                <th>Industry</th>
                <th>Tagline</th>
                <th>Founded</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((c) => (
                <tr key={c.id}>
                  <td>{c.sort_order}</td>
                  <td><strong>{c.name}</strong></td>
                  <td>{c.industry}</td>
                  <td>{c.tagline}</td>
                  <td>{c.founded_year}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── TEAM TAB ────────────────────────────────────────────── */}
      {activeTab === 'team' && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Portrait</th>
                <th>Name</th>
                <th>Role Title</th>
                <th>Bio</th>
                <th>Expertise</th>
              </tr>
            </thead>
            <tbody>
              {team.map((t, idx) => (
                <tr key={t.id || idx}>
                  <td style={{ width: '64px' }}>
                    <div style={{ width: '48px', height: '60px', borderRadius: '2px', overflow: 'hidden', border: '1px solid var(--line-gold)' }}>
                      <img
                        src={t.photo_url || (idx === 0 ? '/media/team-waseem-saife.jpg' : idx === 1 ? '/media/team-zahra-khan.jpg' : '/media/team-tariq-ahmed.jpg')}
                        alt={t.full_name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  </td>
                  <td><strong>{t.full_name}</strong></td>
                  <td>{t.role_title}</td>
                  <td style={{ maxWidth: '360px', color: 'rgba(245,240,230,0.75)' }}>{t.bio}</td>
                  <td>{t.expertise?.join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── MEMBERS TAB (ELITE ALLOWLIST GOVERNANCE) ────────────── */}
      {activeTab === 'members' && (
        <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
          <form className="uploader-box" onSubmit={handleAddMember} style={{ marginBottom: '32px' }}>
            <h3>Authorize VIP Client (Elite Allowlist)</h3>
            <div className="uploader-grid">
              <div className="auth-field">
                <label>Email Address</label>
                <input
                  type="email"
                  className="auth-input"
                  placeholder="vip@clientdomain.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  required
                />
              </div>
              <div className="auth-field">
                <label>Assigned Role</label>
                <select
                  className="auth-input"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                >
                  <option value="elite">Elite Member (Private Archive Access)</option>
                  <option value="admin">Studio Administrator (Full Governance)</option>
                </select>
              </div>
              <div className="auth-field uploader-full">
                <label>Notes / VIP Affiliation</label>
                <input
                  type="text"
                  className="auth-input"
                  placeholder="e.g. Private Collector — London, Founding Resident"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                />
              </div>
              <button type="submit" className="auth-submit-btn" style={{ margin: 0 }}>
                Authorize & Send Access
              </button>
            </div>
          </form>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Affiliation / VIP Note</th>
                  <th>Date Authorized</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {allowlist.map((m) => (
                  <tr key={m.email}>
                    <td><strong>{m.email}</strong></td>
                    <td>
                      <span className={`admin-badge ${m.role === 'admin' ? 'admin-badge--public' : 'admin-badge--elite'}`}>
                        {m.role.toUpperCase()}
                      </span>
                    </td>
                    <td>{m.note || '—'}</td>
                    <td>{m.created_at ? new Date(m.created_at).toLocaleDateString() : '—'}</td>
                    <td>
                      <button
                        type="button"
                        className="admin-action-btn"
                        onClick={() => handleToggleMemberRole(m)}
                        title="Switch Role"
                      >
                        {m.role === 'admin' ? 'Set Elite' : 'Set Admin'}
                      </button>
                      <button
                        type="button"
                        className="admin-action-btn admin-action-btn--delete"
                        onClick={() => handleRemoveMember(m.email)}
                      >
                        Revoke
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── LOGS TAB ────────────────────────────────────────────── */}
      {activeTab === 'logs' && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Event</th>
                <th>IP Address</th>
                <th>User Agent / Metadata</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td>{new Date(log.created_at).toLocaleString()}</td>
                  <td>
                    <span className="admin-badge admin-badge--elite">
                      {log.event_type}
                    </span>
                  </td>
                  <td>{log.ip_address}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'rgba(245,240,230,0.7)' }}>
                    {typeof log.metadata === 'object' ? JSON.stringify(log.metadata) : String(log.metadata)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ROUTES
═══════════════════════════════════════════════════════════════ */
function renderRoute(path, { home, companies, teamMembers, onOpenProject }) {
  if (path === '/') return home;
  if (path === '/studio') return <StudioPage companies={companies} teamMembers={teamMembers} />;
  if (path === '/services') return <ServicesPage />;
  if (path === '/projects') return <ProjectsPage onOpenProject={onOpenProject} />;
  if (path === '/process') return <ProcessPage />;
  if (path === '/contact') return <ContactPage />;
  const service = matchPath('/services/:slug', path);
  if (service) return <ServiceDetailPage slug={service.slug} />;
  const project = matchPath('/projects/:id', path);
  if (project) return <ProjectDetailPage id={project.id} onOpenProject={onOpenProject} />;
  return <NotFoundPage />;
}

/* ═══════════════════════════════════════════════════════════════
   MAIN APP
═══════════════════════════════════════════════════════════════ */
export default function App() {
  const { path, hash, key: routeKey } = useRouter();
  const prevPath = useRef(path);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showIntro, setShowIntro] = useState(() => path === '/');
  const [navVisible, setNavVisible] = useState(false);

  // Supabase Data State
  const [companies, setCompanies] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);

  // Auth & Portal State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('ds_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [authModal, setAuthModal] = useState(null); // null | 'elite' | 'admin'
  const [elitePortalOpen, setElitePortalOpen] = useState(false);
  const [adminPortalOpen, setAdminPortalOpen] = useState(false);

  // Fetch initial Supabase data
  useEffect(() => {
    async function load() {
      try {
        const [c, t] = await Promise.all([getCompanies(), getTeamMembers()]);
        if (c && c.length > 0) setCompanies(c);
        if (t && t.length > 0) setTeamMembers(t);
      } catch (err) {
        console.warn('Using fallback data:', err);
      }
    }
    load();
  }, []);

  // Lenis + GSAP ticker
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    setLenis(lenis);
    const tick = (time) => lenis.raf(time * 1000);
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  // Route change: reset scroll before paint, then honour #hash targets once pins have measured
  useLayoutEffect(() => {
    if (prevPath.current !== path || !hash) scrollToTop();
    prevPath.current = path;
    const id = setTimeout(() => {
      ScrollTrigger.refresh();
      if (hash) scrollToElement(document.getElementById(decodeURIComponent(hash.slice(1))));
    }, 350);
    return () => clearTimeout(id);
  }, [path, hash, routeKey]);

  // Scroll-driven text reveals and image curtain unmasking
  useEffect(() => {
    const gsap = window.gsap;
    const ST = window.ScrollTrigger;
    if (!gsap || !ST) return;

    // 1. Text reveals on section titles and subtitles
    const titles = document.querySelectorAll(
      '.sec-title, .card-deck-tagline, .transformation-section__head h2, .studio__statement h2, .film__copy h2, .contact__header h2, .sec-sub, .card-deck-lead'
    );
    const triggers = [];

    titles.forEach((el) => {
      const tween = gsap.fromTo(
        el,
        { y: 35, opacity: 0, filter: 'blur(6px)' },
        {
          y: 0,
          opacity: 1,
          filter: 'blur(0px)',
          duration: 0.95,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            toggleActions: 'play none none none',
          },
        }
      );
      if (tween.scrollTrigger) triggers.push(tween.scrollTrigger);
    });

    // 2. Curtain image reveals and subtle parallax depth
    const mediaBoxes = document.querySelectorAll('.curtain-reveal');
    mediaBoxes.forEach((box) => {
      const tween = gsap.fromTo(
        box,
        { clipPath: 'inset(12% 0 12% 0)', opacity: 0.7, scale: 0.98 },
        {
          clipPath: 'inset(0% 0 0% 0)',
          opacity: 1,
          scale: 1,
          duration: 1.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: box,
            start: 'top 85%',
          },
        }
      );
      if (tween.scrollTrigger) triggers.push(tween.scrollTrigger);
    });

    return () => {
      triggers.forEach((t) => t.kill());
    };
  }, [companies, teamMembers, path]);

  const handleNavReady = useCallback(() => setNavVisible(true), []);

  const handleSignOut = () => {
    localStorage.removeItem('ds_user');
    setCurrentUser(null);
    setElitePortalOpen(false);
    setAdminPortalOpen(false);
  };

  return (
    <>
      {showIntro && <Loader />}
      {showIntro && <WhiteFade onComplete={() => setShowIntro(false)} />}

      <a className="skip-link" href="#main">Skip to content</a>

      <Nav
        visible={navVisible || path !== '/'}
        currentUser={currentUser}
        onOpenAuth={(m) => setAuthModal(m)}
        onOpenElite={() => setElitePortalOpen(true)}
        onOpenAdmin={() => setAdminPortalOpen(true)}
        onSignOut={handleSignOut}
      />

      <main id="main" key={path} tabIndex={-1}>
        {renderRoute(path, {
          home: (
            <>
              {/* Cinematic Scrub Hero */}
              <Hero onNavReady={handleNavReady} />

              {/* Registry Metrics */}
              <IndexStrip />

              {/* Pinned Materiality & Craft Studies Horizontal Section */}
              <MaterialityHorizontalSection />

              {/* Site reading — particle field fly-through */}
              <WaveField
                kicker="Site Reading"
                title={'The site speaks\nbefore we draw.'}
                text="Every commission starts as a field of measured points — orientation, levels, the path of light. We read the site until its constraints become the plan."
                meta={[
                  ['Field', '15 × 15 datum grid'],
                  ['Reading', 'Levels · Light · Lines of sight'],
                ]}
                linkTo="/process"
                linkLabel="How a site becomes a plan"
              />

              {/* Studio services */}
              <ServicesIndex
                roman="Services"
                sub="Each discipline is handled by the same team, from first survey to the last shutter fitted."
              />

              {/* Section I: Companies */}
              <CompaniesSection companies={companies.length ? companies : DEFAULT_COMPANIES} />

              {/* Section II: Team */}
              <TeamSection teamMembers={teamMembers} />

              {/* Section III: Projects (Parallax Deck + Grid) */}
              <ParallaxProjectDeck onSelectProject={setSelectedProject} />
              <ProjectsGrid onSelectProject={setSelectedProject} />

              {/* Spatial Genesis Video Study */}
              <TransformationSection />

              {/* Section IV: Elite Invitation */}
              <EliteInvitationSection
                onOpenAuth={(m) => setAuthModal(m)}
                currentUser={currentUser}
                onOpenElite={() => setElitePortalOpen(true)}
              />

              {/* Studio & Craft Philosophy */}
              <Studio />

              {/* Interior Film */}
              <FilmSection />

              {/* Inquiries */}
              <ContactSection />
            </>
          ),
          companies,
          teamMembers,
          onOpenProject: setSelectedProject,
        })}
      </main>

      <Footer />

      {/* 3D Presentation Modal */}
      <ProjectPresentation
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />

      {/* Authentication Modal */}
      {authModal && (
        <AuthModal
          mode={authModal}
          onClose={() => setAuthModal(null)}
          onAuthSuccess={(u) => {
            setCurrentUser(u);
            if (u.role === 'admin') setAdminPortalOpen(true);
            else setElitePortalOpen(true);
          }}
        />
      )}

      {/* Elite Member Portal */}
      {elitePortalOpen && currentUser && (
        <ElitePortalModal
          user={currentUser}
          onClose={() => setElitePortalOpen(false)}
          onOpenAdmin={() => { setElitePortalOpen(false); setAdminPortalOpen(true); }}
        />
      )}

      {/* Administration Portal */}
      {adminPortalOpen && currentUser?.role === 'admin' && (
        <AdminDashboardModal
          user={currentUser}
          onClose={() => setAdminPortalOpen(false)}
          onOpenElite={() => { setAdminPortalOpen(false); setElitePortalOpen(true); }}
        />
      )}
    </>
  );
}
