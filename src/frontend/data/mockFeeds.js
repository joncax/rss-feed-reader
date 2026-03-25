/**
 * Mock Feed Data
 * File: src/frontend/data/mockFeeds.js
 * Fake data para testar Shopping Cart (Phase 2A MVP)
 */

export const mockFeeds = [
  {
    id: 1,
    feedName: 'EZTV',
    title: 'Breaking Bad S05E16',
    magnet: 'magnet:?xt=urn:btih:abcd1234',
    quality: '720p',
    pubDate: new Date().toISOString(),
    guid: 'eztv-breaking-bad-s05e16'
  },
  {
    id: 2,
    feedName: 'EZTV',
    title: 'Breaking Bad S05E15',
    magnet: 'magnet:?xt=urn:btih:efgh5678',
    quality: '1080p',
    pubDate: new Date().toISOString(),
    guid: 'eztv-breaking-bad-s05e15'
  },
  {
    id: 3,
    feedName: 'EZTV',
    title: 'Breaking Bad S05E14',
    magnet: 'magnet:?xt=urn:btih:ijkl9012',
    quality: '720p',
    pubDate: new Date().toISOString(),
    guid: 'eztv-breaking-bad-s05e14'
  }
];
