#!/bin/bash
# BlueLearnerHub Backup Wrapper Script
# Usage: ./backup.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT"

echo "Starting backup..."
echo "Project root: $PROJECT_ROOT"

# Source environment variables if .env exists
if [ -f ".env" ]; then
    echo "Loading environment from .env"
    set -a
    source .env
    set +a
fi

# Run backup script with Node
npx ts-node --project tsconfig.json scripts/backup.ts

echo "Backup completed successfully"