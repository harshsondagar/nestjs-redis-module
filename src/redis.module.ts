import { DynamicModule, Global, Logger, Module, Provider } from '@nestjs/common';
import Redis from 'ioredis';
import {
  RedisConnectionConfig,
  RedisModuleAsyncOptions,
  RedisModuleOptions,
  RedisModuleOptionsFactory,
} from './interfaces/redis-module-options.interface';
import { REDIS_MODULE_OPTIONS, getRedisClientToken } from './redis.constants';
import { RedisService } from './redis.service';
import { RateLimiterService } from './rate-limiter.service';

@Global()
@Module({})
export class RedisModule {
  private static readonly logger = new Logger('RedisModule');

  static forRoot(options: RedisModuleOptions): DynamicModule {
    const clientProviders = options.connections.map((conn) =>
      RedisModule.buildClientProvider(conn),
    );

    return {
      module: RedisModule,
      providers: [...clientProviders, RedisService, RateLimiterService],
      exports: [...clientProviders, RedisService, RateLimiterService],
    };

  }

  static forRootAsync(options: RedisModuleAsyncOptions): DynamicModule {
    const asyncOptionsProvider = RedisModule.createAsyncOptionsProvider(options);
    const knownNames = ['cache', 'pubsub', 'bullmq'];

    const clientProviders: Provider[] = knownNames.map((name) => ({
      provide: getRedisClientToken(name),
      useFactory: (opts: RedisModuleOptions) => {
        const conn = opts.connections.find((c) => c.name === name);
        if (!conn) return undefined; // not configured for this app -- fine
        return RedisModule.createClient(conn);
      },
      inject: [REDIS_MODULE_OPTIONS],
    }));

    return {
      module: RedisModule,
      imports: options.imports || [],
      providers: [
        asyncOptionsProvider,
        ...clientProviders,
        RedisService,
        RateLimiterService,
      ],
      exports: [...clientProviders, RedisService, RateLimiterService],
    };
  }

  private static buildClientProvider(conn: RedisConnectionConfig): Provider {
    return {
      provide: getRedisClientToken(conn.name),
      useFactory: () => RedisModule.createClient(conn),
    };
  }

  private static createAsyncOptionsProvider(
    options: RedisModuleAsyncOptions,
  ): Provider {
    if (options.useFactory) {
      return {
        provide: REDIS_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }
    const inject = [(options.useClass || options.useExisting) as any];
    return {
      provide: REDIS_MODULE_OPTIONS,
      useFactory: async (factory: RedisModuleOptionsFactory) =>
        factory.createRedisModuleOptions(),
      inject,
    };
  }

  private static createClient(conn: RedisConnectionConfig): Redis {
    const { name, enableLogs = true, ...redisOptions } = conn;
    const client = new Redis(redisOptions);

    if (enableLogs) {
      client.on('connect', () => RedisModule.logger.log(`[${name}] connected`));
      client.on('error', (err) =>
        RedisModule.logger.error(`[${name}] error: ${err.message}`),
      );
      client.on('reconnecting', () =>
        RedisModule.logger.warn(`[${name}] reconnecting...`),
      );
    }

    return client;
  }
}