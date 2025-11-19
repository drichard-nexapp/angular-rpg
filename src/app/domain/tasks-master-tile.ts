import { TileBase, TileRenderResult } from './tile-base'

export class TasksMasterTile extends TileBase {
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
      value: '📋',
      cssClass: 'tasks-master-marker',
    }
  }
}
