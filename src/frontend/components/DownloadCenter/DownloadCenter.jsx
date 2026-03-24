/**
 * DownloadCenter Component
 * File: src/frontend/components/DownloadCenter/DownloadCenter.jsx
 * Container principal: Active Downloads + Storage Dashboard + History
 */

import React, { useState } from 'react';
import { useDownloads } from '../../hooks/useDownloads';
import { useStorage } from '../../hooks/useStorage';
import { useHistory } from '../../hooks/useHistory';
import ActiveDownloads from './ActiveDownloads';
import StorageDashboard from './StorageDashboard';
import HistoryTable from './HistoryTable';
import Modal from '../ui/Modal';

export default function DownloadCenter() {
  const [showAddDownloadModal, setShowAddDownloadModal] = useState(false);
  const [magnetInput, setMagnetInput] = useState('');
  const [titleInput, setTitleInput] = useState('');

  // Hooks com polling
  const downloads = useDownloads({}, { pollInterval: 2000 });
  const storage = useStorage({ pollInterval: 5000 });
  const history = useHistory({ autoFetch: true });

  // =============================================
  // ADD DOWNLOAD
  // =============================================

  const handleAddDownload = async () => {
    if (!magnetInput.trim() || !titleInput.trim()) {
      alert('Please fill in both magnet and title');
      return;
    }

    try {
      await downloads.addDownload(magnetInput, titleInput);
      setMagnetInput('');
      setTitleInput('');
      setShowAddDownloadModal(false);
    } catch (error) {
      console.error('Error adding download:', error);
      alert(`Error: ${error.message}`);
    }
  };

  // =============================================
  // RENDER
  // =============================================

  return (
    <div className="download-center">
      {/* Header com ações */}
      <div className="download-center-header">
        <h1>📥 Download Center</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowAddDownloadModal(true)}
        >
          + Add Download
        </button>
      </div>

      {/* Add Download Modal */}
      <Modal
        isOpen={showAddDownloadModal}
        title="Add New Download"
        onClose={() => setShowAddDownloadModal(false)}
        onConfirm={handleAddDownload}
        confirmText="Start Download"
        size="medium"
      >
        <div className="form-group">
          <label htmlFor="title-input">Download Title</label>
          <input
            id="title-input"
            type="text"
            className="form-input"
            placeholder="e.g., The Matrix 1080p"
            value={titleInput}
            onChange={(e) => setTitleInput(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="magnet-input">Magnet Link</label>
          <textarea
            id="magnet-input"
            className="form-input"
            placeholder="magnet:?xt=urn:btih:..."
            value={magnetInput}
            onChange={(e) => setMagnetInput(e.target.value)}
            rows={4}
          />
        </div>
      </Modal>

      {/* Three Sub-Sections */}
      <div className="download-center-grid">
        {/* 1. Active Downloads */}
        <section className="download-section">
          <h2>📥 Active Downloads</h2>
          <ActiveDownloads 
            downloads={downloads}
            storage={storage}
          />
        </section>

        {/* 2. Storage Dashboard */}
        <section className="download-section">
          <h2>💾 Storage Dashboard</h2>
          <StorageDashboard storage={storage} />
        </section>

        {/* 3. History Table */}
        <section className="download-section">
          <h2>📊 Download History</h2>
          <HistoryTable history={history} />
        </section>
      </div>
    </div>
  );
}