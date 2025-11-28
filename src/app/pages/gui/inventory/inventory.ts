import { Component, computed, EventEmitter, inject, input, Output, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { Character, type Item } from '../../../domain/types'
import { getItemImageUrl } from '../../../shared/asset-urls'
import { InventoryService } from '../../../services/inventory.service'
import { getAllItemsItemsGet, ItemSlot } from '../../../../sdk/api'
import { injectQuery } from '@tanstack/angular-query-experimental'
import { APP_CONFIG, QUERY_KEYS } from '../../../shared/constants'
import { unwrapApiResponse } from '../../../shared/utils'
import { ErrorHandlerService } from '../../../services/error-handler.service'
import { ActionService } from '../../../services/action.service'
import { CharacterService } from '../../../services/character.service'

@Component({
  selector: 'app-inventory',
  imports: [FormsModule],
  templateUrl: './inventory.html',
  styleUrl: './inventory.scss',
})
export class Inventory {
  private inventoryService = inject(InventoryService)
  private actionService = inject(ActionService)
  private characterService = inject(CharacterService)

  itemsQuery = injectQuery(() => ({
    queryKey: QUERY_KEYS.items.all(),
    queryFn: async (): Promise<Item[]> => {
      const response = await getAllItemsItemsGet({
        query: { size: 100 },
      })

      return unwrapApiResponse<Item[]>(response, [])
    },
    staleTime: APP_CONFIG.CACHE.STALE_TIME_LONG,
  }))

  characterInventory = computed(() => {
    return this.inventoryService.getInventory(this.selectedCharacter()).filter((s) => s.code)
  })
  errorHandler = inject(ErrorHandlerService)
  characters = this.characterService.getCharactersSignal()

  selectedCharacter = input.required<Character>()
  items = computed(() => this.itemsQuery.data() ?? [])
  givingItem = signal<{ code: string; quantity: number; slot: number } | null>(null)
  giveTargetCharacter = ''
  giveQuantity = 1
  canEquipItem(itemCode: string): boolean {
    const item = this.items().find((i) => i.code === itemCode)
    if (!item) return false

    const equipableTypes = [
      'weapon',
      'shield',
      'helmet',
      'body_armor',
      'leg_armor',
      'boots',
      'ring',
      'amulet',
      'artifact',
      'utility',
      'bag',
    ]
    return equipableTypes.includes(item.type)
  }

  async confirmGiveItem(): Promise<void> {
    const item = this.givingItem()
    if (!item || !this.giveTargetCharacter) return

    const result = await this.actionService.giveItems(this.giveTargetCharacter, [
      { code: item.code, quantity: this.giveQuantity },
    ])

    if (result.success) {
      this.errorHandler.handleSuccess(
        `Gave ${this.giveQuantity}× ${item.code} to ${this.giveTargetCharacter}`,
        'Give Item',
      )
      this.cancelGiveItem()
    }
  }

  async startEquipItem(slot: { code: string; quantity: number; slot: number }): Promise<void> {
    const itemSlot = this.getItemSlot(slot.code)
    if (!itemSlot) {
      this.errorHandler.handleError('Cannot determine item slot', 'Equip Item')
      return
    }

    const item = this.items().find((i) => i.code === slot.code)
    const quantity = item?.type === 'utility' ? 1 : undefined

    const result = await this.actionService.equipItem(slot.code, itemSlot, quantity)

    if (result.success) {
      this.errorHandler.handleSuccess(`Equipped ${slot.code}`, 'Equip Item')
    }
  }

  startGiveItem(slot: { code: string; quantity: number; slot: number }): void {
    this.givingItem.set(slot)
    this.giveQuantity = 1
    const otherChars = this.getOtherCharacters()
    if (otherChars.length > 0) {
      this.giveTargetCharacter = otherChars[0].name
    }
  }

  getOtherCharacters(): Character[] {
    const selected = this.selectedCharacter()
    if (!selected) return []
    return this.characters().filter((c) => c.name !== selected.name)
  }

  cancelGiveItem(): void {
    this.givingItem.set(null)
    this.giveTargetCharacter = ''
    this.giveQuantity = 1
  }

  getItemSlot(itemCode: string): ItemSlot | null {
    const item = this.items().find((i) => i.code === itemCode)
    if (!item) return null

    const typeToSlot: Record<string, ItemSlot> = {
      weapon: 'weapon',
      shield: 'shield',
      helmet: 'helmet',
      body_armor: 'body_armor',
      leg_armor: 'leg_armor',
      boots: 'boots',
      ring: 'ring1',
      amulet: 'amulet',
      artifact: 'artifact1',
      utility: 'utility1',
      bag: 'bag',
    }

    return typeToSlot[item.type] || null
  }

  getItemImageUrl(code: string): string {
    return getItemImageUrl(code)
  }

  @Output()
  // eslint-disable-next-line @angular-eslint/no-output-on-prefix
  public onClose = new EventEmitter()

  public close() {
    this.onClose.emit()
  }
}
