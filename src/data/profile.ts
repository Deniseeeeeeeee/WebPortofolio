export interface Stat {
  value: number;
  decimals: number;
  label: string;
  dark?: boolean;
}

export const profile = {
  name: 'Denise Aditya',
  badge: 'Open to internship · Yogyakarta, Indonesia',
  // Rendered as: "Project Manager who ships on <blue>schedule</blue>."
  headline: { before: 'Project Manager who ships on ', accent: 'schedule', after: '.' },
  summary:
    'Software Engineering Technology student at Universitas Gadjah Mada. I lead web projects from requirement gathering to deployment, and write the BRD, SRS, ERD and UAT that keep teams aligned.',
  email: 'denisaditya55@gmail.com',
  linkedin: 'https://www.linkedin.com/in/denise-aditya-3327',
  cv: '/cv/CV_Denise_Aditya.pdf',
  role: 'Project Manager & System Analyst',
} as const;

export const stats: Stat[] = [
  { value: 3, decimals: 0, label: 'Web projects led & analyzed' },
  { value: 70, decimals: 0, label: 'Members led as ASSETS Chairperson' },
  { value: 20, decimals: 0, label: 'Students mentored as TA' },
  { value: 3.63, decimals: 2, label: 'GPA · Universitas Gadjah Mada', dark: true },
];
