<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref } from 'vue';
import { groupLabels, type Status, type TimelineItem } from '../data/timeline';
import { monthIndex, fractionalMonthIndex, formatRange } from '../lib/dates';

const props = defineProps<{ buildTime: string; items: TimelineItem[]; range: { start: string; end: string }; owner: string }>();
const timeline = props.items;
const range = props.range;

// `now` starts at build time (matches the server render), then switches to the real date on mount.
const now = ref(new Date(props.buildTime));

const rangeStart = monthIndex(range.start);
const rangeEnd = monthIndex(range.end) + 1; // exclusive
const total = rangeEnd - rangeStart;

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
const todayIdx = computed(() => fractionalMonthIndex(now.value));
const todayPct = computed(() => clamp(((todayIdx.value - rangeStart) / total) * 100, 0, 100));
const todayInRange = computed(() => todayIdx.value >= rangeStart && todayIdx.value < rangeEnd);

/** Quarter columns */
const quarters = computed(() => {
  const out: { label: string; current: boolean }[] = [];
  for (let m = rangeStart; m < rangeEnd; m += 3) {
    const year = Math.floor(m / 12);
    const q = Math.floor((m % 12) / 3) + 1;
    out.push({ label: `Q${q} ${year}`, current: todayIdx.value >= m && todayIdx.value < m + 3 });
  }
  return out;
});

/** Bar geometry from dates, month precision. end = null runs to today. */
function bar(start: string, end: string | null) {
  const s = monthIndex(start);
  const e = end === null ? todayIdx.value : monthIndex(end) + 1;
  const left = clamp(((s - rangeStart) / total) * 100, 0, 100);
  const right = clamp(((e - rangeStart) / total) * 100, 0, 100);
  return { left: `${left}%`, width: `${Math.max(right - left, 0.8)}%` };
}

const statusLabel: Record<Status, string> = { done: 'Done', 'in-progress': 'In progress', todo: 'To do' };

const groups = (['projects', 'leadership'] as const)
  .map((g) => {
    const items = timeline.filter((t) => t.group === g);
    return { id: g, label: `${groupLabels[g]} · ${items.length}`, items };
  })
  .filter((g) => g.items.length > 0);

// The first epic with children (Madana, PRJ-2) is open by default
const firstWithChildren = timeline.find((t) => t.children?.length)?.key;
const open = reactive<Record<string, boolean>>(
  Object.fromEntries(timeline.filter((t) => t.children?.length).map((t) => [t.key, t.key === firstWithChildren])),
);
const toggle = (key: string) => (open[key] = !open[key]);

/* ---------- Tooltip ---------- */
const board = ref<HTMLElement | null>(null);
const tip = reactive({ show: false, x: 0, y: 0, title: '', role: '', dates: '', above: true });

function epicDates(t: TimelineItem) {
  return formatRange(t.start, t.end, 'present');
}

function showTip(e: Event, title: string, role: string, dates: string) {
  const el = e.currentTarget as HTMLElement;
  const host = board.value;
  if (!host) return;
  const r = el.getBoundingClientRect();
  const h = host.getBoundingClientRect();
  tip.title = title;
  tip.role = role;
  tip.dates = dates;
  tip.x = r.left - h.left + host.scrollLeft + r.width / 2;
  tip.above = r.top - h.top > 70;
  tip.y = tip.above ? r.top - h.top - 8 : r.bottom - h.top + 8;
  tip.show = true;
}
const hideTip = () => (tip.show = false);

const ariaFor = (title: string, role: string, dates: string, status: Status) =>
  `${title}${role ? `, ${role}` : ''}: ${dates}. Status: ${statusLabel[status]}.`;

onMounted(async () => {
  now.value = new Date();
  await nextTick();
  (window as unknown as { __timelineMounted?: boolean }).__timelineMounted = true;
  window.dispatchEvent(new CustomEvent('timeline:mounted'));
});
</script>

<template>
  <div class="tl-card overflow-hidden rounded-card border border-jira-border bg-white text-jira-text shadow-[0_1px_2px_rgb(9_30_66_/_0.08),0_12px_40px_-20px_rgb(9_30_66_/_0.25)]">
    <!-- Board header -->
    <div class="flex flex-col gap-4 px-4 pt-4 pb-4 sm:flex-row sm:items-end sm:justify-between md:px-5">
      <div>
        <p class="text-[13px] text-jira-subtle">Projects / {{ owner }} / Timeline</p>
        <h3 class="mt-1 font-sans text-[22px] font-semibold tracking-tight text-jira-text">Timeline</h3>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <label class="relative">
          <span class="sr-only">Search timeline (preview only)</span>
          <svg class="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-jira-subtle" aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
          <input type="search" placeholder="Search timeline" class="h-9 w-44 rounded-[4px] border border-jira-border bg-white pr-2 pl-8 text-[13px] text-jira-text placeholder:text-jira-subtle sm:w-48" />
        </label>
        <div class="flex rounded-[4px] bg-jira-row p-0.5 text-[13px]" role="group" aria-label="Timeline scale">
          <span class="px-3 py-1.5 text-jira-subtle">Weeks</span>
          <span class="px-3 py-1.5 text-jira-subtle">Months</span>
          <span class="rounded-[3px] bg-loz-progress-bg px-3 py-1.5 font-semibold text-loz-progress-text" aria-current="true">Quarters</span>
        </div>
      </div>
    </div>

    <!-- Board grid (scrolls horizontally under 1040px) -->
    <div ref="board" class="tl-scroll relative overflow-x-auto border-t border-jira-border" @scroll="hideTip">
      <div class="tl-grid relative" :style="{ minWidth: `${300 + quarters.length * 92.5}px`, '--q': quarters.length }">
        <!-- Header -->
        <div class="flex h-10 border-b border-jira-border bg-jira-row text-[12px] font-semibold text-jira-subtle">
          <div class="tl-left left-0 sm:sticky z-20 flex w-[300px] shrink-0 items-center border-r border-jira-border bg-jira-row px-4">Epic</div>
          <div class="grid flex-1" :style="{ gridTemplateColumns: `repeat(${quarters.length}, minmax(0, 1fr))` }">
            <div
              v-for="q in quarters"
              :key="q.label"
             
              :class="['flex items-center justify-center border-r border-jira-border last:border-r-0', q.current ? 'bg-loz-progress-bg text-loz-progress-text' : '']"
            >{{ q.label }}</div>
          </div>
        </div>

        <!-- Groups -->
        <div v-for="g in groups" :key="g.id">
          <div class="tl-row flex h-8 border-b border-jira-border bg-jira-row">
            <div class="tl-left left-0 sm:sticky z-20 flex w-[300px] shrink-0 items-center bg-jira-row px-4 text-[11px] font-bold tracking-[0.04em] text-jira-subtle">{{ g.label }}</div>
            <div class="flex-1"></div>
          </div>

          <template v-for="t in g.items" :key="t.key">
            <!-- Epic row -->
            <div :class="['tl-row group/row flex h-11 border-b border-jira-border', open[t.key] ? 'bg-[#FAFBFC]' : 'bg-white']">
              <div class="tl-left left-0 sm:sticky z-20 flex w-[300px] shrink-0 items-center gap-2 border-r border-jira-border bg-inherit pr-3 pl-2">
                <button
                  v-if="t.children?.length"
                  type="button"
                  class="flex h-8 w-8 shrink-0 items-center justify-center rounded-[4px] text-jira-subtle hover:bg-jira-row"
                  :aria-expanded="open[t.key] ? 'true' : 'false'"
                  :aria-controls="`tl-children-${t.key}`"
                  :aria-label="`${open[t.key] ? 'Collapse' : 'Expand'} ${t.title}`"
                  @click="toggle(t.key)"
                >
                  <svg :class="['tl-chevron transition-transform duration-300', open[t.key] ? 'rotate-90' : '']" aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6" /></svg>
                </button>
                <span v-else class="flex h-8 w-8 shrink-0 items-center justify-center text-jira-subtle/40" aria-hidden="true">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6" /></svg>
                </span>
                <span class="flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] bg-jira-epic-icon" aria-hidden="true">
                  <svg width="10" height="10" viewBox="0 0 16 16" fill="#fff"><path d="M9.5 1 3 9h4l-1 6 7-8.5H9z" /></svg>
                </span>
                <span class="shrink-0 text-[13px] font-medium text-jira-subtle">{{ t.key }}</span>
                <span class="min-w-0 truncate text-[14px] font-medium text-jira-text" :title="t.title">{{ t.title }}</span>
                <span v-if="t.status === 'in-progress'" class="ml-auto shrink-0 rounded-[3px] bg-loz-progress-bg px-1 py-px text-[11px] font-bold text-loz-progress-text uppercase">In progress</span>
              </div>
              <div class="tl-lane relative flex-1">
                <div
                  class="tl-bar-wrap absolute top-1/2 -translate-y-1/2"
                  :style="bar(t.start, t.end)"
                >
                  <div
                    class="tl-bar h-[22px] rounded-[4px] outline-offset-2"
                    :style="{ backgroundColor: t.color }"
                    tabindex="0"
                    role="img"
                    :aria-label="ariaFor(t.title, t.role ?? '', epicDates(t), t.status)"
                    @mouseenter="showTip($event, t.title, t.role ?? '', epicDates(t))"
                    @mouseleave="hideTip"
                    @focus="showTip($event, t.title, t.role ?? '', epicDates(t))"
                    @blur="hideTip"
                    @keydown.esc="hideTip"
                  ></div>
                  <div class="mt-[3px] h-1 overflow-hidden rounded-full bg-jira-border">
                    <div :class="['tl-progress h-full w-full rounded-full', t.status === 'done' ? 'bg-jira-done' : 'bg-jira-progress']"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Children (animated open/close) -->
            <div
              v-if="t.children?.length"
              :id="`tl-children-${t.key}`"
              :class="['tl-children grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]', open[t.key] ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]']"
              :inert="!open[t.key]"
             
            >
              <div class="min-h-0 overflow-hidden">
                <div v-for="c in t.children" :key="c.key" class="tl-row tl-child flex h-10 border-b border-jira-border bg-white">
                  <div class="tl-left left-0 sm:sticky z-20 flex w-[300px] shrink-0 items-center gap-2 border-r border-jira-border bg-white pr-3 pl-[56px]">
                    <span v-if="c.type === 'story'" class="flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] bg-jira-done" aria-hidden="true">
                      <svg width="8" height="10" viewBox="0 0 8 10" fill="#fff"><path d="M0 0h8v10L4 7.5 0 10z" /></svg>
                    </span>
                    <span v-else class="flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] bg-jira-progress" aria-hidden="true">
                      <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m3.5 8.5 3 3 6-7" /></svg>
                    </span>
                    <span class="sr-only">{{ c.type === 'story' ? 'Story' : 'Task' }}</span>
                    <span class="shrink-0 text-[13px] font-medium text-jira-subtle">{{ c.key }}</span>
                    <span class="min-w-0 truncate text-[13px] text-jira-text" :title="c.title">{{ c.title }}</span>
                    <span
                      :class="[
                        'ml-auto shrink-0 rounded-[3px] px-1 py-px text-[11px] font-bold uppercase',
                        c.status === 'done' ? 'bg-loz-done-bg text-loz-done-text' : c.status === 'in-progress' ? 'bg-loz-progress-bg text-loz-progress-text' : 'bg-loz-todo-bg text-loz-todo-text',
                      ]"
                    >{{ statusLabel[c.status] }}</span>
                  </div>
                  <div class="tl-lane relative flex-1">
                    <div class="tl-bar-wrap absolute top-1/2 -translate-y-1/2" :style="bar(c.start, c.end)">
                      <div
                        :class="['tl-bar h-4 rounded-[3px] outline-offset-2', c.status === 'done' ? 'bg-[#94C748]' : 'bg-[#579DFF]']"
                        tabindex="0"
                        role="img"
                        :aria-label="ariaFor(c.title, c.type === 'story' ? 'Story' : 'Task', formatRange(c.start, c.end, 'present'), c.status)"
                        @mouseenter="showTip($event, c.title, `${t.title} · ${c.type === 'story' ? 'Story' : 'Task'}`, formatRange(c.start, c.end, 'present'))"
                        @mouseleave="hideTip"
                        @focus="showTip($event, c.title, `${t.title} · ${c.type === 'story' ? 'Story' : 'Task'}`, formatRange(c.start, c.end, 'present'))"
                        @blur="hideTip"
                        @keydown.esc="hideTip"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>

        <!-- TODAY line -->
        <div
          v-if="todayInRange"
          class="pointer-events-none absolute top-0 bottom-0 z-10"
          :style="{ left: `calc(300px + (100% - 300px) * ${todayPct / 100})` }"
          aria-hidden="true"
        >
          <div class="tl-today absolute top-0 bottom-0 left-0 w-0.5 -translate-x-1/2 bg-jira-today"></div>
          <span class="tl-today-tag absolute top-2.5 left-0 -translate-x-1/2 rounded-[3px] bg-[#C25100] px-1.5 py-0.5 text-[10px] leading-none font-bold tracking-wide text-white">TODAY</span>
        </div>
      </div>

      <!-- Tooltip -->
      <div
        v-show="tip.show"
        class="pointer-events-none absolute z-30 w-max max-w-[260px] -translate-x-1/2 rounded-[4px] bg-jira-text px-3 py-2 text-[12px] leading-snug text-white shadow-lg"
        :class="tip.above ? '-translate-y-full' : ''"
        :style="{ left: `${tip.x}px`, top: `${tip.y}px` }"
        aria-hidden="true"
      >
        <p class="font-semibold">{{ tip.title }}</p>
        <p v-if="tip.role" class="text-white/80">{{ tip.role }}</p>
        <p class="font-mono text-[11px] text-white/80">{{ tip.dates }}</p>
      </div>
    </div>

    <!-- Legend -->
    <div class="flex flex-wrap items-center justify-between gap-3 border-t border-jira-border px-4 py-3 text-[12px] text-jira-subtle md:px-5">
      <div class="flex items-center gap-4">
        <span class="flex items-center gap-1.5"><span class="h-1 w-4 rounded-full bg-jira-done" aria-hidden="true"></span>Done</span>
        <span class="flex items-center gap-1.5"><span class="h-1 w-4 rounded-full bg-jira-progress" aria-hidden="true"></span>In progress</span>
      </div>
      <span class="flex items-center gap-1.5"><span class="h-3 w-0.5 bg-jira-today" aria-hidden="true"></span>Orange line = today</span>
    </div>
  </div>
</template>

<style scoped>
.tl-lane {
  background-image: linear-gradient(to right, var(--color-jira-border) 1px, transparent 1px);
  background-size: calc(100% / var(--q, 8)) 100%;
  background-position: -1px 0;
}
.tl-bar {
  cursor: default;
  transition: filter 0.2s ease;
}
.tl-bar:hover,
.tl-bar:focus-visible {
  filter: brightness(1.08) saturate(1.1);
}
.tl-bar:focus-visible {
  outline: 2px solid var(--color-blue);
}
</style>
