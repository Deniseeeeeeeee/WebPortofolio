/** Shapes of the content stored in the database and rendered by the public page. */
import type { Status } from '../../data/timeline';
export type { Status };

export interface MediaRef {
  id: string;
  width: number;
  height: number;
  mime: string;
}

export interface Profile {
  name: string;
  badge: string;
  headlineBefore: string;
  headlineAccent: string;
  headlineAfter: string;
  summary: string;
  role: string;
  email: string;
  linkedin: string;
  photo: MediaRef | null;
  cv: MediaRef | null; // uploaded PDF; falls back to /cv/CV_Denise_Aditya.pdf
}

export interface Education {
  school: string;
  program: string;
  gpa: string;
  years: string;
}

export interface StatRow {
  id: number;
  value: number;
  decimals: number;
  label: string;
  dark: boolean;
  sort: number;
}

export interface TimelineRow {
  id: number;
  key: string;
  title: string;
  group: 'projects' | 'leadership';
  start: string;
  end: string | null;
  status: Status;
  color: string;
  role: string;
  parentId: number | null; // null = epic, otherwise child of that epic
  type: 'story' | 'task';
  sort: number;
}

export interface ProjectImage {
  label: string;
  alt: string;
  media: MediaRef | null;
}

export interface ProjectRow {
  id: number;
  key: string;
  title: string;
  description: string;
  start: string;
  end: string | null;
  location: string;
  inProgress: boolean;
  facts: { label: string; value: string }[];
  bullets: string[];
  tags: { label: string; strong: boolean }[];
  mainStyle: 'light' | 'dark' | 'blue';
  images: [ProjectImage, ProjectImage, ProjectImage];
  sort: number;
}

export interface ExperienceRow {
  id: number;
  role: string;
  org: string;
  start: string;
  end: string | null;
  line: string;
  sort: number;
}

export interface SkillGroupRow {
  id: number;
  title: string;
  style: 'blue' | 'outline';
  items: string[];
  sort: number;
}

export interface SiteData {
  profile: Profile;
  education: Education;
  stats: StatRow[];
  timeline: TimelineRow[];
  projects: ProjectRow[];
  experience: ExperienceRow[];
  skills: SkillGroupRow[];
}
