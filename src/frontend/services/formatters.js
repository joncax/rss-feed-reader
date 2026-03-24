/**
 * Formatters Service
 * File: src/frontend/services/formatters.js
 * Funções para formatar dados (bytes, datas, velocidades, etc)
 */

// =============================================
// BYTES FORMATTING
// =============================================

export function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  if (bytes === null || bytes === undefined) return '—';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function formatBytesShort(bytes) {
  // Versão curta: "1.2G" em vez de "1.2 GB"
  if (bytes === 0) return '0';
  if (bytes === null || bytes === undefined) return '—';

  const k = 1024;
  const sizes = ['', 'K', 'M', 'G', 'T'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + sizes[i];
}

// =============================================
// SPEED FORMATTING
// =============================================

export function formatSpeed(bytesPerSecond) {
  if (!bytesPerSecond || bytesPerSecond === 0) return '0 B/s';
  return formatBytes(bytesPerSecond, 1) + '/s';
}

export function formatSpeedShort(bytesPerSecond) {
  // Versão curta: "2.5M/s"
  if (!bytesPerSecond || bytesPerSecond === 0) return '0';
  return formatBytesShort(bytesPerSecond) + '/s';
}

// =============================================
// TIME FORMATTING
// =============================================

export function formatETA(seconds) {
  if (!seconds || seconds <= 0) return 'calculating...';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}

export function formatDuration(seconds) {
  if (!seconds || seconds <= 0) return '0s';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}

// =============================================
// DATE FORMATTING
// =============================================

export function formatDate(dateString) {
  if (!dateString) return '—';

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    });
  } catch (error) {
    console.error('formatDate error:', error);
    return '—';
  }
}

export function formatDateTime(dateString) {
  if (!dateString) return '—';

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  } catch (error) {
    console.error('formatDateTime error:', error);
    return '—';
  }
}

export function formatTime(dateString) {
  if (!dateString) return '—';

  try {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  } catch (error) {
    console.error('formatTime error:', error);
    return '—';
  }
}

export function formatRelativeTime(dateString) {
  // "2 days ago", "1 hour ago", etc
  if (!dateString) return '—';

  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return 'now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 30) return `${diffDays}d ago`;

    return formatDate(dateString);
  } catch (error) {
    console.error('formatRelativeTime error:', error);
    return '—';
  }
}

// =============================================
// PERCENTAGE FORMATTING
// =============================================

export function formatPercent(value, decimals = 1) {
  if (value === null || value === undefined) return '—';
  return parseFloat(value).toFixed(decimals) + '%';
}

// =============================================
// STATUS BADGES
// =============================================

export function getStatusColor(status) {
  const colors = {
    'downloading': '#00b4d8',  // blue
    'completed': '#44ff44',    // green
    'awaiting_action': '#ffa500', // orange
    'copying': '#00d4ff',      // cyan
    'moved': '#44ff44',        // green
    'cleaned': '#44ff44',      // green
    'error': '#ff4d4d',        // red
    'success': '#44ff44',      // green
    'failed': '#ff4d4d',       // red
    'cancelled': '#999999',    // gray
    'ok': '#44ff44',           // green
    'warning': '#ffa500',      // orange
    'critical': '#ff4d4d'      // red
  };

  return colors[status] || '#999999';
}

export function getStatusLabel(status) {
  const labels = {
    'downloading': 'Downloading',
    'completed': 'Completed',
    'awaiting_action': 'Awaiting Action',
    'copying': 'Copying',
    'moved': 'Moved',
    'cleaned': 'Cleaned',
    'error': 'Error',
    'success': 'Success',
    'failed': 'Failed',
    'cancelled': 'Cancelled',
    'ok': 'OK',
    'warning': 'Warning',
    'critical': 'Critical'
  };

  return labels[status] || status;
}

// =============================================
// TITLE FORMATTING (From vanilla app.js)
// =============================================

export function sanitizeTitle(title) {
  if (!title) return '—';

  return title
    .replace(/\./g, ' ')
    .replace(/\[.*?\]/g, '')
    .replace(/\b(2160p|1080p|720p|480p|HEVC|x264|x265|WEB-DL|BluRay|HDR|RM4k|mSD|6CH|10bit)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function getMediaIcon(title) {
  if (!title) return '📦';
  const isTV = /S\d{1,2}E\d{1,2}/i.test(title) || /Season/i.test(title);
  return isTV ? '📺' : '🎬';
}

export function getQualityInfo(title) {
  if (!title) return { tag: 'unknown', className: 'q-sd' };

  const qualityMatch = title.match(/\b(480p|720p|1080p|2160p|4k)\b/i);
  const q = qualityMatch ? qualityMatch[0].toLowerCase() : 'sd';

  let colorClass = 'q-sd';
  if (q === '720p') colorClass = 'q-hd';
  if (q === '1080p') colorClass = 'q-fhd';
  if (q === '2160p' || q === '4k') colorClass = 'q-uhd';

  return { tag: q.toUpperCase(), className: colorClass };
}

// =============================================
// CSV EXPORT HELPER
// =============================================

export function downloadCSV(csvContent, filename = 'download-history.csv') {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// =============================================
// PLURALIZATION
// =============================================

export function pluralize(count, singular, plural) {
  return count === 1 ? singular : plural;
}

export function formatCount(count) {
  if (count === 0) return 'No items';
  return `${count} ${pluralize(count, 'item', 'items')}`;
}