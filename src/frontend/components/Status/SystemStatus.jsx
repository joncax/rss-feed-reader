/**
 * SystemStatus Component
 * File: src/frontend/components/Status/SystemStatus.jsx
 * Página com informações e stats do sistema
 */

import React, { useState, useEffect } from 'react';
import { useStorage } from '../../hooks/useStorage';
import { useHistory } from '../../hooks/useHistory';
import { checkHealth } from '../../services/api';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { formatBytes, formatPercent } from '../../services/formatters';

export default function SystemStatus() {
  const [healthInfo, setHealthInfo] = useState(null);
  const [healthLoading, setHealthLoading] = useState(true);
  const [healthError, setHealthError] = useState(null);

  const storage = useStorage({ pollInterval: 10000 });
  const history = useHistory({ autoFetch: true });

  // Fetch health info
  useEffect(() => {
    const fetchHealth = async () => {
      try {
        setHealthLoading(true);
        const result = await checkHealth();
        setHealthInfo(result);
        setHealthError(null);
      } catch (error) {
        setHealthError(error.message);
        console.error('Health check error:', error);
      } finally {
        setHealthLoading(false);
      }
    };

    fetchHealth();
    const interval = setInterval(fetchHealth, 10000); // 10s
    return () => clearInterval(interval);
  }, []);

  // =============================================
  // STATS CALCULATIONS
  // =============================================

  const getSuccessRate = () => {
    if (history.historyItems.length === 0) return 0;
    const successCount = history.historyItems.filter(
      item => item.result === 'success'
    ).length;
    return Math.round((successCount / history.historyItems.length) * 100);
  };

  const getAverageDownloadSize = () => {
    if (history.historyItems.length === 0) return 0;
    const totalSize = history.historyItems.reduce((sum, item) => sum + (item.size || 0), 0);
    return totalSize / history.historyItems.length;
  };

  const getCategoryStats = () => {
    const stats = {};
    history.historyItems.forEach(item => {
      if (!stats[item.category]) {
        stats[item.category] = 0;
      }
      stats[item.category]++;
    });
    return stats;
  };

  const categoryStats = getCategoryStats();
  const successRate = getSuccessRate();
  const avgSize = getAverageDownloadSize();

  // =============================================
  // RENDER SECTIONS
  // =============================================

  return (
    <div className="system-status">
      <h1>📊 System Status</h1>

      {/* Health Check */}
      <section className="status-section">
        <h2>🏥 Health Check</h2>
        {healthLoading ? (
          <div className="loader">Checking health...</div>
        ) : healthError ? (
          <Card className="status-error">
            <p>❌ Health check failed: {healthError}</p>
          </Card>
        ) : healthInfo ? (
          <div className="health-grid">
            <Card>
              <div className="stat-card">
                <h3>Status</h3>
                <Badge
                  type={healthInfo.status === 'ok' ? 'success' : 'error'}
                  label={healthInfo.status?.toUpperCase() || 'UNKNOWN'}
                  size="large"
                />
              </div>
            </Card>

            <Card>
              <div className="stat-card">
                <h3>Version</h3>
                <p className="stat-value">{healthInfo.version || 'N/A'}</p>
              </div>
            </Card>

            <Card>
              <div className="stat-card">
                <h3>Features</h3>
                <ul className="feature-list">
                  {(healthInfo.features || []).map((feature, i) => (
                    <li key={i}>✅ {feature}</li>
                  ))}
                </ul>
              </div>
            </Card>
          </div>
        ) : null}
      </section>

      {/* Storage Status */}
      <section className="status-section">
        <h2>💾 Storage Status</h2>
        {storage.loading ? (
          <div className="loader">Loading storage...</div>
        ) : storage.error ? (
          <Card className="status-error">
            <p>❌ Storage error: {storage.error.message}</p>
          </Card>
        ) : (
          <div className="status-grid">
            <Card>
              <div className="stat-card">
                <h3>Total Space</h3>
                <p className="stat-value">{formatBytes(storage.total)}</p>
              </div>
            </Card>

            <Card>
              <div className="stat-card">
                <h3>Used</h3>
                <p className="stat-value">{formatBytes(storage.used)}</p>
                <p className="stat-detail">{formatPercent(storage.percentUsed)}</p>
              </div>
            </Card>

            <Card>
              <div className="stat-card">
                <h3>Free</h3>
                <p className="stat-value">{formatBytes(storage.free)}</p>
                <p className="stat-detail">{formatPercent(100 - storage.percentUsed)}</p>
              </div>
            </Card>

            <Card>
              <div className="stat-card">
                <h3>Status</h3>
                <Badge
                  type={storage.status}
                  label={storage.getStatusLabel()}
                  size="large"
                />
              </div>
            </Card>

            {/* Category Breakdown */}
            <Card className="full-width">
              <div className="stat-card">
                <h3>Category Breakdown</h3>
                <div className="category-stats">
                  {storage.getCategories().map(cat => (
                    <div key={cat.name} className="category-stat">
                      <span className="cat-name">{cat.displayName}</span>
                      <span className="cat-size">{formatBytes(cat.size)}</span>
                      <span className="cat-percent">{cat.percent}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        )}
      </section>

      {/* Download History Stats */}
      <section className="status-section">
        <h2>📥 Download History Stats</h2>
        {history.loading ? (
          <div className="loader">Loading history...</div>
        ) : (
          <div className="status-grid">
            <Card>
              <div className="stat-card">
                <h3>Total Downloads</h3>
                <p className="stat-value">{history.totalCount}</p>
              </div>
            </Card>

            <Card>
              <div className="stat-card">
                <h3>Success Rate</h3>
                <p className="stat-value">{successRate}%</p>
                <p className="stat-detail">
                  {history.historyItems.filter(i => i.result === 'success').length}/{history.totalCount}
                </p>
              </div>
            </Card>

            <Card>
              <div className="stat-card">
                <h3>Average Size</h3>
                <p className="stat-value">{formatBytes(avgSize)}</p>
              </div>
            </Card>

            <Card>
              <div className="stat-card">
                <h3>Total Downloaded</h3>
                <p className="stat-value">
                  {formatBytes(
                    history.historyItems.reduce((sum, item) => sum + (item.size || 0), 0)
                  )}
                </p>
              </div>
            </Card>

            {/* Category Distribution */}
            <Card className="full-width">
              <div className="stat-card">
                <h3>Category Distribution</h3>
                <div className="category-stats">
                  {Object.entries(categoryStats).map(([category, count]) => {
                    const displayName = {
                      'movies': '🎬 Movies',
                      'tv': '📺 TV Series',
                      'music': '🎵 Music'
                    }[category] || category;

                    return (
                      <div key={category} className="category-stat">
                        <span className="cat-name">{displayName}</span>
                        <span className="cat-count">{count} downloads</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          </div>
        )}
      </section>

      {/* System Information */}
      <section className="status-section">
        <h2>ℹ️ System Information</h2>
        <Card className="full-width">
          <div className="system-info">
            <div className="info-item">
              <span className="info-label">API Version:</span>
              <span className="info-value">{healthInfo?.version || 'N/A'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Database:</span>
              <span className="info-value">SQLite</span>
            </div>
            <div className="info-item">
              <span className="info-label">Node.js Version:</span>
              <span className="info-value">v24+</span>
            </div>
            <div className="info-item">
              <span className="info-label">Runtime:</span>
              <span className="info-value">Express.js</span>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}