import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '')
  .split(',')
  .map(e => e.trim().toLowerCase())
  .filter(Boolean);

const ARTISTS_PATH = join(__dirname, 'frontend', 'data', 'artists.json');

// --- Passport setup ---

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/auth/google/callback'
}, (_accessToken, _refreshToken, profile, done) => {
  const email = profile.emails?.[0]?.value?.toLowerCase() || '';
  done(null, { id: profile.id, name: profile.displayName, email });
}));

// --- Middleware ---

const isProduction = process.env.NODE_ENV === 'production';

if (isProduction) {
  app.set('trust proxy', 1); // Trust reverse proxy (nginx, Cloudflare, etc.)
}

app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 24h
    secure: isProduction,         // HTTPS only in production
    sameSite: 'lax'
  }
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());

// Serve static frontend
app.use(express.static(join(__dirname, 'frontend')));

// --- Auth routes ---

app.get('/auth/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/#home' }),
  (_req, res) => res.redirect('/#admin')
);

app.get('/auth/logout', (req, res) => {
  req.logout(() => res.redirect('/#home'));
});

app.get('/auth/me', (req, res) => {
  if (!req.user) return res.json({ authenticated: false });
  const isAdmin = ADMIN_EMAILS.includes(req.user.email);
  res.json({ authenticated: true, user: req.user, isAdmin });
});

// --- Admin API ---

function requireAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'No autenticat' });
  if (!ADMIN_EMAILS.includes(req.user.email)) {
    return res.status(403).json({ error: 'No autoritzat' });
  }
  next();
}

app.get('/api/artists', requireAdmin, (_req, res) => {
  const data = JSON.parse(readFileSync(ARTISTS_PATH, 'utf-8'));
  res.json(data);
});

app.post('/api/artists', requireAdmin, (req, res) => {
  const artist = req.body;

  // Validate required fields
  if (!artist.name || !artist.description || !Array.isArray(artist.genre) || artist.genre.length === 0) {
    return res.status(400).json({ error: 'Falten camps obligatoris: name, description, genre' });
  }

  // Read current data
  const data = JSON.parse(readFileSync(ARTISTS_PATH, 'utf-8'));
  const items = data.itemListElement || [];

  // Generate next position and ID
  const maxPos = items.reduce((max, el) => Math.max(max, el.position || 0), 0);
  const nextPos = maxPos + 1;
  const artistId = `artist-${nextPos}`;

  // Build Schema.org compliant entry
  const newItem = {
    "@type": "MusicGroup",
    "@id": artistId,
    "name": artist.name,
    "description": artist.description,
    "genre": artist.genre
  };

  if (artist.foundingDate) {
    newItem.foundingDate = artist.foundingDate;
  }

  if (artist.locationName) {
    newItem.foundingLocation = {
      "@type": "Place",
      "name": artist.locationName,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": artist.locationName,
        "addressRegion": "Mallorca"
      }
    };
  }

  if (artist.image) {
    newItem.image = artist.image;
  }

  // Build sameAs from provided URLs
  const sameAs = [];
  if (artist.spotifyUrl) sameAs.push(artist.spotifyUrl);
  if (artist.instagramUrl) sameAs.push(artist.instagramUrl);
  if (artist.wikipediaUrl) sameAs.push(artist.wikipediaUrl);
  if (sameAs.length > 0) newItem.sameAs = sameAs;

  // Members
  if (Array.isArray(artist.members) && artist.members.length > 0) {
    newItem.member = artist.members
      .filter(m => m.trim())
      .map(name => ({ "@type": "Person", "name": name.trim() }));
  }

  // Albums
  if (Array.isArray(artist.albums) && artist.albums.length > 0) {
    newItem.album = artist.albums
      .filter(a => a.name?.trim())
      .map(a => ({ "@type": "MusicAlbum", "name": a.name.trim(), "datePublished": a.year || '' }));
  }

  // Area served (zone)
  if (artist.areaServed) {
    newItem.areaServed = artist.areaServed;
  }

  // Additional properties (spotifyId, featured)
  const additionalProperty = [];
  if (artist.spotifyUrl) {
    const match = artist.spotifyUrl.match(/artist\/([a-zA-Z0-9]+)/);
    if (match) {
      additionalProperty.push({ "@type": "PropertyValue", "name": "spotifyId", "value": match[1] });
    }
  }
  additionalProperty.push({
    "@type": "PropertyValue",
    "name": "featured",
    "value": artist.featured === true
  });
  newItem.additionalProperty = additionalProperty;

  // Append to list
  const newListItem = {
    "@type": "ListItem",
    "position": nextPos,
    "item": newItem
  };

  data.itemListElement.push(newListItem);
  data.numberOfItems = data.itemListElement.length;

  // Write back
  writeFileSync(ARTISTS_PATH, JSON.stringify(data, null, 2), 'utf-8');

  res.status(201).json({ success: true, artist: newItem, id: artistId });
});

// --- Start ---

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Admin emails: ${ADMIN_EMAILS.join(', ') || '(none configured)'}`);
});
