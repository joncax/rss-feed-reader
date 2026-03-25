/**
 * Database Migrations
 * File: src/backend/db-migrations.js
 */

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '../../.data/rss.db');

const db = new Database(dbPath);

export function initCartTable() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS cart_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      magnetLink TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      feedName TEXT,
      size INTEGER,
      quality TEXT,
      priority TEXT DEFAULT 'normal',
      destination TEXT,
      status TEXT DEFAULT 'pending',
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      addedToDownloadAt TEXT
    );

    CREATE TABLE IF NOT EXISTS cart_settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      autoOrganize BOOLEAN DEFAULT 1,
      sequentialDownload BOOLEAN DEFAULT 0,
      bandwidthLimit INTEGER,
      maxConcurrentDownloads INTEGER DEFAULT 3,
      scheduledTime TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
    );

    INSERT OR IGNORE INTO cart_settings (id) VALUES (1);
  `);
  
  console.log('✅ Cart tables initialized');
}

export default db;
