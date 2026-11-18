import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { PROJECTS } from '../../data/projects';
import {
  supabase,
  supabaseAdmin,
  getPublicProjects,
  getEliteProjects,
  getAllProjectsAdmin,
  getAccessLogs,
  recordAccessLog,
  getSignedEliteUrl,
  verifyMemberAccess,
  registerEliteMember,
} from '../../lib/supabase';

/* Private client portal: sign-in, member presentations and studio administration.
   Moved out of App.jsx unchanged in behaviour (2026-11-18). */
export function EliteInvitationSection({ onOpenAuth, currentUser, onOpenElite }) {
  return (
    <section className="elite-invite-sec" id="elite">
      <div className="elite-invite-sec__inner">
        <span className="elite-seal">IV. Private Registry</span>
        <h2>Private Commissions & Spatial Archive</h2>
        <p>
          Access to unreleased residential case studies, proprietary engineering briefs, and private project commissions is strictly invitation-only.
        </p>
        {currentUser ? (
          <button className="elite-invite-sec__btn" onClick={onOpenElite}>
            Enter Member Portal ({currentUser.role.toUpperCase()})
          </button>
        ) : (
          <button className="elite-invite-sec__btn" onClick={() => onOpenAuth('login')}>
            Member Login / Private Registry
          </button>
        )}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FILM SECTION
═══════════════════════════════════════════════════════════════ */

export function AuthModal({ mode, onClose, onAuthSuccess }) {
  const initialTab = mode === 'admin' ? 'admin' : 'login';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const check = await verifyMemberAccess(email);
      if (!check.allowed) {
        setErrorMsg('Access is strictly by private invitation. Email not recognized in Studio Registry.');
        setLoading(false);
        return;
      }

      if (activeTab === 'admin' && check.role !== 'admin') {
        setErrorMsg('Access denied. This account does not possess Studio Administrator privileges.');
        setLoading(false);
        return;
      }

      await recordAccessLog(activeTab === 'admin' ? 'admin_login' : 'elite_login', {
        email,
        role: check.role,
        note: check.note,
      });

      const member = {
        email: email.trim().toLowerCase(),
        role: check.role,
        name: check.note || (check.role === 'admin' ? 'Studio Administrator' : 'Elite Member'),
      };

      localStorage.setItem('ds_user', JSON.stringify(member));
      onAuthSuccess(member);
      onClose();
    } catch (err) {
      console.error('Auth error:', err);
      setErrorMsg(err?.message || 'Authentication error. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-overlay" onClick={onClose}>
      <div className="auth-card" onClick={(e) => e.stopPropagation()}>
        <button className="auth-close" onClick={onClose} aria-label="Close">✕</button>

        {/* Tab Navigation */}
        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => { setActiveTab('login'); setErrorMsg(null); setSuccessMsg(null); }}
          >
            Private Member Login
          </button>
          <button
            type="button"
            className={`auth-tab ${activeTab === 'admin' ? 'active' : ''}`}
            onClick={() => { setActiveTab('admin'); setErrorMsg(null); setSuccessMsg(null); }}
          >
            Admin Access
          </button>
        </div>

        {/* Header Text */}
        <div className="auth-header">
          <h3>
            {activeTab === 'login' && 'Private Member Portal'}
            {activeTab === 'admin' && 'Studio Governance Portal'}
          </h3>
          <p>
            {activeTab === 'login' && 'Enter your authorized email to access private commissions and archives'}
            {activeTab === 'admin' && 'Registry administration, allowlist management, and CMS controls'}
          </p>
        </div>

        {/* Alerts */}
        {errorMsg && <div className="auth-error">{errorMsg}</div>}
        {successMsg && <div className="auth-success-badge">{successMsg}</div>}

        {/* Form */}
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label>{activeTab === 'admin' ? 'Administrator Email' : 'Authorized VIP Email'}</label>
            <input
              type="email"
              className="auth-input"
              placeholder={activeTab === 'admin' ? 'admin@email.com' : 'client@private.com'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="auth-field">
            <label>Password / Security Key</label>
            <input
              type="password"
              className="auth-input"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? 'Authenticating...' : (
              activeTab === 'admin'
                ? 'Sign In as Administrator'
                : 'Sign In to Member Portal'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ELITE MEMBER PORTAL MODAL (/elite)
═══════════════════════════════════════════════════════════════ */
export function ElitePortalModal({ user, onClose, onOpenAdmin }) {
  const [eliteProjects, setEliteProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getEliteProjects();
        // No invented private work as a fallback: show only what the database returns.
        setEliteProjects(data?.length > 0 ? data : []);
      } catch (err) {
        console.warn('Failed to fetch elite projects:', err);
        setEliteProjects([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="portal-fullscreen">
      <div className="portal-topbar">
        <div className="portal-brand">
          <span>DESIGN STUDIO BY WS</span>
          <span style={{ color: 'var(--gold)' }}>·</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--gold)' }}>ELITE REGISTRY</span>
        </div>
        <div className="portal-user-meta">
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>{user.email}</span>
          {user.role === 'admin' && (
            <button className="portal-close-btn" onClick={onOpenAdmin}>Admin View</button>
          )}
          <button className="portal-close-btn" onClick={onClose}>Exit Portal</button>
        </div>
      </div>

      <div className="sec-head sec-head--dark" style={{ padding: '0 0 48px' }}>
        <span className="sec-roman">Private Portfolio · Flagship</span>
        <h2 className="sec-title">Project Aquila.</h2>
        <p className="sec-sub">Members-only briefing. Bespoke private residential commission with continuous limestone surfaces and acoustic seclusion.</p>
      </div>

      {/* Flagship Card */}
      <div className="flagship-box">
        <div className="flagship-media">
          <img src="/media/hero-residence.jpg" alt="Project Aquila" />
        </div>
        <div className="flagship-info">
          <span className="flagship-tag">CLASSIFIED · COMMISSIONS MMXXVI</span>
          <h3 className="flagship-title">Project Aquila</h3>
          <p className="flagship-summary">
            A 14,000 sq ft private estate sculpted into natural topography. Features acoustic fluted oak dividers, concealed biometric entries, and master daylight corridors.
          </p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
            <span className="p-slide__pill">Limestone</span>
            <span className="p-slide__pill">Smoked Walnut</span>
            <span className="p-slide__pill">Signed Vault Media</span>
          </div>
        </div>
      </div>

      {/* Member Projects List */}
      <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
        <h3 style={{ fontFamily: 'var(--font-cinzel)', fontSize: '18px', color: 'var(--gold)', marginBottom: '24px' }}>
          Registered Private Projects ({eliteProjects.length})
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {eliteProjects.map((p) => (
            <div key={p.id} style={{ background: '#181818', border: '1px solid var(--line-gold)', padding: '24px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--gold)', textTransform: 'uppercase' }}>
                {p.visibility} · {p.category}
              </span>
              <h4 style={{ fontFamily: 'var(--font-bodoni)', fontSize: '20px', color: 'var(--paper)', margin: '8px 0' }}>{p.title}</h4>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'rgba(245,240,230,0.7)', lineHeight: '1.5' }}>{p.summary}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* The admin dashboard lives in ./StudioDashboard.jsx (Studio Ledger). */

/* ═══════════════════════════════════════════════════════════════
   ROUTES
═══════════════════════════════════════════════════════════════ */
