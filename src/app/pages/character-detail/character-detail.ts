import { Component, computed, inject, effect } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { injectQuery } from '@tanstack/angular-query-experimental'
import { getCharacterCharactersNameGet } from '../../../sdk/api'
import type { Character } from '../../domain/types'
import { unwrapApiItem } from '../../shared/utils'
import { QUERY_KEYS, APP_CONFIG } from '../../shared/constants'
import { SafePositionPipe } from '../../shared/pipes/safe-coordinate.pipe'
import { LoggerService } from '../../services/logger.service'

@Component({
  selector: 'app-character-detail',
  imports: [SafePositionPipe],
  templateUrl: './character-detail.html',
})
export class CharacterDetail {
  private route = inject(ActivatedRoute)
  private logger = inject(LoggerService)
  private characterName = this.route.snapshot.paramMap.get('name')

  characterQuery = injectQuery(() => ({
    queryKey: QUERY_KEYS.characters.detail(this.characterName || ''),
    queryFn: async (): Promise<Character> => {
      if (!this.characterName) {
        throw new Error('Character name not provided')
      }

      this.logger.info(
        `Fetching character: ${this.characterName}`,
        'CharacterDetail',
      )
      const response = await getCharacterCharactersNameGet({
        path: { name: this.characterName },
      })
      this.logger.info('API response:', 'CharacterDetail', response)

      const data = unwrapApiItem<Character>(response, null)
      this.logger.info('Unwrapped character data:', 'CharacterDetail', data)
      if (data) return data
      throw new Error('Failed to load character')
    },
    enabled: !!this.characterName,
    staleTime: APP_CONFIG.CACHE.STALE_TIME_1_MIN,
  }))

  character = computed(
    (): Character | null => this.characterQuery.data() ?? null,
  )
  loading = computed((): boolean => this.characterQuery.isPending())
  error = computed((): string | null => {
    if (!this.characterName) return 'Character name not provided'
    const err = this.characterQuery.error()
    return err ? (err as Error).message : null
  })

  constructor() {
    effect(() => {
      const char = this.character()
      if (char) {
        this.logger.info(`Character detail loaded:`, 'CharacterDetail', {
          name: char.name,
          skin: char.skin,
          x: char.x,
          y: char.y,
          typeOfX: typeof char.x,
          typeOfY: typeof char.y,
          fullCharacter: char,
        })
      }
    })
  }
}
