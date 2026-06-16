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

`NEXT_PUBLIC_KAKAO_MAP_KEY` is only needed for the Kakao Maps JavaScript SDK. If it is empty, the map page keeps using the no-cost local preview map and does not load the Kakao SDK. The current local Kakao domain verification is for `http://localhost:3000`; `/ko/map` reaches the live Kakao renderer in Chrome with no console errors. `127.0.0.1` must be registered separately in Kakao Developers if you want to use that host.

`TOUR_API_KEY` is optional during development. When it is present, `/api/places` uses Korea Tourism Organization TourAPI through the server route only. If it is missing or TourAPI fails, `/api/places` returns deterministic mock data so the map UI remains usable. `/api/analyze`, `/api/facilities`, and `/api/routes/generate` also use deterministic local mock data until AI analysis, live facility sources, or AI route generation are approved.

## Frontend Flow

- `/[locale]`: actionable home feed with language selection, root-aligned story topic filters, TourAPI-backed Seoul feed cards, local save controls, feature shortcuts, and trend chips that open focused map views. Feed card image/text taps now open the in-app map detail sheet with TourAPI detail context when available, and saved persona preferences locally select a matching feed category.
- `/[locale]/map`: nearby K-vibe places. It requests browser geolocation, restores the last known GPS position for up to 30 minutes, falls back to Seoul, calls `/api/places`, caches same-query place responses locally for 1 hour, lazy-loads `/api/places/[contentId]` details and image galleries for selected pins, renders Kakao Maps when `NEXT_PUBLIC_KAKAO_MAP_KEY` exists, otherwise uses the no-cost local map preview, exposes the root S3 SNS analyzer FAB, and can add or share a selected place through local route/detail URLs. Place detail sheets also show S4-style local Seen in badges for YouTube and Instagram signals without calling live SNS providers.
- `/[locale]/analyze`: SNS URL analyzer. It detects YouTube and Instagram links, presents platform-aware example cards, immediately runs local/mock analysis for YouTube examples, calls `/api/analyze` for YouTube with the active locale, shows a localized 4-step loading state, caches same-video analysis results locally for 1 hour, returns localized local mock spot extraction by default, lets detected spot cards open the map with the place detail sheet already focused, can draft a local route from detected places, and keeps live Instagram extraction deferred until an approved no-cost/provider path exists.
- `/[locale]/persona`: K-content route generator. It guides users through a localized 3-step theme, mood, and confirmation flow with six root-aligned persona themes, can save that selection as a no-cost local feed preference, calls `/api/routes/generate` with the active locale, renders a localized local route preview, and can save the plan into `localStorage`.
- `/[locale]/route`: editable route timeline. It reads and writes the saved route plan in `localStorage`, restores no-cost `route=` share URLs, tracks completed stops locally, supports drag reorder, removal, localized sample stop insertion, a local route mini map, S9-style whole-route Open in Map handoff, free walking travel segments between stops, in-app stop detail handoff to the map sheet, Google Maps walking handoff links, and same-origin URL sharing without a public-link backend.
- `/[locale]/docent`: no-cost local docent. It opens a selected route stop with structured captions, browser `speechSynthesis` voice playback with active script-section highlighting when supported, and a user-clicked 100m arrival check when coordinates are available, instead of a paid TTS API.
- `/[locale]/radar`: convenience facility radar. It requests browser geolocation, restores the last known GPS position for up to 30 minutes, falls back to Seoul, calls `/api/facilities`, caches same-query facility responses locally for 1 hour, supports radius/type filtering with shared lucide facility icons, enriches popup facilities from TourAPI `searchFestival2` when `TOUR_API_KEY` is configured, shows a no-cost radar map preview, and can open selected facilities in Google Maps after a user click.
- `/[locale]/profile`: Supabase auth-backed profile when credentials exist, plus a guest-mode dashboard with the active local persona, an Instagram-style local saved-place grid that opens the in-app place detail sheet, current route progress/next stop, My Routes actions, and localized app settings state when Supabase is not configured.

Supported locales are `ko`, `en`, `ja`, and `zh`.

The language switcher and home language buttons persist the active locale in `localStorage` and the `NEXT_LOCALE` cookie so reloads and future server-side locale reads can keep the same language choice.
Map categories, live Kakao pin labels, fallback map pins, and place detail category badges use the active locale's copy instead of hardcoded English category text.

On mobile, the shared app shell keeps the bottom tab bar from the root wireframes. On desktop-width screens, the same navigation switches to a left rail so map and route workflows get more usable horizontal space.

The app includes a production-only PWA runtime: `components/common/PwaRuntime.tsx` updates the document language from the active locale, and `public/sw.js` provides a static app-shell cache for manifest/icons/static chunks plus basic same-origin navigation fallback. `components/common/NetworkStatusBanner.tsx` shows a localized offline-mode banner when the browser reports a network disconnect. `components/common/PwaInstallPrompt.tsx` shows a localized home-screen install prompt only when the browser reports install eligibility.

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
- Map place detail sheets can share a same-origin `/[locale]/map?detail=1&source=share` URL through Web Share or clipboard without creating a backend public-link record.
- Saved places are visible in `/[locale]/profile` even in guest mode.
- Saved place cards open the in-app map detail sheet with `source=saved`, `detail=1`, coordinates, category/address/tags, and TourAPI content identifiers when available.
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
/api/facilities?lat=37.5665&lng=126.978&radius=500&type=all&locale=en
```

Behavior:

- Validates coordinates, radius, and facility type.
- Validates optional `locale=ko|en|ja|zh`.
- Returns deterministic local mock data sorted by walking distance.
- Adds nearby TourAPI `searchFestival2` event/festival results as `popup` facilities when `TOUR_API_KEY` exists and the request type is `all` or `popup`.
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
{ "youtube_url": "https://www.youtube.com/watch?v=...", "locale": "en" }
```

Behavior:

- Validates YouTube URLs and returns deterministic local spot extraction by default.
- Validates optional `locale=ko|en|ja|zh` and localizes deterministic mock titles, place names, and reasons.
- Calls the AI worker only when `ENABLE_AI_WORKER_ANALYSIS=true` and `AI_WORKER_URL` is set.
- Falls back to local mock analysis if the enabled worker cannot be reached.
- The frontend stores successful same-video, same-locale results in the shared 1-hour local API cache and labels cache hits as previous results.

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
    NetworkStatusBanner.tsx
    PwaRuntime.tsx
  layout/
  map/
  radar/
  route/
lib/
  analysis.ts   # local SNS analysis fallback and AI worker gate
  facilities.ts # facility types, cache-key, and local mock source
  local-api-cache.ts # 1-hour local API response cache
  location-cache.ts # 30-minute last known GPS cache
  routes.ts     # route themes, mock plans, duration helpers, local share URLs/progress
  persona-preference.ts # local persona choice storage and Home feed category mapping
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
  - Map and Radar now share a 30-minute last-known-location cache so they can render the previous GPS position immediately while fresh geolocation is pending or unavailable.
  - Map and Radar now share a 1-hour local API response cache so same-query place/facility results can render immediately and survive temporary fetch failures.
  - App screens now show a localized offline-mode banner when the browser reports a network disconnect, matching the root network-state wireframe.
  - Map rendering is now ready for Kakao Maps JavaScript SDK and safely falls back to the local preview map when no client key is configured.
  - Landing, bottom navigation, map filters, and the new in-app feature guide use readable locale-aware copy.
  - Shared app navigation now keeps the mobile bottom tabs and switches to a desktop left rail at wider breakpoints, matching the root UI design document.
  - PWA manifest metadata, app icons, shortcut icons, and Open Graph image assets are present and no longer point to missing files.
  - PWA runtime now updates the document `lang` attribute per locale and registers a production-only static service worker without affecting local development caches.
  - Map category filters and place detail sheets now use stable lucide icons/text labels instead of fragile emoji glyphs.
  - Map place details lazy-load TourAPI overview, image gallery, phone, operating time, rest day, and parking fields.
  - Map place details can save or unsave a selected place, add it into the shared local route plan, open the route editor, or launch the local Docent flow.
  - Map place details can share focused same-origin detail URLs through Web Share or clipboard without Supabase public links or paid provider calls.
  - Map place details now include no-cost S4 Seen in badges derived from local place metadata rather than live YouTube or Instagram API calls.
  - `/api/facilities` now supports validated mock-backed facility lookup with cache keys.
  - Radar page now consumes `/api/facilities`, supports geolocation fallback, radius/type filters, loading/error/retry states, localized facility cards, a local radar map preview, and no-key Google Maps handoff links.
  - Radar popup facilities can now be enriched from TourAPI `searchFestival2` with locale-aware facility cache keys while keeping mock fallback behavior.
  - `/api/routes/generate` now supports validated mock-backed route generation.
  - Persona, map, and route pages now share the route plan contract, local preview flow, `localStorage` handoff, and locale-aware UI.
  - Persona choices can now be stored as a no-cost local Home feed preference and displayed in the guest Profile hero.
  - Route page now includes a no-cost mini map preview, a whole-route in-app map CTA, per-stop Google Maps open actions, and a walking directions CTA without calling Kakao Mobility or a paid Directions API.
  - Route page now shows no-cost walking travel segments between stops using the same Haversine estimate as total walking time.
  - Route page now creates no-cost same-origin share links with encoded route state and restores those links without Supabase or a paid routing/link service.
  - Route page now tracks completed stops locally and starts guidance at the next incomplete stop without GPS polling or a paid navigation API.
  - `/api/analyze` is now local-first and gated behind `ENABLE_AI_WORKER_ANALYSIS` for worker calls.
  - Analyze page now has English local-first copy, mock/source indicators, and cleaner result cards.
  - Analyze results now link detected places into the map and can create a local editable route from candidates.
  - Analyze and Radar screen copy now comes from shared locale resources for Korean, English, Japanese, and Chinese.
  - Persona and Route screen copy now comes from shared locale resources, and route generation localizes mock plan titles/summaries when a locale is provided.
  - The in-app feature guide now includes per-feature shortcut actions instead of only static descriptions.
  - Home entry feature cards and trend chips now route directly into app workflows instead of acting as static labels.
  - Home entry now includes a TourAPI-backed horizontal K-spot feed with category filters, heart save controls, and map handoff links.
  - Route stops now open a local AI Docent screen with captions and browser voice playback, keeping the guide experience available without OpenAI TTS cost.
  - Docent now includes a user-clicked 100m arrival check that uses route/map coordinates, browser geolocation, and local Haversine distance calculation without background GPS polling or paid services.
  - Profile now works as a guest-mode dashboard with local saved places, a current route progress card, next-stop context, and My Routes actions without needing Supabase.
  - Profile settings rows are now localized for Korean, English, Japanese, and Chinese instead of remaining hardcoded in English.
  - Landing, login modal, top bar, language switcher, profile page, common error fallback, and key map/detail labels now use locale-aware copy for Korean, English, Japanese, and Chinese.
  - Login modal now exposes accessible dialog semantics while keeping the local guest flow available without Supabase credentials.
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
