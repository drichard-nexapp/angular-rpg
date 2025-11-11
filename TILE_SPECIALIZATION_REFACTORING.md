# Tile Specialization Refactoring

## Overview

The tile domain has been refactored from a single monolithic `Tile` class into specialized tile types using object-oriented inheritance and the Factory pattern.

## What Changed

### Before: Single Tile Class

```typescript
// One class doing everything
export class Tile {
  isMonster(): boolean {
    return this.getInteractionType() === 'monster'
  }

  isResource(): boolean {
    return this.getInteractionType() === 'resource'
  }

  isNpc(): boolean {
    return this.getInteractionType() === 'npc'
  }

  getMonsterEmoji(): string | null {
    if (!this.isMonster()) return null
    // ... 50+ lines of monster logic
  }

  getVisualMarker() {
    if (this.isMonster()) {
      return { type: 'monster', value: this.getMonsterEmoji() }
    }
    if (this.isNpc()) {
      return { type: 'npc', value: '!' }
    }
    if (this.isResource()) {
      return { type: 'resource', value: '💎' }
    }
    return { type: 'ascii', value: this.getAsciiRepresentation() }
  }
}
```

**Problems**:
- ❌ Single class doing too much (violates Single Responsibility)
- ❌ All tiles have methods they don't need (e.g., TerrainTile.getMonsterEmoji())
- ❌ Hard to add new tile-specific behavior
- ❌ Type checking relies on runtime checks

### After: Specialized Tile Classes

```typescript
// Base class with common functionality
export abstract class TileBase {
  abstract isMonster(): boolean
  abstract isResource(): boolean
  abstract isNpc(): boolean
  abstract getVisualMarker(): { type: string; value: string }

  getAsciiRepresentation(): string {
    // Common terrain ASCII logic
  }
}

// Specialized classes
export class MonsterTile extends TileBase {
  isMonster() { return true }
  isResource() { return false }
  isNpc() { return false }

  getMonsterEmoji(): string {
    // Monster-specific logic only
  }

  getMonsterCode(): string {
    // Monster-specific method
  }
}

export class ResourceTile extends TileBase {
  isMonster() { return false }
  isResource() { return true }
  isNpc() { return false }

  getResourceType(): string {
    // Resource-specific method
  }
}

export class NpcTile extends TileBase {
  isMonster() { return false }
  isResource() { return false }
  isNpc() { return true }

  getNpcType(): string {
    // NPC-specific method
  }
}

export class TerrainTile extends TileBase {
  isMonster() { return false }
  isResource() { return false }
  isNpc() { return false }

  isWalkable(): boolean {
    // Terrain-specific method
  }
}

// Factory to create appropriate type
export class TileFactory {
  static createTile(data: TileData): TileBase {
    if (!data.interactions?.content) {
      return new TerrainTile(data)
    }

    switch (data.interactions.content.type) {
      case 'monster': return new MonsterTile(data)
      case 'resource': return new ResourceTile(data)
      case 'npc': return new NpcTile(data)
      default: return new TerrainTile(data)
    }
  }
}
```

**Benefits**:
- ✅ Each class has a single, focused responsibility
- ✅ Type-specific methods only where they belong
- ✅ Easy to add new tile types (Open/Closed Principle)
- ✅ Better type safety with `instanceof` checks

## File Structure

### New Files

```
src/app/domain/
├── tile-base.ts                    # Abstract base class
├── monster-tile.ts                 # Monster-specific tile
├── resource-tile.ts                # Resource-specific tile
├── npc-tile.ts                     # NPC-specific tile
├── terrain-tile.ts                 # Terrain-specific tile
├── tile-factory.ts                 # Factory for creating tiles
├── tiles.spec.ts                   # Tests for all tile types (23 tests)
├── SPECIALIZED_TILES.md            # Detailed documentation
└── README.md                       # Updated with new architecture
```

### Updated Files

```
src/app/pages/map/map.ts            # Uses TileFactory
src/app/domain/tile.ts              # Now exports all tile types
```

## Architecture

```
         TileBase (abstract)
         /      |      \     \
        /       |       \     \
MonsterTile ResourceTile NpcTile TerrainTile
```

### TileBase
- Abstract base class
- Common properties and methods
- Forces subclasses to implement specific methods

### MonsterTile
- Handles monster interactions
- Methods: `getMonsterEmoji()`, `getMonsterCode()`
- Visual marker: Monster emoji

### ResourceTile
- Handles resource interactions
- Methods: `getResourceCode()`, `getResourceType()`
- Visual marker: 💎

### NpcTile
- Handles NPC interactions
- Methods: `getNpcCode()`, `getNpcType()`
- Visual marker: !

### TerrainTile
- Handles tiles without interactions
- Methods: `getTerrainType()`, `isWalkable()`
- Visual marker: ASCII art

### TileFactory
- Creates appropriate tile type based on data
- Encapsulates instantiation logic
- Single point of tile creation

## Usage Comparison

### Creating Tiles

**Before**:
```typescript
const tile = new Tile(tileData)
```

**After**:
```typescript
const tile = TileFactory.createTile(tileData)
```

### Type-Specific Logic

**Before**:
```typescript
if (tile.isMonster()) {
  const emoji = tile.getMonsterEmoji()
  // TypeScript can't guarantee getMonsterEmoji exists
}
```

**After**:
```typescript
if (tile instanceof MonsterTile) {
  const emoji = tile.getMonsterEmoji()
  const code = tile.getMonsterCode()
  // TypeScript guarantees these methods exist
}
```

### Component Integration

**Before**:
```typescript
// In map.ts
createTile(tileData: any): Tile | null {
  if (!tileData) return null
  return new Tile(tileData)
}

getMonsterEmoji(tile: any): string | null {
  if (!tile) return null
  const tileObj = this.createTile(tile)
  return tileObj?.getMonsterEmoji() || null
}
```

**After**:
```typescript
// In map.ts
createTile(tileData: any): TileBase | null {
  if (!tileData) return null
  return TileFactory.createTile(tileData)
}

getMonsterEmoji(tile: any): string | null {
  if (!tile) return null
  const tileObj = this.createTile(tile)
  if (tileObj instanceof MonsterTile) {
    return tileObj.getMonsterEmoji()
  }
  return null
}
```

## Type-Specific Methods

### MonsterTile

```typescript
const tile = TileFactory.createTile(data) as MonsterTile

tile.getMonsterEmoji()    // '🐺'
tile.getMonsterCode()     // 'wolf'
tile.getVisualMarker()    // { type: 'monster', value: '🐺' }
```

### ResourceTile

```typescript
const tile = TileFactory.createTile(data) as ResourceTile

tile.getResourceCode()     // 'iron_ore'
tile.getResourceType()     // 'ore'
tile.getVisualMarker()     // { type: 'resource', value: '💎' }
```

### NpcTile

```typescript
const tile = TileFactory.createTile(data) as NpcTile

tile.getNpcCode()         // 'merchant'
tile.getNpcType()         // 'merchant'
tile.getVisualMarker()    // { type: 'npc', value: '!' }
```

### TerrainTile

```typescript
const tile = TileFactory.createTile(data) as TerrainTile

tile.getTerrainType()           // 'water'
tile.isWalkable()               // false
tile.getAsciiRepresentation()   // '~~~'
tile.getVisualMarker()          // { type: 'ascii', value: '~~~' }
```

## Design Patterns Used

### 1. Factory Pattern
`TileFactory` creates the appropriate tile type based on interaction data.

**Benefits**:
- Centralized object creation
- Clients don't need to know which class to instantiate
- Easy to extend with new types

### 2. Template Method Pattern
`TileBase` defines the structure, subclasses implement specific behavior.

**Benefits**:
- Consistent interface across all tiles
- Subclasses can override specific methods
- Common logic stays in base class

### 3. Strategy Pattern
Different tile types have different strategies for visual representation.

**Benefits**:
- Behavior varies by tile type
- Easy to add new visualization strategies
- No conditional logic in client code

## Testing

All specialized tiles are fully tested with **23 passing unit tests**.

```bash
npm test -- --include='**/tiles.spec.ts'
```

**Test Coverage**:
- ✅ TileFactory creates correct types
- ✅ MonsterTile emoji mapping
- ✅ ResourceTile type categorization
- ✅ NpcTile type categorization
- ✅ TerrainTile walkability
- ✅ Visual marker generation
- ✅ Type safety with instanceof

## SOLID Principles

### Single Responsibility Principle ✅
Each tile class has one reason to change:
- `MonsterTile` - Changes to monster logic
- `ResourceTile` - Changes to resource logic
- `NpcTile` - Changes to NPC logic
- `TerrainTile` - Changes to terrain logic

### Open/Closed Principle ✅
Open for extension, closed for modification:
```typescript
// Add new tile type without modifying existing classes
export class QuestTile extends TileBase {
  isQuest() { return true }
  getQuestDetails() { /* ... */ }
}
```

### Liskov Substitution Principle ✅
Any `TileBase` can be used where a tile is expected:
```typescript
function processTile(tile: TileBase) {
  console.log(tile.x, tile.y)
  console.log(tile.getVisualMarker())
}

processTile(new MonsterTile(data))  // ✓
processTile(new ResourceTile(data)) // ✓
processTile(new TerrainTile(data))  // ✓
```

### Interface Segregation Principle ✅
Tiles only have methods they need:
- `MonsterTile` doesn't have resource methods
- `ResourceTile` doesn't have monster methods
- `TerrainTile` doesn't have interaction methods

### Dependency Inversion Principle ✅
Components depend on abstraction (`TileBase`), not concrete classes:
```typescript
createTile(tileData: any): TileBase | null {
  // Returns TileBase (abstraction), not specific type
  return TileFactory.createTile(tileData)
}
```

## Migration Guide

### Step 1: Update Imports
```typescript
// Before
import { Tile } from './domain/tile'

// After
import { TileBase, TileFactory, MonsterTile } from './domain/tile'
```

### Step 2: Use TileFactory
```typescript
// Before
const tile = new Tile(tileData)

// After
const tile = TileFactory.createTile(tileData)
```

### Step 3: Type-Safe Checks
```typescript
// Before
if (tile.isMonster()) {
  const emoji = tile.getMonsterEmoji()
}

// After
if (tile instanceof MonsterTile) {
  const emoji = tile.getMonsterEmoji()
  const code = tile.getMonsterCode() // Type-safe!
}
```

## Future Enhancements

The specialized architecture makes it easy to add:

### 1. Shop Tiles
```typescript
export class ShopTile extends TileBase {
  getShopInventory(): Item[]
  getShopType(): 'general' | 'weapons' | 'armor'
}
```

### 2. Quest Tiles
```typescript
export class QuestTile extends TileBase {
  getQuest(): Quest
  isQuestAvailable(character: Character): boolean
}
```

### 3. Dungeon Entrance Tiles
```typescript
export class DungeonEntranceTile extends TileBase {
  getDungeonName(): string
  getRequiredLevel(): number
}
```

## Performance Considerations

### Memory
- **Before**: All tiles had all methods (unused methods wasted memory)
- **After**: Each tile only has methods it needs

### Type Checking
- **Before**: Runtime string comparison (`type === 'monster'`)
- **After**: Fast instanceof checks (O(1) prototype chain lookup)

### Extensibility
- **Before**: Adding new type requires modifying existing class
- **After**: Adding new type = create new class + update factory

## Summary

The specialization refactoring provides:

✅ **Better Code Organization**
- Each tile type in its own file
- Related logic grouped together

✅ **Stronger Type Safety**
- TypeScript enforces types at compile time
- `instanceof` checks guarantee method availability

✅ **Easier Testing**
- Each tile type tested independently
- 23 passing unit tests

✅ **Better Extensibility**
- Add new tile types without modifying existing code
- Follow Open/Closed Principle

✅ **Clearer Responsibilities**
- Each class has a single, focused purpose
- No methods that don't make sense for the type

✅ **More Maintainable**
- Changes isolated to specific tile types
- Less chance of breaking other types

The application now has a robust, extensible tile system that follows SOLID principles and makes it easy to add new tile types and behaviors.
