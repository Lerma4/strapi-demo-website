# Demo Website

This repository contains a Strapi 5 project used as a demo CMS plus a separate client-facing preview frontend.

The goal of the project is twofold:
- manage structured content in Strapi
- show that content through a polished preview site suitable for demos, stakeholder reviews, and client-facing walkthroughs

## Stack

- Backend CMS: Strapi `5.40.0`
- Backend language: TypeScript
- Default local database: SQLite in `.tmp/data.db`
- Preview frontend: React + Vite + Tailwind CSS + Motion React in `site-preview/`

## Repository structure

- `config/`: Strapi runtime configuration
- `src/api/`: content-types and custom API routes/controllers
- `src/components/`: shared Strapi components
- `scripts/seed.js`: seed script for demo data
- `data/data.json`: seed dataset
- `site-preview/`: public-facing preview frontend
- `TECH_STACK.md`: concise technical inventory
- `AGENTS.md`: repo-specific operating guidance for coding agents

## How the project is meant to be used

This repository is not just a plain Strapi starter. It is structured around two parallel use cases:

- editors and stakeholders manage content in Strapi admin
- clients and internal reviewers see that content through the branded preview frontend

That means there are two different layers to understand:

- Strapi controls structured content, publishing state, media, and API exposure
- `site-preview/` controls the visual presentation, Motion-based animation system, layout, and article preview experience

In practice:

- if you want to change text, categories, authors, or article content, use Strapi
- if you want to change the look and feel of the site, edit the frontend code

## Content model

This demo uses the following content types:

- `Article`: draft/publish enabled, used by the live archive and native preview flow
- `Author`
- `Category`
- `About`
- `Global`

Shared blocks:

- `shared.rich-text`
- `shared.quote`
- `shared.media`
- `shared.slider`
- `shared.seo`

## Quick start

### 1. Install backend dependencies

```bash
npm install
```

### 2. Install preview frontend dependencies

```bash
npm run preview:install
```

### 3. Start Strapi

```bash
npm run dev
```

Strapi admin will be available at:

- [http://localhost:1337/admin](http://localhost:1337/admin)

### 4. Start the preview frontend

In a second terminal:

```bash
npm run preview:dev
```

The preview site will be available at:

- [http://localhost:4173](http://localhost:4173)

## Environment variables

See `.env.example` for the minimum required variables.

Important preview-related variables:

- `PREVIEW_URL`: frontend URL used by Strapi native preview
- `PREVIEW_SECRET`: signing secret for draft preview bridge

If you change these values, restart Strapi.

## Demo data and seed

This repository includes a demo dataset in `data/data.json`.

Load it with:

```bash
npm run seed:example
```

Important behavior:

- the seed is intended for first run
- it uses Strapi plugin store to avoid blind re-imports
- it configures public read access for the demo APIs

If your local database already contains old content, reseeding may require a clean database.

## Preview modes

There are two different preview experiences in this project.

### 1. Custom public preview site

The app in `site-preview/` fetches public Strapi APIs and renders a styled frontend for demos.

What updates live in the preview:

- `Global`: site name and description
- `About`: manifesto/about section
- `Category`: archive filters
- `Article`: live archive, when published articles exist

Behavior to know:

- if no published articles are available, the archive falls back to built-in demo content
- `Global`, `About`, and `Category` still render from live Strapi data when available

### 2. Native Strapi preview for Articles

Strapi's Preview feature is configured for `Article`.

What it does:

- generates a signed preview URL from the article editor
- opens the frontend preview
- loads the selected article through a secure preview bridge
- supports draft preview for saved articles

Constraints:

- the article must already be saved once, so Strapi has a `documentId`
- if Strapi is restarted with a different `PREVIEW_SECRET`, old preview URLs become invalid

## Content flow

The main content flow is:

1. editors create or update content in Strapi admin
2. Strapi stores it in the local database
3. public APIs expose published content
4. the preview frontend consumes those APIs for the public demo site
5. the native preview bridge can fetch a draft article directly for editor preview

This is the practical effect of that flow:

- `Global`, `About`, and `Category` are visible on the public preview as soon as their content is saved
- `Article` appears in the public archive only when published
- `Article` can still be previewed in draft mode from the Strapi editor through the native preview integration

If the archive looks populated but does not match Strapi content, you are likely seeing fallback demo articles because no published articles are currently available from `/api/articles`

## How to verify content changes

### Global/About changes

1. Open Strapi admin
2. Edit `Global` or `About`
3. Save
4. Refresh [http://localhost:4173](http://localhost:4173)

### Article changes in the public archive

1. Open an `Article`
2. Save
3. Publish
4. Refresh [http://localhost:4173](http://localhost:4173)

Note: the archive reads published articles from the public API. Draft-only articles do not appear there.

### Article draft preview from Strapi editor

1. Open an existing article in Strapi admin
2. Save it if needed
3. Use Strapi Preview from the editor
4. The frontend opens with the article loaded through preview mode

## What you can change from Strapi

You can safely demonstrate these areas from the admin panel:

- `Global`: site name and descriptive copy used by the preview
- `About`: manifesto/about section content
- `Category`: article grouping and archive filters
- `Author`: article attribution
- `Article`: cards, modal details, and draft preview content

You should not expect Strapi to change:

- layout
- typography
- colors
- motion
- component behavior

Those parts live in `site-preview/`.

## Troubleshooting

### I changed content in Strapi but the preview did not change

Check these in order:

1. the entry was saved
2. the browser was refreshed
3. for `Article`, the entry was published if you expect it in the public archive
4. Strapi is running on `http://localhost:1337`
5. the preview frontend is running on `http://localhost:4173`

### I still see stock articles in the archive

That means the public API is not returning published articles yet. The preview intentionally falls back to built-in demo archive items when `/api/articles` is empty.

### Strapi Preview opens the setup page instead of the frontend

Restart Strapi after changing preview configuration or environment variables. The preview handler is loaded at server startup.

### Draft preview opens the frontend but not the selected article

Make sure the article has been saved at least once. Native preview requires a valid `documentId`.

## Build checks

Backend build:

```bash
npm run build
```

Preview frontend build:

```bash
npm run preview:build
```

## Notes for local work

- `site-preview/node_modules/` is local-only and ignored by git
- `site-preview/dist/` is generated output and ignored by git
- `.tmp/`, `build/`, `dist/`, `.strapi/`, and `types/` are generated artifacts
- `.env` and local environment overrides are ignored by git

## Project status

This is a demo repository, not a production-ready starter.

The codebase is intentionally optimized for:

- showing Strapi features clearly
- experimenting with structured content
- demoing a client-facing preview experience
