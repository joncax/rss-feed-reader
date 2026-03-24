import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './db-init.js';
import mediaClassifier from './media-classifier.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEMP_DIR = process.env.TEMP_DIR || '/mnt/c/Users/Admin/Downloads';
const MOVIES_DIR = process.env.MOVIES_DIR || '/mnt/f/01-FILMES';
const TV_DIR = process.env.TV_DIR || '/mnt/f/02-TV_Series';
const MUSIC_DIR = process.env.MUSIC_DIR || '/mnt/f/04-MP3';
const STORAGE_QUOTA_BYTES = parseInt(process.env.STORAGE_QUOTA_BYTES) || 2199023255552; // 2TB

class StorageService {
  constructor() {
    this.paths = {
      movies: MOVIES_DIR,
      tv: TV_DIR,
      music: MUSIC_DIR
    };
  }

  /**
   * Copiar ficheiros de temp para storage final
   * category: 'movie' | 'tv' | 'music' (opcional — usa auto-detect se não especificado)
   */
  async copyToStorage(torrentId, userCategory = null) {
    try {
      // Buscar download do DB
      const download = db.prepare('SELECT * FROM downloads WHERE id = ?').get(torrentId);
      if (!download) {
        throw new Error(`Download ${torrentId} not found in DB`);
      }

      if (download.status !== 'completed') {
        throw new Error(`Download ${torrentId} is not completed yet`);
      }

      const sourcePath = download.source_path;

      // Auto-detect ou usar categoria do utilizador
      let finalCategory = userCategory;
      let detectedType = download.detected_type;

      if (!finalCategory && !detectedType) {
        // Auto-detect baseado no título
        const detected = mediaClassifier.classify(download.title);
        detectedType = detected.type;
        finalCategory = detected.type;
      } else if (!finalCategory) {
        finalCategory = detectedType;
      }

      // Mapear categoria para pasta
      const destBase = this.paths[finalCategory] || this.paths.movies;
      const destPath = path.join(destBase, path.basename(sourcePath));

      // Verificar quota antes de copiar
      const sourceSize = await this.getDirectorySize(sourcePath);
      if (!this.canAddDownload(sourceSize)) {
        throw new Error('Storage quota exceeded');
      }

      // Criar diretório destino se não existir
      await fs.ensureDir(destBase);

      // Copiar (não move!)
      console.log(`📋 Copying from ${sourcePath} to ${destPath}...`);
      await fs.copy(sourcePath, destPath, { overwrite: false });
      console.log(`✅ Copy complete: ${destPath}`);

      // Atualizar DB
      db.prepare(`
        UPDATE downloads 
        SET status = ?, dest_path = ?, final_category = ?, copied_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run('moved', destPath, finalCategory, torrentId);

      // Registar em histórico
      this.recordHistory(torrentId, download, 'moved', finalCategory, destPath);

      return {
        success: true,
        torrentId,
        sourcePath,
        destPath,
        finalCategory,
        size: sourceSize
      };
    } catch (err) {
      console.error(`❌ Copy error (${torrentId}):`, err.message);

      // Registar erro no DB
      try {
        db.prepare('UPDATE downloads SET status = ?, last_error = ? WHERE id = ?')
          .run('error', err.message, torrentId);
      } catch (dbErr) {
        console.error('Error updating DB with error:', dbErr.message);
      }

      throw err;
    }
  }

  /**
   * Apagar temp directory (após copy bem-sucedido)
   */
  async cleanupTemp(torrentId) {
    try {
      const download = db.prepare('SELECT * FROM downloads WHERE id = ?').get(torrentId);
      if (!download) {
        throw new Error(`Download ${torrentId} not found`);
      }

      if (download.status !== 'moved') {
        throw new Error(`Download must be in 'moved' status before cleanup. Current: ${download.status}`);
      }

      const tempPath = download.source_path;

      // Apagar temp
      console.log(`🗑️  Deleting temp directory: ${tempPath}...`);
      await fs.remove(tempPath);
      console.log(`✅ Temp cleaned: ${tempPath}`);

      // Atualizar DB
      db.prepare(`
        UPDATE downloads 
        SET status = ?, cleaned_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run('cleaned', torrentId);

      // Atualizar histórico com result='success'
      db.prepare(`
        UPDATE download_history 
        SET date_cleaned = CURRENT_TIMESTAMP, result = ?
        WHERE torrent_id = ?
      `).run('success', torrentId);

      return {
        success: true,
        torrentId,
        tempPath
      };
    } catch (err) {
      console.error(`❌ Cleanup error (${torrentId}):`, err.message);

      try {
        db.prepare('UPDATE downloads SET status = ?, last_error = ? WHERE id = ?')
          .run('error', err.message, torrentId);
      } catch (dbErr) {
        console.error('Error updating DB with error:', dbErr.message);
      }

      throw err;
    }
  }

  /**
   * Obter estatísticas de quota
   */
  async getQuotaStats() {
    try {
      const moviesSize = await this.getDirectorySize(MOVIES_DIR);
      const tvSize = await this.getDirectorySize(TV_DIR);
      const musicSize = await this.getDirectorySize(MUSIC_DIR);

      const totalUsed = moviesSize + tvSize + musicSize;
      const percentUsed = (totalUsed / STORAGE_QUOTA_BYTES * 100).toFixed(2);
      const free = Math.max(0, STORAGE_QUOTA_BYTES - totalUsed);

      // Alertas
      let status = 'ok';
      if (percentUsed > 95) {
        status = 'critical';
      } else if (percentUsed > 80) {
        status = 'warning';
      }

      return {
        total: STORAGE_QUOTA_BYTES,
        used: totalUsed,
        free,
        percentUsed: parseFloat(percentUsed),
        status,
        breakdown: {
          movies: {
            size: moviesSize,
            percent: (moviesSize / STORAGE_QUOTA_BYTES * 100).toFixed(2),
            path: MOVIES_DIR
          },
          tv: {
            size: tvSize,
            percent: (tvSize / STORAGE_QUOTA_BYTES * 100).toFixed(2),
            path: TV_DIR
          },
          music: {
            size: musicSize,
            percent: (musicSize / STORAGE_QUOTA_BYTES * 100).toFixed(2),
            path: MUSIC_DIR
          }
        }
      };
    } catch (err) {
      console.error('Error calculating quota:', err.message);
      return null;
    }
  }

  /**
   * Verificar se pode adicionar novo download
   */
  canAddDownload(sizeBytes) {
    try {
      const stats = db.prepare(`
        SELECT COALESCE(SUM(size_total), 0) as totalSize 
        FROM downloads 
        WHERE status IN ('downloading', 'completed', 'moving', 'moved')
      `).get();

      const storageStats = this.getQuotaStatsSync();
      if (!storageStats) return false;

      // Verificar se há espaço
      return storageStats.free >= sizeBytes;
    } catch (err) {
      console.error('Error checking quota:', err.message);
      return false;
    }
  }

  /**
   * Obter tamanho de diretório (síncrono para quota check rápido)
   */
  getDirectorySizeSync(dirPath) {
    try {
      if (!fs.existsSync(dirPath)) {
        return 0;
      }

      let size = 0;
      const files = fs.readdirSync(dirPath, { withFileTypes: true });

      for (const file of files) {
        const fullPath = path.join(dirPath, file.name);
        if (file.isDirectory()) {
          size += this.getDirectorySizeSync(fullPath);
        } else {
          const stats = fs.statSync(fullPath);
          size += stats.size;
        }
      }

      return size;
    } catch (err) {
      console.error(`Error getting directory size for ${dirPath}:`, err.message);
      return 0;
    }
  }

  /**
   * Obter tamanho de diretório (assíncrono)
   */
  async getDirectorySize(dirPath) {
    try {
      if (!await fs.pathExists(dirPath)) {
        return 0;
      }

      let size = 0;
      const files = await fs.readdir(dirPath, { withFileTypes: true });

      for (const file of files) {
        const fullPath = path.join(dirPath, file.name);
        if (file.isDirectory()) {
          size += await this.getDirectorySize(fullPath);
        } else {
          const stats = await fs.stat(fullPath);
          size += stats.size;
        }
      }

      return size;
    } catch (err) {
      console.error(`Error getting directory size for ${dirPath}:`, err.message);
      return 0;
    }
  }

  /**
   * Versão síncrona para quota stats
   */
  getQuotaStatsSync() {
    try {
      const moviesSize = this.getDirectorySizeSync(MOVIES_DIR);
      const tvSize = this.getDirectorySizeSync(TV_DIR);
      const musicSize = this.getDirectorySizeSync(MUSIC_DIR);

      const totalUsed = moviesSize + tvSize + musicSize;
      const percentUsed = (totalUsed / STORAGE_QUOTA_BYTES * 100).toFixed(2);
      const free = Math.max(0, STORAGE_QUOTA_BYTES - totalUsed);

      let status = 'ok';
      if (percentUsed > 95) {
        status = 'critical';
      } else if (percentUsed > 80) {
        status = 'warning';
      }

      return {
        total: STORAGE_QUOTA_BYTES,
        used: totalUsed,
        free,
        percentUsed: parseFloat(percentUsed),
        status
      };
    } catch (err) {
      console.error('Error calculating quota (sync):', err.message);
      return null;
    }
  }

  /**
   * Registar em histórico
   */
  recordHistory(torrentId, download, status, finalCategory, finalPath) {
    try {
      const now = new Date();
      const durationSeconds = Math.floor((now - new Date(download.created_at)) / 1000);

      db.prepare(`
        INSERT INTO download_history 
        (torrent_id, title, magnet, size, date_started, date_moved, final_category, final_path, result)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        torrentId,
        download.title,
        download.magnet,
        download.size_total,
        download.created_at,
        now.toISOString(),
        finalCategory,
        finalPath,
        'in_progress'
      );
    } catch (err) {
      console.error('Error recording to history:', err.message);
    }
  }
}

export default new StorageService();