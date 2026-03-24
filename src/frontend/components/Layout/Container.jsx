/**
 * Container Component
 * File: src/frontend/components/Layout/Container.jsx
 * Wrapper para conteúdo principal
 */

import React from 'react';
import PropTypes from 'prop-types';

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

Container.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string
};