import React from 'react';
import { Link, useDocumentMeta } from '../lib/router';
import { SERVICES, getService } from '../data/services';
import { getProject, slideSrc } from '../data/projects';
import PageHero from '../components/layout/PageHero';
import CtaBand from '../components/layout/CtaBand';
import BentoFlipGallery from '../components/animations/BentoFlipGallery';
import HorizontalGalleryStrip from '../components/animations/HorizontalGalleryStrip';
import FilmStage from '../components/media/FilmStage';
import { WHAT_WE_DO, fmtTime } from '../data/film';
import NotFoundPage from './NotFoundPage';


export default function ServiceDetailPage({ slug }) {
  const service = getService(slug);
  useDocumentMeta(service?.title ?? 'Service not found', service?.tagline);
  if (!service) return <NotFoundPage />;

  const index = SERVICES.indexOf(service);
  const next = SERVICES[(index + 1) % SERVICES.length];
  const related = service.projects.map(getProject).filter(Boolean);
  const Gallery = service.gallery?.variant === 'bento' ? BentoFlipGallery : HorizontalGalleryStrip;

  return (
    <>
      <PageHero
        kicker={`Service ${service.num}`}
        title={service.title}
        lead={service.tagline}
        meta={[['Deliverables', service.deliverables.join(' · ')], ...(service.venture ? [['Built by', service.venture]] : [])]}
        image={service.hero}
        imageAlt={service.heroAlt}
      />

      <section className="service-brief">
        <div className="service-brief__intro">
          <span className="sec-roman">Overview</span>
          {service.intro.map((p) => <p key={p.slice(0, 24)}>{p}</p>)}
        </div>
        <div className="service-brief__scope">
          <span className="kicker">Scope</span>
          <ol>
            {service.scope.map((item, i) => (
              <li key={item}><span>{String(i + 1).padStart(2, '0')}</span>{item}</li>
            ))}
          </ol>
        </div>
      </section>

      <section className="service-approach">
        <div className="sec-rule" />
        <div className="sec-head">
          <span className="sec-roman">Approach</span>
          <h2 className="sec-title">How it is done.</h2>
        </div>
        <ol className="service-approach__list">
          {service.approach.map((a, i) => (
            <li key={a.title}>
              <span className="service-approach__num">{String(i + 1).padStart(2, '0')}</span>
              <h3>{a.title}</h3>
              <p>{a.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {service.gallery && (
        <section className="service-gallery">
          <div className="sec-head">
            <span className="sec-roman">Selected work</span>
            <h2 className="sec-title">{service.gallery.variant === 'bento' ? 'Built to the millimetre.' : 'In the studio’s work.'}</h2>
          </div>
          <Gallery images={service.gallery.images} label={`${service.title} gallery`} />
        </section>
      )}

      {service.sequence && WHAT_WE_DO && (() => {
        // The 3D Visualisation chapter of "What we do": a still render from a real
        // commission holds, then the same view starts to move.
        const ch = WHAT_WE_DO.rooms.find((r) => r.slug === '3d-visualisation');
        return (
          <section className="service-sequence service-film" aria-labelledby="service-film-title">
            <div className="sec-head sec-head--dark">
              <span className="sec-roman">Render to walk-through</span>
              <h2 id="service-film-title" className="sec-title">See the room before it is built.</h2>
              <p className="sec-sub">A still render from a real commission, then the same view in motion. From the studio’s film, What we do.</p>
            </div>
            <FilmStage
              items={[WHAT_WE_DO]}
              startTime={ch ? ch.t : 0}
              poster="/media/film/whatwedo-poster"
              title="Play the 3D Visualisation chapter"
              meta={`${fmtTime(WHAT_WE_DO.duration - (ch ? ch.t : 0))} · no sound`}
            />
          </section>
        );
      })()}

      {related.length > 0 && (
        <section className="related-projects">
          <div className="sec-head">
            <span className="sec-roman">Projects</span>
            <h2 className="sec-title">Where this service was used.</h2>
          </div>
          <div className="related-projects__grid">
            {related.map((p) => (
              <Link key={p.id} to={`/projects/${p.id}`} className="related-project" data-cursor="explore">
                <span className="related-project__media">
                  <img src={slideSrc(p, p.coverSlide)} alt="" loading="lazy" decoding="async" />
                </span>
                <span className="related-project__meta">
                  <span>{p.id} · {p.subtitle}</span>
                  <strong>{p.title}</strong>
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <nav className="service-next" aria-label="Next service">
        <Link to={`/services/${next.slug}`} className="service-next__link" data-cursor="explore">
          <span className="kicker">Next service · {next.num}</span>
          <strong>{next.title}</strong>
          <span className="service-next__short">{next.short}</span>
        </Link>
      </nav>

      <CtaBand
        title={`Commission ${service.title.toLowerCase()}.`}
        text="Share the site, the brief and the timeline. We reply to every inquiry within two working days."
        to={`/contact?type=${service.inquiry}`}
      />
    </>
  );
}
