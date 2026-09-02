# Dikshant Yadav — Monorepo

A full-stack monorepo powering the personal portfolio ecosystem at **dikshantyadav.in**. It bundles a public portfolio site, a content-rich blog, a works/projects showcase, an admin content-management system, and a Fastify + Prisma API — all managed as a single npm-workspaces + Turborepo-style repository.

## Apps

| Path | Stack | Description | Dev port |
|------|-------|-------------|----------|
| [`apps/main-web`](apps/main-web) | Vite + React 18 | Public landing / portfolio site | 5173 |
| [`apps/work-web`](apps/work-web) | Next.js 15 + React 19 | Works & projects showcase with visual builder rendering | 3000 |
| [`apps/post-web`](apps/post-web) | Next.js 15 + React 19 | Blog / articles platform | 3001 |
| [`apps/admin-web`](apps/admin-web) | Next.js 15 (App Router) | Admin CMS (posts, works, settings, visual builders) | 3002 |
| [`apps/api`](apps/api) | Fastify 5 + Prisma | Backend REST API, auth, uploads, search | 4000 |

## Packages

| Path | Purpose |
|------|---------|
| [`packages/ui`](packages/ui) | Shared React component library (source-direct usage) |
| [`packages/shared`](packages/shared) | Shared serializers / business utilities |
| [`packages/types`](packages/types) | Shared TypeScript type definitions & condition evaluator |
| [`packages/database`](packages/database) | Prisma schema & generated client |
| [`packages/assets`](packages/assets) | Shared fonts and static assets |
| [`packages/node-registry`](packages/node-registry) | Shared Node-side registry utilities |

## Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9 (workspaces)
- A **PostgreSQL** database (for the Prisma-backed API)

## Getting Started

> The repo uses **npm workspaces** — install once at the root. Lock files are intentionally gitignored.

```bash
# 1. Install all workspace dependencies
npm install

# 2. Generate the Prisma client
npm run generate:prisma

# 3. Push the schema to your database
npm run db:push

# 4. Configure environment
#    Copy apps/api/.env.example -> apps/api/.env and fill in values
```

### Run everything (in parallel)

```bash
npm run dev
```

This starts `admin-web`, `post-web`, `api`, `main-web`, and `work-web` concurrently. Visit each app on the ports listed in the table above.

### Run a single app

```bash
npm run dev:main   # main-web (portfolio)
npm run dev:work   # work-web  (works showcase)
npm run dev:post   # post-web  (blog)
npm run dev:admin  # admin-web (admin CMS)
npm run dev:api    # api       (backend)
```

## Commands

| Script | Description |
|--------|-------------|
| `npm run dev` | Run all apps concurrently |
| `npm run build` | Build `ui`, `shared`, `types`, and all frontend apps |
| `npm run build:api` | Generate Prisma client + build `types` + build `api` |
| `npm run start:api` | Start the built API server |
| `npm run lint` | Lint `admin-web` and `post-web` |
| `npm run generate:prisma` | Regenerate the Prisma client |
| `npm run db:push` | Push the Prisma schema to the database |
| `npm run seed:works` | Seed initial works data |

## API Overview

Fastify-based REST API (`apps/api`) with support for:

- **Auth** — JWT + bcrypt, cookie-based sessions
- **Content** — posts, works, related-content, search
- **Engagement** — reactions, share links, contact submissions
- **Building** — visual builder & works-builder endpoints
- **Media** — Cloudinary-backed uploads with rate limiting
- **Hardening** — CORS, Helmet, rate limiting, Zod validation

## Project Structure

```
apps/
  admin-web/    # Next.js admin CMS
  post-web/     # Next.js blog
  work-web/     # Next.js works showcase
  main-web/     # Vite portfolio site
  api/          # Fastify backend
packages/
  ui/           # Shared UI primitives
  shared/       # Shared utilities / serializers
  types/        # Shared types & evaluator
  database/     # Prisma schema & client
  assets/       # Fonts & static assets
  node-registry # Node-side registry helpers
scripts/        # Misc tooling (benchmarks, helpers)
```

## Deployment

The API is configured for [Render](http://render.com) via [`render.yaml`](render.yaml) (free web service with a build then start step). Set the environment variables listed there (`DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`, `COOKIE_DOMAIN`, `CORS_ORIGINS`) in your hosting provider before deploying.

## Environment Variables

Required by the API (see `apps/api/src/config/env.ts` for the full list):

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Main Prisma connection string |
| `DIRECT_URL` | Direct connection string (Prisma) |
| `JWT_SECRET` | Secret used to sign JWT access tokens |
| `COOKIE_DOMAIN` | Domain for auth cookies |
| `CORS_ORIGINS` | Comma-separated allowed CORS origins |

## License

Private / proprietary — all rights reserved.
