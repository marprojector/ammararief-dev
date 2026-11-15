# Portfolio

A portfolio rendered as a desktop: profile, projects, experience, tech stack, notes, terminal and contact as windows on a macOS-style surface. Built with React 19, TypeScript, Vite 7 and Tailwind 4.

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build into dist/
npm run preview  # serve the built output
```

## Content

All copy and data live in `public/data/` — no rebuild needed when you edit them:

| File | Holds |
| --- | --- |
| `profile.json` | name, nickname, role, description, contact details |
| `projects.json` | every project card, its screenshot and links |
| `work.json` | employment history, linked to project ids |
| `stack.json` | technology categories shown in the Tech Stack window |
| `sosials.json` | social links on the Contact window |
| `i18n/id.json` | Indonesian translations, keyed by id; missing keys fall back to English |

Screenshots go in `public/assets/` (and a 960px `.webp` copy in `public/assets/webp/`). A project without an `image` falls back to a coloured tile with its initials, so empty entries never render broken.

## Which apps appear

`.env.example` lists the flags. Copy it to `.env.local` and edit, or set them as GitHub repository variables (`Settings → Secrets and variables → Actions → Variables`) for the deployed build.

## Deploy

`.github/workflows/deploy.yml` builds and publishes to GitHub Pages on every push to `main`. Enable it once under `Settings → Pages → Source: GitHub Actions`.

The Spotify app needs a PHP host for `public/api/spotify.php`; GitHub Pages cannot run PHP, so it stays off by default (`VITE_SHOW_SPOTIFY=false`).
