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
- Repaired broken Korean, Japanese, and Chinese locale message files and added readable translations for shared MVP copy.
- Localized visible landing, bottom navigation, language labels, map category filters, and key map state text.
- Fixed corrupted app metadata and web app manifest descriptions.
- Generated missing PWA icons, favicon, shortcut icons, and Open Graph image assets referenced by the manifest and metadata.

## Still Gated Or Larger Scope

- Kakao Maps JavaScript SDK requires a browser key and should stay behind approval until provided.
- Supabase auth persistence requires project credentials and OAuth setup.
- Redis/Upstash caching requires credentials; cache keys are prepared but no external cache is connected.
- AI analysis, AI route generation, and AI docent features remain local/mock-first until model/provider keys and any cost approval are explicit.
- Home Feed and full AI Docent screens are present in the root wireframes but are not yet implemented as first-class pages.
