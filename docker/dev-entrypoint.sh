#!/bin/sh
set -e

if [ -f package-lock.json ]; then
  lock_hash="$(sha256sum package-lock.json | cut -d ' ' -f 1)"
  current_hash="$(cat node_modules/.package-lock.hash 2>/dev/null || true)"

  if [ ! -x node_modules/.bin/next ] || [ "$lock_hash" != "$current_hash" ]; then
    npm ci
    echo "$lock_hash" > node_modules/.package-lock.hash
  fi
elif [ ! -x node_modules/.bin/next ]; then
  npm install
fi

exec "$@"
