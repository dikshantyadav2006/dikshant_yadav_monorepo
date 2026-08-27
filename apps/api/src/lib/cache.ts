interface CacheEntry<T> {
  data: T;
  expiresAt: number;
  lastAccessed: number;
}

class LRUCache {
  private store = new Map<string, CacheEntry<any>>();
  private maxSize: number;
  private defaultTtl: number;

  constructor(maxSize = 500, defaultTtlMs = 60_000) {
    this.maxSize = maxSize;
    this.defaultTtl = defaultTtlMs;
  }

  get<T = any>(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    // Mark as recently accessed (delete + re-insert preserves Map order)
    entry.lastAccessed = Date.now();
    this.store.delete(key);
    this.store.set(key, entry);
    return entry.data as T;
  }

  set<T = any>(key: string, data: T, ttlMs?: number): void {
    // Evict LRU entry if at capacity
    if (this.store.size >= this.maxSize && !this.store.has(key)) {
      const oldest = this.store.keys().next().value;
      if (oldest) this.store.delete(oldest);
    }
    this.store.set(key, {
      data,
      expiresAt: Date.now() + (ttlMs ?? this.defaultTtl),
      lastAccessed: Date.now(),
    });
  }

  delete(key: string): boolean {
    return this.store.delete(key);
  }

  clear(pattern?: string): void {
    if (!pattern) {
      this.store.clear();
      return;
    }
    for (const key of this.store.keys()) {
      if (key.startsWith(pattern)) this.store.delete(key);
    }
  }

  has(key: string): boolean {
    const entry = this.store.get(key);
    if (!entry) return false;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return false;
    }
    return true;
  }

  get size(): number {
    return this.store.size;
  }
}

// Singleton LRU cache instance: max 500 entries, 60s default TTL
const cache = new LRUCache(500, 60_000);

export function getCached<T = any>(key: string): T | undefined {
  return cache.get<T>(key);
}

export function setCache<T = any>(key: string, data: T, ttlMs?: number): void {
  cache.set(key, data, ttlMs);
}

export function clearCache(pattern?: string): void {
  cache.clear(pattern);
}

export function hasCache(key: string): boolean {
  return cache.has(key);
}
