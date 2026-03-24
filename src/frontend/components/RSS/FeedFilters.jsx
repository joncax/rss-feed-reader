/**
 * FeedFilters Component
 * File: src/frontend/components/RSS/FeedFilters.jsx
 * Filter bar com quality, type, sort pills
 */

import React from 'react';

export default function FeedFilters({
  filters = { quality: 'all', type: 'all' },
  setQualityFilter = () => {},
  setTypeFilter = () => {},
  sortBy = 'newest',
  setSort = () => {},
  clearFilters = () => {},
  hasActiveFilters = false,
  qualityStats = {},
  typeStats = {}
}) {
  const qualityOptions = [
    { value: 'all', label: 'All' },
    { value: 'sd', label: 'SD', count: qualityStats.sd },
    { value: '480p', label: '480p', count: qualityStats['480p'] },
    { value: '720p', label: '720p', count: qualityStats['720p'], color: 'q-hd' },
    { value: '1080p', label: '1080p', count: qualityStats['1080p'], color: 'q-fhd' },
    { value: '4k', label: '4K', count: qualityStats['4k'], color: 'q-uhd' }
  ];

  const typeOptions = [
    { value: 'all', label: 'All' },
    { value: 'tv', label: '📺 TV', count: typeStats.tv },
    { value: 'movie', label: '🎬 Movie', count: typeStats.movie }
  ];

  const sortOptions = [
    { value: 'newest', label: '⬇ Newest' },
    { value: 'oldest', label: '⬆ Oldest' }
  ];

  return (
    <div className="feed-filters">
      <div className="filter-group">
        <span className="filter-label">QUALITY</span>
        <div className="filter-pills">
          {qualityOptions.map(opt => (
            <button
              key={opt.value}
              className={`filter-btn ${opt.color || ''} ${filters.quality === opt.value ? 'filter-btn--active' : ''}`}
              onClick={() => setQualityFilter(opt.value)}
              title={opt.count !== undefined ? `${opt.count} items` : ''}
            >
              {opt.label}
              {opt.count !== undefined && opt.count > 0 && (
                <span className="filter-count">({opt.count})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <span className="filter-label">TYPE</span>
        <div className="filter-pills">
          {typeOptions.map(opt => (
            <button
              key={opt.value}
              className={`filter-btn ${filters.type === opt.value ? 'filter-btn--active' : ''}`}
              onClick={() => setTypeFilter(opt.value)}
              title={opt.count !== undefined ? `${opt.count} items` : ''}
            >
              {opt.label}
              {opt.count !== undefined && opt.count > 0 && (
                <span className="filter-count">({opt.count})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <span className="filter-label">SORT</span>
        <div className="filter-pills">
          {sortOptions.map(opt => (
            <button
              key={opt.value}
              className={`sort-btn ${sortBy === opt.value ? 'sort-btn--active' : ''}`}
              onClick={() => setSort(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {hasActiveFilters && (
        <button
          className="filter-clear-btn"
          onClick={clearFilters}
        >
          ✕ Clear Filters
        </button>
      )}
    </div>
  );
}