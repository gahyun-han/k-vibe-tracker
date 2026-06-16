# Improvement Log

Last updated: 2026-06-17

This log tracks concrete product and implementation improvements made while aligning the MVP with the root HTML specifications and the Korea Tourism Organization OpenAPI manuals.

## 2026-06-17

- Added a no-cost Radar map preview with radius rings, current-position marker, and typed facility pins, using the existing local/mock facility coordinates.
- Connected Radar map pins and expanded facility cards to user-clicked Google Maps search URLs. No Google Maps API key, Directions API, or Kakao Mobility call is used.
- Added facility helper tests for cache keys, radius filtering/sorting, and no-key Google Maps facility handoff URLs.
- Added a no-cost Docent arrival check that reads route/map `lat` and `lng` query values, asks for browser geolocation only after the user taps the check button, and shows whether the stop is within the root-spec 100m docent radius.
- Localized the Profile settings section for Korean, English, Japanese, and Chinese instead of leaving the settings rows hardcoded in English.
- Added a production-only PWA runtime that updates the document `lang` attribute from the active locale and registers a static service worker for app icons, manifest, static chunks, and a basic navigation fallback.
- Added a shared 30-minute last-known-location cache in `localStorage`, then connected Map and Radar so they can show the previous GPS position immediately while fresh geolocation is being requested or when GPS fails.
- Added a shared 1-hour local API response cache for Map places and Radar facilities. Successful responses are stored in `localStorage`, cached data renders immediately on revisit, and fetch failures fall back to cached content when available.
- Localized Map and Radar data-source labels for TourAPI, mock, and cache states.
- Added a localized offline-mode banner in the shared app layout. It listens to browser `online`/`offline` events and tells users that cached places, facilities, and app screens are being shown when available.
- Persisted the active locale in `localStorage` and the `NEXT_LOCALE` cookie from the language switcher so language choice survives app reloads and future server-side locale reads.
- Replaced corrupted toast symbols with lucide icons, accessible alert/status roles, and an icon close button.
- Re-verified Kakao Maps after localhost domain registration in Chrome and fixed the Map screen height so the live Kakao renderer receives a nonzero viewport-sized container.
- Localized Map category tags, live Kakao overlay labels, and fallback map pin labels so non-English routes no longer leak English category text such as `Food` or `Culture`.
- Clarified the Chinese language selector label as Simplified Chinese and added test coverage for non-empty, non-placeholder language names.
- Added a localized no-cost PWA install prompt that listens for the browser `beforeinstallprompt` event, lets users add K-Vibe to the home screen, and remembers dismissals locally.
- Replaced Radar text abbreviations such as `WC`, `Rx`, and `Pop` with shared lucide facility icons across filters, map pins, and facility cards, and normalized the Radar status separator for more reliable rendering.
- Added a responsive app shell that keeps the bottom tab bar on mobile and switches to a left navigation rail on desktop, matching the root UI design direction without changing page-level workflow logic.
- Made the home language buttons persist the selected locale to `localStorage` and the `NEXT_LOCALE` cookie, matching the shared language switcher behavior.
- Connected the Radar popup facility path to TourAPI `searchFestival2` when `TOUR_API_KEY` is configured. Nearby event/festival results are normalized as `popup` facilities, locale-aware cache keys now separate Radar responses, and the endpoint still falls back to local mock facilities when TourAPI is unavailable or returns no nearby events.
- Improved the Route editor for the responsive app shell by replacing the viewport-fixed CTA bar with an in-content sticky action bar and adding icon move controls so stops can be reordered without drag-and-drop.
- Added no-cost local Route sharing. The editor now copies or shares a same-origin URL with an encoded `route` payload, and opening that URL restores the route into the local editor without Supabase, Kakao Mobility, a backend public-link table, or any paid API.
- Added no-cost Route progress tracking. Travelers can mark stops complete in the local editor, completed stops get a clear check state, progress is stored locally per route, and Start Guidance opens the next incomplete stop instead of always restarting at stop one.

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

- Kakao Maps JavaScript SDK is configured and verified for `http://localhost:3000`; `127.0.0.1` must still be registered separately in Kakao Developers if that host should load the SDK.
- Kakao Mobility routing remains gated; the current route screen uses user-clicked Google Maps URLs for no-key walking directions.
- Supabase auth persistence and server-backed public route links require project credentials and OAuth/storage setup. The current Route share link is local encoded URL state only.
- Redis/Upstash caching requires credentials; cache keys are prepared but no external cache is connected.
- AI analysis, AI route generation, and provider-generated AI docent narration remain local/mock-first until model/provider keys and any cost approval are explicit.
- Automatic background GPS polling, push notifications, and paid/provider TTS for the Docent flow remain gated. The current arrival check is user-clicked and uses only browser geolocation plus local distance calculation.
- IndexedDB POI data packs, offline map tiles, and offline synced route/place history remain larger-scope work beyond the current static PWA shell cache, install prompt, offline banner, 30-minute last-known-location cache, and 1-hour API response cache.
- A richer Home Feed, Supabase sync for saved places/routes, and production-grade TourAPI/Redis caching are still larger-scope follow-ups from the root wireframes.
