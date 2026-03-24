import React, { useState } from 'react'
import Header from './components/Layout/Header'
import Navigation from './components/Layout/Navigation'
import Container from './components/Layout/Container'
import RSSFeedManager from './components/RSS/RSSFeedManager'
import DownloadCenter from './components/DownloadCenter/DownloadCenter'
import SystemStatus from './components/Status/SystemStatus'
import './styles/App.css'

export default function App() {
  const [activeTab, setActiveTab] = useState('rss') // 'rss', 'downloads', 'status'

  const renderTab = () => {
    switch (activeTab) {
      case 'rss':
        return <RSSFeedManager />
      case 'downloads':
        return <DownloadCenter />
      case 'status':
        return <SystemStatus />
      default:
        return <RSSFeedManager />
    }
  }

  return (
    <div className="app">
      <Header />
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      <Container>
        {renderTab()}
      </Container>
    </div>
  )
}