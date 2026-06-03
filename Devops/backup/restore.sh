#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
# MongoDB Restore Script
# Usage: ./restore.sh <backup-file.tar.gz>
# ═══════════════════════════════════════════════════════════════════════════════

set -e

BACKUP_FILE="$1"
MONGODB_URI="${MONGODB_URL:-mongodb://localhost:27017/bluelearnerhub}"

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup-file.tar.gz>"
    echo "Example: $0 /backups/mongodb/daily/bluelearnerhub_daily_20240115_020000.tar.gz"
    exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
    echo "Error: Backup file not found: $BACKUP_FILE"
    exit 1
fi

echo "Restoring from: $BACKUP_FILE"
echo "Target database: $MONGODB_URI"
echo ""
echo "WARNING: This will overwrite existing data!"
read -p "Are you sure? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Restore cancelled"
    exit 0
fi

# Extract backup
RESTORE_DIR=$(mktemp -d)
echo "Extracting backup to: $RESTORE_DIR"
tar -xzf "$BACKUP_FILE" -C "$RESTORE_DIR"

# Find extracted directory
BACKUP_DIR=$(find "$RESTORE_DIR" -mindepth 1 -maxdepth 1 -type d | head -1)

if [ -z "$BACKUP_DIR" ]; then
    echo "Error: Could not find backup directory in archive"
    rm -rf "$RESTORE_DIR"
    exit 1
fi

# Restore
echo "Restoring database..."
mongorestore --uri="$MONGODB_URI" --gzip --drop "$BACKUP_DIR"

# Cleanup
rm -rf "$RESTORE_DIR"

echo "Restore completed successfully!"
