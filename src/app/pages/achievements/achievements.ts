import { Component, computed, signal } from '@angular/core'
import { DatePipe, DecimalPipe } from '@angular/common'
import { injectQuery } from '@tanstack/angular-query-experimental'
import {
  getAccountDetailsMyDetailsGet,
  getAccountAchievementsAccountsAccountAchievementsGet,
  type MyAccountDetails,
  type AccountAchievementSchema,
} from '../../../sdk/api'
import { unwrapApiItem, unwrapApiResponse } from '../../shared/utils'
import { QUERY_KEYS } from '../../shared/constants'

@Component({
  selector: 'app-achievements',
  imports: [DatePipe, DecimalPipe],
  templateUrl: './achievements.html',
  styleUrl: './achievements.scss',
})
export class Achievements {
  filterCompleted = signal<boolean | undefined>(undefined)

  accountQuery = injectQuery(() => ({
    queryKey: QUERY_KEYS.account.details(),
    queryFn: async (): Promise<MyAccountDetails> => {
      const response = await getAccountDetailsMyDetailsGet()
      const data = unwrapApiItem<MyAccountDetails>(response, null)
      if (data) return data
      throw new Error('Failed to load account details')
    },
  }))

  achievementsQuery = injectQuery(() => ({
    queryKey: QUERY_KEYS.account.achievements(this.accountQuery.data()?.username || '', this.filterCompleted()),
    queryFn: async (): Promise<AccountAchievementSchema[]> => {
      const username = this.accountQuery.data()?.username
      if (!username) throw new Error('Account not loaded')

      const response = await getAccountAchievementsAccountsAccountAchievementsGet({
        path: { account: username },
        query: {
          completed: this.filterCompleted(),
        },
      })

      return unwrapApiResponse<AccountAchievementSchema[]>(response, [])
    },
    enabled: !!this.accountQuery.data()?.username,
  }))

  achievements = computed((): AccountAchievementSchema[] => this.achievementsQuery.data() ?? [])
  achievementPoints = computed((): number => this.accountQuery.data()?.achievements_points ?? 0)
  loading = computed((): boolean => this.accountQuery.isPending() || this.achievementsQuery.isPending())
  error = computed((): string | null => {
    const accountError = this.accountQuery.error()
    const achievementsError = this.achievementsQuery.error()
    if (accountError) return (accountError).message
    if (achievementsError) return (achievementsError).message
    return null
  })

  setFilter(completed: boolean | undefined): void {
    this.filterCompleted.set(completed)
  }

  getCompletedCount(): number {
    return this.achievements().filter((a) => a.completed_at).length
  }

  getTotalCount(): number {
    return this.achievements().length
  }

  getProgressPercentage(achievement: AccountAchievementSchema): number {
    if (!achievement.total || achievement.total === 0) return 0
    return Math.min((achievement.current / achievement.total) * 100, 100)
  }
}
