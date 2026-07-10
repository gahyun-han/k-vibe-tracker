# Docker Development

Last updated: 2026-06-16

Use Docker when local Windows Node or npm is unavailable. The container owns Node, npm, `node_modules`, and the Next.js cache.

## Start The App

```bash
docker compose up app
```

Open:

```text
http://localhost:3000/en
```

The first run builds the dev image and runs `npm ci` inside the container. Later runs reuse the named `node_modules` volume until `package-lock.json` changes.

## Keep The App Running

```bash
docker compose up -d app
```

The app service uses `restart: unless-stopped`, so Docker will restart it after app crashes or Docker Desktop restarts. To stop it intentionally:

```bash
docker compose down
```

## Run Checks

```bash
docker compose run --rm app npm run type-check
docker compose run --rm app npm test
docker compose run --rm app npm run build
```

## Run One-Off Commands

```bash
docker compose run --rm app npm install
docker compose run --rm app npm run lint
```

Use one-off commands for local development only. Commit `package-lock.json` whenever dependencies change.

## Reset Container Dependencies

If dependencies look stale or corrupted:

```bash
docker compose down
docker volume rm repo_k_vibe_node_modules repo_k_vibe_next repo_k_vibe_npm_cache
docker compose up app
```

Docker may prefix volumes with a different project name if the folder name changes. In that case, list volumes first:

```bash
docker volume ls
```

## VS Code Dev Container

This repo includes `.devcontainer/devcontainer.json`. In VS Code, use `Dev Containers: Reopen in Container`.

The dev container uses the same `compose.yaml` service as the CLI workflow, so the commands above still apply inside the VS Code terminal.

## Notes

- `.env.local` is optional and is loaded automatically when present.
- The app remains usable without Supabase, TourAPI, AI worker, Redis, or paid API keys.
- Do not enable paid or quota-based services without recording the need in `docs/approval-log.md` and getting approval.
