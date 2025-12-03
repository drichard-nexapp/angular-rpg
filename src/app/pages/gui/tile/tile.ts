import { Component, computed, EventEmitter, inject, input, Output, signal } from '@angular/core'
import { CharacterSchema, getAllItemsItemsGet, getNpcItemsNpcsItemsCodeGet, MapSchema } from '../../../../sdk/api'
import { Monster } from '../monster/monster'
import { CharacterUtils, TileUtils, unwrapApiResponse } from '../../../shared/utils'
import type { Character, Item, NpcItem } from '../../../domain/types'
import { InventoryService } from '../../../services/inventory.service'
import { MonstersService } from '../../../stores/monstersStore/monsters.service'
import { NpcService } from '../../../services/npc.service'
import { injectQuery } from '@tanstack/angular-query-experimental'
import { APP_CONFIG, QUERY_KEYS } from '../../../shared/constants'
import { MapService } from '../../../services/map.service'
import { ActionService } from '../../../services/action.service'
import { LoggerService } from '../../../services/logger.service'
import { ErrorHandlerService } from '../../../services/error-handler.service'
import { CharacterService } from '../../../services/character.service'
import { CooldownService } from '../../../services/cooldown.service'
import { getResourceImageUrl } from '../../../shared/asset-urls'

@Component({
  selector: 'app-tile',
  templateUrl: './tile.html',
  styleUrl: './tile.scss',
  imports: [Monster],
})
export class Tile {
  private inventoryService = inject(InventoryService)
  monstersService = inject(MonstersService)
  cooldownService = inject(CooldownService)
  errorHandler = inject(ErrorHandlerService)
  characterService = inject(CharacterService)
  actionService = inject(ActionService)
  logger = inject(LoggerService)
  mapService = inject(MapService)
  private npcService = inject(NpcService)
  private workshopCode = computed(() => TileUtils.getWorkshopCode(this.currentTileDetails()))

  isCharacterOnCooldown(character: Character): boolean {
    return this.cooldownService.isOnCooldown(character.name)
  }
  public currentTileDetails = input.required<MapSchema>()
  public selectedCharacter = input.required<CharacterSchema | null>()

  npcItemsQuery = injectQuery(() => ({
    queryKey: QUERY_KEYS.npcs.items(this.mapService.getNpcCode() ?? ''),
    queryFn: async (): Promise<NpcItem[]> => {
      const npcCode = this.mapService.getNpcCode()
      if (!npcCode) return []

      const response = await getNpcItemsNpcsItemsCodeGet({
        path: { code: npcCode },
        query: { size: 100 },
      })

      return unwrapApiResponse<NpcItem[]>(response, [])
    },
    enabled: !!this.mapService.getNpcCode(),
    staleTime: APP_CONFIG.CACHE.STALE_TIME_LONG,
  }))
  resourceDetails = computed(() => {
    const code = this.resourceCode()
    if (!code || code !== this.mapService.getResourceCode()) {
      return null
    }
    return this.mapService.getResourceData()
  })
  npcDetails = computed(() => {
    const code = this.npcCode()
    if (!code || code !== this.mapService.getNpcCode()) {
      return null
    }
    return this.mapService.getNpcData()
  })
  npcItems = computed(() => this.npcItemsQuery.data() ?? [])
  items = computed(() => this.itemsQuery.data() ?? [])
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
  npcActionInProgress = signal(false)
  craftingInProgress = signal(false)
  craftableItems = computed(() => {
    const workshop = this.workshopCode()
    if (!workshop) return []
    return this.items().filter((item) => item.craft?.skill === workshop)
  })

  showMonsterDetails = signal<boolean>(false)

  getInventoryQuantity(itemCode: string): number {
    return this.inventoryService.getItemQuantity(this.selectedCharacter(), itemCode)
  }

  canCraftItem(item: Item): boolean {
    return this.inventoryService.canCraftItem(this.selectedCharacter(), item)
  }

  private monsterCode = computed(() => TileUtils.getMonsterCode(this.currentTileDetails()))
  private resourceCode = computed(() => TileUtils.getResourceCode(this.currentTileDetails()))
  private npcCode = computed(() => TileUtils.getNpcCode(this.currentTileDetails()))

  @Output()
  public closeTrigger = new EventEmitter()

  public close() {
    this.closeTrigger.emit()
  }

  async fightMonster(): Promise<void> {
    const selected = this.selectedCharacter()
    if (!selected) return

    const result = await this.actionService.fightMonster()
    if (result.success) {
      const position = CharacterUtils.getPosition(selected)
      if (position) {
        this.mapService.setTilePosition(position)
      }
    } else if (result.error) {
      this.logger.error('Error fighting monster', 'GUI', result.error)
    }
  }

  async gatherResource(): Promise<void> {
    const selected = this.selectedCharacter()
    if (!selected) return

    const result = await this.actionService.gatherResource()
    if (result.success) {
      const position = CharacterUtils.getPosition(selected)
      if (position) {
        this.mapService.setTilePosition(position)
      }
    } else if (result.error) {
      this.logger.error('Error gathering resource', 'GUI', result.error)
    }
  }

  async buyItemFromNpc(itemCode: string, quantity: number): Promise<void> {
    this.npcActionInProgress.set(true)

    const result = await this.npcService.buyItemFromNpc(itemCode, quantity)
    if (!result.success && result.error) {
      this.errorHandler.handleError(result.error, 'NPC Purchase')
    }
    this.npcActionInProgress.set(false)
  }

  async sellItemToNpc(itemCode: string, quantity: number): Promise<void> {
    this.npcActionInProgress.set(true)

    const result = await this.npcService.sellItemToNpc(itemCode, quantity)
    if (!result.success && result.error) {
      this.errorHandler.handleError(result.error, 'NPC Sale')
    }
    this.npcActionInProgress.set(false)
  }

  async acceptTaskFromNpc(): Promise<void> {
    this.npcActionInProgress.set(true)

    const result = await this.npcService.acceptTaskFromNpc()
    if (!result.success && result.error) {
      this.errorHandler.handleError(result.error, 'NPC Task')
    }
    this.npcActionInProgress.set(false)
  }

  async craftItem(itemCode: string, quantity = 1): Promise<void> {
    const selected = this.selectedCharacter()
    if (!selected) return

    this.craftingInProgress.set(true)

    const result = await this.actionService.craftItem(itemCode, quantity)
    if (!result.success && result.error) {
      this.errorHandler.handleError(result.error, 'Crafting')
    }
    this.craftingInProgress.set(false)
  }

  async moveToSelectedTile(): Promise<void> {
    const tile = this.currentTileDetails()
    if (!tile) return

    const selected = this.selectedCharacter()
    if (!selected) return

    if (selected.x === tile.x && selected.y === tile.y) {
      this.errorHandler.handleError('Character is already at this position', 'Move')
      return
    }

    try {
      await this.characterService.moveCharacter(tile.x, tile.y)
    } catch (err) {
      this.logger.error('Error moving character', 'GUI', err)
    }
  }

  async loadMonsterDetails() {
    const monsterCode = this.monsterCode()
    if (monsterCode) {
      const monsterDetails = await this.monstersService.fetchMonsterDetails(monsterCode)
      this.mapService.setCurrentMonsterDetails(monsterDetails)
      this.showMonsterDetails.set(true)
    }
  }

  loadResourceDetails() {
    const resourceCode = this.resourceCode()
    if (resourceCode) {
      this.mapService.setResourceCode(resourceCode)
    }
  }

  loadNpcDetails() {
    const npcCode = this.npcCode()
    if (npcCode) {
      this.mapService.setNpcCode(npcCode)
    }
  }

  isMonsterTile(): boolean {
    return TileUtils.hasMonster(this.currentTileDetails())
  }

  isResourceTile(): boolean {
    return TileUtils.hasResource(this.currentTileDetails())
  }

  isNpcTile(): boolean {
    return TileUtils.hasNpc(this.currentTileDetails())
  }

  isWorkshopTile(): boolean {
    return TileUtils.hasWorkshop(this.currentTileDetails())
  }

  hideMonsterDetails() {
    this.showMonsterDetails.set(false)
  }

  hideResourceDetails() {
    this.mapService.setResourceCode(null)
  }

  hideNpcDetails() {
    this.mapService.setNpcCode(null)
  }
  getWorkshopType(): string {
    const code = this.workshopCode()
    if (!code) return 'Unknown'

    const workshopNames: Record<string, string> = {
      weaponcrafting: 'Weaponcrafting',
      gearcrafting: 'Gearcrafting',
      jewelrycrafting: 'Jewelrycrafting',
      cooking: 'Cooking',
      woodcutting: 'Woodcutting',
      mining: 'Mining',
      alchemy: 'Alchemy',
    }

    return workshopNames[code] || code
  }

  protected readonly getResourceImageUrl = getResourceImageUrl
}
