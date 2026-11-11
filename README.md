# Denise Aditya · Portfolio

One-page portfolio built from `PRD.md` with Astro, TypeScript, Tailwind CSS v4, a Vue island (Jira timeline), GSAP + ScrollTrigger and Lenis.

## Run locally

```bash
npm install
cp .env.example .env   # optional locally; fill in for production
npm run dev            # http://localhost:4321
```

- Public site: http://localhost:4321
- Admin: http://localhost:4321/admin (local login without `.env`: **admin / admin123**)

The first request creates `data/local.db` (SQLite) and fills it with the CV content from `src/data/*.ts`.
To start over from that content, stop the server and delete the `data/` folder.

## How it works

| Part | Where |
| --- | --- |
| Public page (rendered on demand, cached 30 s on Vercel) | `src/pages/index.astro` |
| Admin dashboard (CRUD for every section) | `src/pages/admin/` |
| Login + signed session cookie, login throttling | `src/lib/auth.ts`, `src/middleware.ts` |
| Database (libSQL: SQLite file locally, Turso in production) | `src/lib/db/` |
| Content reads/writes | `src/lib/content/repo.ts` |
| Admin forms (fields, validation) | `src/lib/admin/` |
| Image + PDF uploads (resized to WebP, stored in the DB, served from `/media/<id>`) | `src/lib/media.ts`, `src/pages/media/[id].ts` |
| Seed content (used only when the database is empty) | `src/data/*.ts` |

## Admin

| Page | What you can edit |
| --- | --- |
| Profile & education | Name, headline, summary, email, LinkedIn, profile photo, CV PDF, education card |
| Stats | Number cards under the hero |
| Timeline | Epics and their stories/tasks (pick a parent epic to make a child) |
| Projects | Case studies: text, facts, bullets, tags and the 3 images |
| Experience | Leadership & experience list |
| Skills | Skill chip groups |

Uploads: images up to 4 MB (JPG, PNG, WebP, AVIF), CV as a PDF up to 4 MB.

## Deploy (GitHub + Vercel + Turso)

1. **Database:** create a free account at https://turso.tech, create a database, then copy its URL (`libsql://…`) and create a token.
2. **Vercel:** https://vercel.com/new → import the repo. Before deploying, open **Environment Variables** and add:

   | Name | Value |
   | --- | --- |
   | `ADMIN_USERNAME` | your admin username |
   | `ADMIN_PASSWORD` | a long password |
   | `SESSION_SECRET` | random string, 32+ characters (`openssl rand -hex 32`) |
   | `TURSO_DATABASE_URL` | `libsql://…` from Turso |
   | `TURSO_AUTH_TOKEN` | the Turso token |

3. Click **Deploy**. The first visit creates the tables and seeds the content. Log in at `/admin`.
4. Update `site` in `astro.config.mjs` to your real URL or domain (used for sitemap and Open Graph), commit and push.

In production the admin login stays disabled until the three admin variables are set; the local `admin / admin123` fallback never applies there.
