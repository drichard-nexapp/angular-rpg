import { Component, computed, inject, signal } from '@angular/core'
import type { BadgeSchema } from '../../../sdk/api'
import { BadgesService } from '../../stores/badgesStore/badges.service'
import { CommonModule } from '@angular/common'

@Component({
  selector: 'app-badges',
  imports: [CommonModule],
  templateUrl: './badges.html',
  styleUrl: './badges.scss',
})
export class Badges {
  private badgesService = inject(BadgesService)

  searchTerm = signal<string>('')
  seasonFilter = signal<number | undefined>(undefined)

  loading = this.badgesService.loading

  constructor() {
    this.badgesService.initialize()
  }

  filteredBadges = computed((): BadgeSchema[] => {
    let badges = this.badgesService.badges() ?? []

    const search = this.searchTerm().toLowerCase()
    if (search) {
      badges = badges.filter(
        (badge) =>
          badge.code.toLowerCase().includes(search) || badge.description.toLowerCase().includes(search),
      )
    }

    const season = this.seasonFilter()
    if (season !== undefined) {
      badges = badges.filter((badge) => badge.season === season)
    }

    return badges.sort((a, b) => a.code.localeCompare(b.code))
  })

  badgesLength = computed((): number => {
    return this.badgesService.badges()?.length ?? 0
  })

  seasons = computed((): number[] => {
    const badges = this.badgesService.badges() ?? []
    const seasons = new Set<number>()
    badges.forEach((badge) => {
      if (badge.season !== undefined) {
        seasons.add(badge.season)
      }
    })
    return Array.from(seasons).sort((a, b) => b - a)
  })

  setSearchTerm(term: string): void {
    this.searchTerm.set(term)
  }

  setSeasonFilter(season: string): void {
    this.seasonFilter.set(season === '' ? undefined : Number(season))
  }

  clearFilters(): void {
    this.searchTerm.set('')
    this.seasonFilter.set(undefined)
  }
}
