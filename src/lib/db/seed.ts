import type { Client, InStatement } from '@libsql/client';
import { profile as p, stats } from '../../data/profile';
import { timeline } from '../../data/timeline';
import { projects } from '../../data/projects';
import { experience, skills, education } from '../../data/experience';
import type { Profile } from '../content/types';

/** First run: copy the CV content from src/data/*.ts into the database. */
export async function seedIfEmpty(db: Client) {
  const r = await db.execute("SELECT 1 FROM settings WHERE key = 'profile'");
  if (r.rows.length) return;

  const profile: Profile = {
    name: p.name,
    badge: p.badge,
    headlineBefore: p.headline.before,
    headlineAccent: p.headline.accent,
    headlineAfter: p.headline.after,
    summary: p.summary,
    role: p.role,
    email: p.email,
    linkedin: p.linkedin,
    photo: null,
    cv: null,
  };

  const stmts: InStatement[] = [
    { sql: 'INSERT INTO settings (key, value) VALUES (?, ?)', args: ['profile', JSON.stringify(profile)] },
    { sql: 'INSERT INTO settings (key, value) VALUES (?, ?)', args: ['education', JSON.stringify(education)] },
    ...stats.map((s, i) => ({
      sql: 'INSERT INTO stats (value, decimals, label, dark, sort) VALUES (?, ?, ?, ?, ?)',
      args: [s.value, s.decimals, s.label, s.dark ? 1 : 0, (i + 1) * 10],
    })),
    ...experience.map((e, i) => ({
      sql: 'INSERT INTO experience (role, org, start, end, line, sort) VALUES (?, ?, ?, ?, ?, ?)',
      args: [e.role, e.org, e.start, e.end, e.line, (i + 1) * 10],
    })),
    ...skills.map((g, i) => ({
      sql: 'INSERT INTO skill_groups (title, style, items, sort) VALUES (?, ?, ?, ?)',
      args: [g.title, g.style, JSON.stringify(g.items), (i + 1) * 10],
    })),
    ...projects.map((pr, i) => ({
      sql: `INSERT INTO projects (key, title, description, start, end, location, in_progress, facts, bullets, tags, main_style, images, sort)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        pr.key,
        pr.title,
        pr.description,
        pr.start,
        pr.end,
        pr.location ?? '',
        pr.inProgress ? 1 : 0,
        JSON.stringify(pr.facts),
        JSON.stringify(pr.bullets),
        JSON.stringify(pr.tags.map((t) => ({ label: t.label, strong: !!t.strong }))),
        pr.mainStyle,
        JSON.stringify(pr.images.map((im) => ({ label: im.label, alt: im.alt, media: null }))),
        (i + 1) * 10,
      ],
    })),
  ];
  await db.batch(stmts, 'write');

  // Timeline: epics first, then children pointing at their epic's id
  let sort = 10;
  for (const t of timeline) {
    const res = await db.execute({
      sql: `INSERT INTO timeline (key, title, grp, start, end, status, color, role, parent_id, type, sort)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL, 'task', ?)`,
      args: [t.key, t.title, t.group, t.start, t.end, t.status, t.color, t.role ?? '', sort],
    });
    sort += 10;
    const parentId = Number(res.lastInsertRowid);
    let csort = 10;
    for (const c of t.children ?? []) {
      await db.execute({
        sql: `INSERT INTO timeline (key, title, grp, start, end, status, color, role, parent_id, type, sort)
              VALUES (?, ?, ?, ?, ?, ?, ?, '', ?, ?, ?)`,
        args: [c.key, c.title, t.group, c.start, c.end, c.status, t.color, parentId, c.type, csort],
      });
      csort += 10;
    }
  }
}
