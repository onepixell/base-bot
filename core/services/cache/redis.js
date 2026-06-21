import { Redis } from 'ioredis';
import env from '@lazy/core/services/env/index';
export class RedisDriver {
    client;
    constructor() {
        this.client = new Redis(env.REDIS_URL || '', {});
    }
    async get(key) {
        const data = await this.client.get(key);
        return data ? JSON.parse(data) : undefined;
    }
    async set(key, value, ttl = 1000 * 60 * 60) {
        const stringData = JSON.stringify(value);
        if (ttl === 0 || ttl === undefined || ttl === null) {
            return await this.client.set(key, stringData);
        }
        else {
            return await this.client.set(key, stringData, 'PX', ttl);
        }
    }
    async del(key) {
        return await this.client.del(key);
    }
    async has(key) {
        return (await this.client.exists(key)) === 1;
    }
}
