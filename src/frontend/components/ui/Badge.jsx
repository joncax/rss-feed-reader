/**
 * Badge Component
 * File: src/frontend/components/ui/Badge.jsx
 * Componente para status badges e labels
 */

import React from 'react';
import PropTypes from 'prop-types';
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

Badge.propTypes = {
  label: PropTypes.string,
  type: PropTypes.oneOf([
    'default',
    'success',
    'error',
    'warning',
    'info',
    'downloading',
    'completed',
    'copying',
    'moved',
    'cleaned',
    'failed',
    'cancelled',
    'awaiting_action',
    'ok',
    'critical'
  ]),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  className: PropTypes.string,
  style: PropTypes.object
};