# AGENTS.md

## Project overview

- This repository is a Strapi 5 application (`5.40.0`) used as a headless CMS.
- The server side uses TypeScript; the admin panel runs on Strapi's React 18 stack.
- The default local database is SQLite via `better-sqlite3`, stored in `.tmp/data.db`.
- The project is close to Strapi boilerplate: most custom behavior lives in content-type schemas and the seed script, not in custom controllers/services.

## Tooling and runtime

- Use `npm` only. `package-lock.json` is present; do not introduce `yarn` or `pnpm`.
- Required runtime from `package.json`:
  - Node `>=20.0.0 <=24.x.x`
  - npm `>=6.0.0`
- Minimum required environment variables are documented in `.env.example`.
- If you add a new env var, update `.env.example` in the same change.

## Repository map

- `config/`: Strapi runtime configuration (`admin.ts`, `api.ts`, `database.ts`, `middlewares.ts`, `plugins.ts`, `server.ts`).
- `src/index.ts`: global `register` and `bootstrap` hooks. Currently empty.
- `src/api/`: content-types and related `controllers`, `routes`, `services`.
- `src/components/shared/`: shared component schemas used by dynamic zones and SEO fields.
- `src/admin/`: only Strapi example files are present; there is no active admin customization yet.
- `data/data.json`: demo dataset used by the seed script.
- `data/uploads/`: source media used during seeding.
- `scripts/seed.js`: first-run seed script that imports demo data and opens public read permissions.
- `site-preview/`: standalone client-facing preview app built to showcase Strapi content and workflows, using React 19, Tailwind CSS, and Motion React for the animated experience.
- `database/migrations/`: present but currently empty.
- `public/uploads/`: generated uploaded media. Treat as generated output.

## Domain model

- Collection types:
  - `article`
  - `author`
  - `category`
- Single types:
  - `global`
  - `about`
- `article` is the core content model and links to `author` and `category`.
- Dynamic zones rely on shared components:
  - `shared.media`
  - `shared.quote`
  - `shared.rich-text`
  - `shared.seo`
  - `shared.slider`

## Working rules

- Prefer changing Strapi schema/config first. Add custom controller/service/router logic only when schema-level configuration is not enough.
- When editing a content type in `src/api/<name>/content-types/.../schema.json`, also review the matching `controllers/`, `routes/`, and `services/` files in the same API folder.
- Do not assume strict TypeScript guarantees. `tsconfig.json` has `strict: false`.
- Do not treat `src/admin/` as an active extension point unless you explicitly introduce a real admin customization.
- For `site-preview/`, prefer Motion React's declarative primitives (`motion`, `whileInView`, `useScroll`, `useTransform`, `AnimatePresence`) over imperative animation libraries.
- Be careful with the seed flow:
  - `npm run seed:example` uses `scripts/seed.js`
  - it imports from `data/data.json` and `data/uploads/`
  - it is intended for first run and uses Strapi plugin store to prevent blind re-imports
  - it also grants public `find` / `findOne` permissions for the demo APIs
- The default DB is local SQLite, but `config/database.ts` also supports MySQL and PostgreSQL via env vars. Keep new database assumptions portable unless the task is explicitly SQLite-only.

## Commands

- Install dependencies: `npm install`
- Start dev server: `npm run dev`
- Alternate dev command: `npm run develop`
- Build admin: `npm run build`
- Start production mode: `npm run start`
- Open Strapi console: `npm run console`
- Seed demo content: `npm run seed:example`
- Preview frontend install: `cd site-preview && npm install`
- Preview frontend dev: `cd site-preview && npm run dev`
- Preview frontend build: `cd site-preview && npm run build`
- Dry-run Strapi upgrade: `npm run upgrade:dry`

## Verification

- There is no test suite configured in this repository.
- There is no lint or formatter script configured in this repository.
- For any code or config change, the minimum verification is `npm run build`.
- If you touch the preview frontend in `site-preview/`, also run `npm run preview:build`.
- If you change content types, seed logic, permissions, or bootstrapping, also validate behavior with `npm run dev` when feasible.
- If you change seed data or media references, verify that filenames in `data/data.json` and `data/uploads/` still match what `scripts/seed.js` expects.

## Generated and ignored files

- Do not commit `.env`.
- Do not commit `node_modules/`, `dist/`, `build/`, `.tmp/`, or `.strapi/`.
- Do not commit generated files under `public/uploads/` except the tracked `.gitkeep`.
- Treat uploaded media and local SQLite files as environment artifacts unless the task explicitly requires working with them.

## Commit policy

- Use Conventional Commits only.
- Allowed commit types:
  - `feat`
  - `fix`
  - `refactor`
  - `chore`
  - `test`
  - `docs`
  - `style`
  - `perf`
- Commit format: `<type>(optional-scope): short description`
- Before creating any commit:
  - analyze all modified files and the full diff
  - identify logical change groups
  - decide whether the work should be split into multiple commits
  - propose the commit plan and messages
  - ask for confirmation before actually committing
