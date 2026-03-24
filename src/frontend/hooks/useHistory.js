/**
 * useHistory Hook
 * File: src/frontend/hooks/useHistory.js
 * Hook para fetch e gerenciamento do histórico de downloads
 */

import { useState, useCallback, useMemo } from 'react';
import { useApi } from './useApi';
import * as api from '../services/api';

export function useHistory(options = {}) {
  const {
    autoFetch = true,
    cacheMs = 30000, // 30 segundos de cache
    onError = null,
    onSuccess = null
  } = options;

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Filters state
  const [filters, setFilters] = useState({
    result: null, // 'success', 'failed', null
    category: null, // 'movies', 'tv', 'music', null
    dateRange: null // { start, end } ou null
  });

  // Summary state
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  // =============================================
  // FETCH HISTORY
  // =============================================

  const fetchHistoryData = useCallback(async () => {
    const pagination = {
      limit: pageSize,
      offset: (currentPage - 1) * pageSize
    };

    return await api.fetchDownloadHistory(filters, pagination);
  }, [filters, currentPage, pageSize]);

  const {
    data: response,
    loading,
    error,
    refetch,
    execute
  } = useApi(fetchHistoryData, [filters, currentPage, pageSize], {
    autoFetch,
    cacheMs,
    retries: 3,
    onError,
    onSuccess
  });

  const historyItems = response?.data || [];
  const totalCount = response?.total || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  // =============================================
  // FETCH SUMMARY
  // =============================================

  const fetchSummary = useCallback(async () => {
    try {
      setSummaryLoading(true);
      const result = await api.fetchDownloadHistorySummary();
      setSummary(result?.data || null);
      return result;
    } catch (err) {
      console.error('fetchSummary error:', err);
      throw err;
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  // =============================================
  // FILTERS
  // =============================================

  const setResultFilter = (result) => {
    setFilters(prev => ({ ...prev, result }));
    setCurrentPage(1); // Reset pagination
  };

  const setCategoryFilter = (category) => {
    setFilters(prev => ({ ...prev, category }));
    setCurrentPage(1);
  };

  const setDateRangeFilter = (start, end) => {
    setFilters(prev => ({
      ...prev,
      dateRange: start && end ? { start, end } : null
    }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      result: null,
      category: null,
      dateRange: null
    });
    setCurrentPage(1);
  };

  const hasActiveFilters = useMemo(() => {
    return filters.result !== null || 
           filters.category !== null || 
           filters.dateRange !== null;
  }, [filters]);

  // =============================================
  // PAGINATION
  // =============================================

  const goToPage = (page) => {
    const pageNum = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(pageNum);
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  const canGoNext = currentPage < totalPages;
  const canGoPrev = currentPage > 1;

  // =============================================
  // EXPORT
  // =============================================

  const exportAsJSON = async () => {
    try {
      const data = await api.exportDownloadHistory('json');
      return data;
    } catch (err) {
      console.error('exportAsJSON error:', err);
      throw err;
    }
  };

  const exportAsCSV = async () => {
    try {
      const csv = await api.exportDownloadHistory('csv');
      // Trigger download
      downloadCSV(csv, 'download-history.csv');
      return csv;
    } catch (err) {
      console.error('exportAsCSV error:', err);
      throw err;
    }
  };

  const downloadCSV = (csvContent, filename) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // =============================================
  // HELPERS
  // =============================================

  const getItemById = (id) => {
    return historyItems.find(item => item.id === id);
  };

  const getItemsByResult = (result) => {
    return historyItems.filter(item => item.result === result);
  };

  const getItemsByCategory = (category) => {
    return historyItems.filter(item => item.category === category);
  };

  const getSuccessCount = () => {
    return historyItems.filter(item => item.result === 'success').length;
  };

  const getFailedCount = () => {
    return historyItems.filter(item => item.result === 'failed').length;
  };

  const getSuccessRate = () => {
    if (historyItems.length === 0) return 0;
    const successCount = getSuccessCount();
    return Math.round((successCount / historyItems.length) * 100);
  };

  const getTotalSize = () => {
    return historyItems.reduce((sum, item) => sum + (item.size || 0), 0);
  };

  const getCategoryStats = () => {
    const stats = {};
    historyItems.forEach(item => {
      if (!stats[item.category]) {
        stats[item.category] = { count: 0, size: 0 };
      }
      stats[item.category].count += 1;
      stats[item.category].size += item.size || 0;
    });
    return stats;
  };

  // =============================================
  // RETURN
  // =============================================

  return {
    // Data
    historyItems,
    totalCount,
    totalPages,
    summary,

    // State
    loading,
    error,
    summaryLoading,
    currentPage,
    pageSize,

    // Pagination
    goToPage,
    nextPage,
    prevPage,
    canGoNext,
    canGoPrev,
    setPageSize,

    // Filters
    filters,
    setResultFilter,
    setCategoryFilter,
    setDateRangeFilter,
    clearFilters,
    hasActiveFilters,

    // Fetch
    refetch,
    fetchSummary,

    // Export
    exportAsJSON,
    exportAsCSV,

    // Helpers
    getItemById,
    getItemsByResult,
    getItemsByCategory,
    getSuccessCount,
    getFailedCount,
    getSuccessRate,
    getTotalSize,
    getCategoryStats
  };
}