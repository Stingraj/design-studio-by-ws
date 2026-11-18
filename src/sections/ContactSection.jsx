import React, { useState } from 'react';

export default function ContactSection({ initialType = '' }) {
  const [status, setStatus] = useState('idle');

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus('sent');
  };

  return (
    <section className="contact" id="contact">
      <div className="contact__inner">
        <div className="contact__header">
          <span className="kicker">Inquiries</span>
          <h2>Start a<br />conversation.</h2>
          <p>
            We are currently accepting new commissions for 2027.
            Please share your project details below.
          </p>
          <div className="contact__info">
            <div className="contact__info-item">
              <span>Email</span>
              <a href="mailto:hello@waseemsaife.com">hello@waseemsaife.com</a>
            </div>
            <div className="contact__info-item">
              <span>Studio</span>
              <strong>Hyderabad, India</strong>
            </div>
          </div>
        </div>

        {status === 'sent' ? (
          <div className="contact__success">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="23" stroke="currentColor" strokeWidth="1.5" />
              <path d="M14 24l8 8 12-16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <h3>Thank you</h3>
            <p>We'll be in touch shortly.</p>
          </div>
        ) : (
          <form className="contact__form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-field">
                <label htmlFor="cf-name">Name</label>
                <input id="cf-name" type="text" placeholder="Your name" required />
              </div>
              <div className="form-field">
                <label htmlFor="cf-email">Email</label>
                <input id="cf-email" type="email" placeholder="your@email.com" required />
              </div>
            </div>
            <div className="form-field">
              <label htmlFor="cf-type">Inquiry Type</label>
              <select id="cf-type" required defaultValue={initialType}>
                <option value="" disabled>Select a service</option>
                <option value="residential">Residential Architecture</option>
                <option value="interior">Interior Design</option>
                <option value="hospitality">Hospitality / Commercial</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-field">
              <label htmlFor="cf-message">Message</label>
              <textarea id="cf-message" rows="4" placeholder="Tell us about your project…" required />
            </div>
            <button type="submit" className="contact__submit">
              <span>Submit Inquiry</span>
              <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
                <path d="M1 7h18M13 1l6 6-6 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
