/**
 * Migration runner — applies SQL files from devops/database/migrations/ in order.
 * Tracks applied migrations in a schema_migrations table so each file
 * only ever runs once. Safe to call on every deploy/startup.
 */

'use strict';

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigrations() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.warn('[migrate] DATABASE_URL not set — skipping migrations.');
    return;
  }

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: 10000,
  });

  try {
    // Tracking table — idempotent
    await pool.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        filename  VARCHAR(255) PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    // Which migrations already ran?
    const { rows } = await pool.query('SELECT filename FROM schema_migrations ORDER BY filename');
    const applied = new Set(rows.map(r => r.filename));

    // Resolve migrations directory relative to this script
    // backend/scripts/ -> ../../devops/database/migrations/
    const migrationsDir = path.resolve(__dirname, '../../devops/database/migrations');

    if (!fs.existsSync(migrationsDir)) {
      console.warn(`[migrate] Migrations directory not found: ${migrationsDir}`);
      return;
    }

    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort(); // lexicographic order — 001_, 002_, etc.

    let ran = 0;
    for (const file of files) {
      if (applied.has(file)) {
        console.log(`[migrate] skip  ${file} (already applied)`);
        continue;
      }

      console.log(`[migrate] apply ${file} ...`);
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');

      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        await client.query(sql);
        await client.query(
          'INSERT INTO schema_migrations (filename) VALUES ($1)',
          [file]
        );
        await client.query('COMMIT');
        console.log(`[migrate] ✓     ${file}`);
        ran++;
      } catch (err) {
        await client.query('ROLLBACK');
        throw new Error(`[migrate] ✗ ${file} failed:\n${err.message}`);
      } finally {
        client.release();
      }
    }

    if (ran === 0) {
      console.log('[migrate] No new migrations to apply.');
    } else {
      console.log(`[migrate] Done — applied ${ran} migration(s).`);
    }
  } finally {
    await pool.end();
  }
}

runMigrations().catch(err => {
  console.error(err.message);
  process.exit(1);
});
