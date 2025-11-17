import { HttpHeaders, HttpContext } from '@angular/common/http'
import { SKIP_LOADING_HEADER } from '../../interceptors/loading.interceptor'
import { SKIP_ERROR_HANDLER_HEADER } from '../../interceptors/error.interceptor'

export interface HttpRequestOptions {
  headers?: HttpHeaders | { [header: string]: string | string[] }
  context?: HttpContext
  params?: { [param: string]: string | string[] }
  observe?: 'body' | 'events' | 'response'
  reportProgress?: boolean
  responseType?: 'json' | 'text' | 'blob' | 'arraybuffer'
  withCredentials?: boolean
}

export class HttpUtils {
  static createHeaders(customHeaders?: Record<string, string>): HttpHeaders {
    let headers = new HttpHeaders()
    if (customHeaders) {
      Object.entries(customHeaders).forEach(([key, value]) => {
        headers = headers.set(key, value)
      })
    }
    return headers
  }

  static withSkipLoading(options?: HttpRequestOptions): HttpRequestOptions {
    const existingHeaders = options?.headers instanceof HttpHeaders
      ? options.headers
      : options?.headers
        ? this.createHeaders(options.headers as Record<string, string>)
        : new HttpHeaders()

    const headers = existingHeaders.set(SKIP_LOADING_HEADER, 'true')

    return {
      ...options,
      headers,
    }
  }

  static withSkipErrorHandler(options?: HttpRequestOptions): HttpRequestOptions {
    const existingHeaders = options?.headers instanceof HttpHeaders
      ? options.headers
      : options?.headers
        ? this.createHeaders(options.headers as Record<string, string>)
        : new HttpHeaders()

    const headers = existingHeaders.set(SKIP_ERROR_HANDLER_HEADER, 'true')

    return {
      ...options,
      headers,
    }
  }

  static withSkipBoth(options?: HttpRequestOptions): HttpRequestOptions {
    const existingHeaders = options?.headers instanceof HttpHeaders
      ? options.headers
      : options?.headers
        ? this.createHeaders(options.headers as Record<string, string>)
        : new HttpHeaders()

    const headers = existingHeaders
      .set(SKIP_LOADING_HEADER, 'true')
      .set(SKIP_ERROR_HANDLER_HEADER, 'true')

    return {
      ...options,
      headers,
    }
  }

  static forBackgroundPolling(options?: HttpRequestOptions): HttpRequestOptions {
    return this.withSkipBoth(options)
  }

  static forSilentRequest(options?: HttpRequestOptions): HttpRequestOptions {
    return this.withSkipBoth(options)
  }

  static forOptionalRequest(options?: HttpRequestOptions): HttpRequestOptions {
    return this.withSkipErrorHandler(options)
  }
}
