/**
 * Card Component
 * File: src/frontend/components/ui/Card.jsx
 * Componente wrapper para cards reutilizável
 */

import React from 'react';

export default function Card({
  children,
  className = '',
  onClick = null,
  hoverable = false,
  selected = false,
  disabled = false,
  style = {}
}) {
  const baseClass = 'card';
  const classes = [
    baseClass,
    hoverable && 'card--hoverable',
    selected && 'card--selected',
    disabled && 'card--disabled',
    className
  ]
    .filter(Boolean)
    .join(' ');

  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
    }
  };

  return (
    <div
      className={classes}
      onClick={handleClick}
      style={style}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick && !disabled ? 0 : undefined}
      onKeyDown={onClick && !disabled ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      } : undefined}
    >
      {children}
    </div>
  );
}