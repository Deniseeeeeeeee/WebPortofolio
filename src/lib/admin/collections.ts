/** Admin CRUD config for each list-type content collection. */
import type { Field, Values } from './fields';
import * as repo from '../content/repo';
import { formatRange } from '../dates';
import { deleteMedia } from '../media';
import type { ExperienceRow, ProjectRow, SkillGroupRow, StatRow, TimelineRow } from '../content/types';

const STATUS = [
  { value: 'done', label: 'Done' },
  { value: 'in-progress', label: 'In progress' },
  { value: 'todo', label: 'To do' },
];
const sortField: Field = {
  name: 'sort',
  label: 'Order',
  type: 'number',
  help: 'Lower numbers show first (10, 20, 30…).',
  half: true,
  min: 0,
};
const startField: Field = { name: 'start', label: 'Start month', type: 'month', required: true, half: true };
const endField: Field = { name: 'end', label: 'End month', type: 'monthOptional', half: true, help: 'Leave empty if it is still ongoing.' };

export interface CollectionDef<T extends { id: number }> {
  id: repo.Collection;
  title: string;
  singular: string;
  description: string;
  fields: (ctx: { all: T[]; current?: T }) => Field[];
  list: () => Promise<T[]>;
  columns: string[];
  cells: (row: T, all: T[]) => string[];
  /** Rows nested under a parent (timeline children) are indented in the list */
  indent?: (row: T) => boolean;
  order?: (rows: T[]) => T[];
  save: (values: Values, id?: number) => Promise<void>;
  remove?: (row: T, all: T[]) => Promise<void>;
  defaults?: Values;
}

const stats: CollectionDef<StatRow> = {
  id: 'stats',
  title: 'Stats',
  singular: 'stat',
  description: 'The number cards under the hero.',
  fields: () => [
    { name: 'value', label: 'Value', type: 'number', required: true, step: 'any', half: true },
    { name: 'decimals', label: 'Decimals', type: 'number', min: 0, max: 3, half: true, help: 'e.g. 2 for a GPA like 3.63' },
    { name: 'label', label: 'Label', type: 'text', required: true },
    { name: 'dark', label: 'Show as the black highlight card', type: 'checkbox', half: true },
    sortField,
  ],
  list: repo.listStats,
  columns: ['Value', 'Label', 'Style', 'Order'],
  cells: (s) => [s.value.toFixed(s.decimals), s.label, s.dark ? 'Black' : 'White', String(s.sort)],
  save: (v, id) => repo.saveStat(v as unknown as Omit<StatRow, 'id'>, id),
  defaults: { decimals: 0, dark: false },
};

const timeline: CollectionDef<TimelineRow> = {
  id: 'timeline',
  title: 'Timeline',
  singular: 'timeline item',
  description: 'Epics on the Jira-style roadmap. Add a child (story/task) by choosing a parent epic.',
  fields: ({ all, current }) => [
    { name: 'key', label: 'Key', type: 'text', required: true, half: true, placeholder: 'PRJ-4', help: 'Short id shown on the board.' },
    { name: 'title', label: 'Title', type: 'text', required: true, half: true },
    {
      name: 'parentId',
      label: 'Parent epic',
      type: 'select',
      half: true,
      help: 'Leave as "None" for a top-level epic.',
      options: [
        { value: '', label: 'None (this is an epic)' },
        ...all.filter((r) => r.parentId === null && r.id !== current?.id).map((r) => ({ value: String(r.id), label: `${r.key} · ${r.title}` })),
      ],
    },
    {
      name: 'group',
      label: 'Group',
      type: 'select',
      half: true,
      options: [
        { value: 'projects', label: 'Web projects' },
        { value: 'leadership', label: 'Leadership & events' },
      ],
      help: 'Children follow their epic.',
    },
    { name: 'role', label: 'Role (tooltip)', type: 'text', half: true, placeholder: 'Project Manager' },
    {
      name: 'type',
      label: 'Child type',
      type: 'select',
      half: true,
      options: [
        { value: 'task', label: 'Task' },
        { value: 'story', label: 'Story' },
      ],
      help: 'Only used for children.',
    },
    startField,
    endField,
    { name: 'status', label: 'Status', type: 'select', required: true, options: STATUS, half: true },
    { name: 'color', label: 'Bar color', type: 'color', half: true, help: 'Epics only.' },
    sortField,
  ],
  list: repo.listTimeline,
  columns: ['Key', 'Title', 'Dates', 'Status'],
  cells: (t) => [t.key, t.title, formatRange(t.start, t.end, 'present'), STATUS.find((s) => s.value === t.status)?.label ?? t.status],
  indent: (t) => t.parentId !== null,
  order: (rows) => {
    const epics = rows.filter((r) => r.parentId === null).sort((a, b) => (a.group === b.group ? 0 : a.group === 'projects' ? -1 : 1));
    return epics.flatMap((e) => [e, ...rows.filter((r) => r.parentId === e.id)]);
  },
  save: async (v, id) => {
    const parentId = v.parentId ? Number(v.parentId) : null;
    let group = v.group as TimelineRow['group'];
    let color = (v.color as string) || '#6E5DC6';
    if (parentId) {
      const parent = (await repo.listTimeline()).find((r) => r.id === parentId);
      if (parent) {
        group = parent.group;
        color = parent.color;
      }
    }
    await repo.saveTimeline({ ...(v as unknown as Omit<TimelineRow, 'id'>), parentId, group, color }, id);
  },
  remove: async (row, all) => {
    for (const c of all.filter((r) => r.parentId === row.id)) await repo.deleteRow('timeline', c.id);
  },
  defaults: { group: 'projects', status: 'done', color: '#1D7AFC', type: 'task' },
};

const projects: CollectionDef<ProjectRow> = {
  id: 'projects',
  title: 'Projects',
  singular: 'project',
  description: 'Case studies in the "Selected projects" section. Layout alternates image-left / image-right.',
  fields: () => [
    { name: 'key', label: 'Key', type: 'text', required: true, half: true, placeholder: 'PRJ-4' },
    { name: 'title', label: 'Title', type: 'text', required: true, half: true },
    { name: 'description', label: 'One-line description', type: 'textarea', rows: 2 },
    startField,
    endField,
    { name: 'location', label: 'Location', type: 'text', half: true, placeholder: 'Yogyakarta' },
    { name: 'inProgress', label: 'Show "In progress" badge', type: 'checkbox', half: true },
    { name: 'facts', label: 'Facts', type: 'facts', rows: 3, help: 'One per line as "Label: Value", e.g. "Role: Project Manager".' },
    { name: 'bullets', label: 'Bullets', type: 'lines', rows: 4, help: 'One bullet per line.' },
    { name: 'tags', label: 'Tags', type: 'tags', help: 'Comma separated. Start with * for a black pill: *Laravel, MySQL, SRS' },
    {
      name: 'mainStyle',
      label: 'Placeholder style',
      type: 'select',
      half: true,
      options: [
        { value: 'light', label: 'Light blue' },
        { value: 'dark', label: 'Black' },
        { value: 'blue', label: 'Solid blue' },
      ],
      help: 'Shown while the main image is empty.',
    },
    sortField,
  ],
  list: repo.listProjects,
  columns: ['Key', 'Title', 'Dates', 'Images'],
  cells: (p) => [p.key, p.title, formatRange(p.start, p.end, 'present'), `${p.images.filter((i) => i.media).length} / 3`],
  save: (v, id) => repo.saveProject(v as unknown as Omit<ProjectRow, 'id'>, id),
  remove: async (row) => {
    for (const im of row.images) await deleteMedia(im.media);
  },
  defaults: { mainStyle: 'light', inProgress: false },
};

const experience: CollectionDef<ExperienceRow> = {
  id: 'experience',
  title: 'Experience',
  singular: 'experience',
  description: 'The "Leadership & experience" list in the About section.',
  fields: () => [
    { name: 'role', label: 'Role', type: 'text', required: true, half: true, placeholder: 'Chairperson' },
    { name: 'org', label: 'Organization', type: 'text', required: true, half: true, placeholder: 'ASSETS' },
    startField,
    { ...endField, help: 'Leave empty to show "now".' },
    { name: 'line', label: 'One line', type: 'textarea', rows: 2 },
    sortField,
  ],
  list: repo.listExperience,
  columns: ['Role', 'Organization', 'Dates'],
  cells: (e) => [e.role, e.org, formatRange(e.start, e.end, 'now')],
  save: (v, id) => repo.saveExperience(v as unknown as Omit<ExperienceRow, 'id'>, id),
};

const skills: CollectionDef<SkillGroupRow> = {
  id: 'skills',
  title: 'Skills',
  singular: 'skill group',
  description: 'Chip groups in the About section.',
  fields: () => [
    { name: 'title', label: 'Group title', type: 'text', required: true, half: true },
    {
      name: 'style',
      label: 'Chip style',
      type: 'select',
      half: true,
      options: [
        { value: 'outline', label: 'Outlined' },
        { value: 'blue', label: 'Blue' },
      ],
    },
    { name: 'items', label: 'Skills', type: 'list', rows: 3, help: 'Comma separated, e.g. Agile, Jira, Notion' },
    sortField,
  ],
  list: repo.listSkills,
  columns: ['Group', 'Skills'],
  cells: (g) => [g.title, g.items.join(', ')],
  save: (v, id) => repo.saveSkill(v as unknown as Omit<SkillGroupRow, 'id'>, id),
  defaults: { style: 'outline' },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const collections: Record<repo.Collection, CollectionDef<any>> = { stats, timeline, projects, experience, skills };
export const isCollection = (s: string | undefined): s is repo.Collection => !!s && s in collections;
