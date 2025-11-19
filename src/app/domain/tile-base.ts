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
}
