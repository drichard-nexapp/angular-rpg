import { Injectable, signal, computed, inject } from '@angular/core'
import { injectQueryClient } from '@tanstack/angular-query-experimental'
import {
  getMyCharactersMyCharactersGet,
  getCharacterCharactersNameGet,
  actionMoveMyNameActionMovePost,
} from '../../sdk/api'
import type { Character, Cooldown } from '../domain/types'
import { CooldownService } from './cooldown.service'
import { unwrapApiResponse, unwrapApiItem } from '../shared/utils'

@Injectable({
  providedIn: 'root',
})
export class CharacterService {
  private queryClient = injectQueryClient()
  private cooldownService = inject(CooldownService)

  private selectedCharacter = signal<Character | null>(null)
  private charactersData = signal<Character[]>([])

  characters = computed(() => this.charactersData())

  constructor() {}

  getSelectedCharacter(): Character | null {
    return this.selectedCharacter()
  }

  getSelectedCharacterSignal() {
    return this.selectedCharacter
  }

  getCharactersSignal() {
    return this.characters
  }

  async loadCharactersList(): Promise<void> {
    const response = await getMyCharactersMyCharactersGet()
    const charactersData = unwrapApiResponse<Character[]>(response, [])
    this.charactersData.set(charactersData)

    for (const char of charactersData) {
      await this.loadCharacterDetails(char.name)
    }
  }

  async loadCharacterDetails(name: string): Promise<void> {
    try {
      const response = await getCharacterCharactersNameGet({
        path: { name },
      })

      const characterData = unwrapApiItem<Character>(response, null)
      if (characterData) {
        this.queryClient.setQueryData<Character>(['character', name], characterData)

        this.charactersData.update(chars => {
          const index = chars.findIndex(c => c.name === name)
          if (index >= 0) {
            const updated = [...chars]
            updated[index] = characterData
            return updated
          }
          return [...chars, characterData]
        })

        if (characterData.cooldown && characterData.cooldown > 0) {
          const cooldown: Cooldown = {
            total_seconds: characterData.cooldown,
            remaining_seconds: characterData.cooldown,
            started_at: characterData.cooldown_expiration || '',
            expiration: characterData.cooldown_expiration || '',
            reason: 'movement' as const,
          }
          this.cooldownService.setCooldown(name, cooldown)
        }
      }
    } catch (err) {
      console.error(`Error fetching character details for ${name}:`, err)
      throw err
    }
  }

  selectCharacter(character: Character | null): void {
    this.selectedCharacter.set(character)
  }

  async moveCharacter(x: number, y: number): Promise<void> {
    const selected = this.selectedCharacter()
    if (!selected) {
      throw new Error('No character selected')
    }

    if (this.cooldownService.isOnCooldown(selected.name)) {
      throw new Error('Character is on cooldown')
    }

    try {
      const response = await actionMoveMyNameActionMovePost({
        path: { name: selected.name },
        body: { x, y },
      })

      const data = unwrapApiItem<{ character: Character; cooldown: Cooldown }>(response, null)
      if (!data) return

      const { character, cooldown } = data

      if (character) {
        this.updateCharacter(character)
      }

      if (cooldown) {
        this.cooldownService.setCooldown(selected.name, cooldown)
      }
    } catch (err) {
      console.error('Error moving character:', err)
      throw err
    }
  }

  updateCharacter(character: Character): void {
    this.queryClient.setQueryData<Character>(
      ['character', character.name],
      character
    )

    this.charactersData.update(chars => {
      const index = chars.findIndex(c => c.name === character.name)
      if (index >= 0) {
        const updated = [...chars]
        updated[index] = character
        return updated
      }
      return chars
    })

    this.selectedCharacter.set(character)
  }
}
