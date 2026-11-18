import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useDocumentMeta } from '../lib/router';
import { gsap, prefersReducedMotion } from '../lib/gsap';
import { PROJECTS, getProject, roomChapters } from '../data/projects';
import { SERVICES } from '../data/services';
import CtaBand from '../components/layout/CtaBand';
import RenderImage from '../components/media/RenderImage';
import Lightbox from '../components/media/Lightbox';
import FilmStage from '../components/media/FilmStage';
import { FILM_CHAPTERS, chapterIndexForProject, fmtTime } from '../data/film';
import NotFoundPage from './NotFoundPage';

const pad = (n) => String(n).padStart(2, '0');
const shortName = (p) => p.title.split(' ')[0];

function RoomChapter({ project, room, number, onOpen }) {
  const [lead, ...rest] = room.frames;
  return (
    <section className="room" aria-labelledby={`room-${room.slide}`}>
      <button type="button" className="room__lead" onClick={() => onOpen(lead.slide)} aria-label={`View ${lead.caption} full screen`}>
        <RenderImage project={project} slide={lead.slide} alt={`${lead.caption}, ${shortName(project)}`} />
      </button>
      <div className="room__text">
        <span className="room__index">{pad(number)} — {room.name}</span>
        <h3 id={`room-${room.slide}`} className="room__title">{room.desc}</h3>
      </div>
      {rest.length > 0 && (
        <ul className={`room__frames room__frames--${Math.min(rest.length, 3)}`}>
          {rest.map((f) => (
            <li key={f.slide}>
              <button type="button" onClick={() => onOpen(f.slide)} aria-label={`View ${f.caption} full screen`}>
                <RenderImage project={project} slide={f.slide} alt={`${f.caption}, ${shortName(project)}`} sizes="(max-width: 768px) 100vw, 40vw" />
              </button>
              <span>{f.caption}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default function ProjectDetailPage({ id, onOpenProject }) {
  const project = getProject(id);
  useDocumentMeta(project?.title ?? 'Project not found', project ? `${project.title} — ${project.rooms[0].desc}` : undefined);
  const root = useRef(null);
  const [viewer, setViewer] = useState(null);

  const chapters = useMemo(() => (project ? roomChapters(project) : []), [project]);
  const frames = useMemo(() => chapters.flatMap((r) => r.frames), [chapters]);

  useEffect(() => {
    if (!project || prefersReducedMotion()) return undefined;
    const ctx = gsap.context(() => {
      gsap.from('.pd-cover__media', { clipPath: 'inset(10% 6% 10% 6%)', duration: 1.6, ease: 'expo.out' });
      gsap.from('.pd-cover__title > span', { yPercent: 110, duration: 1.3, ease: 'expo.out', delay: 0.2 });
      gsap.utils.toArray('.room').forEach((el) => {
        gsap.from(el.querySelector('.room__lead img'), {
          scale: 1.08, ease: 'none',
          scrollTrigger: { trigger: el, start: 'top bottom', end: 'top 20%', scrub: true },
        });
        gsap.from(el.querySelectorAll('.room__text > *, .room__frames li'), {
          opacity: 0, y: 24, duration: 1, ease: 'power3.out', stagger: 0.08,
          scrollTrigger: { trigger: el.querySelector('.room__text'), start: 'top 85%' },
        });
      });
    }, root);
    return () => ctx.revert();
  }, [project]);

  if (!project) return <NotFoundPage />;

  const next = PROJECTS[(PROJECTS.indexOf(project) + 1) % PROJECTS.length];
  const services = SERVICES.filter((s) => s.projects.includes(project.id));
  const open = (slide) => setViewer(frames.findIndex((f) => f.slide === slide));

  return (
    <div ref={root} className="pd" style={{ '--accent': project.accent }}>
      <header className="pd-cover">
        <div className="pd-cover__media">
          <RenderImage project={project} slide={project.coverSlide} eager alt={`${project.renders[0][1]}, ${project.title}, Hyderabad`} />
        </div>
        <div className="pd-cover__copy">
          <span className="pd-kicker">Project {project.id} — {project.subtitle}</span>
          <h1 className="pd-cover__title"><span>{project.title}</span></h1>
        </div>
      </header>

      <section className="pd-intro">
        <p className="pd-intro__lead">{project.rooms[0].desc}</p>
        <dl className="pd-facts">
          <div><dt>Client</dt><dd>{project.client}</dd></div>
          <div><dt>Location</dt><dd>{project.location}</dd></div>
          <div><dt>Typology</dt><dd>3BHK apartment interior</dd></div>
          <div><dt>Year</dt><dd>{project.year}</dd></div>
          <div><dt>Scope</dt><dd>{chapters.length} rooms · {frames.length} renders</dd></div>
          <div>
            <dt>Presentation</dt>
            <dd>
              <button type="button" className="text-link" onClick={() => onOpenProject(project)}>
                Open all {project.slideCount} slides <span aria-hidden="true">→</span>
              </button>
            </dd>
          </div>
        </dl>
      </section>

      {chapterIndexForProject(project.id) >= 0 && (
        <section className="pd-film" aria-labelledby="pd-film-title">
          <div className="pd-film__head">
            <h2 id="pd-film-title">Walk through {project.title.split(' ')[0]}</h2>
            <span className="pd-kicker">The film · {fmtTime(FILM_CHAPTERS[chapterIndexForProject(project.id)].duration)} · no sound</span>
          </div>
          <FilmStage chapters={[chapterIndexForProject(project.id)]} title={`The film — ${project.title.split(' ')[0]}`} />
        </section>
      )}

      <div className="pd-rooms">
        {chapters.map((room, i) => (
          <RoomChapter key={room.slide} project={project} room={room} number={i + 1} onOpen={open} />
        ))}
      </div>

      {services.length > 0 && (
        <section className="pd-services" aria-label="Services on this project">
          <span className="pd-kicker">Services on this project</span>
          <ul>
            {services.map((s) => (
              <li key={s.slug}><Link to={`/services/${s.slug}`} className="text-link">{s.title}</Link></li>
            ))}
          </ul>
        </section>
      )}

      {next.id !== project.id && (
        <nav className="pd-next" aria-label="Next project">
          <Link to={`/projects/${next.id}`} className="pd-next__link" data-cursor="explore">
            <RenderImage project={next} slide={next.coverSlide} alt="" className="pd-next__media" />
            <span className="pd-next__copy">
              <span className="pd-kicker">Next project — {next.id}</span>
              <strong>{next.title}</strong>
            </span>
          </Link>
        </nav>
      )}

      <CtaBand title="Begin a home like this one." to="/contact?type=interior" />

      {viewer != null && viewer >= 0 && (
        <Lightbox project={project} frames={frames} index={viewer} onIndex={setViewer} onClose={() => setViewer(null)} />
      )}
    </div>
  );
}
