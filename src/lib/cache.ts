/**
 * Simple in-memory cache for API responses and agent results
 * For production, consider Redis or Vercel KV
 */

type CacheEntry = {
  data: any;
  timestamp: number;
};

const cache = new Map<string, CacheEntry>();
const DEFAULT_TTL = 60 * 1000; // 1 minute

/**
 * Get cached value if not expired
 */
export function getCached<T>(key: string, ttl: number = DEFAULT_TTL): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  
  if (Date.now() - entry.timestamp > ttl) {
    cache.delete(key);
    return null;
  }
  
  return entry.data as T;
}

/**
 * Set cache value
 */
export function setCache<T>(key: string, data: T): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
  });
}

/**
 * Invalidate cache entries matching pattern
 */
export function invalidateCache(pattern: string): void {
  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key);
    }
  }
}

/**
 * Clear all cache
 */
export function clearCache(): void {
  cache.clear();
}

/**
 * Wrapper for caching async function results
 */
export async function withCache<T>(
  key: string,
  fn: () => Promise<T>,
  ttl: number = DEFAULT_TTL
): Promise<T> {
  const cached = getCached<T>(key, ttl);
  if (cached !== null) {
    console.log(`[Cache HIT] ${key}`);
    return cached;
  }
  
  console.log(`[Cache MISS] ${key}`);
  const result = await fn();
  setCache(key, result);
  
  return result;
}
