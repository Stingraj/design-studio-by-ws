import React from 'react';
import { Link } from '../lib/router';
import { SERVICES } from '../data/services';

export default function ServicesIndex({ roman = 'Services', title = 'Five disciplines, one studio.', sub }) {
  return (
    <section className="services-index" id="services">
      <div className="sec-rule" />
      <div className="sec-head">
        <span className="sec-roman">{roman}</span>
        <h2 className="sec-title">{title}</h2>
        {sub && <p className="sec-sub">{sub}</p>}
      </div>
      <ol className="services-index__list">
        {SERVICES.map((s) => (
          <li key={s.slug}>
            <Link to={`/services/${s.slug}`} className="services-index__row" data-cursor="explore">
              <span className="services-index__num">{s.num}</span>
              <strong className="services-index__title">{s.title}</strong>
              <span className="services-index__short">{s.short}</span>
              <span className="services-index__thumb" aria-hidden="true">
                <img src={s.hero} alt="" loading="lazy" decoding="async" />
              </span>
              <svg className="services-index__arrow" width="22" height="14" viewBox="0 0 20 14" fill="none" aria-hidden="true">
                <path d="M1 7h18M13 1l6 6-6 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
