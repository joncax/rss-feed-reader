/**
 * FeedSearchBar Component
 * File: src/frontend/components/RSS/FeedSearchBar.jsx
 * Search bar com input e view toggle (grid/list)
 */

import React from 'react';

export default function FeedSearchBar({
  searchQuery = '',
  setSearchQuery = () => {},
  viewMode = 'grid',
  toggleViewMode = () => {},
  resultCount = 0,
  totalCount = 0
}) {
  return (
    <div className="feed-search-bar">
      <div className="search-box">
        <input
          type="text"
          className="search-input"
          placeholder="Search titles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Search feeds"
        />
        <span className="search-icon">🔍</span>
      </div>

      <div className="view-controls">
        <button
          className={`view-btn ${viewMode === 'grid' ? 'view-btn--active' : ''}`}
          onClick={toggleViewMode}
          title="Grid view"
          aria-label="Switch to grid view"
        >
          🖼️ Grid
        </button>
        <button
          className={`view-btn ${viewMode === 'list' ? 'view-btn--active' : ''}`}
          onClick={toggleViewMode}
          title="List view"
          aria-label="Switch to list view"
        >
          📜 List
        </button>
      </div>

      {resultCount > 0 && (
        <div className="result-count">
          {resultCount} of {totalCount} result{resultCount !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}