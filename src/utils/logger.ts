
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogConfig {
  enableConsole: boolean;
  level: LogLevel;
  maxEntries: number;
}

class Logger {
  private config: LogConfig;
  private logs: Array<{ timestamp: Date; level: LogLevel; message: string; data?: any }> = [];
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.config = {
      enableConsole: this.isDevelopment,
      level: this.isDevelopment ? 'debug' : 'error',
      maxEntries: this.isDevelopment ? 100 : 50
    };
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(this.config.level);
  }

  private addLog(level: LogLevel, message: string, data?: any) {
    // Only store logs in development or for critical errors
    if (!this.isDevelopment && level !== 'error') return;
    
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
    if (!this.shouldLog('debug') || !this.isDevelopment) return;
    
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

  // Production-safe methods
  getLogs(level?: LogLevel) {
    if (!this.isDevelopment && level !== 'error') return [];
    
    if (level) {
      return this.logs.filter(log => log.level === level);
    }
    return [...this.logs];
  }

  clearLogs() {
    if (this.isDevelopment) {
      this.logs = [];
    }
  }

  setConfig(newConfig: Partial<LogConfig>) {
    if (this.isDevelopment) {
      this.config = { ...this.config, ...newConfig };
    }
  }
}

export const logger = new Logger();
