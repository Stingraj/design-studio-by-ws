import manifest from './film.json'; // written by film/scripts/web.py

/* The film: two chapters cut from one 5-minute master, built from the client renders. */
const BASE = '/media/film';

const META = {
  f204:  { projectId: '01', title: 'F-204',  client: 'Mr. Samad',          subtitle: 'Residence of Mr. Samad' },
  f1002: { projectId: '02', title: 'F-1002', client: 'Mr. Srinivas Reddy', subtitle: 'Residence of Mr. Srinivas Reddy' },
};

export const FILM_CHAPTERS = manifest.chapters.map((c) => ({
  ...c,
  ...META[c.key],
  src: { 720: `${BASE}/${c.key}-720.mp4`, 1080: `${BASE}/${c.key}-1080.mp4` },
  poster: `${BASE}/${c.key}-poster`,
  track: `${BASE}/${c.key}.chapters.vtt`,
}));

export const FILM_DURATION = FILM_CHAPTERS.reduce((s, c) => s + c.duration, 0);

/* "What we do": one short film whose chapters are the studio's disciplines
   (film/scripts/whatwedo.py). Same shape as a residence chapter, so FilmPlayer plays it as is. */
export const WHAT_WE_DO = manifest.whatwedo && {
  ...manifest.whatwedo,
  title: 'What we do',
  subtitle: 'Architecture · Interiors · Joinery · Visualisation',
  src: { 720: `${BASE}/whatwedo-720.mp4`, 1080: `${BASE}/whatwedo-1080.mp4` },
  poster: `${BASE}/whatwedo-poster`,
  track: `${BASE}/whatwedo.chapters.vtt`,
};

/* The two screenings on /films. */
export const FILMS = [
  WHAT_WE_DO && {
    slug: 'what-we-do',
    title: 'What we do',
    lead: 'Architecture, interiors, joinery and visualisation, shown in rooms the studio designed.',
    chapters: [WHAT_WE_DO],
    duration: WHAT_WE_DO.duration,
    poster: WHAT_WE_DO.poster,
    strip: `${BASE}/whatwedo-strip.webp`,
  },
  {
    slug: 'the-residences',
    title: 'The Residences',
    lead: 'A slow walk through two Hyderabad apartments, room by room, in two chapters.',
    chapters: FILM_CHAPTERS,
    duration: FILM_DURATION,
    poster: `${BASE}/f1002-poster`,
    strip: `${BASE}/residences-strip.webp`,
  },
].filter(Boolean);

export const HERO_LOOP = {
  src: { 720: `${BASE}/hero-loop-720.mp4`, 1080: `${BASE}/hero-loop-1080.mp4` },
  poster: `${BASE}/hero-loop-poster`,
};

export const chapterIndexForProject = (projectId) => FILM_CHAPTERS.findIndex((c) => c.projectId === projectId);

/** True when the visitor asked to save data or is on a very slow link: show posters only. */
export function lowBandwidth() {
  const c = typeof navigator !== 'undefined' ? navigator.connection : null;
  return Boolean(c && (c.saveData || /(^|-)2g$/.test(c.effectiveType || '')));
}

/**
 * 1080p once the video is drawn wider than ~1200 device pixels, unless the link is slow.
 * `cover` (full-bleed, object-fit: cover) counts the width the 16:9 frame is scaled to,
 * which on a portrait phone is far wider than the screen.
 */
export function pickSource(src, { cover = false } = {}) {
  if (typeof window === 'undefined') return src[720];
  const css = cover ? Math.max(window.innerWidth, (window.innerHeight * 16) / 9) : window.innerWidth;
  const px = css * Math.min(window.devicePixelRatio || 1, 2);
  const slow = /3g/.test(navigator.connection?.effectiveType || '');
  return px >= 1200 && !slow ? src[1080] : src[720];
}

export const fmtTime = (s) => {
  const t = Math.max(0, Math.floor(s || 0));
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;
};
