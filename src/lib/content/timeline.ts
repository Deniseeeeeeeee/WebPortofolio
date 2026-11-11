import type { TimelineItem } from '../../data/timeline';
import type { TimelineRow } from './types';
import { monthIndex, monthIndexOfDate } from '../dates';

/** Flat DB rows → nested epics with children, as the Jira board expects. */
export function buildTimeline(rows: TimelineRow[]): TimelineItem[] {
  const epics = rows.filter((r) => r.parentId === null);
  return epics.map((e) => {
    const children = rows
      .filter((r) => r.parentId === e.id)
      .map((c) => ({ key: c.key, title: c.title, type: c.type, start: c.start, end: c.end, status: c.status }));
    return {
      key: e.key,
      title: e.title,
      group: e.group,
      start: e.start,
      end: e.end,
      status: e.status,
      color: e.color,
      role: e.role || undefined,
      ...(children.length ? { children } : {}),
    };
  });
}

/** Whole years covering every item and today: Jan of the first year → Dec of the last. */
export function timelineRange(rows: TimelineRow[], now = new Date()) {
  const thisYear = now.getFullYear();
  if (!rows.length) return { start: `${thisYear}-01`, end: `${thisYear}-12` };
  const starts = rows.map((r) => monthIndex(r.start));
  const ends = rows.map((r) => (r.end ? monthIndex(r.end) : monthIndexOfDate(now)));
  const firstYear = Math.floor(Math.min(...starts) / 12);
  const lastYear = Math.floor(Math.max(...ends, ...starts) / 12);
  return { start: `${firstYear}-01`, end: `${lastYear}-12` };
}
