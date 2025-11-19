import { Component, computed, signal, inject } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { injectQuery } from '@tanstack/angular-query-experimental'
import {
  getNpcItemsNpcsItemsCodeGet,
  getAllActiveEventsEventsActiveGet,
  getAllItemsItemsGet,
  ItemSlot,
} from '../../../sdk/api'
import { Map } from '../map/map'
import type {
  Character,
  NpcItem,
  Item,
  CooldownTracking,
  Map as MapTile,
  ActiveEvent,
} from '../../domain/types'
import {
  CharacterService,
  InventoryService,
  MapService,
  CooldownService,
  ActionService,
  NpcService,
  ErrorHandlerService,
  LoggerService,
} from '../../services'
import { ActionQueueService } from '../../services/action-queue.service'
import { MacroService } from '../../services/macro.service'
import { ActionExecutorService } from '../../services/action-executor.service'
import { unwrapApiResponse } from '../../shared/utils'
import { QUERY_KEYS, APP_CONFIG } from '../../shared/constants'
import { TileUtils, CharacterUtils } from '../../shared/utils'
import { ErrorDisplay } from '../../components/shared/error-display/error-display'
import {
  getItemImageUrl,
  getMonsterImageUrl,
  getResourceImageUrl,
} from '../../shared/asset-urls'

@Component({
  selector: 'app-gui',
  imports: [Map, ErrorDisplay, FormsModule],
  templateUrl: './gui.html',
  styleUrl: './gui.scss',
})
export class GUI {
  private characterService = inject(CharacterService)
  private inventoryService = inject(InventoryService)
  private mapService = inject(MapService)
  private cooldownService = inject(CooldownService)
  private actionService = inject(ActionService)
  queueService = inject(ActionQueueService)
  macroService = inject(MacroService)
  private actionExecutor = inject(ActionExecutorService)
  private npcService = inject(NpcService)
  private logger = inject(LoggerService)
  errorHandler = inject(ErrorHandlerService)

  selectedCharacter = this.characterService.getSelectedCharacterSignal()
  characters = this.characterService.getCharactersSignal()
  scrollToPosition = signal<{ x: number; y: number } | null>(null)
  selectedTile = signal<MapTile | null>(null)

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
  craftableItems = computed(() => {
    const workshop = this.workshopCode()
    if (!workshop) return []
    return this.items().filter(
      (item) => item.craft && item.craft.skill === workshop,
    )
  })

  characterInventory = computed(() => {
    return this.inventoryService.getInventory(this.selectedCharacter())
  })

  givingItem = signal<{ code: string; quantity: number; slot: number } | null>(
    null,
  )
  giveTargetCharacter = ''
  giveQuantity = 1

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
  private workshopCode = computed(() =>
    TileUtils.getWorkshopCode(this.currentTileDetails()),
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

  showInventory = signal(false)
  showSkills = signal(false)
  showEquipment = signal(false)

  constructor() {
    this.characterService.loadCharactersList()
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
        this.logger.error('Character has invalid coordinates', 'GUI', {
          character,
        })
      }

      this.mapService.setMonsterCode(null)
      this.mapService.setResourceCode(null)
      this.mapService.setNpcCode(null)
    }
  }

  isSelected(character: Character): boolean {
    return this.selectedCharacter() === character
  }

  onTileClick(tile: MapTile): void {
    if (!tile) return
    this.selectedTile.set(tile)
    this.mapService.setTilePosition({ x: tile.x, y: tile.y })
    this.mapService.setMonsterCode(null)
    this.mapService.setResourceCode(null)
    this.mapService.setNpcCode(null)
  }

  async moveToSelectedTile(): Promise<void> {
    const tile = this.selectedTile()
    if (!tile) return

    const selected = this.selectedCharacter()
    if (!selected) return

    if (selected.x === tile.x && selected.y === tile.y) {
      this.errorHandler.handleError(
        'Character is already at this position',
        'Move',
      )
      return
    }

    if (this.macroService.isRecording(selected.name)) {
      this.macroService.recordAction(selected.name, {
        type: 'move',
        label: `Move to (${tile.x}, ${tile.y})`,
        params: { x: tile.x, y: tile.y },
      })
      this.errorHandler.handleSuccess('Move action recorded', 'Macro')
      return
    }

    try {
      await this.characterService.moveCharacter(tile.x, tile.y)
    } catch (err) {
      this.logger.error('Error moving character', 'GUI', err)
    }
  }

  onEventClick(event: ActiveEvent): void {
    this.scrollToPosition.set({ x: event.map.x, y: event.map.y })
    setTimeout(() => {
      this.scrollToPosition.set(null)
    }, 100)
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
    const selected = this.selectedCharacter()
    if (!selected) return

    if (this.macroService.isRecording(selected.name)) {
      this.macroService.recordAction(selected.name, {
        type: 'rest',
        label: 'Rest',
      })
      this.errorHandler.handleSuccess('Action recorded', 'Macro')
      return
    }

    if (this.cooldownService.isOnCooldown(selected.name)) {
      const queued = this.queueService.enqueue(selected.name, {
        type: 'rest',
        label: 'Rest',
      })
      if (queued) {
        this.errorHandler.handleSuccess(
          `Rest queued (${this.queueService.getQueueLength(selected.name)}/${this.queueService.getMaxQueueSize()})`,
          'Action Queue',
        )
      } else {
        this.errorHandler.handleError('Queue is full', 'Action Queue')
      }
      return
    }

    const result = await this.actionService.restCharacter()
    if (!result.success && result.error) {
      this.logger.error('Error resting character', 'GUI', result.error)
    }
  }

  async fightMonster(): Promise<void> {
    const selected = this.selectedCharacter()
    if (!selected) return

    if (this.macroService.isRecording(selected.name)) {
      this.macroService.recordAction(selected.name, {
        type: 'fight',
        label: 'Fight Monster',
      })
      this.errorHandler.handleSuccess('Action recorded', 'Macro')
      return
    }

    if (this.cooldownService.isOnCooldown(selected.name)) {
      const queued = this.queueService.enqueue(selected.name, {
        type: 'fight',
        label: 'Fight Monster',
      })
      if (queued) {
        this.errorHandler.handleSuccess(
          `Fight queued (${this.queueService.getQueueLength(selected.name)}/${this.queueService.getMaxQueueSize()})`,
          'Action Queue',
        )
      } else {
        this.errorHandler.handleError('Queue is full', 'Action Queue')
      }
      return
    }

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

    if (this.macroService.isRecording(selected.name)) {
      this.macroService.recordAction(selected.name, {
        type: 'gather',
        label: 'Gather Resource',
      })
      this.errorHandler.handleSuccess('Action recorded', 'Macro')
      return
    }

    if (this.cooldownService.isOnCooldown(selected.name)) {
      const queued = this.queueService.enqueue(selected.name, {
        type: 'gather',
        label: 'Gather Resource',
      })
      if (queued) {
        this.errorHandler.handleSuccess(
          `Gather queued (${this.queueService.getQueueLength(selected.name)}/${this.queueService.getMaxQueueSize()})`,
          'Action Queue',
        )
      } else {
        this.errorHandler.handleError('Queue is full', 'Action Queue')
      }
      return
    }

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

    if (this.macroService.isRecording(selected.name)) {
      this.macroService.recordAction(selected.name, {
        type: 'craft',
        label: `Craft ${itemCode}`,
        params: { itemCode, quantity },
      })
      this.errorHandler.handleSuccess('Action recorded', 'Macro')
      return
    }

    if (this.cooldownService.isOnCooldown(selected.name)) {
      const queued = this.queueService.enqueue(selected.name, {
        type: 'craft',
        label: 'Craft Item',
        params: { itemCode, quantity },
      })
      if (queued) {
        this.errorHandler.handleSuccess(
          `Craft queued (${this.queueService.getQueueLength(selected.name)}/${this.queueService.getMaxQueueSize()})`,
          'Action Queue',
        )
      } else {
        this.errorHandler.handleError('Queue is full', 'Action Queue')
      }
      return
    }

    this.craftingInProgress.set(true)

    const result = await this.actionService.craftItem(itemCode, quantity)
    if (!result.success && result.error) {
      this.errorHandler.handleError(result.error, 'Crafting')
    }
    this.craftingInProgress.set(false)
  }

  getCharacterQueue() {
    const selected = this.selectedCharacter()
    if (!selected) return []
    return this.queueService.getQueue(selected.name)
  }

  getQueueError() {
    const selected = this.selectedCharacter()
    if (!selected) return null
    return this.queueService.getError(selected.name)
  }

  clearQueue(): void {
    const selected = this.selectedCharacter()
    if (!selected) return
    this.queueService.clear(selected.name)
    this.errorHandler.handleSuccess('Queue cleared', 'Action Queue')
  }

  removeQueuedAction(actionId: string): void {
    const selected = this.selectedCharacter()
    if (!selected) return
    this.queueService.remove(selected.name, actionId)
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

  toggleInventory(): void {
    this.showInventory.set(!this.showInventory())
    if (this.showInventory()) {
      this.showSkills.set(false)
      this.showEquipment.set(false)
    }
  }

  toggleSkills(): void {
    this.showSkills.set(!this.showSkills())
    if (this.showSkills()) {
      this.showInventory.set(false)
      this.showEquipment.set(false)
    }
  }

  toggleEquipment(): void {
    this.showEquipment.set(!this.showEquipment())
    if (this.showEquipment()) {
      this.showInventory.set(false)
      this.showSkills.set(false)
    }
  }

  isRecording(character: Character): boolean {
    return this.macroService.isRecording(character.name)
  }

  startRecording(): void {
    const selected = this.selectedCharacter()
    if (!selected) return
    this.macroService.startRecording(selected.name)
    this.errorHandler.handleSuccess('Recording started', 'Macro')
  }

  stopRecording(): void {
    const selected = this.selectedCharacter()
    if (!selected) return

    const recordedActions = this.macroService.getRecordedActions(selected.name)
    if (recordedActions.length === 0) {
      this.macroService.cancelRecording(selected.name)
      this.errorHandler.handleError('No actions recorded', 'Macro')
      return
    }

    const macroName = prompt('Enter a name for this macro:')
    if (!macroName) {
      this.macroService.cancelRecording(selected.name)
      return
    }

    const isShared = confirm('Share this macro with all characters?')
    const macro = this.macroService.stopRecording(
      selected.name,
      macroName,
      isShared,
    )
    if (macro) {
      this.errorHandler.handleSuccess(
        `Macro "${macroName}" saved ${isShared ? '(Shared)' : '(Character-specific)'} with ${macro.actions.length} actions`,
        'Macro',
      )
    }
  }

  cancelRecording(): void {
    const selected = this.selectedCharacter()
    if (!selected) return
    this.macroService.cancelRecording(selected.name)
    this.errorHandler.handleSuccess('Recording cancelled', 'Macro')
  }

  getMacrosForCharacter() {
    const selected = this.selectedCharacter()
    if (!selected) return []
    return this.macroService.getMacrosForCharacter(selected.name)
  }

  playMacro(macroId: string, loop = false): void {
    const selected = this.selectedCharacter()
    if (!selected) return

    const started = this.macroService.startPlayback(
      macroId,
      selected.name,
      loop,
    )
    if (started) {
      this.actionExecutor.triggerExecution(selected.name)
      this.errorHandler.handleSuccess(
        loop ? 'Macro looping started' : 'Macro playback started',
        'Macro',
      )
    }
  }

  stopMacroPlayback(): void {
    const selected = this.selectedCharacter()
    if (!selected) return
    this.macroService.stopPlayback(selected.name)
    this.errorHandler.handleSuccess('Macro playback stopped', 'Macro')
  }

  deleteMacro(macroId: string): void {
    if (!confirm('Are you sure you want to delete this macro?')) return
    const deleted = this.macroService.deleteMacro(macroId)
    if (deleted) {
      this.errorHandler.handleSuccess('Macro deleted', 'Macro')
    }
  }

  getOtherCharacters(): Character[] {
    const selected = this.selectedCharacter()
    if (!selected) return []
    return this.characters().filter((c) => c.name !== selected.name)
  }

  startGiveItem(slot: { code: string; quantity: number; slot: number }): void {
    this.givingItem.set(slot)
    this.giveQuantity = 1
    const otherChars = this.getOtherCharacters()
    if (otherChars.length > 0) {
      this.giveTargetCharacter = otherChars[0].name
    }
  }

  cancelGiveItem(): void {
    this.givingItem.set(null)
    this.giveTargetCharacter = ''
    this.giveQuantity = 1
  }

  async confirmGiveItem(): Promise<void> {
    const item = this.givingItem()
    if (!item || !this.giveTargetCharacter) return

    const result = await this.actionService.giveItems(
      this.giveTargetCharacter,
      [{ code: item.code, quantity: this.giveQuantity }],
    )

    if (result.success) {
      this.errorHandler.handleSuccess(
        `Gave ${this.giveQuantity}× ${item.code} to ${this.giveTargetCharacter}`,
        'Give Item',
      )
      this.cancelGiveItem()
    }
  }

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

  async startEquipItem(slot: {
    code: string
    quantity: number
    slot: number
  }): Promise<void> {
    const itemSlot = this.getItemSlot(slot.code)
    if (!itemSlot) {
      this.errorHandler.handleError('Cannot determine item slot', 'Equip Item')
      return
    }

    const item = this.items().find((i) => i.code === slot.code)
    const quantity = item?.type === 'utility' ? 1 : undefined

    const result = await this.actionService.equipItem(
      slot.code,
      itemSlot,
      quantity,
    )

    if (result.success) {
      this.errorHandler.handleSuccess(`Equipped ${slot.code}`, 'Equip Item')
    }
  }

  isMacroPlaying(): boolean {
    const selected = this.selectedCharacter()
    if (!selected) return false
    return this.macroService.isPlaying(selected.name)
  }

  getMacroPlaybackState() {
    const selected = this.selectedCharacter()
    if (!selected) return null
    return this.macroService.getPlaybackState(selected.name)
  }

  getItemImageUrl(code: string): string {
    return getItemImageUrl(code)
  }

  getMonsterImageUrl(code: string): string {
    return getMonsterImageUrl(code)
  }

  getResourceImageUrl(code: string): string {
    return getResourceImageUrl(code)
  }

  getMacroError(): string | null {
    const selected = this.selectedCharacter()
    if (!selected) return null
    return this.macroService.getPlaybackError(selected.name)
  }
}
