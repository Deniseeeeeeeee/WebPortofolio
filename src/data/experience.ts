export interface Experience {
  role: string;
  org: string;
  start: string; // 'YYYY-MM'
  end: string | null; // null = now
  line: string;
}

export const experience: Experience[] = [
  { role: 'Chairperson', org: 'ASSETS', start: '2026-04', end: null, line: 'Leading 70 members across 7 divisions, running SERIES and ORBIT.' },
  { role: 'Teaching Assistant', org: 'Proyek Aplikasi Dasar, UGM', start: '2026-08', end: null, line: 'Mentoring 4 groups (20 students) on planning, documentation and delivery.' },
  { role: 'Research & Data Analysis', org: 'BEM KM UGM', start: '2025-11', end: null, line: 'Scraped 5,000+ public comments and ran sentiment analysis for policy studies.' },
  { role: 'General Coordinator', org: 'Liga TRPL 2025', start: '2025-07', end: '2025-12', line: 'Coordinated logistics, event, publication, sponsorship and liaison divisions.' },
  { role: 'Event Coordinator', org: 'Tech Enthusiast Day 2025', start: '2025-05', end: '2025-12', line: 'Recruited the event team, built the timeline and rundown for a large IT competition.' },
];

export interface SkillGroup {
  title: string;
  style: 'blue' | 'outline';
  items: string[];
}

export const skills: SkillGroup[] = [
  { title: 'Project management', style: 'blue', items: ['Agile', 'Sprint Planning', 'Jira', 'ClickUp', 'Notion', 'Qase'] },
  { title: 'System analysis', style: 'outline', items: ['BRD', 'SRS', 'ERD', 'Use Case', 'Activity Diagram', 'UAT'] },
  { title: 'Development & data', style: 'outline', items: ['Laravel', 'PHP', 'MySQL', 'Vue.js', 'JavaScript', 'Python', 'Pandas'] },
];

export const education = {
  school: 'Universitas Gadjah Mada',
  program: 'Software Engineering Technology',
  gpa: 'GPA 3.63 / 4.00',
  years: '2024–2028',
};
