import { defineCommand } from '@lazy/core/types/plugin';

export default defineCommand({
  name: 'owner',
  description: 'Manage bot owners (list/add/del)',
  label: 'owner',
  aliases: ['owner'],
  async execute({ msg, config, t }) {
    if (!msg.permissions.sender.owner) {
      return msg.reply(t('errors.onlyOwner'));
    }

    const subCommand = msg.body.args[0]?.toLowerCase();
    const owners = config.get('owner.owners') || [];

    if (subCommand === 'list') {
      if (owners.length === 0) return msg.reply(t('owner.empty'));
      const list = owners.map((o, i) => `${i + 1}. ${o}`).join('\n');
      return msg.reply(t('owner.list', { list }));
    }

    if (subCommand === 'add' || subCommand === 'del') {
      let targetId = msg.quoted
        ? msg.quoted.sender?.pn || msg.quoted.sender?.lid
        : msg.body.mentionedJid?.[0] ||
          msg.body.args[1]?.replace(/[^0-9]/g, '');

      if (!targetId) {
        return msg.reply(
          t('owner.usage', { prefix: msg.body.prefix, cmd: subCommand })
        );
      }
      targetId = targetId.split('@')[0];

      if (subCommand === 'add') {
        if (owners.includes(targetId))
          return msg.reply(t('owner.alreadyOwner', { target: targetId }));
        owners.push(targetId);
        await config.set('owner.owners', owners);
        return msg.reply(t('owner.added', { target: targetId }));
      }

      if (subCommand === 'del') {
        const index = owners.indexOf(targetId);
        if (index === -1)
          return msg.reply(t('owner.notOwner', { target: targetId }));
        owners.splice(index, 1);
        await config.set('owner.owners', owners);
        return msg.reply(t('owner.removed', { target: targetId }));
      }
    }

    return msg.reply(t('owner.menu', { prefix: msg.body.prefix }));
  },
});
