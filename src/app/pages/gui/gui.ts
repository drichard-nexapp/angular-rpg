import { Component, OnDestroy, computed, signal, inject } from '@angular/core'
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
import { unwrapApiResponse, unwrapApiItem } from '../../shared/utils'

@Component({
  selector: 'app-gui',
  imports: [Map],
  templateUrl: './gui.html',
  styleUrl: './gui.scss',
})
export class GUI implements OnDestroy {
  queryClient = injectQueryClient()
  private characterService = inject(CharacterService)
  private inventoryService = inject(InventoryService)
  private mapService = inject(MapService)
  private cooldownService = inject(CooldownService)
  private actionService = inject(ActionService)
  private npcService = inject(NpcService)
  skinService = inject(SkinService)

  selectedCharacter = this.characterService.getSelectedCharacterSignal()
  characters = this.characterService.getCharactersSignal()

  getSkinSymbol(skin: string): string {
    return this.skinService.getSymbol(skin)
  }

  npcItemsQuery = injectQuery(() => ({
    queryKey: ['npc-items', this.mapService.getNpcCode()],
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
    staleTime: 1000 * 60 * 60,
  }))

  activeEventsQuery = injectQuery(() => ({
    queryKey: ['active-events'],
    queryFn: async (): Promise<ActiveEvent[]> => {
      const response = await getAllActiveEventsEventsActiveGet()
      return unwrapApiResponse<ActiveEvent[]>(response, [])
    },
    staleTime: 1000 * 60,
    refetchInterval: 1000 * 60,
  }))

  itemsQuery = injectQuery(() => ({
    queryKey: ['all-items'],
    queryFn: async (): Promise<Item[]> => {
      const response = await getAllItemsItemsGet({
        query: { size: 1000 },
      })

      return unwrapApiResponse<Item[]>(response, [])
    },
    staleTime: 1000 * 60 * 60,
  }))

  currentTileDetails = computed(() => this.mapService.getTileData())
  activeEvents = computed(() => this.activeEventsQuery.data() ?? [])
  items = computed(() => this.itemsQuery.data() ?? [])
  craftableItems = computed(() =>
    this.items().filter(item => item.craft && item.craft.skill)
  )

  characterInventory = computed(() => {
    return this.inventoryService.getInventory(this.selectedCharacter())
  })

  getInventoryQuantity(itemCode: string): number {
    return this.inventoryService.getItemQuantity(this.selectedCharacter(), itemCode)
  }

  canCraftItem(item: Item): boolean {
    return this.inventoryService.canCraftItem(this.selectedCharacter(), item)
  }
  monsterDetails = computed(() => {
    const monsterCode = this.getMonsterCode()
    if (!monsterCode || monsterCode !== this.mapService.getMonsterCode()) {
      return null
    }
    return this.mapService.getMonsterData()
  })
  resourceDetails = computed(() => {
    const resourceCode = this.getResourceCode()
    if (!resourceCode || resourceCode !== this.mapService.getResourceCode()) {
      return null
    }
    return this.mapService.getResourceData()
  })
  npcDetails = computed(() => {
    const npcCode = this.getNpcCode()
    if (!npcCode || npcCode !== this.mapService.getNpcCode()) {
      return null
    }
    return this.mapService.getNpcData()
  })
  npcItems = computed(() => this.npcItemsQuery.data() ?? [])

  npcActionInProgress = signal(false)
  npcActionError = signal<string | null>(null)

  craftingInProgress = signal(false)
  craftingError = signal<string | null>(null)

  constructor() {
    this.characterService.loadCharactersList()
  }

  private getMonsterCode(): string | null {
    const tileData = this.currentTileDetails()
    if (!tileData) return null
    const tile = this.createTile(tileData)
    if (tile instanceof MonsterTile) {
      return tile.getMonsterCode()
    }
    return null
  }

  private getResourceCode(): string | null {
    const tileData = this.currentTileDetails()
    if (!tileData?.interactions?.content) return null
    if (tileData.interactions.content.type === 'resource') {
      return tileData.interactions.content.code
    }
    return null
  }

  private getNpcCode(): string | null {
    const tileData = this.currentTileDetails()
    if (!tileData?.interactions?.content) return null
    if (tileData.interactions.content.type === 'npc') {
      return tileData.interactions.content.code
    }
    return null
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
      this.mapService.setTilePosition({ x: character.x, y: character.y })
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
      console.error('Error moving character:', err)
    }
  }

  loadMonsterDetails() {
    const monsterCode = this.getMonsterCode()
    if (monsterCode) {
      this.mapService.setMonsterCode(monsterCode)
    }
  }

  loadResourceDetails() {
    const resourceCode = this.getResourceCode()
    if (resourceCode) {
      this.mapService.setResourceCode(resourceCode)
    }
  }

  loadNpcDetails() {
    const npcCode = this.getNpcCode()
    if (npcCode) {
      this.mapService.setNpcCode(npcCode)
    }
  }

  isMonsterTile(): boolean {
    const tileData = this.currentTileDetails()
    if (!tileData) return false
    const tile = this.createTile(tileData)
    return tile instanceof MonsterTile
  }

  isResourceTile(): boolean {
    return !!this.getResourceCode()
  }

  isNpcTile(): boolean {
    return !!this.getNpcCode()
  }

  isWorkshopTile(): boolean {
    const tileData = this.currentTileDetails()
    if (!tileData?.interactions?.content) return false
    return tileData.interactions.content.type === 'workshop'
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
      console.error('Error resting character:', result.error)
    }
  }

  async fightMonster(): Promise<void> {
    const result = await this.actionService.fightMonster()
    if (result.success) {
      const selected = this.selectedCharacter()
      if (selected) {
        this.mapService.setTilePosition({ x: selected.x, y: selected.y })
      }
    } else if (result.error) {
      console.error('Error fighting monster:', result.error)
    }
  }

  async gatherResource(): Promise<void> {
    const result = await this.actionService.gatherResource()
    if (result.success) {
      const selected = this.selectedCharacter()
      if (selected) {
        this.mapService.setTilePosition({ x: selected.x, y: selected.y })
      }
    } else if (result.error) {
      console.error('Error gathering resource:', result.error)
    }
  }

  async buyItemFromNpc(itemCode: string, quantity: number): Promise<void> {
    this.npcActionInProgress.set(true)
    this.npcActionError.set(null)

    const result = await this.npcService.buyItemFromNpc(itemCode, quantity)
    if (!result.success && result.error) {
      this.npcActionError.set(result.error)
    }
    this.npcActionInProgress.set(false)
  }

  async sellItemToNpc(itemCode: string, quantity: number): Promise<void> {
    this.npcActionInProgress.set(true)
    this.npcActionError.set(null)

    const result = await this.npcService.sellItemToNpc(itemCode, quantity)
    if (!result.success && result.error) {
      this.npcActionError.set(result.error)
    }
    this.npcActionInProgress.set(false)
  }

  async acceptTaskFromNpc(): Promise<void> {
    this.npcActionInProgress.set(true)
    this.npcActionError.set(null)

    const result = await this.npcService.acceptTaskFromNpc()
    if (!result.success && result.error) {
      this.npcActionError.set(result.error)
    }
    this.npcActionInProgress.set(false)
  }

  async craftItem(itemCode: string, quantity: number = 1): Promise<void> {
    this.craftingInProgress.set(true)
    this.craftingError.set(null)

    const result = await this.actionService.craftItem(itemCode, quantity)
    if (!result.success && result.error) {
      this.craftingError.set(result.error)
      console.error('Error crafting item:', result.error)
    }
    this.craftingInProgress.set(false)
  }

  ngOnDestroy() {
  }
}
