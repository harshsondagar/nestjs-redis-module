import { RedisOptions } from 'ioredis';
import { ModuleMetadata, Type } from '@nestjs/common';

/**
 * Options accepted by RedisModule.forRoot().
 * Extends ioredis' own RedisOptions so all native client options
 * (host, port, password, tls, sentinel config, etc.) are supported.
 */
export interface RedisModuleOptions extends RedisOptions {
  /**
   * Optional name for this connection. Defaults to 'default'.
   * Useful when you need multiple Redis connections in one app
   * (e.g. a cache instance and a pub/sub instance).
   */
  connectionName?: string;

  /**
   * If true, logs connect/error/reconnect events. Defaults to true.
   */
  enableLogs?: boolean;
}

export interface RedisModuleOptionsFactory {
  createRedisModuleOptions(): Promise<RedisModuleOptions> | RedisModuleOptions;
}

export interface RedisModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  connectionName?: string;
  useExisting?: Type<RedisModuleOptionsFactory>;
  useClass?: Type<RedisModuleOptionsFactory>;
  useFactory?: (
    ...args: any[]
  ) => Promise<RedisModuleOptions> | RedisModuleOptions;
  inject?: any[];
}
