export const PROCESS_PHASES = [
  {
    num: '01',
    title: 'Brief & Survey',
    heading: 'We measure before we imagine.',
    text: 'A conversation about how you live, followed by a full measured survey of the site or apartment. Every wall, beam, window and service point is recorded so the design starts from fact.',
    outputs: ['Brief document', 'Measured survey', 'Existing-condition plan'],
    image: '/projects/project-1/slide-03.jpg',
  },
  {
    num: '02',
    title: 'Concept & Planning',
    heading: 'One palette, one plan.',
    text: 'Zoning and layout options are tested against the brief. A single material direction — stone, timber, glass, metal and fabric — is assembled so every room grows from the same family.',
    outputs: ['Zoning options', 'Furniture layout', 'Material board'],
    image: '/projects/project-2/renders/s13.jpg',
  },
  {
    num: '03',
    title: '3D Development',
    heading: 'Every room, seen first.',
    text: 'Each space is rendered with its real finishes, fixtures and lighting. You review and approve the home room by room on a 3D presentation deck before anything is ordered.',
    outputs: ['3D presentation deck', 'Ceiling and lighting plans', 'Room approvals'],
    image: '/projects/project-2/slide-05.jpg',
  },
  {
    num: '04',
    title: 'Craft & Execution',
    heading: 'Drawn to the millimetre. Built by hand.',
    text: 'Working drawings and joinery shop drawings go to site and to WS Atelier Joinery. The studio supervises execution against the drawings, resolving details as they are built.',
    outputs: ['Working drawings', 'Joinery shop drawings', 'Site supervision'],
    image: '/projects/project-1/renders/s29.jpg',
  },
  {
    num: '05',
    title: 'Handover',
    heading: 'Quiet, finished, yours.',
    text: 'Snag lists are closed, lighting scenes are set and the home is styled before you move in. Drawings and finish schedules are handed over for the life of the building.',
    outputs: ['Snag closure', 'Styling and lighting set-up', 'As-built record'],
    image: '/projects/project-2/slide-14.jpg',
  },
];

export const NAV_LINKS = [
  { to: '/studio', label: 'Studio' },
  { to: '/services', label: 'Services' },
  { to: '/projects', label: 'Projects' },
  { to: '/films', label: 'Films' },
  { to: '/process', label: 'Process' },
  { to: '/contact', label: 'Contact' },
];

export const STUDIO_EMAIL = 'hello@waseemsaife.com';
export const STUDIO_CITY = 'Hyderabad, India';

export const DEFAULT_COMPANIES = [
  { id: 'c-1', sort_order: 1, name: 'Design Studio by WS', industry: 'Spatial Architecture', tagline: 'Residential & spatial master planning', founded_year: '2020' },
  { id: 'c-2', sort_order: 2, name: 'WS Atelier Joinery', industry: 'Bespoke Millwork', tagline: 'Custom architectural carpentry & veneer crafts', founded_year: '2022' },
  { id: 'c-3', sort_order: 3, name: 'WS Capital Estates', industry: 'Property Holdings', tagline: 'Strategic residential development & advisory', founded_year: '2024' },
];
