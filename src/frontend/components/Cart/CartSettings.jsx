/**
 * CartSettings Component
 * File: src/frontend/components/Cart/CartSettings.jsx
 * Shopping cart settings panel
 */

import { useState, useEffect } from 'react';
import Card from '../ui/Card';

const API_URL = 'http://192.168.1.86:3003';

export default function CartSettings() {
  const [settings, setSettings] = useState({
    autoOrganize: true,
    sequentialDownload: false,
    bandwidthLimit: null,
    maxConcurrentDownloads: 3,
    scheduledTime: null,
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/cart/settings`);
      const data = await response.json();
      if (data.success) {
        setSettings(data.data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/cart/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await response.json();
      if (data.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card style={{ padding: '16px', marginBottom: '20px' }}>
      <h4 style={{ margin: '0 0 16px 0', color: 'var(--text)' }}>
        ⚙️ Download Settings
      </h4>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Auto-organize */}
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={settings.autoOrganize}
            onChange={(e) => setSettings({ ...settings, autoOrganize: e.target.checked })}
            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
          />
          <span style={{ color: 'var(--text)', fontSize: '14px' }}>
            Auto-organize into folders
          </span>
        </label>

        {/* Sequential Download */}
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={settings.sequentialDownload}
            onChange={(e) => setSettings({ ...settings, sequentialDownload: e.target.checked })}
            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
          />
          <span style={{ color: 'var(--text)', fontSize: '14px' }}>
            Sequential download (one at a time)
          </span>
        </label>

        {/* Bandwidth Limit */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ color: 'var(--text)', fontSize: '14px', minWidth: '140px' }}>
            Bandwidth limit:
          </label>
          <input
            type="number"
            value={settings.bandwidthLimit || ''}
            onChange={(e) => setSettings({ ...settings, bandwidthLimit: e.target.value ? parseInt(e.target.value) : null })}
            placeholder="Unlimited"
            style={{
              padding: '6px 8px',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '4px',
              color: 'var(--text)',
              fontSize: '13px',
              width: '80px',
            }}
          />
          <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Mbps</span>
        </div>

        {/* Max Concurrent Downloads */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ color: 'var(--text)', fontSize: '14px', minWidth: '140px' }}>
            Max concurrent:
          </label>
          <input
            type="number"
            min="1"
            max="10"
            value={settings.maxConcurrentDownloads}
            onChange={(e) => setSettings({ ...settings, maxConcurrentDownloads: parseInt(e.target.value) })}
            style={{
              padding: '6px 8px',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '4px',
              color: 'var(--text)',
              fontSize: '13px',
              width: '60px',
            }}
          />
          <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>downloads</span>
        </div>

        {/* Schedule */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ color: 'var(--text)', fontSize: '14px', minWidth: '140px' }}>
            Schedule:
          </label>
          <select
            value={settings.scheduledTime ? 'custom' : 'immediate'}
            onChange={(e) => setSettings({ ...settings, scheduledTime: e.target.value === 'immediate' ? null : new Date().toISOString() })}
            style={{
              padding: '6px 8px',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '4px',
              color: 'var(--text)',
              fontSize: '13px',
            }}
          >
            <option value="immediate">Immediate</option>
            <option value="custom">Custom time (TODO)</option>
          </select>
        </div>

        {/* Save Button */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
          <button
            onClick={handleSave}
            disabled={loading}
            style={{
              padding: '8px 16px',
              background: 'var(--primary)',
              border: 'none',
              borderRadius: '4px',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '600',
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
          {saved && (
            <span style={{ color: '#2ecc71', fontSize: '13px', fontWeight: '500' }}>
              ✓ Saved!
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}