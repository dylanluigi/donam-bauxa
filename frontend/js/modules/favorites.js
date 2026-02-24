/**
 * @module favorites
 * @description Manages user favorites using localStorage.
 * Supports both artist and event favorites.
 */

const STORAGE_KEY_ARTISTS = 'bauxa_fav_artists';
const STORAGE_KEY_EVENTS = 'bauxa_fav_events';

/**
 * Gets the storage key for a given type.
 * @param {'artist'|'event'} type
 * @returns {string}
 */
function getKey(type) {
  return type === 'artist' ? STORAGE_KEY_ARTISTS : STORAGE_KEY_EVENTS;
}

/**
 * Retrieves all favorite IDs of a given type.
 * @param {'artist'|'event'} type
 * @returns {string[]} Array of favorite IDs
 */
export function getFavorites(type) {
  try {
    const stored = localStorage.getItem(getKey(type));
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Checks if an item is favorited.
 * @param {'artist'|'event'} type
 * @param {string} id
 * @returns {boolean}
 */
export function isFavorite(type, id) {
  return getFavorites(type).includes(id);
}

/**
 * Toggles a favorite on/off.
 * @param {'artist'|'event'} type
 * @param {string} id
 * @returns {boolean} New favorite state (true = added, false = removed)
 */
export function toggleFavorite(type, id) {
  const favorites = getFavorites(type);
  const index = favorites.indexOf(id);
  if (index === -1) {
    favorites.push(id);
  } else {
    favorites.splice(index, 1);
  }
  localStorage.setItem(getKey(type), JSON.stringify(favorites));

  // Dispatch custom event for UI updates
  window.dispatchEvent(new CustomEvent('favoritesChanged', {
    detail: { type, id, isFavorite: index === -1 }
  }));

  return index === -1;
}

/**
 * Returns the count of favorites for a given type.
 * @param {'artist'|'event'} type
 * @returns {number}
 */
export function getFavoriteCount(type) {
  return getFavorites(type).length;
}

/**
 * Returns the total count of all favorites.
 * @returns {number}
 */
export function getTotalFavoriteCount() {
  return getFavoriteCount('artist') + getFavoriteCount('event');
}
