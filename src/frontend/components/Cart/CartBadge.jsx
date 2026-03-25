/**
 * CartBadge Component
 * File: src/frontend/components/Cart/CartBadge.jsx
 * Display shopping cart icon with item count
 */

export default function CartBadge({ itemCount = 0, totalSize = 0, onClick }) {
  const formatSize = (bytes) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
    return (bytes / 1073741824).toFixed(2) + ' GB';
  };

  return (
  <button
    onClick={onClick}
    className="cart-badge"
    title={`${itemCount} items in cart`}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 12px',
      background: 'transparent',
      border: '1px solid var(--border)',
      borderRadius: '6px',
      cursor: 'pointer',
      color: 'var(--text)',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'all 0.2s',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = 'var(--surface2)';
      e.currentTarget.style.borderColor = 'var(--primary)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = 'transparent';
      e.currentTarget.style.borderColor = 'var(--border)';
    }}
  >
    <span style={{ fontSize: '18px' }}>🛒</span>
    <span>Cart</span>
    {itemCount > 0 && (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '20px',
          height: '20px',
          minWidth: '20px',
          background: '#e74c3c',
          color: '#fff',
          borderRadius: '50%',
          fontSize: '12px',
          fontWeight: 'bold',
          marginLeft: '4px',
        }}
      >
        {itemCount}
      </span>
    )}
  </button>
);