import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PROJECTS, roomChapters } from '../../data/projects';
import { DEFAULT_COMPANIES } from '../../data/site';
import { DEFAULT_STUDIO_TEAM } from '../TeamSection';
import { stopScroll, startScroll } from '../../lib/scroll';
import RenderImage from '../../components/media/RenderImage';
import {
  supabaseAdmin,
  getCompanies,
  getTeamMembers,
  getAllProjectsAdmin,
  getAccessLogs,
} from '../../lib/supabase';

/* ═══════════════════════════════════════════════════════════════
   STUDIO LEDGER — the studio's back office
   One editorial system with the public site: paper, ink, one serif.
   Every write goes to Supabase; when Supabase is unreachable the
   ledger says so and shows local fallbacks (never invented work).
═══════════════════════════════════════════════════════════════ */

// Fallbacks contain only the two real residences and placeholder people.
// No real addresses here: this file ships in the public bundle.
const FALLBACK_PROJECTS = PROJECTS.map((p) => ({
  id: `local-${p.id}`,
  title: `Residence ${p.title}`,
  category: 'Luxury Interior Design',
  visibility: 'public',
  status: 'published',
  is_featured: true,
  created_at: '2026-10-04T10:50:00Z',
}));
const FALLBACK_MEMBERS = [
  { email: 'owner@example.com', role: 'admin', note: 'Studio owner (placeholder)', created_at: '2026-10-04T03:47:33Z' },
  { email: 'client@example.com', role: 'elite', note: 'Private client (placeholder)', created_at: '2026-10-04T10:20:35Z' },
];
const FALLBACK_LOGS = [
  { id: 'l-1', event_type: 'admin_login', ip_address: '127.0.0.1', metadata: { email: 'owner@example.com' }, created_at: '2026-10-04T16:15:00Z' },
  { id: 'l-2', event_type: 'elite_login', ip_address: '127.0.0.1', metadata: { email: 'client@example.com' }, created_at: '2026-10-04T15:42:00Z' },
  { id: 'l-3', event_type: 'member_registered', ip_address: '127.0.0.1', metadata: { email: 'client@example.com' }, created_at: '2026-10-04T10:20:00Z' },
];

const SECTIONS = [
  { key: 'overview', label: 'Overview' },
  { key: 'commissions', label: 'Commissions' },
  { key: 'members', label: 'Members' },
  { key: 'studio', label: 'Studio' },
  { key: 'activity', label: 'Activity' },
];
const CATEGORIES = ['Residential Architecture', 'Luxury Interior Design', 'Private Commission', 'Spatial Heritage'];
const EVENT_LABEL = {
  admin_login: 'Admin sign-in',
  elite_login: 'Member sign-in',
  member_registered: 'Member registered',
};

const pad = (n) => String(n).padStart(2, '0');
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');
const fmtTime = (d) => new Date(d).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
const dayKey = (d) => new Date(d).toISOString().slice(0, 10);
const greeting = () => { const h = new Date().getHours(); return h < 5 ? 'Working late' : h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'; };
const eventLabel = (t) => EVENT_LABEL[t] ?? t.replace(/_/g, ' ');
const eventEmail = (log) => (log.metadata && typeof log.metadata === 'object' ? log.metadata.email : '') || '';

/* ── small parts ─────────────────────────────────────────────── */
function Segmented({ label, value, options, onChange }) {
  return (
    <div className="sd-seg" role="group" aria-label={label}>
      {options.map(([v, text]) => (
        <button key={v} type="button" aria-pressed={value === v} onClick={() => value !== v && onChange(v)}>{text}</button>
      ))}
    </div>
  );
}

function SearchField({ value, onChange, label }) {
  return (
    <label className="sd-search">
      <span className="sr-only">{label}</span>
      <input type="search" value={value} onChange={(e) => onChange(e.target.value)} placeholder={label} />
    </label>
  );
}

function Figure({ value, label, note }) {
  return (
    <div className="sd-figure">
      <span className="sd-figure__value">{value}</span>
      <span className="sd-figure__label">{label}</span>
      {note && <span className="sd-figure__note">{note}</span>}
    </div>
  );
}

/** 14-day access chart: hairline bars, labelled for screen readers. */
function ActivityChart({ logs }) {
  const days = useMemo(() => {
    const out = [];
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const counts = logs.reduce((m, l) => m.set(dayKey(l.created_at), (m.get(dayKey(l.created_at)) || 0) + 1), new Map());
    for (let i = 13; i >= 0; i -= 1) {
      const d = new Date(today); d.setDate(today.getDate() - i);
      out.push({ key: dayKey(d), d, n: counts.get(dayKey(d)) || 0 });
    }
    return out;
  }, [logs]);
  const max = Math.max(1, ...days.map((d) => d.n));
  const total = days.reduce((s, d) => s + d.n, 0);
  return (
    <figure className="sd-chart">
      <figcaption className="sd-label">Access, last 14 days · {total} event{total === 1 ? '' : 's'}</figcaption>
      <svg viewBox="0 0 280 72" preserveAspectRatio="none" role="img" aria-label={`${total} access events in the last 14 days, peak ${max} in a day`}>
        <line x1="0" y1="71.5" x2="280" y2="71.5" className="sd-chart__base" />
        {days.map((d, i) => {
          const h = d.n ? Math.max(4, (d.n / max) * 64) : 1.5;
          return <rect key={d.key} x={i * 20 + 4} y={72 - h} width="12" height={h} className={d.n ? 'sd-chart__bar' : 'sd-chart__zero'}><title>{`${fmtDate(d.d)}: ${d.n}`}</title></rect>;
        })}
      </svg>
      <div className="sd-chart__axis" aria-hidden="true"><span>{fmtDate(days[0].d).slice(0, 6)}</span><span>Today</span></div>
    </figure>
  );
}

/* ── command palette (⌘K) ────────────────────────────────────── */
function CommandPalette({ commands, onClose }) {
  const [q, setQ] = useState('');
  const [i, setI] = useState(0);
  const input = useRef(null);
  const list = commands.filter((c) => c.label.toLowerCase().includes(q.toLowerCase()));
  useEffect(() => { input.current?.focus(); }, []);
  useEffect(() => { setI(0); }, [q]);
  const run = (c) => { onClose(); c.run(); };
  const onKeyDown = (e) => {
    if (e.key === 'Escape') { e.preventDefault(); onClose(); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); setI((x) => Math.min(x + 1, list.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setI((x) => Math.max(x - 1, 0)); }
    else if (e.key === 'Enter' && list[i]) { e.preventDefault(); run(list[i]); }
  };
  return (
    <div className="sd-palette" role="dialog" aria-modal="true" aria-label="Command palette" onKeyDown={onKeyDown} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="sd-palette__box">
        <input
          ref={input}
          className="sd-palette__input"
          placeholder="Type a command…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          role="combobox"
          aria-expanded="true"
          aria-controls="sd-palette-list"
          aria-activedescendant={list[i] ? `sd-cmd-${list[i].id}` : undefined}
        />
        <ul id="sd-palette-list" role="listbox" className="sd-palette__list">
          {list.length === 0 && <li className="sd-palette__empty">No matching command</li>}
          {list.map((c, n) => (
            <li key={c.id} id={`sd-cmd-${c.id}`} role="option" aria-selected={n === i} onMouseEnter={() => setI(n)} onClick={() => run(c)}>
              <span>{c.label}</span>{c.hint && <kbd>{c.hint}</kbd>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ── drawer: new commission ──────────────────────────────────── */
function CommissionDrawer({ onClose, onCreate }) {
  const [form, setForm] = useState({ title: '', category: CATEGORIES[1], summary: '', description: '', visibility: 'elite' });
  const [busy, setBusy] = useState(false);
  const first = useRef(null);
  useEffect(() => { first.current?.focus(); }, []);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const submit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setBusy(true);
    const ok = await onCreate(form);
    setBusy(false);
    if (ok) onClose();
  };
  return (
    <div className="sd-drawer" role="dialog" aria-modal="true" aria-labelledby="sd-drawer-title" onKeyDown={(e) => e.key === 'Escape' && onClose()}>
      <button type="button" className="sd-drawer__scrim" aria-label="Close" tabIndex={-1} onClick={onClose} />
      <form className="sd-drawer__panel" onSubmit={submit}>
        <header className="sd-drawer__head">
          <span className="sd-label">New commission</span>
          <h2 id="sd-drawer-title">Register a commission</h2>
        </header>
        <label className="sd-field"><span>Title</span><input ref={first} required value={form.title} onChange={set('title')} placeholder="Residence F-504" /></label>
        <label className="sd-field"><span>Category</span>
          <select value={form.category} onChange={set('category')}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
        </label>
        <label className="sd-field"><span>Summary</span><input value={form.summary} onChange={set('summary')} placeholder="One line for the index" /></label>
        <label className="sd-field"><span>Description</span><textarea rows={4} value={form.description} onChange={set('description')} /></label>
        <fieldset className="sd-field">
          <legend>Visibility</legend>
          <Segmented label="Visibility" value={form.visibility} onChange={(v) => setForm((f) => ({ ...f, visibility: v }))} options={[['elite', 'Members only'], ['public', 'Public']]} />
        </fieldset>
        <footer className="sd-drawer__foot">
          <button type="button" className="sd-btn sd-btn--ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="sd-btn" disabled={busy || !form.title.trim()}>{busy ? 'Saving…' : 'Save commission'}</button>
        </footer>
      </form>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
export function StudioDashboard({ user, onClose, onOpenElite }) {
  const [section, setSection] = useState('overview');
  const [data, setData] = useState({ projects: [], companies: [], team: [], members: [], logs: [] });
  const [live, setLive] = useState(null); // null = loading, true = Supabase, false = offline fallbacks
  const [toast, setToast] = useState('');
  const [palette, setPalette] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [projQuery, setProjQuery] = useState('');
  const [projFilter, setProjFilter] = useState('all');
  const [memQuery, setMemQuery] = useState('');
  const [logFilter, setLogFilter] = useState('all');
  const [invite, setInvite] = useState({ email: '', role: 'elite', note: '' });
  const main = useRef(null);
  const toastTimer = useRef(null);

  const say = useCallback((msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 4000);
  }, []);
  const patch = (key, fn) => setData((d) => ({ ...d, [key]: fn(d[key]) }));

  const load = useCallback(async () => {
    setLive(null);
    // An unreachable database can hang rather than fail; give it 6s, then fall back.
    const timeout = (q) => Promise.race([q, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 6000))]);
    const [p, c, t, l, a] = await Promise.allSettled([
      getAllProjectsAdmin(), getCompanies(), getTeamMembers(), getAccessLogs(),
      supabaseAdmin.from('elite_allowlist').select('*').order('created_at', { ascending: false }),
    ].map(timeout));
    const ok = (r) => r.status === 'fulfilled' && Array.isArray(r.value) && r.value.length > 0;
    const okRows = a.status === 'fulfilled' && !a.value?.error && a.value?.data?.length > 0;
    setData({
      projects: ok(p) ? p.value : FALLBACK_PROJECTS,
      companies: ok(c) ? c.value : DEFAULT_COMPANIES,
      team: ok(t) ? t.value : DEFAULT_STUDIO_TEAM,
      logs: ok(l) ? l.value : FALLBACK_LOGS,
      members: okRows ? a.value.data : FALLBACK_MEMBERS,
    });
    setLive(ok(p) || okRows);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Own the viewport while open; restore page scroll on exit.
  useEffect(() => {
    stopScroll();
    document.body.style.overflow = 'hidden';
    return () => { startScroll(); document.body.style.overflow = ''; clearTimeout(toastTimer.current); };
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setPalette((v) => !v); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const go = useCallback((key) => { setSection(key); main.current?.scrollTo({ top: 0 }); main.current?.focus({ preventScroll: true }); }, []);

  /* ── writes (optimistic, then Supabase) ── */
  const write = async (desc, apply, revert, op) => {
    apply();
    try {
      const res = await op();
      if (res?.error) throw res.error;
      say(desc);
    } catch (err) {
      revert();
      say(`Not saved — ${err?.message || 'database unreachable'}`);
    }
  };

  const setProjectField = (p, field, value) => write(
    `${p.title}: ${field.replace('is_', '')} → ${String(value)}`,
    () => patch('projects', (list) => list.map((x) => (x.id === p.id ? { ...x, [field]: value } : x))),
    () => patch('projects', (list) => list.map((x) => (x.id === p.id ? { ...x, [field]: p[field] } : x))),
    () => supabaseAdmin.from('projects').update({ [field]: value }).eq('id', p.id),
  );

  const createProject = async (f) => {
    const title = f.title.trim();
    const entry = {
      title,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `proj-${Date.now()}`,
      category: f.category,
      summary: f.summary.trim(),
      description: f.description.trim(),
      visibility: f.visibility,
      status: 'draft',
      is_featured: false,
      created_at: new Date().toISOString(),
    };
    try {
      const { data: rows, error } = await supabaseAdmin.from('projects').insert([entry]).select();
      if (error) throw error;
      patch('projects', (list) => [rows?.[0] ?? entry, ...list]);
      say(`Saved “${title}” as a draft`);
      return true;
    } catch (err) {
      say(`Not saved — ${err?.message || 'database unreachable'}`);
      return false;
    }
  };

  const addMember = async (e) => {
    e.preventDefault();
    const email = invite.email.trim().toLowerCase();
    if (!email) return;
    const row = { email, role: invite.role, note: invite.note.trim() || 'Authorised in Studio Ledger', created_at: new Date().toISOString() };
    const prev = data.members;
    await write(
      `${email} can now sign in as ${invite.role === 'admin' ? 'administrator' : 'member'}`,
      () => patch('members', (list) => [row, ...list.filter((m) => m.email !== email)]),
      () => patch('members', () => prev),
      () => supabaseAdmin.from('elite_allowlist').upsert([{ email, role: row.role, note: row.note }], { onConflict: 'email' }),
    );
    setInvite({ email: '', role: 'elite', note: '' });
  };

  const setRole = (m, role) => write(
    `${m.email} → ${role}`,
    () => patch('members', (list) => list.map((x) => (x.email === m.email ? { ...x, role } : x))),
    () => patch('members', (list) => list.map((x) => (x.email === m.email ? { ...x, role: m.role } : x))),
    () => supabaseAdmin.from('elite_allowlist').update({ role }).eq('email', m.email),
  );

  const revoke = (m) => {
    if (m.email === user?.email) { say('You cannot revoke your own access'); return; }
    if (!window.confirm(`Revoke access for ${m.email}?`)) return;
    const prev = data.members;
    write(
      `Access revoked for ${m.email}`,
      () => patch('members', (list) => list.filter((x) => x.email !== m.email)),
      () => patch('members', () => prev),
      () => supabaseAdmin.from('elite_allowlist').delete().eq('email', m.email),
    );
  };

  /* ── derived ── */
  const { projects, members, logs, companies, team } = data;
  const stats = useMemo(() => {
    const weekAgo = Date.now() - 7 * 864e5;
    return {
      published: projects.filter((p) => p.status === 'published').length,
      drafts: projects.filter((p) => p.status !== 'published').length,
      pub: projects.filter((p) => p.visibility === 'public').length,
      priv: projects.filter((p) => p.visibility === 'elite').length,
      featured: projects.filter((p) => p.is_featured).length,
      clients: members.filter((m) => m.role !== 'admin').length,
      admins: members.filter((m) => m.role === 'admin').length,
      week: logs.filter((l) => new Date(l.created_at).getTime() > weekAgo).length,
    };
  }, [projects, members, logs]);

  const shownProjects = projects.filter((p) => {
    const f = projFilter === 'all' || (projFilter === 'draft' ? p.status !== 'published' : p.visibility === projFilter);
    return f && `${p.title} ${p.category}`.toLowerCase().includes(projQuery.toLowerCase());
  });
  const shownMembers = members.filter((m) => `${m.email} ${m.note}`.toLowerCase().includes(memQuery.toLowerCase()));
  const eventTypes = [...new Set(logs.map((l) => l.event_type))];
  const logsByDay = useMemo(() => {
    const m = new Map();
    logs.filter((l) => logFilter === 'all' || l.event_type === logFilter)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .forEach((l) => { const k = dayKey(l.created_at); m.set(k, [...(m.get(k) || []), l]); });
    return [...m.entries()];
  }, [logs, logFilter]);

  const commands = [
    ...SECTIONS.map((s, n) => ({ id: `go-${s.key}`, label: `Go to ${s.label}`, hint: `${n + 1}`, run: () => go(s.key) })),
    { id: 'new', label: 'New commission', hint: 'N', run: () => { go('commissions'); setDrawer(true); } },
    { id: 'invite', label: 'Invite a member', run: () => { go('members'); setTimeout(() => document.getElementById('sd-invite-email')?.focus(), 50); } },
    { id: 'reload', label: 'Reload data', run: load },
    { id: 'member', label: 'Open member view', run: onOpenElite },
    { id: 'exit', label: 'Exit ledger', run: onClose },
  ];

  // Single-key shortcuts when not typing
  useEffect(() => {
    const onKey = (e) => {
      if (palette || drawer || e.metaKey || e.ctrlKey || e.altKey) return;
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName)) return;
      const n = Number(e.key);
      if (n >= 1 && n <= SECTIONS.length) { e.preventDefault(); go(SECTIONS[n - 1].key); }
      if (e.key.toLowerCase() === 'n') { e.preventDefault(); go('commissions'); setDrawer(true); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [palette, drawer, go]);

  const current = SECTIONS.find((s) => s.key === section);

  return (
    <div className="sd" role="dialog" aria-modal="true" aria-label="Studio Ledger">
      {/* ── Rail ── */}
      <aside className="sd-rail">
        <div className="sd-rail__brand">
          <span className="sd-rail__mark">Studio Ledger</span>
          <span className="sd-label">Design Studio by WS</span>
        </div>
        <nav className="sd-rail__nav" aria-label="Ledger sections">
          {SECTIONS.map((s, n) => (
            <button key={s.key} type="button" aria-current={section === s.key ? 'page' : undefined} onClick={() => go(s.key)}>
              <span className="sd-rail__num">{pad(n + 1)}</span>{s.label}
            </button>
          ))}
        </nav>
        <div className="sd-rail__foot">
          <button type="button" className="sd-rail__cmd" onClick={() => setPalette(true)}>
            Commands <kbd>⌘K</kbd>
          </button>
          <span className={`sd-status sd-status--${live === null ? 'wait' : live ? 'live' : 'off'}`}>
            {live === null ? 'Connecting…' : live ? 'Live · Supabase' : 'Offline · local fallbacks'}
          </span>
          <span className="sd-rail__user" title={user?.email}>{user?.email}</span>
          <div className="sd-rail__exits">
            <button type="button" onClick={onOpenElite}>Member view</button>
            <button type="button" onClick={onClose}>Exit</button>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main ref={main} className="sd-main" tabIndex={-1} data-lenis-prevent aria-busy={live === null}>
        <header className="sd-head">
          <span className="sd-label">{pad(SECTIONS.indexOf(current) + 1)} — {current.label}</span>
          <h1 className="sd-head__title">
            {section === 'overview' ? `${greeting()}.` : current.label}
          </h1>
          {section === 'overview' && (
            <p className="sd-head__date">{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
          )}
        </header>

        {live === false && (
          <p className="sd-banner" role="status">
            The database isn’t reachable, so you’re seeing local fallback data. Changes will not be saved until it reconnects.
            <button type="button" onClick={load}>Retry</button>
          </p>
        )}

        {/* OVERVIEW */}
        {section === 'overview' && (
          <div className="sd-overview">
            <div className="sd-figures">
              <Figure value={stats.published} label="Published works" note={`${stats.drafts} draft${stats.drafts === 1 ? '' : 's'}`} />
              <Figure value={`${stats.pub}/${stats.priv}`} label="Public / private" note={`${stats.featured} featured`} />
              <Figure value={stats.clients} label="Private members" note={`${stats.admins} admin${stats.admins === 1 ? '' : 's'}`} />
              <Figure value={stats.week} label="Access, 7 days" note="sign-ins and registrations" />
            </div>

            <div className="sd-split">
              <section className="sd-card" aria-labelledby="sd-portfolio">
                <h2 id="sd-portfolio" className="sd-label">Portfolio on the site</h2>
                <ul className="sd-portfolio">
                  {PROJECTS.map((p) => {
                    const rooms = roomChapters(p);
                    return (
                      <li key={p.id}>
                        <RenderImage project={p} slide={p.coverSlide} alt="" sizes="240px" className="sd-portfolio__img" />
                        <div>
                          <strong>{p.title}</strong>
                          <span>{p.location} · {rooms.length} rooms · {p.renderSlides.length} renders · {p.slideCount} slides</span>
                          <a href={`/projects/${p.id}`} target="_blank" rel="noreferrer" className="sd-link">View page ↗</a>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>

              <section className="sd-card" aria-labelledby="sd-recent">
                <ActivityChart logs={logs} />
                <h2 id="sd-recent" className="sd-label sd-gap">Recent</h2>
                <ol className="sd-feed">
                  {[...logs].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5).map((l) => (
                    <li key={l.id}>
                      <span>{eventLabel(l.event_type)}</span>
                      <span className="sd-muted">{eventEmail(l)}</span>
                      <time dateTime={l.created_at}>{fmtDate(l.created_at)}</time>
                    </li>
                  ))}
                </ol>
                <button type="button" className="sd-link" onClick={() => go('activity')}>All activity →</button>
              </section>
            </div>

            <section className="sd-card sd-quick" aria-label="Quick actions">
              <button type="button" className="sd-btn" onClick={() => { go('commissions'); setDrawer(true); }}>New commission <kbd>N</kbd></button>
              <button type="button" className="sd-btn sd-btn--ghost" onClick={() => go('members')}>Invite a member</button>
              <button type="button" className="sd-btn sd-btn--ghost" onClick={() => setPalette(true)}>All commands <kbd>⌘K</kbd></button>
            </section>
          </div>
        )}

        {/* COMMISSIONS */}
        {section === 'commissions' && (
          <section aria-label="Commissions">
            <div className="sd-toolbar">
              <SearchField value={projQuery} onChange={setProjQuery} label="Search commissions" />
              <Segmented label="Filter" value={projFilter} onChange={setProjFilter}
                options={[['all', `All ${projects.length}`], ['public', 'Public'], ['elite', 'Private'], ['draft', 'Drafts']]} />
              <button type="button" className="sd-btn" onClick={() => setDrawer(true)}>New commission</button>
            </div>
            <div className="sd-table-wrap">
              <table className="sd-table">
                <thead><tr><th scope="col">Commission</th><th scope="col">Visibility</th><th scope="col">Status</th><th scope="col">Featured</th><th scope="col">Created</th></tr></thead>
                <tbody>
                  {shownProjects.map((p) => (
                    <tr key={p.id}>
                      <th scope="row"><strong>{p.title}</strong><span className="sd-muted">{p.category}</span></th>
                      <td><Segmented label={`${p.title} visibility`} value={p.visibility} onChange={(v) => setProjectField(p, 'visibility', v)} options={[['public', 'Public'], ['elite', 'Private']]} /></td>
                      <td><Segmented label={`${p.title} status`} value={p.status === 'published' ? 'published' : 'draft'} onChange={(v) => setProjectField(p, 'status', v)} options={[['published', 'Live'], ['draft', 'Draft']]} /></td>
                      <td>
                        <button type="button" className="sd-star" aria-pressed={!!p.is_featured} aria-label={`Feature ${p.title}`} onClick={() => setProjectField(p, 'is_featured', !p.is_featured)}>
                          {p.is_featured ? '★' : '☆'}
                        </button>
                      </td>
                      <td className="sd-mono">{fmtDate(p.created_at)}</td>
                    </tr>
                  ))}
                  {shownProjects.length === 0 && <tr><td colSpan={5} className="sd-empty">No commissions match.</td></tr>}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* MEMBERS */}
        {section === 'members' && (
          <section aria-label="Members">
            <form className="sd-invite" onSubmit={addMember}>
              <span className="sd-label">Invite</span>
              <label className="sd-field"><span>Email</span><input id="sd-invite-email" type="email" required value={invite.email} onChange={(e) => setInvite((v) => ({ ...v, email: e.target.value }))} placeholder="client@domain.com" /></label>
              <label className="sd-field"><span>Note</span><input value={invite.note} onChange={(e) => setInvite((v) => ({ ...v, note: e.target.value }))} placeholder="Optional" /></label>
              <Segmented label="Role" value={invite.role} onChange={(r) => setInvite((v) => ({ ...v, role: r }))} options={[['elite', 'Member'], ['admin', 'Admin']]} />
              <button type="submit" className="sd-btn">Grant access</button>
            </form>
            <div className="sd-toolbar">
              <SearchField value={memQuery} onChange={setMemQuery} label="Search members" />
              <span className="sd-label">{stats.clients} members · {stats.admins} admins</span>
            </div>
            <ul className="sd-people">
              {shownMembers.map((m) => (
                <li key={m.email}>
                  <span className="sd-avatar" aria-hidden="true">{m.email[0].toUpperCase()}</span>
                  <div className="sd-people__who"><strong>{m.email}</strong><span className="sd-muted">{m.note || '—'} · since {fmtDate(m.created_at)}</span></div>
                  <Segmented label={`${m.email} role`} value={m.role === 'admin' ? 'admin' : 'elite'} onChange={(r) => setRole(m, r)} options={[['elite', 'Member'], ['admin', 'Admin']]} />
                  <button type="button" className="sd-btn sd-btn--danger" onClick={() => revoke(m)}>Revoke</button>
                </li>
              ))}
              {shownMembers.length === 0 && <li className="sd-empty">No members match.</li>}
            </ul>
          </section>
        )}

        {/* STUDIO */}
        {section === 'studio' && (
          <div className="sd-split">
            <section className="sd-card" aria-labelledby="sd-ventures">
              <h2 id="sd-ventures" className="sd-label">Ventures</h2>
              <ol className="sd-index">
                {companies.map((c, n) => (
                  <li key={c.id || c.name}><span className="sd-mono">{pad(n + 1)}</span><div><strong>{c.name}</strong><span className="sd-muted">{[c.industry, c.founded_year && `est. ${c.founded_year}`].filter(Boolean).join(' · ')}</span>{c.tagline && <p>{c.tagline}</p>}</div></li>
                ))}
              </ol>
            </section>
            <section className="sd-card" aria-labelledby="sd-team">
              <h2 id="sd-team" className="sd-label">Team</h2>
              <ol className="sd-index">
                {team.map((t, n) => (
                  <li key={t.id || t.full_name}><span className="sd-mono">{pad(n + 1)}</span><div><strong>{t.full_name}</strong><span className="sd-muted">{t.role_title}</span>{t.expertise?.length > 0 && <p>{t.expertise.join(' · ')}</p>}</div></li>
                ))}
              </ol>
            </section>
          </div>
        )}

        {/* ACTIVITY */}
        {section === 'activity' && (
          <section aria-label="Activity">
            <div className="sd-toolbar">
              <Segmented label="Event type" value={logFilter} onChange={setLogFilter}
                options={[['all', 'All'], ...eventTypes.map((t) => [t, eventLabel(t)])]} />
            </div>
            {logsByDay.map(([day, items]) => (
              <section key={day} className="sd-day" aria-label={fmtDate(day)}>
                <h2 className="sd-label">{fmtDate(day)}</h2>
                <ol className="sd-feed sd-feed--full">
                  {items.map((l) => (
                    <li key={l.id}>
                      <time className="sd-mono" dateTime={l.created_at}>{fmtTime(l.created_at)}</time>
                      <span>{eventLabel(l.event_type)}</span>
                      <span className="sd-muted">{eventEmail(l)}</span>
                      <span className="sd-mono sd-muted">{l.ip_address}</span>
                    </li>
                  ))}
                </ol>
              </section>
            ))}
            {logsByDay.length === 0 && <p className="sd-empty">No activity.</p>}
          </section>
        )}
      </main>

      <p className={`sd-toast${toast ? ' is-on' : ''}`} role="status" aria-live="polite">{toast}</p>
      {palette && <CommandPalette commands={commands} onClose={() => setPalette(false)} />}
      {drawer && <CommissionDrawer onClose={() => setDrawer(false)} onCreate={createProject} />}
    </div>
  );
}

export default StudioDashboard;
