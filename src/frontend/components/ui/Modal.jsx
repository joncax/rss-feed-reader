/**
 * Modal Component
 * File: src/frontend/components/ui/Modal.jsx
 * Componente modal para dialogs e confirmações
 */

import React, { useEffect } from 'react';

export default function Modal({
  isOpen = false,
  title = '',
  children,
  onClose = null,
  onConfirm = null,
  confirmText = 'OK',
  cancelText = 'Cancel',
  showCancelButton = true,
  showConfirmButton = true,
  isDangerous = false,
  size = 'medium',
  closeOnBackdrop = true,
  className = '',
  style = {}
}) {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen && onClose) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent scrolling
      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = 'auto';
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClass = `modal--${size}`;
  const modalClass = [
    'modal',
    sizeClass,
    className
  ]
    .filter(Boolean)
    .join(' ');

  const confirmButtonClass = [
    'modal-button',
    'modal-button--confirm',
    isDangerous && 'modal-button--danger'
  ]
    .filter(Boolean)
    .join(' ');

  const handleBackdropClick = (e) => {
    if (closeOnBackdrop && e.target === e.currentTarget && onClose) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className={modalClass} style={style}>
        {title && (
          <div className="modal-header">
            <h2 className="modal-title">{title}</h2>
            {onClose && (
              <button
                className="modal-close"
                onClick={onClose}
                aria-label="Close modal"
              >
                ✕
              </button>
            )}
          </div>
        )}

        <div className="modal-content">
          {children}
        </div>

        <div className="modal-footer">
          {showCancelButton && onClose && (
            <button
              className="modal-button modal-button--cancel"
              onClick={onClose}
            >
              {cancelText}
            </button>
          )}
          {showConfirmButton && onConfirm && (
            <button
              className={confirmButtonClass}
              onClick={onConfirm}
            >
              {confirmText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}