import express from 'express';
import storageService from '../storage-service.js';

const router = express.Router();

/**
 * GET /api/storage/stats
 * Obter estatísticas globais de quota
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await storageService.getQuotaStats();

    if (!stats) {
      return res.status(500).json({
        success: false,
        error: 'Failed to calculate quota'
      });
    }

    res.json({
      success: true,
      data: stats
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

/**
 * GET /api/storage/breakdown
 * Detalhe por categoria (Movies, TV, Music)
 */
router.get('/breakdown', async (req, res) => {
  try {
    const stats = await storageService.getQuotaStats();

    if (!stats) {
      return res.status(500).json({
        success: false,
        error: 'Failed to calculate breakdown'
      });
    }

    res.json({
      success: true,
      data: {
        movies: {
          size: stats.breakdown.movies.size,
          percent: stats.breakdown.movies.percent,
          path: stats.breakdown.movies.path
        },
        tv: {
          size: stats.breakdown.tv.size,
          percent: stats.breakdown.tv.percent,
          path: stats.breakdown.tv.path
        },
        music: {
          size: stats.breakdown.music.size,
          percent: stats.breakdown.music.percent,
          path: stats.breakdown.music.path
        },
        total: {
          used: stats.used,
          free: stats.free,
          percentUsed: stats.percentUsed,
          quota: stats.total,
          status: stats.status
        }
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

export default router;