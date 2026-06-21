import fs from 'fs/promises';
import path from 'path';
import { pathToFileURL } from 'url';
export default class PluginMigrationSource {
    migrationsPath;
    pluginKey;
    constructor(migrationsPath, pluginKey) {
        this.migrationsPath = migrationsPath;
        this.pluginKey = pluginKey;
    }
    async getMigrations() {
        try {
            const files = await fs.readdir(this.migrationsPath);
            return files
                .filter((file) => file.endsWith('.js') || file.endsWith('.ts'))
                .sort();
        }
        catch {
            return [];
        }
    }
    getMigrationName(migration) {
        return `${this.pluginKey}:${migration}`;
    }
    async getMigration(migration) {
        const fullPath = path.resolve(this.migrationsPath, migration);
        const module = await import(pathToFileURL(fullPath).href);
        return module.default || module;
    }
}
