import { Injectable } from '@angular/core'
import { StateCreator, ZustandBaseService } from 'ngx-zustand'
import { createStore } from 'zustand/vanilla'
import { persist, createJSONStorage } from 'zustand/middleware'
import { Monster } from '../../domain/types'

interface MonstersState {
  monsters: Record<string, Monster | null>
  lastUpdated: Date | null
  loading: boolean
  add: (monster: Monster) => void
}

@Injectable({
  providedIn: 'root',
})
export class MonstersStore extends ZustandBaseService<MonstersState> {
  initStore(): StateCreator<MonstersState> {
    return (set) => ({
      monsters: {},
      lastUpdated: null,
      loading: true,
      add: (monster: Monster) => {
        set((state) => ({
          monsters: { ...state.monsters, [monster.code]: monster },
        }))
      },
    })
  }

  override createStore() {
    return createStore(
      persist<MonstersState>(this.initStore(), {
        name: 'monstersStore',
        storage: createJSONStorage(() => localStorage),
      }),
    )
  }
}
