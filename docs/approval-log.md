# Approval and Cost Hold Log

Last updated: 2026-06-17

Do not enable or run anything in this list without explicit user approval if it can incur cost, consume paid quota, use private browser state, or require external permissions.

## Deferred Items

- Claude CLI focused review: allowed by the user for targeted use, but keep prompts narrow and avoid repeated calls when local verification is sufficient.
- Claude CLI diff review attempt on 2026-06-16 stopped at the `$0.01` budget cap with no review result applied; do not raise the cap unless the user explicitly approves a higher spend.
- Claude CLI was not used for the 2026-06-17 Docent/Profile pass because local type-check, unit tests, build, and Chrome verification were sufficient, and the previous budget cap remains in effect.
- Claude CLI was not used for the 2026-06-17 Docent caption-section pass because it may consume paid quota and the change could be verified locally with unit tests, type-check, build, and browser inspection.
- Claude CLI was not used for the 2026-06-17 Analyze locale pass because it may consume paid quota and the change could be verified locally with deterministic unit/API tests and browser inspection.
- Claude CLI was not used for the 2026-06-17 Analyze loading-state pass because it may consume paid quota and the change could be verified locally with copy tests, type-check, build, and browser inspection.
- Claude CLI was not used for the 2026-06-17 Analyze local-cache pass because it may consume paid quota and the change could be verified locally with unit tests, type-check, build, and browser inspection.
- Claude CLI was not used for the 2026-06-17 Analyze SNS platform-detection pass because it may consume paid quota and the change could be verified locally with URL/API/copy tests, type-check, build, and browser inspection.
- Claude CLI was not used for the 2026-06-17 Home story-topic pass because it may consume paid quota and the change could be verified locally with copy tests, type-check, build, and browser inspection.
- Claude CLI was not used for the 2026-06-17 Profile saved-place grid pass because it may consume paid quota and the change could be verified locally with type-check, build, and browser inspection.
- Claude Code CLI availability was checked locally with `claude --version` on 2026-06-17, but no Claude model prompt was sent for the S4 place-detail gallery pass because that may consume paid quota and local implementation plus verification was sufficient.
- Claude CLI was not used for the 2026-06-17 Persona 3-step flow pass because it may consume paid quota and the change could be verified locally with copy tests, type-check, build, and browser inspection.
- Claude CLI was not used for the 2026-06-17 Persona theme expansion pass because it may consume paid quota and the change could be verified locally with route/API/copy tests, type-check, build, and browser inspection.
- Supabase project credentials and Google OAuth setup: required for real login/session/profile persistence and cross-device saved-place sync. Local guest flows, local saved places, and local route editing run without these keys.
- TourAPI key: provided by the user for local development and stored only in `.env.local`, which is gitignored. The user confirmed all 26 Korea Tourism Organization OpenAPI service applications are approved under the same key. `/api/places`, `/api/places/[contentId]`, and Radar popup enrichment through `searchFestival2` still use mock fallback if the key is absent or TourAPI fails. TourAPI is a public-data API, but local live checks consume the development account request quota; one `/api/facilities` popup verification call, one `/ko/map` page verification, and one S4 place-detail gallery verification that opened a local map result plus two place detail sheets were made on 2026-06-17.
- Live facility data sources: still required for production restroom, pharmacy, convenience store, and cafe restroom data. `/api/facilities` uses local mock data for those facility types until source terms, quotas, and any costs are approved.
- YouTube Data API key: required for live K-content video metadata.
- Instagram live extraction provider/API: deferred. The app now detects Instagram links locally but does not call Instagram, scraping services, AI workers, or paid providers for those links without explicit approval.
- AI worker analysis: disabled by default. `/api/analyze` only calls `AI_WORKER_URL` when `ENABLE_AI_WORKER_ANALYSIS=true`, because the worker may consume OpenAI or hosting quota.
- OpenAI API key: required for AI-generated route, recommendation, or provider TTS features. `/api/routes/generate` uses local deterministic route plans, and `/[locale]/docent` uses no-cost browser speech synthesis until this is approved.
- Automatic Docent GPS polling, push notification prompts, and provider-generated TTS remain deferred. The current arrival check is user-clicked and uses browser geolocation plus local Haversine distance calculation only.
- Kakao Maps JavaScript key: provided by the user for local development and stored only in `.env.local`, which is gitignored. Current verification on 2026-06-17 shows Kakao Maps SDK loads for `http://localhost:3000`, Chrome reaches `data-map-mode="ready"` on `/ko/map` with rendered Kakao tile nodes and no console warnings/errors, while `http://127.0.0.1:3000` still falls back locally unless that host is also registered in Kakao Developers. The app still has a no-cost fallback and only attempts Kakao Maps when `NEXT_PUBLIC_KAKAO_MAP_KEY` is configured.
- Upstash Redis credentials: required for external Redis caching.
- Push access to `gahyun-han/k-vibe-tracker`: needs repository permission from the owner if that upstream should receive changes.
- Chrome automation using the user's logged-in browser state: requires explicit approval because it can access private session context.

## Safe Without Additional Approval

- Local type-check, unit tests, and production build.
- Localhost browser verification.
- No-cost local Route share URLs that encode route state in the same-origin `route=` query parameter and restore it into `localStorage`.
- No-cost local Route progress tracking that stores completed stop IDs in `localStorage` and does not use GPS polling, Kakao Mobility, or a backend route session.
- No-cost Profile My Routes card that reads local route/progress state and does not use Supabase, GPS, Kakao Mobility, or backend route sessions.
- Commits and pushes to the already writable `hslee-origin/hslee` branch.
