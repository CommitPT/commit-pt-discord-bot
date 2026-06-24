const levels = {
  info: '\x1b[36m[INFO]\x1b[0m',
  warn: '\x1b[33m[WARN]\x1b[0m',
  error: '\x1b[31m[ERROR]\x1b[0m',
  debug: '\x1b[90m[DEBUG]\x1b[0m',
  success: '\x1b[32m[OK]\x1b[0m',
};

function timestamp(): string {
  return new Date().toISOString();
}

function log(level: keyof typeof levels, ...args: unknown[]): void {
  console.log(`${timestamp()} ${levels[level]}`, ...args);
}

export const logger = {
  info: (...args: unknown[]) => log('info', ...args),
  warn: (...args: unknown[]) => log('warn', ...args),
  error: (...args: unknown[]) => log('error', ...args),
  debug: (...args: unknown[]) => log('debug', ...args),
  success: (...args: unknown[]) => log('success', ...args),
};
