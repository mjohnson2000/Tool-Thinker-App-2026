/**
 * Logger utility for development and production
 * In production, consider integrating with a logging service (Sentry, LogRocket, etc.)
 */

type LogLevel = 'log' | 'error' | 'warn' | 'info' | 'debug'

const isDevelopment = process.env.NODE_ENV === 'development'

class Logger {
  private shouldLog(level: LogLevel): boolean {
    // In production, only log errors and warnings
    if (!isDevelopment) {
      return level === 'error' || level === 'warn'
    }
    return true
  }

  log(...args: any[]): void {
    if (this.shouldLog('log')) {
      console.log('[LOG]', ...args)
    }
  }

  error(...args: any[]): void {
    if (this.shouldLog('error')) {
      console.error('[ERROR]', ...args)
      // In production, send to error tracking service
      // Example: Sentry.captureException(args[0])
    }
  }

  warn(...args: any[]): void {
    if (this.shouldLog('warn')) {
      console.warn('[WARN]', ...args)
    }
  }

  info(...args: any[]): void {
    if (this.shouldLog('info')) {
      console.info('[INFO]', ...args)
    }
  }

  debug(...args: any[]): void {
    if (this.shouldLog('debug')) {
      console.debug('[DEBUG]', ...args)
    }
  }
}

export const logger = new Logger()

