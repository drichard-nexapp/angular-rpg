import { Injectable, signal } from '@angular/core'
import { injectQuery } from '@tanstack/angular-query-experimental'
import { getMapByPositionMapsLayerXYGet, getResourceResourcesCodeGet, getNpcNpcsDetailsCodeGet } from '../../sdk/api'
import type { TilePosition, Map as MapTile, Resource, Npc, Monster } from '../domain/types'
import { unwrapApiItem } from '../shared/utils'
import { QUERY_KEYS, APP_CONFIG } from '../shared/constants'

@Injectable({
  providedIn: 'root',
})
export class MapService {
  private currentTilePosition = signal<TilePosition | null>(null)
  private currentLayer = signal<'overworld' | 'underground' | 'interior'>('overworld')
  public currentMonsterDetails = signal<Monster | null>(null)
  private currentResourceCode = signal<string | null>(null)
  private currentNpcCode = signal<string | null>(null)

  tileDetailsQuery = injectQuery(() => ({
    queryKey: QUERY_KEYS.maps.tileDetails(this.currentTilePosition()?.x ?? 0, this.currentTilePosition()?.y ?? 0),
    queryFn: async (): Promise<MapTile | null> => {
      const pos = this.currentTilePosition()
      if (!pos) return null

      const response = await getMapByPositionMapsLayerXYGet({
        path: {
          layer: this.currentLayer(),
          x: pos.x,
          y: pos.y,
        },
      })

      return unwrapApiItem<MapTile>(response, null)
    },
    enabled: !!this.currentTilePosition(),
    staleTime: APP_CONFIG.CACHE.STALE_TIME_30_MIN,
  }))

  resourceDetailsQuery = injectQuery(() => ({
    queryKey: QUERY_KEYS.resources.detail(this.currentResourceCode() ?? ''),
    queryFn: async (): Promise<Resource | null> => {
      const resourceCode = this.currentResourceCode()
      if (!resourceCode) return null

      const response = await getResourceResourcesCodeGet({
        path: { code: resourceCode },
      })

      return unwrapApiItem<Resource>(response, null)
    },
    enabled: !!this.currentResourceCode(),
    staleTime: APP_CONFIG.CACHE.STALE_TIME_LONG,
  }))

  npcDetailsQuery = injectQuery(() => ({
    queryKey: QUERY_KEYS.npcs.detail(this.currentNpcCode() ?? ''),
    queryFn: async (): Promise<Npc | null> => {
      const npcCode = this.currentNpcCode()
      if (!npcCode) return null

      const response = await getNpcNpcsDetailsCodeGet({
        path: { code: npcCode },
      })

      return unwrapApiItem<Npc>(response, null)
    },
    enabled: !!this.currentNpcCode(),
    staleTime: APP_CONFIG.CACHE.STALE_TIME_LONG,
  }))

  setTilePosition(position: TilePosition | null): void {
    this.currentTilePosition.set(position)
  }

  getTilePosition(): TilePosition | null {
    return this.currentTilePosition()
  }

  setCurrentLayer(layer: 'overworld' | 'underground' | 'interior'): void {
    this.currentLayer.set(layer)
  }

  getCurrentLayer(): 'overworld' | 'underground' | 'interior' {
    return this.currentLayer()
  }

  setResourceCode(code: string | null): void {
    this.currentResourceCode.set(code)
  }

  getResourceCode(): string | null {
    return this.currentResourceCode()
  }

  setNpcCode(code: string | null): void {
    this.currentNpcCode.set(code)
  }

  getNpcCode(): string | null {
    return this.currentNpcCode()
  }

  getTileData(): MapTile | null {
    return this.tileDetailsQuery.data() ?? null
  }

  getResourceData(): Resource | null {
    return this.resourceDetailsQuery.data() ?? null
  }

  getNpcData(): Npc | null {
    return this.npcDetailsQuery.data() ?? null
  }

  clearAll(): void {
    this.currentTilePosition.set(null)
    this.currentMonsterDetails.set(null)
    this.currentResourceCode.set(null)
    this.currentNpcCode.set(null)
  }

  setCurrentMonsterDetails(monsterDetails: null | Monster) {
    this.currentMonsterDetails.set(monsterDetails)
  }
}
