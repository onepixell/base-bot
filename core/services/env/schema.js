import { z } from 'zod';
export const envSchema = z.object({
    WA_AUTH_STATE: z.enum(['file', 'database']).default('file'),
    WA_USE_PAIRING_CODE: z
        .preprocess((val) => {
        if (typeof val === 'string') {
            if (val.toLowerCase() === 'true')
                return true;
            if (val.toLowerCase() === 'false')
                return false;
        }
        return val;
    }, z.boolean())
        .default(false),
    KEY: z.string(),
    TZ: z.string().default('UTC'),
    CACHE_DRIVER: z.enum(['redis', 'lru']).default('lru'),
    REDIS_URL: z.string().optional(),
    DEFAULT_LANG: z.string().default('en'),
    PLUGIN_WATCHER: z
        .preprocess((val) => {
        if (typeof val === 'string') {
            if (val.toLowerCase() === 'true')
                return true;
            if (val.toLowerCase() === 'false')
                return false;
        }
        return val;
    }, z.boolean())
        .default(false),
    API_BASE_URL: z.string().default('https://lazybot.site'),
    DB_CONNECTION: z.enum(['sqlite', 'mysql']),
    DB_HOST: z.string().optional(),
    DB_PORT: z.coerce.number().default(3306),
    DB_USER: z.string().optional(),
    DB_PASSWORD: z.string().optional(),
    DB_DATABASE: z.string().optional(),
    WA_SESSION_NAME: z.string().default('lazy'),
    STORE_ENABLED: z
        .preprocess((val) => {
        if (typeof val === 'string') {
            if (val.toLowerCase() === 'true') return true;
            if (val.toLowerCase() === 'false') return false;
        }
        return val;
    }, z.boolean())
        .default(true),
    STORE_CHATS: z.preprocess((val) => {
        if (typeof val === 'string') {
            if (val.toLowerCase() === 'true') return true;
            if (val.toLowerCase() === 'false') return false;
        }
        return val;
    }, z.boolean()).default(true),
    STORE_CONTACTS: z
        .preprocess((val) => {
        if (typeof val === 'string') {
            if (val.toLowerCase() === 'true') return true;
            if (val.toLowerCase() === 'false') return false;
        }
        return val;
    }, z.boolean())
        .default(true),
    STORE_GROUPS: z
        .preprocess((val) => {
        if (typeof val === 'string') {
            if (val.toLowerCase() === 'true') return true;
            if (val.toLowerCase() === 'false') return false;
        }
        return val;
    }, z.boolean())
        .default(true),
    STORE_MESSAGES: z
        .preprocess((val) => {
        if (typeof val === 'string') {
            if (val.toLowerCase() === 'true') return true;
            if (val.toLowerCase() === 'false') return false;
        }
        return val;
    }, z.boolean())
        .default(false),
    STORE_MESSAGE_RETENTION_DAYS: z.coerce.number().default(7),
    STORE_BATCH_INTERVAL_MS: z.coerce.number().default(5000),
});
