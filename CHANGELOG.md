# Changelog

## 2026-07-07

### Refactor: frontend/backend structure split
- Added `frontend/api/*` client modules and migrated page/component API calls to the centralized frontend API layer.
- Added `backend/*` structure (`config`, `dependency`, `business_services`, `presentation_api`) and delegated Next API routes to `backend/presentation_api`.
- Kept existing API contracts (`/api/places`, `/api/places/[contentId]`, `/api/facilities`, `/api/routes/generate`, `/api/analyze`) stable.

### Refactor: ai-worker backend architecture
- Reorganized `ai-worker` into:
  - `config`
  - `dependency.py`
  - `presentation_api`
  - `business_services`
  - `ai_services`
  - `externelAPI_services`
  - `data_repositories`
- Updated `main.py` to use router composition and scheduler startup/shutdown lifecycle.
- Added `ai-worker/render.yaml` with web service + 7-day cron job for location refresh.
- Added `APScheduler` dependency for queue/scheduled job support.

### Security/config updates
- Added gitignore rules for `ai-worker/config/configure_local.py` and secret json files.
- Added optional local API key override loading in `ai-worker/config/configure.py`.
