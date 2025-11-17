import { Component, computed, input, output, inject, effect } from '@angular/core'
import { injectQuery } from '@tanstack/angular-query-experimental'
import type { CharacterSkin } from '../../../sdk/api'
import mapSkins from '../../../assets/map-skins.json'
import { TileBase, TileFactory } from '../../domain/tile'
import type { Character, MapLayer, Map as MapTile } from '../../domain/types'
import { SkinService } from '../../services/skin.service'
import { MapService } from '../../services/map.service'
import { QUERY_KEYS } from '../../shared/constants/query-keys'
import { APP_CONFIG } from '../../shared/constants/app-config'
import { CharacterUtils } from '../../shared/utils/character.utils'
import { LoggerService } from '../../services/logger.service'

@Component({
  selector: 'app-map',
  imports: [],
  templateUrl: './map.html',
  styleUrl: './map.scss',
})
export class Map {
  private mapService = inject(MapService)
  private logger = inject(LoggerService)
  skinService = inject(SkinService)

  characters = input.required<Character[]>()
  selectedCharacter = input<Character | null>(null)
  tileClick = output<MapTile>()

  skinColors: Record<string, string> = {}

  mapsQuery = injectQuery(() => ({
    queryKey: QUERY_KEYS.maps.layer('overworld'),
    queryFn: async (): Promise<MapLayer[]> => {
      const tiles = await this.mapService.fetchAllLayerTiles('overworld')
      const grid = this.mapService.createGrid(tiles)
      return [{ name: 'overworld', tiles, grid }]
    },
    staleTime: APP_CONFIG.CACHE.STALE_TIME_10_MIN,
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

    effect(() => {
      const chars = this.characters()
      this.logger.info(`Map received ${chars.length} characters`, 'Map')
      chars.forEach((char, index) => {
        this.logger.info(`Character ${index} raw data:`, 'Map', char)
        const hasValidPos = CharacterUtils.hasValidPosition(char)
        this.logger.info(
          `Character: ${char?.name || 'undefined'}, Skin: ${char?.skin || 'undefined'}, Position: (${char?.x}, ${char?.y}), Valid: ${hasValidPos}`,
          'Map'
        )
      })
    })
  }

  private initializeSkinColors(): void {
    Object.entries(mapSkins).forEach(([skin, data]) => {
      this.skinColors[skin] = data.color
    })
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
    return this.characters().some((char) => {
      if (!CharacterUtils.hasValidPosition(char)) {
        this.logger.warn(`Character ${char.name} has invalid position`, 'Map', {
          x: char.x,
          y: char.y,
          tileX: tile.x,
          tileY: tile.y
        })
        return false
      }
      return char.x === tile.x && char.y === tile.y
    })
  }

  getCharacterAt(tile: MapTile | null): Character | null {
    if (!tile) return null
    return this.characters().find((char) => {
      if (!CharacterUtils.hasValidPosition(char)) {
        return false
      }
      return char.x === tile.x && char.y === tile.y
    }) || null
  }

  getSkinSymbol(skin: string): string {
    const symbol = this.skinService.getSymbol(skin)
    if (symbol === '❓') {
      this.logger.warn(`Unknown skin type: ${skin}`, 'Map')
    }
    return symbol
  }
}
