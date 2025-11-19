import { TileBase, TileRenderResult } from './tile-base'

export class ResourceTile extends TileBase {
  isMonster(): boolean {
    return false
  }

  isResource(): boolean {
    return true
  }

  isNpc(): boolean {
    return false
  }

  render(): TileRenderResult {
    return {
      type: 'emoji',
      value: '💎',
      cssClass: 'resource-marker',
    }
  }

  getVisualMarker(): { type: string; value: string } {
    return {
      type: 'resource',
      value: '💎',
    }
  }

  getResourceCode(): string {
    return this.getInteractionCode() || 'unknown'
  }

  getResourceType(): string {
    const code = this.getInteractionCode()?.toLowerCase() || ''

    // Determine resource type from code
    if (code.includes('wood') || code.includes('tree')) return 'wood'
    if (code.includes('stone') || code.includes('rock')) return 'stone'
    if (code.includes('iron') || code.includes('ore')) return 'ore'
    if (code.includes('gold')) return 'gold'
    if (code.includes('crystal')) return 'crystal'

    return 'generic'
  }
}
