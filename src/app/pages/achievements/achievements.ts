import { Component, computed, signal } from '@angular/core'
import { DatePipe, DecimalPipe } from '@angular/common'
import {
  injectQuery,
  injectQueryClient,
} from '@tanstack/angular-query-experimental'
import {
  getAccountDetailsMyDetailsGet,
  getAccountAchievementsAccountsAccountAchievementsGet,
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
    queryFn: async () => {
      const response = await getAccountDetailsMyDetailsGet()
      if (response && 'data' in response) {
        return (response.data as any)?.data
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
    queryFn: async () => {
      const username = this.accountQuery.data()?.username
      if (!username) throw new Error('Account not loaded')

      const response =
        await getAccountAchievementsAccountsAccountAchievementsGet({
          path: { account: username },
          query: {
            completed: this.filterCompleted(),
          },
        })

      if (response && 'data' in response) {
        return (response.data as any)?.data || []
      }
      throw new Error('Failed to load achievements')
    },
    enabled: !!this.accountQuery.data()?.username,
  }))

  achievements = computed(() => this.achievementsQuery.data() ?? [])
  accountName = computed(() => this.accountQuery.data()?.username ?? '')
  achievementPoints = computed(
    () => this.accountQuery.data()?.achievements_points ?? 0,
  )
  loading = computed(
    () => this.accountQuery.isPending() || this.achievementsQuery.isPending(),
  )
  error = computed(() => {
    const accountError = this.accountQuery.error()
    const achievementsError = this.achievementsQuery.error()
    if (accountError) return (accountError as Error).message
    if (achievementsError) return (achievementsError as Error).message
    return null
  })

  setFilter(completed: boolean | undefined) {
    this.filterCompleted.set(completed)
  }

  getCompletedCount(): number {
    return this.achievements().filter((a: any) => a.completed_at).length
  }

  getTotalCount(): number {
    return this.achievements().length
  }

  getProgressPercentage(achievement: any): number {
    if (!achievement.target || achievement.target === 0) return 0
    return Math.min((achievement.current / achievement.target) * 100, 100)
  }
}
