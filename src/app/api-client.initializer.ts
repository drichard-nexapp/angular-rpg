import { HttpClient } from '@angular/common/http'
import { inject } from '@angular/core'
import { client } from '../sdk/api/client.gen'

export function initializeApiClient() {
  const httpClient = inject(HttpClient)

  client.setConfig({
    baseUrl: 'https://api.artifactsmmo.com',
    httpClient: httpClient,
  })
}
