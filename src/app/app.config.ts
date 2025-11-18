import {
  ApplicationConfig,
  ErrorHandler,
  provideZonelessChangeDetection,
  provideAppInitializer,
  inject,
} from '@angular/core'
import { provideRouter } from '@angular/router'
import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http'
import {
  provideAngularQuery,
  QueryClient,
} from '@tanstack/angular-query-experimental'

import { routes } from './app.routes'
import { initializeApiClient } from './api-client.initializer'
import { authInterceptor } from './interceptors/auth.interceptor'
import { errorInterceptor } from './interceptors/error.interceptor'
import { loadingInterceptor } from './interceptors/loading.interceptor'
import { APP_CONFIG } from './shared/constants/app-config'
import { GlobalErrorHandler } from './services/global-error-handler'

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([authInterceptor, errorInterceptor, loadingInterceptor]),
      withFetch(),
    ),
    provideZonelessChangeDetection(),
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    provideAngularQuery(
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
