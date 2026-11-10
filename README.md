# Denise Aditya · Portfolio

One-page portfolio built from `PRD.md` with Astro, TypeScript, Tailwind CSS v4, a Vue island (Jira timeline), GSAP + ScrollTrigger and Lenis.

## Run locally

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # type-check + static build into dist/
npm run preview    # serve the production build
```

## Edit content

All copy lives in `src/data/`. Components only render it.

| File | What |
| --- | --- |
| `src/data/profile.ts` | Name, headline, summary, email, LinkedIn, stats |
| `src/data/timeline.ts` | Jira timeline epics and children (`YYYY-MM`; `end: null` = ongoing) |
| `src/data/projects.ts` | Case studies (order = display order) |
| `src/data/experience.ts` | Leadership, skills, education |

## Add images (placeholders swap automatically)

| Slot | Drop the file here (`.jpg`, `.png`, `.webp` or `.avif`) | Size |
| --- | --- | --- |
| Profile photo | `src/assets/profile.jpg` | 800 × 1000 |
| Madana | `src/assets/projects/madana/main`, `jira`, `erd` | 1600 × 1000 |
| Dimas Diajeng | `src/assets/projects/dimas/main`, `admin`, `mobile` | 1600 × 1000 |
| SIMATKUL | `src/assets/projects/simatkul/main`, `usecase`, `srs` | 1600 × 1000 |

Example: `src/assets/projects/madana/main.png`. Restart `npm run dev` if a new file isn't picked up.

**CV:** put the PDF at `public/cv/CV_Denise_Aditya.pdf` (the Download CV buttons point there).

## Deploy (GitHub + Vercel)

1. Create an empty repo on GitHub (e.g. `portfolio`), then:
   ```bash
   git remote add origin https://github.com/<username>/portfolio.git
   git push -u origin main
   ```
2. Go to vercel.com → **Add New… → Project** → import the repo. Vercel detects Astro; keep the defaults (build `npm run build`, output `dist`) and click **Deploy**.
3. After the first deploy, update `site` in `astro.config.mjs` to your real Vercel URL or domain (used for sitemap and Open Graph), commit and push. Every push redeploys automatically.
4. Custom domain: Vercel project → **Settings → Domains** → add `deniseaditya.com` (or `.dev`) and follow the DNS steps.
