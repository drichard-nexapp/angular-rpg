import { Component, inject, OnInit } from '@angular/core'
import { RouterOutlet } from '@angular/router'
import { CommonModule } from '@angular/common'
import { HttpClient } from '@angular/common/http'
import { client } from '../sdk/api/client.gen'
import { getMyCharactersMyCharactersGet } from '../sdk/api'
import { environment } from '../environments/environment'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  title = 'angular-app'
  characters: any[] = []
  loading = true
  error: string | null = null

  private httpClient = inject(HttpClient)

  async ngOnInit() {
    try {
      this.loading = true

      client.setConfig({
        baseUrl: 'https://api.artifactsmmo.com',
        httpClient: this.httpClient,
        headers: {
          Authorization: `Bearer ${environment.token}`,
        },
      })

      const response = await getMyCharactersMyCharactersGet()
      if (response && 'data' in response) {
        this.characters = (response.data as any)?.data || []
      }
    } catch (err: any) {
      this.error = err?.message || 'Failed to load characters'
      console.error('Error loading characters:', err)
    } finally {
      this.loading = false
    }
  }
}
