import fs from 'fs';
import path from 'path';
import { dirPlugins, dirWorkspace } from '@lazy/core/utils/path';
import pluginManager from '@lazy/core/services/plugin/index';
import logger from '@lazy/core/utils/logger';
import { t } from '@lazy/core/services/i18n/index';
class PluginWatcher {
    watchers = [];
    debounceTimer = null;
    changedPlugins = new Set();
    isWatching() {
        return this.watchers.length > 0;
    }
    init(options = {}) {
        if (this.watchers.length > 0)
            return;
        const watchPaths = options.watchAll
            ? [dirPlugins(), dirWorkspace()]
            : [dirWorkspace()];
        watchPaths.forEach((watchPath) => {
            if (!fs.existsSync(watchPath))
                return;
            const watcher = fs.watch(watchPath, { recursive: true }, (_event, filename) => {
                if (!filename)
                    return;
                const fullPath = path.join(watchPath, filename);
                let pluginKey;
                for (const [key, pPath] of pluginManager.pluginPaths.entries()) {
                    if (fullPath.startsWith(pPath)) {
                        pluginKey = key;
                        break;
                    }
                }
                if (!pluginKey) {
                    const parts = filename.split(path.sep);
                    if (watchPath === dirPlugins()) {
                        if (parts.length >= 2 && parts[0].startsWith('@')) {
                            pluginKey = `${parts[0]}/${parts[1]}`;
                            const pPath = path.join(dirPlugins(), parts[0], parts[1]);
                            pluginManager.pluginPaths.set(pluginKey, pPath);
                        }
                    }
                    else if (watchPath === dirWorkspace()) {
                        if (parts.length >= 1) {
                            const ns = global.AUTH_USER?.username
                                ? `@${global.AUTH_USER.username}`
                                : '@dev';
                            const prefix = ns.startsWith('@') ? ns : `@${ns}`;
                            pluginKey = `${prefix}/${parts[0]}`;
                            const pPath = path.join(dirWorkspace(), parts[0]);
                            pluginManager.pluginPaths.set(pluginKey, pPath);
                        }
                    }
                }
                if (!pluginKey)
                    return;
                const pPath = pluginManager.pluginPaths.get(pluginKey);
                const relativePath = path.relative(pPath, fullPath);
                if (relativePath.startsWith('..'))
                    return;
                const pathParts = relativePath.split(path.sep);
                if (pathParts.includes('configs') ||
                    pathParts.some((part) => part.startsWith('.'))) {
                    return;
                }
                this.changedPlugins.add(pluginKey);
                if (this.debounceTimer)
                    clearTimeout(this.debounceTimer);
                this.debounceTimer = setTimeout(async () => {
                    const pluginsToReload = Array.from(this.changedPlugins);
                    this.changedPlugins.clear();
                    for (const key of pluginsToReload) {
                        try {
                            logger.info('[WATCHER]', t('cli.cmd.plugin_reload.reloading', { pluginKey: key }));
                            await pluginManager.reloadPlugin(key);
                            logger.success('[WATCHER]', t('cli.cmd.plugin_reload.reload_success', { pluginKey: key }));
                        }
                        catch (err) {
                        }
                    }
                }, 500);
            });
            this.watchers.push(watcher);
        });
        const target = options.watchAll ? 'ALL' : 'WORKSPACE';
        logger.info('[WATCHER]', `${t('cli.cmd.plugin_watcher.started')} (${target})`);
    }
    stop() {
        if (this.watchers.length > 0) {
            this.watchers.forEach((watcher) => watcher.close());
            this.watchers = [];
            logger.info('[WATCHER]', t('cli.cmd.plugin_watcher.stopped'));
        }
    }
}
export default new PluginWatcher();
