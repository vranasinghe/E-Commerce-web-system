# AURA — AI-Powered Ecommerce Clothing Store

A full-stack, AI-powered clothing store built as a **Turborepo monorepo**. It ships
a buyer storefront, an admin dashboard, a core Express API, and a dedicated AI
microservice with four AI features: a Claude-powered shopping assistant,
recommendations, visual search, and a size/fit predictor.

> **Status:** This is the *foundation + core storefront* milestone. The monorepo,
> database schema, seed data, and the buyer flow (browse → product → cart →
> checkout) are fully working. The admin, core API, and AI microservice are
> runnable and wired to real data; the AI features use graceful fallbacks so the
> app runs before you add API keys and populate embeddings. See
> [Build order](#build-order) for what's next.

## Tech stack

| Layer        | Tech                                                        |
| ------------ | ---------------------------------------------------------- |
| Frontend     | Next.js 14 (App Router) · TypeScript · Tailwind CSS         |
| Backend      | Next.js API routes · Node.js + Express (core API)          |
| Database     | PostgreSQL · Prisma ORM                                     |
| Vector / AI  | pgvector (embeddings) · Anthropic Claude (`claude-opus-4-8`) · CLIP (image embeddings) |
| Cache        | Redis                                                      |
| Auth         | NextAuth.js / JWT *(scaffolded)*                            |
| Payments     | Stripe (test mode) *(scaffolded)*                          |
| Monorepo     | Turborepo                                                  |

## Repository layout

```
ecommerce-ai-store/
├── apps/
│   ├── web/          # Buyer storefront (Next.js) — the runnable core
│   ├── admin/        # Admin dashboard (Next.js)
│   └── api/          # Core backend (Express + Prisma)
├── services/
│   └── ai-service/   # AI microservice (chatbot, reco, visual search, fit)
│       └── jobs/     # reindex-embeddings.cron.ts
├── packages/
│   ├── database/     # Shared Prisma client + schema + seed
│   ├── ui/           # Shared UI components
│   └── types/        # Shared TypeScript types
├── docker-compose.yml
├── .env.example
└── turbo.json
```

## Prerequisites

- Node.js ≥ 18 and npm
- Docker (for local Postgres + Redis)

## Setup

```bash
# 1. Install dependencies (from the repo root)
npm install

# 2. Configure environment
cp .env.example .env
#   → set ANTHROPIC_API_KEY to enable the live chatbot (optional; falls back otherwise)

# 3. Start Postgres (pgvector) + Redis
docker compose up -d

# 4. Create the schema and generate the Prisma client
npm run db:migrate      # or: npm run db:generate && npx prisma db push -w @repo/database
npm run db:seed         # ~20 products across 4 categories, an admin + a customer

# 5. Run everything (Turborepo)
npm run dev
```

Then open:

| App          | URL                     |
| ------------ | ----------------------- |
| Storefront   | http://localhost:3000   |
| Admin        | http://localhost:3001   |
| Core API     | http://localhost:4000   |
| AI service   | http://localhost:4100   |

Run a single app instead of all of them:

```bash
npm run dev --workspace=web
```

### Seed accounts

| Role     | Email              | Password  |
| -------- | ------------------ | --------- |
| Admin    | admin@store.dev    | admin123  |
| Customer | shopper@store.dev  | shop123   |

*(Passwords are demo-only hashes; real auth via NextAuth is scaffolded, not enforced.)*

## The 4 AI features

1. **Shopping assistant (chatbot)** — floating widget on the storefront. Calls
   `POST /api/chatbot`, which uses Claude (`claude-opus-4-8`) with a system prompt
   scoped to product Q&A, styling advice, and order lookups, plus live catalog
   context. Falls back to a canned reply if `ANTHROPIC_API_KEY` is unset.
2. **Recommendations** — "You may also like" carousel on product pages
   (`GET /api/recommendations`). Production uses pgvector nearest-neighbour over
   text embeddings; the current fallback ranks by category/brand + price proximity.
3. **Visual search** — upload a photo at `/visual-search`. Production runs CLIP
   image embeddings and queries pgvector; the current fallback returns sampled
   matches so the flow is demoable.
4. **Size & fit predictor** — the `/fit-finder` quiz (`POST /api/fit-predictor`)
   maps height/weight/fit preference to a recommended size via a rules+scoring model.

The `ai-service` mirrors these as standalone endpoints and includes
`jobs/reindex-embeddings.cron.ts` for the embeddings pipeline.

## Useful scripts

```bash
npm run dev          # run all apps via Turborepo
npm run build        # build everything
npm run db:studio    # open Prisma Studio
npm run db:seed      # reseed sample data
npm run reindex --workspace=ai-service   # (re)compute product embeddings (stubbed persistence)
```

## Build order

- [x] Monorepo + Prisma schema + seed data
- [x] Core storefront (browse, product detail, cart, checkout)
- [x] Admin dashboard (products, orders, customers, marketing)
- [x] AI chatbot (Claude) — with fallback
- [~] AI recommendations — heuristic fallback in place; wire pgvector + embeddings job
- [~] AI visual search — mock results; wire CLIP + pgvector
- [~] AI fit predictor — rules model in place; blend order-history data
- [ ] NextAuth (email + Google) enforcement
- [ ] Stripe Elements + webhook finalisation

## Notes

- Product images use `picsum.photos` placeholders (configured in each app's
  `next.config.mjs`). Swap for Cloudinary/S3 in production.
- The `ProductEmbedding` model stores pgvector columns as Prisma
  `Unsupported("vector(...)")`; read/write them with raw SQL (see the reindex job).
```
