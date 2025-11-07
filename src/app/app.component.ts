import { Component, inject, signal, effect } from '@angular/core'
import { RouterOutlet } from '@angular/router'
import { HttpClient } from '@angular/common/http'
import { client } from '../sdk/api/client.gen'
import { getMyCharactersMyCharactersGet } from '../sdk/api'
import { environmentLocal } from '../environments/environment.local'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'angular-app'

  // Reactive state using signals
  characters = signal<any[]>([])
  loading = signal(true)
  error = signal<string | null>(null)

  private httpClient = inject(HttpClient)

  constructor() {
    // Configure client on initialization
    client.setConfig({
      baseUrl: 'https://api.artifactsmmo.com',
      httpClient: this.httpClient,
      headers: {
        Authorization: `Bearer ${environmentLocal.token}`,
      },
    })

    // Load characters
    this.loadCharacters()
  }

  private async loadCharacters() {
    try {
      this.loading.set(true)
      this.error.set(null)

      const response = await getMyCharactersMyCharactersGet()
      if (response && 'data' in response) {
        this.characters.set((response.data as any)?.data || [])
      }
    } catch (err: any) {
      this.error.set(err?.message || 'Failed to load characters')
      console.error('Error loading characters:', err)
    } finally {
      this.loading.set(false)
    }
  }
}
