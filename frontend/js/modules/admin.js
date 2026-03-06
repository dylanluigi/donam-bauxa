/**
 * @module admin
 * @description Handles admin authentication state and artist form submission.
 */

/** @type {{ authenticated: boolean, user: Object|null, isAdmin: boolean }|null} */
let authState = null;

/**
 * Checks authentication status with the server.
 * Updates the navbar auth link and admin nav visibility.
 */
export async function checkAuth() {
  try {
    const res = await fetch('/auth/me');
    authState = await res.json();
  } catch {
    authState = { authenticated: false, user: null, isAdmin: false };
  }

  // Update navbar
  const authLink = document.getElementById('authLink');
  const authLabel = document.getElementById('authLabel');
  const adminNavItem = document.getElementById('adminNavItem');

  if (authState.authenticated) {
    if (authLink) authLink.href = '/auth/logout';
    if (authLabel) authLabel.textContent = 'Logout';
    if (adminNavItem && authState.isAdmin) adminNavItem.style.display = '';
  } else {
    if (authLink) authLink.href = '/auth/google';
    if (authLabel) authLabel.textContent = 'Login';
    if (adminNavItem) adminNavItem.style.display = 'none';
  }
}

/**
 * Collects form data and builds a preview object.
 * @returns {Object} Artist data ready to POST
 */
function collectFormData() {
  const genres = document.getElementById('artistGenres').value
    .split(',').map(g => g.trim()).filter(Boolean);

  const members = document.getElementById('artistMembers').value
    .split(',').map(m => m.trim()).filter(Boolean);

  const albums = [];
  document.querySelectorAll('.album-row').forEach(row => {
    const name = row.querySelector('.album-name')?.value?.trim();
    const year = row.querySelector('.album-year')?.value?.trim();
    if (name) albums.push({ name, year });
  });

  return {
    name: document.getElementById('artistName').value.trim(),
    description: document.getElementById('artistDescription').value.trim(),
    genre: genres,
    foundingDate: document.getElementById('artistFoundingDate').value.trim() || undefined,
    locationName: document.getElementById('artistLocation').value.trim() || undefined,
    areaServed: document.getElementById('artistZone').value || undefined,
    spotifyUrl: document.getElementById('artistSpotify').value.trim() || undefined,
    instagramUrl: document.getElementById('artistInstagram').value.trim() || undefined,
    wikipediaUrl: document.getElementById('artistWikipedia').value.trim() || undefined,
    image: document.getElementById('artistImage').value.trim() || undefined,
    featured: document.getElementById('artistFeatured').checked,
    members: members.length > 0 ? members : undefined,
    albums: albums.length > 0 ? albums : undefined
  };
}

/**
 * Updates the JSON preview panel.
 */
function updatePreview() {
  const preview = document.getElementById('jsonPreview');
  if (!preview) return;
  const data = collectFormData();
  // Remove undefined fields for clean preview
  const clean = JSON.parse(JSON.stringify(data));
  preview.textContent = JSON.stringify(clean, null, 2);
}

/**
 * Shows an alert message in the admin panel.
 * @param {string} message
 * @param {'success'|'danger'} type
 */
function showAlert(message, type) {
  const el = document.getElementById('adminAlert');
  if (!el) return;
  el.className = `alert alert-${type} mb-4`;
  el.textContent = message;
  el.style.display = 'block';
  if (type === 'success') {
    setTimeout(() => { el.style.display = 'none'; }, 5000);
  }
}

/**
 * Initializes the admin view: checks auth, binds form events.
 */
export async function initAdmin() {
  await checkAuth();

  const notAuth = document.getElementById('adminNotAuth');
  const content = document.getElementById('adminContent');

  if (!authState?.authenticated || !authState?.isAdmin) {
    if (notAuth) notAuth.style.display = 'block';
    if (content) content.style.display = 'none';
    return;
  }

  if (notAuth) notAuth.style.display = 'none';
  if (content) content.style.display = 'block';

  // Add album row button
  document.getElementById('addAlbumRow')?.addEventListener('click', () => {
    const container = document.getElementById('albumsContainer');
    if (!container) return;
    const row = document.createElement('div');
    row.className = 'row g-2 mb-2 album-row';
    row.innerHTML = `
      <div class="col-7">
        <input type="text" class="form-control form-control-bauxa form-control-sm album-name" placeholder="Nom de l'album">
      </div>
      <div class="col-3">
        <input type="text" class="form-control form-control-bauxa form-control-sm album-year" placeholder="Any" pattern="[0-9]{4}" maxlength="4">
      </div>
      <div class="col-2">
        <button type="button" class="btn btn-sm btn-bauxa-outline w-100 remove-album"><i class="bi bi-x"></i></button>
      </div>`;
    container.appendChild(row);
    row.querySelector('.remove-album')?.addEventListener('click', () => row.remove());
  });

  // Live JSON preview
  const formInputs = document.querySelectorAll('#addArtistForm input, #addArtistForm textarea, #addArtistForm select');
  formInputs.forEach(input => {
    input.addEventListener('input', updatePreview);
    input.addEventListener('change', updatePreview);
  });
  updatePreview();

  // Form submission
  document.getElementById('addArtistForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('submitArtist');
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="bi bi-hourglass-split"></i> Afegint...'; }

    try {
      const data = collectFormData();
      const res = await fetch('/api/artists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await res.json();

      if (!res.ok) {
        showAlert(result.error || 'Error desconegut', 'danger');
        return;
      }

      showAlert(`Artista "${result.artist.name}" afegit correctament! (${result.id})`, 'success');
      document.getElementById('addArtistForm')?.reset();
      updatePreview();

    } catch (err) {
      showAlert('Error de connexio amb el servidor: ' + err.message, 'danger');
    } finally {
      if (btn) { btn.disabled = false; btn.innerHTML = '<i class="bi bi-plus-lg"></i> Afegir Artista'; }
    }
  });
}
