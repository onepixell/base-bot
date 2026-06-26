import { z } from 'zod';
export declare const envSchema: z.ZodObject<{
    WA_AUTH_STATE: z.ZodDefault<z.ZodEnum<{
        file: "file";
        database: "database";
    }>>;
    WA_USE_PAIRING_CODE: z.ZodDefault<z.ZodPipe<z.ZodTransform<unknown, unknown>, z.ZodBoolean>>;
    KEY: z.ZodString;
    TZ: z.ZodDefault<z.ZodString>;
    CACHE_DRIVER: z.ZodDefault<z.ZodEnum<{
        redis: "redis";
        lru: "lru";
    }>>;
    REDIS_URL: z.ZodOptional<z.ZodString>;
    DEFAULT_LANG: z.ZodDefault<z.ZodString>;
    PLUGIN_WATCHER: z.ZodDefault<z.ZodPipe<z.ZodTransform<unknown, unknown>, z.ZodBoolean>>;
    API_BASE_URL: z.ZodDefault<z.ZodString>;
    DB_CONNECTION: z.ZodEnum<{
        sqlite: "sqlite";
        mysql: "mysql";
    }>;
    DB_HOST: z.ZodOptional<z.ZodString>;
    DB_PORT: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    DB_USER: z.ZodOptional<z.ZodString>;
    DB_PASSWORD: z.ZodOptional<z.ZodString>;
    DB_DATABASE: z.ZodOptional<z.ZodString>;
    WA_SESSION_NAME: z.ZodDefault<z.ZodString>;
    STORE_ENABLED: z.ZodDefault<z.ZodPipe<z.ZodTransform<unknown, unknown>, z.ZodBoolean>>;
    STORE_CHATS: z.ZodDefault<z.ZodPipe<z.ZodTransform<unknown, unknown>, z.ZodBoolean>>;
    STORE_CONTACTS: z.ZodDefault<z.ZodPipe<z.ZodTransform<unknown, unknown>, z.ZodBoolean>>;
    STORE_GROUPS: z.ZodDefault<z.ZodPipe<z.ZodTransform<unknown, unknown>, z.ZodBoolean>>;
    STORE_MESSAGES: z.ZodDefault<z.ZodPipe<z.ZodTransform<unknown, unknown>, z.ZodBoolean>>;
    STORE_MESSAGE_RETENTION_DAYS: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    STORE_BATCH_INTERVAL_MS: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
export type Env = z.infer<typeof envSchema>;
