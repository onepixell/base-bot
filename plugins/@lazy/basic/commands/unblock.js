import { defineCommand } from '@lazy/core/types/plugin';

export default defineCommand({
  name: 'unblock',
  description: 'Unblock a user on WhatsApp',
  label: 'owner',
  aliases: ['unblock'],
  async execute({ sock, msg, t }) {
    if (!msg.permissions.sender.owner) return msg.reply(t('errors.onlyOwner'));

    let targetId = msg.quoted
      ? msg.quoted.sender?.pn || msg.quoted.sender?.lid
      : msg.body.mentionedJid?.[0] || msg.body.args[0]?.replace(/[^0-9]/g, '');

    if (!targetId) return msg.reply(t('errors.targetRequired'));
    if (!targetId.includes('@')) targetId = targetId + '@s.whatsapp.net';

    try {
      await sock.updateBlockStatus(targetId, 'unblock');
      return msg.reply(
        t('unblock.success', { target: targetId.split('@')[0] })
      );
    } catch (error) {
      return msg.reply(t('unblock.failed', { target: targetId.split('@')[0] }));
    }
  },
});
