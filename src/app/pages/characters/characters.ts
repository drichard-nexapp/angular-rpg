import { Component, OnInit, signal } from '@angular/core'
import { RouterLink } from '@angular/router'
import { getMyCharactersMyCharactersGet } from '../../../sdk/api'

@Component({
  selector: 'app-characters',
  imports: [RouterLink],
  templateUrl: './characters.html',
  styleUrl: './characters.scss',
})
export class Characters implements OnInit {
  characters = signal<any[]>([])
  loading = signal(true)
  error = signal<string | null>(null)

  ngOnInit() {
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
