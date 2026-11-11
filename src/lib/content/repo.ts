/** Read + write access to all portfolio content. */
import type { Row } from '@libsql/client';
import { getDb } from '../db/client';
import type {
  Education,
  ExperienceRow,
  Profile,
  ProjectRow,
  SiteData,
  SkillGroupRow,
  StatRow,
  TimelineRow,
} from './types';

const json = <T>(v: unknown, fallback: T): T => {
  try {
    return v == null ? fallback : (JSON.parse(String(v)) as T);
  } catch {
    return fallback;
  }
};
const str = (v: unknown) => (v == null ? '' : String(v));
const strOrNull = (v: unknown) => (v == null || v === '' ? null : String(v));

/* ---------- mappers ---------- */
const toStat = (r: Row): StatRow => ({
  id: Number(r.id),
  value: Number(r.value),
  decimals: Number(r.decimals),
  label: str(r.label),
  dark: !!Number(r.dark),
  sort: Number(r.sort),
});
const toTimeline = (r: Row): TimelineRow => ({
  id: Number(r.id),
  key: str(r.key),
  title: str(r.title),
  group: str(r.grp) === 'leadership' ? 'leadership' : 'projects',
  start: str(r.start),
  end: strOrNull(r.end),
  status: str(r.status) as TimelineRow['status'],
  color: str(r.color),
  role: str(r.role),
  parentId: r.parent_id == null ? null : Number(r.parent_id),
  type: str(r.type) === 'story' ? 'story' : 'task',
  sort: Number(r.sort),
});
const toProject = (r: Row): ProjectRow => {
  const images = json<ProjectRow['images'] | []>(r.images, []);
  const slot = (i: number) => images[i] ?? { label: `Image ${i + 1}`, alt: '', media: null };
  return {
    id: Number(r.id),
    key: str(r.key),
    title: str(r.title),
    description: str(r.description),
    start: str(r.start),
    end: strOrNull(r.end),
    location: str(r.location),
    inProgress: !!Number(r.in_progress),
    facts: json(r.facts, []),
    bullets: json(r.bullets, []),
    tags: json(r.tags, []),
    mainStyle: (['light', 'dark', 'blue'].includes(str(r.main_style)) ? str(r.main_style) : 'light') as ProjectRow['mainStyle'],
    images: [slot(0), slot(1), slot(2)],
    sort: Number(r.sort),
  };
};
const toExperience = (r: Row): ExperienceRow => ({
  id: Number(r.id),
  role: str(r.role),
  org: str(r.org),
  start: str(r.start),
  end: strOrNull(r.end),
  line: str(r.line),
  sort: Number(r.sort),
});
const toSkill = (r: Row): SkillGroupRow => ({
  id: Number(r.id),
  title: str(r.title),
  style: str(r.style) === 'blue' ? 'blue' : 'outline',
  items: json(r.items, []),
  sort: Number(r.sort),
});

/* ---------- reads ---------- */
export async function getSetting<T>(key: 'profile' | 'education'): Promise<T> {
  const db = await getDb();
  const r = await db.execute({ sql: 'SELECT value FROM settings WHERE key = ?', args: [key] });
  return json<T>(r.rows[0]?.value, {} as T);
}

export async function listStats() {
  const db = await getDb();
  return (await db.execute('SELECT * FROM stats ORDER BY sort, id')).rows.map(toStat);
}
export async function listTimeline() {
  const db = await getDb();
  return (await db.execute('SELECT * FROM timeline ORDER BY sort, id')).rows.map(toTimeline);
}
export async function listProjects() {
  const db = await getDb();
  return (await db.execute('SELECT * FROM projects ORDER BY sort, id')).rows.map(toProject);
}
export async function listExperience() {
  const db = await getDb();
  return (await db.execute('SELECT * FROM experience ORDER BY sort, id')).rows.map(toExperience);
}
export async function listSkills() {
  const db = await getDb();
  return (await db.execute('SELECT * FROM skill_groups ORDER BY sort, id')).rows.map(toSkill);
}

export async function getSiteData(): Promise<SiteData> {
  const [profile, education, stats, timeline, projects, experience, skills] = await Promise.all([
    getSetting<Profile>('profile'),
    getSetting<Education>('education'),
    listStats(),
    listTimeline(),
    listProjects(),
    listExperience(),
    listSkills(),
  ]);
  return { profile, education, stats, timeline, projects, experience, skills };
}

/* ---------- writes ---------- */
export async function saveSetting(key: 'profile' | 'education', value: unknown) {
  const db = await getDb();
  await db.execute({
    sql: 'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
    args: [key, JSON.stringify(value)],
  });
}

export async function saveStat(s: Omit<StatRow, 'id'>, id?: number) {
  const db = await getDb();
  const args = [s.value, s.decimals, s.label, s.dark ? 1 : 0, s.sort];
  if (id) await db.execute({ sql: 'UPDATE stats SET value=?, decimals=?, label=?, dark=?, sort=? WHERE id=?', args: [...args, id] });
  else await db.execute({ sql: 'INSERT INTO stats (value, decimals, label, dark, sort) VALUES (?, ?, ?, ?, ?)', args });
}

export async function saveTimeline(t: Omit<TimelineRow, 'id'>, id?: number) {
  const db = await getDb();
  const args = [t.key, t.title, t.group, t.start, t.end, t.status, t.color, t.role, t.parentId, t.type, t.sort];
  if (id)
    await db.execute({
      sql: 'UPDATE timeline SET key=?, title=?, grp=?, start=?, end=?, status=?, color=?, role=?, parent_id=?, type=?, sort=? WHERE id=?',
      args: [...args, id],
    });
  else
    await db.execute({
      sql: 'INSERT INTO timeline (key, title, grp, start, end, status, color, role, parent_id, type, sort) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      args,
    });
}

export async function saveProject(p: Omit<ProjectRow, 'id'>, id?: number) {
  const db = await getDb();
  const args = [
    p.key,
    p.title,
    p.description,
    p.start,
    p.end,
    p.location,
    p.inProgress ? 1 : 0,
    JSON.stringify(p.facts),
    JSON.stringify(p.bullets),
    JSON.stringify(p.tags),
    p.mainStyle,
    JSON.stringify(p.images),
    p.sort,
  ];
  if (id)
    await db.execute({
      sql: 'UPDATE projects SET key=?, title=?, description=?, start=?, end=?, location=?, in_progress=?, facts=?, bullets=?, tags=?, main_style=?, images=?, sort=? WHERE id=?',
      args: [...args, id],
    });
  else
    await db.execute({
      sql: 'INSERT INTO projects (key, title, description, start, end, location, in_progress, facts, bullets, tags, main_style, images, sort) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      args,
    });
}

export async function saveExperience(e: Omit<ExperienceRow, 'id'>, id?: number) {
  const db = await getDb();
  const args = [e.role, e.org, e.start, e.end, e.line, e.sort];
  if (id) await db.execute({ sql: 'UPDATE experience SET role=?, org=?, start=?, end=?, line=?, sort=? WHERE id=?', args: [...args, id] });
  else await db.execute({ sql: 'INSERT INTO experience (role, org, start, end, line, sort) VALUES (?, ?, ?, ?, ?, ?)', args });
}

export async function saveSkill(g: Omit<SkillGroupRow, 'id'>, id?: number) {
  const db = await getDb();
  const args = [g.title, g.style, JSON.stringify(g.items), g.sort];
  if (id) await db.execute({ sql: 'UPDATE skill_groups SET title=?, style=?, items=?, sort=? WHERE id=?', args: [...args, id] });
  else await db.execute({ sql: 'INSERT INTO skill_groups (title, style, items, sort) VALUES (?, ?, ?, ?)', args });
}

const TABLES = { stats: 'stats', timeline: 'timeline', projects: 'projects', experience: 'experience', skills: 'skill_groups' } as const;
export type Collection = keyof typeof TABLES;

export async function deleteRow(collection: Collection, id: number) {
  const db = await getDb();
  await db.execute({ sql: `DELETE FROM ${TABLES[collection]} WHERE id = ?`, args: [id] });
}

export async function nextSort(collection: Collection) {
  const db = await getDb();
  const r = await db.execute(`SELECT COALESCE(MAX(sort), 0) + 10 AS s FROM ${TABLES[collection]}`);
  return Number(r.rows[0].s);
}
