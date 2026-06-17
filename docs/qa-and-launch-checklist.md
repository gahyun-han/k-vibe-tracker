# QA And Launch Checklist

Last updated: 2026-06-17

## Latest Chrome QA

Environment:
- Chrome against `http://localhost:3100`
- Kakao, TourAPI, OpenAI, YouTube, Supabase, and AI worker keys disabled
- Purpose: verify UI and local/mock flows without consuming provider quota or paid services

Verified:
- Mobile/PC mode switching on Map, including the fixed desktop map layout.
- Map fallback renderer, place pins, place detail sheet, save button, close button, and search/filter layout.
- Persona route generator: theme -> detail -> review -> local route generation -> Route editor handoff.
- Route editor: mark complete, reorder, add sample stop, and route-stop detail handoff into the in-app Map sheet.
- Analyze: invalid URL inline validation, Instagram approval-gated notice, YouTube local/mock analysis, and Build Route handoff.
- Radar: facility type filters, radius slider by keyboard, mock facility list, and source/status copy.
- Docent: local browser speech Play/Stop state and Back to route.
- Feature guide: dialog semantics, close action, and shortcut navigation.

Fixed during this QA pass:
- Desktop Map now uses a left map/right control-panel layout instead of a mobile-like stacked layout.
- Live Kakao mode now attaches app place pins to the Kakao map via `CustomOverlay`, so pins move with the map instead of floating over the viewport.
- Kakao map calls `relayout()` on container resize/view-mode changes to avoid partial map rendering.
- Same-tab Mobile/PC view mode state now syncs across all hook instances.
- Place detail sheets now expose `role="dialog"` and labelled headings.

Deferred because they can consume quota, require permission, or create external side effects:
- Live Kakao drag test on `localhost:3000`.
- Live TourAPI place/detail calls.
- Browser geolocation permission prompts for Map/Radar/Docent distance checks.
- Google Maps external handoff buttons.
- Supabase Google OAuth login.
- Claude CLI review.

## What You Need To Do

Immediate no-cost checks:
- Open `http://localhost:3000/en/map` in Chrome.
- Switch to PC mode and drag the map once. If you approve live quota use, confirm whether pins now stay attached while dragging.
- Check Kakao Developers quota dashboard after testing: My Applications > Statistics > Quota.
- Keep `http://localhost:3000` registered in Kakao Developers Web platform domains. Add `http://127.0.0.1:3000` only if you plan to test with that host too.

Before production:
- Decide the production domain and add it to Kakao Developers Web platform domains.
- Move public client keys to deployment env vars only: `NEXT_PUBLIC_KAKAO_MAP_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Keep private server keys server-only: `TOUR_API_KEY`, Kakao REST keys, OpenAI/Claude keys, Redis tokens.
- Set hard provider budgets/quotas before enabling any paid API setting.
- Add a privacy policy URL before enabling OAuth or Instagram/Meta app review.

## Cost And Quota Estimate

Current app if kept local/mock-first:
- Expected monthly cost: `0`.
- It uses local fallback data, browser speech synthesis, localStorage, and no paid AI/routing provider by default.

TourAPI / Korea Tourism Organization:
- Cost: free.
- The public data portal lists the TourAPI service as free, with development traffic at 1,000 and production traffic expandable after use-case registration.
- Source: `https://www.data.go.kr/data/15101578/openapi.do`

Kakao Maps JavaScript:
- Free quota: Kakao quota docs list Map SDK JavaScript at 300,000 daily requests and a general monthly free quota.
- If paid usage is enabled after quota: Korean Kakao quota docs list Map SDK JavaScript overage at `0.1 KRW/request`.
- Practical estimate: 1,000,000 over-quota map loads ~= `100,000 KRW + VAT`.
- Source: `https://developers.kakao.com/docs/ko/getting-started/quota`

Kakao Local search:
- Not currently required for the app because TourAPI/local mock places drive search.
- If enabled after free quota: keyword/category place search is listed at `2 KRW/request`.
- Practical estimate: 100,000 over-quota searches ~= `200,000 KRW + VAT`.
- Source: `https://developers.kakao.com/docs/ko/getting-started/quota`

Kakao Mobility routing:
- Not currently used. The app uses local Haversine estimates and user-clicked Google Maps handoff links.
- Free daily quota examples: car directions 10,000/day, multi-waypoint car directions 5,000/day.
- Overage examples: car directions `8 KRW/request`, multi-waypoint `16 KRW/request`, multi-destination `20 KRW/request`.
- Practical estimate: 50,000 over-quota basic route calls ~= `400,000 KRW + VAT`.
- Source: `https://developers.kakaomobility.com/price/`

Supabase:
- Free tier is enough for MVP guest/auth experiments: docs list 50,000 MAU, 500 MB database, 5 GB egress.
- Paid production starts with a fixed subscription plus overages; docs list Pro/Team quotas such as 100,000 MAU included, then `$0.00325/MAU`.
- Practical estimate: early MVP can stay `0`; production auth/sync is likely at least the Pro plan plus usage once you need non-paused production reliability.
- Source: `https://supabase.com/docs/guides/platform/billing-on-supabase`

Upstash Redis:
- Not currently connected. Useful later for shared API caching/rate limiting.
- Free tier: 256 MB, 500K commands/month.
- Pay-as-you-go: `$0.20 / 100K commands`, first 1 GB storage free.
- Practical estimate: 5M commands/month ~= `$10`.
- Source: `https://upstash.com/pricing/redis`

YouTube Data API:
- Not currently required for mock analysis. If enabled, it is quota-based rather than directly metered in normal use.
- Default quota: 10,000 units/day; `search.list` is commonly expensive, so a project can run out quickly.
- Practical estimate: direct cash cost usually `0`, but hard quota is the risk. More quota requires compliance/audit.
- Source: `https://developers.google.com/youtube/v3/guides/quota_and_compliance_audits`

OpenAI AI analysis/route/docent generation:
- Not enabled. Current Analyze and Persona flows are deterministic local/mock.
- Current OpenAI pricing page lists `gpt-5.4-mini` standard at about `$0.75 / 1M input tokens` and `$4.50 / 1M output tokens`.
- Rough per-analysis estimate at 3K input + 1K output tokens: about `$0.0068`.
- Rough 10,000 analyses/month: about `$68`.
- Source: `https://developers.openai.com/api/docs/pricing`

Claude CLI/API:
- Not used in the latest QA because it can consume paid quota.
- Anthropic lists Claude Sonnet 4.6 from `$3 / 1M input tokens` and `$15 / 1M output tokens`.
- Rough focused code review at 50K input + 5K output tokens: about `$0.225`.
- Source: `https://www.anthropic.com/claude/sonnet`

Instagram/Meta:
- Current app only detects Instagram URLs and shows an approval-gated notice.
- Official route requires Meta developer app, Instagram API/Graph API permissions, account requirements, and app review. Direct per-call platform fee is not the main issue; approval, rate limits, and policy compliance are the real cost.
- Keep this gated until the app has a privacy policy, terms, production domain, and a clear data-access purpose.
- Sources: `https://developers.facebook.com/products/instagram/apis/`, `https://developers.facebook.com/blog/post/2024/09/04/update-on-instagram-basic-display-api/`

## Recommended Enable Order

1. Keep current no-cost local/mock mode for UI development.
2. Use TourAPI live data next, because it is free and already wired.
3. Keep Kakao Maps live, but monitor quota daily while testing.
4. Enable Supabase only when you want account sync/OAuth persistence.
5. Add Redis only when server-side caching/rate limiting becomes necessary.
6. Add Kakao Mobility routing only if local estimates are not enough.
7. Add AI providers only after setting hard monthly budget caps and deciding which features truly need AI.
8. Keep Instagram extraction last because permissions and compliance will take more work than the current product needs.
