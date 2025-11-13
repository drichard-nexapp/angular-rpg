import { TileBase, TileData, TileRenderResult } from './tile-base'

export class GrandExchangeTile extends TileBase {
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

  override isGrandExchange(): boolean {
    return true
  }

  render(): TileRenderResult {
    return {
      type: 'marker',
      value: '💱',
      cssClass: 'grand-exchange-marker',
    }
  }

  getVisualMarker(): { type: string; value: string } {
    return {
      type: 'grand_exchange',
      value: '💱',
    }
  }

  getGrandExchangeCode(): string {
    return this.getInteractionCode() || 'unknown'
  }
}
