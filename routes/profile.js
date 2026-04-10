import { Router } from 'express';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readJSON, writeJSONSafe } from '../helpers/json.js';
import { requireAuth } from '../middleware/auth.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const USERS_PATH = join(__dirname, '..', 'server-data', 'users.json');

const router = Router();

// GET /api/profile — retorna perfil propi
router.get('/', requireAuth, (req, res) => {
  res.json({ profile: req.userProfile });
});

// PUT /api/profile — actualitza displayName, bio
router.put('/', requireAuth, async (req, res) => {
  const { displayName, description } = req.body;
  const userId = req.userProfile['@id'];

  await writeJSONSafe(USERS_PATH, async (data) => {
    const userItem = data.itemListElement.find(el => el.item['@id'] === userId);
    if (!userItem) return;

    if (displayName !== undefined) {
      const prop = userItem.item.additionalProperty.find(p => p.name === 'displayName');
      if (prop) {
        prop.value = displayName;
      } else {
        userItem.item.additionalProperty.push({
          '@type': 'PropertyValue',
          name: 'displayName',
          value: displayName
        });
      }
    }

    if (description !== undefined) {
      userItem.item.description = description;
    }
  });

  const users = readJSON(USERS_PATH);
  const updated = users.itemListElement.find(el => el.item['@id'] === userId);
  res.json({ profile: updated.item });
});

export default router;
