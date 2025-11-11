import { TileBase, TileData, TileRenderResult } from './tile-base'

export class NpcTile extends TileBase {
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
    return true
  }

  render(): TileRenderResult {
    return {
      type: 'marker',
      value: '!',
      cssClass: 'npc-marker',
    }
  }

  getVisualMarker(): { type: string; value: string } {
    return {
      type: 'npc',
      value: '!',
    }
  }

  getNpcCode(): string {
    return this.getInteractionCode() || 'unknown'
  }

  getNpcType(): string {
    const code = this.getInteractionCode()?.toLowerCase() || ''

    // Determine NPC type from code
    if (code.includes('merchant') || code.includes('trader')) return 'merchant'
    if (code.includes('guard') || code.includes('soldier')) return 'guard'
    if (code.includes('quest') || code.includes('giver')) return 'questgiver'
    if (code.includes('villager')) return 'villager'
    if (code.includes('innkeeper')) return 'innkeeper'

    return 'generic'
  }
}
