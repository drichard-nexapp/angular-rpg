import { Component, OnDestroy, OnInit, signal } from '@angular/core'
import {
  getLayerMapsMapsLayerGet,
  getMyCharactersMyCharactersGet,
  actionMoveMyNameActionMovePost,
  actionRestMyNameActionRestPost,
  getMapByPositionMapsLayerXYGet,
  actionFightMyNameActionFightPost,
  actionGatheringMyNameActionGatheringPost,
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
  currentTileDetails = signal<any | null>(null)
  fightResult = signal<any | null>(null)
  loading = signal(true)
  error = signal<string | null>(null)
  skinColors: Record<string, string> = {}
  private cooldownIntervals: Record<string, any> = {}
  private fightResultTimeout: any = null

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

  getTileAscii(tile: any): string {
    if (!tile) return '   '

    const skin = tile.skin?.toLowerCase() || ''

    // Forest tiles
    if (skin.includes('forest')) {
      if (skin.includes('tree')) return ' T '
      if (skin.includes('road')) return '==='
      if (skin.includes('village')) return ' H '
      if (skin.includes('bank')) return ' $ '
      return ' * '
    }

    // Water tiles
    if (
      skin.includes('water') ||
      skin.includes('lake') ||
      skin.includes('coastline') ||
      skin.includes('sea')
    ) {
      return '~~~'
    }

    // Desert tiles
    if (skin.includes('desert')) {
      return '...'
    }

    // Mountain tiles
    if (skin.includes('mountain')) {
      return '/^\\'
    }

    return ':::'
  }

  getMonsterEmoji(tile: any): string | null {
    if (!tile || !tile.interactions.content) return null

    const content = tile.interactions.content
    if (content.type !== 'monster') return null

    const code = content.code?.toLowerCase() || ''

    // Map monster codes to emojis
    if (code.includes('slime')) {
      if (code.includes('blue')) return '🔵'
      if (code.includes('green')) return '🟢'
      if (code.includes('red')) return '🔴'
      if (code.includes('yellow')) return '🟡'
      if (code.includes('king')) return '👑'
      return '🟣'
    }
    if (code.includes('chicken')) return '🐔'
    if (code.includes('cow')) return '🐄'
    if (code.includes('pig')) return '🐷'
    if (code.includes('sheep')) return '🐑'
    if (code.includes('wolf')) return '🐺'
    if (code.includes('spider')) return '🕷️'
    if (code.includes('skeleton')) return '💀'
    if (code.includes('goblin')) return '👺'
    if (code.includes('orc')) return '🧟'
    if (code.includes('ogre')) return '👹'
    if (code.includes('cyclops')) return '👁️'
    if (code.includes('dragon')) return '🐉'
    if (code.includes('serpent')) return '🐍'
    if (code.includes('bat')) return '🦇'
    if (code.includes('rat')) return '🐀'
    if (code.includes('bear')) return '🐻'
    if (code.includes('owlbear')) return '🦉'
    if (code.includes('imp')) return '😈'
    if (code.includes('demon')) return '👿'
    if (code.includes('hellhound')) return '🔥'
    if (code.includes('cultist')) return '🧙'
    if (code.includes('highwayman')) return '🗡️'

    return '👾'
  }

  hasNpcInteraction(tile: any): boolean {
    if (!tile || !tile.interactions || !tile.interactions.content) return false
    return tile.interactions.content.type === 'npc'
  }

  hasResourceInteraction(tile: any): boolean {
    if (!tile || !tile.interactions || !tile.interactions.content) return false
    return tile.interactions.content.type === 'resource'
  }

  selectCharacter(character: any) {
    if (this.selectedCharacter() === character) {
      this.selectedCharacter.set(null)
      this.currentTileDetails.set(null)
    } else {
      this.selectedCharacter.set(character)
      this.loadCurrentTileDetails(character)
    }
  }

  private async loadCurrentTileDetails(character: any) {
    if (!character) {
      this.currentTileDetails.set(null)
      return
    }

    try {
      const response = await getMapByPositionMapsLayerXYGet({
        // @ts-ignore
        path: {
          layer: 'overworld',
          x: character.x,
          y: character.y,
        },
      })

      if (response && 'data' in response) {
        this.currentTileDetails.set((response.data as any)?.data || null)
      }
    } catch (err) {
      console.error('Error loading tile details:', err)
      this.currentTileDetails.set(null)
    }
  }

  isSelected(character: any): boolean {
    return this.selectedCharacter() === character
  }

  async onTileClick(tile: any) {
    if (!tile) return

    const selected = this.selectedCharacter()

    // If no character selected, just load tile details
    if (!selected) {
      this.loadTileDetailsAtPosition(tile.x, tile.y)
      return
    }

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
          this.selectedCharacter.set(character)
          this.loadCurrentTileDetails(character)
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

  private async loadTileDetailsAtPosition(x: number, y: number) {
    try {
      const response = await getMapByPositionMapsLayerXYGet({
        // @ts-ignore
        path: {
          layer: 'overworld',
          x: x,
          y: y,
        },
      })

      if (response && 'data' in response) {
        this.currentTileDetails.set((response.data as any)?.data || null)
      }
    } catch (err) {
      console.error('Error loading tile details:', err)
      this.currentTileDetails.set(null)
    }
  }

  closeTileDetails() {
    this.currentTileDetails.set(null)
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

  isCharacterHpFull(character: any): boolean {
    if (!character) return false
    return character.hp >= character.max_hp
  }

  async restCharacter() {
    const selected = this.selectedCharacter()
    if (!selected) return

    // Don't allow resting if character is on cooldown
    if (this.isCharacterOnCooldown(selected)) {
      return
    }

    try {
      const response = await actionRestMyNameActionRestPost({
        path: { name: selected.name },
      })

      // Update character and cooldown from response
      if (response && 'data' in response) {
        const data = response.data as any
        const character = data.character
        const cooldown = data.cooldown

        // Update character in the list
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
      console.error('Error resting character:', err)
    }
  }

  async fightMonster() {
    const selected = this.selectedCharacter()
    if (!selected) return

    // Don't allow fighting if character is on cooldown
    if (this.isCharacterOnCooldown(selected)) {
      return
    }

    try {
      const response = await actionFightMyNameActionFightPost({
        path: { name: selected.name },
      })

      // Update character and cooldown from response
      if (response && 'data' in response) {
        const data = response.data as any
        const character = data.character
        const cooldown = data.cooldown
        const fight = data.fight

        // Update character in the list
        if (character) {
          const chars = this.characters().map((c) =>
            c.name === selected.name ? { ...character } : c,
          )
          this.characters.set(chars)
          this.selectedCharacter.set(character)
        }

        // Update cooldown
        if (cooldown) {
          this.updateCharacterCooldown(selected.name, cooldown)
        }

        // Show fight result if it was a win
        if (fight && fight.result === 'win') {
          this.showFightResult({
            result: fight.result,
            xp: fight.xp,
            gold: fight.gold,
            drops: fight.drops || [],
            character: character,
          })
        }

        // Reload tile details to see if monster is defeated
        this.loadCurrentTileDetails(character)
      }
    } catch (err) {
      console.error('Error fighting monster:', err)
    }
  }

  showFightResult(result: any) {
    // Clear existing timeout if any
    if (this.fightResultTimeout) {
      clearTimeout(this.fightResultTimeout)
    }

    this.fightResult.set(result)

    // Auto-hide after 8 seconds
    this.fightResultTimeout = setTimeout(() => {
      this.fightResult.set(null)
    }, 8000)
  }

  closeFightResult() {
    if (this.fightResultTimeout) {
      clearTimeout(this.fightResultTimeout)
    }
    this.fightResult.set(null)
  }

  async gatherResource() {
    const selected = this.selectedCharacter()
    if (!selected) return

    // Don't allow gathering if character is on cooldown
    if (this.isCharacterOnCooldown(selected)) {
      return
    }

    try {
      const response = await actionGatheringMyNameActionGatheringPost({
        path: { name: selected.name },
      })

      // Update character and cooldown from response
      if (response && 'data' in response) {
        const data = response.data as any
        const character = data.character
        const cooldown = data.cooldown

        // Update character in the list
        if (character) {
          const chars = this.characters().map((c) =>
            c.name === selected.name ? { ...character } : c,
          )
          this.characters.set(chars)
          this.selectedCharacter.set(character)
        }

        // Update cooldown
        if (cooldown) {
          this.updateCharacterCooldown(selected.name, cooldown)
        }

        // Reload tile details to see if resource is depleted
        this.loadCurrentTileDetails(character)
      }
    } catch (err) {
      console.error('Error gathering resource:', err)
    }
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

    // Clean up fight result timeout
    if (this.fightResultTimeout) {
      clearTimeout(this.fightResultTimeout)
    }
  }
}
