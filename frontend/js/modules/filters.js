/**
 * @module filters
 * @description Provides filtering logic for artists and events.
 */

/**
 * Filters artists by search text, genre, and zone.
 * @param {Array<Object>} artists - Array of artist objects
 * @param {Object} filters - Filter criteria
 * @param {string} [filters.search=''] - Text search (name, description)
 * @param {string} [filters.genre=''] - Genre filter
 * @param {string} [filters.zone=''] - Geographic zone filter
 * @returns {Array<Object>} Filtered artists
 */
export function filterArtists(artists, { search = '', genre = '', zone = '' } = {}) {
  const searchLower = search.toLowerCase().trim();

  return artists.filter(artist => {
    // Text search
    if (searchLower) {
      const nameMatch = artist.name.toLowerCase().includes(searchLower);
      const descMatch = (artist.description || '').toLowerCase().includes(searchLower);
      const genreMatch = (artist.genre || []).some(g => g.toLowerCase().includes(searchLower));
      if (!nameMatch && !descMatch && !genreMatch) return false;
    }

    // Genre filter
    if (genre) {
      const hasGenre = (artist.genre || []).some(g =>
        g.toLowerCase() === genre.toLowerCase()
      );
      if (!hasGenre) return false;
    }

    // Zone filter
    if (zone && artist.zone !== zone) return false;

    return true;
  });
}

/**
 * Filters events by search text, genre, zone, date range, and category.
 * @param {Array<Object>} events - Array of event objects
 * @param {Object} filters - Filter criteria
 * @param {string} [filters.search=''] - Text search
 * @param {string} [filters.genre=''] - Genre filter
 * @param {string} [filters.zone=''] - Zone filter
 * @param {string} [filters.dateFrom=''] - Start date (YYYY-MM-DD)
 * @param {string} [filters.dateTo=''] - End date (YYYY-MM-DD)
 * @param {string} [filters.category=''] - Event category (concert, festival, festa popular)
 * @returns {Array<Object>} Filtered events
 */
export function filterEvents(events, { search = '', genre = '', zone = '', dateFrom = '', dateTo = '', category = '' } = {}) {
  const searchLower = search.toLowerCase().trim();

  return events.filter(event => {
    // Text search
    if (searchLower) {
      const nameMatch = event.name.toLowerCase().includes(searchLower);
      const descMatch = (event.description || '').toLowerCase().includes(searchLower);
      const locationMatch = event.location?.name?.toLowerCase().includes(searchLower) || false;
      const performerMatch = getPerformerNames(event).toLowerCase().includes(searchLower);
      if (!nameMatch && !descMatch && !locationMatch && !performerMatch) return false;
    }

    // Genre filter
    if (genre) {
      const hasGenre = (event.genre || []).some(g =>
        g.toLowerCase() === genre.toLowerCase()
      );
      if (!hasGenre) return false;
    }

    // Zone filter
    if (zone && event.zone !== zone) return false;

    // Date range
    if (dateFrom) {
      const eventDate = new Date(event.startDate);
      const from = new Date(dateFrom);
      if (eventDate < from) return false;
    }
    if (dateTo) {
      const eventDate = new Date(event.startDate);
      const to = new Date(dateTo + 'T23:59:59');
      if (eventDate > to) return false;
    }

    // Category filter
    if (category && event.category !== category) return false;

    return true;
  });
}

/**
 * Extracts performer names from an event as a comma-separated string.
 * @param {Object} event
 * @returns {string}
 */
function getPerformerNames(event) {
  if (!event.performer) return '';
  if (Array.isArray(event.performer)) {
    return event.performer.map(p => p.name).join(', ');
  }
  return event.performer.name || '';
}

/**
 * Extracts unique genres from a list of items.
 * @param {Array<Object>} items - Items with a genre array property
 * @returns {string[]} Sorted unique genres
 */
export function getUniqueGenres(items) {
  const genres = new Set();
  items.forEach(item => {
    (item.genre || []).forEach(g => genres.add(g));
  });
  return [...genres].sort();
}

/**
 * Extracts unique zones from a list of items.
 * @param {Array<Object>} items - Items with a zone property
 * @returns {string[]} Sorted unique zones
 */
export function getUniqueZones(items) {
  const zones = new Set();
  items.forEach(item => {
    if (item.zone) zones.add(item.zone);
  });
  return [...zones].sort();
}

/**
 * Extracts unique categories from events.
 * @param {Array<Object>} events
 * @returns {string[]}
 */
export function getUniqueCategories(events) {
  const cats = new Set();
  events.forEach(e => {
    if (e.category) cats.add(e.category);
  });
  return [...cats].sort();
}

/**
 * Sorts events by start date (ascending).
 * @param {Array<Object>} events
 * @returns {Array<Object>}
 */
export function sortEventsByDate(events) {
  return [...events].sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
}

/**
 * Returns events happening this weekend (Friday-Sunday).
 * @param {Array<Object>} events
 * @returns {Array<Object>}
 */
export function getWeekendEvents(events) {
  const now = new Date();
  const dayOfWeek = now.getDay();

  // Calculate next Friday (or today if it is Friday-Sunday)
  let fridayOffset = 5 - dayOfWeek;
  if (fridayOffset < 0) fridayOffset += 7;
  if (dayOfWeek >= 5 || dayOfWeek === 0) fridayOffset = dayOfWeek === 0 ? -2 : -(dayOfWeek - 5);

  const friday = new Date(now);
  friday.setDate(now.getDate() + fridayOffset);
  friday.setHours(0, 0, 0, 0);

  const monday = new Date(friday);
  monday.setDate(friday.getDate() + 3);

  return events.filter(event => {
    const eventDate = new Date(event.startDate);
    return eventDate >= friday && eventDate < monday;
  });
}

/**
 * Returns upcoming events (from today onwards).
 * @param {Array<Object>} events
 * @returns {Array<Object>}
 */
export function getUpcomingEvents(events) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return events.filter(event => new Date(event.startDate) >= now);
}
