import { defineMiddleware } from '@lazy/core/types/plugin';
import pluginLoader from '@lazy/core/services/plugin/index';

export default defineMiddleware({
  event: 'command',
  priority: -5,
  handler: async ({ next, abort, payload, plugin }) => {
    const msg = payload;

    const rawConfig = pluginLoader.getConfig(plugin.key, 'mode');
    const modeType = rawConfig?.type || 'public';

    if (modeType === 'private' && !msg.permissions.sender.owner) {
      return abort('Bot is in private mode');
    }

    next();
  },
});
