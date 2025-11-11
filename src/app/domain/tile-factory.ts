import { TileBase, TileData } from './tile-base'
import { MonsterTile } from './monster-tile'
import { ResourceTile } from './resource-tile'
import { NpcTile } from './npc-tile'
import { TerrainTile } from './terrain-tile'

export class TileFactory {
  static createTile(data: TileData): TileBase {
    // Check if tile has interactions
    if (!data.interactions || !data.interactions.content) {
      return new TerrainTile(data)
    }

    const interactionType = data.interactions.content.type

    switch (interactionType) {
      case 'monster':
        return new MonsterTile(data)
      case 'resource':
        return new ResourceTile(data)
      case 'npc':
        return new NpcTile(data)
      default:
        // Unknown interaction type, treat as terrain
        return new TerrainTile(data)
    }
  }
}
