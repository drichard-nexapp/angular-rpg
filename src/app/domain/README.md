# Domain Layer

This directory contains domain models and business logic for the application. Domain objects encapsulate data and behavior related to core business concepts.

## Architecture

The domain layer follows Domain-Driven Design (DDD) principles:
- **Encapsulation**: Business logic is encapsulated within domain objects
- **Self-contained**: Each domain object manages its own data and behavior
- **Framework-agnostic**: Domain objects don't depend on Angular or UI frameworks
- **Reusable**: Can be used across different parts of the application

## Tile Domain

### Purpose

The `Tile` class encapsulates all logic related to map tiles, including:
- Tile properties (position, skin, interactions)
- Visual representation (ASCII art, emojis)
- Interaction type detection (monster, resource, NPC)
- Content-specific behavior (monster emoji mapping)

### Usage

```typescript
import { TileFactory } from './domain/tile'

// Create a tile from raw data
const tileData = {
  x: 5,
  y: 10,
  skin: 'forest_tree',
  interactions: {
    content: {
      type: 'monster',
      code: 'blue_slime'
    }
  }
}

const tile = TileFactory.createTile(tileData)

// Access tile properties
console.log(tile.x, tile.y) // 5, 10
console.log(tile.skin) // 'forest_tree'

// Check interaction types
if (tile.isMonster()) {
  console.log('Monster tile!')
}

// Render the tile (recommended approach)
const rendered = tile.render()
console.log(rendered)
// { type: 'emoji', value: '🔵', cssClass: 'monster-emoji' }

// Get visual marker (legacy approach)
const marker = tile.getVisualMarker()
// { type: 'monster', value: '🔵' }

// Get ASCII representation
console.log(tile.getAsciiRepresentation()) // ' T '
```

### Methods

#### Properties
- `x: number` - X coordinate of the tile
- `y: number` - Y coordinate of the tile
- `skin: string` - Terrain type/skin identifier
- `interactions: TileInteractions | undefined` - Interaction data
- `rawData: TileData` - Original raw data

#### Interaction Detection
- `hasInteraction(): boolean` - Check if tile has any interaction
- `getInteractionType(): string | null` - Get interaction type (monster, resource, npc)
- `getInteractionCode(): string | null` - Get interaction code
- `isMonster(): boolean` - Check if tile has a monster
- `isResource(): boolean` - Check if tile has a resource
- `isNpc(): boolean` - Check if tile has an NPC

#### Visual Representation
- `render(): TileRenderResult` - **Recommended** - Get rendering information (type, value, cssClass)
- `getAsciiRepresentation(): string` - Get ASCII art for terrain type
- `getVisualMarker(): { type, value }` - Get complete visual marker info (legacy)

### ASCII Terrain Mapping

The `getAsciiRepresentation()` method maps terrain skins to ASCII characters:

| Terrain Type | Skin Keywords | ASCII |
|-------------|---------------|-------|
| Tree | forest + tree | ` T ` |
| Road | forest + road | `===` |
| Village | forest + village | ` H ` |
| Bank | forest + bank | ` $ ` |
| Forest | forest (other) | ` * ` |
| Water | water, lake, coastline, sea | `~~~` |
| Desert | desert | `...` |
| Mountain | mountain | `/^\` |
| Default | any other | `:::` |

### Monster Emoji Mapping

The `getMonsterEmoji()` method maps monster codes to emojis:

| Monster Type | Code Keywords | Emoji |
|-------------|---------------|-------|
| Blue Slime | slime + blue | 🔵 |
| Green Slime | slime + green | 🟢 |
| Red Slime | slime + red | 🔴 |
| Yellow Slime | slime + yellow | 🟡 |
| King Slime | slime + king | 👑 |
| Slime (other) | slime | 🟣 |
| Chicken | chicken | 🐔 |
| Cow | cow | 🐄 |
| Wolf | wolf | 🐺 |
| Skeleton | skeleton | 💀 |
| Dragon | dragon | 🐉 |
| Default Monster | any other | 👾 |

*See full mapping in tile.ts*

### Interaction Type Markers

The `getVisualMarker()` method returns appropriate markers:

| Interaction Type | Marker |
|-----------------|--------|
| Monster | Monster-specific emoji |
| NPC | Yellow `!` |
| Resource | 💎 |
| None | ASCII terrain |

## Benefits of Domain Objects

### Before (Component-based logic)
```typescript
// Logic scattered in component
getTileAscii(tile: any): string {
  if (!tile) return '   '
  const skin = tile.skin?.toLowerCase() || ''
  if (skin.includes('forest')) {
    if (skin.includes('tree')) return ' T '
    // ... more conditions
  }
  // ... more logic
}

hasNpcInteraction(tile: any): boolean {
  if (!tile || !tile.interactions) return false
  return tile.interactions.content.type === 'npc'
}
```

### After (Domain-based logic)
```typescript
// Logic encapsulated in domain object
const tile = new Tile(tileData)
console.log(tile.getAsciiRepresentation())
console.log(tile.isNpc())
```

### Advantages

1. **Single Responsibility**: Tile class handles tile-specific logic
2. **Testability**: Easy to unit test without Angular dependencies
3. **Maintainability**: All tile logic in one place
4. **Type Safety**: Proper interfaces and type checking
5. **Reusability**: Can be used in services, components, or utilities
6. **Clarity**: Clear API for tile operations

## Future Extensions

Potential additions to the domain layer:

- `Character` - Character management and stats
- `Interaction` - Interaction behavior and requirements
- `Combat` - Combat calculation and results
- `Inventory` - Item and inventory management
- `Quest` - Quest logic and progression

Each domain object should:
- Have a clear, focused responsibility
- Encapsulate related data and behavior
- Provide a clean, intuitive API
- Be framework-agnostic
- Be easily testable
