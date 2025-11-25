import {
  Component,
  input,
  output,
  inject,
  effect,
  signal,
  computed,
} from '@angular/core'
import { TileBase, TileFactory } from '../../domain/tile'
import type { Character, Map as MapTile } from '../../domain/types'
import { LoggerService } from '../../services/logger.service'
import { CharacterUtils } from '../../shared/utils'
import {
  getMapImageUrl,
  getCharacterSkinImageUrl,
} from '../../shared/asset-urls'
import { TilesStore } from '../../stores/tilesStore/tiles.store'
import { toSignal } from '@angular/core/rxjs-interop'

@Component({
  selector: 'app-map',
  imports: [],
  templateUrl: './map.html',
  styleUrl: './map.scss',
})
export class Map {
  private logger = inject(LoggerService)
  private tilesStore = inject(TilesStore)

  store = toSignal(this.tilesStore.useStore())
  loading = toSignal(this.tilesStore.useStore((t) => t.loading))

  layers = computed(() => {
    return ['overworld']
  })

  characters = input.required<Character[]>()
  selectedCharacter = input<Character | null>(null)
  selectedTile = input<MapTile | null>(null)
  hoveredTile = signal<MapTile | null>(null)

  tileClick = output<MapTile>()
  protected readonly grid = computed(() => {
    const tiles = Object.values(this.store()?.tiles || [])
    console.log(tiles)
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
}
