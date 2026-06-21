import { defineCommand } from '@lazy/core/types/plugin';

export default defineCommand({
  name: 'ban',
  description: 'Manage banned users (list/add/del)',
  label: 'owner',
  aliases: ['ban'],
  async execute({ msg, config, t }) {
    if (!msg.permissions.sender.owner) {
      return msg.reply(t('errors.onlyOwner'));
    }

    const subCommand = msg.body.args[0]?.toLowerCase();
    const bannedUsers = config.get('ban.users') || [];

    if (subCommand === 'list') {
      if (bannedUsers.length === 0) return msg.reply(t('ban.empty'));
      const list = bannedUsers.map((u, i) => `${i + 1}. ${u}`).join('\n');
      return msg.reply(t('ban.list', { list }));
    }

    if (subCommand === 'add' || subCommand === 'del') {
      let targetId = msg.quoted
        ? msg.quoted.sender?.pn || msg.quoted.sender?.lid
        : msg.body.mentionedJid?.[0] ||
          msg.body.args[1]?.replace(/[^0-9]/g, '');

      if (!targetId) {
        return msg.reply(
          t('ban.usage', { prefix: msg.body.prefix, cmd: subCommand })
        );
      }
      targetId = targetId.split('@')[0];

      if (subCommand === 'add') {
        if (bannedUsers.includes(targetId))
          return msg.reply(t('ban.alreadyBanned', { target: targetId }));
        bannedUsers.push(targetId);
        await config.set('ban.users', bannedUsers);
        return msg.reply(t('ban.banned', { target: targetId }));
      }

      if (subCommand === 'del') {
        const index = bannedUsers.indexOf(targetId);
        if (index === -1)
          return msg.reply(t('ban.notBanned', { target: targetId }));
        bannedUsers.splice(index, 1);
        await config.set('ban.users', bannedUsers);
        return msg.reply(t('ban.unbanned', { target: targetId }));
      }
    }

    return msg.reply(t('ban.menu', { prefix: msg.body.prefix }));
  },
});
