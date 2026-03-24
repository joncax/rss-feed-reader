/**
 * useDownloads Hook
 * File: src/frontend/hooks/useDownloads.js
 * Hook para fetch e polling de downloads
 */

import { useState, useCallback } from 'react';
import { useApiPolling } from './useApi';
import * as api from '../services/api';

export function useDownloads(filters = {}, options = {}) {
  const {
    pollInterval = 2000, // 2 segundos para downloads (real-time)
    autoStart = true,
    onError = null,
    onSuccess = null
  } = options;

  const [selectedDownload, setSelectedDownload] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [actionError, setActionError] = useState(null);

  // Fetch downloads com polling
  const fetchDownloads = useCallback(async () => {
    return await api.fetchDownloads(filters);
  }, [filters]);

  const {
    data: response,
    loading,
    error,
    isPolling,
    refetch,
    startPolling,
    stopPolling
  } = useApiPolling(fetchDownloads, [filters], {
    interval: pollInterval,
    autoStart,
    retries: 3,
    onError,
    onSuccess
  });

  const downloads = response?.data || [];

  // =============================================
  // ACTIONS
  // =============================================

  const addDownload = async (magnet, title) => {
    try {
      setActionLoading('add');
      setActionError(null);

      const result = await api.addDownload(magnet, title);
      await refetch(); // Refresh list

      return result;
    } catch (err) {
      setActionError(err.message);
      console.error('addDownload error:', err);
      throw err;
    } finally {
      setActionLoading(null);
    }
  };

  const copyToStorage = async (id, category = null) => {
    try {
      setActionLoading(`copy-${id}`);
      setActionError(null);

      const result = await api.copyDownloadToStorage(id, category);
      await refetch(); // Refresh list

      return result;
    } catch (err) {
      setActionError(err.message);
      console.error('copyToStorage error:', err);
      throw err;
    } finally {
      setActionLoading(null);
    }
  };

  const cleanupTemp = async (id) => {
    try {
      setActionLoading(`cleanup-${id}`);
      setActionError(null);

      const result = await api.cleanupDownloadTemp(id);
      await refetch(); // Refresh list

      return result;
    } catch (err) {
      setActionError(err.message);
      console.error('cleanupTemp error:', err);
      throw err;
    } finally {
      setActionLoading(null);
    }
  };

  const chooseCategory = async (id, category) => {
    try {
      setActionLoading(`category-${id}`);
      setActionError(null);

      const result = await api.chooseDownloadCategory(id, category);
      await refetch(); // Refresh list

      return result;
    } catch (err) {
      setActionError(err.message);
      console.error('chooseCategory error:', err);
      throw err;
    } finally {
      setActionLoading(null);
    }
  };

  const deleteDownload = async (id) => {
    try {
      setActionLoading(`delete-${id}`);
      setActionError(null);

      const result = await api.deleteDownload(id);
      await refetch(); // Refresh list

      return result;
    } catch (err) {
      setActionError(err.message);
      console.error('deleteDownload error:', err);
      throw err;
    } finally {
      setActionLoading(null);
    }
  };

  // =============================================
  // HELPERS
  // =============================================

  const getDownloadById = (id) => {
    return downloads.find(d => d.id === id);
  };

  const getDownloadsByStatus = (status) => {
    return downloads.filter(d => d.status === status);
  };

  const getDownloadsByType = (type) => {
    return downloads.filter(d => d.type === type);
  };

  const isActionPending = (id) => {
    return actionLoading && actionLoading.includes(id);
  };

  // =============================================
  // RETURN
  // =============================================

  return {
    // Data
    downloads,
    selectedDownload,
    setSelectedDownload,

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
    addDownload,
    copyToStorage,
    cleanupTemp,
    chooseCategory,
    deleteDownload,

    // Helpers
    getDownloadById,
    getDownloadsByStatus,
    getDownloadsByType,
    isActionPending
  };
}