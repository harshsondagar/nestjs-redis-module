import { RedisOptions } from 'ioredis';
import { ModuleMetadata, Type } from '@nestjs/common';

export interface RedisConnectionConfig extends RedisOptions {
  name: string;
  enableLogs?: boolean;
}

export interface RedisModuleOptions {
  connections: RedisConnectionConfig[];
}

export interface RedisModuleOptionsFactory {
  createRedisModuleOptions(): Promise<RedisModuleOptions> | RedisModuleOptions;
}

export interface RedisModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<RedisModuleOptionsFactory>;
  useClass?: Type<RedisModuleOptionsFactory>;
  useFactory?: (
    ...args: any[]
  ) => Promise<RedisModuleOptions> | RedisModuleOptions;
  inject?: any[];
}