# Domain Layer Refactoring

## Overview

This document describes the refactoring of tile-related logic into a domain layer, following Domain-Driven Design (DDD) principles.

## What Changed

### Before: Component-Based Logic

Previously, all tile-related logic was scattered throughout the Map component:

```typescript
// In map.ts component (200+ lines of tile logic)

getTileAscii(tile: any): string {
  if (!tile) return '   '
  const skin = tile.skin?.toLowerCase() || ''

  if (skin.includes('forest')) {
    if (skin.includes('tree')) return ' T '
    if (skin.includes('road')) return '==='
    // ... 30+ more lines
  }
  // ... 100+ more lines
}

getMonsterEmoji(tile: any): string | null {
  if (!tile || !tile.interactions.content) return null
  const content = tile.interactions.content
  if (content.type !== 'monster') return null
  // ... 50+ more lines
}

hasNpcInteraction(tile: any): boolean {
  if (!tile || !tile.interactions) return false
  return tile.interactions.content.type === 'npc'
}

hasResourceInteraction(tile: any): boolean {
  if (!tile || !tile.interactions) return false
  return tile.interactions.content.type === 'resource'
}
```

**Problems:**
- ❌ Business logic mixed with UI logic
- ❌ Difficult to test (requires Angular testing utilities)
- ❌ Hard to reuse across components
- ❌ No type safety for tile data
- ❌ Large component files (500+ lines)

### After: Domain-Based Logic

Now tile logic is encapsulated in a domain object:

```typescript
// In domain/tile.ts (clean, focused domain object)

export class Tile {
  constructor(private data: TileData) {}

  isMonster(): boolean {
    return this.getInteractionType() === 'monster'
  }

  getAsciiRepresentation(): string {
    // ... encapsulated logic
  }

  getMonsterEmoji(): string | null {
    // ... encapsulated logic
  }

  getVisualMarker() {
    // ... encapsulated logic
  }
}

// In map.ts component (simple delegation)
createTile(tileData: any): Tile | null {
  if (!tileData) return null
  return new Tile(tileData)
}

getTileAscii(tile: any): string {
  if (!tile) return '   '
  const tileObj = this.createTile(tile)
  return tileObj?.getAsciiRepresentation() || '   '
}
```

**Benefits:**
- ✅ Clean separation of concerns
- ✅ Easy to test (no Angular dependencies)
- ✅ Reusable across the application
- ✅ Type-safe with proper interfaces
- ✅ Smaller, more focused component files

## File Structure

```
src/app/
├── domain/
│   ├── README.md          # Domain layer documentation
│   ├── tile.ts            # Tile domain object
│   └── tile.spec.ts       # Unit tests for Tile
├── pages/
│   └── map/
│       ├── map.ts         # Map component (now smaller)
│       ├── map.html       # Template (unchanged)
│       └── map.scss       # Styles (unchanged)
```

## Architecture Benefits

### 1. Single Responsibility Principle

**Before:** Map component had multiple responsibilities
- Rendering UI
- Managing character state
- Managing cooldowns
- Tile logic
- Interaction detection
- Visual representation

**After:** Responsibilities are separated
- Map component: UI and state management
- Tile domain: Tile-specific logic

### 2. Testability

**Before:** Testing required Angular TestBed
```typescript
describe('Map Component', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [Map],
    })
  })

  it('should get tile ASCII', () => {
    const component = fixture.componentInstance
    const result = component.getTileAscii({ skin: 'forest_tree' })
    expect(result).toBe(' T ')
  })
})
```

**After:** Pure unit tests
```typescript
describe('Tile', () => {
  it('should get ASCII representation', () => {
    const tile = new Tile({ x: 0, y: 0, skin: 'forest_tree' })
    expect(tile.getAsciiRepresentation()).toBe(' T ')
  })
})
```

### 3. Reusability

**Before:** Logic tied to Map component
- Can't use tile logic in other components
- Duplication if needed elsewhere

**After:** Domain object can be used anywhere
```typescript
// In any component or service
import { Tile } from '../domain/tile'

const tile = new Tile(tileData)
if (tile.isMonster()) {
  // Handle monster
}
```

### 4. Type Safety

**Before:** Using `any` types
```typescript
getTileAscii(tile: any): string {
  const skin = tile.skin?.toLowerCase() || ''
  // No type checking, easy to make mistakes
}
```

**After:** Proper interfaces and types
```typescript
export interface TileData {
  x: number
  y: number
  skin: string
  interactions?: TileInteractions
}

export class Tile {
  constructor(private data: TileData) {}
  // TypeScript ensures data structure
}
```

## Migration Path

The refactoring maintains backward compatibility:

1. **Domain layer created**: New `Tile` class with all tile logic
2. **Component adapted**: Component methods now delegate to domain object
3. **Template unchanged**: No changes needed to HTML templates
4. **Gradual adoption**: Can refactor other areas incrementally

## Testing

Run tests for the domain layer:

```bash
npm test -- tile.spec.ts
```

Tests cover:
- Basic property access
- Interaction detection (monster, resource, NPC)
- ASCII representation for all terrain types
- Monster emoji mapping
- Visual marker generation

## Future Improvements

This refactoring opens the door for further improvements:

### 1. Character Domain Object
```typescript
export class Character {
  constructor(private data: CharacterData) {}

  isOnCooldown(): boolean { }
  isHpFull(): boolean { }
  canPerformAction(): boolean { }
}
```

### 2. Interaction Domain Object
```typescript
export class Interaction {
  constructor(private data: InteractionData) {}

  canInteract(character: Character): boolean { }
  getActionButton(): ActionButton { }
}
```

### 3. Combat Domain Object
```typescript
export class Combat {
  calculateDamage(attacker: Character, defender: Monster): number { }
  calculateRewards(monster: Monster, character: Character): Rewards { }
}
```

## Best Practices

When adding new domain objects:

1. **Keep them focused**: One responsibility per domain object
2. **Make them framework-agnostic**: No Angular dependencies
3. **Provide clear APIs**: Intuitive, well-named methods
4. **Write tests first**: TDD approach for domain logic
5. **Document thoroughly**: Clear interfaces and examples

## References

- Domain layer documentation: `src/app/domain/README.md`
- Tile domain object: `src/app/domain/tile.ts`
- Unit tests: `src/app/domain/tile.spec.ts`
- Map component: `src/app/pages/map/map.ts`

## Summary

This refactoring improves code quality by:
- Separating business logic from UI logic
- Making code more testable and reusable
- Improving type safety
- Following SOLID principles
- Creating a foundation for future domain objects

The application now has a clear architecture where domain logic lives in domain objects, and components focus on UI and user interaction.
