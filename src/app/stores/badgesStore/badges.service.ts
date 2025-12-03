import { inject, Injectable } from '@angular/core'
import { BadgesStore } from './badges.store'
import { getAllBadgesBadgesGet, type BadgeSchema } from '../../../sdk/api'
import { unwrapApiResponse } from '../../shared/utils'
import { subDays } from 'date-fns'
import { toSignal } from '@angular/core/rxjs-interop'

@Injectable({
  providedIn: 'root',
})
export class BadgesService {
  private badgesStore = inject(BadgesStore)

  loading = toSignal(this.badgesStore.useStore((state) => state.loading))
  badges = toSignal(this.badgesStore.useStore((state) => Object.values(state.badges)))
  lastUpdated = toSignal(this.badgesStore.useStore((state) => state.lastUpdated))

  private async fetchAllBadges(): Promise<BadgeSchema[]> {
    this.badgesStore.setState({ loading: true })

    const response = await getAllBadgesBadgesGet({
      query: { size: 100 },
    })

    const badges = unwrapApiResponse<BadgeSchema[]>(response, [])

    const badgesByCode = badges.reduce<Record<string, BadgeSchema>>((acc, badge) => {
      acc[badge.code] = badge
      return acc
    }, {})

    this.badgesStore.setState({
      badges: badgesByCode,
      loading: false,
      lastUpdated: new Date(),
    })

    return badges
  }

  getBadge(code: string): BadgeSchema | null {
    return this.badgesStore.getState().badges[code] ?? null
  }

  async refreshBadges(): Promise<void> {
    await this.fetchAllBadges()
  }

  initialize() {
    this.badgesStore.initStore()
    const state = this.badgesStore.getState()

    if (!state.lastUpdated || state.lastUpdated <= subDays(new Date(), 7)) {
      void this.fetchAllBadges().then((badges) => {
        this.badgesStore.setState({
          badges: badges.reduce<Record<string, BadgeSchema>>((acc, val) => {
            return { ...acc, [val.code]: val }
          }, {}),
          loading: false,
          lastUpdated: new Date(),
        })
      })
    } else {
      this.badgesStore.setState({ loading: false })
    }
  }
}
