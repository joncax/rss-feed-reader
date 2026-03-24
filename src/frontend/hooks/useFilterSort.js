/**
 * useFilterSort Hook
 * File: src/frontend/hooks/useFilterSort.js
 * Hook para gerenciar filtros, sorting e search em RSS feeds
 */

import { useState, useMemo, useCallback } from 'react';

export function useFilterSort(items = []) {
  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Filter state
  const [filters, setFilters] = useState({
    quality: 'all', // 'all', 'sd', '480p', '720p', '1080p', '4k'
    type: 'all' // 'all', 'tv', 'movie'
  });

  // Sort state
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest'

  // View state
  const [viewMode, setViewMode] = useState('grid'); // 'grid', 'list'

  // =============================================
  // FILTER LOGIC
  // =============================================

  const getQualityKey = (title) => {
    if (!title) return 'sd';
    const m = title.match(/\b(480p|720p|1080p|2160p|4k)\b/i);
    if (!m) return 'sd';
    const q = m[0].toLowerCase();
    if (q === '4k' || q === '2160p') return '4k';
    return q;
  };

  const getMediaType = (title) => {
    if (!title) return 'movie';
    const isTV = /S\d{1,2}E\d{1,2}/i.test(title) || /Season/i.test(title);
    return isTV ? 'tv' : 'movie';
  };

  // =============================================
  // FILTERED & SORTED ITEMS
  // =============================================

  const filteredItems = useMemo(() => {
    let result = [...items];

    // Text search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item => {
        const title = item.title?.toLowerCase() || '';
        return title.includes(query);
      });
    }

    // Quality filter
    if (filters.quality !== 'all') {
      result = result.filter(item => {
        const quality = getQualityKey(item.title);
        return quality === filters.quality;
      });
    }

    // Type filter
    if (filters.type !== 'all') {
      result = result.filter(item => {
        const type = getMediaType(item.title);
        return type === filters.type;
      });
    }

    // Sort
    result.sort((a, b) => {
      const dateA = a.pubDate ? new Date(a.pubDate) : new Date(a.timestamp || 0);
      const dateB = b.pubDate ? new Date(b.pubDate) : new Date(b.timestamp || 0);

      return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [items, searchQuery, filters, sortBy]);

  // =============================================
  // SETTERS
  // =============================================

  const setQualityFilter = useCallback((quality) => {
    setFilters(prev => ({ ...prev, quality }));
  }, []);

  const setTypeFilter = useCallback((type) => {
    setFilters(prev => ({ ...prev, type }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      quality: 'all',
      type: 'all'
    });
    setSearchQuery('');
  }, []);

  const setSort = useCallback((sort) => {
    setSortBy(sort);
  }, []);

  const toggleViewMode = useCallback(() => {
    setViewMode(prev => prev === 'grid' ? 'list' : 'grid');
  }, []);

  // =============================================
  // STATUS
  // =============================================

  const hasActiveFilters = useMemo(() => {
    return filters.quality !== 'all' || 
           filters.type !== 'all' || 
           searchQuery.trim() !== '';
  }, [filters, searchQuery]);

  const resultCount = filteredItems.length;
  const totalCount = items.length;

  // =============================================
  // STATISTICS
  // =============================================

  const getQualityStats = useCallback(() => {
    const stats = {
      all: 0,
      sd: 0,
      '480p': 0,
      '720p': 0,
      '1080p': 0,
      '4k': 0
    };

    items.forEach(item => {
      const quality = getQualityKey(item.title);
      stats.all++;
      if (stats.hasOwnProperty(quality)) {
        stats[quality]++;
      }
    });

    return stats;
  }, [items]);

  const getTypeStats = useCallback(() => {
    const stats = {
      all: 0,
      tv: 0,
      movie: 0
    };

    items.forEach(item => {
      const type = getMediaType(item.title);
      stats.all++;
      if (stats.hasOwnProperty(type)) {
        stats[type]++;
      }
    });

    return stats;
  }, [items]);

  const qualityStats = useMemo(() => getQualityStats(), [getQualityStats]);
  const typeStats = useMemo(() => getTypeStats(), [getTypeStats]);

  // =============================================
  // GROUPED & PAGINATED
  // =============================================

  const groupByQuality = useCallback(() => {
    const grouped = {};
    filteredItems.forEach(item => {
      const quality = getQualityKey(item.title);
      if (!grouped[quality]) {
        grouped[quality] = [];
      }
      grouped[quality].push(item);
    });
    return grouped;
  }, [filteredItems]);

  const groupByType = useCallback(() => {
    const grouped = {};
    filteredItems.forEach(item => {
      const type = getMediaType(item.title);
      if (!grouped[type]) {
        grouped[type] = [];
      }
      grouped[type].push(item);
    });
    return grouped;
  }, [filteredItems]);

  const groupByDate = useCallback(() => {
    const grouped = {};
    filteredItems.forEach(item => {
      const date = item.pubDate 
        ? new Date(item.pubDate).toLocaleDateString()
        : 'Unknown';
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(item);
    });
    return grouped;
  }, [filteredItems]);

  // =============================================
  // PAGINATION
  // =============================================

  const paginate = useCallback((pageSize = 20) => {
    const pages = [];
    for (let i = 0; i < filteredItems.length; i += pageSize) {
      pages.push(filteredItems.slice(i, i + pageSize));
    }
    return pages;
  }, [filteredItems]);

  // =============================================
  // RETURN
  // =============================================

  return {
    // Data
    filteredItems,
    totalCount,
    resultCount,

    // Search
    searchQuery,
    setSearchQuery,

    // Filters
    filters,
    setQualityFilter,
    setTypeFilter,
    clearFilters,
    hasActiveFilters,

    // Sort
    sortBy,
    setSort,

    // View
    viewMode,
    toggleViewMode,

    // Stats
    qualityStats,
    typeStats,

    // Grouping
    groupByQuality,
    groupByType,
    groupByDate,

    // Pagination
    paginate
  };
}