/**
 * Feeds API
 * File: src/backend/api/feeds.js
 * Endpoints para gerenciar feeds RSS
 */

import express from 'express';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = express.Router();

// Database
const dbPath = path.join(__dirname, '../../.data/rss.db');
const db = new Database(dbPath);

// =============================================
// INIT DB
// =============================================

function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS feeds (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      url TEXT UNIQUE NOT NULL,
      status TEXT DEFAULT 'active',
      itemCount INTEGER DEFAULT 0,
      lastUpdated TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS feed_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      feedId INTEGER NOT NULL,
      guid TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      magnet TEXT,
      pubDate TEXT,
      description TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (feedId) REFERENCES feeds(id) ON DELETE CASCADE
    );
  `);
}

initDb();

// =============================================
// ENDPOINTS
// =============================================

/**
 * GET /api/feeds
 * Listar todos os feeds
 */
router.get('/', (req, res) => {
  try {
    const stmt = db.prepare(`
      SELECT id, name, url, status, itemCount, lastUpdated, createdAt
      FROM feeds
      ORDER BY name ASC
    `);
    const feeds = stmt.all();
    res.json({ success: true, data: feeds });
  } catch (error) {
    console.error('Error fetching feeds:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/feeds
 * Adicionar novo feed
 */
router.post('/', (req, res) => {
  try {
    const { name, url } = req.body;

    if (!name || !url) {
      return res.status(400).json({
        success: false,
        error: 'Feed name and URL are required'
      });
    }

    const stmt = db.prepare(`
      INSERT INTO feeds (name, url, status, lastUpdated)
      VALUES (?, ?, 'active', ?)
    `);

    const result = stmt.run(name, url, new Date().toISOString());

    res.status(201).json({
      success: true,
      data: {
        id: result.lastInsertRowid,
        name,
        url,
        status: 'active',
        itemCount: 0,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error adding feed:', error);
    if (error.message.includes('UNIQUE')) {
      return res.status(409).json({
        success: false,
        error: 'Feed with this name or URL already exists'
      });
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/feeds/:name
 * Obter items de um feed específico
 */
router.get('/:name', (req, res) => {
  try {
    const { name } = req.params;

    const feed = db.prepare(`
      SELECT id FROM feeds WHERE name = ?
    `).get(name);

    if (!feed) {
      return res.status(404).json({ success: false, error: 'Feed not found' });
    }

    const items = db.prepare(`
      SELECT id, guid, title, magnet, pubDate, description, createdAt
      FROM feed_items
      WHERE feedId = ?
      ORDER BY pubDate DESC
      LIMIT 100
    `).all(feed.id);

    res.json({ success: true, data: items });
  } catch (error) {
    console.error('Error fetching feed items:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PATCH /api/feeds/:name
 * Atualizar feed (nome, URL)
 */
router.patch('/:name', (req, res) => {
  try {
    const { name } = req.params;
    const { name: newName, url: newUrl } = req.body;

    const stmt = db.prepare(`
      UPDATE feeds
      SET name = COALESCE(?, name),
          url = COALESCE(?, url)
      WHERE name = ?
      RETURNING *
    `);

    const updated = stmt.get(newName, newUrl, name);

    if (!updated) {
      return res.status(404).json({ success: false, error: 'Feed not found' });
    }

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating feed:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * DELETE /api/feeds/:name
 * Deletar feed
 */
router.delete('/:name', (req, res) => {
  try {
    const { name } = req.params;

    const stmt = db.prepare('DELETE FROM feeds WHERE name = ?');
    const result = stmt.run(name);

    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'Feed not found' });
    }

    res.json({ success: true, message: 'Feed deleted' });
  } catch (error) {
    console.error('Error deleting feed:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/feeds/:name/refresh
 * Sincronizar/refresh um feed
 */
router.post('/:name/refresh', (req, res) => {
  try {
    const { name } = req.params;

    const feed = db.prepare(`
      SELECT id FROM feeds WHERE name = ?
    `).get(name);

    if (!feed) {
      return res.status(404).json({ success: false, error: 'Feed not found' });
    }

    // TODO: Implementar fetch do feed RSS real
    // Por enquanto, apenas atualiza o timestamp
    const stmt = db.prepare(`
      UPDATE feeds
      SET lastUpdated = ?
      WHERE id = ?
    `);

    stmt.run(new Date().toISOString(), feed.id);

    res.json({
      success: true,
      message: 'Feed refreshed',
      data: { feedId: feed.id, lastUpdated: new Date().toISOString() }
    });
  } catch (error) {
    console.error('Error refreshing feed:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/feeds/:name/items
 * Adicionar item ao feed (para testes)
 */
router.post('/:name/items', (req, res) => {
  try {
    const { name } = req.params;
    const { guid, title, magnet, pubDate, description } = req.body;

    const feed = db.prepare(`
      SELECT id FROM feeds WHERE name = ?
    `).get(name);

    if (!feed) {
      return res.status(404).json({ success: false, error: 'Feed not found' });
    }

    const stmt = db.prepare(`
      INSERT INTO feed_items (feedId, guid, title, magnet, pubDate, description)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      feed.id,
      guid || `${title}-${Date.now()}`,
      title,
      magnet,
      pubDate || new Date().toISOString(),
      description
    );

    // Update item count
    db.prepare(`
      UPDATE feeds
      SET itemCount = (SELECT COUNT(*) FROM feed_items WHERE feedId = ?)
      WHERE id = ?
    `).run(feed.id, feed.id);

    res.status(201).json({
      success: true,
      data: { id: result.lastInsertRowid, title, magnet }
    });
  } catch (error) {
    console.error('Error adding feed item:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/feeds/stats
 * Obter estatísticas dos feeds
 */
router.get('/stats/overview', (req, res) => {
  try {
    const stats = db.prepare(`
      SELECT
        COUNT(*) as totalFeeds,
        SUM(itemCount) as totalItems,
        MAX(lastUpdated) as lastUpdated
      FROM feeds
    `).get();

    const activeFeeds = db.prepare(`
      SELECT COUNT(*) as count FROM feeds WHERE status = 'active'
    `).get();

    res.json({
      success: true,
      data: {
        ...stats,
        activeFeeds: activeFeeds.count
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;