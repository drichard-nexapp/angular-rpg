import { Component, OnInit, signal, inject } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { getCharacterCharactersNameGet } from '../../../sdk/api'

@Component({
  selector: 'app-character-detail',
  imports: [],
  templateUrl: './character-detail.html',
  styleUrl: './character-detail.scss',
})
export class CharacterDetail implements OnInit {
  private route = inject(ActivatedRoute)

  character = signal<any>(null)
  loading = signal(true)
  error = signal<string | null>(null)

  ngOnInit() {
    this.loadCharacter()
  }

  private async loadCharacter() {
    const name = this.route.snapshot.paramMap.get('name')

    if (!name) {
      this.error.set('Character name not provided')
      this.loading.set(false)
      return
    }

    try {
      this.loading.set(true)
      this.error.set(null)

      const response = await getCharacterCharactersNameGet({
        path: { name },
      })

      if (response && 'data' in response) {
        this.character.set((response.data as any)?.data)
      }
    } catch (err: any) {
      this.error.set(err?.message || 'Failed to load character')
      console.error('Error loading character:', err)
    } finally {
      this.loading.set(false)
    }
  }
}
