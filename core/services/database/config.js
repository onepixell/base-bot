import env from '@lazy/core/services/env/index';
import { dirStorage } from '@lazy/core/utils/path';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isCompiled = __filename.endsWith('.js');
const loadExtensions = isCompiled ? ['.js'] : ['.ts'];
export const databaseConfig = {
    mysql: {
        client: 'mysql2',
        connection: {
            host: env.DB_HOST,
            port: env.DB_PORT,
            user: env.DB_USER,
            password: env.DB_PASSWORD,
            database: env.DB_DATABASE,
        },
        migrations: {
            directory: path.join(__dirname, 'migrations'),
            tableName: 'knex_migrations',
            loadExtensions,
        },
    },
    sqlite: {
        client: 'sqlite3',
        connection: {
            filename: dirStorage('database.sqlite'),
        },
        useNullAsDefault: true,
        migrations: {
            directory: path.join(__dirname, 'migrations'),
            tableName: 'knex_migrations',
            loadExtensions,
        },
    },
};
