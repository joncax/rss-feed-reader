/**
 * useStorage Hook
 * File: src/frontend/hooks/useStorage.js
 * Hook para fetch e polling de storage/quota stats
 */

import { useState, useCallback } from 'react';
import { useApiPolling } from './useApi';
import * as api from '../services/api';

export function useStorage(options = {}) {
  const {
    pollInterval = 5000, // 5 segundos para storage (muda menos frequentemente)
    autoStart = true,
    onError = null,
    onSuccess = null
  } = options;

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);

  // Fetch storage stats com polling
  const fetchStorageStats = useCallback(async () => {
    return await api.fetchStorageStats();
  }, []);

  const {
    data: response,
    loading,
    error,
    isPolling,
    refetch,
    startPolling,
    stopPolling
  } = useApiPolling(fetchStorageStats, [], {
    interval: pollInterval,
    autoStart,
    retries: 3,
    onError,
    onSuccess
  });

  const storageData = response?.data || null;

  // =============================================
  // EXTRACT DATA
  // =============================================

  const total = storageData?.total || 0;
  const used = storageData?.used || 0;
  const free = storageData?.free || 0;
  const percentUsed = storageData?.percentUsed || 0;
  const status = storageData?.status || 'unknown'; // ok, warning, critical
  const breakdown = storageData?.breakdown || {};

  // =============================================
  // DERIVED METRICS
  // =============================================

  const getStatusColor = () => {
    if (status === 'ok') return '#44ff44'; // green
    if (status === 'warning') return '#ffa500'; // orange
    if (status === 'critical') return '#ff4d4d'; // red
    return '#999999'; // gray
  };

  const getStatusLabel = () => {
    if (status === 'ok') return 'OK';
    if (status === 'warning') return 'WARNING';
    if (status === 'critical') return 'CRITICAL';
    return 'UNKNOWN';
  };

  const percentFree = 100 - percentUsed;

  // =============================================
  // CATEGORIES INFO
  // =============================================

  const getCategories = () => {
    return Object.entries(breakdown).map(([key, value]) => ({
      name: key,
      size: value.size || 0,
      percent: value.percent || '0',
      path: value.path || '',
      displayName: getCategoryDisplayName(key)
    }));
  };

  const getCategoryDisplayName = (key) => {
    const names = {
      'movies': '🎬 Movies',
      'tv': '📺 TV Series',
      'music': '🎵 Music',
      'downloads': '📥 Downloads',
      'other': '📦 Other'
    };
    return names[key] || key;
  };

  const getCategoryByName = (name) => {
    return getCategories().find(c => c.name === name);
  };

  // =============================================
  // ACTIONS
  // =============================================

  const canAddDownload = async (sizeBytes) => {
    try {
      setActionLoading(true);
      setActionError(null);

      const result = await api.canAddDownload(sizeBytes);
      return result?.can_add || false;
    } catch (err) {
      setActionError(err.message);
      console.error('canAddDownload error:', err);
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const checkQuota = async () => {
    try {
      setActionLoading(true);
      setActionError(null);

      const result = await api.fetchQuotaStats();
      return result;
    } catch (err) {
      setActionError(err.message);
      console.error('checkQuota error:', err);
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const fetchBreakdown = async () => {
    try {
      setActionLoading(true);
      setActionError(null);

      const result = await api.fetchStorageBreakdown();
      return result;
    } catch (err) {
      setActionError(err.message);
      console.error('fetchBreakdown error:', err);
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  // =============================================
  // HELPERS
  // =============================================

  const getProgressBarColor = () => {
    if (percentUsed < 80) return '#44ff44'; // green
    if (percentUsed < 95) return '#ffa500'; // orange
    return '#ff4d4d'; // red
  };

  const isStorageCritical = () => status === 'critical';
  const isStorageWarning = () => status === 'warning' || status === 'critical';
  const isStorageOk = () => status === 'ok';

  const getUsedPercentage = () => Math.round(percentUsed);
  const getFreePercentage = () => Math.round(percentFree);

  // =============================================
  // RETURN
  // =============================================

  return {
    // Data
    total,
    used,
    free,
    percentUsed,
    percentFree,
    status,
    breakdown,
    selectedCategory,
    setSelectedCategory,

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

    // Status
    getStatusColor,
    getStatusLabel,
    isStorageCritical,
    isStorageWarning,
    isStorageOk,

    // Categories
    getCategories,
    getCategoryDisplayName,
    getCategoryByName,

    // Progress
    getProgressBarColor,
    getUsedPercentage,
    getFreePercentage,

    // Actions
    canAddDownload,
    checkQuota,
    fetchBreakdown
  };
}