import React, { useState } from 'react';
import { motion } from 'framer-motion';
import use3DTilt from '../hooks/use3DTilt';

function CompanyCardItem({ co, isExpanded, onToggle }) {
  const cardRef = use3DTilt(6, 1.015);

  return (
    <article
      ref={cardRef}
      className="company-card tilt-card"
      onClick={onToggle}
      data-cursor="venture"
    >
      <div>
        <div className="company-card__top">
          <span className="company-card__industry">{co.industry || 'Enterprise'}</span>
          <span className="company-card__year">Est. {co.founded_year || '2020'}</span>
        </div>
        <h3 className="company-card__name">{co.name}</h3>
        <p className="company-card__tagline">{co.tagline}</p>
        {isExpanded && (
          <motion.p
            className="company-card__desc"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
          >
            {co.description}
          </motion.p>
        )}
      </div>
      <div className="company-card__footer">
        <span>{isExpanded ? 'Collapse' : 'Expand Details'}</span>
        {co.website_url && (
          <a
            href={co.website_url}
            target="_blank"
            rel="noreferrer"
            className="company-card__link"
            onClick={(e) => e.stopPropagation()}
          >
            Visit Venture ↗
          </a>
        )}
      </div>
    </article>
  );
}

export default function CompaniesSection({ companies }) {
  const [expandedId, setExpandedId] = useState(null);

  return (
    <section className="companies-sec" id="companies">
      <div className="sec-rule" />
      <div className="sec-head">
        <span className="sec-roman">I. Companies</span>
        <h2 className="sec-title">Enterprise Architecture.</h2>
        <p className="sec-sub">Affiliated ventures, development holdings, and craft studios operating under unified spatial discipline.</p>
      </div>

      <div className="companies-grid">
        {companies.map((co) => (
          <CompanyCardItem
            key={co.id}
            co={co}
            isExpanded={expandedId === co.id}
            onToggle={() => setExpandedId(expandedId === co.id ? null : co.id)}
          />
        ))}
      </div>
    </section>
  );
}
