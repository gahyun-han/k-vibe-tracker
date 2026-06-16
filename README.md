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

Recommended when local npm is unavailable:

```bash
docker compose up app
```

Keep it running in the background:

```bash
docker compose up -d app
```

Open:

```text
http://localhost:3000/en
```

Run checks through Docker:

```bash
docker compose run --rm app npm run type-check
docker compose run --rm app npm test
docker compose run --rm app npm run build
```

Docker details, reset commands, and VS Code Dev Container notes are in [docs/docker-development.md](docs/docker-development.md).

Local npm fallback:

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

Without these Supabase values, local development still supports guest browsing flows, local saved places, and local route editing. Login and cross-device account sync are disabled until credentials are provided.

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

`NEXT_PUBLIC_KAKAO_MAP_KEY` is only needed for the Kakao Maps JavaScript SDK. If it is empty, the map page keeps using the no-cost local preview map and does not load the Kakao SDK.

`TOUR_API_KEY` is optional during development. When it is present, `/api/places` uses Korea Tourism Organization TourAPI through the server route only. If it is missing or TourAPI fails, `/api/places` returns deterministic mock data so the map UI remains usable. `/api/analyze`, `/api/facilities`, and `/api/routes/generate` also use deterministic local mock data until AI analysis, live facility sources, or AI route generation are approved.

## Frontend Flow

- `/[locale]`: actionable home feed with language selection, TourAPI-backed Seoul feed cards, local save controls, feature shortcuts, and trend chips that open focused map views.
- `/[locale]/map`: nearby K-vibe places. It requests browser geolocation, falls back to Seoul, calls `/api/places`, lazy-loads `/api/places/[contentId]` details for selected pins, renders Kakao Maps when `NEXT_PUBLIC_KAKAO_MAP_KEY` exists, otherwise uses the no-cost local map preview, and can add a selected place into the local route editor.
- `/[locale]/analyze`: YouTube URL analyzer. It calls `/api/analyze`, which returns local mock spot extraction by default, can open detected spots on the map, can draft a local route from detected places, and only calls an AI worker when explicitly enabled.
- `/[locale]/persona`: K-content route generator. It calls `/api/routes/generate` with the active locale, renders a localized local route preview, and can save the plan into `localStorage`.
- `/[locale]/route`: editable route timeline. It reads and writes the saved route plan in `localStorage`, supports drag reorder, removal, localized sample stop insertion, and share text.
- `/[locale]/docent`: no-cost local docent. It opens a selected route stop with captions and browser `speechSynthesis` voice playback instead of a paid TTS API.
- `/[locale]/radar`: convenience facility radar. It requests browser geolocation, falls back to Seoul, calls `/api/facilities`, and supports radius/type filtering.
- `/[locale]/profile`: Supabase auth-backed profile when credentials exist, plus a guest-mode dashboard with local saved places and the current local route when Supabase is not configured.

Supported locales are `ko`, `en`, `ja`, and `zh`.

Additional frontend flow notes are in [docs/frontend-flow.md](docs/frontend-flow.md).
Implemented product and API improvements are tracked in [docs/improvement-log.md](docs/improvement-log.md).

## API Notes

### `GET /api/places`

Query:

```text
/api/places?lat=37.5665&lng=126.978&radius=2000&category=all&locale=en
```

Behavior:

- Validates coordinates, radius, and category.
- Validates optional `locale=ko|en|ja|zh`.
- Uses TourAPI `locationBasedList2` when `TOUR_API_KEY` exists.
- Routes locale requests to `KorService2`, `EngService2`, `JpnService2`, or `ChsService2`.
- Uses Korean content type IDs for `ko` and multilingual content type IDs for `en`, `ja`, and `zh`.
- Falls back to local mock data when the key is missing, TourAPI fails, or TourAPI returns invalid JSON.
- Normalizes TourAPI responses into a frontend-friendly place shape.
- Builds a stable cache key now so Redis can be added later without changing the route contract.

Categories:

```text
all, cafe, photo, fun, culture, food, stay
```

### Local saved places

- Storage key: `k-vibe-saved-places`
- Map place detail sheets can save or unsave a selected place with the heart control.
- Saved places are visible in `/[locale]/profile` even in guest mode.
- Saved place cards open focused map views with `lat`, `lng`, `q`, and `source=saved` URL parameters.
- Supabase account sync for saved places is still deferred until credentials are configured.

### `GET /api/places/[contentId]`

Query:

```text
/api/places/126128?contentTypeId=12&locale=en
```

Behavior:

- Validates the TourAPI content ID, optional `contentTypeId`, and optional `locale=ko|en|ja|zh`.
- Uses TourAPI `detailCommon2`, `detailIntro2`, and `detailImage2` when `TOUR_API_KEY` exists.
- Keeps the TourAPI key server-side and never returns it in JSON payloads.
- Normalizes overview, address, image gallery, phone, homepage, operating time, rest day, and parking fields for the place detail sheet.
- Falls back to a safe mock detail payload when the key is missing or TourAPI detail calls fail.
- Builds a stable detail cache key so Redis can be added later without changing the frontend contract.

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
{ "theme": "mood", "detail": "cafe", "start_time": "10:00", "locale": "en" }
```

Behavior:

- Validates theme, detail, optional start time, and optional `locale=ko|en|ja|zh`.
- Returns a deterministic local route plan with localized title/summary, stops, crowd levels, stay minutes, walking minutes, total duration, and share text.
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
    docent/     # local speech-synthesis docent UI
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
  saved-places.ts # local saved place storage helpers
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
  - `/api/places` now supports locale-aware TourAPI service routing for Korean, English, Japanese, and Chinese.
  - `/api/places/[contentId]` now supports TourAPI `detailCommon2`, `detailIntro2`, and `detailImage2` with safe mock fallback.
  - Map page now consumes `/api/places`, supports geolocation fallback, loading/error/retry states, category filtering, search, and map pins.
  - Map rendering is now ready for Kakao Maps JavaScript SDK and safely falls back to the local preview map when no client key is configured.
  - Landing, bottom navigation, map filters, and the new in-app feature guide use readable locale-aware copy.
  - PWA manifest metadata, app icons, shortcut icons, and Open Graph image assets are present and no longer point to missing files.
  - Map category filters and place detail sheets now use stable lucide icons/text labels instead of fragile emoji glyphs.
  - Map place details lazy-load TourAPI overview, image gallery, phone, operating time, rest day, and parking fields.
  - Map place details can save or unsave a selected place, add it into the shared local route plan, open the route editor, or launch the local Docent flow.
  - `/api/facilities` now supports validated mock-backed facility lookup with cache keys.
  - Radar page now consumes `/api/facilities`, supports geolocation fallback, radius/type filters, loading/error/retry states, and English facility cards.
  - `/api/routes/generate` now supports validated mock-backed route generation.
  - Persona, map, and route pages now share the route plan contract, local preview flow, `localStorage` handoff, and locale-aware UI.
  - `/api/analyze` is now local-first and gated behind `ENABLE_AI_WORKER_ANALYSIS` for worker calls.
  - Analyze page now has English local-first copy, mock/source indicators, and cleaner result cards.
  - Analyze results now link detected places into the map and can create a local editable route from candidates.
  - Analyze and Radar screen copy now comes from shared locale resources for Korean, English, Japanese, and Chinese.
  - Persona and Route screen copy now comes from shared locale resources, and route generation localizes mock plan titles/summaries when a locale is provided.
  - The in-app feature guide now includes per-feature shortcut actions instead of only static descriptions.
  - Home entry feature cards and trend chips now route directly into app workflows instead of acting as static labels.
  - Home entry now includes a TourAPI-backed horizontal K-spot feed with category filters, heart save controls, and map handoff links.
  - Route stops now open a local AI Docent screen with captions and browser voice playback, keeping the guide experience available without OpenAI TTS cost.
  - Profile now works as a guest-mode dashboard with local saved places and the current local route, matching the root saved-places grid direction without needing Supabase.
  - Landing, login modal, top bar, language switcher, and profile page now use readable English local-first UI and avoid broken placeholder glyphs.
  - Locale JSON files have been repaired for English, Korean, Japanese, and Chinese.
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
