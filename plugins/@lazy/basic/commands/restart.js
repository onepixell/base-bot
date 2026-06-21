import { defineCommand } from '@lazy/core/types/plugin';

export default defineCommand({
  name: 'restart',
  description: 'Restart the bot process',
  label: 'owner',
  aliases: ['restart', 'shutdown'],
  async execute({ msg, t }) {
    if (!msg.permissions.sender.owner) return msg.reply(t('errors.onlyOwner'));

    await msg.reply(t('restart.success'));
    process.exit(1);
  },
});
