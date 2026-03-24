/**
 * FeedStatsPanel Component
 * File: src/frontend/components/RSS/FeedStatsPanel.jsx
 * Panel com stats rápidas dos feeds
 */

import React from 'react';

export default function FeedStatsPanel({
  feeds = [],
  totalFeeds = 0,
  loading = false
}) {
  // Validar se feeds é um array
  const feedsArray = Array.isArray(feeds) ? feeds : [];

  const totalItems = feedsArray.reduce((sum, feed) => {
    const count = feed.itemCount || feed.count || 0;
    return sum + count;
  }, 0);

  const activeFeeds = feedsArray.filter(f => {
    const status = f.status || f.enabled !== false;
    return status;
  }).length;

  const lastUpdated = feedsArray.reduce((latest, feed) => {
    const updated = feed.lastUpdated || feed.updated || '';
    if (!updated) return latest;
    const feedTime = new Date(updated).getTime();
    const latestTime = latest ? new Date(latest).getTime() : 0;
    return feedTime > latestTime ? updated : latest;
  }, '');

  const lastUpdatedDisplay = lastUpdated
    ? new Date(lastUpdated).toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'Never';

  return (
    <div className="feed-stats-panel">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📺</div>
          <div className="stat-content">
            <p className="stat-label">Total Feeds</p>
            <p className="stat-value">{feedsArray.length}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <p className="stat-label">Active</p>
            <p className="stat-value">{activeFeeds}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📰</div>
          <div className="stat-content">
            <p className="stat-label">Total Items</p>
            <p className="stat-value">{totalItems}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🕐</div>
          <div className="stat-content">
            <p className="stat-label">Last Updated</p>
            <p className="stat-value" style={{ fontSize: '12px' }}>
              {lastUpdatedDisplay}
            </p>
          </div>
        </div>
      </div>

      {loading && (
        <div className="stats-loading">
          <p>⏳ Loading stats...</p>
        </div>
      )}
    </div>
  );
}