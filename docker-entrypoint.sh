#!/bin/sh
set -e

# Fix volume permissions: ensure node user can write to images directory
if [ -d /app/public/images ]; then
  chown -R node:node /app/public/images 2>/dev/null || true
fi

# Run the main process as node user
exec su-exec node "$@"
