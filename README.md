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
ENABLE_AI_WORKER_ANALYSIS=false
AI_WORKER_URL=
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

`TOUR_API_KEY` is optional during development. If it is missing, `/api/places` returns deterministic mock data so the map UI remains usable. `/api/analyze`, `/api/facilities`, and `/api/routes/generate` also use deterministic local mock data until AI analysis, live facility sources, or AI route generation are approved.

## Frontend Flow

- `/[locale]`: landing and language entry point with local-first development status and quick access to the map.
- `/[locale]/map`: nearby K-vibe places. It requests browser geolocation, falls back to Seoul, calls `/api/places`, and renders a lightweight map preview with pins, icon-based category filters, place details, and a bottom list.
- `/[locale]/analyze`: YouTube URL analyzer. It calls `/api/analyze`, which returns local mock spot extraction by default and only calls an AI worker when explicitly enabled.
- `/[locale]/persona`: K-content route generator. It calls `/api/routes/generate`, renders a local route preview, and can save the plan into `localStorage`.
- `/[locale]/route`: editable route timeline. It reads the saved route plan from `localStorage`, supports drag reorder, removal, sample stop insertion, and share text.
- `/[locale]/radar`: convenience facility radar. It requests browser geolocation, falls back to Seoul, calls `/api/facilities`, and supports radius/type filtering.
- `/[locale]/profile`: Supabase auth-backed profile when credentials exist, plus a guest-mode account state when Supabase is not configured.

Supported locales are `ko`, `en`, `ja`, and `zh`.

Additional frontend flow notes are in [docs/frontend-flow.md](docs/frontend-flow.md).

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

### `GET /api/facilities`

Query:

```text
/api/facilities?lat=37.5665&lng=126.978&radius=500&type=all
```

Behavior:

- Validates coordinates, radius, and facility type.
- Returns deterministic local mock data sorted by walking distance.
- Builds a stable cache key so future external facility sources or Redis can be added without changing the route contract.

Facility types:

```text
all, restroom, pharmacy, cafe_toilet, convenience, popup
```

### `POST /api/routes/generate`

Accepts:

```json
{ "theme": "mood", "detail": "cafe", "start_time": "10:00" }
```

Behavior:

- Validates theme, detail, and optional start time.
- Returns a deterministic local route plan with stops, crowd levels, stay minutes, walking minutes, total duration, and share text.
- Keeps the route generation contract stable so an AI-backed planner can replace the mock implementation later.

Themes:

```text
kpop, drama, mood
```

### `POST /api/analyze`

Accepts:

```json
{ "youtube_url": "https://www.youtube.com/watch?v=..." }
```

Behavior:

- Validates YouTube URLs and returns deterministic local spot extraction by default.
- Calls the AI worker only when `ENABLE_AI_WORKER_ANALYSIS=true` and `AI_WORKER_URL` is set.
- Falls back to local mock analysis if the enabled worker cannot be reached.

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
    facilities/ # mock-backed facility radar endpoint
    routes/     # mock-backed route generation endpoint
    analyze/    # AI worker proxy
components/
  common/
  layout/
  map/
  radar/
  route/
lib/
  analysis.ts   # local SNS analysis fallback and AI worker gate
  facilities.ts # facility types, cache-key, and local mock source
  routes.ts     # route themes, mock plans, duration helpers
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
  - Map category filters and place detail sheets now use stable lucide icons/text labels instead of fragile emoji glyphs.
  - `/api/facilities` now supports validated mock-backed facility lookup with cache keys.
  - Radar page now consumes `/api/facilities`, supports geolocation fallback, radius/type filters, loading/error/retry states, and English facility cards.
  - `/api/routes/generate` now supports validated mock-backed route generation.
  - Persona and route pages now share the route plan contract, local preview flow, `localStorage` handoff, and English UI.
  - `/api/analyze` is now local-first and gated behind `ENABLE_AI_WORKER_ANALYSIS` for worker calls.
  - Analyze page now has English local-first copy, mock/source indicators, and cleaner result cards.
  - Landing, login modal, top bar, language switcher, and profile page now use readable English local-first UI and avoid broken placeholder glyphs.
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
