import { defineMiddleware } from '@lazy/core/types/plugin';
import pluginLoader from '@lazy/core/services/plugin/index';
import { setNestedValue } from '@lazy/core/utils/helpers';
import { z } from 'zod';

const OwnerConfigSchema = z.object({
  owners: z.array(z.string()),
});

export default defineMiddleware({
  event: 'command',
  priority: -10,
  handler: async ({ next, payload, plugin }) => {
    const msg = payload;

    const rawConfig = pluginLoader.getConfig(plugin.key, 'owner');
    const parseResult = OwnerConfigSchema.safeParse(rawConfig || {});

    let ownerConfig = parseResult.success ? parseResult.data : { owners: [] };

    if (!rawConfig || !parseResult.success) {
      await pluginLoader.setConfig(plugin.key, 'owner', ownerConfig);
    }

    const owners = ownerConfig.owners;

    const isOwner =
      msg.fromMe ||
      owners.includes(msg.sender.pn?.split('@')[0]) ||
      owners.includes(msg.sender.lid?.split('@')[0]);

    setNestedValue(msg, 'permissions.sender.owner', isOwner);

    return next();
  },
});
