/**
 * RSS TV Logic Controller
 * File: app.js
 * v2.0
 * Features: Dynamic API URL, Persistent Sync, Title Sanitization, Zebra Striping, Media Icons.
 */

const API = `${window.location.protocol}//${window.location.hostname}:${window.location.port}`;

let currentItems = [];
let currentView = 'grid';
let syncRegistry = null;
let activeFilters = { quality: 'all', type: 'all' };
let activeSort = 'newest'; // 'newest' | 'oldest'

// --- 1. THE CLOCK (Timer Logic) ---

function startTimer() {
    setInterval(async () => {
        if (!syncRegistry) await fetchSyncStatus();
        updateTimerDisplay();
    }, 1000);
}

async function fetchSyncStatus() {
    try {
        const res = await fetch(`${API}/sync-status`);
        syncRegistry = await res.json();
        const selector = document.getElementById('intervalSelect');
        if (selector) selector.value = syncRegistry.settings.syncIntervalMs;
    } catch (e) {
        console.error("Sync status error:", e);
    }
}

function updateTimerDisplay() {
    const lastLabel = document.getElementById('last-update-label');
    const nextLabel = document.getElementById('next-sync-label');
    if (!syncRegistry || !lastLabel || !nextLabel) return;

    const interval = parseInt(syncRegistry.settings.syncIntervalMs);
    if (interval === 0) {
        nextLabel.innerText = "Next Sync: OFF";
        nextLabel.style.color = "#777";
        return;
    }

    const now = Date.now();
    let latestUpdate = 0;
    for (const name in syncRegistry.feeds) {
        const last = syncRegistry.feeds[name].lastUpdated || 0;
        if (last > latestUpdate) latestUpdate = last;
    }

    if (latestUpdate === 0) {
        lastLabel.innerText = "Last Sync: Never";
        nextLabel.innerText = "Next Sync: Pending";
        return;
    }

    const lastDate = new Date(latestUpdate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    lastLabel.innerText = `Last Sync: ${lastDate}`;

    const nextSyncTime = latestUpdate + interval;
    const diff = nextSyncTime - now;

    if (diff <= 0) {
        nextLabel.innerText = "Next Sync: Syncing...";
    } else {
        const mins = Math.floor((diff / 1000 / 60) % 60);
        const secs = Math.floor((diff / 1000) % 60);
        nextLabel.innerText = `Next Sync: ${mins}m ${secs.toString().padStart(2, '0')}s`;
    }
}

// --- 2. ENHANCED DATA PROCESSING ---

function sanitizeTitle(title) {
    return title
        .replace(/\./g, ' ')
        .replace(/\[.*?\]/g, '')
        .replace(/\b(2160p|1080p|720p|480p|HEVC|x264|x265|WEB-DL|BluRay|HDR|RM4k|mSD|6CH|10bit)\b/gi, '')
        .replace(/\s+/g, ' ')
        .trim();
}

function getMediaIcon(title) {
    const isTV = /S\d{1,2}E\d{1,2}/i.test(title) || /Season/i.test(title);
    return isTV ? '📺' : '🎬';
}

function getQualityInfo(title) {
    const qualityMatch = title.match(/\b(480p|720p|1080p|2160p|4k)\b/i);
    const q = qualityMatch ? qualityMatch[0].toLowerCase() : 'sd';
    let colorClass = 'q-sd';
    if (q === '720p') colorClass = 'q-hd';
    if (q === '1080p') colorClass = 'q-fhd';
    if (q === '2160p' || q === '4k') colorClass = 'q-uhd';
    return { tag: q.toUpperCase(), className: colorClass };
}

function getQualityKey(title) {
    const m = title.match(/\b(480p|720p|1080p|2160p|4k)\b/i);
    if (!m) return 'sd';
    const q = m[0].toLowerCase();
    if (q === '4k' || q === '2160p') return '4k';
    return q;
}

function setFilter(type, value) {
    activeFilters[type] = value;
    document.querySelectorAll(`.filter-btn[data-filter="${type}"]`).forEach(btn => {
        btn.classList.toggle('active', btn.dataset.value === value);
    });
    renderMainUI();
}

function setSort(value) {
    activeSort = value;
    document.querySelectorAll('.sort-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.value === value);
    });
    renderMainUI();
}

// --- 3. VIEW & RENDER LOGIC ---

async function renderMainUI() {
    const query = document.getElementById('search').value.toLowerCase();
    let itemsToDisplay = [...currentItems];

    // Text search
    if (query) {
        itemsToDisplay = itemsToDisplay.filter(i => i.title.toLowerCase().includes(query));
    }

    // Quality filter
    if (activeFilters.quality !== 'all') {
        itemsToDisplay = itemsToDisplay.filter(i => {
            const q = getQualityKey(i.title);
            return q === activeFilters.quality;
        });
    }

    // Type filter
    if (activeFilters.type !== 'all') {
        itemsToDisplay = itemsToDisplay.filter(i => {
            const isTV = /S\d{1,2}E\d{1,2}/i.test(i.title) || /Season/i.test(i.title);
            return activeFilters.type === 'tv' ? isTV : !isTV;
        });
    }

    // Update result count
    const countEl = document.getElementById('result-count');
    if (countEl) countEl.innerText = `${itemsToDisplay.length} result${itemsToDisplay.length !== 1 ? 's' : ''}`;

    // Sort — applies to both grid and list
    itemsToDisplay.sort((a, b) => {
        const dateA = a.pubDate ? new Date(a.pubDate) : new Date(a.timestamp || 0);
        const dateB = b.pubDate ? new Date(b.pubDate) : new Date(b.timestamp || 0);
        return activeSort === 'newest' ? dateB - dateA : dateA - dateB;
    });

    const container = document.getElementById('content');
    if (currentView === 'list') {
        displayListView(itemsToDisplay, container);
    } else {
        displayGridView(itemsToDisplay, container);
    }
}

function displayListView(items, container) {
    let html = `
        <table class="list-view">
            <thead>
                <tr>
                    <th width="40">Type</th>
                    <th>Name</th>
                    <th class="col-quality" width="80">Quality</th>
                    <th class="col-date" width="90">Date</th>
                    <th width="70" style="text-align:right;">Action</th>
                </tr>
            </thead>
            <tbody>`;

    html += items.map((item, index) => {
        const cleanName = sanitizeTitle(item.title);
        const icon = getMediaIcon(item.title);
        const quality = getQualityInfo(item.title);
        const rowClass = index % 2 === 0 ? 'row-even' : 'row-odd';
        const date = item.pubDate ? new Date(item.pubDate).toLocaleDateString([], { day: '2-digit', month: 'short' }) : '—';
        return `
            <tr class="${rowClass} ${item.isRead ? 'is-read' : ''}">
                <td>${icon}</td>
                <td>
                    <div class="sanitized-name">${cleanName}</div>
                    <div class="original-meta">${item.title}</div>
                </td>
                <td class="col-quality"><span class="quality-badge ${quality.className}">${quality.tag}</span></td>
                <td class="col-date" style="font-size:11px; color: var(--text-dim);">${date}</td>
                <td style="text-align: right;">
                    <a href="${item.magnet}" class="magnet-link" onclick="toggleReadStatus('${item.guid}')">
                        🧲 GET
                    </a>
                </td>
            </tr>`;
    }).join('');

    container.innerHTML = html + `</tbody></table>`;
}

function displayGridView(items, container) {
    container.innerHTML = items.map(item => `
        <div class="card ${item.isRead ? 'is-read' : ''}">
            <div class="card-content">
                <div style="display:flex; justify-content:space-between;">
                    <span style="font-size: 1.2rem;">${getMediaIcon(item.title)}</span>
                    <span style="font-size: 10px; color: #555;">${item.pubDate || ''}</span>
                </div>
                <div class="card-title" style="margin-top:10px;">${sanitizeTitle(item.title)}</div>
                <div class="btn-group" style="margin-top:15px;">
                    <a href="${item.magnet}" class="magnet-btn" onclick="toggleReadStatus('${item.guid}')">🧲 DOWNLOAD</a>
                </div>
            </div>
        </div>
    `).join('');
}

// --- 4. SERVER & DB ACTIONS ---

async function addFeed() {
    const name = document.getElementById('feedName').value.trim();
    const url = document.getElementById('feedUrl').value.trim();
    if (!name || !url) return alert("Please fill in both the nickname and URL.");
    const btn = document.getElementById('addBtn');
    btn.disabled = true;
    btn.innerText = 'Registering...';
    try {
        const res = await fetch(`${API}/add-feed`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, url })
        });
        if (res.ok) {
            document.getElementById('feedName').value = '';
            document.getElementById('feedUrl').value = '';
            await refreshFileList();
            await fetchSyncStatus();
        } else {
            alert("Error adding feed. Check the server.");
        }
    } finally {
        btn.disabled = false;
        btn.innerText = 'Register & Download';
    }
}

async function manualSyncAll() {
    const btn = document.querySelector('.btn-sync-all');
    if (btn) { btn.disabled = true; btn.innerHTML = '<span class="icon">⏳</span> Syncing...'; }
    try {
        await fetch(`${API}/manual-sync`, { method: 'POST' });
        await fetchSyncStatus();
    } finally {
        if (btn) { btn.disabled = false; btn.innerHTML = '<span class="icon">🔄</span> Sync All Now'; }
    }
}

async function loadFeed() {
    const name = document.getElementById('feedSelect').value;
    if (!name) return;
    document.getElementById('loader').style.display = 'block';
    try {
        const res = await fetch(`${API}/fetch-local?name=${name}`);
        const data = await res.json();
        await saveEpisodes(data.items);
        currentItems = await getAllEpisodes();
        renderMainUI();
    } finally {
        document.getElementById('loader').style.display = 'none';
    }
}

async function toggleReadStatus(guid) {
    const db = await initDB();
    const tx = db.transaction('episodes', 'readwrite');
    const store = tx.objectStore('episodes');
    const req = store.get(guid);
    req.onsuccess = () => {
        const data = req.result;
        if (data) { data.isRead = !data.isRead; store.put(data); }
    };
    tx.oncomplete = async () => {
        currentItems = await getAllEpisodes();
        renderMainUI();
    };
}

async function updateInterval() {
    const intervalMs = parseInt(document.getElementById('intervalSelect').value);
    await fetch(`${API}/update-settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intervalMs })
    });
    if (syncRegistry) syncRegistry.settings.syncIntervalMs = intervalMs;
    updateTimerDisplay();
}

async function refreshFileList() {
    const res = await fetch(`${API}/list-feeds`);
    const feeds = await res.json();
    const select = document.getElementById('feedSelect');
    select.innerHTML = '<option value="">Select a Feed...</option>' +
        feeds.map(f => `<option value="${f}">${f}</option>`).join('');
}

function switchView(viewType) {
    currentView = viewType;
    document.getElementById('btnGrid').classList.toggle('active', viewType === 'grid');
    document.getElementById('btnList').classList.toggle('active', viewType === 'list');
    const container = document.getElementById('content');
    container.className = viewType === 'grid' ? 'grid-view' : 'list-view';
    renderMainUI();
}

function filterItems() { renderMainUI(); }

window.onload = () => {
    refreshFileList();
    fetchSyncStatus();
    startTimer();
};