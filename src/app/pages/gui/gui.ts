import { Component, computed, signal, inject } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { injectQuery } from '@tanstack/angular-query-experimental'
import { getAllActiveEventsEventsActiveGet } from '../../../sdk/api'
import { Map } from '../map/map'
import type { Map as MapTile, ActiveEvent } from '../../domain/types'
import { unwrapApiResponse } from '../../shared/utils'
import { QUERY_KEYS, APP_CONFIG } from '../../shared/constants'
import { ErrorDisplay } from '../../components/shared/error-display/error-display'
import { CharacterService } from '../../services/character.service'
import { MapService } from '../../services/map.service'
import { Tile } from './tile/tile'
import { Event } from './event/event'
import { Character as CharacterComponent } from './character/character'

@Component({
  selector: 'app-gui',
  imports: [Map, ErrorDisplay, FormsModule, Tile, Event, CharacterComponent],
  templateUrl: './gui.html',
  styleUrl: './gui.scss',
})
export class GUI {
  private characterService = inject(CharacterService)
  protected mapService = inject(MapService)

  selectedCharacter = this.characterService.getSelectedCharacterSignal()
  characters = this.characterService.getCharactersSignal()
  selectedTile = signal<MapTile | null>(null)
  currentLayer = signal<'overworld' | 'underground' | 'interior'>('overworld')
  currentTileDetails = computed(() => this.mapService.getTileData())
  activeEvents = computed(() => this.activeEventsQuery.data() ?? [])

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

  onTileClick(tile: MapTile): void {
    this.selectedTile.set(tile)
    this.mapService.setTilePosition({ x: tile.x, y: tile.y })
    this.mapService.setResourceCode(null)
    this.mapService.setNpcCode(null)
  }

  onLayerChange(layer: 'overworld' | 'underground' | 'interior'): void {
    this.currentLayer.set(layer)
    this.mapService.setCurrentLayer(layer)
  }

  onCharacterClick(characterLayer: string): void {
    if (characterLayer === 'overworld' || characterLayer === 'underground' || characterLayer === 'interior') {
      this.currentLayer.set(characterLayer)
      this.mapService.setCurrentLayer(characterLayer)
    }
  }

  closeTileDetails() {
    this.mapService.clearAll()
  }
}
