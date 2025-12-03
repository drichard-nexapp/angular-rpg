import { Injectable } from '@angular/core'
import { StateCreator, ZustandBaseService } from 'ngx-zustand'
import { createStore } from 'zustand/vanilla'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { ItemSchema } from '../../../sdk/api'

interface ItemsState {
  items: Record<string, ItemSchema>
  lastUpdated: Date | null
  loading: boolean
}

@Injectable({
  providedIn: 'root',
})
export class ItemsStore extends ZustandBaseService<ItemsState> {
  initStore(): StateCreator<ItemsState> {
    return () => ({
      items: {},
      lastUpdated: null,
      loading: true,
    })
  }

  override createStore() {
    return createStore(
      persist<ItemsState>(this.initStore(), {
        name: 'itemsStore',
        storage: createJSONStorage(() => localStorage),
      }),
    )
  }
}
