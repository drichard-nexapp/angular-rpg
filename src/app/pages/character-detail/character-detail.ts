import { Component, computed, inject } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { injectQuery } from '@tanstack/angular-query-experimental'
import { getCharacterCharactersNameGet } from '../../../sdk/api'

@Component({
  selector: 'app-character-detail',
  imports: [],
  templateUrl: './character-detail.html',
  styleUrl: './character-detail.scss',
})
export class CharacterDetail {
  private route = inject(ActivatedRoute)
  private characterName = this.route.snapshot.paramMap.get('name')

  characterQuery = injectQuery(() => ({
    queryKey: ['character', this.characterName],
    queryFn: async () => {
      if (!this.characterName) {
        throw new Error('Character name not provided')
      }

      const response = await getCharacterCharactersNameGet({
        path: { name: this.characterName },
      })

      if (response && 'data' in response) {
        return (response.data as any)?.data
      }
      throw new Error('Failed to load character')
    },
    enabled: !!this.characterName,
    staleTime: 1000 * 60,
  }))

  character = computed(() => this.characterQuery.data() ?? null)
  loading = computed(() => this.characterQuery.isPending())
  error = computed(() => {
    if (!this.characterName) return 'Character name not provided'
    const err = this.characterQuery.error()
    return err ? (err as Error).message : null
  })
}
