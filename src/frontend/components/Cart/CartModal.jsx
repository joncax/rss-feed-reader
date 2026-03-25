/**
 * CartModal Component
 * File: src/frontend/components/Cart/CartModal.jsx
 * Complete shopping cart modal with absolute URLs
 */

import { useState, useEffect } from 'react';
import CartItem from './CartItem';
import Card from '../ui/Card';
import Modal from '../ui/Modal';

const API_URL = 'http://192.168.1.86:3003';

export default function CartModal({ isOpen, onClose, onDownloadAll, onCartCleared }) {
  const [cartItems, setCartItems] = useState([]);
  const [cartStats, setCartStats] = useState({ count: 0, totalSize: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
	  if (isOpen) {
		  fetchCart();
    // Force refresh a cada 2 segundos enquanto aberto
		  const interval = setInterval(fetchCart, 2000);
		  return () => clearInterval(interval);
		}
}, [isOpen]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/cart`);
      const data = await response.json();
      if (data.success) {
        setCartItems(data.data);
        setCartStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      const response = await fetch(`${API_URL}/api/cart/${itemId}`, { method: 'DELETE' });
      if (response.ok) {
        setCartItems(cartItems.filter((item) => item.id !== itemId));
        fetchCart();
      }
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

const handleClearCart = async () => {
  if (!window.confirm('Clear entire cart?')) return;
  try {
    // DELETE real do carrinho
    const response = await fetch(`${API_URL}/api/cart`, { method: 'DELETE' });
    if (response.ok) {
      setCartItems([]);
      setCartStats({ count: 0, totalSize: 0 });
      onCartCleared?.();
    } else {
      alert('❌ Error clearing cart');
    }
  } catch (error) {
    console.error('Error clearing cart:', error);
    alert('❌ Error clearing cart');
  }
};

const handleDownloadAll = async () => {
	try {
		const response = await fetch(`${API_URL}/api/cart/download-all`, { method: 'POST' });
		const data = await response.json();
		if (data.success) {
			alert(`✅ ${data.itemsCount} items added to downloads!`);
			setCartItems([]);  // Limpa DEPOIS de sucesso
			setCartStats({ count: 0, totalSize: 0 });
			await fetchCart();  // Refetch para atualizar
			onDownloadAll?.();
			onClose();
		} else {
			alert(`❌ Error: ${data.error}`);
		}
	} catch (error) {
		console.error('Error downloading cart:', error);
		alert('❌ Error downloading items');
	}
};

  const formatSize = (bytes) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
    return (bytes / 1073741824).toFixed(2) + ' GB';
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="🛒 Shopping Cart">
      <div style={{ padding: '20px', minHeight: '400px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
            Loading...
          </div>
        ) : cartItems.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: 'var(--text-secondary)',
            }}
          >
            <p style={{ fontSize: '24px', marginBottom: '10px' }}>🛒</p>
            <p>Your cart is empty</p>
            <p style={{ fontSize: '12px' }}>
              Add items from RSS feeds to get started
            </p>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ margin: '0 0 12px 0', color: 'var(--text)' }}>
                Items ({cartStats.count})
              </h3>
              {cartItems.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onRemove={handleRemoveItem}
                  onPriorityChange={(id, priority) => {
                    // TODO: Implement priority update
                  }}
                />
              ))}
            </div>

            {/* Cart Summary */}
            <Card style={{ padding: '16px', marginBottom: '20px' }}>
              <h4 style={{ margin: '0 0 12px 0', color: 'var(--text)' }}>
                📊 Summary
              </h4>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                  fontSize: '14px',
                }}
              >
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Items:</span>
                  <p style={{ margin: '4px 0 0 0', color: 'var(--text)' }}>
                    {cartStats.count} items
                  </p>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    Total Size:
                  </span>
                  <p style={{ margin: '4px 0 0 0', color: 'var(--text)' }}>
                    {formatSize(cartStats.totalSize)}
                  </p>
                </div>
              </div>
            </Card>

            {/* Action Buttons */}
            <div
              style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-end',
              }}
            >
              <button
                onClick={handleClearCart}
                style={{
                  padding: '10px 16px',
                  background: 'transparent',
                  border: '1px solid var(--border)',
                  borderRadius: '4px',
                  color: 'var(--text)',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--surface2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                Clear Cart
              </button>
              <button
                onClick={onClose}
                style={{
                  padding: '10px 16px',
                  background: 'transparent',
                  border: '1px solid var(--border)',
                  borderRadius: '4px',
                  color: 'var(--text)',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--surface2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                Continue Shopping
              </button>
              <button
                onClick={handleDownloadAll}
                style={{
                  padding: '10px 16px',
                  background: 'var(--primary)',
                  border: 'none',
                  borderRadius: '4px',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.9';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
              >
                🚀 Download All
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}