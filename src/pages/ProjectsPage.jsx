import React from 'react';
import { Link, useDocumentMeta } from '../lib/router';
import { PROJECTS, slideSrc } from '../data/projects';
import PageHero from '../components/layout/PageHero';
import CtaBand from '../components/layout/CtaBand';
import VelocityImage from '../components/animations/VelocityImage';

export default function ProjectsPage({ onOpenProject }) {
  useDocumentMeta('Projects', 'Residential commissions by Design Studio by WS, presented room by room as complete 3D presentations.');

  return (
    <>
      <PageHero
        kicker="Projects"
        title="Homes, room by room."
        lead="Each commission is documented as a complete 3D presentation — a floor plan key, then every room with its finishes, lighting and joinery in place."
        meta={[['Commissions', String(PROJECTS.length).padStart(2, '0')], ['Rooms presented', String(PROJECTS.reduce((n, p) => n + p.rooms.length, 0))], ['City', 'Hyderabad']]}
      />

      <section className="project-index">
        {PROJECTS.map((p, i) => (
          <article className={`project-index__item${i % 2 ? ' project-index__item--flip' : ''}`} key={p.id}>
            <Link to={`/projects/${p.id}`} className="project-index__media" aria-label={`View ${p.title}`} data-cursor="explore">
              <VelocityImage src={slideSrc(p, p.coverSlide)} alt={`${p.title} — ${p.rooms[1]?.name ?? 'living room'}`} />
            </Link>
            <div className="project-index__copy">
              <span className="project-index__num">{p.id}</span>
              <span className="kicker">{p.subtitle} · {p.year}</span>
              <h2 className="project-index__title">
                <Link to={`/projects/${p.id}`}>{p.title}</Link>
              </h2>
              <p>{p.rooms[0].desc}</p>
              <ul className="project-index__rooms">
                {p.rooms.slice(1).map((r) => <li key={r.slide}>{r.name}</li>)}
              </ul>
              <div className="project-index__actions">
                <Link to={`/projects/${p.id}`} className="text-link" data-cursor="explore">Read the project <span aria-hidden="true">→</span></Link>
                <button type="button" className="text-link text-link--muted" onClick={() => onOpenProject(p)}>
                  Open presentation · {p.slideCount} slides
                </button>
              </div>
            </div>
          </article>
        ))}
      </section>

      <CtaBand
        title="Your home could be the next presentation."
        text="We are accepting residential commissions for 2027."
      />
    </>
  );
}
