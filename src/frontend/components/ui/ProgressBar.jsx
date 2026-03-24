/**
 * ProgressBar Component
 * File: src/frontend/components/ui/ProgressBar.jsx
 * Componente progress bar com label e cores dinâmicas
 */

import React from 'react';

export default function ProgressBar({
  progress = 0,
  color = '#e50914',
  backgroundColor = '#333333',
  height = 8,
  showLabel = true,
  labelPosition = 'right',
  animated = true,
  striped = false,
  className = '',
  style = {}
}) {
  // Clamp progress entre 0 e 100
  const clampedProgress = Math.max(0, Math.min(100, progress));

  const containerClass = [
    'progress-bar-container',
    className
  ]
    .filter(Boolean)
    .join(' ');

  const barClass = [
    'progress-bar',
    animated && 'progress-bar--animated',
    striped && 'progress-bar--striped'
  ]
    .filter(Boolean)
    .join(' ');

  const containerStyle = {
    ...style,
    height: `${height}px`,
    backgroundColor
  };

  const barStyle = {
    width: `${clampedProgress}%`,
    backgroundColor: color
  };

  return (
    <div className={containerClass} style={containerStyle}>
      <div className={barClass} style={barStyle} role="progressbar" aria-valuenow={clampedProgress} aria-valuemin="0" aria-valuemax="100" />
      {showLabel && (
        <span 
          className={`progress-label progress-label--${labelPosition}`}
          style={{ color: '#ffffff', fontSize: '12px', fontWeight: 'bold' }}
        >
          {Math.round(clampedProgress)}%
        </span>
      )}
    </div>
  );
}