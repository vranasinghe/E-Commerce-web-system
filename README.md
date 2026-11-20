# AURA — AI-Powered E-Commerce Clothing Store

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/Express-4.21-000000?style=for-the-badge&logo=express" alt="Express" />
  <img src="https://img.shields.io/badge/FastAPI-Python_3.14-009688?style=for-the-badge&logo=fastapi" alt="FastAPI" />
  <img src="https://img.shields.io/badge/Prisma-5.22-2D3748?style=for-the-badge&logo=prisma" alt="Prisma" />
  <img src="https://img.shields.io/badge/Turborepo-2.3-EF4444?style=for-the-badge&logo=turborepo" alt="Turborepo" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/TypeScript-5.6-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript" />
</p>

---

## 🌟 Overview

**AURA** is a modern, full-stack, AI-driven e-commerce platform built as a high-performance **Turborepo monorepo**. It includes a Next.js 14 buyer storefront, an admin management dashboard, an Express core backend API, and a dedicated Python FastAPI AI microservice with virtual try-on, Claude shopping assistant, visual search, and personalized size recommendation engines.

---

## ✨ Features & Highlights

- **🛍️ Buyer Storefront (`apps/web`)**: Next.js 14 (App Router) with server/client components, interactive product catalog, quick view, cart drawer, wishlist, and checkout flows.
- **⚙️ Admin Dashboard**: Manage catalog items, categories, inventory, customer orders, and promotional coupons.
- **⚡ Core API Backend (`apps/api`)**: Node.js & Express server connected via Prisma ORM for high-throughput RESTful endpoints.
- **🤖 Dedicated AI Service (`services/ai-service`)**:
  - **Virtual Try-On**: Upload a selfie and garment photo for AI virtual fitting.
  - **Claude Shopping Assistant**: Interactive AI assistant offering styling advice and order support.
  - **Visual Search**: Upload images to match against catalog items.
  - **Smart Recommendations**: Nearest-neighbor recommendations over product vectors.
  - **Size & Fit Predictor**: Quiz-driven fit calculator based on body metrics.
- **📦 Shared Workspaces (`packages/*`)**: Reusable UI component library (`@repo/ui`), Prisma database layer (`@repo/database`), and shared TypeScript interfaces (`@repo/types`).

---

## 🏗️ Architecture & Monorepo Structure

```
E-Commerce-web-system/
├── 📁 apps/
│   ├── 📁 web/                # Buyer Storefront & Admin App (Next.js 14)
│   └── 📁 api/                # Core Backend REST API (Express + Prisma)
│
├── 📁 services/
│   └── 📁 ai-service/         # AI Microservice (Python FastAPI / Uvicorn)
│
├── 📁 packages/
│   ├── 📁 database/           # Prisma Client, Schema, Migrations & Seeders
│   ├── 📁 types/              # Shared TypeScript Type Declarations
│   └── 📁 ui/                 # Shared React UI Component Library
│
├── 📁 .github/
│   └── 📁 workflows/          # CI/CD Automated Build, Lint & Typecheck Pipeline
│
├── 📄 docker-compose.yml      # Local PostgreSQL (pgvector) & Redis containers
├── 📄 .env.example            # Environment variables blueprint
└── 📄 turbo.json              # Turborepo task pipeline orchestration
```

### 🔄 System Data Flow
- **Client ↔️ Frontend (Vercel)**: Users interact with the Next.js `apps/web` application.
- **Frontend ↔️ Core Backend (Render)**: For standard e-commerce operations (cart, checkout, product fetching), the Next.js frontend calls the Node.js `apps/api` Express server.
- **Frontend ↔️ Database (Neon)**: Next.js Server Actions communicate directly with the Postgres database via Prisma (with `pgbouncer=true` connection pooling) for optimized admin mutations.
- **Frontend ↔️ AI Microservice (Render)**: For AI features (Chatbot, Virtual Try-On, Fit Predictor), the Next.js frontend bypasses the Core API and communicates *directly* with the Python FastAPI `services/ai-service` to minimize latency.
- **AI Microservice ↔️ LLMs (Groq/Anthropic)**: The Python service handles heavy computations and interfaces directly with external AI LLM providers.

---

## 💻 Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | Next.js 14 (App Router), TypeScript, Tailwind CSS, Lucide Icons |
| **Core API** | Node.js, Express, Prisma ORM, CORS, Express Rate Limit |
| **AI Microservice** | Python 3, FastAPI, Uvicorn, Anthropic Claude API, PyTorch / CLIP |
| **Database & Cache** | PostgreSQL, Prisma ORM, pgvector extension, Redis |
| **Monorepo Build** | Turborepo, npm workspaces |

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: `≥ 18.0.0`
- **npm**: `≥ 10.0.0`
- **Python**: `≥ 3.10`
- **Docker**: (Optional, for local PostgreSQL + Redis)

### Installation & Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/vranasinghe/E-Commerce-web-system.git
   cd E-Commerce-web-system
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   ```bash
   cp .env.example .env
   ```

4. **Initialize Database & Seed Sample Data**
   ```bash
   npm run db:generate
   npm run db:seed
   ```

5. **Start All Services in Development Mode**
   ```bash
   npm run dev
   ```

---

## AI services

### Chatbot provider

The Python AI service uses Gemini when `GEMINI_API_KEY` is set in the root
`.env` or the service's runtime environment. `GEMINI_MODEL` defaults to
`gemini-3.8-flash`. When Gemini is not configured, `GROQ_API_KEY` enables the
existing Groq provider. Restart the AI service after changing environment values.
For a deployed chatbot, configure these variables on the Python AI service host.

Provider and conversation tests can be run from `services/ai-service` with
`python -m unittest discover -s tests -v`.

### Search by photo

The `/visual-search` page uses the same `GEMINI_API_KEY` and `GEMINI_MODEL` as
the chatbot. The browser uploads a JPG, PNG, or WebP photo (up to 8 MB) through
the Next.js API route to the Python AI service. The service resizes the image,
asks Gemini to identify the main garment and one of the catalog's active
categories, and ranks actual active products in that category using the
identified garment type, pattern, and variant colors. Results include real
product prices, product links, and the category link. They are presented as
similar items, not exact matches or fabricated confidence percentages. A photo
without recognizable clothing returns no products. Uploaded images are not
stored by this feature.

Configure the Gemini key on the Python AI service host when deploying; the key
must stay server-side. Restart the AI service after changing it. The old random
image-search and embedding-reindex paths are retired. Image-search tests run
with the other Python service tests above.

### Virtual try-on

Virtual try-on uses an IDM-VTON-compatible Gradio Space independently of the
Gemini chatbot. The default is `TRYON_SPACE="yisol/IDM-VTON"`; optionally set
`HF_TOKEN` for account access. `TRYON_TIMEOUT_SECONDS` defaults to 120 and is
bounded between 30 and 300 seconds. The installed Python requirements must be
updated on the AI service host before deploying these changes.

The current integration supports five tops listed in
`apps/web/lib/tryon-catalog.ts`. It sends their dedicated garment-only photos,
not the catalog model photos. Each preview uses the displayed sample color.
Other garments remain unavailable until a compatible provider and garment
inputs are configured. Uploaded photos must be JPG, PNG, or WebP, up to 8 MB,
between 128 pixels per side and 20 megapixels.

Only real provider output is reported as successful. Provider outages, quota
errors, timeouts, and invalid images produce a visible error with a retry option.
Inference runs in an isolated process with a hard deadline; at most two jobs run
per API process. The frontend stops polling when closed, on failure, or at its
deadline. Input files are deleted after each job and result downloads use
`private, no-store`. Finished results expire after one hour when cleanup runs.

Jobs are held in memory for this single-process setup: a service restart requires
a new preview. Production deployments with multiple API processes need a shared
job store and worker queue. Availability and inference quality also depend on
the configured external provider.

## Demo product photography

The seeded catalog uses local, AI-generated illustrative photos of adult female
models wearing the women's collection and adult male models wearing the men's
collection. Each garment matches its product's name and description. These are
demo images, not photographs of physical stock. Each of the 20 products has four
full-length studio views: front, three-quarter, side, and back. Every product uses
a distinct model, with the same model and outfit retained across its four views.
The style follows the user's supplied photo references. The 80 gallery photos are
saved as `apps/web/public/images/products/*-{front,angle,side,back}-v2.webp`.
Model profiles and exact generation prompts are recorded in
`packages/database/prisma/product-gallery-prompts.json`. Previous image files
remain on disk for reference.

To update an existing demo catalog's image URLs without resetting accounts,
orders, inventory, or other product fields, configure the root `.env` and run:

```bash
npm run db:update-images
```

### Publish galleries to Cloudinary and the deployed database

Copy `.env.cloud.example` to `.env.cloud.local`, then configure `CLOUDINARY_URL`
and the remote PostgreSQL `DEPLOY_DATABASE_URL`. The local credentials file is
ignored by Git and is separate from development settings.

```bash
# Validate all 80 files without uploading or changing any records
npm run images:publish
# Upload and verify Cloudinary images only
npm run images:publish -- --apply
# Upload, verify, and update the 20 matching deployed product galleries
npm run images:publish -- --apply --update-database
```

Uploads use content-based asset IDs and can resume using the manifest in `.local`.
Before database changes, the tool backs up current image URLs to `.local`.
The database update is transactional, checks for concurrent product edits, and
changes only image arrays on the matching product slugs. No database seeding is
performed. Existing accounts, orders, prices, and inventory are preserved.

## 🌐 Local Service Endpoints

Once `npm run dev` is running, access the services at:

| Application / Service | URL | Description |
| :--- | :--- | :--- |
| **Buyer Storefront** | [http://localhost:3002](http://localhost:3002) | Next.js Storefront App |
| **Core REST API** | [http://localhost:4000](http://localhost:4000) | Express Backend Server |
| **AI Microservice** | [http://localhost:4100](http://localhost:4100) | FastAPI Python AI Service |

---

## 🔐 Seed Accounts (Demo)

| Role | Email | Password |
| :--- | :--- | :--- |
| **Customer** | `shopper@store.dev` | `shop123` |
| **Admin** | `admin@store.dev` | `admin123` |

---

## 📜 NPM Scripts Reference

| Command | Description |
| :--- | :--- |
| `npm run dev` | Launches all apps and microservices simultaneously via Turborepo |
| `npm run build` | Builds all packages, TypeScript types, and applications |
| `npm run lint` | Runs ESLint checks across all workspace projects |
| `npm run typecheck` | Validates TypeScript type safety across all workspaces |
| `npm run db:seed` | Seeds database with products, categories, coupons, and test accounts |
| `npm run db:studio` | Opens Prisma Studio GUI for database management |

---

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
