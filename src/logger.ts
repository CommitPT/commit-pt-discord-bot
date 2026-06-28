import type { Client, TextChannel } from 'discord.js';
import { CHANNELS, ROLES } from './constants';

const levels = {
  info: '\x1b[36m[INFO]\x1b[0m',
  warn: '\x1b[33m[WARN]\x1b[0m',
  error: '\x1b[31m[ERROR]\x1b[0m',
  debug: '\x1b[90m[DEBUG]\x1b[0m',
  success: '\x1b[32m[OK]\x1b[0m',
};

const discordLabels = {
  warn: '⚠️ **WARN**',
  error: '🚨 **ERROR**',
};

let discordClient: Client | null = null;

export function setLoggerClient(client: Client): void {
  discordClient = client;
}

function timestamp(): string {
  return new Date().toISOString();
}

function formatArgs(args: unknown[]): string {
  return args.map((a) => (a instanceof Error ? (a.stack ?? a.message) : String(a))).join(' ');
}

async function sendToDiscord(level: 'warn' | 'error', ...args: unknown[]): Promise<void> {
  if (!discordClient) return;

  const channel = discordClient.channels.cache.get(CHANNELS.ALERTS) as TextChannel | undefined;
  if (!channel) return;

  const mention = level === 'error' ? `<@&${ROLES.STAFF}> ` : '';
  const message = `${mention}${discordLabels[level]}\n\`\`\`${formatArgs(args)}\`\`\``;

  channel.send(message).catch(() => {
    // avoid infinite loop if sending to Discord itself fails
  });
}

function log(level: keyof typeof levels, ...args: unknown[]): void {
  console.log(`${timestamp()} ${levels[level]}`, ...args);

  if (level === 'warn' || level === 'error') {
    sendToDiscord(level, ...args);
  }
}

export const logger = {
  info: (...args: unknown[]) => log('info', ...args),
  warn: (...args: unknown[]) => log('warn', ...args),
  error: (...args: unknown[]) => log('error', ...args),
  debug: (...args: unknown[]) => log('debug', ...args),
  success: (...args: unknown[]) => log('success', ...args),
};
