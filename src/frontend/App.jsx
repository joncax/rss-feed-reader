/**
 * App.jsx
 * File: src/frontend/App.jsx
*/

import React, { useState, useEffect } from 'react'
import Header from './components/Layout/Header'
import Navigation from './components/Layout/Navigation'
import Container from './components/Layout/Container'
import RSSFeedManager from './components/RSS/RSSFeedManager'
import ManageFeeds from './components/RSS/ManageFeeds'
import DownloadCenter from './components/DownloadCenter/DownloadCenter'
import SystemStatus from './components/Status/SystemStatus'
import CartModal from './components/Cart/CartModal'
import useCart from './hooks/useCart'
import SimpleRSSDemo from './components/RSS/SimpleRSSDemo'
import './styles/App.css'

export default function App() {
  const [activeTab, setActiveTab] = useState('rss') // 'rss', 'manage', 'downloads', 'status'
  const [isCartOpen, setIsCartOpen] = useState(false)
  const cart = useCart()

  // Fetch cart on mount
  useEffect(() => {
    cart.fetchCart()
  }, [])

  const renderTab = () => {
    switch (activeTab) {
      case 'rss':
		return <SimpleRSSDemo onAddToCart={handleAddToCart} />
      case 'manage':
        return <ManageFeeds />
      case 'downloads':
        return <DownloadCenter />
      case 'status':
        return <SystemStatus />
      default:
        return <RSSFeedManager onAddToCart={handleAddToCart} />
    }
  }

  const handleAddToCart = async (item) => {
    try {
      await cart.addToCart(item)
      // Show notification
      alert(`✅ Added "${item.title}" to cart!`)
    } catch (error) {
      alert(`❌ Error: ${error.message}`)
    }
  }

  const handleCartDownloadAll = async () => {
    try {
      await cart.downloadAll()
      setIsCartOpen(false)
      // Redirect to Download Center
      setActiveTab('downloads')
    } catch (error) {
      alert(`❌ Error: ${error.message}`)
    }
  }

  return (
    <div className="app">
      <Header 
        cartCount={cart.stats.count}
        onCartClick={() => setIsCartOpen(true)}
      />
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      <Container>
        {renderTab()}
      </Container>
      <CartModal 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onDownloadAll={() => {
			cart.fetchCart();
			setActiveTab('downloads');
		}}
		onCartCleared={() => cart.fetchCart()}
      />
    </div>
  )
}