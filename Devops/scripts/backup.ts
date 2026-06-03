#!/usr/bin/env node
import { execSync, spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

const BACKUP_DIR = process.env.BACKUP_DIR || '/var/backups/bluelearnerhub';
const S3_BUCKET = process.env.S3_BUCKET || '';
const RETENTION_DAYS = 30;
const DB_NAME = process.env.POSTGRES_DB || 'edtech_platform';
const DB_USER = process.env.POSTGRES_USER || 'postgres';
const DB_HOST = process.env.DB_HOST || 'localhost';

interface BackupResult {
  success: boolean;
  filePath?: string;
  error?: string;
}

function generateBackupFilename(prefix: string): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const random = crypto.randomBytes(4).toString('hex');
  return `${prefix}_${timestamp}_${random}.sql.gz`;
}

function ensureBackupDir(): void {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    console.log(`Created backup directory: ${BACKUP_DIR}`);
  }
}

function cleanupOldBackups(extension: string): void {
  try {
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.endsWith(extension))
      .map(f => ({
        name: f,
        path: path.join(BACKUP_DIR, f),
        mtime: fs.statSync(path.join(BACKUP_DIR, f)).mtime.getTime()
      }))
      .sort((a, b) => b.mtime - a.mtime);

    const cutoffTime = Date.now() - (RETENTION_DAYS * 24 * 60 * 60 * 1000);
    const toDelete = files.filter(f => f.mtime < cutoffTime);

    for (const file of toDelete) {
      fs.unlinkSync(file.path);
      console.log(`Deleted old backup: ${file.name}`);
    }
  } catch (error) {
    console.error('Error cleaning up old backups:', error);
  }
}

function backupPostgres(): BackupResult {
  console.log('Starting PostgreSQL backup...');
  const filename = generateBackupFilename('postgres');
  const filepath = path.join(BACKUP_DIR, filename);

  try {
    const pgPassword = process.env.POSTGRES_PASSWORD || '';
    const env = { ...process.env };
    if (pgPassword) env.PGPASSWORD = pgPassword;

    const cmd = `pg_dump -h ${DB_HOST} -U ${DB_USER} -d ${DB_NAME} -Fc -f ${filepath}`;
    execSync(cmd, { env, stdio: 'inherit' });

    console.log(`PostgreSQL backup saved to: ${filepath}`);
    return { success: true, filePath: filepath };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('PostgreSQL backup failed:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

function uploadToS3(localPath: string): boolean {
  if (!S3_BUCKET) {
    console.log('S3_BUCKET not configured, skipping S3 upload');
    return false;
  }

  console.log(`Uploading to S3 bucket: ${S3_BUCKET}`);
  try {
    const filename = path.basename(localPath);
    const s3Path = `backups/${filename}`;
    
    execSync(`aws s3 cp ${localPath} s3://${S3_BUCKET}/${s3Path}`, { stdio: 'inherit' });
    console.log(`Uploaded to S3: s3://${S3_BUCKET}/${s3Path}`);
    return true;
  } catch (error) {
    console.error('S3 upload failed:', error);
    return false;
  }
}

async function runBackup(): Promise<void> {
  console.log('=== BlueLearnerHub Backup Script ===');
  console.log(`Started at: ${new Date().toISOString()}`);

  ensureBackupDir();

  const result = backupPostgres();
  
  if (result.success && result.filePath) {
    const uploaded = uploadToS3(result.filePath);
    
    if (!uploaded && S3_BUCKET) {
      console.warn('Warning: S3 upload failed, backup still available locally');
    }
  }

  cleanupOldBackups('.sql.gz');

  console.log(`=== Backup Complete at ${new Date().toISOString()} ===`);
}

runBackup().catch(error => {
  console.error('Backup failed:', error);
  process.exit(1);
});