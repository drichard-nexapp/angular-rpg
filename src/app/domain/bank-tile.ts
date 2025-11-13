import { TileBase, TileData, TileRenderResult } from './tile-base'

export class BankTile extends TileBase {
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

  override isBank(): boolean {
    return true
  }

  render(): TileRenderResult {
    return {
      type: 'marker',
      value: '🏦',
      cssClass: 'bank-marker',
    }
  }

  getVisualMarker(): { type: string; value: string } {
    return {
      type: 'bank',
      value: '🏦',
    }
  }

  getBankCode(): string {
    return this.getInteractionCode() || 'unknown'
  }
}
