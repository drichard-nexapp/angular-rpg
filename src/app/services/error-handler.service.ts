import { Injectable, signal, computed, inject } from '@angular/core'
import { LoggerService } from './logger.service'

export interface AppError {
  message: string
  code?: string
  details?: unknown
  timestamp: Date
  context?: string
}

export interface AppSuccess {
  message: string
  timestamp: Date
  context?: string
}

@Injectable({
  providedIn: 'root',
})
export class ErrorHandlerService {
  private logger = inject(LoggerService)
  private errors = signal<AppError[]>([])
  private successes = signal<AppSuccess[]>([])

  readonly currentError = computed(() => this.errors()[0] || null)
  readonly hasError = computed(() => this.errors().length > 0)
  readonly allErrors = computed(() => this.errors())

  handleError(error: unknown, context?: string): void {
    const appError: AppError = {
      message: this.extractMessage(error),
      code: this.extractCode(error),
      details: error,
      timestamp: new Date(),
      context,
    }

    this.logger.error(appError.message, context || 'App', appError.details)

    this.errors.update((errors) => [...errors, appError])

    setTimeout(() => this.clearError(appError), 5000)
  }

  clearError(error: AppError): void {
    this.errors.update((errors) => errors.filter((e) => e !== error))
  }

  clearAllErrors(): void {
    this.errors.set([])
  }

  handleSuccess(message: string, context?: string): void {
    const appSuccess: AppSuccess = {
      message,
      timestamp: new Date(),
      context,
    }

    this.logger.info(message, context || 'App')

    this.successes.update((successes) => [...successes, appSuccess])

    setTimeout(() => this.clearSuccess(appSuccess), 3000)
  }

  clearSuccess(success: AppSuccess): void {
    this.successes.update((successes) => successes.filter((s) => s !== success))
  }

  private extractMessage(error: unknown): string {
    if (error instanceof Error) return error.message
    if (typeof error === 'string') return error
    if (error && typeof error === 'object' && 'message' in error) {
      return String(error.message)
    }
    return 'An unknown error occurred'
  }

  private extractCode(error: unknown): string | undefined {
    if (error && typeof error === 'object' && 'code' in error) {
      return String(error.code)
    }
    return undefined
  }
}
