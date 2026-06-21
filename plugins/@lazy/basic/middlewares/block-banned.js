import { defineMiddleware } from '@lazy/core/types/plugin';
import pluginLoader from '@lazy/core/services/plugin/index';
import { z } from 'zod';

const BanConfigSchema = z.object({
  users: z.array(z.string()),
});

export default defineMiddleware({
  event: 'command',
  priority: -99,
  handler: async ({ next, payload, plugin }) => {
    const msg = payload;

    const rawConfig = pluginLoader.getConfig(plugin.key, 'ban');
    const parseResult = BanConfigSchema.safeParse(rawConfig || {});

    let banConfig = parseResult.success ? parseResult.data : { users: [] };

    if (!rawConfig || !parseResult.success) {
      await pluginLoader.setConfig(plugin.key, 'ban', banConfig);
    }

    const bannedUsers = banConfig.users;

    const senderPn = msg.sender.pn?.split('@')[0];
    const senderLid = msg.sender.lid?.split('@')[0];

    const isBanned =
      (senderPn && bannedUsers.includes(senderPn)) ||
      (senderLid && bannedUsers.includes(senderLid));

    if (isBanned) {
      return;
    }

    next();
  },
});
