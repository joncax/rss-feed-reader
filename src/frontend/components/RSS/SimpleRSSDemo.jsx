/**
 * SimpleRSSDemo Component
 * File: src/frontend/components/RSS/SimpleRSSDemo.jsx
 * Simple demo para testar Shopping Cart (Phase 2A MVP)
 */

import { useState } from 'react';
import { mockFeeds } from '../../data/mockFeeds';
import FeedCard from './FeedCard';
import Card from '../ui/Card';

export default function SimpleRSSDemo({ onAddToCart }) {
  const [selectedFeed, setSelectedFeed] = useState('EZTV');

  const feeds = mockFeeds.filter(f => f.feedName === selectedFeed);

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ color: 'var(--text)', marginBottom: '20px' }}>
        📺 RSS Feed Demo (Mock Data)
      </h2>

      <Card style={{ padding: '16px', marginBottom: '20px' }}>
        <p style={{ margin: '0 0 12px 0', color: 'var(--text-secondary)' }}>
          ℹ️ This is demo data for testing Shopping Cart (Phase 2A MVP)
        </p>
        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '13px' }}>
          Click <strong>🛒 Cart</strong> to add items to your shopping cart, then click the <strong>🛒 Cart</strong> badge to open the modal.
        </p>
      </Card>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '16px'
      }}>
        {feeds.map(item => (
          <FeedCard
            key={item.guid}
            item={item}
            onAddToCart={onAddToCart}
          />
        ))}
      </div>
    </div>
  );
}
