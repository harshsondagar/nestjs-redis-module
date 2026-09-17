import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { DEFAULT_REDIS_CONNECTION, getRedisClientToken } from './redis.constants';

/**
 * Thin convenience wrapper around the ioredis client.
 * Inject this in your services instead of the raw client for the
 * common operations; use `getClient()` when you need full ioredis API
 * (pipelines, pub/sub, scripting, etc.).
 */
@Injectable()
export class RedisService {
  constructor(
    @Inject(getRedisClientToken(DEFAULT_REDIS_CONNECTION))
    private readonly client: Redis,
  ) {}

  getClient(): Redis {
    return this.client;
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<'OK'> {
    if (ttlSeconds) {
      return this.client.set(key, value, 'EX', ttlSeconds);
    }
    return this.client.set(key, value);
  }

  async getJSON<T>(key: string): Promise<T | null> {
    const raw = await this.client.get(key);
    return raw ? (JSON.parse(raw) as T) : null;
  }

  async setJSON<T>(key: string, value: T, ttlSeconds?: number): Promise<'OK'> {
    return this.set(key, JSON.stringify(value), ttlSeconds);
  }

  async del(...keys: string[]): Promise<number> {
    return this.client.del(...keys);
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result === 1;
  }

  async expire(key: string, ttlSeconds: number): Promise<boolean> {
    const result = await this.client.expire(key, ttlSeconds);
    return result === 1;
  }

  async incr(key: string): Promise<number> {
    return this.client.incr(key);
  }

  async ttl(key: string): Promise<number> {
    return this.client.ttl(key);
  }
}
