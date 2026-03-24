/**
 * FeedsManagementTable Component
 * File: src/frontend/components/RSS/FeedsManagementTable.jsx
 * Tabela com lista de feeds cadastrados para gerenciar
 */

import React from 'react';
import Badge from '../ui/Badge';

export default function FeedsManagementTable({
  feeds = [],
  onEdit = () => {},
  onDelete = () => {},
  onRefresh = () => {},
  isDeleting = () => false,
  isRefreshing = () => false
}) {
  if (feeds.length === 0) {
    return (
      <div className="empty-state">
        <p>📭 No feeds yet</p>
        <p style={{ fontSize: '12px', color: '#999' }}>
          Add your first RSS feed to get started
        </p>
      </div>
    );
  }

  return (
    <div className="feeds-list-wrapper">
      <table className="feeds-list">
        <thead>
          <tr>
            <th width="30"></th>
            <th>Name</th>
            <th width="150">Status</th>
            <th width="120">Last Updated</th>
            <th width="200" style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {feeds.map((feed, index) => {
            const feedName = typeof feed === 'string' ? feed : feed.name || feed;
            const feedUrl = feed.url || feed.rss || '';
            const lastUpdated = feed.lastUpdated || feed.updated || 'Never';
            const itemCount = feed.itemCount || feed.count || 0;
            const rowClass = index % 2 === 0 ? 'row-even' : 'row-odd';

            return (
              <tr key={feedName} className={rowClass}>
                <td>📺</td>
                <td>
                  <div className="feed-name">{feedName}</div>
                  <div className="feed-url" title={feedUrl}>
                    {feedUrl}
                  </div>
                </td>
                <td>
                  <Badge
                    type="info"
                    label={`${itemCount} items`}
                    size="small"
                  />
                </td>
                <td style={{ fontSize: '11px', color: 'var(--text-dim, #999)' }}>
                  {lastUpdated}
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div className="feed-actions">
                    <button
                      className="feed-action-btn refresh-btn"
                      onClick={() => onRefresh(feedName)}
                      disabled={isRefreshing(feedName)}
                      title="Refresh feed"
                    >
                      {isRefreshing(feedName) ? '⏳' : '🔄'}
                    </button>
                    <button
                      className="feed-action-btn edit-btn"
                      onClick={() => onEdit(feed)}
                      title="Edit feed"
                    >
                      ✏️
                    </button>
                    <button
                      className="feed-action-btn delete-btn"
                      onClick={() => onDelete(feedName)}
                      disabled={isDeleting(feedName)}
                      title="Delete feed"
                    >
                      {isDeleting(feedName) ? '⏳' : '🗑️'}
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}