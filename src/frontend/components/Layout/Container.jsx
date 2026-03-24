/**
 * Container Component
 * File: src/frontend/components/Layout/Container.jsx
 * Wrapper para conteúdo principal
 */

import React from 'react';

export default function Container({ children, className = '' }) {
  const classes = [
    'container',
    className
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes}>
      {children}
    </div>
  );
}