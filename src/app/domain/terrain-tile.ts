import { TileBase, TileData, TileRenderResult } from './tile-base'

export class TerrainTile extends TileBase {
  constructor(data: TileData) {
    super(data)
  }

  isMonster(): boolean {
    return false
  }

  isResource(): boolean {
    return false
  }

  isNpc(): boolean {
    return false
  }

  render(): TileRenderResult {
    return {
      type: 'ascii',
      value: this.getAsciiRepresentation(),
      cssClass: 'tile-ascii',
    }
  }

  getVisualMarker(): { type: string; value: string } {
    return {
      type: 'ascii',
      value: this.getAsciiRepresentation(),
    }
  }

  getTerrainType(): string {
    const skin = this.skin?.toLowerCase() || ''

    if (skin.includes('forest')) return 'forest'
    if (
      skin.includes('water') ||
      skin.includes('lake') ||
      skin.includes('coastline') ||
      skin.includes('sea')
    )
      return 'water'
    if (skin.includes('desert')) return 'desert'
    if (skin.includes('mountain')) return 'mountain'

    return 'unknown'
  }

  isWalkable(): boolean {
    const terrainType = this.getTerrainType()

    // Water tiles are typically not walkable
    if (terrainType === 'water') return false

    // Most other terrain types are walkable
    return true
  }
}
