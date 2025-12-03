import { Injectable } from '@angular/core'
import { StateCreator, ZustandBaseService } from 'ngx-zustand'
import { createStore } from 'zustand/vanilla'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { EffectSchema } from '../../../sdk/api'

interface EffectsState {
  effects: Record<string, EffectSchema>
  lastUpdated: Date | null
  loading: boolean
}

@Injectable({
  providedIn: 'root',
})
export class EffectsStore extends ZustandBaseService<EffectsState> {
  initStore(): StateCreator<EffectsState> {
    return () => ({
      effects: {},
      lastUpdated: null,
      loading: true,
    })
  }

  override createStore() {
    return createStore(
      persist<EffectsState>(this.initStore(), {
        name: 'effectsStore',
        storage: createJSONStorage(() => localStorage),
      }),
    )
  }
}
