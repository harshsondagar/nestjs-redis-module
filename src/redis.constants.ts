export const REDIS_MODULE_OPTIONS = 'REDIS_MODULE_OPTIONS';
export const DEFAULT_REDIS_CONNECTION = 'default';

export function getRedisClientToken(
  connectionName: string = DEFAULT_REDIS_CONNECTION,
): string {
  return `REDIS_CLIENT_${connectionName}`;
}
