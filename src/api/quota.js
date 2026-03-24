import express from 'express';
import storageService from '../storage-service.js';

const router = express.Router();

/**
 * GET /api/quota/stats
 * Obter estatísticas de quota (alias para /storage/stats)
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
      data: {
        total: stats.total,
        used: stats.used,
        free: stats.free,
        percentUsed: stats.percentUsed,
        status: stats.status,
        alert: stats.percentUsed > 95 ? 'critical' : stats.percentUsed > 80 ? 'warning' : 'ok'
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

/**
 * GET /api/quota/can-add/:sizeBytes
 * Verificar se pode adicionar download de size sizeBytes
 */
router.get('/can-add/:sizeBytes', (req, res) => {
  try {
    const sizeBytes = parseInt(req.params.sizeBytes);

    if (isNaN(sizeBytes) || sizeBytes <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid size. Must be positive integer in bytes'
      });
    }

    const can = storageService.canAddDownload(sizeBytes);

    res.json({
      success: true,
      canAdd: can,
      requestedSize: sizeBytes,
      message: can ? 'Storage available' : 'Not enough storage'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

export default router;