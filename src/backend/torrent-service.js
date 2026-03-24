import WebTorrent from 'webtorrent';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './db-init.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOWNLOAD_DIR = process.env.TEMP_DIR || '/mnt/c/Users/Admin/Downloads';

class TorrentService {
  constructor() {
    this.client = new WebTorrent({
      dht: true,
      tracker: true,
      downloadLimit: -1,
      uploadLimit: -1
    });
    this.torrents = new Map(); // { id → torrent object }
    this.stats = new Map();    // { id → { startTime, speeds, peers } }
  }

  /**
   * Adicionar novo torrent e começar download
   */
  addTorrent(magnetOrTorrent, title) {
    return new Promise((resolve, reject) => {
      const torrentId = crypto.randomUUID();
      const startTime = Date.now();

      try {
        this.client.add(magnetOrTorrent, { path: DOWNLOAD_DIR }, (torrent) => {
          this.torrents.set(torrentId, torrent);
          this.stats.set(torrentId, {
            startTime,
            speeds: [],
            peersSnapshots: []
          });

          // Criar subpasta para este torrent
          const torrentPath = path.join(DOWNLOAD_DIR, `torrent_${torrentId}`);

          // Guardar em DB
          try {
            db.prepare(`
              INSERT INTO downloads 
              (id, title, magnet, status, size_total, source_path)
              VALUES (?, ?, ?, ?, ?, ?)
            `).run(torrentId, title || torrent.name, magnetOrTorrent, 'downloading', torrent.length, torrentPath);
          } catch (dbErr) {
            console.error('Error saving to DB:', dbErr.message);
          }

          // Track speed e peers a cada 10 segundos
          const speedTracker = setInterval(() => {
            const stats = this.stats.get(torrentId);
            if (stats) {
              stats.speeds.push(torrent.downloadSpeed || 0);
              stats.peersSnapshots.push(torrent.numPeers || 0);
            }
          }, 10000);

          // Update progresso em tempo real
          torrent.on('download', () => {
            this.updateProgress(torrentId, torrent);
          });

          // Quando completo
          torrent.on('done', () => {
            clearInterval(speedTracker);
            
            try {
              db.prepare('UPDATE downloads SET status = ?, completed_at = CURRENT_TIMESTAMP WHERE id = ?')
                .run('completed', torrentId);
            } catch (dbErr) {
              console.error('Error updating completion:', dbErr.message);
            }

            console.log(`✅ Download completo: ${title || torrent.name}`);
          });

          // Erro
          torrent.on('error', (err) => {
            clearInterval(speedTracker);
            console.error(`❌ Torrent error (${torrentId}):`, err.message);
            
            try {
              db.prepare('UPDATE downloads SET status = ?, last_error = ? WHERE id = ?')
                .run('error', err.message, torrentId);
            } catch (dbErr) {
              console.error('Error saving error to DB:', dbErr.message);
            }
          });

          resolve(torrentId);
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Atualizar progresso no DB
   */
  updateProgress(torrentId, torrent) {
    const progress = (torrent.progress * 100).toFixed(2);
    const speedDown = torrent.downloadSpeed || 0;
    const speedUp = torrent.uploadSpeed || 0;
    const eta = torrent.timeRemaining ? Math.ceil(torrent.timeRemaining / 1000) : null;

    try {
      db.prepare(`
        UPDATE downloads 
        SET progress = ?, speed_down = ?, speed_up = ?, size_downloaded = ?, eta_seconds = ?
        WHERE id = ?
      `).run(progress, speedDown, speedUp, torrent.downloaded, eta, torrentId);
    } catch (err) {
      console.error('Error updating progress:', err.message);
    }
  }

  /**
   * Pausar torrent
   */
  pauseTorrent(torrentId) {
    const torrent = this.torrents.get(torrentId);
    if (torrent) {
      torrent.pause();
      try {
        db.prepare('UPDATE downloads SET status = ? WHERE id = ?')
          .run('paused', torrentId);
      } catch (err) {
        console.error('Error updating status to paused:', err.message);
      }
    }
  }

  /**
   * Retomar torrent
   */
  resumeTorrent(torrentId) {
    const torrent = this.torrents.get(torrentId);
    if (torrent) {
      torrent.resume();
      try {
        db.prepare('UPDATE downloads SET status = ? WHERE id = ?')
          .run('downloading', torrentId);
      } catch (err) {
        console.error('Error updating status to downloading:', err.message);
      }
    }
  }

  /**
   * Remover torrent (e ficheiros)
   */
  removeTorrent(torrentId) {
    const torrent = this.torrents.get(torrentId);
    if (torrent) {
      torrent.destroy();
      this.torrents.delete(torrentId);
    }
    this.stats.delete(torrentId);
    
    try {
      db.prepare('DELETE FROM downloads WHERE id = ?').run(torrentId);
    } catch (err) {
      console.error('Error deleting from DB:', err.message);
    }
  }

  /**
   * Obter todos os downloads
   */
  getDownloads() {
    try {
      return db.prepare('SELECT * FROM downloads ORDER BY created_at DESC').all();
    } catch (err) {
      console.error('Error fetching downloads:', err.message);
      return [];
    }
  }

  /**
   * Obter um download específico
   */
  getDownload(torrentId) {
    try {
      const download = db.prepare('SELECT * FROM downloads WHERE id = ?').get(torrentId);
      if (!download) return null;
      return download;
    } catch (err) {
      console.error('Error fetching download:', err.message);
      return null;
    }
  }

  /**
   * Obter estatísticas de um torrent
   */
  getTorrentStats(torrentId) {
    const torrent = this.torrents.get(torrentId);
    if (!torrent) return null;

    return {
      progress: (torrent.progress * 100).toFixed(2),
      speed_down: torrent.downloadSpeed || 0,
      speed_up: torrent.uploadSpeed || 0,
      eta: torrent.timeRemaining ? Math.ceil(torrent.timeRemaining / 1000) : null,
      peers: torrent.numPeers || 0,
      downloaded: torrent.downloaded,
      total: torrent.length
    };
  }

  /**
   * Destruir client (cleanup)
   */
  destroy() {
    this.torrents.forEach(torrent => {
      try {
        torrent.destroy();
      } catch (err) {
        console.error('Error destroying torrent:', err.message);
      }
    });
    this.torrents.clear();
    this.stats.clear();
    
    if (this.client) {
      this.client.destroy();
    }
  }
}

export default new TorrentService();