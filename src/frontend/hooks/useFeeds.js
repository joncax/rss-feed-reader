/**
 * useFeeds Hook
 * File: src/frontend/hooks/useFeeds.js
 * Hook para fetch e polling de RSS feeds
 */

import { useState, useCallback } from 'react';
import { useApiPolling } from './useApi';
import * as api from '../services/api';

export function useFeeds(options = {}) {
  const {
    pollInterval = 10000, // 10 segundos para feeds
    autoStart = true,
    onError = null,
    onSuccess = null
  } = options;

  const [feedItems, setFeedItems] = useState([]);
  const [selectedFeed, setSelectedFeed] = useState(null);
  const [syncInterval, setSyncInterval] = useState(3600000); // 1 hora
  const [actionLoading, setActionLoading] = useState(null);
  const [actionError, setActionError] = useState(null);

  // =============================================
  // FETCH FEEDS LIST
  // =============================================

  const fetchFeedsList = useCallback(async () => {
    return await api.fetchFeeds();
  }, []);

  const {
    data: feedsResponse,
    loading,
    error,
    isPolling,
    refetch,
    startPolling,
    stopPolling
  } = useApiPolling(fetchFeedsList, [], {
    interval: pollInterval,
    autoStart,
    retries: 3,
    onError,
    onSuccess
  });

  const feeds = feedsResponse?.data || feedsResponse || [];

  // =============================================
  // ACTIONS
  // =============================================

  const addFeed = async (name, url) => {
    try {
      setActionLoading('add');
      setActionError(null);

      const result = await api.addFeed(name, url);
      await refetch(); // Refresh list

      return result;
    } catch (err) {
      setActionError(err.message);
      console.error('addFeed error:', err);
      throw err;
    } finally {
      setActionLoading(null);
    }
  };

  const deleteFeed = async (name) => {
    try {
      setActionLoading(`delete-${name}`);
      setActionError(null);

      const result = await api.deleteFeed(name);
      await refetch(); // Refresh list

      return result;
    } catch (err) {
      setActionError(err.message);
      console.error('deleteFeed error:', err);
      throw err;
    } finally {
      setActionLoading(null);
    }
  };

  const loadFeedItems = async (feedName) => {
    try {
      setActionLoading(`load-${feedName}`);
      setActionError(null);

      // TODO: Implementar endpoint para buscar items de um feed específico
      // Por enquanto, retorna array vazio
      setFeedItems([]);
      setSelectedFeed(feedName);

      return [];
    } catch (err) {
      setActionError(err.message);
      console.error('loadFeedItems error:', err);
      throw err;
    } finally {
      setActionLoading(null);
    }
  };

  // =============================================
  // HELPERS
  // =============================================

  const getFeedByName = (name) => {
    return feeds.find(f => f === name || (typeof f === 'object' && f.name === name));
  };

  const isActionPending = (id) => {
    return actionLoading && actionLoading.includes(id);
  };

  // =============================================
  // RETURN
  // =============================================

  return {
    // Data
    feeds,
    feedItems,
    selectedFeed,
    setSelectedFeed,
    syncInterval,
    setSyncInterval,

    // State
    loading,
    error,
    isPolling,
    actionLoading,
    actionError,

    // Polling control
    refetch,
    startPolling,
    stopPolling,

    // Actions
    addFeed,
    deleteFeed,
    loadFeedItems,

    // Helpers
    getFeedByName,
    isActionPending
  };
}