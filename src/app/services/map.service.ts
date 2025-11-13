import { Injectable, inject, signal } from '@angular/core'
import { injectQuery, injectQueryClient } from '@tanstack/angular-query-experimental'
import {
  getMapByPositionMapsLayerXYGet,
  getMonsterMonstersCodeGet,
  getResourceResourcesCodeGet,
  getNpcNpcsDetailsCodeGet,
} from '../../sdk/api'
import type { TilePosition, Map as MapTile, Monster, Resource, Npc } from '../domain/types'
import { unwrapApiItem } from '../shared/utils'

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
    queryKey: [
      'tile-details',
      this.currentTilePosition()?.x,
      this.currentTilePosition()?.y,
    ],
    queryFn: async (): Promise<MapTile | null> => {
      const pos = this.currentTilePosition()
      if (!pos) return null

      const response = await getMapByPositionMapsLayerXYGet({
        path: {
          layer: 'overworld',
          x: pos.x,
          y: pos.y,
        },
      })

      return unwrapApiItem<MapTile>(response, null)
    },
    enabled: !!this.currentTilePosition(),
    staleTime: 1000 * 60 * 30,
  }))

  monsterDetailsQuery = injectQuery(() => ({
    queryKey: ['monster-details', this.currentMonsterCode()],
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
    staleTime: 1000 * 60 * 60,
  }))

  resourceDetailsQuery = injectQuery(() => ({
    queryKey: ['resource-details', this.currentResourceCode()],
    queryFn: async (): Promise<Resource | null> => {
      const resourceCode = this.currentResourceCode()
      if (!resourceCode) return null

      const response = await getResourceResourcesCodeGet({
        path: { code: resourceCode },
      })

      return unwrapApiItem<Resource>(response, null)
    },
    enabled: !!this.currentResourceCode(),
    staleTime: 1000 * 60 * 60,
  }))

  npcDetailsQuery = injectQuery(() => ({
    queryKey: ['npc-details', this.currentNpcCode()],
    queryFn: async (): Promise<Npc | null> => {
      const npcCode = this.currentNpcCode()
      if (!npcCode) return null

      const response = await getNpcNpcsDetailsCodeGet({
        path: { code: npcCode },
      })

      return unwrapApiItem<Npc>(response, null)
    },
    enabled: !!this.currentNpcCode(),
    staleTime: 1000 * 60 * 60,
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
}
