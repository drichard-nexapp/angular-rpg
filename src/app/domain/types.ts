import type {
  CharacterSchema,
  CooldownSchema,
  MapSchema,
  MonsterSchema,
  ResourceSchema,
  NpcSchema,
  NpcItem as NpcItemSchema,
  CharacterMovementDataSchema,
  CharacterRestDataSchema,
  CharacterFightDataSchema,
  ActiveEventSchema,
  TaskFullSchema,
  ItemSchema,
  CraftSchema,
  CraftingSchema,
  InventorySlot,
} from '../../sdk/api'

export type Character = CharacterSchema

export type Cooldown = CooldownSchema

export type Map = MapSchema

export type Monster = MonsterSchema

export type Resource = ResourceSchema

export type Npc = NpcSchema

export type NpcItem = NpcItemSchema

export type Item = ItemSchema

export type Craft = CraftSchema

export type Crafting = CraftingSchema

export type Inventory = InventorySlot

export type CharacterMovementData = CharacterMovementDataSchema

export type CharacterRestData = CharacterRestDataSchema

export type CharacterFightData = CharacterFightDataSchema

export type ActiveEvent = ActiveEventSchema

export type TaskFull = TaskFullSchema

export interface TilePosition {
  x: number
  y: number
}

export interface CooldownTracking extends Cooldown {
  remainingSeconds: number
}

export interface MapLayer {
  name: string
  tiles: Map[]
  grid: (Map | null)[][]
}
