import React from 'react';
import { Link } from '../../lib/router';

export default function CtaBand({ kicker = 'Commissions', title, text, to = '/contact', label = 'Begin a project' }) {
  return (
    <section className="cta-band">
      <div className="cta-band__inner">
        <span className="kicker">{kicker}</span>
        <h2 className="cta-band__title">{title}</h2>
        {text && <p className="cta-band__text">{text}</p>}
        <Link to={to} className="cta-band__link" data-cursor="explore">
          <span>{label}</span>
          <svg width="20" height="14" viewBox="0 0 20 14" fill="none" aria-hidden="true">
            <path d="M1 7h18M13 1l6 6-6 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>
    </section>
  );
}
