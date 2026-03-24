/**
 * ActiveDownloads Component
 * File: src/frontend/components/DownloadCenter/ActiveDownloads.jsx
 * Sub-section: Mostrar downloads em progresso com cards
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import DownloadCard from './DownloadCard';
import Modal from '../ui/Modal';
import { formatBytes } from '../../services/formatters';

export default function ActiveDownloads({ downloads = {}, storage = {} }) {
  const [selectedDownload, setSelectedDownload] = useState(null);
  const [showActionModal, setShowActionModal] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  if (downloads.loading) {
    return <div className="loader">Loading downloads...</div>;
  }

  if (downloads.error) {
    return (
      <div className="error-message">
        <p>Error loading downloads: {downloads.error.message}</p>
        <button className="btn btn-secondary" onClick={() => downloads.refetch()}>
          Retry
        </button>
      </div>
    );
  }

  const activeDownloads = downloads.downloads.filter(d => 
    d.status === 'downloading' || d.status === 'awaiting_action'
  );

  if (activeDownloads.length === 0) {
    return (
      <div className="empty-state">
        <p>📭 No active downloads</p>
        <p style={{ fontSize: '12px', color: '#999' }}>
          Add a new download to get started
        </p>
      </div>
    );
  }

  const handleCopyToStorage = async (downloadId) => {
    try {
      await downloads.copyToStorage(downloadId, selectedCategory);
      setShowActionModal(null);
      setSelectedCategory(null);
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleCleanup = async (downloadId) => {
    if (window.confirm('Are you sure you want to delete the temp files?')) {
      try {
        await downloads.cleanupTemp(downloadId);
      } catch (error) {
        alert(`Error: ${error.message}`);
      }
    }
  };

  const handleDelete = async (downloadId) => {
    if (window.confirm('Are you sure you want to delete this download?')) {
      try {
        await downloads.deleteDownload(downloadId);
      } catch (error) {
        alert(`Error: ${error.message}`);
      }
    }
  };

  return (
    <div className="active-downloads">
      <div className="downloads-grid">
        {activeDownloads.map(download => (
          <DownloadCard
            key={download.id}
            download={download}
            onCopy={() => {
              setSelectedDownload(download);
              setShowActionModal('copy');
            }}
            onCleanup={() => handleCleanup(download.id)}
            onDelete={() => handleDelete(download.id)}
            isLoading={downloads.isActionPending(download.id)}
          />
        ))}
      </div>

      {/* Copy to Storage Modal */}
      <Modal
        isOpen={showActionModal === 'copy' && selectedDownload !== null}
        title="Copy to Storage"
        onClose={() => setShowActionModal(null)}
        onConfirm={() => handleCopyToStorage(selectedDownload.id)}
        confirmText="Copy"
      >
        <div className="form-group">
          <label>Select Category</label>
          <select
            value={selectedCategory || ''}
            onChange={(e) => setSelectedCategory(e.target.value || null)}
            className="form-input"
          >
            <option value="">Auto-detect</option>
            <option value="movies">🎬 Movies</option>
            <option value="tv">📺 TV Series</option>
            <option value="music">🎵 Music</option>
          </select>
        </div>
        <p style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
          Free space: {formatBytes(storage.free || 0)}
        </p>
      </Modal>
    </div>
  );
}

ActiveDownloads.propTypes = {
  downloads: PropTypes.object.isRequired,
  storage: PropTypes.object.isRequired
};