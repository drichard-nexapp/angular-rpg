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
  protected data: TileData
  constructor(data: TileData) {
    this.data = data
  }

  get x(): number {
    return this.data.x
  }

  get y(): number {
    return this.data.y
  }

  get skin(): string {
    return this.data.skin
  }

  hasInteraction(): boolean {
    return !!(this.data.interactions && this.data.interactions.content)
  }

  getInteractionType(): string | null {
    if (!this.hasInteraction()) return null
    return this.data.interactions?.content?.type || null
  }

  getInteractionCode(): string | null {
    if (!this.hasInteraction()) return null
    return this.data.interactions?.content?.code || null
  }

  abstract isMonster(): boolean
  abstract isResource(): boolean
  abstract isNpc(): boolean
  abstract render(): TileRenderResult
}
