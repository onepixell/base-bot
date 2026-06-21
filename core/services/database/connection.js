import knex from 'knex';
import env from '@lazy/core/services/env/index';
import { databaseConfig } from './config.js';
import logger from '@lazy/core/utils/logger';
import { t } from '@lazy/core/services/i18n/index';
export let db;
export const initDatabase = async () => {
    const config = databaseConfig[env.DB_CONNECTION];
    try {
        db = knex(config);
        db.client.on('query', (query) => {
            if (query.bindings) {
                query.bindings = query.bindings.map((v) => typeof v === 'object' && v !== null ? JSON.stringify(v) : v);
            }
        });
        await db.migrate.latest();
        logger.success('[DATABASE]', t('database.connected'));
        return db;
    }
    catch (err) {
        logger.error('[DATABASE]', t('database.failed', { error: err.message }));
        throw err;
    }
};
