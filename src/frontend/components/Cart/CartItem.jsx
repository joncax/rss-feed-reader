/**
 * CartItem Component
 * File: src/frontend/components/Cart/CartItem.jsx
 * Individual shopping cart item - simplified
 */

export default function CartItem({ item, onRemove }) {
  const formatSize = (bytes) => {
    if (!bytes) return 'Unknown';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
    return (bytes / 1073741824).toFixed(2) + ' GB';
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px',
        background: 'var(--surface2)',
        border: '1px solid var(--border)',
        borderRadius: '6px',
        marginBottom: '8px',
      }}
    >
      {/* Item Info */}
      <div style={{ flex: 1 }}>
        <h4 style={{ margin: '0 0 4px 0', color: 'var(--text)' }}>
          {item.title}
        </h4>
        <p
          style={{
            margin: 0,
            fontSize: '13px',
            color: 'var(--text-secondary)',
          }}
        >
          <span>{item.feedName || 'Unknown Feed'}</span>
          {item.quality && <span> • {item.quality}</span>}
          {item.size && <span> • {formatSize(item.size)}</span>}
        </p>
      </div>

      {/* Remove Button */}
      <button
        onClick={() => onRemove(item.id)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '32px',
          height: '32px',
          padding: 0,
          background: 'transparent',
          border: '1px solid var(--border)',
          borderRadius: '4px',
          cursor: 'pointer',
          color: 'var(--text-secondary)',
          fontSize: '18px',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#e74c3c';
          e.currentTarget.style.borderColor = '#c0392b';
          e.currentTarget.style.color = '#fff';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.borderColor = 'var(--border)';
          e.currentTarget.style.color = 'var(--text-secondary)';
        }}
        title="Remove from cart"
      >
        ✕
      </button>
    </div>
  );
}