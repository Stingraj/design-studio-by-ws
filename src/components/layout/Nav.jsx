import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link, useRouter } from '../../lib/router';
import { startScroll, stopScroll } from '../../lib/scroll';
import { NAV_LINKS, STUDIO_CITY, STUDIO_EMAIL } from '../../data/site';

function AuthControls({ currentUser, onOpenAuth, onOpenElite, onOpenAdmin, onSignOut }) {
  if (currentUser) {
    return (
      <div className="nav__user-badge">
        <span className="nav__role-tag">{currentUser.role}</span>
        {currentUser.role === 'admin' ? (
          <button type="button" className="nav__portal-link" onClick={onOpenAdmin}>Admin Portal</button>
        ) : (
          <button type="button" className="nav__portal-link" onClick={onOpenElite}>Member Portal</button>
        )}
        <button type="button" onClick={onSignOut} style={{ opacity: 0.6, fontSize: '10px' }}>Exit</button>
      </div>
    );
  }
  return (
    <button
      type="button"
      className="nav__elite-btn"
      onClick={() => onOpenAuth('login')}
      style={{
        background: '#ffffff',
        color: '#0d0e0c',
        borderColor: '#ffffff',
        fontWeight: '700',
        letterSpacing: '0.14em',
        padding: '8px 20px',
      }}
    >
      Login
    </button>
  );
}

export default function Nav({ visible, ...auth }) {
  const { path } = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [path]);

  useEffect(() => {
    if (!open) return undefined;
    stopScroll();
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      startScroll();
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <>
      <motion.nav
        className={`nav${visible ? ' is-visible' : ''}`}
        aria-label="Primary navigation"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: visible || open ? 1 : 0, y: visible || open ? 0 : -16 }}
        transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
      >
        <Link to="/" className="nav__brand" activeMatch="exact">Design Studio by WS</Link>
        <div className="nav__links">
          {NAV_LINKS.map((l) => (
            <Link key={l.to} to={l.to} className="nav__link">{l.label}</Link>
          ))}
          <AuthControls {...auth} />
        </div>
        <button
          type="button"
          className="nav__toggle"
          aria-expanded={open}
          aria-controls="site-menu"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? 'Close' : 'Menu'}
        </button>
      </motion.nav>

      <AnimatePresence>
        {open && (
          <motion.div
            id="site-menu"
            className="menu-overlay"
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            data-lenis-prevent
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.6, ease: [0.77, 0, 0.175, 1] }}
          >
            <ol className="menu-overlay__list">
              {[{ to: '/', label: 'Home' }, ...NAV_LINKS].map((l, i) => (
                <li key={l.to}>
                  <Link to={l.to} activeMatch={l.to === '/' ? 'exact' : 'prefix'}>
                    <span className="menu-overlay__num">{String(i + 1).padStart(2, '0')}</span>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ol>
            <div className="menu-overlay__foot">
              <a href={`mailto:${STUDIO_EMAIL}`}>{STUDIO_EMAIL}</a>
              <span>{STUDIO_CITY}</span>
              <AuthControls {...auth} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
