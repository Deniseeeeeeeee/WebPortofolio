export type Status = 'done' | 'in-progress' | 'todo';

export interface TimelineChild {
  key: string;
  title: string;
  type: 'story' | 'task';
  start: string; // 'YYYY-MM'
  end: string | null; // 'YYYY-MM', null = ongoing
  status: Status;
}

export interface TimelineItem {
  key: string; // e.g. 'PRJ-2'
  title: string;
  group: 'projects' | 'leadership';
  start: string; // 'YYYY-MM'
  end: string | null; // null = ongoing
  status: Status;
  color: string; // epic bar color
  role?: string; // shown in the bar tooltip
  children?: TimelineChild[];
}

export const range = { start: '2025-01', end: '2026-12' }; // 8 quarters

export const timeline: TimelineItem[] = [
  { key: 'PRJ-1', title: 'Dimas Diajeng Sleman', group: 'projects', start: '2025-09', end: '2025-11', status: 'done', color: '#6E5DC6', role: 'Project Manager & Front End Dev' },
  { key: 'PRJ-2', title: 'Madana Innotech Website', group: 'projects', start: '2026-01', end: '2026-06', status: 'done', color: '#1D7AFC', role: 'Project Manager',
    children: [ // sub-phase dates are estimates, confirm with Denise
      { key: 'PRJ-21', title: 'Requirement gathering', type: 'story', start: '2026-01', end: '2026-01', status: 'done' },
      { key: 'PRJ-22', title: 'BRD, SRS, ERD & diagrams', type: 'task', start: '2026-01', end: '2026-03', status: 'done' },
      { key: 'PRJ-23', title: 'Sprint development', type: 'task', start: '2026-02', end: '2026-05', status: 'done' },
      { key: 'PRJ-24', title: 'UAT & deployment', type: 'task', start: '2026-06', end: '2026-06', status: 'done' },
    ] },
  { key: 'PRJ-3', title: 'SIMATKUL', group: 'projects', start: '2026-08', end: null, status: 'in-progress', color: '#2898BD', role: 'System Analyst' },
  { key: 'ORG-1', title: 'Tech Enthusiast Day 2025', group: 'leadership', start: '2025-05', end: '2025-12', status: 'done', color: '#E2B203', role: 'Event Coordinator' },
  { key: 'ORG-2', title: 'Liga TRPL 2025', group: 'leadership', start: '2025-07', end: '2025-12', status: 'done', color: '#E774BB', role: 'General Coordinator' },
  { key: 'ORG-3', title: 'ASSETS Chairperson', group: 'leadership', start: '2026-04', end: null, status: 'in-progress', color: '#22A06B', role: 'Chairperson' },
  { key: 'ORG-4', title: 'Teaching Assistant, PAD', group: 'leadership', start: '2026-08', end: null, status: 'in-progress', color: '#8F7EE7', role: 'Teaching Assistant' },
];

export const groupLabels: Record<TimelineItem['group'], string> = {
  projects: 'WEB PROJECTS',
  leadership: 'LEADERSHIP & EVENTS',
};
