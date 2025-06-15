// src/utils/cache.js
const cache = new Map();

export function setCache(key, data, ttlMs = 10 * 60 * 1000) {
    const expiresAt = Date.now() + ttlMs;
    cache.set(key, { data, expiresAt });
}

export function getCache(key) {
    const cached = cache.get(key);
    if (!cached) return null;
    if (Date.now() > cached.expiresAt) {
        cache.delete(key);
        return null;
    }
    return cached.data;
}
