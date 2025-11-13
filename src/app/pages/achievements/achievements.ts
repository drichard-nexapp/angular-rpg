import { Component, computed, signal } from '@angular/core'
import { DatePipe, DecimalPipe } from '@angular/common'
import {
  injectQuery,
  injectQueryClient,
} from '@tanstack/angular-query-experimental'
import {
  getAccountDetailsMyDetailsGet,
  getAccountAchievementsAccountsAccountAchievementsGet,
  type MyAccountDetails,
  type AccountAchievementSchema,
} from '../../../sdk/api'

@Component({
  selector: 'app-achievements',
  imports: [DatePipe, DecimalPipe],
  templateUrl: './achievements.html',
  styleUrl: './achievements.scss',
})
export class Achievements {
  filterCompleted = signal<boolean | undefined>(undefined)
  queryClient = injectQueryClient()

  accountQuery = injectQuery(() => ({
    queryKey: ['account-details'],
    queryFn: async (): Promise<MyAccountDetails> => {
      const response = await getAccountDetailsMyDetailsGet()
      if (response && 'data' in response && response.data) {
        const data = (response.data as { data?: MyAccountDetails })?.data
        if (data) return data
      }
      throw new Error('Failed to load account details')
    },
  }))

  achievementsQuery = injectQuery(() => ({
    queryKey: [
      'achievements',
      this.accountQuery.data()?.username,
      this.filterCompleted(),
    ],
    queryFn: async (): Promise<AccountAchievementSchema[]> => {
      const username = this.accountQuery.data()?.username
      if (!username) throw new Error('Account not loaded')

      const response =
        await getAccountAchievementsAccountsAccountAchievementsGet({
          path: { account: username },
          query: {
            completed: this.filterCompleted(),
          },
        })

      if (response && 'data' in response && response.data) {
        return (response.data as { data?: AccountAchievementSchema[] })?.data || []
      }
      throw new Error('Failed to load achievements')
    },
    enabled: !!this.accountQuery.data()?.username,
  }))

  achievements = computed((): AccountAchievementSchema[] => this.achievementsQuery.data() ?? [])
  accountName = computed((): string => this.accountQuery.data()?.username ?? '')
  achievementPoints = computed(
    (): number => this.accountQuery.data()?.achievements_points ?? 0,
  )
  loading = computed(
    (): boolean => this.accountQuery.isPending() || this.achievementsQuery.isPending(),
  )
  error = computed((): string | null => {
    const accountError = this.accountQuery.error()
    const achievementsError = this.achievementsQuery.error()
    if (accountError) return (accountError as Error).message
    if (achievementsError) return (achievementsError as Error).message
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
