import { Injectable, signal, computed } from '@angular/core'

export interface AppError {
  message: string
  code?: string
  details?: unknown
  timestamp: Date
  context?: string
}

@Injectable({
  providedIn: 'root',
})
export class ErrorHandlerService {
  private errors = signal<AppError[]>([])

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

    console.error(`[${context || 'App'}] Error:`, appError)

    this.errors.update(errors => [...errors, appError])

    setTimeout(() => this.clearError(appError), 5000)
  }

  clearError(error: AppError): void {
    this.errors.update(errors =>
      errors.filter(e => e !== error)
    )
  }

  clearAllErrors(): void {
    this.errors.set([])
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
