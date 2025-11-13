import { Injectable, inject } from '@angular/core'
import {
  actionRestMyNameActionRestPost,
  actionFightMyNameActionFightPost,
  actionGatheringMyNameActionGatheringPost,
  actionCraftingMyNameActionCraftingPost,
} from '../../sdk/api'
import type { Character, Cooldown } from '../domain/types'
import { CharacterService } from './character.service'
import { CooldownService } from './cooldown.service'
import { ErrorHandlerService } from './error-handler.service'
import { unwrapApiItem } from '../shared/utils'

export interface ActionResult {
  success: boolean
  error?: string
}

@Injectable({
  providedIn: 'root',
})
export class ActionService {
  private characterService = inject(CharacterService)
  private cooldownService = inject(CooldownService)
  private errorHandler = inject(ErrorHandlerService)

  async restCharacter(): Promise<ActionResult> {
    const selected = this.characterService.getSelectedCharacter()
    if (!selected) {
      return { success: false, error: 'No character selected' }
    }

    if (this.cooldownService.isOnCooldown(selected.name)) {
      return { success: false, error: 'Character is on cooldown' }
    }

    try {
      const response = await actionRestMyNameActionRestPost({
        path: { name: selected.name },
      })

      const data = unwrapApiItem<{ character: Character; cooldown: Cooldown }>(response, null)
      if (!data) {
        return { success: false, error: 'Invalid response from server' }
      }

      const { character, cooldown } = data

      if (character) {
        this.updateCharacterCache(character)
      }

      if (cooldown) {
        this.cooldownService.setCooldown(selected.name, cooldown)
      }

      return { success: true }
    } catch (err) {
      this.errorHandler.handleError(err, 'Rest Character')
      const errorMessage = err instanceof Error ? err.message : 'Failed to rest character'
      return { success: false, error: errorMessage }
    }
  }

  async fightMonster(): Promise<ActionResult> {
    const selected = this.characterService.getSelectedCharacter()
    if (!selected) {
      return { success: false, error: 'No character selected' }
    }

    if (this.cooldownService.isOnCooldown(selected.name)) {
      return { success: false, error: 'Character is on cooldown' }
    }

    try {
      const response = await actionFightMyNameActionFightPost({
        path: { name: selected.name },
      })

      const data = unwrapApiItem<{ characters: Character[]; cooldown: Cooldown }>(response, null)
      if (!data) {
        return { success: false, error: 'Invalid response from server' }
      }

      const { characters, cooldown } = data
      const character = characters.find((c) => c.name === selected.name)

      if (character) {
        this.updateCharacterCache(character)
      }

      if (cooldown) {
        this.cooldownService.setCooldown(selected.name, cooldown)
      }

      return { success: true }
    } catch (err) {
      this.errorHandler.handleError(err, 'Fight Monster')
      const errorMessage = err instanceof Error ? err.message : 'Failed to fight monster'
      return { success: false, error: errorMessage }
    }
  }

  async gatherResource(): Promise<ActionResult> {
    const selected = this.characterService.getSelectedCharacter()
    if (!selected) {
      return { success: false, error: 'No character selected' }
    }

    if (this.cooldownService.isOnCooldown(selected.name)) {
      return { success: false, error: 'Character is on cooldown' }
    }

    try {
      const response = await actionGatheringMyNameActionGatheringPost({
        path: { name: selected.name },
      })

      const data = unwrapApiItem<{ character: Character; cooldown: Cooldown }>(response, null)
      if (!data) {
        return { success: false, error: 'Invalid response from server' }
      }

      const { character, cooldown } = data

      if (character) {
        this.updateCharacterCache(character)
      }

      if (cooldown) {
        this.cooldownService.setCooldown(selected.name, cooldown)
      }

      return { success: true }
    } catch (err) {
      this.errorHandler.handleError(err, 'Gather Resource')
      const errorMessage = err instanceof Error ? err.message : 'Failed to gather resource'
      return { success: false, error: errorMessage }
    }
  }

  async craftItem(itemCode: string, quantity: number = 1): Promise<ActionResult> {
    const selected = this.characterService.getSelectedCharacter()
    if (!selected) {
      return { success: false, error: 'No character selected' }
    }

    if (this.cooldownService.isOnCooldown(selected.name)) {
      return { success: false, error: 'Character is on cooldown' }
    }

    try {
      const response = await actionCraftingMyNameActionCraftingPost({
        path: { name: selected.name },
        body: { code: itemCode, quantity },
      })

      const data = unwrapApiItem<{ character: Character; cooldown: Cooldown }>(response, null)
      if (!data) {
        return { success: false, error: 'Invalid response from server' }
      }

      const { character, cooldown } = data

      if (character) {
        this.updateCharacterCache(character)
      }

      if (cooldown) {
        this.cooldownService.setCooldown(selected.name, cooldown)
      }

      return { success: true }
    } catch (err) {
      this.errorHandler.handleError(err, 'Craft Item')
      const errorMessage = err instanceof Error ? err.message : 'Failed to craft item'
      return { success: false, error: errorMessage }
    }
  }

  private updateCharacterCache(character: Character): void {
    this.characterService.updateCharacter(character)
  }
}
