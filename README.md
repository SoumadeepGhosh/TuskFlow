# TaskFlow

<p align="center">
  <strong>A modern, high-performance project management and Kanban platform built for engineering and product teams.</strong>
</p>

<p align="center">
  <a href="https://tusk-flow.vercel.app/"><img src="https://img.shields.io/badge/Live%20Demo-Vercel-black?style=flat&logo=vercel" alt="Live Demo" /></a>
  <img src="https://img.shields.io/badge/TypeScript-5.x-blue?style=flat&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Next.js-16%20(React%2019)-black?style=flat&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/NestJS-11.x-red?style=flat&logo=nestjs" alt="NestJS" />
  <img src="https://img.shields.io/badge/PostgreSQL-17-blue?style=flat&logo=postgresql" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Redis-BullMQ-red?style=flat&logo=redis" alt="Redis" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat" alt="License" />
</p>

---

## Overview

TaskFlow is a production-oriented, full-stack project management application modeled after modern tools like Linear and Jira. It delivers isolated workspaces, sprint-driven Kanban boards, granular role-based access control, an asynchronous notification pipeline (WebSockets + BullMQ), and transactional emails powered by the Brevo REST API.

- **Live Frontend:** [https://tusk-flow.vercel.app](https://tusk-flow.vercel.app)
- **Backend Architecture:** Modular NestJS with Prisma ORM, PostgreSQL, Redis, and Socket.IO.

---

## Screenshots

| Kanban Board | Task Details & Sprints | Notification Center |
|---|---|---|
| ![Kanban Board](/docs/images/board.png) | ![Task Details](/docs/images/tasks.png) | ![Notification Center](/docs/images/dashboard.png) |

*(To add screenshots, place PNG files into `/docs/images/board.png`, `/docs/images/tasks.png`, and `/docs/images/dashboard.png`)*

---

## Features

### 🔐 Authentication & Session Security
- User registration and login with bcrypt password hashing (12 salt rounds).
- Short-lived JWT access tokens (15m) and rotating, hashed refresh tokens (7d) stored per device.
- Single-device logout and global "logout from all devices" invalidation.
- Profile management with avatar uploads and password modification.

### 🏢 Workspaces & Access Control
- Multi-tenant architecture with completely isolated workspaces.
- Collision-free, auto-incrementing workspace slug generator.
- Granular role-based permissions (`OWNER`, `ADMIN`, `MEMBER`).
- Workspace customization with logo and banner image uploads.
- Member listing with status badges (`ACTIVE`, `PENDING`, `REMOVED`).

### ✉️ Invitations & Email
- Secure tokenized workspace invitations with 7-day expiration.
- Transactional emails sent via the **Brevo REST API v3** (HTTPS payload, retry with exponential backoff on transient errors).
- Email notifications on task assignment and workspace onboarding.

### 📊 Projects & Boards
- Multi-project support per workspace with project keys (e.g. `PROJ-101`).
- Custom board columns with reorderable status lanes (`TODO`, `IN_PROGRESS`, `IN_REVIEW`, `DONE`).
- Dedicated project member assignments.

### 📋 Task Management & Kanban
- Interactive Kanban board powered by `@dnd-kit` with column-to-column drag and drop.
- Position-based task reordering with persistent indices.
- Comprehensive task attributes: title, description, priority (`LOW`, `MEDIUM`, `HIGH`, `URGENT`), status, start/due dates, estimated hours, and assignees.
- Task search with keyword search, priority filters, status filters, and pagination.
- Task labels, comments with user attribution, and multi-file attachments.
- Calendar view for due-date scheduling with drag-and-drop date rescheduling.

### 🔔 Real-Time Notifications
- Dual-channel notification system: in-app notifications and transactional emails.
- Asynchronous dispatch powered by **BullMQ** job queues on Redis.
- Instant UI delivery via **Socket.IO** rooms scoped to `user:{id}`.
- Comprehensive notification center with tabs (`Unread`, `Tasks`, `Comments`, `Mentions`, `Archived`), sound alerts, and bulk operations.
- Fine-grained user notification preferences.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | [Next.js 16](https://nextjs.org/) (App Router, Turbopack), [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/) |
| **Styling & UI** | [Tailwind CSS v4](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/), [Framer Motion](https://www.framer.com/motion/), [Lucide Icons](https://lucide.dev/) |
| **State & Data Fetching** | [@tanstack/react-query v5](https://tanstack.com/query), [Axios](https://axios-http.com/) with automatic 401 token refresh interceptor |
| **Drag & Drop** | [@dnd-kit/core](https://dndkit.com/), `@dnd-kit/sortable` |
| **Backend** | [NestJS 11](https://nestjs.com/) (Modular architecture, Express platform) |
| **Database & ORM** | [PostgreSQL 17](https://www.postgresql.org/), [Prisma ORM 7](https://www.prisma.io/) with `@prisma/adapter-pg` |
| **Queue & Cache** | [Redis 8](https://redis.io/), [BullMQ](https://docs.bullmq.io/) for async background job execution |
| **Real-Time** | [Socket.IO](https://socket.io/) Gateway with JWT handshake authentication |
| **Security** | [Helmet](https://helmetjs.github.io/), CORS origin whitelisting, Zod environment validation |
| **Transactional Email** | [Brevo REST API v3](https://developers.brevo.com/) |
| **Deployment** | [Vercel](https://vercel.com/) (Frontend), [Railway](https://railway.app/) (Backend, Postgres, Redis) |

---

## Folder Structure

```
taskflow/
├── .github/
│   └── workflows/              # GitHub Actions CI pipelines (frontend, backend, deploy)
├── docs/                       # Architecture diagrams, API references, design tokens
│   └── images/                 # Screenshot placeholders for GitHub display
├── backend/
│   ├── prisma/
│   │   ├── migrations/         # PostgreSQL versioned migrations
│   │   └── schema.prisma       # Prisma data model definition
│   ├── src/
│   │   ├── common/             # Filters, interceptors, decorators, storage, tokens
│   │   ├── config/             # Zod environment validation & configuration loaders
│   │   ├── database/           # Prisma service & connection lifecycle
│   │   ├── modules/            # Domain modules
│   │   │   ├── attachment/     # File uploads & storage
│   │   │   ├── auth/           # Login, registration, password hashing, JWT
│   │   │   ├── board/          # Boards & board columns
│   │   │   ├── comment/        # Task comments & notifications
│   │   │   ├── email/          # Brevo REST API v3 email integration
│   │   │   ├── health/         # Kubernetes / Railway liveness & readiness probes
│   │   │   ├── notification/   # Notification storage, read state, preferences
│   │   │   ├── notification-dispatcher/ # Multi-channel routing (socket + queue)
│   │   │   ├── notification-queue/      # BullMQ background workers
│   │   │   ├── project/        # Projects & project members
│   │   │   ├── socket/         # Socket.IO gateway & user rooms
│   │   │   ├── task/           # Task CRUD, filters, positioning, my-tasks
│   │   │   ├── workspace/      # Workspace CRUD & slug generator
│   │   │   └── workspace-invitation/ # Invitations & token verification
│   │   └── main.ts             # Application bootstrap, Helmet, CORS, Swagger
│   ├── .env.example            # Backend environment variables template
│   └── package.json
├── frontend/
│   ├── public/                 # Static assets & icons
│   ├── src/
│   │   ├── app/                # Next.js App Router
│   │   │   ├── (auth)/         # Login & register pages
│   │   │   ├── (dashboard)/    # Workspaces, projects, boards, calendar, profile, settings
│   │   │   ├── invite/         # Workspace invitation acceptance flow
│   │   │   ├── layout.tsx      # Root layout & providers
│   │   │   └── page.tsx        # High-converting landing page
│   │   ├── components/         # Shared UI components (dialogs, tables, landing blocks)
│   │   ├── features/           # Domain feature slices (auth, task, board, notification)
│   │   ├── hooks/              # Custom React hooks
│   │   ├── lib/                # Axios instance, token storage, sound & notification utils
│   │   ├── providers/          # React Query, Auth, Socket, and Toast providers
│   │   └── types/              # TypeScript interfaces & DTOs
│   ├── .env.example            # Frontend environment variables template
│   └── package.json
└── docker-compose.yml          # Local PostgreSQL & Redis containers
```

---

## Installation & Local Development

### Prerequisites
- **Node.js**: v20 or v22 LTS
- **npm**: v10+
- **Docker**: For running PostgreSQL and Redis locally

### 1. Clone the Repository
```bash
git clone https://github.com/SoumadeepGhosh/TuskFlow.git
cd TuskFlow
```

### 2. Start PostgreSQL & Redis with Docker
```bash
docker compose up -d
```
*This starts PostgreSQL on port `5432` and Redis on port `6379`.*

---

### 3. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your local credentials

# Run database migrations and generate Prisma client
npx prisma migrate dev
npx prisma generate

# Start the NestJS development server
npm run start:dev
```
*The backend API will run on `http://localhost:3000`.*  
*Swagger API documentation will be available at `http://localhost:3000/api/docs`.*

---

### 4. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env.local
# Default: NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Start the Next.js development server
npm run dev
```
*The frontend application will run on `http://localhost:3001`.*

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description | Example / Default |
|---|---|---|---|
| `PORT` | No | Server port | `3000` |
| `NODE_ENV` | Yes | Runtime environment | `development` / `production` |
| `API_PREFIX` | No | Global HTTP route prefix | `api` |
| `APP_URL` | No | Backend public URL | `http://localhost:3000` |
| `FRONTEND_URL` | Yes | URL of frontend (used for CORS & email links) | `https://tusk-flow.vercel.app` |
| `DATABASE_URL` | Yes | PostgreSQL connection URI | `postgresql://user:pass@localhost:5432/taskflow` |
| `JWT_SECRET` | Yes | Minimum 32-character secret for JWT signing | `random-64-char-string` |
| `JWT_ACCESS_TOKEN_EXPIRES_IN` | No | Access token lifespan | `15m` |
| `JWT_REFRESH_TOKEN_EXPIRES_IN`| No | Refresh token lifespan | `7d` |
| `REDIS_HOST` | No | Redis hostname | `localhost` |
| `REDIS_PORT` | No | Redis port | `6379` |
| `REDIS_PASSWORD` | No | Redis auth password | `""` |
| `REDIS_URL` | No | Full Redis URL (used on Railway) | `redis://default:pass@host:port` |
| `BREVO_API_KEY` | Yes | Brevo REST API v3 key (`xkeysib-...`) | `xkeysib-xxxx...` |
| `MAIL_FROM` | Yes | Verified Brevo sender name and email | `"TaskFlow <notifications@yourdomain.com>"` |

### Frontend (`frontend/.env.local`)

| Variable | Required | Description | Example / Default |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | Yes | Full URL to NestJS API endpoint | `https://your-backend.railway.app/api` |
| `NEXT_PUBLIC_SOCKET_URL` | No | WebSocket host URL (defaults to API origin) | `https://your-backend.railway.app` |

---

## API Overview

Interactive Swagger documentation is available in development mode at `/api/docs`.

Major REST modules:

- **`POST /api/auth/register`** — Register user account
- **`POST /api/auth/login`** — Authenticate and receive access + refresh token
- **`POST /api/auth/refresh`** — Rotate refresh token and obtain new access token
- **`POST /api/auth/logout`** — Invalidate current refresh token
- **`GET /api/workspaces`** — List user workspaces (owned + member)
- **`POST /api/workspaces`** — Create workspace with collision-free slug
- **`POST /api/workspaces/:id/invitations`** — Send invitation email
- **`GET /api/workspaces/invitations/:token`** — Inspect invite token details
- **`POST /api/workspaces/invitations/:token/accept`** — Accept invitation
- **`GET /api/projects`** — List projects in workspace
- **`GET /api/boards/:id`** — Get Kanban board with columns
- **`GET /api/tasks`** — Paginated tasks with status, priority, and keyword filtering
- **`POST /api/tasks`** — Create task with automatic column positioning
- **`PATCH /api/tasks/:id/move`** — Move task across board columns
- **`GET /api/notifications`** — Paginated user notification inbox
- **`PATCH /api/notifications/:id/read`** — Mark notification as read
- **`GET /api/health`** — Service health probe

---

## Architecture

```
                      ┌────────────────────────────┐
                      │    Next.js 16 (Vercel)     │
                      │  React 19 • TanStack Query │
                      └─────────────┬──────────────┘
                                    │ HTTP / REST & WebSockets
                                    ▼
                      ┌────────────────────────────┐
                      │    NestJS 11 (Railway)     │
                      │  Helmet • CORS • JWT Guard │
                      └──────┬──────────────┬──────┘
                             │              │
              ┌──────────────┴──────┐       └──────────────┬──────────────┐
              ▼                     ▼                      ▼              ▼
     ┌─────────────────┐   ┌─────────────────┐    ┌─────────────────┐ ┌───────────────┐
     │  PostgreSQL 17  │   │  Redis (Cache)  │    │  Socket.IO GW   │ │  Brevo API    │
     │   Prisma ORM    │   │  BullMQ Queue   │    │  Live Updates   │ │  Trans. Email │
     └─────────────────┘   └─────────────────┘    └─────────────────┘ └───────────────┘
```

1. **Client Layer:** Next.js App Router provides server-rendered landing pages for fast TTFB and client-side dashboards using TanStack Query with optimistic UI updates.
2. **API Layer:** NestJS controllers delegate to domain services and repositories. Responses are uniformly transformed via `TransformResponseInterceptor` and exceptions are normalized with `HttpExceptionFilter`.
3. **Event Pipeline:** When tasks or workspaces are updated, `NotificationDispatcherService` persists the event to PostgreSQL, emits a real-time event through `SocketGateway` to online users, and queues an email job in BullMQ for asynchronous Brevo delivery.

---

## Deployment Guide

### Deploying Backend to Railway
1. Create a new Railway project and connect your GitHub repository (root: `/backend`).
2. Add a **PostgreSQL** database service and a **Redis** service from Railway templates.
3. Configure environment variables in Railway according to the table above.
4. Set build command: `npm run build` and start command: `npm run start:prod`.

### Deploying Frontend to Vercel
1. Import the repository in Vercel and set the Root Directory to `frontend`.
2. Framework preset: **Next.js**.
3. Add Environment Variables:
   - `NEXT_PUBLIC_API_URL` = `https://<your-railway-app>.up.railway.app/api`
4. Deploy.

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/amazing-feature`.
3. Commit your changes: `git commit -m 'feat: add amazing feature'`.
4. Ensure types compile: `npx tsc --noEmit` in both `frontend` and `backend`.
5. Push to your branch: `git push origin feature/amazing-feature`.
6. Open a Pull Request.

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

