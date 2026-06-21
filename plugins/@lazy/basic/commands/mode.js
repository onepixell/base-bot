import { defineCommand } from '@lazy/core/types/plugin';

export default defineCommand({
  name: 'mode',
  description: 'Set bot mode (public/private)',
  label: 'owner',
  aliases: ['mode'],
  async execute({ msg, config, t }) {
    if (!msg.permissions.sender.owner) {
      return msg.reply(t('errors.onlyOwner'));
    }

    const modeArg = msg.body.args[0]?.toLowerCase();
    if (modeArg === 'public' || modeArg === 'private') {
      await config.set('mode.type', modeArg);
      return msg.reply(t('mode.success', { mode: modeArg }));
    }

    const currentMode = config.get('mode.type') || 'public';
    return msg.reply(
      t('mode.menu', { mode: currentMode, prefix: msg.body.prefix })
    );
  },
});
