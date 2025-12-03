import { Injectable } from '@angular/core'
import { StateCreator, ZustandBaseService } from 'ngx-zustand'
import { createStore } from 'zustand/vanilla'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { BadgeSchema } from '../../../sdk/api'

interface BadgesState {
  badges: Record<string, BadgeSchema>
  lastUpdated: Date | null
  loading: boolean
}

@Injectable({
  providedIn: 'root',
})
export class BadgesStore extends ZustandBaseService<BadgesState> {
  initStore(): StateCreator<BadgesState> {
    return () => ({
      badges: {},
      lastUpdated: null,
      loading: true,
    })
  }

  override createStore() {
    return createStore(
      persist<BadgesState>(this.initStore(), {
        name: 'badgesStore',
        storage: createJSONStorage(() => localStorage),
      }),
    )
  }
}
