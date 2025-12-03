import { Injectable } from '@angular/core'
import { StateCreator, ZustandBaseService } from 'ngx-zustand'
import { createStore } from 'zustand/vanilla'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { GeOrderSchema } from '../../../sdk/api'

interface GrandExchangeState {
  orders: Record<string, GeOrderSchema>
  lastUpdated: Date | null
  loading: boolean
}

@Injectable({
  providedIn: 'root',
})
export class GrandExchangeStore extends ZustandBaseService<GrandExchangeState> {
  initStore(): StateCreator<GrandExchangeState> {
    return () => ({
      orders: {},
      lastUpdated: null,
      loading: true,
    })
  }

  override createStore() {
    return createStore(
      persist<GrandExchangeState>(this.initStore(), {
        name: 'grandExchangeStore',
        storage: createJSONStorage(() => localStorage),
      }),
    )
  }
}
