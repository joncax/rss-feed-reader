/**
 * RSS Feed Reader + Torrent Media Server
 * File: server.js
 * v.2.1
 * Features: RSS Feeds, Torrent Downloads, Storage Management, API REST
 * Fase 1D (API Routers) - COMPLETO
 */

import express from 'express';
import cors from 'cors';
import axios from 'axios';
import { load as cheerio } from 'cheerio';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Phase 1 Services
import db from './src/db-init.js';
import torrentService from './src/torrent-service.js';
import storageService from './src/storage-service.js';

// Phase 1 Routers
import downloadsRouter from './src/api/downloads.js';
import storageRouter from './src/api/storage.js';
import historyRouter from './src/api/history.js';
import quotaRouter from './src/api/quota.js';

// Load environment variables
dotenv.config();

// Get __dirname and __filename (ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// App setup
const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// ========================================
// PHASE 1 API ROUTES
// ========================================

// Downloads Management
app.use('/api/downloads', downloadsRouter);

// Storage & Quota
app.use('/api/storage', storageRouter);

// Download History
app.use('/api/download-history', historyRouter);

// Quota Monitoring
app.use('/api/quota', quotaRouter);

// ========================================
// HEALTH CHECK
// ========================================

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '2.1',
    features: [
      'RSS Feeds',
      'Torrent Downloads',
      'Storage Management',
      'Quota Monitoring',
      'Download History'
    ]
  });
});

// ========================================
// RSS FEED ENDPOINTS (Existentes - manter)
// ========================================

// GET /api/feeds - Listar feeds
app.get('/api/feeds', (req, res) => {
  try {
    const feedsPath = path.join(__dirname, 'feeds.json');
    if (fs.existsSync(feedsPath)) {
      const feeds = JSON.parse(fs.readFileSync(feedsPath, 'utf8'));
      res.json({
        success: true,
        count: feeds.length,
        data: feeds
      });
    } else {
      res.json({
        success: true,
        count: 0,
        data: []
      });
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// POST /api/feeds - Adicionar feed
app.post('/api/feeds', (req, res) => {
  try {
    const { name, url } = req.body;

    if (!name || !url) {
      return res.status(400).json({
        success: false,
        error: 'name and url required'
      });
    }

    const feedsPath = path.join(__dirname, 'feeds.json');
    let feeds = [];

    if (fs.existsSync(feedsPath)) {
      feeds = JSON.parse(fs.readFileSync(feedsPath, 'utf8'));
    }

    // Verificar duplicado
    if (feeds.some(f => f.url === url)) {
      return res.status(409).json({
        success: false,
        error: 'Feed already exists'
      });
    }

    feeds.push({
      name,
      url,
      lastUpdated: new Date().toISOString()
    });

    fs.writeFileSync(feedsPath, JSON.stringify(feeds, null, 2));

    res.status(201).json({
      success: true,
      message: 'Feed added',
      data: { name, url }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// DELETE /api/feeds/:name - Remover feed
app.delete('/api/feeds/:name', (req, res) => {
  try {
    const feedsPath = path.join(__dirname, 'feeds.json');

    if (!fs.existsSync(feedsPath)) {
      return res.status(404).json({
        success: false,
        error: 'No feeds found'
      });
    }

    let feeds = JSON.parse(fs.readFileSync(feedsPath, 'utf8'));
    const originalLength = feeds.length;
    feeds = feeds.filter(f => f.name !== req.params.name);

    if (feeds.length === originalLength) {
      return res.status(404).json({
        success: false,
        error: 'Feed not found'
      });
    }

    fs.writeFileSync(feedsPath, JSON.stringify(feeds, null, 2));

    res.json({
      success: true,
      message: 'Feed removed',
      feedName: req.params.name
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// ========================================
// ROOT & FALLBACK
// ========================================

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/status', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'status.html'));
});

// ========================================
// ERROR HANDLING
// ========================================

app.use((err, req, res, next) => {
  console.error('🔴 Error:', err);
  res.status(500).json({
    success: false,
    error: err.message,
    timestamp: new Date().toISOString()
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.path
  });
});

// ========================================
// START SERVER
// ========================================

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   🚀 RSS Feed Reader + Torrent Server  ║
║     v2.1 — Phase 1D (API Routers)      ║
╚════════════════════════════════════════╝

📡 Server running on: http://localhost:${PORT}
🌍 Network access: http://192.168.1.86:${PORT}

📚 API Endpoints:
  ✅ /api/health                    — Health check
  📥 /api/downloads                 — Download management
  💾 /api/storage/stats             — Storage quota
  📊 /api/download-history          — Download history
  ⚙️ /api/quota/stats               — Quota monitoring

🔗 RSS Feed Endpoints:
  📰 /api/feeds                     — List/add feeds
  🗑️  /api/feeds/:name             — Delete feed

🌐 Web Interface:
  🏠 http://localhost:${PORT}/              — Main page
  📊 http://localhost:${PORT}/status        — Status page

⏰ Started at: ${new Date().toISOString()}
  `);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n⏹️  Shutting down gracefully...');
  torrentService.destroy();
  process.exit(0);
});