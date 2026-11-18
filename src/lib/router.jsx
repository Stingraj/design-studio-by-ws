import React, {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { prefersReducedMotion } from './gsap';

const RouterContext = createContext(null);

const normalize = (p) => (p.length > 1 ? p.replace(/\/+$/, '') : p) || '/';
const readLocation = () => ({ path: normalize(window.location.pathname), hash: window.location.hash });

export function matchPath(pattern, path) {
  const a = pattern.split('/').filter(Boolean);
  const b = path.split('/').filter(Boolean);
  if (a.length !== b.length) return null;
  const params = {};
  for (let i = 0; i < a.length; i++) {
    if (a[i].startsWith(':')) params[a[i].slice(1)] = decodeURIComponent(b[i]);
    else if (a[i] !== b[i]) return null;
  }
  return params;
}

export function RouterProvider({ children }) {
  const [location, setLocation] = useState(readLocation);
  const [curtain, setCurtain] = useState('idle');
  const pending = useRef(null);

  useEffect(() => {
    const onPop = () => setLocation(readLocation());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navigate = useCallback((to) => {
    const url = new URL(to, window.location.href);
    if (url.origin !== window.location.origin) {
      window.location.href = to;
      return;
    }
    const next = { path: normalize(url.pathname), hash: url.hash, key: Date.now() };
    const samePage = next.path === normalize(window.location.pathname);
    window.history.pushState(null, '', url.pathname + url.search + url.hash);
    if (samePage || prefersReducedMotion()) {
      setLocation(next);
      return;
    }
    pending.current = next;
    setCurtain('cover');
  }, []);

  const onCurtainDone = () => {
    if (curtain === 'cover') {
      setLocation(pending.current);
      pending.current = null;
      setCurtain('reveal');
    } else if (curtain === 'reveal') {
      setCurtain('idle');
    }
  };

  const value = useMemo(() => ({ ...location, navigate }), [location, navigate]);

  return (
    <RouterContext.Provider value={value}>
      {children}
      <AnimatePresence>
        {curtain !== 'idle' && (
          <motion.div
            key="route-curtain"
            className="route-curtain"
            aria-hidden="true"
            initial={{ y: '100%' }}
            animate={{ y: curtain === 'cover' ? '0%' : '-100%' }}
            transition={{ duration: 0.6, ease: [0.77, 0, 0.175, 1] }}
            onAnimationComplete={onCurtainDone}
          >
            <span className="route-curtain__name">Design Studio by WS</span>
            <span className="route-curtain__bar" />
          </motion.div>
        )}
      </AnimatePresence>
    </RouterContext.Provider>
  );
}

export const useRouter = () => useContext(RouterContext);

export function Link({ to, onClick, children, activeMatch = 'prefix', className = '', ...rest }) {
  const { path, navigate } = useRouter();
  const target = normalize(to.split('#')[0] || '/');
  const isActive = activeMatch === 'exact' || target === '/'
    ? path === target
    : path === target || path.startsWith(`${target}/`);

  const handleClick = (e) => {
    onClick?.(e);
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || rest.target) return;
    e.preventDefault();
    navigate(to);
  };

  return (
    <a
      href={to}
      onClick={handleClick}
      className={`${className}${isActive ? ' is-active' : ''}`.trim() || undefined}
      aria-current={isActive && !to.includes('#') ? 'page' : undefined}
      {...rest}
    >
      {children}
    </a>
  );
}

export function useDocumentMeta(title, description) {
  useEffect(() => {
    document.title = title ? `${title} — Design Studio by WS` : 'Design Studio by WS';
    if (description) {
      let meta = document.querySelector('meta[name="description"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = 'description';
        document.head.appendChild(meta);
      }
      meta.content = description;
    }
  }, [title, description]);
}
