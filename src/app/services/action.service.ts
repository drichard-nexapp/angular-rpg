import { Injectable, inject } from '@angular/core'
import {
  actionRestMyNameActionRestPost,
  actionFightMyNameActionFightPost,
  actionGatheringMyNameActionGatheringPost,
  actionCraftingMyNameActionCraftingPost,
  actionGiveItemsMyNameActionGiveItemPost,
  actionEquipItemMyNameActionEquipPost,
  actionUnequipItemMyNameActionUnequipPost,
  type SimpleItemSchema,
  type ItemSlot,
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

      const data = unwrapApiItem<{ character: Character; cooldown: Cooldown }>(
        response,
        null,
      )
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
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to rest character'
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

      const data = unwrapApiItem<{
        characters: Character[]
        cooldown: Cooldown
      }>(response, null)
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
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fight monster'
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

      const data = unwrapApiItem<{ character: Character; cooldown: Cooldown }>(
        response,
        null,
      )
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
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to gather resource'
      return { success: false, error: errorMessage }
    }
  }

  async craftItem(
    itemCode: string,
    quantity = 1,
  ): Promise<ActionResult> {
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

      const data = unwrapApiItem<{ character: Character; cooldown: Cooldown }>(
        response,
        null,
      )
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
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to craft item'
      return { success: false, error: errorMessage }
    }
  }

  async giveItems(
    targetCharacter: string,
    items: SimpleItemSchema[],
  ): Promise<ActionResult> {
    const selected = this.characterService.getSelectedCharacter()
    if (!selected) {
      return { success: false, error: 'No character selected' }
    }

    if (this.cooldownService.isOnCooldown(selected.name)) {
      return { success: false, error: 'Character is on cooldown' }
    }

    try {
      const response = await actionGiveItemsMyNameActionGiveItemPost({
        path: { name: selected.name },
        body: {
          character: targetCharacter,
          items: items,
        },
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
        this.updateCharacterCache(character)
      }

      if (cooldown) {
        this.cooldownService.setCooldown(selected.name, cooldown)
      }

      return { success: true }
    } catch (err) {
      this.errorHandler.handleError(err, 'Give Items')
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to give items'
      return { success: false, error: errorMessage }
    }
  }

  async equipItem(
    itemCode: string,
    slot: ItemSlot,
    quantity?: number,
  ): Promise<ActionResult> {
    const selected = this.characterService.getSelectedCharacter()
    if (!selected) {
      return { success: false, error: 'No character selected' }
    }

    if (this.cooldownService.isOnCooldown(selected.name)) {
      return { success: false, error: 'Character is on cooldown' }
    }

    try {
      const response = await actionEquipItemMyNameActionEquipPost({
        path: { name: selected.name },
        body: {
          code: itemCode,
          slot: slot,
          quantity: quantity,
        },
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
        this.updateCharacterCache(character)
      }

      if (cooldown) {
        this.cooldownService.setCooldown(selected.name, cooldown)
      }

      return { success: true }
    } catch (err) {
      this.errorHandler.handleError(err, 'Equip Item')
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to equip item'
      return { success: false, error: errorMessage }
    }
  }

  async unequipItem(slot: ItemSlot, quantity?: number): Promise<ActionResult> {
    const selected = this.characterService.getSelectedCharacter()
    if (!selected) {
      return { success: false, error: 'No character selected' }
    }

    if (this.cooldownService.isOnCooldown(selected.name)) {
      return { success: false, error: 'Character is on cooldown' }
    }

    try {
      const response = await actionUnequipItemMyNameActionUnequipPost({
        path: { name: selected.name },
        body: {
          slot: slot,
          quantity: quantity,
        },
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
        this.updateCharacterCache(character)
      }

      if (cooldown) {
        this.cooldownService.setCooldown(selected.name, cooldown)
      }

      return { success: true }
    } catch (err) {
      this.errorHandler.handleError(err, 'Unequip Item')
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to unequip item'
      return { success: false, error: errorMessage }
    }
  }

  private updateCharacterCache(character: Character): void {
    this.characterService.updateCharacter(character)
  }
}
