/**
 * Badge Component
 * File: src/frontend/components/ui/Badge.jsx
 * Componente para status badges e labels
 */

import React from 'react';
import { getStatusColor, getStatusLabel } from '../../services/formatters';

export default function Badge({
  label = '',
  type = 'default',
  size = 'medium',
  className = '',
  style = {}
}) {
  const typeClass = `badge--${type}`;
  const sizeClass = `badge--${size}`;

  const classes = [
    'badge',
    typeClass,
    sizeClass,
    className
  ]
    .filter(Boolean)
    .join(' ');

  // Determinar cor baseado no tipo
  const backgroundColor = getStatusColor(type);

  const badgeStyle = {
    ...style,
    backgroundColor
  };

  return (
    <span className={classes} style={badgeStyle} title={getStatusLabel(type)}>
      {label || getStatusLabel(type)}
    </span>
  );
}