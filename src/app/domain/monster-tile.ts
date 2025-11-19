import { TileBase, TileRenderResult } from './tile-base'
import { getMonsterImageUrl } from '../shared/asset-urls'

export interface MonsterDetails {
  name: string
  code: string
  level: number
  type: 'normal' | 'elite' | 'boss'
  hp: number
  attack_fire: number
  attack_earth: number
  attack_water: number
  attack_air: number
  res_fire: number
  res_earth: number
  res_water: number
  res_air: number
  critical_strike: number
  initiative: number
  min_gold: number
  max_gold: number
  drops: {
    code: string
    rate: number
    min_quantity: number
    max_quantity: number
  }[]
}

export class MonsterTile extends TileBase {
  isMonster(): boolean {
    return true
  }

  isResource(): boolean {
    return false
  }

  isNpc(): boolean {
    return false
  }

  render(): TileRenderResult {
    return {
      type: 'emoji',
      value: this.getMonsterImage(),
      cssClass: 'monster-emoji',
    }
  }

  getMonsterCode(): string {
    return this.getInteractionCode() || 'unknown'
  }

  private getMonsterImage() {
    return getMonsterImageUrl(this.getMonsterCode())
  }
}
