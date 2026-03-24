/**
 * API Service
 * File: src/frontend/services/api.js
 * Todas as chamadas HTTP para o backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://192.168.1.86:3002';

// =============================================
// DOWNLOADS API
// =============================================

export async function fetchDownloads(filters = {}) {
  try {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.type) params.append('type', filters.type);

    const response = await fetch(`${API_BASE_URL}/api/downloads?${params}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('fetchDownloads error:', error);
    throw error;
  }
}

export async function fetchDownload(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/downloads/${id}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('fetchDownload error:', error);
    throw error;
  }
}

export async function addDownload(magnet, title) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/downloads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ magnet, title })
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('addDownload error:', error);
    throw error;
  }
}

export async function copyDownloadToStorage(id, category = null) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/downloads/${id}/copy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category })
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('copyDownloadToStorage error:', error);
    throw error;
  }
}

export async function cleanupDownloadTemp(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/downloads/${id}/cleanup-temp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('cleanupDownloadTemp error:', error);
    throw error;
  }
}

export async function chooseDownloadCategory(id, category) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/downloads/${id}/choose-category`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category })
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('chooseDownloadCategory error:', error);
    throw error;
  }
}

export async function deleteDownload(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/downloads/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('deleteDownload error:', error);
    throw error;
  }
}

// =============================================
// STORAGE API
// =============================================

export async function fetchStorageStats() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/storage/stats`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('fetchStorageStats error:', error);
    throw error;
  }
}

export async function fetchStorageBreakdown() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/storage/breakdown`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('fetchStorageBreakdown error:', error);
    throw error;
  }
}

// =============================================
// HISTORY API
// =============================================

export async function fetchDownloadHistory(filters = {}, pagination = {}) {
  try {
    const params = new URLSearchParams();
    if (filters.result) params.append('result', filters.result);
    if (filters.category) params.append('category', filters.category);
    if (pagination.limit) params.append('limit', pagination.limit);
    if (pagination.offset) params.append('offset', pagination.offset);

    const response = await fetch(`${API_BASE_URL}/api/download-history?${params}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('fetchDownloadHistory error:', error);
    throw error;
  }
}

export async function fetchDownloadHistoryItem(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/download-history/${id}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('fetchDownloadHistoryItem error:', error);
    throw error;
  }
}

export async function fetchDownloadHistorySummary() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/download-history/stats/summary`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('fetchDownloadHistorySummary error:', error);
    throw error;
  }
}

export async function exportDownloadHistory(format = 'json') {
  try {
    const response = await fetch(`${API_BASE_URL}/api/download-history/export`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ format })
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    if (format === 'csv') {
      return await response.text();
    }
    return await response.json();
  } catch (error) {
    console.error('exportDownloadHistory error:', error);
    throw error;
  }
}

// =============================================
// QUOTA API
// =============================================

export async function fetchQuotaStats() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/quota/stats`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('fetchQuotaStats error:', error);
    throw error;
  }
}

export async function canAddDownload(sizeBytes) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/quota/can-add/${sizeBytes}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('canAddDownload error:', error);
    throw error;
  }
}

// =============================================
// RSS FEEDS API (Existente)
// =============================================

export async function fetchFeeds() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/feeds`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('fetchFeeds error:', error);
    throw error;
  }
}

export async function addFeed(name, url) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/feeds`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, url })
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('addFeed error:', error);
    throw error;
  }
}

export async function deleteFeed(name) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/feeds/${name}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('deleteFeed error:', error);
    throw error;
  }
}

// =============================================
// HEALTH CHECK
// =============================================

export async function checkHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('checkHealth error:', error);
    throw error;
  }
}