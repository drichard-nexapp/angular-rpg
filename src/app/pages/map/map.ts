import { Component, OnDestroy, OnInit, signal } from '@angular/core'
import {
  getLayerMapsMapsLayerGet,
  getMyCharactersMyCharactersGet,
  actionMoveMyNameActionMovePost,
} from '../../../sdk/api'
import mapSkins from '../../../assets/map-skins.json'

interface MapLayer {
  name: string
  tiles: any[]
  grid: any[][]
}

@Component({
  selector: 'app-map',
  imports: [],
  templateUrl: './map.html',
  styleUrl: './map.scss',
})
export class Map implements OnInit, OnDestroy {
  layers = signal<MapLayer[]>([])
  characters = signal<any[]>([])
  selectedCharacter = signal<any | null>(null)
  characterCooldowns = signal<Record<string, any>>({})
  loading = signal(true)
  error = signal<string | null>(null)
  skinColors: Record<string, string> = {}
  private cooldownIntervals: Record<string, any> = {}

  ngOnInit() {
    this.initializeSkinColors()
    this.loadAllMaps()
    this.loadCharacters()
  }

  private async loadCharacters() {
    try {
      const response = await getMyCharactersMyCharactersGet()
      if (response && 'data' in response) {
        const charactersData = (response.data as any)?.data || []
        this.characters.set(charactersData)

        // Initialize cooldowns for characters that have them
        charactersData.forEach((char: any) => {
          if (char.cooldown && char.cooldown.remaining_seconds > 0) {
            this.updateCharacterCooldown(char.name, char.cooldown)
          }
        })
      }
    } catch (err) {
      console.error('Error loading characters:', err)
    }
  }

  private initializeSkinColors() {
    Object.entries(mapSkins).forEach(([skin, data]) => {
      this.skinColors[skin] = data.color
    })
  }

  private async loadAllMaps() {
    try {
      this.loading.set(true)
      this.error.set(null)

      const tiles = await this.fetchAllLayerPages('overworld')
      const grid = this.createGrid(tiles)
      this.layers.set([{ name: 'overworld', tiles, grid }])
    } catch (err: any) {
      this.error.set(err?.message || 'Failed to load maps')
      console.error('Error loading maps:', err)
    } finally {
      this.loading.set(false)
    }
  }

  private async fetchAllLayerPages(layerName: string): Promise<any[]> {
    const allTiles: any[] = []
    let page = 1
    let hasMore = true

    while (hasMore) {
      const layerResponse = await getLayerMapsMapsLayerGet({
        // @ts-ignore
        path: { layer: layerName },
        query: { page, size: 100 },
      })

      if (layerResponse && 'data' in layerResponse) {
        const tiles = (layerResponse.data as any)?.data || []
        allTiles.push(...tiles)

        if (tiles.length === 0 || tiles.length < 100) {
          hasMore = false
        } else {
          page++
        }
      } else {
        hasMore = false
      }
    }

    return allTiles
  }

  private createGrid(tiles: any[]): any[][] {
    if (tiles.length === 0) return []

    const minX = Math.min(...tiles.map((t) => t.x))
    const maxX = Math.max(...tiles.map((t) => t.x))
    const minY = Math.min(...tiles.map((t) => t.y))
    const maxY = Math.max(...tiles.map((t) => t.y))

    const grid: any[][] = []
    for (let y = minY; y <= maxY; y++) {
      const row: any[] = []
      for (let x = minX; x <= maxX; x++) {
        const tile = tiles.find((t) => t.x === x && t.y === y)
        row.push(tile || null)
      }
      grid.push(row)
    }
    return grid
  }

  getSkinColor(skin: string): string {
    if (!skin) return '#e0e0e0'
    return this.skinColors[skin] || '#e0e0e0'
  }

  selectCharacter(character: any) {
    if (this.selectedCharacter() === character) {
      this.selectedCharacter.set(null)
    } else {
      this.selectedCharacter.set(character)
    }
  }

  isSelected(character: any): boolean {
    return this.selectedCharacter() === character
  }

  async onTileClick(tile: any) {
    const selected = this.selectedCharacter()
    if (!selected || !tile) return

    // Don't allow moving if character is on cooldown
    if (this.isCharacterOnCooldown(selected)) {
      return
    }

    try {
      const response = await actionMoveMyNameActionMovePost({
        path: { name: selected.name },
        body: { x: tile.x, y: tile.y },
      })
      // Update character and cooldown from response
      if (response && 'data' in response) {
        const data = response.data!.data as any
        const character = data.character
        const cooldown = data.cooldown

        // Update character position in the list using destination coordinates
        if (character) {
          const chars = this.characters().map((c) =>
            c.name === selected.name ? { ...character } : c,
          )
          this.characters.set(chars)
        }

        // Update cooldown
        if (cooldown) {
          this.updateCharacterCooldown(selected.name, cooldown)
        }
      }
    } catch (err) {
      console.error('Error moving character:', err)
    }
  }

  updateCharacterCooldown(characterName: string, cooldown: any) {
    const cooldowns = { ...this.characterCooldowns() }
    cooldowns[characterName] = {
      ...cooldown,
      remainingSeconds: cooldown.remaining_seconds || 0,
    }
    this.characterCooldowns.set(cooldowns)

    // Clear existing interval if any
    if (this.cooldownIntervals[characterName]) {
      clearInterval(this.cooldownIntervals[characterName])
    }

    // Only start countdown if there are remaining seconds
    if (cooldowns[characterName].remainingSeconds > 0) {
      // Start countdown
      this.cooldownIntervals[characterName] = setInterval(() => {
        const current = this.characterCooldowns()[characterName]
        if (current && current.remainingSeconds > 0) {
          const updated = { ...this.characterCooldowns() }
          updated[characterName] = {
            ...current,
            remainingSeconds: current.remainingSeconds - 1,
          }
          this.characterCooldowns.set(updated)
        } else {
          // Clear cooldown when done
          const updated = { ...this.characterCooldowns() }
          delete updated[characterName]
          this.characterCooldowns.set(updated)
          clearInterval(this.cooldownIntervals[characterName])
          delete this.cooldownIntervals[characterName]
        }
      }, 1000)
    }
  }

  getCharacterCooldown(characterName: string) {
    return this.characterCooldowns()[characterName] || null
  }

  isCharacterOnCooldown(character: any): boolean {
    return !!this.characterCooldowns()[character.name]
  }

  hasCharacter(tile: any): boolean {
    if (!tile) return false
    return this.characters().some(
      (char) => char.x === tile.x && char.y === tile.y,
    )
  }

  getCharacterOnTile(tile: any): any | null {
    if (!tile) return null
    return (
      this.characters().find(
        (char) => char.x === tile.x && char.y === tile.y,
      ) || null
    )
  }

  ngOnDestroy() {
    // Clean up all intervals
    Object.values(this.cooldownIntervals).forEach((interval) =>
      clearInterval(interval),
    )
  }
}
