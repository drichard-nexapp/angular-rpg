import { Component, OnDestroy, computed, signal, effect } from '@angular/core'
import {
  injectQuery,
  injectQueryClient,
} from '@tanstack/angular-query-experimental'
import {
  getMyCharactersMyCharactersGet,
  getCharacterCharactersNameGet,
  actionMoveMyNameActionMovePost,
  actionRestMyNameActionRestPost,
  actionFightMyNameActionFightPost,
  actionGatheringMyNameActionGatheringPost,
  getMapByPositionMapsLayerXYGet,
  getMonsterMonstersCodeGet,
  getResourceResourcesCodeGet,
  getNpcNpcsDetailsCodeGet,
  getNpcItemsNpcsItemsCodeGet,
  actionNpcBuyItemMyNameActionNpcBuyPost,
  actionNpcSellItemMyNameActionNpcSellPost,
  actionAcceptNewTaskMyNameActionTaskNewPost,
  getAllActiveEventsEventsActiveGet,
  getAllItemsItemsGet,
  actionCraftingMyNameActionCraftingPost,
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

@Component({
  selector: 'app-gui',
  imports: [Map],
  templateUrl: './gui.html',
  styleUrl: './gui.scss',
})
export class GUI implements OnDestroy {
  queryClient = injectQueryClient()
  selectedCharacter = signal<Character | null>(null)
  characterCooldowns = signal<Record<string, CooldownTracking>>({})
  currentTilePosition = signal<TilePosition | null>(null)
  currentMonsterCode = signal<string | null>(null)
  currentResourceCode = signal<string | null>(null)
  currentNpcCode = signal<string | null>(null)
  private cooldownIntervals: Record<string, ReturnType<typeof setInterval>> = {}
  private characterCacheVersion = signal(0)

  skinSymbols: Record<CharacterSkin, string> = {
    men1: '🧙‍♂️',
    men2: '⚔️',
    men3: '🛡️',
    women1: '🧙‍♀️',
    women2: '🏹',
    women3: '🗡️',
    corrupted1: '👹',
    zombie1: '🧟',
    marauder1: '🏴‍☠️',
  }

  getSkinSymbol(skin: string): string {
    return this.skinSymbols[skin as CharacterSkin] || '👤'
  }

  characterListQuery = injectQuery(() => ({
    queryKey: ['my-characters-list'],
    queryFn: async (): Promise<string[]> => {
      const response = await getMyCharactersMyCharactersGet()
      if (response && 'data' in response && response.data) {
        const charactersData = (response.data as { data?: Character[] })?.data || []
        return charactersData.map((char) => char.name)
      }
      return []
    },
    staleTime: 1000 * 60 * 5,
  }))

  characterNames = computed(() => this.characterListQuery.data() ?? [])

  characters = computed((): Character[] => {
    this.characterCacheVersion()
    const names = this.characterNames()
    return names
      .map((name: string) =>
        this.queryClient.getQueryData<Character>(['character', name])
      )
      .filter((char): char is Character => char !== undefined)
  })

  tileDetailsQuery = injectQuery(() => ({
    queryKey: [
      'tile-details',
      this.currentTilePosition()?.x,
      this.currentTilePosition()?.y,
    ],
    queryFn: async (): Promise<MapTile | null> => {
      const pos = this.currentTilePosition()
      if (!pos) return null

      const response = await getMapByPositionMapsLayerXYGet({
        path: {
          layer: 'overworld',
          x: pos.x,
          y: pos.y,
        },
      })

      if (response && 'data' in response && response.data) {
        return (response.data as { data?: MapTile })?.data || null
      }
      return null
    },
    enabled: !!this.currentTilePosition(),
    staleTime: 1000 * 60 * 30,
  }))

  monsterDetailsQuery = injectQuery(() => ({
    queryKey: ['monster-details', this.currentMonsterCode()],
    queryFn: async (): Promise<Monster | null> => {
      const monsterCode = this.currentMonsterCode()
      if (!monsterCode) return null

      const response = await getMonsterMonstersCodeGet({
        path: { code: monsterCode },
      })

      if (response && 'data' in response && response.data) {
        const monsterData = (response.data as { data?: Monster })?.data
        if (monsterData) {
          return {
            ...monsterData,
            drops: monsterData.drops || [],
          }
        }
      }
      return null
    },
    enabled: !!this.currentMonsterCode(),
    staleTime: 1000 * 60 * 60,
  }))

  resourceDetailsQuery = injectQuery(() => ({
    queryKey: ['resource-details', this.currentResourceCode()],
    queryFn: async (): Promise<Resource | null> => {
      const resourceCode = this.currentResourceCode()
      if (!resourceCode) return null

      const response = await getResourceResourcesCodeGet({
        path: { code: resourceCode },
      })

      if (response && 'data' in response && response.data) {
        return (response.data as { data?: Resource })?.data || null
      }
      return null
    },
    enabled: !!this.currentResourceCode(),
    staleTime: 1000 * 60 * 60,
  }))

  npcDetailsQuery = injectQuery(() => ({
    queryKey: ['npc-details', this.currentNpcCode()],
    queryFn: async (): Promise<Npc | null> => {
      const npcCode = this.currentNpcCode()
      if (!npcCode) return null

      const response = await getNpcNpcsDetailsCodeGet({
        path: { code: npcCode },
      })

      if (response && 'data' in response && response.data) {
        return (response.data as { data?: Npc })?.data || null
      }
      return null
    },
    enabled: !!this.currentNpcCode(),
    staleTime: 1000 * 60 * 60,
  }))

  npcItemsQuery = injectQuery(() => ({
    queryKey: ['npc-items', this.currentNpcCode()],
    queryFn: async (): Promise<NpcItem[]> => {
      const npcCode = this.currentNpcCode()
      if (!npcCode) return []

      const response = await getNpcItemsNpcsItemsCodeGet({
        path: { code: npcCode },
        query: { size: 100 },
      })

      if (response && 'data' in response && response.data) {
        return (response.data as { data?: NpcItem[] })?.data || []
      }
      return []
    },
    enabled: !!this.currentNpcCode(),
    staleTime: 1000 * 60 * 60,
  }))

  activeEventsQuery = injectQuery(() => ({
    queryKey: ['active-events'],
    queryFn: async (): Promise<ActiveEvent[]> => {
      const response = await getAllActiveEventsEventsActiveGet()

      if (response && 'data' in response && response.data) {
        return (response.data as { data?: ActiveEvent[] })?.data || []
      }
      return []
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

      if (response && 'data' in response && response.data) {
        return (response.data as { data?: Item[] })?.data || []
      }
      return []
    },
    staleTime: 1000 * 60 * 60,
  }))

  currentTileDetails = computed(() => this.tileDetailsQuery.data() ?? null)
  activeEvents = computed(() => this.activeEventsQuery.data() ?? [])
  items = computed(() => this.itemsQuery.data() ?? [])
  craftableItems = computed(() =>
    this.items().filter(item => item.craft && item.craft.skill)
  )

  characterInventory = computed(() => {
    const character = this.selectedCharacter()
    if (!character || !character.inventory) return []
    return character.inventory
  })

  getInventoryQuantity(itemCode: string): number {
    const inventory = this.characterInventory()
    const slot = inventory.find(slot => slot.code === itemCode)
    return slot ? slot.quantity : 0
  }

  canCraftItem(item: Item): boolean {
    if (!item.craft || !item.craft.items) return false

    return item.craft.items.every(material => {
      const available = this.getInventoryQuantity(material.code)
      return available >= material.quantity
    })
  }
  monsterDetails = computed(() => {
    const monsterCode = this.getMonsterCode()
    if (!monsterCode || monsterCode !== this.currentMonsterCode()) {
      return null
    }
    return this.monsterDetailsQuery.data() ?? null
  })
  resourceDetails = computed(() => {
    const resourceCode = this.getResourceCode()
    if (!resourceCode || resourceCode !== this.currentResourceCode()) {
      return null
    }
    return this.resourceDetailsQuery.data() ?? null
  })
  npcDetails = computed(() => {
    const npcCode = this.getNpcCode()
    if (!npcCode || npcCode !== this.currentNpcCode()) {
      return null
    }
    return this.npcDetailsQuery.data() ?? null
  })
  npcItems = computed(() => this.npcItemsQuery.data() ?? [])

  npcActionInProgress = signal(false)
  npcActionError = signal<string | null>(null)

  craftingInProgress = signal(false)
  craftingError = signal<string | null>(null)

  constructor() {
    effect(() => {
      const names = this.characterNames()
      names.forEach((name: string) => {
        const existingData = this.queryClient.getQueryData(['character', name])
        if (!existingData) {
          this.fetchCharacterDetails(name)
        }
      })
    })
  }

  private async fetchCharacterDetails(name: string): Promise<void> {
    try {
      const response = await getCharacterCharactersNameGet({
        path: { name },
      })

      if (response && 'data' in response && response.data) {
        const characterData = (response.data as { data?: Character })?.data
        if (characterData) {
          this.queryClient.setQueryData<Character>(['character', name], characterData)
          this.characterCacheVersion.update(v => v + 1)

          if (
            characterData.cooldown &&
            characterData.cooldown > 0
          ) {
            const cooldown: Cooldown = {
              total_seconds: characterData.cooldown,
              remaining_seconds: characterData.cooldown,
              started_at: characterData.cooldown_expiration || '',
              expiration: characterData.cooldown_expiration || '',
              reason: 'movement' as const,
            }
            this.updateCharacterCooldown(name, cooldown)
          }
        }
      }
    } catch (err) {
      console.error(`Error fetching character details for ${name}:`, err)
    }
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
      this.selectedCharacter.set(null)
      this.currentTilePosition.set(null)
      this.currentMonsterCode.set(null)
      this.currentResourceCode.set(null)
      this.currentNpcCode.set(null)
    } else {
      this.selectedCharacter.set(character)
      this.currentTilePosition.set({ x: character.x, y: character.y })
      this.currentMonsterCode.set(null)
      this.currentResourceCode.set(null)
      this.currentNpcCode.set(null)
    }
  }

  isSelected(character: Character): boolean {
    return this.selectedCharacter() === character
  }

  async onTileClick(tile: MapTile): Promise<void> {
    if (!tile) return

    const selected = this.selectedCharacter()

    if (!selected) {
      this.currentTilePosition.set({ x: tile.x, y: tile.y })
      this.currentMonsterCode.set(null)
      this.currentResourceCode.set(null)
      this.currentNpcCode.set(null)
      return
    }

    if (this.isCharacterOnCooldown(selected)) {
      return
    }

    try {
      const response = await actionMoveMyNameActionMovePost({
        path: { name: selected.name },
        body: { x: tile.x, y: tile.y },
      })
      if (response && 'data' in response && response.data) {
        const data = (response.data as { data?: { character: Character; cooldown: Cooldown } })?.data
        if (!data) return

        const { character, cooldown } = data

        if (character) {
          this.queryClient.setQueryData<Character>(['character', character.name], character)
          this.characterCacheVersion.update(v => v + 1)
          this.selectedCharacter.set(character)
          this.currentTilePosition.set({ x: character.x, y: character.y })
          this.currentMonsterCode.set(null)
          this.currentResourceCode.set(null)
          this.currentNpcCode.set(null)
        }

        if (cooldown) {
          this.updateCharacterCooldown(selected.name, cooldown)
        }
      }
    } catch (err) {
      console.error('Error moving character:', err)
    }
  }

  loadMonsterDetails() {
    const monsterCode = this.getMonsterCode()
    if (monsterCode) {
      this.currentMonsterCode.set(monsterCode)
    }
  }

  loadResourceDetails() {
    const resourceCode = this.getResourceCode()
    if (resourceCode) {
      this.currentResourceCode.set(resourceCode)
    }
  }

  loadNpcDetails() {
    const npcCode = this.getNpcCode()
    if (npcCode) {
      this.currentNpcCode.set(npcCode)
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
    this.currentMonsterCode.set(null)
  }

  hideResourceDetails() {
    this.currentResourceCode.set(null)
  }

  hideNpcDetails() {
    this.currentNpcCode.set(null)
  }

  closeTileDetails() {
    this.currentTilePosition.set(null)
    this.currentMonsterCode.set(null)
    this.currentResourceCode.set(null)
    this.currentNpcCode.set(null)
  }

  updateCharacterCooldown(characterName: string, cooldown: Cooldown): void {
    const cooldowns = { ...this.characterCooldowns() }
    cooldowns[characterName] = {
      ...cooldown,
      remainingSeconds: cooldown.remaining_seconds || 0,
    }
    this.characterCooldowns.set(cooldowns)

    if (this.cooldownIntervals[characterName]) {
      clearInterval(this.cooldownIntervals[characterName])
    }

    if (cooldowns[characterName].remainingSeconds > 0) {
      this.cooldownIntervals[characterName] = setInterval(() => {
        const current = this.characterCooldowns()[characterName]
        if (current && current.remainingSeconds > 0) {
          const updated = { ...this.characterCooldowns() }
          updated[characterName] = {
            ...current,
            remainingSeconds: current.remainingSeconds - 1,
          }
          this.characterCooldowns.set(updated)
        } else {
          const updated = { ...this.characterCooldowns() }
          delete updated[characterName]
          this.characterCooldowns.set(updated)
          clearInterval(this.cooldownIntervals[characterName])
          delete this.cooldownIntervals[characterName]
        }
      }, 1000)
    }
  }

  getCharacterCooldown(characterName: string): CooldownTracking | null {
    return this.characterCooldowns()[characterName] || null
  }

  isCharacterOnCooldown(character: Character): boolean {
    return !!this.characterCooldowns()[character.name]
  }

  isCharacterHpFull(character: Character): boolean {
    if (!character) return false
    return character.hp >= character.max_hp
  }

  async restCharacter(): Promise<void> {
    const selected = this.selectedCharacter()
    if (!selected) return

    if (this.isCharacterOnCooldown(selected)) {
      return
    }

    try {
      const response = await actionRestMyNameActionRestPost({
        path: { name: selected.name },
      })

      if (response && 'data' in response && response.data) {
        const data = (response.data as { data?: { character: Character; cooldown: Cooldown } })?.data
        if (!data) return

        const { character, cooldown } = data

        if (character) {
          this.queryClient.setQueryData<Character>(['character', character.name], character)
          this.characterCacheVersion.update(v => v + 1)
          this.selectedCharacter.set(character)
        }

        if (cooldown) {
          this.updateCharacterCooldown(selected.name, cooldown)
        }
      }
    } catch (err) {
      console.error('Error resting character:', err)
    }
  }

  async fightMonster(): Promise<void> {
    const selected = this.selectedCharacter()
    if (!selected) return

    if (this.isCharacterOnCooldown(selected)) {
      return
    }

    try {
      const response = await actionFightMyNameActionFightPost({
        path: { name: selected.name },
      })

      if (response && 'data' in response && response.data) {
        const data = (response.data as { data?: { characters: Character[]; cooldown: Cooldown } })?.data
        if (!data) return

        const { characters, cooldown } = data
        const character = characters.find(c => c.name === selected.name)

        if (character) {
          this.queryClient.setQueryData<Character>(['character', character.name], character)
          this.characterCacheVersion.update(v => v + 1)
          this.selectedCharacter.set(character)
        }

        if (cooldown) {
          this.updateCharacterCooldown(selected.name, cooldown)
        }

        if (character) {
          this.currentTilePosition.set({ x: character.x, y: character.y })
        }
      }
    } catch (err) {
      console.error('Error fighting monster:', err)
    }
  }

  async gatherResource(): Promise<void> {
    const selected = this.selectedCharacter()
    if (!selected) return

    if (this.isCharacterOnCooldown(selected)) {
      return
    }

    try {
      const response = await actionGatheringMyNameActionGatheringPost({
        path: { name: selected.name },
      })

      if (response && 'data' in response && response.data) {
        const data = (response.data as { data?: { character: Character; cooldown: Cooldown } })?.data
        if (!data) return

        const { character, cooldown } = data

        if (character) {
          this.queryClient.setQueryData<Character>(['character', character.name], character)
          this.characterCacheVersion.update(v => v + 1)
          this.selectedCharacter.set(character)
        }

        if (cooldown) {
          this.updateCharacterCooldown(selected.name, cooldown)
        }

        if (character) {
          this.currentTilePosition.set({ x: character.x, y: character.y })
        }
      }
    } catch (err) {
      console.error('Error gathering resource:', err)
    }
  }

  async buyItemFromNpc(itemCode: string, quantity: number): Promise<void> {
    const selected = this.selectedCharacter()
    if (!selected) return

    if (this.isCharacterOnCooldown(selected)) {
      return
    }

    this.npcActionInProgress.set(true)
    this.npcActionError.set(null)

    try {
      const response = await actionNpcBuyItemMyNameActionNpcBuyPost({
        path: { name: selected.name },
        body: { code: itemCode, quantity },
      })

      if (response && 'data' in response && response.data) {
        const data = response.data as { data?: { character: Character; cooldown: Cooldown } }
        if (!data?.data) return

        const { character, cooldown } = data.data

        if (character) {
          this.queryClient.setQueryData<Character>(['character', character.name], character)
          this.characterCacheVersion.update(v => v + 1)
          this.selectedCharacter.set(character)
        }

        if (cooldown) {
          this.updateCharacterCooldown(selected.name, cooldown)
        }
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to buy item'
      this.npcActionError.set(errorMessage)
      console.error('Error buying item from NPC:', err)
    } finally {
      this.npcActionInProgress.set(false)
    }
  }

  async sellItemToNpc(itemCode: string, quantity: number): Promise<void> {
    const selected = this.selectedCharacter()
    if (!selected) return

    if (this.isCharacterOnCooldown(selected)) {
      return
    }

    this.npcActionInProgress.set(true)
    this.npcActionError.set(null)

    try {
      const response = await actionNpcSellItemMyNameActionNpcSellPost({
        path: { name: selected.name },
        body: { code: itemCode, quantity },
      })

      if (response && 'data' in response && response.data) {
        const data = response.data as { data?: { character: Character; cooldown: Cooldown } }
        if (!data?.data) return

        const { character, cooldown } = data.data

        if (character) {
          this.queryClient.setQueryData<Character>(['character', character.name], character)
          this.characterCacheVersion.update(v => v + 1)
          this.selectedCharacter.set(character)
        }

        if (cooldown) {
          this.updateCharacterCooldown(selected.name, cooldown)
        }
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sell item'
      this.npcActionError.set(errorMessage)
      console.error('Error selling item to NPC:', err)
    } finally {
      this.npcActionInProgress.set(false)
    }
  }

  async acceptTaskFromNpc(): Promise<void> {
    const selected = this.selectedCharacter()
    if (!selected) return

    if (this.isCharacterOnCooldown(selected)) {
      return
    }

    this.npcActionInProgress.set(true)
    this.npcActionError.set(null)

    try {
      const response = await actionAcceptNewTaskMyNameActionTaskNewPost({
        path: { name: selected.name },
      })

      if (response && 'data' in response && response.data) {
        const data = response.data as { data?: { character: Character; cooldown: Cooldown } }
        if (!data?.data) return

        const { character, cooldown } = data.data

        if (character) {
          this.queryClient.setQueryData<Character>(['character', character.name], character)
          this.characterCacheVersion.update(v => v + 1)
          this.selectedCharacter.set(character)
        }

        if (cooldown) {
          this.updateCharacterCooldown(selected.name, cooldown)
        }
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to accept task'
      this.npcActionError.set(errorMessage)
      console.error('Error accepting task from NPC:', err)
    } finally {
      this.npcActionInProgress.set(false)
    }
  }

  async craftItem(itemCode: string, quantity: number = 1): Promise<void> {
    const selected = this.selectedCharacter()
    if (!selected) return

    if (this.isCharacterOnCooldown(selected)) {
      return
    }

    this.craftingInProgress.set(true)
    this.craftingError.set(null)

    try {
      const response = await actionCraftingMyNameActionCraftingPost({
        path: { name: selected.name },
        body: { code: itemCode, quantity },
      })

      if (response && 'data' in response && response.data) {
        const data = response.data as { data?: { character: Character; cooldown: Cooldown } }
        if (!data?.data) return

        const { character, cooldown } = data.data

        if (character) {
          this.queryClient.setQueryData<Character>(['character', character.name], character)
          this.characterCacheVersion.update(v => v + 1)
          this.selectedCharacter.set(character)
        }

        if (cooldown) {
          this.updateCharacterCooldown(selected.name, cooldown)
        }
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to craft item'
      this.craftingError.set(errorMessage)
      console.error('Error crafting item:', err)
    } finally {
      this.craftingInProgress.set(false)
    }
  }

  ngOnDestroy() {
    Object.values(this.cooldownIntervals).forEach((interval) =>
      clearInterval(interval),
    )
  }
}
