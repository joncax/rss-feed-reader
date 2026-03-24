/**
 * DownloadCard Component
 * File: src/frontend/components/DownloadCenter/DownloadCard.jsx
 * Card individual para um download com progresso e ações
 */

import React from 'react';
import Card from '../ui/Card';
import ProgressBar from '../ui/ProgressBar';
import Badge from '../ui/Badge';
import { formatBytes, formatSpeed, formatETA } from '../../services/formatters';

export default function DownloadCard({
  download = {},
  onCopy = null,
  onCleanup = null,
  onDelete = null,
  isLoading = false
}) {
  const {
    id = '',
    title = 'Unknown',
    status = 'downloading',
    progress = 0,
    speed = 0,
    eta = 0,
    size = 0,
    downloaded = 0
  } = download;

  const statusColor = {
    'downloading': '#00b4d8',
    'completed': '#44ff44',
    'awaiting_action': '#ffa500',
    'error': '#ff4d4d'
  }[status] || '#999999';

  return (
    <Card className="download-card" hoverable>
      <div className="download-card-header">
        <h3 className="download-card-title">{title}</h3>
        <Badge type={status} label={status.toUpperCase()} size="small" />
      </div>

      <div className="download-card-progress">
        <ProgressBar
          progress={progress}
          color={statusColor}
          height={6}
          showLabel={true}
        />
      </div>

      <div className="download-card-stats">
        <div className="stat">
          <span className="stat-label">Speed:</span>
          <span className="stat-value">{formatSpeed(speed)}</span>
        </div>
        <div className="stat">
          <span className="stat-label">ETA:</span>
          <span className="stat-value">{formatETA(eta)}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Size:</span>
          <span className="stat-value">
            {formatBytes(downloaded)} / {formatBytes(size)}
          </span>
        </div>
      </div>

      <div className="download-card-actions">
        {status === 'awaiting_action' && (
          <>
            <button
              className="btn btn-sm btn-primary"
              onClick={onCopy}
              disabled={isLoading}
            >
              {isLoading ? '⏳' : '💾'} Copy
            </button>
            <button
              className="btn btn-sm btn-danger"
              onClick={onDelete}
              disabled={isLoading}
            >
              🗑️ Delete
            </button>
          </>
        )}

        {status === 'completed' && (
          <>
            <button
              className="btn btn-sm btn-primary"
              onClick={onCopy}
              disabled={isLoading}
            >
              {isLoading ? '⏳' : '💾'} Copy
            </button>
            <button
              className="btn btn-sm btn-secondary"
              onClick={onCleanup}
              disabled={isLoading}
            >
              {isLoading ? '⏳' : '🧹'} Cleanup
            </button>
          </>
        )}

        {status === 'downloading' && (
          <button
            className="btn btn-sm btn-danger"
            onClick={onDelete}
            disabled={isLoading}
          >
            ⏸️ Pause
          </button>
        )}

        {status === 'error' && (
          <button
            className="btn btn-sm btn-danger"
            onClick={onDelete}
            disabled={isLoading}
          >
            🗑️ Remove
          </button>
        )}
      </div>
    </Card>
  );
}