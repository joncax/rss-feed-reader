/**
 * RSS TV Local Database Manager
 * File: db.js
 * v.2.0
 * Handles episode read/unread status via IndexedDB.
 */

const DB_NAME = 'RSSTV_Database';
const DB_VERSION = 2;

function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('episodes')) {
                db.createObjectStore('episodes', { keyPath: 'guid' });
            }
            if (!db.objectStoreNames.contains('settings')) {
                db.createObjectStore('settings', { keyPath: 'id' });
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function saveSyncState(lastSync, nextSync, interval) {
    const db = await initDB();
    const tx = db.transaction('settings', 'readwrite');
    const store = tx.objectStore('settings');
    store.put({ id: 'sync_info', lastSync, nextSync, interval, updatedAt: Date.now() });
    return new Promise((resolve) => { tx.oncomplete = () => resolve(); });
}

async function getSyncState() {
    const db = await initDB();
    const tx = db.transaction('settings', 'readonly');
    const store = tx.objectStore('settings');
    const request = store.get('sync_info');
    return new Promise((resolve) => {
        request.onsuccess = () => resolve(request.result || null);
    });
}

async function saveEpisodes(items) {
    const db = await initDB();
    const tx = db.transaction('episodes', 'readwrite');
    const store = tx.objectStore('episodes');
    items.forEach(item => {
        const checkRequest = store.get(item.guid);
        checkRequest.onsuccess = () => {
            if (!checkRequest.result) {
                store.add({ ...item, isRead: false, timestamp: Date.now() });
            }
        };
    });
    return new Promise((resolve) => { tx.oncomplete = () => resolve(); });
}

async function getAllEpisodes() {
    const db = await initDB();
    const tx = db.transaction('episodes', 'readonly');
    const store = tx.objectStore('episodes');
    const request = store.getAll();
    return new Promise((resolve) => {
        request.onsuccess = () => resolve(request.result);
    });
}

async function deleteEpisodesByFeed(feedName) {
    const db = await initDB();
    const tx = db.transaction('episodes', 'readwrite');
    const store = tx.objectStore('episodes');
    const request = store.openCursor();
    request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
            if (cursor.value.guid.startsWith(feedName)) cursor.delete();
            cursor.continue();
        }
    };
    return new Promise((resolve) => { tx.oncomplete = () => resolve(); });
}