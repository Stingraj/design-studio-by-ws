import React, { useEffect, useRef } from 'react';
import { Link } from '../../lib/router';
import { gsap, ScrollTrigger, prefersReducedMotion } from '../../lib/gsap';
import { PROJECTS } from '../../data/projects';
import RenderImage from '../../components/media/RenderImage';
import CinemaVideo from '../../components/media/CinemaVideo';
import FilmStage from '../../components/media/FilmStage';
import { FILM_DURATION, HERO_LOOP, fmtTime } from '../../data/film';

/* ── 1. Hero ─────────────────────────────────────────────────────────────
   A 7-second seamless loop from the film (F-1002, through the fluted glass into
   the dining room). Its poster is the loop's own first frame, so the still is the
   LCP image and the motion takes over without a visible cut. */
export function HomeHero({ onNavReady }) {
  const root = useRef(null);

  useEffect(() => {
    onNavReady?.();
    if (prefersReducedMotion()) return undefined;
    const ctx = gsap.context(() => {
      gsap.from('.home-hero__media', { clipPath: 'inset(12% 8% 12% 8%)', duration: 1.8, ease: 'expo.out' });
      gsap.from('.home-hero__line > span', { yPercent: 110, duration: 1.4, ease: 'expo.out', stagger: 0.12, delay: 0.35 });
      gsap.from('.home-hero__meta', { opacity: 0, duration: 1, delay: 1.1 });
      gsap.to('.home-hero__media .cinema', {
        yPercent: 8, ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
      });
    }, root);
    return () => ctx.revert();
  }, [onNavReady]);

  return (
    <section ref={root} className="home-hero" aria-labelledby="home-hero-title">
      <div className="home-hero__media">
        <CinemaVideo
          src={HERO_LOOP.src}
          poster={HERO_LOOP.poster}
          eager
          toggle
          alt="Through the fluted glass partition into the dining room of residence F-1002, Hyderabad"
        />
      </div>
      <div className="home-hero__copy">
        <h1 id="home-hero-title" className="home-hero__title">
          <span className="home-hero__line"><span>Design Studio</span></span>
          <span className="home-hero__line"><span>by WS</span></span>
        </h1>
        <dl className="home-hero__meta">
          <div><dt>Practice</dt><dd>Architecture · Interiors · Joinery</dd></div>
          <div><dt>Studio</dt><dd>Hyderabad</dd></div>
          <div><dt>Plate</dt><dd>F-1002 · Fluted glass threshold</dd></div>
        </dl>
      </div>
    </section>
  );
}

/* ── 2. Studio statement ───────────────────────────────────────────────── */
export function StudioStatement() {
  return (
    <section className="home-statement" aria-label="Studio statement">
      <span className="home-kicker">00 — Studio</span>
      <p className="home-statement__text">
        Homes planned from the site outward, detailed to the millimetre and built with our own joinery atelier.
        Every room grows from one family of materials, and nothing is added that does not earn its place.
      </p>
      <Link to="/studio" className="text-link">About the studio <span aria-hidden="true">→</span></Link>
    </section>
  );
}

/* ── 3. Selected works — one full-bleed chapter per real client project ── */
function ProjectChapter({ project, index }) {
  const ref = useRef(null);
  const rooms = project.renders.slice(0, 4);

  useEffect(() => {
    if (prefersReducedMotion()) return undefined;
    const ctx = gsap.context(() => {
      gsap.from('.work__cover', {
        clipPath: 'inset(0 0 100% 0)', ease: 'none',
        scrollTrigger: { trigger: ref.current, start: 'top 85%', end: 'top 25%', scrub: true },
      });
      gsap.from('.work__rooms li', {
        opacity: 0, y: 24, stagger: 0.08, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: '.work__rooms', start: 'top 85%' },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <article ref={ref} className="work" style={{ '--accent': project.accent }}>
      <Link to={`/projects/${project.id}`} className="work__cover" aria-label={`Open ${project.title}`} data-cursor="explore">
        <RenderImage project={project} slide={project.coverSlide} alt={`${project.renders[0][1]}, residence ${project.title.split(' ')[0]}, Hyderabad`} />
      </Link>
      <header className="work__head">
        <span className="work__index">{String(index + 1).padStart(2, '0')}</span>
        <h3 className="work__title"><Link to={`/projects/${project.id}`}>{project.title}</Link></h3>
        <dl className="work__facts">
          <div><dt>Client</dt><dd>{project.client}</dd></div>
          <div><dt>Location</dt><dd>{project.location}</dd></div>
          <div><dt>Year</dt><dd>{project.year}</dd></div>
        </dl>
      </header>
      <ol className="work__rooms" aria-label={`${project.title} rooms`}>
        {rooms.map(([slide, name]) => (
          <li key={slide}>
            <Link to={`/projects/${project.id}`}>
              <RenderImage project={project} slide={slide} alt={`${name}, ${project.title.split(' ')[0]}`} sizes="(max-width: 768px) 50vw, 25vw" />
              <span>{name}</span>
            </Link>
          </li>
        ))}
      </ol>
    </article>
  );
}

export function SelectedWorks() {
  useEffect(() => () => ScrollTrigger.refresh(), []);
  return (
    <section className="home-works" aria-labelledby="home-works-title">
      <div className="home-works__head">
        <span className="home-kicker">01 — Selected works</span>
        <h2 id="home-works-title" className="home-works__title">Two residences, Hyderabad.</h2>
      </div>
      {PROJECTS.map((p, i) => <ProjectChapter key={p.id} project={p} index={i} />)}
    </section>
  );
}

/* ── 4. The film ───────────────────────────────────────────────────────── */
export function FilmSection() {
  return (
    <section className="home-film" aria-labelledby="home-film-title">
      <div className="home-film__head">
        <span className="home-kicker">02 — The film</span>
        <h2 id="home-film-title" className="home-film__title">Two residences, <em>five minutes.</em></h2>
        <p className="home-film__lead">
          A slow walk through F-204 and F-1002, room by room, made from the studio's renders of both homes.
          <Link to="/films" className="text-link home-film__more">All films, including What we do <span aria-hidden="true">→</span></Link>
        </p>
      </div>
      <FilmStage title="Watch the film" meta={`${fmtTime(FILM_DURATION)} · two chapters · no sound`} poster="/media/film/f1002-poster">
        {(open, list) => (
          <ol className="film-chapters" aria-label="Chapters">
            {list.map((c, i) => (
              <li key={c.key}>
                <button type="button" onClick={() => open(i)}>
                  <span className="film-chapters__num">{String(i + 1).padStart(2, '0')}</span>
                  <strong>{c.title}<small>Residence of {c.client}</small></strong>
                  <span className="film-chapters__len">{fmtTime(c.duration)}</span>
                </button>
              </li>
            ))}
          </ol>
        )}
      </FilmStage>
    </section>
  );
}
