import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '..', 'rss_media.db');
const db = new Database(dbPath);

// Criar tabelas
db.exec(`
  CREATE TABLE IF NOT EXISTS rss_feeds (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    url TEXT UNIQUE NOT NULL,
    category TEXT,
    auto_download BOOLEAN DEFAULT 0,
    last_checked TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS downloads (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    magnet TEXT UNIQUE NOT NULL,
    status TEXT CHECK(status IN ('downloading', 'completed', 'awaiting_action', 'copying', 'moved', 'cleaned', 'error')),
    progress REAL DEFAULT 0,
    source_path TEXT NOT NULL,
    dest_path TEXT,
    detected_type TEXT,
    user_category TEXT,
    final_category TEXT,
    speed_down INTEGER DEFAULT 0,
    speed_up INTEGER DEFAULT 0,
    eta_seconds INTEGER,
    size_total BIGINT,
    size_downloaded BIGINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    copied_at TIMESTAMP,
    cleaned_at TIMESTAMP,
    last_error TEXT
  );

  CREATE TABLE IF NOT EXISTS download_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    torrent_id TEXT UNIQUE,
    title TEXT NOT NULL,
    magnet TEXT,
    size BIGINT,
    date_started TIMESTAMP NOT NULL,
    date_completed TIMESTAMP,
    date_moved TIMESTAMP,
    date_cleaned TIMESTAMP,
    result TEXT CHECK(result IN ('success', 'error', 'cancelled')),
    error_message TEXT,
    source_path TEXT,
    final_path TEXT,
    final_category TEXT,
    avg_speed_kbps REAL,
    total_duration_seconds INTEGER,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_downloads_status ON downloads(status);
  CREATE INDEX IF NOT EXISTS idx_downloads_created ON downloads(created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_history_date ON download_history(date_started DESC);
  CREATE INDEX IF NOT EXISTS idx_history_result ON download_history(result);
`);

console.log('✅ Database initialized successfully');

export default db;