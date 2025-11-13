import { Injectable } from '@angular/core'
import type { Character, Inventory, Item } from '../domain/types'

export interface MaterialRequirement {
  code: string
  quantity: number
}

@Injectable({
  providedIn: 'root',
})
export class InventoryService {
  getInventory(character: Character | null): Inventory[] {
    if (!character || !character.inventory) {
      return []
    }
    return character.inventory
  }

  getItemQuantity(character: Character | null, itemCode: string): number {
    const inventory = this.getInventory(character)
    const slot = inventory.find((slot) => slot.code === itemCode)
    return slot ? slot.quantity : 0
  }

  hasItems(
    character: Character | null,
    requirements: MaterialRequirement[]
  ): boolean {
    if (!character) {
      return false
    }

    return requirements.every((requirement) => {
      const available = this.getItemQuantity(character, requirement.code)
      return available >= requirement.quantity
    })
  }

  canCraftItem(character: Character | null, item: Item): boolean {
    if (!item.craft || !item.craft.items) {
      return false
    }

    const requirements: MaterialRequirement[] = item.craft.items.map((material) => ({
      code: material.code,
      quantity: material.quantity,
    }))

    return this.hasItems(character, requirements)
  }

  getInventoryUsage(character: Character | null): {
    used: number
    max: number
    percentage: number
  } {
    if (!character) {
      return { used: 0, max: 0, percentage: 0 }
    }

    const used = this.getInventory(character).length
    const max = character.inventory_max_items || 0
    const percentage = max > 0 ? (used / max) * 100 : 0

    return { used, max, percentage }
  }

  isInventoryFull(character: Character | null): boolean {
    const usage = this.getInventoryUsage(character)
    return usage.used >= usage.max
  }

  hasInventorySpace(character: Character | null, requiredSlots: number = 1): boolean {
    const usage = this.getInventoryUsage(character)
    const availableSlots = usage.max - usage.used
    return availableSlots >= requiredSlots
  }

  getMissingMaterials(
    character: Character | null,
    requirements: MaterialRequirement[]
  ): MaterialRequirement[] {
    return requirements
      .map((requirement) => {
        const available = this.getItemQuantity(character, requirement.code)
        const missing = requirement.quantity - available
        return {
          code: requirement.code,
          quantity: missing > 0 ? missing : 0,
        }
      })
      .filter((item) => item.quantity > 0)
  }

  getAvailableMaterials(
    character: Character | null,
    requirements: MaterialRequirement[]
  ): Record<string, { required: number; available: number; missing: number }> {
    const result: Record<
      string,
      { required: number; available: number; missing: number }
    > = {}

    requirements.forEach((requirement) => {
      const available = this.getItemQuantity(character, requirement.code)
      const missing = Math.max(0, requirement.quantity - available)

      result[requirement.code] = {
        required: requirement.quantity,
        available,
        missing,
      }
    })

    return result
  }
}
