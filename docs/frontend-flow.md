# Frontend Flow Notes

Last updated: 2026-06-17

This project is in local-first development mode. Pages should remain usable without paid API keys or production credentials.

## Local Development Runtime

- Preferred runtime when Windows npm is unavailable: Docker Compose.
- Start the app with `docker compose up app`.
- Run checks with `docker compose run --rm app npm run type-check`, `docker compose run --rm app npm test`, and `docker compose run --rm app npm run build`.
- Detailed container instructions live in `docs/docker-development.md`.

## Navigation

- Responsive app navigation lives in `components/layout/BottomNav.tsx`: it renders the bottom tab bar on mobile and a left navigation rail on desktop-width screens.
- Top navigation lives in `components/layout/TopBar.tsx` and exposes the language switcher plus account entry.
- `components/common/LanguageSwitcher.tsx` and the home language buttons persist the active locale to `localStorage` under `k-vibe-preferred-locale` and to the `NEXT_LOCALE` cookie for reload and future server-side locale continuity.
- The feature guide button lives in `components/common/TutorialButton.tsx` and is mounted by `components/layout/AppLayout.tsx` on the main app screens. Each guide step includes a localized shortcut into the related workflow.
- PWA runtime lives in `components/common/PwaRuntime.tsx`; it updates `document.documentElement.lang` from the active route locale and registers `/sw.js` only in production builds.
- Offline network status UI lives in `components/common/NetworkStatusBanner.tsx` and is mounted by `components/layout/AppLayout.tsx` above each screen's main content.
- PWA install UI lives in `components/common/PwaInstallPrompt.tsx`. It appears only when the browser emits `beforeinstallprompt`, calls the browser install prompt after a user tap, and stores dismissals in `localStorage`.
- The home entry at `/[locale]` presents local-first status, root S2-style story topic filters, TourAPI-backed Seoul feed cards with localized crowd badges, feature shortcuts, and trend chips that open focused map views. Feed card image/text taps follow the root S2 flow by opening `/[locale]/map` with `detail=1` and showing the local place detail sheet.
- Home feed stores successful `/api/places` responses in the shared 1-hour local API cache, can display cached feed cards if live refresh fails, and exposes a localized retry button in the error state.
- If a local persona preference exists, the home feed applies its mapped category filter on load and shows a localized personalization chip for the selected route mood.
- The Route tab opens `/[locale]/persona` first, because route generation is the entry workflow.
- Generated routes can be saved into `localStorage` and edited at `/[locale]/route`.
- Route stops and the primary guidance action can open `/[locale]/docent` for local voice captions, script progress, and a user-clicked 100m arrival check when stop coordinates are available.

## Account Flow

- Login UI lives in `components/auth/LoginModal.tsx`.
- Login UI copy comes from `lib/ui-copy.ts` for `ko`, `en`, `ja`, and `zh`; the modal exposes dialog semantics with `aria-modal` and a labelled title.
- Browser and server Supabase clients return `null` when public Supabase env vars are missing.
- Profile stays usable without Supabase credentials, shows local saved places in a root S12-style square visual grid that opens the S4-style place detail sheet, shows the current local route with a tappable route card, route progress, next-stop context, and Continue/Edit actions, and exposes localized settings rows for language, notifications, offline maps, and map data source state.
- Profile also reads the local persona preference and displays the selected persona/mood in the profile hero.
- Login attempts without Supabase env show an inline local-development message instead of crashing.

## Local Data Contracts

### PWA Shell

- Runtime: `components/common/PwaRuntime.tsx`
- Service worker: `public/sw.js`
- The root document defaults to `lang="ko"` before hydration, then the runtime updates it to `ko`, `en`, `ja`, or `zh` based on the active URL locale.
- The service worker precaches the manifest, icons, Open Graph image, and Korean start route, then caches Next static chunks and same-origin navigations on demand.
- Service worker registration is production-only so local development is not affected by stale caches.
- The install prompt listens for browser install eligibility and is localized for `ko`, `en`, `ja`, and `zh`. It does not call an external provider.
- Last known GPS position is stored in `localStorage` through `lib/location-cache.ts` with a 30-minute TTL. Map and Radar read it before requesting fresh geolocation so the UI can render immediately in poor network or indoor GPS conditions.
- Map and Radar API responses are stored in `localStorage` through `lib/local-api-cache.ts` with a 1-hour TTL. Pages render cached results immediately on revisit and fall back to cached content when a same-query fetch fails.
- The shared offline banner listens to browser `online` and `offline` events and shows localized copy explaining that cached places, facilities, and app screens are used when available.
- Offline maps, IndexedDB TourAPI/POI data packs, and synced offline account history are still larger-scope follow-ups.

### Places

- Home feed UI: `app/[locale]/page.tsx`
- UI: `app/[locale]/map/page.tsx`
- Map renderer: `components/map/KakaoMapView.tsx`
- API: `app/api/places/route.ts`
- Detail API: `app/api/places/[contentId]/route.ts`
- Helpers: `lib/tourapi.ts`
- Development fallback: deterministic mock places when `TOUR_API_KEY` is absent or TourAPI fails.
- Home feed requests the same `/api/places` contract with the active locale, shows the response source, stores successful responses in the shared local API cache, supports local category filters, can save places, and hands selected cards to the map with `source=home`, `detail=1`, category/address/tags, crowd level, and TourAPI content identifiers when available.
- Map uses the shared last-known-location cache before browser geolocation resolves, then refreshes coordinates and the cache when a new GPS fix succeeds.
- Map stores successful `/api/places` responses in the shared local API cache and displays cached place lists while a fresh same-query request is pending or if it fails.
- Map SDK fallback: Kakao Maps JavaScript SDK loads only when `NEXT_PUBLIC_KAKAO_MAP_KEY` is configured. Without it, the local preview map remains active and no Kakao request is made.
- Current local verification shows the Kakao SDK loads on `http://localhost:3000`, `/ko/map` reaches `data-map-mode="ready"` in Chrome with a nonzero map container, rendered Kakao tile images, and no Kakao console errors.
- Map FAB stack follows the root S3 direction: the search FAB opens `/[locale]/analyze` for SNS spot analysis, and the location FAB refreshes the current/last-known location.
- Locale query: the map sends `locale=ko|en|ja|zh` to `/api/places`, which chooses the matching TourAPI service endpoint when live data is available.
- Category mapping follows the Korea Tourism Organization manuals: Korean content type IDs for `KorService2`, multilingual content type IDs for `EngService2`, `JpnService2`, and `ChsService2`.
- Category filters, map list icons, live Kakao overlay labels, fallback pin labels, and place detail sheets use lucide icons plus locale-aware labels instead of hardcoded English category strings.
- `Add to Route` stores the selected place in the shared local route plan and opens `/[locale]/route`.
- Heart save stores or removes the selected place in `localStorage` under `k-vibe-saved-places`.
- Place detail sheets lazy-load TourAPI `detailCommon2`, `detailIntro2`, and `detailImage2` through the server detail API for overview, images, phone, operating time, rest day, and parking fields. When multiple images are available, the detail sheet exposes a compact image gallery that switches the hero image without another provider call. The sheet also renders root S4-style Seen in badges for YouTube and Instagram from deterministic local place metadata, so it does not call live SNS APIs or scraping providers.
- Place detail sharing is no-cost and local-first: the sheet uses Web Share when available, otherwise copies a same-origin `/[locale]/map?detail=1&source=share` URL with coordinates, category, address, tags, and optional TourAPI identifiers. It does not create a backend public-link row or call a paid maps/routing provider.
- Place detail sheets can open `/[locale]/docent` with the selected place overview and coordinates as the local guide caption and arrival-check source.

### Persona Preference

- UI: `app/[locale]/persona/page.tsx`, `app/[locale]/page.tsx`, `app/[locale]/profile/page.tsx`
- Helper: `lib/persona-preference.ts`
- Local persistence key: `k-vibe-persona-preference`
- The persona route generator now saves the selected theme/detail locally when generating a route, and the confirmation step also exposes a no-cost Personalize Feed action that saves the preference and returns to Home.
- Home maps the saved persona/detail to an existing local feed category, highlights the matching story filter, and keeps using the existing `/api/places` response rather than calling an AI or recommendation provider.
- Profile shows the active local persona/mood in the hero card. Supabase account sync for persona history remains gated.

### Saved Places

- UI: `app/[locale]/profile/page.tsx`
- Helpers: `lib/saved-places.ts`
- Local persistence key: `k-vibe-saved-places`
- Saved places remain available in guest mode and open focused map detail views with `source=saved`, `detail=1`, category/address/tags, crowd level, and TourAPI content identifiers when available.
- The same Profile page also reads `k-vibe-current-route` and `k-vibe-route-progress` to show the local My Routes card with progress percentage, completed count, next stop, a whole-card route-detail tap target, Continue/Edit actions, and a create-first-route empty-state CTA.
- Supabase cross-device sync is still approval/credential-gated; the local contract is ready to sync later.

### Analysis

- UI: `app/[locale]/analyze/page.tsx`
- API: `app/api/analyze/route.ts`
- Helpers: `lib/analysis.ts`, `lib/youtube.ts`
- Development fallback: deterministic mock spot extraction localized for `ko`, `en`, `ja`, and `zh`.
- Analyze input detects YouTube and Instagram URLs to match the root S5 platform direction. YouTube remains the only analyzable local/mock path; Instagram links show a localized approval-gated notice and do not call a provider.
- Analyze example cards now match the root S5 flow: selecting a YouTube example fills the input and starts the local/mock analysis immediately, while selecting the Instagram example fills the input and shows the approval-gated pending state without calling a provider.
- The Analyze page sends the active URL locale to `/api/analyze`; local mock titles, place names, and reasons follow the same locale, and enabled AI worker requests receive the locale value for future provider-side localization.
- Analyze result cards follow the root S7 flow: each candidate shows a localized confidence label plus an accessible progress bar, and selecting a coordinate-backed spot opens `/[locale]/map` with `detail=1`, focuses the analysis location, and opens the local place detail sheet with the analysis reason as context.
- Analyze stores successful same-video, same-locale results in the shared 1-hour local API cache. Cache hits skip the network call and show a localized previous-result source label.
- Analyze loading uses a localized 4-step progress panel with an expected wait hint and cold-start note, matching the root S6 loading-state direction without calling any paid provider.
- Analyze success includes a localized empty-results state when a worker returns no places, with a sample YouTube retry action from the root UI empty-state guidance, while local mock fallback still returns deterministic candidates.
- AI worker calls are disabled unless `ENABLE_AI_WORKER_ANALYSIS=true` and `AI_WORKER_URL` is configured.

### Facilities

- UI: `app/[locale]/radar/page.tsx`
- API: `app/api/facilities/route.ts`
- Helpers: `lib/facilities.ts`
- Development fallback: deterministic mock facilities until live facility sources are approved.
- Facility types cover the root S11 immediate-need set with local restroom, ATM, cafe restroom, pharmacy, convenience, and popup/event helpers. ATM results are local/mock only until a live no-cost source is approved.
- TourAPI popup enrichment: when `TOUR_API_KEY` is configured, `/api/facilities` uses `searchFestival2` for `popup` or `all` requests, filters returned event coordinates by the requested radius, and appends nearby events as `popup` facilities. If TourAPI fails or has no nearby results, the local mock list remains the response.
- Radar uses the shared last-known-location cache before browser geolocation resolves, then refreshes coordinates and the cache when a new GPS fix succeeds.
- Radar stores successful `/api/facilities` responses in the shared local API cache and displays cached facility lists while a fresh same-query request is pending or if it fails.
- Radar page includes a no-cost visual map preview with radius rings and facility pins from the same local/mock API response.
- Radar empty results include a localized Expand radius action that advances to the next predefined radius step before refetching facilities, matching the root UI empty-state guidance.
- Radar filter chips, preview pins, and facility cards use shared lucide facility icons so labels stay localized and iconography stays consistent.
- Radar pins and expanded card actions open Google Maps search URLs only after the user clicks; no Maps API, Directions API, or Kakao Mobility request is made.

### Routes

- Generator UI: `app/[locale]/persona/page.tsx`
- Editor UI: `app/[locale]/route/page.tsx`
- Docent UI: `app/[locale]/docent/page.tsx`
- API: `app/api/routes/generate/route.ts`
- Helpers: `lib/routes.ts`
- Development fallback: deterministic mock route plans until AI generation is approved.
- Route generation accepts the active locale and uses `lib/ui-copy.ts` to localize mock plan titles, summaries, persona themes, and detail options.
- Persona selection follows the root S8 direction as a no-cost 3-step flow: choose theme, choose route mood, then confirm the selected inputs before generating the local route preview. The local generator now covers K-pop, drama, mood travel, Foodie Explorer, Content Creator, and History Buff persona themes.
- The same S8 selection can also personalize the Home feed locally through `k-vibe-persona-preference`, so persona choice affects discovery without a provider recommendation call.
- Local persistence key: `k-vibe-current-route`
- Local progress key: `k-vibe-route-progress`
- Route editor mutations are written back to the same local persistence key.
- Analyze results can write a draft route into this same key and open `/[locale]/route`.
- Route sharing is no-cost and local-first: `lib/routes.ts` encodes the current plan into a same-origin `route=` URL parameter, and `/[locale]/route` restores that payload into the editor before falling back to `localStorage`.
- Route progress is no-cost and local-first: completed stop IDs are stored per route, invalid/deleted stops are filtered out, and Start Guidance opens the next incomplete stop before showing the all-complete state.
- Route editor shows a no-cost local mini map preview. Stops can be reordered through drag-and-drop or icon move controls, and the sticky action bar stays inside the responsive app shell on mobile and desktop. The root S9 Open in Map CTA opens `/[locale]/map?source=route-map` centered on the first stop without entering detail mode or calling a routing provider. The route screen can also check current distance to the next incomplete stop after a user tap, using browser geolocation plus local Haversine math and no background polling. The timeline now inserts dashed walking travel segments between stops, using the same local Haversine estimate as the total walking stat. Selecting a stop body opens `/[locale]/map` with `detail=1`, focusing that stop, and showing the local place detail sheet with route context. Stop pins, explicit Google Maps icons, and the walking directions icon open Google Maps URLs in a new tab only after the user clicks; no Maps Directions API, Kakao Mobility API, or paid route calculation is called.
- Docent playback uses browser `speechSynthesis` with generated captions from the selected route stop. The script is split into intro, details, tags, and next-step sections; the UI shows localized script progress, and speech boundary events highlight and scroll the active section when supported. It does not call OpenAI TTS or any paid API.
- Docent arrival checking reads `lat` and `lng` from the query string, asks for browser geolocation only after a user tap, computes distance locally with Haversine, and treats 100m as the ready radius. Automatic polling, push prompts, and provider TTS remain approval-gated.

## Expected Page States

Every data-backed page should expose:

- Loading state while the API request is active.
- Empty state when filters remove all items.
- Error state with a retry path.
- Mock/source hint while the app is running without external integrations.
- Clear copy that tells developers whether a local mock or external source produced the result.
- Shared navigation, landing, tutorial, and key map states should use locale-aware copy for `ko`, `en`, `ja`, and `zh`.
- Language switcher names are covered by tests so supported locale names do not regress to placeholders or mojibake.
- Analyze and Radar screen copy is also routed through `lib/ui-copy.ts` so the local-first SNS and facility workflows stay available in all supported locales.
- Persona and Route screen copy is routed through `lib/ui-copy.ts`, including editor status messages, route stats, CTA labels, persona theme labels, and tutorial shortcut actions.
- Shared app chrome, account modal, common error fallback, profile avatar labels, map refresh labels, route handoff labels, and place detail crowd/close/Seen in labels are also routed through `lib/ui-copy.ts`.
- Profile settings rows and Docent arrival-check messages are localized for `ko`, `en`, `ja`, and `zh`.
- Map/Radar data-source labels are localized for TourAPI, mock, and cache states.
- The shared offline network banner is localized for `ko`, `en`, `ja`, and `zh`.
- The PWA install prompt is localized for `ko`, `en`, `ja`, and `zh`.
- Shared toast notifications use lucide icons, accessible alert/status roles, and an icon close control.
- Route stop detail handoff labels, route mini map labels, Google Maps handoff labels, and route crowd badge labels are localized through the same shared copy source.
- Radar map labels and Google Maps handoff labels are localized through `lib/ui-copy.ts`.

## Approval-Gated Work

Do not wire paid or quota-based services directly from frontend work. Add the contract and local fallback first, then record any key, quota, or permission need in `docs/approval-log.md`.
