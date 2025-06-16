
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogConfig {
  enableConsole: boolean;
  level: LogLevel;
  maxEntries: number;
}

class Logger {
  private config: LogConfig;
  private logs: Array<{ timestamp: Date; level: LogLevel; message: string; data?: any }> = [];

  constructor() {
    this.config = {
      enableConsole: process.env.NODE_ENV === 'development',
      level: process.env.NODE_ENV === 'development' ? 'debug' : 'error',
      maxEntries: 100
    };
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(this.config.level);
  }

  private addLog(level: LogLevel, message: string, data?: any) {
    if (this.logs.length >= this.config.maxEntries) {
      this.logs.shift();
    }
    
    this.logs.push({
      timestamp: new Date(),
      level,
      message,
      data
    });
  }

  debug(message: string, data?: any) {
    if (!this.shouldLog('debug')) return;
    
    this.addLog('debug', message, data);
    if (this.config.enableConsole) {
      console.log(`[DEBUG] ${message}`, data || '');
    }
  }

  info(message: string, data?: any) {
    if (!this.shouldLog('info')) return;
    
    this.addLog('info', message, data);
    if (this.config.enableConsole) {
      console.info(`[INFO] ${message}`, data || '');
    }
  }

  warn(message: string, data?: any) {
    if (!this.shouldLog('warn')) return;
    
    this.addLog('warn', message, data);
    if (this.config.enableConsole) {
      console.warn(`[WARN] ${message}`, data || '');
    }
  }

  error(message: string, data?: any) {
    if (!this.shouldLog('error')) return;
    
    this.addLog('error', message, data);
    if (this.config.enableConsole) {
      console.error(`[ERROR] ${message}`, data || '');
    }
  }

  getLogs(level?: LogLevel) {
    if (level) {
      return this.logs.filter(log => log.level === level);
    }
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
  }

  setConfig(newConfig: Partial<LogConfig>) {
    this.config = { ...this.config, ...newConfig };
  }
}

export const logger = new Logger();
