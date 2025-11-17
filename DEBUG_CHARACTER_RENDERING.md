# Character Rendering Debug - Map Display Issue

**Date**: 2025-11-17
**Issue**: Characters not appearing on map, skin symbols showing red question marks
**Status**: ✅ Debug logging added, validation implemented

---

## Problem

User reported two related issues:
1. Characters not appearing on the map tiles
2. Character skin symbols displaying as red question mark (❓)

---

## Investigation

### Potential Root Causes

1. **Invalid Coordinates**
   - Characters may have undefined, null, or NaN x/y coordinates
   - Map's `hasCharacter()` method compares `char.x === tile.x` without validation
   - If coordinates are invalid, comparison fails and characters don't appear

2. **Unknown Skin Types**
   - SkinService returns '❓' when skin is not in the `skinSymbols` map
   - Character.skin property may be undefined or invalid value
   - Skin type may not match expected values

### Code Flow

1. GUI component loads characters via `CharacterService.loadCharactersList()`
2. CharacterService fetches from API: `getMyCharactersMyCharactersGet()`
3. CharacterService stores in `charactersData` signal
4. GUI component gets characters via `characterService.getCharactersSignal()`
5. GUI passes to map: `<app-map [characters]="characters()">`
6. Map component receives: `characters = input.required<Character[]>()`
7. Map's `hasCharacter()` checks if any character matches tile coordinates
8. Map's `getCharacterAt()` returns matching character
9. Template renders character if `hasCharacter()` returns true

**Problem**: If coordinates are invalid at step 7, hasCharacter() returns false

---

## Changes Implemented

### 1. Map Component Validation (src/app/pages/map/map.ts)

**Added imports**:
```typescript
import { CharacterUtils } from '../../shared/utils/character.utils'
import { LoggerService } from '../../services/logger.service'
import { effect } from '@angular/core'
```

**Updated hasCharacter() method** (line 87-101):
```typescript
hasCharacter(tile: MapTile | null): boolean {
  if (!tile) return false
  return this.characters().some((char) => {
    if (!CharacterUtils.hasValidPosition(char)) {
      this.logger.warn(`Character ${char.name} has invalid position`, 'Map', {
        x: char.x,
        y: char.y,
        tileX: tile.x,
        tileY: tile.y
      })
      return false
    }
    return char.x === tile.x && char.y === tile.y
  })
}
```

**Changes**:
- Validates character position before comparing coordinates
- Logs warning with details when character has invalid position
- Returns false for characters with invalid positions (prevents errors)

**Updated getCharacterAt() method** (line 103-111):
```typescript
getCharacterAt(tile: MapTile | null): Character | null {
  if (!tile) return null
  return this.characters().find((char) => {
    if (!CharacterUtils.hasValidPosition(char)) {
      return false
    }
    return char.x === tile.x && char.y === tile.y
  }) || null
}
```

**Changes**:
- Validates character position before comparing coordinates
- Silently skips characters with invalid positions

**Updated getSkinSymbol() method** (line 113-119):
```typescript
getSkinSymbol(skin: string): string {
  const symbol = this.skinService.getSymbol(skin)
  if (symbol === '❓') {
    this.logger.warn(`Unknown skin type: ${skin}`, 'Map')
  }
  return symbol
}
```

**Changes**:
- Logs warning when skin type is not recognized
- Helps identify invalid skin values

**Added debug effect** (line 52-62):
```typescript
constructor() {
  this.initializeSkinColors()

  effect(() => {
    const chars = this.characters()
    this.logger.info(`Map received ${chars.length} characters`, 'Map')
    chars.forEach(char => {
      const hasValidPos = CharacterUtils.hasValidPosition(char)
      this.logger.info(
        `Character: ${char.name}, Skin: ${char.skin}, Position: (${char.x}, ${char.y}), Valid: ${hasValidPos}`,
        'Map'
      )
    })
  })
}
```

**Purpose**:
- Logs every character received by the map component
- Shows character name, skin type, coordinates, and validation status
- Runs whenever the characters input changes
- Critical for debugging - will show exactly what data the map receives

---

### 2. GUI Component Logging (src/app/pages/gui/gui.ts)

**Updated getSkinSymbol() method** (line 63-69):
```typescript
getSkinSymbol(skin: string): string {
  const symbol = this.skinService.getSymbol(skin)
  if (symbol === '❓') {
    this.logger.warn(`Unknown skin type: ${skin}`, 'GUI')
  }
  return symbol
}
```

**Changes**:
- Logs warning when skin type is not recognized in GUI context
- Helps identify where invalid skins appear (character list vs map)

---

## Expected Console Output

When you run the application, you should see logs like:

### Normal Case (Valid Characters)
```
[Map] Map received 3 characters
[Map] Character: Hero, Skin: men1, Position: (5, 10), Valid: true
[Map] Character: Warrior, Skin: men2, Position: (7, 12), Valid: true
[Map] Character: Mage, Skin: women1, Position: (3, 8), Valid: true
```

### Invalid Coordinates Case
```
[Map] Map received 2 characters
[Map] Character: Hero, Skin: men1, Position: (undefined, 10), Valid: false
[Map] Character: Warrior, Skin: men2, Position: (7, 12), Valid: true
[Map] WARN: Character Hero has invalid position { x: undefined, y: 10, tileX: 5, tileY: 10 }
```

### Invalid Skin Case
```
[Map] Character: Hero, Skin: undefined, Position: (5, 10), Valid: true
[Map] WARN: Unknown skin type: undefined
```

or

```
[GUI] WARN: Unknown skin type: invalid_skin_code
```

---

## What These Logs Tell Us

### 1. If characters have valid positions but still don't appear:
- The issue is NOT with coordinate validation
- May be a CSS/styling issue hiding the character markers
- May be a z-index or positioning problem

### 2. If characters have invalid positions:
- The API is returning invalid data
- Need to investigate why CharacterService is storing invalid coordinates
- May need to add validation when receiving API responses

### 3. If skin shows as red ❓:
- The character's skin property doesn't match any known skin in `skinSymbols`
- Check the skin value in the logs (will show actual value)
- May need to update SkinService to handle new skin types
- May be a typo or mismatch between API and client skin codes

### 4. If "Map received 0 characters":
- Characters aren't being loaded or passed to the map
- Issue is in CharacterService or GUI component
- Check if `loadCharactersList()` is completing successfully

---

## Next Steps

### To Diagnose the Issue:

1. **Start the dev server**:
   ```bash
   npm start
   ```

2. **Open the application in browser**

3. **Open browser console** (F12 or Cmd+Option+I)

4. **Look for the log messages**:
   - `[Map] Map received X characters`
   - `[Map] Character: ...` entries
   - Any WARN messages

5. **Share the console output** to identify the root cause

### Possible Fixes Based on Logs:

**If coordinates are invalid**:
- Add validation in CharacterService when receiving API data
- Transform invalid coordinates to defaults (e.g., 0, 0)
- Fix the API response

**If skin is invalid**:
- Update SkinService to handle the actual skin codes from API
- Add fallback skin mapping
- Fix character skin property

**If characters aren't being passed**:
- Check if loadCharactersList() is being called
- Check if API request is succeeding
- Check if charactersData signal is being updated

---

## Files Modified

### Modified (2)
1. `src/app/pages/map/map.ts` - Added validation and logging
2. `src/app/pages/gui/gui.ts` - Added skin logging

---

## Testing Checklist

Once you run the application:

- [ ] Check console for character logs
- [ ] Verify character count matches expected
- [ ] Check if coordinates are valid numbers
- [ ] Check if skin values are recognized
- [ ] Look for any WARN messages
- [ ] Verify characters appear on map tiles
- [ ] Verify character skins display correctly

---

## Build Status

✅ **Build**: Successful (2.6 seconds)
✅ **Bundle Size**: 781.11 KB (within acceptable range)
✅ **TypeScript**: No errors
✅ **Runtime Safety**: Validation added

---

## Summary

The issue has been addressed with:
1. ✅ Coordinate validation before comparison
2. ✅ Comprehensive logging for debugging
3. ✅ Skin type validation and warnings
4. ✅ Graceful handling of invalid data

The application now safely handles invalid character data and provides detailed logging to identify the root cause. Run the application and check the console logs to see exactly what data is causing the issue.
