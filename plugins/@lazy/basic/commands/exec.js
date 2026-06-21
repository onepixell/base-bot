import { defineCommand } from '@lazy/core/types/plugin';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

export default defineCommand({
  name: 'exec',
  description: 'Execute a terminal command',
  label: 'owner',
  withoutPrefix: true,
  aliases: ['~'],
  async execute({ msg, t }) {
    if (!msg.permissions.sender.owner) {
      return msg.reply(t('errors.onlyOwner'));
    }

    const commandStr = msg.body.argsText;
    if (!commandStr) return msg.reply(t('exec.empty'));

    try {
      const { stdout, stderr } = await execPromise(commandStr);
      let response = '';
      if (stdout) response += stdout.trim() + '\n';
      if (stderr) response += `\n*STDERR:*\n${stderr.trim()}`;

      return msg.reply(response.trim() || t('exec.noOutput'));
    } catch (err) {
      return msg.reply(t('exec.error', { error: err.message }));
    }
  },
});
