import {
  ApplicationConfig,
  ErrorHandler,
  provideZonelessChangeDetection,
  provideAppInitializer,
} from '@angular/core'
import { provideRouter } from '@angular/router'
import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http'
import {
  provideTanStackQuery,
  QueryClient,
} from '@tanstack/angular-query-experimental'

import { routes } from './app.routes'
import { initializeApiClient } from './api-client.initializer'
import {
  authInterceptor,
  errorInterceptor,
  loadingInterceptor,
} from './interceptors'
import { APP_CONFIG } from './shared/constants'
import { GlobalErrorHandler } from './services'

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([authInterceptor, errorInterceptor, loadingInterceptor]),
      withFetch(),
    ),
    provideZonelessChangeDetection(),
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    provideTanStackQuery(
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: APP_CONFIG.CACHE.STALE_TIME_MEDIUM,
            gcTime: APP_CONFIG.CACHE.GC_TIME_DEFAULT,
            retry: 1,
            refetchOnWindowFocus: false,
            refetchOnReconnect: true,
          },
        },
      }),
    ),
    provideAppInitializer(() => {
      initializeApiClient()
    }),
  ],
}
