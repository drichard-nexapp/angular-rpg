import { Injectable } from '@angular/core'
import { StateCreator, ZustandBaseService } from 'ngx-zustand'
import { MapSchema } from '../../../sdk/api'
import { createStore } from 'zustand/vanilla'
import { persist, createJSONStorage } from 'zustand/middleware'

interface TilesState {
  tiles: Record<string, MapSchema>
  lastUpdated: Date | null
  loading: boolean
}

@Injectable({
  providedIn: 'root',
})
export class TilesStore extends ZustandBaseService<TilesState> {
  initStore(): StateCreator<TilesState> {
    return () => ({
      tiles: {},
      lastUpdated: null,
      loading: true,
    })
  }

  override createStore() {
    return createStore(
      persist<TilesState>(this.initStore(), {
        name: 'tilesStore',
        storage: createJSONStorage(() => localStorage),
      }),
    )
  }
}
