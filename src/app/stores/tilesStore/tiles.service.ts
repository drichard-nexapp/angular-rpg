import { inject, Injectable } from '@angular/core'
import type { Map as MapTile } from '../../domain/types'

import { getLayerMapsMapsLayerGet, getMapByPositionMapsLayerXYGet } from '../../../sdk/api'
import { unwrapApiItem, unwrapApiResponse } from '../../shared/utils'
import { TilesStore } from './tiles.store'
import { subDays } from 'date-fns'

@Injectable({
  providedIn: 'root',
})
export class TilesService {
  private tilesStore = inject(TilesStore)

  async initLayer(layer: 'overworld') {
    const tiles = await this.fetchAllLayerTiles(layer)
    return { name: layer, tiles }
  }

  async fetchTileDetails(layer: 'overworld', pos: { x: number; y: number }) {
    const response = await getMapByPositionMapsLayerXYGet({
      path: {
        layer: layer,
        x: pos.x,
        y: pos.y,
      },
    })

    return unwrapApiItem<MapTile>(response, null)
  }

  private async fetchAllLayerTiles(layerName: string): Promise<MapTile[]> {
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

  initialize() {
    this.tilesStore.initStore()
    const state = this.tilesStore.getState()

    if (state.lastUpdated && state.lastUpdated <= subDays(new Date(), 7))
      void this.initLayer('overworld').then(({ tiles }) => {
        const tilesById = tiles.reduce((acc, val) => {
          return { ...acc, [val.map_id]: val }
        }, {})
        this.tilesStore.setState({
          tiles: tilesById,
          loading: false,
          lastUpdated: new Date(),
        })
      })
  }
}
