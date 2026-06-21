import { defineCommand } from '@lazy/core/types/plugin';

export default defineCommand({
  name: 'fetch',
  description: 'Fetch data from a URL',
  label: 'owner',
  aliases: ['fetch', 'get'],
  async execute({ msg, t }) {
    if (!msg.permissions.sender.owner) return msg.reply(t('errors.onlyOwner'));

    const url = msg.body.args[0];
    if (!url) return msg.reply(t('fetch.usage', { prefix: msg.body.prefix }));

    try {
      const res = await fetch(url);
      const contentType = res.headers.get('content-type');
      let data;
      if (contentType && contentType.includes('application/json')) {
        data = JSON.stringify(await res.json(), null, 2);
      } else {
        data = await res.text();
      }
      return msg.reply(data.substring(0, 4000));
    } catch (err) {
      return msg.reply(t('fetch.error', { error: err.message }));
    }
  },
});
