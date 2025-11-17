import { Injectable, inject, signal } from '@angular/core'
import { injectQuery, injectQueryClient } from '@tanstack/angular-query-experimental'
import {
  getMapByPositionMapsLayerXYGet,
  getMonsterMonstersCodeGet,
  getResourceResourcesCodeGet,
  getNpcNpcsDetailsCodeGet,
  getLayerMapsMapsLayerGet,
} from '../../sdk/api'
import type { TilePosition, Map as MapTile, Monster, Resource, Npc } from '../domain/types'
import { unwrapApiItem, unwrapApiResponse } from '../shared/utils'
import { QUERY_KEYS } from '../shared/constants/query-keys'
import { APP_CONFIG } from '../shared/constants/app-config'

@Injectable({
  providedIn: 'root',
})
export class MapService {
  private queryClient = injectQueryClient()

  private currentTilePosition = signal<TilePosition | null>(null)
  private currentMonsterCode = signal<string | null>(null)
  private currentResourceCode = signal<string | null>(null)
  private currentNpcCode = signal<string | null>(null)

  tileDetailsQuery = injectQuery(() => ({
    queryKey: QUERY_KEYS.maps.tileDetails(
      this.currentTilePosition()?.x || 0,
      this.currentTilePosition()?.y || 0
    ),
    queryFn: async (): Promise<MapTile | null> => {
      const pos = this.currentTilePosition()
      if (!pos) return null

      const response = await getMapByPositionMapsLayerXYGet({
        path: {
          layer: APP_CONFIG.MAP.DEFAULT_LAYER,
          x: pos.x,
          y: pos.y,
        },
      })

      return unwrapApiItem<MapTile>(response, null)
    },
    enabled: !!this.currentTilePosition(),
    staleTime: APP_CONFIG.CACHE.STALE_TIME_30_MIN,
  }))

  monsterDetailsQuery = injectQuery(() => ({
    queryKey: QUERY_KEYS.monsters.detail(this.currentMonsterCode() || ''),
    queryFn: async (): Promise<Monster | null> => {
      const monsterCode = this.currentMonsterCode()
      if (!monsterCode) return null

      const response = await getMonsterMonstersCodeGet({
        path: { code: monsterCode },
      })

      const monsterData = unwrapApiItem<Monster>(response, null)
      if (monsterData) {
        return {
          ...monsterData,
          drops: monsterData.drops || [],
        }
      }
      return null
    },
    enabled: !!this.currentMonsterCode(),
    staleTime: APP_CONFIG.CACHE.STALE_TIME_LONG,
  }))

  resourceDetailsQuery = injectQuery(() => ({
    queryKey: QUERY_KEYS.resources.detail(this.currentResourceCode() || ''),
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
    queryKey: QUERY_KEYS.npcs.detail(this.currentNpcCode() || ''),
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

  setMonsterCode(code: string | null): void {
    this.currentMonsterCode.set(code)
  }

  getMonsterCode(): string | null {
    return this.currentMonsterCode()
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

  getMonsterData(): Monster | null {
    return this.monsterDetailsQuery.data() ?? null
  }

  getResourceData(): Resource | null {
    return this.resourceDetailsQuery.data() ?? null
  }

  getNpcData(): Npc | null {
    return this.npcDetailsQuery.data() ?? null
  }

  clearAll(): void {
    this.currentTilePosition.set(null)
    this.currentMonsterCode.set(null)
    this.currentResourceCode.set(null)
    this.currentNpcCode.set(null)
  }

  async fetchAllLayerTiles(layerName: string): Promise<MapTile[]> {
    const allTiles: MapTile[] = []
    let page = 1
    let hasMore = true

    while (hasMore) {
      const layerResponse = await getLayerMapsMapsLayerGet({
        path: { layer: layerName as 'overworld' },
        query: { page, size: 100 },
      })

      const tiles = unwrapApiResponse<MapTile[]>(layerResponse, [])
      allTiles.push(...tiles)

      if (tiles.length === 0 || tiles.length < 100) {
        hasMore = false
      } else {
        page++
      }
    }

    return allTiles
  }

  createGrid(tiles: MapTile[]): (MapTile | null)[][] {
    if (tiles.length === 0) return []

    const minX = Math.min(...tiles.map((t) => t.x))
    const maxX = Math.max(...tiles.map((t) => t.x))
    const minY = Math.min(...tiles.map((t) => t.y))
    const maxY = Math.max(...tiles.map((t) => t.y))

    const grid: (MapTile | null)[][] = []
    for (let y = minY; y <= maxY; y++) {
      const row: (MapTile | null)[] = []
      for (let x = minX; x <= maxX; x++) {
        const tile = tiles.find((t) => t.x === x && t.y === y)
        row.push(tile || null)
      }
      grid.push(row)
    }
    return grid
  }
}
