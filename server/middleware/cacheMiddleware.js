/**
 * Performance: HTTP cache headers for public GET list endpoints.
 * Enables browser/CDN caching without server-side cache store.
 * TTL is short to balance freshness and load reduction.
 */
const CACHE_TTL_PUBLIC_LIST = 60; // seconds

function addCacheHeaders(ttlSeconds = CACHE_TTL_PUBLIC_LIST) {
  return (req, res, next) => {
    if (req.method === "GET") {
      res.set("Cache-Control", `public, max-age=${ttlSeconds}`);
    }
    next();
  };
}

module.exports = { addCacheHeaders };
