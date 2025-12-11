#!/bin/bash

# ============================================
# Pricing System - Automated Backup Script
# ============================================

set -e  # Exit on error

BACKUP_DIR="/opt/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_FILE="pricing_db_$DATE.sql"
UPLOADS_DIR="uploads_$DATE.tar.gz"
LOG_FILE="/opt/backups/backup.log"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Log function
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a $LOG_FILE
}

log "Starting backup process..."

# Database Backup
log "Backing up database..."
docker exec pricing-db-prod pg_dump -U pricing_admin pricing_db > "$BACKUP_DIR/$DB_FILE" 2>>$LOG_FILE

if [ $? -eq 0 ]; then
    log "Database backup successful: $DB_FILE"
    # Compress database backup
    gzip "$BACKUP_DIR/$DB_FILE"
    log "Database backup compressed: $DB_FILE.gz"
else
    log "ERROR: Database backup failed!"
    exit 1
fi

# Uploads Backup
log "Backing up uploads directory..."
if [ -d "/opt/pricing-system/backend/uploads" ]; then
    tar -czf "$BACKUP_DIR/$UPLOADS_DIR" -C /opt/pricing-system/backend uploads 2>>$LOG_FILE
    
    if [ $? -eq 0 ]; then
        log "Uploads backup successful: $UPLOADS_DIR"
    else
        log "WARNING: Uploads backup failed!"
    fi
else
    log "WARNING: Uploads directory not found, skipping..."
fi

# Delete old backups (keep last 30 days)
log "Cleaning up old backups..."
find $BACKUP_DIR -name "pricing_db_*.sql.gz" -mtime +30 -delete 2>>$LOG_FILE
find $BACKUP_DIR -name "uploads_*.tar.gz" -mtime +30 -delete 2>>$LOG_FILE

# Calculate backup size
DB_SIZE=$(du -h "$BACKUP_DIR/$DB_FILE.gz" | cut -f1)
UPLOADS_SIZE=$(du -h "$BACKUP_DIR/$UPLOADS_DIR" 2>/dev/null | cut -f1 || echo "N/A")

log "Backup completed successfully!"
log "Database backup: $DB_FILE.gz ($DB_SIZE)"
log "Uploads backup: $UPLOADS_DIR ($UPLOADS_SIZE)"
log "============================================"


