/**
 * FeedList Component
 * File: src/frontend/components/RSS/FeedList.jsx
 * List view (tabela) para mostrar feeds em formato de tabela
 */

import React from 'react';
import Badge from '../ui/Badge';
import { getMediaIcon, getQualityInfo, sanitizeTitle } from '../../services/formatters';

export default function FeedList({
  items = [],
  onMagnet = null,
  onToggleRead = null,
  readItems = []
}) {
  if (items.length === 0) {
    return (
      <div className="empty-state">
        <p>📭 No items found</p>
        <p style={{ fontSize: '12px', color: '#999' }}>
          Try adjusting your filters or search query
        </p>
      </div>
    );
  }

  const handleMagnetClick = (magnet) => {
    if (magnet) {
      window.location.href = magnet;
    }
  };

  const handleReadToggle = (guid, e) => {
    e.stopPropagation();
    if (onToggleRead) {
      onToggleRead(guid);
    }
  };

  return (
    <div className="feed-list-wrapper">
      <table className="feed-list">
        <thead>
          <tr>
            <th width="40">Type</th>
            <th>Name</th>
            <th width="80">Quality</th>
            <th width="90">Date</th>
            <th width="70" style={{ textAlign: 'right' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => {
            const cleanTitle = sanitizeTitle(item.title);
            const icon = getMediaIcon(item.title);
            const quality = getQualityInfo(item.title);
            const isRead = readItems.includes(item.guid);
            const date = item.pubDate
              ? new Date(item.pubDate).toLocaleDateString([], { day: '2-digit', month: 'short' })
              : '—';
            const rowClass = index % 2 === 0 ? 'row-even' : 'row-odd';

            return (
              <tr key={item.guid} className={`${rowClass} ${isRead ? 'is-read' : ''}`}>
                <td>{icon}</td>
                <td>
                  <div className="sanitized-name">{cleanTitle}</div>
                  <div className="original-meta" title={item.title}>
                    {item.title}
                  </div>
                </td>
                <td>
                  <Badge
                    type={quality.className}
                    label={quality.tag}
                    size="small"
                  />
                </td>
                <td style={{ fontSize: '11px', color: 'var(--text-dim, #999)' }}>
                  {date}
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button
                    className="magnet-link"
                    onClick={() => handleMagnetClick(item.magnet)}
                    title="Download"
                  >
                    🧲 GET
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}