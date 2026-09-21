import { Inject } from '@nestjs/common';
import { getRedisClientToken } from './redis.constants';


export function InjectRedis(connectionName: string): ParameterDecorator {
    return Inject(getRedisClientToken(connectionName));
}