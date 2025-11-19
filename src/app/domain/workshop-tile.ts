import { TileBase, TileRenderResult } from './tile-base'

export class WorkshopTile extends TileBase {
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
      type: 'marker',
      value: '🔨',
      cssClass: 'workshop-marker',
    }
  }
}
