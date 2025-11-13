import { TileBase, TileData, TileRenderResult } from './tile-base'

export class TasksMasterTile extends TileBase {
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

  override isTasksMaster(): boolean {
    return true
  }

  render(): TileRenderResult {
    return {
      type: 'marker',
      value: '📋',
      cssClass: 'tasks-master-marker',
    }
  }

  getVisualMarker(): { type: string; value: string } {
    return {
      type: 'tasks_master',
      value: '📋',
    }
  }

  getTasksMasterCode(): string {
    return this.getInteractionCode() || 'unknown'
  }
}
