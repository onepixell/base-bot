import { defineCommand } from '@lazy/core/types/plugin';

export default defineCommand({
  name: 'prefix',
  description: 'Manage bot prefixes (list/add/del)',
  label: 'owner',
  aliases: ['prefix'],
  async execute({ msg, config, t }) {
    if (!msg.permissions.sender.owner) {
      return msg.reply(t('errors.onlyOwner'));
    }

    const subCommand = msg.body.args[0]?.toLowerCase();
    const prefixes = config.get('prefix.prefixes') || [];

    if (subCommand === 'list') {
      if (prefixes.length === 0) return msg.reply(t('prefix.empty'));
      const list = prefixes.map((p, i) => `${i + 1}. ${p}`).join('\n');
      return msg.reply(t('prefix.list', { list }));
    }

    if (subCommand === 'add' || subCommand === 'del') {
      const targetPrefix = msg.body.args[1];

      if (!targetPrefix) {
        return msg.reply(
          t('prefix.usage', { botPrefix: msg.body.prefix, cmd: subCommand })
        );
      }
      if (targetPrefix.length > 3) return msg.reply(t('prefix.tooLong'));

      if (subCommand === 'add') {
        if (prefixes.includes(targetPrefix))
          return msg.reply(
            t('prefix.alreadyConfigured', { target: targetPrefix })
          );
        prefixes.push(targetPrefix);
        await config.set('prefix.prefixes', prefixes);
        return msg.reply(t('prefix.added', { target: targetPrefix }));
      }

      if (subCommand === 'del') {
        const index = prefixes.indexOf(targetPrefix);
        if (index === -1)
          return msg.reply(t('prefix.notConfigured', { target: targetPrefix }));
        prefixes.splice(index, 1);
        await config.set('prefix.prefixes', prefixes);
        return msg.reply(t('prefix.removed', { target: targetPrefix }));
      }
    }

    return msg.reply(t('prefix.menu', { botPrefix: msg.body.prefix }));
  },
});
