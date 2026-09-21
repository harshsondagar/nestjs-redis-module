import { Injectable, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';
import { InjectRedis } from './redis.decoretor';

type RedisWithRateLimit = Redis & {
    fixedWindowIncr(key: string, windowSeconds: number): Promise<number>;
};

export interface RateLimitResult {
    allowed: boolean;
    current: number;
    remaining: number;
}

@Injectable()
export class RateLimiterService implements OnModuleInit {
    constructor(
        @InjectRedis('cache') private readonly client: RedisWithRateLimit,
    ) { }

    onModuleInit() {
        this.client.defineCommand('fixedWindowIncr', {
            numberOfKeys: 1,
            lua: `
        local current = redis.call("incr", KEYS[1])
        if tonumber(current) == 1 then
          redis.call("expire", KEYS[1], ARGV[1])
        end
        return current
      `,
        });
    }

    async consume(
        key: string,
        limit: number,
        windowSeconds: number,
    ): Promise<RateLimitResult> {
        const current = await this.client.fixedWindowIncr(key, windowSeconds);
        return {
            allowed: current <= limit,
            current,
            remaining: Math.max(0, limit - current),
        };
    }
}
