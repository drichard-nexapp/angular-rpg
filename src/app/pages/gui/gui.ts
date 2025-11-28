import { Component, computed, signal, inject } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { injectQuery } from '@tanstack/angular-query-experimental'
import { getAllActiveEventsEventsActiveGet } from '../../../sdk/api'
import { Map } from '../map/map'
import type { Character, CooldownTracking, Map as MapTile, ActiveEvent } from '../../domain/types'
import { unwrapApiResponse } from '../../shared/utils'
import { QUERY_KEYS, APP_CONFIG } from '../../shared/constants'
import { CharacterUtils } from '../../shared/utils'
import { ErrorDisplay } from '../../components/shared/error-display/error-display'
import { Equipment } from './equipment/equipment'
import { CharacterService } from '../../services/character.service'
import { MapService } from '../../services/map.service'
import { CooldownService } from '../../services/cooldown.service'
import { LoggerService } from '../../services/logger.service'
import { Inventory } from './inventory/inventory'
import { Skill } from './skill/skill'
import { Tile } from './tile/tile'
import { Event } from './event/event'
import { ActionService } from '../../services/action.service'

@Component({
  selector: 'app-gui',
  imports: [Map, ErrorDisplay, FormsModule, Equipment, Inventory, Skill, Tile, Event],
  templateUrl: './gui.html',
  styleUrl: './gui.scss',
})
export class GUI {
  private characterService = inject(CharacterService)
  private cooldownService = inject(CooldownService)
  private logger = inject(LoggerService)

  protected mapService = inject(MapService)

  public actionService = inject(ActionService)

  selectedCharacter = this.characterService.getSelectedCharacterSignal()
  characters = this.characterService.getCharactersSignal()
  selectedTile = signal<MapTile | null>(null)
  currentTileDetails = computed(() => this.mapService.getTileData())
  activeEvents = computed(() => this.activeEventsQuery.data() ?? [])
  showInventory = signal(false)
  showSkills = signal(false)
  showEquipment = signal(false)

  activeEventsQuery = injectQuery(() => ({
    queryKey: QUERY_KEYS.events.active(),
    queryFn: async (): Promise<ActiveEvent[]> => {
      const response = await getAllActiveEventsEventsActiveGet()
      return unwrapApiResponse<ActiveEvent[]>(response, [])
    },
    staleTime: APP_CONFIG.CACHE.STALE_TIME_1_MIN,
    refetchInterval: APP_CONFIG.CACHE.REFETCH_INTERVAL_1_MIN,
  }))

  constructor() {
    void this.characterService.loadCharactersList()
  }

  selectCharacter(character: Character): void {
    if (this.selectedCharacter() === character) {
      this.characterService.selectCharacter(null)
      this.mapService.clearAll()
    } else {
      this.characterService.selectCharacter(character)

      const position = CharacterUtils.getPosition(character)
      if (position) {
        this.mapService.setTilePosition(position)
      } else {
        this.logger.error('Character has invalid coordinates', 'GUI', {
          character,
        })
      }

      this.mapService.setResourceCode(null)
      this.mapService.setNpcCode(null)
    }
  }

  isSelected(character: Character): boolean {
    return this.selectedCharacter() === character
  }

  onTileClick(tile: MapTile): void {
    this.selectedTile.set(tile)
    this.mapService.setTilePosition({ x: tile.x, y: tile.y })
    this.mapService.setResourceCode(null)
    this.mapService.setNpcCode(null)
  }

  closeTileDetails() {
    this.mapService.clearAll()
  }

  getCharacterCooldown(characterName: string): CooldownTracking | null {
    return this.cooldownService.getCooldown(characterName)
  }

  isCharacterOnCooldown(character: Character): boolean {
    return this.cooldownService.isOnCooldown(character.name)
  }

  isCharacterHpFull(character: Character): boolean {
    return character.hp >= character.max_hp
  }

  toggleInventory(): void {
    this.showInventory.set(!this.showInventory())
    if (this.showInventory()) {
      this.showSkills.set(false)
      this.showEquipment.set(false)
    }
  }

  toggleSkills(): void {
    this.showSkills.set(!this.showSkills())
    if (this.showSkills()) {
      this.showInventory.set(false)
      this.showEquipment.set(false)
    }
  }

  toggleEquipment(): void {
    this.showEquipment.set(!this.showEquipment())
    if (this.showEquipment()) {
      this.showInventory.set(false)
      this.showSkills.set(false)
    }
  }
}
