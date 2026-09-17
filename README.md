# nestjs-redis

Reusable NestJS Redis integration module, built on [ioredis](https://github.com/redis/ioredis).
Distributed as a git submodule so multiple NestJS projects can share and version it independently.

## Usage

### Static config

```ts
import { RedisModule } from './libs/nestjs-redis/src';

@Module({
  imports: [
    RedisModule.forRoot({
      host: 'localhost',
      port: 6379,
    }),
  ],
})
export class AppModule {}
```

### Async config (e.g. from ConfigService)

```ts
import { RedisModule } from './libs/nestjs-redis/src';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        host: config.get('REDIS_HOST'),
        port: config.get('REDIS_PORT'),
        password: config.get('REDIS_PASSWORD'),
      }),
    }),
  ],
})
export class AppModule {}
```

### Using it in a service

```ts
import { Injectable } from '@nestjs/common';
import { RedisService } from './libs/nestjs-redis/src';

@Injectable()
export class CacheExampleService {
  constructor(private readonly redis: RedisService) {}

  async cacheUser(id: string, user: object) {
    await this.redis.setJSON(`user:${id}`, user, 60 * 5); // 5 min TTL
  }

  async getUser(id: string) {
    return this.redis.getJSON(`user:${id}`);
  }

  // Escape hatch to the full ioredis API (pub/sub, pipelines, scripting, etc.)
  async rawExample() {
    const client = this.redis.getClient();
    await client.multi().set('a', '1').incr('a').exec();
  }
}
```

## Versioning

This repo is meant to be pinned by parent projects via `git submodule`. Tag releases
(`git tag v0.1.0`) so consuming projects can check out a specific version rather than
tracking a moving branch.
