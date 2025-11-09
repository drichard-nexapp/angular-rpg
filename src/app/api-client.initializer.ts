import { HttpClient } from '@angular/common/http'
import { inject } from '@angular/core'
import { client } from '../sdk/api/client.gen'
import { environmentLocal } from '../environments/environment.local'

export function initializeApiClient() {
  const httpClient = inject(HttpClient)

  client.setConfig({
    baseUrl: 'https://api.artifactsmmo.com',
    httpClient: httpClient,
    headers: {
      Authorization: `Bearer ${environmentLocal.token}`,
    },
  })
}
