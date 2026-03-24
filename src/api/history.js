import express from 'express';
import db from '../db-init.js';

const router = express.Router();

/**
 * GET /api/download-history
 * Obter histórico permanente com filtros
 */
router.get('/', (req, res) => {
  try {
    const { result, category, limit = 50, offset = 0 } = req.query;
    let query = 'SELECT * FROM download_history WHERE 1=1';
    const params = [];

    // Filtro por resultado (success, error, cancelled)
    if (result) {
      query += ' AND result = ?';
      params.push(result);
    }

    // Filtro por categoria (movies, tv, music)
    if (category) {
      query += ' AND final_category = ?';
      params.push(category);
    }

    // Ordenar por data (mais recentes primeiro)
    query += ' ORDER BY date_started DESC';

    // Paginação
    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const history = db.prepare(query).all(...params);

    // Contar total
    let countQuery = 'SELECT COUNT(*) as total FROM download_history WHERE 1=1';
    const countParams = [];
    if (result) {
      countQuery += ' AND result = ?';
      countParams.push(result);
    }
    if (category) {
      countQuery += ' AND final_category = ?';
      countParams.push(category);
    }

    const { total } = db.prepare(countQuery).get(...countParams);

    res.json({
      success: true,
      data: history,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        pages: Math.ceil(total / parseInt(limit))
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
 * GET /api/download-history/:id
 * Obter histórico de um download específico
 */
router.get('/:id', (req, res) => {
  try {
    const history = db.prepare('SELECT * FROM download_history WHERE torrent_id = ?')
      .get(req.params.id);

    if (!history) {
      return res.status(404).json({
        success: false,
        error: 'History not found'
      });
    }

    res.json({
      success: true,
      data: history
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

/**
 * GET /api/download-history/stats/summary
 * Resumo de estatísticas
 */
router.get('/stats/summary', (req, res) => {
  try {
    const stats = db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN result = 'success' THEN 1 ELSE 0 END) as successful,
        SUM(CASE WHEN result = 'error' THEN 1 ELSE 0 END) as failed,
        SUM(CASE WHEN result = 'cancelled' THEN 1 ELSE 0 END) as cancelled,
        SUM(size) as totalSize,
        AVG(total_duration_seconds) as avgDuration,
        AVG(avg_speed_kbps) as avgSpeed
      FROM download_history
    `).get();

    const byCategory = db.prepare(`
      SELECT 
        final_category,
        COUNT(*) as count,
        SUM(size) as totalSize
      FROM download_history
      GROUP BY final_category
    `).all();

    res.json({
      success: true,
      data: {
        overall: stats,
        byCategory
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
 * POST /api/download-history/export
 * Exportar histórico como JSON/CSV (simples)
 */
router.post('/export', (req, res) => {
  try {
    const { format = 'json' } = req.body; // 'json' ou 'csv'

    const history = db.prepare('SELECT * FROM download_history ORDER BY date_started DESC')
      .all();

    if (format === 'csv') {
      // Converter para CSV simples
      const headers = ['ID', 'Title', 'Size', 'Date Started', 'Date Moved', 'Result', 'Duration (s)', 'Avg Speed (kbps)'];
      const rows = history.map(h => [
        h.id,
        h.title,
        h.size,
        h.date_started,
        h.date_moved,
        h.result,
        h.total_duration_seconds,
        h.avg_speed_kbps
      ]);

      const csv = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell || ''}"`).join(','))
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=download-history.csv');
      res.send(csv);
    } else {
      // JSON
      res.json({
        success: true,
        data: history,
        exportedAt: new Date().toISOString()
      });
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

export default router;