/**
 * In-memory cache for heavy list endpoints (courses, lecturers).
 * What: serialized JSON response for GET list APIs.
 * Where: process memory (Map). For multi-instance deploy use Redis (see PERF_OPTIMIZATIONS.md).
 * TTL: 2 minutes; invalidation on create/update/delete.
 */
const TTL_MS = 2 * 60 * 1000;
const store = new Map();

function get(key) {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expires) {
    store.delete(key);
    return null;
  }
  return entry.data;
}

function set(key, data, ttlMs = TTL_MS) {
  store.set(key, { data, expires: Date.now() + ttlMs });
}

function clearByPrefix(prefix) {
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) store.delete(key);
  }
}

function clearAll() {
  store.clear();
}

module.exports = { get, set, clearByPrefix, clearAll };
