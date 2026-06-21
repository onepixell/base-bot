import { defineCommand } from '@lazy/core/types/plugin';
import os from 'os';

export default defineCommand({
  name: 'stats',
  description: 'Check bot statistics and ping',
  aliases: ['stats', 'ping', 'info'],
  async execute({ sock, msg, t }) {
    const start = Date.now();

    const uptimeSeconds = process.uptime();
    const hours = Math.floor(uptimeSeconds / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const seconds = Math.floor(uptimeSeconds % 60);
    const uptimeStr = `${hours}h ${minutes}m ${seconds}s`;

    const nodeVersion = process.version;
    const osPlatform = `${os.type()} (${os.release()})`;

    const formatSize = (bytes) => (bytes / 1024 / 1024).toFixed(2) + ' MB';
    const ramUsage = formatSize(process.memoryUsage().rss);
    const ramTotal = formatSize(os.totalmem());

    let latency = 0;
    try {
      const pingMsg = await msg.reply('...');
      latency = Date.now() - start;

      if (pingMsg && pingMsg.key) {
        await sock.sendMessage(msg.chat, {
          text: t('stats.result', {
            latency,
            uptime: uptimeStr,
            nodeVersion,
            os: osPlatform,
            ramUsage,
            ramTotal,
          }),
          edit: pingMsg.key,
        });
        return;
      }
    } catch (e) {}

    return msg.reply(
      t('stats.result', {
        latency: latency > 0 ? latency : 0,
        uptime: uptimeStr,
        nodeVersion,
        os: osPlatform,
        ramUsage,
        ramTotal,
      })
    );
  },
});
