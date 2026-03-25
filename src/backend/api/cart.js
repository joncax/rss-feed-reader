/**
 * Shopping Cart API
 * File: src/backend/api/cart.js
 */

import express from 'express';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '../../../.data/rss.db');

if (!fs.existsSync(path.dirname(dbPath))) {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
}

const db = new Database(dbPath);
const router = express.Router();

// =============================================
// INIT CART TABLES
// =============================================

function initCartTables() {
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
}

initCartTables();

// =============================================
// ENDPOINTS
// =============================================

/**
 * GET /api/cart
 * Get all cart items
 */
router.get('/', (req, res) => {
  try {
    const items = db.prepare(`
      SELECT * FROM cart_items
      WHERE status = 'pending'
      ORDER BY createdAt DESC
    `).all();

    const stats = db.prepare(`
      SELECT
        COUNT(*) as count,
        SUM(size) as totalSize
      FROM cart_items
      WHERE status = 'pending'
    `).get();

    res.json({
      success: true,
      data: items,
      stats: stats || { count: 0, totalSize: 0 }
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/cart
 * Add item to cart
 */
router.post('/', (req, res) => {
  try {
    const { magnetLink, title, feedName, size, quality, priority } = req.body;

    if (!magnetLink || !title) {
      return res.status(400).json({
        success: false,
        error: 'magnetLink and title are required'
      });
    }

    const stmt = db.prepare(`
      INSERT INTO cart_items (magnetLink, title, feedName, size, quality, priority, status)
      VALUES (?, ?, ?, ?, ?, ?, 'pending')
    `);

    const result = stmt.run(
      magnetLink,
      title,
      feedName || 'Unknown Feed',
      size || null,
      quality || null,
      priority || 'normal'
    );

    res.status(201).json({
      success: true,
      data: {
        id: result.lastInsertRowid,
        magnetLink,
        title,
        feedName,
        size,
        quality,
        priority: priority || 'normal',
        status: 'pending'
      }
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    if (error.message.includes('UNIQUE')) {
      return res.status(409).json({
        success: false,
        error: 'Item already in cart'
      });
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * DELETE /api/cart/:id
 * Remove item from cart
 */
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;

    const stmt = db.prepare(`DELETE FROM cart_items WHERE id = ? AND status = 'pending'`);
    const result = stmt.run(id);

    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }

    res.json({ success: true, message: 'Item removed from cart' });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * DELETE /api/cart
 * Clear entire cart
 */
router.delete('/', (req, res) => {
  try {
    const stmt = db.prepare(`DELETE FROM cart_items WHERE status = 'pending'`);
    const result = stmt.run();

    res.json({
      success: true,
      message: 'Cart cleared',
      itemsRemoved: result.changes
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/cart/stats
 * Get cart statistics
 */
router.get('/stats/overview', (req, res) => {
  try {
    const stats = db.prepare(`
      SELECT
        COUNT(*) as count,
        SUM(size) as totalSize,
        GROUP_CONCAT(DISTINCT priority) as priorities,
        GROUP_CONCAT(DISTINCT feedName) as feeds
      FROM cart_items
      WHERE status = 'pending'
    `).get();

    const byPriority = db.prepare(`
      SELECT priority, COUNT(*) as count, SUM(size) as size
      FROM cart_items
      WHERE status = 'pending'
      GROUP BY priority
    `).all();

    res.json({
      success: true,
      data: {
        ...stats,
        byPriority
      }
    });
  } catch (error) {
    console.error('Error fetching cart stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/cart/download-all
 * Start downloading all cart items
 */
router.post('/download-all', (req, res) => {
  try {
    const items = db.prepare(`
      SELECT * FROM cart_items
      WHERE status = 'pending'
    `).all();

    if (items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Cart is empty'
      });
    }

    // TODO: Integrar com WebTorrent service
    // Por enquanto, apenas marca como 'downloading'
    const updateStmt = db.prepare(`
      UPDATE cart_items
      SET status = 'downloading', addedToDownloadAt = ?
      WHERE status = 'pending'
    `);

    const result = updateStmt.run(new Date().toISOString());

    res.json({
      success: true,
      message: `${result.changes} items added to downloads`,
      itemsCount: result.changes
    });
  } catch (error) {
    console.error('Error downloading cart items:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;