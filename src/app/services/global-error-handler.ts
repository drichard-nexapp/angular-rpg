import { ErrorHandler, Injectable, inject } from '@angular/core'
import { LoggerService } from './logger.service'
import { ErrorHandlerService } from './error-handler.service'

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private logger = inject(LoggerService)
  private errorHandler = inject(ErrorHandlerService)

  handleError(error: Error | unknown): void {
    const errorMessage =
      error instanceof Error ? error.message : 'An unexpected error occurred'
    const errorStack = error instanceof Error ? error.stack : undefined

    this.logger.error(errorMessage, 'GlobalErrorHandler', {
      error,
      stack: errorStack,
    })

    this.errorHandler.handleError(
      errorMessage,
      'An unexpected error occurred. Please try again.',
    )

    console.error('Uncaught error:', error)
  }
}
