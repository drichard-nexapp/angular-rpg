import { Component, computed, input, output } from '@angular/core'
import { injectQuery } from '@tanstack/angular-query-experimental'
import { getLayerMapsMapsLayerGet, type CharacterSkin } from '../../../sdk/api'
import mapSkins from '../../../assets/map-skins.json'
import { TileBase, TileFactory } from '../../domain/tile'
import type { Character, MapLayer, Map as MapTile } from '../../domain/types'

@Component({
  selector: 'app-map',
  imports: [],
  templateUrl: './map.html',
  styleUrl: './map.scss',
})
export class Map {
  characters = input.required<Character[]>()
  selectedCharacter = input<Character | null>(null)
  tileClick = output<MapTile>()

  skinColors: Record<string, string> = {}

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

  mapsQuery = injectQuery(() => ({
    queryKey: ['maps', 'overworld'],
    queryFn: async (): Promise<MapLayer[]> => {
      const tiles = await this.fetchAllLayerPages('overworld')
      const grid = this.createGrid(tiles)
      return [{ name: 'overworld', tiles, grid }]
    },
    staleTime: 1000 * 60 * 10,
  }))

  layers = computed((): MapLayer[] => this.mapsQuery.data() ?? [])
  loading = computed((): boolean => this.mapsQuery.isPending())
  error = computed((): string | null => {
    const mapsError = this.mapsQuery.error()
    if (mapsError) return (mapsError as Error).message
    return null
  })

  constructor() {
    this.initializeSkinColors()
  }

  private initializeSkinColors(): void {
    Object.entries(mapSkins).forEach(([skin, data]) => {
      this.skinColors[skin] = data.color
    })
  }

  private async fetchAllLayerPages(layerName: string): Promise<MapTile[]> {
    const allTiles: MapTile[] = []
    let page = 1
    let hasMore = true

    while (hasMore) {
      const layerResponse = await getLayerMapsMapsLayerGet({
        // @ts-ignore
        path: { layer: layerName },
        query: { page, size: 100 },
      })

      if (layerResponse && 'data' in layerResponse && layerResponse.data) {
        const tiles = (layerResponse.data as { data?: MapTile[] })?.data || []
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

  private createGrid(tiles: MapTile[]): (MapTile | null)[][] {
    if (tiles.length === 0) return []

    const minX = Math.min(...tiles.map((t) => t.x))
    const maxX = Math.max(...tiles.map((t) => t.x))
    const minY = Math.min(...tiles.map((t) => t.y))
    const maxY = Math.max(...tiles.map((t) => t.y))

    const grid: (MapTile | null)[][] = []
    for (let y = minY; y <= maxY; y++) {
      const row: (MapTile | null)[] = []
      for (let x = minX; x <= maxX; x++) {
        const tile = tiles.find((t) => t.x === x && t.y === y)
        row.push(tile || null)
      }
      grid.push(row)
    }
    return grid
  }

  createTile(tileData: MapTile): TileBase | null {
    if (!tileData) return null
    return TileFactory.createTile(tileData)
  }

  getSkinColor(skin: string): string {
    if (!skin) return '#e0e0e0'
    return this.skinColors[skin] || '#e0e0e0'
  }

  getTileRender(tile: MapTile | null): { type: string; value: string; cssClass?: string } {
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

  onTileClick(tile: MapTile): void {
    this.tileClick.emit(tile)
  }

  hasCharacter(tile: MapTile | null): boolean {
    if (!tile) return false
    return this.characters().some(
      (char) => char.x === tile.x && char.y === tile.y,
    )
  }

  getCharacterAt(tile: MapTile | null): Character | null {
    if (!tile) return null
    return this.characters().find(
      (char) => char.x === tile.x && char.y === tile.y,
    ) || null
  }

  getSkinSymbol(skin: string): string {
    return this.skinSymbols[skin as CharacterSkin] || '👤'
  }
}
