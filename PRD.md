# PRD Web Portfolio Denise Aditya

Nov 10, 2026 · @Denise Aditya

## How to use this PRD

Save this doc as `PRD.md` in the root of an empty folder, open Claude Code there, and build one phase at a time from the Build phases section. Do not ask Claude Code to build everything in one prompt.

1. Export this doc as Markdown and save it as `PRD.md` in the project folder.
2. Put the CV PDF at `public/cv/CV_Denise_Aditya.pdf` and any project screenshots in `src/assets/projects/`.
3. Start Claude Code and send: *"Read PRD.md fully. Then do Phase 1 only. Stop when Phase 1's acceptance criteria pass and tell me what you did."*
4. Check the result in the browser (`npm run dev`), commit, then send the next phase's prompt.
5. If something looks off, describe what you see and point to the PRD section it breaks.

The PRD is the single source of truth. Any copy, color or date here wins over Claude Code's own guesses.

## Overview

A one-page personal portfolio for Denise Aditya, a Software Engineering Technology student at Universitas Gadjah Mada, positioned as a Project Manager and System Analyst looking for an internship. The signature feature is a Jira-style timeline that shows projects and leadership roles as epics on a roadmap.

**Goals**

- A recruiter understands who Denise is and what she does within 10 seconds of landing.
- Each case study shows proof of PM and system analysis work: role, team size, deliverables (BRD, SRS, ERD, UAT) and screenshots.
- Scrolling feels alive but calm: every section enters with a purposeful animation, never flashy.
- New projects can be added by editing a data file, not page markup.

**Audience**

- Recruiters and HR screening internship candidates (mostly on phone, often via a LinkedIn link).
- Engineering leads and PMs checking depth of process work.

**Success criteria**

- Lighthouse scores of 90+ for Performance, Accessibility, Best Practices and SEO on mobile.
- Page fully usable at 360 px width with no horizontal page scroll.
- All content matches the CV exactly; nothing invented.

## Tech stack and project structure

Build with Astro, TypeScript and Tailwind CSS, animate with GSAP, and deploy to Vercel. Use the latest stable version of each package.

| Layer | Choice | Why |
| --- | --- | --- |
| Framework | Astro (static output) | Mostly static content, fast load, good SEO |
| Language | TypeScript | Typed data files catch wrong dates and missing fields |
| Styling | Tailwind CSS | Design tokens in one place, fast to build |
| Interactive islands | Vue (via `@astrojs/vue`) | Denise already knows Vue; used only where state is needed |
| Scroll animation | GSAP + ScrollTrigger | Reliable scroll-linked animation |
| Smooth scroll | Lenis | Calm, smooth scrolling synced with ScrollTrigger |
| Images | Astro `<Image>` (`astro:assets`) | Automatic resize, WebP/AVIF, lazy loading |
| Fonts | Fontsource packages | Self-hosted, no layout shift |
| Hosting | Vercel, connected to GitHub | Auto deploy on every push |

```
portfolio/
├─ PRD.md
├─ public/
│  ├─ cv/CV_Denise_Aditya.pdf
│  └─ og-image.png
├─ src/
│  ├─ assets/
│  │  ├─ profile.jpg
│  │  └─ projects/            # screenshots, one folder per project
│  ├─ data/
│  │  ├─ profile.ts           # name, summary, links, stats
│  │  ├─ timeline.ts          # epics, children, dates, status
│  │  ├─ projects.ts          # case studies
│  │  └─ experience.ts        # leadership, skills, education
│  ├─ components/
│  │  ├─ Navbar.astro
│  │  ├─ Hero.astro
│  │  ├─ StatCard.astro
│  │  ├─ JiraTimeline.vue     # island: expand/collapse, tooltips
│  │  ├─ ProjectCase.astro
│  │  ├─ ImageSlot.astro      # real image or styled placeholder
│  │  ├─ About.astro
│  │  ├─ Contact.astro
│  │  └─ SectionLabel.astro
│  ├─ scripts/animations.ts   # all GSAP + Lenis setup
│  ├─ styles/global.css       # Tailwind + tokens + patterns
│  ├─ layouts/Base.astro
│  └─ pages/index.astro
└─ astro.config.mjs
```

## Design system

The site is black, white and one blue, with Jira's own palette used only inside the timeline board. Match these values exactly; define them once as Tailwind theme tokens.

**Site colors**

| Token | Hex | Use |
| --- | --- | --- |
| `ink` | #0A0A0A | Headings, primary buttons, dark sections |
| `paper` | #FFFFFF | Page background, cards |
| `blue` | #2563EB | Accent, primary CTA, section labels |
| `blue-dark` | #1D4ED8 | Blue text on light blue, hover |
| `blue-soft` | #EFF4FF | Chips, placeholder fills |
| `blue-light` | #93B4FF | Blue text on black |
| `muted` | #525252 | Secondary text (passes 4.5:1 on white) |
| `line` | #E5E5E5 | Borders, dividers |
| `mist` | #F4F7FB | Timeline section background |

**Jira board colors (timeline only)**

| Token | Hex | Use |
| --- | --- | --- |
| `jira-text` | #172B4D | Board text |
| `jira-subtle` | #44546F | Keys, header labels |
| `jira-border` | #DFE1E6 | Board borders |
| `jira-row` | #F7F8F9 | Header and group rows |
| `jira-epic-icon` | #6E5DC6 | Epic icon |
| `jira-done` | #22A06B | Done progress, story icon |
| `jira-progress` | #1D7AFC | In-progress progress, task icon |
| `jira-today` | #E56910 | TODAY line |
| Epic bar colors | #6E5DC6, #1D7AFC, #2898BD, #E2B203, #E774BB, #22A06B, #8F7EE7 | One per epic |
| Lozenge Done | bg #DCFFF1, text #216E4E | Status pill |
| Lozenge In progress | bg #E9F2FF, text #0055CC | Status pill |
| Lozenge To do | bg #DCDFE4, text #44546F | Status pill |

**Typography**

| Role | Font | Size and weight |
| --- | --- | --- |
| Display headings | Space Grotesk | Hero h1 clamp(40px, 5.6vw, 72px) / 700, letter-spacing -0.035em; section h2 44px / 600 |
| Body | Inter | 16px / 400, line-height 1.6; lead text 19px |
| Labels, keys, dates | JetBrains Mono | 13px / 500 (section labels like `01 / ROADMAP`) |

**Layout**

- Content max width 1200px, side gutter 24px, section vertical padding 96px.
- Radius: buttons 8px, cards 12–14px, pills 999px.
- Touch targets at least 44px tall.

**Backgrounds (never plain white)**

- Hero: dot grid (`#D5DCE8` 1.2px dots every 22px) plus a soft blue radial glow at top right.
- Timeline section: faint blue line grid every 40px on `mist`.
- About section: dot grid on #FAFBFD with a faint blue glow at top left.
- Contact: black with a blue radial glow at top right and a faint white line grid every 48px.
- Image placeholders: dashed blue border on a light blue dot grid.

## Content and data model

All copy lives in `src/data/*.ts` and comes from Denise's CV; components only render it. Dates are `YYYY-MM` strings; `end: null` means ongoing and renders as "present".

**Profile** (`profile.ts`)

- Name: Denise Aditya
- Badge: Open to internship · Yogyakarta, Indonesia
- Headline: Project Manager who ships on *schedule*. ("schedule" in blue)
- Summary: Software Engineering Technology student at Universitas Gadjah Mada. I lead web projects from requirement gathering to deployment, and write the BRD, SRS, ERD and UAT that keep teams aligned.
- Email: denisaditya55@gmail.com
- LinkedIn: https://www.linkedin.com/in/denise-aditya-3327
- CV: `/cv/CV_Denise_Aditya.pdf`
- Phone number: not shown on the site.

**Stats**

| Value | Label |
| --- | --- |
| 3 | Web projects led & analyzed |
| 70 | Members led as ASSETS Chairperson |
| 20 | Students mentored as TA |
| 3.63 | GPA · Universitas Gadjah Mada |

**Timeline types and data** (`timeline.ts`)

```ts
export type Status = 'done' | 'in-progress' | 'todo';
export interface TimelineItem {
  key: string;            // e.g. 'PRJ-2'
  title: string;
  group: 'projects' | 'leadership';
  start: string;          // 'YYYY-MM'
  end: string | null;     // null = ongoing
  status: Status;
  color: string;          // epic bar color
  children?: { key: string; title: string; type: 'story' | 'task'; start: string; end: string; status: Status }[];
}

export const range = { start: '2025-01', end: '2026-12' }; // 8 quarters

export const timeline: TimelineItem[] = [
  { key: 'PRJ-1', title: 'Dimas Diajeng Sleman', group: 'projects', start: '2025-09', end: '2025-11', status: 'done', color: '#6E5DC6' },
  { key: 'PRJ-2', title: 'Madana Innotech Website', group: 'projects', start: '2026-01', end: '2026-06', status: 'done', color: '#1D7AFC',
    children: [ // sub-phase dates are estimates, confirm with Denise
      { key: 'PRJ-21', title: 'Requirement gathering', type: 'story', start: '2026-01', end: '2026-01', status: 'done' },
      { key: 'PRJ-22', title: 'BRD, SRS, ERD & diagrams', type: 'task', start: '2026-01', end: '2026-03', status: 'done' },
      { key: 'PRJ-23', title: 'Sprint development', type: 'task', start: '2026-02', end: '2026-05', status: 'done' },
      { key: 'PRJ-24', title: 'UAT & deployment', type: 'task', start: '2026-06', end: '2026-06', status: 'done' },
    ] },
  { key: 'PRJ-3', title: 'SIMATKUL', group: 'projects', start: '2026-08', end: null, status: 'in-progress', color: '#2898BD' },
  { key: 'ORG-1', title: 'Tech Enthusiast Day 2025', group: 'leadership', start: '2025-05', end: '2025-12', status: 'done', color: '#E2B203' },
  { key: 'ORG-2', title: 'Liga TRPL 2025', group: 'leadership', start: '2025-07', end: '2025-12', status: 'done', color: '#E774BB' },
  { key: 'ORG-3', title: 'ASSETS Chairperson', group: 'leadership', start: '2026-04', end: null, status: 'in-progress', color: '#22A06B' },
  { key: 'ORG-4', title: 'Teaching Assistant, PAD', group: 'leadership', start: '2026-08', end: null, status: 'in-progress', color: '#8F7EE7' },
];
```

**Case studies** (`projects.ts`, in this display order)

| Key | Project | Dates | Role | Facts row | Bullets | Tags | Image slots |
| --- | --- | --- | --- | --- | --- | --- | --- |
| PRJ-2 | Madana Innotech (company profile website) | Jan – Jun 2026 · Yogyakarta | Project Manager | Team: 4 members · Method: Agile, sprints in Jira | Planned the project timeline and managed sprint tasks in Jira to keep delivery on schedule. / Authored the BRD, SRS, ERD, Use Case & Activity Diagrams and UAT. | Jira, BRD, SRS, ERD, UAT | Homepage (main), Jira board / sprint, ERD / use case |
| PRJ-1 | Dimas Diajeng Sleman (company profile website) | Sep – Nov 2025 · Yogyakarta | Project Manager & Front End Dev | Scope: Requirements to deployment · Stack: Laravel, MySQL | Led the development end to end while building the homepage and admin dashboard myself. / Authored the BRD, SRS, ERD, Use Case & Activity Diagrams and UAT. | Laravel, MySQL, SRS, UAT | Homepage (main), Admin dashboard, Mobile view |
| PRJ-3 | SIMATKUL (course scheduling information system) | Aug 2026 – present | System Analyst | Dev team: 7 members · Users: Department lecturers | Turned lecturer interviews into functional and non-functional specifications. / Designed the ERD, Use Case and Activity Diagrams for the scheduling data and processes. / Wrote the SRS, BRD and UAT scenarios the 7-person dev team builds against. | SRS, BRD, ERD, Use Case, UAT | ERD or system flow (main), Use case diagram, SRS / UAT preview |

**Leadership & experience** (`experience.ts`)

| Role · Organization | Dates | One line |
| --- | --- | --- |
| Chairperson · ASSETS | Apr 2026 – now | Leading 70 members across 7 divisions, running SERIES and ORBIT. |
| Teaching Assistant · Proyek Aplikasi Dasar, UGM | Aug 2026 – now | Mentoring 4 groups (20 students) on planning, documentation and delivery. |
| Research & Data Analysis · BEM KM UGM | Nov 2025 – now | Scraped 5,000+ public comments and ran sentiment analysis for policy studies. |
| General Coordinator · Liga TRPL 2025 | Jul – Dec 2025 | Coordinated logistics, event, publication, sponsorship and liaison divisions. |
| Event Coordinator · Tech Enthusiast Day 2025 | May – Dec 2025 | Recruited the event team, built the timeline and rundown for a large IT competition. |

**Skills**

- Project management: Agile, Sprint Planning, Jira, ClickUp, Notion, Qase
- System analysis: BRD, SRS, ERD, Use Case, Activity Diagram, UAT
- Development & data: Laravel, PHP, MySQL, Vue.js, JavaScript, Python, Pandas

**Education**: Universitas Gadjah Mada, Software Engineering Technology, GPA 3.63 / 4.00, 2024–2028.

## Page sections

One page, six sections in this order, each with an anchor id for the nav.

1. **Navbar** (sticky)
   - Left: "Denise Aditya." with the dot in blue, links to top.
   - Right: Timeline, Projects, About links, plus a black "Contact Me" button.
   - Transparent at top; after 40px of scroll, white at 80% opacity with backdrop blur and a bottom border.
   - The link for the section in view turns blue.
   - Under 768px: links collapse into a menu button that opens a full-width panel.
2. **Hero** (`#top`)
   - Two columns on desktop: text (60%) and profile photo slot (40%, 4:5, max 420px); stacks on mobile with photo below.
   - Badge pill, h1, summary, buttons "See Projects" (blue, links `#projects`) and "Download CV" (outlined, downloads the PDF).
   - Four stat cards in a row below (wrap to 2×2 on mobile); the last card is black with the value in `blue-light`.
3. **Timeline** (`#timeline`)
   - Section label `01 / ROADMAP`, h2 "My 2025–2026 timeline", one line of intro.
   - A white Jira-style board card: breadcrumb "Projects / Denise Aditya / Timeline", title "Timeline", a non-functional search box, and a Weeks / Months / Quarters toggle with Quarters active.
   - Grid: a 300px left column (chevron, epic icon, key, title, status lozenge when in progress) and a right area of 8 quarter columns (Q1 2025 – Q4 2026) with the current quarter's header in Jira blue.
   - Rows are grouped under "WEB PROJECTS · 3" and "LEADERSHIP & EVENTS · 4" group rows.
   - Bar position and width are computed from `start`/`end` against `range` at month precision; `end: null` runs to today.
   - Each epic bar (22px tall) has a 4px progress strip under it: green when done, blue when in progress.
   - Epics with `children` toggle open/closed on click; Madana is open by default. Child rows indent 32px and show a story or task icon and a status lozenge.
   - An orange TODAY line, computed from the real current date, with a small "TODAY" tag at the top.
   - Hovering or focusing a bar shows a tooltip: title, role, dates.
   - Legend footer: Done, In progress, "Orange line = today".
   - Under 1040px the board scrolls horizontally inside its card; the page itself never scrolls sideways.
4. **Projects** (`#projects`)
   - Label `02 / CASE STUDIES`, h2 "Selected projects".
   - Each case study is a row: gallery (1 main 16:10 image + 2 smaller 16:10 images in a 2-column grid) and text column. Layout alternates image-left, image-right.
   - Text column: key chip, dates, h3, one-line description, facts rows (label left, value right), bullets, tag pills.
   - Clicking any image opens a lightbox with keyboard navigation (←, →, Esc).
   - `ImageSlot` renders the real image when a file exists, otherwise the styled placeholder with its label and recommended size (1600 × 1000 px). The main slot rotates style per project: light blue, black, solid blue.
5. **About** (`#about`)
   - Label `03 / ABOUT`, h2 "Beyond the projects".
   - Left card (60%): leadership & experience list with role, mono date, one line.
   - Right column (40%): skills card with three chip groups, and a black education card.
6. **Contact** (`#contact`)
   - Label `04 / CONTACT`, h2 "Looking for an intern who keeps projects on track?", one line on open roles.
   - Buttons: email (blue, `mailto:`), LinkedIn, Download CV (PDF). External links open in a new tab.
   - Footer row: "© 2026 Denise Aditya" and "Planned in sprints, shipped on time."

## Scroll animations and interactions

Every section enters with its own motion so scrolling never feels flat, but each animation is short (0.4–0.9s), eased with `power3.out`, and plays once. All motion lives in `src/scripts/animations.ts`.

| Where | Trigger | Animation |
| --- | --- | --- |
| Whole page | Load | Lenis smooth scroll, synced to ScrollTrigger; anchor links scroll smoothly with a 72px offset for the navbar |
| Hero h1 | Load | Lines rise 40px and fade in, 0.08s stagger |
| Hero badge, summary, buttons | Load | Fade up after the h1, 0.1s stagger |
| Hero photo | Load, then scroll | Scales from 0.95 to 1 on load; slight parallax (moves 40px slower) while scrolling past |
| Hero glow | Mouse move (desktop) | Blue glow drifts toward the cursor, max 60px |
| Stat cards | Enter view | Numbers count up from 0 (3.63 keeps 2 decimals) over 1.2s |
| Section labels (`01 / ROADMAP`…) | Enter view | Typed out letter by letter with a blinking cursor that disappears after |
| Section h2 | Enter view | Clip-reveal from bottom |
| Jira board | Enter view | Card fades up; rows appear top to bottom (0.05s stagger); each epic bar grows from its left edge (`scaleX` 0 → 1, origin left); progress strips fill after; TODAY line draws top to bottom last |
| Jira epic toggle | Click | Children rows expand/collapse with height animation, chevron rotates 90° |
| Case study rows | Enter view | Gallery slides in from its side (left or right, matching layout) by 60px; text column fades up with stagger |
| Case study main image | Scroll | Subtle parallax inside its frame (image 10% taller than frame) |
| Case study images | Hover | Lift 4px, shadow grows, image zooms to 1.03 |
| About cards | Enter view | Fade up; experience items stagger in; skill chips pop in (scale 0.9 → 1) |
| Contact | Enter view | h2 words rise in; blue glow slowly pulses (opacity 0.35 ↔ 0.5, 6s loop) |
| Buttons | Hover | Primary button lifts 2px; arrow icons nudge 4px right |

**Rules**

- `prefers-reduced-motion: reduce` → no Lenis, no parallax, no count-up (show final numbers), all elements visible immediately.
- Content must be visible if JavaScript fails: set hidden starting states from JS, never in the CSS of the content itself.
- Animate only `transform` and `opacity` (plus `clip-path` for the h2 reveal) to keep 60fps.
- Parallax and cursor effects are desktop only (min-width 1024px and a fine pointer).

## Non-functional requirements

The site must work well on a mid-range phone over 4G, since most recruiters open it from LinkedIn on mobile.

**Responsive**

- Breakpoints: 360px (min supported), 768px, 1024px, 1280px.
- Build mobile first; no horizontal page scroll at any width.
- Two-column layouts stack below 768px; case study galleries always sit above the text on mobile.

**Accessibility**

- Semantic landmarks: `header`, `nav`, `main`, `section` with headings in order (one h1).
- Text contrast at least 4.5:1, including small grey labels.
- Real `<button>` for the epic toggle with `aria-expanded`; real `<a>` for links.
- Visible focus ring (2px blue outline, 2px offset) on every interactive element.
- Every image has meaningful `alt` text; decorative SVGs get `aria-hidden="true"`.
- Timeline bars are keyboard focusable and expose their title and dates to screen readers.
- Lightbox traps focus and closes on Esc.

**Performance**

- Lighthouse mobile Performance 90+; LCP under 2.5s, CLS under 0.1.
- Images through `astro:assets`, WebP/AVIF, lazy loaded below the fold, explicit width and height.
- Self-hosted fonts with `font-display: swap`, only the weights used (Inter 400/500/600, Space Grotesk 500/600/700, JetBrains Mono 500).
- Only the timeline island ships Vue; load it with `client:visible`.

**SEO and sharing**

- Title: "Denise Aditya · Project Manager & System Analyst".
- Meta description from the hero summary.
- Open Graph and Twitter card tags with a 1200 × 630 `og-image.png`.
- Favicon and `sitemap` via `@astrojs/sitemap`; `lang="en"` on `<html>`.

## Build phases

Seven phases, each ending in something you can see in the browser and commit. Paste each prompt into Claude Code only after the previous phase passes.

### Phase 1 — Setup and design tokens

```text
Read PRD.md fully. Do Phase 1 only.
Create an Astro + TypeScript project in this folder with Tailwind CSS, @astrojs/vue, @astrojs/sitemap, GSAP and Lenis.
Add the site and Jira color tokens, the three fonts (Fontsource, only the listed weights), layout widths and the background patterns from the Design system section as Tailwind theme values and utility classes in src/styles/global.css.
Create layouts/Base.astro with meta tags from the SEO section and an empty pages/index.astro with the six section anchors.
Initialise git with a sensible .gitignore. Stop and summarise.
```

Done when: `npm run dev` shows a blank page with correct fonts loaded, no console errors, and the tokens are usable as classes (e.g. `bg-ink`, `text-blue`).

### Phase 2 — Data files

```text
Do Phase 2 only. Create src/data/profile.ts, timeline.ts, projects.ts and experience.ts with the exact types and content from the Content and data model section. Do not invent or reword any content. Add a small helper in src/lib/dates.ts to convert 'YYYY-MM' to month indexes and format ranges like 'Jan – Jun 2026' and 'Aug 2026 – present'.
```

Done when: `npx astro check` passes with no type errors.

### Phase 3 — Static layout: Navbar, Hero, About, Contact

```text
Do Phase 3 only. Build Navbar, Hero (with StatCard and the profile ImageSlot), About and Contact exactly as specified in Page sections, using data from src/data. Include the mobile menu. No animations yet.
```

Done when: these four sections match the design at 1440px and 375px wide, and the Download CV button downloads the PDF.

### Phase 4 — Case studies with image slots

```text
Do Phase 4 only. Build ProjectCase and ImageSlot. ImageSlot shows the real image from src/assets/projects/<project>/ when the file exists, otherwise the styled placeholder with label and recommended size. Render the three case studies in order with alternating layout. Add an accessible lightbox for real images.
```

Done when: placeholders show for missing images, a dropped-in test image replaces its placeholder automatically, and the lightbox works with keyboard only.

### Phase 5 — Jira timeline

```text
Do Phase 5 only. Build JiraTimeline.vue as a client:visible island from src/data/timeline.ts following the Timeline spec in Page sections and the Jira colors in Design system. Compute every bar's position and width from dates; compute the TODAY line from the real current date. Implement epic expand/collapse and bar tooltips with keyboard support.
```

Done when: changing a date in timeline.ts moves the bar correctly, Madana opens and closes, and the board scrolls inside its card on a 375px screen.

### Phase 6 — Scroll animations

```text
Do Phase 6 only. Implement every row of the Scroll animations table in src/scripts/animations.ts using GSAP, ScrollTrigger and Lenis, following all the Rules under it, including prefers-reduced-motion and no-JS visibility.
```

Done when: each section animates once on scroll, the page is fully readable with reduced motion on, and Chrome DevTools Performance shows no long frames while scrolling.

### Phase 7 — Polish and deploy

```text
Do Phase 7 only. Run Lighthouse on mobile and fix everything below the targets in Non-functional requirements. Check every accessibility item. Add favicon and og-image placeholder. Then give me step-by-step instructions to push to GitHub and deploy on Vercel.
```

Done when: all four Lighthouse scores are 90+ on mobile and the site is live on a Vercel URL.

## Out of scope and open items

Version 1 is a single static page with no backend.

**Out of scope for v1**

- Separate case study pages per project (cards link to their section for now).
- Contact form, blog, CMS, dark mode, Indonesian language version.
- Analytics beyond Vercel's built-in option.

**Open items for Denise**

- [ ] Confirm the Madana sub-phase dates in `timeline.ts` (currently estimates).
- [ ] Add a profile photo (800 × 1000 px).
- [ ] Add 3 images per project (1600 × 1000 px) into `src/assets/projects/<project>/`.
- [ ] Put the CV PDF in `public/cv/`.
- [ ] Choose and buy a domain (e.g. deniseaditya.com or .dev).
