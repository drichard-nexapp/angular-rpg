// Export all tile types and interfaces
export * from './tile-base'
export * from './monster-tile'
export * from './resource-tile'
export * from './npc-tile'
export * from './terrain-tile'
export * from './tile-factory'

// Backward compatibility: export Tile as alias to TileBase
export { TileBase as Tile } from './tile-base'
