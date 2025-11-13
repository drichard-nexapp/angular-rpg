export interface TileContent {
  type: string
  code: string
}

export interface TileInteractions {
  content?: TileContent
}

export interface TileData {
  x: number
  y: number
  skin: string
  interactions?: TileInteractions
}

export interface TileRenderResult {
  type: 'ascii' | 'emoji' | 'marker'
  value: string
  cssClass?: string
}

export abstract class TileBase {
  constructor(protected data: TileData) {}

  get x(): number {
    return this.data.x
  }

  get y(): number {
    return this.data.y
  }

  get skin(): string {
    return this.data.skin
  }

  get interactions(): TileInteractions | undefined {
    return this.data.interactions
  }

  get rawData(): TileData {
    return this.data
  }

  hasInteraction(): boolean {
    return !!(this.data.interactions && this.data.interactions.content)
  }

  getInteractionType(): string | null {
    if (!this.hasInteraction()) return null
    return this.data.interactions!.content!.type
  }

  getInteractionCode(): string | null {
    if (!this.hasInteraction()) return null
    return this.data.interactions!.content!.code
  }

  abstract isMonster(): boolean
  abstract isResource(): boolean
  abstract isNpc(): boolean
  abstract render(): TileRenderResult
  abstract getVisualMarker(): { type: string; value: string }

  isWorkshop(): boolean {
    return false
  }

  isBank(): boolean {
    return false
  }

  isGrandExchange(): boolean {
    return false
  }

  isTasksMaster(): boolean {
    return false
  }

  getAsciiRepresentation(): string {
    const skin = this.skin?.toLowerCase() || ''

    // Forest tiles
    if (skin.includes('forest')) {
      if (skin.includes('tree')) return ' T '
      if (skin.includes('road')) return '==='
      if (skin.includes('village')) return ' H '
      if (skin.includes('bank')) return ' $ '
      return ' * '
    }

    // Water tiles
    if (
      skin.includes('water') ||
      skin.includes('lake') ||
      skin.includes('coastline') ||
      skin.includes('sea')
    ) {
      return '~~~'
    }

    // Desert tiles
    if (skin.includes('desert')) {
      return '...'
    }

    // Mountain tiles
    if (skin.includes('mountain')) {
      return '/^\\'
    }

    return ':::'
  }
}
