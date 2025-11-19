import {
  Component,
  computed,
  input,
  output,
  inject,
  effect,
  signal,
  viewChild,
  ElementRef,
} from '@angular/core'
import { injectQuery } from '@tanstack/angular-query-experimental'
import { TileBase, TileFactory } from '../../domain/tile'
import type { Character, MapLayer, Map as MapTile } from '../../domain/types'
import { MapService } from '../../services/map.service'
import { QUERY_KEYS } from '../../shared/constants/query-keys'
import { APP_CONFIG } from '../../shared/constants/app-config'
import { CharacterUtils } from '../../shared/utils/character.utils'
import { LoggerService } from '../../services/logger.service'
import {
  getMapImageUrl,
  getCharacterSkinImageUrl,
} from '../../shared/asset-urls'

@Component({
  selector: 'app-map',
  imports: [],
  templateUrl: './map.html',
  styleUrl: './map.scss',
})
export class Map {
  private mapService = inject(MapService)
  private logger = inject(LoggerService)

  characters = input.required<Character[]>()
  selectedCharacter = input<Character | null>(null)
  scrollToPosition = input<{ x: number; y: number } | null>(null)
  selectedTile = input<MapTile | null>(null)
  tileClick = output<MapTile>()

  mapContainer = viewChild<ElementRef<HTMLDivElement>>('mapContainer')
  hoveredTile = signal<MapTile | null>(null)

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
    effect(() => {
      const chars = this.characters()
      this.logger.info(`Map received ${chars.length} characters`, 'Map')
      chars.forEach((char, index) => {
        this.logger.info(`Character ${index} raw data:`, 'Map', char)
        const hasValidPos = CharacterUtils.hasValidPosition(char)
        this.logger.info(
          `Character: ${char?.name || 'undefined'}, Skin: ${char?.skin || 'undefined'}, Position: (${char?.x}, ${char?.y}), Valid: ${hasValidPos}`,
          'Map',
        )
      })
    })

    effect(() => {
      const position = this.scrollToPosition()
      const container = this.mapContainer()

      if (position && container) {
        this.scrollToTile(position.x, position.y)
      }
    })
  }

  createTile(tileData: MapTile): TileBase | null {
    if (!tileData) return null
    return TileFactory.createTile(tileData)
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
          tileY: tile.y,
        })
        return false
      }
      return char.x === tile.x && char.y === tile.y
    })
  }

  isTileSelected(tile: MapTile | null): boolean {
    const selected = this.selectedTile()
    if (!tile || !selected) return false
    return tile.x === selected.x && tile.y === selected.y
  }

  getCharactersAt(tile: MapTile | null): Character[] {
    if (!tile) return []
    return this.characters().filter((char) => {
      if (!CharacterUtils.hasValidPosition(char)) {
        return false
      }
      return char.x === tile.x && char.y === tile.y
    })
  }

  getMapImageUrl(skin: string): string {
    return getMapImageUrl(skin)
  }

  getCharacterSkinImageUrl(skin: string): string {
    return getCharacterSkinImageUrl(skin)
  }

  onTileMouseEnter(tile: MapTile | null): void {
    if (tile) {
      this.hoveredTile.set(tile)
    }
  }

  onTileMouseLeave(): void {
    this.hoveredTile.set(null)
  }

  getTileSummary(tile: MapTile | null): string {
    if (!tile) return ''

    const parts: string[] = []
    parts.push(`Position: (${tile.x}, ${tile.y})`)

    const tileObj = this.createTile(tile)
    if (tileObj) {
      const interactionType = tile.interactions?.content?.type

      if (interactionType === 'monster') {
        const code = tile.interactions?.content?.code
        parts.push(`Monster: ${code || 'Unknown'}`)
      } else if (interactionType === 'resource') {
        const code = tile.interactions?.content?.code
        parts.push(`Resource: ${code || 'Unknown'}`)
      } else if (interactionType === 'npc') {
        parts.push('NPC')
      } else if (interactionType === 'workshop') {
        const code = tile.interactions?.content?.code
        parts.push(`Workshop: ${code || 'Unknown'}`)
      } else if (interactionType === 'bank') {
        parts.push('Bank')
      } else if (interactionType === 'grand_exchange') {
        parts.push('Grand Exchange')
      } else if (interactionType === 'tasks_master') {
        parts.push('Tasks Master')
      } else {
        parts.push(`Terrain: ${tile.skin}`)
      }
    }

    const charactersHere = this.getCharactersAt(tile)
    if (charactersHere.length > 0) {
      const names = charactersHere.map((c) => c.name).join(', ')
      parts.push(`Characters: ${names}`)
    }

    return parts.join(' | ')
  }

  private scrollToTile(x: number, y: number): void {
    const container = this.mapContainer()
    if (!container) return

    const layers = this.layers()
    if (layers.length === 0) return

    const tiles = layers[0].tiles
    if (!tiles || tiles.length === 0) return

    const minX = Math.min(...tiles.map((t) => t.x))
    const minY = Math.min(...tiles.map((t) => t.y))

    const gridCol = x - minX
    const gridRow = y - minY

    const tileSize = 32
    const scrollX =
      gridCol * tileSize -
      container.nativeElement.clientWidth / 2 +
      tileSize / 2
    const scrollY =
      gridRow * tileSize -
      container.nativeElement.clientHeight / 2 +
      tileSize / 2

    container.nativeElement.scrollTo({
      left: scrollX,
      top: scrollY,
      behavior: 'smooth',
    })

    this.logger.info(
      `Scrolling to tile (${x}, ${y}) at grid position (${gridRow}, ${gridCol})`,
      'Map',
    )
  }
}
