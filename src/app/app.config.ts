import {
  ApplicationConfig,
  provideZonelessChangeDetection,
  provideAppInitializer,
  inject,
} from '@angular/core'
import { provideRouter } from '@angular/router'
import { provideHttpClient } from '@angular/common/http'
import {
  provideAngularQuery,
  QueryClient,
} from '@tanstack/angular-query-experimental'

import { routes } from './app.routes'
import { initializeApiClient } from './api-client.initializer'

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    provideZonelessChangeDetection(),
    provideAngularQuery(
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5,
            gcTime: 1000 * 60 * 10,
          },
        },
      }),
    ),
    provideAppInitializer(() => {
      initializeApiClient()
    }),
  ],
}
