import { TileBase, TileData } from './tile-base'
import { MonsterTile } from './monster-tile'
import { ResourceTile } from './resource-tile'
import { NpcTile } from './npc-tile'
import { WorkshopTile } from './workshop-tile'
import { BankTile } from './bank-tile'
import { GrandExchangeTile } from './grand-exchange-tile'
import { TasksMasterTile } from './tasks-master-tile'
import { TerrainTile } from './terrain-tile'

export class TileFactory {
  static createTile(data: TileData): TileBase {
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
      case 'workshop':
        return new WorkshopTile(data)
      case 'bank':
        return new BankTile(data)
      case 'grand_exchange':
        return new GrandExchangeTile(data)
      case 'tasks_master':
        return new TasksMasterTile(data)
      default:
        return new TerrainTile(data)
    }
  }
}
