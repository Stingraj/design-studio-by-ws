import React from 'react';
import { Link, useDocumentMeta } from '../lib/router';
import { SERVICES } from '../data/services';
import PageHero from '../components/layout/PageHero';
import CtaBand from '../components/layout/CtaBand';
import StackedPanels from '../components/animations/StackedPanels';
import { WHAT_WE_DO, fmtTime } from '../data/film';

function ServicePanel(s) {
  return (
    <div className="service-panel">
      <div className="service-panel__copy">
        <span className="service-panel__num">{s.num}</span>
        <h2 className="service-panel__title">{s.title}</h2>
        <p className="service-panel__tagline">{s.tagline}</p>
        <ul className="service-panel__scope">
          {s.scope.map((item) => <li key={item}>{item}</li>)}
        </ul>
        <Link to={`/services/${s.slug}`} className="text-link" data-cursor="explore">
          Explore {s.title}
          <span aria-hidden="true"> →</span>
        </Link>
      </div>
      <figure className="service-panel__media">
        <img src={s.hero} alt={s.heroAlt} loading="lazy" decoding="async" />
        {s.venture && <figcaption>Built by {s.venture}</figcaption>}
      </figure>
    </div>
  );
}

export default function ServicesPage() {
  useDocumentMeta('Services', 'Residential architecture, interior architecture, bespoke joinery, 3D visualisation and hospitality interiors by Design Studio by WS.');

  return (
    <>
      <PageHero
        kicker="Services"
        title="Five disciplines, one studio."
        lead="From the first site reading to the last shutter fitted, each service is handled by the same team — so the plan, the interior and the joinery never drift apart."
        meta={SERVICES.map((s) => [s.num, s.title])}
      />
      {WHAT_WE_DO && (
        <p className="services-film">
          <Link to="/films#what-we-do" className="text-link" data-cursor="play">
            <span aria-hidden="true">▶ </span>Watch What we do <span className="services-film__len">{fmtTime(WHAT_WE_DO.duration)}</span>
          </Link>
        </p>
      )}
      <StackedPanels items={SERVICES} renderPanel={ServicePanel} label="Studio services" />
      <CtaBand
        title="Not sure where your project begins?"
        text="Most commissions combine two or three services. Tell us about the space and we will propose the right scope."
      />
    </>
  );
}
