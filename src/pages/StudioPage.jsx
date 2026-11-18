import React from 'react';
import { useDocumentMeta } from '../lib/router';
import PageHero from '../components/layout/PageHero';
import CtaBand from '../components/layout/CtaBand';
import HorizontalSplitText from '../components/animations/HorizontalSplitText';
import MorphMonogram from '../components/animations/MorphMonogram';
import CompaniesSection from '../sections/CompaniesSection';
import TeamSection from '../sections/TeamSection';
import { DEFAULT_COMPANIES } from '../data/site';

const MONOGRAM = [
  { letter: 'A', word: 'Architecture', name: 'Design Studio by WS' },
  { letter: 'B', word: 'Bespoke', name: 'WS Atelier Joinery' },
  { letter: 'C', word: 'Capital', name: 'WS Capital Estates' },
];

const PRINCIPLES = [
  ['01', 'Site-led planning', 'Orientation, daylight and approach are read before a single room is drawn.'],
  ['02', 'Interior discipline', 'Ceilings, walls, light and joinery are designed as one continuous system.'],
  ['03', 'Material restraint', 'One palette of stone, timber, glass, metal and fabric carried through the home.'],
  ['04', 'Precise delivery', 'Working drawings and shop drawings to the millimetre, supervised on site.'],
];

export default function StudioPage({ companies, teamMembers }) {
  useDocumentMeta('Studio', 'Design Studio by WS — an architecture and interior practice in Hyderabad, with its joinery atelier and development holdings.');

  return (
    <>
      <PageHero
        kicker="The Studio"
        title="Measured before it is decorative."
        lead="Design Studio by WS is an architecture and interior practice in Hyderabad. Homes are planned from the site outward, detailed to the millimetre and built with our own joinery atelier."
        meta={[['Founded', '2020'], ['Studio', 'Hyderabad'], ['Practice', 'Architecture · Interiors · Joinery']]}
      />

      <HorizontalSplitText
        kicker="Studio position"
        text="Proportion first. Light as structure. One palette. Nothing without a reason."
      />

      <section className="studio-practice">
        <div className="studio-practice__copy">
          <span className="sec-roman">Practice</span>
          <h2 className="sec-title">One discipline,<br />three houses.</h2>
          <p className="sec-sub">
            The studio designs. The atelier builds what the studio draws. The estates arm brings the same standard to
            development and advisory. Each letter grows from the one before it.
          </p>
          <ul className="studio-practice__principles">
            {PRINCIPLES.map(([n, t, d]) => (
              <li key={n}>
                <span>{n}</span>
                <strong>{t}</strong>
                <p>{d}</p>
              </li>
            ))}
          </ul>
        </div>
        <MorphMonogram labels={MONOGRAM} />
      </section>

      <CompaniesSection companies={companies?.length ? companies : DEFAULT_COMPANIES} />
      <TeamSection teamMembers={teamMembers} />

      <CtaBand
        kicker="How we work"
        title="Five phases, from survey to handover."
        text="Every commission follows the same sequence, so nothing is ordered before it has been drawn and approved."
        to="/process"
        label="See the process"
      />
    </>
  );
}
