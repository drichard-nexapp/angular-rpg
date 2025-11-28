import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http'
import { inject } from '@angular/core'
import { catchError, throwError } from 'rxjs'
import { ErrorHandlerService } from '../services/error-handler.service'
import { LoggerService } from '../services/logger.service'

export const SKIP_ERROR_HANDLER_HEADER = 'X-Skip-Error-Handler'

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const skipErrorHandler = req.headers.has(SKIP_ERROR_HANDLER_HEADER)
  const cleanedReq = skipErrorHandler ? req.clone({ headers: req.headers.delete(SKIP_ERROR_HANDLER_HEADER) }) : req

  const errorHandler = inject(ErrorHandlerService)
  const logger = inject(LoggerService)

  return next(cleanedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (skipErrorHandler) {
        logger.error(`Error (silently handled): ${error.message}`, `HTTP ${error.status}`, {
          url: req.url,
          method: req.method,
        })
        return throwError(() => error)
      }
      let errorMessage: string
      let context = 'HTTP Request'

      if (error.error instanceof ErrorEvent) {
        errorMessage = `Client Error: ${error.error.message}`
      } else {
        if (error.status === 0) {
          errorMessage = 'Network error - please check your connection'
        } else if (error.status >= 400 && error.status < 500) {
          errorMessage = error.error?.message || `Client Error: ${error.statusText}`
        } else if (error.status >= 500) {
          errorMessage = error.error?.message || `Server Error: ${error.statusText}`
        } else {
          errorMessage = error.error?.message || error.message
        }
        context = `HTTP ${error.status}`
      }

      logger.error(errorMessage, context, {
        url: cleanedReq.url,
        method: cleanedReq.method,
        status: error.status,
        error: error.error,
      })

      errorHandler.handleError(errorMessage, context)

      return throwError(() => error)
    }),
  )
}
