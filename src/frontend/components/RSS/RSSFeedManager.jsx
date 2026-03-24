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
import { useFeeds } from '../../hooks/useFeeds';
import { useFilterSort } from '../../hooks/useFilterSort';
import Modal from '../ui/Modal';

export default function RSSFeedManager() {
  const [showAddFeedModal, setShowAddFeedModal] = useState(false);
  const [feedName, setFeedName] = useState('');
  const [feedUrl, setFeedUrl] = useState('');

  // Hooks
  const feeds = useFeeds({
    pollInterval: 10000,
    autoStart: true
  });

  const filterSort = useFilterSort(feeds.feedItems);

  // =============================================
  // HANDLERS
  // =============================================

  const handleAddFeed = async () => {
    if (!feedName.trim() || !feedUrl.trim()) {
      alert('Please fill in both name and URL');
      return;
    }

    try {
      await feeds.addFeed(feedName, feedUrl);
      setFeedName('');
      setFeedUrl('');
      setShowAddFeedModal(false);
      alert('Feed added successfully!');
    } catch (error) {
      alert(`Error adding feed: ${error.message}`);
    }
  };

  const handleSelectFeed = async (feedName) => {
    if (feedName) {
      try {
        await feeds.loadFeedItems(feedName);
      } catch (error) {
        alert(`Error loading feed: ${error.message}`);
      }
    }
  };

  const handleSyncNow = async () => {
    try {
      await feeds.refetch();
      if (feeds.selectedFeed) {
        await feeds.loadFeedItems(feeds.selectedFeed);
      }
    } catch (error) {
      alert(`Error syncing: ${error.message}`);
    }
  };

  // =============================================
  // RENDER
  // =============================================

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

      {/* Add Feed Modal */}
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

      {/* Settings */}
      <FeedSettings
        selectedFeed={feeds.selectedFeed || ''}
        feeds={feeds.feeds}
        onFeedChange={handleSelectFeed}
        syncInterval={feeds.syncInterval}
        onIntervalChange={feeds.setSyncInterval}
        onSyncNow={handleSyncNow}
        isSyncing={feeds.actionLoading === `load-${feeds.selectedFeed}`}
      />

      {/* Loading State */}
      {feeds.loading && (
        <div className="loader">Loading feeds...</div>
      )}

      {/* Error State */}
      {feeds.error && (
        <div className="error-message">
          <p>Error loading feeds: {feeds.error.message}</p>
          <button className="btn btn-secondary" onClick={() => feeds.refetch()}>
            Retry
          </button>
        </div>
      )}

      {/* Search & View Toggle */}
      {!feeds.loading && !feeds.error && (
        <>
          <FeedSearchBar
            searchQuery={filterSort.searchQuery}
            setSearchQuery={filterSort.setSearchQuery}
            viewMode={filterSort.viewMode}
            toggleViewMode={filterSort.toggleViewMode}
            resultCount={filterSort.filteredItems.length}
            totalCount={feeds.feedItems.length}
          />

          {/* Filters */}
          <FeedFilters
            filters={filterSort.filters}
            setQualityFilter={filterSort.setQualityFilter}
            setTypeFilter={filterSort.setTypeFilter}
            sortBy={filterSort.sortBy}
            setSort={filterSort.setSort}
            clearFilters={filterSort.clearFilters}
            hasActiveFilters={filterSort.hasActiveFilters}
            qualityStats={filterSort.qualityStats}
            typeStats={filterSort.typeStats}
          />

          {/* Content - Grid or List */}
          {filterSort.viewMode === 'grid' ? (
            <FeedGrid items={filterSort.filteredItems} />
          ) : (
            <FeedList items={filterSort.filteredItems} />
          )}
        </>
      )}
    </div>
  );
}