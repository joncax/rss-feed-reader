/**
 * RSS Feed Reader - Express Server
 * File: server.js
 * v.2.2 — Phase 1D + Phase 1H
 * Main entry point for backend API with complete routing
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Imports - API Routers
import feedsRouter from './src/backend/api/feeds.js';
import downloadsRouter from './src/backend/api/downloads.js';
import storageRouter from './src/backend/api/storage.js';
import historyRouter from './src/backend/api/history.js';
import quotaRouter from './src/backend/api/quota.js';

// Setup
dotenv.config();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3002;

// =============================================
// MIDDLEWARE
// =============================================

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'dist')));

// =============================================
// API ROUTES (Phase 1D + Phase 1H)
// =============================================

// RSS Feeds Management (Phase 1H)
app.use('/api/feeds', feedsRouter);

// Downloads Management (Phase 1D)
app.use('/api/downloads', downloadsRouter);

// Storage & Quota (Phase 1D)
app.use('/api/storage', storageRouter);

// Download History (Phase 1D)
app.use('/api/download-history', historyRouter);

// Quota Monitoring (Phase 1D)
app.use('/api/quota', quotaRouter);

// =============================================
// HEALTH CHECK
// =============================================

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'RSS Feed Reader API is online 🚀',
    version: '2.2',
    phase: 'Phase 1D + 1H',
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    environment: process.env.NODE_ENV || 'development',
    features: [
      'RSS Feeds Management',
      'Torrent Downloads',
      'Storage Management',
      'Quota Monitoring',
      'Download History'
    ],
    endpoints: {
      feeds: '/api/feeds',
      downloads: '/api/downloads',
      storage: '/api/storage',
      history: '/api/download-history',
      quota: '/api/quota'
    }
  });
});

// =============================================
// STATIC FILES & SPA FALLBACK
// =============================================

// Serve React build
app.use(express.static(path.join(__dirname, 'dist')));

// SPA fallback — render index.html for all routes
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// =============================================
// ERROR HANDLING
// =============================================

app.use((err, req, res, next) => {
  console.error('🔴 Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
    timestamp: new Date().toISOString()
  });
});

// =============================================
// START SERVER
// =============================================

app.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║  📺 RSS Feed Reader + Torrent Media Server                   ║
║  v2.2 — Phase 1D (Torrents) + Phase 1H (RSS Feeds)          ║
╠══════════════════════════════════════════════════════════════╣
║  ✅ Server running on port ${PORT}
║  🔗 Health Check: http://localhost:${PORT}/api/health
║  📡 Network Access: http://192.168.1.86:${PORT}/api/health
║  🌐 Web UI: http://localhost:${PORT}
║  📦 Version: 2.2
║  🌍 Environment: ${process.env.NODE_ENV || 'development'}
╠══════════════════════════════════════════════════════════════╣
║  📚 API ENDPOINTS:
║  
║  📰 RSS FEEDS (Phase 1H):
║    GET  /api/feeds                    — List all feeds
║    POST /api/feeds                    — Add new feed
║    GET  /api/feeds/:name              — Get feed items
║    PATCH /api/feeds/:name             — Update feed
║    DELETE /api/feeds/:name            — Delete feed
║    POST /api/feeds/:name/refresh      — Sync feed
║    GET  /api/feeds/stats/overview     — Feed statistics
║
║  📥 DOWNLOADS (Phase 1D):
║    GET  /api/downloads                — List downloads
║    POST /api/downloads                — Add download
║    GET  /api/downloads/:id            — Get download details
║    DELETE /api/downloads/:id          — Delete download
║
║  💾 STORAGE (Phase 1D):
║    GET  /api/storage/stats            — Storage stats
║    GET  /api/storage/categories       — Storage by category
║
║  📊 HISTORY (Phase 1D):
║    GET  /api/download-history         — Download history
║    GET  /api/download-history/stats   — History statistics
║
║  ⚙️ QUOTA (Phase 1D):
║    GET  /api/quota/stats              — Quota monitoring
║    GET  /api/quota/alerts             — Storage alerts
║
╚══════════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n⏹️  Shutting down gracefully...');
  process.exit(0);
});