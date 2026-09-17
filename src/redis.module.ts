import { DynamicModule, Global, Logger, Module, Provider } from '@nestjs/common';
import Redis from 'ioredis';
import {
  RedisModuleAsyncOptions,
  RedisModuleOptions,
  RedisModuleOptionsFactory,
} from './interfaces/redis-module-options.interface';
import {
  DEFAULT_REDIS_CONNECTION,
  REDIS_MODULE_OPTIONS,
  getRedisClientToken,
} from './redis.constants';
import { RedisService } from './redis.service';

@Global()
@Module({})
export class RedisModule {
  private static readonly logger = new Logger('RedisModule');

  static forRoot(options: RedisModuleOptions): DynamicModule {
    const connectionName = options.connectionName ?? DEFAULT_REDIS_CONNECTION;
    const clientToken = getRedisClientToken(connectionName);

    const clientProvider: Provider = {
      provide: clientToken,
      useFactory: () => RedisModule.createClient(options, connectionName),
    };

    return {
      module: RedisModule,
      providers: [clientProvider, RedisService],
      exports: [clientProvider, RedisService],
    };
  }

  static forRootAsync(options: RedisModuleAsyncOptions): DynamicModule {
    const connectionName = options.connectionName ?? DEFAULT_REDIS_CONNECTION;
    const clientToken = getRedisClientToken(connectionName);

    const asyncOptionsProvider = RedisModule.createAsyncOptionsProvider(options);

    const clientProvider: Provider = {
      provide: clientToken,
      useFactory: (redisOptions: RedisModuleOptions) =>
        RedisModule.createClient(redisOptions, connectionName),
      inject: [REDIS_MODULE_OPTIONS],
    };

    return {
      module: RedisModule,
      imports: options.imports || [],
      providers: [asyncOptionsProvider, clientProvider, RedisService],
      exports: [clientProvider, RedisService],
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

    const inject = [
      (options.useClass || options.useExisting) as any,
    ];

    return {
      provide: REDIS_MODULE_OPTIONS,
      useFactory: async (factory: RedisModuleOptionsFactory) =>
        factory.createRedisModuleOptions(),
      inject,
    };
  }

  private static createClient(
    options: RedisModuleOptions,
    connectionName: string,
  ): Redis {
    const { connectionName: _drop, enableLogs = true, ...redisOptions } = options;
    const client = new Redis(redisOptions);

    if (enableLogs) {
      client.on('connect', () =>
        RedisModule.logger.log(`[${connectionName}] connected`),
      );
      client.on('error', (err) =>
        RedisModule.logger.error(`[${connectionName}] error: ${err.message}`),
      );
      client.on('reconnecting', () =>
        RedisModule.logger.warn(`[${connectionName}] reconnecting...`),
      );
    }

    return client;
  }
}
