import { defineCommand } from '@lazy/core/types/plugin';
import { inspect } from 'util';

export default defineCommand({
  name: 'eval',
  description: 'Evaluate async JavaScript code',
  label: 'owner',
  withoutPrefix: true,
  aliases: ['$'],
  async execute(ctx) {
    if (!ctx.msg.permissions.sender.owner) {
      return ctx.msg.reply(ctx.t('errors.onlyOwner'));
    }

    let code = ctx.msg.body.argsText;
    if (!code) return ctx.msg.reply(ctx.t('eval.empty'));

    if (code.startsWith('```') && code.endsWith('```')) {
      code = code.replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/, '');
    }

    try {
      let result = await eval(`(async () => { ${code} })()`);
      if (result === undefined) result = 'undefined';
      else if (typeof result !== 'string')
        result = inspect(result, { depth: 2 });
      return ctx.msg.reply(result);
    } catch (error) {
      return ctx.msg.reply(ctx.t('eval.error', { error: error.message }));
    }
  },
});
