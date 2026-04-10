import { readFileSync, writeFileSync } from 'fs';

// Simple in-memory lock to prevent concurrent writes to the same file
const locks = {};

async function withLock(filePath, fn) {
  while (locks[filePath]) await new Promise(r => setTimeout(r, 50));
  locks[filePath] = true;
  try {
    return await fn();
  } finally {
    locks[filePath] = false;
  }
}

export function readJSON(filePath) {
  return JSON.parse(readFileSync(filePath, 'utf-8'));
}

export function writeJSON(filePath, data) {
  writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

export async function writeJSONSafe(filePath, updateFn) {
  return withLock(filePath, async () => {
    const data = readJSON(filePath);
    const result = await updateFn(data);
    writeJSON(filePath, data);
    return result;
  });
}

export function generateId(prefix, items) {
  const maxPos = items.reduce((max, el) => Math.max(max, el.position || 0), 0);
  return { id: `${prefix}-${maxPos + 1}`, position: maxPos + 1 };
}
