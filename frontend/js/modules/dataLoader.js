/**
 * @module dataLoader
 * @description Fetches and caches JSON data from the /data directory.
 */

/** @type {Map<string, any>} In-memory cache for loaded data */
const cache = new Map();

/**
 * Fetches JSON data from a given path, with caching.
 * @param {string} path - Relative path to the JSON file (e.g. 'data/artists.json')
 * @returns {Promise<Object>} Parsed JSON data
 */
export async function loadData(path) {
  if (cache.has(path)) return cache.get(path);

  let preload = null;
  if (window.__dataPreload) {
    if (path === 'data/events.json')  { preload = window.__dataPreload.events;  window.__dataPreload.events  = null; }
    if (path === 'data/artists.json') { preload = window.__dataPreload.artists; window.__dataPreload.artists = null; }
    if (path === 'data/news.json')    { preload = window.__dataPreload.news;    window.__dataPreload.news    = null; }
  }

  try {
    const data = preload ? await preload : await fetch(path).then(r => {
      if (!r.ok) throw new Error(`Failed to load ${path}: ${r.status}`);
      return r.json();
    });
    cache.set(path, data);
    return data;
  } catch (error) {
    console.error(`[dataLoader] Error loading ${path}:`, error);
    throw error;
  }
}

/**
 * Extracts items from a Schema.org ItemList.
 * @param {Object} data - Schema.org ItemList object
 * @returns {Array<Object>} Array of item objects
 */
export function extractItems(data) {
  if (!data || !data.itemListElement) return [];
  return data.itemListElement.map(entry => entry.item);
}

/**
 * Loads and extracts artist data.
 * @returns {Promise<Array<Object>>}
 */
export async function loadArtists() {
  const data = await loadData('data/artists.json');
  return extractItems(data);
}

/**
 * Loads and extracts event data.
 * @returns {Promise<Array<Object>>}
 */
export async function loadEvents() {
  const data = await loadData('data/events.json');
  return extractItems(data);
}

/**
 * Loads and extracts news data.
 * @returns {Promise<Array<Object>>}
 */
export async function loadNews() {
  const data = await loadData('data/news.json');
  return extractItems(data);
}
