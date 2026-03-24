/**
 * Header Component
 * File: src/frontend/components/Layout/Header.jsx
 * Cabeçalho da aplicação com logo e sync monitor
 */

import React, { useState, useEffect } from 'react';

export default function Header() {
  const [lastUpdate, setLastUpdate] = useState(null);
  const [nextSync, setNextSync] = useState(null);

  useEffect(() => {
    // Atualizar timer a cada segundo
    const interval = setInterval(() => {
      updateTimerDisplay();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const updateTimerDisplay = () => {
    // Esta função será conectada ao backend depois
    // Por enquanto, mostra placeholder
    setLastUpdate('--:--');
    setNextSync('--:--');
  };

  return (
    <header className="header">
      <div className="header-content">
        <a href="#" className="logo">
          📺 RSS TV PROXY
        </a>

        <div className="sync-monitor">
          <span id="last-update-label" className="sync-label">
            Last Sync: {lastUpdate || '--:--'}
          </span>
          <span className="divider">|</span>
          <span id="next-sync-label" className="sync-label timer-text">
            Next Sync: {nextSync || '--:--'}
          </span>
        </div>
      </div>
    </header>
  );
}