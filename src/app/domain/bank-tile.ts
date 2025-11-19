import { TileBase, TileRenderResult } from './tile-base'

export class BankTile extends TileBase {
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
      value: '🏦',
      cssClass: 'bank-marker',
    }
  }
}
