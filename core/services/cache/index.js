import env from '@lazy/core/services/env/index';
import { LruDriver } from '@lazy/core/services/cache/lru';
import { RedisDriver } from '@lazy/core/services/cache/redis';
import logger from '@lazy/core/utils/logger';
import { t } from '@lazy/core/services/i18n/index';
let cacheInstance;
export const initCache = () => {
    if (env.CACHE_DRIVER === 'redis') {
        cacheInstance = new RedisDriver();
        logger.info('[CACHE]', t('cache.using_redis'));
    }
    else {
        cacheInstance = new LruDriver();
        logger.info('[CACHE]', t('cache.using_lru'));
    }
};
export class CacheService {
    prefix;
    constructor(pluginKey) {
        this.prefix = pluginKey.replace(/[@]/g, '').replace(/[/]/g, '-') + ':';
    }
    async get(key) {
        return await cacheInstance.get(this.prefix + key);
    }
    async set(key, value, ttl) {
        return await cacheInstance.set(this.prefix + key, value, ttl);
    }
    async del(key) {
        return await cacheInstance.del(this.prefix + key);
    }
    async has(key) {
        return await cacheInstance.has(this.prefix + key);
    }
    async remember(key, ttl, callback) {
        const exists = await this.has(key);
        if (exists) {
            return (await this.get(key));
        }
        const value = await callback();
        await this.set(key, value, ttl);
        return value;
    }
}
export { cacheInstance as cache };
