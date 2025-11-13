import { TileBase, TileData, TileRenderResult } from './tile-base'

export class WorkshopTile extends TileBase {
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

  override isWorkshop(): boolean {
    return true
  }

  render(): TileRenderResult {
    return {
      type: 'marker',
      value: '🔨',
      cssClass: 'workshop-marker',
    }
  }

  getVisualMarker(): { type: string; value: string } {
    return {
      type: 'workshop',
      value: '🔨',
    }
  }

  getWorkshopCode(): string {
    return this.getInteractionCode() || 'unknown'
  }
}
