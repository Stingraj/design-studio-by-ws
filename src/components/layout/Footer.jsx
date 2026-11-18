import React from 'react';
import { Link } from '../../lib/router';
import { NAV_LINKS, STUDIO_CITY, STUDIO_EMAIL } from '../../data/site';
import { SERVICES } from '../../data/services';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer" id="footer">
      <p className="footer__wordmark" aria-hidden="true">Design Studio <em>by WS</em></p>

      <div className="footer__grid">
        <div className="footer__col">
          <p className="footer__brand">Design Studio by WS</p>
          <p className="footer__sub">Architecture · Interiors · Spatial Design</p>
          <span className="footer__label footer__label--gap">Studio</span>
          <strong>{STUDIO_CITY}</strong>
          <a href={`mailto:${STUDIO_EMAIL}`}>{STUDIO_EMAIL}</a>
        </div>
        <nav className="footer__col" aria-label="Footer pages">
          <span className="footer__label">Pages</span>
          {NAV_LINKS.map((l) => (
            <Link key={l.to} to={l.to}>{l.label}</Link>
          ))}
        </nav>
        <nav className="footer__col" aria-label="Footer services">
          <span className="footer__label">Services</span>
          {SERVICES.map((s) => (
            <Link key={s.slug} to={`/services/${s.slug}`}>{s.title}</Link>
          ))}
        </nav>
        <div className="footer__col">
          <span className="footer__label">Ventures</span>
          <Link to="/studio#companies">Design Studio by WS</Link>
          <Link to="/services/bespoke-joinery">WS Atelier Joinery</Link>
          <Link to="/studio#companies">WS Capital Estates</Link>
          <span className="footer__label footer__label--gap">Commissions</span>
          <Link to="/contact">Begin a project</Link>
        </div>
      </div>

      <div className="footer__bottom">
        <span>© {year} Design Studio by WS</span>
        <span>All rights reserved</span>
      </div>
    </footer>
  );
}
