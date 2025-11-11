# Tile Render Method

## Overview

Tiles now expose a `render()` method that abstracts the visual content of the tile. This follows the **Command Pattern** and **Encapsulation** principles - tiles know how to render themselves, and components don't need to know the rendering details.

## Motivation

### Before: Component Knows Rendering Logic

The component had to check tile types and call different methods:

```typescript
// In template - complex conditional logic
@if (hasCharacter(tile)) {
  <div class="character-marker-ascii">@</div>
} @else if (getMonsterEmoji(tile)) {
  <div class="monster-emoji">{{ getMonsterEmoji(tile) }}</div>
} @else if (hasNpcInteraction(tile)) {
  <div class="npc-marker">!</div>
} @else if (hasResourceInteraction(tile)) {
  <div class="resource-marker">💎</div>
} @else {
  <div class="tile-ascii">{{ getTileAscii(tile) }}</div>
}

// In component - multiple methods
getTileAscii(tile: any): string { }
getMonsterEmoji(tile: any): string | null { }
hasNpcInteraction(tile: any): boolean { }
hasResourceInteraction(tile: any): boolean { }
```

**Problems**:
- ❌ Component knows too much about tile rendering
- ❌ Multiple methods for different tile types
- ❌ Complex conditional logic in template
- ❌ Hard to add new tile types

### After: Tile Knows Its Own Rendering

The tile encapsulates its rendering logic:

```typescript
// In template - simple delegation
@if (hasCharacter(tile)) {
  <div class="character-marker-ascii">@</div>
} @else {
  @let rendered = getTileRender(tile);
  <div [class]="rendered.cssClass">{{ rendered.value }}</div>
}

// In component - single method
getTileRender(tile: any): { type: string; value: string; cssClass?: string } {
  if (!tile) {
    return { type: 'ascii', value: '   ', cssClass: 'tile-ascii' }
  }
  const tileObj = this.createTile(tile)
  return tileObj?.render() || { type: 'ascii', value: '   ', cssClass: 'tile-ascii' }
}
```

**Benefits**:
- ✅ Component doesn't know rendering details
- ✅ Single method handles all tiles
- ✅ Simple template logic
- ✅ Easy to add new tile types

## TileRenderResult Interface

The `render()` method returns a standardized result:

```typescript
export interface TileRenderResult {
  type: 'ascii' | 'emoji' | 'marker'
  value: string
  cssClass?: string
}
```

**Properties**:
- `type` - The category of content (ascii, emoji, or marker)
- `value` - The actual content to display (e.g., '~~~', '🐺', '!')
- `cssClass` - Optional CSS class for styling

## Implementation in Each Tile Type

### MonsterTile

```typescript
render(): TileRenderResult {
  return {
    type: 'emoji',
    value: this.getMonsterEmoji(),
    cssClass: 'monster-emoji',
  }
}
```

**Returns**:
- Type: `emoji`
- Value: Monster emoji (🐺, 🔵, 💀, etc.)
- CSS Class: `monster-emoji`

### ResourceTile

```typescript
render(): TileRenderResult {
  return {
    type: 'emoji',
    value: '💎',
    cssClass: 'resource-marker',
  }
}
```

**Returns**:
- Type: `emoji`
- Value: `💎`
- CSS Class: `resource-marker`

### NpcTile

```typescript
render(): TileRenderResult {
  return {
    type: 'marker',
    value: '!',
    cssClass: 'npc-marker',
  }
}
```

**Returns**:
- Type: `marker`
- Value: `!`
- CSS Class: `npc-marker`

### TerrainTile

```typescript
render(): TileRenderResult {
  return {
    type: 'ascii',
    value: this.getAsciiRepresentation(),
    cssClass: 'tile-ascii',
  }
}
```

**Returns**:
- Type: `ascii`
- Value: ASCII art (~~~, ..., T, etc.)
- CSS Class: `tile-ascii`

## Usage Examples

### Basic Usage

```typescript
import { TileFactory } from './domain/tile'

const tile = TileFactory.createTile(tileData)
const rendered = tile.render()

console.log(rendered.type)      // 'emoji'
console.log(rendered.value)     // '🐺'
console.log(rendered.cssClass)  // 'monster-emoji'
```

### In Templates

```html
<!-- Angular template -->
@let rendered = getTileRender(tile);
<div [class]="rendered.cssClass">{{ rendered.value }}</div>

<!-- Renders as -->
<div class="monster-emoji">🐺</div>
```

### Type-Specific Rendering

```typescript
const monsterTile = TileFactory.createTile({
  x: 0, y: 0, skin: 'forest',
  interactions: { content: { type: 'monster', code: 'wolf' } }
})
monsterTile.render()
// { type: 'emoji', value: '🐺', cssClass: 'monster-emoji' }

const resourceTile = TileFactory.createTile({
  x: 0, y: 0, skin: 'mountain',
  interactions: { content: { type: 'resource', code: 'iron_ore' } }
})
resourceTile.render()
// { type: 'emoji', value: '💎', cssClass: 'resource-marker' }

const terrainTile = TileFactory.createTile({
  x: 0, y: 0, skin: 'water'
})
terrainTile.render()
// { type: 'ascii', value: '~~~', cssClass: 'tile-ascii' }
```

## Design Patterns

### Command Pattern
Each tile type knows how to execute its rendering command:

```typescript
// Tile encapsulates the rendering command
tile.render() // Executes the tile's rendering logic
```

### Strategy Pattern
Different tiles have different rendering strategies:

```typescript
// MonsterTile strategy
render() { return { type: 'emoji', value: this.getMonsterEmoji() } }

// TerrainTile strategy
render() { return { type: 'ascii', value: this.getAsciiRepresentation() } }
```

### Template Method Pattern
Base class defines the interface, subclasses implement:

```typescript
abstract class TileBase {
  abstract render(): TileRenderResult
}

class MonsterTile extends TileBase {
  render(): TileRenderResult { /* implementation */ }
}
```

## Benefits

### 1. Encapsulation
Rendering logic is encapsulated within each tile type:
- `MonsterTile` knows how to render monsters
- `ResourceTile` knows how to render resources
- Component doesn't need to know the details

### 2. Single Responsibility
Each class has focused rendering responsibility:
- Component: Display rendered content
- Tile: Determine what content to render

### 3. Open/Closed Principle
Easy to add new rendering without modifying existing code:

```typescript
// Add new tile type with custom rendering
class QuestTile extends TileBase {
  render(): TileRenderResult {
    return {
      type: 'marker',
      value: '?',
      cssClass: 'quest-marker',
    }
  }
}
```

### 4. Reduced Coupling
Component is decoupled from tile rendering details:

**Before**: Component knows about monster emojis, NPC markers, ASCII art
**After**: Component just calls `render()` and displays the result

### 5. Easier Testing

```typescript
// Test rendering directly on tile
it('should render monster emoji', () => {
  const tile = new MonsterTile(data)
  const rendered = tile.render()

  expect(rendered.type).toBe('emoji')
  expect(rendered.value).toBe('🐺')
  expect(rendered.cssClass).toBe('monster-emoji')
})
```

## Migration Guide

### Step 1: Remove Old Methods

**Before**:
```typescript
getTileAscii(tile: any): string { }
getMonsterEmoji(tile: any): string | null { }
hasNpcInteraction(tile: any): boolean { }
hasResourceInteraction(tile: any): boolean { }
```

**After**:
```typescript
getTileRender(tile: any): TileRenderResult {
  const tileObj = this.createTile(tile)
  return tileObj?.render() || { type: 'ascii', value: '   ' }
}
```

### Step 2: Update Template

**Before**:
```html
@if (hasCharacter(tile)) {
  <div class="character-marker-ascii">@</div>
} @else if (getMonsterEmoji(tile)) {
  <div class="monster-emoji">{{ getMonsterEmoji(tile) }}</div>
} @else if (hasNpcInteraction(tile)) {
  <div class="npc-marker">!</div>
} @else if (hasResourceInteraction(tile)) {
  <div class="resource-marker">💎</div>
} @else {
  <div class="tile-ascii">{{ getTileAscii(tile) }}</div>
}
```

**After**:
```html
@if (hasCharacter(tile)) {
  <div class="character-marker-ascii">@</div>
} @else {
  @let rendered = getTileRender(tile);
  <div [class]="rendered.cssClass">{{ rendered.value }}</div>
}
```

## Extending the Render Method

### Custom Rendering Logic

Add new render types by extending the interface:

```typescript
// Extend interface
export interface TileRenderResult {
  type: 'ascii' | 'emoji' | 'marker' | 'custom'
  value: string
  cssClass?: string
  metadata?: Record<string, any>  // Additional data
}

// Implement in tile
class CustomTile extends TileBase {
  render(): TileRenderResult {
    return {
      type: 'custom',
      value: 'CUSTOM',
      cssClass: 'custom-marker',
      metadata: {
        color: 'red',
        animated: true
      }
    }
  }
}
```

### Conditional Rendering

Tiles can have complex rendering logic:

```typescript
class DynamicTile extends TileBase {
  render(): TileRenderResult {
    const timeOfDay = this.getTimeOfDay()

    if (timeOfDay === 'night') {
      return {
        type: 'emoji',
        value: '🌙',
        cssClass: 'night-tile'
      }
    }

    return {
      type: 'emoji',
      value: '☀️',
      cssClass: 'day-tile'
    }
  }
}
```

## Testing

All tile types now have render tests:

```bash
npm test -- --include='**/tiles.spec.ts'
```

**27 passing tests** including:
- ✅ MonsterTile renders with emoji
- ✅ ResourceTile renders with gem
- ✅ NpcTile renders with marker
- ✅ TerrainTile renders with ASCII

## Summary

The `render()` method provides:

✅ **Encapsulation** - Tiles know how to render themselves
✅ **Simplicity** - Single method for all rendering
✅ **Flexibility** - Easy to add new rendering logic
✅ **Testability** - Simple to test rendering independently
✅ **Decoupling** - Component doesn't know rendering details
✅ **Consistency** - Standard interface across all tiles

The component now simply calls `tile.render()` and displays the result, without knowing anything about how tiles determine their visual representation.
