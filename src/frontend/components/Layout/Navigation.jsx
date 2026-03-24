/**
 * Navigation Component
 * File: src/frontend/components/Layout/Navigation.jsx
 * Tabs de navegação desktop + hidden no mobile
 */

import React from 'react';
import PropTypes from 'prop-types';

export default function Navigation({ activeTab = 'rss', setActiveTab = () => {} }) {
  const tabs = [
    { id: 'rss', label: '📺 Dashboard', icon: '📺' },
    { id: 'downloads', label: '📥 Download Center', icon: '📥' },
    { id: 'status', label: '📊 System Status', icon: '📊' }
  ];

  return (
    <nav className="navigation">
      <div className="nav-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`nav-tab ${activeTab === tab.id ? 'nav-tab--active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            title={tab.label}
          >
            <span className="nav-icon">{tab.icon}</span>
            <span className="nav-label">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

Navigation.propTypes = {
  activeTab: PropTypes.string.isRequired,
  setActiveTab: PropTypes.func.isRequired
};