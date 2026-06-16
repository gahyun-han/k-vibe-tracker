# Approval and Cost Hold Log

Last updated: 2026-06-16

Do not enable or run anything in this list without explicit user approval if it can incur cost, consume paid quota, use private browser state, or require external permissions.

## Deferred Items

- Claude CLI focused review: allowed by the user for targeted use, but keep prompts narrow and avoid repeated calls when local verification is sufficient.
- Supabase project credentials and Google OAuth setup: required for real login/session/profile persistence. Local guest flows run without these keys.
- TourAPI key: provided by the user for local development and stored only in `.env.local`, which is gitignored. The user confirmed all 26 Korea Tourism Organization OpenAPI service applications are approved under the same key. `/api/places` still uses mock fallback if the key is absent or TourAPI fails.
- Live facility data sources: required for production restroom, pharmacy, convenience store, and pop-up data. `/api/facilities` uses local mock data until source terms, quotas, and any costs are approved.
- YouTube Data API key: required for live K-content video metadata.
- AI worker analysis: disabled by default. `/api/analyze` only calls `AI_WORKER_URL` when `ENABLE_AI_WORKER_ANALYSIS=true`, because the worker may consume OpenAI or hosting quota.
- OpenAI API key: required for AI-generated route or recommendation features. `/api/routes/generate` uses local deterministic route plans until this is approved.
- Kakao Maps JavaScript key: required for the production map SDK.
- Upstash Redis credentials: required for external Redis caching.
- Push access to `gahyun-han/k-vibe-tracker`: needs repository permission from the owner if that upstream should receive changes.
- Chrome automation using the user's logged-in browser state: requires explicit approval because it can access private session context.

## Safe Without Additional Approval

- Local type-check, unit tests, and production build.
- Localhost browser verification.
- Commits and pushes to the already writable `hslee-origin/hslee` branch.
