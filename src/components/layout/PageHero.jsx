import React from 'react';
import SplitRevealHeading from '../animations/SplitRevealHeading';
import VelocityImage from '../animations/VelocityImage';

export default function PageHero({ kicker, title, lead, meta, image, imageAlt = '', tone = 'light' }) {
  return (
    <header className={`page-hero page-hero--${tone}${image ? ' page-hero--media' : ''}`}>
      <div className="page-hero__inner">
        <span className="sec-roman page-hero__kicker">{kicker}</span>
        <SplitRevealHeading className="page-hero__title" delay={0.35}>{title}</SplitRevealHeading>
        {lead && <p className="page-hero__lead">{lead}</p>}
        {meta && (
          <dl className="page-hero__meta">
            {meta.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
      {image && <VelocityImage src={image} alt={imageAlt} className="page-hero__image" eager />}
    </header>
  );
}
