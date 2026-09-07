# lifeOS

A comprehensive personal life & task management system. Not just a to-do list, a smart life assistant supporting task capture, priority intelligence, daily planning, focus mode, habit tracking, goal management, reviews, and analytics.

## Tech Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend**: Node.js + TypeScript + Express + Prisma ORM
- **Database**: PostgreSQL 16
- **State Management**: TanStack Query (server state) + Zustand (UI state)
- **Containerization**: Docker Compose

## Features

- **Task Management** — Full CRUD with priorities, deadlines, subtasks, categories, tags, and Eisenhower Matrix view
- **Brain Dump** — Rapid multi-task capture, one per line
- **Projects & Goals** — Organize tasks into projects with milestones, link to long-term goals with progress tracking
- **Daily Planning** — Auto-generated daily plans with priority buckets (top/secondary/optional), time blocking, and overload warnings
- **Focus Mode** — Distraction-free timer linked to tasks, with pause/resume and session history
- **Habit Tracking** — Daily/weekly habits with streak tracking, calendar heatmap, and check-in
- **Reviews** — Daily and weekly review system with mood, energy, wins, and challenges
- **Analytics** — Completion rate trends, focus time charts, weekly momentum, category breakdowns, and wellness detection
- **Command Palette** — Cmd+K for quick search and actions across the app

## Project Structure

```
lifeOS/
├── docker-compose.yml
├── prisma/              # Schema & migrations
├── packages/shared/     # Shared types, schemas, utils
├── apps/api/            # Express REST API (~70+ endpoints)
└── apps/web/            # React SPA (Vite)
```

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm
- PostgreSQL 16

### Setup

```bash
# Install dependencies
pnpm install

# Copy env and configure your database URL
cp .env.example .env

# Run database migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate

# Seed the database
pnpm tsx prisma/seed.ts

# Start the API (port 4000)
pnpm --filter api dev

# Start the web app (port 5173)
pnpm --filter web dev
```

### Docker

```bash
docker compose up
```

This starts PostgreSQL, the API, and the web app.

## API

All endpoints are under `/api/v1`. Key resources:

| Resource     | Endpoints                                         |
| ------------ | ------------------------------------------------- |
| Tasks        | CRUD, brain-dump, suggestions, eisenhower, reorder |
| Projects     | CRUD, milestones                                   |
| Goals        | CRUD, progress computation                         |
| Habits       | CRUD, check-in, streaks, calendar                  |
| Focus        | start, pause, resume, complete, history            |
| Plans        | generate, rollover, time-blocks, overload-check    |
| Reviews      | daily/weekly CRUD, auto-generate                   |
| Dashboard    | today overview, upcoming, goals                    |
| Analytics    | completion-rate, focus-time, momentum, wellness    |

## License

MIT
