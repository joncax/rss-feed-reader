/**
 * FeedGrid Component
 * File: src/frontend/components/RSS/FeedGrid.jsx
 * Grid view para mostrar cards dos feeds
 */

import React from 'react';
import FeedCard from './FeedCard';

export default function FeedGrid({
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

  return (
    <div className="feed-grid">
      {items.map(item => (
        <FeedCard
          key={item.guid}
          item={item}
          onMagnet={onMagnet}
          onToggleRead={onToggleRead}
          isRead={readItems.includes(item.guid)}
        />
      ))}
    </div>
  );
}