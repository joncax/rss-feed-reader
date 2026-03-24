/**
 * FeedCard Component
 * File: src/frontend/components/RSS/FeedCard.jsx
 * Card individual para um item do RSS feed
 */

import React from 'react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { getMediaIcon, getQualityInfo, sanitizeTitle } from '../../services/formatters';

export default function FeedCard({
  item = {},
  onMagnet = null,
  onToggleRead = null,
  isRead = false
}) {
  const {
    title = 'Unknown',
    magnet = '',
    pubDate = '',
    guid = ''
  } = item;

  const cleanTitle = sanitizeTitle(title);
  const icon = getMediaIcon(title);
  const quality = getQualityInfo(title);

  const handleMagnetClick = (e) => {
    e.preventDefault();
    if (magnet && onMagnet) {
      window.location.href = magnet;
    }
  };

  const handleReadToggle = (e) => {
    e.stopPropagation();
    if (onToggleRead) {
      onToggleRead(guid);
    }
  };

  return (
    <Card
      className={`feed-card ${isRead ? 'feed-card--read' : ''}`}
      hoverable
    >
      <div className="feed-card-header">
        <div className="feed-card-icon">{icon}</div>
        <h3 className="feed-card-title">{cleanTitle}</h3>
      </div>

      <div className="feed-card-meta">
        <Badge
          type={quality.className}
          label={quality.tag}
          size="small"
        />
        {pubDate && (
          <span className="feed-card-date">
            {new Date(pubDate).toLocaleDateString()}
          </span>
        )}
      </div>

      <div className="feed-card-original">
        <small title={title}>{title}</small>
      </div>

      <div className="feed-card-actions">
        <button
          className="btn btn-sm btn-primary"
          onClick={handleMagnetClick}
          title="Download via magnet link"
        >
          🧲 GET
        </button>
        {onToggleRead && (
          <button
            className={`btn btn-sm btn-secondary ${isRead ? 'btn--active' : ''}`}
            onClick={handleReadToggle}
            title={isRead ? 'Mark as unread' : 'Mark as read'}
          >
            {isRead ? '✓' : '○'} Read
          </button>
        )}
      </div>
    </Card>
  );
}