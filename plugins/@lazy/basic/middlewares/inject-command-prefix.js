import { defineMiddleware } from '@lazy/core/types/plugin';
import { setNestedValue } from '@lazy/core/utils/helpers';
import pluginLoader from '@lazy/core/services/plugin/index';

export default defineMiddleware({
  event: 'command',
  priority: -10,
  handler: async ({ next, payload, plugin }) => {
    const msg = payload;
    const rawCmd = msg.body.command.toLowerCase();

    let prefixes = pluginLoader.getConfig(plugin.key, 'prefix.prefixes');

    if (!Array.isArray(prefixes) || prefixes.length === 0) {
      prefixes = ['!'];
      await pluginLoader.setConfig(plugin.key, 'prefix.prefixes', prefixes);
    }

    const usedPrefix = prefixes.find((/** @type {string} */ p) =>
      rawCmd.startsWith(p)
    );
    const cmdName = usedPrefix ? rawCmd.slice(usedPrefix.length) : rawCmd;

    setNestedValue(msg, 'body.command', cmdName);
    setNestedValue(msg, 'body.commandWithPrefix', rawCmd, 3);
    setNestedValue(msg, 'body.prefix', usedPrefix || '', 1);
    setNestedValue(msg, 'body.prefixes', prefixes, 1);

    const validCommands = (
      pluginLoader.commandsIndex.get(msg.body.command) || []
    )
      .map((/** @type {string} */ key) => ({
        key,
        ...pluginLoader.commands.get(key),
      }))
      .filter((/** @type {{ withoutPrefix: boolean }} */ cmd) => {
        return msg.body.prefix || cmd.withoutPrefix;
      });

    setNestedValue(msg, 'commands', validCommands);
    next();
  },
});
