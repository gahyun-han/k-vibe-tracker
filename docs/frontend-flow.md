# Frontend Flow Notes

Last updated: 2026-06-16

This project is in local-first development mode. Pages should remain usable without paid API keys or production credentials.

## Local Development Runtime

- Preferred runtime when Windows npm is unavailable: Docker Compose.
- Start the app with `docker compose up app`.
- Run checks with `docker compose run --rm app npm run type-check`, `docker compose run --rm app npm test`, and `docker compose run --rm app npm run build`.
- Detailed container instructions live in `docs/docker-development.md`.

## Navigation

- Bottom navigation lives in `components/layout/BottomNav.tsx`.
- Top navigation lives in `components/layout/TopBar.tsx` and exposes the language switcher plus account entry.
- The feature guide button lives in `components/common/TutorialButton.tsx` and is mounted by `components/layout/AppLayout.tsx` on the main app screens.
- The home entry at `/[locale]` presents local-first status, feature shortcuts, and trend chips that open focused map views.
- The Route tab opens `/[locale]/persona` first, because route generation is the entry workflow.
- Generated routes can be saved into `localStorage` and edited at `/[locale]/route`.
- Route stops and the primary guidance action can open `/[locale]/docent` for local voice captions.

## Account Flow

- Login UI lives in `components/auth/LoginModal.tsx`.
- Browser and server Supabase clients return `null` when public Supabase env vars are missing.
- Profile stays usable without Supabase credentials and explains that account sync is disabled in local development.
- Login attempts without Supabase env show an inline local-development message instead of crashing.

## Local Data Contracts

### Places

- UI: `app/[locale]/map/page.tsx`
- Map renderer: `components/map/KakaoMapView.tsx`
- API: `app/api/places/route.ts`
- Helpers: `lib/tourapi.ts`
- Development fallback: deterministic mock places when `TOUR_API_KEY` is absent or TourAPI fails.
- Map SDK fallback: Kakao Maps JavaScript SDK loads only when `NEXT_PUBLIC_KAKAO_MAP_KEY` is configured. Without it, the local preview map remains active and no Kakao request is made.
- Locale query: the map sends `locale=ko|en|ja|zh` to `/api/places`, which chooses the matching TourAPI service endpoint when live data is available.
- Category mapping follows the Korea Tourism Organization manuals: Korean content type IDs for `KorService2`, multilingual content type IDs for `EngService2`, `JpnService2`, and `ChsService2`.
- Category filters and place detail sheets use lucide icons and text labels to avoid locale/font-dependent emoji rendering.
- `Add to Route` stores the selected place in the shared local route plan and opens `/[locale]/route`.

### Analysis

- UI: `app/[locale]/analyze/page.tsx`
- API: `app/api/analyze/route.ts`
- Helpers: `lib/analysis.ts`, `lib/youtube.ts`
- Development fallback: deterministic mock spot extraction.
- AI worker calls are disabled unless `ENABLE_AI_WORKER_ANALYSIS=true` and `AI_WORKER_URL` is configured.

### Facilities

- UI: `app/[locale]/radar/page.tsx`
- API: `app/api/facilities/route.ts`
- Helpers: `lib/facilities.ts`
- Development fallback: deterministic mock facilities until live facility sources are approved.

### Routes

- Generator UI: `app/[locale]/persona/page.tsx`
- Editor UI: `app/[locale]/route/page.tsx`
- Docent UI: `app/[locale]/docent/page.tsx`
- API: `app/api/routes/generate/route.ts`
- Helpers: `lib/routes.ts`
- Development fallback: deterministic mock route plans until AI generation is approved.
- Local persistence key: `k-vibe-current-route`
- Route editor mutations are written back to the same local persistence key.
- Analyze results can write a draft route into this same key and open `/[locale]/route`.
- Docent playback uses browser `speechSynthesis` with generated captions from the selected route stop. It does not call OpenAI TTS or any paid API.

## Expected Page States

Every data-backed page should expose:

- Loading state while the API request is active.
- Empty state when filters remove all items.
- Error state with a retry path.
- Mock/source hint while the app is running without external integrations.
- Clear copy that tells developers whether a local mock or external source produced the result.
- Shared navigation, landing, tutorial, and key map states should use locale-aware copy for `ko`, `en`, `ja`, and `zh`.

## Approval-Gated Work

Do not wire paid or quota-based services directly from frontend work. Add the contract and local fallback first, then record any key, quota, or permission need in `docs/approval-log.md`.
