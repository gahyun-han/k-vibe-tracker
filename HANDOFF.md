# K-Vibe Tracker — Agent Handoff

> Last updated: this document is the single source of truth for another agent (or
> developer) picking up where the current work left off. Read it top-to-bottom
> before touching code.

## 1. What this project is

**K-Vibe Tracker** is a Next.js (App Router) Korean travel / K-content spot
discovery app. A user pastes a Korean YouTube/SNS video URL, an AI pipeline
extracts real Korean places from it, and the app builds a walkable **route**
(with a Kakao map preview) between those places.

- **Framework**: Next.js 14 App Router + TypeScript + Tailwind.
- **i18n**: `app/[locale]/...` (`ko` / `en`), messages in `messages/`.
- **Deploy**: Vercel. Working branch is **`hslee`** → auto-deploys to
  `https://k-vibe-tracker-lemon.vercel.app`.
- **Maps**: Kakao Maps JS SDK.
- **AI**: Groq (`llama-3.3-70b-versatile`) extracts spots **with coordinates**.

## 2. Architecture (layered)

```
app/
  [locale]/...            → UI pages (client components)
  api/*/route.ts          → THIN handlers, only re-export from backend/presentation_api
backend/                  → server-only code (never imported by client bundles)
  config/                 → env/config readers
  dependency.ts           → feature flags / external service wiring
  business_services/      → domain/business logic (guards, etc.)
  ai_services/            → gemini.ts (Groq primary), youtube-meta.ts
  presentation_api/       → request handlers (analyze, places, routes-generate, ...)
frontend/
  api/                    → centralized client-side data layer (client.ts, analyze.ts,
                            places.ts, routes.ts, facilities.ts, mock-data.ts)
components/               → React UI
  map/                    → kakaoLoader.ts (shared SDK loader + types),
                            KakaoMapView.tsx, PlaceDetailModal.tsx
  route/                  → RouteMiniMap.tsx, route builder UI
lib/
  domain/                 → shared domain logic (routes.ts, storage keys, ...)
i18n/, messages/          → localization
ai-worker/                → optional standalone worker (config/repositories/services/...)
```

**Dependency rules (enforced by review):**
- `app/api/*/route.ts` must **only delegate** to `backend/presentation_api/*`
  (e.g. `export { postAnalyze as POST } from '@/backend/presentation_api/analyze';`).
- UI (`app/`, `components/`) fetches through `frontend/api/*` — **no raw
  `fetch('/api/...')`** in components.
- `frontend/api/*` must **not** import from `backend/` (would leak server code
  into the client bundle).
- `backend/*` must **not** import from `frontend/` or `components/`.

## 3. Environment variables

Copy `.env.example` → `.env.local`. Key ones:

| Var | Purpose | Notes |
| --- | --- | --- |
| `GROQ_API_KEY` | Spot extraction (primary AI) | Groq key `gsk_...`. Required for real spots. |
| `NEXT_PUBLIC_KAKAO_MAP_KEY` | Kakao Maps JS SDK | **JS key**, inlined in client bundle. Maps only. |
| `KAKAO_MAP_REST_KEY` | (legacy) REST geocoding | Currently the SAME JS key → returns 401 for REST. That's why we use Groq-provided coords instead. |

> **Do not commit real keys.** They live in Vercel project env + local `.env.local`.

## 4. Key technical decisions / gotchas

1. **Coordinates come from the LLM, not Kakao REST geocoding.**
   `backend/ai_services/gemini.ts` `SPOT_EXTRACTION_PROMPT` asks Groq to return
   `lat`/`lng` on each `RawSpot`. `backend/presentation_api/analyze.ts` prefers
   `spot.lat/lng` and only falls back to `geocodePlace`. This is what fixed the
   "0m / 0min" route legs. REST geocoding returns 401 (key is a JS key).

2. **0m legs on OLD saved routes** are expected: they were saved before the coords
   fix, or Groq occasionally returns near-identical coords for adjacent places
   (e.g. 경포호/경포대). New analyses get proper coords.

3. **RouteMiniMap Kakao rendering** (`components/route/RouteMiniMap.tsx`):
   The component returns `null` until it has stops, so its container is not in the
   DOM on first render. It now uses a **callback ref** (`setContainerEl`) so the
   init effect runs exactly when the container mounts, guards against double-init
   (`if (mapRef.current) return`), and runs `relayout()` + a `ResizeObserver` so
   the map is sized correctly and re-fits bounds. Mirror this pattern if you add
   any other conditionally-rendered map.
   `components/map/KakaoMapView.tsx` is the reference implementation (its container
   is always rendered, so it "just worked").

4. **`components/map/kakaoLoader.ts`** is the single shared Kakao SDK loader and
   type source (`loadKakaoMaps`, `KAKAO_MAP_KEY`, and the `Kakao*` types incl.
   `LatLngBounds`/`Polyline`). Both map components import from it — don't inline a
   second loader.

5. **Route → Map deep link**: `lib/domain/routes.ts` `buildRouteMapUrl` builds
   `/${locale}/map?...source=route-map`. `app/[locale]/map/page.tsx` reads the
   saved route from localStorage (`CURRENT_ROUTE_STORAGE_KEY`) and shows all stops
   + a left list when `source=route-map`, using `KakaoMapView fitToPlaces`.

## 5. How to build / verify in THIS environment

`node` / `npm` / `npx` are **not on PATH**. Use VS Code's bundled Electron as a
Node runtime. See `scripts/verify.txt` for copy-paste commands. Summary:

- **Type-check** (authoritative gate): run tsc via Electron → expect exit code 0.
- **ESLint** via Electron emits FALSE-POSITIVE `import/no-unresolved` (missing
  native `unrs-resolver` binding). Ignore those; only real rule violations count
  (import/order, prefer-optional-chain, etc.).
- **Vitest CANNOT run** here (missing `@rollup/rollup-win32-x64-msvc` binding).
  Rely on tsc + production smoke tests.
- **CI is `action_required`** (manual approval) on `hslee` PRs — it won't auto-run.

## 6. Git / deploy flow

- Commit to **`hslee`**, push, wait ~90–120s for Vercel, then smoke-test:
  - `GET /ko/route` → 200
  - `GET /ko/map` → 200
  - `GET /api/debug/ai-status?url=<youtube>` → JSON pipeline trace
- **Every commit must include** the trailer:
  `Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>`
- Prefer the GitKraken git MCP tools for git operations.

## 7. Known-good / done

- [x] Groq returns real spots with coordinates (verified in production).
- [x] Shared Kakao loader extracted (`components/map/kakaoLoader.ts`).
- [x] `KakaoMapView` `fitToPlaces` bounds fitting.
- [x] `/map` shows the full saved route on `source=route-map`.
- [x] **RouteMiniMap renders a real Kakao map** (callback-ref fix + relayout).
- [x] `app/api/debug/ai-status` refactored to delegate to
  `backend/presentation_api/debug-ai-status.ts` (layer conformance).
- [x] Structure review: all layers conform to the dependency rules above.
- [x] **K-content one-day route catalog** — `lib/domain/k-content.ts`
  models the DB schema (PERSONA_IMAGE/PERSONA/LOCATION/DOCENT) for the
  completed persona route feature; `buildKContentRoutePlan()` turns a persona
  (BTS뷔/아이유/제니/장원영) into a scheduled `RoutePlan`. Persona picker lives
  at the top of `app/[locale]/persona/page.tsx` ("홈>루트"). Labels in ui-copy
  for all 4 locales. When expanding the catalog, include lat/lng so route legs
  and the map preview are non-zero.

## 8. Ideas / next improvements (not yet done)

- Dedupe / nudge near-identical adjacent coords so route legs never show a bogus
  0m (or clearly label "same location").
- Add an e2e smoke script that hits the deployed URLs and asserts 200 + key HTML.
- Consider unifying `KAKAO_MAP_REST_KEY` handling (drop it, or provision a real
  REST key) to remove the dead geocoding fallback.
