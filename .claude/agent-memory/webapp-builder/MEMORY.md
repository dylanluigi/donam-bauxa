# Dona'm Bauxa - Project Memory

## Project Overview
- **App**: "Dona'm Bauxa" - Mallorca music & events discovery platform
- **Course**: UIB Tecnologia Multimedia
- **Authors**: Josep Ferriol Font, Dylan Luigi Canning Garcia
- **Language**: Catalan (ca) with some Spanish

## Architecture
- **SPA**: Single-page application with hash-based routing (#home, #artists, #events, #map, #favorits)
- Structure: `frontend/` (static site) and `backend/` (unused)
- No build tools needed; pure static site served with any HTTP server
- ES6 modules loaded via `<script type="module">`

## Tech Stack
- Bootstrap 5.3.3 (CDN), Bootstrap Icons 1.11.3
- Leaflet 1.9.4 for maps
- Google Fonts: Playfair Display (headings), Inter (body)
- Vanilla JS with ES6 modules, no frameworks

## File Structure
- `frontend/index.html` - Single HTML file with all views (data-view sections)
- `frontend/css/main.css` - All styles (single file, BEM-inspired)
- `frontend/js/app.js` - Unified SPA entry point
- `frontend/js/router.js` - Hash-based SPA router
- `frontend/js/modules/` - Shared modules (dataLoader, renderer, filters, favorites, calendar, mapModule, ui)
- `frontend/data/` - Schema.org JSON files (artists, events, news)

## SPA ID Namespacing (to avoid collisions)
- Artists filters: `searchArtists`, `artistsFilterGenre`, `artistsFilterZone`, `artistsClearFilters`, `artistsResultsCount`
- Events filters: `searchEvents`, `eventsFilterGenre`, `eventsFilterZone`, `eventsFilterCategory`, `eventsFilterDateFrom`, `eventsFilterDateTo`, `eventsClearFilters`, `eventsResultsCount`
- Map filters: `mapFilterZone`, `mapFilterCategory`, `mapClearFilters` (unchanged)

## Schema.org Types Used
- `ItemList` (wrapper), `MusicGroup`, `MusicEvent`, `NewsArticle`
- `Place`, `GeoCoordinates`, `PostalAddress`, `Offer`, `MusicAlbum`, `Person`

## Color Palette (CSS Variables)
- Primary: `#C45A3C` (terracotta)
- Secondary: `#1B4965` (Mediterranean blue)
- Accent: `#6B8E4E` (olive green)
- Gold: `#D4A843` (Mallorcan sunlight)
- Background: `#FDF8F3` (warm cream)

## Data
- 12 artists with Mallorcan music scene data
- 15 events across zones (Palma, Serra de Tramuntana, Raiguer, Pla, Llevant, Nord, Ponent)
- 6 news articles
- Zones: Palma, Serra de Tramuntana, Raiguer, Pla de Mallorca, Llevant, Nord, Ponent

## Key Features
- Favorites stored in localStorage (artists + events)
- Calendar .ics file download for events
- Leaflet map with color-coded markers by category
- Genre/zone/date/category filters on all pages
- Spotify embeds via iframe in artist detail modals
- SVG placeholders generated dynamically (no image files needed)

## Notes
- Assets folder contains only course PDFs, no app images
- All image placeholders are inline SVGs generated in renderer.js
- App must be served via HTTP server (not file://) due to ES modules and fetch()
