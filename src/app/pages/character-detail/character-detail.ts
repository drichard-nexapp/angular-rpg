import { Component, computed, inject } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { injectQuery } from '@tanstack/angular-query-experimental'
import { getCharacterCharactersNameGet } from '../../../sdk/api'
import type { Character } from '../../domain/types'

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
    queryFn: async (): Promise<Character> => {
      if (!this.characterName) {
        throw new Error('Character name not provided')
      }

      const response = await getCharacterCharactersNameGet({
        path: { name: this.characterName },
      })

      if (response && 'data' in response && response.data) {
        const data = (response.data as { data?: Character })?.data
        if (data) return data
      }
      throw new Error('Failed to load character')
    },
    enabled: !!this.characterName,
    staleTime: 1000 * 60,
  }))

  character = computed((): Character | null => this.characterQuery.data() ?? null)
  loading = computed((): boolean => this.characterQuery.isPending())
  error = computed((): string | null => {
    if (!this.characterName) return 'Character name not provided'
    const err = this.characterQuery.error()
    return err ? (err as Error).message : null
  })
}
