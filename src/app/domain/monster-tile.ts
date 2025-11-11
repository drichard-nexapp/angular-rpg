import { TileBase, TileData, TileRenderResult } from './tile-base'

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
  drops: Array<{ code: string; rate: number; min_quantity: number; max_quantity: number }>
}

export class MonsterTile extends TileBase {
  constructor(data: TileData) {
    super(data)
  }

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
      value: this.getMonsterEmoji(),
      cssClass: 'monster-emoji',
    }
  }

  getMonsterEmoji(): string {
    const code = this.getInteractionCode()?.toLowerCase() || ''

    // Map monster codes to emojis
    if (code.includes('slime')) {
      if (code.includes('blue')) return '🔵'
      if (code.includes('green')) return '🟢'
      if (code.includes('red')) return '🔴'
      if (code.includes('yellow')) return '🟡'
      if (code.includes('king')) return '👑'
      return '🟣'
    }
    if (code.includes('chicken')) return '🐔'
    if (code.includes('cow')) return '🐄'
    if (code.includes('pig')) return '🐷'
    if (code.includes('sheep')) return '🐑'
    if (code.includes('wolf')) return '🐺'
    if (code.includes('spider')) return '🕷️'
    if (code.includes('skeleton')) return '💀'
    if (code.includes('goblin')) return '👺'
    if (code.includes('orc')) return '🧟'
    if (code.includes('ogre')) return '👹'
    if (code.includes('cyclops')) return '👁️'
    if (code.includes('dragon')) return '🐉'
    if (code.includes('serpent')) return '🐍'
    if (code.includes('bat')) return '🦇'
    if (code.includes('rat')) return '🐀'
    if (code.includes('bear')) return '🐻'
    if (code.includes('owlbear')) return '🦉'
    if (code.includes('imp')) return '😈'
    if (code.includes('demon')) return '👿'
    if (code.includes('hellhound')) return '🔥'
    if (code.includes('cultist')) return '🧙'
    if (code.includes('highwayman')) return '🗡️'

    return '👾'
  }

  getVisualMarker(): { type: string; value: string } {
    return {
      type: 'monster',
      value: this.getMonsterEmoji(),
    }
  }

  getMonsterCode(): string {
    return this.getInteractionCode() || 'unknown'
  }
}
