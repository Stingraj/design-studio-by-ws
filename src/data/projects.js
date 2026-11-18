export const PROJECTS = [
  {
    id: '01',
    title: 'F-204 Mr. Samad',
    subtitle: 'Residential · Hyderabad',
    type: '3D Presentation',
    year: '2026',
    location: 'F-204, Hyderabad',
    client: 'Mr. Samad',
    accent: '#c4a98a',
    slideCount: 31,
    folder: '/projects/project-1',
    // Slides with a clean render crop in {folder}/renders/sNN.jpg (+ -800/-1400.webp)
    renderSlides: [5, 6, 8, 9, 10, 12, 13, 14, 15, 17, 18, 19, 20, 22, 23, 24, 25, 27, 28, 29, 30],
    coverSlide: 5,
    renders: [
      [5, 'Formal living'], [8, 'Informal living'], [10, 'Dining'], [12, 'Master bedroom'],
      [17, 'Guest bedroom'], [22, 'Kids bedroom'], [27, 'Kitchen'], [29, 'Crockery unit'],
    ],
    rooms: [
      { slide: 1,  name: 'Project Cover',        desc: 'A bespoke residential vision — refined, measured, and deeply personal.' },
      { slide: 4,  name: 'Formal Living Room',   desc: 'A space designed for hosting. Modern textures intersect with warm ambient lighting to create a threshold of quiet luxury.' },
      { slide: 8,  name: 'Informal Living Room', desc: 'An intimate family gathering area where comfort is the primary design principle — soft seating, layered light.' },
      { slide: 12, name: 'Master Bedroom',        desc: 'Symmetrical wood paneling, warm tonal restraint and modern low-slung seating. Restraint as a design language.' },
      { slide: 17, name: 'Guest Bedroom',         desc: 'A serene and welcoming environment. Soft neutral palettes and abundant natural light define the space.' },
      { slide: 22, name: 'Kids Bedroom',          desc: 'Playful yet sophisticated — allowing room for growth, creativity and years of memories.' },
      { slide: 27, name: 'Kitchen',               desc: 'Functional modern layout with sleek handleless cabinetry and premium stone finishes.' },
      { slide: 30, name: 'Pooja Room',            desc: 'A quiet contemplative space, carved out with deep respect for traditional sensibilities and ritual.' },
    ],
  },
  {
    id: '02',
    title: 'F-1002 Srinivas Reddy',
    subtitle: 'Residential · Hyderabad',
    type: '3D Presentation',
    year: '2026',
    location: 'F-1002, Hyderabad',
    client: 'Mr. Srinivas Reddy',
    accent: '#a3b08a',
    slideCount: 32,
    folder: '/projects/project-2',
    // Slides with a clean render crop in {folder}/renders/sNN.jpg (+ -800/-1400.webp)
    renderSlides: [5, 6, 7, 9, 10, 11, 12, 13, 14, 16, 17, 18, 20, 21, 23, 24, 25, 27, 28, 29, 30, 31],
    coverSlide: 5,
    renders: [
      [5, 'Formal living'], [6, 'Fluted glass threshold'], [9, 'Informal living'], [13, 'Dining'],
      [16, "Children's bedroom"], [23, 'Master bedroom'], [27, 'Kitchen'], [30, 'Pooja unit'],
    ],
    rooms: [
      { slide: 1,  name: 'Project Cover',        desc: 'An exercise in spatial restraint — where every element earns its place.' },
      { slide: 4,  name: 'Formal Living Room',   desc: 'Fluted glass, custom marble consoles and curved partitions sculpt the living threshold. Architecture as furniture.' },
      { slide: 9,  name: 'Informal Living Room', desc: 'Soft shadows and balanced indirect illumination sculpt clean geometric volumes around the focal wall.' },
      { slide: 15, name: "Children's Bedroom",   desc: 'Bright and adaptable — integrated study zones and custom joinery grow with the child.' },
      { slide: 20, name: 'Guest Bedroom',         desc: 'Understated elegance. Tactile materials and restful hues create a room that breathes.' },
      { slide: 23, name: 'Master Bedroom',        desc: 'A luxurious retreat. Bespoke headboard detail, a walk-in wardrobe, and considered dressing light.' },
      { slide: 27, name: 'Kitchen',               desc: 'Sage green handleless cabinetry offset by white marble countertops. Precise and unhurried.' },
      { slide: 30, name: 'Pooja Room',            desc: 'Warm metallic accents and hand-crafted backdrops frame a serene spiritual corner.' },
      { slide: 31, name: 'Balcony',               desc: 'An outdoor extension designed for stillness — surveying the panoramic city views.' },
    ],
  },
];

export const slideSrc = (project, n) => `${project.folder}/slide-${String(n).padStart(2, '0')}.jpg`;

export const getProject = (id) => PROJECTS.find((p) => p.id === id);

/** Base path (no extension) of a clean render crop. */
export const renderBase = (project, n) => `${project.folder}/renders/s${String(n).padStart(2, '0')}`;

/**
 * Rooms as chapters: each room owns the render crops whose slide number falls
 * between its own slide and the next room's slide. Captions come from
 * `renders[]` where the studio named the view, otherwise the room name.
 */
export function roomChapters(project) {
  const rooms = project.rooms.filter((r) => r.name !== 'Project Cover');
  const named = new Map(project.renders);
  return rooms.map((room, i) => {
    const end = rooms[i + 1]?.slide ?? Infinity;
    const slides = project.renderSlides.filter((n) => n >= room.slide && n < end);
    return { ...room, frames: slides.map((n) => ({ slide: n, caption: named.get(n) ?? room.name })) };
  }).filter((room) => room.frames.length > 0);
}
