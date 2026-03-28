# IPL Fantasy Web App (Dream11-style)

Production-oriented IPL fantasy app built with **Next.js App Router + TypeScript + Tailwind + Prisma + PostgreSQL**.

## 1) Project Structure

```text
app/
  api/
    matches/
    contests/
      [contestId]/
        join/
        leaderboard/
        score/
  contest/[contestId]/
  match/[matchId]/
  layout.tsx
  page.tsx
components/
  live-leaderboard.tsx
  match-card.tsx
  page-shell.tsx
  team-builder.tsx
lib/
  cricket-api.ts
  match-sync.ts
  prisma.ts
  scoring.ts
  validation.ts
prisma/
  schema.prisma
  seed.ts
types/
  index.ts
```

## 2) Database Schema (Prisma)

Core models:
- `Match` -> one auto-created `Contest`
- `Contest` -> multiple `ContestEntry`
- `ContestEntry` -> 11 selected `TeamPlayer` rows
- `PlayerStat` stores live stat snapshots + fantasy points

Use pooled + direct URLs in production:
- `DATABASE_URL`: pooled connection for runtime
- `DIRECT_URL`: non-pooled/direct connection for Prisma migrate

```bash
npx prisma migrate dev --name init
npx prisma generate
```

## 3) Key API Routes

- `GET /api/matches`
  - Pulls IPL matches from the cricket API (falls back to mock IPL fixtures)
  - Upserts DB match records
  - Auto-creates one contest per match
- `POST /api/contests/:contestId/join`
  - Validates user name + 11-player team + C/VC
  - Upserts players and creates contest entry
- `POST /api/contests/:contestId/score`
  - Pulls player stats
  - Calculates points with multiplier logic
  - Updates contest totals
- `GET /api/contests/:contestId/leaderboard`
  - Returns ranked leaderboard for live view

## 4) Core UI Components

- **Match list page** (`/`) with upcoming/live IPL matches
- **Team creation page** (`/match/[matchId]`) with constraints and captain/vice-captain selectors
- **Live contest page** (`/contest/[contestId]`) with auto-refresh leaderboard

Design is mobile-first, minimal, and dashboard-like.

## 5) Example Scoring Logic

`lib/scoring.ts`
- Run: `+1`
- Wicket: `+25`
- Catch: `+8`
- Optional strike-rate modifier:
  - `>=150`: `+6`
  - `<90` (min 10 balls): `-4`
- Captain multiplier: `2x`
- Vice-captain multiplier: `1.5x`

## 6) Setup Instructions

1. Install dependencies
   ```bash
   npm install
   ```
2. Copy envs
   ```bash
   cp .env.example .env
   ```
3. Configure Postgres URL(s) and optional `CRIC_API_KEY`
4. Apply schema
   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   ```
5. Start app
   ```bash
   npm run dev
   ```

## Vercel + PostgreSQL Deployment

Yes, this app can be hosted on Vercel, but you must configure Postgres correctly:

1. Create a managed Postgres database (Neon/Supabase/Vercel Postgres).
2. Set Vercel env vars:
   - `DATABASE_URL` = pooled connection string
   - `DIRECT_URL` = direct connection string
   - `CRIC_API_KEY` (optional)
3. Run migrations from CI/local against `DIRECT_URL`.
4. Deploy to Vercel.

> Why this matters: serverless runtimes open many short-lived DB connections. Pooling avoids connection exhaustion.

## Cricket API Note

The app is wired for CricAPI (`https://api.cricapi.com/v1`).
- If `CRIC_API_KEY` is missing/invalid, the app uses deterministic IPL mock data for local development.
- This keeps all pages and flows fully testable without paid APIs.

## Production Recommendations

- Move scoring refresh to Vercel Cron/webhook + queue worker.
- Add Redis caching for external API responses.
- Add rate-limits and bot protection on join endpoint.
- Add observability (structured logs + tracing + error monitoring).
