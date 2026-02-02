type LogLevel = 'info' | 'warn' | 'error' | 'debug';

const colors = {
  info: '\x1b[36m',    // Cyan
  warn: '\x1b[33m',    // Yellow
  error: '\x1b[31m',   // Red
  debug: '\x1b[90m',   // Gray
  reset: '\x1b[0m',
};

const log = (level: LogLevel, message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  const color = colors[level];
  const reset = colors.reset;

  console[level === 'error' ? 'error' : 'log'](
    `${color}[${timestamp}] [${level.toUpperCase()}]${reset} ${message}`,
    data ? data : ''
  );
};

export const logger = {
  info: (message: string, data?: any) => log('info', message, data),
  warn: (message: string, data?: any) => log('warn', message, data),
  error: (message: string, data?: any) => log('error', message, data),
  debug: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      log('debug', message, data);
    }
  },
};
