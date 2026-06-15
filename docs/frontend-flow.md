# Frontend Flow Notes

Last updated: 2026-06-16

This project is in local-first development mode. Pages should remain usable without paid API keys or production credentials.

## Navigation

- Bottom navigation lives in `components/layout/BottomNav.tsx`.
- The Route tab opens `/[locale]/persona` first, because route generation is the entry workflow.
- Generated routes can be saved into `localStorage` and edited at `/[locale]/route`.

## Local Data Contracts

### Places

- UI: `app/[locale]/map/page.tsx`
- API: `app/api/places/route.ts`
- Helpers: `lib/tourapi.ts`
- Development fallback: deterministic mock places when `TOUR_API_KEY` is absent or TourAPI fails.

### Facilities

- UI: `app/[locale]/radar/page.tsx`
- API: `app/api/facilities/route.ts`
- Helpers: `lib/facilities.ts`
- Development fallback: deterministic mock facilities until live facility sources are approved.

### Routes

- Generator UI: `app/[locale]/persona/page.tsx`
- Editor UI: `app/[locale]/route/page.tsx`
- API: `app/api/routes/generate/route.ts`
- Helpers: `lib/routes.ts`
- Development fallback: deterministic mock route plans until AI generation is approved.
- Local persistence key: `k-vibe-current-route`

## Expected Page States

Every data-backed page should expose:

- Loading state while the API request is active.
- Empty state when filters remove all items.
- Error state with a retry path.
- Mock/source hint while the app is running without external integrations.

## Approval-Gated Work

Do not wire paid or quota-based services directly from frontend work. Add the contract and local fallback first, then record any key, quota, or permission need in `docs/approval-log.md`.
