export type SlotStyle = 'light' | 'dark' | 'blue';

export interface ImageSlotData {
  /** File name inside src/assets/projects/<folder>/ (any of .png/.jpg/.jpeg/.webp/.avif) */
  file: string;
  label: string;
  alt: string;
}

export interface Fact {
  label: string;
  value: string;
}

export interface Project {
  key: string;
  folder: string; // src/assets/projects/<folder>/
  title: string;
  description: string;
  start: string; // 'YYYY-MM'
  end: string | null;
  location?: string;
  inProgress?: boolean;
  facts: Fact[];
  bullets: string[];
  tags: { label: string; strong?: boolean }[];
  mainStyle: SlotStyle;
  images: [ImageSlotData, ImageSlotData, ImageSlotData]; // [main, small, small]
}

// Display order: Madana, Dimas, SIMATKUL
export const projects: Project[] = [
  {
    key: 'PRJ-2',
    folder: 'madana',
    title: 'Madana Innotech',
    description: 'Company profile website delivered from requirement gathering to deployment with an Agile team.',
    start: '2026-01',
    end: '2026-06',
    location: 'Yogyakarta',
    facts: [
      { label: 'Role', value: 'Project Manager' },
      { label: 'Team', value: '4 members' },
      { label: 'Method', value: 'Agile, sprints in Jira' },
    ],
    bullets: [
      'Planned the project timeline and managed sprint tasks in Jira to keep delivery on schedule.',
      'Authored the BRD, SRS, ERD, Use Case & Activity Diagrams and UAT.',
    ],
    tags: [{ label: 'Jira', strong: true }, { label: 'BRD' }, { label: 'SRS' }, { label: 'ERD' }, { label: 'UAT' }],
    mainStyle: 'light',
    images: [
      { file: 'main', label: 'Main screenshot: Homepage', alt: 'Madana Innotech website homepage' },
      { file: 'jira', label: 'Jira board / sprint', alt: 'Jira sprint board used to manage the Madana Innotech project' },
      { file: 'erd', label: 'ERD / use case', alt: 'ERD and use case diagram for the Madana Innotech website' },
    ],
  },
  {
    key: 'PRJ-1',
    folder: 'dimas',
    title: 'Dimas Diajeng Sleman',
    description: 'Company profile website for the Diajeng Sleman community, with a public homepage and an admin dashboard.',
    start: '2025-09',
    end: '2025-11',
    location: 'Yogyakarta',
    facts: [
      { label: 'Role', value: 'Project Manager & Front End Dev' },
      { label: 'Scope', value: 'Requirements to deployment' },
      { label: 'Stack', value: 'Laravel, MySQL' },
    ],
    bullets: [
      'Led the development end to end while building the homepage and admin dashboard myself.',
      'Authored the BRD, SRS, ERD, Use Case & Activity Diagrams and UAT.',
    ],
    tags: [{ label: 'Laravel', strong: true }, { label: 'MySQL', strong: true }, { label: 'SRS' }, { label: 'UAT' }],
    mainStyle: 'dark',
    images: [
      { file: 'main', label: 'Main screenshot: Homepage', alt: 'Dimas Diajeng Sleman website homepage' },
      { file: 'admin', label: 'Admin dashboard', alt: 'Admin dashboard of the Dimas Diajeng Sleman website' },
      { file: 'mobile', label: 'Mobile view', alt: 'Dimas Diajeng Sleman website on a mobile screen' },
    ],
  },
  {
    key: 'PRJ-3',
    folder: 'simatkul',
    title: 'SIMATKUL',
    description: 'Course scheduling information system for the department, built around how lecturers arrange the schedule each semester.',
    start: '2026-08',
    end: null,
    inProgress: true,
    facts: [
      { label: 'Role', value: 'System Analyst' },
      { label: 'Dev team', value: '7 members' },
      { label: 'Users', value: 'Department lecturers' },
    ],
    bullets: [
      'Turned lecturer interviews into functional and non-functional specifications.',
      'Designed the ERD, Use Case and Activity Diagrams for the scheduling data and processes.',
      'Wrote the SRS, BRD and UAT scenarios the 7-person dev team builds against.',
    ],
    tags: [{ label: 'SRS' }, { label: 'BRD' }, { label: 'ERD' }, { label: 'Use Case' }, { label: 'UAT' }],
    mainStyle: 'blue',
    images: [
      { file: 'main', label: 'Main image: ERD or system flow', alt: 'SIMATKUL ERD and system flow' },
      { file: 'usecase', label: 'Use case diagram', alt: 'SIMATKUL use case diagram' },
      { file: 'srs', label: 'SRS / UAT preview', alt: 'Preview of the SIMATKUL SRS and UAT documents' },
    ],
  },
];
