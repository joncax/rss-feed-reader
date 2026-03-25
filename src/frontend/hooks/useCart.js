/**
 * useCart Hook
 * File: src/frontend/hooks/useCart.js
 * Manage shopping cart state and API calls
 */

import { useState, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://192.168.1.86:3002';

export default function useCart() {
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({ count: 0, totalSize: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch cart items
  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/api/cart`);
      if (!response.ok) throw new Error('Failed to fetch cart');
      const data = await response.json();
      if (data.success) {
        setItems(data.data);
        setStats(data.stats || { count: 0, totalSize: 0 });
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching cart:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Add item to cart
  const addToCart = useCallback(async (item) => {
    try {
      setError(null);
      const response = await fetch(`${API_URL}/api/cart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          magnetLink: item.magnetLink,
          title: item.title,
          feedName: item.feedName,
          size: item.size,
          quality: item.quality,
          priority: 'normal'
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add to cart');
      }

      const data = await response.json();
      if (data.success) {
        setItems([...items, data.data]);
        setStats({
          count: stats.count + 1,
          totalSize: (stats.totalSize || 0) + (item.size || 0)
        });
        return data.data;
      }
    } catch (err) {
      setError(err.message);
      console.error('Error adding to cart:', err);
      throw err;
    }
  }, [items, stats]);

  // Remove item from cart
  const removeFromCart = useCallback(async (itemId) => {
    try {
      setError(null);
      const response = await fetch(`${API_URL}/api/cart/${itemId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to remove from cart');

      setItems(items.filter(item => item.id !== itemId));
      setStats({
        count: Math.max(0, stats.count - 1),
        totalSize: stats.totalSize
      });
    } catch (err) {
      setError(err.message);
      console.error('Error removing from cart:', err);
      throw err;
    }
  }, [items, stats]);

  // Clear cart
  const clearCart = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch(`${API_URL}/api/cart`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to clear cart');

      setItems([]);
      setStats({ count: 0, totalSize: 0 });
    } catch (err) {
      setError(err.message);
      console.error('Error clearing cart:', err);
      throw err;
    }
  }, []);

  // Download all items
  const downloadAll = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch(`${API_URL}/api/cart/download-all`, {
        method: 'POST'
      });

      if (!response.ok) throw new Error('Failed to start downloads');

      const data = await response.json();
      if (data.success) {
        setItems([]);
        setStats({ count: 0, totalSize: 0 });
        return data;
      }
    } catch (err) {
      setError(err.message);
      console.error('Error downloading cart:', err);
      throw err;
    }
  }, []);

  // Get cart stats
  const getStats = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch(`${API_URL}/api/cart/stats/overview`);
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
        return data.data;
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching stats:', err);
    }
  }, []);

  return {
    items,
    stats,
    loading,
    error,
    fetchCart,
    addToCart,
    removeFromCart,
    clearCart,
    downloadAll,
    getStats
  };
}