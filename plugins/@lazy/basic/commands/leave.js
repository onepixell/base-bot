import { defineCommand } from '@lazy/core/types/plugin';

export default defineCommand({
  name: 'leave',
  description: 'Leave the current group',
  label: 'owner',
  aliases: ['leave'],
  async execute({ sock, msg, t }) {
    if (!msg.permissions.sender.owner) {
      return msg.reply(t('errors.onlyOwner'));
    }

    if (!msg.flags.isGroup) {
      return msg.reply(t('errors.groupOnly'));
    }

    await msg.reply(t('leave.goodbye'));
    try {
      await sock.groupLeave(msg.chat);
    } catch (error) {
      return msg.reply(t('leave.failed'));
    }
  },
});
