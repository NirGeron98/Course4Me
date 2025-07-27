// Cache utility functions for Course4Me
// Centralized cache management for better performance

export class CacheManager {
  constructor(prefix = 'course4me_', defaultDuration = 5 * 60 * 1000) {
    this.prefix = prefix;
    this.defaultDuration = defaultDuration;
  }

  // Generate cache key with prefix
  getCacheKey(key) {
    return `${this.prefix}${key}`;
  }

  // Check if cache is valid
  isCacheValid(key, customDuration = null) {
    const timestampKey = this.getCacheKey(`${key}_timestamp`);
    const timestamp = localStorage.getItem(timestampKey);
    if (!timestamp) return false;
    
    const duration = customDuration || this.defaultDuration;
    return Date.now() - parseInt(timestamp) < duration;
  }

  // Save data to cache with timestamp
  saveToCache(key, data, customDuration = null) {
    try {
      const cacheKey = this.getCacheKey(key);
      const timestampKey = this.getCacheKey(`${key}_timestamp`);
      
      localStorage.setItem(cacheKey, JSON.stringify(data));
      localStorage.setItem(timestampKey, Date.now().toString());
      
      // Set expiration for cleanup
      if (customDuration) {
        const expirationKey = this.getCacheKey(`${key}_expiration`);
        localStorage.setItem(expirationKey, (Date.now() + customDuration).toString());
      }
      
      return true;
    } catch (error) {
      // Storage full or disabled
      this.clearOldCache(); // Try to make space
      return false;
    }
  }

  // Get data from cache
  getFromCache(key) {
    try {
      const cacheKey = this.getCacheKey(key);
      const data = localStorage.getItem(cacheKey);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      // Invalid JSON or other error
      this.removeFromCache(key);
      return null;
    }
  }

  // Remove specific item from cache
  removeFromCache(key) {
    const cacheKey = this.getCacheKey(key);
    const timestampKey = this.getCacheKey(`${key}_timestamp`);
    const expirationKey = this.getCacheKey(`${key}_expiration`);
    
    localStorage.removeItem(cacheKey);
    localStorage.removeItem(timestampKey);
    localStorage.removeItem(expirationKey);
  }

  // Clear all cache with this prefix
  clearAllCache() {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.prefix)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }

  // Clear expired cache entries
  clearOldCache() {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.prefix) && key.endsWith('_expiration')) {
        const expiration = localStorage.getItem(key);
        if (expiration && Date.now() > parseInt(expiration)) {
          // This cache has expired
          const baseKey = key.replace(this.prefix, '').replace('_expiration', '');
          keysToRemove.push(
            this.getCacheKey(baseKey),
            this.getCacheKey(`${baseKey}_timestamp`),
            key
          );
        }
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }

  // Get cache size info
  getCacheInfo() {
    let totalSize = 0;
    let itemCount = 0;
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.prefix)) {
        const value = localStorage.getItem(key);
        totalSize += (key.length + (value ? value.length : 0)) * 2; // Rough size in bytes
        itemCount++;
      }
    }
    
    return {
      itemCount,
      totalSize: Math.round(totalSize / 1024) + ' KB' // Convert to KB
    };
  }
}

// Create default cache manager instance
export const dashboardCache = new CacheManager('dashboard_', 5 * 60 * 1000); // 5 minutes
export const courseCache = new CacheManager('course_', 10 * 60 * 1000); // 10 minutes
export const lecturerCache = new CacheManager('lecturer_', 10 * 60 * 1000); // 10 minutes

// Initialize cache cleanup on app start
export const initializeCacheCleanup = () => {
  // Clean old cache on load
  dashboardCache.clearOldCache();
  courseCache.clearOldCache();
  lecturerCache.clearOldCache();
  
  // Set up periodic cleanup every 30 minutes
  setInterval(() => {
    dashboardCache.clearOldCache();
    courseCache.clearOldCache();
    lecturerCache.clearOldCache();
  }, 30 * 60 * 1000);
};

// Clear all user-specific cache data
export const clearAllUserCache = () => {
  dashboardCache.clearAllCache();
  courseCache.clearAllCache();
  lecturerCache.clearAllCache();
  
  // Clear other user-specific cache
  const keysToRemove = [
    'my_reviews_data',
    'tracked_courses_data', 
    'tracked_lecturers_data',
    'contact_requests_data'
  ];
  
  keysToRemove.forEach(key => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`שגיאה בניקוי מטמון ${key}:`, error);
    }
  });
};
