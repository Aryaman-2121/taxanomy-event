/**
 * Copyright (c) 2025 Eventful India Marketing Services, India
 * All rights reserved.
 * 
 * Service: taxonomy
 * Port: 3201
 * Cache Adapter
 * Template: Eventzr Code Repository Template v1.0
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';

export interface CacheOptions {
  ttl?: number;
  compress?: boolean;
  namespace?: string;
}

@Injectable()
export class CacheAdapter {
  private readonly logger = new Logger(CacheAdapter.name);
  private client: RedisClientType;
  private readonly keyPrefix: string;
  private readonly defaultTTL: number;

  constructor(private readonly configService: ConfigService) {
    const cacheConfig = this.configService.get('cache');
    this.keyPrefix = cacheConfig.keyPrefix;
    this.defaultTTL = cacheConfig.defaultTTL;
    this.initializeClient();
  }

  /**
   * Initialize Redis client
   */
  private async initializeClient(): Promise<void> {
    const cacheConfig = this.configService.get('cache');
    
    try {
      this.client = createClient({
        socket: {
          host: cacheConfig.host,
          port: cacheConfig.port,
          connectTimeout: cacheConfig.connectTimeout,
        },
        password: cacheConfig.password,
        database: cacheConfig.db,
      });

      this.client.on('error', (error) => {
        this.logger.error('Redis client error', error);
      });

      this.client.on('connect', () => {
        this.logger.log('✅ Redis cache connected');
      });

      this.client.on('disconnect', () => {
        this.logger.warn('⚠️ Redis cache disconnected');
      });

      await this.client.connect();
    } catch (error) {
      this.logger.error('❌ Failed to initialize Redis client', error);
      throw error;
    }
  }

  /**
   * Set cache value
   */
  async set(key: string, value: any, options?: CacheOptions): Promise<void> {
    try {
      const fullKey = this.buildKey(key, options?.namespace);
      const serializedValue = JSON.stringify(value);
      const ttl = options?.ttl || this.defaultTTL;

      if (ttl > 0) {
        await this.client.setEx(fullKey, ttl, serializedValue);
      } else {
        await this.client.set(fullKey, serializedValue);
      }

      this.logger.debug('Cache set', { key: fullKey, ttl });
    } catch (error) {
      this.logger.error('Cache set failed', { key, error: (error as Error).message });
      // Don't throw error to avoid breaking main operations
    }
  }

  /**
   * Get cache value
   */
  async get<T>(key: string, options?: CacheOptions): Promise<T | null> {
    try {
      const fullKey = this.buildKey(key, options?.namespace);
      const value = await this.client.get(fullKey);

      if (!value) {
        this.logger.debug('Cache miss', { key: fullKey });
        return null;
      }

      const parsed = JSON.parse(value);
      this.logger.debug('Cache hit', { key: fullKey });
      return parsed as T;
    } catch (error) {
      this.logger.error('Cache get failed', { key, error: (error as Error).message });
      return null;
    }
  }

  /**
   * Delete cache value
   */
  async del(key: string, options?: CacheOptions): Promise<void> {
    try {
      const fullKey = this.buildKey(key, options?.namespace);
      await this.client.del(fullKey);
      this.logger.debug('Cache deleted', { key: fullKey });
    } catch (error) {
      this.logger.error('Cache delete failed', { key, error: (error as Error).message });
    }
  }

  /**
   * Check if cache key exists
   */
  async exists(key: string, options?: CacheOptions): Promise<boolean> {
    try {
      const fullKey = this.buildKey(key, options?.namespace);
      const exists = await this.client.exists(fullKey);
      return exists === 1;
    } catch (error) {
      this.logger.error('Cache exists check failed', { key, error: (error as Error).message });
      return false;
    }
  }

  /**
   * Set cache with TTL in seconds
   */
  async setWithTTL(key: string, value: any, ttlSeconds: number, options?: CacheOptions): Promise<void> {
    return this.set(key, value, { ...options, ttl: ttlSeconds });
  }

  /**
   * Increment cache value
   */
  async incr(key: string, options?: CacheOptions): Promise<number> {
    try {
      const fullKey = this.buildKey(key, options?.namespace);
      const result = await this.client.incr(fullKey);
      this.logger.debug('Cache incremented', { key: fullKey, value: result });
      return result;
    } catch (error) {
      this.logger.error('Cache increment failed', { key, error: (error as Error).message });
      return 0;
    }
  }

  /**
   * Get multiple cache values
   */
  async mget<T>(keys: string[], options?: CacheOptions): Promise<(T | null)[]> {
    try {
      const fullKeys = keys.map(key => this.buildKey(key, options?.namespace));
      const values = await this.client.mGet(fullKeys);

      return values.map((value, index) => {
        if (!value) {
          this.logger.debug('Cache miss', { key: fullKeys[index] });
          return null;
        }

        try {
          return JSON.parse(value) as T;
        } catch (error) {
          this.logger.error('Cache value parsing failed', { 
            key: fullKeys[index], 
            error: (error as Error).message 
          });
          return null;
        }
      });
    } catch (error) {
      this.logger.error('Cache mget failed', { keys, error: (error as Error).message });
      return keys.map(() => null);
    }
  }

  /**
   * Set multiple cache values
   */
  async mset(entries: Record<string, any>, options?: CacheOptions): Promise<void> {
    try {
      const serializedEntries: string[] = [];
      
      Object.entries(entries).forEach(([key, value]) => {
        const fullKey = this.buildKey(key, options?.namespace);
        const serializedValue = JSON.stringify(value);
        serializedEntries.push(fullKey, serializedValue);
      });

      await this.client.mSet(serializedEntries);
      
      // Set TTL for each key if specified
      if (options?.ttl) {
        const promises = Object.keys(entries).map(key => {
          const fullKey = this.buildKey(key, options.namespace);
          return this.client.expire(fullKey, options.ttl);
        });
        await Promise.all(promises);
      }

      this.logger.debug('Cache mset completed', { count: Object.keys(entries).length });
    } catch (error) {
      this.logger.error('Cache mset failed', { error: (error as Error).message });
    }
  }

  /**
   * Clear cache by pattern
   */
  async clearByPattern(pattern: string, options?: CacheOptions): Promise<void> {
    try {
      const fullPattern = this.buildKey(pattern, options?.namespace);
      const keys = await this.client.keys(fullPattern);
      
      if (keys.length > 0) {
        await this.client.del(keys);
        this.logger.debug('Cache cleared by pattern', { pattern: fullPattern, count: keys.length });
      }
    } catch (error) {
      this.logger.error('Cache clear by pattern failed', { pattern, error: (error as Error).message });
    }
  }

  /**
   * Cache taxonomy trees with longer TTL
   */
  async cacheTaxonomyTree(tenantId: string, taxonomyId: string, tree: any): Promise<void> {
    const key = `taxonomy:tree:${tenantId}:${taxonomyId}`;
    const ttl = this.configService.get('cache.taxonomyTTL');
    await this.set(key, tree, { ttl });
  }

  /**
   * Get cached taxonomy tree
   */
  async getTaxonomyTree(tenantId: string, taxonomyId: string): Promise<any> {
    const key = `taxonomy:tree:${tenantId}:${taxonomyId}`;
    return this.get(key);
  }

  /**
   * Cache category hierarchy
   */
  async cacheCategoryHierarchy(tenantId: string, categoryId: string, hierarchy: any): Promise<void> {
    const key = `category:hierarchy:${tenantId}:${categoryId}`;
    const ttl = this.configService.get('cache.categoryTTL');
    await this.set(key, hierarchy, { ttl });
  }

  /**
   * Get cached category hierarchy
   */
  async getCategoryHierarchy(tenantId: string, categoryId: string): Promise<any> {
    const key = `category:hierarchy:${tenantId}:${categoryId}`;
    return this.get(key);
  }

  /**
   * Cache search results
   */
  async cacheSearchResults(query: string, tenantId: string, results: any): Promise<void> {
    const key = `search:${this.hashQuery(query)}:${tenantId}`;
    const ttl = this.configService.get('cache.searchTTL');
    await this.set(key, results, { ttl });
  }

  /**
   * Get cached search results
   */
  async getSearchResults(query: string, tenantId: string): Promise<any> {
    const key = `search:${this.hashQuery(query)}:${tenantId}`;
    return this.get(key);
  }

  /**
   * Invalidate all caches for a tenant
   */
  async invalidateTenant(tenantId: string): Promise<void> {
    await this.clearByPattern(`*:${tenantId}:*`);
    await this.clearByPattern(`*:${tenantId}`);
  }

  /**
   * Health check for cache
   */
  async healthCheck(): Promise<{ status: string; latency: number }> {
    const start = Date.now();
    try {
      await this.client.ping();
      const latency = Date.now() - start;
      return { status: 'healthy', latency };
    } catch (error) {
      this.logger.error('Cache health check failed', error);
      return { status: 'unhealthy', latency: Date.now() - start };
    }
  }

  /**
   * Build full cache key with prefix and namespace
   */
  private buildKey(key: string, namespace?: string): string {
    const parts = [this.keyPrefix];
    if (namespace) {
      parts.push(namespace);
    }
    parts.push(key);
    return parts.join(':');
  }

  /**
   * Hash query string for cache key
   */
  private hashQuery(query: string): string {
    // Simple hash function for query strings
    let hash = 0;
    for (let i = 0; i < query.length; i++) {
      const char = query.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }
}
