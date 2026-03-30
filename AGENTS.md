# AGENTS.md

## Project overview

- This repository is a Strapi 5 application (`5.40.0`) used as a headless CMS.
- The server side uses TypeScript; the admin panel runs on Strapi's React 18 stack.
- The default local database is SQLite via `better-sqlite3`, stored in `.tmp/data.db`.
- The project is still mostly close to Strapi boilerplate, but it now also includes custom admin dashboard pages for external data demos (currently Frankfurter and OpenSky).

## Tooling and runtime

- Use `npm` only. `package-lock.json` is present; do not introduce `yarn` or `pnpm`.
- Required runtime from `package.json`:
  - Node `>=20.0.0 <=24.x.x`
  - npm `>=6.0.0`
- Minimum required environment variables are documented in `.env.example`.
- If you add a new env var, update `.env.example` in the same change.

## Repository map

- `config/`: Strapi runtime configuration (`admin.ts`, `api.ts`, `database.ts`, `middlewares.ts`, `plugins.ts`, `server.ts`).
- `src/index.ts`: global `register` and `bootstrap` hooks. Used to register custom admin permission actions and refresh Super Admin permissions when admin-only actions are added.
- `src/api/`: content-types and related `controllers`, `routes`, `services`.
- `src/components/shared/`: shared component schemas used by dynamic zones and SEO fields.
- `src/admin/`: active Strapi admin customization entrypoint for custom pages and menu links.
- `src/frankfurter-permissions.ts`: shared constants for admin-only permission ids/actions used by the custom dashboard.
- `src/open-sky-permissions.ts`: shared constants for the OpenSky admin permission action used by the flight tracking dashboard.
- `src/policies/`: global Strapi policies, including admin-token protection for custom routes consumed by admin-only dashboards.
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
- `src/admin/` is now an active extension point. Keep admin additions small, focused, and aligned with Strapi design-system/layout primitives.
- When adding an admin-only page, prefer registering a real admin permission action and wiring both the menu link and the page route to the same permission check.
- If you register new admin permission actions in `src/index.ts`, also ensure the Super Admin role is refreshed so it automatically inherits them.
- For charting in the admin, prefer the existing `recharts` dependency rather than adding a second charting library.
- For `site-preview/`, prefer Motion React's declarative primitives (`motion`, `whileInView`, `useScroll`, `useTransform`, `AnimatePresence`) over imperative animation libraries.
- Only when modifying the `site-preview` interface, first check whether an existing reusable component in `site-preview/src/components/` or `site-preview/COMPONENTS.md` already fits the change.
- Only when modifying the `site-preview` interface, if you create a new component you must document it in `site-preview/COMPONENTS.md` in the same change.
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
- If you change content types, seed logic, permissions, bootstrapping, or admin permission registration, also validate behavior with `npm run dev` when feasible.
- If you change admin-only permissions or custom admin pages, verify both that the page renders and that role-based visibility still behaves correctly for Super Admin and restricted roles.
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
