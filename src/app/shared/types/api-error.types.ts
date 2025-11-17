export interface ApiErrorResponse {
  error?: {
    message?: string
    code?: string
    details?: unknown
  }
}

export interface ApiError {
  message: string
  code?: string
  details?: unknown
  status?: number
}

export function isApiError(err: unknown): err is ApiErrorResponse {
  return (
    typeof err === 'object' &&
    err !== null &&
    'error' in err &&
    typeof (err as Record<string, unknown>)['error'] === 'object'
  )
}

export function extractErrorMessage(err: unknown, fallback = 'An unexpected error occurred'): string {
  if (isApiError(err)) {
    return err.error?.message || fallback
  }

  if (err instanceof Error) {
    return err.message
  }

  if (typeof err === 'string') {
    return err
  }

  return fallback
}

export function extractApiError(err: unknown): ApiError {
  if (isApiError(err)) {
    return {
      message: err.error?.message || 'An unexpected error occurred',
      code: err.error?.code,
      details: err.error?.details,
    }
  }

  if (err instanceof Error) {
    return {
      message: err.message,
    }
  }

  return {
    message: 'An unexpected error occurred',
  }
}
