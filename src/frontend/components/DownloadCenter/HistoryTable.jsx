/**
 * HistoryTable Component
 * File: src/frontend/components/DownloadCenter/HistoryTable.jsx
 * Sub-section: Mostrar histórico com paginação e filtros
 */

import React from 'react';
import PropTypes from 'prop-types';
import Badge from '../ui/Badge';
import { formatBytes, formatDate } from '../../services/formatters';

export default function HistoryTable({ history = {} }) {
  const {
    historyItems = [],
    loading = false,
    error = null,
    totalCount = 0,
    currentPage = 1,
    totalPages = 1,
    goToPage = () => {},
    nextPage = () => {},
    prevPage = () => {},
    canGoNext = false,
    canGoPrev = false,
    setResultFilter = () => {},
    setCategoryFilter = () => {},
    clearFilters = () => {},
    exportAsCSV = () => {},
    filters = {}
  } = history;

  if (loading) {
    return <div className="loader">Loading history...</div>;
  }

  if (error) {
    return (
      <div className="error-message">
        <p>Error loading history: {error.message}</p>
      </div>
    );
  }

  if (historyItems.length === 0) {
    return (
      <div className="empty-state">
        <p>📭 No download history</p>
        <p style={{ fontSize: '12px', color: '#999' }}>
          Downloads will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="history-table-container">
      {/* Filters */}
      <div className="history-filters">
        <div className="filter-group">
          <label>Result:</label>
          <select
            value={filters.result || ''}
            onChange={(e) => setResultFilter(e.target.value || null)}
            className="form-input form-input--small"
          >
            <option value="">All</option>
            <option value="success">✅ Success</option>
            <option value="failed">❌ Failed</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Category:</label>
          <select
            value={filters.category || ''}
            onChange={(e) => setCategoryFilter(e.target.value || null)}
            className="form-input form-input--small"
          >
            <option value="">All</option>
            <option value="movies">🎬 Movies</option>
            <option value="tv">📺 TV Series</option>
            <option value="music">🎵 Music</option>
          </select>
        </div>

        <button
          className="btn btn-sm btn-secondary"
          onClick={clearFilters}
        >
          Clear Filters
        </button>

        <button
          className="btn btn-sm btn-secondary"
          onClick={exportAsCSV}
        >
          📥 Export CSV
        </button>
      </div>

      {/* Table */}
      <div className="history-table-wrapper">
        <table className="history-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Size</th>
              <th>Date</th>
              <th>Category</th>
              <th>Result</th>
            </tr>
          </thead>
          <tbody>
            {historyItems.map((item, index) => (
              <tr key={item.id} className={index % 2 === 0 ? 'row-even' : 'row-odd'}>
                <td className="cell-title">
                  <span title={item.title}>{item.title}</span>
                </td>
                <td>{formatBytes(item.size || 0)}</td>
                <td>{formatDate(item.timestamp || item.date)}</td>
                <td>
                  {item.category === 'movies' && '🎬 Movies'}
                  {item.category === 'tv' && '📺 TV'}
                  {item.category === 'music' && '🎵 Music'}
                  {!item.category && '—'}
                </td>
                <td>
                  <Badge
                    type={item.result === 'success' ? 'success' : 'error'}
                    label={item.result === 'success' ? '✅ Success' : '❌ Failed'}
                    size="small"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="history-pagination">
          <span className="pagination-info">
            Page {currentPage} of {totalPages} ({totalCount} items)
          </span>
          <div className="pagination-controls">
            <button
              className="btn btn-sm btn-secondary"
              onClick={prevPage}
              disabled={!canGoPrev}
            >
              ← Previous
            </button>
            <input
              type="number"
              min="1"
              max={totalPages}
              value={currentPage}
              onChange={(e) => goToPage(parseInt(e.target.value))}
              className="pagination-input"
            />
            <button
              className="btn btn-sm btn-secondary"
              onClick={nextPage}
              disabled={!canGoNext}
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

HistoryTable.propTypes = {
  history: PropTypes.object.isRequired
};