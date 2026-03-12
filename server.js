/**
 * RSS TV Backend
 * File: server.js
 * v.2.0
 * Features: Static file serving, Auto-Sync, Registry Management, File Cleanup.
 */

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve frontend static files from /public
app.use(express.static(path.join(__dirname, 'public')));

const RSS_DIR = path.join(__dirname, 'rss_feeds');
const REGISTRY_PATH = path.join(__dirname, 'feeds.json');

if (!fs.existsSync(RSS_DIR)) fs.mkdirSync(RSS_DIR);

// --- 1. REGISTRY MANAGEMENT ---

let registry = {
    settings: { syncIntervalMs: 3600000 },
    feeds: {}
};

function loadRegistry() {
    if (fs.existsSync(REGISTRY_PATH)) {
        try {
            registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
        } catch (e) {
            console.error("Error reading registry, starting fresh.");
        }
    }
}

function saveRegistry() {
    fs.writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2));
}

loadRegistry();

// --- 2. DOWNLOAD ENGINE ---

async function downloadToFile(name, url) {
    const filePath = path.join(RSS_DIR, `${name}.xml`);
    try {
        const response = await axios({
            url,
            method: 'GET',
            responseType: 'stream',
            timeout: 15000,
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', () => {
                if (registry.feeds[name]) {
                    registry.feeds[name].lastUpdated = Date.now();
                    saveRegistry();
                }
                resolve();
            });
            writer.on('error', reject);
        });
    } catch (err) {
        console.error(`Sync failed for ${name}:`, err.message);
    }
}

// --- 3. BACKGROUND SYNC ENGINE ---

async function runAutoSync() {
    const now = Date.now();
    const interval = registry.settings.syncIntervalMs;

    if (interval === 0) return;

    for (const [name, data] of Object.entries(registry.feeds)) {
        const timeSinceUpdate = now - (data.lastUpdated || 0);
        if (timeSinceUpdate >= interval) {
            console.log(`🕒 Auto-Sync: Updating ${name}`);
            await downloadToFile(name, data.url);
        }
    }
}

setInterval(runAutoSync, 60000);

// --- 4. API ENDPOINTS ---

// Create/Add Feed
app.post('/add-feed', async (req, res) => {
    const { name, url } = req.body;
    if (!name || !url) return res.status(400).json({ error: "Name and URL are required." });
    registry.feeds[name] = { url, lastUpdated: 0 };
    saveRegistry();
    await downloadToFile(name, url);
    res.json({ message: "Feed added" });
});

// Delete Feed (Registry + File)
app.delete('/delete-feed/:name', (req, res) => {
    const name = req.params.name;
    const filePath = path.join(RSS_DIR, `${name}.xml`);

    if (registry.feeds[name]) {
        delete registry.feeds[name];
        saveRegistry();
    }

    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`🗑️ Deleted local file: ${name}.xml`);
    }

    res.json({ message: `Feed ${name} deleted successfully.` });
});

// Update sync interval settings
app.post('/update-settings', (req, res) => {
    const { intervalMs } = req.body;
    registry.settings.syncIntervalMs = intervalMs;
    saveRegistry();
    res.json({ message: "Settings updated" });
});

// Get full registry (feeds + settings)
app.get('/sync-status', (req, res) => {
    res.json(registry);
});

// List all feed names
app.get('/list-feeds', (req, res) => {
    res.json(Object.keys(registry.feeds));
});

// Fetch and parse a local XML feed
app.get('/fetch-local', (req, res) => {
    const name = req.query.name;
    const filePath = path.join(RSS_DIR, `${name}.xml`);

    if (!fs.existsSync(filePath)) return res.status(404).send("File not found");

    const rawXml = fs.readFileSync(filePath, 'utf8');
    const $ = cheerio.load(rawXml, { xml: true });
    const items = [];

    $('item').each((i, el) => {
        const $el = $(el);
        const title = $el.find('title').text().trim();
        let magnet = $el.find('magnetURI, torrent\\:magnetURI').text().trim();
        const hash = $el.find('infoHash, torrent\\:infoHash').text().trim();
        if (!magnet && hash) magnet = `magnet:?xt=urn:btih:${hash}&dn=${encodeURIComponent(title)}`;

        items.push({
            title,
            magnet: magnet || $el.find('link').text().trim(),
            pubDate: $el.find('pubDate').text().trim(),
            guid: $el.find('guid').text().trim() || (name + i)
        });
    });

    res.json({ items, lastUpdated: registry.feeds[name]?.lastUpdated });
});

// Manual sync all feeds immediately
app.post('/manual-sync', async (req, res) => {
    console.log('🔄 Manual sync triggered');
    const promises = Object.entries(registry.feeds).map(([name, data]) =>
        downloadToFile(name, data.url)
    );
    await Promise.all(promises);
    res.json({ message: "Manual sync complete", count: promises.length });
});

app.listen(PORT, '0.0.0.0', () => console.log(`🚀 RSS TV Server running on port ${PORT}`));