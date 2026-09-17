import { RedisOptions } from 'ioredis';
import { ModuleMetadata, Type } from '@nestjs/common';

export interface RedisModuleOptions extends RedisOptions {
  connectionName?: string;
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
