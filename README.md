# K-Vibe Tracker

K-Vibe Tracker is a mobile-first travel curation service for foreign visitors in Korea. It connects K-content inspired discovery, nearby place search, route planning, and convenience facility radar features.

## Current Development Branch

Use the `hslee` branch for active development.

```bash
git switch hslee
git pull --ff-only hslee-origin hslee
```

Writable remote:

```text
hslee-origin: https://github.com/hslee1026/k-vibe-tracker.git
```

The original upstream repository is still kept as `origin` for reference.

## Quick Start

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open:

```text
http://localhost:3000/en
```

Useful checks:

```bash
npm run type-check
npm test
npm run build
```

## Environment Variables

Required for Supabase auth/session features:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Without these Supabase values, local development still supports guest browsing flows. Login, profile persistence, and saved routes are disabled until credentials are provided.

Optional server-side integrations:

```env
TOUR_API_KEY=
YOUTUBE_API_KEY=
OPENAI_API_KEY=
KAKAO_MAP_KEY=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

Potentially paid or permission-gated services are tracked in [docs/approval-log.md](docs/approval-log.md). Do not enable those services until the user approves them.

Client-side app settings:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_KAKAO_MAP_KEY=
```

`TOUR_API_KEY` is optional during development. If it is missing, `/api/places` returns deterministic mock data so the map UI remains usable.

## Frontend Flow

- `/[locale]`: landing and language entry point.
- `/[locale]/map`: nearby K-vibe places. It requests browser geolocation, falls back to Seoul, calls `/api/places`, and renders a lightweight map preview with pins and a bottom list.
- `/[locale]/analyze`: YouTube URL analyzer. It calls `/api/analyze` and falls back to mock analysis if the AI worker is unavailable.
- `/[locale]/persona`: K-content persona route generator prototype.
- `/[locale]/route`: editable route timeline prototype.
- `/[locale]/radar`: convenience facility radar prototype.
- `/[locale]/profile`: Supabase auth-backed profile and saved route entry.

Supported locales are `ko`, `en`, `ja`, and `zh`.

## API Notes

### `GET /api/places`

Query:

```text
/api/places?lat=37.5665&lng=126.978&radius=2000&category=all
```

Behavior:

- Validates coordinates, radius, and category.
- Uses TourAPI `locationBasedList2` when `TOUR_API_KEY` exists.
- Falls back to local mock data when the key is missing, TourAPI fails, or TourAPI returns invalid JSON.
- Normalizes TourAPI responses into a frontend-friendly place shape.
- Builds a stable cache key now so Redis can be added later without changing the route contract.

Categories:

```text
all, cafe, photo, fun, culture, food, stay
```

### `POST /api/analyze`

Accepts:

```json
{ "youtube_url": "https://www.youtube.com/watch?v=..." }
```

Validates YouTube URLs, calls the AI worker when available, and returns mock analysis on local worker connection failures.

## Project Structure

```text
app/
  [locale]/
    map/        # place discovery UI
    analyze/    # SNS analyzer UI
    persona/    # persona route generator UI
    route/      # route timeline UI
    radar/      # facility radar UI
    profile/    # auth/profile UI
  api/
    places/     # TourAPI-backed place endpoint
    analyze/    # AI worker proxy
components/
  common/
  layout/
  map/
  radar/
  route/
lib/
  tourapi.ts    # TourAPI URL, category, cache-key, normalization helpers
  youtube.ts
  haversine.ts
messages/       # next-intl locale messages
supabase/
  migrations/
ai-worker/      # FastAPI prototype
```

## Current Sprint Progress

- Sprint 0 foundation is in place: Next.js, i18n, Supabase clients, layouts, API skeletons, tests.
- Sprint 1 is in progress:
  - `/api/places` now supports validated TourAPI calls with safe mock fallback.
  - Map page now consumes `/api/places`, supports geolocation fallback, loading/error/retry states, category filtering, search, and map pins.
  - Redis caching is not wired yet, but cache key generation is implemented and tested.

## Collaboration Workflow

1. Implement on `hslee`.
2. Run type-check, tests, and build.
3. Use Claude CLI only for a targeted review when local verification leaves a specific risk and the user has approved any possible cost.
4. Update this README with any changed setup, API, or workflow details.
5. Commit and push to `hslee-origin/hslee`.

```bash
npm run type-check
npm test
npm run build
git push hslee-origin hslee
```
