import { Router } from 'express';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readJSON, writeJSONSafe, generateId } from '../helpers/json.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REQUESTS_PATH = join(__dirname, '..', 'server-data', 'edit_requests.json');
const DATA_DIR = join(__dirname, '..', 'frontend', 'data');

const CONTENT_PATHS = {
  artist: join(DATA_DIR, 'artists.json'),
  event: join(DATA_DIR, 'events.json'),
  news: join(DATA_DIR, 'news.json')
};

const router = Router();

// POST /api/requests — create edit request (promotor or admin)
router.post('/', requireRole('promotor', 'admin'), async (req, res) => {
  try {
    const { entityType, entityId, action, proposedData, description } = req.body;

    if (!['artist', 'event', 'news'].includes(entityType)) {
      return res.status(400).json({ error: 'entityType invàlid (artist, event, news)' });
    }
    if (!['create', 'update'].includes(action)) {
      return res.status(400).json({ error: 'action invàlida (create, update)' });
    }
    if (!proposedData || !description) {
      return res.status(400).json({ error: 'Falten camps obligatoris: proposedData, description' });
    }

    // For updates, get current data snapshot
    let currentObject = null;
    if (action === 'update' && entityId) {
      const contentData = readJSON(CONTENT_PATHS[entityType]);
      const existing = contentData.itemListElement.find(el => el.item['@id'] === entityId);
      if (!existing) {
        return res.status(404).json({ error: 'Entitat no trobada' });
      }
      currentObject = existing.item;
    }

    const actionType = action === 'create' ? 'CreateAction' : 'UpdateAction';

    let newRequest;
    await writeJSONSafe(REQUESTS_PATH, async (data) => {
      const { id, position } = generateId('request', data.itemListElement);

      const requestItem = {
        '@context': 'https://schema.org',
        '@type': actionType,
        '@id': id,
        agent: {
          '@type': 'Person',
          '@id': req.userProfile['@id'],
          name: req.userProfile.name,
          email: req.userProfile.email
        },
        actionStatus: 'https://schema.org/PotentialActionStatus',
        object: currentObject || {
          '@type': 'Thing',
          name: entityType,
          description: `Nova entitat de tipus ${entityType}`
        },
        result: proposedData,
        description,
        startTime: new Date().toISOString(),
        endTime: null,
        instrument: {
          '@type': 'Thing',
          name: 'entityType',
          description: entityType
        }
      };

      if (entityId) {
        requestItem.object['@id'] = entityId;
      }

      data.itemListElement.push({
        '@type': 'ListItem',
        position,
        item: requestItem
      });
      data.numberOfItems = data.itemListElement.length;
      newRequest = requestItem;
    });

    res.status(201).json({ success: true, request: newRequest });
  } catch (err) {
    console.error('[requests] POST error:', err);
    res.status(500).json({ error: err.message || 'Error intern del servidor' });
  }
});

// GET /api/requests — promotor sees own, admin sees all
router.get('/', requireRole('promotor', 'admin'), (req, res) => {
  const data = readJSON(REQUESTS_PATH);
  const { status } = req.query;

  let items = data.itemListElement;

  // Promotors only see their own requests
  if (req.userProfile.jobTitle === 'promotor') {
    items = items.filter(el => el.item.agent['@id'] === req.userProfile['@id']);
  }

  // Filter by status if provided
  if (status) {
    const statusMap = {
      pending: 'https://schema.org/PotentialActionStatus',
      approved: 'https://schema.org/CompletedActionStatus',
      rejected: 'https://schema.org/FailedActionStatus'
    };
    const schemaStatus = statusMap[status];
    if (schemaStatus) {
      items = items.filter(el => el.item.actionStatus === schemaStatus);
    }
  }

  res.json({
    ...data,
    itemListElement: items,
    numberOfItems: items.length
  });
});

// GET /api/requests/:id — single request detail
router.get('/:id', requireRole('promotor', 'admin'), (req, res) => {
  const data = readJSON(REQUESTS_PATH);
  const item = data.itemListElement.find(el => el.item['@id'] === req.params.id);

  if (!item) {
    return res.status(404).json({ error: 'Solicitud no trobada' });
  }

  // Promotors can only see their own
  if (req.userProfile.jobTitle === 'promotor' &&
      item.item.agent['@id'] !== req.userProfile['@id']) {
    return res.status(403).json({ error: 'No autoritzat' });
  }

  res.json({ request: item.item });
});

// PUT /api/admin/requests/:id/approve — approve and apply changes
router.put('/:id/approve', requireRole('admin'), async (req, res) => {
  const requestsData = readJSON(REQUESTS_PATH);
  const requestItem = requestsData.itemListElement.find(
    el => el.item['@id'] === req.params.id
  );

  if (!requestItem) {
    return res.status(404).json({ error: 'Solicitud no trobada' });
  }

  if (requestItem.item.actionStatus !== 'https://schema.org/PotentialActionStatus') {
    return res.status(400).json({ error: 'Aquesta solicitud ja ha estat processada' });
  }

  const request = requestItem.item;
  const entityType = request.instrument.description;
  const contentPath = CONTENT_PATHS[entityType];

  if (!contentPath) {
    return res.status(400).json({ error: `Tipus d'entitat desconegut: ${entityType}` });
  }

  // Apply the proposed changes to the content file
  const isCreate = request['@type'] === 'CreateAction';

  await writeJSONSafe(contentPath, async (contentData) => {
    if (isCreate) {
      const prefix = entityType === 'artist' ? 'artist' : entityType === 'event' ? 'event' : 'news';
      const { id, position } = generateId(prefix, contentData.itemListElement);
      const newItem = { ...request.result, '@id': id };
      contentData.itemListElement.push({
        '@type': 'ListItem',
        position,
        item: newItem
      });
      contentData.numberOfItems = contentData.itemListElement.length;
    } else {
      // Update existing entity
      const entityId = request.object['@id'];
      const existing = contentData.itemListElement.find(el => el.item['@id'] === entityId);
      if (existing) {
        existing.item = { ...request.result, '@id': entityId };
      }
    }
  });

  // Mark request as approved
  await writeJSONSafe(REQUESTS_PATH, async (data) => {
    const item = data.itemListElement.find(el => el.item['@id'] === req.params.id);
    if (item) {
      item.item.actionStatus = 'https://schema.org/CompletedActionStatus';
      item.item.endTime = new Date().toISOString();
    }
  });

  res.json({ success: true, message: 'Solicitud aprovada i canvis aplicats' });
});

// PUT /api/admin/requests/:id/reject — reject with notes
router.put('/:id/reject', requireRole('admin'), async (req, res) => {
  const { notes } = req.body;

  let found = false;
  await writeJSONSafe(REQUESTS_PATH, async (data) => {
    const item = data.itemListElement.find(el => el.item['@id'] === req.params.id);
    if (!item) return;

    if (item.item.actionStatus !== 'https://schema.org/PotentialActionStatus') {
      return;
    }

    item.item.actionStatus = 'https://schema.org/FailedActionStatus';
    item.item.endTime = new Date().toISOString();
    if (notes) {
      item.item.instrument = {
        ...item.item.instrument,
        additionalProperty: [{
          '@type': 'PropertyValue',
          name: 'reviewerNotes',
          value: notes
        }]
      };
    }
    found = true;
  });

  if (!found) {
    return res.status(404).json({ error: 'Solicitud no trobada o ja processada' });
  }
  res.json({ success: true, message: 'Solicitud rebutjada' });
});

export default router;
