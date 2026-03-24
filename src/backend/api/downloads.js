import express from 'express';
import db from '../db-init.js';
import torrentService from '../torrent-service.js';
import storageService from '../storage-service.js';

const router = express.Router();

/**
 * GET /api/downloads
 * Listar todos os downloads (com filtros opcionais)
 */
router.get('/', (req, res) => {
  try {
    const { status, type } = req.query;
    let query = 'SELECT * FROM downloads ORDER BY created_at DESC';
    const params = [];

    if (status) {
      query += ' WHERE status = ?';
      params.push(status);
    }

    const downloads = db.prepare(query).all(...params);
    res.json({
      success: true,
      count: downloads.length,
      data: downloads
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

/**
 * GET /api/downloads/:id
 * Obter download específico
 */
router.get('/:id', (req, res) => {
  try {
    const download = db.prepare('SELECT * FROM downloads WHERE id = ?').get(req.params.id);
    
    if (!download) {
      return res.status(404).json({
        success: false,
        error: 'Download not found'
      });
    }

    res.json({
      success: true,
      data: download
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

/**
 * POST /api/downloads
 * Adicionar novo download (magnet + title)
 */
router.post('/', async (req, res) => {
  try {
    const { magnet, title } = req.body;

    if (!magnet || !title) {
      return res.status(400).json({
        success: false,
        error: 'magnet and title required'
      });
    }

    // Adicionar ao WebTorrent
    const torrentId = await torrentService.addTorrent(magnet, title);

    res.status(201).json({
      success: true,
      message: 'Download started',
      torrentId,
      magnet,
      title
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

/**
 * POST /api/downloads/:id/copy
 * Copiar de temp para storage final
 */
router.post('/:id/copy', async (req, res) => {
  try {
    const { category } = req.body; // opcional: 'movie', 'tv', 'music'

    const result = await storageService.copyToStorage(req.params.id, category);

    res.json({
      success: true,
      message: 'Copy started',
      data: result
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

/**
 * POST /api/downloads/:id/cleanup-temp
 * Apagar diretório temp
 */
router.post('/:id/cleanup-temp', async (req, res) => {
  try {
    const result = await storageService.cleanupTemp(req.params.id);

    res.json({
      success: true,
      message: 'Temp cleaned',
      data: result
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

/**
 * POST /api/downloads/:id/choose-category
 * User override: escolher category manualmente
 */
router.post('/:id/choose-category', (req, res) => {
  try {
    const { category } = req.body; // 'movie', 'tv', 'music'

    if (!['movie', 'tv', 'music'].includes(category)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid category. Must be: movie, tv, or music'
      });
    }

    db.prepare('UPDATE downloads SET user_category = ? WHERE id = ?')
      .run(category, req.params.id);

    res.json({
      success: true,
      message: 'Category updated',
      torrentId: req.params.id,
      category
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

/**
 * DELETE /api/downloads/:id
 * Remover download (e ficheiros)
 */
router.delete('/:id', (req, res) => {
  try {
    const download = db.prepare('SELECT * FROM downloads WHERE id = ?').get(req.params.id);
    
    if (!download) {
      return res.status(404).json({
        success: false,
        error: 'Download not found'
      });
    }

    // Remover do WebTorrent
    torrentService.removeTorrent(req.params.id);

    res.json({
      success: true,
      message: 'Download removed',
      torrentId: req.params.id
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

export default router;