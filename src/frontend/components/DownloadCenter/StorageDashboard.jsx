/**
 * StorageDashboard Component
 * File: src/frontend/components/DownloadCenter/StorageDashboard.jsx
 * Sub-section: Mostrar quota, breakdown por categoria, status
 */

import React from 'react';
import ProgressBar from '../ui/ProgressBar';
import Badge from '../ui/Badge';
import { formatBytes, formatPercent } from '../../services/formatters';

export default function StorageDashboard({ storage = {} }) {
  const {
    total = 0,
    used = 0,
    free = 0,
    percentUsed = 0,
    status = 'ok',
    getCategories = () => [],
    getProgressBarColor = () => '#44ff44',
    getStatusColor = () => '#44ff44',
    getStatusLabel = () => 'OK',
    loading = false,
    error = null
  } = storage;

  if (loading) {
    return <div className="loader">Loading storage info...</div>;
  }

  if (error) {
    return (
      <div className="error-message">
        <p>Error loading storage: {error.message}</p>
      </div>
    );
  }

  const categories = getCategories();
  const barColor = getProgressBarColor();
  const statusColor = getStatusColor();
  const statusLabel = getStatusLabel();

  return (
    <div className="storage-dashboard">
      {/* Main Quota Bar */}
      <div className="quota-section">
        <div className="quota-header">
          <div>
            <p className="quota-label">Total Usage</p>
            <p className="quota-value">
              {formatBytes(used)} / {formatBytes(total)}
            </p>
          </div>
          <Badge 
            type={status} 
            label={statusLabel}
            size="medium"
            style={{ backgroundColor: statusColor }}
          />
        </div>

        <ProgressBar
          progress={percentUsed}
          color={barColor}
          height={12}
          showLabel={true}
          animated={true}
        />

        <div className="quota-footer">
          <span>Free: {formatBytes(free)}</span>
          <span>Used: {formatPercent(percentUsed)}</span>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="categories-section">
        <h4>📂 Categories</h4>
        <div className="categories-list">
          {categories.length > 0 ? (
            categories.map(cat => (
              <div key={cat.name} className="category-item">
                <div className="category-info">
                  <span className="category-name">{cat.displayName}</span>
                  <span className="category-size">
                    {formatBytes(cat.size)} ({cat.percent}%)
                  </span>
                </div>
                <div className="category-bar">
                  <ProgressBar
                    progress={parseFloat(cat.percent)}
                    color="#00b4d8"
                    height={4}
                    showLabel={false}
                  />
                </div>
              </div>
            ))
          ) : (
            <p style={{ color: '#999', fontSize: '12px' }}>No data</p>
          )}
        </div>
      </div>

      {/* Status Alert */}
      {status !== 'ok' && (
        <div className={`status-alert status-alert--${status}`}>
          {status === 'warning' && (
            <p>⚠️ Storage is getting full ({formatPercent(percentUsed)})</p>
          )}
          {status === 'critical' && (
            <p>🚨 Storage is critically full ({formatPercent(percentUsed)})</p>
          )}
        </div>
      )}
    </div>
  );
}