import { Router } from 'express';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readJSON, writeJSONSafe } from '../helpers/json.js';
import { requireRole } from '../middleware/auth.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const USERS_PATH = join(__dirname, '..', 'server-data', 'users.json');

const router = Router();

// GET /api/admin/users — list all users
router.get('/', requireRole('admin'), (_req, res) => {
  const data = readJSON(USERS_PATH);
  res.json(data);
});

// PUT /api/admin/users/:id/role — change user role
router.put('/:id/role', requireRole('admin'), async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  const validRoles = ['lector', 'promotor', 'admin'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ error: `Rol invàlid. Rols vàlids: ${validRoles.join(', ')}` });
  }

  let updatedUser;
  await writeJSONSafe(USERS_PATH, async (data) => {
    const userItem = data.itemListElement.find(el => el.item['@id'] === id);
    if (!userItem) return;
    userItem.item.jobTitle = role;
    updatedUser = userItem.item;
  });

  if (!updatedUser) {
    return res.status(404).json({ error: 'Usuari no trobat' });
  }
  res.json({ success: true, user: updatedUser });
});

// DELETE /api/admin/users/:id — delete user
router.delete('/:id', requireRole('admin'), async (req, res) => {
  const { id } = req.params;

  // Prevent self-deletion
  if (req.userProfile['@id'] === id) {
    return res.status(400).json({ error: 'No pots eliminar-te a tu mateix' });
  }

  let found = false;
  await writeJSONSafe(USERS_PATH, async (data) => {
    const index = data.itemListElement.findIndex(el => el.item['@id'] === id);
    if (index === -1) return;
    data.itemListElement.splice(index, 1);
    data.numberOfItems = data.itemListElement.length;
    data.itemListElement.forEach((el, i) => { el.position = i + 1; });
    found = true;
  });

  if (!found) {
    return res.status(404).json({ error: 'Usuari no trobat' });
  }
  res.json({ success: true });
});

export default router;
