/**
 * ManageFeeds Component
 * File: src/frontend/components/RSS/ManageFeeds.jsx
 * Container principal para gerenciar feeds cadastrados
 */

import React, { useState } from 'react';
import FeedsManagementTable from './FeedsManagementTable';
import FeedStatsPanel from './FeedStatsPanel';
import { useFeeds } from '../../hooks/useFeeds';
import Modal from '../ui/Modal';

export default function ManageFeeds() {
  const [showAddFeedModal, setShowAddFeedModal] = useState(false);
  const [feedName, setFeedName] = useState('');
  const [feedUrl, setFeedUrl] = useState('');
  const [editingFeed, setEditingFeed] = useState(null);

  const feeds = useFeeds({
    pollInterval: 30000, // 30 segundos para gerenciar feeds
    autoStart: true
  });

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

  const handleEditFeed = (feed) => {
    setEditingFeed(feed);
    setFeedName(feed.name || feed);
    setFeedUrl(feed.url || '');
    setShowAddFeedModal(true);
  };

  const handleSaveFeed = async () => {
    if (!feedName.trim() || !feedUrl.trim()) {
      alert('Please fill in both name and URL');
      return;
    }

    try {
      // TODO: Implementar endpoint de update no backend
      console.log('Updating feed:', editingFeed, { name: feedName, url: feedUrl });
      setFeedName('');
      setFeedUrl('');
      setEditingFeed(null);
      setShowAddFeedModal(false);
      alert('Feed updated successfully!');
      await feeds.refetch();
    } catch (error) {
      alert(`Error updating feed: ${error.message}`);
    }
  };

  const handleDeleteFeed = async (feedName) => {
    if (window.confirm(`Delete feed "${feedName}"? This cannot be undone.`)) {
      try {
        await feeds.deleteFeed(feedName);
        alert('Feed deleted successfully!');
      } catch (error) {
        alert(`Error deleting feed: ${error.message}`);
      }
    }
  };

  const handleRefreshFeed = async (feedName) => {
    try {
      await feeds.loadFeedItems(feedName);
      alert(`Feed "${feedName}" refreshed!`);
    } catch (error) {
      alert(`Error refreshing feed: ${error.message}`);
    }
  };

  const handleCloseModal = () => {
    setShowAddFeedModal(false);
    setFeedName('');
    setFeedUrl('');
    setEditingFeed(null);
  };

  // =============================================
  // RENDER
  // =============================================

  return (
    <div className="manage-feeds">
      <div className="manage-feeds-header">
        <h1>⚙️ Manage Feeds</h1>
        <button
          className="btn btn-primary"
          onClick={() => setShowAddFeedModal(true)}
        >
          + Add Feed
        </button>
      </div>

      {/* Add/Edit Feed Modal */}
      <Modal
        isOpen={showAddFeedModal}
        title={editingFeed ? `Edit Feed: ${editingFeed}` : 'Add New RSS Feed'}
        onClose={handleCloseModal}
        onConfirm={editingFeed ? handleSaveFeed : handleAddFeed}
        confirmText={editingFeed ? 'Update' : 'Add'}
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

      {/* Stats Panel */}
      <FeedStatsPanel
        feeds={feeds.feeds}
        totalFeeds={feeds.feeds.length}
        loading={feeds.loading}
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

      {/* Feeds List */}
      {!feeds.loading && !feeds.error && (
        <FeedsManagementTable
          feeds={feeds.feeds}
          onEdit={handleEditFeed}
          onDelete={handleDeleteFeed}
          onRefresh={handleRefreshFeed}
          isDeleting={feed => feeds.isActionPending(`delete-${feed}`)}
          isRefreshing={feed => feeds.isActionPending(`load-${feed}`)}
        />
      )}
    </div>
  );
}