#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
# MongoDB Backup Script
# Usage: ./mongodb-backup.sh [daily|weekly|monthly]
# ═══════════════════════════════════════════════════════════════════════════════

set -e

# Configuration
BACKUP_TYPE="${1:-daily}"
BACKUP_DIR="/backups/mongodb/${BACKUP_TYPE}"
RETENTION_DAYS="${RETENTION_DAYS:-7}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="bluelearnerhub_${BACKUP_TYPE}_${TIMESTAMP}"
MONGODB_URI="${MONGODB_URL:-mongodb://localhost:27017/bluelearnerhub}"

# Logging
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Create backup directory
mkdir -p "${BACKUP_DIR}"

log "Starting ${BACKUP_TYPE} backup: ${BACKUP_NAME}"

# Perform backup
if mongodump --uri="${MONGODB_URI}" --out="${BACKUP_DIR}/${BACKUP_NAME}" --gzip; then
    log "Backup completed successfully: ${BACKUP_NAME}"
else
    log "ERROR: Backup failed!"
    exit 1
fi

# Create archive
tar -czf "${BACKUP_DIR}/${BACKUP_NAME}.tar.gz" -C "${BACKUP_DIR}" "${BACKUP_NAME}"
rm -rf "${BACKUP_DIR}/${BACKUP_NAME}"

log "Archive created: ${BACKUP_NAME}.tar.gz"

# Upload to S3 (if AWS credentials available)
if [ -n "$AWS_ACCESS_KEY_ID" ] && [ -n "$AWS_S3_BUCKET" ]; then
    log "Uploading to S3..."
    aws s3 cp "${BACKUP_DIR}/${BACKUP_NAME}.tar.gz" "s3://${AWS_S3_BUCKET}/backups/mongodb/${BACKUP_TYPE}/"
    log "Upload to S3 completed"
fi

# Clean old backups
log "Cleaning backups older than ${RETENTION_DAYS} days..."
find "${BACKUP_DIR}" -name "*.tar.gz" -mtime +${RETENTION_DAYS} -delete

log "Backup process completed"

# Verify backup
if [ -f "${BACKUP_DIR}/${BACKUP_NAME}.tar.gz" ]; then
    SIZE=$(du -h "${BACKUP_DIR}/${BACKUP_NAME}.tar.gz" | cut -f1)
    log "Backup file size: ${SIZE}"
fi
