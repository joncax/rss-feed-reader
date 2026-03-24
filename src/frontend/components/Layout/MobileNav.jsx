/**
 * MobileNav Component
 * File: src/frontend/components/Layout/MobileNav.jsx
 * Navegação mobile (fixed bottom) - hidden em desktop
 */

import React from 'react';
import PropTypes from 'prop-types';

export default function MobileNav({ activeTab = 'rss', setActiveTab = () => {} }) {
  const tabs = [
    { id: 'rss', label: 'Dashboard', icon: '📺' },
    { id: 'downloads', label: 'Downloads', icon: '📥' },
    { id: 'status', label: 'Status', icon: '📊' }
  ];

  return (
    <nav className="mobile-nav">
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`mobile-nav-item ${activeTab === tab.id ? 'mobile-nav-item--active' : ''}`}
          onClick={() => setActiveTab(tab.id)}
          title={tab.label}
        >
          <span className="mobile-nav-icon">{tab.icon}</span>
          <span className="mobile-nav-label">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}

MobileNav.propTypes = {
  activeTab: PropTypes.string.isRequired,
  setActiveTab: PropTypes.func.isRequired
};