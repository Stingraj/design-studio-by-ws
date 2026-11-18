import React, {
  Suspense, lazy, useEffect, useLayoutEffect, useRef, useState, useCallback, useMemo
} from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import Lenis from 'lenis';
import { gsap, ScrollTrigger } from './lib/gsap';
import { matchPath, useRouter } from './lib/router';
import { setLenis, scrollToTop, scrollToElement } from './lib/scroll';
import { PROJECTS } from './data/projects';
import Nav from './components/layout/Nav';
import Footer from './components/layout/Footer';
import TeamSection from './sections/TeamSection';
import ContactSection from './sections/ContactSection';
import ServicesIndex from './sections/ServicesIndex';
import { HomeHero, StudioStatement, SelectedWorks, FilmSection } from './sections/home/HomeSections';
import { EliteInvitationSection, AuthModal, ElitePortalModal } from './sections/portal/PortalModals';

/* Home ships in the main bundle; every other route and the heavy overlays are
   fetched on demand, so the first visit only downloads what the home page needs. */
const StudioDashboard = lazy(() => import('./sections/portal/StudioDashboard'));
const ProjectPresentation = lazy(() => import('./sections/ProjectPresentation'));
const StudioPage = lazy(() => import('./pages/StudioPage'));
const ServicesPage = lazy(() => import('./pages/ServicesPage'));
const ServiceDetailPage = lazy(() => import('./pages/ServiceDetailPage'));
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'));
const ProjectDetailPage = lazy(() => import('./pages/ProjectDetailPage'));
const ProcessPage = lazy(() => import('./pages/ProcessPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const FilmsPage = lazy(() => import('./pages/FilmsPage'));
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

function renderRoute(path, { home, companies, teamMembers, onOpenProject }) {
  if (path === '/') return home;
  if (path === '/studio') return <StudioPage companies={companies} teamMembers={teamMembers} />;
  if (path === '/services') return <ServicesPage />;
  if (path === '/projects') return <ProjectsPage onOpenProject={onOpenProject} />;
  if (path === '/process') return <ProcessPage />;
  if (path === '/films') return <FilmsPage />;
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
  // Keep the presentation mounted after first use so its exit animation still plays.
  const presentationMounted = useRef(false);
  if (selectedProject) presentationMounted.current = true;
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

  // Scroll-driven text reveals and image curtain unmasking (skipped for reduced motion:
  // content is simply shown, which also keeps text at full contrast from the first frame)
  useEffect(() => {
    const gsap = window.gsap;
    const ST = window.ScrollTrigger;
    if (!gsap || !ST || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

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

    // 2. Smooth image reveals without clipping distortion
    const mediaBoxes = document.querySelectorAll('.curtain-reveal');
    mediaBoxes.forEach((box) => {
      const tween = gsap.fromTo(
        box,
        { opacity: 0.85, scale: 0.99 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.85,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: box,
            start: 'top 88%',
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
        <Suspense fallback={<div className="route-loading" aria-busy="true" />}>
        {renderRoute(path, {
          home: (
            <>
              <HomeHero onNavReady={handleNavReady} />
              <StudioStatement />
              <SelectedWorks />

              <FilmSection />

              <ServicesIndex
                roman="03 — Services"
                sub="Each discipline is handled by the same team, from first survey to the last shutter fitted."
              />

              <TeamSection teamMembers={teamMembers} />

              <EliteInvitationSection
                onOpenAuth={(m) => setAuthModal(m)}
                currentUser={currentUser}
                onOpenElite={() => setElitePortalOpen(true)}
              />

              {/* Inquiries */}
              <ContactSection />
            </>
          ),
          companies,
          teamMembers,
          onOpenProject: setSelectedProject,
        })}
        </Suspense>
      </main>

      <Footer />

      {/* 3D Presentation Modal */}
      {(selectedProject || presentationMounted.current) && (
        <Suspense fallback={null}>
          <ProjectPresentation
            project={selectedProject}
            onClose={() => setSelectedProject(null)}
          />
        </Suspense>
      )}

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
        <Suspense fallback={null}>
          <StudioDashboard
            user={currentUser}
            onClose={() => setAdminPortalOpen(false)}
            onOpenElite={() => { setAdminPortalOpen(false); setElitePortalOpen(true); }}
          />
        </Suspense>
      )}
    </>
  );
}
