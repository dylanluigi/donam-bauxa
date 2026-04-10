/**
 * @module solicituds
 * @description Handles the edit requests view for promotors.
 */

import { getAuthState } from './admin.js';

function showSolicitudsAlert(message, type) {
  const el = document.getElementById('solicitudsAlert');
  if (!el) return;
  el.className = `alert alert-${type} mb-4`;
  el.textContent = message;
  el.style.display = 'block';
  if (type === 'success') setTimeout(() => { el.style.display = 'none'; }, 5000);
}

async function apiFetch(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error desconegut');
  return data;
}

const statusLabels = {
  'https://schema.org/PotentialActionStatus': '<span class="badge bg-warning">Pendent</span>',
  'https://schema.org/CompletedActionStatus': '<span class="badge bg-success">Aprovada</span>',
  'https://schema.org/FailedActionStatus': '<span class="badge bg-danger">Rebutjada</span>'
};

async function loadMyRequests() {
  const container = document.getElementById('solicitudsList');
  if (!container) return;

  try {
    const data = await apiFetch('/api/requests');
    const items = data.itemListElement || [];

    if (!items.length) {
      container.innerHTML = '<p class="text-muted">No tens solicituds enviades.</p>';
      return;
    }

    let html = '';
    for (const el of items) {
      const req = el.item;
      const entityType = req.instrument?.description || '-';
      const actionLabel = req['@type'] === 'CreateAction' ? 'Crear' : 'Editar';
      const date = req.startTime ? new Date(req.startTime).toLocaleDateString('ca') : '-';

      html += `
        <div class="card-bauxa mb-3" style="padding:1rem;">
          <div class="d-flex justify-content-between align-items-start">
            <div>
              <strong>${actionLabel} ${entityType}</strong>
              <p class="small text-muted mb-1">${req.description || ''}</p>
              <small class="text-muted">${date}</small>
            </div>
            <div>${statusLabels[req.actionStatus] || '-'}</div>
          </div>
        </div>`;
    }
    container.innerHTML = html;
  } catch (err) {
    showSolicitudsAlert(`Error carregant solicituds: ${err.message}`, 'danger');
  }
}

async function loadEntityOptions(entityType) {
  const select = document.getElementById('requestEntitySelect');
  if (!select) return;

  select.innerHTML = '<option value="">Selecciona...</option>';

  try {
    const res = await fetch(`data/${entityType === 'artist' ? 'artists' : entityType === 'event' ? 'events' : 'news'}.json`);
    const data = await res.json();

    for (const el of data.itemListElement || []) {
      const item = el.item;
      const name = item.name || item.headline || item['@id'];
      select.innerHTML += `<option value="${item['@id']}">${name}</option>`;
    }
  } catch {
    // Silent fail
  }
}

export async function initSolicituds() {
  const auth = getAuthState();
  const notAuth = document.getElementById('solicitudsNotAuth');
  const content = document.getElementById('solicitudsContent');

  const role = auth?.profile?.role;
  if (!auth?.authenticated || (role !== 'promotor' && role !== 'admin')) {
    if (notAuth) notAuth.style.display = 'block';
    if (content) content.style.display = 'none';
    return;
  }

  if (notAuth) notAuth.style.display = 'none';
  if (content) content.style.display = 'block';

  loadMyRequests();

  const formWrapper = document.getElementById('newRequestForm');
  const newBtn = document.getElementById('newRequestBtn');
  const cancelBtn = document.getElementById('cancelRequestBtn');

  newBtn?.addEventListener('click', () => {
    if (formWrapper) formWrapper.style.display = 'block';
  });

  cancelBtn?.addEventListener('click', () => {
    if (formWrapper) formWrapper.style.display = 'none';
    document.getElementById('requestForm')?.reset();
  });

  // Show entity select when action is 'update'
  const actionSelect = document.getElementById('requestAction');
  const entityTypeSelect = document.getElementById('requestEntityType');
  const entitySelectWrapper = document.getElementById('requestEntitySelectWrapper');

  actionSelect?.addEventListener('change', () => {
    const isUpdate = actionSelect.value === 'update';
    if (entitySelectWrapper) entitySelectWrapper.style.display = isUpdate ? '' : 'none';
    if (isUpdate && entityTypeSelect?.value) {
      loadEntityOptions(entityTypeSelect.value);
    }
  });

  entityTypeSelect?.addEventListener('change', () => {
    if (actionSelect?.value === 'update' && entityTypeSelect.value) {
      loadEntityOptions(entityTypeSelect.value);
    }
  });

  // Form submit
  document.getElementById('requestForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const entityType = entityTypeSelect?.value;
    const action = actionSelect?.value;
    const entityId = action === 'update' ? document.getElementById('requestEntitySelect')?.value : null;
    const description = document.getElementById('requestDescription')?.value?.trim();
    const dataStr = document.getElementById('requestData')?.value?.trim();

    let proposedData;
    try {
      proposedData = JSON.parse(dataStr);
    } catch {
      showSolicitudsAlert('El JSON de les dades proposades no es valid', 'danger');
      return;
    }

    try {
      await apiFetch('/api/requests', {
        method: 'POST',
        body: JSON.stringify({ entityType, entityId, action, proposedData, description })
      });
      showSolicitudsAlert('Solicitud enviada correctament', 'success');
      document.getElementById('requestForm')?.reset();
      if (formWrapper) formWrapper.style.display = 'none';
      loadMyRequests();
    } catch (err) {
      showSolicitudsAlert(err.message, 'danger');
    }
  });
}
