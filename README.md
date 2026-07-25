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
