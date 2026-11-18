import React from 'react';
import { Link, useDocumentMeta } from '../lib/router';
import { NAV_LINKS } from '../data/site';

export default function NotFoundPage() {
  useDocumentMeta('Page not found');
  return (
    <section className="not-found">
      <span className="sec-roman">404</span>
      <h1 className="not-found__title">This room has not been drawn yet.</h1>
      <p className="sec-sub">The page you are looking for does not exist or has moved.</p>
      <ul className="not-found__links">
        <li><Link to="/" className="text-link">Home</Link></li>
        {NAV_LINKS.map((l) => <li key={l.to}><Link to={l.to} className="text-link">{l.label}</Link></li>)}
      </ul>
    </section>
  );
}
