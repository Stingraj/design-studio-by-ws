import React from 'react';

export const DEFAULT_STUDIO_TEAM = [
  {
    id: 'ws-1',
    full_name: 'WS',
    role_title: 'Principal Architect & Founder',
    bio: 'Leading the studio spatial philosophy with bespoke residential commissions, measured materiality, and architectural stillness.',
    expertise: ['Spatial Architecture', 'Private Residential', 'Art Direction'],
  },
  {
    id: 'ws-2',
    full_name: 'Ar. Zahra Khan',
    role_title: 'Lead Interior Architect',
    bio: 'Directing bespoke joinery, tactile finishes, and layered natural daylight orchestration across private sanctuaries.',
    expertise: ['Interior Architecture', 'Bespoke Joinery', 'Tactile Materiality'],
  },
  {
    id: 'ws-3',
    full_name: 'Tariq Ahmed',
    role_title: 'Director of Execution & Craft',
    bio: 'Supervising high-precision structural execution, custom artisan craftsmanship, and on-site engineering integrity.',
    expertise: ['Project Execution', 'Structural Precision', 'Material Engineering'],
  },
];

// Typographic index card. The studio has no verified portrait photography, so the
// card leads with an index numeral instead of stock or AI-generated portraits.
function TeamCardItem({ member, index }) {
  return (
    <article className="team-card team-card--index">
      <span className="team-card__index" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
      <span className="team-card__role">{member.role_title}</span>
      <h3 className="team-card__name">{member.full_name}</h3>
      <p className="team-card__bio">{member.bio}</p>
      {member.expertise && member.expertise.length > 0 && (
        <ul className="team-card__tags" aria-label={`${member.full_name} expertise`}>
          {member.expertise.map((tag) => (
            <li key={tag} className="team-card__tag">{tag}</li>
          ))}
        </ul>
      )}
    </article>
  );
}

export default function TeamSection({ teamMembers }) {
  const list = teamMembers && teamMembers.length > 0 ? teamMembers : DEFAULT_STUDIO_TEAM;

  return (
    <section className="team-sec" id="team">
      <div className="sec-rule" />
      <div className="sec-head">
        <span className="sec-roman">II. Direction & Team</span>
        <h2 className="sec-title">Principals of the Craft.</h2>
        <p className="sec-sub">Architects, spatial designers, and master craftspeople shaping quiet luxury with timeless restraint.</p>
      </div>

      <div className="team-grid">
        {list.map((member, i) => (
          <TeamCardItem key={member.id || i} member={member} index={i} />
        ))}
      </div>
    </section>
  );
}
