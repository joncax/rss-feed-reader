/**
 * FeedSettings Component
 * File: src/frontend/components/RSS/FeedSettings.jsx
 * Panel com controles de sincronização e configurações
 */

import React from 'react';

export default function FeedSettings({
  selectedFeed = '',
  feeds = [],
  onFeedChange = () => {},
  syncInterval = 0,
  onIntervalChange = () => {},
  onSyncNow = () => {},
  isSyncing = false
}) {
  const feedsArray = Array.isArray(feeds) ? feeds : [];
  const intervals = [
    { value: 0, label: 'Off' },
    { value: 3600000, label: 'Auto (1h)' },
    { value: 1800000, label: '30 Minutes' },
    { value: 3600000, label: '1 Hour' },
    { value: 10800000, label: '3 Hours' },
    { value: 21600000, label: '6 Hours' },
    { value: 43200000, label: '12 Hours' }
  ];

  return (
    <div className="feed-settings">
      <div className="panel centered-panel">
        <h3>📂 LIBRARY & SETTINGS</h3>

        <div className="input-group">
          <label htmlFor="feed-select">Select Feed</label>
          <select
            id="feed-select"
            value={selectedFeed}
            onChange={(e) => onFeedChange(e.target.value)}
            className="form-input"
          >
            <option value="">Choose a feed...</option>
            {feedsArray.map(feed => (
              <option key={typeof feed === 'string' ? feed : feed.name} value={typeof feed === 'string' ? feed : feed.name}>
                {typeof feed === 'string' ? feed : feed.name}
              </option>
            ))}
          </select>
        </div>

        <div className="refresh-area">
          <label htmlFor="interval-select">REFRESH EVERY:</label>
          <select
            id="interval-select"
            value={syncInterval}
            onChange={(e) => onIntervalChange(parseInt(e.target.value))}
            className="form-input"
          >
            {intervals.map(int => (
              <option key={int.value} value={int.value}>
                {int.label}
              </option>
            ))}
          </select>
        </div>

        <button
          className="btn btn-sync-all"
          onClick={onSyncNow}
          disabled={isSyncing}
        >
          <span className="icon">{isSyncing ? '⏳' : '🔄'}</span>
          {isSyncing ? 'Syncing...' : 'Sync All Now'}
        </button>
      </div>
    </div>
  );
}