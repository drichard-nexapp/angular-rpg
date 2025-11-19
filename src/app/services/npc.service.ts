import { Injectable, inject } from '@angular/core'
import {
  actionNpcBuyItemMyNameActionNpcBuyPost,
  actionNpcSellItemMyNameActionNpcSellPost,
  actionAcceptNewTaskMyNameActionTaskNewPost,
} from '../../sdk/api'
import type { Character, Cooldown } from '../domain/types'
import { CharacterService } from './character.service'
import { CooldownService } from './cooldown.service'
import { ErrorHandlerService } from './error-handler.service'
import { unwrapApiItem } from '../shared/utils'

export interface NpcActionResult {
  success: boolean
  error?: string
}

@Injectable({
  providedIn: 'root',
})
export class NpcService {
  private characterService = inject(CharacterService)
  private cooldownService = inject(CooldownService)
  private errorHandler = inject(ErrorHandlerService)

  async buyItemFromNpc(
    itemCode: string,
    quantity: number,
  ): Promise<NpcActionResult> {
    const selected = this.characterService.getSelectedCharacter()
    if (!selected) {
      return { success: false, error: 'No character selected' }
    }

    if (this.cooldownService.isOnCooldown(selected.name)) {
      return { success: false, error: 'Character is on cooldown' }
    }

    try {
      const response = await actionNpcBuyItemMyNameActionNpcBuyPost({
        path: { name: selected.name },
        body: { code: itemCode, quantity },
      })

      const data = unwrapApiItem<{ character: Character; cooldown: Cooldown }>(
        response,
        null,
      )
      if (!data) {
        return { success: false, error: 'Invalid response from server' }
      }

      const { character, cooldown } = data

      if (character) {
        this.characterService.updateCharacter(character)
      }

      if (cooldown) {
        this.cooldownService.setCooldown(selected.name, cooldown)
      }

      return { success: true }
    } catch (err) {
      this.errorHandler.handleError(err, 'Buy Item from NPC')
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to buy item'
      return { success: false, error: errorMessage }
    }
  }

  async sellItemToNpc(
    itemCode: string,
    quantity: number,
  ): Promise<NpcActionResult> {
    const selected = this.characterService.getSelectedCharacter()
    if (!selected) {
      return { success: false, error: 'No character selected' }
    }

    if (this.cooldownService.isOnCooldown(selected.name)) {
      return { success: false, error: 'Character is on cooldown' }
    }

    try {
      const response = await actionNpcSellItemMyNameActionNpcSellPost({
        path: { name: selected.name },
        body: { code: itemCode, quantity },
      })

      const data = unwrapApiItem<{ character: Character; cooldown: Cooldown }>(
        response,
        null,
      )
      if (!data) {
        return { success: false, error: 'Invalid response from server' }
      }

      const { character, cooldown } = data

      if (character) {
        this.characterService.updateCharacter(character)
      }

      if (cooldown) {
        this.cooldownService.setCooldown(selected.name, cooldown)
      }

      return { success: true }
    } catch (err) {
      this.errorHandler.handleError(err, 'Sell Item to NPC')
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to sell item'
      return { success: false, error: errorMessage }
    }
  }

  async acceptTaskFromNpc(): Promise<NpcActionResult> {
    const selected = this.characterService.getSelectedCharacter()
    if (!selected) {
      return { success: false, error: 'No character selected' }
    }

    if (this.cooldownService.isOnCooldown(selected.name)) {
      return { success: false, error: 'Character is on cooldown' }
    }

    try {
      const response = await actionAcceptNewTaskMyNameActionTaskNewPost({
        path: { name: selected.name },
      })

      const data = unwrapApiItem<{ character: Character; cooldown: Cooldown }>(
        response,
        null,
      )
      if (!data) {
        return { success: false, error: 'Invalid response from server' }
      }

      const { character, cooldown } = data

      if (character) {
        this.characterService.updateCharacter(character)
      }

      if (cooldown) {
        this.cooldownService.setCooldown(selected.name, cooldown)
      }

      return { success: true }
    } catch (err) {
      this.errorHandler.handleError(err, 'Accept Task from NPC')
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to accept task'
      return { success: false, error: errorMessage }
    }
  }
}
