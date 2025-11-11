import { Component, OnDestroy, computed, signal } from '@angular/core'
import {
  injectQuery,
  injectQueryClient,
} from '@tanstack/angular-query-experimental'
import {
  getLayerMapsMapsLayerGet,
  getMyCharactersMyCharactersGet,
  actionMoveMyNameActionMovePost,
  actionRestMyNameActionRestPost,
  getMapByPositionMapsLayerXYGet,
  actionFightMyNameActionFightPost,
  actionGatheringMyNameActionGatheringPost,
  getMonsterMonstersCodeGet,
  getResourceResourcesCodeGet,
  getNpcNpcsDetailsCodeGet,
} from '../../../sdk/api'
import mapSkins from '../../../assets/map-skins.json'
import { TileBase, TileFactory, MonsterTile } from '../../domain/tile'

@Component({
  selector: 'app-map',
  imports: [],
  templateUrl: './map.html',
  styleUrl: './map.scss',
})
export class Map implements OnDestroy {
  queryClient = injectQueryClient()
  selectedCharacter = signal<any | null>(null)
  characterCooldowns = signal<Record<string, any>>({})
  currentTilePosition = signal<{ x: number; y: number } | null>(null)
  currentMonsterCode = signal<string | null>(null)
  currentResourceCode = signal<string | null>(null)
  currentNpcCode = signal<string | null>(null)
  skinColors: Record<string, string> = {}
  private cooldownIntervals: Record<string, any> = {}

  mapsQuery = injectQuery(() => ({
    queryKey: ['maps', 'overworld'],
    queryFn: async () => {
      const tiles = await this.fetchAllLayerPages('overworld')
      const grid = this.createGrid(tiles)
      return [{ name: 'overworld', tiles, grid }]
    },
    staleTime: 1000 * 60 * 10,
  }))

  charactersQuery = injectQuery(() => ({
    queryKey: ['my-characters'],
    queryFn: async () => {
      const response = await getMyCharactersMyCharactersGet()
      if (response && 'data' in response) {
        const charactersData = (response.data as any)?.data || []
        charactersData.forEach((char: any) => {
          if (char.cooldown && char.cooldown.remaining_seconds > 0) {
            this.updateCharacterCooldown(char.name, char.cooldown)
          }
        })
        return charactersData
      }
      return []
    },
    staleTime: 1000 * 30,
  }))

  tileDetailsQuery = injectQuery(() => ({
    queryKey: [
      'tile-details',
      this.currentTilePosition()?.x,
      this.currentTilePosition()?.y,
    ],
    queryFn: async () => {
      const pos = this.currentTilePosition()
      if (!pos) return null

      const response = await getMapByPositionMapsLayerXYGet({
        path: {
          layer: 'overworld',
          x: pos.x,
          y: pos.y,
        },
      })

      if (response && 'data' in response) {
        return (response.data as any)?.data || null
      }
      return null
    },
    enabled: !!this.currentTilePosition(),
    staleTime: 1000 * 60 * 30,
  }))

  monsterDetailsQuery = injectQuery(() => ({
    queryKey: ['monster-details', this.currentMonsterCode()],
    queryFn: async () => {
      const monsterCode = this.currentMonsterCode()
      if (!monsterCode) return null

      const response = await getMonsterMonstersCodeGet({
        path: { code: monsterCode },
      })

      if (response && 'data' in response) {
        const monsterData = (response.data as any)?.data
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
    queryFn: async () => {
      const resourceCode = this.currentResourceCode()
      if (!resourceCode) return null

      const response = await getResourceResourcesCodeGet({
        path: { code: resourceCode },
      })

      if (response && 'data' in response) {
        return (response.data as any)?.data || null
      }
      return null
    },
    enabled: !!this.currentResourceCode(),
    staleTime: 1000 * 60 * 60,
  }))

  npcDetailsQuery = injectQuery(() => ({
    queryKey: ['npc-details', this.currentNpcCode()],
    queryFn: async () => {
      const npcCode = this.currentNpcCode()
      if (!npcCode) return null

      const response = await getNpcNpcsDetailsCodeGet({
        path: { code: npcCode },
      })

      if (response && 'data' in response) {
        return (response.data as any)?.data || null
      }
      return null
    },
    enabled: !!this.currentNpcCode(),
    staleTime: 1000 * 60 * 60,
  }))

  layers = computed(() => this.mapsQuery.data() ?? [])
  characters = computed(() => this.charactersQuery.data() ?? [])
  currentTileDetails = computed(() => this.tileDetailsQuery.data() ?? null)
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
  loading = computed(
    () => this.mapsQuery.isPending() || this.charactersQuery.isPending(),
  )
  error = computed(() => {
    const mapsError = this.mapsQuery.error()
    const charactersError = this.charactersQuery.error()
    if (mapsError) return (mapsError as Error).message
    if (charactersError) return (charactersError as Error).message
    return null
  })

  constructor() {
    this.initializeSkinColors()
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

  private initializeSkinColors() {
    Object.entries(mapSkins).forEach(([skin, data]) => {
      this.skinColors[skin] = data.color
    })
  }

  private async fetchAllLayerPages(layerName: string): Promise<any[]> {
    const allTiles: any[] = []
    let page = 1
    let hasMore = true

    while (hasMore) {
      const layerResponse = await getLayerMapsMapsLayerGet({
        // @ts-ignore
        path: { layer: layerName },
        query: { page, size: 100 },
      })

      if (layerResponse && 'data' in layerResponse) {
        const tiles = (layerResponse.data as any)?.data || []
        allTiles.push(...tiles)

        if (tiles.length === 0 || tiles.length < 100) {
          hasMore = false
        } else {
          page++
        }
      } else {
        hasMore = false
      }
    }

    return allTiles
  }

  private createGrid(tiles: any[]): any[][] {
    if (tiles.length === 0) return []

    const minX = Math.min(...tiles.map((t) => t.x))
    const maxX = Math.max(...tiles.map((t) => t.x))
    const minY = Math.min(...tiles.map((t) => t.y))
    const maxY = Math.max(...tiles.map((t) => t.y))

    const grid: any[][] = []
    for (let y = minY; y <= maxY; y++) {
      const row: any[] = []
      for (let x = minX; x <= maxX; x++) {
        const tile = tiles.find((t) => t.x === x && t.y === y)
        row.push(tile || null)
      }
      grid.push(row)
    }
    return grid
  }

  createTile(tileData: any): TileBase | null {
    if (!tileData) return null
    return TileFactory.createTile(tileData)
  }

  getSkinColor(skin: string): string {
    if (!skin) return '#e0e0e0'
    return this.skinColors[skin] || '#e0e0e0'
  }

  getTileRender(tile: any): { type: string; value: string; cssClass?: string } {
    if (!tile) {
      return { type: 'ascii', value: '   ', cssClass: 'tile-ascii' }
    }
    const tileObj = this.createTile(tile)
    return (
      tileObj?.render() || {
        type: 'ascii',
        value: '   ',
        cssClass: 'tile-ascii',
      }
    )
  }

  selectCharacter(character: any) {
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

  isSelected(character: any): boolean {
    return this.selectedCharacter() === character
  }

  async onTileClick(tile: any) {
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
      if (response && 'data' in response) {
        const data = response.data!.data as any
        const character = data.character
        const cooldown = data.cooldown

        if (character) {
          const updatedCharacters = (
            this.queryClient.getQueryData(['my-characters']) as any[] || []
          ).map((c: any) => c.name === selected.name ? character : c)

          this.queryClient.setQueryData(['my-characters'], updatedCharacters)
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

  updateCharacterCooldown(characterName: string, cooldown: any) {
    const cooldowns = { ...this.characterCooldowns() }
    cooldowns[characterName] = {
      ...cooldown,
      remainingSeconds: cooldown.remaining_seconds || 0,
    }
    this.characterCooldowns.set(cooldowns)

    // Clear existing interval if any
    if (this.cooldownIntervals[characterName]) {
      clearInterval(this.cooldownIntervals[characterName])
    }

    // Only start countdown if there are remaining seconds
    if (cooldowns[characterName].remainingSeconds > 0) {
      // Start countdown
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
          // Clear cooldown when done
          const updated = { ...this.characterCooldowns() }
          delete updated[characterName]
          this.characterCooldowns.set(updated)
          clearInterval(this.cooldownIntervals[characterName])
          delete this.cooldownIntervals[characterName]
        }
      }, 1000)
    }
  }

  getCharacterCooldown(characterName: string) {
    return this.characterCooldowns()[characterName] || null
  }

  isCharacterOnCooldown(character: any): boolean {
    return !!this.characterCooldowns()[character.name]
  }

  isCharacterHpFull(character: any): boolean {
    if (!character) return false
    return character.hp >= character.max_hp
  }

  async restCharacter() {
    const selected = this.selectedCharacter()
    if (!selected) return

    // Don't allow resting if character is on cooldown
    if (this.isCharacterOnCooldown(selected)) {
      return
    }

    try {
      const response = await actionRestMyNameActionRestPost({
        path: { name: selected.name },
      })

      if (response && 'data' in response) {
        const data = response.data!.data as any
        const character = data.character
        const cooldown = data.cooldown

        if (character) {
          const updatedCharacters = (
            this.queryClient.getQueryData(['my-characters']) as any[] || []
          ).map((c: any) => c.name === selected.name ? character : c)

          this.queryClient.setQueryData(['my-characters'], updatedCharacters)
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

  async fightMonster() {
    const selected = this.selectedCharacter()
    if (!selected) return

    if (this.isCharacterOnCooldown(selected)) {
      return
    }

    try {
      const response = await actionFightMyNameActionFightPost({
        path: { name: selected.name },
      })

      if (response && 'data' in response) {
        const data = response.data!.data as any
        const character = data.character
        const cooldown = data.cooldown

        if (character) {
          const updatedCharacters = (
            this.queryClient.getQueryData(['my-characters']) as any[] || []
          ).map((c: any) => c.name === selected.name ? character : c)

          this.queryClient.setQueryData(['my-characters'], updatedCharacters)
          this.selectedCharacter.set(character)
        }

        if (cooldown) {
          this.updateCharacterCooldown(selected.name, cooldown)
        }

        this.currentTilePosition.set({ x: character.x, y: character.y })
      }
    } catch (err) {
      console.error('Error fighting monster:', err)
    }
  }

  async gatherResource() {
    const selected = this.selectedCharacter()
    if (!selected) return

    if (this.isCharacterOnCooldown(selected)) {
      return
    }

    try {
      const response = await actionGatheringMyNameActionGatheringPost({
        path: { name: selected.name },
      })

      if (response && 'data' in response) {
        const data = response.data!.data as any
        const character = data.character
        const cooldown = data.cooldown

        if (character) {
          const updatedCharacters = (
            this.queryClient.getQueryData(['my-characters']) as any[] || []
          ).map((c: any) => c.name === selected.name ? character : c)

          this.queryClient.setQueryData(['my-characters'], updatedCharacters)
          this.selectedCharacter.set(character)
        }

        if (cooldown) {
          this.updateCharacterCooldown(selected.name, cooldown)
        }

        this.currentTilePosition.set({ x: character.x, y: character.y })
      }
    } catch (err) {
      console.error('Error gathering resource:', err)
    }
  }

  hasCharacter(tile: any): boolean {
    if (!tile) return false
    return this.characters().some(
      (char: any) => char.x === tile.x && char.y === tile.y,
    )
  }

  ngOnDestroy() {
    Object.values(this.cooldownIntervals).forEach((interval) =>
      clearInterval(interval),
    )
  }
}
