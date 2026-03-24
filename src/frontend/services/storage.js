/**
 * Storage Service
 * File: src/frontend/services/storage.js
 * IndexedDB helpers para armazenamento client-side (episodes, settings, cache)
 */

const DB_NAME = 'RSSFeedReaderDB';
const DB_VERSION = 1;

let db = null;

// =============================================
// INITIALIZE DATABASE
// =============================================

export async function initDB() {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = event.target.result;

      // Episodes store
      if (!database.objectStoreNames.contains('episodes')) {
        const episodeStore = database.createObjectStore('episodes', { keyPath: 'guid' });
        episodeStore.createIndex('feedName', 'feedName', { unique: false });
        episodeStore.createIndex('isRead', 'isRead', { unique: false });
      }

      // Settings store
      if (!database.objectStoreNames.contains('settings')) {
        database.createObjectStore('settings', { keyPath: 'key' });
      }

      // Cache store
      if (!database.objectStoreNames.contains('cache')) {
        const cacheStore = database.createObjectStore('cache', { keyPath: 'key' });
        cacheStore.createIndex('expiry', 'expiry', { unique: false });
      }
    };
  });
}

// =============================================
// EPISODES (RSS Feed Items)
// =============================================

export async function saveEpisodes(episodes) {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction('episodes', 'readwrite');
    const store = transaction.objectStore('episodes');

    episodes.forEach(episode => {
      store.put({
        ...episode,
        isRead: episode.isRead || false,
        timestamp: episode.timestamp || Date.now()
      });
    });

    transaction.onerror = () => reject(transaction.error);
    transaction.oncomplete = () => resolve(true);
  });
}

export async function getAllEpisodes() {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction('episodes', 'readonly');
    const store = transaction.objectStore('episodes');
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || []);
  });
}

export async function getEpisodesByFeed(feedName) {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction('episodes', 'readonly');
    const store = transaction.objectStore('episodes');
    const index = store.index('feedName');
    const request = index.getAll(feedName);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || []);
  });
}

export async function getEpisode(guid) {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction('episodes', 'readonly');
    const store = transaction.objectStore('episodes');
    const request = store.get(guid);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || null);
  });
}

export async function updateEpisode(guid, updates) {
  const database = await initDB();
  const episode = await getEpisode(guid);

  if (!episode) return null;

  return new Promise((resolve, reject) => {
    const transaction = database.transaction('episodes', 'readwrite');
    const store = transaction.objectStore('episodes');
    const request = store.put({ ...episode, ...updates });

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

export async function toggleEpisodeRead(guid) {
  const episode = await getEpisode(guid);
  if (!episode) return null;

  return updateEpisode(guid, { isRead: !episode.isRead });
}

export async function clearEpisodes() {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction('episodes', 'readwrite');
    const store = transaction.objectStore('episodes');
    const request = store.clear();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(true);
  });
}

// =============================================
// SETTINGS
// =============================================

export async function getSetting(key) {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction('settings', 'readonly');
    const store = transaction.objectStore('settings');
    const request = store.get(key);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result?.value || null);
  });
}

export async function setSetting(key, value) {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction('settings', 'readwrite');
    const store = transaction.objectStore('settings');
    const request = store.put({ key, value });

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(true);
  });
}

export async function getSettings() {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction('settings', 'readonly');
    const store = transaction.objectStore('settings');
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const settings = {};
      (request.result || []).forEach(item => {
        settings[item.key] = item.value;
      });
      resolve(settings);
    };
  });
}

// =============================================
// CACHE
// =============================================

export async function getCacheItem(key) {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction('cache', 'readonly');
    const store = transaction.objectStore('cache');
    const request = store.get(key);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const item = request.result;
      if (!item) {
        resolve(null);
        return;
      }

      // Check if expired
      if (item.expiry && item.expiry < Date.now()) {
        deleteCacheItem(key); // async, but don't wait
        resolve(null);
      } else {
        resolve(item.value);
      }
    };
  });
}

export async function setCacheItem(key, value, expiryMs = null) {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction('cache', 'readwrite');
    const store = transaction.objectStore('cache');

    const item = {
      key,
      value,
      expiry: expiryMs ? Date.now() + expiryMs : null,
      timestamp: Date.now()
    };

    const request = store.put(item);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(true);
  });
}

export async function deleteCacheItem(key) {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction('cache', 'readwrite');
    const store = transaction.objectStore('cache');
    const request = store.delete(key);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(true);
  });
}

export async function clearCache() {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction('cache', 'readwrite');
    const store = transaction.objectStore('cache');
    const request = store.clear();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(true);
  });
}

// =============================================
// LOCAL STORAGE HELPERS (Fallback)
// =============================================

export function setLocalStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('setLocalStorage error:', error);
  }
}

export function getLocalStorage(key) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error('getLocalStorage error:', error);
    return null;
  }
}

export function removeLocalStorage(key) {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('removeLocalStorage error:', error);
  }
}

export function clearLocalStorage() {
  try {
    localStorage.clear();
  } catch (error) {
    console.error('clearLocalStorage error:', error);
  }
}

// =============================================
// EXPORT ALL FOR BULK OPERATIONS
// =============================================

export async function exportAllData() {
  const episodes = await getAllEpisodes();
  const settings = await getSettings();

  return {
    episodes,
    settings,
    exportedAt: new Date().toISOString()
  };
}

export async function importAllData(data) {
  if (data.episodes) {
    await clearEpisodes();
    await saveEpisodes(data.episodes);
  }

  if (data.settings) {
    for (const [key, value] of Object.entries(data.settings)) {
      await setSetting(key, value);
    }
  }

  return true;
}

export async function clearAllData() {
  await clearEpisodes();
  await clearCache();
  await clearLocalStorage();
  return true;
}