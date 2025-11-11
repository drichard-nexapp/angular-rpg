# Specialized Tile Types

## Overview

The tile domain has been refactored into specialized tile classes using object-oriented inheritance. Each tile type encapsulates its own specific behavior and logic.

## Architecture

```
TileBase (abstract)
├── MonsterTile
├── ResourceTile
├── NpcTile
└── TerrainTile
```

### TileBase (Abstract Base Class)

The abstract base class that all specialized tiles inherit from.

**Location**: `src/app/domain/tile-base.ts`

**Responsibilities**:
- Common tile properties (x, y, skin, interactions)
- ASCII terrain representation
- Interaction detection
- Abstract methods that must be implemented by subclasses

**Abstract Methods** (must be implemented):
- `isMonster(): boolean`
- `isResource(): boolean`
- `isNpc(): boolean`
- `getVisualMarker(): { type, value }`

**Common Methods**:
- `getAsciiRepresentation(): string` - Get ASCII art for terrain
- `hasInteraction(): boolean` - Check if tile has any interaction
- `getInteractionType(): string | null` - Get interaction type
- `getInteractionCode(): string | null` - Get interaction code

## Specialized Tile Classes

### 1. MonsterTile

Represents tiles with monster interactions.

**Location**: `src/app/domain/monster-tile.ts`

**Specific Methods**:
- `getMonsterEmoji(): string` - Get emoji representation for the monster
- `getMonsterCode(): string` - Get monster code identifier

**Example**:
```typescript
import { TileFactory } from './domain/tile-factory'
import { MonsterTile } from './domain/monster-tile'

const tile = TileFactory.createTile({
  x: 5,
  y: 10,
  skin: 'forest',
  interactions: {
    content: {
      type: 'monster',
      code: 'blue_slime'
    }
  }
})

if (tile instanceof MonsterTile) {
  console.log(tile.getMonsterEmoji()) // '🔵'
  console.log(tile.getMonsterCode()) // 'blue_slime'
}
```

**Monster Emoji Mapping**:
- Slimes: 🔵 🟢 🔴 🟡 👑 🟣
- Animals: 🐔 🐄 🐷 🐑 🐺
- Undead: 💀 🧟
- Mythical: 🐉 👹 👺 👁️
- Default: 👾

### 2. ResourceTile

Represents tiles with resource gathering interactions.

**Location**: `src/app/domain/resource-tile.ts`

**Specific Methods**:
- `getResourceCode(): string` - Get resource code identifier
- `getResourceType(): string` - Get categorized resource type (wood, stone, ore, gold, crystal, generic)

**Example**:
```typescript
const tile = TileFactory.createTile({
  x: 5,
  y: 10,
  skin: 'mountain_peak',
  interactions: {
    content: {
      type: 'resource',
      code: 'iron_ore'
    }
  }
}) as ResourceTile

console.log(tile.getResourceCode()) // 'iron_ore'
console.log(tile.getResourceType()) // 'ore'
console.log(tile.getVisualMarker()) // { type: 'resource', value: '💎' }
```

**Resource Categories**:
- `wood` - Wood and tree resources
- `stone` - Stone and rock resources
- `ore` - Iron and metal ores
- `gold` - Gold resources
- `crystal` - Crystal resources
- `generic` - Other resources

### 3. NpcTile

Represents tiles with NPC interactions.

**Location**: `src/app/domain/npc-tile.ts`

**Specific Methods**:
- `getNpcCode(): string` - Get NPC code identifier
- `getNpcType(): string` - Get categorized NPC type (merchant, guard, questgiver, villager, innkeeper, generic)

**Example**:
```typescript
const tile = TileFactory.createTile({
  x: 5,
  y: 10,
  skin: 'forest_village',
  interactions: {
    content: {
      type: 'npc',
      code: 'merchant'
    }
  }
}) as NpcTile

console.log(tile.getNpcCode()) // 'merchant'
console.log(tile.getNpcType()) // 'merchant'
console.log(tile.getVisualMarker()) // { type: 'npc', value: '!' }
```

**NPC Categories**:
- `merchant` - Traders and merchants
- `guard` - Guards and soldiers
- `questgiver` - Quest givers
- `villager` - Generic villagers
- `innkeeper` - Innkeepers
- `generic` - Other NPCs

### 4. TerrainTile

Represents tiles without any interactions (pure terrain).

**Location**: `src/app/domain/terrain-tile.ts`

**Specific Methods**:
- `getTerrainType(): string` - Get terrain category (forest, water, desert, mountain, unknown)
- `isWalkable(): boolean` - Check if terrain can be walked on

**Example**:
```typescript
const tile = TileFactory.createTile({
  x: 5,
  y: 10,
  skin: 'water_lake'
}) as TerrainTile

console.log(tile.getTerrainType()) // 'water'
console.log(tile.isWalkable()) // false
console.log(tile.getAsciiRepresentation()) // '~~~'
```

**Terrain Categories**:
- `forest` - Forest tiles
- `water` - Water, lake, sea tiles (not walkable)
- `desert` - Desert tiles
- `mountain` - Mountain tiles
- `unknown` - Other terrain

## TileFactory

The factory pattern is used to create the appropriate tile type based on the interaction data.

**Location**: `src/app/domain/tile-factory.ts`

**Usage**:
```typescript
import { TileFactory } from './domain/tile-factory'

// Factory automatically creates the correct type
const tile = TileFactory.createTile(tileData)

// Type checking with instanceof
if (tile instanceof MonsterTile) {
  // Monster-specific logic
  const emoji = tile.getMonsterEmoji()
}

if (tile instanceof ResourceTile) {
  // Resource-specific logic
  const resourceType = tile.getResourceType()
}

if (tile instanceof NpcTile) {
  // NPC-specific logic
  const npcType = tile.getNpcType()
}

if (tile instanceof TerrainTile) {
  // Terrain-specific logic
  const isWalkable = tile.isWalkable()
}
```

**Factory Logic**:
1. No interaction → `TerrainTile`
2. Interaction type = 'monster' → `MonsterTile`
3. Interaction type = 'resource' → `ResourceTile`
4. Interaction type = 'npc' → `NpcTile`
5. Unknown interaction → `TerrainTile` (fallback)

## Benefits of Specialized Tiles

### 1. Single Responsibility Principle
Each tile class has a focused responsibility:
- `MonsterTile` - Monster-specific logic only
- `ResourceTile` - Resource-specific logic only
- `NpcTile` - NPC-specific logic only
- `TerrainTile` - Terrain-specific logic only

### 2. Type Safety
TypeScript can enforce types at compile time:
```typescript
function handleMonster(tile: MonsterTile) {
  // TypeScript knows this is a MonsterTile
  const emoji = tile.getMonsterEmoji() // ✓ Valid
  const resourceType = tile.getResourceType() // ✗ Compile error
}
```

### 3. Open/Closed Principle
Easy to add new tile types without modifying existing code:
```typescript
// Add new tile type
export class QuestTile extends TileBase {
  isMonster() { return false }
  isResource() { return false }
  isNpc() { return false }
  isQuest() { return true }

  getQuestDetails() {
    // Quest-specific logic
  }
}

// Update factory
case 'quest':
  return new QuestTile(data)
```

### 4. Extensibility
Each specialized tile can have unique methods:
- `MonsterTile.getMonsterEmoji()` - Only monsters have emojis
- `ResourceTile.getResourceType()` - Only resources have types
- `TerrainTile.isWalkable()` - Only terrain has walkability

### 5. Code Organization
Related logic is grouped together:
- All monster logic in `monster-tile.ts`
- All resource logic in `resource-tile.ts`
- All NPC logic in `npc-tile.ts`
- All terrain logic in `terrain-tile.ts`

## Testing

Specialized tiles are fully tested with 23 passing unit tests.

**Run tests**:
```bash
npm test -- --include='**/tiles.spec.ts'
```

**Test Coverage**:
- TileFactory creation for all types
- Monster emoji mapping
- Resource type categorization
- NPC type categorization
- Terrain type detection
- Walkability checks
- Visual marker generation

## Migration from Old Tile Class

The refactoring maintains backward compatibility:

**Before** (monolithic Tile class):
```typescript
import { Tile } from './domain/tile'

const tile = new Tile(tileData)
if (tile.isMonster()) {
  const emoji = tile.getMonsterEmoji()
}
```

**After** (specialized tiles):
```typescript
import { TileFactory, MonsterTile } from './domain/tile'

const tile = TileFactory.createTile(tileData)
if (tile instanceof MonsterTile) {
  const emoji = tile.getMonsterEmoji()
}
```

**Key Changes**:
1. Use `TileFactory.createTile()` instead of `new Tile()`
2. Use `instanceof` checks instead of `isMonster()` when you need type-specific methods
3. Import specific tile types when needed

## Best Practices

### 1. Always use TileFactory
```typescript
// ✓ Good
const tile = TileFactory.createTile(tileData)

// ✗ Bad - don't instantiate directly
const tile = new MonsterTile(tileData)
```

### 2. Use instanceof for type-specific logic
```typescript
// ✓ Good
if (tile instanceof MonsterTile) {
  const emoji = tile.getMonsterEmoji()
}

// ✗ Bad - loses type information
if (tile.isMonster()) {
  const emoji = tile.getMonsterEmoji() // TypeScript error
}
```

### 3. Keep specialized logic in specialized classes
```typescript
// ✓ Good - Add to MonsterTile
class MonsterTile {
  getMonsterLevel(): number {
    // Monster-specific logic
  }
}

// ✗ Bad - Don't add to base class
class TileBase {
  getMonsterLevel(): number {
    // This doesn't make sense for ResourceTile
  }
}
```

## Future Enhancements

Potential additions:

### 1. ShopTile
```typescript
export class ShopTile extends TileBase {
  getShopType(): 'general' | 'weapons' | 'armor' | 'potions'
  getInventory(): Item[]
}
```

### 2. QuestTile
```typescript
export class QuestTile extends TileBase {
  getQuestDetails(): Quest
  isQuestAvailable(character: Character): boolean
}
```

### 3. DungeonEntranceTile
```typescript
export class DungeonEntranceTile extends TileBase {
  getDungeonName(): string
  getRequiredLevel(): number
}
```

## Summary

The specialized tile architecture provides:
- ✅ Better code organization
- ✅ Stronger type safety
- ✅ Easier testing
- ✅ Better extensibility
- ✅ Clearer responsibilities
- ✅ More maintainable code

Each tile type is now a focused, well-tested, and extensible domain object that encapsulates its own specific behavior.
