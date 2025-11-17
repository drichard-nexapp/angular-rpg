import { Component, computed, signal, inject } from '@angular/core'
import {
  injectQuery,
  injectQueryClient,
} from '@tanstack/angular-query-experimental'
import {
  getNpcItemsNpcsItemsCodeGet,
  getAllActiveEventsEventsActiveGet,
  getAllItemsItemsGet,
  type CharacterSkin,
} from '../../../sdk/api'
import { Map } from '../map/map'
import { TileBase, TileFactory, MonsterTile } from '../../domain/tile'
import type {
  Character,
  Cooldown,
  Monster,
  Resource,
  Npc,
  NpcItem,
  Item,
  TilePosition,
  CooldownTracking,
  Map as MapTile,
  ActiveEvent,
} from '../../domain/types'
import { CharacterService } from '../../services/character.service'
import { InventoryService } from '../../services/inventory.service'
import { MapService } from '../../services/map.service'
import { CooldownService } from '../../services/cooldown.service'
import { SkinService } from '../../services/skin.service'
import { ActionService } from '../../services/action.service'
import { NpcService } from '../../services/npc.service'
import { ErrorHandlerService } from '../../services/error-handler.service'
import { LoggerService } from '../../services/logger.service'
import { unwrapApiResponse, unwrapApiItem } from '../../shared/utils'
import { QUERY_KEYS } from '../../shared/constants/query-keys'
import { APP_CONFIG } from '../../shared/constants/app-config'
import { TileUtils, CharacterUtils } from '../../shared/utils'
import { ErrorDisplay } from '../../components/shared/error-display/error-display'

@Component({
  selector: 'app-gui',
  imports: [Map, ErrorDisplay],
  templateUrl: './gui.html',
  styleUrl: './gui.scss',
})
export class GUI {
  queryClient = injectQueryClient()
  private characterService = inject(CharacterService)
  private inventoryService = inject(InventoryService)
  private mapService = inject(MapService)
  private cooldownService = inject(CooldownService)
  private actionService = inject(ActionService)
  private npcService = inject(NpcService)
  private logger = inject(LoggerService)
  errorHandler = inject(ErrorHandlerService)
  skinService = inject(SkinService)

  selectedCharacter = this.characterService.getSelectedCharacterSignal()
  characters = this.characterService.getCharactersSignal()

  getSkinSymbol(skin: string): string {
    const symbol = this.skinService.getSymbol(skin)
    if (symbol === '❓') {
      this.logger.warn(`Unknown skin type: ${skin}`, 'GUI')
    }
    return symbol
  }

  npcItemsQuery = injectQuery(() => ({
    queryKey: QUERY_KEYS.npcs.items(this.mapService.getNpcCode() || ''),
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

  activeEventsQuery = injectQuery(() => ({
    queryKey: QUERY_KEYS.events.active(),
    queryFn: async (): Promise<ActiveEvent[]> => {
      const response = await getAllActiveEventsEventsActiveGet()
      return unwrapApiResponse<ActiveEvent[]>(response, [])
    },
    staleTime: APP_CONFIG.CACHE.STALE_TIME_1_MIN,
    refetchInterval: APP_CONFIG.CACHE.REFETCH_INTERVAL_1_MIN,
  }))

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

  currentTileDetails = computed(() => this.mapService.getTileData())
  activeEvents = computed(() => this.activeEventsQuery.data() ?? [])
  items = computed(() => this.itemsQuery.data() ?? [])
  craftableItems = computed(() =>
    this.items().filter((item) => item.craft && item.craft.skill),
  )

  characterInventory = computed(() => {
    return this.inventoryService.getInventory(this.selectedCharacter())
  })

  getInventoryQuantity(itemCode: string): number {
    return this.inventoryService.getItemQuantity(
      this.selectedCharacter(),
      itemCode,
    )
  }

  canCraftItem(item: Item): boolean {
    return this.inventoryService.canCraftItem(this.selectedCharacter(), item)
  }

  private monsterCode = computed(() =>
    TileUtils.getMonsterCode(this.currentTileDetails()),
  )
  private resourceCode = computed(() =>
    TileUtils.getResourceCode(this.currentTileDetails()),
  )
  private npcCode = computed(() =>
    TileUtils.getNpcCode(this.currentTileDetails()),
  )

  monsterDetails = computed(() => {
    const code = this.monsterCode()
    if (!code || code !== this.mapService.getMonsterCode()) {
      return null
    }
    return this.mapService.getMonsterData()
  })
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

  npcActionInProgress = signal(false)
  craftingInProgress = signal(false)

  constructor() {
    this.characterService.loadCharactersList()
  }

  createTile(tileData: MapTile): TileBase | null {
    if (!tileData) return null
    return TileFactory.createTile(tileData)
  }

  selectCharacter(character: Character): void {
    if (this.selectedCharacter() === character) {
      this.characterService.selectCharacter(null)
      this.mapService.clearAll()
    } else {
      this.characterService.selectCharacter(character)

      const position = CharacterUtils.getPosition(character)
      if (position) {
        this.mapService.setTilePosition(position)
      } else {
        this.logger.error('Character has invalid coordinates', 'GUI', { character })
      }

      this.mapService.setMonsterCode(null)
      this.mapService.setResourceCode(null)
      this.mapService.setNpcCode(null)
    }
  }

  isSelected(character: Character): boolean {
    return this.selectedCharacter() === character
  }

  async onTileClick(tile: MapTile): Promise<void> {
    if (!tile) return

    const selected = this.selectedCharacter()

    if (!selected) {
      this.mapService.setTilePosition({ x: tile.x, y: tile.y })
      this.mapService.setMonsterCode(null)
      this.mapService.setResourceCode(null)
      this.mapService.setNpcCode(null)
      return
    }

    try {
      await this.characterService.moveCharacter(tile.x, tile.y)
      this.mapService.setTilePosition({ x: tile.x, y: tile.y })
      this.mapService.setMonsterCode(null)
      this.mapService.setResourceCode(null)
      this.mapService.setNpcCode(null)
    } catch (err) {
      this.logger.error('Error moving character', 'GUI', err)
    }
  }

  loadMonsterDetails() {
    const monsterCode = this.monsterCode()
    if (monsterCode) {
      this.mapService.setMonsterCode(monsterCode)
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
    this.mapService.setMonsterCode(null)
  }

  hideResourceDetails() {
    this.mapService.setResourceCode(null)
  }

  hideNpcDetails() {
    this.mapService.setNpcCode(null)
  }

  closeTileDetails() {
    this.mapService.clearAll()
  }

  getCharacterCooldown(characterName: string): CooldownTracking | null {
    return this.cooldownService.getCooldown(characterName)
  }

  isCharacterOnCooldown(character: Character): boolean {
    return this.cooldownService.isOnCooldown(character.name)
  }

  isCharacterHpFull(character: Character): boolean {
    if (!character) return false
    return character.hp >= character.max_hp
  }

  async restCharacter(): Promise<void> {
    const result = await this.actionService.restCharacter()
    if (!result.success && result.error) {
      this.logger.error('Error resting character', 'GUI', result.error)
    }
  }

  async fightMonster(): Promise<void> {
    const result = await this.actionService.fightMonster()
    if (result.success) {
      const selected = this.selectedCharacter()
      const position = CharacterUtils.getPosition(selected)
      if (position) {
        this.mapService.setTilePosition(position)
      }
    } else if (result.error) {
      this.logger.error('Error fighting monster', 'GUI', result.error)
    }
  }

  async gatherResource(): Promise<void> {
    const result = await this.actionService.gatherResource()
    if (result.success) {
      const selected = this.selectedCharacter()
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

  async craftItem(itemCode: string, quantity: number = 1): Promise<void> {
    this.craftingInProgress.set(true)

    const result = await this.actionService.craftItem(itemCode, quantity)
    if (!result.success && result.error) {
      this.errorHandler.handleError(result.error, 'Crafting')
    }
    this.craftingInProgress.set(false)
  }
}
