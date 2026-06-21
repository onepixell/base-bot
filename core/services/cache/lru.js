import { LRUCache } from 'lru-cache';
export class LruDriver {
    client;
    constructor() {
        this.client = new LRUCache({
            ttl: 1000 * 60 * 60,
            ttlAutopurge: true,
        });
    }
    async get(key) {
        return this.client.get(key);
    }
    async set(key, value, ttl) {
        return this.client.set(key, value, { ttl });
    }
    async del(key) {
        return this.client.delete(key);
    }
    async has(key) {
        return this.client.has(key);
    }
}
