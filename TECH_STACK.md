# TECH_STACK.md

## Backend CMS

- Strapi `5.40.0`
- Node.js `>=20.0.0 <=24.x.x`
- npm `>=6.0.0`
- TypeScript `^5`
- Default database: SQLite via `better-sqlite3`

## Preview frontend

- React `^19.0.0`
- React DOM `^19.0.0`
- Vite `^5.4.21`
- Tailwind CSS `3.4.17`
- Motion `^12.38.0` (`motion/react`)
- Lucide React `^0.468.0`

## Repository layout

- `src/`: Strapi APIs, components and bootstrap
- `config/`: Strapi runtime configuration
- `scripts/seed.js`: demo seed import
- `data/data.json`: generic company demo dataset
- `site-preview/`: client-facing preview app consuming Strapi APIs

## Commands

- Backend dev: `npm run dev`
- Backend build: `npm run build`
- Seed demo data: `npm run seed:example`
- Preview install: `cd site-preview && npm install`
- Preview dev: `cd site-preview && npm run dev`
- Preview build: `cd site-preview && npm run build`

## Notes

- The preview frontend is intentionally separate from Strapi admin and public assets.
- The preview app reads Strapi live data when available and falls back to generic demo content if the CMS is empty or unavailable.
