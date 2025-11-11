# Map Guide

## Overview

The map page provides an interactive visualization of the game world where you can control your characters, explore tiles, and interact with various game elements.

## Map Visualization

The map is displayed as a grid of colored tiles with ASCII art representations:

### Tile Colors
- **Green** - Forest areas
- **Blue** - Water/Sea areas
- **Yellow** - Desert areas
- **Gray** - Mountain areas
- **Purple** - Other/Undefined areas

### Tile Symbols
- **T** - Trees
- **===** - Roads
- **H** - Village/House
- **$** - Bank
- **~~~** - Water
- **...** - Desert terrain
- **/^\** - Mountains
- **@** - Character position
- **!** (yellow) - NPC location
- **💎** - Resource location
- **Various emojis** - Monsters (🔵 slimes, 🐔 chicken, 🐺 wolf, 💀 skeleton, etc.)

## Character Management

### Character Selection
- Characters are displayed at the bottom of the screen in a fixed bar
- Click on a character card to select them
- Selected characters are highlighted in blue
- Each character card shows:
  - Character name
  - Current HP / Max HP
  - Current XP / Max XP
  - Cooldown timer (when applicable)

### Character States
- **Selected** - Blue background, ready for actions
- **On Cooldown** - Dimmed appearance with countdown timer
- **Ready** - Normal appearance, can perform actions

## Actions

### Movement
1. Select a character from the bottom bar
2. Click on any tile on the map
3. The character will move to that tile (if not on cooldown)
4. Movement triggers a cooldown period

### Resting
- Available when a character is selected
- Click the "Rest" button in the character bar
- Restores character HP
- Button is disabled when:
  - Character is on cooldown
  - Character HP is already full

### Fighting Monsters
1. Move your character to a tile with a monster (marked with emoji)
2. The tile details popup will show monster information
3. Click the "Fight" button to engage in combat
4. On victory:
  - A toast notification appears showing rewards
  - Displays XP gained, Gold gained, and item drops
  - Shows updated character stats
  - Toast auto-dismisses after 8 seconds

### Gathering Resources
1. Move your character to a tile with a resource (marked with 💎)
2. The tile details popup will show resource information
3. Click the "Gather" button to collect the resource
4. Gathering triggers a cooldown period
5. Resource may be depleted after gathering

## Tile Information

### Viewing Tile Details
- **With character selected**: Click any tile to move AND view details
- **Without character selected**: Click any tile to just view details
- Tile details popup shows:
  - Tile position (x, y coordinates)
  - Skin/terrain type
  - Interaction type and code (if present)
  - Action buttons (Fight/Gather) when applicable

### Closing Tile Details
- Click the × button in the top-right corner of the tile details popup
- Selecting/deselecting a character also updates or clears the popup

## Interaction Types

### Monster Interactions
- Type: `monster`
- Visual: Monster emoji on tile
- Action: Fight button available
- Result: Combat with potential rewards (XP, gold, drops)

### Resource Interactions
- Type: `resource`
- Visual: 💎 gem emoji on tile
- Action: Gather button available
- Result: Collect resources, triggers cooldown

### NPC Interactions
- Type: `npc`
- Visual: Yellow ! exclamation mark
- Action: Currently display only (no interaction implemented)

## Cooldown System

- Actions (Move, Fight, Gather, Rest) trigger cooldowns
- Cooldown duration varies by action
- Countdown timer displayed on character card
- All actions are disabled during cooldown
- Tiles cannot be clicked for movement during cooldown
- Multiple characters can act independently with separate cooldowns

## Tips

1. **Character Positioning**: Position characters strategically on resource or monster tiles before their cooldown expires
2. **Health Management**: Use the Rest action when HP is low, but plan ahead as it triggers cooldown
3. **Resource Planning**: Move to resource tiles when cooldown is ready to gather efficiently
4. **Exploration**: Click tiles without selecting a character to scout the map safely
5. **Combat Strategy**: Check monster details before engaging to plan your approach

## Visual Indicators

- **Red border + glow**: Tile has a character on it
- **Blue highlight**: Character is selected
- **Hover effect**: Tile can be clicked
- **Dimmed character**: Character is on cooldown
- **Red cooldown badge**: Shows remaining cooldown seconds
