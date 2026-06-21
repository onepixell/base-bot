import { defineCommand } from '@lazy/core/types/plugin';

export default defineCommand({
  name: 'join',
  description: 'Join a group via invite link',
  label: 'owner',
  aliases: ['join'],
  async execute({ sock, msg, t }) {
    if (!msg.permissions.sender.owner) {
      return msg.reply(t('errors.onlyOwner'));
    }

    const link = msg.body.args[0];
    if (!link || !link.includes('chat.whatsapp.com/')) {
      return msg.reply(t('join.usage', { prefix: msg.body.prefix }));
    }

    const code = link.split('chat.whatsapp.com/')[1].split(/[ \n?]/)[0];
    try {
      await sock.groupAcceptInvite(code);
      return msg.reply(t('join.success'));
    } catch (error) {
      return msg.reply(t('join.failed'));
    }
  },
});
