# Improvement Log

Last updated: 2026-06-16

This log tracks concrete product and implementation improvements made while aligning the MVP with the root HTML specifications and the Korea Tourism Organization OpenAPI manuals.

## 2026-06-16

- Verified the provided TourAPI key through the local Next.js route without exposing the secret in git or logs.
- Updated `/api/places` to accept `locale=ko|en|ja|zh` and route requests to `KorService2`, `EngService2`, `JpnService2`, or `ChsService2`.
- Updated TourAPI category mapping for multilingual service content type IDs, using the Korea Tourism Organization multilingual category manual as the reference.
- Changed TourAPI location search ordering to distance order for nearby map results.
- Added locale-aware place API cache keys so future Redis caching can safely separate Korean and multilingual responses.
- Added an always-available feature guide button inside the app shell. The guide explains Map, Analyze, Route, Radar, and Profile capabilities in the active locale.
- Upgraded the feature guide with per-feature shortcut buttons so users can jump directly into Map, Analyze, Route generation, Route/Docent, Radar, or Profile from the tutorial sheet.
- Repaired broken Korean, Japanese, and Chinese locale message files and added readable translations for shared MVP copy.
- Localized visible landing, bottom navigation, language labels, map category filters, and key map state text.
- Fixed corrupted app metadata and web app manifest descriptions.
- Generated missing PWA icons, favicon, shortcut icons, and Open Graph image assets referenced by the manifest and metadata.
- Added Kakao Maps JavaScript SDK scaffolding behind `NEXT_PUBLIC_KAKAO_MAP_KEY`. The app now uses the real map renderer only when a client key exists and otherwise keeps the no-cost local preview map.
- Connected the home trend chips to focused map views so the first screen behaves more like the wireframed Home Feed instead of a static landing page.
- Reworked the home entry into a TourAPI-backed Seoul K-spot feed with horizontal cards, category filters, local save controls, and focused map handoff links.
- Localized the Analyze and Radar user-facing screens through the shared UI copy table so the root 4-language requirement covers the shipped local-first workflows.
- Localized the Persona and Route user-facing screens through the same shared UI copy table, including route editor status messages, sample stop copy, persona option labels, and generated mock route titles/summaries.
- Localized shared app chrome and account UI through the same copy table, including the login modal, top bar actions, common error fallback, profile avatar text, map route handoff labels, place detail close/crowd labels, and map refresh controls.
- Updated `/api/routes/generate` to accept `locale=ko|en|ja|zh` in the request body and use localized route plan copy while keeping the deterministic no-cost mock generator.
- Connected Analyze results to downstream workflows: individual detected places can open the map, and the full candidate set can draft an editable local route.
- Added a no-cost local AI Docent page. Route stops now open captions and browser `speechSynthesis` playback without calling a paid TTS provider.
- Added a TourAPI-backed place detail endpoint using `detailCommon2`, `detailIntro2`, and `detailImage2`, with mock fallback and cache-key preparation.
- Updated the map place detail sheet to lazy-load real overview, image gallery, phone, operating time, rest day, and parking data, then launch the local Docent flow from that enriched detail.
- Added local saved places with a heart control on place detail sheets, a shared `k-vibe-saved-places` contract, and a guest-mode profile saved-place grid.
- Added dialog semantics to the login modal so browser automation and assistive tech can identify the localized account sheet.
- Added a no-cost route mini map preview and Google Maps walking directions handoff to the route screen, matching the root HTML route-navigation direction without using Kakao Mobility or another paid routing API.
- Localized route crowd badges by passing the active locale labels into the shared `CrowdBadge` component.

## Still Gated Or Larger Scope

- Kakao Maps JavaScript SDK is configured and verified for `http://localhost:3000`; `127.0.0.1` still returns a Kakao domain mismatch unless that host is registered too.
- Kakao Mobility routing remains gated; the current route screen uses user-clicked Google Maps URLs for no-key walking directions.
- Supabase auth persistence requires project credentials and OAuth setup.
- Redis/Upstash caching requires credentials; cache keys are prepared but no external cache is connected.
- AI analysis, AI route generation, and provider-generated AI docent narration remain local/mock-first until model/provider keys and any cost approval are explicit.
- A richer Home Feed, Supabase sync for saved places/routes, and production-grade TourAPI/Redis caching are still larger-scope follow-ups from the root wireframes.
