import type { Map as MapTile } from '../../domain/types'

export class TileUtils {
  static hasMonster(tile: MapTile | null): boolean {
    if (!tile) return false
    return (
      !!tile.interactions?.content &&
      tile.interactions.content.type === 'monster'
    )
  }

  static hasResource(tile: MapTile | null): boolean {
    if (!tile) return false
    return (
      !!tile.interactions?.content &&
      tile.interactions.content.type === 'resource'
    )
  }

  static hasNpc(tile: MapTile | null): boolean {
    if (!tile) return false
    return (
      !!tile.interactions?.content && tile.interactions.content.type === 'npc'
    )
  }

  static hasWorkshop(tile: MapTile | null): boolean {
    if (!tile) return false
    return (
      !!tile.interactions?.content &&
      tile.interactions.content.type === 'workshop'
    )
  }

  static getMonsterCode(tile: MapTile | null): string | null {
    if (!this.hasMonster(tile) || !tile?.interactions?.content) return null
    return tile.interactions.content.code
  }

  static getResourceCode(tile: MapTile | null): string | null {
    if (!this.hasResource(tile) || !tile?.interactions?.content) return null
    return tile.interactions.content.code
  }

  static getNpcCode(tile: MapTile | null): string | null {
    if (!this.hasNpc(tile) || !tile?.interactions?.content) return null
    return tile.interactions.content.code
  }

  static getWorkshopCode(tile: MapTile | null): string | null {
    if (!this.hasWorkshop(tile) || !tile?.interactions?.content) return null
    return tile.interactions.content.code
  }

  static getTileDescription(tile: MapTile | null): string {
    if (!tile) return 'No tile selected'

    const content = tile.interactions?.content
    if (!content) return `Tile at (${tile.x}, ${tile.y})`

    switch (content.type) {
      case 'monster':
        return `Monster: ${content.code}`
      case 'resource':
        return `Resource: ${content.code}`
      case 'npc':
        return `NPC: ${content.code}`
      case 'workshop':
        return `Workshop: ${content.code}`
      default:
        return `Tile at (${tile.x}, ${tile.y})`
    }
  }
}
