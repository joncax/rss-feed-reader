/**
 * RSSFeedManager Component
 * File: src/frontend/components/RSS/RSSFeedManager.jsx
 * Container principal para gerenciar feeds RSS
 */

import React, { useState } from 'react';
import FeedSearchBar from './FeedSearchBar';
import FeedFilters from './FeedFilters';
import FeedSettings from './FeedSettings';
import FeedGrid from './FeedGrid';
import FeedList from './FeedList';
import { useFilterSort } from '../../hooks/useFilterSort';
import Modal from '../ui/Modal';

export default function RSSFeedManager() {
  // Sample data para demonstração
  const [sampleItems] = useState([
    {
      guid: '1',
      title: 'The Matrix 1080p BluRay',
      magnet: 'magnet:?xt=urn:btih:...',
      pubDate: new Date().toISOString(),
      category: 'movie'
    },
    {
      guid: '2',
      title: 'Breaking Bad S05E16 720p',
      magnet: 'magnet:?xt=urn:btih:...',
      pubDate: new Date(Date.now() - 86400000).toISOString(),
      category: 'tv'
    }
  ]);

  const {
    filteredItems,
    searchQuery,
    setSearchQuery,
    filters,
    setQualityFilter,
    setTypeFilter,
    clearFilters,
    hasActiveFilters,
    sortBy,
    setSort,
    viewMode,
    toggleViewMode,
    qualityStats,
    typeStats
  } = useFilterSort(sampleItems);

  const [selectedFeed, setSelectedFeed] = useState('');
  const [syncInterval, setSyncInterval] = useState(3600000);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showAddFeedModal, setShowAddFeedModal] = useState(false);
  const [feedName, setFeedName] = useState('');
  const [feedUrl, setFeedUrl] = useState('');

  const feeds = ['Feed 1', 'Feed 2', 'Feed 3'];

  const handleAddFeed = async () => {
    if (!feedName.trim() || !feedUrl.trim()) {
      alert('Please fill in both name and URL');
      return;
    }
    console.log('Adding feed:', feedName, feedUrl);
    setFeedName('');
    setFeedUrl('');
    setShowAddFeedModal(false);
  };

  const handleSyncNow = async () => {
    setIsSyncing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSyncing(false);
  };

  return (
    <div className="rss-feed-manager">
      <div className="rss-header">
        <h1>📺 Dashboard</h1>
        <button
          className="btn btn-primary"
          onClick={() => setShowAddFeedModal(true)}
        >
          + Add Feed
        </button>
      </div>

      <Modal
        isOpen={showAddFeedModal}
        title="Add New RSS Feed"
        onClose={() => setShowAddFeedModal(false)}
        onConfirm={handleAddFeed}
        confirmText="Add Feed"
      >
        <div className="form-group">
          <label htmlFor="feed-name-input">Feed Name</label>
          <input
            id="feed-name-input"
            type="text"
            className="form-input"
            placeholder="e.g., My Favorite Shows"
            value={feedName}
            onChange={(e) => setFeedName(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="feed-url-input">RSS URL</label>
          <input
            id="feed-url-input"
            type="url"
            className="form-input"
            placeholder="https://example.com/feed.xml"
            value={feedUrl}
            onChange={(e) => setFeedUrl(e.target.value)}
          />
        </div>
      </Modal>

      <FeedSettings
        selectedFeed={selectedFeed}
        feeds={feeds}
        onFeedChange={setSelectedFeed}
        syncInterval={syncInterval}
        onIntervalChange={setSyncInterval}
        onSyncNow={handleSyncNow}
        isSyncing={isSyncing}
      />

      <FeedSearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        viewMode={viewMode}
        toggleViewMode={toggleViewMode}
        resultCount={filteredItems.length}
        totalCount={sampleItems.length}
      />

      <FeedFilters
        filters={filters}
        setQualityFilter={setQualityFilter}
        setTypeFilter={setTypeFilter}
        sortBy={sortBy}
        setSort={setSort}
        clearFilters={clearFilters}
        hasActiveFilters={hasActiveFilters}
        qualityStats={qualityStats}
        typeStats={typeStats}
      />

      {viewMode === 'grid' ? (
        <FeedGrid items={filteredItems} />
      ) : (
        <FeedList items={filteredItems} />
      )}
    </div>
  );
}