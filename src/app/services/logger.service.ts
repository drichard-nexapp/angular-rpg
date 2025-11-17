import { Injectable } from '@angular/core'

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface LogEntry {
  level: LogLevel
  message: string
  context?: string
  data?: unknown
  timestamp: Date
}

@Injectable({
  providedIn: 'root',
})
export class LoggerService {
  private enabled = true
  private minLevel: LogLevel = 'debug'

  error(message: string, context?: string, error?: unknown): void {
    this.log('error', message, context, error)
  }

  warn(message: string, context?: string, data?: unknown): void {
    this.log('warn', message, context, data)
  }

  info(message: string, context?: string, data?: unknown): void {
    this.log('info', message, context, data)
  }

  debug(message: string, context?: string, data?: unknown): void {
    this.log('debug', message, context, data)
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled
  }

  setMinLevel(level: LogLevel): void {
    this.minLevel = level
  }

  private log(level: LogLevel, message: string, context?: string, data?: unknown): void {
    if (!this.enabled) return
    if (!this.shouldLog(level)) return

    const entry: LogEntry = {
      level,
      message,
      context,
      data,
      timestamp: new Date(),
    }

    const prefix = context ? `[${context}]` : '[App]'
    const formattedMessage = `${prefix} ${message}`

    switch (level) {
      case 'error':
        console.error(formattedMessage, data)
        break
      case 'warn':
        console.warn(formattedMessage, data)
        break
      case 'info':
        console.info(formattedMessage, data)
        break
      case 'debug':
        console.debug(formattedMessage, data)
        break
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error']
    return levels.indexOf(level) >= levels.indexOf(this.minLevel)
  }
}
